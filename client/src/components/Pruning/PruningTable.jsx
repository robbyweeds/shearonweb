// myapp/client/src/components/Pruning/PruningTable.jsx
import React, { useEffect, useState } from "react";
import { useServiceContext } from "../../context/ServiceContext";
import { computePruningTotals } from "./pruningCalculations";
import { INITIAL_PRUNING_TABLE } from "./pruningDefaults";
import { formatCurrency } from "../../utils/formatters";

export default function PruningTable({ tableId, onDelete }) {
  const { currentServices, updateService, currentRates } = useServiceContext();

  // Always an array
  const list = Array.isArray(currentServices.pruning)
    ? currentServices.pruning
    : [];

  // Find matching table
  const saved =
    list.find((t) => t.id === tableId)?.data || INITIAL_PRUNING_TABLE;

  // Local data
  const [localData, setLocalData] = useState({
    name: saved.name || "",
    occurrences: saved.occurrences || 0,

    qty: {
      MISC: saved.qty?.MISC || 0,
      HAND: saved.qty?.HAND || 0,
      SHEARS: saved.qty?.SHEARS || 0,
      CLEANUP: saved.qty?.CLEANUP || 0,
      CHAINSAW: saved.qty?.CHAINSAW || 0,
    },

    unitPrice: {
      MISC: saved.unitPrice?.MISC || 51,
      HAND: saved.unitPrice?.HAND || 51,
      SHEARS: saved.unitPrice?.SHEARS || 55,
      CLEANUP: saved.unitPrice?.CLEANUP || 51,
      CHAINSAW: saved.unitPrice?.CHAINSAW || 62,
    },

    summary: {
      hoursPerOcc: 0,
      dollarsPerOcc: 0,
      totalHours: 0,
      totalDollars: 0,
    },
  });

  const appliedRates = currentRates?.pruningRates || localData.unitPrice;
  const totals = computePruningTotals(
    {
      qty: localData.qty,
      unitPrice: appliedRates,
      occurrences: localData.occurrences,
    },
    appliedRates
  );

  // ------------- RECALCULATE -------------
  useEffect(() => {
    const totals = computePruningTotals(
      {
        qty: localData.qty,
        unitPrice: appliedRates,
        occurrences: localData.occurrences,
      },
      appliedRates
    );

    setLocalData((prev) => ({
      ...prev,
      summary: {
        hoursPerOcc: totals.hoursPerOcc,
        dollarsPerOcc: totals.dollarsPerOcc,
        totalHours: totals.hoursPerOcc * localData.occurrences,
        totalDollars: totals.finalTotal,
      },
    }));
  }, [localData.qty, localData.occurrences, appliedRates]);

  // ------------- SAVE BACK TO CONTEXT -------------
  useEffect(() => {
    const updated = list.map((t) =>
      t.id === tableId ? { ...t, data: localData } : t
    );

    updateService("pruning", updated); // MUST SET ENTIRE ARRAY
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localData]);

  const updateQty = (key, value) =>
    setLocalData((prev) => ({
      ...prev,
      qty: { ...prev.qty, [key]: Number(value) },
    }));

  const updatePrice = (key, value) =>
    setLocalData((prev) => ({
      ...prev,
      unitPrice: { ...prev.unitPrice, [key]: Number(value) },
    }));

  return (
    <div style={{ fontSize: "0.75rem", maxWidth: "660px" }}>
      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginBottom: "4px" }}>
        <input
          value={localData.name}
          placeholder="Pruning Type ( Summer / Fall / Tree )"
          onChange={(e) =>
            setLocalData((p) => ({ ...p, name: e.target.value }))
          }
          style={{
            width: "100%",
            padding: "4px",
            fontSize: "0.75rem",
          }}
        />
        {onDelete && (
          <button className="danger-button compact-button" onClick={onDelete} type="button">
            Delete
          </button>
        )}
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          tableLayout: "fixed", // SHRINK WIDTH
        }}
      >
        <thead>
          <tr>
            <th style={th}>Misc</th>
            <th style={th}>Hand</th>
            <th style={th}>Shears</th>
            <th style={th}>Cleanup</th>
            <th style={th}>Chainsaw</th>
            <th style={summaryLabelStyle}>HR/OCC</th>
            <th style={summaryValueStyle}>{totals.hoursPerOcc.toFixed(2)}</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            {["MISC", "HAND", "SHEARS", "CLEANUP", "CHAINSAW"].map((k) => (
              <td key={k} style={td}>
                <input
                  type="number"
                  value={localData.qty[k]}
                  onChange={(e) => updateQty(k, e.target.value)}
                  style={input}
                />
                <div style={unitLabel}>HRS</div>
                <div style={priceBox}>
                  <input
                    type="number"
                    value={localData.unitPrice[k]}
                    onChange={(e) => updatePrice(k, e.target.value)}
                    style={priceInput}
                  />
                </div>
              </td>
            ))}
            <td style={summaryLabelStyle}>$/Occ</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.dollarsPerOcc)}</td>
          </tr>

          <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
            {["MISC", "HAND", "SHEARS", "CLEANUP", "CHAINSAW"].map((k) => (
              <td key={k} style={td}>{formatCurrency(totals.rowTotals[k])}</td>
            ))}
            <td style={summaryLabelStyle}># Occ</td>
            <td style={inputCellStyle}>
              <input
                type="number"
                value={localData.occurrences}
                onChange={(e) =>
                  setLocalData((p) => ({
                    ...p,
                    occurrences: Number(e.target.value),
                  }))
                }
                style={input}
              />
            </td>
          </tr>

          <tr>
            <td colSpan={5} style={{ border: "none" }}></td>
            <td style={summaryLabelStyle}>Total $</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.finalTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

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
  width: "48px",
  padding: "2px",
  fontSize: "0.7rem",
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
  width: "48px",
  padding: "2px",
  fontSize: "0.65rem",
  textAlign: "center",
  color: "#444",
  background: "#f5f5f5",
  border: "1px solid #ccc",
};
