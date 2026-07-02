import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

export default function ProjectForm() {
  const navigate = useNavigate();
  const { updateService } = useServiceContext();

  const API_URL = process.env.REACT_APP_API_URL;

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({
    projectName: "",
    date: "",
    acres: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    fetch(`${API_URL}/projects?limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects);
      })
      .catch(console.error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoad = (projectId) => {
    setSelectedProjectId(projectId);

    fetch(`${API_URL}/project/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFormData({
            projectName: data.project.project_name,
            date: data.project.date,
            acres: data.project.acres,
          });

          Object.entries(data.services || {}).forEach(([key, value]) => {
            updateService(key, value);
          });

          localStorage.setItem("project", JSON.stringify({
            projectName: data.project.project_name,
            date: data.project.date,
            acres: data.project.acres,
          }));

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
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Project deleted");
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

    localStorage.setItem("project", JSON.stringify(formData));
    navigate("/services");
  };

  return (
  <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
    {/* Existing Projects Sidebar */}
    <div
      style={{
        width: "300px",
        maxHeight: "500px",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        background: "#f9f9f9",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Existing Projects</h3>

      {projects.length === 0 && <p>No projects found</p>}

      {projects.map((p) => (
        <div
          key={p.id}
          style={{
            borderBottom: "1px solid #ddd",
            padding: "8px 0",
          }}
        >
          {/* Project Name */}
          <div
            style={{
              fontWeight: "600",
              fontSize: "15px",
              marginBottom: "4px",
            }}
          >
            {p.project_name}
          </div>

          {/* Details */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              color: "#666",
            }}
          >
            <span>{p.date}</span>
            <span>{p.acres} ac</span>

            <button
              style={{
                padding: "2px 8px",
                fontSize: "11px",
                height: "24px",
                cursor: "pointer",
              }}
              onClick={() => handleLoad(p.id)}
            >
              Load
            </button>

            <button
              style={{
                padding: "2px 8px",
                fontSize: "11px",
                height: "24px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
              }}
              onClick={() => handleDelete(p.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* Main Form */}
    <div style={{ flex: 1, maxWidth: "500px", margin: "0 auto" }}>
      <h2>Create / Edit Project</h2>

      <form onSubmit={handleContinue}>
        <label>Project Name</label>
        <input
          type="text"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          required
        />

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label>Acres</label>
        <input
          type="number"
          name="acres"
          value={formData.acres}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />

        <button type="submit">Continue</button>
      </form>
    </div>
  </div>
);
}
