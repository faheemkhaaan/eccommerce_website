import { Webhook } from "standardwebhooks";
import { sendOtpSms } from "@/lib/sms";

/**
 * Shape of the payload Supabase posts to the Send SMS hook.
 * The target number has moved between fields across Supabase versions, so all
 * three candidates are declared and resolved by {@link targetPhone}.
 */
type HookEvent = {
    user: { phone?: string; new_phone?: string };
    sms: { otp: string; phone?: string };
};

/**
 * Works out which number must receive the code: a phone change puts the new
 * number on `user.new_phone`, newer versions put it on `sms.phone`, and any
 * other SMS flow uses the account's `user.phone`.
 */
const targetPhone = (e: HookEvent) => e.sms.phone || e.user.new_phone || e.user.phone || "";

/**
 * Supabase Send SMS hook. Supabase calls this to deliver an OTP; we verify the
 * request really came from Supabase, then hand the code to SendPK.
 *
 * Returns an empty 200 on success. Any non-2xx tells Supabase the send failed,
 * which is what makes the caller see "we could not send the text".
 */
export async function POST(req: Request) {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const secret = (process.env.SEND_SMS_HOOK_SECRET ?? "").replace("v1,whsec_", "");

    // Only Supabase may trigger a paid SMS: reject anything without a valid signature.
    let event: HookEvent;
    try {
        event = new Webhook(secret).verify(payload, headers) as HookEvent;
    } catch {
        return Response.json({ error: { http_code: 401, message: "Invalid signature" } }, { status: 401 });
    }

    try {
        await sendOtpSms(targetPhone(event), event.sms.otp);
    } catch (e) {
        // NEVER log the OTP or the API key.
        console.error("send-sms hook failed:", e instanceof Error ? e.message : e);
        return Response.json(
            { error: { http_code: 500, message: "We could not send the text. Please try again shortly." } },
            { status: 500 },
        );
    }

    return Response.json({}); // an empty 200 response means success to Supabase
}
