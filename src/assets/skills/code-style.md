# Code Style — SDG Essentials

<ruleset name="CodeStyle">

> Load in **Phase CODE**. SQL aesthetics in `sql-style.md`; UI copy voice in `writing-soul.md`; visual density in depth in `visual-density.md`.

## Security first

- Default deny at every boundary. Fail fast if environment is incomplete.
- Never concatenate user input into queries, commands, paths, or logs — validate at edges, reject what isn't expected.

---

## Structure & Tooling

- **File naming** `domain.operation.ext` (`order.compute.js`, `user.validate.ts`). Never `helpers.js`, `utils.js`, `common.js`.
- **Files** under 500 lines. One concern per module (SRP). Follow framework convention (Rails, Django, Next.js, Astro) — don't reinvent the tree.
- **Formatter**: language default (`prettier`, `gofmt`, `black`, `cargo fmt`, `rubocop -A`). No style debates beyond that. No alignment padding for `=` or `:`. Visual density (grouping blanks, dot-chain breaks) layers **on top** — formatter handles wrapping and indentation; blank lines between statements are the developer's signal layer and are never reformatted by the tool.
- **Logging**: Structured JSON for debug / observability (one event per line, stable keys). Plain text only for user-facing CLI output.

---

## Form — function structure and narrative

| Principle           | Rule                                                                                                  |
| :------------------ | :---------------------------------------------------------------------------------------------------- |
| English source      | Code is universal; short, unambiguous English names                                                   |
| Narrative code      | Read the code like a story: high-level intent at the top, implementation details below                |
| Clean entry point   | `run()` / `start()` / `init()` as headline caller — single-statement OR `const x = call(); return x;` |
| Vertical signature  | ≤3 params per line; 4+ → object. Destructure in body, not in signature                                |
| Orchestrator on top | Caller visible before details (top-down)                                                              |
| Narrative Siblings  | One-use helpers directly below their caller (Stepdown Rule)                                           |
| Explaining Returns  | Named `const` before every meaningful `return`; void-terminator (`console.log(msg);`) exempt          |

**Anchors**

- **Forbidden in `return`**: ternary, arithmetic, template literal, anonymous object, constructor, logic of any kind. Lift to a named `const`.
- **Void-terminator**: a side-effect call (`console.log(message);`) ends the function with an implicit return. Never ceremonialize into `const X = sideEffect(); return X;`.

---

## Readability — flow, visual density, and names

| Principle             | Rule                                                                                                                            |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| Early return          | Exit early on failure; no `else` after `return`; max 2 indent levels                                                            |
| Control flow          | Tool matches shape: guards / lookup table / `switch` / `Map` / ternary. `===` always; SLA per function                          |
| Braced guards         | Every `if` / `else` / `for` / `while` body wrapped in `{ }` (enforced by `curly: all`)                                          |
| Visual density        | 1 blank between groups, 0 within, never 2+. Wall-of-tight and double-blank are equal violations (in depth: `visual-density.md`) |
| Expressive names      | Domain intent over storage detail — banned verbs / nouns / abbreviations (see anchors)                                          |
| Boolean prefix        | `is` / `has` / `can` / `should` / `did` / `needs` / `supports` / `allows`                                                       |
| Import aliasing       | Single-letter or meaningless imports renamed at the import site                                                                 |
| Code as documentation | WHY-only one-liner; multi-line WHY = refactor signal; drift compacts, never accumulates                                         |
| Template literals     | `` `${a}-${b}` `` over `+` for dynamic strings                                                                                  |
| No magic values       | Named constants; expressions whose surface declares output (`new Date().toISOString().split('T').at(0)`)                        |

**Anchors**

- **Banned verbs**: `handle`, `do`, `run`, `execute`, `perform`; `get` for computations (use `compute` / `calculate` / `derive`).
- **Banned nouns**: `data`, `info`, `obj`, `item`, `thing`, `helpers`, `utils`, `common`, `shared`, `misc`.
- **Banned abbreviations**: `req` → `request`, `res` → `response`, `ctx` → `context`, plus `idx`, `prev`, `arr`, `val`, `tmp`, `cb`, `fn`, `mgr`, `ctrl`, `svc`.
- **Braced guards** examples: ❌ `if (isEmpty) return null;` ✅ `if (isEmpty) {\n  return null;\n}`.
- **Import aliasing** examples: `import z from 'zod'` → `import { z as validate } from 'zod'`; `import fs from 'node:fs'` → `import fileSystem from 'node:fs'`. Carve-out: identifiers ≥3 chars that are English words or established acronyms (`path`, `os`, `url`, `http`, `crypto`) stay as-is.
- **WHY discipline**: `// why:` permitted only for hidden constraints (invariants, workarounds, bug references). Multi-line WHY → extract named const / function or move to docstring. On drift (maintenance, evolution, fix-on-fix): replace stale WHY, never stack `// update:` / `// 2026:` / `// also:` chains. Stale WHY ≥ no comment. No section banners (`// --- Section ---`).
- **Magic values**: any string whose visible form does not match its purpose is magic — `'en-CA'` used to emit ISO dates, single-letter locale codes for formatting side-effects. Exception messages include the offending value and the expected shape.

