export default [
  {
    ignores: [
      "**/*.test.js",
      "**/*.test.jsx",
      "dist/**",
      "node_modules/**",
    ],
  },
  {
    files: [
      "src/services/**/*.js",
      "src/utils/**/*.js",
      "src/constants/routes.js",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      complexity: ["error", { max: 10 }],
    },
  },
];
