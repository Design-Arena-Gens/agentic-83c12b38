import { formatCurrency } from "@/lib/format";

type TrendingItem = {
  id: string;
  totalQuantity: number;
  menuItem:
    | {
        name: string;
        price: number;
        description: string | null;
      }
    | undefined;
};

type Props = {
  items: TrendingItem[];
};

export function TrendingItems({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No orders yet — once guests start ordering, your best sellers will appear here.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Top dishes this week</h2>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                #{index + 1} {item.menuItem?.name ?? "Unknown item"}
              </p>
              {item.menuItem?.description ? (
                <p className="text-xs text-slate-500">{item.menuItem.description}</p>
              ) : null}
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>{item.totalQuantity} orders</p>
              {item.menuItem ? <p>{formatCurrency(item.menuItem.price)}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
