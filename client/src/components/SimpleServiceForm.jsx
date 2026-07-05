import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

const EMPTY_SERVICE = {
  area: "",
  quantity: "",
};

export default function SimpleServiceForm({ serviceKey, title }) {
  const { currentServices, updateService } = useServiceContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_SERVICE);

  useEffect(() => {
    if (currentServices[serviceKey]) setFormData(currentServices[serviceKey]);
  }, [currentServices, serviceKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveService = () => {
    updateService(serviceKey, formData);
    navigate("/services");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveService();
  };

  const handleReset = () => {
    setFormData(EMPTY_SERVICE);
    updateService(serviceKey, null);
  };

  return (
    <main className="app-shell single-column">
      <section className="workspace-panel form-panel">
        <div className="page-title">
          <p>Service Entry</p>
          <h1>{title}</h1>
        </div>

        <div className="service-top-actions">
          <button className="save-project-button" onClick={saveService} type="button">
            Save {title}
          </button>
          <button className="secondary-button" onClick={() => navigate(-1)} type="button">
            Back
          </button>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            <span>Area</span>
            <input
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Example: Backyard"
              required
            />
          </label>

          <label>
            <span>Quantity</span>
            <input
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Example: 3 bags"
              required
            />
          </label>

          <div className="service-page-actions form-actions">
            <button className="save-project-button" type="submit">Save {title}</button>
            <button className="danger-button" onClick={handleReset} type="button">
              Reset
            </button>
            <button className="secondary-button" onClick={() => navigate(-1)} type="button">
              Back
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
