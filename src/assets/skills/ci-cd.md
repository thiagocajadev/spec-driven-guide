# CI/CD & Automation Principles

<ruleset name="CI/CD Standards">

> Load in Phase CODE when touching pipeline YAML, deployment config, or release tooling.

## Pipeline Architecture

Every push to a shared branch passes automated quality gates. No exceptions.

**Stages**: `Lint → Security → Test → Build → Deploy (Staging) → Smoke → Deploy (Prod)`

1. **Lint & Format**: zero warnings policy
2. **Security**: secrets scan, SAST, SCA (see `.ai/skills/security.md` Part 2)
3. **Unit & Integration Tests**: fail pipeline on any failure; no skipped tests in CI
4. **Build**: versioned, immutable artifact (Docker image, binary, or bundle)
5. **Deploy Staging**: automatic
6. **Smoke Tests**: critical-path E2E against staging; verify RED metrics before promotion
7. **Deploy Prod**: manual approval gate or automated canary

## Local Pre-commit Gates

CI catches problems late. Pre-commit hooks catch them immediately.

- **husky** to version hooks; **lint-staged** for staged-files-only checks (under 5s)
- Pre-commit minimum: lint + auto-fix; block commit if lint fails after fix

```bash
npm install --save-dev husky lint-staged && npx husky init
```

`.husky/pre-commit`: `npx lint-staged`

```json
"lint-staged": {
  "packages/cli/**/*.mjs": "eslint --fix",
  "packages/app/**/*.{ts,tsx,js}": "eslint --fix",
  "**/*.{json,md}": "prettier --write"
}
```

## Branch Protection

- ≥1 approval before merge (2 for security-sensitive); all CI checks must pass
- Prefer squash/rebase for linear history; never bypass CI with `--no-verify`

## Security Tool Matrix

| Category  | Node.js/TS      | Python            | .NET                     | Go                 | Java             | Rust                |
| --------- | --------------- | ----------------- | ------------------------ | ------------------ | ---------------- | ------------------- |
| Secrets   | Gitleaks        | Gitleaks          | Gitleaks                 | Gitleaks           | Gitleaks         | Gitleaks            |
| SAST      | Semgrep, CodeQL | Bandit, Semgrep   | Roslyn Analyzers         | gosec, govulncheck | SpotBugs, CodeQL | cargo-audit, clippy |
| SCA       | npm audit, Snyk | pip-audit, Safety | dotnet list --vulnerable | govulncheck        | OWASP Dep-Check  | cargo-deny          |
| Container | Trivy           | Trivy             | Trivy                    | Trivy              | Trivy            | Trivy               |

**Thresholds**: Secrets = zero tolerance. SAST = block HIGH/CRITICAL. SCA = block known exploited CVEs.

## Immutable Deployments

- Tag every build with SHA or semver; same artifact staging → prod (never rebuild)
- Blue/Green or Canary; rolling restarts for stateless services
- Rollback path documented and executable in <5 min
- Staging must mirror prod (same OS, runtime, config shape)

## Delivery Strategy (Trunk-Based)

- **TBD**: short-lived branches from `main`, merged frequently; long-lived branches banned.
- **CI**: small PR + review + green checks before merge.
- **CD**: `main` deploys automatically; no env-gated merges.
- **Deploy ≠ Release**: code may ship disabled; activation is separate.
- **Feature Flags**: new functionality off by default; progressive rollout after validation.
- **Post-deploy validation**: dev/QA validate after deploy, not pre-merge.

## Release Strategy

- **Commits + SemVer**: canonical in `code-style.md` StaffGradeVCS.
- **Versioning**: MAJOR.MINOR.PATCH; CI publishes on tags.
- **Risk control**: feature flags, not long-lived branches.

</ruleset>
