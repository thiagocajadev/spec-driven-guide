#!/usr/bin/env node

/**
 * sdg-agents: Main CLI Entry Point
 * Supports interactive and non-interactive modes.
 */

import { createRequire } from "node:module";
import path from "node:path";

import { FsUtils } from "../lib/core/fs-utils.mjs";
import { PromptUtils } from "../lib/infra/prompt-utils.mjs";
import { CliParser } from "../lib/infra/cli-parser.mjs";
import { BundleUI } from "../lib/core/ui-utils.mjs";
import { VersionUtils } from "../lib/domain/version-utils.mjs";

const { bootstrapIfDirect } = FsUtils;
const { safeSelect } = PromptUtils;
const { parseCliArgs, validateInit } = CliParser;

const require = createRequire(import.meta.url);
const packageJson = require("../../../package.json");

async function run() {
  const lifecycleResult = await orchestrateCommandLineLifecycle();
  return lifecycleResult;
}

async function orchestrateCommandLineLifecycle() {
  const cliArgs = parseCommandLineArguments();
  const appVersion = packageJson.version;

  const isHelpRequested = cliArgs.help;
  if (isHelpRequested) {
    const helpResult = displayHelp(appVersion);
    return helpResult;
  }

  const isVersionRequested = cliArgs.version;
  if (isVersionRequested) {
    const versionResult = displayVersion(appVersion);
    return versionResult;
  }

  const executionContext = prepareExecutionContext(cliArgs);
  await applyMaintenanceSync(executionContext);

  if (executionContext.subcommand) {
    const subcommandResult = await dispatchSubcommand(executionContext);
    return subcommandResult;
  }

  const interactiveResult = await startInteractiveMode(executionContext);
  return interactiveResult;
}

function parseCommandLineArguments() {
  const rawArgs = process.argv.slice(2);
  const parsedArgs = parseCliArgs(rawArgs);
  return parsedArgs;
}

function displayHelp(version) {
  BundleUI.printHelp(version);
}

function displayVersion(version) {
  console.log(version);
}

function prepareExecutionContext(args) {
  const targetPath = path.resolve(args.targetDirectory || process.cwd());
  const context = { ...args, targetDirectory: targetPath };
  return context;
}

async function applyMaintenanceSync(args) {
  const isCommandRequest = args.subcommand || args.help || args.version;
  if (isCommandRequest) {
    const skipResult = null;
    return skipResult;
  }

  const syncResult = await ensureMaintainerSync(args.targetDirectory);
  return syncResult;
}

async function ensureMaintainerSync(targetDirectory) {
  const { isMaintainerMode } = PromptUtils;
  const isMaintainer = isMaintainerMode();
  if (!isMaintainer) {
    const idleResult = null;
    return idleResult;
  }

  const { SyncChecker } = await import("./audit/check-sync.mjs");
  const syncResult = SyncChecker.check();

  const isDriftDetected = syncResult.isFailure;
  if (isDriftDetected) {
    const resolutionResult = await applyAutomaticSync(targetDirectory);
    return resolutionResult;
  }

  const healthyResult = null;
  return healthyResult;
}

async function applyAutomaticSync(targetDirectory) {
  console.log("\n  🛠️  MAINTAINER MODE: Drift detected in core instructions.");
  console.log("  🔄 Automatic sync in progress...\n");

  const { ManifestUtils } = await import("../lib/domain/manifest-utils.mjs");
  const { SDG: SpecDrivenGuide } = await import("./init/build-bundle.mjs");
  const manifest = ManifestUtils.loadManifest(targetDirectory);

  if (!manifest) {
    const missingMsg =
      '  ⚠️  Cannot auto-sync: No manifest found. Run "init" once.\n';

    console.log(missingMsg);
    return;
  }

  try {
    await SpecDrivenGuide.run(targetDirectory, {
      selections: manifest.selections,
    });

    const successMsg =
      "\n  ✅ Core instructions synchronized. Agent rules are up-to-date.\n";

    const divider = `${"─".repeat(50)}\n`;
    const successOutput = `${successMsg}${divider}`;
    console.log(successOutput);
  } catch (error) {
    const failureOutput = `\n  ⚠️  Automatic sync failed: ${error.message}\n`;
    console.log(failureOutput);
  }
}

async function dispatchSubcommand(args) {
  switch (args.subcommand) {
    case "init": {
      const initResult = await processInitSubcommand(args);
      return initResult;
    }
    case "review": {
      const { Reviewer } = await import("./maintenance/review-bundle.mjs");
      const reviewResult = await Reviewer.review();
      return reviewResult;
    }
    case "clear": {
      const { Cleaner } = await import("./maintenance/clear-bundle.mjs");
      const clearResult = await Cleaner.clear(args.targetDirectory);
      return clearResult;
    }
    case "audit": {
      const { AuditRunner } = await import("./audit/audit-bundle.mjs");
      const auditResult = await AuditRunner.audit();
      return auditResult;
    }
    case "narrative": {
      const { NarrativeChecker } = await import("./audit/check-narrative.mjs");
      const narrativeResult = await NarrativeChecker.check();
      return narrativeResult;
    }
    case "gate": {
      const { GateRunner } = await import("./maintenance/gate-bundle.mjs");
      const gateResult = await GateRunner.dispatch(args);
      return gateResult;
    }
    default: {
      const unknownMsg = `\n  Unknown command: "${args.subcommand}". Run with --help for usage.\n`;
      console.log(unknownMsg);
      return;
    }
  }
}

