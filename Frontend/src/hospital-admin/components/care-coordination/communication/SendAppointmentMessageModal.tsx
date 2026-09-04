"use client";

import { useState } from "react";
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
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { CalendarCheck, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { AppointmentMessageRecord, MessageChannel } from "@/hospital-admin/lib/types";
import { mockMessageTemplates } from "@/hospital-admin/lib/mock-data/communication-hub";

interface SendAppointmentMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: (record: AppointmentMessageRecord) => void;
}

export function SendAppointmentMessageModal({
  isOpen,
  onClose,
  onMessageSent,
}: SendAppointmentMessageModalProps) {
  const [patientName, setPatientName] = useState("Aarav Sharma");
  const [patientUhid, setPatientUhid] = useState("UHID-2026-8801");
  const [patientPhone, setPatientPhone] = useState("+91 98450 12345");
  const [doctorName, setDoctorName] = useState("Dr. Arvind Kumar");
  const [department, setDepartment] = useState("Cardiology");
  const [appointmentDate, setAppointmentDate] = useState("2026-08-29");
  const [appointmentTime, setAppointmentTime] = useState("10:30 AM");
  const [channel, setChannel] = useState<MessageChannel>("WhatsApp");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl-001");
  const [renderedMessage, setRenderedMessage] = useState<string>(
    "Dear Aarav Sharma, your appointment with Dr. Arvind Kumar (Cardiology) is confirmed for 2026-08-29 at 10:30 AM. Please arrive 15 minutes prior at Desk 3. Hospital Helpline: 080-49112200."
  );

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = mockMessageTemplates.find((t) => t.id === tplId);
    if (tpl) {
      let content = tpl.content;
      content = content.replace("{{patient_name}}", patientName);
      content = content.replace("{{doctor_name}}", doctorName);
      content = content.replace("{{department}}", department);
      content = content.replace("{{appointment_date}}", appointmentDate);
      content = content.replace("{{appointment_time}}", appointmentTime);
      content = content.replace("{{fasting_required}}", "No");
      setRenderedMessage(content);
    }
  };

  const handleSend = () => {
    const tpl = mockMessageTemplates.find((t) => t.id === selectedTemplateId) || mockMessageTemplates[0];

    const newRecord: AppointmentMessageRecord = {
      id: `aptmsg-${Date.now()}`,
      appointmentId: `apt-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      patientUhid,
      patientPhone,
      doctorName,
      department,
      appointmentDate,
      appointmentTime,
      triggerType: "booking_confirmation",
      templateId: tpl.templateId,
      templateName: tpl.name,
      channel,
      status: "Delivered",
      dispatchedAt: "Just now",
    };

    onMessageSent(newRecord);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Dispatch Appointment Notification</DialogTitle>
              <DialogDescription className="text-xs">
                Select pre-approved appointment template and preview hydrated variables before dispatch.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Message Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockMessageTemplates
                    .filter((t) => t.category === "Appointment")
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        {t.name} ({t.templateId})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Dispatch Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as MessageChannel)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp" className="text-xs">WhatsApp Business Gateway</SelectItem>
                  <SelectItem value="SMS" className="text-xs">Direct SMS Gateway</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Patient Name</Label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">UHID</Label>
              <Input
                value={patientUhid}
                onChange={(e) => setPatientUhid(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Mobile Phone</Label>
              <Input
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Consulting Doctor & Dept</Label>
              <div className="flex gap-2">
                <Input
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="h-9 text-xs flex-1"
                />
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 text-xs w-32"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date & Time</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="h-9 text-xs w-28"
                />
              </div>
            </div>
          </div>

          {/* Hydrated Message Preview */}
          <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center justify-between text-xs font-medium text-primary">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Live Hydrated Preview ({channel})</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background">
                Pre-Approved Template
              </Badge>
            </div>
            <Textarea
              value={renderedMessage}
              onChange={(e) => setRenderedMessage(e.target.value)}
              rows={3}
              className="mt-1 text-xs resize-none bg-background font-sans"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend} className="text-xs gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Dispatch Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
