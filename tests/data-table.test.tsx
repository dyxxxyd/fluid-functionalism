// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableContent,
  DataTablePagination,
  useDataTable,
  type DataTableColumnDef,
  type DataTableOptions,
} from "@/registry/default/data-table";
import type { PaginationState, RowSelectionState } from "@tanstack/react-table";

vi.mock("@/components/ui/dropdown", () => import("@/registry/radix/dropdown"));
vi.mock("@/components/ui/select", () => import("@/registry/radix/select"));

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

type Person = { id: string; name: string; amount: number };
const data: Person[] = [
  { id: "c", name: "Carol", amount: 100 },
  { id: "a", name: "Alice", amount: 9 },
  { id: "b", name: "Bob", amount: 42 },
  { id: "d", name: "Drew", amount: 5 },
  { id: "e", name: "Emery", amount: 71 },
];
const columns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => `$${row.original.amount}`,
  },
];
const options: Omit<DataTableOptions<Person>, "columns" | "data"> = {
  getRowId: (row) => row.id,
  initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
};

function bodyRows() {
  return within(screen.getByRole("table")).getAllByRole("row").slice(1);
}

describe("DataTable", () => {
  it("renders named semantic markup, custom cells, and page-local hover indices", () => {
    render(<DataTable columns={columns} data={data} options={options} caption="People" />);
    expect(screen.getByRole("table", { name: "People" })).toBeTruthy();
    expect(screen.getByText("5 row(s).")).toBeTruthy();
    expect(bodyRows().map((row) => row.textContent)).toEqual(["Carol$100", "Alice$9"]);
    expect(bodyRows().map((row) => row.getAttribute("data-fluid-hover-index"))).toEqual(["0", "1"]);
    expect(screen.getByRole("button", { name: "Previous page" }).hasAttribute("disabled")).toBe(
      true,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(bodyRows().map((row) => row.textContent)).toEqual(["Bob$42", "Drew$5"]);
    expect(bodyRows()[0].getAttribute("data-fluid-hover-index")).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));
    expect(bodyRows().map((row) => row.textContent)).toEqual(["Emery$71"]);
    expect(screen.getByRole("button", { name: "Next page" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "First page" }));
    expect(screen.getByText("Page 1 of 3")).toBeTruthy();
  });

  it("sorts text and numbers and exposes the sort direction on the header", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        options={{ ...options, initialState: { pagination: { pageIndex: 0, pageSize: 10 } } }}
      />,
    );
    const name = screen.getByRole("button", { name: /^Name:/ });
    fireEvent.click(name);
    expect(bodyRows().map((row) => row.textContent)).toEqual([
      "Alice$9",
      "Bob$42",
      "Carol$100",
      "Drew$5",
      "Emery$71",
    ]);
    expect(name.closest("th")?.getAttribute("aria-sort")).toBe("ascending");
    fireEvent.click(name);
    expect(bodyRows()[0].textContent).toBe("Emery$71");
    expect(name.closest("th")?.getAttribute("aria-sort")).toBe("descending");
    fireEvent.click(screen.getByRole("button", { name: /^Amount:/ }));
    expect(bodyRows().map((row) => row.textContent)).toEqual([
      "Carol$100",
      "Emery$71",
      "Bob$42",
      "Alice$9",
      "Drew$5",
    ]);
  });

  it("resets pagination when filtering and renders an empty page without stale counts", async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        options={options}
        searchColumn="name"
        emptyState="Nothing matched."
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Filter name" }), {
      target: { value: "alice" },
    });
    await waitFor(() => expect(bodyRows().map((row) => row.textContent)).toEqual(["Alice$9"]));
    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "missing" } });
    await waitFor(() => expect(screen.getByText("Page 0 of 0")).toBeTruthy());
    expect(screen.getByRole("cell", { name: "Nothing matched." }).getAttribute("colspan")).toBe(
      "2",
    );
    expect(screen.getByRole("button", { name: "Next page" }).hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
    await waitFor(() => expect(bodyRows()).toHaveLength(2));
  });

  it("selects eligible rows on the current page, keeps other pages, and reports mixed state", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        options={{ ...options, enableRowSelection: (row) => row.original.id !== "a" }}
      />,
    );
    expect(
      (screen.getByRole("checkbox", { name: "Select row a" }) as HTMLInputElement).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    expect(screen.getByText("1 of 5 row(s) selected.")).toBeTruthy();
    expect(bodyRows()[0].getAttribute("data-state")).toBe("selected");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row b" }));
    const all = screen.getByRole("checkbox", {
      name: "Select all rows on this page",
    }) as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    expect(screen.getByText("2 of 5 row(s) selected.")).toBeTruthy();
    fireEvent.click(all);
    expect(screen.getByText("3 of 5 row(s) selected.")).toBeTruthy();
    fireEvent.click(all);
    expect(screen.getByText("1 of 5 row(s) selected.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "First page" }));
    expect(
      (screen.getByRole("checkbox", { name: "Select row c" }) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("keeps controlled selection attached to record IDs after data reordering", () => {
    function Controlled() {
      const [rows, setRows] = useState(data);
      const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
      return (
        <DataTable
          columns={columns}
          data={rows}
          options={{
            ...options,
            enableRowSelection: true,
            state: { rowSelection },
            onRowSelectionChange: setRowSelection,
          }}
        >
          {() => (
            <button type="button" onClick={() => setRows([...rows].reverse())}>
              Reverse data
            </button>
          )}
        </DataTable>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row c" }));
    fireEvent.click(screen.getByRole("button", { name: "Reverse data" }));
    expect(bodyRows()[0].textContent).toBe("Emery$71");
    expect(
      (screen.getByRole("checkbox", { name: "Select row e" }) as HTMLInputElement).checked,
    ).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));
    expect(
      (screen.getByRole("checkbox", { name: "Select row c" }) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("toggles column visibility with checkbox menu items and keeps the menu open", async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        options={options}
        columnLabels={{ name: "Person", amount: "Total" }}
      />,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Columns" }), { key: "Enter" });
    const amount = await screen.findByRole("menuitemcheckbox", { name: "Total" });
    fireEvent.click(amount);
    expect(amount.getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.queryByRole("columnheader", { name: "Amount" })).toBeNull();
    fireEvent.click(amount);
    expect(screen.getByRole("columnheader", { name: "Amount" })).toBeTruthy();
  });

  it("spans only visible leaf columns in the empty state, including selection", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        options={{
          enableRowSelection: true,
          initialState: { columnVisibility: { amount: false } },
        }}
      />,
    );
    expect(screen.getByRole("cell", { name: "No results." }).getAttribute("colspan")).toBe("2");
    expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByText("Page 0 of 0")).toBeTruthy();
  });

  it("filters numeric columns with TanStack's automatic range filter", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        options={{ initialState: { columnFilters: [{ id: "amount", value: [10, 80] }] } }}
      />,
    );
    expect(bodyRows().map((row) => row.textContent)).toEqual(["Bob$42", "Emery$71"]);
  });

  it("propagates compact sizing to the filter, pagination, and table cells", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        size="compact"
        searchColumn="name"
        options={options}
      />,
    );
    expect(screen.getByRole("button", { name: "Next page" }).className).toContain("h-7");
    expect(screen.getByRole("combobox", { name: "Rows per page" }).className).toContain("h-7");
    expect(bodyRows()[0].querySelector("td")?.className).toContain("py-[5px]");
  });

  it("preserves group headers and a caller's non-sortable columns", () => {
    const grouped: DataTableColumnDef<Person>[] = [
      { header: "Person", columns },
      {
        accessorKey: "id",
        enableSorting: false,
        header: ({ column }) => <DataTableColumnHeader title="ID" column={column} />,
      },
    ];
    render(<DataTable columns={grouped} data={data} showColumnToggle={false} />);
    expect(screen.getByRole("columnheader", { name: "Person" }).getAttribute("colspan")).toBe("2");
    expect(screen.queryByRole("button", { name: /^ID:/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Columns" })).toBeNull();
  });

  it("composes controls from useDataTable and changes page size", async () => {
    function Composed() {
      const table = useDataTable({ columns, data, ...options });
      return (
        <>
          <DataTableContent table={table} />
          <DataTablePagination table={table} pageSizeOptions={[2, 5]} />
        </>
      );
    }
    render(<Composed />);
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Rows per page" }), {
      key: "ArrowDown",
    });
    const choice = await screen.findByRole("option", { name: "5" });
    fireEvent.keyDown(choice, { key: "Enter" });
    await waitFor(() => expect(bodyRows()).toHaveLength(5));
    expect(screen.getByText("Page 1 of 1")).toBeTruthy();
  });

  it("forwards manual server modes and controlled pagination without querying the supplied page again", () => {
    const onFilters = vi.fn();
    const onSorting = vi.fn();
    function ServerPage() {
      const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 1, pageSize: 2 });
      return (
        <DataTable
          columns={columns}
          data={data.slice(0, 2)}
          searchColumn="name"
          options={{
            manualPagination: true,
            manualFiltering: true,
            manualSorting: true,
            rowCount: 12,
            state: { pagination },
            onPaginationChange: setPagination,
            onColumnFiltersChange: onFilters,
            onSortingChange: onSorting,
          }}
        />
      );
    }
    render(<ServerPage />);
    expect(bodyRows()).toHaveLength(2);
    expect(screen.getByText("Page 2 of 6")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Page 3 of 6")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "missing" } });
    expect(onFilters).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /^Name:/ }));
    expect(onSorting).toHaveBeenCalledOnce();
    expect(bodyRows().map((row) => row.textContent)).toEqual(["Carol$100", "Alice$9"]);
  });

  it("handles an unknown server page count without a negative last page", () => {
    render(
      <DataTable
        columns={columns}
        data={data.slice(0, 2)}
        options={{ manualPagination: true, pageCount: -1 }}
      />,
    );
    expect(screen.getByText("Page 1")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Last page" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Next page" }).hasAttribute("disabled")).toBe(false);
  });
});
