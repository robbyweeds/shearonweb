// =========================================
// MowingRatesPage.jsx — FINAL CLEAN VERSION
// =========================================

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LabeledInput from "../LabeledInput";
import { useServiceContext } from "../../context/ServiceContext";

import {
  DECK_KEYS,
  EFFICIENCY_OPTIONS,
  SMPWR_EFFICIENCY_OPTIONS,
  SMPWR_KEYS,
  ROTARY_KEY,
  DISPLAY_KEYS,
  INITIAL_MOWING_DATA,
} from "./mowingDefaults";

// ==========================================================
//  DEFAULTS (moved here because mowingDefaults does NOT export them)
// ==========================================================
const DEFAULT_FACTORS = {
  acresPerHour: {
    "72": {
      OBSTACLES: 0.65,
      HOA_HOMES: 0.85,
      AVERAGE: 0.95,
      OPEN_LAWN: 1.3,
      FIELDS: 1.45,
      MONTHLY: 0.6,
      DOUBLE_CUT: 0.7,
    },
    "60": {
      OBSTACLES: 0.6,
      HOA_HOMES: 0.75,
      AVERAGE: 0.85,
      OPEN_LAWN: 1.0,
      FIELDS: 1.25,
      MONTHLY: 0.55,
      DOUBLE_CUT: 0.7,
    },
    "48": {
      OBSTACLES: 0.4,
      HOA_HOMES: 0.6,
      AVERAGE: 0.65,
      OPEN_LAWN: 0.75,
      FIELDS: 0.9,
      MONTHLY: 0.35,
      DOUBLE_CUT: 0.45,
    },
  },

  smPwrEfficiency: {
    TRIMMER: {
      MINIMUM: 0.75,
      LESS: 0.85,
      AVERAGE: 0.95,
      HOA_HOMES: 1.05,
      HIGH_END_DETAILING: 1.35,
    },
    BLOWER: {
      MINIMUM: 0.2,
      LESS: 0.3,
      AVERAGE: 0.35,
      HOA_HOMES: 0.45,
      HIGH_END_DETAILING: 0.55,
    },
  },

  smPwrAllocation: {
    TRIMMER: { "72": 0.1, "60": 0.2, "48": 0.75 },
    BLOWER: { "72": 0.1, "60": 0.2, "48": 0.75 },
  },
};

const DEFAULT_DOLLARS = {
  MISC_HRS: 61.0,
  "72-area1": 51.0,
  "72-area2": 61.0,
  "60-area1": 61.0,
  "60-area2": 59.0,
  "48-area1": 56.0,
  "48-area2": 56.0,
  TRIMMER: 55.0,
  BLOWER: 55.0,
  ROTARY: 55.0,
  "5111": 100.0,
};

