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
- **[LOCKED: COMMIT-GATE]**: Strictly forbidden from `git commit` without explicit verbal approval for the specific commit message. Non-negotiable governance barrier.

## Extension: Multi-Agent Mode (Native Orchestration)

For harnesses that can spawn a subagent:

```
Dev → Planning: SPEC+PLAN → [approval] → spawn Fast: CODE+TEST → return → Planning: Review+Report → [approval] → END
```

**Delegation**: [M]/[L] tasks → spawn Fast. [S] tasks → Planning executes directly (overhead exceeds benefit).

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
- Tests pass (no regressions)
- Linter clean

If Fast fails any item → Planning fixes inline or sends back one targeted correction. A second failure stops the cycle with a Failure Report to the Dev (Circuit Breaker). Planning then checkpoints `session.md`.
