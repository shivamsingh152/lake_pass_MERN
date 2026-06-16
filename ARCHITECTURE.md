# Lake Pass Architecture

This document explains the technical architecture of the Lake Pass MVP implementation.

## 1. System Overview

Lake Pass is a multi-surface booking platform with one backend API and two frontend experiences:

- Marina operations dashboard (`client`)
- Consumer booking app (`client` route: `/book`)
- Embeddable booking widget (`widget`)

All clients communicate with the same Express API and MongoDB datastore.

```text
                           +---------------------------+
                           |      React Dashboard      |
                           |   + Consumer Booking App  |
                           |      (client :5173)       |
                           +-------------+-------------+
                                         |
                                         |
                           +-------------v-------------+
+-------------------+      |       Express API         |      +------------------+
| React Widget App  +----->|         (server)          +----->|     MongoDB      |
|   (widget :5174)  |      | auth, marinas, bookings,  |      |  (single DB)     |
+-------------------+      | customers, payments, etc. |      +------------------+
                           +---------------------------+
```

## 2. Repository Layout

```text
lake_pass/
├── server/
│   ├── middleware/      JWT auth and role authorization
│   ├── models/          Mongoose schemas
│   ├── routes/          Domain route handlers
│   ├── seed/            Seed script and demo data
│   ├── utils/           Token + availability helpers
│   ├── .env.example
│   └── server.js
├── client/
│   ├── src/api/         Axios client with auth interceptors
│   ├── src/components/  Layout, sidebar, header, modal, badge
│   ├── src/context/     Auth context and session lifecycle
│   ├── src/pages/       Dashboard and product workflows
│   └── vite config
├── widget/
│   ├── src/Widget.jsx   Standalone embeddable booking flow
│   └── vite config
└── package.json         Monorepo scripts
```

## 3. Backend Architecture

## 3.1 API Composition

`server/server.js` composes:

- CORS with allowed client/widget origins
- JSON body parsing
- health endpoint (`/api/health`)
- route groups:
  - `/api/auth`
  - `/api/marinas`
  - `/api/boats`
  - `/api/availability`
  - `/api/reservations`
  - `/api/customers`
  - `/api/payments`

The server bootstraps only after a successful MongoDB connection.

## 3.2 Domain Model

### `User`

- identity: `name`, `email`, `password`
- access: `role` (`owner | manager | staff`)
- tenancy: `marina`
- lifecycle: `isActive`

### `Marina`

- profile fields (`name`, `slug`, location, contact, website)
- ownership (`owner`)
- settings (`depositPercent`, `damageFee`, `turnaroundHours`, etc.)
- payment integration (`stripeAccountId`)

### `Boat`

- marina ownership
- taxonomy (`type`)
- pricing (`hourlyRate`, `dailyRate`)
- operational metadata (`capacity`, `turnaroundHours`, `features`)
- soft lifecycle (`isActive`)

### `Availability`

- boat + marina scoped block
- typed block reason (`maintenance`, `blocked`, `locked_deal`, `holiday`)
- date interval + note

### `Customer`

- contact and identity info
- insurance/license details
- aggregate counters (`totalRentals`, `totalSpent`)

### `Reservation`

- relations: marina, boat, customer
- booking interval (`startDate`, `endDate`)
- commerce fields (`totalAmount`, `depositAmount`, `damageFee`)
- lifecycle (`status`, `paymentStatus`)
- source attribution (`dashboard`, `consumer_app`, `widget`, `phone`)

## 3.3 Authentication and Authorization

### Authentication

- Login issues JWT (`30d` expiry).
- Protected routes use `Authorization: Bearer <token>`.
- Token decoding loads user + marina context and blocks inactive accounts.

### Authorization

- Role checks via `authorize(...roles)`.
- Management actions are constrained to `owner`/`manager` where applicable.
- Most queries are marina-scoped using authenticated user context.

## 3.4 Booking and Availability Logic

Core helper (`utils/availability.js`) enforces:

- interval overlap checks against non-cancelled reservations
- interval overlap checks against explicit availability blocks
- day-count pricing calculation for totals

This logic is used by both dashboard booking and public booking routes to avoid divergent behavior.

## 3.5 Payment Strategy

Payments route supports dual behavior:

- **Stripe mode**: creates payment intents via Stripe SDK.
- **Mock mode**: auto-simulates payment when key is absent/placeholder.

This enables local/demo execution without external payment setup, while preserving Stripe-compatible flow.

## 4. Frontend Architecture (Dashboard + Consumer)

## 4.1 Client App Structure

- Router-based navigation in `App.jsx`
- Protected dashboard shell in `components/Layout.jsx`
- Session state and token persistence in `context/AuthContext.jsx`
- Shared API client with token injection + unauthorized redirect (`api/api.js`)

## 4.2 UX Surfaces

### Dashboard Pages

- `Dashboard`: operational KPIs and upcoming/recent reservations
- `Fleet`: boat CRUD
- `Availability`: date blocking
- `Reservations`: reservation CRUD/status and payment action
- `Customers` + `CustomerDetail`: customer profile and rental history
- `Users`: team member management by role
- `Settings`: marina and payment configuration
- `Widget`: iframe embed generator + preview

### Consumer Flow

`/book` supports guided multi-step booking:

1. select marina
2. select boat
3. select dates and check availability
4. provide customer details
5. create reservation and collect deposit
6. show confirmation

## 4.3 Responsiveness

Recent responsiveness fixes include:

- mobile sidebar drawer + menu trigger
- responsive page paddings and header handling
- horizontal overflow wrappers for dense tables
- safer action-row stacking on smaller screens

## 5. Widget Architecture

Widget is an independent React app (`widget/src/Widget.jsx`) that:

- reads target marina from query (`?marina=<slug>`)
- loads marina boats from public endpoint
- captures dates + customer details
- creates public reservation and confirms mock payment
- is embeddable via iframe on external marina websites

This separation keeps embed integration simple and avoids coupling third-party sites to dashboard routing.

## 6. Data Flow Summary

```text
[User UI Action]
   -> [React page/widget state]
   -> [Axios request]
   -> [Express route]
   -> [Mongoose model operations]
   -> [JSON response]
   -> [UI refresh or next step]
```

Booking-specific flow:

```text
Date Selection
 -> /api/reservations/public/check
 -> overlap checks (reservations + availability)
 -> create reservation
 -> payment intent/mock confirm
 -> reservation status/payment update
```

## 7. Multi-Tenancy Strategy

The MVP uses application-level tenancy by `marina` ID:

- authenticated dashboard operations derive marina from logged-in user
- public operations require marina context in path/body
- queries and updates are scoped to marina to avoid cross-tenant mixing

## 8. Non-Functional Notes

- Basic error handling returns structured JSON message on route failures.
- No advanced caching layer; DB is the source of truth.
- CORS is configurable by environment.
- Current architecture is suitable for MVP scale and easy iteration.

## 9. Current Limitations

- No automated tests yet (unit/integration/e2e)
- Some search behavior is implemented in memory after initial query
- Stripe webhook reconciliation path not yet implemented end-to-end
- No background workers for async workflows

## 10. Future Architecture Evolution

Recommended next architecture milestones:

1. add integration and e2e test layers
2. introduce DB-level indexed search + pagination patterns
3. add webhook worker for payment state reconciliation
4. add centralized logging/metrics and alerting
5. package as containerized services with CI/CD
