# Working Protocol (Spec-Driven Cycle + Token Discipline)

<ruleset name="WorkingProtocol">

## 5 Phases

- **SPEC**: Define what and why. No code until agreement.
- **PLAN**: Ordered task list. Small, clear, followable.
- **CODE**: Follow the plan. Nothing more.
- **TEST**: Verify build matches agreement. Catch problems before ship.
- **END**: Close cycle: changelog, backlog sync, move on.

## Proportion

**The spec scales with the demand. The gates do not.** A typo earns three lines of SPEC; a new
domain earns a contract, its states and its failure modes. Writing a full specification for a
one-line change is ceremony, and ceremony is what makes a protocol get skipped.

What never scales down is the stop before CODE, the stop before commit, and the verification
checklist. A small change nobody approved is still unapproved work, and a change too small to
verify is too small to have been worth making.

## Phase Banner

Every turn inside an active cycle opens with one line, before anything else:

`SDG · <intent>: · Phase <NAME> · task <N/total>`

For example: `SDG · fix: · Phase CODE · task 2/5`. A cycle planned in waves names the wave too: `SDG · feat: · Phase CODE · wave B · task 1/2`.

It reads its state from `.ai/backlog/session.md`, not from the conversation, which is what lets it survive a new session. One line is the whole cost, and it is what makes a skipped phase visible while it is happening instead of at the review.

## Mid-cycle Messages

Prefixes route through `AGENTS.md`. Inside an active cycle, a message is Q&A (answer+resume), adjustment (update plan+continue), pivot (re-spec), or out-of-scope (defer). Never interpret it as a new cycle while one is active.

---

## Phase: SPEC → MODE: PLANNING

<rule name="PhaseSPEC">

1. **Intent Classification**: Identify cycle type.
2. **Goal**: One sentence saying what will be built and why.
3. **Domain & Contracts**: Backend/Frontend/Fullstack. Inputs and outputs.
4. **Verification Checklist**: Up to 5 yes/no checkpoints.
5. **Assumptions and questions**: settle every fact the repository can answer by reading it, then state each reading the request left open as a decision taken. `none` is a valid answer; an unstated assumption is not. Where two readings would produce materially different work, ask instead of assuming: numbered questions, decisions only, each with the answer you recommend and why, so the developer can settle them in one line.
6. **Approval Gate**: Stop. Wait for approval.

</rule>

## Phase: PLAN → MODE: PLANNING

<rule name="PhasePLAN">

1. **Task Breakdown**: Concrete tasks, each starts with action verb.
2. **Logical Sequencing**: Order by dependency.
3. **Effort Tagging**: `[S]` small, `[M]` medium, `[L]` large (must split).
4. **Sub-task Split**: Every `[L]` → numbered steps (1.1, 1.2...).
5. **Waves** (broad requests only): when one cycle takes several items or domains, group the tasks into waves by the files they share, so each file is edited once instead of once per item. Waves run in dependency order, each is lettered with its tasks numbered inside it (A1, A2, B1...), and each ends with the `test` command green, which keeps a break inside the wave that caused it. A cycle with one item has no waves; the plan is a plain list.
6. **Session Sync**: Write the objective to `## Now` and the task list to `## Active` in `.ai/backlog/session.md`, first task `[IN_PROGRESS]` with its phase. The plan is this developer's working state, so it stays out of the versioned `tasks.md` until END records the outcome.
7. **Impact Map**: Write `.ai/backlog/impact-map.md`. `## Changed` lists the files the tasks will touch; trace their imports for `## Blast Radius`, then `## Tests at Risk` and `## Safe`.
8. **Approval Gate**: Stop. Wait for approval.

</rule>

## Phase: CODE → MODE: FAST

<rule name="PhaseCODE">

1. **Context Load**: Read `code-style.md` and the domain skills the task touches. The Form items of its `WorkChecklist` are what TEST verifies on every changed file, so the code takes that shape from its first line.
2. **Plan Adherence**: Follow plan. No extras.
3. **Blocker Surface**: Raise blockers immediately. A workaround found in silence is a decision the developer never saw.
4. **Delegation**: handing CODE and TEST to a subagent? Load `.ai/kit/instructions/templates/agent-roles.md` first. Otherwise skip it.

