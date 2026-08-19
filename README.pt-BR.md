<!-- prettier-ignore-start -->
<div align="center">
  <img src="https://raw.githubusercontent.com/thiagocajadev/spec-driven-guide/main/docs/img/sdg-agents-icon-light.svg" alt="Spec-Driven Guide" width="480" height="480" style="border-radius: 1rem;">
  <h1 align="center">Spec-Driven Guide: Agents</h1>
  <p align="center">
    Um CLI (Command Line Interface · interface de linha de comando) que instala um conjunto de instruções para agentes de IA no seu projeto.<br>
    <a href="README.md">Read in English</a>
  </p>
  <p align="center">
      Leia o manifesto e o guia visual em <a href="https://specdrivenguide.org">specdrivenguide.org</a>
  </p>
  <a href="https://www.npmjs.com/package/spec-driven-guide"><img src="https://img.shields.io/npm/v/spec-driven-guide?style=flat-square&logo=npm&color=cb3837" alt="versão npm" /></a>
  <a href="https://www.npmjs.com/package/spec-driven-guide"><img src="https://img.shields.io/npm/dm/spec-driven-guide?style=flat-square&logo=npm&color=cb3837" alt="downloads npm" /></a>
  <a href="https://github.com/thiagocajadev/spec-driven-guide/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/thiagocajadev/spec-driven-guide/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI" alt="status do CI" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-24%20LTS-brightgreen?style=flat-square&logo=nodedotjs" alt="Node 24 LTS" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="License: ISC" /></a>
  <a href="https://agents.md"><img src="https://img.shields.io/badge/AGENTS.md-compat%C3%ADvel-6e56cf?style=flat-square&logo=markdown&logoColor=white" alt="compatível com AGENTS.md" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-keep%20a%20changelog-f5a623?style=flat-square&logo=keepachangelog&logoColor=white" alt="Changelog" /></a>
</div>
<!-- prettier-ignore-end -->

<br>

`spec-driven-guide` instala arquivos de instrução em markdown no seu projeto. Agentes de IA (Claude Code, Cursor, Windsurf, Copilot, Codex e outros) leem esses arquivos e seguem o protocolo em cada tarefa.

Quem chega ao projeto pela primeira vez lê de cima para baixo: o Início Rápido instala, e Como o Protocolo Funciona explica o que muda na conversa com o agente depois disso. Quem vai alterar o conjunto de instruções lê a partir de O Que É Instalado, onde cada arquivo gerado é nomeado e apontado para a sua origem.

## Comece por um prefixo

Instrua o agente do mesmo jeito que você escreveria uma mensagem de commit.

| Como você pede         | O que você escreve                                                | O que volta                                                                                              |
| :--------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| Um pedido solto        | `conserta o login`                                                | O agente adivinha o escopo e começa a escrever. Você descobre o que ele decidiu revisando tudo depois    |
| Uma spec escrita à mão | contrato, critérios de aceite e casos de borda, escritos por você | Funciona bem. Detalhe ajuda, e o agente pode escrever esse detalhe junto com você                        |
| ✅ Um prefixo          | `fix:` login aceita senha vazia                                   | O agente escreve a spec, para para você aprovar, e então planeja, codifica e testa dentro do mesmo ciclo |

O agente propõe a SPEC a partir do contexto que ele já tem do projeto, e vocês alinham juntos antes de qualquer código. Onde houver risco, detalhe o quanto puder.

<details>
<summary><strong>Conceitos fundamentais</strong></summary>

| Conceito           | O que é                                                                                                              |
| :----------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Ciclo**          | Uma unidade de trabalho, aberta por um prefixo (`feat:`, `fix:`, `docs:`, `audit:`, `land:`) e fechada por `end:`    |
| **Fase**           | Um dos cinco passos que o ciclo percorre: SPEC, PLAN, CODE, TEST, END                                                |
| **Skill**          | Um conjunto de regras sobre um assunto, em `.ai/skills/`, carregado só quando o domínio do ciclo pede                |
| **Flavor**         | O formato arquitetural do projeto, escolhido na instalação: vertical slice, MVC, lite ou legacy                      |
| **Work Checklist** | A barreira binária em `code-style.md`: itens de Intent recitados ao entrar em CODE, itens de Form conferidos em TEST |
| **Backlog**        | `.ai/backlog/`, onde o resumo do projeto, o stack declarado e o estado das tarefas sobrevivem à sessão               |

</details>

<details>
<summary><strong>O que o conjunto de instruções cobre</strong></summary>

