"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { SectionHeading, Card, Pill, Modal, Field, CardGridSkeleton, SectionSkeleton } from "@/components/ui";
import { clinic, doctors as seedDoctors } from "@/lib/mock-data";
import { useMode } from "@/lib/mode-context";
import {
  ApiSyncSkippedError,
  BackendClinicServiceRow,
  createBackendClinicService,
  deleteBackendClinicService,
  getBackendBootstrap,
  updateBackendClinicService,
} from "@/lib/api-client";
import { Doctor } from "@/lib/types";

interface ServiceRow {
  id: string;
  name: string;
  eligibleDoctorIds: string[];
  durationMinutes: number;
  price: number;
}

const initialServices: ServiceRow[] = clinic.services.map((s, i) => ({
  id: `svc-${i}`,
  name: s,
  eligibleDoctorIds: seedDoctors.slice(0, (i % seedDoctors.length) + 1).map((d) => d.id),
  durationMinutes: i % 2 === 0 ? 20 : 30,
  price: 600 + i * 150,
}));

export default function ServicesPage() {
  const { selectedWorkplaceId } = useMode();
  const [services, setServices] = useState<BackendClinicServiceRow[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("20");
  const [price, setPrice] = useState("");
  const [eligibleDoctorIds, setEligibleDoctorIds] = useState<string[]>([]);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    getBackendBootstrap()
      .then((data) => {
        if (cancelled) return;
        setServices(data.services);
        setDoctors(data.doctors);
      })
      .catch(() => {
        if (cancelled) return;
        setServices(initialServices);
        setDoctors(seedDoctors);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingServices(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoadingServices) {
    return (
      <div>
        <SectionSkeleton />
        <CardGridSkeleton cards={4} />
      </div>
    );
  }

  function resetForm() {
    setName("");
    setDurationMinutes("20");
    setPrice("");
    setEligibleDoctorIds([]);
    setEditingServiceId(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(service: BackendClinicServiceRow) {
    setEditingServiceId(service.id);
    setName(service.name);
    setDurationMinutes(String(service.durationMinutes));
    setPrice(String(service.price));
    setEligibleDoctorIds(service.eligibleDoctorIds);
    setShowForm(true);
  }

  async function saveService() {
    if (!name.trim()) return;
    const serviceInput = {
      name,
      durationMinutes: Number(durationMinutes) || 20,
      price: Number(price) || 0,
      eligibleDoctorIds,
    };

    if (editingServiceId) {
      let updatedService: BackendClinicServiceRow = { id: editingServiceId, ...serviceInput };
      try {
        updatedService = await updateBackendClinicService(editingServiceId, serviceInput);
        setSyncMessage("Clinic service changes synced to backend.");
      } catch (error) {
        setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock service updated locally." : "Backend sync failed; local service update kept.");
      }
      setServices((prev) => prev.map((service) => (service.id === editingServiceId ? updatedService : service)));
      resetForm();
      setShowForm(false);
      return;
    }

    let nextService: BackendClinicServiceRow = {
      id: `svc-${Date.now()}`,
      ...serviceInput,
    };
    try {
      nextService = await createBackendClinicService({
        workplaceId: selectedWorkplaceId,
        ...serviceInput,
      });
      setSyncMessage("Clinic service synced to backend.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock service saved locally." : "Backend sync failed; local service kept.");
    }
    setServices((prev) => [...prev, nextService]);
    resetForm();
    setShowForm(false);
  }

  async function remove(id: string) {
    if (window.confirm("Remove this clinic service from patient booking?")) {
      try {
        await deleteBackendClinicService(id);
        setSyncMessage("Clinic service deleted from backend.");
      } catch (error) {
        setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock service removed locally." : "Backend delete failed; local service removed.");
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  }

  function toggleDoctor(id: string) {
    setEligibleDoctorIds((prev) => (prev.includes(id) ? prev.filter((doctorId) => doctorId !== id) : [...prev, id]));
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Clinic Operations · Services"
        title="Services"
        action={
          <button onClick={openAddForm} className="btn-primary">
            <Plus size={14} /> Add Service
          </button>
        }
        description="Define services offered by the clinic and the doctors eligible to deliver them."
      />

      <Modal
        open={showForm}
        title={editingServiceId ? "Edit Service" : "Add Service"}
        eyebrow="Clinic Services"
        onClose={() => {
          resetForm();
          setShowForm(false);
        }}
        footer={
          <>
            <button onClick={saveService} className="btn-primary">
              {editingServiceId ? "Save Changes" : <><Plus size={14} /> Add Service</>}
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
        size="md"
      >
        <Field label="Service Name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vaccination" className="input-field" />
        </Field>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Duration">
            <select value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="input-field">
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
            </select>
          </Field>
          <Field label="Price">
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="INR" className="input-field" />
          </Field>
        </div>
        <div className="mt-4">
          <p className="eyebrow mb-2">Eligible Doctors</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {doctors.map((doctor) => (
              <label key={doctor.id} className="flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={eligibleDoctorIds.includes(doctor.id)}
                  onChange={() => toggleDoctor(doctor.id)}
                  className="h-4 w-4 accent-brand-500"
                />
                {doctor.name}
              </label>
            ))}
          </div>
        </div>
      </Modal>
      {syncMessage && <p className="mb-3 text-xs text-ink-muted">{syncMessage}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-ink">{s.name}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditForm(s)} aria-label="Edit service">
                  <Pencil size={14} className="text-ink-faint hover:text-brand-600" />
                </button>
                <button onClick={() => remove(s.id)} aria-label="Delete service">
                  <Trash2 size={14} className="text-ink-faint hover:text-alert-500" />
                </button>
              </div>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <Pill tone="neutral">{s.durationMinutes} min</Pill>
              <Pill tone="clay">INR {s.price}</Pill>
            </div>
            <p className="text-[11px] text-ink-muted mb-2">Eligible doctors</p>
            <div className="flex flex-wrap gap-1.5">
              {s.eligibleDoctorIds.length === 0 ? (
                <span className="text-xs text-ink-faint">None assigned</span>
              ) : (
                s.eligibleDoctorIds.map((id) => {
                  const doc = doctors.find((d) => d.id === id);
                  return (
                    <Pill key={id} tone="brand">
                      {doc?.name}
                    </Pill>
                  );
                })
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
