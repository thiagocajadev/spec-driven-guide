<!-- prettier-ignore-start -->
<div align="center">
  <img src="https://raw.githubusercontent.com/thiagocajadev/spec-driven-guide/main/docs/img/sdg-agents-icon-light.svg" alt="Spec-Driven Guide" width="480" height="480" style="border-radius: 1rem;">
  <h1 align="center">Spec-Driven Guide: Agents</h1>
  <p align="center">
    A CLI that installs a structured instruction set for AI agents into your project.<br>
    <a href="README.pt-BR.md">Versão em Português (Brasil)</a>
  </p>
  <p align="center">
      Read the manifesto and visual guide at <a href="https://specdrivenguide.org">specdrivenguide.org</a>
  </p>
  <a href="https://www.npmjs.com/package/spec-driven-guide"><img src="https://img.shields.io/npm/v/spec-driven-guide?style=flat-square&logo=npm&color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/spec-driven-guide"><img src="https://img.shields.io/npm/dm/spec-driven-guide?style=flat-square&logo=npm&color=cb3837" alt="npm downloads" /></a>
  <a href="https://github.com/thiagocajadev/spec-driven-guide/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/thiagocajadev/spec-driven-guide/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI" alt="CI status" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-24%20LTS-brightgreen?style=flat-square&logo=nodedotjs" alt="Node 24 LTS" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="License: ISC" /></a>
  <a href="https://agents.md"><img src="https://img.shields.io/badge/AGENTS.md-compatible-6e56cf?style=flat-square&logo=markdown&logoColor=white" alt="AGENTS.md compatible" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-keep%20a%20changelog-f5a623?style=flat-square&logo=keepachangelog&logoColor=white" alt="Changelog" /></a>
</div>
<!-- prettier-ignore-end -->

<br>

`spec-driven-guide` installs a set of markdown instruction files into your project. AI agents (Claude Code, Cursor, Windsurf, Copilot, Codex, and others) read these files and follow the defined protocol for every task.

A developer meeting the project for the first time reads from the top: Quick Start installs it, and How the Protocol Works explains what changes in the conversation with the agent afterwards. A contributor changing the instruction set reads from What Gets Installed down, where every generated file is named and pointed at its source.

## Start with a prefix

Instruct the agent the way you would write a commit message.

| How you ask         | What you type                                                     | What comes back                                                                                                |
| :------------------ | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| A loose ask         | `fix the login`                                                   | The agent guesses the scope and starts typing. You find out what it decided by reviewing everything afterwards |
| A hand-written spec | contract, acceptance criteria and edge cases, written out by hand | It works well. Detail helps, and the agent can write that detail with you                                      |
| ✅ A prefix         | `fix:` login accepts an empty password                            | The agent writes the spec, stops for your approval, then plans, codes and tests inside the same cycle          |

The agent proposes the SPEC from the context it already holds about the project, and you align it together before any code. Where there is risk, spell out as much detail as you can.

<details>
<summary><strong>Fundamental concepts</strong></summary>

| Concept            | What it is                                                                                              |
| :----------------- | :------------------------------------------------------------------------------------------------------ |
| **Cycle**          | One unit of work, opened by a prefix (`feat:`, `fix:`, `docs:`, `audit:`, `land:`) and closed by `end:` |
| **Phase**          | One of the five steps a cycle runs through: SPEC, PLAN, CODE, TEST, END                                 |
| **Skill**          | A self-contained ruleset in `.ai/skills/`, loaded only when the cycle's domain calls for it             |
| **Flavor**         | The architectural shape of the project, chosen at install: vertical slice, MVC, lite, or legacy         |
| **Work Checklist** | The binary gate in `code-style.md`: Intent items recited at CODE entry, Form items verified at TEST     |
| **Backlog**        | `.ai/backlog/`, where the project brief, the declared stack and the task state survive the session      |

</details>

<details>
<summary><strong>What the instruction set covers</strong></summary>

- **Working protocol**: a 5-phase cycle (SPEC → PLAN → CODE → TEST → END) with a unified Work Checklist and a 3-strike Circuit Breaker that stops regression loops. The agent waits for your approval at SPEC and PLAN.

- **Code style and quality gates**: one `WorkChecklist` in `code-style.md`, split into Intent items (recited at CODE entry) and Form items (verified at TEST), wired to the narrative heuristics in `governance.mjs`.

- **Skills, on-demand**: self-contained skill units loaded only when the cycle needs them, covering code style, testing, security, API design, data access, observability, CI/CD, cloud, SQL style, UI/UX, review, performance, domain modeling, versioning, and README writing.

- **Versioning, as a skill**: `versioning.md` owns the commit shape and the table that derives the version from the commit types, so the number is computed from the commits instead of picked by hand. It also declares the two release modes: `derived`, where CI computes the version and generates the changelog from the commit bodies, and `manual`, where `npm run bump` runs locally and the release commit carries the number. Phase END loads it on every cycle.

