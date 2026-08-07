function checkResult(jsonInput) {
  const parsed = parseJson(jsonInput);

  const isParseFailure = !parsed.isSuccess;
  if (isParseFailure) {
    const parseError = buildUnverifiable(parsed.error);
    return parseError;
  }

  const report = unwrapEnvelope(parsed.value);
  const isUnreadableShape = !Array.isArray(report?.violations);
  if (isUnreadableShape) {
    const shapeError = buildUnverifiable(describeShape(report));
    return shapeError;
  }

  const blockViolations = filterBlockViolations(report.violations);
  const hasBlockViolations = blockViolations.length > 0;

  const checkedResult = {
    canCommit: !hasBlockViolations,
    violations: report.violations,
    blockViolations,
  };

  return checkedResult;
}

/**
 * A gate that cannot read the verdict has not approved anything. It reports
 * `canCommit: true` so an automatic hook never blocks on infrastructure, and
 * carries `unverifiedReason` so the caller can shout, or exit 1 under --strict.
 */
function buildUnverifiable(reason) {
  const unverifiable = {
    canCommit: true,
    violations: [],
    blockViolations: [],
    unverifiedReason: reason,
  };

  return unverifiable;
}

/**
 * Agent CLIs wrap the model output in their own envelope, such as `claude
 * --output-format json` emits `{"type":"result","result":"<json string>"}`.
 * Unwrap one level so the report inside is what gets checked.
 */
function unwrapEnvelope(value) {
  const hasEnvelope =
    !Array.isArray(value?.violations) && typeof value?.result === "string";

  if (!hasEnvelope) {
    return value;
  }

  const inner = parseJson(value.result);
  if (!inner.isSuccess) {
    return value;
  }

  const unwrapped = inner.value;
  return unwrapped;
}

function describeShape(report) {
  const isObject = report !== null && typeof report === "object";
  if (!isObject) {
    const primitiveReason = `Expected a review object, got ${typeof report}`;
    return primitiveReason;
  }

  const keyList = Object.keys(report).join(", ") || "no keys";
  const missingReason = `Review JSON has no \`violations\` array (keys: ${keyList})`;
  return missingReason;
}

function parseJson(rawInput) {
  try {
    const stripped = stripFences(rawInput.trim());
    const value = JSON.parse(stripped);

    const successResult = { isSuccess: true, value };
    return successResult;
  } catch {
    const failResult = {
      isSuccess: false,
      error: "Invalid JSON from LLM output",
    };

    return failResult;
  }
}

function stripFences(text) {
  const isFenced = text.startsWith("```");
  if (!isFenced) {
    return text;
  }

  const stripped = text
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "");

  return stripped;
}

function filterBlockViolations(violations) {
  const blockOnly = violations.filter(
    (violation) => violation.tier === "BLOCK",
  );

  return blockOnly;
}

function formatViolationReport(violations) {
  const lines = violations.map(formatViolationLine);
  const report = lines.join("\n");
  return report;
}

function formatViolationLine(violation) {
  const location = violation.line
    ? `${violation.file}:${violation.line}`
    : violation.file;

  const line = `  [${violation.tier}] ${violation.rule} · ${location}\n    ${violation.snippet}\n    Fix: ${violation.fix}`;
  return line;
}

export const GateChecker = { checkResult, formatViolationReport };
