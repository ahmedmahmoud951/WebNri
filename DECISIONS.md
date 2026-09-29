# قرارات مجمّدة — nri-web

عقود API المعتمدة: [`FINAL-END-POINT.md`](FINAL-END-POINT.md)  
تحديث اللوجين وSignalR (18 أغسطس 2026): [`README-FOR-FLUTTER-FRIEND.md`](README-FOR-FLUTTER-FRIEND.md) (رد المنصة الأخير: [`README-FOR-FLUTTER-FRIEND Last.md`](README-FOR-FLUTTER-FRIEND%20Last.md))  
نطاق المنتج: `SA-REPLY-TO-WEB.md` · [`SA-REPLY-TO-WEB-19-AUG.md`](SA-REPLY-TO-WEB-19-AUG.md) · `WEB-START-HERE.md`.  
قواعد العرض (MTI) اللي الويب يلتزم بيها: [`FROM-PROPOSAL.md`](FROM-PROPOSAL.md).

## ما اتطبق من رد المنصة (2026-08-18)

- Envelope: `{ success, data, code, message, correlationId }`
- Login: **`POST /api/v1/auth/login` فقط** — متستخدمش `dev-login`
- JSON: **`username` فقط** (مش `userName`) — تكرار الاسمين كان سبب الـ 500
- البروفايل من **`GET /api/v1/me`** — مفيش فك JWT يدوي
- `buildingId` رقم `int` من `/me` → نفس القيمة لـ `JoinBuilding`
- Hub: `/hubs/parking` + JWT `accessTokenFactory` و query `access_token`
- بعد الاتصال: `JoinAllowedGroups()` اختياري ثم `JoinBuilding(buildingId)`
- لو Join ممنوع: الاتصال يفضل مفتوح والإشغال REST
- أحداث PascalCase object واحد: `OccupancyUpdated` / `SessionUpdated` / `BarrierOpened`
- تجربة لايف: `POST /api/v1/realtime/demo?buildingId=1` مع body `{}`
- Origin: Vite proxy → **`http://nri.runasp.net`** (HTTP)
- IDs كلها `number` (`buildingId`, `zoneId`, `sessionId`, ticket/payment ids)
- الأدوار من المنصة PascalCase (`Citizen`, `Admin`) — الويب يطبّعها lowercase للـ UI
- العملة `EGP` على عقد المنصة (سييد). **العرض للعميل SAR** حسب SA 19 أغسطس.
- مفيش جلسة: `404` + `NO_CURRENT_SESSION` — مش logout
- التذاكر: `GET` يرد `{ items, page, pageSize, totalCount }` داخل `data`
- المركبات: `POST /me/vehicles` إضافة (مش استبدال القائمة)
- حد الدخول: 10 login/refresh في الدقيقة لكل IP → `429` `rate_limited`
- حسابات التجريب: `citizen1` / `visitor1` / `employee1` / `admin1` / `admin` — كلمة المرور **`admin`**

## فحص السيرفر الحي (بعد publish إصلاح `/me`)

- `POST /api/v1/auth/login` = 200 و `data.username`
- `GET /api/v1/me` = **200**، `buildingId` رقم
- `GET /api/v1/me/vehicles` = 200
- `GET /api/v1/tickets` = 200
- `GET /api/v1/parking/sessions/current` = **404** `NO_CURRENT_SESSION` (مش 401)
- `POST /api/v1/realtime/demo?buildingId=1` مع `{}` = 200

## ما مش هيتبني على الويب (حسب SA)

- شاشة Register / signup
- FCM / Web Push
- فتح حاجز
- دفع فاتورة الحي من `/payments` (ERP لاحقاً)
- موجة 2 قبل القبول: كتابة مستخدمين، ضبط grace من UI، IoT، Keycloak، توحيد الألوان

## قرارات SA 19 أغسطس 2026

اقرأ [`SA-REPLY-TO-WEB-19-AUG.md`](SA-REPLY-TO-WEB-19-AUG.md). الشاشات مجمّدة. موظف الويب يشتري/يحجز. الفاتورة عرض فقط. Safari مش شرط.

## فلو الزائر — مؤكّد 19 أغسطس 2026

اقرأ [`README-VISITOR-FLOW-RESPONSE.md`](README-VISITOR-FLOW-RESPONSE.md).

- الجلسة تُنشأ من **دخول السيارة** (LPR/البوابة) — لا من الويب/الموبايل/invite/reservation.
- الفلو: `Open → Pay → grace → receipt/QR exit`.
- invite = حجز ساكن/موظف فقط.
- الزائر: reservations **قراءة فقط** (403 على create/invite/cancel بعد deploy `ClientPortalPhases.cs`).

## Mock

`VITE_USE_MOCK=true` اختياري. كلمة المرور `admin`. نفس الأشكال الرقمية: `buildingId=1`, `zoneId=3`, `sessionId=88`.
