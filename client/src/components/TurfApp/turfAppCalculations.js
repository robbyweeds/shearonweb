import {
  DEFAULT_TURF_APP_RATES,
  TURF_DISPLAY_KEYS,
  TURF_LABOR_KEYS,
  TURF_MATERIAL_KEYS,
} from "./turfAppDefaults";

const roundToQuarter = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return 0;
  return Number((Math.round(num / 0.25) * 0.25).toFixed(2));
};

export function mergeTurfAppRates(rates = {}) {
  return {
    ...DEFAULT_TURF_APP_RATES,
    ...rates,
    dollars: {
      ...DEFAULT_TURF_APP_RATES.dollars,
      ...(rates.dollars || {}),
    },
    areaTypes: {
      ...DEFAULT_TURF_APP_RATES.areaTypes,
      ...(rates.areaTypes || {}),
    },
    acresPerHour: {
      ...DEFAULT_TURF_APP_RATES.acresPerHour,
      ...(rates.acresPerHour || {}),
    },
    handFactors: {
      ...DEFAULT_TURF_APP_RATES.handFactors,
      ...(rates.handFactors || {}),
    },
    materialAmounts: {
      ...DEFAULT_TURF_APP_RATES.materialAmounts,
      ...(rates.materialAmounts || {}),
    },
    fertilizerOptions: rates.fertilizerOptions || DEFAULT_TURF_APP_RATES.fertilizerOptions,
    equipmentMultiples: {
      fertilizer: {
        ...DEFAULT_TURF_APP_RATES.equipmentMultiples.fertilizer,
        ...(rates.equipmentMultiples?.fertilizer || {}),
      },
      broadleaf: {
        ...DEFAULT_TURF_APP_RATES.equipmentMultiples.broadleaf,
        ...(rates.equipmentMultiples?.broadleaf || {}),
      },
    },
  };
}

function applyManualOverride(key, autoValue, data) {
  const overrides = data.manualOverrides || {};
  const hasManual =
    Object.prototype.hasOwnProperty.call(overrides, key) && overrides[key] != null;
  const finalValue = hasManual ? Number(overrides[key]) : autoValue;
  return Number.isFinite(finalValue) ? finalValue : 0;
}

function computeEquipmentHours(key, base, data, qtyUnit, rates) {
  const normalApps =
    Number(qtyUnit.BARRICADE || 0) +
      Number(qtyUnit.TRIMEC || 0) +
      Number(qtyUnit.MERIT || 0) >
    0;
  const hasFert = Number(qtyUnit.FERTILIZER || 0) !== 0;
  const broadleafOnly =
    data.addBroadleaf &&
    Number(qtyUnit.BARRICADE || 0) +
      Number(qtyUnit.MERIT || 0) +
      Number(qtyUnit.FERTILIZER || 0) ===
      0;

  let result = base;

  if (hasFert) {
    const fertMultiple = rates.equipmentMultiples.fertilizer[key] || {};
    result = normalApps
      ? base + base * Number(fertMultiple.normalApps || 0)
      : base * Number(fertMultiple.fertOnly || 0);
  } else if (broadleafOnly) {
    result = base * Number(rates.equipmentMultiples.broadleaf[key] || 0);
  }

  return applyManualOverride(key, roundToQuarter(result), data);
}

export function computeTurfAppQuantities(data, ratesInput = {}) {
  const rates = mergeTurfAppRates(ratesInput);
  const acres = Number(data.acres || 0);
  const areaType = rates.areaTypes[data.propertyType] || rates.areaTypes["Choose Area Type"];
  const fertilizer =
    rates.fertilizerOptions.find((option) => option.name === data.fertilizerOption) ||
    rates.fertilizerOptions[0];

  const qtyUnit = {
    MISC: Number(data.qtyUnit?.MISC || 0),
    OTHER_MATERIAL: Number(data.qtyUnit?.OTHER_MATERIAL || 0),
    BARRICADE: acres * Number(data.addPreM ? rates.materialAmounts.BARRICADE?.yes : rates.materialAmounts.BARRICADE?.no),
    TRIMEC: acres * Number(data.addBroadleaf ? rates.materialAmounts.TRIMEC?.yes : rates.materialAmounts.TRIMEC?.no),
    MERIT: acres * Number(data.addGrub ? rates.materialAmounts.MERIT?.yes : rates.materialAmounts.MERIT?.no),
    FERTILIZER: data.addGranularFert ? acres * Number(fertilizer?.bagsPerAcre || 0) : 0,
  };

  const trucksterBase =
    Number(rates.acresPerHour.TRUCKSTER || 0) > 0
      ? (acres * Number(areaType?.truckster || 0)) / Number(rates.acresPerHour.TRUCKSTER || 0)
      : 0;
  const zmaxBase =
    Number(rates.acresPerHour.ZMAX || 0) > 0
      ? (acres * Number(areaType?.zmax || 0)) / Number(rates.acresPerHour.ZMAX || 0)
      : 0;
  const handBase = acres * Number(rates.handFactors[data.hand] || 0);

  qtyUnit.TRUCKSTER = computeEquipmentHours("TRUCKSTER", trucksterBase, data, qtyUnit, rates);
  qtyUnit.ZMAX = computeEquipmentHours("ZMAX", zmaxBase, data, qtyUnit, rates);
  qtyUnit.HAND = applyManualOverride("HAND", roundToQuarter(handBase), data);

  return qtyUnit;
}

export function computeTurfAppTotals(data, ratesInput = {}) {
  const rates = mergeTurfAppRates(ratesInput);
  const qtyUnit = computeTurfAppQuantities(data, rates);
  const fertilizer =
    rates.fertilizerOptions.find((option) => option.name === data.fertilizerOption) ||
    rates.fertilizerOptions[0];
  const dollars = {
    ...rates.dollars,
    FERTILIZER: Number(fertilizer?.price ?? rates.dollars.FERTILIZER ?? 0),
    OTHER_MATERIAL: Number(data.otherMaterialUnitPrice ?? rates.dollars.OTHER_MATERIAL ?? 0),
  };
  const rowTotals = {};

  TURF_DISPLAY_KEYS.forEach((key) => {
    rowTotals[key] = Number(qtyUnit[key] || 0) * Number(dollars[key] || 0);
  });

  const hoursPerOcc = TURF_LABOR_KEYS.reduce(
    (sum, key) => sum + Number(qtyUnit[key] || 0),
    0
  );

  const totalMat = TURF_MATERIAL_KEYS.reduce(
    (sum, key) => sum + Number(rowTotals[key] || 0),
    0
  );

  const totalOcc = TURF_DISPLAY_KEYS.reduce(
    (sum, key) => sum + Number(rowTotals[key] || 0),
    0
  );

  const numOccurrences = Number(data.summary?.numOccurrences || 0);
  const acres = Number(data.acres || 0);
  const final = totalOcc * numOccurrences;
  const totalHoursAllOcc = hoursPerOcc * numOccurrences;
  const pricePerAcre = acres > 0 ? final / acres : 0;

  return {
    qtyUnit,
    dollars,
    rowTotals,
    hoursPerOcc,
    totalMat,
    totalOcc,
    final,
    totalHoursAllOcc,
    pricePerAcre,
  };
}
