// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

// Match the installed base/data-table payload: its UI imports resolve to
// the Base UI dependencies, while the table and selection stay shared.
vi.mock("@/components/ui/button", () => import("@/registry/base/button"));
vi.mock("@/components/ui/dropdown", () => import("@/registry/base/dropdown"));
vi.mock("@/components/ui/select", () => import("@/registry/base/select"));

import {
  DataTable,
  DataTableColumnHeader,
  type DataTableColumnDef,
} from "@/registry/default/data-table";

afterEach(cleanup);
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
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
if (typeof Element.prototype.scrollIntoView !== "function")
  Element.prototype.scrollIntoView = () => {};

const columns: DataTableColumnDef<{ name: string; role: string }>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  { accessorKey: "role", header: "Role" },
];
const data = [
  { name: "Carol", role: "Engineer" },
  { name: "Alice", role: "Designer" },
  { name: "Bob", role: "Manager" },
];

describe("DataTable with Base UI dependencies", () => {
  it("sorts and selects rows with compact controls", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        size="compact"
        options={{ enableRowSelection: true }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Name:/ }));
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows[0].textContent).toBe("AliceDesigner");
    fireEvent.click(within(rows[0]).getByRole("checkbox"));
    expect(screen.getByText("1 of 3 row(s) selected.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next page" }).className).toContain("h-7");
  });

  it("keeps its Columns menu open while toggling a column with the keyboard", async () => {
    render(<DataTable columns={columns} data={data} columnLabels={{ name: "Name" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    const role = await screen.findByRole("menuitemcheckbox", { name: "Role" });
    fireEvent.keyDown(role, { key: "Enter" });
    expect(screen.queryByRole("columnheader", { name: "Role" })).toBeNull();
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(role.getAttribute("aria-checked")).toBe("false");
  });

  it("changes page size through the Base UI Select", async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pageSizeOptions={[1, 3]}
        options={{ initialState: { pagination: { pageIndex: 0, pageSize: 1 } } }}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    fireEvent.keyDown(await screen.findByRole("option", { name: "3" }), { key: "Enter" });
    await waitFor(() =>
      expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(4),
    );
    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
  });
});
