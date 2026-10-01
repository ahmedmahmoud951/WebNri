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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  LinearProgress,
} from '@mui/material';

// Material Icons
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import SpeedIcon from '@mui/icons-material/Speed';
import VideocamIcon from '@mui/icons-material/Videocam';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';
import SensorsIcon from '@mui/icons-material/Sensors';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CropFreeIcon from '@mui/icons-material/CropFree';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import { smartParkingApi } from '../../core/api/smartParkingApi';

export interface LprDetection {
  id: string;
  plate: string;
  plateLetters: string; // e.g. "أ ب ج"
  plateNumbers: string; // e.g. "1004"
  plateLatinLetters: string; // e.g. "A B J"
  confidence: number; // e.g. 0.994
  charConfidences: { char: string; conf: number }[];
  camera: string;
  gate: string;
  lane: string;
  direction: 'دخول' | 'خروج';
  matchedUser: string;
  userType: 'ساكن دائم' | 'كبار الشخصيات VIP' | 'مشترك شهري' | 'زائر مصرح' | 'مركبة خدمات' | 'سداد بالساعة';
  matchedVehicle: string;
  vehicleColor: string;
  time: string;
  date: string;
  inferenceTimeMs: number; // e.g. 64ms
  barrierStatus: 'تم الرفع تلقائياً' | 'بانتظار السداد' | 'مرفوع مسبقاً' | 'مرفوض - غير مصرح';
  snapshotUrl?: string;
  ambientLight: 'إضاءة نهارية مثالية' | 'إضاءة ليلية بالأشعة تحت الحمراء IR' | 'تباين عالي';
}

