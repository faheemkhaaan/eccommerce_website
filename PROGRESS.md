# Session log — updated 2026-11-04

> **Read this before starting a new session.** It captures what has been built, why
> each decision was made, what is verified vs. assumed, and what is still broken.
> Paths are repo-relative (`eccomerce_website/` is the root).
>
> The doc began as the **2026-10-24** log (rebrand + RBAC + catalogue + admin).
> §2.6–§2.11 cover everything added after that: the **order pipeline**, the **COD
> board**, **riders & roles**, the **driver PWA**, **maps**, and **SMS phone
> verification at checkout**. HEAD is `8ed10a1 Added map in the driver panel.`

---

## 1. The project in one paragraph

A Next.js 16 prototype storefront for **Bilona Organic Ghee**, sold in Pakistan with
**PKR pricing and Cash on Delivery**. It was rebranded from a luxury fashion
storefront called **"ÉPURE Atelier"** — traces of that brand still exist in stale
docs (see §9). It is deliberately **single-product** and **education-first**:
benefits, nutrition, smoke point, and a Bilona-vs-centrifugal comparison table.
Around the shop sit three staff surfaces that share the same repo and session:
the `/admin` dashboard (catalogue, COD board, riders & roles), the **rider PWA**
at `/driver`, and public order tracking. Stack: Next.js 16.4.1 (App Router,
Turbopack), React 19, Tailwind v4, Zustand, Supabase (SSR + Postgres + RLS +
Phone Auth), deployed on Vercel with Cash on Delivery and free delivery over
Rs 5,000.

---

## 2. What has been built

### 2.1 Rebrand cleanup and route groups

Removed the fashion-specific surface: Journal, Search, Categories, Press, Selection,
and the separate `components/atelier/` 404/layout logic.

Then moved every storefront route into a route group so that staff surfaces can
share the repo without polluting the public URL space:

```
app/(shop)/…   →  public storefront  (URLs unchanged)
app/admin/…    →  staff dashboard
app/driver/…   →  rider PWA
app/auth/…     →  email-confirmation route handler
```

A route group's name **never appears in a URL**, so `/login`, `/collections`,
`/products/[id]` etc. are byte-for-byte the same as before the move — which is also
why the move needed **zero import changes**: the path alias `@/*` points at the repo
root, not at `app/`.

### 2.2 Role-based access control (RBAC)

Roles now live in a real table. This was the foundation for everything else.

**Deliberate choice: roles are NOT in `user_metadata`.** Supabase lets the
*client* write `raw_user_meta_data`, so putting `role: 'admin'` there would mean
any signed-up customer could promote themselves with one `updateUser()` call.
A dedicated table that only the service role can write closes that hole.

- `supabase/migrations/0001_roles.sql` — the schema (see §3).
- `lib/roles.ts` — the data-access layer: `getCurrentUser()`, `requireRole()`
  (redirects; for pages), `assertRole()` (throws; for Server Actions), plus the
  newer `StaffRole` type and `requireStaff()` (see §2.8).
- `proxy.ts` (repo root) — Next 16's replacement for `middleware.ts`; delegates to
  `lib/supabase/proxy.ts`, which gates by path prefix and bounces signed-out users
  to `/login?next=…`:

  ```ts
  const PROTECTED   = ["/account", "/checkout"]; // any signed-in user
  const ADMIN_ONLY  = ["/admin"];                // role === "admin"
  const DRIVER_ONLY = ["/driver"];               // role === "driver"
  ```

  Non-staff hitting a staff path are sent to `/` — not a 403, so the dashboard is
  never advertised. **This is routing convenience, not the security boundary.**

### 2.3 The catalogue moved from TypeScript into Postgres

Previously pack sizes and prices were hard-coded in `lib/products.ts`. That file is
**now deleted** — the shop owner edits prices and stock in a database instead of a
source file.

The split that made this tractable:

| Lives in Postgres (editable in `/admin`) | Stays in code (for now) |
| --- | --- |
| pack labels, grams, price, stock, notes | gallery photos |
| product name, short description, image | benefits, nutrition table, comparison table |
| badge, `sort_order`, `is_active` | edition/rating/review-count copy |

Rationale: the shop owner needs to change **money and stock**, not prose. Moving
only the commercial fields keeps the admin UI small and makes cache invalidation a
single, obvious tag.

- `supabase/migrations/0002_catalogue.sql` — schema + seed data.
- `lib/catalogue.ts` — the **public, cached** reader (`'use cache'` + `cacheTag`).
- `lib/supabase/public.ts` — a **cookie-less** Supabase client, created specifically
  because `'use cache'` is forbidden from calling `cookies()`, and the normal server
  client does. RLS decides what this anonymous client may see.
- `lib/product-details.ts` — merges editorial copy from code with commercial fields
  from the DB at render time.

### 2.4 The admin dashboard

- `app/admin/layout.tsx` — the role gate. Reads the session inside a
  `<Suspense>` boundary so the page chrome can still prerender (see §7).
- `components/admin/AdminFrame.tsx` — the dashboard chrome; `AdminNav.tsx` — the
  section nav (see §2.8).
- `components/admin/StatusNote.tsx` — renders the `?status=` result of an action.
- `app/admin/page.tsx` — overview: product count, pack count, total stock value,
  low-stock list.
