import { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { glassPanel, glowPanel } from '../../app/theme';

export function NotificationsPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'تم فتح الحاجز تلقائياً لمركبتك', body: 'تم التعرف على اللوحة أ ب ج 1004 عند بوابة الشمال وتم فتح الحاجز بنجاح.', time: 'منذ 5 دقائق', severity: 'Info' },
    { id: 'n2', title: 'تم خصم رسوم الوقوف من المحفظة', body: 'تم خصم 15 SAR بنجاح لجلسة الوقوف في المبنى الرئيسي.', time: 'منذ ساعتين', severity: 'Success' },
    { id: 'n3', title: 'تنبيه: اقتراب انتهاء فترة السماح', body: 'تبقى 5 دقائق فقط على انتهاء فترة السماح المجانية لمركبتك.', time: 'منذ 3 ساعات', severity: 'Warning' },
    { id: 'n4', title: 'وصول ضيف مسجل عبر تصريح الزائر', body: 'وصل الأستاذ خالد عبد الله عبر بوابة الشمال 1 باستخدام كود INV-8921.', time: 'أمس 14:30', severity: 'Info' },
    { id: 'n5', title: 'تم تجديد الاشتراك السنوي بنجاح', body: 'تم تفعيل باقة Annual Pro بنجاح حتى نهاية عام 2026.', time: 'منذ يومين', severity: 'Success' },
  ]);

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (tab === 1) return n.severity === 'Warning';
    if (tab === 2) return n.severity === 'Success';
    return true;
  });

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          مركز الإشعارات والتنبيهات (Notification Center)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          سجل فوري لجميع الإشعارات المتعلقة بمركباتك، المدفوعات، البوابات، وحجوزات الزوار
        </Typography>
      </Box>

      {/* Filter Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`جميع الإشعارات (${notifications.length})`} />
        <Tab label="التنبيهات الهامة (Warnings)" />
        <Tab label="العمليات الناجحة (Success)" />
      </Tabs>

      <Stack spacing={2}>
        {filtered.map((n) => {
          const isWarning = n.severity === 'Warning';
          const isSuccess = n.severity === 'Success';
          return (
            <Card
              key={n.id}
              sx={{
                ...glassPanel({}, theme.palette.mode),
                p: 2.5,
                borderLeft: `4px solid ${
                  isWarning
                    ? theme.palette.warning.main
                    : isSuccess
                    ? theme.palette.success.main
                    : theme.palette.primary.main
                }`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ mt: 0.5 }}>
                    {isWarning ? (
                      <WarningAmberIcon sx={{ color: theme.palette.warning.main }} />
                    ) : isSuccess ? (
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    ) : (
                      <InfoIcon sx={{ color: theme.palette.primary.main }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {n.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                      {n.body}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {n.time}
                    </Typography>
                  </Box>
                </Stack>

                <IconButton size="small" onClick={() => handleDelete(n.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