---

## Quality Control — state, errors, async, and tests

| Principle             | Rule                                                                                     |
| :-------------------- | :--------------------------------------------------------------------------------------- |
| Small functions       | 4–30 logical statements (not raw LoC); one responsibility, one abstraction level         |
| Compute vs format     | Computing data and formatting output live in separate functions                          |
| Immutability          | `const` first; `let` only when necessary; mutation crosses boundaries explicitly         |
| CQS                   | Function mutates (command) OR reads (query) — never both                                 |
| Explicit dependencies | Inject via parameter / constructor; no hidden globals; wrap third-party libs             |
| Fail fast             | Validate early; abort invalid flow at the boundary                                       |
| Explicit return       | Exceptions are not control flow; return `Result` / discriminated union / explicit `null` |
| Consistent contracts  | Standardized response shapes; the same format every time                                 |
| Centralized errors    | Typed error classes; `try` / `catch` at boundaries, not scattered                        |
| Async I/O             | `async` / `await`, never block                                                           |
| Explicit types        | No `any`; no untyped public function (where the language supports types)                 |
| No duplication        | Rule of Three — extract on the third occurrence, not sooner                              |
| Structured tests      | F.I.R.S.T + AAA explicit; mock external I/O with named fakes; happy + edge + failure     |

---

<rule name="WorkChecklist">

## Work Checklist

> Recite at Phase CODE entry, **before** the first `Edit` / `Write` / `NotebookEdit`. Both sections are binary — no partial credit.
>
> **Intent** establishes what you are about to do. **Form** establishes what the result must look like — code aware of the final form avoids the CODE → TEST → CODE rework loop.
>
> Phase TEST verifies the **Form** section against `governance.mjs` heuristics. TEST verifies; it should not discover.

### Intent (recite at CODE entry)

- [ ] **Mental Reset** — named which training default is being suspended for this task (verbose prose, dense walls, auto-summarize, taboo verbs).
- [ ] **Target Files** — explicit path list from approved Plan; no drift.
- [ ] **Naming** — no banned verbs / nouns / abbreviations; booleans carry semantic prefix; files follow `domain.operation.ext`; single-letter imports aliased with intent name.
- [ ] **Narrative** — Stepdown, SLA, Explaining Returns, control-flow tool matches shape, ≤2 indent levels.
- [ ] **Comments** — WHY only; one-liner; no what-comments; docstring on public surfaces; drift compacts.
- [ ] **Tests planned** — new function → test; bug fix → regression test; external I/O mocked; AAA phases explicit.
- [ ] **Security** — boundary inputs validated; no string-concat into queries / commands / paths.
- [ ] **Blockers** — `none` or enumerated.

### Form (recite at CODE entry; verified at Phase TEST)

- [ ] **Pure entry point**: `run()` as headline caller only (single-statement or canonical 2-statement form).
- [ ] **Narrative Siblings**: one-use helpers as siblings below callers.
- [ ] **Explaining Returns**: named `const` above every meaningful `return` (void-terminator exempt).
- [ ] **Revealing Module Pattern**: named export at footer.
- [ ] **Vertical Density**: 1 blank between groups, 0 within, never 2+.
- [ ] **Boolean prefix**: `is` / `has` / `can` / `should` / `did` / `needs` / `supports` / `allows`.
- [ ] **No framework abbreviations**: `req` / `res` / `ctx` forbidden; plus SDG taboos (banned verbs / nouns / abbrs).
- [ ] **No section banners**: no `// --- Section ---` dividers.

> **Circuit Breaker**: any write tool call without a preceding Work Checklist recitation auto-fails Phase TEST; remediation is re-entry into Phase CODE with the checklist emitted.

</rule>

## Linter-enforced (ESLint auto-fix on save)

> These rules run before the agent sees the code. No gate check needed.

| Rule                                    | Coverage                                                                                                                                                 |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `curly: all`                            | Every `if`/`else`/`for`/`while` body wrapped in `{ }`                                                                                                    |
| `local/semantic-spacing`                | Blank line after multiline statement; 2+2 split in 4-statement non-test bodies; no spurious blanks between consecutive VDs before a side-effect terminal |
| `local/no-boolean-comparison`           | `value === true/false` → `value` / `!value`                                                                                                              |
| `local/no-inline-assert`                | Named `actual*` / `expected*` identifiers on both sides of every assertion (test files)                                                                  |
| `local/blank-before-assertion`          | Blank line before first `assert.*` / `expect()` in a block; no blank between consecutive assertions (test files)                                         |
| `local/duplicate-consecutive-statement` | Two adjacent statements with identical source text; deliberate repetition carries an `eslint-disable-next-line` plus a WHY comment                       |
| `padding-line-between-statements`       | Blank line before/after top-level function declarations                                                                                                  |
| `prettier`                              | Formatting, indentation, quotes, semicolons, dot-chain wrapping (printWidth 80)                                                                          |

Activation recipe: `.ai/tooling/eslint-config/snippet.mjs` + `.ai/tooling/README.md`.

</ruleset>
