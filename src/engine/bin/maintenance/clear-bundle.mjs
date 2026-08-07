import fileSystem from "node:fs";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import { ResultUtils } from "../../lib/core/result-utils.mjs";
import { FsUtils } from "../../lib/core/fs-utils.mjs";

const { success } = ResultUtils;
const { bootstrapIfDirect } = FsUtils;

/**
 * Spec Driven Guide: Reset/Clear Utility
 * Deletes all generated SDG files and the .ia directory.
 */
async function clearProject(targetDirectory = process.cwd(), options = {}) {
  await orchestrateCleanup(targetDirectory, options);
}

async function orchestrateCleanup(targetDirectory, options = {}) {
  const isDryRun = options.isDryRun || process.argv.includes("--dry-run");

  console.log("\n  Spec Driven Guide: Clear Generated Content");
  console.log(`  ${"─".repeat(50)}`);

  const itemsToRemove = [".ia", ".ai", ".sdg-prompts"];
  let existingItems = [];

  // Check current directory
  for (const itemName of itemsToRemove) {
    const fullPath = path.join(targetDirectory, itemName);
    if (fileSystem.existsSync(fullPath)) {
      existingItems.push({ name: itemName, fullPath });
    }
  }

  // Check packages/* if we are in a monorepo
  const packagesDir = path.join(targetDirectory, "packages");
  if (fileSystem.existsSync(packagesDir)) {
    const subPackages = fileSystem.readdirSync(packagesDir);
    for (const packageFolderName of subPackages) {
      for (const itemName of itemsToRemove) {
        const fullPath = path.join(packagesDir, packageFolderName, itemName);
        if (fileSystem.existsSync(fullPath)) {
          existingItems.push({
            name: `packages/${packageFolderName}/${itemName}`,
            fullPath,
          });
        }
      }
    }
  }

  if (existingItems.length === 0) {
    console.log("\n  ✅ No Spec Driven Guide content found to clear.\n");

    const noContentResult = success();
    return noContentResult;
  }

  if (isDryRun) {
    console.log("\n  [DRY RUN] The following items would be removed:");
    for (const entry of existingItems) {
      console.log(`  - ${entry.name}`);
    }

    console.log("\n  No files were deleted (dry-run mode).\n");

    const dryRunResult = success();
    return dryRunResult;
  }

  printWarning();
  printItemsToRemove(existingItems);

  const userConfirmed = await confirm({
    message: "\n  Are you sure you want to proceed?",
    default: false,
  });

  if (!userConfirmed) {
    console.log("\n  Aborted. No files were deleted.\n");

    const abortResult = success();
    return abortResult;
  }

  const backlogConfirmed = await confirmBacklogDeletion(existingItems);
  if (!backlogConfirmed) {
    console.log("\n  Aborted. No files were deleted.\n");

    const abortResult = success();
    return abortResult;
  }

  applyCleanup(existingItems);

  console.log("\n  ✨ Project cleared successfully!\n");

  const cleanupResult = success();
  return cleanupResult;
}

function printWarning() {
  console.log("\n");
  console.log("  ┌──────────────────────────────────────────────────────┐ ");
  console.log("  │  ⚠️  WARNING: PERMANENT DELETION DETECTED             │ ");
  console.log("  │  This action will IRREVERSIBLY remove all SDG rules, │ ");
  console.log("  │  AI instructions, and project manifests.             │ ");
  console.log("  └──────────────────────────────────────────────────────┘ ");
}

function printItemsToRemove(items) {
  console.log("\n  The following items will be REMOVED:");
  for (const entry of items) {
    console.log(`  - ${entry.name}`);
  }
}

async function confirmBacklogDeletion(items) {
  const backlogsWithContent = findBacklogsAtRisk(items);

  if (backlogsWithContent.length === 0) {
    return true;
  }

  console.log("\n  ┌──────────────────────────────────────────────────────┐ ");
  console.log("  │  ⚠️  LOCAL BACKLOG CONTAINS WORKING STATE             │ ");
  console.log("  │  tasks.md and impact-map.md are NOT in git            │ ");
  console.log("  │  Deletion is permanent. No recovery from remote.      │ ");
  console.log("  └──────────────────────────────────────────────────────┘ ");
  for (const backlogPath of backlogsWithContent) {
    console.log(`  - ${backlogPath}`);
  }

  const backlogConfirmed = await confirm({
    message: "\n  Delete local backlog anyway?",
    default: false,
  });

  return backlogConfirmed;
}

function applyCleanup(items) {
  console.log("\n  Cleaning up...");

  for (const entry of items) {
    const { name, fullPath } = entry;
    try {
      if (fileSystem.statSync(fullPath).isDirectory()) {
        fileSystem.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fileSystem.unlinkSync(fullPath);
      }

      console.log(`  [OK] Removed ${name}`);
    } catch (error) {
      console.log(`  [FAIL] Could not remove ${name}: ${error.message}`);
    }
  }
}

function findBacklogsAtRisk(items) {
  const backlogPaths = items
    .filter((entry) => entry.name === ".ai" || entry.name.endsWith("/.ai"))
    .map((aiEntry) => path.join(aiEntry.fullPath, "backlog"));

  const populatedBacklogs = backlogPaths.filter((backlogPath) => {
    if (!fileSystem.existsSync(backlogPath)) {
      return false;
    }

    const isPopulated = fileSystem.readdirSync(backlogPath).length > 0;
    return isPopulated;
  });

  return populatedBacklogs;
}

export const Cleaner = {
  clear: clearProject,
  findBacklogsAtRisk,
};

bootstrapIfDirect(import.meta.url, clearProject);
