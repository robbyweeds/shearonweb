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

const filenameSafe = (value) =>
  String(value || "service-preview")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "service-preview";

const pdfText = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const truncatePdfText = (value, maxLength) => {
  const text = String(value ?? "");
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength - 3)) + "...";
};

const addPdfText = (commands, text, x, y, size = 10) => {
  commands.push(
    "BT /F1 " + size + " Tf 1 0 0 1 " + x + " " + y + " Tm (" + pdfText(text) + ") Tj ET"
  );
};

const addPdfLine = (commands, x1, y1, x2, y2) => {
  commands.push("0.82 0.85 0.82 RG " + x1 + " " + y1 + " m " + x2 + " " + y2 + " l S");
};

const byteLength = (value) => new TextEncoder().encode(value).length;

const downloadPdfBlob = async (blob, filename) => {
  if (window.showSaveFilePicker) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "PDF file",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error(err);
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const buildServicePreviewPdf = ({ propertyName, date, acres, summaryRows, projectTotal }) => {
  const rows = summaryRows.map((row) => ({
    label: truncatePdfText(row.label, 34),
    occ: String(row.occ ?? ""),
    pricePerOcc: row.pricePerOcc === null ? "-" : money(row.pricePerOcc),
    total: row.total === null ? "-" : money(row.total),
  }));
  const pages = [];
  let rowIndex = 0;

  while (rowIndex < rows.length || pages.length === 0) {
    const commands = ["0.09 0.13 0.11 rg"];
    let y;

    if (pages.length === 0) {
      addPdfText(commands, propertyName, 40, 746, 24);
      addPdfText(commands, "Property Name", 40, 712, 8);
      addPdfText(commands, propertyName, 40, 696, 12);
      addPdfText(commands, "Acres", 244, 712, 8);
      addPdfText(commands, acres, 244, 696, 12);
      addPdfText(commands, "Date", 408, 712, 8);
      addPdfText(commands, date, 408, 696, 12);
      addPdfLine(commands, 40, 676, 572, 676);
      y = 642;
    } else {
      addPdfText(commands, propertyName + " Service Preview", 40, 746, 18);
      y = 712;
    }

    addPdfText(commands, "Service", 40, y, 9);
    addPdfText(commands, "Occurrences", 314, y, 9);
    addPdfText(commands, "Price / Occ", 414, y, 9);
    addPdfText(commands, "Total", 520, y, 9);
    addPdfLine(commands, 40, y - 10, 572, y - 10);
    y -= 34;

    while (rowIndex < rows.length && y > 124) {
      const row = rows[rowIndex];
      addPdfText(commands, row.label, 40, y, 10);
      addPdfText(commands, row.occ, 344, y, 10);
      addPdfText(commands, row.pricePerOcc, 414, y, 10);
      addPdfText(commands, row.total, 506, y, 10);
      addPdfLine(commands, 40, y - 10, 572, y - 10);
      y -= 24;
      rowIndex += 1;
    }

    if (rowIndex >= rows.length) {
      y -= 10;
      addPdfText(commands, "Estimated Project Total", 40, y, 12);
      addPdfText(commands, money(projectTotal), 506, y, 12);
    }

    pages.push(commands.join("\n"));
  }

  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const kids = [];
  pages.forEach((stream) => {
    const contentObjectNumber = objects.length;
    objects[contentObjectNumber] =
      "<< /Length " + byteLength(stream) + " >>\nstream\n" + stream + "\nendstream";

    const pageObjectNumber = objects.length;
    objects[pageObjectNumber] =
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents " +
      contentObjectNumber +
      " 0 R /Resources << /Font << /F1 3 0 R >> >> >>";
    kids.push(pageObjectNumber + " 0 R");
  });

  objects[2] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + pages.length + " >>";

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = byteLength(pdf);
    pdf += index + " 0 obj\n" + objects[index] + "\nendobj\n";
  }

  const xrefOffset = byteLength(pdf);
  pdf += "xref\n0 " + objects.length + "\n0000000000 65535 f \n";

  for (let index = 1; index < objects.length; index += 1) {
    pdf += String(offsets[index]).padStart(10, "0") + " 00000 n \n";
  }

  pdf +=
    "trailer\n<< /Size " +
    objects.length +
    " /Root 1 0 R >>\nstartxref\n" +
    xrefOffset +
    "\n%%EOF";

  return new Blob([pdf], { type: "application/pdf" });
};

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
        onEdit: () => navigate("/services/mowing"),
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
        onEdit: () => navigate("/services/mulching"),
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
        onEdit: () => navigate("/services/pruning"),
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
          onEdit: () => navigate("/services/mowing"),
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
          onEdit: () => navigate("/services/mowing"),
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
          onEdit: () => navigate("/services/leaves"),
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
          onEdit: () => navigate("/services/spring-cleanup"),
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
          onEdit: () => navigate("/services/spring-cleanup"),
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
        onEdit: () => navigate("/services/turf-app"),
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
        onEdit: () => navigate("/services/flowers"),
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
        onEdit: () => navigate("/services/extras"),
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

  const handleDownloadPreview = async () => {
    if (summaryRows.length === 0) {
      alert("Add a service before downloading the preview.");
      return;
    }

    const propertyName = project.projectName || "New Project";
    const date = formatShortDate(project.date);
    const acres = project.acres || "Not set";
    const pdfBlob = buildServicePreviewPdf({
      propertyName,
      date,
      acres,
      summaryRows,
      projectTotal,
    });
    await downloadPdfBlob(
      pdfBlob,
      filenameSafe(propertyName) + "-service-preview.pdf"
    );
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
              Turf Acres
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
          <button onClick={() => navigate("/services/leaves")} type="button">Fall Cleanup</button>
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
                Download PDF
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
                        <div className="summary-row-actions">
                          <button className="secondary-button compact-button" onClick={row.onEdit} type="button">
                            Edit
                          </button>
                          <button className="danger-button compact-button" onClick={row.onDelete} type="button">
                            Remove
                          </button>
                        </div>
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
