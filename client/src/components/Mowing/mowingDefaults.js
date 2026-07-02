// =====================================
// mowingDefaults.js — FINAL FIXED VERSION
// =====================================

// -----------------------------
// Efficiency dropdown options
// -----------------------------
export const EFFICIENCY_OPTIONS = [
  "OBSTACLES",
  "HOA_HOMES",
  "AVERAGE",
  "OPEN_LAWN",
  "FIELDS",
  "MONTHLY",
  "DOUBLE_CUT",
];

export const SMPWR_EFFICIENCY_OPTIONS = [
  "MINIMUM",
  "LESS",
  "AVERAGE",
  "HOA_HOMES",
  "HIGH_END_DETAILING",
];

// -----------------------------
// Deck mowing keys
// -----------------------------
export const DECK_KEYS = [
  "72-area1",
  "72-area2",
  "60-area1",
  "60-area2",
  "48-area1",
  "48-area2",
];

// -----------------------------
// Small power keys
// -----------------------------
export const SMPWR_KEYS = ["TRIMMER", "BLOWER"];
export const ROTARY_KEY = "ROTARY";

// -----------------------------
// Order used for displaying & totals
// -----------------------------
export const DISPLAY_KEYS = [
  "MISC_HRS",
  ...DECK_KEYS,
  ...SMPWR_KEYS,
  ROTARY_KEY,
  "5111",
];

// -----------------------------
// Initial Mowing Table Defaults
// -----------------------------
export const INITIAL_MOWING_DATA = {
  name: "Mowing Area",

  // -----------------------------
  // Efficiency selections
  // -----------------------------
  selectedEfficiency: {
    "72-area1": "AVERAGE",
    "72-area2": "AVERAGE",
    "60-area1": "AVERAGE",
    "60-area2": "AVERAGE",
    "48-area1": "AVERAGE",
    "48-area2": "AVERAGE",
    TRIMMER: "AVERAGE",
    BLOWER: "AVERAGE",
  },

  // -----------------------------
  // Acres (input)
  // -----------------------------
  acres: {
    "72-area1": 0,
    "72-area2": 0,
    "60-area1": 0,
    "60-area2": 0,
    "48-area1": 0,
    "48-area2": 0,
    TRIMMER: 0,
    BLOWER: 0,
    ROTARY: 0,
  },

  // -----------------------------
  // Qty/Unit (hours)
  // -----------------------------
  qtyUnit: {
    MISC_HRS: 0,
    "72-area1": 0,
    "72-area2": 0,
    "60-area1": 0,
    "60-area2": 0,
    "48-area1": 0,
    "48-area2": 0,
    TRIMMER: 0,
    BLOWER: 0,
    ROTARY: 0,
    "5111": 0,
  },

  // -----------------------------
  // Manual overrides
  // MUST include TRIMMER + BLOWER
  // -----------------------------
  manualOverrides: {
    "72-area1": null,
    "72-area2": null,
    "60-area1": null,
    "60-area2": null,
    "48-area1": null,
    "48-area2": null,

    TRIMMER: null,
    BLOWER: null,
  },

  // -----------------------------
  // Summary
  // -----------------------------
  summary: {
    adjPercent: 0,
    numOccurrences: 0,
  },

  totals: {},
};
