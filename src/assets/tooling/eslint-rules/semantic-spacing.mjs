export const semanticSpacing = {
  meta: {
    type: "layout",
    docs: {
      description: "enforce visual density grouping within block bodies",
    },
    fixable: "whitespace",
    schema: [
      {
        type: "object",
        properties: {
          minBodySize: { type: "number" },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const minBodySize = context.options[0]?.minBodySize ?? 2;

    function isVisuallyMultiline(node) {
      if (node.loc.start.line !== node.loc.end.line) {
        return true;
      }

      if (node.type === "VariableDeclaration") {
        return node.declarations.some(
          (declarator) =>
            declarator.init &&
            declarator.init.loc.start.line !== declarator.init.loc.end.line,
        );
      }

      return false;
    }

    function hasBlankLineBefore(node) {
      const tokenBefore = context.sourceCode.getTokenBefore(node);
      if (!tokenBefore) {
        return false;
      }

      const textBetween = context.sourceCode.text.slice(
        tokenBefore.range[1],
        node.range[0],
      );

      return textBetween.includes("\n\n");
    }

    function insertBlankAfter(fixer, node) {
      const lastToken = context.sourceCode.getLastToken(node);
      return fixer.insertTextAfter(lastToken, "\n");
    }

    function removeBlankBefore(fixer, node) {
      const tokenBefore = context.sourceCode.getTokenBefore(node);
      const textBetween = context.sourceCode.text.slice(
        tokenBefore.range[1],
        node.range[0],
      );

      const doubleNewlineIdx = textBetween.indexOf("\n\n");
      if (doubleNewlineIdx === -1) {
        return null;
      }

      const removeStart = tokenBefore.range[1] + doubleNewlineIdx;
      return fixer.removeRange([removeStart, removeStart + 1]);
    }

    function isAssertionStatement(statement) {
      if (statement.type !== "ExpressionStatement") {
        return false;
      }

      const expr = statement.expression;

      function walk(n) {
        if (n.type === "CallExpression") {
          const c = n.callee;
          if (c.type === "Identifier") {
            return c.name === "expect";
          }

          if (
            c.type === "MemberExpression" &&
            c.object.type === "Identifier" &&
            c.object.name === "assert"
          ) {
            return true;
          }

          if (c.type === "MemberExpression") {
            return walk(c.object);
          }
        }

        if (n.type === "MemberExpression") {
          return walk(n.object);
        }

        return false;
      }

      return walk(expr);
    }

    function checkBlock(node) {
      const statements = node.body;
      if (statements.length < minBodySize) {
        return;
      }

      statements.forEach((statement, index) => {
        if (index === 0) {
          return;
        }

        const predecessor = statements[index - 1];

        // Rule 1: blank line after any multiline predecessor
        if (
          isVisuallyMultiline(predecessor) &&
          !hasBlankLineBefore(statement)
        ) {
          context.report({
            node: statement,
            message: "Expected blank line after multiline statement.",
            fix: (fixer) => insertBlankAfter(fixer, predecessor),
          });

          return;
        }

        // Rule 2: blank line before explaining-return group (const + return pair)
        // Fires when: return follows const, preceded by non-const action statements
        if (
          statement.type === "ReturnStatement" &&
          index >= 2 &&
          predecessor.type === "VariableDeclaration" &&
          statements[index - 2].type !== "VariableDeclaration" &&
          !hasBlankLineBefore(predecessor)
        ) {
          context.report({
            node: predecessor,
            message: "Expected blank line before explaining-return group.",
            fix: (fixer) => insertBlankAfter(fixer, statements[index - 2]),
          });
        }

        // Rule 2b: blank line before explaining side-effect group (const + sideEffect pair)
        // Fires only for exactly 4-statement blocks (the "4 linhas → 2+2" case)
        if (
          statement.type === "ExpressionStatement" &&
          !isAssertionStatement(statement) &&
          statements.length === 4 &&
          index === 3 &&
          predecessor.type === "VariableDeclaration" &&
          statements[index - 2].type === "VariableDeclaration" &&
          !hasBlankLineBefore(predecessor)
        ) {
          context.report({
            node: predecessor,
            message: "Expected blank line before explaining side-effect group.",
            fix: (fixer) => insertBlankAfter(fixer, statements[index - 2]),
          });
        }

        // Rule 2c: blank before 3rd const in [c, c, c, return] tail (any block size)
        // Fires when exactly 3 consecutive single-line VDs precede return
        if (
          statement.type === "ReturnStatement" &&
          index >= 3 &&
          predecessor.type === "VariableDeclaration" &&
          !isVisuallyMultiline(predecessor) &&
          statements[index - 2].type === "VariableDeclaration" &&
          !isVisuallyMultiline(statements[index - 2]) &&
          statements[index - 3].type === "VariableDeclaration" &&
          !isVisuallyMultiline(statements[index - 3]) &&
          (index < 4 || statements[index - 4].type !== "VariableDeclaration") &&
          !hasBlankLineBefore(predecessor)
        ) {
          context.report({
            node: predecessor,
            message: "Expected blank line before explaining-return group.",
            fix: (fixer) => insertBlankAfter(fixer, statements[index - 2]),
          });
        }

        // Rule 2d: blank before 3rd const in [c, c, c, c, sideEffect] 5-statement block
        // Fires when all 4 preceding statements are single-line VDs
        if (
          statement.type === "ExpressionStatement" &&
          !isAssertionStatement(statement) &&
          statements.length === 5 &&
          index === 4 &&
          predecessor.type === "VariableDeclaration" &&
          !isVisuallyMultiline(predecessor) &&
          statements[2].type === "VariableDeclaration" &&
          !isVisuallyMultiline(statements[2]) &&
          statements[1].type === "VariableDeclaration" &&
          statements[0].type === "VariableDeclaration" &&
          !hasBlankLineBefore(statements[2])
        ) {
          context.report({
            node: statements[2],
            message: "Expected blank line before explaining side-effect group.",
            fix: (fixer) => insertBlankAfter(fixer, statements[1]),
          });
        }

        // Rule 4: remove blank between explaining-const and return (tight pair enforcement)
        if (
          statement.type === "ReturnStatement" &&
          predecessor.type === "VariableDeclaration" &&
          !isVisuallyMultiline(predecessor) &&
          hasBlankLineBefore(statement)
        ) {
          context.report({
            node: statement,
            message:
              "Unexpected blank line between explaining-const and return.",
            fix: (fixer) => removeBlankBefore(fixer, statement),
          });
        }

        // Rule 3: remove extraneous blank between consecutive VDs before side-effect terminal
        // Mirrors Rule 2b but in the removal direction, firing for 5+ statement blocks
        if (
          statement.type === "VariableDeclaration" &&
          !isVisuallyMultiline(statement) &&
          statements.length > 4 &&
          index < statements.length - 1 &&
          statements[index + 1].type === "ExpressionStatement" &&
          !isAssertionStatement(statements[index + 1]) &&
          predecessor.type === "VariableDeclaration" &&
          !isVisuallyMultiline(predecessor) &&
          hasBlankLineBefore(statement)
        ) {
          context.report({
            node: statement,
            message:
              "Unexpected blank line in consecutive variable declarations.",
            fix: (fixer) => removeBlankBefore(fixer, statement),
          });
        }
      });
    }

    return {
      BlockStatement: checkBlock,
    };
  },
};
