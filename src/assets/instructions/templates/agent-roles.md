# Agent Roles & Execution Protocol

## Execution Mindsets

| Role         | Phases                  | Focus                         |
| ------------ | ----------------------- | ----------------------------- |
| **Planning** | SPEC, PLAN, Review, END | Analytical: strategy & design |
| **Fast**     | CODE, TEST              | Operational: execute & verify |

## Baseline: Single-Agent Mode

The default on every harness:

- Execute all phases as single agent.
- **Planning mindset** during SPEC/PLAN (MODE: PLANNING, stop for approval). Focus on analysis/constraints.
- **Fast mindset** during CODE/TEST (MODE: FAST, no strategic detours). Execute the contract only.
- Mode annotations = behavioral discipline markers, not execution boundaries. Do not deviate from approved PLAN during CODE.
- **Commit gate**: no `git commit` until the developer approves that specific message, in every mode. A commit is where the work leaves the agent's hands; the `git-guard` recipe in `tooling/README.md` enforces it where the harness runs hooks.

## Extension: Multi-Agent Mode (Native Orchestration)

For harnesses that can spawn a subagent:

```
Dev → Planning: SPEC+PLAN → [approval] → spawn Fast: CODE+TEST → return → Planning: Review+Report → [approval] → END
```

**Delegation, by criteria rather than size.** A subagent does not make an answer better by itself: it buys a clean context and parallel hands, and pays for them with a cold start and a handoff. Spawn when one of these holds:

- **Parallel work**: independent tasks that share no files.
- **Noisy output**: a wide search, a long test run, a log read, where the main context needs the conclusion and not the detail.
- **Independent review**: a fresh-context reviewer (`review.md`, Fresh-Context Review), which reads the SPEC and the diff without the author's reasoning.

Otherwise Planning executes directly. A sequential change, whatever its size, is usually cheaper in one context.

**Handoff payload.** A subagent starts cold: it sees neither the conversation nor, on some harnesses, `AGENTS.md`. Everything it needs travels in the payload, by path or verbatim:

- The approved SPEC and PLAN, verbatim, with the tasks it owns marked
- `.ai/kit/instructions/templates/workflow.md`, Phase CODE and Phase TEST
- `.ai/kit/skills/code-style.md` plus the domain skills chosen at CODE entry
- `.ai/backlog/stack.md`, `.ai/backlog/impact-map.md`, and the `test` and `lint` commands from `.ai/backlog/context.md`

**Boundaries.** Fast never commits, never writes under `.ai/backlog/`, and never widens scope. Planning owns `session.md`, `tasks.md` and END, so two agents never write the same file. A blocker returns early as a question, not as a workaround.

**Return**: tasks completed, files changed, `WorkChecklist` Form results, test output, lint status, open blockers.

**Review gate** (before reporting to Dev):

- Every PLAN task complete
- `WorkChecklist` Form items verified on the changed files
- For an [M] or [L] change, a fresh-context review on its two axes (`review.md`), every finding answered
- Tests pass (no regressions)
- Linter clean

If Fast fails any item → Planning fixes inline or sends back one targeted correction. A second failure stops the cycle with a Failure Report to the Dev (Circuit Breaker). Planning then checkpoints `session.md`.
