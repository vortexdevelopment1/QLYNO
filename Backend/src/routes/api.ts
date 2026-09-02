import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import type { Prisma } from "../generated/prisma/client.js";
import { getPrisma } from "../lib/prisma.js";

const router = Router();

type Handler = (request: Request, response: Response, next: NextFunction) => Promise<void>;

function asyncHandler(handler: Handler) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}

function prismaOr503(response: Response) {
  const prisma = getPrisma();

  if (!prisma) {
    response.status(503).json({
      ok: false,
      error: "Database is not configured. Replace [YOUR-PASSWORD] in Backend/.env DATABASE_URL and DIRECT_URL, then run Prisma migration.",
    });
    return null;
  }

  return prisma;
}

function coerceDate(value: string | Date | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
}

function auditMetadata(request: Request) {
  return {
    ipAddress: request.ip,
    userAgent: request.get("user-agent") ?? null,
  };
}

async function ensureDemoData(prisma: NonNullable<ReturnType<typeof getPrisma>>) {
  const user = await prisma.userAccount.upsert({
    where: { email: "doctor.demo@qlyno.local" },
    update: {},
    create: {
      email: "doctor.demo@qlyno.local",
      phone: "+91 90000 00001",
    },
  });

  const doctor = await prisma.doctorProfile.upsert({
    where: { userAccountId: user.id },
    update: {},
    create: {
      userAccountId: user.id,
      fullName: "Dr. Ananya Rao",
      specialty: "Internal Medicine",
      qualifications: "MBBS, MD (Internal Medicine)",
      experienceYears: 9,
      consultationFee: 800,
      publicProfileSlug: "dr-ananya-rao",
    },
  });

  let workplace = await prisma.workplace.findFirst({
    where: { name: "Meridian Family Clinic", type: "CLINIC" },
    include: { locations: true },
  });

  if (!workplace) {
    workplace = await prisma.workplace.create({
      data: {
        name: "Meridian Family Clinic",
        type: "CLINIC",
        phone: "+91 90000 00002",
        email: "clinic.demo@qlyno.local",
        locations: {
          create: {
            name: "Meridian - MG Road",
            addressLine1: "14 MG Road",
            city: "Bengaluru",
            state: "Karnataka",
            postalCode: "560001",
            isPrimary: true,
          },
        },
      },
      include: { locations: true },
    });
  }

  await prisma.doctorWorkplace.upsert({
    where: { doctorId_workplaceId: { doctorId: doctor.id, workplaceId: workplace.id } },
    update: {},
    create: {
      doctorId: doctor.id,
      workplaceId: workplace.id,
      doctorRole: "Consulting Physician",
      department: "General Medicine",
      isPrimary: true,
    },
  });

  const patientSeeds = [
    {
      qlynoId: "QLYNO-DEMO-001",
      localMrn: "MRN-10231",
      fullName: "Meera Nair",
      gender: "FEMALE" as const,
      phone: "+91 98860 22110",
      bloodGroup: "B+",
      conditions: ["Type 2 diabetes mellitus", "Hypertension"],
    },
    {
      qlynoId: "QLYNO-DEMO-002",
      localMrn: "MRN-10232",
      fullName: "Kabir Malhotra",
      gender: "MALE" as const,
      phone: "+91 98860 22111",
      bloodGroup: "O+",
      conditions: ["Migraine"],
    },
  ];

  for (const seed of patientSeeds) {
    const patient = await prisma.patient.upsert({
      where: { qlynoId: seed.qlynoId },
      update: {
        primaryDoctorId: doctor.id,
      },
      create: {
        qlynoId: seed.qlynoId,
        fullName: seed.fullName,
        gender: seed.gender,
        phone: seed.phone,
        bloodGroup: seed.bloodGroup,
        primaryDoctorId: doctor.id,
        conditions: {
          create: seed.conditions.map((name) => ({ name })),
        },
      },
    });

    await prisma.patientWorkplace.upsert({
      where: { patientId_workplaceId: { patientId: patient.id, workplaceId: workplace.id } },
      update: {
        localMrn: seed.localMrn,
      },
      create: {
        patientId: patient.id,
        workplaceId: workplace.id,
        localMrn: seed.localMrn,
      },
    });
  }
}

