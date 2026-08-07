import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(currentDir, "../index.mjs");

function runCheck(stdinPayload, extraArgs = []) {
  const outcome = spawnSync(
    "node",
    [CLI_PATH, "gate", "--check", ...extraArgs],
    {
      input: stdinPayload,
      encoding: "utf8",
    },
  );

  return outcome;
}

function buildBlockReport() {
  const violation = [
    '{"file": "src/order.mjs",',
    '"line": 12,',
    '"rule": "explaining-returns",',
    '"tier": "BLOCK",',
    '"snippet": "return find(id);",',
    '"fix": "const order = find(id); return order;"}',
  ].join(" ");

  const report = `{"canCommit": false, "violations": [${violation}]}`;
  return report;
}

describe("gate --check", () => {
  it("exits 0 and stay quiet on a clean report", () => {
    const input = '{"canCommit": true, "violations": []}';

    const expectedStatus = 0;
    const expectedStderr = "";

    const actual = runCheck(input);
    const actualStatus = actual.status;
    const actualStderr = actual.stderr;

    assert.equal(actualStatus, expectedStatus);
    assert.equal(actualStderr, expectedStderr);
  });

  it("exits 1 on a BLOCK violation", () => {
    const input = buildBlockReport();

    const expectedStatus = 1;

    const actual = runCheck(input);
    const actualStatus = actual.status;

    assert.equal(actualStatus, expectedStatus);
  });

  it("exits 0 but warn loudly when the verdict cannot be read", () => {
    const input = '{"type": "result", "result": "prose, not a verdict"}';

    const expectedStatus = 0;

    const actual = runCheck(input);
    const actualStatus = actual.status;
    const actualWarns = actual.stderr.includes("could not verify");

    assert.equal(actualStatus, expectedStatus);
    assert.ok(actualWarns);
  });

  it("exits 1 under --strict when the verdict cannot be read", () => {
    const input = '{"type": "result", "result": "prose, not a verdict"}';

    const expectedStatus = 1;

    const actual = runCheck(input, ["--strict"]);
    const actualStatus = actual.status;
    const actualWarns = actual.stderr.includes("could not verify");

    assert.equal(actualStatus, expectedStatus);
    assert.ok(actualWarns);
  });

  it("exits 1 under --strict when the input is not JSON at all", () => {
    const input = "diff --git a/src/order.mjs b/src/order.mjs";

    const expectedStatus = 1;

    const actual = runCheck(input, ["--strict"]);
    const actualStatus = actual.status;

    assert.equal(actualStatus, expectedStatus);
  });

  it("keeps exit 0 without --strict when the input is not JSON at all", () => {
    const input = "diff --git a/src/order.mjs b/src/order.mjs";

    const expectedStatus = 0;

    const actual = runCheck(input);
    const actualStatus = actual.status;

    assert.equal(actualStatus, expectedStatus);
  });
});
