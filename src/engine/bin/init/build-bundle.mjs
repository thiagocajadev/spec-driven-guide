/**
 * Build Bundle: Orchestrates wizard, injection, and assembly.
 */

import { createRequire } from "node:module";
import path from "node:path";

import { WizardUtils } from "../../lib/domain/wizard.mjs";
import { RulesetInjector } from "../../lib/domain/ruleset-injector.mjs";
import { InstructionAssembler } from "../../lib/domain/instruction-assembler.mjs";
import { ResultUtils } from "../../lib/core/result-utils.mjs";
import { FsUtils } from "../../lib/core/fs-utils.mjs";
import { BundleUI } from "../../lib/core/ui-utils.mjs";

const { gatherUserSelections, validateSelections } = WizardUtils;
const { prepareProjectStructure, injectRulesets } = RulesetInjector;
const {
  buildMasterInstructions,
  writeAgentConfig,
  writeBacklogFiles,
  writeGitignore,
  writeManifest,
  writeAutomationScripts,
  writeToolingAssets,
  removeGeneratedInstructions,
} = InstructionAssembler;
const { success } = ResultUtils;
const { bootstrapIfDirect } = FsUtils;
const {
  printWelcome,
  printStep,
  printAborted,
  printQuickSetupStart,
  printProjectRoot,
  printSuccessAgents,
  printQuickSuccess,
  printQuickDryRun,
  printDryRunPreview,
  printBuildSummary,
  printAgentConfigWarnings,
} = BundleUI;

const require = createRequire(import.meta.url);
const packageJson = require("../../../../package.json");

/**
 * Entry point for both interactive (wizard) and non-interactive (flags) modes.
 */
async function run(targetDirectory = process.cwd(), options = {}) {
  await orchestrateBuild(targetDirectory, options);
}

async function orchestrateBuild(targetDirectory, options) {
  printWelcome();

  if (options.selections) {
    const nonInteractiveResult = await buildNonInteractive(
      targetDirectory,
      options,
    );

    return nonInteractiveResult;
  }

  const interactiveResult = await buildInteractive(targetDirectory, options);
  return interactiveResult;
}

async function buildNonInteractive(targetDirectory, options) {
  const { isDryRun = false, selections } = options;

  const validationResult = validateSelections(selections);
  if (validationResult.isFailure) {
    const validationWarning = `\n  ⚠️  ${validationResult.error.message}`;
    console.log(validationWarning);
    process.exit(1);
  }

  if (selections.bump === undefined) {
    selections.bump = true;
  }

  const state = { step: "execute", userSelections: selections };
  const result = await finalizeExecutionPhase(state, targetDirectory, {
    isDryRun,
    skipConfirm: true,
  });

  if (result.isFailure) {
    const failureWarning = `\n  ⚠️  ${result.error.message}`;
    console.log(failureWarning);
    process.exit(1);
  }
}

async function buildInteractive(targetDirectory, options) {
  const state = { step: "selections", userSelections: null };

  while (state.step !== "done") {
    const result = await processExecutionStep(state, targetDirectory, options);
    if (result.isFailure) {
      if (result.error.code !== "USER_BACK") {
        const errorNotice = `\n  ⚠️  ${result.error.message}\n`;
        process.stdout.write(errorNotice);
      }

      const interactionResult = result;
      return interactionResult;
    }
  }
}

async function processExecutionStep(state, targetDirectory, options) {
  switch (state.step) {
    case "selections": {
      const selectionStepResult = await processSelectionPhase(
        state,
        targetDirectory,
      );

      return selectionStepResult;
    }
    case "execute": {
      const executionStepResult = await finalizeExecutionPhase(
        state,
        targetDirectory,
        options,
      );

      return executionStepResult;
    }
    default: {
      const defaultResult = success();
      return defaultResult;
    }
  }
}

async function processSelectionPhase(state, targetDirectory) {
  const selectionResult = await gatherUserSelections(targetDirectory);
  if (selectionResult.isFailure) {
    const selectionFailure = selectionResult;
    return selectionFailure;
  }

  state.userSelections = selectionResult.value;
  state.step = "execute";

  const phaseSuccess = success();
  return phaseSuccess;
}

