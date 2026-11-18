import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { detectBumpType, resolveLevel } from "./bump.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOOLING_PATH = path.join(__dirname, "..");
const VERSIONING_PATH = path.join(
  TOOLING_PATH,
  "..",
  "skills",
  "versioning.md",
);
const COMMIT_MSG_PATH = path.join(TOOLING_PATH, "husky", "commit-msg");
const RELEASE_CONFIG_PATH = path.join(
  TOOLING_PATH,
  "github-actions",
  "release-please-config.json",
);

const LEVEL_BY_CELL = { MAJOR: "major", MINOR: "minor", PATCH: "patch" };
const NO_RELEASE = "skip";

/**
 * why: `versioning.md` owns the table, and the bump script and the
 * release-please config each restate it in code. The three drifted once,
 * with `audit` releasing minor in the script and nothing in the table, so
 * this file reads the table and holds the other two to it.
 */
describe("the versioning table", () => {
  it("gives every commit type the hook accepts exactly one row", () => {
    const tableTypes = Object.keys(readTableLevels()).sort();

    const expectedTypes = readAcceptedTypes().sort();
    const actualTypes = tableTypes;

    assert.deepEqual(actualTypes, expectedTypes);
  });

  it("is what bump.mjs auto derives for each commit type", () => {
    const tableLevels = readTableLevels();
    const commitTypes = Object.keys(tableLevels);

    const expectedLevels = commitTypes.map((type) => tableLevels[type]);
    const actualLevels = commitTypes.map((type) =>
      detectBumpType(`${type}: a change`),
    );

    assert.deepEqual(actualLevels, expectedLevels);
  });

  it("is what bump.mjs applies to each cycle type it accepts", () => {
    const tableLevels = readTableLevels();
    const cycleTypes = Object.keys(tableLevels).filter(isAcceptedByBump);
    const noCommits = () => [];

    const expectedLevels = cycleTypes.map((type) => tableLevels[type]);
    const actualLevels = cycleTypes.map((type) =>
      resolveLevel(type, noCommits),
    );

    assert.deepEqual(actualLevels, expectedLevels);
  });

  it("releases no type that release-please hides from the changelog", () => {
    const tableLevels = readTableLevels();
    const sections =
      readJson(RELEASE_CONFIG_PATH).packages["."]["changelog-sections"];

    const expectedHidden = Object.keys(tableLevels)
      .filter((type) => tableLevels[type] === NO_RELEASE)
      .sort();

    const actualHidden = sections
      .filter((section) => section.hidden)
      .map((section) => section.type)
      .sort();

    assert.deepEqual(actualHidden, expectedHidden);
  });
});

function readTableLevels() {
  const content = fileSystem.readFileSync(VERSIONING_PATH, "utf8");
  const tableRows = content
    .split("\n")
    .filter((line) => /^\|.*\|\s*(MAJOR|MINOR|PATCH|none)\s*\|$/.test(line));

  const levelEntries = tableRows.flatMap(readRowEntries);
  const tableLevels = Object.fromEntries(levelEntries);
  return tableLevels;
}

function readRowEntries(tableRow) {
  const [signalCell, levelCell] = tableRow.split("|").slice(1, 3);
  const level = LEVEL_BY_CELL[levelCell.trim()] ?? NO_RELEASE;
  const commitTypes = [...signalCell.matchAll(/`([a-z]+):`/g)].map(
    (match) => match[1],
  );

  const rowEntries = commitTypes.map((type) => [type, level]);
  return rowEntries;
}

// why: the hook is the only place the accepted type list exists.
function readAcceptedTypes() {
  const hookContent = fileSystem.readFileSync(COMMIT_MSG_PATH, "utf8");
  const patternMatch = hookContent.match(/\^\(([a-z|]+)\)/);

  const acceptedTypes = patternMatch[1].split("|");
  return acceptedTypes;
}

// why: bump.mjs takes the SDG cycle types by name, not every commit type;
// the ones it refuses are covered by the auto test above.
function isAcceptedByBump(commitType) {
  const noCommits = () => [];

  try {
    resolveLevel(commitType, noCommits);
  } catch {
    return false;
  }

  return true;
}

function readJson(targetPath) {
  const rawContent = fileSystem.readFileSync(targetPath, "utf8");
  const parsedContent = JSON.parse(rawContent);
  return parsedContent;
}
