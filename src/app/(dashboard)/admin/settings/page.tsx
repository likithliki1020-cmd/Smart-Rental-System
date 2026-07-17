"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../../../convex/_generated/api";

export default function AdminSettingsPage() {
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);

  const [securityLevel, setSecurityLevel] = useState<"low" | "medium" | "high">("medium");
  const [lateFee, setLateFee] = useState("0");
  const [grace, setGrace] = useState("5");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setSecurityLevel(settings.securityLevel);
    setLateFee(String(settings.lateFeePercentage));
    setGrace(String(settings.gracePeriodDays));
  }, [settings]);

  async function handleSave() {
    await updateSettings({
      securityLevel,
      lateFeePercentage: Number(lateFee),
      gracePeriodDays: Number(grace),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-ledger text-brass-deep">
          03 · Settings
        </p>
        <h1 className="font-display text-2xl text-ink">Platform configuration</h1>
      </div>

      <div className="ledger-panel space-y-5 p-6">
        <div>
          <Label htmlFor="security">Security level</Label>
          <Select
            value={securityLevel}
            onValueChange={(v) => setSecurityLevel(v as typeof securityLevel)}
          >
            <SelectTrigger id="security">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-ink-faint">
            Controls session length and password policy strictness.
          </p>
        </div>

        <div>
          <Label htmlFor="lateFee">Late fee (%)</Label>
          <Input
            id="lateFee"
            type="number"
            min={0}
            value={lateFee}
            onChange={(e) => setLateFee(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="grace">Grace period (days)</Label>
          <Input
            id="grace"
            type="number"
            min={0}
            value={grace}
            onChange={(e) => setGrace(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save changes</Button>
          {saved && <span className="font-mono text-[11px] text-forest">Saved</span>}
        </div>
      </div>
    </div>
  );
}
