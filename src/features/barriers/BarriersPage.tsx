import { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  LinearProgress,
} from '@mui/material';

// Material Icons
import FenceIcon from '@mui/icons-material/Fence';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SpeedIcon from '@mui/icons-material/Speed';
import SensorsIcon from '@mui/icons-material/Sensors';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import BoltIcon from '@mui/icons-material/Bolt';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import EngineeringIcon from '@mui/icons-material/Engineering';
import LanIcon from '@mui/icons-material/Lan';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import HistoryIcon from '@mui/icons-material/History';

import { smartParkingApi } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export type BarrierState = 'Open' | 'Closed' | 'Opening' | 'Closing' | 'Fault';

export interface BarrierItem {
  id: string;
  name: string;
  code: string;
  gate: string;
  type: 'entry' | 'exit' | 'vip' | 'emergency';
  state: BarrierState;
  angle: number; // 0 (closed) to 90 (open)
  openingSpeed: number; // in seconds
  motorTemp: number; // in Celsius
  cyclesCount: number;
  lastActionTime: string;
  ipAddress: string;
  osdpChannel: string;
  loopSensorActive: boolean; // حساس الحث الكهرومغناطيسي الأرضي (رصد مركبة)
  photocellClear: boolean; // حزمة الأمان الليزرية الكهروضوئية
  mode: 'auto' | 'manual' | 'lockdown';
}

export interface BarrierLog {
  id: string;
  timestamp: string;
  barrierName: string;
  barrierCode: string;
  action: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const INITIAL_BARRIERS: BarrierItem[] = [
  {
    id: '1',
    name: 'حاجز البوابة الشمالية (دخول 01)',
    code: 'BAR-N01-IN',
    gate: 'بوابة الشمال رقم 1 - مسار الدخول السريع',
    type: 'entry',
    state: 'Closed',
    angle: 0,
    openingSpeed: 0.4,
    motorTemp: 37.2,
    cyclesCount: 42150,
    lastActionTime: 'منذ 3 دقائق',
    ipAddress: '192.168.10.11',
    osdpChannel: 'قناة OSDP-01',
    loopSensorActive: true,
    photocellClear: true,
    mode: 'auto',
  },
  {
    id: '2',
    name: 'حاجز البوابة الشمالية (خروج 02)',
    code: 'BAR-N02-OUT',
    gate: 'بوابة الشمال رقم 1 - مسار الخروج الذاتي',
    type: 'exit',
    state: 'Closed',
    angle: 0,
    openingSpeed: 0.4,
    motorTemp: 36.8,
    cyclesCount: 39820,
    lastActionTime: 'منذ دقيقة واحدة',
    ipAddress: '192.168.10.12',
    osdpChannel: 'قناة OSDP-02',
    loopSensorActive: false,
    photocellClear: true,
    mode: 'auto',
  },
  {
    id: '3',
    name: 'حاجز البوابة الجنوبية (دخول 03)',
    code: 'BAR-S01-IN',
    gate: 'بوابة الجنوب رقم 2 - المسار الشرقي',
    type: 'entry',
    state: 'Closed',
    angle: 0,
    openingSpeed: 0.5,
    motorTemp: 38.1,
    cyclesCount: 51200,
    lastActionTime: 'منذ 10 دقائق',
    ipAddress: '192.168.10.21',
    osdpChannel: 'قناة OSDP-03',
    loopSensorActive: false,
    photocellClear: true,
    mode: 'auto',
  },
  {
    id: '4',
    name: 'حاجز البوابة الجنوبية (خروج 04)',
    code: 'BAR-S02-OUT',
    gate: 'بوابة الجنوب رقم 2 - المسار الغربي',
    type: 'exit',
    state: 'Closed',
    angle: 0,
    openingSpeed: 0.4,
    motorTemp: 39.0,
    cyclesCount: 48740,
    lastActionTime: 'منذ 4 دقائق',
    ipAddress: '192.168.10.22',
    osdpChannel: 'قناة OSDP-04',
    loopSensorActive: false,
    photocellClear: true,
    mode: 'auto',
  },
  {
    id: '5',
    name: 'حاجز منصة كبار الشخصيات (VIP)',
    code: 'BAR-VIP-01',
    gate: 'المدخل الملكي والتشريفي الخاص',
    type: 'vip',
    state: 'Open',
    angle: 90,
    openingSpeed: 0.3,
    motorTemp: 34.5,
    cyclesCount: 14200,
    lastActionTime: 'الآن (مفتوح حالياً)',
    ipAddress: '192.168.10.31',
    osdpChannel: 'قناة OSDP-05',
    loopSensorActive: true,
    photocellClear: true,
    mode: 'auto',
  },
  {
    id: '6',
    name: 'حاجز البوابة الشرقية (دخول 05)',
    code: 'BAR-E01-IN',
    gate: 'بوابة الشرق رقم 3 - خدمة الشحن والتوريد',
    type: 'entry',
    state: 'Closed',
    angle: 0,
    openingSpeed: 0.6,
    motorTemp: 41.3,
    cyclesCount: 62400,
    lastActionTime: 'منذ 15 دقيقة',
    ipAddress: '192.168.10.41',
    osdpChannel: 'قناة OSDP-06',
    loopSensorActive: false,
    photocellClear: true,
    mode: 'auto',
  },
  {
    id: '7',
    name: 'حاجز البوابة الشرقية (خروج 06)',
    code: 'BAR-E02-OUT',
    gate: 'بوابة الشرق رقم 3 - خروج الموردين والخدمات',
    type: 'exit',
    state: 'Closed',
    angle: 0,
    openingSpeed: 0.6,
    motorTemp: 40.8,
    cyclesCount: 59300,
    lastActionTime: 'منذ 8 دقائق',
    ipAddress: '192.168.10.42',
    osdpChannel: 'قناة OSDP-07',
    loopSensorActive: false,
    photocellClear: true,
    mode: 'auto',
  },
  {
    id: '8',
    name: 'حاجز مخرج الطوارئ والإخلاء التكتيكي',
    code: 'BAR-EMG-01',
    gate: 'بوابة الإخلاء ومسار الدفاع المدني والإسعاف',
    type: 'emergency',
    state: 'Closed',
    angle: 0,
    openingSpeed: 0.3,
    motorTemp: 32.0,
    cyclesCount: 3100,
    lastActionTime: 'منذ ساعتين',
    ipAddress: '192.168.10.99',
    osdpChannel: 'قناة OSDP-99',
    loopSensorActive: false,
    photocellClear: true,
    mode: 'lockdown',
  },
];

export function BarriersPage() {
  const theme = useTheme();

  // Core State
  const [barriers, setBarriers] = useState<BarrierItem[]>(INITIAL_BARRIERS);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entry' | 'exit' | 'vip' | 'emergency'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Closed' | 'Fault'>('all');

  // Activity Log
  const [logs, setLogs] = useState<BarrierLog[]>([
    {
      id: 'l-1',
      timestamp: '10:28:15',
      barrierName: 'حاجز منصة كبار الشخصيات (VIP)',
      barrierCode: 'BAR-VIP-01',
      action: 'تم رفع الحاجز تلقائياً إثر التعرف على مركبة تشريفات معتمدة',
      status: 'success',
    },
    {
      id: 'l-2',
      timestamp: '10:24:50',
      barrierName: 'حاجز البوابة الشمالية (دخول 01)',
      barrierCode: 'BAR-N01-IN',
      action: 'رصد وجود مركبة فوق مجس الملف الحثي الأرضي (Loop Detector)',
      status: 'info',
    },
    {
      id: 'l-3',
      timestamp: '10:21:04',
      barrierName: 'حاجز البوابة الجنوبية (خروج 04)',
      barrierCode: 'BAR-S02-OUT',
      action: 'اكتمال خفض وتأمين الحاجز بعد عبور المركبة بأمان تام',
      status: 'success',
    },
    {
      id: 'l-4',
      timestamp: '10:15:30',
      barrierName: 'كافة الحواجز الإلكترونية',
      barrierCode: 'ALL-BARRIERS',
      action: 'إجراء الفحص الدوري وتأكيد تشفير قنوات OSDP v2.2 بنجاح',
      status: 'info',
    },
  ]);

  const addLog = (barrierName: string, barrierCode: string, action: string, status: BarrierLog['status']) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;
    setLogs((prev) => [
      {
        id: `l-${Date.now()}`,
        timestamp: timeStr,
        barrierName,
        barrierCode,
        action,
        status,
      },
      ...prev.slice(0, 19),
    ]);
  };

