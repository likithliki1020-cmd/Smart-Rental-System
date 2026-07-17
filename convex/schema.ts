
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  leaseStatusValidator,
  maintenanceCategoryValidator,
  maintenanceStatusValidator,
  notificationTypeValidator,
  paymentStatusValidator,
  propertyStatusValidator,
  propertyTypeValidator,
  roleValidator,
} from "./lib/validators";

export default defineSchema({
  // Spreads Convex Auth's built-in auth tables (authAccounts, authSessions, etc.)
  // and gives us a `users` table we extend below with app-specific fields.
  ...authTables,

  users: defineTable({
    // Fields Convex Auth expects on the users table:
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // App-specific fields:
    role: roleValidator,
    tenantType: v.optional(
      v.union(v.literal("individual"), v.literal("family"), v.literal("corporate")),
    ),
    isActive: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("by_role", ["role"]),

  properties: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    type: propertyTypeValidator,
    status: propertyStatusValidator,
    addressLine: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    rentAmount: v.number(),
    description: v.optional(v.string()),
    imageUrls: v.array(v.string()),
    documentUrls: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"]),

  leases: defineTable({
    propertyId: v.id("properties"),
    ownerId: v.id("users"),
    tenantId: v.id("users"),
    status: leaseStatusValidator,
    startDate: v.number(),
    endDate: v.number(),
    rentAmount: v.number(),
    dueDayOfMonth: v.number(), // 1-31
    depositAmount: v.number(),
    agreementUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_property", ["propertyId"])
    .index("by_owner", ["ownerId"])
    .index("by_tenant", ["tenantId"])
    .index("by_status", ["status"]),

  payments: defineTable({
    leaseId: v.id("leases"),
    propertyId: v.id("properties"),
    ownerId: v.id("users"),
    tenantId: v.id("users"),
    amount: v.number(),
    dueDate: v.number(),
    paidDate: v.optional(v.number()),
    status: paymentStatusValidator,
    method: v.optional(v.string()), // "cash" | "bank_transfer" | "upi" | gateway name, free-form for now
    referenceId: v.optional(v.string()), // external gateway/txn id, for future integration
    receiptUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_lease", ["leaseId"])
    .index("by_tenant", ["tenantId"])
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"]),

  maintenanceRequests: defineTable({
    leaseId: v.id("leases"),
    propertyId: v.id("properties"),
    ownerId: v.id("users"),
    tenantId: v.id("users"),
    assignedManagerId: v.optional(v.id("users")),
    category: maintenanceCategoryValidator,
    status: maintenanceStatusValidator,
    title: v.string(),
    description: v.string(),
    imageUrls: v.array(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_property", ["propertyId"])
    .index("by_tenant", ["tenantId"])
    .index("by_owner", ["ownerId"])
    .index("by_manager", ["assignedManagerId"])
    .index("by_status", ["status"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: notificationTypeValidator,
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    relatedId: v.optional(v.string()), // loosely-typed pointer to a lease/payment/request id
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),

  messages: defineTable({
    propertyId: v.optional(v.id("properties")),
    senderId: v.id("users"),
    recipientId: v.id("users"),
    content: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_property", ["propertyId"])
    // conversation thread between two specific users
    .index("by_participants", ["senderId", "recipientId"]),

  auditLogs: defineTable({
    actorId: v.id("users"),
    action: v.string(), // e.g. "property.create", "user.role_change"
    targetTable: v.string(),
    targetId: v.string(),
    metadata: v.optional(v.string()), // JSON.stringify'd extra context
    createdAt: v.number(),
  })
    .index("by_actor", ["actorId"])
    .index("by_target", ["targetTable", "targetId"]),

  // Singleton row (there should only ever be one) holding platform-wide config.
  platformSettings: defineTable({
    securityLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    lateFeePercentage: v.number(),
    gracePeriodDays: v.number(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }),
});