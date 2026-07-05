export const SPRING_CLEANUP_TABLES = {
  cleanup: {
    title: "Spring Clean Up",
    keys: ["MISC", "HAND", "BLOWER", "SM_PWR", "LEAF_TRUCK"],
    labels: {
      MISC: "MISC",
      HAND: "HAND",
      BLOWER: "BLOWER",
      SM_PWR: "SmPwr",
      LEAF_TRUCK: "LEAF TRK",
    },
    units: {
      MISC: "HRS",
      HAND: "HRS",
      BLOWER: "HRS",
      SM_PWR: "HRS",
      LEAF_TRUCK: "HRS",
    },
    hourKeys: ["MISC", "HAND", "BLOWER", "SM_PWR", "LEAF_TRUCK"],
    materialKeys: [],
    rates: {
      MISC: 52,
      HAND: 52,
      BLOWER: 57,
      SM_PWR: 57,
      LEAF_TRUCK: 88,
    },
  },
  bedCutOut: {
    title: "Spring Bed Cut Out",
    keys: ["MISC", "HAND", "EDGER", "SM_PWR", "TRUCKSTER"],
    labels: {
      MISC: "MISC",
      HAND: "HAND",
      EDGER: "EDGER",
      SM_PWR: "SmPwr",
      TRUCKSTER: "Truckster",
    },
    units: {
      MISC: "HRS",
      HAND: "HRS",
      EDGER: "HRS",
      SM_PWR: "HRS",
      TRUCKSTER: "HRS",
    },
    hourKeys: ["MISC", "HAND", "EDGER", "SM_PWR", "TRUCKSTER"],
    materialKeys: [],
    rates: {
      MISC: 52,
      HAND: 52,
      EDGER: 57,
      SM_PWR: 57,
      TRUCKSTER: 109,
    },
  },
  bedPreM: {
    title: "Bed Pre-M",
    keys: ["MISC", "TRUCKSTER", "HAND", "BED_FERT", "REGALSTAR"],
    labels: {
      MISC: "MISC",
      TRUCKSTER: "Truckster",
      HAND: "HAND",
      BED_FERT: "Bed Fert",
      REGALSTAR: "REGALSTAR",
    },
    units: {
      MISC: "HRS",
      TRUCKSTER: "HRS",
      HAND: "HRS",
      BED_FERT: "Bag",
      REGALSTAR: "Bag",
    },
    hourKeys: ["MISC", "TRUCKSTER", "HAND"],
    materialKeys: ["BED_FERT", "REGALSTAR"],
    rates: {
      MISC: 52,
      TRUCKSTER: 109,
      HAND: 52,
      BED_FERT: 109.28,
      REGALSTAR: 185.78,
    },
  },
  bedFertilizer: {
    title: "Bed Fertilizer",
    keys: ["MISC", "TRUCKSTER", "HAND", "BED_FERT", "REGALSTAR"],
    labels: {
      MISC: "MISC",
      TRUCKSTER: "Truckster",
      HAND: "HAND",
      BED_FERT: "Bed Fert",
      REGALSTAR: "REGALSTAR",
    },
    units: {
      MISC: "HRS",
      TRUCKSTER: "HRS",
      HAND: "HRS",
      BED_FERT: "Bag",
      REGALSTAR: "Bag",
    },
    hourKeys: ["MISC", "TRUCKSTER", "HAND"],
    materialKeys: ["BED_FERT", "REGALSTAR"],
    rates: {
      MISC: 52,
      TRUCKSTER: 109,
      HAND: 52,
      BED_FERT: 109.28,
      REGALSTAR: 185.78,
    },
  },
};

export const SPRING_CLEANUP_EXTRA_TABLE_TYPE = "bedFertilizer";

export const buildSpringCleanupTable = (definition) => ({
  occurrences: 0,
  qty: Object.fromEntries(definition.keys.map((key) => [key, 0])),
  unitPrice: { ...definition.rates },
  totals: {},
});

export const INITIAL_SPRING_CLEANUP_DATA = {
  tables: Object.fromEntries(
    Object.entries(SPRING_CLEANUP_TABLES).map(([tableKey, definition]) => [
      tableKey,
      buildSpringCleanupTable(definition),
    ])
  ),
};
