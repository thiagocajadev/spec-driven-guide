import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(currentDirectory, "../../../..");
const ACTIVATED_CLAUDE_REVIEWER = path.join(
  PROJECT_ROOT,
  ".claude",
  "agents",
  "reviewer.md",
);
const MARKDOWN_ADAPTERS = [
  "reviewer.claude-code.md",
  "reviewer.cursor.md",
  "reviewer.copilot.agent.md",
  "reviewer.gemini-cli.md",
  "reviewer.opencode.md",
];
const CODEX_ADAPTER = "reviewer.codex.toml";
const CANON_ADAPTER = "reviewer.claude-code.md";
const HARNESS_CONTEXT_FILES = ["agents.md", "claude.md", "gemini.md"];
const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const CODEX_INSTRUCTIONS_PATTERN =
  /developer_instructions = '''\n([\s\S]*?)'''/;

function readAdapter(fileName) {
  const adapterText = fileSystem.readFileSync(
    path.join(currentDirectory, fileName),
    "utf8",
  );

  return adapterText;
}

function splitFrontmatter(adapterText) {
  const [, frontmatter, body] = adapterText.match(FRONTMATTER_PATTERN);

  const adapterParts = { frontmatter, body: body.trim() };
  return adapterParts;
}

function readFrontmatterValue(frontmatter, key) {
  const valueLine = frontmatter
    .split("\n")
    .find((line) => line.startsWith(`${key}:`));

  const value = valueLine?.slice(key.length + 1).trim();
  return value;
}

function readFrontmatterList(frontmatter, key) {
  const lines = frontmatter.split("\n");
  const keyIndex = lines.indexOf(`${key}:`);

  if (keyIndex === -1) {
    const missingList = [];
    return missingList;
  }

  const listLines = lines.slice(keyIndex + 1);
  const firstOtherLine = listLines.findIndex(
    (line) => !line.startsWith("  - "),
  );

  const listEnd = firstOtherLine === -1 ? listLines.length : firstOtherLine;

  const listValues = listLines
    .slice(0, listEnd)
    .map((line) => line.replace("  - ", "").trim());

  return listValues;
}

function hasOnly(actualValues, allowedValues) {
  const isSubset = actualValues.every((value) => allowedValues.includes(value));
  return isSubset;
}

/**
 * why: one reviewer is written six times because each harness reads its own
 * file format, and the six drift the moment one is edited alone. These tests
 * hold the instructions to one text and each harness to read-only access,
 * except Codex, whose custom agents cannot narrow the parent's sandbox.
 */
