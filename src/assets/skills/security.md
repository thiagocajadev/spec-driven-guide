# Security: AppSec Tactics & DevSecOps Pipeline

<ruleset name="Security">

> Load in **Phase CODE** for security-sensitive code, **Phase TEST / CI** for pipeline gates.

## Baseline

This skill tracks **OWASP Top 10:2025**, the eighth installment. The edition is named rather than left implicit, so the day it stops being current the gap is visible instead of silent. The `audit:` cycle carries the check, and it reads `owasp.org/Top10/2025/` rather than any summary of it.

| Category (2025)                                     | Where it lives here                                                                                     |
| :-------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| A01 Broken Access Control (SSRF rolled in for 2025) | Identity & Access Integrity                                                                             |
| A02 Security Misconfiguration                       | Phase 2 Policy as Code, plus IAM in `cloud.md`                                                          |
| A03 Software Supply Chain Failures (new in 2025)    | Phase 3, Dependency & Supply Chain                                                                      |
| A04 Cryptographic Failures                          | Cryptographic Discipline                                                                                |
| A05 Injection                                       | Injection Prevention, Input Sanitization                                                                |
| A06 Insecure Design                                 | Phase 0, Threat Modeling                                                                                |
| A07 Authentication Failures                         | Authentication Strength                                                                                 |
| A08 Software or Data Integrity Failures             | Phase 3 Provenance, No Unsafe APIs                                                                      |
| A09 Security Logging and Alerting Failures          | Phase 5, plus `observability.md`                                                                        |
| A10 Mishandling of Exceptional Conditions (new)     | The FAIL CLOSED policy below, plus Explicit return, Fail fast and Centralized errors in `code-style.md` |

A10 is the category most easily mistaken for a style concern. It covers improper error handling, logical errors and systems that fail open. The rules answering it already exist here as engineering discipline, and this row is what makes them count as a control.

---

## Part 1: Tactical AppSec (Secure Coding)

### Rule: The Law of Hardening (AppSec Implementation), the SSOT

<rule name="OperationalAppSec">

> **Defense in Depth.** Every layer validates its own assumptions.
> Canonical for **Data Shielding** (PII), **Abstract Env Naming** and **No Config Templates**. Other skills cite these by the exact names below, so a search from the pointer lands on the bullet.

- **Input Sanitization**: Sanitize all external inputs (body, query, headers) via trusted libs (Zod, Joi, Pydantic). Reject early.
- **Injection Prevention**: 100% parameterized SQL. Escape HTML outputs (XSS). No raw string concat for shell/DB.
- **Data Shielding (PII)**: Mask sensitive fields in logs/responses. Never log secrets/PII (allowlist-based redaction). Never return full emails/IDs/phones except authorized admin scopes.
- **No Config Templates**: Never commit `.env.example` or `.env.*`, which discloses infra metadata. Setup guide belongs in SPEC.
- **Abstract Env Naming**: Domain-abstract keys (`PAYMENT_SECRET` not `STRIPE_SK`). Runtime validation at boot (fail-fast).
- **No Unsafe APIs**: Prohibit `eval()`, `dangerouslySetInnerHTML`, insecure deserialization.
- **Cryptographic Discipline**: Passwords go through a dedicated password hash (Argon2id, scrypt, bcrypt) with per-user salt, never a general-purpose digest and never a homegrown scheme. Sensitive data is encrypted at rest under a managed key. Keys carry a declared rotation schedule and a rehearsed rotation path, since a key that cannot be rotated is a key that never will be. TLS in transit on every hop, including the ones inside the perimeter.
  </rule>

### Rule: Identity & Access Integrity

<rule name="IdentityIntegrity">

- **Deny-by-Default**: No route/field is public unless documented
- **Least Privilege**: API tokens/roles → minimum permissions needed
- **RBAC**: Check permissions at boundary (Controller/UseCase), not in business logic
- **Authentication Strength**: MFA available on any account that can move money, change permissions, or reset credentials. Sessions carry an absolute expiry alongside the idle one. Rate limiting and lockout apply to the authentication route itself, which is the one endpoint that has to stay public and therefore the one credential stuffing aims at.
  </rule>

