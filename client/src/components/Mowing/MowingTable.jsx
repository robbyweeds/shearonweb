// =====================================
// MowingTable.jsx — FINAL FIXED VERSION (OCC CELL YELLOW ONLY)
// =====================================

import React, { useMemo } from "react";
import LabeledInput from "../LabeledInput";
import { useServiceContext } from "../../context/ServiceContext";

import {
  INITIAL_MOWING_DATA,
  DECK_KEYS,
  SMPWR_KEYS,
} from "./mowingDefaults";

import { computeHours, computeTotals } from "./mowingCalculations";
import { saveMowing } from "./mowingSave";

export default function MowingTable({ tableId }) {
  const { currentServices, updateService, currentRates } = useServiceContext();

  const mowingDollars = currentRates?.mowingDollars || {};
  const acresPerHour = currentRates?.mowingFactors?.acresPerHour || {};
  const smPwrEfficiency = currentRates?.mowingFactors?.smPwrEfficiency || {};
  const smPwrAllocation = currentRates?.mowingFactors?.smPwrAllocation || {};

  const mowingList = Array.isArray(currentServices.mowing)
    ? currentServices.mowing
    : [];

  const tableEntry =
    mowingList.find((t) => t.id === tableId) || { id: tableId, data: {} };

  // --------------------------------------
  // MERGE DEFAULT DATA + SAVED DATA
  // --------------------------------------
  const data = useMemo(() => {
    const d = tableEntry.data || {};

    return {
      ...INITIAL_MOWING_DATA,
      ...d,

      selectedEfficiency: {
        ...INITIAL_MOWING_DATA.selectedEfficiency,
        ...(d.selectedEfficiency || {}),
      },

      acres: {
        ...INITIAL_MOWING_DATA.acres,
        ...(d.acres || {}),
      },

      qtyUnit: {
        ...INITIAL_MOWING_DATA.qtyUnit,
        ...(d.qtyUnit || {}),
      },

      manualOverrides: {
        ...INITIAL_MOWING_DATA.manualOverrides,
        ...(d.manualOverrides || {}),
      },

      summary: {
        ...INITIAL_MOWING_DATA.summary,
        ...(d.summary || {}),
      },
    };
  }, [tableEntry.data]);

  // --------------------------------------
  // COMPUTE HOURS + TOTALS
  // --------------------------------------
  const qtyUnitComputed = computeHours(
    data,
    acresPerHour,
    smPwrEfficiency,
    smPwrAllocation
  );

  const totals = computeTotals(data, qtyUnitComputed, mowingDollars);

  // --------------------------------------
  // SAVE FUNCTION
  // --------------------------------------
  const save = (updated) => {
    saveMowing(tableId, updated, mowingList, updateService, totals);
  };

  // --------------------------------------
  // HANDLERS
  // --------------------------------------
  const handleNameChange = (e) =>
    save({ ...data, name: e.target.value });

  const handleAcresChange = (key) => (e) => {
    const val = parseFloat(e.target.value) || 0;
    save({
      ...data,
      acres: { ...data.acres, [key]: val },
      manualOverrides: { ...data.manualOverrides, [key]: null },
    });
  };

  const handleEfficiencyChange = (key) => (e) => {
    save({
      ...data,
      selectedEfficiency: {
        ...data.selectedEfficiency,
        [key]: e.target.value,
      },
      manualOverrides: { ...data.manualOverrides, [key]: null },
    });
  };

  const handleSummaryChange = (field) => (e) => {
    const v = parseFloat(e.target.value) || 0;
    save({
      ...data,
      summary: { ...data.summary, [field]: v },
    });
  };

  const handleManualOverride = (key) => (e) => {
    let raw = e.target.value;

    if (raw === "") {
      save({
        ...data,
        manualOverrides: { ...data.manualOverrides, [key]: null },
      });
      return;
    }

    let num = parseFloat(raw);
    if (isNaN(num)) num = 0;

    const snapped = Math.round(num * 4) / 4;
    const final = Number(snapped.toFixed(2));

    save({
      ...data,
      manualOverrides: { ...data.manualOverrides, [key]: final },
    });
  };

  const handleQtyChange = (key) => (e) => {
    let num = parseFloat(e.target.value);
    if (isNaN(num)) num = 0;

    const snapped = Math.round(num * 4) / 4;
    const final = Number(snapped.toFixed(2));

    save({
      ...data,
      qtyUnit: { ...data.qtyUnit, [key]: final },
    });
  };

  // --------------------------------------
  // RENDER
  // --------------------------------------
  return (
    <div style={{ marginBottom: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
      {/* NAME ROW */}
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
        <h3 style={{ marginRight: "1rem" }}>Mowing Area Name:</h3>
        <input
          type="text"
          value={data.name}
          onChange={handleNameChange}
          style={{ padding: "8px", fontSize: "16px", width: "33%" }}
        />
      </div>

      {/* ===================================================== */}
      {/* ===================== TABLE ========================= */}
      {/* ===================================================== */}

      <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
        <thead>
          <tr>
            <th rowSpan={2}>ITEM</th>
            <th rowSpan={2}>MISC</th>

            <th colSpan={2}>72"</th>
            <th colSpan={2}>60"</th>
            <th colSpan={2}>48"</th>

            <th colSpan={3}>LABOR</th>

            <th rowSpan={2}>5111</th>
            <th rowSpan={2}># OCC</th>

            {/* OCC CELL → YELLOW ONLY */}
            <th rowSpan={2} style={{ backgroundColor: "yellow" }}>
              <LabeledInput
                value={data.summary.numOccurrences}
                onChange={handleSummaryChange("numOccurrences")}
                type="number"
                min={0}
                step={1}
              />
            </th>
          </tr>

          <tr>
            <th>area1</th><th>area2</th>
            <th>area1</th><th>area2</th>
            <th>area1</th><th>area2</th>
            <th>TRIMMER</th>
            <th>BLOWER</th>
            <th>ROTARY</th>
          </tr>
        </thead>

        <tbody>
          {/* EFFICIENCY ROW */}
          <tr style={{ background: "#e9f7ef", fontWeight: "bold" }}>
            <td>EFFICIENCY</td>
            <td style={{ background: "#ccc" }}></td>

            {DECK_KEYS.map((key) => (
              <td key={key}>
                <select
                  value={data.selectedEfficiency[key]}
                  onChange={handleEfficiencyChange(key)}
                  style={{ width: "100%" }}
                >
                  {Object.keys(acresPerHour[key.split("-")[0]]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </td>
            ))}

            {SMPWR_KEYS.map((key) => (
              <td key={key}>
                <select
                  value={data.selectedEfficiency[key]}
                  onChange={handleEfficiencyChange(key)}
                  style={{ width: "100%" }}
                >
                  {Object.keys(smPwrEfficiency[key]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </td>
            ))}

            <td style={{ background: "#ccc" }}></td>
            <td style={{ background: "#ccc" }}></td>

            <td>HRS/OCC</td>
            <td style={{ background: "#eef" }}>{totals.totalHours.toFixed(2)}</td>
          </tr>

          {/* ACRES ROW */}
          <tr>
            <td>ACRES</td>
            <td style={{ background: "#ccc" }}></td>

            {DECK_KEYS.map((key) => (
              <td key={key}>
                <LabeledInput
                  value={data.acres[key]}
                  type="number"
                  step={0.25}
                  min={0}
                  onChange={handleAcresChange(key)}
                />
              </td>
            ))}

            <td style={{ background: "#ccc" }}></td>
            <td style={{ background: "#ccc" }}></td>
            <td style={{ background: "#ccc" }}></td>
            <td style={{ background: "#ccc" }}></td>

            <td>ACRES:</td>
            <td style={{ background: "#eef" }}>{totals.totalAcres.toFixed(2)}</td>
          </tr>

          {/* QTY / UNIT */}
          <tr>
            <td>QTY/UNIT</td>

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit.MISC_HRS.toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleQtyChange("MISC_HRS")}
              />
            </td>

            {DECK_KEYS.map((key) => (
              <td key={key} style={{ background: "#b3d9ff" }}>
                <LabeledInput
                  value={(data.manualOverrides[key] ?? qtyUnitComputed[key]).toFixed(2)}
                  type="number"
                  step={0.25}
                  onChange={handleManualOverride(key)}
                />
              </td>
            ))}

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={(data.manualOverrides.TRIMMER ?? qtyUnitComputed.TRIMMER).toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleManualOverride("TRIMMER")}
              />
            </td>

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={(data.manualOverrides.BLOWER ?? qtyUnitComputed.BLOWER).toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleManualOverride("BLOWER")}
              />
            </td>

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit.ROTARY.toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleQtyChange("ROTARY")}
              />
            </td>

            <td style={{ background: "#b3d9ff" }}>
              <LabeledInput
                value={data.qtyUnit["5111"].toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleQtyChange("5111")}
              />
            </td>

            <td>$/OCC</td>
            <td style={{ background: "#eef" }}>{totals.totalOcc.toFixed(2)}</td>
          </tr>

          {/* UNIT DOLLARS */}
          <tr>
            <td>UNIT $</td>

            <td>${mowingDollars.MISC_HRS.toFixed(2)}</td>

            {DECK_KEYS.map((key) => (
              <td key={key}>${(mowingDollars[key] || 0).toFixed(2)}</td>
            ))}

            <td>${(mowingDollars.TRIMMER || 0).toFixed(2)}</td>
            <td>${(mowingDollars.BLOWER || 0).toFixed(2)}</td>
            <td>${(mowingDollars.ROTARY || 0).toFixed(2)}</td>
            <td>${(mowingDollars["5111"] || 0).toFixed(2)}</td>

            <td>
              <LabeledInput
                value={data.summary.adjPercent}
                type="number"
                step={0.5}
                min={-100}
                onChange={handleSummaryChange("adjPercent")}
              />
            </td>

            <td style={{ background: "#eef" }}>${totals.adjDollar.toFixed(2)}</td>
          </tr>

          {/* TOTAL ROW (NO YELLOW NOW) */}
          <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
            <td>TOTAL</td>

            <td>${totals.rowTotals.MISC_HRS.toFixed(2)}</td>

            {DECK_KEYS.map((key) => (
              <td key={key}>${totals.rowTotals[key].toFixed(2)}</td>
            ))}

            <td>${totals.rowTotals.TRIMMER.toFixed(2)}</td>
            <td>${totals.rowTotals.BLOWER.toFixed(2)}</td>
            <td>${totals.rowTotals.ROTARY.toFixed(2)}</td>
            <td>${totals.rowTotals["5111"].toFixed(2)}</td>

            <td>TOTAL $</td>

            {/* 🟢 NO MORE YELLOW */}
            <td>${totals.final.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
