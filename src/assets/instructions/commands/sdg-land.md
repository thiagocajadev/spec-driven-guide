# Land Cycle: Project Inception

Landing on project: $ARGUMENTS. Runs once before the first `feat:`. It turns raw vision into a grounded backlog and declares the project stack.

> **Load now**: `.ai/instructions/templates/workflow.md`, `.ai/skills/writing-soul.md`, `.ai/skills/checklist-soul.md`

## Outputs

- `## Vision` section → `.ai/backlog/context.md`
- `.ai/backlog/stack.md` populated with developer-declared languages/versions (SSOT for Phase CODE stack context)
- Ordered epics → `.ai/backlog/tasks.md`
- STOP: explicit approval required before any `feat:`

## Phase: VISION → MODE: PLANNING

Parse input. Extract only what was explicitly stated:

- **What** is being built
- **For whom**
- **Core problem** (one sentence)
- **Signal**: greenfield (no code) or legacy (existing project)

If too vague → ask one clarifying question.

## Phase: SURVEY → MODE: PLANNING (legacy only, skip if greenfield)

Read silently: `package.json`, `README.md`, entry points, folder structure, `git log --oneline -10`. Identify stack, architecture pattern, pain points.

## Phase: SCOPE → MODE: PLANNING

Define MVP boundary:

- Constrain vision to realistic first release
- Explicitly list **out of scope** (name it, since vague exclusions don't count)
- Legacy: diagnosis before new features
- **Max 7 epics**: merge or defer if more

Present scope boundary before reaching Phase STACK. If overambitious, say so and propose realistic MVP cut.

## Phase: STACK → MODE: PLANNING

Stack discovery is the SSOT for what Phase CODE will load in future cycles. Replace any static idiom catalogs.

### 1. Elicit languages + versions (free-form)

Ask the developer once, open-ended:

> "List every language, runtime, and major framework this project uses, with versions. One line per entry. Example: `Node.js 24 LTS`, `TypeScript 5.6`, `Astro 5`, `Postgres 16`."

Then classify each entry by role: **Backend**, **Frontend**, **Data**, **Scripts**. Do not add entries the dev did not declare.

### 2. Offer optional WebFetch enrichment

Present an **allow-list of canonical doc sources**, one per language entry. Ask per-entry (not per-fetch-URL) whether to enrich:

- JavaScript / ECMAScript → `tc39.es/ecma262/`
- TypeScript → `typescriptlang.org/docs/`
- Node.js → `nodejs.org/api/`
- React → `react.dev/reference/`
- Astro → `docs.astro.build/`
- Python → `docs.python.org/3/`
- Go → `go.dev/doc/`
- Rust → `doc.rust-lang.org/stable/`
- Kotlin → `kotlinlang.org/docs/`
- Dart / Flutter → `dart.dev/guides`, `docs.flutter.dev/`
- .NET / C# → `learn.microsoft.com/dotnet/`
- Swift → `developer.apple.com/documentation/swift/`

**Security sources**, allowed for any stack and read by `audit:` when it checks the baseline in `security.md`:

- OWASP Top 10 → `owasp.org/Top10/`
- OWASP ASVS → `owasp.org/www-project-application-security-verification-standard/`
- OWASP Cheat Sheets → `cheatsheetseries.owasp.org/`
- Advisory data → `nvd.nist.gov/`

Rules:

- Only WebFetch URLs from this allow-list. Never invent a source.
- Refusal is valid, and the dev can skip enrichment entirely. Do not pressure.
- Enrichment adds one-line "what's new / LTS status" notes to each entry. Do not bloat `stack.md` with doc quotes.

### 3. Write `.ai/backlog/stack.md`

Follow the seed shape (roles as headers, one bullet per entry):

```md
# Project Stack

> Declared during `land:`. Update directly when languages/versions change, no regen needed.

## Languages

### Backend

- `Node.js@24 LTS`: runtime
- `TypeScript@5.6`: typed superset

### Frontend

- `Astro@5`: SSG/SSR framework

### Data

- `Postgres@16`: relational DB

### Scripts

- _(none)_
```

If a role has no entries, keep the header with `_(none)_` placeholder, because downstream loaders rely on the shape.

### 4. Declare the release mode

Ask once, and write the answer as `release` in `context.md`:

> "Who cuts releases here: a single maintainer on their own machine, or a team through pull requests?"

- **Single maintainer** → `manual`. The bump runs locally, the release commit carries the version, and `CHANGELOG.md` is maintained by hand under `## [Unreleased]`. Nothing to configure and no CI minutes spent.
- **Team** → `derived`. Offer to wire `.ai/tooling/github-actions/`, following the recipe in `.ai/tooling/README.md`. From then on the agent writes neither the version nor the changelog, because the commits already carry both.

Both modes compute the same bump from the same commit types, and they differ only in where that happens. `versioning.md`, `VersionControl`, holds the table.

Default to `manual` when the answer is unclear: it needs no infrastructure, and moving to `derived` later is copying three files.

## Phase: BACKLOG → MODE: PLANNING

### 1. Update `context.md`

Add `## Vision` section (never overwrite existing content):

```md
## Vision

**Product:** [what] · **User:** [whom] · **Problem:** [one sentence]
**MVP Scope:** [in] · **Out of scope:** [deferred]
```

### 2. Write `tasks.md`

**Ordering (non-negotiable)**:

1. Foundation (scaffolding, config, CI)
2. Data/domain (models, repos, core logic)
3. Integration (APIs, external services)
4. Application (use cases, orchestration)
5. Delivery (UI, CLI, endpoints)
6. Hardening (auth, errors, observability)
7. Polish (docs, migration, release)

Legacy: add diagnosis epic at position 0.

Format: `### Epic N: [Name]` with `- [TODO] feat: [atomic task]` items.

## Phase: STOP → MODE: PLANNING

Present: vision (3 lines), scope (in/out), **stack.md summary** (role counts), epic list with task counts. Stop completely. No code. Wait for explicit approval.

> Read `.ai/instructions/templates/agent-roles.md` for multi-agent handoff protocol.
