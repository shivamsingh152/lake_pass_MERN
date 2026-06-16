# Lake Pass API Reference

Base URL (local): `http://localhost:5000/api`

This document reflects the currently implemented API routes in `server/routes`.

## 1) Authentication

Protected endpoints require:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

Roles used in authorization:

- `owner`
- `manager`
- `staff`

## 2) Health

### GET `/health`

Health check endpoint.

**Response 200**

```json
{
  "status": "ok",
  "service": "Lake Pass API"
}
```

## 3) Auth Routes (`/auth`)

### POST `/auth/register`

Registers a user. If role is owner and marina details are provided, creates marina and links owner.

**Body**

```json
{
  "name": "John Owner",
  "email": "owner@example.com",
  "password": "password123",
  "role": "owner",
  "marinaName": "My Marina",
  "marinaSlug": "my-marina"
}
```

**Response 201**

```json
{
  "_id": "userId",
  "name": "John Owner",
  "email": "owner@example.com",
  "role": "owner",
  "marina": { "_id": "marinaId", "name": "My Marina" },
  "token": "jwt"
}
```

### POST `/auth/login`

Logs in user and returns JWT + marina context.

**Body**

```json
{
  "email": "owner@sunsetbay.com",
  "password": "password123"
}
```

### GET `/auth/me` (Protected)

Returns current authenticated user (with marina populated).

### GET `/auth/users` (Protected: owner/manager)

Returns users in current marina.

### POST `/auth/users` (Protected: owner/manager)

Creates a marina-scoped user.

**Body**

```json
{
  "name": "Dock Staff",
  "email": "staff@example.com",
  "password": "password123",
  "role": "staff",
  "phone": "555-0100"
}
```

### PUT `/auth/users/:id` (Protected: owner/manager)

Updates user details/status.

**Body (example)**

```json
{
  "name": "Updated Name",
  "role": "manager",
  "phone": "555-0101",
  "isActive": true
}
```

## 4) Marina Routes (`/marinas`)

### GET `/marinas/public`

Public list of active marinas.

### GET `/marinas/public/:slug`

Public marina detail + active boats.

### GET `/marinas` (Protected)

Returns authenticated user marina (or all marinas when no marina linked).

### GET `/marinas/:id` (Protected)

Returns marina detail.

### PUT `/marinas/:id` (Protected: owner/manager)

Updates marina profile/settings.

### GET `/marinas/:id/dashboard` (Protected)

Returns dashboard aggregate payload:

- `stats` (boats, reservations, customers, revenue)
- `upcoming`
- `recentReservations`

## 5) Boat Routes (`/boats`)

### GET `/boats/public/marina/:marinaId`

Public active boats by marina.

### GET `/boats` (Protected)

List boats for current marina (or `?marina=<id>` override).

### GET `/boats/:id` (Protected)

Single boat detail.

### POST `/boats` (Protected: owner/manager)

Create boat.

**Body (example)**

```json
{
  "name": "Sunset Cruiser",
  "type": "pontoon",
  "capacity": 10,
  "dailyRate": 350,
  "description": "Great family boat"
}
```

### PUT `/boats/:id` (Protected: owner/manager)

Update boat fields.

### DELETE `/boats/:id` (Protected: owner/manager)

Soft-deletes boat (`isActive=false`).

### GET `/boats/:id/calendar` (Protected)

Returns calendar payload:

- `reservations` (non-cancelled)
- `availability` blocks

Optional query:

- `start`
- `end`

## 6) Availability Routes (`/availability`)

### GET `/availability` (Protected)

List availability blocks.

Query params:

- `marina` (optional)
- `boat` (optional)

### POST `/availability` (Protected: owner/manager/staff)

Create a new block.

**Body**

```json
{
  "boat": "boatId",
  "type": "maintenance",
  "startDate": "2026-06-20",
  "endDate": "2026-06-21",
  "reason": "Engine service"
}
```

### DELETE `/availability/:id` (Protected: owner/manager)

Deletes block by ID.

