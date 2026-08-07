# Changelog archive (v0.x through v5.x)

> Historical entries retired from the main `CHANGELOG.md`, newest first.
> Wording is kept as originally written, including legacy paths (`.ai-backlog/`, `.ai/skill/`) and retired vocabulary ("Engineering Laws", "DNA-GATE", "PreStartGate", "EnforcementChecklist"). A claim here describes the release that shipped it, not the CLI as it stands today.
> Eight links point at files that later releases deleted (`staff-dna.md`, `stack-versions.mjs`, `sync-rulesets.mjs`, the `idioms/` tree). They are left in place because the entry that names them is the record of why they went away.
> The main [../CHANGELOG.md](../CHANGELOG.md) carries the current release only. Entries move here when a new one supersedes them.

## [5.10.0] - 2026-07-22

> Epic Harness Alignment 2026-07, tasks E1 through E4.

### Added

- **`AGENTS.md` now lands at the repo root, where harnesses already look for it.** The canonical governance moved out of `.ai/skills/`, so Codex and any other tool that reads a root `AGENTS.md` pick it up with no wiring, and `CLAUDE.md` beside it `@`-imports `AGENTS.md` instead of a nested path. `.ai/skills/` holds skills only. A copy left under `.ai/skills/` by an earlier install is deleted on the next `init`, since two copies is the drift this move exists to prevent. `writeAgentConfig` returns the outcome per file (`written`, `unchanged`, `foreign`).
- **Ownership guard on both root files.** Neither is overwritten blindly: ownership is recognised by the canonical title line the CLI always emits, so a file without it belongs to the developer. A hand-written `AGENTS.md` is left untouched and the governance is written to `AGENTS.sdg.md`; a hand-written `CLAUDE.md` is left untouched with no sidecar, since Claude Code reads that exact filename or nothing. Either case prints a warning at the end of `init` naming the file and the action to take, and the run still exits `0`. The same sentinel guards the legacy cleanup, so a `.ai/skills/AGENTS.md` you wrote yourself survives.
- **`## Now` objective moved from `context.md` to `tasks.md`.** The objective sat in the project brief, one file away from the task list it describes, and drifted into a history log. It now lives beside `## Active` in `tasks.md`, and the template carries a comment saying it holds one objective, not a log. Readers updated: `workflow.md` Phase END step 4 (renamed to Objective Update), `commands/sdg-end.md`, `skills/AGENTS.md` Session Start.
- **`writeGitignore()` test suite.** The generator had no coverage at all. Six cases now hold the contract: volatile entries present, no blanket `.ai/backlog/`, knowledge files never listed, pre-existing `.gitignore` without a trailing newline preserved, header not duplicated when already present, and byte-identical output across repeated `init` runs. A seventh test scans `ui-utils.mjs` and `clear-bundle.mjs` for any line that calls a knowledge file gitignored.

### Fixed

- **Generated `.gitignore` reclassified by volatility.** The blanket `.ai/backlog/` entry discarded team knowledge along with session state. `writeGitignore` now ignores three files by name (`.ai/backlog/tasks.md`, `.ai/backlog/impact-map.md`, `.ai/last-prompt.md`), leaving `context.md`, `stack.md`, `learned.md` and `troubleshoot.md` versioned. Stale summaries corrected in `ui-utils.mjs` (two post-init lines), `clear-bundle.mjs` (deletion warning box), `README.md`, `README.pt-BR.md` and `PROJECT-STRUCTURE.md`. **Migration:** `writeGitignore` only appends, so a project installed before this release keeps its legacy `.ai/backlog/` line. Remove it by hand and re-run `init`.
- **Biome config repositioned as a baseline, not a visual-density equivalent.** Three claims in `src/assets/tooling/README.md` coupled Biome to visual density, which it does not enforce. Beyond the wording, the shipped config was invalid on Biome 2.5.5 (`$schema` pinned at 2.0.0, deprecated `suspicious.noConsoleLog`) and collided with its own template copy at the project root. Repaired alongside it: `check-sync` declared four mirrored trees but compared two, the manifest missed `tooling/` and extensionless files, and `build` / `review` / `clear` pointed at paths that no longer existed. Added `gate` and `dogfood` scripts.

## [5.9.0] - 2026-07-11

### Added

- **`checklist-soul.md`, operational companion to `writing-soul.md`.** New skill holding the writing ritual: a mental reset recited before the first write of each file (naming the training default being suspended), three rule passes that point at soul sections instead of restating them, the procedural checks the soul has no home for (gloss coverage judged by reader comprehension, explicit ASCII link anchors, fenced blocks byte-identical during a prose pass, Good examples dogfooding `code-style.md`), and a pre-checkpoint validation gate built on the `writing-lint` hook plus manual passes for the defects no banlist catches (fresh metaphor, restated point, effect closer). Loaded alongside `writing-soul.md` by `sdg-docs`, `sdg-land`, and `sdg-end`; cross-linked from `ui-ux.md`. Division of labor is strict: the soul owns the rules, the checklist owns the ritual, and no rule is stated twice.
- **`writing-soul.md` anti-patterns: three model vices.** `Metaphor for mechanics` ("the handler swallows the error") → say what the code does. `Effect closer` (aphorism or verdict ending a section) → end on the last piece of information. `Filler paragraph` → cut it. They land in the soul rather than the checklist because `writing-lint.mjs` derives its banlists from the soul.

### Fixed

- **`writing-soul.md` acronym gloss separator.** The optional functional gloss now follows an interpoint (`·`) instead of a comma: a comma reads as part of the expansion, while the interpoint marks where the expansion ends and the gloss begins. Example: `**CI/CD** (Continuous Integration/Continuous Delivery · pipeline that automates build, test, and deploy)`.

## [5.8.0] - 2026-07-08

### Added

- **`ui-ux.md` Phase 0.8, Light Theme Calibration.** New rule symmetric to Phase 0.7 (dark). Light theme now gets the same surface discipline: a graded Zinc scale with Zinc 50 (L≈98%) as the ceiling, never `#FFFFFF`; depth conveyed by soft shadows since surfaces cannot go lighter; primary text Zinc 900 (L≈20%), never `#000000`. The Elevation Stack (Phase 0.2) light column moved from `White` to `Zinc 50`, with a both-themes note banning pure white in light and pure black in dark.
- **`writing-soul.md` concision + anti-density rules.** Added `Say it once` (state the point, cut restatements, do not over-extend the subject) and `Break large blocks` (paragraphs past five lines become lists or split; three-line bullets split into sub-bullets) to `How to write`, plus three matching entries in `Quick checks before delivering`.

### Fixed

- **`delivery.md` §1 Response Envelope migrated to the `ok`-discriminated union.** The discriminator is now `ok` (literal `true` / `false`) instead of `success`, with a fixed key order `ok → meta → payload` and the irrelevant branch omitted (never `error: null` nor `data: null`). Errors follow RFC 9457 Problem Details (`type`, `title`, `status`, `detail`, `instance`, `code`, `errors`) with `error.status` equal to the real HTTP status. `meta.timestamp` (UTC, RFC 3339 `Z`) is present on errors only, keeping success bodies deterministic for ETag / idempotency. `Result<T>` / `IsSuccess` stays an internal domain pattern that the adapter converts at the controller edge. Reference norms cited: RFC 9457, JSON:API, Stripe and GitHub error objects.
- **Surface hierarchy enforced in both themes.** `delivery.md` §2 Frontend gained a both-themes surface-hierarchy bullet that holds the S0→S3 tonal steps and the Zinc 50 / Zinc 950 ceilings, pointing at `ui-ux.md` Phase 0.2 / 0.7 / 0.8.
- **README (en + pt-BR) revised for the updated writing soul.** Broke the dense multi-line bullets in the feature list into a lead sentence plus sub-bullets, removed prose em dashes (comma, colon, or sentence split), and converted the reference-list separators to colons. Links, badges, code blocks, and technical content preserved; the English and Portuguese versions kept in parity.
- **`js-yaml` moderate vulnerability resolved (GHSA-h67p-54hq-rp68).** Added a `package.json` `overrides` pinning `js-yaml` to `^4.2.0` (resolves to 4.3.0), clearing the quadratic-complexity DoS that reached the tree transitively through `eslint → @eslint/eslintrc`. This unblocks `npm audit --audit-level=moderate`, the CI step that was failing the push.
- **Tooling test stderr noise silenced.** `bump-version.test.mjs` and `prune-backlog.test.mjs` now pass `stdio: ["ignore", "pipe", "pipe"]` to `execFileSync`, so the deliberate error-path cases no longer leak `❌ Usage` / `❌ Not found` lines into `npm test` output. Production scripts are unchanged; real CLI users still see the messages.

## [5.7.2] - 2026-05-11

### Added

### Fixed

- Bump patch test, republish on npm; v5.7.1 não foi publicada.

## [5.7.1] - 2026-05-11

### Added

### Fixed

- **`src/assets/tooling/README.md`: writing-lint banlist scope wording.** The inventory entry described the hook's banlists as "English and pt-BR", but the implementation has been English-only since v5.7.0 ([writing-lint.mjs:14](../src/assets/tooling/hooks/writing-lint.mjs#L14)). Replaced the trailing clause with "Banlists are English-only, project artifacts ship in English." Doc-only correction; no behavior change.

## [5.7.0] - 2026-05-11

### Added

- **`visual-density` registered in `SKILL_CATALOG` (Surgical).** Engine now lists the skill under the Surgical tier in the rendered `AGENTS.md` (`Visual-density readability deep dive`). Token-budget guard raised from 2600 → 2700 bytes to accommodate the entry (rendered output: 2624 b). `instruction-assembler.test.mjs` updated to assert the new entry alongside `testing`, `security`, `observability`.
- **`src/assets/tooling/biome/biome.json`: opt-in Biome config.** Rule subset mirrors visual-density expectations: `lineWidth: 100`, double quotes, trailing commas, `useConst`, `useTemplate`, `useSingleVarDeclarator`, `noVar`, `noUselessElse`, `useArrowFunction`. Pairs with ESLint; does not replace it. Activation recipe added to tooling README with Biome 2.0 schema link + VSCode format-on-save snippet.
- **`src/assets/tooling/hooks/writing-lint.mjs`: advisory PostToolUse hook.** Scans Write/Edit/MultiEdit tool calls for Markdown writes against the banlists derived from `writing-soul.md` (banned adverbs, openers, emphasis, jargon; English only). Scope: `src/assets/skills/*.md`, `docs/**.md`, `README*.md`, `CHANGELOG.md`. Working-state files (`tasks.md`, `context.md`, `impact-map.md`, `stack.md`, `troubleshoot.md`, `learned.md`) excluded by basename. Hook is advisory: exit 0 always, hits reported to stderr. Ships with 19 unit tests covering scope filter, tool-shape extraction, banlist categories, and output formatting. Activation recipe in tooling README wires it via `.claude/settings.json`.

### Fixed

- **`printUpdateNotification`: ASCII box removed.** The 6-line box rendered as `┌──┐ │ │ └──┘` was breaking under several terminals. Replaced with a 2-line plain notice: headline + install hint. Cleaner, terminal-agnostic, same information density.

## [5.6.5] - 2026-05-11

### Added

### Fixed

- **`writing-soul.md`: pedagogical rewrite + COPY-language principle.** Reorganized into seven sections (`Who reads what we write`, `Tone by context`, `Default voice`, `Default structure for perennial artifacts`, `How to write`, `Anti-patterns`, `Quick checks before delivering`). Tone-by-context table now distinguishes UI copy (product-facing) from perennial artifacts and codifies the language rule: project artifacts ship in English; UI copy follows the developer-declared product language with principles invariant. Anti-patterns expanded with Portuguese banned-opener/emphasis variants. Self-violations corrected (`just`, `genuinely` removed from prose).
- **`visual-density.md`: new dedicated skill** extracted from upstream `thiagocajadev/code-style` and translated to English. Twelve fundamental concepts (`blank line`, `tight pair`, `atomic trio`, `chained semantic pair`, `explanatory return`, `multi-line block`, `fragments → assembly`, `orphan line`, `declaration + guard`, `wall of code`, `method phase`, `column alignment`) plus thirteen-row quick reference. Twenty `details`-folded examples across JS and C# covering all rules. Cross-linked from `code-style.md` (`Visual density` row + Load directive) as the deep-dive companion to the one-line summary already in the Readability table. Registration in `SKILL_CATALOG` (Surgical) deferred to next cycle.

## [5.6.4] - 2026-05-07

### Fixed

- **ESLint 10 compat in `no-inline-assert.mjs`**: replaced removed `context.getFilename()` with `context.filename`. Restores rule loading in downstream projects on ESLint 10+.
- **Prettier `trailingComma` policy bumped from `es5` → `all`**: aligns shipped assets with downstream `comma-dangle: 'always-multiline'` configs. Reformatted 42 files (commas only, no semantic change).

## [5.6.3] - 2026-05-05

### Added

- **Three new surgical skills** registered in the `SKILL_CATALOG` (`instruction-assembler.mjs`) and rendered into `AGENTS.md` Phase CODE skill loading:
  - `review.md`: PR craft (scope, size, title, description, diff hygiene, self-review) + binary `ReviewerChecklist` rule (8 items: Scope, Tests, Security, Naming, Narrative, Density, Comments, Lint+audit) + tone discipline + anti-patterns.
  - `performance.md`: Big-O discipline table (CRUD, list, aggregation, cross-collection match, sort+paginate) + hot-path rules (no N+1, no allocation in tight loops, stream over buffer, memoize at Rule of Three) + budget declaration template + profiling tools per stack (Node, Python, Go, Rust, .NET, JVM) + anti-patterns.
  - `domain.md`: DDD-Lite vocabulary (Entity, VO, Aggregate, Bounded Context, ACL) + modeling rules table + ubiquitous language discipline + anti-patterns + explicit Light vs Heavy DDD scope.

### Fixed

- **CHANGELOG split: v5+ in `CHANGELOG.md`, v0.x–v4.x in `docs/CHANGELOG-archive.md`**: archive header retitled to `Archive (v0.x–v4.x)`, archive note expanded to include pre-v5 vocabulary (`Engineering Laws`, `DNA-GATE`, `PreStartGate`, `EnforcementChecklist`); `CHANGELOG.md` footer re-pointed.
- **Doc drift cleanup: `WorkChecklist` vocabulary across cross-links**: `README.md`, `docs/i18n/README.pt-BR.md`, `docs/reference/PROJECT-STRUCTURE.md`, `docs/concepts/CONSTITUTION.md` all updated from `Pre-Code Checklist + Pre-Finish Gate` to the unified `WorkChecklist` with `Intent` + `Form` sections (matching v5.6.2 fusion). Skill listings extended with `review.md`, `performance.md`, `domain.md` in README.md (EN + pt-BR) and PROJECT-STRUCTURE.md tree + Domain Skills section.
- **SSOT markers in `data-access.md`**: `Query Performance & Pagination` section now declares `**N+1 detection (canonical)**, referenced by performance.md`; `Caching` section declares `**Caching SSOT**; referenced by performance.md`. Closes the soft SSOT ambiguity surfaced by the post-merge skill audit: cross-refs from `performance.md` now resolve in both directions (consumer → SSOT and SSOT → consumer).

## [5.6.2] - 2026-05-05

### Added

### Fixed

- **`code-style.md`: table reorganization (Form / Readability / Quality Control)**: ~33 prose bullets converted into 3 compact tables (`Principle | Rule`) aligned with the upstream taxonomy in `thiagocajadev/code-style`. Anchors block under each table preserves irreducible details (banned verbs/nouns/abbrs, braced-guards examples, import aliasing carve-outs, WHY discipline, magic values). Skill 12.5KB → 12.1KB; reading density up.
- **`code-style.md`: `WorkChecklist` fusion**: `<rule name="PreCodeChecklist">` and `<rule name="PreFinishGate">` merged into single `<rule name="WorkChecklist">` with two binary sections, **Intent** (8 items) recited at CODE entry; **Form** (8 items) recited at CODE entry **and** verified at TEST. Closes the CODE → TEST → CODE rework loop.
- **Cascade**: `governance.mjs` regex now extracts the Form section of WorkChecklist (`### Form` heading anchor); `governance.test.mjs` and `skill-content.test.mjs` updated to the new vocabulary; `workflow.md` Phase CODE step 1 + Circuit Breaker + Phase TEST step 3 references re-pointed. 235/235 tests green, lint 0 errors, audit 100%.

## [5.6.1] - 2026-05-05

### Added

### Fixed

- **`code-style.md`: WHY-comment one-liner + drift compaction**: `Code as documentation` rule now bans multi-line WHY (refactor signal, extract named const/function or move to docstring) and forbids stacked drift chains (`// update:`, `// 2026:`, `// also:`); maintenance must replace stale WHY, never accumulate. Stale WHY ≥ no comment.
- **`code-style.md`: `PreCodeChecklist` form awareness**: cross-link added at top of Pre-Code Checklist directing the agent to load `PreFinishGate` items (Pure entry, Explaining Returns, Vertical Density, etc.) into working memory at CODE entry; not at TEST. Reduces CODE → TEST → CODE rework loop. TEST verifies; it should not discover.

## [5.6.0] - 2026-05-05

### Added

- **`ui-ux.md`: Part 4.0 Gestalt Foundations**: 8 perceptual laws (`Proximity`, `Similarity`, `Continuity`, `Closure`, `FigureGround`, `CommonRegion`, `CommonFate`, `Pragnanz`) inserted as theoretical lens before `Foundational Principles`. Each rule: definition + token/preset application + anti-pattern. Cross-refs added in existing rules: `SpacingHierarchy → Proximity`, `ElevationStack → FigureGround`, `InteractionMotion → CommonFate`. Skill grew 16.4KB → 19.2KB; mirror at `.ai/skills/ui-ux.md` byte-identical. Audit 100%, lint 0 errors.

