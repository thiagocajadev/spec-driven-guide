import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "bump-version.mjs");

function makeTempProject(initialVersion) {
  const projectDir = fileSystem.mkdtempSync(
    path.join(os.tmpdir(), "sdg-bump-test-"),
  );

  const packagePath = path.join(projectDir, "package.json");
  const packageData = { name: "test-project", version: initialVersion };
  fileSystem.writeFileSync(
    packagePath,
    `${JSON.stringify(packageData, null, 2)}\n`,
  );

  return { projectDir, packagePath };
}

function runScript(projectDir, args = []) {
  const stdout = execFileSync("node", [SCRIPT_PATH, ...args], {
    cwd: projectDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return stdout;
}

function readVersion(packagePath) {
  const raw = fileSystem.readFileSync(packagePath, "utf8");
  const parsed = JSON.parse(raw);
  return parsed.version;
}

function cleanup(projectDir) {
  fileSystem.rmSync(projectDir, { recursive: true, force: true });
}

describe("bump-version.mjs", () => {
  it("increments patch segment when arg is patch", () => {
    const { projectDir, packagePath } = makeTempProject("3.8.0");
    const expectedVersion = "3.8.1";

    try {
      const stdout = runScript(projectDir, ["patch"]);
      const actualVersion = readVersion(packagePath);
      const actualIncludesArrow = stdout.includes("3.8.0 → 3.8.1");

      assert.equal(actualVersion, expectedVersion);
      assert.ok(actualIncludesArrow);
    } finally {
      cleanup(projectDir);
    }
  });

  it("increments minor and reset patch when arg is minor", () => {
    const { projectDir, packagePath } = makeTempProject("3.8.2");
    const expectedVersion = "3.9.0";

    try {
      runScript(projectDir, ["minor"]);
      const actualVersion = readVersion(packagePath);

      assert.equal(actualVersion, expectedVersion);
    } finally {
      cleanup(projectDir);
    }
  });

  it("increments major and reset minor+patch when arg is major", () => {
    const { projectDir, packagePath } = makeTempProject("3.8.2");
    const expectedVersion = "4.0.0";

    try {
      runScript(projectDir, ["major"]);
      const actualVersion = readVersion(packagePath);

      assert.equal(actualVersion, expectedVersion);
    } finally {
      cleanup(projectDir);
    }
  });

  it("preserves package.json fields other than version", () => {
    const projectDir = fileSystem.mkdtempSync(
      path.join(os.tmpdir(), "sdg-bump-test-"),
    );

    const packagePath = path.join(projectDir, "package.json");

    const originalPackage = {
      name: "test-project",
      version: "1.0.0",
      description: "fixture",
      scripts: { test: "echo ok" },
      dependencies: { foo: "^1.0.0" },
    };

    fileSystem.writeFileSync(
      packagePath,
      `${JSON.stringify(originalPackage, null, 2)}\n`,
    );

    try {
      runScript(projectDir, ["patch"]);
      const actualRaw = fileSystem.readFileSync(packagePath, "utf8");
      const actualParsed = JSON.parse(actualRaw);
      const actualName = actualParsed.name;
      const expectedName = originalPackage.name;
      const actualDescription = actualParsed.description;
      const expectedDescription = originalPackage.description;
      const actualScripts = actualParsed.scripts;
      const expectedScripts = originalPackage.scripts;
      const actualDependencies = actualParsed.dependencies;
      const expectedDependencies = originalPackage.dependencies;
      const actualVersion = actualParsed.version;
      const expectedBumpedVersion = "1.0.1";

      assert.equal(actualName, expectedName);
      assert.equal(actualDescription, expectedDescription);
      assert.deepEqual(actualScripts, expectedScripts);
      assert.deepEqual(actualDependencies, expectedDependencies);
      assert.equal(actualVersion, expectedBumpedVersion);
    } finally {
      cleanup(projectDir);
    }
  });

  it("exits 1 when bump arg is invalid", () => {
    const { projectDir } = makeTempProject("1.0.0");

    try {
      assert.throws(() => runScript(projectDir, ["feat"]));
    } finally {
      cleanup(projectDir);
    }
  });

  it("exits 1 when bump arg is missing", () => {
    const { projectDir } = makeTempProject("1.0.0");

    try {
      assert.throws(() => runScript(projectDir, []));
    } finally {
      cleanup(projectDir);
    }
  });

  it("exits 1 when package.json is absent", () => {
    const projectDir = fileSystem.mkdtempSync(
      path.join(os.tmpdir(), "sdg-bump-test-"),
    );

    try {
      assert.throws(() => runScript(projectDir, ["patch"]));
    } finally {
      cleanup(projectDir);
    }
  });

  it("does not import child_process (zero git side-effects guarantee)", () => {
    const scriptSource = fileSystem.readFileSync(SCRIPT_PATH, "utf8");
    const actualHasNoChildProcess = !scriptSource.includes("child_process");
    const actualHasNoExecSync = !scriptSource.includes("execSync");
    const actualHasNoExec = !scriptSource.includes("exec(");

    assert.ok(actualHasNoChildProcess);
    assert.ok(actualHasNoExecSync);
    assert.ok(actualHasNoExec);
  });
});
