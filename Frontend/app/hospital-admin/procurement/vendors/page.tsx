"use client";

import { useSelector } from "react-redux";
import Link from "next/link";
import { ArrowLeft, Star, Clock, AlertTriangle, Building2 } from "lucide-react";

import { RootState } from "@/hospital-admin/store/store";
import { Button } from "@/hospital-admin/components/ui/button";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Badge } from "@/hospital-admin/components/ui/badge";

export default function VendorNetworkPage() {
  const vendors = useSelector((state: RootState) => state.procurement.vendors);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hospital-admin/procurement">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="Vendor Network"
          description="Internal directory of approved hospital suppliers and their fulfillment reliability metrics."
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{vendors.length}</div>
              <div className="text-sm text-muted-foreground">Approved Vendors</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor ID & Name</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Reliability Score</TableHead>
              <TableHead>Fulfillment Rate</TableHead>
              <TableHead>Rejection Rate</TableHead>
              <TableHead>Avg. Delay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map(vendor => (
              <TableRow key={vendor.id}>
                <TableCell>
                  <div className="font-semibold">{vendor.name}</div>
                  <div className="text-xs text-muted-foreground">{vendor.id}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {vendor.category.map(cat => (
                      <Badge key={cat} variant="secondary" className="capitalize font-normal text-xs">{cat}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${vendor.reliabilityScore >= 90 ? 'text-success fill-success' : 'text-warning fill-warning'}`} />
                    <span className="font-medium">{vendor.reliabilityScore}/100</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${vendor.fulfillmentRate >= 95 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${vendor.fulfillmentRate}%` }} />
                    </div>
                    <span className="text-sm">{vendor.fulfillmentRate}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${vendor.rejectionRate > 3 ? 'text-destructive' : 'text-success'}`}>{vendor.rejectionRate}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    {vendor.averageDelayDays === 0 ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">On Time</Badge>
                    ) : (
                      <span className="flex items-center gap-1 text-warning-foreground">
                        <Clock className="h-3 w-3" /> {vendor.averageDelayDays} Days
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
