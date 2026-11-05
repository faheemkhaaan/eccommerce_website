"use server";

import { messageProblem, type ContactResult } from "@/lib/contact";
import { toE164 } from "@/lib/phone";
import { getCurrentUser } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

const text = (value: FormDataEntryValue | null) => String(value ?? "").trim();

/**
 * Files a message from anyone — a signed-in customer or a signed-out guest with
 * a delivery problem.
 *
 * Returning a result rather than redirecting lets the form report a refusal in
 * place and keep what the customer wrote; a redirect would empty the box on the
 * one page where losing the text is most annoying.
 *
 * This is not the security boundary. The insert policy in migration 0011 admits
 * any sender but pins the row to `new`, and a trigger stamps the account from
 * the session — so a request that skips this action still cannot file itself as
 * handled, or under somebody else's account.
 */
export async function sendMessage(
    _previous: ContactResult | null,
    formData: FormData,
): Promise<ContactResult> {
    // A field no human sees, sitting off-screen. Filled means a bot; answer as if
    // it worked so it has nothing to learn from the response.
    if (text(formData.get("company"))) return { ok: true };

    const name = text(formData.get("name"));
    const email = text(formData.get("email"));
    const phone = text(formData.get("phone"));
    const topic = text(formData.get("topic"));
    const orderRef = text(formData.get("order_ref"));
    const body = text(formData.get("body"));

    const problem = messageProblem({ name, email, phone, topic, orderRef, body });
    if (problem) return { ok: false, message: problem };

    // Optional: a guest has no account, and still deserves an answer.
    const user = await getCurrentUser();

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
        // `user_id` is left out on purpose — the trigger files this under whoever
        // the session says is asking, so the account on the row cannot be forged.
        order_ref: orderRef || null,
        name,
        email: email || null,
        phone: phone ? toE164(phone) : null,
        topic,
        body,
    });

    if (error) {
        return {
            ok: false,
            message: `Your message could not be sent. Please try again${user ? "" : ", or reach us on WhatsApp"}.`,
        };
    }

    return { ok: true };
}
