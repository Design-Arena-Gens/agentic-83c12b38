"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Props = {
  orderId: string;
  hotelSlug: string;
  tableSlug: string;
  googleReviewUrl: string | null;
};

export function RateOrderForm({ orderId, hotelSlug, tableSlug, googleReviewUrl }: Props) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!score) {
      setError("Choose a rating before submitting.");
      return;
    }
    try {
      setError(null);
      setSubmitting(true);
      const response = await fetch(`/api/orders/${orderId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unable to submit rating" }));
        throw new Error(data.error ?? "Unable to submit rating");
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to submit rating");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl bg-emerald-50 p-4 text-left text-emerald-700">
          <p className="font-medium">Thanks for your feedback!</p>
          <p className="text-sm">
            We share every response with the team so they can deliver perfect service next time.
          </p>
        </div>
        {googleReviewUrl ? (
          <Link
            href={googleReviewUrl}
            target="_blank"
            className="flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Tell the world on Google
          </Link>
        ) : null}
        <Link
          href={`/order/${hotelSlug}/${tableSlug}`}
          className="flex w-full items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-left">
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setScore(value)}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition ${
              score && score >= value ? "bg-amber-400 text-slate-900" : "bg-white text-slate-500"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Anything we can pass on to the team?</label>
        <textarea
          rows={4}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
          placeholder="Loved the service, cocktails were perfect..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending feedback...
          </>
        ) : (
          "Submit rating"
        )}
      </button>
    </form>
  );
}