const idParamSchema = z.object({ id: z.string().uuid() });
const contextQuerySchema = z.object({
  doctorId: z.string().uuid().optional(),
  workplaceId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const shiftSchema = z.object({
  doctorId: z.string().uuid(),
  workplaceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  shiftType: z.enum([
    "CLINIC_OPD",
    "HOSPITAL_DUTY",
    "WARD_ROUND",
    "ON_CALL",
    "ONLINE_CONSULTATION",
    "BLOCKED",
    "LEAVE",
  ]),
  bookingEnabled: z.boolean().default(true),
  slotMinutes: z.number().int().positive().default(20),
  bufferMinutes: z.number().int().min(0).default(0),
  bookingLimit: z.number().int().positive().optional(),
  recurrenceRule: z.string().optional(),
  note: z.string().optional(),
});

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  workplaceId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive().default(20),
  mode: z.enum(["IN_PERSON", "VIDEO", "HOME", "HOSPITAL"]).default("IN_PERSON"),
  reason: z.string().optional(),
});

const prescriptionMedicineSchema = z.object({
  medicineName: z.string().min(1),
  strength: z.string().optional(),
  form: z.string().optional(),
  dose: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  quantity: z.string().optional(),
  refillCount: z.number().int().min(0).default(0),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  workplaceId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  advice: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE"]).default("ACTIVE"),
  medicines: z.array(prescriptionMedicineSchema).min(1),
});

const orderSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  workplaceId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  type: z.enum(["LABORATORY", "RADIOLOGY", "EXTERNAL_REPORT"]),
  title: z.string().min(1),
  priority: z.enum(["LOW", "ROUTINE", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]).default("ROUTINE"),
  source: z.string().optional(),
  doctorNotes: z.string().optional(),
});

const encounterSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  workplaceId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  type: z.enum(["NEW_CONSULTATION", "FOLLOW_UP", "TELECONSULTATION", "PROCEDURE_REVIEW", "INPATIENT_ROUND", "EMERGENCY"]),
  chiefComplaint: z.string().optional(),
  history: z.string().optional(),
  examination: z.string().optional(),
  clinicalNotes: z.string().optional(),
  assessment: z.string().optional(),
  treatmentPlan: z.string().optional(),
  advice: z.string().optional(),
  followUpAdvice: z.string().optional(),
  vitals: z
    .object({
      systolicBp: z.number().int().optional(),
      diastolicBp: z.number().int().optional(),
      pulse: z.number().int().optional(),
      temperatureF: z.number().optional(),
      spo2: z.number().int().optional(),
      respiratoryRate: z.number().int().optional(),
      weightKg: z.number().optional(),
      heightCm: z.number().optional(),
      bmi: z.number().optional(),
      bloodGlucose: z.number().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  diagnoses: z
    .array(
      z.object({
        icdCode: z.string().optional(),
        description: z.string().min(1),
        type: z.enum(["PRIMARY", "SECONDARY", "PROVISIONAL", "CONFIRMED"]).default("PROVISIONAL"),
        status: z.enum(["ACTIVE", "RESOLVED", "CHRONIC", "RULED_OUT"]).default("ACTIVE"),
        notes: z.string().optional(),
      })
    )
    .default([]),
  prescription: prescriptionSchema.omit({ patientId: true, doctorId: true, workplaceId: true, encounterId: true }).optional(),
  orders: z.array(orderSchema.omit({ patientId: true, doctorId: true, workplaceId: true, encounterId: true })).default([]),
  followUp: z
    .object({
      dueAt: z.string().datetime().optional(),
      reason: z.string().min(1),
      owner: z.string().default("Doctor"),
    })
    .optional(),
});

const serviceSchema = z.object({
  workplaceId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  durationMinutes: z.number().int().positive().default(20),
  price: z.number().nonnegative().optional(),
  eligibleDoctorIds: z.array(z.string().uuid()).default([]),
});

const serviceUpdateSchema = serviceSchema
  .omit({ workplaceId: true })
  .partial()
  .extend({
    eligibleDoctorIds: z.array(z.string().uuid()).optional(),
  });

const diagnosisSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  icdCode: z.string().optional(),
  description: z.string().min(1),
  type: z.enum(["PRIMARY", "SECONDARY", "PROVISIONAL", "CONFIRMED"]).default("PROVISIONAL"),
  status: z.enum(["ACTIVE", "RESOLVED", "CHRONIC", "RULED_OUT"]).default("ACTIVE"),
  notes: z.string().optional(),
});

const followUpSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  workplaceId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  dueAt: z.string().datetime().optional(),
  reason: z.string().min(1),
  owner: z.string().default("Doctor"),
});

const vitalSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  systolicBp: z.number().int().optional(),
  diastolicBp: z.number().int().optional(),
  pulse: z.number().int().optional(),
  temperatureF: z.number().optional(),
  spo2: z.number().int().optional(),
  respiratoryRate: z.number().int().optional(),
  weightKg: z.number().optional(),
  heightCm: z.number().optional(),
  bmi: z.number().optional(),
  bloodGlucose: z.number().optional(),
  notes: z.string().optional(),
});

const doctorProfileSchema = z.object({
  workplaceId: z.string().uuid().optional(),
  fullName: z.string().min(1),
  specialty: z.string().min(1),
  qualifications: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  email: z.string().email().optional(),
});

const doctorProfileUpdateSchema = doctorProfileSchema.omit({ workplaceId: true, email: true }).partial();

const locationSchema = z.object({
  workplaceId: z.string().uuid(),
  name: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().default(""),
  state: z.string().optional(),
  country: z.string().default("India"),
  postalCode: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const locationUpdateSchema = locationSchema.omit({ workplaceId: true }).partial();

const staffSchema = z.object({
  workplaceId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  fullName: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email().optional(),
});

const staffUpdateSchema = staffSchema.omit({ workplaceId: true, locationId: true, email: true }).partial().extend({
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "ARCHIVED"]).optional(),
});

const messageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  workplaceId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  title: z.string().optional(),
  body: z.string().min(1),
  senderUserId: z.string().uuid().optional(),
});

const persistedStateSchema = z.object({
  scope: z.string().min(1),
  entityId: z.string().min(1),
  value: z.unknown(),
});

const roomSchema = z.object({
  workplaceId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  name: z.string().min(1),
  roomType: z.string().default("Consultation"),
  notes: z.string().optional(),
});

const inventorySchema = z.object({
  workplaceId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().min(1),
  sku: z.string().optional(),
  stockOnHand: z.number().int().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(0),
  unit: z.string().optional(),
  expiryDate: z.string().optional(),
  supplier: z.string().optional(),
});

const invoiceSchema = z.object({
  patientId: z.string().uuid(),
  workplaceId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  invoiceNumber: z.string().min(1),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  notes: z.string().optional(),
});

