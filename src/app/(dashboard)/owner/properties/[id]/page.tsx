"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { StatusBadge } from "@/components/shared/status-badge";
import { ImageThumbnails } from "@/components/shared/image-thumbnails";
import { LeaseForm } from "@/components/forms/lease-form";
import { PROPERTY_STATUS, PROPERTY_TYPE_LABELS, LEASE_STATUS, MAINTENANCE_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const propertyId = params.id as Id<"properties">;
  const property = useQuery(api.properties.getPropertyById, { propertyId });
  const leases = useQuery(api.leases.listLeases, { propertyId });
  const requests = useQuery(api.maintenance.listRequests, {});

  if (property === undefined) {
    return <p className="font-mono text-[11px] text-ink-faint">Loading…</p>;
  }
  if (property === null) {
    return <p className="font-mono text-[11px] text-rust">Property not found.</p>;
  }

  const activeLease = leases?.find((l) => l.status === "active" || l.status === "pending");
  const propertyRequests = requests?.filter((r) => r.propertyId === propertyId) ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="text-sm font-semibold text-brass-deep">Properties</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">{property.title}</h1>
          <StatusBadge label={PROPERTY_STATUS[property.status].label} tone={PROPERTY_STATUS[property.status].tone} />
        </div>
        <p className="mt-1 text-sm text-ink-faint">
          {property.addressLine}, {property.city}, {property.state} {property.postalCode}
        </p>
      </div>

      <div className="ledger-panel grid grid-cols-3 gap-4 p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Type</p>
          <p className="text-ink">{PROPERTY_TYPE_LABELS[property.type]}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Rent</p>
          <p className="font-mono text-ink">{formatCurrency(property.rentAmount)}</p>
        </div>
      </div>

      {property.imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {property.imageUrls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={property.title} className="h-32 w-full rounded-sm object-cover transition-opacity hover:opacity-90" />
            </a>
          ))}
        </div>
      )}

      <div className="ledger-panel p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Lease</h2>
        {activeLease ? (
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-ink">
                {formatDate(activeLease.startDate)} – {formatDate(activeLease.endDate)}
              </p>
              <p className="font-mono text-ink-faint">{formatCurrency(activeLease.rentAmount)} / month</p>
            </div>
            <StatusBadge label={LEASE_STATUS[activeLease.status].label} tone={LEASE_STATUS[activeLease.status].tone} />
          </div>
        ) : (
          <LeaseForm propertyId={propertyId} />
        )}
      </div>

      <div className="ledger-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Maintenance history</h2>
          <Link href="/owner/messages" className="text-sm font-semibold text-brass-deep hover:underline">
            Messages
          </Link>
        </div>
        {propertyRequests.length === 0 ? (
          <p className="text-sm text-ink-faint">No maintenance requests for this property.</p>
        ) : (
          <ul className="divide-y divide-line">
            {propertyRequests.map((r) => (
              <li key={r._id} className="flex items-center justify-between py-2 text-sm">
                <span>{r.title}</span>
                <div className="flex items-center gap-3">
                  <ImageThumbnails urls={r.imageUrls} label={r.title} />
                  <StatusBadge label={MAINTENANCE_STATUS[r.status].label} tone={MAINTENANCE_STATUS[r.status].tone} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}