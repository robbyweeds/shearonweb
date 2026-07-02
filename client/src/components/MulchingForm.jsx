import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import MulchingPage from "./Mulching/MulchingPage";

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
      const first = [{ id: "Mulch1", data: {} }];
      setTables(first);
      updateService("mulching", first);
    } else {
      setTables(mulching);
    }
  }, [getAllServices, updateService]);

  const addTable = () => {
    const newId = `Mulch${tables.length + 1}`;
    const updated = [...tables, { id: newId, data: {} }];

    updateService("mulching", updated);
    setTables(updated);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Mulching</h2>

      {tables.map((t) => (
        <MulchingPage key={t.id} tableId={t.id} />
      ))}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={addTable}>Add Mulching Table</button>

        <button
          onClick={() => navigate("/mulching-rates")}
          style={{ marginLeft: "1rem" }}
        >
          Edit Mulching Rates
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