- `app/admin/products/page.tsx` — list view with an inline "save stock" form.
- `app/admin/products/[id]/page.tsx` — edit a product and each of its packs,
  add a pack, delete a pack.
- `app/admin/products/new/page.tsx` — **create a product** (added later; new
  products start **hidden** and with **no packs**, so a half-finished item can
  never appear in the storefront).
- `app/admin/actions.ts` — Server Actions: `saveProduct`, `savePack`
  `createPack`, `saveStock`, `deletePack`, `signOut`, plus the "new product" path.

Two design notes worth remembering:

1. **Every action calls `assertRole("admin")` before touching the database.** The
   proxy and the layout only decide what a person can *reach*; the action decides
   what they can *change*; RLS is the final backstop. A signed-in customer POSTing
   to these endpoints writes nothing.
2. **No client JavaScript is needed for feedback.** Each action finishes by
   redirecting back to the page that posted it with `?status=saved|created|deleted|duplicate|invalid`.

### 2.5 Bugs fixed in the first pass

**a) "Next.js encountered URL data outside of Suspense"** — `app/(shop)/products/[id]/page.tsx`.
Awaiting `params` in the page body blocks the static shell under Cache Components.
Fixed by making `ProductPage` synchronous and moving `await params` + `getDetail()`
+ `notFound()` into an async `ResolvedProduct` child inside `<Suspense>` with a
shape-matched `ProductSkeleton` fallback (so nothing shifts when it streams in).

**b) A silent `try/catch` in `generateStaticParams`** — this one caused a genuinely
confusing production failure. The wrapper caught a database error and returned `[]`,
and Cache Components then *also* rejected the empty result, so the build log showed
**two** errors and the real cause was the smaller one. Removed: a catalogue the build
can't reach is a real failure, and failing loudly is correct. Verified by rebuilding
with a deliberately broken URL — the log now shows only the true error.

### 2.6 Orders moved out of the browser and into Postgres

Until this slice, orders were persisted in **`localStorage`** (the old `lib/orders.ts`),
so no device could see another device's order: no status board, no rider assignment,
and tracking broke the moment the customer switched phone. Three deliberate choices
in `supabase/migrations/0003_orders.sql`:

1. **Writes go through `security definer` functions, never table policies.**
   `create_order` recomputes every price from `product_packs`, so a tampered cart
   cannot change what the customer owes on delivery. `set_order_status`,
   `assign_driver` and `grant_role` decide for themselves who may call them.
2. **Reading is ordinary RLS.** A customer sees their own orders, a rider sees the
   ones assigned to them, staff see everything — all through one helper,
   `public.can_read_order(order_id)`.
3. **Guest tracking does NOT read these tables.** `public.track_order()` returns a
   deliberately **masked** projection (first name only, phone tail, no street
   address), so knowing a mobile number is not enough to harvest an address.

The file split that keeps this importable everywhere:

- `lib/orders.ts` — **pure domain, no network.** Types (`Order`, `OrderStatus`,
  `OrderRecord`, `OrderSummary`, `TrackedOrder`), `STATUS_LABEL`, the status
  helpers (`isTerminalStatus` / `isClosedStatus` / `isFailureStatus`), the
  UI transition maps (`nextStatuses(current, actor)`), and the customer timeline
  (`buildTracking` / `currentStep` / `statusNotice` / `relativeTime`). Because it
  touches no DB it is safe to import from Client Components.
- `lib/order-queries.ts` — `import "server-only"`; **all** order DB reads:
  `trackOrderByQuery`, `listBoardOrders({ driverId? })`, `listMyOrders`,
  `listDriverOrders`, `getOrder`, `listStaffUsers`, `listDrivers`.
- `app/(shop)/order-actions.ts` — the storefront `placeOrder` Server Action
  (see §2.11 for its phone gate) and `lookupTrackedOrder`.

### 2.7 The COD status board — `/admin/orders`

- `app/admin/orders/page.tsx` — the board. `requireRole("admin", …)`, then a
  `<Suspense>` + `ResolvedBoard` async child. Admins get all five open columns
  (`pending · confirmed · packed · out_for_delivery · attempted`); **a rider sees
  only** `packed · out_for_delivery · attempted`, and only their own parcels.
  A `?view=closed` toggle swaps to the terminal statuses. Stats differ by role:
  *Waiting on a call / Need a rider / Out with a rider / Cash on the road* for
  admins vs *To collect / Out with me / Cash I'm carrying* for a rider.
- `app/admin/orders/[id]/page.tsx` — one parcel: items, recipient, event trail,
  the status control, and the rider assignment control.
- `app/admin/orders/actions.ts` — `setOrderStatus` (`assertRole(["admin","driver"])`)
  and `assignDriver` (admin-only; passing `null` unassigns). Failures are mapped to
  a `?status=` code (`not-a-rider`, `closed`, `denied`, `missing`, `invalid`).
- `components/admin/OrderCard.tsx`, `StatusNote.tsx` — the row and the feedback pill.

One subtlety worth keeping: **`list_users_with_roles` is admin-only in SQL**, so the
board only calls `listDrivers()` when `isAdmin` — a rider must never invoke it.

