# Incident Correction

Correcting incident: $ARGUMENTS.

> **Load now**: `.ai/instructions/templates/workflow.md`

## Phase: SPEC → MODE: PLANNING

Follow Phase SPEC. Context charges:

- **Intent**: `fix:`
- **Goal**: Highlight incident and core reason for fix.
- **Domain & Contracts**:
  - **RCA**: Identify layer, file, line where contract/logic breaks.
  - **Observed vs Expected**: Contrast broken behavior with desired outcome.
  - **Minimal Surface**: Fix targets ONLY the bug. No refactors.
- **Verification**: Reproduction Case is primary validator.

## Phase: PLAN → MODE: PLANNING

Follow Phase PLAN with mandatory addition:

- **Regression Test**: Task for Characterization Test that reproduces the bug. Use patterns from `testing.md`.

> Read `.ai/instructions/templates/agent-roles.md` for multi-agent handoff protocol.
