import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import { smartParkingApi } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';

export interface AlarmItem {
  id: string;
  title: string;
  description?: string;
  severity: 'Info' | 'Warning' | 'Critical';
  status: 'Active' | 'Acknowledged' | 'Resolved';
  gateName?: string;
  createdAt: string;
}

export function AlarmsPage() {
  const theme = useTheme();
  const { hub } = useAuth();

  const [alarms, setAlarms] = useState<AlarmItem[]>([
    {
      id: 'alm-1',
      title: 'محاولة اقتحام أو كسر حاجز إلكتروني',
      description: 'تم رصد حركة مفاجئة على ذراع الحاجز في بوابة الشمال 1 دون إذن مرور مسبق',
      severity: 'Critical',
      status: 'Active',
      gateName: 'بوابة الشمال 1 (Gate North 01)',
      createdAt: '18:15 اليوم',
    },
    {
      id: 'alm-2',
      title: 'مركبة تقف في مسار الطوارئ',
      description: 'مركبة بلوحة غير مسجلة متوقفة أمام مخرج الطوارئ في الدور الأرضي',
      severity: 'Warning',
      status: 'Active',
      gateName: 'المبنى الرئيسي - مخرج 2',
      createdAt: '17:40 اليوم',
    },
    {
      id: 'alm-3',
      title: 'انقطاع استجابة كاميرا التعرف LPR',
      description: 'تأخر نبضات الاتصال (Heartbeat) لكاميرا CAM-SOUTH-02 لأكثر من دقيقتين',
      severity: 'Warning',
      status: 'Acknowledged',
      gateName: 'بوابة الجنوب 2',
      createdAt: '16:10 اليوم',
    },
    {
      id: 'alm-4',
      title: 'إعادة ضبط أمان البوابة المركزية',
      description: 'تمت المعايرة الدورية بنجاح بواسطة المشغل',
      severity: 'Info',
      status: 'Resolved',
      gateName: 'المركز الرئيسي',
      createdAt: '14:00 اليوم',
    },
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    smartParkingApi.getAlarms().then((res) => {
      if (res && res.length > 0) setAlarms(res);
    }).catch(() => {});

    // Listen to real-time alarms via SignalR
    const unsub = (hub as any).onAlarmCreated?.((alarm: any) => {
      setAlarms((prev) => [
        {
          id: alarm.id || 'alm-' + Date.now(),
          title: alarm.title || 'إنذار أمني جديد',
          severity: alarm.severity || 'Warning',
          status: 'Active',
          gateName: alarm.gateName || 'بوابة رئيسية',
          createdAt: 'الآن',
        },
        ...prev,
      ]);
    });

    return () => unsub?.();
  }, [hub]);

  const handleAcknowledge = async (id: string) => {
    try {
      await smartParkingApi.acknowledgeAlarm(id);
    } catch {}
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' } : a))
    );
    setFeedback('تم الإقرار باستلام التنبيه ومباشرته من قبل فريق الأمن.');
  };

  const handleResolve = async (id: string) => {
    try {
      await smartParkingApi.resolveAlarm(id);
    } catch {}
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
    setFeedback('تمت معالجة التنبيه وإغلاق الحالة بنجاح.');
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            مركز إدارة التنبيهات والأمان (Operations Alarm Center)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            مراقبة الحوادث الأمنية، أعطال الحواجز، وتجاوزات المسارات في الوقت الحقيقي
          </Typography>
        </Box>
        <Chip
          icon={<WarningAmberIcon />}
          label={`${alarms.filter((a) => a.status === 'Active').length} تنبيهات نشطة`}
          color="error"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {feedback && <Alert severity="info" sx={{ mb: 3 }} onClose={() => setFeedback(null)}>{feedback}</Alert>}

      {/* Alarms Table */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>مستوى الخطورة</TableCell>
                <TableCell>عنوان التنبيه</TableCell>
                <TableCell>الموقع / البوابة</TableCell>
                <TableCell>التوقيت</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell align="center">الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alarms.map((a) => {
                const isCrit = a.severity === 'Critical';
                const isWarn = a.severity === 'Warning';
                return (
                  <TableRow
                    key={a.id}
                    hover
                    sx={{
                      bgcolor:
                        a.status === 'Active' && isCrit
                          ? alpha(theme.palette.error.main, 0.08)
                          : 'transparent',
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={a.severity}
                        size="small"
                        color={isCrit ? 'error' : isWarn ? 'warning' : 'info'}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {a.title}
                      </Typography>
                      {a.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {a.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{a.gateName || 'المجمع الرئيسي'}</TableCell>
                    <TableCell color="text.secondary">{a.createdAt}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          a.status === 'Active'
                            ? 'نشط (Active)'
                            : a.status === 'Acknowledged'
                            ? 'قيد المتابعة (Acknowledged)'
                            : 'تم الحل (Resolved)'
                        }
                        size="small"
                        color={a.status === 'Resolved' ? 'success' : a.status === 'Acknowledged' ? 'primary' : 'error'}
                        variant={a.status === 'Active' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {a.status === 'Active' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleAcknowledge(a.id)}
                            sx={{ fontWeight: 700 }}
                          >
                            إقرار (Acknowledge)
                          </Button>
                        )}
                        {a.status !== 'Resolved' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => handleResolve(a.id)}
                            sx={{ fontWeight: 700 }}
                          >
                            حل الإنذار (Resolve)
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
