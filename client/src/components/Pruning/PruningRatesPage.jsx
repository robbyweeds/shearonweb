// myapp/client/src/components/Pruning/PruningRatesPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../../context/ServiceContext";

// Default pruning rates if none exist yet
const DEFAULT_PRUNING_RATES = {
  HAND: 51,
  SHEARS: 51,
  CLEAN_UP: 55,
  MISC: 51
};

export default function PruningRatesPage() {
  const navigate = useNavigate();
  const { currentRates, updateRates } = useServiceContext();

  // Load saved pruning rates OR fall back to defaults
  const [rates, setRates] = useState(
    currentRates?.pruningRates || DEFAULT_PRUNING_RATES
  );

  // Update a rate on change
  const handleChange = (key, value) => {
    const num = Number(value);
    setRates((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num
    }));
  };

  // Save button
  const handleSave = () => {
    updateRates("pruningRates", rates);
    navigate("/services");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
      <h2>Pruning Rates</h2>
      <p>Edit the labor rates used for all pruning calculations.</p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fafafa",
          marginTop: "1rem"
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>
              Labor Type
            </th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "6px" }}>
              $ / Hour
            </th>
          </tr>
        </thead>

        <tbody>
          {Object.keys(rates).map((key) => (
            <tr key={key}>
              <td style={{ padding: "6px" }}>{key.replace("_", " ")}</td>
              <td style={{ padding: "6px", textAlign: "center" }}>
                <input
                  type="number"
                  value={rates[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ width: "80px", padding: "4px", textAlign: "center" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        style={{
          marginTop: "1.5rem",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Save Rates
      </button>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginLeft: "1rem",
          padding: "10px 20px",
          background: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Back
      </button>
    </div>
  );
}
