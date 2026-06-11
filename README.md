# hoocanvas

Live mission control for a [hooteams](https://github.com/kolisachint/hooteams) agent team. Pure frontend — consumes the hooteams SSE stream and renders one terminal pane per agent: streaming tokens with a blinking cyan cursor, collapsible thinking traces, tool lifecycle chips, and a `nudge >` input that steers any agent mid-run.

**Stack:** Vite · React 19 · TypeScript · Zustand · Tailwind CSS v4 · JetBrains Mono

No npm dependency on hooteams or hoocode — the only contract is the SSE wire format (`TeamEvent = AgentEvent & { role, agentId, ts }`), re-declared in `src/lib/types.ts`.

## Run

```bash
bun install
bun run dev                # connects to http://localhost:4242 by default
VITE_HOOTEAMS_HOST=http://localhost:4243 bun run dev   # custom bridge host
```

Pair it with a real team (`hooteams start`) or the synthetic demo stream from the hooteams repo:

```bash
# in hooteams/
bun run scripts/demo.ts --port 4243
```

## Structure

```
src/
  lib/
    types.ts      SSE wire types (the only shared contract)
    store.ts      Zustand store — one dispatch() reducer for every event
    stream.ts     EventSource wrapper, exponential-backoff reconnect, steer()
  components/
    TeamBoard.tsx   auto-fit grid of agent panes + empty state
    AgentCard.tsx   header (presence dot, status badge) + transcript + live turn
    TokenStream.tsx live text, auto-scroll, cyan `_` cursor
    ThinkingBlock.tsx collapsed-by-default reasoning trace
    ToolChip.tsx    running spinner → ✓/✗, click to expand args/result
    SteerInput.tsx  POST /steer on Enter, "sent ✓" flash
```

Brand per [hoo-brand](https://github.com/kolisachint/hoo-brand): zinc dark scale on `#09090B`, `#00F0FF` cyan accent, node-grid backdrop, JetBrains Mono everywhere.
