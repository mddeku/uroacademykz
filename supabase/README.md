# Supabase setup for UroAcademy KZ

1. Open your Supabase project.
2. Go to `SQL Editor`.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Reload the local site at `http://localhost:3000`.

The React app already has the public Supabase client configured in `src/lib/supabase.ts`.
The first live section is `Residents`: it tries Supabase first and falls back to local mock data if the table is missing or empty.

Do not paste a `service_role` key into the frontend or chat. It must stay server-only.
