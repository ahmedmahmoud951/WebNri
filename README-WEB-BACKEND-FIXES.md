# تعديلات الباك اند — ردّ على طلبات الويب

**التاريخ:** 19 أغسطس 2026  
**المرجع:** `docs/ASKS-FROM-WEB-TO-BACKEND.md`  
**السيرفر:** `http://nri.runasp.net`  
**قاعدة البيانات:** `db64137`

---

## ملخص التعديلات

### 1) إصلاح تناقض الإشغال مع الجلسة المفتوحة ✅

**ملف كود:** `Parking.Application/Services/AdminPortalService.cs`  
**ملف سييد:** `Database/044_WebDemoSeedFixes.sql`

- تقرير الإشغال `GET /admin/reports/occupancy` كان يعتمد فقط على `Place.IsEmpty` — جلسة مفتوحة بدون حساس ما كانتش تظهر.
- **الإصلاح في الكود:** `Occupied = max(عدد الأماكن المشغولة, عدد الجلسات الحية)`.
- **الإصلاح في السييد:** مكان فاضي في موقف visitor1 اتحوّل مشغول (`IsEmpty = 0`).
- **النتيجة بعد التشغيل:**
  - `GET /buildings/1/occupancy` → `free` ينقص 1
  - `GET /admin/reports/occupancy` → `occupied >= 1`

---

### 2) داتا ناقصة للتجربة ✅

**ملف سييد:** `Database/044_WebDemoSeedFixes.sql` (تم تشغيله على `db64137`)

| البند | ماذا أضيف | الـ Endpoint اللي اتأثر |
|---|---|---|
| **citizen1 — جلسة مدفوعة + إيصال** | جلسة `Closed` (id=6) بـ `Amount = 35 EGP` + سجل `Payment` مكتمل | `GET /parking/sessions/6/receipt` |
| **citizen1 — حجز Booked + inviteCode** | حجز `Booked` بكود دعوة **`NRI-DEMO-CIT1`** | `GET /parking/reservations` + `GET /parking/invite?code=NRI-DEMO-CIT1` |
| **admin1 — grace violation** | جلسة `Paid` + `GraceUntil` في الماضي (لوحة **`GRACE-DEMO`**) + دفعة مكتملة | `GET /admin/parking/grace-violations` |
| **admin1 — بحث لوحات** | لوحات `GRACE-DEMO` + `VIS1001` + `CIT2001` كلهم في `ParkingSessions` | `GET /admin/vehicles/search?plate=VIS` أو `CIT` أو `GRACE` |

---

### 3) مبلغ جلسة الزائر ✅

- السييد يثبّت `Amount = 35.00` على جلسة visitor1 المفتوحة.
- **ملاحظة مهمة:** الـ `amountDue` في `GET /parking/sessions/current` يُحسب **ديناميكياً** عبر `CalculateFeeAsync` بناءً على مدة الوقوف الفعلية. الرقم 220 EGP اللي ظهر للويب سببه إن الجلسة كانت مفتوحة من 18 أغسطس (وقوف طويل). بعد إعادة تشغيل السييد الجلسة بتتجدد بدخول من 3 ساعات فقط.
- **لو عايزين المبلغ يكون ثابت 35 في `/pay`** → لازم نعدّل `CalculateFeeAsync` أو نضيف pricing rule. حالياً السلوك صحيح (حساب تلقائي حسب المدة).

---

### 4) رسائل عربي على `Accept-Language: ar` ✅

**الملف:** `Parking.Contracts/Common/ApiErrorCodes.cs` → `ApiMessageCatalog.Resolve`

أضفنا ترجمة عربية لجميع الأكواد اللي كانت ناقصة وبترجع إنجليزي:

| الكود | الرسالة العربية |
|---|---|
| `NO_CURRENT_SUBSCRIPTION` / `NO_SUBSCRIPTION` | لا يوجد اشتراك حالي. |
| `NOT_FOUND` (= `No digital pass is available`) | العنصر المطلوب غير موجود. |
| `BUNDLE_NOT_FOUND` | الباقة غير موجودة. |
| `RESERVATION_CONFLICT` | يوجد حجز آخر يتعارض مع هذا الوقت. |
| `RESERVATION_NOT_FOUND` | الحجز غير موجود. |
| `INVITE_NOT_FOUND` | رمز الدعوة غير موجود. |
| `NO_FREE_SLOT` | لا توجد أماكن شاغرة في هذا المبنى. |
| `VEHICLE_REQUIRED` | لوحة السيارة مطلوبة. |

