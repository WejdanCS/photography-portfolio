# Photography Portfolio

A photography portfolio for the fictional photographer **Alex Morgan**, built with React, Tailwind CSS and JavaScript. An Express API reads gallery data from PostgreSQL through Drizzle ORM. Better Auth manages signup, login and persistent sessions. The server also contains the database and authentication foundation for Stripe test-mode session purchases; checkout routes and UI are not connected yet.

## Features

- Responsive portfolio with Hero, Selected Work, About and Contact sections.
- Gallery loaded from `/api/photos`, with category filters, loading, error, retry and empty states.
- Controlled favorite toggles, stored temporarily in React state and reset after a page reload.
- Email/password signup and login at `/login`, with automatic return to the home page after authentication.
- Header displaying session loading, the signed-in user's name and sign-out controls.
- Labelled controls, keyboard focus styles and reduced-motion support for the gallery loader.
- Booking form preview with a disabled submit button. No booking request or email is sent.

## Project structure

```text
Photography Portfolio/
├── client/
│   ├── src/
│   │   ├── App.jsx             # BrowserRouter and page routes
│   │   ├── main.jsx            # React entry point
│   │   ├── components/         # Portfolio sections, Login and FavoriteToggle
│   │   ├── lib/auth-client.js  # Better Auth React client
│   │   ├── styles.js           # Shared container and button utilities
│   │   └── data/photos.js      # Original data, no longer used by the gallery
│   ├── css/                    # Tailwind theme and base styles
│   ├── vite.config.js          # Development API proxy
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.js            # Express entry point and route mounting
│   │   ├── auth.js             # Better Auth configuration
│   │   ├── stripe.js           # Lazy Stripe test-mode configuration
│   │   ├── middleware/         # Reusable authenticated-route guard
│   │   ├── routes/photos.js    # Gallery API
│   │   └── db/
│   │       ├── index.js        # PostgreSQL connection and Drizzle instance
│   │       ├── schema.js       # Photos and auth table definitions
│   │       ├── photos.data.js  # Four original gallery records
│   │       └── seed.js         # Insert missing photos
│   ├── .env.example            # Placeholder values only
│   ├── drizzle.config.js
│   └── package.json
└── README.md
```

## Local setup

Use Node.js **22.12+**, npm and a PostgreSQL database, such as Neon. There are no root npm scripts; run commands from the indicated folder.

### 1. Configure the server

```sh
cd server
npm ci
cp .env.example .env
```

Edit `server/.env` with your own values:

| Variable | Purpose | Local setting |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Your database URL, including its required SSL options |
| `BETTER_AUTH_SECRET` | Auth signing secret | A random secret of at least 32 characters |
| `BETTER_AUTH_URL` | Public auth server base URL | `http://localhost:3000` |
| `CLIENT_URL` | Allowed frontend origin for CORS and auth | `http://localhost:5173` |
| `STRIPE_SECRET_KEY` | Server-only Stripe test-mode secret | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret printed by Stripe CLI | `whsec_...` |
| `CHECKOUT_SUCCESS_URL` | Frontend payment-success route | `http://localhost:5173/checkout/success` |
| `CHECKOUT_CANCEL_URL` | Return location after cancelled checkout | `http://localhost:5173/#contact` |
| `PORT` | Express listening port | `3000` |

Generate a secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Replace the example secret. Keep secrets on the server; never place them in frontend code or `VITE_*` variables. The current `.gitignore` excludes `/server/.env` specifically, not every possible environment filename. This file was confirmed ignored and untracked during the README update; a complete Git history secret audit has not been performed.

### 2. Create tables and seed data

From `server/`, against your development database:

```sh
npm run db:migrate
npm run db:seed
```

`db:migrate` applies committed incremental migrations while preserving existing users and orders. The seed inserts four photos and the available services, and skips existing IDs so rerunning it does not create duplicates. It does not update existing records or delete data.

After the site owner has created a normal account, promote it once from `server/`:

```sh
npm run admin:promote -- owner@example.com
```

New accounts always receive the `user` role. The signup API cannot assign `admin`; promotion requires direct server/database access. Sign out and back in after promotion so the browser receives fresh session data.

Other database commands:

- `npm run db:generate`: generate migration files; does not apply them.
- `npm run db:migrate`: apply committed Drizzle migrations to the configured database.
- `npm run db:push`: compare the schema directly with a development database; review proposed changes before accepting them.
- `npm run db:studio`: open the database inspection tool.

### 3. Start both applications

