import fileSystem from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { SyncChecker } from "./check-sync.mjs";
import { AuditFileScanner } from "./audit-file-scanner.mjs";
import { AuditHygiene } from "./audit-hygiene.mjs";
import { NARRATIVE_CHECKLIST } from "../../config/governance.mjs";
import { FsUtils } from "../../lib/core/fs-utils.mjs";
import { DisplayUtils } from "../../lib/core/display-utils.mjs";

const { smartTruncate } = DisplayUtils;

const require = createRequire(import.meta.url);
const packageJson = require("../../../../package.json");

const PROJECT_ROOT = process.cwd();
const SKIPPED_SCAN_REASON = "skipped: no files to scan";
const { bootstrapIfDirect, isMaintainerMode } = FsUtils;

async function auditGovernance(options = {}) {
  await dispatchGovernanceAudit(options);
}

/**
 * why: the summary printing "PROJECT DRIFT" while the process exited 0 meant
 * `npm run gate` and CI passed every audit they ran. The exit code is the only
 * part of the verdict a script reads.
 */
async function dispatchGovernanceAudit(options) {
  const auditResults = orchestrateGovernanceAudit(options);
  const totalFailures = reportSummary(auditResults);

  if (totalFailures > 0) {
    process.exitCode = 1;
  }
}

function orchestrateGovernanceAudit(options) {
  printHeader();

  const results = {
    drift: SyncChecker.check(),
    narrative: checkChangelogHealth(),
    codeStyle: checkCodeStyleCompliance(),
    tests: checkTestNamedExpectations(),
    soul: checkSoulPulse(),
    hygiene: AuditHygiene.check(PROJECT_ROOT, options),
    backlog: checkBacklogHealth(),
  };

  const auditResults = results;
  return auditResults;
}

function printHeader() {
  console.log(`\n${"─".repeat(50)}`);
  console.log(
    `  🔍 SDG GOVERNANCE AUDIT: spec-driven-guide v${packageJson.version}`,
  );

  console.log(`${"─".repeat(50)}\n`);
}

function checkChangelogHealth() {
  const changelogPath = path.join(PROJECT_ROOT, "CHANGELOG.md");
  // why: a project before its first release, or on `derived` before CI writes
  // one, has no changelog yet. That is a state, not a narrative violation.
  if (!fileSystem.existsSync(changelogPath)) {
    const missingChangelogResult = {
      isFailure: false,
      reason: "skipped: no CHANGELOG.md",
    };

    return missingChangelogResult;
  }

  const content = fileSystem.readFileSync(changelogPath, "utf8");
  const hasUnreleased = /##\s*\[Unreleased\]/i.test(content);
  const unreleasedMatch = content.match(
    /##\s*\[Unreleased\].*?\n([\s\S]*?)(?=\n##\s|(?:\n){0,1}$)/i,
  );

  const narrative = unreleasedMatch
    ? unreleasedMatch[1].replace(/###.*?\n/g, "").trim()
    : "";

  // 1. Block if narrative exists but wasn't promoted
  if (hasUnreleased && narrative.length > 5) {
    const pendingNarrativeIssue = {
      isFailure: true,
      reason: "Pending narrative in [Unreleased]. Run npm run bump.",
    };

    return pendingNarrativeIssue;
  }

  // 2. Block if changes are staged but [Unreleased] is empty (The "Thiago" Gate)
  const stagedChanges = spawnSync("git", ["diff", "--staged", "--name-only"], {
    encoding: "utf8",
  }).stdout.trim();

  const hasOtherStagedChanges =
    stagedChanges.split("\n").filter((file) => file && file !== "CHANGELOG.md")
      .length > 0;

  const today = new Date().toISOString().split("T").at(0);

  const todayReleasePattern = new RegExp(
    `##\\s*\\[\\d+\\.\\d+\\.\\d+\\]\\s*-\\s*${today}`,
  );

  const isReleaseContext = todayReleasePattern.test(content);

  if (hasOtherStagedChanges && narrative.length <= 5 && !isReleaseContext) {
    const missingNarrativeIssue = {
      isFailure: true,
      reason:
        "Staged changes detected but [Unreleased] is empty. Document your work!",
    };

    return missingNarrativeIssue;
  }

  const healthResult = { isFailure: false };
  return healthResult;
}

function checkCodeStyleCompliance() {
  const files = isMaintainerMode()
    ? AuditFileScanner.getMaintainerFiles()
    : AuditFileScanner.getFilesRecursive(
        path.join(PROJECT_ROOT, "src"),
        (fileName) =>
          fileName.endsWith(".mjs") && !fileName.endsWith(".test.mjs"),
      );

  if (files.length === 0) {
    const nothingScanned = { isFailure: false, isSkipped: true };
    return nothingScanned;
  }

  const violations = [];
  for (const filePath of files) {
    const content = fileSystem.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);

    for (const rule of NARRATIVE_CHECKLIST) {
      if (!rule.heuristic) {
        continue;
      }

      const result = rule.heuristic(content);
      if (!result.pass) {
        violations.push(`${fileName}: ${result.reason}`);
      }
    }
  }

  const codeStyleResult = {
    isFailure: violations.length > 0,
    violations,
    score:
      violations.length === 0
        ? "100%"
        : `${Math.max(0, 100 - violations.length * 10)}%`,
  };

  const finalCodeStyleResult = codeStyleResult;
  return finalCodeStyleResult;
}

