import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import operatingSystem from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { InstructionAssembler } from "../../lib/domain/instruction-assembler.mjs";

const { writeToolingAssets } = InstructionAssembler;

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const checkerPath = path.join(currentDirectory, "check-sync.mjs");

const SOURCE_TOOLING_DIRECTORY = path.join(
  currentDirectory,
  "..",
  "..",
  "..",
  "assets",
  "tooling",
);

function loadCheckerSource() {
  const checkerSource = fileSystem.readFileSync(checkerPath, "utf8");
  return checkerSource;
}

describe("SyncChecker", () => {
  it("pairs live and source trees explicitly rather than by shared name", () => {
    const checkerSource = loadCheckerSource();

    const actualHasFlatCommandsPair =
      checkerSource.includes('live: "commands"') &&
      checkerSource.includes('source: "instructions/commands"');

    const expectedHasFlatCommandsPair = true;

    assert.equal(actualHasFlatCommandsPair, expectedHasFlatCommandsPair);
  });

  it("mirrors every tree that init writes into .ai/", () => {
    const checkerSource = loadCheckerSource();

    const mirroredTreeNames = [
      "instructions/templates",
      "instructions/competencies",
      "commands",
      "skills",
      "tooling",
    ];

    const actualMissing = mirroredTreeNames.filter(
      (treeName) => !checkerSource.includes(`live: "${treeName}"`),
    );

    const expectedMissing = [];

    assert.deepEqual(actualMissing, expectedMissing);
  });

  it("compares files of any extension, not markdown alone", () => {
    const checkerSource = loadCheckerSource();

    const actualHasMarkdownFilter = checkerSource.includes('endsWith(".md")');
    const expectedHasMarkdownFilter = false;

    assert.equal(actualHasMarkdownFilter, expectedHasMarkdownFilter);
  });

  it("resolves the flavor tree through the manifest selection", () => {
    const checkerSource = loadCheckerSource();

    const actualReadsSelection = checkerSource.includes(
      "manifest?.selections?.flavor",
    );

    const expectedReadsSelection = true;

    assert.equal(actualReadsSelection, expectedReadsSelection);
  });

  it("carries no drift exemption now that AGENTS.md left .ai/", () => {
    const checkerSource = loadCheckerSource();

    const actualExemptsAnything = checkerSource.includes("UNMIRRORED");
    const expectedExemptsAnything = false;

    assert.equal(actualExemptsAnything, expectedExemptsAnything);
  });
});

describe("SyncCheckerMirror", () => {
  // Generate the tree instead of reading `.ai/`: that mirror is gitignored
  // output, absent from any fresh clone, and reading it would only prove the
  // developer ran init at some point. Generating proves the writer still works.
  it("reproduces the whole tooling tree when generating into a clean directory", () => {
    const temporaryRoot = fileSystem.mkdtempSync(
      path.join(operatingSystem.tmpdir(), "sdg-mirror-"),
    );

    try {
      writeToolingAssets(temporaryRoot);

      const actualEntries = listRelativeEntries(
        path.join(temporaryRoot, ".ai", "tooling"),
      );

      const expectedEntries = listRelativeEntries(SOURCE_TOOLING_DIRECTORY);

      assert.deepEqual(actualEntries, expectedEntries);
    } finally {
      fileSystem.rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("carries a source tree worth comparing", () => {
    const sourceEntries = listRelativeEntries(SOURCE_TOOLING_DIRECTORY);

    const actualEntryCount = sourceEntries.length;
    const expectedMinimumCount = 1;
    const hasEntriesToCompare = actualEntryCount >= expectedMinimumCount;

    assert.ok(hasEntriesToCompare);
  });
});

function listRelativeEntries(rootDirectory, relativePrefix = "") {
  const entries = fileSystem.readdirSync(rootDirectory, {
    withFileTypes: true,
  });

  const collected = [];

  for (const entry of entries) {
    const relativePath = path.join(relativePrefix, entry.name);
    collected.push(relativePath);

    if (entry.isDirectory()) {
      const nested = listRelativeEntries(
        path.join(rootDirectory, entry.name),
        relativePath,
      );

      collected.push(...nested);
    }
  }

  const sortedEntries = collected.sort();
  return sortedEntries;
}
