# طلبات الباك اند — المرحلة 6: فحص كود دعوة الزائر

من: `nri-web`  
إلى: Parking.Api  
التاريخ: 2026-08-18  
الشاشة الجاهزة: `/invite`  
يكمل المرحلة 3: الساكن/الموظف يُنشئ دعوة (`inviteCode`) والزائر يتحقق من الكود في البوابة.

الويب **لا** يفتح الحاجز. الكود يُتحقق عند الدخول (QR/LPR) عند المورد. هذه الشاشة للعرض فقط.

---

## المسار

```http
GET /api/v1/parking/reservations/invite/{code}
Authorization: Bearer {accessToken}
Accept-Language: ar
```

`code` نص قصير من `POST /reservations/{id}/invite` (مثال `NRI-10012`). غير حسّاس لحالة الأحرف.

200 + جسم الحجز:

```json
{
  "id": 44,
  "buildingId": 1,
  "zoneId": 3,
  "plate": "XYZ9876",
  "startsAt": "2026-08-20T10:00:00Z",
  "endsAt": "2026-08-20T14:00:00Z",
  "status": "Booked",
  "guestName": "أحمد علي",
  "guestPhone": "05xxxxxxxx",
  "inviteCode": "NRI-10012"
}
```

`status`: `Booked` | `Cancelled` | `Used` | `Expired`

### من يقدر يقرأ؟

- صاحب الحجز
- الزائر المربوط بالدعوة (حساب أو رقم/لوحة إن وُجد)
- `Admin`

غير ذلك → **403**. كود غير موجود أو ملغى → **404** `INVITE_NOT_FOUND` (مش 401).

---

## أكواد

| code | HTTP |
|---|---|
| `INVITE_NOT_FOUND` | 404 |
| `FORBIDDEN` | 403 |
| `UNAUTHORIZED` | 401 لو التوكن مرفوض فقط |

---

## تعريف «اتصلح»

1. `citizen1` ينشئ دعوة → `inviteCode`
2. `GET .../invite/{code}` بنفس التوكن أو توكن الزائر المدعو → 200
3. كود غلط → 404 `INVITE_NOT_FOUND`
4. مش 401 على كود غلط

التالي: `ASKS-BACKEND-P7-TICKETS.md`