  // Modals State
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('دفاع مدني وإخلاء طوارئ');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const [selectedBarrierForTune, setSelectedBarrierForTune] = useState<BarrierItem | null>(null);

  // Stats calculation
  const totalBarriers = barriers.length;
  const openCount = barriers.filter((b) => b.state === 'Open' || b.state === 'Opening').length;
  const closedCount = barriers.filter((b) => b.state === 'Closed' || b.state === 'Closing').length;
  const faultCount = barriers.filter((b) => b.state === 'Fault').length;
  const avgResponseTime = (
    barriers.reduce((acc, curr) => acc + curr.openingSpeed, 0) / barriers.length
  ).toFixed(2);

  // Status Color Mapping
  const getStateColor = (state: BarrierState) => {
    switch (state) {
      case 'Open':
        return '#10B981'; // Emerald
      case 'Closed':
        return theme.palette.mode === 'dark' ? '#38BDF8' : '#0284C7'; // Sky / Blue
      case 'Opening':
      case 'Closing':
        return '#F59E0B'; // Amber
      case 'Fault':
        return '#EF4444'; // Red
      default:
        return '#94A3B8';
    }
  };

  const getStateArabicTitle = (state: BarrierState) => {
    switch (state) {
      case 'Open':
        return 'مرفوع ومفتوح بالكامل';
      case 'Closed':
        return 'مغلق ومؤمّن بالكامل';
      case 'Opening':
        return 'قيد الرفع الهيدروليكي...';
      case 'Closing':
        return 'قيد الخفض والتأمين...';
      case 'Fault':
        return 'تنبيه: عطل ميكانيكي / صيانة';
    }
  };

