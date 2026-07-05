// myapp/client/src/components/Mulching/MulchingPage.jsx

import React from "react";
import { useServiceContext } from "../../context/ServiceContext";
import { DEFAULT_MULCHING_RATES, MULCH_AREA_KEYS } from "./mulchingDefaults";
import {
  computeMulchingTotals,
  formatCurrency,
  mergeMulchingData,
  mergeMulchingRates,
} from "./mulchingCalculations";

const SECTION_META = {
  common: {
    title: "Hand - Common Areas - Sq/ft",
    shortTitle: "Common Areas",
    accent: "#4f8f6f",
    tint: "#eef6f1",
    itemLabels: ["Area #1", "Area #2", "Area #3"],
    sqftLabel: "Sq/Ft",
    equipmentLabel: "SM PWR",
    areaRateKey: "HAND",
  },
  homes: {
    title: "Hand - Homes - # of Homes",
    shortTitle: "Homes",
    accent: "#527aa3",
    tint: "#eef4fb",
    itemLabels: ["Home Size #1", "Home Size #2", "Home Size #3"],
    sqftLabel: "Sq/Ft per Home",
    equipmentLabel: "SM PWR",
    areaRateKey: "HAND",
  },
  trees: {
    title: "Trees - # of Trees",
    shortTitle: "Trees",
    accent: "#8b7a3e",
    tint: "#f8f4e8",
    itemLabels: ["Tree Rings", "Tree Rings", "Tree Rings"],
    sqftLabel: "Qty",
    equipmentLabel: "SM PWR",
    areaRateKey: "HAND",
  },
  finn: {
    title: "Finn - Sq/ft",
    shortTitle: "Finn",
    accent: "#8a5f8f",
    tint: "#f5eef7",
    itemLabels: ["Area #1", "Area #2", "Area #3"],
    sqftLabel: "Sq/Ft",
    equipmentLabel: "HELPER",
    areaRateKey: "FINN",
  },
};

