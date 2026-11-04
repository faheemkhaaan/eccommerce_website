PHONE VERIFICATION FOR THE ORGANIC GHEE STORE
Replace MessageBird with SendPK, using Supabase's "Send SMS Hook"
Prepared 2026-11-04. Vendor prices and rules below are what the vendors published on that date and may change.

======================================================================
0. READ THIS FIRST (the decision, in 6 lines)
======================================================================
1. We are NOT using MessageBird / Bird / Twilio anymore. They cost too much for Pakistan.
2. We use SendPK (sendpk.com), a Pakistani SMS company, to send the one-time code (OTP).
3. Supabase has no built-in SendPK option. That is fine: Supabase has a feature called the
   "Send SMS Hook" that lets us choose how the text is delivered.
4. Supabase STILL does all the authentication work: it generates the 6-digit code, stores it,
   expires it, and checks it. We do NOT write our own OTP generation or storage.
5. Our only new server code is: one small API route (the hook) + one helper that calls SendPK.
6. Phone verification attaches a verified phone number to an EXISTING signed-in email/password
   account. It does NOT create a second, phone-only account.

======================================================================
1. CURRENT STATE OF THE PROJECT (what already exists)
======================================================================
- Next.js App Router + Supabase (Auth + Postgres). Cash-on-delivery ghee shop. Pakistan only.
- Sign-up is email + password with email confirmation. The register form already collects the
  phone number in international format, for example +923001234567.
- A client component PhoneVerify.tsx already exists (send code button, code input, resend
  countdown, "Mobile verified" state). It calls two functions in lib/auth-client.ts:
  startPhoneVerification(phone) and confirmPhoneVerification(phone, code).
- MessageBird was previously configured in the Supabase dashboard as the SMS provider. That was
  only dashboard configuration. It is being replaced by the hook described below.

Agent: before changing anything, READ these files and follow the existing code style:
  components/auth/PhoneVerify.tsx, lib/auth-client.ts, lib/roles.ts, proxy.ts,
  the checkout page, and the SQL function create_order (in the migrations folder).
Do not rewrite files from scratch. Make small, targeted changes. Do not touch unrelated files.

======================================================================
2. HOW THE FLOW WORKS (end to end)
======================================================================
Step 1. A signed-in user (email already confirmed) opens the account page or checkout.
Step 2. The browser calls:  supabase.auth.updateUser({ phone: "+923001234567" })
Step 3. Supabase generates a 6-digit code and CALLS OUR HOOK URL with the phone and the code.
Step 4. Our hook route (POST /api/auth/send-sms) checks the signature, then calls the SendPK API.
Step 5. SendPK texts the code to the customer.
Step 6. The customer types the code. The browser calls:
        supabase.auth.verifyOtp({ phone, token, type: "phone_change" })
Step 7. Supabase marks the phone as confirmed on that same user (auth.users.phone and
        phone_confirmed_at are set).
Step 8. The database function create_order refuses orders from users without a confirmed phone.

IMPORTANT RULES FOR THE CLIENT CALLS
- Use updateUser({ phone }) and verifyOtp({ ..., type: "phone_change" }).
- Do NOT use signInWithOtp or type: "sms". Those create a separate phone-only user.
- updateUser needs a signed-in session. Only show the phone verification UI to signed-in users
  (account page, checkout gate). Never right after sign-up, because email confirmation means
  there is no session yet.
- Phone numbers in the app are always international format with a plus: +923001234567.

======================================================================
3. SENDPK: ACCOUNT SETUP AND COSTS (the human does this, not the agent)
======================================================================
3.1 What SendPK is
  - A PTA-approved Pakistani SMS aggregator (sendpk.com). Routes: Jazz, Zong, Telenor, Ufone.
  - Local traffic only: for Pakistani businesses sending to Pakistani numbers.

3.2 THE ROUTE WE MUST USE FOR OTPs: "Short Code SMS (OTP)"
  - SendPK's Semi Branded and Branded routes are NOT eligible for OTP/transactional traffic.
  - OTP codes go through the Short Code route (shared 4-digit short code, default 8584).
  - Short Code is app-specific: it is approved for ONE application and cannot be reused elsewhere.

