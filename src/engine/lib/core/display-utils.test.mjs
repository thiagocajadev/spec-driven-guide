import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DisplayUtils } from "./display-utils.mjs";

const { displayName } = DisplayUtils;

describe("DisplayUtils", () => {
  describe("displayName()", () => {
    it('should return "(none)" for null or empty input', () => {
      const inputNull = null;
      const inputEmpty = "";
      const inputNone = "none";
      const expected = "(none)";

      const actualNull = displayName(inputNull);
      const actualEmpty = displayName(inputEmpty);
      const actualNone = displayName(inputNone);

      assert.equal(actualNull, expected);
      assert.equal(actualEmpty, expected);
      assert.equal(actualNone, expected);
    });

    it("returns hardcoded labels for core flavors", () => {
      const inputLite = "lite";
      const inputVS = "vertical-slice";
      const inputMVC = "mvc";
      const inputLegacy = "legacy";

      const expectedLite = "Lite";
      const expectedVS = "Vertical Slice";
      const expectedMVC = "MVC";
      const expectedLegacy = "Legacy Pipeline";

      const actualLite = displayName(inputLite);
      const actualVS = displayName(inputVS);
      const actualMVC = displayName(inputMVC);
      const actualLegacy = displayName(inputLegacy);

      assert.equal(actualLite, expectedLite);
      assert.equal(actualVS, expectedVS);
      assert.equal(actualMVC, expectedMVC);
      assert.equal(actualLegacy, expectedLegacy);
    });

    it("returns the key itself if no display name is found", () => {
      const input = "unknown-flavor-key";

      const expected = input;

      const actual = displayName(input);

      assert.equal(actual, expected);
    });
  });

  describe("smartTruncate()", () => {
    it("returns original content if below threshold", () => {
      const content = "line 1\nline 2\nline 3";
      const actual = DisplayUtils.smartTruncate(content, 10, 10);

      assert.equal(actual, content);
    });

    it("truncates and show head/tail for long content", () => {
      const lines = Array.from({ length: 200 }, (_, i) => `line ${i + 1}`);
      const content = lines.join("\n");
      const headLimit = 10;
      const tailLimit = 5;

      const actual = DisplayUtils.smartTruncate(content, headLimit, tailLimit);

      const expectedHeadStart = "line 1\nline 2";
      const expectedTailEnd = "line 199\nline 200";
      const expectedTruncationMarker = "[TRUNCATED 185 LINES]";
      const expectedLineCount = headLimit + tailLimit + 1; // head + message line + tail

      const startsWithHead = actual.startsWith(expectedHeadStart);
      const endsWithTail = actual.endsWith(expectedTailEnd);
      const hasTruncationMarker = actual.includes(expectedTruncationMarker);
      const actualLineCount = actual.split("\n").length;

      assert.ok(startsWithHead);
      assert.ok(endsWithTail);
      assert.ok(hasTruncationMarker);
      assert.equal(actualLineCount, expectedLineCount);
    });

    it("returns empty string for empty input", () => {
      const expected = "";
      const actualNull = DisplayUtils.smartTruncate(null);
      const actualEmpty = DisplayUtils.smartTruncate("");

      assert.equal(actualNull, expected);
      assert.equal(actualEmpty, expected);
    });
  });

  describe("createReference()", () => {
    it("returns a formatted reference string", () => {
      const targetFile = "large-file.log";
      const summary = "Summary of the logs";
      const actual = DisplayUtils.createReference(targetFile, summary);

      const expectedPrefix = `REF: ${targetFile}`;
      const expectedReason = `REASON: ${summary}`;
      const expectedStatus = "Contextual Snapshot";

      const hasPrefix = actual.includes(expectedPrefix);
      const hasReason = actual.includes(expectedReason);
      const hasStatus = actual.includes(expectedStatus);

      assert.ok(hasPrefix);
      assert.ok(hasReason);
      assert.ok(hasStatus);
    });
  });
});
