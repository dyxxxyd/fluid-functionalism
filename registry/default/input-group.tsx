"use client";

import {
  useRef,
  useState,
  useMemo,
  createContext,
  useContext,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { Field } from "@base-ui/react/field";
import type { IconComponent } from "@/lib/icon-context";
import { cn } from "@/lib/utils";
import { fontWeights } from "@/lib/font-weight";
import { useShape } from "@/lib/shape-context";
import { SizeProvider, useSize, type SizeVariant } from "@/lib/size-context";
import { useFluidHover, useRegisterFluidHoverItem } from "@/hooks/use-fluid-hover";

// ---------------------------------------------------------------------------
// InputGroup stacks labelled text fields that share one fluid hover scope.
// Borderless fields are invisible at rest; bordered fields keep their ring,
// filled fields keep a muted fill, and underlined fields show only a bottom
// border. The field nearest the pointer shows its hover chrome; focused
// fields lift to the card surface except underlined fields, which stay clear.
// There is no separate highlight element: each field draws its own state.
// ---------------------------------------------------------------------------

type InputGroupVariant = "bordered" | "borderless" | "filled" | "underlined";

interface InputGroupContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  activeIndex: number | null;
  variant: InputGroupVariant;
}

const InputGroupContext = createContext<InputGroupContextValue | null>(null);

function useInputGroup() {
  const ctx = useContext(InputGroupContext);
  if (!ctx)
    throw new Error("useInputGroup must be used within an InputGroup");
  return ctx;
}

interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Default appearance for every field. Individual fields can override it. */
  variant?: InputGroupVariant;
  /** Pins the group's fields to one step of the size ladder (default 36px,
   *  compact 28px). Omitted, they follow the surrounding SizeProvider. */
  size?: SizeVariant;
}

const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ children, variant = "bordered", size, className, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { activeIndex, handlers, registerItem } =
      useFluidHover(containerRef);

    const contextValue = useMemo(
      () => ({ registerItem, activeIndex, variant }),
      [registerItem, activeIndex, variant]
    );

    const group = (
      <InputGroupContext.Provider value={contextValue}>
        <div
          ref={(node) => {
            (containerRef as React.RefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
          }}
          onMouseEnter={handlers.onMouseEnter}
          onMouseMove={handlers.onMouseMove}
          onMouseLeave={handlers.onMouseLeave}
          // `relative` makes this div the fields' offsetParent — the fluid hover
          // hook measures items via offsetTop and compares against
          // container-relative mouse coords, so the two coordinate spaces must
          // share this origin (same as every other fluid hover consumer).
          className={cn("relative flex flex-col gap-3 w-72 max-w-full", className)}
          {...props}
        >
          {children}
        </div>
      </InputGroupContext.Provider>
    );

    // A size prop pins every field in the group to one ladder step.
    return size ? <SizeProvider size={size}>{group}</SizeProvider> : group;
  }
);

InputGroup.displayName = "InputGroup";

interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "index"> {
  label: string;
  /** Keep the label for assistive tech but don't render it — for inline
   *  fields (a toolbar search) where the placeholder carries the meaning. */
  labelHidden?: boolean;
  /** Overrides the surrounding InputGroup's variant for this field. */
  variant?: InputGroupVariant;
  placeholder?: string;
  icon?: IconComponent;
  index: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const InputField = forwardRef<HTMLDivElement, InputFieldProps>(
  (
    {
      label,
      labelHidden,
      variant: variantProp,
      placeholder,
      icon: Icon,
      index,
      value,
      onChange,
      error,
      disabled,
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLElement | null>(null);
    const { registerItem, activeIndex, variant: groupVariant } = useInputGroup();
    const variant = variantProp ?? groupVariant;
    const [isFocused, setIsFocused] = useState(false);
    const shape = useShape();
    const sizeClasses = useSize();
    const compact = sizeClasses.variant === "compact";

    useRegisterFluidHoverItem(registerItem, index, internalRef);

    // Lit when nearest the pointer OR focused, so tabbing through the form
    // shows the same cue as hovering it.
    const isActive = activeIndex === index;
    const labelActive = isActive || isFocused;

    // Input container classes. The first match wins: disabled, error,
    // focused, hovered, rest. Bordered errors keep a red ring at rest; the
    // quieter variants reveal it on hover or focus. Underlined fields stay
    // transparent and use only their bottom border for every state.
    const restBgClass = variant === "filled" ? "bg-muted/50" : "bg-transparent";
    const restRingClass = variant === "bordered" ? "ring-border" : "ring-transparent";
    let bgClass: string;
    let edgeClass: string;

    if (variant === "underlined") {
      bgClass = "bg-transparent";
      edgeClass = disabled ? "border-border"
        : error ? "border-destructive/50"
        : isFocused ? "border-foreground"
        : isActive ? "border-muted-foreground"
        : "border-border";
    } else if (disabled) {
      bgClass = restBgClass;
      edgeClass = variant === "filled" ? "ring-transparent" : "ring-border";
    } else if (error) {
      bgClass = isFocused ? "bg-card" : isActive ? "bg-destructive-light/60" : restBgClass;
      edgeClass = isFocused || isActive || variant === "bordered" ? "ring-destructive/50" : "ring-transparent";
    } else if (isFocused) {
      bgClass = "bg-card";
      edgeClass = "ring-border";
    } else if (isActive) {
      bgClass = variant === "filled" ? "bg-muted" : "bg-muted/50";
      edgeClass = "ring-border";
    } else {
      bgClass = restBgClass;
      edgeClass = restRingClass;
    }

    return (
      // Base UI Field wires the accessibility plumbing: Field.Label's htmlFor
      // targets the control, Field.Error's generated id lands in the control's
      // aria-describedby, and `invalid` drives aria-invalid / data-invalid.
      <Field.Root
        ref={(node) => {
          (internalRef as React.RefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
        }}
        invalid={!!error}
        disabled={disabled}
        className={cn(
          "flex flex-col gap-1 cursor-text",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        {/* Label — sr-only when hidden so the field keeps its accessible
            name and the htmlFor wiring. */}
        <Field.Label
          className={cn(
            labelHidden ? "sr-only" : "inline-grid",
            sizeClasses.text,
            // Keep the same inset across variants so switching the chrome
            // never moves the label relative to the field's text.
            !labelHidden && (compact ? "pl-2" : "pl-2.5")
          )}
        >
          {/* An invisible semibold copy shares the grid cell and reserves the
              bold width, so a heavier label never shifts the layout. */}
          <span
            className="col-start-1 row-start-1 invisible"
            style={{ fontVariationSettings: fontWeights.semibold }}
            aria-hidden="true"
          >
            {label}
          </span>
          <span
            className={cn(
              "col-start-1 row-start-1",
              error ? "text-destructive" : "text-muted-foreground"
            )}
            style={{
              fontVariationSettings: fontWeights.normal,
            }}
          >
            {label}
          </span>
        </Field.Label>

        {/* Input container */}
        <div
          onMouseDown={(e) => {
            // The old wrapper was one big <label>, so a click anywhere (icon,
            // padding) focused the input. Keep that, without disturbing the
            // input's own caret placement.
            if (e.target === inputRef.current) return;
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className={cn(
            // Fixed height (was py-2 around the line box) so the field sits
            // exactly on the ladder's control height.
            `flex items-center ${sizeClasses.gap} ${
              compact ? "px-2" : "px-2.5"
            } ${sizeClasses.control} transition-all duration-80`,
            variant === "underlined" ? "rounded-none border-b" : `${shape.input} ring-1`,
            bgClass,
            edgeClass
          )}
        >
          {/* The icon wakes with the field: muted → foreground and stroke
              1.5 → 2 over 80ms. */}
          {Icon && (
            <Icon
              size={sizeClasses.icon}
              strokeWidth={labelActive ? 2 : 1.5}
              className={cn(
                "shrink-0 transition-[color,stroke-width] duration-80",
                labelActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            />
          )}
          <Field.Control
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-none bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-[inherit]",
              sizeClasses.field
            )}
            style={{ fontVariationSettings: fontWeights.normal }}
            {...props}
          />
        </div>

        {/* Error message: `match` pins it visible while the controlled
            `error` prop stands. Same inset as the label above. */}
        {error && (
          <Field.Error
            match
            className={cn(
              "text-destructive",
              compact ? "text-[length:var(--fs-caption-compact,11px)] leading-[var(--lh-caption-compact,14px)] pl-2" : "text-[length:var(--fs-caption,12px)] leading-[var(--lh-caption,16px)] pl-2.5"
            )}
            style={{ fontVariationSettings: fontWeights.normal }}
          >
            {error}
          </Field.Error>
        )}
      </Field.Root>
    );
  }
);

InputField.displayName = "InputField";

export { InputGroup, InputField };
export type { InputGroupVariant };
export default InputGroup;
