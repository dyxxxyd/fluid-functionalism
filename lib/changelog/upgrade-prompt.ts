// The text behind /changelog's "Copy upgrade prompt": a brief any coding
// agent can follow to bring a project's Fluid Functionalism items up to the
// latest release. The skill does the whole job, so the brief leads with it;
// the steps after it are the same job by hand, for an agent without it.

import { REGISTRY_BASE_URL } from "@/lib/registry-urls.mjs";

const SITE = "https://www.fluidfunctionalism.com";
const SKILL_INSTALL = "npx skills add mickadesign/fluid-functionalism";

export function buildUpgradePrompt(): string {
  return [
    "Update the Fluid Functionalism components in my project to the latest release.",
    "",
    `Use the Fluid Functionalism skill to update this project. Pass --registry ${REGISTRY_BASE_URL} to its upgrade.mjs script to compare installed files with the fork, then apply the changelog.`,
    SKILL_INSTALL,
    "",
    "Without the skill:",
    `1. Read the changelog: ${SITE}/changelog.md. Every entry names its install URL, and every Breaking entry carries migration steps and a before/after diff.`,
    "2. Find the installed items: files in components/ui, components, hooks, and lib that import springs, use-fluid-hover, font-weight, or size-context are Fluid Functionalism code. Note the flavor: @base-ui/react imports mean the /r/base/ URLs, @radix-ui imports mean the bare /r/ ones.",
    `3. Compare each installed item with ${REGISTRY_BASE_URL}/<name>.json or ${REGISTRY_BASE_URL}/base/<name>.json. Re-install changed items with npx shadcn@latest add <url> --overwrite after checking for local edits in the item and its registryDependencies. If you find local edits, show me the diff and ask before overwriting.`,
    "4. Apply every Breaking entry that changes an item the project uses: rewrite each call site from the diff's - lines to its + lines.",
    "5. Run the type checker and the build, then list what changed, item by item.",
  ].join("\n");
}
