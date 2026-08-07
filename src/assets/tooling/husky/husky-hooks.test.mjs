import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRE_COMMIT_PATH = path.join(__dirname, "pre-commit");
const COMMIT_MSG_PATH = path.join(__dirname, "commit-msg");
const ABSENT_LLM_COMMAND = "sdg-absent-llm-command";
const SHIM_LLM_COMMAND = "sdg-shim-llm";

function makeStagedRepository() {
  const repositoryDir = makeTempDir();

  const sourceLines = ["export function greet() {", '  return "hello";', "}"];
  const sourceBody = sourceLines.join("\n");
  const sourcePath = path.join(repositoryDir, "greet.mjs");
  fileSystem.writeFileSync(sourcePath, sourceBody);

  const gitOptions = { cwd: repositoryDir, stdio: "ignore" };
  execFileSync("git", ["init", "--quiet"], gitOptions);
  execFileSync("git", ["add", "greet.mjs"], gitOptions);
  return repositoryDir;
}

function makeTempDir() {
  const directoryPrefix = path.join(os.tmpdir(), "sdg-husky-test-");
  const tempDir = fileSystem.mkdtempSync(directoryPrefix);
  return tempDir;
}

// why: a shim keeps the hook off the network and off the developer's toolchain.
// The contract under test is errexit resilience, not prompt construction, which
// gate-bundle.test.mjs already covers.
function makeCommandShim(targetDir, commandName, bodyLines) {
  const binDir = path.join(targetDir, "shim-bin");
  fileSystem.mkdirSync(binDir, { recursive: true });

  const shimLines = ["#!/usr/bin/env sh", ...bodyLines, ""];
  const shimBody = shimLines.join("\n");
  const shimPath = path.join(binDir, commandName);
  fileSystem.writeFileSync(shimPath, shimBody, { mode: 0o755 });
  return binDir;
}

function makeShimmedPath(binDir) {
  const shimmedPath = `${binDir}${path.delimiter}${process.env.PATH}`;
  return shimmedPath;
}

// why: `sh -e` is how husky invokes hooks (.husky/_/h). Running them without it
// passes on a shell that carries no errexit, which is how the defect survived.
function runHook(hookPath, options) {
  const { cwd, environment = {}, args = [] } = options;

  const hookEnvironment = { ...process.env, SDG_GATE_LLM: "", ...environment };
  const spawnOptions = { cwd, encoding: "utf8", env: hookEnvironment };
  const outcome = spawnSync("sh", ["-e", hookPath, ...args], spawnOptions);
  return outcome;
}

function writeCommitMessage(targetDir, firstLine) {
  const messageBody = `${firstLine}\n`;
  const messagePath = path.join(targetDir, "COMMIT_EDITMSG");
  fileSystem.writeFileSync(messagePath, messageBody);
  return messagePath;
}

function cleanup(targetDir) {
  fileSystem.rmSync(targetDir, { recursive: true, force: true });
}

