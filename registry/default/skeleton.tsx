"use client";

// Based on shadcn/ui's Skeleton: https://ui.shadcn.com/docs/components/base/skeleton
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { useShape } from "@/lib/shape-context";

type SkeletonProps = ComponentPropsWithoutRef<"div">;

// The parent loading region owns the announcement. Decorative placeholders
// stay out of the accessibility tree and stop pulsing with reduced motion.
const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => {
  const shape = useShape();
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse bg-accent motion-reduce:animate-none", shape.bg, className)}
      {...props}
    />
  );
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
