# Code Review: Practice & Craft

<ruleset name="CodeReviewCraft">

> Load in **Phase CODE** when reviewing pull requests, or in any task that produces a PR/MR for human review.

---

## PR Craft (the author's contract with the reviewer)

| Aspect            | Rule                                                                                                  |
| :---------------- | :---------------------------------------------------------------------------------------------------- |
| Scope             | One concern per PR. Mixing refactor + feature blocks the reviewer.                                    |
| Size              | ≤ 400 changed lines target; > 600 lines = split before requesting review.                             |
| Title             | Imperative + intent: `fix: prevent N+1 in OrderRepo`. No "WIP" / "Final" suffixes.                    |
| Description       | What changed, **why**, how to verify. Reference issue / incident SHA when fix-on-incident.            |
| Diff hygiene      | Squash WIP commits before review. Each commit compiles + tests green.                                 |
| Self-review first | Read the diff yourself before requesting review. Strip noise (comments, debug prints, dead branches). |

---

<rule name="ReviewerChecklist">

## Reviewer Checklist (binary, in this order)

> Recite at the start of every review. Stop at the first unmet item; ask the author to fix before continuing.

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
