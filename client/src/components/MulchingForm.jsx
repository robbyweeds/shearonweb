import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import MulchingPage from "./Mulching/MulchingPage";
import { INITIAL_MULCHING_DATA } from "./Mulching/mulchingDefaults";

const clone = (value) => JSON.parse(JSON.stringify(value));
const getDefaultMulchingTables = () => [
  { id: "Mulch1", data: clone(INITIAL_MULCHING_DATA) },
];

export default function MulchingForm() {
  const navigate = useNavigate();

  const { getAllServices, updateService } = useServiceContext();

  const [tables, setTables] = useState([]);

  useEffect(() => {
    const services = getAllServices();
    const mulching = Array.isArray(services.mulching)
      ? services.mulching
      : [];

    // if no tables yet, create one
    if (mulching.length === 0) {
      const first = getDefaultMulchingTables();
      setTables(first);
      updateService("mulching", first);
    } else {
      setTables(mulching);
    }
  }, [getAllServices, updateService]);

  const getNextTableNumber = () =>
    Math.max(
      0,
      ...tables.map((table) => Number(String(table.id).replace("Mulch", "")) || 0)
    ) + 1;

  const addTable = () => {
    const newId = `Mulch${getNextTableNumber()}`;
    const updated = [...tables, { id: newId, data: clone(INITIAL_MULCHING_DATA) }];

    updateService("mulching", updated);
    setTables(updated);
  };

  const deleteTable = (id) => {
    const updated = tables.filter((table) => table.id !== id);
    updateService("mulching", updated);
    setTables(updated);
  };

  const handleSave = () => {
    navigate("/services");
  };

  const handleReset = () => {
    const defaults = getDefaultMulchingTables();
    updateService("mulching", defaults);
    setTables(defaults);
  };

  return (
    <div className="service-entry-page">
      <h2>Mulching</h2>

      <div className="service-top-actions">
        <button className="save-project-button" onClick={handleSave} type="button">
          Save Mulching
        </button>
        <button className="secondary-button" onClick={() => navigate(-1)} type="button">
          Back
        </button>
      </div>

      {tables.map((t, index) => (
        <MulchingPage
          key={t.id}
          tableId={t.id}
          onDelete={index > 0 ? () => deleteTable(t.id) : null}
        />
      ))}

      <div className="service-tool-row">
        <button onClick={addTable} type="button">Add Mulching Table</button>

        <button onClick={() => navigate("/mulching-rates")} type="button">
          Edit Mulching Rates
        </button>
      </div>

      <div className="service-page-actions">
        <button className="save-project-button" onClick={handleSave} type="button">
          Save Mulching
        </button>
        <button className="danger-button" onClick={handleReset} type="button">
          Reset
        </button>
        <button
          className="secondary-button"
          onClick={() => navigate(-1)}
          type="button"
        >
          Back
        </button>
      </div>
    </div>
  );
}
