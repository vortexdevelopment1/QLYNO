-- CreateEnum
CREATE TYPE "TenantMode" AS ENUM ('HOSPITAL', 'STANDALONE', 'B2B', 'HYBRID');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('HOSPITAL_ENCOUNTER', 'WALK_IN', 'HOME_COLLECTION', 'B2B_CLIENT', 'INTERNAL_NO_CHARGE');

-- CreateEnum
CREATE TYPE "BillingAuthority" AS ENUM ('HMS_CENTRAL', 'LIS_INTERNAL', 'EXTERNAL_CLIENT', 'NO_CHARGE');

-- CreateEnum
CREATE TYPE "SpecimenStatus" AS ENUM ('EXPECTED', 'LABEL_PRINTED', 'COLLECTED', 'IN_TRANSIT', 'RECEIVED', 'ACCESSIONED', 'ACCEPTED', 'REJECTED', 'ALIQUOTED', 'STORED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('ORDERED', 'READY', 'RUNNING', 'RESULTED', 'TECHNICAL_REVIEW', 'MEDICAL_REVIEW', 'VERIFIED', 'RELEASED', 'REPEAT_REQUIRED', 'REFLEX_PENDING', 'OUTSOURCED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PRELIMINARY', 'FINAL', 'CORRECTED', 'AMENDED');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('ESTIMATE', 'INVOICED', 'PARTIALLY_PAID', 'PAID', 'CREDIT', 'ADJUSTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PostingStatus" AS ENUM ('NOT_REQUIRED', 'READY_TO_POST', 'POSTING', 'POSTED', 'FAILED', 'REVERSED', 'RECONCILIATION_REQUIRED');

-- CreateEnum
CREATE TYPE "ManifestStatus" AS ENUM ('BUILDING', 'SEALED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'LOST', 'DAMAGED');

-- CreateEnum
CREATE TYPE "QcStatus" AS ENUM ('IN_CONTROL', 'WARNING', 'OUT_OF_CONTROL', 'REVIEWED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('MINOR', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'DEGRADED', 'DISCONNECTED');

-- Preserve the existing HMS enum types and every value stored in their
-- columns. Renaming a PostgreSQL type updates its dependent columns in place.
ALTER TYPE "AccountStatus" RENAME TO "HmsAccountStatus";
ALTER TYPE "OrderStatus" RENAME TO "HmsOrderStatus";
ALTER TYPE "Priority" RENAME TO "HmsPriority";

-- Create the distinct lab enum types after freeing the original names.
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_INVITE', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'REJECTED');
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PLACED', 'ACCEPTED', 'COLLECTED', 'IN_PROGRESS', 'PARTIALLY_COMPLETED', 'COMPLETED', 'ON_HOLD', 'CANCELLED');
CREATE TYPE "Priority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN "sourceReportVersionId" TEXT;

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "mode" "TenantMode" NOT NULL,
    "billingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "accreditation" TEXT[],
    "logoInitials" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMembership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientOrganizationId" TEXT,
    "practitionerId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "tenantId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("membershipId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserSiteScope" (
    "tenantId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "UserSiteScope_pkey" PRIMARY KEY ("membershipId","siteId")
);

-- CreateTable
CREATE TABLE "UserDepartmentScope" (
    "tenantId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "UserDepartmentScope_pkey" PRIMARY KEY ("membershipId","departmentId")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "mrn" TEXT,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "sex" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "source" "OrderSource" NOT NULL,
    "branchOrWard" TEXT,
    "privacyFlag" BOOLEAN NOT NULL DEFAULT false,
    "duplicateWarning" BOOLEAN NOT NULL DEFAULT false,
    "platformPatientId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientIdentifier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "issuer" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PatientIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAddress" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "line1" TEXT,
    "line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,

    CONSTRAINT "PatientAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientGuardian" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "authorizedForConsent" BOOLEAN NOT NULL DEFAULT false,
    "authorizedForReports" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PatientGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT,
    "relationship" TEXT,
    "mobile" TEXT,
    "notes" TEXT,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterNo" TEXT NOT NULL,
    "ward" TEXT,
    "bed" TEXT,
    "admittingDoctor" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientOrganization" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "creditLimit" DECIMAL(14,2),
    "creditTermsDays" INTEGER,

    CONSTRAINT "ClientOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Practitioner" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "clinicOrHospital" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "Practitioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCatalogItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "departmentId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "specimenType" TEXT NOT NULL,
    "containerName" TEXT NOT NULL,
    "minVolume" TEXT NOT NULL,
    "stability" TEXT NOT NULL,
    "tatMinutes" INTEGER NOT NULL,
    "units" TEXT NOT NULL,
    "referenceRange" TEXT NOT NULL,
    "criticalRange" TEXT,
    "reflexRule" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaboratoryOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "clientOrganizationId" TEXT,
    "practitionerId" TEXT,
    "source" "OrderSource" NOT NULL,
    "billingAuthority" "BillingAuthority" NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "orderingDoctor" TEXT NOT NULL,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "sourceInvestigationOrderId" UUID,

    CONSTRAINT "LaboratoryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaboratoryOrderItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "departmentId" TEXT,
    "status" "TestStatus" NOT NULL,
    "reportGroupId" TEXT,

    CONSTRAINT "LaboratoryOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "ContainerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "encounterId" TEXT,
    "location" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "assignedUserId" TEXT,
    "status" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3),

    CONSTRAINT "CollectionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specimen" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "containerTypeId" TEXT,
    "accessionId" TEXT,
    "type" TEXT NOT NULL,
    "status" "SpecimenStatus" NOT NULL,
    "collectedAt" TIMESTAMP(3),
    "collectedById" TEXT,
    "receivedAt" TIMESTAMP(3),
    "receivedById" TEXT,
    "receivedSiteId" TEXT,
    "collectionCondition" TEXT,
    "sealStatus" TEXT,
    "temperature" TEXT,
    "receiptNotes" TEXT,
    "rejectedReason" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "recollectionOfId" TEXT,
    "storageLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specimen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemSpecimen" (
    "tenantId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "specimenId" TEXT NOT NULL,

    CONSTRAINT "OrderItemSpecimen_pkey" PRIMARY KEY ("orderItemId","specimenId")
);

-- CreateTable
CREATE TABLE "CollectionTaskSpecimen" (
    "tenantId" TEXT NOT NULL,
    "collectionTaskId" TEXT NOT NULL,
    "specimenId" TEXT NOT NULL,
    "requiredContainer" TEXT NOT NULL,
    "quantity" DECIMAL(10,2),

    CONSTRAINT "CollectionTaskSpecimen_pkey" PRIMARY KEY ("collectionTaskId","specimenId")
);

-- CreateTable
CREATE TABLE "Aliquot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parentSpecimenId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "volume" DECIMAL(10,2),
    "unit" TEXT,
    "status" "SpecimenStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aliquot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manifest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "courierName" TEXT NOT NULL,
    "status" "ManifestStatus" NOT NULL,
    "temperature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Manifest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManifestSpecimen" (
    "tenantId" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "specimenId" TEXT NOT NULL,

    CONSTRAINT "ManifestSpecimen_pkey" PRIMARY KEY ("manifestId","specimenId")
);

-- CreateTable
CREATE TABLE "WorkItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "departmentId" TEXT,
    "label" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "TestStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analyzer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "departmentId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "queueDepth" INTEGER NOT NULL DEFAULT 0,
    "mappingVersion" TEXT NOT NULL,
    "errorCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Analyzer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "analyzerId" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "InstrumentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentRunItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instrumentRunId" TEXT NOT NULL,
    "workItemId" TEXT,
    "rawPayload" JSONB,

    CONSTRAINT "InstrumentRunItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "currentValue" TEXT NOT NULL,
    "units" TEXT NOT NULL,
    "referenceRange" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "status" "TestStatus" NOT NULL,
    "enteredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultRevision" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "reason" TEXT,
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "ReportStatus" NOT NULL,
    "reason" TEXT,
    "releasedAt" TIMESTAMP(3),
    "authorizedById" TEXT,
    "immutableAt" TIMESTAMP(3),
    "payload" JSONB NOT NULL,

    CONSTRAINT "ReportVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersionItem" (
    "tenantId" TEXT NOT NULL,
    "reportVersionId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,

    CONSTRAINT "ReportVersionItem_pkey" PRIMARY KEY ("reportVersionId","orderItemId")
);

-- CreateTable
CREATE TABLE "CriticalNotification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "resultId" TEXT,
    "patientName" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "notifiedTo" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "readBackAt" TIMESTAMP(3),
    "timerSeconds" INTEGER NOT NULL,

    CONSTRAINT "CriticalNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QcRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "analyte" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "controlLot" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" "QcStatus" NOT NULL,
    "westgardViolation" TEXT,
    "runAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QcRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nonconformance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" TEXT NOT NULL,
    "raisedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nonconformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectivePreventiveAction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nonconformanceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrectivePreventiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "contentUrl" TEXT,

    CONSTRAINT "QualityDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityAudit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "findings" JSONB,

    CONSTRAINT "QualityAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyAssessment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "competency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3),

    CONSTRAINT "CompetencyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "reorderLevel" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "StockLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastServiceDate" TIMESTAMP(3),
    "nextCalibrationDate" TIMESTAMP(3),

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentMaintenance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "EquipmentMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT,
    "patientName" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "EstimateLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT,
    "clientOrganizationId" TEXT,
    "patientName" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "BillingStatus" NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "method" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientOrganizationId" TEXT NOT NULL,
    "rateCardVersion" TEXT NOT NULL,
    "creditLimit" DECIMAL(14,2) NOT NULL,
    "creditTermsDays" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractRate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ContractRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaboratoryChargeLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "chargeType" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "grossAmount" DECIMAL(14,2) NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL,
    "taxAmount" DECIMAL(14,2) NOT NULL,
    "netAmount" DECIMAL(14,2) NOT NULL,
    "billingAuthority" "BillingAuthority" NOT NULL,

    CONSTRAINT "LaboratoryChargeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalBillingPosting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "postingVersion" INTEGER NOT NULL,
    "status" "PostingStatus" NOT NULL,
    "hmsBillId" TEXT,
    "hmsBillNumber" TEXT,
    "postedAmount" DECIMAL(14,2),
    "postedAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "HospitalBillingPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL,
    "lastSync" TIMESTAMP(3),
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "mappingVersion" TEXT NOT NULL,

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "connectionId" TEXT,
    "direction" TEXT NOT NULL,
    "payload" JSONB,
    "status" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CommunicationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationDelivery" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT,
    "recipientMasked" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "CommunicationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requesterUserId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "ipAddress" TEXT,
    "requestId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subjectUserId" TEXT NOT NULL,
    "reviewerUserId" TEXT,
    "requestedRole" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "invitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByTokenHash" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthenticationAttempt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "identifierHash" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthenticationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Site_tenantId_idx" ON "Site"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Site_tenantId_code_key" ON "Site"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Department_tenantId_siteId_idx" ON "Department"("tenantId", "siteId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_tenantId_siteId_code_key" ON "Department"("tenantId", "siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "TenantMembership_tenantId_idx" ON "TenantMembership"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_tenantId_userId_key" ON "TenantMembership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_code_key" ON "Role"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "UserRole_tenantId_idx" ON "UserRole"("tenantId");

-- CreateIndex
CREATE INDEX "UserSiteScope_tenantId_idx" ON "UserSiteScope"("tenantId");

-- CreateIndex
CREATE INDEX "UserDepartmentScope_tenantId_idx" ON "UserDepartmentScope"("tenantId");

-- CreateIndex
CREATE INDEX "Patient_tenantId_name_idx" ON "Patient"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Patient_platformPatientId_idx" ON "Patient"("platformPatientId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_tenantId_mrn_key" ON "Patient"("tenantId", "mrn");

-- CreateIndex
CREATE INDEX "PatientIdentifier_tenantId_patientId_idx" ON "PatientIdentifier"("tenantId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientIdentifier_tenantId_type_value_key" ON "PatientIdentifier"("tenantId", "type", "value");

-- CreateIndex
CREATE INDEX "PatientAddress_tenantId_patientId_idx" ON "PatientAddress"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "PatientGuardian_tenantId_patientId_idx" ON "PatientGuardian"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "EmergencyContact_tenantId_patientId_idx" ON "EmergencyContact"("tenantId", "patientId");

-- CreateIndex
CREATE INDEX "Encounter_tenantId_patientId_idx" ON "Encounter"("tenantId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_tenantId_encounterNo_key" ON "Encounter"("tenantId", "encounterNo");

-- CreateIndex
CREATE INDEX "ClientOrganization_tenantId_name_idx" ON "ClientOrganization"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Practitioner_tenantId_name_idx" ON "Practitioner"("tenantId", "name");

-- CreateIndex
CREATE INDEX "TestCatalogItem_tenantId_status_idx" ON "TestCatalogItem"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TestCatalogItem_tenantId_code_version_key" ON "TestCatalogItem"("tenantId", "code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "LaboratoryOrder_sourceInvestigationOrderId_key" ON "LaboratoryOrder"("sourceInvestigationOrderId");

-- CreateIndex
CREATE INDEX "LaboratoryOrder_tenantId_siteId_status_idx" ON "LaboratoryOrder"("tenantId", "siteId", "status");

-- CreateIndex
CREATE INDEX "LaboratoryOrder_tenantId_patientId_placedAt_idx" ON "LaboratoryOrder"("tenantId", "patientId", "placedAt");

-- CreateIndex
CREATE INDEX "LaboratoryOrderItem_tenantId_orderId_status_idx" ON "LaboratoryOrderItem"("tenantId", "orderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContainerType_tenantId_code_key" ON "ContainerType"("tenantId", "code");

-- CreateIndex
CREATE INDEX "CollectionTask_tenantId_siteId_status_idx" ON "CollectionTask"("tenantId", "siteId", "status");

-- CreateIndex
CREATE INDEX "Specimen_tenantId_siteId_status_idx" ON "Specimen"("tenantId", "siteId", "status");

-- CreateIndex
CREATE INDEX "Specimen_tenantId_orderId_idx" ON "Specimen"("tenantId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Specimen_tenantId_accessionId_key" ON "Specimen"("tenantId", "accessionId");

-- CreateIndex
CREATE INDEX "OrderItemSpecimen_tenantId_idx" ON "OrderItemSpecimen"("tenantId");

-- CreateIndex
CREATE INDEX "CollectionTaskSpecimen_tenantId_idx" ON "CollectionTaskSpecimen"("tenantId");

-- CreateIndex
CREATE INDEX "Aliquot_tenantId_parentSpecimenId_idx" ON "Aliquot"("tenantId", "parentSpecimenId");

-- CreateIndex
CREATE INDEX "Manifest_tenantId_status_idx" ON "Manifest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ManifestSpecimen_tenantId_idx" ON "ManifestSpecimen"("tenantId");

-- CreateIndex
CREATE INDEX "WorkItem_tenantId_departmentId_status_idx" ON "WorkItem"("tenantId", "departmentId", "status");

-- CreateIndex
CREATE INDEX "Analyzer_tenantId_status_idx" ON "Analyzer"("tenantId", "status");

-- CreateIndex
CREATE INDEX "InstrumentRun_tenantId_analyzerId_runAt_idx" ON "InstrumentRun"("tenantId", "analyzerId", "runAt");

-- CreateIndex
CREATE INDEX "InstrumentRunItem_instrumentRunId_idx" ON "InstrumentRunItem"("instrumentRunId");

-- CreateIndex
CREATE INDEX "InstrumentRunItem_tenantId_idx" ON "InstrumentRunItem"("tenantId");

-- CreateIndex
CREATE INDEX "Result_tenantId_orderItemId_status_idx" ON "Result"("tenantId", "orderItemId", "status");

-- CreateIndex
CREATE INDEX "ResultRevision_tenantId_idx" ON "ResultRevision"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultRevision_resultId_version_key" ON "ResultRevision"("resultId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Report_tenantId_orderId_key" ON "Report"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "ReportVersion_tenantId_status_idx" ON "ReportVersion"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReportVersion_reportId_version_key" ON "ReportVersion"("reportId", "version");

-- CreateIndex
CREATE INDEX "ReportVersionItem_tenantId_idx" ON "ReportVersionItem"("tenantId");

-- CreateIndex
CREATE INDEX "CriticalNotification_tenantId_acknowledged_idx" ON "CriticalNotification"("tenantId", "acknowledged");

-- CreateIndex
CREATE INDEX "QcRun_tenantId_status_runAt_idx" ON "QcRun"("tenantId", "status", "runAt");

-- CreateIndex
CREATE INDEX "Nonconformance_tenantId_status_idx" ON "Nonconformance"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CorrectivePreventiveAction_tenantId_stage_idx" ON "CorrectivePreventiveAction"("tenantId", "stage");

-- CreateIndex
CREATE INDEX "QualityDocument_tenantId_status_idx" ON "QualityDocument"("tenantId", "status");

-- CreateIndex
CREATE INDEX "QualityAudit_tenantId_status_idx" ON "QualityAudit"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CompetencyAssessment_tenantId_userId_idx" ON "CompetencyAssessment"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "InventoryItem_tenantId_category_idx" ON "InventoryItem"("tenantId", "category");

-- CreateIndex
CREATE INDEX "StockLot_tenantId_status_expiryDate_idx" ON "StockLot"("tenantId", "status", "expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "StockLot_tenantId_itemId_lotNumber_key" ON "StockLot"("tenantId", "itemId", "lotNumber");

-- CreateIndex
CREATE INDEX "StockMovement_tenantId_itemId_createdAt_idx" ON "StockMovement"("tenantId", "itemId", "createdAt");

-- CreateIndex
CREATE INDEX "PurchaseOrder_tenantId_status_idx" ON "PurchaseOrder"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_tenantId_idx" ON "PurchaseOrderItem"("tenantId");

-- CreateIndex
CREATE INDEX "Equipment_tenantId_status_idx" ON "Equipment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "EquipmentMaintenance_equipmentId_status_idx" ON "EquipmentMaintenance"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "EquipmentMaintenance_tenantId_idx" ON "EquipmentMaintenance"("tenantId");

-- CreateIndex
CREATE INDEX "Estimate_tenantId_status_idx" ON "Estimate"("tenantId", "status");

-- CreateIndex
CREATE INDEX "EstimateLine_tenantId_idx" ON "EstimateLine"("tenantId");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_issuedAt_idx" ON "Invoice"("tenantId", "status", "issuedAt");

-- CreateIndex
CREATE INDEX "InvoiceLine_tenantId_idx" ON "InvoiceLine"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_receivedAt_idx" ON "Payment"("tenantId", "receivedAt");

-- CreateIndex
CREATE INDEX "Refund_tenantId_status_idx" ON "Refund"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Contract_tenantId_status_idx" ON "Contract"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ContractRate_tenantId_idx" ON "ContractRate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractRate_contractId_serviceCode_key" ON "ContractRate"("contractId", "serviceCode");

-- CreateIndex
CREATE INDEX "LaboratoryChargeLine_tenantId_orderId_idx" ON "LaboratoryChargeLine"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "HospitalBillingPosting_tenantId_status_idx" ON "HospitalBillingPosting"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalBillingPosting_tenantId_orderId_postingVersion_key" ON "HospitalBillingPosting"("tenantId", "orderId", "postingVersion");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_tenantId_system_key" ON "IntegrationConnection"("tenantId", "system");

-- CreateIndex
CREATE INDEX "IntegrationEvent_tenantId_occurredAt_idx" ON "IntegrationEvent"("tenantId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationTemplate_tenantId_name_channel_key" ON "CommunicationTemplate"("tenantId", "name", "channel");

-- CreateIndex
CREATE INDEX "CommunicationDelivery_tenantId_status_idx" ON "CommunicationDelivery"("tenantId", "status");

-- CreateIndex
CREATE INDEX "SupportTicket_tenantId_status_createdAt_idx" ON "SupportTicket"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_tenantId_requesterUserId_idx" ON "SupportTicket"("tenantId", "requesterUserId");

-- CreateIndex
CREATE INDEX "AuditEvent_tenantId_entity_entityId_idx" ON "AuditEvent"("tenantId", "entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_tenantId_timestamp_idx" ON "AuditEvent"("tenantId", "timestamp");

-- CreateIndex
CREATE INDEX "ApprovalRequest_tenantId_status_idx" ON "ApprovalRequest"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_tokenHash_key" ON "UserInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "UserInvitation_tenantId_email_idx" ON "UserInvitation"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshSession_tokenHash_key" ON "RefreshSession"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshSession_tenantId_userId_familyId_idx" ON "RefreshSession"("tenantId", "userId", "familyId");

-- CreateIndex
CREATE INDEX "AuthenticationAttempt_identifierHash_ipAddress_timestamp_idx" ON "AuthenticationAttempt"("identifierHash", "ipAddress", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_tenantId_userId_idx" ON "PasswordResetToken"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_sourceReportVersionId_key" ON "reports"("sourceReportVersionId");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_clientOrganizationId_fkey" FOREIGN KEY ("clientOrganizationId") REFERENCES "ClientOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSiteScope" ADD CONSTRAINT "UserSiteScope_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSiteScope" ADD CONSTRAINT "UserSiteScope_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSiteScope" ADD CONSTRAINT "UserSiteScope_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDepartmentScope" ADD CONSTRAINT "UserDepartmentScope_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDepartmentScope" ADD CONSTRAINT "UserDepartmentScope_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDepartmentScope" ADD CONSTRAINT "UserDepartmentScope_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_platformPatientId_fkey" FOREIGN KEY ("platformPatientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientIdentifier" ADD CONSTRAINT "PatientIdentifier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientIdentifier" ADD CONSTRAINT "PatientIdentifier_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAddress" ADD CONSTRAINT "PatientAddress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAddress" ADD CONSTRAINT "PatientAddress_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientGuardian" ADD CONSTRAINT "PatientGuardian_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientGuardian" ADD CONSTRAINT "PatientGuardian_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientOrganization" ADD CONSTRAINT "ClientOrganization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practitioner" ADD CONSTRAINT "Practitioner_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCatalogItem" ADD CONSTRAINT "TestCatalogItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCatalogItem" ADD CONSTRAINT "TestCatalogItem_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrder" ADD CONSTRAINT "LaboratoryOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrder" ADD CONSTRAINT "LaboratoryOrder_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrder" ADD CONSTRAINT "LaboratoryOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrder" ADD CONSTRAINT "LaboratoryOrder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrder" ADD CONSTRAINT "LaboratoryOrder_clientOrganizationId_fkey" FOREIGN KEY ("clientOrganizationId") REFERENCES "ClientOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrder" ADD CONSTRAINT "LaboratoryOrder_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrder" ADD CONSTRAINT "LaboratoryOrder_sourceInvestigationOrderId_fkey" FOREIGN KEY ("sourceInvestigationOrderId") REFERENCES "investigation_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrderItem" ADD CONSTRAINT "LaboratoryOrderItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrderItem" ADD CONSTRAINT "LaboratoryOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaboratoryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrderItem" ADD CONSTRAINT "LaboratoryOrderItem_testId_fkey" FOREIGN KEY ("testId") REFERENCES "TestCatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryOrderItem" ADD CONSTRAINT "LaboratoryOrderItem_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerType" ADD CONSTRAINT "ContainerType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTask" ADD CONSTRAINT "CollectionTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTask" ADD CONSTRAINT "CollectionTask_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTask" ADD CONSTRAINT "CollectionTask_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaboratoryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaboratoryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_containerTypeId_fkey" FOREIGN KEY ("containerTypeId") REFERENCES "ContainerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_recollectionOfId_fkey" FOREIGN KEY ("recollectionOfId") REFERENCES "Specimen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSpecimen" ADD CONSTRAINT "OrderItemSpecimen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSpecimen" ADD CONSTRAINT "OrderItemSpecimen_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "LaboratoryOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSpecimen" ADD CONSTRAINT "OrderItemSpecimen_specimenId_fkey" FOREIGN KEY ("specimenId") REFERENCES "Specimen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTaskSpecimen" ADD CONSTRAINT "CollectionTaskSpecimen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTaskSpecimen" ADD CONSTRAINT "CollectionTaskSpecimen_collectionTaskId_fkey" FOREIGN KEY ("collectionTaskId") REFERENCES "CollectionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTaskSpecimen" ADD CONSTRAINT "CollectionTaskSpecimen_specimenId_fkey" FOREIGN KEY ("specimenId") REFERENCES "Specimen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aliquot" ADD CONSTRAINT "Aliquot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aliquot" ADD CONSTRAINT "Aliquot_parentSpecimenId_fkey" FOREIGN KEY ("parentSpecimenId") REFERENCES "Specimen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manifest" ADD CONSTRAINT "Manifest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManifestSpecimen" ADD CONSTRAINT "ManifestSpecimen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManifestSpecimen" ADD CONSTRAINT "ManifestSpecimen_manifestId_fkey" FOREIGN KEY ("manifestId") REFERENCES "Manifest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManifestSpecimen" ADD CONSTRAINT "ManifestSpecimen_specimenId_fkey" FOREIGN KEY ("specimenId") REFERENCES "Specimen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "LaboratoryOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analyzer" ADD CONSTRAINT "Analyzer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analyzer" ADD CONSTRAINT "Analyzer_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentRun" ADD CONSTRAINT "InstrumentRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentRun" ADD CONSTRAINT "InstrumentRun_analyzerId_fkey" FOREIGN KEY ("analyzerId") REFERENCES "Analyzer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentRunItem" ADD CONSTRAINT "InstrumentRunItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentRunItem" ADD CONSTRAINT "InstrumentRunItem_instrumentRunId_fkey" FOREIGN KEY ("instrumentRunId") REFERENCES "InstrumentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "LaboratoryOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultRevision" ADD CONSTRAINT "ResultRevision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultRevision" ADD CONSTRAINT "ResultRevision_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaboratoryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersion" ADD CONSTRAINT "ReportVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersion" ADD CONSTRAINT "ReportVersion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersionItem" ADD CONSTRAINT "ReportVersionItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersionItem" ADD CONSTRAINT "ReportVersionItem_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES "ReportVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersionItem" ADD CONSTRAINT "ReportVersionItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "LaboratoryOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriticalNotification" ADD CONSTRAINT "CriticalNotification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcRun" ADD CONSTRAINT "QcRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nonconformance" ADD CONSTRAINT "Nonconformance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectivePreventiveAction" ADD CONSTRAINT "CorrectivePreventiveAction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectivePreventiveAction" ADD CONSTRAINT "CorrectivePreventiveAction_nonconformanceId_fkey" FOREIGN KEY ("nonconformanceId") REFERENCES "Nonconformance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityDocument" ADD CONSTRAINT "QualityDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityAudit" ADD CONSTRAINT "QualityAudit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAssessment" ADD CONSTRAINT "CompetencyAssessment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentMaintenance" ADD CONSTRAINT "EquipmentMaintenance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentMaintenance" ADD CONSTRAINT "EquipmentMaintenance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaboratoryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateLine" ADD CONSTRAINT "EstimateLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateLine" ADD CONSTRAINT "EstimateLine_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaboratoryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientOrganizationId_fkey" FOREIGN KEY ("clientOrganizationId") REFERENCES "ClientOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRate" ADD CONSTRAINT "ContractRate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractRate" ADD CONSTRAINT "ContractRate_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryChargeLine" ADD CONSTRAINT "LaboratoryChargeLine_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryChargeLine" ADD CONSTRAINT "LaboratoryChargeLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaboratoryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalBillingPosting" ADD CONSTRAINT "HospitalBillingPosting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalBillingPosting" ADD CONSTRAINT "HospitalBillingPosting_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaboratoryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationEvent" ADD CONSTRAINT "IntegrationEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationEvent" ADD CONSTRAINT "IntegrationEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationTemplate" ADD CONSTRAINT "CommunicationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationDelivery" ADD CONSTRAINT "CommunicationDelivery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationDelivery" ADD CONSTRAINT "CommunicationDelivery_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CommunicationTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthenticationAttempt" ADD CONSTRAINT "AuthenticationAttempt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthenticationAttempt" ADD CONSTRAINT "AuthenticationAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_sourceReportVersionId_fkey" FOREIGN KEY ("sourceReportVersionId") REFERENCES "ReportVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
