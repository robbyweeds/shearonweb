// =====================================
// MowingTable.jsx — Excel-style layout
// =====================================

import React, { useMemo } from "react";
import LabeledInput from "../LabeledInput";
import { useServiceContext } from "../../context/ServiceContext";

import {
  INITIAL_MOWING_DATA,
  DECK_KEYS,
  SMPWR_KEYS,
  SPECIALTY_KEY,
} from "./mowingDefaults";

import { computeHours, computeTotals } from "./mowingCalculations";
import { saveMowing } from "./mowingSave";
import { formatCurrency } from "../../utils/formatters";

export default function MowingTable({ tableId, onDelete }) {
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

  const qtyUnitComputed = computeHours(
    data,
    acresPerHour,
    smPwrEfficiency,
    smPwrAllocation
  );

  const totals = computeTotals(data, qtyUnitComputed, mowingDollars);

  const adjustedOcc =
    totals.adjustedOcc ??
    (totals.totalOcc || 0) * (1 + (data.summary.adjPercent || 0) / 100);

  const totalHoursAllOcc =
    totals.totalHoursAllOcc ??
    (totals.totalHours || 0) * (data.summary.numOccurrences || 0);

  const pricePerAcre =
    totals.pricePerAcre ??
    (totals.totalAcres > 0 ? (totals.final || 0) / totals.totalAcres : 0);

  const save = (updated) => {
    saveMowing(tableId, updated, mowingList, updateService, totals);
  };

  const handleNameChange = (e) => save({ ...data, name: e.target.value });

  const handleFieldChange = (field) => (e) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;

    save({ ...data, [field]: value });
  };

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
    const raw = e.target.value;

    if (raw === "") {
      save({
        ...data,
        manualOverrides: { ...data.manualOverrides, [key]: null },
      });
      return;
    }

    const num = parseFloat(raw);
    const snapped = Math.round((isNaN(num) ? 0 : num) * 4) / 4;
    const final = Number(snapped.toFixed(2));

    save({
      ...data,
      manualOverrides: { ...data.manualOverrides, [key]: final },
    });
  };

  const handleQtyChange = (key) => (e) => {
    const num = parseFloat(e.target.value);
    const snapped = Math.round((isNaN(num) ? 0 : num) * 4) / 4;
    const final = Number(snapped.toFixed(2));

    save({
      ...data,
      qtyUnit: { ...data.qtyUnit, [key]: final },
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 100px",
          gap: "15px",
          alignItems: "end",
          marginBottom: "12px",
        }}
      >
        <div>
          <label style={{ fontWeight: "bold" }}>Mowing Area</label>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              value={data.name}
              onChange={handleNameChange}
              style={{ width: "100%", padding: "6px" }}
            />
            {onDelete && (
              <button className="danger-button compact-button" onClick={onDelete} type="button">
                Delete
              </button>
            )}
          </div>
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>Crew Size</label>
          <input
            type="number"
            value={data.crewSize}
            onChange={handleFieldChange("crewSize")}
            style={{ width: "100%", padding: "6px" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ fontWeight: "bold" }}>Notes</label>
        <textarea
          rows={2}
          value={data.notes}
          onChange={handleFieldChange("notes")}
          style={{ width: "100%", padding: "8px", resize: "vertical" }}
        />
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
            <th style={cellStyle}>MISC</th>
            <th style={cellStyle}>72&quot;-area1</th>
            <th style={cellStyle}>72&quot;-area2</th>
            <th style={cellStyle}>60&quot;-area1</th>
            <th style={cellStyle}>60&quot;-area2</th>
            <th style={cellStyle}>48&quot;-area1</th>
            <th style={cellStyle}>48&quot;-area2</th>
            <th style={cellStyle}>TRIMMER</th>
            <th style={cellStyle}>BLOWER</th>
            <th style={cellStyle}>ROTARY</th>
            <th style={cellStyle}>Specialty</th>
            <th style={summaryLabelStyle}>HRS/OCC:</th>
            <th style={summaryValueStyle}>{totals.totalHours.toFixed(2)}</th>
          </tr>
        </thead>

        <tbody>
          <tr style={{ background: "#e9f7ef", fontWeight: "bold" }}>
            <td style={cellStyle}>EFFICIENCY</td>
            <td style={{ ...cellStyle, background: "#ccc" }}></td>

            {DECK_KEYS.map((key) => (
              <td key={key} style={cellStyle}>
                <select
                  value={data.selectedEfficiency[key]}
                  onChange={handleEfficiencyChange(key)}
                  style={{ width: "100%", fontSize: "11px" }}
                >
                  {Object.keys(acresPerHour[key.split("-")[0]] || {}).map(
                    (opt) => (
                      <option key={opt} value={opt}>
                        {opt.replaceAll("_", " ")}
                      </option>
                    )
                  )}
                </select>
              </td>
            ))}

            {SMPWR_KEYS.map((key) => (
              <td key={key} style={cellStyle}>
                <select
                  value={data.selectedEfficiency[key]}
                  onChange={handleEfficiencyChange(key)}
                  style={{ width: "100%", fontSize: "11px" }}
                >
                  {Object.keys(smPwrEfficiency[key] || {}).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </td>
            ))}

            <td style={{ ...cellStyle, background: "#ccc" }}></td>
            <td style={{ ...cellStyle, background: "#ccc" }}></td>
            <td style={summaryLabelStyle}>ACRES:</td>
            <td style={summaryValueStyle}>{totals.totalAcres.toFixed(2)}</td>
          </tr>

          <tr>
            <td style={cellStyle}>ACRES</td>
            <td style={{ ...cellStyle, background: "#ccc" }}></td>

            {DECK_KEYS.map((key) => (
              <td key={key} style={cellStyle}>
                <LabeledInput
                  value={data.acres[key]}
                  type="number"
                  step={0.25}
                  min={0}
                  onChange={handleAcresChange(key)}
                />
              </td>
            ))}

            <td style={{ ...cellStyle, background: "#ccc" }}></td>
            <td style={{ ...cellStyle, background: "#ccc" }}></td>
            <td style={{ ...cellStyle, background: "#ccc" }}></td>
            <td style={{ ...cellStyle, background: "#ccc" }}></td>
            <td style={summaryLabelStyle}>$/Occ:</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.totalOcc)}</td>
          </tr>

          <tr>
            <td style={cellStyle}>QTY/UNIT</td>

            <td style={inputCellStyle}>
              <LabeledInput
                value={data.qtyUnit.MISC_HRS.toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleQtyChange("MISC_HRS")}
              />
            </td>

            {DECK_KEYS.map((key) => (
              <td key={key} style={inputCellStyle}>
                <LabeledInput
                  value={(data.manualOverrides[key] ?? qtyUnitComputed[key] ?? 0).toFixed(2)}
                  type="number"
                  step={0.25}
                  onChange={handleManualOverride(key)}
                />
              </td>
            ))}

            <td style={inputCellStyle}>
              <LabeledInput
                value={(data.manualOverrides.TRIMMER ?? qtyUnitComputed.TRIMMER ?? 0).toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleManualOverride("TRIMMER")}
              />
            </td>

            <td style={inputCellStyle}>
              <LabeledInput
                value={(data.manualOverrides.BLOWER ?? qtyUnitComputed.BLOWER ?? 0).toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleManualOverride("BLOWER")}
              />
            </td>

            <td style={inputCellStyle}>
              <LabeledInput
                value={data.qtyUnit.ROTARY.toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleQtyChange("ROTARY")}
              />
            </td>

            <td style={inputCellStyle}>
              <LabeledInput
                value={data.qtyUnit[SPECIALTY_KEY].toFixed(2)}
                type="number"
                step={0.25}
                onChange={handleQtyChange(SPECIALTY_KEY)}
              />
            </td>

            <td style={summaryLabelStyle}>ADJ%:</td>
            <td style={summaryValueStyle}>
              <LabeledInput
                value={data.summary.adjPercent}
                type="number"
                step={0.5}
                min={-100}
                onChange={handleSummaryChange("adjPercent")}
              />
            </td>
          </tr>

          <tr>
            <td style={cellStyle}>UNIT $</td>
            <td style={cellStyle}>{formatCurrency(mowingDollars.MISC_HRS)}</td>

            {DECK_KEYS.map((key) => (
              <td key={key} style={cellStyle}>
                {formatCurrency(mowingDollars[key])}
              </td>
            ))}

            <td style={cellStyle}>{formatCurrency(mowingDollars.TRIMMER)}</td>
            <td style={cellStyle}>{formatCurrency(mowingDollars.BLOWER)}</td>
            <td style={cellStyle}>{formatCurrency(mowingDollars.ROTARY)}</td>
            <td style={cellStyle}>{formatCurrency(mowingDollars[SPECIALTY_KEY])}</td>

            <td style={summaryLabelStyle}>ADJ $/Occ:</td>
            <td style={summaryValueStyle}>{formatCurrency(adjustedOcc)}</td>
          </tr>

          <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
            <td style={cellStyle}>TOTAL</td>

            <td style={cellStyle}>{formatCurrency(totals.rowTotals.MISC_HRS)}</td>

            {DECK_KEYS.map((key) => (
              <td key={key} style={cellStyle}>
                {formatCurrency(totals.rowTotals[key])}
              </td>
            ))}

            <td style={cellStyle}>{formatCurrency(totals.rowTotals.TRIMMER)}</td>
            <td style={cellStyle}>{formatCurrency(totals.rowTotals.BLOWER)}</td>
            <td style={cellStyle}>{formatCurrency(totals.rowTotals.ROTARY)}</td>
            <td style={cellStyle}>{formatCurrency(totals.rowTotals[SPECIALTY_KEY])}</td>

            <td style={summaryLabelStyle}># OCC:</td>
            <td style={{ ...summaryValueStyle, background: "yellow" }}>
              <LabeledInput
                value={data.summary.numOccurrences}
                onChange={handleSummaryChange("numOccurrences")}
                type="number"
                min={0}
                step={1}
              />
            </td>
          </tr>

          <tr>
            <td colSpan={12} style={{ border: "none" }}></td>
            <td style={summaryLabelStyle}>TOTAL $:</td>
            <td style={summaryValueStyle}>{formatCurrency(totals.final)}</td>
          </tr>

          <tr>
            <td colSpan={12} style={{ border: "none" }}></td>
            <td style={summaryLabelStyle}>TOT HRS:</td>
            <td style={summaryValueStyle}>{totalHoursAllOcc.toFixed(2)}</td>
          </tr>

          <tr>
            <td colSpan={12} style={{ border: "none" }}></td>
            <td style={summaryLabelStyle}>Price / A:</td>
            <td style={summaryValueStyle}>
              {totals.totalAcres > 0 ? formatCurrency(pricePerAcre) : "#DIV/0!"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}