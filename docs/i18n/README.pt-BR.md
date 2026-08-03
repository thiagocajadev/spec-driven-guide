<div align="center">
  <img src="https://raw.githubusercontent.com/thiagocajadev/sdg-agents-cli/main/docs/img/sdg-agents-icon-light.svg" alt="SDG Agents" width="480" height="480" style="border-radius: 1rem;">
  <h1 align="center">Spec-Driven Guide — Agents</h1>
  <p align="center">
    Um CLI (Command Line Interface · interface de linha de comando) que instala um conjunto de instruções para agentes de IA no seu projeto.<br>
    <a href="../../README.md">Read in English</a>
  </p>
  <p align="center">
      Leia o manifesto e o guia visual em <a href="https://specdrivenguide.org">specdrivenguide.org</a>
  </p>
  <a href="https://www.npmjs.com/package/sdg-agents"><img src="https://img.shields.io/npm/v/sdg-agents?style=flat-square&logo=npm&color=cb3837" alt="versão npm" /></a>
  <a href="https://www.npmjs.com/package/sdg-agents"><img src="https://img.shields.io/npm/dm/sdg-agents?style=flat-square&logo=npm&color=cb3837" alt="downloads npm" /></a>
  <a href="https://github.com/thiagocajadev/sdg-agents-cli/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/thiagocajadev/sdg-agents-cli/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI" alt="status do CI" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-24%20LTS-brightgreen?style=flat-square&logo=nodedotjs" alt="Node 24 LTS" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License: ISC" /></a>
  <a href="https://agents.md"><img src="https://img.shields.io/badge/AGENTS.md-compat%C3%ADvel-6e56cf?style=flat-square" alt="compatível com AGENTS.md" /></a>
  <a href="../../CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-keep%20a%20changelog-f5a623?style=flat-square" alt="Changelog" /></a>
</div>

<br>

`sdg-agents` instala arquivos de instrução em markdown no seu projeto. Agentes de IA (Claude Code, Cursor, Windsurf, Copilot, Codex e outros) leem esses arquivos e seguem o protocolo em cada tarefa.

> **Nota:** Se o seu agente não carregar as regras sozinho, cite o `AGENTS.md` no início da sessão.

O conjunto de instruções cobre:

- **Protocolo de trabalho**: um ciclo de 5 fases (SPEC → PLAN → CODE → TEST → END). Ele traz um **Work Checklist** (lista de verificação que o agente recita antes de escrever código) e um **Circuit Breaker** (disjuntor · para o agente após 3 tentativas na mesma falha). Você aprova SPEC e PLAN antes de qualquer linha ser escrita.

- **Estilo de código e quality gates** (barreiras de qualidade): uma regra só, o `WorkChecklist` em `code-style.md`. Ela se divide em itens de Intent (intenção · recitados ao entrar na fase CODE) e de Form (forma · verificados na fase TEST).

- **Skills sob demanda**: cada skill (habilidade · um arquivo de regras sobre um assunto) carrega somente quando o ciclo precisa dela. Há skills para code style, testes, segurança, API, acesso a dados, observabilidade, CI/CD, cloud, SQL, UI/UX, revisão, performance e modelagem de domínio.

- **Contexto de stack dinâmico**: o ciclo `land:` pergunta o seu stack (o conjunto de linguagens, runtimes e frameworks do projeto) e escreve `.ai/backlog/stack.md`. A fase CODE lê esse arquivo como fonte única de verdade. Não há catálogo de linguagens para manter.

- **Compatível com qualquer agente**: um `AGENTS.md` na raiz do repositório, onde Codex, Cursor e os demais já procuram. Um arquivo escrito por você nunca é sobrescrito.

- **Memória entre sessões**: a pasta `.ai/backlog/` (lista de trabalho e memória do projeto) guarda o resumo, o stack, o estado das tarefas e o conhecimento que o time acumulou. Um **Impact Map** (mapa de impacto) lista os arquivos que o ciclo atual precisa ler.

- **Catálogo de tooling inerte**: um pacote de ferramentas copiado em `.ai/tooling/`, com nada ligado por padrão. Nenhum `package.json` editado, nenhum `.husky/` criado, nenhuma dependência instalada. Você liga o que quiser, quando quiser.

---

## Início Rápido

Requer **Node.js 24 LTS** ou mais novo, a linha em que o CLI é construído e testado.

```bash
npx sdg-agents
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/sdg-agents-cli/main/docs/img/sdg-agents-menu-v2.png" alt="Spec Driven Guide CLI em ação" /></kbd>
</p>

O assistente interativo pede o **flavor** (sabor · o padrão estrutural que o projeto segue). O stack vem depois, pelo ciclo `land:`, porque você declara melhor com o projeto já definido. Para instalar sem perguntas:

```bash
# Instalação sem prompts (flavor lite + stack.md placeholder)
npx sdg-agents init --quick

