// myapp/client/src/components/MowingForm.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import MowingTable from "./Mowing/MowingTable";
import ServiceTablesWrapper from "./ServiceTablesWrapper";

export default function MowingForm() {
  const navigate = useNavigate();

  const { currentServices, updateService, getAllServices } =
    useServiceContext();

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
      const first = [{ id: "Mowing1", data: {} }];
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
    const updated = [...tables, { id: newId, data: {} }];

    updateService("mowing", updated);
    setTables(updated);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Service Entry</h2>

      {/* Edging + Bed Maintenance stay attached and never reset */}
      <ServiceTablesWrapper />

      <h3 style={{ marginTop: "2rem" }}>Mowing</h3>

      {tables.map((t) => (
        <MowingTable key={t.id} tableId={t.id} />
      ))}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={addTable}>Add Mowing Table</button>

        <button
          onClick={() => navigate("/mowing-rates")}
          style={{ marginLeft: "1rem" }}
        >
          Edit Mowing Rates
        </button>
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{ marginTop: "2rem" }}
      >
        Back
      </button>
    </div>
  );
}
