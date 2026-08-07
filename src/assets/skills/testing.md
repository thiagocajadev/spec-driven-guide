# Testing: Quality without Overengineering

<ruleset name="Testing Governance">

> Load in **Phase CODE / Phase TEST** when writing, reviewing, or refactoring tests.

## Rule: Testing Strategy (The Testing Diamond)

<rule name="TestingStrategy">

- **Unit**: Pure business logic, domain rules, validators, mappers. Fast, isolated, no I/O.
- **Integration**: Use cases, repositories, API endpoints. Hit real DB/service. Catches the bugs that matter most.
- **E2E**: Critical user flows only (login, checkout, onboarding). Golden path + 2-3 failure scenarios max.
- **Contract**: API boundaries between services. Verify producer/consumer shape agreement.
- **Security**: DAST, fuzzing, exploit simulation, part of pipeline, not optional. See [Security skill](.ai/skills/security.md).

Prioritize integration over unit for orchestration layers. Unit test domain logic exhaustively.
</rule>

## Rule: Test Naming Convention

<rule name="TestNamingConvention">

The discriminator is what the runner reports, not the language.

- **BDD frameworks** (Jest, Vitest, `node:test`, RSpec, Pytest) nest, so the name is split: the `describe` block carries the subject, the case carries behavior and outcome, in natural language. No `should` prefix, which adds no information.
- **xUnit frameworks** (JUnit, NUnit, xUnit.net, Go `testing`) report a bare method name with no surrounding block, so that one name carries all three parts: `[MethodUnderTest]_[Scenario]_[ExpectedResult]`.
- Always in English. Focus on behavior, not implementation.

```javascript
describe('ValidateCredentials', () => {
  it('returns unauthorized when password is invalid', async () => { ... })
})
```

</rule>

## Rule: Test Structure (Arrange-Act-Assert)

<rule name="TestStructure">

- **Arrange**: Set up data/dependencies via factories/builders
- **Act**: Execute ONE action
- **Assert**: Verify ONE behavior (multiple assertions OK if same logical outcome)
- **Isolation**: No execution-order or shared-state dependencies
- **No meta-comments** (`// Arrange`): use vertical scansion (blank lines) to separate phases
  </rule>

## Rule: Named Expectations

<rule name="NamedExpectations">

> **Non-Negotiable**: No magic strings/literals in assertions. Phases: arrange → act (`actual`) → assert (`expected` + `assert.*`). Named on both sides. Enforced by `local/no-inline-assert` ESLint rule.

Phases: arrange (inputs) | blank | all expected + actual + derivations (no blank between them) | blank | all asserts (no blank between them). Enforced by `local/blank-before-assertion`.

```javascript
it("removes H1 heading", () => {
  const input = "# Title\nBody";

  const expected = "Body";
  const actual = sanitize(input);

  assert.strictEqual(actual, expected);
});

it("applies 10% discount", () => {
  const order = { price: 100, discountPct: 10 };

  const expected = 90;
  const actual = applyDiscount(order);
  const actualPrice = actual.price;

  assert.strictEqual(actualPrice, expected);
});
```

- Descriptive names only (no `input1`, `input2`)
  </rule>

## Rule: What NOT to Test

<rule name="WhatNotToTest">

Do NOT test: auto-generated DB migrations | trivial DTO mapping (zero logic) | DI container registration | third-party framework internals | getters/setters/trivial constructors.
</rule>

## Rule: Test Doubles

<rule name="TestDoubles">

> **Anti-Mock Architecture**: Mocks are a tool, not a default. Overuse hides integration bugs.

- **Mock**: External services only (payment gateways, email, third-party APIs)
- **Don't Mock**: Your own DB in integration tests (use Testcontainers/Docker) | the class under test
- **Stubs over Mocks**: Prefer stubs (return fixed data) over mocks (verify calls). Test behavior, not implementation.
- **Never** `jest.mock(...)` internal modules just to make a unit test pass
  </rule>

## Rule: Flaky Test Management

<rule name="FlakyTestManagement">

- **Quarantine immediately**: Move to `@flaky` tag/skip. Don't block CI.
- **Fix or delete within 1 sprint**: Dead tests are noise.
- **Causes**: Shared state, time-dependent logic, network calls, race conditions.
- **Prevention**: Deterministic data, freeze time (`jest.useFakeTimers`), no `sleep` in assertions.
  </rule>

## Rule: Coverage as Signal

<rule name="CoverageStrategy">

- **Domain**: 90%+, bugs cost the most here
- **Orchestration**: 70-80% via integration tests
- **UI**: Component behavior tests, not snapshots
- **Never chase 100%**: Diminishing returns. Focus on critical paths + edge cases.
  </rule>

## Rule: Test Data & Environments

<rule name="TestDataEnvironments">

- Realistic test data (not `"test"` / `"foo"` in domain tests)
- Isolated environments: dev/stage/prod never share state
- Never use production data, anonymized/synthetic only
- Config via `.env.{environment}`; never hardcode environment assumptions
  </rule>

## Rule: Legacy Approach

<rule name="LegacyApproach">

- **Characterization Tests first**: Lock current behavior before refactoring
- **Identify Seams**: Extract interfaces to isolate legacy components
- **Strangler Fig**: Wrap legacy, test wrapper, gradually replace internals
  </rule>

</ruleset>
