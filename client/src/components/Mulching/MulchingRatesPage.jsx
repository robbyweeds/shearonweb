import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../../context/ServiceContext";
import { DEFAULT_MULCHING_RATES } from "./mulchingDefaults";
import { mergeMulchingRates } from "./mulchingCalculations";

export default function MulchingRatesPage() {
  const navigate = useNavigate();
  const { currentRates, updateRates } = useServiceContext();

  const savedMulchingRates = useMemo(
    () => mergeMulchingRates(currentRates?.mulchingRates || DEFAULT_MULCHING_RATES),
    [currentRates?.mulchingRates]
  );

  const [localRates, setLocalRates] = useState(savedMulchingRates);

  useEffect(() => {
    setLocalRates(savedMulchingRates);
  }, [savedMulchingRates]);

  const setCategoryRate = (category, key, value) => {
    setLocalRates((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value === "" ? "" : Number(value),
      },
    }));
  };

  const handleSave = () => {
    updateRates("mulchingRates", localRates);
    alert("Mulching Rates Updated!");
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
    width: "90px",
    padding: "2px 4px",
    fontSize: "0.85rem",
  };

  const input = (category, key, step = "0.01") => (
    <input
      type="number"
      step={step}
      value={localRates[category]?.[key] ?? ""}
      onChange={(e) => setCategoryRate(category, key, e.target.value)}
      style={inputStyle}
    />
  );

  const renderSingleRowTable = (title, category, valueLabel, step = "0.01") => {
    const entries = Object.keys(localRates[category] || {});

    return (
      <>
        <h3 style={{ marginTop: "1rem" }}>{title}</h3>
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
                <td style={tdStyle}>{input(category, key, step)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div style={{ marginTop: "0.5rem", padding: "1rem", border: "1px solid #ccc", maxWidth: "1000px", background: "#fff" }}>
      <h2 style={{ marginTop: 0 }}>Mulching Rates</h2>

      {renderSingleRowTable("Dollar Rates", "dollars", "Rate", "0.01")}
      {renderSingleRowTable("Hand Application Efficiency - Yards per Man Hour", "handEfficiency", "Yards / Man Hour", "0.01")}
      {renderSingleRowTable("Tree Ring Size", "treeRingSize", "Diameter", "0.01")}
      {renderSingleRowTable("Tree Efficiency", "treeEfficiency", "Yards / Man Hour", "0.01")}
      {renderSingleRowTable("Mulch Depth", "depthInches", "Inches", "0.01")}
      {renderSingleRowTable("Depth of Mulch Around Trees", "treeDepth", "Inches", "0.01")}
      {renderSingleRowTable("Sm Pwr", "smPowerManHours", "Manhours per Sm Pwr hr", "0.01")}
      {renderSingleRowTable("Loader", "loaderManHours", "Manhours per Loader hr", "0.01")}
      {renderSingleRowTable("Proximity to Pile", "proximity", "Multiplier", "0.01")}
      {renderSingleRowTable("Finn Yards per Hour", "finnEfficiency", "Yards / Hour", "0.01")}
      {renderSingleRowTable("Finn Depth", "finnDepth", "Inches", "0.01")}
      {renderSingleRowTable("Finn Helper", "finnHelper", "Helper hrs per Finn hr", "0.01")}

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className="save-project-button" onClick={handleSave}>
          Save Mulching Rates
        </button>
        <button onClick={() => setLocalRates(savedMulchingRates)} style={{ padding: "0.4rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handleReset} style={{ padding: "0.4rem 0.75rem", background: "#e57373", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Reset to Default
        </button>
        <button onClick={() => navigate(-1)} style={{ padding: "0.4rem 0.75rem", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}>
          Back
        </button>
      </div>
    </div>
  );
}
