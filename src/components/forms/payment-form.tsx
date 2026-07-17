"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function PaymentForm({
  paymentId,
  amount,
  triggerLabel = "Mark paid",
}: {
  paymentId: Id<"payments">;
  amount: number;
  triggerLabel?: string;
}) {
  const recordPayment = useMutation(api.payments.recordPayment);
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("bank_transfer");
  const [referenceId, setReferenceId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await recordPayment({ paymentId, method, referenceId: referenceId || undefined });
      setOpen(false);
    } catch {
      setError("Couldn't record the payment. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="brass">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <p className="font-mono text-[11px] text-ink-faint">
            Amount: ₹{amount.toLocaleString("en-IN")}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="method">Payment method</Label>
            <Input
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="bank_transfer, upi, cash…"
            />
          </div>
          <div>
            <Label htmlFor="ref">Reference / transaction ID (optional)</Label>
            <Input id="ref" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
          </div>

          {error && <p className="font-mono text-[12px] text-rust">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Confirm payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