- **Dynamic stack context**: the `land:` cycle elicits your languages and versions and writes `.ai/backlog/stack.md`, which Phase CODE reads as the single source of truth. No static idiom catalog to maintain.

- **Any-agent compatible**: one canonical `AGENTS.md` at the repo root, where Codex, Cursor and the rest already look. A file you wrote yourself is never overwritten.

- **Memory across sessions**: `.ai/backlog/` persists the project brief, stack, task state, and accumulated team knowledge. An Impact Map scoped to the active cycle tells the agent which files to load.

- **Inert tooling catalog**: a bundle copied into `.ai/tooling/` with nothing wired by default. No `package.json` edit, no `.husky/` created, no devDep installed. Activate on demand.

</details>

---

## Quick Start

Requires **Node.js 24 LTS** or newer, the line the CLI is built and tested on.

```bash
npx spec-driven-guide
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/spec-driven-guide/main/docs/img/sdg-agents-menu.png" alt="Spec Driven Guide CLI in action" /></kbd>
</p>

The interactive wizard guides you through selecting an architectural flavor. Stack discovery (languages + versions) happens later via the `land:` cycle. It stays out of install so the developer can declare it deliberately, once the project brief is clear.

<details>
<summary><strong>Non-interactive install</strong></summary>

```bash
# Zero-prompt install (lite flavor + placeholder stack.md)
npx spec-driven-guide init --quick

# Vertical Slice, any stack
npx spec-driven-guide init --flavor vertical-slice

# MVC, any stack
npx spec-driven-guide init --flavor mvc
```

</details>

After install, open the agent chat and run `land: <vision>`. The agent elicits the stack, writes `.ai/backlog/stack.md`, and seeds the backlog.

---

## What Gets Installed

`AGENTS.md` is a minimal router: it lists all available skills and loads them on demand. Only `workflow.md` (the 5-phase protocol) is always in context. Everything else activates only when the current cycle needs it.

`CLAUDE.md` sits beside it as a thin pointer that `@`-imports `AGENTS.md`, so Claude Code auto-loads the governance on every session. Other IDEs are wired up by pointing their native config file at the same canonical file (see "Using with other IDEs" below).

> **Note:** If your agent does not pick up the rules automatically, reference `AGENTS.md` at the start of the session.

<details>
<summary><strong>Full tree written by <code>init</code></strong></summary>

```
your-project/
├── AGENTS.md                    ← Main entry point + skill registry (canonical)
├── CLAUDE.md                    ← Thin pointer, auto-loaded by Claude Code
├── .ai/                         ← Instruction set (committed)
│   ├── skills/                  ← Engineering skills (loaded on-demand per cycle phase)
│   │   ├── code-style.md        ← Code style + Work Checklist (Intent + Form), Phase CODE core
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── ... (api-design, data-access, observability, ci-cd, cloud, sql-style, ui-ux)
│   ├── instructions/            ← Flavors, fused delivery competency, templates
│   ├── commands/                ← Cycle commands (feat/fix/docs/audit/land/end)
│   ├── tooling/                 ← Inert tooling bundle (scripts + husky hooks, activate on demand)
│   └── backlog/                 ← Harness Engineering (Memory): versioned knowledge, volatile state gitignored
│       └── ...                  ← (See docs/reference/PROJECT-STRUCTURE.md for details)
```

</details>

> For a detailed breakdown of each file's role, see [Project Structure](docs/reference/PROJECT-STRUCTURE.md).

---

## How the Protocol Works

When you prefix a message to the agent, it enters the corresponding cycle:

| Trigger                        | Cycle           | What happens                                                                                                               |
| :----------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `land: <your vision here>`     | First contact   | Define your project's vision and scope before writing the first line                                                       |
| `feat: <describe the feature>` | Feature         | Walk through SPEC → PLAN → CODE → TEST → END for any new feature                                                           |
| `fix: <describe the problem>`  | Bug fix         | Diagnose the root cause, fix it, and confirm nothing else broke                                                            |
| `docs: <what to document>`     | Documentation   | Write ADRs, changelogs, and technical specs with the right template                                                        |
| `audit: <scope to audit>`      | Audit           | Check whether the governance rules are applied to the project and get back a correction plan                               |
| `end: <optional instruction>`  | Close the cycle | Summarize what was done, update the changelog, and commit. Also recovers a cycle if the agent loses track mid-conversation |
| No prefix                      | n/a             | Agent asks: "land, feat, fix, docs, or audit?", then proceeds                                                              |

The agent **stops and waits for you** three times: at SPEC and at PLAN before writing any code, and again after TEST, where it reports what it verified and you settle the last details before `end:` closes the cycle.

```
  SPEC    the contract        what and why, in writing      ⏸  you approve
   │
  PLAN    the strategy        ordered, followable tasks     ⏸  you approve
   │
  CODE    the execution       the plan, nothing more
   │
  TEST    the verification    built matches agreed          ⏸  you review
   │
  END     the delivery        changelog, backlog, commit    ▸  you type end:
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

