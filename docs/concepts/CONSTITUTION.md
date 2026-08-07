# The SDG Constitution: 8 Engineering Laws

This document defines the philosophical and technical foundation of `sdg-agents`.

## How the Model Works

The developer sets direction and approves decisions. The agent handles execution: reading the codebase, proposing a structured plan, writing the code, and running the tests. The agent stops at SPEC and PLAN for explicit approval before proceeding.

This document is the mental model for developers. The operational rules the agent follows live in [`.ai/skills/code-style.md`](../../src/assets/skills/code-style.md) (`WorkChecklist`: Intent + Form sections) and [`.ai/instructions/templates/workflow.md`](../../src/assets/instructions/templates/workflow.md) (5-phase cycle protocol).

---

## 1. Protocol (The Sovereign Gate)

**Project-specific rules override general AI training.**

Before any code is written, the agent recites the `WorkChecklist`: the **Intent** section (Mental Reset, Target Files, Naming, Narrative, Comments, Tests planned, Security, Blockers) names the training default being suspended and confirms targets, while the **Form** section primes the agent on what the result must look like (Pure entry point, Explaining Returns, Vertical Density, Boolean prefix, etc.). Training bias is purged at every phase transition (SPEC → PLAN → CODE → TEST → END).

## 2. Hardening (Security Execution)

**Security is not a layer; it is the foundation.**

Configuration isolation is mandatory. Environment templates (`.env.example`) are prohibited, since they leak information. All required configuration is declared as a "Configuration Contract" during the SPEC phase, with abstract key names only.

## 3. Resilience (Fault Tolerance)

**Software must withstand repetition and failure.**

Every operation with side-effects must be idempotent. Design for graceful degradation, because system stability cannot depend on external dependencies being available.

## 4. Narrative (Code as a Story)

**Read the code like a story. High-level intent at the top, implementation details below.**

Follow the Stepdown Rule: entry points at the top, callers above callees. Expressive naming is primary documentation. If a comment is needed to explain _what_ the code does, the name is wrong. The Writing Soul (no filler, no AI-isms, no post-hoc summaries) is the same rule applied to human text.

## 5. Visual Excellence (Consistency)

**Aesthetics are a signal of quality.**

Semantic design tokens and high-contrast typography are not optional. Visual consistency and attention to micro-interactions are part of the definition of done for interface work.

## 6. Boundaries (Scope Integrity)

**Protect the state through atomic focus.**

Changes are limited to files and functions defined in the current task. The Circuit Breaker rule applies: the agent stops and reports if it hits the same error 3 times, makes no progress in 3 turns, or encounters a non-bypassable access barrier.

## 7. Reflection (Systematic Reasoning)

**Reason first, act later.**

The agent evaluates architecture before proposing anything. Every line of code must serve a deliberate purpose that traces back to the approved SPEC.

## 8. Contextual Efficiency (Token Discipline)

**Maximize signal, minimize context rot.**

Every turn has a cost. Prefer programmatic research (grep, scripts) over raw reads. Truncate long outputs using a 60/40 head/tail split. Reset context proactively when historical data becomes irrelevant to the current sprint. The most efficient agent is the one that solves the task with the smallest, most relevant context window.
