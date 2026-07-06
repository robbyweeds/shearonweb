import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

import { DISPLAY_KEYS, INITIAL_MOWING_DATA } from "./Mowing/mowingDefaults";
import { computeHours, computeTotals } from "./Mowing/mowingCalculations";
import { computeMulchingTotals, mergeMulchingData } from "./Mulching/mulchingCalculations";
import { DEFAULT_MULCHING_RATES, MULCH_AREA_KEYS, MULCH_SECTION_KEYS } from "./Mulching/mulchingDefaults";
import { computeTurfAppTotals } from "./TurfApp/turfAppCalculations";
import { DEFAULT_TURF_APP_RATES, INITIAL_TURF_APP_DATA, TURF_COLUMNS, TURF_LABOR_KEYS } from "./TurfApp/turfAppDefaults";
import { formatCurrency } from "../utils/formatters";
import { computeExtrasTotals, mergeExtrasTable } from "./Extras/extrasCalculations";
import { EXTRA_KEYS, EXTRA_LABELS, EXTRA_LABOR_KEYS } from "./Extras/extrasDefaults";
import { computeFlowersTotals, mergeFlowersTable } from "./Flowers/flowersCalculations";
import { FLOWER_KEYS, FLOWER_LABELS, FLOWER_LABOR_KEYS } from "./Flowers/flowersDefaults";
import { computeLeavesTotals, mergeLeavesData, mergeLeavesRates } from "./Leaves/leavesCalculations";
import { DEFAULT_LEAVES_RATES, LEAVES_KEYS, LEAVES_LABELS } from "./Leaves/leavesDefaults";
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

const formatLastModified = (value, fallback) => formatShortDate(value || fallback);

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

