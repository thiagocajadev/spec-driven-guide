import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, "release-please-config.json");
const MANIFEST_PATH = path.join(__dirname, "release-please-manifest.json");
const COMMIT_MSG_PATH = path.join(__dirname, "..", "husky", "commit-msg");

function readJson(targetPath) {
  const rawContent = fileSystem.readFileSync(targetPath, "utf8");
  const parsedContent = JSON.parse(rawContent);
  return parsedContent;
}

// why: the hook is the only place the accepted type list exists. Restating it
// here would create the second source this test was written to detect.
function readAcceptedTypes() {
  const hookContent = fileSystem.readFileSync(COMMIT_MSG_PATH, "utf8");
  const patternMatch = hookContent.match(/\^\(([a-z|]+)\)/);

  const acceptedTypes = patternMatch[1].split("|");
  return acceptedTypes;
}

function readConfiguredTypes() {
  const config = readJson(CONFIG_PATH);
  const sections = config.packages["."]["changelog-sections"];

  const configuredTypes = sections.map((section) => section.type);
  return configuredTypes;
}

describe("release-please config", () => {
  it("maps every commit type the hook accepts", () => {
    const acceptedTypes = readAcceptedTypes();
    const configuredTypes = readConfiguredTypes();

    const expectedUnmapped = [];
    const actualUnmapped = acceptedTypes.filter(
      (type) => !configuredTypes.includes(type),
    );

    assert.deepEqual(
      actualUnmapped,
      expectedUnmapped,
      "a type the hook accepts but the config ignores ships invisibly",
    );
  });

  it("configures no type the hook would reject", () => {
    const acceptedTypes = readAcceptedTypes();
    const configuredTypes = readConfiguredTypes();

    const expectedOrphans = [];
    const actualOrphans = configuredTypes.filter(
      (type) => !acceptedTypes.includes(type),
    );

    assert.deepEqual(actualOrphans, expectedOrphans);
  });

  it("keeps the SDG-specific cycles visible in the changelog", () => {
    const config = readJson(CONFIG_PATH);
    const sections = config.packages["."]["changelog-sections"];

    const expectedVisible = [true, true];
    const auditSection = sections.find((section) => section.type === "audit");
    const landSection = sections.find((section) => section.type === "land");
    const actualVisible = [!auditSection.hidden, !landSection.hidden];

    assert.deepEqual(
      actualVisible,
      expectedVisible,
      "audit: and land: are SDG cycles no stock config knows about",
    );
  });

  it("seeds the manifest at zero so the first run reads the real version", () => {
    const manifest = readJson(MANIFEST_PATH);

    const expectedSeed = "0.0.0";
    const actualSeed = manifest["."];

    assert.equal(actualSeed, expectedSeed);
  });
});
