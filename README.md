# UroAcademy KZ

React + Vite site with a Supabase-backed admin panel for residents, faculty, meetings, presentations, library items, news, quiz questions, comments, research projects, and editable site content.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
```

3. Start the local site:

```bash
npm run dev
```

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor before using the admin panel. The schema creates the tables, row-level security policies, and public storage buckets used by the site.

Optional demo content is in `supabase/seed.sql`.

## Production Build

```bash
npm run build
```

The production output is generated in `dist`.

For Vercel or Netlify:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