الميدل وير (`Middleware.cs`) بالفعل يستخدم `ApiMessageCatalog.Resolve` + `Accept-Language` header — الآن جميع الأكواد مغطاة بالعربي.

---

### 5) شكل شواحن EV (تأكيد — لا تغيير)

الشكل الحالي ثابت:
```json
{ "id": 1, "buildingId": 1, "label": "B-01 basement", "free": 2, "total": 4, "status": "online" }
```
لو هنتغير لشاحن فردي هنبلّغكم مسبقاً.

---

### 6) توحيد كود الاشتراك ✅

**الملف:** `Parking.Application/Services/ClientPortalFlutter.cs`

| قبل | بعد |
|---|---|
| `GET /me/subscription` → `NO_SUBSCRIPTION` | `NO_CURRENT_SUBSCRIPTION` |
| `GET /parking/subscriptions/current` → `NO_CURRENT_SUBSCRIPTION` | `NO_CURRENT_SUBSCRIPTION` |

الكود موحّد الآن — الويب يتعامل مع `NO_CURRENT_SUBSCRIPTION` فقط ويعرف إن المستخدم مالوش اشتراك (مش logout).

---

## ملفات معدّلة

| الملف | نوع التعديل | الحالة |
|---|---|---|
| `Database/044_WebDemoSeedFixes.sql` | **جديد** — سييد تجريبي للويب | ✅ تم تشغيله على db64137 |
| `Database/044_FindMyCarDemoSeed.sql` | **جديد** — سييد Find My Car (كاميرا + لين + locations + navigation) | ✅ تم تشغيله على db64137 |
| `Parking.Contracts/Common/ApiErrorCodes.cs` | ترجمة عربية لـ 8 أكواد خطأ ناقصة | ✅ يحتاج deploy |
| `Parking.Application/Services/AdminPortalService.cs` | إصلاح حساب الإشغال (max of places vs sessions) | ✅ يحتاج deploy |
| `Parking.Application/Services/ClientPortalFlutter.cs` | توحيد كود الاشتراك | ✅ يحتاج deploy |

---

## خطوات التنفيذ

### ① قاعدة البيانات (تم ✅)
```
-- على db64137:
-- 044_WebDemoSeedFixes.sql    ← تم
-- 044_FindMyCarDemoSeed.sql   ← تم
```

### ② نشر الكود (deploy)
أعد نشر الـ API بالملفات المعدّلة:
- `Parking.Contracts/Common/ApiErrorCodes.cs`
- `Parking.Application/Services/AdminPortalService.cs`
- `Parking.Application/Services/ClientPortalFlutter.cs`

### ③ اختبار بعد النشر

| الاختبار | المتوقع |
|---|---|
| `GET /buildings/1/occupancy` | `free` أقل من `total` بـ 1 على الأقل |
| `GET /admin/reports/occupancy` (admin1) | `occupied >= 1` |
| `GET /parking/sessions/current` (visitor1) | جلسة مفتوحة، `amountDue > 0` |
| `GET /parking/sessions/6/receipt` (citizen1) | إيصال بـ 35 EGP |
| `GET /parking/reservations` (citizen1) | حجز Booked واحد على الأقل |
| `GET /parking/invite?code=NRI-DEMO-CIT1` | بيانات الحجز |
| `GET /admin/parking/grace-violations` (admin1) | صف واحد على الأقل (GRACE-DEMO) |
| `GET /admin/vehicles/search?plate=CIT` (admin1) | نتائج CIT2001 |
| `GET /admin/vehicles/search?plate=VIS` (admin1) | نتائج VIS1001 |
| أي endpoint خطأ + `Accept-Language: ar` | رسالة عربية |
| `GET /me/subscription` (بدون اشتراك) | كود `NO_CURRENT_SUBSCRIPTION` + رسالة عربية |

---

## حسابات التجربة

| الحساب | الباسورد | الدور |
|---|---|---|
| `visitor1` | `admin` | زائر — جلسة مفتوحة + دفع |
| `citizen1` | `admin` | مقيم — اشتراك + إيصال + حجز |
| `employee1` | `admin` | موظف — فاتورة |
| `admin1` | `admin` | مدير — تقارير + بحث + مخالفات |