- **Protocolo de trabalho**: um ciclo de 5 fases (SPEC → PLAN → CODE → TEST → END). Ele traz um **Work Checklist** (lista de verificação que o agente recita antes de escrever código) e um **Circuit Breaker** (disjuntor · para o agente após 3 tentativas na mesma falha). Você aprova SPEC e PLAN antes de qualquer linha ser escrita.

- **Estilo de código e quality gates** (barreiras de qualidade): uma regra só, o `WorkChecklist` em `code-style.md`. Ela se divide em itens de Intent (intenção · recitados ao entrar na fase CODE) e de Form (forma · verificados na fase TEST).

- **Skills sob demanda**: cada skill (habilidade · um arquivo de regras sobre um assunto) carrega somente quando o ciclo precisa dela. Há skills para code style, testes, segurança, API, acesso a dados, observabilidade, CI/CD, cloud, SQL, UI/UX, revisão, performance, modelagem de domínio, versionamento e escrita de README.

- **Versionamento como skill**: o `versioning.md` é dono do formato do commit e da tabela que deriva a versão a partir dos tipos de commit, então o número é calculado a partir dos commits em vez de escolhido na mão. Ele também declara os dois modos de release: `derived`, em que a CI calcula a versão e gera o changelog a partir dos corpos dos commits, e `manual`, em que o `npm run bump` roda localmente e o commit de release carrega o número. A fase END carrega esse arquivo em todo ciclo.

- **Contexto de stack dinâmico**: o ciclo `land:` pergunta o seu stack (o conjunto de linguagens, runtimes e frameworks do projeto) e escreve `.ai/backlog/stack.md`. A fase CODE lê esse arquivo como fonte única de verdade. Não há catálogo de linguagens para manter.

- **Compatível com qualquer agente**: um `AGENTS.md` na raiz do repositório, onde Codex, Cursor e os demais já procuram. Um arquivo escrito por você nunca é sobrescrito.

- **Memória entre sessões**: a pasta `.ai/backlog/` (lista de trabalho e memória do projeto) guarda o resumo, o stack, o estado das tarefas e o conhecimento que o time acumulou. Um **Impact Map** (mapa de impacto) lista os arquivos que o ciclo atual precisa ler.

- **Catálogo de tooling inerte**: um pacote de ferramentas copiado em `.ai/tooling/`, com nada ligado por padrão. Nenhum `package.json` editado, nenhum `.husky/` criado, nenhuma dependência instalada. Você liga o que quiser, quando quiser.

</details>

---

## Início Rápido

Requer **Node.js 24 LTS** ou mais novo, a linha em que o CLI é construído e testado.

```bash
npx spec-driven-guide
```

<p align="left">
  <kbd><img src="https://raw.githubusercontent.com/thiagocajadev/spec-driven-guide/main/docs/img/sdg-agents-menu.png" alt="Spec Driven Guide CLI em ação" /></kbd>
</p>

O assistente interativo pede o **flavor** (sabor · o padrão estrutural que o projeto segue). O stack vem depois, pelo ciclo `land:`, porque você declara melhor com o projeto já definido.

<details>
<summary><strong>Instalação sem perguntas</strong></summary>

```bash
# Instalação sem prompts (flavor lite + stack.md placeholder)
npx spec-driven-guide init --quick

# Vertical Slice, qualquer stack
npx spec-driven-guide init --flavor vertical-slice

# MVC, qualquer stack
npx spec-driven-guide init --flavor mvc
```

</details>

Depois de instalar, abra o chat do agente e escreva `land: <visão>`. O agente pergunta o stack, escreve `.ai/backlog/stack.md` e monta a primeira lista de tarefas.

---

## O Que É Instalado

O `AGENTS.md` é um roteador: ele lista as skills disponíveis e manda carregar cada uma na hora certa. Só o `workflow.md` (o protocolo de 5 fases) fica sempre em contexto. O resto entra quando o ciclo pede.

Ao lado dele, o `CLAUDE.md` é um ponteiro de uma linha que importa o `AGENTS.md` com `@`. O Claude Code lê esse arquivo sozinho a cada sessão. Para as outras IDEs, você aponta o arquivo de configuração nativo da ferramenta para o mesmo `AGENTS.md` (veja "Usando com outras IDEs" abaixo).

> **Nota:** Se o seu agente não carregar as regras sozinho, cite o `AGENTS.md` no início da sessão.

<details>
<summary><strong>Árvore completa escrita pelo <code>init</code></strong></summary>

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

</details>

