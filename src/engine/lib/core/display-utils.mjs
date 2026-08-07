/**
 * Returns a human-readable display name for a given flavor key.
 * Single source of truth, imported by all bin scripts.
 */
function displayName(flavorKey) {
  const PRESET_DISPLAY_NAMES = {
    none: "(none)",
    lite: "Lite",
    "vertical-slice": "Vertical Slice",
    mvc: "MVC",
    legacy: "Legacy Pipeline",
  };

  const key = flavorKey || "none";
  const resolvedName = PRESET_DISPLAY_NAMES[key] ?? key;

  const displayNameResult = resolvedName;
  return displayNameResult;
}

/**
 * Implements the 60/40 Head/Tail split for long outputs.
 */
function smartTruncate(content, headLimit = 100, tailLimit = 50) {
  if (!content) {
    const emptyOutput = "";
    return emptyOutput;
  }

  const lines = content.split("\n");
  const threshold = headLimit + tailLimit + 10; // Buffer to avoid truncating small overlaps

  if (lines.length <= threshold) {
    return content;
  }

  const head = lines.slice(0, headLimit).join("\n");

  const tail = lines.slice(-tailLimit).join("\n");

  const skippedCount = lines.length - headLimit - tailLimit;

  const truncationMessage = `\n... [TRUNCATED ${skippedCount} LINES] ...\n`;

  const truncatedOutput = `${head}${truncationMessage}${tail}`;
  return truncatedOutput;
}

/**
 * Generates a Reference Snapshot for a large file.
 * Used in Impact Maps to prevent context bloat.
 */
function createReference(targetFile, contextSummary) {
  const timestamp = new Date().toISOString().split("T")[0];

  const reference = [
    `REF: ${targetFile}`,
    `STATUS: Contextual Snapshot (${timestamp})`,
    `REASON: ${contextSummary}`,
    `ACTION: Use 'view_file' or 'grep' to access full content if needed.`,
  ].join("\n");

  return reference;
}

export const DisplayUtils = {
  displayName,
  smartTruncate,
  createReference,
};
