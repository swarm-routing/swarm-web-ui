# Roadmap

swarm-web-ui's release ladder. The org's whole plan, and why this track
waits, is the [org ROADMAP](https://github.com/swarm-routing/.github/blob/main/ROADMAP.md).

**Status: deferred (decision 23, swarm-routing/.github#672).** Nothing
deferred starts by itself: no code lands and no `release:*` label goes on
#1's or #2's children until the maintainer re-plans the track. The stack is
decided ([ADR-0002](adr/0002-web-first-client-with-a-go-daemon.md)); the
order of the work is epic #1's checklist.

## Release ladder

| Version | Scope | Exit criteria | Status |
|---------|-------|---------------|--------|
| v0.1.0 | Offline replay (epic #1): the scaffold (#8), generated types (#7), bundle loader (#9), playback canvas (#10), KPI charts (#11), side-by-side runs (#12) | replay determinism (#13) and the browser smoke with axe (#14) green on every PR; the demo served under the Colony Arena site at a pinned commit (#15) | *proposed*, deferred |
| v0.2.0 | Live runs (epic #2): the Go daemon (#16), scenario editor (#17), container runner (#18), streaming (#19), remote use (#20) | a scenario authored in the UI runs in a sim-containers image by digest and gives the same output for the same seed | *proposed*, deferred |

The org ROADMAP's release table holds the first release as *proposed*,
after the replay epic. A version's scope becomes binding only when the
maintainer re-plans the track and its issues get the `release:vX.Y.Z` label.
