// =====================================
// ServiceContext.jsx — FINAL FIXED VERSION
// =====================================

import React, { createContext, useContext, useState } from "react";

const ServiceContext = createContext(null);

export function ServiceProvider({ children }) {

  // ----------------------------------------
  // MOWING FACTORS (ALL DEFAULTS)
  // ----------------------------------------
  const DEFAULT_MOWING_FACTORS = {
    acresPerHour: {
      "72": {
        OBSTACLES: 0.65,
        HOA_HOMES: 0.85,
        AVERAGE: 0.95,
        OPEN_LAWN: 1.3,
        FIELDS: 1.45,
        MONTHLY: 0.6,
        DOUBLE_CUT: 0.7,
      },
      "60": {
        OBSTACLES: 0.6,
        HOA_HOMES: 0.75,
        AVERAGE: 0.85,
        OPEN_LAWN: 1.0,
        FIELDS: 1.25,
        MONTHLY: 0.55,
        DOUBLE_CUT: 0.7,
      },
      "48": {
        OBSTACLES: 0.4,
        HOA_HOMES: 0.6,
        AVERAGE: 0.65,
        OPEN_LAWN: 0.75,
        FIELDS: 0.9,
        MONTHLY: 0.35,
        DOUBLE_CUT: 0.45,
      },
    },

    smPwrEfficiency: {
      TRIMMER: {
        MINIMUM: 0.75,
        LESS: 0.85,
        AVERAGE: 0.95,
        HOA_HOMES: 1.05,
        HIGH_END_DETAILING: 1.35,
      },
      BLOWER: {
        MINIMUM: 0.2,
        LESS: 0.3,
        AVERAGE: 0.35,
        HOA_HOMES: 0.45,
        HIGH_END_DETAILING: 0.55,
      },
    },

    smPwrAllocation: {
      TRIMMER: { "72": 0.1, "60": 0.2, "48": 0.75 },
      BLOWER: { "72": 0.1, "60": 0.2, "48": 0.75 },
    },
  };

  // ----------------------------------------
  // DOLLAR RATES
  // ----------------------------------------
  const DEFAULT_MOWING_DOLLARS = {
    MISC_HRS: 61,
    "72-area1": 51,
    "72-area2": 61,
    "60-area1": 61,
    "60-area2": 59,
    "48-area1": 56,
    "48-area2": 56,
    TRIMMER: 55,
    BLOWER: 55,
    ROTARY: 55,
    "5111": 100,
  };

  // ----------------------------------------
  // GLOBAL SERVICES STORAGE
  // ----------------------------------------
  const [currentServices, setCurrentServices] = useState({
    mowing: [],             
    edging: null,           
    bedMaintenance: null,   
    mulching: null,
    pruning: [],     // ✅ FIXED (must be an array)
    leaves: null,
  });

  // ----------------------------------------
  // RATE STORAGE
  // ----------------------------------------
  const [currentRates, setCurrentRates] = useState({
    mowingFactors: DEFAULT_MOWING_FACTORS,
    mowingDollars: DEFAULT_MOWING_DOLLARS,
    mulchingRates: null,
    pruningRates: null,   // ✅ ADDED (supports PruningRatesPage)
  });

  // ----------------------------------------
  // SERVICE UPDATE
  // ----------------------------------------
  const updateService = (serviceName, data) => {
    setCurrentServices((prev) => ({
      ...prev,
      [serviceName]: data,
    }));
  };

  const getAllServices = () => currentServices;

  // ----------------------------------------
  // RATE UPDATE
  // ----------------------------------------
  const updateRates = (key, value) => {
    setCurrentRates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ----------------------------------------
  // RESET ALL SERVICES
  // ----------------------------------------
  const resetServices = () => {
    setCurrentServices({
      mowing: [],
      edging: null,
      bedMaintenance: null,
      mulching: null,
      pruning: [],   // ✅ FIXED (was null — must stay an array)
      leaves: null,
    });
  };

  return (
    <ServiceContext.Provider
      value={{
        currentServices,
        updateService,
        getAllServices,
        currentRates,
        updateRates,
        resetServices,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}

export function useServiceContext() {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error("useServiceContext must be used within a ServiceProvider");
  }
  return ctx;
}
