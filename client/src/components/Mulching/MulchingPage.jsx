// myapp/client/src/components/Mulching/MulchingPage.jsx

import React from "react";
import { useServiceContext } from "../../context/ServiceContext";
import { DEFAULT_MULCHING_RATES } from "./mulchingDefaults";
import {
  mergeMulchingData,
  computeCommonAreaValues,
  computeHomeValues,
  formatCurrency,
} from "./mulchingCalculations";
import MulchingCommonTable from "./MulchingCommonTable";
import MulchingHomesTable from "./MulchingHomesTable";

export default function MulchingPage({ tableId }) {
  const { currentServices, updateService, currentRates } =
    useServiceContext();

  const mulchingArray = Array.isArray(currentServices.mulching)
    ? currentServices.mulching
    : [];

  const existingEntry =
    mulchingArray.find((m) => m.id === tableId) || { id: tableId, data: {} };

  const mulchingRates =
    currentRates?.mulchingRates || DEFAULT_MULCHING_RATES;

  const mergedData = mergeMulchingData(existingEntry.data || {});

  const updateMulchingData = (newData) => {
    const updatedEntry = { ...existingEntry, data: newData };
    let updatedArray;

    if (mulchingArray.some((m) => m.id === tableId)) {
      updatedArray = mulchingArray.map((m) =>
        m.id === tableId ? updatedEntry : m
      );
    } else {
      updatedArray = [...mulchingArray, updatedEntry];
    }

    updateService("mulching", updatedArray);
  };

  // -------- HANDLERS FOR COMMON AREAS --------

  const handleCommonFieldChange = (areaKey, field, value) => {
    const newData = {
      ...mergedData,
      handCommonAreas: {
        ...mergedData.handCommonAreas,
        [areaKey]: {
          ...mergedData.handCommonAreas[areaKey],
          [field]: value,
          hoursOverride: null,
          mulchOverride: null,
        },
      },
      smPwrCommon: {
        ...mergedData.smPwrCommon,
        hoursOverride: null,
      },
      loaderCommon: {
        ...mergedData.loaderCommon,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleCommonHoursOverrideChange = (areaKey, value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      handCommonAreas: {
        ...mergedData.handCommonAreas,
        [areaKey]: {
          ...mergedData.handCommonAreas[areaKey],
          hoursOverride: isNaN(num) ? null : num,
        },
      },
    };
    updateMulchingData(newData);
  };

  const handleCommonMulchOverrideChange = (areaKey, value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      handCommonAreas: {
        ...mergedData.handCommonAreas,
        [areaKey]: {
          ...mergedData.handCommonAreas[areaKey],
          mulchOverride: isNaN(num) ? null : num,
        },
      },
      smPwrCommon: {
        ...mergedData.smPwrCommon,
        hoursOverride: null,
      },
      loaderCommon: {
        ...mergedData.loaderCommon,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  // -------- HANDLERS FOR HOMES --------

  const handleHomeFieldChange = (homeKey, field, value) => {
    const newData = {
      ...mergedData,
      handHomes: {
        ...mergedData.handHomes,
        [homeKey]: {
          ...mergedData.handHomes[homeKey],
          [field]: value,
          hoursOverride: null,
          mulchOverride: null,
        },
      },
      smPwrHomes: {
        ...mergedData.smPwrHomes,
        hoursOverride: null,
      },
      loaderHomes: {
        ...mergedData.loaderHomes,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleHomeHoursOverrideChange = (homeKey, value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      handHomes: {
        ...mergedData.handHomes,
        [homeKey]: {
          ...mergedData.handHomes[homeKey],
          hoursOverride: isNaN(num) ? null : num,
        },
      },
    };
    updateMulchingData(newData);
  };

  const handleHomeMulchOverrideChange = (homeKey, value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      handHomes: {
        ...mergedData.handHomes,
        [homeKey]: {
          ...mergedData.handHomes[homeKey],
          mulchOverride: isNaN(num) ? null : num,
        },
      },
      smPwrHomes: {
        ...mergedData.smPwrHomes,
        hoursOverride: null,
      },
      loaderHomes: {
        ...mergedData.loaderHomes,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  // -------- COMPUTE TOTALS FOR COMMON & HOMES --------

  const commonAreaKeys = ["area1", "area2", "area3"];
  const homeKeys = ["home1", "home2", "home3"];

  let totalCommonHours = 0;
  let totalCommonMulch = 0;

  commonAreaKeys.forEach((k) => {
    const area = mergedData.handCommonAreas[k];
    const computed = computeCommonAreaValues(area, mulchingRates);
    const displayHours =
      area.hoursOverride != null ? area.hoursOverride : computed.hours;
    const displayMulch =
      area.mulchOverride != null ? area.mulchOverride : computed.mulch;

    totalCommonHours += displayHours || 0;
    totalCommonMulch += displayMulch || 0;
  });

  let totalHomesHours = 0;
  let totalHomesMulch = 0;

  homeKeys.forEach((k) => {
    const home = mergedData.handHomes[k];
    const computed = computeHomeValues(home, mulchingRates);
    const displayHours =
      home.hoursOverride != null ? home.hoursOverride : computed.hours;
    const displayMulch =
      home.mulchOverride != null ? home.mulchOverride : computed.mulch;

    totalHomesHours += displayHours || 0;
    totalHomesMulch += displayMulch || 0;
  });

  // -------- SM PWR & LOADER (COMMON) --------

  const smPwrRates = mulchingRates.smPowerManHours || {};
  const loaderRates = mulchingRates.loaderManHours || {};

  const smPwrCommonSelection = mergedData.smPwrCommon.selection || "Average";
  const loaderCommonSelection = mergedData.loaderCommon.selection || "Average";

  const smPwrCommonRate = smPwrRates[smPwrCommonSelection] || 0;
  const loaderCommonRate = loaderRates[loaderCommonSelection] || 0;

  const computedSmPwrCommonHours =
    smPwrCommonRate > 0 && totalCommonMulch > 0
      ? totalCommonMulch / smPwrCommonRate
      : 0;

  const computedLoaderCommonHours =
    loaderCommonRate > 0 && totalCommonMulch > 0
      ? totalCommonMulch / loaderCommonRate
      : 0;

  const smPwrCommonDisplay =
    mergedData.smPwrCommon.hoursOverride != null
      ? mergedData.smPwrCommon.hoursOverride
      : computedSmPwrCommonHours;

  const loaderCommonDisplay =
    mergedData.loaderCommon.hoursOverride != null
      ? mergedData.loaderCommon.hoursOverride
      : computedLoaderCommonHours;

  const handleSmPwrCommonSelectionChange = (value) => {
    const newData = {
      ...mergedData,
      smPwrCommon: {
        ...mergedData.smPwrCommon,
        selection: value,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleSmPwrCommonOverrideChange = (value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      smPwrCommon: {
        ...mergedData.smPwrCommon,
        hoursOverride: isNaN(num) ? null : num,
      },
    };
    updateMulchingData(newData);
  };

  const handleLoaderCommonSelectionChange = (value) => {
    const newData = {
      ...mergedData,
      loaderCommon: {
        ...mergedData.loaderCommon,
        selection: value,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleLoaderCommonOverrideChange = (value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      loaderCommon: {
        ...mergedData.loaderCommon,
        hoursOverride: isNaN(num) ? null : num,
      },
    };
    updateMulchingData(newData);
  };

  // -------- SM PWR & LOADER (HOMES) --------

  const smPwrHomesSelection = mergedData.smPwrHomes.selection || "Average";
  const loaderHomesSelection = mergedData.loaderHomes.selection || "Average";

  const smPwrHomesRate = smPwrRates[smPwrHomesSelection] || 0;
  const loaderHomesRate = loaderRates[loaderHomesSelection] || 0;

  const computedSmPwrHomesHours =
    smPwrHomesRate > 0 && totalHomesMulch > 0
      ? totalHomesMulch / smPwrHomesRate
      : 0;

  const computedLoaderHomesHours =
    loaderHomesRate > 0 && totalHomesMulch > 0
      ? totalHomesMulch / loaderHomesRate
      : 0;

  const smPwrHomesDisplay =
    mergedData.smPwrHomes.hoursOverride != null
      ? mergedData.smPwrHomes.hoursOverride
      : computedSmPwrHomesHours;

  const loaderHomesDisplay =
    mergedData.loaderHomes.hoursOverride != null
      ? mergedData.loaderHomes.hoursOverride
      : computedLoaderHomesHours;

  const handleSmPwrHomesSelectionChange = (value) => {
    const newData = {
      ...mergedData,
      smPwrHomes: {
        ...mergedData.smPwrHomes,
        selection: value,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleSmPwrHomesOverrideChange = (value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      smPwrHomes: {
        ...mergedData.smPwrHomes,
        hoursOverride: isNaN(num) ? null : num,
      },
    };
    updateMulchingData(newData);
  };

  const handleLoaderHomesSelectionChange = (value) => {
    const newData = {
      ...mergedData,
      loaderHomes: {
        ...mergedData.loaderHomes,
        selection: value,
        hoursOverride: null,
      },
    };
    updateMulchingData(newData);
  };

  const handleLoaderHomesOverrideChange = (value) => {
    const num = value === "" ? null : Number(value);
    const newData = {
      ...mergedData,
      loaderHomes: {
        ...mergedData.loaderHomes,
        hoursOverride: isNaN(num) ? null : num,
      },
    };
    updateMulchingData(newData);
  };

  // -------- PRICING CALCULATIONS --------

  const handRate = mulchingRates.handLaborRatePerHour ?? 50;
  const smPwrRate = mulchingRates.smPwrRatePerHour ?? 55;
  const loaderRate = mulchingRates.loaderRatePerHour ?? 85;
  const mulchPrice = mulchingRates.mulchPricePerYard ?? 28;

  const commonHandHours = totalCommonHours;
  const commonSmPwrHours = smPwrCommonDisplay || 0;
  const commonLoaderHours = loaderCommonDisplay || 0;
  const commonMulchYards = totalCommonMulch;

  const homesHandHours = totalHomesHours;
  const homesSmPwrHours = smPwrHomesDisplay || 0;
  const homesLoaderHours = loaderHomesDisplay || 0;
  const homesMulchYards = totalHomesMulch;

  const commonPrice =
    commonHandHours * handRate +
    commonSmPwrHours * smPwrRate +
    commonLoaderHours * loaderRate +
    commonMulchYards * mulchPrice;

  const homesPrice =
    homesHandHours * handRate +
    homesSmPwrHours * smPwrRate +
    homesLoaderHours * loaderRate +
    homesMulchYards * mulchPrice;

  const totalPrice = commonPrice + homesPrice;

  // -------- LIVE PREVIEW TOTALS --------

  const totalSmPwrHours = (smPwrCommonDisplay || 0) + (smPwrHomesDisplay || 0);
  const totalLoaderHours =
    (loaderCommonDisplay || 0) + (loaderHomesDisplay || 0);

  const totalAreaHours = totalCommonHours + totalHomesHours;
  const totalHours = totalAreaHours + totalSmPwrHours + totalLoaderHours;
  const totalMulchYards = totalCommonMulch + totalHomesMulch;

  // -------- STYLES --------

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0.25rem",
    fontSize: "0.85rem",
  };

  const thStyle = {
    borderBottom: "1px solid #ccc",
    padding: "3px",
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    borderBottom: "1px solid #eee",
    padding: "3px",
    verticalAlign: "top",
  };

  const inputStyle = {
    width: "100%",
    padding: "2px 3px",
    fontSize: "0.8rem",
    boxSizing: "border-box",
  };

  // -------- RENDER --------

  return (
    <div
      style={{
        marginTop: "0.5rem",
        padding: "0.75rem",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "#fdfdfd",
        maxWidth: "900px",
      }}
    >
      <MulchingCommonTable
        mergedData={mergedData}
        mulchingRates={mulchingRates}
        handleCommonFieldChange={handleCommonFieldChange}
        handleCommonHoursOverrideChange={handleCommonHoursOverrideChange}
        handleCommonMulchOverrideChange={handleCommonMulchOverrideChange}
        smPwrCommonSelection={smPwrCommonSelection}
        loaderCommonSelection={loaderCommonSelection}
        smPwrCommonDisplay={smPwrCommonDisplay}
        loaderCommonDisplay={loaderCommonDisplay}
        computedSmPwrCommonHours={computedSmPwrCommonHours}
        computedLoaderCommonHours={computedLoaderCommonHours}
        handleSmPwrCommonSelectionChange={handleSmPwrCommonSelectionChange}
        handleSmPwrCommonOverrideChange={handleSmPwrCommonOverrideChange}
        handleLoaderCommonSelectionChange={handleLoaderCommonSelectionChange}
        handleLoaderCommonOverrideChange={handleLoaderCommonOverrideChange}
        tableStyle={tableStyle}
        thStyle={thStyle}
        tdStyle={tdStyle}
        inputStyle={inputStyle}
        tablePrice={commonPrice}
        formatCurrency={formatCurrency}
      />

      <MulchingHomesTable
        mergedData={mergedData}
        mulchingRates={mulchingRates}
        handleHomeFieldChange={handleHomeFieldChange}
        handleHomeHoursOverrideChange={handleHomeHoursOverrideChange}
        handleHomeMulchOverrideChange={handleHomeMulchOverrideChange}
        smPwrHomesSelection={smPwrHomesSelection}
        loaderHomesSelection={loaderHomesSelection}
        smPwrHomesDisplay={smPwrHomesDisplay}
        loaderHomesDisplay={loaderHomesDisplay}
        computedSmPwrHomesHours={computedSmPwrHomesHours}
        computedLoaderHomesHours={computedLoaderHomesHours}
        handleSmPwrHomesSelectionChange={handleSmPwrHomesSelectionChange}
        handleSmPwrHomesOverrideChange={handleSmPwrHomesOverrideChange}
        handleLoaderHomesSelectionChange={handleLoaderHomesSelectionChange}
        handleLoaderHomesOverrideChange={handleLoaderHomesOverrideChange}
        tableStyle={tableStyle}
        thStyle={thStyle}
        tdStyle={tdStyle}
        inputStyle={inputStyle}
        tablePrice={homesPrice}
        formatCurrency={formatCurrency}
      />

      {/* LIVE PREVIEW */}
      <div
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem",
          border: "1px solid #ddd",
          borderRadius: "4px",
          background: "#fff",
          fontSize: "0.85rem",
        }}
      >
        <strong>Mulch Preview</strong>
        <div style={{ marginTop: "0.25rem" }}>
          <div>
            Total Mulch Yards:{" "}
            <strong>{totalMulchYards.toFixed(1)}</strong>
          </div>
          <div>
            Total Labor Hours:{" "}
            <strong>{totalHours.toFixed(2)}</strong>
          </div>
          <div>
            Total Price:{" "}
            <strong>{formatCurrency(totalPrice)}</strong>
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#666",
              marginTop: "0.25rem",
            }}
          >
            Areas: {totalAreaHours.toFixed(2)} hrs · Sm Pwr:{" "}
            {totalSmPwrHours.toFixed(2)} hrs · Loader:{" "}
            {totalLoaderHours.toFixed(2)} hrs
          </div>
        </div>
      </div>
    </div>
  );
}
