import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";
import { formatCurrency } from "../utils/formatters";
import { INITIAL_MOWING_DATA } from "./Mowing/mowingDefaults";
import { computeHours, computeTotals } from "./Mowing/mowingCalculations";
import { computeMulchingTotals } from "./Mulching/mulchingCalculations";
import { DEFAULT_MULCHING_RATES } from "./Mulching/mulchingDefaults";
import { computePruningTotals } from "./Pruning/pruningCalculations";
import { computeTurfAppTotals } from "./TurfApp/turfAppCalculations";
import { DEFAULT_TURF_APP_RATES, INITIAL_TURF_APP_DATA } from "./TurfApp/turfAppDefaults";
import { computeExtrasTotals, mergeExtrasTable } from "./Extras/extrasCalculations";
import { computeFlowersTotals, mergeFlowersTable } from "./Flowers/flowersCalculations";
import { computeLeavesTotals, mergeLeavesData, mergeLeavesRates } from "./Leaves/leavesCalculations";
import { DEFAULT_LEAVES_RATES } from "./Leaves/leavesDefaults";
import { computeSpringCleanupTableTotals, mergeSpringCleanupData } from "./SpringCleanup/springCleanupCalculations";
import { SPRING_CLEANUP_TABLES } from "./SpringCleanup/springCleanupDefaults";

const API_URL = process.env.REACT_APP_API_URL || "";
const SAVED_RATES_KEY = "__rates";
const EMPTY_PROJECT = { id: null, projectName: "", date: "", acres: "" };

const formatShortDate = (value) => {
  if (!value) return "No date";

  const [year, month, day] = String(value).split("T")[0].split("-");
  if (!year || !month || !day) return value;

  return `${month}/${day}/${year.slice(-2)}`;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const computeEdgingTotal = (entry) => {
  if (!entry?.data) return 0;

  const d = entry.data;
  const qty = d.qtyUnit || { EDGER: 0, BLOWER: 0 };
  const price = d.unitPrice || { EDGER: 0, BLOWER: 0 };
  const occ = Number(d.summary?.numOccurrences || 0);

  return (Number(qty.EDGER || 0) * Number(price.EDGER || 0) +
    Number(qty.BLOWER || 0) * Number(price.BLOWER || 0)) * occ;
};

const computeBedMaintenanceTotal = (entry) => {
  if (!entry?.data) return 0;

  const d = entry.data;
  const qty = d.qtyUnit || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
  const price = d.unitPrice || { HAND: 0, BACKPACK: 0, ROUNDUP: 0 };
  const occ = Number(d.summary?.numOccurrences || 0);

  return (Number(qty.HAND || 0) * Number(price.HAND || 0) +
    Number(qty.BACKPACK || 0) * Number(price.BACKPACK || 0) +
    Number(qty.ROUNDUP || 0) * Number(price.ROUNDUP || 0)) * occ;
};

const getProjectContractTotal = (project) => {
  const services = project.services || {};
  const rates = services[SAVED_RATES_KEY] || {};
  let total = 0;

  asArray(services.mowing).forEach((entry) => {
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
      summary: { ...INITIAL_MOWING_DATA.summary, ...(raw.summary || {}) },
    };
    const qty = computeHours(merged, rates.mowingFactors?.acresPerHour || {});
    total += computeTotals(merged, qty, rates.mowingDollars || {}).final || 0;
  });

  asArray(services.mulching).forEach((entry) => {
    total += computeMulchingTotals(entry.data || {}, rates.mulchingRates || DEFAULT_MULCHING_RATES).totalPrice || 0;
  });

  asArray(services.pruning).forEach((entry) => {
    total += computePruningTotals(entry.data || {}, rates.pruningRates).finalTotal || 0;
  });

  if (services.edging) {
    total += computeEdgingTotal(Array.isArray(services.edging) ? services.edging[0] : services.edging);
  }

  if (services.bedMaintenance) {
    total += computeBedMaintenanceTotal(Array.isArray(services.bedMaintenance) ? services.bedMaintenance[0] : services.bedMaintenance);
  }

  if (services.leaves) {
    const leavesRates = mergeLeavesRates(rates.leavesRates || DEFAULT_LEAVES_RATES);
    total += computeLeavesTotals(mergeLeavesData(services.leaves), leavesRates).final || 0;
  }

  if (services.springCleanup) {
    const merged = mergeSpringCleanupData(services.springCleanup);
    Object.keys(SPRING_CLEANUP_TABLES).forEach((tableKey) => {
      total += computeSpringCleanupTableTotals(tableKey, merged.tables[tableKey]).totalDollars || 0;
    });
    merged.extraTables.forEach((table) => {
      total += computeSpringCleanupTableTotals(table.definitionKey, table).totalDollars || 0;
    });
  }

  const turfRates = { ...DEFAULT_TURF_APP_RATES, ...(rates.turfAppRates || {}) };
  asArray(services.turfApp).forEach((entry) => {
    const raw = entry.data || {};
    const merged = {
      ...INITIAL_TURF_APP_DATA,
      ...raw,
      qtyUnit: { ...INITIAL_TURF_APP_DATA.qtyUnit, ...(raw.qtyUnit || {}) },
      summary: { ...INITIAL_TURF_APP_DATA.summary, ...(raw.summary || {}) },
    };
    total += computeTurfAppTotals(merged, turfRates).final || 0;
  });

  asArray(services.flowers).forEach((entry) => {
    total += computeFlowersTotals(mergeFlowersTable(entry.data || {})).totalDollars || 0;
  });

  asArray(services.extras).forEach((entry) => {
    total += computeExtrasTotals(mergeExtrasTable(entry.data || {})).totalDollars || 0;
  });

  return total;
};

