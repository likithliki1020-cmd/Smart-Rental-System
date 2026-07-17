
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/permissions";
import { notificationTypeValidator } from "./lib/validators";

/** List the signed-in user's notifications, newest first. */
export const listMyNotifications = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const rows = args.unreadOnly
      ? await ctx.db
          .query("notifications")
          .withIndex("by_user_unread", (q) => q.eq("userId", user._id).eq("read", false))
          .collect()
      : await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const note = await ctx.db.get(args.notificationId);
    if (!note || note.userId !== user._id) throw new Error("Forbidden.");
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

/** Marks all of the signed-in user's unread notifications of a given type as read. */
export const markAllNotificationsRead = mutation({
  args: { type: v.optional(notificationTypeValidator) },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", user._id).eq("read", false))
      .collect();
    const toMark = args.type ? unread.filter((n) => n.type === args.type) : unread;
    await Promise.all(toMark.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

/** System-triggered notification, e.g. from a cron action sending rent reminders. */
export const createSystemNotification = mutation({
  args: {
    userId: v.id("users"),
    type: notificationTypeValidator,
    title: v.string(),
    body: v.string(),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin", "manager"]);
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      read: false,
      relatedId: args.relatedId,
      createdAt: Date.now(),
    });
  },
});

/** Send a direct message (Owner<->Tenant, Manager<->Tenant, etc). */
export const sendMessage = mutation({
  args: {
    recipientId: v.id("users"),
    propertyId: v.optional(v.id("properties")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const messageId = await ctx.db.insert("messages", {
      propertyId: args.propertyId,
      senderId: user._id,
      recipientId: args.recipientId,
      content: args.content,
      read: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: args.recipientId,
      type: "message",
      title: `New message from ${user.name ?? "a user"}`,
      body: args.content.slice(0, 120),
      read: false,
      relatedId: messageId,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

/** Conversation thread between the signed-in user and one other user. */
export const listConversation = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const sent = await ctx.db
      .query("messages")
      .withIndex("by_participants", (q) =>
        q.eq("senderId", user._id).eq("recipientId", args.otherUserId),
      )
      .collect();

    const received = await ctx.db
      .query("messages")
      .withIndex("by_participants", (q) =>
        q.eq("senderId", args.otherUserId).eq("recipientId", user._id),
      )
      .collect();

    return [...sent, ...received].sort((a, b) => a.createdAt - b.createdAt);
  },
});