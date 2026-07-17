"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function LeaseForm({ propertyId }: { propertyId: Id<"properties"> }) {
  const router = useRouter();
  const createLease = useMutation(api.leases.createLease);
  const generateSchedule = useMutation(api.payments.generateScheduleForLease);

  const [tenantEmail, setTenantEmail] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [dueDay, setDueDay] = useState("5");
  const [depositAmount, setDepositAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const tenant = useQuery(
    api.users.findTenantByEmail,
    confirmedEmail ? { email: confirmedEmail } : "skip",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!tenant) {
      setError("No tenant found with that email. Ask them to sign up first.");
      return;
    }

    setPending(true);
    try {
      const leaseId = await createLease({
        propertyId,
        tenantId: tenant._id,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
        rentAmount: Number(rentAmount),
        dueDayOfMonth: Number(dueDay),
        depositAmount: Number(depositAmount),
      });
      await generateSchedule({ leaseId });
      router.push(`/owner/properties/${propertyId}`);
    } catch {
      setError("Couldn't create the lease. Check the dates and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ledger-panel space-y-5 p-6">
      <div>
        <Label htmlFor="tenantEmail">Tenant email</Label>
        <div className="flex gap-2">
          <Input
            id="tenantEmail"
            type="email"
            required
            value={tenantEmail}
            onChange={(e) => {
              setTenantEmail(e.target.value);
              setConfirmedEmail(null);
            }}
          />
          <Button type="button" variant="outline" onClick={() => setConfirmedEmail(tenantEmail)}>
            Look up
          </Button>
        </div>
        {confirmedEmail && tenant === null && (
          <p className="mt-1 font-mono text-[11px] text-rust">No tenant found with that email.</p>
        )}
        {tenant && (
          <p className="mt-1 font-mono text-[11px] text-forest">
            Found: {tenant.name ?? tenant.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start">Lease start</Label>
          <Input
            id="start"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="end">Lease end</Label>
          <Input
            id="end"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rent">Monthly rent (₹)</Label>
          <Input
            id="rent"
            type="number"
            min={0}
            required
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dueDay">Rent due day (1–31)</Label>
          <Input
            id="dueDay"
            type="number"
            min={1}
            max={31}
            required
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="deposit">Security deposit (₹)</Label>
          <Input
            id="deposit"
            type="number"
            min={0}
            required
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="font-mono text-[12px] text-rust">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating lease…" : "Create lease"}
        </Button>
      </div>
    </form>
  );
}
