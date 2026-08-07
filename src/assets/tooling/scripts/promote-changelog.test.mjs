import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "promote-changelog.mjs");

function makeProject(version, changelogLines) {
  const directoryPrefix = path.join(os.tmpdir(), "sdg-promote-test-");
  const projectDir = fileSystem.mkdtempSync(directoryPrefix);

  const packageData = { name: "test-project", version };
  const packagePath = path.join(projectDir, "package.json");
  fileSystem.writeFileSync(
    packagePath,
    `${JSON.stringify(packageData, null, 2)}\n`,
  );

  const changelogPath = path.join(projectDir, "CHANGELOG.md");
  fileSystem.writeFileSync(changelogPath, changelogLines.join("\n"));

  return { projectDir, changelogPath };
}

function makePopulatedChangelog() {
  const changelogLines = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    "### Added",
    "",
    "- A thing that shipped.",
    "",
    "### Fixed",
    "",
    "## [1.0.0] - 2026-01-01",
    "",
    "### Added",
    "",
    "- The first thing.",
    "",
  ];

  return changelogLines;
}

function makeEmptyChangelog() {
  const changelogLines = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    "### Added",
    "",
    "### Fixed",
    "",
    "## [1.0.0] - 2026-01-01",
    "",
    "- The first thing.",
    "",
  ];

  return changelogLines;
}

function runScript(projectDir) {
  const spawnOptions = { cwd: projectDir, encoding: "utf8" };
  const outcome = spawnSync("node", [SCRIPT_PATH], spawnOptions);
  return outcome;
}

function readChangelog(changelogPath) {
  const content = fileSystem.readFileSync(changelogPath, "utf8");
  return content;
}

function cleanup(projectDir) {
  fileSystem.rmSync(projectDir, { recursive: true, force: true });
}

describe("promote-changelog.mjs", () => {
  it("renames Unreleased to the package version, dated today", () => {
    const changelogLines = makePopulatedChangelog();
    const { projectDir, changelogPath } = makeProject("1.1.0", changelogLines);

    try {
      const today = new Date().toISOString().split("T").at(0);
      const expectedHeading = `## [1.1.0] - ${today}`;
      runScript(projectDir);
      const actualContent = readChangelog(changelogPath);
      const actualHasHeading = actualContent.includes(expectedHeading);

      assert.ok(actualHasHeading);
    } finally {
      cleanup(projectDir);
    }
  });

  it("seeds a fresh empty Unreleased block above the promoted one", () => {
    const changelogLines = makePopulatedChangelog();
    const { projectDir, changelogPath } = makeProject("1.1.0", changelogLines);

    try {
      runScript(projectDir);
      const actualContent = readChangelog(changelogPath);

      const expectedOrder = true;
      const unreleasedIndex = actualContent.indexOf("## [Unreleased]");
      const promotedIndex = actualContent.indexOf("## [1.1.0]");
      const actualOrder = unreleasedIndex < promotedIndex;

      assert.equal(actualOrder, expectedOrder);
    } finally {
      cleanup(projectDir);
    }
  });

  it("keeps the narrative under the promoted heading", () => {
    const changelogLines = makePopulatedChangelog();
    const { projectDir, changelogPath } = makeProject("1.1.0", changelogLines);

    try {
      runScript(projectDir);
      const actualContent = readChangelog(changelogPath);

      const expectedAfterHeading = true;
      const promotedIndex = actualContent.indexOf("## [1.1.0]");
      const narrativeIndex = actualContent.indexOf("A thing that shipped.");
      const actualAfterHeading = narrativeIndex > promotedIndex;

      assert.equal(actualAfterHeading, expectedAfterHeading);
    } finally {
      cleanup(projectDir);
    }
  });

  it("refuses to promote an Unreleased block with no narrative", () => {
    const changelogLines = makeEmptyChangelog();
    const { projectDir, changelogPath } = makeProject("1.1.0", changelogLines);

    try {
      const expectedExitCode = 1;
      const outcome = runScript(projectDir);
      const actualExitCode = outcome.status;
      const actualContent = readChangelog(changelogPath);
      const actualUntouched = actualContent.includes("## [Unreleased]");

      assert.equal(actualExitCode, expectedExitCode);
      assert.ok(actualUntouched);
    } finally {
      cleanup(projectDir);
    }
  });

  it("refuses a second run for the same version", () => {
    const changelogLines = makePopulatedChangelog();
    const { projectDir } = makeProject("1.1.0", changelogLines);

    try {
      runScript(projectDir);

      const expectedExitCode = 1;
      const secondOutcome = runScript(projectDir);
      const actualExitCode = secondOutcome.status;

      assert.equal(actualExitCode, expectedExitCode);
    } finally {
      cleanup(projectDir);
    }
  });

  it("reports the reason instead of failing in silence", () => {
    const changelogLines = makeEmptyChangelog();
    const { projectDir } = makeProject("1.1.0", changelogLines);

    try {
      const expectedFragment = "[Unreleased] is empty";
      const outcome = runScript(projectDir);
      const actualHasReason = outcome.stderr.includes(expectedFragment);

      assert.ok(actualHasReason);
    } finally {
      cleanup(projectDir);
    }
  });

  it("does not import child_process (zero git side-effects guarantee)", () => {
    const scriptSource = fileSystem.readFileSync(SCRIPT_PATH, "utf8");

    const actualHasNoChildProcess = !scriptSource.includes("child_process");
    const actualHasNoExecSync = !scriptSource.includes("execSync");

    assert.ok(actualHasNoChildProcess);
    assert.ok(actualHasNoExecSync);
  });
});
