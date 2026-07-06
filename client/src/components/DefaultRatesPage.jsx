import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APP_DEFAULT_RATES,
  getStoredDefaultRates,
  mergeDefaultRates,
  saveStoredDefaultRates,
} from "../context/ServiceContext";

const clone = (value) => JSON.parse(JSON.stringify(value));

const SERVICE_SECTIONS = [
  {
    key: "mowing",
    title: "Mowing",
    categories: [
      { path: ["mowingDollars"], title: "Dollar Rates" },
      { path: ["mowingFactors", "acresPerHour"], title: "Acres per Hour" },
      { path: ["mowingFactors", "smPwrEfficiency"], title: "Small Power Efficiency" },
      { path: ["mowingFactors", "smPwrAllocation"], title: "Small Power Allocation" },
    ],
  },
  {
    key: "mulching",
    title: "Mulching",
    categories: [
      { path: ["mulchingRates", "dollars"], title: "Dollar Rates" },
      { path: ["mulchingRates", "handEfficiency"], title: "Hand Efficiency" },
      { path: ["mulchingRates", "treeRingSize"], title: "Tree Ring Size" },
      { path: ["mulchingRates", "treeEfficiency"], title: "Tree Efficiency" },
      { path: ["mulchingRates", "depthInches"], title: "Mulch Depth" },
      { path: ["mulchingRates", "treeDepth"], title: "Tree Depth" },
      { path: ["mulchingRates", "smPowerManHours"], title: "Small Power Man Hours" },
      { path: ["mulchingRates", "loaderManHours"], title: "Loader Man Hours" },
      { path: ["mulchingRates", "proximity"], title: "Proximity Multipliers" },
      { path: ["mulchingRates", "finnEfficiency"], title: "Finn Efficiency" },
      { path: ["mulchingRates", "finnDepth"], title: "Finn Depth" },
      { path: ["mulchingRates", "finnHelper"], title: "Finn Helper" },
    ],
  },
  {
    key: "pruning",
    title: "Pruning",
    categories: [{ path: ["pruningRates"], title: "Labor Rates" }],
  },
  {
    key: "leaves",
    title: "Fall Cleanup",
    categories: [
      { path: ["leavesRates", "unitPrice"], title: "Dollar Rates" },
      { path: ["leavesRates", "propertyTypes"], title: "Property Type Allocations" },
      { path: ["leavesRates", "occurrenceMultipliers"], title: "Occurrence Multipliers" },
    ],
  },
  {
    key: "turfApp",
    title: "Turf Application",
    categories: [
      { path: ["turfAppRates", "dollars"], title: "Dollar Rates" },
      { path: ["turfAppRates", "areaTypes"], title: "Area Type Equipment Split" },
      { path: ["turfAppRates", "acresPerHour"], title: "Equipment Production" },
      { path: ["turfAppRates", "handFactors"], title: "Hand Hours per Acre" },
      { path: ["turfAppRates", "materialAmounts"], title: "Material Amounts" },
      { path: ["turfAppRates", "equipmentMultiples", "fertilizer"], title: "Fertilizer Equipment Multiples" },
      { path: ["turfAppRates", "equipmentMultiples", "broadleaf"], title: "Broadleaf Equipment Multiples" },
    ],
    arrays: [{ path: ["turfAppRates", "fertilizerOptions"], title: "Fertilizer Options" }],
  },
];

const getIn = (source, path) => path.reduce((value, key) => value?.[key], source);

const setIn = (source, path, value) => {
  const next = clone(source);
  let cursor = next;

  path.slice(0, -1).forEach((key) => {
    cursor[key] = cursor[key] && typeof cursor[key] === "object" ? cursor[key] : {};
    cursor = cursor[key];
  });

  cursor[path[path.length - 1]] = value;
  return next;
};

const titleize = (value) =>
  String(value)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toInputValue = (value, previousValue) => {
  if (previousValue === "number") return value === "" ? "" : Number(value) || 0;
  return value;
};

function RateInput({ value, onChange }) {
  const valueType = typeof value;

  return (
    <input
      type={valueType === "number" ? "number" : "text"}
      min={valueType === "number" ? "0" : undefined}
      step={valueType === "number" ? "0.01" : undefined}
      value={value ?? ""}
      onChange={(event) => onChange(toInputValue(event.target.value, valueType))}
      className="default-rate-input"
    />
  );
}

