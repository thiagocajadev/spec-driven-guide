/**
 * Instruction Assembler: Builds and writes the final master instructions.
 * Assembles agent config files and the project manifest.
 */

import fileSystem from "node:fs";
import path from "node:path";
import dedent from "dedent";

import { DisplayUtils } from "../core/display-utils.mjs";
import { ManifestUtils } from "./manifest-utils.mjs";
import { FsUtils } from "../core/fs-utils.mjs";
import { KitEmission } from "./kit-emission.mjs";

const { displayName } = DisplayUtils;
const { computeHashes, loadManifest } = ManifestUtils;
const { getDirname, writeJsonAtomic, safeReadJson } = FsUtils;
const { resolveKitPath } = KitEmission;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(
  __dirname,
  "../../..",
  "assets",
  "instructions",
);

// Ownership markers: the canonical title line each generated file always
// carries. Their absence means the developer wrote the file, so we leave it.
const AGENTS_SENTINEL = "# Staff Engineer: Governance Command Center";
const CLAUDE_SENTINEL = "# SDG Agents: Claude Code Governance";

/**
 * why: both titles carried an em dash until the punctuation sweep replaced it.
 * A project installed before that release still holds the old line on disk, and
 * matching only the current sentinel would read it as a file the developer
 * wrote, emitting a sidecar instead of the update the developer asked for.
 * The em dash below is stored data, not prose, and stays for that reason.
 */
const LEGACY_SENTINELS = [
  "# Staff Engineer — Governance Command Center",
  "# SDG Agents — Claude Code Governance",
];
const AGENTS_SIDECAR_NAME = "AGENTS.sdg.md";

/**
 * Canonical skill catalog: single source of truth for AGENTS.md rendering.
 * All skills are always listed; the agent self-filters per task domain via the
 * category header ("Backend", "Frontend", "Surgical"). Stack specificity now
 * lives in `.ai/backlog/stack.md`, declared by the developer during `land:`.
 */
const SKILL_CATALOG = [
  {
    path: ".ai/kit/skills/code-style.md",
    category: "core",
    description: "Code Style & Standards",
  },
  {
    path: ".ai/kit/instructions/competencies/delivery.md",
    category: "delivery",
    description: "BFF envelope + Frontend contract execution",
  },
  {
    path: ".ai/kit/skills/api-design.md",
    category: "backend",
    description: "API Design",
  },
  {
    path: ".ai/kit/skills/data-access.md",
    category: "backend",
    description: "DB layer",
  },
  {
    path: ".ai/kit/skills/sql-style.md",
    category: "backend",
    description: "SQL queries",
  },
  {
    path: ".ai/kit/skills/ci-cd.md",
    category: "backend",
    description: "Pipelines & deploy",
  },
  {
    path: ".ai/kit/skills/cloud.md",
    category: "backend",
    description: "Cloud & Containers",
  },
  {
    path: ".ai/kit/skills/ui-ux.md",
    category: "frontend",
    description: "UI/UX design system & writing voice",
  },
  {
    path: ".ai/kit/skills/testing.md",
    category: "surgical",
    description: "test creation or modification",
  },
  {
    path: ".ai/kit/skills/security.md",
    category: "surgical",
    description: "auth, validation, secrets",
  },
  {
    path: ".ai/kit/skills/observability.md",
    category: "surgical",
    description: "logging, metrics, tracing",
  },
  {
    path: ".ai/kit/skills/review.md",
    category: "surgical",
    description: "PR craft + reviewer checklist",
  },
  {
    path: ".ai/kit/skills/performance.md",
    category: "surgical",
    description: "Big-O budget, hot paths, profiling",
  },
  {
    path: ".ai/kit/skills/domain.md",
    category: "surgical",
    description: "DDD-Lite: aggregates, VOs, ubiquitous language",
  },
  {
    path: ".ai/kit/skills/visual-density.md",
    category: "surgical",
    description: "Visual density in depth (core rule always on)",
  },
  {
    path: ".ai/kit/skills/writing-soul.md",
    category: "surgical",
    description: "voice for UI copy, docs, commits",
  },
];

/**
 * Assembles the master instruction as a compact Semantic Router.
 * No inline protocol text, only routing triggers and file references.
 * Skills are loaded on-demand by Phase CODE, matched to task domain.
 */
