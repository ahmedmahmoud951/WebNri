# من الويب → الباك اند (Parking.Api)

التاريخ: 19 أغسطس 2026  
من: `nri-web`  
إلى: فريق المنصة  
السيرفر المفحوص: `http://nri.runasp.net`

**تم الرد** في `README-WEB-BACKEND-FIXES.md`.  
السييد `044` اشتغل على `db64137`. **نشر الكود لسه ناقص** (عربي + توحيد `NO_CURRENT_SUBSCRIPTION` + صيغة الإشغال في الخدمة).

المسارات P1–P7 شغالة. لا نطلب endpoints جديدة.

---

## فحص حي بعد الرد (19 أغسطس، بعد الظهر)

| بندكم | على السيرفر الآن |
|---|---|
| 1 إشغال vs جلسة | **تم.** `visitor1` داخل + `GRACE-DEMO` داخل → occupancy `free: 0 / total: 2`، تقرير الأدمن `occupied: 2` |
| 2 حجز + كود | **تم.** `citizen1` حجز id=1، كود **`NRI-DEMO-CIT1`**. الحالة الحية `Confirmed` (مش `Booked`) — الويب هيطبّعها محجوز |
| 2 بحث لوحات | **تم.** `CIT` / `VIS` / `GRACE` ترجع نتائج |
| 2 مخالفات سماح | **تم.** صف `GRACE-DEMO` |
| 2 إيصال `{id}` | **لسه 404.** جلسات `Closed` 6/7/8 موجودة بـ `amount=35` و`amountPaid=0`. `GET /parking/sessions/6/receipt` = `Receipt was not found` |
| 3 مبلغ الزائر | **موضّح.** `amountDue` ديناميكي. الآن `40.00` لجلسة بدأت 08:44 UTC (مش 220). `/pay` يعرض الرقم الحي |
| 4 رسائل عربي | **لسه إنجليزي.** `employee1` + `Accept-Language: ar` → `There is no current subscription.` و`No digital pass is available.` — يحتاج deploy `ApiErrorCodes.cs` |
| 5 EV محطة | تأكيد. الويب يعرض محطة. لا تغيير |
| 6 كود الاشتراك | **لسه `NO_SUBSCRIPTION`.** يحتاج deploy `ClientPortalFlutter.cs`. الويب يقبل الكودين |

دعوة الزائر: المسار الشغال هو اللي عند الويب  
`GET /api/v1/parking/reservations/invite/NRI-DEMO-CIT1` = **200**.  
المسار المكتوب في جدول الاختبار عندكم `GET /parking/invite?code=` = 404.

Find My Car: سييد `044_FindMyCarDemoSeed` اتقال إنه اتشغّل. الحي: `GET /api/parking/vehicle-location/find?plate=VIS1001` (زائر، لوحة عنده، جلسة Open) → `200` `{ found: false, isCurrent: false }`. ملكية اللوحة 403 تمام.

---

## لسه ناخد منكم (بعد الـ deploy)

1. نشر الملفات الثلاثة اللي كتبتوها (`ApiErrorCodes` · `AdminPortalService` · `ClientPortalFlutter`).
2. إيصال حقيقي: سجل `Payment` مكتمل على جلسة `citizen1` عشان `GET /parking/sessions/{id}/receipt` يبقى 200 مش 404.
3. Find My Car: ربط موقع/مسار بجلسة `VIS1001` المفتوحة (أو لوحة ساكن داخلة) عشان `{ found: true }` في العرض.
4. (اختياري) وحّدوا حالة الحجز `Booked` vs `Confirmed` في العقد — الويب دلوقتي يترجم `Confirmed` → محجوز.

---

## نديكم

- البوابة مربوطة على نفس JWT و`/api/v1` عبر Vite proxy.
- 404 على `/me/pass` و`NO_CURRENT_SESSION` / `NO_SUBSCRIPTION` **لا** تسجّل خروج.
- العرض للعميل SAR حتى لو العقد EGP.
- الويب **لا** يفتح حاجز ولا يدفع فاتورة حي ولا يحصّل غرامة.

حسابات التجربة: `citizen1` / `visitor1` / `employee1` / `admin1`، الباسورد `admin`.
