import fileSystem from "node:fs";
import path from "node:path";

import { FsUtils } from "../core/fs-utils.mjs";
import { KitEmission } from "./kit-emission.mjs";

const { copyRecursiveSync, getDirname } = FsUtils;
const { resolveKitPath } = KitEmission;

const __dirname = getDirname(import.meta.url);
const SOURCE_ASSETS = path.join(__dirname, "../../..", "assets");
const SOURCE_INSTRUCTIONS = path.join(SOURCE_ASSETS, "instructions");
const SOURCE_SKILLS = path.join(SOURCE_ASSETS, "skills");
const SOURCE_COMMANDS = path.join(SOURCE_INSTRUCTIONS, "commands");
const SOURCE_COMPETENCIES = path.join(SOURCE_INSTRUCTIONS, "competencies");

function prepareProjectStructure(targetDirectory) {
  const instructionsDir = resolveKitPath(targetDirectory, "instructions");
  const commandsDir = resolveKitPath(targetDirectory, "commands");
  const skillsDir = resolveKitPath(targetDirectory, "skills");

  fileSystem.mkdirSync(instructionsDir, { recursive: true });
  fileSystem.mkdirSync(commandsDir, { recursive: true });
  fileSystem.mkdirSync(skillsDir, { recursive: true });
}

function injectRulesets(targetDirectory, selections) {
  const { flavor } = selections;
  const projectAiInstructions = resolveKitPath(targetDirectory, "instructions");

  const projectAiSkills = resolveKitPath(targetDirectory, "skills");

  if (fileSystem.existsSync(SOURCE_SKILLS)) {
    copyRecursiveSync(SOURCE_SKILLS, projectAiSkills);
  }

  const flavorSrc = path.join(SOURCE_INSTRUCTIONS, "flavors", flavor);
  if (fileSystem.existsSync(flavorSrc)) {
    copyRecursiveSync(flavorSrc, path.join(projectAiInstructions, "flavor"));
  }

  injectCompetencies(projectAiInstructions);

  copyRecursiveSync(
    path.join(SOURCE_INSTRUCTIONS, "templates"),
    path.join(projectAiInstructions, "templates"),
  );

  if (fileSystem.existsSync(SOURCE_COMMANDS)) {
    copyRecursiveSync(
      SOURCE_COMMANDS,
      resolveKitPath(targetDirectory, "commands"),
    );
  }
}

function collectOutputSummary() {
  const directories = [
    ".ai/kit/skills/",
    ".ai/kit/instructions/flavor/",
    ".ai/kit/instructions/competencies/",
    ".ai/kit/instructions/templates/",
    ".ai/kit/commands/",
  ];

  const summary = { directories };
  return summary;
}

function injectCompetencies(projectAiInstructions) {
  if (!fileSystem.existsSync(SOURCE_COMPETENCIES)) {
    return;
  }

  const competenciesDir = path.join(projectAiInstructions, "competencies");
  fileSystem.mkdirSync(competenciesDir, { recursive: true });

  const deliverySrc = path.join(SOURCE_COMPETENCIES, "delivery.md");
  if (!fileSystem.existsSync(deliverySrc)) {
    return;
  }

  fileSystem.copyFileSync(
    deliverySrc,
    path.join(competenciesDir, "delivery.md"),
  );
}

export const RulesetInjector = {
  prepareProjectStructure,
  injectRulesets,
  collectOutputSummary,
};