async function finalizeExecutionPhase(state, targetDirectory, options = {}) {
  const { isDryRun = false, skipConfirm = false } = options;
  const selections = state.userSelections;

  if (selections.mode === "quick") {
    const quickModeResult = await buildQuickMode(state, targetDirectory, {
      isDryRun,
    });

    return quickModeResult;
  }

  if (isDryRun) {
    printDryRunPreview(selections, targetDirectory);
    state.step = "done";

    const dryRunSuccess = success();
    return dryRunSuccess;
  }

  const agentsModeResult = await buildAgentsMode(
    state,
    targetDirectory,
    selections,
    {
      skipConfirm,
    },
  );

  return agentsModeResult;
}

async function buildQuickMode(state, targetDirectory, { isDryRun }) {
  if (isDryRun) {
    const dryRunResult = abortForDryRun(
      state,
      targetDirectory,
      printQuickDryRun,
    );

    return dryRunResult;
  }

  printQuickSetupStart();
  const configOutcome = applyQuickPipeline(
    targetDirectory,
    state.userSelections,
  );

  printQuickSuccess(targetDirectory);
  printAgentConfigWarnings(configOutcome);
  state.step = "done";

  const quickSuccessResult = success();
  return quickSuccessResult;
}

async function buildAgentsMode(
  state,
  targetDirectory,
  selections,
  { skipConfirm = false } = {},
) {
  const confirmed = skipConfirm || (await printBuildSummary(selections));
  if (!confirmed) {
    const abortResult = abortExecution(state);
    return abortResult;
  }

  printProjectRoot(targetDirectory);
  const configOutcome = applyAgentsPipeline(targetDirectory, selections);

  printSuccessAgents(targetDirectory);
  printAgentConfigWarnings(configOutcome);
  state.step = "done";

  const buildResult = success();
  return buildResult;
}

function abortForDryRun(state, targetDirectory, printer) {
  printer(targetDirectory);
  state.step = "done";

  const dryRunAbortResult = success();
  return dryRunAbortResult;
}

function abortExecution(state) {
  printAborted();
  state.step = "done";

  const userAbortResult = success();
  return userAbortResult;
}

function applyQuickPipeline(targetDirectory, selections) {
  printStep(1, 5, "Preparing .ai/ structure...");
  removeGeneratedInstructions(targetDirectory);
  prepareProjectStructure(targetDirectory);

  printStep(2, 5, "Injecting rules...");
  injectRulesets(targetDirectory, selections);

  printStep(3, 5, "Assembling AGENTS.md...");
  const content = buildMasterInstructions(selections);

  printStep(4, 5, "Writing agent config and backlog...");
  const configOutcome = writeAgentConfig(targetDirectory, content);
  writeBacklogFiles(targetDirectory, selections);
  writeGitignore(targetDirectory);

  printStep(5, 5, "Finalizing manifest...");
  writeAutomationScripts(targetDirectory, selections);
  writeToolingAssets(targetDirectory);
  writeManifest(targetDirectory, selections, packageJson.version);

  return configOutcome;
}

function applyAgentsPipeline(targetDirectory, selections) {
  printStep(1, 5, "Preparing .ai/ structure...");
  removeGeneratedInstructions(targetDirectory);
  prepareProjectStructure(targetDirectory);

  printStep(2, 5, "Injecting rules...");
  injectRulesets(targetDirectory, selections);

  printStep(3, 5, "Assembling AGENTS.md...");
  const content = buildMasterInstructions(selections);

  printStep(4, 5, "Writing agent config and backlog...");
  const configOutcome = writeAgentConfig(targetDirectory, content);
  writeBacklogFiles(targetDirectory, selections);
  writeGitignore(targetDirectory);

  printStep(5, 5, "Finalizing manifest...");
  writeAutomationScripts(targetDirectory, selections);
  writeToolingAssets(targetDirectory);
  writeManifest(targetDirectory, selections, packageJson.version);

  return configOutcome;
}

export const SDG = {
  run,
};

bootstrapIfDirect(import.meta.url, launchFromCli);

function launchFromCli() {
  const targetDirectory = process.argv[2] ?? process.cwd();
  const isDryRun = process.argv.includes("--dry-run");

  const buildResult = run(path.resolve(targetDirectory), { isDryRun });
  return buildResult;
}
