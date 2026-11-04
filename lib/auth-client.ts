import { createClient } from "@/lib/supabase/client";

export type AuthErrorCode =
    | "email_not_confirmed"
    | "already_exists"
    | "rate_limit"
    | "invalid_credentials"
    | "phone_taken"
    | "invalid_code"
    | "expired";

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

/**
 * Turns a Supabase phone-auth error into copy we are happy to show a customer.
 * Anything we do not recognise keeps Supabase's own message, so a real failure
 * (a mis-configured provider, say) is never hidden behind a vague string.
 */
function phoneError(error: { code?: string; status?: number; message: string }): AuthError {
    if (error.status === 429 || error.code === "over_sms_send_rate_limit")
        return new AuthError("Too many codes requested. Please wait a minute and try again.", "rate_limit");
    switch (error.code) {
        case "phone_exists":
            return new AuthError("That number is already linked to another account.", "phone_taken");
        // Supabase reports a wrong code and an expired one the same way.
        case "otp_expired":
            return new AuthError("That code isn’t right or has expired. Request a new one.", "expired");
        case "sms_send_failed":
            return new AuthError("We couldn’t send the text. Please try again shortly.");
        default:
            return new AuthError(error.message || "Something went wrong. Please try again.");
    }
}

/**
 * Texts a one-time code so the signed-in account can claim this number.
 * Supabase generates, stores, expires and throttles the code; we only start the flow.
 *
 * @param phone The number to verify, in E.164 form (`+923001234567`).
 * @throws {AuthError} When the send is refused or the number is already taken.
 */
export async function startPhoneVerification(phone: string): Promise<void> {
    const { error } = await createClient().auth.updateUser({ phone });
    if (error) throw phoneError(error);
}

/**
 * Confirms the code {@link startPhoneVerification} sent, which marks the phone
 * verified on the same account (`phone_confirmed_at`).
 *
 * @param phone The same E.164 number the code was sent to.
 * @param token The code the customer read from the SMS.
 * @throws {AuthError} When the code is wrong or has expired.
 */
export async function confirmPhoneVerification(phone: string, token: string): Promise<void> {
    const { error } = await createClient().auth.verifyOtp({ phone, token, type: "phone_change" });
    if (error) throw phoneError(error);
}
