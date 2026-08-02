# Technical Documentation

Executing documentation for: $ARGUMENTS.

> **Load now**: `.ai/instructions/templates/workflow.md`, `.ai/skills/writing-soul.md`, `.ai/skills/checklist-soul.md`
> **Load also**, when the cycle touches a README: `.ai/skills/writing-readme.md`. It governs the banner above the first paragraph; the soul governs every line below it.

## Phase: SPEC — MODE: PLANNING

Follow Phase SPEC from Working Protocol. Drafting templates:

**CHANGELOG** (Keep a Changelog): `## [vX.Y.Z] - YYYY-MM-DD` with Added/Changed/Fixed/Removed sections.

**FEAT** (Feature Spec): `# FEAT-[NNN]: [Name]` with Status, Goal, Context, Solution, Verification.

**ADR** (Architecture Decision Record): `# ADR-[NNN]: [Title]` with Context (Why), Decision (What), Consequences (Impact).

## Phase: END — MODE: PLANNING

Follow Phase END from Working Protocol. Documentation must mirror code state. Sync backlog and WAIT for authorization before any commit/push.

**Promotion (before the backlog sync).** Every voice defect the developer corrected this cycle gets distilled and promoted, or the canon and the project's notes become two sources that drift apart:

| What was learned                                 | Where it goes                                                          |
| :----------------------------------------------- | :--------------------------------------------------------------------- |
| A defect class not yet named                     | `.ai/skills/writing-soul.md`, as a class plus the test that detects it |
| A concrete instance in one language              | `.ai/skills/lexicon/<language>.md`, under that class name              |
| A one-off preference with no class behind it yet | stays in `learned.md` until it recurs                                  |

`learned.md` keeps the evidence and the history. It never keeps the canon.

> No CODE phase — Fast is never invoked. All phases run under Planning role.
> Read `.ai/instructions/templates/agent-roles.md` for full protocol.
