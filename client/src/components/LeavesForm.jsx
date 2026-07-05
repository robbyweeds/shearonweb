import React from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";
import { formatCurrency } from "../utils/formatters";
import { computeLeavesTotals, mergeLeavesData, mergeLeavesRates } from "./Leaves/leavesCalculations";
import { DEFAULT_LEAVES_RATES, LEAVES_KEYS, LEAVES_LABELS } from "./Leaves/leavesDefaults";

export default function LeavesForm() {
  const { currentServices, updateService, currentRates } = useServiceContext();
  const navigate = useNavigate();
  const rates = mergeLeavesRates(currentRates?.leavesRates || DEFAULT_LEAVES_RATES);
  const data = mergeLeavesData(currentServices.leaves || {});
  const totals = computeLeavesTotals(data, rates);

  const save = (nextData) => {
    updateService("leaves", {
      ...nextData,
      totals: computeLeavesTotals(nextData, rates),
    });
  };

  const updateField = (field, value) => save({ ...data, [field]: value });
  const updateQty = (key, value) =>
    save({
      ...data,
      qtyUnit: { ...data.qtyUnit, [key]: Number(value) || 0 },
    });
  const updatePrice = (key, value) =>
    save({
      ...data,
      unitPrice: { ...data.unitPrice, [key]: Number(value) || 0 },
    });

  const handleSave = () => navigate("/services");
  const handleReset = () => updateService("leaves", null);

  return (
    <div className="service-entry-page" style={{ maxWidth: "1040px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Fall Cleanup</h2>

      <div style={{ marginBottom: "0.75rem", border: "1px solid #ccc", padding: "0.75rem", borderRadius: "4px", background: "#fafafa", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "360px 140px 320px", gap: "12px", alignItems: "end", width: "100%", marginBottom: "10px" }}>
          <label>
            <strong>Fall Cleanup Name</strong>
            <input
              value={data.name}
              onChange={(e) => updateField("name", e.target.value)}
              style={{ width: "100%", padding: "5px" }}
            />
          </label>
          <label>
            <strong>Acres</strong>
            <input
              type="number"
              min="0"
              step="0.01"
              value={data.acres}
              onChange={(e) => updateField("acres", Number(e.target.value) || 0)}
              style={{ width: "100%", padding: "5px" }}
            />
          </label>
          <label>
            <strong>Property Type</strong>
            <select
              value={data.propertyType}
              onChange={(e) => updateField("propertyType", e.target.value)}
              style={{ width: "100%", padding: "5px" }}
            >
              {Object.keys(rates.propertyTypes).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", textAlign: "center" }} border="1">
          <thead>
            <tr>
              <th style={cellStyle}>ITEM</th>
              {LEAVES_KEYS.map((key) => (
                <th key={key} colSpan={2} style={cellStyle}>{LEAVES_LABELS[key]}</th>
              ))}
              <th style={summaryLabelStyle}>HRS/OCC</th>
              <th style={summaryValueStyle}>{totals.hoursPerOcc.toFixed(1)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}>QTY/UNIT</td>
              {LEAVES_KEYS.map((key) => (
                <React.Fragment key={key}>
                  <td style={key === "MISC" ? inputCellStyle : cellStyle}>
                    {key === "MISC" ? (
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={data.qtyUnit.MISC}
                        onChange={(e) => updateQty("MISC", e.target.value)}
                        style={smallInput}
                      />
                    ) : (
                      <strong>{totals.qtyUnit[key].toFixed(1)}</strong>
                    )}
                  </td>
                  <td style={cellStyle}>HRS</td>
                </React.Fragment>
              ))}
              <td style={summaryLabelStyle}>$/OCC</td>
              <td style={summaryValueStyle}>{formatCurrency(totals.dollarsPerOcc)}</td>
            </tr>

            <tr>
              <td style={cellStyle}>UNIT $</td>
              {LEAVES_KEYS.map((key) => (
                <React.Fragment key={key}>
                  <td style={inputCellStyle}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.unitPrice[key]}
                      onChange={(e) => updatePrice(key, e.target.value)}
                      style={smallInput}
                    />
                  </td>
                  <td style={cellStyle}></td>
                </React.Fragment>
              ))}
              <td style={summaryLabelStyle}># OCC</td>
              <td style={inputCellStyle}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={data.occurrences}
                  onFocus={() => {
                    if (Number(data.occurrences || 0) === 0) updateField("occurrences", "");
                  }}
                  onChange={(e) =>
                    updateField(
                      "occurrences",
                      e.target.value === "" ? "" : Number(e.target.value) || 0
                    )
                  }
                  style={smallInput}
                />
              </td>
            </tr>

            <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
              <td style={cellStyle}>TOTAL</td>
              {LEAVES_KEYS.map((key) => (
                <React.Fragment key={key}>
                  <td style={cellStyle}>{formatCurrency(totals.rowTotals[key])}</td>
                  <td style={cellStyle}></td>
                </React.Fragment>
              ))}
              <td style={summaryLabelStyle}>TOTAL $</td>
              <td style={summaryValueStyle}>{formatCurrency(totals.final)}</td>
            </tr>

            <tr>
              <td colSpan={9} style={{ border: "none" }}></td>
              <td style={summaryLabelStyle}>TOT HRS</td>
              <td style={summaryValueStyle}>{totals.totalHours.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="service-actions-stack">
        <button className="secondary-button" onClick={() => navigate("/leaves-rates")} type="button">
          Edit Leaves Rates
        </button>

        <div className="service-page-actions pruning-page-actions">
          <button className="save-project-button" onClick={handleSave} type="button">
            Save Leaves
          </button>
          <button className="danger-button" onClick={handleReset} type="button">
            Reset
          </button>
          <button className="secondary-button" onClick={() => navigate(-1)} type="button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

const cellStyle = {
  padding: "4px",
  fontSize: "12px",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const inputCellStyle = {
  ...cellStyle,
  background: "#fff59d",
};

const summaryLabelStyle = {
  ...cellStyle,
  fontWeight: "bold",
  textAlign: "right",
  background: "#f3f3f3",
};

const summaryValueStyle = {
  ...cellStyle,
  fontWeight: "bold",
  background: "#eef",
};

const smallInput = {
  width: "72px",
  padding: "2px",
  fontSize: "12px",
  textAlign: "center",
};
