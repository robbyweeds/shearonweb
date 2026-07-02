// =====================================
// SpringTable.jsx
// =====================================

import React, { useEffect, useState } from "react";
import { useServiceContext } from "../../context/ServiceContext";
import { INITIAL_SPRING_TABLE, SPRING_DEFAULT_RATES } from "./springDefaults";
import { computeSpringTotals } from "./springCalculations";

export default function SpringTable({ tableId }) {
  const { currentServices, updateService } = useServiceContext();

  const existingList = currentServices.springServices || [];
  const saved = existingList.find((t) => t.id === tableId)?.data;

  const initial = saved || INITIAL_SPRING_TABLE;

  const [localData, setLocalData] = useState({
    name: initial.name || "",
    occurrences: initial.occurrences || 0,

    qty: {
      MISC: initial.qty?.MISC || 0,
      HAND: initial.qty?.HAND || 0,
      EDGER: initial.qty?.EDGER || 0,
      BLOWER: initial.qty?.BLOWER || 0,
      LEAF_TRUCK: initial.qty?.LEAF_TRUCK || 0,
      TRUCKSTER: initial.qty?.TRUCKSTER || 0,
    },

    unitPrice: {
      MISC: initial.unitPrice?.MISC || SPRING_DEFAULT_RATES.MISC,
      HAND: initial.unitPrice?.HAND || SPRING_DEFAULT_RATES.HAND,
      EDGER: initial.unitPrice?.EDGER || SPRING_DEFAULT_RATES.EDGER,
      BLOWER: initial.unitPrice?.BLOWER || SPRING_DEFAULT_RATES.BLOWER,
      LEAF_TRUCK:
        initial.unitPrice?.LEAF_TRUCK || SPRING_DEFAULT_RATES.LEAF_TRUCK,
      TRUCKSTER:
        initial.unitPrice?.TRUCKSTER || SPRING_DEFAULT_RATES.TRUCKSTER,
    },

    summary: {
      hoursPerOcc: 0,
      dollarsPerOcc: 0,
      totalDollars: 0,
    },
  });

  // -------------------------
  // RECALCULATE SUMMARY
  // -------------------------
  useEffect(() => {
    const computed = computeSpringTotals({
      qty: localData.qty,
      unitPrice: localData.unitPrice,
      occurrences: localData.occurrences,
    });

    setLocalData((prev) => ({
      ...prev,
      summary: {
        hoursPerOcc: computed.hoursPerOcc,
        dollarsPerOcc: computed.dollarsPerOcc,
        totalDollars: computed.totalDollars,
      },
    }));
  }, [localData.qty, localData.unitPrice, localData.occurrences]);

  // -------------------------
  // SAVE BACK TO CONTEXT
  // -------------------------
  useEffect(() => {
    updateService("springServices", (prev = []) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, data: localData } : t
      )
    );
  }, [localData, tableId, updateService]);

  const updateQty = (key, value) =>
    setLocalData((p) => ({
      ...p,
      qty: { ...p.qty, [key]: Number(value) },
    }));

  const updateRate = (key, value) =>
    setLocalData((p) => ({
      ...p,
      unitPrice: { ...p.unitPrice, [key]: Number(value) },
    }));

  return (
    <div style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>
      {/* NAME */}
      <input
        value={localData.name}
        placeholder="Spring Service Name"
        onChange={(e) =>
          setLocalData((p) => ({ ...p, name: e.target.value }))
        }
        style={{
          width: "100%",
          padding: "4px",
          marginBottom: "4px",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Misc</th>
            <th style={th}>Hand</th>
            <th style={th}>Edger</th>
            <th style={th}>Blower</th>
            <th style={th}>Leaf Truck</th>
            <th style={th}>Truckster</th>
            <th style={th}>Occ</th>
          </tr>

          <tr>
            <th style={thSmall}>Rate</th>
            <th style={thSmall}>Rate</th>
            <th style={thSmall}>Rate</th>
            <th style={thSmall}>Rate</th>
            <th style={thSmall}>Rate</th>
            <th style={thSmall}>Rate</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr>
            {/* HOURS INPUTS */}
            {["MISC", "HAND", "EDGER", "BLOWER", "LEAF_TRUCK", "TRUCKSTER"].map(
              (key) => (
                <td key={key} style={td}>
                  <input
                    type="number"
                    value={localData.qty[key]}
                    onChange={(e) => updateQty(key, e.target.value)}
                    style={input}
                  />
                </td>
              )
            )}

            {/* OCCURRENCES */}
            <td style={td}>
              <input
                type="number"
                value={localData.occurrences}
                onChange={(e) =>
                  setLocalData((p) => ({
                    ...p,
                    occurrences: Number(e.target.value),
                  }))
                }
                style={{ ...input, background: "yellow" }}
              />
            </td>
          </tr>

          {/* RATE ROW */}
          <tr>
            {["MISC", "HAND", "EDGER", "BLOWER", "LEAF_TRUCK", "TRUCKSTER"].map(
              (key) => (
                <td key={key} style={td}>
                  <input
                    type="number"
                    value={localData.unitPrice[key]}
                    onChange={(e) => updateRate(key, e.target.value)}
                    style={input}
                  />
                </td>
              )
            )}

            <td></td>
          </tr>

          {/* SUMMARY */}
          <tr>
            <td colSpan={7} style={{ textAlign: "center", padding: "4px" }}>
              <strong>
                Hrs/Occ: {localData.summary.hoursPerOcc.toFixed(2)} — Total: $
                {localData.summary.totalDollars.toFixed(2)}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const th = {
  padding: "4px",
  borderBottom: "1px solid #ccc",
  textAlign: "center",
};
const thSmall = {
  padding: "2px",
  fontSize: "0.7rem",
  background: "#f0f0f0",
  borderBottom: "1px solid #ccc",
};
const td = { textAlign: "center", padding: "2px" };
const input = {
  width: "55px",
  padding: "2px",
  fontSize: "0.75rem",
  textAlign: "center",
};