> Para um detalhamento do papel de cada arquivo, veja [Estrutura do Projeto](docs/reference/PROJECT-STRUCTURE.md).

---

## Como o Protocolo Funciona

Você começa a mensagem com um prefixo, e o agente entra no ciclo correspondente. São prefixos de texto, não slash commands (comandos iniciados por barra, como `/build`): nada é instalado na sua ferramenta.

| Trigger (gatilho)            | Ciclo            | O que acontece                                                                                                               |
| :--------------------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `land: <sua visão aqui>`     | Primeiro contato | Define a visão e o escopo do projeto antes de escrever a primeira linha                                                      |
| `feat: <descreva a feature>` | Feature          | Percorre SPEC → PLAN → CODE → TEST → END para qualquer funcionalidade nova                                                   |
| `fix: <descreva o problema>` | Correção de bug  | Diagnostica a causa raiz, corrige e confirma que nada mais quebrou                                                           |
| `docs: <o que documentar>`   | Documentação     | Escreve ADRs (Architecture Decision Records · registros de decisão), changelogs e specs técnicas no template certo           |
| `audit: <escopo a auditar>`  | Auditoria        | Verifica se as regras de governança estão aplicadas no projeto e devolve um plano de correção                                |
| `end: <instrução opcional>`  | Fecha o ciclo    | Resume o que foi feito, atualiza o changelog e commita. Também recupera o ciclo se o agente perder o fio no meio da conversa |
| Sem prefixo                  | n/a              | O agente pergunta: "land, feat, fix, docs ou audit?"                                                                         |

O agente **para e espera por você** três vezes: em SPEC e em PLAN antes de escrever qualquer código, e de novo depois do TEST, onde ele relata o que verificou e você resolve os últimos detalhes antes de o `end:` fechar o ciclo.

```
  SPEC    o contrato       o que e por quê, escrito       ⏸  você aprova
   │
  PLAN    a estratégia     tarefas em ordem, seguíveis    ⏸  você aprova
   │
  CODE    a execução       o plano, nada além dele
   │
  TEST    a verificação    o feito bate com o combinado   ⏸  você revisa
   │
  END     a entrega        changelog, backlog, commit     ▸  você escreve end:
```

Para o detalhe de cada fase, veja o [Guia Spec-Driven Development](docs/concepts/SPEC-DRIVEN-DEV-GUIDE.md).
Para o diagrama dos pontos de parada e dos loops internos, veja o [Agent Deep-Flow](docs/concepts/AGENT-DEEP-FLOW.md).

---

## Flavors Arquiteturais

Escolha o flavor que corresponde à estrutura do seu projeto. Ele diz ao agente em qual camada escrever cada tipo de lógica:

| Flavor           | Padrão                                    | Use quando                          |
| :--------------- | :---------------------------------------- | :---------------------------------- |
| `vertical-slice` | Cortes verticais por funcionalidade       | Monorepo ou API voltada a domínio   |
| `mvc`            | Camadas clássicas (Model-View-Controller) | Serviço REST padrão                 |
| `lite`           | Estrutura mínima, sem camadas             | Scripts, CLIs, utilitários          |
| `legacy`         | Ponte segura para refatorar aos poucos    | Migrando bases de código existentes |

Para o diagrama de fluxo de dados de cada flavor, veja [Pipelines Arquiteturais](docs/reference/PIPELINES.md).

---

## Declaração de Stack via `land:`

O stack é declarado, não escolhido de um catálogo. Depois do `spec-driven-guide init`, rode o ciclo `land:` para informar as linguagens, os runtimes (tempo de execução · Node, JVM, CLR) e as versões de framework do projeto:

```
land: uma API Node.js + TypeScript servindo um dashboard React
```

O agente pergunta as suas linguagens e versões, classifica cada uma por papel e escreve `.ai/backlog/stack.md`. A fase CODE lê esse arquivo em todo ciclo.

<details>
<summary><strong>O que o ciclo <code>land:</code> faz, passo a passo</strong></summary>

1. Pede que você liste cada linguagem e versão, em texto livre.

2. Classifica cada entrada por papel (Backend / Frontend / Data / Scripts).

3. Oferece buscar a documentação oficial para completar o que faltar. É opcional, e só destas fontes: `nodejs.org/api`, `react.dev`, `typescriptlang.org`, `tc39.es`, `docs.astro.build`, `docs.python.org`, `go.dev/doc`, `doc.rust-lang.org`, `kotlinlang.org/docs`, `dart.dev`, `learn.microsoft.com/dotnet`, `developer.apple.com/documentation/swift`.

