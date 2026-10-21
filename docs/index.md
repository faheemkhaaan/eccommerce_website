# ÉPURE Atelier — Code Wiki

Structured technical documentation for the `eccomerce_website` repository: a luxury
fashion/lifestyle **e-commerce storefront** built with **Next.js 16 (App Router)**,
**React 19**, **Tailwind CSS v4**, **Supabase** (auth) and **Zustand** (client state).

---

## 1. Overview

| Item | Value |
| --- | --- |
| Project name | `eccomerce_website` (brand: **ÉPURE Atelier**) |
| Framework | Next.js `16.4.1` (App Router, Turbopack) |
| UI runtime | React `19.3.0` / React DOM `19.3.0` |
| Language | TypeScript `^5` (strict) |
| Styling | Tailwind CSS `^4` via `@tailwindcss/turbopack` |
| Animation | `framer-motion` `^14` |
| Icons | Custom SVG set (`components/Icons.tsx`) + `lucide-react` `^1.59` (404 shell only) |
| Client state | `zustand` `^5` |
| Backend / auth | Supabase — `@supabase/ssr` `^0.12`, `@supabase/supabase-js` `^2.118` |
| Package manager | `pnpm@12.4.1` |

### Scripts ([package.json](file:///home/faheem/projects/eccomerce_website/package.json))

```bash
pnpm dev     # next dev      — start dev server on http://localhost:3000
pnpm build   # next build    — production build
pnpm start   # next start    — serve the production build
pnpm lint    # eslint        — run ESLint (flat config)
```

