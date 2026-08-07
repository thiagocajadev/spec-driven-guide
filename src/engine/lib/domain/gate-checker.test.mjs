import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GateChecker } from "./gate-checker.mjs";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const resultsDir = path.resolve(
  currentDir,
  "../../../../tests/fixtures/gate/results",
);

describe("GateChecker", () => {
  describe("checkResult()", () => {
    it("returns canCommit false when BLOCK violation present", () => {
      const input = readFileSync(
        path.join(resultsDir, "block-result.json"),
        "utf8",
      );

      const expected = false;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });

    it("returns canCommit true when result is clean", () => {
      const input = readFileSync(
        path.join(resultsDir, "pass-result.json"),
        "utf8",
      );

      const expected = true;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });

    it("returns canCommit true when only WARN violations present", () => {
      const input = readFileSync(
        path.join(resultsDir, "warn-result.json"),
        "utf8",
      );

      const expected = true;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });

    it("isolates block violations from warn violations", () => {
      const input = readFileSync(
        path.join(resultsDir, "block-result.json"),
        "utf8",
      );

      const expectedBlockCount = 1;

      const actual = GateChecker.checkResult(input);
      const actualBlockCount = actual.blockViolations.length;

      assert.equal(actualBlockCount, expectedBlockCount);
    });

    it("reads the verdict wrapped in an agent CLI envelope", () => {
      const input = readFileSync(
        path.join(resultsDir, "envelope-result.json"),
        "utf8",
      );

      const expectedCanCommit = false;
      const expectedBlockCount = 1;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;
      const actualBlockCount = actual.blockViolations.length;

      assert.equal(actualCanCommit, expectedCanCommit);
      assert.equal(actualBlockCount, expectedBlockCount);
    });

    it("marks valid JSON without a violations array as unverified", () => {
      const input = readFileSync(
        path.join(resultsDir, "unreadable-result.json"),
        "utf8",
      );

      const actual = GateChecker.checkResult(input);
      const actualReason = actual.unverifiedReason;
      const actualMentionsViolations = actualReason.includes("violations");
      const actualNamesKeys = actualReason.includes("status, findings");

      assert.ok(actualReason);
      assert.ok(actualMentionsViolations);
      assert.ok(actualNamesKeys);
    });

    it("marks an envelope with unreadable inner content as unverified", () => {
      const input = '{"type":"result","result":"I could not review this diff"}';

      const actual = GateChecker.checkResult(input);
      const actualReason = actual.unverifiedReason;

      assert.ok(actualReason);
    });

    it("marks a JSON primitive as unverified", () => {
      const input = "42";

      const actual = GateChecker.checkResult(input);
      const actualReason = actual.unverifiedReason;
      const actualNamesType = actualReason.includes("number");

      assert.ok(actualReason);
      assert.ok(actualNamesType);
    });

    it("carries an unverified reason when JSON is invalid", () => {
      const input = "not valid json {{";

      const actual = GateChecker.checkResult(input);
      const actualReason = actual.unverifiedReason;

      assert.ok(actualReason);
    });

    it("leaves a clean report without an unverified reason", () => {
      const input = readFileSync(
        path.join(resultsDir, "pass-result.json"),
        "utf8",
      );

      const expected = undefined;

      const actual = GateChecker.checkResult(input);
      const actualReason = actual.unverifiedReason;

      assert.equal(actualReason, expected);
    });

    it("fails open when JSON is invalid", () => {
      const input = "not valid json {{";

      const expected = true;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });

    it("fails open when input is empty", () => {
      const input = "";

      const expected = true;

      const actual = GateChecker.checkResult(input);
      const actualCanCommit = actual.canCommit;

      assert.equal(actualCanCommit, expected);
    });
  });

  describe("formatViolationReport()", () => {
    it("includes rule id and file in report", () => {
      const input = readFileSync(
        path.join(resultsDir, "block-result.json"),
        "utf8",
      );

      const expectedRule = "explaining-returns";
      const expectedFile = "src/orders/order.service.cs";
      const parsed = GateChecker.checkResult(input);
      const actual = GateChecker.formatViolationReport(parsed.blockViolations);

      const containsRule = actual.includes(expectedRule);
      const containsFile = actual.includes(expectedFile);

      assert.ok(containsRule);
      assert.ok(containsFile);
    });
  });
});
