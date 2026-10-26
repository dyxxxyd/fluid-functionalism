// @vitest-environment jsdom
/**
 * Copy controls use the Clipboard API without selecting a temporary field
 * when access is unavailable or denied. InputMessage merges a consumer's
 * textareaProps.className with the field's own classes instead of letting
 * it replace them (which dropped the 16px touch size with everything else).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { InputCopy } from "@/registry/default/input-copy";
import { InputMessage } from "@/registry/default/input-message";
import { CopyPromptButton } from "@/lib/docs/copy-prompt-button";
import { fieldTouchClass } from "@/registry/default/lib/type-scale";

afterEach(cleanup);

// jsdom has neither ResizeObserver nor matchMedia; the composer and the
// tooltip want both.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}
window.matchMedia ??= ((query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList) as typeof window.matchMedia;

const value = "npx shadcn@latest add @fluid/input-copy";

describe.each([
  ["InputCopy", (onCopy: () => void) => render(<InputCopy value={value} onCopy={onCopy} />)],
  ["CopyPromptButton", (onCopy: () => void) => render(<CopyPromptButton prompt={value} onCopy={onCopy} />)],
] as const)("%s clipboard writes", (name, mount) => {
  const clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  const writeText = vi.fn<(text: string) => Promise<void>>();

  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (clipboard) Object.defineProperty(navigator, "clipboard", clipboard);
    else Reflect.deleteProperty(navigator, "clipboard");
  });

  it("copies the whole value and reports success", async () => {
    const onCopy = vi.fn();
    const { container } = mount(onCopy);
    const button = container.querySelector("button")!;
    await act(async () => {
      fireEvent.click(button);
    });
    expect(writeText).toHaveBeenCalledExactlyOnceWith(value);
    expect(onCopy).toHaveBeenCalledOnce();
    expect(button.getAttribute("aria-label") ?? button.textContent).toContain("Copied");
  });

  it.each(["denied", "unavailable"] as const)("handles %s clipboard access without selecting a field", async (failure) => {
    if (failure === "denied") writeText.mockRejectedValue(new Error("permission denied"));
    else Reflect.deleteProperty(navigator, "clipboard");
    const select = vi.spyOn(HTMLTextAreaElement.prototype, "select");
    const onCopy = vi.fn();
    const { container } = mount(onCopy);
    const button = container.querySelector("button")!;
    await act(async () => {
      fireEvent.click(button);
    });
    expect(select).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-label") ?? button.textContent).not.toContain("Copied");
    if (name === "InputCopy") expect(button.getAttribute("aria-label")).toBe("Copy failed");
    expect(document.body.querySelector("textarea")).toBeNull();
  });
});

describe("InputMessage textareaProps.className", () => {
  it("adds to the field's classes, so the touch size survives it", () => {
    const { container } = render(
      <InputMessage value="" onValueChange={() => {}} textareaProps={{ className: "font-mono" }} />
    );
    const classes = container.querySelector("textarea")!.className.split(/\s+/);
    expect(classes).toContain("font-mono");
    expect(classes).toContain(fieldTouchClass);
    expect(classes).toContain("resize-none");
  });
});
