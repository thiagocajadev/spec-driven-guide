# Roadmap

This document traces the evolution of **spec-driven-guide** from its foundation to a closed core, one major release at a time.

## Milestones

| Target    | Focus                                                                                                                                                                                                                                                                                                                                             | Status     |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------- |
| **v1.0**  | **Foundation**: CLI, 5-phase protocol, multi-stack, initial idioms.                                                                                                                                                                                                                                                                               | ✅ Shipped |
| **v1.x**  | **Resilience & Hardening**: SSOT, Token Discipline, Universal Cycle Coverage.                                                                                                                                                                                                                                                                     | ✅ Shipped |
| **v2.0**  | **Governance Observability**: Formal auditing via `audit:` and Circuit Breaker logic.                                                                                                                                                                                                                                                             | ✅ Shipped |
| **v3.0**  | **Reformulation & Multi-Agent**: Semantic router, skills on-demand, multi-agent, multi-idiom, token compaction (~25K tokens saved).                                                                                                                                                                                                               | ✅ Shipped |
| **v4.0**  | **Narrative Heuristics Maturity**: Vertical Density detector (double-blank + Explaining Return Tight + Orphan-of-1), logic-in-return classifier, 12-token banned abbreviations, multi-language section banners, three-form Pedagogical Tone + Default Content Structure.                                                                          | ✅ Shipped |
| **v4.1**  | **Governance Slim-Down**: `staff-dna.md` removed, `code-style.md` rewritten lean, `PreCodeChecklist` + `PreFinishGate` consolidated (8 + 8 items), audit Law 1/Law 8 validators retired.                                                                                                                                                          | ✅ Shipped |
| **v5.0**  | **Dynamic Stack Context**: Static idiom catalog (15 dirs, ~50KB) removed. Stack is now developer-declared during `land:` in `.ai/backlog/stack.md`, optionally enriched via an allow-listed doc-fetch. `competencies/{backend,frontend}.md` fused into single `delivery.md`. Major bump due to removed CLI surface (`--idiom`, `update`, `sync`). | ✅ Shipped |
| **v5.x**  | **Lint Enforcement**: Governance heuristics that could be mechanized moved into four local ESLint rules shipped with the CLI. Gate pre-filter, `checklist-soul.md`, the `ok`-discriminated response envelope.                                                                                                                                     | ✅ Shipped |
| **v6.0**  | **Harness Alignment**: `AGENTS.md` at the repo root where harnesses already look. Backlog reclassified by volatility, so team knowledge is versioned instead of discarded. Biome repositioned as a baseline. Fifth local ESLint rule.                                                                                                             | ✅ Shipped |
| **v7.0**  | **Wiring and Release Modes**: the parts connected end to end, and two release modes, `derived` (CI computes the version) and `manual` (a local bump).                                                                                                                                                                                             | ✅ Shipped |
| **v8.0**  | **Rename**: the package, binary and repository became `spec-driven-guide`. `SDG` stays as the internal acronym.                                                                                                                                                                                                                                   | ✅ Shipped |
| **v9.0**  | **Convergent Install**: an update deletes what the previous release emitted, the `.gitignore` became a managed block, and the router gained a Persistence Policy and named guardrails.                                                                                                                                                            | ✅ Shipped |
| **v10.0** | **Ownership Split**: `.ai/kit/` holds what the CLI installs and leaves version control; `.ai/backlog/` holds what the project writes. The kit is cleared whole on every install and restored from the committed manifest. `tasks.md` splits into a versioned queue and a local session pointer.                                                   | ✅ Shipped |
| **v11.0** | **One Root File**: `AGENTS.md` is the only root file, `audit` and the kit check fail on any gap, and Phase TEST ends on a Review Gate.                                                                                                                                                                                                            | ✅ Shipped |
| **v11.1** | **Subtraction and Enforcement**: less recited text, `git-guard` on the commit gate, canon agreement tests, waves, the fresh-context review and the YAGNI ladder.                                                                                                                                                                                  | ✅ Shipped |

> **Core is closed.** The CLI, the 5-phase protocol, the narrative heuristics, the gate and audit suite, and the `land:`-driven stack context together are the finished product.

---

## Detailed Vision

### v1.x: Resilience & Hardening

Transformed the CLI into an industrial-grade tool. Implemented the **Single Source of Truth (SSOT)** architecture centralized in `AGENTS.md`, introduced **Token Discipline 2.0** (Caveman/Soul duality), and expanded to universal cycles (`land:`, `docs:`, `fix:`), ensuring no development activity escapes governance.

