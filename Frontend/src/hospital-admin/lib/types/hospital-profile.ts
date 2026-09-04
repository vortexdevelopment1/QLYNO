export type HospitalType =
  | "Multi-Specialty Tertiary Care"
  | "Super-Specialty Hospital"
  | "General Hospital"
  | "Academic Medical Center"
  | "Day Care Surgery Center";

export type FacilityCategory =
  | "Critical Care & ICU"
  | "Emergency & Trauma"
  | "Operation Theatres"
  | "Emergency Transport"
  | "Diagnostic Imaging & Lab"
  | "Inpatient Wards & Suites"
  | "Specialized Units";

export type ServiceCategory =
  | "Centers of Excellence"
  | "Surgical Specialties"
  | "Medical Specialties"
  | "Diagnostic & Imaging"
  | "Emergency & Critical Care"
  | "Emergency Transport"
  | "Rehabilitation & Wellness";

export type MediaCategory =
  | "Facility Exterior"
  | "Lobby & Reception"
  | "Operation Theatres"
  | "Intensive Care Unit (ICU)"
  | "Inpatient Deluxe Suites"
  | "Diagnostics & Imaging"
  | "Emergency & Trauma Bay";

export interface DepartmentExtension {
  id: string;
  departmentName: string;
  extensionNumber: string;
  directPhone?: string;
  operatingHours: string;
  isEmergencyLine?: boolean;
}

export interface DepartmentFeature {
  departmentId: string;
  name: string;
  categoryName: string;
  featured: boolean;
  publicDescription: string;
  displayOrder: number;
  highlightTag?: string;
  bedCount?: number;
  headName?: string;
}

export interface ServiceOffering {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  linkedCapabilityRef?: "OT_SURGERY" | "EMERGENCY_TRAUMA" | "AMBULANCE_DISPATCH" | "ICU_CRITICAL_CARE" | "DIAGNOSTIC_RADIOLOGY";
  linkedCapabilityName?: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface DoctorFeature {
  doctorId: string;
  doctorName: string;
  specialty: string;
  qualification: string;
  registrationNo: string;
  avatarUrl: string;
  affiliationType: string;
  featured: boolean;
  publicBio: string;
  displayOrder: number;
  specialtyHighlight?: string;
  // Verification Gate from Module 13:
  isVerified: boolean;
  publicSearchStatus: "Live / Searchable" | "Blocked (Pending Platform Review)" | "Blocked (Unconfirmed Affiliation)" | "Suspended";
}

export interface FacilityHighlight {
  id: string;
  name: string;
  category: FacilityCategory;
  description: string;
  linkedMetricRef?: "ICU_BED_COUNT" | "AMBULANCE_FLEET_COUNT" | "OT_ROOM_COUNT" | "TRAUMA_LEVEL_CERT";
  linkedMetricLabel?: string;
  isLiveSynced: boolean;
  manualMetricValue?: string;
  displayOrder: number;
}

export interface MediaAsset {
  id: string;
  title: string;
  category: MediaCategory;
  fileUrl: string;
  caption: string;
  isCover: boolean;
  displayOrder: number;
  uploadedAt: string;
  uploadedBy: string;
  fileSize?: string;
}

export interface ContactInformationData {
  generalPhone: string;
  emergencyHelpline: string;
  receptionPhone: string;
  email: string;
  supportEmail: string;
  website: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  geoCoordinates: {
    latitude: number;
    longitude: number;
    mapEmbedQuery: string;
  };
  departmentExtensions: DepartmentExtension[];
}

export interface BasicInformationData {
  hospitalName: string;
  legalEntityName: string;
  registrationNumber: string;
  tagline: string;
  establishedYear: number;
  hospitalType: HospitalType;
  nabhAccreditationNumber: string;
  accreditationBadges: string[];
  totalCampusAreaSqFt: number;
  aboutOverview: string;
}

export interface QlynoProfileSettings {
  networkParticipation: boolean;
  // Proposed feature toggles (PDF Module 22):
  emergencyCapacitySignalEnabled: boolean;
  serviceAvailabilityPublished: boolean;
  // Module 13 Derived Read-Only Fields:
  publicSearchVisibility: "Visible / Indexed" | "Draft Only (Verification Required)" | "Suspended";
  verificationStatus: "Verified" | "Under Review" | "Pending" | "Needs More Information" | "Suspended";
  lastVerifiedDate?: string;
}

export interface MaterialChangeAudit {
  id: string;
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  changedAt: string;
  changedBy: string;
  reviewStatus: "Pending Module 13 Review" | "Acknowledged" | "Verified";
}

export interface HospitalProfileState {
  basicInfo: BasicInformationData;
  contactInfo: ContactInformationData;
  departmentFeatures: DepartmentFeature[];
  serviceOfferings: ServiceOffering[];
  doctorFeatures: DoctorFeature[];
  facilityHighlights: FacilityHighlight[];
  mediaAssets: MediaAsset[];
  qlynoSettings: QlynoProfileSettings;
  materialChangesPending: boolean;
  materialChangeLogs: MaterialChangeAudit[];
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}
