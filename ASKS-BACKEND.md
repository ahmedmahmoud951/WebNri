# طلبات الباك اند من الويب — الفهرس

التاريخ: 2026-08-18  

المنصة خلّصت P1–P7. العقود:

- P1–P4: [`Finall-Project.md`](Finall-Project.md) — بعد `Database/034_ClientPortalPhases.sql`
- P5–P7: [`Finall-web.md`](Finall-web.md) — بعد `Database/035_ClientPortalP5P7.sql`

الويب مربوط على المسارات دي.

| مرحلة | الشاشة | الملف | حالة المنصة |
|---|---|---|---|
| 0 | JWT على `/me` والجلسة والدفع والتذاكر | [`ASKS-FROM-WEB-2026-08-18.md`](ASKS-FROM-WEB-2026-08-18.md) | منشور |
| 1 | `/receipts` | [`ASKS-BACKEND-P1-HISTORY.md`](ASKS-BACKEND-P1-HISTORY.md) | **تم** — `Finall-Project.md` |
| 2 | `/subscriptions` | [`ASKS-BACKEND-P2-SUBSCRIPTIONS.md`](ASKS-BACKEND-P2-SUBSCRIPTIONS.md) | **تم** — `Finall-Project.md` |
| 3 | `/reservations` | [`ASKS-BACKEND-P3-RESERVATIONS.md`](ASKS-BACKEND-P3-RESERVATIONS.md) | **تم** — `Finall-Project.md` |
| 4 | `/admin/plates` · `/admin/reports` · `/admin/users` | [`ASKS-BACKEND-P4-ADMIN.md`](ASKS-BACKEND-P4-ADMIN.md) | **تم** — `Finall-Project.md` |
| 5 | `/admin/grace` | [`ASKS-BACKEND-P5-GRACE.md`](ASKS-BACKEND-P5-GRACE.md) | **تم** — `Finall-web.md` |
| 6 | `/invite` | [`ASKS-BACKEND-P6-INVITE.md`](ASKS-BACKEND-P6-INVITE.md) | **تم** — `Finall-web.md` |
| 7 | `/admin/tickets` | [`ASKS-BACKEND-P7-TICKETS.md`](ASKS-BACKEND-P7-TICKETS.md) | **تم** — `Finall-web.md` |

قبل ما الشاشات تشتغل على السيرفر الحي: تشغيل 034 ثم 035 ثم Publish لـ Parking.Api.

عطل تقرير الإشغال: [`ASKS-BACKEND-REPORTS-500.md`](ASKS-BACKEND-REPORTS-500.md) — **اتصلح.** `GET /admin/reports/occupancy` → 200.

العقد الأوسع للـ Pilot: `FINAL-END-POINT.md`.

بعد إغلاق الشاشات (19 أغسطس): الداتا التجريبية والفجوات بين القنوات — [`STATUS-AND-ROLES.md`](STATUS-AND-ROLES.md).  
ملفات الأشخاص: `ASKS-FROM-WEB-TO-BACKEND.md` وباقي `ASKS-FROM-WEB-TO-*.md`.