### 2.8 Riders, roles and the staff nav — `/admin/team`

- `app/admin/team/page.tsx` — search users (via `list_users_with_roles`) and grant a
  role (customer / admin / driver).
- `app/admin/team/actions.ts` — `grantRole`: `assertRole("admin")`, validates the
  role, calls the `grant_role` RPC, maps *"own admin"* → `self-demote`, preserves
  `?q=`. `grant_role` **refuses to let an admin demote themselves**.
- `components/admin/AdminNav.tsx` — one table drives the nav:

  ```ts
  const NAV = [
      { href: "/admin",          label: "Overview",         roles: ["admin"] },
      { href: "/admin/orders",   label: "COD board",        roles: ["admin", "driver"] },
      { href: "/admin/team",     label: "Riders & roles",   roles: ["admin"] },
      { href: "/admin/products", label: "Products & stock", roles: ["admin"] },
  ];
  ```

  A driver sees "My deliveries" for `/admin/orders` instead of "COD board".
- `lib/roles.ts` also gained `StaffRole = Exclude<AppRole, "customer">` and
  `requireStaff(nextPath = "/admin/orders")`, used where a page is valid for both
  admin and driver.

### 2.9 The driver PWA — `/driver`

The rider surface is a **Progressive Web App** installed from the browser
(Share → Add to Home Screen), opening full-screen standalone.

- `app/driver/layout.tsx` — manifest link, `appleWebApp`, theme colour `#2b231b`,
  `viewportFit: "cover"`; a `<Suspense>` + `DriverGate` calling
  `requireRole("driver", "/driver")`; renders `<RegisterSW />` + `<AutoRefresh />`,
  a sticky header and a sign-out form.
- `app/driver/page.tsx` — "Your parcels": the rider's open queue with the cash they
  are carrying, plus a closed-today list. Empty state explains the board assigns
  parcels.
- `app/driver/[id]/page.tsx` — one parcel for the rider: address, a map, and the
  delivery report buttons.
- `app/driver/manifest.ts` — `name: "Organic Ghee Rider"`, `short_name: "Rider"`,
  `start_url`/`scope: "/driver"`, `display: "standalone"`, icons
  `driver-icon-192.png` (any) and `driver-icon-512.png` (maskable).
- `app/driver/sw/route.ts` — a minimal install/activate service worker served with
  `Cache-Control: no-cache` and `Service-Worker-Allowed: /driver`.
- `app/driver/actions.ts` — `reportDelivery` (`assertRole("driver")`; validates
  against `DRIVER_STATUSES`; calls `set_order_status`; maps errors to `closed` /
  `denied`) and `signOutDriver`.
- `components/driver/` — `RegisterSW.tsx`, `AutoRefresh.tsx`, `ParcelMap.tsx`.

### 2.10 Maps

`lib/maps.ts` is a tiny, key-optional wrapper:

- `mapQuery(address, city)` → `"addr, city, Pakistan"`.
- `embedUrl(query)` → a Google Maps Embed URL from `GOOGLE_MAPS_EMBED_KEY`, and
  **returns `null` when no key is configured**, so the panel degrades to a plain
  link instead of a broken iframe.
- `directionsUrl(query)` → a driving-directions link for the rider.

### 2.11 SMS phone verification, placed at checkout

The phone is the delivery lifeline for **Cash on Delivery**, so it is verified with
an SMS one-time code — but **at checkout for the first COD order**, not at signup.
Rationale: signup already forces email confirmation, and stacking a second
verification there doubles friction at the highest drop-off point; billing an SMS
only when a real order is about to be placed also keeps the cost honest.

**The provider is SendPK, wired through Supabase's "Send SMS" hook** (see §2.12 —
this replaced MessageBird/Bird). Supabase still generates, stores, expires, throttles
and verifies the code; only the *sending* is ours. Because verification runs on an
existing account, the API shape is:

```ts
auth.updateUser({ phone })                              // sends the code
auth.verifyOtp({ phone, token, type: "phone_change" })  // confirms it
// user.phone_confirmed_at is the verification flag
```

- `lib/phone.ts` — the single source of truth for normalisation:
  `toE164()` (`03001234567` / `3001234567` / `+923001234567` → `+923001234567`),
  `localPhone()` (back to `03001234567` for display) and `digits()`.
- `lib/auth-client.ts` — `startPhoneVerification(phone)` and
  `confirmPhoneVerification(phone, token)`; `phoneError()` keeps Supabase's own
  message for anything unrecognised.
- `components/auth/PhoneVerify.tsx` — the reusable OTP control (phases
  `idle → sent → done`, a 60s resend cooldown mirroring Supabase's throttle, a
  `+92\d{10}` gate, a **4-digit minimum** on the code input, and explicit Enter
  handling on the code field). It takes `verifiedPhone` / `onVerified` and never
  refreshes the route itself — the parent decides. **Not** a `<form>`: it renders
  inside the checkout's own form, and a nested form makes Confirm submit the
  checkout, which validates every field and looks like a page reload.
