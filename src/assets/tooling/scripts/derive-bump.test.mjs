import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "derive-bump.mjs");

function makeTaggedRepository(subjects) {
  const directoryPrefix = path.join(os.tmpdir(), "sdg-derive-test-");
  const repositoryDir = fileSystem.mkdtempSync(directoryPrefix);
  const gitOptions = { cwd: repositoryDir, stdio: "ignore" };

  execFileSync("git", ["init", "--quiet"], gitOptions);
  execFileSync("git", ["config", "user.email", "test@example.com"], gitOptions);
  execFileSync("git", ["config", "user.name", "Test"], gitOptions);

  commitEmpty(repositoryDir, "chore: seed");
  execFileSync("git", ["tag", "v1.0.0"], gitOptions);
  subjects.forEach((subject) => commitEmpty(repositoryDir, subject));

  return repositoryDir;
}

function commitEmpty(repositoryDir, message) {
  const commitArguments = ["commit", "--allow-empty", "--quiet", "-m", message];
  const gitOptions = { cwd: repositoryDir, stdio: "ignore" };

  execFileSync("git", commitArguments, gitOptions);
}

function runScript(repositoryDir) {
  const spawnOptions = { cwd: repositoryDir, encoding: "utf8" };
  const outcome = spawnSync("node", [SCRIPT_PATH], spawnOptions);
  return outcome;
}

function cleanup(repositoryDir) {
  fileSystem.rmSync(repositoryDir, { recursive: true, force: true });
}

describe("derive-bump.mjs", () => {
  it("derives patch from a fix", () => {
    const repositoryDir = makeTaggedRepository(["fix: broken link"]);

    try {
      const expectedType = "patch";
      const actualType = runScript(repositoryDir).stdout.trim();

      assert.equal(actualType, expectedType);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("derives minor from a scoped feature", () => {
    const repositoryDir = makeTaggedRepository(["feat(engine): new command"]);

    try {
      const expectedType = "minor";
      const actualType = runScript(repositoryDir).stdout.trim();

      assert.equal(actualType, expectedType);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("derives major from a scoped breaking marker", () => {
    const repositoryDir = makeTaggedRepository(["feat(engine)!: drop node 22"]);

    try {
      const expectedType = "major";
      const actualType = runScript(repositoryDir).stdout.trim();

      assert.equal(actualType, expectedType);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("takes the strongest bump across the range, not the last one", () => {
    const subjects = ["feat: new flag", "fix: typo", "docs: readme"];
    const repositoryDir = makeTaggedRepository(subjects);

    try {
      const expectedType = "minor";
      const actualType = runScript(repositoryDir).stdout.trim();

      assert.equal(actualType, expectedType);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("reads only commits after the last tag", () => {
    const repositoryDir = makeTaggedRepository(["fix: broken link"]);
    const gitOptions = { cwd: repositoryDir, stdio: "ignore" };

    try {
      commitEmpty(repositoryDir, "feat: after the new tag");
      execFileSync("git", ["tag", "v1.0.1"], gitOptions);
      commitEmpty(repositoryDir, "docs: only this one counts");

      const expectedType = "patch";
      const actualType = runScript(repositoryDir).stdout.trim();

      assert.equal(actualType, expectedType);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("exits non-zero with nothing to release since the last tag", () => {
    const repositoryDir = makeTaggedRepository([]);

    try {
      const expectedExitCode = 1;
      const outcome = runScript(repositoryDir);
      const actualExitCode = outcome.status;

      assert.equal(actualExitCode, expectedExitCode);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("keeps stdout free of diagnostics so it can be used inline", () => {
    const repositoryDir = makeTaggedRepository(["fix: broken link"]);

    try {
      const expectedLineCount = 1;
      const outcome = runScript(repositoryDir);
      const actualLineCount = outcome.stdout.trim().split("\n").length;

      assert.equal(actualLineCount, expectedLineCount);
    } finally {
      cleanup(repositoryDir);
    }
  });
});
