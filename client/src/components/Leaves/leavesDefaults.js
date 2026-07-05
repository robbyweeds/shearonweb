export const LEAVES_KEYS = ["MISC", "HAND", "BLOWER", "LEAF_TRUCK"];

export const LEAVES_LABELS = {
  MISC: "MISC",
  HAND: "HAND",
  BLOWER: "BLOWER",
  LEAF_TRUCK: "LEAF TRK",
};

export const DEFAULT_LEAVES_RATES = {
  unitPrice: {
    MISC: 52,
    HAND: 52,
    BLOWER: 57,
    LEAF_TRUCK: 88,
  },
  propertyTypes: {
    "Open space/Light Cleanup": {
      HAND: 0.5,
      BLOWER: 3.5,
      LEAF_TRUCK: 0.75,
    },
    "Lightly Wooded Community": {
      HAND: 0.75,
      BLOWER: 5.5,
      LEAF_TRUCK: 1,
    },
    "Moderately Wooded Community": {
      HAND: 1,
      BLOWER: 6,
      LEAF_TRUCK: 1.25,
    },
    "Heavily Wooded": {
      HAND: 1.25,
      BLOWER: 6.5,
      LEAF_TRUCK: 1.5,
    },
  },
  occurrenceMultipliers: {
    1: 1,
    2: 1.05,
    3: 1.1,
    4: 1.2,
  },
};

export const INITIAL_LEAVES_DATA = {
  name: "Fall Cleanup",
  acres: 0,
  propertyType: "Open space/Light Cleanup",
  occurrences: 0,
  qtyUnit: {
    MISC: 0,
  },
  unitPrice: {
    ...DEFAULT_LEAVES_RATES.unitPrice,
  },
  totals: {},
};
