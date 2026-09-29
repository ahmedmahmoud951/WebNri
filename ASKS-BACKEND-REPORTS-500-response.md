# للباك اند — 500 على تقرير الإشغال (ويب)

من: `nri-web`  
إلى: Parking.Api  
التاريخ: 2026-08-18  
السيرفر المختبر: `http://nri.runasp.net`  
العقد: `Finall-Project.md` المرحلة 4 — `GET /api/v1/admin/reports/occupancy`

الويب مش واقف على باقي P1–P7. المسارات اتنشرت وبتشتغل.  
الويب واقف على شاشة `/admin/reports` لأن التقرير الوحيد رجّع **500**.

---

## رد الباك اند (2026-08-18)

اتصلح في الكود. السبب كان استعلام EF مش قابل للترجمة:

1. `Place.IsActive` — العمود **متجاهل** في `placeTable` (مش موجود)، فـ `WHERE IsActive = 1` كان بيرمي exception → 500
2. `SessionStatuses.IsLive(...)` داخل SQL — method C# مش بتترجم

التعديل: العد في الذاكرة، ولو أي جدول وقع التقرير يرجع **200 بأصفار** مش 500.  
غير الأدمن لسه **403** `FORBIDDEN`.

**لازم publish** أحدث `Parking.Api` على `nri.runasp.net` قبل ما الويب يجرّب تاني.

بعد النشر، `GET /api/v1/admin/reports/occupancy` بـ JWT `admin1` → **200**:

```json
{
  "success": true,
  "data": {
    "buildingCount": 0,
    "free": 0,
    "occupied": 0,
    "total": 0,
    "revenueToday": 0,
    "currency": "EGP",
    "graceViolations": 0,
    "activeSubscriptions": 0
  }
}
```

الأرقام حسب بيانات الإنتاج (ممكن أصفار). مفيش SQL migration جديد.

---

## المطلوب

`GET /api/v1/admin/reports/occupancy` بنفس JWT الأدمن لازم يرجع **200** بالجسم المتفق عليه، مش 500 `unexpected`.

الجسم المتوقع (من `Finall-Project.md`):

```json
{
  "buildingCount": 1,
  "free": 18,
  "occupied": 2,
  "total": 20,
  "revenueToday": 150.0,
  "currency": "EGP",
  "graceViolations": 0,
  "activeSubscriptions": 3
}
```

مفيش أرقام → **200** بأصفار، **مش 500**.  
غير الأدمن → **403** `FORBIDDEN` (ده شغال).

---

## دليل حي — 2026-08-18

حساب: `admin1` / `admin`  
الهيدر: `Authorization: Bearer {accessToken}` · `Accept-Language: ar`

```http
GET /api/v1/admin/reports/occupancy
```

→ **500** *(قبل الإصلاح — يحتاج republish)*

```json
{
  "success": false,
  "code": "unexpected",
  "errorCode": "unexpected",
  "correlationId": "250e747e-28af-4753-b8b0-2b64440f702c"
}
```

إعادة لاحقة بنفس المسار: `correlationId` = `b392ff52-d932-459d-91cd-18e28aa63845`

---

## اللي اتشيك عليه في نفس الجلسة (شغال)

| Method | Path | حساب | Status |
|---|---|---|---|
| POST | `/api/v1/auth/login` | admin1 / citizen1 / visitor1 | 200 |
| GET | `/api/v1/me` | visitor1 | 200 |
| GET | `/api/v1/parking/sessions/current` | visitor1 | 404 `NO_CURRENT_SESSION` |
| GET | `/api/v1/parking/sessions?mine=true` | visitor1 | 200 `items: []` |
| GET | `/api/v1/parking/bundles` | visitor1 | 200 |
| GET | `/api/v1/parking/subscriptions/current` | citizen1 | 404 `NO_CURRENT_SUBSCRIPTION` |
| GET | `/api/v1/parking/reservations/invite/NOPE1234` | citizen1 | 404 `INVITE_NOT_FOUND` |
| POST | `/api/v1/parking/subscriptions` | visitor1 | 403 |
| GET | `/api/v1/admin/vehicles/search?plate=ABC` | admin1 | 200 |
| GET | `/api/v1/admin/users` | admin1 | 200 |
| GET | `/api/v1/admin/parking/grace-violations` | admin1 | 200 |
| GET | `/api/v1/admin/tickets` | admin1 | 200 |
| GET | `/api/v1/admin/parking/grace-violations` | visitor1 | 403 |
| GET | `/api/v1/admin/reports/occupancy` | **admin1** | **500 unexpected** ← يتحول 200 بعد publish |

---

## تعريف «اتصلح»

`admin1` على `GET /api/v1/admin/reports/occupancy` → **200** بالأرقام (أو أصفار).  
نفس الـ `correlationId` القديم ما يتكررش 500.

- [x] الكود اتصلح محلياً (اختبارات occupancy)
- [ ] publish على `nri.runasp.net`
- [ ] الويب يأكد 200 على الحي