# Vertical Slice — qualquer stack
npx sdg-agents init --flavor vertical-slice

# MVC — qualquer stack
npx sdg-agents init --flavor mvc
```

Depois de instalar, abra o chat do agente e escreva `land: <visão>`. O agente pergunta o stack, escreve `.ai/backlog/stack.md` e monta a primeira lista de tarefas.

---

## O Que É Instalado

Após rodar `init`, seu projeto recebe:

```
seu-projeto/
├── AGENTS.md                    ← Ponto de entrada + registro de skills (canônico)
├── CLAUDE.md                    ← Ponteiro fino, carregado pelo Claude Code
├── .ai/                         ← Conjuntos de instruções (commitado)
│   ├── skills/                  ← Skills de engenharia (carregadas por fase do ciclo)
│   │   ├── code-style.md        ← Estilo + Work Checklist (Intent + Form), núcleo da fase CODE
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── ... (api-design, data-access, observability, ci-cd, cloud, sql-style, ui-ux)
│   ├── instructions/            ← Flavors, competência de entrega, templates
│   ├── commands/                ← Comandos de ciclo (feat/fix/docs/audit/land/end)
│   ├── tooling/                 ← Ferramentas desligadas (scripts + hooks husky, ative sob demanda)
│   └── backlog/                 ← Memória do projeto: conhecimento versionado, estado volátil ignorado pelo git
│       └── ...                  ← (Veja docs/reference/PROJECT-STRUCTURE.md para detalhes)
```

O `AGENTS.md` é um roteador: ele lista as skills disponíveis e manda carregar cada uma na hora certa. Só o `workflow.md` (o protocolo de 5 fases) fica sempre em contexto. O resto entra quando o ciclo pede.

Ao lado dele, o `CLAUDE.md` é um ponteiro de uma linha que importa o `AGENTS.md` com `@`. O Claude Code lê esse arquivo sozinho a cada sessão. Para as outras IDEs, você aponta o arquivo de configuração nativo da ferramenta para o mesmo `AGENTS.md` (veja "Usando com outras IDEs" abaixo).

> Para um detalhamento do papel de cada arquivo, veja [Estrutura do Projeto](../reference/PROJECT-STRUCTURE.md).

---

## Como o Protocolo Funciona

Você começa a mensagem com um prefixo, e o agente entra no ciclo correspondente. São prefixos de texto, não slash commands (comandos iniciados por barra, como `/build`): nada é instalado na sua ferramenta.

| Trigger (gatilho)   | Ciclo   | O que acontece                                                                                                                    |
| :------------------ | :------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `land: <descrição>` | Land    | Transforma uma visão solta em uma lista de tarefas `feat:` na ordem certa. Roda antes de existir código                           |
| `feat: <descrição>` | Feature | Executa SPEC → PLAN → CODE → TEST → END                                                                                           |
| `fix: <descrição>`  | Fix     | Mesmo ciclo, com foco em RCA (Root Cause Analysis · análise de causa raiz)                                                        |
| `docs: <descrição>` | Docs    | Atualiza changelogs, ADRs (Architecture Decision Records · registros de decisão) e especificações                                 |
| `audit: <escopo>`   | Audit   | Compara o projeto com as regras e aponta o drift (desvio entre o que está escrito e o que foi combinado)                          |
| `end:`              | —       | Fecha o ciclo ativo: changelog, backlog, proposta de commit. Também recupera o ciclo se o agente perder o fio no meio da conversa |
| Sem prefixo         | —       | O agente pergunta: "land, feat, fix, docs ou audit?"                                                                              |

O agente **para e aguarda sua aprovação** em SPEC e PLAN antes de escrever qualquer código.

```
SPEC  →  PLAN  →  CODE  →  TEST  →  END
  ↑           ↑                       ↑
  Wait        Wait                 "end:"
