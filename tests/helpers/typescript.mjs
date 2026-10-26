import { afterAll } from "vite-plus/test";
import { API } from "typescript/unstable/sync";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../../", import.meta.url)).replace(/\/$/, "");
const sessions = new Set();
afterAll(() => {
  for (const api of sessions) api.close();
  sessions.clear();
});

// Keep one native compiler session per project so changing generated files
// does not reparse the unchanged dependency graph for every preset.
export function createVirtualProject(folder, compilerOptions = {}) {
  const directory = join(root, folder);
  const config = join(directory, "tsconfig.json");
  let files = new Map();
  let directories = new Set();
  const api = new API({
    cwd: root,
    fs: {
      readFile: (file) => files.get(normalize(file)),
      fileExists: (file) => (files.has(normalize(file)) ? true : undefined),
      directoryExists: (dir) => (directories.has(normalize(dir)) ? true : undefined),
    },
  });
  sessions.add(api);
  let snapshot;

  return (sources) => {
    const previous = files;
    files = new Map(sources.map(({ target, content }) => [join(directory, target), content]));
    const sourcePaths = [...files.keys()];
    files.set(
      config,
      JSON.stringify({
        extends: join(root, "tsconfig.json"),
        compilerOptions: { incremental: false, ...compilerOptions },
        files: sourcePaths,
        include: [],
      }),
    );
    directories = new Set();
    for (const file of files.keys()) {
      let dir = dirname(file);
      while (dir.startsWith(directory)) {
        directories.add(dir);
        dir = dirname(dir);
      }
    }
    const next = api.updateSnapshot({
      ...(!snapshot ? { openProjects: [config] } : {}),
      fileChanges: {
        created: [...files.keys()].filter((file) => !previous.has(file)),
        changed: [...files.keys()].filter((file) => previous.has(file)),
        deleted: [...previous.keys()].filter((file) => !files.has(file)),
      },
    });
    snapshot?.dispose();
    snapshot = next;
    const project = snapshot.getProject(config);
    if (!project) throw new Error(`TypeScript did not open ${config}`);
    for (const file of sourcePaths) {
      if (!project.program.getSourceFile(file)) throw new Error(`TypeScript did not load ${file}`);
    }
    return { program: project.program, sourcePaths };
  };
}

let syntaxProject;
function syntaxProgram(file, content) {
  syntaxProject ??= createVirtualProject("__syntax__", { noResolve: true, noLib: true });
  const extension = file.endsWith(".tsx") ? ".tsx" : ".ts";
  const {
    program,
    sourcePaths: [target],
  } = syntaxProject([{ target: `input${extension}`, content }]);
  return { program, target };
}

export function parseSourceFile(file, content) {
  const { program, target } = syntaxProgram(file, content);
  return program.getSourceFile(target);
}

export function parseDiagnostics(file, content) {
  const { program, target } = syntaxProgram(file, content);
  return program.getSyntacticDiagnostics(target).map((diagnostic) => diagnostic.text);
}
