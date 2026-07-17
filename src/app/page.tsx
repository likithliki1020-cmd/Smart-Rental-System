"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function HomePage() {
    const router = useRouter();
    const { user, isLoading } = useCurrentUser();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.replace("/sign-in");
            return;
        }
        router.replace(`/${user.role}`);
    }, [isLoading, user, router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-paper">
            <p className="font-mono text-[11px] uppercase tracking-ledger text-ink-faint">Loading…</p>
        </main>
    );
}