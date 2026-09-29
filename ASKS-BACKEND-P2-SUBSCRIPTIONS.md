# طلبات الباك اند — المرحلة 2: الاشتراك والباقات

من: `nri-web`  
إلى: Parking.Api  
التاريخ: 2026-08-18  
الشاشة الجاهزة: `/subscriptions`  
المصدر المنتج: عرض MTI — City web portal كقناة اشتراك للساكن/الموظف.

الويب يعرض الباقات ويشتري/يجدّد. لو المسار مش منشور يُحفظ محلياً.

الأدوار: `Citizen` و `Employee` يشترون. `Visitor` يشوف الباقات بدون شراء. `Admin` يمكنه القراءة.

---

## المسارات

### 1) الباقات

```http
GET /api/v1/parking/bundles
Authorization: Bearer {accessToken}
Accept-Language: ar
```

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "شهري — موقف رئيسي مضمون",
        "period": "monthly",
        "price": 250.0,
        "currency": "EGP",
        "guaranteedSlot": true,
        "buildingId": 1
      }
    ]
  }
}
```

`period`: `monthly` | `quarterly` | `annual`  
`name` حسب `Accept-Language`.

### 2) اشتراكي الحالي

```http
GET /api/v1/parking/subscriptions/current
```

- فيه اشتراك ساري → 200 + الجسم
- مفيش → **404** و `code = NO_CURRENT_SUBSCRIPTION` (مش 401)

```json
{
  "id": 12,
  "bundleId": 1,
  "bundleName": "شهري — موقف رئيسي مضمون",
  "status": "Active",
  "plate": "RUH2941",
  "buildingId": 1,
  "startsAt": "2026-08-01T00:00:00Z",
  "endsAt": "2026-09-01T00:00:00Z",
  "price": 250.0,
  "currency": "EGP"
}
```

`status`: `Active` | `Expired` | `Cancelled`

### 3) شراء

```http
POST /api/v1/parking/subscriptions
Idempotency-Key: <uuid>
```

```json
{ "bundleId": 1, "plate": "RUH2941" }
```

→ 201 + نفس جسم الاشتراك. الدفع عبر منصة الدفع الحالية أو `amount` يُسجَّل على الاشتراك (Pilot: بدون بوابة بنك من المتصفح).

### 4) تجديد

```http
POST /api/v1/parking/subscriptions/{id}/renew
Idempotency-Key: <uuid>
```

يمدّ `endsAt` حسب `period` الباقة. → 200 + الجسم المحدَّث.

---

## أكواد

| code | HTTP |
|---|---|
| `NO_CURRENT_SUBSCRIPTION` | 404 |
| `BUNDLE_NOT_FOUND` | 404 |
| `FORBIDDEN` | 403 لو Visitor يشتري |
| `IDEMPOTENCY_CONFLICT` | 409 |

---

## تعريف «اتصلح»

1. `GET /bundles` → 200 وقائمة
2. `citizen1` يقدر `POST /subscriptions` → 201
3. `visitor1` على POST → 403
4. `GET /subscriptions/current` بعد الشراء → 200

التالي: `ASKS-BACKEND-P3-RESERVATIONS.md`
