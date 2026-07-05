import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "./../context/ServiceContext";
import ExtrasTable from "./Extras/ExtrasTable";
import { INITIAL_EXTRAS_TABLE } from "./Extras/extrasDefaults";

const clone = (value) => JSON.parse(JSON.stringify(value));
const getDefaultExtrasTables = () => [
  { id: "Extras1", data: clone(INITIAL_EXTRAS_TABLE) },
];

export default function ExtrasForm() {
  const { currentServices, updateService } = useServiceContext();
  const navigate = useNavigate();
  const initialList = Array.isArray(currentServices.extras) ? currentServices.extras : [];
  const [tables, setTables] = useState(initialList);
  const [resetNonce, setResetNonce] = useState(0);

  useEffect(() => {
    if (!Array.isArray(currentServices.extras) || currentServices.extras.length === 0) {
      const defaults = getDefaultExtrasTables();
      setTables(defaults);
      updateService("extras", defaults);
    } else {
      setTables(currentServices.extras);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNextTableNumber = () =>
    Math.max(
      0,
      ...tables.map((table) => Number(String(table.id).replace("Extras", "")) || 0)
    ) + 1;

  const addTable = () => {
    const newTable = {
      id: `Extras${getNextTableNumber()}`,
      data: clone(INITIAL_EXTRAS_TABLE),
    };
    const updated = [...tables, newTable];
    setTables(updated);
    updateService("extras", updated);
  };

  const deleteTable = (id) => {
    const updated = tables.filter((table) => table.id !== id);
    setTables(updated);
    updateService("extras", updated);
  };

  const handleSave = () => navigate("/services");

  const handleReset = () => {
    const defaults = getDefaultExtrasTables();
    setTables(defaults);
    updateService("extras", defaults);
    setResetNonce((value) => value + 1);
  };

  return (
    <div className="service-entry-page pruning-entry-page">
      <h2 style={{ marginBottom: "1rem" }}>Extras</h2>

      {tables.map((table, index) => (
        <div
          key={table.id}
          style={{
            marginBottom: "0.75rem",
            border: "1px solid #ccc",
            padding: "0.5rem",
            borderRadius: "4px",
            background: "#fafafa",
          }}
        >
          <ExtrasTable
            key={`${table.id}-${resetNonce}`}
            tableId={table.id}
            onDelete={index > 0 ? () => deleteTable(table.id) : null}
          />
        </div>
      ))}

      <div className="service-actions-stack">
        <button onClick={addTable} type="button">
          Add Extras Table
        </button>

        <div className="service-page-actions pruning-page-actions">
          <button className="save-project-button" onClick={handleSave} type="button">
            Save Extras
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
