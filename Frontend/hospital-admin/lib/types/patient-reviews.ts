export type ReviewSource = "Google" | "Post-Discharge Survey" | "Portal App";
export type ReviewSentiment = "Positive" | "Neutral" | "Negative";

export interface PatientReviewItem {
  id: string;
  source: ReviewSource;
  patientId?: string | null;
  patientName: string;
  rating: number; // 1 to 5
  reviewText: string;
  submittedAt: string;
  responded: boolean;
  responseText?: string | null;
  respondedBy?: string | null;
  respondedAt?: string | null;
  linkedDoctorId?: string | null;
  linkedDoctorName?: string | null;
  linkedDepartmentId?: string | null;
  linkedDepartmentName?: string | null;
  sentiment: ReviewSentiment;
  tags: string[];
  isEscalatedToGrievance?: boolean;
  grievanceCaseId?: string | null;
  googleReviewUrl?: string | null;
}

export type NPSCategory = "Promoter" | "Passive" | "Detractor";

export interface NPSSurveyResponse {
  id: string;
  patientId: string;
  patientName: string;
  encounterId: string;
  score: number; // 0 to 10
  category: NPSCategory;
  feedbackText?: string;
  submittedAt: string;
  triggeredByDischargeId: string;
  dispatchedViaChannel: "WhatsApp" | "SMS" | "Portal";
  departmentName: string;
  doctorName?: string;
  followupRequired: boolean;
}

export type GrievanceCategory =
  | "OPD"
  | "Billing"
  | "Nursing"
  | "Clinical Care"
  | "Infrastructure"
  | "Other";

export type GrievanceSeverity = "Critical" | "High" | "Medium" | "Low";

export type GrievanceEscalationTier =
  | "Tier 1 - Ward Incharge"
  | "Tier 2 - Medical Superintendent"
  | "Tier 3 - Grievance Committee";

export type GrievanceStatus = "Open" | "In Progress" | "Escalated" | "Resolved";

export interface GrievanceCase {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  category: GrievanceCategory;
  description: string;
  sourceReviewId?: string | null;
  severity: GrievanceSeverity;
  escalationTier: GrievanceEscalationTier;
  assignedTo: string;
  status: GrievanceStatus;
  createdAt: string;
  slaDeadline: string;
  isOverdue: boolean;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  patientCallbackConfirmed: boolean;
  resolvedBy?: string | null;
}

export interface DimensionRating {
  dimension: string;
  score: number; // out of 5
}

export interface StarBreakdown {
  stars5: number;
  stars4: number;
  stars3: number;
  stars2: number;
  stars1: number;
}

export interface DoctorScorecard {
  doctorId: string;
  doctorName: string;
  specialty: string;
  departmentId: string;
  departmentName: string;
  averageRating: number;
  totalReviews: number;
  starBreakdown: StarBreakdown;
  dimensions: DimensionRating[]; // Bedside Manner, Clinical Clarity, Punctuality
  operationalVolume: number; // Cross-ref from F21
  patientRecommendationPercent: number;
}

export interface DepartmentScorecard {
  departmentId: string;
  departmentName: string;
  averageRating: number;
  totalReviews: number;
  starBreakdown: StarBreakdown;
  dimensions: DimensionRating[]; // Nursing care, Cleanliness, Wait time, Billing
  patientRecommendationPercent: number;
}

export interface ReviewAnalyticsSummary {
  hospitalAverageRating: number;
  totalReviewsCount: number;
  npsScore: number;
  npsPromotersPercent: number;
  npsPassivesPercent: number;
  npsDetractorsPercent: number;
  averageResponseTimeHours: number;
  responseRatePercent: number;
  unansweredCount: number;
  activeGrievancesCount: number;
  monthlyRatingTrend: { month: string; rating: number; reviewCount: number }[];
  monthlyNpsTrend: { month: string; nps: number }[];
  sentimentBreakdown: { sentiment: ReviewSentiment; count: number; percentage: number }[];
  categorySentiment: {
    category: string;
    positivePercent: number;
    negativePercent: number;
  }[];
}