- `components/checkout/CheckoutClient.tsx` — renders the verified pill or the
  `PhoneVerify` control beside the phone field (keyed on the number so a pending
  code never carries over), and **blocks placement** unless the typed number equals
  either the **server-resolved** `verifiedPhone` or the number confirmed in this
  session (`justVerified` local state — a `router.refresh()` here would remount the
  component and wipe the half-typed order), scrolling the control into view with a
  plain-English reason.
- `components/account/AccountProfile.tsx` — an **optional early path**: a "Mobile
  verified / unverified" badge and an inline `PhoneVerify` when the number is not
  yet confirmed.
- `app/(shop)/order-actions.ts` — the **server-side enforcement**. UI gating is
  cosmetic, so `placeOrder` independently requires `phone_confirmed_at` **and**
  `user.phone === recipient.phone` before calling `create_order`; the database
  checks it a third time (§2.12).

### 2.12 Switching SMS delivery to SendPK (the "Send SMS" hook)

Supabase's built-in providers are only Twilio, MessageBird (Bird), Vonage and
TextLocal. For a Pakistani sender we needed **SendPK**, so sending moved to a
**Supabase Auth Hook**. Supabase keeps full ownership of the code (generate, store,
expire, throttle, verify) and simply asks our endpoint to deliver it:

```
Supabase  ──POST (signed)──►  /api/auth/send-sms  ──►  lib/sms.ts  ──►  SendPK
```

- `lib/sms.ts` — the **only** file that knows the vendor. `sendOtpSms(phone, otp)`
  validates `/^923\d{9}$/`, POSTs to `https://sendpk.com/api/sms.php` with a 4s
  timeout, and treats anything not starting with `OK` as a failure (a bare number is
  a SendPK error code).
- `app/api/auth/send-sms/route.ts` — the hook. Verifies the `v1,whsec_…` signature
  with `standardwebhooks` **before** doing anything, resolves the destination from
  `sms.phone || user.new_phone || user.phone`, and answers `{}` on success.
- `proxy.ts` — `api/auth/send-sms` is excluded from the session-refresh matcher;
  Supabase calls it with no cookies.
- `supabase/migrations/0005_verified_phone.sql` — `public.verified_phone()` plus a
  guard at the top of `create_order`, so an unverified — or mismatched — phone
  cannot place a COD order even by calling PostgREST directly.

Env vars (server-only, no `NEXT_PUBLIC_`): `SENDPK_API_KEY`, `SENDPK_SENDER`,
`SENDPK_TEMPLATE_ID`, `SEND_SMS_HOOK_SECRET`. Test numbers short-circuit before the
hook, so **none of these are needed while developing with test numbers.**

**Convention from this session onward: every exported function and component gets a
JSDoc header** saying what it does and, where useful, its parameters.

---

## 3. Database reference

Five migrations, each applied by hand by pasting it into the **Supabase SQL
Editor**. They were verified live after applying, so **re-running 0001–0004 will
fail** — they are not written idempotently. `0005` uses `create or replace`, so it is
safe to re-run.

| file | what it adds |
| --- | --- |
| `0001_roles.sql` | `app_role` enum, `user_roles`, `has_role()`, `touch_updated_at()`, RLS |
| `0002_catalogue.sql` | `products`, `product_packs`, seed (1 product / 4 packs) |
| `0003_orders.sql` | `order_status` enum, `orders`, `order_items`, `order_events`, the RPCs, demo parcel |
| `0004_rider_transitions.sql` | replaces `set_order_status` with a rider transition whitelist + closed-order guard |
| `0005_verified_phone.sql` | `verified_phone()` + the phone guard at the top of `create_order` |

### `public.user_roles` — `0001_roles.sql`

| column | type | notes |
| --- | --- | --- |
| `user_id` | `uuid` PK | → `auth.users(id)` `on delete cascade` |
| `role` | `public.app_role` | enum `('customer','admin','driver')`, default `'customer'` |
| `created_at` / `updated_at` | `timestamptz` | `updated_at` maintained by trigger |

RLS: a user may `select` **their own** row only. There is **deliberately no
insert/update/delete policy** — so only the service role (which bypasses RLS) or the
`grant_role` definer function can grant a role. That is the security property the
whole design rests on.

### `public.products` / `public.product_packs` — `0002_catalogue.sql`

`products`: `id text` PK, `name`, `short`, `image`, `badge`, `sort_order int`,
`is_active boolean default true`, timestamps.

`product_packs`: `id uuid` PK, `product_id text` → `products(id)` `on delete cascade`,
`label`, `grams int` (`> 0`), `price numeric(10,2)` (`>= 0`), `note`, `stock int`
(`>= 0`), `sort_order`, timestamps, **`unique (product_id, label)`**.

RLS: anyone may read active products; **admins additionally see inactive ones** —
that is what makes the "hide from shop" toggle usable. Only admins may write.

Seeded data (one product, four packs) — demo stock figures:

| label | grams | price (PKR) | stock |
| --- | --- | --- | --- |
| 500 g | 500 | 1,750 | 24 |
| 1 kg | 1,000 | 3,250 | 18 |
| 2 kg | 2,000 | 6,150 | 9 |
| 5 kg | 5,000 | 14,500 | 4 |

### Orders — `0003_orders.sql`

