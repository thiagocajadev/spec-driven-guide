# Architecture Flavor: LITE

> Inherits Security, Reliability, Narrative from code-style.md.
> For small-scale projects and experimental scripts where layered complexity is a liability.

## Core Principles

1. **Direct Implementation**: Logic at point of interaction (main file or route handler).
2. **Flat Hierarchy**: Minimize file hopping. Related logic together in single file when possible.
3. **No Boilerplate**: Only write what is executed. No future-proofing (YAGNI).

> SRP is inherited from `code-style.md` **Small functions** (one responsibility, one level of abstraction). It applies in every flavor, not duplicated here.

## Implementation Standard

Even in a single file:

- **Narrative**: Read the code like a story. High-level intent at the top, implementation details below. Entry point first, callers above callees. Each function orchestrates OR implements, never both.
- **Explaining Returns**: Assign results to named variable (`const userFound = ...`) before returning.
- **Resilience**: Prefer Result Pattern for business logic / complex failure paths. Don't force it for trivial logic where idiomatic error handling is clearer.

> **Upgrade trigger**: File > 300 lines or logic reused across multiple files → refactor to Vertical Slice.
