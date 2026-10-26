import { describe, expect, it } from "vite-plus/test";
import { parseDiagnostics } from "./helpers/typescript.mjs";
import { createPresetTypechecker } from "./helpers/preset-typecheck.mjs";

describe("TypeScript 7 generated-code guards", () => {
  it("reports syntax errors and replaces stale virtual source", () => {
    expect(parseDiagnostics("demo.tsx", "export const Demo = () => <div>;").length).toBeGreaterThan(
      0,
    );
    expect(parseDiagnostics("demo.tsx", "export const Demo = () => <div />;")).toEqual([]);
  });

  it("checks types and resolves generated sibling aliases", () => {
    const typecheck = createPresetTypechecker({
      paths: { "@/virtual": ["./__preset__/value.ts"] },
    });
    const files = [
      { target: "value.ts", content: "export const value = 'wrong';" },
      {
        target: "demo.ts",
        content:
          "import { value } from '@/virtual'; const result: number = value; export { result };",
      },
    ];
    expect(typecheck(files).some((message) => message.includes("not assignable"))).toBe(true);
    files[0].content = "export const value = 1;";
    expect(typecheck(files)).toEqual([]);
  });
});
