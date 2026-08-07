import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { promoteUnreleased } from "./bump.mjs";

const UNRELEASED_PATTERN = /##\s*\[Unreleased\](\s*-\s*\d{4}-\d{2}-\d{2})?/i;
const NEW_HEADER = "## [6.0.2] - 2026-07-22";

function buildChangelog(unreleasedBody) {
  const lines = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    ...unreleasedBody,
    "## [6.0.1] - 2026-07-21",
    "",
    "### Fixed",
    "",
    "- an older entry",
    "",
  ];

  const content = lines.join("\n");
  return content;
}

describe("promoteUnreleased()", () => {
  it("drops a scaffolding section the cycle left empty", () => {
    const input = buildChangelog([
      "### Added",
      "",
      "### Fixed",
      "",
      "- the gate now fails loud",
      "",
    ]);

    const expectedReleased = "## [6.0.2] - 2026-07-22\n\n### Fixed\n";

    const actual = promoteUnreleased(input, UNRELEASED_PATTERN, NEW_HEADER);
    const actualIncludesReleased = actual.includes(expectedReleased);

    assert.ok(actualIncludesReleased);
  });

  it("keeps both sections when both carry entries", () => {
    const input = buildChangelog([
      "### Added",
      "",
      "- a new flag",
      "",
      "### Fixed",
      "",
      "- the gate now fails loud",
      "",
    ]);

    const actual = promoteUnreleased(input, UNRELEASED_PATTERN, NEW_HEADER);
    const releasedBlock = actual.slice(actual.indexOf(NEW_HEADER));
    const actualKeepsAdded = releasedBlock.includes("### Added");
    const actualKeepsFixed = releasedBlock.includes("### Fixed");

    assert.ok(actualKeepsAdded);
    assert.ok(actualKeepsFixed);
  });

  it("leaves no double blank line where a section was dropped", () => {
    const input = buildChangelog([
      "### Added",
      "",
      "### Fixed",
      "",
      "- the gate now fails loud",
      "",
    ]);

    const expected = false;

    const actual = promoteUnreleased(input, UNRELEASED_PATTERN, NEW_HEADER);
    const actualHasBlankRun = actual.includes("\n\n\n");

    assert.equal(actualHasBlankRun, expected);
  });

  it("opens a fresh Unreleased block with both scaffolds", () => {
    const input = buildChangelog([
      "### Added",
      "",
      "### Fixed",
      "",
      "- the gate now fails loud",
      "",
    ]);

    const expectedScaffold = "## [Unreleased]\n\n### Added\n\n### Fixed\n";

    const actual = promoteUnreleased(input, UNRELEASED_PATTERN, NEW_HEADER);
    const actualIncludesScaffold = actual.includes(expectedScaffold);

    assert.ok(actualIncludesScaffold);
  });

  it("preserves earlier releases untouched", () => {
    const input = buildChangelog([
      "### Added",
      "",
      "### Fixed",
      "",
      "- the gate now fails loud",
      "",
    ]);

    const expectedOlder =
      "## [6.0.1] - 2026-07-21\n\n### Fixed\n\n- an older entry";

    const actual = promoteUnreleased(input, UNRELEASED_PATTERN, NEW_HEADER);
    const actualIncludesOlder = actual.includes(expectedOlder);

    assert.ok(actualIncludesOlder);
  });

  it("leaves the block alone when no section carries a narrative", () => {
    const input = buildChangelog(["### Added", "", "### Fixed", ""]);

    const actual = promoteUnreleased(input, UNRELEASED_PATTERN, NEW_HEADER);
    const releasedBlock = actual.slice(actual.indexOf(NEW_HEADER));
    const actualKeepsAdded = releasedBlock.includes("### Added");

    assert.ok(actualKeepsAdded);
  });
});
