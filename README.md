# Lake Pass - Marina Management Platform (MVP)

Lake Pass is a full-stack MERN MVP for modern marina operations and renter-facing boat booking.
It combines three products in one system:

- Marina operations dashboard
- Consumer booking application
- Embeddable booking widget for marina websites

This project is built to satisfy the assignment scope shared in the product transcript.

## 1) Business Context and Problem

Many marinas still run reservations, fleet scheduling, customer records, and payments through fragmented tools:

- spreadsheets
- phone calls and manual confirmations
- disconnected systems

Lake Pass addresses this by centralizing day-to-day operations and exposing a modern digital booking flow.

## 2) Project Scope

### In-Scope (MVP)

- Role-based authentication (`owner`, `manager`, `staff`)
- Marina setup and profile settings
- Fleet management (add/edit/soft-delete boats)
- Availability blocks (maintenance, blocked, locked deal, holiday)
- Reservation lifecycle (pending -> confirmed -> checked_in -> completed/cancelled)
- Customer profiles with rental history and insurance fields
- Deposit/full payment flow (Stripe-compatible with mock fallback)
- Consumer booking flow (`/book`)
- Embeddable iframe booking widget (`widget` app)
- Seed data for 4 initial marinas

### Out of Scope (Current Build)

- Native mobile apps
- Advanced pricing rules (seasonal/dynamic pricing)
- Real Google Calendar sync (calendar-style data exists, no external sync)
- Multi-language localization
- Production-grade observability pipeline

## 3) Impact and Value

### Operational Impact

- Reduces manual booking coordination with a centralized reservation workflow
- Improves fleet utilization visibility using availability blocks and reservation overlap checks
- Standardizes team access with role-based permissions

### Customer Experience Impact

- Enables direct self-serve booking through consumer app and widget
- Improves booking confidence with real-time availability validation
- Simplifies checkout with deposit-first payment model

### Business Impact

- Supports onboarding multiple marinas on one platform model
- Increases digital booking conversion potential
- Creates a foundation for future analytics, channel expansion, and automation

## 4) Solution Architecture

```text
lake_pass/
├── server/      Express API + MongoDB (Mongoose)
├── client/      React dashboard + consumer booking app
├── widget/      Standalone embeddable booking UI
└── package.json Workspace scripts
```

### Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs
- Payments: Stripe SDK with mock fallback mode

## 5) Functional Modules

### A. Marina Dashboard (`client`)

- Authentication and role-based access
- Dashboard KPIs (boats, reservations, customers, revenue)
- Fleet management UI
- Availability scheduler UI
- Reservation management table and actions
- Customer profile and rental history views
- Team management
- Marina settings and payment defaults

### B. Consumer Booking App (`/book`)

- Select marina
- Select boat
- Select dates and validate availability
- Enter customer details
- Create reservation
- Pay deposit (mock or Stripe-backed)
- Show booking confirmation

### C. Embeddable Booking Widget (`widget`)

- Hosted on separate app (`:5174`)
- Marina-specific loading via query parameter (`?marina=sunset-bay`)
- Designed to embed into external sites using iframe

## 6) Data Model Summary

Key collections:

- `User`: identity, role, marina association, activation state
- `Marina`: profile, settings, owner, Stripe account reference
- `Boat`: fleet metadata, pricing, status, turnaround buffer
- `Availability`: blocked ranges and reasons
- `Customer`: contact, insurance, rental summary
- `Reservation`: booking interval, totals, payment state, source

## 7) API Coverage

### Auth (`/api/auth`)

- `POST /register`
- `POST /login`
- `GET /me`
- `GET /users` (owner/manager)
- `POST /users` (owner/manager)
- `PUT /users/:id` (owner/manager)

### Marinas (`/api/marinas`)

- `GET /public`
- `GET /public/:slug`
- `GET /`
- `GET /:id`
- `PUT /:id` (owner/manager)
- `GET /:id/dashboard`

### Boats (`/api/boats`)

- `GET /public/marina/:marinaId`
- `GET /`
- `GET /:id`
- `POST /` (owner/manager)
- `PUT /:id` (owner/manager)
- `DELETE /:id` (soft delete)
- `GET /:id/calendar`

### Availability (`/api/availability`)

- `GET /`
- `POST /`
- `DELETE /:id` (owner/manager)