3.3 What it costs (published prices; confirm on https://sendpk.com/price.php before paying)
  - Package 1:  Rs 10,000   = 2,083 SMS   (Rs 4.80 per SMS)   valid 1 year   <- smallest package
  - Package 2:  Rs 30,000   = 6,276 SMS   (Rs 4.78 per SMS)   valid 1 year
  - Package 3:  Rs 50,000   = 10,526 SMS  (Rs 4.75 per SMS)   valid 1 year
  - Package 4:  Rs 100,000  = 21,276 SMS  (Rs 4.70 per SMS)   valid 1 year
  - Every code sent costs one SMS. A "resend" costs another SMS.
  - There is NO free SMS allowance on the pricing page. Creating an account is free, but sending
    requires buying a package. (Humans may ask SendPK support whether a test credit exists.)

3.4 Account verification required for the Short Code (OTP) route
  - Sign up at https://sendpk.com/Register.php
  - Upload: CNIC (both sides), a photo of the owner holding the CNIC, a signed legal agreement
    on company letterhead (form provided by SendPK), the NTN (national tax number), and the
    OTP Authorization Form (also on letterhead).
  - The OTP Authorization Form must fully describe the OTP use: app name, purpose, website link,
    app-store link (if any), and where the OTP comes from. Write: the OTP is generated by Supabase
    Auth and sent through the SendPK API from our server when a customer verifies their mobile
    number on the Organic Ghee website.
  - Until the account is verified, messages may have a default demo text added by SendPK.
  - If the owner does not have an NTN, the Short Code route is NOT available. In that case STOP:
    keep developing with Supabase test numbers only (section 5.4) and do not buy a package.

3.5 Create the OTP template (SendPK requires pre-approved fixed templates)
  - In the SendPK dashboard: SMS Templates -> Fixed-SMS-Templates -> create a new template.
  - Example wording:   Your Organic Ghee verification code is #otp#
  - The placeholder MUST be written exactly as #otp# (the variable name is "otp").
  - Wait for approval. After approval, copy the numeric template_id.

3.6 Values the human must collect from SendPK (all go into environment variables)
  - API key:      Dashboard -> Profile -> API Key
  - Sender:       the sender/short code for the OTP route (default short code is 8584; use exactly
                  what the SendPK dashboard shows for the approved route)
  - Template ID:  from step 3.5
  Treat the API key like a password. Never put it in client-side code or in git.

======================================================================
4. SENDPK API REFERENCE (verified from SendPK's documentation, https://sendpk.com/api.php)
======================================================================
Endpoint:      https://sendpk.com/api/sms.php     (GET and POST both work; USE POST)
Content-Type:  application/x-www-form-urlencoded
Parameters (all required unless noted):
  api_key      your API key
  sender       the sender/short code (for OTP route, e.g. 8584)
  mobile       digits only, country code first, NO plus sign:  923001234567
  template_id  the approved template's numeric id
  message      JSON string with ONLY the values that change:  {"otp":"123456"}
               (the wording lives in the approved template; free text is NOT accepted)
Success response (plain text):  OK ID:29346      (anything starting with OK = accepted)
Error responses are a number:
  1 invalid/expired API key or disabled account   2 empty API key     4 empty sender
  5 empty recipient   6 empty message   7 invalid recipient number
  8 insufficient credit (top up the balance)   9 SMS rejected
  12 request rejected (reason is written next to the code)
Quick manual test (run on a server/terminal, not in a browser):
  curl -G 'https://sendpk.com/api/sms.php' -d 'api_key=KEY' -d 'sender=8584' \
    -d 'mobile=923001234567' -d 'template_id=ID' -d 'message={"otp":"123456"}'

======================================================================
5. SUPABASE CONFIGURATION (the human does this in the dashboard)
======================================================================
5.1 Keep the Phone provider ENABLED:  Authentication -> Sign In / Providers -> Phone.
    The hook replaces only the SENDING of the text.
5.2 Remove the old MessageBird credentials from the Phone provider settings (they are unused once
    the hook is on). Do not remove anything else.
5.3 Add the hook:  Authentication -> Auth Hooks -> Send SMS -> choose HTTPS.
      URL:     https://YOUR-DOMAIN/api/auth/send-sms
      Secret:  click generate. It looks like  v1,whsec_XXXXXXXX
      Copy the secret into the environment variable SEND_SMS_HOOK_SECRET (keep the whole string).
    The URL must be publicly reachable over HTTPS (production domain, deployed preview, or a
    tunnel such as ngrok / cloudflared). localhost alone will not work for the real hook.
5.4 FREE DEVELOPMENT WITHOUT ANY SMS (use this until the SendPK account is verified)
    Authentication -> Providers -> Phone -> "Test Phone Numbers and OTPs".
    Add pairs like:   923001234567=123456
    Use the full international number WITHOUT the plus sign in this setting. Set an expiry
    ("valid until"). No SMS is sent to these numbers; the fixed code always works.
    Do not build any special bypass for test numbers in our own code.
    Before launch: delete all test numbers (anyone who knows one can sign in as that user).
5.5 Cost protection (recommended before launch):
    - Authentication -> Rate Limits: lower the SMS limits.
    - Add CAPTCHA (Turnstile or hCaptcha) if a public "send code" form is ever added.
    - Verification happens only for signed-in users, which already limits abuse.

======================================================================
6. CODE TASKS FOR THE AGENT
======================================================================
6.1 Install the signature checker:
      npm i standardwebhooks

6.2 Environment variables (server only; NO NEXT_PUBLIC_ prefix). Add to .env.local, add the NAMES
    (not values) to .env.example, and tell the human to add them in the hosting dashboard:
      SENDPK_API_KEY=
      SENDPK_SENDER=
      SENDPK_TEMPLATE_ID=
      SEND_SMS_HOOK_SECRET=

6.3 Create lib/sms.ts

    import "server-only";

    /** Sends the OTP through SendPK. To change SMS vendor later, only this file changes. */
    export async function sendOtpSms(phone: string, otp: string) {
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

6.4 Create app/api/auth/send-sms/route.ts

    import { Webhook } from "standardwebhooks";
    import { sendOtpSms } from "@/lib/sms";

    type HookEvent = {
        user: { phone?: string; new_phone?: string };
        sms: { otp: string; phone?: string };
    };

    // Which number must receive the code. Newer Supabase versions send it as sms.phone.
    // During a phone change it is user.new_phone. Otherwise it is user.phone.
    const targetPhone = (e: HookEvent) => e.sms.phone || e.user.new_phone || e.user.phone || "";

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

    About targetPhone: Supabase's payload has changed over time. After the first real test (section 8)
    confirm that the code arrives on the NEW number being verified. If it is texted to a different
    number, fix targetPhone and tell the human.

6.5 proxy.ts: it runs on almost every path. Make sure POST /api/auth/send-sms is NOT redirected,
    blocked or required to have a session cookie (Supabase calls it without cookies). If the
    session helper would interfere, exclude "api/auth/send-sms" in the proxy matcher.

6.6 lib/auth-client.ts: the two functions must look like this (adjust to the file's existing
    supabase client variable and style):

    export async function startPhoneVerification(phone: string) {
        const { error } = await supabase.auth.updateUser({ phone });
        if (error) throw new Error(phoneError(error));
    }

    export async function confirmPhoneVerification(phone: string, token: string) {
        const { error } = await supabase.auth.verifyOtp({ phone, token, type: "phone_change" });
        if (error) throw new Error(phoneError(error));
    }

    function phoneError(e: { code?: string; message: string }) {
        switch (e.code) {
            case "phone_exists": return "That number is already linked to another account.";
            case "over_sms_send_rate_limit": return "Too many codes requested. Try again in a few minutes.";
            case "otp_expired": return "That code has expired. Request a new one.";
            case "sms_send_failed": return "We could not send the text. Please try again shortly.";
            default: return e.message;
        }
    }

6.7 PhoneVerify.tsx: keep the existing look. Make these five changes only:
    a) New props: phone (string), verifiedPhone?: string, onVerified?: () => void.
       alreadyVerified = !!verifiedPhone && verifiedPhone === phone. Start in the "done" state
       when alreadyVerified is true.
    b) When the phone prop changes, reset: phase back to "idle" (or "done" if alreadyVerified),
       clear the code, error and cooldown.
    c) After a successful confirm: set phase "done", call onVerified?.(), call router.refresh()
       (useRouter from next/navigation).
    d) Put the code input and Confirm button inside a <form onSubmit> so the Enter key works
       (preventDefault, then confirm). Confirm button type="submit", disabled until the code
       has 6 digits (Supabase's default code length).
    e) Clear the code box whenever a new code is sent.