4. Escreve `.ai/backlog/stack.md`. Quando uma versão mudar, edite o arquivo à mão: não precisa gerar nada de novo.

</details>

---

## Usando com outras IDEs

O `spec-driven-guide` gera um `AGENTS.md` na raiz do repositório e um `CLAUDE.md` ao lado. Codex e Claude Code leem os seus sem passo extra. Para as outras ferramentas, escreva uma linha no arquivo de regras nativo da IDE apontando para o `AGENTS.md`: `Read AGENTS.md before any task.`

<details>
<summary><strong>Arquivo de configuração nativo, por agente</strong></summary>

| Agente           | Arquivo de config nativo              | Como conectar                                                         |
| :--------------- | :------------------------------------ | :-------------------------------------------------------------------- |
| Claude Code      | `CLAUDE.md` (raiz, auto-gerado)       | Carregado automaticamente. Nenhuma ação necessária.                   |
| Cursor           | `.cursor/rules/spec-driven-guide.mdc` | Crie o arquivo com uma única linha: `Read AGENTS.md before any task.` |
| Windsurf         | `.windsurfrules`                      | Mesma linha de ponteiro.                                              |
| GitHub Copilot   | `.github/copilot-instructions.md`     | Mesma linha de ponteiro.                                              |
| Codex CLI        | `AGENTS.md` (raiz)                    | Carregado automaticamente. Nenhuma ação necessária.                   |
| Gemini CLI       | `GEMINI.md`                           | Mesma linha de ponteiro.                                              |
| Cline / Roo Code | `.clinerules`                         | Mesma linha de ponteiro.                                              |

</details>

> **Quer um preset, uma voz ou uma skill própria?** Cole o conteúdo dela no seu agente como prompt. Não existe subcomando no CLI para isso, e não precisa existir.

---

## Manutenção

O `npx spec-driven-guide` abre um menu cuja opção **Settings** roda a auditoria de governança.

<details>
<summary><strong>Se preferir, rode direto pelo CLI</strong></summary>

```bash
npx spec-driven-guide gate       # Passar o diff em staged pela barreira (serve como pre-commit, em qualquer linguagem)
npx spec-driven-guide review     # Apontar o drift entre as regras locais e a fonte
npx spec-driven-guide audit      # Rodar a auditoria de governança (drift, narrativa, estilo, higiene)
npx spec-driven-guide narrative  # Checar só a narrativa do changelog
npx spec-driven-guide clear      # Remover a pasta .ai/
```

</details>

---

## Referência

Comece pela [Referência Rápida (CHEATSHEET)](docs/reference/CHEATSHEET.md), com todas as flags do CLI e os gatilhos do agente em uma página só.

<details>
<summary><strong>Índice completo da documentação</strong></summary>

- [Estrutura do Projeto](docs/reference/PROJECT-STRUCTURE.md): o papel de cada arquivo gerado

- [Pipelines Arquiteturais](docs/reference/PIPELINES.md): o caminho dos dados em cada flavor

- [Guia Spec-Driven Development](docs/concepts/SPEC-DRIVEN-DEV-GUIDE.md): o detalhe de cada fase e suas regras

- [Agent Deep-Flow](docs/concepts/AGENT-DEEP-FLOW.md): os pontos de parada e os loops internos

- [Constituição de Engenharia (CONSTITUTION)](docs/concepts/CONSTITUTION.md): os princípios por trás das regras. É material de leitura; as regras que valem em execução ficam no `code-style.md`

- [Sistema UI/UX](docs/guides/UI-UX.md): design, hierarquia visual, escala tonal de superfície e as pesquisas que embasam tudo isso

- [Roadmap](docs/ROADMAP.md): o que já foi entregue e o que está planejado

- [Otimização de Tokens](docs/guides/TOKEN-OPTIMIZATION.md): quanto custa carregar as instruções e como esse custo foi reduzido

- [Guia de migração](docs/guides/MIGRATION-v3.md): breaking changes e migração passo a passo, do v2 ao v6

- [Changelog](CHANGELOG.md): release atual, com [o arquivo histórico](docs/CHANGELOG-archive.md) guardando todas as versões desde a v0.x

- [Créditos e Filosofias](docs/reference/REFERENCES.md): influências do projeto e créditos de pesquisa

</details>

---

> **Aviso:** Este projeto está em desenvolvimento inicial. Revise e ajuste as regras instaladas aos padrões da sua equipe antes de depender delas.

_O equilíbrio é a chave._

O SDG muda a cada ciclo. Contribuições, forks e críticas são bem-vindos.
