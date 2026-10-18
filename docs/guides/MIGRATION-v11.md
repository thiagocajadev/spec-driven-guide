# Migrating to v11: one root file

v11 stops writing `CLAUDE.md`. `AGENTS.md` is the only file the CLI puts at the repo root, and Claude Code reads it natively, the way Codex, Cursor, Copilot and most other agents already did.

## What changes

| Before                                          | Now                                                                   |
| :---------------------------------------------- | :-------------------------------------------------------------------- |
| `init` wrote a `CLAUDE.md` holding `@AGENTS.md` | No `CLAUDE.md` is written. The one an earlier release left is removed |
| A `CLAUDE.md` you wrote was preserved silently  | It is preserved, and `init` warns when it does not import `AGENTS.md` |
| `audit` exited 0 whatever it found              | It exits non-zero on any gap, so scripts and CI can rely on it        |
| A missing `.ai/kit/` reported as in sync        | It fails, naming `npx spec-driven-guide restore`                      |

## Why the pointer had to go

Claude Code reads `AGENTS.md` only while no `CLAUDE.md` exists in the working directory or above it. Once it reads `AGENTS.md` directly, the pointer stops helping and starts deciding: any `CLAUDE.md` takes precedence, so the one file SDG wrote to reach Claude Code became the file standing between them.

## Steps

1. Run `npx spec-driven-guide@latest init`. The pointer is removed and reported.
2. If you keep a `CLAUDE.md` of your own, make `@AGENTS.md` its first line. `init` names this case.
3. Commit `.gitignore` and `.ai/.sdg-manifest.json`, which the install rewrites.

## If your Claude Code cannot read `AGENTS.md`

Older Claude Code releases, and sessions where the built-in `AGENTS.md` support is turned off, read `CLAUDE.md` only. Run `claude --version` and update, or keep a one-line `CLAUDE.md` holding `@AGENTS.md`: Claude Code never loads the same `AGENTS.md` twice, so the import is harmless where native support exists. The [Claude Code memory docs](https://code.claude.com/docs/en/memory) list the version that added native support and the cases where it is unavailable.
