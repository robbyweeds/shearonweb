// myapp/client/src/components/Pruning/pruningCalculations.js

import { DEFAULT_PRUNING_RATES } from "./pruningDefaults";

/**
 * Compute pruning totals for a single table.
 *
 * data = {
 *   qty: { MISC, HAND, SHEARS, CLEANUP, CHAINSAW },
 *   unitPrice: { MISC, HAND, SHEARS, CLEANUP, CHAINSAW },
 *   occurrences: number
 * }
 *
 * overrideRates (optional) lets you pass in global pruningRates to override unit prices.
 */
export function computePruningTotals(data = {}, overrideRates) {
  const qty = data.qty || {};
  const occ = Number(data.occurrences) || 0;

  const baseRates = data.unitPrice || {};
  const rates = {
    ...DEFAULT_PRUNING_RATES,
    ...baseRates,
    ...(overrideRates || {}),
  };

  const keys = ["MISC", "HAND", "SHEARS", "CLEANUP", "CHAINSAW"];

  // Total hours per occurrence = sum of all hours columns
  const hoursPerOcc = keys.reduce((sum, k) => {
    const q = Number(qty[k]) || 0;
    return sum + q;
  }, 0);

  // Dollars per occurrence = Σ (hours * rate)
  const dollarsPerOcc = keys.reduce((sum, k) => {
    const q = Number(qty[k]) || 0;
    const r = Number(rates[k]) || 0;
    return sum + q * r;
  }, 0);

  const finalTotal = dollarsPerOcc * occ;

  return {
    hoursPerOcc,
    dollarsPerOcc,
    finalTotal,
  };
}
