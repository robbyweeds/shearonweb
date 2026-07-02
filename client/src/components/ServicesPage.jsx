// myapp/client/src/components/ServicesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import { INITIAL_MOWING_DATA } from "./Mowing/mowingDefaults";
import { computeHours, computeTotals } from "./Mowing/mowingCalculations";

export default function ServicesPage() {
  const navigate = useNavigate();
  const { currentServices, updateService, getAllServices, currentRates } =
    useServiceContext();

  const API_URL = process.env.REACT_APP_API_URL;

  // ---------------------------------------
  // PROJECT INFO
  // ---------------------------------------
  const [project, setProject] = useState({
    projectName: "",
    date: "",
    acres: "",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("project"));
    if (stored) setProject(stored);
  }, []);

  // ---------------------------------------
  // DELETE HANDLERS
  // ---------------------------------------
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

  // ---------------------------------------
  // COMPUTE MOWING PREVIEW
  // ---------------------------------------
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

  // ---------------------------------------
  // EDGING PREVIEW
  // ---------------------------------------
  const computeEdgingTotals = (entry) => {
    if (!entry || !entry.data) return null;

    const d = entry.data;
    const qty = d.qtyUnit || { EDGER: 0, BLOWER: 0 };
    const price = d.unitPrice || { EDGER: 0, BLOWER: 0 };
    const occ = d.summary?.numOccurrences || 0;

    const totalOccDollar =
      qty.EDGER * price.EDGER + qty.BLOWER * price.BLOWER;

    return {
      occ,
      pricePerOcc: totalOccDollar,
      finalTotal: totalOccDollar * occ,
    };
  };

  // ---------------------------------------
  // BED MAINT PREVIEW (SAFE)
  // ---------------------------------------
  const computeBedTotals = (entry) => {
    if (!entry || !entry.data) return null;

    const d = entry.data;
    const qty = d.qtyUnit || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
    const price = d.unitPrice || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
    const occ = d.summary?.numOccurrences || 0;

    const occDollar =
      qty.HAND * price.HAND +
      qty.BACKPACK * price.BACKPACK +
      qty.ROUNDUP * price.ROUNDUP;

    return {
      occ,
      pricePerOcc: occDollar,
      finalTotal: occDollar * occ,
    };
  };

  // ---------------------------------------
  // PRUNING PREVIEW (SAFE + FIXED OCC)
  // ---------------------------------------
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

    // FIX → correct field for occurrences
    const occ =
      Number(d.occurrences) ||
      Number(d.summary?.numOccurrences) ||
      0;

    const hoursPerOcc =
      qty.MISC +
      qty.HAND +
      qty.SHEARS +
      qty.CLEANUP +
      qty.CHAINSAW;

    const dollarPerOcc =
      qty.MISC * price.MISC +
      qty.HAND * price.HAND +
      qty.SHEARS * price.SHEARS +
      qty.CLEANUP * price.CLEANUP +
      qty.CHAINSAW * price.CHAINSAW;

    return {
      occ,
      hoursPerOcc,
      pricePerOcc: dollarPerOcc,
      totalDollar: dollarPerOcc * occ,
    };
  };

  // ---------------------------------------
  // SAVE PROJECT
  // ---------------------------------------
  const handleSaveProject = async () => {
    const services = getAllServices() || {};
    const sanitized = {};

    Object.entries(services).forEach(([k, v]) => {
      sanitized[k] = v || {};
    });

    if (!project.projectName || !project.date || !project.acres) {
      alert("Project info is missing");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, services: sanitized }),
      });

      const json = await response.json();
      if (json.success) {
        alert("Project Saved!");
        navigate("/");
      } else {
        alert(json.error);
      }
    } catch (err) {
      console.log(err);
      alert("Network Error");
    }
  };

  // ---------------------------------------
  // SHOW TABLE?
  // ---------------------------------------
  const hasAnyService =
    (currentServices.mowing?.length || 0) > 0 ||
    (currentServices.mulching?.length || 0) > 0 ||
    (currentServices.pruning?.length || 0) > 0 ||
    currentServices.edging ||
    currentServices.bedMaintenance;

  // ---------------------------------------
  // RENDER
  // ---------------------------------------
  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h2>Services for {project.projectName || "New Project"}</h2>

      {/* SERVICE ADD BUTTONS */}
      <section>
        <h3>Add Services</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/services/mowing")}>Add Mowing</button>
          <button onClick={() => navigate("/services/mulching")}>Add Mulching</button>
          <button onClick={() => navigate("/services/pruning")}>Add Pruning</button>
          <button onClick={() => navigate("/services/leaves")}>Add Leaves</button>
        </div>
      </section>

      <button onClick={handleSaveProject} style={{ margin: "1rem 0" }}>
        Save Project
      </button>

      {/* PROJECT SUMMARY */}
      <div style={{ borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
        <h3>Project Summary</h3>
        <p><strong>Project:</strong> {project.projectName}</p>
        <p><strong>Date:</strong> {project.date}</p>
        <p><strong>Acres:</strong> {project.acres}</p>

        {/* SERVICES SUMMARY */}
        {hasAnyService && (
          <div>
            <h3>Service Summary</h3>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Service</th>
                  <th style={th}>Occurrences</th>
                  <th style={th}>Price / Occ</th>
                  <th style={th}>Total</th>
                  <th style={th}></th>
                </tr>
              </thead>

              <tbody>

                {/* ---------------- MOWING ---------------- */}
                {currentServices.mowing?.map((t) => {
                  const { merged, totals } = computeMowingPreview(t);
                  const occ = merged.summary?.numOccurrences || 0;

                  return (
                    <tr key={t.id}>
                      <td style={td}>{merged.name || "Mowing Area"}</td>
                      <td style={tdCenter}>{occ}</td>
                      <td style={tdCenter}>${totals.adjDollar.toFixed(2)}</td>
                      <td style={tdCenter}>${totals.final.toFixed(2)}</td>
                      <td style={tdCenter}>
                        <button onClick={() => deleteMowing(t.id)} style={deleteBtn}>X</button>
                      </td>
                    </tr>
                  );
                })}

                {/* ---------------- MULCHING ---------------- */}
                {currentServices.mulching?.map((m) => {
                  const d = m.data || {};
                  const occ = d.summary?.numOccurrences || 0;
                  return (
                    <tr key={m.id}>
                      <td style={td}>{d.name || "Mulching Area"}</td>
                      <td style={tdCenter}>{occ}</td>
                      <td style={tdCenter}>$0.00</td>
                      <td style={tdCenter}>$0.00</td>
                      <td style={tdCenter}>
                        <button onClick={() => deleteMulching(m.id)} style={deleteBtn}>X</button>
                      </td>
                    </tr>
                  );
                })}

                {/* ---------------- PRUNING ---------------- */}
                {currentServices.pruning?.map((p) => {
                  const calc = computePruningTotals(p);
                  if (!calc) return null;

                  return (
                    <tr key={p.id}>
                      <td style={td}>{p.data?.name || "Pruning Area"}</td>
                      <td style={tdCenter}>{calc.occ}</td>
                      <td style={tdCenter}>${calc.pricePerOcc.toFixed(2)}</td>
                      <td style={tdCenter}>${calc.totalDollar.toFixed(2)}</td>
                      <td style={tdCenter}>
                        <button onClick={() => deletePruning(p.id)} style={deleteBtn}>X</button>
                      </td>
                    </tr>
                  );
                })}

                {/* ---------------- EDGING ---------------- */}
                {currentServices.edging && (() => {
                  const entry = Array.isArray(currentServices.edging)
                    ? currentServices.edging[0]
                    : currentServices.edging;

                  const calc = computeEdgingTotals(entry);
                  if (!calc) return null;

                  return (
                    <tr>
                      <td style={td}>Edging</td>
                      <td style={tdCenter}>{calc.occ}</td>
                      <td style={tdCenter}>${calc.pricePerOcc.toFixed(2)}</td>
                      <td style={tdCenter}>${calc.finalTotal.toFixed(2)}</td>
                      <td style={tdCenter}>
                        <button onClick={deleteEdging} style={deleteBtn}>X</button>
                      </td>
                    </tr>
                  );
                })()}

                {/* ---------------- BED MAINT ---------------- */}
                {currentServices.bedMaintenance && (() => {
                  const entry = Array.isArray(currentServices.bedMaintenance)
                    ? currentServices.bedMaintenance[0]
                    : currentServices.bedMaintenance;

                  const calc = computeBedTotals(entry);
                  if (!calc) return null;

                  return (
                    <tr>
                      <td style={td}>Bed Maintenance</td>
                      <td style={tdCenter}>{calc.occ}</td>
                      <td style={tdCenter}>${calc.pricePerOcc.toFixed(2)}</td>
                      <td style={tdCenter}>${calc.finalTotal.toFixed(2)}</td>
                      <td style={tdCenter}>
                        <button onClick={deleteBedMaintenance} style={deleteBtn}>X</button>
                      </td>
                    </tr>
                  );
                })()}

              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th = {
  borderBottom: "1px solid #ccc",
  textAlign: "center",
  padding: "4px",
};

const td = { padding: "4px" };

const tdCenter = { padding: "4px", textAlign: "center" };

const deleteBtn = {
  background: "#dc3545",
  color: "white",
  border: "none",
  padding: "4px 8px",
  borderRadius: "4px",
  cursor: "pointer",
};