## 7) Reservation Routes (`/reservations`)

### GET `/reservations/public/check`

Public availability check for one boat interval.

Query params:

- `boatId` (required)
- `startDate` (required)
- `endDate` (required)

**Response**

```json
{ "available": true }
```

or

```json
{ "available": false, "reason": "Boat already reserved for these dates" }
```

### GET `/reservations` (Protected)

List marina reservations.

Query params:

- `marina`
- `status`
- `search`
- `start`
- `end`

### GET `/reservations/:id` (Protected)

Reservation detail with populated relations.

### POST `/reservations` (Protected)

Creates dashboard reservation with availability check and amount calculation.

**Body (existing customer)**

```json
{
  "boatId": "boatId",
  "customerId": "customerId",
  "startDate": "2026-06-20",
  "endDate": "2026-06-22",
  "notes": "VIP customer",
  "source": "dashboard"
}
```

**Body (upsert customer)**

```json
{
  "boatId": "boatId",
  "customerData": {
    "firstName": "Alex",
    "lastName": "Parker",
    "email": "alex@example.com",
    "phone": "555-1212"
  },
  "startDate": "2026-06-20",
  "endDate": "2026-06-22"
}
```

### POST `/reservations/public`

Creates reservation for consumer app or widget.

**Body**

```json
{
  "marinaId": "marinaId",
  "boatId": "boatId",
  "customerData": {
    "firstName": "Jamie",
    "lastName": "Lee",
    "email": "jamie@example.com",
    "phone": "555-0102"
  },
  "startDate": "2026-06-20",
  "endDate": "2026-06-22",
  "source": "widget"
}
```

### PUT `/reservations/:id` (Protected: owner/manager/staff)

Updates reservation status/payment/notes and optionally dates (with re-check).

**Body (example)**

```json
{
  "status": "confirmed",
  "paymentStatus": "deposit_paid",
  "notes": "Confirmed by staff"
}
```

### DELETE `/reservations/:id` (Protected: owner/manager)

Soft-cancels reservation by setting `status=cancelled`.

## 8) Customer Routes (`/customers`)

### GET `/customers` (Protected)

List customers for marina.

Query params:

- `marina`
- `search`

### GET `/customers/:id` (Protected)

Returns:

- `customer`
- `rentals` history with populated boat data

### POST `/customers` (Protected: owner/manager/staff)

Create customer.

### PUT `/customers/:id` (Protected: owner/manager/staff)

Update customer.

## 9) Payment Routes (`/payments`)

### POST `/payments/create-payment-intent`

Creates Stripe payment intent (or mock response if Stripe not configured).

**Body**

```json
{
  "reservationId": "reservationId",
  "paymentType": "deposit"
}
```

`paymentType`:

- `deposit`
- `full`

### POST `/payments/confirm-mock`

Confirms payment in mock mode and updates reservation/payment status.

**Body**

```json
{
  "reservationId": "reservationId",
  "paymentType": "deposit"
}
```

### POST `/payments/damage-fee` (Protected)

Updates reservation damage fee.

**Body**

```json
{
  "reservationId": "reservationId",
  "amount": 750
}
```

## 10) Error Format

Typical failures return:

```json
{
  "message": "Human-readable error"
}
```

Validation errors (auth routes with `express-validator`) may return:

```json
{
  "errors": [
    { "type": "field", "path": "email", "msg": "Invalid value" }
  ]
}
```

Common HTTP codes:

- `200` success
- `201` created
- `400` validation/business rule failure
- `401` unauthorized
- `403` forbidden by role
- `404` not found
- `500` server error

## 11) Quick API Smoke Test

1. Start services:

```bash
npm run dev
```

2. Login:

```http
POST /api/auth/login
```

3. Use returned token for protected endpoints:

- `/api/auth/me`
- `/api/boats`
- `/api/reservations`

4. Public flow test:

- `/api/marinas/public`
- `/api/marinas/public/:slug`
- `/api/reservations/public/check`
- `/api/reservations/public`
