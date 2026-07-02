// LabeledInput.jsx
import React from "react";

export default function LabeledInput({ value, onChange, type = "number", step, min, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        step={step}
        min={min}
        style={{ width: "60px", textAlign: "right", padding: "2px 4px" }}
      />
      <span>{label}</span>
    </div>
  );
}
