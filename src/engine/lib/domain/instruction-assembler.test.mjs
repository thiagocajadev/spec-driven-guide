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
  findManagedRootFiles,
  writeGitignore,
  writeManifest,
  writeToolingAssets,
  writeAutomationScripts,
  writeBacklogFiles,
} = InstructionAssembler;

const VOLATILE_ENTRIES = [
  ".ai/kit/",
  ".ai/backlog/session.md",
  ".ai/backlog/impact-map.md",
];

const VERSIONED_BACKLOG_FILES = [
  "context.md",
  "stack.md",
  "learned.md",
  "troubleshoot.md",
];

const GENERATED_AGENTS = [
  "# Staff Engineer: Governance Command Center",
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

const LEGACY_AGENTS = [
  "# Staff Engineer — Governance Command Center",
  "",
  "> Emitted before the punctuation sweep replaced the em dash.",
  "",
].join("\n");

const CURRENT_CLAUDE_POINTER = [
  "# SDG Agents: Claude Code Governance",
  "",
  "@AGENTS.md",
  "",
].join("\n");

const LEGACY_CLAUDE_POINTER = [
  "# SDG Agents — Claude Code Governance",
  "",
  "@AGENTS.md",
  "",
].join("\n");

const FOREIGN_CLAUDE = ["# Team Claude Notes", "", "Hand-maintained.", ""].join(
  "\n",
);

const IMPORTING_CLAUDE = ["@AGENTS.md", "", "## Claude Code", ""].join("\n");

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

    it("never writes a CLAUDE.md, since Claude Code reads AGENTS.md", () => {
      const tmpDir = makeTempDir();
      const claudePath = path.join(tmpDir, "CLAUDE.md");

      try {
        const configOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualExists = fileSystem.existsSync(claudePath);
        const actualOutcome = configOutcome.claude;
        const expectedExists = false;
        const expectedOutcome = "absent";

        assert.equal(actualExists, expectedExists);
        assert.equal(actualOutcome, expectedOutcome);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("reports unchanged when re-run over its own output", () => {
      const tmpDir = makeTempDir();

      try {
        writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);
        const expectedOutcome = { agents: "unchanged", claude: "absent" };

        assert.deepEqual(actualOutcome, expectedOutcome);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("rewrites an AGENTS.md carrying the pre-sweep em dash sentinel", () => {
      const tmpDir = makeTempDir();
      const agentsPath = path.join(tmpDir, "AGENTS.md");
      const sidecarPath = path.join(tmpDir, "AGENTS.sdg.md");
      fileSystem.writeFileSync(agentsPath, LEGACY_AGENTS);

      try {
        const configOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualContent = fileSystem.readFileSync(agentsPath, "utf8");
        const hasSidecar = fileSystem.existsSync(sidecarPath);
        const actualOutcome = configOutcome.agents;
        const expectedOutcome = "written";
        const expectedSidecar = false;

        assert.equal(actualContent, GENERATED_AGENTS);
        assert.equal(hasSidecar, expectedSidecar);
        assert.equal(actualOutcome, expectedOutcome);
      } finally {
        cleanup(tmpDir);
      }
    });

    for (const [label, pointer] of [
      ["current", CURRENT_CLAUDE_POINTER],
      ["pre-sweep em dash", LEGACY_CLAUDE_POINTER],
    ]) {
      it(`removes the CLAUDE.md pointer carrying the ${label} title`, () => {
        const tmpDir = makeTempDir();
        const claudePath = path.join(tmpDir, "CLAUDE.md");
        fileSystem.writeFileSync(claudePath, pointer);

        try {
          const configOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);

          const actualExists = fileSystem.existsSync(claudePath);
          const actualOutcome = configOutcome.claude;
          const expectedExists = false;
          const expectedOutcome = "removed";

          assert.equal(actualExists, expectedExists);
          assert.equal(actualOutcome, expectedOutcome);
        } finally {
          cleanup(tmpDir);
        }
      });
    }

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

    it("preserves a foreign CLAUDE.md and reports that it hides AGENTS.md", () => {
      const tmpDir = makeTempDir();
      const claudePath = path.join(tmpDir, "CLAUDE.md");
      fileSystem.writeFileSync(claudePath, FOREIGN_CLAUDE);

      try {
        const configOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualPreserved = fileSystem.readFileSync(claudePath, "utf8");
        const actualOutcome = configOutcome.claude;
        const expectedOutcome = "shadowing";

        assert.equal(actualPreserved, FOREIGN_CLAUDE);
        assert.equal(actualOutcome, expectedOutcome);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("preserves a foreign CLAUDE.md that already imports AGENTS.md", () => {
      const tmpDir = makeTempDir();
      const claudePath = path.join(tmpDir, "CLAUDE.md");
      fileSystem.writeFileSync(claudePath, IMPORTING_CLAUDE);

      try {
        const configOutcome = writeAgentConfig(tmpDir, GENERATED_AGENTS);

        const actualPreserved = fileSystem.readFileSync(claudePath, "utf8");
        const actualOutcome = configOutcome.claude;
        const expectedOutcome = "imports";

        assert.equal(actualPreserved, IMPORTING_CLAUDE);
        assert.equal(actualOutcome, expectedOutcome);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("findManagedRootFiles()", () => {
    it("lists the root files the CLI wrote and never a hand-written one", () => {
      const tmpDir = makeTempDir();
      fileSystem.writeFileSync(
        path.join(tmpDir, "AGENTS.md"),
        GENERATED_AGENTS,
      );

      fileSystem.writeFileSync(
        path.join(tmpDir, "CLAUDE.md"),
        LEGACY_CLAUDE_POINTER,
      );

      try {
        const actualFiles = findManagedRootFiles(tmpDir);
        const expectedFiles = ["AGENTS.md", "CLAUDE.md"];

        assert.deepEqual(actualFiles, expectedFiles);

        fileSystem.writeFileSync(
          path.join(tmpDir, "CLAUDE.md"),
          FOREIGN_CLAUDE,
        );

        const actualAfterForeign = findManagedRootFiles(tmpDir);
        const expectedAfterForeign = ["AGENTS.md"];

        assert.deepEqual(actualAfterForeign, expectedAfterForeign);
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
      const expectedCodeStyleRef = ".ai/kit/skills/code-style.md";
      const expectedWorkflowRef = ".ai/kit/instructions/templates/workflow.md";

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
        ".ai/kit/instructions/competencies/delivery.md",
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
    /**
     * why: raised from 2700 when the Persistence Policy landed. That section is
     * the one rule that has to outrank a harness default, which puts it in the
     * always-loaded router rather than in a skill loaded on demand. The budget
     * moved by what the section costs and by nothing else: the guard exists to
     * stop the router drifting back into a knowledge dump.
     *
     * why: raised again from 3000 when `.ai/` split by ownership. Twenty-three
     * routed paths gained the `kit/` segment, and the router states each one in
     * full because an agent follows an explicit path more reliably than a root
     * declared once and a bare filename after it. Sixty-nine bytes is what that
     * reliability costs in the always-loaded file, and it buys the whole tree
     * leaving version control.
     */
    const TOKEN_BUDGET_BYTES = 3200;

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

  describe("writeAutomationScripts()", () => {
    it("installs the kit's own bump as scripts/bump.mjs", () => {
      const tmpDir = makeTempDir();
      const packagePath = path.join(tmpDir, "package.json");
      const packageData = { name: "consumer", version: "1.0.0" };
      fileSystem.writeFileSync(packagePath, JSON.stringify(packageData));

      const toolingBumpPath = path.join(
        currentDirectory,
        "../../../assets/tooling/scripts/bump.mjs",
      );

      try {
        writeAutomationScripts(tmpDir, { bump: true });

        const expectedScript = fileSystem.readFileSync(toolingBumpPath, "utf8");
        const installedPath = path.join(tmpDir, "scripts", "bump.mjs");
        const actualScript = fileSystem.readFileSync(installedPath, "utf8");
        const expectedCommand = "node scripts/bump.mjs";
        const actualCommand = JSON.parse(
          fileSystem.readFileSync(packagePath, "utf8"),
        ).scripts.bump;

        assert.equal(actualScript, expectedScript);
        assert.equal(actualCommand, expectedCommand);
      } finally {
        cleanup(tmpDir);
      }
    });
  });

  describe("writeToolingAssets()", () => {
    it("copies tooling directory into .ai/kit/tooling/ preserving structure", () => {
      const tmpDir = makeTempDir();
      const expectedFiles = [
        path.join(".ai", "kit", "tooling", "scripts", "prune-backlog.mjs"),
        path.join(".ai", "kit", "tooling", "scripts", "bump.mjs"),
        path.join(".ai", "kit", "tooling", "husky", "pre-commit"),
        path.join(".ai", "kit", "tooling", "husky", "commit-msg"),
        path.join(".ai", "kit", "tooling", "README.md"),
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

    /**
     * why: Windows has no execute bit, so `chmod` succeeds and `stat` reports
     * the hook as plain. Git records the mode from a POSIX checkout.
     */
    it(
      "marks husky hooks as executable",
      { skip: process.platform === "win32" },
      () => {
        const tmpDir = makeTempDir();
        const hookNames = ["pre-commit", "commit-msg"];
        const expectedPermissionMask = 0o100;

        try {
          writeToolingAssets(tmpDir);

          for (const hookName of hookNames) {
            const hookPath = path.join(
              tmpDir,
              ".ai",
              "kit",
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
      },
    );

    it("is idempotent when invoked twice", () => {
      const tmpDir = makeTempDir();
      const referencePath = path.join(
        tmpDir,
        ".ai",
        "kit",
        "tooling",
        "README.md",
      );

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

        const actualHasToolingPath = actualContent.includes(".ai/kit/tooling/");

        assert.ok(actualHasToolingSection);
        assert.ok(actualHasToolingPath);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("keeps the Now objective in session.md, out of tasks.md and context.md", () => {
      const tmpDir = makeTempDir();
      const contextPath = path.join(tmpDir, ".ai", "backlog", "context.md");
      const tasksPath = path.join(tmpDir, ".ai", "backlog", "tasks.md");
      const sessionPath = path.join(tmpDir, ".ai", "backlog", "session.md");

      try {
        writeBacklogFiles(tmpDir, { flavor: "lite" });

        const contextContent = fileSystem.readFileSync(contextPath, "utf8");
        const tasksContent = fileSystem.readFileSync(tasksPath, "utf8");
        const sessionContent = fileSystem.readFileSync(sessionPath, "utf8");

        const actualContextHasNow = contextContent.includes("## Now");
        const expectedContextHasNow = false;
        const actualTasksHasNow = tasksContent.includes("## Now");
        const expectedTasksHasNow = false;
        const actualSessionHasNow = sessionContent.includes("## Now");
        const expectedSessionHasNow = true;

        assert.equal(actualContextHasNow, expectedContextHasNow);
        assert.equal(actualTasksHasNow, expectedTasksHasNow);
        assert.equal(actualSessionHasNow, expectedSessionHasNow);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("keeps the durable queue in tasks.md, out of session.md", () => {
      const tmpDir = makeTempDir();
      const tasksPath = path.join(tmpDir, ".ai", "backlog", "tasks.md");
      const sessionPath = path.join(tmpDir, ".ai", "backlog", "session.md");

      try {
        writeBacklogFiles(tmpDir, { flavor: "lite" });

        const tasksContent = fileSystem.readFileSync(tasksPath, "utf8");
        const sessionContent = fileSystem.readFileSync(sessionPath, "utf8");

        const actualTasksHasBacklog = tasksContent.includes("## Backlog");
        const expectedTasksHasBacklog = true;
        const actualTasksHasDone = tasksContent.includes("## Done");
        const expectedTasksHasDone = true;
        const actualSessionHasBacklog = sessionContent.includes("## Backlog");
        const expectedSessionHasBacklog = false;

        assert.equal(actualTasksHasBacklog, expectedTasksHasBacklog);
        assert.equal(actualTasksHasDone, expectedTasksHasDone);
        assert.equal(actualSessionHasBacklog, expectedSessionHasBacklog);
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
        "# AI artifacts: session state, not project logic",
        "tmp/",
        "",
      ].join("\n");

      try {
        fileSystem.writeFileSync(gitignorePathOf(tmpDir), preexistingContent);

        writeGitignore(tmpDir);

        const actualHeaderCount = countOccurrences(
          readGitignore(tmpDir),
          "# AI artifacts: session state, not project logic",
        );

        const expectedHeaderCount = 1;

        assert.equal(actualHeaderCount, expectedHeaderCount);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("reclaims the pre-v6 blanket backlog entry", () => {
      const tmpDir = makeTempDir();
      const legacyContent = [
        "node_modules/",
        "",
        "# AI artifacts — session state, not project logic",
        ".ai/backlog/",
        ".ai/last-prompt.md",
        "",
      ].join("\n");

      try {
        fileSystem.writeFileSync(gitignorePathOf(tmpDir), legacyContent);

        writeGitignore(tmpDir);

        const actualLines = readGitignore(tmpDir).split("\n");
        const actualHasBlanketEntry = actualLines.includes(".ai/backlog/");
        const expectedHasBlanketEntry = false;

        assert.equal(
          actualHasBlanketEntry,
          expectedHasBlanketEntry,
          "the pre-v6 line keeps learned.md and troubleshoot.md out of git",
        );
      } finally {
        cleanup(tmpDir);
      }
    });

    it("preserves lines the developer wrote outside the block", () => {
      const tmpDir = makeTempDir();
      const developerLines = ["node_modules/", "coverage/", "*.tsbuildinfo"];

      try {
        fileSystem.writeFileSync(
          gitignorePathOf(tmpDir),
          `${developerLines.join("\n")}\n`,
        );

        writeGitignore(tmpDir);
        // eslint-disable-next-line local/duplicate-consecutive-statement -- the second run is the assertion: an update must not eat the body it found.
        writeGitignore(tmpDir);

        const actualContent = readGitignore(tmpDir);
        const actualMissing = developerLines.filter(
          (line) => !actualContent.includes(line),
        );

        const expectedMissing = [];

        assert.deepEqual(actualMissing, expectedMissing);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("takes no position on another tool's directory", () => {
      const tmpDir = makeTempDir();
      const legacyContent = [
        "# Runtime scratch: the harness writes it, the repository never carries it",
        ".claude/",
        "",
      ].join("\n");

      try {
        fileSystem.writeFileSync(gitignorePathOf(tmpDir), legacyContent);
        writeGitignore(tmpDir);

        const actualContent = readGitignore(tmpDir);
        const actualIgnoresVendor = actualContent.includes(".claude/");
        const expectedIgnoresVendor = false;

        assert.equal(actualIgnoresVendor, expectedIgnoresVendor);
      } finally {
        cleanup(tmpDir);
      }
    });

    it("never ignores a vendor directory holding prescribed files", () => {
      const tmpDir = makeTempDir();
      const PRESCRIBED_ROOTS = [".cursor/", ".kiro/", ".windsurf/", ".gemini/"];

      try {
        writeGitignore(tmpDir);

        const actualLines = readGitignore(tmpDir).split("\n");
        const actualIgnored = PRESCRIBED_ROOTS.filter((entry) =>
          actualLines.includes(entry),
        );

        const expectedIgnored = [];

        assert.deepEqual(
          actualIgnored,
          expectedIgnored,
          "the README asks for a committed file inside .cursor/, and Kiro versions .kiro/",
        );
      } finally {
        cleanup(tmpDir);
      }
    });

    it("writes one managed block however many times it runs", () => {
      const tmpDir = makeTempDir();

      try {
        writeGitignore(tmpDir);
        // eslint-disable-next-line local/duplicate-consecutive-statement -- three runs, one block: the repetition is what idempotency means here.
        writeGitignore(tmpDir);
        // eslint-disable-next-line local/duplicate-consecutive-statement -- see above.
        writeGitignore(tmpDir);

        const actualMarkerCount = countOccurrences(
          readGitignore(tmpDir),
          "# >>> spec-driven-guide, managed block",
        );

        const expectedMarkerCount = 1;

        assert.equal(actualMarkerCount, expectedMarkerCount);
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
});
