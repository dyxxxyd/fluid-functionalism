// @vitest-environment jsdom
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { InputNumber } from "@/registry/default/input-number";
import { SizeProvider, fieldTouchClass } from "@/registry/default/lib/size-context";

afterEach(cleanup);

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

describe("InputNumber", () => {
  it("keeps partial editing text and reports numbers or null, never NaN", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<InputNumber aria-label="Amount" onChange={onChange} />);
    const input = getByRole("textbox", { name: "Amount" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "-" } });
    expect(input.value).toBe("-");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "-1.20" } });
    expect(input.value).toBe("-1.20");
    expect(onChange).toHaveBeenLastCalledWith(-1.2);
    fireEvent.blur(input);
    expect(input.value).toBe("-1.2");
    fireEvent.change(input, { target: { value: "invalid" } });
    expect(input.value).toBe("-1.2");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe("");
  });

  it("steps decimals with buttons and keys, clamps at bounds, and normalizes on blur", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <InputNumber
        aria-label="Quantity"
        defaultValue={0.1}
        min={0}
        max={0.3}
        step={0.1}
        onChange={onChange}
      />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    const increment = getByRole("button", { name: "Increase" });
    fireEvent.click(increment);
    expect(input.value).toBe("0.2");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("0.3");
    expect(increment.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(increment);
    expect(onChange).toHaveBeenLastCalledWith(0.3);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.value).toBe("0.2");
    fireEvent.change(input, { target: { value: "9" } });
    fireEvent.blur(input);
    expect(input.value).toBe("0.3");
  });

  it("applies precision on commit without replacing the user's typing", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <InputNumber defaultValue={1} precision={2} onChange={onChange} aria-label="Price" />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("1.00");
    fireEvent.change(input, { target: { value: "1.239" } });
    expect(input.value).toBe("1.239");
    fireEvent.blur(input);
    expect(input.value).toBe("1.24");
    expect(onChange).toHaveBeenLastCalledWith(1.24);
  });

  it.each([
    [0.7, 0.1, "0.8"],
    [0.2, 0.1, "0.3"],
    [0.0000002, 0.0000001, "0.0000003"],
  ])("steps %s by %s without floating-point tails", (initial, step, expected) => {
    const { getByRole } = render(
      <InputNumber defaultValue={initial} step={step} aria-label="Decimal step" />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe(expected);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(Number(input.value)).toBe(initial);
  });

  it("preserves typed precision independently of the step", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<InputNumber onChange={onChange} aria-label="Precise value" />);
    const input = getByRole("textbox") as HTMLInputElement;
    const text = "1.1234567890123457";
    fireEvent.change(input, { target: { value: text } });
    fireEvent.blur(input);
    expect(input.value).toBe(text);
    expect(onChange).toHaveBeenLastCalledWith(Number(text));
  });

  it("keeps wheel stepping opt-in and limited to the focused input", () => {
    const { getByRole, rerender } = render(
      <InputNumber defaultValue={2} aria-label="Wheel value" />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    act(() => input.focus());
    fireEvent.wheel(input, { deltaY: -100 });
    expect(input.value).toBe("2");
    rerender(<InputNumber defaultValue={2} changeOnWheel aria-label="Wheel value" />);
    act(() => input.blur());
    fireEvent.wheel(input, { deltaY: -100 });
    expect(input.value).toBe("2");
    act(() => input.focus());
    fireEvent.wheel(input, { deltaY: -100 });
    expect(input.value).toBe("3");
  });

  it("focuses the editable input when an affix is clicked", () => {
    const { container, getByRole } = render(<InputNumber prefix="$" aria-label="Affix focus" />);
    fireEvent.mouseDown(container.querySelector('[data-slot="input-number-prefix"]')!);
    expect(document.activeElement).toBe(getByRole("textbox"));
  });

  it("follows controlled values and does not emit changes when props or bounds change", () => {
    const onChange = vi.fn();
    const { getByRole, rerender } = render(
      <InputNumber value={3} min={0} max={10} onChange={onChange} aria-label="Controlled" />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    rerender(<InputNumber value={8} min={0} max={5} onChange={onChange} aria-label="Controlled" />);
    expect(input.value).toBe("8");
    expect(onChange).not.toHaveBeenCalled();
    rerender(<InputNumber value={null} onChange={onChange} aria-label="Controlled" />);
    expect(input.value).toBe("");
  });

  it("supports controlled editing, forwarded refs and unformatted form submission", () => {
    const ref = createRef<HTMLInputElement>();
    function Example() {
      const [value, setValue] = useState<number | null>(12.5);
      return (
        <form>
          <label htmlFor="price">Price</label>
          <InputNumber
            id="price"
            name="price"
            value={value}
            onChange={setValue}
            ref={ref}
            locale="en-US"
            format={{ style: "currency", currency: "USD" }}
          />
        </form>
      );
    }
    const { getByRole, container } = render(<Example />);
    const input = getByRole("textbox", { name: "Price" }) as HTMLInputElement;
    expect(ref.current).toBe(input);
    act(() => ref.current?.focus());
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(new FormData(container.querySelector("form")!).get("price")).toBe("13.5");
    expect(input.value).toContain("$");
  });

  it.each(["disabled", "readOnly"] as const)("%s blocks keyboard and button changes", (state) => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <InputNumber
        {...{ [state]: true }}
        defaultValue={2}
        onChange={onChange}
        aria-label="Locked"
      />,
    );
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input[state]).toBe(true);
    fireEvent.click(getByRole("button", { name: "Increase" }));
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("2");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("inherits the size ladder, preserves touch text sizing, and can hide controls", () => {
    const { container, getByRole, queryByRole } = render(
      <SizeProvider size="compact">
        <InputNumber
          aria-label="Count"
          controls={false}
          status="error"
          aria-describedby="count-help"
        />
      </SizeProvider>,
    );
    const input = getByRole("textbox");
    expect(input.className.split(/\s+/)).toContain(fieldTouchClass);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("count-help");
    expect(container.querySelector('[data-slot="input-number"]')?.className.split(/\s+/)).toContain(
      "h-7",
    );
    expect(queryByRole("button")).toBeNull();
  });

  it("keeps decimal keyboard input when a consumer cancels arrow handling", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <InputNumber
        defaultValue={1}
        onChange={onChange}
        aria-label="Custom keyboard"
        onKeyDown={(event) => event.preventDefault()}
      />,
    );
    fireEvent.keyDown(getByRole("textbox"), { key: "ArrowUp" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
