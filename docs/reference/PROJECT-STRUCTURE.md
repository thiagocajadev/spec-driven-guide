# Project Structure

This document describes every directory and file installed by `sdg-agents init`.

## Installed Tree

```text
your-project/
├── AGENTS.md                    ← Main entry point + skill registry (canonical)
├── CLAUDE.md                    ← Thin pointer, auto-loaded by Claude Code
├── .ai/                         ← Instruction set (committed)
│   ├── skills/                  ← Engineering skills (loaded on-demand per cycle phase)
│   │   ├── code-style.md        ← Code style + Work Checklist (Intent + Form), Phase CODE core
│   │   ├── testing.md           ← Test principles (loaded in Phase CODE/TEST)
│   │   ├── security.md          ← Security boundaries + pipeline rules
│   │   ├── api-design.md        ← API contracts and envelopes
│   │   ├── data-access.md       ← Repository layer and persistence boundaries
│   │   ├── observability.md     ← Logging, metrics, tracing
│   │   ├── ci-cd.md             ← Pipelines and deployment
│   │   ├── cloud.md             ← Cloud & containers
│   │   ├── sql-style.md         ← SQL query rules
│   │   ├── ui-ux.md             ← Design thinking, presets, standards, architecture
│   │   ├── review.md            ← PR craft + reviewer checklist
│   │   ├── performance.md       ← Big-O budget, hot paths, profiling
│   │   ├── domain.md            ← DDD-Lite: aggregates, VOs, ubiquitous language
│   │   ├── visual-density.md    ← Visual-density readability, in depth
│   │   ├── writing-soul.md      ← Voice rules for prose, stated as tests, English
│   │   ├── checklist-soul.md    ← The writing gate: recite before, sweep after
│   │   └── lexicon/             ← Defect instances, one file per language
│   │       ├── en.md            ← English instances
│   │       └── pt-BR.md         ← Portuguese (Brazil) instances
│   ├── instructions/
│   │   ├── templates/           ← Working protocol (workflow.md), agent roles, context + stack + tasks seeds
│   │   ├── flavors/             ← Architectural patterns (vertical-slice, mvc, lite, legacy)
│   │   └── competencies/        ← Delivery contract: BFF envelope + UI contract execution (fused)
│   ├── commands/                ← Cycle command files (feat/fix/docs/audit/land/end)
│   └── backlog/                 ← Harness Engineering (Memory), classified by volatility
│       ├── context.md           ← Project brief: vision, decisions, current state (versioned)
│       ├── stack.md             ← Developer-declared languages/runtimes/versions (populated by land:, versioned)
│       ├── learned.md           ← Lessons learned: success patterns and research findings (versioned)
│       ├── troubleshoot.md      ← Troubleshooting: RCA logs and critical failure records (versioned)
│       ├── tasks.md             ← Task list (TODO / IN_PROGRESS / DONE, gitignored)
│       └── impact-map.md        ← Blast-radius map: created at PLAN, cleared at END, gitignored
```

Only those two root files are written. Harnesses that read `AGENTS.md` natively (Codex among them) need nothing further; the rest are wired with a one-line pointer in their own config file, documented in the README.

Neither root file is overwritten blindly. Ownership is recognised by the canonical title line the CLI always emits: without it, the file is yours. A foreign `AGENTS.md` is left alone and the governance is written to `AGENTS.sdg.md` for you to merge; a foreign `CLAUDE.md` is left alone with no sidecar, since Claude Code reads that exact filename or nothing. Either case prints a warning at the end of `init`.

---

## AGENTS.md: the entry point

The main entry point, at the repo root. Assembled at `init` from the skill catalog, so it has no counterpart under `src/assets/`. It is a **minimal router**: header + session start checklist + semantic router + skill registry. It carries no knowledge: it tells the agent which skill to load for the current task.

---

## .ai/skills/: Engineering Skills (on-demand)

The skill directory is the **canonical Single Source of Truth** for engineering rules. Each file is a self-contained skill unit with a defined load convention (most load in Phase CODE; `testing.md` also loads in Phase TEST).

