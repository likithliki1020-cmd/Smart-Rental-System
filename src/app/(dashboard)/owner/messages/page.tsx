"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function OwnerMessagesPage() {
  const summaries = useQuery(api.leases.listTenantSummaries);
  const [selectedTenantId, setSelectedTenantId] = useState<Id<"users"> | null>(null);
  const [draft, setDraft] = useState("");

  const conversation = useQuery(
    api.notifications.listConversation,
    selectedTenantId ? { otherUserId: selectedTenantId } : "skip",
  );
  const sendMessage = useMutation(api.notifications.sendMessage);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);

  useEffect(() => {
    void markAllRead({ type: "message" });
  }, [markAllRead]);

  const uniqueTenants = Array.from(
    new Map((summaries ?? []).filter((s) => s.tenant).map((s) => [s.tenant!._id, s.tenant!])).values(),
  );

  async function handleSend() {
    if (!selectedTenantId || !draft.trim()) return;
    await sendMessage({ recipientId: selectedTenantId, content: draft.trim() });
    setDraft("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-brass-deep">Messages</p>
        <h1 className="font-display text-2xl font-bold text-ink">Messages</h1>
      </div>

      <div className="ledger-panel grid grid-cols-[220px_1fr] overflow-hidden" style={{ height: 480 }}>
        <div className="overflow-y-auto border-r border-line">
          {uniqueTenants.length === 0 ? (
            <p className="p-4 text-sm text-ink-faint">No tenants yet.</p>
          ) : (
            uniqueTenants.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTenantId(t._id)}
                className={`block w-full px-4 py-3 text-left text-sm ${selectedTenantId === t._id ? "bg-paper-dim" : "hover:bg-paper-dim/50"
                  }`}
              >
                {t.name ?? t.email}
              </button>
            ))
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!selectedTenantId ? (
              <p className="text-sm text-ink-faint">Select a tenant to start messaging.</p>
            ) : conversation === undefined ? (
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

          {selectedTenantId && (
            <div className="flex gap-2 border-t border-line p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message…"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}