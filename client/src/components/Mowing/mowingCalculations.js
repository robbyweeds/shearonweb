// myapp/client/src/components/Mowing/mowingCalculations.js

import {
  DECK_KEYS,
  SMPWR_KEYS,
  DISPLAY_KEYS,
} from "./mowingDefaults";

/**
 * Compute hours (qtyUnit) for all mowing-related keys.
 *
 * @param {object} data - The mowing table data (acres, selectedEfficiency, manualOverrides, qtyUnit, summary).
 * @param {object} acresPerHour - currentRates.mowingFactors.acresPerHour
 * @param {object} smPwrEfficiency - currentRates.mowingFactors.smPwrEfficiency
 * @param {object} smPwrAllocation - currentRates.mowingFactors.smPwrAllocation
 * @returns {object} qtyUnit map keyed by DISPLAY_KEYS (and extras)
 */
export function computeHours(
  data,
  acresPerHour = {},
  smPwrEfficiency = {},
  smPwrAllocation = {}
) {
  const manualOverrides = data.manualOverrides || {};
  const out = { ...data.qtyUnit };

  // ---------------------------------------------------
  // 0) LOCAL DEFAULTS (used only if context is missing)
  // ---------------------------------------------------
  const DEFAULT_SMPWR_EFF = {
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
  };

  const DEFAULT_SMPWR_ALLOC = {
    TRIMMER: { "72": 0.1, "60": 0.2, "48": 0.75 },
    BLOWER: { "72": 0.1, "60": 0.2, "48": 0.75 },
  };

  // If context passed non-empty objects, use them; otherwise fallback
  const effConfig =
    smPwrEfficiency && Object.keys(smPwrEfficiency).length
      ? smPwrEfficiency
      : DEFAULT_SMPWR_EFF;

  const allocConfig =
    smPwrAllocation && Object.keys(smPwrAllocation).length
      ? smPwrAllocation
      : DEFAULT_SMPWR_ALLOC;

  // ------------------------------------
  // 1) MAIN DECK HOURS (72/60/48)
  // ------------------------------------
  const deckTotals = { "72": 0, "60": 0, "48": 0 };

  DECK_KEYS.forEach((key) => {
    const deckSize = key.split("-")[0]; // "72", "60", "48"
    const effName = data.selectedEfficiency?.[key] || "AVERAGE";
    const acres = Number(data.acres?.[key] || 0);

    const rate =
      acresPerHour?.[deckSize]?.[effName] != null
        ? Number(acresPerHour[deckSize][effName])
        : 0;

    const autoHours = rate > 0 ? acres / rate : 0;

    // snap to quarter-hour, 2 decimals
    const snapped = Math.round(autoHours * 4) / 4;
    const autoFinal = Number(snapped.toFixed(2));

    const hasManual =
      Object.prototype.hasOwnProperty.call(manualOverrides, key) &&
      manualOverrides[key] != null;

    const finalHours = hasManual
      ? Number(manualOverrides[key])
      : autoFinal;

    out[key] = isNaN(finalHours) ? 0 : finalHours;

    // accumulate deck hours for small power calc
    if (deckTotals[deckSize] != null) {
      deckTotals[deckSize] += out[key];
    }
  });

  // ------------------------------------
  // 2) SMALL POWER (TRIMMER / BLOWER)
  //
  // toolHours =
  //   (hrs72 * alloc[72] * effFactor) +
  //   (hrs60 * alloc[60] * effFactor) +
  //   (hrs48 * alloc[48] * effFactor)
  //
  // If you change alloc/eff on the Rates page,
  // those values override the defaults above.
  // ------------------------------------
  SMPWR_KEYS.forEach((toolKey) => {
    const alloc = allocConfig?.[toolKey] || {};
    const effMap = effConfig?.[toolKey] || {};

    const effName = data.selectedEfficiency?.[toolKey] || "AVERAGE";
    const effFactor =
      effMap[effName] != null ? Number(effMap[effName]) : 1;

    const hrs72 = deckTotals["72"] || 0;
    const hrs60 = deckTotals["60"] || 0;
    const hrs48 = deckTotals["48"] || 0;

    const rawHours =
      hrs72 * (alloc["72"] || 0) * effFactor +
      hrs60 * (alloc["60"] || 0) * effFactor +
      hrs48 * (alloc["48"] || 0) * effFactor;

    const snapped = Math.round(rawHours * 4) / 4;
    const autoFinal = Number(snapped.toFixed(2));

    const hasManual =
      Object.prototype.hasOwnProperty.call(manualOverrides, toolKey) &&
      manualOverrides[toolKey] != null;

    const finalHours = hasManual
      ? Number(manualOverrides[toolKey])
      : autoFinal;

    out[toolKey] = isNaN(finalHours) ? 0 : finalHours;
  });

  // MISC_HRS, ROTARY, 5111, etc. remain user-controlled
  return out;
}

/**
 * Compute totals using a qtyUnit map + mowing dollar rates.
 */
export function computeTotals(data, qtyUnit, mowingDollars = {}) {
  const rowTotals = {};
  let totalOcc = 0;

  // Dollar totals per key
  DISPLAY_KEYS.forEach((key) => {
    const hrs = Number(qtyUnit[key] || 0);
    const price = Number(mowingDollars[key] || 0);
    const subtotal = hrs * price;

    rowTotals[key] = subtotal;
    totalOcc += subtotal;
  });

  const totalHours = DISPLAY_KEYS.reduce(
    (sum, key) => sum + Number(qtyUnit[key] || 0),
    0
  );

  const totalAcres = Object.values(data.acres || {}).reduce(
    (sum, v) => sum + Number(v || 0),
    0
  );

  const adjPercent = Number(data.summary?.adjPercent || 0);
  const numOccurrences =
    Number(data.summary?.numOccurrences || 0) || 0;

  const adjDollar = totalOcc * (1 + adjPercent / 100);
  const final = adjDollar * numOccurrences;

  return {
    totalHours,
    totalAcres,
    totalOcc,
    adjDollar,
    final,
    rowTotals,
  };
}
