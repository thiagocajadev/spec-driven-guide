# Tooling (optional, inert)

Pre-made scripts and hooks. **Nothing is wired by default**. `spec-driven-guide init` copies
these files into `.ai/tooling/`, but no `package.json`, no `.husky/`, no devDep is
modified by the CLI. Activate on demand with agent assistance or manually.

## Inventory

### `scripts/prune-backlog.mjs`

Trims `.ai/backlog/tasks.md` `## Done` section to the N most recent entries.

```
node .ai/tooling/scripts/prune-backlog.mjs [--keep N]
```

- Default `N = 3`.
- Idempotent: running twice with the same `--keep` is a no-op.
- Intended for Phase END of each cycle.

### `scripts/bump-version.mjs`

Minimal semver bump. Only rewrites `package.json.version`.

```
node .ai/tooling/scripts/bump-version.mjs <patch|minor|major>
```

- Does NOT touch `CHANGELOG.md`.
- Does NOT run `git add`, `git commit`, `git tag`, or `git push`.
- Use case: dev experimentation, pre-release bumps, or agent-driven version-only changes.
- For full release bump (version + CHANGELOG promote + stage), use the project's own
  `scripts/bump.mjs` if installed.
- To stop choosing the type by hand, pair it with `derive-bump.mjs` below.

### `scripts/derive-bump.mjs`

Reads the commits since the last tag and prints the bump they imply, one word on
stdout: `patch`, `minor` or `major`. It applies the same table `release-please`
runs in CI, so a project that starts on a local bump and later wires the action
keeps producing the same numbers, and the move never renumbers a release.

Pairs with `bump-version.mjs`, which stays a pure writer:

```
node .ai/tooling/scripts/bump-version.mjs $(node .ai/tooling/scripts/derive-bump.mjs)
```

Two files rather than one, because reading history is a query and writing the
version is a command. Folding them would also cost `bump-version.mjs` the tested
guarantee that it never shells out to git.

Exits non-zero when nothing since the last tag is releasable, and every
diagnostic goes to stderr so stdout stays usable inline.

### `scripts/promote-changelog.mjs`

Renames `## [Unreleased]` to the version in `package.json`, dated today, and
seeds a fresh empty Unreleased block above it. Reads `package.json`, writes
`CHANGELOG.md`, touches nothing else.

It refuses to promote an Unreleased block that carries no narrative, section
headings with nothing under them not counting. That guard exists because the
opposite behaviour has already cost a release: an empty block promoted on
schedule mints a version header with no notes behind it, which is the single
thing a changelog exists to prevent. A second run for the same version is
refused too, since stacking two headings on one version puts the notes under
the wrong number and the symptom appears releases later.

Every refusal names its reason on stderr and exits non-zero. The engine's own
`auto-bump.mjs` returns in silence on the same conditions, which is right for a
post-commit hook and wrong for a command somebody typed.

### The three steps of the manual release mode

Each script does one thing, and together they are what `derived` mode gets from
CI:

```
derive-bump.mjs        reads the commits    → prints the type
bump-version.mjs       takes the type       → writes package.json
promote-changelog.mjs  reads package.json   → writes CHANGELOG.md
```

None of them touches git. Staging, committing and tagging stay where the
approval is, which is with the person running them.

### `husky/pre-commit`

Runs the SDG gate against staged changes, blocking commit on BLOCK violations.
Four stages, each feeding the next:

```
git diff --staged  →  spec-driven-guide gate --prompt  →  <llm-cli>  →  spec-driven-guide gate --check
```

**The review is opt-in.** `SDG_GATE_LLM` ships empty, and an empty value makes
the hook exit 0 without reviewing anything, so the file stays as inert as the
rest of this directory until someone wires it. Two ways to turn it on:

- uncomment one of the example lines at the top of the hook, where `claude`,
  `codex` and `ollama` sit as examples
- export `SDG_GATE_LLM` in the environment, which enables the review in CI
  without editing a copied file

An uncommented line in the file wins over the environment. Any CLI works: the
gate only requires that the review JSON reaches stdout. An agent CLI that wraps
its output in an envelope (`{"type":"result","result":"…"}`) is unwrapped
automatically.

**Written for `sh -e`.** Husky runs every hook through `sh -e`, where a command
substitution that exits non-zero aborts the script on the spot. Both external
calls carry `|| VAR=$?` for that reason: without it, the fallback written three
lines below each call is unreachable, and a missing CLI ends the commit with
exit 127 and no message. Running a hook by hand with plain `sh` hides this,
because an interactive shell rarely carries errexit.

