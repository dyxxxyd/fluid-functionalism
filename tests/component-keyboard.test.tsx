// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { InputField, InputGroup } from "@/registry/default/input-group";
import { InputMessage } from "@/registry/default/input-message";
import { AskUserQuestions } from "@/registry/default/ask-user-questions";

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

describe("InputField focus callbacks", () => {
  it("preserves its focus styling alongside consumer callbacks", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { getByRole } = render(
      <InputGroup>
        <InputField index={0} label="Name" value="" onChange={() => {}}
          onFocus={onFocus} onBlur={onBlur} />
      </InputGroup>,
    );
    const input = getByRole("textbox");
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(input.parentElement?.classList.contains("bg-card")).toBe(true);
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledOnce();
    expect(input.parentElement?.classList.contains("bg-card")).toBe(false);
  });
});

describe("IME keyboard ownership", () => {
  it.each(["other", "single-line", "multiline"] as const)(
    "keeps the %s question open while confirming a composed answer",
    (mode) => {
      const onComplete = vi.fn();
      const { getByRole } = render(
        <AskUserQuestions
          questions={[{
            title: "Your answer", options: [{ title: "Option" }],
            allowOther: mode === "other", freeText: mode !== "other",
            freeTextMultiline: mode === "multiline",
          }]}
          onComplete={onComplete}
        />,
      );
      const input = getByRole("textbox");
      fireEvent.change(input, { target: { value: "中文" } });
      const modifiers = mode === "multiline" ? { metaKey: true, ctrlKey: true } : {};
      fireEvent.keyDown(input, { key: "Enter", isComposing: true, ...modifiers });
      fireEvent.keyDown(input, { key: "Enter", keyCode: 229, ...modifiers });
      expect(onComplete).not.toHaveBeenCalled();
      fireEvent.keyDown(input, { key: "Enter", ...modifiers });
      expect(onComplete).toHaveBeenCalledOnce();
    },
  );

  it("respects a consumer cancelling the question's submit shortcut", () => {
    const onComplete = vi.fn();
    const { getByRole } = render(
      <AskUserQuestions questions={[{ title: "Answer", freeText: true }]}
        onComplete={onComplete} onKeyDown={(event) => event.preventDefault()} />,
    );
    const input = getByRole("textbox");
    fireEvent.change(input, { target: { value: "Draft" } });
    fireEvent.keyDown(input, { key: "Enter", metaKey: true, ctrlKey: true });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("does not send the message on a legacy IME confirmation key", () => {
    const onSend = vi.fn();
    const { getByRole } = render(
      <InputMessage value="中文" onValueChange={() => {}} onSend={onSend} />,
    );
    const input = getByRole("textbox", { name: "Message" });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledExactlyOnceWith("中文", []);
  });
});
