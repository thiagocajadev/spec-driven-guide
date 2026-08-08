# Quick reference: commands and triggers

Every CLI command and agent trigger on one page, for the reader who already knows what the tool does and needs the exact syntax. If you are meeting the project for the first time, start at the [README](../../README.md).

---

## Quick Setup

The fastest paths from zero to a governed project:

```bash
# Interactive wizard: walks you through architectural flavor + partner info
npx sdg-agents

# Zero-prompt install (lite flavor + stack.md placeholder)
npx sdg-agents init --quick

# Non-interactive: vertical-slice (most common)
npx sdg-agents init --flavor vertical-slice

# Preview what would be written without touching the filesystem
npx sdg-agents init --flavor mvc --dry-run
```

After install, open the agent chat and run `land: <one-line vision>`. The agent elicits the stack, writes `.ai/backlog/stack.md`, and seeds the backlog.

---

## Architecture Flavors (`--flavor`)

Select the flavor that matches your project's data flow and structure:

| Flavor           | Pattern                                 | Use When                       |
| :--------------- | :-------------------------------------- | :----------------------------- |
| `vertical-slice` | Feature-driven vertical cuts            | Monorepo or domain-heavy API   |
| `mvc`            | Classic layered (Model-View-Controller) | Standard REST service          |
| `lite`           | Minimal governance scaffold             | Small scripts, CLIs, utilities |
| `legacy`         | Refactor-safe bridge patterns           | Migrating existing codebases   |

```bash
npx sdg-agents init --flavor vertical-slice
npx sdg-agents init --flavor mvc
npx sdg-agents init --flavor lite
npx sdg-agents init --flavor legacy
```

---

## Stack Declaration (`land:`)

There is no `--idiom` flag: stack is declared at project inception through the `land:` cycle:

```
land: a Node.js + TypeScript API serving a React dashboard
```

The agent elicits every language/runtime/framework with its version, classifies entries by role (Backend / Frontend / Data / Scripts), optionally enriches via an allow-listed doc fetch, and writes the result to `.ai/backlog/stack.md`. Phase CODE reads that file on every session. Edit it directly when versions change.

### WebFetch allow-list

The agent may only fetch enrichment from these canonical sources:

| Language / Framework    | Source                                     |
| :---------------------- | :----------------------------------------- |
| JavaScript / ECMAScript | `tc39.es/ecma262/`                         |
| TypeScript              | `typescriptlang.org/docs/`                 |
| Node.js                 | `nodejs.org/api/`                          |
| React                   | `react.dev/reference/`                     |
| Astro                   | `docs.astro.build/`                        |
| Python                  | `docs.python.org/3/`                       |
| Go                      | `go.dev/doc/`                              |
| Rust                    | `doc.rust-lang.org/stable/`                |
| Kotlin                  | `kotlinlang.org/docs/`                     |
| Dart / Flutter          | `dart.dev/guides`, `docs.flutter.dev/`     |
| .NET / C#               | `learn.microsoft.com/dotnet/`              |
| Swift                   | `developer.apple.com/documentation/swift/` |

---

## Maintenance Commands

```bash
npx sdg-agents gate       # Review the staged diff against the gate (language-agnostic pre-commit)
npx sdg-agents review     # Detect drift between local rules and source engine
npx sdg-agents audit      # Run the governance audit (drift, narrative, code style, hygiene)
npx sdg-agents narrative  # Check the changelog narrative on its own
npx sdg-agents clear      # Remove the entire .ai/ governance layer
```

---

## Instruction Triggers (AI Agent)

Prefix your message to the AI Agent to activate the corresponding governance cycle:

| Trigger                        | Cycle           | Intent                                                                                                                      |
| :----------------------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `land: <your vision here>`     | First contact   | Define your project's vision and scope before writing the first line.                                                       |
| `feat: <describe the feature>` | Feature         | Walk through SPEC → PLAN → CODE → TEST → END for any new feature.                                                           |
| `fix: <describe the problem>`  | Bug fix         | Diagnose the root cause, fix it, and confirm nothing else broke.                                                            |
| `docs: <what to document>`     | Documentation   | Write ADRs, changelogs, and technical specs with the right template.                                                        |
| `audit: <scope to audit>`      | Audit           | Check whether the governance rules are applied to the project and get back a correction plan.                               |
| `end: <optional instruction>`  | Close the cycle | Summarize what was done, update the changelog, and commit. Also recovers a cycle if the agent loses track mid-conversation. |
| No prefix                      | n/a             | Agent asks: "land, feat, fix, docs, or audit?", then proceeds.                                                              |

> The argument after `end:` is optional. Bare `end:` runs the END checklist; anything after it is context for that closure.

---

## Standard Lifecycle

Every `feat:`, `fix:`, and `docs:` task follows this sequence. For `land:` and `audit:`, see Governance Cycles below.

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

The Agent **stops and waits for the Developer** three times: at SPEC and at PLAN before proceeding, and again after TEST, where it reports the verification and the Developer settles the last details before `end:` runs.

---

## Governance Cycles

`land:` and `audit:` do not touch code, and they are not meant to. Their output is the task list the coding cycles read afterwards: `land:` writes that list when the project starts, `audit:` rewrites it when the project has drifted away from its own rules. Neither runs the five phases above, so each one is drawn on its own below.

Both close with `end:` like any other cycle, which is what writes the changelog entry and proposes the commit.

<details>
<summary><strong>How <code>land:</code> runs</strong></summary>

Once per project, before the first `feat:`. Its phases are its own, and none of them is CODE:

```
  VISION     what is being built, for whom, and the core problem
   │
  SURVEY     the existing code, on legacy projects only
   │
  SCOPE      the MVP boundary, with what is out named explicitly
   │
  STACK      languages and versions, written to stack.md
   │
  BACKLOG    epics split into sequenced feat: tasks
   │
  STOP       vision, scope, stack and epics, presented              ⏸  you approve
```

What you get back: `stack.md` for Phase CODE to load on every later cycle, and a `tasks.md` whose entries are already shaped as the `feat:` prefixes you will type next.

</details>

<details>
<summary><strong>How <code>audit:</code> runs</strong></summary>

Phase SPEC, and it stops there. Nothing is repaired inside the audit:

```
  SCOPE      full codebase, one layer, or doc alignment
   │
  FINDINGS   drift against .ai/, law violations, canon coverage
   │
  PLAN       every gap as an actionable correction task             ⏸  you approve
```

What you get back: each finding as a task you can run as its own `fix:` or `feat:` cycle. Keeping the report separate from the repair is what leaves every change traceable to the cycle that made it.

</details>

---

## Developer vs AI Agent

| Responsibility                           | Developer | AI Agent |
| :--------------------------------------- | :-------: | :------: |
| Run CLI commands (`init`, `audit`, etc.) |    ✅     |    -     |
| Declare the stack during `land:`         |    ✅     |    -     |
| Approve SPEC and PLAN                    |    ✅     |    -     |
| Execute CODE and TEST phases             |     -     |    ✅    |
| Update CHANGELOG and backlog             |     -     |    ✅    |
| Propose commit message                   |     -     |    ✅    |
| Authorize commit and push                |    ✅     |    -     |

---

> Developers approve decisions. Agents execute them.