Failure modes are deliberately split. An unavailable LLM is infrastructure, not
a verdict: the hook warns and lets the commit through. A verdict the gate cannot
read is reported loudly and still exits 0 by default; add `--strict` to the
`--check` stage to turn that into a hard failure, recommended in CI, where a
silent pass is worse than a false alarm.

### `husky/commit-msg`

Validates conventional-commit prefix:
`feat|fix|docs|audit|land|chore|refactor|test|perf`.

Sources no shim. The `. "$(dirname -- "$0")/_/husky.sh"` line that husky 8 hooks
carried prints a deprecation banner on husky 9.1 and exits 2 on v10, which no
longer ships the file, so under `sh -e` it would block every commit.

An unreadable message file is reported by name and blocks the commit. Blocking
is the right answer there; saying so is the part `sh -e` would otherwise take
away, since a failing `head` ends the hook before any `echo` runs.

### `husky/husky-hooks.test.mjs`

Characterization test for both hooks. It runs the real files through `sh -e`,
the way husky invokes them, inside a throwaway git repository with one staged
file, and asserts the exit code.

A `PATH` shim stands in for `npx` and for the review command, so the suite needs
no network, no API key, and no LLM CLI installed. What it locks down is errexit
resilience: review disabled exits 0 in silence, a failing prompt stage or an
absent review command exits 0 with a warning, and a BLOCK verdict still exits 1.

### `github-actions/release-please.yml`

Derives the version from the commits, so nobody writes it by hand. On every push
to the default branch it reads the commits since the last tag, computes the next
version, and opens or updates a **release PR** carrying the version bump and the
generated `CHANGELOG.md`. Merging that PR tags the release.

The merge is the human gate, which is why this is the action SDG ships. The
alternative, `semantic-release`, publishes on every push and automates away the
approval that `versioning.md`, `VersionControl`, treats as non-negotiable.

`release-please-config.json` maps the SDG commit types onto changelog sections,
`audit` and `land` included, which no stock configuration knows about. Without
that mapping those cycles ship invisibly.

Publishing to a registry ships commented out, since a registry push is the one
step that cannot be taken back.

### `biome/biome.json`

Opt-in Biome config: fast baseline formatter plus a small set of ES style rules
(`useConst`, `useTemplate`, `useSingleVarDeclarator`, `noVar`, `noUselessElse`,
`useArrowFunction`).

Biome does not cover visual density. Blank-line rhythm, named const before call,
explaining returns and assertion spacing have no equivalent rule in Biome, and
its formatter preserves an existing blank line but never requires one. Those
stay with the ESLint rules in `eslint-rules/`. Run Biome alongside ESLint, not
instead of it.

### `hooks/writing-lint.mjs`

Advisory PostToolUse hook. Scans Markdown writes (Write / Edit / MultiEdit)
against the lexicons that ship beside the writing soul.

The rules live in `skills/writing-soul.md`, in English. The instances live in
`skills/lexicon/<language>.md`, one file per language, and the hook loads every
lexicon it finds. Adding a term is a text edit, never a code change, and a
document written in any language with a lexicon gets the same gate. The hook
resolves the lexicon from the project root, trying `.ai/skills/lexicon/` and
then `src/assets/skills/lexicon/`.

Scope: `src/assets/skills/*.md`, `src/content/**.md` and `.mdx`, `docs/**.md`,
`README*.md`, `CHANGELOG.md`. Working-state files (`tasks.md`, `context.md`,
`impact-map.md`, `stack.md`, `troubleshoot.md`, `learned.md`) are excluded, and
so is the lexicon tree, which is a list of banned terms by definition.

Always exits 0; reports go to stderr. When no lexicon resolves, the hook says so
and names every path it tried, because a run that loaded no list proves nothing.

## Activation recipes

### Activate ESLint rules

Requires ESLint v9+ with flat config (`eslint.config.mjs`).

1. Install ESLint and Prettier (if not already present):

```
npm install --save-dev eslint @eslint/js prettier eslint-plugin-prettier eslint-config-prettier
```

2. Import `sdgEslintConfig` from the snippet and add it **after** `prettierRecommended` in your flat config:

```js
import js from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import { sdgEslintConfig } from ".ai/tooling/eslint-config/snippet.mjs";

export default [js.configs.recommended, prettierRecommended, sdgEslintConfig];
```

3. Copy `.ai/tooling/eslint-config/.prettierrc` to your project root (or merge with your existing config).

