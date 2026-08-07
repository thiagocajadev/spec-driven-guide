import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { InstructionAssembler } from "./instruction-assembler.mjs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const {
  buildMasterInstructions,
  writeAgentConfig,
  writeGitignore,
  writeManifest,
  writeToolingAssets,
  writeBacklogFiles,
  removeGeneratedInstructions,
} = InstructionAssembler;

const VOLATILE_ENTRIES = [
  ".ai/backlog/tasks.md",
  ".ai/backlog/impact-map.md",
  ".ai/last-prompt.md",
];

const VERSIONED_BACKLOG_FILES = [
  "context.md",
  "stack.md",
  "learned.md",
  "troubleshoot.md",
];

const GENERATED_AGENTS = [
  "# Staff Engineer — Governance Command Center",
  "",
  "> Cycle phases live in workflow.md.",
  "",
].join("\n");

const FOREIGN_AGENTS = [
  "# House Rules",
  "",
  "Written by the team, not by this CLI.",
  "",
].join("\n");

const FOREIGN_CLAUDE = ["# Team Claude Notes", "", "Hand-maintained.", ""].join(
  "\n",
);

function makeTempDir() {
  return fileSystem.mkdtempSync(path.join(os.tmpdir(), "sdg-test-"));
}

function cleanup(dir) {
  fileSystem.rmSync(dir, { recursive: true, force: true });
}

function gitignorePathOf(targetDirectory) {
  return path.join(targetDirectory, ".gitignore");
}

function readGitignore(targetDirectory) {
  return fileSystem.readFileSync(gitignorePathOf(targetDirectory), "utf8");
}

function countOccurrences(content, needle) {
  return content.split(needle).length - 1;
}

describe("BacklogVolatilityMessaging", () => {
  const engineDirectory = path.resolve(currentDirectory, "..", "..");

  const SUMMARY_SOURCES = [
    path.join(engineDirectory, "lib", "core", "ui-utils.mjs"),
    path.join(engineDirectory, "bin", "maintenance", "clear-bundle.mjs"),
  ];

  const IGNORE_CLAIM = /gitignored|NOT in git/;
  const KNOWLEDGE_FILE = /(context|stack|learned|troubleshoot)\.md/;

  it("never calls a knowledge file gitignored", () => {
    const actualOffenders = SUMMARY_SOURCES.flatMap((sourcePath) => {
      const sourceLines = fileSystem
        .readFileSync(sourcePath, "utf8")
        .split("\n");

      const offendingLines = sourceLines.filter(
        (line) => IGNORE_CLAIM.test(line) && KNOWLEDGE_FILE.test(line),
      );

      return offendingLines;
    });

    const expectedOffenders = [];

    assert.deepEqual(actualOffenders, expectedOffenders);
  });
});

