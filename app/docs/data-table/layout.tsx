import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata("data-table");

export default function DataTableLayout({ children }: { children: React.ReactNode }) {
  return children;
}
