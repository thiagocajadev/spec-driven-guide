import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const GITATTRIBUTES_SAMPLE = path.join(currentDirectory, "sdg.gitattributes");
const EDITORCONFIG_SAMPLE = path.join(currentDirectory, "sdg.editorconfig");

function readRules(samplePath) {
  const rules = fileSystem
    .readFileSync(samplePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  return rules;
}

/**
 * why: the two samples state one policy for two readers, git and the editor.
 * If they disagreed, the editor would save one ending and git would check out
 * another, which is the drift the recipe exists to end.
 */
describe("line-endings samples", () => {
  it("stores every text file as LF unless a rule says otherwise", () => {
    const rules = readRules(GITATTRIBUTES_SAMPLE);

    const expectedDefault = "* text=auto eol=lf";
    const actualDefault = rules.at(0);

    assert.equal(actualDefault, expectedDefault);
  });

  it("keeps the batch files cmd.exe needs as CRLF in both samples", () => {
    const gitRules = readRules(GITATTRIBUTES_SAMPLE);
    const editorRules = readRules(EDITORCONFIG_SAMPLE);

    const expectedGitRules = ["*.bat text eol=crlf", "*.cmd text eol=crlf"];
    const actualGitRules = gitRules.filter((rule) =>
      /^\*\.(bat|cmd) /.test(rule),
    );

    const editorSection = editorRules.indexOf("[*.{bat,cmd}]");
    const actualEditorEnding = editorRules[editorSection + 1];
    const expectedEditorEnding = "end_of_line = crlf";

    assert.deepEqual(actualGitRules, expectedGitRules);
    assert.equal(actualEditorEnding, expectedEditorEnding);
  });

  it("makes the editor save LF by default, as git stores it", () => {
    const editorRules = readRules(EDITORCONFIG_SAMPLE);
    const defaultSection = editorRules.indexOf("[*]");
    const nextSection = editorRules.findIndex(
      (rule, index) => index > defaultSection && rule.startsWith("["),
    );

    const expectedEnding = "end_of_line = lf";
    const defaultRules = editorRules.slice(defaultSection + 1, nextSection);
    const hasLfDefault = defaultRules.includes(expectedEnding);

    assert.ok(hasLfDefault, "the [*] section must declare end_of_line = lf");
  });
});
