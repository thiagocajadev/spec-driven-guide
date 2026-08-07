import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ResultUtils } from "../../lib/core/result-utils.mjs";
import { FsUtils } from "../../lib/core/fs-utils.mjs";

const { success } = ResultUtils;
const { bootstrapIfDirect } = FsUtils;

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../",
);
const TASKS_PATH = path.join(ROOT_DIR, ".ai", "backlog", "tasks.md");
const DEFAULT_KEEP_COUNT = 3;
const DONE_HEADER_PATTERN = /^##[ \t]+Done[ \t]*$/im;
const NEXT_SECTION_PATTERN = /\n##\s+/;
const DONE_ENTRY_PATTERN = /^-\s+\[DONE\]/;

export function pruneBacklog(content, keepCount = DEFAULT_KEEP_COUNT) {
  const doneHeaderMatch = content.match(DONE_HEADER_PATTERN);
  if (!doneHeaderMatch) {
    const missingHeaderResult = { pruned: content, removed: 0 };
    return missingHeaderResult;
  }

  const doneStart = doneHeaderMatch.index + doneHeaderMatch[0].length;
  const remainder = content.slice(doneStart);
  const nextSectionMatch = remainder.match(NEXT_SECTION_PATTERN);
  const doneEnd = nextSectionMatch
    ? doneStart + nextSectionMatch.index
    : content.length;

  const doneBody = content.slice(doneStart, doneEnd);
  const doneLines = doneBody.split("\n");
  const keptEntries = [];
  let droppedCount = 0;

  for (const line of doneLines) {
    const isEntry = DONE_ENTRY_PATTERN.test(line);
    if (!isEntry) {
      continue;
    }

    if (keptEntries.length < keepCount) {
      keptEntries.push(line);
    } else {
      droppedCount += 1;
    }
  }

  const totalEntries = keptEntries.length + droppedCount;
  const unrecognizedLines = collectUnrecognizedLines(doneLines);
  const hasDrift = totalEntries === 0 && unrecognizedLines.length > 0;
  if (hasDrift) {
    const driftResult = {
      pruned: content,
      removed: 0,
      drift: unrecognizedLines[0],
    };

    return driftResult;
  }

  if (droppedCount === 0) {
    const withinThresholdResult = { pruned: content, removed: 0 };
    return withinThresholdResult;
  }

  const rebuiltDoneBody = `\n\n${keptEntries.join("\n")}\n`;
  const pruned =
    content.slice(0, doneStart) + rebuiltDoneBody + content.slice(doneEnd);

  const prunedResult = { pruned, removed: droppedCount };
  return prunedResult;
}

/**
 * The backlog marks a deliberately empty section two ways: `_(placeholder)_`
 * in a live file, `<!-- comment -->` in the seed template. Both are an answer,
 * not drift; a fresh project must prune clean before its first entry exists.
 */
function collectUnrecognizedLines(doneLines) {
  const unrecognized = doneLines.filter((line) => {
    const trimmed = line.trim();
    const isBlank = trimmed.length === 0;
    const isPlaceholder =
      trimmed.startsWith("_(") || trimmed.startsWith("<!--");

    const isMeaningful = !isBlank && !isPlaceholder;
    return isMeaningful;
  });

  return unrecognized;
}

async function dispatchPrune() {
  await orchestratePrune();
}

async function orchestratePrune() {
  if (!fileSystem.existsSync(TASKS_PATH)) {
    console.log("  prune-backlog: skipped (tasks.md not found)");

    const skippedResult = success({ removed: 0, skipped: true });
    return skippedResult;
  }

  const originalContent = fileSystem.readFileSync(TASKS_PATH, "utf8");
  const { pruned, removed, drift } = pruneBacklog(originalContent);

  if (drift) {
    reportDrift(drift);
  }

  if (removed === 0) {
    console.log("  prune-backlog: no-op (Done already within threshold)");

    const noopResult = success({ removed: 0, skipped: false });
    return noopResult;
  }

  fileSystem.writeFileSync(TASKS_PATH, pruned);
  const prunedReport = `  prune-backlog: dropped ${removed} entries (kept last ${DEFAULT_KEEP_COUNT})`;
  console.log(prunedReport);

  const finalResult = success({ removed, skipped: false });
  return finalResult;
}

/**
 * "Nothing to prune" and "I cannot read this section" must never sound alike, and
 * a silent no-op here is what lets a format change go unnoticed for cycles.
 */
function reportDrift(unrecognizedSample) {
  const driftLines = [
    "  prune-backlog: ❌ format drift in `## Done`: content present, no `- [DONE]` entry recognized.",
    `  First unrecognized line: ${unrecognizedSample}`,
    "  Nothing was pruned. Fix the section format or the entry pattern.",
  ].join("\n");

  console.error(driftLines);
  process.exit(1);
}

export const PruneBacklog = {
  pruneBacklog,
};

bootstrapIfDirect(import.meta.url, dispatchPrune);
