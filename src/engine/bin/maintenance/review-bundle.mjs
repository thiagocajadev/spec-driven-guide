import path from "node:path";
import { select } from "@inquirer/prompts";
import { ManifestUtils } from "../../lib/domain/manifest-utils.mjs";
import { DisplayUtils } from "../../lib/core/display-utils.mjs";
import { ResultUtils } from "../../lib/core/result-utils.mjs";
import { FsUtils } from "../../lib/core/fs-utils.mjs";

const { computeHashes, compareHashes, daysAgo, loadManifest } = ManifestUtils;
const { displayName } = DisplayUtils;
const { success } = ResultUtils;
const { getDirname, bootstrapIfDirect } = FsUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_ROOT = path.join(__dirname, "../../..");
const SOURCE_INSTRUCTIONS = path.join(SOURCE_ROOT, "assets", "instructions");

const PROJECT_ROOT = process.cwd();

/**
 * Orchestrator: Review Entry Point
 */
async function reviewBundle() {
  const reviewResult = await orchestrateReview();
  return reviewResult;
}

async function orchestrateReview() {
  console.log("\n  Spec Driven Guide: Instructions Reviewer");
  console.log(`  ${"─".repeat(50)}`);

  const manifest = loadManifest(PROJECT_ROOT);
  if (!manifest) {
    console.log(
      '\n  No manifest found (.ai/.sdg-manifest.json). Run "Build Project Context" first.\n',
    );

    const noManifestResult = success();
    return noManifestResult;
  }

  printManifestSummary(manifest);

  console.log(
    "\n  Checking project rules against Spec Driven Guide core instructions...\n",
  );

  const currentHashes = computeHashes(manifest.selections, SOURCE_INSTRUCTIONS);
  const comparison = compareHashes(manifest.contentHashes, currentHashes);

  printComparisonReport(comparison);

  const totalChanges = comparison.changed.length + comparison.added.length;

  if (totalChanges === 0) {
    console.log(
      "  \n  ✅ Your instructions are up to date with the Spec Driven Guide core.\n",
    );

    const upToDateResult = success();
    return upToDateResult;
  }

  const updatesAvailableLine = `\n  ⚠️ ${totalChanges} instruction file(s) have updates available in the core.\n`;
  console.log(updatesAvailableLine);

  const action = await select({
    message: "What would you like to do?",
    choices: [
      { name: "1. Update Instructions (Sync with Core)", value: "rebuild" },
      { name: "2. Exit without changes", value: "exit" },
    ],
  });

  if (action === "rebuild") {
    await syncWithCore(manifest);
  } else {
    console.log("\n  Exiting without changes.\n");
  }

  console.log("\n  Review session complete.\n");

  const reviewSuccess = success();
  return reviewSuccess;
}

function printManifestSummary(manifest) {
  const { selections, generatedAt, sdgAgentVersion } = manifest;
  const { flavor } = selections;
  const flavorLabel = displayName(flavor);

  console.log(`  Current Flavor: ${flavorLabel}`);
  console.log(`  Stack: declared in .ai/backlog/stack.md`);
  console.log(
    `  Last Sync: ${daysAgo(generatedAt)}, Spec Driven Guide v${sdgAgentVersion ?? "unknown"}`,
  );
}

function printComparisonReport(comparison) {
  const { changed, added, unchanged } = comparison; // Shallow Boundaries

  const allFiles = [
    ...changed.map((fileEntry) => ({ file: fileEntry, status: "UPDATED" })),
    ...added.map((fileEntry) => ({ file: fileEntry, status: "NEW    " })),
    ...unchanged.map((fileEntry) => ({ file: fileEntry, status: "OK     " })),
  ];

  for (const { file, status } of allFiles) {
    const marker =
      status === "OK     " ? "  [OK]      " : `  [${status.trim()}] `;

    console.log(`${marker} ${file}`);
  }
}

async function syncWithCore(manifest) {
  const { selections } = manifest;
  const { SDG } = await import("../init/build-bundle.mjs");

  console.log("\n  Syncing with core instructions...\n");

  try {
    process.env.SPEC_CONTEXT_SELECTIONS = JSON.stringify(selections);
    await SDG.run(PROJECT_ROOT);
  } catch (error) {
    const syncFailedLine = `\n  Sync failed: ${error.message}\n`;
    console.log(syncFailedLine);
  } finally {
    delete process.env.SPEC_CONTEXT_SELECTIONS;
  }
}

export const Reviewer = {
  review: reviewBundle,
};

bootstrapIfDirect(import.meta.url, reviewBundle);
