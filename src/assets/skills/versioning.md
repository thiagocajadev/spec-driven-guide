# Versioning: commit shape, release modes, and who decides the number

<ruleset name="Versioning">

> Load in **Phase END**, and in any task that writes a commit message, wires a release pipeline, or opens a pull request.
> Canonical for commit shape. `code-style.md`, `ci-cd.md`, `review.md` and `workflow.md` Phase END cite this file. Do not restate the format anywhere else.

<rule name="VersionControl">

## Commit shape

**Subject**: `<type>[scope][!]: <description>`. Types are `feat`, `fix`, `docs`, `audit`, `land`, `chore`, `refactor`, `test` and `perf`. The `commit-msg` hook in `.ai/kit/tooling/husky/` rejects anything else.

**Description**: lowercase, no trailing period. It names what changed, never that something changed. `fix: husky hooks under sh -e` over `fix: bug fixes`.

**Body**: prose wrapped at 72 columns, governed by `writing-soul.md` like any perennial artifact. It carries why the change was made and what surfaced along the way. A bullet restatement of the diff belongs in the diff.

## The version is derived, never invented

**The version is derived from the commits and never written into them.** That is what lets a team release without one person owning the number:

| Signal                                                      | Bump  |
| :---------------------------------------------------------- | :---- |
| `feat:`                                                     | MINOR |
| `fix:`, `perf:`                                             | PATCH |
| `!` after the type or scope, or a `BREAKING CHANGE:` footer | MAJOR |
| `docs`, `chore`, `refactor`, `test`, plus `audit`, `land`   | none  |

MAJOR breaks a published contract, MINOR adds one, PATCH holds it. The table decides which; judgment decides nothing.

## Release mode

Declared once as `release` in `context.md`. When the key is absent, read it as `manual`: that is what a project predating this rule was already doing, and defaulting the other way would silently stop its changelog. `land:` asks the question for new projects and recommends `derived` for teams.

### `derived` (default for new projects)

A CI job computes the version from the table above. The subject never carries it, because the tag already does, and **`CHANGELOG.md` is generated rather than written**: the commit body is the changelog entry, so writing both produces two sources that drift.

`release-please` accumulates commits into a release pull request that a human merges when ready. `semantic-release` ships on every merge instead. Prefer the first, since it keeps the approval this ruleset treats as non-negotiable. The workflow ships inert in `.ai/kit/tooling/github-actions/`.

The pull happens once per release, at the merge, never once per commit. Between releases the local `package.json` holds the previous version, which is the accurate state: the new version does not exist until the release does.

### `manual` (opt-in)

The maintainer runs the release locally and the commit carries the version: `<type>: release v<major.minor.patch> - <description>`. Fits a single-maintainer repository, where the human is the pipeline, and costs no CI. It does not survive contact with a team, since two people releasing means two people deciding the number.

`npm run bump <type>` does locally what CI does in the other mode: `scripts/bump.mjs`, which `init` installs from `.ai/kit/tooling/scripts/bump.mjs`, picks the version (`auto` derives it from the commits since the last tag), writes `package.json`, and promotes `[Unreleased]` in `CHANGELOG.md`. It refuses an empty `[Unreleased]` before writing anything.

It reads git and never writes to it. Staging, committing and tagging stay where the approval is.

## Non-negotiables

**One cycle, one release commit.** Adjustments found along the way ship as a separate `chore:` before it, so the release commit describes its cycle and nothing else.

**Sovereign gate**: never `git commit` without explicit approval of that specific message. Deriving the version never derives the approval.

</rule>

</ruleset>