async function processInitSubcommand(args) {
  const validationError = validateInit(args);
  const hasValidationError = !!validationError;
  if (hasValidationError) {
    const errorOutput = `\n${validationError}\n`;
    console.log(errorOutput);
    return;
  }

  const { SDG: SpecDrivenGuide } = await import("./init/build-bundle.mjs");
  const isQuickMode = args.quick || args.mode === "quick";
  const isNonInteractive = isQuickMode || args.mode || args.flavor;

  const selectionPayload = isNonInteractive
    ? {
        mode: isQuickMode ? "quick" : args.mode || "agents",
        flavor: args.flavor,
        track: args.track,
      }
    : null;

  const buildParams = {
    isDryRun: args.isDryRun,
    selections: selectionPayload,
  };

  const buildResult = await SpecDrivenGuide.run(
    args.targetDirectory,
    buildParams,
  );

  return buildResult;
}

async function startInteractiveMode(args) {
  BundleUI.printHeader(packageJson.version);

  const updateInfo = await VersionUtils.checkForUpdates(packageJson.version);
  const hasUpdate = updateInfo.hasUpdate;
  if (hasUpdate) {
    BundleUI.printUpdateNotification(packageJson.version, updateInfo.latest);
  }

  try {
    while (true) {
      const menuChoice = await safeSelect({
        message: "What would you like to do?",
        choices: [
          {
            name: "1. 🏗️  Build Project: Inject staff-level engineering rules",
            value: "init",
          },
          {
            name: "2. ⚙️  Settings: Audit, update rules, and maintenance",
            value: "settings",
          },
          { name: "3. ❌ Exit", value: "exit" },
        ],
      });

      const isExit = menuChoice === "exit" || menuChoice === "back";
      if (isExit) {
        break;
      }

      await dispatchMenuAction(menuChoice, args);
      console.log(`\n${"─".repeat(50)}\n`);
    }
  } catch (error) {
    reportExitError(error);
  }

  BundleUI.printFooter();
}

function reportExitError(error) {
  const isForceClosed =
    error.message?.includes("force closed") || error.name === "ExitPromptError";

  if (isForceClosed) {
    console.log("\n\n  👋 Goodbye! See you soon engineer.");
    process.exit(0);
  }

  console.error("\n  ❌ Error:", error.message);
  process.exit(1);
}

async function dispatchMenuAction(menuChoice, args) {
  switch (menuChoice) {
    case "init": {
      const { SDG: SpecDrivenGuide } = await import("./init/build-bundle.mjs");
      const initResult = await SpecDrivenGuide.run(args.targetDirectory, {
        isDryRun: args.isDryRun,
      });

      return initResult;
    }
    case "settings": {
      const settingsResult = await openSettingsMenu(args.targetDirectory);
      return settingsResult;
    }
    default: {
      const idleResult = null;
      return idleResult;
    }
  }
}

async function openSettingsMenu(targetDirectory) {
  const settingsChoice = await safeSelect({
    message: "Settings:",
    choices: [
      {
        name: "1. 🔍 Governance Audit: Detect drift and law violations",
        value: "audit",
      },
      {
        name: "2. 🔄 Update Instructions: Re-apply latest rules (uses saved config)",
        value: "update-instructions",
      },
      {
        name: "3. 🗑️  Clear Generated Content: Remove all generated files",
        value: "clear",
      },
      { name: "4. Back", value: "back" },
    ],
  });

  const isBack = settingsChoice === "back";
  if (isBack) {
    const backResult = null;
    return backResult;
  }

  switch (settingsChoice) {
    case "audit": {
      const { AuditRunner } = await import("./audit/audit-bundle.mjs");
      const auditResult = await AuditRunner.audit();
      return auditResult;
    }
    case "update-instructions": {
      const updateResult = await applyUpdateInstructions(targetDirectory);
      return updateResult;
    }
    case "clear": {
      const { Cleaner } = await import("./maintenance/clear-bundle.mjs");
      const clearResult = await Cleaner.clear(targetDirectory);
      return clearResult;
    }
    default: {
      const idleResult = null;
      return idleResult;
    }
  }
}

async function applyUpdateInstructions(targetDirectory) {
  const { ManifestUtils } = await import("../lib/domain/manifest-utils.mjs");
  const { SDG: SpecDrivenGuide } = await import("./init/build-bundle.mjs");
  const manifest = ManifestUtils.loadManifest(targetDirectory);

  if (!manifest) {
    const noManifestMsg =
      "\n  ⚠️  No saved config found (.ai/.sdg-manifest.json).\n";

    const runHint = "  Run init first.\n";
    const noManifestOutput = noManifestMsg + runHint;
    console.log(noManifestOutput);
    return;
  }

  const { flavor } = manifest.selections;
  const updateHeader = `\n  Re-applying latest rules, Flavor: ${flavor}\n`;
  console.log(updateHeader);

  try {
    await SpecDrivenGuide.run(targetDirectory, {
      selections: manifest.selections,
    });
  } catch (error) {
    const failureOutput = `\n  ❌ Update failed: ${error.message}\n`;
    console.log(failureOutput);
  }
}

export const CLI = { run };

bootstrapIfDirect(import.meta.url, run);
