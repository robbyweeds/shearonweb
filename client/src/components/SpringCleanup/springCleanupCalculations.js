import { buildSpringCleanupTable, INITIAL_SPRING_CLEANUP_DATA, SPRING_CLEANUP_EXTRA_TABLE_TYPE, SPRING_CLEANUP_TABLES } from "./springCleanupDefaults";

const mergeTable = (definitionKey, saved = {}) => {
  const definition = SPRING_CLEANUP_TABLES[definitionKey];
  const initial = buildSpringCleanupTable(definition);

  return {
    ...initial,
    ...saved,
    definitionKey,
    qty: {
      ...initial.qty,
      ...(saved.qty || {}),
    },
    unitPrice: {
      ...initial.unitPrice,
      ...(saved.unitPrice || {}),
    },
    totals: {
      ...initial.totals,
      ...(saved.totals || {}),
    },
  };
};

export function mergeSpringCleanupData(data = {}) {
  return {
    ...INITIAL_SPRING_CLEANUP_DATA,
    ...data,
    tables: Object.fromEntries(
      Object.entries(SPRING_CLEANUP_TABLES).map(([tableKey]) => [
        tableKey,
        mergeTable(tableKey, data.tables?.[tableKey] || {}),
      ])
    ),
    extraTables: Array.isArray(data.extraTables)
      ? data.extraTables.map((table, index) => ({
          id: table.id || `${SPRING_CLEANUP_EXTRA_TABLE_TYPE}-${index + 1}`,
          ...mergeTable(table.definitionKey || SPRING_CLEANUP_EXTRA_TABLE_TYPE, table),
        }))
      : [],
  };
}

export function computeSpringCleanupTableTotals(tableKey, tableData = {}) {
  const definitionKey = SPRING_CLEANUP_TABLES[tableKey]
    ? tableKey
    : tableData.definitionKey || SPRING_CLEANUP_EXTRA_TABLE_TYPE;
  const definition = SPRING_CLEANUP_TABLES[definitionKey];
  const initial = INITIAL_SPRING_CLEANUP_DATA.tables[definitionKey] || buildSpringCleanupTable(definition);
  const data = {
    ...initial,
    ...tableData,
    qty: { ...initial.qty, ...(tableData.qty || {}) },
    unitPrice: { ...initial.unitPrice, ...(tableData.unitPrice || {}) },
  };
  const rowTotals = {};

  definition.keys.forEach((key) => {
    rowTotals[key] = Number(data.qty[key] || 0) * Number(data.unitPrice[key] || 0);
  });

  const hoursPerOcc = definition.hourKeys.reduce(
    (sum, key) => sum + Number(data.qty[key] || 0),
    0
  );
  const dollarsPerOcc = definition.keys.reduce(
    (sum, key) => sum + Number(rowTotals[key] || 0),
    0
  );
  const totalMat = definition.materialKeys.reduce(
    (sum, key) => sum + Number(rowTotals[key] || 0),
    0
  );
  const occurrences = Number(data.occurrences || 0);

  return {
    rowTotals,
    hoursPerOcc,
    dollarsPerOcc,
    totalMat,
    totalDollars: dollarsPerOcc * occurrences,
    totalHours: hoursPerOcc * occurrences,
  };
}

export function computeSpringCleanupTotals(data = {}) {
  const merged = mergeSpringCleanupData(data);
  const tables = Object.fromEntries(
    Object.keys(SPRING_CLEANUP_TABLES).map((tableKey) => [
      tableKey,
      computeSpringCleanupTableTotals(tableKey, merged.tables[tableKey]),
    ])
  );
  const extraTables = merged.extraTables.map((table) => ({
    id: table.id,
    definitionKey: table.definitionKey,
    ...computeSpringCleanupTableTotals(table.definitionKey, table),
  }));
  const allTables = [...Object.values(tables), ...extraTables];

  return {
    tables,
    extraTables,
    totalDollars: allTables.reduce((sum, table) => sum + table.totalDollars, 0),
    totalHours: allTables.reduce((sum, table) => sum + table.totalHours, 0),
  };
}
