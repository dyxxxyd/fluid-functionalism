import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ChangelogFormatError, parseRelease, releaseEntries, type ChangeKind, type Release } from "@/lib/changelog/parse";
import type { ReleaseMarks } from "@/lib/changelog/marks";

// Server only: reads content/changelog/, for the page and /changelog.md at
// build, and for the root layout's New and Updated markers.

export const CHANGELOG_DIR = join(process.cwd(), "content", "changelog");
const FILE = /^(\d{4}-\d{2})\.md$/;

export interface ReleaseSource {
  list(): string[];
  read(name: string): string;
}

// Keep production reads statically inside content/changelog so Turbopack
// traces this directory. Tests inject their own source for temporary files.
const changelogSource: ReleaseSource = {
  list: () => readdirSync(CHANGELOG_DIR),
  read: (name) => readFileSync(join(CHANGELOG_DIR, name), "utf8"),
};

/** Every release, newest month first. Throws on a malformed file. */
export function loadReleases(source = changelogSource): Release[] {
  return source.list()
    .filter((name) => FILE.test(name))
    .sort()
    .reverse()
    .map((name) => {
      const release = parseRelease(source.read(name), `content/changelog/${name}`);
      if (release.month !== FILE.exec(name)![1]) {
        throw new ChangelogFormatError(`content/changelog/${name}`, 2, "`month` does not match the file name");
      }
      return release;
    });
}

export interface AheadOfRelease {
  /** The month the pages landed in: `YYYY-MM`. */
  month: string;
  slugs: string[];
}

/** Docs pages that landed after the latest release, badged New ahead of the
 *  release that will list them. An entry lapses on its own once a release
 *  for its month exists, so nothing needs undoing on release day. The
 *  sidebar dots them too, so a new page is marked from the day it lands. */
export const AHEAD_OF_RELEASE: AheadOfRelease[] = [
  // Merged in October 2026; the October release ships Friday 2026-11-06.
  { month: "2026-10", slugs: ["banner", "typography", "reveal", "calendar", "date-picker"] },
];

let marksCache: ReleaseMarks | null = null;

/** The doc slugs the latest release marks: New for its New entries, Updated
 *  for its Updated and Breaking ones, plus the pages listed ahead of the
 *  next release. The sidebar dots the release's New ones, and the Showcase,
 *  ⌘K, /demo and /compare label all of them, so every marker on the site
 *  moves on with each release. Read once per server in production, where
 *  release files only change with a deploy; every request in development,
 *  so an edited release shows. */
export function latestMarks(source = changelogSource, ahead = AHEAD_OF_RELEASE): ReleaseMarks {
  if (marksCache && process.env.NODE_ENV === "production") return marksCache;
  let marks: ReleaseMarks = { new: [], updated: [], ahead: [] };
  try {
    const latest = loadReleases(source)[0];
    const pending = ahead.filter((a) => !latest || a.month > latest.month).flatMap((a) => a.slugs);
    if (latest) {
      const slugs = (kinds: ChangeKind[]) =>
        releaseEntries(latest)
          .filter((e) => kinds.includes(e.kind))
          .map((e) => (e.href ? /^\/docs\/([^/#?]+)/.exec(e.href)?.[1] : undefined))
          .filter((slug): slug is string => !!slug);
      const added = slugs(["new"]);
      marks = {
        new: added,
        updated: slugs(["updated", "breaking"]).filter((s) => !added.includes(s) && !pending.includes(s)),
        ahead: pending,
      };
    } else marks = { new: [], updated: [], ahead: pending };
  } catch (error) {
    // Every route's layout calls this: a missing or malformed release
    // costs the site its markers, never the page, and logs once per server.
    // tests/changelog.test.ts still fails the build on a malformed file.
    console.error("[changelog] New and Updated markers skipped:", error);
  }
  marksCache = marks;
  return marks;
}