function buildMasterInstructions(selections) {
  const header = buildHeader();
  const sessionStart = buildSessionStart();
  const persistencePolicy = buildPersistencePolicy();
  const semanticRouter = buildSemanticRouter();
  const skillRouter = buildSkillRouter(selections);
  const agentRoles = buildAgentRoles();

  const fullInstructionContent = [
    header,
    sessionStart,
    persistencePolicy,
    semanticRouter,
    skillRouter,
    agentRoles,
  ].join("\n\n");

  return fullInstructionContent;

  function buildHeader() {
    const headerString = dedent`
      # Staff Engineer: Governance Command Center

      > Code style and quality gates live in code-style.md.
      > Cycle phases live in workflow.md.`;

    return headerString;
  }

  function buildSessionStart() {
    const sessionStartString = dedent`
      ## Session Start

      1. Read \`.ai/backlog/context.md\`: project brief. If missing, generate from \`package.json\` + \`README.md\`.
      2. Read \`.ai/backlog/stack.md\`: developer-curated stack declarations.
      3. Read \`.ai/backlog/session.md\`: \`## Now\` holds the objective; check for \`[IN_PROGRESS]\`. If found: load workflow.md and resume. The queue behind it is \`tasks.md\`.`;

    return sessionStartString;
  }

  function buildPersistencePolicy() {
    const policyString = dedent`
      ## Persistence Policy

      > Memory belongs to the repository, not to the machine.

      - What this project taught: \`.ai/backlog/learned.md\` (patterns) and \`.ai/backlog/troubleshoot.md\` (failures).
      - Harness memory store: only what no repository owns.
      - Never both. Two copies drift, and only one is in review.`;

    return policyString;
  }

  function buildSemanticRouter() {
    const routerString = dedent`
      ## Semantic Router

      > **Token gate**: load ONLY what's triggered. Never preload skills or protocol files.
      > All cycle triggers load \`.ai/kit/instructions/templates/workflow.md\` first. It defines all 5 phases (SPEC → PLAN → CODE → TEST → END).

      - \`feat:\` → \`.ai/kit/commands/sdg-feat.md\` → Execute Phase SPEC → STOP
      - \`fix:\` → \`.ai/kit/commands/sdg-fix.md\` → Execute Phase SPEC → STOP
      - \`docs:\` → \`.ai/kit/commands/sdg-docs.md\` → Execute Phase SPEC → STOP
      - \`audit:\` → \`.ai/kit/commands/sdg-audit.md\` → Execute Phase SPEC → STOP
      - \`land:\` → \`.ai/kit/commands/sdg-land.md\` → Execute Phase SPEC → STOP
      - \`end:\` → \`.ai/kit/commands/sdg-end.md\` → Execute Phase END
      - No prefix → Ask: "feat, fix, docs, audit, or land?"`;

    return routerString;
  }

  function buildSkillRouter(currentSelections) {
    const flavor = currentSelections.flavor;

    const groupedByCategory = groupSkills(SKILL_CATALOG);

    const sections = [
      "## Phase CODE: Skill Loading",
      "",
      "> Load on Phase CODE entry only. Match skills to task domain. Stack context lives in `stack.md`, already loaded at Session Start.",
      "",
    ];

    const categoryHeaders = {
      core: "**Core** (always in Phase CODE)",
      delivery: "**Delivery** (BFF + UI contract execution)",
      backend: "**Backend** (API, DB, infrastructure tasks)",
      frontend: "**Frontend** (UI, component tasks)",
      surgical: "**Surgical** (only if task directly touches domain)",
    };

    for (const category of [
      "core",
      "delivery",
      "backend",
      "frontend",
      "surgical",
    ]) {
      const skills = groupedByCategory[category];
      if (!skills || skills.length === 0) {
        continue;
      }

      sections.push(categoryHeaders[category]);
      for (const skill of skills) {
        sections.push(`- \`${skill.path}\`: ${skill.description}`);
      }

      sections.push("");
    }

    if (flavor && flavor !== "none") {
      sections.push(
        "**Architectural flavor**",
        `- \`.ai/kit/instructions/flavor/principles.md\`, Flavor: ${displayName(flavor)}`,
        "",
      );
    }

    const registryBlock = sections.join("\n").trimEnd();
    return registryBlock;
  }

  function groupSkills(skills) {
    const groups = {
      core: [],
      delivery: [],
      backend: [],
      frontend: [],
      surgical: [],
    };

    for (const skill of skills) {
      if (groups[skill.category]) {
        groups[skill.category].push(skill);
      }
    }

    const groupedResult = groups;
    return groupedResult;
  }

  function buildAgentRoles() {
    const agentRolesString = dedent`
      ## Agent Roles

      Read \`.ai/kit/instructions/templates/agent-roles.md\` for multi-agent handoff protocol.`;

    return agentRolesString;
  }
}

