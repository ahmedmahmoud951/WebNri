import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StraightIcon from '@mui/icons-material/Straight';
import TurnLeftIcon from '@mui/icons-material/TurnLeft';
import TurnRightIcon from '@mui/icons-material/TurnRight';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LayersIcon from '@mui/icons-material/Layers';
import EvStationIcon from '@mui/icons-material/EvStation';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import SecurityIcon from '@mui/icons-material/Security';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import NearMeIcon from '@mui/icons-material/NearMe';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { smartParkingApi, type FindCarResponse } from '../../core/api/smartParkingApi';

// Demo Saudi Vehicles Catalog with real 4K CCTV snapshots and authentic profiles
const DEMO_VEHICLES_MAP: Record<
  string,
  {
    plateAr: string;
    plateEn: string;
    makeAr: string;
    modelAr: string;
    colorAr: string;
    colorHex: string;
    building: string;
    floor: string;
    floorKey: 'GF' | 'B1' | 'B2' | 'VIP';
    spot: string;
    bayNum: number;
    imageUrl: string;
    entryTime: string;
    durationParked: string;
    fee: number;
    status: 'VIP' | 'Authorized' | 'Visitor' | 'EV';
    statusLabel: string;
  }
> = {
  '1004': {
    plateAr: 'أ ب ج 1004',
    plateEn: '1004 JBA',
    makeAr: 'تويوتا',
    modelAr: 'لاند كروزر 300 VXR',
    colorAr: 'أبيض لؤلؤي',
    colorHex: '#F8FAFC',
    building: 'برج أ - واحة الأعمال والضيافة',
    floor: 'الدور الأرضي (GF) • المنطقة الشرقية',
    floorKey: 'GF',
    spot: 'A-104',
    bayNum: 104,
    imageUrl: '/images/cctv_cam1_landcruiser.jpg',
    entryTime: 'منذ ساعة و 35 دقيقة (13:45)',
    durationParked: '1 ساعة و 35 دقيقة',
    fee: 15,
    status: 'Authorized',
    statusLabel: 'اشتراك سنوي معتمد',
  },
  '8080': {
    plateAr: 'س ع د 8080',
    plateEn: '8080 DAS',
    makeAr: 'لكزس',
    modelAr: 'LX 600 VIP Black Edition',
    colorAr: 'أسود ملكي',
    colorHex: '#0F172A',
    building: 'المبنى الملكي - جناح الضيافة',
    floor: 'دور كبار الشخصيات VIP • الجناح الذهبي',
    floorKey: 'VIP',
    spot: 'VIP-06',
    bayNum: 106,
    imageUrl: '/images/cctv_cam2_lexus_vip.jpg',
    entryTime: 'منذ ساعتين و 10 دقائق (13:10)',
    durationParked: '2 ساعة و 10 دقائق',
    fee: 0,
    status: 'VIP',
    statusLabel: 'تصريح كبار الشخصيات VIP',
  },
  '9999': {
    plateAr: 'ف هـ د 9999',
    plateEn: '9999 DHF',
    makeAr: 'مرسيدس-بنز',
    modelAr: 'S-580 4MATIC مايباخ',
    colorAr: 'فضي ألماسي',
    colorHex: '#CBD5E1',
    building: 'برج ب - المركز المالي التنفيذي',
    floor: 'المستوى السفلي الأول (B1) • الرواق 2',
    floorKey: 'B1',
    spot: 'B-109',
    bayNum: 109,
    imageUrl: '/images/cctv_cam3_mercedes_exit.jpg',
    entryTime: 'منذ 45 دقيقة (14:35)',
    durationParked: '45 دقيقة',
    fee: 10,
    status: 'Authorized',
    statusLabel: 'تصريح تنفيذي مصرح',
  },
  '1446': {
    plateAr: 'ق م ر 1446',
    plateEn: '1446 RMQ',
    makeAr: 'بورش',
    modelAr: 'كايين GTS كوبيه',
    colorAr: 'رمادي طباشيري',
    colorHex: '#94A3B8',
    building: 'برج أ - واحة الأعمال والضيافة',
    floor: 'الدور الأرضي (GF) • الجناح الغربي',
    floorKey: 'GF',
    spot: 'A-112',
    bayNum: 112,
    imageUrl: '/images/cctv_cam4_porsche.jpg',
    entryTime: 'منذ 55 دقيقة (14:25)',
    durationParked: '55 دقيقة',
    fee: 12,
    status: 'Visitor',
    statusLabel: 'تذكرة زائر رقمية نشطة',
  },
  '1111': {
    plateAr: 'ر ي ض 1111',
    plateEn: '1111 DYR',
    makeAr: 'رينج روفر',
    modelAr: 'أوتوبيوغرافي LWB',
    colorAr: 'أبيض سانتوريني',
    colorHex: '#F1F5F9',
    building: 'المبنى الملكي - جناح الضيافة',
    floor: 'دور كبار الشخصيات VIP • الجناح الذهبي',
    floorKey: 'VIP',
    spot: 'VIP-07',
    bayNum: 107,
    imageUrl: '/images/cctv_cam5_rangerover.jpg',
    entryTime: 'منذ 3 ساعات (12:20)',
    durationParked: '3 ساعات',
    fee: 0,
    status: 'VIP',
    statusLabel: 'تصريح كبار الشخصيات VIP',
  },
};

