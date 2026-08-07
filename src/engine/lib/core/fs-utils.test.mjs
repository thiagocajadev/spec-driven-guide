import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { FsUtils } from "./fs-utils.mjs";

const { getDirname, getDirectories, copyRecursiveSync } = FsUtils;

describe("FsUtils", () => {
  describe("getDirname()", () => {
    it("returns a valid directory path from a file URL", () => {
      const input = "file:///home/user/project/src/index.mjs";
      const expected = "/home/user/project/src";

      const actual = getDirname(input);

      assert.equal(actual, expected);
    });

    it("returns the directory of the current test file", () => {
      const input = import.meta.url;

      const expected = true;
      const actualRaw = getDirname(input);

      const actual =
        actualRaw.endsWith("/src/engine/lib/core") ||
        actualRaw.endsWith("\\src\\engine\\lib\\core");

      assert.equal(actual, expected);
    });
  });

  describe("getDirectories()", () => {
    it("returns an empty array when the path does not exist", () => {
      const input = "/non-existent-path-sdg-test";
      const expected = [];

      const actual = getDirectories(input);

      assert.deepEqual(actual, expected);
    });

    it("returns a list of directory names for a valid path", () => {
      const coreDir = getDirname(import.meta.url);
      const input = path.join(coreDir, "..");

      const expected = true;
      const actualRaw = getDirectories(input);
      const actual = Array.isArray(actualRaw) && actualRaw.length > 0;

      assert.equal(actual, expected);
    });
  });

  describe("copyRecursiveSync()", () => {
    it("copies a single file to a destination", () => {
      const tmpDir = fileSystem.mkdtempSync(
        path.join(os.tmpdir(), "sdg-test-"),
      );

      const srcFile = path.join(tmpDir, "source.txt");
      const destFile = path.join(tmpDir, "dest.txt");
      const expectedContent = "hello";
      fileSystem.writeFileSync(srcFile, expectedContent);

      copyRecursiveSync(srcFile, destFile);

      const actualExists = fileSystem.existsSync(destFile);
      const actualContent = fileSystem.readFileSync(destFile, "utf8");

      assert.ok(actualExists);
      assert.equal(actualContent, expectedContent);

      fileSystem.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("copies a directory tree recursively", () => {
      const tmpDir = fileSystem.mkdtempSync(
        path.join(os.tmpdir(), "sdg-test-"),
      );

      const srcDir = path.join(tmpDir, "src");
      const subDir = path.join(srcDir, "sub");
      const rootText = "root";
      const nestedText = "nested";
      fileSystem.mkdirSync(subDir, { recursive: true });
      fileSystem.writeFileSync(path.join(srcDir, "root.txt"), rootText);
      fileSystem.writeFileSync(path.join(subDir, "nested.txt"), nestedText);
      const destDir = path.join(tmpDir, "dest");

      copyRecursiveSync(srcDir, destDir);

      const actualRootText = fileSystem.readFileSync(
        path.join(destDir, "root.txt"),
        "utf8",
      );

      const actualNestedText = fileSystem.readFileSync(
        path.join(destDir, "sub", "nested.txt"),
        "utf8",
      );

      assert.equal(actualRootText, rootText);
      assert.equal(actualNestedText, nestedText);

      fileSystem.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("does nothing when the source path does not exist", () => {
      const destFile = "/tmp/sdg-dest-non-existent.txt";
      const input = "/non-existent-path-sdg-test/file.txt";
      const expected = false;
      copyRecursiveSync(input, destFile);

      const actual = fileSystem.existsSync(destFile);

      assert.equal(actual, expected);
    });
  });
});