### Fixed

## [5.5.2] - 2026-04-25

### Fixed

- **`sql-style.md`: formatter-first rewrite**: formatting ownership delegated to SQLFluff. New `.ai/tooling/sqlfluff/.sqlfluff` standard config (dialect, indent, keyword/identifier casing, trailing comma, trailing `AND`/`OR`, `table.column` qualification). Activation recipe added to `.ai/tooling/README.md`. Skill reduced to: formatter-enforced table + vertical style guidance (clause-per-line, 2-space indent, Rule of 3 inline exception, JOIN single vs complex ON, no short aliases) + visual density (blank lines for function signature/body, CTEs, procedure stages). All examples in PostgreSQL `snake_case`.

## [5.5.1] - 2026-04-25

### Fixed

- **Prettier config: double quotes + printWidth 80**: `.prettierrc` updated to `singleQuote: false` and `printWidth: 80`. Full codebase reformatted. Dot-chain wrapping (chains that exceed 80 chars) now handled automatically by Prettier; `newline-per-chained-call` ESLint rule removed (irreconcilable conflict with `prettier/prettier`).
- **`blank-before-assertion`: new ESLint rule replacing `blank-before-expect`**: `src/assets/tooling/eslint-rules/blank-before-assertion.mjs` covers both `expect()` and `assert.*()` calls. Sibling-check prevents false positives on consecutive assertions. Scoped to `**/*.test.*` in `eslint.config.mjs` and exported as `sdgTestConfig` from `snippet.mjs`.
- **`semantic-spacing`: assertion carve-out for Rule 2b/2d/3**: Rules that insert/remove blanks in 4/5-statement blocks now skip blocks whose terminal statement is an `assert.*` or `expect()` call. Eliminates conflict with `blank-before-assertion`.
- **Test files: AAA grouping sweep**: all 20 `*.test.mjs` files updated to "melhor" pattern: arrange (inputs) | blank | expected + actual + derivations (no blank between) | blank | all asserts (no blank between). 235/235 tests green, lint 0 errors.
- **`code-style.md` + `testing.md`: visual density hierarchy clarified**: formatter (Prettier) is the base authority; visual density layers on top. Linter-enforced table updated with `blank-before-assertion` and `no-inline-assert`; `semantic-spacing` description expanded. `testing.md` `NamedExpectations` example updated to new grouping pattern.

## [5.5.0] - 2026-04-24

### Fixed

- **`code-style.md`: function line-limit semantics clarified**: `Small functions` rule rewritten to state the 4–30 ceiling counts **logical statements, not raw LoC**. Three formatting patterns that inflate raw line count without adding logical statements are explicitly excluded: vertical dot-chain breaks (one expression split across indented lines), density-driven paragraph blank lines, and multi-line function signature expansions. Rule is now unambiguous: a three-line dot-chain method call counts as one statement. `.ai/skills/code-style.md` synced.

## [5.4.0] - 2026-04-24

### Added

- **`gate-preflight`: deterministic regex pre-filter for gate detection**: new [`gate-preflight.mjs`](../src/engine/lib/domain/gate-preflight.mjs) module (`GatePreflight.runPreflight(diff)`) scans the staged diff for high-signal patterns before the LLM call. Phase 1 covers form (a), method-call-as-subject inside `assert.*()` calls (`assert.ok`, `equal`, `notEqual`, `deepEqual`, `strictEqual`, `throws`, `rejects`); near-zero FP because `assert.*` is a consagrated API. Matches surface as a `## Pre-filter Signals` section injected into the gate prompt immediately before the diff; clean diffs produce no section. Architecture is hint-mode (signal boost to the LLM), not standalone BLOCK; avoids duplicating LLM semantics in regex code while raising the LLM's attention to already-detected violation sites. [`gate-prompt.mjs`](../src/engine/lib/domain/gate-prompt.mjs) updated: imports `GatePreflight`, calls `runPreflight(diff)`, conditionally injects the signals section. 4 new tests in [`gate-preflight.test.mjs`](../src/engine/lib/domain/gate-preflight.test.mjs) (positive match, clean diff, multi-method, snippet+line shape) + 2 new integration tests in [`gate-prompt.test.mjs`](../src/engine/lib/domain/gate-prompt.test.mjs) (section present on match, section absent on clean diff). 225/225 tests green, lint 0 errors.

### Fixed

## [5.3.2] - 2026-04-24

### Fixed

- **`no-inline-assert`: full sweep**: rule promoted from `governance.test.mjs`-only `files:` override to global enforcement in [`eslint.config.mjs`](../eslint.config.mjs). 129 violations extracted across 13 test files: `MemberExpression` (`actual.isSuccess`, `actual.removed`, `actual.canCommit`, etc.), `CallExpression` (`fileSystem.existsSync(path)`, `stdout.includes(msg)`, `content.includes(fragment)`), `BinaryExpression` (`actualTs >= before && actualTs <= after`), `LogicalExpression`, and `ArrayExpression` (`[]` as second arg to `assert.deepEqual`); all converted to named consts (`actual<Property>` / `expected<Name>` convention from governance.test.mjs beachhead). `files:` override block removed from `eslint.config.mjs`. Mirrored `.ai/tooling/scripts/` copies updated to match `src/assets/`. 219/219 tests green, lint 0 errors.

## [5.3.1] - 2026-04-24

### Added

- **`local/no-inline-assert` ESLint rule**: new custom rule shipped to [`src/assets/tooling/eslint-rules/no-inline-assert.mjs`](../src/assets/tooling/eslint-rules/no-inline-assert.mjs) enforcing that every argument to `assert.*()` calls is a named `Identifier`, no inline literals, property accesses, call expressions, or regex literals. Scoped to test files (`*.test.[mc]?[jt]sx?`). Carve-outs: `ArrowFunctionExpression`/`FunctionExpression` as first arg of `throws`/`doesNotThrow`/`rejects`/`doesNotReject`; string or template literal as the message parameter (method-aware: `ok`/`ifError` trigger at 2+ args, all others at 3+ args). Rule wired into [`eslint-config/snippet.mjs`](../src/assets/tooling/eslint-config/snippet.mjs) and into [`eslint.config.mjs`](../eslint.config.mjs) via a `files:` override scoped to `governance.test.mjs` (full sweep of remaining 13 test files deferred to next cycle). 9 test cases in [`no-inline-assert.test.mjs`](../src/assets/tooling/eslint-rules/no-inline-assert.test.mjs) using `RuleTester` + `describe/it` pattern. **Ternary style rules** added globally to `eslint.config.mjs` and `snippet.mjs`: `no-nested-ternary: error`, `operator-linebreak: after` (with `?`/`:` before override), `multiline-ternary: always-multiline`.

### Fixed

- **`governance.test.mjs`: full style conformance**: all `\n`-stuffed multi-line string fixtures converted to per-line array-join (`['line1', 'line2', ''].join('\n')`); all `assert.match(result.reason, /pattern/)` and `assert.equal(result.pass, ...)` calls refactored to extract `const actualReason`/`const actualPass`/`const expectedReasonPattern` before the assert. `no-inline-assert` now passes with zero violations. Test count stable at 219/219 green.
- **`narrative-heuristics.mjs`: nested ternary removed**: `validateRevealingModulePattern` converted its `reason` nested ternary to an `if/else if` block assigning to `let revealingReason`, eliminating the `no-nested-ternary` lint error.
- **`testing.md`: AAA pattern corrected**: `NamedExpectations` rule rewritten with the correct grouping: `actual` and `expected` share a group (no blank between them), separated from the `assert.*` call by one blank line. Derivation carve-out documented (`actualPrice = actual.price` groups with `expected`, main call stays alone). `TestNamingConvention`: added `No \`should\` prefix` note.

### Added

### Fixed

## [5.3.0] - 2026-04-24

### Added

- **ESLint custom rules + config snippet (tooling)**: two new auto-fixable ESLint rules shipped as optional tooling assets under [`src/assets/tooling/eslint-rules/`](../src/assets/tooling/eslint-rules) and a plug-in config snippet at [`src/assets/tooling/eslint-config/snippet.mjs`](../src/assets/tooling/eslint-config/snippet.mjs). **`local/semantic-spacing`**: enforces _Paragraphs of Intent_ visual-density grouping within block bodies, 7 sub-rules: (1) blank line after any multiline statement; (2) blank before `[action, const, return]` tail when action is non-VD; (2b) 2+2 split in exactly 4-statement `[c, c, c, sideEffect]` blocks; (2c) 2+2 split for `[*, c, c, c, return]` tail in any block size (fires when exactly 3 consecutive VDs precede `return`, guarded so 4+-VD runs don't trigger it); (2d) 2+2 split for `[c, c, c, c, sideEffect]` in exactly 5-statement blocks; (3) remove wrong blank between consecutive VDs when next statement is an ExpressionStatement in 5+ blocks; (4) remove blank between explaining-const and its `return` (tight-pair enforcement). Both INSERT and REMOVE directions are handled so `lint:fix` achieves an idempotent stable state without manual intervention. 11 test cases in [`semantic-spacing.test.mjs`](../src/assets/tooling/eslint-rules/semantic-spacing.test.mjs) covering all sub-rules including the two-directional "blank moved" co-fire scenario. **`local/no-boolean-comparison`**: flags `=== true`, `=== false`, `!== true`, `!== false` comparisons and auto-fixes to bare value or negation. Config snippet exports `sdgEslintConfig` wiring `curly: all`, `local/semantic-spacing`, `local/no-boolean-comparison`, and `padding-line-between-statements`; activation recipe in [`src/assets/tooling/README.md`](../src/assets/tooling/README.md).

### Fixed

- **PreFinishGate checklist shrunk 9 → 8 (Braced guards + const-touching promoted to ESLint)**: removed `Braced guards` from the [`PreFinishGate`](../src/assets/skills/code-style.md) checklist: `curly: all` now enforces it deterministically at lint time and a narrative-audit checkpoint for a linter-blocked rule is redundant ceremony. `validateBracedGuards` removed from [`narrative-heuristics.mjs`](../src/engine/config/heuristics/narrative-heuristics.mjs) and unregistered from `NARRATIVE_VALIDATION_STRATEGIES` in [`governance.mjs`](../src/engine/config/governance.mjs); 11 characterization tests removed from [`governance.test.mjs`](../src/engine/config/governance.test.mjs); `expectedChecklistSize` reverted 9 → 8. `scanHelperTouching` also removed from `validateVerticalDensity`, the const-touching-function spacing pattern is now covered by `semantic-spacing` Rule 1 and `padding-line-between-statements` in ESLint. [`code-style.md`](../src/assets/skills/code-style.md) updated: **Braced guards** rule annotated as ESLint-auto-fixed; **Low visual density** paragraph notes ESLint enforcement; **PreFinishGate** `Braced guards` checkbox removed; new **Linter-enforced** section added listing all 5 ESLint rules with the activation-recipe pointer.
- **Dogfooding sweep: semantic-spacing + no-boolean-comparison auto-fix**: `lint:fix` applied new rules across the engine, [`gate-bundle.mjs`](../src/engine/bin/maintenance/gate-bundle.mjs) (2+2 split in 4-statement side-effect block; `args?.prompt === true` → `args?.prompt`), [`build-bundle.mjs`](../src/engine/bin/init/build-bundle.mjs) (blank insertions after multiline calls), [`prune-backlog.mjs`](../src/engine/bin/lifecycle/prune-backlog.mjs) (blank repositioned from between `const prunedResult` and `return` to between `const pruned` and `const prunedResult`, 2+2), [`narrative-heuristics.mjs`](../src/engine/config/heuristics/narrative-heuristics.mjs) (blank inserted before `const isMatching` in `isCanonicalDelegationShape`), [`auto-bump.test.mjs`](../src/engine/lib/core/auto-bump.test.mjs) (blank before `const expected` in each `bumpVersion` test block, 2+2 `[inputVersion, inputType] + [expected, actual]`), and ~35 other sites across audit, lifecycle, and maintenance modules. 209/209 tests green, lint pass, drift 0.

## [5.2.0] - 2026-04-24

### Added

- **Braced guards rule + heuristic + flavor principles rebalance (audit cycle)**: new **Braced guards** rule in [`code-style.md`](../src/assets/skills/code-style.md) under Readability → Control flow: every `if` / `else if` / `else` / `for` / `while` body wrapped in `{ }` with body on its own line, applies to any single-instruction body (`return`, `throw`, `break`, `continue`, assignment, method call). Rationale: one-liner braceless guards like `if (x) return y;` pile up as a wall and defeat **Low visual density, Paragraphs of Intent**; forcing braces forces a blank line between adjacent guards. New label **Braced guards** added to the Pre-Finish Gate checklist (now 9 items) wired to a new `validateBracedGuards` heuristic in [`narrative-heuristics.mjs`](../src/engine/config/heuristics/narrative-heuristics.mjs) and registered in the `NARRATIVE_VALIDATION_STRATEGIES` map in [`governance.mjs`](../src/engine/config/governance.mjs). Detector uses a line-structure approach (prefix-match for `if|else|for|while`, reject multi-line openers ending in `(` / `,` / `&` / `|` / `?` / `{`, reject bare `else` continuation lines, require a braceless body after `)` or `else`); chosen after an initial regex-based attempt (`\([^)]*\)`) failed on conditions with nested call expressions like `if (!fileSystem.existsSync(path)) return;`. Eleven characterization tests added to [`governance.test.mjs`](../src/engine/config/governance.test.mjs) under `validateBracedGuards` (return / throw / break / continue / assignment / else-if / else / while keyword coverage + pass cases for braced form + reason-string format check), written in canonical form (per-line array-join fixture, vertical-scansion AAA, semantic-assert with named `actualPass` / `expectedPass` pairs). `expectedChecklistSize` bumped 8 → 9. Flavor-principles rebalance in [`lite/principles.md`](../src/assets/instructions/flavors/lite/principles.md): **KISS** retired (agents read "simples" as "skip edge cases / drop validation": opposite of robustness), list renumbered 1–4 → 1–3, `No Boilerplate` annotated as YAGNI, explicit note that **SRP** stays core via `code-style.md` Small functions (not duplicated per flavor).

### Fixed

- **Dogfooding sweep: braceless guards across engine + tooling**: rewrote ~40 braceless guards as braced form (body on its own line) across 13 files, [`narrative-heuristics.mjs`](../src/engine/config/heuristics/narrative-heuristics.mjs) (largest concentration, ~20 guard clauses incl. two self-referential cases the initial `^\s*(if|…)\s*\([^)]*\)` grep missed due to nested parens in `/^(if|for|…)\b/.test(lineText))` and `isCanonicalDelegationShape(bodyLines)` conditions), [`instruction-assembler.mjs`](../src/engine/lib/domain/instruction-assembler.mjs) (10 sites: skill grouping, `writeStackFile` / `writeTasksFile` / `writeLearnedFile` / `writeTroubleshootFile` existence guards, `writeAutomationScripts` early returns, `writeToolingAssets` existence guard, husky hook chmod, partner section injection), [`wizard.mjs`](../src/engine/lib/domain/wizard.mjs), [`cli-parser.mjs`](../src/engine/lib/infra/cli-parser.mjs), [`prompt-utils.mjs`](../src/engine/lib/infra/prompt-utils.mjs), [`fs-utils.mjs`](../src/engine/lib/core/fs-utils.mjs), [`display-utils.mjs`](../src/engine/lib/core/display-utils.mjs), [`ruleset-injector.mjs`](../src/engine/lib/domain/ruleset-injector.mjs), [`audit-file-scanner.mjs`](../src/engine/bin/audit/audit-file-scanner.mjs), [`check-sync.mjs`](../src/engine/bin/audit/check-sync.mjs), [`auto-bump.mjs`](../src/engine/bin/lifecycle/auto-bump.mjs), [`clear-bundle.mjs`](../src/engine/bin/maintenance/clear-bundle.mjs), [`build-bundle.mjs`](../src/engine/bin/init/build-bundle.mjs), [`index.mjs`](../src/engine/bin/index.mjs), [`prune-backlog.mjs`](../src/engine/bin/lifecycle/prune-backlog.mjs), and the tooling seed [`src/assets/tooling/scripts/prune-backlog.mjs`](../src/assets/tooling/scripts/prune-backlog.mjs). Mid-cycle the initial `^\s*(if|…)\s*\([^)]*\)\s*(return|throw|break|continue)` grep was replaced by running the new heuristic directly against the repo (via one-off Node snippet) which revealed an additional ~12 sites missed by the narrow grep (nested-paren conditions, method-call bodies, assignment bodies).
- **Explaining Returns false-positives surfaced by the sweep (9 sites)**: converting inline `if (x) return <literal>;` guards to braced multi-line form exposed nine pre-existing gaps in `validateExplainingReturns`, the heuristic only inspects lines starting with `return ` and its whitelist covers `null` / `false` / `true` / `return;` but not other bare literals (`''`, `[]`, `{ … }`) or bare function calls. Fixed at each site by extracting a named const before the return (v2.4.3 `Explaining Returns` pattern): [`display-utils.mjs`](../src/engine/lib/core/display-utils.mjs) `emptyOutput`, [`instruction-assembler.mjs`](../src/engine/lib/domain/instruction-assembler.mjs) `defaultLanguage`, [`wizard.mjs`](../src/engine/lib/domain/wizard.mjs) `emptyPartner`, [`prompt-utils.mjs`](../src/engine/lib/infra/prompt-utils.mjs) `emptyInput` + `backSignal`, [`audit-file-scanner.mjs`](../src/engine/bin/audit/audit-file-scanner.mjs) `noSourceFiles` + `noTestFiles` + `noRecursiveFiles`, [`check-sync.mjs`](../src/engine/bin/audit/check-sync.mjs) `skipResult`. Trivial-literal carve-out (`return '';` / `return [];` / `return {};` as whitelisted bare returns) remains as a separate backlog item, not expanded in this cycle. 207/207 tests green (196 + 11 new), audit 100%, lint pass, drift 0.

## [5.1.2] - 2026-04-24

### Added

### Fixed

- **Visual-density: const-touching-function convergence (scanner tightening + new test-style beachhead)**: tightened `scanHelperTouching` in [`narrative-heuristics.mjs`](../src/engine/config/heuristics/narrative-heuristics.mjs) against two shapes the first-pass (v5.1.1) scanner missed, (a) **destructuring-const LHS**: widened `singleLineConstPattern` from `\w+` to `(\w+|\{[^}]*\}|\[[^\]]*\])` so `const { helper } = Utils;` counts as a single-line declaration end (previously regex-skipped, so `const { helper } = Utils;\nfunction run()` passed silently); (b) **multi-line const closers**: new `multiLineCloserPattern` recognizes column-0 `)`, `]`, `` ` `` (optionally `;`-terminated) as a declaration boundary, so `const config = buildConfig(\n  ...\n);\nfunction apply()` is now flagged (previously `blockClosePattern` only accepted `}` / `};`). Three characterization tests added to [`governance.test.mjs`](../src/engine/config/governance.test.mjs) under `validateVerticalDensity` covering destructuring-const → function, `);`-closer → function, `];`-closer → function: all three fail before the tightening and pass after. Real-world sweep at cycle start showed **zero** offenders for the new shapes (repo already cleaned manually in v5.1.1); scope is therefore defensive (future-regression guard), not source sweep. Mid-cycle feedback from user turned the 3 new tests into a **beachhead** for the scoped `fix: test source-string style` backlog item, written directly in the canonical form (per-line `[...].join('\n')` source fixture, vertical-scansion AAA with blank-line phase separation, semantic-assert with both `actualX` / `expectedX` named on each `assert.*`) instead of the `\n`-stuffed inline style of the surrounding 14 tests. Intermediate attempt with `// Arrange` / `// Act` / `// Assert` comments tripped the project's own `narrative slop` detector in [`audit-bundle.mjs:141`](../src/engine/bin/audit/audit-bundle.mjs#L141) which treats those labels as narrative slop, resolved by using Vertical Scansion (blank-line separation) instead. Intermediate attempt with raw backtick template literals broke visual indentation (forced fixture content to column 0 inside indented `it()` body), resolved by switching to per-line array-join. Detector expansion stays inside `scanHelperTouching`; `blockClosePattern` kept untouched, new pattern is purely additive. 196/196 tests green (193 + 3 new), audit 100%, lint pass, drift 0.

