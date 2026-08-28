import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";

import { KitEmission } from "./kit-emission.mjs";

const { resolveKitPath, clearKit, migrateLegacyTree, verifyAgainstManifest } =
  KitEmission;

const SELECTIONS = { mode: "quick", flavor: "lite" };

function makeTempDir() {
  return fileSystem.mkdtempSync(path.join(os.tmpdir(), "sdg-kit-"));
}

function cleanup(targetDirectory) {
  fileSystem.rmSync(targetDirectory, { recursive: true, force: true });
}

function seedFile(absolutePath, content) {
  fileSystem.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fileSystem.writeFileSync(absolutePath, content);
}

function seedManifest(targetDirectory, contentHashes) {
  const manifestPath = path.join(targetDirectory, ".ai", ".sdg-manifest.json");

  const manifest = {
    generatedAt: "2026-01-01T00:00:00.000Z",
    sdgAgentVersion: "9.0.0",
    selections: SELECTIONS,
    contentHashes,
  };

  seedFile(manifestPath, JSON.stringify(manifest));
}

describe("KitEmission", () => {
  describe("clearKit()", () => {
    it("removes a hand-written file the canon does not carry", () => {
      const tmpDir = makeTempDir();
      const customPath = resolveKitPath(tmpDir, "skills", "my-rule.md");
      seedFile(customPath, "# mine\n");

      try {
        const actualRemoved = clearKit(tmpDir, SELECTIONS);
        const expectedRemoved = [path.join("skills", "my-rule.md")];
        const actualStillExists = fileSystem.existsSync(customPath);
        const expectedStillExists = false;

        assert.deepEqual(actualRemoved, expectedRemoved);
        assert.equal(actualStillExists, expectedStillExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("stays silent on a first install, where there is no kit yet", () => {
      const tmpDir = makeTempDir();

      try {
        const actualRemoved = clearKit(tmpDir, SELECTIONS);
        const expectedRemoved = [];

        assert.deepEqual(actualRemoved, expectedRemoved);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("never reaches outside the kit, backlog included", () => {
      const tmpDir = makeTempDir();
      const backlogPath = path.join(tmpDir, ".ai", "backlog", "learned.md");
      seedFile(backlogPath, "# team knowledge\n");
      seedFile(resolveKitPath(tmpDir, "skills", "code-style.md"), "# canon\n");

      try {
        clearKit(tmpDir, SELECTIONS);

        const actualBacklogSurvives = fileSystem.existsSync(backlogPath);
        const expectedBacklogSurvives = true;

        assert.equal(actualBacklogSurvives, expectedBacklogSurvives);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("migrateLegacyTree()", () => {
    it("removes a pre-split tree and names what no release wrote", () => {
      const tmpDir = makeTempDir();
      const legacySkill = path.join(tmpDir, ".ai", "skills", "testing.md");
      const legacyCustom = path.join(tmpDir, ".ai", "skills", "mine.md");
      seedFile(legacySkill, "# canon\n");
      seedFile(legacyCustom, "# mine\n");
      seedManifest(tmpDir, { "skills/testing.md": "any-hash" });

      try {
        const migrationReport = migrateLegacyTree(tmpDir);
        const actualCustomFiles = migrationReport.customFiles;
        const expectedCustomFiles = [path.join("skills", "mine.md")];
        const actualRemovedCount = migrationReport.removedCount;
        const expectedRemovedCount = 2;
        const actualLegacyExists = fileSystem.existsSync(
          path.join(tmpDir, ".ai", "skills"),
        );

        const expectedLegacyExists = false;

        assert.deepEqual(actualCustomFiles, expectedCustomFiles);
        assert.equal(actualRemovedCount, expectedRemovedCount);
        assert.equal(actualLegacyExists, expectedLegacyExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("reports nothing when the install is already split", () => {
      const tmpDir = makeTempDir();
      seedFile(resolveKitPath(tmpDir, "skills", "testing.md"), "# canon\n");

      try {
        const actualReport = migrateLegacyTree(tmpDir);
        const expectedReport = null;

        assert.equal(actualReport, expectedReport);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("leaves the backlog untouched", () => {
      const tmpDir = makeTempDir();
      const backlogPath = path.join(tmpDir, ".ai", "backlog", "context.md");
      seedFile(backlogPath, "# brief\n");
      seedFile(path.join(tmpDir, ".ai", "commands", "sdg-feat.md"), "# cmd\n");

      try {
        migrateLegacyTree(tmpDir);

        const actualBacklogSurvives = fileSystem.existsSync(backlogPath);
        const expectedBacklogSurvives = true;

        assert.equal(actualBacklogSurvives, expectedBacklogSurvives);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("verifyAgainstManifest()", () => {
    it("names a file whose bytes stopped matching the pin", () => {
      const tmpDir = makeTempDir();
      const emptyFileHash =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

      seedFile(resolveKitPath(tmpDir, "skills", "testing.md"), "tampered\n");

      try {
        const actualDrifted = verifyAgainstManifest(tmpDir, {
          "skills/testing.md": emptyFileHash,
        });

        const expectedDrifted = ["skills/testing.md"];

        assert.deepEqual(actualDrifted, expectedDrifted);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("names a file the manifest pins and the tree does not hold", () => {
      const tmpDir = makeTempDir();

      try {
        const actualDrifted = verifyAgainstManifest(tmpDir, {
          "skills/testing.md": "any-hash",
        });

        const expectedDrifted = ["skills/testing.md"];

        assert.deepEqual(actualDrifted, expectedDrifted);
      } finally {
        cleanup(tmpDir);
      }
    });
  });
});
