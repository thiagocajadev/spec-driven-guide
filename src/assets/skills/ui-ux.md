# UI/UX: Design System, Presets & Writing Soul

<ruleset name="UI/UX">

> Load in **Phase CODE** when building UI surfaces, choosing design presets, writing UI copy, or producing perennial artifacts (README, docs, changelogs).

---

## Part 1: Design Thinking (Phase 0, Mandatory)

> [!IMPORTANT]
> **Phase 0 is not optional.** Complete it before writing any UI code.

### Phase 0.1: Palette Setup (First-Time Rule)

<rule name="PaletteSetup">

**On the first UI task** (no `--color-primary-*` tokens in `globals.css`), pause and offer:

```
Palette Setup Required. Choose one:
[1] Default Palette → Zinc neutrals + Blue primary (shadcn/ui compatible)
[2] Custom Palette → Guided OKLCH primary + secondary selection
```

No response or ambiguous → default to [1]. Never block work on color indecision.

#### Option 1: Default (Zinc + Blue H=250)

Use shadcn/ui built-in tokens. Extend with `--color-primary-*` (H=250) and `--color-secondary-*` (Violet H=290) using OKLCH scale below.

#### Option 2: Custom (OKLCH Guided)

Ask exactly two questions: (1) Primary Hue, (2) Secondary Hue (Enter = Split-Complementary H+150).

**Color Harmony:** Default Split-Complementary (H±150). Complementary (H+180) as accent at 10% only. Analogous (H±30) avoid for primary/secondary. Triadic: never use.

**Reference Hues (H+150):** Red→Teal-Green, Orange→Sky Blue, Yellow→Blue, Green→Pink, Teal→Rose, Blue→Yellow-Orange, Violet→Amber, Pink→Lime.

**OKLCH Progression Formula:**

| Step | L   | C    | Role               |
| ---: | :-- | :--- | :----------------- |
|   50 | 98% | 0.01 | Near-white tint    |
|  100 | 96% | 0.03 | Light surface      |
|  200 | 90% | 0.06 | Borders/dividers   |
|  300 | 82% | 0.09 | Soft accent        |
|  400 | 72% | 0.12 | Light hover        |
|  500 | 60% | 0.15 | **Primary action** |
|  600 | 50% | 0.14 | Hover on 500       |
|  700 | 40% | 0.12 | Strong accent      |
|  800 | 25% | 0.09 | Dark surface       |
|  900 | 15% | 0.05 | Near-black tint    |

**Vibe:** Vibrant = C at 0.15 for 400-600. Muted = C at 0.08 across all. Default Muted for SaaS.

</rule>

### Phase 0.2: Elevation Stack

<rule name="ElevationStack">

Dark mode surfaces get **lighter** as they approach the user (physical elevation). Inverting light values = "Floating Darkness" failure.

| Layer | Role     | Light (Zinc)     | Dark (Zinc) |
| :---- | :------- | :--------------- | :---------- |
| S0    | Page bg  | 50 (L≈98%)       | 950 (L≈15%) |
| S1    | Sidebars | 100 (L≈96%)      | 900 (L≈20%) |
| S2    | Cards    | 50 + shadow      | 800 (L≈25%) |
| S3    | Modals   | 50 + deep shadow | 700 (L≈30%) |

Both themes carry the hierarchy. No pure white (`#FFFFFF`) in light, no pure black (`#000000`) in dark. The lightest surface is Zinc 50 (L≈98%), the darkest is Zinc 950 (L≈15%). Light-mode elevation reads through shadow and subtle tint steps, never by reaching pure white.

**Hover Law:** Light mode goes darker (L-5%). Dark mode goes lighter (L+10%).

> Implements **FigureGround** (Part 4.0).

</rule>

### Phase 0.3: Color Distribution (60-30-10)

<rule name="ColorDistribution">

| %   | Role                        | Tokens                                 |
| :-- | :-------------------------- | :------------------------------------- |
| 60  | Neutral (bg, text, borders) | `zinc-*`, `bg-background`, `bg-muted`  |
| 30  | Primary (interactive)       | `primary-500` on buttons, links        |
| 10  | Secondary (highlights)      | `secondary-500`, badges, notifications |

Violations: Secondary >10% → reduce. Primary on backgrounds → use neutral. No secondary visible → add accent.

</rule>

