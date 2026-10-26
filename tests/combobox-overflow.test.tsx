// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import * as Base from "@/registry/base/combobox";
import * as Radix from "@/registry/radix/combobox";

const items = ["Alpha", "Bravo", "Charlie", "Delta", "Echo"];
let rowWidth = 260;
let chipWidth = 80;
const observers = new Set<ResizeObserverMock>();

class ResizeObserverMock {
  callback: ResizeObserverCallback;
  elements = new Set<Element>();
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    observers.add(this);
  }
  observe(element: Element) { this.elements.add(element); }
  unobserve(element: Element) { this.elements.delete(element); }
  disconnect() { observers.delete(this); }
}

window.matchMedia ??= ((query: string) => ({
  matches: false, media: query, onchange: null,
  addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as typeof window.matchMedia;
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

beforeEach(() => {
  rowWidth = 260;
  chipWidth = 80;
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-combobox-chip-row") ? rowWidth : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.hasAttribute("data-combobox-chip-row") ? 24 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    if (this.hasAttribute("data-combobox-chip")) return chipWidth;
    if (this.hasAttribute("data-combobox-overflow")) return 44;
    return 0;
  });
  const computedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
    const style = computedStyle(element, pseudo);
    if (element.hasAttribute("data-combobox-chip-row")) style.columnGap = "4px";
    return style;
  });
});

afterEach(() => {
  cleanup();
  expect(observers.size).toBe(0);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function resize(width: number) {
  rowWidth = width;
  act(() => {
    for (const observer of Array.from(observers)) {
      if (Array.from(observer.elements).some((element) => element.hasAttribute("data-combobox-chip-row"))) {
        observer.callback([], observer as unknown as ResizeObserver);
      }
    }
  });
}

describe.each([["Base UI", Base], ["Radix", Radix]] as const)("%s chip overflow", (_name, C) => {
  const mount = (collapseOnOverflow?: boolean, extras: { clearable?: boolean; disabled?: boolean } = {}) => {
    const onValueChange = vi.fn();
    const view = render(
      <form>
        <C.Combobox multiple name="components" items={items} defaultValue={items} onValueChange={onValueChange} disabled={extras.disabled}>
          <C.ComboboxChips collapseOnOverflow={collapseOnOverflow} clearable={extras.clearable} aria-label="Components" />
        </C.Combobox>
      </form>
    );
    return { ...view, onValueChange };
  };
  const visibleChips = (container: HTMLElement) =>
    [...container.querySelectorAll<HTMLElement>("[data-combobox-chip]")].filter((chip) => chip.getAttribute("aria-hidden") !== "true");
  const counter = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-combobox-overflow]")!;

  it("defaults to wrapping with every selected chip available", () => {
    const { container, getAllByRole } = mount();
    expect(getAllByRole("button", { name: /^Remove / })).toHaveLength(5);
    expect(visibleChips(container)).toHaveLength(5);
    expect(container.querySelector("[data-combobox-chip-row]")?.className).toContain("flex-wrap");
    expect(counter(container)).toBeNull();
  });

  it("reserves the counter and input, adapts to resizing, and preserves form values", () => {
    const { container, getByRole } = mount(true);
    expect(visibleChips(container)).toHaveLength(2);
    expect(counter(container).getAttribute("aria-label")).toBe("3 more selected: Charlie, Delta, Echo");
    for (const chip of container.querySelectorAll('[data-combobox-chip][aria-hidden="true"]')) {
      expect(chip.hasAttribute("inert")).toBe(true);
      expect((chip as HTMLElement).style.position).toBe("absolute");
    }
    expect(new FormData(container.querySelector("form")!).getAll("components")).toEqual(items);
    expect(getByRole("combobox").hasAttribute("collapseOnOverflow")).toBe(false);

    resize(500);
    expect(visibleChips(container)).toHaveLength(5);
    expect(counter(container).getAttribute("aria-hidden")).toBe("true");
    resize(100);
    expect(visibleChips(container)).toHaveLength(0);
    expect(counter(container).getAttribute("aria-label")).toBe("5 more selected: Alpha, Bravo, Charlie, Delta, Echo");
    resize(260);
    chipWidth = 120;
    resize(260); // A label/font width change also triggers ResizeObserver.
    expect(visibleChips(container)).toHaveLength(1);
  });

  it("removes a visible chip without counting its exiting DOM node", () => {
    const { container, getByRole, onValueChange } = mount(true);
    fireEvent.click(getByRole("button", { name: "Remove Alpha" }));
    expect(onValueChange).toHaveBeenLastCalledWith(items.slice(1));
    expect(counter(container).getAttribute("aria-label")).toBe("2 more selected: Delta, Echo");
  });

  it("Backspace removes the actual last selection, including a hidden chip", () => {
    const { getByRole, onValueChange } = mount(true);
    fireEvent.keyDown(getByRole("combobox"), { key: "Backspace" });
    expect(onValueChange).toHaveBeenLastCalledWith(items.slice(0, -1));
  });

  it("clears all picks and restores the input", () => {
    const { container, getByRole, onValueChange } = mount(true, { clearable: true });
    fireEvent.click(getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(counter(container)).toBeNull();
    expect((getByRole("combobox") as HTMLInputElement).value).toBe("");
  });

  it("does not remove disabled picks", () => {
    const { getByRole, onValueChange } = mount(true, { disabled: true });
    fireEvent.click(getByRole("button", { name: "Remove Alpha" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("Base UI collapsed chip keyboard navigation", () => {
  it("visits only visible chips and returns focus when a resize hides the focused chip", () => {
    const { container, getByRole } = render(
      <Base.Combobox multiple items={items} defaultValue={items}>
        <Base.ComboboxChips collapseOnOverflow />
      </Base.Combobox>
    );
    const input = getByRole("combobox") as HTMLInputElement;
    const chip = (index: number) => container.querySelector<HTMLElement>(`[data-combobox-chip="${index}"] [tabindex]`)!;
    act(() => input.focus());
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(chip(1));
    fireEvent.keyDown(chip(1), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(chip(0));
    fireEvent.keyDown(chip(0), { key: "ArrowRight" });
    expect(document.activeElement).toBe(chip(1));
    fireEvent.keyDown(chip(1), { key: "ArrowRight" });
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    resize(100);
    expect(document.activeElement).toBe(input);
  });

  it("deletes a visible focused chip and focuses the input", () => {
    const onValueChange = vi.fn();
    const { container, getByRole } = render(
      <Base.Combobox multiple items={items} defaultValue={items} onValueChange={onValueChange}>
        <Base.ComboboxChips collapseOnOverflow />
      </Base.Combobox>
    );
    const input = getByRole("combobox");
    act(() => input.focus());
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    const focusedChip = container.querySelector<HTMLElement>('[data-combobox-chip="1"] [tabindex]')!;
    fireEvent.keyDown(focusedChip, { key: "Delete" });
    expect(onValueChange).toHaveBeenLastCalledWith([items[0], ...items.slice(2)]);
    expect(document.activeElement).toBe(input);
  });
});
