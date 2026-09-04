-- This migration is 100% additive.
-- It does NOT drop, rename, or alter any existing table or column from
-- either the Lab Portal schema or the HMS ("fri"/Supabase) schema.
-- It only adds new nullable foreign-key columns + FK constraints + indexes
-- so the two systems can share ONE patient identity end-to-end:
--
--   patients (HMS, one row per real human, qlynoId is the platform ID)
--        |  1-to-many
--        v
--   "Patient" (Lab, one row per lab TENANT the person has ever used —
--              a private lab and a hospital-internal lab each get their
--              own tenant-scoped Patient row, all pointing back to the
--              same patients.id)
--
--   investigation_orders (HMS, doctor prescribes a lab test)
--        |  1-to-1 (optional)
--        v
--   "LaboratoryOrder" (Lab, the actual order at whichever lab tenant
--                       was selected — private or hospital-internal)
--
--   "ReportVersion" (Lab, the authoritative released result)
--        |  1-to-1 (optional)
--        v
--   reports (HMS, the doctor-facing summary synced from that version)

-- 1) Patient (lab) -> patients (HMS): shared platform patient identity
ALTER TABLE "Patient" ADD COLUMN "platformPatientId" UUID;

CREATE INDEX "Patient_platformPatientId_idx" ON "Patient"("platformPatientId");

ALTER TABLE "Patient"
  ADD CONSTRAINT "Patient_platformPatientId_fkey"
  FOREIGN KEY ("platformPatientId") REFERENCES "patients"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 2) LaboratoryOrder (lab) -> investigation_orders (HMS): one lab order per
--    doctor-prescribed investigation
ALTER TABLE "LaboratoryOrder" ADD COLUMN "sourceInvestigationOrderId" UUID;

CREATE UNIQUE INDEX "LaboratoryOrder_sourceInvestigationOrderId_key"
  ON "LaboratoryOrder"("sourceInvestigationOrderId");

ALTER TABLE "LaboratoryOrder"
  ADD CONSTRAINT "LaboratoryOrder_sourceInvestigationOrderId_fkey"
  FOREIGN KEY ("sourceInvestigationOrderId") REFERENCES "investigation_orders"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3) reports (HMS) -> ReportVersion (lab): doctor-facing report synced from
--    the exact released lab version
ALTER TABLE "reports" ADD COLUMN "sourceReportVersionId" TEXT;

CREATE UNIQUE INDEX "reports_sourceReportVersionId_key"
  ON "reports"("sourceReportVersionId");

ALTER TABLE "reports"
  ADD CONSTRAINT "reports_sourceReportVersionId_fkey"
  FOREIGN KEY ("sourceReportVersionId") REFERENCES "ReportVersion"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
