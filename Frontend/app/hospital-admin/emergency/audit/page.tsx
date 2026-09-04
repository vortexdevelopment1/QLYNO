"use client";

import Link from "next/link";
import { ArrowLeft, Search, ShieldAlert, Clock, CheckCircle2, AlertTriangle, Download, FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { useState } from "react";

import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { RootState } from "@/hospital-admin/store/store";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Emergency workflow";

export default function EmergencyAuditPage() {
  const auditLogs = useSelector((state: RootState) => state.emergency.auditLogs);
  const cases = useSelector((state: RootState) => state.emergency.cases);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filteredLogs = auditLogs
    .filter(
      (log) =>
        log.caseId.toLowerCase().includes(search.toLowerCase()) ||
        log.actor.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleExport = () => {
    toast({
      title: "Audit Trail Exported",
      description: `Generated compliance log export for ${filteredLogs.length} events. (${DELEGATION_STRING})`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/hospital-admin/emergency">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader
            title="Emergency Audit Trail & SLA Metrics"
            description="Immutable record of alert receptions, acknowledgment latencies, escalations, and hand-off events."
            crumbs={[{ label: "Hospital Operations" }, { label: "Emergency Command" }, { label: "Audit" }]}
          />
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export Audit Log
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Emergency Audit Trail" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          <span>Full accountability log • Non-repudiation audit tracking</span>
        </div>
      </div>

      {/* Response-Time & Performance Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Time to Acknowledge</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">1m 45s</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Well within 5m critical SLA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">SLA Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">96.8%</p>
            <p className="text-xs text-muted-foreground mt-1">Across all priority categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Logged Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{cases.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Flow A & Flow B emergencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Escalation / Fallback Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">3.2%</p>
            <p className="text-xs text-muted-foreground mt-1">Re-routed to partner facilities</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              placeholder="Search by Case ID, Actor, or Action..."
              className="pl-9 h-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {filteredLogs.length} recorded events
          </Badge>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[170px]">Timestamp</TableHead>
                <TableHead className="w-[110px]">Case ID</TableHead>
                <TableHead className="w-[260px]">Actor / Authority</TableHead>
                <TableHead className="w-[240px]">Action Log</TableHead>
                <TableHead>Event Details & Context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap" suppressHydrationWarning>
                    {formatDateTime(log.timestamp)}
                  </TableCell>
                  <TableCell className="font-semibold text-xs">
                    <Link href={`/hospital-admin/emergency/${log.caseId}`} className="text-primary hover:underline font-mono">
                      {log.caseId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {log.actor}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {log.action}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.details || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    No matching audit records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