describe("InstructionAssembler", () => {
  describe("writeAgentConfig()", () => {
    it("writes AGENTS.md at the repo root", () => {
      const tmpDir = makeTempDir();
      const expectedPath = path.join(tmpDir, "AGENTS.md");

      try {
        writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualContent = fileSystem.readFileSync(expectedPath, "utf8");
        const expectedContent = GENERATED_AGENTS;

        assert.equal(actualContent, expectedContent);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("leaves no AGENTS.md under .ai/skills/", () => {
      const tmpDir = makeTempDir();
      const legacyPath = path.join(tmpDir, ".ai", "skills", "AGENTS.md");

      try {
        writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualLegacyExists = fileSystem.existsSync(legacyPath);
        const expectedLegacyExists = false;

        assert.equal(actualLegacyExists, expectedLegacyExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("deletes a legacy .ai/skills/AGENTS.md on upgrade", () => {
      const tmpDir = makeTempDir();
      const legacyDir = path.join(tmpDir, ".ai", "skills");
      const legacyPath = path.join(legacyDir, "AGENTS.md");
      fileSystem.mkdirSync(legacyDir, { recursive: true });
      fileSystem.writeFileSync(legacyPath, GENERATED_AGENTS);

      try {
        writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualLegacyExists = fileSystem.existsSync(legacyPath);
        const expectedLegacyExists = false;

        assert.equal(actualLegacyExists, expectedLegacyExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("keeps a hand-written .ai/skills/AGENTS.md", () => {
      const tmpDir = makeTempDir();
      const legacyDir = path.join(tmpDir, ".ai", "skills");
      const legacyPath = path.join(legacyDir, "AGENTS.md");
      fileSystem.mkdirSync(legacyDir, { recursive: true });
      fileSystem.writeFileSync(legacyPath, FOREIGN_AGENTS);

      try {
        writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualContent = fileSystem.readFileSync(legacyPath, "utf8");
        const expectedContent = FOREIGN_AGENTS;

        assert.equal(actualContent, expectedContent);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("points CLAUDE.md at the root AGENTS.md", () => {
      const tmpDir = makeTempDir();
      const claudePath = path.join(tmpDir, "CLAUDE.md");

      try {
        writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const claudeContent = fileSystem.readFileSync(claudePath, "utf8");
        const actualImportsRoot = claudeContent.includes("@AGENTS.md");
        const expectedImportsRoot = true;

        assert.equal(actualImportsRoot, expectedImportsRoot);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("reports unchanged when re-run over its own output", () => {
      const tmpDir = makeTempDir();

      try {
        writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);
        const expectedOutcome = { agents: "unchanged", claude: "unchanged" };

        assert.deepEqual(actualOutcome, expectedOutcome);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("preserves a foreign AGENTS.md and write a sidecar", () => {
      const tmpDir = makeTempDir();
      const agentsPath = path.join(tmpDir, "AGENTS.md");
      const sidecarPath = path.join(tmpDir, "AGENTS.sdg.md");
      fileSystem.writeFileSync(agentsPath, FOREIGN_AGENTS);

      try {
        const configOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualPreserved = fileSystem.readFileSync(agentsPath, "utf8");
        const actualSidecar = fileSystem.readFileSync(sidecarPath, "utf8");
        const actualOutcome = configOutcome.agents;
        const expectedOutcome = "foreign";

        assert.equal(actualPreserved, FOREIGN_AGENTS);
        assert.equal(actualSidecar, GENERATED_AGENTS);
        assert.equal(actualOutcome, expectedOutcome);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("preserves a foreign CLAUDE.md without a sidecar", () => {
      const tmpDir = makeTempDir();
      const claudePath = path.join(tmpDir, "CLAUDE.md");
      const sidecarPath = path.join(tmpDir, "CLAUDE.sdg.md");
      fileSystem.writeFileSync(claudePath, FOREIGN_CLAUDE);

      try {
        const configOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualPreserved = fileSystem.readFileSync(claudePath, "utf8");
        const actualSidecarExists = fileSystem.existsSync(sidecarPath);
        const actualOutcome = configOutcome.claude;
        const expectedSidecarExists = false;
        const expectedOutcome = "foreign";

        assert.equal(actualPreserved, FOREIGN_CLAUDE);
        assert.equal(actualSidecarExists, expectedSidecarExists);
        assert.equal(actualOutcome, expectedOutcome);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("writeManifest()", () => {
    it("creates .ai/.sdg-manifest.json", () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: "lite" };
      const expectedFile = path.join(tmpDir, ".ai", ".sdg-manifest.json");

      try {
        writeManifest(tmpDir, inputSelections, "1.0.0");

        const actualExists = fileSystem.existsSync(expectedFile);

        assert.ok(actualExists);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("writes valid JSON with all required fields", () => {
      const tmpDir = makeTempDir();
      const inputSelections = { flavor: "lite" };
      const inputVersion = "2.0.0";
      const manifestPath = path.join(tmpDir, ".ai", ".sdg-manifest.json");

      try {
        writeManifest(tmpDir, inputSelections, inputVersion);

        const actualRaw = fileSystem.readFileSync(manifestPath, "utf8");
        const actual = JSON.parse(actualRaw);
        const actualGeneratedAt = actual.generatedAt;
        const actualSdgVersion = actual.sdgAgentVersion;
        const actualContentHashesIsObject =
          typeof actual.contentHashes === "object";

        const actualSelections = actual.selections;

        assert.ok(actualGeneratedAt);
        assert.equal(actualSdgVersion, inputVersion);
        assert.ok(actualContentHashesIsObject);
        assert.deepEqual(actualSelections, inputSelections);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("stores a valid ISO generatedAt timestamp", () => {
      const tmpDir = makeTempDir();
      const before = Date.now();
      const manifestPath = path.join(tmpDir, ".ai", ".sdg-manifest.json");

      try {
        writeManifest(tmpDir, { flavor: "lite" }, "1.0.0");

        const after = Date.now();
        const actualManifest = JSON.parse(
          fileSystem.readFileSync(manifestPath, "utf8"),
        );

        const actualTs = new Date(actualManifest.generatedAt).getTime();
        const actualTsInRange = actualTs >= before && actualTs <= after;

        assert.ok(actualTsInRange);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("buildMasterInstructions()", () => {
    const baseSelections = { flavor: "lite" };

    it("points at code-style.md and workflow.md in the header", () => {
      const expectedCodeStyleRef = ".ai/skills/code-style.md";
      const expectedWorkflowRef = ".ai/instructions/templates/workflow.md";

      const actual = buildMasterInstructions(baseSelections);
      const hasCodeStyleRef = actual.includes(expectedCodeStyleRef);
      const hasWorkflowRef = actual.includes(expectedWorkflowRef);

      assert.ok(hasCodeStyleRef);
      assert.ok(hasWorkflowRef);
    });

    it("does NOT reference removed staff-dna.md skill", () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasNoStaffDnaLink = !actual.includes("staff-dna.md");

      assert.ok(hasNoStaffDnaLink);
    });

    it("references .ai/backlog/stack.md in Session Start", () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasStackPointer = actual.includes(".ai/backlog/stack.md");

      assert.ok(
        hasStackPointer,
        "stack.md must appear as Phase CODE context source",
      );
    });

    it("references delivery.md (fused competency) and NOT the legacy split files", () => {
      const actual = buildMasterInstructions(baseSelections);

      const hasDeliveryRef = actual.includes(
        ".ai/instructions/competencies/delivery.md",
      );

      const hasNoBackendSplit = !actual.includes("competencies/backend.md");
      const hasNoFrontendSplit = !actual.includes("competencies/frontend.md");

      assert.ok(
        hasDeliveryRef,
        "delivery.md must replace the split backend/frontend competencies",
      );

      assert.ok(
        hasNoBackendSplit,
        "legacy backend.md reference must not resurface",
      );

      assert.ok(
        hasNoFrontendSplit,
        "legacy frontend.md reference must not resurface",
      );
    });

    it("does NOT reference the removed idioms directory", () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasNoIdiomsRef = !actual.match(/idioms\/[a-z-]+\/patterns\.md/);
      const hasNoIdiomsHeader = !actual.includes("Stack idioms");

      assert.ok(hasNoIdiomsRef, "static idiom paths must not resurface");
      assert.ok(
        hasNoIdiomsHeader,
        "Stack idioms header must be replaced by Stack context",
      );
    });

    it("includes Semantic Router with all cycle triggers", () => {
      const expectedSubstrings = [
        "## Semantic Router",
        "feat:",
        "fix:",
        "docs:",
        "audit:",
        "land:",
        "end:",
      ];

      const actual = buildMasterInstructions(baseSelections);

      for (const expected of expectedSubstrings) {
        const hasExpectedTrigger = actual.includes(expected);

        assert.ok(hasExpectedTrigger, `Missing: ${expected}`);
      }
    });

    it("includes Phase CODE skill loading section", () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasPhaseCodeHeader = actual.includes("## Phase CODE");

      assert.ok(hasPhaseCodeHeader);
    });

    it("classifies testing/security/observability/visual-density as surgical skills", () => {
      const actual = buildMasterInstructions(baseSelections);

      const hasSurgicalHeader = actual.includes("**Surgical**");
      const hasTestingSkill = actual.includes("testing.md");
      const hasSecuritySkill = actual.includes("security.md");
      const hasObservabilitySkill = actual.includes("observability.md");
      const hasVisualDensitySkill = actual.includes("visual-density.md");

      assert.ok(hasSurgicalHeader);
      assert.ok(hasTestingSkill);
      assert.ok(hasSecuritySkill);
      assert.ok(hasObservabilitySkill);
      assert.ok(hasVisualDensitySkill);
    });

    it("unconditionally includes Agent Roles block", () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasAgentRolesHeader = actual.includes("## Agent Roles");
      const hasAgentRolesLink = actual.includes("agent-roles.md");

      assert.ok(hasAgentRolesHeader);
      assert.ok(hasAgentRolesLink);
    });

    it("does NOT include DNA-GATE or Working Protocol inline blocks", () => {
      const actual = buildMasterInstructions(baseSelections);
      const hasNoDnaGateBlock = !actual.includes("DNA-GATE & MENTAL RESET");
      const hasNoPhaseBanner = !actual.includes("PHASE EXECUTION IS MANDATORY");
      const hasNoWorkingProtocolBlock = !actual.includes("## Working Protocol");

      assert.ok(hasNoDnaGateBlock);
      assert.ok(hasNoPhaseBanner);
      assert.ok(hasNoWorkingProtocolBlock);
    });
  });

  describe("Token Budget Guard", () => {
    const WORST_CASE_INPUT = { flavor: "vertical-slice" };
    const TOKEN_BUDGET_BYTES = 2700;

    it(`should stay under ${TOKEN_BUDGET_BYTES} bytes`, () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);
      const actualBytes = Buffer.byteLength(actual, "utf8");

      const isWithinTokenBudget = actualBytes <= TOKEN_BUDGET_BYTES;
      const tokenLeakMessage = `Token leak detected: ${actualBytes} bytes (budget: ${TOKEN_BUDGET_BYTES}).`;

      assert.ok(isWithinTokenBudget, tokenLeakMessage);
    });

    it("does not duplicate any file path reference", () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);
      const pathMatches = actual.match(/`\.ai\/[^`]+\.md`/g) || [];

      const uniquePaths = new Set(pathMatches);
      const actualPathCount = pathMatches.length;
      const expectedUniqueCount = uniquePaths.size;

      assert.equal(actualPathCount, expectedUniqueCount);
    });

    it("does not contain verbose protocol patterns", () => {
      const actual = buildMasterInstructions(WORST_CASE_INPUT);

      const forbiddenPatterns = [
        "SOVEREIGN PROTOCOL",
        "PHASE EXECUTION IS MANDATORY",
        "DNA-GATE",
        "Engineering Laws",
        "[!IMPORTANT]",
        "[!CAUTION]",
      ];

      for (const pattern of forbiddenPatterns) {
        const isPatternAbsent = !actual.includes(pattern);

        assert.ok(isPatternAbsent, `Verbose pattern leaked: "${pattern}"`);
      }
    });
  });

  describe("writeToolingAssets()", () => {
    it("copies tooling directory into .ai/tooling/ preserving structure", () => {
      const tmpDir = makeTempDir();
      const expectedFiles = [
        path.join(".ai", "tooling", "scripts", "prune-backlog.mjs"),
        path.join(".ai", "tooling", "scripts", "bump-version.mjs"),
        path.join(".ai", "tooling", "husky", "pre-commit"),
        path.join(".ai", "tooling", "husky", "commit-msg"),
        path.join(".ai", "tooling", "README.md"),
      ];

      try {
        writeToolingAssets(tmpDir);

        for (const relativePath of expectedFiles) {
          const absolutePath = path.join(tmpDir, relativePath);
          const fileExists = fileSystem.existsSync(absolutePath);

          assert.ok(fileExists, `Missing tooling asset: ${relativePath}`);
        }
      } finally {
        cleanup(tmpDir);
      }
    });

    it("marks husky hooks as executable", () => {
      const tmpDir = makeTempDir();
      const hookNames = ["pre-commit", "commit-msg"];
      const expectedPermissionMask = 0o100;

      try {
        writeToolingAssets(tmpDir);

        for (const hookName of hookNames) {
          const hookPath = path.join(
            tmpDir,
            ".ai",
            "tooling",
            "husky",
            hookName,
          );

          const stats = fileSystem.statSync(hookPath);

          const actualPermissionBits = stats.mode & 0o111;
          const isExecutable =
            (actualPermissionBits & expectedPermissionMask) !== 0;

          assert.ok(isExecutable, `Hook not executable: ${hookName}`);
        }
      } finally {
        cleanup(tmpDir);
      }
    });

    it("is idempotent when invoked twice", () => {
      const tmpDir = makeTempDir();
      const referencePath = path.join(tmpDir, ".ai", "tooling", "README.md");

      try {
        writeToolingAssets(tmpDir);
        const firstRunContent = fileSystem.readFileSync(referencePath, "utf8");

        writeToolingAssets(tmpDir);
        const secondRunContent = fileSystem.readFileSync(referencePath, "utf8");

        assert.equal(firstRunContent, secondRunContent);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("writeBacklogFiles()", () => {
    it("includes Tooling (optional) section in generated context.md", () => {
      const tmpDir = makeTempDir();
      const contextPath = path.join(tmpDir, ".ai", "backlog", "context.md");

      try {
        writeBacklogFiles(tmpDir, { flavor: "lite" });
        const actualContent = fileSystem.readFileSync(contextPath, "utf8");
        const actualHasToolingSection = actualContent.includes(
          "## Tooling (optional)",
        );

        const actualHasToolingPath = actualContent.includes(".ai/tooling/");

        assert.ok(actualHasToolingSection);
        assert.ok(actualHasToolingPath);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("keeps the Now objective in tasks.md and out of context.md", () => {
      const tmpDir = makeTempDir();
      const contextPath = path.join(tmpDir, ".ai", "backlog", "context.md");
      const tasksPath = path.join(tmpDir, ".ai", "backlog", "tasks.md");

      try {
        writeBacklogFiles(tmpDir, { flavor: "lite" });

        const contextContent = fileSystem.readFileSync(contextPath, "utf8");
        const tasksContent = fileSystem.readFileSync(tasksPath, "utf8");

        const actualContextHasNow = contextContent.includes("## Now");
        const expectedContextHasNow = false;
        const actualTasksHasNow = tasksContent.includes("## Now");
        const expectedTasksHasNow = true;

        assert.equal(actualContextHasNow, expectedContextHasNow);
        assert.equal(actualTasksHasNow, expectedTasksHasNow);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("writes .ai/backlog/stack.md placeholder when missing", () => {
      const tmpDir = makeTempDir();
      const stackPath = path.join(tmpDir, ".ai", "backlog", "stack.md");

      try {
        writeBacklogFiles(tmpDir, { flavor: "lite" });

        const actualExists = fileSystem.existsSync(stackPath);

        assert.ok(actualExists, "stack.md seed must be written on init");

        const actualContent = fileSystem.readFileSync(stackPath, "utf8");
        const actualHasProjectStack = actualContent.includes("# Project Stack");
        const actualHasBackend = actualContent.includes("### Backend");
        const actualHasFrontend = actualContent.includes("### Frontend");

        assert.ok(actualHasProjectStack);
        assert.ok(actualHasBackend);
        assert.ok(actualHasFrontend);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("never overwrites an existing .ai/backlog/stack.md", () => {
      const tmpDir = makeTempDir();
      const backlogDir = path.join(tmpDir, ".ai", "backlog");
      const stackPath = path.join(backlogDir, "stack.md");
      const preexistingContent = "# Custom Stack\n\n- Node 24\n";

      try {
        fileSystem.mkdirSync(backlogDir, { recursive: true });
        fileSystem.writeFileSync(stackPath, preexistingContent);

        writeBacklogFiles(tmpDir, { flavor: "lite" });

        const actualContent = fileSystem.readFileSync(stackPath, "utf8");

        assert.equal(actualContent, preexistingContent);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("writeGitignore()", () => {
    it("ignores volatile session state only", () => {
      const tmpDir = makeTempDir();

      try {
        writeGitignore(tmpDir);

        const actualContent = readGitignore(tmpDir);
        const actualMissing = VOLATILE_ENTRIES.filter(
          (entry) => !actualContent.includes(entry),
        );

        const expectedMissing = [];

        assert.deepEqual(actualMissing, expectedMissing);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("never ignores the backlog as a whole", () => {
      const tmpDir = makeTempDir();

      try {
        writeGitignore(tmpDir);

        const actualLines = readGitignore(tmpDir).split("\n");
        const actualHasBlanketEntry = actualLines.includes(".ai/backlog/");

        const expectedHasBlanketEntry = false;

        assert.equal(
          actualHasBlanketEntry,
          expectedHasBlanketEntry,
          "a blanket .ai/backlog/ entry discards versioned team knowledge",
        );
      } finally {
        cleanup(tmpDir);
      }
    });

    it("leaves every knowledge file versioned", () => {
      const tmpDir = makeTempDir();

      try {
        writeGitignore(tmpDir);

        const actualContent = readGitignore(tmpDir);
        const actualIgnored = VERSIONED_BACKLOG_FILES.filter((fileName) =>
          actualContent.includes(fileName),
        );

        const expectedIgnored = [];

        assert.deepEqual(actualIgnored, expectedIgnored);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("preserves a pre-existing .gitignore that lacks a trailing newline", () => {
      const tmpDir = makeTempDir();
      const preexistingContent = ["node_modules/", "dist/"].join("\n");

      try {
        fileSystem.writeFileSync(gitignorePathOf(tmpDir), preexistingContent);

        writeGitignore(tmpDir);

        const actualContent = readGitignore(tmpDir);
        const actualStartsWithOriginal =
          actualContent.startsWith(preexistingContent);

        const expectedStartsWithOriginal = true;

        assert.equal(actualStartsWithOriginal, expectedStartsWithOriginal);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("appends missing entries without repeating a present header", () => {
      const tmpDir = makeTempDir();
      const preexistingContent = [
        "# AI artifacts — session state, not project logic",
        "tmp/",
        "",
      ].join("\n");

      try {
        fileSystem.writeFileSync(gitignorePathOf(tmpDir), preexistingContent);

        writeGitignore(tmpDir);

        const actualHeaderCount = countOccurrences(
          readGitignore(tmpDir),
          "# AI artifacts — session state, not project logic",
        );

        const expectedHeaderCount = 1;

        assert.equal(actualHeaderCount, expectedHeaderCount);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("is idempotent across repeated init runs", () => {
      const tmpDir = makeTempDir();

      try {
        writeGitignore(tmpDir);

        const contentAfterFirstRun = readGitignore(tmpDir);

        writeGitignore(tmpDir);

        const actualContent = readGitignore(tmpDir);
        const expectedContent = contentAfterFirstRun;

        assert.equal(actualContent, expectedContent);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("removeGeneratedInstructions()", () => {
    it("deletes legacy .ai/instructions/idioms/ tree", () => {
      const tmpDir = makeTempDir();
      const staleDir = path.join(tmpDir, ".ai", "instructions", "idioms");
      const staleFile = path.join(staleDir, "typescript", "patterns.md");

      try {
        fileSystem.mkdirSync(path.dirname(staleFile), { recursive: true });
        fileSystem.writeFileSync(staleFile, "# stale");

        removeGeneratedInstructions(tmpDir);

        const staleStillExists = fileSystem.existsSync(staleDir);
        const expectedAbsent = false;

        assert.equal(
          staleStillExists,
          expectedAbsent,
          "stale idioms dir must be removed",
        );
      } finally {
        cleanup(tmpDir);
      }
    });

    it("is a no-op when no stale idioms exist", () => {
      const tmpDir = makeTempDir();

      try {
        assert.doesNotThrow(() => removeGeneratedInstructions(tmpDir));
      } finally {
        cleanup(tmpDir);
      }
    });
  });
});
