"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ImageThumbnails({ urls, label = "Photos" }: { urls: string[]; label?: string }) {
    const [open, setOpen] = useState(false);

    if (!urls || urls.length === 0) return <span className="text-ink-faint">—</span>;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 rounded hover:opacity-80"
            >
                <div className="flex -space-x-2">
                    {urls.slice(0, 3).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={i}
                            src={url}
                            alt=""
                            className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-card"
                        />
                    ))}
                </div>
                <span className="text-xs font-semibold text-brass-deep">{urls.length}</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{label}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {urls.map((url, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={url} alt="" className="h-32 w-full rounded object-cover" />
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}