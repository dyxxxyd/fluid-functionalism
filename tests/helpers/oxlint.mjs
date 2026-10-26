import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const vp = fileURLToPath(new URL("../bin/vp", import.meta.resolve("vite-plus")));

// Batch generated files through the project's bundled Oxlint, without needing
// a separate parser or installing packages into each generated project.
export function lintGeneratedFiles(files, rules) {
  const dir = mkdtempSync(join(tmpdir(), "fluid-preset-lint-"));
  try {
    const config = join(dir, "oxlint.json");
    writeFileSync(
      config,
      JSON.stringify({
        plugins: ["react"],
        categories: { correctness: "off" },
        options: { typeAware: false, typeCheck: false },
        rules,
      }),
    );
    const paths = files.map(({ path, content }) => {
      const target = join(dir, path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
      return target;
    });
    const result = spawnSync(
      process.execPath,
      [vp, "lint", "--config", config, "--format", "json", "--no-ignore", ...paths],
      { encoding: "utf8", timeout: 60_000, maxBuffer: 8 * 1024 * 1024 },
    );
    if (result.error) throw result.error;
    if (result.signal) throw new Error(`Oxlint exited with signal ${result.signal}`);
    const report = JSON.parse(result.stdout);
    if (result.status !== 0 && !report.diagnostics?.length) {
      throw new Error(`Oxlint exited with ${result.status}: ${result.stderr}`);
    }
    // A missing report must fail the test, even if the process exits with 0.
    if (!Array.isArray(report.diagnostics)) throw new Error("Oxlint returned no diagnostics array");
    return report.diagnostics.map((diagnostic) => ({
      ...diagnostic,
      filename: diagnostic.filename.replace(`${dir}/`, ""),
    }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
