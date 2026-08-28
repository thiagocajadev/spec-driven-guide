/**
 * Kit Emission: where the files the CLI installs live, and how they are cleared.
 */

import fileSystem from "node:fs";
import path from "node:path";

import { ManifestUtils } from "./manifest-utils.mjs";

const { computeHashes, hashFile, loadManifest } = ManifestUtils;

/**
 * why: `.ai/` holds two owners. `.ai/backlog/` is the project's and is versioned;
 * everything the CLI writes lives under the kit, which is cleared whole before
 * every install. Clearing beats pruning file by file because a manifest only
 * inventories what an earlier release emitted, which puts a hand-written file
 * inside the tree permanently out of reach.
 */
const KIT_SEGMENTS = [".ai", "kit"];

/**
 * why: manifest keys are independent of layout, so a family table maps each one
 * onto the directory the injector writes it into. `flavor` is singular on disk:
 * only the flavor chosen at init is ever emitted.
 */
const MANIFEST_FAMILY_DIRECTORIES = {
  skills: ["skills"],
  commands: ["commands"],
  tooling: ["tooling"],
  templates: ["instructions", "templates"],
  competencies: ["instructions", "competencies"],
  flavor: ["instructions", "flavor"],
};

function resolveKitDirectory(targetDirectory) {
  const kitDirectory = path.join(targetDirectory, ...KIT_SEGMENTS);
  return kitDirectory;
}

function resolveKitPath(targetDirectory, ...segments) {
  const kitPath = path.join(targetDirectory, ...KIT_SEGMENTS, ...segments);
  return kitPath;
}

/**
 * Clears the kit and names what the incoming canon does not carry, so a removal
 * the developer did not expect is reported instead of silent. The manifest sits
 * at `.ai/.sdg-manifest.json`, outside the kit, and survives the clearing that
 * regenerates the tree it pins.
 */
function clearKit(targetDirectory, selections) {
  const previousFiles = wipeKitDirectory(targetDirectory);
  const canonKeys = Object.keys(computeHashes(selections));

  const offCanonFiles = collectOffCanonFiles(previousFiles, canonKeys);
  return offCanonFiles;
}

function wipeKitDirectory(targetDirectory) {
  const kitDirectory = resolveKitDirectory(targetDirectory);

  if (!fileSystem.existsSync(kitDirectory)) {
    const emptyKit = [];
    return emptyKit;
  }

  const previousFiles = listFilesRecursively(kitDirectory, "");
  fileSystem.rmSync(kitDirectory, { recursive: true, force: true });

  return previousFiles;
}

function listFilesRecursively(directory, relativePrefix) {
  const entries = fileSystem.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    const relativePath = path.join(relativePrefix, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(fullPath, relativePath));
      continue;
    }

    if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  const collectedFiles = files;
  return collectedFiles;
}

function collectOffCanonFiles(previousFiles, canonKeys) {
  const emittedPaths = canonKeys
    .map(toEmittedRelativePath)
    .filter((relativePath) => relativePath !== null);

  const canonPaths = new Set(emittedPaths);

  const offCanonFiles = previousFiles.filter(
    (relativePath) => !canonPaths.has(relativePath),
  );

  return offCanonFiles;
}

/**
 * why: an install from before the split wrote the tree straight under `.ai/`,
 * where the wipe does not reach and where git was tracking every file. Removing
 * it needs the previous manifest to tell a file the CLI wrote from one the
 * developer added by hand, because the second list is the only one worth
 * showing before it goes.
 */
const LEGACY_DIRECTORY_NAMES = [
  "skills",
  "commands",
  "tooling",
  "instructions",
];

function migrateLegacyTree(targetDirectory) {
  const legacyRoot = path.join(targetDirectory, ".ai");

  const presentDirectories = LEGACY_DIRECTORY_NAMES.filter((directoryName) =>
    fileSystem.existsSync(path.join(legacyRoot, directoryName)),
  );

  if (presentDirectories.length === 0) {
    const noLegacyTree = null;
    return noLegacyTree;
  }

  const legacyFiles = presentDirectories.flatMap((directoryName) =>
    listFilesRecursively(path.join(legacyRoot, directoryName), directoryName),
  );

  const customFiles = collectLegacyCustomFiles(targetDirectory, legacyFiles);

  for (const directoryName of presentDirectories) {
    fileSystem.rmSync(path.join(legacyRoot, directoryName), {
      recursive: true,
      force: true,
    });
  }

  const migrationReport = {
    removedCount: legacyFiles.length,
    customFiles,
  };

  return migrationReport;
}

function collectLegacyCustomFiles(targetDirectory, legacyFiles) {
  const previousHashes = loadManifest(targetDirectory)?.contentHashes ?? {};

  const emittedPaths = Object.keys(previousHashes)
    .map(toEmittedRelativePath)
    .filter((relativePath) => relativePath !== null);

  const canonPaths = new Set(emittedPaths);

  const customFiles = legacyFiles.filter(
    (relativePath) => !canonPaths.has(relativePath),
  );

  return customFiles;
}

/**
 * Confirms the emitted tree still matches what the manifest pins, and names the
 * keys that do not. It hashes the files on disk rather than the package they
 * came from, which is what makes the answer about this project instead of about
 * the installed CLI.
 */
function verifyAgainstManifest(targetDirectory, contentHashes) {
  const mismatchedFiles = [];

  for (const [manifestKey, expectedHash] of Object.entries(contentHashes)) {
    const relativePath = toEmittedRelativePath(manifestKey);

    if (!relativePath) {
      continue;
    }

    const emittedPath = resolveKitPath(targetDirectory, relativePath);
    const actualHash = hashFile(emittedPath);

    if (actualHash !== expectedHash) {
      mismatchedFiles.push(manifestKey);
    }
  }

  const driftedKeys = mismatchedFiles;
  return driftedKeys;
}

function toEmittedRelativePath(manifestKey) {
  const segments = manifestKey.split(/[\\/]/);
  const [family] = segments;
  const familyDirectory = MANIFEST_FAMILY_DIRECTORIES[family];

  if (!familyDirectory) {
    const unmappedResult = null;
    return unmappedResult;
  }

  const emittedRelativePath = path.join(
    ...familyDirectory,
    ...segments.slice(1),
  );

  return emittedRelativePath;
}

export const KitEmission = {
  resolveKitDirectory,
  resolveKitPath,
  clearKit,
  migrateLegacyTree,
  verifyAgainstManifest,
};
