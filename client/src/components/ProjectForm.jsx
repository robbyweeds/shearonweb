import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

const API_URL = process.env.REACT_APP_API_URL || "";
const SAVED_RATES_KEY = "__rates";
const EMPTY_PROJECT = { id: null, projectName: "", date: "", acres: "" };

export default function ProjectForm() {
  const navigate = useNavigate();
  const { updateService, resetServices, updateRates } = useServiceContext();

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
    if (["mowing", "mulching", "pruning"].includes(key)) {
      return Array.isArray(value) ? value : [];
    }

    if (["edging", "bedMaintenance", "leaves"].includes(key)) {
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
      resetServices();
    }

    localStorage.setItem("project", JSON.stringify(project));
    navigate("/services");
  };

  return (
    <main className="app-shell">
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
                <p>{p.date || "No date"} - {p.acres || 0} acres</p>
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
          <h1>Create or Edit Project</h1>
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

          <div className="form-grid two-column">
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
            <button type="submit">Continue to Services</button>
          </div>
        </form>
      </section>
    </main>
  );
}
