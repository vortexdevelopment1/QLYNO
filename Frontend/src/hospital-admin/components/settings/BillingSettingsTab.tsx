"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  DollarSign,
  Percent,
  Receipt,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Save,
  ExternalLink,
  Wallet,
  Building,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export function BillingSettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [billingConfig, setBillingConfig] = useState({
    defaultCurrency: "INR",
    taxType: "GST",
    defaultGstPercent: "18",
    gstinNumber: "27AABCQ1234F1Z8",
    panNumber: "AABCQ1234F",
    invoicePrefix: "INV-2026-",
    startingInvoiceSeq: "10001",
    paymentTermsDays: "0", // 0 = Immediate / Due on Receipt
    maxDoctorDiscountPercent: "10",
    requireAdminDiscountApprovalAbovePercent: "15",
    allowPartialPayments: true,
    enableUpiQrAtCounter: true,
    enableRazorpayGateway: true,
    enableCardPosTerminals: true,
    enableTpaDirectCashlessSettlement: true,
    allowZeroDepositEmergencyAdmission: true,
  });

  const handleChange = (key: string, value: any) => {
    setBillingConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Billing & Financial Settings Saved",
        description: "Tax rates, payment gateways, and invoice numbering updated.",
      });
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Currency, Tax & Legal Identification */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Receipt className="h-5 w-5 text-primary" /> Currency, Tax &amp; Invoicing Config
            </CardTitle>
            <CardDescription className="text-xs">
              Define standard accounting currency, tax identifiers (GSTIN/PAN), and tax schedules.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs font-semibold">
            <Link href="/hospital-admin/billing">
              <ExternalLink className="h-3.5 w-3.5" /> Billing Console
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="defaultCurrency">Default Operating Currency</Label>
              <Select
                value={billingConfig.defaultCurrency}
                onValueChange={(v) => handleChange("defaultCurrency", v)}
              >
                <SelectTrigger id="defaultCurrency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                  <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  <SelectItem value="AED">AED (د.إ) - UAE Dirham</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="taxType">Tax Regime / Model</Label>
              <Select
                value={billingConfig.taxType}
                onValueChange={(v) => handleChange("taxType", v)}
              >
                <SelectTrigger id="taxType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GST">GST (Goods &amp; Services Tax - India)</SelectItem>
                  <SelectItem value="VAT">VAT (Value Added Tax)</SelectItem>
                  <SelectItem value="EXEMPT">Healthcare Tax Exempt (0%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="defaultGstPercent">Default Service Tax / GST Rate (%)</Label>
              <Input
                id="defaultGstPercent"
                type="number"
                min={0}
                max={28}
                value={billingConfig.defaultGstPercent}
                onChange={(e) => handleChange("defaultGstPercent", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="gstinNumber">Hospital GSTIN Registration Number</Label>
              <Input
                id="gstinNumber"
                className="font-mono uppercase"
                value={billingConfig.gstinNumber}
                onChange={(e) => handleChange("gstinNumber", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="panNumber">PAN / Tax Identification Number</Label>
              <Input
                id="panNumber"
                className="font-mono uppercase"
                value={billingConfig.panNumber}
                onChange={(e) => handleChange("panNumber", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Automated Invoice Numbering & Payment Terms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-5 w-5 text-primary" /> Invoice Sequencing &amp; Payment Terms
          </CardTitle>
          <CardDescription className="text-xs">
            Standard sequential numbering schemes and payment maturity rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="invoicePrefix">Invoice Code Prefix</Label>
              <Input
                id="invoicePrefix"
                value={billingConfig.invoicePrefix}
                onChange={(e) => handleChange("invoicePrefix", e.target.value)}
                className="font-mono"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="startingInvoiceSeq">Current Sequence Number</Label>
              <Input
                id="startingInvoiceSeq"
                value={billingConfig.startingInvoiceSeq}
                onChange={(e) => handleChange("startingInvoiceSeq", e.target.value)}
                className="font-mono"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="paymentTermsDays">Payment Due Terms</Label>
              <Select
                value={billingConfig.paymentTermsDays}
                onValueChange={(v) => handleChange("paymentTermsDays", v)}
              >
                <SelectTrigger id="paymentTermsDays">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Due on Receipt (Immediate)</SelectItem>
                  <SelectItem value="7">Net 7 Days</SelectItem>
                  <SelectItem value="15">Net 15 Days</SelectItem>
                  <SelectItem value="30">Net 30 Days (Corporate / TPA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Allow Partial Deposit &amp; Milestone Billing</p>
              <p className="text-xs text-muted-foreground">
                Enables recording running advance deposits for inpatient (IPD) surgeries and ICU admissions.
              </p>
            </div>
            <Switch
              checked={billingConfig.allowPartialPayments}
              onCheckedChange={(c) => handleChange("allowPartialPayments", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Payment Channels & Gateways */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CreditCard className="h-5 w-5 text-primary" /> Active Payment Collection Channels
          </CardTitle>
          <CardDescription className="text-xs">
            Toggle integrated payment methods available at billing counters and patient online portals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Dynamic UPI QR Code on Counter Screen</p>
              <p className="text-xs text-muted-foreground">
                Generates instant amount-tagged BharatPe/BHIM UPI QR for patient mobile scanning.
              </p>
            </div>
            <Switch
              checked={billingConfig.enableUpiQrAtCounter}
              onCheckedChange={(c) => handleChange("enableUpiQrAtCounter", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Online Payment Gateway (Razorpay / Stripe)</p>
              <p className="text-xs text-muted-foreground">
                Allows online appointment advance payments and teleconsultation fee settlement.
              </p>
            </div>
            <Switch
              checked={billingConfig.enableRazorpayGateway}
              onCheckedChange={(c) => handleChange("enableRazorpayGateway", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">TPA / Insurance Direct Cashless Desk</p>
              <p className="text-xs text-muted-foreground">
                Routes insured patient pre-authorization claims directly into insurer clearinghouse.
              </p>
            </div>
            <Switch
              checked={billingConfig.enableTpaDirectCashlessSettlement}
              onCheckedChange={(c) => handleChange("enableTpaDirectCashlessSettlement", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Discount Authority & Emergency Waivers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Percent className="h-5 w-5 text-primary" /> Discount Limits &amp; Emergency Waiver Authority
          </CardTitle>
          <CardDescription className="text-xs">
            Multi-tiered approval thresholds for financial concessions and emergency zero-deposit admission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="maxDoctorDiscountPercent">Doctor Direct Discretionary Discount Cap (%)</Label>
              <Input
                id="maxDoctorDiscountPercent"
                type="number"
                min={0}
                max={50}
                value={billingConfig.maxDoctorDiscountPercent}
                onChange={(e) => handleChange("maxDoctorDiscountPercent", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="requireAdminDiscountApprovalAbovePercent">
                Medical Director / Super-Admin Approval Required Above (%)
              </Label>
              <Input
                id="requireAdminDiscountApprovalAbovePercent"
                type="number"
                min={1}
                max={100}
                value={billingConfig.requireAdminDiscountApprovalAbovePercent}
                onChange={(e) => handleChange("requireAdminDiscountApprovalAbovePercent", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Zero-Deposit Emergency Inpatient Admission</p>
              <p className="text-xs text-muted-foreground">
                Mandates immediate ICU/trauma bed admission without upfront payment block, per regulatory guidelines.
              </p>
            </div>
            <Switch
              checked={billingConfig.allowZeroDepositEmergencyAdmission}
              onCheckedChange={(c) => handleChange("allowZeroDepositEmergencyAdmission", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Save Billing Settings
        </Button>
      </div>
    </form>
  );
}
