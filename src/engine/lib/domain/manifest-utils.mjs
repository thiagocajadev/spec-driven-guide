import crypto from "node:crypto";
import fileSystem from "node:fs";
import path from "node:path";
import { FsUtils } from "../core/fs-utils.mjs";

const { getDirname } = FsUtils;

const __dirname = getDirname(import.meta.url);
const ASSETS_DIR = path.join(__dirname, "../../..", "assets");
const INSTRUCTIONS_DIR = path.join(ASSETS_DIR, "instructions");
const SKILLS_DIR = path.join(ASSETS_DIR, "skills");
const TOOLING_DIR = path.join(ASSETS_DIR, "tooling");

function hashFile(filePath) {
  if (!fileSystem.existsSync(filePath)) {
    const missingFile = null;
    return missingFile;
  }

  const content = fileSystem.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  return hash;
}

function computeHashes(
  selections,
  instructionsDir = INSTRUCTIONS_DIR,
  skillsDir = SKILLS_DIR,
  toolingDir = TOOLING_DIR,
) {
  const { flavor } = selections;

  const scanTargets = [
    { directory: skillsDir, prefix: "skills" },
    { directory: toolingDir, prefix: "tooling" },
    { directory: path.join(instructionsDir, "templates"), prefix: "templates" },
    {
      directory: path.join(instructionsDir, "competencies"),
      prefix: "competencies",
    },
    { directory: path.join(instructionsDir, "commands"), prefix: "commands" },
  ];

  if (flavor) {
    const flavorDirectory = path.join(instructionsDir, "flavors", flavor);
    scanTargets.push({ directory: flavorDirectory, prefix: "flavor" });
  }

  const hashes = {};

  for (const target of scanTargets) {
    scanDir(target.directory, target.prefix, hashes);
  }

  const resultHashes = hashes;
  return resultHashes;
}

/**
 * why: the manifest is committed and read on every machine of the team, so its
 * keys use `/` whatever the platform that wrote them. `path.join` here gave a
 * Windows install `skills\code-style.md`, which a macOS `review` then reported
 * as a file it had never seen.
 */
function scanDir(directory, relativePrefix, hashes) {
  if (!fileSystem.existsSync(directory)) {
    return;
  }

  const entries = fileSystem.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    const relativeFilePath = path.posix.join(relativePrefix, entry.name);

    if (entry.isDirectory()) {
      scanDir(fullPath, relativeFilePath, hashes);
    } else if (entry.isFile()) {
      hashes[relativeFilePath] = hashFile(fullPath);
    }
  }
}

function compareHashes(stored, current) {
  const changed = [];
  const unchanged = [];
  const added = [];
  const storedHashes = normalizeManifestKeys(stored);

  for (const [relativeFilePath, currentHash] of Object.entries(current)) {
    if (!(relativeFilePath in storedHashes)) {
      added.push(relativeFilePath);
    } else if (storedHashes[relativeFilePath] !== currentHash) {
      changed.push(relativeFilePath);
    } else {
      unchanged.push(relativeFilePath);
    }
  }

  const comparisonResult = { changed, unchanged, added };
  return comparisonResult;
}

/**
 * why: a manifest written on Windows before the keys became POSIX still carries
 * backslashes, and it stays committed until the next install rewrites it.
 */
function normalizeManifestKeys(contentHashes) {
  const entries = Object.entries(contentHashes).map(([manifestKey, hash]) => [
    manifestKey.replaceAll("\\", "/"),
    hash,
  ]);

  const normalizedHashes = Object.fromEntries(entries);
  return normalizedHashes;
}

function daysAgo(isoDate) {
  const ms = Date.now() - new Date(isoDate).getTime();

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const futureResult = "just now";
    return futureResult;
  }

  if (days === 0) {
    const todayResult = "today";
    return todayResult;
  }

  if (days === 1) {
    const yesterdayResult = "1 day ago";
    return yesterdayResult;
  }

  const daysResult = `${days} days ago`;
  return daysResult;
}

function loadManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, ".ai", ".sdg-manifest.json");

  if (!fileSystem.existsSync(manifestPath)) {
    const missingResult = null;
    return missingResult;
  }

  try {
    const content = fileSystem.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(content);
    return manifest;
  } catch {
    const errorResult = null;
    return errorResult;
  }
}

export const ManifestUtils = {
  hashFile,
  computeHashes,
  compareHashes,
  daysAgo,
  loadManifest,
};
