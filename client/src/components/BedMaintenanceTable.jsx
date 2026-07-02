// myapp/client/src/components/BedMaintenanceTable.jsx

import React, { useMemo } from "react";
import LabeledInput from "./LabeledInput";
import { useServiceContext } from "../context/ServiceContext";

const INITIAL = {
  qtyUnit: { HAND: 0, BACKPACK: 0, ROUNDUP: 0 },
  unitPrice: { HAND: 55, BACKPACK: 55, ROUNDUP: 50 },
  summary: { numOccurrences: 0 },

  // Required by ServicesPage preview:
  totalOccDollar: 0,
  finalTotal: 0,
};

export default function BedMaintenanceTable() {
  const tableId = "BED";

  const { currentServices, updateService } = useServiceContext();

  const array = Array.isArray(currentServices.bedMaintenance)
    ? currentServices.bedMaintenance
    : [];

  const table =
    array.find((t) => t.id === tableId) || { id: tableId, data: INITIAL };

  // Merge defaults + saved
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
  // COMPUTED NUMBERS
  // -------------------------
  const totalRow = {
    HAND: data.qtyUnit.HAND * data.unitPrice.HAND,
    BACKPACK: data.qtyUnit.BACKPACK * data.unitPrice.BACKPACK,
    ROUNDUP: data.qtyUnit.ROUNDUP * data.unitPrice.ROUNDUP,
  };

  const sum = data.qtyUnit.HAND + data.qtyUnit.BACKPACK + data.qtyUnit.ROUNDUP;

  const totalOccDollar =
    totalRow.HAND + totalRow.BACKPACK + totalRow.ROUNDUP;

  const finalTotal =
    totalOccDollar * (data.summary.numOccurrences || 1);

  // -------------------------
  // SAVE one fixed table
  // -------------------------
  const save = (updatedData) => {
    const full = {
      ...updatedData,
      totalOccDollar,
      finalTotal,
    };

    updateService("bedMaintenance", [{ id: tableId, data: full }]);
  };

  const handleChange = (row, key) => (e) => {
    const v = parseFloat(e.target.value) || 0;
    save({
      ...data,
      [row]: { ...data[row], [key]: v },
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
          <th>HAND</th>
          <th>BACKPACK</th>
          <th>ROUNDUP</th>
          <th># OCC</th>
          <th style={{ background: "yellow" }}>
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
              value={data.qtyUnit.HAND}
              type="number"
              step={0.1}
              min={0}
              onChange={handleChange("qtyUnit", "HAND")}
            />
          </td>

          <td>
            <LabeledInput
              value={data.qtyUnit.BACKPACK}
              type="number"
              min={0}
              step={0.1}
              onChange={handleChange("qtyUnit", "BACKPACK")}
            />
          </td>

          <td>
            <LabeledInput
              value={data.qtyUnit.ROUNDUP}
              type="number"
              min={0}
              step={0.1}
              onChange={handleChange("qtyUnit", "ROUNDUP")}
            />
          </td>

          <td>HRS/OCC</td>
          <td style={{ background: "#eef" }}>{sum.toFixed(2)}</td>
        </tr>

        {/* UNIT PRICE */}
        <tr>
          <td>UNIT $</td>
          <td>${data.unitPrice.HAND.toFixed(2)}</td>
          <td>${data.unitPrice.BACKPACK.toFixed(2)}</td>
          <td>${data.unitPrice.ROUNDUP.toFixed(2)}</td>

          <td>$/OCC</td>
          <td style={{ background: "#eef" }}>{totalOccDollar.toFixed(2)}</td>
        </tr>

        {/* TOTAL */}
        <tr style={{ fontWeight: "bold", background: "#f4f4f4" }}>
          <td>TOTAL</td>
          <td>${totalRow.HAND.toFixed(2)}</td>
          <td>${totalRow.BACKPACK.toFixed(2)}</td>
          <td>${totalRow.ROUNDUP.toFixed(2)}</td>

          <td>TOTAL $</td>
          <td style={{ background: "#f4f4f4" }}>
            {finalTotal.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
