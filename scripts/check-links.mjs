/**
 * Check Links: finds references in the documentation that lead nowhere.
 *
 * Three kinds, because a reader and an agent both follow them without an error
 * when they break:
 *   - a relative link, in markdown or HTML, to a file that does not exist
 *   - an anchor, `#heading`, that no heading in the target file produces
 *   - a `.ai/kit/...` path an agent is told to load, with no source behind it
 *
 * External URLs are checked only with `--external`, since the suite runs offline.
 *
 *   node scripts/check-links.mjs [--external]
 */

import fileSystem from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/**
 * why: these files record what earlier releases shipped. Their links point at
 * the tree as it stood then, and rewriting them to match the present is how a
 * record stops being one.
 */
const RECORD_FILES = new Set(["docs/CHANGELOG-archive.md"]);

const MARKDOWN_LINK_PATTERN = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_LINK_PATTERN = /<(?:a|img)\b[^>]*?\s(?:href|src)="([^"]+)"/g;
const KIT_PATH_PATTERN = /\.ai\/kit\/[A-Za-z0-9_./-]+/g;
const EXTERNAL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const FENCE_PATTERN = /^\s*(```|~~~)/;
const HEADING_PATTERN = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/;

/**
 * `.ai/kit/` is the installed copy, absent from this repository, so a kit path
 * is resolved to the source file the install copies it from. The flavor is
 * singular on disk and plural in the source, where any flavor will do.
 */
const KIT_SOURCE_FAMILIES = [
  { kit: "skills/", source: ["src/assets/skills/"] },
  { kit: "commands/", source: ["src/assets/instructions/commands/"] },
  { kit: "tooling/", source: ["src/assets/tooling/"] },
  {
    kit: "instructions/templates/",
    source: ["src/assets/instructions/templates/"],
  },
  {
    kit: "instructions/competencies/",
    source: ["src/assets/instructions/competencies/"],
  },
  {
    kit: "instructions/flavor/",
    source: ["src/assets/instructions/flavors/lite/"],
  },
];

function listDocumentFiles(repositoryRoot = REPOSITORY_ROOT) {
  const trackedFiles = execFileSync("git", ["ls-files", "*.md"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

  const documentFiles = trackedFiles
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !RECORD_FILES.has(line));

  return documentFiles;
}

/**
 * Yields every reference outside fenced code, with its line, since an example
 * inside a fence is text being shown rather than a link being offered.
 */
function extractReferences(content) {
  const references = [];
  let isInsideFence = false;

  for (const [lineIndex, line] of content.split("\n").entries()) {
    if (FENCE_PATTERN.test(line)) {
      isInsideFence = !isInsideFence;
      continue;
    }

    if (isInsideFence) {
      continue;
    }

    const lineNumber = lineIndex + 1;
    references.push(...collectLinks(line, lineNumber));
    references.push(...collectKitPaths(line, lineNumber));
  }

  const collectedReferences = references;
  return collectedReferences;
}

function collectLinks(line, lineNumber) {
  const targets = [
    ...[...line.matchAll(MARKDOWN_LINK_PATTERN)].map((match) => match[1]),
    ...[...line.matchAll(HTML_LINK_PATTERN)].map((match) => match[1]),
  ];

  const links = targets.map((target) => ({
    kind: EXTERNAL_PATTERN.test(target) ? "external" : "link",
    target,
    line: lineNumber,
  }));

  return links;
}

function collectKitPaths(line, lineNumber) {
  const kitPaths = [...line.matchAll(KIT_PATH_PATTERN)]
    .map((match) => match[0].replace(/[.,:;)]+$/, ""))
    .filter((kitPath) => !kitPath.endsWith("/"))
    .map((kitPath) => ({ kind: "kit", target: kitPath, line: lineNumber }));

  return kitPaths;
}

/**
 * GitHub's anchor rule: lowercase, drop punctuation except `-` and `_`, turn
 * spaces into `-`, and suffix repeats with `-1`, `-2`.
 */
function collectAnchors(content) {
  const anchors = new Set();
  const seenCounts = new Map();
  let isInsideFence = false;

  for (const line of content.split("\n")) {
    if (FENCE_PATTERN.test(line)) {
      isInsideFence = !isInsideFence;
      continue;
    }

    const headingMatch = isInsideFence ? null : line.match(HEADING_PATTERN);
    if (!headingMatch) {
      continue;
    }

    const baseSlug = slugify(headingMatch[1]);
    const seenCount = seenCounts.get(baseSlug) ?? 0;
    seenCounts.set(baseSlug, seenCount + 1);

    anchors.add(seenCount === 0 ? baseSlug : `${baseSlug}-${seenCount}`);
  }

  const headingAnchors = anchors;
  return headingAnchors;
}

function slugify(headingText) {
  const plainText = headingText
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "");

  const slug = plainText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");

  return slug;
}

function resolveKitSource(kitPath, repositoryRoot) {
  const relativeKitPath = kitPath.slice(".ai/kit/".length);
  const family = KIT_SOURCE_FAMILIES.find(({ kit }) =>
    relativeKitPath.startsWith(kit),
  );

  if (!family) {
    const unknownFamily = null;
    return unknownFamily;
  }

  const remainder = relativeKitPath.slice(family.kit.length);
  const sourcePath = path.join(repositoryRoot, family.source[0], remainder);
  return sourcePath;
}

/**
 * Checks one reference and returns the reason it is broken, or null.
 */
function checkReference(reference, documentPath, repositoryRoot) {
  if (reference.kind === "kit") {
    const sourcePath = resolveKitSource(reference.target, repositoryRoot);
    const isResolved = sourcePath !== null && fileSystem.existsSync(sourcePath);

    const kitReason = isResolved ? null : "no source file behind this kit path";
    return kitReason;
  }

  const [targetPath, anchor] = reference.target.split("#");
  const documentDirectory = path.dirname(
    path.join(repositoryRoot, documentPath),
  );

  const resolvedPath = targetPath
    ? path.resolve(documentDirectory, decodeURI(targetPath.split("?")[0]))
    : path.join(repositoryRoot, documentPath);

  if (!fileSystem.existsSync(resolvedPath)) {
    const missingReason = "file not found";
    return missingReason;
  }

  const isMarkdownWithAnchor = anchor && resolvedPath.endsWith(".md");
  if (!isMarkdownWithAnchor) {
    return null;
  }

  const targetContent = fileSystem.readFileSync(resolvedPath, "utf8");
  const hasAnchor = collectAnchors(targetContent).has(anchor.toLowerCase());

  const anchorReason = hasAnchor ? null : `no heading for #${anchor}`;
  return anchorReason;
}

