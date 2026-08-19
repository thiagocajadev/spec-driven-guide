# Migrating sdg-agents

Every breaking upgrade the CLI has shipped, newest first, with the steps each one needs. The filename still says v3 because external links point at it; the content covers v2 through v6.

> **v7.x → v8.0**: the package is now `spec-driven-guide`. See [MIGRATION-v8.md](MIGRATION-v8.md).
> **v5.x → v6.0**: governance moved to a root `AGENTS.md` and the backlog is classified by volatility. See [v6.0 Migration Notes](#v6-migration-notes) below.
> **v4.1 → v5.0**: static idioms removed, stack declared via `land:`, competencies fused. See [v5.0 Migration Notes](#v42-migration-notes-dynamic-stack-context).
> **v2 → v3**: the historic reformulation, continue below.

---

## v2 → v3 Reformulation

`sdg-agents` v3.0 is a structural reformulation. The **generated `.ai/` layout, the skill model, and the engine internals** all changed. The public CLI surface (wizard, `init`, `audit`, `review`, `sync`, `clear`) stays compatible. The breaking changes are in the files written into your project.

This guide covers what changed, why, and how to migrate an existing v2 installation to v3.

## TL;DR

1. `npx sdg-agents clear`, to remove the old `.ai/` tree.
2. Upgrade: `npm i -g sdg-agents@3` (or use `npx sdg-agents@3`).
3. `npx sdg-agents init`, to re-run the wizard. New layout is written.
4. Re-commit `.ai/` and `CLAUDE.md` (all other agent stubs now live under `.ai/<agent>/` and are committed as part of `.ai/`).
5. Audit: `npx sdg-agents audit`.

If you have local edits in `.ai/instructions/core/`, save them elsewhere first, because that directory no longer exists in v3.

---

## Breaking Changes

| Area                | v2                                                         | v3                                                                                                                                                                                                                                                                                       |
| :------------------ | :--------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill directory     | `.ai/skill/` (singular)                                    | `.ai/skills/` (plural), holding all engineering skills as skill units                                                                                                                                                                                                                    |
| Core ruleset        | `.ai/instructions/core/` (staff-dna + code-style + UI...)  | **Removed**. Content dissolved into `.ai/skills/*`                                                                                                                                                                                                                                       |
| Creative toolkit    | `.ai/instructions/creative/`                               | **Removed**. Out of scope                                                                                                                                                                                                                                                                |
| Dev guides          | `.ai/dev-guides/` + `prompt-tracks/`                       | **Removed** from `.ai/`. Reference versions live in `docs/` of this repo                                                                                                                                                                                                                 |
| Workflows directory | `.ai/workflows/governance.md`                              | **Removed**. Working Protocol now lives in `.ai/instructions/templates/workflow.md`                                                                                                                                                                                                      |
| Engineering Laws    | 7 laws (Hardening → Reflection) + Law 0 (Protocol)         | **8 laws, renumbered**. Protocol is now Law 1. Contextual Efficiency is now Law 8                                                                                                                                                                                                        |
| Multi-agent         | Single-select during wizard                                | **Multi-select** checkbox in wizard + `--all-agents` flag + `--agents <csv>`                                                                                                                                                                                                             |
| Idiom injection     | Single file from catalog                                   | **Multi-idiom** via comma-separated `--idiom ts,py,go` + wizard multi-select                                                                                                                                                                                                             |
| UI/UX rules         | Four files in `core/ui/`                                   | One consolidated skill: `.ai/skills/ui-ux.md`                                                                                                                                                                                                                                            |
| Agent entry files   | `CLAUDE.md`, `.cursorrules`, `.windsurfrules` at repo root | **All agent stubs relocated to `.ai/<agent>/`** (`.ai/cursor/rules/sdg-agents.mdc`, `.ai/copilot/copilot-instructions.md`, `.ai/gemini/GEMINI.md`, `.ai/codex/AGENTS.md`, `.ai/windsurf/.windsurfrules`, `.ai/roocode/.clinerules`). **`CLAUDE.md` at repo root is the sole exception.** |

---

## Why the Reformulation

v2 was a knowledge dump. Every session loaded the full ruleset into context, regardless of what the current task needed. The 7 Laws, code style, UI rules, SQL rules, and security pipeline were all read on every turn, even when the task was a typo fix in a single file.

v3 is a **router**. `AGENTS.md` is a minimal registry of skills, not the rules themselves. Skills load on demand per cycle phase: `staff-dna.md` activates in Phase CODE; `testing.md` activates in Phase TEST; `api-design.md` activates only when the task touches an endpoint. The auto-loaded context is now ~4–6K tokens instead of ~25K, and the skill machinery is the same SSOT, loaded lazily.

The Engineering Laws renumber (0–7 → 1–8) is cosmetic: Law 0 was always the meta-Law that precedes code. In v3 it joins the peer set as Law 1, keeping the natural 1–N reading order.

---

## Step-by-Step

### 1. Back up local edits

If you modified anything under `.ai/instructions/core/`, whether project-specific standards, custom UI rules or internal security addenda, copy those edits to a temporary location. The `core/` directory is gone in v3; you will reinject those edits as skill-level additions after migration.

```bash
cp -r .ai/instructions/core ~/sdg-v2-backup-core
```

### 2. Remove the v2 installation

```bash
npx sdg-agents clear
```

This removes `.ai/` and any legacy agent entry files that are no longer part of v3 (`.windsurfrules` stays; `core/` goes).

### 3. Install v3

```bash
# Ephemeral
npx sdg-agents@3

# Or install globally
npm i -g sdg-agents@3
```

### 4. Re-run init

```bash
npx sdg-agents init
```

The wizard now multi-selects IDE agents and idioms. Pick every agent your team uses, since the cost of enabling all is zero (each agent entry file is 3–5 lines pointing to `.ai/skills/AGENTS.md`).

For non-interactive projects:

```bash
npx sdg-agents init --quick                            # lite + JS/TS defaults
npx sdg-agents init --flavor vertical-slice --idiom typescript,python --all-agents
```

### 5. Reinject local edits (if any)

If step 1 produced a backup, migrate those edits into the corresponding v3 skill file:

| v2 file                                                         | v3 destination                                             |
| :-------------------------------------------------------------- | :--------------------------------------------------------- |
| `core/staff-dna.md`                                             | `.ai/skills/staff-dna.md`                                  |
| `core/code-style.md` + `naming.md` + `engineering-standards.md` | `.ai/skills/code-style.md`                                 |
| `core/testing-principles.md`                                    | `.ai/skills/testing.md`                                    |
| `core/security-pipeline.md` + `security.md`                     | `.ai/skills/security.md`                                   |
| `core/sql-style.md`                                             | `.ai/skills/sql-style.md`                                  |
| `core/ui/*.md` (4 files)                                        | `.ai/skills/ui-ux.md`                                      |
| `core/writing-soul.md`                                          | Dissolved into Law 4 (Narrative Cascade) of `staff-dna.md` |

### 6. Audit

```bash
npx sdg-agents audit
```

All checks should pass. Common first-run warnings:

- **Unreleased changelog entry**: add a `## [Unreleased]` block to `CHANGELOG.md` before your next cycle.
- **Drift detected**: run `npx sdg-agents sync` to pull the latest skill versions.

### 7. Commit

```bash
git add .ai CLAUDE.md
git commit -m "chore: migrate to sdg-agents v3"
```

> **Native auto-discovery**: v3 keeps agent stubs inside `.ai/<agent>/` for reference and organization. If you want Cursor / Copilot / Gemini / Codex / Windsurf / Roo Code to auto-load their stub from the native root path, symlink after each `init` run:
>
> ```bash
> ln -sf .ai/cursor/rules/sdg-agents.mdc   .cursor/rules/sdg-agents.mdc
> ln -sf .ai/copilot/copilot-instructions.md .github/copilot-instructions.md
> ln -sf .ai/gemini/GEMINI.md               GEMINI.md
> ln -sf .ai/codex/AGENTS.md                AGENTS.md
> ln -sf .ai/windsurf/.windsurfrules        .windsurfrules
> ln -sf .ai/roocode/.clinerules            .clinerules
> ```
>
> Only `CLAUDE.md` is generated at the repo root by default because Claude Code's native auto-load is the canonical entry point.

---

## New in v3

- **Skills on-demand**: staff-dna, code-style, testing, security, api-design, data-access, observability, ci-cd, cloud, sql-style, ui-ux. Each is a self-contained skill unit with an explicit load convention.
- **8 Engineering Laws**: Law 1 (Protocol) through Law 8 (Contextual Efficiency). The Protocol Law formalizes the DNA-GATE and Mental Reset before any code modification.
- **Multi-agent generation**: one init run writes entry files for every selected agent.
- **Multi-idiom support**: polyglot projects install `typescript,python,go` in a single command.
- **Token discipline by default**: Terse Mode is the default output mode. Pedagogical Mode is opt-in via explicit "explain" or "why" in the prompt.

---

---

## v5.0 Migration Notes: Dynamic Stack Context

v5.0 removes the static idiom catalog. Stack specificity moves from the installer to the `land:` cycle, where the developer declares it once, in `.ai/backlog/stack.md`.

### Breaking Changes

| Area                     | v4.1 (before)                                                                                     | v5.0 (now)                                                                                                                  |
| :----------------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- |
| Static idioms            | `.ai/instructions/idioms/<lang>/patterns.md` (15 language dirs) copied on `init`                  | **Removed.** Stack lives in `.ai/backlog/stack.md`, written by the `land:` cycle                                            |
| CLI flag `--idiom`       | Accepted a comma-separated list (`--idiom typescript,python`)                                     | **Removed.** Flag no longer parsed; non-interactive mode needs only `--flavor`                                              |
| Wizard idiom prompts     | Backend + Frontend selects asking for language per role                                           | **Removed.** Wizard is now `flavor → partner → done`                                                                        |
| Competency files         | `competencies/backend.md` + `competencies/frontend.md` (copied conditionally based on idiom role) | **Fused** into `competencies/delivery.md` with internal `## Backend (load if ...)` / `## Frontend (load if ...)` gates      |
| `codeStyle` selection    | `latest` / `conservative` for idiom version resolution                                            | **Removed**, no idioms and no version resolution                                                                            |
| `sdg-agents update`      | Regenerated the LTS version registry by prompting an AI agent                                     | **Removed.** `stack-versions.mjs` no longer exists                                                                          |
| `sdg-agents sync`        | Generated a prompt to sync idiom/UI pattern files against upstream docs                           | **Removed.** `sync-rulesets.mjs` deleted                                                                                    |
| `AGENTS.md` Phase CODE   | Listed each installed idiom with language label and conditional Backend/Frontend competency       | Lists `delivery.md` + backend skills + frontend skill + surgical skills unconditionally; `stack.md` loaded at Session Start |
| `.ai/instructions/` tree | Merged with any stale files from previous installs                                                | **Wiped and regenerated** on every `init` (migration is silent)                                                             |
| `.ai/backlog/stack.md`   | Did not exist                                                                                     | **New file**, a placeholder seed on `init`, populated by `land:`                                                            |

### Step-by-Step (v4.1 → v5.0)

1. Upgrade: `npm i -g sdg-agents@5` (or use `npx sdg-agents@5`).
2. Re-run `npx sdg-agents init`. The installer silently wipes `.ai/instructions/` and rewrites it. `.ai/backlog/` is preserved.
3. A new `.ai/backlog/stack.md` placeholder appears. Open the agent chat and run `land: <one-line vision>`. The agent will elicit languages/versions, optionally fetch canonical docs, and populate the file.
4. Check your generated `AGENTS.md`: the Phase CODE block should list `delivery.md` and skills by category, with no `idioms/` references.
5. Run `npx sdg-agents audit`, expecting 100%.

### Preserving Custom Idioms

If you had hand-authored edits in `.ai/instructions/idioms/**/patterns.md`, copy them out before re-running `init`. The cleanest migration is to paste the surviving rules into `.ai/backlog/stack.md` as role-classified bullets, or into a project-local skill file in `.ai/skills/` if they are cross-cutting.

### Why

Static idiom catalogs were a knowledge dump: every install copied fifteen language subdirectories, most unused, and the version registry (`stack-versions.mjs`) rotted the moment any upstream released. v5.0 replaces that with developer authority: the `land:` cycle treats stack declaration as part of project inception, the same way `## Vision` and the epic list are. The agent reads the live declaration on every Phase CODE entry; the maintainer never has to ship a new catalog version.

---

<a id="v6-migration-notes"></a>

## v6.0 Migration Notes: Harness Alignment

v6.0 moves the canonical governance to the repo root and stops discarding team knowledge. Both breaks shipped in `5.10.0` and are named as breaking here.

### Breaking Changes

| Area                   | v5.x (before)                                | v6.0 (now)                                                                                    |
| :--------------------- | :------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| Canonical governance   | `.ai/skills/AGENTS.md`                       | **`AGENTS.md` at the repo root**, where Codex and other harnesses already look                |
| `CLAUDE.md` import     | Pointed at the nested `.ai/skills/AGENTS.md` | Imports the root `AGENTS.md`                                                                  |
| Legacy copy            | Stayed in place after an upgrade             | **Deleted on the next `init`**, guarded by the ownership sentinel                             |
| Generated `.gitignore` | Blanket `.ai/backlog/` entry                 | Three volatile files by name; `stack.md`, `learned.md` and `troubleshoot.md` become versioned |
| Foreign root files     | Not applicable                               | An `AGENTS.md` or `CLAUDE.md` you wrote is preserved; governance lands as `AGENTS.sdg.md`     |

### Step-by-Step (v5.x → v6.0)

1. Upgrade: `npm i -g sdg-agents@6` (or use `npx sdg-agents@6`).

2. Re-run `npx sdg-agents init`. The root `AGENTS.md` and `CLAUDE.md` are written, and a stale `.ai/skills/AGENTS.md` from an earlier install is removed.

3. Open your `.gitignore` and delete the legacy `.ai/backlog/` line by hand. `writeGitignore` only appends, so it cannot remove that entry for you, and while it stays your team knowledge keeps being ignored.

4. Commit `.ai/backlog/stack.md`, `learned.md` and `troubleshoot.md`. They were being discarded before this release.

5. Run `npx sdg-agents audit` and expect 100%.

### If you hand-wrote a root AGENTS.md

It is never overwritten. The CLI recognises its own files by the canonical title line it always emits, so a file without that line belongs to you. The governance is written to `AGENTS.sdg.md` instead, and `init` prints a warning naming the file. Merge what you want and delete the sidecar.

A hand-written `CLAUDE.md` gets no sidecar, because Claude Code reads that exact filename or nothing. Add the `@AGENTS.md` import to your own file to wire the governance in.

### Why

Governance was living where the CLI put it rather than where tools look for it, which meant every harness needed manual wiring for a file the ecosystem had already standardised. The backlog change fixes the opposite defect: a single gitignore line was throwing away the stack declaration, the accumulated patterns, and the troubleshooting log, all of which cost real work to produce and none of which are session state.

---

## Questions?

- Open an issue at [github.com/thiagocajadev/sdg-agents-cli](https://github.com/thiagocajadev/sdg-agents-cli).
- Read the manifesto at [specdrivenguide.org](https://specdrivenguide.org).
- For the philosophical foundation, see [CONSTITUTION.md](../concepts/CONSTITUTION.md).