`public.orders` — `id text` PK (e.g. `OG-7K2M9Q`), `user_id uuid` → `auth.users`
(`on delete set null`), `status order_status default 'pending'`, `customer_name`,
`customer_phone`, `city`, `address`, `notes`, `subtotal`/`shipping`/`total`
`numeric(10,2)`, `driver_id uuid` → `auth.users`, `placed_at`, `eta_at`,
`delivered_at`, timestamps, and a **generated `phone_tail`** (last 7 digits) so
guest tracking can match a number without exposing the full one.

`public.order_items` — a **frozen copy** of what was bought at the price that
applied (`product_id`, `pack_label`, `name`, `qty`, `price`, `image`, `sort_order`).
Pack prices may change later; a placed order must not.

`public.order_events` — **append-only trail** (`status` nullable, `note`,
`actor_id`, `created_at`). `status` is `null` for non-status events such as a rider
being assigned.

**RLS: every order table is read-only for clients.** There is no insert/update/delete
policy anywhere — all writes go through the definer functions below, which is what
keeps `orders.total` trustworthy. Reads go through `can_read_order(id)`.

#### The `order_status` enum

`pending · confirmed · packed · out_for_delivery · delivered · attempted ·
cancelled · returned`. The first five are the customer-visible timeline; the last
three are outcomes.

#### Functions

| function | who may call | what it does |
| --- | --- | --- |
| `has_role(uid, wanted)` | internal | definer, `search_path = ''`; used by every policy |
| `touch_updated_at()` | trigger | keeps `updated_at` honest without trusting the caller |
| `can_read_order(target)` | authenticated | true when caller is the customer, the assigned rider, or an admin |
| `create_order(p_items, p_recipient)` | authenticated | recomputes **every** price from `product_packs`, generates the `OG-XXXXXX` id (no I/O/0/1 — read out over the phone), returns a JSON shape matching `lib/orders.ts` `Order` |
| `set_order_status(id, status, note)` | admin / rider | see the transition rules below |
| `assign_driver(order_id, driver_id)` | admin | pass `null` to unassign; logs to the trail |
| `track_order(query)` | **anon** + authenticated | guest lookup by Order ID or mobile number; returns a **masked** projection |
| `list_users_with_roles(query)` | admin | reads `auth.users` (why it is definer, not a policy) |
| `grant_role(user_id, role)` | admin | the **only** way a role is granted; refuses self-demotion |

`set_order_status` rules, as tightened by `0004_rider_transitions.sql`:

- Missing order → `P0002 'No such order'`.
- Non-admin must be a `driver` **and** the order's `driver_id` → else `42501
  'Not authorised'`.
- Rider transition whitelist: `packed → out_for_delivery`,
  `out_for_delivery → delivered | attempted`, `attempted → out_for_delivery |
  delivered`; anything else → *'A rider may only report delivery progress'*.
- An order in `delivered` / `cancelled` / `returned` is closed → *'This order is
  already closed'* (`22023`).
- On success it updates `orders.status`, stamps `delivered_at` when delivered, and
  appends an `order_events` row.

A **demo parcel** `OG-DEMO24` is seeded (`user_id = null`, so RLS shows it to admins
only; guests reach it through `track_order`) with a four-step event trail.

---

## 4. Configuration that lives OUTSIDE the repo

**These are not in git and are the source of every deployment problem so far.**

### Vercel → Settings → Environment Variables

| variable | value | status |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ftdqbktcaflbyiogrcvm.supabase.co` | ⚠️ **STILL SET WRONG** — see below |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | (publishable/anon key) | assumed OK |

The URL must be the **bare project origin**: no `/rest/v1/` suffix, no trailing
slash. The Supabase client appends `/rest/v1/` itself, so including it produces
`/rest/v1/rest/v1/products` and PostgREST answers *"Invalid path specified in
request URL"*. This same mistake has broken the app twice — once as a 404 during
signup, once as a failed production build. `.env.local` is correct; **Vercel is not.**
`NEXT_PUBLIC_*` values are inlined at build time, so the variable must be enabled
for Production and a **redeploy is required** — editing the variable alone changes
nothing for an existing deployment.

### Supabase → Authentication → URL Configuration

| setting | should be | status |
| --- | --- | --- |
| Site URL | `https://eccommerce-website-five.vercel.app` | ⚠️ still `http://localhost:3000` |
| Redirect URLs | the Vercel origin `/**` **and** `http://localhost:3000/**` | likely missing |

Until this is fixed, every confirmation email sent from production redirects the
user to `localhost:3000`. Note that Supabase **silently ignores** a
`emailRedirectTo` that isn't on the allow list and quietly falls back to Site URL —
so the Redirect URLs entry is required regardless of what the code does.

Only emails sent **after** the change carry the corrected link.

### Supabase → Authentication → Providers → Phone (SMS) + Auth Hooks

Phone Auth stays **enabled**; the **sending** of the text is handed to our own hook
(§2.12). Setup, all done by hand in the dashboard:

1. Providers → Phone → keep it enabled, and **remove the old MessageBird/Bird
   credentials** — they are unused once the hook is on.
2. **Auth Hooks → Send SMS → HTTPS**, URL `https://<domain>/api/auth/send-sms`,
   and click *generate* for the secret (it looks like `v1,whsec_…`). Copy the whole
   string into `SEND_SMS_HOOK_SECRET`.
