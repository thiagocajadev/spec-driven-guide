import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NARRATIVE_CHECKLIST, parseWorkChecklist } from "./governance.mjs";

const EXPECT_PASS = true;
const EXPECT_FAIL = false;

function findRule(label) {
  const rule = NARRATIVE_CHECKLIST.find((item) => item.label === label);
  return rule;
}

describe("governance.NARRATIVE_CHECKLIST", () => {
  it("parses all 8 Form items from WorkChecklist in code-style.md", () => {
    const expectedChecklistSize = 8;
    const actualChecklistSize = NARRATIVE_CHECKLIST.length;

    const failureMessage = "parser regex must capture every Form item";

    assert.equal(actualChecklistSize, expectedChecklistSize, failureMessage);
  });

  it("maps every label to a strategy or explicit placeholder (no orphan rules)", () => {
    const orphanRules = NARRATIVE_CHECKLIST.filter(
      (rule) => rule.heuristic === null,
    );

    const orphanLabels = orphanRules.map((rule) => rule.label);
    const orphanCount = orphanRules.length;
    const expectedOrphanCount = 0;
    const failureMessage = `every checklist label must have a strategy mapping (Bug Y/Z regression). Orphans: ${orphanLabels.join(", ")}`;

    assert.equal(orphanCount, expectedOrphanCount, failureMessage);
  });

  it("exposes Pure entry point, Explaining Returns, and Boolean prefix as enforced rules", () => {
    const ruleLabels = NARRATIVE_CHECKLIST.map((rule) => rule.label);
    const requiredRules = [
      "Pure entry point",
      "Explaining Returns",
      "Boolean prefix",
    ];

    for (const expectedLabel of requiredRules) {
      const isPresent = ruleLabels.includes(expectedLabel);
      const failureMessage = `checklist must expose label "${expectedLabel}"`;

      assert.ok(isPresent, failureMessage);
    }
  });
});

describe("governance.parseWorkChecklist", () => {
  it("refuses a code-style without the WorkChecklist rule", () => {
    const parseMissingRule = () => parseWorkChecklist("# Code Style\n");

    const expectedError = /no <rule name="WorkChecklist">/;

    assert.throws(parseMissingRule, expectedError);
  });

  it("refuses a WorkChecklist rule without a Form section", () => {
    const content = '<rule name="WorkChecklist">\n\n## Work Checklist\n</rule>';
    const parseMissingForm = () => parseWorkChecklist(content);

    const expectedError = /no ### Form section/;

    assert.throws(parseMissingForm, expectedError);
  });

  it("refuses a Form section that lists no items", () => {
    const content = '<rule name="WorkChecklist">\n### Form\n\nprose\n</rule>';
    const parseEmptyForm = () => parseWorkChecklist(content);

    const expectedError = /lists no items/;

    assert.throws(parseEmptyForm, expectedError);
  });
});

