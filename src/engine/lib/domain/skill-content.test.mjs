import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "..", "..", "..", "assets");

const WORKFLOW = path.join(ASSETS, "instructions", "templates", "workflow.md");
const CODE_STYLE = path.join(ASSETS, "skills", "code-style.md");
const LAND_COMMAND = path.join(
  ASSETS,
  "instructions",
  "commands",
  "sdg-land.md",
);
const STACK_TEMPLATE = path.join(
  ASSETS,
  "instructions",
  "templates",
  "backlog",
  "stack.md",
);
const DELIVERY_COMPETENCY = path.join(
  ASSETS,
  "instructions",
  "competencies",
  "delivery.md",
);

function readAsset(assetPath) {
  const content = fileSystem.readFileSync(assetPath, "utf8");
  return content;
}

describe("Skill Content — Governance Layer", () => {
  describe("code-style.md essentials", () => {
    it("opens with a two-line Security-First block", () => {
      const input = readAsset(CODE_STYLE);

      const expectedFragments = [
        "## Security first",
        "Default deny at every boundary",
        "Never concatenate user input",
      ];

      const actualMissing = expectedFragments.filter(
        (fragment) => !input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualMissing,
        expectedEmpty,
        "Security-first block must be explicit and early",
      );
    });

    it("exposes a WorkChecklist rule with Intent before Form sections", () => {
      const input = readAsset(CODE_STYLE);

      const ruleIndex = input.indexOf('<rule name="WorkChecklist">');
      const intentIndex = input.indexOf("### Intent");
      const formIndex = input.indexOf("### Form");
      const actualRuleExists = ruleIndex !== -1;
      const actualOrdered = intentIndex > ruleIndex && formIndex > intentIndex;
      const actual = actualRuleExists && actualOrdered;

      assert.ok(actual, "WorkChecklist must exist with Intent before Form");
    });

    it("enumerates the eight Intent concerns", () => {
      const input = readAsset(CODE_STYLE);

      const expectedFragments = [
        "Mental Reset",
        "Target Files",
        "Naming",
        "Narrative",
        "Comments",
        "Tests planned",
        "Security",
        "Blockers",
      ];

      const actualMissing = expectedFragments.filter(
        (fragment) => !input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualMissing,
        expectedEmpty,
        "Intent section must cover all eight concerns",
      );
    });

    it("enumerates the eight Form items wired to heuristics", () => {
      const input = readAsset(CODE_STYLE);

      const expectedFragments = [
        "Narrative Siblings",
        "Explaining Returns",
        "No framework abbreviations",
        "Vertical Density",
        "Revealing Module Pattern",
        "Boolean prefix",
        "No section banners",
        "Pure entry point",
      ];

      const actualMissing = expectedFragments.filter(
        (fragment) => !input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualMissing,
        expectedEmpty,
        "Form section must match heuristic strategy keys",
      );
    });

    it("bans Engineering Laws / DNA-GATE vocabulary from code-style", () => {
      const input = readAsset(CODE_STYLE);

      const forbiddenFragments = [
        "Engineering Laws",
        "DNA-GATE",
        "staff-dna",
        "Sovereign Protocol",
      ];

      const actualLeaks = forbiddenFragments.filter((fragment) =>
        input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualLeaks,
        expectedEmpty,
        "code-style must not reference removed governance ceremony",
      );
    });
  });

  describe("sdg-land.md — Phase STACK shape", () => {
    it("includes a Phase: STACK heading between SCOPE and BACKLOG", () => {
      const input = readAsset(LAND_COMMAND);

      const scopeIndex = input.indexOf("## Phase: SCOPE");
      const stackIndex = input.indexOf("## Phase: STACK");
      const backlogIndex = input.indexOf("## Phase: BACKLOG");

      const isStackBetweenScopeAndBacklog =
        scopeIndex !== -1 &&
        stackIndex > scopeIndex &&
        stackIndex < backlogIndex;

      assert.ok(
        isStackBetweenScopeAndBacklog,
        "Phase STACK must sit between SCOPE and BACKLOG",
      );
    });

    it("references the canonical WebFetch allow-list sources", () => {
      const input = readAsset(LAND_COMMAND);

      const expectedSources = [
        "nodejs.org/api/",
        "react.dev",
        "typescriptlang.org",
        "docs.python.org",
        "go.dev/doc",
        "doc.rust-lang.org",
      ];

      const actualMissing = expectedSources.filter(
        (fragment) => !input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualMissing,
        expectedEmpty,
        "Phase STACK must expose the doc-source allow-list",
      );
    });

    it("directs the output to .ai/backlog/stack.md", () => {
      const input = readAsset(LAND_COMMAND);

      const hasStackOutputRef = input.includes(".ai/backlog/stack.md");

      assert.ok(hasStackOutputRef);
    });
  });

  describe("stack.md seed template", () => {
    it("exposes the four canonical role headers", () => {
      const input = readAsset(STACK_TEMPLATE);

      const expectedHeaders = [
        "### Backend",
        "### Frontend",
        "### Data",
        "### Scripts",
      ];

      const actualMissing = expectedHeaders.filter(
        (fragment) => !input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualMissing,
        expectedEmpty,
        "stack.md seed must declare all four role headers",
      );
    });

    it("guides the developer to run land:", () => {
      const input = readAsset(STACK_TEMPLATE);

      const hasLandHint = input.includes("run `land:`");

      assert.ok(hasLandHint, "seed must tell the dev to populate via land:");
    });
  });

  describe("competencies/delivery.md — fused contract", () => {
    it("contains both Backend and Frontend discriminated sections", () => {
      const input = readAsset(DELIVERY_COMPETENCY);

      const expectedFragments = [
        "## Backend (load if the task is server-side)",
        "## Frontend (load if the task is UI)",
        "Response Envelope",
        "Design System",
      ];

      const actualMissing = expectedFragments.filter(
        (fragment) => !input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualMissing,
        expectedEmpty,
        "delivery.md must contain both discriminated sections",
      );
    });
  });

  describe("workflow.md Phase CODE", () => {
    it("routes Phase CODE through the Work Checklist", () => {
      const input = readAsset(WORKFLOW);

      const expectedMarker = "Work Checklist (BLOCKING)";

      const actual = input.includes(expectedMarker);

      assert.ok(actual, "Phase CODE step 1 must be the Work Checklist");
    });

    it("still names the blocked write tools", () => {
      const input = readAsset(WORKFLOW);

      const expectedFragments = ["Edit", "Write", "NotebookEdit"];
      const actualMissing = expectedFragments.filter(
        (fragment) => !input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualMissing,
        expectedEmpty,
        "Phase CODE must name blocked write tools",
      );
    });

    it("has shed all Laws / DNA-GATE vocabulary", () => {
      const input = readAsset(WORKFLOW);

      const forbiddenFragments = [
        "DNA-GATE CONFIRMED",
        "SUPREME BLOCK",
        "Engineering Laws",
        "Law 1 violation",
        "staff-dna.md",
      ];

      const actualLeaks = forbiddenFragments.filter((fragment) =>
        input.includes(fragment),
      );

      const expectedEmpty = [];

      assert.deepEqual(
        actualLeaks,
        expectedEmpty,
        "workflow.md must not retain removed governance ceremony",
      );
    });
  });
});
