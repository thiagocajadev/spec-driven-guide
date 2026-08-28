import fileSystem from "node:fs";
import path from "node:path";
import { select, checkbox, confirm, input } from "@inquirer/prompts";

function isExitError(error) {
  const isExit =
    error.name === "ExitPromptError" || error.message?.includes("force closed");

  return isExit;
}

async function safeSelect(options) {
  try {
    const selection = await select(options);
    return selection;
  } catch (error) {
    if (isExitError(error)) {
      const backSignal = "back";
      return backSignal;
    }

    throw error;
  }
}

async function safeCheckbox(options) {
  try {
    const selection = await checkbox(options);
    return selection;
  } catch (error) {
    if (isExitError(error)) {
      const backList = ["back"];
      return backList;
    }

    throw error;
  }
}

async function safeConfirm(options) {
  try {
    const isConfirmed = await confirm(options);
    return isConfirmed;
  } catch (error) {
    if (isExitError(error)) {
      const isAborted = false;
      return isAborted;
    }

    throw error;
  }
}

/**
 * Robust sanitization for terminal inputs.
 * - Normalizes Unicode (NFKD) to decouple accents.
 * - Strips HTML/Script tags (anti-injection).
 * - Trims and limits length.
 * - Escapes Markdown breaking characters (\, `, *, _, {, }, [, ], (, ), #, +, -, ., !).
 */
function sanitizeInput(value, maxLength = 200) {
  if (!value) {
    const emptyInput = "";
    return emptyInput;
  }

  let sanitized = String(value)
    .normalize("NFKD") // Resovle acentos estranhos / Unicode Normalization
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos remanescentes
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .trim();

  // Escaping Markdown characters to prevent breaking context.md structure
  sanitized = sanitized.replace(/([\\`*_{}[\]()#+\-.!])/g, "\\$1");

  const finalSanitizedInput = sanitized.slice(0, maxLength);
  return finalSanitizedInput;
}

async function safeInput(options) {
  const { minLength = 0, maxLength = 200, ...inquirerOptions } = options;

  try {
    while (true) {
      const response = await input(inquirerOptions);
      if (response === "back") {
        const backSignal = "back";
        return backSignal;
      }

      const sanitized = sanitizeInput(response, maxLength);

      if (minLength > 0 && sanitized.length < minLength) {
        console.log(
          `\n  ⚠️  Input too short (minimum ${minLength} characters).\n`,
        );

        continue;
      }

      const validSanitizedResponse = sanitized;
      return validSanitizedResponse;
    }
  } catch (error) {
    if (isExitError(error)) {
      const backResult = "back";
      return backResult;
    }

    throw error;
  }
}

const PROJECT_ROOT = process.cwd();

function isMaintainerMode() {
  const packagePath = path.join(PROJECT_ROOT, "package.json");
  if (!fileSystem.existsSync(packagePath)) {
    return false;
  }

  try {
    const packageData = JSON.parse(
      fileSystem.readFileSync(packagePath, "utf8"),
    );

    const isMaintainer = packageData.name === "spec-driven-guide";
    return isMaintainer;
  } catch {
    return false;
  }
}

export const PromptUtils = {
  isMaintainerMode,
  safeSelect,
  safeCheckbox,
  safeConfirm,
  safeInput,
  sanitizeInput,
};
