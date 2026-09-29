# طلبات الباك اند — المرحلة 1: تاريخ المواقف والإيصالات

من: `nri-web`  
إلى: Parking.Api  
التاريخ: 2026-08-18  
الشاشة الجاهزة: `/receipts`

الويب يعرض التاريخ الآن. لو المسار مش موجود يستخدم مخزناً محلياً. بعد تنفيذ الملف ده الشاشة تقرأ من المنصة.

JWT: نفس `Authorization: Bearer` من `POST /api/v1/auth/login`. **مش 401** لو مفيش جلسات — 401 معناها التوكن مرفوض.

---

## المسارات

### 1) تاريخ جلسات المستخدم

```http
GET /api/v1/parking/sessions?mine=true&page=1&pageSize=50
Authorization: Bearer {accessToken}
Accept-Language: ar
```

- 200 + `{ success, data: { items: [...], page, pageSize, totalCount } }`
- مفيش جلسات: **200** و `items: []` — **مش 404**

عنصر:

```json
{
  "sessionId": 88,
  "status": "Closed",
  "plate": "ABC1234",
  "buildingId": 1,
  "gateId": 2,
  "startedAt": "2026-08-17T13:00:00Z",
  "endedAt": "2026-08-17T15:10:00Z",
  "amount": 15.0,
  "currency": "EGP",
  "paidAt": "2026-08-17T15:05:00Z",
  "graceUntil": "2026-08-17T15:25:00Z"
}
```

`status`: `Open` | `Paid` | `Closed`

### 2) إيصالات الدفع (اختياري لو الجلسات فيها المبلغ)

```http
GET /api/v1/payments?mine=true&page=1&pageSize=50
```

نفس شكل العنصر تقريباً: `sessionId`, `amount`, `currency`, `paidAt`, `plate`, `graceUntil`.

---

## تعريف «اتصلح»

1. بعد لوجين `visitor1`: `GET /api/v1/parking/sessions?mine=true` → **200** (حتى لو فاضي)
2. بعد capture جلسة: العنصر يظهر في القائمة بالمبلغ و`paidAt`
3. التوكن الصالح لا يرجع 401 على المسار ده

ملف لاحق: `ASKS-BACKEND-P2-SUBSCRIPTIONS.md`
