# Lexicon: English

> Instances, not rules. Each `##` heading names a defect class declared in `writing-soul.md`, and each list item is one concrete instance of that class in this language.
> `writing-lint.mjs` reads this file at runtime. Adding an instance is a text edit, never a code change.

## How this file is read

Every list item is one term. An item may carry the accepted replacement after an arrow, and the hook prints it with the hit:

```
- navigate → handle
```

Matching is case-insensitive. A term that starts or ends with a letter or digit is matched on a word boundary, so `just` never fires inside `adjust`. A term that starts or ends with punctuation is matched as a plain substring, which is what phrases like `Here's the thing:` need.

A class earns a place here only when its instances are precise enough to fire without noise. Classes that need judgment, such as an absolute stated without data, stay in `checklist-soul.md` Part 2 as a human pass. An advisory hook that cries wolf gets ignored, and then it protects nothing.

## Banned adverbs

- really
- just
- literally
- genuinely
- simply
- actually
- deeply
- truly
- fundamentally
- inherently
- importantly
- crucially

## Banned openers

- Here's the thing:
- The uncomfortable truth is
- Let me be clear
- Let me walk you through
- In this section, we'll

## Banned emphasis

- Full stop.
- This matters because
- Make no mistake
- Let that sink in.

## Banned jargon

- navigate → handle
- unpack → explain
- deep dive → analysis
- game-changer → significant
- moving forward → next
- circle back → revisit
- landscape → situation
