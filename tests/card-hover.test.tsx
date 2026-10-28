// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { Card, CardGroup } from "@/registry/default/card";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
window.matchMedia ??= ((media: string) => ({
  matches: false, media, onchange: null,
  addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as typeof window.matchMedia;

describe("CardGroup disabled cards", () => {
  it("highlights only enabled cards under the pointer and leaves gap clicks inert", async () => {
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(60);
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
      return Number(this.dataset.fluidHoverIndex ?? 0) * 64;
    });
    const onSelect = vi.fn();
    const onDismiss = vi.fn();
    const { container, getByRole, rerender } = render(
      <CardGroup separated>
        <Card disabled onClick={() => {}} dismissible onDismiss={onDismiss} label="Unavailable">Unavailable</Card>
        <Card onClick={onSelect} label="Available">Available</Card>
      </CardGroup>,
    );
    const group = container.querySelector<HTMLElement>('[data-slot="card-group"]')!;
    vi.spyOn(group, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 128, width: 200, height: 128,
      toJSON: () => ({}),
    });
    for (const card of container.querySelectorAll<HTMLElement>('[data-slot="card"]')) {
      const top = Number(card.dataset.fluidHoverIndex) * 64;
      vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
        x: 0, y: top, left: 0, top, right: 200, bottom: top + 60, width: 200, height: 60,
        toJSON: () => ({}),
      });
    }
    await act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    const [disabledCard, enabledCard] = container.querySelectorAll<HTMLElement>('[data-slot="card"]');
    fireEvent.mouseMove(disabledCard, { clientX: 10, clientY: 10 });
    await act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    expect(group.hasAttribute("data-fluid-hover-active-index")).toBe(false);
    fireEvent.mouseMove(enabledCard, { clientX: 10, clientY: 100 });
    await waitFor(() => expect(group.getAttribute("data-fluid-hover-active-index")).toBe("1"));
    fireEvent.click(group, { clientX: 10, clientY: 62 });
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.mouseMove(group, { clientX: 10, clientY: 62 });
    await waitFor(() => expect(group.hasAttribute("data-fluid-hover-active-index")).toBe(false));
    fireEvent.click(getByRole("button", { name: "Available" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onDismiss).not.toHaveBeenCalled();
    rerender(<CardGroup separated>
      <Card disabled onClick={() => {}} label="Unavailable">Unavailable</Card>
      <Card disabled onClick={onSelect} label="Available">Available</Card>
    </CardGroup>);
    fireEvent.mouseMove(enabledCard, { clientX: 10, clientY: 100 });
    await waitFor(() => expect(group.hasAttribute("data-fluid-hover-active-index")).toBe(false));
  });
});
