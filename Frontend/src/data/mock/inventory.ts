import type { InventoryItem, StockLot, Equipment } from "@/lib/types/domain";

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  { id: "INV-01", name: "Glucose Reagent Kit", category: "Chemistry Reagent", unit: "Kit", reorderLevel: 5, currentStock: 3 },
  { id: "INV-02", name: "EDTA Vacutainer (Lavender)", category: "Consumable", unit: "Box of 100", reorderLevel: 10, currentStock: 22 },
  { id: "INV-03", name: "SST Vacutainer (Gold)", category: "Consumable", unit: "Box of 100", reorderLevel: 10, currentStock: 6 },
  { id: "INV-04", name: "TSH Reagent Cartridge", category: "Immunology Reagent", unit: "Cartridge", reorderLevel: 4, currentStock: 2 },
  { id: "INV-05", name: "BacT/ALERT Culture Bottle (Aerobic)", category: "Microbiology Consumable", unit: "Bottle", reorderLevel: 20, currentStock: 45 },
  { id: "INV-06", name: "PT/INR Reagent", category: "Coagulation Reagent", unit: "Kit", reorderLevel: 3, currentStock: 8 },
];

export const MOCK_STOCK_LOTS: StockLot[] = [
  { id: "LOT-01", itemId: "INV-01", itemName: "Glucose Reagent Kit", lotNumber: "GLU-2604", expiryDate: "2026-09-05", quantity: 3, status: "near_expiry" },
  { id: "LOT-02", itemId: "INV-04", itemName: "TSH Reagent Cartridge", lotNumber: "TSH-1188", expiryDate: "2026-08-30", quantity: 2, status: "near_expiry" },
  { id: "LOT-03", itemId: "INV-02", itemName: "EDTA Vacutainer (Lavender)", lotNumber: "EDTA-7742", expiryDate: "2027-03-01", quantity: 22, status: "available" },
  { id: "LOT-04", itemId: "INV-06", itemName: "PT/INR Reagent", lotNumber: "PT-0552", expiryDate: "2026-08-01", quantity: 4, status: "expired" },
  { id: "LOT-05", itemId: "INV-05", itemName: "BacT/ALERT Culture Bottle (Aerobic)", lotNumber: "BCB-3391", expiryDate: "2026-12-15", quantity: 45, status: "available" },
  { id: "LOT-06", itemId: "INV-01", itemName: "Glucose Reagent Kit", lotNumber: "GLU-2591", expiryDate: "2026-08-25", quantity: 1, status: "quarantined" },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: "EQ-01", name: "Cobas c311", department: "Chemistry", status: "operational", lastServiceDate: "2026-07-10", nextCalibrationDate: "2026-10-10" },
  { id: "EQ-02", name: "Sysmex XN-1000", department: "Hematology", status: "operational", lastServiceDate: "2026-06-22", nextCalibrationDate: "2026-09-22" },
  { id: "EQ-03", name: "Stago STA Compact", department: "Coagulation", status: "maintenance", lastServiceDate: "2026-08-23", nextCalibrationDate: "2026-11-23" },
  { id: "EQ-04", name: "Architect i1000SR", department: "Immunology", status: "due_calibration", lastServiceDate: "2026-05-01", nextCalibrationDate: "2026-08-25" },
  { id: "EQ-05", name: "iChem Urine Analyzer", department: "Urinalysis", status: "downtime", lastServiceDate: "2026-04-14", nextCalibrationDate: "2026-10-14" },
  { id: "EQ-06", name: "BacT/ALERT 3D", department: "Microbiology", status: "operational", lastServiceDate: "2026-07-30", nextCalibrationDate: "2026-10-30" },
];