const downloadCsv = async (rows, filename) => {
  const csv = rows
    .map((row) =>
      row
        .map((value) => '"' + String(value ?? "").replace(/"/g, '""') + '"')
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

  if (window.showSaveFilePicker) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "CSV file",
            accept: { "text/csv": [".csv"] },
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

const compactNumber = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "";
  if (num === 0) return "";
  return Number(num.toFixed(2));
};

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

const buildServicePreviewPdf = ({ propertyName, date, acres, lastModified, summaryRows, projectTotal }) => {
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
      addPdfText(commands, "Last modified: " + lastModified, 408, 676, 8);
      addPdfLine(commands, 40, 662, 572, 662);
      y = 628;
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
    lastModified: "",
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
  const smPwrEfficiency = currentRates?.mowingFactors?.smPwrEfficiency || {};
  const smPwrAllocation = currentRates?.mowingFactors?.smPwrAllocation || {};
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

    const qty = computeHours(merged, acresPerHour, smPwrEfficiency, smPwrAllocation);
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

  const buildPlanHoursRows = () => {
    const rows = [
      ["Project", project.projectName || "New Project"],
      ["Date", formatShortDate(project.date)],
      ["Turf Acres", project.acres || "Not set"],
      ["Last Modified", formatLastModified(project.lastModified, project.date)],
    ];
    const columns = ["Page", "Service", "Item", "Qty / Occ", "Unit", "Occ", "Total Qty", "$/Occ", "Total $", "Notes"];
    let activePage = "";

    const ensurePage = (page) => {
      if (activePage === page) return;
      rows.push([]);
      rows.push([page]);
      rows.push(columns);
      activePage = page;
    };

    const addLine = ({ page, service, item, qty, unit = "hrs", occ, pricePerOcc, total, notes }) => {
      const qtyNum = Number(qty || 0);
      const priceNum = Number(pricePerOcc || 0);
      const totalNum = total == null ? priceNum * Number(occ || 0) : Number(total || 0);
      if (qtyNum === 0 && priceNum === 0 && totalNum === 0) return;

      ensurePage(page);
      rows.push([
        page,
        service,
        item,
        compactNumber(qtyNum),
        unit,
        compactNumber(occ),
        compactNumber(qtyNum * Number(occ || 0)),
        priceNum ? money(priceNum) : "",
        totalNum ? money(totalNum) : "",
        notes || "",
      ]);
    };

    const addTotal = ({ page, service, occ, hoursPerOcc, pricePerOcc, total, notes }) => {
      ensurePage(page);
      rows.push([
        page,
        service,
        "SERVICE TOTAL",
        compactNumber(hoursPerOcc),
        "hrs",
        compactNumber(occ),
        compactNumber(Number(hoursPerOcc || 0) * Number(occ || 0)),
        money(pricePerOcc || 0),
        money(total || 0),
        notes || "",
      ]);
    };

    const addQtyLines = ({ page, service, occ, qty, keys, labels = {}, hourKeys = keys, rowTotals = {}, notes = {} }) => {
      keys.forEach((key) => {
        const isHour = hourKeys.includes(key);
        addLine({
          page,
          service,
          item: labels[key] || key,
          qty: qty[key],
          unit: isHour ? "hrs" : "qty",
          occ,
          pricePerOcc: rowTotals[key],
          notes: notes[key],
        });
      });
    };

    const mowingLabels = {
      MISC_HRS: "Misc Hrs",
      "72-area1": "72 Area 1",
      "72-area2": "72 Area 2",
      "60-area1": "60 Area 1",
      "60-area2": "60 Area 2",
      "48-area1": "48 Area 1",
      "48-area2": "48 Area 2",
      TRIMMER: "Trimmer",
      BLOWER: "Blower",
      ROTARY: "Rotary",
      SPECIALTY: "Specialty",
      "5111": "5111",
    };

    (Array.isArray(currentServices.mowing) ? currentServices.mowing : []).forEach((entry) => {
      const { merged, totals } = computeMowingPreview(entry);
      const occ = Number(merged.summary?.numOccurrences || 0);
      if (occ <= 0) return;
      const qty = computeHours(merged, acresPerHour, smPwrEfficiency, smPwrAllocation);
      const acreNotes = Object.fromEntries(
        DISPLAY_KEYS.map((key) => [key, merged.acres?.[key] ? compactNumber(merged.acres[key]) + " acres" : ""])
      );

      addQtyLines({ page: "Mowing", service: merged.name || "Mowing Area", occ, qty, keys: DISPLAY_KEYS, labels: mowingLabels, rowTotals: totals.rowTotals, notes: acreNotes });
      addTotal({ page: "Mowing", service: merged.name || "Mowing Area", occ, hoursPerOcc: totals.totalHours, pricePerOcc: totals.adjustedOcc, total: totals.final, notes: merged.tableAcres ? compactNumber(merged.tableAcres) + " input acres" : "" });
    });

    if (currentServices.edging) {
      const entry = Array.isArray(currentServices.edging) ? currentServices.edging[0] : currentServices.edging;
      const calc = computeEdgingTotals(entry);
      const occ = Number(calc?.occ || 0);
      if (occ > 0) {
        const qty = entry.data?.qtyUnit || {};
        const rowTotals = { EDGER: Number(qty.EDGER || 0) * Number(entry.data?.unitPrice?.EDGER || 0), BLOWER: Number(qty.BLOWER || 0) * Number(entry.data?.unitPrice?.BLOWER || 0) };
        addQtyLines({ page: "Mowing", service: entry.data?.name || "Edging", occ, qty, keys: ["EDGER", "BLOWER"], rowTotals });
        addTotal({ page: "Mowing", service: entry.data?.name || "Edging", occ, hoursPerOcc: Number(qty.EDGER || 0) + Number(qty.BLOWER || 0), pricePerOcc: calc.pricePerOcc, total: calc.finalTotal });
      }
    }

    if (currentServices.bedMaintenance) {
      const entry = Array.isArray(currentServices.bedMaintenance) ? currentServices.bedMaintenance[0] : currentServices.bedMaintenance;
      const calc = computeBedTotals(entry);
      const occ = Number(calc?.occ || 0);
      if (occ > 0) {
        const qty = entry.data?.qtyUnit || {};
        const rowTotals = { HAND: Number(qty.HAND || 0) * Number(entry.data?.unitPrice?.HAND || 0), BACKPACK: Number(qty.BACKPACK || 0) * Number(entry.data?.unitPrice?.BACKPACK || 0), ROUNDUP: Number(qty.ROUNDUP || 0) * Number(entry.data?.unitPrice?.ROUNDUP || 0) };
        addQtyLines({ page: "Mowing", service: entry.data?.name || "Bed Maintenance", occ, qty, keys: ["HAND", "BACKPACK", "ROUNDUP"], rowTotals });
        addTotal({ page: "Mowing", service: entry.data?.name || "Bed Maintenance", occ, hoursPerOcc: Number(qty.HAND || 0) + Number(qty.BACKPACK || 0) + Number(qty.ROUNDUP || 0), pricePerOcc: calc.pricePerOcc, total: calc.finalTotal });
      }
    }

    (Array.isArray(currentServices.mulching) ? currentServices.mulching : []).forEach((entry, index) => {
      const merged = mergeMulchingData({ ...(entry.data || {}), name: entry.data?.name || "Mulch #" + (index + 1) });
      const rates = currentRates?.mulchingRates || DEFAULT_MULCHING_RATES;
      const totals = computeMulchingTotals(merged, rates);
      const occ = Number(totals.occurrences || 0);
      if (occ <= 0) return;

      MULCH_SECTION_KEYS.forEach((sectionKey) => {
        const section = merged.sections[sectionKey];
        const sectionTotals = totals.sections[sectionKey];
        if (!sectionTotals || (Number(sectionTotals.hoursPerOcc || 0) === 0 && Number(sectionTotals.totalOcc || 0) === 0)) return;
        const service = merged.name + " - " + section.title;
        const qty = { MISC: sectionTotals.miscHours, area1: sectionTotals.areaTotals.area1.hours, area2: sectionTotals.areaTotals.area2.hours, area3: sectionTotals.areaTotals.area3.hours, [sectionTotals.extraKey]: sectionTotals.extraHours, LOADER: sectionTotals.loaderHours, MULCH: sectionTotals.mulchYards };
        const labels = { MISC: "Misc", area1: "Area 1", area2: "Area 2", area3: "Area 3", SM_PWR: "Sm Pwr", HELPER: "Helper", LOADER: "Loader", MULCH: "Mulch" };
        const notes = Object.fromEntries(MULCH_AREA_KEYS.map((areaKey) => [areaKey, compactNumber(sectionTotals.areaTotals[areaKey].sqft) + " sqft"]));
        addQtyLines({ page: "Mulching", service, occ, qty, keys: ["MISC", "area1", "area2", "area3", sectionTotals.extraKey, "LOADER", "MULCH"], labels, hourKeys: ["MISC", "area1", "area2", "area3", sectionTotals.extraKey, "LOADER"], rowTotals: sectionTotals.rowTotals, notes });
        addTotal({ page: "Mulching", service, occ, hoursPerOcc: sectionTotals.hoursPerOcc, pricePerOcc: sectionTotals.totalOcc, total: sectionTotals.totalOcc * occ });
      });
    });

    (Array.isArray(currentServices.pruning) ? currentServices.pruning : []).forEach((entry, index) => {
      const data = entry.data || {};
      const calc = computePruningTotals(entry);
      const occ = Number(calc?.occ || 0);
      if (occ <= 0) return;
      const service = data.name || "Pruning #" + (index + 1);
      const qty = data.qty || {};
      const rowTotals = Object.fromEntries(["MISC", "HAND", "SHEARS", "CLEANUP", "CHAINSAW"].map((key) => [key, Number(qty[key] || 0) * Number(data.unitPrice?.[key] || 0)]));
      addQtyLines({ page: "Pruning", service, occ, qty, keys: ["MISC", "HAND", "SHEARS", "CLEANUP", "CHAINSAW"], rowTotals });
      addTotal({ page: "Pruning", service, occ, hoursPerOcc: Object.values(qty).reduce((sum, value) => sum + Number(value || 0), 0), pricePerOcc: calc.pricePerOcc, total: calc.totalDollar });
    });

    if (currentServices.leaves) {
      const merged = mergeLeavesData(currentServices.leaves);
      const leavesRates = mergeLeavesRates(currentRates?.leavesRates || DEFAULT_LEAVES_RATES);
      const totals = computeLeavesTotals(merged, leavesRates);
      const occ = Number(merged.occurrences || 0);
      if (occ > 0) {
        addQtyLines({ page: "Fall Cleanup", service: merged.name || "Fall Cleanup", occ, qty: totals.qtyUnit, keys: LEAVES_KEYS, labels: LEAVES_LABELS, rowTotals: totals.rowTotals });
        addTotal({ page: "Fall Cleanup", service: merged.name || "Fall Cleanup", occ, hoursPerOcc: totals.hoursPerOcc, pricePerOcc: totals.dollarsPerOcc, total: totals.final, notes: compactNumber(merged.acres) + " acres" });
      }
    }

    if (currentServices.springCleanup) {
      const merged = mergeSpringCleanupData(currentServices.springCleanup);
      Object.entries(SPRING_CLEANUP_TABLES).forEach(([tableKey, definition]) => {
        const table = merged.tables[tableKey];
        const totals = computeSpringCleanupTableTotals(tableKey, table);
        const occ = Number(table.occurrences || 0);
        if (occ <= 0) return;
        addQtyLines({ page: "Spring Cleanup", service: definition.title, occ, qty: table.qty || {}, keys: definition.keys, labels: definition.labels, hourKeys: definition.hourKeys, rowTotals: totals.rowTotals });
        addTotal({ page: "Spring Cleanup", service: definition.title, occ, hoursPerOcc: totals.hoursPerOcc, pricePerOcc: totals.dollarsPerOcc, total: totals.totalDollars });
      });
      merged.extraTables.forEach((table) => {
        const definition = SPRING_CLEANUP_TABLES[table.definitionKey];
        const totals = computeSpringCleanupTableTotals(table.definitionKey, table);
        const occ = Number(table.occurrences || 0);
        if (occ <= 0) return;
        const service = table.title || definition.title;
        addQtyLines({ page: "Spring Cleanup", service, occ, qty: table.qty || {}, keys: definition.keys, labels: definition.labels, hourKeys: definition.hourKeys, rowTotals: totals.rowTotals });
        addTotal({ page: "Spring Cleanup", service, occ, hoursPerOcc: totals.hoursPerOcc, pricePerOcc: totals.dollarsPerOcc, total: totals.totalDollars });
      });
    }

    (Array.isArray(currentServices.turfApp) ? currentServices.turfApp : []).forEach((entry, index) => {
      const merged = { ...INITIAL_TURF_APP_DATA, ...(entry.data || {}), name: entry.data?.name || "Turf Application #" + (index + 1), qtyUnit: { ...INITIAL_TURF_APP_DATA.qtyUnit, ...(entry.data?.qtyUnit || {}) }, summary: { ...INITIAL_TURF_APP_DATA.summary, ...(entry.data?.summary || {}) } };
      const rates = { ...DEFAULT_TURF_APP_RATES, ...(currentRates?.turfAppRates || {}) };
      const totals = computeTurfAppTotals(merged, rates);
      const occ = Number(merged.summary?.numOccurrences || 0);
      if (occ <= 0) return;
      const labels = Object.fromEntries(TURF_COLUMNS.map((col) => [col.key, col.key === "OTHER_MATERIAL" ? merged.otherMaterialName || col.label : col.label]));
      addQtyLines({ page: "Turf App", service: merged.name || "Turf Application", occ, qty: totals.qtyUnit, keys: TURF_COLUMNS.map((col) => col.key), labels, hourKeys: TURF_LABOR_KEYS, rowTotals: totals.rowTotals, notes: { FERTILIZER: merged.fertilizerOption, OTHER_MATERIAL: merged.otherMaterialName } });
      addTotal({ page: "Turf App", service: merged.name || "Turf Application", occ, hoursPerOcc: totals.hoursPerOcc, pricePerOcc: totals.totalOcc, total: totals.final, notes: compactNumber(merged.acres) + " acres" });
    });

    (Array.isArray(currentServices.flowers) ? currentServices.flowers : []).forEach((entry, index) => {
      const merged = mergeFlowersTable({ ...(entry.data || {}), name: entry.data?.name || "Flowers #" + (index + 1) });
      const totals = computeFlowersTotals(merged);
      const occ = Number(merged.occurrences || 0);
      if (occ <= 0) return;
      const labels = { ...FLOWER_LABELS, ...(merged.customLabels || {}) };
      addQtyLines({ page: "Flowers", service: merged.name || "Flowers", occ, qty: merged.qty, keys: FLOWER_KEYS, labels, hourKeys: FLOWER_LABOR_KEYS, rowTotals: totals.rowTotals });
      addTotal({ page: "Flowers", service: merged.name || "Flowers", occ, hoursPerOcc: totals.qtyPerOcc, pricePerOcc: totals.dollarsPerOcc, total: totals.totalDollars });
    });

    (Array.isArray(currentServices.extras) ? currentServices.extras : []).forEach((entry, index) => {
      const merged = mergeExtrasTable({ ...(entry.data || {}), name: entry.data?.name || "Extras #" + (index + 1) });
      const totals = computeExtrasTotals(merged);
      const occ = Number(merged.occurrences || 0);
      if (occ <= 0) return;
      const labels = { ...EXTRA_LABELS, ...(merged.customLabels || {}) };
      addQtyLines({ page: "Extras", service: merged.name || "Extras", occ, qty: merged.qty, keys: EXTRA_KEYS, labels, hourKeys: EXTRA_LABOR_KEYS, rowTotals: totals.rowTotals });
      addTotal({ page: "Extras", service: merged.name || "Extras", occ, hoursPerOcc: totals.qtyPerOcc, pricePerOcc: totals.dollarsPerOcc, total: totals.totalDollars });
    });

    return rows;
  };

  const handleDownloadPlanHours = async () => {
    if (summaryRows.length === 0) {
      alert("Add a service before downloading plan hours.");
      return;
    }

    await downloadCsv(
      buildPlanHoursRows(),
      filenameSafe(project.projectName || "New Project") + "-plan-hours.csv"
    );
  };

  const handleDownloadPreview = async () => {
    if (summaryRows.length === 0) {
      alert("Add a service before downloading the preview.");
      return;
    }

    const propertyName = project.projectName || "New Project";
    const date = formatShortDate(project.date);
    const acres = project.acres || "Not set";
    const lastModified = formatLastModified(project.lastModified, project.date);
    const pdfBlob = buildServicePreviewPdf({
      propertyName,
      date,
      acres,
      lastModified,
      summaryRows,
      projectTotal,
    });
    await downloadPdfBlob(
      pdfBlob,
      filenameSafe(propertyName) + "-service-preview.pdf"
    );
  };

  const handlePreviewDelete = (onDelete) => {
    if (!window.confirm("Delete this service?")) return;
    onDelete();
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

    const modifiedAt = new Date().toISOString();
    const projectToSave = { ...project, lastModified: modifiedAt };
    const isExistingProject = Boolean(project.id);
    const url = isExistingProject
      ? `${API_URL}/project/${project.id}`
      : `${API_URL}/project`;

    try {
      const response = await fetch(url, {
        method: isExistingProject ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectToSave, services: sanitized }),
      });

      const json = await response.json();
      if (json.success) {
        const savedProject = {
          ...projectToSave,
          id: json.projectId || project.id,
          lastModified: json.lastModified || modifiedAt,
        };
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
            <span>Last Modified</span>
            <strong className="summary-small-text">{formatLastModified(project.lastModified, project.date)}</strong>
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
                        <div className="summary-row-actions">
                          <button className="secondary-button compact-button" onClick={row.onEdit} type="button">
                            Edit
                          </button>
                          <button
                            className="danger-button compact-button"
                            onClick={() => handlePreviewDelete(row.onDelete)}
                            type="button"
                          >
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
              <div className="button-row" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  className="ghost-button compact-button"
                  disabled={summaryRows.length === 0}
                  onClick={handleDownloadPlanHours}
                  type="button"
                >
                  Download Plan Hours
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
