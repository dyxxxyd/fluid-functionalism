"use client";

import { useState } from "react";
import { Skeleton } from "@/registry/default/skeleton";
import { Button } from "@/registry/radix/button";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";
import { skeletonProps } from "@/lib/docs/api/skeleton";

const basicCode = `import { Skeleton } from "@/components/ui/skeleton";

<div role="status" aria-label="Loading profile" aria-busy="true"
  className="flex w-full max-w-sm items-center gap-4">
  <Skeleton className="size-12 shrink-0 rounded-full" />
  <div className="flex flex-1 flex-col gap-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
</div>`;

const textCode = `<div className="flex w-full max-w-sm flex-col gap-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-2/3" />
</div>`;

const cardCode = `<div className="flex w-full max-w-sm flex-col gap-4">
  <Skeleton className="aspect-video w-full" />
  <Skeleton className="h-5 w-3/4" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-2/3" />
</div>`;

const formCode = `<div className="grid w-full max-w-sm gap-4">
  {["name", "email"].map((field) => (
    <div key={field} className="grid gap-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-9 w-full" />
    </div>
  ))}
  <Skeleton className="h-9 w-24" />
</div>`;

const tableCode = `<div className="grid w-full max-w-lg gap-4">
  {Array.from({ length: 4 }, (_, row) => (
    <div key={row} className="grid grid-cols-3 gap-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ))}
</div>`;

const loadingCode = `import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function LoadingExample() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="grid gap-4">
      <div aria-busy={loading} className="min-h-5">
        {loading ? <Skeleton className="h-5 w-48" /> : <p>Your project is ready.</p>}
      </div>
      <Button onClick={() => setLoading(!loading)}>Toggle content</Button>
    </div>
  );
}`;

export default function SkeletonDoc() {
  const [loading, setLoading] = useState(true);
  return (
    <DocPage
      title="Skeleton"
      slug="skeleton"
      description="Loading placeholders for avatars, text, cards, forms, and tables."
      intro={
        <>
          Based on{" "}
          <a
            href="https://ui.shadcn.com/docs/components/base/skeleton"
            className="underline underline-offset-4"
          >
            shadcn/ui Skeleton
          </a>
          , with Fluid shapes and reduced-motion support. Match each placeholder to the size of the
          content it replaces.
        </>
      }
    >
      <DocSection title="Avatar">
        <ComponentPreview code={basicCode}>
          <div
            role="status"
            aria-label="Loading profile"
            aria-busy="true"
            className="flex w-full max-w-sm items-center gap-4"
          >
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Text">
        <ComponentPreview code={textCode}>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Card">
        <ComponentPreview code={cardCode}>
          <div className="flex w-full max-w-sm flex-col gap-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Form">
        <ComponentPreview code={formCode}>
          <div className="grid w-full max-w-sm gap-4">
            {["name", "email"].map((field) => (
              <div key={field} className="grid gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
            <Skeleton className="h-9 w-24" />
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Table">
        <ComponentPreview code={tableCode}>
          <div className="grid w-full max-w-lg gap-4">
            {Array.from({ length: 4 }, (_, row) => (
              <div key={row} className="grid grid-cols-3 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Loading State">
        <ComponentPreview code={loadingCode}>
          <div className="grid gap-4">
            <div aria-busy={loading} className="min-h-5">
              {loading ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <p className="text-site-body">Your project is ready.</p>
              )}
            </div>
            <Button onClick={() => setLoading(!loading)}>Toggle content</Button>
          </div>
        </ComponentPreview>
        <p className="text-site-body text-muted-foreground">
          Place aria-busy and an accessible loading label on the surrounding region. The
          placeholders themselves are decorative and stop pulsing when reduced motion is enabled.
        </p>
      </DocSection>
      <DocSection title="API Reference">
        <PropsTable props={skeletonProps} />
      </DocSection>
    </DocPage>
  );
}
