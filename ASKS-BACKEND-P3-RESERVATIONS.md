# طلبات الباك اند — المرحلة 3: الحجز ودعوة الزائر

من: `nri-web`  
إلى: Parking.Api  
التاريخ: 2026-08-18  
الشاشة الجاهزة: `/reservations`  
المصدر المنتج: عرض MTI — حجز سلوت لمدة محددة + دعوة زائر من ساكن/موظف.

الويب لا يفتح الحاجز. الحجز يُتحقق عند الدخول (QR/LPR) عند المورد.

---

## المسارات

### 1) قائمة حجوزاتي

```http
GET /api/v1/parking/reservations?page=1&pageSize=50
Authorization: Bearer {accessToken}
Accept-Language: ar
```

200 + `{ items, page, pageSize, totalCount }`. فاضي = `items: []`.

```json
{
  "id": 44,
  "buildingId": 1,
  "zoneId": 3,
  "plate": "ABC1234",
  "startsAt": "2026-08-20T10:00:00Z",
  "endsAt": "2026-08-20T14:00:00Z",
  "status": "Booked",
  "guestName": null,
  "guestPhone": null,
  "inviteCode": null
}
```

`status`: `Booked` | `Cancelled` | `Used` | `Expired`

### 2) إنشاء حجز

```http
POST /api/v1/parking/reservations
Idempotency-Key: <uuid>
```

```json
{
  "buildingId": 1,
  "zoneId": 3,
  "plate": "ABC1234",
  "startsAt": "2026-08-20T10:00:00Z",
  "endsAt": "2026-08-20T14:00:00Z"
}
```

→ 201 + الجسم. صلاحية: `Citizen` / `Employee`. تعارض الوقت → 409 `RESERVATION_CONFLICT`.

### 3) إلغاء

```http
DELETE /api/v1/parking/reservations/{id}
```

→ 204. يحوّل `status` إلى `Cancelled`.

### 4) دعوة زائر

```http
POST /api/v1/parking/reservations/{id}/invite
```

```json
{
  "guestName": "أحمد علي",
  "guestPhone": "05xxxxxxxx",
  "plate": "XYZ9876"
}
```

→ 200 + الجسم مع `inviteCode` (نص قصير) و`guestName`. اللوحة اختيارية؛ إن وُجدت تُربط بالحجز لـ LPR.

الزائر المدعو يرى الحجز في `GET /reservations` بحسابه لما المنصة تربط الدعوة (Pilot: يكفي ظهور الدعوة عند صاحب الحجز).

---

## أكواد

| code | HTTP |
|---|---|
| `RESERVATION_CONFLICT` | 409 |
| `RESERVATION_NOT_FOUND` | 404 |
| `FORBIDDEN` | 403 |
| `VALIDATION_ERROR` | 400 لو `endsAt` قبل `startsAt` |

---

## تعريف «اتصلح»

1. `citizen1` ينشئ حجز → 201
2. القائمة ترجّع الحجز
3. دعوة زائر ترجع `inviteCode`
4. DELETE يلغي بدون 401

التالي: `ASKS-BACKEND-P4-ADMIN.md`