function SimpleRateTable({ data, onChange }) {
  const entries = Object.entries(data || {});

  return (
    <table className="default-rates-table simple-rates-table">
      <thead>
        <tr>
          <th>Rate</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td>{titleize(key)}</td>
            <td>
              <RateInput value={value} onChange={(nextValue) => onChange({ ...data, [key]: nextValue })} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MatrixRateTable({ data, onChange }) {
  const rowEntries = Object.entries(data || {});
  const columns = Array.from(
    new Set(rowEntries.flatMap(([, values]) => Object.keys(values || {})))
  );

  return (
    <table className="default-rates-table">
      <thead>
        <tr>
          <th>Category</th>
          {columns.map((column) => (
            <th key={column}>{titleize(column)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rowEntries.map(([rowKey, rowValue]) => (
          <tr key={rowKey}>
            <td>{titleize(rowKey)}</td>
            {columns.map((column) => (
              <td key={column}>
                <RateInput
                  value={rowValue?.[column] ?? ""}
                  onChange={(nextValue) =>
                    onChange({
                      ...data,
                      [rowKey]: { ...(rowValue || {}), [column]: nextValue },
                    })
                  }
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ObjectRateSection({ category, rates, setRates }) {
  const data = getIn(rates, category.path) || {};
  const isMatrix = Object.values(data).some(
    (value) => value && typeof value === "object" && !Array.isArray(value)
  );

  const handleChange = (nextData) => setRates((prev) => setIn(prev, category.path, nextData));

  return (
    <section className="default-rate-category">
      <h3>{category.title}</h3>
      <div className="default-rate-table-wrap">
        {isMatrix ? (
          <MatrixRateTable data={data} onChange={handleChange} />
        ) : (
          <SimpleRateTable data={data} onChange={handleChange} />
        )}
      </div>
    </section>
  );
}

function ArrayRateSection({ category, rates, setRates }) {
  const data = getIn(rates, category.path) || [];
  const columns = Array.from(new Set(data.flatMap((item) => Object.keys(item || {}))));

  const handleCellChange = (index, key, value) => {
    const nextData = data.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    );
    setRates((prev) => setIn(prev, category.path, nextData));
  };

  const handleAdd = () => {
    const empty = Object.fromEntries(columns.map((column) => [column, column === "name" ? "New Option" : ""]));
    setRates((prev) => setIn(prev, category.path, [...data, empty]));
  };

  const handleDelete = (index) => {
    setRates((prev) => setIn(prev, category.path, data.filter((_, itemIndex) => itemIndex !== index)));
  };

  return (
    <section className="default-rate-category">
      <div className="default-rate-category-header">
        <h3>{category.title}</h3>
        <button className="ghost-button compact-button" onClick={handleAdd} type="button">
          Add Option
        </button>
      </div>
      <div className="default-rate-table-wrap">
        <table className="default-rates-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{titleize(column)}</th>
              ))}
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={`${item.name || "option"}-${index}`}>
                {columns.map((column) => (
                  <td key={column}>
                    <RateInput
                      value={item[column] ?? ""}
                      onChange={(nextValue) => handleCellChange(index, column, nextValue)}
                    />
                  </td>
                ))}
                <td>
                  <button
                    className="danger-button compact-button"
                    disabled={data.length <= 1}
                    onClick={() => handleDelete(index)}
                    type="button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DefaultRatesPage() {
  const navigate = useNavigate();
  const [rates, setRates] = useState(() => getStoredDefaultRates());
  const [activeService, setActiveService] = useState(SERVICE_SECTIONS[0].key);
  const activeSection = useMemo(
    () => SERVICE_SECTIONS.find((section) => section.key === activeService) || SERVICE_SECTIONS[0],
    [activeService]
  );

  const handleSave = () => {
    saveStoredDefaultRates(rates);
    alert("Default rates saved for future projects.");
    navigate("/");
  };

  const handleResetAll = () => {
    if (!window.confirm("Reset all default rates back to the built-in values?")) return;
    setRates(mergeDefaultRates(APP_DEFAULT_RATES));
  };

  return (
    <main className="app-shell single-column">
      <section className="workspace-panel wide-panel default-rates-page">
        <div className="services-header default-rates-header">
          <div className="page-title">
            <p>Future Project Defaults</p>
            <h1>Edit Default Rates</h1>
          </div>
          <div className="header-actions">
            <button className="secondary-button" onClick={() => navigate("/")} type="button">
              Main Page
            </button>
            <button className="save-project-button" onClick={handleSave} type="button">
              Save Defaults
            </button>
          </div>
        </div>

        <p className="default-rates-note">
          These values are used when a new project is created. Saved projects keep their own saved rates.
        </p>

        <div className="default-rates-layout">
          <nav className="default-rate-tabs" aria-label="Default rate service groups">
            {SERVICE_SECTIONS.map((section) => (
              <button
                key={section.key}
                className={section.key === activeService ? "default-rate-tab active" : "default-rate-tab"}
                onClick={() => setActiveService(section.key)}
                type="button"
              >
                {section.title}
              </button>
            ))}
          </nav>

          <div className="default-rate-service-panel">
            <h2>{activeSection.title}</h2>
            {activeSection.categories.map((category) => (
              <ObjectRateSection
                key={category.path.join(".")}
                category={category}
                rates={rates}
                setRates={setRates}
              />
            ))}
            {(activeSection.arrays || []).map((category) => (
              <ArrayRateSection
                key={category.path.join(".")}
                category={category}
                rates={rates}
                setRates={setRates}
              />
            ))}
          </div>
        </div>

        <div className="button-row default-rates-actions">
          <button className="save-project-button" onClick={handleSave} type="button">
            Save Defaults
          </button>
          <button className="danger-button" onClick={handleResetAll} type="button">
            Reset All Defaults
          </button>
          <button className="secondary-button" onClick={() => setRates(getStoredDefaultRates())} type="button">
            Cancel Changes
          </button>
        </div>
      </section>
    </main>
  );
}
