"use client";

import React, { useState } from "react";
import { mockShiftTemplates, ShiftTemplate } from "@/hospital-admin/lib/mock/nursing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Button } from "@/hospital-admin/components/ui/button";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { ShiftTemplateForm } from "@/hospital-admin/components/shift-templates/ShiftTemplateForm";
import { DeleteShiftTemplateModal } from "@/hospital-admin/components/shift-templates/DeleteShiftTemplateModal";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Clock, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { RoleGate } from "@/hospital-admin/components/nursing/role-gate";

export default function ShiftTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ShiftTemplate[]>(mockShiftTemplates);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | undefined>(undefined);
  const [templateToDelete, setTemplateToDelete] = useState<ShiftTemplate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (template: ShiftTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!templateToDelete) return;
    setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id));
    toast({
      title: "Shift Template Deleted",
      description: `"${templateToDelete.name}" has been permanently removed from the template catalog.`,
      variant: "destructive",
    });
    setTemplateToDelete(null);
  };

  return (
    <RoleGate
      allowed={["admin", "nurse_lead"]}
      message="Shift template design and timing configuration is restricted to Nurse Station Lead and Hospital Admin (PRD Section 6 & Section 20)."
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shift Patterns &amp; Templates</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Define reusable shift windows, rotation periods, break entitlements, and grace thresholds.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ScopeIndicator scope="Station Lead" />
            <Button size="sm" className="text-xs font-semibold" onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Shift Template
            </Button>
          </div>
        </div>

        {/* Templates Table */}
        <div className="rounded-md border border-border bg-card shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-bold">Shift Name</TableHead>
                <TableHead className="text-xs font-bold">Start Time</TableHead>
                <TableHead className="text-xs font-bold">End Time</TableHead>
                <TableHead className="text-xs font-bold">Default Scope</TableHead>
                <TableHead className="text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} className="hover:bg-muted/20">
                  <TableCell className="font-semibold text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {template.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{template.startTime}</TableCell>
                  <TableCell className="text-xs font-mono">{template.endTime}</TableCell>
                  <TableCell>
                    {template.isDefault ? (
                      <Badge variant="secondary" className="text-[10px]">Hospital Default</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Custom Shift</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(template)}
                      title="Edit template"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(template)}
                      title="Delete template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ShiftTemplateForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          template={editingTemplate}
        />

        <DeleteShiftTemplateModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTemplateToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          template={templateToDelete}
        />
      </div>
    </RoleGate>
  );
}
