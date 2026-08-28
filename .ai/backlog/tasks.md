# Tasks

> The team's queue and its record. Versioned: a backlog entry carries the
> reasoning behind a decision not yet taken, and no other file holds it.
> Session state lives in `session.md`, per developer.

## Backlog

### Soul: rules in English that hold in any delivery language, closed

- ~~[BACKLOG] the seven Soul items~~ ✅ 2026-08-02 (all shipped in v6.1.0: rule/lexicon split, `writing-lint` reading the lexicon, form classes named in Part 2, sweep order and the one-explanation ceiling, the non-English delivery section, the formatting rules, and the promotion step. See `## Done`.)

### Skill: `writing-readme.md`, closed

> Requested by the developer. The shape below is **derived from his own repositories**, not proposed from a generic template: `specdrivenguide-website` (README touched 2026-08-02), `sdg-agents-cli` (2026-07-22) and `code-style` (2026-07-25) already converge on it. `simula-impostos-mvp` is the same skeleton in an earlier form, with the badge row above the title instead of below it.

- ~~[BACKLOG] **feat: new skill `src/assets/skills/writing-readme.md`,**~~ ✅ 2026-08-02 (v6.2.0, all four open decisions settled, see `## Done`. The consequence of decision 1, moving this repository's own `README.pt-BR.md` to the root, moved to `## Now`.)

  <details>
  <summary>Original entry, kept for the derivation it records</summary>

  **feat: new skill `src/assets/skills/writing-readme.md`,** loaded on a `docs:` cycle that touches a README, alongside `writing-soul.md`. It governs the banner, which the soul says nothing about, and defers to the soul for every line of prose below it.

  **Part 1, the banner.** One centered block, in this order:

  ```html
  <div align="center">
    <img src="<logo>" alt="<Project>" width="360" height="360" />
    <h1 align="center">Project Name</h1>
    <p align="center">
      One sentence saying what this is and who it serves.<br />
      <a href="README.pt-BR.md">Versão em Português (Brasil)</a>
    </p>
    <p align="center">Live at <a href="https://…">domain</a></p>
    <!-- badge row -->
  </div>

  <br />
  ```

  Rules the skill states, each one observed in at least two of the repositories:

  | Element     | Rule                                                                                                                                                                                                  |
  | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Logo        | Square, 360 to 640 px, `width` **and** `height` both set so the page does not reflow while it loads                                                                                                   |
  | Title       | Inside the banner as `<h1 align="center">`, never a markdown `#` above it                                                                                                                             |
  | Tagline     | One sentence, then `<br>`, then the link to the translated README                                                                                                                                     |
  | Live link   | Its own `<p align="center">`, only when the project is published somewhere                                                                                                                            |
  | Badges      | `shields.io` with `style=flat-square`, `logo=` set, and every badge wrapped in an `<a>` that goes to the thing it reports                                                                             |
  | Badge order | Identity and status first (release, downloads, CI), then stack (runtime, framework, language), then meta (license, changelog). Observed identically in `sdg-agents-cli` and `specdrivenguide-website` |
  | Closing     | `</div>` then a bare `<br>`, so the first paragraph does not sit flush against the badges                                                                                                             |

  **Part 2, the content**, which is the soul applied with no exceptions: an intro paragraph immediately after the banner with no heading between them, a `## Fundamental concepts` table once three or more technical terms appear, and body sections shaped by the project. `specdrivenguide-website` also names its two readers in the intro ("A developer meeting the framework for the first time… A contributor changing the site…"), which is the soul's two-reader rule made explicit and is worth prescribing.

  **Open decisions for the SPEC of that cycle:**

  1. **Where the translated README lives.** `specdrivenguide-website` keeps `README.pt-BR.md` at the root; `sdg-agents-cli` keeps `docs/i18n/README.pt-BR.md`. Two conventions in two repositories of the same author, and the skill has to pick one.
  2. **Badge row above or below the title.** `simula-impostos-mvp` puts it above, the two recent ones put it below. Below is the newer form and the one to canonise.
  3. **Whether the skill ships a fenced skeleton to copy.** It reads faster than prose, and the concepts-table convention plus the badge order are hard to convey any other way.
  4. **A stack table as banner alternative.** `code-style` replaces per-technology badges with a `| Area | Stack |` table of grouped badges, which scales where a flat row would wrap over several lines. Worth documenting as the variant for documentation repositories with many technologies.

  **Ordering note:** this skill should land after the lexicon split, because a README written in pt-BR is exactly the case that the language rules above have to cover, and writing the skill first would bake the English-only assumption into one more file.

  </details>

### Generated-file overwrite, closed

- ~~[BACKLOG] feat: **warn before overwriting an edited generated file**~~ ✅ 2026-07-22 (won't-do: consumer projects track `.ai/instructions/`, `.ai/skills/` and `.ai/tooling/` in git, the emitted `.gitignore` only ignores `tasks.md`, `impact-map.md` and `last-prompt.md`, since the negation ladder is this repo's alone. An overwrite therefore shows up in `git status` and reverts with `git checkout --`. A second `emittedHashes` field plus `.orig` copies would reimplement, worse, what git already does. 3-way merge stays rejected on its own terms: conflict markers inside markdown an LLM reads as instruction fail silently.)

- ~~[BACKLOG] feat: **a legitimate home for customization** (`.ai/local/`)~~ ✅ 2026-07-22 (won't-do: an override layer that wins over the canon is a sanctioned fork, five projects, five code-styles, none of them visible to `audit` or `check-sync`, which only know the canon. That is the v6.0.2 disease again: tooling that approves what it cannot verify. Legitimate per-project customization already has a home the init preserves, `writeStackFile` and its siblings early-return when the file exists, and `stack.md` documents itself as edit-directly-no-regen. Real divergence from the canon is answered by pinning the version (`npm i -D sdg-agents@X`) or moving the canon upstream, never by shadowing it locally.)

### Dogfooding, Fix Queue (next rodada)

- ~~[BACKLOG] audit: **flavor principles rebalance**~~ ✅ 2026-04-24 (bundled into the braced-guards `audit:` cycle, see Done).

- ~~[BACKLOG] fix: **test source-string style**, inline `\n`-stuffed strings pervasive in `governance.test.mjs`~~ ✅ 2026-04-24 (bundled into fix: v5.3.1 cycle, all fixtures converted to per-line array-join; no-inline-assert now enforces semantic-assert naming).

- ~~[BACKLOG] audit: **AAA + semantic-assert reinforcement in testing.md**~~ ✅ 2026-04-24 (bundled into fix: v5.3.1 cycle, `NamedExpectations` rewritten with correct actual+expected grouping + derivation carve-out; `no-inline-assert` ESLint rule enforces it).

- ~~[BACKLOG] fix: **no-inline-assert full sweep**~~ ✅ 2026-04-24 (v5.3.2, 129 violations swept, rule global).

- ~~[BACKLOG] audit: **function line-limit clarification in code-style.md**~~ ✅ 2026-04-24 (doc-only; `Small functions` bullet rewritten with logical-statement semantics + 3 exclusion categories; `.ai/skills/code-style.md` synced).

- ~~[BACKLOG] fix: **visual-density, const-touching-function pattern still uncaught**~~ ✅ 2026-04-24 (see Done).

- ~~[BACKLOG] fix: `ceremonial-void-return` detector + `explaining-returns` refinement~~ ✅ 2026-04-18 (scope expanded to include `named-const-before-call` tightening, see Done).
- ~~[BACKLOG] fix: **regression**, `ceremonial-void-return` survivor at [gate-bundle.mjs:21-22](src/engine/bin/maintenance/gate-bundle.mjs#L21-L22)~~ ✅ 2026-04-18
- ~~[BACKLOG] fix: **real hit**, `named-const-before-call` violation at [wizard.mjs:373](src/engine/lib/domain/wizard.mjs#L373)~~ ✅ 2026-04-18
- ~~[BACKLOG] audit: **rule refinement**, `named-const-before-call` FP carve-out for pure data-access composition.~~ ✅ 2026-04-24 (resolved: `JSON.parse(readFileSync(...))` is RHS-assignment-exempt by rule; `path.basename(x)` as arg extracted to `const projectName` at [instruction-assembler.mjs:266](src/engine/lib/domain/instruction-assembler.mjs#L266); `fs.existsSync` already in exempt list. No remaining FPs.)
- ~~[BACKLOG] audit: **rule refinement**, `explaining-returns` trivial-literal carve-out.~~ ✅ 2026-04-24 (won't-do: vacuous sites cleaned, `injectedResult = undefined` and `wizard.mjs:414-420` gone; remaining `const emptyBlock = null;` etc. are semantically named, not ceremony).
- ~~[BACKLOG] fix: tighten `boolean-prefix` detector, scan RHS for boolean-producing calls (`.match()`, `.test()`, `.includes()`, `length > N`) used in boolean context.~~ ✅ 2026-04-24 (won't-do: `named-const-before-call` forms (f)+(g) + `boolean-prefix` extraction requirement in that rule cover this indirectly; live sites were fixed manually; no standalone detector needed).
- ~~[BACKLOG] fix: duplicate `console.log` at [clear-bundle.mjs:88-89](src/engine/bin/maintenance/clear-bundle.mjs#L88-L89)~~ ✅ 2026-04-18. Detector shipped 2026-07-22 in v6.0.0 as the `local/duplicate-consecutive-statement` ESLint rule, not a `governance.mjs` heuristic, see Done.
- ~~[BACKLOG] fix: rename `dryRun` → `isDryRun`, `strictMagicMatch` → `hasStrictMagicMatch`~~ ✅ 2026-04-18 (full cascade).
- ~~[BACKLOG] feat: **regex pre-filter layer for gate detection**~~ ✅ 2026-04-24 (v5.4.0, `gate-preflight.mjs` form (a) hint-mode; `## Pre-filter Signals` injected into prompt when matches found; 225/225 green).
- ~~[BACKLOG] audit(optional): expand `inline-assertion-literals` → `inline-anonymous-object-argument` [WARN]~~ ✅ 2026-04-24 (won't-do: 1 hit at [check-sync.mjs:102](src/engine/bin/audit/check-sync.mjs#L102), `inline-assertion-literals` BLOCK already covers the substance; FP analysis cost > benefit).
- ~~[BACKLOG] audit: **rule gap**, `named-const-before-call` detector silent on binary-comparisons and unary-negations~~ ✅ 2026-04-18 (expanded enumerated forms, see Done).

### Milestone M1, Foundation (new SSOT + skill structure)

- ~~[M1.2][M] Convert `core/*` rules into skill units under `src/assets/skill/<name>.md`~~ ✅ 2026-04-15
  - ~~code-style (merge code-style + naming + engineering-standards)~~ ✅ 2026-04-15
  - ~~testing~~ ✅ 2026-04-15
  - ~~sql-style~~ ✅ 2026-04-15
  - ~~security (merge security + security-pipeline)~~ ✅ 2026-04-15
  - ~~api-design~~ ✅ 2026-04-15
  - ~~data-access~~ ✅ 2026-04-15
  - ~~observability~~ ✅ 2026-04-15
  - ~~ci-cd~~ ✅ 2026-04-15
  - ~~cloud (merge cloud + containers)~~ ✅ 2026-04-15
  - ~~ui-ux (merge ui/* 4 files + writing-soul)~~ ✅ 2026-04-15
  - ~~staff-dna (preserve, load only in Phase CODE)~~ ✅ 2026-04-15
- ~~[M1.3][S] Define skill loading convention, how cycle commands and `AGENTS.md` reference skills on-demand. **SSOT rule**: `src/assets/skills/*` is canonical; `src/assets/instructions/core/*` is deprecated-pending-M3.6 (preserved only for round-trip validation, must NOT be edited).~~ ✅ 2026-04-15
- ~~[M1.4][S] Delete `src/assets/instructions/workflows/governance.md` (not a duplicate of `workflow.md`; 01–08 roadmap unused operationally, 7 Laws already in `skills/staff-dna.md`).~~ ✅ 2026-04-15
- ~~[M1.5][M] SSOT audit, eliminate redundancy in `src/assets/instructions/**`. Decisions: `caveman.md` DELETE (6 rules migrated to `workflow.md` TokenDiscipline as "Terse Mode (Default)"; `ui-ux.md` + `writing-soul.md` rewired with default-flip: Terse is default, Pedagogical opt-in). `agent-roles.md` PENDING-M3.6 (meta-protocol, not a skill). `competencies/*`, `flavors/*`, `idioms/*`, `commands/*`, `templates/*` all KEEP as legitimate non-skill rulesets.~~ ✅ 2026-04-15

### Milestone M2, Engine (manifest-driven, multi-agent, idiom injection)

- ~~[M2.1][L] Multi-agent stubs (cli-parser, wizard, assembler, manifest)~~ ✅ 2026-04-15
- ~~[M2.2][M] Idiom injection catalog-only (validated, already wired via `--idioms` + wizard backend/frontend prompts + dynamic render)~~ ✅ 2026-04-15
- ~~[M2.3][M] Assembler rewrite, SKILL_CATALOG single source of truth + ruleset-injector skills copy gap fix~~ ✅ 2026-04-15
- ~~[M2.4][S] Cycle commands skill path updates~~ ✅ 2026-04-15

### Milestone M3, Cleanup (delete out-of-scope + mirror src→.ai)

- ~~[M3.1][M] Delete `src/assets/dev-guides/prompt-tracks/` + mirror `.ai/dev-guides/prompt-tracks/`~~ ✅ 2026-04-15
- ~~[M3.2][M] Delete creative content~~ ✅ 2026-04-15
- ~~[M3.3][S] Delete `src/engine/bin/init/creatives-bundle.mjs`~~ ✅ 2026-04-15
- ~~[M3.4][S] Remove `.ai/last-prompt.md`~~ ✅ 2026-04-15
- ~~[M3.5][M] Audit `src/engine/bin/audit/`, `lifecycle/`, `maintenance/` for orphaned code post-cleanup~~ ✅ 2026-04-15
- ~~[M3.6][M] Round-trip regen `.ai/` + SSOT cleanup (deleted `src/assets/instructions/core/`, 16 files; moved `agent-roles.md` → `templates/`; updated `governance.mjs`, `sync-rulesets.mjs`, `audit-bundle.mjs` to new paths)~~ ✅ 2026-04-15

### Milestone M4, Release ✅

- ~~[M4.1][M] Affected tests validated, 107/107 green, no test updates required post-regen~~ ✅ 2026-04-15
- ~~[M4.2][S] `package.json` bumped via `npm run bump major` (2.16.0 → 3.0.0); description rewritten for v3 router model~~ ✅ 2026-04-15
- ~~[M4.3][M] `docs/MIGRATION-v3.md` written, breaking changes table, step-by-step migration, v2→v3 file mapping~~ ✅ 2026-04-15
- ~~[M4.4][S] `README.md` + `docs/README.pt-BR.md` updated with v3 features (multi-agent, skills on-demand, multi-idiom); broken links fixed (`src/assets/dev-guides/` → `docs/`; `.ai/skill/` → `.ai/skills/`)~~ ✅ 2026-04-15
- ~~[M4.5][M] `CHANGELOG.md` 3.0.0 entry written, Added/Changed/Removed/BREAKING CHANGES; promoted via `bump.mjs`~~ ✅ 2026-04-15
- ~~[M4.6][S] `npm run lint` + `sdg-agents audit` + `npm test`, all green (audit 100%)~~ ✅ 2026-04-15
- ~~[M4.7][S] Release commit proposed, `feat: release v3.0.0 - Reformulation & Multi-Agent Support`~~ ✅ 2026-04-15

### Sub-cycle: Engineering Laws renumbering + audit header fix

- ~~[LAW.1][S] Renumber Laws 0–7 → 1–8 in `staff-dna.md` + all cross-refs (`api-design.md`, `cloud.md`, `workflow.md`, `governance.mjs`, `display-utils.mjs`, `check-narrative.mjs`, `audit-bundle.mjs`, `instruction-assembler.mjs`)~~ ✅ 2026-04-15
- ~~[LAW.2][S] Fix hardcoded `v2.0.0 compliance` in audit header, now reads dynamically from `package.json`~~ ✅ 2026-04-15
- ~~[LAW.3][S] Purge stale `instructions/core/` refs in `docs/CONSTITUTION.md`, `docs/UI-UX.md`, `docs/PROJECT-STRUCTURE.md`~~ ✅ 2026-04-15

## Done

- [DONE] feat!: `.ai/` separates by ownership, and the framework's copy leaves git. The cycle opened on the developer's own observation, that tracking the framework's files made every update a diff nobody reads, and the first measurement contradicted its premise: git compares content, so 73 of the 80 rewritten files come out identical and a two-major jump produced a 9-file diff. What carried weight was the install and what carried ambiguity was the boundary, since one directory held the project's memory and the framework's canon with only the `.gitignore` knowing where the line ran. Three shapes were weighed against the developer's proposal to move the tree into `node_modules`, and it was refused on one fact that decides it: a probe C# project with no `package.json` installs cleanly today, and hosting markdown in `node_modules` would make a Node dependency of every Java, C# and Python repository the framework governs, while buying nothing the ignore route does not already buy. His second proposal, a wrapper directory, was better than the negation ladder for a reason the ladder demonstrates: `git check-ignore` on a hand-written `.ai/minhas-notas.md` names `.ai/*` as the rule discarding it, so the ladder defaults to discarding what the developer writes and the wrapper defaults to keeping it. The name went to `kit` over `canon` and over `guide`, the last on the project's own Name distinctiveness rule, since `guide` returns 109 grep hits against zero and an agent navigating by lexical search would land on the product name in every document. Clearing the kit whole replaced pruning by inventory, which the code itself admitted could never reach a file the developer added by hand, and it is safe only because the backlog now sits outside what gets cleared. `restore` closes the loop the untracking opened, refusing any release but the pinned one and verifying the rebuilt files against the recorded hashes on disk rather than against the package they came from. `tasks.md` split along the same line after the measurement showed 141 of its 154 lines were durable backlog and 8 were the session pointer, which is the v6.0 volatility principle applied to the one file it skipped. Two entries left the managed `.gitignore` block on the developer's reading: `.claude/`, which holds `settings.json` and `commands/` that a team shares, and which the comment two lines above it already forbade on the same grounds that spared `.cursor/` and `.kiro/`; and `.ai/last-prompt.md`, whose feature was removed in v3.0.0 and whose 103 lines of machinery had outlived it by six majors. Both are reclaimed rather than dropped, so the lines disappear from projects that already carry them. The sweep of 223 references across 34 files is guarded by an audit check proven by planting a stale path and watching it fire, five documents excluded by name because a record rewritten to match the present stops being a record. 382 tests, 0 vulns, lint PASS, mirror in sync, audit clean, and the install verified end to end: 11 tracked files against 80, a clean re-init, a restore of 73 files matching the manifest, and a real v9 tree migrated with its one hand-written file named before removal.
- [DONE] feat!: the convergent update, and the framework naming what it is. The cycle opened as an investigation and each answer narrowed the next question. Two defects were proven on a probe project rather than argued: an update copied the canon over the old tree and deleted nothing, so `staff-dna.md` from v4.1, a command retired in v5.0 and a removed lint rule all survived into a v8 install, and the `.gitignore` writer only appended, so `.ai/backlog/` from before the volatility policy kept `learned.md` and `troubleshoot.md` out of git in every project predating v6, in a framework whose README promises the opposite. Neither fix needed new bookkeeping. The manifest already inventories what an earlier release emitted, which both identifies the stale files and bounds the deletion to them, and the `.gitignore` became a block rewritten whole, reclaiming only the lines the writer's own history shows the CLI emitting. That history check corrected the cycle's own diagnosis: the blanket line was `.ai/backlog/`, never `.ai/`, and the difference is what protects a `.ai/` the developer wrote on purpose. The memory gap was the developer's observation and it was total: nine constraints on behaviour, none on memory, so the harness default won by silence and project knowledge went to a per-machine store invisible to the team, to git and to `audit:`. The Persistence Policy went into the always-loaded router rather than a skill, because a default that is always on is only contradicted by a rule that is always on, which cost 314 bytes and moved the token guard from 2700 to 3000 with the reason written into the constant. His question about guardrails found the same shape: nine existed and none was named, and the tenth was missing, evidence, which this repository had already paid for when v7.0.1 reported no interactive audit path and `index.mjs:226` had one. His `.claude` instruction exposed the canon contradicting itself, the roadmap forbidding vendor directories since v6.0 while `tooling/README.md` taught `mkdir -p .claude/hooks`; the recipe now registers the script where the install put it, since it reads the harness payload from stdin and husky cannot drive it, which is the one deviation from the approved plan. And his positioning, that this is the balance rather than SDD, was applied in four skills and stated in none, while the concept doc still called itself Spec-Driven Development and declared five mandatory phases. It is `SPEC-DRIVEN-GUIDE.md` now, naming SDD as the origin it keeps the core of, and the thesis is a rule: the spec scales with the demand, the gates do not. 378 tests, 14 new, lint PASS, mirror in sync, audit clean.
- [DONE] docs: the README screenshot recaptured on v8.0.0 and renamed to defeat the raw cache. The published image still showed `Agents v2.12.0`, six major versions behind the CLI, and the new capture arrived with the `npx spec-driven-guide` prompt line and the Inquirer marker column that the old framing did not have, so it was cropped to exactly 492 by 205 and the top padding restored, which let both READMEs keep their `<kbd>` proportions with no markup change. The rename to `sdg-agents-menu.png` reverses the v8.0.0 decision to keep asset filenames: that decision protected mirrored READMEs from a broken link, and it also meant `raw.githubusercontent.com` would keep serving the old bytes under a path it had already cached, which a new path is the only way to invalidate. The `-v2` was dropped rather than bumped to `-v3` because the suffix distinguished the file from one that no longer exists.
