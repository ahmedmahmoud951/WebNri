# دليل التكامل الشامل لتطبيق Flutter — NRI Smart Parking & Toll Management Ecosystem

> **نسخة المطورين الرسمية — End-to-End Client Presentation & FCM Integration**  
> **رابط السيرفر السحابي (Cloud API):** `https://nri.runasp.net`  
> **رابط SignalR Hub في السيرفر السحابي:** `http://nri.runasp.net/hubs/parking`  
> **رابط السيرفر المحلي (Local Dev):** `http://localhost:5088`  
> **مستودع كود الويب (GitHub Web Repository):** [https://github.com/ahmedmahmoud951/WebNri](https://github.com/ahmedmahmoud951/WebNri)  
> **اتصال قاعدة البيانات:** `Server=db64137.public.databaseasp.net; Database=db64137; User Id=db64137; Encrypt=True; TrustServerCertificate=True;`  
> **خدمة الإشعارات (Push Notifications):** Firebase Cloud Messaging (FCM Admin SDK .NET 8)

---

## 📌 جدول المحتويات
1. [نظرة عامة والـ Architecture](#1-نظرة-عامة-والـ-architecture)
2. [المصادقة وحسابات العرض (JWT Authentication)](#2-المصادقة-وحسابات-العرض-jwt-authentication)
3. [تكامل إشعارات Firebase Cloud Messaging (FCM)](#3-تكامل-إشعارات-firebase-cloud-messaging-fcm)
4. [واجهات سجل الإشعارات (Notification Center APIs)](#4-واجهات-سجل-الإشعارات-notification-center-apis)
5. [واجهة اختبار الإشعارات (Demo Notification Endpoint)](#5-واجهة-اختبار-الإشعارات-demo-notification-endpoint)
6. [الربط اللحظي عبر SignalR Hub](#6-الربط-اللحظي-عبر-signalr-hub)
7. [خطوات سيناريوهات العرض الكاملة الـ 12 (End-to-End Workflows)](#7-خطوات-سيناريوهات-العرض-الكاملة-الـ-12-end-to-end-workflows)
8. [زر العرض التقديمي الشامل (Run Full Client Demo)](#8-زر-العرض-التقديمي-الشامل-run-full-client-demo)
9. [إعادة ضبط النظام (Reset Demo)](#9-إعادة-ضبط-النظام-reset-demo)
10. [قواعد الأمان والـ Payload Contract](#10-قواعد-الأمان-والـ-payload-contract)

---

## 1. نظرة عامة والـ Architecture

تم تصميم الباك إند وفق Clean Architecture مع دعم كامل لنسخة العرض التقديمي للعميل (Client Presentation Demo).
الواجهات التفاعلية لـ Web و Flutter تتصل بالكامل بنفس قاعدة البيانات وبنفس SignalR Hub وتتلقى نفس الأحداث اللحظية بالتوازي.

```text
       [Flutter Mobile]                   [React Web Client]
              │                                   │
              ├───────────► REST API ◄────────────┤
              │          (JWT Bearer)             │
              │                                   │
              ├──────────► SignalR Hub ◄──────────┤
              │          (/hubs/parking)          │
              │                                   │
              ▲                                   │
              │                                   ▼
        [Firebase FCM] ◄────────────── [Backend Notification Service]
     (Android & iOS Push)                 (SQL Server + SignalR)
```

---

## 2. المصادقة وحسابات العرض (JWT Authentication)

المصادقة بالكامل بواسطة JWT الصادر من الباك إند (ممنوع استخدام Firebase Auth).

### 2.1 تسجيل الدخول (Login)
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "visitor1",
  "password": "admin"
}
```

**الحسابات الجاهزة للديمو:**
| Username | Password | Role | Description |
|---|---|---|---|
| `visitor1` | `admin` | `Visitor` | زائر عادي مع مركبة وحجز |
| `citizen1` | `admin` | `Citizen` | مواطن/مقيم مع محفظة واشتراك رقمي |
| `employee1` | `admin` | `Employee` | موظف بالمنشأة |
| `admin1` | `admin` | `Admin` | مدير المبنى الأول (`buildingId = 1`) |
| `admin` | `admin` | `Admin` | مسؤول النظام الكامل |

### 2.2 الرد (Response):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "d74a...",
    "username": "visitor1",
    "role": "Visitor",
    "buildingId": 1
  }
}
```
> **ملاحظة هامة:** احفظ `accessToken` وأرسله في الهيدر لجميع الطلبات اللاحقة:  
> `Authorization: Bearer <accessToken>`

### 2.3 بيانات المستخدم الحالي:
```http
GET /api/v1/me
Authorization: Bearer <accessToken>
```

---

## 3. تكامل إشعارات Firebase Cloud Messaging (FCM)

الباك إند يحتوي الآن على إدارة كاملة لأجهزة المستخدمين وسجل الإشعارات، ويدعم تسجيل عدة أجهزة للمستخدم الواحد (iPhone + Android + Tablet).

### 3.1 تسجيل FCM Device Token عند فتح التطبيق
فور حصول التطبيق على الـ FCM Token من Firebase، أرسل الطلب التالي:

```http
PUT /api/v1/me/push-token
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "token": "dKj4f_example_fcm_token_here_...",
  "platform": "android",
  "deviceId": "samsung-sm-g998b",
  "deviceName": "Ahmed Galaxy S24",
  "appVersion": "1.0.0"
}
```
* **`platform`**: يجب أن تكون إما `"android"` أو `"ios"` (أحرف صغيرة).
* **`deviceId`**: معرّف الجهاز الفريد (Device ID).
* **UserId**: يُقرأ تلقائياً من JWT (ممنوع إرساله في الـ Body).

**الرد:**
```json
{
  "success": true
}
```

### 3.2 تحديث الـ Token (Token Refresh)
عند تشغيل دالة Firebase:
```dart
FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
  // أعد استدعاء PUT /api/v1/me/push-token بنفس الكود
});
```
الباك إند سيتعرف على الجهاز ويحدّث الـ Token بدون تكرار السجلات في قاعدة البيانات.

### 3.3 قناة إشعارات أندرويد (Android Notification Channel)
في ملف `MainActivity.kt` أو عند تهيئة Firebase في Flutter، يجب استخدام القناة التالية حصراً:
* **Channel ID:** `nri_parking`
* **Channel Name:** `NRI Smart Parking Notifications`
* **Importance / Priority:** `High`
* **Sound:** `default`

### 3.4 تسجيل الخروج وتعطيل الإشعارات (Logout)
عند تسجيل الخروج:
```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
X-Push-Token: <fcm_token_optional>
X-Device-Id: <device_id_optional>
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```
يقوم الباك إند بتعطيل جهاز المستخدم الحالي فورياً (`IsActive = false`) لمنع وصول إشعارات المستخدم القديم للجهاز بعد الخروج، مع الحفاظ على السجل للـ Audit.

---

## 4. واجهات سجل الإشعارات (Notification Center APIs)

### 4.1 جلب قائمة الإشعارات
```http
GET /api/v1/me/notifications?unreadOnly=false
Authorization: Bearer <accessToken>
```
**الرد:**
```json
[
  {
    "id": "6a9f73c1-e374-4b52-9c12-78d910111213",
    "userId": "11111111-1111-1111-1111-000000000001",
    "type": "payment_captured",
    "title": "تأكيد عملية الدفع",
    "body": "تم سداد 25.00 EGP لجلسة الموقف بنجاح.",
    "entityType": "ParkingSession",
    "entityId": "4f9d2a3e-781c-4e89-9a1b-123456789abc",
    "route": "/receipt/4f9d2a3e-781c-4e89-9a1b-123456789abc",
    "isRead": false,
    "createdAt": "2026-09-29T16:30:00Z",
    "readAt": null
  }
]
```

### 4.2 عدد الإشعارات غير المقروءة (Badge Count)
```http
GET /api/v1/me/notifications/unread-count
Authorization: Bearer <accessToken>
```
**الرد:**
```json
{
  "unreadCount": 3
}
```

### 4.3 تعليم إشعار كمقروء (Mark as Read)
```http
POST /api/v1/me/notifications/{id}/read
Authorization: Bearer <accessToken>
```
**الرد:**
```json
{
  "success": true
}
```

### 4.4 تعليم جميع الإشعارات كمقروءة (Mark All as Read)
```http
POST /api/v1/me/notifications/read-all
Authorization: Bearer <accessToken>
```
**الرد:**
```json
{
  "success": true,
  "markedCount": 3
}
```

---

## 5. واجهة اختبار الإشعارات (Demo Notification Endpoint)

تسمح هذه الواجهة باختبار دورة الإشعار بالكامل أمام العميل (Database + SignalR + FCM Push):

```http
POST /api/v1/demo/notifications/test
Content-Type: application/json

{
  "type": "payment_captured",
  "userId": "11111111-1111-1111-1111-000000000001",
  "sessionId": "4f9d2a3e-781c-4e89-9a1b-123456789abc",
  "plate": "1004 أ ب ج",
  "title": "تأكيد سداد الرسوم",
  "body": "تم خصم 25.00 SAR بنجاح. فترة السماح 15 دقيقة للخروج."
}
```

**أنواع الأحداث المعتمدة (Event Types):**
* `payment_captured`: تأكيد الدفع
* `grace_expiring`: اقتراب انتهاء فترة السماح
* `grace_expired`: انتهاء فترة السماح
* `vehicle_entered`: دخول المركبة
* `vehicle_exited`: خروج المركبة
* `reservation_created`: تأكيد الحجز
* `alarm`: تنبيه أمني أو عطل بوابات

---

## 6. الربط اللحظي عبر SignalR Hub

### 6.1 عنوان الاتصال
```text
URL: http://nri.runasp.net/hubs/parking
Query Param: access_token=<JWT_TOKEN>
Transport: WebSockets مع Fallback إلى LongPolling
```

### 6.2 إعداد الاتصال في Flutter (`signalr_netcore`):
```dart
final hubConnection = HubConnectionBuilder()
    .withUrl(
      'http://nri.runasp.net/hubs/parking',
      options: HttpConnectionOptions(
        accessTokenFactory: () async => myJwtToken,
      ),
    )
    .withAutomaticReconnect()
    .build();

await hubConnection.start();
```

### 6.3 الأحداث التي يبثها الباك إند (Listen to Events):
| اسم الحدث (Event) | الغرض |
|---|---|
| `NotificationCreated` | إشعار جديد تم إنشاؤه مع الـ `notificationId` نفسه |
| `LprDetected` | قراءة كاميرا التعرف على اللوحات LPR |
| `VehicleEntered` | دخول مركبة وافتتاح جلسة |
| `VehicleExited` | خروج مركبة واكتمال جلسة |
| `BarrierStateChanged` | تغير حالة ذراع البوابة (Open / Closed / Fault) |
| `CameraStateChanged` | حالة الكاميرا (Online / Offline) |
| `OccupancyChanged` | تحديث عدد المواقف الشاغرة والإشغال |
| `ReservationCreated` | حجز موقف جديد |
| `PaymentUpdated` | تأكيد عملية دفع وتحديث الرصيد |
| `AlarmRaised` | إطلاق إنذار أمني في مركز العمليات |

---

## 7. خطوات سيناريوهات العرض الكاملة الـ 12 (End-to-End Workflows)

كل خطوة مدعومة بـ API حقيقي وقاعدة بيانات SQL وأحداث SignalR و FCM.

### FLOW 1 — LOGIN
1. يفتح المستخدم شاشة الدخول ويختار `visitor1` / `admin`.
2. يتم إرسال `POST /api/v1/auth/login`.
3. يحصل على `accessToken` ويتم تسجيل الجهاز `PUT /api/v1/me/push-token`.
4. ينتقل التطبيق إلى Dashboard الرئيسي.

### FLOW 2 — RESERVATION (حجز موقف مسبق)
1. يختار المستخدم المبنى والطابق والموقف المطلوب والتاريخ.
2. استدعاء `POST /api/v1/reservations`:
```json
{
  "spotId": "33333333-3333-3333-3333-000000000001",
  "plateNumber": "1004 أ ب ج",
  "startTime": "2026-09-30T10:00:00Z",
  "endTime": "2026-09-30T14:00:00Z"
}
```
3. تتغير حالة الحجز إلى `Upcoming`.
4. يستقبل الويب و Flutter حدث SignalR `ReservationCreated`.

### FLOW 3 — VEHICLE ENTRY (دخول المركبة)
1. تشغيل المحاكاة عبر `POST /api/v1/demo/scenarios/vehicleentry`.
2. ترصد الكاميرا اللوحة `1004 أ ب ج` بدقة عالية.
3. يتم إنشاء `ParkingSession` جديدة في قاعدة البيانات.
4. يفتح الحاجز الإلكتروني `BarrierStateChanged: Open`.
5. ينقص عدد المواقف المتاحة بمقدار 1 (`OccupancyChanged`).
6. يصل إشعار Push للموبايل عبر FCM و SignalR (`NotificationCreated`).

### FLOW 4 — VEHICLE EXIT (خروج المركبة)
1. تشغيل `POST /api/v1/demo/scenarios/vehicleexit`.
2. تلتقط كاميرا المخرج اللوحة، وتحسب مدة الوقوف والمبلغ المستحق.
3. تُغلق الجلسة في SQL، ويفتح حاجز الخروج.
4. يزيد عدد المواقف الشاغرة بمقدار 1 لحظياً.

### FLOW 5 — GUEST INVITATION (دعوة زائر)
1. يضغط المقيم على "إنشاء تصريح زائر":
```http
POST /api/v1/client/invites
Authorization: Bearer <accessToken>

{
  "guestName": "سعود الشمري",
  "guestPhone": "+966501234567",
  "plateNumber": "2020 د هـ و",
  "validHours": 24
}
```
2. يرجع الـ API رابط التصريح ورمز الـ QR:
   * الرابط العام: `http://nri.runasp.net/invite?code=INV-2026-XXX`
   * إمكانية المشاركة عبر WhatsApp بضغطة زر.

### FLOW 6 — GUEST ARRIVAL (وصول الضيف)
1. عند وصول الضيف يتم فحص الـ QR أو قراءة اللوحة:
```http
POST /api/v1/demo/scenarios/guestpass
```
2. يتحقق النظام من صلاحية التصريح والبوابة المصرح بها.
3. تفتح البوابة تلقائياً ويتم تسجيل سجل دخول الزائر.

### FLOW 7 — FIND MY CAR (أين سيارتي)
1. يدخل المستخدم رقم اللوحة (مثلاً `1004 أ ب ج`).
2. استدعاء API:
```http
GET /api/v1/parking/find-car?plate=1004
Authorization: Bearer <accessToken>
```
3. يرجع الرد:
```json
{
  "found": true,
  "plate": "1004 أ ب ج",
  "building": "المبنى الشمالي الرئيسي",
  "floor": "طابق B1",
  "spotNumber": "B1-A12",
  "coordinates": { "x": 120, "y": 340 },
  "navigationPath": [
    { "x": 0, "y": 0, "name": "مدخل المصاعد الرئيسي" },
    { "x": 60, "y": 180, "name": "الممر C" },
    { "x": 120, "y": 340, "name": "الموقف B1-A12" }
  ]
}
```
4. يعرض التطبيق الخريطة والمسار الإرشادي للموقف.

### FLOW 8 — SUBSCRIPTION (الاشتراكات الشهرية)
1. يختار المستخدم باقة الاشتراك (باقة الشركات أو السكان).
2. استدعاء الدفع التجريبي `POST /api/v1/client/subscriptions`.
3. تفعيل البطاقة الرقمية (Digital Pass) مع رمز QR الحي.

### FLOW 9 — PAYMENT (سداد رسوم الجلسة)
1. عند استحقاق الفاتورة يختار العميل (Apple Pay / Mada):
```http
POST /api/v1/client/payments/intent
{
  "sessionId": "4f9d2a3e-781c-4e89-9a1b-123456789abc",
  "amount": 25.00,
  "currency": "SAR"
}
```
2. استدعاء `POST /api/v1/client/payments/capture`.
3. تحديث الفاتورة إلى مدفوعة، وبث حدث `PaymentUpdated` عبر SignalR.

### FLOW 10 — BARRIER ALARM (إنذار عطل الحاجز)
1. محاكاة عطل الحاجز: `POST /api/v1/demo/scenarios/barrierfailure`.
2. يصبح الحاجز بحالة `Fault`، ويظهر إنذار أحمر طارئ في الويب والتطبيق.
3. يضغط المشغل "Acknowledge" ثم "Resolve" لإعادة التشغيل.

### FLOW 11 — CAMERA OFFLINE (انقطاع الكاميرا)
1. محاكاة انقطاع الكاميرا: `POST /api/v1/demo/scenarios/cameraoffline`.
2. تتحول حالة الكاميرا إلى `Offline` ويزيد عداد الكاميرات المعطلة في الـ Dashboard.

---

## 8. زر العرض التقديمي الشامل (Run Full Client Demo)

للراحة القصوى أثناء العرض أمام العميل، يمكنك استدعاء السيناريو الآلي الشامل بضغطة زر واحدة:

```http
POST /api/v1/demo/scenarios/fulldemo
Content-Type: application/json

{
  "plate": "1004 أ ب ج"
}
```

يقوم الباك إند بتنفيذ تسلسل واقعي كامل مع فواصل زمنية (1.2 إلى 1.5 ثانية بين كل خطوة) لمشاهدة استجابة النظام مباشرة:
1. تحقق تسجيل الدخول
2. إنشاء الحجز
3. وصول المركبة ورصد LPR
4. رفع الحاجز
5. بدء جلسة المواقف وتخزينها في SQL
6. تغيير حالة الموقف وزيادة الإشغال
7. إرسال إشعار FCM للموبايل والويب
8. تحديد موقع السيارة في الخريطة
9. إنشاء تصريح الضيف وعرض الـ QR
10. وصول الضيف ودخوله
11. خروج المركبة وفتح حاجز الخروج
12. سداد الفاتورة وإغلاق الجلسة
13. إخلاء الموقف وتحديث شاشات المراقبة

---

## 9. إعادة ضبط النظام (Reset Demo)

بعد انتهاء العرض التقديمي للعميل، يمكنك تصفير كافة بيانات المحاكاة وإعادتها لحالتها النظيفة فورياً:

```http
POST /api/v1/demo/reset
Content-Type: application/json
```

يقوم الباك إند بـ:
* مسح الجلسات المؤقتة وأحداث LPR التجريبية.
* إعادة الحواجز لحالة `Closed` والكاميرات لـ `Online`.
* تصفير الإنذارات وإعادة إشغال المواقف للحالة النموذجية الموزونة.
* بث تحديث فوري لـ `OccupancyChanged` عبر SignalR لتحديث شاشات الموبايل والويب تلقائياً.

---

## 10. قواعد الأمان والـ Payload Contract

1. **معرّفات الكيانات (GUIDs):** جميع معرّفات الجلسات، الحجوزات، والأجهزة هي معرّفات عالمية فريدة `Guid` (مثل `4f9d2a3e-781c-4e89-9a1b-123456789abc`).
2. **البيانات في إشعار الـ Push:** جميع قيم كائن `data` داخل إشعار Firebase هي نصوص (`string`) لمنع أي تعارض في معالجة الإشعار على أجهزة iOS وأندرويد القديمة.
3. **أمان البيانات الحساسة:** لا يتم إرسال أرقام بطاقات أو كلمات سر أو بيانات سرية داخل FCM؛ يُرسل فقط المعرف `sessionId` / `notificationId`، ويقوم التطبيق بطلب التفاصيل الكاملة عبر الـ API الموثّق بـ JWT عند النقر على الإشعار.
4. **عزل فشل الإشعارات:** إخفاق إرسال إشعار Push (بسبب عدم وجود شبكة مثلاً) لا يُعطّل أبداً نجاح عملية الدفع أو فتح البوابة؛ حيث تعمل خدمة الإشعارات بشكل مستقل وغير متزامن في الخلفية.

---
**بالتوفيق في العرض التقديمي! الكود في الويب متاح على GitHub، والسيرفر جاهز للربط الفوري مع Flutter.**
