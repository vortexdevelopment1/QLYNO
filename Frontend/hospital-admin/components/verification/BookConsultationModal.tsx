"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { DoctorAffiliationVerification } from "@/hospital-admin/lib/types";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Stethoscope,
  Building2,
  Phone,
  Video,
  User,
  ShieldCheck,
} from "lucide-react";

interface BookConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorAffiliationVerification | null;
  hospitalName?: string;
  onConfirm: (bookingDetails: {
    doctorName: string;
    specialty: string;
    patientName: string;
    phone: string;
    consultationType: string;
    date: string;
    timeSlot: string;
    fee: number;
  }) => void;
}

const AVAILABLE_TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

export function BookConsultationModal({
  isOpen,
  onClose,
  doctor,
  hospitalName = "Qlyno Multispecialty Hospital",
  onConfirm,
}: BookConsultationModalProps) {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [consultationType, setConsultationType] = useState("In-Person OPD");
  const [appointmentDate, setAppointmentDate] = useState(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens with a new doctor
  useEffect(() => {
    if (isOpen) {
      setPatientName("");
      setPhone("");
      setAge("");
      setGender("Male");
      setConsultationType("In-Person OPD");
      setAppointmentDate(tomorrowStr);
      setTimeSlot("10:00 AM");
      setSymptoms("");
      setIsSubmitting(false);
    }
  }, [isOpen, doctor]);

  if (!isOpen) return null;

  const consultationFee =
    doctor?.specialty?.includes("Cardiology") || doctor?.specialty?.includes("Neurology")
      ? 1200
      : 800;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm({
        doctorName: doctor?.doctorName || "Attending Physician",
        specialty: doctor?.specialty || "General Medicine",
        patientName: patientName.trim(),
        phone: phone.trim(),
        consultationType,
        date: appointmentDate,
        timeSlot,
        fee: consultationFee,
      });
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const doctorInitials = doctor?.doctorName
    ? doctor.doctorName.split(" ").filter(Boolean).map((n) => n[0]).join("")
    : "DR";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center gap-2 text-primary mb-0.5">
            <Calendar className="h-4 w-4" />
            <DialogTitle className="text-base font-bold text-foreground">
              Book Doctor Consultation
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Schedule a verified OPD consultation or tele-health appointment.
          </DialogDescription>
        </DialogHeader>

        {doctor && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 mt-1">
            <Avatar className="h-12 w-12 border border-border shrink-0">
              <AvatarImage src={doctor.avatarUrl} alt={doctor.doctorName} />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {doctorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-foreground text-xs">{doctor.doctorName}</h4>
                <Badge className="bg-emerald-600 text-white text-[8px] px-1 py-0 h-3.5 gap-0.5">
                  <CheckCircle2 className="h-2 w-2" /> Verified
                </Badge>
                <Badge variant="outline" className="text-[9px] font-mono py-0 h-3.5">
                  {doctor.qualification}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Stethoscope className="h-3 w-3 text-primary" /> {doctor.specialty}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {hospitalName} • Reg: {doctor.registrationNo}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="patient-name" className="text-xs font-semibold">
                Patient Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patient-name"
                placeholder="e.g. Ramesh Sharma"
                className="text-xs h-8"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="patient-phone" className="text-xs font-semibold">
                Contact Phone # <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patient-phone"
                placeholder="e.g. +91 98765 43210"
                className="text-xs h-8"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="patient-age" className="text-xs font-semibold">
                Age
              </Label>
              <Input
                id="patient-age"
                type="number"
                placeholder="e.g. 45"
                className="text-xs h-8"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Consult Mode</Label>
              <Select value={consultationType} onValueChange={setConsultationType}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-Person OPD">In-Person OPD</SelectItem>
                  <SelectItem value="Video Tele-Health">Video Tele-Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="consult-date" className="text-xs font-semibold">
                Appointment Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="consult-date"
                type="date"
                className="text-xs h-8"
                value={appointmentDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                Preferred Time Slot <span className="text-destructive">*</span>
              </Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="text-xs h-8 font-mono">
                  <SelectValue placeholder="Select Slot" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {AVAILABLE_TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot} className="text-xs font-mono">
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="space-y-1">
            <Label htmlFor="symptoms" className="text-xs font-semibold">
              Symptoms / Reason for Visit (Optional)
            </Label>
            <Textarea
              id="symptoms"
              placeholder="Describe symptoms, medical history or referral notes..."
              className="text-xs min-h-[60px] resize-none"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>

          {/* Fee & Confirmation Banner */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[11px] block">Consultation Fee</span>
              <span className="font-bold text-foreground text-sm font-mono">
                ₹{consultationFee.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-right text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium justify-end">
                <ShieldCheck className="h-3.5 w-3.5" /> Instant Confirmation
              </div>
              <span>SMS token dispatch to phone</span>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !patientName.trim() || !phone.trim()}
              className="gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              {isSubmitting ? "Confirming Booking..." : "Confirm & Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
