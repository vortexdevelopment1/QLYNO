"use client";

import React, { useState } from "react";
import { Plus, Package, CheckCircle2 } from "lucide-react";
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
import { InventoryItem } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface AddConsumableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: InventoryItem["category"];
  onSaveItem: (item: InventoryItem) => void;
}

const REGISTERED_VENDORS = [
  "3M India Ltd.",
  "B. Braun Medical India",
  "Johnson & Johnson MedTech",
  "Roche Diagnostics India",
  "Siemens Healthcare Pvt Ltd",
  "Smith & Nephew India",
  "Medtronic India Pvt Ltd",
  "Dentsply Sirona Healthcare",
  "Becton Dickinson India",
];

export function AddConsumableModal({
  open,
  onOpenChange,
  defaultCategory = "Surgical Consumables",
  onSaveItem,
}: AddConsumableModalProps) {
  const { toast } = useToast();

  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [category, setCategory] = useState<InventoryItem["category"]>(defaultCategory);
  const [stockLevel, setStockLevel] = useState<number>(100);
  const [unit, setUnit] = useState("Pieces");
  const [reorderLevel, setReorderLevel] = useState<number>(30);
  const [supplierName, setSupplierName] = useState(REGISTERED_VENDORS[0]);
  const [unitCost, setUnitCost] = useState<number>(150);
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isCritical, setIsCritical] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const generatedCode = itemCode.trim() || `ITM-${Date.now().toString().slice(-4)}`;
    const status = stockLevel <= reorderLevel ? "Low Stock" : "Adequate";

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      itemCode: generatedCode,
      name: itemName.trim(),
      category,
      stockLevel,
      unit,
      reorderLevel,
      leadTimeDays: 3,
      supplierName,
      unitCost,
      status,
      batchNumber: batchNumber.trim() || undefined,
      expiryDate: expiryDate || undefined,
      isCritical,
      lastAuditDate: new Date().toISOString().split("T")[0],
    };

    onSaveItem(newItem);

    toast({
      title: "Supply Item Registered",
      description: `${newItem.name} (${newItem.itemCode}) added to Central Store catalog.`,
    });

    onOpenChange(false);
    setItemName("");
    setItemCode("");
    setBatchNumber("");
    setExpiryDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Register Supply SKU</DialogTitle>
              <DialogDescription className="text-xs">
                Onboard new consumable or medical supply into central inventory.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Item Name *</Label>
            <Input
              placeholder="e.g. Endotracheal Tube Cuffed 7.5mm"
              className="text-xs h-9"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Item Code (SKU)</Label>
              <Input
                placeholder="e.g. ITM-SURG-109"
                className="text-xs h-9 font-mono"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Surgical Consumables">Surgical Consumables</SelectItem>
                  <SelectItem value="PPE & Hygiene">PPE & Hygiene</SelectItem>
                  <SelectItem value="Diagnostic Reagents">Diagnostic Reagents</SelectItem>
                  <SelectItem value="Wound Care">Wound Care</SelectItem>
                  <SelectItem value="General Medical Supplies">General Medical Supplies</SelectItem>
                  <SelectItem value="Linens & Bedding">Linens & Bedding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Stock Qty</Label>
              <Input
                type="number"
                min="0"
                className="text-xs h-9 font-mono"
                value={stockLevel}
                onChange={(e) => setStockLevel(parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Unit Type</Label>
              <Input
                placeholder="e.g. Boxes, Pairs"
                className="text-xs h-9"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Reorder Min</Label>
              <Input
                type="number"
                min="1"
                className="text-xs h-9 font-mono"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* Supplier from Registered Vendors (Cross-Module Rule) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Primary Vendor</Label>
              <Select value={supplierName} onValueChange={setSupplierName}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGISTERED_VENDORS.map((v) => (
                    <SelectItem key={v} value={v} className="text-xs">
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Unit Cost (₹)</Label>
              <Input
                type="number"
                min="1"
                className="text-xs h-9 font-mono"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Batch Number</Label>
              <Input
                placeholder="e.g. BTH-2026-99"
                className="text-xs h-9 font-mono"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Batch Expiry Date</Label>
              <Input
                type="date"
                className="text-xs h-9"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
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
              <CheckCircle2 className="h-4 w-4" /> Save SKU
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
