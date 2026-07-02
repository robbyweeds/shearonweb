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

import MowingRatesPage from "./components/Mowing/MowingRatesPage";
import MulchingRatesPage from "./components/Mulching/MulchingRatesPage";
import PruningRatesPage from "./components/Pruning/PruningRatesPage";

function App() {
  return (
    <Router basename="/shearon">
      <Routes>
        <Route path="/" element={<ProjectForm />} />
        <Route path="/services" element={<ServicesPage />} />

        {/* SERVICE FORMS */}
        <Route path="/services/mowing" element={<MowingForm />} />
        <Route path="/services/mulching" element={<MulchingForm />} />
        <Route path="/services/pruning" element={<PruningForm />} />
        <Route path="/services/leaves" element={<LeavesForm />} />

        {/* RATE PAGES */}
        <Route path="/mowing-rates" element={<MowingRatesPage />} />
        <Route path="/mulching-rates" element={<MulchingRatesPage />} />
        <Route path="/pruning-rates" element={<PruningRatesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
