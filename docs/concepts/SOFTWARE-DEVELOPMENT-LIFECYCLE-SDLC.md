# Software Development Life Cycle: SDLC (8-Phase Core Trail)

This document defines the technical standards for the project lifecycle. It establishes the baseline for developer onboarding and architectural alignment through 8 cumulative phases.

> [!IMPORTANT]
> **Documentation Governance**: Update **README**, **CHANGELOG**, and **ROADMAP** at the end of every phase. Documentation must remain synchronized with the implementation to prevent knowledge debt.

## Pipeline Summary

```
| 01 Foundation        → Project boots and lints cleanly
| 02 Observability     → Internal state is transparent
| 03 CI/CD             → Code quality gates are enforced
| 04 Access Control    → Identity and permissions are established
| 05 Design System     → UI is consistent and reusable
| 06 Features          → Domain logic is isolated
| 07 Production Ready  → Deployment readiness verified
| 08 Ops Governance    → System health is monitored
```

Not every project requires all 8 phases. A CLI tool implements focused subsets (e.g., 01, 03, 06), while a SaaS product requires the full trail.

> [!IMPORTANT]
> **Lifecycle Protocol**: No phase is complete until the implementation is synchronized with the project metadata.

---

## How to read this guide

The pipeline follows a **strict cumulative logic**. Each phase establishes the security and stability required for subsequent steps. Select the appropriate scope for the project stack while maintaining the 01-08 sequence.

---

## 01: Foundation

Set up the project so that every contributor starts from the same baseline.

1. Initialize git with a **Hardened .gitignore**. Block environment noise (`.DS_Store`, `local.*`) and tool-specific artifacts.
2. Enforce **Secret Isolation**. Explicitly block `.env*` and credential files. Never commit secrets to the repository history.
3. Create the **Documentation Baseline**. Initialize `README.md`, `CHANGELOG.md`, and `ROADMAP.md`.
4. Create `.editorconfig` to enforce indentation and encoding standards.
5. Configure a linter (e.g., ESLint) aligned with the project scope.
6. Create a HelloWorld entry point to validate the execution stack.
7. Install core dependencies. Avoid speculative package installation.
8. Configure environment variables via `.env` with startup validation.
9. Structure the entry point as a table of contents. Keep implementation details in secondary modules.

**Criteria**: The project boots, lints, and allows a contributor to run the suite in under 5 minutes.

---

## 02: Observability & Security

Make the project observable and defensible before writing business logic.

1. Validate all external inputs at the boundary (request body, query params, headers). Reject invalid data early.
2. Add a `/health` endpoint that returns the application status and dependency connectivity.
3. Set up structured logging (JSON format). Include request ID, timestamp, and severity. Never log secrets or PII.
4. If applicable, add distributed tracing (OpenTelemetry or equivalent) so requests can be followed across services.
5. Define your testing strategy: what gets unit tests, what gets integration tests, what gets E2E.

**Done when:** you can answer "is the app healthy?" and "what happened to request X?" without reading code.

---

## 03: CI/CD Pipeline

Automate quality gates so that broken code never reaches production.

1. Define your environments: local, staging, production. Document the differences.
2. Centralize secrets management (vault, CI secrets, cloud KMS). No secrets in code or git history.
3. Set up CI: on every pull request, run linter + tests + build. Block merge on failure.
4. Set up CD: define how code gets to staging and production. Prefer automated deploys with manual approval for production.
5. Validate the full pipeline end-to-end: push a change and watch it flow through all stages.

**Done when:** a PR cannot be merged without passing all quality gates, and deploying to staging is a single action.

---

## 04: Access Control (if applicable)

Implement identity and permissions before building features that depend on them.

1. Choose your identity strategy based on your users: OAuth for B2B, magic links for low-friction, passkeys for security-critical.
2. Define roles and permissions. Start simple (admin/user) and expand as needed. Use deny-by-default.
3. Secure tokens: HttpOnly cookies for web, short-lived JWTs with refresh rotation. Protect against XSS and CSRF.
4. Implement session control: concurrent session limits, remote revocation, idle timeout.
5. Build user CRUD as your reference implementation, the first feature that exercises the full pipeline.

**Done when:** you can create a user, log in, access a protected route, and get rejected from an unauthorized one.

---

## 05: Design System & UI/UX (if applicable)

Establish visual consistency before building screens.

1. Define design tokens: colors, spacing (4/8px system), typography scale, border radius, shadows.
2. Build a theme matrix: light and dark. Use CSS variables or a utility-first system.
3. Establish a visual baseline: consistent spacing, WCAG-compliant contrast, and typography hierarchy.
4. Add micro-interactions: loading states, hover feedback, transitions. The interface should feel responsive.
5. Scaffold reusable components (Button, Input, Card, Modal) so feature development doesn't reinvent them.

**Done when:** a new screen can be built using existing tokens and components without ad-hoc styling.

---

## 06: Feature Evolution

Build features with clear domain boundaries and safe delivery.

1. Model the domain first: identify entities, value objects, and aggregates. Name things in business language, not technical jargon.
2. Implement use cases as orchestrators: they call validators, domain logic, and repositories. They don't contain implementation details.
3. Use feature flags for anything risky or incomplete. Ship to production behind a flag, validate, then enable.
4. Practice defensive development: validate assumptions, handle edge cases at the boundary, and follow **The Law of Resilience** (Result Pattern).
5. Refactor continuously: if a module grows beyond its responsibility, split it. Don't wait for a "refactoring sprint."

**Done when:** each feature is isolated, testable, and can be toggled or rolled back independently.

---

## 07: Production Readiness

Verify everything before going live.

1. Run through a pre-deploy checklist: environment variables set, secrets rotated, dependencies up to date, no debug flags.
2. Prepare database changes: migrations tested, rollback plan documented, data integrity validated.
3. Run smoke tests against the staging environment: happy path, error paths, edge cases.
4. Deploy to production with a defined strategy (blue/green, canary, or rolling). Never deploy on a Friday without a rollback plan.

**Done when:** production is live, monitored, and you have a documented way to roll back in under 5 minutes.

---

## 08: Operational Governance

Keep the system healthy after launch.

1. Monitor real-time metrics for the first 24-48 hours after deploy: error rates, latency, resource usage.
2. Have an incident protocol: who gets paged, how to triage, where to communicate (war room or channel).
3. For critical issues: fix forward if small, rollback if large. Document the decision.
4. Execute **Documentation Synchronization**. Update `CHANGELOG.md` with version results and evolve the `ROADMAP.md` based on new insights.
5. Run retrospectives after incidents: what happened, why, what changes prevent recurrence. Update the pipeline.

**Done when:** the team can respond to a production issue without panic, and every incident leaves the system stronger.

---
