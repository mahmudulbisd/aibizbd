"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { AdminOrderDTO } from "@/lib/dto";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "PENDING (Awaiting payment)" },
  { value: "PAID", label: "PAID (Payment verified)" },
  { value: "PROCESSING", label: "PROCESSING (Supplier purchase)" },
  { value: "DELIVERED", label: "DELIVERED (Credentials released)" },
  { value: "FAILED", label: "FAILED (Payment/supplier error)" },
  { value: "REFUNDED", label: "REFUNDED" },
] as const;

export function ManageOrderDialog({
  order,
  onClose,
  onSaved,
}: {
  order: AdminOrderDTO;
  onClose: () => void;
  onSaved: (updated: AdminOrderDTO) => void;
}) {
  const [status, setStatus] = useState<string>(order.status);
  const [manualCreds, setManualCreds] = useState<string>("");
  const [manualInstructions, setManualInstructions] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          status,
          manualCredentials: manualCreds,
          manualInstructions: manualInstructions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      onSaved({
        ...order,
        status: manualCreds.trim() ? "DELIVERED" : (status as AdminOrderDTO["status"]),
        deliveryDataReady: order.deliveryDataReady || Boolean(manualCreds.trim()),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdating(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/order/${order.orderNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={
        <span>
          Manage order{" "}
          <span className="font-mono text-accent">{order.orderNumber}</span>
        </span>
      }
      description={`${order.customerEmail} · ${order.customerPhone}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="manage-order-form" loading={updating}>
            Save Changes
          </Button>
        </>
      }
    >
      <form id="manage-order-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Order status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Manual credentials / activation key / link"
          hint="Auto-marks as DELIVERED and encrypts at rest."
        >
          <Textarea
            rows={3}
            value={manualCreds}
            onChange={(e) => setManualCreds(e.target.value)}
            placeholder="e.g. Email: user@domain.com | Password: SecretPassword123 or https://invite-link…"
          />
        </Field>

        <Field label="Customer instructions (optional)">
          <Input
            value={manualInstructions}
            onChange={(e) => setManualInstructions(e.target.value)}
            placeholder="e.g. Log in at canva.com using these credentials."
          />
        </Field>

        {/* Quick copy receipt link */}
        <div className="flex items-center justify-between rounded-lg border border-line bg-panel-strong/60 px-3.5 py-2.5">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Customer receipt</div>
            <div className="truncate font-mono text-[11px] text-faint">/order/{order.orderNumber}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={copyLink}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>

        {error && (
          <Alert tone="danger" title="Update failed">
            {error}
          </Alert>
        )}
      </form>
    </Dialog>
  );
}