### Phase 0.4: Aesthetic Direction

<rule name="AestheticDirection">

Define tone: _"This interface is [adjective] for [audience] who need [outcome]."_ Then commit to **one preset** (Part 3).

Name one **differentiator** (memorable element): typographic pairing, layout break, micro-interaction, or color moment. This constrains implementation.

</rule>

### Phase 0.5: Typography

<rule name="TypographyCommitment">

**2-Font Rule:** Exactly 1 Display (headings, >=20px) + 1 Body (UI text, <=16px). Code font (`JetBrains Mono`/`Fira Code`) in `<code>`/`<pre>` only, and does not count.

| Tone            | Display               | Body      | Preset fit          |
| :-------------- | :-------------------- | :-------- | :------------------ |
| Precision/Dev   | `JetBrains Mono`      | `Inter`   | MONO, CLEAN         |
| Premium/SaaS    | `Bricolage Grotesque` | `Inter`   | GLASS, BENTO        |
| Editorial       | `Playfair Display`    | `Lora`    | PAPER               |
| Bold/Expressive | `Syne`                | `DM Sans` | NEOBRUTALISM, BENTO |
| Corporate       | `Plus Jakarta Sans`   | `Inter`   | CLEAN, BENTO        |
| Startup/Modern  | `Outfit`              | `Geist`   | BENTO, CLEAN        |
| Luxury/Refined  | `Cormorant Garamond`  | `Jost`    | GLASS, PAPER        |

Register as `--font-display` and `--font-body` in `@theme`. Use `font-display` for h1-h3, `font-body` for everything else.

**Anti-patterns:** Two serifs together. Two similar-weight sans. Display at body size. More than 2 families in layout. Never `Arial`/`Roboto`/`system-ui` as Display.

</rule>

### Phase 0.6: Component Nesting

<rule name="Nesting">

**Concentric Radius:** `Inner Radius = Outer Radius - Padding`. Outer `rounded-2xl` + `p-4` → Inner `rounded-none`. Outer `rounded-2xl` + `p-2` → Inner `rounded-lg`.

**Border Hierarchy:** S1/S2 → `border-border/40` (subtle). S2/Action → `border-primary/20` (contextual).

</rule>

### Phase 0.7: Dark Theme Calibration

<rule name="DarkThemeCalibration">

Dark theme is not color inversion. It is a re-optimized palette for low-light perception.

**Surfaces: use the Zinc elevation scale, never pure black:**

| Token           | Zinc step | OKLCH approx | Role            |
| :-------------- | :-------- | :----------- | :-------------- |
| `bg-background` | 950       | L≈15%        | Page base (S0)  |
| `bg-muted`      | 900       | L≈20%        | Sidebars (S1)   |
| `bg-card`       | 800       | L≈25%        | Cards (S2)      |
| `bg-popover`    | 700       | L≈30%        | Modals (S3)     |
| hover state     | 800→750   | L+5%         | Apply Hover Law |

Zinc 950 (`oklch(15% 0.005 285)`) already avoids pure black, so never override with `#000000`.

**Chroma: reduce brand colors for dark backgrounds:**

Apply C×0.80–0.90 to all primary/secondary OKLCH tokens in dark mode. Full chroma from light theme reads as "neon" on dark surfaces. Exception: NEOBRUTALISM preset (intentional high-chroma).

**Text: opacity over zinc foreground tokens:**

| Role      | Opacity on white | Token equivalent           |
| :-------- | :--------------- | :------------------------- |
| Primary   | 87% (0.87)       | `text-foreground`          |
| Secondary | 65% (0.65)       | `text-muted-foreground`    |
| Disabled  | 45% (0.45)       | `text-muted-foreground/45` |

Avoid opacity below 40%: text disappears against dark zinc surfaces.

**Shadows and overlays:**

- Reduce shadow spread and opacity in dark mode (box-shadow fades into dark bg).
- Avoid `rgba(0,0,0,0.6)` overlays, which accumulate with dark surfaces and create "black hole" regions. Use `bg-background/70` backdrop instead.
- Elevation conveys depth via lighter surfaces, not stronger shadows.

**Perceptual calibration (mandatory after applying rules):**

