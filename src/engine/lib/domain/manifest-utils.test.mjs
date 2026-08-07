import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ManifestUtils } from "./manifest-utils.mjs";

const { compareHashes, computeHashes, daysAgo } = ManifestUtils;

describe("ManifestUtils", () => {
  describe("compareHashes()", () => {
    it("classifies unchanged files correctly", () => {
      const stored = {
        "core/code-style.md": "abc123",
        "core/security.md": "def456",
      };

      const current = {
        "core/code-style.md": "abc123",
        "core/security.md": "def456",
      };

      const expectedUnchanged = ["core/code-style.md", "core/security.md"];
      const expectedEmpty = [];
      const actual = compareHashes(stored, current);
      const actualUnchanged = actual.unchanged;
      const actualChanged = actual.changed;
      const actualAdded = actual.added;

      assert.deepEqual(actualUnchanged, expectedUnchanged);
      assert.deepEqual(actualChanged, expectedEmpty);
      assert.deepEqual(actualAdded, expectedEmpty);
    });

    it("detects changed files", () => {
      const stored = { "core/code-style.md": "abc123" };
      const current = { "core/code-style.md": "xyz789" };

      const expectedChanged = ["core/code-style.md"];
      const expectedEmpty = [];
      const actual = compareHashes(stored, current);
      const actualChanged = actual.changed;
      const actualUnchanged = actual.unchanged;

      assert.deepEqual(actualChanged, expectedChanged);
      assert.deepEqual(actualUnchanged, expectedEmpty);
    });

    it("detects newly added files", () => {
      const stored = { "core/code-style.md": "abc123" };
      const current = {
        "core/code-style.md": "abc123",
        "core/new-file.md": "new456",
      };

      const expectedAdded = ["core/new-file.md"];
      const expectedUnchanged = ["core/code-style.md"];
      const actual = compareHashes(stored, current);
      const actualAdded = actual.added;
      const actualUnchanged = actual.unchanged;

      assert.deepEqual(actualAdded, expectedAdded);
      assert.deepEqual(actualUnchanged, expectedUnchanged);
    });

    it("handles mixed changes, additions, and unchanged", () => {
      const stored = {
        "core/a.md": "hash1",
        "core/b.md": "hash2",
        "core/c.md": "hash3",
      };

      const current = {
        "core/a.md": "hash1", // unchanged
        "core/b.md": "hash2_updated", // changed
        "core/c.md": "hash3", // unchanged
        "core/d.md": "hash4", // added
      };

      const expectedUnchanged = ["core/a.md", "core/c.md"];
      const expectedChanged = ["core/b.md"];
      const expectedAdded = ["core/d.md"];
      const actual = compareHashes(stored, current);
      const actualUnchanged = actual.unchanged;
      const actualChanged = actual.changed;
      const actualAdded = actual.added;

      assert.deepEqual(actualUnchanged, expectedUnchanged);
      assert.deepEqual(actualChanged, expectedChanged);
      assert.deepEqual(actualAdded, expectedAdded);
    });

    it("handles empty stored hashes (fresh install scenario)", () => {
      const stored = {};
      const current = { "core/a.md": "hash1", "core/b.md": "hash2" };

      const expectedAdded = ["core/a.md", "core/b.md"];
      const expectedEmpty = [];
      const actual = compareHashes(stored, current);
      const actualAdded = actual.added;
      const actualChanged = actual.changed;
      const actualUnchanged = actual.unchanged;

      assert.deepEqual(actualAdded, expectedAdded);
      assert.deepEqual(actualChanged, expectedEmpty);
      assert.deepEqual(actualUnchanged, expectedEmpty);
    });

    it("handles empty current hashes", () => {
      const stored = { "core/a.md": "hash1" };
      const current = {};

      const expectedEmpty = [];
      const actual = compareHashes(stored, current);
      const actualAdded = actual.added;
      const actualChanged = actual.changed;
      const actualUnchanged = actual.unchanged;

      // Files in stored but not in current are simply not reported
      assert.deepEqual(actualAdded, expectedEmpty);
      assert.deepEqual(actualChanged, expectedEmpty);
      assert.deepEqual(actualUnchanged, expectedEmpty);
    });
  });

  describe("daysAgo()", () => {
    it('should return "today" for current date', () => {
      const input = new Date().toISOString();

      const expected = "today";

      const actual = daysAgo(input);

      assert.equal(actual, expected);
    });

    it('should return "1 day ago" for yesterday', () => {
      const input = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

      const expected = "1 day ago";

      const actual = daysAgo(input);

      assert.equal(actual, expected);
    });

    it('should return "N days ago" for older dates', () => {
      const input = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 5,
      ).toISOString();

      const expected = "5 days ago";

      const actual = daysAgo(input);

      assert.equal(actual, expected);
    });

    it("handles ISO date strings correctly", () => {
      const input = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 10,
      ).toISOString();

      const expected = "10 days ago";

      const actual = daysAgo(input);

      assert.equal(actual, expected);
    });
  });

  describe("computeHashes()", () => {
    it("hashes the tooling tree so review reports drift there", () => {
      const hashes = computeHashes({ flavor: "lite" });

      const actualToolingEntries = Object.keys(hashes).filter((entry) =>
        entry.startsWith("tooling/"),
      );

      const expectedMinimumEntries = 1;
      const actualHasToolingCoverage =
        actualToolingEntries.length >= expectedMinimumEntries;

      assert.ok(actualHasToolingCoverage);
    });

    it("hashes files of any extension, including extensionless ones", () => {
      const hashes = computeHashes({ flavor: "lite" });

      const sampledPaths = [
        "tooling/biome/biome.json",
        "tooling/husky/pre-commit",
        "tooling/eslint-config/.prettierrc",
      ];

      const actualMissing = sampledPaths.filter((entry) => !hashes[entry]);
      const expectedMissing = [];

      assert.deepEqual(actualMissing, expectedMissing);
    });
  });
});
