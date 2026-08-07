# Writing Soul: voice for UI copy and perennial artifacts

> Load for: UI copy, READMEs, guides, changelogs, commit messages, technical documentation.
> Triggered by: `docs:` command, or any Phase CODE task involving written content.
> Load `checklist-soul.md` alongside this file. It holds the ritual that makes these rules fire: a mental reset before each file, and a validation pass before each checkpoint.
> Instances live in `lexicon/<language>.md`. This file holds the rules, in English, and never lists words.

---

## Rule and lexicon are different things

A rule is a defect class plus the test that detects it. A lexicon is the concrete instances of that class in one language. They change on different days and they belong in different files.

|                | Rule                                         | Lexicon                                              |
| :------------- | :------------------------------------------- | :--------------------------------------------------- |
| What it is     | The defect class plus a test that detects it | The concrete instances of that class in one language |
| Where it lives | This file, English, always                   | `lexicon/<language>.md`, one file per language       |
| Changes when   | A new class is learned                       | A new instance is found                              |

A rule written as a test crosses languages. A rule written as a word does not. That is why a soul that carries its banned words inline only ever works in the language those words came from.

A project that wants a different voice from the canon swaps its lexicon and leaves the rules alone.

## Who reads what we write

Two readers share the page. The newcomer is meeting the topic for the first time and needs context to follow along. The returning reader scans for a single detail and needs the page to be skimmable. Write so both feel respected: explain calmly without condescension, stay tight without sounding curt.

## Tone by context

| Context                   | Mode              | Rule                                                                                    |
| :------------------------ | :---------------- | :-------------------------------------------------------------------------------------- |
| Chat with dev (default)   | Terse             | Dense. No pedagogy unless dev asks "explain" or "why". See `workflow.md`.               |
| Chat (pedagogical opt-in) | Pedagogical       | Technical terms with contextual translation in parentheses. Calm, inviting.             |
| Source code               | Project standards | This soul does not govern code. Follow linting and conventions.                         |
| Code comments             | Semi-pedagogical  | Expand acronyms for public APIs. No throat-clearing. Anti-patterns still apply.         |
| Perennial artifacts       | Full soul         | Active voice, no banned phrases, no false agency. Every rule below.                     |
| UI copy (product-facing)  | Full soul         | Language declared by the developer for the product. Principles below apply identically. |

## Default voice

Pedagogical, calm, inviting. Treat the reader as a peer, even when they are new to the topic. Acknowledge engineering complexity without dramatizing it. Avoid the marketing register; avoid the lecture register.

Technical terms stay in English (that is how the community speaks). On first occurrence in a document, the format depends on the kind of term:

- **Acronyms**: bold with full English expansion in parentheses, plus an optional functional gloss separated by an interpoint (`·`), never a comma. The comma reads as part of the expansion; the interpoint marks where the expansion ends and the gloss begins. Example: `**API** (Application Programming Interface)`, or `**CI/CD** (Continuous Integration/Continuous Delivery · pipeline that automates build, test, and deploy)`.
- **Non-acronym terms**: bold with a short contextual explanation. Example: `**callback** (function passed as argument, invoked later)`.
- **Headings**: short form only, no expansion. Use `## API design`, not `## API (Application Programming Interface) design`.

Later occurrences use the bare term. Code identifiers stay in backticks and are not bolded.

**Where the gloss goes.** A document that has a concepts table glosses in the table, and the prose uses the bare word. Inline glossing belongs to documents without a table. A term that carries more than one meaning is glossed in the meaning this document uses, never with a gloss borrowed from another document.

## Default structure for perennial artifacts

Perennial artifacts (READMEs, guides, technical docs, learning material) open in this sequence by default:

1. **Intro paragraph**: right after the H1, in prose. Names what the document covers and who it serves. Never put a heading immediately after the H1.
2. **Concepts table**: a `## Fundamental concepts` (or localized equivalent) section with a `| Concept | What it is |` table whenever the doc introduces three or more technical terms. Glossary first, narrative second.
3. **Body**: sections fit the document's purpose (tutorial, reference, decision record). The shape after the table is free.

Skip the concepts table only when the doc has fewer than three technical terms, or is a pure changelog or index. The intro paragraph never gets skipped.

A README opens with a banner above the H1: logo, title, tagline, badges. `writing-readme.md` holds the rules for that block, and the sequence above starts at the first paragraph under it.

## How to write

- **Active, direct sentences**. Break long ideas into short clauses. Avoid chains of "-ing" or "-ndo" forms.
- **Say it once**. State the point, then stop. Cut words that do not change the meaning. Do not restate the same idea in a second phrasing, and do not extend past what the reader needs.
- **No em dash (—)**. Use a comma, a colon, parentheses, or split into two sentences. This rule applies to the soul itself, not only to its consumers, and it applies to chat as well as to artifacts. Pick the replacement by reading the line afterwards: a colon on a line that already carries one produces `Phase: SPEC: MODE: PLANNING`, three labels where there were two, so that line takes an arrow or a comma instead.
- **Break large blocks**. A paragraph past four or five lines becomes a list, a table, or two shorter paragraphs. A bullet that runs three lines splits into sub-bullets. Walls of text bury the point.
- **Visual calm**. Sentence case headings. Bold only for technical emphasis. Emojis only when they carry semantic meaning.
- **Peer tone**. No promotional adjectives. State facts directly. When a topic is hard, name the difficulty instead of hiding it.
- **Rhythm**. Mix short observations with longer explanations. Three same-length sentences in a row read like a machine.