router.get(
  "/bootstrap",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const query = contextQuerySchema.parse(request.query);
    const shouldEnsureDemo = request.query.ensureDemo === "true";

    if (shouldEnsureDemo) {
      await ensureDemoData(prisma);
    }

    const [doctors, workplaces, patients, appointments, shifts, services, rooms, tasks, notifications, diagnoses, prescriptions, orders, followUps, vitals, staff] =
      await Promise.all([
        prisma.doctorProfile.findMany({
          where: {
            workplaces: {
              some: {
                workplaceId: query.workplaceId,
                status: { not: "ARCHIVED" },
              },
            },
          },
          include: { workplaces: { include: { workplace: true } } },
        }),
        prisma.workplace.findMany({ include: { locations: true } }),
        prisma.patient.findMany({
          where: query.doctorId ? { primaryDoctorId: query.doctorId } : undefined,
          include: { workplaces: true, allergies: true, conditions: true, medications: true },
          take: 100,
        }),
        prisma.appointment.findMany({
          where: {
            doctorId: query.doctorId,
            workplaceId: query.workplaceId,
            scheduledAt: {
              gte: coerceDate(query.from),
              lte: coerceDate(query.to),
            },
          },
          include: { patient: true, location: true, room: true },
          orderBy: { scheduledAt: "asc" },
        }),
        prisma.doctorShift.findMany({
          where: {
            doctorId: query.doctorId,
            workplaceId: query.workplaceId,
            startsAt: {
              gte: coerceDate(query.from),
              lte: coerceDate(query.to),
            },
          },
          orderBy: { startsAt: "asc" },
        }),
        prisma.clinicService.findMany({ where: { workplaceId: query.workplaceId }, include: { eligibleDoctors: true } }),
        prisma.clinicRoom.findMany({ where: { workplaceId: query.workplaceId } }),
        prisma.task.findMany({ where: { workplaceId: query.workplaceId, status: { not: "COMPLETED" } }, orderBy: { dueAt: "asc" } }),
        prisma.notification.findMany({ where: { workplaceId: query.workplaceId, readAt: null }, orderBy: { createdAt: "desc" } }),
        prisma.diagnosis.findMany({ orderBy: { diagnosedAt: "desc" }, take: 200 }),
        prisma.prescription.findMany({
          where: { doctorId: query.doctorId, workplaceId: query.workplaceId },
          include: { medicines: true },
          orderBy: { createdAt: "desc" },
          take: 200,
        }),
        prisma.investigationOrder.findMany({
          where: { doctorId: query.doctorId, workplaceId: query.workplaceId },
          orderBy: { orderedAt: "desc" },
          take: 200,
        }),
        prisma.followUp.findMany({
          where: { doctorId: query.doctorId, workplaceId: query.workplaceId },
          orderBy: { dueAt: "asc" },
          take: 200,
        }),
        prisma.vitalSet.findMany({ orderBy: { recordedAt: "desc" }, take: 200 }),
        prisma.staffProfile.findMany({
          where: {
            status: { not: "ARCHIVED" },
            memberships: query.workplaceId ? { some: { workplaceId: query.workplaceId, status: { not: "ARCHIVED" } } } : undefined,
          },
          include: { memberships: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);

    response.json({ ok: true, data: { doctors, workplaces, patients, appointments, shifts, services, rooms, tasks, notifications, diagnoses, prescriptions, orders, followUps, vitals, staff } });
  })
);

router.get(
  "/patients/:id/timeline",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const [patient, appointments, encounters, vitals, diagnoses, prescriptions, orders, followUps, documents] =
      await Promise.all([
        prisma.patient.findUnique({ where: { id }, include: { allergies: true, conditions: true, medications: true, workplaces: true } }),
        prisma.appointment.findMany({ where: { patientId: id }, orderBy: { scheduledAt: "desc" } }),
        prisma.encounter.findMany({ where: { patientId: id }, orderBy: { createdAt: "desc" } }),
        prisma.vitalSet.findMany({ where: { patientId: id }, orderBy: { recordedAt: "desc" } }),
        prisma.diagnosis.findMany({ where: { patientId: id }, orderBy: { diagnosedAt: "desc" } }),
        prisma.prescription.findMany({ where: { patientId: id }, include: { medicines: true }, orderBy: { createdAt: "desc" } }),
        prisma.investigationOrder.findMany({ where: { patientId: id }, include: { report: true }, orderBy: { orderedAt: "desc" } }),
        prisma.followUp.findMany({ where: { patientId: id }, orderBy: { dueAt: "desc" } }),
        prisma.documentAsset.findMany({ where: { patientId: id }, orderBy: { uploadedAt: "desc" } }),
      ]);

    if (!patient) {
      response.status(404).json({ ok: false, error: "Patient not found" });
      return;
    }

    response.json({ ok: true, data: { patient, appointments, encounters, vitals, diagnoses, prescriptions, orders, followUps, documents } });
  })
);

router.post(
  "/patients",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = z
      .object({
        qlynoId: z.string().min(1),
        fullName: z.string().min(1),
        gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]).default("UNKNOWN"),
        dateOfBirth: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        bloodGroup: z.string().optional(),
        primaryDoctorId: z.string().uuid().optional(),
        workplaceId: z.string().uuid().optional(),
        localMrn: z.string().optional(),
      })
      .parse(request.body);

    const patient = await prisma.patient.create({
      data: {
        qlynoId: body.qlynoId,
        fullName: body.fullName,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        phone: body.phone,
        email: body.email,
        bloodGroup: body.bloodGroup,
        primaryDoctorId: body.primaryDoctorId,
        workplaces: body.workplaceId
          ? { create: { workplaceId: body.workplaceId, localMrn: body.localMrn } }
          : undefined,
      },
    });

    response.status(201).json({ ok: true, data: patient });
  })
);

router.patch(
  "/patients/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const body = z
      .object({
        fullName: z.string().min(1).optional(),
        gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]).optional(),
        dateOfBirth: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        bloodGroup: z.string().optional(),
        primaryDoctorId: z.string().uuid().nullable().optional(),
      })
      .parse(request.body);

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...body,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      },
      include: { workplaces: true, allergies: true, conditions: true },
    });

    response.json({ ok: true, data: patient });
  })
);

router.delete(
  "/patients/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    await prisma.patient.delete({ where: { id } });
    response.json({ ok: true });
  })
);

