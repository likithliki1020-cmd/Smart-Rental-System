"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";

export function PropertyForm() {
    const router = useRouter();
    const createProperty = useMutation(api.properties.createProperty);

    const [title, setTitle] = useState("");
    const [type, setType] = useState<"apartment" | "house" | "commercial">("apartment");
    const [addressLine, setAddressLine] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [rentAmount, setRentAmount] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
            await createProperty({
                title,
                type,
                addressLine,
                city,
                state,
                postalCode,
                rentAmount: Number(rentAmount),
                description: description || undefined,
                imageUrls,
                documentUrls: [],
            });
            router.push("/owner/properties");
        } catch {
            setError("Couldn't save the property. Check the fields and try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="ledger-panel space-y-5 p-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="title">Property name</Label>
                    <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div>
                    <Label htmlFor="type">Property type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                        <SelectTrigger id="type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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

                <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
                </div>

                <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" required value={state} onChange={(e) => setState(e.target.value)} />
                </div>

                <div>
                    <Label htmlFor="postal">Postal code</Label>
                    <Input id="postal" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </div>
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
                <Label>Photos</Label>
                <FileUpload onUploaded={(urls) => setImageUrls((prev) => [...prev, ...urls])} />
                {imageUrls.length > 0 && (
                    <p className="mt-2 font-mono text-[11px] text-ink-faint">{imageUrls.length} file(s) uploaded</p>
                )}
            </div>

            {error && <p className="font-mono text-[12px] text-rust">{error}</p>}

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Save property"}
                </Button>
            </div>
        </form>
    );
}