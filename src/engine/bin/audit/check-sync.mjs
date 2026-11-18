import fileSystem from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import { FsUtils } from "../../lib/core/fs-utils.mjs";
import { ManifestUtils } from "../../lib/domain/manifest-utils.mjs";
import { ResultUtils } from "../../lib/core/result-utils.mjs";
import { KitEmission } from "../../lib/domain/kit-emission.mjs";

const { bootstrapIfDirect, isMaintainerMode } = FsUtils;
const { loadManifest } = ManifestUtils;
const { success, fail } = ResultUtils;
const { resolveKitDirectory, verifyAgainstManifest } = KitEmission;

const PROJECT_ROOT = process.cwd();
const ASSETS_ROOT = path.join(PROJECT_ROOT, "src", "assets");
const KIT_ROOT = resolveKitDirectory(PROJECT_ROOT);

// Live and source layouts diverge: init flattens commands to .ai/kit/ and copies
// only the selected flavor. Pairing them by name silently skipped both.
const MIRRORED_TREES = [
  { live: "instructions/templates", source: "instructions/templates" },
  { live: "instructions/competencies", source: "instructions/competencies" },
  { live: "commands", source: "instructions/commands" },
  { live: "skills", source: "skills" },
  { live: "tooling", source: "tooling" },
];

const LEGACY_PATH_PATTERN = /\.ai\/(skills|instructions|commands|tooling)\//;

const REFERENCE_SCAN_ROOTS = [
  "src/assets",
  "docs",
  "README.md",
  "README.pt-BR.md",
];

/**
 * why: these documents have to name the old layout. Three describe what earlier
 * versions did, and rewriting a record to match the present is how a record
 * stops being one; the v10 guide has to print the paths a reader is about to
 * untrack. They are named here so the scan stays a guard instead of a reason to
 * falsify history or to break the instructions that depend on the old names.
 */
const RECORD_FILES = new Set([
  path.join("docs", "CHANGELOG-archive.md"),
  path.join("docs", "guides", "MIGRATION-v8.md"),
  path.join("docs", "guides", "MIGRATION-v10.md"),
  path.join("docs", "ROADMAP.md"),
]);

function checkDrift() {
  const syncCheckOutcome = orchestrateSyncCheck();
  return syncCheckOutcome;
}

function orchestrateSyncCheck() {
  if (!isMaintainerMode()) {
    const installedCheck = checkInstalledKit();
    return installedCheck;
  }

  if (!fileSystem.existsSync(KIT_ROOT)) {
    const missingKit = reportMissingKit("npm run dev -- init --quick");
    return missingKit;
  }

  const mirroredTrees = [...MIRRORED_TREES, resolveFlavorTree()].filter(
    Boolean,
  );

  const driftedFiles = [];

  for (const tree of mirroredTrees) {
    const liveDirectory = path.join(KIT_ROOT, tree.live);
    const sourceDirectory = path.join(ASSETS_ROOT, tree.source);

    const treeDrifts = collectDriftedFiles(
      liveDirectory,
      sourceDirectory,
      tree.live,
    );

    const treeGaps = collectMissingFiles(
      sourceDirectory,
      liveDirectory,
      tree.live,
    );

    driftedFiles.push(...treeDrifts, ...treeGaps);
  }

  const legacyReferences = collectLegacyReferences();

  const driftReport = reportResult(driftedFiles, legacyReferences);
  return driftReport;
}

/**
 * why: an install outside this repository has no `src/assets/` to mirror, but it
 * has the manifest, which pins the hash of every file the kit should hold. A
 * missing kit is the state of every fresh clone, and reporting it as in sync
 * would approve the one tree the agent is about to read and cannot find.
 */
function checkInstalledKit() {
  const manifest = loadManifest(PROJECT_ROOT);

  if (!manifest) {
    const notInstalled = success({ skipped: true, reason: "no manifest" });
    return notInstalled;
  }

  if (!fileSystem.existsSync(KIT_ROOT)) {
    const missingKit = reportMissingKit("npx spec-driven-guide restore");
    return missingKit;
  }

  const driftedKeys = verifyAgainstManifest(
    PROJECT_ROOT,
    manifest.contentHashes,
  );

  const drifts = driftedKeys.map((manifestKey) => ({
    relativePath: manifestKey,
    reason: "differs from the manifest",
  }));

  const noLegacyReferences = [];
  const installedResult = reportResult(drifts, noLegacyReferences);
  return installedResult;
}

