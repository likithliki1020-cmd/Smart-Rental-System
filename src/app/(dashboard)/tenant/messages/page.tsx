"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function TenantMessagesPage() {
  const leases = useQuery(api.leases.listLeases, {});
  const lease = leases?.[0];
  const [draft, setDraft] = useState("");

  const conversation = useQuery(
    api.notifications.listConversation,
    lease ? { otherUserId: lease.ownerId } : "skip",
  );
  const sendMessage = useMutation(api.notifications.sendMessage);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);

  useEffect(() => {
    void markAllRead({ type: "message" });
  }, [markAllRead]);

  async function handleSend() {
    if (!lease || !draft.trim()) return;
    await sendMessage({ recipientId: lease.ownerId, propertyId: lease.propertyId, content: draft.trim() });
    setDraft("");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-brass-deep">Messages</p>
        <h1 className="font-display text-2xl font-bold text-ink">Messages with your landlord</h1>
      </div>

      {!lease ? (
        <p className="text-sm text-ink-faint">You need an active lease before you can message your landlord.</p>
      ) : (
        <div className="ledger-panel flex flex-col" style={{ height: 420 }}>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {conversation === undefined ? (
              <p className="font-mono text-[11px] text-ink-faint">Loading…</p>
            ) : conversation.length === 0 ? (
              <p className="text-sm text-ink-faint">No messages yet. Say hello.</p>
            ) : (
              conversation.map((m) => (
                <div key={m._id} className="max-w-[75%] rounded-sm border border-line bg-paper-raised p-3 text-sm">
                  <p>{m.content}</p>
                  <p className="mt-1 font-mono text-[10px] text-ink-faint">{formatDate(m.createdAt)}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 border-t border-line p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </div>
      )}
    </div>
  );
}