// ==========================================================
//  COMPONENT
// ==========================================================
export default function MowingRatesPage() {
  const navigate = useNavigate();
  const { currentRates = {}, updateRates } = useServiceContext();

  // Merge context → defaults
  const safeFactors = {
    ...DEFAULT_FACTORS,
    ...currentRates.mowingFactors,
    acresPerHour: {
      ...DEFAULT_FACTORS.acresPerHour,
      ...(currentRates?.mowingFactors?.acresPerHour || {}),
    },
    smPwrEfficiency: {
      ...DEFAULT_FACTORS.smPwrEfficiency,
      ...(currentRates?.mowingFactors?.smPwrEfficiency || {}),
    },
    smPwrAllocation: {
      ...DEFAULT_FACTORS.smPwrAllocation,
      ...(currentRates?.mowingFactors?.smPwrAllocation || {}),
    },
  };

  const safeDollars = {
    ...DEFAULT_DOLLARS,
    ...(currentRates.mowingDollars || {}),
  };

  // Local working state
  const [rates, setRates] = useState({
    factors: safeFactors,
    dollars: safeDollars,
  });

  // SAVE BUTTON
  const handleSaveRates = () => {
    updateRates("mowingFactors", rates.factors);
    updateRates("mowingDollars", rates.dollars);
    alert("Mowing Rates Updated!");
  };

  // ======================================================
  // SECTION 1 — Acres Per Hour
  // ======================================================
  const renderAcresPerHour = useMemo(() => {
    const data = rates.factors.acresPerHour;

    return (
      <>
        <h3>1. Acres Per Hour</h3>

        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Deck</th>
              {Object.keys(data["72"]).map((key) => (
                <th key={key}>{key.replace("_", " ")}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.keys(data).map((deck) => (
              <tr key={deck}>
                <td>{deck}"</td>

                {Object.keys(data["72"]).map((col) => (
                  <td key={col}>
                    <LabeledInput
                      value={data[deck][col]}
                      type="number"
                      min={0}
                      step={0.01}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;

                        setRates((prev) => ({
                          ...prev,
                          factors: {
                            ...prev.factors,
                            acresPerHour: {
                              ...prev.factors.acresPerHour,
                              [deck]: {
                                ...prev.factors.acresPerHour[deck],
                                [col]: v,
                              },
                            },
                          },
                        }));
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }, [rates]);

  // ======================================================
  // SECTION 2 — Small Power Efficiency
  // ======================================================
  const renderSmPwrEfficiency = useMemo(() => {
    const data = rates.factors.smPwrEfficiency;

    return (
      <>
        <h3>2. Small Power Efficiency</h3>

        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Tool</th>
              {Object.keys(data.TRIMMER).map((k) => (
                <th key={k}>{k.replace("_", " ")}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.keys(data).map((tool) => (
              <tr key={tool}>
                <td>{tool}</td>

                {Object.keys(data.TRIMMER).map((k) => (
                  <td key={k}>
                    <LabeledInput
                      value={data[tool][k]}
                      type="number"
                      step={0.01}
                      min={0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;

                        setRates((prev) => ({
                          ...prev,
                          factors: {
                            ...prev.factors,
                            smPwrEfficiency: {
                              ...prev.factors.smPwrEfficiency,
                              [tool]: {
                                ...prev.factors.smPwrEfficiency[tool],
                                [k]: v,
                              },
                            },
                          },
                        }));
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }, [rates]);

  // ======================================================
  // SECTION 3 — Small Power Allocation
  // ======================================================
  const renderSmPwrAllocation = useMemo(() => {
    const data = rates.factors.smPwrAllocation;
    const decks = ["72", "60", "48"];

    return (
      <>
        <h3>3. Small Power Allocation</h3>

        <table border="1" width="50%">
          <thead>
            <tr>
              <th>Tool</th>
              {decks.map((d) => (
                <th key={d}>{d}"</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.keys(data).map((tool) => (
              <tr key={tool}>
                <td>{tool}</td>

                {decks.map((deck) => (
                  <td key={deck}>
                    <LabeledInput
                      value={data[tool][deck] * 100}
                      type="number"
                      step={1}
                      min={0}
                      onChange={(e) => {
                        const v = (parseFloat(e.target.value) || 0) / 100;

                        setRates((prev) => ({
                          ...prev,
                          factors: {
                            ...prev.factors,
                            smPwrAllocation: {
                              ...prev.factors.smPwrAllocation,
                              [tool]: {
                                ...prev.factors.smPwrAllocation[tool],
                                [deck]: v,
                              },
                            },
                          },
                        }));
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }, [rates]);

  // ======================================================
  // SECTION 4 — Dollar Rates
  // ======================================================
  const renderDollarRates = useMemo(
    () => (
      <>
        <h3>4. Dollar Rates</h3>

        <table border="1" width="40%">
          <tbody>
            {Object.keys(rates.dollars).map((k) => (
              <tr key={k}>
                <td>{k}</td>

                <td>
                  <LabeledInput
                    value={rates.dollars[k]}
                    type="number"
                    min={0}
                    step={0.01}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;

                      setRates((prev) => ({
                        ...prev,
                        dollars: { ...prev.dollars, [k]: v },
                      }));
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
    [rates.dollars]
  );

  // ======================================================
  // PAGE LAYOUT
  // ======================================================
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Edit Mowing Rates</h2>

      {renderAcresPerHour}
      {renderSmPwrEfficiency}
      {renderSmPwrAllocation}
      {renderDollarRates}

      <button
        onClick={handleSaveRates}
        style={{
          marginTop: "2rem",
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
        onClick={() => navigate(-1)}
        style={{
          marginLeft: "1rem",
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
  );
}