describe("husky pre-commit", () => {
  it("exits 0 and review nothing when SDG_GATE_LLM is empty", () => {
    const repositoryDir = makeStagedRepository();

    try {
      const hookOptions = { cwd: repositoryDir };

      const expectedExitCode = 0;
      const expectedStderr = "";
      const outcome = runHook(PRE_COMMIT_PATH, hookOptions);
      const actualExitCode = outcome.status;
      const actualStderr = outcome.stderr;

      assert.equal(actualExitCode, expectedExitCode);
      assert.equal(actualStderr, expectedStderr);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("warns and exit 0 when the prompt stage fails", () => {
    const repositoryDir = makeStagedRepository();

    try {
      const failingNpxLines = ["exit 1"];
      const binDir = makeCommandShim(repositoryDir, "npx", failingNpxLines);
      const shimmedPath = makeShimmedPath(binDir);
      const environment = {
        PATH: shimmedPath,
        SDG_GATE_LLM: ABSENT_LLM_COMMAND,
      };

      const hookOptions = { cwd: repositoryDir, environment };

      const expectedExitCode = 0;
      const expectedWarning = "could not build the review prompt";
      const outcome = runHook(PRE_COMMIT_PATH, hookOptions);
      const actualExitCode = outcome.status;
      const actualHasWarning = outcome.stderr.includes(expectedWarning);

      assert.equal(actualExitCode, expectedExitCode);
      assert.ok(actualHasWarning);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("warns and exit 0 when the review command is absent", () => {
    const repositoryDir = makeStagedRepository();

    try {
      const promptNpxLines = ["printf '%s' 'review the staged diff'"];
      const binDir = makeCommandShim(repositoryDir, "npx", promptNpxLines);
      const shimmedPath = makeShimmedPath(binDir);
      const environment = {
        PATH: shimmedPath,
        SDG_GATE_LLM: ABSENT_LLM_COMMAND,
      };

      const hookOptions = { cwd: repositoryDir, environment };

      const expectedExitCode = 0;
      const expectedWarning = "LLM unavailable";
      const outcome = runHook(PRE_COMMIT_PATH, hookOptions);
      const actualExitCode = outcome.status;
      const actualHasWarning = outcome.stderr.includes(expectedWarning);

      assert.equal(actualExitCode, expectedExitCode);
      assert.ok(actualHasWarning);
    } finally {
      cleanup(repositoryDir);
    }
  });

  it("exits 1 when the verdict stage blocks the commit", () => {
    const repositoryDir = makeStagedRepository();

    try {
      const blockingNpxLines = [
        'case "$*" in',
        "  *--check*) exit 1 ;;",
        "esac",
        "printf '%s' 'review the staged diff'",
      ];

      const reviewLines = ["printf '%s' '{\"verdict\":\"BLOCK\"}'"];
      const binDir = makeCommandShim(repositoryDir, "npx", blockingNpxLines);
      makeCommandShim(repositoryDir, SHIM_LLM_COMMAND, reviewLines);
      const shimmedPath = makeShimmedPath(binDir);
      const environment = {
        PATH: shimmedPath,
        SDG_GATE_LLM: SHIM_LLM_COMMAND,
      };

      const hookOptions = { cwd: repositoryDir, environment };

      const expectedExitCode = 1;
      const outcome = runHook(PRE_COMMIT_PATH, hookOptions);
      const actualExitCode = outcome.status;

      assert.equal(actualExitCode, expectedExitCode);
    } finally {
      cleanup(repositoryDir);
    }
  });
});

describe("husky commit-msg", () => {
  it("exits 0 on a conventional prefix", () => {
    const targetDir = makeTempDir();

    try {
      const messagePath = writeCommitMessage(targetDir, "fix: husky errexit");
      const hookOptions = { cwd: targetDir, args: [messagePath] };

      const expectedExitCode = 0;
      const outcome = runHook(COMMIT_MSG_PATH, hookOptions);
      const actualExitCode = outcome.status;

      assert.equal(actualExitCode, expectedExitCode);
    } finally {
      cleanup(targetDir);
    }
  });

  it("exits 1 on a message with no conventional prefix", () => {
    const targetDir = makeTempDir();

    try {
      const messagePath = writeCommitMessage(targetDir, "husky errexit");
      const hookOptions = { cwd: targetDir, args: [messagePath] };

      const expectedExitCode = 1;
      const outcome = runHook(COMMIT_MSG_PATH, hookOptions);
      const actualExitCode = outcome.status;

      assert.equal(actualExitCode, expectedExitCode);
    } finally {
      cleanup(targetDir);
    }
  });

  it("names the unreadable message file instead of aborting in silence", () => {
    const targetDir = makeTempDir();

    try {
      const absentPath = path.join(targetDir, "COMMIT_EDITMSG");
      const hookOptions = { cwd: targetDir, args: [absentPath] };

      const expectedExitCode = 1;
      const expectedReport = "Commit message file not readable";
      const outcome = runHook(COMMIT_MSG_PATH, hookOptions);
      const actualExitCode = outcome.status;
      const actualHasReport = outcome.stdout.includes(expectedReport);

      assert.equal(actualExitCode, expectedExitCode);
      assert.ok(actualHasReport);
    } finally {
      cleanup(targetDir);
    }
  });

  it("does not source the husky shim that v10 stopped shipping", () => {
    const hookSource = fileSystem.readFileSync(COMMIT_MSG_PATH, "utf8");
    const sourceLines = hookSource.split("\n");

    const expectedSourcingLines = [];
    const actualSourcingLines = sourceLines.filter((line) => {
      const isSourcingShim = line.startsWith(".") && line.includes("husky.sh");
      return isSourcingShim;
    });

    assert.deepEqual(actualSourcingLines, expectedSourcingLines);
  });
});
