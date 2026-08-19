# Token optimization: cost model, compaction, and routing

How the instruction set stays cheap to load, and what it cost to get there. Sections 1 through 3 describe the model as it works today. Section 4 onward is the measured record of the v3 compaction, kept as written: it names files that later releases removed, including the idiom catalog and `staff-dna.md`.

## 1. Token Cost Model

- **Ratio**: ~4 bytes/token (English), ~3 bytes/token (code).
- **Auto-loaded per session**: `CLAUDE.md` (pointer, ~200B) + `AGENTS.md` (router at the repo root, <2.8KB).
- **On-demand**: skills and competencies loaded only when triggered by phase or domain.
- **Per-session formula**: `base (CLAUDE.md + AGENTS.md) + Σ(loaded skills per phase)`.
- **Typical session**: 2–4 skills loaded. Worst-case (fullstack feat): ~8 skills.

## 2. Semantic Router: Load Only What's Triggered

- `AGENTS.md` is a minimal registry (<2.8KB worst-case, 44% reduction from v2).
- **Phase-gated**: Skills only loaded in Phase CODE, not at session start.
- **Domain matching**: Backend, Frontend, and Surgical groups loaded by task domain. Stack specifics come from `.ai/backlog/stack.md`, already in context.
- **Token gate**: "load ONLY what's triggered, never preload."

## 3. Compaction Process

**Strategy**: Remove verbose examples, compress tables/lists, strip XML rule tags, admonitions (`> [!NOTE]`), decorative headers. Preserve all operational rules and structural integrity.

**Workflow**:

1. Edit `src/assets/` (source of truth), never `.ai/` directly.
2. Regenerate: `npx spec-driven-guide init --quick`.
3. Validate: `npm test`.

## 4. Reduction Results

### Round 1: Skills (commit `a99cb76`)

| File                   | Before     | After     | Cut      |
| ---------------------- | ---------- | --------- | -------- |
| ui-ux.md               | 44.8K      | 14.3K     | -68%     |
| code-style.md          | 24.3K      | 9.8K      | -60%     |
| workflow.md            | 10.6K      | 5.5K      | -48%     |
| typescript/patterns.md | 10.9K      | 6.0K      | -45%     |
| testing.md             | 9.6K       | 4.4K      | -54%     |
| security.md            | 8.0K       | 4.3K      | -46%     |
| javascript/patterns.md | 7.3K       | 4.2K      | -43%     |
| staff-dna.md           | 6.5K       | 3.9K      | -40%     |
| **Subtotal (8 files)** | **122.0K** | **52.4K** | **-57%** |

### Round 2: Idioms & remaining skills (commit `5929a53`)

| File                     | Before    | After     | Cut      |
| ------------------------ | --------- | --------- | -------- |
| csharp/patterns.md       | 11.0K     | 7.0K      | -36%     |
| java/patterns.md         | 7.3K      | 5.0K      | -32%     |
| cloud.md                 | 6.1K      | 2.7K      | -56%     |
| ci-cd.md                 | 5.9K      | 2.7K      | -55%     |
| python/patterns.md       | 5.6K      | 3.5K      | -37%     |
| go/patterns.md           | 5.4K      | 3.6K      | -33%     |
| rust/patterns.md         | 5.3K      | 3.4K      | -37%     |
| data-access.md           | 4.7K      | 2.1K      | -54%     |
| observability.md         | 4.1K      | 2.3K      | -44%     |
| vbnet-legacy/patterns.md | 3.8K      | 2.5K      | -34%     |
| sql-style.md             | 3.5K      | 1.7K      | -51%     |
| api-design.md            | 3.4K      | 1.5K      | -55%     |
| vbnet/patterns.md        | 3.2K      | 2.0K      | -39%     |
| sql/patterns.md          | 2.9K      | 1.9K      | -37%     |
| flutter/patterns.md      | 2.9K      | 1.8K      | -37%     |
| swift/patterns.md        | 2.7K      | 1.7K      | -39%     |
| kotlin/patterns.md       | 2.6K      | 1.7K      | -36%     |
| scripts/patterns.md      | 2.3K      | 1.4K      | -37%     |
| **Subtotal (18 files)**  | **82.7K** | **48.4K** | **-41%** |

### Round 3: Commands, flavors, templates, competencies

| File                         | Before    | After     | Cut      |
| ---------------------------- | --------- | --------- | -------- |
| vertical-slice/principles.md | 5.8K      | 2.8K      | -51%     |
| mvc/principles.md            | 4.3K      | 2.1K      | -51%     |
| sdg-land.md                  | 4.2K      | 2.2K      | -46%     |
| agent-roles.md               | 3.3K      | 1.7K      | -47%     |
| legacy/principles.md         | 2.7K      | 1.5K      | -45%     |
| lite/principles.md           | 2.1K      | 1.1K      | -46%     |
| sdg-docs.md                  | 1.8K      | 0.9K      | -52%     |
| frontend.md                  | 1.7K      | 1.6K      | -7%      |
| sdg-audit.md                 | 1.5K      | 0.8K      | -45%     |
| backend.md                   | 1.4K      | 1.3K      | -7%      |
| sdg-fix.md                   | 1.4K      | 0.8K      | -39%     |
| sdg-end.md                   | 1.3K      | 0.8K      | -40%     |
| sdg-feat.md                  | 1.2K      | 0.9K      | -28%     |
| **Subtotal (13 files)**      | **32.7K** | **18.5K** | **-43%** |

### Cumulative

| Metric           | Value                        |
| ---------------- | ---------------------------- |
| Files compacted  | 39                           |
| Bytes before     | ~237K                        |
| Bytes after      | ~119K                        |
| Total cut        | **~118K (~50%)**             |
| Tokens saved     | **~25K tokens**              |
| AGENTS.md router | -44% (separate optimization) |

## 5. Architecture Decisions

- **Router over monolith**: Token cost scales with loaded files, not total files.
- **On-demand over eager**: Most sessions touch 2–4 skills, not 39.
- **Compaction over deletion**: Rules are operational; examples are pedagogical.
- **Source readability preserved**: `src/assets/` stays human-readable, output is compact.
