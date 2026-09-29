# WEB — ابدأ من هنا وما ترجعش

الملف ده **موجّه لمهندس React**. اقرأه كامل، ابنِ حسبه، وسلّم على تعريف الانتهاء تحت.

لو تعارض مع شات قديم: **الملف ده** يكسب. عقود الـ API نفس الموبايل (`BACKEND-START-HERE.md`) — متخترعش endpoints تانية.

باك اند = .NET 8 · موبايل = Flutter · أنت = **React على المتصفح فقط**.  
مش تطبيق ديسكتوب. Chrome / Edge.  
**ممنوع** RabbitMQ / MQTT / Firestore. المنصة: **REST + SignalR**. مفيش FCM على الويب في الـ Pilot.

---

## 1) إيه اللي هتسلّمه

تطبيق `nri-web`: بوابة من اللابتوب.

**أول تسليم (4 أسابيع):**

نفس مسار الموبايل للمواطن + شاشة أدمن خفيفة لو الدور `admin`:

1. عربي RTL + إنجليزي من أول شاشة  
2. دخول `POST /api/v1/auth/dev-login` — **مفيش Register**  
3. إشغال: `buildingId` من `GET /me` (Mock fallback `B-01`) — اعرض `zones[]`  
4. جلسة + دفع تجريبي (intent + capture)  
5. بلاغ دعم  
6. لو `role === admin`: لوحة أرقام إشغال لايف فقط (مش إدارة مستخدمين)

**نفس الشاشات** لـ visitor / citizen / employee.  
`building-op` / `cashier` **مش** على الويب في الـ Pilot (كاشير = Windows المورد).  
`admin` يرى زيادة: لوحة إشغال فقط.

**مش في أول 4 أسابيع:** خريطة الحي، EV، فواتير ERP، 31 مبنى، فتح حاجز، كيوسك، POS، VMS، إدارة مستخدمين، ضبط grace/ticketless، حجز/اشتراك، Keycloak من المتصفح، Web Push.

الكود: فولدر `NRI_web` لحد ما يتحدد remote. ريبو رسمي مستقل: `nri-web`.  
`git init` على `develop` **مسموح دلوقتي** من غير remote.

Mock أدمن محلي لحد المنصة: `admin1` / `Pass123!` / `role: admin` / `B-01`.

عنوان التبويب: `NRI`. Safari **مش** شرط قبول الأسبوع 4.

لو الباك اند متأخر: Mock وراء `apiClient`. نفس الشاشات.

---

## 2) المكدس — مقفول

| بند | القيمة |
|---|---|
| فريم ورك | **React 18** + **TypeScript** |
| البناء | **Vite** |
| تنقل | **React Router** v6 |
| بيانات سيرفر | **TanStack Query** |
| HTTP | **axios** |
| ريل تايم | **@microsoft/signalr** على `/hubs/live` |
| ترجمة | **i18next** + `react-i18next` (ar / en) |
| RTL | `document.dir = 'rtl'` + MUI RTL إن استخدمت MUI |
| UI | **MUI** + ثيم محايد (يتغيّر بعدين) |
| توكن | `sessionStorage` (مش localStorage للـ Pilot؛ أبسط وأأمن نسبياً على جهاز مشترك) |

**ممنوع:** Next.js، Angular، Firebase Auth، Firestore، mqtt، Redux من اليوم 1 (Query يكفي).

---

## 3) هيكل المشروع

```
nri-web/
  src/
    main.tsx
    app/App.tsx
    app/router.tsx
    app/theme.ts
    core/
      api/client.ts              // axios + JWT + Accept-Language + Idempotency-Key
      api/types.ts               // نفس JSON الموبايل
      api/mock.ts
      auth/AuthProvider.tsx
      realtime/liveHub.ts        // SignalR مرة واحدة
      i18n/
        ar.json
        en.json
    features/
      login/
      home/
      occupancy/
      session/
      payment/
      tickets/
      profile/
      admin-occupancy/           // admin فقط
  index.html
  vite.config.ts                 // proxy /api و /hubs → الباك اند
  README.md
```

الشاشات ما تشوفش axios ولا SignalR مباشرة.

---

## 4) الربط مع الباك اند

Vite dev:

```
API_BASE = /api  (proxy إلى http://localhost:5080)
HUB      = /hubs/live
```

`vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:5080',
    '/hubs': { target: 'http://localhost:5080', ws: true },
  },
}
```

### REST (نفس الموبايل)

