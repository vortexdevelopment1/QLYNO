"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  Bed,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  FlaskConical,
  HeartPulse,
  HelpCircle,
  IndianRupee,
  Layers,
  MessageCircle,
  MessageSquare,
  Milestone,
  Network,
  Phone,
  Pill,
  PlusCircle,
  Receipt,
  RotateCcw,
  Scan,
  Scissors,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { cn } from "@/hospital-admin/lib/utils";

// Circular Progress Component for Hospital Capacity
function CapacityGauge({ value, color, label }: { value: number; color: string; label: string }) {
  const radius = 28;
  const stroke = 4;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </span>
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            className="text-muted/40 dark:text-muted/20"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-bold font-mono text-foreground">{value}%</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Appointment tab state
  const [appointmentTab, setAppointmentTab] = useState<"All" | "Waiting" | "In Consultation" | "Completed" | "Cancelled">("All");

  // Needs attention tab state
  const [attentionTab, setAttentionTab] = useState<"All" | "Clinical" | "Patient" | "Staff" | "Finance" | "Ops">("All");

  // Full Appointments List
  const allAppointmentsList = [
    { id: "apt_1", time: "09:30 AM", patient: "Aarav Shah", doctor: "Dr. Kapoor • Cardiology", status: "In Consultation", tone: "emerald" },
    { id: "apt_2", time: "09:45 AM", patient: "Meera Nambiar", doctor: "Dr. Mehta • Orthopedics", status: "Waiting", tone: "amber" },
    { id: "apt_3", time: "10:00 AM", patient: "Kabir Malhotra", doctor: "Dr. Iyer • Neurology", status: "In Consultation", tone: "emerald" },
    { id: "apt_4", time: "10:15 AM", patient: "Fatima Ansari", doctor: "Dr. Khan • Gynecology", status: "Waiting", tone: "amber" },
    { id: "apt_5", time: "10:30 AM", patient: "Devansh Pandey", doctor: "Dr. Sinha • Pediatrics", status: "Cancelled", tone: "rose" },
    { id: "apt_6", time: "10:45 AM", patient: "Sunita Rao", doctor: "Dr. Priya Sharma • Diabetology", status: "In Consultation", tone: "emerald" },
    { id: "apt_7", time: "11:00 AM", patient: "Rohan Deshmukh", doctor: "Dr. Kapoor • Cardiology", status: "Waiting", tone: "amber" },
    { id: "apt_8", time: "11:15 AM", patient: "Pooja Hegde", doctor: "Dr. Khan • Gynecology", status: "In Consultation", tone: "emerald" },
    { id: "apt_9", time: "11:30 AM", patient: "Suresh Kulkarni", doctor: "Dr. Iyer • Neurology", status: "Waiting", tone: "amber" },
    { id: "apt_10", time: "11:45 AM", patient: "Manoj Tiwari", doctor: "Dr. Arvind Joshi • Ortho", status: "In Consultation", tone: "emerald" },
    { id: "apt_11", time: "08:30 AM", patient: "Karan Singhania", doctor: "Dr. Kapoor • Cardiology", status: "Completed", tone: "blue" },
    { id: "apt_12", time: "08:45 AM", patient: "Divya Nair", doctor: "Dr. Sinha • Pediatrics", status: "Completed", tone: "blue" },
    { id: "apt_13", time: "09:00 AM", patient: "Rajesh Varma", doctor: "Dr. Iyer • Neurology", status: "Completed", tone: "blue" },
    { id: "apt_14", time: "09:15 AM", patient: "Smita Patil", doctor: "Dr. Priya Sharma • Diabetology", status: "Completed", tone: "blue" },
    { id: "apt_15", time: "01:00 PM", patient: "Gaurav Bhatt", doctor: "Dr. Mehta • Orthopedics", status: "Cancelled", tone: "rose" },
  ];

  const filteredAppointments = allAppointmentsList.filter((a) => {
    if (appointmentTab === "All") return true;
    return a.status === appointmentTab;
  });

  // Needs Attention Alerts List
  const allAlertsList = [
    { id: "alt_1", category: "Clinical", title: "6 critical reports waiting for review", desc: "Reports received from lab require doctor review.", urgency: "Critical", tone: "rose", icon: Users },
    { id: "alt_2", category: "Patient", title: "8 patients waiting for follow-up decision", desc: "Doctor review pending for follow-up actions.", urgency: "High", tone: "amber", icon: UserCheck },
    { id: "alt_3", category: "Ops", title: "3 emergency beds unavailable", desc: "ICU-1, ICU-3, and NICU-2 are fully occupied.", urgency: "High", tone: "amber", icon: Bed },
    { id: "alt_4", category: "Staff", title: "2 doctors running 30+ min behind", desc: "Dr. Mehta (Ortho) and Dr. Iyer (Neuro).", urgency: "Medium", tone: "yellow", icon: Clock },
    { id: "alt_5", category: "Finance", title: "4 insurance approvals pending", desc: "Requires documentation or clarification.", urgency: "Medium", tone: "yellow", icon: Receipt },
    { id: "alt_6", category: "Clinical", title: "Abnormal cardiac troponin alert (pat_004)", desc: "Immediate review requested by ER resident.", urgency: "Critical", tone: "rose", icon: AlertCircle },
    { id: "alt_7", category: "Ops", title: "Ambulance AMB-02 scheduled for maintenance", desc: "Quarterly oxygen manifold calibration due today.", urgency: "Medium", tone: "yellow", icon: Truck },
    { id: "alt_8", category: "Staff", title: "Night shift nursing handover missing at Station 3", desc: "Supervisor sign-off pending for Ward B.", urgency: "High", tone: "amber", icon: ShieldAlert },
  ];

  const filteredAlerts = allAlertsList.filter((a) => {
    if (attentionTab === "All") return true;
    return a.category === attentionTab;
  });

  // Bed Status Donut data
  const bedDonutData = [
    { name: "Occupied", value: 126, color: "#3b82f6" },
    { name: "Available", value: 24, color: "#06b6d4" },
    { name: "Reserved", value: 8, color: "#f59e0b" },
    { name: "Cleaning", value: 4, color: "#ef4444" },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-12 text-foreground">
      {/* ========================================================================= */}
      {/* ROW 1: 5 TOP KPI CARDS                                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1.1: Today's Patients */}
        <Card className="border-border bg-card shadow-sm p-4 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Today&apos;s Patients</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">148</p>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                ↑ 12% vs yesterday
              </span>
            </div>
          </div>
        </Card>

        {/* Card 1.2: Beds Occupied */}
        <Card className="border-border bg-card shadow-sm p-4 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Bed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Beds Occupied</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">126 / 150</p>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                84% Occupancy
              </span>
            </div>
          </div>
        </Card>

        {/* Card 1.3: Emergency Cases */}
        <Card className="border-border bg-card shadow-sm p-4 hover:border-rose-500/40 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Emergency Cases</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">12</p>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                2 Critical
              </span>
            </div>
          </div>
        </Card>

        {/* Card 1.4: Revenue Today */}
        <Card className="border-border bg-card shadow-sm p-4 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Revenue Today</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">₹4,26,000</p>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ↑ 8.5% vs yesterday
              </span>
            </div>
          </div>
        </Card>

        {/* Card 1.5: Pending Doctor Actions */}
        <Card className="border-border bg-card shadow-sm p-4 hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Pending Doctor Actions</p>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">17</p>
              <Link href="/hospital-admin/doctors" className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline block">
                View all
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: 3 CARDS (Patient Journey Today, Reports Awaiting Review, Follow-ups) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 2.1: Patient Journey Today */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">Patient Journey Today</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2 space-y-2 text-xs flex-1">
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-[10px]">
                  <Users className="h-3 w-3" />
                </span>
                Waiting for consultation
              </span>
              <strong className="font-mono text-foreground">12</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 text-[10px]">
                  <FlaskConical className="h-3 w-3" />
                </span>
                Tests ordered
              </span>
              <strong className="font-mono text-foreground">18</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-[10px]">
                  <FileText className="h-3 w-3" />
                </span>
                Reports received
              </span>
              <strong className="font-mono text-foreground">9</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                <span className="h-5 w-5 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 text-[10px]">
                  <Clock className="h-3 w-3" />
                </span>
                Waiting for doctor review
              </span>
              <strong className="font-mono text-amber-600 dark:text-amber-400">6</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-[10px]">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                Doctor reviewed
              </span>
              <strong className="font-mono text-foreground">14</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                <span className="h-5 w-5 rounded bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 text-[10px]">
                  <RotateCcw className="h-3 w-3" />
                </span>
                Follow-ups due
              </span>
              <strong className="font-mono text-rose-600 dark:text-rose-400">8</strong>
            </div>
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/care-coordination/patient-journey" className="text-xs font-semibold text-primary hover:underline">
              View full journey &gt;
            </Link>
          </div>
        </Card>

        {/* Card 2.2: Reports Awaiting Review */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground">Reports Awaiting Review</CardTitle>
            <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center font-mono">
              6
            </span>
          </CardHeader>
          <CardContent className="px-3 pb-2 text-[11px] flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-muted-foreground border-b border-border/60">
                  <th className="pb-1.5 font-semibold">Patient</th>
                  <th className="pb-1.5 font-semibold">Test</th>
                  <th className="pb-1.5 font-semibold">Received</th>
                  <th className="pb-1.5 font-semibold">Waiting Since</th>
                  <th className="pb-1.5 font-semibold text-right">Doctor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="py-2 font-medium text-foreground">Rahul Sharma</td>
                  <td className="py-2 text-muted-foreground">MRI Spine</td>
                  <td className="py-2 text-muted-foreground">2h ago</td>
                  <td className="py-2 font-medium text-rose-600 dark:text-rose-400">2h 14m</td>
                  <td className="py-2 text-right">
                    <Link href="/hospital-admin/care-coordination/reports-review" className="text-muted-foreground hover:text-primary">
                      Dr. Kapoor &gt;
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-foreground">Priya Singh</td>
                  <td className="py-2 text-muted-foreground">CBC</td>
                  <td className="py-2 text-muted-foreground">5h ago</td>
                  <td className="py-2 font-medium text-rose-600 dark:text-rose-400">5h 42m</td>
                  <td className="py-2 text-right">
                    <Link href="/hospital-admin/care-coordination/reports-review" className="text-muted-foreground hover:text-primary">
                      Dr. Mehta &gt;
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-foreground">Arjun Patel</td>
                  <td className="py-2 text-muted-foreground">CT Abdomen</td>
                  <td className="py-2 text-muted-foreground">3h ago</td>
                  <td className="py-2 font-medium text-rose-600 dark:text-rose-400">3h 15m</td>
                  <td className="py-2 text-right">
                    <Link href="/hospital-admin/care-coordination/reports-review" className="text-muted-foreground hover:text-primary">
                      Dr. Iyer &gt;
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-foreground">Neha Verma</td>
                  <td className="py-2 text-muted-foreground">LFT</td>
                  <td className="py-2 text-muted-foreground">1h ago</td>
                  <td className="py-2 font-medium text-rose-600 dark:text-rose-400">1h 05m</td>
                  <td className="py-2 text-right">
                    <Link href="/hospital-admin/care-coordination/reports-review" className="text-muted-foreground hover:text-primary">
                      Dr. Kapoor &gt;
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/care-coordination/reports-review" className="text-xs font-semibold text-primary hover:underline">
              View all reports &gt;
            </Link>
          </div>
        </Card>

        {/* Card 2.3: Follow-ups Due */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">Follow-ups Due</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2 space-y-2.5 text-xs flex-1">
            <div className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                <CalendarClock className="h-3 w-3" />
              </span>
              <div>
                <strong className="text-foreground block text-xs">18 follow-ups due today</strong>
                <span className="text-[11px] text-muted-foreground">Patients need to book or visit.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                <CalendarDays className="h-3 w-3" />
              </span>
              <div>
                <strong className="text-foreground block text-xs">7 appointments not booked</strong>
                <span className="text-[11px] text-muted-foreground">Follow-up appointments pending.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                <FileCheck className="h-3 w-3" />
              </span>
              <div>
                <strong className="text-foreground block text-xs">5 reports need patient action</strong>
                <span className="text-[11px] text-muted-foreground">Additional tests or documents pending.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                <Clock className="h-3 w-3" />
              </span>
              <div>
                <strong className="text-foreground block text-xs">4 patients waiting for instructions</strong>
                <span className="text-[11px] text-muted-foreground">Doctor has added notes/plan.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                <HelpCircle className="h-3 w-3" />
              </span>
              <div>
                <strong className="text-foreground block text-xs">2 patients haven&apos;t responded</strong>
                <span className="text-[11px] text-muted-foreground">Follow-up reminders sent.</span>
              </div>
            </div>
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/follow-ups" className="text-xs font-semibold text-primary hover:underline">
              View follow-ups &gt;
            </Link>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: 2 CARDS (Today's Appointments, Needs Attention)                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Card 3.1: Today's Appointments */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-bold text-foreground">Today&apos;s Appointments</CardTitle>
            </CardHeader>
            <div className="px-4 pb-2">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] mb-3">
                <button
                  type="button"
                  onClick={() => setAppointmentTab("All")}
                  className={cn(
                    "px-2 py-0.5 rounded-full font-medium transition-colors",
                    appointmentTab === "All" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  All (36)
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentTab("Waiting")}
                  className={cn(
                    "px-2 py-0.5 rounded-full font-medium transition-colors",
                    appointmentTab === "Waiting" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  Waiting (8)
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentTab("In Consultation")}
                  className={cn(
                    "px-2 py-0.5 rounded-full font-medium transition-colors",
                    appointmentTab === "In Consultation" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  In Consultation (12)
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentTab("Completed")}
                  className={cn(
                    "px-2 py-0.5 rounded-full font-medium transition-colors",
                    appointmentTab === "Completed" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  Completed (14)
                </button>
                <button
                  type="button"
                  onClick={() => setAppointmentTab("Cancelled")}
                  className={cn(
                    "px-2 py-0.5 rounded-full font-medium transition-colors",
                    appointmentTab === "Cancelled" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  Cancelled (2)
                </button>
              </div>

              {/* Appointment Rows (Dynamic based on selected filter tab) */}
              <div className="space-y-2 text-xs divide-y divide-border/40 min-h-[220px]">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between pt-2 first:pt-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-muted-foreground w-16">{apt.time}</span>
                        <div>
                          <strong className="text-foreground text-xs block">{apt.patient}</strong>
                          <span className="text-[11px] text-muted-foreground">{apt.doctor}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold",
                          apt.tone === "emerald" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
                          apt.tone === "amber" && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
                          apt.tone === "blue" && "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
                          apt.tone === "rose" && "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                        )}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <CalendarClock className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                    <p className="text-xs font-medium">No appointments in &quot;{appointmentTab}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/appointments" className="text-xs font-semibold text-primary hover:underline">
              View full calendar &gt;
            </Link>
          </div>
        </Card>

        {/* Card 3.2: Needs Attention */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-bold text-foreground">Needs Attention</CardTitle>
            </CardHeader>
            <div className="px-4 pb-2">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] mb-3">
                {(["All", "Clinical", "Patient", "Staff", "Finance", "Ops"] as const).map((cat) => {
                  const count = cat === "All" ? allAlertsList.length : allAlertsList.filter((a) => a.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAttentionTab(cat)}
                      className={cn(
                        "px-2 py-0.5 rounded-full font-medium transition-colors",
                        attentionTab === cat ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {cat} {cat !== "All" && `(${count})`}
                    </button>
                  );
                })}
              </div>

              {/* Alert items list (Dynamic based on selected category tab) */}
              <div className="space-y-2 text-xs divide-y divide-border/40 min-h-[220px]">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.slice(0, 5).map((alt) => {
                    const Icon = alt.icon;
                    return (
                      <div key={alt.id} className="flex items-center justify-between pt-2 first:pt-1">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "h-5 w-5 rounded flex items-center justify-center shrink-0 text-[10px] mt-0.5",
                              alt.tone === "rose" && "bg-rose-500/10 text-rose-600",
                              alt.tone === "amber" && "bg-amber-500/10 text-amber-600",
                              alt.tone === "yellow" && "bg-yellow-500/10 text-yellow-600"
                            )}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                          <div>
                            <strong className="text-foreground text-xs block">{alt.title}</strong>
                            <span className="text-[11px] text-muted-foreground">{alt.desc}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold shrink-0 ml-2",
                            alt.tone === "rose" && "bg-rose-500/10 text-rose-600 border-rose-500/20",
                            alt.tone === "amber" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                            alt.tone === "yellow" && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20"
                          )}
                        >
                          {alt.urgency}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-1.5 opacity-40 text-emerald-500" />
                    <p className="text-xs font-medium">No alerts in &quot;{attentionTab}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/notifications" className="text-xs font-semibold text-primary hover:underline">
              View all alerts &gt;
            </Link>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* ROW 4: 3 CARDS (Hospital Capacity, Bed Status, Emergency Snapshot)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 4.1: Hospital Capacity */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">Hospital Capacity</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2 pt-2 flex items-center justify-around flex-1">
            <CapacityGauge value={72} color="#0d9488" label="OPD" />
            <CapacityGauge value={84} color="#f59e0b" label="Beds" />
            <CapacityGauge value={92} color="#e11d48" label="ICU" />
            <CapacityGauge value={68} color="#8b5cf6" label="OT" />
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/wards-beds" className="text-xs font-semibold text-primary hover:underline">
              View capacity details &gt;
            </Link>
          </div>
        </Card>

        {/* Card 4.2: Bed Status (with Donut Chart) */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">Bed Status</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2 flex items-center justify-between gap-2 flex-1">
            {/* Left Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Available</span>
                <strong className="font-mono text-foreground ml-auto">24</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Occupied</span>
                <strong className="font-mono text-foreground ml-auto">126</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Reserved</span>
                <strong className="font-mono text-foreground ml-auto">8</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">Cleaning / Maintenance</span>
                <strong className="font-mono text-foreground ml-auto">4</strong>
              </div>
            </div>

            {/* Right Donut Chart */}
            <div className="h-24 w-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bedDonutData}
                    dataKey="value"
                    innerRadius={26}
                    outerRadius={40}
                    paddingAngle={3}
                    stroke="transparent"
                  >
                    {bedDonutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 6, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/wards-beds" className="text-xs font-semibold text-primary hover:underline">
              View bed management &gt;
            </Link>
          </div>
        </Card>

        {/* Card 4.3: Emergency Snapshot */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <Siren className="h-4 w-4" />
              <CardTitle className="text-sm font-bold text-foreground">Emergency Snapshot</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-2 flex items-center justify-between gap-3 flex-1 text-xs">
            {/* Left Metrics */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Users className="h-3 w-3 text-blue-500" /> Active Cases
                </span>
                <strong className="font-mono text-foreground">4</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-rose-600 font-medium text-[11px]">
                  <AlertCircle className="h-3 w-3 text-rose-500" /> Critical
                </span>
                <strong className="font-mono text-rose-600">2</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-600 font-medium text-[11px]">
                  <Clock className="h-3 w-3 text-amber-500" /> Waiting
                </span>
                <strong className="font-mono text-amber-600">3</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
                  <Bed className="h-3 w-3 text-emerald-500" /> Beds Available
                </span>
                <strong className="font-mono text-emerald-600">1</strong>
              </div>
            </div>

            {/* Right Ambulance Badge / Graphic */}
            <div className="h-16 w-20 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col items-center justify-center p-2 text-center shrink-0">
              <Truck className="h-6 w-6 text-rose-600 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-rose-600 mt-1">AMB LIVE</span>
            </div>
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/emergency" className="text-xs font-semibold text-primary hover:underline">
              View emergency &gt;
            </Link>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* ROW 5: 3 CARDS (Financial Snapshot, Patient Communication, Cross-Provider) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 5.1: Financial Snapshot (Today) */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">Financial Snapshot (Today)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2 space-y-2 text-xs flex-1">
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 text-[10px]">
                  <Receipt className="h-3 w-3" />
                </span>
                OPD Collections
              </span>
              <strong className="font-mono text-foreground">₹1,24,000</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-[10px]">
                  <Building2 className="h-3 w-3" />
                </span>
                IPD Collections
              </span>
              <strong className="font-mono text-foreground">₹2,46,000</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 text-[10px]">
                  <ShieldCheck className="h-3 w-3" />
                </span>
                Insurance Receipts
              </span>
              <strong className="font-mono text-foreground">₹42,600</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                <span className="h-5 w-5 rounded bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 text-[10px]">
                  <AlertCircle className="h-3 w-3" />
                </span>
                Outstanding Amount
              </span>
              <strong className="font-mono text-rose-600 dark:text-rose-400">₹1,38,900</strong>
            </div>
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/financial-reports" className="text-xs font-semibold text-primary hover:underline">
              View financial reports &gt;
            </Link>
          </div>
        </Card>

        {/* Card 5.2: Patient Communication */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">Patient Communication</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2 space-y-2 text-xs flex-1">
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-[10px]">
                  <MessageCircle className="h-3 w-3" />
                </span>
                WhatsApp messages
              </span>
              <strong className="font-mono text-foreground">42</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 text-[10px]">
                  <CalendarCheck className="h-3 w-3" />
                </span>
                Appointment confirmations
              </span>
              <strong className="font-mono text-foreground">31</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 text-[10px]">
                  <FileText className="h-3 w-3" />
                </span>
                Report notifications
              </span>
              <strong className="font-mono text-foreground">18</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                <span className="h-5 w-5 rounded bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 text-[10px]">
                  <CalendarDays className="h-3 w-3" />
                </span>
                Follow-up reminders
              </span>
              <strong className="font-mono text-rose-600 dark:text-rose-400">11</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                <span className="h-5 w-5 rounded bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 text-[10px]">
                  <HelpCircle className="h-3 w-3" />
                </span>
                Unanswered patient queries
              </span>
              <strong className="font-mono text-rose-600 dark:text-rose-400">7</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                <span className="h-5 w-5 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 text-[10px]">
                  <AlertTriangle className="h-3 w-3" />
                </span>
                Escalated to doctor
              </span>
              <strong className="font-mono text-amber-600 dark:text-amber-400">3</strong>
            </div>
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/care-coordination/communication" className="text-xs font-semibold text-primary hover:underline">
              Open communication center &gt;
            </Link>
          </div>
        </Card>

        {/* Card 5.3: Cross-Provider Connections */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground">Cross-Provider Connections</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-2 space-y-2 text-xs flex-1">
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 text-[10px]">
                  <FileCheck className="h-3 w-3" />
                </span>
                External lab reports received
              </span>
              <strong className="font-mono text-foreground">24</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 text-[10px]">
                  <UserCheck className="h-3 w-3" />
                </span>
                External doctor referrals
              </span>
              <strong className="font-mono text-foreground">11</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-[10px]">
                  <Share2 className="h-3 w-3" />
                </span>
                Patients referred outside
              </span>
              <strong className="font-mono text-foreground">7</strong>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-[10px]">
                  <Network className="h-3 w-3" />
                </span>
                Records shared with providers
              </span>
              <strong className="font-mono text-foreground">15</strong>
            </div>
          </CardContent>
          <div className="p-3 border-t border-border/80 text-center">
            <Link href="/hospital-admin/integrations" className="text-xs font-semibold text-primary hover:underline">
              View connections &gt;
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
