import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function getDirectories(source) {
  if (!fileSystem.existsSync(source)) {
    const emptyList = [];
    return emptyList;
  }

  const directoryEntries = fileSystem.readdirSync(source, {
    withFileTypes: true,
  });

  const directoryNames = directoryEntries
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  return directoryNames;
}

function copyRecursiveSync(src, dest, options = {}) {
  const { exclude = [] } = options;
  if (!fileSystem.existsSync(src)) {
    return;
  }

  const itemName = path.basename(src);
  if (exclude.includes(itemName)) {
    return;
  }

  const stats = fileSystem.statSync(src);
  if (stats.isDirectory()) {
    if (!fileSystem.existsSync(dest)) {
      fileSystem.mkdirSync(dest, { recursive: true });
    }

    for (const childItemName of fileSystem.readdirSync(src)) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName),
        options,
      );
    }
  } else {
    fileSystem.copyFileSync(src, dest);
  }
}

function getDirname(importMetaUrl) {
  const dirname = path.dirname(fileURLToPath(importMetaUrl));
  return dirname;
}

function bootstrapIfDirect(importMetaUrl, entryFunction) {
  const currentFile = fileURLToPath(importMetaUrl);
  if (!process.argv[1]) {
    return;
  }

  const entryFile = fileSystem.realpathSync(path.resolve(process.argv[1]));
  if (currentFile === entryFile) {
    const result = entryFunction();
    if (result && typeof result.catch === "function") {
      result.catch((error) => {
        if (error.name === "ExitPromptError") {
          console.log("\n\n  Aborted.\n");
          process.exit(0);
        }

        console.error(error);
        process.exit(1);
      });
    }
  }
}

function detectIndentation(content) {
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^(\s+)/);
    if (match) {
      const indentation = match[1];
      return indentation;
    }
  }

  const defaultIndentation = "  ";
  return defaultIndentation;
}

function writeJsonAtomic(filePath, data, originalContent = null) {
  const indent = originalContent ? detectIndentation(originalContent) : "  ";
  const newContent = `${JSON.stringify(data, null, indent)}\n`;

  if (originalContent === newContent) {
    return false;
  }

  try {
    fileSystem.writeFileSync(filePath, newContent);
    return true;
  } catch {
    return false;
  }
}

function safeReadJson(filePath) {
  if (!fileSystem.existsSync(filePath)) {
    return null;
  }

  try {
    const jsonText = fileSystem.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch {
    return null;
  }
}

function isMaintainerMode() {
  const projectRoot = process.cwd();
  const pkgPath = path.join(projectRoot, "package.json");
  const pkg = safeReadJson(pkgPath);
  const assetsPath = path.join(projectRoot, "src", "assets", "instructions");
  const isFrameworkPackage = pkg?.name === "spec-driven-guide";
  const hasAssets = fileSystem.existsSync(assetsPath);
  const maintainerMode = isFrameworkPackage && hasAssets;
  return maintainerMode;
}

export const FsUtils = {
  getDirectories,
  copyRecursiveSync,
  getDirname,
  bootstrapIfDirect,
  detectIndentation,
  writeJsonAtomic,
  safeReadJson,
  isMaintainerMode,
};