### v2.0: Governance Observability

A major leap in technical maturity. Introduced the `audit:` command to detect "governance drift" and the **Circuit Breaker** safety mechanism to prevent infinite refactoring loops. The CLI actively analyzes project alignment against rulesets, making governance visible and enforceable.

### v3.0: Reformulation & Multi-Agent

Complete architectural reformulation. `AGENTS.md` became a **semantic router** (~2.8KB) instead of a knowledge dump: skills load on-demand per cycle phase, not at session start. Multi-agent support (Claude Code, Cursor, Windsurf, Copilot, Codex, Gemini, Roo Code) with agent stubs under `.ai/<agent>/`. Multi-idiom install (`--idiom typescript,python,go`). Engineering Laws renumbered 1–8. Token compaction across 39 files saved ~25K tokens (~118KB, 50% reduction).

### v4.0: Narrative Heuristics Maturity

Six narrative detectors upgraded from skeleton to production-grade enforcement. `Vertical Density` promoted from no-op to a triple sub-detector (double blank lines, Explaining Return Tight, Orphan-of-1 atomic). `No Logic in Return` classifies offenders into specific hints (Ternary / Template literal / Arithmetic / Constructor / String interpolation). `No framework abbreviations` covers the complete twelve-token banned set (`req, res, ctx, idx, tmp, arr, val, cb, mgr, ctrl, svc, prev`) with word-boundary regex plus adjacency lookahead. `No section banners` now spans JavaScript, Python/shell, and SQL comment styles. Writing Soul Pedagogical Tone gained three distinct first-occurrence formats (acronym / non-acronym / heading) and a `Default Content Structure` section mandating an intro paragraph after the H1 and a `## Fundamental concepts` glossary table when a doc introduces 3+ technical terms. All narrative validators extracted into a dedicated sibling module under `config/heuristics/`, keeping the governance SSOT thin.

### v4.1: Governance Slim-Down

Shed the last of the ceremonial governance layer. `staff-dna.md` was deleted entirely; `code-style.md` was rewritten lean (16.7KB → 5.8KB, −65%) with a two-line Security-First block plus a consolidated `PreCodeChecklist` (8 binary items) and `PreFinishGate` (8 items wired to narrative heuristic validators). The workflow template lost the DNA-GATE supreme block; `audit-bundle.mjs` lost the Law 1 and Law 8 validators that inspected for removed vocabulary. Tests were rewritten lockstep. 206/206 tests passing, audit 100%, drift 0.

### v5.0: Dynamic Stack Context

The static idiom catalog (fifteen language subdirectories under `src/assets/instructions/idioms/`, ~50KB, plus its `stack-versions.mjs` registry and the `update` maintenance command) was removed. Stack specificity is no longer installed. It is **declared**, once, during the `land:` cycle. The agent elicits languages/runtimes/frameworks in free-form, classifies entries by role (Backend/Frontend/Data/Scripts), optionally enriches via an allow-listed doc fetch (12 canonical sources), and persists the result in `.ai/backlog/stack.md`. Phase CODE reads that file on every session. The twin `competencies/{backend,frontend}.md` files were fused into a single `competencies/delivery.md` with internal discriminators (`## Backend (load if server-side)` / `## Frontend (load if UI)`). The `--idiom` CLI flag, the `codeStyle` selection, the `update-versions` command, and the `sync-rulesets` command are all retired. Migration is silent: a stale `.ai/instructions/` tree is wiped on the next `init`. Released as v5.0 (major) due to the removed CLI surface.

With this release the **core is considered closed**. The CLI ships a 5-phase protocol, narrative heuristics, a gate and audit suite, and a `land:`-driven stack declaration, which is enough to govern any project.

### v5.x: Lint Enforcement

A governance rule that only a prompt enforces is a rule the agent can talk itself out of. This series moved the mechanizable half into the linter, where it runs before the agent reads the file and costs no gate tokens. Four local ESLint rules shipped under `src/assets/tooling/eslint-rules/`, each with a colocated test: `semantic-spacing` (blank-line rhythm), `no-boolean-comparison`, `no-inline-assert` (named identifiers on both sides of an assertion), and `blank-before-assertion`. A 129-violation sweep made `no-inline-assert` global.

