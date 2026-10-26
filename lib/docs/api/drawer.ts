import type { ApiTable, PropDef } from "@/lib/docs/api/types";

export const drawerProps: PropDef[] = [
  { name: "open / defaultOpen", type: "boolean", default: "false", description: "Controlled or initial open state." },
  { name: "onOpenChange", type: "(open, eventDetails) => void", description: "Reports opening and dismissal. Event details include the reason and cancellation helpers." },
  { name: "onOpenChangeComplete", type: "(open: boolean) => void", description: "Runs after the opening or closing CSS transition completes." },
  { name: "swipeDirection", type: '"down" | "up" | "left" | "right"', default: '"down"', description: "Dismissal direction and the edge where the drawer appears." },
  { name: "showSwipeHandle", type: "boolean", default: "false", description: "Show a visual grip beside the content. Swiping works with or without the grip." },
  { name: "modal", type: 'boolean | "trap-focus"', default: "true", description: "true traps focus, locks page scroll, and shows an overlay. false allows page interaction; trap-focus only traps focus." },
  { name: "disablePointerDismissal", type: "boolean", default: "false", description: "Prevent outside presses from dismissing the drawer. Non-modal drawers also stay open when focus moves outside." },
  { name: "snapPoints", type: "(number | string)[]", description: "Vertical snap heights: fractions of the viewport, numbers above 1 as pixels, or px/rem strings." },
  { name: "snapPoint / defaultSnapPoint", type: "number | string | null", description: "Controlled or initial snap point. Defaults to the first snap point." },
  { name: "onSnapPointChange", type: "(snapPoint, eventDetails) => void", description: "Reports the selected snap point after a swipe." },
  { name: "snapToSequentialPoints", type: "boolean", default: "false", description: "Use drag distance to choose the next snap point without velocity-based skipping." },
];

export const drawerContentProps: PropDef[] = [
  { name: "className / style", type: "string / CSSProperties (or state callback)", description: "Customize the popup. Use h-*/max-h-* for vertical drawers and w-*/max-w-* for side drawers." },
  { name: "--drawer-inset", type: "CSS length", default: "8px", description: "Gap from the viewport edges. Set className=\"[--drawer-inset:0px]\" for a flush drawer." },
  { name: "--drawer-bleed-background", type: "CSS color", default: "transparent", description: "Background beyond the swipe edge. Transparent keeps the gap visible; set a surface color when using a flush drawer." },
  { name: "container", type: "HTMLElement | ShadowRoot | RefObject | null", default: "document.body", description: "Portal target. Positioning still uses the viewport." },
  { name: "initialFocus / finalFocus", type: "boolean | RefObject | function", default: "true", description: "Choose the element focused on opening and after dismissal." },
  { name: "ref", type: "Ref<HTMLDivElement>", description: "Access the popup element." },
];

export const drawerCompositionProps: PropDef[] = [
  { name: "DrawerTrigger / DrawerClose render", type: "ReactElement | render function", description: "Compose with a Button or another control using the Base UI render API. Native control props and refs are forwarded." },
  { name: "DrawerHeader / DrawerFooter", type: "ComponentProps<div>", description: "Padded flex regions. Footer stays below the scrollable body." },
  { name: "DrawerTitle / DrawerDescription", type: "Base UI Title / Description props", description: "Accessible drawer name and description, styled with the shared type scale." },
  { name: "DrawerPortal / DrawerOverlay / DrawerSwipeHandle", type: "Base UI Portal / Backdrop / div props", description: "Lower-level composition helpers. DrawerContent already composes the portal, overlay, viewport, and popup." },
];

export const apiReference: ApiTable[] = [
  { title: "Drawer", props: drawerProps },
  { title: "DrawerContent", props: drawerContentProps },
  { title: "Composition", props: drawerCompositionProps },
];