| Symptom        | Fix                                    |
| :------------- | :------------------------------------- |
| Feels heavy    | Lighten surfaces one step (L+5%)       |
| Colors vibrate | Reduce chroma further (C×0.75)         |
| Looks faded    | Increase foreground contrast (L-delta) |

Perception beats math. Validate visually after applying tokens, adjusting manually if WCAG passes but readability fails.

</rule>

### Phase 0.8: Light Theme Calibration

<rule name="LightThemeCalibration">

Light theme is not "default with no dark class". It gets the same surface discipline as dark: a graded Zinc scale, never pure white.

**Surfaces: use the Zinc scale, never pure white:**

| Token           | Zinc step | OKLCH approx | Role           |
| :-------------- | :-------- | :----------- | :------------- |
| `bg-background` | 50        | L≈98%        | Page base (S0) |
| `bg-muted`      | 100       | L≈96%        | Sidebars (S1)  |
| `bg-card`       | 50        | L≈98%        | Cards (S2)     |
| `bg-popover`    | 50        | L≈98%        | Modals (S3)    |

Zinc 50 (`oklch(98% 0.002 285)`) is the ceiling; never override with `#FFFFFF`. Cards and modals separate from the page through shadow and border, not a brighter fill.

**Elevation via shadow:** surfaces cannot go lighter than the Zinc 50 ceiling, so depth reads through soft shadows (S2 `shadow-sm`, S3 `shadow-md`).

**Text: never pure black:** primary text is Zinc 900 (L≈20%), not `#000000`. Secondary Zinc 600, disabled Zinc 400. Pure black on near-white reads harsh and raises glare.

**Borders:** `border-border` (Zinc 200) for structure; `border-border/60` for subtle grouping. Hold the WCAG contrast floor (Part 4).

> Peer of Phase 0.7. Same FigureGround law, opposite luminance direction.

</rule>

### Design Contract (Required Before Code)

Before writing UI code, declare:

```
Design Contract
──────────────────
Palette:       [Default Zinc+Blue | Custom H=___ + H=___]
Preset:        [BENTO | GLASS | CLEAN | MONO | NEOBRUTALISM | PAPER]
Tone:          "[adjective] for [audience] who need [outcome]"
Differentiator: [the one memorable element]
Typography:    [Display font] + [Body font]
```

Cannot fill Palette and Preset → ask before generating code.

---

## Part 2: Component Architecture

> Styling: Tailwind v4 + shadcn/ui. Utility-first CSS. Icons: **Lucide** (`lucide-react`), a single icon library per project.

### The ViewModel Law

<rule name="ViewModelLaw">

1. Components are **declarative** (render only)
2. UI state, mapping, conditional logic → ViewModel hook (`useXxxVM`)
3. Pure transformations live outside components
4. Business/domain logic MUST NOT live in ViewModel
5. Trivial components (<10 lines, no logic) skip ViewModel

**ViewModel pattern:** Component receives props → calls `useXxxVM(props)` → VM returns derived state → Component renders. VM handles: UI state (loading/empty/error), derived state (isActive→color), mapping (API→UI). Domain logic stays in services. Formatting stays in utils.

**States are first-class:** Every component exposes loading, empty, error, disabled as props, not afterthought branches.

**Anti-patterns:** API calls in components. ViewModel as dumping ground. Raw backend data in UI. Inline business ternaries. Scattered styling logic.

</rule>

### State Management

<rule name="StateManagement">

| State type        | Mechanism               | When                                |
| :---------------- | :---------------------- | :---------------------------------- |
| UI-only, isolated | `useState` / local hook | Modals, toggles, form state         |
| Shared UI         | React Context           | Theme, sidebar: no business logic   |
| Server/remote     | React Query / SWR       | All API data: caching, revalidation |
| Global app        | Zustand                 | Client-side global (session, prefs) |

Never call APIs directly in components. Never use Context for server data. Prop drilling up to 2 levels is fine.

</rule>

### Spacing (L1-L4)

<rule name="SpacingHierarchy">

| Level | Category | Values      | Usage                        |
| ----: | :------- | :---------- | :--------------------------- |
|    L1 | Internal | p-1, gap-2  | Button padding, icon spacing |
|    L2 | Siblings | p-4, gap-4  | Elements inside cards        |
|    L3 | Sections | p-8, gap-12 | Blocks, grid spacing         |
|    L4 | Page     | py-24, px-6 | Page breathing space         |

