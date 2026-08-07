# API Design: Consistency, Resilience, and Contracts

<ruleset name="Universal API Design Standard">

> Load in Phase CODE when designing endpoints, response envelopes, or API contracts.

## API Contract Resilience

- **Envelope SSOT**: shape, meta fields, and error codes defined in `.ai/instructions/competencies/delivery.md` (Backend section). Do not redefine here.
- **Typed Error Payloads**: Explicit string constants (`NOT_FOUND`, `INVALID_INPUT`); never free-form messages. HTTP 409: `CONFLICT` for unique constraints, `BUSINESS_RULE_VIOLATION` for domain rules.
- **Idempotency**: Require `Idempotency-Key` headers for non-safe ops (POST/PUT/PATCH) with financial/inventory side effects.

## API Data Masking

- **Zero Leakage**: No internal IDs (autoincrement), DB metadata, or stack traces in responses. Use UUIDs/ULIDs for client-facing PKs
- **Explicit Projection**: Return only contract fields via Response DTO. No raw entities, no `passwordHash`/`internalMetadata`
- **HTTPS Only**: Enforce secure transport

## REST Endpoint Hierarchy

- **Resource-Oriented**: Nouns, not Verbs (`POST /orders` not `POST /create-order`)
- **Sub-Resource Hierarchy**: Deep paths for context (`/users/{id}/orders`)
- **Statelessness**: No session affinity for a single request

## Standardization

- **Naming**: camelCase JSON keys; kebab-case headers/paths
- **Pagination**: Mandatory for collections. Cursor-based default; offset only for bounded admin UIs
- **Versioning**: Path prefix (`/v1/...`)
- **HTTP Status**: Semantic ranges (2xx success, 4xx consumer errors, 5xx system failures)

</ruleset>