Stack is **dynamic, not cataloged**. After `spec-driven-guide init`, run the `land:` cycle to declare the project's languages, runtimes, and framework versions:

```
land: a Node.js + TypeScript API serving a React dashboard
```

The agent asks for your languages and versions, classifies them by role, and writes `.ai/backlog/stack.md`. Phase CODE loads that file on every cycle. No static idiom catalog, no `--idiom` flag.

<details>
<summary><strong>What the <code>land:</code> cycle does, step by step</strong></summary>

1. Asks you to list every language and version (free-form).
2. Classifies each entry by role (Backend / Frontend / Data / Scripts).
3. Offers **optional** enrichment via an allow-list of canonical doc sources (`nodejs.org/api`, `react.dev`, `typescriptlang.org`, `tc39.es`, `docs.astro.build`, `docs.python.org`, `go.dev/doc`, `doc.rust-lang.org`, `kotlinlang.org/docs`, `dart.dev`, `learn.microsoft.com/dotnet`, `developer.apple.com/documentation/swift`).
4. Writes `.ai/backlog/stack.md`, the single source of truth for stack-specific idioms. Edit it directly when versions change; no regen needed.

</details>

---

## Using with other IDEs

`spec-driven-guide` generates a single canonical governance file at `AGENTS.md` in the repo root, plus a `CLAUDE.md` pointer beside it. Codex and Claude Code pick theirs up with no extra step. For other tools, add a one-line pointer in your IDE's native rules file: `Read AGENTS.md before any task.`

<details>
<summary><strong>Native config file, per agent</strong></summary>

| Agent            | Native config file                    | How to wire it                                                        |
| :--------------- | :------------------------------------ | :-------------------------------------------------------------------- |
| Claude Code      | `CLAUDE.md` (root, auto-generated)    | Auto-loaded. No action required.                                      |
| Cursor           | `.cursor/rules/spec-driven-guide.mdc` | Create the file with a single line: `Read AGENTS.md before any task.` |
| Windsurf         | `.windsurfrules`                      | Same pointer line.                                                    |
| GitHub Copilot   | `.github/copilot-instructions.md`     | Same pointer line.                                                    |
| Codex CLI        | `AGENTS.md` (root)                    | Auto-loaded. No action required.                                      |
| Gemini CLI       | `GEMINI.md`                           | Same pointer line.                                                    |
| Cline / Roo Code | `.clinerules`                         | Same pointer line.                                                    |

</details>

> **Prefer a custom preset, voice, or skill?** Paste the skill content into your agent as a prompt, the same way `docs/reference/REFERENCES.md` documents external influences. Custom skills do not require a CLI subcommand.

---

## Maintenance

`npx spec-driven-guide` opens a menu whose **Settings** entry runs the governance audit.

<details>
<summary><strong>If you prefer, run it straight from the CLI</strong></summary>

```bash
npx spec-driven-guide gate       # Review the staged diff against the gate (language-agnostic pre-commit)
npx spec-driven-guide review     # Detect drift between local rules and source
npx spec-driven-guide audit      # Run the governance audit (drift, narrative, code style, hygiene)
npx spec-driven-guide narrative  # Check the changelog narrative on its own
npx spec-driven-guide clear      # Remove the .ai/ folder
```

</details>

---

## Reference

Start with the [Quick Reference (CHEATSHEET)](docs/reference/CHEATSHEET.md) for every CLI flag and agent trigger on one page.

<details>
<summary><strong>Full documentation index</strong></summary>

- [Project Structure](docs/reference/PROJECT-STRUCTURE.md): detailed breakdown of every generated file

- [Architectural Pipelines](docs/reference/PIPELINES.md): data flow diagrams for each flavor

- [Engineering Constitution](docs/concepts/CONSTITUTION.md): the philosophical principles behind the rules (reference only; runtime rules live in `code-style.md`)

- [Spec-Driven Development Guide](docs/concepts/SPEC-DRIVEN-DEV-GUIDE.md): a walkthrough of each phase and its rules

- [Agent Deep-Flow](docs/concepts/AGENT-DEEP-FLOW.md): the internal decision gates and loops

- [UI/UX System](docs/guides/UI-UX.md): design philosophy, hierarchy, surface tonal scale, presets, and external research references

- [Roadmap](docs/ROADMAP.md): shipped milestones and planned extensions

- [Changelog](CHANGELOG.md): current release, with [the archive](docs/CHANGELOG-archive.md) holding every version back to v0.x

- [Token Optimization](docs/guides/TOKEN-OPTIMIZATION.md): cost model, compaction process, and routing efficiency

- [Migration guide](docs/guides/MIGRATION-v3.md): breaking changes and step-by-step migration, v2 through v6

- [Credits and Philosophies](docs/reference/REFERENCES.md): project influences and research credits

</details>

---

> **Warning:** This project is in early development. Review and adjust the installed rules to fit your team's standards before relying on them.

_Balance is the key._

SDG is in constant evolution. There is no perfect solution, only continuous improvement. Feel free to contribute, fork, and share.
