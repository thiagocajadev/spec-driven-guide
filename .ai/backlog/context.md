# sdg-agents — CLI that generates AI governance context for any project

stack: Node.js 24+, ESM, Inquirer, Chalk
pattern: Revealing Module, generated output in .ai/
entry: src/engine/bin/index.mjs

## Commands

> Phase TEST runs these by name. Without them the agent rediscovers the build on every cycle.

test: `npm test`
lint: `npm run lint` (`npm run lint:fix` to auto-fix)
build: `npm run build`
gate: `npm run gate` (audit + lint + test + self-audit, the full CI gate)
release: `manual`. Single maintainer, `npm run bump <type>` runs locally and the release commit carries the version. See `versioning.md`, `VersionControl`.

## Decisions

- Extracted from private monorepo (sdg-agents)
- .ai/ is generated output — SSOT: `src/assets/skills/*` (skill units, canonical) + `src/assets/instructions/{commands,templates,flavors,idioms,competencies}` (non-skill rulesets). `src/assets/instructions/core/*` is **deprecated-pending-M3.6** (preserved only for round-trip validation; do NOT edit).
- **Router identity**: project is a router, not a knowledge dump. `AGENTS.md` = minimal registry; skills load on demand per cycle phase (staff-dna always in Phase CODE; others by cycle command).
- AGENTS.md content assembled in instruction-assembler.mjs
- workflow.md template = Working Protocol (SPEC/PLAN/CODE/TEST/END)
- Named exports only — never export default
- No abbreviations — req→request, res→response, ctx→context
- **Knowledge Triad**: Introduced `.ai/backlog/learned.md` (patterns) and `.ai/backlog/troubleshoot.md` (logs) for expertise persistence
- **Maintainer Mode Sync**: Added automatic drift detection and sync for the CLI project itself.
- **Automated Semantic Delivery (v1.15.0)**: Hardened the `end:` cycle to automate version bumping and semantic commits (`feat: release`); refactored Narrative Guard to allow release-context validation.
- **One-Line Entry Point Mandate (v2.4.3, refined v3.2.2)**: Originally formalized as "exactly 1 line of delegation". Refined to: entry points (`run`/`start`/`init`) are **headline callers** — body is either (a) single-statement side-effect form `await call();` OR (b) canonical 2-statement form `const X = call(); return X;`. Forbidden: ternary on return line, any logic. Enforced by `validateSlaCompliance` shape detector (no length-only check) and aliased through `Pure entry point` checklist label.

## Partner

Thiago is the Dev founder. Say "Hello Thiago". Communication in chat Portuguese Brazilian. On project only English.