### skills/code-style.md

The **Phase CODE core**. Two-line Security-First block, code-style rules (organized as compact tables: Form, Readability, Quality Control), and the unified `WorkChecklist` rule the agent must recite at CODE entry:

- **Intent** (Phase CODE entry, before the first `Edit` / `Write`): Mental Reset, Target Files, Naming, Narrative, Comments, Tests planned, Security, Blockers.
- **Form** (Phase CODE entry **and** verified at Phase TEST): eight binary items wired to narrative heuristic validators in `governance.mjs` (Pure entry point, Narrative Siblings, Explaining Returns, Revealing Module Pattern, Vertical Density, Boolean prefix, No framework abbreviations, No section banners). Recited at CODE entry to avoid the CODE → TEST → CODE rework loop; verified at TEST to gate the cycle.

### skills/testing.md

Test principles: structure, regression requirements, red-green-refactor, integration vs. unit boundaries.

### skills/security.md

Security rules: configuration isolation, PII handling, secret management, and the security pipeline (pre-commit hooks, dependency scanning, static analysis).

### skills/api-design.md · data-access.md · observability.md · ci-cd.md · cloud.md · sql-style.md · ui-ux.md · review.md · performance.md · domain.md

Domain skills. Each covers its concern end-to-end. For example, `api-design.md` defines the response envelope, error code table, REST hierarchy, and standardization protocols. Loaded only when the current task touches the relevant domain. The operational trio (`review.md`, `performance.md`, `domain.md`) covers PR/review craft, complexity budget + hot-path discipline, and DDD-Lite vocabulary.

### skills/writing-soul.md · checklist-soul.md · lexicon/

The voice governance, loaded on `docs:`, `land:` and `end:`, and on any Phase CODE task that writes prose.

`writing-soul.md` holds the rules, in English, each stated as a defect class plus the test that detects it. `checklist-soul.md` holds the ritual: Part 1 recited before the first write of each file, Part 2 swept after the last line of the cycle. `lexicon/<language>.md` holds the concrete instances of each class in one language, keyed by the class name.

The split is what makes an English rule fire on a document delivered in another language. A rule written as a test crosses languages; a rule written as a word does not. `tooling/hooks/writing-lint.mjs` reads the lexicon at runtime, so adding a term or a whole language is a text edit, never a code change. A project that wants a different voice from the canon swaps its lexicon and leaves the rules alone.

---

## .ai/instructions/: Non-skill rulesets

### instructions/templates/

- `workflow.md`: The 5-phase Working Protocol (SPEC → PLAN → CODE → TEST → END), Task Handoff rule, Token Discipline rule. This is the **only** file that is always in context beyond `AGENTS.md`.
- `agent-roles.md`: Multi-agent handoff protocol (Planning + Fast roles).
- `context.md`, `tasks.md`, `learned.md`, `troubleshoot.md`: templates for the `.ai/backlog/` files.

### instructions/flavors/

Rules for the project's architectural pattern. Defines where logic belongs. For example, whether business logic lives in UseCases, Services, or Controllers. One flavor per project: `vertical-slice`, `mvc`, `lite`, `legacy`.

### instructions/competencies/

A single file, `delivery.md`, covering both sides of the delivery contract with internal discriminators:

- `## Backend (load if the task is server-side)`: BFF response envelope (SSOT), execution flow (Validate → Load Dep → Business Rules → Core Logic → Persist → Filter → Envelope), typed layer results, entry-point discipline.
- `## Frontend (load if the task is UI)`: Design Thinking, wireframe discipline, visual layers, HTTP integration via `apiClient → Service → useApi → Component`, component hierarchy rules.

Loaded on demand by the SPEC phase of a `feat:` cycle when the cycle command requests it. The agent picks whichever half matches the task.

> **Stack specificity.** Static language idiom catalogs were retired in v5.0. Stack lives in `.ai/backlog/stack.md`, written by the `land:` cycle, so the agent reads it on every session to know which languages and versions the project uses.

---

## .ai/commands/: Cycle Command Files

