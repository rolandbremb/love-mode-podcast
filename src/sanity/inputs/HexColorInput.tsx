import type { ChangeEvent } from "react";
import { set, StringInputProps, unset } from "sanity";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isValidHexColor(value: string) {
  return HEX_COLOR_PATTERN.test(value);
}

function expandHexColor(value: string) {
  if (!/^#[0-9a-fA-F]{3}$/.test(value)) {
    return value;
  }

  return `#${value
    .slice(1)
    .split("")
    .map((character) => `${character}${character}`)
    .join("")}`;
}

export default function HexColorInput(props: StringInputProps) {
  const { value, onChange, elementProps, validationError } = props;
  const textValue = typeof value === "string" ? value : "";
  const pickerValue = isValidHexColor(textValue)
    ? expandHexColor(textValue)
    : "#ffffff";

  function updateValue(nextValue: string) {
    const normalizedValue = nextValue.trim();
    onChange(normalizedValue ? set(normalizedValue) : unset());
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    updateValue(event.currentTarget.value);
  }

  function handlePickerChange(event: ChangeEvent<HTMLInputElement>) {
    updateValue(event.currentTarget.value.toUpperCase());
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <input
          aria-label="Pick color"
          onChange={handlePickerChange}
          style={{
            width: "3rem",
            height: "3rem",
            border: "1px solid #d6d3d1",
            borderRadius: "0.75rem",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
          }}
          type="color"
          value={pickerValue}
        />
        <input
          {...elementProps}
          onChange={handleTextChange}
          placeholder="#FFF8F1"
          spellCheck={false}
          style={{
            flex: 1,
            border: "1px solid #d6d3d1",
            borderRadius: "0.75rem",
            padding: "0.75rem 0.9rem",
          }}
          value={textValue}
        />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "0.75rem",
          lineHeight: 1.5,
          color: validationError ? "#b91c1c" : "#78716c",
        }}
      >
        {validationError || "Pick a color or enter a hex value like #FFF8F1."}
      </p>
    </div>
  );
}
