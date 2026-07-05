// myapp/client/src/components/Mulching/mulchingCalculations.js

import { DEFAULT_MULCHING_RATES, INITIAL_MULCHING_DATA, MULCH_AREA_KEYS, MULCH_SECTION_KEYS } from "./mulchingDefaults";
export { formatCurrency } from "../../utils/formatters";

const round1 = (value) => Number((Math.round(Number(value || 0) * 10) / 10).toFixed(1));
const round2 = (value) => Number(Number(value || 0).toFixed(2));

function computeLoaderHours(loaderDays) {
  const roundedDays = round2(loaderDays);
  return roundedDays === 0 ? 0 : round2((8 * roundedDays) + 2);
}

export function mergeMulchingRates(rates = {}) {
  return {
    ...DEFAULT_MULCHING_RATES,
    ...rates,
    dollars: { ...DEFAULT_MULCHING_RATES.dollars, ...(rates.dollars || {}) },
    handEfficiency: { ...DEFAULT_MULCHING_RATES.handEfficiency, ...(rates.handEfficiency || {}) },
    treeRingSize: { ...DEFAULT_MULCHING_RATES.treeRingSize, ...(rates.treeRingSize || {}) },
    treeEfficiency: { ...DEFAULT_MULCHING_RATES.treeEfficiency, ...(rates.treeEfficiency || {}) },
    treeDepth: { ...DEFAULT_MULCHING_RATES.treeDepth, ...(rates.treeDepth || {}) },
    depthInches: { ...DEFAULT_MULCHING_RATES.depthInches, ...(rates.depthInches || {}) },
    smPowerManHours: { ...DEFAULT_MULCHING_RATES.smPowerManHours, ...(rates.smPowerManHours || {}) },
    loaderManHours: { ...DEFAULT_MULCHING_RATES.loaderManHours, ...(rates.loaderManHours || {}) },
    proximity: { ...DEFAULT_MULCHING_RATES.proximity, ...(rates.proximity || {}) },
    finnEfficiency: { ...DEFAULT_MULCHING_RATES.finnEfficiency, ...(rates.finnEfficiency || {}) },
    finnDepth: { ...DEFAULT_MULCHING_RATES.finnDepth, ...(rates.finnDepth || {}) },
    finnHelper: { ...DEFAULT_MULCHING_RATES.finnHelper, ...(rates.finnHelper || {}) },
  };
}

export function mergeMulchingData(raw = {}) {
  const base = raw || {};
  const sections = {};

  MULCH_SECTION_KEYS.forEach((sectionKey) => {
    const initialSection = INITIAL_MULCHING_DATA.sections[sectionKey];
    const savedSection = base.sections?.[sectionKey] || {};
    const areas = {};

    MULCH_AREA_KEYS.forEach((areaKey) => {
      areas[areaKey] = {
        ...initialSection.areas[areaKey],
        ...(savedSection.areas?.[areaKey] || {}),
      };
    });

    sections[sectionKey] = {
      ...initialSection,
      ...savedSection,
      areas,
    };
  });

  return {
    ...INITIAL_MULCHING_DATA,
    ...base,
    occurrences: Number(base.occurrences ?? base.summary?.numOccurrences ?? INITIAL_MULCHING_DATA.occurrences),
    sections,
  };
}

function mulchYardsFromSqft(sqft, coveragePercent, depthInches) {
  const sqftNum = Number(sqft || 0);
  const coverage = Number(coveragePercent || 0) / 100;
  const depth = Number(depthInches || 0);
  if (sqftNum <= 0 || coverage <= 0 || depth <= 0) return 0;
  return round1(((sqftNum * coverage) * (depth / 12)) / 27);
}

function computeHandArea(area, rates) {
  const depth = Number(rates.depthInches[area.depth] || 0);
  const mulch = mulchYardsFromSqft(area.sqft, area.coverage, depth);
  const efficiency = Number(rates.handEfficiency[area.efficiency] || 0);
  const proximity = Number(rates.proximity[area.proximity] || 1);
  const hours = efficiency > 0 ? (mulch / efficiency) * proximity : 0;
  return { mulch, hours: round2(hours), sqft: Number(area.sqft || 0) };
}

function computeHomeArea(area, rates) {
  const totalSqft = Number(area.sqftEach || 0) * Number(area.count || 0);
  return { ...computeHandArea({ ...area, sqft: totalSqft }, rates), sqft: totalSqft };
}

