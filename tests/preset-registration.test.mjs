import { describe, expect, it } from "vite-plus/test";
import {
  CARD_PRESET_DEF,
  COMBOBOX_PRESET_DEF,
} from "../lib/preset/components.ts";
import {
  decodePreset,
  encodePreset,
  getAllPresetComponents,
  getPresetComponent,
  registerPresetComponent,
} from "../lib/preset/codec.ts";

describe("preset registration", () => {
  it("shares a definition between direct and barrel imports", async () => {
    const direct = await import("../lib/preset/combobox-options.ts");
    expect(direct.COMBOBOX_PRESET_DEF).toBe(COMBOBOX_PRESET_DEF);
    expect(getPresetComponent("b")).toBe(COMBOBOX_PRESET_DEF);
  });

  it("accepts registering the same object again", () => {
    const count = getAllPresetComponents().length;
    registerPresetComponent(COMBOBOX_PRESET_DEF);
    expect(getPresetComponent("b")).toBe(COMBOBOX_PRESET_DEF);
    expect(getAllPresetComponents()).toHaveLength(count);
  });

  for (const [def, reload, exportName] of [
    [COMBOBOX_PRESET_DEF, () => import("../lib/preset/combobox-options.ts?reload=1"), "COMBOBOX_PRESET_DEF"],
    [CARD_PRESET_DEF, () => import("../lib/preset/card-options.ts?reload=1"), "CARD_PRESET_DEF"],
  ]) {
    it(`can re-evaluate ${def.label} options while the codec stays loaded`, async () => {
      const count = getAllPresetComponents().length;
      const config = { flavor: "base", shape: "pill", size: "compact" };
      const code = encodePreset(def, config);

      // A fresh module instance models Next's hot reload without clearing the
      // codec's registry, just as an edit to a playground's options does.
      const reloaded = (await reload())[exportName];

      expect(reloaded).not.toBe(def);
      expect(getPresetComponent(def.tag)).toBe(reloaded);
      expect(getAllPresetComponents()).toHaveLength(count);
      expect(encodePreset(reloaded, config)).toBe(code);
      expect(decodePreset(code)).toMatchObject({ ok: true, preset: config });
    });
  }

  it("uses the refreshed schema while preserving earlier preset codes", () => {
    const before = {
      ...COMBOBOX_PRESET_DEF,
      tag: "x",
      currentVersion: "b",
      versions: {
        a: COMBOBOX_PRESET_DEF.versions.a,
        b: COMBOBOX_PRESET_DEF.versions.b,
      },
    };
    registerPresetComponent(before);
    const oldCode = encodePreset(before, { multiple: false, flavor: "base" });
    const refreshed = { ...COMBOBOX_PRESET_DEF, tag: before.tag };
    const newCode = encodePreset(refreshed, { collapseOnOverflow: true });
    expect(decodePreset(newCode).ok).toBe(false);

    registerPresetComponent(refreshed);

    expect(getPresetComponent(before.tag)).toBe(refreshed);
    expect(decodePreset(oldCode)).toMatchObject({
      ok: true,
      version: "b",
      preset: { multiple: false, flavor: "base", collapseOnOverflow: false },
    });
    expect(decodePreset(newCode)).toMatchObject({
      ok: true,
      version: "c",
      preset: { collapseOnOverflow: true },
    });
  });

  it("rejects a tag claimed by another component without replacing its owner", () => {
    const existing = getPresetComponent("b");
    const count = getAllPresetComponents().length;
    const collision = { ...CARD_PRESET_DEF, tag: existing.tag };

    expect(() => registerPresetComponent(collision)).toThrow('Preset tag "b" is already registered.');
    expect(getPresetComponent("b")).toBe(existing);
    expect(getAllPresetComponents()).toHaveLength(count);
  });
});