> **Next.js version caveat:** This repo pins **Next.js 16**, which reintroduced
> breaking conventions. Notably the request interceptor formerly called
> `middleware.ts` is now **`proxy.ts`** exporting a `proxy()` function
> ([proxy.ts](file:///home/faheem/projects/eccomerce_website/proxy.ts)). See the note in
> [AGENTS.md](file:///home/faheem/projects/eccomerce_website/AGENTS.md) and consult
> `node_modules/next/dist/docs/` before changing framework code.

---

## 2. High-Level Architecture

The app is a classic **layered App Router** project with four concerns:

```
┌──────────────────────────────────────────────────────────────┐
│ app/            Routing, pages, route handlers, layout, CSS  │  ← delivery layer
├──────────────────────────────────────────────────────────────┤
│ components/     Presentational + interactive UI (client/     │  ← view layer
│                 server components)                           │
├──────────────────────────────────────────────────────────────┤
│ lib/            Domain data, business logic, Supabase        │  ← domain layer
│                 clients, helpers                             │
├──────────────────────────────────────────────────────────────┤
│ stores/         Global client state (Zustand)                │  ← state layer
└──────────────────────────────────────────────────────────────┘
            ▲                                        ▲
            │ cross-cutting                          │ request interception
        proxy.ts (session refresh + route guard)   globals.css (design tokens)
```

**Data flow, in one sentence:** `app/*` pages compose `components/*`, which read static
catalog data from `lib/*` and interactive state from the `CartProvider` / `AuthProvider`
React contexts; authentication is brokered by Supabase through the browser client
(`lib/supabase/client.ts`), refreshed per-request by `proxy.ts`
(`lib/supabase/proxy.ts`), and mirrored into a Zustand store
([stores/auth-store.ts](file:///home/faheem/projects/eccomerce_website/stores/auth-store.ts)).

### Directory map

```
eccomerce_website/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout + global providers
│   ├── page.tsx              # "/" marketing homepage
│   ├── globals.css           # Tailwind theme tokens & @utility classes
│   ├── not-found.tsx         # Custom 404 (atelier shell)
│   ├── collections/page.tsx  # "/collections" catalog
│   ├── products/[id]/page.tsx# "/products/:id" detail (SSG)
│   ├── login/page.tsx        # "/login"
│   ├── register/page.tsx     # "/register"
│   └── auth/
│       ├── confirm/route.ts  # GET email-OTP verification handler
│       └── error/page.tsx    # Expired-link page
├── components/               # UI (see §4)
│   ├── atelier/              # 404-page specific components
│   ├── auth/                 # Auth forms + providers
│   ├── cart/                 # Cart context, drawer, bag button
│   ├── product/              # Product-detail widgets
│   └── *.tsx                 # Homepage sections & shared widgets
├── lib/                      # Domain logic & data (see §3)
│   └── supabase/             # Browser / server / proxy clients
├── stores/auth-store.ts      # Zustand auth store
├── proxy.ts                  # Next 16 request interceptor (session)
├── next.config.ts            # cacheComponents, turbopack, image hosts
├── tsconfig.json             # Path alias @/* -> ./*
└── eslint.config.mjs         # next/core-web-vitals + typescript
```

---

## 3. Domain Layer — `lib/`

### 3.1 Supabase clients (`lib/supabase/`)

| File | Export | Runtime | Responsibility |
| --- | --- | --- | --- |
| [client.ts](file:///home/faheem/projects/eccomerce_website/lib/supabase/client.ts) | `createClient()` | Browser | `createBrowserClient` for Client Components (auth, realtime). |
| [server.ts](file:///home/faheem/projects/eccomerce_website/lib/supabase/server.ts) | `createClient()` (async) | Server | `createServerClient` bound to `next/headers` cookies. `setAll` is wrapped in `try/catch` because Server Components cannot write cookies; refresh is delegated to `proxy.ts`. |
| [proxy.ts](file:///home/faheem/projects/eccomerce_website/lib/supabase/proxy.ts) | `updateSession(request)` | Edge/Node (proxy) | Refreshes the auth token via `supabase.auth.getClaims()`, rewrites response cookies, and redirects unauthenticated users away from `PROTECTED` paths. |

**`updateSession()` behaviour**

- `PROTECTED = ["/account"]` — only `/account*` is gated; guests may still checkout/track COD orders.
- Uses `getClaims()` (never `getSession()`) so the JWT is verified server-side.
- On a protected path with no session, redirects to `/login?next=<originalPath>` and re-attaches refreshed cookies so the browser's session is not lost.

**Note on config:** the request interceptor is [proxy.ts](file:///home/faheem/projects/eccomerce_website/proxy.ts)
at the repo root, which simply re-exports `updateSession` and declares the matcher
(excludes `_next/static`, `_next/image`, `favicon.ico`, and image extensions).

### 3.2 Catalog data

There are **three distinct product data sources** (a maintainability caveat — see §7):

| File | Purpose | Currency |
| --- | --- | --- |
| [products.ts](file:///home/faheem/projects/eccomerce_website/lib/products.ts) | Canonical storefront catalog used by `/collections` and `/products/[id]`. | USD |
| [atelier-data.ts](file:///home/faheem/projects/eccomerce_website/lib/atelier-data.ts) | Content for the **404 shell** (`hero-404`, `product-showcase`, `site-footer`). | PKR (strings) |
| [Selection.tsx](file:///home/faheem/projects/eccomerce_website/components/Selection.tsx) | Homepage "Édition 08 Selection" carousel has its own inline array. | USD (strings) |

**[products.ts](file:///home/faheem/projects/eccomerce_website/lib/products.ts)**

- `PALETTE` — 8 named colorway hex values (`Noir`, `Ivory`, `Sand`, `Stone`, `Tan`, `Brass`, `Oat`, `Cocoa`).
- Types: `PaletteName`, `Category` (`"Apparel" | "Objects & Living" | "Accessories"`), `Badge` (`"New In" | "Bestseller" | "Only 2 Left"`), and `Product`.
- `PRODUCTS: Product[]` — 12 items, each with `id`, `name`, `price`, `detail`, `image`, optional `badge`, `category`, `material`, `palette[]`.
- Images are generated by cycling a fixed Unsplash pool via `img(i) = u(pool[i % len], 800)`.

**[product-details.ts](file:///home/faheem/projects/eccomerce_website/lib/product-details.ts)**

- `Detail` type — the rich shape consumed by the product page (`colorways`, `sizes`, `gallery`, `sections`, `ensemble`, `stockLeft`, `rating`, …).
- `trench` — a hand-authored exemplar detail object (`sculptural-wool-trench`).
- `fromListing(id)` — *(private)* programmatically derives a `Detail` from any `PRODUCTS` entry so every catalog card resolves on `/products/[id]`. Reuses the `trench` template and substitutes name/price/palette/gallery.
- `getDetail(id)` — lookup: returns `trench` for its id, else `fromListing(id)`.
- `allDetailIds()` — `[trench.id, ...PRODUCTS ids]`; feeds `generateStaticParams` for static generation.

**[images.ts](file:///home/faheem/projects/eccomerce_website/lib/images.ts)**

- `ids` — 6 hard-coded Unsplash photo IDs (`trench`, `rack`, `jackets`, `hangers`, `knitStack`, `greyKnit`).
- `u(id, w)` — builds the `unsplash.com/photos/<id>/download?force=true&w=<w>` URL.
- `images` — a named map of pre-built URLs (`hero`…`hero5`, `p1`…`p6`, `craftHands`, `craftLoom`, `community[]`, `provenance`, `cat*`, `avatar`).

### 3.3 Cart math — [cart-math.ts](file:///home/faheem/projects/eccomerce_website/lib/cart-math.ts)

```ts
FREE_SHIPPING_FROM = 250   // free shipping threshold (USD)
SHIPPING_FLAT      = 18    // flat rate below threshold
TAX_RATE           = 0.08  // 8% estimated tax
GIFT_PACKAGING_FROM= 1000  // gift-packaging progress target

money(n)                 // Intl "en-US" currency formatter
summarize(subtotal)      // -> { subtotal, shipping, tax, total }
```

`summarize` applies free shipping at `0` or `>= FREE_SHIPPING_FROM`, rounds tax to 2dp, and returns the total. Consumed by [CartDrawer](file:///home/faheem/projects/eccomerce_website/components/cart/CartDrawer.tsx).

### 3.4 Auth helpers — [auth-client.ts](file:///home/faheem/projects/eccomerce_website/lib/auth-client.ts)

| Function | Behaviour |
| --- | --- |
| `registerAccount(payload)` | `supabase.auth.signUp` with profile metadata (`full_name`, `phone`, `size`, `city`, `address`, `notify_whatsapp`). Maps Supabase errors to friendly messages; detects already-registered emails via `identities.length === 0`. Comment notes a **SQL trigger** turns metadata into profile + default address rows. |
| `signInWithPassword(email, pw)` | Email/password sign-in with a dedicated `email_not_confirmed` message. |
| `requestOtp(phone)` | **Dev stub** — 700 ms delay, logs a debug line in non-production. |
| `verifyOtp(phone, code)` | **Dev stub** — accepts only the hard-coded code `"1234"`. |

### 3.5 Open-redirect guard — [safe-next.ts](file:///home/faheem/projects/eccomerce_website/lib/safe-next.ts)

`safeNext(n)` returns `n` only if it is a same-site path (`startsWith("/")` and not `"//"`),
otherwise `"/"`. Blocks `https://evil.com` and `//evil.com` post-login redirects. Used by
[login/page.tsx](file:///home/faheem/projects/eccomerce_website/app/login/page.tsx) and
[auth/confirm/route.ts](file:///home/faheem/projects/eccomerce_website/app/auth/confirm/route.ts).

---

## 4. State Layer — `stores/`

### [auth-store.ts](file:///home/faheem/projects/eccomerce_website/stores/auth-store.ts)

```ts
type Status = "loading" | "authenticated" | "guest";
useAuthStore = create<AuthState>(...)
// { user: User | null, status: Status, setUser(user) }
```

A minimal Zustand store. `setUser(null | user)` derives `status` automatically
(`"guest"` when null, `"authenticated"` otherwise; initial `"loading"`). It is the single
source of truth for client-side auth UI (e.g. [AccountMenu](file:///home/faheem/projects/eccomerce_website/components/auth/AccountMenu.tsx)).

---

## 5. Routing & Pages — `app/`

### 5.1 Root layout — [layout.tsx](file:///home/faheem/projects/eccomerce_website/app/layout.tsx)

Loads two Google fonts (Playfair Display → `--font-playfair`, Inter → `--font-inter`),
imports `globals.css`, and nests the global providers:

```
MotionProvider  (prefers-reduced-motion aware)
└── AuthProvider (Supabase onAuthStateChange → Zustand)
    └── CartProvider (useReducer + localStorage)
        ├── {children}
        └── <CartDrawer />  (global slide-over)
```

Metadata: title "ÉPURE Atelier".

### 5.2 Route table

| Route | File | Type | Notes |
| --- | --- | --- | --- |
| `/` | [page.tsx](file:///home/faheem/projects/eccomerce_website/app/page.tsx) | Server | Marketing homepage: Header → Hero → Categories → Selection → Philosophy → Press → Community → Footer. `Appointment` is imported but commented out. |
| `/collections` | [collections/page.tsx](file:///home/faheem/projects/eccomerce_website/app/collections/page.tsx) | Server | `CollectionHero` + `Catalog` + `Provenance`, wrapped in its own `MotionProvider`. |
| `/products/[id]` | [products/[id]/page.tsx](file:///home/faheem/projects/eccomerce_website/app/products/[id]/page.tsx) | Server (SSG) | `generateStaticParams()` from `allDetailIds()`; `generateMetadata()` from `getDetail()`; calls `notFound()` for unknown ids. Renders breadcrumb, `Gallery`, `PurchasePanel`, `CompleteTheLook`. |
| `/login` | [login/page.tsx](file:///home/faheem/projects/eccomerce_website/app/login/page.tsx) | Server | `LoginPromo` + `LoginCard` (wrapped in `Suspense` because it reads async `searchParams`), `TrustStrip`. |
| `/register` | [register/page.tsx](file:///home/faheem/projects/eccomerce_website/app/register/page.tsx) | Server | `RegisterPromo` + `RegisterForm` + `RegisterTrust`. |
| `/auth/confirm` | [auth/confirm/route.ts](file:///home/faheem/projects/eccomerce_website/app/auth/confirm/route.ts) | Route handler (`GET`) | Verifies email OTP (`token_hash` + `type`) then redirects to `safeNext(next)`; on failure redirects to `/auth/error`. |
| `/auth/error` | [auth/error/page.tsx](file:///home/faheem/projects/eccomerce_website/app/auth/error/page.tsx) | Server | "This link has expired" + link back to `/login`. |
| `*` (404) | [not-found.tsx](file:///home/faheem/projects/eccomerce_website/app/not-found.tsx) | Server | Renders the atelier 404 shell (see §5.3). |

### 5.3 The 404 shell (`components/atelier/`)

A visually distinct "Atelier Archive" 404 experience assembled from dedicated
components and content in [atelier-data.ts](file:///home/faheem/projects/eccomerce_website/lib/atelier-data.ts):

- [announcement-bar.tsx](file:///home/faheem/projects/eccomerce_website/components/atelier/announcement-bar.tsx) — `AnnouncementBar`
- [hero-404.tsx](file:///home/faheem/projects/eccomerce_website/components/atelier/hero-404.tsx) — `Hero404` (ghost "404" watermark, search, CTAs, quick links)
- [product-showcase.tsx](file:///home/faheem/projects/eccomerce_website/components/atelier/product-showcase.tsx) — `ProductShowcase` (4 "curated" cards from `atelier-data`)
- [client-care.tsx](file:///home/faheem/projects/eccomerce_website/components/atelier/client-care.tsx) — `ClientCare` (WhatsApp / track-order CTAs)
- [site-footer.tsx](file:///home/faheem/projects/eccomerce_website/components/atelier/site-footer.tsx) — `SiteFooter` (newsletter, link columns, boutiques, policies)

These use `lucide-react` icons and plain `<img>` tags (not `next/image`), and the
showcase images point at an external CDN defined in `atelier-data.ts`.

---

## 6. View Layer — `components/`

### 6.1 Providers & shared widgets

| Component | File | Kind | Responsibility |
| --- | --- | --- | --- |
| `MotionProvider` | [Motion.tsx](file:///home/faheem/projects/eccomerce_website/components/Motion.tsx) | Client | Wraps children in `MotionConfig reducedMotion="user"`. |
| `Reveal` | [Motion.tsx](file:///home/faheem/projects/eccomerce_website/components/Motion.tsx) | Client | Fade/slide-in-on-scroll wrapper (`whileInView`, once). |
| `Carousel` | [Carousel.tsx](file:///home/faheem/projects/eccomerce_website/components/Carousel.tsx) | Client | Generic snap-scroll track with prev/next buttons, `ResizeObserver` edge detection, a11y `role="region"`. |
| `ProductCard` | [ProductCard.tsx](file:///home/faheem/projects/eccomerce_website/components/ProductCard.tsx) | Client | Catalog grid card → links to `/products/[id]`; badge styling map; palette swatches. |
| `Icons` | [Icons.tsx](file:///home/faheem/projects/eccomerce_website/components/Icons.tsx) | Shared | ~30 inline SVG icons (`SearchIcon`, `BagIcon`, `ArrowIcon`, `CheckIcon`, …), each `({ size })`. |

### 6.2 Homepage sections

| Component | File | Notes |
| --- | --- | --- |
| `Header` | [Header.tsx](file:///home/faheem/projects/eccomerce_website/components/Header.tsx) | `variant: "overlay" \| "solid"`, `active`, `loggedIn`. Announcement bar + primary nav + search + wishlist + `BagButton` + `AccountMenu` (or Sign in/Sign up). |
| `Hero` | [Hero.tsx](file:///home/faheem/projects/eccomerce_website/components/Hero.tsx) | 5-slide auto-rotating (6 s) image carousel with progress bar & dot indicators. |
| `Categories` | [Categories.tsx](file:///home/faheem/projects/eccomerce_website/components/Categories.tsx) | 3-tile editorial category grid. |
| `Selection` | [Selection.tsx](file:///home/faheem/projects/eccomerce_website/components/Selection.tsx) | "Édition 08" product carousel (inline product array). |
| `Philosophy` | [Philosophy.tsx](file:///home/faheem/projects/eccomerce_website/components/Philosophy.tsx) | Brand story with stats. |
| `Press` | [Press.tsx](file:///home/faheem/projects/eccomerce_website/components/Press.tsx) | 3 press quotes. |
| `Community` | [Community.tsx](file:///home/faheem/projects/eccomerce_website/components/Community.tsx) | UGC photo carousel. |
| `Appointment` | [Appointment.tsx](file:///home/faheem/projects/eccomerce_website/components/Appointment.tsx) | Private-appointment CTA band (**currently commented out** in `app/page.tsx`). |
| `Footer` | [Footer.tsx](file:///home/faheem/projects/eccomerce_website/components/Footer.tsx) | Newsletter + link columns + presence + policies. |

### 6.3 Cart (`components/cart/`)

| Component | File | Responsibility |
| --- | --- | --- |
| `CartProvider` / `useCart` | [CartProvider.tsx](file:///home/faheem/projects/eccomerce_website/components/cart/CartProvider.tsx) | `useReducer` cart; localStorage persistence (`epure-bag-v1`); exposes `items, count, subtotal, isOpen, open, close, add, setQty, remove`. |
| `CartDrawer` | [CartDrawer.tsx](file:///home/faheem/projects/eccomerce_website/components/cart/CartDrawer.tsx) | Slide-over dialog: scroll-lock, `Escape` to close, manual **focus trap**, gift-packaging progress, shipping/tax/total, express-checkout placeholders, checkout CTA. |
| `BagButton` | [BagButton.tsx](file:///home/faheem/projects/eccomerce_website/components/cart/BagButton.tsx) | Header bag icon with animated count badge. |

**Cart model**

```ts
type CartItem = { key; id; name; image; options: string[]; price; qty };
type NewItem  = Omit<CartItem, "key" | "qty"> & { qty?: number };
keyOf(item) = [id, ...options].join("|");   // line-item identity
MAX_QTY = 9;                                 // per line cap
```

Reducer actions: `hydrate`, `add` (merges by key, caps qty), `qty`, `remove`.
Hydration runs **after mount** so SSR and client markup match.

### 6.4 Authentication (`components/auth/`)

| Component | File | Responsibility |
| --- | --- | --- |
| `AuthProvider` | [AuthProvider.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/AuthProvider.tsx) | Subscribes to `onAuthStateChange` and pushes the user into `useAuthStore`. Fires `INITIAL_SESSION` on mount. |
| `AccountMenu` | [AccountMenu.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/AccountMenu.tsx) | Avatar/initials dropdown; outside-click + `Escape` handling; `signOut()` calls `supabase.auth.signOut()` then routes home. Placeholder nav to `/account*`. |
| `LoginCard` | [LoginCard.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/LoginCard.tsx) | Tabbed sign-in (Email **or** WhatsApp OTP). OTP path gated behind `ENABLE_WHATSAPP_OTP = false`; includes a 4-box `OtpInput` (paste/arrow handling). |
| `RegisterForm` | [RegisterForm.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/RegisterForm.tsx) | Multi-field registration with client validation (`validate()`), per-country phone rules (`COUNTRIES`), size/city pickers; on success shows `VerifyEmailNotice`. |
| `Field` | [Field.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/Field.tsx) | Form-field wrapper (label, hint, animated error) + shared `inputCls`. |
| `VerifyEmailNotification` | [VerifyEmailNotification.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/VerifyEmailNotification.tsx) | "Check your inbox" screen with resend cooldown (`auth.resend`). |
| `LoginPromo` / `RegisterPromo` | [LoginPromo.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/LoginPromo.tsx) / [RegisterPromo.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/RegisterPromo.tsx) | Editorial side panels. |
| `TrustStrip` / `RegisterTrust` | [TrustStrip.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/TrustStrip.tsx) / [RegisterTrust.tsx](file:///home/faheem/projects/eccomerce_website/components/auth/RegisterTrust.tsx) | Trust/USP strips. |

### 6.5 Product detail (`components/product/`)

| Component | File | Responsibility |
| --- | --- | --- |
| `Gallery` | [Gallery.tsx](file:///home/faheem/projects/eccomerce_website/components/product/Gallery.tsx) | Thumbnail rail + main image with fade transitions, badge, and a full-screen zoom dialog (`Escape` + scroll-lock). |
| `PurchasePanel` | [PurchasePanel.tsx](file:///home/faheem/projects/eccomerce_website/components/product/PurchasePanel.tsx) | Colorway/size/qty selectors, wishlist toggle, perks, accordions, mobile sticky add-to-bag bar (driven by `IntersectionObserver`), calls `useCart().add`. |
| `CompleteTheLook` | [CompleteTheLook.tsx](file:///home/faheem/projects/eccomerce_website/components/product/CompleteTheLook.tsx) | "Curated Ensemble" carousel with per-item `QuickAdd` (nested component) that adds to the cart. |

---

## 7. Dependency Relationships

### Import graph (simplified)

```
app/layout.tsx
  ├── components/Motion        (MotionProvider)
  ├── components/auth/AuthProvider
  ├── components/cart/CartProvider
  └── components/cart/CartDrawer ──► lib/cart-math

app/page.tsx ──► Header, Hero, Categories, Selection, Philosophy, Press, Community, Footer
                    ├── Header ──► cart/BagButton, auth/AccountMenu
                    └── Hero/Categories/… ──► lib/images

app/collections/page.tsx ──► CollectionHero, Catalog, Provenance
                    ├── Catalog ──► lib/products (+ ProductCard)
                    └── Provenance ──► lib/images

app/products/[id]/page.tsx ──► lib/product-details ──► lib/products, lib/images
                    ├── product/Gallery
                    ├── product/PurchasePanel ──► cart/CartProvider, lib/product-details
                    └── product/CompleteTheLook ──► cart/CartProvider

app/login/page.tsx ──► auth/LoginCard ──► lib/auth-client ──► lib/supabase/client
                                  └── lib/safe-next
app/register/page.tsx ──► auth/RegisterForm ──► lib/auth-client, auth/Field, auth/VerifyEmailNotification
app/auth/confirm/route.ts ──► lib/supabase/server, lib/safe-next

proxy.ts ──► lib/supabase/proxy (updateSession)
auth/AuthProvider ──► lib/supabase/client + stores/auth-store
auth/AccountMenu  ──► lib/supabase/client + stores/auth-store

app/not-found.tsx ──► components/atelier/* ──► lib/atelier-data
```

### External dependency roles

| Package | Used by | Why |
| --- | --- | --- |
| `next` | everything | App Router, `next/image`, `next/font`, `next/link`, route handlers. |
| `react` / `react-dom` | everything | 19.x (Server + Client Components). |
| `framer-motion` | motion-heavy components | Carousels, drawers, modals, reveals, layout animations. |
| `lucide-react` | `components/atelier/*` | Icons for the 404 shell only. |
| `zustand` | `stores/auth-store` | Tiny global auth state without context boilerplate. |
| `@supabase/ssr` / `@supabase/supabase-js` | `lib/supabase/*`, auth components | Cookie-based SSR auth + browser auth. |

### Environment variables

Required (from `.env.local`, which is git-ignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Both are read via `process.env` in the three Supabase client factories.

---

## 8. Key Flows

### 8.1 Registration & email verification

1. `RegisterForm` validates locally, then calls `registerAccount()` → `supabase.auth.signUp` with profile metadata.
2. Supabase (per the code comment) runs a **SQL trigger** that creates a profile row + default address from that metadata.
3. `RegisterForm` swaps to `VerifyEmailNotice`, which offers a cooldown-gated `auth.resend`.
4. The user clicks the emailed link → `GET /auth/confirm?token_hash=…&type=…&next=…`.
5. The handler calls `verifyOtp`, then redirects to `safeNext(next)` (or `/auth/error`).

### 8.2 Sign-in

- **Email/password:** `LoginCard` → `signInWithPassword()` → on success `router.push(next)` + `router.refresh()`.
- **WhatsApp OTP (disabled/stub):** `requestOtp()` and `verifyOtp()` are stubs; only `"1234"` is accepted in non-production.

### 8.3 Session lifecycle

1. Every non-static request passes through [proxy.ts](file:///home/faheem/projects/eccomerce_website/proxy.ts) → `updateSession()`.
2. `getClaims()` refreshes the token and rewrites cookies on the response.
3. `AuthProvider` observes `onAuthStateChange` client-side and updates `useAuthStore`.
4. `/account*` is the only guarded area; unauthenticated access → `/login?next=…`.

### 8.4 Add-to-cart

`PurchasePanel.addToBag()` (or `CompleteTheLook.QuickAdd`) → `useCart().add(item)` →
reducer merges/caps the line → `openBag()` reveals `CartDrawer` → item persisted to
`localStorage` and totals computed via `summarize()`.

---

## 9. Running the Project

### Prerequisites

- Node.js (compatible with Next 16 / React 19)
- `pnpm` (repo pins `pnpm@12.4.1` via `packageManager`)
- A Supabase project with the email-auth trigger configured (for real registration)

### Setup

```bash
# 1. install dependencies
pnpm install

# 2. create .env.local with your Supabase credentials
#    NEXT_PUBLIC_SUPABASE_URL=...
#    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# 3. start the dev server
pnpm dev            # http://localhost:3000
```

### Production

```bash
pnpm build
pnpm start
```

### Lint / type-check

```bash
pnpm lint                          # ESLint (flat config)
pnpm exec tsc --noEmit             # strict TypeScript check
```

### Building blocks to be aware of

- **Turbopack** is the bundler (see `next.config.ts` `turbopack.rules` for CSS).
- **`cacheComponents: true`** and **`partialPrefetching: true`** are enabled in
  [next.config.ts](file:///home/faheem/projects/eccomerce_website/next.config.ts).
- **Remote images** are whitelisted for `unsplash.com` / `images.unsplash.com` only.
- Path alias: `@/*` → repo root ([tsconfig.json](file:///home/faheem/projects/eccomerce_website/tsconfig.json)).

---

## 10. Design System & Styling

Defined in [globals.css](file:///home/faheem/projects/eccomerce_website/app/globals.css):

- **Theme tokens** (`@theme inline`): `--color-paper`, `--color-sand`, `--color-ink`, `--color-muted`, `--color-line`, `--color-accent`; fonts `--font-serif` (Playfair), `--font-sans` (Inter).
- **Custom utilities** (`@utility`): `wrap` (max-width container), `eyebrow`, `label-sm`.
- Respects `prefers-reduced-motion` globally (disables transitions/animations and smooth scroll).
- Visible focus rings via `:focus-visible`.

---

## 11. Observations, Stubs & Known Gaps

These are factual notes surfaced during analysis — not required reading to run the app,
but useful when extending it.

1. **Dead code in `PurchasePanel`** — module-level `add()` / `openBag()` stubs
   ([PurchasePanel.tsx](file:///home/faheem/projects/eccomerce_website/components/product/PurchasePanel.tsx#L283-L288))
   throw `"Function not implemented."`. Inside the component they are **shadowed** by the
   `useCart()` destructuring, so they are never called — but they are unused and should be
   removed to avoid confusion.
2. **Unbuilt routes referenced by UI** — `/account`, `/account/orders`,
   `/account/addresses`, `/checkout`, `/track-order`, `/forgot-password` are linked but have
   no pages yet; `/account*` is the only path the proxy guards.
3. **Header auth state** — `Header` takes a `loggedIn` prop (default `false`) and is never
   passed `true`; it does not read `useAuthStore`, so signed-in users still see
   "Sign in / Sign up". `WISHLIST_COUNT` is a hard-coded `2`.
4. **OTP is a dev stub** — `verifyOtp` accepts only `"1234"`, and `LoginCard` sets
   `ENABLE_WHATSAPP_OTP = false`.
5. **Three product data sources** — `lib/products.ts` (canonical), `lib/atelier-data.ts`
   (404 shell), and an inline array in `Selection.tsx`; keep them in sync or consolidate.
6. **Image strategy is mixed** — `next/image` with whitelisted Unsplash hosts for the main
   app vs. plain `<img>` + external CDN URLs in the atelier/404 components.
7. **Supabase URL shape** — `.env.local` supplies a value ending in `/rest/v1/`; the Supabase
   JS SDK conventionally expects the bare project URL (`https://<ref>.supabase.co`).
   Verify the auth endpoints resolve correctly.
8. **Missing DB artifacts in-repo** — the profile/address creation logic lives in a Supabase
   SQL trigger (referenced in `auth-client.ts`) that is not committed here.
9. **`trench` is special-cased** — `getDetail` returns a hand-authored object for
   `sculptural-wool-trench` that is not part of `PRODUCTS`, so it appears only on its own
   detail page (but is included in `generateStaticParams`).

---

## 12. Quick Reference — Public API Surface

| Symbol | Location | Kind |
| --- | --- | --- |
| `createClient` | `lib/supabase/client.ts` | fn (browser) |
| `createClient` | `lib/supabase/server.ts` | async fn (server) |
| `updateSession` | `lib/supabase/proxy.ts` | async fn |
| `proxy` | `proxy.ts` | async fn (Next interceptor) |
| `PRODUCTS`, `PALETTE` | `lib/products.ts` | consts |
| `getDetail`, `allDetailIds` | `lib/product-details.ts` | fns |
| `images`, `ids`, `u` | `lib/images.ts` | consts/fn |
| `money`, `summarize` | `lib/cart-math.ts` | fns |
| `registerAccount`, `signInWithPassword`, `requestOtp`, `verifyOtp` | `lib/auth-client.ts` | fns |
| `safeNext` | `lib/safe-next.ts` | fn |
| `useAuthStore` | `stores/auth-store.ts` | Zustand hook |
| `CartProvider`, `useCart` | `components/cart/CartProvider.tsx` | component/hook |
| `MotionProvider`, `Reveal` | `components/Motion.tsx` | components |

---

*Generated from a static analysis of the repository at `/home/faheem/projects/eccomerce_website`.*