Around them: a regex pre-filter that feeds the gate hints before it spends tokens, `checklist-soul.md` as the operational companion to `writing-soul.md`, and the response envelope in `delivery.md` migrated to an `ok`-discriminated union with RFC 9457 Problem Details for the error branch.

### v6.0: Harness Alignment

Governance was living where the CLI put it rather than where tools look for it. Four changes, one epic.

- **`AGENTS.md` moved to the repo root.** Codex and any other harness that reads a root `AGENTS.md` now pick it up with no wiring, and `CLAUDE.md` beside it imports that path. A copy left under `.ai/skills/` by an earlier install is deleted on the next `init`, guarded by an ownership sentinel so a hand-written file survives untouched.
- **The backlog is classified by volatility.** A blanket `.ai/backlog/` gitignore entry was discarding `stack.md`, `learned.md` and `troubleshoot.md`, which hold knowledge no other file carries. Only `tasks.md`, `impact-map.md` and `.ai/last-prompt.md` are session state, and only those stay local.
- **Biome repositioned as a baseline.** Three claims in the tooling README coupled Biome to visual density, which it does not enforce. The shipped config was also invalid on Biome 2.5.5, and it collided with its own template copy at the project root.
- **A fifth local ESLint rule.** `duplicate-consecutive-statement` reports two adjacent statements with identical source text. Deliberate repetition carries an `eslint-disable-next-line` plus a comment saying why.

The vendor-neutral constraint held throughout: no `.claude/` directory, no per-harness folders, and enforcement in git and lint rather than in a harness hook.

### v10.0: Ownership Split

`.ai/` held two things belonging to different owners, and only the `.gitignore` knew where the line
was. v10 draws it in the tree instead.

- **`.ai/kit/` holds what the CLI installs, and leaves git.** Skills, instructions, commands and tooling
  are written by the CLI, pinned by `.ai/.sdg-manifest.json`, and regenerable from it. An install
  went from 80 tracked files to 11, and an update from a diff nobody reads to a version and a set of
  hashes.
- **The kit is cleared whole before every install.** Pruning by manifest inventory could never reach
  a file the developer added by hand, because no manifest ever listed it. Clearing can, and what it
  removes is named rather than dropped in silence.
- **`restore` rebuilds a clone.** It reads the manifest, refuses any release but the one pinned, and
  verifies every restored file against the recorded hashes.
- **`tasks.md` splits by volatility.** The queue and its record stay versioned, where a backlog entry
  carries reasoning no other file holds. `## Now` and `## Active` move to `session.md`, local,
  because a shared session pointer makes one developer's agent resume another's task.
- **The sweep is guarded.** `audit:` fails on any reference still pointing outside `.ai/kit/`, since
  an agent follows a stale path into nothing without raising an error.

See [Migration v9 → v10](guides/MIGRATION-v10.md).

### v11.0: One Root File

`AGENTS.md` became the only file the CLI writes at the repository root.

- **`CLAUDE.md` is no longer written.** Claude Code reads `AGENTS.md` natively, but only while no `CLAUDE.md` exists, so the pointer the CLI wrote kept Claude Code from reading `AGENTS.md` directly. `init` removes the pointer an earlier release left and warns about a hand-written `CLAUDE.md` that does not import `AGENTS.md`.
- **Checks report what they inspected.** `audit` exits non-zero on any gap, a missing kit fails instead of reporting in sync, and a link checker in the suite fails on any reference that leads nowhere.
- **A stop after TEST.** Phase TEST ends on a Review Gate, as the documents already described, and the plan lives in `session.md` instead of the versioned queue.

See [Migration to v11](guides/MIGRATION-v11.md).

### v11.1: Subtraction and Enforcement

The release came out of the 2026-11-18 `audit:` of the agent-skills ecosystem and current vendor guidance. Most of its changes remove text; the rest add enforcement.

- **Less recited text.** The Work Checklist stopped being recited before a write, Terse Mode covers working notes only, and absolute rules carry a scope and a reason instead of capital letters.
- **Gates that say what holds them.** The Guardrails table names a hook, a test or nothing for each gate, and `git-guard` is the enforced half of the commit gate.
- **Canon agreement tests.** Every rule restated outside its source is read from both sides by a test, run by `npm run ssot`, and a byte budget measures what Phase CODE loads.
- **New practice for broad and risky work.** Waves group a broad request by the files it touches, an `[M]` or `[L]` change gets a fresh-context review, and the YAGNI ladder decides what code gets written.

---

> For the full technical history, see [CHANGELOG.md](../CHANGELOG.md).
