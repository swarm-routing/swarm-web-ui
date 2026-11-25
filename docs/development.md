# Developer guide

swarm-web-ui holds the skeleton of its web frontend (`frontend/`, #8:
React, TypeScript and Vite, ADR-0002); the Go daemon (#16) is not here yet.
This guide says what runs today; each section grows with the code.

## Prerequisites

GNU Make, git, Python 3.11 or newer (the org tooling `make check` fetches),
Node.js `^22.22.2 || ^24.15.0 || >=26.0.0` with npm (build-time only; the
range the locked packages accept, `engines` in `frontend/package.json`; CI
uses `frontend/.nvmrc`), and Docker
for `make shell`. The browser smoke needs a Chromium: `npx playwright-core
install chromium` in `frontend/`, or `CHROMIUM=/path/to/chrome`.

## Get the code

```bash
git clone https://github.com/swarm-routing/swarm-web-ui.git
cd swarm-web-ui
```

No submodules or sibling checkouts are needed.

## Dependencies

The frontend's npm packages, every version pinned exactly in
`frontend/package.json` and locked in `frontend/package-lock.json`; the make
targets install them with `npm ci` (`make clean` forces a fresh install).
Add one with `cd frontend && npm install --save-exact <package>`
(`frontend/.npmrc` sets `save-exact` too). `make check` also fetches swarm-routing/.github's
tooling into `~/.cache/swarm-routing/dotgithub` (the licence-header gate and
org-sync).

## Build

`make build` runs `vite build` into `frontend/dist`: static files with
relative asset paths, the one artifact (ADR-0002 item 5).

## Test

`make test` runs `tsc --noEmit` and the Vitest unit tests; `make smoke`
builds, then opens the build in headless Chromium and fails on a console
error or a serious or critical axe-core violation (`frontend/test/smoke.mjs`,
as the Colony Arena site's smoke). `make check` is the local gate: lint,
test, licence headers and the org-sync check.

```bash
make check
make smoke    # CHROMIUM=/path/to/chrome to use a local browser
```

## Run

`cd frontend && npm run dev` serves the client with hot reload; it proxies
`/api` and `/ws` to `SWARM_WEB_UI_DAEMON` (default `http://127.0.0.1:8080`).
With no daemon the page offers only the replay views.

## Docker and dev containers

`make shell` opens a shell in the `ghcr.io/swarm-routing/ns3-dev` image
with this repository at `/src`. There is no `.devcontainer/`.

## Lint and format

`make lint`: actionlint, ESLint, Prettier (`--check`) and
`tools/check-web-headers.py`; `make format` applies Prettier. Licence
headers: `make headers`, the org's `check-headers` gate, which reads
`.go`/`.py`/`.sh` and C++ only, so `tools/check-web-headers.py` checks the
`.ts`/`.tsx`/`.js`/`.mjs` files.

## CI map

| Workflow | What it checks | Required |
| --- | --- | --- |
| `frontend.yml` | lint, typecheck, unit tests, build, browser smoke + axe | yes (`frontend`) |
| `org-sync.yml` | the org-managed files match the pinned templates | yes (`check / org-sync`) |
| `licence.yml` | SPDX headers and the licence texts | yes (`headers / licence`) |
| `pr-title.yml` | the PR title is a lowercase Conventional Commit | yes (`title / title`) |
| `review-gate.yml` | CodeRabbit has reviewed the PR | yes (`review / coderabbit`) |
| `dco.yml` | an outside contributor signed off | no |
| `scorecard.yml`, `bestpractices-evidence.yml` | OpenSSF Scorecard; best-practices evidence | no |
| `settings-apply.yml`, `epics-changed.yml` | nudge the org's repo-settings and epic lists | no |

The required checks are the ones the `main` ruleset lists (`gh api
repos/swarm-routing/swarm-web-ui/rules/branches/main`), applied from
`.github/org-sync.toml` `[settings]`.

## Release

Nothing is released yet. A version is cut as
[CONTRIBUTING "Cutting a release"](https://github.com/swarm-routing/.github/blob/main/CONTRIBUTING.md#cutting-a-release)
says, once a `release.yml` and a ladder in `docs/roadmap.md` exist.

## Troubleshooting

- `make check` fails fetching the org tooling: it needs network access to
  github.com.
