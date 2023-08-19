// Eslint comments https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: { project: "./tsconfig.json" },
  plugins: ["@typescript-eslint", "eslint-comments", "jest"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:eslint-comments/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "plugin:jest/recommended",
    "plugin:jest/style",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        selector: ["class", "interface", "enum"],
        format: ["PascalCase"],
      },
    ],
    "lines-between-class-members": ["error", "always"],
    "@typescript-eslint/no-floating-promises": ["warn"],
  },
};
