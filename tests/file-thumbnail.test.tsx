// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { FileThumbnail, renderPdfFirstPage } from "@/registry/default/file-thumbnail";

const { getDocument } = vi.hoisted(() => ({ getDocument: vi.fn() }));
vi.mock("pdfjs-dist", () => ({
  getDocument, GlobalWorkerOptions: { workerSrc: "local-worker.mjs" }, version: "test",
}));

function pdfFile(name: string) {
  const file = new File(["pdf"], name, { type: "application/pdf" });
  Object.defineProperty(file, "arrayBuffer", {
    value: () => Promise.resolve(new ArrayBuffer(3)),
  });
  return file;
}

function pdfTask() {
  const page = {
    getViewport: ({ scale }: { scale: number }) => ({ width: 100 * scale, height: 150 * scale }),
    render: vi.fn(() => ({ promise: Promise.resolve() })),
  };
  const document = { getPage: vi.fn().mockResolvedValue(page) };
  const task = { promise: Promise.resolve(document), destroy: vi.fn().mockResolvedValue(undefined) };
  return { page, document, task };
}

beforeEach(() => {
  getDocument.mockReset();
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,first");
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("PDF thumbnail lifecycle", () => {
  it("releases the PDF worker and document after rendering", async () => {
    const { task } = pdfTask();
    getDocument.mockReturnValue(task);
    expect(await renderPdfFirstPage(pdfFile("first.pdf"), 80)).toBe("data:image/png;base64,first");
    expect(task.destroy).toHaveBeenCalledOnce();
  });

  it.each(["load", "page", "render"] as const)("releases resources after a %s failure", async (failure) => {
    const { document, page, task } = pdfTask();
    const error = new Error("Invalid PDF");
    if (failure === "load") task.promise = Promise.reject(error);
    if (failure === "page") document.getPage.mockRejectedValue(error);
    if (failure === "render") page.render.mockReturnValue({ promise: Promise.reject(error) });
    getDocument.mockReturnValue(task);
    await expect(renderPdfFirstPage(pdfFile("broken.pdf"), 80)).rejects.toThrow(error);
    expect(task.destroy).toHaveBeenCalledOnce();
  });

  it("does not show the previous file's preview while the next file loads or fails", async () => {
    const first = pdfTask();
    const second = pdfTask();
    const pending = Promise.withResolvers<typeof second.document>();
    second.task.promise = pending.promise;
    getDocument.mockReturnValueOnce(first.task).mockReturnValueOnce(second.task);
    const { getByAltText, queryByAltText, getByRole, rerender } = render(
      <FileThumbnail file={pdfFile("first.pdf")} size={80} />,
    );
    await waitFor(() => expect(getByAltText("first.pdf")).toBeDefined());
    rerender(<FileThumbnail file={pdfFile("second.pdf")} size={80} />);
    expect(queryByAltText("second.pdf")).toBeNull();
    expect(getByRole("status", { name: "Loading preview" })).toBeDefined();
    await act(async () => { pending.reject(new Error("Corrupt PDF")); });
    expect(queryByAltText("second.pdf")).toBeNull();
    expect(getByRole("img", { name: "second.pdf" }).tagName).toBe("DIV");
  });
});
