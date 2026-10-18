const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const dev = process.env.NODE_ENV !== "production";

// DEV STUBS: replace each body with a real request to your backend.

export async function requestOtp(phone: string): Promise<void> {
    await wait(700);
    if (dev) console.debug("[stub] requestOtp", phone);
    // TODO: POST /api/auth/otp/request { phone } → your WhatsApp Business provider
}

export async function verifyOtp(phone: string, code: string, remember: boolean): Promise<void> {
    await wait(700);
    if (dev) console.debug("[stub] verifyOtp", phone, remember);
    if (code !== "1234") throw new Error("That code isn’t right. Please try again.");
    // TODO: POST /api/auth/otp/verify { phone, code, remember }
}

export async function signInWithPassword(email: string, password: string, remember: boolean): Promise<void> {
    await wait(700);
    if (dev) console.debug("[stub] signInWithPassword", email, remember);
    if (password.length < 6) throw new Error("Email or password is incorrect.");
    // TODO: POST /api/auth/login { email, password, remember }
}


export type RegisterPayload = {
    name: string;
    phone: string; // full international number, e.g. +923001234567
    email?: string;
    size: string;
    city: string;
    address: string;
    password: string;
    notifyWhatsApp: boolean;
};

export async function registerAccount(payload: RegisterPayload): Promise<void> {
    await wait(900);
    if (dev) console.debug("[stub] registerAccount", { ...payload, password: "••••" });
    // TODO: POST /api/auth/register { ...payload }
}