describe("reviewer agent adapters", () => {
  it("names no adapter after a file a harness loads as instructions", () => {
    const adapterNames = fileSystem
      .readdirSync(currentDirectory)
      .map((fileName) => fileName.toLowerCase());

    const expectedCollisions = [];
    const actualCollisions = adapterNames.filter((fileName) =>
      HARNESS_CONTEXT_FILES.includes(fileName),
    );

    assert.deepEqual(actualCollisions, expectedCollisions);
  });

  it("describes the reviewer to every harness that picks agents by description", () => {
    const expectedMissing = [];
    const actualMissing = MARKDOWN_ADAPTERS.filter((fileName) => {
      const { frontmatter } = splitFrontmatter(readAdapter(fileName));
      const description = readFrontmatterValue(frontmatter, "description");

      const isMissing = !description;
      return isMissing;
    });

    assert.deepEqual(actualMissing, expectedMissing);
  });

  it("names the reviewer where the harness reads the name from the file", () => {
    const namedAdapters = MARKDOWN_ADAPTERS.filter(
      (fileName) => fileName !== "reviewer.opencode.md",
    );

    const expectedName = "reviewer";
    const actualNames = namedAdapters.map((fileName) =>
      readFrontmatterValue(
        splitFrontmatter(readAdapter(fileName)).frontmatter,
        "name",
      ),
    );

    const expectedNames = namedAdapters.map(() => expectedName);
    const codexName = readAdapter(CODEX_ADAPTER).match(/^name = "(.+)"$/m);
    const actualCodexName = codexName?.at(1);

    assert.deepEqual(actualNames, expectedNames);
    assert.equal(actualCodexName, expectedName);
  });

  it("gives every harness the same reviewer instructions", () => {
    const expectedBody = splitFrontmatter(readAdapter(CANON_ADAPTER)).body;
    const actualBodies = MARKDOWN_ADAPTERS.map(
      (fileName) => splitFrontmatter(readAdapter(fileName)).body,
    );

    const codexInstructions = readAdapter(CODEX_ADAPTER).match(
      CODEX_INSTRUCTIONS_PATTERN,
    );

    const actualCodexBody = codexInstructions?.at(1).trim();

    const expectedBodies = MARKDOWN_ADAPTERS.map(() => expectedBody);

    assert.deepEqual(actualBodies, expectedBodies);
    assert.equal(actualCodexBody, expectedBody);
  });

  it("runs the Claude Code reviewer below the author's model, read-only", () => {
    const { frontmatter } = splitFrontmatter(
      readAdapter("reviewer.claude-code.md"),
    );

    const actualTools = readFrontmatterValue(frontmatter, "tools").split(", ");
    const actualModel = readFrontmatterValue(frontmatter, "model");

    const allowedTools = ["Read", "Grep", "Glob"];
    const cheaperModels = ["sonnet", "haiku"];
    const hasReadOnlyTools = hasOnly(actualTools, allowedTools);
    const isCheaperModel = cheaperModels.includes(actualModel);

    assert.ok(hasReadOnlyTools, `claude-code adapter grants ${actualTools}`);
    assert.ok(isCheaperModel, `claude-code adapter runs on ${actualModel}`);
  });

  it("keeps the Cursor and Copilot reviewers read-only", () => {
    const cursorFrontmatter = splitFrontmatter(
      readAdapter("reviewer.cursor.md"),
    ).frontmatter;

    const copilotFrontmatter = splitFrontmatter(
      readAdapter("reviewer.copilot.agent.md"),
    ).frontmatter;

    const expectedReadonly = "true";
    const actualReadonly = readFrontmatterValue(cursorFrontmatter, "readonly");
    const actualCopilotTools = JSON.parse(
      readFrontmatterValue(copilotFrontmatter, "tools"),
    );

    const hasReadOnlyCopilotTools = hasOnly(actualCopilotTools, [
      "read",
      "search",
    ]);

    assert.equal(actualReadonly, expectedReadonly);
    assert.ok(hasReadOnlyCopilotTools, `copilot grants ${actualCopilotTools}`);
  });

  it("keeps the Gemini CLI and OpenCode reviewers read-only", () => {
    const geminiFrontmatter = splitFrontmatter(
      readAdapter("reviewer.gemini-cli.md"),
    ).frontmatter;

    const opencodeFrontmatter = splitFrontmatter(
      readAdapter("reviewer.opencode.md"),
    ).frontmatter;

    const actualGeminiTools = readFrontmatterList(geminiFrontmatter, "tools");
    const hasReadOnlyGeminiTools = hasOnly(actualGeminiTools, [
      "read_file",
      "grep_search",
      "glob",
      "list_directory",
    ]);

    const deniesEdit = /action: edit\n\s+resource: "\*"\n\s+effect: deny/.test(
      opencodeFrontmatter,
    );

    const deniesShell =
      /action: shell\n\s+resource: "\*"\n\s+effect: deny/.test(
        opencodeFrontmatter,
      );

    assert.ok(hasReadOnlyGeminiTools, `gemini grants ${actualGeminiTools}`);
    assert.ok(deniesEdit, "the opencode adapter must deny edit");
    assert.ok(deniesShell, "the opencode adapter must deny shell");
  });

  it("keeps an activated Claude Code reviewer equal to its template", (test) => {
    const isActivated = fileSystem.existsSync(ACTIVATED_CLAUDE_REVIEWER);

    if (!isActivated) {
      test.skip("no .claude/agents/reviewer.md in this project");
      return;
    }

    const expectedReviewer = readAdapter("reviewer.claude-code.md");
    const actualReviewer = fileSystem.readFileSync(
      ACTIVATED_CLAUDE_REVIEWER,
      "utf8",
    );

    assert.equal(actualReviewer, expectedReviewer);
  });
});
