# Vertical Slice Architecture

> Inherits Security, Reliability, Narrative from code-style.md.

## Backend Pipeline

```
Endpoint/Handler → UseCase → Validator → Domain → Repository → Presenter → Response DTO
```

- **Endpoint/Handler**: HTTP entry. Calls UseCase. No business logic.
- **UseCase**: Orchestrates flow: Validator → Domain → Repository.
- **Validator**: Input structure validation. Runs BEFORE Domain.
- **Domain**: Business rules. No infrastructure dependencies.
- **Repository**: Persistence only. No business logic.
- **Presenter**: Maps entity → Response DTO. Filters sensitive data.
- **Response DTO**: External contract. No logic.

## Frontend Pipeline

```
UI → ApiClient → Mapper
```

- **ApiClient**: HTTP calls, headers, base URL. No business logic.
- **Mapper**: Maps API response → UI model (DTO). Isolates UI from API changes.
- **UI**: Receives mapped data only. Never accesses ApiClient directly.

## Directory Structure

Organize by feature (domain), not by technical layer:

```
/features/{feature-name}/
  {feature}.handler.ts       ← HTTP entry
  {feature}.usecase.ts       ← orchestrator
  {feature}.validator.ts     ← input validation
  {feature}.domain.ts        ← business rules
  {feature}.repository.ts    ← persistence
  {feature}.presenter.ts     ← output mapping
  {feature}.dto.ts           ← contracts
```

## Domain Layer

Two valid styles — choose by complexity:

**Style A — Rich Entity**: Class with invariants. Preferred when entity enforces own state transitions.
**Style B — Pure Functions**: Types + functions in same file. Preferred for simpler domains or functional stacks.

Both styles: zero infrastructure dependencies, fully testable without DB/HTTP mocks.

**Type ownership**:

- Domain entity (`Order`) → `order.domain.ts` (internal, all fields)
- Response DTO (`OrderResponse`) → `order.dto.ts` via Presenter (external contract)
- Input DTO (`CreateOrderRequest`) → `order.dto.ts` or `order.validator.ts`

Presenter maps entity → Response DTO. Sensitive/internal fields never reach client.

## Layer Rules

- **Isolation**: Each layer = single responsibility. No mixing.
- **Data Shielding**: Raw DB entities NEVER returned to client. Presenter is mandatory filter.
- **Validate Before Domain**: Reject invalid input at Validator (Fail Fast).
- **Statelessness**: Horizontally scalable, resilient to retries.
- **Dependency Inversion**: Interfaces/abstractions for testable seams.

## DO / DO NOT

**DO**: Validate before Domain · Business rules only in Domain · Output through Presenter · Organize by feature slice.

**DO NOT**: Business logic in Handler · Access Repository from Handler/Domain · Skip Validator · Return DB entities to client.

> DO NOT rules ALWAYS override DO rules.
