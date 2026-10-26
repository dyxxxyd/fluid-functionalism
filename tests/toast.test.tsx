// @vitest-environment jsdom
import { createRef } from "react";
import { Banner, BannerTitle, type BannerStatus } from "@/registry/default/banner";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  Toaster,
  Toast,
  ToastProvider,
  ToastViewport,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  createToastManager,
  useToastManager,
} from "@/registry/default/toast";

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

describe("Toast", () => {
  it.each<BannerStatus>(["default", "info", "success", "warning", "error"])(
    "matches Banner's %s status icon, size, and color token",
    async (status) => {
      const manager = createToastManager();
      render(
        <>
          <Banner status={status}>
            <BannerTitle>Banner status</BannerTitle>
          </Banner>
          <Toaster toastManager={manager} timeout={0} />
        </>,
      );
      act(() => {
        manager.add({ type: status, title: "Toast status" });
      });
      await waitFor(() =>
        expect(document.querySelector("[data-slot=toast-icon] svg")).not.toBeNull(),
      );
      const banner = document.querySelector<HTMLElement>("[data-slot=banner]");
      const bannerIcon = banner?.querySelector("span[aria-hidden=true] svg");
      const toastIcon = document.querySelector("[data-slot=toast-icon] svg");
      expect(toastIcon?.outerHTML).toBe(bannerIcon?.outerHTML);
      expect(document.querySelector<HTMLElement>("[data-slot=toast-icon]")?.style.color).toBe(
        banner?.style.getPropertyValue("--banner-tone"),
      );
    },
  );

  it("enters the notification region with F6 and restores focus with Shift+Tab", async () => {
    const manager = createToastManager();
    const { getByRole } = render(
      <>
        <button type="button">Continue editing</button>
        <Toaster toastManager={manager} timeout={0} />
      </>,
    );
    act(() => {
      manager.add({ title: "Changes saved" });
    });
    const previous = getByRole("button", { name: "Continue editing" });
    previous.focus();
    fireEvent.keyDown(previous, { key: "F6" });
    const viewport = getByRole("region", { name: "Notifications" });
    await waitFor(() => expect(document.activeElement).toBe(viewport));
    fireEvent.keyDown(viewport, { key: "Tab", shiftKey: true });
    await waitFor(() => expect(document.activeElement).toBe(previous));
  });

  it("adds, updates, deduplicates, and closes notifications through an external manager", async () => {
    const manager = createToastManager();
    const onClose = vi.fn();
    const onRemove = vi.fn();
    const { getByRole, queryByRole } = render(<Toaster toastManager={manager} timeout={0} />);
    let id = "";
    act(() => {
      id = manager.add({
        id: "upload",
        title: "Uploading",
        description: "Please wait",
        type: "loading",
        onClose,
        onRemove,
      });
    });
    await waitFor(() => expect(getByRole("heading", { name: "Uploading" })).toBeDefined());
    const root = document.querySelector("[data-slot=toast]");
    expect(root?.getAttribute("aria-labelledby")).toBe(
      getByRole("heading", { name: "Uploading" }).id,
    );
    expect(document.querySelector("[data-slot=toast-description]")?.textContent).toBe(
      "Please wait",
    );
    act(() => manager.update(id, { title: "Uploaded", type: "success" }));
    await waitFor(() => expect(getByRole("heading", { name: "Uploaded" })).toBeDefined());
    act(() => {
      manager.add({ id, title: "Upload complete" });
    });
    await waitFor(() => expect(getByRole("heading", { name: "Upload complete" })).toBeDefined());
    expect(document.querySelectorAll("[data-slot=toast]")).toHaveLength(1);
    act(() => manager.close(id));
    await waitFor(() => expect(queryByRole("heading", { name: "Upload complete" })).toBeNull());
    expect(onClose).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("runs an action with native event props and closes from the action or dismiss button", async () => {
    const manager = createToastManager();
    const action = vi.fn();
    const { getByRole, queryByRole } = render(<Toaster toastManager={manager} timeout={0} />);
    let id = "";
    act(() => {
      id = manager.add({
        title: "Event archived",
        actionProps: {
          children: "Undo",
          onClick: () => {
            action();
            manager.close(id);
          },
        },
      });
    });
    fireEvent.click(getByRole("button", { name: "Undo" }));
    expect(action).toHaveBeenCalledOnce();
    await waitFor(() => expect(queryByRole("heading", { name: "Event archived" })).toBeNull());
    act(() => {
      manager.add({ title: "Another event" });
    });
    fireEvent.focus(document.querySelector("[data-slot=toast-close]")!);
    fireEvent.click(getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(queryByRole("heading", { name: "Another event" })).toBeNull());
  });

  it.each([true, false])(
    "updates one promise toast through loading and its settled state (success=%s)",
    async (succeed) => {
      const manager = createToastManager();
      const { getByRole, queryByRole } = render(<Toaster toastManager={manager} timeout={0} />);
      const task = Promise.withResolvers<string>();
      let completion: Promise<string>;
      act(() => {
        completion = manager.promise(task.promise, {
          loading: { title: "Saving" },
          success: (value) => ({ title: `Saved ${value}` }),
          error: { title: "Save failed" },
        });
      });
      await waitFor(() => expect(getByRole("heading", { name: "Saving" })).toBeDefined());
      const first = document.querySelector("[data-slot=toast]");
      if (succeed) {
        await act(async () => {
          task.resolve("event");
          expect(await completion!).toBe("event");
        });
      } else {
        await act(async () => {
          task.reject(new Error("Network unavailable"));
          await expect(completion!).rejects.toThrow("Network unavailable");
        });
      }
      await waitFor(() =>
        expect(
          getByRole("heading", { name: succeed ? "Saved event" : "Save failed" }),
        ).toBeDefined(),
      );
      expect(queryByRole("heading", { name: "Saving" })).toBeNull();
      expect(document.querySelectorAll("[data-slot=toast]")).toHaveLength(1);
      expect(document.querySelector("[data-slot=toast]")).toBe(first);
    },
  );

  it("keeps managers isolated and dismisses all only within the chosen provider", async () => {
    const first = createToastManager();
    const second = createToastManager();
    const { getByRole, queryByRole } = render(
      <>
        <Toaster toastManager={first} timeout={0} />
        <Toaster toastManager={second} timeout={0} />
      </>,
    );
    act(() => {
      first.add({ title: "First manager" });
      first.add({ title: "First again" });
      second.add({ title: "Second manager" });
    });
    act(() => first.close());
    await waitFor(() => expect(queryByRole("heading", { name: "First manager" })).toBeNull());
    expect(queryByRole("heading", { name: "First again" })).toBeNull();
    expect(getByRole("heading", { name: "Second manager" })).toBeDefined();
  });

  it("makes entries beyond the visible limit inert and preserves the newest toast", async () => {
    const manager = createToastManager();
    render(<Toaster toastManager={manager} timeout={0} limit={2} />);
    act(() => {
      for (let i = 1; i <= 3; i++) manager.add({ title: `Notification ${i}` });
    });
    await waitFor(() =>
      expect(document.querySelectorAll("[data-slot=toast][data-limited]")).toHaveLength(1),
    );
    const limited = document.querySelector("[data-slot=toast][data-limited]");
    expect(limited?.hasAttribute("inert")).toBe(true);
    expect(limited?.textContent).toContain("Notification 1");
    expect(document.querySelector("[data-slot=toast]:not([data-limited])")?.textContent).toContain(
      "Notification 3",
    );
  });

  it("forwards composition refs, state callbacks, native attributes, and the portal target", async () => {
    const manager = createToastManager();
    const viewportRef = createRef<HTMLDivElement>();
    const rootRef = createRef<HTMLDivElement>();
    const titleRef = createRef<HTMLHeadingElement>();
    const container = document.createElement("div");
    document.body.append(container);
    function CustomList() {
      return useToastManager().toasts.map((item) => (
        <Toast
          key={item.id}
          ref={rootRef}
          toast={item}
          swipeDirection="left"
          className={(state) => `consumer-${state.type}`}
          style={(state) => ({ color: state.type === "success" ? "green" : "red" })}
        >
          <ToastContent>
            <ToastTitle ref={titleRef} />
            <ToastDescription />
            <ToastAction render={<button data-custom-action="" />} />
            <ToastClose render={<button />} />
          </ToastContent>
        </Toast>
      ));
    }
    try {
      const { unmount } = render(
        <Toaster
          toastManager={manager}
          timeout={0}
          container={container}
          viewportProps={{
            ref: viewportRef,
            "aria-label": "Project notifications",
            className: "custom-viewport",
          }}
        />,
      );
      act(() => {
        manager.add({ title: "Portalled notification" });
      });
      await waitFor(() => expect(container.querySelector("[data-slot=toast]")).not.toBeNull());
      expect(container.contains(viewportRef.current)).toBe(true);
      expect(viewportRef.current?.getAttribute("aria-label")).toBe("Project notifications");
      expect(viewportRef.current?.classList.contains("custom-viewport")).toBe(true);
      unmount();
      render(
        <ToastProvider toastManager={manager} timeout={0}>
          <ToastViewport>
            <CustomList />
          </ToastViewport>
        </ToastProvider>,
      );
      act(() => {
        manager.add({
          title: "Custom composition",
          type: "success",
          actionProps: { children: "Open" },
        });
      });
      await waitFor(() => expect(titleRef.current?.textContent).toBe("Custom composition"));
      expect(rootRef.current?.classList.contains("consumer-success")).toBe(true);
      expect(rootRef.current?.style.color).toBe("green");
      expect(document.querySelector("[data-custom-action]")?.textContent).toBe("Open");
    } finally {
      cleanup();
      container.remove();
    }
  });
});
