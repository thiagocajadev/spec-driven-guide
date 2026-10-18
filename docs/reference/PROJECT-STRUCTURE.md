# Project Structure

This document describes every directory and file installed by `spec-driven-guide init`.

## Installed Tree

```text
your-project/
├── AGENTS.md                    ← Main entry point + skill registry (canonical, committed)
├── .ai/
│   ├── .sdg-manifest.json       ← The pin: version, selections, one hash per file (committed)
│   ├── kit/                     ← The CLI writes it, and rewrites it on every install. Gitignored
│   │   ├── skills/              ← Engineering skills (loaded on-demand per cycle phase)
│   │   │   ├── code-style.md    ← Code style + Work Checklist (Intent + Form), Phase CODE core
│   │   │   ├── testing.md       ← Test principles (loaded in Phase CODE/TEST)
│   │   │   ├── security.md      ← Security boundaries + pipeline rules
│   │   │   ├── api-design.md    ← API contracts and envelopes
│   │   │   ├── data-access.md   ← Repository layer and persistence boundaries
│   │   │   ├── observability.md ← Logging, metrics, tracing
│   │   │   ├── ci-cd.md         ← Pipelines and deployment
│   │   │   ├── cloud.md         ← Cloud & containers
│   │   │   ├── sql-style.md     ← SQL query rules
│   │   │   ├── ui-ux.md         ← Design thinking, presets, standards, architecture
│   │   │   ├── review.md        ← PR craft + reviewer checklist
│   │   │   ├── performance.md   ← Big-O budget, hot paths, profiling
│   │   │   ├── domain.md        ← DDD-Lite: aggregates, VOs, ubiquitous language
│   │   │   ├── visual-density.md ← Visual-density readability, in depth
│   │   │   ├── writing-soul.md  ← Voice rules for prose, stated as tests, English
│   │   │   ├── checklist-soul.md ← The writing gate: recite before, sweep after
│   │   │   └── lexicon/         ← Defect instances, one file per language
│   │   ├── instructions/
│   │   │   ├── templates/       ← Working protocol (workflow.md), agent roles, backlog seeds
│   │   │   ├── flavor/          ← The architectural pattern chosen at init
│   │   │   └── competencies/    ← Delivery contract: BFF envelope + UI contract execution
│   │   ├── commands/            ← Cycle command files (feat/fix/docs/audit/land/end)
│   │   └── tooling/             ← Inert bundle: lint rules, hooks, release scripts, gitignore sample
│   └── backlog/                 ← You and the agent write it, classified by volatility
│       ├── context.md           ← Project brief: vision, decisions, current state (committed)
│       ├── stack.md             ← Developer-declared languages/runtimes (populated by land:, committed)
│       ├── learned.md           ← Lessons learned: success patterns and research findings (committed)
│       ├── troubleshoot.md      ← Troubleshooting: RCA logs and critical failure records (committed)
│       ├── tasks.md             ← The queue and its record: ## Backlog + ## Done (committed)
│       ├── session.md           ← Where this cycle stopped: ## Now + ## Active (gitignored)
│       └── impact-map.md        ← Blast-radius map: created at PLAN, cleared at END (gitignored)
```

`AGENTS.md` is the only root file written. Claude Code, Codex, Cursor, Copilot and most other harnesses read it natively; the few that need one line of configuration are listed in the README.

It is never overwritten blindly. Ownership is recognised by the canonical title line the CLI always emits: without it, the file is yours, it is left alone, and the governance is written to `AGENTS.sdg.md` for you to merge.

`CLAUDE.md` is never written. A pointer an earlier release left behind is removed, since Claude Code reads `AGENTS.md` only while no `CLAUDE.md` exists. A `CLAUDE.md` you wrote stays, and `init` warns when it lacks an `@AGENTS.md` import, because without one it hides the governance from Claude Code.

---

## AGENTS.md: the entry point

The main entry point, at the repo root. Assembled at `init` from the skill catalog, so it has no counterpart under `src/assets/`. It is a **minimal router**: header + session start checklist + semantic router + skill registry. It carries no knowledge: it tells the agent which skill to load for the current task.

---

## .ai/kit/skills/: Engineering Skills (on-demand)

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

### skills/versioning.md

Commit shape and release mechanics. It holds the subject format the `commit-msg` hook enforces, the table that derives MAJOR / MINOR / PATCH from the commit types, and the two release modes a project declares as `release` in `context.md`: `derived`, where CI computes the version and generates `CHANGELOG.md` from the commit bodies, and `manual`, where `npm run bump` runs locally and the release commit carries the number. An absent key reads as `manual`.

Loaded by command rather than by the router: `sdg-end.md` loads it on every Phase END, `sdg-land.md` loads it to ask a new project which mode it wants. `code-style.md`, `ci-cd.md`, `review.md` and `workflow.md` cite it instead of restating the format.

### skills/writing-readme.md

The banner above the first paragraph, which `writing-soul.md` does not describe: logo dimensions, the title inside the centered block, the tagline and its link to the translated README, badge grouping in the order identity, stack, meta. Everything under the banner is prose the soul governs unchanged. Loaded by `sdg-docs.md` when the cycle touches a README.

### skills/writing-soul.md · checklist-soul.md · lexicon/

The voice governance, loaded on `docs:`, `land:` and `end:`, and on any Phase CODE task that writes prose.

`writing-soul.md` holds the rules, in English, each stated as a defect class plus the test that detects it. `checklist-soul.md` holds the ritual: Part 1 recited before the first write of each file, Part 2 swept after the last line of the cycle. `lexicon/<language>.md` holds the concrete instances of each class in one language, keyed by the class name.

The split is what makes an English rule fire on a document delivered in another language. A rule written as a test crosses languages; a rule written as a word does not. `tooling/hooks/writing-lint.mjs` reads the lexicon at runtime, so adding a term or a whole language is a text edit, never a code change. A project that wants a different voice from the canon swaps its lexicon and leaves the rules alone.

---

## .ai/kit/instructions/: Non-skill rulesets

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

## .ai/kit/commands/: Cycle Command Files

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

Committed, except the two volatile files. You and the agent write this directory, and it persists state across sessions so any agent, in any session, can pick up where the last one stopped, and it is versioned so the team sees what the project learned instead of one machine keeping it.

**context.md**: written on first run, maintained by the agent at the END of each cycle. Captures:

- Vision, architectural decisions, and their rationale
- Developer metadata (`## Partner`)

**stack.md**: placeholder written on install, populated by the `land:` cycle. Single source of truth for project stack (languages, runtimes, frameworks, versions) grouped by role (Backend / Frontend / Data / Scripts). Phase CODE reads this file on every session.

**tasks.md**: the queue and its record, committed. `## Backlog` holds the work not yet taken, with the reasoning behind each decision, and `## Done` the closed entries the `prune` keeps to the last three. A backlog entry is the one thing here no other file carries, which is why the file is versioned.

**session.md**: where this cycle stopped, for this developer, gitignored. `## Now` holds the objective and `## Active` the task in flight, marked `[IN_PROGRESS]` with the phase the banner reads. It stays local because two developers in two tasks would collide on the one line that matters, and the conflict would land inside markdown the agent reads as instruction.

The agent reads both at session start before accepting new work.

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
- **Regenerated** at Session Start if missing: the agent rebuilds it from `git diff` if an `[IN_PROGRESS]` task is detected in `session.md`

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