</rule>

## Phase: TEST → MODE: FAST

<rule name="PhaseTEST">

1. **Checklist Verification**: Every item from Spec's checklist.
2. **Regression Check**: For `fix:`, the bug is gone and nothing else broke. Run the `test` command declared in `context.md`.
3. **Audit Gate**: Modified files vs **Form** section of `WorkChecklist` (`code-style.md`).
4. **Lint Fix**: Run the `lint` command declared in `context.md`, fix what's possible.
5. **Circuit Breaker**: Fail → Phase CODE → re-TEST. An ordinary obstacle (a failing test, a wrong path, a missing import) is diagnosed and fixed. A deliberate blocker (a denied permission, a hook refusal, a gate, a decision the SPEC left open) is a stop: ask, because getting around it undoes the reason it exists. Max 3 attempts; the 3rd failure stops with a Failure Report.
6. **Report**: Result per checklist item + lint + audit status, grouped by wave when the plan has waves.
7. **Review Gate**: Stop. For an [M] or [L] change, a fresh-context review on two axes, fidelity to the SPEC and code quality, runs first (`review.md`, Fresh-Context Review). The developer reviews the result and settles the last details. END runs only on `end:` or an explicit go-ahead.

</rule>

## Phase: END → MODE: PLANNING

<rule name="PhaseEND">

1. **Task Summary**: One sentence per completed task.
2. **Changelog**: read `release` in `context.md` first, because the two modes want opposite work. Absent key reads as `manual`.
   - `derived`: **do not touch `CHANGELOG.md`.** The release tooling generates it from the commit subjects and bodies, so the commit body **is** the changelog entry. Writing both creates two sources that drift by the second release. Spend the care on the body.
   - `manual`: ONE entry per completed task under `## [Unreleased]`, which the bump promotes on release.
   - Section mapping, used by both modes: `feat:` → `### Added` | `land:` → `### Added` | `fix:` → `### Fixed` | `docs:` → `### Fixed` | `audit:` → `### Changed`
3. **Backlog Sync**: The cycle → one `- [DONE] ...` entry under `## Done` in `tasks.md`; remove its `## Backlog` item if it came from the queue. Then run `node .ai/kit/tooling/scripts/prune-backlog.mjs`, which keeps the last 3 entries in `## Done` (history lives in CHANGELOG + git log). A lesson worth keeping goes to `learned.md`, a failure with its cause to `troubleshoot.md`, and neither goes to the harness memory store: `AGENTS.md`, Persistence Policy.
4. **Session Reset**: Clear `## Active` in `session.md`. Set `## Now` to the next objective, or leave it empty.
5. **Map Reset**: Overwrite `impact-map.md` with idle state. Missing → skip.
6. **Commit**: Read `release` in `context.md`. On `derived`, skip the bump, since CI computes the version, and propose `<type>: <description>`. On `manual`, run the `bump` command from `context.md` first (absent: `npm run bump <type>`), then propose `<type>: release v<version> - <description>`. Stage only the files this cycle changed (impact map `## Changed`, plus CHANGELOG and backlog), not `git add .`, which sweeps in whatever else sits in the tree. `versioning.md`, `VersionControl`, owns the shape. Then stop until the developer approves that message. This holds in every mode, unattended runs included: a commit is where the work leaves the agent's hands, and one nobody read becomes history anyway.
7. **Session Gate**: Stop: _"Cycle complete. Open a new session. Next: [objective]."_

</rule>

## Rule: Guardrails

<rule name="Guardrails">

What the protocol takes off the agent's hands, so the developer is not the one catching it in review.

