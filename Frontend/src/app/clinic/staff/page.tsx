"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { SectionHeading, Card, Avatar, Pill, Modal, Field, SectionSkeleton, TableSkeleton } from "@/components/ui";
import { staff as seedStaff, clinic } from "@/lib/mock-data";
import { ClinicLocation, StaffMember, StaffRole } from "@/lib/types";
import {
  ApiSyncSkippedError,
  createBackendClinicStaff,
  deleteBackendClinicStaff,
  getBackendBootstrap,
  updateBackendClinicStaff,
} from "@/lib/api-client";
import { useMode } from "@/lib/mode-context";

const roles: StaffRole[] = ["Receptionist", "Nurse", "Assistant", "Lab/Pharmacy User"];

const rolePermissions: Record<StaffRole, string[]> = {
  Receptionist: ["Appointments", "Queue", "Patient registration", "Billing"],
  Nurse: ["Vitals", "Queue handoff", "Patient preparation"],
  Assistant: ["Tasks", "Follow-ups", "Documents"],
  "Lab/Pharmacy User": ["Lab status", "Inventory", "Prescription handoff"],
};

const statusTone: Record<string, "brand" | "clay" | "alert"> = {
  Active: "brand",
  Invited: "clay",
  Suspended: "alert",
};

export default function StaffManagementPage() {
  const { selectedWorkplaceId } = useMode();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("Receptionist");
  const [locationId, setLocationId] = useState(clinic.locations[0].id);
  const [status, setStatus] = useState<StaffMember["status"]>("Invited");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    getBackendBootstrap()
      .then((data) => {
        if (cancelled) return;
        setStaff(data.staff);
        setLocations(data.locations);
        setLocationId(data.locations[0]?.id ?? clinic.locations[0].id);
      })
      .catch(() => {
        if (cancelled) return;
        setStaff(seedStaff);
        setLocations(clinic.locations);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingStaff(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoadingStaff) {
    return (
      <div>
        <SectionSkeleton />
        <TableSkeleton columns={5} rows={6} />
      </div>
    );
  }

  function resetForm() {
    setEditingStaffId(null);
    setName("");
    setRole("Receptionist");
    setLocationId(locations[0]?.id ?? clinic.locations[0].id);
    setStatus("Invited");
  }

  function openInviteForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(member: StaffMember) {
    setEditingStaffId(member.id);
    setName(member.name);
    setRole(member.role);
    setLocationId(member.locationId ?? locations[0]?.id ?? clinic.locations[0].id);
    setStatus(member.status);
    setShowForm(true);
  }

  function backendStatus(value: StaffMember["status"]) {
    if (value === "Active") return "ACTIVE";
    if (value === "Suspended") return "SUSPENDED";
    return "INVITED";
  }

  async function saveStaff() {
    if (!name.trim()) return;

    if (editingStaffId) {
      let updatedStaff: StaffMember = { id: editingStaffId, name, role, locationId, status };
      try {
        updatedStaff = {
          ...(await updateBackendClinicStaff(editingStaffId, {
            fullName: name,
            role,
            status: backendStatus(status),
          })),
          locationId,
          status,
        };
        setSyncMessage("Staff changes synced to backend.");
      } catch (error) {
        setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock staff updated locally." : "Backend sync failed; local staff update kept.");
      }
      setStaff((prev) => prev.map((member) => (member.id === editingStaffId ? updatedStaff : member)));
      resetForm();
      setShowForm(false);
      return;
    }

    let nextStaff: StaffMember = { id: `staff-${Date.now()}`, name, role, locationId, status: "Invited" };
    try {
      nextStaff = {
        ...(await createBackendClinicStaff({
          workplaceId: selectedWorkplaceId,
          fullName: name,
          role,
        })),
        locationId,
      };
      setSyncMessage("Staff invite synced to backend.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock staff invite saved locally." : "Backend sync failed; local staff invite kept.");
    }
    setStaff((prev) => [nextStaff, ...prev]);
    resetForm();
    setShowForm(false);
  }

  async function remove(id: string) {
    if (window.confirm("Remove this staff member and revoke clinic access?")) {
      try {
        await deleteBackendClinicStaff(id, selectedWorkplaceId);
        setSyncMessage("Staff access removed from backend.");
      } catch (error) {
        setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock staff removed locally." : "Backend delete failed; local staff removed.");
      }
      setStaff((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Clinic Operations · Staff Management"
        title="Staff Management"
        action={
          <button onClick={openInviteForm} className="btn-primary">
            <Plus size={14} /> Invite Staff
          </button>
        }
        description="Add receptionist, nurse, assistant and other roles with role-based access."
      />

      <Modal
        open={showForm}
        title={editingStaffId ? "Edit Staff Member" : "Invite Staff Member"}
        eyebrow="Staff Management"
        onClose={() => {
          resetForm();
          setShowForm(false);
        }}
        footer={
          <>
            <button onClick={saveStaff} className="btn-primary">
              {editingStaffId ? "Save Changes" : <><Plus size={14} /> Send Invite</>}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full Name" className="sm:col-span-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-field" />
          </Field>
          <Field label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className="input-field">
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          </Field>
          <Field label="Location">
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="input-field">
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          </Field>
          {editingStaffId && (
            <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as StaffMember["status"])} className="input-field">
              <option>Active</option>
              <option>Invited</option>
              <option>Suspended</option>
            </select>
            </Field>
          )}
        </div>
      </Modal>
      {syncMessage && <p className="mb-3 text-xs text-ink-muted">{syncMessage}</p>}

      <Card padded={false}>
        <table className="w-full table-clean">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Location</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => {
              const location = locations.find((l) => l.id === s.locationId);
              return (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")} size={28} />
                      {s.name}
                    </div>
                  </td>
                  <td>{s.role}</td>
                  <td>{location?.name}</td>
                  <td>
                    <Pill tone={statusTone[s.status]}>{s.status}</Pill>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditForm(s)} aria-label="Edit staff member">
                        <Pencil size={14} className="text-ink-faint hover:text-brand-600" />
                      </button>
                      <button onClick={() => remove(s.id)} aria-label="Remove staff member">
                        <Trash2 size={14} className="text-ink-faint hover:text-alert-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-6">
        <p className="eyebrow mb-3">Role Access</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {roles.map((item) => (
            <div key={item} className="rounded-md border border-line bg-paper px-3 py-2">
              <p className="text-sm font-semibold text-ink">{item}</p>
              <p className="mt-1 text-xs text-ink-muted">{rolePermissions[item].join(" - ")}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
