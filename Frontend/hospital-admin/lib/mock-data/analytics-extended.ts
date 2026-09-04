import {
  PatientAcquisitionSummary,
  AppointmentConversionSummary,
  NewVsReturningSummary,
  DoctorPerformanceSummary,
  DepartmentPerformanceSummary,
  PatientRetentionSummary,
  NoShowSummary,
  ExtendedRevenueAnalyticsSummary,
} from "@/hospital-admin/lib/types";

// ==========================================
// 1. PATIENT ACQUISITION DATASET
// ==========================================
export const mockPatientAcquisitionData: PatientAcquisitionSummary = {
  totalAcquired: 4250,
  topChannel: "Self-Referral",
  channelConversionRate: 84.6,
  channelBreakdown: [
    {
      channel: "Self-Referral",
      volume: 1360,
      sharePercent: 32.0,
      conversionRate: 88.5,
      avgRevenuePerPatient: 24500,
      growthYoY: "+12.4%",
    },
    {
      channel: "Doctor Referral",
      volume: 1105,
      sharePercent: 26.0,
      conversionRate: 92.4,
      avgRevenuePerPatient: 48000,
      growthYoY: "+18.2%",
    },
    {
      channel: "Insurance Network",
      volume: 892,
      sharePercent: 21.0,
      conversionRate: 86.0,
      avgRevenuePerPatient: 56500,
      growthYoY: "+14.0%",
    },
    {
      channel: "Online Booking",
      volume: 468,
      sharePercent: 11.0,
      conversionRate: 74.2,
      avgRevenuePerPatient: 18200,
      growthYoY: "+28.5%",
    },
    {
      channel: "Walk-in",
      volume: 298,
      sharePercent: 7.0,
      conversionRate: 79.8,
      avgRevenuePerPatient: 14600,
      growthYoY: "-2.1%",
    },
    {
      channel: "Corporate Health Partner",
      volume: 127,
      sharePercent: 3.0,
      conversionRate: 94.0,
      avgRevenuePerPatient: 32000,
      growthYoY: "+8.6%",
    },
  ],
  monthlyTrends: [
    { month: "Jan 2026", selfReferral: 195, doctorReferral: 160, insuranceNetwork: 130, walkIn: 45, onlineBooking: 60, corporate: 18, total: 608 },
    { month: "Feb 2026", selfReferral: 210, doctorReferral: 172, insuranceNetwork: 138, walkIn: 48, onlineBooking: 68, corporate: 20, total: 656 },
    { month: "Mar 2026", selfReferral: 228, doctorReferral: 185, insuranceNetwork: 149, walkIn: 50, onlineBooking: 75, corporate: 21, total: 708 },
    { month: "Apr 2026", selfReferral: 235, doctorReferral: 190, insuranceNetwork: 155, walkIn: 52, onlineBooking: 82, corporate: 22, total: 736 },
    { month: "May 2026", selfReferral: 242, doctorReferral: 198, insuranceNetwork: 158, walkIn: 51, onlineBooking: 89, corporate: 23, total: 761 },
    { month: "Jun 2026", selfReferral: 250, doctorReferral: 200, insuranceNetwork: 162, walkIn: 52, onlineBooking: 94, corporate: 23, total: 781 },
  ],
};

// ==========================================
// 2. APPOINTMENT CONVERSION FUNNEL DATASET
// ==========================================
export const mockAppointmentConversionData: AppointmentConversionSummary = {
  totalBooked: 6420,
  overallConversionRate: 83.4,
  leadTimeHoursAvg: 18.4,
  stages: [
    { stage: "Booked", count: 6420, percentage: 100.0, dropOffRate: 0.0 },
    { stage: "Checked-in", count: 5855, percentage: 91.2, dropOffRate: 8.8 },
    { stage: "Completed", count: 5354, percentage: 83.4, dropOffRate: 7.8 },
    { stage: "Cancelled", count: 436, percentage: 6.8 },
    { stage: "No-show", count: 334, percentage: 5.2 },
    { stage: "Rescheduled", count: 296, percentage: 4.6 },
  ],
  bySpecialty: [
    { department: "Cardiac Sciences", booked: 1480, completed: 1302, cancelled: 92, noShow: 86, conversionRate: 88.0 },
    { department: "Orthopaedics", booked: 1240, completed: 1054, cancelled: 110, noShow: 76, conversionRate: 85.0 },
    { department: "Neuro & Spine", booked: 980, completed: 833, cancelled: 82, noShow: 65, conversionRate: 85.0 },
    { department: "General Surgery & Gastro", booked: 890, completed: 738, cancelled: 88, noShow: 64, conversionRate: 82.9 },
    { department: "Diabetology & Endocrinology", booked: 780, completed: 631, cancelled: 84, noShow: 65, conversionRate: 80.9 },
    { department: "Pediatrics & Neonatology", booked: 650, completed: 513, cancelled: 82, noShow: 55, conversionRate: 78.9 },
    { department: "Dermatology & Cosmetics", booked: 400, completed: 283, cancelled: 68, noShow: 49, conversionRate: 70.8 },
  ],
  monthlyFunnelTrend: [
    { month: "Jan 2026", booked: 980, completed: 803, conversionRate: 81.9 },
    { month: "Feb 2026", booked: 1020, completed: 846, conversionRate: 82.9 },
    { month: "Mar 2026", booked: 1080, completed: 902, conversionRate: 83.5 },
    { month: "Apr 2026", booked: 1100, completed: 924, conversionRate: 84.0 },
    { month: "May 2026", booked: 1110, completed: 938, conversionRate: 84.5 },
    { month: "Jun 2026", booked: 1130, completed: 941, conversionRate: 83.3 },
  ],
};