function computeTreeArea(area, rates) {
  const qty = Number(area.qty || 0);
  const diameter = Number(rates.treeRingSize[area.diameter] || 0);
  const sqft = qty * Math.PI * Math.pow(diameter / 2, 2);
  const depth = Number(rates.treeDepth[area.depth] || 0);
  const mulch = mulchYardsFromSqft(sqft, 100, depth);
  const efficiency = Number(rates.treeEfficiency[area.efficiency] || 0);
  const hours = efficiency > 0 ? mulch / efficiency : 0;
  return { mulch, hours: round2(hours), sqft: round2(sqft) };
}

function computeFinnArea(area, rates) {
  const depth = Number(rates.finnDepth[area.depth] || rates.depthInches[area.depth] || 0);
  const mulch = mulchYardsFromSqft(area.sqft, area.coverage, depth);
  const efficiency = Number(rates.finnEfficiency[area.efficiency] || 0);
  const hours = efficiency > 0 ? mulch / efficiency : 0;
  return { mulch, hours: round2(hours), sqft: Number(area.sqft || 0) };
}

export function computeMulchingSection(sectionKey, section, ratesInput = {}) {
  const rates = mergeMulchingRates(ratesInput);
  const areaTotals = {};
  let areaHours = 0;
  let mulchYards = 0;

  MULCH_AREA_KEYS.forEach((areaKey) => {
    const area = section.areas[areaKey];
    let computed;
    if (sectionKey === "homes") computed = computeHomeArea(area, rates);
    else if (sectionKey === "trees") computed = computeTreeArea(area, rates);
    else if (sectionKey === "finn") computed = computeFinnArea(area, rates);
    else computed = computeHandArea(area, rates);

    areaTotals[areaKey] = computed;
    areaHours += computed.hours;
    mulchYards += computed.mulch;
  });

  const miscHours = Number(section.miscHours || 0);
  const loaderDays = Number(section.loaderHours || 0);
  const loaderHours = computeLoaderHours(loaderDays);
  const extraKey = sectionKey === "finn" ? "HELPER" : "SM_PWR";
  const extraRateKey = sectionKey === "finn" ? "HELPER" : "SM_PWR";
  let extraHours = 0;

  if (sectionKey === "finn") {
    const helperFactor = Number(rates.finnHelper[section.helper] || 0);
    extraHours = areaHours * helperFactor;
  } else {
    const smPwrRate = Number(rates.smPowerManHours[section.smPwr] || 0);
    extraHours = smPwrRate > 0 ? areaHours / smPwrRate : 0;
  }

  const hoursPerOcc = miscHours + areaHours + extraHours + loaderHours;
  const laborRate = sectionKey === "finn" ? rates.dollars.FINN : rates.dollars.HAND;

  const rowTotals = {
    MISC: miscHours * Number(rates.dollars.MISC || 0),
    area1: areaTotals.area1.hours * Number(laborRate || 0),
    area2: areaTotals.area2.hours * Number(laborRate || 0),
    area3: areaTotals.area3.hours * Number(laborRate || 0),
    [extraKey]: extraHours * Number(rates.dollars[extraRateKey] || 0),
    LOADER: loaderHours * Number(rates.dollars.LOADER || 0),
    MULCH: mulchYards * Number(rates.dollars.MULCH || 0),
  };

  const totalMat = rowTotals.MULCH;
  const totalOcc = Object.values(rowTotals).reduce((sum, value) => sum + Number(value || 0), 0);

  return {
    areaTotals,
    miscHours,
    areaHours: round2(areaHours),
    extraKey,
    extraHours: round2(extraHours),
    loaderDays,
    loaderHours,
    mulchYards: round1(mulchYards),
    hoursPerOcc: round2(hoursPerOcc),
    rowTotals,
    totalMat,
    totalOcc,
    pricePerYard: mulchYards > 0 ? totalOcc / mulchYards : null,
  };
}

export function computeMulchingTotals(dataInput = {}, ratesInput = {}) {
  const data = mergeMulchingData(dataInput);
  const rates = mergeMulchingRates(ratesInput);
  const sections = {};

  MULCH_SECTION_KEYS.forEach((sectionKey) => {
    sections[sectionKey] = computeMulchingSection(sectionKey, data.sections[sectionKey], rates);
  });

  const occurrences = Number(data.occurrences || 0);
  const totalOcc = Object.values(sections).reduce((sum, section) => sum + section.totalOcc, 0);
  const hoursPerOcc = Object.values(sections).reduce((sum, section) => sum + section.hoursPerOcc, 0);
  const mulchYards = Object.values(sections).reduce((sum, section) => sum + section.mulchYards, 0);

  return {
    sections,
    occurrences,
    totalOcc,
    totalPrice: totalOcc * occurrences,
    hoursPerOcc,
    totalHours: hoursPerOcc * occurrences,
    mulchYards: round1(mulchYards),
    pricePerYard: mulchYards > 0 ? totalOcc / mulchYards : null,
  };
}
