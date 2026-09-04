"use client";

import { notFound, useParams } from "next/navigation";
import { Building2, Mail, Phone, ShieldCheck, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent } from "@/hospital-admin/components/ui/card";
import { Progress } from "@/hospital-admin/components/ui/progress";
import { Separator } from "@/hospital-admin/components/ui/separator";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { vendors } from "@/hospital-admin/lib/mock-data/vendors";
import { formatCurrency, formatDate, getInitials } from "@/hospital-admin/lib/utils";

export default function VendorDetailPage() {
  const params = useParams<{ id: string }>();
  const vendor = vendors.find((v) => v.id === params.id);
  if (!vendor) notFound();

  return (
    <div>
      <PageHeader
        title={vendor.name}
        crumbs={[{ label: "Vendors", href: "/hospital-admin/vendors" }, { label: vendor.name }]}
        actions={<Button>Message vendor</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar className="h-20 w-20 rounded-xl">
              <AvatarImage src={vendor.logoUrl} alt={vendor.name} className="rounded-xl" />
              <AvatarFallback className="rounded-xl text-lg">{getInitials(vendor.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-lg font-semibold">{vendor.name}</h2>
              <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={vendor.status} />
              {vendor.status === "verified" && (
                <Badge variant="info" dot>
                  <ShieldCheck className="h-3 w-3" /> KYC Verified
                </Badge>
              )}
            </div>
            <Separator />
            <div className="w-full space-y-3 text-left">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{vendor.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{vendor.serviceAreas.join(", ")}</span>
              </div>
            </div>
            <Separator />
            <div className="flex w-full flex-wrap gap-1.5">
              {vendor.categories.map((c) => (
                <Badge key={c} variant="muted">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="flex items-center gap-1 font-display text-xl font-semibold">
                  <Star className="h-4 w-4 fill-warning text-warning" /> {vendor.rating || "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Active Orders</p>
                <p className="font-display text-xl font-semibold">{vendor.activeOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Outstanding Payable</p>
                <p className="font-display text-xl font-semibold">{formatCurrency(vendor.outstandingPayable)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Vendor Since</p>
                <p className="font-display text-xl font-semibold">{formatDate(vendor.joinedOn, { year: "numeric", month: "short" })}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">On-time delivery rate</p>
                <p className="text-sm font-semibold text-foreground">{vendor.onTimeDeliveryRate}%</p>
              </div>
              <Progress value={vendor.onTimeDeliveryRate} />
              <p className="mt-2 text-xs text-muted-foreground">
                Vendor Reliability Score combines delivery, response time, disputes and compliance history.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Vendor access is tenant-isolated and enforced server-side — this vendor can only see its own
              organization&apos;s requests, quotes, orders and financial records, and receives only the minimum
              patient/case context required to fulfill a procurement requirement.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
