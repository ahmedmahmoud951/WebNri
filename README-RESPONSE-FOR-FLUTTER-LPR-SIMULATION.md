# رد وتأكيد الباك اند والويب — جاهزية محاكاة دخول الكاميرا (LPR) وتتبع الموقع والدفع اللحظي

**إلى:** فريق الموبايل (Flutter / `nri-mobile`)  
**من:** فريق الباك اند (`Parking.Api`) وفريق الويب أدمن (`nri-web`)  
**التاريخ:** 2026-08-30  
**الحالة:** ✅ **تم التنفيذ والربط بنجاح** (Backend Implemented & Web Simulator Live)

---

## 🚀 1. نقاط النهاية الجديدة (API Endpoints Available)

تم تفعيل الـ Endpoints التالية على السيرفر، وتدعم كلاً من بادئة `/api/v1/gate` وبادئة `/api/parking/gate`:

### أ) محاكاة دخول السيارة وقراءة الكاميرا (Simulate Gate Entry / LPR)

```http
POST /api/v1/gate/simulate-entry
Authorization: Bearer <ADMIN_OR_STAFF_TOKEN>
Content-Type: application/json
```

#### جسم الطلب (Request Body):
```json
{
  "plate": "بلد 475",
  "buildingId": 1,
  "parkingId": 1,
  "gateId": "Gate-01 (In)",
  "placeId": null,
  "userId": null
}
```
* `plate` (مطلوب): رقم اللوحة (عربي أو إنجليزي، بمسافات أو بدونها مثل `"بلد 475"` أو `"VIS1001"`).
* `buildingId` (اختياري): معرف المبنى (الافتراضي: 1).
* `parkingId` (اختياري): معرف الموقف (الافتراضي: 1).
* `gateId` (اختياري): كود البوابة.
* `placeId` (اختياري): إذا ترك `null`، يقوم النظام تلقائياً بفحص الحجز المسبق للوحة أو تخصيص أول مكان شاغر `IsEmpty = true`.
* `userId` (اختياري): إذا ترك `null`، يقوم النظام بربطها بالزائر صاحب الدعوة والحجز أو بـ `visitor1`.

#### استجابة السيرفر (Response - 200 OK):
```json
{
  "data": {
    "sessionId": 45,
    "plate": "بلد 475",
    "userId": 5,
    "buildingId": 1,
    "buildingName": "Building 1",
    "zoneId": 1,
    "zoneName": "Zone A",
    "parkingId": 1,
    "parkingName": "Seed Parking",
    "placeId": 5,
    "placeName": "A-005",
    "startedAt": "2026-08-30T13:50:00Z",
    "status": "Open",
    "amountDue": 25.00,
    "currency": "EGP",
    "barrierOpened": true,
    "message": "تمت محاكاة دخول السيارة وبدء الجلسة وتحديد الموقع بنجاح."
  },
  "correlationId": "8f31b402-9999-4c12-8e10-1845bb38f220"
}
```

---

### ب) محاكاة خروج السيارة (Simulate Gate Exit)

```http
POST /api/v1/gate/simulate-exit
Authorization: Bearer <ADMIN_OR_STAFF_TOKEN>
Content-Type: application/json
```

#### جسم الطلب (Request Body):
```json
{
  "plate": "بلد 475",
  "sessionId": 45,
  "gateId": "Gate-02 (Out)",
  "force": false
}
```

#### استجابة السيرفر (Response - 200 OK):
```json
{
  "data": {
    "sessionId": 45,
    "plate": "بلد 475",
    "endedAt": "2026-08-30T14:30:00Z",
    "status": "Closed",
    "totalAmount": 25.00,
    "barrierOpened": true,
    "message": "تمت محاكاة خروج السيارة وإغلاق الجلسة وتفريغ مكان الركن بنجاح."
  }
}
```

---

## 📡 2. أحداث SignalR المباشرة (Real-Time Events on `/hubs/parking`)

بمجرد استدعاء `simulate-entry`، يقوم السيرفر ببث 4 أحداث رئيسية لتحديث شاشات الموبايل بدون ريفريش:

