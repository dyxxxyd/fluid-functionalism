import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { createPresetTypechecker, root } from "./helpers/preset-typecheck.mjs";
import { neutralizeComponentImports } from "../scripts/postbuild-registry.mjs";

const payload = (name) => JSON.parse(readFileSync(join(root, `public/r/${name}.json`), "utf8"));

describe("loading feedback installation", () => {
  it("ships Banner's light and dark status colors with a standalone Toast install", () => {
    expect(payload("toast").cssVars).toEqual(payload("banner").cssVars);
    expect(Object.keys(payload("toast").cssVars.light).sort()).toEqual([
      "info",
      "success",
      "warning",
    ]);
  });

  it("resolves Reveal's Skeleton to the Fluid registry, preserving its installed path", () => {
    expect(payload("reveal").registryDependencies).toContain(
      "https://www.fluidfunctionalism.com/r/skeleton.json",
    );
    expect(payload("skeleton").files[0].content).toBe(
      readFileSync(join(root, "registry/default/skeleton.tsx"), "utf8"),
    );
  });

  it.each(["radix", "base"])(
    "type-checks installed Skeleton and %s Toast with matching buttons",
    (flavor) => {
      const notification = payload(`${flavor}/toast`);
      expect(notification.registryDependencies).toContain(
        `https://www.fluidfunctionalism.com/r/${flavor}/button.json`,
      );
      expect(notification.files[0].content).toBe(
        neutralizeComponentImports(readFileSync(join(root, "registry/default/toast.tsx"), "utf8")),
      );
      const check = createPresetTypechecker({
        paths: {
          "@/components/ui/toast": [join(root, "__preset__/toast.tsx")],
          "@/components/ui/skeleton": [join(root, "__preset__/skeleton.tsx")],
          "@/components/ui/button": [join(root, `registry/${flavor}/button.tsx`)],
        },
      });
      expect(
        check([
          { target: "toast.tsx", content: notification.files[0].content },
          { target: "skeleton.tsx", content: payload("skeleton").files[0].content },
          {
            target: "example.tsx",
            content: `
        import { createRef } from "react";
        import { Skeleton } from "@/components/ui/skeleton";
        import { Toaster, toast, createToastManager } from "@/components/ui/toast";
        const ref = createRef<HTMLDivElement>();
        const manager = createToastManager<{ projectId: string }>();
        export function Example() {
          return <>
            <Skeleton ref={ref} className="h-4 w-24" aria-hidden="true" />
            <Toaster timeout={3000} limit={3} viewportProps={{ "aria-label": "Notifications", ref }} />
            <button onClick={() => {
              const id = toast.add({ title: "Saved", actionProps: { children: "Undo", onClick: () => toast.close(id) } });
              toast.update(id, { type: "success" });
              manager.add({ title: "Project", data: { projectId: "one" } });
            }}>Save</button>
          </>;
        }
      `,
          },
        ]),
      ).toEqual([]);
    },
  );
});
