#!/usr/bin/env node

/**
 * The release bump of the `manual` mode: picks the next version, writes it to
 * package.json (and package-lock.json when present), and promotes
 * `## [Unreleased]` in CHANGELOG.md to that version, dated today.
 *
 *   node bump.mjs <feat|fix|docs|land|audit|major|patch|minor|auto>
 *
 * `auto` derives the level from the commits since the last tag, with the table
 * release-please applies in CI. Git is only read, never written: staging,
 * committing and tagging stay with the person who approves the release.
 *
 * why: one file, because the same job used to live in four scripts and every
 * fix landed in one copy while the others drifted. `init` copies this file into
 * a Node project as `scripts/bump.mjs`, and this repository runs it in place.
 */

import fileSystem from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const LEVEL_BY_TYPE = {
  feat: "minor",
  fix: "patch",
  docs: "patch",
  land: "patch",
  audit: "patch",
  major: "major",
  patch: "patch",
  minor: "minor",
};

const AUTO_TYPE = "auto";
const LEVEL_PRECEDENCE = ["patch", "minor", "major"];
const UNRELEASED_HEADING = /^##[ \t]*\[Unreleased\].*$/im;
const NEXT_RELEASE_HEADING = /\n## \[/;
const SECTION_HEADING = /^###.*$/gm;
const FRESH_BLOCK = "## [Unreleased]\n\n### Added\n\n### Fixed\n\n";

function run() {
  const rootDirectory = process.cwd();
  const requestedType = process.argv[2];
  const level = resolveLevel(requestedType, readCommitsSinceLastTag);

  const packagePath = path.join(rootDirectory, "package.json");
  const packageData = readPackageJson(packagePath);
  const currentVersion = packageData.version;
  const nextVersion = incrementVersion(currentVersion, level);

  // why: every refusal is decided before the first write, so a refused bump
  // leaves package.json and CHANGELOG.md exactly as they were.
  const changelogPath = path.join(rootDirectory, "CHANGELOG.md");
  const releaseDate = new Date().toISOString().split("T").at(0);
  const promotedChangelog = planChangelog(
    changelogPath,
    nextVersion,
    releaseDate,
  );

  writeVersion(packagePath, packageData, nextVersion);
  writeLockfileVersion(rootDirectory, nextVersion);

  if (promotedChangelog !== null) {
    fileSystem.writeFileSync(changelogPath, promotedChangelog);
  }

  console.log(`✅ ${currentVersion} → ${nextVersion} (${level})`);
  console.log("⚠️  Files updated. Commit only after the release is approved.");
}

export function resolveLevel(requestedType, readCommits) {
  if (requestedType === AUTO_TYPE) {
    const derivedLevel = deriveLevel(readCommits());
    return derivedLevel;
  }

  const level = LEVEL_BY_TYPE[requestedType];
  if (level === undefined) {
    const acceptedTypes = [...Object.keys(LEVEL_BY_TYPE), AUTO_TYPE].join("|");
    throw new Error(`Usage: bump.mjs <${acceptedTypes}>`);
  }

  return level;
}

export function deriveLevel(commitMessages) {
  const hasCommits = commitMessages.length > 0;
  if (!hasCommits) {
    throw new Error("No commits since the last tag. Nothing to release.");
  }

  const detectedTypes = commitMessages.map(detectBumpType);
  const strongestLevel = selectStrongestLevel(detectedTypes);

  if (strongestLevel === null) {
    throw new Error(
      "No commit since the last tag releases: chore and test never do.",
    );
  }

  return strongestLevel;
}

/**
 * why: the table in `versioning.md`, which the release-please config applies
 * in CI. A project that starts on a local bump and later wires the action keeps
 * producing the same numbers, so moving between the two modes never renumbers
 * a release. `version-table.test.mjs` holds this function to that table.
 */
export function detectBumpType(commitMessage) {
  const [firstLine] = commitMessage.split("\n");
  const footer = commitMessage.split("\n").slice(1).join("\n");

  const BUMP_RULES = [
    { test: () => /^[a-z]+(\([^)]+\))?!:/.test(firstLine), value: "major" },
    { test: () => /BREAKING CHANGE:/m.test(footer), value: "major" },
    { test: () => /^(chore|test)(\([^)]+\))?:/.test(firstLine), value: "skip" },
    { test: () => /^feat(\([^)]+\))?:/.test(firstLine), value: "minor" },
  ];

  const matchedRule = BUMP_RULES.find((rule) => rule.test());
  const bumpType = matchedRule?.value ?? "patch";
  return bumpType;
}

