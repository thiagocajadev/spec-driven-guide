#!/usr/bin/env node
/**
 * writing-lint: advisory PostToolUse hook for Markdown writes.
 *
 * Reads Claude Code's hook JSON from stdin and scans Write/Edit/MultiEdit
 * content against the lexicon files that ship beside the writing soul.
 * Hits go to stderr; the exit code is always 0, so the hook stays advisory
 * and never blocks a tool call.
 *
 * The rules live in skills/writing-soul.md, in English. The instances live
 * in skills/lexicon/<language>.md, one file per language. Adding a term is
 * a text edit here, never a code change, and a document written in any
 * language with a lexicon gets the same gate.
 *
 * Scope: skills markdown, docs, top-level README, CHANGELOG, and the
 * content tree where a project keeps its posts. Working-state files
 * (tasks.md, context.md, impact-map.md, stack.md, troubleshoot.md,
 * learned.md) are excluded, and so is the lexicon itself, which is a list
 * of banned terms by definition.
 */

import process from "node:process";
import path from "node:path";
import fileSystem from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * why: the hook is copied to .claude/hooks/ on install, so resolving from
 * import.meta.url points at the wrong tree. The project root is the only
 * anchor both the installed copy and the maintainer copy agree on.
 */
const LEXICON_CANDIDATE_DIRECTORIES = [
  path.join(".ai", "skills", "lexicon"),
  path.join("src", "assets", "skills", "lexicon"),
];

const SCOPE_REGEXES = [
  /(^|\/)src\/assets\/skills\/[^/]+\.md$/,
  /(^|\/)src\/content\/.*\.mdx?$/,
  /(^|\/)docs\/.*\.md$/,
  /(^|\/)README[^/]*\.md$/,
  /(^|\/)CHANGELOG\.md$/,
];

/**
 * why: working state is not prose, and checklist-soul.md quotes real defects
 * to teach the classes that detect them. writing-soul.md joins them once
 * punctuation became a class: it has to spell the banned character out to ban
 * it. A document whose job is to catalogue banned instances cannot be scanned
 * for banned instances, same as the lexicon.
 */
const EXCLUDED_BASENAMES = new Set([
  "tasks.md",
  "context.md",
  "impact-map.md",
  "stack.md",
  "troubleshoot.md",
  "learned.md",
  "checklist-soul.md",
  "writing-soul.md",
]);

const SUPPORTED_TOOLS = new Set(["Write", "Edit", "MultiEdit"]);

const CLASS_HEADING_PATTERN = /^##\s+(.+?)\s*$/;
const INSTANCE_PATTERN = /^-\s+(.+?)\s*$/;
const FENCE_PATTERN = /^\s*```/;
const SUGGESTION_SEPARATOR = /\s*(?:→|->)\s*/;

async function run() {
  await orchestrateLint();
}

async function orchestrateLint() {
  const payload = await readStdinJson();

  if (!payload) {
    process.exit(0);
  }

  const toolInput = payload.tool_input;
  const filePath = toolInput?.file_path;

  if (!isScopedPath(filePath)) {
    process.exit(0);
  }

  const content = extractContent(payload.tool_name, toolInput);

  if (content === null) {
    process.exit(0);
  }

  reportScan(content, filePath);

  process.exit(0);
}

function reportScan(content, filePath) {
  const catalog = loadLexiconCatalog(process.cwd());

  if (catalog.entries.length === 0) {
    warnLexiconGap(catalog);
    return;
  }

  const hits = scanContent(content, filePath, catalog);

  if (hits.length === 0) {
    return;
  }

  const hitReport = `${formatHits(hits)}\n`;
  process.stderr.write(hitReport);
}

function loadLexiconCatalog(projectRoot) {
  const attemptedPaths = LEXICON_CANDIDATE_DIRECTORIES.map((candidate) =>
    path.join(projectRoot, candidate),
  );

  const lexiconDirectory = attemptedPaths.find(isReadableDirectory) ?? null;

  if (lexiconDirectory === null) {
    const missingCatalog = { entries: [], directory: null, attemptedPaths };
    return missingCatalog;
  }

  const entries = collectLexiconEntries(lexiconDirectory);

  const loadedCatalog = {
    entries,
    directory: lexiconDirectory,
    attemptedPaths,
  };

  return loadedCatalog;
}

function isReadableDirectory(candidatePath) {
  if (!fileSystem.existsSync(candidatePath)) {
    const isMissing = false;
    return isMissing;
  }

  const isDirectory = fileSystem.statSync(candidatePath).isDirectory();
  return isDirectory;
}

function collectLexiconEntries(lexiconDirectory) {
  const fileNames = fileSystem
    .readdirSync(lexiconDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();

  const entries = [];

  for (const fileName of fileNames) {
    const language = path.basename(fileName, ".md");
    const lexiconPath = path.join(lexiconDirectory, fileName);

    const content = readFileOrEmpty(lexiconPath);

    entries.push(...parseLexiconMarkdown(content, language));
  }

  return entries;
}

function readFileOrEmpty(lexiconPath) {
  try {
    const content = fileSystem.readFileSync(lexiconPath, "utf8");
    return content;
  } catch {
    const unreadableContent = "";
    return unreadableContent;
  }
}

/**
 * A `##` heading opens a defect class and every bullet under it is one
 * instance. Bullets inside a fenced block are documentation of the format,
 * not instances, so fences are skipped.
 */