/**
 * Writes `.ai/backlog/{context,stack,tasks,learned,troubleshoot}.md` at the project root.
 * Only writes each file if it does not already exist, and never overwrites user content.
 */
function writeBacklogFiles(targetDirectory, selections) {
  const backlogDirectory = path.join(targetDirectory, ".ai", "backlog");
  fileSystem.mkdirSync(backlogDirectory, { recursive: true });

  writeContextFile(backlogDirectory, targetDirectory, selections);
  writeStackFile(backlogDirectory);
  writeTasksFile(backlogDirectory);
  writeSessionFile(backlogDirectory);
  writeLearnedFile(backlogDirectory);
  writeTroubleshootFile(backlogDirectory);

  function detectProjectLanguage(projectDirectory) {
    const packagePath = path.join(projectDirectory, "package.json");
    if (!fileSystem.existsSync(packagePath)) {
      const defaultLanguage = "en";
      return defaultLanguage;
    }

    try {
      const packageData = JSON.parse(
        fileSystem.readFileSync(packagePath, "utf8"),
      );

      const deps = {
        ...packageData.dependencies,
        ...packageData.devDependencies,
      };

      if (deps["i18next"] || deps["react-i18next"]) {
        const localesDir = path.join(projectDirectory, "src", "locales");
        if (
          fileSystem.existsSync(localesDir) &&
          fileSystem.readdirSync(localesDir).includes("pt-BR")
        ) {
          const matchedLang = "pt-BR";
          return matchedLang;
        }
      }

      if (
        packageData.description?.toLowerCase().includes("guia") ||
        packageData.description?.toLowerCase().includes("sistema")
      ) {
        const matchingDescriptionLang = "pt-BR";
        return matchingDescriptionLang;
      }
    } catch {
      const fallbackLang = "en";
      return fallbackLang;
    }

    const defaultLang = "en";
    return defaultLang;
  }

  function writeContextFile(
    backlogDirectoryPath,
    projectDirectory,
    currentSelections,
  ) {
    const contextPath = path.join(backlogDirectoryPath, "context.md");

    const language = detectProjectLanguage(projectDirectory);
    const partner = currentSelections.partner || {};
    const name =
      partner.name || (language === "pt-BR" ? "Dev Parceiro" : "Dev Partner");

    const role =
      partner.role || (language === "pt-BR" ? "Fundador/Dev" : "Founder/Dev");

    const firstName = name.split(" ")[0];
    const partnerInfo =
      language === "pt-BR"
        ? `${name} é o ${role}. Diga "Oi ${firstName}". Comunicação em Português Brasileiro.`
        : `${name} is the ${role}. Say "Hello ${firstName}". Communication in English.`;

    if (fileSystem.existsSync(contextPath)) {
      injectPartnerSection(contextPath, partnerInfo);
      return;
    }

    const templatePath = path.join(
      SOURCE_INSTRUCTIONS,
      "templates",
      "backlog",
      "context.md",
    );

    const projectName = path.basename(projectDirectory);
    let contextContent = fileSystem.readFileSync(templatePath, "utf8");
    contextContent = contextContent
      .replace("{{PROJECT_NAME}}", projectName)
      .replace(
        "{{STACK}}",
        "declared in .ai/backlog/stack.md (run `land:` to populate)",
      )
      .replace("{{PARTNER}}", partnerInfo);

    fileSystem.writeFileSync(contextPath, contextContent);
  }

  function injectPartnerSection(contextPath, partnerInfo) {
    const existingContent = fileSystem.readFileSync(contextPath, "utf8");
    if (existingContent.includes("## Partner")) {
      return;
    }

    const separator = existingContent.endsWith("\n") ? "" : "\n";
    const injection = `\n## Partner\n\n${partnerInfo}\n`;
    fileSystem.appendFileSync(contextPath, `${separator}${injection}`);
  }

  function writeStackFile(backlogDirectoryPath) {
    const stackPath = path.join(backlogDirectoryPath, "stack.md");
    if (fileSystem.existsSync(stackPath)) {
      return;
    }

    const templatePath = path.join(
      SOURCE_INSTRUCTIONS,
      "templates",
      "backlog",
      "stack.md",
    );

    if (!fileSystem.existsSync(templatePath)) {
      return;
    }

    fileSystem.copyFileSync(templatePath, stackPath);
  }

  function writeTasksFile(backlogDirectoryPath) {
    const tasksPath = path.join(backlogDirectoryPath, "tasks.md");
    if (fileSystem.existsSync(tasksPath)) {
      return;
    }

    const templatePath = path.join(
      SOURCE_INSTRUCTIONS,
      "templates",
      "backlog",
      "tasks.md",
    );

    fileSystem.copyFileSync(templatePath, tasksPath);
  }

  function writeSessionFile(backlogDirectoryPath) {
    const sessionPath = path.join(backlogDirectoryPath, "session.md");
    if (fileSystem.existsSync(sessionPath)) {
      return;
    }

    const templatePath = path.join(
      SOURCE_INSTRUCTIONS,
      "templates",
      "backlog",
      "session.md",
    );

    fileSystem.copyFileSync(templatePath, sessionPath);
  }

  function writeLearnedFile(backlogDirectoryPath) {
    const learnedPath = path.join(backlogDirectoryPath, "learned.md");
    if (fileSystem.existsSync(learnedPath)) {
      return;
    }

    const templatePath = path.join(
      SOURCE_INSTRUCTIONS,
      "templates",
      "backlog",
      "learned.md",
    );

    fileSystem.copyFileSync(templatePath, learnedPath);
  }

  function writeTroubleshootFile(backlogDirectoryPath) {
    const troubleshootPath = path.join(backlogDirectoryPath, "troubleshoot.md");
    if (fileSystem.existsSync(troubleshootPath)) {
      return;
    }

    const templatePath = path.join(
      SOURCE_INSTRUCTIONS,
      "templates",
      "backlog",
      "troubleshoot.md",
    );

    fileSystem.copyFileSync(templatePath, troubleshootPath);
  }
}

