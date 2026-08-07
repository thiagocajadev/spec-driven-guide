# Credits and Philosophies

SDG Agents is built on the shoulders of giants. We incorporate and adapt philosophies from the open-source community to create a resilient and efficient engineering environment for AI agents.

## Core Philosophies

### [Caveman](https://github.com/JuliusBrussee/caveman)

**Maximize technical density, minimize linguistic fluff.**
Caveman philosophy (by Julius Brussee) advocates for a high-density, low-token interaction style that prioritizes conclusions and technical fragments over conversational filler, maximizing the agent's contextual efficiency.

### [Context-mode](https://github.com/mksglu/context-mode)

**Treat the context window as a finite resource.**
The context-mode philosophy focuses on just-in-time loading and externalized memory. We implement this through our `.ai/backlog/` and `impact-map.md` mechanics, ensuring the agent only loads what is strictly necessary for the active cycle.

### [Writing Soul](https://github.com/hardikpandya/stop-slop)

**Keep a human pulse in technical artifacts.**
Inspired by [stop-slop](https://github.com/hardikpandya/stop-slop) (by Hardik Pandya), this philosophy bans "AI-isms" (e.g., "Certainly!", "Crucial first step") in favor of direct, inviting, and pedagogical engineering prose.

---

## Agent practice, 2026

The v7 alignment cycle checked SDG against what practitioners were publishing during 2026. Most of it was already here, which is the useful half of the result, so the credits below are scoped to what was actually taken.

### [Clean Code for AI Agents](https://akitaonrails.com/2026/04/20/clean-code-para-agentes-de-ia/)

**Names are searched, not read.**
Fabio Akita's list of agent-facing rules mostly matched `code-style.md` already: files under 500 lines, banned generic nouns, explicit types, injected dependencies, structured JSON logging, F.I.R.S.T tests. Two items had no counterpart here and were adopted. A new identifier returns under five `grep` hits across the repository, which catches the generic names no banlist knows about yet. And a sound `// why:` survives refactor, because it records the constraint the code cannot show, so deleting it discards the only copy.

### [Four rules for AGENTS.md](https://aridanemartin.dev/blog/karpathy-4-lines-claude-md/)

**State the assumption or ask.**
Andrej Karpathy's four behavioural rules were already answered by the working protocol: Simplicity First by the Lite flavor and Prägnanz, Surgical Changes by the minimal-surface rule of the `fix:` cycle, Goal-Driven Execution by the verification checklist. Think Before Coding was covered only in part, since the protocol raised blockers and said nothing about assumptions. Phase SPEC now carries an assumptions line where `none` is a valid answer and silence is not.

### [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

**Load names first, bodies on demand.**
Progressive disclosure names what SDG has done since v3: `AGENTS.md` is a registry of skills and one-line descriptions, and the bodies load per cycle phase. The check confirmed the model rather than changing it. The router carries a byte budget with a test behind it for the same reason, and this cycle hit that budget and shortened a description rather than raising the limit.

### Instruction files, measured

**Content decides whether the file helps or costs.**
Two 2026 studies reached opposite conclusions on `AGENTS.md`. One measured roughly 20 percent higher inference cost when context was added without curation. The other measured roughly 29 percent shorter runtime and 17 percent fewer output tokens across 10 repositories and 124 pull requests. The rule that reconciles them: an instruction earns its place only when it changes a command, a limit, a risk, a patch style or an acceptance criterion. SDG passed as a router and failed on one count, since it named no commands. `context.md` now declares `test`, `lint`, `build` and `release`, so Phase TEST stops rediscovering the build every cycle.

---

## Standards tracked by edition

A standard cited without its edition goes stale in silence. These carry the version SDG tracks and the cycle that rechecks it.

- **[OWASP Top 10:2025](https://owasp.org/Top10/2025/)**, the eighth installment. `security.md` maps all ten categories onto the rules that answer them, and the `audit:` cycle checks whether the edition is still the current one, reading the source rather than any summary of it.
- **[Conventional Commits](https://www.conventionalcommits.org/)**: the subject grammar behind the `VersionControl` rule, including the `!` marker that signals a breaking change.
- **[release-please](https://github.com/googleapis/release-please)** (Google): derived versioning through a release pull request. Chosen over publishing on every merge, because merging that pull request keeps the approval SDG treats as non-negotiable.
- **[Keep a Changelog](https://keepachangelog.com/)** and **[Semantic Versioning](https://semver.org/)**: the shape of `CHANGELOG.md` and the meaning of the three numbers.

---

## UI Research and Aesthetics

Our design standards and visual protocols are inspired by the following research and projects:

- **[TypeUI](https://typeui.sh)**: A CLI-first approach to managing design systems for AI agents, influencing how we structure visual skills.
- **[tweakcn](https://tweakcn.com)** & **[Shadcn/UI](https://github.com/shadcn-ui/ui)**: Foundational research on component architecture, concentric radius rules, and perceptual color scaling.
