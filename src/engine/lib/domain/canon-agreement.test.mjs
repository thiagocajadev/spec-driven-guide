import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { InstructionAssembler } from "./instruction-assembler.mjs";

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const ASSETS = path.join(REPOSITORY_ROOT, "src", "assets");
const WORKFLOW_PATH = path.join(
  ASSETS,
  "instructions",
  "templates",
  "workflow.md",
);
const COMMANDS_DIRECTORY = path.join(ASSETS, "instructions", "commands");
const VERSIONING_PATH = path.join(ASSETS, "skills", "versioning.md");
const COMMIT_MSG_PATH = path.join(ASSETS, "tooling", "husky", "commit-msg");
const RELEASE_CONFIG_PATH = path.join(
  ASSETS,
  "tooling",
  "github-actions",
  "release-please-config.json",
);
const GUARDRAIL_COPIES = [
  path.join(REPOSITORY_ROOT, "README.md"),
  path.join(REPOSITORY_ROOT, "docs", "reference", "CHEATSHEET.md"),
];
const TRANSLATED_GUARDRAIL_COPIES = [
  path.join(REPOSITORY_ROOT, "README.pt-BR.md"),
];

/**
 * why: each rule below is written once in its canon file and restated in
 * another, because a different reader needs it there. The bump table drifted
 * from `bump.mjs` that way and turned the gate red, and the Guardrails table
 * kept a renamed row in two copies until a hand sweep found it. Each test
 * reads both sides, so the copy cannot outlive the rule.
 */
describe("canon agreement", () => {
  it("maps each cycle to the changelog section release-please uses", () => {
    const workflowText = readText(WORKFLOW_PATH);
    const mappingLine = workflowText
      .split("\n")
      .find((line) => line.includes("Section mapping"));

    const workflowSections = Object.fromEntries(
      [...mappingLine.matchAll(/`(\w+):` → `### (\w+)`/g)].map((match) => [
        match[1],
        match[2],
      ]),
    );

    const configSections = Object.fromEntries(
      readJson(RELEASE_CONFIG_PATH).packages["."]["changelog-sections"].map(
        (section) => [section.type, section.section],
      ),
    );

    const mappedTypes = Object.keys(workflowSections);
    const expectedSections = mappedTypes.map((type) => configSections[type]);
    const actualSections = mappedTypes.map((type) => workflowSections[type]);
    const hasMappedTypes = mappedTypes.length > 0;

    assert.ok(hasMappedTypes, "workflow.md maps no cycle to a section");
    assert.deepEqual(actualSections, expectedSections);
  });

  it("lists the commit types the commit-msg hook accepts", () => {
    const versioningText = readText(VERSIONING_PATH);
    const typesLine = versioningText
      .split("\n")
      .find((line) => line.includes("Types are"));

    const expectedTypes = readAcceptedTypes().sort();
    const actualTypes = [...typesLine.matchAll(/`(\w+)`/g)]
      .map((match) => match[1])
      .sort();

    assert.deepEqual(actualTypes, expectedTypes);
  });

  it("routes exactly the cycles that have a command file", () => {
    const routerText = InstructionAssembler.buildMasterInstructions({
      flavor: "lite",
    });

    const expectedCycles = fileSystem
      .readdirSync(COMMANDS_DIRECTORY)
      .map((fileName) => fileName.match(/^sdg-(\w+)\.md$/)?.[1])
      .filter(Boolean)
      .sort();

    const actualCycles = [
      ...routerText.matchAll(/`(\w+):` → `\.ai\/kit\/commands\/sdg-\1\.md`/g),
    ]
      .map((match) => match[1])
      .sort();

    assert.deepEqual(actualCycles, expectedCycles);
  });

  it("names the five phases in the same order in workflow.md and the router", () => {
    const workflowText = readText(WORKFLOW_PATH);
    const routerText = InstructionAssembler.buildMasterInstructions({
      flavor: "lite",
    });

    const phasesSection = workflowText.match(/## 5 Phases\n([\s\S]*?)\n## /);

    const expectedPhases = [...phasesSection[1].matchAll(/^- \*\*(\w+)\*\*/gm)]
      .map((match) => match[1])
      .join(" → ");

    const actualPhases = routerText.match(/\((\w+(?: → \w+)+)\)/)?.[1];

    assert.equal(actualPhases, expectedPhases);
  });

  it("keeps every copy of the Guardrails table on the canon's rows", () => {
    const canonNames = readGuardrailNames(readText(WORKFLOW_PATH));

    const expectedCopies = GUARDRAIL_COPIES.map(() => canonNames);
    const actualCopies = GUARDRAIL_COPIES.map((copyPath) =>
      readGuardrailNames(readText(copyPath)),
    );

    const expectedRowCounts = TRANSLATED_GUARDRAIL_COPIES.map(
      () => canonNames.length,
    );

    const actualRowCounts = TRANSLATED_GUARDRAIL_COPIES.map(
      (copyPath) => readGuardrailNames(readText(copyPath)).length,
    );

    const hasCanonRows = canonNames.length > 0;

    assert.ok(hasCanonRows, "workflow.md has no Guardrails table");
    assert.deepEqual(actualCopies, expectedCopies);
    assert.deepEqual(actualRowCounts, expectedRowCounts);
  });
});

function readText(targetPath) {
  const content = fileSystem.readFileSync(targetPath, "utf8");
  return content;
}

function readJson(targetPath) {
  const parsedContent = JSON.parse(readText(targetPath));
  return parsedContent;
}

// why: the hook is the only place the accepted type list exists.
function readAcceptedTypes() {
  const hookContent = readText(COMMIT_MSG_PATH);
  const patternMatch = hookContent.match(/\^\(([a-z|]+)\)/);

  const acceptedTypes = patternMatch[1].split("|");
  return acceptedTypes;
}

function readGuardrailNames(markdown) {
  const lines = markdown.split("\n");
  const headerIndex = lines.findIndex((line) =>
    /^\| Guardrail\s+\|/.test(line),
  );

  if (headerIndex === -1) {
    const noTable = [];
    return noTable;
  }

  const rowLines = lines.slice(headerIndex + 2);
  const tableEnd = rowLines.findIndex((line) => !line.startsWith("|"));
  const tableRows = tableEnd === -1 ? rowLines : rowLines.slice(0, tableEnd);

  const guardrailNames = tableRows.map((row) =>
    row.split("|")[1].replace(/\*\*/g, "").trim(),
  );

  return guardrailNames;
}
