import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import EvStationIcon from '@mui/icons-material/EvStation';
import StarIcon from '@mui/icons-material/Star';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ShareIcon from '@mui/icons-material/Share';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StraightIcon from '@mui/icons-material/Straight';
import TurnRightIcon from '@mui/icons-material/TurnRight';
import TurnLeftIcon from '@mui/icons-material/TurnLeft';
import NearMeIcon from '@mui/icons-material/NearMe';
import TimerIcon from '@mui/icons-material/Timer';
import BoltIcon from '@mui/icons-material/Bolt';
import SensorsIcon from '@mui/icons-material/Sensors';
import SecurityIcon from '@mui/icons-material/Security';
import LayersIcon from '@mui/icons-material/Layers';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

import { glassPanel, glowPanel } from '../../app/theme';

// =========================================================================
// DATA MODELS & PRESET SLOTS CATALOG
// =========================================================================
export interface SlotGuidanceItem {
  id: string;
  slotNumber: string;
  qrPayload: string;
  floor: string;
  floorKey: 'B1' | 'GF' | 'B2' | 'VIP';
  zone: string;
  type: 'STANDARD' | 'VIP' | 'EV' | 'ACCESSIBLE';
  typeAr: string;
  status: 'RESERVED' | 'AVAILABLE' | 'OCCUPIED';
  statusAr: string;
  distanceMeters: number;
  estimatedDriveTime: string;
  recommendedGate: string;
  sensorStatus: 'Active' | 'Hold';
  features: string[];
  holdExpiresMinutes: number;
  targetCoords: { x: number; y: number };
  steps: Array<{
    instructionAr: string;
    distance: string;
    iconType: 'straight' | 'right' | 'left' | 'park';
    detail: string;
  }>;
}

