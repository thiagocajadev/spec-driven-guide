# Credits and Philosophies

spec-driven-guide adapts ideas from the open-source community and from the people who build the models. Each entry below says what was taken and where it landed, so the credit and the reason travel together.

## Core Philosophies

### [Caveman](https://github.com/JuliusBrussee/caveman)

**Maximize technical density, minimize linguistic fluff.**
Caveman philosophy (by Julius Brussee) advocates for a high-density, low-token interaction style that prioritizes conclusions and technical fragments over conversational filler, maximizing the agent's contextual efficiency. Since v11.1.0 SDG applies it to working notes only: a SPEC, a plan or a handoff is read later by someone without the context, and gets full sentences.

### [Context-mode](https://github.com/mksglu/context-mode)

**Treat the context window as a finite resource.**
Under context-mode, instructions load at the moment a task needs them, and memory lives outside the context window. SDG applies it through `.ai/backlog/`, which holds what the project learned across sessions, and `impact-map.md`, which names the files a plan touches and what imports them.

### [Writing Soul](https://github.com/hardikpandya/stop-slop)

**Keep a human pulse in technical artifacts.**
Inspired by [stop-slop](https://github.com/hardikpandya/stop-slop) (by Hardik Pandya), this philosophy bans "AI-isms" (e.g., "Certainly!", "Crucial first step") in favor of direct, inviting, and pedagogical engineering prose.

### [code-review-graph](https://github.com/tirth8205/code-review-graph)

**Give the agent the blast radius, not the repository.**
The tool builds a knowledge graph from Tree-sitter syntax trees and serves it over MCP, so an agent reads only the code a change can reach. `impact-map.md` takes the idea without the tooling: at Phase PLAN the agent lists the files the tasks will touch and traces their imports by hand, with no parser and no server.

---

## Agent practice, 2026

The v7 alignment cycle checked SDG against what practitioners were publishing during 2026. Most of it was already here, which is the useful half of the result, so the credits below are scoped to what was taken.

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

## Subtraction and enforcement, November 2026

The 2026-11-18 `audit:` read the skill ecosystem and current vendor guidance for what the kit could gain without growing heavier. The sources agreed more on what to remove than on what to add, and v11.1.0 shipped both halves.

### [Claude Code best practices](https://code.claude.com/docs/en/best-practices) and [memory](https://code.claude.com/docs/en/memory)

**If something has to happen every time, make it a hook.**
The "What you can stop doing" table lists emphasis, recited checklists and delegation for its own sake as advice current models no longer need. The Work Checklist stopped being recited, absolute rules now carry a scope and a reason instead of capital letters, and the commit gate gained an enforced half in the `git-guard` hook. The memory page set the frame for the `AGENTS.md` byte budget and named the `/doctor prompt-audit` that `audit:` now runs when a model ships. The [goal](https://code.claude.com/docs/en/goal) page shaped the contract for unattended runs.

### [Solving code review at Anthropic](https://claude.dev/blog/solving-code-review-at-anthropic)

**A second reader helps only when it reads fresh.**
The fresh-context review in `review.md`, with its two axes, fidelity to the SPEC and code quality, follows this account. So does the rule that every `troubleshoot.md` entry names the regression test that pins it, which turns past incidents into cases the suite runs on every change. Its risk-tiered approval is recorded in the backlog as an open question rather than adopted.

### Vendor prompting guides

**Write for the reader who was not there.**
Anthropic's guides for the Claude 5 family and OpenAI's guide for its latest models both favor full sentences for anything a later reader depends on, and warn that current models read "never" as absolute. Terse Mode was scoped to working notes, and the unattended-run contract separates an ordinary obstacle from a deliberate blocker.

### [mattpocock/skills](https://github.com/mattpocock/skills)

**Guardrails as code, questions with answers attached.**
Matt Pocock's `git-guardrails-claude-code` is the model for `git-guard`, and his grilling skill is the model for Phase SPEC asking numbered questions, each with a recommended answer.

### [akitaonrails/ai-memory](https://github.com/akitaonrails/ai-memory) and [ai-jail](https://github.com/akitaonrails/ai-jail)

**Memory informs; it never authorizes.**
Fabio Akita's design notes on rule promotion and poisoned memory gave `learned.md` its entry rules: one lesson, its origin, pruned when untrue, promoted only by a developer. The `ai-jail` principle that untrusted repository config may only tighten became the precedence line in the Persistence Policy. Both projects keep memory or isolation outside the repository, which SDG declined; their review rules were what it took.

### [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)

**Climb the ladder before writing.**
The YAGNI ladder in `code-style.md` and its never-cut list come from the ponytail `AGENTS.md`.

### Agent Skills format

**A skill describes itself.**
The `name` and `description` frontmatter on every skill follows the format published at [agentskills.io](https://agentskills.io) and used by [anthropics/skills](https://github.com/anthropics/skills) and [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills), whose routing evaluations also suggested the test that holds the router to the skills it names.

### Also read

superpowers (two-stage review, brainstorming), gstack (labels that mark a gate as enforced or advisory), [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill), and Simon Willison's coverage of Anthropic staff talks, including an "always verify" rule misfiring on small changes and incidents turned into a daily eval set.

---

## Standards tracked by edition

A standard cited without its edition goes stale in silence. These carry the version SDG tracks and the cycle that rechecks it.

- **[OWASP Top 10:2025](https://owasp.org/Top10/2025/)**, the eighth installment. `security.md` maps all ten categories onto the rules that answer them, and the `audit:` cycle checks whether the edition is still the current one, reading the source rather than any summary of it.
- **[Conventional Commits](https://www.conventionalcommits.org/)**: the subject grammar behind the `VersionControl` rule, including the `!` marker that signals a breaking change.
- **[release-please](https://github.com/googleapis/release-please)** (Google): derived versioning through a release pull request. Chosen over publishing on every merge, because merging that pull request keeps the approval SDG treats as non-negotiable.
- **[Keep a Changelog](https://keepachangelog.com/)** and **[Semantic Versioning](https://semver.org/)**: the shape of `CHANGELOG.md` and the meaning of the three numbers.

---

## UI research

The rules in [`ui-ux.md`](../../src/assets/skills/ui-ux.md) draw on the sources below: the design contract the agent fills before any UI code, the elevation stack, the presets and the UX quality standards.

### Design systems and tokens

- **[Shadcn/UI](https://ui.shadcn.com)**: component architecture, token naming, and the split between design tokens and component styles.
- **[Tailwind CSS v4](https://tailwindcss.com)**: the `@theme` directive, which expresses tokens in plain CSS without a JavaScript config layer.
- **[Radix UI](https://www.radix-ui.com)**: primitive component patterns, accessibility baselines and compound component APIs.
- **[tweakcn](https://tweakcn.com)**: perceptual color scaling, OKLCH progression and concentric radius rules for shadcn-based interfaces.
- **[TypeUI](https://typeui.sh)**: a CLI-first approach to managing design systems for AI agents, which shaped how the visual skill is structured.

### Color and perception

- **[OKLCH](https://oklch.com)**: perceptually uniform color. The palette and the contrast checks use OKLCH lightness instead of HSL, because equal numeric steps there produce equal perceived steps.
- **[Refactoring UI](https://www.refactoringui.com)** by Adam Wathan and Steve Schoger: the 60-30-10 distribution, the elevation logic and the advice against pure black.

### Layout and typography

- **[Bento Grid patterns](https://bentogrids.com)**: the modular dashboard layouts behind the BENTO preset.
- **[Modern Font Stacks](https://modernfontstacks.com)** and Google Fonts: the tested pairings in the typography table, with **[Inter](https://rsms.me/inter/)**, **[Geist](https://vercel.com/font)**, **[Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)** and **[JetBrains Mono](https://www.jetbrains.com/lp/mono/)** among the families in the pairing table.

### Accessibility

- **[WCAG 2.2](https://www.w3.org/TR/WCAG22/)**: the AA baseline for contrast, keyboard navigation and focus states.
- **[WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)**: the tool for verifying contrast ratios outside OKLCH.
