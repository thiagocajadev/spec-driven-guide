import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fileSystem from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { InstructionAssembler } from "./instruction-assembler.mjs";

const ASSETS = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../assets",
);

const WORST_CASE_FLAVOR = "vertical-slice";
const PHASE_CODE_FILES = [
  path.join(ASSETS, "instructions", "templates", "workflow.md"),
  path.join(ASSETS, "skills", "code-style.md"),
  path.join(
    ASSETS,
    "instructions",
    "flavors",
    WORST_CASE_FLAVOR,
    "principles.md",
  ),
];

/**
 * why: every Phase CODE starts with the same four files in the agent's
 * context, the router, `workflow.md`, `code-style.md` and the flavor's
 * principles, before a single domain skill or line of the project is read.
 * The router already has its own byte budget; this one measures the whole
 * default load, so the kit growing by a paragraph per release shows up as a
 * number someone has to raise on purpose, with a reason, here.
 *
 * Measured at 32762 bytes in v11.1.0, the largest flavor included. The cycle
 * that set it moved about 2600 bytes into the load: the Work Checklist
 * recitation left, and the Guardrails "Enforced by" column, the unattended-run
 * contract, the fresh-context review gate and waves for broad requests came
 * in. The last of them arrived after this test, which caught it at 687 bytes
 * over the first ceiling; the developer kept the feature and the ceiling rose.
 */
const PHASE_CODE_BUDGET_BYTES = 32800;

describe("Phase CODE context budget", () => {
  it(`loads at most ${PHASE_CODE_BUDGET_BYTES} bytes by default`, () => {
    const routerText = InstructionAssembler.buildMasterInstructions({
      flavor: WORST_CASE_FLAVOR,
    });

    const fileBytes = PHASE_CODE_FILES.map(
      (filePath) => fileSystem.statSync(filePath).size,
    );

    const expectedMaxBytes = PHASE_CODE_BUDGET_BYTES;
    const actualBytes =
      Buffer.byteLength(routerText, "utf8") +
      fileBytes.reduce((total, size) => total + size, 0);

    const isWithinBudget = actualBytes <= expectedMaxBytes;
    const budgetMessage = `Phase CODE loads ${actualBytes} bytes (budget: ${expectedMaxBytes}).`;

    assert.ok(isWithinBudget, budgetMessage);
  });
});