```
POST /api/v1/auth/dev-login          { username, password }
GET  /api/v1/me
PUT  /api/v1/me/vehicles             { plate, make? }

GET  /api/v1/buildings/{buildingId}/occupancy
GET  /api/v1/parking/sessions/current
GET  /api/v1/parking/sessions/{id}

POST /api/v1/payments/intents        Idempotency-Key
POST /api/v1/payments/intents/{id}/capture

POST /api/v1/tickets
GET  /api/v1/tickets
```

هيدرز: `Authorization: Bearer` · `Accept-Language: ar|en`

خطأ:

```json
{ "code": "GRACE_EXPIRED", "message": "...", "correlationId": "uuid" }
```

اعرض `message`، تصرّف على `code`.

### SignalR

- `{origin}/hubs/live` + `accessTokenFactory`
- `JoinBuilding(buildingId)` من `/me`
- اسمع: `OccupancyUpdated` · `SessionUpdated` · `BarrierOpened` (toast فقط — متبعتش فتح)
- Reconnect + بانر لو القطع

**مفيش FCM.** التحديث والشاشة مفتوحة = SignalR.

---

## 5) الشاشات (MVP)

| # | مسار | مين | سلوك |
|---|---|---|---|
| 1 | `/login` | الكل | JWT |
| 2 | `/` | الكل | اختصارات |
| 3 | `/occupancy` | الكل | zones لايف |
| 4 | `/session` | الكل | جلسة + grace |
| 5 | `/pay` | الكل | 15 SAR تجريبي |
| 6 | `/tickets` | الكل | قائمة + إنشاء |
| 7 | `/profile` | الكل | اسم، لغة، لوحة |
| 8 | `/admin/occupancy` | `admin` فقط | نفس الأرقام بشكل لوحة — لو مش admin → `/` |

حالات: loading / empty / error / data.

---

## 6) لغة و RTL

- أول فتح: عربي  
- تبديل لغة يقلب `dir` فوراً  
- مفيش نص ثابت في JSX  
- عربي فصيح، مش عامية  
- اللوحات LTR  
- اللغة محلية فقط + هيدر `Accept-Language` (مش PUT /me في 4 أسابيع)

---

## 7) خطة 4 أسابيع

### أسبوع 1

- [ ] `npm create vite@latest nri-web -- --template react-ts`  
- [ ] Router + i18n RTL + MUI theme  
- [ ] Login / Home / Profile بـ Mock  
- [ ] `apiClient` interface  
- [ ] README: `npm i` و `npm run dev`

### أسبوع 2

- [ ] axios + JWT + 401 → login  
- [ ] `GET /me` + occupancy  
- [ ] لو المنصة مش جاهزة: Mock بنفس JSON

### أسبوع 3

- [ ] SignalR `JoinBuilding`  
- [ ] Occupancy من غير زر تحديث  
- [ ] شاشة الجلسة  
- [ ] بانر قطع الاتصال

### أسبوع 4

- [ ] دفع تجريبي + Idempotency-Key  
- [ ] تذاكر  
- [ ] `/admin/occupancy` للـ admin  
- [ ] Chrome + Edge على اللابتوب  

---

## 8) تعريف «انتهى»

1. عربي RTL، إنجليزي يقلب الاتجاه  
2. Login → Home  
3. Occupancy free/total لمبنى `/me`  
4. مع simulator: occupy → الرقم ينقص من غير refresh  
5. جلسة + دفع تجريبي  
6. بلاغ في القائمة  
7. قطع النت = error ظاهر مش شاشة بيضا  
8. مفيش firebase/mqtt في `package.json`  
9. admin يفتح `/admin/occupancy` — غيره يتحول Home  
10. Chrome كافٍ؛ Edge مرة؛ Safari مش شرط  

---

## 9) متقرر — متسألش

| سؤال | الجواب |
|---|---|
| فريم ورك؟ | React + Vite + TS |
| لايف؟ | SignalR نفس هب الموبايل |
| FCM؟ | لا |
| Next.js؟ | لا |
| أفتح الحاجز؟ | لا |
| أدفع إزاي؟ | REST capture تجريبي |
| كام مبنى؟ | من `/me` — Pilot `B-01` |
| إدارة مستخدمين؟ | بعد الأسبوع 4 |

---

## 10) يوم 1

```bash
npm create vite@latest nri-web -- --template react-ts
cd nri-web
npm i react-router-dom @tanstack/react-query axios i18next react-i18next @microsoft/signalr @mui/material @emotion/react @emotion/styled stylis stylis-plugin-rtl @mui/stylis-plugin-rtl
```

ابعت للمطوّر كمان: `SA-REPLY-TO-WEB.md` (قرارات قصيرة).
