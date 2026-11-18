import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { GitGuard } from "./git-guard.mjs";

const { findBlockedCommand } = GitGuard;

const HOOK_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "git-guard.mjs",
);

function runHook(stdinText) {
  const outcome = spawnSync(process.execPath, [HOOK_PATH], {
    input: stdinText,
    encoding: "utf8",
  });

  return outcome;
}

function buildPayload(command) {
  const payload = JSON.stringify({
    tool_name: "Bash",
    tool_input: { command },
  });

  return payload;
}

describe("git-guard.findBlockedCommand", () => {
  it("refuses git push in every form the harness may send", () => {
    const inputCommands = [
      "git push",
      "git push --force origin main",
      "git -C ../other push",
      "npm test && git push",
      "GIT_TRACE=1 git push",
    ];

    const expectedRefusals = [true, true, true, true, true];
    const actualRefusals = inputCommands.map(
      (command) => findBlockedCommand(command) !== null,
    );

    assert.deepEqual(actualRefusals, expectedRefusals);
  });

  it("refuses git reset --hard, wherever the flag sits", () => {
    const inputCommands = ["git reset --hard", "git reset HEAD~1 --hard"];

    const expectedRefusals = [true, true];
    const actualRefusals = inputCommands.map(
      (command) => findBlockedCommand(command) !== null,
    );

    assert.deepEqual(actualRefusals, expectedRefusals);
  });

  it("allows the git commands that keep work local and recoverable", () => {
    const inputCommands = [
      "git status",
      "git commit -m 'feat: x'",
      "git reset --soft HEAD~1",
      "git log --oneline -5 | head",
      "npm run push-docs",
    ];

    const expectedRefusals = [false, false, false, false, false];
    const actualRefusals = inputCommands.map(
      (command) => findBlockedCommand(command) !== null,
    );

    assert.deepEqual(actualRefusals, expectedRefusals);
  });

  it("names the reason, so the agent can relay it", () => {
    const actualReason = findBlockedCommand("git push");

    const expectedFragment = /developer pushes after approving/;

    assert.match(actualReason, expectedFragment);
  });
});

describe("git-guard as a hook", () => {
  it("exits 2 with the reason on stderr for a blocked command", () => {
    const outcome = runHook(buildPayload("git push origin main"));

    const expectedStatus = 2;
    const expectedStderr = /git-guard: blocked\./;
    const actualStatus = outcome.status;
    const actualStderr = outcome.stderr;

    assert.equal(actualStatus, expectedStatus);
    assert.match(actualStderr, expectedStderr);
  });

  it("exits 0 for an allowed command", () => {
    const outcome = runHook(buildPayload("git status"));

    const expectedStatus = 0;
    const actualStatus = outcome.status;

    assert.equal(actualStatus, expectedStatus);
  });

  it("exits 0 for a tool other than the shell", () => {
    const payload = JSON.stringify({
      tool_name: "Write",
      tool_input: { file_path: "a.md", content: "git push" },
    });

    const outcome = runHook(payload);

    const expectedStatus = 0;
    const actualStatus = outcome.status;

    assert.equal(actualStatus, expectedStatus);
  });

  it("allows a malformed payload and says so on stderr", () => {
    const outcome = runHook("{not json");

    const expectedStatus = 0;
    const expectedStderr = /unreadable hook payload, allowed/;
    const actualStatus = outcome.status;
    const actualStderr = outcome.stderr;

    assert.equal(actualStatus, expectedStatus);
    assert.match(actualStderr, expectedStderr);
  });
});