// ==========================================
// 3. NEW VS RETURNING PATIENTS DATASET
// ==========================================
export const mockNewVsReturningData: NewVsReturningSummary = {
  totalUniquePatients: 12450,
  newPatientsYTD: 5230,
  returningPatientsYTD: 7220,
  repeatVisitRatio: 58.0,
  monthlyTrend: [
    { period: "Jan 2026", newPatients: 810, returningPatients: 1090, newPatientShare: 42.6, returningPatientShare: 57.4 },
    { period: "Feb 2026", newPatients: 840, returningPatients: 1140, newPatientShare: 42.4, returningPatientShare: 57.6 },
    { period: "Mar 2026", newPatients: 890, returningPatients: 1220, newPatientShare: 42.2, returningPatientShare: 57.8 },
    { period: "Apr 2026", newPatients: 910, returningPatients: 1260, newPatientShare: 41.9, returningPatientShare: 58.1 },
    { period: "May 2026", newPatients: 880, returningPatients: 1240, newPatientShare: 41.5, returningPatientShare: 58.5 },
    { period: "Jun 2026", newPatients: 900, returningPatients: 1270, newPatientShare: 41.5, returningPatientShare: 58.5 },
  ],
  specialtySplit: [
    { department: "Emergency & Trauma", newPatients: 820, returningPatients: 210, newPatientRatio: 79.6 },
    { department: "General Surgery", newPatients: 560, returningPatients: 420, newPatientRatio: 57.1 },
    { department: "Orthopaedics", newPatients: 680, returningPatients: 740, newPatientRatio: 47.9 },
    { department: "Cardiac Sciences", newPatients: 740, returningPatients: 1120, newPatientRatio: 39.8 },
    { department: "Diabetology & Endocrinology", newPatients: 310, returningPatients: 980, newPatientRatio: 24.0 },
    { department: "Nephrology & Dialysis", newPatients: 120, returningPatients: 840, newPatientRatio: 12.5 },
  ],
};