/**
 * Builds the Claude Code-specific CLAUDE.md content.
 * Uses @-import syntax so Claude Code loads governance files natively on session start.
 * Distinct from AGENTS.md: references rather than duplicates content.
 */
function buildClaudeContent() {
  const claudeContent = dedent`
    # SDG Agents: Claude Code Governance

    > [!IMPORTANT]
    > This file is read automatically by Claude Code on every session start.
    > Do not edit manually. Regenerate with \`npx spec-driven-guide init\`.

    ## Auto-Load: Governance Context

    @AGENTS.md
  `;

  const instructionSet = claudeContent;
  return instructionSet;
}

/**
 * Writes the universal agent config, both at the repo root where harnesses
 * discover them natively:
 *   - \`AGENTS.md\`: canonical governance (consumed by any AI agent).
 *   - \`CLAUDE.md\`: thin pointer auto-loaded by Claude Code.
 *
 * Returns the outcome per file so the caller can warn the developer about a
 * sidecar. Other IDEs (Cursor, Windsurf, Copilot, Gemini, Cline/Roo) should be
 * configured to read the root \`AGENTS.md\` directly. See README "Using with
 * other IDEs" for native pointers per tool.
 */
function writeAgentConfig(targetDirectory, content) {
  const agentsOutcome = writeManagedFile(
    path.join(targetDirectory, "AGENTS.md"),
    content,
    AGENTS_SENTINEL,
  );

  const claudeOutcome = writeManagedFile(
    path.join(targetDirectory, "CLAUDE.md"),
    buildClaudeContent(),
    CLAUDE_SENTINEL,
  );

  // A foreign AGENTS.md still gets the governance, just under another name.
  // CLAUDE.md gets no sidecar: Claude Code reads that exact filename or nothing.
  if (agentsOutcome === "foreign") {
    const sidecarPath = path.join(targetDirectory, AGENTS_SIDECAR_NAME);
    fileSystem.writeFileSync(sidecarPath, content);
  }

  removeLegacyAgentsFile(targetDirectory);

  const configOutcome = { agents: agentsOutcome, claude: claudeOutcome };
  return configOutcome;
}

