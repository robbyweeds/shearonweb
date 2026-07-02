// =====================================
// SpringForm.jsx
// =====================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../../context/ServiceContext";
import SpringTable from "./SpringTable";

export default function SpringForm() {
  const navigate = useNavigate();
  const { currentServices, updateService } = useServiceContext();

  const [tables, setTables] = useState([]);

  useEffect(() => {
    const list = Array.isArray(currentServices.springServices)
      ? currentServices.springServices
      : [];

    if (list.length === 0) {
      const first = [{ id: "Spring1", data: {} }];
      updateService("springServices", first);
      setTables(first);
    } else {
      setTables(list);
    }
  }, [currentServices.springServices, updateService]);

  const addTable = () => {
    const newId = `Spring${tables.length + 1}`;
    const updated = [...tables, { id: newId, data: {} }];
    updateService("springServices", updated);
    setTables(updated);
  };

  const deleteTable = (id) => {
    const updated = tables.filter((t) => t.id !== id);
    updateService("springServices", updated);
    setTables(updated);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Spring Services</h2>

      {tables.map((t) => (
        <div key={t.id} style={{ border: "1px solid #ccc", padding: "6px" }}>
          <SpringTable tableId={t.id} />

          <button
            onClick={() => deleteTable(t.id)}
            style={{
              background: "#dc3545",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              marginTop: "4px",
            }}
          >
            Delete
          </button>
        </div>
      ))}

      <button onClick={addTable} style={{ marginTop: "1rem" }}>
        Add Spring Table
      </button>

      <button onClick={() => navigate(-1)} style={{ marginLeft: "1rem" }}>
        Back
      </button>
    </div>
  );
}
