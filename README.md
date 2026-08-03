<div align="center">
  <img src="https://raw.githubusercontent.com/thiagocajadev/sdg-agents-cli/main/docs/img/sdg-agents-icon-light.svg" alt="SDG Agents" width="480" height="480" style="border-radius: 1rem;">
  <h1 align="center">Spec-Driven Guide — Agents</h1>
  <p align="center">
    A CLI that installs a structured instruction set for AI agents into your project.<br>
    <a href="docs/i18n/README.pt-BR.md">Versão em Português (Brasil)</a>
  </p>
  <p align="center">
      Read the manifesto and visual guide at <a href="https://specdrivenguide.org">specdrivenguide.org</a>
  </p>
  <a href="https://www.npmjs.com/package/sdg-agents"><img src="https://img.shields.io/npm/v/sdg-agents?style=flat-square&logo=npm&color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/sdg-agents"><img src="https://img.shields.io/npm/dm/sdg-agents?style=flat-square&logo=npm&color=cb3837" alt="npm downloads" /></a>
  <a href="https://github.com/thiagocajadev/sdg-agents-cli/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/thiagocajadev/sdg-agents-cli/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI" alt="CI status" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-24%20LTS-brightgreen?style=flat-square&logo=nodedotjs" alt="Node 24 LTS" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License: ISC" /></a>
  <a href="https://agents.md"><img src="https://img.shields.io/badge/AGENTS.md-compatible-6e56cf?style=flat-square" alt="AGENTS.md compatible" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-keep%20a%20changelog-f5a623?style=flat-square" alt="Changelog" /></a>
</div>

<br>

`sdg-agents` installs a set of markdown instruction files into your project. AI agents (Claude Code, Cursor, Windsurf, Copilot, Codex, and others) read these files and follow the defined protocol for every task.

> **Note:** If your agent does not pick up the rules automatically, reference `AGENTS.md` at the start of the session.

The instruction set covers:

- **Working protocol**: a 5-phase cycle (SPEC → PLAN → CODE → TEST → END) with a unified Work Checklist and a 3-strike Circuit Breaker that stops regression loops. The agent waits for your approval at SPEC and PLAN.

- **Code style and quality gates**: one `WorkChecklist` in `code-style.md`, split into Intent items (recited at CODE entry) and Form items (verified at TEST), wired to the narrative heuristics in `governance.mjs`.

- **Skills, on-demand**: self-contained skill units loaded only when the cycle needs them, covering code style, testing, security, API design, data access, observability, CI/CD, cloud, SQL style, UI/UX, review, performance, and domain modeling.

- **Dynamic stack context**: the `land:` cycle elicits your languages and versions and writes `.ai/backlog/stack.md`, which Phase CODE reads as the single source of truth. No static idiom catalog to maintain.

- **Any-agent compatible**: one canonical `AGENTS.md` at the repo root, where Codex, Cursor and the rest already look. A file you wrote yourself is never overwritten.

- **Memory across sessions**: `.ai/backlog/` persists the project brief, stack, task state, and accumulated team knowledge. An Impact Map scoped to the active cycle tells the agent which files to load.

- **Inert tooling catalog**: a bundle copied into `.ai/tooling/` with nothing wired by default. No `package.json` edit, no `.husky/` created, no devDep installed. Activate on demand.

---

## Quick Start

Requires **Node.js 24 LTS** or newer, the line the CLI is built and tested on.

```bash
npx sdg-agents
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/sdg-agents-cli/main/docs/img/sdg-agents-menu-v2.png" alt="Spec Driven Guide CLI in action" /></kbd>
</p>

The interactive wizard guides you through selecting an architectural flavor. Stack discovery (languages + versions) happens later via the `land:` cycle. It stays out of install so the developer can declare it deliberately, once the project brief is clear. For non-interactive use:

```bash
# Zero-prompt install (lite flavor + placeholder stack.md)
npx sdg-agents init --quick

# Vertical Slice — any stack
npx sdg-agents init --flavor vertical-slice

