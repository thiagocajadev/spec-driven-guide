const BANNED_ABBREVIATIONS = [
  "req",
  "res",
  "ctx",
  "idx",
  "tmp",
  "arr",
  "val",
  "cb",
  "mgr",
  "ctrl",
  "svc",
  "prev",
];

const ATOMIC_DECLARATION_PATTERN =
  /^\s*(const|let|var|readonly)\s+[A-Za-z_]\w*\s*(:[^=]*)?=\s*[^;{]*;?\s*$/;

const SECTION_BANNER_PATTERN = /^\s*(\/\/|#|--)\s*[-=]{3,}/gm;

function validateSlaCompliance(content) {
  const entryPointRegex =
    /(?:async\s+)?function\s+(run|start|init)\s*\([\s\S]*?\)\s*\{([\s\S]*?)\n\}/g;

  const violations = [];
  let regexMatch;

  while ((regexMatch = entryPointRegex.exec(content)) !== null) {
    const entryPointName = regexMatch[1];
    const functionBody = regexMatch[2];
    const bodyLines = functionBody
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const shapeViolation = detectEntryPointShapeViolation(
      entryPointName,
      bodyLines,
    );

    if (shapeViolation) {
      violations.push(shapeViolation);
    }
  }

  const runFunctionMatch = content.match(
    /(?:async\s+)?function run\(\) \{([\s\S]*?)\n\}/,
  );

  if (runFunctionMatch) {
    const runBody = runFunctionMatch[1];
    const forbiddenPatterns = [
      { pattern: /console\.log\(/, label: "console.log" },
      { pattern: /path\.resolve\(/, label: "path.resolve" },
      { pattern: /process\.argv/, label: "process.argv access" },
    ];

    forbiddenPatterns.forEach((item) => {
      if (item.pattern.test(runBody)) {
        violations.push(`Implementation logic (${item.label}) in run()`);
      }
    });
  }

  const slaResult = {
    pass: violations.length === 0,
    reason:
      violations.length > 0
        ? `Pure Entry Point violation: ${violations.join("; ")}`
        : null,
  };

  return slaResult;
}

function detectEntryPointShapeViolation(entryPointName, bodyLines) {
  if (bodyLines.length === 1) {
    const onlyLine = bodyLines[0];
    const hasTernary = /\?[^?]*:/.test(onlyLine);
    if (hasTernary) {
      const ternaryViolation = `${entryPointName}() has ternary on body: extract to 'const X = ...; return X;'`;
      return ternaryViolation;
    }

    return null;
  }

  if (bodyLines.length === 2 && isCanonicalDelegationShape(bodyLines)) {
    return null;
  }

  const lengthViolation = `${entryPointName}() body must be 1 statement OR canonical 'const X = call(); return X;' (got ${bodyLines.length} lines)`;
  return lengthViolation;
}

function isCanonicalDelegationShape(bodyLines) {
  const [firstLine, secondLine] = bodyLines;
  const constMatch = firstLine.match(/^const\s+(\w+)\s*=/);
  if (!constMatch) {
    return false;
  }

  const constName = constMatch[1];
  const expectedReturn = `return ${constName};`;

  const isMatching =
    secondLine === expectedReturn || secondLine === `return ${constName}`;

  return isMatching;
}

function validateNarrativeSiblings(content) {
  const topLevelFunctionsCount = (content.match(/^function\s+\w+/gm) || [])
    .length;

  const exportedFunctionsCount = (content.match(/^\s+\w+,/gm) || []).length;

  const isViolatingDensity =
    topLevelFunctionsCount > 12 &&
    exportedFunctionsCount < topLevelFunctionsCount / 2;

  const siblingsResult = {
    pass: !isViolatingDensity,
    reason: isViolatingDensity
      ? "Excessive top-level function density (>12). Consider refactoring to dedicated lib."
      : null,
  };

  return siblingsResult;
}

function validateExplainingReturns(content) {
  const lines = content.split("\n");
  const violations = [];

  for (let index = 2; index < lines.length; index++) {
    const currentLine = lines[index].trim();

    const isPotentialBareReturn =
      currentLine.startsWith("return ") &&
      !["return null", "return false", "return true", "return;"].some(
        (statement) => currentLine.startsWith(statement),
      );

    if (isPotentialBareReturn) {
      const returnMatch = currentLine.match(/return\s+([a-zA-Z0-9_$]+);?$/);

      if (!returnMatch) {
        const logicHint = classifyReturnLogic(currentLine);
        violations.push(`line ${index + 1} (${logicHint})`);
        continue;
      }

      const returnedSymbol = returnMatch[1];

      const isExplained = scanForSymbolExplainer(lines, index, returnedSymbol);
      if (!isExplained) {
        violations.push(`line ${index + 1} (Bare return: "${returnedSymbol}")`);
      }
    }
  }

  const explainingResult = {
    pass: violations.length === 0,
    reason:
      violations.length > 0
        ? `Laws Compliance violation: ${violations.join("; ")}`
        : null,
  };

  return explainingResult;
}

function scanForSymbolExplainer(sourceLines, returnLineIndex, symbol) {
  const SCAN_LIMIT = 100;
  const startPos = Math.max(0, returnLineIndex - SCAN_LIMIT);
  const constRegex = new RegExp(`const\\s+${symbol}\\b`);

  for (
    let currentPos = returnLineIndex - 1;
    currentPos >= startPos;
    currentPos--
  ) {
    const lineText = sourceLines[currentPos].trim();

    const isSkipLine = lineText === "" || /^[{}'`\];,.!]+$/.test(lineText);
    if (isSkipLine) {
      continue;
    }

    if (constRegex.test(lineText)) {
      return true;
    }

    const isPureDelegation =
      /(function|async)\s+\w+\s*\(/.test(lineText) && lineText.includes("{");

    if (isPureDelegation) {
      return true;
    }

    const isIndented =
      sourceLines[currentPos].startsWith("  ") ||
      sourceLines[currentPos].startsWith("\t");

    if (isIndented && !lineText.includes("const ")) {
      continue;
    }

    if (
      /^(if|for|while|switch|return|export|async|function)\b/.test(lineText)
    ) {
      break;
    }
  }

  return false;
}

function classifyReturnLogic(line) {
  const isTemplateLiteral = /return\s+[^;]*`[^`]*\$\{/.test(line);
  if (isTemplateLiteral) {
    return "Template literal in return";
  }

  const isStringInterpolation = /return\s+[^;]*\$"[^"]*\{/.test(line);
  if (isStringInterpolation) {
    return "String interpolation in return";
  }

  const isTernary = /return\s+[^;?]+\?[^;:]+:[^;]+/.test(line);
  if (isTernary) {
    return "Ternary in return";
  }

  const isArithmetic = /return\s+[a-zA-Z_]\w*\s*[+\-*/]\s*[a-zA-Z_]\w*/.test(
    line,
  );

  if (isArithmetic) {
    return "Arithmetic in return";
  }

  const isConstructor = /return\s+new\s+[A-Z]\w*\s*\(/.test(line);
  if (isConstructor) {
    return "Constructor in return";
  }

  const genericHint = "Literal return";
  return genericHint;
}

function validateNamingDiscipline(content) {
  const cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
    .replace(/(['"`])(?:(?!\1)[^\\]|\\.)*\1/g, "");

  const abbreviationPattern = new RegExp(
    `\\b(${BANNED_ABBREVIATIONS.join("|")})\\b\\s*(?=[,)=:.])`,
    "g",
  );

  const abbreviationMatches = cleanContent.match(abbreviationPattern) || [];
  const normalized = abbreviationMatches.map((match) => match.trim());

  const namingResult = {
    pass: normalized.length === 0,
    reason:
      normalized.length > 0
        ? `Banned abbreviations detected: ${normalized.join(", ")}`
        : null,
  };

  return namingResult;
}

function validateVerticalDensity(content) {
  const lines = content.split("\n");
  const doubleBlankViolations = scanDoubleBlankLines(lines);
  const tightReturnViolations = scanExplainingReturnTight(lines);
  const orphanAtomicViolations = scanOrphanAtomic(lines);

  const violations = [
    ...doubleBlankViolations,
    ...tightReturnViolations,
    ...orphanAtomicViolations,
  ];

  const densityResult = {
    pass: violations.length === 0,
    reason:
      violations.length > 0
        ? `Vertical Density violation: ${violations.join("; ")}`
        : null,
  };

  return densityResult;
}

function scanDoubleBlankLines(lines) {
  const violations = [];

  for (let index = 0; index < lines.length - 1; index++) {
    const isDoubleBlank =
      lines[index].trim() === "" && lines[index + 1].trim() === "";

    if (isDoubleBlank) {
      violations.push(`line ${index + 1} (double blank line)`);
    }
  }

  return violations;
}

function scanExplainingReturnTight(lines) {
  const violations = [];
  const tightReturnPattern = /^\s*return\s+\w+\s*;?\s*$/;

  for (let index = 3; index < lines.length; index++) {
    const isReturnLine = tightReturnPattern.test(lines[index]);
    if (!isReturnLine) {
      continue;
    }

    const hasBlankAbove = lines[index - 1].trim() === "";
    const hasAtomicPrep = isAtomicDeclaration(lines[index - 2]);
    const hasDeclarationBoundary = isDeclarationBoundary(lines[index - 3]);

    const isTightPairViolation =
      hasBlankAbove && hasAtomicPrep && hasDeclarationBoundary;

    if (isTightPairViolation) {
      violations.push(
        `line ${index + 1} (Explaining Return pair must be tight)`,
      );
    }
  }

  return violations;
}

function scanOrphanAtomic(lines) {
  const violations = [];

  for (let index = 3; index < lines.length; index++) {
    const orphan = lines[index];
    const blankBefore = lines[index - 1];
    const pairSecond = lines[index - 2];
    const pairFirst = lines[index - 3];
    const nextLine = lines[index + 1];

    const hasOrphanShape =
      isSimpleLiteralAtomic(orphan) &&
      blankBefore.trim() === "" &&
      isSimpleLiteralAtomic(pairSecond) &&
      isSimpleLiteralAtomic(pairFirst) &&
      isIsolatedBelow(nextLine);

    if (!hasOrphanShape) {
      continue;
    }

    const isNextContinuingGroup =
      typeof nextLine === "string" && isAtomicDeclaration(nextLine);

    if (isNextContinuingGroup) {
      continue;
    }

    violations.push(
      `line ${index + 1} (orphan atomic, fold into trio or rebalance to 2+2)`,
    );
  }

  return violations;
}

function isAtomicDeclaration(line) {
  if (typeof line !== "string") {
    return false;
  }

  const hasValidShape = ATOMIC_DECLARATION_PATTERN.test(line);
  if (!hasValidShape) {
    return false;
  }

  const hasTrailingBrace = /\{\s*$/.test(line);
  const isAtomic = !hasTrailingBrace;
  return isAtomic;
}

function isSimpleLiteralAtomic(line) {
  if (!isAtomicDeclaration(line)) {
    return false;
  }

  const rhs = line.split("=").slice(1).join("=");

  const hasAwait = /\bawait\b/.test(rhs);
  const hasCall = rhs.includes("(");
  const hasIndex = rhs.includes("[");
  const isLiteralOnly = !hasAwait && !hasCall && !hasIndex;
  return isLiteralOnly;
}

function isDeclarationBoundary(line) {
  if (line === undefined || line === null) {
    return true;
  }

  const trimmed = line.trim();
  if (trimmed === "") {
    return true;
  }

  const isBlockOpen = /\{\s*$/.test(line);
  if (isBlockOpen) {
    return true;
  }

  const isArrowBlock = /=>\s*\{?\s*$/.test(line);
  return isArrowBlock;
}

function isIsolatedBelow(nextLine) {
  if (nextLine === undefined) {
    return true;
  }

  const trimmed = nextLine.trim();
  if (trimmed === "") {
    return true;
  }

  const isBlockClose = /^\s*}/.test(nextLine);
  return isBlockClose;
}

function validateRevealingModulePattern(content) {
  const hasRevealingObject = /export const \w+ = \{[\s\S]*\};/m.test(content);
  // self-flag evasion: the literal string 'export default' would make this very file trip its own detector.
  const forbiddenDefaultExport = "export " + "default";
  const hasExportDefault = content.includes(forbiddenDefaultExport);

  let revealingReason = null;
  if (!hasRevealingObject) {
    revealingReason = "Missing Revealing Module Pattern export.";
  } else if (hasExportDefault) {
    revealingReason = `Uses ${forbiddenDefaultExport}.`;
  }

  const revealingResult = {
    pass: hasRevealingObject && !hasExportDefault,
    reason: revealingReason,
  };

  return revealingResult;
}

function validateBooleanPrefixes(content) {
  const bareBooleanMatches = content.match(
    /\bconst\s+(loading|error|active|valid)\s*=/g,
  );

  const booleanResult = {
    pass: !bareBooleanMatches,
    reason: bareBooleanMatches
      ? `Bare boolean detected: ${bareBooleanMatches.join(", ")}`
      : null,
  };

  return booleanResult;
}

function validateNoSectionBanners(content) {
  const banners = content.match(SECTION_BANNER_PATTERN) || [];
  const uniqueBanners = [...new Set(banners.map((banner) => banner.trim()))];

  const bannerResult = {
    pass: uniqueBanners.length === 0,
    reason:
      uniqueBanners.length > 0
        ? `Section banner detected: ${uniqueBanners.join(", ")}`
        : null,
  };

  return bannerResult;
}

export const NarrativeHeuristics = {
  validateSlaCompliance,
  validateNarrativeSiblings,
  validateExplainingReturns,
  validateNamingDiscipline,
  validateVerticalDensity,
  validateRevealingModulePattern,
  validateBooleanPrefixes,
  validateNoSectionBanners,
};
