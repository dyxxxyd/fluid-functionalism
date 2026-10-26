import type { ApiTable, PropDef } from "@/lib/docs/api/types";

export const skeletonProps: PropDef[] = [
  {
    name: "className",
    type: "string",
    description:
      "Set placeholder width, height, and optional corner overrides with utility classes.",
  },
  {
    name: "style",
    type: "CSSProperties",
    description: "Inline styles, including dynamic placeholder dimensions.",
  },
  {
    name: "aria-hidden",
    type: "boolean",
    default: "true",
    description:
      "Hide decorative placeholders from assistive technology. Put aria-busy and a loading label on the surrounding region.",
  },
  { name: "ref", type: "Ref<HTMLDivElement>", description: "Access the placeholder element." },
  {
    name: "...div props",
    type: 'ComponentPropsWithoutRef<"div">',
    description:
      "Native div attributes are forwarded. Pulse stops when the user requests reduced motion.",
  },
];

export const apiReference: ApiTable[] = [{ title: "Skeleton", props: skeletonProps }];
