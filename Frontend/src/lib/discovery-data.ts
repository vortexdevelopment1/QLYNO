import { clinic, doctors } from "./mock-data";

export type OrganizationType = "Solo Practice" | "Clinic" | "Hospital" | "Lab" | "Pharmacy";
export type ConsultationMode = "In-person" | "Online" | "Queue";

export interface Organization {
  id: string;
  type: OrganizationType;
  name: string;
  description: string;
  location: string;
  distanceKm: number;
  rating: number;
  verified: boolean;
  services: string[];
}

export interface DoctorAffiliation {
  id: string;
  doctorId: string;
  organizationId: string;
  label: string;
  department?: string;
  nextAvailable: string;
  fee: number;
  modes: ConsultationMode[];
  serviceIds: string[];
  status: "Active" | "Pending" | "Inactive";
}

export interface DiscoveryService {
  id: string;
  name: string;
  category: "Consultation" | "Diagnostic" | "Procedure" | "Pharmacy" | "Support";
  keywords: string[];
}

export interface LabTest {
  id: string;
  name: string;
  labOrganizationId: string;
  price: number;
  homeCollection: boolean;
  nextAvailable: string;
}

export interface MedicineListing {
  id: string;
  name: string;
  pharmacyOrganizationId: string;
  form: string;
  priceRange: string;
  available: boolean;
}

export const organizations: Organization[] = [
  {
    id: clinic.id,
    type: "Clinic",
    name: clinic.name,
    description: "Multi-doctor family clinic with OPD, follow-ups, diagnostics coordination and shared care.",
    location: "MG Road, Bengaluru",
    distanceKm: 2.8,
    rating: 4.7,
    verified: true,
    services: clinic.services,
  },
  {
    id: "org-hospital-1",
    type: "Hospital",
    name: "Aster City Hospital",
    description: "Multispeciality hospital with emergency support, cardiology, diagnostics and inpatient care.",
    location: "Indiranagar, Bengaluru",
    distanceKm: 4.1,
    rating: 4.6,
    verified: true,
    services: ["Emergency Care", "Cardiology", "Radiology", "Surgery", "Admission"],
  },
  {
    id: "org-solo-1",
    type: "Solo Practice",
    name: "Dr. Ananya Rao Practice",
    description: "Independent practice for internal medicine, chronic care and video consultations.",
    location: "Online + Koramangala, Bengaluru",
    distanceKm: 3.4,
    rating: 4.8,
    verified: true,
    services: ["Internal Medicine", "Diabetes Care", "Video Consultation", "Follow-up"],
  },
  {
    id: "org-lab-1",
    type: "Lab",
    name: "Apollo Diagnostics Partner Lab",
    description: "Partner diagnostics provider with report upload and home sample collection.",
    location: "Bengaluru Central",
    distanceKm: 2.1,
    rating: 4.5,
    verified: true,
    services: ["CBC", "HbA1c", "Lipid Profile", "Thyroid Panel", "Home Sample Collection"],
  },
  {
    id: "org-pharmacy-1",
    type: "Pharmacy",
    name: "MedPlus Pharmacy",
    description: "Connected pharmacy partner for prescription fulfillment and availability checks.",
    location: "MG Road, Bengaluru",
    distanceKm: 1.2,
    rating: 4.4,
    verified: true,
    services: ["Prescription Fulfillment", "Medicine Availability", "Home Delivery"],
  },
];

export const discoveryServices: DiscoveryService[] = [
  { id: "svc-internal", name: "Internal Medicine Consultation", category: "Consultation", keywords: ["physician", "fever", "diabetes", "bp", "hypertension"] },
  { id: "svc-cardio", name: "Cardiology Consultation", category: "Consultation", keywords: ["heart", "cardiologist", "chest pain", "ecg"] },
  { id: "svc-pedia", name: "Pediatrics Consultation", category: "Consultation", keywords: ["child", "children", "pediatric", "asthma"] },
  { id: "svc-derma", name: "Dermatology Consultation", category: "Consultation", keywords: ["skin", "rash", "hair", "dermatologist"] },
  { id: "svc-cbc", name: "Complete Blood Count", category: "Diagnostic", keywords: ["cbc", "blood test", "hemoglobin"] },
  { id: "svc-hba1c", name: "HbA1c Test", category: "Diagnostic", keywords: ["diabetes", "sugar", "hba1c"] },
  { id: "svc-pharmacy", name: "Prescription Fulfillment", category: "Pharmacy", keywords: ["medicine", "pharmacy", "tablet", "delivery"] },
  { id: "svc-emergency", name: "Emergency Support", category: "Support", keywords: ["emergency", "sos", "ambulance", "urgent"] },
];

