// myapp/client/src/components/Mulching/MulchingHomesTable.jsx

import React from "react";
import { computeHomeValues } from "./mulchingCalculations";

export default function MulchingHomesTable({
  mergedData,
  mulchingRates,
  handleHomeFieldChange,
  handleHomeHoursOverrideChange,
  handleHomeMulchOverrideChange,
  smPwrHomesSelection,
  loaderHomesSelection,
  smPwrHomesDisplay,
  loaderHomesDisplay,
  computedSmPwrHomesHours,
  computedLoaderHomesHours,
  handleSmPwrHomesSelectionChange,
  handleSmPwrHomesOverrideChange,
  handleLoaderHomesSelectionChange,
  handleLoaderHomesOverrideChange,
  tableStyle,
  thStyle,
  tdStyle,
  inputStyle,
  tablePrice,
  formatCurrency,
}) {
  const renderHomeRow = (homeKey, label) => {
    const home = mergedData.handHomes[homeKey];
    const computed = computeHomeValues(home, mulchingRates);

    const displayHours =
      home.hoursOverride != null ? home.hoursOverride : computed.hours;
    const displayMulch =
      home.mulchOverride != null ? home.mulchOverride : computed.mulch;

    return (
      <tr key={homeKey}>
        <td style={tdStyle}>{label}</td>
        <td style={tdStyle}>
          <input
            type="number"
            value={home.sqftEach}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "sqftEach", e.target.value)
            }
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>
            sq ft / home
          </div>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            value={home.count}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "count", e.target.value)
            }
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}># homes</div>
        </td>
        <td style={tdStyle}>
          <select
            value={home.efficiency}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "efficiency", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Slowest">Slowest</option>
            <option value="Slow">Slow</option>
            <option value="Average">Average</option>
            <option value="Fast">Fast</option>
            <option value="Fastest">Fastest</option>
          </select>
        </td>
        <td style={tdStyle}>
          <select
            value={home.depth}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "depth", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Feather">Feather</option>
            <option value={'1"'}>1"</option>
            <option value={'2"'}>2"</option>
          </select>
        </td>
        <td style={tdStyle}>
          <select
            value={home.proximity}
            onChange={(e) =>
              handleHomeFieldChange(homeKey, "proximity", e.target.value)
            }
            style={inputStyle}
          >
            <option value="Close">Close</option>
            <option value="Nearby">Nearby</option>
            <option value="Moderate">Moderate</option>
            <option value="Far">Far</option>
            <option value="Farthest">Farthest</option>
          </select>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            step="0.01"
            value={displayHours === 0 ? "" : displayHours.toFixed(2)}
            onChange={(e) =>
              handleHomeHoursOverrideChange(homeKey, e.target.value)
            }
            placeholder={computed.hours ? computed.hours.toFixed(2) : ""}
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
        </td>
        <td style={tdStyle}>
          <input
            type="number"
            step="0.5"
            value={displayMulch === 0 ? "" : displayMulch.toFixed(1)}
            onChange={(e) =>
              handleHomeMulchOverrideChange(homeKey, e.target.value)
            }
            placeholder={computed.mulch ? computed.mulch.toFixed(1) : ""}
            style={inputStyle}
          />
          <div style={{ fontSize: "0.7rem", color: "#666" }}>yards</div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <h3
        style={{
          margin: "0.75rem 0 0 0",
          fontSize: "1rem",
        }}
      >
        Hand – Homes
      </h3>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Home</th>
            <th style={thStyle}>Sq Ft / Home</th>
            <th style={thStyle}># Homes</th>
            <th style={thStyle}>Eff</th>
            <th style={thStyle}>Depth</th>
            <th style={thStyle}>Prox</th>
            <th style={thStyle}>Hours</th>
            <th style={thStyle}>Mulch</th>
          </tr>
        </thead>
        <tbody>
          {renderHomeRow("home1", "Home Size #1")}
          {renderHomeRow("home2", "Home Size #2")}
          {renderHomeRow("home3", "Home Size #3")}

          {/* Sm Pwr (Homes) */}
          <tr>
            <td style={tdStyle}>Sm Pwr (Homes)</td>
            <td style={tdStyle} colSpan={5}>
              <select
                value={smPwrHomesSelection}
                onChange={(e) =>
                  handleSmPwrHomesSelectionChange(e.target.value)
                }
                style={inputStyle}
              >
                <option value="Minimum">Minimum</option>
                <option value="Less">Less</option>
                <option value="Average">Average</option>
                <option value="More">More</option>
                <option value="Copious">Copious</option>
              </select>
            </td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={
                  smPwrHomesDisplay === 0
                    ? ""
                    : smPwrHomesDisplay.toFixed(2)
                }
                onChange={(e) =>
                  handleSmPwrHomesOverrideChange(e.target.value)
                }
                placeholder={
                  computedSmPwrHomesHours
                    ? computedSmPwrHomesHours.toFixed(2)
                    : ""
                }
                style={inputStyle}
              />
              <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
            </td>
            <td style={tdStyle}></td>
          </tr>

          {/* Loader (Homes) */}
          <tr>
            <td style={tdStyle}>Loader (Homes)</td>
            <td style={tdStyle} colSpan={5}>
              <select
                value={loaderHomesSelection}
                onChange={(e) =>
                  handleLoaderHomesSelectionChange(e.target.value)
                }
                style={inputStyle}
              >
                <option value="Minimum">Minimum</option>
                <option value="Less">Less</option>
                <option value="Average">Average</option>
                <option value="More">More</option>
                <option value="Copious">Copious</option>
              </select>
            </td>
            <td style={tdStyle}>
              <input
                type="number"
                step="0.01"
                value={
                  loaderHomesDisplay === 0
                    ? ""
                    : loaderHomesDisplay.toFixed(2)
                }
                onChange={(e) =>
                  handleLoaderHomesOverrideChange(e.target.value)
                }
                placeholder={
                  computedLoaderHomesHours
                    ? computedLoaderHomesHours.toFixed(2)
                    : ""
                }
                style={inputStyle}
              />
              <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
            </td>
            <td style={tdStyle}></td>
          </tr>

          {/* PRICE ROW */}
          <tr>
            <td style={tdStyle} colSpan={8} align="right">
              <strong>Price: {formatCurrency(tablePrice)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
