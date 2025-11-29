import Link from "next/link";
import { ArrowRight, Sparkles, BarChart3, Smartphone, Users2 } from "lucide-react";

const features = [
  {
    title: "Scan & Order Instantly",
    description: "Guests access live menus, add notes, and submit orders in seconds—no app required.",
    icon: Smartphone,
  },
  {
    title: "Real-Time Staff Alerts",
    description: "Track order status, prep times, and table needs on a unified dashboard built for hotel teams.",
    icon: Sparkles,
  },
  {
    title: "Boost 5★ Reviews",
    description: "Capture feedback at checkout and drive guests straight to your Google Review page.",
    icon: Users2,
  },
  {
    title: "Actionable Analytics",
    description: "See revenue trends, popular dishes, table velocity, and service ratings at a glance.",
    icon: BarChart3,
  },
];

const stats = [
  { label: "Average faster table turns", value: "28%" },
  { label: "Increase in review volume", value: "x3" },
  { label: "Staff time saved per shift", value: "2.5h" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-50">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_rgba(15,23,42,0.1))]" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <span className="flex items-center gap-2 text-lg font-semibold text-sky-300">
          <Sparkles className="h-5 w-5" />
          QuickServe
        </span>
        <div className="flex items-center gap-6 text-sm">
          <Link href="#features" className="text-slate-300 transition hover:text-white">
            Features
          </Link>
          <Link href="#benefits" className="text-slate-300 transition hover:text-white">
            Benefits
          </Link>
          <Link
            href="/dashboard/aurora-grand/login"
            className="rounded-full border border-white/20 px-4 py-2 text-slate-200 transition hover:border-sky-400 hover:text-white"
          >
            Hotel Sign In
          </Link>
        </div>
      </header>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-10 lg:flex-row lg:items-center">
        <div className="max-w-xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-sky-200 backdrop-blur">
            Built for hotels, resorts, and upscale dining teams
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            QR-powered ordering that delights guests and frees your staff
          </h1>
          <p className="text-lg text-slate-300">
            QuickServe replaces paper menus, missed orders, and long waits with a polished guest experience. Each
            table’s QR code launches your live menu, routes orders to the kitchen instantly, and gathers reviews when
            the check is paid.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/aurora-grand/login"
              className="flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
            >
              Launch the demo dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/order/aurora-grand/aurora-grand-table-1"
              className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold text-white/80 transition hover:border-sky-400 hover:text-white"
            >
              Try guest ordering
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-sm text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-black/40 p-6 shadow-xl shadow-sky-500/10 backdrop-blur">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-widest text-slate-400">Live order stream</span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                Online
              </span>
            </div>
            <div className="space-y-3">
              {["Citrus Shrimp Ceviche", "Signature Old Fashioned", "Dark Chocolate Tart"].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{item}</p>
                    <p className="text-xs text-slate-300">Table {index + 2} • 2 mins ago</p>
                  </div>
                  <span className="text-sm font-semibold text-sky-200">Preparing</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/30 to-blue-500/20 p-4">
              <p className="text-sm uppercase tracking-widest text-sky-100">Nightly revenue</p>
              <p className="mt-2 text-3xl font-semibold text-white">$14,280</p>
              <p className="text-xs text-slate-200">+18% vs last week</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-sky-500/10 backdrop-blur"
            >
              <feature.icon className="mb-4 h-10 w-10 text-sky-300" />
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="benefits"
        className="relative z-10 mx-auto mb-16 w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/10 px-6 py-12 text-slate-900 shadow-2xl shadow-sky-500/20 backdrop-blur"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Lower operational costs while elevating the guest journey</h2>
            <p className="mt-4 text-slate-700">
              From independent boutique hotels to multi-property groups, QuickServe helps teams do more with less. Update
              menus centrally, understand peak service windows, and never miss a room-service upsell again.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>• Dynamic menus by restaurant, bar, room service, or pool deck.</li>
            <li>• Instant order routing to kitchen or bar with prep timers.</li>
            <li>• Staff alerts for delays, VIPs, or special dietary notes.</li>
            <li>• Automated satisfaction surveys and review redirects.</li>
            <li>• Export-ready reports for GMs and F&B leadership.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