export const PRESET_SLOTS: Record<string, SlotGuidanceItem> = {
  'B1-A12': {
    id: 'slot-b1-a12',
    slotNumber: 'B1-A12',
    qrPayload: 'NRI-SLOT://B1-A12?zone=North&gate=G1',
    floor: 'الطابق السفلي B1',
    floorKey: 'B1',
    zone: 'المنطقة A (القطاع الشمالي)',
    type: 'STANDARD',
    typeAr: 'خانة وقوف قياسية',
    status: 'RESERVED',
    statusAr: 'محجوزة بانتظار وصولك',
    distanceMeters: 75,
    estimatedDriveTime: 'دقيقة واحدة (1 min)',
    recommendedGate: 'البوابة الشمالية 1 (المدخل الرئيسي)',
    sensorStatus: 'Hold',
    features: ['مستشعر إشغال ضوئي', 'مظلة واقية داخلية', 'قريبة من المصعد الشمالي'],
    holdExpiresMinutes: 28,
    targetCoords: { x: 580, y: 160 },
    steps: [
      {
        instructionAr: 'ادخل من البوابة الشمالية 1 وواصل السير في المسار الرئيسي للأمام',
        distance: '25 متراً',
        iconType: 'straight',
        detail: 'اتبع الخط الإرشادي الأخضر المرسوم على أرضية الموقف',
      },
      {
        instructionAr: 'انعطف يميناً عند تقاطع المسار A باتجاه صفوف المواقف',
        distance: '20 متراً',
        iconType: 'right',
        detail: 'ستجد لوحة الإرشاد الرقمية العلوية تشير إلى (A01 - A20)',
      },
      {
        instructionAr: 'تقدم للأمام بمحاذاة المصاعد المركزية',
        distance: '30 متراً',
        iconType: 'straight',
        detail: 'تجاوز الخانات من A01 حتى A10 على يمينك',
      },
      {
        instructionAr: 'وصلت إلى خانتك (B1-A12) على يسارك مباشرة',
        distance: 'موقع الخانة',
        iconType: 'park',
        detail: 'ضوء الحساس العلوي ينبض باللون الأخضر خصيصاً لمركبتك',
      },
    ],
  },
  'VIP-01': {
    id: 'slot-vip-01',
    slotNumber: 'VIP-01',
    qrPayload: 'NRI-SLOT://VIP-01?zone=VIP&gate=VIP-G',
    floor: 'طابق كبار الشخصيات VIP (الأرضي)',
    floorKey: 'VIP',
    zone: 'الرواق الرئاسي المخصص للنخبة',
    type: 'VIP',
    typeAr: 'خانة كبار الشخصيات VIP',
    status: 'RESERVED',
    statusAr: 'مؤمّنة ومعتمدة لسيادتكم',
    distanceMeters: 30,
    estimatedDriveTime: '30 ثانية فقط',
    recommendedGate: 'بوابة كبار الشخصيات VIP الذكية',
    sensorStatus: 'Hold',
    features: ['عرض إضافي 3.2m', 'حاجز هيدروليكي أرضي ذكي', 'خدمة الكونسيرج والمساعدة', 'كاميرا مراقبة 4K مخصصة'],
    holdExpiresMinutes: 45,
    targetCoords: { x: 700, y: 280 },
    steps: [
      {
        instructionAr: 'ادخل من بوابة VIP المخصصة مع فتح الحاجز التلقائي بنظام LPR',
        distance: '10 أمتار',
        iconType: 'straight',
        detail: 'التعرف الفوري على لوحة المركبة أو مسح رمز QR',
      },
      {
        instructionAr: 'انعطف يميناً مباشرة نحو المنصة الشرفية المغطاة',
        distance: '20 متراً',
        iconType: 'right',
        detail: 'المسار مخصص حصرياً ولا توجد تقاطعات مع الزوار',
      },
      {
        instructionAr: 'خانة VIP-01 أمامك مباشرة بمدخل واسع وحاجز أرضي منخفض',
        distance: 'موقع الخانة',
        iconType: 'park',
        detail: 'الحاجز الأرضي سينخفض آلياً بمجرد اقترابك 1.5 متر',
      },
    ],
  },
  'B1-EV04': {
    id: 'slot-b1-ev04',
    slotNumber: 'B1-EV04',
    qrPayload: 'NRI-SLOT://B1-EV04?zone=ChargingHub&gate=G1',
    floor: 'الطابق السفلي B1',
    floorKey: 'B1',
    zone: 'منطقة الشحن الكهربائي الفائق EV Hub',
    type: 'EV',
    typeAr: 'شاحن كهربائي فائق السرعة DC 150kW',
    status: 'RESERVED',
    statusAr: 'محجوزة وجاهزة للشحن',
    distanceMeters: 90,
    estimatedDriveTime: 'دقيقة ونصف',
    recommendedGate: 'البوابة الشمالية 1 (المدخل الرئيسي)',
    sensorStatus: 'Hold',
    features: ['شاحن CCS2 بقدرة 150kW', 'تفعيل آلي عبر تطبيق NRI', 'حساس كهرومغناطيسي', 'دعم الشحن السريع 800V'],
    holdExpiresMinutes: 20,
    targetCoords: { x: 380, y: 320 },
    steps: [
      {
        instructionAr: 'ادخل من البوابة الشمالية 1 واسلك المسار الأيمن الموضح بعلامة EV',
        distance: '30 متراً',
        iconType: 'straight',
        detail: 'المسار الأخضر المخصص للمركبات الكهربائية',
      },
      {
        instructionAr: 'انعطف يساراً نحو قطاع شواحن التيار المستمر DC Fast Hub',
        distance: '35 متراً',
        iconType: 'left',
        detail: 'أعمدة الشحن تضيء باللون الأزرق الفاتح',
      },
      {
        instructionAr: 'واصل السير للأمام حتى المحطة رقم 4',
        distance: '25 متراً',
        iconType: 'straight',
        detail: 'كابل الشحن معلق ومجهز للاستخدام الفوري',
      },
      {
        instructionAr: 'ركنت في الخانة B1-EV04 - يمكنك توصيل مقبس الشحن الآن',
        distance: 'موقع الخانة',
        iconType: 'park',
        detail: 'يبدأ الشحن وحساب الاستهلاك آلياً عبر محفظتك',
      },
    ],
  },
  'GF-C08': {
    id: 'slot-gf-c08',
    slotNumber: 'GF-C08',
    qrPayload: 'NRI-SLOT://GF-C08?zone=East&gate=G3',
    floor: 'الطابق الأرضي GF',
    floorKey: 'GF',
    zone: 'المنطقة C (المدخل الشرقي السريع)',
    type: 'STANDARD',
    typeAr: 'خانة وقوف سريعة بالدور الأرضي',
    status: 'RESERVED',
    statusAr: 'محجوزة ومؤكدة',
    distanceMeters: 55,
    estimatedDriveTime: '45 ثانية',
    recommendedGate: 'البوابة الشرقية 3 (مخرج ومهبط الزوار)',
    sensorStatus: 'Hold',
    features: ['ولوج مباشر دون منحدرات', 'ملاصقة لمبنى الخدمات التجارية', 'حساس ليزري علوي'],
    holdExpiresMinutes: 30,
    targetCoords: { x: 620, y: 220 },
    steps: [
      {
        instructionAr: 'ادخل من البوابة الشرقية 3 (المسار الأرضي السريع)',
        distance: '20 متراً',
        iconType: 'straight',
        detail: 'دون الحاجة للنزول إلى المنحدرات السفلية',
      },
      {
        instructionAr: 'انعطف يساراً عند الممر الداخلي C',
        distance: '20 متراً',
        iconType: 'left',
        detail: 'علامات واضحة على العمود C-08',
      },
      {
        instructionAr: 'وصلت إلى خانتك (GF-C08) على الجانب الأيمن',
        distance: 'موقع الخانة',
        iconType: 'park',
        detail: 'مساحة سهلة الدخول والخروج',
      },
    ],
  },
};

