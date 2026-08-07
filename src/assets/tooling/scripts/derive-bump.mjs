#!/usr/bin/env node

/**
 * Reads the commits since the last tag and prints the bump they imply:
 * `patch`, `minor` or `major`, one word on stdout and nothing else.
 *
 * why: this is a query and `bump-version.mjs` is a command, so they are two
 * files. Folding the history read into the writer would also cost that script
 * its tested guarantee of never shelling out to git.
 */

import { execFileSync } from "node:child_process";

const BUMP_PRECEDENCE = ["patch", "minor", "major"];

function run() {
  const commitMessages = readCommitsSinceLastTag();
  const bumpType = selectBumpType(commitMessages);

  console.log(bumpType);
}

function selectBumpType(commitMessages) {
  const hasCommits = commitMessages.length > 0;

  if (!hasCommits) {
    exitWithReason("No commits since the last tag. Nothing to release.");
  }

  const detectedTypes = commitMessages.map(detectBumpType);
  const strongestType = selectStrongestBump(detectedTypes);

  if (strongestType === null) {
    exitWithReason("Every commit since the last tag is itself a bump.");
  }

  return strongestType;
}

/**
 * why: the same table release-please applies in CI. A project that starts on a
 * local bump and later wires the action keeps producing the same numbers, so
 * moving between the two modes never renumbers a release.
 */
function detectBumpType(commitMessage) {
  const [firstLine] = commitMessage.split("\n");
  const footer = commitMessage.split("\n").slice(1).join("\n");

  const BUMP_RULES = [
    { test: () => /^chore:\s*bump version/i.test(firstLine), value: "skip" },
    { test: () => /^[a-z]+(\([^)]+\))?!:/.test(firstLine), value: "major" },
    { test: () => /BREAKING CHANGE:/m.test(footer), value: "major" },
    { test: () => /^feat(\([^)]+\))?:/.test(firstLine), value: "minor" },
  ];

  const matchedRule = BUMP_RULES.find((rule) => rule.test());
  const bumpType = matchedRule?.value ?? "patch";
  return bumpType;
}

function selectStrongestBump(bumpTypes) {
  const releasableTypes = bumpTypes.filter((type) => type !== "skip");
  const hasReleasableType = releasableTypes.length > 0;

  if (!hasReleasableType) {
    return null;
  }

  const strongestRank = releasableTypes.reduce(
    (highest, type) => Math.max(highest, BUMP_PRECEDENCE.indexOf(type)),
    0,
  );

  const strongestType = BUMP_PRECEDENCE[strongestRank];
  return strongestType;
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
    exitWithReason("Could not read the commit history. Is this a git repo?");
  }
}

// why: stdout carries the bump type and nothing else, so a caller can use this
// script inline. Every diagnostic goes to stderr for that reason.
function exitWithReason(reason) {
  console.error(`❌ ${reason}`);
  process.exit(1);
}

run();
