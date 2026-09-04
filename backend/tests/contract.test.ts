import fs from "node:fs";
import path from "node:path";
import { openApiDocument } from "../src/docs/openapi";

describe("backend contract completeness", () => {
  const routerPrefixes: Record<string, string> = {
    authRoutes: "/auth",
    adminRoutes: "/admin",
    userRoutes: "/users",
    patientRoutes: "/patients",
    encounterRoutes: "/encounters",
    clientRoutes: "/clients",
    practitionerRoutes: "/practitioners",
    catalogRoutes: "/catalog",
    orderRoutes: "/orders",
    collectionRoutes: "/collection",
    accessioningRoutes: "/accessioning",
    specimenRoutes: "/specimens",
    logisticsRoutes: "/logistics",
    workbenchRoutes: "/workbench",
    resultRoutes: "/results",
    reportRoutes: "/reports",
    qualityRoutes: "/quality",
    inventoryRoutes: "/inventory",
    billingRoutes: "/billing",
    communicationRoutes: "/communications",
    integrationRoutes: "/integrations",
    dashboardRoutes: "/dashboard",
    analyticsRoutes: "/analytics",
    queueRoutes: "/queues",
    schedulingRoutes: "/scheduling",
    supportRoutes: "/support",
    settingsRoutes: "/settings"
  };

  it("keeps every lab tenant-scoped Prisma model explicitly tenant-addressable", () => {
    const schema = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
    const models = [...schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)];
    const globalModels = new Set(["Tenant", "User", "Permission", "RolePermission"]);
    const hmsWorkplaceScopedModels = new Set([
      "appointments",
      "audit_events",
      "billing_invoices",
      "clinic_rooms",
      "clinic_service_doctors",
      "clinic_services",
      "conversation_participants",
      "conversations",
      "diagnoses",
      "doctor_content",
      "doctor_profiles",
      "doctor_shifts",
      "doctor_workplaces",
      "document_assets",
      "encounters",
      "follow_ups",
      "inventory_items",
      "investigation_orders",
      "messages",
      "notifications",
      "patient_allergies",
      "patient_conditions",
      "patient_medications",
      "patient_workplaces",
      "patients",
      "payment_txns",
      "prescription_medications",
      "prescriptions",
      "referrals",
      "report_values",
      "reports",
      "role_permissions",
      "staff_profiles",
      "staff_workplaces",
      "task_assignees",
      "tasks",
      "user_accounts",
      "vital_sets",
      "workplace_locations",
      "workplaces"
    ]);
    const missing = models
      .filter((match) => !globalModels.has(match[1]!) && !hmsWorkplaceScopedModels.has(match[1]!) && !/\btenantId\b/.test(match[2]!))
      .map((match) => match[1]);
    expect(missing).toEqual([]);
  });

  it("documents access requirements for every protected OpenAPI operation", () => {
    const methods = new Set(["get", "post", "put", "patch", "delete"]);
    const failures: string[] = [];
    for (const [route, item] of Object.entries(openApiDocument.paths)) {
      for (const [method, operation] of Object.entries(item)) {
        if (!methods.has(method) || typeof operation !== "object" || operation === null || !("security" in operation)) continue;
        const secured = operation as { security?: unknown; "x-required-roles"?: unknown };
        if (!Array.isArray(secured["x-required-roles"]) || secured["x-required-roles"].length === 0) failures.push(`${method.toUpperCase()} ${route}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("documents the shared workflow and every frontend module view", () => {
    const paths = openApiDocument.paths;
    for (const route of ["/orders", "/collection/tasks", "/collection/receiving", "/accessioning", "/workbench", "/results/validation", "/reports", "/queues/{type}", "/scheduling", "/logistics/send-outs", "/quality/capas", "/inventory/movements", "/billing/summary", "/communications/history", "/support", "/settings"]) expect(paths).toHaveProperty(route);
  });

  it("documents every implemented router endpoint", () => {
    const modulesDirectory = path.join(process.cwd(), "src", "modules");
    const routeFiles = fs.readdirSync(modulesDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(modulesDirectory, entry.name, "routes.ts"))
      .filter((file) => fs.existsSync(file));
    const failures: string[] = [];

    for (const file of routeFiles) {
      const source = fs.readFileSync(file, "utf8");
      const declarations = source.matchAll(/(\w+Routes)\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g);
      for (const match of declarations) {
        const [, routerName, method, localPath] = match;
        const prefix = routerPrefixes[routerName!];
        if (!prefix) {
          failures.push(`Unknown router ${routerName} in ${path.relative(process.cwd(), file)}`);
          continue;
        }
        const fullPath = `${prefix}${localPath === "/" ? "" : localPath}`.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
        if (!(openApiDocument.paths[fullPath] as Record<string, unknown> | undefined)?.[method!]) failures.push(`${method!.toUpperCase()} ${fullPath}`);
      }
    }

    expect(failures).toEqual([]);
  });
});