/**
 * Deletes the pre-root copy at `.ai/skills/AGENTS.md`, left behind when a
 * project upgrades. Two copies is the drift this move exists to prevent.
 * Only a copy carrying our sentinel is removed.
 */
function removeLegacyAgentsFile(targetDirectory) {
  const legacyPath = path.join(targetDirectory, ".ai", "skills", "AGENTS.md");
  if (!fileSystem.existsSync(legacyPath)) {
    return;
  }

  const legacyContent = fileSystem.readFileSync(legacyPath, "utf8");
  const isManaged = hasManagedSentinel(legacyContent, AGENTS_SENTINEL);

  if (!isManaged) {
    return;
  }

  fileSystem.rmSync(legacyPath);
}

/**
 * Writes a file the CLI owns, recognising ownership by the canonical title line
 * it always emits. A file without that sentinel belongs to the developer and is
 * never touched.
 *
 * Returns \`written\`, \`unchanged\`, or \`foreign\`.
 */
function writeManagedFile(filePath, content, sentinel) {
  if (!fileSystem.existsSync(filePath)) {
    fileSystem.writeFileSync(filePath, content);

    const createdOutcome = "written";
    return createdOutcome;
  }

  const existingContent = fileSystem.readFileSync(filePath, "utf8");
  const isManaged = hasManagedSentinel(existingContent, sentinel);

  if (!isManaged) {
    const foreignOutcome = "foreign";
    return foreignOutcome;
  }

  if (existingContent === content) {
    const idempotentOutcome = "unchanged";
    return idempotentOutcome;
  }

  fileSystem.writeFileSync(filePath, content);

  const rewrittenOutcome = "written";
  return rewrittenOutcome;
}

/**
 * Ownership is recognised by the current title line or by any title the CLI
 * emitted in an earlier release, so an upgrade is never mistaken for a foreign
 * file.
 */
function hasManagedSentinel(content, sentinel) {
  const recognizedSentinels = [sentinel, ...LEGACY_SENTINELS];
  const isManaged = recognizedSentinels.some((known) =>
    content.includes(known),
  );

  return isManaged;
}

const MANAGED_BLOCK_START = "# >>> spec-driven-guide, managed block";
const MANAGED_BLOCK_END = "# <<< spec-driven-guide";

/**
 * The block is rewritten whole on every run, which is what lets an entry be
 * retired as easily as added. `.ai/` is split by ownership: the kit is written
 * by the CLI and regenerated from the manifest, so it never enters git, while
 * `.ai/backlog/` is the project's. Inside the backlog only the session pointer
 * and the blast-radius map are volatile; the task queue, context, stack,
 * learned and troubleshoot stay versioned as team knowledge.
 */
const MANAGED_BLOCKS = [
  {
    header: "# Environment: never commit secrets",
    entries: [".env", ".env.*"],
  },
  {
    header: "# SDG kit: written by the CLI, pinned by the manifest",
    entries: [".ai/kit/"],
  },
  {
    header: "# AI artifacts: session state, not project logic",
    entries: [
      ".ai/backlog/session.md",
      ".ai/backlog/impact-map.md",
      "tmp/",
      "temp/",
    ],
  },
];

/**
 * why: no vendor directory belongs in the block above, and `.claude/` was the
 * exception that proved the rule wrong. It holds `settings.json`, `commands/`
 * and `agents/`, which the developer writes and the team shares, so the blanket
 * entry discarded them the way the pre-v6 `.ai/backlog/` line discarded team
 * knowledge. `.cursor/` and `.kiro/` were spared on the same grounds. SDG
 * installs `.ai/` and takes no position on any other tool's directory.
 */

/**
 * why: `.ai/backlog/` was emitted before the volatility policy, and left in the
 * body it keeps learned.md and troubleshoot.md out of git in every project
 * installed before v6. `.ai/backlog/tasks.md` joins it for the opposite reason:
 * the queue and its record are durable now, and only the session pointer moved
 * out, so a line this block emitted for eight majors has to be taken back or it
 * keeps discarding what the split just made worth versioning. The two em dash
 * headers are stored data from before the punctuation sweep, kept for the same
 * reason the legacy sentinels are. `.ai/last-prompt.md` joins them because the
 * feature that wrote it was removed in v3 and the entry outlived it by six
 * majors, ignoring a file nothing has produced since.
 */
