
// =====================================
// springCalculations.js
// =====================================

export function computeSpringTotals({ qty, unitPrice, occurrences }) {
  const hoursPerOcc =
    Number(qty.MISC) +
    Number(qty.HAND) +
    Number(qty.EDGER) +
    Number(qty.BLOWER) +
    Number(qty.LEAF_TRUCK) +
    Number(qty.TRUCKSTER);

  const dollarsPerOcc =
    qty.MISC * unitPrice.MISC +
    qty.HAND * unitPrice.HAND +
    qty.EDGER * unitPrice.EDGER +
    qty.BLOWER * unitPrice.BLOWER +
    qty.LEAF_TRUCK * unitPrice.LEAF_TRUCK +
    qty.TRUCKSTER * unitPrice.TRUCKSTER;

  const totalDollars = dollarsPerOcc * occurrences;

  return {
    hoursPerOcc,
    dollarsPerOcc,
    totalDollars,
  };
}
