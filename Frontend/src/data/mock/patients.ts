import type { Patient, Encounter, ClientOrganization, Practitioner } from "@/lib/types/domain";

export const MOCK_PATIENTS: Patient[] = [
  { id: "PAT-1001", mrn: "MRN-88213", name: "Ramesh Iyer", age: 58, sex: "M", contact: "+91 98200 11223", source: "hospital_encounter", branchOrWard: "Ward 4B / Bed 12", lastOrderDate: "2026-08-22" },
  { id: "PAT-1002", mrn: "MRN-88214", name: "Sunita Deshmukh", age: 34, sex: "F", contact: "+91 98200 33445", source: "hospital_encounter", branchOrWard: "ICU / Bed 3", lastOrderDate: "2026-08-23" },
  { id: "PAT-1003", name: "Arjun Mehta", age: 41, sex: "M", contact: "+91 98111 22334", source: "walk_in", branchOrWard: "Andheri Branch", lastOrderDate: "2026-08-23" },
  { id: "PAT-1004", name: "Priya Nair", age: 29, sex: "F", contact: "+91 98222 44556", source: "home_collection", branchOrWard: "Powai Zone", lastOrderDate: "2026-08-21" },
  { id: "PAT-1005", name: "Karthik Subramaniam", age: 47, sex: "M", contact: "+91 98333 55667", source: "b2b_client", branchOrWard: "Apex Corporate Wellness", lastOrderDate: "2026-08-20", duplicateWarning: true },
  { id: "PAT-1006", mrn: "MRN-88220", name: "Fatima Sheikh", age: 6, sex: "F", contact: "+91 98444 66778", source: "hospital_encounter", branchOrWard: "Paediatrics / Bed 7", lastOrderDate: "2026-08-23", privacyFlag: true },
  { id: "PAT-1007", name: "Vikram Chauhan", age: 63, sex: "M", contact: "+91 98555 77889", source: "walk_in", branchOrWard: "Andheri Branch", lastOrderDate: "2026-08-19" },
  { id: "PAT-1008", name: "Meera Krishnan", age: 38, sex: "F", contact: "+91 98666 88990", source: "home_collection", branchOrWard: "Bandra Zone", lastOrderDate: "2026-08-22" },
  { id: "PAT-1009", mrn: "MRN-88231", name: "Anil Kapoor Rao", age: 71, sex: "M", contact: "+91 98777 99001", source: "hospital_encounter", branchOrWard: "Cardiology / Bed 2", lastOrderDate: "2026-08-23" },
  { id: "PAT-1010", name: "Divya Prakash", age: 26, sex: "F", contact: "+91 98888 00112", source: "walk_in", branchOrWard: "Thane Branch", lastOrderDate: "2026-08-18" },
];

export const MOCK_ENCOUNTERS: Encounter[] = [
  { id: "ENC-5001", patientId: "PAT-1001", encounterNo: "IP-2026-04521", ward: "Ward 4B", bed: "12", admittingDoctor: "Dr. Nikhil Wagh", status: "active" },
  { id: "ENC-5002", patientId: "PAT-1002", encounterNo: "IP-2026-04588", ward: "ICU", bed: "3", admittingDoctor: "Dr. Alka Bhosle", status: "active" },
  { id: "ENC-5003", patientId: "PAT-1006", encounterNo: "IP-2026-04602", ward: "Paediatrics", bed: "7", admittingDoctor: "Dr. Sameer Joshi", status: "active" },
  { id: "ENC-5004", patientId: "PAT-1009", encounterNo: "IP-2026-04490", ward: "Cardiology", bed: "2", admittingDoctor: "Dr. Rekha Pillai", status: "active" },
];

export const MOCK_CLIENT_ORGS: ClientOrganization[] = [
  { id: "CLI-001", name: "Sunrise Multispeciality Hospital", type: "hospital", contactPerson: "Ops Desk", contactEmail: "ops@sunrisehosp.example", contractId: "CTR-9001" },
  { id: "CLI-002", name: "Apex Corporate Wellness Pvt Ltd", type: "corporate", contactPerson: "Neha Kulkarni", contactEmail: "neha.k@apexwellness.example", contractId: "CTR-9002", creditLimit: 500000, creditTermsDays: 30 },
  { id: "CLI-003", name: "CarePlus TPA Services", type: "insurer_tpa", contactPerson: "Rohit Bhalla", contactEmail: "rohit.b@careplustpa.example", contractId: "CTR-9003", creditLimit: 800000, creditTermsDays: 45 },
  { id: "CLI-004", name: "Wellspring Collection Center — Vashi", type: "collection_center", contactPerson: "Sarika Patil", contactEmail: "vashi@wellspring.example" },
  { id: "CLI-005", name: "Metropolis Reference Laboratory", type: "reference_lab", contactPerson: "Send-out Desk", contactEmail: "sendouts@metroref.example" },
  { id: "CLI-006", name: "Dr. Lal's Diagnostic Chain — Client Lab", type: "client_lab", contactPerson: "Client Portal Admin", contactEmail: "portal@drlalchain.example" },
];

export const MOCK_PRACTITIONERS: Practitioner[] = [
  { id: "DOC-001", name: "Dr. Nikhil Wagh", specialty: "Internal Medicine", clinicOrHospital: "Sunrise Multispeciality Hospital", phone: "+91 98200 10001" },
  { id: "DOC-002", name: "Dr. Alka Bhosle", specialty: "Critical Care", clinicOrHospital: "Sunrise Multispeciality Hospital", phone: "+91 98200 10002" },
  { id: "DOC-003", name: "Dr. Sameer Joshi", specialty: "Paediatrics", clinicOrHospital: "Sunrise Multispeciality Hospital", phone: "+91 98200 10003" },
  { id: "DOC-004", name: "Dr. Rekha Pillai", specialty: "Cardiology", clinicOrHospital: "Sunrise Multispeciality Hospital", phone: "+91 98200 10004" },
  { id: "DOC-005", name: "Dr. Farhan Ansari", specialty: "General Practice", clinicOrHospital: "Ansari Family Clinic", phone: "+91 98200 10005" },
];
