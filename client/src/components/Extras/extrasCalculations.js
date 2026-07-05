import { EXTRA_KEYS, EXTRA_LABOR_KEYS, INITIAL_EXTRAS_TABLE } from "./extrasDefaults";

export function mergeExtrasTable(data = {}) {
  return {
    ...INITIAL_EXTRAS_TABLE,
    ...data,
    customLabels: {
      ...INITIAL_EXTRAS_TABLE.customLabels,
      ...(data.customLabels || {}),
    },
    qty: {
      ...INITIAL_EXTRAS_TABLE.qty,
      ...(data.qty || {}),
    },
    unitPrice: {
      ...INITIAL_EXTRAS_TABLE.unitPrice,
      ...(data.unitPrice || {}),
    },
    summary: {
      ...INITIAL_EXTRAS_TABLE.summary,
      ...(data.summary || {}),
    },
  };
}

export function computeExtrasTotals(data = {}) {
  const merged = mergeExtrasTable(data);
  const rowTotals = {};

  EXTRA_KEYS.forEach((key) => {
    rowTotals[key] = Number(merged.qty[key] || 0) * Number(merged.unitPrice[key] || 0);
  });

  const qtyPerOcc = EXTRA_LABOR_KEYS.reduce(
    (sum, key) => sum + Number(merged.qty[key] || 0),
    0
  );
  const dollarsPerOcc = EXTRA_KEYS.reduce(
    (sum, key) => sum + Number(rowTotals[key] || 0),
    0
  );
  const occurrences = Number(merged.occurrences || 0);
  const totalDollars = dollarsPerOcc * occurrences;

  return {
    rowTotals,
    qtyPerOcc,
    dollarsPerOcc,
    totalDollars,
  };
}
