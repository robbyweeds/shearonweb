import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import { INITIAL_MOWING_DATA } from "./Mowing/mowingDefaults";
import { computeHours, computeTotals } from "./Mowing/mowingCalculations";

const API_URL = process.env.REACT_APP_API_URL || "";
const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const SAVED_RATES_KEY = "__rates";

export default function ServicesPage() {
  const navigate = useNavigate();
  const { currentServices, updateService, getAllServices, currentRates } =
    useServiceContext();

  const [project, setProject] = useState({
    projectName: "",
    date: "",
    acres: "",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("project"));
    if (stored) setProject(stored);
  }, []);

  const deleteMowing = (id) =>
    updateService(
      "mowing",
      (currentServices.mowing || []).filter((m) => m.id !== id)
    );

  const deleteMulching = (id) =>
    updateService(
      "mulching",
      (currentServices.mulching || []).filter((m) => m.id !== id)
    );

  const deletePruning = (id) =>
    updateService(
      "pruning",
      (currentServices.pruning || []).filter((p) => p.id !== id)
    );

  const deleteEdging = () => updateService("edging", null);
  const deleteBedMaintenance = () => updateService("bedMaintenance", null);
  const deleteLeaves = () => updateService("leaves", null);

  const acresPerHour = currentRates?.mowingFactors?.acresPerHour || {};
  const mowingDollars = currentRates?.mowingDollars || {};

  const computeMowingPreview = (entry) => {
    const raw = entry.data || {};

    const merged = {
      ...INITIAL_MOWING_DATA,
      ...raw,
      acres: { ...INITIAL_MOWING_DATA.acres, ...(raw.acres || {}) },
      qtyUnit: { ...INITIAL_MOWING_DATA.qtyUnit, ...(raw.qtyUnit || {}) },
      selectedEfficiency: {
        ...INITIAL_MOWING_DATA.selectedEfficiency,
        ...(raw.selectedEfficiency || {}),
      },
      manualOverrides: {
        ...INITIAL_MOWING_DATA.manualOverrides,
        ...(raw.manualOverrides || {}),
      },
      summary: {
        ...INITIAL_MOWING_DATA.summary,
        ...(raw.summary || {}),
      },
    };

    const qty = computeHours(merged, acresPerHour);
    const totals = computeTotals(merged, qty, mowingDollars);
    return { merged, totals };
  };

  const computeEdgingTotals = (entry) => {
    if (!entry || !entry.data) return null;

    const d = entry.data;
    const qty = d.qtyUnit || { EDGER: 0, BLOWER: 0 };
    const price = d.unitPrice || { EDGER: 0, BLOWER: 0 };
    const occ = d.summary?.numOccurrences || 0;
    const pricePerOcc = qty.EDGER * price.EDGER + qty.BLOWER * price.BLOWER;

    return { occ, pricePerOcc, finalTotal: pricePerOcc * occ };
  };

  const computeBedTotals = (entry) => {
    if (!entry || !entry.data) return null;

    const d = entry.data;
    const qty = d.qtyUnit || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
    const price = d.unitPrice || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
    const occ = d.summary?.numOccurrences || 0;
    const pricePerOcc =
      qty.HAND * price.HAND +
      qty.BACKPACK * price.BACKPACK +
      qty.ROUNDUP * price.ROUNDUP;

    return { occ, pricePerOcc, finalTotal: pricePerOcc * occ };
  };

  const computePruningTotals = (entry) => {
    if (!entry || !entry.data) return null;

    const d = entry.data;
    const qty = d.qty || {
      MISC: 0,
      HAND: 0,
      SHEARS: 0,
      CLEANUP: 0,
      CHAINSAW: 0,
    };

    const price = d.unitPrice || {
      MISC: 0,
      HAND: 0,
      SHEARS: 0,
      CLEANUP: 0,
      CHAINSAW: 0,
    };

    const occ = Number(d.occurrences) || Number(d.summary?.numOccurrences) || 0;
    const pricePerOcc =
      qty.MISC * price.MISC +
      qty.HAND * price.HAND +
      qty.SHEARS * price.SHEARS +
      qty.CLEANUP * price.CLEANUP +
      qty.CHAINSAW * price.CHAINSAW;

    return { occ, pricePerOcc, totalDollar: pricePerOcc * occ };
  };

  const summaryRows = (() => {
    const rows = [];
    const mowingEntries = Array.isArray(currentServices.mowing)
      ? currentServices.mowing
      : [];
    const mulchingEntries = Array.isArray(currentServices.mulching)
      ? currentServices.mulching
      : [];
    const pruningEntries = Array.isArray(currentServices.pruning)
      ? currentServices.pruning
      : [];

    mowingEntries.forEach((entry) => {
      const { merged, totals } = computeMowingPreview(entry);
      const occ = Number(merged.summary?.numOccurrences || 0);
      if (occ <= 0) return;

      rows.push({
        id: `mowing-${entry.id}`,
        label: merged.name || "Mowing Area",
        occ,
        pricePerOcc: totals.adjustedOcc,
        total: totals.final,
        onDelete: () => deleteMowing(entry.id),
      });
    });

    mulchingEntries.forEach((entry) => {
      const data = entry.data || {};
      const occ = Number(data.summary?.numOccurrences || 0);
      if (occ <= 0) return;

      rows.push({
        id: `mulching-${entry.id}`,
        label: data.name || "Mulching Area",
        occ,
        pricePerOcc: 0,
        total: 0,
        onDelete: () => deleteMulching(entry.id),
      });
    });

    pruningEntries.forEach((entry) => {
      const calc = computePruningTotals(entry);
      if (!calc || Number(calc.occ || 0) <= 0) return;

      rows.push({
        id: `pruning-${entry.id}`,
        label: entry.data?.name || "Pruning Area",
        occ: calc.occ,
        pricePerOcc: calc.pricePerOcc,
        total: calc.totalDollar,
        onDelete: () => deletePruning(entry.id),
      });
    });

    if (currentServices.edging) {
      const entry = Array.isArray(currentServices.edging)
        ? currentServices.edging[0]
        : currentServices.edging;
      const calc = computeEdgingTotals(entry);

      if (calc && Number(calc.occ || 0) > 0) {
        rows.push({
          id: "edging",
          label: "Edging",
          occ: calc.occ,
          pricePerOcc: calc.pricePerOcc,
          total: calc.finalTotal,
          onDelete: deleteEdging,
        });
      }
    }

    if (currentServices.bedMaintenance) {
      const entry = Array.isArray(currentServices.bedMaintenance)
        ? currentServices.bedMaintenance[0]
        : currentServices.bedMaintenance;
      const calc = computeBedTotals(entry);

      if (calc && Number(calc.occ || 0) > 0) {
        rows.push({
          id: "bedMaintenance",
          label: "Bed Maintenance",
          occ: calc.occ,
          pricePerOcc: calc.pricePerOcc,
          total: calc.finalTotal,
          onDelete: deleteBedMaintenance,
        });
      }
    }

    if (currentServices.leaves) {
      rows.push({
        id: "leaves",
        label: currentServices.leaves.area || "Leaves",
        occ: currentServices.leaves.quantity || "Saved",
        pricePerOcc: null,
        total: null,
        onDelete: deleteLeaves,
      });
    }

    return rows;
  })();

  const projectTotal = summaryRows.reduce(
    (total, row) => total + (typeof row.total === "number" ? row.total : 0),
    0
  );

  const handleSaveProject = async () => {
    const services = getAllServices() || {};
    const sanitized = {};

    Object.entries(services).forEach(([k, v]) => {
      sanitized[k] = v || {};
    });

    sanitized[SAVED_RATES_KEY] = currentRates || {};

    if (!project.projectName || !project.date || !project.acres) {
      alert("Project info is missing");
      return;
    }

    const isExistingProject = Boolean(project.id);
    const url = isExistingProject
      ? `${API_URL}/project/${project.id}`
      : `${API_URL}/project`;

    try {
      const response = await fetch(url, {
        method: isExistingProject ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, services: sanitized }),
      });

      const json = await response.json();
      if (json.success) {
        const savedProject = { ...project, id: json.projectId || project.id };
        setProject(savedProject);
        localStorage.setItem("project", JSON.stringify(savedProject));
        alert(isExistingProject ? "Project updated" : "Project saved");
        navigate("/");
      } else {
        alert(json.error);
      }
    } catch (err) {
      console.log(err);
      alert("Network error");
    }
  };

  return (
    <main className="app-shell single-column">
      <section className="workspace-panel wide-panel">
        <div className="services-header">
          <div className="page-title">
            <p>Service Builder</p>
            <h1>{project.projectName || "New Project"}</h1>
          </div>
          <div className="header-actions">
            <button className="secondary-button" onClick={() => navigate("/")} type="button">Main Page</button>
            <button onClick={handleSaveProject} type="button">
              Save Project
            </button>
          </div>
        </div>

        <div className="summary-strip">
          <div>
            <span>Date</span>
            <strong>{project.date || "Not set"}</strong>
          </div>
          <div>
            <span>Acres</span>
            <strong>{project.acres || "0"}</strong>
          </div>
          <div>
            <span>Estimated Total</span>
            <strong>{money(projectTotal)}</strong>
          </div>
        </div>

        <section className="service-actions" aria-label="Add services">
          <button onClick={() => navigate("/services/mowing")} type="button">Mowing</button>
          <button onClick={() => navigate("/services/mulching")} type="button">Mulching</button>
          <button onClick={() => navigate("/services/pruning")} type="button">Pruning</button>
          <button onClick={() => navigate("/services/leaves")} type="button">Leaves</button>
        </section>

        <section className="summary-panel">
          <div className="section-heading">
            <span>Service Summary</span>
            <strong>{summaryRows.length} saved</strong>
          </div>

          {summaryRows.length === 0 ? (
            <div className="empty-state">Add a service to start building this project.</div>
          ) : (
            <div className="table-wrap">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Occurrences</th>
                    <th>Price / Occ</th>
                    <th>Total</th>
                    <th aria-label="Actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.label}</td>
                      <td>{row.occ}</td>
                      <td>{row.pricePerOcc === null ? "-" : money(row.pricePerOcc)}</td>
                      <td>{row.total === null ? "-" : money(row.total)}</td>
                      <td>
                        <button className="danger-button compact-button" onClick={row.onDelete} type="button">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">Estimated Project Total</td>
                    <td>{money(projectTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
