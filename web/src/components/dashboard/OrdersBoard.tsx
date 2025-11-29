"use client";

import useSWR from "swr";
import { formatCurrency, formatTimestamp } from "@/lib/format";
import { Loader2 } from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  instructions: string | null;
  menuItem: {
    id: string;
    name: string;
    price: number;
  };
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  specialNotes: string | null;
  table: {
    id: string;
    name: string;
  };
  items: OrderItem[];
  rating: {
    score: number;
    comment: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ["PENDING", "IN_PROGRESS", "READY", "SERVED", "COMPLETED"];

type Props = {
  hotelSlug: string;
  initialOrders: Order[];
};

export function OrdersBoard({ hotelSlug, initialOrders }: Props) {
  const {
    data: orders = initialOrders,
    isLoading,
    mutate,
  } = useSWR<Order[]>(`/api/orders?hotelSlug=${hotelSlug}`, {
    refreshInterval: 5000,
    fallbackData: initialOrders,
  });

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  }

  const grouped = STATUSES.map((status) => ({
    status,
    orders: orders.filter((order) => order.status === status),
  }));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {grouped.map((column) => (
        <div key={column.status} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-semibold text-slate-900">{column.status.replace("_", " ")}</h2>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
              {column.orders.length}
            </span>
          </div>
          <div className="space-y-3">
            {column.orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {order.table.name} · #{order.id.slice(-4).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">{formatTimestamp(order.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{formatCurrency(order.total)}</span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}× {item.menuItem.name}
                      </span>
                      <span>{formatCurrency(item.menuItem.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                {order.specialNotes ? (
                  <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    {order.specialNotes}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {STATUSES.filter((status) => status !== order.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200"
                    >
                      Mark {status.replace("_", " ").toLowerCase()}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {column.orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                No orders in this lane
              </div>
            ) : null}
          </div>
        </div>
      ))}
      {isLoading ? (
        <div className="col-span-full flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing orders
        </div>
      ) : null}
    </div>
  );
}
