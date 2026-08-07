# Working Protocol (Spec Driven Design + Token Discipline)

<ruleset name="WorkingProtocol">

## 5 Phases

- **SPEC**: Define what and why. No code until agreement.
- **PLAN**: Ordered task list. Small, clear, followable.
- **CODE**: Follow the plan. Nothing more.
- **TEST**: Verify build matches agreement. Catch problems before ship.
- **END**: Close cycle: changelog, backlog sync, move on.

## Phase Banner

Every turn inside an active cycle opens with one line, before anything else:

`SDG · <intent>: · Phase <NAME> · task <N/total>`

For example: `SDG · fix: · Phase CODE · task 2/5`.

It reads its state from `.ai/backlog/tasks.md`, not from the conversation, which is what lets it survive a new session. One line is the whole cost, and it is what makes a skipped phase visible while it is happening instead of at the review.

## Intent Routing

| Signal    | Action                                     |
| :-------- | :----------------------------------------- |
| `land:`   | `.ai/commands/sdg-land.md` → Land Cycle    |
| `feat:`   | `.ai/commands/sdg-feat.md` → Feature Cycle |
| `fix:`    | `.ai/commands/sdg-fix.md` → Fix Cycle      |
| `docs:`   | `.ai/commands/sdg-docs.md` → Docs Cycle    |
| `end:`    | `.ai/commands/sdg-end.md` → END Phase      |
| `audit:`  | `.ai/commands/sdg-audit.md` → Audit Cycle  |
| No prefix | Ask: "land, feat, fix, docs, or audit?"    |

**Mid-cycle messages**: Q&A (answer+resume), adjustment (update plan+continue), pivot (re-spec), or out-of-scope (defer). Never interpret as new cycle while one is active.

---

## Phase: SPEC → MODE: PLANNING

<rule name="PhaseSPEC">

1. **Intent Classification**: Identify cycle type.
2. **Goal**: One sentence saying what will be built and why.
3. **Domain & Contracts**: Backend/Frontend/Fullstack. Inputs and outputs.
4. **Verification Checklist**: Up to 5 yes/no checkpoints.
5. **Assumptions**: every reading the request left open, stated as a decision taken. `none` is a valid answer; an unstated assumption is not. Where two readings would produce materially different work, ask instead of assuming.
6. **Context Report**: `wc -c` on command + backlog files. Sum bytes / 4 + 4K base. Show: `~N tokens loaded`.
7. **Approval Gate**: Stop. Wait for approval.

</rule>

## Phase: PLAN → MODE: PLANNING

<rule name="PhasePLAN">

1. **Task Breakdown**: Concrete tasks, each starts with action verb.
2. **Logical Sequencing**: Order by dependency.
3. **Effort Tagging**: `[S]` small, `[M]` medium, `[L]` large (must split).
4. **Sub-task Split**: Every `[L]` → numbered steps (1.1, 1.2...).
5. **Backlog Sync**: Save to `.ai/backlog/tasks.md`, mark first as in-progress.
6. **Impact Map**: Write `.ai/backlog/impact-map.md`. `git diff --name-only HEAD` for changed files. Trace imports for dependents. Sections: `## Changed`, `## Blast Radius`, `## Tests at Risk`, `## Safe`.
7. **Cost Estimate**: `wc -c` on Changed + Blast Radius files. Sum / 4 + context + 8K overhead. Show: `Task estimate: ~N tokens`.
8. **Approval Gate**: Stop. Wait for approval.

</rule>

## Phase: CODE → MODE: FAST

<rule name="PhaseCODE">

1. **Work Checklist (BLOCKING)**: Recite `WorkChecklist` from `code-style.md` BEFORE the first `Edit` / `Write` / `NotebookEdit` call. Both sections cited at CODE entry. No write tool fires without it. **Intent** items (binary): Mental Reset, Target Files, Naming, Narrative, Comments, Tests planned, Security, Blockers. **Form** items (binary, verified at TEST): Pure entry point, Narrative Siblings, Explaining Returns, Revealing Module Pattern, Vertical Density, Boolean prefix, No framework abbreviations, No section banners.
2. **Context Load**: Read `code-style.md` + domain skills relevant to the task.
3. **Plan Adherence**: Follow plan. No extras.
4. **Blocker Surface**: Raise blockers immediately. Never work around silently.

