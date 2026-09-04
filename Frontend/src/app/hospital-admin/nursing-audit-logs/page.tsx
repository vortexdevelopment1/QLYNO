"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { RoleGate } from "@/hospital-admin/components/nursing/role-gate";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { Input } from "@/hospital-admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";

export default function NursingAuditLogsPage() {
  const { auditLogs, stations, currentRole } = useSelector((state: RootState) => state.nursingOperations);
  const [station, setStation] = useState("all");
  const [query, setQuery] = useState("");
  const logs = useMemo(() => auditLogs.filter((log) => (station === "all" || log.stationScope === station) && `${log.actor} ${log.action} ${log.entity}`.toLowerCase().includes(query.toLowerCase())), [auditLogs, station, query]);
  return <RoleGate allowed={["admin", "nurse_lead", "senior_nurse"]}>
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold tracking-tight">Nursing Audit Log</h1><p className="text-muted-foreground mt-1">Role-scoped workflow traceability across nursing stations.</p></div><ScopeIndicator scope={currentRole === "admin" ? "Hospital Admin" : "Station Lead"} /></div>
      <div className="flex flex-wrap gap-3 bg-background p-4 rounded-md border">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actor, action or entity..." className="max-w-xs" />
        <Select value={station} onValueChange={setStation}><SelectTrigger className="w-[240px]"><SelectValue placeholder="Filter by Station" /></SelectTrigger><SelectContent><SelectItem value="all">All Stations</SelectItem>{stations.map((item) => <SelectItem key={item.station_id} value={item.station_id}>{item.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="rounded-md border bg-background"><Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Changes</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader><TableBody>{logs.map((log) => <TableRow key={log.id}><TableCell className="font-medium text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell><TableCell>{log.actor}</TableCell><TableCell><span className="bg-muted px-2 py-1 rounded text-xs font-mono">{log.action}</span></TableCell><TableCell>{log.entity}</TableCell><TableCell className="text-xs"><div className="flex flex-col"><span className="text-muted-foreground line-through">{log.before}</span><span>{log.after}</span></div></TableCell><TableCell className="max-w-[240px] truncate" title={log.reason}>{log.reason}</TableCell></TableRow>)}</TableBody></Table></div>
    </div>
  </RoleGate>;
}
