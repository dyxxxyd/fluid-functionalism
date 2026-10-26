"use client";

// Based on shadcn/ui's Base UI Toast: https://ui.shadcn.com/docs/components/base/toast
import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { spring as generateSpring } from "motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";
import { useShape } from "@/lib/shape-context";
import { useSize } from "@/lib/size-context";
import { useIcons } from "@/lib/icon-context";
import { SurfaceProvider, useSurface } from "@/lib/surface-context";
import { surfaceClasses } from "@/lib/surface-classes";

const toast = ToastPrimitive.createToastManager();
const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

// CSS owns the primitive's swipe transforms and transition lifecycle. The
// curve comes from the same moderate spring as the other small panels.
const toastMotion = {
  "--toast-enter": generateSpring({
    duration: spring.moderate.duration * 1000,
    bounce: spring.moderate.bounce,
    keyframes: [0, 1],
  }).toString(),
  "--toast-exit-duration": `${spring.moderate.exit.duration}s`,
  "--toast-fade-duration": `${spring.fast.duration}s`,
} as React.CSSProperties;

type ToastProps = ToastPrimitive.Root.Props;
type ToasterProps = ToastPrimitive.Provider.Props & {
  /** Props for the fixed viewport, including its accessible label and ref. */
  viewportProps?: ToastPrimitive.Viewport.Props;
  /** Portal target. Defaults to document.body. */
  container?: ToastPrimitive.Portal.Props["container"];
};

function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal(props: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

const ToastViewport = React.forwardRef<HTMLDivElement, ToastPrimitive.Viewport.Props>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
      ref={ref}
      data-slot="toast-viewport"
      className={(state) =>
        cn(
          "pointer-events-none fixed inset-x-4 bottom-4 z-[100] mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  ),
);
ToastViewport.displayName = "ToastViewport";

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, style, children, ...props }, ref) => {
    const shape = useShape();
    const level = Math.min(useSurface() + 2, 8);
    return (
      <ToastPrimitive.Root
        ref={ref}
        data-slot="toast"
        className={(state) =>
          cn(
            "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom text-foreground outline-none select-none will-change-transform focus-visible:ring-2 focus-visible:ring-ring",
            "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1-var(--toast-index)*var(--gap)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-var(--toast-index)*0.05))] [--shrink:calc(1-var(--scale))]",
            "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-var(--toast-index)*var(--peek)-var(--shrink)*var(--height)))_scale(var(--scale))] [transition:transform_var(--toast-enter),opacity_var(--toast-enter)]",
            "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
            "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
            "data-starting-style:opacity-0 data-starting-style:[transform:translateY(150%)] data-limited:opacity-0 data-limited:pointer-events-none",
            "data-ending-style:opacity-0 data-ending-style:pointer-events-none data-ending-style:duration-(--toast-exit-duration) data-ending-style:ease-in data-swiping:duration-0",
            "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
            "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
            "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
            "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
            "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
            "motion-reduce:transition-opacity motion-reduce:[--scale:1] motion-reduce:data-starting-style:transform-none motion-reduce:data-ending-style:transform-none",
            shape.container,
            surfaceClasses(level),
            typeof className === "function" ? className(state) : className,
          )
        }
        style={(state) => ({
          ...toastMotion,
          ...(typeof style === "function" ? style(state) : style),
        })}
        {...props}
      >
        <SurfaceProvider value={level}>{children}</SurfaceProvider>
      </ToastPrimitive.Root>
    );
  },
);
Toast.displayName = "Toast";

const ToastContent = React.forwardRef<HTMLDivElement, ToastPrimitive.Content.Props>(
  ({ className, ...props }, ref) => {
    const size = useSize();
    return (
      <ToastPrimitive.Content
        ref={ref}
        data-slot="toast-content"
        className={(state) =>
          cn(
            "flex h-full items-center gap-3 overflow-hidden [transition:opacity_var(--toast-fade-duration)_ease-out] data-behind:opacity-0 data-expanded:opacity-100",
            size.variant === "compact" ? "p-3" : "p-4",
            typeof className === "function" ? className(state) : className,
          )
        }
        {...props}
      />
    );
  },
);
ToastContent.displayName = "ToastContent";

