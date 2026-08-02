# MVC Architecture Principles

> Inherits Security, Reliability, Narrative from code-style.md.

## MVC Pipeline

**API**: `Request → Controller → Service → Repository → Response`
**SSR/Razor**: `Request → Controller → Service → Repository → Mapper → ViewModel → View`

- **Controller**: HTTP entry. Receives Request, calls Service, returns Response/View.
- **Service**: Business orchestration. Returns `Result<T>`.
- **Repository**: Persistence only. Returns raw entities.
- **Response/ViewModel**: External contract. Raw entities NEVER exposed.

## Thin Controllers & Services

- **Orchestration**: Controller receives Request → Call Service → Map Result → Return.
- **Business Flow**: Service receives clean data → Orchestrate Domain/Repo → Return Result. No technical noise.
- **Thin Services**: Avoid God Services. Split into specific Use Cases if logic grows.
- **Validation**: Structural validation in DTOs or dedicated Validators.

## Directory Structure

```
/controllers     ← HTTP entry points (thin)
/services        ← business orchestration + validation
/repositories    ← persistence (DB queries only, no try/catch)
/dtos            ← Request/Response contracts
/viewmodels      ← View-specific data (SSR only)
/views           ← Rendering shells (SSR only, no logic)
/models          ← internal data structures (never exposed)
/infrastructure  ← DB connection, exception handler, auth middleware
```

## Views as Shells (SSR/Legacy)

- **Zero Logic**: No `if` for business rules in templates. ViewModel provides boolean flags (e.g., `model.IsEditable`).
- **No Raw Entities**: Map to ViewModel first. Never pass DB entity to View.
- **Pre-formatted Data**: Dates, currencies formatted in Mapper, not View.

## DO / DO NOT

**DO**: Validate input before Service · Map output through Response DTOs · Repository abstraction for all DB access.

**DO NOT**: Business logic in Controllers · Access Repository from Controllers (bypass Service) · Return raw entities · Mix HTTP concerns in Services.

> DO NOT rules ALWAYS override DO rules.
