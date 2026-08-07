# Security: AppSec Tactics & DevSecOps Pipeline

<ruleset name="Security">

> Load in **Phase CODE** for security-sensitive code, **Phase TEST / CI** for pipeline gates.

---

## Part 1: Tactical AppSec (Secure Coding)

### Rule: The Law of Hardening (AppSec Implementation), the SSOT

<rule name="OperationalAppSec">

> **Defense in Depth.** Every layer validates its own assumptions.
> Canonical for: **DataShielding** (PII), **AbstractEnvNaming**, **NoConfigTemplates**. Other skills reference here.

- **Input Sanitization**: Sanitize all external inputs (body, query, headers) via trusted libs (Zod, Joi, Pydantic). Reject early.
- **Injection Prevention**: 100% parameterized SQL. Escape HTML outputs (XSS). No raw string concat for shell/DB.
- **Data Shielding (PII)**: Mask sensitive fields in logs/responses. Never log secrets/PII (allowlist-based redaction). Never return full emails/IDs/phones except authorized admin scopes.
- **No Config Templates**: Never commit `.env.example` or `.env.*`, which discloses infra metadata. Setup guide belongs in SPEC.
- **Abstract Env Naming**: Domain-abstract keys (`PAYMENT_SECRET` not `STRIPE_SK`). Runtime validation at boot (fail-fast).
- **No Unsafe APIs**: Prohibit `eval()`, `dangerouslySetInnerHTML`, insecure deserialization.
  </rule>

### Rule: Identity & Access Integrity

<rule name="IdentityIntegrity">

- **Deny-by-Default**: No route/field is public unless documented
- **Least Privilege**: API tokens/roles → minimum permissions needed
- **RBAC**: Check permissions at boundary (Controller/UseCase), not in business logic
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
