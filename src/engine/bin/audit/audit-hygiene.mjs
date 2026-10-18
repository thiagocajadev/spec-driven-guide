/**
 * Audit Hygiene: runs the project's own lint and test scripts and reports each.
 */

import path from "node:path";
import { spawnSync } from "node:child_process";

import { FsUtils } from "../../lib/core/fs-utils.mjs";

const { safeReadJson } = FsUtils;

const HYGIENE_SCRIPTS = { lint: "lint", test: "test" };

/**
 * why: `npm run gate` and CI run lint and tests as their own steps right before
 * the audit, so `--skip-hygiene` keeps them from running twice. A project with
 * no `package.json`, or without the script, is skipped rather than failed: a
 * Java repository has nothing for `npm` to run, and reporting that as a failing
 * lint blamed the project for the CLI's assumption.
 */
function checkHygiene(projectRoot, { isHygieneSkipped = false } = {}) {
  const results = { lint: "SKIPPED", test: "SKIPPED", isFailure: false };

  if (isHygieneSkipped) {
    return results;
  }

  const declaredScripts =
    safeReadJson(path.join(projectRoot, "package.json"))?.scripts ?? {};

  for (const [resultKey, scriptName] of Object.entries(HYGIENE_SCRIPTS)) {
    if (declaredScripts[scriptName]) {
      results[resultKey] = runPackageScript(projectRoot, scriptName);
    }
  }

  results.isFailure = results.lint === "FAIL" || results.test === "FAIL";

  const finalHygieneResults = results;
  return finalHygieneResults;
}

/**
 * why: through a shell, because `npm` is `npm.cmd` on Windows, where a direct
 * spawn fails and used to be reported as a failing lint.
 */
function runPackageScript(projectRoot, scriptName) {
  const execution = spawnSync(`npm run ${scriptName} --silent`, {
    cwd: projectRoot,
    shell: true,
    encoding: "utf8",
  });

  if (execution.error) {
    const unavailableStatus = "UNAVAILABLE";
    return unavailableStatus;
  }

  const scriptStatus = execution.status === 0 ? "PASS" : "FAIL";
  return scriptStatus;
}

export const AuditHygiene = {
  check: checkHygiene,
};
