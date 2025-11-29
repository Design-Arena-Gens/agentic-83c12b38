"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { useCartStore, useCartTotals } from "@/stores/cart";
import { formatCurrency } from "@/lib/format";

type Hotel = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

type Table = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
  }[];
};

type Props = {
  hotel: Hotel;
  table: Table;
  categories: Category[];
};

export function OrderExperience({ hotel, table, categories }: Props) {
  const router = useRouter();
  const { items, subtotal, tax, total } = useCartTotals();
  const {
    addItem,
    updateQuantity,
    updateInstructions,
    removeItem,
    setCustomerName,
    setPhone,
    setRoomNumber,
    setSpecialNotes,
    customerName,
    phone,
    roomNumber,
    specialNotes,
    reset,
  } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customerName) {
      setError("Please add your name so we can confirm the order at the table.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item to place an order.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelSlug: hotel.slug,
          tableSlug: table.slug,
          customerName,
          phone,
          roomNumber,
          specialNotes,
          items: items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to place order" }));
        throw new Error(data.error ?? "Failed to place order");
      }

      const data = await response.json();
      reset();
      router.push(`/order/${hotel.slug}/${table.slug}/success?orderId=${data.orderId}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {hotel.logoUrl ? (
              <Image
                src={hotel.logoUrl}
                alt={`${hotel.name} logo`}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-500">
                {hotel.name.at(0)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{hotel.name}</h2>
              <p className="text-sm text-slate-500">Ordering from {table.name}</p>
            </div>
          </div>
        </div>

        {categories.map((category) => (
          <div key={category.id} id={category.name} className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-800">{category.name}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {category.items.map((item) => {
                const quantity = items.find((line) => line.id === item.id)?.quantity ?? 0;
                return (
                  <article
                    key={item.id}
                    className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <h4 className="text-lg font-medium text-slate-900">{item.name}</h4>
                          {item.description ? (
                            <p className="text-sm text-slate-500">{item.description}</p>
                          ) : null}
                        </div>
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="h-20 w-20 rounded-2xl object-cover"
                          />
                        ) : null}
                      </div>
                      <p className="text-base font-semibold text-slate-900">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          addItem({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: 1,
                            instructions: "",
                          })
                        }
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Add to order
                      </button>
                      {quantity > 0 ? (
                        <span className="text-sm font-medium text-slate-600">Added × {quantity}</span>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <aside className="space-y-4">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900">Your order</h3>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Guest name</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Name for the order"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Room number (optional)</label>
                    <input
                      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
                      placeholder="Room 712"
                      value={roomNumber}
                      onChange={(event) => setRoomNumber(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Phone (optional)</label>
                    <input
                      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
                      placeholder="+1 555 123 4567"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">Order notes</label>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Allergies, celebrations, special requests..."
                  rows={3}
                  value={specialNotes}
                  onChange={(event) => setSpecialNotes(event.target.value)}
                />
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">Add items from the menu to build your order.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          placeholder="Cooking preferences, allergies..."
                          value={item.instructions ?? ""}
                          onChange={(event) => updateInstructions(item.id, event.target.value)}
                          className="rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:border-slate-400 focus:outline-none"
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-left text-xs text-rose-500 transition hover:text-rose-600"
                        >
                          Remove item
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-slate-900">
                  <span>Order total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {error ? <p className="text-sm text-rose-500">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending order...
                  </>
                ) : (
                  "Send order to the kitchen"
                )}
              </button>
            </form>
          </div>
        </div>
      </aside>
    </div>
  );
}
