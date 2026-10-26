"use client";

import { useMemo, type HTMLAttributes, type ReactNode, type Ref } from "react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludes,
  filterFn_equals,
  filterFn_inDateRange,
  filterFn_inNumberRange,
  filterFn_includesString,
  filterFn_weakEquals,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type ReactTable,
  type RowData,
  type TableOptions,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownTrigger, DropdownContent } from "@/components/ui/dropdown";
import { MenuItem } from "@/components/ui/menu-item";
import { InputGroup, InputField } from "@/components/ui/input-group";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/default/table";
import { cn } from "@/lib/utils";
import { useIcons } from "@/lib/icon-context";
import { spring } from "@/lib/springs";
import { SizeProvider, useSize, type SizeVariant } from "@/lib/size-context";

// v9 registers optional features once, shared by the table and column types.
const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: {
    arrIncludes: filterFn_arrIncludes,
    equals: filterFn_equals,
    inDateRange: filterFn_inDateRange,
    inNumberRange: filterFn_inNumberRange,
    includesString: filterFn_includesString,
    weakEquals: filterFn_weakEquals,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

type DataTableFeatures = typeof dataTableFeatures;
type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  DataTableFeatures,
  TData,
  TValue
>;
type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>;
type DataTableOptions<TData extends RowData> = Omit<
  TableOptions<DataTableFeatures, TData>,
  "features"
>;

const selectionColumnId = "__fluid_selection";

// A native checkbox keeps Space, focus, mixed state, and assistive technology
// behavior together. Its mark draws with the same fast tier as CheckboxGroup.
function SelectionCheckbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean | "indeterminate";
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const { variant } = useSize();
  return (
    <span
      className={cn(
        "relative inline-flex align-middle",
        disabled ? "opacity-50" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        aria-label={label}
        checked={checked === true}
        ref={(node) => {
          if (node) node.indeterminate = checked === "indeterminate";
        }}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className={cn(
          "m-0 appearance-none border-[1.5px] outline-none cursor-inherit transition-colors duration-80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2",
          variant === "compact" ? "size-3.5 rounded-[4px]" : "size-4 rounded-[5px]",
          checked ? "border-transparent" : "border-border hover:border-foreground",
        )}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-foreground"
      >
        <motion.path
          initial={false}
          d="M6 12L10 16L18 8"
          animate={{ pathLength: checked === true ? 1 : 0, opacity: checked === true ? 1 : 0 }}
          transition={checked === true ? spring.fast : spring.fast.exit}
        />
        <motion.path
          initial={false}
          d="M6 12H18"
          animate={{
            pathLength: checked === "indeterminate" ? 1 : 0,
            opacity: checked === "indeterminate" ? 1 : 0,
          }}
          transition={checked === "indeterminate" ? spring.fast : spring.fast.exit}
        />
      </svg>
    </span>
  );
}

function createSelectionColumn<TData extends RowData>(): DataTableColumnDef<TData> {
  return {
    id: selectionColumnId,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    header: ({ table }) => (
      <SelectionCheckbox
        label="Select all rows on this page"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
        }
        disabled={!table.getRowModel().rows.some((row) => row.getCanSelect())}
        onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <SelectionCheckbox
        label={`Select row ${row.id}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={(checked) => row.toggleSelected(checked)}
      />
    ),
  };
}

/** Owns uncontrolled state by default. Pass TanStack's state/on*Change pairs
 * or manual* options for controlled state and server-side data. Use getRowId
 * when selection must follow records across data changes or server pages. */
function useDataTable<TData extends RowData>(
  options: DataTableOptions<TData>,
): DataTableInstance<TData> {
  const enableRowSelection = options.enableRowSelection ?? false;
  const columns = useMemo(
    () =>
      enableRowSelection ? [createSelectionColumn<TData>(), ...options.columns] : options.columns,
    [enableRowSelection, options.columns],
  );
  return useTable({ ...options, features: dataTableFeatures, columns, enableRowSelection });
}

interface DataTableContentProps<TData extends RowData> extends HTMLAttributes<HTMLDivElement> {
  table: DataTableInstance<TData>;
  emptyState?: ReactNode;
  caption?: string;
}

function DataTableContent<TData extends RowData>({
  table,
  emptyState = "No results.",
  caption = "Data table",
  className,
  ...props
}: DataTableContentProps<TData>) {
  const rows = table.getRowModel().rows;
  return (
    <div
      className={cn("min-w-0 overflow-x-auto rounded-lg border border-border", className)}
      {...props}
    >
      <Table>
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    scope={header.colSpan > 1 ? "colgroup" : "col"}
                    aria-sort={
                      !header.isPlaceholder && header.column.getCanSort()
                        ? sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    className={header.column.id === selectionColumnId ? "w-10" : undefined}
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row, index) => (
              <TableRow
                key={row.id}
                index={index}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className="data-[state=selected]:bg-active data-[state=selected]:border-transparent [&:has(+tr[data-state=selected])]:border-transparent"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="whitespace-nowrap group-data-[state=selected]/row:text-foreground"
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={Math.max(1, table.getVisibleLeafColumns().length)}
                className="h-24 text-center"
              >
                <div role="status">{emptyState}</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
  className?: string;
}

function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const icons = useIcons();
  const sorted = column.getIsSorted();
  if (!column.getCanSort()) return <span className={className}>{title}</span>;
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn("-my-1 -ml-2 px-2 text-foreground", className)}
      onClick={column.getToggleSortingHandler()}
      aria-label={`${title}: ${sorted === "asc" ? "sorted ascending" : sorted === "desc" ? "sorted descending" : "not sorted"}. Activate to sort.`}
    >
      <span className="inline-flex items-center gap-1.5">
        {title}
        <span aria-hidden="true" className="grid size-4 shrink-0">
          {(["chevrons-up-down", "arrow-up", "arrow-down"] as const).map((name, index) => {
            const Icon = icons[name];
            const visible = index === (sorted === "asc" ? 1 : sorted === "desc" ? 2 : 0);
            return (
              <motion.span
                key={name}
                className="col-start-1 row-start-1 flex"
                initial={false}
                animate={{
                  opacity: visible ? 1 : 0,
                  scale: visible ? 1 : 0.6,
                  filter: visible ? "blur(0px)" : "blur(4px)",
                }}
                transition={{
                  type: "tween",
                  duration: visible ? spring.fast.duration : spring.fast.exit.duration,
                  ease: visible ? "easeOut" : "easeIn",
                }}
              >
                <Icon className="size-4" />
              </motion.span>
            );
          })}
        </span>
      </span>
    </Button>
  );
}

interface DataTableViewOptionsProps<TData extends RowData> {
  table: DataTableInstance<TData>;
  columnLabels?: Record<string, string>;
}

function DataTableViewOptions<TData extends RowData>({
  table,
  columnLabels,
}: DataTableViewOptionsProps<TData>) {
  const icons = useIcons();
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide());
  if (!columns.length) return null;
  return (
    <DropdownMenu>
      <DropdownTrigger
        render={
          <Button type="button" variant="tertiary" leadingIcon={icons["sliders-horizontal"]}>
            Columns
          </Button>
        }
      />
      <DropdownContent
        align="end"
        className="w-max"
        checkedIndices={columns.flatMap((column, index) => (column.getIsVisible() ? [index] : []))}
      >
        {columns.map((column, index) => (
          <MenuItem
            key={column.id}
            index={index}
            label={
              columnLabels?.[column.id] ??
              (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id)
            }
            checked={column.getIsVisible()}
            onSelect={() => column.toggleVisibility()}
            closeOnClick={false}
          />
        ))}
      </DropdownContent>
    </DropdownMenu>
  );
}

interface DataTablePaginationProps<TData extends RowData> {
  table: DataTableInstance<TData>;
  pageSizeOptions?: number[];
}

function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  const icons = useIcons();
  const ArrowLeft = icons["arrow-left"];
  const ArrowRight = icons["arrow-right"];
  const ChevronRight = icons["chevron-right"];
  const size = useSize();
  const { pageSize, pageIndex } = table.state.pagination;
  const pageCount = table.getPageCount();
  const sizes = [...new Set([pageSize, ...pageSizeOptions])]
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((a, b) => a - b);
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-muted-foreground",
        size.text,
      )}
    >
      <p role="status" aria-live="polite">
        {table.options.enableRowSelection
          ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
          : `${table.getFilteredRowModel().rows.length} row(s).`}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger aria-label="Rows per page" className="min-w-16" />
            <SelectContent>
              {sizes.map((value, index) => (
                <SelectItem key={value} index={index} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="tabular-nums" role="status" aria-live="polite">
          Page {pageCount === 0 ? 0 : pageIndex + 1}
          {pageCount >= 0 ? ` of ${pageCount}` : ""}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size={size.variant === "compact" ? "icon-compact" : "icon"}
            aria-label="First page"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={size.variant === "compact" ? "icon-compact" : "icon"}
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronRight className="rotate-180" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={size.variant === "compact" ? "icon-compact" : "icon"}
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={size.variant === "compact" ? "icon-compact" : "icon"}
            aria-label="Last page"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={pageCount < 1 || !table.getCanNextPage()}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DataTableProps<TData extends RowData> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  options?: Omit<DataTableOptions<TData>, "columns" | "data">;
  searchColumn?: string;
  searchPlaceholder?: string;
  columnLabels?: Record<string, string>;
  showColumnToggle?: boolean;
  showPagination?: boolean;
  pageSizeOptions?: number[];
  emptyState?: ReactNode;
  caption?: string;
  size?: SizeVariant;
  /** Additional toolbar content, e.g. filters or actions on selected rows. */
  children?: (table: DataTableInstance<TData>) => ReactNode;
  ref?: Ref<HTMLDivElement>;
}

function DataTable<TData extends RowData>({
  columns,
  data,
  options,
  searchColumn,
  searchPlaceholder = "Filter rows...",
  columnLabels,
  showColumnToggle = true,
  showPagination = true,
  pageSizeOptions,
  emptyState,
  caption,
  size,
  children,
  className,
  ref,
  ...props
}: DataTableProps<TData>) {
  const table = useDataTable({ ...options, data, columns });
  const icons = useIcons();
  const search = table
    .getAllLeafColumns()
    .find((column) => column.id === searchColumn && column.getCanFilter());
  const filterValue = search?.getFilterValue();
  const content = (
    <div ref={ref} className={cn("flex w-full min-w-0 flex-col gap-3", className)} {...props}>
      {(search || showColumnToggle || children) && (
        <div className="flex flex-wrap items-center gap-2">
          {search && (
            <InputGroup className="min-w-0 flex-1 max-w-sm">
              <InputField
                index={0}
                icon={icons.search}
                label={`Filter ${columnLabels?.[search.id] ?? search.id}`}
                labelHidden
                placeholder={searchPlaceholder}
                value={typeof filterValue === "string" ? filterValue : ""}
                onChange={(value) => search.setFilterValue(value)}
              />
            </InputGroup>
          )}
          {children?.(table)}
          {showColumnToggle && (
            <div className="ml-auto">
              <DataTableViewOptions table={table} columnLabels={columnLabels} />
            </div>
          )}
        </div>
      )}
      <DataTableContent table={table} emptyState={emptyState} caption={caption} />
      {showPagination && <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />}
    </div>
  );
  return size ? <SizeProvider size={size}>{content}</SizeProvider> : content;
}

export {
  DataTable,
  DataTableContent,
  DataTableColumnHeader,
  DataTableViewOptions,
  DataTablePagination,
  useDataTable,
  dataTableFeatures,
};
export type {
  DataTableProps,
  DataTableContentProps,
  DataTableColumnHeaderProps,
  DataTableViewOptionsProps,
  DataTablePaginationProps,
  DataTableFeatures,
  DataTableColumnDef,
  DataTableInstance,
  DataTableOptions,
};
