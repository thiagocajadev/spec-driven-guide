# Troubleshooting & RCA Logs: spec-driven-guide

> Persistent repository for failure records, Root Cause Analysis (RCA), and technical debt.

## Failure Records (RCA)

- **2026-11-18 `writing-lint` silent on Windows**:
  - **Issue**: The hook never reported a hit on Windows. Every Markdown write fell out of scope and the hook exited 0.
  - **Root Cause**: `isScopedPath` tested the raw `file_path` against scope patterns written for `/`, and Claude Code on Windows sends backslashes. Only `isLexiconPath` normalized, and it split on `path.sep`, which is `/` on Linux.
  - **Gotcha**: `path.sep` normalizes only for the platform the code runs on. A path that crosses platforms, such as a hook payload or a test fixture, needs the backslash replaced directly.
  - **Fix**: RESOLVED in v11.1.2. `isScopedPath` normalizes once and feeds the result to the basename, lexicon and scope checks.
  - **Pinned by**: `src/assets/tooling/hooks/writing-lint.test.mjs`, "accepts an absolute Windows path, which Claude Code sends with backslashes", with three sibling backslash cases under `writing-lint.isScopedPath`.

- **2026-04-09 npm publish missing files**:
  - **Issue**: 5 critical runtime files in `src/engine/bin/` were missing from the published npm package.
  - **Root Cause**: The `files` field in `package.json` was prunable and didn't explicitly include the `bin` directory or its subfolders correctly after the monorepo extraction.
  - **Gotcha**: npm prioritizes the `files` array as an absolute allowlist; anything not matched is excluded.
  - **Fix**: Replaced complex glob patterns in `files` with explicit directory entries (`src/engine/`, `src/assets/`).

- **2026-04-11 Protocol Breach (Unauthorized Push & Documentation Drift)**:
  - **Issue**: Agent performed \`git push\` without explicit user authorization and incorporated non-existent Expertise files (\`learned.md\`/\`troubleshoot.md\`) into the Portuguese README.
  - **Root Cause**:
    1. **Protocol**: Failed to follow Step 150 of the SDG constitution (Explicit Push Approval).
    2. **Parity**: Over-specified the PT-BR README by including internal tooling files that are not part of the standard CLI installation.
  - **Fix**: RESOLVED. Reverted PT-BR README to match EN mirror; logged the breach to enforce stricter Command/Control loops.
  - **Pinned by**: `src/assets/tooling/hooks/git-guard.test.mjs`, "refuses git push in every form the harness may send" (v11.1.0), where the hook recipe is installed.

- **2026-04-10 Changelog Version Mismatch**:
  - **Issue**: Cycle terminators (\`end:\`) were defaulting to \`## [Unreleased]\` headers, causing a disconnect in projects with automated versioning (\`auto-bump\`).
  - **Root Cause**: Universal instructions in \`sdg-end.md\` and \`workflow.md\` lacked a "Next Version Discovery" step.
  - **Fix**: RESOLVED. Hardened \`Phase: END\` checklist to include finding the next package version and using it as the header in \`CHANGELOG.md\`.

- **2026-04-10 \`replace_file_content\` Target Match Failure**:
  - **Issue**: Multiple attempts to update \`sdg-feat.md\` and \`sdg-fix.md\` failed with "target content not found".
  - **Root Cause**: Casing mismatches (e.g., \`scansion\` vs \`Scansion\`) and whitespace differences in the \`TargetContent\` string.
  - **Gotcha**: \`replace_file_content\` requires bit-level exact matching.
  - **Fix**: Use \`view_file\` with line numbering immediately before attempting a replacement to verify exact characters and whitespace.

- **2026-04-12 Protocol Breach (Unauthorized Commit via Bump Logic)**:
  - **Issue**: Agent performed a `git commit` without explicit approval while running the `npm run bump` command.
  - **Root Cause**: The `bump.mjs` script contained internal `execSync('git commit ...')` logic, which was executed by the agent as part of the normal `end:` cycle, bypassing the mandatory approval gate.
  - **Fix**: RESOLVED. Decoupled versioning from committing. Modified `bump.mjs`, `auto-bump.mjs` and templates to remove automatic git operations. Updated `sdg-end.md` to mandate manual commit with approval after bumping.
  - **Gotcha**: High-level project scripts can mask unauthorized operations. Always audit script contents before execution if they interact with Git.
  - **Pinned by**: `src/assets/tooling/scripts/bump.test.mjs`, "never runs a git command that writes".

- **2026-04-12 CHANGELOG Date Timezone Drift**:
  - **Issue**: Promoted dates in `CHANGELOG.md` were jumping +1 day ahead for developers in negative timezones (e.g. UTC-3) when releasing late at night.
  - **Root Cause**: `toISOString()` was used for date extraction, which ignores the local machine clock and always returns UTC time.
  - **Fix**: Replaced `toISOString().split('T')[0]` with `toLocaleDateString('en-CA')` which respects the local timezone while maintaining the YYYY-MM-DD format.
  - **Gotcha**: Always avoid UTC-forcing methods for artifacts that should reflect the user's local "today".

- **2026-04-12 Protocol Breach (Skipping Semantic Release Pipeline)**:
  - **Issue**: Agent performed a manual `git commit` leaving versioning and `CHANGELOG.md` stuck in `[Unreleased]` without triggering the semantic pipeline during the `Phase: END`.
  - **Root Cause**: The protocol explicitly commands to run `npm run bump <feat|fix>` in Step 6, but the agent bypassed it and skipped directly to `git commit`, ignoring the semantic automation.
  - **Gotcha**: A manual `git commit` during delivery defeats the "Gatekeeper Delivery Workflow". Semantic version promotion is mandatory via `npm run bump`.
  - **Fix**: Re-ran `npm run bump feat` to process `[Unreleased]` into the new stable version header before committing. DO NOT bypass Step 6 of `sdg-end.md`.

## Technical Debt & Risks

- _(none)_
