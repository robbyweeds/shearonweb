// =====================================
// mowingSave.js — FINAL VERSION
// =====================================

export function saveMowing(
  tableId,
  updatedData,
  mowingList,
  updateService,
  totals
) {
  const updated = {
    ...updatedData,
    totals, // always save corrected totals
  };

  const newList = mowingList.some((t) => t.id === tableId)
    ? mowingList.map((t) =>
        t.id === tableId ? { id: tableId, data: updated } : t
      )
    : [...mowingList, { id: tableId, data: updated }];

  updateService("mowing", newList);
}
