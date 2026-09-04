export interface PatientIdentifier { type: string; value: string; issuer?: string; validFrom?: string; validUntil?: string; isPrimary: boolean; }
export interface PatientAddress { line1?: string; line2?: string; locality?: string; landmark?: string; city?: string; district?: string; state?: string; postalCode?: string; country?: string; }
export interface PatientGuardian { fullName: string; relationship: string; mobile: string; email?: string; authorizedForConsent: boolean; authorizedForReports: boolean; }
export interface EmergencyContact { name?: string; relationship?: string; mobile?: string; alternateMobile?: string; notes?: string; }
export interface RegisteredPatient {
  id: string; tenantId: string; source: "HMS" | "QLYNO_LAB" | "B2B_CLIENT"; qlynoPatientId?: string; hospitalMrn?: string;
  externalClientPatientId?: string; clientOrganizationId?: string; title?: string; givenName: string; middleName?: string; familyName?: string;
  singleName: boolean; displayName: string; dateOfBirth?: string; estimatedAge?: { value: number; unit: "DAYS" | "MONTHS" | "YEARS"; asOfDate: string };
  sexAtBirth: "MALE" | "FEMALE" | "INTERSEX" | "UNKNOWN"; genderIdentity?: string; preferredLanguage?: string;
  primaryMobile?: string; alternateMobile?: string; email?: string; preferredCommunication?: string; address?: PatientAddress;
  guardian?: PatientGuardian; emergencyContact?: EmergencyContact; identifiers: PatientIdentifier[]; privacyConsent: boolean;
  reportDeliveryConsent: boolean; notificationConsents: string[]; status: "ACTIVE" | "INACTIVE" | "DECEASED"; createdAt: string; updatedAt: string;
  encounterId?: string; encounterNumber?: string; ward?: string; bed?: string; registrationAudit: string;
}

export interface RegisterHospitalPatientInput {
  title?: string; givenName: string; middleName?: string; familyName?: string; singleName: boolean; dateOfBirth?: string;
  estimatedAge?: number; sexAtBirth: RegisteredPatient["sexAtBirth"]; primaryMobile?: string; email?: string; preferredLanguage?: string;
  address?: PatientAddress; guardian?: PatientGuardian; emergencyContact?: EmergencyContact; abha?: string;
  privacyConsent: boolean; reportDeliveryConsent: boolean; duplicateOverrideReason?: string;
}
