# Migration v9 → v10

`.ai/` used to hold two things that belong to different owners. v10 separates them, and the
separation is what lets the copy the CLI writes leave version control.

## What changed

| Before (v9)                                                         | After (v10)                                                                                     |
| :------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------- |
| `.ai/skills/`, `.ai/instructions/`, `.ai/commands/`, `.ai/tooling/` | `.ai/kit/` + the same four directories inside it                                                |
| The whole tree committed: 80 files, ~9000 lines on install          | The kit gitignored: 11 files committed                                                          |
| `tasks.md` gitignored, all four sections                            | `tasks.md` committed (`## Backlog`, `## Done`), `session.md` gitignored (`## Now`, `## Active`) |
| An update pruned stale files by manifest inventory                  | Every install clears `.ai/kit/` whole and rebuilds it                                           |
| No way to rebuild a clone's governance                              | `npx spec-driven-guide restore`                                                                 |

## Run the migration

```bash
npx spec-driven-guide init --quick
```

The install detects a pre-v10 tree, removes it, rebuilds under `.ai/kit/`, and prints two things
you should read:

- **The files no release wrote.** Anything you added by hand inside the old tree is named before it
  goes. This is the only run where that list appears, because from v10 on `.ai/kit/` is disposable
  by contract: it is cleared whole on every install.
- **The untracking command.** The CLI removes the files from disk; git still holds them.

```bash
git rm -r --cached .ai/skills .ai/instructions .ai/commands .ai/tooling
```

Your backlog is not touched. `context.md`, `stack.md`, `learned.md` and `troubleshoot.md` survive
the migration unchanged, and `tasks.md` keeps `## Backlog` and `## Done` where they were.

## What you have to do by hand

**Split your `tasks.md`.** The install writes a fresh `session.md` only when none exists, so an
existing `tasks.md` keeps its `## Now` and `## Active`. Move those two sections into
`.ai/backlog/session.md` and leave `## Backlog` and `## Done` behind.

**Repoint anything that invoked the tooling by path.** If your `package.json` runs
`node .ai/tooling/scripts/prune-backlog.mjs`, the path is now
`node .ai/kit/tooling/scripts/prune-backlog.mjs`. The same applies to husky hooks you wired and to
any CI step that reads a skill file. The CLI cannot rewrite your scripts, so it names the change
instead.

**Add the restore step to CI**, if a job reads `.ai/kit/`. A fresh clone does not carry it.

## Restoring a clone

`.ai/kit/` is a pure function of the version and the selections the manifest records, and the
manifest is committed. A clone rebuilds the exact tree its commit described:

```bash
npx spec-driven-guide restore
```

It reads `.ai/.sdg-manifest.json`, refuses if this CLI is not the release the manifest pins (and
names the one to use), rebuilds the tree, and verifies every file against the recorded hashes.

## Why the kit left git

An update used to produce a diff nobody read, and a diff nobody reads is a diff that gets approved
blind. What the reviewer needs is not 66 rewritten markdown files: it is the version and the hashes,
which is one file. The kit is regenerable from that file, so keeping it under version control bought
nothing the manifest does not already prove.

The consequence is worth stating plainly: **an edit inside `.ai/kit/` is lost on the next install,
with no diff to warn you.** Divergence from the canon is answered by pinning a version or moving the
change upstream, never by editing locally.

## Rolling back

Pin the previous release and install it:

```bash
npx spec-driven-guide@9.0.0 init --quick
```

v9 writes the tree back under `.ai/` and leaves `.ai/kit/` behind, which you can delete. Your
backlog is untouched either way.
