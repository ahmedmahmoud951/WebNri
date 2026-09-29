# Finall Project — Backend Delivery for nri-web

**From:** Parking.Api team  
**To:** Web / mobile developers (`nri-web`, Flutter)  
**Date:** 2026-08-18  
**Scope:** Phases P1–P4 (history, subscriptions, reservations, admin)

This document is the handoff summary after implementing all backend requests in:

- `docs/ASKS-BACKEND-P1-HISTORY.md`
- `docs/ASKS-BACKEND-P2-SUBSCRIPTIONS.md`
- `docs/ASKS-BACKEND-P3-RESERVATIONS.md`
- `docs/ASKS-BACKEND-P4-ADMIN.md`

---

## What was delivered

| Phase | Web screen | Base path | Status |
|-------|------------|-----------|--------|
| P1 | `/receipts` | `/api/v1/parking/sessions`, `/api/v1/payments` | Implemented |
| P2 | `/subscriptions` | `/api/v1/parking/bundles`, `/api/v1/parking/subscriptions` | Implemented |
| P3 | `/reservations` | `/api/v1/parking/reservations` | Implemented |
| P4 | `/admin/*` | `/api/v1/admin/*` | Implemented |

All routes use the same JWT from `POST /api/v1/auth/login`:

```http
Authorization: Bearer {accessToken}
Accept-Language: ar
```

Envelope shape (unchanged):

```json
{
  "success": true,
  "data": { },
  "page": 1,
  "pageSize": 50,
  "totalCount": 0,
  "correlationId": "..."
}
```

Errors use stable `code` values (`FORBIDDEN`, `NO_CURRENT_SUBSCRIPTION`, `RESERVATION_CONFLICT`, …).

---

## Database migration (required before publish)

Run on SQL Server **after** existing scripts:

```text
Database/034_ClientPortalPhases.sql
```

This script adds client-portal columns for bundles, subscriptions, reservations, and seeds demo bundles (monthly / quarterly / annual).

---

## Phase 1 — Session & payment history

### Session history

```http
GET /api/v1/parking/sessions?mine=true&page=1&pageSize=50
```

- **200** always when JWT is valid (even if empty)
- `data.items[]` fields: `sessionId`, `status`, `plate`, `buildingId`, `gateId`, `startedAt`, `endedAt`, `amount`, `currency`, `paidAt`, `graceUntil`
- `status`: `Open` | `Paid` | `Closed`

### Payment receipts (optional)

```http
GET /api/v1/payments?mine=true&page=1&pageSize=50
```

Same paging envelope. Items: `sessionId`, `amount`, `currency`, `paidAt`, `plate`, `graceUntil`.

---

## Phase 2 — Bundles & subscriptions

### List bundles

```http
GET /api/v1/parking/bundles
```

`data.items[]`: `id`, `name`, `period`, `price`, `currency`, `guaranteedSlot`, `buildingId`  
`name` follows `Accept-Language` (`NameAr` when `ar`).

### Current subscription

```http
GET /api/v1/parking/subscriptions/current
```

- Active subscription → **200**
- None → **404** `NO_CURRENT_SUBSCRIPTION`

### Purchase

```http
POST /api/v1/parking/subscriptions
Idempotency-Key: <uuid>
Content-Type: application/json

{ "bundleId": 1, "plate": "RUH2941" }
```

→ **201** + subscription body. Pilot records amount on subscription (no browser payment gateway).

### Renew

```http
POST /api/v1/parking/subscriptions/{id}/renew
Idempotency-Key: <uuid>
```

→ **200** + updated subscription (`endsAt` extended by bundle period).

### Roles

| Role | Bundles GET | POST purchase/renew |
|------|-------------|---------------------|
| Citizen, Employee | Yes | Yes |
| Visitor | Yes | **403** `FORBIDDEN` |
| Admin | Yes | Yes |

---

## Phase 3 — Reservations & guest invite

