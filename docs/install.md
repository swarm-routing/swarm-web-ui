# Install

**Nothing to install yet.** swarm-web-ui is deferred (decision 23,
swarm-routing/.github#672): it has no code and no release. See
[roadmap.md](roadmap.md) for the planned versions.

What installing will look like, per
[ADR-0002](adr/0002-web-first-client-with-a-go-daemon.md):

- **Offline replay** (v0.1.0, *proposed*): no install. The built frontend is
  static files, served under the Colony Arena site at a pinned commit; open it
  in a browser and load an artifact bundle (`probes.v1.jsonl`,
  `summary.v1.json`).
- **Live runs** (v0.2.0, *proposed*): one Go daemon that serves the same
  frontend and runs `sim-tools run` in sim-containers images by digest,
  through its native Docker/Podman client. Node.js and npm are build-time
  tooling only, never needed to run it.

To work on the repository, see [development.md](development.md).
