import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { updateService } = useServiceContext();

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        if (data.success) setProjects(data.projects);
      })
      .catch(console.error);
  }, []);

  const handleDelete = (projectId) => {
  if (!window.confirm("Delete this project?")) return;

  fetch(`/api/project/${projectId}`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Project deleted");
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } else {
        alert("Failed to delete project: " + data.error);
      }
    })
    .catch(console.error);
};


  const handleLoad = (projectId) => {
    fetch(`/api/project/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Load services into context
          Object.entries(data.services).forEach(([key, value]) => {
            updateService(key, value);
          });

          // Optionally save project info in localStorage or context
          localStorage.setItem("project", JSON.stringify({
            projectName: data.project.project_name,
            date: data.project.date,
            acres: data.project.acres,
            lastModified: data.project.last_modified || data.project.lastModified || data.project.date,
          }));

          navigate("/services");
        } else {
          alert(data.error);
        }
      })
      .catch(console.error);
  };

  return (
  <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
    <h2>Existing Projects</h2>
    {projects.length === 0 && <p>No projects found</p>}
    <ul>
      {projects.map(p => (
        <li key={p.id} style={{ marginBottom: "1rem" }}>
          <strong>{p.project_name}</strong> ({p.date}) - {p.acres} acres
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => handleLoad(p.id)}
          >
            Load
          </button>
          <button
            style={{
              marginLeft: "0.5rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
            onClick={() => handleDelete(p.id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  </div>
);

}