4. Wire auto-fix on save in VSCode (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**Rules included:**

| Rule                                    | Coverage                                                               |
| :-------------------------------------- | :--------------------------------------------------------------------- |
| `curly: all`                            | Every `if`/`else`/`for`/`while` body must use `{ }`                    |
| `local/semantic-spacing`                | Blank line required after multiline statement in non-trivial functions |
| `local/no-boolean-comparison`           | `value === true/false` → `value` / `!value`                            |
| `local/duplicate-consecutive-statement` | Two adjacent statements with identical source text                     |
| `padding-line-between-statements`       | Blank line required before/after top-level function declarations       |

Or ask your agent: "wire the SDG ESLint rules into my eslint.config.mjs."

### Activate husky hooks

```
npm install --save-dev husky
npx husky init
cp .ai/tooling/husky/pre-commit .husky/pre-commit
cp .ai/tooling/husky/commit-msg .husky/commit-msg
chmod +x .husky/pre-commit .husky/commit-msg
```

Copy the two hooks, not the test beside them: `husky-hooks.test.mjs` stays in
`.ai/tooling/husky/`, where a test runner can reach it, and points at the files
in that directory rather than at the installed copies.

Both hooks run unchanged on husky 9 and on v10. `pre-commit` reviews nothing
until `SDG_GATE_LLM` carries a command, so a fresh install validates commit
messages and otherwise stays out of the way.

### Activate derived versioning (GitHub Actions)

Turns `release` in `context.md` from `manual` into `derived`. After this the
agent stops writing version numbers and stops writing `CHANGELOG.md`, because
the action generates both from the commits.

1. Copy the three files, giving two of them the leading dot they carry at the
   project root:

```
mkdir -p .github/workflows
cp .ai/tooling/github-actions/release-please.yml .github/workflows/release.yml
cp .ai/tooling/github-actions/release-please-config.json .release-please-config.json
cp .ai/tooling/github-actions/release-please-manifest.json .release-please-manifest.json
```

2. Set the manifest to the version already published, so the first run computes
   the next one instead of starting over:

```json
{ ".": "1.4.2" }
```

3. Let the action open pull requests: **Settings → Actions → General → Workflow
   permissions**, then tick _Allow GitHub Actions to create and approve pull
   requests_. Without it the first run fails with a permission error that reads
   like a bad token and is not one.

4. Declare the mode in `.ai/backlog/context.md`:

```
release: derived
```

**The everyday loop**, which is the part worth reading before wiring anything:

| You do                      | It does                                                                                |
| :-------------------------- | :------------------------------------------------------------------------------------- |
| Commit `feat: ...` and push | Opens or updates the release PR. Nothing is tagged yet                                 |
| Commit three more times     | Updates that same PR, recomputing the version on each push                             |
| Merge the release PR        | Tags `vX.Y.Z`, writes `CHANGELOG.md` and `package.json` on `main`, creates the release |
| `git pull`                  | Your working copy catches up with the version the action wrote                         |

The pull happens once per release, at the merge, never once per commit. Between
releases the local `package.json` holds the previous version, which is the
accurate state: the new version does not exist until the release does.

Or ask your agent: "wire derived versioning."

### Wire scripts as npm commands

Edit `package.json`:

```json
{
  "scripts": {
    "prune:backlog": "node .ai/tooling/scripts/prune-backlog.mjs",
    "bump:version": "node .ai/tooling/scripts/bump-version.mjs",
    "bump:auto": "node .ai/tooling/scripts/bump-version.mjs $(node .ai/tooling/scripts/derive-bump.mjs)",
    "release:local": "npm run bump:auto && node .ai/tooling/scripts/promote-changelog.mjs"
  }
}
```

`bump:auto` is the `manual` release mode with the guesswork removed: the type
comes from the commits instead of from whoever is running the command.
`release:local` adds the changelog promotion, which leaves the working tree
ready for a commit that nobody has approved yet.

Or ask your agent: "wire the tooling scripts into package.json."

### Activate SQLFluff

Requires SQLFluff 2.x.

1. Install SQLFluff:

```
pip install sqlfluff
```

2. Copy the standard config to your project root:

```
cp .ai/tooling/sqlfluff/.sqlfluff .sqlfluff
```

3. Wire format-on-save in VSCode (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "[sql]": {
    "editor.defaultFormatter": "dorzey.vscode-sqlfluff"
  }
}
```

4. For PostgreSQL projects, change in `.sqlfluff`:

```ini
dialect = postgres
[sqlfluff:rules:capitalisation.identifiers]
capitalisation_policy = lower
```

**Rules included:**

| Rule                         | Coverage                                    |
| :--------------------------- | :------------------------------------------ |
| `capitalisation.keywords`    | Keywords uppercase                          |
| `capitalisation.identifiers` | Identifiers PascalCase (SQL Server default) |
| `layout.comma`               | Trailing commas                             |
| `layout.operators`           | Trailing `AND` / `OR` (after operator)      |
| `references.qualification`   | Requires `Table.Column` qualification       |

Or ask your agent: "wire SQLFluff into my project."

### Activate Biome

A fast formatter and baseline linter that runs beside ESLint. It covers
formatting and common ES style; the visual-density rules stay in ESLint.

Two things the config already handles, both of which abort Biome otherwise:
it excludes `.ai/`, because Biome 2.x reads the template copy still sitting in
`.ai/tooling/biome/` as a second root config; and it sets `vcs.useIgnoreFile`,
which needs a git repository with a `.gitignore` present.

1. Install Biome:

```
npm install --save-dev --save-exact @biomejs/biome
```

2. Copy the config to your project root:

```
cp .ai/tooling/biome/biome.json biome.json
```

3. Add an opt-in script to `package.json` (does NOT replace `lint`):

```json
{
  "scripts": {
    "lint:biome": "biome check .",
    "lint:biome:fix": "biome check --write ."
  }
}
```

4. Optional VSCode format-on-save (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "[javascript]": { "editor.defaultFormatter": "biomejs.biome" },
  "[json]": { "editor.defaultFormatter": "biomejs.biome" }
}
```

**Rules included:**

| Biome rule               | Coverage                                       |
| :----------------------- | :--------------------------------------------- |
| `formatter.lineWidth`    | 100 columns                                    |
| `useConst`               | No `let` for never-reassigned bindings         |
| `useTemplate`            | Template literals over string concatenation    |
| `useSingleVarDeclarator` | One declaration per `const` / `let` statement  |
| `noVar`                  | Forbid `var`                                   |
| `noUselessElse`          | Remove `else` after a guarded `return`         |
| `useArrowFunction`       | Prefer arrow functions for anonymous callbacks |
| `useConsistentArrayType` | `T[]` over `Array<T>` (TS)                     |

**Not covered: keep ESLint for these.** Checked against Biome 2.5.5 with
`preset: "all"`, the full catalog: none of the five produce a diagnostic.

| SDG rule                                | Gap in Biome                                                                                |
| :-------------------------------------- | :------------------------------------------------------------------------------------------ |
| `local/semantic-spacing`                | No blank-line rhythm rule; the formatter keeps an existing blank line but never demands one |
| `local/blank-before-assertion`          | Same gap, applied to test bodies                                                            |
| `local/no-inline-assert`                | No rule for naming both sides of an assertion                                               |
| `local/no-boolean-comparison`           | `value === true` goes unreported                                                            |
| `local/duplicate-consecutive-statement` | A statement repeated verbatim on the next line goes unreported                              |

Or ask your agent: "wire Biome into my project."

### Activate writing-lint hook

Advisory hook that scans Markdown writes against the lexicons in
`.ai/skills/lexicon/`. Reports to stderr; never blocks the tool call.

1. Copy the hook script into the project:

```
mkdir -p .claude/hooks
cp .ai/tooling/hooks/writing-lint.mjs .claude/hooks/writing-lint.mjs
chmod +x .claude/hooks/writing-lint.mjs
```

2. Register it as a PostToolUse hook in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/writing-lint.mjs"
          }
        ]
      }
    ]
  }
}
```

3. Test by editing a scoped file (e.g. `docs/test.md`) with a banned term.
   Stderr should show `<file>:<line> <class> (<language>): "<term>"`, plus
   `→ "<replacement>"` when the lexicon records one.

**Scope** (positive match): `src/assets/skills/*.md`, `src/content/**.md` and
`.mdx`, `docs/**.md`, `README*.md`, `CHANGELOG.md`.
**Excluded** (working state): `tasks.md`, `context.md`, `impact-map.md`,
`stack.md`, `troubleshoot.md`, `learned.md`, plus `checklist-soul.md` and the
lexicon tree, which quote banned instances by design.

**Adding a language**: drop `lexicon/<language>.md` next to the existing ones,
using the same `## Class` headings the soul declares. No code change.

Or ask your agent: "wire the writing-lint hook."