## [5.1.1] - 2026-04-24

### Added

### Fixed

- **Premise sweep (dogfooding pass: magic-date workaround + concat→interpolation)**: eliminated the `toLocaleDateString('en-CA')` magic-locale workaround in four sites, [`scripts/bump.mjs`](../scripts/bump.mjs), [`src/engine/bin/lifecycle/auto-bump.mjs`](../src/engine/bin/lifecycle/auto-bump.mjs), [`src/engine/bin/audit/audit-bundle.mjs`](../src/engine/bin/audit/audit-bundle.mjs), [`src/assets/instructions/templates/bump.mjs`](../src/assets/instructions/templates/bump.mjs), replacing with `new Date().toISOString().split('T').at(0)` whose surface declares the ISO format it produces (no magic locale, no magic slice index). Converted string `+` concatenation to template literals across eleven sites in [`ui-utils.mjs`](../src/engine/lib/core/ui-utils.mjs) (seven divider calls), [`audit-bundle.mjs`](../src/engine/bin/audit/audit-bundle.mjs) (three header/summary dividers), [`check-narrative.mjs`](../src/engine/bin/audit/check-narrative.mjs) (three header/footer dividers), [`index.mjs`](../src/engine/bin/index.mjs) (two divider/output composers), [`prompt-utils.mjs`](../src/engine/lib/infra/prompt-utils.mjs) (two prompt dividers), [`clear-bundle.mjs`](../src/engine/bin/maintenance/clear-bundle.mjs), [`review-bundle.mjs`](../src/engine/bin/maintenance/review-bundle.mjs), [`fs-utils.mjs`](../src/engine/lib/core/fs-utils.mjs) (trailing newline on atomic JSON write), [`auto-bump.mjs`](../src/engine/bin/lifecycle/auto-bump.mjs) (trailing newline on package.json serialize), with a single documented carve-out preserved at [`narrative-heuristics.mjs:359-360`](../src/engine/config/heuristics/narrative-heuristics.mjs#L359-L360) where `'export ' + 'default'` is a self-flag evasion (a literal `'export default'` would make that detector trip its own file). Registered the premise in [`code-style.md`](../src/assets/skills/code-style.md) under **Readability → names**: new **Template literals over `+`** rule ("build dynamic or multi-part strings with template literals; `+` reserved for documented self-flag evasion and similar one-line workarounds where the reason is annotated inline") and expanded the **No magic values** rule to cover magic-as-string (e.g. `'en-CA'` for ISO date emission, single-letter locale codes for formatting side-effects: prefer expressions whose surface declares the output). Visual-density exploration (`scanHelperTouching` sub-detector + characterization tests) shipped alongside but **partial**: real-world sweep still shows const-touching-function patterns uncaught; deferred to next `fix:` cycle for full convergence. 193/193 tests green, audit 100%, lint pass, drift 0.

## [5.1.0] - 2026-04-24

### Added

### Fixed

## [5.0.0] - 2026-04-24

### Added

- **Dynamic stack context via `land:` phase (dynamize idioms + competencies; preserve flavors)**: retired the static idiom catalog in favor of developer-declared stack, persisted in `.ai/backlog/stack.md` and read by Phase CODE on every session. Demolished [`src/assets/instructions/idioms/`](src/assets/instructions/idioms/) (15 language subdirectories, ~50KB), [`src/engine/config/stack-display.mjs`](src/engine/config/stack-display.mjs), [`src/engine/config/stack-versions.mjs`](src/engine/config/stack-versions.mjs), and the `sdg-agents update` + `sdg-agents sync` maintenance commands that depended on them. Fused `competencies/backend.md` + `competencies/frontend.md` into a single [`competencies/delivery.md`](../src/assets/instructions/competencies/delivery.md) with two internal discriminated sections (`## Backend (load if the task is server-side)`, `## Frontend (load if the task is UI)`) preserving the full BFF envelope SSOT and frontend contract execution content. Reshaped [`sdg-land.md`](../src/assets/instructions/commands/sdg-land.md) with a new **Phase STACK** between SCOPE and BACKLOG: the agent elicits languages/runtimes/frameworks in a single free-form round, classifies entries by role (Backend / Frontend / Data / Scripts), and offers optional `WebFetch` enrichment from a fixed allow-list of 12 canonical doc sources (`tc39.es`, `typescriptlang.org`, `nodejs.org/api`, `react.dev`, `docs.astro.build`, `docs.python.org`, `go.dev/doc`, `doc.rust-lang.org`, `kotlinlang.org/docs`, `dart.dev`, `learn.microsoft.com/dotnet`, `developer.apple.com/documentation/swift`). Added [`src/assets/instructions/templates/backlog/stack.md`](../src/assets/instructions/templates/backlog/stack.md): placeholder seed with the four canonical role headers (`### Backend`, `### Frontend`, `### Data`, `### Scripts`), written by [`instruction-assembler.mjs`](../src/engine/lib/domain/instruction-assembler.mjs) `writeBacklogFiles` on every install but never overwritten when present (developer state protected). [`wizard.mjs`](../src/engine/lib/domain/wizard.mjs) collapsed from five steps to three (`INITIAL → FLAVOR → PARTNER → DONE`), idiom multi-selects, code-style picker, and `versions`/`idioms`/`codeStyle` selection fields all removed; surface shrunk to `{ gatherUserSelections, validateSelections }`. [`cli-parser.mjs`](../src/engine/lib/infra/cli-parser.mjs) dropped the `--idiom`/`--idioms` flags and their validation. [`instruction-assembler.mjs`](../src/engine/lib/domain/instruction-assembler.mjs) SKILL_CATALOG refactored: idiom injection block removed; `delivery.md` placed in a new top-level `Delivery` category; backend/frontend/surgical skills always listed so the agent self-filters per task domain (no more stack-gated conditional loading). New helper `removeGeneratedInstructions(targetDirectory)` nukes `.ai/instructions/` on every regen so stale files from prior versions (including v4.1.0 idioms and split competencies) cannot survive, silent migration, no user prompt. Phase CODE header note points at `stack.md` loaded at Session Start, avoiding a duplicate path ref that would break the Token Budget Guard's no-duplicates assertion. Dependency demolition cascade: [`ruleset-injector.mjs`](../src/engine/lib/domain/ruleset-injector.mjs) dropped the idiom-copy loop and the role-gated competency switch, now copies a single `delivery.md`; [`manifest-utils.mjs`](../src/engine/lib/domain/manifest-utils.mjs) stopped hashing `instructions/idioms/` and the orphan `workflows/` directory; [`ui-utils.mjs`](../src/engine/lib/core/ui-utils.mjs) dropped `STACK_DISPLAY_NAMES` import and the idioms build-summary row, gained a post-install hint "First task is `land:`; discover the project stack and seed backlog"; [`display-utils.mjs`](../src/engine/lib/core/display-utils.mjs) reduced to flavor-only display names; [`fs-utils.mjs`](../src/engine/lib/core/fs-utils.mjs) lost `filterContentByVersion` plus its helpers `parseVersionNumber` + `evaluateVersionCondition` (orphan after idiom version-filter removed) and their tests; [`bin/index.mjs`](../src/engine/bin/index.mjs) dropped the `update` and `sync` subcommand dispatch cases and the idiom label from the `update-instructions` header; [`review-bundle.mjs`](../src/engine/bin/maintenance/review-bundle.mjs) dropped idiom label rendering; [`check-sync.mjs`](../src/engine/bin/audit/check-sync.mjs) `MIRRORED_DIRS` updated from `['core', 'idioms', 'templates', 'competencies']` to `['templates', 'competencies', 'commands', 'flavors']`. Documentation updated lockstep: [`README.md`](../README.md) replaced the "Language Idioms" section with "Stack Declaration via `land:`", updated the Quick Start block (no `--idiom` examples), simplified the Maintenance Commands block; [`docs/reference/CHEATSHEET.md`](reference/CHEATSHEET.md) rewritten with a WebFetch allow-list table and a `land:` usage section replacing the idiom table; [`docs/reference/PROJECT-STRUCTURE.md`](reference/PROJECT-STRUCTURE.md) tree updated (no `idioms/` directory; `stack.md` added under `backlog/`), `instructions/competencies/` description rewritten to describe the single fused `delivery.md`; [`docs/ROADMAP.md`](ROADMAP.md) gained `v4.1 Governance Slim-Down` (Shipped) and `v5.0 Dynamic Stack Context` (Current) milestone rows plus detailed-vision entries, declared the core **closed** with this release, and moved the former "v4.1/v4.2/v4.3" backlog items into a new **Extensions** section as companion packages (`sdg-registry` for remote instruction imports, `sdg-mcp` for semantic context retrieval, `sdg-visual` for auto-generated diagrams, `sdg-pedagogy` for documentation detectors); [`docs/guides/MIGRATION-v3.md`](guides/MIGRATION-v3.md) gained a v4.1 → v5.0 migration section at the bottom with breaking-change table and step-by-step instructions. Test rewrites: [`wizard.test.mjs`](../src/engine/lib/domain/wizard.test.mjs) rewritten from scratch around the new flavor-only surface (6 tests); [`cli-parser.test.mjs`](../src/engine/lib/infra/cli-parser.test.mjs) dropped all `--idiom` cases and added a guard test asserting the `idioms` field is no longer exposed; [`instruction-assembler.test.mjs`](../src/engine/lib/domain/instruction-assembler.test.mjs) dropped idiom-injection and split-competency assertions, added positive tests for `stack.md` seed-write + seed protection when pre-existing + `removeGeneratedInstructions` behavior; [`ruleset-injector.test.mjs`](../src/engine/lib/domain/ruleset-injector.test.mjs) switched idiom/fullstack cases for a delivery-fusion case plus a negative "no idioms/ directory" case; [`skill-content.test.mjs`](../src/engine/lib/domain/skill-content.test.mjs) gained three new describes covering Phase STACK shape (heading position between SCOPE and BACKLOG + doc-source allow-list + stack.md output ref), `stack.md` seed (four role headers + land hint), and `delivery.md` fusion (discriminated sections present). 187/187 tests green (net -19 idiom tests + 13 new stack/delivery/cleanup tests), audit 100%, lint pass, drift 0.

### Fixed

---

> **Older entries (v0.x–v4.x):** see [docs/CHANGELOG-archive.md](CHANGELOG-archive.md), preserved verbatim for historical accuracy.

## [4.1.0] - 2026-04-24

### Added

- **Governance slim-down: Akita-shape code style + consolidated gates**: stripped the ceremonial governance layer in favor of a pragmatic, single-source code style. Deleted [`src/assets/skills/staff-dna.md`](src/assets/skills/staff-dna.md) (4.1KB, 8 Engineering Laws) and rewrote [`code-style.md`](../src/assets/skills/code-style.md) from 16.7KB → 5.8KB (-65%) in an Akita-inspired shape: 2-line Security-First block at the top; seven lean sections (Code style / Comments / Tests / Dependencies / Structure / Formatting / Logging); a single `PreCodeChecklist` (8 binary items, Mental Reset, Target Files, Naming, Narrative, Comments, Tests planned, Security, Blockers) replacing the old 17-item `PreStartGate`; and a single `PreFinishGate` (8 items wired to narrative heuristics) replacing the old 14-item `EnforcementChecklist`. [`workflow.md`](../src/assets/instructions/templates/workflow.md) Phase CODE dropped the DNA-GATE SUPREME BLOCK ceremony, step 1 is now a direct "Pre-Code Checklist (BLOCKING)" pointer into `code-style.md`; Phase TEST Audit Gate now references `PreFinishGate` instead of "Engineering Laws". [`instruction-assembler.mjs`](../src/engine/lib/domain/instruction-assembler.mjs) SKILL_CATALOG lost the `core: staff-dna` entry; the AGENTS.md header now points at `code-style.md` and `workflow.md` instead of the Universal Engineering Manifesto. [`audit-bundle.mjs`](../src/engine/bin/audit/audit-bundle.mjs) lost `checkSovereignCompliance()` (Law 1 / Law 8 validators) and its dashboard row; `checkLawsCompliance()` renamed to `checkCodeStyleCompliance()` and labeled "Code Style Compliance" in the summary. [`governance.mjs`](../src/engine/config/governance.mjs) lost the unused `GOVERNANCE_RULES` export (`LAW_2_HARDENING` / `LAW_3_RESILIENCE` / `LAW_4_NARRATIVE`) and the `loadDynamicRules()` regex updated to read `<rule name="PreFinishGate">` instead of `EnforcementChecklist`; a Revealing Module `Governance = { NARRATIVE_CHECKLIST }` footer added to satisfy the pattern heuristic. [`check-narrative.mjs`](../src/engine/bin/audit/check-narrative.mjs) header and summary dropped "Law 4 Compliance" wording in favor of "Narrative Cascade Compliance". [`display-utils.mjs`](../src/engine/lib/core/display-utils.mjs) docstring dropped "Follows Law 8". Tests rewritten in lockstep: [`skill-content.test.mjs`](../src/engine/lib/domain/skill-content.test.mjs) replaced the Law 1 / PreStartGate / twin-gate describes with Security-First + PreCodeChecklist + PreFinishGate + "ban Laws vocabulary" assertions (8 tests total); [`manifest-utils.test.mjs`](../src/engine/lib/domain/manifest-utils.test.mjs) fixture keys `core/staff-dna.md` → `core/code-style.md`; [`instruction-assembler.test.mjs`](../src/engine/lib/domain/instruction-assembler.test.mjs) staff-dna expectation replaced with positive `code-style.md` + `workflow.md` header assertions plus a negative "must not reference staff-dna" guard; forbidden-patterns list in the Token Budget Guard now also bans `DNA-GATE` and `Engineering Laws`; [`ruleset-injector.test.mjs`](../src/engine/lib/domain/ruleset-injector.test.mjs) expected skill file switched from `staff-dna.md` to `code-style.md`; [`governance.test.mjs`](../src/engine/config/governance.test.mjs) checklist-size expectation `14 → 8`, required-labels set now `['Pure entry point', 'Explaining Returns', 'Boolean prefix']` (SLA dropped from the enforced set; still a concept in code-style, but no real heuristic behind it). Docs cleanup: [`README.md`](../README.md), [`CONSTITUTION.md`](concepts/CONSTITUTION.md), [`PROJECT-STRUCTURE.md`](reference/PROJECT-STRUCTURE.md), [`UI-UX.md`](guides/UI-UX.md), [`README.pt-BR.md`](i18n/README.pt-BR.md) all trimmed; staff-dna tree entries removed, DNA-GATE phrasing replaced with "Pre-Code Checklist", "Engineering Laws" pointers now read as philosophical-only references into the surviving `CONSTITUTION.md` mental-model doc. Round-trip regen via `sdg-agents init --quick` verified the generated `.ai/` matches SSOT (drift = 0). 206/206 tests green, audit 100%, lint pass. Cycle 2 (next) will dynamize idioms / flavors / competencies via `land:` discovery, out of scope here to keep the governance-layer change atomic.

### Fixed

## [4.0.0] - 2026-04-23

### Added

- **Narrative heuristics back-port (patch bundle absorption)**: external dogfood project contributions absorbed into the seed. [writing-soul.md](../src/assets/skills/writing-soul.md) Pedagogical Tone rewritten with three distinct first-occurrence formats (acronym with full English expansion + optional gloss, non-acronym term with short explanation, heading short form only) plus new `Default Content Structure` section mandating intro paragraph after H1 and `## Fundamental concepts` glossary table whenever a doc introduces 3+ technical terms. Narrative heuristics in [governance.mjs](../src/engine/config/governance.mjs) expanded to the full patch spec: `validateNamingDiscipline` now covers the complete 12-token banned set (`req, res, ctx, idx, tmp, arr, val, cb, mgr, ctrl, svc, prev`) with word-boundary regex plus `[,)=:.]` lookahead (drops the noisy single-letter detector); `validateExplainingReturns` now classifies logic-in-return patterns into specific hints (Ternary / Template literal / Arithmetic / Constructor / String interpolation) via the new `classifyReturnLogic` helper; `validateVerticalDensity` promoted from no-op to real implementation covering three sub-detectors, (a) double blank lines, (b) Explaining Return Tight (no blank between canonical prep+return pair), (c) Orphan-of-1 (single atomic literal between blanks after a literal pair); `validateNoSectionBanners` rewritten with multi-language regex `/^\s*(\/\/|#|--)\s*[-=]{3,}/m` covering JS, Python/shell, and SQL banner styles. All narrative validators extracted into the new sibling module [heuristics/narrative-heuristics.mjs](../src/engine/config/heuristics/narrative-heuristics.mjs) via Revealing Module Pattern; `governance.mjs` reduced to a thin strategy-map + loader. [ROADMAP.md](ROADMAP.md) gained a `v4.0, Narrative Heuristics Maturity` milestone row and detailed-vision entry describing this release. Patch 03 (pedagogy detectors for documentation artifacts) evaluated and routed to a future standalone package rather than into the CLI, to preserve mission focus on code governance. 206/206 tests green (+26 new positive/negative cases across the 6 expanded detectors), audit 100%, lint pass.

### Fixed

## [3.9.0] - 2026-04-18

### Added

- **Inert tooling catalog at `.ai/tooling/`**: `sdg-agents init` now copies a pre-made, non-invasive tooling bundle into every generated project: [prune-backlog.mjs](../src/assets/tooling/scripts/prune-backlog.mjs) (trims `## Done` to last N via `--keep N`, default 3, idempotent), [bump-version.mjs](../src/assets/tooling/scripts/bump-version.mjs) (minimal semver bump: only rewrites `package.json.version`, zero git/CHANGELOG side-effects), husky [pre-commit](../src/assets/tooling/husky/pre-commit) + [commit-msg](../src/assets/tooling/husky/commit-msg) templates, and a [README.md](../src/assets/tooling/README.md) with activation recipes. New `writeToolingAssets()` function in [instruction-assembler.mjs](../src/engine/lib/domain/instruction-assembler.mjs) performs recursive copy + `chmod 755` on hook templates; wired into both quick and agents pipelines in [build-bundle.mjs](../src/engine/bin/init/build-bundle.mjs). Generated [context.md](../src/assets/instructions/templates/backlog/context.md) now includes `## Tooling (optional)` section pointing developers to the bundle. Design principle: ship pre-made scripts as inert assets, no `package.json` edit, no `.husky/` creation, no devDep auto-install. Activation is agent-assisted on demand. Test glob expanded in `package.json` to include `src/assets/tooling/**/*.test.mjs`. 180/180 tests green (+17: 5 prune + 8 bump + 3 writeToolingAssets + 1 context hint assertion), audit 100%, lint pass.

### Fixed

## [3.8.0] - 2026-04-18

### Added

### Fixed

- **Engine full-scan fix sweep + `named-const-before-call` form (a) detector gap closure**: full manual audit of `src/engine/**` against the 10 SDG rules surfaced ~40 BLOCK sites uncaught by previous sweeps. Real bugs fixed: duplicate `console.log` at [clear-bundle.mjs:89](../src/engine/bin/maintenance/clear-bundle.mjs#L89) (success message was printed twice). Boolean-prefix renames (leaf utilities, zero external callers): `missingVersion`/`sameVersion` → `is*` ([version-utils.mjs:41,45](../src/engine/lib/domain/version-utils.mjs#L41)), `defaultMatch` → `isDefaultMatch` ([fs-utils.mjs:106](../src/engine/lib/core/fs-utils.mjs#L106)), `abortSignal` → `isAborted` ([prompt-utils.mjs:44](../src/engine/lib/infra/prompt-utils.mjs#L44)), `strictMagicMatch` → `hasStrictMagicMatch` ([audit-bundle.mjs:162](../src/engine/bin/audit/audit-bundle.mjs#L162)). Taboo-verb function renames (single-file scope): `executeWizardStep` → `dispatchWizardStep`, `handleQuickSetup` → `buildQuickSetup` ([wizard.mjs:59,67,114,155](../src/engine/lib/domain/wizard.mjs#L114)), `handleContextInjection` → `injectPartnerSection` ([instruction-assembler.mjs:292,311](../src/engine/lib/domain/instruction-assembler.mjs#L311)). `dryRun` full-chain rename to `isDryRun` across cli-parser, bin/index, clear-bundle, build-bundle (10 sites) + test adjustment. Method-call-as-boolean-subject sweep across test files surfaced 27 hits of `assert.ok(x.includes(y))` / `.startsWith()` / `.endsWith()` / `.match()`, each extracted into a named const (`hasExpected`, `hasPrefix`, `hasSurgicalHeader`, etc.) before the call. Carve-outs respected per `feedback_audit_vs_tests_contradiction.md`: `fs.existsSync(path.join(...))` FP class and trivial-literal returns remain on the backlog queue.
- **`named-const-before-call` form (a) rule priming expanded**: [sdg-rules.json](../src/assets/rules/sdg-rules.json) description now explicitly covers the high-frequency test idiom, `assert.ok(actual.includes(expected))` / `.startsWith()` / `.match()` / nested property paths like `obj.error.message.includes(text)`, with zero-tolerance wording ("MUST be extracted … even when the method argument is a plain literal"). `exampleViolation` + `exampleFix` extended with two new forms. Fixture [named-const-before-call.diff](../tests/fixtures/gate/violations/named-const-before-call.diff) gained 2 lines covering non-negated method-call subjects. 2 new assertions: one in [gate-prompt.test.mjs](../src/engine/lib/domain/gate-prompt.test.mjs) verifying the fixture case propagates to the LLM prompt, one in [rules-loader.test.mjs](../src/engine/lib/domain/rules-loader.test.mjs) blinding the description fragment against regression. 163/163 tests green, audit 100%, lint pass.

## [3.7.0] - 2026-04-18

### Added

### Fixed

- **Full test-suite scan + inline-assertion-literals sanitization**: systematic audit of all 16 colocated `*.test.mjs` files against the 10 SDG rules surfaced 6 BLOCK violations clustered in [instruction-assembler.test.mjs](../src/engine/lib/domain/instruction-assembler.test.mjs), template-literals with interpolation passed directly as the message argument to `assert.ok` / `assert.deepEqual` (lines 278, 293-298, 310-314, 334-337, 351-354, 358). Extracted each interpolated message into a named const before the call (`sizeFailureMessage`, `tokenLeakMessage`, `duplicatesMessage`, `leakMessage`, `sectionBloatMessage`, `missingSectionMessage`). Bonus pass; extracted the assertion subjects that the rule description was silent about: `actualBytes < 2700` → `isUnderSmallBudget`, `actualBytes <= TOKEN_BUDGET_BYTES` → `isWithinTokenBudget`, `!actual.includes(pattern)` → `isPatternAbsent`, `h2Matches.length <= 5` → `isWithinH2Limit`. Remaining 15 test files clean; grep for taboo-verb prefixed methods, standalone taboo-nouns, and boolean-without-prefix returned zero hits.

- **`named-const-before-call` detector gap closed: forms (f) and (g) enumerated**: expanded [sdg-rules.json](../src/assets/rules/sdg-rules.json) rule description to explicitly cover (f) binary-comparison expressions (`<`, `<=`, `>`, `>=`, `===`, `!==`, `==`, `!=`) passed as boolean subjects, and (g) unary-negation of a call or property access (`!fn(x)`, `!arr.includes(x)`) passed as boolean subjects; the patterns surfaced 6 live sites in the inline-assertion-literals sweep above. Added Test-framework title exemption clause (positional template-literal titles in consagrated APIs like `it(\`...\`)`/`describe(\`...\`)`are test-name composition, not process-narrative; do not extract; carve-out honors existing`feedback_printer_carveout.md`principle). Added requirement that extracted boolean consts must honor`boolean-prefix`(is/has/can/should/did/needs/supports/allows). Updated`exampleViolation`+`exampleFix`to show binary-comparison and unary-negation extractions. New fixture [named-const-before-call.diff](../tests/fixtures/gate/violations/named-const-before-call.diff) covers the 3 patterns; 2 new loader assertions verify the rule description carries`binary-comparison`+`unary-negation`fragments and the test-framework title exemption; 2 new`GatePrompt` assertions wire the fixture (diff content propagates) and verify the rule id is injected into the gate prompt. 161/161 tests green, audit 100%, lint pass.

## [3.6.3] - 2026-04-18

### Added

### Fixed

- **Full-repo gate audit + 2 sanitization residuals closed**: audit sweep across `src/engine/lib/**` (14 files) and cross-grep of `bin/**` surfaced a ceremonial-void-return regression at [gate-bundle.mjs:21](../src/engine/bin/maintenance/gate-bundle.mjs#L21) (`const usageResult = printUsage(); return usageResult;`, the `print*`-prefixed wrap missed in the previous sanitization sweep) and a real `named-const-before-call` hit at [wizard.mjs:373](../src/engine/lib/domain/wizard.mjs#L373) (template literal `Unknown flavor: "..."` passed inline to `fail()`). Both sites now follow the established pattern: `gate-bundle` uses bare `printUsage();` terminator; `wizard` extracts the interpolated message into `invalidFlavorMessage` before calling `fail()`, mirroring the sibling shape at L386-388. Audit also enqueued two rule-precision follow-ups, `named-const-before-call` needs carve-outs for pure data-access composition (`path.*` / `JSON.parse(fs.readFileSync(...))` / read-or-default ternaries) and `explaining-returns` needs a trivial-literal carve-out (~30 `const X = <atomic>; return X;` sites surfaced, including an internal contradiction in `wizard.mjs` where `return 'fullstack';` is bare but `return defaultScope;` is extracted). 157/157 tests green, audit 100%.

## [3.6.2] - 2026-04-18

### Added

### Fixed

- **`ceremonial-void-return` detector + `explaining-returns` void-terminator exemption**: Audit sweep surfaced 11 `const X = console.log(...); return X;` wraps across `src/engine/bin/**` where the rule was being satisfied mechanically while destroying its intent. `explaining-returns` now carries an explicit carve-out, functions whose last statement is a void side-effect call (`console.*`, `process.stdout.write`, `BundleUI.print*`) use the bare statement and an implicit return. A new WARN rule `ceremonial-void-return` catches the anti-pattern against regression, scoped strictly to leaf sites where the RHS is a known void-returning primitive (orchestrators using the canonical `const X = call(); return X;` Pure Entry Point form are exempt by design).
- **`named-const-before-call` tightened with enumeration + printer-function carve-out**: rule description now explicitly lists the five computed forms that must be extracted before any callsite, function/method calls, ternaries, template-literals with interpolation, `+` concatenations, and anonymous object literals used as configuration. Plain string/number/boolean literals and direct function references (`fs.existsSync`) remain exempt as ceremony-free positional arguments. Added printer-function carve-out: when a function's body is one `console.*` / `process.stdout.write` call and its name already carries the intent (`printX`, `logX`, `warnX`), the function name serves as the semantic const; the template stays inline to avoid semantic duplication.
- **14 composition-real callsites extracted into named consts**: `src/engine/bin/lifecycle/auto-bump.mjs` (3 sites, `syncAllPackages` restructured with clean input/output phases; `JSON.stringify(...) + '\n'` hoisted; `filter(fs.existsSync)` replaces arrow wrapper), `src/engine/bin/maintenance/gate-bundle.mjs` (3 sites; parse-error, block-violation, warn-violation outputs), `src/engine/bin/maintenance/sync-rulesets.mjs` (1 site), `src/engine/bin/maintenance/review-bundle.mjs` (2 sites), `src/engine/bin/audit/audit-bundle.mjs` (1 site), `src/engine/bin/lifecycle/prune-backlog.mjs` (1 site), `src/engine/bin/init/build-bundle.mjs` (3 sites). Pure presentation printers (`ui-utils.mjs`, `printManifestSummary`, `printComparisonReport`) remain untouched per carve-out. 157/157 tests green (+3 new assertions for `ceremonial-void-return` in prompt + loader), audit 100% compliant.

## [3.6.1] - 2026-04-18

### Added

### Fixed

- **Gate dogfooding violations eliminated across `src/engine/bin/**` and shared utils**: renamed taboo-verb function/method names (`run`→ domain verb per module,`handle*`/`perform*`/`execute*`→`apply*`/`process*`/`dispatch*`/`report\*`); renamed `runIfDirect`→`bootstrapIfDirect` across 13 importers; replaced taboo-nouns (`data`→`jsonText`/`registryPayload`, `fn`→`entryFunction`, `item`→`entry`/`itemName`, `v`→`violation`); extracted template literals and `!result.isFailure`negations into named consts at`printResult`and`console.log`callsites. Residuals accepted:`SpecDrivenGuide.run()`public API (breaking-change parked for major bump) and top-level`run()`in`index.mjs` (entry-point convention). 154/154 tests green, audit 100% compliant.

## [3.6.0] - 2026-04-18

### Added

### Fixed

- **`gate-checker` strips markdown fences from LLM output**: `parseJson` now calls `stripFences()` before `JSON.parse`, handling ` ```json ``` ` and ` ``` ``` ` wrappers that most LLMs emit despite the "ONLY valid JSON" prompt instruction. Without this fix the real-world pipeline was silently skipping every review.
- **`sdg-rules.json` rule descriptions calibrated via dogfooding**: `named-const-before-call` description now explicitly states the violation is at the argument position, not in variable assignment RHS, object property values, or array elements. `taboo-nouns` now states the full identifier must equal the banned word, compound names like `packageData`, `ruleObj`, `existingItems` are not violations. Reduces LLM false positive rate observed during 3-round audit against the sdg-agents-cli codebase itself.

## [3.5.0] - 2026-04-18

### Added

- **`sdg-agents gate`: language-agnostic pre-commit code review gate**: new command `sdg-agents gate --prompt | --check` that pipes `git diff --staged` through any LLM CLI and blocks commits on BLOCK-tier violations. Architecture is agent-neutral: `--prompt` builds a structured review prompt from `sdg-rules.json` and prints it to stdout; `--check` reads the LLM JSON response and exits 0 (pass) or 1 (block). No Anthropic SDK dependency. Includes `src/assets/rules/sdg-rules.json` as SSOT with 7 rules (5 BLOCK, 2 WARN): `explaining-returns`, `taboo-verbs`, `boolean-prefix`, `inline-assertion-literals`, `named-const-before-call`, `taboo-nouns`, `sla-violation`, `arrow-antipattern`, `visual-density`. Template hook at `src/assets/hooks/pre-commit.sh` wires any LLM CLI in one line. 14 fixture-based tests across `rules-loader`, `gate-prompt`, and `gate-checker` modules. 154/154 tests green, lint PASS.

### Added

### Fixed

## [3.4.0] - 2026-04-18

### Added

- **Dark Theme Calibration (Phase 0.7) in `ui-ux.md`**: new rule maps dark mode surfaces to the existing Zinc/OKLCH scale (950→700), applies chroma reduction via C×0.80–0.90 instead of raw hex overrides, anchors text opacity to semantic tokens (`text-foreground` at 87%, `text-muted-foreground` at 65%, disabled at 45%), replaces `rgba(0,0,0,0.6)` overlay pattern with `bg-background/70`, and adds three perceptual heuristics (heavy→lighten, vibrating→desaturate, faded→increase contrast). Perception beats math principle made explicit.
- **String Density rule in `code-style.md`**: new rule in Part 2 (Visual Aesthetics) governs long Tailwind class strings and `cva` usage. Monolithic class strings >5 tokens must be split into named groups by semantic concern (layout, surface, typography, state). `cva` is a composition layer, not a string dump. Anti-fragmentation constraint: no single-token lines. PreStartGate updated with binary String Density check.
- **`writing-soul.md` as standalone skill**: Writing Soul extracted from `ui-ux.md` Part 5 into its own file at `src/assets/skills/writing-soul.md`. Adds explicit **no-dash rule** (never use em dash, use comma, parentheses, or sentence split). `ui-ux.md` Part 5 replaced with a load reference.
- **Writing Soul coverage across all flows**: `sdg-docs.md`, `sdg-end.md`, and `sdg-land.md` now load `writing-soul.md` at entry. `AGENTS.md` Frontend section updated to list writing-soul as a separate load target from ui-ux. Covers changelog entries, commit messages, backlog content, and READMEs across every cycle type.

## [3.3.1] - 2026-04-18

### Added

### Fixed

- **Supreme Gate: Law 1 hardening blocks training-default drift in Phase CODE**: agents were entering Phase CODE and writing code in default LLM style (dense walls, no vertical scansion, no "Paragraphs of Intent") because the existing DNA-GATE was declarative prose, not a binary ceremony. Three coupled changes close the loop: (1) [staff-dna.md:7-19](src/assets/skills/staff-dna.md#L7-L19) Law 1 gets a third subrule **Recited Gate (SUPREME BLOCK)**, agent MUST emit a `DNA-GATE CONFIRMED` block with Mental Reset + Laws Applied + Pre-Start Checklist + Target Files + Blockers before the first `Edit`/`Write`/`NotebookEdit`; missing block = Law 1 violation. (2) [workflow.md:57-71](../src/assets/instructions/templates/workflow.md#L57-L71) Phase CODE step 1 promoted to **BLOCKING** with a Circuit Breaker clause that auto-fails Phase TEST if the block was skipped. (3) [code-style.md:261-289](../src/assets/skills/code-style.md#L261-L289) new `PreStartGate` rule with 17 binary items (twin of the existing `EnforcementChecklist` at Pre-Finish), with **"Paragraphs of Intent"** promoted from diluted `VerticalScansion` prose to an explicit binary item: _"a blank line separates logical groups; NO blank lines within a group"_. Coverage: 9 characterization tests in new [skill-content.test.mjs](../src/engine/lib/domain/skill-content.test.mjs) reproduce the bug class (missing gate text in the 3 skill files). 137/137 tests green, lint PASS, audit 100%.

## [3.3.0] - 2026-04-17

### Added

- **Auto-prune of `tasks.md ## Done` at Phase END**: new binary [prune-backlog.mjs](../src/engine/bin/lifecycle/prune-backlog.mjs) + `npm run prune` script truncates the Done section to the last 3 entries after each cycle closes. Pure function `pruneBacklog(content, keepCount)` is deterministic, idempotent, preserves `## Active`/`## Backlog` and any sections after `## Done`. Wired into [workflow.md](../src/assets/instructions/templates/workflow.md) Phase END step 3 so every agent, every session, ends with a clean backlog; `CHANGELOG.md` + `git log` remain the authoritative history trail. Rationale: backlog is ephemeral working state, not archive; bloat in `## Done` was costing ~6K tokens per session start for redundant context. Covered by 6 tests (truncation, no-op under threshold, missing-section handling, trailing-section preservation, idempotency, single-blank-line formatting).

### Fixed

## [3.2.4] - 2026-04-17

### Added

### Fixed

- **`npm test` glob silently dropped 10/11 test files**: [package.json:19-20](../package.json#L19-L20) `test` and `test:watch` scripts used unquoted `src/engine/**/*.test.mjs`. npm executes scripts via `sh`, where `globstar` is off by default, so `**` collapsed to single-level `*` and matched only `src/engine/config/governance.test.mjs` (1 of 11 files = 3 of 122 tests). [audit-bundle.mjs:260](../src/engine/bin/audit/audit-bundle.mjs#L260) Code Hygiene gate spawned `npm test` and reported PASS over the 3-test slice, masking potential law-compliance regressions in the other 119 tests. Fix: quote the pattern (`"src/engine/**/*.test.mjs"`) so Node ≥22 resolves it via its native `--test` glob, shell-independent. Verified: `npm test` now reports `tests 122`; audit Code Hygiene PASS over full suite.

## [3.2.3] - 2026-04-17

### Added

### Fixed

- **D1: `sync-rulesets.mjs` template literals dedented**: two left-flushed templates at [sync-rulesets.mjs:104-109](src/engine/bin/maintenance/sync-rulesets.mjs#L104-L109) (section render) and [:120-148](src/engine/bin/maintenance/sync-rulesets.mjs#L120-L148) (sync prompt) broke narrative flow with surrounding 2-space code. Extracted 3 pure render helpers (`renderTargetSection`, `renderMaintainerNote`, `renderSyncPrompt`) using `dedent` (already an in-project dep). Output byte-shape preserved; function body now reads with natural indentation.
- **F4: Sovereign Protocol validator contradiction resolved**: [audit-bundle.mjs:198-205](../src/engine/bin/audit/audit-bundle.mjs#L198-L205) required AGENTS.md to contain `DNA-GATE & MENTAL RESET [LOCKED]`, directly contradicting the M1.1 router-identity design enforced by 4 tests in [instruction-assembler.test.mjs](../src/engine/lib/domain/instruction-assembler.test.mjs) (minimal registry, ≤2600 bytes, no inline DNA-GATE ceremony). Removed the AGENTS.md check; Sovereign Protocol coverage remains intact via the existing `staff-dna.md` Law 1 + Law 8 validators ([:186-196](../src/engine/bin/audit/audit-bundle.mjs#L186-L196)). Reconciles architectural drift between validator and router-identity tests.
- **F3: Named Expectations triad applied to `clear-bundle.test.mjs`**: refactored all 5 test cases to the `input` → `expected` → `actual` pattern required by [testing.md:47-66](../src/assets/skills/testing.md#L47-L66). Previously magic-literal assertions (`assert.deepEqual(actual, [])`) replaced with named `expected` variables. Test Expectations gate now ✅.
- **Audit report (2026-04-17)**: sweep of `src/engine/` with the active Laws Compliance gate (v3.2.2) surfaced **zero** real law violations across 25 non-test files, confirming the v3.2.2 restoration was not masking silent regressions. Only 2 governance gaps (F3 + F4) and 1 code-quality item (D1) were found, all resolved in this cycle.

## [3.2.2] - 2026-04-17

### Added

### Fixed

- **Laws Compliance gate restored (5 coupled bugs)**: previously inert because `NARRATIVE_CHECKLIST.length === 0`. Five coupled defects in [governance.mjs](../src/engine/config/governance.mjs) addressed:
  - **Bug X (parser)**: regex required `**bold**` markers around checklist labels, but [code-style.md:267-280](../src/assets/skills/code-style.md#L267-L280) uses plain text. Relaxed to `(?:\*\*)?` optional + handle trailing parenthetical (`No section banners (...)`, `Reads like a short story (...)`).
  - **Bug Y (label drift)**: 5/12 strategy keys diverged from real labels (`'SLA applied'`→`SLA`, `'Vertical Density applied'`→`Vertical Density`, `'Boolean names carry a prefix'`→`Boolean prefix`, `'No Section Banners'`→`No section banners`, `'Code reads like a "Short Story"'`→`Reads like a short story`). Realigned.
  - **Bug Z (missing mappings)**: 2/14 checklist items had no strategy entry. Added `Destructuring inside function body, not in parameters` and `Pure entry point` (the latter aliases `validateSlaCompliance`).
  - **Bug W (canonical entry-point form)**: previous v3.2.1 fix collapsed `run()` to a single-line ternary, which violated **Explaining Returns** (no logic/ternary on return line, [code-style.md:134](../src/assets/skills/code-style.md#L134)). Established canonical form `const X = call(); return X;` and applied to 4 entry points: [check-sync.mjs:17](../src/engine/bin/audit/check-sync.mjs#L17) (with guard clause moved into `orchestrateSyncCheck`), [sync-rulesets.mjs:22](src/engine/bin/maintenance/sync-rulesets.mjs#L22), [review-bundle.mjs:22](../src/engine/bin/maintenance/review-bundle.mjs#L22), [index.mjs:24](../src/engine/bin/index.mjs#L24).
  - **Bug V (validator misalignment)**: `validateSlaCompliance` enforced strict 1-line bodies, falsely flagging the new canonical 2-line form. Replaced length check with shape detector: accepts (a) single-statement bodies (side-effect form), (b) canonical `const X = call(); return X;` (2 statements). Rejects ternaries and any other multi-statement shape.
  - **Cleanup**: removed `SLA Exemption` hack in `validateExplainingReturns` (`if (functionContext === 'run') continue;`), entry points now follow Explaining Returns universally. Removed orphan `scanForFunctionHeader` helper.
- **Regression test added** ([governance.test.mjs](../src/engine/config/governance.test.mjs)): 3 cases covering `NARRATIVE_CHECKLIST.length === 14`, no orphan rules, and presence of `SLA`/`Pure entry point`/`Explaining Returns` labels. 122/122 tests green.

## [3.2.1] - 2026-04-17

### Added

### Fixed

- **One-Line Entry Point Mandate restored on `check-sync.mjs`**: `function run()` collapsed from a 6-line `if`-guard / early-return / orchestrate / return block to a single ternary delegation: `return isMaintainerMode() ? orchestrateSyncCheck() : success();`. Aligns the synchronous sync checker with Law 4 (Pure Entry Point), now matching the 9 other `bin/` entry points already compliant.
- **Audit blind spot in `validateSlaCompliance`**: both regexes in [governance.mjs](../src/engine/config/governance.mjs) (entry-point matcher at line 69 and `run()`-body matcher at line 88) required an `async` prefix and silently skipped synchronous declarations like the one above. Made the prefix optional via `(?:async\s+)?`. Restores SLA enforcement coverage for sync entry points. (NOTE: full Laws Compliance gate restoration depends on a separate critical fix logged to backlog, `NARRATIVE_CHECKLIST` currently loads zero rules due to a parser/label drift in the same file.)

## [3.2.0] - 2026-04-17

### Added

- **SSOT alignment cycle (`audit:`)**: ruleset realigned with user-declared governance across 3 conflicts, 6 duplications, 5 gaps, and 11 partial items (16 total changes). Net delta +2KB / ~500 tokens after compaction pass.
  - **Conflicts resolved**: entry point mandate unified to **1 line** (`backend.md`); HTTP Envelope canonicalized in `backend.md` with `code-style.md` + `api-design.md` reduced to pointers; comment stance tightened to `// why:` only for hidden constraints.
  - **Duplications consolidated**: NarrativeCascade canonical in `code-style.md` (staff-dna Law 4 shrunk to pointer); Health/RED/structured logging canonical in `observability.md` (cloud.md references); PII/secret redaction canonical in `security.md` (observability references); abstract env naming + no `.env.example` canonical in `security.md` (`code-style.md` + `cloud.md` reference); Conventional Commits canonical in `code-style.md` (ci-cd references).
  - **Gaps filled**: `Migrations` rule in `data-access.md` (Rails `YYYYMMDDHHMMSS_*` naming + forward-only + idempotent guards); `Delivery Strategy` in `ci-cd.md` (trunk-based, short-lived branches, deploy ≠ release, feature flags off by default, post-deploy validation); `Part 3; Incident Correction Strategy` in `security.md` (fix-forward preference, rollback as critical exception, flag-based safety, main consistency); `Builder/Options via extension methods` in `code-style.md` AbstractConfig rule.
  - **Partial items enriched**: `code-style.md` gained explicit `LanguagePurity` rule (English-only, small functions, immutability default, CQS, explicit dependencies, async I/O, ≤3 params/line); `sql-style.md` gained `Query Discipline` (early filtering, descriptive aliases, named parameters, explicit `ORDER BY`) and `CTE vs Temp Table` decision rule; `ui-ux.md` gained `Structured Components` (steps/tabs/modals + progression + error prevention), `Anti-Patterns (UI/UX)` block (information overload, uncontrolled tables, visual noise, decorative motion, fixed-layout bias, platform bias), and Lucide as canonical icon library.
  - **Token efficiency**: compaction pass removed `<rule>` cerimonial wrappers on new sections and densified prose; net addition ~500 tokens for 16 new/consolidated rules (~31 tokens per governance change). `.ai/` regenerated from `src/assets/`; Instruction Sync passes.

### Fixed

## [3.1.1] - 2026-04-17

### Added

### Fixed

- **Docs folder restructured**: 14 flat files in `docs/` regrouped into thematic subfolders, `docs/concepts/` (CONSTITUTION, SPEC-DRIVEN-DEV-GUIDE, AGENT-DEEP-FLOW, SOFTWARE-DEVELOPMENT-LIFECYCLE-SDLC), `docs/reference/` (PROJECT-STRUCTURE, CHEATSHEET, PIPELINES, REFERENCES), `docs/guides/` (MIGRATION-v3, TOKEN-OPTIMIZATION, UI-UX), `docs/i18n/` (README.pt-BR). ROADMAP stays at `docs/` root. All cross-links updated in `README.md`, `docs/i18n/README.pt-BR.md`, and internal doc-to-doc references. Maintainer-mode file check in `audit-bundle.mjs` repointed to the new pt-BR path.
- **CHANGELOG history split**: Entries `< v3.0.0` (v1.0.0 → v2.16.0, 63 releases) moved verbatim to `docs/CHANGELOG-archive.md`. Main `CHANGELOG.md` kept lean (Unreleased + 3.x only) with a footer link to the archive. `bump.mjs` regex still matches `[Unreleased]` at the top (verified).
- **Version correction (`3.0.1` → `3.1.1`)**: The prior fix cycle produced a misordered patch (`3.0.1` released after `3.1.0`, violating semver). Merged the content of `[3.0.1]` into `[Unreleased]` and deleted the misordered block so the next release promotes cleanly to `3.1.1`. The local commit `281fc13` labeled `v3.0.1` stays as historical record, the release never reached npm, so no external breakage.
- **Backlog folder relocated**: `.ai-backlog/` → `.ai/backlog/`. Removes a top-level directory from project root; backlog now lives inside the governance tree as local working state. All SSOT references updated (`templates/workflow.md`, `commands/sdg-end.md`, `commands/sdg-land.md`), engine paths repointed (`instruction-assembler.mjs` `writeBacklogFiles` + `writeGitignore` BLOCKS, `audit-bundle.mjs:checkBacklogHealth`, `ui-utils.mjs` success log), docs aligned (README, README.pt-BR, PROJECT-STRUCTURE, REFERENCES). Consumer `.gitignore` generator now writes `.ai/backlog/` (was `.ai-backlog/`). CHANGELOG history left untouched (historical accuracy).
- **Clear-bundle backlog-loss guard**: `clear-bundle.mjs` now performs a second confirmation when `.ai/backlog/` contains files (tasks/learned/troubleshoot are not in git and have no remote recovery). Pure predicate `Cleaner.findBacklogsAtRisk(items)` extracted for testability; covers root projects and monorepo `packages/*` layouts. New regression suite: 5 tests in `clear-bundle.test.mjs`. Test glob widened to `src/engine/**/*.test.mjs` to discover bin-level tests.

## [3.1.0] - 2026-04-15

### Added

- **Part 0: Visual Architecture Principles**: new foundational section in `ui-ux.md` covering solution-first stance, interface structure, themes/depth philosophy, styling/implementation, interaction/experience, accessibility as default, and anti-patterns. Frames the WHY before the tactical Parts 1–5.
- **"Using with other IDEs" section**: both READMEs now include a pointer-line table for Cursor, Windsurf, Copilot, Codex, Gemini, and Cline/Roo; replacing the old multi-agent wizard section.
- **`docs/UI-UX.md` rewrite**: now a reader overview with narrated map of the skill file and external research references (Shadcn/UI, Tailwind v4, Radix, OKLCH, Refactoring UI, WCAG 2.2, Bento Grid patterns, and more).

### Changed

- **Single canonical output**: `writeAgentConfig` now produces only `.ai/skills/AGENTS.md` + root `CLAUDE.md` pointer. Removed IDE selection step, `getActiveAgents`, `buildAgentStub`, `--agents`/`--ide` CLI flags, and all multi-agent stub generation (Cursor `.mdc`, Gemini `GEMINI.md`, Codex root `AGENTS.md`, Windsurf `.windsurfrules`, Roo `.clinerules`, Copilot `.github/copilot-instructions.md`).
- **Design preset removed from wizard**: `DESIGN` step and `designPreset` field purged from wizard, assembler, CLI parser, UI utils, and tests. Presets remain in the `ui-ux.md` skill; agents apply them at runtime, not at install time.
- **Docs filenames uppercased**: `agent-deep-flow.md` → `AGENT-DEEP-FLOW.md`, `software-development-lifecycle-sdlc.md` → `SOFTWARE-DEVELOPMENT-LIFECYCLE-SDLC.md`, `spec-driven-dev-guide.md` → `SPEC-DRIVEN-DEV-GUIDE.md`. All internal cross-references updated.
- **Images moved**: `src/assets/img/` → `docs/img/`. README image paths updated.

### Fixed

## [3.0.0] - 2026-04-15

> **Major release: Reformulation & Multi-Agent Support.** `sdg-agents` shifts from a knowledge-dump model to a router model, `AGENTS.md` is now a minimal registry and skills load on demand per cycle phase. Multi-agent and multi-idiom generation are first-class. The 8 Engineering Laws are renumbered 1–8 (was 0–7). See [docs/guides/MIGRATION-v3.md](guides/MIGRATION-v3.md) for the v2→v3 migration guide.

### Added

- **Router identity (`.ai/skills/` + on-demand load)**: `.ai/skill/` → `.ai/skills/` (plural); canonical Single Source of Truth for all engineering rules. 11 skill units: `staff-dna`, `code-style`, `testing`, `security`, `api-design`, `data-access`, `observability`, `ci-cd`, `cloud`, `sql-style`, `ui-ux`. Each loads only when the current cycle phase needs it (`staff-dna.md` always activates in Phase CODE; `testing.md` in Phase CODE and TEST; domain skills when the task touches the relevant domain).
- **Multi-agent support**: single `init` run writes entry files for every selected agent. `cli-parser.mjs` gained `--all-agents` and `--idioms` (alias for `--idiom`, back-compat preserved). Wizard's single-select IDE step became a multi-select covering Claude Code, Cursor, GitHub Copilot, Gemini, Codex, Windsurf, and Roo Code. `writeAgentConfig` now targets `GEMINI.md` (Gemini), root `AGENTS.md` stub (Codex), and adds `alwaysApply: true` to Cursor frontmatter. New `buildAgentStub()` renders thin 5-line pointer files for Codex and Gemini. `getActiveAgents` dedupes and excludes the `none` sentinel.
- **Multi-idiom support**: `--idiom typescript,python,go` in a single command; wizard multi-select for polyglot projects.
- **8 Engineering Laws (renumbered 1–8)**: Law 1 Protocol · Law 2 Hardening · Law 3 Resilience · Law 4 Narrative Cascade · Law 5 Visual Excellence · Law 6 Boundaries · Law 7 Reflection · Law 8 Contextual Efficiency. Law 1 (Protocol) formalizes the DNA-GATE and Mental Reset that must be crossed before any code modification. Law 8 (Contextual Efficiency) formalizes Token Discipline (Smart Truncation, Programmatic Analysis, Reference-Based Snapshots, Self-Purge).
- **Minimal `AGENTS.md` template**: `buildMasterInstructions()` in `instruction-assembler.mjs` rewritten to emit a ~83-line minimal output (manifesto + DNA-GATE + Session Start + Cycle Protocol + Agent Roles + dynamic Skill Registry + Cycle Commands). Removed 7 routing functions (UI/UX, creative toolkit, core governance table, architectural, technical, working cycles, project context) that previously inlined knowledge.
- **Terse Mode as default output**: 6 rules from the legacy `core/caveman.md` migrated into `templates/workflow.md` `TokenDiscipline` rule as the new "Terse Mode (Default)" sub-section. Pedagogical Mode is now opt-in (previously default). Tonal tables in `skills/ui-ux.md` and `writing-soul` updated to reflect the flip.
- **Assembler single source of truth**: `instruction-assembler.mjs` refactored to a single `SKILL_CATALOG` constant (13 entries) as the source for the dynamic Skill Registry; `buildSkillRegistry` filters by category and renders grouped output.
- **`docs/guides/MIGRATION-v3.md`**: v2→v3 migration guide with breaking changes table, step-by-step instructions, and v2→v3 file mapping.
- **`README.md` v3 updates**: new "Multi-Agent Support" section, new "Multi-Idiom" examples, v3 feature block replacing the Creative Design Toolkit bullet, fixed broken links to `src/assets/dev-guides/*` (moved to `docs/`), and updated "What Gets Installed" tree to show `.ai/skills/` layout. `docs/README.pt-BR.md` mirrors all changes.
- **`docs/CONSTITUTION.md` rewrite**: now presents all 8 Laws (was 7), includes Protocol (Law 1) and Contextual Efficiency (Law 8), fixes broken `staff-dna.md` pointer.
- **`docs/PROJECT-STRUCTURE.md` rewrite**: reflects the v3 tree (`.ai/skills/` on-demand, no `core/`, no `creative/`, no `workflows/`, no `dev-guides/`), documents load conventions per phase, and lists every skill file with its purpose.
- **`docs/UI-UX.md` update**: the four UI concerns (design thinking, standards, presets, architecture) are now top-down sections within the single consolidated `.ai/skills/ui-ux.md` skill, not four separate files.

### Changed

- **BREAKING: Engineering Laws renumbered 0–7 → 1–8**: `src/assets/skills/staff-dna.md`, `api-design.md`, `cloud.md`, `instructions/templates/workflow.md`, `src/engine/config/governance.mjs` (`GOVERNANCE_RULES` label shift), `src/engine/lib/core/display-utils.mjs`, `src/engine/bin/audit/check-narrative.mjs`, and `src/engine/bin/audit/audit-bundle.mjs` (sovereign check pattern strings shift from "Law 0"/"Law 7" to "Law 1"/"Law 8"). `src/engine/lib/domain/instruction-assembler.mjs` now emits "8 Engineering Laws" (was "6+ Engineering Laws") in the DNA-GATE Law Activation step.
- **BREAKING: `.ai/skill/` → `.ai/skills/`** (plural): all cross-references updated across the engine, the 11 skill files, templates, and command files. `ruleset-injector.mjs` now copies `src/assets/skills/` → `.ai/skills/` (this copy was missing in v2.x, generated AGENTS.md referenced skill files that were never populated in consumer projects).
- **BREAKING: `src/assets/instructions/core/` deleted** (16 files, ~90KB). Content dissolved into `.ai/skills/*`: `staff-dna` → `skills/staff-dna.md`; `code-style` + `naming` + `engineering-standards` → `skills/code-style.md`; `testing-principles` → `skills/testing.md`; `security` + `security-pipeline` → `skills/security.md`; `sql-style` → `skills/sql-style.md`; `api-design` → `skills/api-design.md`; `data-access` → `skills/data-access.md`; `observability` → `skills/observability.md`; `ci-cd` → `skills/ci-cd.md`; `cloud` + `containers` → `skills/cloud.md`; `ui/*` (4 files) + `writing-soul` → `skills/ui-ux.md` + Law 4 of `staff-dna.md`. `governance.mjs` `STANDARDS_PATH` repointed from `core/code-style.md` to `skills/code-style.md`. `audit-bundle.mjs` sovereign check repointed to `.ai/skills/staff-dna.md`.
- **BREAKING: `agent-roles.md` moved**: from deprecated `core/` to `src/assets/instructions/templates/agent-roles.md`. All 6 cycle command files (`sdg-feat.md`, `sdg-fix.md`, `sdg-docs.md`, `sdg-audit.md`, `sdg-land.md`, `sdg-end.md`) repointed.
- **BREAKING: multi-agent entry files**: `GEMINI.md` replaces the legacy `AI_INSTRUCTIONS.md` Gemini target. Codex adds an `AGENTS.md` stub. Cursor entry files now carry `alwaysApply: true` in the frontmatter.
- **BREAKING: agent stubs live under `.ai/<agent>/`**: all multi-agent entry files are now written inside namespaced subfolders of `.ai/` for reference and organization (`.ai/cursor/rules/sdg-agents.mdc`, `.ai/copilot/copilot-instructions.md`, `.ai/gemini/GEMINI.md`, `.ai/codex/AGENTS.md`, `.ai/windsurf/.windsurfrules`, `.ai/roocode/.clinerules`). `CLAUDE.md` at repo root is the **sole exception**; Claude Code auto-loads it natively and its single `@`-import points back at `.ai/skills/AGENTS.md`. Downstream projects using Cursor/Copilot/Gemini/Codex/Windsurf/Roo must either symlink the file to the native root location or reference the `.ai/<agent>/` path manually; native auto-discovery at the repo root no longer applies. Affected: `instruction-assembler.writeAgentConfig()` `ideTargets` map and `ui-utils.renderPreviewIdeTargets()` dry-run preview.
- **package.json description** rewritten for v3: "AI-Native Governance Framework: router-model instruction set with on-demand skills, 8 Engineering Laws, and multi-agent support for Claude, Cursor, Copilot, Gemini, Codex, Windsurf, and Roo Code."

### Removed

- **BREAKING: Creative Design Toolkit**: `src/assets/dev-guides/prompt-tracks/` and `src/assets/creative/*` deleted. Out of scope for v3. The `src/engine/bin/init/creatives-bundle.mjs` binary, the `injectCreativeToolkit` and `injectPrompts` engine functions, the `--dev-guides`/`--no-dev-guides` flags, and the `prompts`/`creatives` wizard modes are all gone.
- **BREAKING: `.ai/workflows/governance.md`**: the 01–08 roadmap was unused operationally and the 7 Laws it restated live canonically in `skills/staff-dna.md`. Working Protocol now lives exclusively in `.ai/instructions/templates/workflow.md`.
- **BREAKING: `core/caveman.md`**: 6 rules migrated to `templates/workflow.md` TokenDiscipline as "Terse Mode (Default)".
- **BREAKING: `.ai/dev-guides/`**: removed from the generated `.ai/` tree. Reference versions (`spec-driven-dev-guide.md`, `agent-deep-flow.md`, `software-development-lifecycle-sdlc.md`) now live in `docs/` of this repository only.
- **`add-idiom` subcommand**: removed (scope cut, idioms are now selected via the wizard checkbox or `--idiom` flag).
- **`.ai/last-prompt.md`** feature removed.

### BREAKING CHANGES

1. **`.ai/` layout changed.** Run `npx sdg-agents clear` before upgrading, then re-run `npx sdg-agents init` to write the new layout.
2. **`core/` directory is gone.** Local edits under `.ai/instructions/core/` must be migrated to the corresponding `.ai/skills/*` file. See [docs/guides/MIGRATION-v3.md](guides/MIGRATION-v3.md) §5 for the mapping table.
3. **Engineering Laws renumbered.** Any project documentation that references "Law 0", "Law 1", …, "Law 7" by number (not by name) must shift by +1. Referencing by name (Protocol, Hardening, Resilience, Narrative Cascade, Visual Excellence, Boundaries, Reflection, Contextual Efficiency) remains stable.
4. **Creative Toolkit removed.** Projects that used `injectCreativeToolkit` or `--dev-guides` will fail on upgrade. Remove those references.
5. **`.ai/skill/` → `.ai/skills/`.** Any custom tooling that hardcoded the singular path must be updated.
6. **Gemini entry file renamed.** `AI_INSTRUCTIONS.md` → `GEMINI.md`. Delete the old file manually if your project retained it.
7. **Agent stubs relocated under `.ai/<agent>/`.** Only `CLAUDE.md` remains at repo root. If you rely on native auto-discovery for Cursor/Copilot/Gemini/Codex/Windsurf/Roo Code, you must symlink the generated file to the native path (`.cursor/rules/sdg-agents.mdc`, `.github/copilot-instructions.md`, `GEMINI.md`, `AGENTS.md`, `.windsurfrules`, `.clinerules`) after running `init`, or configure your agent to read from `.ai/<agent>/` directly.

### Fixed

- **`ruleset-injector` skills copy gap**: skills are now copied to `.ai/skills/` during init. In v2.x the `.ai/skill/AGENTS.md` referenced skill files that were never populated in generated projects, this silent gap is now closed.
- **`manifest-utils.computeHashes`** swapped its `core/` scan for a `skills/` scan, hashes now reflect canonical SSOT.

## [2.16.0] - 2026-04-15

### Added

- **v3.0 M1 completion (M1.4 + M1.5 SSOT audit)**: Closed Milestone M1 by eliminating all remaining redundancy under `src/assets/instructions/**`. Deleted `workflows/governance.md` (01–08 roadmap unused operationally; the 7 Laws it restated already live canonically in `skills/staff-dna.md`); the empty `workflows/` directory was removed. Deleted `core/caveman.md` after migrating its 6 rules into `templates/workflow.md` under the `TokenDiscipline` rule as a new **"Terse Mode (Default)"** sub-section: and flipped the tonal default: **Terse Mode is now the default output mode**, Pedagogical Mode is opt-in (previously Pedagogical was the default chat mode). Updated the Mouth-vs-Soul tonal tables in `skills/ui-ux.md` and `core/writing-soul.md` to reflect the new default, rename "Caveman" → "Terse", and point callers to `workflow.md` TokenDiscipline for the 6 rules. Ran a full SSOT audit across `commands/`, `competencies/`, `flavors/`, `idioms/`, `templates/`, `workflows/`, and `core/`: all non-skill rulesets (cycle commands, phase-SPEC competencies, architectural flavors, per-language idioms, templates) confirmed as legitimate KEEP; all legacy `core/*` files remain PENDING-M3.6 (untouched until round-trip validation); `agent-roles.md` deferred to M3.6 as a meta-protocol rather than a domain skill. Zero broken references (grep-verified). 107/107 tests green. Unblocks M2.1 (multi-agent stub refactor).

### Fixed

## [2.15.0] - 2026-04-15

### Added

- **v3.0 M1.3: Skills directory + SSOT clarification**: Renamed `src/assets/skill/` → `src/assets/skills/` (plural) via `git mv` to preserve history. Propagated the new path across the engine (`instruction-assembler.mjs`, `instruction-assembler.test.mjs`, `ui-utils.mjs`, `wizard.mjs`, `audit-bundle.mjs`), the skill cross-references (`.ai/skill/*` → `.ai/skills/*` across all 11 skill files), and `README.md`. Explicit SSOT rule added to M1.3 backlog entry: `src/assets/skills/*` is canonical; `src/assets/instructions/core/*` is deprecated-pending-M3.6 and preserved only for round-trip validation. Aligns the project with its router-oriented identity, a minimal `AGENTS.md` registry + on-demand skill loading per cycle phase. 107/107 tests green.

### Fixed

## [2.14.0] - 2026-04-15

### Added

- **v3.0 M1.2: Testing Skill Unit**: Converted `src/assets/instructions/core/testing-principles.md` into `src/assets/skill/testing.md` with the skill-unit header and a Phase-CODE/TEST load convention note. All 10 rules preserved 1:1 (`TestingStrategy`, `TestNamingConvention`, `TestStructure`, `NamedExpectations`, `WhatNotToTest`, `TestDoubles`, `FlakyTestManagement`, `CoverageStrategy`, `TestDataEnvironments`, `LegacyApproach`) with their examples, admonitions, and AI Agent Self-Audit intact. Fixed the broken `security-pipeline.md` cross-reference with an inline `<!-- TBD: .ai/skill/security.md -->` marker (mirrors the pattern used in `code-style.md`). Legacy source preserved for M3.6 round-trip.

### Fixed

## [2.13.0] - 2026-04-15

### Added

- **v3.0 M1.2: Skill Units (staff-dna + code-style)**: Relocated `staff-dna.md` to `src/assets/skill/staff-dna.md` with updated `.ai/skill/*` cross-references and a Phase-CODE-only load convention note. Merged `code-style.md` + `naming.md` + `engineering-standards.md` into `src/assets/skill/code-style.md`, a unified, top-down skill (Naming → Scansion → Narrative → Tactical) with 15 rules. Deduped `AbstractConfig`, `StaffGradeVCS`, `DefinitionOfDone` (each previously defined twice) and rebuilt the broken `NarrativeSLA` carousel fence from the legacy source. Source files in `src/assets/instructions/core/` preserved (deletion deferred to M3.6 cleanup).

### Fixed

## [2.12.3] - 2026-04-15

### Added

### Fixed

- **Governance Audit Compliance: Laws & Sovereign Protocol**: Extracted file-scanning utilities (`getMaintainerFiles`, `getMaintainerTestFiles`, `getFilesRecursive`) from `audit-bundle.mjs` into a dedicated `audit-file-scanner.mjs` lib, reducing top-level function density from 15 to 12 (Laws Compliance pass). Added `DNA-GATE & MENTAL RESET [LOCKED]` section to `AGENTS.md` to satisfy the Sovereign Protocol check (audit now at 100%).
- **Workflow Protocol Enforcement in Source**: Added `buildDnaGateBlock()` to `instruction-assembler.mjs` so all generated `AGENTS.md` files include the DNA-GATE section. Rewrote `buildWorkflowPointer()` to make phase execution mandatory, explicit steps with approval gates, token estimate requirements (`📊`), and a protocol violation warning for skipping phases.

## [2.12.2] - 2026-04-15

### Added

### Fixed

- **JavaScript isFrontend Classification**: Corrected `isFrontend` flag for the `javascript` (Vanilla / ESM) idiom from `true` to `false`. ESM/Node stacks no longer trigger the Frontend framework prompt, Design Preset step, or `frontend.md` competency injection; those remain exclusive to `typescript` and other UI-oriented idioms.

## [2.12.1] - 2026-04-15

### Added

### Fixed

- **Token Efficiency & Context Loading Hardening**: Fixed duplicate `javascript/patterns.md` entry in Technical Execution table (assembler deduplicates idioms array). Moved `ci-cd.md` and `cloud.md` from always-visible Technical Execution to On Demand backend section. Replaced `agent-roles.md` On Demand entry with `observability.md` (agent-roles is already loaded via command file footers). Split Project Context into session-start essentials (`context.md`, `tasks.md`) and On Demand (`learned.md`, `troubleshoot.md` with explicit load conditions). Added Task Recovery directive to Session Start step 5, agents now load `workflow.md` immediately when an `[IN_PROGRESS]` task is found, without waiting for a cycle command. Added `Load now: workflow.md` directive to `sdg-audit.md` (parity with all other command files). Added Core Rules always-exempt clause to Phase CODE step 2 to resolve implicit conflict with Impact Map skip rule.

## [2.12.0] - 2026-04-15

### Added

- **Aggressive Context Lazy Loading**: `workflow.md` is no longer inlined in the generated `AGENTS.md`. Session start now loads ~1.000 tokens (manifesto + session-start + pointer + tables) instead of ~4.000. Workflow is deferred until a cycle starts (`feat:`, `fix:`, `docs:`, `end:`), when each command file explicitly instructs loading it.
- **Self-Contained Command Files**: `sdg-feat.md`, `sdg-fix.md`, `sdg-docs.md`, and `sdg-end.md` each received an explicit `Load now: workflow.md` directive, making every cycle entry point self-sufficient without relying on auto-loaded context.
- **Session Gate (Hard Stop at END)**: Phase END step 8 replaced "suggest next step" with a mandatory hard stop: write one-line next objective to `context.md ## Now`, then halt the session. Next task starts fresh in a new session.
- **Creative Toolkit Opt-In**: Creative toolkit injection is now off by default (`noCreative = true`). Consumer projects that don't use creative assets no longer pay ~300 token overhead in AGENTS.md or receive unused creative files.
- **Backend Domain Files On Demand**: `data-access.md`, `sql-style.md`, and `api-design.md` moved from the always-visible Technical Execution table to an "On Demand" sub-table, load only when the task touches DB layer, queries, or endpoint design.

### Fixed

## [2.11.0] - 2026-04-15

### Added

- **Context Load Optimization: Lean Default Install**: Dev-guides are now off by default (opt-in via `--dev-guides`), removing ~32K tokens from the standard install. Deprecated `--no-dev-guides` flag with a warning. Removed unused `workflows/` directory from consumer project install. Slimmed the Core Governance reference table in the assembled AGENTS.md from 10 files to 4 essentials (`staff-dna`, `engineering-standards`, `code-style`, `naming`) plus an explicit "On Demand" section for context-specific files.
- **Token Visibility in Working Protocol**: Added Context Report step to Phase SPEC (shows tokens loaded at session start) and Cost Estimate step to Phase PLAN (shows estimated task token count before approval gate). Calculated via `wc -c ÷ 4` on read files plus conversation overhead.
- **workflow.md Condensed**: Impact Map instructions, Session Start protocol, and Token Discipline rule condensed without loss of behavior. 3789 → 3303 tokens.

## [2.10.1] - 2026-04-15

### Fixed

- **UI/UX Tonal Scale Integration & Single Source of Truth**: Integrated the tonal hierarchy rule (S0–S3 nesting, +1 level per container, 4–8% OKLCH Lightness delta per level) into `design-thinking.md` Phase 0.2, including composition anti-patterns and a standard reference model. Eliminated documentation duplication: Spacing L1–L4 removed from `architecture.md` (owner: `standards.md`), States section collapsed in `presets.md` to a reference link (owner: `standards.md`). Declared single source of truth per domain across all four UI files. Created `docs/UI-UX.md` with the design hierarchy, tonal scale explanation, preset table, and ownership map. Updated `README.md` and `docs/README.pt-BR.md` with links to `UI-UX.md` and corrected Quick Start: added `--quick` flag, removed obsolete `--toolkit creative`.

## [2.10.0] - 2026-04-15

### Added

- **CLI Streamlining: Menus, Quick Flag & Smart Defaults**: Simplified the interactive wizard by removing the explicit scope question (scope now inferred from selected idioms), replacing N per-idiom version prompts with a single "Code Style" choice (Latest / Conservative), reducing design presets from 8 to 4, auto-detecting bump from JS/TS idioms, and merging the two partner prompts into one. Added `--quick` CLI flag for zero-prompt installs. Restructured the main menu to 3 items (Build Project · Settings · Exit) with Governance Audit moved inside Settings. Updated `package.json` description for better SEO and value clarity.

### Fixed

## [2.9.2] - 2026-04-15

### Added

### Fixed

- **Consumer Mode Audit Isolation**: Implemented `isMaintainerMode()` in `fs-utils.mjs` to distinguish between the core `sdg-agents` repo and consumer projects. The Instruction Sync check is now automatically skipped in consumer projects, Laws Compliance scans `src/**/*.mjs` instead of hardcoded internal paths, and Writing Soul only requires `README.md` (making `docs/` files optional). Eliminates false-positive "Drift detected" and "Instruction Sync" errors when running `npx sdg-agents audit` in any downstream project.

## [2.9.1] - 2026-04-14

### Added

- **Hardened Changelog Gate**: Updated the audit engine to detect and block commits when staged changes exist but the `[Unreleased]` section of the changelog is empty, ensuring all code changes are documented.

### Fixed

- **Auditor Naming Compliance**: Fixed Law 2 (No Abbreviations) violations in the audit engine's internal scansion logic.

## [2.9.0] - 2026-04-14

### Added

- **Stricter Commit Approval Gate**: Implemented a mandatory `[LOCKED: COMMIT-GATE]` in `workflow.md` and `agent-roles.md` that explicitly forbids autonomous `git commit` actions and requires verbal human approval.

### Fixed

- **Creative Toolkit Zero-Project Support**: Hardened the creative injection flow to provide core governance rules and backlog files even in empty project states.
- **Resilient Instruction Assembly**: Fixed malformed tables and broken links in `AGENTS.md` for projects without a tech stack.

## [2.8.1] - 2026-04-14

### Added

- _Internal release synchronization._

### Fixed

- **Creative Bundle Pure Entry Point**: Fixed a missing `return` in `Creatives.run` and refactored it to a one-line delegator to satisfy SLA governance.

## [2.8.0] - 2026-04-14

### Added

- **Engineering Laws Semantic Refactor**: Decoupled law numbering project-wide to ensure future scalability and resilience.
- **Project References & Credits**: Created `docs/REFERENCES.md` to acknowledge external philosophies (Caveman, Context-mode, Writing Soul) and UI research (UI/UX Pro Max, TypeUI, Tweak/Shadcn).
- **DNA-GATE & MENTAL RESET [LOCKED]**: Formalized mandatory mental reset step in `workflow.md` and `AGENTS.md` to satisfy Sovereign Protocol (Law 0) requirements.

- **Test Suite Governance Hardening**: Total refactor of `fs-utils.test.mjs` to satisfy Testing Principles (Atomic Actions, Triad Pattern, Vertical Scansion).

### Fixed

- **Test Suite Alignment**: Refactored `package.json` and unit tests (`fs-utils`, `cli-parser`) to achieve 100% compliance with recursive basin architecture and naming standards.
- **Audit Consistency**: Resolved sync drift between `.ai/` instructions and source assets.

## [2.7.0] - 2026-04-14

### Added

- **Sovereign Protocol (Law 0)**: Hardened governance by introducing Law 0, establishing project instructions as the ultimate authority over general AI training bias.
- **DNA-GATE [LOCKED]**: Implemented a mandatory 'Mental Reset' gateway at the start of Phase: CODE to ensure strict adherence to engineering laws.
- **Contextual Efficiency (Law 7)**: Integrated project philosophies for token reduction, including Smart Truncation (60/40 Split) and Reference-Based Snapshots.
- **Backlog Health Audit**: Added automated detection for context bloat in `.ai-backlog/` directories.

### Fixed

- **Explaining Returns (Law 3)**: Refactored engine utilities and audit runner to eliminate literal/bare returns and satisfy scansion laws.
- **Named Expectations**: Hardened unit tests to eliminate magic values and enforce the `actual`/`expected` triad.

## [2.6.0] - 2026-04-13

### Added

- **Laws Compliance Protocol**: Renamed "Law 3 compliance" to "Laws Compliance" and hardened the auditor's symbol scansion to 100% strictness.
- **Smart-Strict Scansion**: New auditor logic that enforces Explaining Returns even for literal objects and multi-line assignments.
- **High-Visibility Auditing**: Updated the audit runner to report all violations in a single pass, eliminating "blind spots" in governance.

### Fixed

- **Narrative Cascade (Law 3)**: Eliminated 15+ bare and literal returns across `fs-utils.mjs`, `ui-utils.mjs`, `wizard.mjs`, and all engine binaries.
- **SLA Drift**: Standardized all CLI entry points to a strict One-Line Pure Entry Point pattern.
- **Governance Engine Hardening (`init/`)**: refactored the project initialization and injection binaries (`add-idiom`, `build-bundle`, `creatives-bundle`) to satisfy the One-Line Entry Point mandate (v2.4.3).
- **Core Binary Resilience**: extracted logic from `runIfDirect` entry points into local sibling helpers, achieving 100% SLA compliance in the init domain basin.
- **Narrative scansion alignment**: standardized return patterns across the `init/` basin for improved vertical scansion.

## [2.5.2] - 2026-04-13

### Added

### Fixed

- **Governance Engine Hardening (`audit/`)**: refactored the audit bundle and checkers to achieve 100% compliance with the One-Line Entry Point mandate (v2.4.3).
- **Audit Tool Scansion**: hardened internal scansion logic and return narratives in `audit-bundle.mjs`, ensuring the governance engine satisfies its own strict scansion laws.

## [2.5.1] - 2026-04-13

### Added

- **Hardened Naming Governance**: updated the `audit` engine with programmatically enforced heuristics to block single-letter variables (`a, b, i, v`) and abbreviations across all engine basins.
- **Improved Heuristic Depth**: increased the Explaining Returns scansion depth and refined regex to ignore template interpolations (`${`), eliminating false positives in heavy template orchestrations.
- **Narrative Siblings Refactor**: refactored the central `NARRATIVE_VALIDATION_STRATEGIES` engine to adopt a delegator pattern with local sibling helpers, achieving 100% SLA and Law 3 compliance within the governance config itself.

### Fixed

- **Naming Discipline Debt**: resolved residual single-letter variable violations in `wizard.mjs`, `cli-parser.mjs`, and `version-utils.mjs`.
- **Governance Drift Prevention**: synchronized all core instruction assets (`code-style.md`) to ensure perfect alignment between the generator and the auditor.

## [2.5.0] - 2026-04-13

### Added

- **0-Drift Governance Achievement**: hardened all engine basins (`src/engine/lib/`) and binaries (`src/engine/bin/`) to reach 100% compliance with Law 3 (Narrative Cascade) and Explaining Returns.
- **Audit Tool Self-Hardening**: refactored the governance engine and audit runner (`governance.mjs`, `audit-bundle.mjs`) to satisfy the same strict engineering standards they enforce on the project.
- **Unified Lifecycle Hardening**: standardized `auto-bump`, `clear-bundle`, `review-bundle`, and `sync-rulesets` to follow the Pure Entry Point pattern and Narrative Siblings architecture.

### Fixed

- **Engine Structural Debt**: resolved residual bare returns and entry point violations across the maintenance and lifecycle basins, achieving a total 0-drift status.

## [2.4.3] - 2026-04-13

### Added

- **One-Line Entry Point Mandate**: formalized the rule that `run()`, `start()`, and `init()` must be limited to a single line of delegation.
- **Automated SLA Heuristics**: updated the governance auditor to programmatically detect Pure Entry Point violations and enforce Explaining Returns Project-wide.

### Fixed

- **Narrative Cascade (Law 3) in index.mjs**: refactored the main CLI entry point to 100% compliance, implementing a pure one-line `run()` delegator and narrative sibling patterns.
- **Audit Tool Blind Spots**: expanded scansion scope to include the project root bin and hardened regex-based heuristics for complex multi-line orchestrations.

## [2.4.2] - 2026-04-13

### Added

### Fixed

## [2.4.1] - 2026-04-13

### Added

- **Narrative Siblings Pattern (Law 3 Evolution)**: redefined the Lexical Scoping rule to favor local module-level functions (siblings) over nested functions. This transition standardizes function placement immediately following their caller (Stepdown Rule) to eliminate nesting debt and simplify maintenance of growing logic.

### Fixed

## [2.4.0] - 2026-04-13

### Added

- **Domain-Driven Basin Architecture (src/engine/)**: refactored the entire engine into logical basins: `bin/` (orchestrators for init, audit, maintenance, lifecycle) and `lib/` (core, infra, and domain layers), improving scannability and modularity.
- **Narrative Cascade (Law 3) Hardening**: achieved 100% compliance by enforcing the **Pure Entry Point** pattern across all binaries and systematically eliminating shorthand variables (`targetDir`, `pkg`, etc.) in favor of narrative identifiers.
- **Improved Governance Observability**: updated the `audit` suite to support the new basin structure and implemented self-detection resilience for engineering law enforcement.

### Fixed

- **Engine Structural Debt**: resolved fragmented logic and naming inconsistencies across 40+ files, achieving 100% compliance in the Governance Audit.
- **Audit Runner Stability**: fixed a critical syntax error and variable scope issue in the narrative scansion loop.

## [2.3.1] - 2026-04-13

### Added

### Fixed

- **Audit Runner Stability**: resolved `DeprecationWarning: [DEP0190]` in `audit-bundle.mjs` by refactoring `spawnSync` calls to avoid `shell: true` with argument arrays.

## [2.3.0] - 2026-04-13

### Added

- **Markdown-Driven Governance SSOT**: refactored the governance engine to dynamically parse rules and checklists directly from `engineering-standards.md`, establishing the documentation as the single source of truth for automated audits.
- **Narrative Cascade (Law 3) Hardening**: implemented automated heuristics for "Revealing Module Pattern" enforcement and "Prefix-based Boolean Naming" within the audit suite.

### Fixed

- **Engine Refactoring (Law 3 Compliance)**: refactored 10+ core library files to adopt the `export const Module = { ... }` pattern, achieving 100% narrative compliance.
- **Audit Runner Stability**: fixed a `TypeError` in the `runIfDirect` utility and resolved linting regressions in the configuration manifest.

## [2.2.0] - 2026-04-13

### Added

- **Hardened Governance Audit**: implemented narrative slop detection in `audit-bundle.mjs` to flag structural meta-comments (`// Arrange/Act/Assert`) and non-descriptive numbered variables (`input1`, `actual2`).
- **Transformation Scansion Protocol**: formalized the `actualRaw` vs. `actual` pattern in `testing-principles.md` to separate computation from presentation check.

### Fixed

- **Narrative Debt Removal**: refactored the entire unit test suite (9 files) to eliminate structural meta-comments in favor of vertical scansion.
- **Expressive Test Naming**: refactored `auto-bump.test.mjs` and `fs-utils.test.mjs` to replace numbered input variables with intent-based identifiers.

## [2.1.0] - 2026-04-13

### Added

- **Governance Audit Command**: implemented a dedicated `audit` subcommand in the CLI that performs comprehensive project health checks, including drift detection, narrative health, and Law 3 compliance analysis.
- **Audit Runner**: created `src/engine/bin/audit-bundle.mjs` to consolidate all governance checks into a single reportable audit summary.

### Fixed

- **Law 3 Compliance (Lexical Scoping)**: refactored `FsUtils` to encapsulate internal versioning helpers inside `filterContentByVersion`, aligning with the project's Narrative Cascade standards.
- **FsUtils Test Regression**: refactored unit tests to cover internal logic via the public API after the Lexical Scoping refactor.

## [2.0.0] - 2026-04-13

### 🏆 Milestone: Governance Observability

This major release marks the transition from static instruction sets to active **Governance Observability**. With the introduction of the Audit Gate and Circuit Breaker, the SDG ecosystem now provides a feedback loop that proactively detects architectural drift and prevents infinite refactoring cycles, establishing a new industrial standard for AI-driven engineering.

### Added

- **Audit Instruction & QA Gate**: introduced `.ai/commands/sdg-audit.md` to trigger full governance audits, and integrated the "Audit Gate" directly into the TEST phase of the Working Protocol to act as a governance drift detector during `feat` and `fix` cycles.
- **Circuit Breaker Rule**: hardened the Working Protocol's Fix Loop by enforcing a 3-strike mechanism; agents must now explicitly STOP and deliver a Failure Report after 3 failures (test, lint, or audit) instead of looping endlessly.
- **Improved Project Structure**: Inverted the documentation hierarchy to prioritize instructions (`.ai/`) over backlog (`.ai-backlog/`) and simplified the root-level tree for enhanced readability.

## [1.24.0] - 2026-04-13

### Added

- **Writing Soul v2**: upgraded `writing-soul.md` with an explicit pedagogical tone as the default: technical terms are kept in English (when field-standard) and followed by a contextual explanation in parentheses describing what the term **does**, not just what the acronym expands to (e.g., `CI/CD (pipeline that automates build, test, and deploy on every commit)`). Added a 5-row context table under `## Mouth vs Soul` covering chat, Caveman, source code, code comments, and perennial artifacts. Integrated a curated `## Anti-Patterns Reference (Stop-Slop)` section with banned phrases, structural anti-patterns (false agency, narrator-from-a-distance, binary contrasts, passive voice, dramatic fragmentation), and an 11-point quick-checks checklist for pre-delivery self-review. Credits [stop-slop](https://github.com/hardikpandya/stop-slop) by Hardik Pandya.

### Fixed

## [1.23.0] - 2026-04-13

### Added

- **Impact Map Protocol**: introduced `.ai-backlog/impact-map.md`, a volatile blast-radius file created at Phase PLAN (via `git diff` + import scanning) and cleared at Phase END. The map restricts the agent's read-list to only the files affected by the current cycle, changed files, their dependents, and tests at risk; keeping context lean and focused. Includes regeneration logic at Session Start for backlog recovery scenarios. Inspired by the structural philosophy of [code-review-graph](https://github.com/tirth8205/code-review-graph).

## [1.22.0] - 2026-04-13

### Added

- **Standardized Release Commits**: updated workflow instructions to explicitly require the `<intent>: release v<version> - <description>` pattern for all automated bumps.

### Fixed

## [1.21.3] - 2026-04-13

### Added

### Fixed

- **Documentation Sync**: updated `README.md`, `docs/README.pt-BR.md`, and `docs/PROJECT-STRUCTURE.md` to reflect the new Creative Design Toolkit features, Item 4 menu logic, and centralized architecture.

## [1.21.2] - 2026-04-13

### Added

### Fixed

- **Shared Engine Logic**: Centralized `getActiveAgents` in `InstructionAssembler` to eliminate code duplication across injection bundles.
- **Toolkit Manifest Traceability**: Integrated `writeManifest` into the `creatives` flow to ensure CLI version and selections are recorded in `.sdg-manifest.json` after standalone injections.
- **Enriched Agent Routing**: Expanded the `AGENTS.md` Creative Toolkit table to include direct links to Templates and Tactic Guides, improving AI discoverability of specialized assets.
- **Local Asset Context**: Updated skill assets with explicit local path references for better multi-agent coordination.
- **Governance Resilience**: Removed `CLAUDE.md` from git tracking and enforced it via `.gitignore` to prevent IDE-specific meta-contamination in the repository.

## [1.21.1] - 2026-04-13

### Added

- **Creative Dev-Guides Hub**: added specialized guides for Instagram, TikTok, LinkedIn, and YouTube (including safe zones and prompt logic).
- **Hardened Ruleset Injection**: restored recursion for dev-guides subfolders in the injection engine.

### Fixed

- **Creative Toolkit Menu Navigation**: Moved the "Creative Design Toolkit" option from the main menu into the `Setup` submenu (Option 1) to align with standard project initialization workflows; removed the 🎨 emoji to maintain visual consistency.
- **Centralized Creative Assets**: Refactored the injection engine to centralize all toolkit assets under `.ai/instructions/creative/` (Skills, Templates, and Guides), eliminating fragmented directories in `prompts/` and `dev-guides/`.
- **Governance Path Synchronization**: Updated `AGENTS.md` and the internal assembler to reflect the new centralized paths; implemented automatic cleanup of legacy creative folders during new injections.

### Added

- **Creative Design Toolkit (Option 4)**: Implemented a specialized "Injection" flow for brand identity, logos, social media (IG, TikTok, LinkedIn, YouTube), and landing page blueprints; added `core/creative`, `prompts/creatives`, and specialized `dev-guides/creatives/` assets to the instruction ecosystem.

### Fixed

## [1.20.1] - 2026-04-13

### Added

- **Roadmap Revision (Vision 2.x)**: Updated `ROADMAP.md` to reflect `v1.20.0` resilience achievements and projected the next maturity stages: Governance Observability (`sdg audit`), Global Instruction Registry (`sdg use`), MCP Semantic Indexing, and Visual Governance.

### Fixed

## [1.20.0] - 2026-04-13

### Added

- **Partner Metadata Step**: Added Step 9 to the interactive wizard to capture developer name and role; implemented `## Partner` section in `context.md` with localized greetings (PT-BR/EN).
- **Hardened Input Sanitization**: Implemented `safeInput` with Unicode normalization, HTML/Script stripping, and Markdown escaping; enforced 2-50 character limits for developer names.
- **Wizard Architectural Refactor**: Replaced magic numbers with semantic `WIZARD_STEPS` identifiers and implemented an index-based `STEP_ORDER` for resilient navigation.
- **Intelligent Context Injection**: Upgraded the instruction assembler to safely inject the `## Partner` section into existing `context.md` files without overwriting user changes.
- **Backend-Only UI Optimization**: Modernized the wizard flow to automatically skip design-related presets when the project scope is set to Backend single-idiom.

### Fixed

## [1.19.2] - 2026-04-12

### Added

### Fixed

- **Harness Engineering (Memory) Label**: refined the terminology label from "Harness Engineering" to "Harness Engineering (Memory)" across all documentation for conceptual clarity.

## [1.19.1] - 2026-04-12

### Added

### Fixed

- **Harness Engineering Terminology**: updated `README.md`, `README.pt-BR.md`, and `PROJECT-STRUCTURE.md` to replace "Session memory & Expertise" with the official term "Harness Engineering" across all documentation.

## [1.19.0] - 2026-04-12

### Added

- **Universal Cycle Coverage**: extended `Phase: END` governance (`sdg-end.md`, `workflow.md`, `AGENTS.md`) to enforce CHANGELOG entries for all cycle types (`docs:` and `land:` now have explicit section mappings); bumped `scripts/bump.mjs` and template to accept `docs` and `land` as valid intents mapping to `patch`.
- **SSOT Consolidation**: refactored `sdg-end.md` from a full 7-step redefinition into a thin pointer to the canonical `Phase: END` in `workflow.md`/`AGENTS.md`, eliminating protocol duplication across governance files.

### Fixed

## [1.18.2] - 2026-04-12

### Added

### Fixed

- **Phase END: Dynamic Bump Protocol**: `workflow.md` and `AGENTS.md` updated to auto-detect the `bump` script and execute it before every release commit, eliminating pre-push narrative blockers across all cycle types.

## [1.18.1] - 2026-04-12

### Added

### Fixed

- **Dynamic Semantic Delivery**: hardened `Phase: END` instructions in `workflow.md` to autonomously verify the existence of a `bump` script in `package.json` and execute `npm run bump` before proposing commits, preventing `pre-push` narrative blockers.
- **Documentation Alignment**: updated `README.md`, `README.pt-BR.md`, and `PROJECT-STRUCTURE.md` to accurately reflect the `.ai/` tree structure, including the decoupled `.ai/instructions/templates/` and centralized `.ai/workflows/` directories.

## [1.18.0] - 2026-04-12

### Added

- **Micro-Governance Resilience**: Refactored FsUtils to use pure error bounds (`safeReadJson`); decoupled context templates into `src/assets/instructions/templates/backlog/` resolving script entanglement; optimized rule injection with substring fast-paths.

### Fixed

- **Wizard State Tracking**: Replaced fragile loops with an immutable `historyStack` in the CLI wizard to fix progression errors and state bleeding on back navigation.

## [1.17.1] - 2026-04-12

### Added

### Fixed

- **Single Source of Truth**: Centralized all Claude Code and multi-agent governance logic directly into `AGENTS.md` and `workflow.md`; migrated the "Terminal Sanity Check" to the universal Session Start protocol to enforce execution checks across all IDEs; replaced bloated `CLAUDE.md` generation with a minimal reference pointer.

## [1.17.0] - 2026-04-12

### Added

- **Agent Governance Refactor**: Hardened the SDG Agents CLI workflow instructions. Redefined the 6 core Staff DNA laws as the undisputed Single Source of Truth (SSOT), removing duplication from the Assembler.
- **Environment-Agnostic Roles**: Refactored `.ai/instructions/core/agent-roles.md` to define Single-Agent as the universal standard execution trace across IDEs, treating sub-agent orchestration (`claude`) strictly as an enhanced extension.
- **Token Discipline Consolidation**: Streamlined `CAVEMAN.md` generation to eliminate redundant path allocations within the workspace.

### Fixed

## [1.16.0] - 2026-04-12

### Added

- **Zero-Leak END Resilience**: hardened the delivery cycle with mandatory workspace audits and catch-all staging (`git add .`) to prevent uncommitted side-effects.
- **Self-Healing Technical Quality**: integrated automatic lint-repair (`lint --fix`) into the END phase to resolve formatting blockers without interrupting the delivery.
- **Automated Context Bootstrapping**: added fallback logic to the END cycle to automatically recreate `.ai-backlog/context.md` if it is missing or lost.
- **Contextual Narrative Guard**: refactored the engine to allow semantic release commits by validating against specifically promoted version headers.

### Fixed

## [1.15.0] - 2026-04-12

### Added

- **Hardened Action Workflow**: refactored the Working Protocol to a strict 5-phase execution flow (SPEC, PLAN, CODE, TEST, END) with mandatory manual approval gates for delivery.
- **Token Discipline 2.0**: retired upfront "Step 0" context loading in favor of just-in-time loading during SPEC and CODE phases based on specific demand.
- **Narrative Gate Restoration**: reintegrated the full function-level quality checklist into the CODE phase.
- **Official English Standardization**: synchronized all instruction assets with official English terminology and "MODE: PLANNING/FAST" mindset labels.

### Fixed

## [1.14.2] - 2026-04-11

### Fixed

- **Hardening Agent Governance**: decoupled versioning from committing in `bump.mjs` and `auto-bump.mjs`. All manual and automated bumps now require an explicit, approved commit after files are updated.
- **Protocol instructions update**: hardened `sdg-end.md` to reflect the decoupling of the release cycle.

## [1.14.1] - 2026-04-11

### Added

### Fixed

- **CHANGELOG Date Timezone Drift**: switched from UTC-based `toISOString()` to local `en-CA` formatting in all bump scripts and templates; ensures dates in promoted headers match the developer's machine clock instead of jumping +1 day ahead in late-night releases.

## [1.14.0] - 2026-04-11

### Added

- **UI/UX Governance Evolution**: formalized the "Elevation Stack" (S0-S3) to replace the basic theme inversion law; introduced dedicated logic for dark mode elevation where surfaces become lighter as they "ascend" towards the user.
- **Component Nesting (Anilhamento)**: codified the "Concentric Radius Rule" (Outer - Padding = Inner) and border hierarchy standards for complex structural interfaces.
- **OKLCH Adaptive Chroma**: refined the perceptual color progression scale with "Vibe Control" (Vibrant vs Muted) modifiers to prevent visual weight issues in dark themes.
- **Visual Density Standards**: quantified spacing levels L1 through L4 with specific pixel/Tailwind targets to ensure information density consistency.

### Fixed

## [1.13.0] - 2026-04-11

### Added

- **CLI Update Suggestion**: implemented a non-blocking check for new versions of `sdg-agents` on the npm registry; displays a professional "Update Available" notification when a newer version is detected during interactive sessions.

### Fixed

## [1.11.3] - 2026-04-11

### Added

### Fixed

- **Missing Skill Recovery**: Fixed a bug where `.ai/skill/CAVEMAN.md` was not generated during project initialization.

## [1.11.2] - 2026-04-11

### Added

- **Zero Context Leak Protocol**: Hardened `end:` cycle and bump scripts to enforce 100% workspace synchronization; switched to `git add .` in release commits to catch `package-lock.json` and mirrored assets automatically.

### Fixed

## [1.11.1] - 2026-04-11

### Added

### Fixed

- **Release Sync Recovery**: synchronized missing source assets in `src/assets/` and updated backlog context after metadata-only bump.

## [1.11.0] - 2026-04-11

### Added

- **Token Discipline 2.0**: Integrated **CAVEMAN Full** linguistic compression for chat interactions; hardened **GSD (Get Shit Done)** protocol with mandatory session purges in `sdg-end.md` to prevent "context rot".
- **Technical Density Poda**: Aggressively pruned instruction set to minimize token usage during cold-starts; reduced `engineering-standards.md`, `backend.md`, and `frontend.md` by approximately 70% in line count while maintaining core engineering constraints.
- **Mouth vs Soul Duality**: Formalized interaction style in `writing-soul.md`: high-density technical fragments for chat (The Mouth) and inviting engineering prose for project documentation (The Soul).

### Fixed

### Changed

- **AGENTS.md Context Core**: Consolidated Token Discipline into the working protocol template (v2.0).

## [1.10.4] - 2026-04-11

### Added

- **Gatekeeper Delivery Workflow**: Hardened the `pre-push` hook to block pushes when unversioned narratives exist in `CHANGELOG.md`; eliminated the automatic `post-commit` versioning loop to prevent history noise and race conditions.
- **Atomic Release Cycle**: Upgraded `scripts/bump.mjs` to perform an all-in-one release delivery (changelog promotion + version bump + release commit); formalized the use of `npm run bump` as the standard cycle termination tool.
- **Narrative Guard Refinement**: Updated `check-narrative.mjs` to support dual-mode validation (staged `commit-msg` and full-repo `pre-push` checks).

### Fixed

## [1.10.2] - 2026-04-11

### Added

### Fixed

## [1.10.1] - 2026-04-11

### Fixed

- **Indentation-Awareness & Idempotency**: hardened `package.json` and `.ai/.sdg-manifest.json` updates to detect and preserve project-specific indentation; implemented `writeJsonAtomic` to prevent redundant file rewrites when content is already in sync.
- **Husky Resilience**: fixed a bug in `.husky/pre-push` synchronization that caused redundant command appends; added explicit idempotency guards to agent configuration files (`CLAUDE.md`, etc.).

## [1.10.0] - 2026-04-11

### Added

- **Narrative Guard**: implemented a Husky `commit-msg` hook to prevent version-bumping commits when the `CHANGELOG.md` is empty.

### Fixed

## [1.9.0] - 2026-04-11

### Added

- **Maintainer Mode Sync**: integrated automatic drift detection and synchronization for the CLI project itself; when running in its own repository, the CLI now automatically ensures that core instructions in `src/assets/instructions` are reflected in the live `.ai/` directory and `AGENTS.md`.

### Fixed

## [1.8.0] - 2026-04-11

### Added

### Fixed

## [1.7.4] - 2026-04-11

### Added

- Narrative Discipline, hardened `sdg-end.md` to mandate populating the `[Unreleased]` section before every commit when automation is active.

### Fixed

- Changelog Narrative Restoration, retroactively added descriptions for versions 1.7.1 through 1.7.3.

## [1.7.3] - 2026-04-11

### Added

- Governance Hardening (Zero Mutation Push), removed the `npm run bump` command from pre-push hooks to prevent workspace drift during the delivery cycle; enforced "Validate at Commit, Zero Mutation at Push" strategy.

## [1.7.2] - 2026-04-11

### Fixed

- Husky Shell Syntax, resolved shell compatibility issues in `.husky/pre-push` hooks caused by incorrect NVM shims and deprecated Husky boilerplate.

## [1.7.1] - 2026-04-11

### Fixed

- Automated Changelog Promotion, corrected the `auto-bump.mjs` script to properly read and migrate `[Unreleased]` content to the active version header.

## [1.7.0] - 2026-04-11

### Added

- Smart Auto-Bump, integrated `CHANGELOG.md` promotion into the automated versioning pipeline; the `post-commit` hook now automatically moves entries from `## [Unreleased]` to the new version header.

### Fixed

## [1.6.0] - 2026-04-11

### Added

- Pedagogical Writing Soul, refined `writing-soul.md` instruction set with inviting, prose-centric guidance; eliminated em dashes and negation-affirmation patterns in favor of direct engineering wisdom.
- Internal Governance Sync, automated the synchronization of project assets to the local `.ai/` directory via CLI `init` protocol.

## [1.4.0] - 2026-04-11

### Fixed

- Governance terminology synchronization in Portuguese and English documentation.

## [1.3.0] - 2026-04-11

### Added

- Automated Bump & Changelog Governance, integrated a standard semantic versioning strategy into the SDG ecosystem; added `scripts/bump.mjs` template and unconditional Husky `pre-push` integration for JS/TS projects.
- Interactive Bump Opt-out, added Step 8 to the `sdg init` wizard to allow users to toggle automated versioning.
- CLI `--no-bump` flag, support for bypassing automation in CI/CD or specialized environments.

## [1.2.3] - 2026-04-11

### Fixed

- Internal Terminal Resilience, hardened Husky hooks with a Path Discovery block to ensure `node`/`npm` availability in non-interactive agent shells; codified abstract "Toolchain Discoverability" principle in global engineering standards; added generic "Terminal Sanity Check" to agent session start protocol.
- Version-Aware CHANGELOG, hardened `Phase: END` instructions to include finding the next package version (patch/minor) instead of defaulting to generic `[Unreleased]` headers.
- npm publish `bin` validation, removed invalid relative `./` prefix from `package.json` bin path that was causing npm to remove the CLI executable.

## [1.2.0] - 2026-04-10

### Added

- AI Backlog Knowledge Triad, separated project state from technical expertise by introducing dedicated `.ai-backlog/learned.md` (success patterns and research) and `.ai-backlog/troubleshoot.md` (RCA and failure logs); implemented Selective Lazy Loading to inject knowledge into the agent's context only when relevant (`feat:` for learned, `fix:` for troubleshoot)
- `end:` intent prefix, universal cycle terminator that forces sequential execution of the END Phase checklist (SUMMARIZE → CHANGELOG → BACKLOG → CURATE → LINT → COMMIT → PUSH); adapts CHANGELOG category by active cycle type; accepts no argument
- `land:` intent prefix, inception cycle that turns a raw vision into a grounded backlog of sequenced `feat:` tasks before any code is written
- Multi-agent execution protocol, Planning (SPEC/PLAN/Review) and Fast (CODE/TEST) roles for Claude Code; auto-enabled when `ide: claude` or `ide: all`; graceful single-agent fallback for all other environments
- Scope rule for multi-agent handoff in `agent-roles.md`, `[S]` tasks run single-agent; `[M]`/`[L]` tasks always spawn Fast after PLAN approval

### Changed

- Governance consolidation, eliminated structural redundancies to reduce cold-context overhead per session: removed duplicate Session Start block, Governance Oath, and bootstrap template from `AGENTS.md`; converted verbose XML `<context_routing>` to markdown tables; removed redundant Phase: END sections from command files; trimmed multi-agent TIP blocks from all command files (now a single reference to `agent-roles.md`)
- Context Load in Phase: CODE is now domain-scoped, loads `backend.md`/`frontend.md` only when the task domain requires it, rather than always loading all competency files
- Bootstrap process now reads `CHANGELOG.md` in addition to `package.json`, `README.md`, and entry points

### Fixed

- `post-commit` hook path corrected from monorepo layout (`packages/cli/src/engine/bin/auto-bump.mjs`) to standalone repo path (`src/engine/bin/auto-bump.mjs`), version bump was silently failing after every commit
- `auto-bump.mjs` `ROOT_DIR` traversal fixed (5 levels → 3) and `PACKAGE_PATHS` pruned to single root `package.json`; removed dead workspace-detection logic in `resolveRootPackagePath`

## [1.0.0] - 2026-04-08

### Added

- Interactive CLI (`sdg init`) to scaffold AI governance context into any project
- Governance instruction assembler, generates `.ai/skill/AGENTS.md` at runtime
- Asset bundle system, packages governance templates into a distributable bundle
- Support for backend, frontend, and fullstack competency profiles
- TypeScript and JavaScript idiom layers
- Multi-language support (EN/PT-BR) for governance assets
- Working Protocol: SPEC → PLAN → CODE → TEST → END lifecycle
- Feature, Fix, and Docs cycle commands (`sdg-feat.md`, `sdg-fix.md`, `sdg-docs.md`)
- Session backlog system (`.ai-backlog/context.md` + `tasks.md`) for cross-session continuity
- CLAUDE.md governance integration for Claude Code
