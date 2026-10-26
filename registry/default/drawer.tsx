"use client";

// Based on shadcn/ui's Base UI Drawer: https://ui.shadcn.com/docs/components/base/drawer
import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { spring as generateSpring } from "motion";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";
import { useShape } from "@/lib/shape-context";
import { useSize } from "@/lib/size-context";
import { SurfaceProvider, useSurface } from "@/lib/surface-context";
import { surfaceClasses } from "@/lib/surface-classes";

// Drawer owns its gesture transforms and CSS transition lifecycle. A CSS
// linear() spring keeps those intact, including snap points and nested swipes.
// This shared component uses Base UI in either primitive flavor.
const drawerEnter = generateSpring({
  duration: spring.moderate.duration * 1000,
  bounce: spring.moderate.bounce,
  keyframes: [0, 1],
}).toString();

const drawerMotion = {
  "--drawer-enter": drawerEnter,
  "--drawer-exit-duration": `${spring.moderate.exit.duration}s`,
} as React.CSSProperties;

interface DrawerProps<Payload = unknown> extends DrawerPrimitive.Root.Props<Payload> {
  /** Render a visual grip beside the drawer content. */
  showSwipeHandle?: boolean;
}

interface DrawerContentProps extends DrawerPrimitive.Popup.Props {
  /** Portal target. Defaults to document.body. */
  container?: DrawerPrimitive.Portal.Props["container"];
}

type DrawerContextValue = {
  hasSnapPoints: boolean;
  modal: DrawerPrimitive.Root.Props["modal"];
  showSwipeHandle: boolean;
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>;
};

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawer() {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error("DrawerContent must be used within a Drawer.");
  return context;
}

