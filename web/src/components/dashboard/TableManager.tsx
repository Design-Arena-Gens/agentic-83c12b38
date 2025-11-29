"use client";

import Image from "next/image";
import { useState } from "react";
import QRCode from "qrcode";
import { Loader2, RefreshCcw } from "lucide-react";

type Table = {
  id: string;
  name: string;
  qrSlug: string;
  orderingUrl: string;
  qrCode: string;
};

type Props = {
  hotelSlug: string;
  tables: Table[];
};

export function TableManager({ hotelSlug, tables }: Props) {
  const [entries, setEntries] = useState<Table[]>(tables);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshTables() {
    const response = await fetch(`/api/dashboard/${hotelSlug}/tables`);
    if (!response.ok) throw new Error("Unable to load tables");
    const data = await response.json();
    const mapped: Table[] = await Promise.all(
      data.tables.map(async (table: { id: string; name: string; qrSlug: string }) => {
        const orderingUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin}/order/${hotelSlug}/${table.qrSlug}`;
        const qrCode = await QRCode.toDataURL(orderingUrl, { margin: 1, width: 280 });
        return { ...table, orderingUrl, qrCode };
      })
    );
    setEntries(mapped);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name) {
      setError("Table name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const payload = editId ? { id: editId, name } : { name };
      const method = editId ? "PATCH" : "POST";

      const response = await fetch(`/api/dashboard/${hotelSlug}/tables`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unable to save table" }));
        throw new Error(data.error ?? "Unable to save table");
      }

      const { table } = await response.json();
      const orderingUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin}/order/${hotelSlug}/${table.qrSlug}`;
      const qrCode = await QRCode.toDataURL(orderingUrl, { margin: 1, width: 280 });

      if (editId) {
        setEntries((prev) => prev.map((item) => (item.id === table.id ? { ...table, orderingUrl, qrCode } : item)));
      } else {
        setEntries((prev) => [...prev, { ...table, orderingUrl, qrCode }]);
      }

      setName("");
      setEditId(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to save table");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {editId ? "Rename table" : "Add a table"}
          </h2>
          <button
            type="button"
            onClick={() => {
              setName("");
              setEditId(null);
              setError(null);
            }}
            className="text-sm text-slate-500 underline"
          >
            Reset
          </button>
        </div>
        <form className="mt-4 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
            placeholder="Pool Deck 3"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : editId ? (
              "Update name"
            ) : (
              "Create table"
            )}
          </button>
        </form>
        {error ? <p className="mt-2 text-sm text-rose-500">{error}</p> : null}
      </section>

      <section className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Table QR codes</h3>
        <button
          onClick={refreshTables}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {entries.map((table) => (
          <div key={table.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{table.name}</p>
                <p className="text-xs text-slate-500">{table.qrSlug}</p>
              </div>
              <button
                onClick={() => {
                  setName(table.name);
                  setEditId(table.id);
                }}
                className="text-xs text-slate-500 underline"
              >
                Rename
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <Image
                src={table.qrCode}
                alt={`${table.name} QR`}
                width={256}
                height={256}
                className="h-48 w-48 rounded-2xl border border-slate-200 bg-white p-2 object-contain"
              />
              <a
                href={table.orderingUrl}
                target="_blank"
                className="text-xs font-medium text-slate-600 underline"
              >
                {table.orderingUrl}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(table.orderingUrl)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Copy order link
              </button>
            </div>
          </div>
        ))}
        {entries.length === 0 ? (
          <p className="col-span-full rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No tables yet — create your first QR code above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
