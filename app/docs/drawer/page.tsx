"use client";

import { useState } from "react";
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter,
  DrawerTitle, DrawerDescription, DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";
import { drawerProps, drawerContentProps, drawerCompositionProps } from "@/lib/docs/api/drawer";

// Code-tab snippet only; keep the live Basic preview below in sync.
const basicCode = `import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter,
  DrawerTitle, DrawerDescription, DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

<Drawer showSwipeHandle={false} swipeDirection="right">
  <DrawerTrigger render={<Button variant="tertiary" />}>Open drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Project settings</DrawerTitle>
      <DrawerDescription>Manage the details for your project.</DrawerDescription>
    </DrawerHeader>
    <div className="flex-1 overflow-y-auto p-4">Your content goes here.</div>
    <DrawerFooter>
      <DrawerClose render={<Button />}>Done</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

const positionCode = `<Drawer swipeDirection="left" showSwipeHandle>
  <DrawerTrigger render={<Button variant="tertiary" />}>Open left drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Project settings</DrawerTitle>
      <DrawerDescription>Swipe left to dismiss.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter><DrawerClose render={<Button />}>Done</DrawerClose></DrawerFooter>
  </DrawerContent>
</Drawer>
// swipeDirection: "down" (default), "up", "left", or "right"`;

const controlledCode = `const [open, setOpen] = useState(false);

<Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
  <DrawerTrigger render={<Button variant="tertiary" />}>Open controlled drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Controlled drawer</DrawerTitle>
      <DrawerDescription>Control the open state from your app.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter><Button onClick={() => setOpen(false)}>Save and close</Button></DrawerFooter>
  </DrawerContent>
</Drawer>`;

const snapCode = `const [snapPoint, setSnapPoint] = useState<number | string | null>(0.45);

<Drawer snapPoints={[0.45, 1]} snapPoint={snapPoint}
  onSnapPointChange={setSnapPoint} showSwipeHandle>
  <DrawerTrigger render={<Button variant="tertiary" />}>Open snap drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Activity</DrawerTitle>
      <DrawerDescription>Swipe up to expand, or down to dismiss.</DrawerDescription>
      <Button variant="tertiary" onClick={() => setSnapPoint(snapPoint === 1 ? 0.45 : 1)}>
        {snapPoint === 1 ? "Half height" : "Full height"}
      </Button>
      <DrawerClose render={<Button variant="ghost" />}>Done</DrawerClose>
    </DrawerHeader>
    <div className="flex-1 overflow-y-auto p-4">Scrollable content</div>
  </DrawerContent>
</Drawer>`;

const nestedCode = `<Drawer showSwipeHandle swipeDirection="right">
  <DrawerTrigger render={<Button variant="tertiary" />}>Open nested drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader><DrawerTitle>Workspace</DrawerTitle></DrawerHeader>
    <div className="p-4">
      <Drawer showSwipeHandle>
        <DrawerTrigger render={<Button variant="tertiary" />}>Manage access</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Access</DrawerTitle></DrawerHeader>
          <DrawerFooter><DrawerClose render={<Button />}>Back</DrawerClose></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
    <DrawerFooter><DrawerClose render={<Button />}>Done</DrawerClose></DrawerFooter>
  </DrawerContent>
</Drawer>`;

const nonModalCode = `<Drawer modal={false} disablePointerDismissal swipeDirection="right">
  <DrawerTrigger render={<Button variant="tertiary" />}>Open non-modal drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Notes</DrawerTitle>
      <DrawerDescription>The rest of the page stays interactive.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter><DrawerClose render={<Button />}>Done</DrawerClose></DrawerFooter>
  </DrawerContent>
</Drawer>`;