### List

```http
GET /api/v1/parking/reservations?page=1&pageSize=50
```

`data.items[]`: `id`, `buildingId`, `zoneId`, `plate`, `startsAt`, `endsAt`, `status`, `guestName`, `guestPhone`, `inviteCode`  
`status`: `Booked` | `Cancelled` | `Used` | `Expired`

### Create

```http
POST /api/v1/parking/reservations
Idempotency-Key: <uuid>

{
  "buildingId": 1,
  "zoneId": 3,
  "plate": "ABC1234",
  "startsAt": "2026-08-20T10:00:00Z",
  "endsAt": "2026-08-20T14:00:00Z"
}
```

→ **201**. Overlap → **409** `RESERVATION_CONFLICT`. Citizen / Employee only.

### Cancel

```http
DELETE /api/v1/parking/reservations/{id}
```

→ **204**

### Guest invite

```http
POST /api/v1/parking/reservations/{id}/invite

{
  "guestName": "أحمد علي",
  "guestPhone": "05xxxxxxxx",
  "plate": "XYZ9876"
}
```

→ **200** with `inviteCode` (8-char code) and guest fields.

---

## Phase 4 — Admin

**Admin role only.** Others → **403** `FORBIDDEN`.

### Plate search

```http
GET /api/v1/admin/vehicles/search?plate=ABC
```

Partial match on normalized plate. Empty result → **200** `items: []`.

### Occupancy / revenue summary

```http
GET /api/v1/admin/reports/occupancy
```

`buildingCount`, `free`, `occupied`, `total`, `revenueToday`, `currency`, `graceViolations`, `activeSubscriptions`

### Users (read-only)

```http
GET /api/v1/admin/users?page=1&pageSize=50
```

`data.items[]`: `userId`, `userName`, `displayName`, `role`, `buildingId`, `isActive`

---

## Code map (for maintainers)

| Layer | Files |
|-------|--------|
| DTOs | `Parking.Contracts/Client/ClientPortalPhaseDtos.cs` |
| Client logic | `Parking.Application/Services/ClientPortalPhases.cs` (partial) |
| Admin logic | `Parking.Application/Services/AdminPortalService.cs` |
| API | `Parking.Api/Controllers/ClientApiController.cs`, `AdminApiController.cs` |
| DB | `Database/034_ClientPortalPhases.sql` |
| Tests | `Parking.Tests/ClientPortalPhasesTests.cs` |

---

## Demo accounts (after `029_DemoMobileUsers.sql`)

| User | Password | Role | Can buy sub / book |
|------|----------|------|--------------------|
| `visitor1` | `admin` | Visitor | View only |
| `citizen1` | `admin` | Citizen | Yes |
| `employee1` | `admin` | Employee | Yes |
| `admin1` | `admin` | Admin | Yes + admin APIs |

---

## Publish checklist

1. Run `Database/034_ClientPortalPhases.sql` on production DB
2. Publish `Parking.Api` (Release)
3. Smoke test:
   - `visitor1` → `GET /api/v1/parking/sessions?mine=true` → **200**
   - `citizen1` → `POST /api/v1/parking/subscriptions` → **201**
   - `visitor1` → same POST → **403**
   - `citizen1` → create + invite reservation → **201** / **200**
   - `admin1` → `GET /api/v1/admin/vehicles/search?plate=ABC` → **200**
   - `visitor1` → same admin URL → **403**

---

## Out of scope (unchanged)

- Opening barriers from web
- MQTT / direct SQL from clients
- FCM push (`PUT /api/v1/me/push-token`) — optional later
- POS / kiosk / VMS video

---

## Related docs

- Full API catalog: `docs/FINAL-END-POINT.md`
- Auth: `docs/AUTHENTICATION.md`
- SignalR: `docs/SIGNALR-CONTRACT.md`
- Mobile login fix: `docs/README-FOR-FLUTTER-FRIEND.md`