### 1. حدث تحديث الجلسة `SessionUpdated`:
* **المجموعات المستهدفة:** `user_{userId}` و `building_{buildingId}`.
* **الـ Payload المرسل:**
```json
{
  "eventId": "e932454a-718f-4311-8973-22837bc901a1",
  "occurredAt": "2026-08-30T13:50:00Z",
  "sessionId": 45,
  "status": "Open",
  "plate": "بلد 475",
  "amountDue": 25.00,
  "currency": "EGP",
  "buildingId": 1,
  "parkingId": 1,
  "placeId": 5,
  "placeName": "A-005"
}
```

### 2. حدث تحديث موقع السيارة `VehicleLocationUpdated`:
* **المجموعات المستهدفة:** `user_{userId}` و `building_{buildingId}`.
* **الـ Payload المرسل:**
```json
{
  "eventId": "7a35cb91-912b-42b7-a384-1845bb38f220",
  "occurredAt": "2026-08-30T13:50:00Z",
  "plate": "بلد 475",
  "sessionId": 45,
  "vehicleId": null,
  "buildingId": 1,
  "parkingId": 1,
  "placeId": 5,
  "placeName": "A-005"
}
```

### 3. حدث تحديث الإشغال `OccupancyUpdated`:
* **المجموعات المستهدفة:** `building_{buildingId}`.
```json
{
  "eventId": "f18394ca-4819-4822-921a-49385bf18392",
  "occurredAt": "2026-08-30T13:50:00Z",
  "buildingId": 1,
  "zoneId": 1,
  "parkingId": 1,
  "free": 5,
  "total": 6
}
```

---

## 🗺️ 3. شاشة «أين عربيتي» ومطابقة الموقع (Find My Car)

* عند استعلام الموبايل عبر `GET /api/parking/vehicle-location/find?plate=بلد 475`:
  * يعود السيرفر بـ `found: true`, `isCurrent: true`.
  * يتم إرجاع مسار المبنى والموقف والمكان:
    * `buildingName: "Building 1"`
    * `zoneName: "Zone A"`
    * `parkingLotName: "Seed Parking"`
    * `placeName: "A-005"`
    * `latitude: 30.0444`, `longitude: 31.2357`, `indoorX: 120`, `indoorY: 80`, `floor: 1`.

---

## 🖥️ 4. واجهة المحاكاة في الويب أدمن (Web Gate Simulator)

تمت إضافة شاشة كاملة للأدمن والمشغلين في الويب عبر المسار:
🔗 **`/admin/simulator`** (تحت قائمة التشغيل → **محاكي البوابة**):
* تتيح اختيار أي لوحة أو النقر على وسوم الاختبار السريعة (`بلد 475`, `VIS1001`, إلخ).
* الضغط على زر **«🟢 محاكاة دخول (Simulate Entry)»** لإنشاء الجلسة وتحديد المكان وإرسال أحداث SignalR فوراً.
* جدول للجلسات الحية يتيح متابعة الحالة (Open / Paid) والخروج بنقرة زر.

---

## 🧪 5. خطوات الاختبار الموصى بها لفريق الموبايل (E2E Test Steps)

1. **الساكن (`citizen1`)**: ينشئ حجزاً ومكاناً للوحة `بلد 475` ويولد كود دعوة.
2. **الزائر (`visitor1`)**: يتحقق من الكود في الموبايل (`/invite`).
3. **الدخول عبر المحاكي**:
   - من شاشة الويب `/admin/simulator` أو عبر `POST /api/v1/gate/simulate-entry` للوحة `بلد 475`.
4. **التحقق من الموبايل**:
   - [x] شاشة **«جلستي» (Session)** تفتح تلقائياً بحالة `Open` مع المبلغ `25 EGP`.
   - [x] شاشة **«أين عربيتي» (Find My Car)** تُظهر السيارة وموقعها المخصص والخريطة.
5. **الدفع من الموبايل**:
   - [x] الزائر يسدد الجلسة عبر `POST /v1/payments/intents/{id}/capture` فتتحول لـ `Paid` مع مهلة سماح 20 دقيقة.
6. **الخروج**:
   - [x] الضغط على **Simulate Exit** فتغلق الجلسة وتتفرغ الخلية تلقائياً.
