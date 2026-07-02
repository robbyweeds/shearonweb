// myapp/client/src/components/Pruning/pruningDefaults.js

export const INITIAL_PRUNING_TABLE = {
  name: "",
  occurrences: 0,

  qty: {
    MISC: 0,
    HAND: 0,
    SHEARS: 0,
    CLEANUP: 0,
    CHAINSAW: 0,
  },

  unitPrice: {
    MISC: 51,
    HAND: 51,
    SHEARS: 55,
    CLEANUP: 51,
    CHAINSAW: 62,
  },

  summary: {
    hoursPerOcc: 0,
    dollarsPerOcc: 0,
    totalHours: 0,
    totalDollars: 0,
  }
};

export const DEFAULT_PRUNING_RATES = {
  MISC: 51,
  HAND: 51,
  SHEARS: 55,
  CLEANUP: 51,
  CHAINSAW: 62,
};
