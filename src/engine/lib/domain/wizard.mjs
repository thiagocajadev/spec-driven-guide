import path from "node:path";
import { DisplayUtils } from "../core/display-utils.mjs";
import { FsUtils } from "../core/fs-utils.mjs";
import { ResultUtils } from "../core/result-utils.mjs";
import { PromptUtils } from "../infra/prompt-utils.mjs";

const { displayName } = DisplayUtils;
const { getDirectories, getDirname } = FsUtils;
const { success, fail } = ResultUtils;
const { safeSelect, safeInput } = PromptUtils;

const __dirname = getDirname(import.meta.url);
const SOURCE_INSTRUCTIONS = path.join(
  __dirname,
  "../../..",
  "assets",
  "instructions",
);

const WIZARD_STEPS = {
  INITIAL: "initial",
  FLAVOR: "flavor",
  PARTNER: "partner",
  DONE: "done",
};

const STEP_ORDER = [
  WIZARD_STEPS.INITIAL,
  WIZARD_STEPS.FLAVOR,
  WIZARD_STEPS.PARTNER,
  WIZARD_STEPS.DONE,
];

async function gatherUserSelections(targetDirectory = process.cwd()) {
  const availableFlavors = getDirectories(
    path.join(SOURCE_INSTRUCTIONS, "flavors"),
  );

  let selections = {
    mode: "agents",
    flavor: "vertical-slice",
  };

  let step = WIZARD_STEPS.INITIAL;
  let historyStack = [];

  while (step !== WIZARD_STEPS.DONE) {
    const context = { step, selections, availableFlavors, targetDirectory };
    const stepResult = await dispatchWizardStep(step, context);

    if (stepResult.isFailure) {
      const stepFailure = stepResult;
      return stepFailure;
    }

    if (stepResult.value.mode === "quick") {
      const quickSetupData = buildQuickSetup();
      return quickSetupData;
    }

    const currentStepIndex = STEP_ORDER.indexOf(step);
    const nextStepIndex = STEP_ORDER.indexOf(stepResult.value.nextStep);
    const isGoingBack = nextStepIndex < currentStepIndex;

    if (isGoingBack) {
      let lastState;
      while (
        historyStack.length > 0 &&
        STEP_ORDER.indexOf(historyStack[historyStack.length - 1].step) >=
          nextStepIndex
      ) {
        lastState = historyStack.pop();
      }

      if (lastState) {
        step = lastState.step;
        selections = lastState.selections;
      } else {
        step = WIZARD_STEPS.INITIAL;
      }
    } else {
      historyStack.push({
        step,
        selections: JSON.parse(JSON.stringify(selections)),
      });

      step = stepResult.value.nextStep;
      applyStepResult(selections, stepResult.value);
    }
  }

  const wizardResult = success(selections);
  return wizardResult;
}

function applyStepResult(currentSelections, stepValue) {
  if (stepValue.mode) {
    currentSelections.mode = stepValue.mode;
  }

  if (stepValue.flavor) {
    currentSelections.flavor = stepValue.flavor;
  }

  if (stepValue.partner) {
    currentSelections.partner = currentSelections.partner || {};
    Object.assign(currentSelections.partner, stepValue.partner);
  }
}

async function dispatchWizardStep(step, context) {
  const STEP_HANDLERS = {
    [WIZARD_STEPS.INITIAL]: () => promptInitialChoice(),
    [WIZARD_STEPS.FLAVOR]: () => promptArchitectureFlavor(context),
    [WIZARD_STEPS.PARTNER]: () => promptPartnerInfo(),
  };

  const handler =
    STEP_HANDLERS[step] ?? (() => success({ nextStep: WIZARD_STEPS.DONE }));

  const stepResult = await handler();
  return stepResult;
}

async function promptInitialChoice() {
  const result = await safeSelect({
    message: "What would you like to do?",
    choices: [
      {
        name: "1. Full Setup: configure architecture flavor and partner info",
        value: "agents",
      },
      {
        name: "2. ⚡ Quick: install with defaults (lite flavor, placeholder stack.md)",
        value: "quick",
      },
      { name: "3. Back", value: "back" },
    ],
  });

  if (result === "back") {
    const backResult = fail("", "USER_BACK");
    return backResult;
  }

  const initialChoiceResult = success({
    nextStep: WIZARD_STEPS.FLAVOR,
    mode: result,
  });

  return initialChoiceResult;
}

