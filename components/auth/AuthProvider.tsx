"use client";

import { useEffect, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        const supabase = createClient();
        // fires INITIAL_SESSION on subscribe, then on every sign in, sign out and token refresh
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null); // keep this callback synchronous
        });
        return () => subscription.unsubscribe();
    }, [setUser]);

    return <>{children}</>;
}