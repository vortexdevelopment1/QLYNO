"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Info,
  Layers,
  Scale,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  InventoryItem,
  StockAdjustmentRecord,
  StockMovementRecord,
  AdjustmentType,
} from "@/hospital-admin/lib/types";
import { mockInventoryCatalogExtended } from "@/hospital-admin/lib/mock-data/inventory-extended";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface StockAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedItem?: InventoryItem | null;
  onSaveAdjustment: (
    adjustment: StockAdjustmentRecord,
    movement: StockMovementRecord
  ) => void;
}

const HIGH_VALUE_THRESHOLD = 25000; // ₹25,000

export function StockAdjustmentModal({
  open,
  onOpenChange,
  preselectedItem,
  onSaveAdjustment,
}: StockAdjustmentModalProps) {
  const { toast } = useToast();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItem?.id || mockInventoryCatalogExtended[0]?.id || ""
  );
  const [adjustmentType, setAdjustmentType] =
    useState<AdjustmentType>("Physical Count Correction");
  const [adjustedStock, setAdjustedStock] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [authorizedBy, setAuthorizedBy] = useState<string>(
    "Vikram Sengupta (Hospital Admin)"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  const currentItem =
    mockInventoryCatalogExtended.find((i) => i.id === selectedItemId) ||
    mockInventoryCatalogExtended[0];

  useEffect(() => {
    if (preselectedItem) {
      setSelectedItemId(preselectedItem.id);
      setAdjustedStock(preselectedItem.stockLevel);
    } else if (currentItem) {
      setAdjustedStock(currentItem.stockLevel);
    }
    setReason("");
    setNotes("");
    setErrorMsg("");
  }, [open, preselectedItem]);

  useEffect(() => {
    if (currentItem && !preselectedItem) {
      setAdjustedStock(currentItem.stockLevel);
    }
  }, [selectedItemId]);

  const previousStock = currentItem?.stockLevel || 0;
  const variance = adjustedStock - previousStock;
  const totalVarianceValue = Math.abs(variance) * (currentItem?.unitCost || 0);
  const isHighValue = totalVarianceValue > HIGH_VALUE_THRESHOLD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setErrorMsg("Mandatory: Justification reason must be provided (Rule F19-CANNOT-3).");
      return;
    }

    if (variance === 0) {
      setErrorMsg("Adjusted stock must be different from current system stock.");
      return;
    }

    const adjustmentNo = `ADJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const adjustmentId = `adj_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const requiresDualApproval = isHighValue;
    const approvalStatus = requiresDualApproval
      ? "Pending Dual Authorization"
      : "Approved";

    const newAdjustment: StockAdjustmentRecord = {
      id: adjustmentId,
      adjustmentNo,
      itemId: currentItem.id,
      itemCode: currentItem.itemCode,
      itemName: currentItem.name,
      category: currentItem.category,
      adjustmentType,
      previousStock,
      adjustedStock,
      variance,
      unit: currentItem.unit,
      unitCost: currentItem.unitCost,
      totalVarianceValue,
      reason: reason.trim(),
      authorizedBy: authorizedBy.trim(),
      timestamp,
      requiresDualApproval,
      approvalStatus,
      notes: notes.trim() || undefined,
    };

    const newMovement: StockMovementRecord = {
      id: `mov_${Date.now()}`,
      itemId: currentItem.id,
      itemCode: currentItem.itemCode,
      itemName: currentItem.name,
      category: currentItem.category,
      type: "Stock Adjustment",
      direction: variance > 0 ? "IN" : "OUT",
      quantity: Math.abs(variance),
      unit: currentItem.unit,
      sourceModule: "Physical Audit",
      referenceId: adjustmentNo,
      timestamp,
      performedBy: authorizedBy,
      notes: `${adjustmentType}: ${reason.trim()}`,
    };

    onSaveAdjustment(newAdjustment, newMovement);

    toast({
      title: requiresDualApproval
        ? "Adjustment Logged • Dual Authorization Required"
        : "Stock Adjusted Successfully",
      description: `${adjustmentNo} recorded for ${currentItem.name}. Stock updated to ${adjustedStock} ${currentItem.unit}.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Record Stock Adjustment</DialogTitle>
              <DialogDescription className="text-xs">
                Reconcile physical counts, record damage/expiry write-offs, or correct stock variances.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Item Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select SKU / Supply Item</Label>
            <Select
              value={selectedItemId}
              onValueChange={(val) => {
                setSelectedItemId(val);
                setErrorMsg("");
              }}
              disabled={!!preselectedItem}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Select an item to adjust" />
              </SelectTrigger>
              <SelectContent>
                {mockInventoryCatalogExtended.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    <span className="font-mono text-primary font-bold mr-1.5">[{item.itemCode}]</span>
                    <span>{item.name}</span>
                    <span className="text-muted-foreground ml-1.5">({item.stockLevel} {item.unit})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Stock vs Adjustment Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Adjustment Type</Label>
              <Select
                value={adjustmentType}
                onValueChange={(val: AdjustmentType) => setAdjustmentType(val)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physical Count Correction">Physical Count Correction</SelectItem>
                  <SelectItem value="Write-off: Damage">Write-off: Damage</SelectItem>
                  <SelectItem value="Write-off: Expiry">Write-off: Expiry</SelectItem>
                  <SelectItem value="Write-off: Shrinkage">Write-off: Shrinkage</SelectItem>
                  <SelectItem value="Positive Adjustment">Positive Adjustment (Found Stock)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Current System Stock</Label>
              <div className="h-9 px-3 rounded-md border border-input bg-muted/40 flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-foreground">{previousStock}</span>
                <span className="text-muted-foreground">{currentItem?.unit}</span>
              </div>
            </div>
          </div>

          {/* New Adjusted Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">New Adjusted Stock Level</Label>
              <Input
                type="number"
                min="0"
                className="text-xs h-9 font-mono"
                value={adjustedStock}
                onChange={(e) => {
                  setAdjustedStock(parseInt(e.target.value) || 0);
                  setErrorMsg("");
                }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Variance Output</Label>
              <div className="h-9 px-3 rounded-md border border-input bg-muted/40 flex items-center justify-between text-xs font-mono">
                <span
                  className={
                    variance > 0
                      ? "text-emerald-600 font-bold"
                      : variance < 0
                      ? "text-rose-600 font-bold"
                      : "text-muted-foreground"
                  }
                >
                  {variance > 0 ? `+${variance}` : variance} {currentItem?.unit}
                </span>
                <Badge
                  variant="outline"
                  className={
                    variance > 0
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                      : variance < 0
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                      : "text-[10px]"
                  }
                >
                  {variance > 0 ? "IN (+)" : variance < 0 ? "OUT (-)" : "NO CHANGE"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Financial Value Assessment */}
          <div className="p-3 rounded-md bg-muted/30 border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <div>
                <p className="font-semibold">Unit Cost: ₹{currentItem?.unitCost} / {currentItem?.unit}</p>
                <p className="text-[11px] text-muted-foreground">Total Financial Value of Variance:</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-foreground">₹{totalVarianceValue.toLocaleString("en-IN")}</p>
              {isHighValue ? (
                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">
                  Dual-Authorization Required (&gt; ₹25k)
                </Badge>
              ) : (
                <span className="text-[10px] text-emerald-600 font-medium">Standard Admin Approval</span>
              )}
            </div>
          </div>

          {/* Mandatory Reason Field (Rule F19-CANNOT-3) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Mandatory Justification Reason <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">Required by Audit Policy</span>
            </div>
            <Textarea
              placeholder="Provide clinical / operational reason (e.g., Damaged during transit, cycle count discrepancy, expired reagent quarantine)..."
              className="text-xs min-h-[70px] resize-none"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrorMsg("");
              }}
              required
            />
          </div>

          {/* Authorizing Admin & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Authorizing Staff</Label>
              <Input
                className="text-xs h-9"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reference Document / Incident #</Label>
              <Input
                placeholder="e.g. INC-2026-098 / GRN-442"
                className="text-xs h-9 font-mono"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {isHighValue ? "Submit for Dual Approval" : "Confirm & Commit Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
