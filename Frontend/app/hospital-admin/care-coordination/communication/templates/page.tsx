"use client";

import { useState } from "react";
import {
  BookTemplate,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { CommunicationNav } from "@/hospital-admin/components/care-coordination/communication/communication-nav";
import { CreateTemplateModal } from "@/hospital-admin/components/care-coordination/communication/CreateTemplateModal";
import { mockMessageTemplates } from "@/hospital-admin/lib/mock-data/communication-hub";
import { MessageTemplate } from "@/hospital-admin/lib/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockMessageTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = templates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.templateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || tpl.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Shared Library
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Message Templates
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Standardized multi-channel templates with token substitution for appointments, reports, recalls, and broadcasts.
            </p>
          </div>
          <Button size="sm" onClick={() => setIsOpen(true)} className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Create Template
          </Button>
        </div>
      </div>

      <CommunicationNav unreadChatCount={3} activeBroadcastCount={1} pendingRemindersCount={8} />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Templates
              </CardTitle>
              <BookTemplate className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">
                {templates.filter((t) => t.status === "Active").length}
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground">Approved for live dispatch</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </CardTitle>
              <BookTemplate className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">5</span>
              <p className="mt-1 text-[11px] text-muted-foreground">Appointment, Report, Follow-up, Broadcast, Clinical</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lifetime Sends
              </CardTitle>
              <BookTemplate className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">
                {templates.reduce((sum, t) => sum + (t.usageCount ?? 0), 0).toLocaleString()}
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground">Across WhatsApp, SMS, and PA channels</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookTemplate className="h-4 w-4 text-slate-600" />
                  Template Library
                </CardTitle>
                <CardDescription className="text-xs">
                  Tokens such as {"{{patient_name}}"} are substituted at dispatch time.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, ID, content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All categories</SelectItem>
                    <SelectItem value="Appointment" className="text-xs">Appointment</SelectItem>
                    <SelectItem value="Report" className="text-xs">Report</SelectItem>
                    <SelectItem value="Follow-up" className="text-xs">Follow-up</SelectItem>
                    <SelectItem value="Broadcast" className="text-xs">Broadcast</SelectItem>
                    <SelectItem value="Clinical" className="text-xs">Clinical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Template</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Tokens</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                        No templates match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((tpl) => (
                      <tr key={tpl.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{tpl.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{tpl.templateId}</div>
                          <div className="mt-1 max-w-lg text-[11px] text-muted-foreground line-clamp-2">
                            {tpl.content}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">{tpl.category}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-[10px]">{tpl.channel}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {tpl.variables.map((v) => (
                              <Badge key={v} variant="outline" className="text-[10px] font-mono">
                                {`{{${v}}}`}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              tpl.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]"
                                : "text-[10px]"
                            }
                            variant={tpl.status === "Active" ? "outline" : "secondary"}
                          >
                            {tpl.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                          {(tpl.usageCount ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateTemplateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onTemplateCreated={(template) => setTemplates((prev) => [template, ...prev])}
      />
    </div>
  );
}
