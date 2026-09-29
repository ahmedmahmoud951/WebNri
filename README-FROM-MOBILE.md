# مقارنة الموبايل × الويب

نسخة للويب من `nri-mobile/README-FOR-WEB.md`.  
ريدمي البوابة عند الموبايل: `nri-mobile/docs/README-from-web.md`.

المنصة واحدة. الويب = بوابة الحي + أدمن. الموبايل = المواطن على الجيب.  
السيرفر: `http://nri.runasp.net`  
حسابات: `visitor1` / `citizen1` / `employee1` / `admin1` — الباسورد `admin`.

---

## كان على الموبايل — اتبنى على الويب (19 أغسطس)

نفس الـ API — من غير endpoints جديدة.

| الخاصية | مسار الويب | API | حالة الويب |
|---|---|---|---|
| بطاقة QR | `/pass` | `GET /api/v1/me/pass` | يرسم `data.payload`. `404` = شاشة فارغة. لا يفتح الحاجز |
| اشتراكي الحالي (قراءة) | `/subscriptions` | `GET /api/v1/me/subscription` بجانب الشراء | يعرض `mainArea` · `slotLabel` · `optionalAreas` |
| شواحن EV | `/ev` | `GET /api/v1/buildings/{id}/ev-chargers` | `buildingId` من `/me` · `data.items[]` |
| فواتير الحي | `/billing` | `GET /api/v1/billing/invoices` | قائمة فقط — لا دفع |
| بلاغ نفايات / صيانة | `/tickets` | `type=waste` أو `maintenance` | في نموذج البلاغ + قائمة الأدمن |
| عدّاد السماح mm:ss | `/session` بعد الدفع | `graceUntil` + SignalR | موجود مسبقاً |
| إيصال جلسة | `/receipts/:id` | `GET /parking/sessions/{id}/receipt` | `404` لو مفيش دفع · `403` لو مش جلسته |

قوائم: نقرأ **`data.items`**.

---

## الموبايل مش هيعمل (ويب فقط) — متفقين

أدمن: occupancy / reports / grace / plates / tickets / users.  
دعوة `/invite`. شراء وتجديد باقات. كتالوج `bundles`. كاشير POS.

الموظف على الويب = ساكن موقف. على الموبايل = إشغال + وارد بلاغات (تشغيل ميداني).  
الويب **لم** يحوّل الموظف لمشغّل ميداني.

---

## تجربة

```http
POST /api/v1/auth/login   {"username":"citizen1","password":"admin"}
GET  /api/v1/me/pass
GET  /api/v1/buildings/1/ev-chargers
GET  /api/v1/billing/invoices
```

`citizen1` → pass 200 · `kind=subscription` · `plate=CIT2001`.  
`visitor1` قبل الدفع → pass **404**.
