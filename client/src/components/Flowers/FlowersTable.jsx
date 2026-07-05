import React, { useState } from "react";
import { useServiceContext } from "../../context/ServiceContext";
import { formatCurrency } from "../../utils/formatters";
import { computeFlowersTotals, mergeFlowersTable } from "./flowersCalculations";
import { FLOWER_KEYS, FLOWER_LABELS } from "./flowersDefaults";

export default function FlowersTable({ tableId, onDelete }) {
  const { currentServices, updateService } = useServiceContext();
  const list = Array.isArray(currentServices.flowers) ? currentServices.flowers : [];
  const saved = list.find((table) => table.id === tableId)?.data || {};

  const [localData, setLocalData] = useState(() => mergeFlowersTable(saved));
  const totals = computeFlowersTotals(localData);

  const save = (nextData) => {
    const nextTotals = computeFlowersTotals(nextData);
    const savedData = {
      ...nextData,
      summary: {
        qtyPerOcc: nextTotals.qtyPerOcc,
        dollarsPerOcc: nextTotals.dollarsPerOcc,
        totalDollars: nextTotals.totalDollars,
      },
    };

    setLocalData(savedData);
    updateService(
      "flowers",
      list.map((table) =>
        table.id === tableId ? { ...table, data: savedData } : table
      )
    );
  };

  const updateQty = (key, value) =>
    save({
      ...localData,
      qty: { ...localData.qty, [key]: Number(value) || 0 },
    });

  const updatePrice = (key, value) =>
    save({
      ...localData,
      unitPrice: { ...localData.unitPrice, [key]: Number(value) || 0 },
    });

  const updateCustomLabel = (key, value) =>
    save({
      ...localData,
      customLabels: { ...localData.customLabels, [key]: value },
    });

  const labelFor = (key) => localData.customLabels[key] || FLOWER_LABELS[key];

  const unitFor = (key) => (["POTS", "KALE", "MUMS", "FLATS"].includes(key) ? "Unit" : "HRS");

  return (
    <div style={{ fontSize: "0.75rem", maxWidth: "100%" }}>
      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginBottom: "4px" }}>
        <input
          value={localData.name}
          placeholder="Flowers Table Name"
          onChange={(e) => save({ ...localData, name: e.target.value })}
          style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }}
        />
        {onDelete && (
          <button className="danger-button compact-button" onClick={onDelete} type="button">
            Delete
          </button>
        )}
      </div>

      <div style={tableScroller}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {FLOWER_KEYS.map((key) => (
              <th key={key} style={th}>
                {["POTS", "KALE", "MUMS", "FLATS"].includes(key) ? (
                  <input
                    value={labelFor(key)}
                    onChange={(e) => updateCustomLabel(key, e.target.value)}
                    style={headerInput}
                    aria-label={`${FLOWER_LABELS[key]} name`}
                  />
                ) : (
                  FLOWER_LABELS[key]
                )}
              </th>
            ))}
            <th style={summaryLabelStyle}>HR/OCC</th>
            <th style={summaryValueStyle}>{totals.qtyPerOcc.toFixed(2)}</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            {FLOWER_KEYS.map((key) => (
              <td key={key} style={td}>
                <input
                  type="number"
                  value={localData.qty[key]}
                  onChange={(e) => updateQty(key, e.target.value)}
                  style={input}
                />
                <div style={unitLabel}>{unitFor(key)}</div>
                <div style={priceBox}>
                  <input
                    type="number"
                    value={localData.unitPrice[key]}
                    onChange={(e) => updatePrice(key, e.target.value)}
                    style={priceInput}
                  />
                </div>
              </td>
            ))}
            <td style={summaryLabelStyle}>$/Occ</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.dollarsPerOcc)}</td>
          </tr>

          <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
            {FLOWER_KEYS.map((key) => (
              <td key={key} style={td}>{formatCurrency(totals.rowTotals[key])}</td>
            ))}
            <td style={summaryLabelStyle}># Occ</td>
            <td style={inputCellStyle}>
              <input
                type="number"
                value={localData.occurrences}
                onChange={(e) =>
                  save({ ...localData, occurrences: Number(e.target.value) || 0 })
                }
                style={input}
              />
            </td>
          </tr>

          <tr>
            <td colSpan={FLOWER_KEYS.length} style={{ border: "none" }}></td>
            <td style={summaryLabelStyle}>Total $</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.totalDollars)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}

const tableScroller = {
  maxWidth: "100%",
  overflowX: "auto",
};

const tableStyle = {
  background: "#fff",
  borderCollapse: "collapse",
  minWidth: "760px",
  tableLayout: "fixed",
  width: "100%",
};

const th = {
  padding: "2px",
  borderBottom: "1px solid #ccc",
  fontSize: "0.7rem",
  textAlign: "center",
};

const td = {
  padding: "2px",
  textAlign: "center",
  verticalAlign: "top",
};

const summaryLabelStyle = {
  ...td,
  background: "#f3f3f3",
  fontWeight: 700,
  verticalAlign: "middle",
};

const summaryValueStyle = {
  ...td,
  background: "#eef",
  fontWeight: 700,
  verticalAlign: "middle",
};

const inputCellStyle = {
  ...td,
  background: "#fff59d",
  verticalAlign: "middle",
};

const input = {
  width: "52px",
  padding: "2px",
  fontSize: "0.7rem",
  textAlign: "center",
};

const headerInput = {
  width: "70px",
  padding: "2px",
  fontSize: "0.65rem",
  textAlign: "center",
};

const priceBox = {
  marginTop: "2px",
};

const unitLabel = {
  color: "#555",
  fontSize: "0.58rem",
  fontWeight: 700,
  lineHeight: 1.1,
  marginTop: "1px",
};

const priceInput = {
  width: "52px",
  padding: "2px",
  fontSize: "0.65rem",
  textAlign: "center",
  color: "#444",
  background: "#f5f5f5",
  border: "1px solid #ccc",
};
