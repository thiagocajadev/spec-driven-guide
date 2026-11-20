# Quick reference: commands and triggers

Every CLI command and agent trigger on one page, for the reader who already knows what the tool does and needs the exact syntax. If you are meeting the project for the first time, start at the [README](../../README.md).

---

## Quick Setup

The fastest paths from zero to a governed project:

```bash
# Interactive wizard: walks you through architectural flavor + partner info
npx spec-driven-guide

# Zero-prompt install (lite flavor + stack.md placeholder)
npx spec-driven-guide init --quick

# Non-interactive: vertical-slice (most common)
npx spec-driven-guide init --flavor vertical-slice

# Preview what would be written without touching the filesystem
npx spec-driven-guide init --flavor mvc --dry-run

# Skip scripts/bump.mjs and the bump script in package.json
npx spec-driven-guide init --quick --no-bump

# After cloning a project that already uses SDG (.ai/kit/ is not in git)
npx spec-driven-guide restore
```

After install, open the agent chat and run `land: <one-line vision>`. The agent elicits the stack, writes `.ai/backlog/stack.md`, and seeds the backlog.

---

## Architecture Flavors (`--flavor`)

Select the flavor that matches your project's data flow and structure. The pipeline column is the backend path a request takes through the code, as each flavor file states it in [`src/assets/instructions/flavors/`](../../src/assets/instructions/flavors/):

| Flavor           | Pattern                                 | Pipeline                                                                                  | Use when                       |
| :--------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------- | :----------------------------- |
| `vertical-slice` | Feature-driven vertical cuts            | `Endpoint/Handler → UseCase → Validator → Domain → Repository → Presenter → Response DTO` | Monorepo or domain-heavy API   |
| `mvc`            | Classic layered (Model-View-Controller) | `Request → Controller → Service → Repository → Response`                                  | Standard REST service          |
| `lite`           | Minimal governance scaffold             | Logic at the point of interaction, in a flat module                                       | Small scripts, CLIs, utilities |
| `legacy`         | Refactor-safe bridge patterns           | `Request → UI (Event) → Service → Repository → UI (Response)`                             | Migrating existing codebases   |

```bash
npx spec-driven-guide init --flavor vertical-slice
npx spec-driven-guide init --flavor mvc
npx spec-driven-guide init --flavor lite
npx spec-driven-guide init --flavor legacy
```

---

## Stack Declaration (`land:`)

There is no `--idiom` flag: stack is declared at project inception through the `land:` cycle:

```
land: a Node.js + TypeScript API serving a React dashboard
```

The agent elicits every language/runtime/framework with its version, classifies entries by role (Backend / Frontend / Data / Scripts), optionally enriches via an allow-listed doc fetch, and writes the result to `.ai/backlog/stack.md`. Phase CODE reads that file on every session. Edit it directly when versions change.

### WebFetch allow-list

The agent may only fetch enrichment from the official sources listed in `.ai/kit/commands/sdg-land.md`, one per language plus the security references `audit:` checks. The list lives there alone, so it cannot drift from what the agent reads.

---

## Maintenance Commands

```bash
npx spec-driven-guide gate       # Review the staged diff against the gate (language-agnostic pre-commit)
npx spec-driven-guide review     # Detect drift between local rules and source engine
npx spec-driven-guide restore    # Rebuild .ai/kit/ from the committed manifest
npx spec-driven-guide audit      # Run the governance audit; exits non-zero on any gap
npx spec-driven-guide audit --skip-hygiene  # Same, without lint and tests (when the caller already ran them)
npx spec-driven-guide narrative  # Check the changelog narrative on its own
npx spec-driven-guide clear      # Remove .ai/ and the root files the CLI wrote
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

## Guardrails

Ten constraints the protocol enforces on every cycle. Full text in `.ai/kit/instructions/templates/workflow.md`, rule `Guardrails`.

| Guardrail                | Enforced at                                          |
| :----------------------- | :--------------------------------------------------- |
| Prefix required          | `AGENTS.md` router, no prefix means the agent asks   |
| Mid-cycle classification | `workflow.md`, Mid-cycle Messages                    |
| Assumptions stated       | Phase SPEC, Assumptions                              |
| SPEC and PLAN gates      | Phase SPEC and Phase PLAN, Approval Gate             |
| Form check               | Phase TEST, Form items verified on changed files     |
| Scope lock               | Phase CODE, Plan Adherence                           |
| Blocker surface          | Phase CODE, Blocker Surface                          |
| Circuit Breaker          | Phase TEST, Circuit Breaker                          |
| Commit gate              | Phase END, Commit; `git-guard` hook where installed  |
| Evidence                 | Rule Guardrails, binding SPEC research, TEST and END |

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

The Agent **stops and waits for the Developer** four times: at SPEC and at PLAN before proceeding, after TEST, where it reports the verification and the Developer settles the last details before `end:` runs, and before the commit, which waits for the Developer to approve the message.

- **Broad requests**: PLAN groups the tasks into waves by the files they share, lettered A, B, C, each closed with the tests green.
- **`[M]` and `[L]` changes**: before the TEST stop, a fresh-context review reads the SPEC and the diff, without the conversation, and reports fidelity to the SPEC and code quality apart.

The phases in full: [Spec-Driven Guide](../concepts/SPEC-DRIVEN-GUIDE.md).

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
  FINDINGS   drift against .ai/kit/, checklist violations, canon coverage
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
