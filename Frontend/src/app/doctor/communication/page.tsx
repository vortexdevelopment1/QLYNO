"use client";

import { useEffect, useMemo, useState } from "react";
import { Circle, Search, Send, UsersRound } from "lucide-react";
import { SectionHeading, Card, Avatar, Pill, EmptyState, SectionSkeleton, Skeleton } from "@/components/ui";
import { WorkplaceBadge } from "@/components/doctor-workflow";
import { useMode } from "@/lib/mode-context";
import { useDoctorWorkflow } from "@/lib/doctor-workflow-context";
import {
  getInternalContactsForScope,
  initialInternalThreads,
  InternalChatMessage,
  InternalContact,
  InternalContactScope,
} from "@/lib/internal-communication";
import { sendBackendMessage } from "@/lib/api-client";

const roleTone: Record<string, "brand" | "clay" | "sage" | "neutral"> = {
  Doctor: "brand",
  Nurse: "sage",
  "Charge Nurse": "sage",
  Pharmacist: "clay",
  "Lab Coordinator": "clay",
  "Radiology Coordinator": "clay",
  Receptionist: "neutral",
  Assistant: "neutral",
  "Duty Manager": "neutral",
  "Billing Staff": "neutral",
  "Lab/Pharmacy User": "clay",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
}

function contactMatchesQuery(contact: InternalContact, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [contact.name, contact.role, contact.team].some((value) => value.toLowerCase().includes(q));
}

export default function CommunicationPage() {
  const { selectedWorkplaceId, workContext } = useMode();
  const { activeShift, getWorkplace, isLoadingWorkflow, workplaces } = useDoctorWorkflow();
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<Record<string, InternalChatMessage[]>>({});
  const [syncMessage, setSyncMessage] = useState("");

  const selectedWorkplace = getWorkplace(selectedWorkplaceId);
  const activeWorkplace = selectedWorkplace ?? (activeShift ? getWorkplace(activeShift.workplaceId) : undefined);
  const scope: InternalContactScope = workContext === "hospital" || activeWorkplace?.type === "hospital" ? "hospital" : "clinic";

  const contacts = useMemo(
    () => getInternalContactsForScope(scope, activeWorkplace),
    [activeWorkplace, scope]
  );

  useEffect(() => {
    setThreads((current) => ({ ...initialInternalThreads(contacts), ...current }));
    setActiveId((current) => (contacts.some((contact) => contact.id === current) ? current : contacts[0]?.id ?? ""));
  }, [contacts]);

  const visibleContacts = contacts.filter((contact) => contactMatchesQuery(contact, query));
  const active = contacts.find((contact) => contact.id === activeId);
  const messages = active ? threads[active.id] ?? [] : [];

  if (isLoadingWorkflow) {
    return (
      <div>
        <SectionSkeleton action={false} />
        <Card padded={false} className="overflow-hidden">
          <div className="grid h-[600px] grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col md:col-span-2">
              <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              </div>
              <div className="flex-1 space-y-3 px-5 py-4">
                <Skeleton className="h-16 w-2/3 rounded-2xl" />
                <Skeleton className="ml-auto h-14 w-1/2 rounded-2xl" />
                <Skeleton className="h-20 w-3/4 rounded-2xl" />
              </div>
            </div>
            <div className="border-t border-line md:border-l md:border-t-0">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3 border-b border-line/70 px-4 py-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-2 h-3 w-full" />
                    <Skeleton className="mt-2 h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  async function send() {
    if (!active || !draft.trim()) return;
    const outgoingText = draft.trim();
    const nextMessage: InternalChatMessage = { from: "me", text: outgoingText, time: "Now" };

    setDraft("");
    setThreads((current) => ({
      ...current,
      [active.id]: [...(current[active.id] ?? []), nextMessage],
    }));

    try {
      await sendBackendMessage({
        workplaceId: selectedWorkplaceId,
        title: active.name,
        body: outgoingText,
      });
      setSyncMessage("Message synced to backend.");
    } catch {
      setSyncMessage("Backend sync failed; local staff message kept.");
    }
  }

  return (
    <div>
      <SectionHeading
        eyebrow="14 - Communication"
        title="Communication"
        description={
          scope === "hospital"
            ? "Collaborate with hospital nurses, departments, doctors and operations staff for the selected hospital."
            : "Collaborate with clinic reception, nurses, assistants and lab/pharmacy staff for the selected clinic."
        }
        action={<WorkplaceBadge workplace={activeWorkplace ?? workplaces[0]} />}
      />
      {syncMessage && <p className="mb-3 text-xs text-ink-muted">{syncMessage}</p>}

      <Card padded={false} className="overflow-hidden">
        <div className="grid min-h-[620px] grid-cols-1 md:grid-cols-3">
          <div className="flex flex-col md:col-span-2">
            {!active ? (
              <EmptyState title="Select a staff member" description="Choose a doctor, nurse or hospital team to start messaging." />
            ) : (
              <>
                <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
                  <Avatar initials={initials(active.name)} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{active.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <Circle
                        size={7}
                        className={active.status === "Online" ? "fill-sage-400 text-sage-400" : "fill-clay-400 text-clay-400"}
                      />
                      {active.role} - {active.team}
                    </p>
                  </div>
                  <div className="hidden items-center gap-1.5 text-xs text-ink-muted sm:flex">
                    <UsersRound size={14} />
                    {scope === "hospital" ? "Hospital" : "Clinic"}
                  </div>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {messages.map((message, index) => (
                    <div key={`${message.time}-${index}`} className={`flex ${message.from === "me" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                          message.from === "me"
                            ? "rounded-br-sm bg-brand-500 text-white"
                            : "rounded-bl-sm bg-paper text-ink-soft"
                        }`}
                      >
                        {message.text}
                        <span className={`mt-1 block text-[10px] ${message.from === "me" ? "text-white/70" : "text-ink-faint"}`}>
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-line px-4 py-3">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void send();
                    }}
                    placeholder={`Message ${active.name}`}
                    className="input-field"
                  />
                  <button onClick={() => void send()} className="btn-primary shrink-0" aria-label="Send message">
                    <Send size={14} />
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="border-t border-line md:border-l md:border-t-0">
            <div className="border-b border-line p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
                  {scope === "hospital" ? "Hospital Staff" : "Clinic Staff"}
                </p>
                <Pill tone="neutral">{contacts.length}</Pill>
              </div>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search staff or team"
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {visibleContacts.length === 0 ? (
                <EmptyState title="No staff found" description="Try another name, role or department." />
              ) : (
                visibleContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveId(contact.id)}
                    className={`w-full border-b border-line/70 px-4 py-3 text-left transition-colors ${
                      activeId === contact.id ? "bg-brand-50" : "hover:bg-paper"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar initials={initials(contact.name)} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13px] font-medium text-ink">{contact.name}</p>
                          {contact.unread ? (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                              {contact.unread}
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-ink-muted">{contact.lastMessage}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Pill tone={roleTone[contact.role] ?? "neutral"}>{contact.role}</Pill>
                          <span className="text-[10px] text-ink-faint">{contact.time}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}
