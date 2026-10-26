"use client";

import { useState } from "react";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableContent,
  DataTablePagination,
  useDataTable,
  type DataTableColumnDef,
} from "@/registry/default/data-table";
import { Button } from "@/registry/radix/button";
import { DropdownMenu, DropdownTrigger, DropdownContent } from "@/components/flavored/dropdown";
import { MenuItem } from "@/registry/default/menu-item";
import { useIcons } from "@/lib/icon-context";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";
import { apiReference } from "@/lib/docs/api/data-table";

type Payment = {
  id: string;
  email: string;
  status: "success" | "processing" | "failed";
  amount: number;
};

const payments: Payment[] = [
  { id: "pay_01", email: "ken99@example.com", status: "success", amount: 316 },
  { id: "pay_02", email: "abe45@example.com", status: "success", amount: 242 },
  { id: "pay_03", email: "monserrat44@example.com", status: "processing", amount: 837 },
  { id: "pay_04", email: "silas22@example.com", status: "success", amount: 874 },
  { id: "pay_05", email: "carmella@example.com", status: "failed", amount: 721 },
  { id: "pay_06", email: "alice@example.com", status: "success", amount: 129 },
  { id: "pay_07", email: "blake@example.com", status: "processing", amount: 459 },
  { id: "pay_08", email: "charlie@example.com", status: "success", amount: 185 },
  { id: "pay_09", email: "drew@example.com", status: "failed", amount: 93 },
  { id: "pay_10", email: "emery@example.com", status: "success", amount: 612 },
  { id: "pay_11", email: "frankie@example.com", status: "processing", amount: 278 },
  { id: "pay_12", email: "gray@example.com", status: "success", amount: 540 },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function PaymentActions({ payment }: { payment: Payment }) {
  const icons = useIcons();
  const MoreIcon = icons["more-horizontal"];
  const [message, setMessage] = useState("");
  return (
    <div className="flex items-center justify-end gap-2">
      <span role="status" className="sr-only">
        {message}
      </span>
      <DropdownMenu>
        <DropdownTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-compact"
              aria-label={`Actions for ${payment.email}`}
            >
              <MoreIcon />
            </Button>
          }
        />
        <DropdownContent align="end" className="w-max">
          <MenuItem
            index={0}
            label="Copy payment ID"
            icon={icons.copy}
            onSelect={() => {
              void navigator.clipboard.writeText(payment.id).then(
                () => setMessage("Payment ID copied."),
                () => setMessage("Could not copy payment ID."),
              );
            }}
          />
          <MenuItem
            index={1}
            label="Show payment ID"
            icon={icons.info}
            onSelect={() => setMessage(payment.id)}
          />
        </DropdownContent>
      </DropdownMenu>
      {message === payment.id && <span>{payment.id}</span>}
    </div>
  );
}

const columns: DataTableColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <span className="capitalize">{row.original.status}</span>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader column={column} title="Amount" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{currency.format(row.original.amount)}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <PaymentActions payment={row.original} />,
  },
];

const basicCode = `"use client";

import {
  DataTable, DataTableColumnHeader, type DataTableColumnDef,
} from "@/components/ui/data-table";

type Payment = { id: string; email: string; amount: number };
const columns: DataTableColumnDef<Payment>[] = [
  { accessorKey: "email", header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Email" />
  ) },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => (
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
      .format(row.original.amount)
  ) },
];

export function Payments({ data }: { data: Payment[] }) {
  return <DataTable columns={columns} data={data} searchColumn="email"
    searchPlaceholder="Filter emails..." columnLabels={{ email: "Email" }}
    options={{ getRowId: (row) => row.id, enableRowSelection: true,
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } } }}
    pageSizeOptions={[5, 10, 20]} caption="Payments" />;
}`;

const compactCode = `<DataTable columns={columns} data={data} size="compact"
  searchColumn="email" columnLabels={{ email: "Email", amount: "Amount" }}
  options={{ initialState: { pagination: { pageIndex: 0, pageSize: 5 } } }} />`;

const composedCode = `import {
  DataTableContent, DataTablePagination, useDataTable,
  type DataTableColumnDef,
} from "@/components/ui/data-table";

type Person = { name: string; role: string };
const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
];
const data = [{ name: "Alice", role: "Engineer" }, { name: "Bob", role: "Designer" }];

export function Team() {
  const table = useDataTable({ columns, data });
  return <div className="flex w-full flex-col gap-3">
    <DataTableContent table={table} caption="Team" />
    <DataTablePagination table={table} />
  </div>;
}`;