const LEGACY_GITIGNORE_LINES = [
  "# Environment — never commit secrets",
  "# AI artifacts — session state, not project logic",
  ".ai/backlog/",
  ".ai/backlog/tasks.md",
  ".ai/last-prompt.md",
  "# Runtime scratch: the harness writes it, the repository never carries it",
  ".claude/",
];

const RECLAIMED_LINES = [
  ...MANAGED_BLOCKS.flatMap((block) => [block.header, ...block.entries]),
  ...LEGACY_GITIGNORE_LINES,
];

/**
 * Writes the SDG-managed block into .gitignore. Everything outside the two
 * markers belongs to the developer and survives untouched; everything the CLI
 * ever emitted loose is reclaimed into the block, so an entry the canon drops
 * stops being ignored instead of lingering forever.
 */
function writeGitignore(targetDirectory) {
  const gitignorePath = path.join(targetDirectory, ".gitignore");

  const existingContent = fileSystem.existsSync(gitignorePath)
    ? fileSystem.readFileSync(gitignorePath, "utf8")
    : "";

  const developerBody = extractDeveloperBody(existingContent);
  const managedBlock = renderManagedBlock();

  const separator = developerBody.length > 0 ? "\n\n" : "";
  const content = `${developerBody}${separator}${managedBlock}\n`;

  if (content === existingContent) {
    return;
  }

  fileSystem.writeFileSync(gitignorePath, content);
}

function extractDeveloperBody(existingContent) {
  const withoutBlock = removeManagedBlock(existingContent);

  const keptLines = withoutBlock
    .split("\n")
    .filter((line) => !RECLAIMED_LINES.includes(line.trim()));

  const collapsedBody = keptLines.join("\n").replace(/\n{3,}/g, "\n\n");
  const developerBody = collapsedBody.trim();
  return developerBody;
}

function removeManagedBlock(existingContent) {
  const startIndex = existingContent.indexOf(MANAGED_BLOCK_START);

  if (startIndex === -1) {
    const unmanagedResult = existingContent;
    return unmanagedResult;
  }

  const beforeBlock = existingContent.slice(0, startIndex);
  const endIndex = existingContent.indexOf(MANAGED_BLOCK_END, startIndex);

  if (endIndex === -1) {
    const truncatedResult = beforeBlock;
    return truncatedResult;
  }

  const afterBlock = existingContent.slice(endIndex + MANAGED_BLOCK_END.length);
  const strippedContent = `${beforeBlock}${afterBlock}`;
  return strippedContent;
}

function renderManagedBlock() {
  const sections = MANAGED_BLOCKS.map((block) =>
    [block.header, ...block.entries].join("\n"),
  );

  const blockLines = [
    MANAGED_BLOCK_START,
    "# Rewritten whole on every init. Lines outside the markers are yours.",
    "",
    sections.join("\n\n"),
    "",
    MANAGED_BLOCK_END,
  ];

  const managedBlock = blockLines.join("\n");
  return managedBlock;
}

/**
 * Writes the .sdg-manifest.json with content hashes for future diff checks.
 *
 * why: the manifest is the one file the consumer keeps in git, so a field that
 * moves on every run makes the install report a change when nothing changed,
 * which is the diff a reviewer learns to skip. The stamp is carried forward
 * whenever version, selections and hashes all match what the file already holds.
 */
function writeManifest(targetDirectory, selections, packageVersion) {
  const substance = {
    sdgAgentVersion: packageVersion,
    selections,
    contentHashes: computeHashes(selections, SOURCE_INSTRUCTIONS),
  };

  const previousManifest = loadManifest(targetDirectory);
  const generatedAt = resolveGeneratedStamp(previousManifest, substance);

  const manifest = { generatedAt, ...substance };
  const aiDirectory = path.join(targetDirectory, ".ai");
  fileSystem.mkdirSync(aiDirectory, { recursive: true });

  const manifestPath = path.join(aiDirectory, ".sdg-manifest.json");

  const originalContent = fileSystem.existsSync(manifestPath)
    ? fileSystem.readFileSync(manifestPath, "utf8")
    : null;

  writeJsonAtomic(manifestPath, manifest, originalContent);
}

