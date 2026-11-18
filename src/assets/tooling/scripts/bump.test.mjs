import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  deriveLevel,
  detectBumpType,
  incrementVersion,
  promoteUnreleased,
  resolveLevel,
} from "./bump.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "bump.mjs");
const RELEASE_DATE = "2026-07-22";

function buildChangelog(unreleasedBody) {
  const lines = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    ...unreleasedBody,
    "## [6.0.1] - 2026-07-21",
    "",
    "### Fixed",
    "",
    "- an older entry",
    "",
  ];

  const content = lines.join("\n");
  return content;
}

function buildFixOnlyChangelog() {
  const content = buildChangelog([
    "### Added",
    "",
    "### Fixed",
    "",
    "- the gate now fails loud",
    "",
  ]);

  return content;
}

function makeProject(version, changelogContent) {
  const directoryPrefix = path.join(os.tmpdir(), "sdg-bump-test-");
  const projectDir = fileSystem.mkdtempSync(directoryPrefix);

  const packageData = { name: "test-project", version, private: true };
  const packagePath = path.join(projectDir, "package.json");
  fileSystem.writeFileSync(
    packagePath,
    `${JSON.stringify(packageData, null, 2)}\n`,
  );

  const changelogPath = path.join(projectDir, "CHANGELOG.md");
  if (changelogContent !== null) {
    fileSystem.writeFileSync(changelogPath, changelogContent);
  }

  return { projectDir, packagePath, changelogPath };
}

function writeLockfile(projectDir, version) {
  const lockfile = {
    name: "test-project",
    version,
    lockfileVersion: 3,
    packages: { "": { name: "test-project", version } },
  };

  const lockfilePath = path.join(projectDir, "package-lock.json");
  fileSystem.writeFileSync(
    lockfilePath,
    `${JSON.stringify(lockfile, null, 2)}\n`,
  );

  return lockfilePath;
}

function makeTaggedRepository(projectDir, subjects) {
  const gitOptions = { cwd: projectDir, stdio: "ignore" };

  execFileSync("git", ["init", "--quiet"], gitOptions);
  execFileSync("git", ["config", "user.email", "test@example.com"], gitOptions);
  execFileSync("git", ["config", "user.name", "Test"], gitOptions);

  commitEmpty(projectDir, "chore: seed");
  execFileSync("git", ["tag", "v1.0.0"], gitOptions);
  subjects.forEach((subject) => commitEmpty(projectDir, subject));
}

function commitEmpty(projectDir, message) {
  const commitArguments = ["commit", "--allow-empty", "--quiet", "-m", message];
  const gitOptions = { cwd: projectDir, stdio: "ignore" };

  execFileSync("git", commitArguments, gitOptions);
}

function runScript(projectDir, args) {
  const spawnOptions = { cwd: projectDir, encoding: "utf8" };
  const outcome = spawnSync("node", [SCRIPT_PATH, ...args], spawnOptions);
  return outcome;
}

function readJson(filePath) {
  const parsed = JSON.parse(fileSystem.readFileSync(filePath, "utf8"));
  return parsed;
}

function cleanup(projectDir) {
  fileSystem.rmSync(projectDir, { recursive: true, force: true });
}

