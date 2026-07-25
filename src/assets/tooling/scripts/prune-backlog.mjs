#!/usr/bin/env node

import fileSystem from "node:fs";
import path from "node:path";

const DONE_HEADING = "## Done";
const DONE_ENTRY_PREFIX = "- [DONE]";
const DEFAULT_KEEP = 3;

function run() {
  const keepCount = parseKeepArg(process.argv.slice(2));
  const tasksPath = resolveTasksPath();

  const existsResult = ensureTasksFileExists(tasksPath);
  if (!existsResult) {
    return;
  }

  const originalContent = fileSystem.readFileSync(tasksPath, "utf8");
  const pruneOutcome = pruneDoneSection(originalContent, keepCount);

  if (pruneOutcome.hasDrift) {
    reportDrift(pruneOutcome.unrecognizedSample);
  }

  if (pruneOutcome.unchanged) {
    const nothingMessage = `ℹ️  Nothing to prune (${pruneOutcome.totalEntries} ≤ ${keepCount}).`;
    console.log(nothingMessage);
    return;
  }

  fileSystem.writeFileSync(tasksPath, pruneOutcome.nextContent);
  const successMessage = `✅ Pruned: kept ${keepCount} / ${pruneOutcome.totalEntries} total.`;
  console.log(successMessage);
}

/**
 * "Nothing to prune" and "I cannot read this section" must never sound alike —
 * a silent exit 0 here is what lets a format change go unnoticed for cycles.
 */
function reportDrift(unrecognizedSample) {
  const driftLines = [
    `❌ Format drift in "${DONE_HEADING}": content present, no \`${DONE_ENTRY_PREFIX}\` entry recognized.`,
    `   First unrecognized line: ${unrecognizedSample}`,
    `   Nothing was pruned. Fix the section format or the entry prefix.`,
  ].join("\n");

  console.error(driftLines);
  process.exit(1);
}

function parseKeepArg(args) {
  const keepIndex = args.indexOf("--keep");
  const hasKeepFlag = keepIndex >= 0 && args[keepIndex + 1];
  if (!hasKeepFlag) {
    return DEFAULT_KEEP;
  }

  const parsedKeep = Number.parseInt(args[keepIndex + 1], 10);
  const isValidKeep = Number.isFinite(parsedKeep) && parsedKeep >= 0;
  if (!isValidKeep) {
    console.error("❌ Invalid --keep value. Expected non-negative integer.");
    process.exit(1);
  }

  const validatedKeep = parsedKeep;
  return validatedKeep;
}

function resolveTasksPath() {
  const tasksPath = path.join(process.cwd(), ".ai", "backlog", "tasks.md");
  return tasksPath;
}

function ensureTasksFileExists(tasksPath) {
  if (fileSystem.existsSync(tasksPath)) {
    return true;
  }

  console.error(`❌ Not found: ${tasksPath}`);
  process.exit(1);
}

function pruneDoneSection(content, keepCount) {
  const lines = content.split("\n");
  const doneStartIndex = lines.findIndex(
    (line) => line.trim() === DONE_HEADING,
  );

  const hasDoneSection = doneStartIndex >= 0;
  if (!hasDoneSection) {
    const noSectionOutcome = { unchanged: true, totalEntries: 0 };
    return noSectionOutcome;
  }

  const afterDoneLines = lines.slice(doneStartIndex + 1);
  const doneEndOffset = afterDoneLines.findIndex((line) =>
    line.startsWith("## "),
  );

  const hasNextSection = doneEndOffset >= 0;
  const doneEndIndex = hasNextSection
    ? doneStartIndex + 1 + doneEndOffset
    : lines.length;

  const doneBlock = lines.slice(doneStartIndex + 1, doneEndIndex);
  const entryIndices = collectEntryIndices(doneBlock);
  const totalEntries = entryIndices.length;

  const unrecognizedLines = collectUnrecognizedLines(doneBlock);
  const hasDrift = totalEntries === 0 && unrecognizedLines.length > 0;
  if (hasDrift) {
    const driftOutcome = { hasDrift, unrecognizedSample: unrecognizedLines[0] };
    return driftOutcome;
  }

  const hasEnoughEntries = totalEntries > keepCount;
  if (!hasEnoughEntries) {
    const idempotentOutcome = { unchanged: true, totalEntries };
    return idempotentOutcome;
  }

  const prunedBlock = keepFirstEntries(doneBlock, entryIndices, keepCount);
  const nextLines = [
    ...lines.slice(0, doneStartIndex + 1),
    ...prunedBlock,
    ...lines.slice(doneEndIndex),
  ];

  const nextContent = nextLines.join("\n");

  const prunedOutcome = { unchanged: false, totalEntries, nextContent };
  return prunedOutcome;
}

function collectEntryIndices(doneBlock) {
  const indices = [];
  for (let index = 0; index < doneBlock.length; index += 1) {
    const isEntryLine = doneBlock[index].startsWith(DONE_ENTRY_PREFIX);
    if (isEntryLine) {
      indices.push(index);
    }
  }

  return indices;
}

/**
 * The backlog marks a deliberately empty section two ways — `_(placeholder)_`
 * in a live file, `<!-- comment -->` in the seed template. Both are an answer,
 * not drift; a fresh project must prune clean before its first entry exists.
 */
function collectUnrecognizedLines(doneBlock) {
  const unrecognized = doneBlock.filter((line) => {
    const trimmed = line.trim();
    const isBlank = trimmed.length === 0;
    const isPlaceholder =
      trimmed.startsWith("_(") || trimmed.startsWith("<!--");

    const isMeaningful = !isBlank && !isPlaceholder;
    return isMeaningful;
  });

  return unrecognized;
}

function keepFirstEntries(doneBlock, entryIndices, keepCount) {
  const keepUntilIndex = entryIndices[keepCount];
  const preservedHead = doneBlock.slice(0, entryIndices[0]);
  const preservedEntries =
    keepCount === 0 ? [] : doneBlock.slice(entryIndices[0], keepUntilIndex);

  const trailingSeparator = preservedEntries.length > 0 ? [""] : [];
  const pruned = [...preservedHead, ...preservedEntries, ...trailingSeparator];
  return pruned;
}

run();
