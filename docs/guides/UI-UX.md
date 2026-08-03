# UI/UX System — Reader Overview

This page is a high-level tour of how `sdg-agents` handles UI/UX. It is for readers who want to understand **what the system does and where it comes from**, not for agents executing tasks.

The enforceable rules live in a single file — [`.ai/skills/ui-ux.md`](../../src/assets/skills/ui-ux.md). Agents load it on demand in Phase CODE when a task touches a visual surface. Everything below is a narrated map of that file, plus the external research that shaped it.

---

## Why a single UI/UX skill

The most common failure mode in AI-generated UI is aesthetic incoherence: markup that compiles and renders, but produces flat, noisy, or inconsistent interfaces. The agent knows how to emit components; without constraints it makes arbitrary choices about color, elevation, typography, and spacing.

`ui-ux.md` exists to remove that ambiguity. It defines a small number of non-negotiable contracts — a palette, a preset, a tone, a typography pair, an elevation stack — and makes the agent declare them **before** writing any code. If the contract cannot be filled, the agent asks instead of guessing.

---

## What the skill covers

The skill is organized top-down, from principle to execution:

| Section                             | Scope                                                                                                  |
| :---------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Part 0 — Visual Architecture**    | The WHY. Foundational stance, interface structure, theme/depth philosophy, accessibility as default.   |
| **Part 1 — Design Thinking**        | Phase 0 contract: palette setup (OKLCH), elevation stack (S0–S3), 60-30-10 distribution, typography.   |
| **Part 2 — Component Architecture** | ViewModel pattern, state management strategy, spacing hierarchy (L1–L4), code conventions.             |
| **Part 3 — Presets**                | Complete visual contracts: BENTO, GLASS, CLEAN, MONO, NEOBRUTALISM, PAPER. One per project, no mixing. |
| **Part 4 — UX Quality Standards**   | Mobile-first, motion, visual resilience (loading/empty/error/disabled), accessibility, performance.    |
| **Part 5 — Writing Soul**           | Voice and tone for UI copy, READMEs, changelogs, commit messages.                                      |

---

## Core ideas worth knowing

### The Design Contract

Before any UI code is written, the agent declares:

```
🎨 Design Contract
─────────────────────────────────
Palette:        [Default Zinc+Blue | Custom H=___ + H=___]
Preset:         [BENTO | GLASS | CLEAN | MONO | NEOBRUTALISM | PAPER]
Tone:           "[adjective] for [audience] who need [outcome]"
Differentiator: [the one memorable element]
Typography:     [Display font] + [Body font]
─────────────────────────────────
```

This single block is the aesthetic equivalent of the SPEC phase — no code without it.

### The Elevation Stack (S0–S3)

Surface depth reflects physical elevation, not arbitrary color. Closer-to-user surfaces get lighter in dark mode and stronger shadows in light mode. Levels are never skipped, and interactive states always elevate by one step.

```
S0 → page background
S1 → sections, sidebars
S2 → cards, floating elements
S3 → modals, tooltips, hover states
```

The rule prevents "floating darkness" — the dark-mode failure mode where inverted values produce a flat, unreadable surface.

### Presets as full design languages

A preset is not a theme. It is a complete visual contract: typography, surface tones, borders, radius, density, state styles, and elevation rules. Mixing presets is prohibited because each one encodes a different answer to the same questions.

| Preset           | Personality                   | Default palette                 |
| :--------------- | :---------------------------- | :------------------------------ |
| **BENTO**        | Modular dashboard             | Zinc + Blue H=250               |
| **GLASS**        | Layered, depth-driven         | Zinc + Violet H=290             |
| **CLEAN**        | Professional, high whitespace | Zinc + Blue H=250 or Teal H=200 |
| **MONO**         | Developer-centric             | Zinc only (monochromatic)       |
| **NEOBRUTALISM** | Bold, high-contrast           | Any high-chroma primary         |
| **PAPER**        | Warm, editorial               | Zinc + Amber H=80               |

### ViewModel pattern

Components render; ViewModels decide. UI state, derived values, and mapping live in a hook; business rules live in the domain layer; formatting lives in utils. Components stay declarative and testable.

---

## Customizing the system

`sdg-agents` does not ship a CLI subcommand for custom presets or voices. The single-source-of-truth governance model is intentional: one canonical `ui-ux.md` that teams extend by **pasting skill content directly into their agent as a prompt** — the same pattern [`docs/reference/REFERENCES.md`](../reference/REFERENCES.md) uses to document external influences.

If you want a different preset, tone, or typographic voice, author a skill fragment and feed it to the agent at session start. No fork, no flag, no subcommand.

---

## External research and influences

The UI/UX skill is built on public research and open-source work. The items below shaped specific parts of the system and are worth reading if you want the full context.

### Design systems and tokens

- **[Shadcn/UI](https://ui.shadcn.com)** — component architecture, token naming, and the distinction between design tokens and component styles. The backbone of how we structure surfaces and states.
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first styling and the `@theme` directive that lets us express tokens in pure CSS without a JS config layer.
- **[Radix UI](https://www.radix-ui.com)** — primitive component patterns, accessibility baselines, and compound component APIs.
- **[tweakcn](https://tweakcn.com)** — perceptual color scaling, OKLCH progression, and visual tuning for shadcn-based interfaces.

### Color and perception

- **[OKLCH and the CIE Lab space](https://oklch.com)** — perceptually uniform color. The palette generator and contrast checks use OKLCH Lightness deltas instead of HSL because equal numeric steps produce equal perceived steps.
- **[Refactoring UI](https://www.refactoringui.com)** by Adam Wathan and Steve Schoger — the foundation for the 60-30-10 distribution, elevation logic, and the "don't use pure black" principle.

### Layout, density, and typography

- **[Bento Grid patterns](https://bentogrids.com)** — modular dashboard layouts that inspired the BENTO preset.
- **[Modern Font Stacks](https://modernfontstacks.com)** and Google Fonts — the typographic pairings in Part 1 are drawn from tested combinations in shipped products.
- **[Inter](https://rsms.me/inter/)**, **[Geist](https://vercel.com/font)**, **[Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)**, **[JetBrains Mono](https://www.jetbrains.com/lp/mono/)** — the default font families referenced in the pairing table.

### Accessibility

- **[WCAG 2.2](https://www.w3.org/TR/WCAG22/)** — the AA baseline for contrast, keyboard navigation, and focus state requirements.
- **[WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)** — the tool referenced for verifying contrast ratios on legacy color spaces.

### AI agent ecosystem

- **[UI/UX Pro Max Skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** — advanced design tokens and aesthetics research for AI coding agents. Shaped the premium look of the GLASS and BENTO presets.
- **[TypeUI](https://typeui.sh)** — a CLI-first approach to managing design systems for AI agents; influenced how we structure visual skills.

---

## Related docs

- [Engineering Constitution](../concepts/CONSTITUTION.md) — the philosophical principle of Visual Excellence is what `ui-ux.md` operationalizes.
- [Spec-Driven Development Guide](../concepts/SPEC-DRIVEN-DEV-GUIDE.md) — how the UI/UX skill plugs into the 5-phase cycle.
- [Credits and Philosophies](../reference/REFERENCES.md) — the broader influences behind the whole project, beyond UI/UX.
