"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { SectionHeading, Card, Avatar, AvailabilityDot, Pill, Modal, Field, CardGridSkeleton, SectionSkeleton } from "@/components/ui";
import { doctors as seedDoctors, clinic } from "@/lib/mock-data";
import { ClinicLocation, Doctor } from "@/lib/types";
import {
  ApiSyncSkippedError,
  createBackendClinicDoctor,
  deleteBackendClinicDoctor,
  getBackendBootstrap,
  updateBackendClinicDoctor,
} from "@/lib/api-client";
import { useMode } from "@/lib/mode-context";

export default function DoctorManagementPage() {
  const { selectedWorkplaceId } = useMode();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    qualifications: "",
    experienceYears: "",
    locationId: clinic.locations[0].id,
  });

  useEffect(() => {
    let cancelled = false;

    getBackendBootstrap()
      .then((data) => {
        if (cancelled) return;
        setDoctors(data.doctors);
        setLocations(data.locations);
        setForm((prev) => ({ ...prev, locationId: data.locations[0]?.id ?? prev.locationId }));
      })
      .catch(() => {
        if (cancelled) return;
        setDoctors(seedDoctors);
        setLocations(clinic.locations);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDoctors(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoadingDoctors) {
    return (
      <div>
        <SectionSkeleton />
        <CardGridSkeleton cards={6} />
      </div>
    );
  }

  function resetForm() {
    setEditingDoctorId(null);
    setForm({
      name: "",
      specialty: "",
      qualifications: "",
      experienceYears: "",
      locationId: locations[0]?.id ?? clinic.locations[0].id,
    });
  }

  function openInviteForm() {
    resetForm();
    setShowInvite(true);
  }

  function openEditForm(doctor: Doctor) {
    setEditingDoctorId(doctor.id);
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      experienceYears: String(doctor.experienceYears),
      locationId: doctor.locationId ?? locations[0]?.id ?? clinic.locations[0].id,
    });
    setShowInvite(true);
  }

  async function remove(id: string) {
    if (window.confirm("Remove this doctor from the clinic roster?")) {
      try {
        await deleteBackendClinicDoctor(id, selectedWorkplaceId);
        setSyncMessage("Doctor removed from backend clinic roster.");
      } catch (error) {
        setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock doctor removed locally." : "Backend delete failed; local doctor removed.");
      }
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    }
  }

  async function saveDoctor() {
    if (!form.name.trim() || !form.specialty.trim()) return;
    const initials = form.name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    if (editingDoctorId) {
      const existing = doctors.find((doctor) => doctor.id === editingDoctorId);
      let updatedDoctor: Doctor = {
        id: editingDoctorId,
        name: form.name,
        specialty: form.specialty,
        qualifications: form.qualifications || "Verification pending",
        experienceYears: Number(form.experienceYears) || 0,
        avatarInitials: initials || "DR",
        availability: existing?.availability ?? "Off",
        locationId: form.locationId,
        rating: existing?.rating ?? 0,
        patientsCount: existing?.patientsCount ?? 0,
      };
      try {
        updatedDoctor = {
          ...(await updateBackendClinicDoctor(editingDoctorId, {
            fullName: form.name,
            specialty: form.specialty,
            qualifications: form.qualifications || undefined,
            experienceYears: Number(form.experienceYears) || 0,
          })),
          availability: existing?.availability ?? "Off",
          locationId: form.locationId,
          rating: existing?.rating ?? 0,
          patientsCount: existing?.patientsCount ?? 0,
        };
        setSyncMessage("Doctor profile changes synced to backend.");
      } catch (error) {
        setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock doctor updated locally." : "Backend sync failed; local doctor update kept.");
      }
      setDoctors((prev) => prev.map((doctor) => (doctor.id === editingDoctorId ? updatedDoctor : doctor)));
      resetForm();
      setShowInvite(false);
      return;
    }

    let nextDoctor: Doctor = {
      id: `local-doc-${Date.now()}`,
      name: form.name,
      specialty: form.specialty,
      qualifications: form.qualifications || "Verification pending",
      experienceYears: Number(form.experienceYears) || 0,
      avatarInitials: initials || "DR",
      availability: "Off",
      locationId: form.locationId,
      rating: 0,
      patientsCount: 0,
    };
    try {
      nextDoctor = {
        ...(await createBackendClinicDoctor({
          workplaceId: selectedWorkplaceId,
          fullName: form.name,
          specialty: form.specialty,
          qualifications: form.qualifications || undefined,
          experienceYears: Number(form.experienceYears) || 0,
        })),
        locationId: form.locationId,
        rating: 0,
        patientsCount: 0,
      };
      setSyncMessage("Doctor invite synced to backend.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock doctor invite saved locally." : "Backend sync failed; local doctor invite kept.");
    }
    setDoctors((prev) => [nextDoctor, ...prev]);
    resetForm();
    setShowInvite(false);
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Clinic Operations · Doctor Management"
        title="Doctor Management"
        description="Add or remove doctors, verify profiles, and assign specialties and locations."
        action={
          <button onClick={openInviteForm} className="btn-primary">
            <Plus size={14} /> Invite Doctor
          </button>
        }
      />

      <Modal
        open={showInvite}
        title={editingDoctorId ? "Edit Doctor" : "Invite Doctor"}
        eyebrow="Doctor Management"
        onClose={() => {
          resetForm();
          setShowInvite(false);
        }}
        footer={
          <>
            <button onClick={saveDoctor} className="btn-primary">
              {editingDoctorId ? "Save Changes" : "Send Invite"}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowInvite(false);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </>
        }
      >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Doctor Name" className="sm:col-span-2">
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Doctor name"
              className="input-field"
            />
            </Field>
            <Field label="Specialty">
            <input
              value={form.specialty}
              onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value }))}
              placeholder="Specialty"
              className="input-field"
            />
            </Field>
            <Field label="Qualifications">
            <input
              value={form.qualifications}
              onChange={(event) => setForm((prev) => ({ ...prev, qualifications: event.target.value }))}
              placeholder="Qualifications"
              className="input-field"
            />
            </Field>
            <Field label="Experience Years">
            <input
              value={form.experienceYears}
              onChange={(event) => setForm((prev) => ({ ...prev, experienceYears: event.target.value }))}
              placeholder="Years"
              type="number"
              className="input-field"
            />
            </Field>
            <Field label="Assigned Location">
            <select
              value={form.locationId}
              onChange={(event) => setForm((prev) => ({ ...prev, locationId: event.target.value }))}
              className="input-field"
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            </Field>
          </div>
      </Modal>
      {syncMessage && <p className="mb-3 text-xs text-ink-muted">{syncMessage}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {doctors.map((d) => {
          const location = locations.find((l) => l.id === d.locationId);
          return (
            <Card key={d.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={d.avatarInitials} size={44} />
                  <div>
                    <p className="text-sm font-medium text-ink">{d.name}</p>
                    <p className="text-xs text-ink-muted">{d.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditForm(d)} aria-label="Edit doctor">
                    <Pencil size={14} className="text-ink-faint hover:text-brand-600" />
                  </button>
                  <button onClick={() => remove(d.id)} aria-label="Remove doctor">
                    <Trash2 size={14} className="text-ink-faint hover:text-alert-500" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-ink-muted mb-2">{d.qualifications} · {d.experienceYears} yrs experience</p>
              <div className="flex items-center justify-between mb-3">
                <AvailabilityDot status={d.availability} />
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  <Star size={12} className="fill-clay-400 text-clay-400" /> {d.rating}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Pill tone="neutral">{location?.name ?? "Unassigned"}</Pill>
                <span className="text-ink-faint">{d.patientsCount} patients</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