function selectStrongestLevel(bumpTypes) {
  const releasableTypes = bumpTypes.filter((type) => type !== "skip");
  const hasReleasableType = releasableTypes.length > 0;

  if (!hasReleasableType) {
    return null;
  }

  const strongestRank = releasableTypes.reduce(
    (highest, type) => Math.max(highest, LEVEL_PRECEDENCE.indexOf(type)),
    0,
  );

  const strongestLevel = LEVEL_PRECEDENCE[strongestRank];
  return strongestLevel;
}

export function incrementVersion(currentVersion, level) {
  const parts = currentVersion
    .split(".")
    .map((value) => Number.parseInt(value, 10));

  const isSemverTriplet =
    parts.length === 3 && parts.every((value) => Number.isFinite(value));

  if (!isSemverTriplet) {
    throw new Error(`Invalid semver: ${currentVersion}`);
  }

  const [major, minor, patch] = parts;

  const INCREMENTERS = {
    major: () => `${major + 1}.0.0`,
    minor: () => `${major}.${minor + 1}.0`,
    patch: () => `${major}.${minor}.${patch + 1}`,
  };

  const nextVersion = INCREMENTERS[level]();
  return nextVersion;
}

function planChangelog(changelogPath, nextVersion, releaseDate) {
  if (!fileSystem.existsSync(changelogPath)) {
    console.warn("⚠️  CHANGELOG.md not found. Bumping the version only.");
    return null;
  }

  const content = fileSystem.readFileSync(changelogPath, "utf8");
  const promotedContent = promoteUnreleased(content, nextVersion, releaseDate);
  return promotedContent;
}

/**
 * Renames `## [Unreleased]` to the release heading, drops the scaffolding
 * sections the cycle left empty, and seeds a fresh Unreleased block above it.
 */
export function promoteUnreleased(content, version, releaseDate) {
  guardNotAlreadyPromoted(content, version);

  const headingMatch = content.match(UNRELEASED_HEADING);
  if (headingMatch === null) {
    throw new Error("No `## [Unreleased]` heading found in CHANGELOG.md.");
  }

  guardNarrativePresent(content, headingMatch);

  const releaseHeading = `## [${version}] - ${releaseDate}`;
  const renamedContent = content.replace(UNRELEASED_HEADING, releaseHeading);
  const compactedContent = dropEmptySubsections(renamedContent, releaseHeading);

  const insertIndex = compactedContent.indexOf(releaseHeading);
  const head = compactedContent.slice(0, insertIndex);
  const tail = compactedContent.slice(insertIndex);

  const promotedContent = `${head}${FRESH_BLOCK}${tail}`;
  return promotedContent;
}

// why: a second run would otherwise stack two headings for one version, and the
// first symptom is a release whose notes sit under the wrong number.
function guardNotAlreadyPromoted(content, version) {
  const escapedVersion = version.replace(/\./g, "\\.");
  const versionHeading = new RegExp(`^##[ \t]*\\[${escapedVersion}\\]`, "m");
  const isAlreadyPromoted = versionHeading.test(content);

  if (isAlreadyPromoted) {
    throw new Error(`CHANGELOG.md already carries a [${version}] section.`);
  }
}

/**
 * why: promoting an empty block mints a version header with no narrative behind
 * it, which is the one thing a changelog exists to prevent. Section headings
 * with nothing under them are scaffolding, so they do not count as narrative.
 */
function guardNarrativePresent(content, headingMatch) {
  const bodyStart = headingMatch.index + headingMatch[0].length;
  const unreleasedBody = readBlockBody(content, bodyStart);
  const withoutScaffolding = unreleasedBody.replace(SECTION_HEADING, "");
  const hasNarrative = withoutScaffolding.trim().length > 0;

  if (!hasNarrative) {
    throw new Error("[Unreleased] is empty. Write the entry before bumping.");
  }
}

function readBlockBody(content, bodyStart) {
  const remainder = content.slice(bodyStart);
  const nextReleaseOffset = remainder.search(NEXT_RELEASE_HEADING);
  const bodyEnd = nextReleaseOffset >= 0 ? nextReleaseOffset : remainder.length;

  const blockBody = remainder.slice(0, bodyEnd);
  return blockBody;
}

