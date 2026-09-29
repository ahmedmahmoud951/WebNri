# README — تحديث الباك اند للموبايل

من: Parking.Api  
إلى: Flutter (`nri-mobile`)  
التاريخ: 2026-08-18  
السيرفر: `http://nri.runasp.net` — **HTTP مش HTTPS**

هذا الملف يلغي الاعتماد على `FINAL-END-POINT2` بالنسبة للوجين وSignalR.  
العقد الكامل لسه في `FINAL-END-POINT.md`. هنا آخر حاجة اتعملت عشان التطبيق يعدّي.

المصدر الأصلي لهذا التحديث: `README-FOR-FLUTTER-FRIEND Last.md`.

---

## هل تعدّلوا حاجة عندكم؟ (ويب + Flutter)

**اللوجين، Occupancy REST، ورابط الـ Hub زي ما هم.** نفس `Authorization: Bearer {accessToken}` على كل المسارات. مفيش توكن تاني لـ `/me`.

بعد ما الـ API الجديد يتنشر على `nri.runasp.net`:

1. **شيلوا الـ workaround** اللي بيقرأ البروفايل من JWT payload (`sub` / `role` / `buildingId`).
2. اعتمدوا **`GET /api/v1/me`** رسمي — نفس التوكن اللي بيشتغل على `/buildings`.
3. في JSON اسم اليوزر هو **`username`** فقط (مش `userName`). اقروا `data.username`.
4. **`data.buildingId` رقم `int`** (مش string). ده نفس الرقم لـ `JoinBuilding(buildingId)`.
5. **`GET /api/v1/parking/sessions/current`**: مفيش جلسة → **404** و `code = NO_CURRENT_SESSION`. ده مش logout. 401 بس لو التوكن مرفوض.
6. **`POST /api/v1/realtime/demo?buildingId=1`**: ابعتوا body `{}` و `Content-Type: application/json` (من غير body IIS بيرجع 411).

مسارات `/me` اللي المفروض تبقى 200 بنفس التوكن:

```http
GET  /api/v1/me
GET  /api/v1/auth/me
GET  /api/v1/me/vehicles
GET  /api/v1/tickets?page=1&pageSize=20
GET  /api/v1/parking/sessions/current
```

لو `/me` لسه 401 بعد الـ publish: اعملوا login جديد (توكن قديم ممكن يكون اتعمله cache) وابعتوا `correlationId`.

**مش مطلوب:** تغيير مسار اللوجين، HTTPS، Cookie، أو فك التوكن يدويًا.

---

## 1) اللوجين — الـ 500 اتصلح

سبب الـ 500 على **كل** العملاء (Flutter / Web / WPF): رد اللوجين كان فيه خاصيتين JSON بنفس الاسم (`username` / `userName`) فالـ API كان بيرمي exception بعد ما الباسورد يتأكد. باسورد غلط كان بيرجع 401 عادي.

بعد الـ publish: نفس الطلب تحت لازم **200** وفيه `data.accessToken` و `data.username` (حقل واحد).

```http
POST http://nri.runasp.net/api/v1/auth/login
Content-Type: application/json
```

```json
{"username":"visitor1","password":"admin"}
```

نفس الجسم لـ:

| username | password | role |
|---|---|---|
| `visitor1` | `admin` | Visitor |
| `citizen1` | `admin` | Citizen |
| `employee1` | `admin` | Employee |
| `admin1` | `admin` | Admin (`buildingId = 1`) |
| `admin` | `admin` | Admin |

اقرأ التوكن من `data.accessToken` (و `data.refreshToken` لو هتعمل refresh).

باسورد غلط → **401** `invalid_credentials` (ده سلوك صحيح).

**ممنوع:** `POST /api/v1/auth/dev-login` على السيرفر الحي (Production هيرجع 404). المسار الوحيد: `/api/v1/auth/login`.

بعد اللوجين:

```http
GET http://nri.runasp.net/api/v1/me
Authorization: Bearer {accessToken}
```

