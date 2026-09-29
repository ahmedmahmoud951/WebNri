# طلبات الباك اند — المرحلة 4: أدمن (بحث لوحة، تقارير، مستخدمون)

من: `nri-web`  
إلى: Parking.Api  
التاريخ: 2026-08-18  
الشاشات الجاهزة: `/admin/plates` · `/admin/reports` · `/admin/users`  
لوحة الإشغال `/admin/occupancy` شغالة على `GET /buildings` الحالي.

صلاحية: `Admin` (بحث اللوحة ممكن يُسمح لاحقاً لـ `building-op`). غيره → **403** مش 401.

---

## 1) بحث اللوحة

من العرض: البحث باللوحة عبر المباني (أمن / خدمة عملاء). دعم بحث جزئي.

```http
GET /api/v1/admin/vehicles/search?plate=ABC
Authorization: Bearer {accessToken}
Accept-Language: ar
```

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "plate": "ABC1234",
        "buildingId": 1,
        "buildingName": "Building 01",
        "zoneName": "Zone A",
        "status": "Parked",
        "startedAt": "2026-08-18T10:00:00Z",
        "sessionId": 88
      }
    ]
  }
}
```

`status`: `Parked` | `Exited` | `Unknown`  
مفيش نتيجة: 200 و `items: []`.

---

## 2) تقرير إشغال / إيراد مختصر

```http
GET /api/v1/admin/reports/occupancy
```

```json
{
  "buildingCount": 1,
  "free": 18,
  "occupied": 2,
  "total": 20,
  "revenueToday": 150.0,
  "currency": "EGP",
  "graceViolations": 0,
  "activeSubscriptions": 3
}
```

الويب حالياً يجمّع `/buildings` لو التقرير مش موجود. بعد النشر يُفضَّل هذا المسار الواحد.

---

## 3) قائمة مستخدمين (قراءة)

```http
GET /api/v1/admin/users?page=1&pageSize=50
```

```json
{
  "items": [
    {
      "userId": 5,
      "userName": "visitor1",
      "displayName": "Demo Visitor",
      "role": "Visitor",
      "buildingId": 1,
      "isActive": true
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalCount": 1
}
```

إنشاء مستخدم / تغيير دور: **مش مطلوب من الويب في هذه المرحلة**. القائمة تكفي.

---

## تعريف «اتصلح»

1. `admin1` على بحث `ABC` → 200
2. `visitor1` على نفس المسار → 403
3. تقرير الإشغال → 200 بأرقام
4. قائمة المستخدمين → 200

---

## مش من الويب / متعملوش عشان الشاشات دي

فتح حاجز · MQTT · SQL من العميل · POS/كيوسك · فيديو VMS
