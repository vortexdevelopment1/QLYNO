"use client";

import { useSelector } from "react-redux";
import Link from "next/link";
import { ArrowLeft, Truck, PackageCheck, AlertCircle, Clock } from "lucide-react";

import { RootState } from "@/hospital-admin/store/store";
import { Button } from "@/hospital-admin/components/ui/button";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { DeliveryStatus } from "@/hospital-admin/store/slices/procurementSlice";

const COLUMN_DEF: { status: DeliveryStatus, title: string, icon: any, color: string }[] = [
  { status: 'Dispatched', title: 'Dispatched', icon: Truck, color: 'text-primary' },
  { status: 'Delayed', title: 'Delayed', icon: Clock, color: 'text-warning-foreground' },
  { status: 'Delivered', title: 'Delivered', icon: PackageCheck, color: 'text-success' },
  { status: 'Rejected', title: 'Rejected', icon: AlertCircle, color: 'text-destructive' },
  { status: 'Received', title: 'Received & Quality Passed', icon: PackageCheck, color: 'text-success' },
];

export default function DeliveryTrackingPage() {
  const requests = useSelector((state: RootState) => state.procurement.requests.filter(r => r.delivery));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hospital-admin/procurement">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="Delivery Tracking Board"
          description="Track incoming purchase orders and their fulfillment status."
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {COLUMN_DEF.map(col => {
          const colRequests = requests.filter(r => r.delivery?.status === col.status);
          
          return (
            <div key={col.status} className="bg-muted/30 rounded-xl p-4 flex-shrink-0 w-80 flex flex-col border border-border/50">
              <div className="flex items-center gap-2 mb-4 font-semibold text-foreground border-b pb-2">
                <col.icon className={`h-5 w-5 ${col.color}`} />
                {col.title}
                <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {colRequests.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colRequests.map(req => (
                  <Card key={req.id} className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/hospital-admin/procurement/${req.id}`} className="font-semibold text-primary hover:underline">
                          {req.id}
                        </Link>
                        {req.urgency === 'Critical' && <span className="text-[10px] uppercase font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">Critical</span>}
                      </div>
                      <div className="font-medium text-sm mb-1">{req.item}</div>
                      <div className="text-xs text-muted-foreground mb-3">{req.department}</div>
                      
                      {req.purchaseOrder && (
                        <div className="text-xs bg-muted/50 p-2 rounded flex justify-between">
                          <span>PO: {req.purchaseOrder.id}</span>
                          <span className="font-medium text-foreground">${req.purchaseOrder.totalAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {colRequests.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg border-muted">
                    No orders
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
