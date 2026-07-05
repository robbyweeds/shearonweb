import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import { INITIAL_MOWING_DATA } from "./Mowing/mowingDefaults";
import { computeHours, computeTotals } from "./Mowing/mowingCalculations";
import { computeMulchingTotals } from "./Mulching/mulchingCalculations";
import { DEFAULT_MULCHING_RATES } from "./Mulching/mulchingDefaults";
import { computeTurfAppTotals } from "./TurfApp/turfAppCalculations";
import { DEFAULT_TURF_APP_RATES, INITIAL_TURF_APP_DATA } from "./TurfApp/turfAppDefaults";
import { formatCurrency } from "../utils/formatters";
import { computeExtrasTotals, mergeExtrasTable } from "./Extras/extrasCalculations";
import { computeFlowersTotals, mergeFlowersTable } from "./Flowers/flowersCalculations";
import { computeLeavesTotals, mergeLeavesData, mergeLeavesRates } from "./Leaves/leavesCalculations";
import { DEFAULT_LEAVES_RATES } from "./Leaves/leavesDefaults";
import { computeSpringCleanupTableTotals, mergeSpringCleanupData } from "./SpringCleanup/springCleanupCalculations";
import { SPRING_CLEANUP_TABLES } from "./SpringCleanup/springCleanupDefaults";

const API_URL = process.env.REACT_APP_API_URL || "";
const money = formatCurrency;
const SAVED_RATES_KEY = "__rates";

