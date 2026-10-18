import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { LinkChecker } from "./check-links.mjs";

const { extractReferences, collectAnchors, slugify, findBrokenReferences } =
  LinkChecker;

describe("LinkChecker", () => {
  describe("slugify()", () => {
    it("follows the GitHub anchor rule for punctuation and spaces", () => {
      const input = "v6.0 Migration Notes: Harness Alignment";

      const actual = slugify(input);
      const expected = "v60-migration-notes-harness-alignment";

      assert.equal(actual, expected);
    });

    it("drops inline code markers and keeps the words", () => {
      const input = "Stack Declaration via `land:`";

      const actual = slugify(input);
      const expected = "stack-declaration-via-land";

      assert.equal(actual, expected);
    });
  });

  describe("collectAnchors()", () => {
    it("suffixes a repeated heading and ignores headings inside fences", () => {
      const input = [
        "## Why",
        "",
        "```bash",
        "# not a heading",
        "```",
        "",
        "## Why",
      ].join("\n");

      const actual = [...collectAnchors(input)];
      const expected = ["why", "why-1"];

      assert.deepEqual(actual, expected);
    });
  });

  describe("extractReferences()", () => {
    it("reads markdown links, HTML links and kit paths outside fences", () => {
      const input = [
        'See [the guide](docs/guide.md#setup) and <a href="LICENSE">it</a>.',
        "Load `.ai/kit/skills/testing.md`.",
        "```",
        "[ignored](missing.md)",
        "```",
      ].join("\n");

      const actual = extractReferences(input).map(
        ({ kind, target }) => `${kind}:${target}`,
      );

      const expected = [
        "link:docs/guide.md#setup",
        "link:LICENSE",
        "kit:.ai/kit/skills/testing.md",
      ];

      assert.deepEqual(actual, expected);
    });

    it("classifies a URL with a scheme as external", () => {
      const input = "[npm](https://www.npmjs.com/package/spec-driven-guide)";

      const actualKinds = extractReferences(input).map(({ kind }) => kind);
      const expectedKinds = ["external"];

      assert.deepEqual(actualKinds, expectedKinds);
    });
  });

  describe("findBrokenReferences()", () => {
    // why: the repository is the fixture. A link, anchor or kit path that leads
    // nowhere fails the suite, so it fails CI before a reader or an agent
    // follows it.
    it("finds no broken reference in this repository", () => {
      const actualBroken = findBrokenReferences().map(
        ({ documentPath, line, target, reason }) =>
          `${documentPath}:${line} ${target} (${reason})`,
      );

      const expectedBroken = [];

      assert.deepEqual(actualBroken, expectedBroken);
    });
  });
});
