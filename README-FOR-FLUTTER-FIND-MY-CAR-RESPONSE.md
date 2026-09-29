# رد الباك اند — تم حل مشكلة صلاحية «أين عربيتي» للزائر واللوحات العربية (200 OK)

**إلى:** مطور Flutter (`nri-mobile`)  
**من:** فريق الباك اند (`Parking.Api`)  
**التاريخ:** 2026-08-26  
**المرجع:** `ASKS-FOR-BACKEND-FIND-CAR-VISITOR-403.md`

---

## 🟢 ملخص ما تم تنفيذه في الباك اند (Changelog & Fixes)

1. **السماح لدور الزائر (`Visitor`) بالاستعلام عن سياراته:**
   - تم تفعيل التحقق من الملكية لجميع الأدوار غير الإدارية (`Visitor`, `Citizen`, `Employee`) بدلاً من قصرها على أدوار محددة.

2. **التحقق الشامل من ملكية اللوحة (`Ownership Validation`):**
   - يتم الآن فحص سيارات المستخدم المسجلة في حسابه (`Vehicles` / `VehiclePlates`) التابعة لـ `UserId`.
   - يتم دعم تطبيع ومطابقة جميع أشكال اللوحات (عربي وإنجليزي):
     - اللوحة الأصلية بمسافات: `"بلد 475"`
     - اللوحة المطبّعة: `"بلد475"`
     - الحروف المفصولة: `"ب ل د 4 7 5"`
     - الحروف المرمزة بـ `+`: `"بلد+475"` أو `%D8%A8%D9%84%D8%AF+475`
     - الأرقام العربية والمشرقية (٠-٩ و 0-9).
   - يتم أيضاً فحص الجلسات المفتوحة والحالية المرتبطة بالمستخدم أو سياراته.

3. **إرجاع `200 OK` مع `found: false` عند عدم وجود جلسة ركن نشطة:**
   - إذا كانت اللوحة مملوكة للمستخدم ولكن السيارة غير متواجدة حالياً في الموقف (لا توجد جلسة نشطة أو تتبع حساسات)، يرجع السيرفر كود **`200 OK`** مع:
     ```json
     {
       "success": true,
       "data": {
         "found": false,
         "isCurrent": false,
         "plate": "بلد 475",
         "message": "السيارة غير متواجدة في الموقف حالياً."
       },
       "message": null,
       "code": null,
       "errorCode": null,
       "correlationId": "..."
     }
     ```
   - كود **`403 Forbidden`** يرجع **فقط** إذا حاول المستخدم الاستعلام عن لوحة **غير مملوكة له** وليست مسجلة في حسابه.

---

## 📡 عقد الـ API المعتمد لشاشة «أين عربيتي»

### 1. الطلب (Request)
```http
GET /api/parking/vehicle-location/find?plate=%D8%A8%D9%84%D8%AF+475
Authorization: Bearer <JWT_TOKEN>
Accept: application/json
```

---

### 2. سيناريوهات الاستجابة (Response Scenarios)

#### أ) السيارة مملوكة للمستخدم وراكنة حالياً في الموقف (`Found: true`, `IsCurrent: true`):
```json
{
  "success": true,
  "data": {
    "found": true,
    "isCurrent": true,
    "vehicleId": 14,
    "plate": "بلد 475",
    "sessionId": 105,
    "areaId": 1,
    "areaName": "Building 1",
    "zoneId": 1,
    "zoneName": "Zone A",
    "parkingLotId": 1,
    "parkingLotName": "Main Parking",
    "floorId": 1,
    "laneId": 2,
    "laneName": "LANE-DEMO-A1",
    "placeId": 5,
    "placeName": "A-005",
    "indoorX": -6.0,
    "indoorY": 0.0,
    "indoorZ": 8.5,
    "locationType": "ExactPlace",
    "source": "LPR",
    "confidence": 98.5,
    "locationAccuracy": "Exact",
    "capturedAt": "2026-08-26T09:15:00Z",
    "message": "تم تحديد موقع السيارة.",
    "route": { ... }
  },
  "message": null,
  "code": null,
  "errorCode": null,
  "correlationId": "..."
}
```

#### ب) السيارة مملوكة للمستخدم ولكن غير راكنة حالياً بالموقف (`Found: false`, `IsCurrent: false`):
```json
{
  "success": true,
  "data": {
    "found": false,
    "isCurrent": false,
    "plate": "بلد 475",
    "message": "السيارة غير متواجدة في الموقف حالياً."
  },
  "message": null,
  "code": null,
  "errorCode": null,
  "correlationId": "..."
}
```

#### ج) المستخدم يستعلم عن لوحة لا يملكها (غير مسجلة في حسابه) (`403 Forbidden`):
```json
{
  "success": false,
  "message": "ليست لديك صلاحية لهذا الإجراء.",
  "errorCode": "forbidden",
  "code": "forbidden",
  "data": null,
  "correlationId": "..."
}
```

---

## 🎯 إرشادات لمطور Flutter

1. عند استدعاء `GET /api/parking/vehicle-location/find?plate=...`:
   - فحص `data.found`:
     - إذا كانت `true` ← عرض مكان السيارة والمسار التوجيهي (Navigation Route) وتفاصيل الموقف (`areaName`, `zoneName`, `placeName`).
     - إذا كانت `false` ← عرض رسالة هادئة للمستخدم: `"السيارة غير متواجدة في الموقف حالياً"` دون اعتبارها خطأ في الاتصال.
2. في حال استلام `403 Forbidden` ← إظهار تنبيه: `"هذه اللوحة غير مسجلة في حسابك"`.
