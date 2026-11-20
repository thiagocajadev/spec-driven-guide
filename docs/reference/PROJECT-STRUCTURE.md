# Project Structure

This page names every directory and file that `spec-driven-guide init` writes into a project, what each one is for, and when the agent reads it. It is for the developer deciding what to commit and for the contributor changing the instruction set, who finds here where each installed file comes from under `src/assets/`.

## Fundamental concepts

| Concept      | What it is                                                                                                       |
| :----------- | :--------------------------------------------------------------------------------------------------------------- |
| **Kit**      | `.ai/kit/`, what the CLI installs. Cleared and rewritten on every install, gitignored                            |
| **Backlog**  | `.ai/backlog/`, what the developer and the agent write about the project. Versioned, except two files            |
| **Manifest** | `.ai/.sdg-manifest.json`, the installed version, the selections and one hash per file. Committed                 |
| **Skill**    | One file in `.ai/kit/skills/` with a ruleset for one domain, loaded only when a cycle needs it                   |
| **Router**   | `AGENTS.md`, the root file that names every skill and the trigger that loads it; skill bodies stay in the skills |

## Installed tree

```text
your-project/
├── AGENTS.md                    ← The router: session start, cycle prefixes, skill registry (committed)
├── .ai/
│   ├── .sdg-manifest.json       ← The pin: version, selections, one hash per file (committed)
│   ├── kit/                     ← The CLI writes it, and rewrites it on every install (gitignored)
│   │   ├── skills/              ← Engineering skills, loaded on demand
│   │   │   ├── code-style.md    ← Code style, the YAGNI ladder and the Work Checklist (Form)
│   │   │   ├── testing.md       ← Test structure, regression tests, unit and integration boundaries
│   │   │   ├── security.md      ← Configuration isolation, secrets, the security pipeline
│   │   │   ├── api-design.md    ← API contracts and envelopes
│   │   │   ├── data-access.md   ← Repository layer and persistence boundaries
│   │   │   ├── sql-style.md     ← SQL query rules
│   │   │   ├── observability.md ← Logging, metrics, tracing
│   │   │   ├── ci-cd.md         ← Pipelines and deployment
│   │   │   ├── cloud.md         ← Cloud and containers
│   │   │   ├── ui-ux.md         ← Design contract, presets, UX standards
│   │   │   ├── visual-density.md ← Visual density in depth
│   │   │   ├── review.md        ← PR craft, reviewer checklist, fresh-context review
│   │   │   ├── performance.md   ← Big-O budget, hot paths, profiling
│   │   │   ├── domain.md        ← DDD-Lite: aggregates, value objects, ubiquitous language
│   │   │   ├── versioning.md    ← Commit shape, the bump table, the two release modes
│   │   │   ├── writing-soul.md  ← Voice rules for prose, stated as tests
│   │   │   ├── checklist-soul.md ← The passes that check a draft against the soul
│   │   │   ├── writing-readme.md ← The banner above a README's first paragraph
│   │   │   └── lexicon/         ← Defect instances, one file per language
│   │   ├── instructions/
│   │   │   ├── templates/       ← workflow.md, agent-roles.md, backlog seeds
│   │   │   ├── flavor/          ← principles.md for the flavor chosen at init
│   │   │   └── competencies/    ← delivery.md: BFF envelope and UI contract
│   │   ├── commands/            ← One file per cycle: feat, fix, docs, audit, land, end
│   │   └── tooling/             ← Hooks, lint rules, release scripts, samples. Nothing wired by default
│   └── backlog/                 ← The developer and the agent write it, classified by volatility
│       ├── context.md           ← Project brief: vision, commands, decisions (committed)
│       ├── stack.md             ← Languages, runtimes and versions, written by land: (committed)
│       ├── learned.md           ← Patterns and research findings worth keeping (committed)
│       ├── troubleshoot.md      ← Failures, their root cause and the test that pins each (committed)
│       ├── tasks.md             ← The queue and its record: ## Backlog and ## Done (committed)
│       ├── session.md           ← Where this cycle stopped: ## Now and ## Active (gitignored)
│       └── impact-map.md        ← The files the current plan touches (gitignored)
```

