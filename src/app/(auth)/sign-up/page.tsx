"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      formData.set("flow", "signUp");
      await signIn("password", formData);
      router.push("/");
    } catch {
      setError("Couldn't create that account. The email may already be in use.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <p className="mb-1 bg-gradient-to-r from-brass to-violet bg-clip-text text-sm font-bold text-transparent">Rentaly</p>
        <h1 className="mb-8 font-display text-3xl text-ink">Create an account</h1>

        <form action={handleSubmit} className="ledger-panel space-y-4 p-6">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-faint">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:border-brass"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-faint">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:border-brass"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-faint">
              I am a
            </label>
            <select
              id="role"
              name="role"
              defaultValue="tenant"
              className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:border-brass"
            >
              <option value="owner">Property Owner / Landlord</option>
              <option value="tenant">Tenant</option>
              <option value="manager">Property Manager</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-faint">
              Password
            </label>
            <div className="flex items-center gap-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:border-brass"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-ink-faint hover:text-ink"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="font-mono text-[12px] text-rust">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-gradient-to-r from-brass to-violet py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-faint">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-brass-deep underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}