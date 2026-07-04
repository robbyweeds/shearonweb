import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LabeledInput from "../LabeledInput";
import { useServiceContext } from "../../context/ServiceContext";
import { DEFAULT_TURF_APP_RATES, TURF_COLUMNS } from "./turfAppDefaults";
import { mergeTurfAppRates } from "./turfAppCalculations";

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

function numericInput(value, onChange, step = 0.01) {
  return (
    <LabeledInput
      value={value}
      type="number"
      min={0}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  );
}

export default function TurfAppRatesPage() {
  const navigate = useNavigate();
  const { currentRates = {}, updateRates } = useServiceContext();

  const [rates, setRates] = useState(
    mergeTurfAppRates(currentRates.turfAppRates || DEFAULT_TURF_APP_RATES)
  );

  const setDollar = (key, value) => {
    setRates((prev) => ({
      ...prev,
      dollars: { ...prev.dollars, [key]: value },
    }));
  };

  const setAreaType = (name, key, value) => {
    setRates((prev) => ({
      ...prev,
      areaTypes: {
        ...prev.areaTypes,
        [name]: { ...prev.areaTypes[name], [key]: value },
      },
    }));
  };

  const setAcresPerHour = (key, value) => {
    setRates((prev) => ({
      ...prev,
      acresPerHour: { ...prev.acresPerHour, [key]: value },
    }));
  };

  const setHandFactor = (key, value) => {
    setRates((prev) => ({
      ...prev,
      handFactors: { ...prev.handFactors, [key]: value },
    }));
  };

  const setMaterialAmount = (key, yesNo, value) => {
    setRates((prev) => ({
      ...prev,
      materialAmounts: {
        ...prev.materialAmounts,
        [key]: { ...prev.materialAmounts[key], [yesNo]: value },
      },
    }));
  };

  const setFertilizerOption = (index, key, value) => {
    setRates((prev) => ({
      ...prev,
      fertilizerOptions: prev.fertilizerOptions.map((option, i) =>
        i === index ? { ...option, [key]: value } : option
      ),
    }));
  };

  const addFertilizerOption = () => {
    setRates((prev) => ({
      ...prev,
      fertilizerOptions: [
        ...prev.fertilizerOptions,
        { name: "New Fertilizer", product: "", price: 0, bagsPerAcre: 0 },
      ],
    }));
  };

  const deleteFertilizerOption = (index) => {
    setRates((prev) => ({
      ...prev,
      fertilizerOptions: prev.fertilizerOptions.filter((_, i) => i !== index),
    }));
  };

  const setFertMultiple = (equipment, key, value) => {
    setRates((prev) => ({
      ...prev,
      equipmentMultiples: {
        ...prev.equipmentMultiples,
        fertilizer: {
          ...prev.equipmentMultiples.fertilizer,
          [equipment]: {
            ...prev.equipmentMultiples.fertilizer[equipment],
            [key]: value,
          },
        },
      },
    }));
  };

  const setBroadleafMultiple = (equipment, value) => {
    setRates((prev) => ({
      ...prev,
      equipmentMultiples: {
        ...prev.equipmentMultiples,
        broadleaf: {
          ...prev.equipmentMultiples.broadleaf,
          [equipment]: value,
        },
      },
    }));
  };

  const handleSaveRates = () => {
    updateRates("turfAppRates", rates);
    alert("Turf App Rates Updated!");
  };

  const handleResetToDefault = () => {
    setRates(DEFAULT_TURF_APP_RATES);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Edit Turf App Rates</h2>

      <h3>Dollar Rates</h3>
      <table border="1" style={{ ...tableStyle, maxWidth: "620px" }}>
        <thead>
          <tr>
            <th style={thStyle}>Item</th>
            <th style={thStyle}>Unit</th>
            <th style={thStyle}>Rate</th>
          </tr>
        </thead>
        <tbody>
          {TURF_COLUMNS.map((col) => (
            <tr key={col.key}>
              <td style={tdStyle}>{col.label}</td>
              <td style={tdStyle}>{col.unit}</td>
              <td style={tdStyle}>{numericInput(rates.dollars[col.key], (value) => setDollar(col.key, value))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Area Type Equipment Split</h3>
      <table border="1" style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Area Type</th>
            <th style={thStyle}>Truckster %</th>
            <th style={thStyle}>Z Spray %</th>
            <th style={thStyle}>Hand %</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rates.areaTypes).map(([name, values]) => (
            <tr key={name}>
              <td style={tdStyle}>{name}</td>
              <td style={tdStyle}>{numericInput(values.truckster, (value) => setAreaType(name, "truckster", value), 0.01)}</td>
              <td style={tdStyle}>{numericInput(values.zmax, (value) => setAreaType(name, "zmax", value), 0.01)}</td>
              <td style={tdStyle}>{numericInput(values.hand, (value) => setAreaType(name, "hand", value), 0.01)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Equipment Production</h3>
      <table border="1" style={{ ...tableStyle, maxWidth: "520px" }}>
        <tbody>
          <tr>
            <td style={tdStyle}>Truckster acres per hour</td>
            <td style={tdStyle}>{numericInput(rates.acresPerHour.TRUCKSTER, (value) => setAcresPerHour("TRUCKSTER", value), 0.01)}</td>
          </tr>
          <tr>
            <td style={tdStyle}>Z acres per hour</td>
            <td style={tdStyle}>{numericInput(rates.acresPerHour.ZMAX, (value) => setAcresPerHour("ZMAX", value), 0.01)}</td>
          </tr>
        </tbody>
      </table>

      <h3>Hand Factors</h3>
      <table border="1" style={{ ...tableStyle, maxWidth: "620px" }}>
        <thead>
          <tr>
            {Object.keys(rates.handFactors).map((key) => (
              <th key={key} style={thStyle}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.entries(rates.handFactors).map(([key, value]) => (
              <td key={key} style={tdStyle}>{numericInput(value, (next) => setHandFactor(key, next), 0.01)}</td>
            ))}
          </tr>
        </tbody>
      </table>

      <h3>Material Amounts</h3>
      <table border="1" style={{ ...tableStyle, maxWidth: "620px" }}>
        <thead>
          <tr>
            <th style={thStyle}>Material</th>
            <th style={thStyle}>Yes</th>
            <th style={thStyle}>No</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rates.materialAmounts).map(([key, values]) => (
            <tr key={key}>
              <td style={tdStyle}>{key}</td>
              <td style={tdStyle}>{numericInput(values.yes, (value) => setMaterialAmount(key, "yes", value), 0.01)}</td>
              <td style={tdStyle}>{numericInput(values.no, (value) => setMaterialAmount(key, "no", value), 0.01)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Fertilizer</h3>
      <table border="1" style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Dropdown Name</th>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Bags / Acre</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rates.fertilizerOptions.map((option, index) => (
            <tr key={`${option.name}-${index}`}>
              <td style={tdStyle}>
                <input
                  value={option.name}
                  onChange={(e) => setFertilizerOption(index, "name", e.target.value)}
                  style={{ width: "180px", padding: "2px 4px", fontSize: "0.85rem" }}
                />
              </td>
              <td style={tdStyle}>
                <input
                  value={option.product}
                  onChange={(e) => setFertilizerOption(index, "product", e.target.value)}
                  style={{ width: "100px", padding: "2px 4px", fontSize: "0.85rem" }}
                />
              </td>
              <td style={tdStyle}>{numericInput(option.price, (value) => setFertilizerOption(index, "price", value), 0.01)}</td>
              <td style={tdStyle}>{numericInput(option.bagsPerAcre, (value) => setFertilizerOption(index, "bagsPerAcre", value), 0.01)}</td>
              <td style={tdStyle}>
                <button
                  className="danger-button compact-button"
                  onClick={() => deleteFertilizerOption(index)}
                  type="button"
                  disabled={rates.fertilizerOptions.length <= 1}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addFertilizerOption} type="button" style={{ marginBottom: "1rem" }}>
        Add Fertilizer Option
      </button>

      <h3>Equipment Multiples</h3>
      <table border="1" style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Equipment</th>
            <th style={thStyle}>Fert With Other Apps</th>
            <th style={thStyle}>Fert Only</th>
            <th style={thStyle}>Broadleaf Only</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(rates.equipmentMultiples.fertilizer).map((equipment) => (
            <tr key={equipment}>
              <td style={tdStyle}>{equipment}</td>
              <td style={tdStyle}>{numericInput(rates.equipmentMultiples.fertilizer[equipment].normalApps, (value) => setFertMultiple(equipment, "normalApps", value), 0.01)}</td>
              <td style={tdStyle}>{numericInput(rates.equipmentMultiples.fertilizer[equipment].fertOnly, (value) => setFertMultiple(equipment, "fertOnly", value), 0.01)}</td>
              <td style={tdStyle}>{numericInput(rates.equipmentMultiples.broadleaf[equipment], (value) => setBroadleafMultiple(equipment, value), 0.01)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", flexWrap: "wrap" }}>
        <button
          onClick={handleSaveRates}
          style={{
            padding: "10px 24px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Save Rates
        </button>

        <button
          onClick={handleResetToDefault}
          style={{
            padding: "10px 24px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Reset to Default
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 24px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