function parseLexiconMarkdown(content, language) {
  const lines = content.split("\n");
  const entries = [];

  let currentClassName = null;
  let isInsideFence = false;

  for (const line of lines) {
    if (FENCE_PATTERN.test(line)) {
      isInsideFence = !isInsideFence;
      continue;
    }

    const headingMatch = isInsideFence
      ? null
      : line.match(CLASS_HEADING_PATTERN);

    if (headingMatch) {
      currentClassName = headingMatch[1];
      continue;
    }

    const instance = readInstance(line, isInsideFence, currentClassName);

    if (instance !== null) {
      entries.push(buildEntry(instance, currentClassName, language));
    }
  }

  return entries;
}

function readInstance(line, isInsideFence, currentClassName) {
  if (isInsideFence || currentClassName === null) {
    const notAnInstance = null;
    return notAnInstance;
  }

  const instanceMatch = line.match(INSTANCE_PATTERN);

  if (!instanceMatch) {
    const notAnInstance = null;
    return notAnInstance;
  }

  const instance = instanceMatch[1];
  return instance;
}

function buildEntry(instance, className, language) {
  const [term, suggestion] = splitInstance(instance);
  const matcher = buildTermMatcher(term);

  const entry = { term, suggestion, className, language, matcher };
  return entry;
}

function splitInstance(instance) {
  const separatorIndex = instance.search(SUGGESTION_SEPARATOR);

  if (separatorIndex === -1) {
    const withoutSuggestion = [instance.trim(), null];
    return withoutSuggestion;
  }

  const term = instance.slice(0, separatorIndex).trim();
  const remainder = instance.slice(separatorIndex);
  const suggestion = remainder.replace(SUGGESTION_SEPARATOR, "").trim();

  const splitInstanceParts = [term, suggestion];
  return splitInstanceParts;
}

/**
 * why: \b is ASCII-only in JavaScript, so it misfires on accented terms.
 * Unicode lookarounds give the same boundary for every language, and a term
 * that starts or ends in punctuation is matched as a plain substring.
 */
function buildTermMatcher(term) {
  const escapedTerm = escapeRegex(term);
  const hasLeadingWordCharacter = /^[\p{L}\p{N}]/u.test(term);
  const hasTrailingWordCharacter = /[\p{L}\p{N}]$/u.test(term);

  const leadingBoundary = hasLeadingWordCharacter ? "(?<![\\p{L}\\p{N}])" : "";
  const trailingBoundary = hasTrailingWordCharacter ? "(?![\\p{L}\\p{N}])" : "";

  const matcher = new RegExp(
    `${leadingBoundary}${escapedTerm}${trailingBoundary}`,
    "iu",
  );

  return matcher;
}

function escapeRegex(value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped;
}

