import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../../context/ServiceContext";
import { DEFAULT_LEAVES_RATES, LEAVES_KEYS, LEAVES_LABELS } from "./leavesDefaults";
import { mergeLeavesRates } from "./leavesCalculations";

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "1.5rem",
};

const thStyle = {
  padding: "6px",
  textAlign: "left",
  background: "#f3f3f3",
};

const tdStyle = {
  padding: "6px",
};

const inputStyle = {
  width: "90px",
  padding: "2px 4px",
  fontSize: "0.85rem",
};

function numericInput(value, onChange, step = "0.01") {
  return (
    <input
      type="number"
      min="0"
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value) || 0)}
      style={inputStyle}
    />
  );
}

export default function LeavesRatesPage() {
  const navigate = useNavigate();
  const { currentRates = {}, updateRates } = useServiceContext();
  const [rates, setRates] = useState(
    mergeLeavesRates(currentRates.leavesRates || DEFAULT_LEAVES_RATES)
  );

  const setUnitPrice = (key, value) => {
    setRates((prev) => ({
      ...prev,
      unitPrice: { ...prev.unitPrice, [key]: value },
    }));
  };

  const setPropertyType = (name, key, value) => {
    setRates((prev) => ({
      ...prev,
      propertyTypes: {
        ...prev.propertyTypes,
        [name]: { ...prev.propertyTypes[name], [key]: value },
      },
    }));
  };

  const setOccurrenceMultiplier = (key, value) => {
    setRates((prev) => ({
      ...prev,
      occurrenceMultipliers: {
        ...prev.occurrenceMultipliers,
        [key]: value,
      },
    }));
  };

  const handleSaveRates = () => {
    updateRates("leavesRates", rates);
    alert("Fall Cleanup Rates Updated!");
  };

  const handleResetToDefault = () => {
    setRates(DEFAULT_LEAVES_RATES);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "980px", margin: "0 auto" }}>
      <h2>Edit Fall Cleanup Rates</h2>

      <h3>Dollar Rates</h3>
      <table border="1" style={{ ...tableStyle, maxWidth: "520px" }}>
        <thead>
          <tr>
            <th style={thStyle}>Item</th>
            <th style={thStyle}>Rate</th>
          </tr>
        </thead>
        <tbody>
          {LEAVES_KEYS.map((key) => (
            <tr key={key}>
              <td style={tdStyle}>{LEAVES_LABELS[key]}</td>
              <td style={tdStyle}>{numericInput(rates.unitPrice[key], (value) => setUnitPrice(key, value))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Property Type Allocations</h3>
      <table border="1" style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Property Type</th>
            <th style={thStyle}>Hand</th>
            <th style={thStyle}>Blower</th>
            <th style={thStyle}>Leaf Truck</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rates.propertyTypes).map(([name, values]) => (
            <tr key={name}>
              <td style={tdStyle}>{name}</td>
              <td style={tdStyle}>{numericInput(values.HAND, (value) => setPropertyType(name, "HAND", value))}</td>
              <td style={tdStyle}>{numericInput(values.BLOWER, (value) => setPropertyType(name, "BLOWER", value))}</td>
              <td style={tdStyle}>{numericInput(values.LEAF_TRUCK, (value) => setPropertyType(name, "LEAF_TRUCK", value))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Occurrence Multipliers</h3>
      <table border="1" style={{ ...tableStyle, maxWidth: "420px" }}>
        <thead>
          <tr>
            <th style={thStyle}>Occurrences</th>
            <th style={thStyle}>Multiplier</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(rates.occurrenceMultipliers).map((key) => (
            <tr key={key}>
              <td style={tdStyle}>{key}</td>
              <td style={tdStyle}>{numericInput(rates.occurrenceMultipliers[key], (value) => setOccurrenceMultiplier(key, value))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <button className="save-project-button" onClick={handleSaveRates} type="button">
          Save Fall Cleanup Rates
        </button>
        <button className="danger-button" onClick={handleResetToDefault} type="button">
          Reset to Default
        </button>
        <button className="secondary-button" onClick={() => navigate(-1)} type="button">
          Back
        </button>
      </div>
    </div>
  );
}
