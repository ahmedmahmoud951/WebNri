# Final End Point

هذا الملف هو النسخة المختصرة النهائية لصديق الـ Web / Flutter.

آخر تحديث: **2026-08-18**

الاستخدام يكون مع **Parking.Api** فقط.

- لا يوجد SQL Server access من العميل
- لا يوجد connection strings في العميل
- لا يوجد RabbitMQ / MQTT access من العميل
- الـ clients تستخدم فقط:
  - REST
  - SignalR
  - FCM للموبايل فقط

---

## Live status (verified 2026-08-18)

Server `http://nri.runasp.net` is **Healthy** (SQL connected).

Login was tested against the live API. These succeeded with HTTP `200` and a JWT:

| username | password | role | permissions |
|----------|----------|------|-------------|
| `citizen1` | `admin` | Citizen | `monitor.view`, `reports.view` |
| `visitor1` | `admin` | Visitor | `monitor.view`, `reports.view` |
| `employee1` | `admin` | Employee | `monitor.view`, `reports.view` |
| `admin` | `admin` | Admin | full staff |
| `admin1` | `admin` | Admin | full staff + `buildingId = 1` |

**Use HTTP, not HTTPS**, on this host. `https://nri.runasp.net` currently fails TLS from clients.

Canonical login:

```http
POST http://nri.runasp.net/api/v1/auth/login
Content-Type: application/json

{"username":"citizen1","password":"admin"}
```

Read tokens from `data.accessToken` and `data.refreshToken`.

---

## Login troubleshooting

`Database/017_SqlServerHardening.sql` **does not change login data**. It does not update `PasswordHash`, `NormalizedUserName`, or `IsActive`.

If login failed after running 017, the usual causes are:

1. Script ran on the wrong catalog. Hosted DB name is typically `db64137`, not `ParkingSystem`. 017 now stays on the current database unless the session is still on `master`.
2. Client called `https://...` instead of `http://nri.runasp.net`.
3. Client used `/api/v1/auth/dev-login` after a newer Production deploy (that alias will return **404** in Production). Use `/api/v1/auth/login`.
4. Auth rate limit: **10 login requests / minute / IP** → HTTP `429` `rate_limited`.
5. Web browser CORS: Production denies unknown origins. Flutter/WPF do not need CORS. A React site must be added to `Cors:AllowedOrigins` on the server.
6. Wrong JSON field: send `"username"` (or `"userName"`). Empty username/password → `400`.

Diagnostic script (SQL, read-only): `Database/032_LoginDiagnostics.sql`  
Run it on the **same** database the API uses, then send the result if login fails again.

---

## What changed for Web / Flutter (2026-08-18)

Keep using this file as the contract. Backend work that affects the client:

| Item | What to do |
|------|------------|
| Demo users | `citizen1` / `visitor1` / `employee1`, password `admin`. Script: `Database/029_DemoMobileUsers.sql` |
| Login path | Always `POST /api/v1/auth/login`. Do not depend on `dev-login` |
| Hub | `/hubs/parking` (alias `/hubs/live` still works) |
| Occupancy live | handle `OccupancyUpdated` |
| Session live | handle `SessionUpdated` |
| Signup | server assigns `Citizen` only. Do not send `role` / `permissions` |
| JWT | no phone/email in claims. Call `GET /api/v1/me` for profile |
| Health | `GET /api/v1/health` or `GET /health`. No secrets in the body |
| Rate limit | login/refresh 10/min. Other API 300/min |
| Swagger | currently on live. Next Production publish may turn it **off** (`OpenApi:Enabled=false`) |
| Idempotency | send `Idempotency-Key` on payment capture |
| Page size | reports/search cap at 200 |

SQL scripts that may already be on the server: `001`–`031`. Do **not** re-run `029` on a real production tenant after testing.

Full ops notes: `docs/PRODUCTION-RUNBOOK.md`  
Auth contract: `docs/AUTHENTICATION.md`  
Hub contract: `docs/SIGNALR-CONTRACT.md`

---

## Base URLs

### Current Server

```txt
API Base URL = http://nri.runasp.net
Swagger      = http://nri.runasp.net/swagger
Health       = http://nri.runasp.net/api/health
Health Alias = http://nri.runasp.net/health
Hub          = http://nri.runasp.net/hubs/parking
Hub Alias    = http://nri.runasp.net/hubs/live
LPR          = http://nri.runasp.net/api/lpr/events
```

### Browser probe on current server

```txt
GET http://nri.runasp.net/

success        = true
name           = Parking.Api
api            = /api/parking
hub            = /hubs/parking
swagger        = /swagger
health         = /api/health
lpr            = /api/lpr/events
authentication = JWT required for SignalR clients and API operations
hint           = GET /hubs/parking from a browser shows this API. WPF connects here with JWT after login.
```

**المسار الأساسي المعتمد للـ Hub هو `/hubs/parking`.**  
`/hubs/live` موجود كـ compatibility alias للويب.

---

## Required Headers

