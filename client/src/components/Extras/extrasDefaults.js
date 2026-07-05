export const EXTRA_KEYS = ["MISC", "HAND", "SM_PWR", "SPECIALTY", "MATERIAL"];
export const EXTRA_LABOR_KEYS = ["MISC", "HAND", "SM_PWR"];

export const EXTRA_LABELS = {
  MISC: "Misc",
  HAND: "Hand",
  SM_PWR: "SM Pwr",
  SPECIALTY: "Specialty",
  MATERIAL: "Material",
};

export const INITIAL_EXTRAS_TABLE = {
  name: "Extras",
  occurrences: 0,
  customLabels: {
    SPECIALTY: "Specialty",
    MATERIAL: "Material",
  },
  qty: {
    MISC: 0,
    HAND: 0,
    SM_PWR: 0,
    SPECIALTY: 0,
    MATERIAL: 0,
  },
  unitPrice: {
    MISC: 51,
    HAND: 51,
    SM_PWR: 55,
    SPECIALTY: 60,
    MATERIAL: 0,
  },
  summary: {
    qtyPerOcc: 0,
    dollarsPerOcc: 0,
    totalDollars: 0,
  },
};
