"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { AdminOrderDTO } from "@/lib/dto";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/locale-provider";

export function ManageOrderDialog({
  order,
  onClose,
  onSaved,
}: {
  order: AdminOrderDTO;
  onClose: () => void;
  onSaved: (updated: AdminOrderDTO) => void;
}) {
  const { dict } = useI18n();
  const a = dict.admin;
  const [status, setStatus] = useState<string>(order.status);
  const [manualCreds, setManualCreds] = useState<string>("");
  const [manualInstructions, setManualInstructions] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const statusOptions = [
    { value: "PENDING", label: a.manageStatusOptionPending },
    { value: "PAID", label: a.manageStatusOptionPaid },
    { value: "PROCESSING", label: a.manageStatusOptionProcessing },
    { value: "DELIVERED", label: a.manageStatusOptionDelivered },
    { value: "FAILED", label: a.manageStatusOptionFailed },
    { value: "REFUNDED", label: a.manageStatusOptionRefunded },
  ] as const;

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
      if (!res.ok) throw new Error(data.error || a.manageError);

      onSaved({
        ...order,
        status: manualCreds.trim() ? "DELIVERED" : (status as AdminOrderDTO["status"]),
        deliveryDataReady: order.deliveryDataReady || Boolean(manualCreds.trim()),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : a.manageError);
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
          {a.manageDialogManage}{" "}
          <span className="font-mono text-accent">{order.orderNumber}</span>
        </span>
      }
      description={`${order.customerEmail} · ${order.customerPhone}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {a.manageDialogCancel}
          </Button>
          <Button variant="primary" type="submit" form="manage-order-form" loading={updating}>
            {a.manageDialogSave}
          </Button>
        </>
      }
    >
      <form id="manage-order-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label={a.manageStatus}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={a.manageManualLabel} hint={a.manageManualHint}>
          <Textarea
            rows={3}
            value={manualCreds}
            onChange={(e) => setManualCreds(e.target.value)}
            placeholder={a.manageManualPlaceholder}
          />
        </Field>

        <Field label={a.manageInstructionsLabel}>
          <Input
            value={manualInstructions}
            onChange={(e) => setManualInstructions(e.target.value)}
            placeholder={a.manageInstructionsPlaceholder}
          />
        </Field>

        {/* Quick copy receipt link */}
        <div className="flex items-center justify-between rounded-lg border border-line bg-panel-strong/60 px-3.5 py-2.5">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{a.manageReceiptUrl}</div>
            <div className="truncate font-mono text-[11px] text-faint">/order/{order.orderNumber}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={copyLink}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? a.manageCopied : a.manageCopyLink}
          </Button>
        </div>

        {error && (
          <Alert tone="danger" title={a.manageError}>
            {error}
          </Alert>
        )}
      </form>
    </Dialog>
  );
}
