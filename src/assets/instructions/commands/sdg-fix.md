# Incident Correction

Correcting incident: $ARGUMENTS.

> **Load now**: `.ai/kit/instructions/templates/workflow.md`

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

- **Regression Test**: Task for Characterization Test that reproduces the bug. Use patterns from `testing.md`. It fails before the fix and passes after; a test written once the bug is gone has never been seen to catch it.

## Phase: END

The `troubleshoot.md` entry for this incident names the regression test that pins it, by file and test name. Every past incident then sits in the suite as a case that runs on every change, and an entry with no test is a failure the project only remembers.