### Reservations (`/api/reservations`)

- `GET /public/check`
- `GET /`
- `GET /:id`
- `POST /` (dashboard flow)
- `POST /public` (consumer/widget flow)
- `PUT /:id`
- `DELETE /:id` (cancel)

### Customers (`/api/customers`)

- `GET /`
- `GET /:id`
- `POST /`
- `PUT /:id`

### Payments (`/api/payments`)

- `POST /create-payment-intent`
- `POST /confirm-mock`
- `POST /damage-fee`

### Health

- `GET /api/health`

## 8) Environment Configuration

Use `server/.env.example` as base:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lakepass
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_URL=http://localhost:5173
WIDGET_URL=http://localhost:5174
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

Front-end apps can proxy to the API via `VITE_API_URL` if the server runs on a different port.

If `STRIPE_SECRET_KEY` is unset or placeholder, payment routes run in mock mode for demo.

## 9) Local Setup and Run

### Prerequisites

- Node.js 18+
- MongoDB 7+ (local or Atlas URI)

### Install and Start

```bash
npm run install:all
npm run seed
npm run dev
```

### Run the apps

- Start backend + client only:

```bash
npm run dev
```

- Start backend + client + widget together from the root:

```bash
npm run dev:all
```

- Start only the widget app:

```bash
npm run dev:widget
```

- Start only the server:

```bash
cd server && npm run dev
```

- Start only the client:

```bash
cd client && npm run dev
```

Run `npm run dev:all` from the repository root when you want all three services active at once.

### Production Build Check

```bash
npm run build
```

## 10) Demo Access and URLs

### Demo Credentials

- Owner: `owner@sunsetbay.com` / `password123`
- Manager: `manager@sunsetbay.com` / `password123`
- Staff: `staff@sunsetbay.com` / `password123`

Other marinas follow same pattern:
`owner@crystallake.com`, `owner@bluewater.com`, `owner@pinecove.com`.

### URLs

- Dashboard: [http://localhost:5173](http://localhost:5173)
- Consumer booking: [http://localhost:5173/book](http://localhost:5173/book)
- Widget host: [http://localhost:5174?marina=sunset-bay](http://localhost:5174?marina=sunset-bay)
- API health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 11) Seeded Data

Seed script creates 4 marinas:

1. Sunset Bay Marina (Lake Geneva, WI)
2. Crystal Lake Harbor (Traverse City, MI)
3. Blue Water Marina (Duluth, MN)
4. Pine Cove Marina (Brainerd, MN)

For each marina:

- Owner, manager, and staff users
- 3 boats
- 2 customers
- 1 reservation
- 1 maintenance availability block

## 12) Booking Widget Embed

```html
<iframe
  src="http://localhost:5174?marina=sunset-bay"
  width="100%"
  height="700"
  frameborder="0"
  style="border:none;border-radius:12px;"
></iframe>
```

## 13) Security and Access Notes

- Passwords are hashed using `bcryptjs`
- JWT required for protected dashboard APIs
- Role checks enforced for management actions
- CORS restricted to configured client/widget origins

## 14) Quality Status (Current)

Double-checked against running code:

- API health endpoint responds correctly
- Login flow works with seeded accounts
- Client and widget production builds pass
- Dashboard responsive behavior improved for sidebar/tables
- Unused code and dependency cleanup applied

## 15) Known Limitations and Next Steps

Current limitations:

- No automated test suite yet (unit/integration/e2e)
- Search filtering is currently done in-memory after query in some routes
- Stripe webhooks are not fully wired for asynchronous status reconciliation
- No audit logs/metrics dashboards for production operations

Recommended next steps:

1. Add backend integration tests and frontend e2e tests
2. Add pagination and DB-level indexed search patterns
3. Implement webhook-driven payment state synchronization
4. Add Docker and CI pipeline for reproducible deployment
5. Add monitoring, rate-limiting, and structured logging

## 16) Repository Scripts

Root (`package.json`):

- `npm run install:all` - install root/server/client/widget dependencies
- `npm run dev` - run API and dashboard in parallel
- `npm run dev:server` - run API only
- `npm run dev:client` - run dashboard only
- `npm run dev:widget` - run widget only
- `npm run seed` - populate database with demo records
- `npm run build` - build client and widget

## License

MIT - built for Lake Pass assignment submission.
