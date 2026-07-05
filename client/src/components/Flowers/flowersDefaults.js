export const FLOWER_KEYS = ["MISC", "HAND", "SM_PWR", "POTS", "KALE", "MUMS", "FLATS"];
export const FLOWER_LABOR_KEYS = ["MISC", "HAND", "SM_PWR"];

export const FLOWER_LABELS = {
  MISC: "Misc",
  HAND: "Hand",
  SM_PWR: "SM Pwr",
  POTS: "Pots",
  KALE: "Kale",
  MUMS: "Mums",
  FLATS: "Flats",
};

export const INITIAL_FLOWERS_TABLE = {
  name: "Flowers",
  occurrences: 0,
  customLabels: {
    POTS: "Pots",
    KALE: "Kale",
    MUMS: "Mums",
    FLATS: "Flats",
  },
  qty: {
    MISC: 0,
    HAND: 0,
    SM_PWR: 0,
    POTS: 0,
    KALE: 0,
    MUMS: 0,
    FLATS: 0,
  },
  unitPrice: {
    MISC: 51,
    HAND: 51,
    SM_PWR: 55,
    POTS: 15,
    KALE: 15,
    MUMS: 15,
    FLATS: 35,
  },
  summary: {
    qtyPerOcc: 0,
    dollarsPerOcc: 0,
    totalDollars: 0,
  },
};
