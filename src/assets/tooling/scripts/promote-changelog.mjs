#!/usr/bin/env node

/**
 * Promotes `## [Unreleased]` in CHANGELOG.md to the version in package.json,
 * dated today, and seeds a fresh empty Unreleased block above it.
 *
 * Reads package.json, writes CHANGELOG.md, and touches nothing else. It is the
 * third step of the manual release mode, after `derive-bump.mjs` picks the type
 * and `bump-version.mjs` applies it.
 */

import fileSystem from "node:fs";
import path from "node:path";

const UNRELEASED_HEADING = /^##[ \t]*\[Unreleased\].*$/im;
const NEXT_HEADING = /^##[ \t]/m;
const SECTION_HEADING = /^###.*$/gm;
const FRESH_BLOCK = "## [Unreleased]\n\n### Added\n\n### Fixed\n\n";

function run() {
  const version = readVersion();
  const changelogPath = resolveChangelogPath();
  const content = readChangelog(changelogPath);
  const promotedContent = promoteUnreleased(content, version);

  fileSystem.writeFileSync(changelogPath, promotedContent);

  const confirmation = `CHANGELOG.md: [Unreleased] → [${version}]`;
  console.log(confirmation);
}

function promoteUnreleased(content, version) {
  guardNotAlreadyPromoted(content, version);

  const headingMatch = content.match(UNRELEASED_HEADING);
  guardHeadingFound(headingMatch);
  guardNarrativePresent(content, headingMatch);

  const releaseDate = new Date().toISOString().split("T").at(0);
  const releaseHeading = `## [${version}] - ${releaseDate}`;
  const promotedContent = content.replace(UNRELEASED_HEADING, releaseHeading);

  const insertIndex = promotedContent.indexOf(releaseHeading);
  const head = promotedContent.slice(0, insertIndex);
  const tail = promotedContent.slice(insertIndex);

  const seededContent = `${head}${FRESH_BLOCK}${tail}`;
  return seededContent;
}

// why: a second run would otherwise stack two headings for one version, and the
// first symptom is a release whose notes sit under the wrong number.
function guardNotAlreadyPromoted(content, version) {
  const escapedVersion = version.replace(/\./g, "\\.");
  const versionHeading = new RegExp(`^##[ \t]*\\[${escapedVersion}\\]`, "m");
  const isAlreadyPromoted = versionHeading.test(content);

  if (isAlreadyPromoted) {
    exitWithReason(`CHANGELOG.md already carries a [${version}] section.`);
  }
}

function guardHeadingFound(headingMatch) {
  const hasHeading = headingMatch !== null;

  if (!hasHeading) {
    exitWithReason("No `## [Unreleased]` heading found in CHANGELOG.md.");
  }
}

/**
 * why: promoting an empty block mints a version header with no narrative behind
 * it, which is the one thing a changelog exists to prevent. Section headings
 * with nothing under them are scaffolding, so they do not count as narrative.
 */
function guardNarrativePresent(content, headingMatch) {
  const unreleasedBody = readUnreleasedBody(content, headingMatch);
  const withoutScaffolding = unreleasedBody.replace(SECTION_HEADING, "");
  const hasNarrative = withoutScaffolding.trim().length > 0;

  if (!hasNarrative) {
    exitWithReason("[Unreleased] is empty. Write the entry before promoting.");
  }
}

function readUnreleasedBody(content, headingMatch) {
  const bodyStart = headingMatch.index + headingMatch[0].length;
  const remainder = content.slice(bodyStart);
  const nextHeadingMatch = remainder.match(NEXT_HEADING);

  const bodyEnd =
    nextHeadingMatch === null ? remainder.length : nextHeadingMatch.index;

  const unreleasedBody = remainder.slice(0, bodyEnd);
  return unreleasedBody;
}

function readVersion() {
  const packagePath = path.join(process.cwd(), "package.json");

  if (!fileSystem.existsSync(packagePath)) {
    exitWithReason(`Not found: ${packagePath}`);
  }

  const rawContent = fileSystem.readFileSync(packagePath, "utf8");
  const parsed = JSON.parse(rawContent);

  const hasVersion =
    typeof parsed.version === "string" && parsed.version.length > 0;

  if (!hasVersion) {
    exitWithReason(`Missing "version" field in ${packagePath}`);
  }

  return parsed.version;
}

function resolveChangelogPath() {
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  return changelogPath;
}

function readChangelog(changelogPath) {
  if (!fileSystem.existsSync(changelogPath)) {
    exitWithReason(`Not found: ${changelogPath}`);
  }

  const content = fileSystem.readFileSync(changelogPath, "utf8");
  return content;
}

// why: the engine's own auto-bump returns in silence on every one of these,
// which is right for a post-commit hook and wrong for a command someone typed.
function exitWithReason(reason) {
  console.error(`❌ ${reason}`);
  process.exit(1);
}

run();
