// ===============================
// EdgingForm.jsx — FINAL VERSION
// ===============================
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";
import EdgingTable from "./EdgingTable";

export default function EdgingForm() {
  const navigate = useNavigate();
  const { currentServices, updateService } = useServiceContext();

  // ------------------------------------------
  // INITIALIZE EDGING — RUN ONLY ONCE
  // ------------------------------------------
  useEffect(() => {
    const list = currentServices.edging;

    // No edging table exists → create one
    if (!Array.isArray(list) || list.length === 0) {
      updateService("edging", [{ id: "Edging1", data: {} }]);
    }

    // If duplicates exist → keep the first, discard extras
    else if (list.length > 1) {
      updateService("edging", [list[0]]);
    }

    // NOTE: THIS RUNS ONLY ON FIRST PAGE LOAD
    // NOT on every edging update, so it no longer wipes data.
  }, []);  // <-- CRITICAL: EMPTY DEPENDENCY ARRAY

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Edging Service</h2>

      {/* Always render exactly one Edging table */}
      <EdgingTable tableId="Edging1" />

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