function findBrokenReferences(repositoryRoot = REPOSITORY_ROOT) {
  const brokenReferences = [];

  for (const documentPath of listDocumentFiles(repositoryRoot)) {
    const content = fileSystem.readFileSync(
      path.join(repositoryRoot, documentPath),
      "utf8",
    );

    for (const reference of extractReferences(content)) {
      if (reference.kind === "external") {
        continue;
      }

      const reason = checkReference(reference, documentPath, repositoryRoot);
      if (reason) {
        brokenReferences.push({ documentPath, ...reference, reason });
      }
    }
  }

  const foundBroken = brokenReferences;
  return foundBroken;
}

/**
 * why: a 2xx or 3xx is all this proves. A page can answer 200 and no longer say
 * what the citing text claims, which only reading it catches.
 */
async function findBrokenExternalLinks(repositoryRoot = REPOSITORY_ROOT) {
  const externalTargets = new Map();

  for (const documentPath of listDocumentFiles(repositoryRoot)) {
    const content = fileSystem.readFileSync(
      path.join(repositoryRoot, documentPath),
      "utf8",
    );

    for (const reference of extractReferences(content)) {
      const isWebLink =
        reference.kind === "external" && /^https?:/.test(reference.target);

      if (isWebLink && !externalTargets.has(reference.target)) {
        externalTargets.set(reference.target, { documentPath, ...reference });
      }
    }
  }

  const checks = [...externalTargets.values()].map(probeExternalLink);
  const results = await Promise.all(checks);

  const brokenLinks = results.filter(Boolean);
  return brokenLinks;
}

/**
 * why: 401, 403 and 429 are a site refusing an automated request, which npm
 * and rate-limited hosts do to a script that a browser would pass. That is not
 * a broken link, and calling it one teaches the reader to ignore the report.
 */
const BLOCKED_STATUSES = new Set([401, 403, 429]);

async function probeExternalLink(reference) {
  try {
    const response = await fetch(reference.target, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      return null;
    }

    const isBlocked = BLOCKED_STATUSES.has(response.status);
    const brokenLink = {
      ...reference,
      reason: `HTTP ${response.status}`,
      isBlocked,
    };

    return brokenLink;
  } catch (error) {
    const unreachableLink = { ...reference, reason: error.message };
    return unreachableLink;
  }
}

function formatReference(broken) {
  const formattedLine = `  ${broken.documentPath}:${broken.line}  ${broken.target}  (${broken.reason})`;
  return formattedLine;
}

async function run() {
  const isExternalChecked = process.argv.includes("--external");
  const findings = findBrokenReferences();

  if (isExternalChecked) {
    findings.push(...(await findBrokenExternalLinks()));
  }

  const blockedLinks = findings.filter((finding) => finding.isBlocked);
  const brokenReferences = findings.filter((finding) => !finding.isBlocked);

  if (blockedLinks.length > 0) {
    console.warn(
      `⚠️  ${blockedLinks.length} link(s) refused the check, unverified:\n`,
    );

    blockedLinks.forEach((blocked) => console.warn(formatReference(blocked)));
    console.warn("");
  }

  if (brokenReferences.length === 0) {
    console.log("✅ No broken links or references.");
    return;
  }

  console.error(`❌ ${brokenReferences.length} broken reference(s):\n`);
  brokenReferences.forEach((broken) => console.error(formatReference(broken)));

  process.exitCode = 1;
}

export const LinkChecker = {
  extractReferences,
  collectAnchors,
  slugify,
  findBrokenReferences,
};

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  await run();
}
