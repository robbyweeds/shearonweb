// myapp/client/src/components/EdgingTable.jsx

import React, { useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

const INITIAL = {
  qtyUnit: { EDGER: 0, BLOWER: 0 },
  unitPrice: { EDGER: 55, BLOWER: 55 },
  summary: { numOccurrences: 0 },

  // Required by ServicesPage preview:
  totalOccDollar: 0,
  finalTotal: 0,
};

export default function EdgingTable() {
  const tableId = "EDGING";

  const { currentServices, updateService } = useServiceContext();

  const array = Array.isArray(currentServices.edging)
    ? currentServices.edging
    : [];

  const table =
    array.find((t) => t.id === tableId) || { id: tableId, data: INITIAL };

  // Merge saved + defaults
  const data = useMemo(() => {
    return {
      ...INITIAL,
      ...table.data,
      qtyUnit: {
        ...INITIAL.qtyUnit,
        ...(table.data.qtyUnit || {}),
      },
      unitPrice: {
        ...INITIAL.unitPrice,
        ...(table.data.unitPrice || {}),
      },
      summary: {
        ...INITIAL.summary,
        ...(table.data.summary || {}),
      },
    };
  }, [table.data]);

  // -------------------------
  // Computed values
  // -------------------------
  const totalRow = {
    EDGER: data.qtyUnit.EDGER * data.unitPrice.EDGER,
    BLOWER: data.qtyUnit.BLOWER * data.unitPrice.BLOWER,
  };

  const sumHours = data.qtyUnit.EDGER + data.qtyUnit.BLOWER;

  const totalOccDollar = totalRow.EDGER + totalRow.BLOWER;

  const finalTotal = totalOccDollar * (data.summary.numOccurrences || 1);

  // Save including required fields
  const save = (updatedData) => {
    const full = {
      ...updatedData,
      totalOccDollar,
      finalTotal,
    };

    updateService("edging", [{ id: tableId, data: full }]);
  };

  const handleChange = (row, key) => (e) => {
    const val = parseFloat(e.target.value) || 0;
    save({
      ...data,
      [row]: {
        ...data[row],
        [key]: val,
      },
    });
  };

  return (
    <table
      border="1"
      style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "center",
      }}
    >
      <thead>
        <tr>
          <th>ITEM</th>
          <th>EDGER</th>
          <th>BLOWER</th>

          <th># OCC</th>
          <th style={{ backgroundColor: "yellow" }}>
            <LabeledInput
              value={data.summary.numOccurrences}
              type="number"
              min={0}
              step={1}
              onChange={handleChange("summary", "numOccurrences")}
            />
          </th>
        </tr>
      </thead>

      <tbody>
        {/* QTY/UNIT */}
        <tr>
          <td>QTY/UNIT</td>

          <td>
            <LabeledInput
              value={data.qtyUnit.EDGER}
              type="number"
              min={0}
              step={0.25}
              onChange={handleChange("qtyUnit", "EDGER")}
            />
          </td>

          <td>
            <LabeledInput
              value={data.qtyUnit.BLOWER}
              type="number"
              min={0}
              step={0.25}
              onChange={handleChange("qtyUnit", "BLOWER")}
            />
          </td>

          <td>HRS/OCC</td>
          <td style={{ background: "#eef" }}>{sumHours.toFixed(2)}</td>
        </tr>

        {/* UNIT PRICE */}
        <tr>
          <td>UNIT $</td>
          <td>${data.unitPrice.EDGER.toFixed(2)}</td>
          <td>${data.unitPrice.BLOWER.toFixed(2)}</td>

          <td>$/OCC</td>
          <td style={{ background: "#eef" }}>{totalOccDollar.toFixed(2)}</td>
        </tr>

        {/* TOTAL */}
        <tr style={{ background: "#f4f4f4", fontWeight: "bold" }}>
          <td>TOTAL</td>
          <td>${totalRow.EDGER.toFixed(2)}</td>
          <td>${totalRow.BLOWER.toFixed(2)}</td>

          <td>TOTAL $</td>
          <td style={{ background: "#f4f4f4" }}>
            {finalTotal.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
