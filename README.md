# nri-web — بوابة موقف الحي

بوابة المتصفح لمشروع **NRI Smart Parking** (Chrome / Edge).  
نفس منصة الموبايل (`Parking.Api` + SignalR). الويب = قناة **City web portal** من عرض MTI، مع شاشات مدير. الموبايل = تطبيق المواطن على الجيب.

| | |
|---|---|
| ريبو | `nri-web` |
| مكدس | React 18 · Vite · TypeScript · React Router 6 · TanStack Query · axios · i18next · MUI · SignalR |
| لغة | عربي RTL + إنجليزي من أول شاشة |
| توكن | `sessionStorage` (access + refresh) |
| API | `http://nri.runasp.net` عبر Vite proxy — **HTTP** |
| Hub | `/hubs/parking` |
| عملة العرض | SAR (السييد قد يرجع EGP — الواجهة تعرض SAR) |
| سماح الخروج | 20 دقيقة بعد الدفع |

ممنوع في هذا الريبو: Firebase · MQTT · Redux · Next.js · Register · FCM · فتح حاجز · كيوسك · POS.

---

## تشغيل

```bash
npm install
npm run dev
```

يفتح `http://localhost:5173`.

حسابات التجريب — كلمة المرور كلها **`admin`**:

| username | الدور |
|---|---|
| `visitor1` | زائر |
| `citizen1` | ساكن |
| `employee1` | موظف (مستخدم موقف، ليس مشغّل مبنى) |
| `admin1` / `admin` | مدير |

429 بعد محاولات دخول كثيرة: انتظر دقيقة (حد 10 / دقيقة / IP).

---

## الأدوار والشاشات والخواص

### زائر — `visitor`

هدف: يدفع جلسة قصيرة ويخرج.

| شاشة | مسار | ماذا يفعل |
|---|---|---|
| تسجيل الدخول | `/login` | JWT من `POST /auth/login` |
| الرئيسية | `/` | اختصارات حسب الدور |
| الإشغال | `/occupancy` | أخضر شاغر / أحمر مشغول، لايف |
| الجلسة | `/session` | جلسة مفتوحة، مدة الوقوف، مهلة 20 د |
| الدفع | `/pay` | intent + capture تجريبي |
| الإيصالات | `/receipts` · `/receipts/:id` | تاريخ جلساتي + إيصال جلسة من المنصة |
| لاقي عربيتي | `/find-car` · `/find-car/:plate` | مركباتي ثم موقع من `GET /parking/vehicle-location/find` |
| الحجز | `/reservations` | **قراءة فقط** — لا ينشئ ولا يلغي |
| كود الدعوة | `/invite` | **تحقق فقط** من كود دعوة الساكن — لا يفتح session |
| بطاقة الدخول | `/pass` | QR من `GET /me/pass` — 404 = فارغ |
| شواحن EV | `/ev` | شواحن المبنى (قراءة) |
| فواتير الحي | `/billing` | قائمة مستحقة — **بدون دفع** |
| البلاغات | `/tickets` | تذكرة مفقودة / حاجز / نفايات / صيانة / أخرى |
| الحساب | `/profile` | لغة، مركبة إن وُجدت، خروج |

لا يشتري باقة (403). الغرامة بعد السماح عند **كاشير الموقف**.

### ساكن — `citizen` · موظف — `employee`

نفس شاشات الزائر **زائد**:

| شاشة | مسار | ماذا يفعل |
|---|---|---|
| الاشتراك | `/subscriptions` | عرض باقات، شراء، تجديد، المنطقة الرئيسية والسلوت |
| الحجز | `/reservations` | إنشاء / إلغاء / دعوة زائر (`inviteCode`) |
| بطاقة الدخول | `/pass` | QR اشتراك (`kind=subscription`) |
| الحساب | `/profile` | إضافة / تعديل / حذف لوحة المركبة |

الموظف = مستخدم موقف مثل الساكن. **ليس** مشغّل بوابات.

### مدير — `admin`

كل ما سبق (قراءة/شراء حسب المنصة) **زائد تشغيل**:

| شاشة | مسار | ماذا يفعل |
|---|---|---|
| لوحة الإشغال | `/admin/occupancy` | أرقام حية لكل المباني |
| التقارير | `/admin/reports` | إشغال، إيراد اليوم، مخالفات، اشتراكات |
| مخالفات السماح | `/admin/grace` | جلسات انتهت مهلتها ولسه جوه |
| بحث اللوحة | `/admin/plates` | بحث جزئي عبر المباني |
| بلاغات الدعم | `/admin/tickets` | طابور قراءة + `resolutionNote` |
| المستخدمون | `/admin/users` | قائمة قراءة فقط — بدون إنشاء أدوار |

### مشغّل مبنى / كاشير — `building-op` / `cashier`

يُسمح بالدخول من المتصفح. **نفس شاشات الزائر، من غير لوحة أدمن.**  
POS والكاشير الحقيقي = برنامج ويندوز للمورد، ليس هذه البوابة.

---

## ماذا لا يفعله الويب (وأين يُبنى)

| الخاصية | أين |
|---|---|
| فتح/قفل الحاجز، ANPR، حساسات، LED | هاردوير المورد عند البوابة |
| غرامة بعد 20 د + حل تذكرة مفقودة | كاشير POS (ويندوز) |
| كيوسك | جهاز كيوسك منفصل |
| إنشاء مستخدمين / Keycloak من المتصفح | المنصة / IAM بعد الـ Pilot |
| إشعارات FCM | الموبايل فقط |
| دفع فاتورة الحي | مالية الحي عبر ERP — مش هذه البوابة ومش كاشير الموقف |
| خريطة الحي، VMS، ERP | أنظمة أخرى |

