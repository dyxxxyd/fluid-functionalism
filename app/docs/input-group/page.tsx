"use client";

import { useState } from "react";
import { useIcon } from "@/lib/icon-context";
import { InputGroup, InputField } from "@/registry/default/input-group";
import { ComponentPreview } from "@/lib/docs/ComponentPreview";
import { PropsTable } from "@/lib/docs/PropsTable";
import { DocPage, DocSection } from "@/lib/docs/DocPage";
import { groupProps, fieldProps } from "@/lib/docs/api/input-group";

const basicCode = `import { InputGroup, InputField } from "./components";
import { Search } from "lucide-react";
import { useState } from "react";

const [value, setValue] = useState("");

<InputGroup>
  <InputField
    index={0}
    label="Search"
    placeholder="Search teamspaces..."
    icon={Search}
    value={value}
    onChange={setValue}
  />
</InputGroup>`;

const multipleCode = `import { InputGroup, InputField } from "./components";
import { Mail, Search } from "lucide-react";

<InputGroup>
  <InputField
    index={0}
    label="Name"
    placeholder="Your name"
    value={name}
    onChange={setName}
  />
  <InputField
    index={1}
    label="Email"
    placeholder="you@example.com"
    icon={Mail}
    value={email}
    onChange={setEmail}
  />
</InputGroup>`;

const errorCode = `<InputGroup>
  <InputField
    index={0}
    label="Email"
    placeholder="you@example.com"
    icon={Mail}
    value={email}
    onChange={setEmail}
    error="Please enter a valid email address."
  />
</InputGroup>`;

const variantsCode = `import { InputGroup, InputField } from "./components";
import { Mail, Search } from "lucide-react";

<InputGroup>
  <InputField index={0} label="Bordered" placeholder="Your name"
    value={name} onChange={setName} />
  <InputField index={1} variant="borderless" label="Borderless"
    placeholder="you@example.com" icon={Mail} value={email} onChange={setEmail} />
  <InputField index={2} variant="filled" label="Filled"
    placeholder="Search teamspaces..." icon={Search} value={search} onChange={setSearch} />
  <InputField index={3} variant="underlined" label="Underlined"
    placeholder="https://example.com" value={website} onChange={setWebsite} />
</InputGroup>`;

export default function InputGroupDoc() {
  const Search = useIcon("search");
  const Mail = useIcon("mail");

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("bad@");
  const [variantName, setVariantName] = useState("");
  const [variantEmail, setVariantEmail] = useState("");
  const [variantSearch, setVariantSearch] = useState("");
  const [variantWebsite, setVariantWebsite] = useState("");

  return (
    <DocPage
      title="InputGroup"
      slug="input-group"
      description="Input field group with fluid hover and validation."
    >
      <DocSection title="Basic">
        <ComponentPreview code={basicCode}>
          <InputGroup>
            <InputField
              index={0}
              label="Search"
              placeholder="Search teamspaces..."
              icon={Search}
              value={search}
              onChange={setSearch}
            />
          </InputGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Variants">
        <ComponentPreview code={variantsCode}>
          <InputGroup>
            <InputField
              index={0}
              label="Bordered"
              placeholder="Your name"
              value={variantName}
              onChange={setVariantName}
            />
            <InputField
              index={1}
              variant="borderless"
              label="Borderless"
              placeholder="you@example.com"
              icon={Mail}
              value={variantEmail}
              onChange={setVariantEmail}
            />
            <InputField
              index={2}
              variant="filled"
              label="Filled"
              placeholder="Search teamspaces..."
              icon={Search}
              value={variantSearch}
              onChange={setVariantSearch}
            />
            <InputField
              index={3}
              variant="underlined"
              label="Underlined"
              placeholder="https://example.com"
              value={variantWebsite}
              onChange={setVariantWebsite}
            />
          </InputGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Multiple Fields">
        <ComponentPreview code={multipleCode}>
          <InputGroup>
            <InputField
              index={0}
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={setName}
            />
            <InputField
              index={1}
              label="Email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={setEmail}
            />
          </InputGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Error State">
        <ComponentPreview code={errorCode}>
          <InputGroup>
            <InputField
              index={0}
              label="Email"
              placeholder="you@example.com"
              icon={Mail}
              value={errorEmail}
              onChange={setErrorEmail}
              error="Please enter a valid email address."
            />
          </InputGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference — InputGroup">
        <PropsTable props={groupProps} />
      </DocSection>

      <DocSection title="API Reference — InputField">
        <PropsTable props={fieldProps} />
      </DocSection>
    </DocPage>
  );
}
