// ==========================================
// MODULE F25: CONTENT & RESOURCES TYPES
// ==========================================

export type ContentCategory =
  | "Articles"
  | "Videos"
  | "Patient Education"
  | "Doctor Content"
  | "Department Content";

export type ContentStatus =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Published"
  | "Archived"
  | "Rejected";

export type ContentDestination =
  | "Public Website"
  | "Targeted Patient Dispatch"
  | "Both";

export type ArticleCategory =
  | "Health & Wellness"
  | "Disease Awareness"
  | "Preventive Care"
  | "Nutrition & Diet"
  | "Clinical Outcomes"
  | "Hospital News";

export type VideoCategory =
  | "Patient Education"
  | "Doctor Introduction"
  | "Procedure Explainer"
  | "Facility Tour";

export type EducationType =
  | "Pre-Op Guide"
  | "Post-Op Guide"
  | "Leaflet"
  | "Infographic"
  | "Care Pathway";

export interface ClinicalReviewRecord {
  id: string;
  contentId: string;
  contentType: ContentCategory;
  reviewerDoctorId: string;
  reviewerDoctorName: string;
  reviewerSpecialty: string;
  status: "Approved" | "Rejected" | "Pending";
  nabhChecklist: {
    medicalAccuracy: boolean;
    referenceCitations: boolean;
    clearDisclaimer: boolean;
    noExaggeratedClaims: boolean;
  };
  reviewNotes?: string;
  reviewedAt?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  summary: string;
  body: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  coverImage?: string;
  readTimeMinutes: number;
  tags: string[];
  status: ContentStatus;
  version: number;
  clinicalReview?: ClinicalReviewRecord;
  publishedToPublic: boolean;
  hospitalProfileSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoAssetItem {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  quality: "1080p" | "4K" | "720p";
  departmentId?: string;
  departmentName?: string;
  doctorId?: string;
  doctorName?: string;
  hasCaptions: boolean;
  status: ContentStatus;
  requiresClinicalReview: boolean;
  clinicalReview?: ClinicalReviewRecord;
  publishedToPublic: boolean;
  createdAt: string;
}

export interface ContentSection {
  heading: string;
  body: string;
  items?: string[];
}

export interface PatientEducationItem {
  id: string;
  title: string;
  code: string;
  type: EducationType;
  departmentId: string;
  departmentName: string;
  procedureName?: string;
  languages: string[];
  summary: string;
  contentSections: ContentSection[];
  downloadUrl?: string;
  destination: ContentDestination;
  triggeredByTrigger?:
    | "F5 Discharge"
    | "F6 Surgery Scheduled"
    | "F6 Surgery Completed"
    | "General";
  status: ContentStatus;
  version: number;
  clinicalReview?: ClinicalReviewRecord;
  dispatchCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorContentItem {
  id: string;
  title: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorUhid?: string;
  isDoctorVerified: boolean;
  contentType:
    | "Health Tip"
    | "Case Study"
    | "Specialty Guide"
    | "Research Paper"
    | "Video Article";
  summary: string;
  content: string;
  tags: string[];
  status: ContentStatus;
  syncedWithDoctorBio: boolean;
  clinicalReview?: ClinicalReviewRecord;
  createdAt: string;
}

export interface DepartmentContentItem {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  contentType:
    | "Care Pathway"
    | "Clinical Milestone"
    | "Technology Guide"
    | "Department Leaflet";
  summary: string;
  content: string;
  status: ContentStatus;
  syncedWithDepartmentCuration: boolean;
  clinicalReview?: ClinicalReviewRecord;
  createdAt: string;
}