/**
 * `### Added` and `### Fixed` are scaffolding the next cycle writes into. A
 * cycle that only fixed things must not ship a released block advertising an
 * empty `### Added`: the scaffold belongs to `[Unreleased]`, not to history.
 */
function dropEmptySubsections(content, releaseHeading) {
  const blockStart = content.indexOf(releaseHeading) + releaseHeading.length;
  const releasedBlock = readBlockBody(content, blockStart);
  const blockEnd = blockStart + releasedBlock.length;

  const sections = releasedBlock.split(/\n(?=### )/);
  const populatedSections = sections.filter(isPopulatedSection);

  const compactedContent =
    content.slice(0, blockStart) +
    populatedSections.join("\n") +
    content.slice(blockEnd);

  return compactedContent;
}

function isPopulatedSection(section) {
  const isSubsection = section.startsWith("### ");
  if (!isSubsection) {
    return true;
  }

  const [, ...bodyLines] = section.split("\n");

  const hasBody = bodyLines.some((line) => line.trim().length > 0);
  return hasBody;
}

function readPackageJson(packagePath) {
  if (!fileSystem.existsSync(packagePath)) {
    throw new Error(`Not found: ${packagePath}`);
  }

  const rawContent = fileSystem.readFileSync(packagePath, "utf8");
  const parsed = JSON.parse(rawContent);

  const hasVersion =
    typeof parsed.version === "string" && parsed.version.length > 0;

  if (!hasVersion) {
    throw new Error(`Missing "version" field in ${packagePath}`);
  }

  return parsed;
}

function writeVersion(packagePath, packageData, nextVersion) {
  const updatedPackage = { ...packageData, version: nextVersion };
  const serialized = `${JSON.stringify(updatedPackage, null, 2)}\n`;

  fileSystem.writeFileSync(packagePath, serialized);
}

// why: npm keeps the root version in two places of the lockfile. Leaving them
// behind makes the next `npm install` rewrite the lockfile as an unrelated diff.
function writeLockfileVersion(rootDirectory, nextVersion) {
  const lockfilePath = path.join(rootDirectory, "package-lock.json");
  if (!fileSystem.existsSync(lockfilePath)) {
    return;
  }

  const lockfile = JSON.parse(fileSystem.readFileSync(lockfilePath, "utf8"));
  lockfile.version = nextVersion;

  const rootEntry = lockfile.packages?.[""];
  if (rootEntry) {
    rootEntry.version = nextVersion;
  }

  const serialized = `${JSON.stringify(lockfile, null, 2)}\n`;
  fileSystem.writeFileSync(lockfilePath, serialized);
}

function readCommitsSinceLastTag() {
  const lastTag = readLastTag();
  const range = lastTag === null ? [] : [`${lastTag}..HEAD`];
  const logArguments = ["log", "-z", "--format=%B", ...range];

  const rawLog = readGitOutput(logArguments);
  const entries = rawLog.split("\0");

  const commitMessages = entries.filter((entry) => entry.trim() !== "");
  return commitMessages;
}

// why: no tag yet is the ordinary state before a first release, and git reports
// it with a non-zero exit that would otherwise read as a broken repository.
function readLastTag() {
  try {
    const describeArguments = ["describe", "--tags", "--abbrev=0"];
    const quietStdio = ["ignore", "pipe", "ignore"];
    const rawTag = execFileSync("git", describeArguments, {
      encoding: "utf8",
      stdio: quietStdio,
    });

    const lastTag = rawTag.trim();
    return lastTag;
  } catch {
    return null;
  }
}

function readGitOutput(gitArguments) {
  try {
    const rawOutput = execFileSync("git", gitArguments, { encoding: "utf8" });
    return rawOutput;
  } catch {
    throw new Error("Could not read the commit history. Is this a git repo?");
  }
}

function isDirectRun() {
  if (!process.argv[1]) {
    return false;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const entryFile = fileSystem.realpathSync(path.resolve(process.argv[1]));

  const isEntry = currentFile === entryFile;
  return isEntry;
}

// why: the file is copied into projects that do not have the engine, so it
// carries its own entry guard instead of importing FsUtils.bootstrapIfDirect.
if (isDirectRun()) {
  try {
    run();
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}