`AGENTS.md` is the only root file written. Claude Code, Hermes Agent, Codex, Cursor, Copilot and most other harnesses read it natively; the few that need one line of configuration are listed in the README.

The CLI never overwrites it blindly. It recognises its own file by the canonical title line it always emits: without that line the file belongs to the developer, stays untouched, and the governance goes to `AGENTS.sdg.md` for the developer to merge.

`CLAUDE.md` is never written. A pointer an earlier release left behind is removed, because Claude Code reads `AGENTS.md` only while no `CLAUDE.md` exists. A `CLAUDE.md` the developer wrote stays, and `init` warns when it lacks an `@AGENTS.md` import.

On a Node project, `init` also adds `scripts/bump.mjs` and a `bump` script to `package.json`. `--no-bump` skips both.

---

## AGENTS.md: the router

`init` assembles it from the skill catalog, so it has no counterpart file under `src/assets/`. It holds the session start checklist, the Persistence Policy, the cycle prefixes and the skill registry, and no skill bodies: it tells the agent which file to load for the current task.

## .ai/kit/skills/

Each skill is a self-contained ruleset that opens with `name` and `description` frontmatter. The sources live in [`src/assets/skills/`](../../src/assets/skills/).

- **`code-style.md`** loads at every Phase CODE entry. It holds the code style rules, the YAGNI ladder with its never-cut list, and the `WorkChecklist`, whose Form items Phase TEST verifies on every changed file through the heuristics in `governance.mjs`.
- **Domain skills** (`api-design.md`, `data-access.md`, `sql-style.md`, `ci-cd.md`, `cloud.md`, `ui-ux.md`) load when the task touches that domain. The router groups them as Backend and Frontend.
- **Surgical skills** (`testing.md`, `security.md`, `observability.md`, `review.md`, `performance.md`, `domain.md`, `visual-density.md`, `writing-soul.md`) load only when the task directly touches their concern. `review.md` also holds the fresh-context review that an `[M]` or `[L]` change gets before the TEST stop.
- **`versioning.md`** holds the commit subject the `commit-msg` hook enforces, the table that derives MAJOR, MINOR or PATCH from the commit type, and the two release modes a project declares as `release` in `context.md`: `derived`, where CI computes the version and writes `CHANGELOG.md` from the commit bodies, and `manual`, where the bump runs locally. `sdg-end.md` loads it on every Phase END.
- **The writing skills.** `writing-soul.md` states each voice rule as a defect class plus the test that detects it. `checklist-soul.md` holds the passes that check a draft. `lexicon/<language>.md` holds the concrete instances of each class in one language, which `tooling/hooks/writing-lint.mjs` reads at runtime. `writing-readme.md` governs the banner above a README's first paragraph. `docs:`, `land:` and `end:` load the first two; `docs:` adds `writing-readme.md` when the cycle touches a README.

## .ai/kit/instructions/