# MVC — any stack
npx sdg-agents init --flavor mvc
```

After install, open the agent chat and run `land: <vision>`. The agent elicits the stack, writes `.ai/backlog/stack.md`, and seeds the backlog.

---

## What Gets Installed

After running `init`, your project receives:

```
your-project/
├── AGENTS.md                    ← Main entry point + skill registry (canonical)
├── CLAUDE.md                    ← Thin pointer, auto-loaded by Claude Code
├── .ai/                         ← Instruction set (committed)
│   ├── skills/                  ← Engineering skills (loaded on-demand per cycle phase)
│   │   ├── code-style.md        ← Code style + Work Checklist (Intent + Form) — Phase CODE core
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── ... (api-design, data-access, observability, ci-cd, cloud, sql-style, ui-ux)
│   ├── instructions/            ← Flavors, fused delivery competency, templates
│   ├── commands/                ← Cycle commands (feat/fix/docs/audit/land/end)
│   ├── tooling/                 ← Inert tooling bundle (scripts + husky hooks — activate on demand)
│   └── backlog/                 ← Harness Engineering (Memory) — versioned knowledge, volatile state gitignored
│       └── ...                  ← (See docs/reference/PROJECT-STRUCTURE.md for details)
```

`AGENTS.md` is a minimal router: it lists all available skills and loads them on demand. Only `workflow.md` (the 5-phase protocol) is always in context. Everything else activates only when the current cycle needs it.

`CLAUDE.md` sits beside it as a thin pointer that `@`-imports `AGENTS.md`, so Claude Code auto-loads the governance on every session. Other IDEs are wired up by pointing their native config file at the same canonical file (see "Using with other IDEs" below).

> For a detailed breakdown of each file's role, see [Project Structure](docs/reference/PROJECT-STRUCTURE.md).

---

## How the Protocol Works

When you prefix a message to the agent, it enters the corresponding cycle:

| Trigger               | Cycle   | What happens                                                                                                                                       |
| :-------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `land: <description>` | Land    | Agent turns a raw vision into a grounded backlog of sequenced `feat:` tasks. Runs before any code is written                                       |
| `feat: <description>` | Feature | Agent runs SPEC → PLAN → CODE → TEST → END                                                                                                         |
| `fix: <description>`  | Fix     | Agent runs SPEC → PLAN → CODE → TEST → END with RCA focus                                                                                          |
| `docs: <description>` | Docs    | Agent updates changelogs, ADRs, or specs                                                                                                           |
| `audit: <scope>`      | Audit   | Agent verifies project alignment against rulesets (drift detection)                                                                                |
| `end:`                | —       | Close the active cycle. Runs the END Phase checklist (changelog, backlog, commit). Also recovers a cycle if the agent loses track mid-conversation |
| No prefix             | —       | Agent asks: "land, feat, fix, docs, or audit?", then proceeds                                                                                      |

The agent **stops and waits for your approval** at SPEC and PLAN before writing any code.

```
SPEC  →  PLAN  →  CODE  →  TEST  →  END
  ↑           ↑                       ↑
  Wait        Wait                 "end:"
