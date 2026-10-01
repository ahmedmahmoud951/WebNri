import type { Plugin } from 'vite';

interface StoredAlarm {
  id: number;
  alarmType: string;
  severity: 'Info' | 'Warning' | 'High' | 'Critical';
  source: string;
  deviceId?: number;
  buildingId?: number;
  zoneId?: number;
  status: 'Open' | 'Acknowledged' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed';
  message: string;
  occurrencesCount: number;
  createdAt: string;
  lastOccurredAt: string;
  isIncident: boolean;
  acknowledgedBy?: string;
  assignedTo?: string;
}

const mockAlarmsStore: StoredAlarm[] = [
  {
    id: 101,
    alarmType: 'StationaryVehicle',
    severity: 'Warning',
    source: 'بوابة الشمال 01 — مسار الدخول (Lane 1)',
    deviceId: 1,
    buildingId: 1,
    status: 'Open',
    message: 'مركبة متوقفة في مسار بوابة الشمال لأكثر من 3 دقائق دون استكمال العبور',
    occurrencesCount: 1,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    lastOccurredAt: new Date(Date.now() - 2 * 60000).toISOString(),
    isIncident: false,
  },
  {
    id: 102,
    alarmType: 'AntiTailgating',
    severity: 'Info',
    source: 'بوابة الجنوب 02 — مسار الخروج (Lane 2)',
    deviceId: 2,
    buildingId: 1,
    status: 'Acknowledged',
    message: 'حساس الأمان الذكي رصد محاولة تلاصق (Anti-Tailgating) وجرى خفض الذراع بنجاح تلقائياً',
    occurrencesCount: 2,
    createdAt: new Date(Date.now() - 24 * 60000).toISOString(),
    lastOccurredAt: new Date(Date.now() - 24 * 60000).toISOString(),
    isIncident: false,
    acknowledgedBy: 'مشغل العمليات الرئيسي',
  },
  {
    id: 103,
    alarmType: 'CameraHealth',
    severity: 'Info',
    source: 'كاميرا المستوى السفلي B1 — قبو B',
    deviceId: 5,
    buildingId: 1,
    status: 'Resolved',
    message: 'إعادة الاتصال بكاميرا المستوى السفلي B1 وعودة بث RTSP بدقة عالية 4K',
    occurrencesCount: 1,
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
    lastOccurredAt: new Date(Date.now() - 50 * 60000).toISOString(),
    isIncident: false,
  },
  {
    id: 104,
    alarmType: 'OverstayAlert',
    severity: 'Warning',
    source: 'المنطقة A الأرضي — خانة الموقف A-14',
    buildingId: 1,
    status: 'Open',
    message: 'تنبيه تجاوز فترة الوقوف المصرح بها لأكثر من 18 ساعة متواصلة دون تصريح سارٍ',
    occurrencesCount: 1,
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
    lastOccurredAt: new Date(Date.now() - 75 * 60000).toISOString(),
    isIncident: false,
  },
  {
    id: 105,
    alarmType: 'BarrierManualOverride',
    severity: 'Info',
    source: 'بوابة كبار الشخصيات VIP',
    deviceId: 3,
    buildingId: 1,
    status: 'Resolved',
    message: 'تم فتح الحاجز يدوياً عبر أمر الكونسول الفوري بطلب الإدارة التنفيذية',
    occurrencesCount: 1,
    createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
    lastOccurredAt: new Date(Date.now() - 110 * 60000).toISOString(),
    isIncident: false,
  },
];

export function alarmsResiliencePlugin(): Plugin {
  return {
    name: 'alarms-resilience-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        
        // Match /api/parking/alarms, /api/v1/parking/alarms and their sub-routes
        const isAlarmsRoute =
          url.startsWith('/api/parking/alarms') ||
          url.startsWith('/api/v1/parking/alarms');

        if (!isAlarmsRoute) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        // 1. GET /api/parking/alarms or /api/parking/alarms/summary
        if (req.method === 'GET') {
          if (url.includes('/summary')) {
            const openCount = mockAlarmsStore.filter((a) => a.status === 'Open').length;
            const ackCount = mockAlarmsStore.filter((a) => a.status === 'Acknowledged').length;
            const resCount = mockAlarmsStore.filter((a) => a.status === 'Resolved').length;
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                data: {
                  totalOpen: openCount,
                  totalAcknowledged: ackCount,
                  totalResolved: resCount,
                  criticalCount: 0,
                  highCount: 1,
                  warningCount: 2,
                  infoCount: 2,
                },
              })
            );
            return;
          }

          // List alarms with query filter support
          const parsedUrl = new URL(url, 'http://127.0.0.1');
          const statusFilter = parsedUrl.searchParams.get('status');
          const severityFilter = parsedUrl.searchParams.get('severity');

          let filtered = [...mockAlarmsStore];
          if (statusFilter && statusFilter !== 'All') {
            filtered = filtered.filter(
              (a) => a.status.toLowerCase() === statusFilter.toLowerCase()
            );
          }
          if (severityFilter && severityFilter !== 'All') {
            filtered = filtered.filter(
              (a) => a.severity.toLowerCase() === severityFilter.toLowerCase()
            );
          }

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              data: filtered,
              items: filtered,
              totalCount: filtered.length,
              page: 1,
              pageSize: 50,
            })
          );
          return;
        }

        // 2. POST actions (acknowledge, resolve, assign, close, etc.)
        if (req.method === 'POST') {
          const matchAck = url.match(/\/alarms\/(\d+)\/acknowledge/);
          const matchResolve = url.match(/\/alarms\/(\d+)\/resolve/);

          if (matchAck) {
            const id = Number(matchAck[1]);
            const item = mockAlarmsStore.find((a) => a.id === id);
            if (item) item.status = 'Acknowledged';
          } else if (matchResolve) {
            const id = Number(matchResolve[1]);
            const item = mockAlarmsStore.find((a) => a.id === id);
            if (item) item.status = 'Resolved';
          }

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              message: 'تم تحديث حالة البلاغ بنجاح في منظومة العمليات.',
              data: { status: 'Success' },
            })
          );
          return;
        }

        next();
      });
    },
  };
}
