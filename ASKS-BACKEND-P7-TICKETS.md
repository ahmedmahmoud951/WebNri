# طلبات الباك اند — المرحلة 7: طابور بلاغات الأدمن

من: `nri-web`  
إلى: Parking.Api  
التاريخ: 2026-08-18  
الشاشات الجاهزة: `/admin/tickets` (أدمن) و`/tickets` (المستخدم يرى `resolutionNote`)  
المصدر المنتج: تذكرة مفقودة وعطل حاجز = بلاغ؛ الحل عند **كاشير الموقف**. الويب لا يفتح الحاجز ولا يغلقه.

إنشاء البلاغ للمستخدم قائم: `POST /api/v1/tickets` في `FINAL-END-POINT.md`.

---

## 1) قائمة الأدمن

```http
GET /api/v1/admin/tickets?page=1&pageSize=50
Authorization: Bearer {accessToken}
Accept-Language: ar
```

صلاحية: `Admin`. غيره → **403**.

200 + `{ items, page, pageSize, totalCount }`. فاضي = `items: []`.

```json
{
  "id": 21,
  "userId": 5,
  "userName": "visitor1",
  "type": "lost_ticket",
  "note": "Lost paper ticket at gate 2",
  "status": "Open",
  "createdAt": "2026-08-18T08:00:00Z",
  "updatedAt": "2026-08-18T09:10:00Z",
  "resolutionNote": null
}
```

`type`: `lost_ticket` | `barrier` | `other`  
`status`: `Open` | `InProgress` | `Closed`

---

## 2) حقول إضافية على بلاغ المستخدم

نفس `GET /api/v1/tickets` القائم. أضيفوا إن وُجد:

- `status`: يسمح بـ `InProgress` بالإضافة إلى `Open` / `Closed`
- `resolutionNote`: نص رد الكاشير/التشغيل (اختياري)

تغيير الحالة يتم من تشغيل الموقف/الكاشير — **مش مطلوب PATCH من الويب في هذه المرحلة**. القائمة قراءة فقط.

---

## أكواد

| code | HTTP |
|---|---|
| `FORBIDDEN` | 403 |
| `UNAUTHORIZED` | 401 لو التوكن مرفوض فقط |

---

## تعريف «اتصلح»

1. `admin1` → 200 وقائمة (أو `items: []`)
2. `visitor1` على `/admin/tickets` → 403
3. `GET /tickets` للمستخدم يعيد `status` و`resolutionNote` إن وُجد

مش من الويب: فتح/إغلاق حاجز · POS · إنشاء مستخدم.