### Authenticated requests

```http
Authorization: Bearer <accessToken>
Accept-Language: ar
X-Correlation-ID: <optional-uuid>
```

### Payment requests

```http
Authorization: Bearer <accessToken>
Accept-Language: ar
Idempotency-Key: <uuid>
```

---

## Authentication

### 1) Signup

```http
POST /api/v1/auth/signup
```

Request:

```json
{
  "name": "Ahmed Mahmoud",
  "username": "ahmed123",
  "password": "StrongPassword123!",
  "phoneNumber": "01012345678",
  "email": "ahmed@example.com"
}
```

Notes:

- `email` optional
- client cannot set role
- default role = `Citizen`

### 2) Login

```http
POST /api/v1/auth/login
POST /api/parking/auth/login
```

Compatibility alias (Development only after next Production publish):

```http
POST /api/v1/auth/dev-login
```

On the **current live server**, `dev-login` still works. After the next Production deploy it returns **404**. Web / Flutter should use `/api/v1/auth/login` only.

Request:

```json
{
  "username": "citizen1",
  "password": "admin"
}
```

Response `data`:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>",
  "expiresAt": "2026-08-18T01:30:00Z",
  "expiresIn": 28800,
  "tokenType": "Bearer",
  "userName": "ahmed123",
  "displayName": "Ahmed Mahmoud",
  "role": "Citizen",
  "permissions": ["monitor.view", "reports.view"]
}
```

### 3) Refresh

```http
POST /api/v1/auth/refresh
```

Request:

```json
{
  "refreshToken": "<refresh-token>"
}
```

### 4) Logout

```http
POST /api/v1/auth/logout
```

Request:

```json
{
  "refreshToken": "<refresh-token>"
}
```

### 5) Logout All

```http
POST /api/v1/auth/logout-all
```

### 6) Me

```http
GET /api/v1/me
GET /api/v1/auth/me
```

Response `data`:

```json
{
  "id": 42,
  "userId": 42,
  "userName": "ahmed123",
  "displayName": "Ahmed Mahmoud",
  "phoneNumber": "01012345678",
  "email": "ahmed@example.com",
  "roleId": 2,
  "roleName": "Citizen",
  "role": "Citizen",
  "locale": "ar",
  "buildingId": 1,
  "isActive": true,
  "createdAt": "2026-08-18T00:01:00Z",
  "vehicles": [
    {
      "id": 1,
      "plate": "ABC1234",
      "make": "Toyota",
      "model": "Corolla"
    }
  ]
}
```

---

## Vehicles

### List my vehicles

```http
GET /api/v1/me/vehicles
```

### Add vehicle

```http
POST /api/v1/me/vehicles
```

Request:

```json
{
  "plate": "ABC1234",
  "make": "Toyota",
  "model": "Corolla"
}
```

### Update one vehicle

```http
PUT /api/v1/me/vehicles/{id}
```

### Delete one vehicle

```http
DELETE /api/v1/me/vehicles/{id}
```

---

## Buildings and Occupancy

### List buildings

```http
GET /api/v1/buildings?page=1&pageSize=50
```

### Occupancy by building

```http
GET /api/v1/buildings/{buildingId}/occupancy
```

Response `data`:

```json
{
  "buildingId": 1,
  "zones": [
    {
      "zoneId": 3,
      "free": 18,
      "total": 20
    }
  ]
}
```

### Occupancy details

```http
GET /api/v1/buildings/{buildingId}/occupancy/details?page=1&pageSize=50
```

---

## Sessions

### Current session

```http
GET /api/v1/parking/sessions/current
```

If there is no current session:

- HTTP `404`
- `code = NO_CURRENT_SESSION`

### Session by id

```http
GET /api/v1/parking/sessions/{id}
```

Response `data`:

```json
{
  "sessionId": 88,
  "status": "Open",
  "lifecycle": "Entered",
  "plate": "ABC1234",
  "buildingId": 1,
  "gateId": 2,
  "startedAt": "2026-08-17T13:00:00Z",
  "graceUntil": null,
  "amountDue": 15.0,
  "currency": "EGP"
}
```

---

## Payments

### Create payment intent

```http
POST /api/v1/payments/intents
```

Header:

```http
Idempotency-Key: <uuid>
```

Request:

```json
{
  "sessionId": 88,
  "amount": 15.0,
  "currency": "EGP"
}
```

Response `data`:

```json
{
  "id": 501,
  "sessionId": 88,
  "amount": 15.0,
  "currency": "EGP",
  "status": "RequiresCapture",
  "replay": false,
  "graceUntil": null
}
```

### Capture payment intent

```http
POST /api/v1/payments/intents/{id}/capture
```

Header:

```http
Idempotency-Key: <same-key>
```

Response `data`:

```json
{
  "id": 501,
  "sessionId": 88,
  "amount": 15.0,
  "currency": "EGP",
  "status": "Captured",
  "replay": false,
  "graceUntil": "2026-08-17T13:25:00Z"
}
```

Notes:

- same `Idempotency-Key` + same request = same result, no double charge
- `PAYMENT_FAILED` = HTTP `422`
- `GRACE_EXPIRED` = HTTP `409`
- `IDEMPOTENCY_CONFLICT` = HTTP `409`

---

## Tickets

### Create ticket

```http
POST /api/v1/tickets
```

Request:

```json
{
  "type": "lost_ticket",
  "note": "Lost paper ticket at gate 2"
}
```

Allowed types:

- `lost_ticket`
- `barrier`
- `other`

Response:

- HTTP `201`
- returns created ticket in `data`

Example `data`:

```json
{
  "id": 17,
  "userId": 42,
  "type": "lost_ticket",
  "note": "Lost paper ticket at gate 2",
  "status": "Open",
  "createdAt": "2026-08-17T13:10:00Z"
}
```

### List tickets

```http
GET /api/v1/tickets?page=1&pageSize=20
```

Response `data`:

```json
{
  "items": [
    {
      "id": 17,
      "userId": 42,
      "type": "lost_ticket",
      "note": "Lost paper ticket at gate 2",
      "status": "Open",
      "createdAt": "2026-08-17T13:10:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 1
}
```

---

## Push Token (Flutter only)

### Register FCM token

```http
PUT /api/v1/me/push-token
```

Request:

```json
{
  "token": "<fcm-device-token>",
  "platform": "android"
}
```

Allowed `platform`:

- `android`
- `ios`

---

## SignalR

### Canonical hub

```txt
/hubs/parking
```

### Compatibility alias

```txt
/hubs/live
```

### JWT from browser

Use `accessTokenFactory` / query `access_token`.

### Join methods

- `JoinAllowedGroups()`
- `JoinBuilding(areaId)`
- `JoinZone(zoneId)`
- `JoinParking(parkingId)`

### Important realtime events for Web / Flutter

- `OccupancyUpdated`
- `SessionUpdated`
- `BarrierOpened`

Other shared events also exist on the same hub contract.

### `OccupancyUpdated` example

```json
{
  "eventId": "evt-001",
  "occurredAt": "2026-08-18T00:10:00Z",
  "buildingId": 1,
  "zoneId": 3,
  "free": 12,
  "total": 40
}
```

### `SessionUpdated` example

```json
{
  "eventId": "evt-002",
  "occurredAt": "2026-08-18T00:11:00Z",
  "sessionId": 88,
  "status": "Paid",
  "plate": "ABC1234",
  "graceUntil": "2026-08-18T00:26:00Z",
  "amountDue": 0,
  "currency": "EGP",
  "parkingId": 5
}
```

If the token cannot access the requested building/group, the hub returns an error like:

```txt
forbidden: Realtime group is not available.
```

---

## Health and Swagger

### Health

```http
GET /api/health
GET /health
```

### Swagger

```http
GET /swagger
GET /swagger/v1/swagger.json
```

---

## Error Codes

Main codes needed by Web / Flutter:

- `UNAUTHORIZED` → `401`
- `FORBIDDEN` → `403`
- `VALIDATION_ERROR` → `400`
- `NO_CURRENT_SESSION` → `404`
- `GRACE_EXPIRED` → `409`
- `IDEMPOTENCY_CONFLICT` → `409`
- `PAYMENT_FAILED` → `422`
- `VEHICLE_ALREADY_EXISTS` → `409`
- `invalid_credentials` → `401`
- `invalid_refresh` → `401`
- `token_expired` → `401`
- `token_invalid` → `401`

Error shape:

```json
{
  "success": false,
  "code": "GRACE_EXPIRED",
  "errorCode": "GRACE_EXPIRED",
  "message": "انتهت فترة السماح.",
  "correlationId": "uuid"
}
```

---

## Test users

Demo mobile/web users (script `Database/029_DemoMobileUsers.sql`, password copied from current admin hash):

```txt
citizen1  / admin / Citizen
visitor1  / admin / Visitor
employee1 / admin / Employee
```

Staff (seeded by API IdentitySeeder):

```txt
admin   / admin / Admin
admin1  / admin / Admin, buildingId = 1
```

Signup still creates a **Citizen** only. Visitor/Employee are demo roles for client testing.

Rate limit: 10 login/refresh calls per minute per IP. If you get `429`, wait one minute.

---

## Final Notes

- canonical login path = `/api/v1/auth/login`
- canonical hub path = `/hubs/parking`
- `dev-login` and `/hubs/live` are compatibility aliases
- live base URL today = `http://nri.runasp.net` (HTTP)
- ids الحالية كلها `int`
- `buildingId` الحالي `int`
- العمل على الويب والـ Flutter يكون على هذا الملف أو على:
  - `docs/FLUTTER-WEB-README.md`
  - `docs/AUTHENTICATION.md`
  - `docs/SIGNALR-CONTRACT.md`
  - `docs/openapi-client.json`
  - `/swagger/v1/swagger.json` (may be disabled on later Production deploys)