export function FindCarPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FindCarResponse | null>(null);
  const [hornActive, setHornActive] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeFloor, setActiveFloor] = useState<'GF' | 'B1' | 'B2' | 'VIP'>('GF');

  // Interactive Live Walk Simulation State
  const [isWalking, setIsWalking] = useState(false);
  const [walkProgress, setWalkProgress] = useState(0); // 0 to 1
  const [walkSpeed, setWalkSpeed] = useState<1 | 2>(1);

  // Active vehicle metadata state
  const [activeVehicleImage, setActiveVehicleImage] = useState<string>('/images/cctv_cam1_landcruiser.jpg');

  const handleSearch = async (queryPlate?: string) => {
    const targetPlate = (queryPlate || plate).trim();
    if (!targetPlate) return;
    setLoading(true);
    setError(null);
    setIsWalking(false);
    setWalkProgress(0);

    try {
      // Check if targetPlate matches one of our master demo catalog vehicles
      const cleanDigits = targetPlate.replace(/[^0-9]/g, '');
      const catalogMatch = DEMO_VEHICLES_MAP[cleanDigits] || Object.values(DEMO_VEHICLES_MAP).find(
        (v) => v.plateAr.includes(targetPlate) || targetPlate.includes(cleanDigits)
      );

      if (catalogMatch) {
        setActiveVehicleImage(catalogMatch.imageUrl);
        setActiveFloor(catalogMatch.floorKey);
        setResult({
          vehicleId: `veh-${cleanDigits || '1004'}`,
          plate: catalogMatch.plateAr,
          plateArabic: catalogMatch.plateAr,
          plateEnglish: catalogMatch.plateEn,
          vehicleMake: catalogMatch.makeAr,
          vehicleModel: `${catalogMatch.makeAr} ${catalogMatch.modelAr}`,
          vehicleColor: catalogMatch.colorAr,
          building: catalogMatch.building,
          floor: catalogMatch.floor,
          spot: catalogMatch.spot,
          entryTime: catalogMatch.entryTime,
          durationParked: catalogMatch.durationParked,
          accumulatedFee: catalogMatch.fee,
          paymentStatus: catalogMatch.fee === 0 ? 'Subscribed' : 'Unpaid',
          coordinates: { x: 469, y: 145, floorNumber: 0 },
          nearestEntrance: 'بهو الاستقبال الرئيسي (البوابة 01)',
          nearestElevator: 'المصعد المركزي (Elevator Bank A)',
          navigationPath: [],
          directions: [
            'انطلق من بهو الاستقبال الرئيسي (البوابة 01) وتجاوز البوابات الذكية.',
            'تابع السير بمحاذاة الرواق الداخلي لمسافة 15 متراً مروراً بمجموعة المصاعد A.',
            'انعطف يساراً عند تقاطع الممر (Zone A) نحو صف المواقف المظللة.',
            `وصلت إلى وجهتك: سيارتك متوقفة بالخانة المضاءة (${catalogMatch.spot}) تحت الرصد المباشر.`,
          ],
        });
      } else {
        const data = await smartParkingApi.findMyCar(targetPlate);
        if (data) {
          setResult(data);
          setActiveVehicleImage('/images/cctv_cam1_landcruiser.jpg');
          if (
            data.floor?.includes('المستوى السفلي الأول') ||
            data.floor?.includes('القبو الأول') ||
            data.floor?.includes('B1') ||
            data.spot?.includes('B-')
          ) {
            setActiveFloor('B1');
          } else if (data.floor?.includes('VIP') || data.spot?.includes('VIP')) {
            setActiveFloor('VIP');
          } else {
            setActiveFloor('GF');
          }
        } else {
          setError('لم يتم العثور على موقع السيارة حالياً. تأكد من صحة رقم اللوحة.');
        }
      }
    } catch {
      setError('تعذر جلب موقع السيارة. يرجى إعادة المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  const handleHonkAndFlash = () => {
    setHornActive(true);
    setActionNotice('تم إرسال إشارة لاسلكية فورية: وميض إضاءة الموقف والصوت التنبيهي نشط الآن! 🔊💡');
    setTimeout(() => setHornActive(false), 5500);
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const text = encodeURIComponent(
      `🇸🇦 موقع سيارتي في مواقف NRI الذكية:\n• رقم اللوحة: ${result.plate}\n• المبنى: ${result.building}\n• الدور والمنطقة: ${result.floor}\n• الموقف المضاء: ${result.spot}\n• أقرب مصعد: ${result.nearestElevator}\n📍 رابط الملاحة الداخلية المباشر:\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Determine dynamic bay calculations
  const match = result?.spot?.match(/(\d+)/);
  let bayNum = match ? parseInt(match[1], 10) : 104;
  if (bayNum < 101 || bayNum > 114) {
    bayNum = 101 + (Math.abs(bayNum) % 14);
  }
  const isTop = bayNum <= 107;
  const colIndex = isTop ? bayNum - 101 : bayNum - 108;

  // Architectural Layout Coordinates (viewBox 0 0 960 520)
  // 7 bays per row: colIndex 0..6. Each bay width=100, gap=18. Left offset=65.
  const bayTargetX = 65 + colIndex * 118 + 50;
  const bayTargetY = isTop ? 145 : 340;

  // Navigation Waypoints: Start Lobby -> Hallway Junction -> Bay Column Junction -> Target Slot
  const startX = 95;
  const startY = 460;
  const w1X = 95;
  const w1Y = 240;
  const w2X = bayTargetX;
  const w2Y = 240;
  const destX = bayTargetX;
  const destY = isTop ? 145 : 340;

  const pathData = `M ${startX} ${startY} L ${w1X} ${w1Y} L ${w2X} ${w2Y} L ${destX} ${destY}`;

  // Walking Path Segments for Smooth Animation
  const seg1Length = startY - w1Y; // 220
  const seg2Length = Math.abs(w2X - w1X);
  const seg3Length = Math.abs(destY - w2Y);
  const totalPathLength = seg1Length + seg2Length + seg3Length;

  // Dynamic Person Position & Angle calculation along the path
  const currentPersonState = useMemo(() => {
    const dist = walkProgress * totalPathLength;

    if (dist <= seg1Length) {
      const ratio = dist / seg1Length;
      return {
        x: startX,
        y: startY - ratio * seg1Length,
        angle: -90, // heading North (upwards)
        activeStepIdx: 0,
      };
    } else if (dist <= seg1Length + seg2Length) {
      const ratio = (dist - seg1Length) / (seg2Length || 1);
      const movingRight = w2X >= w1X;
      return {
        x: startX + ratio * (w2X - startX),
        y: w1Y,
        angle: movingRight ? 0 : 180, // heading East (right) or West
        activeStepIdx: 1,
      };
    } else {
      const ratio = (dist - (seg1Length + seg2Length)) / (seg3Length || 1);
      return {
        x: destX,
        y: w2Y + ratio * (destY - w2Y),
        angle: isTop ? -90 : 90, // heading into top or bottom bay
        activeStepIdx: walkProgress >= 0.98 ? 3 : 2,
      };
    }
  }, [walkProgress, totalPathLength, seg1Length, seg2Length, seg3Length, startX, startY, w1X, w1Y, w2X, w2Y, destX, destY, isTop]);

  // Live walking ticker
  useEffect(() => {
    if (!isWalking) return;
    const interval = setInterval(() => {
      setWalkProgress((prev) => {
        const step = 0.007 * walkSpeed;
        const next = prev + step;
        if (next >= 1) {
          setIsWalking(false);
          setActionNotice('تهانينا! لقد وصلت بنجاح إلى موقف سيارتك 🎯 سيارتك رابضة مباشرة أمامك.');
          return 1;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isWalking, walkSpeed]);

  const handleToggleWalk = () => {
    if (walkProgress >= 1) {
      setWalkProgress(0);
      setIsWalking(true);
    } else {
      setIsWalking((prev) => !prev);
    }
  };

  const handleResetWalk = () => {
    setIsWalking(false);
    setWalkProgress(0);
  };

  // Turn-by-Turn Structured Steps in authentic Arabic
  const turnByTurnSteps = useMemo(() => {
    return [
      {
        title: 'نقطة الانطلاق: بهو الاستقبال الرئيسي (Lobby 01)',
        desc: 'ابدأ السير من مدخل البهو الرئيسي وتجاوز البوابات الزجاجية الذكية.',
        icon: <MyLocationIcon sx={{ fontSize: 20 }} />,
        distance: '0 متراً',
      },
      {
        title: 'الرواق الأوسط بمحاذاة المصاعد (Elevator Bank A)',
        desc: 'تابع السير للأمام مسافة 15 متراً في الممر المركزي حتى نقطة التقاطع الشرقية.',
        icon: <StraightIcon sx={{ fontSize: 20 }} />,
        distance: '15 متراً',
      },
      {
        title: `الانعطاف نحو مسار المواقف المظللة (${result?.spot || 'A-104'})`,
        desc: isTop
          ? 'انعطف يساراً نحو صف المواقف الأمامي باتجاه الخانة المضاءة.'
          : 'انعطف يميناً نحو صف المواقف الجنوبي باتجاه الخانة المضاءة.',
        icon: isTop ? <TurnLeftIcon sx={{ fontSize: 20 }} /> : <TurnRightIcon sx={{ fontSize: 20 }} />,
        distance: '28 متراً',
      },
      {
        title: `الوصول للموقف المستهدف (${result?.spot || 'A-104'})`,
        desc: `سيارتك رابضة في الموقف المضاء (${result?.spot || 'A-104'}) تحت مراقبة كاميرا السقف والحساس الذكي.`,
        icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
        distance: '38 متراً (الوصول)',
      },
    ];
  }, [isTop, result]);

  return (
    <Box sx={{ pb: 8 }}>
      {/* Laser Animation Styles & Realistic Radiant Glows */}
      <style>{`
        @keyframes laserFlowRealistic {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseGlowRing {
          0% { r: 8px; opacity: 0.95; }
          60% { r: 32px; opacity: 0.3; }
          100% { r: 46px; opacity: 0; }
        }
        @keyframes walkingFootstepRipple {
          0% { r: 4px; opacity: 0.9; }
          50% { r: 16px; opacity: 0.4; }
          100% { r: 26px; opacity: 0; }
        }
        @keyframes targetSpotHighlight {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(0, 240, 255, 0.85)) drop-shadow(0 0 28px rgba(0, 240, 255, 0.45));
          }
          50% {
            filter: drop-shadow(0 0 24px rgba(0, 240, 255, 1)) drop-shadow(0 0 45px rgba(0, 240, 255, 0.75));
          }
        }
        @keyframes beaconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes liveRadarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header Bar */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2.5}
        sx={{ mb: 3.5 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.75}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0284C7 0%, #00F0FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#040812',
                boxShadow: '0 8px 24px rgba(0, 240, 255, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
              }}
            >
              <NavigationIcon sx={{ fontSize: 30 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  letterSpacing: -0.5,
                  background: 'linear-gradient(90deg, #FFFFFF 30%, #38BDF8 70%, #00F0FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                منظومة الاستدلال الذكي والملاحة الداخلية • أين سيارتي؟
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5, fontWeight: 600 }}>
                مخطط التموضع المكاني الداخلي وتوجيه المسار خطوة بخطوة من موقعك حتى موقف المركبة بدقة فائقة
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Live System Signal Badge */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />}
            label="نظام التموضع الداخلي (IPS) نشط ومتزامن مع كاميرات LPR"
            sx={{
              py: 0.7,
              px: 1.2,
              fontWeight: 900,
              fontSize: 12,
              bgcolor: 'rgba(16, 185, 129, 0.14)',
              color: '#10B981',
              border: '1.5px solid rgba(16, 185, 129, 0.45)',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
            }}
          />
        </Stack>
      </Stack>

      {/* Search Input Box Card */}
      <Card
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: '24px',
          bgcolor: 'rgba(11, 18, 32, 0.94)',
          backdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(0, 240, 255, 0.35)',
          boxShadow:
            '0 20px 48px rgba(0, 0, 0, 0.65), 0 0 30px rgba(0, 240, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1.5, color: '#F8FAFC', fontSize: 15 }}>
          البحث الفوري برقم لوحة المركبة (License Plate Quick Search):
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            placeholder="أدخل أرقام أو حروف لوحة سيارتك (مثال: 1004 أو أ ب ج 1004 أو 8080)..."
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(5, 9, 20, 0.9)',
                borderRadius: '16px',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                color: '#F8FAFC',
                fontWeight: 700,
                fontSize: 15,
                '&:hover': { borderColor: '#00F0FF', boxShadow: '0 0 14px rgba(0, 240, 255, 0.25)' },
                '&.Mui-focused': { borderColor: '#00F0FF', boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)' },
                '& fieldset': { border: 'none' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DirectionsCarIcon sx={{ color: '#00F0FF', fontSize: 24 }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            onClick={() => void handleSearch()}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.4,
              fontWeight: 900,
              fontSize: 15,
              minWidth: 190,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00F0FF 0%, #0284C7 100%)',
              color: '#050D1A',
              boxShadow: '0 6px 24px rgba(0, 240, 255, 0.45)',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #38BDF8 0%, #00F0FF 100%)',
                boxShadow: '0 8px 32px rgba(0, 240, 255, 0.65)',
                transform: 'translateY(-1px)',
              },
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'جاري الرصد والملاحة...' : 'تحديد موقع سيارتي'}
          </Button>
        </Stack>

        {/* Quick Demo Plate Badges */}
        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, fontSize: 12 }}>
            لوحات تجريبية نشطة للرصد الفوري:
          </Typography>
          {[
            { label: 'أ ب ج 1004 (تويوتا لاند كروزر • A-104)', q: '1004' },
            { label: 'س ع د 8080 (لكزس LX 600 • VIP-06)', q: '8080' },
            { label: 'ف هـ د 9999 (مرسيدس مايباخ • B-109)', q: '9999' },
            { label: 'ق م ر 1446 (بورش كايين • A-112)', q: '1446' },
            { label: 'ر ي ض 1111 (رينج روفر VIP • VIP-07)', q: '1111' },
          ].map((item) => (
            <Chip
              key={item.q}
              label={item.label}
              size="small"
              onClick={() => {
                setPlate(item.q);
                void handleSearch(item.q);
              }}
              sx={{
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: 11.5,
                height: 28,
                borderRadius: '8px',
                bgcolor: plate === item.q ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: plate === item.q ? '#00F0FF' : '#CBD5E1',
                border: `1.5px solid ${plate === item.q ? '#00F0FF' : 'rgba(255, 255, 255, 0.12)'}`,
                boxShadow: plate === item.q ? '0 0 14px rgba(0, 240, 255, 0.35)' : 'none',
                transition: 'all 180ms ease',
                '&:hover': {
                  bgcolor: 'rgba(0, 240, 255, 0.18)',
                  color: '#FFFFFF',
                  borderColor: '#00F0FF',
                },
              }}
            />
          ))}
        </Stack>
      </Card>

      {error && (
        <Alert severity="warning" sx={{ mb: 3.5, borderRadius: '16px', fontWeight: 800, fontSize: 14 }}>
          {error}
        </Alert>
      )}

      {/* Ready State when no vehicle searched yet */}
      {!result && !loading && (
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: '24px',
            bgcolor: 'rgba(11, 18, 32, 0.94)',
            backdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(0, 240, 255, 0.35)',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.12)',
          }}
        >
          <Box
            sx={{
              width: 86,
              height: 86,
              borderRadius: '24px',
              mx: 'auto',
              mb: 2.5,
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(2, 132, 199, 0.2))',
              border: '2px solid rgba(0, 240, 255, 0.5)',
              boxShadow: '0 0 35px rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F0FF',
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 46 }} />
          </Box>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1.2, color: '#F8FAFC' }}>
            نظام الرصد الذكي جاهز لتحديد موقع سيارتك ورسم مسار الوصول فوراً
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#94A3B8', maxWidth: 680, mx: 'auto', mb: 4, lineHeight: 1.8, fontSize: 14.5 }}
          >
            أدخل رقم اللوحة في الحقل أعلاه أو انقر على إحدى اللوحات النشطة لمعاينة بطاقة المركبة ثلاثية الأبعاد
            والمسار الليزري المضاء مع شخص متحرك يوجهك خطوة بخطوة من بهو الدخول إلى موقف سيارتك.
          </Typography>

          <Grid container spacing={2.5} sx={{ maxWidth: 880, mx: 'auto' }}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                  border: '1.5px solid rgba(56, 189, 248, 0.25)',
                  textAlign: 'center',
                }}
              >
                <SpeedIcon sx={{ fontSize: 32, color: '#38BDF8', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={900} color="#38BDF8" sx={{ mb: 0.5 }}>
                  رصد فوري عبر كاميرات LPR
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12 }}>
                  تعرف عصبي فائق السرعة على اللوحات بدقة 99.8% وتحديد دقيق للموقف
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                  border: '1.5px solid rgba(0, 240, 255, 0.25)',
                  textAlign: 'center',
                }}
              >
                <ApartmentIcon sx={{ fontSize: 32, color: '#00F0FF', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={900} color="#00F0FF" sx={{ mb: 0.5 }}>
                  مخطط الأدوار والمناطق
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12 }}>
                  خريطة هندسية فورية مقسمة إلى أجنحة Zone A, Zone B, VIP, EV
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                  border: '1.5px solid rgba(16, 185, 129, 0.25)',
                  textAlign: 'center',
                }}
              >
                <DirectionsWalkIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={900} color="#10B981" sx={{ mb: 0.5 }}>
                  مسار ليزري وشخص متحرك
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12 }}>
                  مسار مضاء يحاكي الواقع مع أيقونة شخص يسير ويوجهك لمكان سيارتك
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Main Results Display */}
      {result && (
        <Grid container spacing={3}>
          {/* LEFT COLUMN: Vehicle Profile & Authentic Saudi Plate Card */}
          <Grid item xs={12} lg={4.2}>
            <Card
              sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: 'rgba(11, 18, 32, 0.94)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(0, 240, 255, 0.35)',
                boxShadow:
                  '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 2.5,
              }}
            >
              <Box>
                {/* Header Status Row */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={900} sx={{ color: '#F8FAFC', fontSize: 16 }}>
                    بطاقة الهوية الرقمية للمركبة
                  </Typography>
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 15, color: '#10B981 !important' }} />}
                    label="رصد مؤكد عبر الذكاء الاصطناعي"
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      fontWeight: 800,
                      fontSize: 11,
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                    }}
                  />
                </Stack>

                {/* Authentic Official Saudi License Plate Bay */}
                <Box
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: '18px',
                    bgcolor: '#040812',
                    border: '1.5px solid rgba(0, 240, 255, 0.45)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0, 240, 255, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SaudiRealisticPlate plateNumber={result.plate} size="md" showBolts={true} interactive={false} />
                  <Typography variant="caption" sx={{ mt: 1, color: '#38BDF8', fontWeight: 800, fontSize: 11 }}>
                    🇸🇦 المملكة العربية السعودية • اللوحة الرسمية المسجلة
                  </Typography>
                </Box>

                {/* 4K CCTV Vehicle Snapshot Preview */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 150,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(56, 189, 248, 0.35)',
                    bgcolor: '#030712',
                    mb: 2.5,
                  }}
                >
                  <Box
                    component="img"
                    src={activeVehicleImage}
                    alt="Vehicle Snapshot"
                    onError={(e: any) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/cctv_cam1_landcruiser.jpg';
                    }}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.85)',
                      px: 1,
                      py: 0.3,
                      borderRadius: '6px',
                      color: '#00F0FF',
                      fontSize: 10,
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                    }}
                  >
                    LIVE 4K LPR SNAPSHOT
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      px: 1,
                      py: 0.3,
                      borderRadius: '6px',
                      color: '#F8FAFC',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {result.vehicleModel}
                  </Box>
                </Box>

                {/* Telemetry Vehicle Dossier Specs */}
                <Stack
                  spacing={1}
                  sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.7)',
                    p: 1.5,
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 12 }}>
                      طراز ولون المركبة:
                    </Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#F8FAFC', fontSize: 12.5 }}>
                      {result.vehicleModel} ({result.vehicleColor})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 12 }}>
                      المبنى المحدد:
                    </Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#38BDF8', fontSize: 12.5 }}>
                      {result.building}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 12 }}>
                      الدور والمنطقة:
                    </Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#00F0FF', fontSize: 12.5 }}>
                      {result.floor}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 12 }}>
                      رقم الموقف المضاء (Slot):
                    </Typography>
                    <Chip
                      label={result.spot}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 240, 255, 0.2)',
                        color: '#00F0FF',
                        fontWeight: 900,
                        fontSize: 12,
                        border: '1px solid #00F0FF',
                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 12 }}>
                      وقت وتاريخ الدخول:
                    </Typography>
                    <Typography variant="caption" fontWeight={800} sx={{ color: '#CBD5E1', fontSize: 12 }}>
                      {result.entryTime}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 12 }}>
                      مدة الوقوف والرسوم:
                    </Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#10B981', fontSize: 12.5 }}>
                      {result.durationParked} • {result.accumulatedFee} ر.س
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 11.5 }}>
                      حساس السقف الذكي:
                    </Typography>
                    <Chip
                      label="نشط ومضاء بالأخضر"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        fontSize: 10.5,
                        fontWeight: 800,
                        height: 22,
                      }}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Action Buttons Panel */}
              <Stack spacing={1.5} sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VolumeUpIcon />}
                  onClick={handleHonkAndFlash}
                  sx={{
                    fontWeight: 900,
                    borderRadius: '14px',
                    py: 1.3,
                    fontSize: 13.5,
                    background: hornActive
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'linear-gradient(135deg, #00F0FF 0%, #0284C7 100%)',
                    color: '#050D1A',
                    boxShadow: '0 6px 20px rgba(0, 240, 255, 0.35)',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #38BDF8, #00F0FF)',
                      boxShadow: '0 8px 28px rgba(0, 240, 255, 0.6)',
                    },
                  }}
                >
                  {hornActive ? 'جاري وميض إضاءة الموقف والصوت...' : 'وميض إضاءة الموقف والصوت التنبيهي 🔊💡'}
                </Button>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<WhatsAppIcon />}
                    onClick={handleShareWhatsApp}
                    sx={{
                      fontWeight: 800,
                      borderRadius: '12px',
                      fontSize: 12,
                      color: '#10B981',
                      borderColor: 'rgba(16, 185, 129, 0.45)',
                      bgcolor: 'rgba(16, 185, 129, 0.08)',
                      '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' },
                    }}
                  >
                    مشاركة WhatsApp
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PaymentIcon />}
                    onClick={() =>
                      setActionNotice('تم تأكيد سداد الرسوم وإصدار تصريح فتح البوابة السريع عند خروجك!')
                    }
                    sx={{
                      fontWeight: 800,
                      borderRadius: '12px',
                      fontSize: 12,
                      color: '#38BDF8',
                      borderColor: 'rgba(56, 189, 248, 0.45)',
                      bgcolor: 'rgba(56, 189, 248, 0.08)',
                      '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.2)', borderColor: '#38BDF8' },
                    }}
                  >
                    سداد وخروج سريع
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          {/* RIGHT COLUMN: The Interactive Floor Map & Realistic Walking Person Canvas */}
          <Grid item xs={12} lg={7.8}>
            <Card
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: '24px',
                bgcolor: 'rgba(11, 18, 32, 0.94)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(0, 240, 255, 0.35)',
                boxShadow:
                  '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                position: 'relative',
              }}
            >
              {/* Floor Switcher & Building Badge Bar */}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
                sx={{ mb: 2.5 }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <ApartmentIcon sx={{ color: '#00F0FF', fontSize: 24 }} />
                    <Typography variant="h6" fontWeight={900} sx={{ color: '#F8FAFC', fontSize: 17 }}>
                      {result.building}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11.5 }}>
                    المخطط المعماري الحي • إجمالي السعة: 28 موقفاً • متاح: 18 • مشغول: 8 • VIP/EV: 2
                  </Typography>
                </Box>

                {/* Floor Level Selector Tabs */}
                <Tabs
                  value={activeFloor}
                  onChange={(_, val) => setActiveFloor(val)}
                  sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.85)',
                    borderRadius: '16px',
                    p: 0.5,
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    minHeight: 40,
                    '& .MuiTab-root': {
                      minHeight: 32,
                      py: 0.5,
                      px: 1.8,
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: 12,
                      color: '#94A3B8',
                      '&.Mui-selected': {
                        color: '#040812',
                        bgcolor: '#00F0FF',
                        fontWeight: 900,
                        boxShadow: '0 2px 14px rgba(0, 240, 255, 0.5)',
                      },
                    },
                    '& .MuiTabs-indicator': { display: 'none' },
                  }}
                >
                  <Tab value="GF" label="GF الأرضي" />
                  <Tab value="B1" label="B1 القبو 1" />
                  <Tab value="B2" label="B2 القبو 2" />
                  <Tab value="VIP" label="👑 كبار الشخصيات" />
                </Tabs>
              </Stack>

              {/* Zones Legend & Navigation Telemetry Bar */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
                sx={{ mb: 2 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<DirectionsWalkIcon sx={{ fontSize: 16, color: '#00F0FF !important' }} />}
                    label={`المسار سيراً: ${Math.round((1 - walkProgress) * 38)} متراً (~${Math.round(
                      (1 - walkProgress) * 45
                    )} ثانية)`}
                    sx={{
                      bgcolor: 'rgba(0, 240, 255, 0.16)',
                      color: '#00F0FF',
                      fontWeight: 900,
                      fontSize: 12,
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                    }}
                  />
                  <Chip
                    label="Zone A (المواقف الشرقية)"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(56, 189, 248, 0.12)',
                      color: '#38BDF8',
                      fontWeight: 800,
                      fontSize: 11,
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  />
                  <Chip
                    label="Zone VIP & EV"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(245, 158, 11, 0.12)',
                      color: '#F59E0B',
                      fontWeight: 800,
                      fontSize: 11,
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  />
                </Stack>

                {/* Simulation Control Buttons */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleToggleWalk}
                    startIcon={
                      isWalking ? (
                        <PauseIcon sx={{ fontSize: 16 }} />
                      ) : walkProgress >= 1 ? (
                        <ReplayIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <DirectionsWalkIcon sx={{ fontSize: 16 }} />
                      )
                    }
                    sx={{
                      bgcolor: isWalking ? '#EF4444' : '#10B981',
                      color: '#FFF',
                      fontWeight: 900,
                      fontSize: 11.5,
                      borderRadius: '10px',
                      py: 0.6,
                      px: 1.5,
                      boxShadow: isWalking
                        ? '0 0 14px rgba(239, 68, 68, 0.5)'
                        : '0 0 14px rgba(16, 185, 129, 0.5)',
                      '&:hover': {
                        bgcolor: isWalking ? '#DC2626' : '#059669',
                      },
                    }}
                  >
                    {isWalking ? 'إيقاف التوجيه' : walkProgress >= 1 ? 'إعادة الجولة' : 'بدء محاكاة المشي'}
                  </Button>

                  <Chip
                    label={`${walkSpeed}x سرعة`}
                    size="small"
                    onClick={() => setWalkSpeed((s) => (s === 1 ? 2 : 1))}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 900,
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: '#CBD5E1',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  />

                  {walkProgress > 0 && (
                    <IconButton size="small" onClick={handleResetWalk} title="إعادة المسار للبداية" sx={{ color: '#94A3B8' }}>
                      <ReplayIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Stack>
              </Stack>

              {/* 🌟 THE ARCHITECTURAL SVG BLUEPRINT CANVAS WITH REALISTIC LINE & WALKING PERSON 🌟 */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 440, md: 510 },
                  borderRadius: '20px',
                  bgcolor: '#040813',
                  backgroundImage:
                    'linear-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.04) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  border: '2px solid rgba(0, 240, 255, 0.4)',
                  boxShadow:
                    'inset 0 0 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 240, 255, 0.15)',
                  overflow: 'hidden',
                }}
              >
                <svg
                  viewBox="0 0 960 520"
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                >
                  <defs>
                    {/* Realistic Neon Laser Gradient */}
                    <linearGradient id="realisticLaserGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="45%" stopColor="#00F0FF" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>

                    {/* Pedestrian Vision Cone Gradient */}
                    <linearGradient id="visionConeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(0, 240, 255, 0.65)" />
                      <stop offset="70%" stopColor="rgba(0, 240, 255, 0.18)" />
                      <stop offset="100%" stopColor="rgba(0, 240, 255, 0)" />
                    </linearGradient>

                    {/* Spotlight Ceiling Projection */}
                    <linearGradient id="spotlightBeam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0, 240, 255, 0.45)" />
                      <stop offset="100%" stopColor="rgba(0, 240, 255, 0.02)" />
                    </linearGradient>

                    {/* Floor Glow Blur Filter */}
                    <filter id="neonFloorBlur" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                    </filter>

                    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer Perimeter Foundation Wall */}
                  <rect
                    x="20"
                    y="20"
                    width="920"
                    height="475"
                    rx="20"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.3)"
                    strokeWidth="2.5"
                    strokeDasharray="8 5"
                  />

                  {/* ──────────────── ZONE A BOUNDARY BOX (East Wing) ──────────────── */}
                  <rect
                    x="40"
                    y="35"
                    width="450"
                    height="145"
                    rx="14"
                    fill="rgba(15, 23, 42, 0.65)"
                    stroke="rgba(0, 240, 255, 0.35)"
                    strokeWidth="1.5"
                  />
                  <text x="60" y="56" fill="#00F0FF" fontSize="12" fontWeight="900" letterSpacing="1">
                    ZONE A • الجناح الشرقي (EAST WING)
                  </text>

                  {/* ──────────────── ZONE VIP & EV BOUNDARY BOX ──────────────── */}
                  <rect
                    x="510"
                    y="35"
                    width="410"
                    height="145"
                    rx="14"
                    fill="rgba(15, 23, 42, 0.65)"
                    stroke="rgba(245, 158, 11, 0.35)"
                    strokeWidth="1.5"
                  />
                  <text x="530" y="56" fill="#F59E0B" fontSize="12" fontWeight="900" letterSpacing="1">
                    ZONE VIP & EV • كبار الشخصيات والشحن الكهربائي
                  </text>

                  {/* ──────────────── CENTRAL DRIVEWAY & AISLE ──────────────── */}
                  <rect
                    x="40"
                    y="195"
                    width="880"
                    height="90"
                    rx="12"
                    fill="rgba(8, 13, 26, 0.85)"
                    stroke="rgba(0, 240, 255, 0.15)"
                    strokeWidth="1.5"
                  />
                  {/* Central Road Centerline */}
                  <line
                    x1="50"
                    y1="240"
                    x2="910"
                    y2="240"
                    stroke="rgba(56, 189, 248, 0.22)"
                    strokeWidth="3"
                    strokeDasharray="16 10"
                  />
                  <text x="320" y="244" fill="rgba(255, 255, 255, 0.25)" fontSize="13" fontWeight="900">
                    ➔ مسار حركة المركبات الرئيسي (MAX 10 KM/H)
                  </text>
                  <text x="720" y="244" fill="rgba(255, 255, 255, 0.25)" fontSize="13" fontWeight="900">
                    ➔ اتجاه المخرج والرامب
                  </text>

                  {/* ──────────────── ZONE B BOUNDARY BOX (West Wing) ──────────────── */}
                  <rect
                    x="40"
                    y="300"
                    width="880"
                    height="140"
                    rx="14"
                    fill="rgba(15, 23, 42, 0.65)"
                    stroke="rgba(167, 139, 250, 0.35)"
                    strokeWidth="1.5"
                  />
                  <text x="60" y="320" fill="#A78BFA" fontSize="12" fontWeight="900" letterSpacing="1">
                    ZONE B • الجناح الغربي ومواقف المغادرة السريعة (WEST WING)
                  </text>

                  {/* ════════════════ TOP ROW SLOTS (A-101 to A-107) ════════════════ */}
                  {[
                    { id: 'A-101', col: 0, type: 'Standard', occupied: true, plate: 'أ ح ص 881' },
                    { id: 'A-102', col: 1, type: 'Standard', occupied: false },
                    { id: 'A-103', col: 2, type: 'Standard', occupied: true, plate: 'س ن ر 412' },
                    { id: 'A-104', col: 3, type: 'Standard', occupied: false },
                    { id: 'A-105', col: 4, type: 'EV', occupied: false },
                    { id: 'A-106', col: 5, type: 'VIP', occupied: true, plate: 'ق ص ب 999' },
                    { id: 'A-107', col: 6, type: 'VIP', occupied: false },
                  ].map((bay) => {
                    const bx = 65 + bay.col * 118;
                    const by = 68;
                    const isTarget = isTop && bay.id === `A-${bayNum}`;
                    const strokeColor = isTarget
                      ? '#00F0FF'
                      : bay.type === 'VIP'
                      ? '#F59E0B'
                      : bay.type === 'EV'
                      ? '#10B981'
                      : bay.occupied
                      ? 'rgba(239, 68, 68, 0.6)'
                      : 'rgba(56, 189, 248, 0.4)';

                    return (
                      <g key={bay.id}>
                        {/* Target Spotlight Projection from ceiling */}
                        {isTarget && (
                          <polygon
                            points={`${bx + 15},35 ${bx + 85},35 ${bx + 95},155 ${bx + 5},155`}
                            fill="url(#spotlightBeam)"
                            pointerEvents="none"
                          />
                        )}

                        {/* Slot Bay Box */}
                        <rect
                          x={bx}
                          y={by}
                          width="100"
                          height="92"
                          rx="12"
                          fill={
                            isTarget
                              ? 'rgba(0, 240, 255, 0.22)'
                              : bay.occupied
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(15, 23, 42, 0.7)'
                          }
                          stroke={strokeColor}
                          strokeWidth={isTarget ? 3 : 1.5}
                          style={isTarget ? { animation: 'targetSpotHighlight 2s ease-in-out infinite' } : {}}
                        />

                        {/* Wheel Stop Bar */}
                        <rect
                          x={bx + 14}
                          y={by + 10}
                          width="72"
                          height="6"
                          rx="3"
                          fill={isTarget ? '#00F0FF' : 'rgba(255, 255, 255, 0.25)'}
                        />

                        {/* Overhead Smart LED Sensor Dot */}
                        <circle
                          cx={bx + 50}
                          cy={by - 6}
                          r="5"
                          fill={isTarget ? '#00F0FF' : bay.occupied ? '#EF4444' : '#10B981'}
                          filter="drop-shadow(0 0 6px currentColor)"
                        />

                        {/* Bay Code Label */}
                        <text
                          x={bx + 50}
                          y={by + 34}
                          textAnchor="middle"
                          fill={isTarget ? '#00F0FF' : '#94A3B8'}
                          fontSize="13.5"
                          fontWeight={isTarget ? '900' : '800'}
                        >
                          {bay.id}
                        </text>

                        {/* Status Icon / Vehicle Silhouette */}
                        {isTarget ? (
                          <g transform={`translate(${bx + 50}, ${by + 60})`}>
                            <text textAnchor="middle" fontSize="22">🚗</text>
                            <text y="18" textAnchor="middle" fill="#00F0FF" fontSize="10" fontWeight="900">
                              سيارتك هنا
                            </text>
                          </g>
                        ) : bay.occupied ? (
                          <g transform={`translate(${bx + 50}, ${by + 56})`}>
                            <text textAnchor="middle" fill="#EF4444" fontSize="15">🚘</text>
                            <text y="16" textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="800">
                              {bay.plate}
                            </text>
                          </g>
                        ) : (
                          <text
                            x={bx + 50}
                            y={by + 66}
                            textAnchor="middle"
                            fill={bay.type === 'VIP' ? '#F59E0B' : bay.type === 'EV' ? '#10B981' : '#10B981'}
                            fontSize="11.5"
                            fontWeight="800"
                          >
                            {bay.type === 'VIP' ? '👑 VIP' : bay.type === 'EV' ? '⚡ EV' : 'شاغر ✓'}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* ════════════════ BOTTOM ROW SLOTS (A-108 to A-114) ════════════════ */}
                  {[
                    { id: 'A-108', col: 0, type: 'Standard', occupied: false },
                    { id: 'A-109', col: 1, type: 'Standard', occupied: true, plate: 'د م ك 304' },
                    { id: 'A-110', col: 2, type: 'Standard', occupied: false },
                    { id: 'A-111', col: 3, type: 'Standard', occupied: true, plate: 'ح ل م 204' },
                    { id: 'A-112', col: 4, type: 'Standard', occupied: false },
                    { id: 'A-113', col: 5, type: 'Standard', occupied: false },
                    { id: 'A-114', col: 6, type: 'Standard', occupied: true, plate: 'ط ي ر 511' },
                  ].map((bay) => {
                    const bx = 65 + bay.col * 118;
                    const by = 330;
                    const isTarget = !isTop && bay.id === `A-${bayNum}`;
                    const strokeColor = isTarget
                      ? '#00F0FF'
                      : bay.occupied
                      ? 'rgba(239, 68, 68, 0.6)'
                      : 'rgba(167, 139, 250, 0.4)';

                    return (
                      <g key={bay.id}>
                        {isTarget && (
                          <polygon
                            points={`${bx + 15},440 ${bx + 85},440 ${bx + 95},330 ${bx + 5},330`}
                            fill="url(#spotlightBeam)"
                            pointerEvents="none"
                          />
                        )}

                        <rect
                          x={bx}
                          y={by}
                          width="100"
                          height="92"
                          rx="12"
                          fill={
                            isTarget
                              ? 'rgba(0, 240, 255, 0.22)'
                              : bay.occupied
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(15, 23, 42, 0.7)'
                          }
                          stroke={strokeColor}
                          strokeWidth={isTarget ? 3 : 1.5}
                          style={isTarget ? { animation: 'targetSpotHighlight 2s ease-in-out infinite' } : {}}
                        />

                        {/* Wheel Stop Bar */}
                        <rect
                          x={bx + 14}
                          y={by + 76}
                          width="72"
                          height="6"
                          rx="3"
                          fill={isTarget ? '#00F0FF' : 'rgba(255, 255, 255, 0.25)'}
                        />

                        {/* Overhead Smart LED Sensor Dot */}
                        <circle
                          cx={bx + 50}
                          cy={by + 98}
                          r="5"
                          fill={isTarget ? '#00F0FF' : bay.occupied ? '#EF4444' : '#10B981'}
                          filter="drop-shadow(0 0 6px currentColor)"
                        />

                        {/* Bay Code Label */}
                        <text
                          x={bx + 50}
                          y={by + 30}
                          textAnchor="middle"
                          fill={isTarget ? '#00F0FF' : '#94A3B8'}
                          fontSize="13.5"
                          fontWeight={isTarget ? '900' : '800'}
                        >
                          {bay.id}
                        </text>

                        {/* Status Icon */}
                        {isTarget ? (
                          <g transform={`translate(${bx + 50}, ${by + 52})`}>
                            <text textAnchor="middle" fontSize="22">🚗</text>
                            <text y="16" textAnchor="middle" fill="#00F0FF" fontSize="10" fontWeight="900">
                              سيارتك هنا
                            </text>
                          </g>
                        ) : bay.occupied ? (
                          <g transform={`translate(${bx + 50}, ${by + 50})`}>
                            <text textAnchor="middle" fill="#EF4444" fontSize="15">🚘</text>
                            <text y="14" textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="800">
                              {bay.plate}
                            </text>
                          </g>
                        ) : (
                          <text
                            x={bx + 50}
                            y={by + 56}
                            textAnchor="middle"
                            fill="#10B981"
                            fontSize="11.5"
                            fontWeight="800"
                          >
                            شاغر ✓
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* ──────────────── ARCHITECTURAL LANDMARKS ──────────────── */}
                  {/* Start Point: Main North Lobby Entrance */}
                  <g transform={`translate(${startX}, ${startY})`}>
                    <circle cx="0" cy="0" r="26" fill="rgba(16, 185, 129, 0.2)" />
                    <circle cx="0" cy="0" r="12" fill="#10B981" />
                    <circle
                      cx="0"
                      cy="0"
                      r="12"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      style={{ animation: 'pulseGlowRing 2s infinite' }}
                    />
                    <text x="0" y="24" textAnchor="middle" fill="#10B981" fontSize="11.5" fontWeight="900">
                      بهو الدخول 01
                    </text>
                  </g>

                  {/* Elevator Bank Central Landmark */}
                  <g transform="translate(480, 460)">
                    <rect
                      x="-38"
                      y="-16"
                      width="76"
                      height="32"
                      rx="8"
                      fill="rgba(56, 189, 248, 0.2)"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                    />
                    <text x="0" y="4" textAnchor="middle" fill="#38BDF8" fontSize="12" fontWeight="900">
                      🛗 المصاعد A
                    </text>
                  </g>

                  {/* Emergency Staircase Landmark */}
                  <g transform="translate(820, 460)">
                    <rect
                      x="-34"
                      y="-16"
                      width="68"
                      height="32"
                      rx="8"
                      fill="rgba(239, 68, 68, 0.15)"
                      stroke="#EF4444"
                      strokeWidth="1.5"
                    />
                    <text x="0" y="4" textAnchor="middle" fill="#EF4444" fontSize="12" fontWeight="900">
                      🚪 مخرج B
                    </text>
                  </g>

                  {/* 🚀 3. THE REALISTIC ILLUMINATED AR INDOOR NAVIGATION PATH 🚀 */}

                  {/* Layer 1: Floor Ambient Diffusion Glow (In-floor LED strip reflection on polished floor) */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(0, 240, 255, 0.2)"
                    strokeWidth="28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonFloorBlur)"
                  />

                  {/* Layer 2: Translucent Guide Channel Ribbon */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(0, 240, 255, 0.35)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Layer 3: Neon Laser Core Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="url(#realisticLaserGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Layer 4: Continuous Flowing Light Pulses along the line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 20"
                    style={{
                      animation: 'laserFlowRealistic 1.1s linear infinite',
                    }}
                  />

                  {/* Layer 5: Glowing Directional Energy Stream */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="10 35"
                    style={{
                      animation: 'laserFlowRealistic 1.6s linear infinite',
                    }}
                  />

                  {/* Turn Junction Waypoint Nodes with Distance Badges */}
                  <g transform={`translate(${w1X}, ${w1Y})`}>
                    <circle cx="0" cy="0" r="14" fill="rgba(0, 240, 255, 0.25)" />
                    <circle cx="0" cy="0" r="6" fill="#00F0FF" stroke="#FFF" strokeWidth="2" />
                    <text x="12" y="-10" fill="#38BDF8" fontSize="10" fontWeight="900">
                      15م (انعطاف)
                    </text>
                  </g>

                  <g transform={`translate(${w2X}, ${w2Y})`}>
                    <circle cx="0" cy="0" r="14" fill="rgba(0, 240, 255, 0.25)" />
                    <circle cx="0" cy="0" r="6" fill="#00F0FF" stroke="#FFF" strokeWidth="2" />
                    <text x={isTop ? 12 : -12} y="-10" textAnchor={isTop ? 'start' : 'end'} fill="#38BDF8" fontSize="10" fontWeight="900">
                      28م (المسار)
                    </text>
                  </g>

                  {/* Target Spot Arrival Beacon */}
                  <g transform={`translate(${destX}, ${destY})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="30"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="2.5"
                      style={{ animation: 'pulseGlowRing 2s infinite' }}
                    />
                    <circle cx="0" cy="0" r="18" fill="#00F0FF" />
                    <circle cx="0" cy="0" r="14" fill="#040812" />
                    <text x="0" y="5" textAnchor="middle" fill="#00F0FF" fontSize="14">
                      📍
                    </text>
                  </g>

                  {/* 🚶‍♂️ 4. THE WALKING PERSON AVATAR & DYNAMIC HEADING VISION CONE 🚶‍♂️ */}
                  <g
                    transform={`translate(${currentPersonState.x}, ${currentPersonState.y})`}
                    style={{ transition: isWalking ? 'none' : 'transform 250ms ease-out' }}
                  >
                    {/* Live Footstep Wave Ripples Expanding Underneath Person */}
                    <circle
                      cx="0"
                      cy="0"
                      r="12"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="2"
                      style={{ animation: 'walkingFootstepRipple 1.2s infinite' }}
                    />

                    {/* Forward Rotated Vision Cone & Direction Arrow according to heading angle */}
                    <g transform={`rotate(${currentPersonState.angle})`}>
                      {/* Realistic Illuminated AR Flashlight / Vision Cone */}
                      <polygon points="0,0 60,-24 60,24" fill="url(#visionConeGradient)" opacity="0.8" />

                      {/* Directional Chevron Arrowhead */}
                      <g transform="translate(36, 0)">
                        <polygon points="-6,-6 4,0 -6,6 -2,0" fill="#00F0FF" />
                        <polygon points="2,-6 12,0 2,6 6,0" fill="#10B981" />
                      </g>
                    </g>

                    {/* Walking Person Disc Chassis */}
                    <circle
                      cx="0"
                      cy="0"
                      r="17"
                      fill="rgba(16, 185, 129, 0.3)"
                      stroke="#10B981"
                      strokeWidth="1.5"
                    />
                    <circle cx="0" cy="0" r="13" fill="#060B14" stroke="#00F0FF" strokeWidth="2.5" />

                    {/* Authentic Pedestrian Silhouette */}
                    <g transform="translate(-8.5, -9.5) scale(0.72)">
                      <path
                        d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2M9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6z"
                        fill="#00F0FF"
                      />
                    </g>

                    {/* Floating Walk Status Tag above person */}
                    <g transform="translate(0, -25)">
                      <rect
                        x="-38"
                        y="-12"
                        width="76"
                        height="17"
                        rx="5"
                        fill="rgba(6, 11, 20, 0.95)"
                        stroke="#00F0FF"
                        strokeWidth="1"
                      />
                      <text x="0" y="0" textAnchor="middle" fill="#00F0FF" fontSize="9.5" fontWeight="900">
                        {walkProgress >= 1
                          ? 'وصلت للموقف 🎯'
                          : isWalking
                          ? 'جاري السير...'
                          : 'أنت هنا (الموقع)'}
                      </text>
                    </g>
                  </g>
                </svg>
              </Box>

              {/* Waypoints & Turn-by-Turn Stepper Bar */}
              <Box sx={{ mt: 3.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#00F0FF', fontSize: 15 }}>
                    إرشادات السير والتوجيه اللحظي خطوة بخطوة (Turn-by-Turn Guidance):
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                    {walkProgress >= 1 ? 'اكتمل المسار بنجاح' : `المرحلة ${currentPersonState.activeStepIdx + 1} من 4`}
                  </Typography>
                </Stack>

                <Grid container spacing={1.5}>
                  {turnByTurnSteps.map((step, idx) => {
                    const isActive = currentPersonState.activeStepIdx === idx;
                    const isCompleted = currentPersonState.activeStepIdx > idx || walkProgress >= 1;

                    return (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Box
                          sx={{
                            p: 1.8,
                            borderRadius: '16px',
                            bgcolor: isActive
                              ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.22), rgba(15, 23, 42, 0.95))'
                              : isCompleted
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(15, 23, 42, 0.65)',
                            border: `1.5px solid ${
                              isActive
                                ? '#00F0FF'
                                : isCompleted
                                ? 'rgba(16, 185, 129, 0.4)'
                                : 'rgba(255, 255, 255, 0.08)'
                            }`,
                            boxShadow: isActive ? '0 0 20px rgba(0, 240, 255, 0.35)' : 'none',
                            transition: 'all 240ms ease',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: isActive
                                  ? '#00F0FF'
                                  : isCompleted
                                  ? '#10B981'
                                  : 'rgba(255, 255, 255, 0.08)',
                                color: isActive || isCompleted ? '#050D1A' : '#94A3B8',
                                fontWeight: 900,
                                flexShrink: 0,
                              }}
                            >
                              {step.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={900}
                                  sx={{
                                    fontSize: 13,
                                    color: isActive ? '#00F0FF' : isCompleted ? '#6EE7B7' : '#F8FAFC',
                                  }}
                                >
                                  {step.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: isActive ? '#00F0FF' : '#94A3B8',
                                    fontWeight: 800,
                                    fontSize: 11,
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {step.distance}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block', fontSize: 11.5, lineHeight: 1.5 }}>
                                {step.desc}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Confirmation Snackbar Feedback */}
      <Snackbar
        open={Boolean(actionNotice)}
        autoHideDuration={4500}
        onClose={() => setActionNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setActionNotice(null)}
          severity="success"
          variant="filled"
          sx={{
            fontWeight: 900,
            fontSize: 14,
            bgcolor: '#10B981',
            color: '#FFFFFF',
            borderRadius: '14px',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.5)',
          }}
        >
          {actionNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
