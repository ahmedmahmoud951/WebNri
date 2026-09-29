# للباك اند — عطل JWT على مسارات الـ Pilot (ويب)

> **أرشيف — تم الرد والنشر.** العقد المحدّث: [`README-FOR-FLUTTER-FRIEND Last.md`](README-FOR-FLUTTER-FRIEND%20Last.md) (نسخة العمل: [`README-FOR-FLUTTER-FRIEND.md`](README-FOR-FLUTTER-FRIEND.md)).

الويب شال workaround فك JWT ورجع يعتمد `GET /api/v1/me`. فحص حي 2026-08-18 بعد الـ publish: `/me` 200، `sessions/current` 404 `NO_CURRENT_SESSION`، `tickets` 200، `realtime/demo` 200.

---

من: React web (`nri-web`)  
إلى: Parking.Api  
التاريخ: 2026-08-18  
السيرفر المختبر: `http://nri.runasp.net` (HTTP)  
العقد المعتمد: `FINAL-END-POINT.md` + `README-FOR-FLUTTER-FRIEND.md`

الويب مش واقف على لوجين جديد ولا على Occupancy REST.  
الويب واقف على إن **نفس الـ JWT اللي اللوجين بيصدره مش بيتقبل على `/me` والجلسة والدفع والتذاكر**.

---

## المطلوب (حاجة واحدة أساسية)

`Authorization: Bearer {accessToken}` من `POST /api/v1/auth/login` لازم يشتغل على **كل** مسارات `FINAL-END-POINT.md`، مش على المباني/الإشغال بس.

نفس التوكن، نفس الهيدر، نفس الـ audience (`Parking.Clients`) / issuer (`Parking.Api`).

لو المسارات دي بتستخدم Cookie / Identity scheme مختلف عن JWT Bearer، وحّدوا الـ scheme.

---

## دليل حي (visitor1 / admin) — 2026-08-18

### شغال

| Method | Path | Status |
|---|---|---|
| POST | `/api/v1/auth/login` | 200 + `data.accessToken` |
| POST | `/api/v1/auth/refresh` | 200 |
| POST | `/api/v1/auth/logout` | 204 |
| GET | `/api/v1/buildings` | 200 |
| GET | `/api/v1/buildings/1/occupancy` | 200 |
| GET | `/api/v1/buildings/1/occupancy/details` | 200 |
| GET | `/api/health` | Healthy |

باسورد غلط → 401 `invalid_credentials` (صح).

### واقف — نفس التوكن يرجع 401 `unauthenticated` / «يلزم تسجيل الدخول.»

| Method | Path | CorrelationId مثال |
|---|---|---|
| GET | `/api/v1/me` | `dc58889e7a4e4000aa77182b617d861f` |
| GET | `/api/v1/auth/me` | `5e0df9de67d14f6db71bff61792de643` |
| GET | `/api/parking/auth/me` | نفس السلوك |
| GET | `/api/v1/me/vehicles` | `88eb732a3b84429baa4a11897d7a830d` |
| POST | `/api/v1/me/vehicles` | `7a7a3be0f0ca4322b57e2de4b44ef009` |
| GET | `/api/v1/parking/sessions/current` | `5b48548770424a40a3e0f3bc613df88e` |
| GET | `/api/v1/parking/sessions/{id}` | `60eef632f2d44d569ed2e79eca5d6c7b` |
| GET | `/api/v1/tickets` | `57dd0ad3945c46369513ae0c29373d59` |
| POST | `/api/v1/tickets` | `b23583d643114081b7870f505d13eb6b` |
| POST | `/api/v1/payments/intents` | `daa2cd52580a49c8abffcc07354da57a` |
| POST | `/api/v1/realtime/demo?buildingId=1` | `ed304988b0584289bae927f54004d442` |

الهيدر المستخدم:

```http
Authorization: Bearer {accessToken}
Accept-Language: ar
X-Correlation-ID: <uuid>
```

JWT payload من لوجين ناجح (مختصر):

```json
{
  "sub": "5",
  "role": "Visitor",
  "username": "visitor1",
  "buildingId": "1",
  "iss": "Parking.Api",
  "aud": "Parking.Clients"
}
```

---

## العقد اللي الويب متوقعاه بعد الإصلاح

### 1) `GET /api/v1/me` → 200

لازم `buildingId` يكون **int** (مش string)، عشان `JoinBuilding(buildingId)`.

```json
{
  "success": true,
  "data": {
    "id": 5,
    "userId": 5,
    "userName": "visitor1",
    "displayName": "Demo Visitor",
    "role": "Visitor",
    "locale": "ar",
    "buildingId": 1,
    "vehicles": []
  }
}
```

نفس الجسم من `GET /api/v1/auth/me`.

### 2) مركبات

```http
GET  /api/v1/me/vehicles          → 200 + data[]
POST /api/v1/me/vehicles          → 200/201 ثم نفس اليوزر أو العربية
PUT  /api/v1/me/vehicles/{id}
DELETE /api/v1/me/vehicles/{id}
```

```json
{ "plate": "ABC1234", "make": "Toyota", "model": "Corolla" }
```

### 3) جلسة حالية

```http
GET /api/v1/parking/sessions/current
```

- فيه جلسة → 200 + `data.sessionId` (number)
- مفيش جلسة → **404** و `code = NO_CURRENT_SESSION`  
  **مش 401.** 401 معناها التوكن مرفوض، وده بيكسر شاشة الجلسة حتى لو مفيش عربية جوه.

### 4) دفع

```http
POST /api/v1/payments/intents
Idempotency-Key: <uuid>
```

```json
{ "sessionId": 88, "amount": 10, "currency": "EGP" }
```

```http
POST /api/v1/payments/intents/{id}/capture
Idempotency-Key: <uuid>
```

العملة: **EGP**.

### 5) تذاكر دعم

```http
GET  /api/v1/tickets?page=1&pageSize=20  → { items, page, pageSize, totalCount }
POST /api/v1/tickets
```

```json
{ "type": "other", "note": "..." }
```

`type`: `lost_ticket` | `barrier` | `other`.

### 6) حدث لايف للتجربة

```http
POST /api/v1/realtime/demo?buildingId=1
Authorization: Bearer {accessToken}
Content-Type: application/json

{}
```

- اقبلوا body فاضي `{}` (من غير body، IIS بيرجع **411 Length Required**).
- بعد `JoinBuilding(1)` انشروا `OccupancyUpdated` و `SessionUpdated` على `building:1`.

Hub زي ما هو متفق: `/hubs/parking` + `accessTokenFactory` + query `access_token`.

---

## مش مطلوب من الويب / متعملوش عشاننا

- Register / signup على الويب
- FCM / `PUT /api/v1/me/push-token`
- فتح حاجز من المتصفح
- `POST /api/v1/auth/dev-login` على السيرفر الحي
- MQTT / SQL من العميل

---

## تعريف «اتصلح»

من Postman أو curl، بعد لوجين `visitor1` / `admin`:

1. `GET /api/v1/me` → **200** و `data.buildingId` رقم
2. `GET /api/v1/parking/sessions/current` → **200** أو **404 `NO_CURRENT_SESSION`** — مش 401
3. `GET /api/v1/tickets?page=1&pageSize=20` → **200**
4. `POST /api/v1/realtime/demo?buildingId=1` مع `{}` → **200** ومش 401

بعد الثلاثة دول الويب يشيل الـ workaround (قراءة البروفايل من JWT) ويرجع يعتمد `/me` رسمي.
