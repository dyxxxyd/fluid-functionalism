"use client";

import { useRef } from "react";
import { Toaster, toast } from "@/registry/default/toast";
import { Button } from "@/registry/radix/button";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";
import { toasterProps, toastManagerProps, toastCompositionProps } from "@/lib/docs/api/toast";

const setupCode = `import { Toaster } from "@/components/ui/toast";

// Mount once near your application root, inside the Fluid providers.
<Toaster />`;

const basicCode = `import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

<Button onClick={() => toast.add({
  title: "Event created",
  description: "Your team can now view the event.",
})}>Show toast</Button>`;

const typesCode = `toast.add({ title: "Event created", type: "default" });
toast.add({ title: "New update available", type: "info" });
toast.add({ title: "Changes saved", type: "success" });
toast.add({ title: "Storage is almost full", type: "warning" });
toast.add({ title: "Upload failed", type: "error", priority: "high" });
toast.add({ title: "Uploading files", type: "loading", timeout: 0 });`;

const actionCode = `const id = toast.add({
  title: "Event archived",
  description: "You can restore it with Undo.",
  actionProps: {
    children: "Undo",
    onClick() {
      // Restore the event here.
      toast.close(id);
    },
  },
});`;

const promiseCode = `await toast.promise(saveEvent(), {
  loading: { title: "Saving event" },
  success: { title: "Event saved", description: "Your changes are ready." },
  error: { title: "Could not save event", description: "Please try again." },
});`;

const updateCode = `const id = toast.add({ title: "Upload queued", timeout: 0 });
toast.update(id, { title: "Upload complete", type: "success", timeout: 5000 });
toast.close(id); // Or toast.close() to dismiss every toast.`;

const stackCode = `// Add several notifications, then hover or focus the stack to expand it.
toast.add({ title: "Comment added" });
toast.add({ title: "File uploaded", type: "success" });
toast.add({ title: "Teammate invited", type: "info" });`;

const statuses = [
  { type: "default", label: "Default", title: "Event created" },
  { type: "info", label: "Info", title: "New update available" },
  { type: "success", label: "Success", title: "Changes saved" },
  { type: "warning", label: "Warning", title: "Storage is almost full" },
  { type: "error", label: "Error", title: "Upload failed" },
  { type: "loading", label: "Loading", title: "Uploading files" },
] as const;

export default function ToastDoc() {
  const count = useRef(0);
  const updateId = useRef<string | null>(null);

  function showPromise(succeed: boolean) {
    const request = new Promise<void>((resolve, reject) => {
      setTimeout(() => (succeed ? resolve() : reject(new Error("Save failed"))), 1200);
    });
    void toast
      .promise(request, {
        loading: { title: "Saving event" },
        success: { title: "Event saved", description: "Your changes are ready." },
        error: { title: "Could not save event", description: "Please try again." },
      })
      .catch(() => {});
  }

  return (
    <DocPage
      title="Toast"
      slug="toast"
      description="Temporary notifications with status icons, actions, promise updates, and a swipeable stack."
      intro={
        <>
          Based on{" "}
          <a
            href="https://ui.shadcn.com/docs/components/base/toast"
            className="underline underline-offset-4"
          >
            shadcn/ui Base UI Toast
          </a>
          . Mount one Toaster, then add notifications from anywhere with the shared manager.
        </>
      }
    >
      <DocSection title="Setup">
        <ComponentPreview code={setupCode}>
          <p className="text-site-body text-muted-foreground">
            This page has one Toaster. The examples below share its stack.
          </p>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Basic">
        <ComponentPreview code={basicCode}>
          <Button
            onClick={() =>
              toast.add({
                title: "Event created",
                description: "Your team can now view the event.",
              })
            }
          >
            Show toast
          </Button>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Types">
        <p className="text-site-body text-muted-foreground">
          Status colors and filled icons follow Banner. The notification surface stays neutral so
          the message remains easy to read.
        </p>
        <ComponentPreview code={typesCode}>
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map(({ type, label, title }) => (
              <Button
                key={type}
                variant="secondary"
                onClick={() =>
                  toast.add({ title, type, priority: type === "error" ? "high" : "low" })
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Action">
        <ComponentPreview code={actionCode}>
          <Button
            variant="secondary"
            onClick={() => {
              const id = toast.add({
                title: "Event archived",
                description: "You can restore it with Undo.",
                actionProps: { children: "Undo", onClick: () => toast.close(id) },
              });
            }}
          >
            Archive event
          </Button>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Promise">
        <ComponentPreview code={promiseCode}>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => showPromise(true)}>Save event</Button>
            <Button variant="secondary" onClick={() => showPromise(false)}>
              Simulate failure
            </Button>
          </div>
        </ComponentPreview>
        <p className="text-site-body text-muted-foreground">
          Loading, success, and error update one notification. Handle rejected promises in your
          application as usual.
        </p>
      </DocSection>
      <DocSection title="Update and Dismiss">
        <ComponentPreview code={updateCode}>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                updateId.current = toast.add({
                  id: "toast-demo-upload",
                  title: "Upload queued",
                  timeout: 0,
                });
              }}
            >
              Queue upload
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (updateId.current)
                  toast.update(updateId.current, {
                    title: "Upload complete",
                    type: "success",
                    timeout: 5000,
                  });
              }}
            >
              Complete upload
            </Button>
            <Button variant="ghost" onClick={() => toast.close()}>
              Dismiss all
            </Button>
          </div>
        </ComponentPreview>
      </DocSection>
      <DocSection title="Stacking">
        <ComponentPreview code={stackCode}>
          <Button
            variant="secondary"
            onClick={() =>
              toast.add({
                title: `Notification ${++count.current}`,
                description: "Hover or focus the stack to expand it.",
              })
            }
          >
            Add to stack
          </Button>
        </ComponentPreview>
        <p className="text-site-body text-muted-foreground">
          Hover or focus to expand the stack and pause dismissal. Swipe down or right to dismiss. F6
          moves focus into the notification region. Shift+Tab returns to the previous control.
        </p>
      </DocSection>
      <DocSection title="API Reference">
        <PropsTable props={toasterProps} />
        <PropsTable props={toastManagerProps} />
        <PropsTable props={toastCompositionProps} />
      </DocSection>
      <Toaster />
    </DocPage>
  );
}