function buildQuickSetup() {
  const quickSetupResult = success({
    mode: "quick",
    flavor: "lite",
    partner: {
      name: "Human Developer",
      role: "Dev Partner",
    },
  });

  const quickResult = quickSetupResult;
  return quickResult;
}

async function promptArchitectureFlavor(context) {
  const { availableFlavors } = context;
  const flavorChoices = buildFlavorChoices(availableFlavors);

  const flavor = await safeSelect({
    message: "Which architecture should the project follow?",
    choices: [...flavorChoices, { name: "Back", value: "back" }],
  });

  if (flavor === "back") {
    const backResult = success({ nextStep: WIZARD_STEPS.INITIAL });
    return backResult;
  }

  const flavorResult = success({ nextStep: WIZARD_STEPS.PARTNER, flavor });
  return flavorResult;
}

function buildFlavorChoices(flavors) {
  const RANK_ORDER = { lite: 0, "vertical-slice": 1, mvc: 2, legacy: 3 };

  const choices = flavors.map(toFlavorOption);
  const prioritizedChoices = choices.sort((choiceA, choiceB) => {
    const rankA = RANK_ORDER[choiceA.value] ?? 99;
    const rankB = RANK_ORDER[choiceB.value] ?? 99;

    const rankDiff = rankA - rankB;
    return rankDiff;
  });

  return prioritizedChoices;
}

function toFlavorOption(flavorFolderKey) {
  const PRESET_LABELS = {
    lite: (base) => `0. ${base} (Simple & Agile)`,
    "vertical-slice": (base) => `1. ${base} (Recommended)`,
    mvc: (base) => `2. ${base} (Standard Layers)`,
    legacy: (base) => `3. ${base} (Event-Driven / SSR)`,
  };

  const baseLabel = displayName(flavorFolderKey);
  const formatter =
    PRESET_LABELS[flavorFolderKey] ?? ((base) => `Sub. ${base}`);

  const label = formatter(baseLabel);

  const choice = { name: label, value: flavorFolderKey };
  return choice;
}

async function promptPartnerInfo() {
  const input = await safeInput({
    message: 'Your name and role? (e.g. "Thiago, Dev Founder"). Enter to skip',
    maxLength: 80,
  });

  if (input === "back") {
    const backResult = success({ nextStep: WIZARD_STEPS.FLAVOR });
    return backResult;
  }

  const partner = parsePartnerInput(input);
  const partnerResult = success({ nextStep: WIZARD_STEPS.DONE, partner });
  return partnerResult;
}

function parsePartnerInput(input) {
  const isEmpty = !input || input.trim().length === 0;
  if (isEmpty) {
    const emptyPartner = { name: null, role: null };
    return emptyPartner;
  }

  const separatorIndex = input.indexOf(",");
  const hasComma = separatorIndex !== -1;

  if (!hasComma) {
    const noCommaPartner = { name: input.trim(), role: null };
    return noCommaPartner;
  }

  const parsedPartner = {
    name: input.slice(0, separatorIndex).trim() || null,
    role: input.slice(separatorIndex + 1).trim() || null,
  };

  return parsedPartner;
}

function validateSelections(selections) {
  if (selections.mode === "quick") {
    selections.flavor = selections.flavor || "lite";

    const quickValidResult = success(selections);
    return quickValidResult;
  }

  const availableFlavors = getDirectories(
    path.join(SOURCE_INSTRUCTIONS, "flavors"),
  );

  if (!selections.flavor) {
    const missingFlavorResult = fail("--flavor is required.", "MISSING_FLAVOR");
    return missingFlavorResult;
  }

  if (!availableFlavors.includes(selections.flavor)) {
    const invalidFlavorMessage = `Unknown flavor: "${selections.flavor}". Available: ${availableFlavors.join(", ")}`;
    const invalidFlavorResult = fail(invalidFlavorMessage, "INVALID_FLAVOR");
    return invalidFlavorResult;
  }

  const setupResult = success(selections);
  return setupResult;
}

export const WizardUtils = {
  gatherUserSelections,
  validateSelections,
};
