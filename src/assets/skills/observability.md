# Observability: Logging, Tracing & Monitoring

<ruleset name="Observability Engineering">

> Load in Phase CODE when adding logging, tracing, metrics, or health checks.

## Universal Principles

- **Structured Logging**: JSON with consistent fields: `timestamp`, `level`, `message`, `correlationId`, `service`
- **Correlation IDs**: Every request carries a unique trace ID propagated across all boundaries
- **Log Levels**: `DEBUG` dev, `INFO` business events, `WARN` degraded, `ERROR` failures requiring attention
- **Never log secrets / PII**: see `security.md` (DataShielding SSOT): redact via allowlists, not denylists.
- **Health Checks**: Every service exposes `/health` with dependency status + uptime.
- **Metrics**: RED method (Rate, Errors, Duration) for every external-facing endpoint.

## Structured Logging per Stack

| Stack   | Library       | Key Pattern                                                                                    |
| ------- | ------------- | ---------------------------------------------------------------------------------------------- |
| Node.js | Pino          | Global `redact` array; Fastify `request.log.info(...)` auto-injects Request ID                 |
| .NET    | Serilog       | Enrich with `CorrelationId`, `MachineName`, `EnvironmentName`; `ILogger<T>` structural logging |
| Python  | structlog     | `JSONRenderer` prod; bind context per request: `log.bind(request_id=...)`                      |
| Go      | slog/zerolog  | Structured JSON; pass `context.Context` for trace ID propagation                               |
| Java    | SLF4J+Logback | MDC for correlation IDs; `logstash-logback-encoder` for JSON                                   |
| Rust    | tracing       | `tracing-subscriber` + `tracing-opentelemetry` for structured spans/JSON                       |

## Distributed Tracing (OpenTelemetry)

| Stack   | Setup                                                                    |
| ------- | ------------------------------------------------------------------------ |
| Node.js | `@opentelemetry/sdk-node` as FIRST import in entrypoint                  |
| .NET    | `AddOpenTelemetry().WithTracing(...)` + `AddAspNetCoreInstrumentation()` |
| Python  | `opentelemetry-instrumentation-fastapi/django`; init before app creation |
| Go      | `go.opentelemetry.io/otel` + `otlptrace`; propagate `context.Context`    |
| Java    | `opentelemetry-javaagent` (auto) or `opentelemetry-api`+`sdk` (manual)   |
| Rust    | `opentelemetry` + `opentelemetry-otlp` + `tracing-opentelemetry` bridge  |

## Error Tracking

- PII scrubbing: never send PII to error tracking; `sendDefaultPii: false` (Sentry) or equivalent
- Attach `correlationId`/`traceId` to every captured exception
- Alert on error rate spikes (e.g., >1% in 5min), not individual errors

</ruleset>
