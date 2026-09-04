"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { RootState } from "@/hospital-admin/store/store";
import { NurseStationEntity } from "@/hospital-admin/lib/types/nursing-module";
import { createOrUpdateStation } from "@/hospital-admin/store/slices/nursingOperationsSlice";

export function NurseStationForm({ isOpen, onClose, station }: { isOpen: boolean; onClose: () => void; station?: NurseStationEntity | null }) {
  const dispatch = useDispatch();
  const { nurses, currentUserName } = useSelector((state: RootState) => state.nursingOperations);
  const [name, setName] = useState(""); const [department, setDepartment] = useState(""); const [location, setLocation] = useState(""); const [leadId, setLeadId] = useState("none"); const [status, setStatus] = useState<NurseStationEntity["status"]>("Active");
  useEffect(() => { setName(station?.name ?? ""); setDepartment(station?.department_name ?? ""); setLocation(station?.location_name ?? ""); setLeadId(station?.lead_id ?? "none"); setStatus(station?.status ?? "Active"); }, [station, isOpen]);
  const submit = (event: React.FormEvent) => { event.preventDefault(); const lead = nurses.find((item) => item.staff_id === leadId); dispatch(createOrUpdateStation({ station_id: station?.station_id, name, organization_id: station?.organization_id ?? "org-qlyno-1", location_id: station?.location_id ?? `loc-${location.toLowerCase().replace(/\W+/g, "-")}`, location_name: location, department_id: station?.department_id ?? `dept-${department.toLowerCase().replace(/\W+/g, "-")}`, department_name: department, lead_id: lead?.staff_id ?? "", lead_name: lead?.name ?? "Unassigned", status, totalBeds: station?.totalBeds ?? 0, occupiedBeds: station?.occupiedBeds ?? 0, actor: currentUserName })); onClose(); };
  const leads = nurses.filter((item) => item.role === "Nurse Station Lead" || item.role === "Senior Nurse");
  return <Dialog open={isOpen} onOpenChange={onClose}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{station ? "Edit" : "Create"} Nurse Station</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-4 pt-4"><div className="space-y-2"><Label>Station Name</Label><Input value={name} onChange={(event) => setName(event.target.value)} required /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Department</Label><Input value={department} onChange={(event) => setDepartment(event.target.value)} required /></div><div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={(value) => setStatus(value as NurseStationEntity["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></div></div><div className="space-y-2"><Label>Location / Building</Label><Input value={location} onChange={(event) => setLocation(event.target.value)} required /></div><div className="space-y-2"><Label>Station Lead</Label><Select value={leadId} onValueChange={setLeadId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Unassigned</SelectItem>{leads.map((lead) => <SelectItem key={lead.staff_id} value={lead.staff_id}>{lead.name} ({lead.role})</SelectItem>)}</SelectContent></Select></div><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save Station</Button></DialogFooter></form></DialogContent></Dialog>;
}
