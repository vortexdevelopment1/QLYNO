"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  CheckCheck,
  Clock,
  User,
  Search,
  Phone,
  Video,
  FileText,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Card } from "@/hospital-admin/components/ui/card";
import { CommunicationNav } from "@/hospital-admin/components/care-coordination/communication/communication-nav";
import { mockPatientChatThreads } from "@/hospital-admin/lib/mock-data/communication-hub";
import { PatientChatThread, PatientChatMessage } from "@/hospital-admin/lib/types";

const QUICK_RESPONSES = [
  "Dr. Arvind has reviewed your query and advised continuing current medication.",
  "Please share a clear photograph of the surgical incision area in good lighting.",
  "Your prescription refill has been sent to the Hospital Pharmacy for collection.",
  "We have booked an in-person review slot for you tomorrow at 11:30 AM.",
];

export default function PatientChatPage() {
  const [threads, setThreads] = useState<PatientChatThread[]>(mockPatientChatThreads);
  const [activeThreadId, setActiveThreadId] = useState<string>(mockPatientChatThreads[0].id);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = () => {
    if (!replyText.trim()) return;

    const newMessage: PatientChatMessage = {
      id: `msg-${Date.now()}`,
      senderType: "Staff",
      senderName: "Dr. Arvind Kumar (Cardiology)",
      content: replyText,
      timestamp: "Just now",
      status: "Delivered",
    };

    const updatedThreads = threads.map((t) => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          lastMessage: replyText,
          lastMessageTime: "Just now",
          unreadCount: 0,
          messages: [...t.messages, newMessage],
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setReplyText("");
  };

  const handleQuickResponse = (text: string) => {
    setReplyText(text);
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.patientUhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.department || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Patient Portal
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Patient 2-Way Messaging & Portal Chat
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Direct, encrypted patient communication channel for post-op guidance, triage inquiries, and scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/hospital-admin/patients/${activeThread.patientId}`}>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                View Patient Profile ({activeThread.patientUhid})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <CommunicationNav
        unreadChatCount={threads.reduce((acc, t) => acc + t.unreadCount, 0)}
        activeBroadcastCount={1}
        pendingRemindersCount={8}
      />

      {/* Chat Workspace Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-[calc(100vh-230px)] min-h-[550px]">
          {/* Thread List Sidebar */}
          <div className="lg:col-span-4 flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="p-3 border-b border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Active Inquiries</span>
                <Badge variant="secondary" className="text-[10px]">
                  {threads.length} Channels
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search patient, UHID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-xs bg-muted/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {filteredThreads.map((thread) => {
                const isActive = thread.id === activeThread.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      // mark read
                      setThreads(
                        threads.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t))
                      );
                    }}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 ${
                      isActive
                        ? "bg-primary/10 border-l-4 border-l-primary"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {thread.patientName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {thread.patientName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {thread.lastMessageTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {thread.patientUhid}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-[11px] text-primary font-medium">
                          {thread.department}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {thread.lastMessage}
                      </p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Conversation Feed */}
          <div className="lg:col-span-8 flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
            {/* Thread Header */}
            <div className="p-3.5 border-b border-border/70 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                  {activeThread.patientName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {activeThread.patientName}
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {activeThread.patientUhid}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{activeThread.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Portal Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/hospital-admin/care-coordination/patient-journey`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                    <ChevronRight className="h-3.5 w-3.5" />
                    Care Pathway
                  </Button>
                </Link>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
              {activeThread.messages.map((msg) => {
                const isPatient =
                  msg.senderType === "Patient" || msg.senderType === "patient";
                const messageBody = msg.content || msg.text || "";
                const attachmentName =
                  msg.attachment?.name || msg.attachmentName || "Attachment";
                const attachmentType =
                  msg.attachment?.type || msg.attachmentType || "file";
                const hasAttachment = Boolean(msg.attachment || msg.isAttachment);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isPatient ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        isPatient
                          ? "bg-card border border-border text-foreground rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      }`}
                    >
                      {messageBody && <p>{messageBody}</p>}

                      {hasAttachment && (
                        <div
                          className={`mt-2 rounded-lg border p-2 flex items-center gap-2 ${
                            isPatient
                              ? "bg-muted/40 border-border/80"
                              : "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                          }`}
                        >
                          <ImageIcon className="h-4 w-4 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-medium block truncate">
                              {attachmentName}
                            </span>
                            <span className="text-[9px] opacity-80 uppercase font-mono">
                              {attachmentType} attachment
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isPatient && (
                      <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-muted-foreground">
                        {msg.status === "Delivered" ? (
                          <>
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                            <span>Delivered to App</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                            <span>Sent</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Canned Responses Bar */}
            <div className="p-2 border-t border-border/70 bg-muted/20 flex items-center gap-1.5 overflow-x-auto">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />
              <span className="text-[10px] font-semibold text-muted-foreground shrink-0 uppercase tracking-wider">
                Quick Reply:
              </span>
              {QUICK_RESPONSES.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickResponse(qr)}
                  className="whitespace-nowrap rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-foreground hover:bg-accent transition-colors"
                >
                  {qr.length > 35 ? qr.substring(0, 35) + "..." : qr}
                </button>
              ))}
            </div>

            {/* Composer Box */}
            <div className="p-3 border-t border-border/70 bg-card space-y-2">
              <div className="relative">
                <Textarea
                  placeholder="Type secure medical advice, prescription notes, or consultation follow-up..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  className="text-xs resize-none pr-24"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!replyText.trim()}
                    className="h-7 text-xs gap-1 px-2.5"
                  >
                    <Send className="h-3 w-3" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