router.get(
  "/shifts",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const query = contextQuerySchema.parse(request.query);
    const shifts = await prisma.doctorShift.findMany({
      where: {
        doctorId: query.doctorId,
        workplaceId: query.workplaceId,
        startsAt: { gte: coerceDate(query.from), lte: coerceDate(query.to) },
      },
      include: { workplace: true },
      orderBy: { startsAt: "asc" },
    });

    response.json({ ok: true, data: shifts });
  })
);

router.post(
  "/shifts",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = shiftSchema.parse(request.body);
    const overlaps = await prisma.doctorShift.findMany({
      where: {
        doctorId: body.doctorId,
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        startsAt: { lt: new Date(body.endsAt) },
        endsAt: { gt: new Date(body.startsAt) },
      },
    });

    if (overlaps.length > 0) {
      response.status(409).json({ ok: false, error: "Shift overlaps with existing availability", conflicts: overlaps });
      return;
    }

    const shift = await prisma.doctorShift.create({
      data: { ...body, startsAt: new Date(body.startsAt), endsAt: new Date(body.endsAt) },
    });

    response.status(201).json({ ok: true, data: shift });
  })
);

router.patch(
  "/shifts/:id/status",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const { status, actorUserId } = z
      .object({
        status: z.enum(["DRAFT", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]),
        actorUserId: z.string().uuid().optional(),
      })
      .parse(request.body);

    const shift = await prisma.doctorShift.update({ where: { id }, data: { status } });
    await prisma.auditEvent.create({
      data: {
        actorUserId,
        action: "SHIFT_STATUS_UPDATED",
        entityType: "DoctorShift",
        entityId: id,
        metadata: { status },
        ...auditMetadata(request),
      },
    });

    response.json({ ok: true, data: shift });
  })
);

router.post(
  "/appointments",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = appointmentSchema.parse(request.body);
    const appointment = await prisma.appointment.create({
      data: { ...body, scheduledAt: new Date(body.scheduledAt), status: "SCHEDULED" },
    });

    response.status(201).json({ ok: true, data: appointment });
  })
);

router.patch(
  "/appointments/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const body = appointmentSchema.partial().parse(request.body);
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      },
    });

    response.json({ ok: true, data: appointment });
  })
);

router.delete(
  "/appointments/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    await prisma.appointment.delete({ where: { id } });
    response.json({ ok: true });
  })
);

router.patch(
  "/appointments/:id/status",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const { status } = z
      .object({
        status: z.enum([
          "SCHEDULED",
          "CONFIRMED",
          "CHECKED_IN",
          "WAITING",
          "IN_CONSULTATION",
          "COMPLETED",
          "LATE",
          "CANCELLED",
          "NO_SHOW",
          "RESCHEDULED",
        ]),
      })
      .parse(request.body);

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        checkedInAt: status === "CHECKED_IN" ? new Date() : undefined,
        startedAt: status === "IN_CONSULTATION" ? new Date() : undefined,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
      },
    });

    response.json({ ok: true, data: appointment });
  })
);

