import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { createPresetTypechecker, root } from "./helpers/preset-typecheck.mjs";
import { BASE_URL, neutralizeComponentImports } from "../scripts/postbuild-registry.mjs";

const source = readFileSync(join(root, "registry/default/data-table.tsx"), "utf8");

describe.each(["radix", "base"])("%s/data-table registry", (flavor) => {
  const payload = JSON.parse(
    readFileSync(join(root, `public/r/${flavor}/data-table.json`), "utf8"),
  );

  it("ships current source with the matching primitive dependencies", () => {
    expect(payload.files[0].content).toBe(neutralizeComponentImports(source));
    expect(payload.dependencies).toContain("@tanstack/react-table@^9.3.1");
    for (const component of ["button", "dropdown", "select"]) {
      expect(payload.registryDependencies).toContain(
        `${BASE_URL}/${flavor}/${component}.json`,
      );
    }
    expect(payload.registryDependencies).toContain(
      `${BASE_URL}/table.json`,
    );
  });

  it("type-checks its installed source and typed v9 column-helper usage", () => {
    const check = createPresetTypechecker({
      paths: {
        "@/components/ui/data-table": [join(root, "__preset__/data-table.tsx")],
        "@/components/ui/table": [join(root, "registry/default/table.tsx")],
        ...Object.fromEntries(
          ["button", "dropdown", "select"].map((name) => [
            `@/components/ui/${name}`,
            [join(root, `registry/${flavor}/${name}.tsx`)],
          ]),
        ),
      },
    });
    expect(
      check([
        { target: "data-table.tsx", content: payload.files[0].content },
        {
          target: "example.tsx",
          content: `
        import { createColumnHelper } from "@tanstack/react-table";
        import { DataTable, DataTableColumnHeader, useDataTable, DataTableContent,
          type DataTableFeatures } from "@/components/ui/data-table";
        type Payment = { id: string; email: string; amount: number };
        const helper = createColumnHelper<DataTableFeatures, Payment>();
        const columns = helper.columns([
          helper.accessor("email", { header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> }),
          helper.accessor("amount", { cell: ({ getValue }) => getValue().toFixed(2) }),
        ]);
        const data: Payment[] = [{ id: "one", email: "alice@example.com", amount: 12 }];
        export function Example() {
          const table = useDataTable({ columns, data, getRowId: (row) => row.id });
          return <>
            <DataTable columns={columns} data={data} searchColumn="email"
              options={{ enableRowSelection: (row) => row.original.amount > 0 }}>
              {(table) => <button type="button" onClick={() => table.resetRowSelection()}>Clear</button>}
            </DataTable>
            <DataTableContent table={table} />
          </>;
        }
      `,
        },
      ]),
    ).toEqual([]);
  });
});
