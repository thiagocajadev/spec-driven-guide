import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";

import { RulesetInjector } from "./ruleset-injector.mjs";

const { prepareProjectStructure, injectRulesets, collectOutputSummary } =
  RulesetInjector;

function makeTempDir() {
  return fileSystem.mkdtempSync(path.join(os.tmpdir(), "sdg-test-"));
}

function cleanup(dir) {
  fileSystem.rmSync(dir, { recursive: true, force: true });
}

describe("RulesetInjector", () => {
  describe("prepareProjectStructure()", () => {
    it("creates .ai/instructions and .ai/commands directories", () => {
      const tmpDir = makeTempDir();
      const expectedDirs = [
        path.join(tmpDir, ".ai", "kit", "instructions"),
        path.join(tmpDir, ".ai", "kit", "commands"),
      ];

      try {
        prepareProjectStructure(tmpDir);

        for (const expectedDir of expectedDirs) {
          const actualExists = fileSystem.existsSync(expectedDir);

          assert.ok(actualExists);
        }
      } finally {
        cleanup(tmpDir);
      }
    });

    it("is idempotent: calling twice does not throw", () => {
      const tmpDir = makeTempDir();

      try {
        prepareProjectStructure(tmpDir);

        assert.doesNotThrow(() => prepareProjectStructure(tmpDir));
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("injectRulesets()", () => {
    it("copies skills/ to .ai/kit/skills/", () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: "lite" };

      const expectedSkillFile = path.join(
        tmpDir,
        ".ai",
        "kit",
        "skills",
        "code-style.md",
      );

      try {
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, inputSelections);
        const actualSkillExists = fileSystem.existsSync(expectedSkillFile);

        assert.ok(actualSkillExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("copies flavor files to .ai/kit/instructions/flavor/", () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: "lite" };

      const expectedDir = path.join(
        tmpDir,
        ".ai",
        "kit",
        "instructions",
        "flavor",
      );

      try {
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, inputSelections);
        const actualFlavorDirExists = fileSystem.existsSync(expectedDir);

        assert.ok(actualFlavorDirExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("copies templates and commands to .ai/kit/", () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: "lite" };
      const expectedTemplates = path.join(
        tmpDir,
        ".ai",
        "kit",
        "instructions",
        "templates",
      );

      const expectedCommands = path.join(tmpDir, ".ai", "kit", "commands");

      try {
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, inputSelections);
        const actualTemplatesExist = fileSystem.existsSync(expectedTemplates);
        const actualCommandsExist = fileSystem.existsSync(expectedCommands);

        assert.ok(actualTemplatesExist);
        assert.ok(actualCommandsExist);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("injects delivery.md as the fused competency", () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: "lite" };
      const deliveryPath = path.join(
        tmpDir,
        ".ai",
        "kit",
        "instructions",
        "competencies",
        "delivery.md",
      );

      const backendPath = path.join(
        tmpDir,
        ".ai",
        "kit",
        "instructions",
        "competencies",
        "backend.md",
      );

      const frontendPath = path.join(
        tmpDir,
        ".ai",
        "kit",
        "instructions",
        "competencies",
        "frontend.md",
      );

      try {
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, inputSelections);

        const hasDelivery = fileSystem.existsSync(deliveryPath);
        const hasLegacyBackend = fileSystem.existsSync(backendPath);
        const hasLegacyFrontend = fileSystem.existsSync(frontendPath);
        const expectedAbsent = false;

        assert.ok(hasDelivery, "delivery.md must be copied");
        assert.equal(
          hasLegacyBackend,
          expectedAbsent,
          "legacy backend.md must not be copied",
        );

        assert.equal(
          hasLegacyFrontend,
          expectedAbsent,
          "legacy frontend.md must not be copied",
        );
      } finally {
        cleanup(tmpDir);
      }
    });

    it("does NOT create an idioms/ directory", () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: "lite" };
      const legacyIdiomsDir = path.join(
        tmpDir,
        ".ai",
        "kit",
        "instructions",
        "idioms",
      );

      try {
        prepareProjectStructure(tmpDir);
        injectRulesets(tmpDir, inputSelections);

        const hasLegacyIdiomsDir = fileSystem.existsSync(legacyIdiomsDir);
        const expectedAbsent = false;

        assert.equal(hasLegacyIdiomsDir, expectedAbsent);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("collectOutputSummary()", () => {
    it("lists the canonical directory set (no idioms)", () => {
      const expectedDirs = [
        ".ai/kit/skills/",
        ".ai/kit/instructions/flavor/",
        ".ai/kit/instructions/competencies/",
        ".ai/kit/instructions/templates/",
        ".ai/kit/commands/",
      ];

      const { directories: actual } = collectOutputSummary();

      assert.deepEqual(actual, expectedDirs);
    });

    it("does NOT include any idioms/ subdirectory", () => {
      const expectedAbsent = false;
      const { directories: actual } = collectOutputSummary();

      const hasIdiomsEntry = actual.some((directory) =>
        directory.includes("idioms"),
      );

      assert.equal(hasIdiomsEntry, expectedAbsent);
    });
  });
});