const emptyCode = `<DataTable columns={columns} data={[]} caption="Empty payments"
  emptyState="No payments found. Try another filter." />`;

const serverCode = `// Keep query state in your application and pass the fetched page as data.
<DataTable columns={columns} data={page.rows} searchColumn="email"
  options={{
    manualPagination: true, manualSorting: true, manualFiltering: true,
    rowCount: page.total,
    getRowId: (row) => row.id,
    state: { pagination, sorting, columnFilters, rowSelection },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  }} />`;

const teamColumns: DataTableColumnDef<{ name: string; role: string }>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
];
const team = [
  { name: "Alice", role: "Engineer" },
  { name: "Bob", role: "Designer" },
];

function ComposedDemo() {
  const table = useDataTable({ columns: teamColumns, data: team });
  return (
    <div className="flex w-full flex-col gap-3">
      <DataTableContent table={table} caption="Team" />
      <DataTablePagination table={table} />
    </div>
  );
}

export default function DataTableDoc() {
  return (
    <DocPage
      title="DataTable"
      slug="data-table"
      description="Sort, filter, select, and paginate rows with TanStack Table v9."
      intro={
        <>
          Built on Fluid Table, following the{" "}
          <a
            className="underline underline-offset-4"
            href="https://ui.shadcn.com/docs/components/base/data-table"
            target="_blank"
            rel="noreferrer"
          >
            shadcn/ui Data Table guide
          </a>
          .
        </>
      }
    >
      <DocSection title="Payments">
        <p className="text-site-body text-muted-foreground">
          Type to filter emails, click a column heading to sort, and select rows across pages.
        </p>
        <ComponentPreview code={basicCode} padding="compact" align="top">
          <DataTable
            columns={columns}
            data={payments}
            searchColumn="email"
            searchPlaceholder="Filter emails..."
            columnLabels={{ status: "Status", email: "Email", amount: "Amount" }}
            caption="Payments"
            options={{
              getRowId: (row) => row.id,
              enableRowSelection: true,
              initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 20]}
          >
            {(table) =>
              table.getFilteredSelectedRowModel().rows.length > 0 && (
                <Button type="button" variant="ghost" onClick={() => table.resetRowSelection()}>
                  Clear selection
                </Button>
              )
            }
          </DataTable>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Compact">
        <p className="text-site-body text-muted-foreground">
          The table, filter, menu, and pagination share the 28px control step.
        </p>
        <ComponentPreview code={compactCode} padding="compact" align="top">
          <DataTable
            columns={columns.slice(0, 3)}
            data={payments}
            searchColumn="email"
            size="compact"
            columnLabels={{ status: "Status", email: "Email", amount: "Amount" }}
            caption="Compact payments"
            options={{ initialState: { pagination: { pageIndex: 0, pageSize: 5 } } }}
          />
        </ComponentPreview>
      </DocSection>
      <DocSection title="Compose your own layout">
        <p className="text-site-body text-muted-foreground">
          Use the same table instance for a custom toolbar, table body, or pagination.
        </p>
        <ComponentPreview code={composedCode} padding="compact">
          <ComposedDemo />
        </ComponentPreview>
      </DocSection>
      <DocSection title="Empty state">
        <ComponentPreview code={emptyCode} padding="compact">
          <DataTable
            columns={columns.slice(0, 3)}
            data={[]}
            caption="Empty payments"
            emptyState="No payments found. Try another filter."
          />
        </ComponentPreview>
      </DocSection>
      <DocSection title="Server data">
        <p className="text-site-body text-muted-foreground">
          Pass controlled TanStack state through options and use manual modes when the server owns
          the query. Reset the page index when filters change. Selection counts describe the rows
          loaded in the current response.
        </p>
        <ComponentPreview code={serverCode} padding="compact">
          <p className="text-site-body text-muted-foreground">
            Use the Code tab for the controlled query pattern. The Payments demo above runs sorting,
            filtering, and pagination in the browser.
          </p>
        </ComponentPreview>
      </DocSection>
      {apiReference.map((api) => (
        <DocSection key={api.title} title={`API Reference: ${api.title}`}>
          <PropsTable props={api.props} />
        </DocSection>
      ))}
    </DocPage>
  );
}
