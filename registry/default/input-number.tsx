"use client";

import { forwardRef, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { NumberField } from "@base-ui/react/number-field";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { fontWeights } from "@/lib/font-weight";
import { useIcons } from "@/lib/icon-context";
import { nestedRadius, useShape } from "@/lib/shape-context";
import { useSize, type SizeVariant } from "@/lib/size-context";
import { spring } from "@/lib/springs";
import { useFluidHover, useRegisterFluidHoverItem } from "@/hooks/use-fluid-hover";
import { FluidHoverHighlight } from "@/components/ui/fluid-hover-highlight";

const inputNumberVariants = cva(
  "relative inline-flex w-36 min-w-0 items-center text-foreground ring-1 transition-[background-color,box-shadow,border-color] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        bordered: "bg-transparent ring-border hover:not-focus-within:bg-hover focus-within:bg-card",
        borderless:
          "bg-transparent ring-transparent hover:not-focus-within:bg-hover focus-within:bg-card",
        filled: "bg-muted/50 ring-transparent hover:not-focus-within:bg-muted focus-within:bg-card",
        underlined:
          "rounded-none border-b border-border bg-transparent ring-0 hover:not-focus-within:border-muted-foreground",
      },
      status: {
        error: "ring-destructive/50",
        warning: "ring-[color:var(--warning)]",
      },
    },
    compoundVariants: [
      {
        variant: ["bordered", "borderless", "filled"],
        status: undefined,
        className: "focus-within:ring-border",
      },
      {
        variant: "underlined",
        status: undefined,
        className: "focus-within:border-foreground",
      },
      {
        variant: "underlined",
        status: "error",
        className: "border-destructive/50 hover:border-destructive/50",
      },
      {
        variant: "underlined",
        status: "warning",
        className: "border-[color:var(--warning)] hover:border-[color:var(--warning)]",
      },
    ],
    defaultVariants: { variant: "bordered" },
  },
);

type InputNumberVariant = "bordered" | "borderless" | "filled" | "underlined";

function decimalPlaces(value: number) {
  const [coefficient, exponent = "0"] = String(value).split("e");
  return Math.max(0, (coefficient.split(".")[1]?.length ?? 0) - Number(exponent));
}

interface InputNumberProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "children"
  | "defaultValue"
  | "value"
  | "onChange"
  | "size"
  | "min"
  | "max"
  | "step"
  | "prefix"
  | "type"
> {
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Fixed decimal places (0–20). Takes precedence over format's fraction digits. */
  precision?: number;
  /** Locale-aware formatting and parsing, instead of a formatter/parser pair. */
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  controls?: boolean;
  /** Wheel changes are opt-in and only work while the input is focused. */
  changeOnWheel?: boolean;
  variant?: InputNumberVariant;
  size?: SizeVariant;
  status?: "error" | "warning";
  prefix?: ReactNode;
  suffix?: ReactNode;
}

