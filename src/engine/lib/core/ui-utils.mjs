/**
 * Bundle UI: All console output and user confirmation for the bundle lifecycle.
 * Single responsibility: presentation and interaction only, no file I/O.
 */

import { DisplayUtils } from "./display-utils.mjs";
import { RulesetInjector } from "../domain/ruleset-injector.mjs";
import { PromptUtils } from "../infra/prompt-utils.mjs";

const { displayName } = DisplayUtils;
const { collectOutputSummary } = RulesetInjector;
const { safeConfirm } = PromptUtils;

function printWelcome() {
  console.log("\n  Installing instruction set...");
  console.log(`  ${"─".repeat(55)}`);
}

function printStep(step, total, message) {
  console.log(`[${step}/${total}] ${message}`);
}

function printAborted() {
  console.log("\n  Aborted. No files were written.\n");
}

function printQuickSetupStart() {
  console.log(`\n  ⚡ Quick setup, installing with defaults...`);
}

function printProjectRoot(targetDir) {
  console.log(`\n  Project Root: ${targetDir}`);
}

function printActivationGuide() {
  console.log("\n  Your agent is ready. Start with a task.");
  console.log("  If it does not auto-load the rules, paste this once:");
  console.log("\n    Read AGENTS.md\n");
  console.log(
    "  First task is `land:`, which discovers the project stack and seed backlog.\n",
  );
}

function printSuccessAgents(targetDir) {
  console.log("\n  ✅ Done.");
  console.log(`  ${"─".repeat(55)}`);
  console.log(`  Project: ${targetDir}\n`);
  console.log(
    "  AGENTS.md                (canonical governance at the repo root)",
  );

  console.log(
    "  .ai/kit/                 (skills, commands and templates, not versioned)",
  );

  console.log(
    "  .ai/backlog/             (team knowledge, versioned; session state gitignored)",
  );

  printActivationGuide();
}

function printQuickSuccess(targetDir) {
  console.log("\n  ⚡ Done.");
  console.log(`  ${"─".repeat(55)}`);
  console.log(`  Project: ${targetDir}\n`);
  console.log(
    "  AGENTS.md                (canonical governance at the repo root)",
  );

  console.log(
    "  .ai/kit/                 (skills, commands and templates, not versioned)",
  );

  console.log(
    "  .ai/backlog/             (team knowledge, versioned; session state gitignored)",
  );

  printActivationGuide();
}

/**
 * Warns when a pre-existing file blocked a write or hides the governance, and
 * names the retired `CLAUDE.md` pointer when it is removed. Silence means
 * `AGENTS.md` is SDG-owned, current, and the file Claude Code reads.
 */
function printAgentConfigWarnings(configOutcome) {
  if (configOutcome?.agents === "foreign") {
    printForeignAgentsWarning();
  }

  if (configOutcome?.claude === "shadowing") {
    printShadowingClaudeWarning();
  }

  if (configOutcome?.claude === "removed") {
    printRemovedClaudePointer();
  }
}

function printForeignAgentsWarning() {
  console.log("  ⚠️  Existing AGENTS.md preserved: it is not SDG-generated.");
  console.log("      Governance was written to AGENTS.sdg.md instead.");
  console.log(
    "      Merge it into your AGENTS.md, or point your agent at the sidecar.\n",
  );
}

function printShadowingClaudeWarning() {
  console.log("  ⚠️  Your CLAUDE.md hides AGENTS.md from Claude Code.");
  console.log("      Claude Code reads CLAUDE.md instead whenever both exist.");
  console.log("      Add this line at the top of your CLAUDE.md:\n");
  console.log("        @AGENTS.md\n");
}

function printRemovedClaudePointer() {
  console.log("  🧹 Removed the CLAUDE.md pointer an earlier release wrote.");
  console.log("      Claude Code reads AGENTS.md natively.\n");
}

/**
 * Names what the cleared kit held and the incoming canon does not carry. The
 * clearing is by design, so the developer is told what left rather than finding
 * out later that an edit inside `.ai/kit/` was never going to survive.
 */
function printOffCanonRemovals(removedFiles) {
  if (removedFiles.length === 0) {
    return;
  }

  console.log(
    `  🧹 ${removedFiles.length} file(s) outside the canon removed from .ai/kit/:`,
  );

  for (const relativePath of removedFiles) {
    console.log(`      .ai/kit/${relativePath}`);
  }
}

/**
 * Names the release that produced the installed tree when this CLI is a
 * different one, with the command that reproduces it exactly.
 */
function printVersionNotice(pinnedVersion, currentVersion) {
  console.log(
    `  ⚠️  This CLI is v${currentVersion}, the manifest pins v${pinnedVersion}.`,
  );

  console.log(
    `      Reproduce that tree with: npx spec-driven-guide@${pinnedVersion} init`,
  );
}

/**
 * Reports the one-time move of a pre-split install. The custom files are named
 * before the removal because this is the only run where somebody can lose work
 * they did not know the tree was carrying.
 */
function printLegacyMigration(migrationReport) {
  console.log(
    `  📦 Moved a pre-v10 install: ${migrationReport.removedCount} file(s) removed from .ai/, rebuilt under .ai/kit/.`,
  );

  printLegacyCustomFiles(migrationReport.customFiles);

  console.log("      Untrack what git still holds:");
  console.log(
    "        git rm -r --cached .ai/skills .ai/instructions .ai/commands .ai/tooling",
  );
}