describe("governance.validateNamingDiscipline (No framework abbreviations)", () => {
  const rule = findRule("No framework abbreviations");

  it("flags banned abbreviations as function parameters", () => {
    const source = "function handler(req, res) { const context = {}; }";

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReqPattern = /req/;
    const expectedResPattern = /res/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReqPattern);
    assert.match(actualReason, expectedResPattern);
  });

  it("flags the full 12-token banned set", () => {
    const bannedTokens = [
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

    for (const token of bannedTokens) {
      const source = `function step(${token}) { return ${token}; }`;
      const actualPass = rule.heuristic(source).pass;

      const failureMessage = `must flag token "${token}"`;

      assert.equal(actualPass, EXPECT_FAIL, failureMessage);
    }
  });

  it("allows expanded names", () => {
    const source =
      "function handler(request, response) { const context = { request }; }";

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it("does not match substrings without word boundary (Promise.resolve)", () => {
    const source = "const settled = Promise.resolve(value);";
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it("does not match banned tokens inside string literals", () => {
    const source = "const message = 'please req a review on res';";
    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it("does not match banned tokens inside comments", () => {
    const source = [
      "// req is fine here",
      "const payload = request.body;",
    ].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });
});

describe("governance.validateExplainingReturns (No Logic in Return)", () => {
  const rule = findRule("Explaining Returns");

  it("classifies ternary in return", () => {
    const source = [
      "// header",
      "// header",
      "function pick(flag) {",
      '  return flag ? "yes" : "no";',
      "}",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Ternary in return/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("classifies template literal in return", () => {
    const source = [
      "// header",
      "// header",
      "function greet(user) {",
      "  return `Hello ${user.name}`;",
      "}",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Template literal in return/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("classifies arithmetic in return", () => {
    const source = [
      "// header",
      "// header",
      "function sum(a, b) {",
      "  return a + b;",
      "}",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Arithmetic in return/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("classifies constructor in return", () => {
    const source = [
      "// header",
      "// header",
      "function build(name) {",
      "  return new User(name);",
      "}",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Constructor in return/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("accepts named const before return", () => {
    const source = [
      "function sum(a, b) {",
      "  const total = a + b;",
      "  return total;",
      "}",
    ].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it("accepts void-terminator (bare side-effect call)", () => {
    const source = [
      "function log(message) {",
      "  console.log(message);",
      "}",
    ].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });
});

describe("governance.validateVerticalDensity (Vertical Density)", () => {
  const rule = findRule("Vertical Density");

  it("flags double blank lines", () => {
    const source = [
      "function first() {",
      "  return null;",
      "}",
      "",
      "",
      "function second() {",
      "  return null;",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /double blank line/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("accepts single blank between groups", () => {
    const source = [
      "function first() {",
      "  return null;",
      "}",
      "",
      "function second() {",
      "  return null;",
      "}",
      "",
    ].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it("flags blank between atomic prep and return (Explaining Return Tight)", () => {
    const source = [
      "function compute(a, b) {",
      "  const sum = 1;",
      "",
      "  return sum;",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Explaining Return pair must be tight/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("accepts tight Explaining Return pair", () => {
    const source = [
      "function compute(a, b) {",
      "  const sum = 1;",
      "  return sum;",
      "}",
      "",
    ].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it("accepts multi-atomic group with legitimate final blank", () => {
    const source = [
      "function compute(a, b, c) {",
      "  const left = 1;",
      "  const right = 2;",
      "  const merged = 3;",
      "",
      "  return merged;",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);

    const hasTightViolation = (result.reason || "").includes(
      "Explaining Return pair",
    );

    assert.equal(hasTightViolation, EXPECT_FAIL);
  });

  it("flags orphan atomic after tight pair", () => {
    const source = [
      "function shape() {",
      "  const a = 1;",
      "  const b = 2;",
      "",
      "  const c = 3;",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /orphan atomic/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("accepts tight trio of atomics", () => {
    const source = [
      "function shape() {",
      "  const a = 1;",
      "  const b = 2;",
      "  const c = 3;",
      "}",
      "",
    ].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });

  it("accepts 2+2 balanced groups", () => {
    const source = [
      "function shape() {",
      "  const a = 1;",
      "  const b = 2;",
      "",
      "  const c = 3;",
      "  const d = 4;",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);

    const hasOrphanViolation = (result.reason || "").includes("orphan atomic");

    assert.equal(hasOrphanViolation, EXPECT_FAIL);
  });

  it("does not flag orphan when trailing line is a rich step with call", () => {
    const source = [
      "function shape() {",
      "  const a = 1;",
      "  const b = 2;",
      "",
      "  const result = compute(a, b);",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);

    const hasOrphanViolation = (result.reason || "").includes("orphan atomic");

    assert.equal(hasOrphanViolation, EXPECT_FAIL);
  });

  it("flags Explaining Return Tight with call-expression prep", () => {
    const source = [
      "function pick() {",
      "  const today = computeToday();",
      "",
      "  return today;",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Explaining Return pair must be tight/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("flags Explaining Return Tight with property-access prep", () => {
    const source = [
      "function pick() {",
      "  const name = user.displayName;",
      "",
      "  return name;",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Explaining Return pair must be tight/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("flags Explaining Return Tight with await-expression prep", () => {
    const source = [
      "async function pick() {",
      "  const record = await fetchRow();",
      "",
      "  return record;",
      "}",
      "",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Explaining Return pair must be tight/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });
});

describe("governance.validateNoSectionBanners (No section banners)", () => {
  const rule = findRule("No section banners");

  it("flags dash banner", () => {
    const source = [
      "// ---------- Helpers ----------",
      "function helper() {}",
    ].join("\n");

    const result = rule.heuristic(source);
    const actualPass = result.pass;
    const actualReason = result.reason;
    const expectedReasonPattern = /Section banner detected/;

    assert.equal(actualPass, EXPECT_FAIL);
    assert.match(actualReason, expectedReasonPattern);
  });

  it("flags equals banner", () => {
    const source = ["// ======= Section =======", "function helper() {}"].join(
      "\n",
    );

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_FAIL);
  });

  it("flags hash banner (python/shell style)", () => {
    const source = ["# ===== Section =====", "def helper(): pass"].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_FAIL);
  });

  it("flags sql-style banner", () => {
    const source = ["-- ----- Section -----", "SELECT 1;"].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_FAIL);
  });

  it("accepts clean source without banners", () => {
    const source = [
      "function helper() {}",
      "",
      "function privateOne() {}",
      "",
    ].join("\n");

    const actualPass = rule.heuristic(source).pass;

    assert.equal(actualPass, EXPECT_PASS);
  });
});
