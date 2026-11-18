# Changelog

This file carries the releases of the current major. When the next major ships, these entries move to [docs/CHANGELOG-archive.md](docs/CHANGELOG-archive.md), which holds every earlier release back to v0.x.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Fixed

## [11.1.1] - 2026-11-18

### Fixed

- **Every document says what the project is today, or is gone.** All 21 documents were read against the canon, and each got a verdict the developer approved before anything was deleted. Three concept documents explained the same five phases, and the diagram in one of them had drifted: it showed steps such as a "Narrative Gate" that `workflow.md` does not have. They are now one [Spec-Driven Guide](docs/concepts/SPEC-DRIVEN-GUIDE.md), synced to the protocol, with the diagram corrected. `PIPELINES.md` had drifted from the flavor files and now lives as a column in the [quick reference](docs/reference/CHEATSHEET.md#architecture-flavors---flavor). The cost model moved into [Project Structure](docs/reference/PROJECT-STRUCTURE.md), with links to the two byte-budget tests instead of their numbers. The UI research list moved into [the credits](docs/reference/REFERENCES.md). Project Structure also lost five errors, among them a `flavors/` path the CLI never writes and a Session Start that read `tasks.md` instead of `session.md`.
- **Removed what no longer described the product.** Deleted: the SDLC guide, which nothing linked to; the 8-Laws Constitution, whose vocabulary earlier releases had already retired; the v2-to-v6 migration guide, whose steps install v3; and two unused icons. The v8 guide stays, because npm's deprecation notice for `sdg-agents` links to it, and it now points forward to the v10 and v11 guides.
- **The changelog keeps the promise it states.** Line 3 promised that each release moves the previous entry to the archive, and no release since v6.3.0 had done so. The entries from v6.0.0 through v10.0.0 moved to [the archive](docs/CHANGELOG-archive.md) intact, and the rule now reads per major. The roadmap gained v11.0 and v11.1 and dropped its list of four planned extension packages.
- **The README presents v11.1.0 to the people who install it**: `git-guard`, the fresh-context review, the YAGNI ladder, the line-ending recipe and waves. Its Guardrails table names what enforces each gate.

## [11.1.0] - 2026-11-18

### Added

- **`git-guard`, the enforced half of the commit gate.** A PreToolUse hook in `tooling/hooks/` refuses `git push` and `git reset --hard`, inside chains, behind environment variables and after git's global options, and hands the reason back to the agent. The tooling README carries the recipe: the hook, an `ask` permission on `git commit`, and an optional Stop hook that runs the tests. `init` never writes harness settings; the developer registers it.
- **The Guardrails table says which gates are enforced.** A new column names what holds each gate, a hook, a test or nothing but the text, so an advisory rule no longer reads as a guarantee.
- **A contract for unattended runs.** A run with no developer between turns starts with a verifiable done condition, a scope, a turn or spend cap and a sign-off, enforced by the harness (`/goal`, a Stop hook) rather than reimplemented, and it ends at a proposed commit.
- **A fresh-context review on two axes.** `review.md` gains the review an [M] or [L] change gets before the Review Gate: a reader with the SPEC and the diff, and not the conversation, reports fidelity to the SPEC and code quality apart, and every finding is answered. Delegation in `agent-roles.md` moves from task size to criteria: parallel work, noisy output, independent review.
- **Waves for broad requests.** When one cycle takes several items, Phase PLAN groups the tasks by the files they share, letters each wave, and ends each with the suite green. The banner names the wave, and the end of a wave is where a session hands over.
- **Clarification as numbered questions.** Phase SPEC settles every fact the repository can answer, and asks only for decisions, each with a recommended answer.
- **The YAGNI ladder and a never-cut list**, once in `code-style.md` and referenced by the four flavors: does it need to exist, does the codebase, the standard library or an installed dependency have it, is it a one-liner, and only then the minimal code. Validation at trust boundaries, data-loss handling, security and accessibility are never cut.
- **Skill frontmatter.** Every skill opens with `name` and `description` in the Agent Skills format, and the description replaced the "Load in" line it duplicated.
- **Canon agreement tests and `npm run ssot`.** Each rule restated outside its source is now read from both sides by a test: the changelog section mapping against release-please, the commit types against the hook, the router against the command files, the five phases, the Guardrails table and its three copies, and skill frontmatter against the router. Every check was proven by planting the defect it catches. `npm run ssot` runs them with the self-audit.
- **A byte budget on what Phase CODE loads.** The router, `workflow.md`, `code-style.md` and the largest flavor are measured together and held to 32800 bytes, so the kit growing shows up as a number someone raises on purpose.
- **A line-ending recipe and an `eol` declaration.** `tooling/line-endings/` ships a `.gitattributes` and an `.editorconfig` that agree on LF with the batch-file exceptions, and `land:` records what a project declares as `eol` in `context.md`, so the agent knows before it writes code to convert endings.
- **Model currency in `audit:`.** When a new model generation ships, `audit:` re-reads the kit for instructions written for an older one, with `/doctor prompt-audit` where the harness has it.
- **Every `troubleshoot.md` entry names the test that pins it**, so past incidents run on every change instead of being remembered.
- **Credits for the November 2026 audit.** `docs/reference/REFERENCES.md` names each source the kit drew on and what it gave.

### Changed

- **The Work Checklist is no longer recited.** Phase CODE opens on loading `code-style.md`, whose Form items Phase TEST verifies on every changed file; the Intent section and the recitation gate are gone. Current models treat a recited checklist as noise, and a check outside the model already reads the Form items. `checklist-soul.md` follows the same line: three facts settled before the first line, and the rule passes moved into the sweep that runs on the draft.
- **Terse Mode covers working notes only.** SPEC, PLAN, the TEST report, the END summary and handoffs are written in full sentences for a reader who was not there.
- **Absolute rules carry a scope and a reason instead of capital letters**, across the workflow, the commands, the flavors and the skills, since current models read "never" as absolute and over-apply emphasis.
- **Memory never authorizes.** The Persistence Policy in `AGENTS.md` gains its precedence, developer instruction, then `AGENTS.md`, then the backlog, and a file an agent or a PR can write may narrow what an agent does, never widen it. The router's byte budget rose from 3200 to 3360 for that line, with its reason in the test.
- **`learned.md` has entry rules.** One lesson per entry, with its date, cycle and origin, deleted when its reason no longer holds, and promoted to the canon only by a developer.

### Fixed

- **The Form check could pass on nothing.** `governance.mjs` returned an empty checklist when `code-style.md` lost its Form section, and TEST then verified zero items and passed. It fails at load now.
- **Two documents described behavior the code had dropped**: the tooling README still said the managed `.gitignore` kept `.claude/` out of git, which v10 reversed, and `visual-density.md` still said its rule was recited at CODE entry.

## [11.0.2] - 2026-11-18

### Changed

- **The backlog carries an audit of what the agent-skills ecosystem has to offer.** Five read-only passes covered the most-starred skill repositories, `akitaonrails/ai-memory` and `ai-jail`, `mattpocock/skills`, ponytail, the November 2026 guidance for the Claude 5 family and GPT-6.2, and accounts from Anthropic staff. Eleven concepts became backlog items, each with its source and the file it lands in, and most of them remove text: current models treat emphasis and recited checklists as noise, and a rule that cannot bend belongs in a hook. Five were refused with their reason under `Decided against`, among them unattended loops as a default and memory kept outside the repository. No shipped file changed.

### Fixed

- **One bump table, and a test that holds the copies to it.** `versioning.md` said `docs`, `audit` and `land` release nothing, `bump.mjs` released `audit` as MINOR and the other two as PATCH, `auto` released every commit type including `chore` and `test`, and the self-audit failed any cycle that left its changelog entry unreleased. The last `audit:` cycle followed the table, and `npm run gate` went red on `main`. The table now reads: `feat` MINOR; `fix`, `perf`, `docs`, `land`, `audit` and `refactor` PATCH; `chore` and `test` nothing. A type releases when its cycle writes a changelog entry, which is also what the release-please config already expressed by hiding exactly `chore` and `test`. `version-table.test.mjs` reads the table and fails when `bump.mjs`, in either form, or the release-please config disagrees with it. A `chore:` carrying `BREAKING CHANGE:` still releases MAJOR.

## [11.0.1] - 2026-10-18

### Changed

- **One bump and one prune, the same files this repository runs.** Bump lived in four scripts and prune in two, and they had drifted: the `scripts/bump.mjs` that `init` installs was an older fork of the one this repository released with, and the kit shipped a three-script pipeline beside both. There is now one `.ai/kit/tooling/scripts/bump.mjs`, which `init` installs as `scripts/bump.mjs`. It takes a cycle type or a semver level, derives the level from the commits on `auto`, keeps `package-lock.json` in step, and refuses an empty `[Unreleased]` or an already released version before it writes anything. `bump-version.mjs`, `derive-bump.mjs` and `promote-changelog.mjs` are gone; `release:auto` in the tooling README replaces their recipe. A project that already has `scripts/bump.mjs` keeps its copy, since `init` never overwrites it.

### Fixed

- **`npm run prune` keeps the second line of an entry.** This repository pruned with its own copy, which kept only the `- [DONE]` lines and dropped whatever continued them. It now runs the shipped `prune-backlog.mjs`.

## [11.0.0] - 2026-10-18

### Added

- **A link checker that runs in the suite.** `scripts/check-links.mjs` reads every tracked markdown file and reports three kinds of reference that lead nowhere: a relative link to a missing file, an anchor no heading produces, and a `.ai/kit/` path an agent is told to load with no source behind it. The repository is its own fixture, so a broken reference fails `npm test` and CI. Its first run found four, all real. `npm run links:external` also probes the web links, and reports a site that refuses an automated request (401, 403, 429) as unverified rather than broken.
- **`AGENTS.md` tells a fresh clone what to do.** The kit is not in git, and the router routed every cycle into it. The router's header now names `npx spec-driven-guide restore` for the case where `.ai/kit/` is missing, which is every clone.
- **`audit --skip-hygiene`**, for callers that ran lint and tests as their own steps. `npm run gate` and CI use it, so the suite no longer runs twice.
- **CI runs on Windows too, and runs the self-audit.** Every defect below that only Windows shows shipped while CI ran on Linux alone.

### Changed

- **One root file: `CLAUDE.md` is no longer written.** Claude Code reads `AGENTS.md` natively, but only while no `CLAUDE.md` exists, so the pointer the CLI wrote had become what stood between them. `init` removes the pointer an earlier release left, keeps a `CLAUDE.md` the developer wrote, and warns when that file does not import `AGENTS.md`. See [Migration to v11](docs/guides/MIGRATION-v11.md).
- **The protocol stops where the documents said it stops.** The README, the Constitution and the cheatsheet all promised a stop after TEST; `workflow.md` had none, so the agent could roll into END on its own. Phase TEST now ends on a Review Gate.
- **The plan stays out of the versioned queue.** PLAN wrote its task list into `tasks.md` and every checkpoint wrote there again, so a shared file took one developer's working state on each cycle. The plan and its checkpoints live in `session.md`; END writes one `[DONE]` line for the cycle.
- **END stages what the cycle changed, not `git add .`**, which swept in whatever else sat in the tree.
- **The subagent handoff carries what a cold start needs.** `agent-roles.md` named "context refs" and nothing else. The payload now lists the approved SPEC and PLAN verbatim and every path the subagent reads, the subagent never commits or writes the backlog, and a second failed correction stops the cycle. It also stopped loading on every cycle: it loads only when work is delegated.
- **`land:` and the router assume no stack.** The survey reads whichever build manifest exists instead of `package.json` alone, the examples carry no pinned versions, and `context.md` gains a `bump` command so `manual` release works outside Node.
- **The documents were pruned of what ages.** The README reads the Node.js minimum from `engines` through a dynamic badge, the duplicated `land:` allow-lists point at the one list the agent reads, the cheatsheet names gates by name instead of by step number, and the IDE table lists only the agents that still need a line of configuration. The repository's own `tasks.md` dropped from 22 KB to 8 KB of closed entries already recorded in git.
- **The pre-commit hook lints what is staged and nothing more.** It ran the full lint, the full suite and lint-staged, while pre-push ran the suite again.

### Fixed

- **`audit` exited 0 on every gap it reported**, so `npm run gate` and CI passed whatever it found. It exits 1 now.
- **The sync check approved a kit that did not exist.** A missing `.ai/kit/` produced an empty drift list and a green line; it fails now and names the rebuild command. It also compares both ways, so a file the canon carries and the kit lost is reported. Outside this repository it checks the kit against the manifest hashes instead of skipping.
- **A check with nothing to inspect reported a pass.** Code style and test expectations on a project with no `.mjs` sources, hygiene on a project with no `package.json` or no `lint` script, and the narrative check before a first `CHANGELOG.md` report skipped now, instead of a pass or a failure the project did not earn.
- **The audit header printed the audited project's version** as if it were the CLI's. It prints the CLI's.
- **Manifest keys depended on the platform.** A Windows install wrote `skills\code-style.md`, which a macOS `review` reported as a file it had never seen. Keys are POSIX on every platform, and a manifest already committed with backslashes still compares.
- **`review`'s "Sync with Core" reopened the wizard.** It handed the recorded selections through an environment variable nothing read; it passes them the way `restore` does.
- **`--no-bump` was parsed and then ignored**, so every Node install gained `scripts/bump.mjs`. The flag reaches the install now, and `--help` lists it, along with `gate`, `narrative` and their options.
- **END ran `npm run prune`, which exists only in this repository.** It runs the pruner the kit ships.
- **`clear` left `AGENTS.md` routing into the tree it had just deleted.** It removes the root files the CLI wrote, recognised by their sentinel, and its warning no longer claims `tasks.md` is outside git.
- **The managed `.gitignore` ignored `.env.example`.** The block now carries `!.env.example`, since it is written last and overrode any negation above it.
- **The hygiene check failed on Windows whatever the result**, because `npm` is `npm.cmd` there and a shell-less spawn never started it.
- **A Windows checkout failed the gate on line endings alone.** `.gitattributes` pins LF, which the hooks, the lint and the manifest hashes all assume.
- **Stale guidance in the commands**: `sdg-audit` asked for "Engineering Law" violations, a vocabulary removed in v4.1, and `sdg-feat` named `competencies/delivery.md` without its kit prefix. `brace-expansion` was bumped past a high-severity advisory.

### Removed

- **`buildClaudeContent` and the `CLAUDE.md` writer.**
- **The Context Report and Cost Estimate steps.** Each cost tool calls on every cycle to print an estimate built on constants, and `wc` does not exist in the shell many Windows agents run.
- **The Intent Routing table in `workflow.md`**, a copy of the router already in context.
