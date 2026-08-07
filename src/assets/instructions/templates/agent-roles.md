# Agent Roles & Execution Protocol

## Execution Mindsets

| Role         | Phases                  | Focus                         |
| ------------ | ----------------------- | ----------------------------- |
| **Planning** | SPEC, PLAN, Review, END | Analytical: strategy & design |
| **Fast**     | CODE, TEST              | Operational: execute & verify |

## Baseline: Single-Agent Mode

Standard path for all environments (Cursor, Windsurf, Cline, Gemini, Copilot):

- Execute all phases as single agent.
- **Planning mindset** during SPEC/PLAN (MODE: PLANNING, stop for approval). Focus on analysis/constraints.
- **Fast mindset** during CODE/TEST (MODE: FAST, no strategic detours). Execute the contract only.
- Mode annotations = behavioral discipline markers, not execution boundaries. Do not deviate from approved PLAN during CODE.
- **[LOCKED: COMMIT-GATE]**: Strictly forbidden from `git commit` without explicit verbal approval for the specific commit message. Non-negotiable governance barrier.

## Extension: Multi-Agent Mode (Native Orchestration)

For platforms with `Agent()` tool support:

```
Dev → Planning: SPEC+PLAN → [approval] → spawn Fast: CODE+TEST → return → Planning: Review+Report → [approval] → END
```

**Delegation**: [M]/[L] tasks → always spawn Fast. [S] tasks → Planning executes directly (overhead exceeds benefit).

**Handoff payload**: Approved SPEC + approved PLAN + context refs (standards, style, `.ai/backlog/stack.md`) + deliverable request (tasks completed, Narrative Gate results, test logs, lint status).

**Review gate** (before reporting to Dev):

- Every PLAN task complete
- Narrative Gate passed (Stepdown, SLA)
- Tests pass (no regressions)
- Linter clean

If Fast fails any metric → Planning fixes inline or sends back for single targeted correction (max 1 loop).