describe("bump.mjs", () => {
  describe("resolveLevel()", () => {
    it("maps the cycle types to a semver level", () => {
      const noCommits = () => [];

      const expectedLevels = ["minor", "patch", "patch", "patch", "major"];
      const actualLevels = ["feat", "fix", "land", "audit", "major"].map(
        (type) => resolveLevel(type, noCommits),
      );

      assert.deepEqual(actualLevels, expectedLevels);
    });

    it("accepts a semver level as it is", () => {
      const noCommits = () => [];

      const expectedLevel = "minor";
      const actualLevel = resolveLevel("minor", noCommits);

      assert.equal(actualLevel, expectedLevel);
    });

    it("derives the level from the commits on auto", () => {
      const readCommits = () => ["fix: typo", "feat: new flag"];

      const expectedLevel = "minor";
      const actualLevel = resolveLevel("auto", readCommits);

      assert.equal(actualLevel, expectedLevel);
    });

    it("refuses an unknown type with the usage line", () => {
      const noCommits = () => [];
      const resolveUnknown = () => resolveLevel("release", noCommits);

      const expectedError = /Usage: bump\.mjs/;

      assert.throws(resolveUnknown, expectedError);
    });
  });

  describe("detectBumpType()", () => {
    it("returns patch for fix and docs commits", () => {
      const inputMessages = ["fix: corrige typo", "docs: corrige o readme"];

      const expectedTypes = ["patch", "patch"];
      const actualTypes = inputMessages.map(detectBumpType);

      assert.deepEqual(actualTypes, expectedTypes);
    });

    it("returns minor for plain and scoped features", () => {
      const inputMessages = ["feat: novo comando", "feat(engine): derivacao"];

      const expectedTypes = ["minor", "minor"];
      const actualTypes = inputMessages.map(detectBumpType);

      assert.deepEqual(actualTypes, expectedTypes);
    });

    it("returns major for the breaking marker, scoped or not", () => {
      const inputMessages = [
        "feat!: remove suporte a Node 18",
        "fix(api)!: altera contrato do envelope",
      ];

      const expectedTypes = ["major", "major"];
      const actualTypes = inputMessages.map(detectBumpType);

      assert.deepEqual(actualTypes, expectedTypes);
    });

    it("returns major for BREAKING CHANGE in the footer", () => {
      const inputMessage =
        "refactor: reestrutura pipeline\n\nBREAKING CHANGE: remove flag --legacy";

      const expectedType = "major";
      const actualType = detectBumpType(inputMessage);

      assert.equal(actualType, expectedType);
    });

    it("returns skip for chore and test commits, scoped or not", () => {
      const inputMessages = [
        "chore: bump version to 1.2.3",
        "chore(deps): atualiza deps",
        "test: cobre o parser",
      ];

      const expectedTypes = ["skip", "skip", "skip"];
      const actualTypes = inputMessages.map(detectBumpType);

      assert.deepEqual(actualTypes, expectedTypes);
    });

    it("returns major for a chore that breaks a contract", () => {
      const inputMessage =
        "chore: remove o script legado\n\nBREAKING CHANGE: sem bump-version.mjs";

      const expectedType = "major";
      const actualType = detectBumpType(inputMessage);

      assert.equal(actualType, expectedType);
    });
  });

  describe("deriveLevel()", () => {
    it("takes the strongest level across the range, not the last one", () => {
      const inputMessages = ["feat: new flag", "fix: typo", "docs: readme"];

      const expectedLevel = "minor";
      const actualLevel = deriveLevel(inputMessages);

      assert.equal(actualLevel, expectedLevel);
    });

    it("refuses an empty range", () => {
      const deriveEmpty = () => deriveLevel([]);

      const expectedError = /Nothing to release/;

      assert.throws(deriveEmpty, expectedError);
    });

    it("refuses a range where no commit releases", () => {
      const deriveSkipped = () =>
        deriveLevel(["chore: bump version to 2.0.0", "test: cobre o parser"]);

      const expectedError = /chore and test never do/;

      assert.throws(deriveSkipped, expectedError);
    });
  });

  describe("incrementVersion()", () => {
    it("increments each level and resets the ones below it", () => {
      const inputVersion = "0.12.1";

      const expectedVersions = ["0.12.2", "0.13.0", "1.0.0"];
      const actualVersions = ["patch", "minor", "major"].map((level) =>
        incrementVersion(inputVersion, level),
      );

      assert.deepEqual(actualVersions, expectedVersions);
    });

    it("refuses a version that is not a semver triplet", () => {
      const incrementInvalid = () => incrementVersion("1.2", "patch");

      const expectedError = /Invalid semver/;

      assert.throws(incrementInvalid, expectedError);
    });
  });

  describe("promoteUnreleased()", () => {
    it("drops a scaffolding section the cycle left empty", () => {
      const input = buildFixOnlyChangelog();

      const expectedReleased = "## [6.0.2] - 2026-07-22\n\n### Fixed\n";
      const actual = promoteUnreleased(input, "6.0.2", RELEASE_DATE);
      const actualIncludesReleased = actual.includes(expectedReleased);

      assert.ok(actualIncludesReleased);
    });

    it("keeps both sections when both carry entries", () => {
      const input = buildChangelog([
        "### Added",
        "",
        "- a new flag",
        "",
        "### Fixed",
        "",
        "- the gate now fails loud",
        "",
      ]);

      const releasedHeading = "## [6.0.2]";
      const actual = promoteUnreleased(input, "6.0.2", RELEASE_DATE);
      const releasedBlock = actual.slice(actual.indexOf(releasedHeading));
      const actualKeepsAdded = releasedBlock.includes("### Added");
      const actualKeepsFixed = releasedBlock.includes("### Fixed");

      assert.ok(actualKeepsAdded);
      assert.ok(actualKeepsFixed);
    });

    it("leaves no double blank line where a section was dropped", () => {
      const input = buildFixOnlyChangelog();

      const expected = false;
      const actual = promoteUnreleased(input, "6.0.2", RELEASE_DATE);
      const actualHasBlankRun = actual.includes("\n\n\n");

      assert.equal(actualHasBlankRun, expected);
    });

    it("opens a fresh Unreleased block above the release", () => {
      const input = buildFixOnlyChangelog();

      const expectedScaffold =
        "## [Unreleased]\n\n### Added\n\n### Fixed\n\n## [6.0.2]";

      const actual = promoteUnreleased(input, "6.0.2", RELEASE_DATE);
      const actualIncludesScaffold = actual.includes(expectedScaffold);

      assert.ok(actualIncludesScaffold);
    });

    it("preserves earlier releases untouched", () => {
      const input = buildFixOnlyChangelog();

      const expectedOlder =
        "## [6.0.1] - 2026-07-21\n\n### Fixed\n\n- an older entry";

      const actual = promoteUnreleased(input, "6.0.2", RELEASE_DATE);
      const actualIncludesOlder = actual.includes(expectedOlder);

      assert.ok(actualIncludesOlder);
    });

    it("refuses an Unreleased block with no narrative", () => {
      const input = buildChangelog(["### Added", "", "### Fixed", ""]);
      const promoteEmpty = () =>
        promoteUnreleased(input, "6.0.2", RELEASE_DATE);

      const expectedError = /\[Unreleased\] is empty/;

      assert.throws(promoteEmpty, expectedError);
    });

    it("refuses a version the changelog already carries", () => {
      const input = buildFixOnlyChangelog();
      const promoteTwice = () =>
        promoteUnreleased(input, "6.0.1", RELEASE_DATE);

      const expectedError = /already carries a \[6\.0\.1\] section/;

      assert.throws(promoteTwice, expectedError);
    });

    it("refuses a changelog without an Unreleased heading", () => {
      const input = "# Changelog\n\n## [6.0.1] - 2026-07-21\n\n- old\n";
      const promoteHeadless = () =>
        promoteUnreleased(input, "6.0.2", RELEASE_DATE);

      const expectedError = /No `## \[Unreleased\]` heading/;

      assert.throws(promoteHeadless, expectedError);
    });
  });

  describe("command line", () => {
    it("writes the version to package.json, the lockfile and the changelog", () => {
      const changelogContent = buildFixOnlyChangelog();
      const { projectDir, packagePath, changelogPath } = makeProject(
        "6.0.1",
        changelogContent,
      );

      const lockfilePath = writeLockfile(projectDir, "6.0.1");

      try {
        const expectedVersion = "6.0.2";
        const outcome = runScript(projectDir, ["fix"]);
        const actualExitCode = outcome.status;
        const actualPackageVersion = readJson(packagePath).version;
        const lockfile = readJson(lockfilePath);
        const actualLockVersion = lockfile.version;
        const actualLockRootVersion = lockfile.packages[""].version;
        const actualChangelog = fileSystem.readFileSync(changelogPath, "utf8");
        const actualHasHeading = actualChangelog.includes("## [6.0.2] - ");
        const expectedExitCode = 0;

        assert.equal(actualExitCode, expectedExitCode);
        assert.equal(actualPackageVersion, expectedVersion);
        assert.equal(actualLockVersion, expectedVersion);
        assert.equal(actualLockRootVersion, expectedVersion);
        assert.ok(actualHasHeading);
      } finally {
        cleanup(projectDir);
      }
    });

    it("preserves package.json fields other than version", () => {
      const changelogContent = buildFixOnlyChangelog();
      const { projectDir, packagePath } = makeProject(
        "6.0.1",
        changelogContent,
      );

      try {
        runScript(projectDir, ["patch"]);

        const expectedName = "test-project";
        const expectedPrivate = true;
        const actualPackage = readJson(packagePath);
        const actualName = actualPackage.name;
        const actualPrivate = actualPackage.private;

        assert.equal(actualName, expectedName);
        assert.equal(actualPrivate, expectedPrivate);
      } finally {
        cleanup(projectDir);
      }
    });

    it("leaves every file as it was when the changelog is refused", () => {
      const changelogContent = buildChangelog([
        "### Added",
        "",
        "### Fixed",
        "",
      ]);

      const { projectDir, packagePath, changelogPath } = makeProject(
        "6.0.1",
        changelogContent,
      );

      try {
        const expectedExitCode = 1;
        const expectedVersion = "6.0.1";
        const outcome = runScript(projectDir, ["fix"]);
        const actualExitCode = outcome.status;
        const actualVersion = readJson(packagePath).version;
        const actualChangelog = fileSystem.readFileSync(changelogPath, "utf8");
        const actualReason = outcome.stderr.includes("[Unreleased] is empty");

        assert.equal(actualExitCode, expectedExitCode);
        assert.equal(actualVersion, expectedVersion);
        assert.equal(actualChangelog, changelogContent);
        assert.ok(actualReason);
      } finally {
        cleanup(projectDir);
      }
    });

    it("bumps the version alone when there is no changelog", () => {
      const { projectDir, packagePath } = makeProject("1.0.0", null);

      try {
        const expectedVersion = "1.1.0";
        runScript(projectDir, ["feat"]);
        const actualVersion = readJson(packagePath).version;

        assert.equal(actualVersion, expectedVersion);
      } finally {
        cleanup(projectDir);
      }
    });

    it("exits 1 when the type is missing", () => {
      const { projectDir } = makeProject("1.0.0", null);

      try {
        const expectedExitCode = 1;
        const outcome = runScript(projectDir, []);
        const actualExitCode = outcome.status;

        assert.equal(actualExitCode, expectedExitCode);
      } finally {
        cleanup(projectDir);
      }
    });

    it("exits 1 when package.json is absent", () => {
      const directoryPrefix = path.join(os.tmpdir(), "sdg-bump-test-");
      const projectDir = fileSystem.mkdtempSync(directoryPrefix);

      try {
        const expectedExitCode = 1;
        const outcome = runScript(projectDir, ["patch"]);
        const actualExitCode = outcome.status;

        assert.equal(actualExitCode, expectedExitCode);
      } finally {
        cleanup(projectDir);
      }
    });

    it("reads only the commits after the last tag on auto", () => {
      const { projectDir, packagePath } = makeProject("1.0.1", null);
      const gitOptions = { cwd: projectDir, stdio: "ignore" };

      try {
        makeTaggedRepository(projectDir, ["fix: broken link"]);
        commitEmpty(projectDir, "feat: before the new tag");
        execFileSync("git", ["tag", "v1.0.1"], gitOptions);
        commitEmpty(projectDir, "docs: only this one counts");

        const expectedVersion = "1.0.2";
        runScript(projectDir, ["auto"]);
        const actualVersion = readJson(packagePath).version;

        assert.equal(actualVersion, expectedVersion);
      } finally {
        cleanup(projectDir);
      }
    });

    it("never runs a git command that writes", () => {
      const scriptSource = fileSystem.readFileSync(SCRIPT_PATH, "utf8");
      const writingCommands = ["commit", "tag", "add", "push", "reset"];

      const expectedWrites = [];
      const actualWrites = writingCommands.filter((command) =>
        scriptSource.includes(`"${command}"`),
      );

      assert.deepEqual(actualWrites, expectedWrites);
    });
  });
});
