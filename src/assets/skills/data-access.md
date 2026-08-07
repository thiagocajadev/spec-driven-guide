# Data Access: Performance, Safety, and Scalability

<ruleset name="Data Access Standards">

> Load in Phase CODE when touching repositories, DB connections, queries, or transactions.
> For SQL style/indentation, see `.ai/skills/sql-style.md`.

## Result-Driven Repositories

- Every data-access method returns `Result<T>`: `ok(data)` or `fail(ERROR_CODE)`
- Domain orchestrates failures via `if (result.isFailure)`; no try/catch in domain
- Map DB-specific errors (e.g., `PK_VIOLATION`) to domain codes (e.g., `CONFLICT`) before returning

## Connection Management

- Always use connection pooling; configure size for expected concurrency
- Open late, close early; never hold connections across request boundaries
- Enable pool health checks to evict stale/broken connections

## Query Performance & Pagination

> **N+1 detection (canonical)**: referenced by `performance.md` for hot-path discipline. Implementation rules live here.

- No `SELECT *`; project only needed columns
- Detect and eliminate N+1; use eager loading or batch fetching
- Cursor-based pagination mandatory for large/real-time datasets; `LIMIT/OFFSET` only for small sets or admin
- `EXPLAIN ANALYZE` on queries touching tables >10K rows

## Vertical Density & Storytelling SQL

- Follow the SDG Vertical Style (see `.ai/skills/sql-style.md`)
- Mandatory JOINs first, then optional (LEFT JOIN)
- Always qualify: `Table.Column`
- Avoid complex nested subqueries; favor temp tables for sequential steps
- Trailing conjunctions (`AND`, `OR`, `,`)

## Stored Procedure Naming

- Taxonomy: `SP_{CONTEXT}_{ACTION}_{SUBJECT}`
- Contexts: `SYS`, `ADM`, `SEC`, `HIS`, `INT`
- Actions: `GET_ONE`, `GET_ALL`, `INSERT`, `DELETE`, `UPDATE`, `UPSERT`, `PROC/SP`, `SYNC`, `VALIDATE`

## Caching

> **Caching SSOT**: referenced by `performance.md`. TTL is mandatory; cache + no invalidation = silent staleness.

- Cache as decorator/interceptor around repository; never mix with business logic
- Every cache entry must have TTL

## Migrations

- **Naming**: Rails `YYYYMMDDHHMMSS_<verb>_<subject>.sql`, where the timestamp guarantees order.
- **Forward-only**: no `down` edits on applied migrations; corrections are new migrations.
- **One concern per migration**: one table/column/index.
- **Idempotent guards**: `IF NOT EXISTS` / `IF EXISTS`.
- **No data backfills** in schema migrations. Use a separate operational script.

## Data Integrity & Transactions

- FK constraints for referential integrity; `NOT NULL` by default
- Transaction boundaries scoped minimally, one unit of work
- No I/O (external APIs, file ops) inside transactions

## Resource Hygiene

- Idempotency: check if temp table exists and drop before creation (`IF OBJECT_ID... DROP`)
- Cleanup: explicitly drop temp tables at end of script

</ruleset>