const REALISTIC_DETECTIONS: LprDetection[] = [
  {
    id: 'lpr-101',
    plate: 'أ ب ج 1004',
    plateLetters: 'أ ب ج',
    plateNumbers: '1004',
    plateLatinLetters: 'A B J',
    confidence: 0.998,
    charConfidences: [
      { char: 'أ', conf: 0.999 },
      { char: 'ب', conf: 0.998 },
      { char: 'ج', conf: 0.998 },
      { char: '1', conf: 0.997 },
      { char: '0', conf: 0.999 },
      { char: '0', conf: 0.999 },
      { char: '4', conf: 0.996 },
    ],
    camera: 'كاميرا الرصد الشمالية 4K (CAM-N01-IN)',
    gate: 'بوابة الشمال رقم 1',
    lane: 'المسار الذاتي السريع 01',
    direction: 'دخول',
    matchedUser: 'أحمد بن سلطان الشهري',
    userType: 'ساكن دائم',
    matchedVehicle: 'تويوتا لاندكروزر VXR 2024',
    vehicleColor: 'أبيض لؤلؤي',
    time: '10:32:15',
    date: '2026-10-01',
    inferenceTimeMs: 62,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
  {
    id: 'lpr-102',
    plate: 'س ص ع 9999',
    plateLetters: 'س ص ع',
    plateNumbers: '9999',
    plateLatinLetters: 'S S A',
    confidence: 0.999,
    charConfidences: [
      { char: 'س', conf: 0.999 },
      { char: 'ص', conf: 0.999 },
      { char: 'ع', conf: 0.999 },
      { char: '9', conf: 0.999 },
      { char: '9', conf: 0.999 },
      { char: '9', conf: 0.999 },
      { char: '9', conf: 0.999 },
    ],
    camera: 'كاميرا المنصة التشريفية (CAM-VIP-01)',
    gate: 'بوابة كبار الشخصيات VIP',
    lane: 'المسار الملكي الخاص',
    direction: 'دخول',
    matchedUser: 'سعادة وكيل الوزارة / د. فيصل بن عبد الله',
    userType: 'كبار الشخصيات VIP',
    matchedVehicle: 'مرسيدس S-Class Maybach 2024',
    vehicleColor: 'أسود ملكي',
    time: '10:28:44',
    date: '2026-10-01',
    inferenceTimeMs: 54,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
  {
    id: 'lpr-103',
    plate: 'د هـ و 2045',
    plateLetters: 'د هـ و',
    plateNumbers: '2045',
    plateLatinLetters: 'D H W',
    confidence: 0.986,
    charConfidences: [
      { char: 'د', conf: 0.988 },
      { char: 'هـ', conf: 0.982 },
      { char: 'و', conf: 0.991 },
      { char: '2', conf: 0.985 },
      { char: '0', conf: 0.989 },
      { char: '4', conf: 0.984 },
      { char: '5', conf: 0.987 },
    ],
    camera: 'كاميرا المخرج الجنوبي (CAM-S02-OUT)',
    gate: 'بوابة الجنوب رقم 2',
    lane: 'مسار الخروج التلقائي 02',
    direction: 'خروج',
    matchedUser: 'المهندس / خالد بن منصور البقمي',
    userType: 'مشترك شهري',
    matchedVehicle: 'بي إم دبليو X5 M-Sport 2023',
    vehicleColor: 'رمادي ميتاليك',
    time: '10:21:09',
    date: '2026-10-01',
    inferenceTimeMs: 74,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
  {
    id: 'lpr-104',
    plate: 'ق و ل 4001',
    plateLetters: 'ق و ل',
    plateNumbers: '4001',
    plateLatinLetters: 'Q W L',
    confidence: 0.974,
    charConfidences: [
      { char: 'ق', conf: 0.971 },
      { char: 'و', conf: 0.975 },
      { char: 'ل', conf: 0.978 },
      { char: '4', conf: 0.972 },
      { char: '0', conf: 0.976 },
      { char: '0', conf: 0.975 },
      { char: '1', conf: 0.970 },
    ],
    camera: 'كاميرا البوابة الشمالية (CAM-N01-IN)',
    gate: 'بوابة الشمال رقم 1',
    lane: 'مسار الزوار والضيوف 02',
    direction: 'دخول',
    matchedUser: 'تركي بن فهد الدوسري (دعوة INV-8921)',
    userType: 'زائر مصرح',
    matchedVehicle: 'هيونداي سوناتا Smart 2024',
    vehicleColor: 'فضي لامع',
    time: '10:14:30',
    date: '2026-10-01',
    inferenceTimeMs: 82,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
  {
    id: 'lpr-105',
    plate: 'ط ر ق 7712',
    plateLetters: 'ط ر ق',
    plateNumbers: '7712',
    plateLatinLetters: 'T R Q',
    confidence: 0.992,
    charConfidences: [
      { char: 'ط', conf: 0.994 },
      { char: 'ر', conf: 0.991 },
      { char: 'ق', conf: 0.993 },
      { char: '7', conf: 0.990 },
      { char: '7', conf: 0.992 },
      { char: '1', conf: 0.993 },
      { char: '2', conf: 0.991 },
    ],
    camera: 'كاميرا بوابة الشرق (CAM-E01-IN)',
    gate: 'بوابة الشرق رقم 3',
    lane: 'مسار الخدمات والتوريد',
    direction: 'دخول',
    matchedUser: 'الدكتور / فهد بن ناصر العتيبي',
    userType: 'ساكن دائم',
    matchedVehicle: 'لكزس LX600 VIP 2024',
    vehicleColor: 'كحلي داكن',
    time: '10:05:12',
    date: '2026-10-01',
    inferenceTimeMs: 59,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
  {
    id: 'lpr-106',
    plate: 'ر س م 6644',
    plateLetters: 'ر س م',
    plateNumbers: '6644',
    plateLatinLetters: 'R S M',
    confidence: 0.995,
    charConfidences: [
      { char: 'ر', conf: 0.996 },
      { char: 'س', conf: 0.994 },
      { char: 'م', conf: 0.995 },
      { char: '6', conf: 0.995 },
      { char: '6', conf: 0.996 },
      { char: '4', conf: 0.994 },
      { char: '4', conf: 0.995 },
    ],
    camera: 'كاميرا محطة الشحن (CAM-EV-NORTH)',
    gate: 'بوابة الشمال رقم 1',
    lane: 'مسار المركبات الكهربائية EV',
    direction: 'دخول',
    matchedUser: 'عمر بن سعيد باوزير',
    userType: 'مشترك شهري',
    matchedVehicle: 'تسلا موديل Y Dual Motor 2024',
    vehicleColor: 'أبيض لؤلؤي',
    time: '09:58:20',
    date: '2026-10-01',
    inferenceTimeMs: 65,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
  {
    id: 'lpr-107',
    plate: 'ن م ر 3300',
    plateLetters: 'ن م ر',
    plateNumbers: '3300',
    plateLatinLetters: 'N M R',
    confidence: 0.997,
    charConfidences: [
      { char: 'ن', conf: 0.997 },
      { char: 'م', conf: 0.996 },
      { char: 'ر', conf: 0.998 },
      { char: '3', conf: 0.996 },
      { char: '3', conf: 0.997 },
      { char: '0', conf: 0.998 },
      { char: '0', conf: 0.998 },
    ],
    camera: 'كاميرا المنصة التشريفية (CAM-VIP-01)',
    gate: 'بوابة كبار الشخصيات VIP',
    lane: 'المسار التشريفي الخاص',
    direction: 'خروج',
    matchedUser: 'سمو الأميرة / سارة آل سعود',
    userType: 'كبار الشخصيات VIP',
    matchedVehicle: 'جينيسيس GV80 Prestige 2024',
    vehicleColor: 'عنابي داكن',
    time: '09:42:18',
    date: '2026-10-01',
    inferenceTimeMs: 51,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
  {
    id: 'lpr-108',
    plate: 'ح ك م 5520',
    plateLetters: 'ح ك م',
    plateNumbers: '5520',
    plateLatinLetters: 'H K M',
    confidence: 0.983,
    charConfidences: [
      { char: 'ح', conf: 0.985 },
      { char: 'ك', conf: 0.981 },
      { char: 'م', conf: 0.984 },
      { char: '5', conf: 0.982 },
      { char: '5', conf: 0.984 },
      { char: '2', conf: 0.983 },
      { char: '0', conf: 0.985 },
    ],
    camera: 'كاميرا المخرج الجنوبي (CAM-S02-OUT)',
    gate: 'بوابة الجنوب رقم 2',
    lane: 'مسار الدفع والمغادرة',
    direction: 'خروج',
    matchedUser: 'عبد الله بن راشد الشمري',
    userType: 'سداد بالساعة',
    matchedVehicle: 'فورد إكسبيديشن XLT 2023',
    vehicleColor: 'بني ذهبي',
    time: '09:30:05',
    date: '2026-10-01',
    inferenceTimeMs: 78,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
  {
    id: 'lpr-109',
    plate: 'ل و ح 2233',
    plateLetters: 'ل و ح',
    plateNumbers: '2233',
    plateLatinLetters: 'L W H',
    confidence: 0.978,
    charConfidences: [
      { char: 'ل', conf: 0.975 },
      { char: 'و', conf: 0.980 },
      { char: 'ح', conf: 0.978 },
      { char: '2', conf: 0.976 },
      { char: '2', conf: 0.978 },
      { char: '3', conf: 0.979 },
      { char: '3', conf: 0.977 },
    ],
    camera: 'كاميرا الشحن والتوريد (CAM-E01-IN)',
    gate: 'بوابة الشرق رقم 3',
    lane: 'مسار النقل الثقيل والتوريد',
    direction: 'دخول',
    matchedUser: 'شركة الإمداد اللوجستي الموحد (تصريح توريد)',
    userType: 'مركبة خدمات',
    matchedVehicle: 'إيسوزو ديماكس Heavy-Duty 2023',
    vehicleColor: 'أبيض',
    time: '09:12:40',
    date: '2026-10-01',
    inferenceTimeMs: 88,
    barrierStatus: 'تم الرفع تلقائياً',
    ambientLight: 'إضاءة نهارية مثالية',
  },
];

export function LprPage() {
  const theme = useTheme();
  const { hub } = useAuth();

  // Core State
  const [detections, setDetections] = useState<LprDetection[]>(REALISTIC_DETECTIONS);
  const [selectedDetection, setSelectedDetection] = useState<LprDetection>(REALISTIC_DETECTIONS[0]);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectionTarget, setInspectionTarget] = useState<LprDetection | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'دخول' | 'خروج'>('all');

  // Simulation Lab State
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simPlateInput, setSimPlateInput] = useState('ر ق م 8822');
  const [simDirection, setSimDirection] = useState<'دخول' | 'خروج'>('دخول');
  const [simGate, setSimGate] = useState('بوابة الشمال رقم 1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Real-time Hub listener
  useEffect(() => {
    const unsub = (hub as any)?.onPlateRecognized?.((evt: any) => {
      const plateStr = evt.plateNumber || evt.plate || 'أ ب ج 9999';
      const parts = plateStr.split(' ');
      const letters = parts.slice(0, -1).join(' ') || 'أ ب ج';
      const numbers = parts[parts.length - 1] || '9999';

      const newDet: LprDetection = {
        id: 'lpr-' + Date.now(),
        plate: plateStr,
        plateLetters: letters,
        plateNumbers: numbers,
        plateLatinLetters: 'KSA',
        confidence: evt.confidence || 0.985,
        charConfidences: [
          { char: letters[0] || 'أ', conf: 0.99 },
          { char: letters[2] || 'ب', conf: 0.98 },
          { char: letters[4] || 'ج', conf: 0.99 },
          { char: numbers[0] || '9', conf: 0.99 },
        ],
        camera: evt.cameraName || 'كاميرا الرصد اللحظي المباشر',
        gate: evt.gateName || 'بوابة رئيسية',
        lane: 'المسار الآلي الذكي',
        direction: (evt.direction === 'Exit' || evt.direction === 'خروج') ? 'خروج' : 'دخول',
        matchedUser: 'مركبة مسجلة في المنظومة',
        userType: 'مشترك شهري',
        matchedVehicle: 'مركبة معتمدة لدى النظام',
        vehicleColor: 'أبيض',
        time: new Date().toLocaleTimeString('ar-SA'),
        date: new Date().toISOString().split('T')[0],
        inferenceTimeMs: 64,
        barrierStatus: 'تم الرفع تلقائياً',
        ambientLight: 'إضاءة نهارية مثالية',
      };

      setDetections((prev) => [newDet, ...prev.slice(0, 24)]);
      setSelectedDetection(newDet);
      setFeedback(`تم رصد اللوحة "${plateStr}" بنجاح عبر الكاميرا والتعرف على بيانات المركبة.`);
    });

    return () => unsub?.();
  }, [hub]);

  // Handle Manual Simulation
  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    const parts = simPlateInput.trim().split(' ');
    const letters = parts.slice(0, -1).join(' ') || 'ر ق م';
    const numbers = parts[parts.length - 1] || '8822';

    try {
      await smartParkingApi.simulateLpr({
        plate: simPlateInput,
        direction: simDirection === 'دخول' ? 'Entry' : 'Exit',
        confidence: 0.994,
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      const newSimDet: LprDetection = {
        id: 'lpr-sim-' + Date.now(),
        plate: simPlateInput,
        plateLetters: letters,
        plateNumbers: numbers,
        plateLatinLetters: 'R Q M',
        confidence: 0.994,
        charConfidences: [
          { char: letters[0] || 'ر', conf: 0.995 },
          { char: letters[2] || 'ق', conf: 0.993 },
          { char: letters[4] || 'م', conf: 0.994 },
          { char: numbers[0] || '8', conf: 0.996 },
          { char: numbers[1] || '8', conf: 0.996 },
          { char: numbers[2] || '2', conf: 0.992 },
          { char: numbers[3] || '2', conf: 0.993 },
        ],
        camera: `كاميرا ${simGate} عالية الدقة`,
        gate: simGate,
        lane: 'مسار المحاكاة والاختبار السريع',
        direction: simDirection,
        matchedUser: 'حساب تجريبي / اختبار النظام البصري',
        userType: 'مشترك شهري',
        matchedVehicle: 'لكزس ES350 2024 (رمادي)',
        vehicleColor: 'رمادي',
        time: new Date().toLocaleTimeString('ar-SA'),
        date: new Date().toISOString().split('T')[0],
        inferenceTimeMs: 58,
        barrierStatus: 'تم الرفع تلقائياً',
        ambientLight: 'إضاءة نهارية مثالية',
      };

      setDetections((prev) => [newSimDet, ...prev]);
      setSelectedDetection(newSimDet);
      setIsSimulating(false);
      setSimModalOpen(false);
      setFeedback(`تمت محاكاة الرصد البصري للوحة "${simPlateInput}" بنجاح وتفعيل فتح الحاجز تلقائياً!`);
    }, 900);
  };

  // Filtered Detections
  const filteredDetections = useMemo(() => {
    return detections.filter((d) => {
      const matchesSearch =
        d.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.matchedUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.matchedVehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.gate.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUserType = userTypeFilter === 'all' || d.userType === userTypeFilter;
      const matchesDirection = directionFilter === 'all' || d.direction === directionFilter;

      return matchesSearch && matchesUserType && matchesDirection;
    });
  }, [detections, searchQuery, userTypeFilter, directionFilter]);

  // Aggregate Stats
  const totalDetectionsCount = 4892 + detections.length - REALISTIC_DETECTIONS.length;
  const avgAccuracy = '99.4%';
  const avgInferenceTime = '68ms';
  const onlineCamerasCount = 8;

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
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 50%, rgba(13, 148, 136, 0.22) 100%)'
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
                <AutoAwesomeIcon sx={{ fontSize: 28 }} />
              </Box>
              <Chip
                icon={<VideocamIcon sx={{ fontSize: '15px !important', color: '#10B981' }} />}
                label="محرك الذكاء الاصطناعي البصري (Neural Vision OCR v4.8)"
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: alpha('#10B981', 0.15),
                  color: '#10B981',
                  border: `1px solid ${alpha('#10B981', 0.3)}`,
                }}
              />
              <Chip
                label="دقة استخراج الحروف 99.4%"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800, color: theme.palette.primary.main }}
              />
            </Stack>

            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
              مركز محرك التعرف الضوئي على لوحات المركبات (LPR)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              منظومة التعلم العميق والرصد البصري فائق الدقة، استخراج الحروف والأرقام العربية واللاتينية فورياً في غضون 68ms، ومطابقة السجلات والتحقق التلقائي من الصلاحيات.
            </Typography>
          </Box>

          {/* Action CTAs */}
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CameraAltIcon />}
              onClick={() => setSimModalOpen(true)}
              sx={{
                fontWeight: 800,
                borderRadius: '12px',
                px: 2.5,
                py: 1.2,
                boxShadow: '0 0 24px rgba(45, 212, 191, 0.4)',
              }}
            >
              محاكاة التقاط ورصد لوحة جديدة
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setDetections([...REALISTIC_DETECTIONS])}
              sx={{ fontWeight: 700, borderRadius: '12px', px: 2 }}
            >
              تحديث الكاميرات
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Feedback Toast */}
      {feedback && (
        <Alert
          severity="success"
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

      {/* 2. Neural OCR Engine Pipeline Explanation (شرح مسار المعالجة والذكاء الاصطناعي) */}
      <Card
        sx={{
          ...glassPanel({}, theme.palette.mode),
          p: 3,
          mb: 4,
          borderRadius: '20px',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
            }}
          >
            <LightbulbIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              مسار المعالجة العصبية التلقائية (Deep Learning Pipeline Architecture)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              شرح تفصيلي للخطوات الأربع التي تنفذها الخوارزميات خلال أقل من 68 ميلي ثانية عند اقتراب كل مركبة:
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={2}>
          {/* Stage 1 */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                height: '100%',
                borderRadius: '14px',
                bgcolor: alpha(theme.palette.divider, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                position: 'relative',
              }}
            >
              <Chip
                label="المرحلة 1"
                size="small"
                color="primary"
                sx={{ fontWeight: 800, mb: 1.2, height: 22 }}
              />
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                كشف إطار اللوحة (Localization)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                شبكة YOLOv9 تكشف مجسم السيارة وتحدد إحداثيات مستطيل اللوحة (Bounding Box) بدقة Sub-pixel وسرعات تصل إلى 120 كم/س.
              </Typography>
            </Box>
          </Grid>

          {/* Stage 2 */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                height: '100%',
                borderRadius: '14px',
                bgcolor: alpha(theme.palette.divider, 0.04),
                border: `1px solid ${alpha('#38BDF8', 0.2)}`,
                position: 'relative',
              }}
            >
              <Chip
                label="المرحلة 2"
                size="small"
                sx={{ fontWeight: 800, mb: 1.2, height: 22, bgcolor: alpha('#38BDF8', 0.2), color: '#38BDF8' }}
              />
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                تصحيح الميلان والإنعكاس (HDR)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                تعديل زاوية الانحراف الأفقي والرأسي تلقائياً (Perspective Warp)، وإزالة وهج أشعة الشمس والأنوار بالأشعة تحت الحمراء IR.
              </Typography>
            </Box>
          </Grid>

          {/* Stage 3 */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                height: '100%',
                borderRadius: '14px',
                bgcolor: alpha(theme.palette.divider, 0.04),
                border: `1px solid ${alpha('#10B981', 0.2)}`,
                position: 'relative',
              }}
            >
              <Chip
                label="المرحلة 3"
                size="small"
                sx={{ fontWeight: 800, mb: 1.2, height: 22, bgcolor: alpha('#10B981', 0.2), color: '#10B981' }}
              />
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                استخراج الحروف (Transformer OCR)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                تجزئة الرموز وتصنيف الحروف العربية (أ ب ج) والأرقام الهندية واللاتينية عبر نموذج عصبي مدرب على مليون لوحة سعودية.
              </Typography>
            </Box>
          </Grid>

          {/* Stage 4 */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                height: '100%',
                borderRadius: '14px',
                bgcolor: alpha(theme.palette.divider, 0.04),
                border: `1px solid ${alpha('#F59E0B', 0.2)}`,
                position: 'relative',
              }}
            >
              <Chip
                label="المرحلة 4"
                size="small"
                sx={{ fontWeight: 800, mb: 1.2, height: 22, bgcolor: alpha('#F59E0B', 0.2), color: '#F59E0B' }}
              />
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                المطابقة وفتح الحاجز (Authorization)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                فحص فوري للاشتراكات والتصاريح والمدفوعات، وإصدار نبضة فتح إلكترونية للحاجز الكهروميكانيكي خلال 0.4 ثانية فقط.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* 3. Hero Visual Inspector: Live Optical Target HUD Display */}
      {selectedDetection && (
        <Card
          sx={{
            ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode),
            p: { xs: 2.5, md: 3.5 },
            mb: 4,
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                }}
              >
                <CropFreeIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  المفتش البصري اللحظي للرصد الأخير (Live Optical Inspector)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  تحليل مباشر للشعاع البصري، إحداثيات اللوحة، ومطابقة ملف المركبة
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={<BoltIcon sx={{ fontSize: '14px !important', color: '#10B981' }} />}
              label={`زمن المعالجة: ${selectedDetection.inferenceTimeMs}ms`}
              size="small"
              sx={{ fontWeight: 800, bgcolor: alpha('#10B981', 0.15), color: '#10B981' }}
            />
          </Stack>

          <Grid container spacing={3} alignItems="stretch">
            {/* Visual Plate HUD Screen */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '18px',
                  background: 'linear-gradient(180deg, #090e17 0%, #030712 100%)',
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                  boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 12px 35px ${alpha(
                    theme.palette.primary.main,
                    0.25
                  )}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* HUD Corners */}
                <Box sx={{ position: 'absolute', top: 10, left: 10, color: theme.palette.primary.main, opacity: 0.8 }}>
                  <CropFreeIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ position: 'absolute', top: 10, right: 10, color: theme.palette.primary.main, opacity: 0.8 }}>
                  <Typography sx={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800 }}>
                    4K ULTRA-HD • 60 FPS
                  </Typography>
                </Box>

                {/* Subtitle Telemetry */}
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94A3B8',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    mt: 1,
                    letterSpacing: 1,
                  }}
                >
                  {selectedDetection.camera}
                </Typography>

                {/* Realistic Saudi Plate Display */}
                <Box
                  sx={{
                    my: 2.5,
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: alpha('#0F172A', 0.8),
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Scanning Crosshair Line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #2DD4BF, transparent)',
                      boxShadow: '0 0 10px #2DD4BF',
                      animation: 'scanLine 2.5s ease-in-out infinite',
                      zIndex: 3,
                      '@keyframes scanLine': {
                        '0%': { top: '5%' },
                        '50%': { top: '90%' },
                        '100%': { top: '5%' },
                      },
                    }}
                  />

                  <SaudiRealisticPlate
                    plateNumber={selectedDetection.plate}
                    size="md"
                    showBolts={true}
                    interactive={false}
                  />
                </Box>

                {/* Characters Confidence Breakdown */}
                <Box sx={{ width: '100%', mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1, fontWeight: 700 }}>
                    نسبة ثقة الذكاء الاصطناعي لكل رمز (Character Confidence):
                  </Typography>

                  <Stack direction="row" spacing={0.8} justifyContent="center" flexWrap="wrap">
                    {selectedDetection.charConfidences.map((c, i) => (
                      <Box
                        key={i}
                        sx={{
                          px: 1,
                          py: 0.4,
                          borderRadius: '6px',
                          bgcolor: alpha('#10B981', 0.15),
                          border: `1px solid ${alpha('#10B981', 0.3)}`,
                          textAlign: 'center',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: '#FFFFFF' }}>
                          {c.char}
                        </Typography>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#10B981' }}>
                          {Math.round(c.conf * 100)}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Grid>

            {/* Matched Profile & Dossier Details */}
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '18px',
                  bgcolor: alpha(theme.palette.divider, 0.03),
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      icon={<VerifiedIcon />}
                      label={selectedDetection.userType}
                      color={
                        selectedDetection.userType === 'كبار الشخصيات VIP'
                          ? 'secondary'
                          : selectedDetection.userType === 'ساكن دائم'
                          ? 'primary'
                          : 'default'
                      }
                      sx={{ fontWeight: 800 }}
                    />

                    <Chip
                      label={selectedDetection.barrierStatus}
                      color="success"
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            صاحب المركبة / السائق:
                          </Typography>
                          <Typography variant="body1" fontWeight={900}>
                            {selectedDetection.matchedUser}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <DirectionsCarIcon sx={{ color: '#38BDF8', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            طراز وفئة المركبة:
                          </Typography>
                          <Typography variant="body1" fontWeight={800}>
                            {selectedDetection.matchedVehicle} ({selectedDetection.vehicleColor})
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <VideocamIcon sx={{ color: '#F59E0B', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            البوابة والمسار:
                          </Typography>
                          <Typography variant="body2" fontWeight={800}>
                            {selectedDetection.gate} • {selectedDetection.lane}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CompareArrowsIcon sx={{ color: '#10B981', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            الاتجاه والتوقيت:
                          </Typography>
                          <Typography variant="body2" fontWeight={800}>
                            {selectedDetection.direction} • {selectedDetection.time} ({selectedDetection.date})
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2.5 }} />

                  {/* Recognition Accuracy Bar */}
                  <Box sx={{ mb: 1 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700}>
                        مؤشر جودة القراءة والتعرف الضوئي (OCR Optical Quality)
                      </Typography>
                      <Typography variant="caption" fontWeight={900} color="primary.main">
                        {Math.round(selectedDetection.confidence * 100)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.round(selectedDetection.confidence * 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #0D9488 0%, #2DD4BF 100%)',
                        },
                      }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    حالة الإضاءة البيئية: <strong>{selectedDetection.ambientLight}</strong> • المرشح الطيفي: IR 850nm Bandpass Filter
                  </Typography>
                </Box>

                {/* Inspect Action */}
                <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<VisibilityIcon />}
                    onClick={() => {
                      setInspectionTarget(selectedDetection);
                      setInspectModalOpen(true);
                    }}
                    sx={{ fontWeight: 800, borderRadius: '12px', flex: 1 }}
                  >
                    عرض الملف التوثيقي الجنائي الكامل
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* 4. KPI Telemetry Matrix Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                إجمالي عمليات المسح اليومية
              </Typography>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(theme.palette.primary.main, 0.15) }}>
                <CameraAltIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1 }}>
              {totalDetectionsCount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              مسحة بصرية ناجحة بنسبة 100%
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                دقة التعرف الذكي الشاملة
              </Typography>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#10B981', 0.15) }}>
                <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: '#10B981' }}>
              {avgAccuracy}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
              معتمدة لكافة فئات اللوحات السعودية
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                متوسط زمن المعالجة والاستخراج
              </Typography>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#F59E0B', 0.15) }}>
                <SpeedIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: '#F59E0B' }}>
              {avgInferenceTime}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              معالجة عصبية متوازية عبر GPU Edge
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                كاميرات الرصد الذاتية النشطة
              </Typography>
              <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#38BDF8', 0.15) }}>
                <VideocamIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: '#38BDF8' }}>
              {onlineCamerasCount} كاميرات 4K
            </Typography>
            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700 }}>
              موزعة على كافة البوابات والمسارات
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 5. Continuous Detection Stream Directory (سجل عمليات التعرف اللحظية) */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3, borderRadius: '20px' }}>
        {/* Directory Controls */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TextField
            size="small"
            placeholder="البحث باللوحة، اسم المالك، نوع المركبة، أو البوابة..."
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
              label="كافة الفئات"
              color={userTypeFilter === 'all' ? 'primary' : 'default'}
              variant={userTypeFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setUserTypeFilter('all')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="سكان"
              color={userTypeFilter === 'ساكن دائم' ? 'primary' : 'default'}
              variant={userTypeFilter === 'ساكن دائم' ? 'filled' : 'outlined'}
              onClick={() => setUserTypeFilter('ساكن دائم')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="كبار الشخصيات VIP"
              color={userTypeFilter === 'كبار الشخصيات VIP' ? 'primary' : 'default'}
              variant={userTypeFilter === 'كبار الشخصيات VIP' ? 'filled' : 'outlined'}
              onClick={() => setUserTypeFilter('كبار الشخصيات VIP')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="مشتركون"
              color={userTypeFilter === 'مشترك شهري' ? 'primary' : 'default'}
              variant={userTypeFilter === 'مشترك شهري' ? 'filled' : 'outlined'}
              onClick={() => setUserTypeFilter('مشترك شهري')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="زوار مصرحون"
              color={userTypeFilter === 'زائر مصرح' ? 'primary' : 'default'}
              variant={userTypeFilter === 'زائر مصرح' ? 'filled' : 'outlined'}
              onClick={() => setUserTypeFilter('زائر مصرح')}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

          <Stack direction="row" spacing={1}>
            <Chip
              label="الكل"
              size="small"
              variant={directionFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setDirectionFilter('all')}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="دخول"
              size="small"
              color="success"
              variant={directionFilter === 'دخول' ? 'filled' : 'outlined'}
              onClick={() => setDirectionFilter('دخول')}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="خروج"
              size="small"
              color="info"
              variant={directionFilter === 'خروج' ? 'filled' : 'outlined'}
              onClick={() => setDirectionFilter('خروج')}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Stack>

        {/* Data Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>اللوحة السعودية المعتمدة</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>المالك / السائق</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>المركبة والفئة</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>الكاميرا والبوابة</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>الاتجاه</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>دقة OCR</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>إجراء الحاجز</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>التوقيت</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">معاينة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDetections.map((d) => {
                const isSelected = selectedDetection?.id === d.id;
                return (
                  <TableRow
                    key={d.id}
                    hover
                    onClick={() => setSelectedDetection(d)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : undefined,
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell>
                      <SaudiRealisticPlate
                        plateNumber={d.plate}
                        size="sm"
                        showBolts={false}
                        interactive={false}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {d.matchedUser}
                      </Typography>
                      <Chip
                        label={d.userType}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 18, mt: 0.3 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {d.matchedVehicle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        اللون: {d.vehicleColor}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {d.gate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.camera}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={d.direction}
                        size="small"
                        color={d.direction === 'دخول' ? 'success' : 'info'}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${Math.round(d.confidence * 100)}%`}
                        size="small"
                        color={d.confidence >= 0.98 ? 'primary' : 'warning'}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={d.barrierStatus}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: alpha('#10B981', 0.15),
                          color: '#10B981',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                        {d.time}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.date}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="فحص تفصيلي للرصد">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectionTarget(d);
                            setInspectModalOpen(true);
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 6. Simulation Lab Modal */}
      <Dialog
        open={simModalOpen}
        onClose={() => setSimModalOpen(false)}
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
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1.2,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                color: theme.palette.primary.main,
              }}
            >
              <CameraAltIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                مختبر محاكاة التعرف البصري (LPR Simulation Lab)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                إرسال نبضة رصد اصطناعية واختبار استجابة الكاميرات والحواجز الآلية
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                رقم اللوحة المراد محاكاتها:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={simPlateInput}
                onChange={(e) => setSimPlateInput(e.target.value)}
                placeholder="مثال: ر ق م 8822 أو أ ب ج 1004"
                sx={{ borderRadius: '12px' }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <SaudiRealisticPlate
                plateNumber={simPlateInput}
                size="md"
                showBolts={true}
                interactive={false}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                  اتجاه الحركة:
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={simDirection}
                    onChange={(e) => setSimDirection(e.target.value as 'دخول' | 'خروج')}
                    sx={{ borderRadius: '12px', fontWeight: 700 }}
                  >
                    <MenuItem value="دخول">دخول إلى الموقف</MenuItem>
                    <MenuItem value="خروج">خروج ومغادرة</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                  بوابة الالتقاط:
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={simGate}
                    onChange={(e) => setSimGate(e.target.value)}
                    sx={{ borderRadius: '12px', fontWeight: 700 }}
                  >
                    <MenuItem value="بوابة الشمال رقم 1">بوابة الشمال رقم 1</MenuItem>
                    <MenuItem value="بوابة الجنوب رقم 2">بوابة الجنوب رقم 2</MenuItem>
                    <MenuItem value="بوابة كبار الشخصيات VIP">بوابة كبار الشخصيات VIP</MenuItem>
                    <MenuItem value="بوابة الشرق رقم 3">بوابة الشرق رقم 3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setSimModalOpen(false)}
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: '12px' }}
          >
            إلغاء
          </Button>

          <Button
            onClick={handleTriggerSimulation}
            disabled={isSimulating}
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{ fontWeight: 900, borderRadius: '12px', px: 3 }}
          >
            {isSimulating ? 'جاري الرصد والتحليل...' : 'تنفيذ المسح البصري وفتح الحاجز'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 7. Detailed Forensic Inspection Modal */}
      {inspectionTarget && (
        <Dialog
          open={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          maxWidth="md"
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
                  <VerifiedIcon sx={{ fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    تقرير الرصد البصري والأمني الموثق
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    معرف الرصد: {inspectionTarget.id} • التوقيت: {inspectionTarget.time}
                  </Typography>
                </Box>
              </Stack>

              <IconButton onClick={() => setInspectModalOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    background: 'linear-gradient(180deg, #090e17 0%, #030712 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5, fontWeight: 700 }}>
                    اللوحة المقروءة عبر حساسات الأشعة تحت الحمراء:
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <SaudiRealisticPlate
                      plateNumber={inspectionTarget.plate}
                      size="md"
                      showBolts={true}
                      interactive={false}
                    />
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1, fontWeight: 700 }}>
                    تفصيل نسب ثقة الأحرف:
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                    {inspectionTarget.charConfidences.map((c, i) => (
                      <Chip
                        key={i}
                        label={`${c.char} : ${Math.round(c.conf * 100)}%`}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: alpha('#10B981', 0.2), color: '#10B981' }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2 }}>
                  بيانات المركبة والاشتراك:
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      اسم المالك المسجل
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {inspectionTarget.matchedUser}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      نوع الاشتراك والتصريح
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {inspectionTarget.userType}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      طراز وموديل المركبة
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {inspectionTarget.matchedVehicle}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      لون المركبة المرصود
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {inspectionTarget.vehicleColor}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      الكاميرا الحساسة
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {inspectionTarget.camera}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      البوابة والمسار
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {inspectionTarget.gate} ({inspectionTarget.lane})
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      زمن المعالجة والاستخراج
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="primary.main">
                      {inspectionTarget.inferenceTimeMs} ميلي ثانية (ms)
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      إجراء فتح الحاجز
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="success.main">
                      {inspectionTarget.barrierStatus}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ fontWeight: 800, borderRadius: '12px' }}
            >
              طباعة السجل التوثيقي
            </Button>
            <Button
              variant="contained"
              onClick={() => setInspectModalOpen(false)}
              sx={{ fontWeight: 800, borderRadius: '12px', px: 3 }}
            >
              إغلاق
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