function DirectionDemo({ direction }: { direction: "up" | "down" | "left" | "right" }) {
  return (
    <Drawer swipeDirection={direction} showSwipeHandle>
      <DrawerTrigger render={<Button variant="tertiary" />}>Open {direction} drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Project settings</DrawerTitle>
          <DrawerDescription>Swipe {direction} to dismiss, or press Escape.</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">Manage the details for your project.</div>
        <DrawerFooter><DrawerClose render={<Button />}>Done</DrawerClose></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function DrawerDoc() {
  const [open, setOpen] = useState(false);
  const [snapPoint, setSnapPoint] = useState<number | string | null>(0.45);

  return (
    <DocPage
      title="Drawer"
      slug="drawer"
      description="An edge panel with swipe dismissal, snap points, and nested drawers."
      installNote="One shared Base UI implementation for both primitive flavors."
      intro={<>Based on the <a href="https://ui.shadcn.com/docs/components/base/drawer" className="underline underline-offset-4">shadcn/ui Base Drawer</a>, with Fluid surfaces, shapes, type, and spring motion. Base UI manages gestures, focus, and scroll locking.</>}
    >
      <DocSection title="Basic">
        <ComponentPreview code={basicCode} inspectable={false}>
          <Drawer showSwipeHandle={false} swipeDirection="right">
            <DrawerTrigger render={<Button variant="tertiary" />}>Open drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Project settings</DrawerTitle>
                <DrawerDescription>Manage the details for your project.</DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto p-4">Your content goes here.</div>
              <DrawerFooter><DrawerClose render={<Button />}>Done</DrawerClose></DrawerFooter>
            </DrawerContent>
          </Drawer>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Position">
        <ComponentPreview code={positionCode} inspectable={false}>
          <div className="flex flex-wrap justify-center gap-2">
            {(["down", "up", "left", "right"] as const).map((direction) => <DirectionDemo key={direction} direction={direction} />)}
          </div>
        </ComponentPreview>
        <p className="text-site-body text-muted-foreground">
          Drawers float 8px from the viewport edges with all four corners rounded. Side drawers fill
          the space between the top and bottom gaps; vertical drawers size to their content. Use
          className=&quot;[--drawer-inset:0px]&quot; to remove the gap, or h-*, max-h-*, and w-* classes
          to set the size.
        </p>
      </DocSection>

      <DocSection title="Controlled">
        <ComponentPreview code={controlledCode} inspectable={false}>
          <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
            <DrawerTrigger render={<Button variant="tertiary" />}>Open controlled drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Controlled drawer</DrawerTitle>
                <DrawerDescription>Control the open state from your app.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter><Button onClick={() => setOpen(false)}>Save and close</Button></DrawerFooter>
            </DrawerContent>
          </Drawer>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Snap Points">
        <ComponentPreview code={snapCode} inspectable={false}>
          <Drawer snapPoints={[0.45, 1]} snapPoint={snapPoint} onSnapPointChange={setSnapPoint} showSwipeHandle>
            <DrawerTrigger render={<Button variant="tertiary" />}>Open snap drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Activity</DrawerTitle>
                <DrawerDescription>Swipe up to expand, or down to dismiss.</DrawerDescription>
                <div className="flex justify-center gap-2">
                  <Button variant="tertiary" onClick={() => setSnapPoint(snapPoint === 1 ? 0.45 : 1)}>{snapPoint === 1 ? "Half height" : "Full height"}</Button>
                  <DrawerClose render={<Button variant="ghost" />}>Done</DrawerClose>
                </div>
              </DrawerHeader>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                {Array.from({ length: 20 }, (_, index) => <p key={index}>Activity item {index + 1}</p>)}
              </div>
            </DrawerContent>
          </Drawer>
        </ComponentPreview>
        <p className="text-site-body text-muted-foreground">Vertical drawers size to their content and cap at the viewport minus 6rem. Snap points use fractions, pixel values, or px/rem strings. Keep a scrolling body as a flex-1 overflow-y-auto region between the header and footer.</p>
      </DocSection>

      <DocSection title="Nested">
        <ComponentPreview code={nestedCode} inspectable={false}>
          <Drawer showSwipeHandle swipeDirection="right">
            <DrawerTrigger render={<Button variant="tertiary" />}>Open nested drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Workspace</DrawerTitle><DrawerDescription>Manage your workspace and its members.</DrawerDescription></DrawerHeader>
              <div className="p-4">
                <Drawer showSwipeHandle swipeDirection="right">
                  <DrawerTrigger render={<Button variant="tertiary" />}>Manage access</DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader><DrawerTitle>Access</DrawerTitle><DrawerDescription>Review who can open this workspace.</DrawerDescription></DrawerHeader>
                    <div className="p-4">Workspace members can view and edit projects.</div>
                    <DrawerFooter><DrawerClose render={<Button />}>Back</DrawerClose></DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
              <DrawerFooter><DrawerClose render={<Button />}>Done</DrawerClose></DrawerFooter>
            </DrawerContent>
          </Drawer>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Non Modal">
        <ComponentPreview code={nonModalCode} inspectable={false}>
          <Drawer modal={false} disablePointerDismissal swipeDirection="right">
            <DrawerTrigger render={<Button variant="tertiary" />}>Open non-modal drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Notes</DrawerTitle><DrawerDescription>The rest of the page stays interactive.</DrawerDescription></DrawerHeader>
              <DrawerFooter><DrawerClose render={<Button />}>Done</DrawerClose></DrawerFooter>
            </DrawerContent>
          </Drawer>
        </ComponentPreview>
        <p className="text-site-body text-muted-foreground">Set modal to false to keep the page interactive, or to &quot;trap-focus&quot; to retain a focus trap without locking page scroll. disablePointerDismissal keeps outside interaction from dismissing the drawer.</p>
      </DocSection>

      <DocSection title="API Reference">
        <h3 className="text-site-subtitle">Drawer</h3>
        <PropsTable props={drawerProps} />
        <h3 className="text-site-subtitle">DrawerContent</h3>
        <PropsTable props={drawerContentProps} />
        <h3 className="text-site-subtitle">Composition</h3>
        <PropsTable props={drawerCompositionProps} />
      </DocSection>
    </DocPage>
  );
}
