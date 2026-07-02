import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

export default function LeavesForm() {
  const { services, updateService } = useServiceContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    area: "",
    quantity: "",
  });

  useEffect(() => {
    if (services.leaves) setFormData(services.leaves);
  }, [services.leaves]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateService("leaves", formData);
    navigate("/services");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>Leaves</h2>
      <form onSubmit={handleSubmit}>
        <label>Area</label>
        <input
          name="area"
          value={formData.area}
          onChange={handleChange}
          placeholder="e.g., Backyard"
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          required
        />
        <label style={{ marginTop: "1rem" }}>Quantity</label>
        <input
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="e.g., 3 bags"
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          required
        />
        <button
          type="submit"
          style={{
            marginTop: "1.5rem",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </form>
    </div>
  );
}
