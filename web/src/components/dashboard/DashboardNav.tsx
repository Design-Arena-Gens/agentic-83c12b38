"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, MenuSquare, PieChart, TableProperties, Utensils } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { formatCurrency } from "@/lib/format";

type Props = {
  hotel: {
    id: string;
    name: string;
    slug: string;
    analytics: {
      totalOrders: number;
      totalRevenue: number;
      avgRating: number;
      reviewCount: number;
    } | null;
  };
};

const links = [
  {
    href: (slug: string) => `/dashboard/${slug}`,
    label: "Orders",
    icon: Utensils,
    pathKey: "",
  },
  {
    href: (slug: string) => `/dashboard/${slug}/menu`,
    label: "Menu manager",
    icon: MenuSquare,
    pathKey: "menu",
  },
  {
    href: (slug: string) => `/dashboard/${slug}/tables`,
    label: "Table QR codes",
    icon: TableProperties,
    pathKey: "tables",
  },
  {
    href: (slug: string) => `/dashboard/${slug}?view=analytics`,
    label: "Analytics",
    icon: PieChart,
    pathKey: "analytics",
  },
];

export function DashboardNav({ hotel }: Props) {
  const pathname = usePathname();

  const analytics = hotel.analytics;

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase text-slate-500">QuickServe</p>
          <h1 className="text-xl font-semibold text-slate-900">{hotel.name}</h1>
          {analytics ? (
            <p className="text-sm text-slate-500">
              {analytics.totalOrders} orders • {formatCurrency(analytics.totalRevenue ?? 0)} gross •{" "}
              {analytics.avgRating?.toFixed(1) ?? "–"}★ ({analytics.reviewCount} reviews)
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const href = link.href(hotel.slug);
            const active =
              pathname === href ||
              (link.pathKey &&
                (pathname?.includes(`/${link.pathKey}`) ||
                  pathname?.includes(`view=${link.pathKey}`)));
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <LogoutButton>
            <span className="flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100">
              <LogOut className="h-4 w-4" />
              Sign out
            </span>
          </LogoutButton>
        </div>
      </div>
    </header>
  );
}
