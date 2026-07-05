import React from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";
import { formatCurrency } from "../utils/formatters";
import {
  computeSpringCleanupTableTotals,
  computeSpringCleanupTotals,
  mergeSpringCleanupData,
} from "./SpringCleanup/springCleanupCalculations";
import { buildSpringCleanupTable, SPRING_CLEANUP_EXTRA_TABLE_TYPE, SPRING_CLEANUP_TABLES } from "./SpringCleanup/springCleanupDefaults";

export default function SpringCleanupForm() {
  const { currentServices, updateService } = useServiceContext();
  const navigate = useNavigate();
  const data = mergeSpringCleanupData(currentServices.springCleanup || {});

  const save = (nextData) => {
    updateService("springCleanup", {
      ...nextData,
      totals: computeSpringCleanupTotals(nextData),
    });
  };

  const updateTable = (tableKey, nextTable) => {
    save({
      ...data,
      tables: {
        ...data.tables,
        [tableKey]: nextTable,
      },
    });
  };

  const updateExtraTable = (tableId, nextTable) => {
    save({
      ...data,
      extraTables: data.extraTables.map((table) =>
        table.id === tableId ? nextTable : table
      ),
    });
  };

  const getTableState = (tableKey, tableId) =>
    tableId ? data.extraTables.find((table) => table.id === tableId) : data.tables[tableKey];

  const saveTableState = (tableKey, nextTable, tableId) => {
    if (tableId) {
      updateExtraTable(tableId, nextTable);
      return;
    }

    updateTable(tableKey, nextTable);
  };

  const updateQty = (tableKey, itemKey, value, tableId) => {
    const table = getTableState(tableKey, tableId);
    saveTableState(tableKey, {
      ...table,
      qty: { ...table.qty, [itemKey]: Number(value) || 0 },
    }, tableId);
  };

  const updatePrice = (tableKey, itemKey, value, tableId) => {
    const table = getTableState(tableKey, tableId);
    saveTableState(tableKey, {
      ...table,
      unitPrice: { ...table.unitPrice, [itemKey]: Number(value) || 0 },
    }, tableId);
  };

  const updateOccurrences = (tableKey, value, tableId) => {
    const table = getTableState(tableKey, tableId);
    saveTableState(tableKey, {
      ...table,
      occurrences: value === "" ? "" : Number(value) || 0,
    }, tableId);
  };

  const addBedFertilizerTable = () => {
    const definition = SPRING_CLEANUP_TABLES[SPRING_CLEANUP_EXTRA_TABLE_TYPE];
    const nextNumber = data.extraTables.length + 2;

    save({
      ...data,
      extraTables: [
        ...data.extraTables,
        {
          id: `${SPRING_CLEANUP_EXTRA_TABLE_TYPE}-${Date.now()}`,
          definitionKey: SPRING_CLEANUP_EXTRA_TABLE_TYPE,
          title: `${definition.title} #${nextNumber}`,
          ...buildSpringCleanupTable(definition),
        },
      ],
    });
  };

  const deleteExtraTable = (tableId) => {
    save({
      ...data,
      extraTables: data.extraTables.filter((table) => table.id !== tableId),
    });
  };

  const handleSave = () => navigate("/services");
  const handleReset = () => updateService("springCleanup", null);

  const renderTable = (tableKey, tableOverride, options = {}) => {
    const definition = SPRING_CLEANUP_TABLES[tableKey];
    const table = tableOverride || data.tables[tableKey];
    const totals = computeSpringCleanupTableTotals(tableKey, table);
    const tableId = options.tableId;

    return (
      <section key={tableId || tableKey} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "0.75rem", borderRadius: "4px", background: "#fafafa", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <h3 style={{ margin: 0 }}>{table.title || definition.title}</h3>
          {options.onDelete && (
            <button className="danger-button compact-button" onClick={options.onDelete} type="button">
              Delete
            </button>
          )}
        </div>
        <table border="1" style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse", background: "#fff", textAlign: "center" }}>
          <thead>
            <tr>
              <th style={cellStyle}>ITEM</th>
              {definition.keys.map((key) => (
                <th key={key} style={cellStyle}>{definition.labels[key]}</th>
              ))}
              <th style={summaryLabelStyle}>HRS/OCC</th>
              <th style={summaryValueStyle}>{totals.hoursPerOcc.toFixed(1)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}>QTY/UNIT</td>
              {definition.keys.map((key) => (
                <td key={key} style={inputCellStyle}>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={table.qty[key]}
                    onChange={(e) => updateQty(tableKey, key, e.target.value, tableId)}
                    style={smallInput}
                  />
                  <div style={unitStyle}>{definition.units[key]}</div>
                </td>
              ))}
              <td style={summaryLabelStyle}>$/OCC</td>
              <td style={summaryValueStyle}>{formatCurrency(totals.dollarsPerOcc)}</td>
            </tr>

            <tr>
              <td style={cellStyle}>UNIT $</td>
              {definition.keys.map((key) => (
                <td key={key} style={inputCellStyle}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={table.unitPrice[key]}
                    onChange={(e) => updatePrice(tableKey, key, e.target.value, tableId)}
                    style={smallInput}
                  />
                </td>
              ))}
              <td style={summaryLabelStyle}># OCC</td>
              <td style={inputCellStyle}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={table.occurrences}
                  onFocus={() => {
                    if (Number(table.occurrences || 0) === 0) updateOccurrences(tableKey, "", tableId);
                  }}
                  onChange={(e) => updateOccurrences(tableKey, e.target.value, tableId)}
                  style={smallInput}
                />
              </td>
            </tr>

            <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
              <td style={cellStyle}>TOTAL</td>
              {definition.keys.map((key) => (
                <td key={key} style={cellStyle}>{formatCurrency(totals.rowTotals[key])}</td>
              ))}
              <td style={summaryLabelStyle}>TOTAL $</td>
              <td style={summaryValueStyle}>{formatCurrency(totals.totalDollars)}</td>
            </tr>

            <tr>
              <td colSpan={definition.keys.length - 1} style={{ border: "none" }}></td>
              {definition.materialKeys.length > 0 ? (
                <>
                  <td style={summaryLabelStyle}>TOTAL MAT:</td>
                  <td style={summaryValueStyle}>{formatCurrency(totals.totalMat)}</td>
                </>
              ) : (
                <td colSpan={2} style={{ border: "none" }}></td>
              )}
              <td style={summaryLabelStyle}>TOT HRS</td>
              <td style={summaryValueStyle}>{totals.totalHours.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  };

  return (
    <div className="service-entry-page" style={{ maxWidth: "1120px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Spring Cleanup</h2>

      {Object.keys(SPRING_CLEANUP_TABLES).map((tableKey) => renderTable(tableKey))}
      {data.extraTables.map((table) =>
        renderTable(table.definitionKey || SPRING_CLEANUP_EXTRA_TABLE_TYPE, table, {
          tableId: table.id,
          onDelete: () => deleteExtraTable(table.id),
        })
      )}

      <div className="service-actions-stack">
        <button onClick={addBedFertilizerTable} type="button">
          Add Bed Fertilizer Table
        </button>

        <div className="service-page-actions pruning-page-actions">
          <button className="save-project-button" onClick={handleSave} type="button">
            Save Spring Cleanup
          </button>
          <button className="danger-button" onClick={handleReset} type="button">
            Reset
          </button>
          <button className="secondary-button" onClick={() => navigate(-1)} type="button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

const cellStyle = {
  padding: "4px",
  fontSize: "12px",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const inputCellStyle = {
  ...cellStyle,
  background: "#fff59d",
};

const summaryLabelStyle = {
  ...cellStyle,
  fontWeight: "bold",
  textAlign: "right",
  background: "#f3f3f3",
};

const summaryValueStyle = {
  ...cellStyle,
  fontWeight: "bold",
  background: "#eef",
};

const smallInput = {
  width: "72px",
  padding: "2px",
  fontSize: "12px",
  textAlign: "center",
};

const unitStyle = {
  color: "#444",
  fontSize: "0.7rem",
  marginTop: "2px",
};
