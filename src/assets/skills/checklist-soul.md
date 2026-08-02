# Checklist Soul: the writing gate that runs before and after

> Operational companion to `writing-soul.md`. The soul holds the rules; this file holds the ritual that makes them fire.
> Load both for: any `docs:` cycle, and any Phase CODE task that writes prose.

---

## Why this file exists

A model writing prose falls back on its training default: polished sentences, balanced rhythm, a closing line that sounds like a verdict. That default survives a single reading of the rules, because reading a rule is not the same as suspending a habit. The soul states what good writing looks like. This checklist forces a stop before the habit runs.

The ritual has two halves. **Recite Part 1 before every file**, once per file, not once per cycle. **Run Part 2 after the last line of the cycle is written.**

## Fundamental concepts

| Concept          | What it is                                                                                  |
| :--------------- | :------------------------------------------------------------------------------------------ |
| **Mental reset** | Naming the training default being suspended, out loud, before the first write               |
| **Recitation**   | Emitting the checklist as text, item by item, so the gate is auditable                      |
| **Pass**         | One focused re-read of a draft hunting a single class of defect                             |
| **Lexicon**      | `lexicon/<language>.md`, the concrete instances of each defect class in one language        |
| **writing-lint** | The advisory hook that reads the lexicon, scans Markdown writes, and reports hits to stderr |

---

## Part 1: recite before writing (blocking)

Emit these items before the first `Write` or `Edit` of each file.

### Mental reset

- [ ] **Training default suspended**, and named: impressive prose, balanced rhythm, a closing line that lands. None of it ships.
- [ ] **Audience fixed**: a senior engineer explaining to the colleague at the next desk. Plain sentence, concrete example.
- [ ] **Goal fixed**: understanding on the first pass. Clarity outranks brevity, and clarity outranks elegance.
- [ ] **Delivery language fixed**, and the lexicon for it exists. A document in a language with no lexicon gets no automated gate, and Part 2 carries the whole load.

### Rule passes

Each item is one focused re-read against a section of `writing-soul.md`. Read the section, do not recall it.

- [ ] **Vocabulary pass** (§ Defect classes: vocabulary). Twelve classes, instances in the lexicon.
- [ ] **Voice pass** (§ Default voice, § How to write). Active sentences, one idea each, conclusion first, no em dash, peer tone.
- [ ] **Structure pass** (§ Default structure for perennial artifacts). Intro paragraph after the H1, concepts table at three or more technical terms, blocks broken before they become walls.
- [ ] **Formatting pass** (§ Formatting rules). Emphasis marks, long examples inside `<details>`, counted lists ordered, links pointing at a verified anchor.

### Checks the soul does not cover

These are procedural, so they live here.

- [ ] **Gloss coverage judged by the reader, not by the term's shape.** A term gets a gloss on first occurrence when it would stop a newcomer, acronym or not. Re-gloss when the term returns far from where it was introduced.
- [ ] **Link anchors are explicit and ASCII.** A heading that is a link target carries `<a id="ascii-slug"></a>` above it. An anchor generated from accented or renamed heading text breaks on the next edit.
- [ ] **Fenced code blocks stay byte-identical during a prose pass.** A prose revision that edits an example is a scope change, and it gets recorded before it happens.
- [ ] **Good examples dogfood the code style.** An example labeled Good obeys `code-style.md` in full: no logic in the `return`, blank line before the `return`, boolean prefix, no framework abbreviations.

---

## Part 2: sweep before the checkpoint (blocking)

### Sweep order

Three process rules, each one earned by shipping the defect first.

- [ ] **The sweep runs after the last line of the cycle is written**, including passages the developer requests at the end. Two classes have reappeared in prose written after their first correction, because the sweep had run before that prose existed.
- [ ] **A class found once is swept across the whole file**, with `grep`, not fixed only where it was pointed out. Every defect a developer has pointed out had a sibling in the same file, and in one cycle the sibling sat 55 lines below.
- [ ] **Cutting a section is followed by a sweep for dangling references.** "above", "below", "next to", "as follows", plus any mention that now points at nothing. The text stays grammatical and turns false, so no banlist catches it.

### Automated

- [ ] **writing-lint reported no hits** on the files written this cycle. The hook is advisory and exits zero, so a hit is silent unless it is read. Read stderr.
- [ ] **writing-lint read a lexicon at all.** A warning that no lexicon resolved means the run proved nothing.
- [ ] **Project gates green**: whatever the repo runs for lint and tests. A prose cycle still touches files the build cares about.

### Manual: one pass per form class

The hook matches instances. The classes below are shape, so they need eyes. One focused re-read each, and the first five are the ones that survived a banlist sweep that came back clean on the first pass.

- [ ] **Dramatic turn.** A sentence that exists to create a reversal. "Só que hoje existem dois topos", "uma safra de receitas", "é o mais interessante dos dois". Test: does the fact it delivers fit in the previous sentence?
- [ ] **Binary contrast.** "Not X. Because Y." Appeared three times in one cycle, two of them in prose written after the first was fixed.
- [ ] **Coined jargon.** "vizinhos da pergunta", "caminho feliz", both invented while writing. Test: search the repository and the docs. Absent means invented. Defining it in the concepts table does not legitimize it.
- [ ] **Announcing clause.** "e o motivo é honesto", "o mal-entendido aqui é comum", "repare que". Names that a reason follows without being the reason.
- [ ] **One concept explained three times.** `query fan-out` defined in the concepts table, re-explained in the callout, re-explained in the list item. **A concept is explained once**: definition in the table, plain use afterwards. Re-explaining reads as reinforcement while writing and as padding while reading.
- [ ] **Fresh metaphor.** Ask of each new paragraph: does this sentence inform, or does it only sound good? An unseen metaphor is exactly the one no lexicon holds.
- [ ] **False agency and personification.** A decision that emerges, code that speaks, a manual that builds itself. Name the actor and the mechanism.
- [ ] **Absolute without data.** "always", "never", "the first thing to go stale". Describe the mechanism instead.
- [ ] **Verbal crutch.** The same construction repeating across the file, found by counting rather than matching. One cycle carried "vale" four times in 125 lines.
- [ ] **Restated point.** The same idea in a second phrasing reads as emphasis while writing and as padding while reading. Keep one phrasing.
- [ ] **Editorializing and judging.** The text stating the conclusion the reader should draw, or ruling a project decision right or wrong. Recommendations carry the condition they apply under.
- [ ] **Preference attributed to the developer.** Valid only if he said it, the repository shows it, or he was asked. Never deduced from what would suit him.
- [ ] **Closers.** The last sentence of a section is where the training default reappears as a verdict. Cut it, and end on the last piece of information.

### Close the loop

- [ ] **Backlog updated**: what shipped, what the developer corrected along the way, what stayed open.
- [ ] **Findings promoted**: every class or instance learned this cycle went up into `writing-soul.md` or `lexicon/<language>.md`. A finding that stays in `learned.md` is a second source waiting to diverge, and `learned.md` keeps the evidence, not the canon.

---

## Language

Project artifacts ship in English: skills, guides, READMEs, changelogs, commit messages. The developer asks for another language explicitly, per task. Switching language changes the words and the lexicon that loads, and nothing else, because every rule in the soul and every pass above applies unchanged.
