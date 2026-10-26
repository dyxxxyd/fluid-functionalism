// @vitest-environment jsdom
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter,
  DrawerTitle, DrawerDescription, DrawerClose,
} from "@/registry/default/drawer";

window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

afterEach(cleanup);

function Content() {
  return (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Project settings</DrawerTitle>
        <DrawerDescription>Manage project access.</DrawerDescription>
      </DrawerHeader>
      <DrawerFooter><DrawerClose>Done</DrawerClose></DrawerFooter>
    </DrawerContent>
  );
}

describe("Drawer", () => {
  it("composes controls, names and describes the dialog, and restores trigger focus", async () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const { getByRole, queryByRole } = render(
      <Drawer showSwipeHandle>
        <DrawerTrigger render={<button ref={triggerRef} type="button" />}>Open drawer</DrawerTrigger>
        <Content />
      </Drawer>,
    );
    expect(queryByRole("dialog")).toBeNull();
    triggerRef.current?.focus();
    fireEvent.click(getByRole("button", { name: "Open drawer" }));
    const popup = await waitFor(() => getByRole("dialog", { name: "Project settings" }));
    const description = document.getElementById(popup.getAttribute("aria-describedby")!);
    expect(description?.textContent).toBe("Manage project access.");
    expect(document.querySelector("[data-slot=drawer-swipe-handle]")?.getAttribute("aria-hidden")).toBe("true");
    expect(document.querySelector("[data-slot=drawer-overlay]")).not.toBeNull();
    fireEvent.click(getByRole("button", { name: "Done" }));
    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(triggerRef.current));
  });

  it("closes when a parent updates the controlled open state", async () => {
    const completed = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Drawer open={open} onOpenChange={setOpen} onOpenChangeComplete={completed}>
          <DrawerTrigger>Open controlled drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Controlled</DrawerTitle>
            <DrawerDescription>Save these settings.</DrawerDescription>
            <button onClick={() => setOpen(false)}>Save</button>
          </DrawerContent>
        </Drawer>
      );
    }
    const { getByRole, queryByRole } = render(<Controlled />);
    fireEvent.click(getByRole("button", { name: "Open controlled drawer" }));
    await waitFor(() => expect(getByRole("dialog", { name: "Controlled" })).toBeDefined());
    fireEvent.click(getByRole("button", { name: "Save" }));
    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(completed).toHaveBeenCalledWith(false));
    expect(document.querySelector("[data-slot=drawer-overlay]")).toBeNull();
  });

  it("preserves cancellable Base UI dismissal events", async () => {
    const onOpenChange = vi.fn<NonNullable<React.ComponentProps<typeof Drawer>["onOpenChange"]>>((next, details) => {
      if (!next) details.cancel();
    });
    const { getByRole } = render(<Drawer defaultOpen onOpenChange={onOpenChange}><Content /></Drawer>);
    const popup = getByRole("dialog", { name: "Project settings" });
    fireEvent.click(getByRole("button", { name: "Done" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: "close-press" }));
    await waitFor(() => expect(popup.hasAttribute("data-open")).toBe(true));
  });

  it.each([
    ["down", "y"], ["up", "y"], ["left", "x"], ["right", "x"],
  ] as const)("exposes the %s direction and %s axis for consumer styling", (direction, axis) => {
    const { getByRole } = render(<Drawer defaultOpen swipeDirection={direction}><Content /></Drawer>);
    const popup = getByRole("dialog", { name: "Project settings" });
    expect(popup.getAttribute("data-swipe-direction")).toBe(direction);
    expect(popup.getAttribute("data-swipe-axis")).toBe(axis);
    expect(document.querySelector("[data-slot=drawer-swipe-handle]")).toBeNull();
  });

  it("forwards popup refs, state styles, and the portal target", () => {
    const popupRef = createRef<HTMLDivElement>();
    const container = document.createElement("div");
    document.body.append(container);
    try {
      render(
        <Drawer defaultOpen>
          <DrawerContent ref={popupRef} container={container}
            className={(state) => state.open ? "consumer-open" : "consumer-closed"}
            style={(state) => ({ color: state.open ? "red" : "blue" })}>
            <DrawerTitle>Portal target</DrawerTitle>
            <DrawerDescription>Custom container.</DrawerDescription>
          </DrawerContent>
        </Drawer>,
      );
      expect(container.contains(popupRef.current)).toBe(true);
      expect(popupRef.current?.classList.contains("consumer-open")).toBe(true);
      expect(popupRef.current?.style.color).toBe("red");
    } finally {
      cleanup();
      container.remove();
    }
  });

  it("Escape dismisses only the frontmost nested drawer", async () => {
    const parentRef = createRef<HTMLDivElement>();
    const { getByRole, queryByRole } = render(
      <Drawer defaultOpen>
        <DrawerContent ref={parentRef}>
          <DrawerTitle>Workspace</DrawerTitle>
          <DrawerDescription>Workspace settings.</DrawerDescription>
          <Drawer>
            <DrawerTrigger>Manage access</DrawerTrigger>
            <DrawerContent>
              <DrawerTitle>Access</DrawerTitle>
              <DrawerDescription>Access settings.</DrawerDescription>
              <DrawerClose>Back</DrawerClose>
            </DrawerContent>
          </Drawer>
          <DrawerClose>Done</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    fireEvent.click(getByRole("button", { name: "Manage access" }));
    const child = await waitFor(() => getByRole("dialog", { name: "Access" }));
    await waitFor(() => expect(parentRef.current?.hasAttribute("data-nested-drawer-open")).toBe(true));
    fireEvent.keyDown(child, { key: "Escape", code: "Escape" });
    await waitFor(() => expect(queryByRole("dialog", { name: "Access" })).toBeNull());
    expect(getByRole("dialog", { name: "Workspace" })).toBeDefined();
    expect(parentRef.current?.hasAttribute("data-nested-drawer-open")).toBe(false);
  });

  it.each([false, "trap-focus"] as const)("omits the blocking overlay for modal=%s", (modal) => {
    const { getByRole } = render(
      <Drawer defaultOpen modal={modal} disablePointerDismissal><Content /></Drawer>,
    );
    expect(getByRole("dialog", { name: "Project settings" })).toBeDefined();
    expect(document.querySelector("[data-slot=drawer-overlay]")).toBeNull();
    expect(document.querySelector("[data-slot=drawer-viewport]")?.getAttribute("data-modal")).toBe(String(modal));
  });

  it("updates controlled snap points without closing the drawer", async () => {
    function Snapping() {
      const [snapPoint, setSnapPoint] = useState<number | string | null>(0.45);
      return (
        <Drawer defaultOpen snapPoints={[0.45, 1]} snapPoint={snapPoint} onSnapPointChange={setSnapPoint}>
          <DrawerContent>
            <DrawerTitle>Activity</DrawerTitle>
            <DrawerDescription>Resize the drawer.</DrawerDescription>
            <button onClick={() => setSnapPoint(snapPoint === 1 ? 0.45 : 1)}>Resize</button>
          </DrawerContent>
        </Drawer>
      );
    }
    const { getByRole } = render(<Snapping />);
    const popup = getByRole("dialog", { name: "Activity" });
    expect(popup.hasAttribute("data-snap-points")).toBe(true);
    expect(popup.hasAttribute("data-expanded")).toBe(false);
    fireEvent.click(getByRole("button", { name: "Resize" }));
    await waitFor(() => expect(popup.hasAttribute("data-expanded")).toBe(true));
    fireEvent.click(getByRole("button", { name: "Resize" }));
    await waitFor(() => expect(popup.hasAttribute("data-expanded")).toBe(false));
  });
});
