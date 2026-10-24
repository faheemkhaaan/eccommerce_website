import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less Supabase client for public reads.
 *
 * A `use cache` scope cannot call cookies(), so the catalogue is fetched with the
 * anon key and RLS decides what is visible rather than the caller's session.
 */
export const publicClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
);
