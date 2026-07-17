"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { StatusBadge } from "@/components/shared/status-badge";
import { LEASE_STATUS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TenantLeasePage() {
  const leases = useQuery(api.leases.listLeases, {});
  const lease = leases?.[0];
  const property = useQuery(api.properties.getPropertyById, lease ? { propertyId: lease.propertyId } : "skip");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-brass-deep">My Lease</p>
        <h1 className="font-display text-2xl font-bold text-ink">Rental agreement</h1>
      </div>

      {leases === undefined ? (
        <p className="font-mono text-[11px] text-ink-faint">Loading…</p>
      ) : !lease ? (
        <div className="ledger-panel p-8 text-center">
          <p className="text-ink">You don't have an active lease yet.</p>
        </div>
      ) : (
        <div className="ledger-panel space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">{property?.title ?? "Property"}</h2>
            <StatusBadge label={LEASE_STATUS[lease.status].label} tone={LEASE_STATUS[lease.status].tone} />
          </div>

          {property && (
            <p className="text-sm text-ink-faint">
              {property.addressLine}, {property.city}, {property.state} {property.postalCode} ·{" "}
              {PROPERTY_TYPE_LABELS[property.type]}
            </p>
          )}

          {property && property.imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {property.imageUrls.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={property.title} className="h-24 w-full rounded object-cover transition-opacity hover:opacity-90" />
                </a>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-line pt-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Lease term</p>
              <p className="text-ink">
                {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Monthly rent</p>
              <p className="font-mono text-ink">{formatCurrency(lease.rentAmount)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Due day</p>
              <p className="text-ink">Day {lease.dueDayOfMonth} of each month</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Security deposit</p>
              <p className="font-mono text-ink">{formatCurrency(lease.depositAmount)}</p>
            </div>
          </div>

          {lease.agreementUrl ? (
            <a
              href={lease.agreementUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card hover:border-brass hover:text-brass-deep"
            >
              Download agreement (PDF)
            </a>
          ) : (
            <p className="font-mono text-[11px] text-ink-faint">No signed agreement uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}