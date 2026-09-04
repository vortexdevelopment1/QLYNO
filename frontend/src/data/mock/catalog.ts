import type { TestCatalogItem } from "@/lib/types/domain";

export const MOCK_CATALOG: TestCatalogItem[] = [
  {
    id: "TC-001", code: "CBC", name: "Complete Blood Count", department: "Hematology", method: "Impedance / Flow Cytometry",
    specimen: "Whole Blood", container: "EDTA (Lavender top)", minVolume: "2 mL", stability: "24h at 2–8°C", tat: "2 hours",
    units: "10^3/µL etc.", referenceRange: "See analyte-level ranges", criticalRange: "Hb < 7 g/dL, Plt < 20 x10^3/µL",
    reflexRule: "Blast flag → manual smear review", version: "v3.2", status: "active", effectiveDate: "2026-01-01",
  },
  {
    id: "TC-002", code: "LFT", name: "Liver Function Panel", department: "Chemistry", method: "Photometry",
    specimen: "Serum", container: "SST (Gold top)", minVolume: "3 mL", stability: "48h at 2–8°C", tat: "4 hours",
    units: "U/L, mg/dL", referenceRange: "See analyte-level ranges", criticalRange: "Bilirubin > 15 mg/dL",
    version: "v2.1", status: "active", effectiveDate: "2025-11-15",
  },
  {
    id: "TC-003", code: "COAG-PT", name: "Prothrombin Time / INR", department: "Coagulation", method: "Optical Clot Detection",
    specimen: "Plasma", container: "Sodium Citrate (Blue top)", minVolume: "2.7 mL", stability: "4h at room temp", tat: "1 hour",
    units: "seconds, INR", referenceRange: "11–13.5 sec, INR 0.8–1.1", criticalRange: "INR > 5.0",
    version: "v1.4", status: "active", effectiveDate: "2025-09-01",
  },
  {
    id: "TC-004", code: "TSH", name: "Thyroid Stimulating Hormone", department: "Immunology", method: "CLIA",
    specimen: "Serum", container: "SST (Gold top)", minVolume: "1 mL", stability: "5 days at 2–8°C", tat: "6 hours",
    units: "µIU/mL", referenceRange: "0.4–4.0 µIU/mL", reflexRule: "TSH abnormal → reflex Free T4",
    version: "v2.0", status: "active", effectiveDate: "2026-02-01",
  },
  {
    id: "TC-005", code: "URINE-RM", name: "Urine Routine & Microscopy", department: "Urinalysis", method: "Dipstick + Microscopy",
    specimen: "Urine", container: "Sterile Urine Cup", minVolume: "10 mL", stability: "2h at room temp", tat: "1.5 hours",
    units: "Qualitative / /hpf", referenceRange: "Nil / 0–5 per hpf", version: "v1.2", status: "active", effectiveDate: "2025-06-01",
  },
  {
    id: "TC-006", code: "BC", name: "Blood Culture", department: "Microbiology", method: "Automated Culture + Identification",
    specimen: "Blood", container: "BacT/ALERT Bottle (Aerobic + Anaerobic)", minVolume: "8–10 mL per bottle", stability: "N/A — incubate immediately",
    tat: "24–120 hours", units: "Organism ID + Sensitivity", referenceRange: "No growth", version: "v1.0", status: "active", effectiveDate: "2025-04-01",
  },
  {
    id: "TC-007", code: "COVID-PCR", name: "SARS-CoV-2 RT-PCR", department: "Molecular", method: "Real-Time PCR",
    specimen: "Nasopharyngeal Swab", container: "Viral Transport Medium", minVolume: "N/A", stability: "72h at 2–8°C",
    tat: "8 hours", units: "Detected / Not Detected", referenceRange: "Not Detected", version: "v4.0", status: "active", effectiveDate: "2026-03-01",
  },
  {
    id: "TC-008", code: "HISTO-BX", name: "Histopathology — Biopsy", department: "Pathology", method: "H&E Microscopy",
    specimen: "Tissue", container: "10% Formalin Jar", minVolume: "N/A", stability: "Stable in fixative",
    tat: "72 hours", units: "Descriptive Report", referenceRange: "N/A", version: "v1.1", status: "active", effectiveDate: "2025-07-01",
  },
  {
    id: "TC-009", code: "HBA1C", name: "Glycated Haemoglobin (HbA1c)", department: "Chemistry", method: "HPLC",
    specimen: "Whole Blood", container: "EDTA (Lavender top)", minVolume: "1 mL", stability: "7 days at 2–8°C",
    tat: "3 hours", units: "%", referenceRange: "< 5.7% (non-diabetic)", version: "v2.3", status: "active", effectiveDate: "2026-01-15",
  },
  {
    id: "TC-010", code: "LIPID", name: "Lipid Profile", department: "Chemistry", method: "Photometry",
    specimen: "Serum", container: "SST (Gold top)", minVolume: "3 mL", stability: "48h at 2–8°C", tat: "4 hours",
    units: "mg/dL", referenceRange: "See analyte-level ranges", version: "v2.4 (draft)", status: "draft", effectiveDate: "2026-09-01",
  },
];