const formatShortDate = (value) => {
  if (!value) return "Not set";

  const [year, month, day] = String(value).split("T")[0].split("-");
  if (!year || !month || !day) return value;

  return `${month}/${day}/${year.slice(-2)}`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const filenameSafe = (value) =>
  String(value || "service-preview")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "service-preview";

export default function ServicesPage() {
  const navigate = useNavigate();
  const { currentServices, updateService, getAllServices, currentRates } =
    useServiceContext();

  const [project, setProject] = useState({
    projectName: "",
    date: "",
    acres: "",
  });
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [draftProjectName, setDraftProjectName] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("project"));
    if (stored) {
      setProject(stored);
      setDraftProjectName(stored.projectName || "");
    }
  }, []);

  const handleProjectFieldChange = (field, value) => {
    setProject((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem("project", JSON.stringify(updated));
      return updated;
    });
  };

  const handleProjectNameButton = () => {
    if (!isEditingProjectName) {
      setDraftProjectName(project.projectName || "");
      setIsEditingProjectName(true);
      return;
    }

    const nextName = draftProjectName.trim();
    if (!nextName) {
      alert("Project name is required");
      return;
    }

    handleProjectFieldChange("projectName", nextName);
    setIsEditingProjectName(false);
  };

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
  const deleteSpringCleanup = () => updateService("springCleanup", null);
  const deleteTurfApp = (id) =>
    updateService(
      "turfApp",
      (currentServices.turfApp || []).filter((t) => t.id !== id)
    );

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
      const rates = currentRates?.mulchingRates || DEFAULT_MULCHING_RATES;
      const calc = computeMulchingTotals(data, rates);
      const occ = Number(calc.occurrences || 0);
      if (occ <= 0) return;

      rows.push({
        id: `mulching-${entry.id}`,
        label: data.name || "Mulch",
        occ,
        pricePerOcc: calc.totalOcc,
        total: calc.totalPrice,
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
          label: entry.data?.name || "Edging",
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
          label: entry.data?.name || "Bed Maintenance",
          occ: calc.occ,
          pricePerOcc: calc.pricePerOcc,
          total: calc.finalTotal,
          onDelete: deleteBedMaintenance,
        });
      }
    }

    if (currentServices.leaves) {
      const merged = mergeLeavesData(currentServices.leaves);
      const leavesRates = mergeLeavesRates(currentRates?.leavesRates || DEFAULT_LEAVES_RATES);
      const totals = computeLeavesTotals(merged, leavesRates);
      const occ = Number(merged.occurrences || 0);

      if (occ > 0) {
        rows.push({
          id: "leaves",
          label: merged.name || "Fall Cleanup",
          occ,
          pricePerOcc: totals.dollarsPerOcc,
          total: totals.final,
          onDelete: deleteLeaves,
        });
      }
    }

    if (currentServices.springCleanup) {
      const merged = mergeSpringCleanupData(currentServices.springCleanup);

      Object.entries(SPRING_CLEANUP_TABLES).forEach(([tableKey, definition]) => {
        const table = merged.tables[tableKey];
        const totals = computeSpringCleanupTableTotals(tableKey, table);
        const occ = Number(table.occurrences || 0);
        if (occ <= 0) return;

        rows.push({
          id: `springCleanup-${tableKey}`,
          label: definition.title,
          occ,
          pricePerOcc: totals.dollarsPerOcc,
          total: totals.totalDollars,
          onDelete: deleteSpringCleanup,
        });
      });

      merged.extraTables.forEach((table) => {
        const definition = SPRING_CLEANUP_TABLES[table.definitionKey];
        const totals = computeSpringCleanupTableTotals(table.definitionKey, table);
        const occ = Number(table.occurrences || 0);
        if (occ <= 0) return;

        rows.push({
          id: `springCleanup-${table.id}`,
          label: table.title || definition.title,
          occ,
          pricePerOcc: totals.dollarsPerOcc,
          total: totals.totalDollars,
          onDelete: deleteSpringCleanup,
        });
      });
    }

    const turfEntries = Array.isArray(currentServices.turfApp)
      ? currentServices.turfApp
      : [];
    const turfRates = {
      ...DEFAULT_TURF_APP_RATES,
      ...(currentRates?.turfAppRates || {}),
    };

    turfEntries.forEach((entry, index) => {
      const raw = entry.data || {};
      const merged = {
        ...INITIAL_TURF_APP_DATA,
        ...raw,
        name: raw.name || `Turf Application #${index + 1}`,
        qtyUnit: {
          ...INITIAL_TURF_APP_DATA.qtyUnit,
          ...(raw.qtyUnit || {}),
        },
        summary: {
          ...INITIAL_TURF_APP_DATA.summary,
          ...(raw.summary || {}),
        },
      };
      const totals = computeTurfAppTotals(merged, turfRates);
      const occ = Number(merged.summary?.numOccurrences || 0);
      if (occ <= 0) return;

      rows.push({
        id: `turfApp-${entry.id}`,
        label: merged.name || "Turf App",
        occ,
        pricePerOcc: totals.totalOcc,
        total: totals.final,
        onDelete: () => deleteTurfApp(entry.id),
      });
    });

    const flowerEntries = Array.isArray(currentServices.flowers)
      ? currentServices.flowers
      : [];

    flowerEntries.forEach((entry, index) => {
      const merged = mergeFlowersTable({
        ...(entry.data || {}),
        name: entry.data?.name || `Flowers #${index + 1}`,
      });
      const totals = computeFlowersTotals(merged);
      const occ = Number(merged.occurrences || 0);
      if (occ <= 0) return;

      rows.push({
        id: `flowers-${entry.id}`,
        label: merged.name || "Flowers",
        occ,
        pricePerOcc: totals.dollarsPerOcc,
        total: totals.totalDollars,
        onDelete: () => updateService(
          "flowers",
          (currentServices.flowers || []).filter((table) => table.id !== entry.id)
        ),
      });
    });

    const extrasEntries = Array.isArray(currentServices.extras)
      ? currentServices.extras
      : [];

    extrasEntries.forEach((entry, index) => {
      const merged = mergeExtrasTable({
        ...(entry.data || {}),
        name: entry.data?.name || `Extras #${index + 1}`,
      });
      const totals = computeExtrasTotals(merged);
      const occ = Number(merged.occurrences || 0);
      if (occ <= 0) return;

      rows.push({
        id: `extras-${entry.id}`,
        label: merged.name || "Extras",
        occ,
        pricePerOcc: totals.dollarsPerOcc,
        total: totals.totalDollars,
        onDelete: () => updateService(
          "extras",
          (currentServices.extras || []).filter((table) => table.id !== entry.id)
        ),
      });
    });

    return rows;
  })();

  const projectTotal = summaryRows.reduce(
    (total, row) => total + (typeof row.total === "number" ? row.total : 0),
    0
  );

  const handleDownloadPreview = () => {
    if (summaryRows.length === 0) {
      alert("Add a service before downloading the preview.");
      return;
    }

    const propertyName = project.projectName || "New Project";
    const date = formatShortDate(project.date);
    const acres = project.acres || "Not set";
    const rows = summaryRows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.label)}</td>
            <td>${escapeHtml(row.occ)}</td>
            <td>${row.pricePerOcc === null ? "-" : escapeHtml(money(row.pricePerOcc))}</td>
            <td>${row.total === null ? "-" : escapeHtml(money(row.total))}</td>
          </tr>`
      )
      .join("");

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(propertyName)} Service Preview</title>
  <style>
    body {
      color: #17211b;
      font-family: Arial, Helvetica, sans-serif;
      margin: 40px;
    }
    h1 {
      font-size: 28px;
      margin: 0 0 16px;
    }
    .project-meta {
      border-bottom: 2px solid #236b4a;
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-bottom: 28px;
      padding-bottom: 18px;
    }
    .project-meta span {
      color: #66706a;
      display: block;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .project-meta strong {
      font-size: 16px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th,
    td {
      border-bottom: 1px solid #d9dfd8;
      padding: 12px 10px;
      text-align: left;
    }
    th:not(:first-child),
    td:not(:first-child) {
      text-align: right;
    }
    th {
      color: #66706a;
      font-size: 12px;
      text-transform: uppercase;
    }
    tfoot td {
      border-bottom: 0;
      font-weight: 700;
    }
    @media print {
      body {
        margin: 24px;
      }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(propertyName)}</h1>
  <section class="project-meta">
    <div><span>Property Name</span><strong>${escapeHtml(propertyName)}</strong></div>
    <div><span>Acres</span><strong>${escapeHtml(acres)}</strong></div>
    <div><span>Date</span><strong>${escapeHtml(date)}</strong></div>
  </section>
  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th>Occurrences</th>
        <th>Price / Occ</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3">Estimated Project Total</td>
        <td>${escapeHtml(money(projectTotal))}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenameSafe(propertyName)}-service-preview.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

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
            <div className="editable-project-title">
              {isEditingProjectName ? (
                <input
                  value={draftProjectName}
                  onChange={(e) => setDraftProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleProjectNameButton();
                  }}
                  aria-label="Project name"
                  autoFocus
                />
              ) : (
                <h1>{project.projectName || "New Project"}</h1>
              )}
              <button className="secondary-button compact-button" onClick={handleProjectNameButton} type="button">
                {isEditingProjectName ? "Save New Name" : "Edit Name"}
              </button>
            </div>
          </div>
          <div className="header-actions">
            <button className="secondary-button" onClick={() => navigate("/")} type="button">Main Page</button>
            <button className="save-project-button" onClick={handleSaveProject} type="button">
              Save Project
            </button>
          </div>
        </div>

        <div className="summary-strip">
          <div>
            <span>Date</span>
            <strong>{formatShortDate(project.date)}</strong>
          </div>
          <div>
            <label className="summary-field-label" htmlFor="project-acres">
              Acres
            </label>
            <input
              id="project-acres"
              className="summary-field-input"
              type="number"
              value={project.acres || ""}
              onChange={(e) => handleProjectFieldChange("acres", e.target.value)}
              step="0.01"
              min="0"
              placeholder="0.00"
            />
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
          <button onClick={() => navigate("/services/spring-cleanup")} type="button">Spring Cleanup</button>
          <button onClick={() => navigate("/services/turf-app")} type="button">Turf App</button>
          <button onClick={() => navigate("/services/flowers")} type="button">Flowers</button>
          <button onClick={() => navigate("/services/extras")} type="button">Extras</button>
        </section>

        <section className="summary-panel">
          <div className="section-heading">
            <span>Service Summary</span>
            <div className="summary-heading-actions">
              <strong>{summaryRows.length} services</strong>
              <button
                className="secondary-button compact-button"
                disabled={summaryRows.length === 0}
                onClick={handleDownloadPreview}
                type="button"
              >
                Download Chart
              </button>
            </div>
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