function printLegacyCustomFiles(customFiles) {
  if (customFiles.length === 0) {
    return;
  }

  console.log(
    `      ${customFiles.length} of them were not written by any release:`,
  );

  for (const relativePath of customFiles) {
    console.log(`        .ai/${relativePath}`);
  }
}

function printQuickDryRun(targetDir) {
  console.log(`\n  ⚡ [DRY RUN] Quick setup, nothing will be written.`);
  console.log(`  ${"─".repeat(55)}`);
  console.log(`  Project: ${targetDir}\n`);
  console.log(`  [1/5] Would prepare .ai/ structure`);
  console.log(`  [2/5] Would inject rules → .ai/`);
  console.log(`  [3/5] Would assemble AGENTS.md`);
  console.log(
    `  [4/5] Would write agent config and backlog (stack.md placeholder)`,
  );

  console.log(`  [5/5] Would finalize manifest`);
  console.log("\n  Run without --dry-run to apply.\n");
}

function printDryRunPreview(selections, targetDir) {
  const summary = collectOutputSummary(selections);

  renderPreviewHeader(targetDir);
  renderPreviewDirectories(summary.directories);
  renderPreviewInstructionSet();
  renderPreviewManifest(selections.mode);
  renderPreviewFooter();
}

function renderPreviewHeader(targetDir) {
  console.log("\n  📋 DRY RUN: Preview of files that would be created:");
  console.log(`  ${"─".repeat(55)}`);
  console.log(`  Project Root: ${targetDir}\n`);
}

function renderPreviewDirectories(directories) {
  console.log("  Instruction directories:");
  for (const directoryName of directories) {
    console.log(`    📁 ${directoryName}`);
  }
}

function renderPreviewInstructionSet() {
  console.log(`    📄 AGENTS.md                (canonical governance, root)`);
  console.log(
    `    📄 .ai/backlog/stack.md     (placeholder, populated by \`land:\`)`,
  );
}

function renderPreviewManifest(mode) {
  if (mode === "agents") {
    console.log("    📄 .ai/.sdg-manifest.json");
  }
}

function renderPreviewFooter() {
  console.log(`\n  ${"─".repeat(55)}`);
  console.log("  Run without --dry-run to apply.\n");
}

async function printBuildSummary(selections) {
  renderSummaryHeader();
  renderSummaryRows(selections);
  renderSummaryFooter();

  const isConfirmed = await safeConfirm({
    message: "  Proceed?",
    default: true,
  });

  return isConfirmed;
}

function renderSummaryHeader() {
  console.log("\n  ┌─ Build Summary ──────────────────────────────────────┐");
}

function renderSummaryRows(selections) {
  const { flavor } = selections;
  const flavorLabel = displayName(flavor);
  console.log(`  │  Flavor:  ${flavorLabel.padEnd(43)}│`);
  console.log(`  │  Stack:   ${"declared by `land:` in stack.md".padEnd(43)}│`);
}

function renderSummaryFooter() {
  console.log("  └──────────────────────────────────────────────────────┘");
}

function printHeader(version) {
  console.log(`\n  Spec-Driven Guide: Agents v${version}`);
  console.log(`  ${"─".repeat(50)}`);
  console.log("  A working protocol and engineering rules for your AI agent.");
  console.log("  Press Ctrl+C to exit.\n");
}

function printUpdateNotification(current, latest) {
  const headline = `\n  🚀 New version available: v${latest} (current: v${current})`;
  console.log(headline);
  console.log("  Update with: npm install -g spec-driven-guide\n");
}

function printFooter() {
  console.log("\n  See you.\n");
}

function printHelp(version) {
  console.log(`
  spec-driven-guide v${version}
  Spec-driven governance for AI coding agents: one protocol for every project.

  Usage:
    npx spec-driven-guide [command] [options]

  Commands:
    init         Install the instruction set (interactive or via flags)
    restore      Rebuild .ai/kit/ from the tracked manifest
    clear        Remove the .ai/ folder
    audit        Detect drift and law violations
    review       Compare local rules vs source
    gate         Review a staged diff with an LLM (used by the pre-commit hook)
    narrative    Check the changelog narrative on its own

  Global Options:
    -h, --help       Show this help
    -v, --version    Show version

  Init Options:
    --quick              Install with defaults (lite flavor, stack.md placeholder), no prompts
    --flavor <name>      Architecture (vertical-slice, mvc, lite, legacy)
    --dry-run            Preview without writing files
    --no-bump            Skip adding scripts/bump.mjs and the bump script to package.json

  Audit Options:
    --skip-hygiene       Skip lint and tests (when the caller already ran them)

  Gate Options:
    --prompt             Read a diff on stdin, print the review prompt
    --check              Read the LLM reply on stdin, exit 1 on BLOCK
    --strict             Exit 1 when the reply cannot be verified

  Examples:
    npx spec-driven-guide
    npx spec-driven-guide init --quick
    npx spec-driven-guide init --flavor vertical-slice
    npx spec-driven-guide clear

  After install, run \`land:\` in your agent chat to discover and declare the project stack.
`);
}

export const BundleUI = {
  printWelcome,
  printStep,
  printAborted,
  printQuickSetupStart,
  printProjectRoot,
  printActivationGuide,
  printSuccessAgents,
  printQuickSuccess,
  printAgentConfigWarnings,
  printOffCanonRemovals,
  printLegacyMigration,
  printVersionNotice,
  printQuickDryRun,
  printDryRunPreview,
  printBuildSummary,
  printHeader,
  printUpdateNotification,
  printFooter,
  printHelp,
};
