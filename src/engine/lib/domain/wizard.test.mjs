import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WizardUtils } from "./wizard.mjs";

const { validateSelections } = WizardUtils;

describe("WizardUtils (Non-Interactive)", () => {
  describe("validateSelections()", () => {
    it("accepts valid flavor", () => {
      const input = { flavor: "vertical-slice" };

      const expectedSuccess = true;

      const actual = validateSelections(input);
      const actualIsSuccess = actual.isSuccess;

      assert.equal(actualIsSuccess, expectedSuccess);
    });

    it("rejects missing flavor", () => {
      const input = {};

      const expectedFailure = true;
      const expectedCode = "MISSING_FLAVOR";
      const actual = validateSelections(input);
      const actualIsFailure = actual.isFailure;
      const actualErrorCode = actual.error.code;

      assert.equal(actualIsFailure, expectedFailure);
      assert.equal(actualErrorCode, expectedCode);
    });

    it("rejects unknown flavor", () => {
      const input = { flavor: "nonexistent" };

      const expectedFailure = true;
      const expectedCode = "INVALID_FLAVOR";
      const expectedInMessage = "nonexistent";
      const actual = validateSelections(input);
      const actualIsFailure = actual.isFailure;
      const actualErrorCode = actual.error.code;
      const hasExpectedInMessage =
        actual.error.message.includes(expectedInMessage);

      assert.equal(actualIsFailure, expectedFailure);
      assert.equal(actualErrorCode, expectedCode);
      assert.ok(hasExpectedInMessage);
    });

    it("applies default flavor for quick mode", () => {
      const input = { mode: "quick" };

      const expectedSuccess = true;
      const expectedFlavor = "lite";
      const actual = validateSelections(input);
      const actualIsSuccess = actual.isSuccess;
      const actualFlavor = actual.value.flavor;

      assert.equal(actualIsSuccess, expectedSuccess);
      assert.equal(actualFlavor, expectedFlavor);
    });

    it("accepts each supported flavor", () => {
      const expectedSuccess = true;
      for (const flavor of ["lite", "vertical-slice", "mvc", "legacy"]) {
        const actual = validateSelections({ flavor });
        const actualIsSuccess = actual.isSuccess;

        assert.equal(
          actualIsSuccess,
          expectedSuccess,
          `flavor ${flavor} should be accepted`,
        );
      }
    });
  });

  describe("WizardUtils surface", () => {
    it("only exports gatherUserSelections and validateSelections", () => {
      const expectedKeys = ["gatherUserSelections", "validateSelections"];
      const actualKeys = Object.keys(WizardUtils).sort();

      const expectedSortedKeys = expectedKeys.sort();

      assert.deepEqual(actualKeys, expectedSortedKeys);
    });
  });
});
