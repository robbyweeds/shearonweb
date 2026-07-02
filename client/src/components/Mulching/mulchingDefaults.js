// myapp/client/src/components/Mulching/mulchingDefaults.js

// --------------------------------------
// INITIAL TABLE STATE
// --------------------------------------
export const INITIAL_MULCHING_DATA = {
  summary: {},

  handCommonAreas: {
    area1: {
      sqft: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
    area2: {
      sqft: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
    area3: {
      sqft: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
  },

  handHomes: {
    home1: {
      sqftEach: "",
      count: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
    home2: {
      sqftEach: "",
      count: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
    home3: {
      sqftEach: "",
      count: "",
      efficiency: "Average",
      depth: '2"',
      proximity: "Close",
      hoursOverride: null,
      mulchOverride: null,
    },
  },

  smPwrCommon: {
    selection: "Average",
    hoursOverride: null,
  },

  loaderCommon: {
    selection: "Average",
    hoursOverride: null,
  },

  smPwrHomes: {
    selection: "Average",
    hoursOverride: null,
  },

  loaderHomes: {
    selection: "Average",
    hoursOverride: null,
  },
};

// --------------------------------------
// DEFAULT RATES — PERFECT MATCH TO EXCEL
// --------------------------------------
export const DEFAULT_MULCHING_RATES = {

  // Hand application efficiency (yards per man-hour)
  handEfficiency: {
    Slowest: 0.9,
    Slow: 1.1,
    Average: 1.4,
    Fast: 1.6,
    Fastest: 1.8,
  },

  // Proximity multipliers
  proximity: {
    Close: 1.0,
    Nearby: 1.1,
    Moderate: 1.2,
    Far: 1.3,
    Farthest: 1.4,
  },

  // Depth of mulch in inches
  depthInches: {
    Feather: 0.5,
    '1"': 1,
    '2"': 2,
  },

  // Sm Pwr production (man-hours per yard)
  smPowerManHours: {
    Minimum: 16,
    Less: 14,
    Average: 12,
    More: 10,
    Copious: 8,
  },

  // Loader production (man-hours per yard)
  loaderManHours: {
    Minimum: 20,
    Less: 18,
    Average: 16,
    More: 14,
    Copious: 12,
  },

  // Pricing defaults
  mulchPricePerYard: 28,
  handLaborRatePerHour: 50,
  smPwrRatePerHour: 55,
  loaderRatePerHour: 85,
};
