# Finall web — Backend Delivery for nri-web (P5–P7)

**From:** Parking.Api team  
**To:** Web / mobile developers (`nri-web`, Flutter)  
**Date:** 2026-08-18  
**Scope:** Phases P5–P7 (grace violations, invite lookup, admin tickets)

This document completes the web portal backend handoff. For P1–P4 see **`docs/Finall-Project.md`**.

Implemented from:

- `docs/ASKS-BACKEND-P5-GRACE.md`
- `docs/ASKS-BACKEND-P6-INVITE.md`
- `docs/ASKS-BACKEND-P7-TICKETS.md`

---

## What was delivered

| Phase | Web screen | Base path | Status |
|-------|------------|-----------|--------|
| P5 | `/admin/grace` | `/api/v1/admin/parking/grace-violations` + extra fields on `/api/v1/parking/sessions/current` | Implemented |
| P6 | `/invite` | `/api/v1/parking/reservations/invite/{code}` | Implemented |
| P7 | `/admin/tickets` + `/tickets` | `/api/v1/admin/tickets` + extended user tickets | Implemented |

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

Paged lists return `data.items[]` inside `data` with `page`, `pageSize`, `totalCount` at the root.

---

## Database migration (required before publish)

Run on SQL Server **after** `034_ClientPortalPhases.sql`:

```text
Database/035_ClientPortalP5P7.sql
```

This script:

- Adds `core.SupportTickets.ResolutionNote`
- Seeds `billing.graceExtraFee = 20` (EGP)
- Sets default `billing.graceMinutes = 20`

---

## Phase 5 — Grace violations

### Admin list

```http
GET /api/v1/admin/parking/grace-violations?page=1&pageSize=50
```

- **Admin only** → others **403** `FORBIDDEN`
- **200** always when authorized (empty list = `items: []`, not 404)

Each item:

```json
{
  "sessionId": 88,
  "plate": "ABC1234",
  "buildingId": 1,
  "buildingName": "Building 01",
  "gateId": 2,
  "paidAt": "2026-08-18T10:00:00Z",
  "graceUntil": "2026-08-18T10:20:00Z",
  "extraFee": 20.0,
  "currency": "EGP",
  "stillParked": true
}
```

**Definition:** session is `Paid`, `graceUntil < now`, vehicle still inside (`stillParked: true`). Default grace period 20 minutes; extra fee 20 EGP from platform settings. Web displays only — **no payment POST** and **no barrier control**.

### Current session extra fee

Existing endpoint — new optional fields when grace expired and user still parked:

```http
GET /api/v1/parking/sessions/current
```

```json
{
  "extraFee": 20.0,
  "extraFeeCurrency": "EGP"
}
```

When no violation: fields omitted or `null`. User sees amount and goes to on-site cashier.

---

## Phase 6 — Invite lookup

Complements reservation invite from P3 (`POST /api/v1/parking/reservations/{id}/invite`).

```http
GET /api/v1/parking/reservations/invite/{code}
```

- `code` is case-insensitive (e.g. `NRI-10012`)
- **200** + full reservation DTO (`id`, `buildingId`, `zoneId`, `plate`, `startsAt`, `endsAt`, `status`, `guestName`, `guestPhone`, `inviteCode`)
- `status`: `Booked` | `Cancelled` | `Used` | `Expired`

### Who can read?

| Caller | Result |
|--------|--------|
| Reservation owner | 200 |
| Invited guest (matching phone or plate on account) | 200 |
| Admin | 200 |
| Others | **403** `FORBIDDEN` |
| Invalid / cancelled code | **404** `INVITE_NOT_FOUND` (not 401) |

Web is read-only — barrier opens at gate (QR/LPR), not from this screen.

---

## Phase 7 — Admin tickets

### Admin queue (read-only)

```http
GET /api/v1/admin/tickets?page=1&pageSize=50
```

- **Admin only** → others **403**
- **200** with `items: []` when empty

Each item:

