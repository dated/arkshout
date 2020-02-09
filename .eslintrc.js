module.exports = {
  parser: "@typescript-eslint/parser",

  extends: [
    "oclif",
    "oclif-typescript",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
  },
  parserOptions: {
    sourceType: "module" // Allows for the use of imports
  },
}
