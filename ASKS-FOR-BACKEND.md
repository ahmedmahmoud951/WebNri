# للباك اند — اللي الويب محتاجه من المنصة

> **أرشيف.** العقد المعتمد: [`FINAL-END-POINT.md`](FINAL-END-POINT.md) — ابنِ عليه، مش على الاستبيان ده.

من: مهندس React (`nri-web`)  
إلى: مهندس المنصة (`nri-platform`)  

**الحالة: تم الرد.**  
المصدر التنفيذي للـ REST/SignalR:

→ **`FINAL-END-POINT.md`** (نفس الفولدر)

الاستبيان تحت أرشيف. أي تعارض مع الشات القديم: الملف النهائي يكسب.

---

## متى محتاج إيه

| الأولوية | البند | قبل |
|---|---|---|
| أسبوع 2 | دخول + JWT + `GET /me` + occupancy + CORS/proxy + swagger | نهاية أسبوع 1 عندك |
| أسبوع 2 | يوزر `admin` لشاشة `/admin/occupancy` | مع أول REST حقيقي |
| أسبوع 3 | SignalR من المتصفح + session DTO | نهاية أسبوع 2 |
| أسبوع 4 | دفع + تذاكر | نهاية أسبوع 3 |

أسبوع 1 عند الويب **مش واقف** على الرد.

**مفيش FCM / Web Push في الـ Pilot على الويب.**

---

## 1) التشغيل المحلي + CORS

الويب (Vite) هيستخدم proxy في التطوير:

```
المتصفح → /api و /hubs → http://localhost:5080
```

- [ ] Base URL المحلي: `http://localhost:5080`
- [ ] Swagger: `http://localhost:5080/swagger`
- [ ] SignalR: `http://localhost:5080/hubs/live`
- [ ] `/health` شغال من غير JWT

لو البورت مختلف:

```
API_BASE =
SWAGGER =
HUB =
```

### CORS (مهم للويب — الموبايل مش محتاجه)

محلياً Vite proxy يكفي. للتجربة المباشرة من المتصفح أو بعد النشر:

- [ ] أصل التطوير المسموح: `http://localhost:5173` (منفذ Vite الافتراضي)
- [ ] أصل تاني: ________________
- [ ] Staging/Pilot origin لسه مش متعيّن — هيتضاف لاحقاً

Credentials / SignalR من المتصفح:

- [ ] CORS يسمح بـ `Authorization` + WebSockets على `/hubs/live`
- [ ] ملاحظات:

```
```

---

## 2) يوزر أدمن (خاص بالويب)

الموبايل ما عندوش دور `admin`. الويب عنده `/admin/occupancy` — لو `role !== admin` يتحوّل Home.

جدول الموبايل الحالي: `visitor1` / `citizen1` / `employee1`.

المقترح إضافة:

| username | password | role | buildingId |
|---|---|---|---|
| `admin1` | | admin | B-01 |

- [ ] هنوفّر `admin1` (أو يوزر بنفس الدور)
- [ ] الاسم الفعلي / الباسورد:

```
username =
password =
role   = admin
```

`GET /me` للأدمن لازم يرجع `role: "admin"` و`buildingId` (Pilot `B-01` يكفي للوحة).

- [ ] موافق
- [ ] أدمن من غير `buildingId` — الويب يعرض إيه؟ ________________

---

## 3) الدخول + JWT (نفس الموبايل)

```
POST /api/v1/auth/dev-login
{ "username": "visitor1", "password": "Pass123!" }
→ { "accessToken": "<jwt>", "expiresIn": 3600 }
```

- [ ] موافق على المسار
- [ ] المسار الحقيقي: ________________

### Claims الويب هيقرأها

| claim | استخدام |
|---|---|
| `sub` | userId |
| `role` أو `roles` | `visitor` / `citizen` / `employee` / **`admin`** |
| `buildingId` | Pilot `B-01` |
| `preferred_username` أو `name` | fallback للاسم |