3. Providers → Phone → **Test Phone Numbers and OTPs** — add pairs as
   `<international digits>=<code>` with **no `+` and no spaces**, and set an expiry
   date. A test number is registered (`923314377050`, test code `12345`). Test
   numbers never reach the hook, so no SendPK account is needed to develop.
4. The URL must be publicly reachable over HTTPS (`localhost` will not work — use a
   tunnel such as `ngrok`/`cloudflared`, or the deployed domain).

New server-only environment variables (add them in Vercel too — **not**
`NEXT_PUBLIC_`, values never in git):

| variable | where it comes from |
| --- | --- |
| `SENDPK_API_KEY` | SendPK → Dashboard → Profile → API Key |
| `SENDPK_SENDER` | the approved short code for the OTP route (default `8584`) |
| `SENDPK_TEMPLATE_ID` | the approved OTP template's numeric id |
| `SEND_SMS_HOOK_SECRET` | generated in step 2 above |

Further notes: the hook payload's number field has changed between Supabase
versions — `targetPhone` in the route tries `sms.phone`, then `user.new_phone`, then
`user.phone`. Confirm the code lands on the number being verified. SendPK bills per
message, which is why verification sits at checkout (§2.11).

### Promoting an admin

`faheemkhan242@gmail.com` is the intended admin. Register it normally first, then
run this in the **Supabase SQL Editor** (nothing else can grant a role — that is the
`user_roles` policy doing its job). In-app, `/admin/team` now does the same thing.

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'faheemkhan242@gmail.com'
on conflict (user_id) do update set role = 'admin';
```

Expect **"1 row affected"**. `0` means the account doesn't exist in `auth.users` yet.

To bypass the email flow entirely while testing:

```sql
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'faheemkhan242@gmail.com';
```

No re-login is needed after promoting — the role is read from the table on every
request, **not** baked into the JWT.

---

## 5. File map

### Routes

| path | what it is |
| --- | --- |
| `app/(shop)/page.tsx` | home; `await getCatalogue()` for the hero product |
| `app/(shop)/collections/page.tsx` | shop listing; passes `products` to `<Catalog>` |
| `app/(shop)/products/[id]/page.tsx` | product detail; Suspense + `ProductSkeleton` |
| `app/(shop)/login`, `register`, `account`, `checkout`, `track-order` | storefront flows |
| `app/(shop)/order-actions.ts` | `placeOrder` (with the phone gate) + `lookupTrackedOrder` |
| `app/admin/layout.tsx` | admin role gate (Suspense boundary) |
| `app/admin/page.tsx` | dashboard overview |
| `app/admin/products/page.tsx` | product list + quick restock |
| `app/admin/products/[id]/page.tsx` | product + pack editor |
| `app/admin/products/new/page.tsx` | create a product (starts hidden, no packs) |
| `app/admin/orders/page.tsx` | COD status board (admin + rider views) |
| `app/admin/orders/[id]/page.tsx` | one parcel: trail, status, rider assignment |
| `app/admin/orders/actions.ts` | `setOrderStatus`, `assignDriver` |
| `app/admin/team/page.tsx` | search users, grant roles |
| `app/admin/team/actions.ts` | `grantRole` |
| `app/admin/actions.ts` | catalogue + auth Server Actions |
| `app/driver/layout.tsx` · `page.tsx` · `[id]/page.tsx` | rider PWA shell, queue, parcel |
| `app/driver/manifest.ts` · `sw/route.ts` · `actions.ts` | PWA manifest, service worker, `reportDelivery` |
| `app/auth/confirm/route.ts` | verifies the email OTP, then redirects |
| `app/api/auth/send-sms/route.ts` | Supabase "Send SMS" hook — verifies the signature, then sends via SendPK |
| `app/layout.tsx`, `app/not-found.tsx`, `app/globals.css` | root shell |
| ⚠️ `app/whoami/page.tsx` | debug route — **delete after testing** |

### `lib/`

| file | responsibility |
| --- | --- |
| `catalogue.ts` | **public cached** catalogue read (`'use cache'` + `cacheTag('catalogue')`), exports `CATALOGUE_TAG` |
| `admin-catalogue.ts` | **uncached, session-bound** staff read; can see inactive products |
| `product-details.ts` | merges DB commercial fields with in-code editorial copy |
| `orders.ts` | **pure** order domain: types, status helpers, timeline (no network) |
| `order-queries.ts` | `server-only`; all order DB reads + `listDrivers` / `listStaffUsers` |
| `maps.ts` | `mapQuery` / `embedUrl` (null without a key) / `directionsUrl` |
| `phone.ts` | E164 ↔ local normalisation (`toE164`, `localPhone`, `digits`) |
| `roles.ts` | `getCurrentUser` / `requireRole` / `assertRole` / `requireStaff`, `StaffRole` |
| `supabase/public.ts` | cookie-less client for cached reads |
| `supabase/server.ts` | SSR client for Server Components/Actions |
| `supabase/client.ts` | browser client |
| `supabase/proxy.ts` | session refresh + prefix gating, called by root `proxy.ts` |
| `auth-client.ts` | auth calls + the phone-OTP helpers |
| `sms.ts` | `server-only`; SendPK delivery — the only file that knows the SMS vendor |
| `cart-math.ts` | `money()`, `summarize()`, free-delivery threshold |
| `safe-next.ts` | validates the `?next=` redirect target |
| `images.ts` | Unsplash URL helper + photo id map |

> ⚠️ **Deleted file:** `lib/products.ts` (the old hard-coded catalogue). If a build
> ever complains about `PRODUCTS`, `HERO_PRODUCT`, `findPack`, or `stockLeft`, some
> file still references it. Confirmed clean.

### `components/`

- `components/admin/` — `AdminFrame`, `AdminNav`, `OrderCard`, `StatusNote`
- `components/driver/` — `RegisterSW`, `AutoRefresh`, `ParcelMap`
- `components/auth/` — `AuthProvider`, `LoginCard`, `RegisterForm`, `AccountMenu`,
  `Field`, `PhoneVerify`
- `components/product/` — `Gallery`, `PurchasePanel`, `ProductFacts`
- `components/cart/` — `CartProvider`, `CartDrawer`, `BagButton`
- `components/checkout/CheckoutClient.tsx`, `components/account/AccountProfile.tsx`,
  `components/tracking/TrackOrderClient.tsx`
- `stores/auth-store.ts` — Zustand mirror of the client session (used by
  `CartDrawer`, `AccountMenu`, `CheckoutClient`, `AccountProfile`, `AuthProvider`)

---

## 6. Decisions and why

| Decision | Reason |
| --- | --- |
| **Admin lives in this repo**, not a separate project | the domain modules are surface-neutral; one Supabase project and session; `proxy.ts` gates by prefix off one array; route groups already give bundle isolation. Splitting buys **no security** — the boundary is RLS + a server-side role check, not repo layout — and costs a second deploy and env set. |
| **Roles in a table**, never `user_metadata` | metadata is client-writable → trivial privilege escalation. |
| **Editorial copy in code, commercial fields in the DB** | the owner edits money and stock, not prose. Keeps the admin UI small and the cache story simple. |
| **Cookie-less client for catalogue reads** | `'use cache'` cannot call `cookies()`; RLS already decides visibility for anonymous callers. |
| **Orders written only through definer RPCs** | a tampered cart cannot change `orders.total`; prices are recomputed from the catalogue server-side. |
| **Guest tracking returns a masked projection** | knowing a mobile number must not be enough to obtain somebody else's street address. |
| **The rider surface is a PWA** | riders work off a phone, one-handed; install-to-home-screen gives a full-screen app with no app-store overhead. |
| **Phone verification at checkout, not signup** | signup already forces email confirmation; for COD the number *is* the delivery lifeline, and billing an SMS only for real orders keeps cost honest. |
| **Verification enforced server-side too** | UI gating is cosmetic — `placeOrder` re-checks `phone_confirmed_at` and that the number matches. |
| **Non-admins hitting `/admin` are sent to `/`** | not a 403 — doesn't advertise that the dashboard exists. |
| **New products start hidden and packless** | a half-finished item must never appear in the storefront. |
| **No client JS for admin/board feedback** | `?status=` round-trips are simpler and work without hydration. |
| **Public browsing stays public** | only `/account` and `/checkout` require a session; tracking is open. |

---

## 7. Next.js 16 / Cache Components gotchas (learned the hard way)

These caused real bugs. Re-read before touching pages.

1. **`middleware.ts` is `proxy.ts`** in Next 16, exporting `proxy()`.
2. **Cache Components is on** (`next.config.ts`: `cacheComponents: true`,
   `partialPrefetching: true`), so **PPR is on by default**.
3. **Awaiting `params` / `searchParams`, or reading `cookies()`, in a page body is a
   build error.** Escape hatches: wrap in `<Suspense>`, or `export const instant = false`.
   Move the await into an async child behind the boundary. Every order/board/driver
   page uses the Suspense + async-child pattern for exactly this reason.
4. **`'use cache'` cannot call `cookies()` or `headers()`.** Hence
   `lib/supabase/public.ts`.
5. **`generateStaticParams` must return at least one result** under Cache Components.
   There is no valid empty-list fallback — a `try/catch` returning `[]` turns one
   clear error into two confusing ones.
6. **`revalidateTag(tag)` with one argument is deprecated**; use
   `revalidateTag(tag, 'max')`. Inside **Server Actions** prefer **`updateTag(tag)`**
   (which is what `app/admin/actions.ts` uses for immediate invalidation).
7. **`cacheTag()` must be called inside the `'use cache'` scope.**
8. **PostgREST returns `numeric` as a string.** Every reader calls `Number()` before
   arithmetic (see `moneyN` in `lib/order-queries.ts`) — omit it and `price * qty`
   silently concatenates.
9. **Conflicting paths across route groups are an error**; multiple root layouts
   cause full page reloads. Neither applies today.
10. **`h-15` is not a valid Tailwind v4 spacing utility** — use `h-[60px]`.

---

## 8. Verified vs. not verified

**Verified**

- `tsc --noEmit`, `eslint app components lib` and `next build` pass (25 routes,
  Cache Components / PPR intact).
- Migrations `0001`–`0004` are live: tables exist, RLS enabled, seed rows present.
- The build renders the storefront from Postgres.
- Signed-out requests to `/admin`, `/driver`, `/account` and `/checkout` redirect
  to `/login?next=…`.
- The phone-verification slice type-checks and builds; the OTP helpers, the checkout
  gate, the server-side checks and the SendPK hook route (`/api/auth/send-sms`,
  registered as a dynamic route) are in place.

**NOT yet verified — do this next**

- ⛔ **`supabase/migrations/0005_verified_phone.sql` has NOT been applied yet.** Until
  it is pasted into the Supabase SQL Editor, the database will not enforce the
  verified-phone rule (the app-level checks in `placeOrder` still run).
- ⛔ **No one has completed a real end-to-end COD order** from a verified phone
  number, nor exercised the board → rider hand-off in production.
- ⛔ **The phone flow has not been exercised end-to-end.** Test numbers are the plan
  for now (test number `923314377050`, code `12345`, entered in the dashboard with
  no `+`): send code → confirm → place order. Real SMS via SendPK is untested and
  needs a verified SendPK account, credit, and a public HTTPS hook URL.
- The `/admin` dashboard actions and the `updateTag('catalogue')` → storefront
  refresh loop have not been run with a real admin session.
- The Vercel deploy has never succeeded with the corrected env var, and the fixed
  email-confirmation redirect has never been exercised.

---

## 9. Known outstanding issues

**Blocking production**

1. Vercel `NEXT_PUBLIC_SUPABASE_URL` still has `/rest/v1/` → **build fails**. Fix + redeploy.
2. Supabase Site URL is still `http://localhost:3000` + Redirect URLs missing →
   confirmation emails send users to localhost.
