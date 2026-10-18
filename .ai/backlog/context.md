# spec-driven-guide: CLI that installs AI governance into any project

stack: Node.js (current LTS, minimum in `engines.node`), ESM, Inquirer, dedent
pattern: Revealing Module, installed kit in `.ai/kit/`
entry: src/engine/bin/index.mjs

## Commands

> Phase TEST runs these by name. Without them the agent rediscovers the build on every cycle.

test: `npm test`
lint: `npm run lint` (`npm run lint:fix` to auto-fix)
build: `npm run build`
gate: `npm run gate` (npm audit + lint + test + self-audit, the full CI gate)
release: `manual`. Single maintainer, the bump runs locally and the release commit carries the version. See `versioning.md`, `VersionControl`.
bump: `npm run bump <type>`

## Decisions

- Extracted from private monorepo (sdg-agents)
- **Rename**: package, binary and repository are `spec-driven-guide`.
  `sdg-agents` is deprecated on npm and stays installable. `SDG` remains the
  internal acronym: `sdg-*` commands, `sdg-rules.json`, `AGENTS.sdg.md` sidecar,
  phase banner. GitHub topics, description and homepage are applied on the
  repository settings, not in a tracked file.
- **SSOT**: `src/assets/skills/*` (skill units) + `src/assets/instructions/{commands,templates,flavors,competencies}` (non-skill rulesets). `.ai/kit/` is their installed copy, out of git and rebuilt by `init`; never edit it. `.ai/backlog/` is this project's own memory and is versioned.
- **Router identity**: project is a router, not a knowledge dump. `AGENTS.md` = minimal registry; skills load on demand per cycle phase (`code-style.md` always in Phase CODE; others by domain).
- **One root file**: `AGENTS.md` only. Claude Code and the other harnesses read it natively, and Claude Code skips it whenever a `CLAUDE.md` exists, so the CLI never writes one and removes the pointer earlier releases left.
- AGENTS.md content assembled in instruction-assembler.mjs
- workflow.md template = Working Protocol (SPEC/PLAN/CODE/TEST/END)
- Named exports only, never export default
- No abbreviations: req→request, res→response, ctx→context
- **Knowledge Triad**: `.ai/backlog/learned.md` (patterns) and `.ai/backlog/troubleshoot.md` (logs) for expertise persistence
- **Maintainer Mode Sync**: drift detection between `.ai/kit/` and `src/assets/` for the CLI project itself, both ways, failing when the kit is absent.
- **Honest checks**: a check with nothing to inspect reports skipped, never passed, and the audit exits non-zero on any gap. A vacuous pass is the defect this project exists to prevent.
- **One-Line Entry Point Mandate**: entry points (`run`/`start`/`init`) are **headline callers**: body is either (a) single-statement side-effect form `await call();` OR (b) canonical 2-statement form `const X = call(); return X;`. Forbidden: ternary on return line, any logic. Enforced by `validateSlaCompliance` shape detector (no length-only check) and aliased through `Pure entry point` checklist label.

## Partner

Thiago is the Dev founder. Say "Hello Thiago". Communication in chat Portuguese Brazilian. On project only English.
