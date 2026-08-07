# Performance: Complexity Budget & Hot Paths

<ruleset name="Performance">

> Load in **Phase CODE** when touching hot paths (request handlers, list iteration, DB queries, render loops) or when SPEC declares latency / throughput targets.

---

## Big-O Discipline

| Operation              | Acceptable             | Red flag                        |
| :--------------------- | :--------------------- | :------------------------------ |
| Single-record CRUD     | O(1)                   | O(n) lookup (full scan)         |
| List rendering         | O(n)                   | Nested loops over the same list |
| Aggregation            | O(n) with index        | O(n²) without index             |
| Cross-collection match | O(n + m) via Map / Set | O(n × m) nested filter          |
| Sort then paginate     | O(n log n) + O(k)      | Sort whole set per page request |

State the complexity of any new function on hot paths in a one-line docstring (`O(n) where n = orders`). Without it, complexity is invisible until prod.

---

## Hot Path Rules

- **No N+1**: detect via test asserting query count; eager-load or batch (see `data-access.md`).
- **No allocation in tight loops**: hoist constant objects / arrays / regexes outside the loop body.
- **No regex compilation in tight loops**: pre-compile module-level.
- **Avoid `JSON.parse(JSON.stringify(...))`** for cloning: use `structuredClone` or a per-shape mapper.
- **Stream over buffer** for large I/O (>1 MB): never load the whole payload into memory.
- **Memoize pure expensive functions**: Rule of Three: memoize on the third hot-path call site, not sooner.
- **Avoid synchronous CPU-bound work** on the request thread: offload to workers / queues.

---

## Budget Declaration

For latency-sensitive code, declare the target in SPEC:

```
Latency budget: p95 < 150ms (cold), p95 < 50ms (cached)
Throughput:     100 req/s sustained
Memory:         < 50MB per request
```

Without a budget, "fast enough" becomes whatever it happens to be in prod.

---

## Profiling Discipline

- **Measure first, optimize second.** Speculative optimization without a profile is waste.
- **Profile in prod-like data.** Toy fixtures hide N+1 and tail latency.
- **Track regressions in CI.** Benchmark gate on hot endpoints (delta > 10% blocks merge).
- **Read the flame graph before guessing.** "It's slow" is not a diagnosis.

| Stack   | Tools                                      |
| :------ | :----------------------------------------- |
| Node.js | `0x`, `clinic`, built-in `--prof`          |
| Python  | `py-spy`, `cProfile`, `scalene`            |
| Go      | `pprof`, `go test -bench`                  |
| Rust    | `perf`, `cargo flamegraph`, `criterion`    |
| .NET    | `dotnet-trace`, `BenchmarkDotNet`          |
| JVM     | async-profiler, JFR (Java Flight Recorder) |

---

## Anti-Patterns

- **"Premature optimization"** used as an excuse to skip profiling on a known hot path.
- **Caching without invalidation strategy** (see `data-access.md` Caching). Cache + no TTL = bug factory.
- **Adding parallelism** (`Promise.all`, goroutines) without backpressure → cascade failure.
- **Hand-rolled microbenchmarks** ignoring JIT warmup or GC noise. Use the language's bench tool.
- **Optimizing the wrong layer**: 90% of the time the bottleneck is I/O, not CPU. Profile before micro-tuning loops.

</ruleset>
