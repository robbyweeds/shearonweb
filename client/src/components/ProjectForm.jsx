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
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
      <h2>Existing Projects</h2>
      {projects.length === 0 && <p>No projects found</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {projects.map((p) => (
          <li key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px" }}>
            <span><strong>{p.project_name}</strong> ({p.date}) - {p.acres} acres</span>
            <div>
              <button style={{ marginRight: "0.5rem" }} onClick={() => handleLoad(p.id)}>Load</button>
              <button style={{ backgroundColor: "#dc3545", color: "white" }} onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: "2rem" }}>Create / Edit Project</h2>
      <form onSubmit={handleContinue}>
        <label>Project Name</label>
        <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} required />

        <label>Date</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />

        <label>Acres</label>
        <input type="number" name="acres" value={formData.acres} onChange={handleChange} step="0.01" min="0" required />

        <button type="submit">Continue</button>
      </form>
    </div>
  );
}