export const doctorAffiliations: DoctorAffiliation[] = [
  {
    id: "aff-doc1-clinic",
    doctorId: "doc-1",
    organizationId: "clinic-1",
    label: "Meridian Family Clinic - MG Road",
    department: "Internal Medicine",
    nextAvailable: "Today 4:00 PM",
    fee: 900,
    modes: ["In-person", "Online"],
    serviceIds: ["svc-internal", "svc-hba1c"],
    status: "Active",
  },
  {
    id: "aff-doc1-solo",
    doctorId: "doc-1",
    organizationId: "org-solo-1",
    label: "Solo Practice - Online",
    department: "Chronic Care",
    nextAvailable: "Tomorrow 11:00 AM",
    fee: 700,
    modes: ["Online"],
    serviceIds: ["svc-internal"],
    status: "Active",
  },
  {
    id: "aff-doc2-clinic",
    doctorId: "doc-2",
    organizationId: "clinic-1",
    label: "Meridian Family Clinic - MG Road",
    department: "Pediatrics",
    nextAvailable: "Today 5:30 PM",
    fee: 800,
    modes: ["In-person"],
    serviceIds: ["svc-pedia"],
    status: "Active",
  },
  {
    id: "aff-doc3-clinic",
    doctorId: "doc-3",
    organizationId: "clinic-1",
    label: "Meridian Family Clinic - Indiranagar",
    department: "Dermatology",
    nextAvailable: "Friday 10:30 AM",
    fee: 1000,
    modes: ["In-person", "Online"],
    serviceIds: ["svc-derma"],
    status: "Active",
  },
  {
    id: "aff-doc4-hospital",
    doctorId: "doc-4",
    organizationId: "org-hospital-1",
    label: "Aster City Hospital - Cardiology",
    department: "Cardiology",
    nextAvailable: "Today 6:00 PM",
    fee: 1500,
    modes: ["In-person", "Queue"],
    serviceIds: ["svc-cardio"],
    status: "Active",
  },
];

export const labTests: LabTest[] = [
  { id: "test-cbc", name: "Complete Blood Count", labOrganizationId: "org-lab-1", price: 350, homeCollection: true, nextAvailable: "Today 3:00 PM" },
  { id: "test-hba1c", name: "HbA1c", labOrganizationId: "org-lab-1", price: 450, homeCollection: true, nextAvailable: "Today 5:00 PM" },
  { id: "test-lipid", name: "Lipid Profile", labOrganizationId: "org-lab-1", price: 650, homeCollection: false, nextAvailable: "Tomorrow 9:00 AM" },
];

export const medicineListings: MedicineListing[] = [
  { id: "med-paracetamol", name: "Paracetamol", pharmacyOrganizationId: "org-pharmacy-1", form: "Tablet", priceRange: "INR 20-45", available: true },
  { id: "med-metformin", name: "Metformin", pharmacyOrganizationId: "org-pharmacy-1", form: "Tablet", priceRange: "INR 35-80", available: true },
  { id: "med-atorvastatin", name: "Atorvastatin", pharmacyOrganizationId: "org-pharmacy-1", form: "Tablet", priceRange: "INR 70-160", available: true },
];

export function getOrganization(id: string) {
  return organizations.find((organization) => organization.id === id);
}

export function getAffiliation(id: string) {
  return doctorAffiliations.find((affiliation) => affiliation.id === id);
}

export function getDoctorAffiliations(doctorId: string) {
  return doctorAffiliations.filter((affiliation) => affiliation.doctorId === doctorId && affiliation.status === "Active");
}

export function getService(id: string) {
  return discoveryServices.find((service) => service.id === id);
}

export function findDoctor(id: string) {
  return doctors.find((doctor) => doctor.id === id);
}
