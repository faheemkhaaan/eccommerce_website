import "server-only";

/**
 * Sends a one-time code through SendPK, our Pakistani SMS aggregator.
 *
 * Supabase still owns the OTP: it generates the code, stores it, expires it and
 * checks it. This file only delivers the text. Keeping the vendor call in one
 * place means switching providers later touches nothing else.
 *
 * @param phone Recipient in E.164 form, e.g. `+923001234567`.
 * @param otp   The code Supabase generated for this request.
 * @throws When the number is not a Pakistani mobile, or SendPK rejects the message.
 */
export async function sendOtpSms(phone: string, otp: string): Promise<void> {
    const mobile = phone.replace(/\D/g, ""); // "+92300..." becomes "92300..."
    if (!/^923\d{9}$/.test(mobile)) throw new Error("Only Pakistani mobile numbers are supported");

    const res = await fetch("https://sendpk.com/api/sms.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            api_key: process.env.SENDPK_API_KEY!,
            sender: process.env.SENDPK_SENDER!,
            mobile,
            template_id: process.env.SENDPK_TEMPLATE_ID!,
            message: JSON.stringify({ otp }),
        }),
        signal: AbortSignal.timeout(4000), // Supabase only waits a few seconds for the hook
    });

    const body = (await res.text()).trim();
    // Success looks like "OK ID:29346". A bare number is an error code (8 = out of credit).
    if (!body.startsWith("OK")) throw new Error(`SendPK rejected the message (response: ${body})`);
}
