"use client";

import { useState } from "react";
import { Loader2, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
};

type Category = {
  id: string;
  name: string;
  items: MenuItem[];
};

type Props = {
  hotelSlug: string;
  categories: Category[];
};

type FormState = {
  id: string | null;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
};

const initialForm = (categories: Category[]): FormState => ({
  id: null,
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: categories[0]?.id ?? "",
  isAvailable: true,
});

export function MenuManager({ hotelSlug, categories }: Props) {
  const [items, setItems] = useState(categories);
  const [form, setForm] = useState<FormState>(() => initialForm(categories));
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allItems = items.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryId: category.id,
      categoryName: category.name,
    }))
  );

  function resetForm() {
    setForm(initialForm(items));
    setError(null);
    setSuccess(null);
  }

  function handleEdit(item: MenuItem, categoryId: string) {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      price: item.price.toString(),
      imageUrl: item.imageUrl ?? "",
      categoryId,
      isAvailable: item.isAvailable,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.categoryId) {
      setError("Name and category are required.");
      return;
    }
    const numericPrice = Number(form.price);
    if (Number.isNaN(numericPrice)) {
      setError("Enter a valid price.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const previousCategoryId = form.id ? allItems.find((item) => item.id === form.id)?.categoryId ?? null : null;

      const payload = {
        id: form.id ?? undefined,
        name: form.name,
        description: form.description || undefined,
        price: numericPrice,
        imageUrl: form.imageUrl || undefined,
        categoryId: form.categoryId,
        isAvailable: form.isAvailable,
      };

      const method = form.id ? "PATCH" : "POST";
      const response = await fetch(`/api/dashboard/${hotelSlug}/menu`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unable to save menu item" }));
        throw new Error(data.error ?? "Unable to save menu item");
      }

      const { item } = await response.json();

      setItems((prev) =>
        prev.map((category) =>
          category.id === item.categoryId
            ? {
                ...category,
                items: form.id
                  ? category.items.map((existing) => (existing.id === item.id ? item : existing))
                  : [...category.items, item],
              }
            : form.id && previousCategoryId && previousCategoryId === category.id
            ? {
                ...category,
                items: category.items.filter((existing) => existing.id !== item.id),
              }
            : category
        )
      );

      setSuccess(form.id ? "Menu item updated" : "Menu item created");
      setForm(initialForm(items));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to save menu item");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(item: MenuItem, categoryId: string) {
    try {
      const response = await fetch(`/api/dashboard/${hotelSlug}/menu`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          description: item.description ?? undefined,
          price: item.price,
          imageUrl: item.imageUrl ?? undefined,
          categoryId,
          isAvailable: !item.isAvailable,
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to update availability");
      }
      const { item: updated } = await response.json();
      setItems((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                items: category.items.map((existing) => (existing.id === updated.id ? updated : existing)),
              }
            : category
        )
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to update availability");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {form.id ? "Update menu item" : "Add a new item"}
          </h2>
          {form.id ? (
            <button onClick={resetForm} className="text-sm text-slate-500 underline">
              Cancel edit
            </button>
          ) : null}
        </div>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="Signature Old Fashioned"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={form.categoryId}
              onChange={(event) => setForm((state) => ({ ...state, categoryId: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
            >
              {items.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="Include tasting notes, key ingredients, or service style."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Price</label>
            <input
              value={form.price}
              onChange={(event) => setForm((state) => ({ ...state, price: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="18.00"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Image URL (optional)</label>
            <input
              value={form.imageUrl}
              onChange={(event) => setForm((state) => ({ ...state, imageUrl: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) => setForm((state) => ({ ...state, isAvailable: event.target.checked }))}
              className="h-4 w-4"
            />
            <span>Available for guests to order</span>
          </div>
          {error ? <p className="md:col-span-2 text-sm text-rose-500">{error}</p> : null}
          {success ? <p className="md:col-span-2 text-sm text-emerald-500">{success}</p> : null}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:bg-slate-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : form.id ? (
                "Update item"
              ) : (
                "Add item"
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {items.map((category) => (
          <div key={category.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
              <span className="text-sm text-slate-500">{category.items.length} items</span>
            </div>
            <div className="mt-4 space-y-3">
              {category.items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No items yet in this category.
                </p>
              ) : (
                category.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                          {item.isAvailable ? "Available" : "Hidden"}
                        </span>
                      </div>
                      {item.description ? (
                        <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                      ) : null}
                      <p className="mt-2 text-sm font-semibold text-slate-700">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleToggle(item, category.id)}
                        className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200"
                      >
                        {item.isAvailable ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        Toggle availability
                      </button>
                      <button
                        onClick={() => handleEdit(item, category.id)}
                        className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
