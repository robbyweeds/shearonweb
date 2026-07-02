// myapp/client/src/components/Mulching/mulchingCalculations.js

import { INITIAL_MULCHING_DATA } from "./mulchingDefaults";

/* ============================================================
   Currency Formatting
   ============================================================ */
export function formatCurrency(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ============================================================
   Deep Merge
   ============================================================ */
export function mergeMulchingData(raw) {
  const base = raw || {};

  const BASE_INITIAL = {
    ...INITIAL_MULCHING_DATA,

    smPwrCommon: {
      selection: "Average",
      hoursOverride: null,
      ...(INITIAL_MULCHING_DATA.smPwrCommon || {}),
    },
    loaderCommon: {
      selection: "Average",
      hoursOverride: null,
      ...(INITIAL_MULCHING_DATA.loaderCommon || {}),
    },
    smPwrHomes: {
      selection: "Average",
      hoursOverride: null,
      ...(INITIAL_MULCHING_DATA.smPwrHomes || {}),
    },
    loaderHomes: {
      selection: "Average",
      hoursOverride: null,
      ...(INITIAL_MULCHING_DATA.loaderHomes || {}),
    },
  };

  const rawCommon = base.handCommonAreas || {};
  const rawHomes = base.handHomes || {};

  return {
    ...BASE_INITIAL,
    ...base,

    summary: {
      ...BASE_INITIAL.summary,
      ...(base.summary || {}),
    },

    handCommonAreas: {
      ...BASE_INITIAL.handCommonAreas,
      ...rawCommon,
      area1: { ...BASE_INITIAL.handCommonAreas.area1, ...(rawCommon.area1 || {}) },
      area2: { ...BASE_INITIAL.handCommonAreas.area2, ...(rawCommon.area2 || {}) },
      area3: { ...BASE_INITIAL.handCommonAreas.area3, ...(rawCommon.area3 || {}) },
    },

    handHomes: {
      ...BASE_INITIAL.handHomes,
      ...rawHomes,
      home1: { ...BASE_INITIAL.handHomes.home1, ...(rawHomes.home1 || {}) },
      home2: { ...BASE_INITIAL.handHomes.home2, ...(rawHomes.home2 || {}) },
      home3: { ...BASE_INITIAL.handHomes.home3, ...(rawHomes.home3 || {}) },
    },

    smPwrCommon: {
      ...BASE_INITIAL.smPwrCommon,
      ...(base.smPwrCommon || {}),
    },
    loaderCommon: {
      ...BASE_INITIAL.loaderCommon,
      ...(base.loaderCommon || {}),
    },
    smPwrHomes: {
      ...BASE_INITIAL.smPwrHomes,
      ...(base.smPwrHomes || {}),
    },
    loaderHomes: {
      ...BASE_INITIAL.loaderHomes,
      ...(base.loaderHomes || {}),
    },
  };
}

/* ============================================================
   Helpers
   ============================================================ */

function getRate(table, key, fallback = 0) {
  if (!table) return fallback;
  if (table[key] !== undefined) return table[key];
  return fallback;
}

// Excel mulch formula
function computeMulchYards(sqft, depthInches) {
  if (!sqft || !depthInches) return 0;
  const raw = (sqft * (depthInches / 12)) / 27;
  return Math.ceil(raw);
}

/* ============================================================
   Common Areas (Excel logic)
   ============================================================ */

export function computeCommonAreaValues(area, mulchingRates) {
  if (!mulchingRates) return { hours: 0, mulch: 0 };

  const sqft = Number(area.sqft) || 0;
  if (sqft <= 0) return { hours: 0, mulch: 0 };

  // Pull correct rates
  const handEff = getRate(mulchingRates.handEfficiency, area.efficiency, 0);
  const proximity = getRate(mulchingRates.proximity, area.proximity, 1);
  const depthInches = getRate(mulchingRates.depthInches, area.depth, 0);

  // MULCH
  const mulch = computeMulchYards(sqft, depthInches);

  // HOURS (Excel)
  let hours = 0;
  if (handEff > 0) hours = (mulch / handEff) * proximity;

  return { hours, mulch };
}

/* ============================================================
   Homes (Excel logic)
   ============================================================ */

export function computeHomeValues(home, mulchingRates) {
  if (!mulchingRates) return { hours: 0, mulch: 0, totalSqft: 0 };

  const sqftEach = Number(home.sqftEach) || 0;
  const count = Number(home.count) || 0;

  if (sqftEach <= 0 || count <= 0)
    return { hours: 0, mulch: 0, totalSqft: 0 };

  const totalSqft = sqftEach * count;

  // Pull correct rates
  const handEff = getRate(mulchingRates.handEfficiency, home.efficiency, 0);
  const proximity = getRate(mulchingRates.proximity, home.proximity, 1);
  const depthInches = getRate(mulchingRates.depthInches, home.depth, 0);

  // MULCH
  const mulch = computeMulchYards(totalSqft, depthInches);

  // HOURS
  let hours = 0;
  if (handEff > 0) hours = (mulch / handEff) * proximity;

  return { hours, mulch, totalSqft };
}
