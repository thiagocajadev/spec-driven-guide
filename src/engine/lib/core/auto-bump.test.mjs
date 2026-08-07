import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AutoBump } from "../../bin/lifecycle/auto-bump.mjs";

const { detectBumpType, bumpVersion } = AutoBump;

describe("AutoBump", () => {
  describe("detectBumpType()", () => {
    it("returns patch for fix: commits", () => {
      const input = "fix: corrige typo no README";

      const expected = "patch";

      const actual = detectBumpType(input);

      assert.equal(actual, expected);
    });

    it("returns patch for chore: commits", () => {
      const input = "chore: atualiza dependencias";

      const expected = "patch";

      const actual = detectBumpType(input);

      assert.equal(actual, expected);
    });

    it("returns minor for feat: commits", () => {
      const input = "feat: adiciona novo comando export";

      const expected = "minor";

      const actual = detectBumpType(input);

      assert.equal(actual, expected);
    });

    it("returns major for breaking change via ! prefix", () => {
      const inputFeature = "feat!: remove suporte a Node 18";
      const inputFix = "fix!: altera contrato da API";

      const expected = "major";
      const actualFeature = detectBumpType(inputFeature);
      const actualFix = detectBumpType(inputFix);

      assert.equal(actualFeature, expected);
      assert.equal(actualFix, expected);
    });

    it("returns major for BREAKING CHANGE in footer", () => {
      const input =
        "refactor: reestrutura pipeline\n\nBREAKING CHANGE: remove flag --legacy";

      const expected = "major";

      const actual = detectBumpType(input);

      assert.equal(actual, expected);
    });

    it("returns skip for chore: bump version commits", () => {
      const inputMajor = "chore: bump version to 1.2.3";
      const inputMinor = "chore: bump version to 0.13.0";

      const expected = "skip";
      const actualMajor = detectBumpType(inputMajor);
      const actualMinor = detectBumpType(inputMinor);

      assert.equal(actualMajor, expected);
      assert.equal(actualMinor, expected);
    });
  });

  describe("bumpVersion()", () => {
    it("increments patch", () => {
      const inputVersion = "0.12.1";
      const inputType = "patch";

      const expected = "0.12.2";
      const actual = bumpVersion(inputVersion, inputType);

      assert.equal(actual, expected);
    });

    it("increments minor and reset patch", () => {
      const inputVersion = "0.12.1";
      const inputType = "minor";

      const expected = "0.13.0";
      const actual = bumpVersion(inputVersion, inputType);

      assert.equal(actual, expected);
    });

    it("increments major and reset minor + patch", () => {
      const inputVersion = "0.12.1";
      const inputType = "major";

      const expected = "1.0.0";
      const actual = bumpVersion(inputVersion, inputType);

      assert.equal(actual, expected);
    });

    it("handles version 0.0.0", () => {
      const inputVersion = "0.0.0";

      const expectedPatch = "0.0.1";
      const expectedMinor = "0.1.0";
      const expectedMajor = "1.0.0";
      const actualPatch = bumpVersion(inputVersion, "patch");
      const actualMinor = bumpVersion(inputVersion, "minor");
      const actualMajor = bumpVersion(inputVersion, "major");

      assert.equal(actualPatch, expectedPatch);
      assert.equal(actualMinor, expectedMinor);
      assert.equal(actualMajor, expectedMajor);
    });
  });
});
