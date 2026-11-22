# 0002. Build a web-first client with a Go daemon; Tauri or a PWA only as a wrapper; no Electron

- **Status:** accepted (the maintainer, 2026-11-22: "Accept the ADR")
- **Date:** 2026-11-22
- **Issue:** #6

Only the decision is accepted. The UI track stays deferred under decision 23
of swarm-routing/.github#672: none of #1's or #2's children is scheduled
until the maintainer re-plans the track.

## Context

The workbench (#1 offline replay, #2 live runs) needs a client technology,
a stack and a daemon language before any code lands. #2 said "FastAPI or
Go"; nothing recorded why the client is a browser application.

**What the simulators the org targets offer.** A survey the maintainer
shared on 2026-11-21 (an AI-assisted conversation, analysed on
swarm-routing/.github#674) found:

| Tool | Kind | CLI | Desktop GUI | Native web UI |
|------|------|-----|-------------|---------------|
| ns-3 | research simulator | primary (`./ns3`, C++ / Python) | viewers only: NetAnim (offline 2D, Qt), PyViz (live, GTK), NetSimulyzer (3D, Qt/OpenGL), GtkConfigStore | no (third-party only) |
| OMNeT++ | research simulator | Cmdenv | Eclipse IDE (NED editor), Qtenv (live) | no |
| Shadow | research simulator | only (YAML) | no | no |
| CORE | Linux emulator | core-daemon (Python, gRPC) | core-gui canvas, node terminals | no |
| Mininet | Linux emulator | primary | MiniEdit (basic) | no |
| Containerlab | container emulator | primary (YAML) | desktop app, VS Code extension | web app, embeddable viewer |
| GNS3 | network emulator | REST API | primary | yes, over the same server |
| EVE-NG, Cisco CML | network emulators | API | no | primary (browser consoles) |

Research simulators are headless, Linux-native and run in containers on
servers; the tools with the richest web UIs (GNS3, EVE-NG, CML,
Containerlab) all put a browser client in front of a server or daemon.

**Client technology.** The same survey compared three options:

| Factor | Web-first (browser + daemon) | Electron | Tauri (web UI + Rust shell) |
|--------|------------------------------|----------|-----------------------------|
| Linux and container fit | ideal: simulators run in Docker/Linux, the UI talks HTTP/WebSocket | awkward: still needs Docker/WSL2 on macOS/Windows | good: a thin native wrapper around the same web UI |
| Remote and HPC clusters | native: open the UI by URL or over an SSH tunnel | poor: local-first, remote needs extra plumbing | possible, pointed at a remote daemon |
| Resource overhead | low: the user's browser, nothing bundled | high: about 150-300 MB install, heavy RAM next to large simulations | very low: the OS web view, about 5-10 MB binary |
| Sharing and reproducibility | instant: links, static replay bundles | manual: build, sign and ship installers | manual: smaller installers, still per OS |

The size figures are the survey's estimates, not measured here.

**Constraints already decided.** Org ADR-0002: pipelines are written in Go.
Decision 5 and 17 (swarm-routing/.github#672): this repository is the
workbench, `MIT OR GPL-2.0-only` written fresh, deploys no Pages (its demo
is served under the Colony Arena site at a pinned commit); neither it nor the
site holds routing logic, and every number shown comes from benchmarks data
or `bench_parse` (site golden rules 10-12, sim-tools golden rule 13).
Decision 16: sim-tools owns the `scenario.v1`, probe and `summary.v1`
schemas (swarm-routing/sim-tools#279).

## Decision

1. **The client is a web application** (a single-page app) served by the
   daemon, or as static files for the offline replay. It runs in any current
   browser, locally, in WSL2 or against a remote server over an SSH tunnel.
2. **The daemon is written in Go**, following org ADR-0002, not FastAPI. It
   exposes REST and WebSocket APIs, binds to the loopback address by
   default, and runs `sim-tools run` in sim-containers images by digest. It
   imports no Python: it shares sim-tools' contracts through the same JSON
   Schema files, not through code.
3. **No Electron.** A desktop form, if wanted, wraps the same built client
   in **Tauri** or installs it as a **PWA**, adding no UI code of its own
   (#23).
4. **The stack:** React + TypeScript + Vite; React Flow for topology
   editing (Cytoscape.js the alternative); PixiJS for 2D playback (Deck.gl or
   Three.js only if a 3D view is planned); uPlot for dense time series and
   Apache ECharts for summary and confidence-interval charts; xterm.js for
   node consoles. A change of library is a new ADR or an amendment here.
5. **Types come from the schemas.** TypeScript types and the runtime
   validator are generated from sim-tools' vendored JSON Schema files,
   never written by hand (#7).
6. **An escape hatch is part of the design**: a raw-config tab on the
   scenario (#17) and "Export native project" through the simulator's
   `SimAdapter` in sim-tools (#21). The UI holds no simulator-specific
   translation.
7. **The UI draws and charts what it is given**: no routing logic, no
   statistic of its own, replay deterministic for a given bundle and time
   (#13), accessibility checked on every PR (#14).

## Consequences

- One code base serves the laptop, WSL2 and a headless cluster; sharing a
  replay is a URL or a bundle file, and the static replay can be served
  under the Colony Arena site.
- The daemon uses the org's Go toolchain and conventions (ADR-0002); it
  cannot call sim-tools' Python validators directly, so schema validation
  in Go must agree with sim-tools' `validate` (tested on sim-tools'
  fixtures).
- The daemon's socket access is root-equivalent on the host, so it listens
  on loopback only and remote use goes through SSH port-forwarding (#20,
  `SECURITY.md`).
- Electron, a bundled browser runtime and a desktop-only client are ruled
  out; a desktop wrapper is optional and never forks the UI.
- Nothing here schedules work: the children of #1 and #2 stay deferred
  under decision 23 until the maintainer re-plans the track.
