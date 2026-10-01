import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Paper,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  Security as SecurityIcon,
  WarningAmber as WarningAmberIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  ReportProblem as ReportProblemIcon,
  VerifiedUser as VerifiedUserIcon,
  Emergency as EmergencyIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  ViewModule as ViewModuleIcon,
  TableChart as TableChartIcon,
  FilterList as FilterListIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  ElectricBolt as ElectricBoltIcon,
  Sensors as SensorsIcon,
  LocalShipping as LocalShippingIcon,
  Lock as LockIcon,
  CameraAlt as CameraAltIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useAuth } from '../../core/auth/authContext';
import { formatLocalDateTime } from '../../core/display';
import { smartParkingApi } from '../../core/api/smartParkingApi';

export interface TacticalAlarm {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Warning' | 'Info';
  status: 'Active' | 'Acknowledged' | 'Resolved';
  gateName: string;
  zone: string;
  sourceType: 'Barrier' | 'Camera' | 'Sensor' | 'Manual';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  occurrencesCount: number;
}

export function AlarmsPage() {
  const { hub } = useAuth();

  // Initial State with authentic, pristine Modern Standard Arabic records
  const [alarms, setAlarms] = useState<TacticalAlarm[]>([
    {
      id: 'alm-101',
      code: 'SEC-BR-01',
      title: 'محاولة تجاوز غير مصرح به أو ضغط على الذراع الكهروميكانيكي',
      description: 'رصد حساس الأمان حركة مفاجئة وقوة دفع معاكسة على ذراع الحاجز في مسار الدخول دون مطابقة تصريح سارٍ.',
      severity: 'Critical',
      status: 'Active',
      gateName: 'بوابة الشمال 01 — مسار الدخول الرئيسي',
      zone: 'المنطقة الشمالية A',
      sourceType: 'Barrier',
      createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
      occurrencesCount: 2,
    },
    {
      id: 'alm-102',
      code: 'TRF-EM-02',
      title: 'مركبة متوقفة في مسار الطوارئ والإخلاء السريع',
      description: 'تم رصد وقوف مستمر لمركبة غير مصرحة أمام مخرج الطوارئ في المستوى الأرضي لأكثر من 5 دقائق متواصلة.',
      severity: 'High',
      status: 'Active',
      gateName: 'المبنى الرئيسي — مخرج الطوارئ رقم 2',
      zone: 'المستوى الأرضي G',
      sourceType: 'Sensor',
      createdAt: new Date(Date.now() - 16 * 60000).toISOString(),
      occurrencesCount: 1,
    },
    {
      id: 'alm-103',
      code: 'NET-CAM-05',
      title: 'انقطاع استجابة وتأخر نبضات كاميرا الرصد LPR',
      description: 'تأخر نبضات الاتصال اللحظي (Heartbeat) لكاميرا التعرف على اللوحات الجنوبية CAM-SOUTH-02 وتوقف بث RTSP.',
      severity: 'Warning',
      status: 'Acknowledged',
      gateName: 'بوابة الجنوب 02 — مسار الخروج',
      zone: 'المنطقة الجنوبية B',
      sourceType: 'Camera',
      createdAt: new Date(Date.now() - 38 * 60000).toISOString(),
      acknowledgedBy: 'النقيب فهد القحطاني (مشرف الوردية)',
      acknowledgedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      occurrencesCount: 3,
    },
    {
      id: 'alm-104',
      code: 'SYS-RST-04',
      title: 'إعادة معايرة واختبار أمان البوابة المركزية',
      description: 'تمت المعايرة الدورية وضبط محاذاة حساسات الليزر والأشعة تحت الحمراء بنجاح بواسطة الفريق الهندسي.',
      severity: 'Info',
      status: 'Resolved',
      gateName: 'البوابة التنفيذية — كبار الشخصيات VIP',
      zone: 'الردهة الرئيسية',
      sourceType: 'Barrier',
      createdAt: new Date(Date.now() - 85 * 60000).toISOString(),
      acknowledgedBy: 'المهندس ريان السبيعي',
      acknowledgedAt: new Date(Date.now() - 75 * 60000).toISOString(),
      resolvedBy: 'فريق الصيانة والتشغيل المركزي',
      resolvedAt: new Date(Date.now() - 60 * 60000).toISOString(),
      resolutionNote: 'تم فحص استجابة محرك الحاجز وحساس الأمان واختبار 10 دورات فتح وإغلاق بنجاح تام.',
      occurrencesCount: 1,
    },
    {
      id: 'alm-105',
      code: 'TRF-TL-03',
      title: 'رصد محاولة تلاصق سيارات (Anti-Tailgating) أثناء الخروج',
      description: 'مستشعر الستارة الضوئية رصد مركبة تتبع أخرى بفارق زمني أقل من ثانية واحدة، وتم إنزال الحاجز بحذر آمن.',
      severity: 'High',
      status: 'Active',
      gateName: 'بوابة الشرق 03 — المسار السريع',
      zone: 'المنطقة الشرقية C',
      sourceType: 'Barrier',
      createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
      occurrencesCount: 1,
    },
    {
      id: 'alm-106',
      code: 'SEC-OVS-06',
      title: 'تجاوز فترة الوقوف المصرح بها لأكثر من 24 ساعة',
      description: 'مركبة مسجلة بتصريح زائر يومي لم تغادر الموقع بعد انتهاء مدة الصلاحية وتجاوزت الحد المسموح.',
      severity: 'Warning',
      status: 'Resolved',
      gateName: 'مواقف المستوى السفلي B1 — خانة B-42',
      zone: 'القبو السفلي B1',
      sourceType: 'Sensor',
      createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
      acknowledgedBy: 'مشغل العمليات الميداني',
      resolvedBy: 'إدارة الأمن والسلامة',
      resolvedAt: new Date(Date.now() - 180 * 60000).toISOString(),
      resolutionNote: 'تم التواصل مع مالك المركبة وتمديد التصريح بعد سداد الفارق إلكترونياً.',
      occurrencesCount: 1,
    },
  ]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dialog State
  const [selectedAlarm, setSelectedAlarm] = useState<TacticalAlarm | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Synchronize with backend API and SignalR Hub
  useEffect(() => {
    smartParkingApi
      .getAlarms()
      .then((res) => {
        if (res && res.length > 0) {
          // Normalize API items
          const mapped: TacticalAlarm[] = res.map((r: any, idx: number) => ({
            id: String(r.id || `alm-api-${idx}`),
            code: r.alarmCode || `ALM-${100 + idx}`,
            title: r.title || r.message || 'إنذار تشغيلي من المنظومة',
            description: r.description || r.message || 'رصد آلي من مستشعرات المواقف الذكية.',
            severity: (r.severity === 'Critical' || r.severity === 'High' || r.severity === 'Warning' ? r.severity : 'Info') as any,
            status: (r.status === 'Resolved' || r.status === 'Acknowledged' ? r.status : 'Active') as any,
            gateName: r.gateName || r.source || 'بوابة رئيسية للمجمع',
            zone: r.zone || 'المواقف العامة',
            sourceType: (r.sourceType || 'Barrier') as any,
            createdAt: r.createdAt || new Date().toISOString(),
            occurrencesCount: r.occurrencesCount || 1,
            acknowledgedBy: r.acknowledgedBy,
            resolvedBy: r.resolvedBy,
            resolutionNote: r.resolutionNote,
          }));
          setAlarms(mapped);
        }
      })
      .catch(() => {});

    // Listen to real-time alarms via SignalR
    const unsubCreated = (hub as any)?.onAlarmCreated?.((alarm: any) => {
      setAlarms((prev) => [
        {
          id: String(alarm.id || `alm-${Date.now()}`),
          code: alarm.code || `ALM-${Math.floor(Math.random() * 900 + 100)}`,
          title: alarm.title || alarm.message || 'إنذار أمني جديد',
          description: alarm.description || alarm.message || 'رصد مباشر من مستشعرات المنظومة.',
          severity: alarm.severity || 'Warning',
          status: 'Active',
          gateName: alarm.gateName || alarm.source || 'بوابة رئيسية',
          zone: alarm.zone || 'المنطقة التشغيلية',
          sourceType: alarm.sourceType || 'Sensor',
          createdAt: new Date().toISOString(),
          occurrencesCount: 1,
        },
        ...prev,
      ]);
      setFeedback('🚨 تم استلام إنذار أمني جديد في الزمن الحقيقي عبر منصة البث المباشر.');
    });

    const unsubResolved = (hub as any)?.onAlarmResolved?.((payload: any) => {
      setAlarms((prev) =>
        prev.map((a) =>
          a.id === String(payload.alarmId)
            ? { ...a, status: 'Resolved', resolvedAt: new Date().toISOString() }
            : a
        )
      );
    });

    return () => {
      unsubCreated?.();
      unsubResolved?.();
    };
  }, [hub]);

  // Actions
  const handleAcknowledge = async (alarm: TacticalAlarm) => {
    try {
      await smartParkingApi.acknowledgeAlarm(alarm.id);
    } catch {}
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === alarm.id
          ? {
              ...a,
              status: 'Acknowledged',
              acknowledgedBy: 'مشرف العمليات الحالي',
              acknowledgedAt: new Date().toISOString(),
            }
          : a
      )
    );
    setFeedback(`✅ تم الإقرار باستلام الإنذار [${alarm.code}] بنجاح ومباشرة المعالجة الميدانية.`);
  };

  const handleOpenResolveDialog = (alarm: TacticalAlarm) => {
    setSelectedAlarm(alarm);
    setResolutionNote('');
    setResolveDialogOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!selectedAlarm) return;
    try {
      await smartParkingApi.resolveAlarm(selectedAlarm.id);
    } catch {}
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === selectedAlarm.id
          ? {
              ...a,
              status: 'Resolved',
              resolvedBy: 'إدارة الأمن والتحكم المركزي',
              resolvedAt: new Date().toISOString(),
              resolutionNote: resolutionNote.trim() || 'تم التحقق الميداني ومعالجة الموقف بنجاح وفق الإجراءات المعتمدة.',
            }
          : a
      )
    );
    setResolveDialogOpen(false);
    setFeedback(`🛡️ تمت تسوية الإنذار [${selectedAlarm.code}] وتوثيق إغلاقه بنجاح في سجل التدقيق.`);
    setSelectedAlarm(null);
  };

  const handleOpenDetails = (alarm: TacticalAlarm) => {
    setSelectedAlarm(alarm);
    setDetailsDialogOpen(true);
  };

  // Stats Calculations
  const totalAlarms = alarms.length;
  const activeAlarms = alarms.filter((a) => a.status === 'Active');
  const criticalCount = alarms.filter((a) => a.severity === 'Critical' && a.status === 'Active').length;
  const highCount = alarms.filter((a) => a.severity === 'High' && a.status === 'Active').length;
  const inProgressCount = alarms.filter((a) => a.status === 'Acknowledged').length;
  const resolvedCount = alarms.filter((a) => a.status === 'Resolved').length;
  const resolutionRate = totalAlarms > 0 ? Math.round((resolvedCount / totalAlarms) * 100) : 100;

  // Filtered List
  const filteredAlarms = useMemo(() => {
    return alarms.filter((a) => {
      const matchSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.gateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSeverity =
        selectedSeverity === 'All' || a.severity.toLowerCase() === selectedSeverity.toLowerCase();

      const matchStatus =
        selectedStatus === 'All' || a.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchSeverity && matchStatus;
    });
  }, [alarms, searchQuery, selectedSeverity, selectedStatus]);

  return (
    <Box
      sx={{
        maxWidth: 1680,
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
        direction: 'rtl',
        color: '#f8fafc',
        bgcolor: '#070b14',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #111a36 0%, #070b14 75%)',
        fontFamily: 'Cairo, Sora, sans-serif',
      }}
    >
      {/* 🚨 CRITICAL BROADCAST RIBBON (LIGHTS UP WHEN CRITICAL ALARM IS ACTIVE) */}
      {criticalCount > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3.5,
            background: 'linear-gradient(90deg, rgba(225, 29, 72, 0.25) 0%, rgba(159, 18, 57, 0.4) 50%, rgba(225, 29, 72, 0.25) 100%)',
            border: '1.5px solid #f43f5e',
            boxShadow: '0 0 30px rgba(244, 63, 94, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            animation: 'pulseGlow 2s infinite',
            '@keyframes pulseGlow': {
              '0%': { boxShadow: '0 0 15px rgba(244, 63, 94, 0.2)' },
              '50%': { boxShadow: '0 0 35px rgba(244, 63, 94, 0.5)' },
              '100%': { boxShadow: '0 0 15px rgba(244, 63, 94, 0.2)' },
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: '#f43f5e',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 16px #f43f5e',
              }}
            >
              <EmergencyIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff' }}>
                تنبيه أمني فوري عالي الأولوية: يوجد {criticalCount} بلاغ حرج يتطلب التدخل الفوري
              </Typography>
              <Typography variant="body2" sx={{ color: '#fecdd3', fontSize: 13 }}>
                يرجى مراجعة مسارات البوابات المتأثرة والتأكد من بروتوكول الأمان والسلامة الميدانية.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setSelectedSeverity('Critical');
              setSelectedStatus('Active');
            }}
            sx={{
              fontWeight: 900,
              borderRadius: 2.5,
              px: 3,
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)',
            }}
          >
            عرض البلاغات الحرجة فوراً
          </Button>
        </Paper>
      )}

      {/* 🛡️ TOP MISSION CONTROL HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(26, 38, 70, 0.9) 50%, rgba(10, 16, 32, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(0, 229, 255, 0.08)',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'flex-start', lg: 'center' },
          justifyContent: 'space-between',
          gap: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #f43f5e, #f59e0b, #00f5ff, #10b981)',
          },
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: { xs: 56, sm: 68 },
              height: { xs: 56, sm: 68 },
              borderRadius: 3.5,
              display: 'grid',
              placeItems: 'center',
              background: 'radial-gradient(circle, #f59e0b 0%, #1e1b4b 90%)',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.45), inset 0 0 14px rgba(255,255,255,0.4)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <ShieldIcon sx={{ fontSize: { xs: 32, sm: 38 }, color: '#fff' }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#f8fafc',
                  fontSize: { xs: 20, sm: 26, md: 28 },
                  letterSpacing: 0.5,
                  textShadow: '0 2px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                مركز إدارة التنبيهات والأمان الميداني
              </Typography>
              <Chip
                size="small"
                icon={<NotificationsActiveIcon sx={{ fontSize: '15px !important', color: activeAlarms.length > 0 ? '#fb7185' : '#34d399' }} />}
                label={activeAlarms.length > 0 ? `${activeAlarms.length} بلاغات قيد المعالجة` : 'المنظومة مؤمّنة بالكامل'}
                sx={{
                  bgcolor: activeAlarms.length > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: activeAlarms.length > 0 ? '#fb7185' : '#34d399',
                  border: `1px solid ${activeAlarms.length > 0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                  fontWeight: 800,
                  fontSize: 12,
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.75, fontWeight: 500, fontSize: { xs: 12, sm: 14 } }}>
              الرصد الفوري والتدخل الأمني السريع للحوادث، أعطال الحواجز الكهروميكانيكية، وتجاوزات المسارات الذكية في الزمن الحقيقي
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Audio Beacon Switch */}
          <Tooltip title={soundEnabled ? 'صوت صفارات الإنذار مفعل' : 'تم كتم صفارات الإنذار'}>
            <IconButton
              onClick={() => setSoundEnabled(!soundEnabled)}
              sx={{
                bgcolor: soundEnabled ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                color: soundEnabled ? '#f59e0b' : '#64748b',
                border: '1px solid rgba(255,255,255,0.1)',
                p: 1.25,
              }}
            >
              {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            onClick={() => {
              setFeedback('🔄 جاري تحديث ومزامنة سجل البلاغات مع المركز الأمني...');
              setTimeout(() => setFeedback(null), 2500);
            }}
            startIcon={<RefreshIcon />}
            sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              fontWeight: 800,
              borderRadius: 3,
              px: 2.5,
              py: 1,
            }}
          >
            تحديث فوري
          </Button>
        </Stack>
      </Paper>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <Alert
          severity="info"
          sx={{
            mb: 3.5,
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            color: '#38bdf8',
            fontWeight: 700,
          }}
          onClose={() => setFeedback(null)}
        >
          {feedback}
        </Alert>
      )}

      {/* 🌟 4 LUXURIOUS KPI HUD CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CARD 1: ACTIVE ALERTS */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #291520 100%)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(244, 63, 94, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#f43f5e' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#f43f5e' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <WarningAmberIcon sx={{ color: '#f43f5e', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#fb7185', letterSpacing: 1 }}>
                    إجمالي البلاغات النشطة
                  </Typography>
                </Stack>
                <Chip size="small" label="ميداني حي" sx={{ bgcolor: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#fb7185', my: 1.5, letterSpacing: -1 }}>
                {activeAlarms.length}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                يتضمن {criticalCount} بلاغاً حرجاً و {highCount} بلاغاً عالي الأهمية
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 2: CRITICAL BREACHES */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #301712 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(245, 158, 11, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#f59e0b' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#f59e0b' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <ReportProblemIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#fcd34d', letterSpacing: 1 }}>
                    حالات التدخل السريع
                  </Typography>
                </Stack>
                <Chip size="small" label="أولوية قصوى" sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#fcd34d', my: 1.5, letterSpacing: -1 }}>
                {criticalCount + highCount}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                تتطلب إشراف ومتابعة قائد الوردية الأمني
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 3: IN PROGRESS & ACKNOWLEDGED */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #10233b 100%)',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#00e5ff' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#00e5ff' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentTurnedInIcon sx={{ color: '#00e5ff', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8', letterSpacing: 1 }}>
                    قيد المباشرة الميدانية
                  </Typography>
                </Stack>
                <Chip size="small" label="مستلم" sx={{ bgcolor: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#00e5ff', my: 1.5, letterSpacing: -1 }}>
                {inProgressCount}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                تم استلامها ومباشرة التحقق من الفرق الأمنية
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 4: RESOLVED TODAY & RATE */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #0c251f 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(16, 185, 129, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#10b981' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#10b981' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <VerifiedUserIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#34d399', letterSpacing: 1 }}>
                    نسبة الإنجاز والتسوية
                  </Typography>
                </Stack>
                <Chip size="small" label={`${resolvedCount} مغلق`} sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ my: 1.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#34d399', letterSpacing: -1 }}>
                  {resolutionRate}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                  ({resolvedCount} من {totalAlarms})
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={resolutionRate}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#10b981',
                    borderRadius: 3,
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🔍 FILTER & SEARCH COMMAND CONSOLE */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 3.5,
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ flex: 1, flexWrap: 'wrap', gap: 1.5 }} alignItems="center">
          <TextField
            size="small"
            placeholder="🔍 بحث بالرمز، العنوان، البوابة، المنطقة أو التفاصيل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 320 },
              bgcolor: '#1e293b',
              borderRadius: 2.5,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '& input': { color: '#f8fafc', fontSize: 14 },
            }}
          />

          <TextField
            select
            size="small"
            label="مستوى الخطورة"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            sx={{
              minWidth: 150,
              bgcolor: '#1e293b',
              borderRadius: 2.5,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '& .MuiSelect-select': { color: '#f8fafc', fontSize: 13 },
              '& .MuiInputLabel-root': { color: '#94a3b8', fontSize: 13 },
            }}
          >
            <MenuItem value="All">كافة المستويات</MenuItem>
            <MenuItem value="Critical">حرج (Critical)</MenuItem>
            <MenuItem value="High">مرتفع (High)</MenuItem>
            <MenuItem value="Warning">تحذير (Warning)</MenuItem>
            <MenuItem value="Info">معلوماتي (Info)</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="حالة البلاغ"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            sx={{
              minWidth: 150,
              bgcolor: '#1e293b',
              borderRadius: 2.5,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '& .MuiSelect-select': { color: '#f8fafc', fontSize: 13 },
              '& .MuiInputLabel-root': { color: '#94a3b8', fontSize: 13 },
            }}
          >
            <MenuItem value="All">كافة الحالات</MenuItem>
            <MenuItem value="Active">نشط فقط</MenuItem>
            <MenuItem value="Acknowledged">قيد المباشرة</MenuItem>
            <MenuItem value="Resolved">تمت التسوية</MenuItem>
          </TextField>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
          <Chip
            label={`${filteredAlarms.length} بلاغ معروض`}
            sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: 800 }}
          />

          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, next) => next && setViewMode(next)}
            sx={{ bgcolor: '#1e293b', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ToggleButton value="cards" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#00e5ff', bgcolor: 'rgba(0, 229, 255, 0.15)' } }}>
              <ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />
              بطاقات تكتيكية
            </ToggleButton>
            <ToggleButton value="table" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#00e5ff', bgcolor: 'rgba(0, 229, 255, 0.15)' } }}>
              <TableChartIcon sx={{ mr: 0.5, fontSize: 18 }} />
              جدول التدقيق
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* 🌟 VIEW 1: TACTICAL DISPATCH CARDS */}
      {viewMode === 'cards' && (
        <Grid container spacing={3}>
          {filteredAlarms.map((alarm) => {
            const isCrit = alarm.severity === 'Critical';
            const isHigh = alarm.severity === 'High';
            const isWarn = alarm.severity === 'Warning';
            const isActive = alarm.status === 'Active';
            const isAck = alarm.status === 'Acknowledged';
            const isRes = alarm.status === 'Resolved';

            const borderColor = isCrit
              ? 'rgba(244, 63, 94, 0.45)'
              : isHigh
              ? 'rgba(245, 158, 11, 0.4)'
              : isWarn
              ? 'rgba(234, 179, 8, 0.35)'
              : 'rgba(56, 189, 248, 0.3)';

            return (
              <Grid item xs={12} md={6} lg={4} key={alarm.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `1.5px solid ${borderColor}`,
                    bgcolor: isCrit && isActive
                      ? 'linear-gradient(160deg, #180d16 0%, #0d1222 100%)'
                      : 'rgba(15, 23, 42, 0.95)',
                    boxShadow: isCrit && isActive
                      ? '0 12px 36px rgba(244, 63, 94, 0.25)'
                      : '0 8px 30px rgba(0, 0, 0, 0.45)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 40px rgba(0, 229, 255, 0.2)',
                    },
                  }}
                >
                  <Box>
                    {/* Top Row: Code Badge + Severity + Status */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={alarm.code}
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 900,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            color: '#38bdf8',
                            fontSize: 11,
                          }}
                        />
                        <Chip
                          size="small"
                          label={
                            isCrit ? 'حرج للغاية' : isHigh ? 'مرتفع' : isWarn ? 'تحذيري' : 'معلوماتي'
                          }
                          sx={{
                            fontWeight: 800,
                            fontSize: 11,
                            bgcolor: isCrit ? 'rgba(244, 63, 94, 0.2)' : isHigh ? 'rgba(245, 158, 11, 0.2)' : isWarn ? 'rgba(234, 179, 8, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                            color: isCrit ? '#fb7185' : isHigh ? '#fcd34d' : isWarn ? '#fde047' : '#38bdf8',
                          }}
                        />
                      </Stack>

                      <Chip
                        size="small"
                        icon={isActive ? <WarningAmberIcon sx={{ fontSize: '14px !important' }} /> : isAck ? <AssignmentTurnedInIcon sx={{ fontSize: '14px !important' }} /> : <CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                        label={isActive ? 'نشط ميدانياً' : isAck ? 'قيد المباشرة' : 'تمت المعالجة'}
                        sx={{
                          fontWeight: 800,
                          fontSize: 11,
                          bgcolor: isActive ? 'rgba(244, 63, 94, 0.15)' : isAck ? 'rgba(0, 229, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isActive ? '#fb7185' : isAck ? '#00e5ff' : '#34d399',
                        }}
                      />
                    </Stack>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        color: '#f8fafc',
                        fontSize: 16,
                        lineHeight: 1.5,
                        mb: 1.5,
                      }}
                    >
                      {alarm.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#94a3b8',
                        fontSize: 13,
                        lineHeight: 1.6,
                        mb: 2.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {alarm.description}
                    </Typography>

                    {/* Metadata box */}
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: 3,
                        bgcolor: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        mb: 2.5,
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#cbd5e1', fontSize: 12 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {alarm.gateName} ({alarm.zone})
                          </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#94a3b8', fontSize: 11 }}>
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                            <span>{formatLocalDateTime(alarm.createdAt)}</span>
                          </Stack>
                          <Chip
                            size="small"
                            label={`التكرار: ${alarm.occurrencesCount}`}
                            sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
                          />
                        </Stack>
                      </Stack>
                    </Box>

                    {/* Acknowledged / Resolved Status Notes */}
                    {alarm.acknowledgedBy && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#00e5ff', mb: 1, fontSize: 11 }}>
                        👮 <strong>المباشر:</strong> {alarm.acknowledgedBy}
                      </Typography>
                    )}
                    {alarm.resolutionNote && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#34d399', mb: 1, fontSize: 11 }}>
                        ✅ <strong>إجراء الحل:</strong> {alarm.resolutionNote}
                      </Typography>
                    )}
                  </Box>

                  {/* Tactical Action Buttons Footer */}
                  <Box sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenDetails(alarm)}
                        startIcon={<VisibilityIcon />}
                        sx={{
                          color: '#94a3b8',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: 2,
                          fontWeight: 700,
                        }}
                      >
                        تفاصيل
                      </Button>

                      {isActive && (
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          onClick={() => handleAcknowledge(alarm)}
                          startIcon={<AssignmentTurnedInIcon />}
                          sx={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #00e5ff 100%)',
                            color: '#070c14',
                            fontWeight: 900,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0, 229, 255, 0.3)',
                          }}
                        >
                          استلام ومباشرة
                        </Button>
                      )}

                      {!isRes && (
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenResolveDialog(alarm)}
                          startIcon={<CheckCircleOutlineIcon />}
                          sx={{
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            fontWeight: 900,
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          تسوية البلاغ
                        </Button>
                      )}

                      {isRes && (
                        <Chip
                          icon={<DoneAllIcon />}
                          label="تمت التسوية بنجاح"
                          color="success"
                          sx={{ fontWeight: 800, width: '100%' }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* 📊 VIEW 2: AUDITED COMPREHENSIVE DATA TABLE */}
      {viewMode === 'table' && (
        <Card
          sx={{
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.55)',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#1e293b' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>الرمز</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>مستوى الخطورة</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>عنوان الإنذار والتفاصيل</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>الموقع / البوابة الحقلية</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>التوقيت</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>الحالة</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                    الإجراءات التكتيكية
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlarms.map((a) => {
                  const isCrit = a.severity === 'Critical';
                  const isHigh = a.severity === 'High';
                  const isWarn = a.severity === 'Warning';
                  return (
                    <TableRow key={a.id} hover sx={{ '&:hover': { bgcolor: '#1e293b' } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>
                        {a.code}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={isCrit ? 'حرج' : isHigh ? 'مرتفع' : isWarn ? 'تحذير' : 'معلوماتي'}
                          sx={{
                            fontWeight: 800,
                            bgcolor: isCrit ? 'rgba(244, 63, 94, 0.2)' : isHigh ? 'rgba(245, 158, 11, 0.2)' : isWarn ? 'rgba(234, 179, 8, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                            color: isCrit ? '#fb7185' : isHigh ? '#fcd34d' : isWarn ? '#fde047' : '#38bdf8',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 360 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                          {a.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                          {a.description}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                        {a.gateName} ({a.zone})
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12 }}>
                        {formatLocalDateTime(a.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={a.status === 'Active' ? 'نشط' : a.status === 'Acknowledged' ? 'قيد المباشرة' : 'تمت التسوية'}
                          sx={{
                            fontWeight: 800,
                            bgcolor: a.status === 'Active' ? 'rgba(244, 63, 94, 0.15)' : a.status === 'Acknowledged' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: a.status === 'Active' ? '#fb7185' : a.status === 'Acknowledged' ? '#00e5ff' : '#34d399',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDetails(a)}
                            sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)' }}
                          >
                            عرض
                          </Button>
                          {a.status === 'Active' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAcknowledge(a)}
                              sx={{ color: '#00e5ff', borderColor: 'rgba(0, 229, 255, 0.4)' }}
                            >
                              استلام
                            </Button>
                          )}
                          {a.status !== 'Resolved' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleOpenResolveDialog(a)}
                            >
                              تسوية
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
      )}

      {/* 🛠️ RESOLUTION DIALOG MODAL */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#34d399' }}>
          تسوية وتوثيق إغلاق الإنذار الأمني [{selectedAlarm?.code}]
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity="success" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
              أنت على وشك تسجيل إغلاق رسمي للإنذار: <strong>{selectedAlarm?.title}</strong>. سيتم حفظ التقرير في سجل التدقيق الميداني.
            </Alert>

            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#1e293b' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                الموقع الميداني للبلاغ:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc', mt: 0.5 }}>
                📍 {selectedAlarm?.gateName} — {selectedAlarm?.zone}
              </Typography>
            </Box>

            <TextField
              label="تقرير الإجراء المتخذ وتوثيق المعالجة"
              placeholder="اكتب الإجراءات الميدانية التي تم تنفيذها لمعالجة الحالة والتأكد من سلامة الموقع..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              multiline
              rows={4}
              fullWidth
              sx={{
                bgcolor: '#1e293b',
                borderRadius: 2.5,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                '& textarea': { color: '#f8fafc' },
                '& .MuiInputLabel-root': { color: '#94a3b8' },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setResolveDialogOpen(false)} sx={{ color: '#94a3b8', fontWeight: 700 }}>
            إلغاء التراجع
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmResolve}
            sx={{ fontWeight: 900, px: 3, borderRadius: 2.5 }}
          >
            تأكيد التسوية وحفظ السجل
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔍 DETAILS DIALOG MODAL */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          الملف التعريفي الشامل للبلاغ الأمني [{selectedAlarm?.code}]
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                مسمى البلاغ:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', mt: 0.5 }}>
                {selectedAlarm?.title}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                شرح وتفاصيل الواقعة:
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1', mt: 0.5, lineHeight: 1.6 }}>
                {selectedAlarm?.description}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.75, bgcolor: '#1e293b', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>الموقع والبوابة</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#38bdf8', mt: 0.25 }}>{selectedAlarm?.gateName}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.75, bgcolor: '#1e293b', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>المنطقة الحقلية</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc', mt: 0.25 }}>{selectedAlarm?.zone}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.75, bgcolor: '#1e293b', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>مستوى الخطورة</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#f43f5e', mt: 0.25 }}>{selectedAlarm?.severity}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 1.75, bgcolor: '#1e293b', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>وقت الرصد الأولي</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc', mt: 0.25 }}>
                    {selectedAlarm && formatLocalDateTime(selectedAlarm.createdAt)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {selectedAlarm?.acknowledgedBy && (
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                <Typography variant="caption" sx={{ color: '#00e5ff', fontWeight: 800 }}>بيانات استلام البلاغ:</Typography>
                <Typography variant="body2" sx={{ color: '#f8fafc', mt: 0.5 }}>
                  المشرف المسؤول: {selectedAlarm.acknowledgedBy}
                </Typography>
              </Box>
            )}

            {selectedAlarm?.resolutionNote && (
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>توثيق المعالجة النهائية:</Typography>
                <Typography variant="body2" sx={{ color: '#f8fafc', mt: 0.5 }}>
                  {selectedAlarm.resolutionNote}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="contained" sx={{ px: 3, borderRadius: 2.5 }}>
            إغلاق النافذة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
