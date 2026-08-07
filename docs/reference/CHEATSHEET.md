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

| Trigger               | Cycle   | Intent                                                                                                                                              |
| :-------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `land: <description>` | Land    | Project inception: vision + stack declaration + sequenced `feat:` backlog, no code written.                                                         |
| `feat: <description>` | Feature | New implementation: requires SPEC and PLAN approval before any code.                                                                                |
| `fix: <description>`  | Fix     | Bug resolution: Root Cause Analysis and regression test mandatory.                                                                                  |
| `docs: <description>` | Docs    | Technical memory sync: Changelogs, ADRs, Specs.                                                                                                     |
| `audit: <scope>`      | Audit   | Verify project alignment against rulesets (drift detection).                                                                                        |
| `end:`                | n/a     | Close the active cycle: runs the END Phase checklist (changelog, backlog, commit). Also recovers a cycle if the agent loses track mid-conversation. |
| No prefix             | n/a     | Agent asks: "land, feat, fix, docs, or audit?", then proceeds.                                                                                      |

> `end:` takes no argument.

---

## Standard Lifecycle

Every `feat:`, `fix:`, and `docs:` task follows this sequence:

```
SPEC  →  PLAN  →  CODE  →  TEST  →  END
  ↑           ↑                       ↑
  Wait        Wait                 "end:"
```

The Agent **stops and waits for explicit Developer approval** at SPEC and PLAN before proceeding.

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
