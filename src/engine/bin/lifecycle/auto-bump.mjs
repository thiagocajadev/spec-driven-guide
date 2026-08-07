import fileSystem from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { ResultUtils } from "../../lib/core/result-utils.mjs";
import { FsUtils } from "../../lib/core/fs-utils.mjs";

const { success } = ResultUtils;
const { bootstrapIfDirect } = FsUtils;

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../",
);
const PACKAGE_PATHS = [path.join(ROOT_DIR, "package.json")];
const CHANGELOG_PATH = path.join(ROOT_DIR, "CHANGELOG.md");

export function detectBumpType(commitMessage) {
  const [firstLine] = commitMessage.split("\n");
  const footer = commitMessage.split("\n").slice(1).join("\n");

  const BUMP_RULES = [
    { test: () => /^chore:\s*bump version/i.test(firstLine), value: "skip" },
    { test: () => /^[a-z]+(\([^)]+\))?!:/.test(firstLine), value: "major" },
    { test: () => /BREAKING CHANGE:/m.test(footer), value: "major" },
    { test: () => /^feat(\([^)]+\))?:/.test(firstLine), value: "minor" },
  ];

  const matchedRule = BUMP_RULES.find((rule) => rule.test());
  const bumpType = matchedRule?.value ?? "patch";
  return bumpType;
}

export function bumpVersion(current, bumpType) {
  const [major, minor, patch] = current.split(".").map(Number);

  const BUMP_STRATEGIES = {
    major: () => `${major + 1}.0.0`,
    minor: () => `${major}.${minor + 1}.0`,
    patch: () => `${major}.${minor}.${patch + 1}`,
  };

  const calculate = BUMP_STRATEGIES[bumpType] ?? (() => current);
  const nextVersion = calculate();
  return nextVersion;
}

async function dispatchBump() {
  await orchestrateAutoBump();
}

async function orchestrateAutoBump() {
  const commitMessage = readLastCommitMessage();
  const bumpType = detectBumpType(commitMessage);

  if (bumpType === "skip") {
    console.log("  auto-bump: skipped (version commit detected)");
    const skipPayload = { from: null, to: null, bump: "skip" };
    const skipResult = success(skipPayload);
    return skipResult;
  }

  const rootPackagePath = PACKAGE_PATHS[0];
  const rawRootContent = fileSystem.readFileSync(rootPackagePath, "utf8");
  const rootPackage = JSON.parse(rawRootContent);
  const nextVersion = bumpVersion(rootPackage.version, bumpType);

  updateChangelog(nextVersion);
  syncAllPackages(nextVersion);

  const bumpLine = `  auto-bump: ${rootPackage.version} → ${nextVersion} (${bumpType})`;
  console.log(bumpLine);
  console.log("  auto-bump: files updated. Manual commit required.");

  const finalPayload = {
    from: rootPackage.version,
    to: nextVersion,
    bump: bumpType,
  };

  const finalResult = success(finalPayload);
  return finalResult;
}

function updateChangelog(newVersion) {
  if (!fileSystem.existsSync(CHANGELOG_PATH)) {
    return;
  }

  const content = fileSystem.readFileSync(CHANGELOG_PATH, "utf8");
  const today = new Date().toISOString().split("T").at(0);

  const unreleasedRegex = /##\s*\[Unreleased\](\s*-\s*\d{4}-\d{2}-\d{2})?/i;

  if (!unreleasedRegex.test(content)) {
    return;
  }

  const newHeader = `## [${newVersion}] - ${today}`;
  let updatedContent = content.replace(unreleasedRegex, newHeader);

  const insertIndex = updatedContent.indexOf(newHeader);
  const nextBlock = `## [Unreleased]\n\n### Added\n\n### Fixed\n\n`;

  updatedContent =
    updatedContent.slice(0, insertIndex) +
    nextBlock +
    updatedContent.slice(insertIndex);

  fileSystem.writeFileSync(CHANGELOG_PATH, updatedContent);
}

function syncAllPackages(nextVersion) {
  const validPaths = PACKAGE_PATHS.filter(fileSystem.existsSync);

  for (const packagePath of validPaths) {
    const rawContent = fileSystem.readFileSync(packagePath, "utf8");
    const packageData = JSON.parse(rawContent);
    packageData.version = nextVersion;

    const serialized = `${JSON.stringify(packageData, null, 2)}\n`;
    fileSystem.writeFileSync(packagePath, serialized);
  }
}

function readLastCommitMessage() {
  const commitMessage = execSync("git log -1 --pretty=%B", {
    encoding: "utf8",
  }).trim();

  return commitMessage;
}

export const AutoBump = {
  detectBumpType,
  bumpVersion,
};

bootstrapIfDirect(import.meta.url, dispatchBump);
