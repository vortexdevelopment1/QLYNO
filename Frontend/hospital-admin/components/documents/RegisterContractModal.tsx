"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Briefcase, CheckCircle2, Link2 } from "lucide-react";
import { ContractItem } from "@/hospital-admin/lib/types/documents";

interface RegisterContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (contract: ContractItem) => void;
}

export function RegisterContractModal({
  isOpen,
  onClose,
  onRegister,
}: RegisterContractModalProps) {
  const [title, setTitle] = useState("");
  const [contractCode, setContractCode] = useState("");
  const [contractType, setContractType] =
    useState<ContractItem["contractType"]>("Biomedical AMC/CMC");
  const [vendorName, setVendorName] = useState("GE Healthcare India Pvt Ltd");
  const [vendorId, setVendorId] = useState("ven-01");
  const [assetName, setAssetName] = useState("GE Revolution 128-Slice CT Scanner");
  const [assetId, setAssetId] = useState("asset-ct-01");
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2029-03-31");
  const [annualValue, setAnnualValue] = useState("2800000");
  const [paymentTerms, setPaymentTerms] = useState(
    "Quarterly in Advance upon Preventive Maintenance (PPM) sign-off"
  );
  const [slaUptimeCommitment, setSlaUptimeCommitment] = useState("98.5% Guaranteed Operational Uptime");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contractCode.trim()) return;

    const newContract: ContractItem = {
      id: `CTR-${Date.now()}`,
      contractCode,
      title,
      contractType,
      vendorId,
      vendorName,
      assetId: assetId || null,
      assetName: assetName || null,
      startDate,
      endDate,
      annualValue: parseFloat(annualValue) || 0,
      paymentTerms,
      renewalStatus: "Active",
      slaUptimeCommitment,
      documentId: `DOC-CTR-${Date.now()}`,
    };

    onRegister(newContract);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
              <Briefcase className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Register Vendor / AMC / Service Contract
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Links legal service agreements directly with Procurement (Module 11) and Assets (Module F20).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Contract Title <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3-Year Comprehensive AMC for MRI System"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Contract Code <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                placeholder="e.g. CTR-AMC-SIEM-2026"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Contract Classification
              </label>
              <Select
                value={contractType}
                onValueChange={(val) => setContractType(val as ContractItem["contractType"])}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Biomedical AMC/CMC">Biomedical AMC/CMC (Equipment Maintenance)</SelectItem>
                  <SelectItem value="Consumables Supply Agreement">Consumables Supply Agreement</SelectItem>
                  <SelectItem value="Pharmacy Purchase Agreement">Pharmacy Purchase Agreement</SelectItem>
                  <SelectItem value="Facility Service SLA">Facility Service SLA (Security / Housekeeping)</SelectItem>
                  <SelectItem value="TPA Insurance Agreement">TPA Insurance Cashless Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Annual Value (INR)
              </label>
              <Input
                type="number"
                value={annualValue}
                onChange={(e) => setAnnualValue(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Vendor Partner (Module 11)
              </label>
              <Input
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Linked Asset / Equipment (F20)
              </label>
              <Input
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Optional (e.g. CT Scanner)"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Effective Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Contract End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              SLA Uptime & Service Commitment
            </label>
            <Input
              value={slaUptimeCommitment}
              onChange={(e) => setSlaUptimeCommitment(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Payment Milestones & Terms
            </label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Register Contract Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