function isScopedPath(filePath) {
  if (typeof filePath !== "string" || filePath.length === 0) {
    const isInvalid = false;
    return isInvalid;
  }

  const basename = path.basename(filePath);

  if (EXCLUDED_BASENAMES.has(basename)) {
    const isExcluded = false;
    return isExcluded;
  }

  if (isLexiconPath(filePath)) {
    const isLexicon = false;
    return isLexicon;
  }

  const isInScope = SCOPE_REGEXES.some((regex) => regex.test(filePath));
  return isInScope;
}

function isLexiconPath(filePath) {
  const normalizedPath = filePath.split(path.sep).join("/");

  const isInLexiconTree = normalizedPath.includes("/skills/lexicon/");
  return isInLexiconTree;
}

function extractContent(toolName, toolInput) {
  if (!SUPPORTED_TOOLS.has(toolName) || !toolInput) {
    const noContent = null;
    return noContent;
  }

  if (toolName === "Write") {
    const writeContent = toolInput.content ?? "";
    return writeContent;
  }

  if (toolName === "Edit") {
    const editContent = toolInput.new_string ?? "";
    return editContent;
  }

  const editsArray = Array.isArray(toolInput.edits) ? toolInput.edits : [];
  const multiEditContent = editsArray
    .map((edit) => edit?.new_string ?? "")
    .join("\n");

  return multiEditContent;
}

function scanContent(content, filePath, catalog) {
  if (typeof content !== "string" || content.length === 0) {
    const noHits = [];
    return noHits;
  }

  const lines = content.split("\n");
  const hits = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    collectHitsForLine(line, lineIndex + 1, filePath, catalog, hits);
  }

  return hits;
}

function collectHitsForLine(line, lineNumber, filePath, catalog, hits) {
  for (const entry of catalog.entries) {
    if (entry.matcher.test(line)) {
      hits.push({
        filePath,
        line: lineNumber,
        term: entry.term,
        suggestion: entry.suggestion,
        className: entry.className,
        language: entry.language,
      });
    }
  }
}

function formatHits(hits) {
  const formattedLines = hits.map(formatHit);
  const joinedOutput = formattedLines.join("\n");
  return joinedOutput;
}

function formatHit(hit) {
  const suggestionSuffix = describeSuggestion(hit.suggestion);
  const location = `${hit.filePath}:${hit.line}`;
  const classLabel = `${hit.className} (${hit.language})`;

  const formattedLine = `${location} ${classLabel}: "${hit.term}"${suggestionSuffix}`;
  return formattedLine;
}

function describeSuggestion(suggestion) {
  if (!suggestion) {
    const noSuggestion = "";
    return noSuggestion;
  }

  const suggestionSuffix = ` → "${suggestion}"`;
  return suggestionSuffix;
}

/**
 * why: a silent zero-hit run and a run that never loaded a list look
 * identical on stderr. The second one proves nothing, so it says so.
 */
function warnLexiconGap(catalog) {
  const reason = describeLexiconGap(catalog);
  const attemptedList = catalog.attemptedPaths.join(", ");

  const warning = `writing-lint: ${reason}. Tried: ${attemptedList}. Nothing was checked.\n`;
  process.stderr.write(warning);
}

function describeLexiconGap(catalog) {
  if (catalog.directory === null) {
    const missingDirectory = "no lexicon directory found";
    return missingDirectory;
  }

  const emptyDirectory = `no instances parsed from ${catalog.directory}`;
  return emptyDirectory;
}

async function readStdinJson() {
  let raw = "";

  for await (const chunk of process.stdin) {
    raw += chunk;
  }

  if (raw.trim().length === 0) {
    const emptyPayload = null;
    return emptyPayload;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    const malformedPayload = null;
    return malformedPayload;
  }
}

const WritingLint = {
  isScopedPath,
  extractContent,
  scanContent,
  formatHits,
  loadLexiconCatalog,
  parseLexiconMarkdown,
  run,
};

export { WritingLint };

function isDirectInvocation() {
  if (!process.argv[1]) {
    const noEntry = false;
    return noEntry;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const entryFile = fileSystem.realpathSync(path.resolve(process.argv[1]));

  const isEntry = currentFile === entryFile;
  return isEntry;
}

if (isDirectInvocation()) {
  run();
}