---

## Part 2: DevSecOps Pipeline (Staff Lifecycle)

> **FAIL CLOSED POLICY**: Any security gate failure MUST block artifact promotion.

**Mandatory Principles**: Secure by Default (Deny-All) | Least Privilege | Zero Trust | Everything Auditable

---

### Phase 0: Threat Modeling (Pre-Execution)

<rule name="ThreatModeling">

Mandatory for Critical features (Auth, Payment, Data Shielding):

1. **Map** attack surfaces and data flows
2. **Classify** via STRIDE
3. **Output** versioned threat model + mitigation checklist per endpoint

Fail Closed if: critical feature without documented threat model.
</rule>

### Phase 1: Pre-Commit (Local Shielding)

<rule name="PreCommitShielding">

- **Secret Scanning**: Detect hardcoded tokens/keys (Gitleaks)
- **Security Lint**: No `eval`, no `innerHTML`
- **Sensitive File Block**: Block `.env`, `.pem`, `.key` files from commit (lefthook or husky pre-commit hook)
- **Typosquatting Detection**: Verify package origins/names

Fail Closed if: any secret detected or insecure API usage found.
</rule>

### Phase 2, CI: SAST + Policy as Code

<rule name="SastPolicyEnforcement">

**SAST**: SQL Injection, XSS, SSRF, Command Injection, insecure deserialization.

**Policy as Code**: CORS must NOT be `*` | JWT short expiration | no unsafe functions | custom domain rules.

Fail Closed if: vulnerability **HIGH+** or policy violation.
</rule>

### Phase 3: Dependency & Supply Chain Security

<rule name="SupplyChainSecurity">

- **SCA**: Detect CVEs, abandoned libs, license compliance
- **SBOM**: Mandatory generation attached to artifacts
- **Provenance**: Verify package origins (Sigstore/Cosign)
- **Reproducible Builds**: Guarantee integrity and isolation

Fail Closed if: untrusted signature or critical CVE.
</rule>

### Phase 4: Runtime Testing (DAST & Fuzzing)

<rule name="RuntimeSecurity">

> Apply Testing skill rules (TestDoubles, AAA structure) to all security tests.

- **Functional**: AuthN/AuthZ enforcement, rate limiting, security headers (CSP, HSTS, X-Frame-Options)
- **DAST & Fuzzing**: Dynamic scan on running app, random input fuzzing, exploit simulation in sandbox
- **Business Logic**: Protect against flow abuse and race conditions (double spend)
  </rule>

### Phase 5: Result & Incident Response

<rule name="ObservabilityIR">

**Logging**: Log logins, logouts, auth failures, sensitive actions. NEVER log secrets/PII.

**Incident Response**:

- Data Breach → revoke ALL tokens/keys, notify per compliance
- Intrusion → isolate, preserve forensic evidence
- RCA compulsory for all incidents (timeline, impact, prevention)

**DR**: Encrypted air-gapped backups, defined RTO/RPO, quarterly recovery tests.
</rule>

---

## Part 3: Incident Correction Strategy

### Rule: Fix-Forward Preference

`main` always represents the latest working state. Correction flows forward, not back.

- **Flag-based safety**: disable feature via flag: default containment, no code rollback.
- **Fix Forward**: correct via new PR on `main`. Rollback is not default.
- **Rollback = exception**: only if system unavailable OR fix-forward beats SLO.
- **Main consistency**: never leave `main` broken; hotfix PR lands before next merge.
- **Explicit dependencies**: flags/contracts isolate blast radius between features.

**Escalation**: Detect → Triage (P0-P3) → Respond → Resolve (prefer fix-forward) → Review (48h RCA).

</ruleset>

> **Staff Goal**: Feature is "Done" only when all phases pass with zero HIGH+ warnings.
