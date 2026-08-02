import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { WritingLint } from "./writing-lint.mjs";

const {
  isScopedPath,
  extractContent,
  scanContent,
  formatHits,
  loadLexiconCatalog,
  parseLexiconMarkdown,
} = WritingLint;

const HOOK_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(HOOK_DIRECTORY, "../../../..");

function buildCatalog(lexiconLines, language) {
  const content = lexiconLines.join("\n");
  const entries = parseLexiconMarkdown(content, language);

  const catalog = { entries, directory: "fixture", attemptedPaths: [] };
  return catalog;
}

describe("writing-lint.isScopedPath", () => {
  it("accepts skills markdown under src/assets/skills", () => {
    const inputPath = "src/assets/skills/writing-soul.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("accepts docs markdown", () => {
    const inputPath = "docs/concepts/CONSTITUTION.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("accepts top-level README markdown", () => {
    const inputPath = "/abs/path/README.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("accepts CHANGELOG.md", () => {
    const inputPath = "/repo/CHANGELOG.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("accepts a post under the content tree", () => {
    const inputPath = "src/content/blog/seo-para-agentes.md";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("accepts an mdx post under the content tree", () => {
    const inputPath = "/repo/src/content/blog/anti-patterns.mdx";
    const actualIsScoped = isScopedPath(inputPath);

    assert.ok(actualIsScoped);
  });

  it("rejects the lexicon itself, which is a list of banned terms", () => {
    const inputPath = "src/assets/skills/lexicon/pt-BR.md";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });

  it("rejects the installed lexicon under .ai", () => {
    const inputPath = ".ai/skills/lexicon/en.md";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });

  it("rejects the checklist, which quotes real defects to teach the classes", () => {
    const inputPath = "src/assets/skills/checklist-soul.md";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });

  it("rejects working-state filenames even when path is otherwise scoped", () => {
    const inputPath = ".ai/backlog/tasks.md";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });

  it("rejects non-markdown files", () => {
    const inputPath = "src/engine/lib/domain/wizard.mjs";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });

  it("rejects empty filePath", () => {
    const inputPath = "";
    const actualIsRejected = !isScopedPath(inputPath);

    assert.ok(actualIsRejected);
  });
});

describe("writing-lint.extractContent", () => {
  it("extracts content field for Write tool", () => {
    const inputTool = "Write";
    const inputPayload = { content: "hello world" };

    const expectedContent = "hello world";
    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });

  it("extracts new_string field for Edit tool", () => {
    const inputTool = "Edit";
    const inputPayload = { old_string: "a", new_string: "b" };

    const expectedContent = "b";
    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });

  it("joins all edits[].new_string for MultiEdit tool", () => {
    const inputTool = "MultiEdit";
    const inputPayload = {
      edits: [
        { old_string: "x", new_string: "first edit" },
        { old_string: "y", new_string: "second edit" },
      ],
    };

    const expectedContent = ["first edit", "second edit"].join("\n");
    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });

  it("returns null for unsupported tool name", () => {
    const inputTool = "Read";
    const inputPayload = { file_path: "x" };

    const expectedContent = null;
    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });

  it("returns null when toolInput is missing", () => {
    const inputTool = "Write";
    const inputPayload = null;

    const expectedContent = null;
    const actualContent = extractContent(inputTool, inputPayload);

    assert.equal(actualContent, expectedContent);
  });
});

describe("writing-lint.parseLexiconMarkdown", () => {
  it("reads one entry per bullet, keyed by the heading above it", () => {
    const inputLexicon = [
      "# Lexicon: Test",
      "",
      "## Banned adverbs",
      "",
      "- simply",
      "- really",
    ].join("\n");

    const expectedTerms = ["simply", "really"];
    const expectedClassName = "Banned adverbs";
    const actualEntries = parseLexiconMarkdown(inputLexicon, "en");
    const actualTerms = actualEntries.map((entry) => entry.term);
    const actualClassName = actualEntries[0].className;

    assert.deepEqual(actualTerms, expectedTerms);
    assert.equal(actualClassName, expectedClassName);
  });

  it("splits the accepted replacement written after the arrow", () => {
    const inputLexicon = ["## Banned jargon", "", "- navigate → handle"].join(
      "\n",
    );

    const expectedTerm = "navigate";
    const expectedSuggestion = "handle";
    const actualEntries = parseLexiconMarkdown(inputLexicon, "en");
    const actualTerm = actualEntries[0].term;
    const actualSuggestion = actualEntries[0].suggestion;

    assert.equal(actualTerm, expectedTerm);
    assert.equal(actualSuggestion, expectedSuggestion);
  });

  it("ignores bullets inside a fenced block, which document the format", () => {
    const inputLexicon = [
      "## How this file is read",
      "",
      "```",
      "- fenced → ignored",
      "```",
      "",
      "## Banned adverbs",
      "",
      "- simply",
    ].join("\n");

    const expectedTerms = ["simply"];
    const actualEntries = parseLexiconMarkdown(inputLexicon, "en");
    const actualTerms = actualEntries.map((entry) => entry.term);

    assert.deepEqual(actualTerms, expectedTerms);
  });

  it("ignores bullets that appear before any class heading", () => {
    const inputLexicon = ["# Lexicon: Test", "", "- orphan bullet"].join("\n");

    const expectedEntries = [];
    const actualEntries = parseLexiconMarkdown(inputLexicon, "en");

    assert.deepEqual(actualEntries, expectedEntries);
  });

  it("carries the language it was parsed from", () => {
    const inputLexicon = ["## Banned adverbs", "", "- simplesmente"].join("\n");

    const expectedLanguage = "pt-BR";
    const actualEntries = parseLexiconMarkdown(inputLexicon, "pt-BR");
    const actualLanguage = actualEntries[0].language;

    assert.equal(actualLanguage, expectedLanguage);
  });
});

describe("writing-lint.loadLexiconCatalog", () => {
  it("loads both shipped lexicons from the repository root", () => {
    const inputRoot = REPOSITORY_ROOT;

    const expectedLanguages = ["en", "pt-BR"];
    const actualCatalog = loadLexiconCatalog(inputRoot);
    const actualLanguages = [
      ...new Set(actualCatalog.entries.map((entry) => entry.language)),
    ].sort();

    const actualHasEntries = actualCatalog.entries.length > 0;

    assert.deepEqual(actualLanguages, expectedLanguages);
    assert.ok(actualHasEntries);
  });

  it("reports every path it tried when no lexicon directory exists", () => {
    const inputRoot = path.join(REPOSITORY_ROOT, "no-such-project-root");

    const expectedDirectory = null;
    const expectedAttemptCount = 2;
    const expectedEntryCount = 0;
    const actualCatalog = loadLexiconCatalog(inputRoot);
    const actualDirectory = actualCatalog.directory;
    const actualAttemptCount = actualCatalog.attemptedPaths.length;
    const actualEntryCount = actualCatalog.entries.length;

    assert.equal(actualDirectory, expectedDirectory);
    assert.equal(actualAttemptCount, expectedAttemptCount);
    assert.equal(actualEntryCount, expectedEntryCount);
  });
});

describe("writing-lint.scanContent", () => {
  it("flags a banned adverb case-insensitively", () => {
    const inputCatalog = buildCatalog(["## Banned adverbs", "- simply"], "en");
    const inputContent = [
      "# Title",
      "",
      "This is Simply a test of banned terms.",
    ].join("\n");

    const expectedHitLine = 3;
    const expectedTerm = "simply";
    const actualHits = scanContent(
      inputContent,
      "docs/sample.md",
      inputCatalog,
    );

    const actualHitLine = actualHits[0].line;
    const actualTerm = actualHits[0].term;

    assert.equal(actualHitLine, expectedHitLine);
    assert.equal(actualTerm, expectedTerm);
  });

  it("flags an accented Portuguese term, where an ASCII boundary fails", () => {
    const inputCatalog = buildCatalog(
      ["## Banned adverbs", "- simplesmente"],
      "pt-BR",
    );

    const inputContent = "O parser simplesmente ignora a linha.";

    const expectedLanguage = "pt-BR";
    const expectedHitCount = 1;
    const actualHits = scanContent(
      inputContent,
      "src/content/post.md",
      inputCatalog,
    );

    const actualHitCount = actualHits.length;
    const actualLanguage = actualHits[0].language;

    assert.equal(actualHitCount, expectedHitCount);
    assert.equal(actualLanguage, expectedLanguage);
  });

  it("does not fire on a term embedded in a longer word", () => {
    const inputCatalog = buildCatalog(["## Banned adverbs", "- just"], "en");
    const inputContent = "The parser will adjust the boundary.";

    const expectedHits = [];
    const actualHits = scanContent(
      inputContent,
      "docs/sample.md",
      inputCatalog,
    );

    assert.deepEqual(actualHits, expectedHits);
  });

  it("flags a phrase that ends in punctuation", () => {
    const inputCatalog = buildCatalog(
      ["## Banned openers", "- Here's the thing:"],
      "en",
    );

    const inputContent = "Here's the thing: this is bad copy.";

    const expectedClassName = "Banned openers";
    const actualHits = scanContent(inputContent, "docs/intro.md", inputCatalog);
    const actualClassName = actualHits[0].className;

    assert.equal(actualClassName, expectedClassName);
  });

  it("returns empty array for empty content", () => {
    const inputCatalog = buildCatalog(["## Banned adverbs", "- simply"], "en");
    const inputContent = "";

    const expectedHits = [];
    const actualHits = scanContent(inputContent, "docs/empty.md", inputCatalog);

    assert.deepEqual(actualHits, expectedHits);
  });

  it("returns empty array for clean prose", () => {
    const inputCatalog = buildCatalog(["## Banned adverbs", "- simply"], "en");
    const inputContent = [
      "# Pedagogical title",
      "",
      "Treat the reader as a peer. Explain the model first.",
    ].join("\n");

    const expectedHits = [];
    const actualHits = scanContent(inputContent, "docs/clean.md", inputCatalog);

    assert.deepEqual(actualHits, expectedHits);
  });
});

describe("writing-lint.formatHits", () => {
  it("names the class and the language of every hit", () => {
    const inputHits = [
      {
        filePath: "docs/x.md",
        line: 12,
        term: "simply",
        suggestion: null,
        className: "Banned adverbs",
        language: "en",
      },
    ];

    const expectedLine = 'docs/x.md:12 Banned adverbs (en): "simply"';
    const actualOutput = formatHits(inputHits);

    assert.equal(actualOutput, expectedLine);
  });

  it("appends the accepted replacement when the lexicon carries one", () => {
    const inputHits = [
      {
        filePath: "a.md",
        line: 4,
        term: "navigate",
        suggestion: "handle",
        className: "Banned jargon",
        language: "en",
      },
    ];

    const expectedLine = 'a.md:4 Banned jargon (en): "navigate" → "handle"';
    const actualOutput = formatHits(inputHits);

    assert.equal(actualOutput, expectedLine);
  });

  it("joins multiple hits with newlines", () => {
    const inputHits = [
      {
        filePath: "a.md",
        line: 1,
        term: "just",
        suggestion: null,
        className: "Banned adverbs",
        language: "en",
      },
      {
        filePath: "a.md",
        line: 4,
        term: "moram",
        suggestion: "aparecem",
        className: "Physical metaphor for mechanics",
        language: "pt-BR",
      },
    ];

    const expectedLines = [
      'a.md:1 Banned adverbs (en): "just"',
      'a.md:4 Physical metaphor for mechanics (pt-BR): "moram" → "aparecem"',
    ].join("\n");

    const actualOutput = formatHits(inputHits);

    assert.equal(actualOutput, expectedLines);
  });
});
