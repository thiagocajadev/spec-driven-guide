import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "prune-backlog.mjs");
const SEED_TEMPLATE_PATH = path.join(
  __dirname,
  "../../instructions/templates/backlog/tasks.md",
);

function makeTempProject() {
  const projectDir = fileSystem.mkdtempSync(
    path.join(os.tmpdir(), "sdg-prune-test-"),
  );

  const backlogDir = path.join(projectDir, ".ai", "backlog");
  fileSystem.mkdirSync(backlogDir, { recursive: true });
  return { projectDir, backlogDir };
}

function writeTasks(backlogDir, content) {
  const tasksPath = path.join(backlogDir, "tasks.md");
  fileSystem.writeFileSync(tasksPath, content);
  return tasksPath;
}

function runScript(projectDir, args = []) {
  const stdout = execFileSync("node", [SCRIPT_PATH, ...args], {
    cwd: projectDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return stdout;
}

function cleanup(projectDir) {
  fileSystem.rmSync(projectDir, { recursive: true, force: true });
}

/**
 * Reads the shipped template rather than a fixture: a template edit that breaks
 * the script's contract must fail here, not in a consumer's first prune.
 */
function readSeedTemplate() {
  const templateContent = fileSystem.readFileSync(SEED_TEMPLATE_PATH, "utf8");
  return templateContent;
}

function buildTasksWithDone(entryCount) {
  const doneEntries = Array.from(
    { length: entryCount },
    (_, index) => `- [DONE] entry ${entryCount - index} description text`,
  ).join("\n");

  const content = `# Tasks\n\n## Active\n\n- _(idle)_\n\n## Done\n\n${doneEntries}\n`;
  return content;
}

describe("prune-backlog.mjs", () => {
  it("should keep only N most recent Done entries when total exceeds N", () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = buildTasksWithDone(7);
    const tasksPath = writeTasks(backlogDir, inputContent);

    const expectedFirstKept = "- [DONE] entry 7 description text";
    const expectedLastKept = "- [DONE] entry 5 description text";
    const expectedDropped = "- [DONE] entry 4 description text";

    try {
      const stdout = runScript(projectDir, ["--keep", "3"]);
      const actualContent = fileSystem.readFileSync(tasksPath, "utf8");

      const actualIncludesPrunedMsg = stdout.includes("Pruned: kept 3 / 7");
      const actualIncludesFirstKept = actualContent.includes(expectedFirstKept);
      const actualIncludesLastKept = actualContent.includes(expectedLastKept);
      const actualHasNoDropped = !actualContent.includes(expectedDropped);

      assert.ok(actualIncludesPrunedMsg);
      assert.ok(actualIncludesFirstKept);
      assert.ok(actualIncludesLastKept);
      assert.ok(actualHasNoDropped);
    } finally {
      cleanup(projectDir);
    }
  });

  it("should be idempotent when total entries already at or below keep threshold", () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = buildTasksWithDone(2);
    const tasksPath = writeTasks(backlogDir, inputContent);

    const expectedContent = inputContent;

    try {
      const stdout = runScript(projectDir, ["--keep", "3"]);
      const actualContent = fileSystem.readFileSync(tasksPath, "utf8");
      const actualIncludesNothingToPrune = stdout.includes("Nothing to prune");

      assert.ok(actualIncludesNothingToPrune);
      assert.equal(actualContent, expectedContent);
    } finally {
      cleanup(projectDir);
    }
  });

  it("should default to keep=3 when --keep flag is omitted", () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = buildTasksWithDone(5);
    const tasksPath = writeTasks(backlogDir, inputContent);

    try {
      runScript(projectDir, []);
      const actualContent = fileSystem.readFileSync(tasksPath, "utf8");
      const actualEntryMatches = actualContent.match(/^- \[DONE\]/gm);
      const actualEntryCount = actualEntryMatches
        ? actualEntryMatches.length
        : 0;

      const expectedEntryCount = 3;

      assert.equal(actualEntryCount, expectedEntryCount);
    } finally {
      cleanup(projectDir);
    }
  });

  it("should preserve non-Done sections untouched", () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = `# Tasks\n\n## Active\n\n- [IN_PROGRESS] live task\n\n## Backlog\n\n- [BACKLOG] pending item\n\n## Done\n\n- [DONE] old 1\n- [DONE] old 2\n- [DONE] old 3\n- [DONE] old 4\n`;
    const tasksPath = writeTasks(backlogDir, inputContent);

    try {
      runScript(projectDir, ["--keep", "2"]);
      const actualContent = fileSystem.readFileSync(tasksPath, "utf8");

      const actualIncludesInProgress = actualContent.includes(
        "- [IN_PROGRESS] live task",
      );

      const actualIncludesBacklog = actualContent.includes(
        "- [BACKLOG] pending item",
      );

      const actualIncludesDoneOld1 = actualContent.includes("- [DONE] old 1");
      const actualIncludesDoneOld2 = actualContent.includes("- [DONE] old 2");
      const actualHasNoDoneOld3 = !actualContent.includes("- [DONE] old 3");
      const actualHasNoDoneOld4 = !actualContent.includes("- [DONE] old 4");

      assert.ok(actualIncludesInProgress);
      assert.ok(actualIncludesBacklog);
      assert.ok(actualIncludesDoneOld1);
      assert.ok(actualIncludesDoneOld2);
      assert.ok(actualHasNoDoneOld3);
      assert.ok(actualHasNoDoneOld4);
    } finally {
      cleanup(projectDir);
    }
  });

  it("should exit 1 when the Done section holds no recognizable entry", () => {
    const { projectDir, backlogDir } = makeTempProject();

    const inputContent = [
      "# Tasks",
      "",
      "## Done",
      "",
      "* 2026-07-22 shipped the release",
      "* 2026-07-21 fixed the gate",
      "",
    ].join("\n");

    writeTasks(backlogDir, inputContent);

    try {
      assert.throws(() => runScript(projectDir, ["--keep", "3"]));
    } finally {
      cleanup(projectDir);
    }
  });

  it("should stay quiet when the Done section is explicitly empty", () => {
    const { projectDir, backlogDir } = makeTempProject();

    const inputContent = [
      "# Tasks",
      "",
      "## Done",
      "",
      "_(empty — nothing shipped yet)_",
      "",
    ].join("\n");

    const tasksPath = writeTasks(backlogDir, inputContent);

    const expectedContent = inputContent;

    try {
      const stdout = runScript(projectDir, ["--keep", "3"]);
      const actualContent = fileSystem.readFileSync(tasksPath, "utf8");
      const actualIncludesNothingToPrune = stdout.includes("Nothing to prune");

      assert.ok(actualIncludesNothingToPrune);
      assert.equal(actualContent, expectedContent);
    } finally {
      cleanup(projectDir);
    }
  });

  it("should stay quiet on the seed template a fresh project starts from", () => {
    const { projectDir, backlogDir } = makeTempProject();
    const inputContent = readSeedTemplate();
    const tasksPath = writeTasks(backlogDir, inputContent);

    const expectedContent = inputContent;

    try {
      const stdout = runScript(projectDir, ["--keep", "3"]);
      const actualContent = fileSystem.readFileSync(tasksPath, "utf8");
      const actualIncludesNothingToPrune = stdout.includes("Nothing to prune");

      assert.ok(actualIncludesNothingToPrune);
      assert.equal(actualContent, expectedContent);
    } finally {
      cleanup(projectDir);
    }
  });

  it("should model the bulleted DONE marker in the seed template", () => {
    const templateContent = readSeedTemplate();

    const expectedMarker = "<!-- - [DONE] description -->";
    const actualIncludesMarker = templateContent.includes(expectedMarker);

    assert.ok(actualIncludesMarker);
  });

  it("should exit 1 when tasks.md is missing", () => {
    const { projectDir } = makeTempProject();

    try {
      assert.throws(() => runScript(projectDir, ["--keep", "3"]));
    } finally {
      cleanup(projectDir);
    }
  });
});