6.8 Where does verifiedPhone come from?
    Add an optional phone field to the object returned by getCurrentUser in lib/roles.ts, taken
    from the session claims (claims.phone) if present. Log it ONCE during testing to confirm it
    appears after a real verification. If it does not appear in the claims, read it with
    supabase.auth.getUser() instead: use user.phone only when user.phone_confirmed_at is set.
    Pass it to PhoneVerify as verifiedPhone from a server component.
    This value is for the UI only. It is NOT the security check (see 6.9).

6.9 Server-side enforcement (the real protection). A UI alone is not enough; someone could skip it.
    - READ the existing SQL function create_order first. Do not rewrite it from scratch.
    - Add a new migration that creates a helper, then call it at the TOP of create_order.

    create or replace function public.verified_phone() returns text
    language sql stable security definer set search_path = '' as $$
        select case when phone_confirmed_at is not null
                    then nullif(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), '')
               end
        from auth.users where id = auth.uid();
    $$;
    revoke execute on function public.verified_phone() from public, anon;
    grant execute on function public.verified_phone() to authenticated;

    In create_order, near the top (use create_order's real parameter name for the customer phone):
        if public.verified_phone() is null then
            raise exception 'Phone not verified' using errcode = '42501';
        end if;
        if public.verified_phone() is distinct from regexp_replace(<customer phone param>, '\D', '', 'g') then
            raise exception 'Order phone must match the verified phone' using errcode = '42501';
        end if;

    Reason: the confirmation call and the delivery rider use the order's phone number, so it must be
    the verified one. In the checkout UI, pre-fill the phone with the verified number and do not let
    it be edited to a different number. If the user is not verified, show PhoneVerify in the checkout
    before the order form, and refresh after onVerified.

======================================================================
7. DO NOT (common mistakes)
======================================================================
- Do NOT use MessageBird, Bird, Twilio or any other SMS vendor in code or configuration.
- Do NOT call the SendPK API from the browser, and never expose SENDPK_API_KEY or the hook secret.
- Do NOT generate, store or compare OTP codes ourselves. Supabase does that.
- Do NOT use signInWithOtp or verifyOtp with type "sms" for this feature.
- Do NOT log OTP codes, API keys or the hook secret.
- Do NOT accept hook requests without verifying the signature.
- Do NOT use the SendPK Semi Branded or Branded routes for OTPs.
- Do NOT add numbers outside Pakistan (+92) to the verification flow. SendPK is local-only.
- Do NOT change unrelated files or the existing admin / driver / checkout logic beyond what is
  described here.

======================================================================
8. TEST PLAN
======================================================================
A. Without any SMS (free): add a Supabase test number (section 5.4), sign in as an email user,
   enter that number in PhoneVerify, press Send code, type the fixed code, confirm. The phone
   should become verified (auth.users.phone set, phone_confirmed_at not null).
B. SendPK API only: run the curl command in section 4 from a terminal with a verified account and
   a purchased package; confirm the response starts with OK and the text arrives.
C. Full hook (needs a public HTTPS URL and a verified SendPK account with credit): use a REAL
   Pakistani number that is not a test number. Confirm: the text arrives on THAT number, the code
   works, a wrong code is rejected, a second request within 60 seconds is rate-limited, and your
   server logs contain no OTP or key.
D. Security: call the hook URL directly with curl and no signature -> must return 401 and send nothing.
E. Order enforcement: as an unverified user, call create_order (or place an order) -> must fail with
   "Phone not verified". As a verified user with a different phone on the order -> must fail.
F. Edit the phone number in the form after verifying: the "verified" badge must disappear and a new
   code must be required.

======================================================================
9. WHO DOES WHAT
======================================================================
Human:  SendPK signup, paperwork (CNIC, NTN, letterhead forms), buy a package (minimum Rs 10,000),
        approve the OTP template, collect api_key / sender / template_id, configure the Supabase
        dashboard (sections 5.1 - 5.5), add environment variables in the hosting dashboard.
Agent:  sections 6.1 - 6.9 only (code and SQL), plus the tests in section 8 that need no vendor account.
If something in this document conflicts with what the code actually looks like, STOP and ask the
human instead of guessing.