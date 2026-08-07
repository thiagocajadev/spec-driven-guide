import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ResultUtils } from "./result-utils.mjs";

const { success, fail } = ResultUtils;

describe("ResultUtils", () => {
  describe("success()", () => {
    it("creates a success result with a value", () => {
      const input = "hello";

      const expectedValue = input;
      const expectedSuccess = true;
      const expectedFailure = false;
      const expectedNull = null;
      const actual = success(input);
      const actualIsSuccess = actual.isSuccess;
      const actualIsFailure = actual.isFailure;
      const actualValue = actual.value;
      const actualError = actual.error;

      assert.equal(actualIsSuccess, expectedSuccess);
      assert.equal(actualIsFailure, expectedFailure);
      assert.equal(actualValue, expectedValue);
      assert.equal(actualError, expectedNull);
    });

    it("creates a success result with undefined when no value is passed", () => {
      const expectedValue = undefined;
      const expectedSuccess = true;
      const expectedFailure = false;
      const expectedNull = null;
      const actual = success();
      const actualIsSuccess = actual.isSuccess;
      const actualIsFailure = actual.isFailure;
      const actualValue = actual.value;
      const actualError = actual.error;

      assert.equal(actualIsSuccess, expectedSuccess);
      assert.equal(actualIsFailure, expectedFailure);
      assert.equal(actualValue, expectedValue);
      assert.equal(actualError, expectedNull);
    });

    it("preserves complex objects as values", () => {
      const input = { id: 1, name: "test", nested: { key: "value" } };

      const expected = input;

      const actual = success(input);
      const actualValue = actual.value;

      assert.deepEqual(actualValue, expected);
    });

    it("handles null as a valid value", () => {
      const input = null;

      const expectedValue = null;
      const expectedSuccess = true;
      const actual = success(input);
      const actualIsSuccess = actual.isSuccess;
      const actualValue = actual.value;

      assert.equal(actualIsSuccess, expectedSuccess);
      assert.equal(actualValue, expectedValue);
    });
  });

  describe("fail()", () => {
    it("creates a failure result with message and code", () => {
      const inputMessage = "Something went wrong";
      const inputCode = "ERR_001";

      const expectedError = {
        message: inputMessage,
        code: inputCode,
      };

      const expectedSuccess = false;
      const expectedFailure = true;
      const expectedNull = null;
      const actual = fail(inputMessage, inputCode);
      const actualIsSuccess = actual.isSuccess;
      const actualIsFailure = actual.isFailure;
      const actualValue = actual.value;
      const actualError = actual.error;

      assert.equal(actualIsSuccess, expectedSuccess);
      assert.equal(actualIsFailure, expectedFailure);
      assert.equal(actualValue, expectedNull);
      assert.deepEqual(actualError, expectedError);
    });

    it("guarantees isSuccess and isFailure are always opposite", () => {
      const inputOk = "data";
      const inputErr = "oops";

      const actualOk = success(inputOk);
      const actualErr = fail(inputErr, "FAIL");
      const actualOkIsSuccess = actualOk.isSuccess;
      const actualOkIsFailure = actualOk.isFailure;
      const actualErrIsSuccess = actualErr.isSuccess;
      const actualErrIsFailure = actualErr.isFailure;

      assert.notEqual(actualOkIsSuccess, actualOkIsFailure);
      assert.notEqual(actualErrIsSuccess, actualErrIsFailure);
    });
  });
});
