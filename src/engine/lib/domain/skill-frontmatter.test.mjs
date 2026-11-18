import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { InstructionAssembler } from "./instruction-assembler.mjs";

const SKILLS_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../assets/skills",
);

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;
const ROUTED_SKILL = /\.ai\/kit\/skills\/([\w-]+)\.md/g;

/**
 * why: the frontmatter makes each skill readable by tooling that indexes the
 * Agent Skills format, and its `description` replaced the "Load in" line each
 * file used to open with. A skill without it, or named apart from its file,
 * would be invisible to that tooling and to the router check below.
 */
describe("skill frontmatter", () => {
  it("gives every skill a name equal to its file and a description", () => {
    const skillFiles = listSkillFiles();

    const expectedGaps = [];
    const actualGaps = skillFiles.flatMap((fileName) =>
      findFrontmatterGaps(fileName, readSkill(fileName)),
    );

    assert.deepEqual(actualGaps, expectedGaps);
  });

  it("routes only to skills that exist and carry frontmatter", () => {
    const routerText = InstructionAssembler.buildMasterInstructions({
      flavor: "vertical-slice",
    });

    const skillFiles = new Set(listSkillFiles());
    const routedFiles = [...routerText.matchAll(ROUTED_SKILL)].map(
      (match) => `${match[1]}.md`,
    );

    const expectedMissing = [];
    const actualMissing = routedFiles.filter(
      (fileName) => !skillFiles.has(fileName),
    );

    const hasRoutedSkills = routedFiles.length > 0;

    assert.ok(hasRoutedSkills, "the router lists no skill at all");
    assert.deepEqual(actualMissing, expectedMissing);
  });

  it("reports a skill planted without frontmatter", () => {
    const plantedContent = "# Planted\n\n> Load in Phase CODE.\n";

    const expectedGaps = ["planted.md: no frontmatter"];
    const actualGaps = findFrontmatterGaps("planted.md", plantedContent);

    assert.deepEqual(actualGaps, expectedGaps);
  });

  it("reports a planted name that differs from the file, and an empty description", () => {
    const plantedContent = "---\nname: other\ndescription:\n---\n\n# Planted\n";

    const expectedGaps = [
      'planted.md: name "other" is not the file name',
      "planted.md: empty description",
    ];

    const actualGaps = findFrontmatterGaps("planted.md", plantedContent);

    assert.deepEqual(actualGaps, expectedGaps);
  });
});

function listSkillFiles() {
  const skillFiles = fileSystem
    .readdirSync(SKILLS_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".md"));

  return skillFiles;
}

function readSkill(fileName) {
  const content = fileSystem.readFileSync(
    path.join(SKILLS_DIRECTORY, fileName),
    "utf8",
  );

  return content;
}

function findFrontmatterGaps(fileName, content) {
  const frontmatterMatch = content.match(FRONTMATTER);

  if (frontmatterMatch === null) {
    const missingGaps = [`${fileName}: no frontmatter`];
    return missingGaps;
  }

  const fields = readFields(frontmatterMatch[1]);
  const stem = path.basename(fileName, ".md");

  const nameGaps =
    fields.name === stem
      ? []
      : [`${fileName}: name "${fields.name}" is not the file name`];

  const descriptionGaps = fields.description
    ? []
    : [`${fileName}: empty description`];

  const frontmatterGaps = [...nameGaps, ...descriptionGaps];
  return frontmatterGaps;
}

function readFields(frontmatterBody) {
  const fieldEntries = frontmatterBody
    .split("\n")
    .map((line) => line.match(/^(\w+):\s*(.*)$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.trim()]);

  const fields = Object.fromEntries(fieldEntries);
  return fields;
}
