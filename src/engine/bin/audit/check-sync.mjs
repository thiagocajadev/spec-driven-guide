import fileSystem from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import { FsUtils } from "../../lib/core/fs-utils.mjs";
import { ManifestUtils } from "../../lib/domain/manifest-utils.mjs";
import { ResultUtils } from "../../lib/core/result-utils.mjs";

const { bootstrapIfDirect, isMaintainerMode } = FsUtils;
const { loadManifest } = ManifestUtils;
const { success, fail } = ResultUtils;

const PROJECT_ROOT = process.cwd();
const ASSETS_ROOT = path.join(PROJECT_ROOT, "src", "assets");
const AI_ROOT = path.join(PROJECT_ROOT, ".ai");

// Live and source layouts diverge: init flattens commands to .ai/ and copies
// only the selected flavor. Pairing them by name silently skipped both.
const MIRRORED_TREES = [
  { live: "instructions/templates", source: "instructions/templates" },
  { live: "instructions/competencies", source: "instructions/competencies" },
  { live: "commands", source: "instructions/commands" },
  { live: "skills", source: "skills" },
  { live: "tooling", source: "tooling" },
];

function checkDrift() {
  const syncCheckOutcome = orchestrateSyncCheck();
  return syncCheckOutcome;
}

function orchestrateSyncCheck() {
  if (!isMaintainerMode()) {
    const skipResult = success();
    return skipResult;
  }

  const mirroredTrees = [...MIRRORED_TREES, resolveFlavorTree()].filter(
    Boolean,
  );

  const driftedFiles = [];

  for (const tree of mirroredTrees) {
    const liveDirectory = path.join(AI_ROOT, tree.live);
    const sourceDirectory = path.join(ASSETS_ROOT, tree.source);

    const treeDrifts = collectDriftedFiles(
      liveDirectory,
      sourceDirectory,
      tree.live,
    );

    driftedFiles.push(...treeDrifts);
  }

  const driftReport = reportResult(driftedFiles);
  return driftReport;
}

/**
 * Only the flavor chosen at init lands in .ai/, under a singular directory
 * name. The manifest is the only record of which one it was.
 */
function resolveFlavorTree() {
  const manifest = loadManifest(PROJECT_ROOT);
  const selectedFlavor = manifest?.selections?.flavor;

  if (!selectedFlavor) {
    const unresolvedTree = null;
    return unresolvedTree;
  }

  const flavorTree = {
    live: "instructions/flavor",
    source: path.join("instructions", "flavors", selectedFlavor),
  };

  return flavorTree;
}

function collectDriftedFiles(liveDirectory, sourceDirectory, relativePrefix) {
  if (!fileSystem.existsSync(liveDirectory)) {
    const emptyResult = [];
    return emptyResult;
  }

  const entries = fileSystem.readdirSync(liveDirectory, {
    withFileTypes: true,
  });

  const localDrifts = [];

  for (const entry of entries) {
    const relativePath = path.join(relativePrefix, entry.name);
    const livePath = path.join(liveDirectory, entry.name);
    const sourcePath = path.join(sourceDirectory, entry.name);

    if (entry.isDirectory()) {
      const nestedDrifts = collectDriftedFiles(
        livePath,
        sourcePath,
        relativePath,
      );

      localDrifts.push(...nestedDrifts);
    } else if (entry.isFile()) {
      const fileDrift = checkFileDrift(livePath, sourcePath, relativePath);
      if (fileDrift !== null) {
        localDrifts.push(fileDrift);
      }
    }
  }

  const foundDrifts = localDrifts;
  return foundDrifts;
}

function checkFileDrift(livePath, sourcePath, relativePath) {
  if (!fileSystem.existsSync(sourcePath)) {
    const missingDrift = { relativePath, reason: "missing in src/assets/" };
    return missingDrift;
  }

  const liveHash = hashFile(livePath);
  const sourceHash = hashFile(sourcePath);

  if (liveHash !== sourceHash) {
    const contentDrift = { relativePath, reason: "content differs" };
    return contentDrift;
  }

  return null;
}

function hashFile(filePath) {
  const content = fileSystem.readFileSync(filePath);
  const fileHash = crypto.createHash("sha256").update(content).digest("hex");
  return fileHash;
}

function reportResult(drifts) {
  if (drifts.length === 0) {
    console.log("\n  ✅ .ai/ is in sync with src/assets/\n");

    const syncOk = success();
    return syncOk;
  }

  console.error(
    "\n  ❌ Drift detected: files in .ai/ differ from src/assets/:\n",
  );

  for (const drift of drifts) {
    console.error(`     ${drift.relativePath} (${drift.reason})`);
  }

  console.error(
    "\n  Fix: apply the same edits to both copies, or re-run `npx spec-driven-guide init` to regenerate.\n",
  );

  const driftFailure = fail({ message: "SYNC_DRIFT", count: drifts.length });
  return driftFailure;
}

export const SyncChecker = { check: checkDrift };

bootstrapIfDirect(import.meta.url, async () => {
  const result = checkDrift();
  if (result.isFailure) {
    process.exit(1);
  }
});
