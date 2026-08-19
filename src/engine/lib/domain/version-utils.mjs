/**
 * Version Utils: Logic for checking updates on npm registry.
 */

const REGISTRY_URL = "https://registry.npmjs.org/spec-driven-guide/latest";
const CHECK_TIMEOUT_MS = 2000;

/**
 * Fetches the latest version from npm registry.
 * Returns null if fetch fails or times out.
 */
async function getLatestVersion() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(REGISTRY_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const failureResult = null;
      return failureResult;
    }

    const registryPayload = await response.json();
    const latestVersion = registryPayload.version || null;
    return latestVersion;
  } catch {
    clearTimeout(timeoutId);

    const errorResult = null;
    return errorResult;
  }
}

/**
 * Compares two semver strings (x.y.z).
 * Returns true if latest > current.
 */
function isNewer(current, latest) {
  if (!current || !latest) {
    const isMissingVersion = false;
    return isMissingVersion;
  }

  if (current === latest) {
    const isSameVersion = false;
    return isSameVersion;
  }

  const currentParts = current.split(".").map(Number);

  const latestParts = latest.split(".").map(Number);

  for (let index = 0; index < 3; index++) {
    const currentPart = currentParts[index] || 0;
    const latestPart = latestParts[index] || 0;

    if (latestPart > currentPart) {
      const isGreater = true;
      return isGreater;
    }

    if (latestPart < currentPart) {
      const isLesser = false;
      return isLesser;
    }
  }

  const isEqual = false;
  return isEqual;
}

/**
 * High-level update check.
 * Returns { hasUpdate: boolean, latest: string | null }
 */
async function checkForUpdates(currentVersion) {
  const latest = await getLatestVersion();
  const hasUpdate = isNewer(currentVersion, latest);

  const result = {
    hasUpdate,
    latest,
  };

  return result;
}

export const VersionUtils = {
  checkForUpdates,
};
