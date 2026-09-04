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
import { Webhook, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

interface ConfigureWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    provider: string;
    endpointUrl: string;
    secretHeader: string;
    retryPolicy: string;
  }) => void;
}

export function ConfigureWebhookModal({
  isOpen,
  onClose,
  onSave,
}: ConfigureWebhookModalProps) {
  const [provider, setProvider] = useState("Razorpay Webhook & Payment Gateway");
  const [endpointUrl, setEndpointUrl] = useState("https://api.qlyno.com/webhooks/v1/razorpay");
  const [secretHeader, setSecretHeader] = useState("X-Razorpay-Signature (HMAC-SHA256)");
  const [retryPolicy, setRetryPolicy] = useState("Exponential Backoff (1s, 5s, 30s, 5m)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!endpointUrl.trim()) return;

    onSave({
      provider,
      endpointUrl,
      secretHeader,
      retryPolicy,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Webhook className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Configure Webhook Listener Endpoint
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Registers ingress callback URLs with HMAC payload signature validation and automated idempotency verification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Integration Provider
            </label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Razorpay Webhook & Payment Gateway">Razorpay Webhook & Payment Switch</SelectItem>
                <SelectItem value="Meta WhatsApp Cloud API">Meta WhatsApp Cloud API Gateway</SelectItem>
                <SelectItem value="Sysmex / Roche LIS Interfacing">Sysmex / Roche LIS Analyzer Network</SelectItem>
                <SelectItem value="MediBuddy / Star Health TPA Switch">MediBuddy / Star Health TPA Switch</SelectItem>
                <SelectItem value="ABDM / ABHA National Gateway">ABDM / ABHA National Health Gateway</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Ingress Webhook URL <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              HMAC Signature Header Verification
            </label>
            <Input
              value={secretHeader}
              onChange={(e) => setSecretHeader(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Failure Retry & Backoff Policy
            </label>
            <Select value={retryPolicy} onValueChange={setRetryPolicy}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Exponential Backoff (1s, 5s, 30s, 5m)">Exponential Backoff (1s, 5s, 30s, 5m)</SelectItem>
                <SelectItem value="Immediate 3-Retry Threshold">Immediate 3-Retry Threshold</SelectItem>
                <SelectItem value="Strict Circuit Breaker (Disable upon 5 Consecutive 5xx)">Strict Circuit Breaker (Disable on 5 Consecutive 5xx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs gap-1 bg-primary text-primary-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Save Webhook Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
