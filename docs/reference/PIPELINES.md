# Architectural Pipelines

Each flavor defines the data and execution path the agent uses when reading or writing code. Selecting a flavor tells the agent where logic belongs, with no ambiguity about whether something is a UseCase, a Service, or a Controller.

## Flavors

### ⚡ Vertical Slice

Groups code by feature rather than layer. Each feature is an independent vertical with its own endpoint, use case, and data access.

`Request` → `Endpoint` → `UseCase` → `Domain` → `Repository` → `Response`

Use when: monorepos, domain-heavy APIs, or any project where features evolve independently.

---

### 🏗️ MVC

Classic layered architecture with clear separation between Controller, Service, and Domain.

`Request` → `Controller` → `Service` → `Domain` → `Repository` → `Response`

Use when: standard REST services where the layered boundary is the primary organizational unit.

---

### 🕰️ Legacy

A bridging pattern for migrating existing codebases without full rewrites. New logic wraps the old through a service layer, keeping regressions contained.

`UI (Shell)` → `Service` → `Repository` → `UI (Response DTO)`

Use when: refactoring old codebases incrementally, keeping the existing entry points intact.

---

### 🪶 Lite

No layers, no abstractions. Logic lives directly at the point of interaction, in a single file or flat module. Engineering rules still apply; structural ceremony does not.

`Input` → `Handler` → `Output`

Use when: CLIs, scripts, utilities, or small tools where adding layers would be overhead with no benefit.

---

## Frontend Reference Patterns

These are not CLI flavor options. They describe data flow within the UI layer, used as reference by the agent when working on frontend code inside any project, regardless of the top-level flavor.

### 🌐 Client-Side Flow

Standard data path for modern SPAs and client applications.

`Request` → `UI (Action)` → `ApiClient` → `Mapper` → `UI (Response)`

### 🎨 UI Component Flow

Data path for building reusable UI components with local state.

`UI` → `ViewModel` → `State` → `Effects`

---

> [!NOTE]
> Select your flavor during `npx sdg-agents` initialization or with the `--flavor` flag. You can see all options in the [Quick Reference](CHEATSHEET.md).
