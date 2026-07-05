export const TURF_LABOR_KEYS = ["MISC", "TRUCKSTER", "ZMAX", "HAND"];
export const TURF_MATERIAL_KEYS = [
  "BARRICADE",
  "TRIMEC",
  "MERIT",
  "FERTILIZER",
  "OTHER_MATERIAL",
];

export const TURF_DISPLAY_KEYS = [...TURF_LABOR_KEYS, ...TURF_MATERIAL_KEYS];

export const TURF_COLUMNS = [
  { key: "MISC", label: "MISC", unit: "HRS", manual: true },
  { key: "TRUCKSTER", label: "TRUCKSTER", unit: "HRS" },
  { key: "ZMAX", label: "Z-MAX", unit: "HRS" },
  { key: "HAND", label: "Hand/Spreader/Blower", unit: "Hrs" },
  { key: "BARRICADE", label: "BARRICADE", unit: "OZ." },
  { key: "TRIMEC", label: "TRIMEC", unit: "GALS" },
  { key: "MERIT", label: "Merit", unit: "oz" },
  { key: "FERTILIZER", label: "Fertilizer", unit: "Bags" },
  { key: "OTHER_MATERIAL", label: "Other Material", unit: "UNIT", manual: true, editableLabel: true },
];

export const DEFAULT_TURF_APP_RATES = {
  dollars: {
    MISC: 52,
    TRUCKSTER: 109,
    ZMAX: 104,
    HAND: 59,
    BARRICADE: 1.75,
    TRIMEC: 49.18,
    MERIT: 2.73,
    FERTILIZER: 30.6,
    OTHER_MATERIAL: 0,
  },
  areaTypes: {
    "Choose Area Type": { truckster: 0, zmax: 0, hand: 0 },
    "Open Field/All Truckster": { truckster: 1, zmax: 0, hand: 0 },
    "Homes w/ Open Space": { truckster: 0.55, zmax: 0.45, hand: 0.05 },
    "Homes w/ Small Open Space": { truckster: 0.33, zmax: 0.67, hand: 0.05 },
    "All Z Spray": { truckster: 0, zmax: 1, hand: 0.05 },
  },
  acresPerHour: {
    TRUCKSTER: 1.3,
    ZMAX: 0.5,
  },
  handFactors: {
    None: 0,
    Minimal: 0.1,
    Medium: 0.2,
    Substantial: 0.3,
  },
  materialAmounts: {
    BARRICADE: { yes: 24, no: 0 },
    TRIMEC: { yes: 0.5, no: 0 },
    MERIT: { yes: 24, no: 0 },
  },
  fertilizerOptions: [
    { name: "18%N at 0.5lbs", product: "18-0-5", price: 30.6, bagsPerAcre: 2.42 },
    { name: "18%N at 0.75lbs", product: "18-0-5", price: 30.6, bagsPerAcre: 3.63 },
    { name: "18%N at 1lb", product: "18-0-5", price: 30.6, bagsPerAcre: 4.83 },
    { name: "25%N at 0.5lbs", product: "25-0-5", price: 33.88, bagsPerAcre: 1.74 },
    { name: "25%N at 0.75lbs", product: "25-0-5", price: 33.88, bagsPerAcre: 2.61 },
    { name: "25%N at 1lb", product: "25-0-5", price: 33.88, bagsPerAcre: 3.48 },
    { name: "46%N at 0.5lbs", product: "46-0-0", price: 31.69, bagsPerAcre: 0.95 },
    { name: "46%N at .75lbs", product: "46-0-0", price: 31.69, bagsPerAcre: 1.42 },
    { name: "46%N at 1lb", product: "46-0-0", price: 31.69, bagsPerAcre: 1.89 },
    { name: "46%N at 1.5lb", product: "46-0-0", price: 31.69, bagsPerAcre: 2.84 },
    { name: "46%N at 2lb", product: "46-0-0", price: 31.69, bagsPerAcre: 3.78 },
  ],
  equipmentMultiples: {
    fertilizer: {
      TRUCKSTER: { normalApps: 1.8, fertOnly: 0.7 },
      ZMAX: { normalApps: 1.8, fertOnly: 0.7 },
      HAND: { normalApps: 1.7, fertOnly: 0.8 },
    },
    broadleaf: {
      TRUCKSTER: 1.2,
      ZMAX: 1.2,
      HAND: 1.2,
    },
  },
};

export const INITIAL_TURF_APP_DATA = {
  name: "Turf Application",
  acres: 0,
  propertyType: "Choose Area Type",
  hand: "None",
  addPreM: false,
  addBroadleaf: false,
  addGrub: false,
  addGranularFert: false,
  fertilizerOption: "18%N at 0.5lbs",
  otherMaterialName: "Other Material",
  otherMaterialUnitPrice: 0,
  qtyUnit: {
    MISC: 0,
    OTHER_MATERIAL: 0,
  },
  manualOverrides: {
    TRUCKSTER: null,
    ZMAX: null,
    HAND: null,
  },
  summary: {
    numOccurrences: 0,
  },
  totals: {},
};
