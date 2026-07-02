// myapp/client/src/components/ServiceTablesWrapper.jsx
import React, { useEffect } from "react";
import { useServiceContext } from "../context/ServiceContext";

import EdgingTable from "./EdgingTable";
import BedMaintenanceTable from "./BedMaintenanceTable";

export default function ServiceTablesWrapper() {
  const { currentServices, updateService } = useServiceContext();

  // ---------------------------------------
  // ENSURE edging and bedMaintenance exist
  // ---------------------------------------
  useEffect(() => {
    // Initialize Edging if missing
    if (!currentServices.edging) {
      updateService("edging", {
        id: "EDGING1",
        data: {
          qtyUnit: { EDGER: 0, BLOWER: 0 },
          unitPrice: { EDGER: 55, BLOWER: 55 },
          summary: { numOccurrences: 1 }
        }
      });
    }

    // Initialize Bed Maintenance if missing
    if (!currentServices.bedMaintenance) {
      updateService("bedMaintenance", {
        id: "BED1",
        data: {
          qtyUnit: { HAND: 0, BACKPACK: 0, ROUNDUP: 0 },
          unitPrice: { HAND: 55, BACKPACK: 55, ROUNDUP: 50 },
          summary: { numOccurrences: 1 }
        }
      });
    }
  }, []); // runs once

  return (
    <div
      style={{
        display: "flex",
        gap: "2rem",
        marginBottom: "2rem",
        flexWrap: "wrap",
      }}
    >
      {/* --- Edging --- */}
      <div style={{ flex: 1, minWidth: "350px" }}>
        <h3>🔪 Edging Estimate</h3>
        <EdgingTable tableId="EDGING1" />
      </div>

      {/* --- Bed Maintenance --- */}
      <div style={{ flex: 1, minWidth: "350px" }}>
        <h3>🌱 Bed Maintenance Estimate</h3>
        <BedMaintenanceTable tableId="BED1" />
      </div>
    </div>
  );
}
