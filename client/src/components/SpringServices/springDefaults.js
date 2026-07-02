// =====================================
// springDefaults.js
// =====================================

// Default hourly rates for Spring Services
export const SPRING_DEFAULT_RATES = {
  MISC: 51,
  HAND: 51,
  EDGER: 55,
  BLOWER: 55,
  LEAF_TRUCK: 85,
  TRUCKSTER: 71,
};

// Default empty Spring Services table
export const INITIAL_SPRING_TABLE = {
  name: "",
  occurrences: 0,

  qty: {
    MISC: 0,
    HAND: 0,
    EDGER: 0,
    BLOWER: 0,
    LEAF_TRUCK: 0,
    TRUCKSTER: 0,
  },

  unitPrice: { ...SPRING_DEFAULT_RATES },

  summary: {
    hoursPerOcc: 0,
    dollarsPerOcc: 0,
    totalHours: 0,
    totalDollars: 0,
  },
};
