const TEST_FILE_PATTERN = /\.test\.[mc]?[jt]sx?$/;
const THROW_LIKE_METHODS = new Set([
  "throws",
  "doesNotThrow",
  "rejects",
  "doesNotReject",
]);
const ONE_VALUE_METHODS = new Set(["ok", "ifError"]);

export const noInlineAssert = {
  meta: {
    type: "problem",
    docs: {
      description: "require named identifiers as arguments to assert.* calls",
    },
    schema: [],
    messages: {
      inlineArgument:
        "assert.{{method}}() argument must be a named identifier: extract to a named const.",
    },
  },

  create(context) {
    const filename = context.filename;
    if (!TEST_FILE_PATTERN.test(filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        const { callee, arguments: args } = node;
        if (callee.type !== "MemberExpression") {
          return;
        }

        const objectNode = callee.object;
        if (objectNode.type !== "Identifier" || objectNode.name !== "assert") {
          return;
        }

        const methodName = callee.property.name ?? callee.property.value;
        const minValueArgs = ONE_VALUE_METHODS.has(methodName) ? 1 : 2;
        const lastIndex = args.length - 1;

        for (let index = 0; index < args.length; index++) {
          const arg = args[index];

          const isLastArg = index === lastIndex;
          const hasMessageSlot = args.length > minValueArgs;
          const isStringMessage =
            isLastArg &&
            hasMessageSlot &&
            (arg.type === "TemplateLiteral" ||
              (arg.type === "Literal" && typeof arg.value === "string"));

          const isFunctionArg =
            index === 0 &&
            THROW_LIKE_METHODS.has(methodName) &&
            (arg.type === "ArrowFunctionExpression" ||
              arg.type === "FunctionExpression");

          if (isStringMessage || isFunctionArg) {
            continue;
          }

          if (arg.type !== "Identifier") {
            context.report({
              node: arg,
              messageId: "inlineArgument",
              data: { method: methodName },
            });
          }
        }
      },
    };
  },
};