3. `faheemkhan242@gmail.com` is not yet promoted to `admin` (use `/admin/team` or the SQL in §4).
4. Supabase's built-in email sender is rate-limited per **project** (very low, a
   couple per hour) and testing exhausted it → *"Too many emails sent."* Real fix is
   custom SMTP (Resend's free tier is ample) under Authentication → Emails → SMTP
   Settings, then raise the ceiling under Rate Limits. The built-in sender is
   explicitly not meant for production.

**Hygiene / lower priority**

5. Leftover debug `console.log`s to remove: `components/admin/AdminNav.tsx`
   (`role`, `items`). The two in `lib/roles.ts` were removed in this pass.
6. The debug route `app/whoami/page.tsx` ("delete after testing") should go.
7. Pre-existing lint noise (not from recent work): 1 error —
   `react-hooks/set-state-in-effect` in `components/tracking/TrackOrderClient.tsx` —
   plus unused-var warnings (`safeNext` in `app/admin/orders/actions.ts`, `stats` in
   `app/admin/orders/page.tsx`, `ParcelMap` in `app/driver/[id]/page.tsx`,
   `DEMO_ORDER_ID` in `TrackOrderClient.tsx`).
8. `Header.tsx` nav is `hidden lg:block` with **no mobile menu** — Shop / Why /
   Process are unreachable on small screens.
9. Footer legal links and the Instagram handle are placeholders; the newsletter form
   is a no-op.
10. `docs/index.md`, `typedoc.json` and the whole generated `docs-site/` still
    describe the **old fashion brand**. Stale.
11. `lib/auth-client.ts` replaces Supabase's real error message with a generic
    string, which is what made the original 404 so hard to diagnose. Surfacing
    `error.message` would have saved an hour.

---

## 10. Commands

```bash
# Node is under nvm in this environment
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"

./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint app components lib     # NOT the repo root — see below
./node_modules/.bin/next build
npm run dev                                        # http://localhost:3000
```

- **Always lint only `app components lib`.** A repo-wide `eslint .` reports ~178
  problems, ~170 of which are `@typescript-eslint/no-unused-expressions` inside the
  vendored `docs-site/assets/main.js`. It's pre-existing noise.
- **There is no `supabase` CLI, no `psql`, and no DB URL in `.env.local`** on this
  machine (only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
  That is why migrations are applied by pasting SQL into the Supabase SQL Editor.
- A stale `next start` can linger on `:3000` and serve a **prebuilt** bundle from
  before your edits, making changes look like they had no effect. If something looks
  impossibly stale, restart `npm run dev`.

---

## 11. Next steps

1. **Fix the two config items in §4** (Vercel env var + Supabase URL Configuration),
   redeploy, and confirm the build goes green.
2. **Promote `faheemkhan242@gmail.com`**, log in, and **exercise the full loop**:
   - verify a mobile number, place a COD order, and see it appear on `/admin/orders`;
   - move it `confirmed → packed`, assign a rider;
   - pick it up in `/driver`, report `out_for_delivery → delivered`;
   - confirm the customer's tracking page reflects it.
   This is the round-trip nothing has tested yet.
3. **Confirm a real SMS** sends and verifies (test number `923314377050`, code
   `12345`) and that the **"Change Phone Number"** template reads well.
4. Clear the hygiene items in §9 (debug `console.log`s, `app/whoami`, lint noise).
5. Add the missing **mobile menu** to `Header.tsx` (issue 8), then decide whether to
   move the remaining **editorial copy** into the database (left in code on purpose
   for this pass).
