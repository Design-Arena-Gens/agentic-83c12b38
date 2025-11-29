## QuickServe QR Ordering Platform

Smart, multi-property QR ordering platform for hotels and restaurants. Guests scan a table-specific code, browse live menus, submit orders, and rate their visit; staff manage everything from a real-time dashboard with menu, table, and analytics controls.

### Features

- **Guest ordering**: QR-powered menu with cart, special requests, and order confirmation flows.
- **Multi-hotel support**: each property has dedicated menus, tables, analytics, and staff PIN login.
- **Staff dashboard**: live order Kanban, revenue & satisfaction metrics, top-selling insights.
- **Menu control**: inline editing, availability toggles, category-aware organization.
- **Table management**: create/rename tables and instantly regenerate QR codes + shareable links.
- **Feedback loop**: post-meal rating capture plus one-click redirect to Google Reviews.

### Tech stack

- Next.js 16 App Router, TypeScript, Tailwind CSS
- Prisma ORM with SQLite (file-based development DB)
- SWR for lightweight client revalidation
- Zustand for client-side cart state
- Vercel deployment-ready (build runs `prisma generate` automatically)

### Local Development

1. Install dependencies
   ```bash
   npm install
   ```
2. Generate the Prisma client & sync the SQLite schema
   ```bash
   npx prisma db push
   ```
3. Seed sample hotels, menus, and tables
   ```bash
   npm run db:seed
   ```
4. Start the dev server
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`
   - Landing page provides quick access links to guest and staff flows
   - Demo PINs: `Aurora Grand` (slug `aurora-grand`) uses `4321`; `Coastal Breeze` uses `9876`

### Environment Variables

Copy `.env` for local overrides:

```
DATABASE_URL="file:./prisma/dev.db"
ADMIN_SESSION_SECRET="your-strong-secret"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Deployment Notes

- `npm run build` runs `prisma generate && next build`, ensuring the Prisma client stays aligned with cached installs on Vercel.
- Vercel production checks land at `https://agentic-83c12b38.vercel.app`.
- Update `NEXT_PUBLIC_BASE_URL` with the production origin so generated QR codes point to the correct host.