function reportMissingKit(rebuildCommand) {
  console.error("\n  ❌ .ai/kit/ is missing, so there is nothing to compare.");
  console.error(`      Rebuild it with: ${rebuildCommand}\n`);

  const missingKit = fail({ message: "KIT_MISSING" });
  return missingKit;
}

/**
 * why: walking only the live tree reports what changed and never what is
 * absent, so a file the canon carries and the kit lost passed as in sync.
 */
function collectMissingFiles(sourceDirectory, liveDirectory, relativePrefix) {
  if (!fileSystem.existsSync(sourceDirectory)) {
    const emptyResult = [];
    return emptyResult;
  }

  const entries = fileSystem.readdirSync(sourceDirectory, {
    withFileTypes: true,
  });

  const gaps = [];

  for (const entry of entries) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    const livePath = path.join(liveDirectory, entry.name);
    const relativePath = path.join(relativePrefix, entry.name);

    if (entry.isDirectory()) {
      gaps.push(...collectMissingFiles(sourcePath, livePath, relativePath));
    } else if (entry.isFile() && !fileSystem.existsSync(livePath)) {
      gaps.push({ relativePath, reason: "missing in .ai/kit/" });
    }
  }

  const missingFiles = gaps;
  return missingFiles;
}

/**
 * why: the files that describe the tree are text an agent reads and follows, so
 * a path the move under `.ai/kit/` left behind resolves to nothing with no error
 * raised anywhere. Only a scan catches that, and only here: `src/assets` and
 * `docs` ship with this repository and never with an install.
 */
function collectLegacyReferences() {
  const offenders = [];

  for (const scanRoot of REFERENCE_SCAN_ROOTS) {
    const absoluteRoot = path.join(PROJECT_ROOT, scanRoot);
    scanForLegacyReferences(absoluteRoot, scanRoot, offenders);
  }

  const legacyReferences = offenders;
  return legacyReferences;
}

function scanForLegacyReferences(absolutePath, relativePath, offenders) {
  if (!fileSystem.existsSync(absolutePath)) {
    return;
  }

  if (RECORD_FILES.has(relativePath)) {
    return;
  }

  const stats = fileSystem.statSync(absolutePath);

  if (stats.isDirectory()) {
    scanDirectoryForLegacyReferences(absolutePath, relativePath, offenders);
    return;
  }

  const isScannableFile = /\.(md|mjs|json)$/.test(relativePath);
  if (!isScannableFile) {
    return;
  }

  const lines = fileSystem.readFileSync(absolutePath, "utf8").split("\n");

  for (const [lineIndex, line] of lines.entries()) {
    if (LEGACY_PATH_PATTERN.test(line)) {
      offenders.push(`${relativePath}:${lineIndex + 1}`);
    }
  }
}

function scanDirectoryForLegacyReferences(
  absolutePath,
  relativePath,
  offenders,
) {
  const entries = fileSystem.readdirSync(absolutePath);

  for (const entryName of entries) {
    scanForLegacyReferences(
      path.join(absolutePath, entryName),
      path.join(relativePath, entryName),
      offenders,
    );
  }
}

/**
 * Only the flavor chosen at init lands in .ai/kit/, under a singular directory
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

function reportLegacyReferences(legacyReferences) {
  console.error(
    `\n  ❌ ${legacyReferences.length} reference(s) still point outside .ai/kit/:\n`,
  );

  for (const offender of legacyReferences) {
    console.error(`     ${offender}`);
  }

  console.error(
    "\n  Fix: rewrite them under `.ai/kit/`. An agent follows a stale path into nothing, silently.\n",
  );

  const legacyFailure = fail({
    message: "LEGACY_PATH_REFERENCE",
    count: legacyReferences.length,
  });

  return legacyFailure;
}

function reportResult(drifts, legacyReferences) {
  if (legacyReferences.length > 0) {
    const legacyFailure = reportLegacyReferences(legacyReferences);
    return legacyFailure;
  }

  if (drifts.length === 0) {
    console.log("\n  ✅ .ai/kit/ is in sync with its source\n");

    const syncOk = success();
    return syncOk;
  }

  console.error("\n  ❌ Drift detected: .ai/kit/ differs from its source:\n");

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
