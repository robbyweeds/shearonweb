// myapp/client/src/components/Mowing/mowingCalculations.js

import {
  DECK_KEYS,
  SMPWR_KEYS,
  DISPLAY_KEYS,
} from "./mowingDefaults";

export function computeHours(
  data,
  acresPerHour = {},
  smPwrEfficiency = {},
  smPwrAllocation = {}
) {
  const manualOverrides = data.manualOverrides || {};
  const out = { ...data.qtyUnit };

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

  const effConfig =
    smPwrEfficiency && Object.keys(smPwrEfficiency).length
      ? smPwrEfficiency
      : DEFAULT_SMPWR_EFF;

  const allocConfig =
    smPwrAllocation && Object.keys(smPwrAllocation).length
      ? smPwrAllocation
      : DEFAULT_SMPWR_ALLOC;

  const deckTotals = { "72": 0, "60": 0, "48": 0 };

  DECK_KEYS.forEach((key) => {
    const deckSize = key.split("-")[0];
    const effName = data.selectedEfficiency?.[key] || "AVERAGE";
    const acres = Number(data.acres?.[key] || 0);

    const rate = Number(acresPerHour?.[deckSize]?.[effName] || 0);

    const rawHours = rate > 0 ? acres / rate : 0;
    const autoFinal = Number((Math.round(rawHours * 4) / 4).toFixed(2));

    const hasManual =
      Object.prototype.hasOwnProperty.call(manualOverrides, key) &&
      manualOverrides[key] != null;

    const finalHours = hasManual ? Number(manualOverrides[key]) : autoFinal;

    out[key] = Number.isFinite(finalHours) ? finalHours : 0;
    deckTotals[deckSize] += out[key];
  });

  SMPWR_KEYS.forEach((toolKey) => {
    const alloc = allocConfig?.[toolKey] || {};
    const effMap = effConfig?.[toolKey] || {};

    const effName = data.selectedEfficiency?.[toolKey] || "AVERAGE";
    const effFactor = Number(effMap[effName] ?? 1);

    const rawHours =
      (deckTotals["72"] || 0) * Number(alloc["72"] || 0) * effFactor +
      (deckTotals["60"] || 0) * Number(alloc["60"] || 0) * effFactor +
      (deckTotals["48"] || 0) * Number(alloc["48"] || 0) * effFactor;

    const autoFinal = Number((Math.round(rawHours * 4) / 4).toFixed(2));

    const hasManual =
      Object.prototype.hasOwnProperty.call(manualOverrides, toolKey) &&
      manualOverrides[toolKey] != null;

    const finalHours = hasManual ? Number(manualOverrides[toolKey]) : autoFinal;

    out[toolKey] = Number.isFinite(finalHours) ? finalHours : 0;
  });

  return out;
}

export function computeTotals(data, qtyUnit, mowingDollars = {}) {
  const rowTotals = {};
  let totalOcc = 0;

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

  const totalAcres = DECK_KEYS.reduce(
    (sum, key) => sum + Number(data.acres?.[key] || 0),
    0
  );
  const enteredTableAcres = Number(data.tableAcres || 0);
  const legacyTotalAcres = Number(data.totalAcres || 0);
  const tableAcres = enteredTableAcres > 0 ? enteredTableAcres : legacyTotalAcres > 0 ? legacyTotalAcres : totalAcres;
  const remainingAcres = tableAcres - totalAcres;

  const adjPercent = Number(data.summary?.adjPercent || 0);
  const numOccurrences = Number(data.summary?.numOccurrences || 0);

  const adjDollar = totalOcc * (adjPercent / 100);
  const adjustedOcc = totalOcc + adjDollar;
  const final = adjustedOcc * numOccurrences;
  const totalHoursAllOcc = totalHours * numOccurrences;
  const pricePerAcre = tableAcres > 0 ? adjustedOcc / tableAcres : 0;

  return {
    totalHours,
    totalAcres,
    tableAcres,
    remainingAcres,
    totalOcc,
    adjDollar,
    adjustedOcc,
    final,
    totalHoursAllOcc,
    pricePerAcre,
    rowTotals,
  };
}