function checkTestNamedExpectations() {
  const testFiles = isMaintainerMode()
    ? AuditFileScanner.getMaintainerTestFiles()
    : AuditFileScanner.getFilesRecursive(
        path.join(PROJECT_ROOT, "src"),
        (fileName) => fileName.endsWith(".test.mjs"),
      );

  if (testFiles.length === 0) {
    const nothingScanned = { isFailure: false, isSkipped: true };
    return nothingScanned;
  }

  const violations = [];

  for (const testFile of testFiles) {
    const content = fileSystem.readFileSync(testFile, "utf8");
    const slopMatches = content.match(/\/\/\s*(Arrange|Act|Assert)/gi);
    if (slopMatches) {
      violations.push(
        `${testFile}: Detected narrative slop (${slopMatches.join(", ")}). Use Vertical Scansion.`,
      );
    }

    if (!content.includes("actual") || !content.includes("expected")) {
      violations.push(
        `${testFile}: Missing Named Expectations triad (actual/expected variables).`,
      );
    }

    const numberedMatches = content.match(/\b(input|actual|expected)[0-9]+\b/g);
    if (numberedMatches) {
      violations.push(
        `${testFile}: Detected numbered variables (${Array.from(
          new Set(numberedMatches),
        ).join(", ")}).`,
      );
    }

    const hasStrictMagicMatch = content.match(
      /assert\.(?:equal|deepEqual|strictEqual)\s*\([^,]+,\s*(?:['"`0-9]|\b(?:null|true|false)\b)/,
    );

    if (hasStrictMagicMatch) {
      violations.push(
        `${testFile}: Detected magic values in assertions. Use named constants.`,
      );
    }
  }

  const expectationsResult = {
    isFailure: violations.length > 0,
    violations,
    score:
      violations.length === 0
        ? "100%"
        : `${Math.max(0, 100 - violations.length * 10)}%`,
  };

  const finalExpectationsResult = expectationsResult;
  return finalExpectationsResult;
}

function checkBacklogHealth() {
  const backlogDir = path.join(PROJECT_ROOT, ".ai", "backlog");
  if (!fileSystem.existsSync(backlogDir)) {
    const missingBacklogResult = {
      isFailure: false,
      message: "Backlog not initialized",
    };

    return missingBacklogResult;
  }

  const files = fileSystem.readdirSync(backlogDir);
  const largeFiles = files.filter((file) => {
    const stats = fileSystem.statSync(path.join(backlogDir, file));
    const isLarge = stats.size > 1024 * 50; // > 50KB
    return isLarge;
  });

  const isFailure = largeFiles.length > 0;
  const backlogHealthResult = {
    isFailure,
    largeFiles,
    message: isFailure
      ? `Detected context bloat in: ${largeFiles.join(", ")}. Prune with: node .ai/kit/tooling/scripts/prune-backlog.mjs`
      : "Healthy (no bloat)",
  };

  return backlogHealthResult;
}

function checkSoulPulse() {
  const requiredFiles = ["README.md"];
  const maintainerOnlyFiles = isMaintainerMode()
    ? ["README.pt-BR.md", "docs/ROADMAP.md"]
    : [];

  const files = [...requiredFiles, ...maintainerOnlyFiles];
  const missing = files.filter(
    (file) => !fileSystem.existsSync(path.join(PROJECT_ROOT, file)),
  );

  const soulPulse = { isFailure: missing.length > 0, missing };
  return soulPulse;
}

function reportSummary(results) {
  console.log(`\n${"─".repeat(50)}`);
  console.log("  AUDIT SUMMARY");
  console.log("─".repeat(50));

  const isDriftOk = !results.drift.isFailure;
  const driftReason = results.drift.value?.skipped
    ? "skipped: no manifest"
    : results.drift.error?.message?.message;

  printResult("Instruction Sync", isDriftOk, driftReason);

  const isNarrativeOk = !results.narrative.isFailure;
  printResult("Narrative (Changelog)", isNarrativeOk, results.narrative.reason);

  const isCodeStyleOk = !results.codeStyle.isFailure;
  const codeStyleReason = describeCodeStyle(results.codeStyle);
  printResult("Code Style Compliance", isCodeStyleOk, codeStyleReason);

  const isTestsOk = !results.tests.isFailure;
  const testsReason = results.tests.isSkipped
    ? SKIPPED_SCAN_REASON
    : results.tests.violations[0];

  printResult("Test Expectations", isTestsOk, testsReason);

  const isSoulOk = !results.soul.isFailure;

  const soulReason = results.soul.missing.length
    ? `Missing: ${results.soul.missing.join(", ")}`
    : null;

  printResult("Writing Soul", isSoulOk, soulReason);

  const isHygieneOk = !results.hygiene.isFailure;
  const hygieneReason = `Lint: ${results.hygiene.lint} | Tests: ${results.hygiene.test}`;
  printResult("Code Hygiene", isHygieneOk, hygieneReason);

  const isBacklogOk = !results.backlog.isFailure;
  printResult("Backlog Health", isBacklogOk, results.backlog.message);

  const totalFailures = [
    results.drift,
    results.narrative,
    results.codeStyle,
    results.soul,
    results.tests,
    results.hygiene,
    results.backlog,
  ].filter((result) => result && result.isFailure).length;

  if (totalFailures === 0) {
    console.log("\n  ✅ PROJECT COMPLIANT. Governance at 100%.\n");
  } else {
    const driftLine = `\n  ⚠️  PROJECT DRIFT: ${totalFailures} governance gaps found.\n`;
    console.log(driftLine);
  }

  return totalFailures;
}

function describeCodeStyle(codeStyle) {
  if (codeStyle.isSkipped) {
    return SKIPPED_SCAN_REASON;
  }

  if (!codeStyle.isFailure) {
    const noReason = null;
    return noReason;
  }

  const violationList = codeStyle.violations.join("\n      - ");
  const violationsReason = `found ${codeStyle.violations.length} violations:\n      - ${violationList}`;
  return violationsReason;
}

function printResult(label, isPassed, reason) {
  const icon = isPassed ? "✅" : "❌";
  const truncatedReason = smartTruncate(reason, 10, 5);
  const paddedLabel = label.padEnd(25);
  const suffix = reason ? `· ${truncatedReason}` : "";
  const line = `  ${icon} ${paddedLabel} ${suffix}`;
  console.log(line);
}

export const AuditRunner = { audit: auditGovernance };

bootstrapIfDirect(import.meta.url, () =>
  auditGovernance().catch(reportAuditError),
);

function reportAuditError(error) {
  console.error("Audit failed:", error);
  process.exit(1);
}
