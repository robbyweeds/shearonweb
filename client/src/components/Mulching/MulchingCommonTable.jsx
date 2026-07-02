// myapp/client/src/components/Mulching/MulchingCommonTable.jsx

import React from "react";
import { computeCommonAreaValues } from "./mulchingCalculations";

export default function MulchingCommonTable({
  mergedData,
  mulchingRates,
  handleCommonFieldChange,
  handleCommonHoursOverrideChange,
  handleCommonMulchOverrideChange,
  smPwrCommonSelection,
  loaderCommonSelection,
  smPwrCommonDisplay,
  loaderCommonDisplay,
  computedSmPwrCommonHours,
  computedLoaderCommonHours,
  handleSmPwrCommonSelectionChange,
  handleSmPwrCommonOverrideChange,
  handleLoaderCommonSelectionChange,
  handleLoaderCommonOverrideChange,
  tableStyle,
  thStyle,
  tdStyle,
  inputStyle,
  tablePrice,
  formatCurrency,
}) {
  const renderCommonRow = (areaKey, label) => {
    const area = mergedData.handCommonAreas[areaKey];
    const computed = computeCommonAreaValues(area, mulchingRates);

    const displayHours =
      area.hoursOverride != null ? area.hoursOverride : computed.hours;
    const displayMulch =
      area.mulchOverride != null ? area.mulchOverride : computed.mulch;

    return (
      <tr key={areaKey}>
        <td style={tdStyle}>{label}</td>
        <td style={tdStyle}>
          <input
            type="number"
            value={area.sqft}
            onChange={(e) =>
              handleCommonFieldChange(areaKey, "sqft", e.target.value)
            }
            style={inputStyle}
          />
        </td>
        <td style={tdStyle}>
          <select
            value={area.efficiency}
            onChange={(e) =>
              handleCommonFieldChange(areaKey, "efficiency", e.target.value)
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
            value={area.depth}
            onChange={(e) =>
              handleCommonFieldChange(areaKey, "depth", e.target.value)
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
            value={area.proximity}
            onChange={(e) =>
              handleCommonFieldChange(areaKey, "proximity", e.target.value)
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
              handleCommonHoursOverrideChange(areaKey, e.target.value)
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
              handleCommonMulchOverrideChange(areaKey, e.target.value)
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
      <h3 style={{ margin: 0, fontSize: "1rem" }}>Hand – Common Areas</h3>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Area</th>
            <th style={thStyle}>Sq Ft</th>
            <th style={thStyle}>Eff</th>
            <th style={thStyle}>Depth</th>
            <th style={thStyle}>Prox</th>
            <th style={thStyle}>Hours</th>
            <th style={thStyle}>Mulch</th>
          </tr>
        </thead>
        <tbody>
          {renderCommonRow("area1", "Area #1")}
          {renderCommonRow("area2", "Area #2")}
          {renderCommonRow("area3", "Area #3")}

          {/* Sm Pwr (Common) */}
          <tr>
            <td style={tdStyle}>Sm Pwr (Common)</td>
            <td style={tdStyle} colSpan={4}>
              <select
                value={smPwrCommonSelection}
                onChange={(e) =>
                  handleSmPwrCommonSelectionChange(e.target.value)
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
                  smPwrCommonDisplay === 0
                    ? ""
                    : smPwrCommonDisplay.toFixed(2)
                }
                onChange={(e) =>
                  handleSmPwrCommonOverrideChange(e.target.value)
                }
                placeholder={
                  computedSmPwrCommonHours
                    ? computedSmPwrCommonHours.toFixed(2)
                    : ""
                }
                style={inputStyle}
              />
              <div style={{ fontSize: "0.7rem", color: "#666" }}>hrs</div>
            </td>
            <td style={tdStyle}></td>
          </tr>

          {/* Loader (Common) */}
          <tr>
            <td style={tdStyle}>Loader (Common)</td>
            <td style={tdStyle} colSpan={4}>
              <select
                value={loaderCommonSelection}
                onChange={(e) =>
                  handleLoaderCommonSelectionChange(e.target.value)
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
                  loaderCommonDisplay === 0
                    ? ""
                    : loaderCommonDisplay.toFixed(2)
                }
                onChange={(e) =>
                  handleLoaderCommonOverrideChange(e.target.value)
                }
                placeholder={
                  computedLoaderCommonHours
                    ? computedLoaderCommonHours.toFixed(2)
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
            <td style={tdStyle} colSpan={7} align="right">
              <strong>Price: {formatCurrency(tablePrice)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
