import type { ApiTable, PropDef } from "@/lib/docs/api/types";

export const toasterProps: PropDef[] = [
  {
    name: "toastManager",
    type: "ReturnType<typeof createToastManager>",
    default: "toast",
    description: "Manager rendered by this toaster. Mount one toaster per manager.",
  },
  {
    name: "timeout",
    type: "number",
    default: "5000",
    description:
      "Default auto-dismiss delay in milliseconds. Zero keeps notifications open until dismissed.",
  },
  {
    name: "limit",
    type: "number",
    default: "3",
    description:
      "Maximum visible notifications. Older entries become inert and hidden when the limit is exceeded.",
  },
  {
    name: "viewportProps",
    type: "ToastPrimitive.Viewport.Props",
    description:
      "Viewport className, style, accessible label, ref, and native props. Classes and styles can be state callbacks.",
  },
  {
    name: "container",
    type: "HTMLElement | ShadowRoot | RefObject | null",
    default: "document.body",
    description: "Portal target for the viewport.",
  },
  {
    name: "children",
    type: "ReactNode",
    description: "Optional subtree that can call useToastManager for this toaster.",
  },
];

export const toastManagerProps: PropDef[] = [
  {
    name: "add(options)",
    type: "(options: ToastManagerAddOptions) => string",
    description:
      "Create a toast and return its ID. Reusing an ID updates it in place and refreshes its timer.",
  },
  {
    name: "update(id, options)",
    type: "(id, options | updater) => void",
    description:
      "Update the title, description, type, action, timeout, or custom data of an existing toast.",
  },
  {
    name: "close(id?)",
    type: "(id?: string) => void",
    description: "Dismiss one toast, or all toasts when the ID is omitted.",
  },
  {
    name: "promise(promise, options)",
    type: "Promise<Value>",
    description:
      "Render loading, success, and error on the same toast. Returns the original result; handle a rejected promise at the call site.",
  },
  {
    name: "title / description",
    type: "ReactNode",
    description: "Notification heading and optional supporting message.",
  },
  {
    name: "type",
    type: '"default" | "info" | "success" | "warning" | "error" | "loading" | string',
    default: '"default"',
    description:
      "Status icons and colors match Banner. Default shows a neutral info icon, loading shows a spinner, and unknown custom types have no icon.",
  },
  {
    name: "id / timeout",
    type: "string / number",
    description:
      "Stable ID for deduplication, and a per-toast delay that overrides the provider timeout.",
  },
  {
    name: "priority",
    type: '"low" | "high"',
    default: '"low"',
    description: "Low announces politely. High announces urgently.",
  },
  {
    name: "actionProps",
    type: 'ComponentPropsWithoutRef<"button">',
    description:
      "Action label, click handler, and native button props. Call close(id) to dismiss after an action.",
  },
  {
    name: "onClose / onRemove",
    type: "() => void",
    description: "Run when dismissal begins or after its exit transition finishes.",
  },
  { name: "data", type: "object", description: "Custom metadata for a composed renderer." },
];

export const toastCompositionProps: PropDef[] = [
  {
    name: "ToastProvider / ToastPortal / ToastViewport",
    type: "Base UI Provider / Portal / Viewport props",
    description:
      "Lower-level composition helpers. Toaster already includes them and the default notification list.",
  },
  {
    name: "Toast toast",
    type: "ToastPrimitive.Root.ToastObject",
    description: "The notification object returned by useToastManager().toasts.",
  },
  {
    name: "Toast swipeDirection",
    type: '"up" | "down" | "left" | "right" | array',
    default: '["down", "right"]',
    description: "Allowed directions for swipe dismissal.",
  },
  {
    name: "ToastContent / ToastTitle / ToastDescription",
    type: "Base UI Content / Title / Description props",
    description:
      "Styled parts that read the toast object and keep its accessible name and message connected.",
  },
  {
    name: "ToastAction / ToastClose render",
    type: "ReactElement | render function",
    description:
      "Compose with another control using the Base UI render API. Defaults to Fluid buttons.",
  },
  {
    name: "className / style / ref",
    type: "Base UI component props",
    description:
      "All DOM parts forward refs and native attributes, with state callbacks for classes and styles.",
  },
  {
    name: "createToastManager / useToastManager",
    type: "Base UI manager utilities",
    description:
      "Create an isolated manager or read a provider's reactive toasts and manager methods.",
  },
];

export const apiReference: ApiTable[] = [
  { title: "Toaster", props: toasterProps },
  { title: "Toast manager", props: toastManagerProps },
  { title: "Composition", props: toastCompositionProps },
];
