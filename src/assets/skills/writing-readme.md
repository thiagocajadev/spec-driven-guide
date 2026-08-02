# Writing README: the banner above the first paragraph

> Load for: any `docs:` cycle that touches a README, alongside `writing-soul.md` and `checklist-soul.md`.
> The soul governs every line of prose in the file. This skill governs the block above the first paragraph, which the soul does not describe.
> The shape below was derived from repositories that already converge on it.

---

A README opens with a centered HTML block that markdown alone cannot express. Part 1 states the rules for that block. Everything under it is prose, and every rule in the soul applies to that prose unchanged.

## Fundamental concepts

| Concept               | What it is                                                                              |
| :-------------------- | :-------------------------------------------------------------------------------------- |
| **Banner**            | The centered `<div>` above the first paragraph: logo, title, tagline, live link, badges |
| **Tagline**           | The one sentence under the title saying what the project is and who it serves           |
| **Badge row**         | The line of `shields.io` images reporting release, build status, stack and license      |
| **Live link**         | The line pointing at the deployed address, written only when the project is published   |
| **Translated README** | `README.<language-tag>.md` at the repository root, linked from the tagline              |

---

## Part 1: the banner

### Skeleton

<details>
<summary>Full banner, ready to fill in</summary>

<!-- prettier-ignore -->
```html
<div align="center">
  <img src="<logo-path>" alt="<Project>" width="360" height="360">
  <h1 align="center">Project Name</h1>
  <p align="center">
    One sentence saying what this is and who it serves.<br>
    <a href="README.pt-BR.md">Versão em Português (Brasil)</a>
  </p>
  <p align="center">
    Read it live at <a href="https://example.org">example.org</a>
  </p>
  <a href="https://www.npmjs.com/package/example-package"><img src="https://img.shields.io/npm/v/example-package?style=flat-square&logo=npm&color=cb3837" alt="npm version" /></a>
  <a href="https://github.com/example-owner/example-package/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/example-owner/example-package/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI" alt="CI status" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-24%20LTS-brightgreen?style=flat-square&logo=nodedotjs" alt="Node 24 LTS" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License: ISC" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-keep%20a%20changelog-f5a623?style=flat-square" alt="Changelog" /></a>
</div>

<br>
```

</details>

One badge per line, whatever the line length. A formatter that wraps the row breaks the `<a><img></a>` pairing on sight, so the block carries `<!-- prettier-ignore -->` above it here and deserves the same guard wherever it is copied.

### Rules

| Element     | Rule                                                                                                                      |
| :---------- | :------------------------------------------------------------------------------------------------------------------------ |
| Logo        | Square, 360 to 640 px, with `width` and `height` both set. A missing dimension lets the page reflow while the image loads |
| Title       | Inside the banner as `<h1 align="center">`. A markdown `#` above the block leaves the title outside the centering         |
| Tagline     | One sentence, then `<br>`, then the link to the translated README, all in one `<p align="center">`                        |
| Live link   | Its own `<p align="center">`, written only when the project is published somewhere                                        |
| Badges      | `shields.io`, `style=flat-square`, `logo=` set, and each badge wrapped in an `<a>` that opens what the badge reports      |
| Badge order | Identity and status, then stack, then meta. The three groups below                                                        |
| Closing     | `</div>`, then a bare `<br>`. Without the `<br>` the first paragraph sits flush against the badges                        |

### Badge order

Three groups, in this order:

1. **Identity and status**: release or published version, downloads, CI status.
2. **Stack**: runtime, framework, language, each carrying the major version the project runs.
3. **Meta**: license, changelog, compatibility claims.

Each badge points at the source of what it reports: the package page, the workflow run, the license file. A badge with no destination leaves the reader a number they cannot check.

### Variant: the stack table

A repository documenting many technologies wraps a flat badge row over several lines, and the row stops being scannable somewhere past a dozen badges. The alternative is a table, one row per area, badges grouped inside the cell:

<details>
<summary>Stack table, for documentation repositories</summary>

```markdown
| Area         | Stack                                                                     |
| :----------- | :------------------------------------------------------------------------ |
| **Frontend** | [![HTML](https://img.shields.io/badge/HTML-E34F26?logo=html5)](docs/html) |
| **Backend**  | [![Go](https://img.shields.io/badge/Go-00ADD8?logo=go)](docs/go)          |
```

</details>

The banner keeps the logo, the title and the tagline. Only the badge row moves into the table, and each badge still links to the section it reports.

### Where the translated README lives

`README.<language-tag>.md` at the repository root, with an IETF tag: `README.pt-BR.md`, `README.es.md`. The root listing puts it next to `README.md`, where a reader finds it without following the banner link.

A translation carries the same banner with the tagline written in its language, and links back to `README.md` on the same line. The rules in `writing-soul.md` § Delivery in a language other than English apply to everything under the banner.

## Part 2: the content below the banner

The soul applies with no exception. Three of its rules decide how a README reads, so they are restated here:

- **Intro paragraph right after the banner**, with no heading between them. It says what the project is and who it serves, in prose.
- **The two readers named in the intro.** Write who reads what: the developer meeting the project for the first time reads from the top, and the contributor changing it reads from the local setup section down. Each one then knows which sections are theirs.
- **Concepts table** at three or more technical terms, as `## Fundamental concepts`, before the narrative sections.

The sections after that follow the project: install and commands for a CLI, routes and local development for a site, a reading order for a guide.

## Quick checks before delivering

Logo carries `width` and `height`? Title inside the banner as `<h1 align="center">`? Tagline one sentence, with the translation link after the `<br>`? Live link present only if the project is published? Every badge inside an `<a>` pointing at what it reports? Badge groups in the order identity, stack, meta? A bare `<br>` after `</div>`? First paragraph directly under the banner, no heading between? Both readers named? Concepts table there once three technical terms appear?