`buildingId` اللي راجع من `/me` هو نفس الرقم اللي هتبعتوه لـ `JoinBuilding`.

---

## 2) SignalR — الإشغال والجلسة لايف

### اتصال

```txt
Hub URL = http://nri.runasp.net/hubs/parking
JWT     = accessTokenFactory  +  query access_token
```

`Authorization: Bearer` كمان مقبول.

بعد الاتصال (الترتيب ده تمام):

```txt
JoinAllowedGroups()          ← اختياري (السيرفر بيعمل join عند OnConnected)
JoinBuilding(<buildingId>)   ← int من GET /me  — مثال JoinBuilding(1)
```

الاسم الفعلي على الهب: **`JoinBuilding`** (مش `JoinArea` / مش `JoinBuildingAsync`).

لو المبنى مش مسموح أو مش موجود:

```txt
forbidden: Realtime group is not available.
```

الاتصال يفضل مفتوح. الإشغال ساعتها REST بس لحد ما الـ join ينجح.

### الأحداث (PascalCase — object واحد JSON)

اسمعوا:

| Event | استخدام |
|---|---|
| `OccupancyUpdated` | تحديث `free` / `total` على شاشة الإشغال |
| `SessionUpdated` | حالة الجلسة / `graceUntil` / `amountDue` |
| `BarrierOpened` | استماع فقط — الموبايل **مش** بيفتح الحاجز |

مش arguments منفصلة. Payload واحد.

#### OccupancyUpdated

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

حقول زيادة زي `parkingId` تتجاهلوها.

#### SessionUpdated

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
  "parkingId": 5,
  "zoneId": 3,
  "buildingId": 1
}
```

`status` المتوقع بعد الدفع: `Paid`. لو مش واضح، اعملوا refresh لـ `GET /api/v1/parking/sessions/current`.

### إجابات صريحة

- `JoinBuilding` بياخد **نفس** `int` بتاع `/me.buildingId` (Area id). مش رقم تاني.
- `JoinAllowedGroups()` **مش إجباري** قبل `JoinBuilding`. الاتنين مع بعض برضو تمام.
- أسماء الأحداث: `OccupancyUpdated` / `SessionUpdated` / `BarrierOpened` — PascalCase.
- الحدث = **JSON object واحد**.

---

## 3) حدث تجريبي وأنتم فاتحين التطبيق

بعد Login + connect + `JoinBuilding(1)`:

```http
POST http://nri.runasp.net/api/v1/realtime/demo?buildingId=1
Authorization: Bearer {accessToken}
Content-Type: application/json

{}
```

السيرفر ينشر `OccupancyUpdated` و `SessionUpdated` على مجموعة `building:1`.  
الرد فيه نفس الجسم اللي اتنشر تحت `data.occupancyUpdated` و `data.sessionUpdated`.

ده للاختبار اليدوي. في التشغيل الحقيقي الأحداث بتيجي من تغيير إشغال / دفع جلسة.

---

## 4) Checklist سريع

- [ ] HTTP `nri.runasp.net` مش HTTPS
- [ ] `POST /api/v1/auth/login` → 200 و `data.accessToken`
- [ ] `GET /api/v1/me` → **200** و `data.username` + `data.buildingId` رقم (مش 401)
- [ ] اتشال workaround فك JWT؛ البروفايل من `/me`
- [ ] `GET /api/v1/parking/sessions/current` → 200 أو 404 `NO_CURRENT_SESSION` (مش 401)
- [ ] Hub `/hubs/parking` بالـ JWT
- [ ] `JoinBuilding(buildingId)`
- [ ] `POST /api/v1/realtime/demo?buildingId=1` مع `{}` → الحدثين يوصلوا للشاشة

لو اللوجين لسه 500 أو `/me` لسه 401: الـ API الجديد لسه متعملوش publish على السيرفر. ابعتوا `correlationId` من الرد.

---

## 5) مش مطلوب من الموبايل الأسبوع ده

- FCM / `PUT /api/v1/me/push-token`
- فتح حاجز من التطبيق
- MQTT / Rabbit / SQL
