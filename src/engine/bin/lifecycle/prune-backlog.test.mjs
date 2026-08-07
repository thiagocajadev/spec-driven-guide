import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PruneBacklog } from "./prune-backlog.mjs";

const { pruneBacklog } = PruneBacklog;

const SEED_TEMPLATE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../assets/instructions/templates/backlog/tasks.md",
);

/**
 * Reads the shipped template rather than a fixture: a template edit that breaks
 * the function's contract must fail here, not in a consumer's first prune.
 */
const readSeedTemplate = () => {
  const templateContent = fileSystem.readFileSync(SEED_TEMPLATE_PATH, "utf8");
  return templateContent;
};

const buildBacklog = (doneEntries, trailingSection = "") => {
  const header =
    "# Tasks\n\n## Active\n\n- _(idle)_\n\n## Backlog\n\n- foo\n\n## Done\n\n";

  const entries = doneEntries
    .map((label, index) => `- [DONE] ${label} entry ${index + 1}`)
    .join("\n");

  const trailer = trailingSection ? `\n\n${trailingSection}\n` : "\n";
  return header + entries + trailer;
};

describe("PruneBacklog.pruneBacklog()", () => {
  it("truncates Done section to keepCount and report dropped count", () => {
    const input = buildBacklog(
      Array.from({ length: 28 }, (_unused, index) => `cycle-${index}`),
    );

    const expectedRemoved = 25;
    const expectedRemaining = 3;

    const actual = pruneBacklog(input, 3);
    const actualEntries = actual.pruned.match(/^-\s+\[DONE\]/gm) ?? [];
    const actualRemoved = actual.removed;
    const actualEntryCount = actualEntries.length;

    assert.equal(actualRemoved, expectedRemoved);
    assert.equal(actualEntryCount, expectedRemaining);
  });

  it("no-ops when Done already within threshold", () => {
    const input = buildBacklog(["alpha", "beta"]);

    const expectedRemoved = 0;
    const actual = pruneBacklog(input, 3);
    const actualRemoved = actual.removed;
    const actualPruned = actual.pruned;

    assert.equal(actualRemoved, expectedRemoved);
    assert.equal(actualPruned, input);
  });

  it("no-ops when Done section is absent", () => {
    const input =
      "# Tasks\n\n## Active\n\n- pending\n\n## Backlog\n\n- later\n";

    const expectedRemoved = 0;
    const actual = pruneBacklog(input, 3);
    const actualRemoved = actual.removed;
    const actualPruned = actual.pruned;

    assert.equal(actualRemoved, expectedRemoved);
    assert.equal(actualPruned, input);
  });

  it("preserves sections that appear after Done", () => {
    const trailingSection = "## Notes\n\n- keep me intact";
    const input = buildBacklog(
      Array.from({ length: 5 }, (_unused, index) => `cycle-${index}`),
      trailingSection,
    );

    const expectedRemoved = 2;
    const actual = pruneBacklog(input, 3);
    const actualRemoved = actual.removed;

    assert.equal(actualRemoved, expectedRemoved);
    const hasNotesSection = actual.pruned.includes("## Notes");
    const hasKeepMarker = actual.pruned.includes("- keep me intact");

    assert.ok(hasNotesSection);
    assert.ok(hasKeepMarker);
  });

  it("is idempotent — second prune is no-op", () => {
    const input = buildBacklog(
      Array.from({ length: 10 }, (_unused, index) => `cycle-${index}`),
    );

    const expectedSecondRemoved = 0;
    const firstPass = pruneBacklog(input, 3);
    const secondPass = pruneBacklog(firstPass.pruned, 3);
    const actualSecondRemoved = secondPass.removed;
    const actualSecondPruned = secondPass.pruned;
    const expectedPruned = firstPass.pruned;

    assert.equal(actualSecondRemoved, expectedSecondRemoved);
    assert.equal(actualSecondPruned, expectedPruned);
  });

  it("leaves exactly one blank line between Done header and first entry", () => {
    const input = buildBacklog(
      Array.from({ length: 6 }, (_unused, index) => `cycle-${index}`),
    );

    const expectedSeparator = "## Done\n\n- [DONE]";
    const actual = pruneBacklog(input, 3);
    const actualIncludesSeparator = actual.pruned.includes(expectedSeparator);
    const actualHasNoDoubleBlanks = !actual.pruned.includes("## Done\n\n\n");

    assert.ok(
      actualIncludesSeparator,
      `Expected clean separator; got:\n${actual.pruned}`,
    );

    assert.ok(
      actualHasNoDoubleBlanks,
      "Must not leave double blank line after Done header",
    );
  });

  it("reports drift when Done holds content but no recognizable entry", () => {
    const input = [
      "# Tasks",
      "",
      "## Done",
      "",
      "* 2026-07-22 shipped the release",
      "* 2026-07-21 fixed the gate",
      "",
    ].join("\n");

    const expectedDrift = "* 2026-07-22 shipped the release";
    const expectedRemoved = 0;

    const actual = pruneBacklog(input, 3);
    const actualDrift = actual.drift;
    const actualRemoved = actual.removed;
    const actualPruned = actual.pruned;

    assert.equal(actualDrift, expectedDrift);
    assert.equal(actualRemoved, expectedRemoved);
    assert.equal(actualPruned, input);
  });

  it("does not report drift when Done is explicitly empty", () => {
    const input = [
      "# Tasks",
      "",
      "## Done",
      "",
      "_(empty — nothing shipped yet)_",
      "",
    ].join("\n");

    const expected = undefined;

    const actual = pruneBacklog(input, 3);
    const actualDrift = actual.drift;

    assert.equal(actualDrift, expected);
  });

  it("does not report drift on the seed template a fresh project starts from", () => {
    const input = readSeedTemplate();

    const expectedDrift = undefined;
    const expectedRemoved = 0;

    const actual = pruneBacklog(input, 3);
    const actualDrift = actual.drift;
    const actualRemoved = actual.removed;
    const actualPruned = actual.pruned;

    assert.equal(actualDrift, expectedDrift);
    assert.equal(actualRemoved, expectedRemoved);
    assert.equal(actualPruned, input);
  });

  it("does not report drift when every entry is dropped by keepCount zero", () => {
    const input = buildBacklog(["cycle-a", "cycle-b"]);

    const expected = undefined;

    const actual = pruneBacklog(input, 0);
    const actualDrift = actual.drift;

    assert.equal(actualDrift, expected);
  });
});
