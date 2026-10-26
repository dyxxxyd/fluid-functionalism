// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { Slider as BaseSlider } from "@/registry/base/slider";
import { Slider as RadixSlider } from "@/registry/radix/slider";

afterEach(cleanup);

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
window.matchMedia ??= ((media: string) => ({
  matches: false, media, onchange: null,
  addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as typeof window.matchMedia;

describe.each([["base", BaseSlider], ["radix", RadixSlider]] as const)(
  "%s Slider value editing",
  (_flavor, Slider) => {
    it("keeps an edited value inside bounds after snapping to a coarse step", () => {
      const onChange = vi.fn();
      const { getByText, getByRole } = render(
        <Slider value={0} min={0} max={10} step={6} showValue onChange={onChange} />,
      );
      fireEvent.click(getByText("0", { selector: ".cursor-text" }));
      const input = getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "10" } });
      fireEvent.blur(input);
      expect(onChange).toHaveBeenLastCalledWith(10);
    });

    it.each([[20, 90, [80, 80]], [80, 10, [20, 20]]] as const)(
      "prevents the %s endpoint from crossing its neighbor",
      (current, edited, expected) => {
        const onChange = vi.fn();
        const { getByText, getByRole } = render(
          <Slider value={[20, 80]} min={0} max={100} onChange={onChange} />,
        );
        fireEvent.click(getByText(String(current), { selector: ".cursor-text" }));
        const input = getByRole("spinbutton");
        fireEvent.change(input, { target: { value: String(edited) } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenLastCalledWith(expected);
      },
    );

    it("does not emit floating-point tails when committing decimal steps", () => {
      const onChange = vi.fn();
      const { getByText, getByRole } = render(
        <Slider value={0} min={0} max={1} step={0.1} showValue onChange={onChange} />,
      );
      fireEvent.click(getByText("0", { selector: ".cursor-text" }));
      const input = getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "0.3" } });
      fireEvent.blur(input);
      expect(onChange).toHaveBeenLastCalledWith(0.3);
    });

    it("renders a fine-step scrubber without allocating a pip for every step", () => {
      // This valid numeric range has more steps than a JS array can hold.
      // A scrubber needs no pips, so its cost must not depend on that count.
      expect(() => render(
        <Slider variant="scrubber" value={0.5} min={0} max={1} step={1e-10} onChange={() => {}} />,
      )).not.toThrow();
    });

    it.each(["pips", "scrubber"] as const)("keeps decimal %s pointer picks exact", (variant) => {
      vi.stubGlobal("PointerEvent", MouseEvent);
      try {
        const ref = createRef<HTMLDivElement>();
        const onChange = vi.fn();
        render(<Slider ref={ref} value={0.1} min={0} max={1} step={0.1}
          variant={variant} onChange={onChange} />);
        const row = ref.current!;
        row.setPointerCapture = vi.fn();
        vi.spyOn(row, "getBoundingClientRect").mockReturnValue(
          DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 32 }),
        );
        fireEvent.pointerDown(row, { clientX: 30, button: 0 });
        expect(onChange).toHaveBeenLastCalledWith(0.3);
      } finally {
        cleanup();
        vi.unstubAllGlobals();
      }
    });
  },
);
