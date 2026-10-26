import type { ApiTable, PropDef } from "@/lib/docs/api/types";

export const dataTableProps: PropDef[] = [
  {
    name: "columns",
    type: "DataTableColumnDef<TData>[]",
    description: "TanStack v9 column definitions. Set header and cell to render your own content.",
  },
  {
    name: "data",
    type: "TData[]",
    description: "Rows for the table, or the current server page when manualPagination is enabled.",
  },
  {
    name: "options",
    type: 'Omit<DataTableOptions<TData>, "columns" | "data">',
    description:
      "TanStack options: initialState, state/on*Change, getRowId, enableRowSelection, manualPagination, rowCount, manualSorting, and manualFiltering.",
  },
  {
    name: "searchColumn",
    type: "string",
    description: "Column ID to filter with the toolbar input. Omit to hide the input.",
  },
  {
    name: "searchPlaceholder",
    type: "string",
    default: '"Filter rows..."',
    description: "Placeholder in the toolbar filter.",
  },
  {
    name: "columnLabels",
    type: "Record<string, string>",
    description:
      "Readable column names for the visibility menu and search label. Falls back to a string header or column ID.",
  },
  {
    name: "showColumnToggle",
    type: "boolean",
    default: "true",
    description: "Show the Columns menu for hideable columns.",
  },
  {
    name: "showPagination",
    type: "boolean",
    default: "true",
    description:
      "Show page size, page navigation, and selection count. Hiding these controls does not disable pagination.",
  },
  {
    name: "pageSizeOptions",
    type: "number[]",
    default: "[10, 20, 30, 40, 50]",
    description: "Page sizes in the selector. The current page size is always included.",
  },
  {
    name: "emptyState",
    type: "ReactNode",
    default: '"No results."',
    description: "Content shown when the filtered row model is empty.",
  },
  {
    name: "caption",
    type: "string",
    default: '"Data table"',
    description: "Visually hidden caption that names the semantic table.",
  },
  {
    name: "size",
    type: '"default" | "compact"',
    default: "SizeProvider",
    description: "Pin the table and every toolbar and pagination control to one size step.",
  },
  {
    name: "children",
    type: "(table: DataTableInstance<TData>) => ReactNode",
    description:
      "Additional toolbar content with access to filters, selected rows, and table actions.",
  },
  {
    name: "className / ref / native div attributes",
    type: "HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>",
    description: "Applied to the outer table layout.",
  },
];

export const contentProps: PropDef[] = [
  {
    name: "table",
    type: "DataTableInstance<TData>",
    description: "Instance returned by useDataTable.",
  },
  {
    name: "emptyState / caption",
    type: "ReactNode / string",
    default: '"No results." / "Data table"',
    description: "Empty content and the visually hidden table name.",
  },
  {
    name: "className / native div attributes",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Applied to the horizontally scrolling table frame.",
  },
];

export const headerProps: PropDef[] = [
  {
    name: "column",
    type: "Column<DataTableFeatures, TData, TValue>",
    description: "Column from a header render context.",
  },
  {
    name: "title",
    type: "string",
    description: "Visible label and accessible sorting description.",
  },
  {
    name: "className",
    type: "string",
    description: "Additional classes on the sorting button, or label for a non-sortable column.",
  },
];

export const paginationProps: PropDef[] = [
  {
    name: "table",
    type: "DataTableInstance<TData>",
    description: "Instance returned by useDataTable.",
  },
  {
    name: "pageSizeOptions",
    type: "number[]",
    default: "[10, 20, 30, 40, 50]",
    description: "Page size choices. The current size is included automatically.",
  },
];

export const viewOptionsProps: PropDef[] = [
  {
    name: "table",
    type: "DataTableInstance<TData>",
    description: "Instance returned by useDataTable.",
  },
  {
    name: "columnLabels",
    type: "Record<string, string>",
    description: "Readable names for the hideable leaf columns.",
  },
];

export const hookProps: PropDef[] = [
  {
    name: "options",
    type: "DataTableOptions<TData>",
    description:
      "columns, data, and TanStack v9 options. Registers sorting, filtering, pagination, visibility, and selection features; selection is disabled by default.",
  },
  {
    name: "return",
    type: "DataTableInstance<TData>",
    description:
      "Reactive TanStack table instance for DataTableContent, DataTablePagination, DataTableViewOptions, or a custom layout.",
  },
];

export const apiReference: ApiTable[] = [
  { title: "DataTable", props: dataTableProps },
  { title: "DataTableContent", props: contentProps },
  { title: "DataTableColumnHeader", props: headerProps },
  { title: "DataTablePagination", props: paginationProps },
  { title: "DataTableViewOptions", props: viewOptionsProps },
  { title: "useDataTable", props: hookProps },
];
