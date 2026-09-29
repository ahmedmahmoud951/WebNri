# README — فلو الزائر: التعديلات + الرد على طلبات الموبايل والباك اند

**التاريخ:** 2026-08-19  
**السيرفر:** `http://nri.runasp.net`  
**المرجع:** طلب تأكيد فلو الزائر (Visitor Session vs Invite vs Reservation)

---

## ملخص سريع

| الجهة | الطلب | الرد |
|-------|-------|------|
| **الموبايل** | تأكيد: لا invite، reservations قراءة فقط، دفع session مستقل | **✅ مؤكّد — قراركم صحيح** |
| **الباك اند** | 5 أسئلة عن مصدر الجلسة والفلو والاختبار | **✅ مؤكّد حرفياً — التفاصيل أدناه** |

---

## ما الذي اتعدّل في المشروع؟

### 1) كود — حجوزات الزائر قراءة فقط

**الملف:** `Parking.Application/Services/ClientPortalPhases.cs`

| قبل | بعد |
|-----|-----|
| الزائر ممنوع من `POST /reservations` و `POST /invite` | نفس الشيء |
| الزائر **كان يقدر** يلغي حجز `DELETE /reservations/{id}` | الزائر **ممنوع** — **403** `FORBIDDEN` |

**التعديل:** إضافة `EnsureCanPurchase()` في `CancelReservationAsync`.

**النتيجة للزائر (Visitor):**

| المسار | HTTP |
|--------|------|
| `GET /parking/reservations` | **200** — قراءة فقط |
| `POST /parking/reservations` | **403** |
| `POST /parking/reservations/{id}/invite` | **403** |
| `DELETE /parking/reservations/{id}` | **403** ← **جديد** |

> **يحتاج deploy** على `nri.runasp.net`.

---

### 2) توثيق جديد

| الملف | الجمهور | المحتوى |
|-------|---------|---------|
| `docs/README-BACKEND-VISITOR-FLOW-CONFIRMATION.md` | باك اند + ويب + موبايل | إجابات تفصيلية على الأسئلة الخمسة |
| `docs/README-FOR-FLUTTER-VISITOR-FLOW.md` | Flutter (`nri-mobile`) | دليل مختصر للموبايل |
| `docs/README-VISITOR-FLOW-RESPONSE.md` | الكل | هذا الملف — ملخص التعديلات والرد |

---

### 3) اختبارات جديدة

**الملف:** `Parking.Tests/ClientPortalPhasesTests.cs`

| الاختبار | ما يتحقق منه |
|----------|--------------|
| `Visitor_reservations_are_read_only_and_cannot_invite` | 403 على create / invite / cancel |
| `Visitor_current_session_is_read_from_plates_not_created_by_portal` | الجلسة تُقرأ من `/sessions/current` فقط |

```powershell
dotnet test Parking.Tests/Parking.Tests.csproj --filter "Visitor_reservations|Visitor_current_session"
```

---

## رد على طلب الموبايل

> **قراركم الحالي صحيح.**

### فلو الزائر الطبيعي

```
دخول السيارة (LPR/البوابة/المنصة)
  → GET /parking/sessions/current
  → POST /payments/intents
  → POST /payments/intents/{id}/capture
  → grace 20 دقيقة
  → GET /me/pass (kind=session) + GET /sessions/{id}/receipt
  → خروج خلال grace
```

### ما لا يحدث

- **لا** يتم إنشاء `visitor session` من الويب أو الموبايل أو شاشة الدعوة أو الحجز
- **لا** `invite` ولا `reservation action` بعد الدفع للزائر العادي
- **`invite flow`** يخص فقط: `citizen/employee → reservation → inviteCode → guest`

### ما يطبّقه الموبايل

- **لا** invite داخل تطبيق الزائر
- `reservations` → **GET فقط** (قراءة)
- دفع `session` → **مستقل** عن invite/reservation

---

## رد على طلب الباك اند (الأسئلة الخمسة)

### 1) `visitor current session` — من أين تتولّد؟

**نعم.** الجلسة تتولّد **فقط** من:

- **دخول السيارة** عبر LPR/ANPR (`LprEventProcessor` → `StartAsync`)
- أو **يدوياً** من مشغّل المنصة (WPF) — للتشغيل والاختبار

**لا** يوجد `POST /api/v1/parking/sessions` في Client API.  
الويب والموبايل **يقرآن فقط** من `GET /api/v1/parking/sessions/current`.

**لا** تحتاج `invite` ولا `reservation` قبل ظهور الجلسة.

---

### 2) الفلو الرسمي للزائر؟

**نعم:**

```
Open session → Pay → grace period → exit QR / receipt
```

بعد الدفع **لا** action إلزامي آخر غير:

- الإيصال (`GET /sessions/{id}/receipt`)
- QR الخروج (`GET /me/pass` → `kind=session`)
- متابعة السماح (`graceUntil`)
- إشعار FCM `grace_expiring` (تلقائي من الباك اند)

---

### 3) `invite` — متى؟

