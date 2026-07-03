// myapp/client/src/components/Pruning/PruningForm.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../../context/ServiceContext";

import PruningTable from "./PruningTable";
import { INITIAL_PRUNING_TABLE } from "./pruningDefaults";

const clone = (value) => JSON.parse(JSON.stringify(value));
const getDefaultPruningTables = () => [
  { id: "Pruning1", data: clone(INITIAL_PRUNING_TABLE) },
];

export default function PruningForm() {
  const { currentServices, updateService } = useServiceContext();
  const navigate = useNavigate();

  // Always use an array for pruning
  const initialList = Array.isArray(currentServices.pruning)
    ? currentServices.pruning
    : [];

  const [tables, setTables] = useState(initialList);
  const [resetNonce, setResetNonce] = useState(0);

  // -----------------------------
  // Load pruning tables on mount
  // -----------------------------
  useEffect(() => {
    if (!Array.isArray(currentServices.pruning) || currentServices.pruning.length === 0) {
      const first = getDefaultPruningTables();
      setTables(first);
      updateService("pruning", first); // save initial
    } else {
      setTables(currentServices.pruning);
    }
  }, []);

  // -----------------------------
  // Add new pruning table
  // -----------------------------
  const addTable = () => {
    const newId = `Pruning${tables.length + 1}`;

    const newTable = {
      id: newId,
      data: clone(INITIAL_PRUNING_TABLE),
    };

    const updated = [...tables, newTable];

    setTables(updated);
    updateService("pruning", updated);
  };

  // -----------------------------
  // Delete table by ID
  // -----------------------------
  const deleteTable = (id) => {
    const updated = tables.filter((t) => t.id !== id);

    setTables(updated);
    updateService("pruning", updated);
  };

  const handleSave = () => {
    navigate("/services");
  };

  const handleReset = () => {
    const defaults = getDefaultPruningTables();
    setTables(defaults);
    updateService("pruning", defaults);
    setResetNonce((value) => value + 1);
  };

  return (
    <div className="service-entry-page pruning-entry-page">
      <h2 style={{ marginBottom: "1rem" }}>Pruning</h2>

      {tables.map((t) => (
        <div
          key={t.id}
          style={{
            marginBottom: "0.75rem",
            border: "1px solid #ccc",
            padding: "0.5rem",
            borderRadius: "4px",
            background: "#fafafa",
          }}
        >
          <PruningTable key={`${t.id}-${resetNonce}`} tableId={t.id} />

          <div style={{ textAlign: "right" }}>
            <button
              onClick={() => deleteTable(t.id)}
              style={{
                marginTop: "0.25rem",
                padding: "4px 8px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="service-page-actions pruning-page-actions">
        <button onClick={addTable} type="button">
          Add Pruning Table
        </button>

        <button onClick={handleSave} type="button">
          Save
        </button>

        <button className="danger-button" onClick={handleReset} type="button">
          Reset
        </button>

        <button className="secondary-button" onClick={() => navigate(-1)} type="button">
          Back
        </button>
      </div>
    </div>
  );
}
