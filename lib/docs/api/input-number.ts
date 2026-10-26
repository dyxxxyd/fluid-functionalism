import type { ApiTable, PropDef } from "@/lib/docs/api/types";

export const inputNumberProps: PropDef[] = [
  {
    name: "value",
    type: "number | null",
    description: "Controlled numeric value. null displays an empty field.",
  },
  { name: "defaultValue", type: "number", description: "Initial value for an uncontrolled field." },
  {
    name: "onChange",
    type: "(value: number | null) => void",
    description: "Called with a number when the value changes, or null when cleared.",
  },
  {
    name: "min",
    type: "number",
    default: "Number.MIN_SAFE_INTEGER",
    description: "Lower bound for numeric changes.",
  },
  {
    name: "max",
    type: "number",
    default: "Number.MAX_SAFE_INTEGER",
    description: "Upper bound for numeric changes.",
  },
  {
    name: "step",
    type: "number",
    default: "1",
    description:
      "Positive amount added or subtracted by the buttons and arrow keys. Shift takes ten steps.",
  },
  {
    name: "precision",
    type: "number",
    description:
      "Fixed decimal places from 0 to 20. Overrides fraction digits in format; editing text is normalized on blur.",
  },
  {
    name: "format",
    type: "Intl.NumberFormatOptions",
    default: "{ useGrouping: false, maximumFractionDigits: 20 }",
    description: "Locale-aware number, currency, percent, or unit formatting and parsing.",
  },
  {
    name: "locale",
    type: "Intl.LocalesArgument",
    default: "Runtime locale",
    description: "Locale used to format and parse the displayed value.",
  },
  {
    name: "controls",
    type: "boolean",
    default: "true",
    description:
      "Show the increment and decrement buttons. Keyboard stepping remains available when hidden.",
  },
  {
    name: "changeOnWheel",
    type: "boolean",
    default: "false",
    description: "Enable wheel stepping while hovering the focused input.",
  },
  {
    name: "variant",
    type: '"bordered" | "borderless" | "filled" | "underlined"',
    default: '"bordered"',
    description: "Field appearance, matching InputGroup.",
  },
  {
    name: "size",
    type: '"default" | "compact"',
    default: "SizeProvider",
    description: "Pin the control to the 36px or 28px size step.",
  },
  {
    name: "status",
    type: '"error" | "warning"',
    description: "Validation appearance. Error also sets aria-invalid on the editable input.",
  },
  { name: "prefix", type: "ReactNode", description: "Leading content inside the field." },
  {
    name: "suffix",
    type: "ReactNode",
    description: "Trailing content before the stepper buttons.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disable editing and stepping.",
  },
  {
    name: "readOnly",
    type: "boolean",
    default: "false",
    description: "Prevent value changes while allowing focus and text selection.",
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: "Require a value for native form validation.",
  },
  {
    name: "name / form",
    type: "string",
    description: "Native form submission uses the unformatted numeric value.",
  },
  {
    name: "className / style",
    type: "string / CSSProperties",
    description: "Additional classes or inline styles on the outer field.",
  },
  {
    name: "ref",
    type: "Ref<HTMLInputElement>",
    description: "Access the editable input for focus, blur, or selection.",
  },
  {
    name: "Native input attributes",
    type: "InputHTMLAttributes<HTMLInputElement>",
    description:
      "id, placeholder, autoFocus, aria labels, and input event handlers are forwarded to the editable input.",
  },
];

export const apiReference: ApiTable[] = [{ title: "InputNumber", props: inputNumberProps }];