router.post(
  "/encounters",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = encounterSchema.parse(request.body);

    const result = await prisma.$transaction(async (tx) => {
      const encounter = await tx.encounter.create({
        data: {
          patientId: body.patientId,
          doctorId: body.doctorId,
          workplaceId: body.workplaceId,
          appointmentId: body.appointmentId,
          type: body.type,
          status: "CONSULTATION_COMPLETED",
          chiefComplaint: body.chiefComplaint,
          history: body.history,
          examination: body.examination,
          clinicalNotes: body.clinicalNotes,
          assessment: body.assessment,
          treatmentPlan: body.treatmentPlan,
          advice: body.advice,
          followUpAdvice: body.followUpAdvice,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      if (body.appointmentId) {
        await tx.appointment.update({
          where: { id: body.appointmentId },
          data: { status: "COMPLETED", startedAt: new Date(), completedAt: new Date() },
        });
      }

      const vitals = body.vitals
        ? await tx.vitalSet.create({
            data: { ...body.vitals, patientId: body.patientId, encounterId: encounter.id },
          })
        : null;

      const diagnoses =
        body.diagnoses.length > 0
          ? await tx.diagnosis.createManyAndReturn({
              data: body.diagnoses.map((diagnosis) => ({
                ...diagnosis,
                patientId: body.patientId,
                encounterId: encounter.id,
              })),
            })
          : [];

      const prescription = body.prescription
        ? await tx.prescription.create({
            data: {
              patientId: body.patientId,
              doctorId: body.doctorId,
              workplaceId: body.workplaceId,
              encounterId: encounter.id,
              advice: body.prescription.advice,
              status: body.prescription.status,
              issuedAt: body.prescription.status === "ACTIVE" ? new Date() : undefined,
              medicines: {
                create: body.prescription.medicines.map((medicine, sortOrder) => ({
                  ...medicine,
                  sortOrder,
                })),
              },
            },
            include: { medicines: true },
          })
        : null;

      const orders =
        body.orders.length > 0
          ? await tx.investigationOrder.createManyAndReturn({
              data: body.orders.map((order) => ({
                ...order,
                patientId: body.patientId,
                doctorId: body.doctorId,
                workplaceId: body.workplaceId,
                encounterId: encounter.id,
                status: "ORDERED",
              })),
            })
          : [];

      const followUp = body.followUp
        ? await tx.followUp.create({
            data: {
              patientId: body.patientId,
              doctorId: body.doctorId,
              workplaceId: body.workplaceId,
              encounterId: encounter.id,
              dueAt: coerceDate(body.followUp.dueAt),
              reason: body.followUp.reason,
              owner: body.followUp.owner,
            },
          })
        : null;

      await tx.auditEvent.create({
        data: {
          action: "ENCOUNTER_COMPLETED",
          entityType: "Encounter",
          entityId: encounter.id,
          metadata: {
            appointmentId: body.appointmentId ?? null,
            diagnosisCount: diagnoses.length,
            orderCount: orders.length,
            prescriptionIssued: Boolean(prescription),
            followUpCreated: Boolean(followUp),
          },
          ...auditMetadata(request),
        },
      });

      return { encounter, vitals, diagnoses, prescription, orders, followUp };
    });

    response.status(201).json({ ok: true, data: result });
  })
);

router.post(
  "/prescriptions",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = prescriptionSchema.parse(request.body);
    const prescription = await prisma.prescription.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        workplaceId: body.workplaceId,
        encounterId: body.encounterId,
        advice: body.advice,
        status: body.status,
        issuedAt: body.status === "ACTIVE" ? new Date() : undefined,
        medicines: {
          create: body.medicines.map((medicine, sortOrder) => ({ ...medicine, sortOrder })),
        },
      },
      include: { medicines: true },
    });

    response.status(201).json({ ok: true, data: prescription });
  })
);

router.post(
  "/orders",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = orderSchema.parse(request.body);
    const order = await prisma.investigationOrder.create({ data: { ...body, status: "ORDERED" } });
    response.status(201).json({ ok: true, data: order });
  })
);

router.patch(
  "/orders/:id/status",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const { status } = z
      .object({
        status: z.enum(["PENDING", "ORDERED", "SAMPLE_COLLECTED", "IN_PROGRESS", "SCHEDULED", "RESULT_READY", "CRITICAL", "REVIEWED", "CANCELLED"]),
      })
      .parse(request.body);

    const order = await prisma.investigationOrder.update({
      where: { id },
      data: { status, reviewedAt: status === "REVIEWED" ? new Date() : undefined },
    });

    response.json({ ok: true, data: order });
  })
);

router.post(
  "/diagnoses",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = diagnosisSchema.parse(request.body);
    const diagnosis = await prisma.diagnosis.create({ data: body });
    response.status(201).json({ ok: true, data: diagnosis });
  })
);

router.post(
  "/follow-ups",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = followUpSchema.parse(request.body);
    const followUp = await prisma.followUp.create({
      data: { ...body, dueAt: body.dueAt ? new Date(body.dueAt) : undefined },
    });
    response.status(201).json({ ok: true, data: followUp });
  })
);

router.patch(
  "/follow-ups/:id/status",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const { status } = z
      .object({
        status: z.enum(["UPCOMING", "DUE_TODAY", "OVERDUE", "COMPLETED", "CANCELLED"]),
      })
      .parse(request.body);
    const followUp = await prisma.followUp.update({
      where: { id },
      data: { status, completedAt: status === "COMPLETED" ? new Date() : undefined },
    });
    response.json({ ok: true, data: followUp });
  })
);