> **Circuit Breaker**: Any write tool call without a preceding `Work Checklist` recitation auto-fails Phase TEST; remediation is re-entry into Phase CODE with the checklist emitted.

</rule>

## Phase: TEST → MODE: FAST

<rule name="PhaseTEST">

1. **Checklist Verification**: Every item from Spec's checklist.
2. **Regression Check**: For `fix:`, the bug is gone and nothing else broke. Run the `test` command declared in `context.md`.
3. **Audit Gate**: Modified files vs **Form** section of `WorkChecklist` (`code-style.md`).
4. **Lint Fix**: Run the `lint` command declared in `context.md`, fix what's possible.
5. **Circuit Breaker**: Fail → Phase CODE → re-TEST. Max 3 attempts. 3rd failure → stop + Failure Report.
6. **Report**: Result per checklist item + lint + audit status.

</rule>

## Phase: END → MODE: PLANNING

<rule name="PhaseEND">

1. **Task Summary**: One sentence per completed task.
2. **Changelog**: read `release` in `context.md` first, because the two modes want opposite work. Absent key reads as `manual`.
   - `derived`: **do not touch `CHANGELOG.md`.** The release tooling generates it from the commit subjects and bodies, so the commit body **is** the changelog entry. Writing both creates two sources that drift by the second release. Spend the care on the body.
   - `manual`: ONE entry per completed task under `## [Unreleased]`, which the bump promotes on release.
   - Section mapping, used by both modes: `feat:` → `### Added` | `land:` → `### Added` | `fix:` → `### Fixed` | `docs:` → `### Fixed` | `audit:` → `### Changed`
3. **Backlog Sync**: Finished tasks → `## Done` in `tasks.md`, each as `- [DONE] ...`. Then run `npm run prune`, which keeps the last 3 entries in `## Done` (SSOT for history = CHANGELOG + git log).
4. **Objective Update**: Update `## Now` in `tasks.md` with next objective or clear it.
5. **Map Reset**: Overwrite `impact-map.md` with idle state. Missing → skip.
6. **Lint**: Run linter, block commit if errors remain.
7. **Commit [LOCKED]**: Read `release` in `context.md`. On `derived` (default), skip the bump, since CI computes the version, and propose `<type>: <description>`. On `manual`, run `npm run bump <type>` first, then propose `<type>: release v<version> - <description>`. Either way `git add .` comes before the proposal and `versioning.md`, `VersionControl`, owns the shape. **STOP: await explicit approval before `git commit`.**
8. **Session Gate [HARD STOP]**: Write next objective to `tasks.md`. Stop: _"Cycle complete. Context exhausted. **Open a new session**. Next: [objective]."_

> **SOVEREIGN GATE**: Never bypass human verification for commits.

</rule>

## Rule: Task Handoff

<rule name="TaskHandoff">

`.ai/backlog/tasks.md` is the SSOT for work state. Any agent, any session can continue.

**Checkpoint** (after each atomic task): Mark `- [DONE]` → `## Done`, bullet included, since `prune` only recognizes entries with it. Next task → `## Active` as `- [IN_PROGRESS]` with context note.

The `## Active` entry carries the current phase, which is what the Phase Banner reads. A cycle whose phase lives only in the conversation does not survive a new session, and recovering it costs more than writing it did.

**Proactive Handoff** (approaching limit): Write checkpoint. Announce: _"Approaching context limit. Saved checkpoint. Start new session."_

**Recovery** (tasks.md lost): `git log --oneline -20` → rebuild.

</rule>

## Rule: Token Discipline

<rule name="TokenDiscipline">

**Terse Mode is default.** Maximize technical density. Start with conclusions.

1. **Articles die**: drop "a", "an", "the" where natural.
2. **Filler die**: no "Certainly!", "Great question", no re-summarizing.
3. **Hedging die**: no "I think", "It seems", "Perhaps". State facts or code.
4. **Fragments allowed**: "Fix bug. Task done." > "I have fixed the bug and the task is now done."
5. **Technical integrity preserved**: Never compress paths, code blocks, identifiers.
6. **Pedagogical opt-in**: only when dev asks "why" or "explain".

**Operational:** After END, suggest new session. Use `file:line` refs. Circuit Breaker: stop if same error 3x or no progress in 3 turns.

</rule>

</ruleset>
