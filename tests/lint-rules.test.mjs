import { describe, it, expect } from "vite-plus/test";
import { RuleTester } from "vite-plus/lint/plugins-dev";
import plugin from "../lint/fluid.mjs";
import { reactHooksRules } from "../lint/rules.ts";
import { lintGeneratedFiles } from "./helpers/oxlint.mjs";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });

tester.run("fluid/design-system", plugin.rules["design-system"], {
  valid: [
    '<Button className="text-site-body text-foreground" />',
    '<Button render={<span className="text-[13px]" />} />',
    '<span className="focus-visible:ring-[color:var(--focus-ring,#6B97FF)]" />',
    '<span className="text-foreground tracking-normal font-normal" />',
    'const prose = "uppercase text-sm";',
  ],
  invalid: [
    { code: '<Button className="text-[13px]" />', errors: [{ message: /Hardcoded font size/ }] },
    { code: '<span className="uppercase" />', errors: [{ message: /no uppercase/ }] },
    { code: "cn(`text-sm`)", errors: [{ message: /Type comes from the 5 styles/ }] },
    { code: '<span className="text-red-500" />', errors: [{ message: /Text uses 2 colors/ }] },
    { code: '<span className="text-foreground/50" />', errors: [{ message: /opacity step/ }] },
    { code: '<Button className="bg-primary" />', errors: [{ message: /reserved/ }] },
    {
      code: '<Button className="focus-visible:ring-red-500" />',
      errors: [{ message: /focus-ring token/ }],
    },
    { code: 'const weight = "font-bold";', errors: [{ message: /Text uses 3 weights/ }] },
  ],
});

tester.run("fluid/registry-type", plugin.rules["registry-type"], {
  valid: [
    '<span className="text-[length:var(--fs-body,13px)] leading-[var(--lh-body,20px)]" />',
    '<input className="pointer-coarse:text-[16px]" />',
    'const accent = "var(--fluid-accent, #6B97FF)";',
    'const ring = `var(--focus-ring,#6b97ff)`;',
  ],
  invalid: [
    { code: '<span className="text-[13px]" />', errors: [{ message: /type scale/ }] },
    { code: '<span className="text-body" />', errors: [{ message: /type scale/ }] },
    {
      code: '<input className="pointer-coarse:text-[15px]" />',
      errors: [{ message: /type scale/ }],
    },
    { code: '<span className="leading-[18px]" />', errors: [{ message: /type scale/ }] },
    { code: 'const accent = "#6B97FF";', errors: [{ message: /accent comes from the token/ }] },
    { code: 'const accent = `#6b97ff`;', errors: [{ message: /accent comes from the token/ }] },
  ],
});

it.each([
  {
    name: "a conditional Hook",
    rule: "rules-of-hooks",
    content:
      'import { useState } from "react"; export function Demo({ enabled }) { if (enabled) useState(0); return null; }',
  },
  {
    name: "a ref read during render",
    rule: "refs",
    content:
      'import { useRef } from "react"; export function Demo() { const ref = useRef(0); return <span>{ref.current}</span>; }',
  },
])("the generated-file check rejects $name", ({ rule, content }) => {
  const diagnostics = lintGeneratedFiles(
    [
      {
        path: "invalid.tsx",
        content,
      },
    ],
    reactHooksRules,
  );
  expect(diagnostics.some(({ code }) => code.includes(rule))).toBe(true);
});
