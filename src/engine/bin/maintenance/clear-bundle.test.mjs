import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { Cleaner } from "./clear-bundle.mjs";

const { findBacklogsAtRisk } = Cleaner;

describe("Cleaner.findBacklogsAtRisk()", () => {
  let tempDir;

  before(() => {
    tempDir = fileSystem.mkdtempSync(path.join(os.tmpdir(), "sdg-clear-test-"));
  });

  after(() => {
    fileSystem.rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns empty when items list has no .ai entry", () => {
    const input = [
      { name: ".sdg-prompts", fullPath: path.join(tempDir, ".sdg-prompts") },
    ];

    const expected = [];

    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });

  it("returns empty when .ai/backlog/ does not exist", () => {
    const aiDir = path.join(tempDir, "case-no-backlog", ".ai");
    fileSystem.mkdirSync(aiDir, { recursive: true });
    const input = [{ name: ".ai", fullPath: aiDir }];

    const expected = [];
    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });

  it("returns empty when .ai/backlog/ exists but is empty", () => {
    const aiDir = path.join(tempDir, "case-empty-backlog", ".ai");
    fileSystem.mkdirSync(path.join(aiDir, "backlog"), { recursive: true });
    const input = [{ name: ".ai", fullPath: aiDir }];

    const expected = [];
    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });

  it("returns backlog path when .ai/backlog/ has content", () => {
    const aiDir = path.join(tempDir, "case-populated", ".ai");
    const backlogDir = path.join(aiDir, "backlog");
    fileSystem.mkdirSync(backlogDir, { recursive: true });
    fileSystem.writeFileSync(path.join(backlogDir, "tasks.md"), "# Active\n");
    const input = [{ name: ".ai", fullPath: aiDir }];

    const expected = [backlogDir];
    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });

  it("detects populated backlog inside monorepo packages", () => {
    const monoAiDir = path.join(tempDir, "monorepo", "packages", "foo", ".ai");
    const monoBacklog = path.join(monoAiDir, "backlog");
    fileSystem.mkdirSync(monoBacklog, { recursive: true });
    fileSystem.writeFileSync(path.join(monoBacklog, "learned.md"), "lesson");
    const input = [{ name: "packages/foo/.ai", fullPath: monoAiDir }];

    const expected = [monoBacklog];
    const actual = findBacklogsAtRisk(input);

    assert.deepEqual(actual, expected);
  });
});
