import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "./../context/ServiceContext";
import FlowersTable from "./Flowers/FlowersTable";
import { INITIAL_FLOWERS_TABLE } from "./Flowers/flowersDefaults";

const clone = (value) => JSON.parse(JSON.stringify(value));
const getDefaultFlowersTables = () => [
  { id: "Flowers1", data: clone(INITIAL_FLOWERS_TABLE) },
];

export default function FlowersForm() {
  const { currentServices, updateService } = useServiceContext();
  const navigate = useNavigate();
  const initialList = Array.isArray(currentServices.flowers) ? currentServices.flowers : [];
  const [tables, setTables] = useState(initialList);
  const [resetNonce, setResetNonce] = useState(0);

  useEffect(() => {
    if (!Array.isArray(currentServices.flowers) || currentServices.flowers.length === 0) {
      const defaults = getDefaultFlowersTables();
      setTables(defaults);
      updateService("flowers", defaults);
    } else {
      setTables(currentServices.flowers);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNextTableNumber = () =>
    Math.max(
      0,
      ...tables.map((table) => Number(String(table.id).replace("Flowers", "")) || 0)
    ) + 1;

  const addTable = () => {
    const newTable = {
      id: `Flowers${getNextTableNumber()}`,
      data: clone(INITIAL_FLOWERS_TABLE),
    };
    const updated = [...tables, newTable];
    setTables(updated);
    updateService("flowers", updated);
  };

  const deleteTable = (id) => {
    const updated = tables.filter((table) => table.id !== id);
    setTables(updated);
    updateService("flowers", updated);
  };

  const handleSave = () => navigate("/services");

  const handleReset = () => {
    const defaults = getDefaultFlowersTables();
    setTables(defaults);
    updateService("flowers", defaults);
    setResetNonce((value) => value + 1);
  };

  return (
    <div className="service-entry-page" style={{ maxWidth: "1040px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Flowers</h2>

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
          <FlowersTable
            key={`${table.id}-${resetNonce}`}
            tableId={table.id}
            onDelete={index > 0 ? () => deleteTable(table.id) : null}
          />
        </div>
      ))}

      <div className="service-actions-stack">
        <button onClick={addTable} type="button">
          Add Flowers Table
        </button>

        <div className="service-page-actions pruning-page-actions">
          <button className="save-project-button" onClick={handleSave} type="button">
            Save Flowers
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