// ==========================================
// 4. DOCTOR PERFORMANCE DATASET
// Cross-references financial numbers from F18 Doctor Revenue
// ==========================================
export const mockDoctorPerformanceData: DoctorPerformanceSummary = {
  totalActiveDoctors: 48,
  hospitalAvgConsultDuration: 18.5,
  avgDoctorRating: 4.84,
  avgNoShowRate: 4.9,
  doctors: [
    {
      doctorId: "doc_001",
      doctorName: "Dr. Vikram Seth",
      department: "Cardiology & Cath Lab",
      appointmentVolume: 340,
      completedConsultations: 318,
      avgConsultDurationMinutes: 21.0,
      noShowRate: 3.5,
      patientRating: 4.92,
      totalReviews: 128,
      otProceduresCount: 42,
      f18GrossRevenue: 4820000,
      f18NetRealized: 4434400,
    },
    {
      doctorId: "doc_002",
      doctorName: "Dr. Arvind Joshi",
      department: "Orthopaedics & Joint Replacement",
      appointmentVolume: 295,
      completedConsultations: 274,
      avgConsultDurationMinutes: 19.5,
      noShowRate: 4.1,
      patientRating: 4.88,
      totalReviews: 96,
      otProceduresCount: 38,
      f18GrossRevenue: 4250000,
      f18NetRealized: 3910000,
    },
    {
      doctorId: "doc_003",
      doctorName: "Dr. Priya Sharma",
      department: "Diabetology & Internal Medicine",
      appointmentVolume: 410,
      completedConsultations: 382,
      avgConsultDurationMinutes: 16.0,
      noShowRate: 4.8,
      patientRating: 4.85,
      totalReviews: 142,
      otProceduresCount: 0,
      f18GrossRevenue: 3860000,
      f18NetRealized: 3551200,
    },
    {
      doctorId: "doc_004",
      doctorName: "Dr. Rajesh Nair",
      department: "Neuro & Spine Surgery",
      appointmentVolume: 220,
      completedConsultations: 206,
      avgConsultDurationMinutes: 24.5,
      noShowRate: 3.2,
      patientRating: 4.94,
      totalReviews: 84,
      otProceduresCount: 28,
      f18GrossRevenue: 3580000,
      f18NetRealized: 3293600,
    },
    {
      doctorId: "doc_005",
      doctorName: "Dr. Sneha Roy",
      department: "Pediatrics & Neonatology",
      appointmentVolume: 360,
      completedConsultations: 328,
      avgConsultDurationMinutes: 15.5,
      noShowRate: 5.8,
      patientRating: 4.79,
      totalReviews: 110,
      otProceduresCount: 6,
      f18GrossRevenue: 2940000,
      f18NetRealized: 2704800,
    },
    {
      doctorId: "doc_006",
      doctorName: "Dr. Ananya Sen",
      department: "Gastroenterology & Endoscopy",
      appointmentVolume: 280,
      completedConsultations: 258,
      avgConsultDurationMinutes: 18.0,
      noShowRate: 5.2,
      patientRating: 4.81,
      totalReviews: 78,
      otProceduresCount: 32,
      f18GrossRevenue: 2710000,
      f18NetRealized: 2493200,
    },
  ],
};

// ==========================================
// 5. DEPARTMENT PERFORMANCE DATASET
// Sourced from F12 Wards & Beds, F6 OT, and F18 Department Revenue
// ==========================================
export const mockDepartmentPerformanceData: DepartmentPerformanceSummary = {
  hospitalBedOccupancy: 84.6,
  hospitalAlosDays: 3.8,
  hospitalReadmissionRate: 2.1,
  departments: [
    {
      departmentId: "dept_cardiac",
      departmentName: "Cardiac Sciences & Cath Lab",
      totalPatientVolume: 1840,
      opdConsultations: 1302,
      ipdAdmissions: 538,
      bedOccupancyRate: 91.2,
      alosDays: 4.2,
      readmissionRate30Day: 1.8,
      otSurgeriesPerformed: 86,
      f18GrossRevenue: 38400000,
      f18ContributionMargin: 38.5,
    },
    {
      departmentId: "dept_neuro",
      departmentName: "Neuro & Spine Sciences",
      totalPatientVolume: 1220,
      opdConsultations: 833,
      ipdAdmissions: 387,
      bedOccupancyRate: 88.4,
      alosDays: 5.4,
      readmissionRate30Day: 2.4,
      otSurgeriesPerformed: 64,
      f18GrossRevenue: 30200000,
      f18ContributionMargin: 41.2,
    },
    {
      departmentId: "dept_ortho",
      departmentName: "Orthopaedics & Joint Reconstruction",
      totalPatientVolume: 1480,
      opdConsultations: 1054,
      ipdAdmissions: 426,
      bedOccupancyRate: 82.5,
      alosDays: 3.6,
      readmissionRate30Day: 1.2,
      otSurgeriesPerformed: 92,
      f18GrossRevenue: 26100000,
      f18ContributionMargin: 36.0,
    },
    {
      departmentId: "dept_er_icu",
      departmentName: "Emergency & Critical Care ICU",
      totalPatientVolume: 2150,
      opdConsultations: 1450,
      ipdAdmissions: 700,
      bedOccupancyRate: 94.0,
      alosDays: 3.1,
      readmissionRate30Day: 3.5,
      otSurgeriesPerformed: 45,
      f18GrossRevenue: 22000000,
      f18ContributionMargin: 29.4,
    },
    {
      departmentId: "dept_gastro",
      departmentName: "Gastroenterology & GI Surgery",
      totalPatientVolume: 1110,
      opdConsultations: 738,
      ipdAdmissions: 372,
      bedOccupancyRate: 78.0,
      alosDays: 2.8,
      readmissionRate30Day: 1.6,
      otSurgeriesPerformed: 58,
      f18GrossRevenue: 20600000,
      f18ContributionMargin: 34.8,
    },
  ],
};

