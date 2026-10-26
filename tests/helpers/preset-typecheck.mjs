// Compile generated presets in a real TypeScript 7 project, with the repo's
// compiler options and aliases. Native sessions retain the unchanged
// dependency graph while virtual sources change between matrix cases.
import { readFileSync } from "node:fs";
import path from "node:path";
import { createVirtualProject, root } from "./typescript.mjs";

export { root };

/**
 * @param {{ paths?: Record<string, string[]> }} [opts] extra path aliases
 * @returns {(files: {target: string, content: string}[]) => string[]}
 */
export function createPresetTypechecker({ paths: extraPaths } = {}) {
  const config = JSON.parse(readFileSync(path.join(root, "tsconfig.json"), "utf8"));
  const paths = Object.fromEntries(
    Object.entries({ ...config.compilerOptions.paths, ...extraPaths }).map(([alias, targets]) => [
      alias,
      targets.map((target) => path.resolve(root, target)),
    ]),
  );
  const update = createVirtualProject("__preset__", { paths });

  return (files) => {
    const { program, sourcePaths } = update(files);
    return sourcePaths.flatMap((file) => {
      const source = program.getSourceFile(file);
      return [
        ...program.getSyntacticDiagnostics(file),
        ...program.getSemanticDiagnostics(file),
      ].map(
        (diagnostic) =>
          `${path.basename(file)}:${source.getLineAndCharacterOfPosition(diagnostic.pos).line + 1} ${diagnostic.text}`,
      );
    });
  };
}
