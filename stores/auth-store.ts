import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

type Status = "loading" | "authenticated" | "guest";

type AuthState = {
    user: User | null;
    status: Status;
    setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: "loading",
    setUser: (user) => set({ user, status: user ? "authenticated" : "guest" }),
}));