```

For a detailed walkthrough of each phase and its rules, see [Spec-Driven Development Guide](docs/concepts/SPEC-DRIVEN-DEV-GUIDE.md).
For a visual breakdown of the internal decision gates and loops, see [Agent Deep-Flow](docs/concepts/AGENT-DEEP-FLOW.md).

---

## Architectural Flavors

Select the flavor that matches your project's structure:

| Flavor           | Pattern                                 | Use when                     |
| :--------------- | :-------------------------------------- | :--------------------------- |
| `vertical-slice` | Feature-driven vertical cuts            | Monorepo or domain-heavy API |
| `mvc`            | Classic layered (Model-View-Controller) | Standard REST service        |
| `lite`           | Minimal scaffold                        | Scripts, CLIs, utilities     |
| `legacy`         | Refactor-safe bridge patterns           | Migrating existing codebases |

For the data flow diagram of each flavor, see [Architectural Pipelines](docs/reference/PIPELINES.md).

---

## Stack Declaration via `land:`

Stack is **dynamic, not cataloged**. After `sdg-agents init`, run the `land:` cycle to declare the project's languages, runtimes, and framework versions:

```
land: a Node.js + TypeScript API serving a React dashboard
```

The agent:

1. Asks you to list every language and version (free-form).
2. Classifies each entry by role (Backend / Frontend / Data / Scripts).
3. Offers **optional** enrichment via an allow-list of canonical doc sources (`nodejs.org/api`, `react.dev`, `typescriptlang.org`, `tc39.es`, `docs.astro.build`, `docs.python.org`, `go.dev/doc`, `doc.rust-lang.org`, `kotlinlang.org/docs`, `dart.dev`, `learn.microsoft.com/dotnet`, `developer.apple.com/documentation/swift`).
4. Writes `.ai/backlog/stack.md`, the single source of truth for stack-specific idioms. Edit it directly when versions change; no regen needed.

Phase CODE loads `stack.md` on every cycle. No static idiom catalog, no `--idiom` flag.

---

## Using with other IDEs

`sdg-agents` generates a single canonical governance file at `AGENTS.md` in the repo root, plus a `CLAUDE.md` pointer beside it. Codex and Claude Code pick theirs up with no extra step. For other tools, add a one-line pointer in your IDE's native rules file:

| Agent            | Native config file                 | How to wire it                                                        |
| :--------------- | :--------------------------------- | :-------------------------------------------------------------------- |
| Claude Code      | `CLAUDE.md` (root, auto-generated) | Auto-loaded. No action required.                                      |
| Cursor           | `.cursor/rules/sdg-agents.mdc`     | Create the file with a single line: `Read AGENTS.md before any task.` |
| Windsurf         | `.windsurfrules`                   | Same pointer line.                                                    |
| GitHub Copilot   | `.github/copilot-instructions.md`  | Same pointer line.                                                    |
| Codex CLI        | `AGENTS.md` (root)                 | Auto-loaded. No action required.                                      |
| Gemini CLI       | `GEMINI.md`                        | Same pointer line.                                                    |
| Cline / Roo Code | `.clinerules`                      | Same pointer line.                                                    |

> **Prefer a custom preset, voice, or skill?** Paste the skill content into your agent as a prompt, the same way `docs/reference/REFERENCES.md` documents external influences. Custom skills do not require a CLI subcommand.

---

## Maintenance

```bash
npx sdg-agents gate       # Review the staged diff against the gate (language-agnostic pre-commit)
npx sdg-agents review     # Detect drift between local rules and source
npx sdg-agents audit      # Run the governance audit (drift, narrative, code style, hygiene)
npx sdg-agents narrative  # Check the changelog narrative on its own
npx sdg-agents clear      # Remove the .ai/ folder
```

---

## Reference

- [Quick Reference (CHEATSHEET)](docs/reference/CHEATSHEET.md): all CLI flags and agent triggers

- [Project Structure](docs/reference/PROJECT-STRUCTURE.md): detailed breakdown of every generated file

- [Architectural Pipelines](docs/reference/PIPELINES.md): data flow diagrams for each flavor

- [Engineering Constitution](docs/concepts/CONSTITUTION.md): the philosophical principles behind the rules (reference only; runtime rules live in `code-style.md`)

- [UI/UX System](docs/guides/UI-UX.md): design philosophy, hierarchy, surface tonal scale, presets, and external research references

- [Roadmap](docs/ROADMAP.md): shipped milestones and planned extensions

- [Changelog](CHANGELOG.md): current release, with [the archive](docs/CHANGELOG-archive.md) holding every version back to v0.x

- [Token Optimization](docs/guides/TOKEN-OPTIMIZATION.md): cost model, compaction process, and routing efficiency

- [Migration guide](docs/guides/MIGRATION-v3.md): breaking changes and step-by-step migration, v2 through v6

- [Credits and Philosophies](docs/reference/REFERENCES.md): project influences and research credits

---

> **Warning:** This project is in early development. Review and adjust the installed rules to fit your team's standards before relying on them.

_Balance is the key._

SDG is in constant evolution. There is no perfect solution, only continuous improvement. Feel free to contribute, fork, and share.