const ToastTitle = React.forwardRef<HTMLHeadingElement, ToastPrimitive.Title.Props>(
  ({ className, style, ...props }, ref) => {
    const { type } = useSize();
    return (
      <ToastPrimitive.Title
        ref={ref}
        data-slot="toast-title"
        className={(state) =>
          cn(
            type.body,
            "break-words",
            typeof className === "function" ? className(state) : className,
          )
        }
        style={(state) => ({
          fontVariationSettings: fontWeights.semibold,
          ...(typeof style === "function" ? style(state) : style),
        })}
        {...props}
      />
    );
  },
);
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<HTMLParagraphElement, ToastPrimitive.Description.Props>(
  ({ className, style, ...props }, ref) => {
    const { type } = useSize();
    return (
      <ToastPrimitive.Description
        ref={ref}
        data-slot="toast-description"
        className={(state) =>
          cn(
            type.body,
            "break-words text-muted-foreground",
            typeof className === "function" ? className(state) : className,
          )
        }
        style={(state) => ({
          fontVariationSettings: fontWeights.normal,
          ...(typeof style === "function" ? style(state) : style),
        })}
        {...props}
      />
    );
  },
);
ToastDescription.displayName = "ToastDescription";

const ToastAction = React.forwardRef<HTMLButtonElement, ToastPrimitive.Action.Props>(
  ({ render = <Button variant="secondary" size="compact" />, ...props }, ref) => (
    <ToastPrimitive.Action ref={ref} data-slot="toast-action" render={render} {...props} />
  ),
);
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef<HTMLButtonElement, ToastPrimitive.Close.Props>(
  ({ children, render = <Button variant="ghost" size="icon-compact" />, ...props }, ref) => {
    const icons = useIcons();
    const CloseIcon = icons.x;
    return (
      <ToastPrimitive.Close
        ref={ref}
        data-slot="toast-close"
        aria-label="Close toast"
        render={render}
        {...props}
      >
        {children ?? <CloseIcon />}
      </ToastPrimitive.Close>
    );
  },
);
ToastClose.displayName = "ToastClose";

// The shapes and status tokens match Banner's Statuses. Only the glyph
// carries the tone; the notification keeps its neutral elevated surface.
type ColoredToastStatus = "info" | "success" | "warning" | "error";
const TOAST_TONE = {
  default: "var(--foreground)",
  info: "var(--info)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--destructive)",
  loading: "var(--foreground)",
} as const;

function ToastStatusGlyph({ status, size }: { status: ColoredToastStatus; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {status === "warning" ? (
        <path
          d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ) : (
        <circle cx="12" cy="12" r="10.5" fill="currentColor" />
      )}
      <g
        className="stroke-background"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {status === "success" ? (
          <path d="m8.5 12.25 2.5 2.5 4.5-5" />
        ) : status === "warning" ? (
          <path d="M12 9.5v3.5M12 17h.01" />
        ) : status === "error" ? (
          <path d="M12 7.5v5M12 16.5h.01" />
        ) : (
          <path d="M12 16.5v-5M12 7.5h.01" />
        )}
      </g>
    </svg>
  );
}

function ToastIcon({ type = "default" }: { type?: string }) {
  const icons = useIcons();
  const size = useSize();
  const iconSize = size.variant === "compact" ? 16 : 20;
  const InfoIcon = icons.info;
  const LoadingIcon = icons.loader;
  if (!Object.hasOwn(TOAST_TONE, type)) return null;
  const status = type as keyof typeof TOAST_TONE;
  return (
    <span
      data-slot="toast-icon"
      data-type={status}
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center"
      style={{ color: TOAST_TONE[status] }}
    >
      {status === "default" ? (
        <InfoIcon size={iconSize} strokeWidth={1.5} />
      ) : status === "loading" ? (
        <LoadingIcon
          size={iconSize}
          strokeWidth={1.5}
          className="animate-spin motion-reduce:animate-none"
        />
      ) : (
        <ToastStatusGlyph status={status} size={iconSize} />
      )}
    </span>
  );
}

function ToastList() {
  const { toasts } = useToastManager();
  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent>
        <ToastIcon type={item.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        {item.actionProps && <ToastAction />}
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  viewportProps,
  container,
  ...props
}: ToasterProps) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal container={container}>
        <ToastViewport {...viewportProps}>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

export {
  Toaster,
  Toast,
  ToastProvider,
  ToastPortal,
  ToastViewport,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  toast,
  createToastManager,
  useToastManager,
};
export type { ToastProps, ToasterProps };
