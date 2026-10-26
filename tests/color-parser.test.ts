import { describe, expect, it } from "vite-plus/test";
import { parseColor } from "@/registry/default/color-picker";

describe("ColorPicker color parsing", () => {
  it("scales percentage RGB channels and alpha independently", () => {
    expect(parseColor("rgb(100% 50% 0% / 25%)")).toEqual({ r: 255, g: 127.5, b: 0, a: 0.25 });
    expect(parseColor("rgba(100%, 0%, 0%, 0.5)")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it.each(["0.5turn", "200grad", `${Math.PI}rad`, "180deg"])(
    "interprets the hue angle %s in HSL and OKLCH",
    (angle) => {
      const hsl = parseColor(`hsl(${angle} 100% 50%)`)!;
      expect(hsl.r).toBeCloseTo(0);
      expect(hsl.g).toBeCloseTo(255);
      expect(hsl.b).toBeCloseTo(255);
      const actual = parseColor(`oklch(60% 0.1 ${angle})`)!;
      const expected = parseColor("oklch(0.6 0.1 180)")!;
      expect(actual.r).toBeCloseTo(expected.r);
      expect(actual.g).toBeCloseTo(expected.g);
      expect(actual.b).toBeCloseTo(expected.b);
    },
  );

  it("maps OKLCH chroma percentages to their 0.4 reference range", () => {
    expect(parseColor("oklch(60% 25% 180)")).toEqual(parseColor("oklch(0.6 0.1 180)"));
  });

  it.each([
    "rgb(12junk 0 0)", "rgba(255 0 0 / 50oops)", "rgb(255 0 0 1 2)",
    "hsl(Infinity 100% 50%)", "hsl(1e999 100% 50%)", "hsl(12wat 100% 50%)",
    "oklch(0.5 1e999 180)", "oklch(0.5 0.1 120%)",
  ])("rejects invalid or non-finite channels in %s", (color) => {
    expect(parseColor(color)).toBeNull();
  });
});
