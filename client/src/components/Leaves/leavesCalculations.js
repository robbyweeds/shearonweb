import { DEFAULT_LEAVES_RATES, INITIAL_LEAVES_DATA, LEAVES_KEYS } from "./leavesDefaults";


export function mergeLeavesRates(rates = {}) {
  return {
    ...DEFAULT_LEAVES_RATES,
    ...rates,
    unitPrice: {
      ...DEFAULT_LEAVES_RATES.unitPrice,
      ...(rates.unitPrice || {}),
    },
    propertyTypes: {
      ...DEFAULT_LEAVES_RATES.propertyTypes,
      ...(rates.propertyTypes || {}),
    },
    occurrenceMultipliers: {
      ...DEFAULT_LEAVES_RATES.occurrenceMultipliers,
      ...(rates.occurrenceMultipliers || {}),
    },
  };
}

const roundToQuarter = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return 0;
  return Number((Math.round(num / 0.25) * 0.25).toFixed(2));
};

export function mergeLeavesData(data = {}) {
  return {
    ...INITIAL_LEAVES_DATA,
    ...data,
    qtyUnit: {
      ...INITIAL_LEAVES_DATA.qtyUnit,
      ...(data.qtyUnit || {}),
    },
    unitPrice: {
      ...INITIAL_LEAVES_DATA.unitPrice,
      ...(data.unitPrice || {}),
    },
    totals: {
      ...INITIAL_LEAVES_DATA.totals,
      ...(data.totals || {}),
    },
  };
}

export function computeLeavesTotals(data = {}, ratesInput = DEFAULT_LEAVES_RATES) {
  const rates = mergeLeavesRates(ratesInput);
  const merged = mergeLeavesData(data);
  const acres = Number(merged.acres || 0);
  const occurrences = Number(merged.occurrences || 0);
  const propertyRates = rates.propertyTypes[merged.propertyType] || rates.propertyTypes[INITIAL_LEAVES_DATA.propertyType];
  const multiplierKey = Math.min(Math.max(Math.round(occurrences || 1), 1), 4);
  const occurrenceMultiplier = Number(rates.occurrenceMultipliers[multiplierKey] || 1);

  const qtyUnit = {
    MISC: Number(merged.qtyUnit.MISC || 0),
    HAND: 0,
    BLOWER: 0,
    LEAF_TRUCK: 0,
  };

  if (acres > 0 && occurrences > 0) {
    ["HAND", "BLOWER", "LEAF_TRUCK"].forEach((key) => {
      qtyUnit[key] = roundToQuarter(
        (acres * Number(propertyRates[key] || 0) / occurrences) * occurrenceMultiplier
      );
    });
  }

  const rowTotals = {};
  LEAVES_KEYS.forEach((key) => {
    rowTotals[key] = Number(qtyUnit[key] || 0) * Number(merged.unitPrice[key] || 0);
  });

  const hoursPerOcc = LEAVES_KEYS.reduce(
    (sum, key) => sum + Number(qtyUnit[key] || 0),
    0
  );
  const dollarsPerOcc = LEAVES_KEYS.reduce(
    (sum, key) => sum + Number(rowTotals[key] || 0),
    0
  );
  const final = dollarsPerOcc * occurrences;
  const totalHours = hoursPerOcc * occurrences;

  return {
    qtyUnit,
    rowTotals,
    hoursPerOcc,
    dollarsPerOcc,
    final,
    totalHours,
    occurrenceMultiplier,
  };
}
