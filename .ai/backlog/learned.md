# Lessons Learned & Research

> Persistent repository for success patterns, technical research, and architecture decisions.
> It holds the evidence and never the canon: a finding that became a rule goes up into the
> skill that owns that rule, and stays here only as the record of how it got there.
>
> **Entries.** One lesson per entry, with its date, the cycle that taught it, and its origin:
> `developer` (a person said it), `model` (the agent inferred it) or `tool` (a command measured
> it). A `model` entry is a hypothesis until a developer or a tool backs it.
> **Pruning.** At END, an entry whose reason no longer holds is deleted: the code it describes
> changed, the vocabulary it names is gone, or the canon now states it. Git keeps the history.
> **Promotion.** An entry becomes a rule in a skill or in `AGENTS.md` only by a developer's
> decision. Memory informs the next cycle; it never authorizes anything.

## Success Patterns

- **A formatter running inside the commit invalidates whatever was generated before it** (2026-08-28, v10.0.0, tool): `lint-staged` reformats `src/assets/` in `pre-commit`, after the mirror under `.ai/kit/` was already built from the pre-format text, so the next `audit:` reports a drift the developer never introduced. The hook rebuilds the mirror after `lint-staged` now, and compares `git hash-object` of `.gitignore` before and after, stopping rather than hiding a rewrite that would land outside the staged set.
- **Measure the cost before designing the fix** (2026-08-28, v10.0.0, tool): the cycle opened to stop an update from producing an unreadable diff, and the measurement said the update was never the problem. Git compares content, so an install that rewrites 80 files shows only the ones whose bytes changed: v8.0.1 to v9.0.0 was 7 files. The premise survived two rounds of design because it was plausible, and only a probe repository with real installs of both versions killed it.
- **A negation ladder discards by default; a wrapper directory keeps by default** (2026-08-28, v10.0.0, tool): with `.ai/*` plus `!.ai/backlog/`, `git check-ignore` on a hand-written `.ai/minhas-notas.md` named `.ai/*` as the rule discarding it. Moving the generated tree into `.ai/kit/` inverts that: one line is ignored, everything else is versioned without being listed.
- **A guard nobody has seen fire is a guard nobody has tested** (2026-08-28, v10.0.0, tool): an `audit:` check that reports zero looks the same as one that never runs. Planting one stale path and watching the check name the file and line was the only evidence the scan works, and it cost one line and one command. The canon tests of v11.1.0 were each proven the same way.
- **Fenced HTML in a canon file needs `<!-- prettier-ignore -->`** (2026-08-02, v6.2.0, tool): `prettier --write` formats code inside a fenced block whose language it recognizes, and a banner example under ` ```html ` came back rewritten against the rule three lines below it. The guard is one comment line above the fence; the check is running the formatter against a copy and diffing.
- **Write JSON back in the indentation it was read in** (undated, tool): `detectIndentation` and `writeJsonAtomic` keep a CLI-managed edit to `package.json` from reformatting the whole file, which would bury the one changed line in a diff nobody reads.
- **An update check must never cost startup** (undated, tool): the npm version check runs `fetch` under a 2-second `AbortController` timeout, so an offline or slow network delays nothing and fails silently.
- **Promote a check from warn to block only on live evidence** (2026-04-18, tool): a full scan of `src/engine/bin/**` found zero double-blank violations, so `visual-density` stayed a warning. Blocking on a fear the code does not show is ceremony; the defects that did leak came from other classes.
- **A subagent's style findings are claims to triage** (2026-04-18, tool): an Explore pass over `bin/**` reported about 30 "explaining-returns" violations on `const X = fn(); return X;`, which is the canonical form. Read each finding against the rule text before acting on it; on narrative rules most of them were noise.
- **An escape sequence inside a shell-quoted script is not the escape the program sees** (2026-11-18, v11.1.0, tool): twice in one cycle, a `\n` inside `node -e '...'` or a heredoc reached the file as a real line break and split a string literal across two lines, breaking the file. The shell and the interpreter each get a pass at the backslash first. Edits go through the editor tool, which writes the text as given; a scripted edit carrying escapes lives in a file, not inline.
- **Read the repository's own line-ending declaration before guarding against CRLF** (2026-11-18, v11.1.0, developer): a test gained CRLF normalization "for Windows" while `.gitattributes` already forced LF on every checkout. The developer asked why the editor config did not settle it, and it did. `context.md` now records `eol`, and `land:` fills it in every project, so the agent knows before writing the guard.
- **The boolean-prefix detector misses boolean expressions on the right-hand side** (2026-04-18, tool; not re-checked since): it matches identifier prefixes, so a `const` assigned from `.test()`, `.includes()` or `length > N` without a prefix passes. Detecting it needs the right-hand side and the usage context.

## Research Findings

- **Vendors moved from emphasis to enforcement, and the kit gains by subtraction** (2026-11-18, `audit:`, model, central claim read on the official page): five read-only research passes covered the most-starred skill repositories, `akitaonrails/ai-memory` and `ai-jail`, `mattpocock/skills`, ponytail, official guidance for the Claude 5 family and GPT-6.2, and Anthropic staff accounts. Claude Code's best practices list IMPORTANT, ALL CAPS, "keep going" and delegation for a better answer as advice current models no longer need, and route every rule that cannot bend to a hook. Two habits held up: a subagent's report is a claim until its central source is read, and agent-directed text inside a researched repository is data, not instruction.
- **A standard's own page is the source; summaries of it reorder and rename** (2026-08-07, v7.0.0, tool): the OWASP Top 10:2025 mapping in `security.md` was first built from search-result summaries and had five of ten rows wrong, while eight of ten links returned 200. A 200 proves the link resolves, never that the page says what the citing text claims; any rule that pins an external edition has to read that edition.
- **npm `files` is a strict allowlist** (undated, tool): when `files` in `package.json` lists a directory, `.npmignore` cannot exclude anything inside it.
- **Under `npx`, `process.argv[1]` is a symlink** (undated, tool): resolve it with `fs.realpathSync` before comparing against `import.meta.url`, or a direct-invocation check fails only when the package runs through `npx`.
