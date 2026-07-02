// =====================================
// mowingRatesUtils.js
// Helpers for the rates page
// =====================================

// Merge nested default + user-defined
export function mergeRates(defaults, current) {
  const out = { ...defaults };

  for (const key in defaults) {
    if (typeof defaults[key] === "object" && defaults[key] !== null) {
      out[key] = {
        ...defaults[key],
        ...(current?.[key] || {}),
      };
    }
  }

  return out;
}

// Apply updated value at deep path
export function updateNestedRate(prev, category, key1, key2, value) {
  return {
    ...prev,
    [category]: {
      ...prev[category],
      [key1]: {
        ...prev[category][key1],
        [key2]: value,
      },
    },
  };
}
