# Migrating to v8: the package is now `spec-driven-guide`

v8.0.0 changed the published name and nothing else. This page is for a project still installed under `sdg-agents`, the name the CLI carried through v7.0.1. The deprecation notice npm prints for `sdg-agents` points here.

Installing today brings the latest release, not v8, so two later majors apply on the same run. Read [MIGRATION-v10.md](MIGRATION-v10.md) and [MIGRATION-v11.md](MIGRATION-v11.md) after this page: v10 moved the installed files under `.ai/kit/` and out of git, and v11 stopped writing `CLAUDE.md`. The structural changes of v3 through v6 are recorded in [the changelog archive](../CHANGELOG-archive.md).

## TL;DR

```bash
npm uninstall -g sdg-agents          # if it was installed globally
npx spec-driven-guide@latest init    # installs the latest release under the new name
```

`init` rebuilds the installed files in place. Your `.ai/backlog/` is not overwritten.

## What changed

| Before                                    | After                                        |
| :---------------------------------------- | :------------------------------------------- |
| npm package `sdg-agents`                  | npm package `spec-driven-guide`              |
| binary `sdg-agents`                       | binary `spec-driven-guide`                   |
| repository `thiagocajadev/sdg-agents-cli` | repository `thiagocajadev/spec-driven-guide` |

`sdg-agents` stays installable and deprecated, so nothing broke the moment v8 shipped. It receives no further releases.

## Why the name moved

`SDG` reads as the UN Sustainable Development Goals to every search engine, and the field this project works in is spelled out as _spec-driven_. The old name carried neither the brand nor a term anyone searches. `spec-driven-guide` matches the site at [specdrivenguide.org](https://specdrivenguide.org), and its hyphens let a search for `spec driven` find it: search engines split on hyphens, never inside a compound word.

`SDG` stays as the internal acronym. The cycle commands are still `sdg-feat.md`, `sdg-fix.md` and their siblings, the phase banner still opens with `SDG ·`, and the rules file is still `sdg-rules.json`. Agents read those names inside your repository; no search index does.

## Two things to check by hand

1. **Scripts that call the old binary.** Search your `package.json` for `sdg-agents` and replace it:

   ```diff
   -"governance": "sdg-agents audit"
   +"governance": "spec-driven-guide audit"
   ```

2. **The husky pre-commit hook**, if you wired the optional gate. It calls `npx --no-install sdg-agents gate`, which still resolves to the deprecated package. Copy it again from `.ai/kit/tooling/husky/pre-commit` after running `init`, or edit the two lines in place.

## Pinning, if you are not ready

```bash
npx sdg-agents@7 init
```

v7.0.1 is the final release under the old name and stays on the registry. No deadline applies to this migration.