// ==========================================
// 6. PATIENT RETENTION DATASET
// Sourced from F5 Follow-ups and Master Qlyno Patient Visit History
// ==========================================
export const mockPatientRetentionData: PatientRetentionSummary = {
  overall30DayRetention: 78.4,
  overall90DayRetention: 52.6,
  annualChurnRate: 18.2,
  avgDaysBetweenVisits: 44.5,
  cohorts: [
    { timeframe: "30 Days", eligibleCohortSize: 1840, returnedCount: 1442, retentionRate: 78.4, benchmarkRate: 70.0 },
    { timeframe: "60 Days", eligibleCohortSize: 1720, returnedCount: 1104, retentionRate: 64.2, benchmarkRate: 58.0 },
    { timeframe: "90 Days", eligibleCohortSize: 1650, returnedCount: 868, retentionRate: 52.6, benchmarkRate: 45.0 },
    { timeframe: "180 Days", eligibleCohortSize: 1540, returnedCount: 644, retentionRate: 41.8, benchmarkRate: 35.0 },
    { timeframe: "365 Days", eligibleCohortSize: 1410, returnedCount: 457, retentionRate: 32.4, benchmarkRate: 28.0 },
  ],
  followUpAdherence: [
    { department: "Cardiology", scheduledFollowUps: 480, completedFollowUps: 432, adherenceRate: 90.0 },
    { department: "Orthopaedics", scheduledFollowUps: 420, completedFollowUps: 365, adherenceRate: 86.9 },
    { department: "Diabetology", scheduledFollowUps: 510, completedFollowUps: 438, adherenceRate: 85.9 },
    { department: "Neuro Surgery", scheduledFollowUps: 240, completedFollowUps: 211, adherenceRate: 87.9 },
    { department: "Pediatrics", scheduledFollowUps: 310, completedFollowUps: 248, adherenceRate: 80.0 },
    { department: "General Medicine", scheduledFollowUps: 380, completedFollowUps: 285, adherenceRate: 75.0 },
  ],
  monthlyRetentionTrend: [
    { cohortMonth: "Jan 2026", m1Retention: 78.0, m3Retention: 52.0, m6Retention: 41.0, m12Retention: 32.0 },
    { cohortMonth: "Feb 2026", m1Retention: 78.5, m3Retention: 52.4, m6Retention: 41.5, m12Retention: 32.5 },
    { cohortMonth: "Mar 2026", m1Retention: 79.0, m3Retention: 53.0, m6Retention: 42.0, m12Retention: 33.0 },
    { cohortMonth: "Apr 2026", m1Retention: 78.2, m3Retention: 52.8, m6Retention: 41.8, m12Retention: 32.2 },
    { cohortMonth: "May 2026", m1Retention: 78.6, m3Retention: 52.5, m6Retention: 42.1, m12Retention: 32.6 },
    { cohortMonth: "Jun 2026", m1Retention: 78.4, m3Retention: 52.6, m6Retention: 41.8, m12Retention: 32.4 },
  ],
};

