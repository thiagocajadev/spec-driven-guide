function parseCliArgs(argv) {
  const subcommand = argv[0] && !argv[0].startsWith("-") ? argv[0] : null;

  const parsedArgs = {
    subcommand,
    // why: targetDirectory resolution (path.resolve) is caller's job, which keeps the parser pure.
    targetDirectory:
      argv.slice(subcommand ? 1 : 0).filter(isPositionalArg)[0] || null,
    help: argv.includes("--help") || argv.includes("-h"),
    version: argv.includes("--version") || argv.includes("-v"),
    quick: argv.includes("--quick"),
    isDryRun: argv.includes("--dry-run"),
    flavor: getArgValue(argv, "--flavor"),
    mode: getArgValue(argv, "--mode"),
    track: getArgValue(argv, "--track"),
    bump: !argv.includes("--no-bump"),
    prompt: argv.includes("--prompt"),
    check: argv.includes("--check"),
    isStrict: argv.includes("--strict"),
  };

  const finalArgs = parsedArgs;
  return finalArgs;
}

function isPositionalArg(arg, index, tokens) {
  if (arg.startsWith("-")) {
    return false;
  }

  const precedingToken = tokens[index - 1];
  const flagsThatConsumeNextArg = ["--flavor", "--mode", "--track"];

  const isPositional =
    !precedingToken || !flagsThatConsumeNextArg.includes(precedingToken);

  return isPositional;
}

function getArgValue(argv, flag) {
  const flagPosition = argv.indexOf(flag);
  const value =
    flagPosition !== -1 && flagPosition + 1 < argv.length
      ? argv[flagPosition + 1]
      : null;

  return value;
}

function validateInit(args) {
  const isQuickMode = args.quick || args.mode === "quick";
  if (isQuickMode) {
    return null;
  }

  const isNonInteractive = args.mode || args.flavor;
  if (!isNonInteractive) {
    return null;
  }

  if (!args.flavor) {
    const missingFlavorError =
      "  ⚠️  --flavor is required for non-interactive mode.\n  Available: vertical-slice, mvc, lite, legacy";

    return missingFlavorError;
  }

  return null;
}

export const CliParser = {
  parseCliArgs,
  validateInit,
};
