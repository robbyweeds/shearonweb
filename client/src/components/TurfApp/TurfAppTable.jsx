import React, { useMemo } from "react";
import LabeledInput from "../LabeledInput";
import { useServiceContext } from "../../context/ServiceContext";
import { formatCurrency } from "../../utils/formatters";
import {
  DEFAULT_TURF_APP_RATES,
  INITIAL_TURF_APP_DATA,
  TURF_COLUMNS,
} from "./turfAppDefaults";
import { computeTurfAppTotals, mergeTurfAppRates } from "./turfAppCalculations";

export default function TurfAppTable({ tableId, index, onDelete }) {
  const { currentServices, updateService, currentRates } = useServiceContext();

  const turfList = Array.isArray(currentServices.turfApp)
    ? currentServices.turfApp
    : [];

  const tableEntry =
    turfList.find((t) => t.id === tableId) || { id: tableId, data: {} };

  const data = useMemo(() => {
    const saved = tableEntry.data || {};

    return {
      ...INITIAL_TURF_APP_DATA,
      ...saved,
      name: saved.name || `Turf Application #${index + 1}`,
      qtyUnit: {
        ...INITIAL_TURF_APP_DATA.qtyUnit,
        ...(saved.qtyUnit || {}),
      },
      summary: {
        ...INITIAL_TURF_APP_DATA.summary,
        ...(saved.summary || {}),
      },
    };
  }, [index, tableEntry.data]);

  const rates = mergeTurfAppRates({
    ...DEFAULT_TURF_APP_RATES,
    ...(currentRates?.turfAppRates || {}),
  });

  const totals = computeTurfAppTotals(data, rates);

  const save = (updatedData) => {
    const updatedTotals = computeTurfAppTotals(updatedData, rates);
    const updated = { ...updatedData, totals: updatedTotals };

    const nextList = turfList.some((t) => t.id === tableId)
      ? turfList.map((t) => (t.id === tableId ? { id: tableId, data: updated } : t))
      : [...turfList, { id: tableId, data: updated }];

    updateService("turfApp", nextList);
  };

  const handleTextChange = (field) => (e) => {
    save({ ...data, [field]: e.target.value });
  };

  const handleFieldChange = (field) => (e) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;

    save({ ...data, [field]: value });
  };

  const handleCheckboxChange = (field) => (e) => {
    save({ ...data, [field]: e.target.checked });
  };

  const handleManualQtyChange = (key) => (e) => {
    const value = parseFloat(e.target.value) || 0;

    save({
      ...data,
      qtyUnit: { ...data.qtyUnit, [key]: value },
    });
  };

  const handleOccurrencesChange = (e) => {
    const value = parseFloat(e.target.value) || 0;

    save({
      ...data,
      summary: { ...data.summary, numOccurrences: value },
    });
  };

  const cellStyle = {
    padding: "4px",
    fontSize: "12px",
    textAlign: "center",
    whiteSpace: "nowrap",
  };

  const inputCellStyle = {
    ...cellStyle,
    background: "#b3d9ff",
  };

  const computedCellStyle = {
    ...cellStyle,
    background: "#f6f6f6",
  };

  const summaryLabelStyle = {
    ...cellStyle,
    fontWeight: "bold",
    textAlign: "right",
    background: "#f3f3f3",
  };

  const summaryValueStyle = {
    ...cellStyle,
    background: "#eef",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        marginBottom: "2rem",
        border: "1px solid #ccc",
        padding: "1rem",
        overflowX: "auto",
      }}
    >
      <div style={{ marginBottom: "12px", maxWidth: "520px" }}>
        <label style={{ fontWeight: "bold" }}>Turf Application Name</label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="text"
            value={data.name}
            onChange={handleTextChange("name")}
            style={{ width: "100%", padding: "6px" }}
          />
          {onDelete && (
            <button className="danger-button compact-button" onClick={onDelete} type="button">
              Delete
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "100px 190px 160px",
          gap: "10px",
          alignItems: "end",
          minWidth: "480px",
          marginBottom: "12px",
        }}
      >
        <label>
          <strong>Acres:</strong>
          <input
            type="number"
            value={data.acres}
            onChange={handleFieldChange("acres")}
            step="0.01"
            min="0"
            style={{ width: "100%", padding: "6px" }}
          />
        </label>

        <label>
          <strong>Property Type:</strong>
          <select
            value={data.propertyType}
            onChange={handleFieldChange("propertyType")}
            style={{ width: "100%", padding: "6px" }}
          >
            {Object.keys(rates.areaTypes).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          <strong>Hand:</strong>
          <select
            value={data.hand}
            onChange={handleFieldChange("hand")}
            style={{ width: "100%", padding: "6px" }}
          >
            {Object.keys(rates.handFactors).map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <table
        border="1"
        style={{
          minWidth: "1350px",
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead>
          <tr>
            <th style={cellStyle}>ITEM</th>
            {TURF_COLUMNS.map((col) => (
              <th key={col.key} style={cellStyle}>{col.label}</th>
            ))}
            <th style={summaryLabelStyle}>HRS/OCC</th>
            <th style={summaryValueStyle}>{totals.hoursPerOcc.toFixed(1)}</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td style={cellStyle}>PRODUCTS</td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}>
              <label style={{ justifyItems: "center", gap: "2px" }}>
                <input
                  type="checkbox"
                  checked={data.addPreM}
                  onChange={handleCheckboxChange("addPreM")}
                  style={{ width: "auto" }}
                />
                Add PreM?
              </label>
            </td>
            <td style={cellStyle}>
              <label style={{ justifyItems: "center", gap: "2px" }}>
                <input
                  type="checkbox"
                  checked={data.addBroadleaf}
                  onChange={handleCheckboxChange("addBroadleaf")}
                  style={{ width: "auto" }}
                />
                Add Broadleaf?
              </label>
            </td>
            <td style={cellStyle}>
              <label style={{ justifyItems: "center", gap: "2px" }}>
                <input
                  type="checkbox"
                  checked={data.addGrub}
                  onChange={handleCheckboxChange("addGrub")}
                  style={{ width: "auto" }}
                />
                Add Grub?
              </label>
            </td>
            <td style={cellStyle}>
              <label style={{ justifyItems: "center", gap: "2px" }}>
                <span>
                  <input
                    type="checkbox"
                    checked={data.addGranularFert}
                    onChange={handleCheckboxChange("addGranularFert")}
                    style={{ width: "auto", marginRight: "4px" }}
                  />
                  Add Granular Fert?
                </span>
                {data.addGranularFert && (
                  <select
                    value={data.fertilizerOption}
                    onChange={handleFieldChange("fertilizerOption")}
                    style={{ width: "100%", padding: "4px", fontSize: "11px" }}
                  >
                    {rates.fertilizerOptions.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            </td>
            <td style={cellStyle}></td>
            <td style={summaryLabelStyle}></td>
            <td style={summaryValueStyle}></td>
          </tr>

          <tr>
            <td style={cellStyle}>QTY/UNIT</td>
            {TURF_COLUMNS.map((col) => (
              <td key={col.key} style={col.manual ? inputCellStyle : computedCellStyle}>
                {col.manual ? (
                  <LabeledInput
                    value={data.qtyUnit[col.key] || 0}
                    type="number"
                    min={0}
                    step={0.1}
                    onChange={handleManualQtyChange(col.key)}
                  />
                ) : (
                  <strong>{Number(totals.qtyUnit[col.key] || 0).toFixed(col.key === "TRIMEC" ? 2 : 1)}</strong>
                )}
                <div style={{ fontSize: "0.7rem", color: "#444" }}>{col.unit}</div>
              </td>
            ))}
            <td style={summaryLabelStyle}>$/OCC</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.totalOcc)}</td>
          </tr>

          <tr>
            <td style={cellStyle}>UNIT $</td>
            {TURF_COLUMNS.map((col) => (
              <td key={col.key} style={cellStyle}>{formatCurrency(totals.dollars[col.key])}</td>
            ))}
            <td style={summaryLabelStyle}># OCC</td>
            <td style={{ ...summaryValueStyle, background: "yellow" }}>
              <LabeledInput
                value={data.summary.numOccurrences}
                type="number"
                min={0}
                step={1}
                onChange={handleOccurrencesChange}
              />
            </td>
          </tr>

          <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
            <td style={cellStyle}>TOTAL</td>
            {TURF_COLUMNS.map((col) => (
              <td key={col.key} style={cellStyle}>{formatCurrency(totals.rowTotals[col.key])}</td>
            ))}
            <td style={summaryLabelStyle}>TOTAL $</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.final)}</td>
          </tr>

          <tr>
            <td colSpan={8} style={{ border: "none" }}></td>
            <td style={summaryLabelStyle}>TOTAL MAT:</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.totalMat)}</td>
            <td style={summaryLabelStyle}>TOT HRS</td>
            <td style={summaryValueStyle}>{totals.totalHoursAllOcc.toFixed(1)}</td>
          </tr>

          <tr>
            <td colSpan={10} style={{ border: "none" }}></td>
            <td style={summaryLabelStyle}>Price/Acre</td>
            <td style={summaryValueStyle}>
              {data.acres > 0 ? formatCurrency(totals.pricePerAcre) : "#DIV/0!"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
