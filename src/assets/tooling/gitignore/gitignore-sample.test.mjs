import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { InstructionAssembler } from "../../../engine/lib/domain/instruction-assembler.mjs";

const { writeGitignore } = InstructionAssembler;

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_PATH = path.join(currentDirectory, "sdg.gitignore");

const BLOCK_START = "# >>> spec-driven-guide, managed block";
const BLOCK_END = "# <<< spec-driven-guide";

function extractManagedBlock(content) {
  const start = content.indexOf(BLOCK_START);
  const end = content.indexOf(BLOCK_END) + BLOCK_END.length;

  const managedBlock = content.slice(start, end);
  return managedBlock;
}

describe("GitignoreSample", () => {
  /**
   * why: the sample and the writer state the same rule in two files, and two
   * copies of a rule drift by the second release. This test is what keeps them
   * one: it compares the sample's block against the block an install actually
   * writes, so a change to `MANAGED_BLOCKS` fails here until the sample follows.
   */
  it("carries the same managed block an install writes", () => {
    const temporaryRoot = fileSystem.mkdtempSync(
      path.join(os.tmpdir(), "sdg-sample-"),
    );

    try {
      writeGitignore(temporaryRoot);

      const writtenContent = fileSystem.readFileSync(
        path.join(temporaryRoot, ".gitignore"),
        "utf8",
      );

      const sampleContent = fileSystem.readFileSync(SAMPLE_PATH, "utf8");

      const actualSampleBlock = extractManagedBlock(sampleContent);
      const expectedWrittenBlock = extractManagedBlock(writtenContent);

      assert.equal(actualSampleBlock, expectedWrittenBlock);
    } finally {
      fileSystem.rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("keeps the developer sections above the managed block", () => {
    const sampleContent = fileSystem.readFileSync(SAMPLE_PATH, "utf8");

    const actualDependenciesIndex = sampleContent.indexOf("node_modules/");
    const expectedBlockIndex = sampleContent.indexOf(BLOCK_START);

    const isDeveloperSectionFirst =
      actualDependenciesIndex < expectedBlockIndex;

    assert.ok(isDeveloperSectionFirst);
  });
});
