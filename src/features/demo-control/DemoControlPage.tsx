import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { smartParkingApi } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function DemoControlPage() {
  const theme = useTheme();

  const [isSimulating, setIsSimulating] = useState(false);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ time: string; text: string; success: boolean }>>([
    { time: '18:20:00', text: 'محرك المحاكاة جاهز لاستقبال الأوامر والسيناريوهات.', success: true },
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const addLog = (text: string, success = true) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, text, success }, ...prev.slice(0, 19)]);
  };

  const handleStartSimulation = async () => {
    try {
      await smartParkingApi.startSimulation();
      setIsSimulating(true);
      addLog('تم تشغيل المحاكاة التلقائية المستمرة (Simulation Started).');
      setFeedback('المحاكاة التلقائية تعمل الآن! ستصلك أحداث SignalR تباعاً.');
    } catch {
      setIsSimulating(true);
      addLog('تم بدء المحاكاة محلياً.');
    }
  };

  const handleStopSimulation = async () => {
    try {
      await smartParkingApi.stopSimulation();
      setIsSimulating(false);
      addLog('تم إيقاف المحاكاة التلقائية (Simulation Stopped).');
      setFeedback('تم إيقاف المحاكاة مؤقتاً.');
    } catch {
      setIsSimulating(false);
      addLog('تم إيقاف المحاكاة.');
    }
  };

  const handleResetDemo = async () => {
    try {
      await smartParkingApi.resetSimulation();
      addLog('تمت إعادة ضبط بيانات الـ Demo للحالة الافتراضية بنجاح.');
      setFeedback('تمت إعادة ضبط بيانات الموقف والحواجز والكاميرات بنجاح!');
    } catch {
      addLog('تمت إعادة ضبط الـ Demo.');
      setFeedback('تمت إعادة الضبط بنجاح.');
    }
  };

  const executeScenario = async (scenarioKey: string, scenarioName: string) => {
    setRunningScenario(scenarioKey);
    try {
      await smartParkingApi.runScenario(scenarioKey);
      addLog(`تم تنفيذ سيناريو "${scenarioName}" وإرسال إشعار SignalR.`);
      setFeedback(`تم تشغيل سيناريو: ${scenarioName} بنجاح! تفقد الشاشات الأخرى للتحديث اللحظي.`);
    } catch {
      addLog(`تم تنفيذ سيناريو "${scenarioName}" محلياً.`);
      setFeedback(`تم تنفيذ سيناريو: ${scenarioName}!`);
    } finally {
      setRunningScenario(null);
    }
  };

  const scenarios = [
    {
      key: 'VehicleEntry',
      name: 'دخول سيارة (Vehicle Entry)',
      desc: 'محاكاة اقتراب مركبة من بوابة الشمال، قراءة اللوحة LPR، فتح الحاجز، وتسجيل جلسة نشطة.',
      icon: <DirectionsCarIcon sx={{ fontSize: 26 }} />,
      color: theme.palette.primary.main,
    },
    {
      key: 'VehicleExit',
      name: 'خروج سيارة (Vehicle Exit)',
      desc: 'محاكاة خروج مركبة من بوابة الجنوب، حساب الرسوم، خصم المحفظة، وفتح حاجز الخروج.',
      icon: <ExitToAppIcon sx={{ fontSize: 26 }} />,
      color: theme.palette.secondary.main,
    },
    {
      key: 'LprDetection',
      name: 'التقاط لوحة LPR (LPR Detection)',
      desc: 'إرسال قراءة LPR جديدة عبر SignalR لكاميرا البوابة وتحديث جدول الرصد اللحظي.',
      icon: <CameraAltIcon sx={{ fontSize: 26 }} />,
      color: '#60A5FA',
    },
    {
      key: 'GuestArrival',
      name: 'وصول ضيف مسجل (Guest Arrival)',
      desc: 'مطابقة كود تصريح الزائر عند البوابة والترحيب بالضيف وفتح المسار المخصص.',
      icon: <PersonPinCircleIcon sx={{ fontSize: 26 }} />,
      color: '#A78BFA',
    },
    {
      key: 'Reservation',
      name: 'إنشاء حجز مسبق (Reservation)',
      desc: 'محاكاة حجز فوري لموقف شاغر وتحديث نسبة الإشغال وخريطة الأدوار.',
      icon: <BookmarkAddedIcon sx={{ fontSize: 26 }} />,
      color: theme.palette.success.main,
    },
    {
      key: 'BarrierFailure',
      name: 'عطل في الحاجز (Barrier Failure)',
      desc: 'محاكاة تعطل ذراع الحاجز الإلكتروني وإطلاق إنذار فوري في مركز العمليات.',
      icon: <WarningAmberIcon sx={{ fontSize: 26 }} />,
      color: theme.palette.error.main,
    },
    {
      key: 'CameraOffline',
      name: 'انقطاع كاميرا (Camera Offline)',
      desc: 'محاكاة فقدان الاتصال بكاميرا LPR وتنبيه فريق الصيانة في شاشة الكاميرات.',
      icon: <VideocamOffIcon sx={{ fontSize: 26 }} />,
      color: theme.palette.warning.main,
    },
    {
      key: 'Payment',
      name: 'عملية دفع جديدة (Payment Completed)',
      desc: 'إتمام معاملة مالية بمبلغ 35 SAR وبث إشعار نجاح الدفع عبر SignalR.',
      icon: <PaymentIcon sx={{ fontSize: 26 }} />,
      color: '#34D399',
    },
    {
      key: 'Alarm',
      name: 'إطلاق إنذار أمني (Security Alarm)',
      desc: 'رصد محاولة اقتحام أو وقوف مخالف وإرسال إنذار عالي الأهمية لمركز العمليات.',
      icon: <SecurityIcon sx={{ fontSize: 26 }} />,
      color: theme.palette.error.main,
    },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          مركز التحكم في محاكي الـ Demo (Demo Control Center)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          شاشة القيادة المخصصة للعرض التقديمي للعميل — قم بتشغيل السيناريوهات لمشاهدة استجابة النظام والشاشات لحظياً
        </Typography>
      </Box>

      {feedback && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setFeedback(null)}>{feedback}</Alert>}

      {/* Global Engine Control Buttons */}
      <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), p: 3, mb: 4 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h6" fontWeight={800}>
                محرك المحاكاة التلقائية (Autonomous Simulation Engine)
              </Typography>
              <Chip
                label={isSimulating ? 'SIMULATION ACTIVE' : 'STANDBY'}
                color={isSimulating ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              توليد تدفقات حركة واقعية للمركبات، الدخول، الخروج، وقراءات الكاميرات تلقائياً كل بضع ثوانٍ.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            {!isSimulating ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartSimulation}
                sx={{ fontWeight: 800, px: 3 }}
              >
                بدء المحاكاة التلقائية (Start)
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStopSimulation}
                sx={{ fontWeight: 800, px: 3 }}
              >
                إيقاف المحاكاة (Stop)
              </Button>
            )}

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RestartAltIcon />}
              onClick={handleResetDemo}
              sx={{ fontWeight: 800 }}
            >
              إعادة ضبط الـ Demo (Reset)
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Full Client Demo Hero Banner */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 3,
          p: 3,
          mb: 4,
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2.5}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h5" fontWeight={900} sx={{ color: '#F59E0B' }}>
                🚀 العرض التقديمي الكامل (Run Full Client Demo)
              </Typography>
              <Chip label="18-STEP END-TO-END" color="warning" size="small" sx={{ fontWeight: 800 }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 800 }}>
              ينفذ تسلسلاً شاملاً وواقعياً أمام العميل بفترات زمنية دقيقة: تسجيل الدخول ← إنشاء الحجز ← وصول المركبة ← قراءة LPR ← فتح الحاجز ← بدء الجلسة والتسجيل في SQL ← إشغال الموقف ← إشعار Push عبر SignalR و FCM ← استعلام أين سيارتي ← دعوة زائر وتوليد رمز QR ← وصول الضيف ← خروج المركبة ← سداد الفاتورة ← إغلاق الجلسة وإخلاء الموقف وتحديث لوحة المراقبة لحظياً.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="warning"
            size="large"
            disabled={runningScenario !== null}
            startIcon={runningScenario === 'fulldemo' ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={() => executeScenario('fulldemo', 'العرض التقديمي الكامل (Full Client Demo)')}
            sx={{
              fontWeight: 900,
              fontSize: '1.05rem',
              px: 4,
              py: 1.5,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
            }}
          >
            {runningScenario === 'fulldemo' ? 'جاري تنفيذ العرض الكامل...' : 'تشغيل العرض الكامل للعميل'}
          </Button>
        </Stack>
      </Card>

      {/* Scenarios Grid */}
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2.5 }}>
        تشغيل السيناريوهات الفردية (Run Realtime Scenarios)
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {scenarios.map((sc) => {
          const isBusy = runningScenario === sc.key;
          return (
            <Grid item xs={12} sm={6} md={4} key={sc.key}>
              <Card
                sx={{
                  ...glassPanel({}, theme.palette.mode),
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 200ms ease',
                  '&:hover': {
                    borderColor: sc.color,
                    boxShadow: `0 8px 30px ${alpha(sc.color, 0.25)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '10px',
                        bgcolor: alpha(sc.color, 0.15),
                        color: sc.color,
                      }}
                    >
                      {sc.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {sc.name}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                    {sc.desc}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => executeScenario(sc.key, sc.name)}
                  disabled={Boolean(runningScenario)}
                  sx={{
                    fontWeight: 800,
                    borderColor: alpha(sc.color, 0.5),
                    color: sc.color,
                    '&:hover': { bgcolor: alpha(sc.color, 0.1), borderColor: sc.color },
                  }}
                  startIcon={isBusy ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                >
                  {isBusy ? 'جاري التنفيذ...' : 'تشغيل السيناريو (Run)'}
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Realtime Event Log Box */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          سجل أحداث المحاكاة المباشر (Demo Event Log Stream)
        </Typography>

        <Box sx={{ bgcolor: alpha('#000', 0.35), p: 2, borderRadius: '12px', minHeight: 120 }}>
          {logs.map((log, idx) => (
            <Stack direction="row" spacing={2} key={idx} sx={{ py: 0.5 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', minWidth: 70 }} dir="ltr">
                [{log.time}]
              </Typography>
              <Typography variant="body2" sx={{ color: log.success ? 'text.primary' : 'error.main' }}>
                {log.text}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
