// App.js — FINAL UPDATED WITH PRUNING RATES

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import ProjectForm from "./components/ProjectForm";
import ServicesPage from "./components/ServicesPage";

import MowingForm from "./components/MowingForm";
import MulchingForm from "./components/MulchingForm";
import PruningForm from "./components/Pruning/PruningForm";
import LeavesForm from "./components/LeavesForm";
import SpringCleanupForm from "./components/SpringCleanupForm";
import TurfAppForm from "./components/TurfAppForm";
import FlowersForm from "./components/FlowersForm";
import ExtrasForm from "./components/ExtrasForm";

import MowingRatesPage from "./components/Mowing/MowingRatesPage";
import MulchingRatesPage from "./components/Mulching/MulchingRatesPage";
import PruningRatesPage from "./components/Pruning/PruningRatesPage";
import TurfAppRatesPage from "./components/TurfApp/TurfAppRatesPage";
import LeavesRatesPage from "./components/Leaves/LeavesRatesPage";

function App() {
  const clearZeroNumberInput = (event) => {
    const input = event.target;
    if (input?.tagName !== "INPUT" || input.type !== "number") return;

    const value = input.value.trim();
    if (value !== "" && Number(value) === 0) {
      input.value = "";
    }
  };

  return (
    <Router basename="/shearon">
      <div onFocusCapture={clearZeroNumberInput}>
        <Routes>
        <Route path="/" element={<ProjectForm />} />
        <Route path="/services" element={<ServicesPage />} />

        {/* SERVICE FORMS */}
        <Route path="/services/mowing" element={<MowingForm />} />
        <Route path="/services/mulching" element={<MulchingForm />} />
        <Route path="/services/pruning" element={<PruningForm />} />
        <Route path="/services/leaves" element={<LeavesForm />} />
        <Route path="/services/spring-cleanup" element={<SpringCleanupForm />} />
        <Route path="/services/turf-app" element={<TurfAppForm />} />
        <Route path="/services/flowers" element={<FlowersForm />} />
        <Route path="/services/extras" element={<ExtrasForm />} />

        {/* RATE PAGES */}
        <Route path="/mowing-rates" element={<MowingRatesPage />} />
        <Route path="/mulching-rates" element={<MulchingRatesPage />} />
        <Route path="/pruning-rates" element={<PruningRatesPage />} />
        <Route path="/turf-app-rates" element={<TurfAppRatesPage />} />
        <Route path="/leaves-rates" element={<LeavesRatesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