function resolveGeneratedStamp(previousManifest, substance) {
  const previousStamp = previousManifest?.generatedAt;

  if (!previousStamp) {
    const firstStamp = new Date().toISOString();
    return firstStamp;
  }

  const previousSubstance = {
    sdgAgentVersion: previousManifest.sdgAgentVersion,
    selections: previousManifest.selections,
    contentHashes: previousManifest.contentHashes,
  };

  const isUnchanged =
    JSON.stringify(previousSubstance) === JSON.stringify(substance);

  if (isUnchanged) {
    return previousStamp;
  }

  const refreshedStamp = new Date().toISOString();
  return refreshedStamp;
}

/**
 * Injects automation scripts and configurations (Bump, Husky) if enabled.
 * Idempotent: skips if scripts/bump.mjs exists or if selections.bump is false.
 */
function writeAutomationScripts(targetDirectory, selections) {
  if (!selections.bump) {
    return;
  }

  const scriptsDir = path.join(targetDirectory, "scripts");
  const bumpScriptPath = path.join(scriptsDir, "bump.mjs");

  const packagePath = path.join(targetDirectory, "package.json");
  const packageData = safeReadJson(packagePath);
  if (!packageData) {
    return;
  }

  const hasExistingBump =
    packageData.scripts &&
    (packageData.scripts.bump ||
      packageData.scripts.release ||
      packageData.scripts.version);

  if (hasExistingBump && !fileSystem.existsSync(bumpScriptPath)) {
    return;
  }

  if (!fileSystem.existsSync(bumpScriptPath)) {
    fileSystem.mkdirSync(scriptsDir, { recursive: true });
    const templatePath = path.join(
      SOURCE_INSTRUCTIONS,
      "templates",
      "bump.mjs",
    );

    const templateContent = fileSystem.readFileSync(templatePath, "utf8");
    fileSystem.writeFileSync(bumpScriptPath, templateContent);
  }

  if (!packageData.scripts) {
    packageData.scripts = {};
  }

  if (!packageData.scripts.bump) {
    packageData.scripts.bump = "node scripts/bump.mjs";
    writeJsonAtomic(
      packagePath,
      packageData,
      fileSystem.readFileSync(packagePath, "utf8"),
    );
  }

  const huskyDirectory = path.join(targetDirectory, ".husky");
  if (fileSystem.existsSync(huskyDirectory)) {
    const prePushPath = path.join(huskyDirectory, "pre-push");
    const nvmShim = dedent`
      # NVM Shim (Essential for projects Staff in Linux/NVM)
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    `;

    const bumpCmd = "# Pre-push check (non-mutating)\nnpm test";

    if (fileSystem.existsSync(prePushPath)) {
      const content = fileSystem.readFileSync(prePushPath, "utf8");
      if (!content.includes("npm test")) {
        const separator = content.endsWith("\n") ? "" : "\n";
        const newPrePushContent = `${content}${separator}\n${nvmShim}\n${bumpCmd}\n`;
        fileSystem.writeFileSync(prePushPath, newPrePushContent);
      }
    } else {
      const prePushContent = dedent`
        #!/usr/bin/env sh

        ${nvmShim}

        ${bumpCmd}
      `;

      fileSystem.writeFileSync(prePushPath, prePushContent, { mode: 0o755 });
    }
  }
}

function writeToolingAssets(targetDirectory) {
  const sourceToolingDir = path.join(
    __dirname,
    "../../..",
    "assets",
    "tooling",
  );

  const targetToolingDir = resolveKitPath(targetDirectory, "tooling");

  const hasSourceAssets = fileSystem.existsSync(sourceToolingDir);
  if (!hasSourceAssets) {
    return;
  }

  fileSystem.cpSync(sourceToolingDir, targetToolingDir, {
    recursive: true,
    force: true,
  });

  const executableHooks = ["pre-commit", "commit-msg"];
  for (const hookName of executableHooks) {
    const hookPath = path.join(targetToolingDir, "husky", hookName);
    const hookExists = fileSystem.existsSync(hookPath);
    if (hookExists) {
      fileSystem.chmodSync(hookPath, 0o755);
    }
  }
}

export const InstructionAssembler = {
  buildMasterInstructions,
  buildClaudeContent,
  writeAgentConfig,
  writeBacklogFiles,
  writeGitignore,
  writeManifest,
  writeAutomationScripts,
  writeToolingAssets,
};
