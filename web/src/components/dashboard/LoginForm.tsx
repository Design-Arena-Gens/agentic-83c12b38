"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  hotelSlug: string;
};

export function LoginForm({ hotelSlug }: Props) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pin) {
      setError("Enter your staff PIN.");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: hotelSlug, pin }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unable to sign in" }));
        throw new Error(data.error ?? "Unable to sign in");
      }

      router.push(`/dashboard/${hotelSlug}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setIsLoading(false);
      setPin("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="flex flex-col gap-2 text-left">
        <label htmlFor="pin" className="text-sm font-medium text-slate-200">
          Staff PIN
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
          placeholder="4321"
        />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:bg-sky-600/60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
