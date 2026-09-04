"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Progress } from "@/hospital-admin/components/ui/progress";
import Link from "next/link";
import { ArrowLeft, Stethoscope, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";

export default function SurgeonReliabilityPage() {
  const { surgeons } = useSelector((state: RootState) => state.surgical);
  const externalSurgeons = surgeons.filter(s => !s.isInternal);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hospital-admin/surgical-cases">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surgeon Network Reliability</h1>
          <p className="text-muted-foreground">Track response times and case history for external surgeons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Surgeons</CardTitle>
            <CardDescription>Performance metrics for all external affiliated surgeons.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Surgeon</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Reliability Score</TableHead>
                  <TableHead>Avg Response Time</TableHead>
                  <TableHead>Completed Cases</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {externalSurgeons.map(surgeon => (
                  <TableRow key={surgeon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <span className="font-medium">{surgeon.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{surgeon.id}</div>
                    </TableCell>
                    <TableCell>{surgeon.specialty}</TableCell>
                    <TableCell>
                      <Badge variant={surgeon.availability === 'Available' ? 'default' : 'secondary'}>
                        {surgeon.availability}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress value={surgeon.reliabilityScore} className="h-2" />
                        <span className="text-sm font-medium">{surgeon.reliabilityScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{surgeon.avgResponseTimeMins} mins</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{surgeon.acceptedCases}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {externalSurgeons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No external surgeons in the network.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