```json
{
  "id": 21,
  "userId": 5,
  "userName": "visitor1",
  "type": "lost_ticket",
  "note": "Lost paper ticket at gate 2",
  "status": "Open",
  "createdAt": "2026-08-18T08:00:00Z",
  "updatedAt": "2026-08-18T09:10:00Z",
  "resolutionNote": null
}
```

`type`: `lost_ticket` | `barrier` | `other`  
`status`: `Open` | `InProgress` | `Closed`

No PATCH from web in this phase — status changes happen at cashier/operations.

### User tickets (extended)

Existing endpoints unchanged path; response now includes:

```http
GET /api/v1/tickets?page=1&pageSize=50
```

- `status` may be `InProgress` in addition to `Open` / `Closed`
- `resolutionNote` — optional cashier/ops reply text
- `updatedAt` — last status change time

Create ticket remains: `POST /api/v1/tickets`

---

## Error codes (P5–P7)

| code | HTTP | When |
|------|------|------|
| `FORBIDDEN` | 403 | Non-admin on admin routes; invite viewer not allowed |
| `INVITE_NOT_FOUND` | 404 | Unknown or cancelled invite code |
| `UNAUTHORIZED` | 401 | Invalid/missing JWT only |

---

## Smoke test checklist

Use demo accounts from `029_DemoMobileUsers.sql` (password `admin`):

1. **P5** — `admin1` → `GET /api/v1/admin/parking/grace-violations` → **200**
2. **P5** — `visitor1` → same → **403**
3. **P5** — paid session past grace → `GET /api/v1/parking/sessions/current` includes `extraFee`
4. **P6** — `citizen1` creates reservation + invite → `GET .../invite/{code}` → **200**
5. **P6** — wrong code → **404** `INVITE_NOT_FOUND`
6. **P7** — `admin1` → `GET /api/v1/admin/tickets` → **200**
7. **P7** — `visitor1` → `GET /api/v1/tickets` shows `resolutionNote` when set

---

## Code map (for maintainers)

| Layer | Files |
|-------|--------|
| Grace policy | `Parking.Application/Billing/GraceViolationPolicy.cs` |
| DTOs | `Parking.Contracts/Client/ClientPortalPhaseDtos.cs`, `ClientApiDtos.cs` |
| Client logic | `Parking.Application/Services/ClientPortalPhases.cs`, `ClientPortalService.cs` |
| Admin logic | `Parking.Application/Services/AdminPortalService.cs` |
| API | `Parking.Api/Controllers/ClientApiController.cs`, `AdminApiController.cs` |
| DB | `Database/035_ClientPortalP5P7.sql` |
| Tests | `Parking.Tests/ClientPortalPhasesTests.cs` |

---

## Publish checklist

1. Run `Database/034_ClientPortalPhases.sql` (if not already)
2. Run `Database/035_ClientPortalP5P7.sql`
3. Publish `Parking.Api` (Release)
4. Run smoke tests above against staging/production
5. Point `nri-web` env to the published API base URL

---

## Full portal index (P1–P7)

| Screen | Method | Path |
|--------|--------|------|
| Receipts | GET | `/api/v1/parking/sessions?mine=true` |
| Receipts | GET | `/api/v1/payments?mine=true` |
| Subscriptions | GET | `/api/v1/parking/bundles` |
| Subscriptions | GET/POST | `/api/v1/parking/subscriptions/current`, `/api/v1/parking/subscriptions` |
| Reservations | GET/POST/DELETE | `/api/v1/parking/reservations` |
| Invite | POST/GET | `/api/v1/parking/reservations/{id}/invite`, `/api/v1/parking/reservations/invite/{code}` |
| Current session | GET | `/api/v1/parking/sessions/current` |
| User tickets | GET/POST | `/api/v1/tickets` |
| Admin search | GET | `/api/v1/admin/vehicles/search` |
| Admin occupancy | GET | `/api/v1/admin/reports/occupancy` |
| Admin users | GET | `/api/v1/admin/users` |
| Admin grace | GET | `/api/v1/admin/parking/grace-violations` |
| Admin tickets | GET | `/api/v1/admin/tickets` |

Swagger UI: `/swagger` — tags **Admin**, **Reservations**, **Sessions**, **Tickets**.
