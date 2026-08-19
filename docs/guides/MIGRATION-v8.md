# Migrating to v8: the package is now `spec-driven-guide`

v8.0.0 changes the published name and nothing else. The protocol, the phases, the
skills, the generated `.ai/` tree and every command behave exactly as they did in
v7.0.1. If an upgrade breaks something beyond the name, it is a bug, not a
migration step.

> Migrating from v2 through v6? Read [MIGRATION-v3.md](MIGRATION-v3.md) first, then
> return here. That guide covers the structural changes; this one covers the name.

## TL;DR

```bash
npm uninstall -g sdg-agents          # if it was installed globally
npm install -g spec-driven-guide     # or just use npx, below
npx spec-driven-guide init           # rewrites AGENTS.md and CLAUDE.md
```

Nothing in `.ai/` needs deleting. `init` regenerates in place.

## What changed

| Before                                    | After                                        |
| :---------------------------------------- | :------------------------------------------- |
| npm package `sdg-agents`                  | npm package `spec-driven-guide`              |
| binary `sdg-agents`                       | binary `spec-driven-guide`                   |
| repository `thiagocajadev/sdg-agents-cli` | repository `thiagocajadev/spec-driven-guide` |

`sdg-agents` stays installable and is deprecated, so nothing breaks the moment this
ships. Installing it prints a notice pointing here. It will not receive further
releases.

## Why the name moved

`SDG` reads as the UN Sustainable Development Goals to every search engine, and the
field this project works in is spelled out as _spec-driven_. The old name carried
neither the brand nor a term anyone searches. `spec-driven-guide` matches the site
at [specdrivenguide.org](https://specdrivenguide.org), and its hyphens are what let a
search for `spec driven` find it at all: search engines split on hyphens, never
inside a mashed compound.

`SDG` survives where it always made sense, as the internal acronym. The cycle
commands are still `sdg-feat.md`, `sdg-fix.md` and their siblings, the phase banner
still opens with `SDG ·`, and the rules file is still `sdg-rules.json`. Those names
are read by agents inside your repository, never by an index.

## Three things to check by hand

**1. Scripts that call the old binary.** Search your `package.json` for
`sdg-agents` and replace it:

```diff
-"governance": "sdg-agents audit"
+"governance": "spec-driven-guide audit"
```

**2. The husky pre-commit hook**, if you wired the optional gate. It calls
`npx --no-install sdg-agents gate`, which still resolves to the deprecated package.
Re-copy it from `.ai/tooling/husky/pre-commit` after running `init`, or edit the two
lines in place.

**3. `CLAUDE.md`.** Every project installed before v8 carries the line
`Regenerate with npx sdg-agents init`. It is stale, not broken, and `init` corrects
it. If you pinned the old version deliberately, leave it.

## Pinning, if you are not ready

```bash
npx sdg-agents@7 init
```

v7.0.1 is the final release under the old name and stays on the registry. There is
no deadline attached to this migration.
