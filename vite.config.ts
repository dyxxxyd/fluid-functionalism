import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vite-plus";
import { nextRules, reactHooksRules, typescriptRules } from "./lint/rules";

export default defineConfig({
  test: {
    // Keep local agent worktrees out of test discovery.
    exclude: [...configDefaults.exclude, ".claude/**"],
    // Preset suites type-check generated code through a real TS program.
    testTimeout: 15_000,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  // Next preserves JSX; the component tests need the automatic transform.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  // The repo has no existing formatter baseline. Keep formatting opt-in so
  // adopting the toolchain does not rewrite component and registry sources.
  check: { fmt: false },
  fmt: {
    ignorePatterns: [".claude/**", ".next/**", ".vitest/**", "public/r/**", "dist/**"],
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "react", "nextjs"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }, "./lint/fluid.mjs"],
    rules: {
      ...typescriptRules,
      ...nextRules,
      // Keep the original scope: Compiler rules apply to registry sources.
      ...Object.fromEntries(Object.keys(reactHooksRules).map((rule) => [rule, "off"])),
      "vite-plus/prefer-vite-plus-imports": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
    overrides: [
      {
        files: ["**/*.{ts,tsx}"],
        excludeFiles: [
          "components/shadcn/**",
          "app/compare/**",
          "app/components/shadcn-previews.tsx",
        ],
        rules: { "fluid/design-system": "error" },
      },
      {
        files: ["registry/**/*.{ts,tsx}"],
        excludeFiles: ["registry/default/lib/utils.ts"],
        rules: { "fluid/registry-type": "error" },
      },
      {
        files: ["registry/**/*.{ts,tsx}"],
        rules: {
          ...reactHooksRules,
          "no-unused-vars": ["error", {}],
          "nextjs/no-img-element": "error",
        },
      },
    ],
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: [
      ".claude/**",
      ".next/**",
      ".vitest/**",
      "dist/**",
      "next-env.d.ts",
      "public/r/**",
    ],
  },
});
