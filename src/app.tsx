import { useEffect } from "react";
import { TeamBoard } from "./components/TeamBoard";
import { useStore } from "./lib/store";
import { connect, disconnect, HOOTEAMS_HOST } from "./lib/stream";

function ConnectionBadge() {
	const connection = useStore((state) => state.connection);
	const color =
		connection === "live" ? "var(--cyan)" : connection === "reconnecting" ? "var(--amber)" : "var(--text-faint)";
	return (
		<span className="flex items-center gap-1.5 text-[11px]" style={{ color }}>
			<span
				className={`h-1.5 w-1.5 rounded-full ${connection === "live" ? "presence" : ""}`}
				style={{ background: color }}
			/>
			{connection}
			<span style={{ color: "var(--text-faint)" }}>· {HOOTEAMS_HOST.replace(/^https?:\/\//, "")}</span>
		</span>
	);
}

export function App() {
	useEffect(() => {
		connect();
		return disconnect;
	}, []);

	return (
		<div className="mx-auto max-w-[1600px] px-6 py-5">
			<header className="mb-6 flex items-baseline gap-2">
				<h1 className="text-[15px] font-semibold tracking-wide" style={{ color: "var(--text)" }}>
					hoo<span style={{ color: "var(--cyan)" }}>◆</span>canvas
				</h1>
				<span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
					team mission control
				</span>
				<div className="ml-auto">
					<ConnectionBadge />
				</div>
			</header>
			<TeamBoard />
		</div>
	);
}
