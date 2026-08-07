import fileSystem from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SyncChecker } from "./check-sync.mjs";
import { AuditFileScanner } from "./audit-file-scanner.mjs";
import { NARRATIVE_CHECKLIST } from "../../config/governance.mjs";
import { FsUtils } from "../../lib/core/fs-utils.mjs";
import { DisplayUtils } from "../../lib/core/display-utils.mjs";

const { smartTruncate } = DisplayUtils;

const PROJECT_ROOT = process.cwd();
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, "package.json");
const PROJECT_VERSION = fileSystem.existsSync(PACKAGE_JSON_PATH)
  ? (JSON.parse(fileSystem.readFileSync(PACKAGE_JSON_PATH, "utf8")).version ??
    "unknown")
  : "unknown";
const { bootstrapIfDirect, isMaintainerMode } = FsUtils;

async function auditGovernance() {
  await dispatchGovernanceAudit();
}

async function dispatchGovernanceAudit() {
  const auditResults = orchestrateGovernanceAudit();
  reportSummary(auditResults);
}

function orchestrateGovernanceAudit() {
  printHeader();

  const results = {
    drift: SyncChecker.check(),
    narrative: checkChangelogHealth(),
    codeStyle: checkCodeStyleCompliance(),
    tests: checkTestNamedExpectations(),
    soul: checkSoulPulse(),
    hygiene: checkHygienePulse(),
    backlog: checkBacklogHealth(),
  };

  const auditResults = results;
  return auditResults;
}

function printHeader() {
  console.log(`\n${"─".repeat(50)}`);
  console.log(`  🔍 SDG GOVERNANCE AUDIT: v${PROJECT_VERSION} compliance`);
  console.log(`${"─".repeat(50)}\n`);
}

function checkChangelogHealth() {
  const changelogPath = path.join(PROJECT_ROOT, "CHANGELOG.md");
  if (!fileSystem.existsSync(changelogPath)) {
    const missingChangelogResult = {
      isFailure: true,
      reason: "CHANGELOG.md missing",
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
      ? `Detected context bloat in: ${largeFiles.join(", ")}. Run 'context-reset'.`
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

function checkHygienePulse() {
  const results = { lint: "SKIPPED", test: "SKIPPED", isFailure: false };
  try {
    const lint = spawnSync("npm", ["run", "lint", "--silent"], {
      cwd: PROJECT_ROOT,
      shell: false,
      encoding: "utf8",
    });

    results.lint = lint.status === 0 ? "PASS" : "FAIL";
  } catch {
    results.lint = "UNAVAILABLE";
  }

  try {
    const test = spawnSync("npm", ["test", "--silent"], {
      cwd: PROJECT_ROOT,
      shell: false,
      encoding: "utf8",
    });

    results.test = test.status === 0 ? "PASS" : "FAIL";
  } catch {
    results.test = "UNAVAILABLE";
  }

  results.isFailure = results.lint === "FAIL" || results.test === "FAIL";

  const finalHygieneResults = results;
  return finalHygieneResults;
}

function reportSummary(results) {
  console.log(`\n${"─".repeat(50)}`);
  console.log("  AUDIT SUMMARY");
  console.log("─".repeat(50));

  const isDriftOk = !results.drift.isFailure;
  printResult("Instruction Sync", isDriftOk);

  const isNarrativeOk = !results.narrative.isFailure;
  printResult("Narrative (Changelog)", isNarrativeOk, results.narrative.reason);

  const isCodeStyleOk = !results.codeStyle.isFailure;

  const codeStyleReason = isCodeStyleOk
    ? null
    : `found ${results.codeStyle.violations.length} violations:\n      - ` +
      results.codeStyle.violations.join("\n      - ");

  printResult("Code Style Compliance", isCodeStyleOk, codeStyleReason);

  const isTestsOk = !results.tests.isFailure;
  const firstTestViolation = results.tests.violations[0];
  printResult("Test Expectations", isTestsOk, firstTestViolation);

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