| Guardrail                    | What it prevents                                                                      | Enforced by                                      |
| :--------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------- |
| **Prefix required**          | A cycle guessed from a loose ask. No prefix, ask which one                            | advisory                                         |
| **Mid-cycle classification** | A follow-up message silently reopening the cycle as a new one                         | advisory                                         |
| **Assumptions stated**       | An unstated reading shipped as the request. Two readings that diverge materially: ask | advisory                                         |
| **SPEC and PLAN gates**      | Code written before the contract is agreed                                            | advisory                                         |
| **Form check**               | Code that drifts from the standards reaching review                                   | `audit` Code Style check and the ESLint rules    |
| **Scope lock**               | The refactor nobody asked for, riding along with the fix                              | advisory                                         |
| **Blocker surface**          | A workaround invented in silence instead of a question asked out loud                 | advisory                                         |
| **Circuit Breaker**          | The loop: 3 failed TESTs, 3 identical errors, or 3 turns without progress, then stop  | advisory; a Stop hook can cap continuations      |
| **Commit gate**              | A commit the developer never approved, or a push nobody reviewed                      | `git-guard` hook and an `ask` permission, if set |
| **Evidence**                 | A claim about this codebase asserted from memory                                      | advisory                                         |

**Advisory or enforced.** An advisory gate is text the model reads and follows; an enforced one is a check outside the model that refuses. The text stays either way, as the reason the check exists. A gate that has to hold every time, on every harness that supports it, gets its hook: `tooling/README.md` carries the `git-guard` recipe for the commit gate.

**Unattended runs.** A run with no developer between turns (a `/goal`, a loop, a scheduled agent) starts only with four things written down: a done condition a command can verify, the scope it may touch, a cap on turns or spend, and who signs off the result. The harness enforces them (`/goal`, a Stop hook that runs the done check, the permission mode); the protocol does not reimplement them. Automatic continuations stop after three without progress, and the run ends at a proposed commit, never a pushed one.

**Evidence, in full.** A statement about this repository is grounded in a file read this session and carries its `file:line`, or it ships marked unverified. Absent means unverified: not read is not the same as not there, and "I did not check" is a cheap and valid answer. This binds the research behind a SPEC, the report that closes TEST, and the summary at END. Outside the repository, only the `land:` allow-list is fetchable, and a source is never invented.

**What none of this does.** No instruction stops a model from being confident. These rules narrow where confidence can do damage and make an ungrounded claim visibly irregular. The checks that hold on their own are mechanical: the tests, the linter, `audit:`, the hooks.

</rule>

## Rule: Task Handoff

<rule name="TaskHandoff">

`.ai/backlog/session.md` is the SSOT for where the cycle stopped, and `.ai/backlog/tasks.md` for the queue behind it. Any agent, any session can continue.

**Checkpoint** (after each atomic task): In `## Active` of `session.md`, mark the finished task done and the next one `- [IN_PROGRESS]` with a context note. The end of a wave is the natural point to hand over to a new session, since the suite is green there. `tasks.md` is written once, at END.

The `## Active` entry carries the current phase, which is what the Phase Banner reads. A cycle whose phase lives only in the conversation does not survive a new session, and recovering it costs more than writing it did.

**Proactive Handoff** (approaching limit): Write checkpoint. Announce: _"Approaching context limit. Saved checkpoint. Start new session."_

**Recovery** (session.md lost): `git log --oneline -20` → rebuild.

</rule>

## Rule: Token Discipline

<rule name="TokenDiscipline">

**Terse Mode covers working notes**: progress lines, tool narration, the chat between steps. SPEC, PLAN, the TEST report, the END summary and any handoff are read later by someone who lacks this context (a developer, a reviewer, a fresh session), so they are written in full sentences, conclusions first, every term defined once.

In working notes:

1. **Articles die**: drop "a", "an", "the" where natural.
2. **Filler die**: no "Certainly!", "Great question", no re-summarizing.
3. **Hedging die**: no "I think", "It seems", "Perhaps". State facts, or mark the claim unverified.
4. **Fragments allowed**: "Fix bug. Task done." > "I have fixed the bug and the task is now done."
5. **Technical integrity preserved**: paths, code blocks and identifiers stay whole, since a compressed path is a wrong path.
6. **Pedagogical opt-in**: only when dev asks "why" or "explain".

**Operational:** After END, suggest new session. Use `file:line` refs.

</rule>

</ruleset>