// Both steppers share one nearest-item hover, including the gap between them.
// The primitive owns press-and-hold, bounds and disabled/read-only semantics.
function InputNumberControls({ size }: { size: SizeVariant }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const incrementRef = useRef<HTMLButtonElement>(null);
  const decrementRef = useRef<HTMLButtonElement>(null);
  const hover = useFluidHover(containerRef, {
    isItemDisabled: (element) => element.matches(":disabled, [aria-disabled='true']"),
  });
  useRegisterFluidHoverItem(hover.registerItem, 0, incrementRef);
  useRegisterFluidHoverItem(hover.registerItem, 1, decrementRef);
  const icons = useIcons();
  const Chevron = icons["chevron-down"];
  const shape = useShape();
  const sizeClasses = useSize(size);
  const buttonClass =
    "relative flex min-h-0 flex-1 items-center justify-center rounded-[inherit] text-muted-foreground outline-none data-[fluid-hover]:text-foreground active:bg-active disabled:opacity-40 aria-disabled:opacity-40";

  return (
    <div className="h-full shrink-0 p-0.5">
      <div
        ref={containerRef}
        {...hover.handlers}
        data-slot="input-number-controls"
        className={cn("relative flex h-full flex-col gap-px", size === "compact" ? "w-6" : "w-7")}
        style={{ borderRadius: nestedRadius(shape.bgRadius, 2) }}
      >
        <FluidHoverHighlight hover={hover} className="rounded-[inherit]" />
        <NumberField.Increment ref={incrementRef} className={buttonClass}>
          <Chevron
            size={sizeClasses.icon - 4}
            strokeWidth={1.5}
            className="rotate-180"
            aria-hidden="true"
          />
        </NumberField.Increment>
        <NumberField.Decrement ref={decrementRef} className={buttonClass}>
          <Chevron size={sizeClasses.icon - 4} strokeWidth={1.5} aria-hidden="true" />
        </NumberField.Decrement>
      </div>
    </div>
  );
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      precision,
      format,
      locale,
      controls = true,
      changeOnWheel = false,
      variant = "bordered",
      size,
      status,
      prefix,
      suffix,
      disabled,
      readOnly,
      required,
      name,
      form,
      id,
      className,
      style,
      ...inputProps
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState<number | null>(defaultValue ?? null);
    const currentValue = value === undefined ? internalValue : value;
    const shape = useShape();
    const sizeClasses = useSize(size);

    // Keep native editing text ("-", "1.", trailing zeroes) until blur.
    // NumberField handles parsing, decimal stepping and the hidden form value.
    const numberFormat: Intl.NumberFormatOptions = {
      useGrouping: false,
      maximumFractionDigits: 20,
      ...format,
      ...(precision === undefined
        ? {}
        : {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          }),
    };

    return (
      <NumberField.Root
        id={id}
        name={name}
        form={form}
        value={currentValue}
        onValueChange={(next, details) => {
          // Showing up to 20 fraction digits must not expose arithmetic noise
          // (0.3 - 0.1). Round steps to the precision of their operands; typed
          // numbers keep all their digits, and exact range boundaries win.
          if (
            next !== null &&
            next !== min &&
            next !== max &&
            !details.reason.startsWith("input-")
          ) {
            const places = Math.max(decimalPlaces(currentValue ?? 0), decimalPlaces(step));
            if (places <= 100) next = Number(next.toFixed(places));
          }
          if (value === undefined) setInternalValue(next);
          onChange?.(next);
        }}
        min={min}
        max={max}
        step={step}
        // Alt keeps the configured decimal step; Shift takes ten steps.
        smallStep={step}
        largeStep={step * 10}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        allowWheelScrub={changeOnWheel}
        format={numberFormat}
        locale={locale}
        data-slot="input-number"
        data-variant={variant}
        data-size={sizeClasses.variant}
        data-status={status}
        className={cn(
          variant !== "underlined" && shape.input,
          inputNumberVariants({ variant, status }),
          sizeClasses.control,
          sizeClasses.text,
          className,
        )}
        style={{
          fontVariationSettings: fontWeights.normal,
          transitionDuration: `${spring.fast.duration}s`,
          ...style,
        }}
      >
        <NumberField.Group
          className={cn(
            "flex h-full min-w-0 flex-1 items-center",
            sizeClasses.gap,
            sizeClasses.px,
            controls && "pr-0",
          )}
          onMouseDown={(event) => {
            if (
              !(event.target instanceof Element) ||
              event.target.closest("input, button, a, select, textarea, [contenteditable='true']")
            )
              return;
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          {prefix != null && (
            <span
              data-slot="input-number-prefix"
              className="flex shrink-0 items-center text-muted-foreground"
            >
              {prefix}
            </span>
          )}
          <NumberField.Input
            {...inputProps}
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            aria-invalid={status === "error" ? true : inputProps["aria-invalid"]}
            data-slot="input-number-input"
            className={cn(
              "h-full w-full min-w-0 flex-1 rounded-none bg-transparent tabular-nums text-foreground outline-none placeholder:text-muted-foreground",
              sizeClasses.field,
            )}
          />
          {suffix != null && (
            <span
              data-slot="input-number-suffix"
              className="flex shrink-0 items-center text-muted-foreground"
            >
              {suffix}
            </span>
          )}
          {controls && <InputNumberControls size={sizeClasses.variant} />}
        </NumberField.Group>
      </NumberField.Root>
    );
  },
);

InputNumber.displayName = "InputNumber";

export { InputNumber, inputNumberVariants };
export type { InputNumberProps, InputNumberVariant };
