import fileSystem from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import dedent from "dedent";
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
const AI_DIR = path.join(PROJECT_ROOT, ".ai");
const PROMPT_FILE = path.join(AI_DIR, "last-prompt.md");

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

function savePromptToFile(content) {
  if (!fileSystem.existsSync(AI_DIR)) {
    fileSystem.mkdirSync(AI_DIR, { recursive: true });
  }

  fileSystem.writeFileSync(PROMPT_FILE, content, "utf8");
}

async function copyToClipboard(content) {
  const clipboardPromise = new Promise((resolve) => {
    const COMMAND_MAP = {
      darwin: "pbcopy",
      win32: "clip",
      linux: "xclip -selection clipboard || xsel -bi",
    };

    const command = COMMAND_MAP[process.platform];

    if (!command) {
      const unsupportedResult = resolve(false);
      return unsupportedResult;
    }

    const child = exec(command, (error) => {
      resolve(!error);
    });

    child.on("error", () => {
      resolve(false);
    });

    if (child.stdin) {
      child.stdin.on("error", () => {
        resolve(false);
      });

      child.stdin.write(content);
      child.stdin.end();
    } else {
      resolve(false);
    }
  });

  const finalClipboardPromise = clipboardPromise;
  return finalClipboardPromise;
}

async function printPromptUI(content, title = "AI Prompt Generated") {
  renderPromptHeader(title, content);
  const copied = await copyToClipboard(content);
  renderCopyStatus(copied);
  renderPersistenceInfo();
  renderUsageInstructions();
}

function renderPromptHeader(title, content) {
  const maintainer = isMaintainerMode();
  savePromptToFile(content);

  console.log(`\n  ✅ ${title}`);

  if (maintainer) {
    console.log(
      "  🛠️  MAINTAINER MODE DETECTED: Prompt targets the Core Instructions.",
    );
  }

  console.log(`  ${"─".repeat(60)}`);
}

function renderCopyStatus(copied) {
  if (copied) {
    console.log("  📋 COPIED TO CLIPBOARD AUTOMATICALLY.");
  } else {
    console.log(
      "  ⚠️  COULD NOT COPY TO CLIPBOARD (Install xclip/xsel on Linux).",
    );
  }
}

function renderPersistenceInfo() {
  const persistenceMessage = `  💾 SAVED TO: .ai/last-prompt.md`;
  const separator = `  ${"─".repeat(60)}`;

  console.log(persistenceMessage);
  console.log(separator);
}

function renderUsageInstructions() {
  const instructions = dedent`

    🤖 HOW TO USE WITH LOCAL AGENTS (Cursor, Claude Code, Windsurf):
       Tell your agent: "Follow the instructions in .ai/last-prompt.md"

    🌍 HOW TO USE WITH WEB CHATS (Claude.ai, ChatGPT, Gemini):
       The prompt is already in your clipboard. Just paste it (Ctrl+V).
    ${"─".repeat(60)}
  `;

  console.log(instructions);
}

export const PromptUtils = {
  isMaintainerMode,
  savePromptToFile,
  copyToClipboard,
  printPromptUI,
  safeSelect,
  safeCheckbox,
  safeConfirm,
  safeInput,
  sanitizeInput,
};