```

Para o detalhe de cada fase, veja o [Guia Spec-Driven Development](../concepts/SPEC-DRIVEN-DEV-GUIDE.md).
Para o diagrama dos pontos de parada e dos loops internos, veja o [Agent Deep-Flow](../concepts/AGENT-DEEP-FLOW.md).

---

## Flavors Arquiteturais

Escolha o flavor que corresponde à estrutura do seu projeto. Ele diz ao agente em qual camada escrever cada tipo de lógica:

| Flavor           | Padrão                                    | Use quando                          |
| :--------------- | :---------------------------------------- | :---------------------------------- |
| `vertical-slice` | Cortes verticais por funcionalidade       | Monorepo ou API voltada a domínio   |
| `mvc`            | Camadas clássicas (Model-View-Controller) | Serviço REST padrão                 |
| `lite`           | Estrutura mínima, sem camadas             | Scripts, CLIs, utilitários          |
| `legacy`         | Ponte segura para refatorar aos poucos    | Migrando bases de código existentes |

Para o diagrama de fluxo de dados de cada flavor, veja [Pipelines Arquiteturais](../reference/PIPELINES.md).

---

## Declaração de Stack via `land:`

O stack é declarado, não escolhido de um catálogo. Depois do `sdg-agents init`, rode o ciclo `land:` para informar as linguagens, os runtimes (tempo de execução · Node, JVM, CLR) e as versões de framework do projeto:

```
land: uma API Node.js + TypeScript servindo um dashboard React
```

O agente:

1. Pede que você liste cada linguagem e versão, em texto livre.

2. Classifica cada entrada por papel (Backend / Frontend / Data / Scripts).

3. Oferece buscar a documentação oficial para completar o que faltar. É opcional, e só destas fontes: `nodejs.org/api`, `react.dev`, `typescriptlang.org`, `tc39.es`, `docs.astro.build`, `docs.python.org`, `go.dev/doc`, `doc.rust-lang.org`, `kotlinlang.org/docs`, `dart.dev`, `learn.microsoft.com/dotnet`, `developer.apple.com/documentation/swift`.

4. Escreve `.ai/backlog/stack.md`. Quando uma versão mudar, edite o arquivo à mão: não precisa gerar nada de novo.

A fase CODE lê o `stack.md` em todo ciclo.

---

## Usando com outras IDEs

O `sdg-agents` gera um `AGENTS.md` na raiz do repositório e um `CLAUDE.md` ao lado. Codex e Claude Code leem os seus sem passo extra. Para as outras ferramentas, escreva uma linha no arquivo de regras nativo da IDE apontando para o `AGENTS.md`:

| Agente           | Arquivo de config nativo          | Como conectar                                                         |
| :--------------- | :-------------------------------- | :-------------------------------------------------------------------- |
| Claude Code      | `CLAUDE.md` (raiz, auto-gerado)   | Carregado automaticamente. Nenhuma ação necessária.                   |
| Cursor           | `.cursor/rules/sdg-agents.mdc`    | Crie o arquivo com uma única linha: `Read AGENTS.md before any task.` |
| Windsurf         | `.windsurfrules`                  | Mesma linha de ponteiro.                                              |
| GitHub Copilot   | `.github/copilot-instructions.md` | Mesma linha de ponteiro.                                              |
| Codex CLI        | `AGENTS.md` (raiz)                | Carregado automaticamente. Nenhuma ação necessária.                   |
| Gemini CLI       | `GEMINI.md`                       | Mesma linha de ponteiro.                                              |
| Cline / Roo Code | `.clinerules`                     | Mesma linha de ponteiro.                                              |

> **Quer um preset, uma voz ou uma skill própria?** Cole o conteúdo dela no seu agente como prompt. Não existe subcomando no CLI para isso, e não precisa existir.

---

## Manutenção

```bash
npx sdg-agents gate       # Passar o diff em staged pela barreira (serve como pre-commit, em qualquer linguagem)
npx sdg-agents review     # Apontar o drift entre as regras locais e a fonte
npx sdg-agents audit      # Rodar a auditoria de governança (drift, narrativa, estilo, higiene)
npx sdg-agents narrative  # Checar só a narrativa do changelog
npx sdg-agents clear      # Remover a pasta .ai/
```

---

## Referência

- [Referência Rápida (CHEATSHEET)](../reference/CHEATSHEET.md): todas as flags do CLI e os gatilhos do agente

- [Estrutura do Projeto](../reference/PROJECT-STRUCTURE.md): o papel de cada arquivo gerado

- [Pipelines Arquiteturais](../reference/PIPELINES.md): o caminho dos dados em cada flavor

- [Constituição de Engenharia (CONSTITUTION)](../concepts/CONSTITUTION.md): os princípios por trás das regras. É material de leitura; as regras que valem em execução ficam no `code-style.md`

- [Sistema UI/UX](../guides/UI-UX.md): design, hierarquia visual, escala tonal de superfície e as pesquisas que embasam tudo isso

- [Roadmap](../ROADMAP.md): o que já foi entregue e o que está planejado

- [Otimização de Tokens](../guides/TOKEN-OPTIMIZATION.md): quanto custa carregar as instruções e como esse custo foi reduzido

- [Guia de migração](../guides/MIGRATION-v3.md): breaking changes e migração passo a passo, do v2 ao v6

- [Changelog](../../CHANGELOG.md): release atual, com [o arquivo histórico](../CHANGELOG-archive.md) guardando todas as versões desde a v0.x

- [Créditos e Filosofias](../reference/REFERENCES.md): influências do projeto e créditos de pesquisa

---

> **Aviso:** Este projeto está em desenvolvimento inicial. Revise e ajuste as regras instaladas aos padrões da sua equipe antes de depender delas.

_O equilíbrio é a chave._

O SDG muda a cada ciclo. Contribuições, forks e críticas são bem-vindos.
