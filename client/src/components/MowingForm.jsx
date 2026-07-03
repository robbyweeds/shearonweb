// myapp/client/src/components/MowingForm.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import MowingTable from "./Mowing/MowingTable";
import ServiceTablesWrapper from "./ServiceTablesWrapper";
import { INITIAL_MOWING_DATA } from "./Mowing/mowingDefaults";

const clone = (value) => JSON.parse(JSON.stringify(value));
const getDefaultMowingTables = () => [
  { id: "Mowing1", data: clone(INITIAL_MOWING_DATA) },
];

export default function MowingForm() {
  const navigate = useNavigate();

  const { updateService, getAllServices } = useServiceContext();

  const [tables, setTables] = useState([]);

  // ---------------------------------------------------------
  // SAFE LOAD — does NOT wipe edging/bedMaintenance anymore
  // ---------------------------------------------------------
  useEffect(() => {
    const services = getAllServices();
    const mowing = Array.isArray(services.mowing)
      ? services.mowing
      : [];

    // If no mowing tables, create the first one locally AND in context
    if (mowing.length === 0) {
      const first = getDefaultMowingTables();
      setTables(first);
      updateService("mowing", first);
    } else {
      setTables(mowing);
    }
  }, [getAllServices, updateService]);

  // ---------------------------------------------------------
  // Add new mowing table
  // ---------------------------------------------------------
  const addTable = () => {
    const newId = `Mowing${tables.length + 1}`;
    const updated = [...tables, { id: newId, data: clone(INITIAL_MOWING_DATA) }];

    updateService("mowing", updated);
    setTables(updated);
  };

  const handleSave = () => {
    navigate("/services");
  };

  const handleReset = () => {
    const defaults = getDefaultMowingTables();
    updateService("mowing", defaults);
    setTables(defaults);
  };

  return (
    <div className="service-entry-page">
      <h2>Service Entry</h2>

      {/* Edging + Bed Maintenance stay attached and never reset */}
      <ServiceTablesWrapper />

      <h3 style={{ marginTop: "2rem" }}>Mowing</h3>

      {tables.map((t) => (
        <MowingTable key={t.id} tableId={t.id} />
      ))}

      <div className="service-tool-row">
        <button onClick={addTable} type="button">Add Mowing Table</button>

        <button onClick={() => navigate("/mowing-rates")} type="button">
          Edit Mowing Rates
        </button>
      </div>

      <div className="service-page-actions">
        <button onClick={handleSave} type="button">
          Save
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
