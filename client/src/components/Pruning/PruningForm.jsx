// myapp/client/src/components/Pruning/PruningForm.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../../context/ServiceContext";

import PruningTable from "./PruningTable";
import { INITIAL_PRUNING_TABLE } from "./pruningDefaults";

export default function PruningForm() {
  const { currentServices, updateService } = useServiceContext();
  const navigate = useNavigate();

  // Always use an array for pruning
  const initialList = Array.isArray(currentServices.pruning)
    ? currentServices.pruning
    : [];

  const [tables, setTables] = useState(initialList);

  // -----------------------------
  // Load pruning tables on mount
  // -----------------------------
  useEffect(() => {
    if (!Array.isArray(currentServices.pruning) || currentServices.pruning.length === 0) {
      const first = [{ id: "Pruning1", data: INITIAL_PRUNING_TABLE }];
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
      data: INITIAL_PRUNING_TABLE,
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

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
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
          <PruningTable tableId={t.id} />

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

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={addTable}
          style={{
            marginRight: "1rem",
            padding: "6px 12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Pruning Table
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "6px 12px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