- [ ] claim الدور اسمه `role` (مفرد)
- [ ] `roles` (مصفوفة) — الويب هياخد أول قيمة / يدور على `admin`
- [ ] payload مثال:

```json
{ }
```

الويب **مش** هيبني شاشات لـ `building-op` / `cashier`. لو التوكن بالأدوار دي:

- [ ] `GET /me` يرجع الدور كما هو — الويب يعاملهم زي visitor (نفس الشاشات، من غير لوحة أدمن)
- [ ] غير ذلك: ________________

---

## 4) هيدرز

```
Authorization: Bearer <jwt>
Accept-Language: ar | en
Idempotency-Key: <uuid>     // POST الدفع فقط في الـ Pilot
```

- [ ] موافق
- [ ] هيدر إضافي من المتصفح: ________________

خطأ موحّد:

```json
{ "code": "GRACE_EXPIRED", "message": "...", "correlationId": "uuid" }
```

`message` حسب `Accept-Language`. `code` إنجليزي ثابت.

- [ ] موافق

---

## 5) `GET /api/v1/me`

المقترح (نفس الموبايل + `unitId` اختياري للساكن):

```json
{
  "userId": "u-001",
  "displayName": "زائر تجريبي",
  "role": "visitor",
  "locale": "ar",
  "buildingId": "B-01",
  "unitId": null,
  "vehicles": [
    { "plate": "ABC1234", "make": "Toyota" }
  ]
}
```

- [ ] موافق
- [ ] `unitId` موجود للساكن فقط
- [ ] JSON النهائي:

```json
{ }
```

اللغة على الويب **محلية** في الـ Pilot (مش PUT locale). هيدر `Accept-Language` يكفي.

- [ ] موافق

---

## 6) `PUT /api/v1/me/vehicles`

```json
{ "plate": "ABC1234", "make": "optional" }
```

- [ ] يستبدل قائمة المركبات كلها
- [ ] يضيف مركبة
- الرد بعد النجاح:

```json
{ }
```

---

## 7) Occupancy

```
GET /api/v1/buildings/{buildingId}/occupancy
```

`buildingId` من `/me` — مش قائمة مباني. Pilot: `B-01`.

```json
{
  "buildingId": "B-01",
  "zones": [
    { "zoneId": "B-01-Z-A", "free": 18, "total": 20 }
  ]
}
```

- [ ] موافق كما هو
- [ ] اسم عرض للمنطقة (ar/en)؟ لو أيوه أضفه في JSON:

```json
{ }
```

أدمن: نفس الـ endpoint لمبنى `/me` ولا endpoint أوسع؟

- [ ] نفس `GET /buildings/{id}/occupancy`
- [ ] مسار أدمن: ________________

---

## 8) الجلسة

```
GET /api/v1/parking/sessions/current
GET /api/v1/parking/sessions/{id}
```

لو مفيش جلسة:

- [ ] `404` + `code: NO_CURRENT_SESSION`
- [ ] `200` + `null`
- [ ] غير ذلك: ________________

(الويب هيتعامل مع الاتنين لحد الرد.)

جسم الجلسة المقترح:

```json
{
  "sessionId": "11111111-1111-1111-1111-111111111111",
  "status": "Open",
  "plate": "ABC1234",
  "buildingId": "B-01",
  "gateId": "IN-1",
  "startedAt": "2026-08-17T13:00:00Z",
  "graceUntil": null,
  "amountDue": 15.00,
  "currency": "SAR"
}
```

`status`: `Open` | `Paid` | `Closed`  
`graceUntil` بعد capture ≈ الآن + 20 دقيقة، وإلا `null`.

- [ ] موافق
- [ ] عدّل:

```json
{ }
```

---

## 9) SignalR من المتصفح

- Hub: `{origin}/hubs/live`
- بعد الاتصال: `JoinBuilding(buildingId)` من `/me`
- أحداث: `OccupancyUpdated` · `SessionUpdated` · `BarrierOpened`

الويب **مش هيبعت** أمر فتح حاجز. `BarrierOpened` = toast فقط.

