import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(currentDirectory, "biome.json");
const readmePath = path.join(currentDirectory, "..", "README.md");

function loadConfig() {
  const rawConfig = fileSystem.readFileSync(configPath, "utf8");
  const parsedConfig = JSON.parse(rawConfig);
  return parsedConfig;
}

function loadReadme() {
  const readmeContent = fileSystem.readFileSync(readmePath, "utf8");
  return readmeContent;
}

describe("BiomeConfig", () => {
  it("pins a schema matching the Biome major line in use", () => {
    const config = loadConfig();

    const actualSchema = config.$schema;
    const expectedSchemaPattern =
      /^https:\/\/biomejs\.dev\/schemas\/2\.\d+\.\d+\/schema\.json$/;

    assert.match(actualSchema, expectedSchemaPattern);
  });

  it("uses the preset key rather than the removed recommended flag", () => {
    const config = loadConfig();

    const actualPreset = config.linter.rules.preset;
    const expectedPreset = "recommended";
    const actualLegacyFlag = config.linter.rules.recommended;

    assert.equal(actualPreset, expectedPreset);
    assert.equal(actualLegacyFlag, undefined);
  });

  it("places noVar under suspicious and useArrowFunction under complexity", () => {
    const config = loadConfig();

    const actualNoVar = config.linter.rules.suspicious.noVar;
    const actualUseArrowFunction =
      config.linter.rules.complexity.useArrowFunction;

    const expectedLevel = "error";

    assert.equal(actualNoVar, expectedLevel);
    assert.equal(actualUseArrowFunction, expectedLevel);
  });

  it("excludes .ai so the template copy is not read as a second root config", () => {
    const config = loadConfig();

    const actualIncludes = config.files.includes;
    const expectedIncludes = ["**", "!**/.ai"];

    assert.deepEqual(actualIncludes, expectedIncludes);
  });

  it("does not carry rule names removed in Biome 2.x", () => {
    const rawConfig = fileSystem.readFileSync(configPath, "utf8");

    const removedRuleNames = ["noConsoleLog", "useShorthandArrayType"];
    const actualSurvivors = removedRuleNames.filter((ruleName) =>
      rawConfig.includes(ruleName),
    );

    const expectedSurvivors = [];

    assert.deepEqual(actualSurvivors, expectedSurvivors);
  });
});

describe("BiomeReadme", () => {
  it("never claims Biome covers visual density", () => {
    const readmeContent = loadReadme();

    const biomeSection = readmeContent.slice(
      readmeContent.indexOf("### Activate Biome"),
    );

    const actualHasFalseClaim =
      /(mirrors|aligned to|mapped to)[^.\n]*visual.density/i.test(biomeSection);

    const expectedHasFalseClaim = false;

    assert.equal(actualHasFalseClaim, expectedHasFalseClaim);
  });

  it("tells the reader which SDG rules Biome leaves uncovered", () => {
    const readmeContent = loadReadme();

    const uncoveredRuleNames = [
      "local/semantic-spacing",
      "local/blank-before-assertion",
      "local/no-inline-assert",
      "local/no-boolean-comparison",
    ];

    const actualMissing = uncoveredRuleNames.filter(
      (ruleName) => !readmeContent.includes(ruleName),
    );

    const expectedMissing = [];

    assert.deepEqual(actualMissing, expectedMissing);
  });
});
