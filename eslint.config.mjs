import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 ships native flat configs, so they are spread directly.
 * Wrapping them in FlatCompat is what the older setup did and it throws on this
 * version.
 */
const eslintConfig = [
  {
    // "sanity/" only type-checks once a Studio (and the sanity package) exists;
    // "scripts/" is build-time asset tooling, not application code.
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "next-env.d.ts",
      "sanity/**",
      "scripts/**",
      "reports/**",
      "public/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