## Defect classes: vocabulary

Instances live in the lexicon, keyed by the class name in this table. `writing-lint.mjs` fires on these.

| Class                                  | Test that detects it                                                                        |
| :------------------------------------- | :------------------------------------------------------------------------------------------ |
| Banned adverbs                         | The word appears in the lexicon list and removing it changes nothing                        |
| Banned openers                         | The sentence opens by announcing itself instead of starting                                 |
| Banned emphasis                        | A phrase asserts that something is important, in place of showing why                       |
| Banned jargon                          | A borrowed term stands where a plain word exists                                            |
| Announcing clause                      | A clause names that a reason or a point follows, without being it                           |
| Physical metaphor for mechanics        | A physical or spatial verb has a system, a file or a value as its subject                   |
| Economic idiom as judgment             | Price, cost or payment vocabulary judges a technical decision                               |
| Container metaphor for an abstract set | A physical container noun holds things that are not physical                                |
| Dead idiom                             | A fixed expression that survives deletion with no loss                                      |
| Informal register                      | Slang lowers the register of a text meant to sound sincere                                  |
| Coined jargon                          | Search the repository and the docs for the term. Absent means it was invented while writing |
| Replaced vocabulary                    | The developer already swapped this word once, and the replacement is recorded               |

## Defect classes: form

Shape, not vocabulary, so no lexicon can hold them and they hold identically in every language. `checklist-soul.md` Part 2 runs these by hand.

| Class                                     | Test that detects it                                                                                                |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| Dramatic turn                             | A sentence exists to create a reversal, and the fact it delivers fits in the previous sentence                      |
| Binary contrast                           | "Not X. Because Y." State Y directly                                                                                |
| False agency                              | A decision, a document or a system performs a human act. Name the actor                                             |
| Personification of an artifact            | Code, an interface or a file speaks, lives, or wants something                                                      |
| Passive voice                             | The sentence has no subject performing it. Find the actor, make them act                                            |
| Vague declarative                         | "The implications are significant." Name the specific implication                                                   |
| Dramatic fragmentation                    | "[Noun]. That's it." Finish the sentence                                                                            |
| Effect closer                             | The last sentence of a section is an aphorism or a verdict. End on the last piece of information                    |
| Filler paragraph                          | Delete it and the reader loses nothing                                                                              |
| Absolute without data                     | "always", "never", "the first thing". Describe the mechanism instead                                                |
| Verbal crutch                             | The same construction repeats across the file. Found by counting, not by matching                                   |
| One concept explained three times         | The concept is defined in the table, then explained again in prose, then again in a list                            |
| Editorializing for the reader             | The text states the conclusion the reader should draw. State the fact, leave the conclusion                         |
| Invented translation                      | A gloss was written to satisfy the `**term** (translation)` shape, without a real translation behind it             |
| Attributing a preference to the developer | The text claims the developer prefers something. Valid only if he said it, the repository shows it, or he was asked |

## Formatting rules

Language-neutral, and each one was taught in review.

| Rule                          | Detail                                                                                                                                                             |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reading emphasis              | Bold the key term, backtick the identifier. One mark per term, on the occurrence where it is the subject. Plain word afterwards                                    |
| Long example                  | Configuration file, JSON-LD, sample HTML and verification scripts go inside `<details>`                                                                            |
| Counted list                  | "three habits", "three things" takes an ordered list, not bullets                                                                                                  |
| Documentation link            | Point at the section anchor, not the document root. Extract the `id` from the destination HTML and verify it exists, rather than deriving it from the heading text |
| Study figures                 | Rounded whole values, no decimal places                                                                                                                            |
| Examples in published writing | Fictional domain, author and path always. Never a real internal path, and never confirm what sits behind a restricted folder                                       |

## Delivery in a language other than English

Project artifacts (READMEs, guides, docs, skills, changelogs, commit messages) ship in English. UI copy and published writing follow whatever language the product targets, declared by the developer at the start of the task.

Switching language never relaxes a rule. The rules above are written as tests precisely so they survive the switch, and the lexicon for that language loads alongside them.

- **Concepts table**: English term first, translation in parentheses, and every row carries one.
- **Product names** are verified in the vendor's documentation for that locale. "Modo IA" and "Visões gerais criadas por IA" came from Google's own pt-BR pages, not from translating the English.
- **When the vendor does not translate**, ship a functional gloss and say so in the row. Never invent an official-looking name.
- **Never invent a translation** to satisfy the `**term** (translation)` shape. A word chosen to fill the parentheses is a defect the reader inherits, and the developer signs it.
- **The dictionary translation is not always the reader's word.** When the two differ, the reader's word wins, and the swap goes into that language's lexicon under Replaced vocabulary.

## Quick checks before delivering

Adverb? Cut. Passive voice? Find the actor. Inanimate doing a human verb? Name the person. Throat-clearing opener? Cut. Binary contrast? State Y. Three same-length sentences? Break one. Em dash (—)? Replace with comma, colon, parentheses, or split, then reread the line: a second colon on it means the wrong replacement. Vague declarative? Name the thing. Promotional adjective? Replace with a fact. Restated point? Keep one phrasing. Paragraph past five lines? Split it or make it a list. Bullet running three lines? Break into sub-bullets.