export default function ProjectForm() {
  const navigate = useNavigate();
  const { updateService, resetServices, resetRates, updateRates } = useServiceContext();

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState(EMPTY_PROJECT);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    setIsLoadingProjects(true);

    fetch(`${API_URL}/projects?limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects);
      })
      .catch(console.error)
      .finally(() => setIsLoadingProjects(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isEmptyObject = (value) =>
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0;

  const normalizeLoadedService = (key, value) => {
    if (["mowing", "mulching", "pruning", "turfApp", "flowers", "extras"].includes(key)) {
      return Array.isArray(value) ? value : [];
    }

    if (["edging", "bedMaintenance", "leaves", "springCleanup"].includes(key)) {
      return isEmptyObject(value) ? null : value;
    }

    return value;
  };

  const handleLoad = (projectId) => {
    setSelectedProjectId(projectId);

    fetch(`${API_URL}/project/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const project = {
            id: data.project.id,
            projectName: data.project.project_name,
            date: data.project.date,
            acres: data.project.acres,
          };

          resetServices();
          setFormData(project);

          Object.entries(data.services || {}).forEach(([key, value]) => {
            if (key === SAVED_RATES_KEY) {
              Object.entries(value || {}).forEach(([rateKey, rateValue]) => {
                updateRates(rateKey, rateValue);
              });
              return;
            }

            updateService(key, normalizeLoadedService(key, value));
          });

          localStorage.setItem("project", JSON.stringify(project));
          navigate("/services");
        } else {
          alert(data.error);
        }
      })
      .catch(console.error);
  };

  const handleDelete = (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    fetch(`${API_URL}/project/${projectId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const storedProject = JSON.parse(localStorage.getItem("project") || "null");
          const deletedCurrentProject =
            String(projectId) === String(selectedProjectId) ||
            String(projectId) === String(formData.id) ||
            String(projectId) === String(storedProject?.id);

          if (deletedCurrentProject) {
            setSelectedProjectId("");
            setFormData(EMPTY_PROJECT);
            resetServices();
            resetRates();
            localStorage.removeItem("project");
          }

          fetchProjects();
        } else {
          alert("Failed to delete project: " + data.error);
        }
      })
      .catch(console.error);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!formData.projectName || !formData.date || !formData.acres) {
      alert("Please fill all fields");
      return;
    }

    const project = { ...formData, id: formData.id || null };

    if (!project.id) {
      setSelectedProjectId("");
      resetServices();
      resetRates();
    }

    localStorage.setItem("project", JSON.stringify(project));
    navigate("/services");
  };

  return (
    <main className="app-shell main-project-shell">
      <header className="brand-title">
        <h1>Shearon Environmental Design</h1>
        <p>Powered by RobbyWeeds</p>
      </header>

      <aside className="project-rail" aria-label="Existing projects">
        <div className="section-heading">
          <span>Recent Projects</span>
          <button className="ghost-button compact-button" onClick={fetchProjects} type="button">
            Refresh
          </button>
        </div>

        {isLoadingProjects && <p className="muted-text">Loading projects...</p>}

        {!isLoadingProjects && projects.length === 0 && (
          <div className="empty-state">No projects saved yet.</div>
        )}

        <div className="project-list">
          {projects.map((p) => (
            <article
              key={p.id}
              className={String(selectedProjectId) === String(p.id) ? "project-card selected" : "project-card"}
            >
              <div>
                <h3>{p.project_name}</h3>
                <p>{formatShortDate(p.date)} - {p.acres || 0} acres - {formatCurrency(getProjectContractTotal(p))}</p>
              </div>
              <div className="button-row tight-row">
                <button className="secondary-button compact-button" onClick={() => handleLoad(p.id)} type="button">
                  Load
                </button>
                <button className="danger-button compact-button" onClick={() => handleDelete(p.id)} type="button">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </aside>

      <section className="workspace-panel">
        <div className="page-title">
          <p>Project Setup</p>
          <h1>Create Project</h1>
        </div>

        <form className="stacked-form" onSubmit={handleContinue}>
          <label>
            <span>Project Name</span>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="Example: North Ridge HOA"
              required
            />
          </label>

          <div className="form-grid project-details-grid">
            <label>
              <span>Date</span>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </label>

            <label>
              <span>Acres</span>
              <input
                type="number"
                name="acres"
                value={formData.acres}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </label>
          </div>

          <div className="button-row form-actions">
            <button type="submit">Create</button>
          </div>
        </form>
      </section>
    </main>
  );
}
