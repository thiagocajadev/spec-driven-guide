/**
 * Restore Bundle: rebuilds `.ai/kit/` from the manifest the repository tracks.
 */

import { createRequire } from "node:module";

import { ManifestUtils } from "../../lib/domain/manifest-utils.mjs";
import { KitEmission } from "../../lib/domain/kit-emission.mjs";
import { ResultUtils } from "../../lib/core/result-utils.mjs";
import { FsUtils } from "../../lib/core/fs-utils.mjs";

const { loadManifest } = ManifestUtils;
const { verifyAgainstManifest } = KitEmission;
const { success, fail } = ResultUtils;
const { bootstrapIfDirect } = FsUtils;

const require = createRequire(import.meta.url);
const packageJson = require("../../../../package.json");

async function restore(targetDirectory = process.cwd()) {
  const restoreOutcome = await orchestrateRestore(targetDirectory);
  return restoreOutcome;
}

/**
 * The kit is a pure function of the pinned version and the recorded selections,
 * both of which the manifest carries and git keeps. That is what lets a clone
 * with no `.ai/kit/` rebuild the exact tree its commit described, and what makes
 * the hash check afterwards a verdict rather than a formality.
 */
async function orchestrateRestore(targetDirectory) {
  const manifest = loadManifest(targetDirectory);

  if (!manifest) {
    const missingManifest = reportMissingManifest();
    return missingManifest;
  }

  const versionMismatch = rejectDivergentVersion(manifest);
  if (versionMismatch) {
    return versionMismatch;
  }

  const { SDG: SpecDrivenGuide } = await import("../init/build-bundle.mjs");
  await SpecDrivenGuide.run(targetDirectory, {
    selections: manifest.selections,
  });

  const verificationResult = reportVerification(targetDirectory, manifest);
  return verificationResult;
}

function reportMissingManifest() {
  console.log(
    "\n  ❌ No manifest at .ai/.sdg-manifest.json, so there is nothing to restore.",
  );

  console.log("      Run `npx spec-driven-guide init` to install first.\n");

  const missingResult = fail("No manifest found.", "MANIFEST_MISSING");
  return missingResult;
}

/**
 * why: restoring with a different release rebuilds a different tree under the
 * same commit, which is the one outcome this command exists to prevent. It
 * refuses and names the command that reproduces the pin, rather than
 * approximating it.
 */
function rejectDivergentVersion(manifest) {
  const pinnedVersion = manifest.sdgAgentVersion;
  const isSameVersion = pinnedVersion === packageJson.version;

  if (isSameVersion) {
    const matchedVersion = null;
    return matchedVersion;
  }

  console.log(
    `\n  ⚠️  This CLI is v${packageJson.version}, the manifest pins v${pinnedVersion}.`,
  );

  console.log(`      Run: npx spec-driven-guide@${pinnedVersion} restore\n`);

  const mismatchResult = fail(
    `Manifest pins v${pinnedVersion}.`,
    "MANIFEST_VERSION_MISMATCH",
  );

  return mismatchResult;
}

function reportVerification(targetDirectory, manifest) {
  const driftedKeys = verifyAgainstManifest(
    targetDirectory,
    manifest.contentHashes,
  );

  if (driftedKeys.length > 0) {
    const driftReport = reportDrift(driftedKeys);
    return driftReport;
  }

  const restoredCount = Object.keys(manifest.contentHashes).length;
  console.log(
    `\n  ✅ .ai/kit/ restored: ${restoredCount} files match the manifest.\n`,
  );

  const verifiedResult = success();
  return verifiedResult;
}

function reportDrift(driftedKeys) {
  console.log(
    `\n  ❌ ${driftedKeys.length} file(s) do not match the manifest after restore:\n`,
  );

  for (const manifestKey of driftedKeys) {
    console.log(`      ${manifestKey}`);
  }

  console.log("");

  const driftResult = fail(
    `${driftedKeys.length} files diverge from the manifest.`,
    "RESTORE_DRIFT",
  );

  return driftResult;
}

export const Restorer = {
  restore,
};

bootstrapIfDirect(import.meta.url, restore);