function Drawer<Payload = unknown>({
  modal = true,
  showSwipeHandle = false,
  snapPoints,
  swipeDirection = "down",
  ...props
}: DrawerProps<Payload>) {
  const hasSnapPoints = Boolean(snapPoints?.length);
  const context = React.useMemo(
    () => ({ hasSnapPoints, modal, showSwipeHandle, swipeDirection }),
    [hasSnapPoints, modal, showSwipeHandle, swipeDirection],
  );

  return (
    <DrawerContext.Provider value={context}>
      <DrawerPrimitive.Root
        modal={modal}
        snapPoints={snapPoints}
        swipeDirection={swipeDirection}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

function DrawerTrigger<Payload = unknown>(props: DrawerPrimitive.Trigger.Props<Payload>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={(state) => cn(
        "fixed inset-0 z-50 min-h-dvh bg-black/40 dark:bg-black/80 select-none supports-[-webkit-touch-callout:none]:absolute",
        "opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress,0)))] [transition:opacity_var(--drawer-enter)]",
        "data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:pointer-events-none data-ending-style:duration-(--drawer-exit-duration) data-ending-style:ease-in data-swiping:duration-0 data-snap-points:[--drawer-overlay-min-opacity:0.5]",
        typeof className === "function" ? className(state) : className,
      )}
      style={(state) => ({
        ...drawerMotion,
        ...(typeof style === "function" ? style(state) : style),
      })}
      {...props}
    />
  );
}

function DrawerSwipeHandle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-swipe-handle"
      aria-hidden="true"
      className={cn(
        "relative z-10 flex shrink-0 items-center justify-center cursor-grab active:cursor-grabbing",
        "group-data-[swipe-axis=y]/drawer-popup:h-6 group-data-[swipe-axis=x]/drawer-popup:w-6",
        "group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:order-last",
        "after:rounded-full after:bg-muted-foreground/30 group-data-[swipe-axis=y]/drawer-popup:after:h-1 group-data-[swipe-axis=y]/drawer-popup:after:w-8 group-data-[swipe-axis=x]/drawer-popup:after:w-1 group-data-[swipe-axis=x]/drawer-popup:after:h-8",
        className,
      )}
      {...props}
    />
  );
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, style, children, container, ...props }, ref) => {
    const { hasSnapPoints, modal, showSwipeHandle, swipeDirection } = useDrawer();
    const swipeAxis = swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";
    const shape = useShape();
    const level = Math.min(useSurface() + 4, 8);
    const { type } = useSize();

    return (
      <DrawerPortal container={container}>
        {modal === true && <DrawerOverlay data-snap-points={hasSnapPoints ? "" : undefined} />}
        <DrawerPrimitive.Viewport
          data-slot="drawer-viewport"
          data-modal={modal}
          className="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto"
        >
          <DrawerPrimitive.Popup
            ref={ref}
            data-slot="drawer-popup"
            data-swipe-axis={swipeAxis}
            data-snap-points={hasSnapPoints ? "" : undefined}
            className={(state) => cn(
              "group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex min-h-0 flex-col text-foreground outline-none select-none will-change-transform",
              type.body,
              surfaceClasses(level),
              // Float from the viewport like shadcn's Maia/Mira styles.
              // Sizing variables keep ordinary h-*/w-* overrides usable.
              "[--drawer-inset:0.5rem] [--drawer-bleed-background:transparent] [--drawer-content-height:var(--drawer-height,auto)] rounded-(--drawer-radius) h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) w-(--drawer-content-width,auto) transform-(--drawer-rest-transform) [transition:transform_var(--drawer-enter),opacity_var(--drawer-enter)]",
              "[--drawer-rest-transform:translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))]",
              // Scale and lift the parent while a nested drawer is in front.
              "[--peek:1rem] [--stack-step:0.05] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-progress:clamp(0,var(--drawer-swipe-progress,0),1)] [--stack-peek-offset:max(0px,calc((var(--nested-drawers,0)-var(--stack-progress))*var(--peek)))] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers,0)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))]",
              "data-nested-drawer-open:overflow-hidden data-swiping:duration-0 data-nested-drawer-swiping:duration-0",
              "data-starting-style:transform-(--drawer-closed-transform) data-ending-style:transform-(--drawer-closed-transform) data-ending-style:duration-(--drawer-exit-duration) data-ending-style:ease-in",
              "data-ending-style:data-swiping:duration-(--drawer-exit-duration) data-ending-style:data-nested-drawer-swiping:duration-(--drawer-exit-duration)",
              // A floating drawer leaves this transparent so the gap stays
              // visible. Consumers can set a fill for a flush drawer.
              "after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-12 data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-12",
              "data-[swipe-direction=down]:after:top-full data-[swipe-direction=up]:after:bottom-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full",
              "data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=y]:data-nested-drawer-open:[--drawer-content-height:var(--stack-height)]",
              "data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:[--drawer-content-height:auto] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem] data-[swipe-axis=x]:flex-row",
              "data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--drawer-closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]",
              "data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--drawer-closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]",
              "data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--drawer-closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x,0px)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))]",
              "data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--drawer-closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x,0px)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))]",
              // Keep the fade without animated travel, including outside a
              // MotionConfig provider in a consumer's app.
              "motion-reduce:transition-opacity motion-reduce:data-starting-style:transform-(--drawer-rest-transform) motion-reduce:data-ending-style:transform-(--drawer-rest-transform) motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:opacity-0",
              typeof className === "function" ? className(state) : className,
            )}
            style={(state) => ({
              ...drawerMotion,
              "--drawer-radius": `${shape.containerRadius}px`,
              ...(typeof style === "function" ? style(state) : style),
            })}
            {...props}
          >
            <SurfaceProvider value={level}>
              {showSwipeHandle && <DrawerSwipeHandle />}
              <DrawerPrimitive.Content
                data-slot="drawer-content"
                className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] select-text group-data-swiping/drawer-popup:select-none group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 [transition:opacity_var(--drawer-enter)]"
              >
                {children}
              </DrawerPrimitive.Content>
            </SurfaceProvider>
          </DrawerPrimitive.Popup>
        </DrawerPrimitive.Viewport>
      </DrawerPortal>
    );
  },
);
DrawerContent.displayName = "DrawerContent";

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-header" className={cn("flex shrink-0 flex-col gap-2 p-4 group-data-[swipe-axis=y]/drawer-popup:text-center", className)} {...props} />;
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-footer" className={cn("mt-auto flex shrink-0 flex-col gap-2 p-4", className)} {...props} />;
}

function DrawerTitle({ className, style, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  const { type } = useSize();
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={(state) => cn(type.title, "text-foreground", typeof className === "function" ? className(state) : className)}
      style={(state) => ({ fontVariationSettings: fontWeights.semibold, ...(typeof style === "function" ? style(state) : style) })}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  const { type } = useSize();
  return <DrawerPrimitive.Description data-slot="drawer-description" className={(state) => cn(type.body, "text-muted-foreground", typeof className === "function" ? className(state) : className)} {...props} />;
}

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerSwipeHandle,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
export type { DrawerProps, DrawerContentProps };