router.post(
  "/vitals",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = vitalSchema.parse(request.body);
    const vitals = await prisma.vitalSet.create({ data: body });
    response.status(201).json({ ok: true, data: vitals });
  })
);

router.get(
  "/clinic/services",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { workplaceId } = contextQuerySchema.pick({ workplaceId: true }).parse(request.query);
    const services = await prisma.clinicService.findMany({
      where: { workplaceId },
      include: { eligibleDoctors: { include: { doctor: true } } },
      orderBy: { name: "asc" },
    });

    response.json({ ok: true, data: services });
  })
);

router.post(
  "/clinic/services",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = serviceSchema.parse(request.body);
    const service = await prisma.clinicService.create({
      data: {
        workplaceId: body.workplaceId,
        name: body.name,
        description: body.description,
        durationMinutes: body.durationMinutes,
        price: body.price,
        eligibleDoctors: { create: body.eligibleDoctorIds.map((doctorId) => ({ doctorId })) },
      },
      include: { eligibleDoctors: true },
    });

    response.status(201).json({ ok: true, data: service });
  })
);

router.patch(
  "/clinic/services/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const body = serviceUpdateSchema.parse(request.body);

    const service = await prisma.clinicService.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        durationMinutes: body.durationMinutes,
        price: body.price,
        eligibleDoctors: body.eligibleDoctorIds
          ? {
              deleteMany: {},
              create: body.eligibleDoctorIds.map((doctorId) => ({ doctorId })),
            }
          : undefined,
      },
      include: { eligibleDoctors: true },
    });

    response.json({ ok: true, data: service });
  })
);

router.delete(
  "/clinic/services/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    await prisma.clinicService.delete({ where: { id } });
    response.json({ ok: true });
  })
);

router.post(
  "/clinic/locations",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = locationSchema.parse(request.body);
    const location = await prisma.workplaceLocation.create({ data: body });
    response.status(201).json({ ok: true, data: location });
  })
);

router.patch(
  "/clinic/locations/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const body = locationUpdateSchema.parse(request.body);
    const location = await prisma.workplaceLocation.update({ where: { id }, data: body });
    response.json({ ok: true, data: location });
  })
);

router.delete(
  "/clinic/locations/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    await prisma.workplaceLocation.delete({ where: { id } });
    response.json({ ok: true });
  })
);

router.post(
  "/clinic/doctors",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = doctorProfileSchema.parse(request.body);
    const user = await prisma.userAccount.create({
      data: {
        email: body.email ?? `doctor-${Date.now()}@qlyno.local`,
      },
    });
    const doctor = await prisma.doctorProfile.create({
      data: {
        userAccountId: user.id,
        fullName: body.fullName,
        specialty: body.specialty,
        qualifications: body.qualifications,
        experienceYears: body.experienceYears,
        workplaces: body.workplaceId
          ? {
              create: {
                workplaceId: body.workplaceId,
                doctorRole: "Consulting Physician",
                status: "INVITED",
              },
            }
          : undefined,
      },
    });
    response.status(201).json({ ok: true, data: doctor });
  })
);

router.patch(
  "/clinic/doctors/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const body = doctorProfileUpdateSchema.parse(request.body);
    const doctor = await prisma.doctorProfile.update({ where: { id }, data: body });
    response.json({ ok: true, data: doctor });
  })
);

router.delete(
  "/clinic/doctors/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const { workplaceId } = contextQuerySchema.pick({ workplaceId: true }).parse(request.query);

    if (workplaceId) {
      await prisma.doctorWorkplace.updateMany({
        where: { doctorId: id, workplaceId },
        data: { status: "ARCHIVED" },
      });
    } else {
      await prisma.doctorWorkplace.updateMany({ where: { doctorId: id }, data: { status: "ARCHIVED" } });
    }

    response.json({ ok: true });
  })
);

router.post(
  "/clinic/staff",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = staffSchema.parse(request.body);
    const user = body.email
      ? await prisma.userAccount.create({ data: { email: body.email } })
      : null;
    const staff = await prisma.staffProfile.create({
      data: {
        userAccountId: user?.id,
        fullName: body.fullName,
        role: body.role,
        status: "INVITED",
        memberships: {
          create: {
            workplaceId: body.workplaceId,
            role: body.role,
          },
        },
      },
      include: { memberships: true },
    });
    response.status(201).json({ ok: true, data: staff });
  })
);