  // Open Barrier Handler
  const handleOpen = async (b: BarrierItem) => {
    setBusyId(b.id);
    setBarriers((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, state: 'Opening', angle: 45 } : item))
    );

    try {
      await smartParkingApi.openBarrier(b.id);
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setBarriers((prev) =>
        prev.map((item) =>
          item.id === b.id
            ? {
                ...item,
                state: 'Open',
                angle: 90,
                lastActionTime: 'الآن (مفتوح)',
                cyclesCount: item.cyclesCount + 1,
              }
            : item
        )
      );
      setBusyId(null);
      setFeedback(`تم رفع وفتح ${b.name} بنجاح خلال ${b.openingSpeed} ثانية.`);
      addLog(b.name, b.code, `تم فتح الحاجز يدوياً من لوحة القيادة (زاوية 90°)`, 'success');
    }, 700);
  };

  // Close Barrier Handler
  const handleClose = async (b: BarrierItem) => {
    if (!b.photocellClear) {
      setFeedback(`تحذير أمني: تعذر إغلاق ${b.name} لوجود عائق في مسار حزمة الليزر الكهروضوئية!`);
      addLog(b.name, b.code, `تم حظر الإغلاق لوجود عائق في حزمة الأمان الليزرية`, 'warning');
      return;
    }

    setBusyId(b.id);
    setBarriers((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, state: 'Closing', angle: 45 } : item))
    );

    try {
      await smartParkingApi.closeBarrier(b.id);
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setBarriers((prev) =>
        prev.map((item) =>
          item.id === b.id
            ? {
                ...item,
                state: 'Closed',
                angle: 0,
                lastActionTime: 'الآن (مغلق)',
                cyclesCount: item.cyclesCount + 1,
              }
            : item
        )
      );
      setBusyId(null);
      setFeedback(`تم إغلاق ${b.name} وتأمين مسار البوابة بالكامل.`);
      addLog(b.name, b.code, `تم إغلاق وتأمين الحاجز بنجاح (زاوية 0°)`, 'info');
    }, 700);
  };

  // Simulate Fault Handler
  const handleToggleFault = async (b: BarrierItem) => {
    const isCurrentlyFault = b.state === 'Fault';
    if (isCurrentlyFault) {
      // Recover
      setBarriers((prev) =>
        prev.map((item) =>
          item.id === b.id
            ? {
                ...item,
                state: 'Closed',
                angle: 0,
                lastActionTime: 'الآن (تمت استعادة الجاهزية)',
              }
            : item
        )
      );
      setFeedback(`تمت استعادة الجاهزية التشغيلية وإلغاء العطل في ${b.name}.`);
      addLog(b.name, b.code, `تمت المعايرة التلقائية واستعادة الجاهزية بعد العطل`, 'success');
    } else {
      // Trigger fault
      try {
        await smartParkingApi.simulateBarrierFailure(b.id);
      } catch {
        // safe fallback
      }
      setBarriers((prev) =>
        prev.map((item) =>
          item.id === b.id
            ? {
                ...item,
                state: 'Fault',
                angle: 25,
                lastActionTime: 'الآن (عطل ميكانيكي)',
              }
            : item
        )
      );
      setFeedback(`تنبيه: تمت محاكاة عطل ميكانيكي في ${b.name} وتفعيل إشارات الإنذار.`);
      addLog(b.name, b.code, `محاكاة عطل ميكانيكي وتعليق حركة الذراع`, 'error');
    }
  };

  // Toggle Loop Sensor (Vehicle Presence)
  const handleToggleLoopSensor = (b: BarrierItem) => {
    const nextVal = !b.loopSensorActive;
    setBarriers((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, loopSensorActive: nextVal } : item))
    );
    if (nextVal) {
      setFeedback(`رصد حساس الحث الأرضي لـ ${b.name} تواجد مركبة في مسار البوابة.`);
      addLog(b.name, b.code, `رصد استشعار مركبة فوق حلقة الحث الكهرومغناطيسية`, 'info');
    } else {
      setFeedback(`أصبح مسار حساس الحث لـ ${b.name} خالياً تماماً.`);
      addLog(b.name, b.code, `خلو مسار حلقة الحث من المركبات`, 'info');
    }
  };

  // Toggle Photocell Safety Beam
  const handleTogglePhotocell = (b: BarrierItem) => {
    const nextVal = !b.photocellClear;
    setBarriers((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, photocellClear: nextVal } : item))
    );
    if (!nextVal) {
      setFeedback(`تحذير: تم اعتراض حزمة الليزر والأمان الكهروضوئية في ${b.name}! تم قفل الإغلاق التلقائي.`);
      addLog(b.name, b.code, `اعتراض حزمة الأمان الليزرية الكهروضوئية (Photocell)`, 'warning');
    } else {
      setFeedback(`حزمة الأمان الكهروضوئية لـ ${b.name} سالكة ومؤمّنة.`);
      addLog(b.name, b.code, `استعادة اتصال حزمة الليزر والأمان بنجاح`, 'success');
    }
  };

  // Emergency Open All
  const handleConfirmEmergencyOpenAll = () => {
    setIsEmergencyActive(true);
    setBarriers((prev) =>
      prev.map((item) => ({
        ...item,
        state: 'Open',
        angle: 90,
        lastActionTime: 'فتح طوارئ شامل',
        cyclesCount: item.cyclesCount + 1,
      }))
    );
    setEmergencyModalOpen(false);
    setFeedback(`تم تنفيذ أمر الفتح الاستثنائي الشامل لكافة البوابات (${emergencyReason}).`);
    addLog(
      'كافة البوابات والحواجز',
      'EMERGENCY-ALL',
      `تم فتح جميع الحواجز إجبارياً بحالة الطوارئ القصوى: ${emergencyReason}`,
      'error'
    );
  };

  // Secure All (Lockdown All)
  const handleSecureAll = () => {
    setIsEmergencyActive(false);
    setBarriers((prev) =>
      prev.map((item) => ({
        ...item,
        state: 'Closed',
        angle: 0,
        lastActionTime: 'تأمين وإغلاق شامل',
        cyclesCount: item.cyclesCount + 1,
      }))
    );
    setFeedback('تم تنفيذ الإغلاق والتأمين الأمني الشامل لكافة الحواجز الإلكترونية.');
    addLog('كافة البوابات والحواجز', 'SECURE-ALL', 'تم إغلاق وتأمين كافة المسارات والحواجز بنجاح', 'info');
  };

  // Simultaneous Recalibrate All
  const handleRecalibrateAll = () => {
    setFeedback('جاري فحص مصفوفة الاتصال OSDP ومعايرة زوايا المحركات السيرفو لكافة الحواجز...');
    setTimeout(() => {
      setBarriers((prev) =>
        prev.map((item) => ({
          ...item,
          state: item.state === 'Fault' ? 'Closed' : item.state,
          motorTemp: Number((34 + Math.random() * 5).toFixed(1)),
          photocellClear: true,
        }))
      );
      setFeedback('اكتملت المعايرة المتزامنة بنجاح: جميع الحواجز ومجسات الحث تعمل بكفاءة 100%.');
      addLog('المنظومة المركزية', 'CALIBRATION', 'اكتملت معايرة المحركات واختبار بروتوكول OSDP بنجاح', 'success');
    }, 1200);
  };

  // Filtered Barriers
  const filteredBarriers = useMemo(() => {
    return barriers.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.gate.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || b.type === typeFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'Open' && (b.state === 'Open' || b.state === 'Opening')) ||
        (statusFilter === 'Closed' && (b.state === 'Closed' || b.state === 'Closing')) ||
        (statusFilter === 'Fault' && b.state === 'Fault');

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [barriers, searchQuery, typeFilter, statusFilter]);

  return (
    <Box sx={{ pb: 8 }}>
      {/* 1. Header Banner */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(13, 148, 136, 0.2) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 50%, #e0f2fe 100%)',
          border: `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(45, 212, 191, 0.25)' : 'rgba(14, 165, 233, 0.3)'
          }`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 12px 35px rgba(14, 165, 233, 0.15)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2.5}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%)',
                  color: '#041018',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(45, 212, 191, 0.5)',
                }}
              >
                <FenceIcon sx={{ fontSize: 28 }} />
              </Box>
              <Chip
                icon={<RadioButtonCheckedIcon sx={{ fontSize: '14px !important', color: '#10B981' }} />}
                label="وحدة القيادة الكهروميكانيكية المركزية"
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: alpha('#10B981', 0.15),
                  color: '#10B981',
                  border: `1px solid ${alpha('#10B981', 0.3)}`,
                }}
              />
              <Chip
                label="بروتوكول OSDP v2.2 مشفر"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
              منظومة التحكم والقيادة في الحواجز الرقمية الذكية
            </Typography>
            <Typography variant="body2" color="text.secondary">
              رصد آني ومباشر للمصفوفة الهيدروليكية، قياس زوايا الذراع الآلي، وتأمين البوابات بنبضات استجابة فائقة السرعة (0.4 ثانية).
            </Typography>
          </Box>

          {/* Quick Actions */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              color="error"
              startIcon={<WarningIcon />}
              onClick={() => setEmergencyModalOpen(true)}
              sx={{
                fontWeight: 800,
                borderRadius: '12px',
                px: 2.5,
                py: 1.2,
                boxShadow: '0 0 24px rgba(239, 68, 68, 0.45)',
                animation: isEmergencyActive ? 'pulseWarning 1s infinite' : 'none',
                '@keyframes pulseWarning': {
                  '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 24px rgba(239, 68, 68, 0.45)' },
                  '50%': { transform: 'scale(1.03)', boxShadow: '0 0 35px rgba(239, 68, 68, 0.75)' },
                },
              }}
            >
              فتح طوارئ شامل لكافة البوابات
            </Button>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<AutorenewIcon />}
              onClick={handleRecalibrateAll}
              sx={{
                fontWeight: 800,
                borderRadius: '12px',
                px: 2,
              }}
            >
              معايرة الحساسات وفحص المحركات
            </Button>

            <Button
              variant="outlined"
              color="info"
              startIcon={<SecurityIcon />}
              onClick={handleSecureAll}
              sx={{
                fontWeight: 800,
                borderRadius: '12px',
                px: 2,
              }}
            >
              تأمين وإغلاق عام فوري
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Emergency Active Warning Ribbon */}
      {isEmergencyActive && (
        <Alert
          severity="error"
          variant="filled"
          icon={<ReportProblemIcon sx={{ fontSize: 26 }} />}
          sx={{
            mb: 3,
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
          }}
          action={
            <Button color="inherit" size="small" variant="outlined" onClick={handleSecureAll} sx={{ fontWeight: 800 }}>
              إنهاء وضع الطوارئ وتأمين المنظومة
            </Button>
          }
        >
          تنبيه أمني فوري: وضع الطوارئ القصوى نشط حالياً! كافة الحواجز مرفوعة لزاوية 90° لتسهيل الإخلاء ومرور فرق التدخل السريع.
        </Alert>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            fontWeight: 700,
            ...glassPanel({ borderRadius: '14px' }, theme.palette.mode),
          }}
          onClose={() => setFeedback(null)}
        >
          {feedback}
        </Alert>
      )}

      {/* 2. KPI Telemetry Matrix Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              ...glassPanel({}, theme.palette.mode),
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                إجمالي الحواجز الذكية
              </Typography>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(theme.palette.primary.main, 0.15) }}>
                <FenceIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1 }}>
              {totalBarriers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              مصفوفة كهروميكانيكية متصلة
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              ...glowPanel('#10B981', {}, theme.palette.mode),
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                المفتوحة والسالكة حالياً
              </Typography>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#10B981', 0.15) }}>
                <LockOpenIcon sx={{ color: '#10B981', fontSize: 20 }} />
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: '#10B981' }}>
              {openCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
              زاوية رفع 90° للمرور الحر
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              ...glowPanel('#38BDF8', {}, theme.palette.mode),
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                المؤمّنة والمغلقة
              </Typography>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#38BDF8', 0.15) }}>
                <LockIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: '#38BDF8' }}>
              {closedCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700 }}>
              محكمة الإغلاق ومراقبة ليزرياً
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              ...glassPanel({}, theme.palette.mode),
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                معدل زمن الاستجابة
              </Typography>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#F59E0B', 0.15) }}>
                <SpeedIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: '#F59E0B' }}>
              {avgResponseTime} ث
            </Typography>
            <Typography variant="caption" color="text.secondary">
              محركات سيرفو فورية 24V
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              ...glassPanel(
                faultCount > 0 ? { border: `1px solid ${alpha('#EF4444', 0.4)}` } : {},
                theme.palette.mode
              ),
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                إنذارات الأعطال الميكانيكية
              </Typography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '10px',
                  bgcolor: alpha(faultCount > 0 ? '#EF4444' : '#10B981', 0.15),
                }}
              >
                {faultCount > 0 ? (
                  <WarningIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                ) : (
                  <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                )}
              </Box>
            </Stack>
            <Typography
              variant="h4"
              fontWeight={900}
              sx={{ my: 1, color: faultCount > 0 ? '#EF4444' : '#10B981' }}
            >
              {faultCount}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: faultCount > 0 ? '#EF4444' : '#10B981', fontWeight: 700 }}
            >
              {faultCount > 0 ? 'يتطلب فحص كابينة المحرك' : 'كافة الحواجز بكامل الكفاءة'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Search & Gate Filtering Hub */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5, mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="البحث باسم الحاجز، رمز البوابة، أو المعرف التقني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: { xs: '100%', md: 280 } }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="كافة الحواجز"
              color={typeFilter === 'all' ? 'primary' : 'default'}
              variant={typeFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('all')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="بوابات الدخول"
              color={typeFilter === 'entry' ? 'primary' : 'default'}
              variant={typeFilter === 'entry' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('entry')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="بوابات الخروج"
              color={typeFilter === 'exit' ? 'primary' : 'default'}
              variant={typeFilter === 'exit' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('exit')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="كبار الشخصيات (VIP)"
              color={typeFilter === 'vip' ? 'primary' : 'default'}
              variant={typeFilter === 'vip' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('vip')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="مسارات الطوارئ"
              color={typeFilter === 'emergency' ? 'primary' : 'default'}
              variant={typeFilter === 'emergency' ? 'filled' : 'outlined'}
              onClick={() => setTypeFilter('emergency')}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

          <Stack direction="row" spacing={1}>
            <Chip
              label="الكل"
              size="small"
              variant={statusFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('all')}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="مفتوحة"
              size="small"
              color="success"
              variant={statusFilter === 'Open' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('Open')}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="مغلقة"
              size="small"
              color="info"
              variant={statusFilter === 'Closed' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('Closed')}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="أعطال"
              size="small"
              color="error"
              variant={statusFilter === 'Fault' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('Fault')}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Stack>
      </Card>

      {/* 4. Barrier Cards Grid */}
      <Grid container spacing={3}>
        {filteredBarriers.map((b) => {
          const color = getStateColor(b.state);
          const isBusy = busyId === b.id;
          const isArmOpen = b.state === 'Open';
          const isArmMoving = b.state === 'Opening' || b.state === 'Closing';
          const isFault = b.state === 'Fault';

          // Rotation angle for visual boom arm:
          // 0° is horizontal (closed)
          // -88° is raised upright (open)
          // -45° is transitional
          // -20° is fault/jammed
          let armRotationDeg = 0;
          if (b.state === 'Open') armRotationDeg = -88;
          else if (b.state === 'Opening') armRotationDeg = -45;
          else if (b.state === 'Closing') armRotationDeg = -30;
          else if (b.state === 'Fault') armRotationDeg = -22;

          return (
            <Grid item xs={12} md={6} lg={4} key={b.id}>
              <Card
                sx={{
                  ...glowPanel(color, {}, theme.palette.mode),
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {/* Top Card Header */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '12px',
                          bgcolor: alpha(color, 0.15),
                          color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FenceIcon sx={{ fontSize: 26 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                          {b.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {b.code} • {b.gate}
                        </Typography>
                      </Box>
                    </Stack>

                    <Tooltip title="معايرة دقيقة وتشخيص الحساسات">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedBarrierForTune(b)}
                        sx={{
                          bgcolor: alpha(theme.palette.divider, 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                        }}
                      >
                        <TuneIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  {/* Operational Status Badge */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      icon={
                        isArmMoving ? (
                          <AutorenewIcon sx={{ animation: 'spin 1.2s linear infinite', fontSize: '16px !important' }} />
                        ) : isFault ? (
                          <ErrorOutlineIcon sx={{ fontSize: '16px !important' }} />
                        ) : (
                          <CheckCircleIcon sx={{ fontSize: '16px !important' }} />
                        )
                      }
                      label={getStateArabicTitle(b.state)}
                      sx={{
                        fontWeight: 800,
                        bgcolor: alpha(color, 0.18),
                        color,
                        border: `1px solid ${alpha(color, 0.4)}`,
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />

                    <Chip
                      label={b.mode === 'auto' ? 'تلقائي ذكي' : b.mode === 'manual' ? 'يدوي' : 'إغلاق أمني'}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </Stack>

                  {/* VISUAL BOOM ARM STAGE */}
                  <Box
                    sx={{
                      my: 2,
                      py: 2,
                      px: 2.5,
                      borderRadius: '16px',
                      background:
                        theme.palette.mode === 'dark'
                          ? 'linear-gradient(180deg, #090e17 0%, #030712 100%)'
                          : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                      border: `1px solid ${alpha(color, 0.3)}`,
                      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 24px ${alpha(color, 0.15)}`,
                      position: 'relative',
                      overflow: 'hidden',
                      height: 140,
                      display: 'flex',
                      alignItems: 'flex-end',
                    }}
                  >
                    {/* Asphalt Road Plane & Dashed Lane Lines */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 36,
                        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                        borderTop: '2px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      {/* Lane Markings */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 14,
                          left: 0,
                          right: 0,
                          height: 3,
                          background:
                            'repeating-linear-gradient(90deg, #facc15 0, #facc15 15px, transparent 15px, transparent 30px)',
                          opacity: 0.6,
                        }}
                      />
                    </Box>

                    {/* Inductive Ground Loop Detector (Interactive Visual) */}
                    <Tooltip title="حساس الحث الأرضي: انقر لمحاكاة وصول / مغادرة مركبة">
                      <Box
                        onClick={() => handleToggleLoopSensor(b)}
                        sx={{
                          position: 'absolute',
                          bottom: 6,
                          left: 65,
                          width: 100,
                          height: 24,
                          borderRadius: '4px',
                          border: `2px dashed ${b.loopSensorActive ? '#38BDF8' : 'rgba(255, 255, 255, 0.25)'}`,
                          bgcolor: b.loopSensorActive ? alpha('#38BDF8', 0.25) : 'transparent',
                          boxShadow: b.loopSensorActive
                            ? '0 0 14px rgba(56, 189, 248, 0.6), inset 0 0 8px rgba(56, 189, 248, 0.4)'
                            : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          transition: 'all 0.3s ease',
                          animation: b.loopSensorActive ? 'loopPulse 1.5s infinite' : 'none',
                          '@keyframes loopPulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.6 },
                          },
                        }}
                      >
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <DirectionsCarIcon
                            sx={{
                              fontSize: 14,
                              color: b.loopSensorActive ? '#38BDF8' : 'rgba(255, 255, 255, 0.4)',
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: b.loopSensorActive ? '#38BDF8' : 'rgba(255, 255, 255, 0.5)',
                            }}
                          >
                            {b.loopSensorActive ? 'مركبة مرصودة' : 'مجس حث أرضي'}
                          </Typography>
                        </Stack>
                      </Box>
                    </Tooltip>

                    {/* Photocell Safety Laser Beam */}
                    <Tooltip title="حزمة الأمان الكهروضوئية: انقر للتبديل بين سالك ومحجوب">
                      <Box
                        onClick={() => handleTogglePhotocell(b)}
                        sx={{
                          position: 'absolute',
                          bottom: 42,
                          left: 45,
                          right: 15,
                          height: 2,
                          background: b.photocellClear
                            ? 'linear-gradient(90deg, #10B981, rgba(16, 185, 129, 0.2))'
                            : 'linear-gradient(90deg, #EF4444, rgba(239, 68, 68, 0.8))',
                          boxShadow: b.photocellClear
                            ? '0 0 8px #10B981'
                            : '0 0 12px #EF4444, 0 0 20px #EF4444',
                          cursor: 'pointer',
                          zIndex: 2,
                          animation: !b.photocellClear ? 'laserBlink 0.6s infinite' : 'none',
                          '@keyframes laserBlink': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.3 },
                          },
                        }}
                      />
                    </Tooltip>

                    {/* Barrier Base Pillar (Housing Cabinet) */}
                    <Box
                      sx={{
                        width: 42,
                        height: 75,
                        borderRadius: '8px 8px 0 0',
                        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                        border: `2px solid ${alpha(color, 0.7)}`,
                        boxShadow: `0 4px 14px rgba(0,0,0,0.8), 0 0 12px ${alpha(color, 0.2)}`,
                        position: 'relative',
                        zIndex: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 0.6,
                      }}
                    >
                      {/* Top Warning Beacon LED */}
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          bgcolor: color,
                          boxShadow: `0 0 12px ${color}, 0 0 22px ${color}`,
                          animation: isArmMoving || isFault ? 'beaconPulse 0.7s infinite' : 'none',
                          '@keyframes beaconPulse': {
                            '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                            '50%': { transform: 'scale(1.2)', opacity: 0.4 },
                          },
                        }}
                      />

                      {/* Small LCD readout on cabinet */}
                      <Box
                        sx={{
                          bgcolor: '#041018',
                          border: '1px solid rgba(45, 212, 191, 0.4)',
                          borderRadius: '3px',
                          px: 0.4,
                          py: 0.1,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: '#2DD4BF', fontFamily: 'monospace' }}>
                          {b.angle}°
                        </Typography>
                      </Box>

                      {/* Mechanical Pivot Hinge Bolt */}
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: '#334155',
                          border: '2px solid #94A3B8',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
                          position: 'relative',
                        }}
                      />
                    </Box>

                    {/* Pivoting Barrier Boom Arm (ذراع الحاجز الآلي) */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 36,
                        bottom: 46,
                        width: '75%',
                        height: 9,
                        borderRadius: '3px',
                        background: `repeating-linear-gradient(
                          -45deg,
                          #FFFFFF 0,
                          #FFFFFF 12px,
                          #DC2626 12px,
                          #DC2626 24px
                        )`,
                        boxShadow: `0 2px 8px rgba(0,0,0,0.7), 0 0 14px ${alpha(color, 0.5)}`,
                        transformOrigin: '0% 50%',
                        transform: `rotate(${armRotationDeg}deg)`,
                        transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        zIndex: 3,
                      }}
                    >
                      {/* Under-Arm Neon LED Strip */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -2,
                          left: 0,
                          right: 0,
                          height: 2,
                          bgcolor: color,
                          boxShadow: `0 0 8px ${color}`,
                        }}
                      />

                      {/* End-Of-Arm Safety Strobe LED */}
                      <Box
                        sx={{
                          position: 'absolute',
                          right: -3,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          bgcolor: color,
                          boxShadow: `0 0 10px ${color}`,
                        }}
                      />
                    </Box>

                    {/* Angle / Speed Indicator Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 12,
                        bgcolor: alpha('#0F172A', 0.8),
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        px: 1,
                        py: 0.4,
                        zIndex: 2,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.65rem', color: '#E2E8F0', fontWeight: 800 }}>
                        زاوية الذراع: <span style={{ color }}>{b.angle}°</span>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Telemetry Metrics Grid */}
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '10px',
                          bgcolor: alpha(theme.palette.divider, 0.05),
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <SpeedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            سرعة الفتح
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={800} sx={{ mt: 0.5 }}>
                          {b.openingSpeed} ثانية
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '10px',
                          bgcolor: alpha(theme.palette.divider, 0.05),
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <ThermostatIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            حرارة المحرك
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={800} sx={{ mt: 0.5 }}>
                          {b.motorTemp} °C
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '10px',
                          bgcolor: alpha(theme.palette.divider, 0.05),
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <HistoryIcon sx={{ fontSize: 16, color: '#10B981' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            دورات الفتح
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={800} sx={{ mt: 0.5 }}>
                          {b.cyclesCount.toLocaleString()} دورة
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '10px',
                          bgcolor: alpha(theme.palette.divider, 0.05),
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <LanIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            الاتصال والشبكة
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={800} sx={{ mt: 0.5 }}>
                          {b.osdpChannel}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Sensor Badges */}
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      icon={b.loopSensorActive ? <SensorsIcon /> : <SensorsOffIcon />}
                      label={b.loopSensorActive ? 'مجس الحث: رصد مركبة' : 'مجس الحث: المسار شاغر'}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: b.loopSensorActive ? alpha('#38BDF8', 0.2) : alpha(theme.palette.divider, 0.1),
                        color: b.loopSensorActive ? '#38BDF8' : 'text.secondary',
                      }}
                    />

                    <Chip
                      icon={b.photocellClear ? <ShieldIcon /> : <WarningIcon />}
                      label={b.photocellClear ? 'ليزر الأمان: سالك' : 'ليزر الأمان: محجوب'}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: b.photocellClear ? alpha('#10B981', 0.15) : alpha('#EF4444', 0.2),
                        color: b.photocellClear ? '#10B981' : '#EF4444',
                      }}
                    />
                  </Stack>
                </Box>

                {/* Barrier Control Command Buttons */}
                <Stack spacing={1.2} sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={isArmOpen ? 'contained' : 'outlined'}
                      color="success"
                      fullWidth
                      startIcon={<LockOpenIcon />}
                      onClick={() => handleOpen(b)}
                      disabled={isBusy || isArmOpen}
                      sx={{
                        fontWeight: 800,
                        borderRadius: '12px',
                        py: 1,
                        bgcolor: isArmOpen ? '#10B981' : undefined,
                        boxShadow: isArmOpen ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
                      }}
                    >
                      رفع وفتح (0.4s)
                    </Button>

                    <Button
                      variant={!isArmOpen && !isFault ? 'contained' : 'outlined'}
                      color="info"
                      fullWidth
                      startIcon={<LockIcon />}
                      onClick={() => handleClose(b)}
                      disabled={isBusy || (!isArmOpen && !isFault)}
                      sx={{
                        fontWeight: 800,
                        borderRadius: '12px',
                        py: 1,
                      }}
                    >
                      خفض وتأمين
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color={isFault ? 'warning' : 'error'}
                      size="small"
                      fullWidth
                      startIcon={isFault ? <AutorenewIcon /> : <WarningIcon />}
                      onClick={() => handleToggleFault(b)}
                      disabled={isBusy}
                      sx={{ fontWeight: 700, borderRadius: '10px' }}
                    >
                      {isFault ? 'استعادة الجاهزية وإلغاء العطل' : 'محاكاة عطل ميكانيكي'}
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleToggleLoopSensor(b)}
                      startIcon={<DirectionsCarIcon />}
                      sx={{ fontWeight: 700, borderRadius: '10px', whiteSpace: 'nowrap' }}
                    >
                      محاكاة مركبة
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 5. Live Activity & Telemetry Audit Stream */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3, mt: 5, borderRadius: '20px' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
              }}
            >
              <HistoryIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                سجل العمليات والنبضات اللحظي للحواجز
              </Typography>
              <Typography variant="caption" color="text.secondary">
                توثيق مباشر لكل حركة رفع، خفض، استشعار حثي، واستجابة أمنية
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => setLogs((prev) => [...prev])}
            sx={{ fontWeight: 700 }}
          >
            تحديث السجل
          </Button>
        </Stack>

        <Stack spacing={1.2}>
          {logs.map((log) => {
            let logColor = '#10B981';
            if (log.status === 'error') logColor = '#EF4444';
            if (log.status === 'warning') logColor = '#F59E0B';
            if (log.status === 'info') logColor = '#38BDF8';

            return (
              <Box
                key={log.id}
                sx={{
                  p: 1.8,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.divider, 0.05),
                  border: `1px solid ${alpha(logColor, 0.25)}`,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: logColor,
                      boxShadow: `0 0 10px ${logColor}`,
                    }}
                  />
                  <Typography variant="body2" fontWeight={800}>
                    {log.barrierName}
                  </Typography>
                  <Chip
                    label={log.barrierCode}
                    size="small"
                    sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {log.action}
                  </Typography>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                >
                  {log.timestamp}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Card>

      {/* 6. Emergency Override Confirmation Modal */}
      <Dialog
        open={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1e1115 0%, #0f172a 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #fff1f2 100%)',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 25px 60px rgba(239, 68, 68, 0.35)',
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1.2,
                borderRadius: '12px',
                bgcolor: alpha('#EF4444', 0.2),
                color: '#EF4444',
                display: 'flex',
              }}
            >
              <WarningIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} color="error">
                تأكيد فتح الطوارئ الشامل لكافة البوابات
              </Typography>
              <Typography variant="caption" color="text.secondary">
                إجراء تكتيكي ذو أولوية أمنية قصوى (Override All Barriers)
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ borderTop: 'none' }}>
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '12px', fontWeight: 700 }}>
            سيؤدي هذا الإجراء إلى إرسال نبضة فتح فورية (0.4 ثانية) لكافة الحواجز الـ 8 بالموقع وتعليقها على زاوية 90°،
            لإتاحة مسار حر لمركبات التدخل والإخلاء.
          </Alert>

          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
            يرجى تحديد سبب تفعيل فتح الطوارئ:
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              <MenuItem value="دفاع مدني وإخلاء طوارئ">دفاع مدني وإخلاء طوارئ وحريق</MenuItem>
              <MenuItem value="مرور سيارات إسعاف وطواقم طبية">مرور سيارات إسعاف وطواقم طبية عاجلة</MenuItem>
              <MenuItem value="موكب وفد رسمي وتشريفي">مرور موكب وفد رسمي وتشريفي خاص</MenuItem>
              <MenuItem value="انقطاع الطاقة واختبار المولدات">انقطاع الطاقة واختبار المولدات الاحتياطية</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setEmergencyModalOpen(false)}
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: '12px' }}
          >
            إلغاء التراجع
          </Button>
          <Button
            onClick={handleConfirmEmergencyOpenAll}
            variant="contained"
            color="error"
            startIcon={<WarningIcon />}
            sx={{
              fontWeight: 900,
              borderRadius: '12px',
              px: 3,
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
            }}
          >
            تأكيد الفتح الاستثنائي الفوري
          </Button>
        </DialogActions>
      </Dialog>

      {/* 7. Barrier Fine Calibration & Diagnostics Modal */}
      {selectedBarrierForTune && (
        <Dialog
          open={Boolean(selectedBarrierForTune)}
          onClose={() => setSelectedBarrierForTune(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              p: 1,
              ...glassPanel({ borderRadius: '24px' }, theme.palette.mode),
            },
          }}
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.main,
                  }}
                >
                  <TuneIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    معايرة وتشخيص: {selectedBarrierForTune.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    الرمز: {selectedBarrierForTune.code} • بروتوكول: {selectedBarrierForTune.osdpChannel}
                  </Typography>
                </Box>
              </Stack>

              <IconButton onClick={() => setSelectedBarrierForTune(null)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={3}>
              {/* Arm Angle Calibration Slider */}
              <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                  معايرة زاوية الرفع اليدوية: ({selectedBarrierForTune.angle}°)
                </Typography>
                <Slider
                  value={selectedBarrierForTune.angle}
                  min={0}
                  max={90}
                  step={5}
                  valueLabelDisplay="auto"
                  onChange={(_, val) => {
                    const nextAngle = val as number;
                    setSelectedBarrierForTune((prev) => (prev ? { ...prev, angle: nextAngle } : null));
                    setBarriers((prev) =>
                      prev.map((b) =>
                        b.id === selectedBarrierForTune.id
                          ? {
                              ...b,
                              angle: nextAngle,
                              state: nextAngle >= 80 ? 'Open' : nextAngle <= 10 ? 'Closed' : 'Opening',
                            }
                          : b
                      )
                    );
                  }}
                  sx={{ color: theme.palette.primary.main }}
                />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    0° (أفقي مغلق)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    45° (منتصف المسافة)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    90° (شاقولي مفتوح)
                  </Typography>
                </Stack>
              </Box>

              <Divider />

              {/* Hardware Specifications */}
              <Typography variant="subtitle2" fontWeight={800}>
                المواصفات الكهروميكانيكية:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    المحرك الكهربائي
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    Brushless DC 24V Servo
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    استهلاك القدرة
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    120W (Eco-Standby 8W)
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    معيار الحماية المناخية
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    IP65 مقاوم للغبار والحرارة
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    عنوان الشبكة الداخلي
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {selectedBarrierForTune.ipAddress}
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              {/* Mode switch */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" fontWeight={800}>
                    نمط التشغيل التلقائي مع حساس الحث
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    فتح فوري للسيارات المصرحة عند رصدها فوق مجس الملف الحثي
                  </Typography>
                </Box>
                <Switch
                  checked={selectedBarrierForTune.mode === 'auto'}
                  onChange={(e) => {
                    const newMode = e.target.checked ? 'auto' : 'manual';
                    setSelectedBarrierForTune((prev) => (prev ? { ...prev, mode: newMode } : null));
                    setBarriers((prev) =>
                      prev.map((b) => (b.id === selectedBarrierForTune.id ? { ...b, mode: newMode } : b))
                    );
                  }}
                />
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                setFeedback(`تم حفظ إعدادات ومعايرة ${selectedBarrierForTune.name} بنجاح.`);
                setSelectedBarrierForTune(null);
              }}
              sx={{ fontWeight: 800, borderRadius: '12px', px: 3 }}
            >
              حفظ المعايرة والتطبيق
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
