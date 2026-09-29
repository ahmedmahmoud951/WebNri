# طلبات الباك اند — المرحلة 5: مخالفات فترة السماح

من: `nri-web`  
إلى: Parking.Api  
التاريخ: 2026-08-18  
الشاشة الجاهزة: `/admin/grace`  
المصدر المنتج: عرض MTI — بعد الدفع **20 دقيقة** للخروج؛ انتهت المهلة → رسوم إضافية عند **كاشير الموقف** (ليس من الويب).

الويب يعرض القائمة للأدمن، ويعرض المبلغ على جلسة المستخدم إن وُجد. **لا** يحصّل الغرامة ولا يفتح الحاجز.

---

## 1) قائمة المخالفات (أدمن)

```http
GET /api/v1/admin/parking/grace-violations?page=1&pageSize=50
Authorization: Bearer {accessToken}
Accept-Language: ar
```

صلاحية: `Admin` (لاحقاً `building-op` إن رغبت المنصة). غيره → **403**.

200 + `{ items, page, pageSize, totalCount }`. فاضي = `items: []` — **مش 404**.

```json
{
  "sessionId": 88,
  "plate": "ABC1234",
  "buildingId": 1,
  "buildingName": "Building 01",
  "gateId": 2,
  "paidAt": "2026-08-18T10:00:00Z",
  "graceUntil": "2026-08-18T10:20:00Z",
  "extraFee": 20.0,
  "currency": "EGP",
  "stillParked": true
}
```

تعريف الصف: جلسة `Paid` و`graceUntil < now` وما زالت المركبة داخل الموقف (`stillParked: true`) أو غرامة غير مسددة. مدة السماح من إعداد المنصة (افتراضي 20).

---

## 2) حقول على الجلسة الحالية

نفس `GET /api/v1/parking/sessions/current` القائم. أضيفوا عند انتهاء السماح:

```json
{
  "extraFee": 20.0,
  "extraFeeCurrency": "EGP"
}
```

مفيش مخالفة: احذفوا الحقل أو `null`. المستخدم يرى المبلغ ويتوجّه للكاشير — **مفيش** `POST` دفع غرامة من الويب.

---

## أكواد

| code | HTTP |
|---|---|
| `FORBIDDEN` | 403 |
| `UNAUTHORIZED` | 401 لو التوكن مرفوض فقط |

---

## تعريف «اتصلح»

1. `admin1` → 200 وقائمة (أو `items: []`)
2. `visitor1` → 403
3. جلسة منتهية السماح ترجّع `extraFee` على `/sessions/current`

التالي: `ASKS-BACKEND-P6-INVITE.md`
