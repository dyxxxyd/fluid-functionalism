// @vitest-environment jsdom
/* oxlint-disable nextjs/no-html-link-for-pages -- These cases explicitly test plain anchor rendering. */
/**
 * Button accepts both ways of rendering as another element: Radix's
 * `asChild` and Base UI's `render`. The shadcn CLI rewrites `asChild` to
 * `render` (plus `nativeButton={false}`) when it installs into a Base UI
 * project, so components that pass a link to Button (BannerAction's `href`)
 * must come out the same either way, in both flavors.
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { Button as RadixButton } from "@/registry/radix/button";
import { Button as BaseButton } from "@/registry/base/button";

const flavors = [
  ["radix", RadixButton],
  ["base", BaseButton],
] as const;

afterEach(cleanup);

describe.each(flavors)("%s Button", (_name, Button) => {
  it("preserves the rendered element's ref alongside the forwarded ref", () => {
    const childRef = createRef<HTMLAnchorElement>();
    const forwardedRef = createRef<HTMLButtonElement>();
    const { container } = render(
      <Button ref={forwardedRef} render={<a ref={childRef} href="#docs" />}>Docs</Button>,
    );
    expect(childRef.current).toBe(container.querySelector("a"));
    expect(forwardedRef.current).toBe(container.querySelector("a"));
  });

  it("composes click callbacks from the button and rendered element", () => {
    const onClick = vi.fn();
    const onChildClick = vi.fn();
    const { container } = render(
      <Button onClick={onClick} render={<a href="#docs" onClick={onChildClick} />}>Docs</Button>,
    );
    fireEvent.click(container.querySelector("a")!);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onChildClick).toHaveBeenCalledOnce();
  });

  it.each(["disabled", "loading"] as const)("blocks %s link activation and announces the state", (state) => {
    const onClick = vi.fn();
    const onChildClick = vi.fn();
    const { container } = render(
      <Button {...{ [state]: true }} onClick={onClick} asChild>
        <a href="#docs" onClick={onChildClick}>Docs</a>
      </Button>,
    );
    const link = container.querySelector("a")!;
    expect(fireEvent.click(link)).toBe(false);
    expect(onChildClick).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.tabIndex).toBe(-1);
    expect(link.hasAttribute("disabled")).toBe(false);
  });

  it("renders a plain link with asChild", () => {
    const { container } = render(
      <Button asChild>
        <a href="/docs">Read the docs</a>
      </Button>
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/docs");
    expect(link?.textContent).toContain("Read the docs");
    expect(container.querySelector("button")).toBeNull();
  });

  it("renders the same plain link with render and nativeButton", () => {
    const { container } = render(
      <Button render={<a href="/docs" />} nativeButton={false}>
        Read the docs
      </Button>
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/docs");
    expect(link?.textContent).toContain("Read the docs");
    expect(container.querySelector("button")).toBeNull();
    // No Base UI button semantics bolted onto the link, and the parity prop
    // never reaches the DOM.
    expect(link?.getAttribute("role")).toBeNull();
    expect(link?.hasAttribute("nativebutton")).toBe(false);
    expect(link?.hasAttribute("nativeButton")).toBe(false);
  });

  it("keeps the render element's own children when Button has none", () => {
    const { container } = render(<Button render={<a href="/docs">Read the docs</a>} />);
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/docs");
    expect(link?.textContent).toContain("Read the docs");
  });

  it("still renders a native button by default", () => {
    const { container } = render(<Button>Save</Button>);
    expect(container.querySelector("button")?.textContent).toContain("Save");
  });
});
