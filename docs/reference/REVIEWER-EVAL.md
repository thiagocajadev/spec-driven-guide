# Reviewer evaluation

This page records how the fresh-context reviewer of `review.md` was tested before it shipped. Read it if you want to know whether the reviewer finds real defects, how much a review costs, and why the Claude Code adapter runs on `sonnet` and not `haiku`. It is a dated record (2026-11-27). Rerun it before you lean on its numbers for another model.

## Fundamental concepts

| Concept                  | What it is                                                                                                                                                               |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fresh-context review** | The second read of an `[M]` or `[L]` change. A reviewer that has not seen the conversation checks the diff against the approved SPEC (`review.md`, Fresh-Context Review) |
| **Reviewer agent**       | The reviewer defined once per harness, with read-only tools, a turn cap and a cheaper model (`tooling/agents/`)                                                          |
| **Planted defect**       | A bug placed on purpose in a change, confirmed by running it, and listed in an answer key the reviewer never sees                                                        |
| **Recall**               | The share of planted defects the reviewer reported                                                                                                                       |
| **False blocking**       | A finding marked `blocking` that does not break the SPEC, correctness or security. The developer still has to answer it at the Review Gate                               |

## How the cases were built

Each case is a small Node.js repository with a base commit, an approved SPEC and a change on top of it. The diff goes to `tmp/review.diff`, as `review.md` prescribes, and the new files are listed by path. Every case keeps its own tests green, as it would after Phase TEST. The tests were written to miss the defects, the way a real author's tests miss what the author did not think of.

Each planted defect was run before the review and its wrong output recorded, so the answer key holds behavior that was observed, not guessed.

| Case                 | SPEC in one line                                                                                                | Planted defects                                                                                                                                                                                    |
| :------------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A, rate limiter      | A token bucket over a shared async store whose `update` is the only atomic write                                | Read, then write across `await`, so two concurrent calls both pass with one token left. Elapsed milliseconds treated as seconds, which refills a thousand times too fast; the refill test hides it |
| B, cursor pagination | Pages walk every order once; limit capped at 100; `nextCursor` null at the end                                  | The cursor repeats the last order of each page. The cap never applies. A full last page still returns a cursor. Bonus: a cursor past the end returns the last order                                |
| C, download path     | Decode the name, refuse anything outside the root, including a sibling folder whose name starts with the root's | `%2e%2e%2Ffiles-private%2Fsecret` escapes to the sibling folder. A malformed encoding throws a raw `URIError` instead of `BAD_NAME`                                                                |
| D, slug              | Strip accents, dash runs, cut at 60 characters                                                                  | None. The case measures false blocking                                                                                                                                                             |
| E, configuration     | `APP_<KEY>` overrides the file; one error lists every missing key; a non-integer `PORT` throws                  | The file overrides the environment. The error names only the first missing key. `PORT` "abc" becomes `NaN`                                                                                         |

That makes 10 required defects and 1 bonus, across concurrency, units, pagination, path security and configuration precedence.

## Results

Each case ran once on the Claude Code `reviewer` agent with its own model (`sonnet`) and once with the model overridden to `haiku` through the Agent tool. Same instructions, same tools, same payload.

| Case             | Sonnet: found            | Haiku: found                            | Sonnet: false blocking | Haiku: false blocking |
| :--------------- | :----------------------- | :-------------------------------------- | :--------------------- | :-------------------- |
| A, rate limiter  | 2 of 2                   | 1 of 2 (missed milliseconds as seconds) | 2                      | 0                     |
| B, pagination    | 3 of 3, plus the bonus   | 3 of 3, plus the bonus                  | 0                      | 0                     |
| C, download path | 2 of 2                   | 2 of 2                                  | 1                      | 0                     |
| D, slug (clean)  | reported clean           | reported clean                          | 0                      | 0                     |
| E, configuration | 3 of 3                   | 3 of 3                                  | 0                      | 0                     |
| Total            | 10 of 10, plus the bonus | 9 of 10, plus the bonus                 | 3                      | 0                     |

Haiku also reported two real bugs outside the key: a `limit` of 0 crashes in case B, and case C never normalizes the root.

**Cost.** The harness reported about 10,000 tokens per review on either model, in 3 or 4 tool calls and 11 to 19 seconds. An earlier run that sent the same instructions to a general-purpose agent took about 61,000 tokens per review. The difference comes from the agent definition: three read-only tools and no `CLAUDE.md` (`omitClaudeMd`). At the list prices of that date, a Haiku token cost about one twentieth of a Sonnet token.

**Format.** Both models restated fidelity defects under code quality at least once, and Haiku closed one report with a verdict paragraph, which the instructions forbid.

## What the results changed

1. **The model.** The Claude Code adapter stays on `sonnet`. The one defect Haiku missed is a silent unit error that tests did not catch, the kind that reaches production. A false blocking costs one declined finding at the Review Gate.
2. **The classification rule.** The instructions now reserve `blocking` for an unmet SPEC item, a correctness bug or a security hole, make a default parameter, a style choice or an unraised risk `optional`, and tell the reviewer to report each finding once, under fidelity when it breaks the SPEC.

A rerun of cases A and C on `sonnet` after that change kept recall at 4 of 4 and moved the default-parameter finding to `optional`. Two findings the reviewer itself called "acceptable" or "minor" stayed `blocking`, and case C still restated one defect under both axes. The rule reduced the noise without removing it, which is why `review.md` asks for an answer to every finding instead of trusting the label.

## Limits of this record

- Five cases and eleven defects show a direction. They do not settle the question statistically.
- Each run happened once. A second run of the same case can find a different set.
- The cases are small, single-purpose changes. Large diffs, documentation-heavy changes and multi-file refactors were not measured. The reviewer's own pass on this feature, a mostly-Markdown change, raised one false blocking finding from an outdated memory of a vendor's file format.
- The `sonnet` and `haiku` aliases resolve to whatever model Claude Code maps them to on the day of the run.

## Reproducing it

1. Build each case as its own git repository: commit a base, apply a change with planted defects, and confirm each defect by running it. Keep the answer key outside the repository.
2. Write the SPEC the way an approved one reads, with its verification checklist.
3. Generate `tmp/review.diff` with `git diff HEAD` and list the new files with `git ls-files --others --exclude-standard`.
4. Hand the SPEC, the diff path and the new file paths to the `reviewer` agent, once per model.
5. Score each report against the key: defects found, `blocking` findings that break nothing, and format.