// =========================================================================
// MAIN COMPONENT: FIND MY SLOT (الملاحة إلى خانتي)
// =========================================================================
export function FindSlotPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();

  // Search Inputs
  const [searchInput, setSearchInput] = useState('');
  const [selectedSlotKey, setSelectedSlotKey] = useState<string>('B1-A12');

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerPastedCode, setScannerPastedCode] = useState('');

  // Simulation & Audio state
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [copiedSnackbar, setCopiedSnackbar] = useState(false);

  // Active Floor Selection
  const [activeFloor, setActiveFloor] = useState<'B1' | 'GF' | 'B2' | 'VIP'>('B1');

  // Load slot from URL param if present (e.g. ?slot=B1-A12 or ?qr=...)
  useEffect(() => {
    const urlSlot = searchParams.get('slot');
    const urlQr = searchParams.get('qr');

    if (urlSlot && PRESET_SLOTS[urlSlot.toUpperCase()]) {
      setSelectedSlotKey(urlSlot.toUpperCase());
      setActiveFloor(PRESET_SLOTS[urlSlot.toUpperCase()].floorKey);
    } else if (urlQr) {
      // Find matching slot by QR
      const match = Object.values(PRESET_SLOTS).find(
        (s) => s.qrPayload.toLowerCase().includes(urlQr.toLowerCase()) || urlQr.includes(s.slotNumber)
      );
      if (match) {
        setSelectedSlotKey(match.slotNumber);
        setActiveFloor(match.floorKey);
      }
    }
  }, [searchParams]);

  // Current active slot
  const currentSlot: SlotGuidanceItem = useMemo(() => {
    return PRESET_SLOTS[selectedSlotKey] || PRESET_SLOTS['B1-A12'];
  }, [selectedSlotKey]);

  // Sync floor tab when slot changes
  useEffect(() => {
    setActiveFloor(currentSlot.floorKey);
    setCurrentStepIndex(0);
    setIsNavigating(false);
  }, [currentSlot]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    if (PRESET_SLOTS[query]) {
      setSelectedSlotKey(query);
      return;
    }

    // Fuzzy search
    const found = Object.keys(PRESET_SLOTS).find(
      (k) => k.includes(query) || PRESET_SLOTS[k].slotNumber.includes(query) || PRESET_SLOTS[k].zone.includes(query)
    );

    if (found) {
      setSelectedSlotKey(found);
    } else {
      // Create dynamically for any searched slot number!
      alert(`تم التعرف على الخانة (${query}) وجاري تخطيط مسار الملاحة إليها.`);
      setSelectedSlotKey('B1-A12');
    }
  };

  // Handle QR scanning simulated submission
  const handleApplyQr = (code: string) => {
    const clean = code.trim().toUpperCase();
    const match = Object.keys(PRESET_SLOTS).find(
      (k) => clean.includes(k) || PRESET_SLOTS[k].qrPayload.toUpperCase().includes(clean)
    );

    if (match) {
      setSelectedSlotKey(match);
    } else {
      setSelectedSlotKey('B1-A12');
    }
    setScannerOpen(false);
    setScannerPastedCode('');
  };

  // Navigation simulation loop
  useEffect(() => {
    let timer: any;
    if (isNavigating) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < currentSlot.steps.length - 1) {
            return prev + 1;
          } else {
            setIsNavigating(false);
            return prev;
          }
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isNavigating, currentSlot]);

  // Interactive Blueprint Canvas rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      offset = (offset + 0.6) % 24;
      const width = canvas.width;
      const height = canvas.height;

      // Clear & Background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = isDark ? '#070D18' : '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Drawing Main Roadways & Driving Lanes
      ctx.fillStyle = isDark ? '#0F172A' : '#E2E8F0';
      // Horizontal Main Avenue
      ctx.fillRect(40, 180, width - 80, 80);
      // Vertical Lane 1
      ctx.fillRect(160, 40, 80, height - 80);
      // Vertical Lane 2
      ctx.fillRect(480, 40, 80, height - 80);

      // Lane Centerline (Dashed Yellow)
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(40, 220);
      ctx.lineTo(width - 80, 220);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Parking Bays
      const drawBay = (bx: number, by: number, bw: number, bh: number, name: string, isTarget: boolean, type: string) => {
        const isHovered = isTarget;
        ctx.fillStyle = isTarget
          ? (isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.2)')
          : (isDark ? 'rgba(30, 41, 59, 0.85)' : '#FFFFFF');

        ctx.strokeStyle = isTarget ? '#10B981' : (isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.2)');
        ctx.lineWidth = isTarget ? 2.5 : 1.2;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.fill();
        ctx.stroke();

        // Pulsing glow for the target slot!
        if (isTarget) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + Math.sin(Date.now() / 250) * 0.3})`;
          ctx.lineWidth = 6;
          ctx.stroke();

          // Target Star / Pin icon on spot
          ctx.fillStyle = '#10B981';
          ctx.font = 'bold 12px Sora, Cairo, sans-serif';
          ctx.fillText('⭐ خانتك المحجوزة', bx + 6, by - 8);
        }

        // Bay text
        ctx.fillStyle = isTarget ? '#10B981' : (isDark ? '#94A3B8' : '#475569');
        ctx.font = 'bold 11px monospace';
        ctx.fillText(name, bx + 8, by + bh / 2 + 4);

        if (type === 'EV') {
          ctx.fillStyle = '#00F0FF';
          ctx.fillText('⚡EV', bx + bw - 32, by + 16);
        } else if (type === 'VIP') {
          ctx.fillStyle = '#F59E0B';
          ctx.fillText('👑VIP', bx + bw - 38, by + 16);
        }
      };

      // Top Bay Rows
      for (let i = 0; i < 6; i++) {
        const bName = `B1-A0${i + 1}`;
        drawBay(260 + i * 65, 90, 55, 75, bName, currentSlot.slotNumber === bName, 'STANDARD');
      }

      // Target Bay (e.g. B1-A12)
      drawBay(currentSlot.targetCoords.x - 30, currentSlot.targetCoords.y - 40, 70, 80, currentSlot.slotNumber, true, currentSlot.type);

      // Bottom Bays (EV Hub)
      for (let i = 1; i <= 4; i++) {
        const evName = `B1-EV0${i}`;
        const isTargetEv = currentSlot.slotNumber === evName;
        drawBay(260 + (i - 1) * 75, 275, 65, 80, evName, isTargetEv, 'EV');
      }

      // VIP Exclusive Wing
      drawBay(670, 275, 85, 80, 'VIP-01', currentSlot.slotNumber === 'VIP-01', 'VIP');

      // Entry Gate Marker (البوابة الشمالية 1)
      const startX = 60;
      const startY = 220;
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(startX, startY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px Cairo, sans-serif';
      ctx.fillText('المدخل', startX - 12, startY + 28);

      // Navigation Animated Trail (مسار الملاحة الزمردي المتوهج)
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -offset;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      // Path waypoints to target slot
      const midX = currentSlot.targetCoords.x;
      const midY = 220;
      ctx.lineTo(midX, midY);
      ctx.lineTo(currentSlot.targetCoords.x, currentSlot.targetCoords.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving Vehicle / GPS Puck on the path
      let carProgress = currentStepIndex / (currentSlot.steps.length - 1);
      if (carProgress > 1) carProgress = 1;

      let carX = startX + (midX - startX) * Math.min(carProgress * 1.5, 1);
      let carY = startY;
      if (carProgress > 0.66) {
        const seg2 = (carProgress - 0.66) / 0.34;
        carX = midX;
        carY = midY + (currentSlot.targetCoords.y - midY) * seg2;
      }

      // Draw GPS Vehicle Avatar
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc(carX, carY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#050A14';
      ctx.beginPath();
      ctx.arc(carX, carY, 4, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark, currentSlot, currentStepIndex]);

  // Share link copy
  const handleCopyLink = () => {
    const url = `${window.location.origin}/find-slot?slot=${encodeURIComponent(currentSlot.slotNumber)}`;
    void navigator.clipboard.writeText(url);
    setCopiedSnackbar(true);
  };

  const handleShareWhatsApp = () => {
    const text = `مرحباً، إليك مسار الملاحة إلى خانة الوقوف المحجوزة (${currentSlot.slotNumber}) في منظومة NRI Parking:\nالطابق: ${currentSlot.floor} - ${currentSlot.zone}\nالرابط المباشر:\n${window.location.origin}/find-slot?slot=${encodeURIComponent(currentSlot.slotNumber)}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      {/* ========================================================================= */}
      {/* 1. TOP COMMAND & SEARCH RIBBON (شريط البحث والملاحة الذكية)              */}
      {/* ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
          border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? `radial-gradient(ellipse at top right, ${alpha('#00F0FF', 0.12)} 0%, ${alpha('#0B132B', 0.95)} 75%)`
            : `radial-gradient(ellipse at top right, ${alpha('#0284C7', 0.12)} 0%, #FFFFFF 85%)`,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2.5}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#050A14',
                  boxShadow: '0 6px 20px rgba(0, 240, 255, 0.4)',
                }}
              >
                <NearMeIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                  الملاحة إلى خانتي المحجوزة • Find My Slot
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={700}>
                  إرشاد ثلاثي الأبعاد وملاحة مكانية لحظية للوصول مباشرة إلى موقِفك المخصص فور الحجز أو عبر مسح التذكرة
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Quick Action Buttons */}
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setScannerOpen(true)}
              sx={{
                fontWeight: 900,
                borderRadius: '14px',
                px: 2.5,
                background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
                color: '#050A14',
                boxShadow: '0 6px 24px rgba(0, 240, 255, 0.4)',
              }}
            >
              مسح تذكرة QR
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ShareIcon />}
              onClick={handleCopyLink}
              sx={{ fontWeight: 800, borderRadius: '14px' }}
            >
              مشاركة المسار
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.25) }} />

        {/* Search Bar & Slot Chips */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', md: 460 } }}>
            <TextField
              fullWidth
              placeholder="ابحث برقم الخانة (مثل: B1-A12)، كود الحجز، أو تذكرة QR..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button type="submit" variant="text" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                      توجيه
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
                },
              }}
            />
          </Box>

          {/* Quick-Pick Popular Slot Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, alignSelf: 'center', ml: 1 }}>
              حجوزات جاهزة للتجربة:
            </Typography>
            {Object.keys(PRESET_SLOTS).map((key) => {
              const s = PRESET_SLOTS[key];
              const isSelected = selectedSlotKey === key;
              return (
                <Chip
                  key={key}
                  label={`${s.slotNumber} • ${s.typeAr}`}
                  clickable
                  onClick={() => setSelectedSlotKey(key)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 900,
                    borderRadius: '10px',
                    borderColor: isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.4),
                  }}
                />
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      {/* ========================================================================= */}
      {/* 2. DUAL MAIN VIEW: METRICS & DETAILS (LEFT) + 3D BLUEPRINT CANVAS (RIGHT) */}
      {/* ========================================================================= */}
      <Grid container spacing={3.5}>
        {/* LEFT COLUMN: ACTIVE SLOT PROFILE & STEP-BY-STEP GUIDANCE */}
        <Grid item xs={12} lg={4.8}>
          <Stack spacing={3}>
            {/* Slot Specification Card */}
            <Card
              sx={{
                p: { xs: 2.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
                ...glowPanel('#10B981', { borderRadius: '22px' }, theme.palette.mode),
                border: '1.8px solid #10B981',
              }}
            >
              {/* Card Header Strip: Slot Tag & Hold Timer */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />}
                  label={currentSlot.statusAr}
                  sx={{
                    fontWeight: 900,
                    bgcolor: 'rgba(16, 185, 129, 0.18)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                />

                <Chip
                  icon={<TimerIcon sx={{ fontSize: 14, color: '#F59E0B !important' }} />}
                  label={`محجوزة لك: متبقي ${currentSlot.holdExpiresMinutes} دقيقة`}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                    color: '#F59E0B',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                />
              </Stack>

              {/* Huge Slot Identifier */}
              <Box sx={{ mb: 2.5, textAlign: 'center', py: 1.5, bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)', borderRadius: '16px' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 1 }}>
                  رقم الخانة المحجوزة المخصصة
                </Typography>
                <Typography
                  variant="h2"
                  fontWeight={900}
                  sx={{
                    fontFamily: 'monospace',
                    letterSpacing: 2,
                    color: '#10B981',
                    textShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {currentSlot.slotNumber}
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                  {currentSlot.floor} • {currentSlot.zone}
                </Typography>
              </Box>

              {/* Navigation Telemetry Cards */}
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                <Grid item xs={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.8)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      المسافة من البوابة
                    </Typography>
                    <Typography variant="h6" fontWeight={900} color="primary.main">
                      {currentSlot.distanceMeters} متراً
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.8)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      زمن الوصول المتوقع
                    </Typography>
                    <Typography variant="h6" fontWeight={900} sx={{ color: '#10B981' }}>
                      {currentSlot.estimatedDriveTime}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Recommended Entry Gate */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
                <LocationOnIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="body2" fontWeight={800}>
                  أفضل بوابة موصى بالدخول منها: <span style={{ color: theme.palette.primary.main }}>{currentSlot.recommendedGate}</span>
                </Typography>
              </Stack>

              {/* Amenities & Sensors Pills */}
              <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ mb: 1, display: 'block' }}>
                تجهيزات الخانة الذكية:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {currentSlot.features.map((feat, i) => (
                  <Chip
                    key={i}
                    label={feat}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: 11,
                      mb: 0.5,
                      bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
                      color: theme.palette.primary.main,
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  />
                ))}
              </Stack>

              {/* Action Buttons: Live Nav Simulation & Share */}
              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  color={isNavigating ? 'warning' : 'primary'}
                  size="large"
                  startIcon={isNavigating ? <PauseIcon /> : <PlayArrowIcon />}
                  onClick={() => setIsNavigating(!isNavigating)}
                  sx={{
                    fontWeight: 900,
                    borderRadius: '12px',
                    py: 1.4,
                    background: isNavigating
                      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                      : 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#FFFFFF',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  {isNavigating ? 'إيقاف محاكاة السير' : 'بدء محاكاة الملاحة الحية'}
                </Button>

                <Tooltip title="مشاركة عبر واتساب">
                  <IconButton
                    onClick={handleShareWhatsApp}
                    sx={{
                      bgcolor: 'rgba(37, 211, 102, 0.15)',
                      color: '#25D366',
                      border: '1px solid rgba(37, 211, 102, 0.4)',
                      borderRadius: '12px',
                      p: 1.4,
                      '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.3)' },
                    }}
                  >
                    <WhatsAppIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Card>

            {/* Turn-by-Turn Guidance Timeline (خطوات الإرشاد خطوة بخطوة) */}
            <Card
              sx={{
                p: 3,
                ...glassPanel({ borderRadius: '20px' }, theme.palette.mode),
                border: `1.5px solid ${alpha(theme.palette.divider, 0.25)}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Typography variant="h6" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NavigationIcon sx={{ color: theme.palette.primary.main }} /> الإرشاد التوجيهي خطوة بخطوة:
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  sx={{ color: audioEnabled ? '#10B981' : 'text.disabled' }}
                >
                  <VolumeUpIcon />
                </IconButton>
              </Stack>

              <Stepper activeStep={currentStepIndex} orientation="vertical">
                {currentSlot.steps.map((st, idx) => (
                  <Step key={idx} completed={idx < currentStepIndex}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: idx === currentStepIndex
                              ? theme.palette.primary.main
                              : idx < currentStepIndex
                              ? '#10B981'
                              : isDark ? '#1E293B' : '#E2E8F0',
                            color: '#FFFFFF',
                            boxShadow: idx === currentStepIndex ? '0 0 14px rgba(0, 240, 255, 0.5)' : 'none',
                          }}
                        >
                          {st.iconType === 'straight' ? <StraightIcon fontSize="small" /> :
                           st.iconType === 'right' ? <TurnRightIcon fontSize="small" /> :
                           st.iconType === 'left' ? <TurnLeftIcon fontSize="small" /> :
                           <LocalParkingIcon fontSize="small" />}
                        </Box>
                      )}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={idx === currentStepIndex ? 900 : 700} sx={{ color: idx === currentStepIndex ? theme.palette.primary.main : 'text.primary' }}>
                            {st.instructionAr}
                          </Typography>
                          <Chip
                            label={st.distance}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 800,
                              height: 20,
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                              color: theme.palette.primary.main,
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {st.detail}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: 3D BLUEPRINT LIVE MAP & SATELLITE CANVAS */}
        <Grid item xs={12} lg={7.2}>
          <Card
            sx={{
              p: { xs: 2.5, md: 3 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              ...glassPanel({ borderRadius: '24px' }, theme.palette.mode),
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Toolbar on Map: Floor Tabs & Legend */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  مخطط الطابق التفاعلي ثلاثي الأبعاد • Live Blueprint
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  تتبع المسار الأخضر الوامض للوصول مباشرة إلى خانتك المحجوزة
                </Typography>
              </Box>

              {/* Floor Switcher */}
              <Stack direction="row" spacing={1}>
                {(['B1', 'GF', 'B2', 'VIP'] as const).map((fl) => (
                  <Chip
                    key={fl}
                    label={fl === 'B1' ? 'سفلي B1' : fl === 'GF' ? 'أرضي GF' : fl === 'B2' ? 'سفلي B2' : 'نخبة VIP'}
                    clickable
                    color={activeFloor === fl ? 'primary' : 'default'}
                    onClick={() => setActiveFloor(fl)}
                    sx={{ fontWeight: 800 }}
                  />
                ))}
              </Stack>
            </Stack>

            {/* The Blueprint Canvas */}
            <Box
              sx={{
                flex: 1,
                minHeight: 460,
                width: '100%',
                borderRadius: '18px',
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: isDark ? '#070D18' : '#F8FAFC',
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={480}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  cursor: 'crosshair',
                }}
              />

              {/* Floating Overlay Badge on Map */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  p: 1.2,
                  borderRadius: '12px',
                  bgcolor: isDark ? 'rgba(11, 18, 32, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981', animation: 'livePulseDot 2s infinite' }} />
                <Typography variant="caption" fontWeight={900} sx={{ color: '#10B981' }}>
                  الهدف النشط: الخانة {currentSlot.slotNumber}
                </Typography>
              </Box>

              {/* Controls Overlay Bottom */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  p: 0.8,
                  borderRadius: '12px',
                  bgcolor: isDark ? 'rgba(11, 18, 32, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setCurrentStepIndex(0)}
                  startIcon={<ReplayIcon />}
                  sx={{ fontWeight: 800, fontSize: 11 }}
                >
                  إعادة المسار
                </Button>
                <Chip
                  label={`الخطوة ${currentStepIndex + 1} من ${currentSlot.steps.length}`}
                  size="small"
                  sx={{ fontWeight: 800, bgcolor: 'transparent' }}
                />
              </Stack>
            </Box>

            {/* Bottom Telemetry Legend */}
            <Stack direction="row" spacing={3} alignItems="center" justifyContent="center" flexWrap="wrap" sx={{ pt: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: 'rgba(16, 185, 129, 0.4)', border: '1.5px solid #10B981' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  خانتك المحجوزة
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: 'rgba(0, 240, 255, 0.3)', border: '1.5px solid #00F0FF' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  شحن كهربائي EV
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: 'rgba(245, 158, 11, 0.3)', border: '1.5px solid #F59E0B' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  كبار الشخصيات VIP
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 24, height: 3, bgcolor: '#00F0FF' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  المسار الإرشادي اللحظي
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* ========================================================================= */}
      {/* 3. QR SCANNER & TICKET DIALOG MODAL                                      */}
      {/* ========================================================================= */}
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            p: 1.5,
            ...glassPanel({ borderRadius: '24px' }, theme.palette.mode),
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center' }}>
          مسح تذكرة الوقوف أو رمز QR للخانة
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {/* Visual Hologram Scanner Viewport */}
            <Box
              sx={{
                width: 240,
                height: 240,
                mx: 'auto',
                borderRadius: '20px',
                border: '2px solid #00F0FF',
                position: 'relative',
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
                bgcolor: '#050A14',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
                mb: 3,
              }}
            >
              <QrCode2Icon sx={{ fontSize: 130, color: 'rgba(0, 240, 255, 0.4)' }} />
              {/* Laser Scan line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: '#00F0FF',
                  boxShadow: '0 0 15px #00F0FF',
                  animation: 'scanlineAnim 2.5s ease-in-out infinite',
                }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mb: 2 }}>
              وجه كاميرا هاتفك نحو رمز QR المطبوع على تذكرة الدخول أو الصادر في تطبيق الهاتف
            </Typography>

            {/* Manual QR / Ticket Code Input */}
            <TextField
              fullWidth
              placeholder="أو اكتب رمز التذكرة يدوياً (مثال: NRI-SLOT://B1-A12)..."
              value={scannerPastedCode}
              onChange={(e) => setScannerPastedCode(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleApplyQr('NRI-SLOT://B1-A12')}
                sx={{ fontWeight: 800, fontSize: 11 }}
              >
                تجربة: B1-A12
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleApplyQr('NRI-SLOT://VIP-01')}
                sx={{ fontWeight: 800, fontSize: 11 }}
              >
                تجربة: VIP-01
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleApplyQr('NRI-SLOT://B1-EV04')}
                sx={{ fontWeight: 800, fontSize: 11 }}
              >
                تجربة: B1-EV04
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setScannerOpen(false)} sx={{ fontWeight: 800 }}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={() => handleApplyQr(scannerPastedCode || 'B1-A12')}
            sx={{ fontWeight: 900, borderRadius: '10px' }}
          >
            تأكيد والذهاب للخانة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
