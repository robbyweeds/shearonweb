import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../../context/ServiceContext";
import TurfAppTable from "./TurfAppTable";
import { INITIAL_TURF_APP_DATA } from "./turfAppDefaults";

const clone = (value) => JSON.parse(JSON.stringify(value));
const getDefaultTurfAppTables = () =>
  Array.from({ length: 5 }, (_, index) => ({
    id: `TurfApp${index + 1}`,
    data: {
      ...clone(INITIAL_TURF_APP_DATA),
      name: `Turf Application #${index + 1}`,
    },
  }));

export default function TurfAppForm() {
  const navigate = useNavigate();
  const { updateService, getAllServices } = useServiceContext();

  const [tables, setTables] = useState([]);

  useEffect(() => {
    const services = getAllServices();
    const turfApp = Array.isArray(services.turfApp) ? services.turfApp : [];

    if (turfApp.length === 0) {
      const defaults = getDefaultTurfAppTables();
      setTables(defaults);
      updateService("turfApp", defaults);
    } else {
      setTables(turfApp);
    }
  }, [getAllServices, updateService]);

  const getNextTableNumber = () =>
    Math.max(
      0,
      ...tables.map((table) => Number(String(table.id).replace("TurfApp", "")) || 0)
    ) + 1;

  const addTable = () => {
    const nextNumber = getNextTableNumber();
    const updated = [
      ...tables,
      {
        id: `TurfApp${nextNumber}`,
        data: {
          ...clone(INITIAL_TURF_APP_DATA),
          name: `Turf Application #${nextNumber}`,
        },
      },
    ];

    updateService("turfApp", updated);
    setTables(updated);
  };

  const deleteTable = (id) => {
    const updated = tables.filter((table) => table.id !== id);
    updateService("turfApp", updated);
    setTables(updated);
  };

  const handleSave = () => {
    navigate("/services");
  };

  const handleReset = () => {
    const defaults = getDefaultTurfAppTables();
    updateService("turfApp", defaults);
    setTables(defaults);
  };

  return (
    <div className="service-entry-page">
      <h2>Turf Application</h2>

      <div className="service-top-actions">
        <button className="save-project-button" onClick={handleSave} type="button">
          Save Turf App
        </button>
        <button className="secondary-button" onClick={() => navigate(-1)} type="button">
          Back
        </button>
      </div>

      {tables.map((table, index) => (
        <TurfAppTable
          key={table.id}
          tableId={table.id}
          index={index}
          onDelete={index >= 5 ? () => deleteTable(table.id) : null}
        />
      ))}

      <div className="service-tool-row">
        <button onClick={addTable} type="button">Add Turf App Table</button>

        <button onClick={() => navigate("/turf-app-rates")} type="button">
          Edit Turf App Rates
        </button>
      </div>

      <div className="service-page-actions">
        <button className="save-project-button" onClick={handleSave} type="button">
          Save Turf App
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