Terminal 1, from `server/`:

```sh
npm run dev
```

Terminal 2, from the repository root:

```sh
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. Keep this port aligned with `CLIENT_URL`. If Vite selects another port, resolve the conflict or update the environment and restart the server.

Vite forwards `/api/*` requests to `http://localhost:3000`. The frontend uses relative API URLs, including `/api/auth`, so both servers must run. Internet access is needed for the remote database, Unsplash images and Google Fonts.

## Database schema

| Table | What it stores |
| --- | --- |
| `photos` | Stable text ID, title, category, image URL, alternative text, dimensions, aspect class and display order |
| `user` | Name, unique email, `user`/`admin` role, verification flag, optional image and timestamps |
| `account` | Auth provider details and password hash managed by Better Auth |
| `session` | Unique session token, expiration, user reference and optional client metadata |
| `verification` | Verification identifiers, values and expiration timestamps used by Better Auth |
| `services` | Purchasable photography-session types and authoritative prices in cents |
| `orders` | One authenticated user's purchase, separate payment and fulfillment states, booking details and Stripe references |
| `order_items` | Immutable service-name and price snapshots for each order |

Accounts and sessions reference users and are deleted when their user is deleted. Orders reference real users, and order items are deleted with their order. Photos are public content independent of user accounts. Favorites still remain client-side only.

The service seed uses integer USD cents: Portrait `15000`, Lifestyle `17500`, Travel `25000`, Architecture `20000`, and Other `15000`. It inserts missing service IDs without overwriting or duplicating existing records.

Edit `server/src/db/photos.data.js` for seed data. Existing database records need an explicit update because the seed skips duplicate IDs. The old `client/src/data/photos.js` file is no longer the gallery's data source.

## API and authentication

| Method | Endpoint | Behavior |
| --- | --- | --- |
| `GET` | `/api/photos` | Returns `{ "photos": [...] }` ordered by `sortOrder`, then ID; returns 500 on failure |
| `GET` | `/api/services` | Returns active photography-session names and authoritative database prices |
| `GET` | `/api/health` | Checks the database with `SELECT 1`; returns 200 when connected or 503 when unavailable |
| `POST` | `/api/auth/sign-up/email` | Creates an account using name, email and password |
| `POST` | `/api/auth/sign-in/email` | Signs in using email and password |
| `GET` | `/api/auth/get-session` | Retrieves the current session |
| `POST` | `/api/auth/sign-out` | Signs out the current session |
| `POST` | `/api/checkout` | Requires login, prices one active service from PostgreSQL, creates a pending order and returns a Stripe hosted Checkout URL |
| `POST` | `/api/stripe/webhook` | Verifies Stripe's signature and is the only endpoint that marks a matching paid Checkout order as paid |
| `GET` | `/api/orders` | Returns the signed-in user's paid orders and item snapshots, newest first |
| `GET` | `/api/orders/:orderId` | Returns one authenticated user's own order and item snapshots; returns 404 for another user's order |
| `GET` | `/api/admin/orders` | Admin-only paginated order list with customer/order search and payment/fulfillment filters |
| `GET` | `/api/admin/orders/:orderId` | Admin-only full order and customer details |
| `PATCH` | `/api/admin/orders/:orderId/status` | Admin-only fulfillment update for paid orders; never changes payment state |

Better Auth handles `/api/auth/*` before Express JSON parsing. The React client includes cookies with requests and shares session state between Login and Header. Sessions are stored in PostgreSQL, last seven days and have a one-day update interval. Signup automatically signs the user in. Passwords must contain 8–128 characters. Email verification, password reset and social login are not configured.

`server/src/middleware/require-auth.js` exposes the authenticated Better Auth session as `req.auth` and returns `401` when no valid session cookie exists. The checkout route accepts `serviceId`, an optional future-only `preferredDate` in `YYYY-MM-DD` format, and a required `message` of up to 2,000 characters. Dates are checked against the current day in `BOOKING_TIME_ZONE` (default: `Asia/Riyadh`). It ignores browser pricing, snapshots the database price into the order item, and never marks an order paid. Stripe configuration is lazy, so the existing gallery/auth server can still start before local Stripe secrets are supplied.

For local webhook forwarding, keep the server and Stripe CLI running in separate terminals:

```sh
stripe listen --events checkout.session.completed --forward-to localhost:3000/api/stripe/webhook
```

Copy the CLI's `whsec_...` signing secret into `STRIPE_WEBHOOK_SECRET` and restart the server. The webhook uses the raw request body, verifies `Stripe-Signature`, and checks the stored Session ID, user, amount, currency and paid status before updating an order. Repeated delivery of the same successful event is safe.

After Stripe redirects to `/checkout/success?order_id=...`, the React success page polls the protected order endpoint for up to ten seconds. It displays the stored order as paid only after the webhook updates PostgreSQL; the redirect and browser never mark an order paid. The confirmed receipt links to `/dashboard/orders`, where `new` and `confirmed` bookings appear as current orders and `completed` and `cancelled` bookings appear as previous orders. Signed-out visitors are returned through login before viewing this private route.

Administrators receive a **Manage orders** header link to `/admin/orders`. The page can search by customer name, email or order ID, filter both status types, and move a paid order to confirmed, completed or cancelled. The Express routes enforce the role independently of the React UI and return `403` to authenticated non-admin users.

The gallery and service catalog remain public. `SelectedWork` fetches photos, filters with `.filter()` and renders with `.map()` using stable IDs. It owns favorites state and passes `checked` and `onChange` to each controlled `FavoriteToggle`; updates use a functional state setter. The contact form loads session prices from `/api/services`; signed-in users can create Checkout Sessions, while signed-out users are sent through login and returned to `/#contact`.

Read-only API checks while the server is running:

```sh
curl http://localhost:3000/api/health
curl http://localhost:3000/api/photos
```

## Design system

| Role | Value |
| --- | --- |
| Background | `#F7F6F2` |
| Primary text | `#1A1A1A` |
| Secondary text | `#77736D` |
| Accent | `#9A7B5B` |
| Border | `#DEDAD3` |
| Headings | Playfair Display |
| Body and controls | Inter |

Theme values live in `client/css/main.css`, with base styles in `client/css/base.css`. Spacing tokens are 8, 16, 24, 48 and 80px. The page container is capped at 1200px. Gallery and About switch to two columns at 768px; Hero switches at 1024px. Images use `object-fit: cover` with portrait and landscape ratios.

Login and signup share a fluid container capped by `--container-auth: 36rem`. Keep container widths separate from spacing tokens: `max-w-xl` resolves to the project's 80px spacing value.

## Verification

From `client/`:

```sh
npm run lint
npm run build
```

From `server/`, run the database-backed authorization and webhook-rejection tests:

```sh
npm test
```

The test creates isolated temporary users and an order, verifies regular-user isolation, admin fulfillment updates, expired-session rejection and invalid Stripe signatures, then removes its fixtures.

Both commands passed after the latest UI changes. Backend JavaScript syntax checks passed when the files were added. These checks do not establish successful database connectivity, authentication or browser responsiveness.

Remaining acceptance checks:

- Confirm the schema is applied and seeding twice creates no duplicate photos.
- Verify gallery data comes from the API; test loading, failure, retry and empty states.
- Test signup, invalid login, duplicate email, logout and session persistence after refresh.
- Check Login and signup at 320, 375, 768, 1024 and 1440px, including keyboard navigation and horizontal overflow. The 80px width issue was corrected and generated CSS checked; visual verification remains pending.
- Check section links from both routes, mobile navigation and the disabled booking form.
- Confirm no secrets exist in tracked files or Git history before publication.

`npm run preview` serves the frontend production build locally but does not use Vite's development API proxy. Testing the complete app that way requires an equivalent API proxy.

## Deployment status

Target services are **Neon** for PostgreSQL, **Railway** for Express and **Vercel** for the frontend. Public deployment is not verified, and no live URL is recorded yet.

- Railway: use `server/` as the service root, install dependencies and run `npm start`. Configure environment variables on the hosting platform.
- Vercel: use `client/` as the project root, run `npm run build` and publish `dist/`.
- Configure production `/api/*` forwarding to Railway and an SPA fallback to `index.html` for `/login`. API forwarding must take precedence over the fallback.
- With that same-origin proxy arrangement, set `CLIENT_URL` and `BETTER_AUTH_URL` to the public frontend origin. Verify session cookies over HTTPS.
- Apply the database schema deliberately, seed photos, then test the public API and signup/login/refresh/logout flow before assessment.

The development proxy does not configure production hosting. Production forwarding and SPA routing still need to be configured and tested.

## Sources

- Photography: [Unsplash](https://unsplash.com/).
- Fonts: [Google Fonts](https://fonts.google.com/).

This is an educational project. Local assignment documents under `docs/` and historical reference artifacts under `reference/` are excluded from Git.
