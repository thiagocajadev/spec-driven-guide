#!/usr/bin/env node
/**
 * git-guard: blocking PreToolUse hook for shell commands.
 *
 * Reads Claude Code's hook JSON from stdin and refuses the git commands that
 * move work past the developer's review: `git push` and `git reset --hard`.
 * A refusal exits 2 with the reason on stderr, which the harness hands back to
 * the agent. Every other command, and every payload this hook cannot read,
 * exits 0: a guard that breaks the session on a malformed payload costs more
 * than the one command it might have missed.
 *
 * The commit gate in `workflow.md` asks for the same thing in text. This is
 * the enforced half, for harnesses that run hooks.
 */

import process from "node:process";
import path from "node:path";
import fileSystem from "node:fs";
import { fileURLToPath } from "node:url";

const BLOCKED_EXIT_CODE = 2;
const SHELL_TOOL = "Bash";
const SEGMENT_SEPARATOR = /&&|\|\||[;|\n]/;
const ENVIRONMENT_PREFIX = /^(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)+/;
const GIT_INVOCATION =
  /^git((?:\s+(?:-C\s+\S+|-c\s+\S+|--[\w-]+(?:=\S+)?))*)\s+(.+)$/;

const BLOCKED_SUBCOMMANDS = [
  {
    pattern: /^push\b/,
    reason:
      "git push publishes commits nobody reviewed on the remote. The developer pushes after approving the commit.",
  },
  {
    pattern: /^reset\b.*\s--hard\b/,
    reason:
      "git reset --hard discards uncommitted work with no undo. Ask the developer first, or keep the work with git stash.",
  },
];

async function run() {
  await orchestrateGuard();
}

async function orchestrateGuard() {
  const payload = await readStdinJson();

  if (payload === null) {
    process.stderr.write("git-guard: unreadable hook payload, allowed.\n");
    process.exit(0);
  }

  const command = payload.tool_input?.command;
  const isShellCommand =
    payload.tool_name === SHELL_TOOL && typeof command === "string";

  if (!isShellCommand) {
    process.exit(0);
  }

  const refusal = findBlockedCommand(command);

  if (refusal === null) {
    process.exit(0);
  }

  process.stderr.write(`git-guard: blocked. ${refusal}\n`);
  process.exit(BLOCKED_EXIT_CODE);
}

function findBlockedCommand(command) {
  const segments = command.split(SEGMENT_SEPARATOR);
  const subcommands = segments.map(readGitSubcommand).filter(Boolean);

  const blockedRule = subcommands
    .map((subcommand) => matchBlockedRule(subcommand))
    .find(Boolean);

  const refusal = blockedRule?.reason ?? null;
  return refusal;
}

function readGitSubcommand(segment) {
  const invocation = segment.trim().replace(ENVIRONMENT_PREFIX, "");
  const gitMatch = invocation.match(GIT_INVOCATION);

  const subcommand = gitMatch?.[2] ?? null;
  return subcommand;
}

function matchBlockedRule(subcommand) {
  const blockedRule = BLOCKED_SUBCOMMANDS.find((rule) =>
    rule.pattern.test(subcommand),
  );

  return blockedRule;
}

async function readStdinJson() {
  let raw = "";

  for await (const chunk of process.stdin) {
    raw += chunk;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    const malformedPayload = null;
    return malformedPayload;
  }
}

const GitGuard = {
  findBlockedCommand,
  run,
};

export { GitGuard };

function isDirectInvocation() {
  if (!process.argv[1]) {
    const noEntry = false;
    return noEntry;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const entryFile = fileSystem.realpathSync(path.resolve(process.argv[1]));

  const isEntry = currentFile === entryFile;
  return isEntry;
}

if (isDirectInvocation()) {
  run();
}
