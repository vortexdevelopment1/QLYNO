"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { 
  ArrowLeft, FileText, CheckCircle2, AlertCircle, ShoppingCart, 
  Truck, Search, FileSignature, Download, PackageCheck, RotateCcw
} from "lucide-react";

import { RootState } from "@/hospital-admin/store/store";
import { 
  updateRequestStatus, addQuote, selectQuote, shortlistQuote, approveOrRejectStep, 
  generatePO, updateDeliveryStatus, recordQualityCheck, restartQuoteRound 
} from "@/hospital-admin/store/slices/procurementSlice";

import { Button } from "@/hospital-admin/components/ui/button";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Label } from "@/hospital-admin/components/ui/label";
import { Input } from "@/hospital-admin/components/ui/input";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/hospital-admin/components/ui/dialog";
import { QuoteComparisonView } from "@/hospital-admin/components/procurement/QuoteComparisonView";

export default function ProcurementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const request = useSelector((state: RootState) => state.procurement.requests.find(r => r.id === id));
  const vendors = useSelector((state: RootState) => state.procurement.vendors);

  const [activeTab, setActiveTab] = useState("overview");

  // Local state for forms
  const [newQuote, setNewQuote] = useState({ vendorId: "", price: "", availability: "In Stock", deliveryTimelineDays: "3" });
  const [qcNotes, setQcNotes] = useState("");
  const [showPOPreview, setShowPOPreview] = useState(false);

  if (!request) {
    return <div className="p-8 text-center text-muted-foreground">Procurement Request not found.</div>;
  }

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.vendorId || !newQuote.price) return;
    dispatch(addQuote({
      reqId: request.id,
      quote: {
        vendorId: newQuote.vendorId,
        price: Number(newQuote.price),
        availability: newQuote.availability,
        deliveryTimelineDays: Number(newQuote.deliveryTimelineDays)
      },
      actor: "Procurement Admin"
    }));
    toast({ title: "Vendor Quote Received", description: "Procurement/Admin reviewer notified." });
    setNewQuote({ vendorId: "", price: "", availability: "In Stock", deliveryTimelineDays: "3" });
  };

  const handleApproveStep = (stepId: string, decision: 'approve'|'reject') => {
    dispatch(approveOrRejectStep({ reqId: request.id, stepId, decision, actor: "Authorized Signatory" }));
    toast({ title: `Step ${decision === 'approve' ? 'Approved' : 'Rejected'}` });
  };

  const handleGeneratePO = () => {
    dispatch(generatePO({ reqId: request.id, actor: "Procurement Admin" }));
    toast({ title: "Purchase Order Generated", description: "Order has been dispatched." });
    setShowPOPreview(false);
    setActiveTab("order");
  };

  const handleQualityCheck = (passed: boolean) => {
    dispatch(recordQualityCheck({ reqId: request.id, passed, notes: qcNotes, actor: "Inventory Manager" }));
    toast({ 
      title: passed ? "Quality Check Passed" : "Delivery Rejected", 
      variant: passed ? "default" : "destructive" 
    });
  };

  const handleRestartQuotes = () => {
    dispatch(restartQuoteRound({ reqId: request.id, actor: "Procurement Admin" }));
    toast({ title: "Quote Round Restarted", description: "Request moved back to Quotes Collecting." });
    setActiveTab("quotes");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/hospital-admin/procurement">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader
            title={`Request ${request.id}`}
            description={request.item}
          />
        </div>
        <Badge variant={request.status === 'Closed' ? 'secondary' : 'default'} className="text-sm px-3 py-1">
          {request.status}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 h-auto">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="discovery" className="text-xs">Discovery</TabsTrigger>
          <TabsTrigger value="quotes" className="text-xs">
            Quotes {request.quotes.length > 0 && `(${request.quotes.length})`}
          </TabsTrigger>
          <TabsTrigger value="approval" className="text-xs">Approval</TabsTrigger>
          <TabsTrigger value="order" className="text-xs" disabled={!request.purchaseOrder}>Order</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs" disabled={!request.delivery}>Delivery</TabsTrigger>
          <TabsTrigger value="quality" className="text-xs" disabled={request.delivery?.status !== 'Delivered' && !request.qualityCheck}>Quality</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">Audit</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Core Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div><span className="text-muted-foreground text-sm block">Item</span><span className="font-medium">{request.item}</span></div>
                  <div><span className="text-muted-foreground text-sm block">Specification</span><span className="text-sm">{request.spec}</span></div>
                  <div><span className="text-muted-foreground text-sm block">Category</span><span className="text-sm capitalize">{request.category}</span></div>
                  <div><span className="text-muted-foreground text-sm block">Urgency</span><Badge variant={request.urgency === 'Critical' ? 'destructive' : 'secondary'}>{request.urgency}</Badge></div>
                </div>
                <div className="space-y-4">
                  <div><span className="text-muted-foreground text-sm block">Requester</span><span className="font-medium">{request.requester}</span></div>
                  <div><span className="text-muted-foreground text-sm block">Department</span><span className="text-sm">{request.department}</span></div>
                  <div>
                    <span className="text-muted-foreground text-sm block">Linked Surgical Case</span>
                    {request.linkedCaseId ? (
                      <Link href={`/hospital-admin/surgical-cases`} className="text-sm text-primary hover:underline">
                        {request.linkedCaseId} (Dependency)
                      </Link>
                    ) : <span className="text-sm text-muted-foreground">None</span>}
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm block">Linked Patient</span>
                    {request.linkedPatientId ? <span className="text-sm">{request.linkedPatientId}</span> : <span className="text-sm text-muted-foreground">None</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VENDOR DISCOVERY TAB */}
          <TabsContent value="discovery">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vendor Network</CardTitle>
                  <CardDescription>Browse approved vendors matching this category: <strong className="capitalize">{request.category}</strong></CardDescription>
                </div>
                <Button variant="outline" onClick={() => toast({ title: "Vendor Registration Triggered", description: "This would open the onboarding workflow." })}>
                  Manually Add Vendor
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {vendors.filter(v => v.category.includes(request.category)).map(v => (
                    <div key={v.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Reliability: {v.reliabilityScore}/100 · Avg Delay: {v.averageDelayDays} days
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("quotes")}>Request Quote</Button>
                    </div>
                  ))}
                  {vendors.filter(v => v.category.includes(request.category)).length === 0 && (
                    <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                      No approved vendors in this category.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUOTES TAB */}
          <TabsContent value="quotes">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Quote Comparison</CardTitle>
                  <CardDescription>Side-by-side comparison of received quotes and commercial terms.</CardDescription>
                </CardHeader>
                <CardContent>
                  <QuoteComparisonView 
                    quotes={request.quotes} 
                    vendors={vendors} 
                    requestStatus={request.status} 
                    onSelectQuote={(quoteId) => dispatch(selectQuote({ reqId: request.id, quoteId, actor: "Admin" }))} 
                    onShortlistQuote={(quoteId) => dispatch(shortlistQuote({ reqId: request.id, quoteId, actor: "Admin" }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Enter New Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddQuote} className="space-y-4">
                    <div className="grid gap-1.5">
                      <Label>Vendor</Label>
                      <Select value={newQuote.vendorId} onValueChange={v => setNewQuote({...newQuote, vendorId: v})}>
                        <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                        <SelectContent>
                          {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Price ($)</Label>
                      <Input type="number" required value={newQuote.price} onChange={e => setNewQuote({...newQuote, price: e.target.value})} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Availability</Label>
                      <Input required value={newQuote.availability} onChange={e => setNewQuote({...newQuote, availability: e.target.value})} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Delivery Timeline (Days)</Label>
                      <Input type="number" required value={newQuote.deliveryTimelineDays} onChange={e => setNewQuote({...newQuote, deliveryTimelineDays: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full">Save Quote</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* APPROVAL TAB */}
          <TabsContent value="approval">
            <Card>
              <CardHeader>
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>Sequential sign-offs required to finalize the selected quote.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {request.approvals.map((step, idx) => (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step.decision === 'approve' ? 'bg-success/20 text-success' : step.decision === 'reject' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {step.decision === 'approve' ? <CheckCircle2 className="h-5 w-5" /> : step.decision === 'reject' ? <AlertCircle className="h-5 w-5" /> : <FileSignature className="h-5 w-5" />}
                        </div>
                        {idx !== request.approvals.length - 1 && <div className="w-0.5 h-full bg-border my-2" />}
                      </div>
                      <div className="pb-6">
                        <div className="font-medium text-lg">{step.role}</div>
                        {step.decision ? (
                          <div className="text-sm mt-1 text-muted-foreground">
                            {step.decision === 'approve' ? 'Approved' : 'Rejected'} by {step.approver} on {new Date(step.timestamp!).toLocaleString()}
                          </div>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" className="border-success text-success hover:bg-success/10" onClick={() => handleApproveStep(step.id, 'approve')}>Approve</Button>
                            <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleApproveStep(step.id, 'reject')}>Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {request.status === 'Approved' && !request.purchaseOrder && (
                    <div className="pt-6 border-t">
                      <Button onClick={() => setShowPOPreview(true)}><ShoppingCart className="mr-2 h-4 w-4" /> Preview & Generate PO</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORDER TAB */}
          <TabsContent value="order">
            {request.purchaseOrder && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="border-b bg-muted/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">Purchase Order</CardTitle>
                      <CardDescription>#{request.purchaseOrder.id}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Generated</span>
                      <span className="font-medium">{new Date(request.purchaseOrder.generatedAt).toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block mb-1">Total Amount</span>
                      <span className="text-2xl font-bold">${request.purchaseOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t text-sm">
                    <span className="text-muted-foreground block mb-1">Vendor</span>
                    <span className="font-medium">{vendors.find(v => v.id === request.quotes.find(q=>q.status==='Selected')?.vendorId)?.name}</span>
                  </div>
                  <div className="pt-4 border-t flex justify-end">
                    <Button variant="secondary" onClick={() => setActiveTab("delivery")}>View Delivery Status</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* DELIVERY TAB */}
          <TabsContent value="delivery">
            {request.delivery && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-8">
                    {/* Visual Tracker */}
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
                      {['Dispatched', 'Delayed', 'Delivered', 'Received'].map((step, idx) => {
                        const statusArray = ['Dispatched', 'Delayed', 'Delivered', 'Received'];
                        let activeIdx = statusArray.indexOf(request.delivery!.status);
                        if (request.delivery!.status === 'Rejected') activeIdx = 1; // Show rejected roughly near delayed visually
                        
                        const isPast = idx <= activeIdx;
                        const isCurrent = idx === activeIdx;

                        return (
                          <div key={step} className="flex flex-col items-center gap-2 bg-card px-2">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center border-4 border-card ${isCurrent ? 'bg-primary text-primary-foreground' : isPast ? 'bg-primary/50' : 'bg-muted text-muted-foreground'}`}>
                              {isPast && !isCurrent ? <CheckCircle2 className="h-4 w-4 text-white" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                            </div>
                            <span className={`text-xs font-medium ${isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2">Current Status</div>
                      <div className="text-3xl font-bold text-primary flex items-center gap-3">
                        <Truck className="h-8 w-8" />
                        {request.delivery.status}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">Last Updated: {new Date(request.delivery.updatedAt).toLocaleString()}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {['Dispatched', 'Delayed', 'Delivered'].map(s => (
                        <Button 
                          key={s} 
                          variant={request.delivery?.status === s ? 'default' : 'outline'} 
                          onClick={() => {
                            dispatch(updateDeliveryStatus({ reqId: request.id, status: s as any, actor: "Logistics" }));
                            if (s === 'Delayed') {
                              toast({ title: "Vendor Delivery Delayed", description: "Notified Request Owner & Department Head.", variant: "destructive" });
                            } else {
                              toast({ title: "Delivery Status Updated" });
                            }
                          }}
                        >
                          Mark {s}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {request.delivery.status === 'Rejected' && (
                    <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-destructive flex items-center gap-2"><AlertCircle className="h-5 w-5"/> Delivery Rejected</div>
                        <div className="text-sm text-destructive/80 mt-1">This order failed quality inspection. You can restart the quote round to re-order.</div>
                      </div>
                      <Button variant="destructive" onClick={handleRestartQuotes}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Restart Quote Round
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* QUALITY CHECK TAB */}
          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle>Quality Inspection</CardTitle>
                <CardDescription>Required upon delivery before releasing payment to vendor.</CardDescription>
              </CardHeader>
              <CardContent>
                {request.qualityCheck ? (
                  <div className={`p-6 border rounded-lg ${request.qualityCheck.passed ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      {request.qualityCheck.passed ? <CheckCircle2 className="h-8 w-8 text-success" /> : <AlertCircle className="h-8 w-8 text-destructive" />}
                      <div>
                        <div className={`text-xl font-bold ${request.qualityCheck.passed ? 'text-success' : 'text-destructive'}`}>
                          {request.qualityCheck.passed ? 'Inspection Passed' : 'Inspection Failed'}
                        </div>
                        <div className="text-sm text-muted-foreground">Checked by {request.qualityCheck.checkedBy} on {new Date(request.qualityCheck.checkedAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium block mb-1">Inspection Notes:</span>
                      {request.qualityCheck.notes || 'No notes provided.'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-xl">
                    <div className="grid gap-1.5">
                      <Label>Inspection Notes</Label>
                      <Textarea value={qcNotes} onChange={e => setQcNotes(e.target.value)} placeholder="Enter details about physical condition, spec compliance, etc." />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button className="w-full bg-success hover:bg-success/90" onClick={() => handleQualityCheck(true)}>
                        <PackageCheck className="mr-2 h-4 w-4" /> Pass Inspection
                      </Button>
                      <Button className="w-full" variant="destructive" onClick={() => handleQualityCheck(false)}>
                        <AlertCircle className="mr-2 h-4 w-4" /> Fail & Reject Delivery
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AUDIT TAB */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Actor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {request.auditLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.actor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

        </div>
      </Tabs>

      <Dialog open={showPOPreview} onOpenChange={setShowPOPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Purchase Order</DialogTitle>
            <DialogDescription>Review details before dispatching the PO to the vendor.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground text-sm">Item</span>
              <span className="font-medium">{request.item}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground text-sm">Category</span>
              <span className="font-medium capitalize">{request.category}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground text-sm">Vendor</span>
              <span className="font-medium">{vendors.find(v => v.id === request.quotes.find(q=>q.status==='Selected')?.vendorId)?.name}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground text-sm">Total Authorized</span>
              <span className="text-xl font-bold">${request.quotes.find(q=>q.status==='Selected')?.price.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPOPreview(false)}>Cancel</Button>
            <Button onClick={handleGeneratePO}>Confirm & Generate PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