**نعم.** `invite` **فقط** لسيناريو:

```
resident/employee reservation → inviteCode for guest
```

**ليس** للزائر العادي الذي دخل الموقف وتكوّنت له `session` بالفعل.

| السيناريو | المسارات |
|-----------|----------|
| حجز + دعوة | `POST /reservations` → `POST /reservations/{id}/invite` → `GET /reservations/invite/{code}` |
| زائر عادي | `GET /sessions/current` → دفع → grace → QR |

---

### 4) اختبار `new visitor session` — دخول فعلي أم سيeed؟

**الخياران متاحان:**

| الطريقة | متى |
|---------|-----|
| **دخول فعلي** من البوابة/LPR | بيئة إنتاج / اختبار حي |
| **سيeed / باك اند** | تجربة بدون مرور فعلي ✅ |

**سيeedات التجربة** (على نفس قاعدة الـ API):

```text
Database/038_FlutterPublishDemoSeed.sql   ← visitor1 + جلسة Open
Database/044_WebDemoSeedFixes.sql         ← تجديد الجلسة + amount
```

```http
POST /api/v1/auth/login
{"username":"visitor1","password":"admin"}

GET /api/v1/parking/sessions/current
Authorization: Bearer {accessToken}
```

متوقع: **200** — `plate=VIS1001`, `status=Open`, `amountDue > 0`

> `amountDue` يُحسب ديناميكياً حسب مدة الوقوف. لإعادة ضبط المبلغ: أعد تشغيل `044_WebDemoSeedFixes.sql`.

---

### 5) زائر بدون دعوة — ماذا يرى؟

**نعم.** الطبيعي:

| المسار | الزائر بدون دعوة |
|--------|------------------|
| `GET /parking/sessions/current` | جلسة Open/Paid (إن دخل) |
| `GET /parking/reservations` | **200** — قراءة فقط (غالباً فارغ) |
| `POST /parking/reservations` | **403** |
| `GET /me/pass` | **404** قبل الدفع؛ **200** `kind=session` بعد الدفع |
| `GET /me/subscription` | **404** `NO_CURRENT_SUBSCRIPTION` |
| `GET /billing/invoices` | **200** — `items: []` |

---

## الفهم المشترك (ويب + باك اند + موبايل)

| القاعدة | التأكيد |
|---------|---------|
| `invite` منفصل عن `session payment` | ✅ |
| `session` تنشأ من حدث الدخول | ✅ |
| الزائر العادي يدفع ثم يخرج خلال `grace` | ✅ |
| الدعوة تخص الحجز فقط | ✅ |

---

## خطوات النشر

### ① قاعدة البيانات (إن لم تُشغَّل)

```text
038_FlutterPublishDemoSeed.sql
044_WebDemoSeedFixes.sql
045_GraceExpiringNotifiedAt.sql   ← إشعار grace_expiring (FCM)
```

### ② Deploy الكود

| الملف | السبب |
|-------|-------|
| `Parking.Application/Services/ClientPortalPhases.cs` | منع الزائر من cancel reservation |

### ③ اختبار بعد النشر

| الاختبار | الحساب | المتوقع |
|----------|--------|---------|
| `GET /parking/sessions/current` | `visitor1` / `admin` | **200** Open |
| `POST /parking/reservations` | `visitor1` | **403** |
| `DELETE /parking/reservations/{id}` | `visitor1` | **403** |
| `GET /parking/reservations/invite/NRI-DEMO-CIT1` | `citizen1` | **200** |
| بعد capture | `visitor1` | Paid + `graceUntil` + `/me/pass` 200 |

---

## حسابات التجربة

| username | password | role | الاستخدام |
|----------|----------|------|-----------|
| `visitor1` | `admin` | Visitor | جلسة + دفع |
| `citizen1` | `admin` | Citizen | حجز + invite `NRI-DEMO-CIT1` |
| `employee1` | `admin` | Employee | حجز + دعوة |
| `admin1` | `admin` | Admin | تقارير |

---

## مراجع الكود

| الملف | الدور |
|-------|-------|
| `Parking.Infrastructure/Lpr/LprEventProcessor.cs` | إنشاء الجلسة عند LPR |
| `Parking.Application/Services/ClientPortalService.cs` | `GetCurrentSessionAsync` |
| `Parking.Application/Services/ClientPortalPhases.cs` | قيود الزائر على reservations |
| `Database/038_FlutterPublishDemoSeed.sql` | سيeed visitor1 |
| `Database/044_WebDemoSeedFixes.sql` | تجديد الجلسة |

---

## ملفات للإرسال للفرق

| للفرقة | الملف |
|--------|-------|
| **الموبايل** | `docs/README-FOR-FLUTTER-VISITOR-FLOW.md` |
| **الباك اند / الويب** | `docs/README-BACKEND-VISITOR-FLOW-CONFIRMATION.md` |
| **الكل (ملخص)** | `docs/README-VISITOR-FLOW-RESPONSE.md` ← هذا الملف |
