import { FLOWER_KEYS, FLOWER_LABOR_KEYS, INITIAL_FLOWERS_TABLE } from "./flowersDefaults";

export function mergeFlowersTable(data = {}) {
  return {
    ...INITIAL_FLOWERS_TABLE,
    ...data,
    customLabels: {
      ...INITIAL_FLOWERS_TABLE.customLabels,
      ...(data.customLabels || {}),
    },
    qty: {
      ...INITIAL_FLOWERS_TABLE.qty,
      ...(data.qty || {}),
    },
    unitPrice: {
      ...INITIAL_FLOWERS_TABLE.unitPrice,
      ...(data.unitPrice || {}),
    },
    summary: {
      ...INITIAL_FLOWERS_TABLE.summary,
      ...(data.summary || {}),
    },
  };
}

export function computeFlowersTotals(data = {}) {
  const merged = mergeFlowersTable(data);
  const rowTotals = {};

  FLOWER_KEYS.forEach((key) => {
    rowTotals[key] = Number(merged.qty[key] || 0) * Number(merged.unitPrice[key] || 0);
  });

  const qtyPerOcc = FLOWER_LABOR_KEYS.reduce(
    (sum, key) => sum + Number(merged.qty[key] || 0),
    0
  );
  const dollarsPerOcc = FLOWER_KEYS.reduce(
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