Context files loaded on demand when a specific cycle is triggered:

- `sdg-feat.md`: loaded when the agent enters a `feat:` cycle
- `sdg-fix.md`: loaded when the agent enters a `fix:` cycle
- `sdg-docs.md`: loaded when the agent enters a `docs:` cycle
- `sdg-audit.md`: loaded when the agent enters an `audit:` cycle
- `sdg-land.md`: loaded when the agent enters a `land:` cycle
- `sdg-end.md`: loaded when the agent enters the `end:` phase

These files are not loaded on session start, only when the relevant cycle begins.

---

## .ai/backlog/

Gitignored. Persists project state across sessions so any agent, in any session, can pick up where the last one stopped.

**context.md**: written on first run, maintained by the agent at the END of each cycle. Captures:

- Vision, architectural decisions, and their rationale
- Current objective (`## Now`)
- Developer metadata (`## Partner`)

**stack.md**: placeholder written on install, populated by the `land:` cycle. Single source of truth for project stack (languages, runtimes, frameworks, versions) grouped by role (Backend / Frontend / Data / Scripts). Phase CODE reads this file on every session.

**tasks.md**: the task list. Tracks atomic units of work across sessions:

- `[TODO]`: pending
- `[IN_PROGRESS]`: the active task (only one at a time)
- `[DONE]`: completed (kept for reference)

The agent reads this at session start before accepting new work.

**learned.md**: the "Brain" of successful patterns. Captures:

- Research findings and validated hypotheses
- Reusable architecture patterns that worked well for this project
- Specialized terminology and "Staff" level engineering insights

**troubleshoot.md**: the "Immune System" of the project. Captures:

- **Root Cause Analysis (RCA)** for every fix executed
- Failure logs and "gotchas" discovered during development
- Technical debt and fragile areas to be avoided in future cycles

**impact-map.md**: the "Blast-Radius Filter" of the active cycle. Volatile by design:

- **Created** at Phase PLAN via `git diff --name-only HEAD` + import scanning
- **Read** at Phase CODE: the agent loads only the files listed here, ignoring the rest of the codebase
- **Cleared** at Phase END: reset to an idle state so the next cycle starts clean
- **Regenerated** at Session Start if missing: the agent rebuilds it from `git diff` if an `[IN_PROGRESS]` task is detected in `tasks.md`

The map contains three sections: `## Changed` (files directly modified), `## Blast Radius` (files that import or call a changed file), and `## Tests at Risk` (test files covering blast-radius files). A `## Safe` section optionally marks directories that can be skipped entirely.

This design is inspired by the structural philosophy of [code-review-graph](https://github.com/tirth8205/code-review-graph), a knowledge graph tool that uses Tree-sitter ASTs and MCP to give AI agents precise context. Instead of parsing ASTs or running a Python server, the Impact Map achieves the same goal through a lightweight protocol: the agent uses `git diff` and import scanning to build a minimal read-list at the start of every cycle. No external tools and no extra dependencies: a markdown file and a disciplined workflow.

---

## How the Files Are Used Per Phase

| Phase         | Files read                                                                                                 |
| :------------ | :--------------------------------------------------------------------------------------------------------- |
| Session Start | `.ai/backlog/context.md`, `.ai/backlog/stack.md`, `.ai/backlog/tasks.md`                                   |
| SPEC          | `commands/sdg-<cycle>.md`, `.ai/backlog/context.md`, `.ai/backlog/tasks.md`                                |
| PLAN          | `.ai/backlog/tasks.md`, `.ai/backlog/impact-map.md` (written here via `git diff`)                          |
| CODE          | `skills/code-style.md` + domain skills + `competencies/delivery.md` on demand, `.ai/backlog/impact-map.md` |
| TEST          | `skills/testing.md`, including **Audit Gate** (drift detection) and **Circuit Breaker** (3-strike rule)    |
| END           | `.ai/backlog/context.md`, `.ai/backlog/tasks.md`, `learned.md`, `troubleshoot.md`, `commands/sdg-end.md`   |