router.patch(
  "/clinic/staff/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const body = staffUpdateSchema.parse(request.body);
    const staff = await prisma.staffProfile.update({
      where: { id },
      data: {
        fullName: body.fullName,
        role: body.role,
        status: body.status,
        memberships: body.role
          ? {
              updateMany: {
                where: {},
                data: { role: body.role },
              },
            }
          : undefined,
      },
      include: { memberships: true },
    });
    response.json({ ok: true, data: staff });
  })
);

router.delete(
  "/clinic/staff/:id",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const { workplaceId } = contextQuerySchema.pick({ workplaceId: true }).parse(request.query);

    await prisma.staffProfile.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        memberships: {
          updateMany: {
            where: workplaceId ? { workplaceId } : {},
            data: { status: "ARCHIVED" },
          },
        },
      },
    });

    response.json({ ok: true });
  })
);

router.post(
  "/clinic/rooms",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = roomSchema.parse(request.body);
    const room = await prisma.clinicRoom.create({ data: body });
    response.status(201).json({ ok: true, data: room });
  })
);

router.post(
  "/clinic/inventory",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = inventorySchema.parse(request.body);
    const item = await prisma.inventoryItem.create({
      data: { ...body, expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined },
    });
    response.status(201).json({ ok: true, data: item });
  })
);

router.post(
  "/billing/invoices",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = invoiceSchema.parse(request.body);
    const invoice = await prisma.billingInvoice.create({ data: body });
    response.status(201).json({ ok: true, data: invoice });
  })
);

router.patch(
  "/tasks/:id/status",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const { status } = z.object({ status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]) }).parse(request.body);
    const task = await prisma.task.update({
      where: { id },
      data: { status, completedAt: status === "COMPLETED" ? new Date() : undefined },
    });

    response.json({ ok: true, data: task });
  })
);

router.patch(
  "/notifications/:id/read",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { id } = idParamSchema.parse(request.params);
    const notification = await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
    response.json({ ok: true, data: notification });
  })
);

router.get(
  "/conversations",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { workplaceId } = contextQuerySchema.pick({ workplaceId: true }).parse(request.query);
    const conversations = await prisma.conversation.findMany({
      where: { workplaceId },
      include: {
        participants: true,
        messages: { orderBy: { sentAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    response.json({ ok: true, data: conversations });
  })
);

router.post(
  "/conversations/messages",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = messageSchema.parse(request.body);
    const conversationId =
      body.conversationId ??
      (
        await prisma.conversation.create({
          data: {
            type: body.patientId ? "PATIENT" : "CLINIC_STAFF",
            workplaceId: body.workplaceId,
            patientId: body.patientId,
            title: body.title ?? "Conversation",
            participants: {
              create: [
                { displayName: "Doctor", participantType: "Doctor", userAccountId: body.senderUserId },
                { displayName: body.title ?? "Recipient", participantType: body.patientId ? "Patient" : "Staff" },
              ],
            },
          },
        })
      ).id;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderUserId: body.senderUserId,
        body: body.body,
      },
    });
    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

    response.status(201).json({ ok: true, data: { conversationId, message } });
  })
);

router.post(
  "/state",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const body = persistedStateSchema.parse(request.body);
    const state = await prisma.auditEvent.create({
      data: {
        action: `STATE_${body.scope}`,
        entityType: "PersistedUiState",
        entityId: body.entityId,
        metadata: { value: body.value } as Prisma.InputJsonObject,
        ...auditMetadata(request),
      },
    });

    response.status(201).json({ ok: true, data: state });
  })
);

router.get(
  "/state/:scope/:entityId",
  asyncHandler(async (request, response) => {
    const prisma = prismaOr503(response);
    if (!prisma) return;

    const { scope, entityId } = z.object({ scope: z.string().min(1), entityId: z.string().min(1) }).parse(request.params);
    const state = await prisma.auditEvent.findFirst({
      where: {
        action: `STATE_${scope}`,
        entityType: "PersistedUiState",
        entityId,
      },
      orderBy: { createdAt: "desc" },
    });

    response.json({ ok: true, data: state?.metadata ?? null });
  })
);

router.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof z.ZodError) {
    response.status(400).json({ ok: false, error: "Validation failed", details: error.flatten() });
    return;
  }

  console.error(error);
  response.status(500).json({ ok: false, error: "Internal server error" });
});

export default router;