- **`templates/workflow.md`**: the five-phase Working Protocol, the Guardrails table, Task Handoff and Token Discipline. Every cycle command loads it when the cycle opens.
- **`templates/agent-roles.md`**: the handoff for a subagent that takes CODE and TEST. Loaded only when the agent delegates.
- **`templates/backlog/`**: the seeds for the files in `.ai/backlog/`, written only when the file does not exist yet.
- **`flavor/principles.md`**: the architectural flavor chosen at init (`vertical-slice`, `mvc`, `lite` or `legacy`), which says where logic belongs. The quick reference lists [the pipeline of each one](CHEATSHEET.md#architecture-flavors---flavor).
- **`competencies/delivery.md`**: both sides of the delivery contract. Its Backend section holds the BFF response envelope and the execution flow; its Frontend section holds the wireframe discipline and the HTTP integration path. A `feat:` SPEC loads the half that matches the task.

There is no idiom catalog per language. The stack lives in `.ai/backlog/stack.md`, written by the `land:` cycle.

## .ai/kit/commands/

One file per cycle, loaded when its prefix opens the cycle: `sdg-feat.md`, `sdg-fix.md`, `sdg-docs.md`, `sdg-audit.md`, `sdg-land.md` and `sdg-end.md`. None of them loads at session start.

## .ai/kit/tooling/

A catalog copied in and wired to nothing. The developer activates each piece by hand, following [`tooling/README.md`](../../src/assets/tooling/README.md).

| Directory             | What it holds                                                                              |
| :-------------------- | :----------------------------------------------------------------------------------------- |
| `hooks/`              | `git-guard.mjs`, the enforced half of the commit gate, and the advisory `writing-lint.mjs` |
| `husky/`              | `commit-msg` and `pre-commit` hooks                                                        |
| `eslint-rules/`       | The local ESLint rules behind the Form check                                               |
| `eslint-config/`      | An ESLint snippet and a `.prettierrc`                                                      |
| `scripts/`            | `bump.mjs` and `prune-backlog.mjs`                                                         |
| `line-endings/`       | A `.gitattributes` and an `.editorconfig` that agree on LF                                 |
| `gitignore/`          | The managed `.gitignore` block                                                             |
| `github-actions/`     | A release-please workflow and its config, for the `derived` release mode                   |
| `biome/`, `sqlfluff/` | Baseline configs for Biome and SQLFluff                                                    |

## .ai/backlog/

The developer and the agent write this directory. It carries state across sessions, so any agent in any session can continue where the last one stopped, and it is versioned so the team reads what the project learned.

- **`context.md`**: the project brief. Vision, the project's commands and declarations (`test`, `lint`, `build`, `release`, `bump`, `eol`), decisions and their reasons, and the developer's details under `## Partner`.
- **`stack.md`**: languages, runtimes, frameworks and versions grouped by role (Backend, Frontend, Data, Scripts). A placeholder until `land:` fills it; edit it directly when versions change.
- **`tasks.md`**: the queue and its record. `## Backlog` holds work not yet taken, with the reasoning behind each item; `## Done` holds closed cycles, pruned to the last three.
- **`session.md`**: where this cycle stopped, for this developer. `## Now` holds the objective and `## Active` the plan, with the task in flight marked `[IN_PROGRESS]` and the phase the banner reads. It stays local because two developers in two tasks would collide on the one line that matters.
- **`learned.md`**: patterns and findings worth reusing, one lesson per entry with its origin, pruned when it stops being true.
- **`troubleshoot.md`**: failures with their root cause, each naming the regression test that pins it.
- **`impact-map.md`**: written at Phase PLAN and reset at Phase END. `## Changed` lists the files the tasks will touch, `## Blast Radius` what imports them, then `## Tests at Risk` and `## Safe`.

---

## What loads, and when

`AGENTS.md` and the three files Session Start reads are in context from the first message. Everything else loads when a phase or a domain calls for it.

| Moment        | Files read                                                                                                |
| :------------ | :-------------------------------------------------------------------------------------------------------- |
| Session start | `AGENTS.md`, `.ai/backlog/context.md`, `stack.md`, `session.md`                                           |
| SPEC          | `templates/workflow.md`, `commands/sdg-<cycle>.md`, `competencies/delivery.md` on a `feat:` that needs it |
| PLAN          | writes `session.md` and `impact-map.md`                                                                   |
| CODE          | `skills/code-style.md`, `flavor/principles.md`, the domain skills the task touches                        |
| TEST          | the Form items of `code-style.md`; `review.md` for the fresh-context review of an `[M]` or `[L]` change   |
| END           | `commands/sdg-end.md`, `versioning.md`, the writing skills, `tasks.md`, `learned.md`, `troubleshoot.md`   |

### What it costs

English prose runs at roughly four bytes per token, code at roughly three. A session costs the router and the Session Start files, plus `workflow.md` once a cycle opens, plus the skills each phase loads. Two tests hold that cost to a number someone raises on purpose:

- **Token Budget Guard**, in [`instruction-assembler.test.mjs`](../../src/engine/lib/domain/instruction-assembler.test.mjs), caps the size of `AGENTS.md`.
- **Phase CODE budget**, in [`context-budget.test.mjs`](../../src/engine/lib/domain/context-budget.test.mjs), caps the router, `workflow.md`, `code-style.md` and the largest flavor measured together.

Each test holds its ceiling and the reason behind it; this page does not repeat the numbers.
