// myapp/client/src/components/Mulching/mulchingDefaults.js

export const MULCH_SECTION_KEYS = ["common", "homes", "trees", "finn"];
export const MULCH_AREA_KEYS = ["area1", "area2", "area3"];

export const DEFAULT_MULCHING_RATES = {
  dollars: {
    MISC: 52,
    HAND: 52,
    FINN: 97,
    SM_PWR: 57,
    HELPER: 52,
    LOADER: 88,
    MULCH: 31.22,
  },
  handEfficiency: {
    Slowest: 1.05,
    Slow: 1.15,
    Average: 1.25,
    Fast: 1.35,
    Fastest: 1.45,
  },
  treeRingSize: {
    "Dia - 3'": 3,
    "Dia - 4'": 4,
    "Dia - 5'": 5,
    "Dia - 6'": 6,
  },
  treeEfficiency: {
    Slowest: 0.4,
    Slow: 0.5,
    Average: 0.55,
    Fast: 0.6,
    Fastest: 0.7,
  },
  treeDepth: {
    Feather: 0.5,
    '1"': 1,
    '1.5"': 1.5,
    '2"': 2,
  },
  depthInches: {
    Feather: 0.5,
    '1"': 1,
    '1.5"': 1.5,
    '2"': 2,
  },
  smPowerManHours: {
    Minimum: 22,
    Less: 20,
    Average: 18,
    More: 16,
    Copious: 14,
  },
  loaderManHours: {
    0: 20,
    0.5: 18,
    1: 16,
    2: 14,
    3: 12,
    4: 12,
    5: 12,
    6: 12,
    7: 12,
    8: 12,
    9: 12,
  },
  proximity: {
    Close: 1,
    Nearby: 1.1,
    Moderate: 1.2,
    Far: 1.3,
    Farthest: 1.4,
  },
  finnEfficiency: {
    "Finn Slowest": 4,
    "Finn Slow": 4.5,
    "Finn Avg": 5,
    "Finn Fast": 5.5,
    "Finn Fastest": 6,
  },
  finnDepth: {
    '0.5"': 0.5,
    '0.75"': 0.75,
    '1"': 1,
    '1.5"': 1.5,
    '2"': 2,
  },
  finnHelper: {
    Little: 0.75,
    Less: 0.9,
    Average: 1,
    "More Help": 1.1,
    Copious: 1.25,
  },
};

const emptyArea = {
  sqft: 0,
  efficiency: "Average",
  coverage: 100,
  depth: '1"',
  proximity: "Close",
};

const emptyHome = {
  sqftEach: 0,
  count: 1,
  efficiency: "Average",
  coverage: 100,
  depth: '1"',
  proximity: "Close",
};

const emptyTree = {
  qty: 0,
  diameter: "Dia - 4'",
  depth: '1"',
  efficiency: "Average",
};

const emptyFinn = {
  sqft: 0,
  efficiency: "Finn Avg",
  coverage: 100,
  depth: '1"',
  proximity: "Close",
};

export const INITIAL_MULCHING_DATA = {
  name: "Mulch",
  occurrences: 0,
  sections: {
    common: {
      title: "Hand - Common Areas - Sq/ft",
      miscHours: 0,
      smPwr: "Average",
      loaderHours: 0,
      areas: {
        area1: { ...emptyArea },
        area2: { ...emptyArea },
        area3: { ...emptyArea },
      },
    },
    homes: {
      title: "Hand - Homes - # of Homes",
      miscHours: 0,
      smPwr: "Average",
      loaderHours: 0,
      areas: {
        area1: { ...emptyHome },
        area2: { ...emptyHome },
        area3: { ...emptyHome },
      },
    },
    trees: {
      title: "Trees - # of Trees",
      miscHours: 0,
      smPwr: "Average",
      loaderHours: 0,
      areas: {
        area1: { ...emptyTree },
        area2: { ...emptyTree },
        area3: { ...emptyTree },
      },
    },
    finn: {
      title: "Finn - Sq/ft",
      miscHours: 0,
      helper: "Average",
      loaderHours: 0,
      areas: {
        area1: { ...emptyFinn },
        area2: { ...emptyFinn },
        area3: { ...emptyFinn },
      },
    },
  },
  totals: {},
};
