import { useStore } from "./store";
import type { TeamEvent } from "./types";

export const HOOTEAMS_HOST: string = import.meta.env.VITE_HOOTEAMS_HOST ?? "http://localhost:4242";

let source: EventSource | undefined;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let attempt = 0;
let stopped = false;

const MAX_BACKOFF_MS = 30_000;

/**
 * Connect to the HooTeams SSE stream. Native EventSource retries on its own,
 * but gives up on some failures (e.g. server down at page load), so we manage
 * reconnection ourselves with exponential backoff capped at 30s.
 */
export function connect(host: string = HOOTEAMS_HOST): void {
	stopped = false;
	open(host);
}

function open(host: string): void {
	source?.close();
	source = new EventSource(`${host}/events`);

	source.onopen = () => {
		attempt = 0;
		useStore.getState().setConnection("live");
	};

	source.onmessage = (event) => {
		try {
			useStore.getState().dispatch(JSON.parse(event.data) as TeamEvent);
		} catch {
			// Malformed frame — skip rather than tear down the stream.
		}
	};

	source.onerror = () => {
		if (stopped) return;
		useStore.getState().setConnection("reconnecting");
		source?.close();
		const backoff = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
		attempt += 1;
		clearTimeout(reconnectTimer);
		reconnectTimer = setTimeout(() => open(host), backoff);
	};
}

export function disconnect(): void {
	stopped = true;
	clearTimeout(reconnectTimer);
	source?.close();
	source = undefined;
}

/** The only write operation in hoocanvas: nudge an agent mid-run. */
export async function steer(role: string, message: string, host: string = HOOTEAMS_HOST): Promise<void> {
	const response = await fetch(`${host}/steer`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ role, message }),
	});
	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as { error?: string };
		throw new Error(body.error ?? `steer failed: HTTP ${response.status}`);
	}
}
