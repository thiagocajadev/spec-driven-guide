# {{PROJECT_NAME}}: [what this project does in one sentence]

stack: {{STACK}}
pattern: [architecture pattern]
entry: [main entry point file]

## Commands

> Phase TEST runs these by name. Without them the agent rediscovers the build on every cycle.

test: [command that runs the full suite]
lint: [command that lints and auto-fixes]
build: [command that produces the artifact, or `none`]
release: [`derived` if CI computes the version from the commits, `manual` if a maintainer runs the bump locally. See `versioning.md`, `VersionControl`.]

## Decisions

- [decision]: [rationale]

## Tooling (optional)

Pre-made scripts live in `.ai/tooling/`. Not wired by default.
Ask the agent: "set up husky hooks", "wire the bump script", "enable backlog prune on END".
See `.ai/tooling/README.md` for inventory.

## Partner

{{PARTNER}}