// ==========================================
// 7. NO-SHOW ANALYTICS DATASET
// Aggregated from F1 Appointments and F5 Follow-ups
// ==========================================
export const mockNoShowData: NoShowSummary = {
  metrics: {
    totalScheduled: 6420,
    totalNoShows: 334,
    overallNoShowRate: 5.2,
    estimatedRevenueLoss: 485000,
  },
  byDepartment: [
    { department: "Dermatology & Cosmetics", scheduled: 400, noShows: 49, noShowRate: 12.3 },
    { department: "Diabetology & Endocrinology", scheduled: 780, noShows: 65, noShowRate: 8.3 },
    { department: "Pediatrics & Neonatology", scheduled: 650, noShows: 55, noShowRate: 8.5 },
    { department: "General Surgery & Gastro", scheduled: 890, noShows: 64, noShowRate: 7.2 },
    { department: "Neuro & Spine", scheduled: 980, noShows: 65, noShowRate: 6.6 },
    { department: "Orthopaedics", scheduled: 1240, noShows: 76, noShowRate: 6.1 },
    { department: "Cardiac Sciences", scheduled: 1480, noShows: 86, noShowRate: 5.8 },
  ],
  byDoctor: [
    { doctorId: "doc_005", doctorName: "Dr. Sneha Roy", department: "Pediatrics", scheduled: 360, noShows: 21, noShowRate: 5.8 },
    { doctorId: "doc_006", doctorName: "Dr. Ananya Sen", department: "Gastroenterology", scheduled: 280, noShows: 15, noShowRate: 5.4 },
    { doctorId: "doc_003", doctorName: "Dr. Priya Sharma", department: "Diabetology", scheduled: 410, noShows: 20, noShowRate: 4.9 },
    { doctorId: "doc_002", doctorName: "Dr. Arvind Joshi", department: "Orthopaedics", scheduled: 295, noShows: 12, noShowRate: 4.1 },
    { doctorId: "doc_001", doctorName: "Dr. Vikram Seth", department: "Cardiology", scheduled: 340, noShows: 12, noShowRate: 3.5 },
    { doctorId: "doc_004", doctorName: "Dr. Rajesh Nair", department: "Neuro Surgery", scheduled: 220, noShows: 7, noShowRate: 3.2 },
  ],
  byTimeSlot: [
    { timeSlot: "08:00 - 10:00 AM", scheduled: 1100, noShows: 78, noShowRate: 7.1 },
    { timeSlot: "10:00 - 12:00 PM", scheduled: 1650, noShows: 62, noShowRate: 3.8 },
    { timeSlot: "12:00 - 02:00 PM", scheduled: 1280, noShows: 54, noShowRate: 4.2 },
    { timeSlot: "02:00 - 04:00 PM", scheduled: 980, noShows: 68, noShowRate: 6.9 },
    { timeSlot: "04:00 - 06:00 PM", scheduled: 840, noShows: 46, noShowRate: 5.5 },
    { timeSlot: "06:00 - 08:00 PM", scheduled: 570, noShows: 26, noShowRate: 4.6 },
  ],
  byDayOfWeek: [
    { day: "Monday", noShowRate: 7.4 },
    { day: "Tuesday", noShowRate: 4.8 },
    { day: "Wednesday", noShowRate: 4.2 },
    { day: "Thursday", noShowRate: 4.5 },
    { day: "Friday", noShowRate: 5.1 },
    { day: "Saturday", noShowRate: 6.8 },
  ],
};

// ==========================================
// 8. EXTENDED REVENUE ANALYTICS DATASET
// Ground truth sourced from F18 Financial Reports
// ==========================================
export const mockExtendedRevenueData: ExtendedRevenueAnalyticsSummary = {
  currentQuarterRealizedLakhs: 520,
  currentQuarterTargetLakhs: 500,
  quarterlyGrowthYoY: "+14.2%",
  annualProjectedLakhs: 2180,
  revPABDaily: 18400,
  trajectory: [
    { quarter: "Q1 2025", realizedRevenueLakhs: 380, budgetedTargetLakhs: 360, variancePercent: 5.6, opdRevenueLakhs: 114, ipdRevenueLakhs: 205, pharmacyDiagnosticsLakhs: 61 },
    { quarter: "Q2 2025", realizedRevenueLakhs: 410, budgetedTargetLakhs: 400, variancePercent: 2.5, opdRevenueLakhs: 123, ipdRevenueLakhs: 221, pharmacyDiagnosticsLakhs: 66 },
    { quarter: "Q3 2025", realizedRevenueLakhs: 430, budgetedTargetLakhs: 420, variancePercent: 2.4, opdRevenueLakhs: 129, ipdRevenueLakhs: 232, pharmacyDiagnosticsLakhs: 69 },
    { quarter: "Q4 2025", realizedRevenueLakhs: 460, budgetedTargetLakhs: 450, variancePercent: 2.2, opdRevenueLakhs: 138, ipdRevenueLakhs: 248, pharmacyDiagnosticsLakhs: 74 },
    { quarter: "Q1 2026", realizedRevenueLakhs: 490, budgetedTargetLakhs: 475, variancePercent: 3.2, opdRevenueLakhs: 147, ipdRevenueLakhs: 265, pharmacyDiagnosticsLakhs: 78 },
    { quarter: "Q2 2026", realizedRevenueLakhs: 520, budgetedTargetLakhs: 500, variancePercent: 4.0, opdRevenueLakhs: 156, ipdRevenueLakhs: 281, pharmacyDiagnosticsLakhs: 83 },
  ],
  payerMix: [
    { payerCategory: "Private TPA / Cashless", revenueLakhs: 270.4, sharePercent: 52.0, settlementTurnaroundDays: 14 },
    { payerCategory: "Cash & Self-Pay", revenueLakhs: 135.2, sharePercent: 26.0, settlementTurnaroundDays: 0 },
    { payerCategory: "Government Schemes (PM-JAY/CGHS)", revenueLakhs: 78.0, sharePercent: 15.0, settlementTurnaroundDays: 42 },
    { payerCategory: "Corporate Empanelment", revenueLakhs: 36.4, sharePercent: 7.0, settlementTurnaroundDays: 28 },
  ],
};