---

## العقود والملفات

| ملف | الغرض |
|---|---|
| `WEB-START-HERE.md` | نطاق الويب التنفيذي |
| `FROM-PROPOSAL.md` | قواعد عرض MTI للبوابة |
| `SA-REPLY-TO-WEB.md` | قرارات SA الأولى (Pilot) |
| `SA-REPLY-TO-WEB-19-AUG.md` | قرارات 19 أغسطس: تجميد، SAR، فاتورة عرض، موظف=ساكن |
| `FINAL-END-POINT.md` | عقد REST/SignalR للـ Pilot |
| `Finall-Project.md` | تسليم الباك اند P1–P4 |
| `Finall-web.md` | تسليم الباك اند P5–P7 |
| `ASKS-BACKEND.md` | فهرس طلبات المنصة (P1–P7 تمت) |
| `STATUS-AND-ROLES.md` | حالة المشروع + الأدوار + مين ياخد أنهي ملف |
| `ASKS-FROM-WEB-TO-*.md` | طلبات/تسليم لكل طرف (باك اند، موبايل، SA، بوابة، POS، الحي) |
| `README-FROM-MOBILE.md` | ما كان على الموبايل وأُضيف للويب (QR / EV / فواتير) |
| `README-FOR-FLUTTER-FRIEND.md` | تحديث لوجين/`/me`/Hub للموبايل |
| `README-VISITOR-FLOW-RESPONSE.md` | تأكيد فلو الزائر (session vs invite) — باك اند + موبايل |

البروكسي في التطوير:

```
المتصفح → /api و /hubs → http://nri.runasp.net
```

لوجين: `POST /api/v1/auth/login` فقط (ليس `dev-login`).

---

## للموبايل (Flutter) — ماذا يطابق الويب

المنصة واحدة. التطبيق لازم يغطّي **مسار المواطن/الزائر/الموظف**. شاشات الأدمن للويب.

### لازم عند الموبايل (نفس الويب)

| خاصية | API |
|---|---|
| عربي/إنجليزي + `Accept-Language` | كل الطلبات |
| دخول / تجديد / خروج | `POST /auth/login` · `/refresh` · `/logout` |
| الملف والمركبات | `GET /me` · `POST/PUT/DELETE /me/vehicles` |
| إشغال لايف | `GET /buildings/{id}/occupancy` + `/details` + Hub `/hubs/parking` |
| جلسة حالية | `GET /parking/sessions/current` — مفيش جلسة = **404** `NO_CURRENT_SESSION` (مش logout) |
| دفع تجريبي | `POST /payments/intents` + `/capture` + `Idempotency-Key` |
| سماح 20 د بعد الدفع | `graceUntil` — الغرامة ليست من التطبيق |
| إيصالات / تاريخ | `GET /parking/sessions?mine=true` و`GET /payments?mine=true` و`GET /parking/sessions/{id}/receipt` |
| لاقي عربيتي | `GET /me/vehicles` ثم `GET /parking/vehicle-location/find?plate=` — ملكية اللوحة على المنصة · خريطة 2D من `route.nodes/edges` |
| بطاقة QR | `GET /me/pass` — ارسموا `data.payload` · 404 = أخفوا البطاقة |
| اشتراك قراءة إضافية | `GET /me/subscription` — `mainArea` · `slotLabel` · `optionalAreas` |
| شواحن EV | `GET /buildings/{id}/ev-chargers` |
| فواتير الحي | `GET /billing/invoices` — بدون دفع من التطبيق |
| باقات واشتراك | `GET /parking/bundles` · `GET /subscriptions/current` (404 `NO_CURRENT_SUBSCRIPTION`) · `POST /subscriptions` · `POST .../renew` — زائر = 403 |
| بلاغ دعم | `GET/POST /tickets` — `lost_ticket` · `barrier` · `waste` · `maintenance` · `other` |
| حجز | `GET/POST/DELETE /parking/reservations` — تعارض = 409 `RESERVATION_CONFLICT` |
| دعوة زائر | `POST /reservations/{id}/invite` → `inviteCode` |
| فحص الدعوة | `GET /reservations/invite/{code}` — غلط = 404 `INVITE_NOT_FOUND` |

قواعد مهمة من الويب (طبّقوها عندكم):

1. نفس JWT على كل المسارات. مفيش workaround فك payload بعد ما `/me` بقى 200.
2. في JSON: `username` (مش `userName` في اللوجين). `buildingId` رقم.
3. الألوان: أخضر = شاغر، أحمر = مشغول.
4. الويب لا يفتح الحاجز — الموبايل كذلك.
5. FCM عندكم فقط (`PUT /me/push-token` اختياري لاحقاً).

### مش مطلوب على الموبايل (ويب فقط)

- `/admin/occupancy`
- `/admin/reports`
- `/admin/grace`
- `/admin/plates`
- `/admin/tickets`
- `/admin/users`

### حسابات الاختبار نفسها

`visitor1` · `citizen1` · `employee1` · `admin1` — الباسورد `admin`.

تفاصيل اللوجين والـ Hub: `README-FOR-FLUTTER-FRIEND.md`.  
كتالوج المسارات: `Finall-Project.md` + `Finall-web.md`.

---

## هيكل الكود

```
src/
  app/          الثيم، الشيل، الراوتر، PageHeader
  core/api/     عميل HTTP + Mock + أنواع
  core/auth/    جلسة JWT
  core/i18n/    ar / en
  core/realtime SignalR
  features/     شاشة لكل مسار
```

الشاشات لا تستدعي axios أو SignalR مباشرة.

---

