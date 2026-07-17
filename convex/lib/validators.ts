import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("owner"),
  v.literal("tenant"),
  v.literal("manager"),
  v.literal("admin"),
);

export const propertyTypeValidator = v.union(
  v.literal("apartment"),
  v.literal("house"),
  v.literal("commercial"),
);

export const propertyStatusValidator = v.union(
  v.literal("vacant"),
  v.literal("occupied"),
  v.literal("maintenance"),
);

export const leaseStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("pending"),
);

export const paymentStatusValidator = v.union(
  v.literal("paid"),
  v.literal("pending"),
  v.literal("overdue"),
);

export const maintenanceCategoryValidator = v.union(
  v.literal("plumbing"),
  v.literal("electrical"),
  v.literal("cleaning"),
  v.literal("other"),
);

export const maintenanceStatusValidator = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("closed"),
);

export const notificationTypeValidator = v.union(
  v.literal("rent_reminder"),
  v.literal("payment_received"),
  v.literal("maintenance_update"),
  v.literal("message"),
  v.literal("system"),
);
