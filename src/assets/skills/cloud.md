# Cloud & Containers: Infrastructure Standards

<ruleset name="Cloud & Container Standards">

> Load in Phase CODE when touching Dockerfile, compose/K8s manifests, IAM, or cloud config.

## Cloud Architecture

### Managed Services

- Prefer PaaS/SaaS (AWS RDS, Vercel, Azure SQL) over self-hosted VMs
- Leverage platform auto-scaling; use serverless and managed DBs to reduce ops overhead

### Least Privilege (IAM)

- Restrict service accounts/roles to minimum required permissions
- Separate accounts and IAM roles per environment (Prod/Staging/Dev); never share credentials across envs
- Secrets via AWS Secrets Manager, GCP Secret Manager, or Vault; never plaintext env vars or committed to source

### Config Fail-Fast

- Config schema + abstract naming + no `.env.example`: see `security.md` (AbstractEnvNaming SSOT).
- Ship logs to central sink (CloudWatch, Datadog, GCP Logging); never rely on local disk in cloud.
- Health + RED + structured logging rules: see `observability.md`.

## Container Standards

### Multi-Stage Builds

- Slim base images (Alpine/Distroless) for final runtime
- `npm install`/`dotnet build` in separate build stage

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
```

### Security & Privileges

- Never run containers as root; `USER node` (or `USER app`) before CMD
- Mount volumes read-only when possible

### Health Checks

- Every container declares a `HEALTHCHECK`; orchestrators use it for routing/restart

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```

### Env Var Injection

- Never bake secrets into images; images must be env-agnostic
- `ARG` for build-time; runtime env vars for config/secrets; never `ENV` for secrets
- No defaults for secret values in Dockerfile; `.env` for local dev only

### Resource Limits

- Always set memory/CPU limits in production (compose, K8s, ECS)
- Start conservative; tune upward with data
- OOMKilled = investigate, don't silently restart

```yaml
services:
  api:
    deploy:
      resources:
        limits: { memory: 512m, cpus: "0.5" }
        reservations: { memory: 256m, cpus: "0.25" }
```

</ruleset>
