import React, { useState, useEffect } from "react";
import { useServiceContext } from "../../context/ServiceContext";
import { DEFAULT_MULCHING_RATES } from "./mulchingDefaults";

export default function MulchingRatesPage() {
  const { currentRates, updateService } = useServiceContext();

  const savedMulchingRates =
    currentRates?.mulchingRates || DEFAULT_MULCHING_RATES;

  const [localRates, setLocalRates] = useState(savedMulchingRates);

  // When saved rates change (e.g., reload), reset local state
  useEffect(() => {
    setLocalRates(savedMulchingRates);
  }, [savedMulchingRates]);

  const handleRateChange = (category, key, value) => {
    const num = value === "" ? "" : Number(value);
    setLocalRates((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: num,
      },
    }));
  };

  const handlePriceFieldChange = (field, value) => {
    const num = value === "" ? "" : Number(value);
    setLocalRates((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  const handleSave = () => {
    updateService("rates", {
      ...currentRates,
      mulchingRates: localRates,
    });
  };

  const handleCancel = () => {
    setLocalRates(savedMulchingRates);
  };

  const handleReset = () => {
    setLocalRates(DEFAULT_MULCHING_RATES);
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0.75rem",
    fontSize: "0.9rem",
  };

  const thStyle = {
    borderBottom: "1px solid #ccc",
    padding: "4px",
    textAlign: "left",
    background: "#f5f5f5",
  };

  const tdStyle = {
    borderBottom: "1px solid #eee",
    padding: "4px",
  };

  const inputStyle = {
    width: "80px",
    padding: "2px 4px",
    fontSize: "0.85rem",
  };

  const renderRateTable = (label, category, valueLabel) => {
    const entries = Object.keys(localRates[category] || {});

    return (
      <>
        <h3 style={{ marginTop: "1rem" }}>{label}</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((key) => (
              <tr key={key}>
                <td style={tdStyle}>{key}</td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    step="0.01"
                    value={localRates[category][key]}
                    onChange={(e) =>
                      handleRateChange(category, key, e.target.value)
                    }
                    style={inputStyle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "6px",
        maxWidth: "900px",
        background: "#fff",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Mulching Rates</h2>

      {renderRateTable("Hand Labor Production (Yards per Man-Hour)", "handEfficiency", "Yards / Man-Hour")}
      {renderRateTable("Sm Pwr Production (Yards per Man-Hour)", "smPowerManHours", "Yards / Man-Hour")}
      {renderRateTable("Loader Production (Yards per Man-Hour)", "loaderManHours", "Yards / Man-Hour")}

      <h3 style={{ marginTop: "1rem" }}>Pricing</h3>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={tdStyle}>Hand Labor Rate ($/hr)</td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={localRates.handLaborRatePerHour ?? ""}
                onChange={(e) =>
                  handlePriceFieldChange("handLaborRatePerHour", e.target.value)
                }
                style={inputStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Sm Pwr Rate ($/hr)</td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={localRates.smPwrRatePerHour ?? ""}
                onChange={(e) =>
                  handlePriceFieldChange("smPwrRatePerHour", e.target.value)
                }
                style={inputStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Loader Rate ($/hr)</td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={localRates.loaderRatePerHour ?? ""}
                onChange={(e) =>
                  handlePriceFieldChange("loaderRatePerHour", e.target.value)
                }
                style={inputStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>Mulch Price per Yard ($/yard)</td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={localRates.mulchPricePerYard ?? ""}
                onChange={(e) =>
                  handlePriceFieldChange("mulchPricePerYard", e.target.value)
                }
                style={inputStyle}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "0.4rem 0.75rem",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          style={{
            padding: "0.4rem 0.75rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "0.4rem 0.75rem",
            background: "#e57373",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}
