"use client";

import { useState } from "react";
import { InputNumber } from "@/registry/default/input-number";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";
import { inputNumberProps } from "@/lib/docs/api/input-number";

const basicCode = `import { useState } from "react";
import { InputNumber } from "@/components/ui/input-number";

function Quantity() {
  const [value, setValue] = useState<number | null>(3);
  return <InputNumber aria-label="Quantity" min={0} max={10}
    value={value} onChange={setValue} />;
}`;

const variantsCode = `<InputNumber aria-label="Bordered" defaultValue={3} />
<InputNumber aria-label="Borderless" variant="borderless" defaultValue={3} />
<InputNumber aria-label="Filled" variant="filled" defaultValue={3} />
<InputNumber aria-label="Underlined" variant="underlined" defaultValue={3} />`;

const sizesCode = `<InputNumber aria-label="Default size" size="default" defaultValue={3} />
<InputNumber aria-label="Compact size" size="compact" defaultValue={3} />`;

const decimalCode = `<InputNumber aria-label="Decimal value" defaultValue={1.2}
  step={0.01} precision={2} />`;

const formatCode = `<InputNumber aria-label="Price" defaultValue={1234.5} locale="en-US"
  format={{ style: "currency", currency: "USD", useGrouping: true }} />
<InputNumber aria-label="Ratio" defaultValue={0.25} step={0.01}
  locale="en-US" format={{ style: "percent", maximumFractionDigits: 0 }} />`;

const affixesCode = `<InputNumber aria-label="Budget" prefix="$" defaultValue={100} />
<InputNumber aria-label="Weight" suffix="kg" defaultValue={5} step={0.5} />`;

const statesCode = `<InputNumber aria-label="Disabled" defaultValue={3} disabled />
<InputNumber aria-label="Read only" defaultValue={3} readOnly />
<InputNumber aria-label="Error" defaultValue={3} status="error" />
<InputNumber aria-label="Warning" defaultValue={3} status="warning" />`;

const controlsCode = `<InputNumber aria-label="Without controls" defaultValue={3} controls={false} />`;

export default function InputNumberDoc() {
  const [value, setValue] = useState<number | null>(3);

  return (
    <DocPage
      title="InputNumber"
      slug="input-number"
      description="Numeric input with decimal steps, range limits, formatting, and fluid stepper hover."
      intro={
        <>
          Based on{" "}
          <a
            href="https://ant.design/components/input-number-cn"
            className="underline underline-offset-4"
          >
            Ant Design InputNumber
          </a>
          , with the Fluid size and shape systems. Values use JavaScript numbers; clear the field to
          receive null.
        </>
      }
    >
      <DocSection title="Basic">
        <ComponentPreview code={basicCode}>
          <div className="flex flex-col items-center gap-3">
            <InputNumber aria-label="Quantity" min={0} max={10} value={value} onChange={setValue} />
            <p className="text-site-caption text-muted-foreground">Value: {value ?? "empty"}</p>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Variants">
        <ComponentPreview code={variantsCode}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {(["bordered", "borderless", "filled", "underlined"] as const).map((variant) => (
              <div key={variant} className="flex flex-col gap-2">
                <label
                  htmlFor={`number-${variant}`}
                  className="text-site-caption text-muted-foreground"
                >
                  {variant}
                </label>
                <InputNumber id={`number-${variant}`} variant={variant} defaultValue={3} />
              </div>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <ComponentPreview code={sizesCode}>
          <div className="flex flex-wrap items-center gap-3">
            <InputNumber aria-label="Default size" size="default" defaultValue={3} />
            <InputNumber aria-label="Compact size" size="compact" defaultValue={3} />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Decimal Steps">
        <ComponentPreview code={decimalCode}>
          <InputNumber aria-label="Decimal value" defaultValue={1.2} step={0.01} precision={2} />
        </ComponentPreview>
        <p className="text-site-body text-muted-foreground">
          Arrow keys and buttons use step. Shift takes ten steps. Typing keeps partial decimals
          until blur, which formats the value and applies range limits.
        </p>
      </DocSection>

      <DocSection title="Formatting">
        <ComponentPreview code={formatCode}>
          <div className="flex flex-wrap items-center gap-3">
            <InputNumber
              aria-label="Price"
              defaultValue={1234.5}
              locale="en-US"
              format={{ style: "currency", currency: "USD", useGrouping: true }}
            />
            <InputNumber
              aria-label="Ratio"
              defaultValue={0.25}
              step={0.01}
              locale="en-US"
              format={{ style: "percent", maximumFractionDigits: 0 }}
            />
          </div>
        </ComponentPreview>
        <p className="text-site-body text-muted-foreground">
          Intl.NumberFormat handles display and parsing. onChange and native form submission receive
          the numeric value, including fractions for percentages.
        </p>
      </DocSection>

      <DocSection title="Prefix and Suffix">
        <ComponentPreview code={affixesCode}>
          <div className="flex flex-wrap items-center gap-3">
            <InputNumber aria-label="Budget" prefix="$" defaultValue={100} />
            <InputNumber aria-label="Weight" suffix="kg" defaultValue={5} step={0.5} />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="States">
        <ComponentPreview code={statesCode}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <InputNumber aria-label="Disabled" defaultValue={3} disabled />
            <InputNumber aria-label="Read only" defaultValue={3} readOnly />
            <InputNumber aria-label="Error" defaultValue={3} status="error" />
            <InputNumber aria-label="Warning" defaultValue={3} status="warning" />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Without Controls">
        <ComponentPreview code={controlsCode}>
          <InputNumber aria-label="Without controls" defaultValue={3} controls={false} />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable props={inputNumberProps} />
      </DocSection>
    </DocPage>
  );
}
