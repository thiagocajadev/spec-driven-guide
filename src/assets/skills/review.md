---
name: review
description: PR craft, the reviewer checklist and the fresh-context review. Load when reviewing a pull request, producing one for human review, or running the Review Gate on an [M] or [L] change.
---

# Code Review: Practice & Craft

<ruleset name="CodeReviewCraft">

---

## PR Craft (the author's contract with the reviewer)

| Aspect            | Rule                                                                                                                 |
| :---------------- | :------------------------------------------------------------------------------------------------------------------- |
| Scope             | One concern per PR. Mixing refactor + feature blocks the reviewer.                                                   |
| Size              | ≤ 400 changed lines target; > 600 lines = split before requesting review.                                            |
| Title             | Same grammar as a commit subject, see `versioning.md`: `fix: prevent N+1 in OrderRepo`. No "WIP" / "Final" suffixes. |
| Description       | What changed, **why**, how to verify. Reference issue / incident SHA when fix-on-incident.                           |
| Diff hygiene      | Squash WIP commits before review. Each commit compiles + tests green.                                                |
| Self-review first | Read the diff yourself before requesting review. Strip noise (comments, debug prints, dead branches).                |

---

<rule name="ReviewerChecklist">

## Reviewer Checklist (binary, in this order)

> Work through it in order. Stop at the first unmet item and ask the author to fix it before continuing, since everything after it reviews code that is about to change.

- [ ] **Scope**: does the PR do what its title claims? Out-of-scope changes flagged or split.
- [ ] **Tests**: every new function tested; bug fix has regression test; AAA explicit (see `testing.md`).
- [ ] **Security**: boundary inputs validated; no string-concat into queries / commands / paths; no `.env` committed (see `security.md`).
- [ ] **Naming**: banned verbs / nouns / abbreviations absent; booleans carry semantic prefix (see `code-style.md`).
- [ ] **Narrative**: Stepdown, SLA, Explaining Returns; ≤2 indent levels; no `// --- Section ---` banners.
- [ ] **Density**: 1 blank between groups, 0 within; no walls of tight code; no double blanks.
- [ ] **Comments**: WHY-only one-liner; no drift accumulation; no stale `// update:` chains.
- [ ] **Lint + audit**: green before requesting review; reviewer is not the linter.

</rule>

---

<rule name="FreshContextReview">

## Fresh-Context Review

The agent that wrote the code reads its own intent into the diff. A fresh context, meaning a subagent, a new session, or a developer who has not seen the conversation, reads only what is there. That is what makes a second read worth paying for: delegating the same reasoning to another agent does not improve it, an independent reader does.

- **When it earns its cost**: an [M] or [L] change, anything touching auth, data or money, or a change its author is unsure of. A typo does not need one.
- **What the reviewer receives**: the approved SPEC and the diff. Not the conversation and not the author's summary, which is the reading the review exists to check.
- **Two axes, reported apart**:
  1. **Fidelity to the SPEC**: each verification item met or not, with `file:line`; anything in the diff the SPEC did not ask for; anything the SPEC asked for that the diff lacks.
  2. **Code quality**: the Reviewer Checklist above, plus correctness bugs.
- **Every finding gets an answer**: fixed, or declined with a reason. A finding nobody answered is still open at the Review Gate.

On a harness with subagents, the handoff payload in `agent-roles.md` applies, with the SPEC and the diff in place of the PLAN.

</rule>

## Review Tone

- **Kind, specific, actionable.** Vague "this could be better" wastes both sides.
- **Suggest, don't dictate.** `Consider X because Y` > `Change to X`.
- **Block only what blocks shipping.** Style/preference → optional. Bug / security / correctness → blocking.
- **Rubber-stamp ≠ review.** If the diff is too large to read, ask for a split. Approving without reading is a trust break.

## Anti-Patterns

- **Bikeshedding**: formatter-territory comments. Defer to the formatter, not human review.
- **Multi-day review backlogs**: block author flow. Aim ≤24h response on small PRs.
- **Mixed-concern PRs**: refactor + feature in one diff doubles review time.
- **"LGTM with comments"**: either approve or request changes; don't half-merge.
- **Approving by author count**: two stamps without two reads is one review, not two.

</ruleset>