### تمرير JWT من Chrome/Edge

- [ ] `accessTokenFactory` → query `access_token` (الافتراضي عندنا)
- [ ] هيدر `Authorization` فقط
- [ ] الاتنين

هل `JoinBuilding` يرجع خطأ لو التوكن مالوش المبنى؟ الشكل:

```
```

Reconnect: الويب هيعرض بانر قطع. مفيش حاجة مطلوبة منك غير إن الهب يسمح بإعادة `JoinBuilding` بعد reconnect.

- [ ] موافق

---

## 10) أكواد الخطأ (`code` إنجليزي)

الويب يعرض `message` ويتصرف على `code`.

| code | امتى | HTTP المقترح |
|---|---|---|
| `GRACE_EXPIRED` | خروج بعد انتهاء السماح | 409 ؟ |
| `NO_CURRENT_SESSION` | مفيش جلسة | 404 ؟ |
| `UNAUTHORIZED` | توكن ناقص/باطل | 401 |
| `FORBIDDEN` | مبنى/مورد/لوحة أدمن مش مسموح | 403 |
| `VALIDATION_ERROR` | body غلط | 400 |
| `IDEMPOTENCY_CONFLICT` | نفس المفتاح عملية مختلفة | 409 ؟ |
| `PAYMENT_FAILED` | capture فشل | 422 ؟ |

- [ ] القائمة كافية — صحّح HTTP
- [ ] أضف/احذف:

```
```

401 → الويب يمسح التوكن ويحوّل `/login`.

---

## 11) الدفع التجريبي

```
POST /api/v1/payments/intents
Idempotency-Key: <uuid>
{ "sessionId": "...", "amount": 15.00, "currency": "SAR" }

POST /api/v1/payments/intents/{id}/capture
Idempotency-Key: <نفس المفتاح>
```

Intent:

```json
{
  "id": "pi-001",
  "sessionId": "11111111-1111-1111-1111-111111111111",
  "amount": 15.00,
  "currency": "SAR",
  "status": "RequiresCapture"
}
```

Capture:

```json
{
  "id": "pi-001",
  "status": "Captured",
  "sessionId": "11111111-1111-1111-1111-111111111111",
  "graceUntil": "2026-08-17T13:25:00Z"
}
```

نفس المفتاح مرتين = نفس النتيجة (مش دفعتين).

- [ ] موافق
- [ ] JSON النهائي:

```json
{ }
```

---

## 12) التذاكر

```
POST /api/v1/tickets
{ "type": "lost_ticket" | "barrier" | "other", "note": "..." }

GET /api/v1/tickets
```

عنصر:

```json
{
  "id": "t-001",
  "type": "lost_ticket",
  "note": "...",
  "status": "Open",
  "createdAt": "2026-08-17T13:10:00Z"
}
```

`GET` يردّ إيه؟

- [ ] مصفوفة مباشرة: `[ ... ]`
- [ ] `{ "items": [ ... ] }`

(الويب هيتعامل مع الاتنين لحد الرد.)

`status`: `Open` | `Closed`  
POST يرجع التذكرة؟ `201`؟

- [ ] أيوه `201` + الجسم
- [ ] لأ — يرجع: ________________

---

## 13) تسليم واحد يكفي يفتح أسبوع 2 للويب

1. `GET /health`
2. `POST /api/v1/auth/dev-login` → JWT
3. `GET /api/v1/me` (وفيه يوزر `admin`)
4. `GET /api/v1/buildings/B-01/occupancy`
5. `/swagger`
6. CORS أو تأكيد إن `localhost:5173` → proxy كافٍ للتطوير
7. SignalR `JoinBuilding` من المتصفح

OpenAPI (`swagger.json`) لو تصدّره — الويب يطابق الأنواع عليه.

---

## رد سريع

اكتب تحت أي انحراف، أو «موافق على الكل ما عدا البند X».

```
تاريخ الرد:
الاسم:
ملاحظات:
```
