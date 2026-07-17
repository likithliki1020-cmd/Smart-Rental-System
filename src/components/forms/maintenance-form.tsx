"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";
import { MAINTENANCE_CATEGORY_LABELS } from "@/lib/constants";

export function MaintenanceForm({
    leaseId,
    onCreated,
}: {
    leaseId: Id<"leases">;
    onCreated?: () => void;
}) {
    const createRequest = useMutation(api.maintenance.createRequest);

    const [category, setCategory] = useState<"plumbing" | "electrical" | "cleaning" | "other">("other");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
            await createRequest({ leaseId, category, title, description, imageUrls });
            setTitle("");
            setDescription("");
            setImageUrls([]);
            onCreated?.();
        } catch {
            setError("Couldn't submit the request. Try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="ledger-panel space-y-4 p-6">
            <div>
                <Label htmlFor="category">Issue type</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                    <SelectTrigger id="category">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(MAINTENANCE_CATEGORY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="title">Summary</Label>
                <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kitchen tap leaking" />
            </div>

            <div>
                <Label htmlFor="description">Details</Label>
                <Textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
                <Label>Photos (optional)</Label>
                <FileUpload accept="image/*" onUploaded={(urls) => setImageUrls((prev) => [...prev, ...urls])} />
                {imageUrls.length > 0 && (
                    <p className="mt-2 font-mono text-[11px] text-ink-faint">{imageUrls.length} file(s) uploaded</p>
                )}
            </div>

            {error && <p className="font-mono text-[12px] text-rust">{error}</p>}

            <div className="flex justify-end">
                <Button type="submit" disabled={pending}>
                    {pending ? "Submitting…" : "Submit request"}
                </Button>
            </div>
        </form>
    );
}