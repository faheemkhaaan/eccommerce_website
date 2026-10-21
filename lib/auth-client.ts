import { createClient } from "@/lib/supabase/client";

export type AuthErrorCode =
    | "email_not_confirmed"
    | "already_exists"
    | "rate_limit"
    | "invalid_credentials";

/** Typed auth error so the UI can react to specific cases (e.g. offer a verification resend). */
export class AuthError extends Error {
    code?: AuthErrorCode;
    constructor(message: string, code?: AuthErrorCode) {
        super(message);
        this.name = "AuthError";
        this.code = code;
    }
}

export type RegisterPayload = {
    name: string;
    phone: string; // e.g. +923001234567
    email: string;
    size: string;
    city: string;
    address: string;
    password: string;
    notifyWhatsApp: boolean;
};

export async function registerAccount(p: RegisterPayload): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
        email: p.email,
        password: p.password,
        options: {
            // the SQL trigger turns this into a profile row and a default address
            data: {
                full_name: p.name,
                phone: p.phone,
                size: p.size,
                city: p.city,
                address: p.address,
                notify_whatsapp: p.notifyWhatsApp,
            },
        },
    });

    if (error) {
        if (error.status === 429)
            throw new AuthError("Too many emails sent. Please wait a few minutes and try again.", "rate_limit");
        throw new AuthError("We couldn’t create your account. Please check your details and try again.");
    }
    // For an already-registered email Supabase hides the fact and returns a user with no identities
    if (data.user && data.user.identities?.length === 0)
        throw new AuthError("An account with this email already exists. Try signing in instead.", "already_exists");
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
        if (error.code === "email_not_confirmed")
            throw new AuthError("Please verify your email first. Check your inbox for the confirmation link.", "email_not_confirmed");
        throw new AuthError("Email or password is incorrect.", "invalid_credentials");
    }
}

/** Re-send the signup confirmation email to an unverified address. */
export async function resendVerification(email: string): Promise<void> {
    const { error } = await createClient().auth.resend({ type: "signup", email });
    if (error) {
        if (error.status === 429)
            throw new AuthError("Please wait a minute before requesting another email.", "rate_limit");
        throw new AuthError("We couldn’t resend the email. Please try again.");
    }
}