export default function MulchingPage({ tableId, onDelete }) {
  const { currentServices, updateService, currentRates } = useServiceContext();

  const mulchingArray = Array.isArray(currentServices.mulching)
    ? currentServices.mulching
    : [];

  const existingEntry =
    mulchingArray.find((m) => m.id === tableId) || { id: tableId, data: {} };

  const mulchingRates = mergeMulchingRates(
    currentRates?.mulchingRates || DEFAULT_MULCHING_RATES
  );
  const mergedData = mergeMulchingData(existingEntry.data || {});
  const totals = computeMulchingTotals(mergedData, mulchingRates);

  const updateMulchingData = (newData) => {
    const nextData = {
      ...newData,
      totals: computeMulchingTotals(newData, mulchingRates),
    };
    const updatedEntry = { ...existingEntry, data: nextData };
    const updatedArray = mulchingArray.some((m) => m.id === tableId)
      ? mulchingArray.map((m) => (m.id === tableId ? updatedEntry : m))
      : [...mulchingArray, updatedEntry];

    updateService("mulching", updatedArray);
  };

  const updateRootField = (field, value) => {
    updateMulchingData({ ...mergedData, [field]: value });
  };

  const updateSectionField = (sectionKey, field, value) => {
    updateMulchingData({
      ...mergedData,
      sections: {
        ...mergedData.sections,
        [sectionKey]: {
          ...mergedData.sections[sectionKey],
          [field]: value,
        },
      },
    });
  };

  const updateAreaField = (sectionKey, areaKey, field, value) => {
    updateMulchingData({
      ...mergedData,
      sections: {
        ...mergedData.sections,
        [sectionKey]: {
          ...mergedData.sections[sectionKey],
          areas: {
            ...mergedData.sections[sectionKey].areas,
            [areaKey]: {
              ...mergedData.sections[sectionKey].areas[areaKey],
              [field]: value,
            },
          },
        },
      },
    });
  };

  const cellStyle = {
    padding: "4px",
    fontSize: "12px",
    textAlign: "center",
    whiteSpace: "nowrap",
  };
  const editableBackground = "#fff59d";
  const inputStyle = {
    width: "86px",
    fontSize: "12px",
    padding: "2px",
    background: editableBackground,
  };
  const selectStyle = {
    width: "100%",
    fontSize: "12px",
    padding: "2px",
    background: editableBackground,
  };
  const summaryLabelStyle = { ...cellStyle, fontWeight: "bold", textAlign: "right", background: "#f3f3f3" };
  const summaryValueStyle = { ...cellStyle, fontWeight: "bold", background: "#eef" };
  const sectionTitleStyle = (meta) => ({
    ...cellStyle,
    textAlign: "left",
    fontWeight: "bold",
    padding: "8px 10px",
    background: meta.tint,
    borderTop: `3px solid ${meta.accent}`,
    borderLeft: `6px solid ${meta.accent}`,
    color: "#26332c",
  });
  const sectionHeaderStyle = (meta) => ({
    ...cellStyle,
    background: meta.tint,
    borderBottom: `2px solid ${meta.accent}`,
    color: "#1f2a24",
  });

  const numberInput = (value, onChange, step = "0.1") => (
    <input
      type="number"
      value={value}
      min="0"
      step={step}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      style={inputStyle}
    />
  );

  const formatInputNumber = (value) => {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num.toLocaleString("en-US") : "0";
  };

  const parseFormattedNumber = (value) => Number(String(value).replace(/,/g, "")) || 0;

  const squareFootInput = (value, onChange) => (
    <input
      type="text"
      inputMode="numeric"
      value={formatInputNumber(value)}
      onChange={(e) => onChange(parseFormattedNumber(e.target.value))}
      style={inputStyle}
    />
  );

  const loaderDayOptions = Object.keys(mulchingRates.loaderManHours).sort(
    (a, b) => Number(a) - Number(b)
  );

  const loaderDaysSelect = (value, onChange) => (
    <select value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} style={selectStyle}>
      {loaderDayOptions.map((key) => <option key={key} value={key}>{key}</option>)}
    </select>
  );

  const renderAreaInputRow = (sectionKey) => {
    const section = mergedData.sections[sectionKey];
    const meta = SECTION_META[sectionKey];

    if (sectionKey === "homes") {
      return (
        <>
          <tr>
            <td style={cellStyle}>{meta.sqftLabel}</td>
            <td style={cellStyle}></td>
            {MULCH_AREA_KEYS.map((areaKey) => (
              <td key={areaKey} style={cellStyle}>
                {squareFootInput(section.areas[areaKey].sqftEach, (value) => updateAreaField(sectionKey, areaKey, "sqftEach", value))}
              </td>
            ))}
            <td style={cellStyle}>
              <select value={section.smPwr} onChange={(e) => updateSectionField(sectionKey, "smPwr", e.target.value)} style={selectStyle}>
                {Object.keys(mulchingRates.smPowerManHours).map((key) => <option key={key}>{key}</option>)}
              </select>
            </td>
            <td style={cellStyle}>{loaderDaysSelect(section.loaderHours, (value) => updateSectionField(sectionKey, "loaderHours", value))}</td>
            <td style={cellStyle}></td>
            <td style={summaryLabelStyle}>Price per Yard</td>
            <td style={summaryValueStyle}>{totals.sections[sectionKey].pricePerYard == null ? "#DIV/0!" : formatCurrency(totals.sections[sectionKey].pricePerYard)}</td>
          </tr>
          <tr>
            <td style={cellStyle}>Number of Homes</td>
            <td style={cellStyle}></td>
            {MULCH_AREA_KEYS.map((areaKey) => (
              <td key={areaKey} style={cellStyle}>
                Home#: {numberInput(section.areas[areaKey].count, (value) => updateAreaField(sectionKey, areaKey, "count", value), "1")}
              </td>
            ))}
            <td colSpan={5} style={cellStyle}></td>
          </tr>
        </>
      );
    }

    if (sectionKey === "trees") {
      return (
        <>
          <tr>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            {MULCH_AREA_KEYS.map((areaKey) => (
              <td key={areaKey} style={cellStyle}>
                Qty: {numberInput(section.areas[areaKey].qty, (value) => updateAreaField(sectionKey, areaKey, "qty", value), "1")}
              </td>
            ))}
            <td style={cellStyle}>
              <select value={section.smPwr} onChange={(e) => updateSectionField(sectionKey, "smPwr", e.target.value)} style={selectStyle}>
                {Object.keys(mulchingRates.smPowerManHours).map((key) => <option key={key}>{key}</option>)}
              </select>
            </td>
            <td style={cellStyle}>{loaderDaysSelect(section.loaderHours, (value) => updateSectionField(sectionKey, "loaderHours", value))}</td>
            <td style={cellStyle}></td>
            <td style={summaryLabelStyle}>Price per Yard</td>
            <td style={summaryValueStyle}>{totals.sections[sectionKey].pricePerYard == null ? "#DIV/0!" : formatCurrency(totals.sections[sectionKey].pricePerYard)}</td>
          </tr>
          <tr>
            <td style={cellStyle}>Tree Ring Diameter</td>
            <td style={cellStyle}></td>
            {MULCH_AREA_KEYS.map((areaKey) => (
              <td key={areaKey} style={cellStyle}>
                <select value={section.areas[areaKey].diameter} onChange={(e) => updateAreaField(sectionKey, areaKey, "diameter", e.target.value)} style={selectStyle}>
                  {Object.keys(mulchingRates.treeRingSize).map((key) => <option key={key}>{key}</option>)}
                </select>
              </td>
            ))}
            <td colSpan={5} style={cellStyle}></td>
          </tr>
        </>
      );
    }

    return (
      <tr>
        <td style={cellStyle}>{meta.sqftLabel}</td>
        <td style={cellStyle}></td>
        {MULCH_AREA_KEYS.map((areaKey) => (
          <td key={areaKey} style={cellStyle}>
            {squareFootInput(section.areas[areaKey].sqft, (value) => updateAreaField(sectionKey, areaKey, "sqft", value))}
          </td>
        ))}
        <td style={cellStyle}>
          {sectionKey === "finn" ? "" : (
            <select value={section.smPwr} onChange={(e) => updateSectionField(sectionKey, "smPwr", e.target.value)} style={selectStyle}>
              {Object.keys(mulchingRates.smPowerManHours).map((key) => <option key={key}>{key}</option>)}
            </select>
          )}
        </td>
        <td style={cellStyle}>{loaderDaysSelect(section.loaderHours, (value) => updateSectionField(sectionKey, "loaderHours", value))}</td>
        <td style={cellStyle}></td>
        <td style={summaryLabelStyle}>Price per Yard</td>
        <td style={summaryValueStyle}>{totals.sections[sectionKey].pricePerYard == null ? "#DIV/0!" : formatCurrency(totals.sections[sectionKey].pricePerYard)}</td>
      </tr>
    );
  };

  const renderEfficiencyRow = (sectionKey) => {
    const section = mergedData.sections[sectionKey];
    if (sectionKey === "trees") return null;
    const options = sectionKey === "finn" ? Object.keys(mulchingRates.finnEfficiency) : Object.keys(mulchingRates.handEfficiency);

    return (
      <tr>
        <td style={cellStyle}>EFFICIENCY</td>
        <td style={cellStyle}></td>
        {MULCH_AREA_KEYS.map((areaKey) => (
          <td key={areaKey} style={cellStyle}>
            <select value={section.areas[areaKey].efficiency} onChange={(e) => updateAreaField(sectionKey, areaKey, "efficiency", e.target.value)} style={selectStyle}>
              {options.map((key) => <option key={key}>{key}</option>)}
            </select>
          </td>
        ))}
        <td style={cellStyle}>
          {sectionKey === "finn" && (
            <select value={section.helper} onChange={(e) => updateSectionField(sectionKey, "helper", e.target.value)} style={selectStyle}>
              {Object.keys(mulchingRates.finnHelper).map((key) => <option key={key}>{key}</option>)}
            </select>
          )}
        </td>
        <td colSpan={4} style={cellStyle}></td>
      </tr>
    );
  };

  const renderCoverageRow = (sectionKey) => {
    if (sectionKey === "trees") return null;
    const section = mergedData.sections[sectionKey];

    return (
      <tr>
        <td style={cellStyle}>Mulch Bed Coverage</td>
        <td style={cellStyle}></td>
        {MULCH_AREA_KEYS.map((areaKey) => (
          <td key={areaKey} style={cellStyle}>
            {numberInput(section.areas[areaKey].coverage, (value) => updateAreaField(sectionKey, areaKey, "coverage", value), "1")}%
          </td>
        ))}
        <td colSpan={5} style={cellStyle}></td>
      </tr>
    );
  };

  const renderDepthRow = (sectionKey) => {
    const section = mergedData.sections[sectionKey];
    const depthOptions = sectionKey === "finn" ? Object.keys(mulchingRates.finnDepth) : sectionKey === "trees" ? Object.keys(mulchingRates.treeDepth) : Object.keys(mulchingRates.depthInches);
    const efficiencyOptions = Object.keys(mulchingRates.treeEfficiency);

    return (
      <tr>
        <td style={cellStyle}>{sectionKey === "trees" ? "DEPTH/EFFICIENCY" : "Depth/Proximity"}</td>
        <td style={cellStyle}></td>
        {MULCH_AREA_KEYS.map((areaKey) => (
          <td key={areaKey} style={cellStyle}>
            <select value={section.areas[areaKey].depth} onChange={(e) => updateAreaField(sectionKey, areaKey, "depth", e.target.value)} style={{ ...selectStyle, width: "48%" }}>
              {depthOptions.map((key) => <option key={key}>{key}</option>)}
            </select>{" "}
            {sectionKey === "trees" ? (
              <select value={section.areas[areaKey].efficiency} onChange={(e) => updateAreaField(sectionKey, areaKey, "efficiency", e.target.value)} style={{ ...selectStyle, width: "48%" }}>
                {efficiencyOptions.map((key) => <option key={key}>{key}</option>)}
              </select>
            ) : (
              <select value={section.areas[areaKey].proximity} onChange={(e) => updateAreaField(sectionKey, areaKey, "proximity", e.target.value)} style={{ ...selectStyle, width: "48%" }}>
                {Object.keys(mulchingRates.proximity).map((key) => <option key={key}>{key}</option>)}
              </select>
            )}
          </td>
        ))}
        <td colSpan={5} style={cellStyle}></td>
      </tr>
    );
  };

  const renderSection = (sectionKey) => {
    const section = mergedData.sections[sectionKey];
    const sectionTotals = totals.sections[sectionKey];
    const meta = SECTION_META[sectionKey];
    const areaRate = sectionKey === "finn" ? mulchingRates.dollars.FINN : mulchingRates.dollars.HAND;
    const extraRate = sectionKey === "finn" ? mulchingRates.dollars.HELPER : mulchingRates.dollars.SM_PWR;

    return (
      <React.Fragment key={sectionKey}>
        <tr>
          <td colSpan={10} style={{ border: "none", height: sectionKey === "common" ? "0" : "12px", padding: 0 }}></td>
        </tr>
        <tr>
          <td colSpan={10} style={sectionTitleStyle(meta)}>
            <span style={{ fontSize: "13px", marginRight: "8px" }}>{meta.shortTitle}</span>
            <span style={{ color: "#58645d", fontWeight: 600 }}>{meta.title}</span>
          </td>
        </tr>
        <tr>
          <th style={sectionHeaderStyle(meta)}>ITEM</th>
          <th style={sectionHeaderStyle(meta)}>MISC</th>
          {meta.itemLabels.map((label) => <th key={label} style={sectionHeaderStyle(meta)}>{label}</th>)}
          <th style={sectionHeaderStyle(meta)}>{meta.equipmentLabel}</th>
          <th style={sectionHeaderStyle(meta)}>Loader Days</th>
          <th style={sectionHeaderStyle(meta)}>MULCH</th>
          <th style={summaryLabelStyle}>HRS/OCC</th>
          <th style={summaryValueStyle}>{sectionTotals.hoursPerOcc.toFixed(1)}</th>
        </tr>
        {renderAreaInputRow(sectionKey)}
        {renderEfficiencyRow(sectionKey)}
        {renderCoverageRow(sectionKey)}
        {renderDepthRow(sectionKey)}
        <tr>
          <td style={cellStyle}>QTY/UNIT</td>
          <td style={cellStyle}>{numberInput(section.miscHours, (value) => updateSectionField(sectionKey, "miscHours", value), "0.1")}<div>HRS</div></td>
          {MULCH_AREA_KEYS.map((areaKey) => <td key={areaKey} style={cellStyle}><strong>{sectionTotals.areaTotals[areaKey].hours ? sectionTotals.areaTotals[areaKey].hours.toFixed(2) : "-"}</strong><div>HRS</div></td>)}
          <td style={cellStyle}><strong>{sectionTotals.extraHours.toFixed(1)}</strong><div>HRS</div></td>
          <td style={cellStyle}><strong>{sectionTotals.loaderHours.toFixed(1)}</strong><div>HRS</div></td>
          <td style={cellStyle}><strong>{sectionTotals.mulchYards.toFixed(1)}</strong><div>YDS</div></td>
          <td style={summaryLabelStyle}>$/OCC</td>
          <td style={summaryValueStyle}>{formatCurrency(sectionTotals.totalOcc)}</td>
        </tr>
        <tr>
          <td style={cellStyle}>UNIT $</td>
          <td style={cellStyle}>{formatCurrency(mulchingRates.dollars.MISC)}</td>
          {MULCH_AREA_KEYS.map((areaKey) => <td key={areaKey} style={cellStyle}>{formatCurrency(areaRate)}</td>)}
          <td style={cellStyle}>{formatCurrency(extraRate)}</td>
          <td style={cellStyle}>{formatCurrency(mulchingRates.dollars.LOADER)}</td>
          <td style={cellStyle}>{formatCurrency(mulchingRates.dollars.MULCH)}</td>
          <td colSpan={2} style={cellStyle}></td>
        </tr>
        <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
          <td style={cellStyle}>TOTAL</td>
          <td style={cellStyle}>{formatCurrency(sectionTotals.rowTotals.MISC)}</td>
          {MULCH_AREA_KEYS.map((areaKey) => <td key={areaKey} style={cellStyle}>{formatCurrency(sectionTotals.rowTotals[areaKey])}</td>)}
          <td style={cellStyle}>{formatCurrency(sectionTotals.rowTotals[sectionTotals.extraKey])}</td>
          <td style={cellStyle}>{formatCurrency(sectionTotals.rowTotals.LOADER)}</td>
          <td style={cellStyle}>{formatCurrency(sectionTotals.rowTotals.MULCH)}</td>
          <td style={summaryLabelStyle}>TOTAL $</td>
          <td style={summaryValueStyle}>{formatCurrency(sectionTotals.totalOcc)}</td>
        </tr>
        <tr>
          <td style={cellStyle}></td>
          <td style={cellStyle}></td>
          {MULCH_AREA_KEYS.map((areaKey) => <td key={areaKey} style={cellStyle}>Mulch: {sectionTotals.areaTotals[areaKey].mulch.toFixed(1)}</td>)}
          <td style={cellStyle}></td>
          <td style={summaryLabelStyle}>TOTAL MAT:</td>
          <td style={summaryValueStyle}>{formatCurrency(sectionTotals.totalMat)}</td>
          <td style={summaryLabelStyle}>TOT HRS</td>
          <td style={summaryValueStyle}>{sectionTotals.hoursPerOcc.toFixed(2)}</td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div style={{ marginTop: "0.5rem", padding: "0.75rem", border: "1px solid #ccc", background: "#fdfdfd", overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) 220px 220px 220px", gap: "12px", alignItems: "end", minWidth: "980px", marginBottom: "12px" }}>
        <label>
          <strong>Mulch Service Name</strong>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              value={mergedData.name || "Mulch"}
              onChange={(e) => updateRootField("name", e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            />
            {onDelete && (
              <button className="danger-button compact-button" onClick={onDelete} type="button">
                Delete
              </button>
            )}
          </div>
        </label>
        <label>
          <strong>Enter Mulching Occurrences:</strong>
          <input type="number" min="0" step="1" value={mergedData.occurrences} onChange={(e) => updateRootField("occurrences", Number(e.target.value) || 0)} style={{ ...inputStyle, width: "100%" }} />
        </label>
        <div><strong>Mulch Install Total Price:</strong><br />{formatCurrency(totals.totalPrice)}</div>
        <div><strong>Mulch Install Total Hours:</strong><br />{totals.totalHours.toFixed(1)}</div>
        <div></div><div></div><div><strong>Total Mulch Yards:</strong><br />{totals.mulchYards.toFixed(1)}</div><div><strong>Price per Yard:</strong><br />{totals.pricePerYard == null ? "#DIV/0!" : formatCurrency(totals.pricePerYard)}</div>
      </div>

      <table border="1" style={{ minWidth: "1250px", width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
        <tbody>
          {Object.keys(SECTION_META).map((sectionKey) => renderSection(sectionKey))}
        </tbody>
      </table>
    </div>
  );
}
