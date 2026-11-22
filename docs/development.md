# Developer guide

swarm-web-ui is planned (swarm-routing/.github#672): no code is here yet, only the
org's templates and settings. This guide says what runs today; each section
grows with the code. What it will hold: the web frontend and its daemon.

## Prerequisites

GNU Make, git, Python 3.11 or newer (the org tooling `make check` fetches),
and Docker for `make shell`. Nothing else until code lands.

## Get the code

```bash
git clone https://github.com/swarm-routing/swarm-web-ui.git
cd swarm-web-ui
```

No submodules or sibling checkouts are needed.

## Dependencies

None yet. `make check` fetches swarm-routing/.github's tooling into
`~/.cache/swarm-routing/dotgithub` (the licence-header gate and org-sync).

## Build

Nothing to build yet: `make build` and `make test` have nothing to do yet.

## Test

`make check` is the gate today: lint, test, licence headers and the
org-sync check, as CI runs them.

```bash
make check
```

## Run

Nothing runs yet.

## Docker and dev containers

`make shell` opens a shell in the `ghcr.io/swarm-routing/ns3-dev` image
with this repository at `/src`. There is no `.devcontainer/`.

## Lint and format

`make lint` (clang-format on any C++ files) and `make format`. Licence
headers: `make headers`, the org's `check-headers` gate.

## CI map

| Workflow | What it checks | Required |
| --- | --- | --- |
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