> Implements **Proximity** (Part 4.0).

</rule>

---

## Part 3: Presets

> Phase 0 must be completed before selecting a preset.

### Preset Catalog

Each preset defines: Typography, Surface, Borders, Radius, States, Elevation, Density.

| Preset           | Personality          | Surface                       | Borders                      | Radius            | Hover/Focus                                                     | Default Palette     |
| :--------------- | :------------------- | :---------------------------- | :--------------------------- | :---------------- | :-------------------------------------------------------------- | :------------------ |
| **BENTO**        | Modular dashboard    | `bg-card` (S2)                | `border-primary/20`          | `rounded-xl/2xl`  | `border-primary/20` · `ring-2 ring-primary`                     | Zinc + Blue H=250   |
| **GLASS**        | Layered depth        | `bg-card/60 backdrop-blur-xl` | `border-border/30`           | `rounded-2xl`     | `bg-card/80` · `ring-2 ring-white/20`                           | Zinc + Violet H=290 |
| **CLEAN**        | Professional minimal | `bg-card`                     | `border-border/50`           | `rounded-lg`      | `bg-muted/10` · `ring-2 ring-primary`                           | Zinc + Blue/Teal    |
| **MONO**         | Developer-centric    | `bg-background`               | `border-border/80`           | `rounded-none/sm` | `bg-muted/30` · `outline outline-1`                             | Zinc monochromatic  |
| **NEOBRUTALISM** | Bold anti-corporate  | Flat colors                   | `border-2 border-foreground` | `rounded-lg`      | `translate-x-[2px] translate-y-[2px] shadow-none` · `outline-2` | High-Chroma C>=0.18 |
| **PAPER**        | Warm editorial       | `bg-card`                     | `border-border/60`           | `rounded-lg`      | `shadow-sm→hover:shadow-md` · `ring-1 ring-muted`               | Zinc + Amber H=80   |

