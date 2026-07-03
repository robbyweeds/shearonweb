import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServiceContext } from "../context/ServiceContext";

const EMPTY_LEAVES = {
  area: "",
  quantity: "",
};

export default function LeavesForm() {
  const { currentServices, updateService } = useServiceContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_LEAVES);

  useEffect(() => {
    if (currentServices.leaves) setFormData(currentServices.leaves);
  }, [currentServices.leaves]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateService("leaves", formData);
    navigate("/services");
  };

  const handleReset = () => {
    setFormData(EMPTY_LEAVES);
    updateService("leaves", null);
  };

  return (
    <main className="app-shell single-column">
      <section className="workspace-panel form-panel">
        <div className="page-title">
          <p>Service Entry</p>
          <h1>Leaves</h1>
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
            <button type="submit">Save Leaves</button>
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
