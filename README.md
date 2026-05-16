# iDaPro Store

Amazon affiliate store for screen protectors and accessories. Built with React + TypeScript + Tailwind CSS.

## Deploy

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

### Quick Start

1. Push this directory to GitHub
2. Import to Vercel (Framework Preset: **Other**, no build command)
3. Create Supabase tables (see DEPLOY.md SQL)
4. Update Supabase URL & key in `index.html`
5. Done!

### Admin Panel

- URL: `/admin`
- Password: set in `index.html` → `__ADMIN_PASS__`

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- tRPC + Drizzle ORM
- Supabase (PostgreSQL)
- Vercel (Hosting)
