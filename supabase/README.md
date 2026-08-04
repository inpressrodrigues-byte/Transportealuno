# Supabase storage

1. Create a Supabase project.
2. Run `migrations/001_app_state.sql` in the SQL editor.
3. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
4. Redeploy the project.

The service-role key must remain server-only. The table has RLS enabled and no
browser role is allowed to read or write the application state.