BENTO grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,1fr)]`. NEOBRUTALISM shadow: `shadow-[4px_4px_0px_0px]`.

### Composition Rules

<rule name="CompositionModel">

Declare: Layout (`default | bento`) + Skin (`clean | glass | brutalism | paper | mono`) + Accent (`none | serif | mono`).

**Hard rules:** Never mix skins. Accent changes only typography. Layout is independent.

**Safe combos:** `bento+glass` (premium), `bento+clean` (SaaS), `default+paper` (editorial), `default+mono` (dev tools), `bento+brutalism` (experimental).

**Nesting:** Follow Elevation Stack. Base→S0, Container→S1/S2, Child→one layer up. Apply border rules from Phase 0.2.

</rule>

---

## Part 4: UX Quality Standards

### Part 4.0: Gestalt Foundations

> Eight perceptual laws that explain _why_ the rules below work. Apply when two layouts pass token rules equally: the law tells you which one the brain will read correctly. Each rule below points to the existing tokens / presets it governs.

<rule name="Proximity">

**Proximity**: close elements read as one group; distance separates groups. Apply via Spacing L1–L4 (L1/L2 within a group, L3/L4 between groups). Anti-pattern: uniform gaps everywhere, so no boundary cues.

</rule>

<rule name="Similarity">

**Similarity**: shared shape / color / size / weight signals shared kind. One semantic token per state, one icon family per project, matching variant per action class. Anti-pattern: identical primary button for save vs delete.

</rule>

<rule name="Continuity">

**Continuity**: eye follows the smoothest line. Align edges to a grid; read order = tab order = DOM order. Break alignment only to mark a phase change. Anti-pattern: zig-zag card grids without anchor column.

</rule>

<rule name="Closure">

**Closure**: the mind completes implied shapes from partial cues. Use spacing and alignment to define boundaries before adding borders or backgrounds. Subtract chrome before adding it. Anti-pattern: border on every cluster when whitespace already groups them.

</rule>

<rule name="FigureGround">

**FigureGround**: foreground emerges from a recessive background. Drives Elevation Stack S0–S3 (lighter surface = higher) and dark-mode chroma reduction (C×0.80–0.90). One focal element per zone. Anti-pattern: equal-elevation modal over content; competing focal points.

</rule>

<rule name="CommonRegion">

**CommonRegion**: a bounded container groups its contents across distance. Cards, sections, fieldsets, panels. Pick this over Proximity when grouping must survive responsive reflow. Anti-pattern: proximity-only grouping that breaks below the `md` breakpoint.

</rule>

<rule name="CommonFate">

**CommonFate**: items moving together belong together. Drives staggered entry (40–80ms), coordinated expand/collapse, list reorder transitions. Independent timing on a grouped set reads as unrelated. Anti-pattern: each card animating on its own clock during a single state change.

</rule>

<rule name="Pragnanz">

**Prägnanz** (good figure): the simplest interpretation wins. Caps the system: 60-30-10 distribution, 2-Font Rule, 3 hierarchy layers, 4 elevation steps. Each new variant must justify itself against the simplest reading. Anti-pattern: five typefaces, seven elevations, three accents, all of them "necessary".

</rule>

---

### Foundational Principles

- **Solution-first**: Every visual decision traces to a user outcome. No justification → remove it.
- **Visual hierarchy**: One primary focus, one secondary zone, one tertiary layer per screen. Weight/scale/contrast carry hierarchy, not color alone.
- **Foundations before features**: Tokens (color, spacing, radius, typography) must exist before components are styled. No magic values.
- **Component system**: Every element is a primitive or composition of primitives. No half-componentized regions.
- **Flow-driven layout**: Read order, tab order, DOM order must agree. Grid serves the flow.
- **Light and dark are peers**: Both ship from day one. Same components, same token names.

### Mobile-First

<rule name="MobileFirst">

Design starts at mobile (<=640px). Desktop extends, not overrides. Touch target min 44x44px. Respect `env(safe-area-inset-*)`. No hover-only interactions.

</rule>

### Interaction & Motion

<rule name="InteractionMotion">

Entry animations: max 8px translate, 120-200ms, stagger 40-80ms. Easing: `ease-out` or `cubic-bezier(0.16, 1, 0.3, 1)`. Hover feedback within 100ms. Respect `prefers-reduced-motion`.

> Stagger and coordinated transitions implement **CommonFate** (Part 4.0).

</rule>

### Visual Resilience (States)

<rule name="States">

Every interactive UI implements: **Loading** (structural skeleton), **Empty** (message + optional action), **Error** (message + retry), **Disabled** (distinct, no pointer events). "Handle it later" = never handled.

</rule>

### Accessibility

<rule name="Accessibility">

- Semantic elements: `<button>`, `<a>`, `<input>`. WCAG AA is the floor.
- Keyboard: all actions via Tab, logical order, visible focus (`ring`/`outline`).
- Contrast: 4.5:1 normal text, 3:1 large. OKLCH L-delta >= 40pt (text vs bg). Secondary text on S1/S2: L-delta >= 25pt.
- No color dependency: information also conveyed by text, icon, position, or pattern.
- ARIA only when necessary; must reflect real state.
- Body text: 45-75 chars line length, min 16px, line-height 1.5-1.7.

</rule>

### Performance

<rule name="Performance">

Feedback within 100ms. Animations at 60fps, no layout thrashing. Avoid unnecessary re-renders. Lazy load non-critical content.

</rule>

### Consistency

<rule name="Consistency">

Same interaction → same response. Same component → same states everywhere. No per-screen behavior changes.

</rule>

### Structured Components

Decompose multi-stage flows via **steps** / **tabs** / **modals**. >3 concerns without decomposition = layout failure.

- **Steps**: linear progress + position indicator.
- **Tabs**: peer content; URL-synced for shareable state.
- **Modals**: close on Esc + backdrop + explicit cancel.
- **Progression**: user knows where they are + what's next (breadcrumbs/counters/CTA).
- **Error Prevention**: destructive actions need typed intent or second tap.

### Anti-Patterns (UI/UX)

- **Information overload** → hierarchy + drill-down.
- **Uncontrolled tables** → paginate + filter at >25 rows.
- **Visual noise** → respect 60-30-10.
- **Decorative motion** → remove if not communicating state.
- **Fixed-layout bias** → fr/auto/tokens over pixels.
- **Platform bias** → mobile-first + cross-platform primitives.

---

## Part 5: Writing Soul (UI Copy & Perennial Artifacts)

> Load `.ai/skills/writing-soul.md` (rules) and `.ai/skills/checklist-soul.md` (ritual) for all non-code writing: UI copy, READMEs, changelogs, guides, commit messages.

</ruleset>
