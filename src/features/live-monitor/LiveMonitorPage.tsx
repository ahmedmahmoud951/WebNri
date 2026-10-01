import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogContent,
  IconButton,
  Slider,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Fade,
  Autocomplete,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SensorsIcon from '@mui/icons-material/Sensors';
import StarIcon from '@mui/icons-material/Star';
import EvStationIcon from '@mui/icons-material/EvStation';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import ShieldIcon from '@mui/icons-material/Shield';
import MemoryIcon from '@mui/icons-material/Memory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import { useTranslation } from 'react-i18next';
import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';

// Types for captured LPR records with full bilingual data
export interface LprCaptureRecord {
  id: string;
  plateNumber: string;
  plateLatin: string;
  vehicleMakeAr: string;
  vehicleMakeEn: string;
  vehicleModelAr: string;
  vehicleModelEn: string;
  vehicleColorAr: string;
  vehicleColorEn: string;
  vehicleColorHex: string;
  countryAr: string;
  countryEn: string;
  countryCode: string;
  gateNameAr: string;
  gateNameEn: string;
  cameraCode: string;
  direction: 'Entry' | 'Exit';
  speedAr: string;
  speedEn: string;
  confidence: number;
  eventTime: string;
  captureDateAr: string;
  captureDateEn: string;
  status: 'VIP' | 'Authorized' | 'Visitor' | 'EV' | 'Transport';
  statusLabelAr: string;
  statusLabelEn: string;
  classificationAr: string;
  classificationEn: string;
  imageUrl: string;
  cropImageUrl?: string;
  plateLetters: string;
  plateDigits: string;
  isNew?: boolean;
}

// Master Saudi vehicle models catalog with 5 real 4K CCTV Parking Captures
const MASTER_SAUDI_VEHICLES = [
  {
    plateAr: 'أ ب ج 1004',
    plateEn: '1004 JBA',
    makeAr: 'تويوتا',
    makeEn: 'Toyota',
    modelAr: 'لاند كروزر 300 VXR',
    modelEn: 'Land Cruiser 300 VXR',
    colorAr: 'أبيض لؤلؤي',
    colorEn: 'Pearl White',
    colorHex: '#F8FAFC',
    status: 'Authorized' as const,
    statusLabelAr: 'اشتراك سنوي مصرح',
    statusLabelEn: 'Authorized Annual Pass',
    classificationAr: 'خصوصي - ترخيص معتمد',
    classificationEn: 'Private - Valid License',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Kingdom of Saudi Arabia',
    countryCode: 'KSA',
    gateNameAr: 'البوابة الشمالية 1 (مسار الدخول الذكي)',
    gateNameEn: 'North Gate 1 (Smart Entry Lane)',
    cameraCode: 'CAM-01-NORTH-IN',
    direction: 'Entry' as const,
    speedAr: '24 كم/س',
    speedEn: '24 km/h',
    imageUrl: '/images/cctv_cam1_landcruiser.jpg',
  },
  {
    plateAr: 'س ع د 8080',
    plateEn: '8080 DAS',
    makeAr: 'لكزس',
    makeEn: 'Lexus',
    modelAr: 'LX 600 VIP الإصدار الأسود',
    modelEn: 'LX 600 VIP Black Edition',
    colorAr: 'أسود ملكي',
    colorEn: 'Royal Black',
    colorHex: '#0F172A',
    status: 'VIP' as const,
    statusLabelAr: 'تصريح كبار الشخصيات VIP',
    statusLabelEn: 'VIP Presidential Pass',
    classificationAr: 'رئاسي - المسار المخصص',
    classificationEn: 'Executive VIP Lane',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Kingdom of Saudi Arabia',
    countryCode: 'KSA',
    gateNameAr: 'بوابة كبار الشخصيات VIP (المسار الرئاسي)',
    gateNameEn: 'VIP Royal Gate (Presidential Lane)',
    cameraCode: 'CAM-02-VIP-GATE',
    direction: 'Entry' as const,
    speedAr: '16 كم/س',
    speedEn: '16 km/h',
    imageUrl: '/images/cctv_cam2_lexus_vip.jpg',
  },
  {
    plateAr: 'ف هـ د 9999',
    plateEn: '9999 DHF',
    makeAr: 'مرسيدس-بنز',
    makeEn: 'Mercedes-Benz',
    modelAr: 'S-580 4MATIC مايباخ',
    modelEn: 'S-580 4MATIC Maybach Look',
    colorAr: 'فضي ألماسي',
    colorEn: 'Diamond Silver',
    colorHex: '#CBD5E1',
    status: 'Authorized' as const,
    statusLabelAr: 'تصريح تنفيذي معتمد',
    statusLabelEn: 'Executive Approved Pass',
    classificationAr: 'دبلوماسي / تنفيذي',
    classificationEn: 'Diplomatic / Executive',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Kingdom of Saudi Arabia',
    countryCode: 'KSA',
    gateNameAr: 'البوابة الشمالية 1 (مسار الخروج السريع)',
    gateNameEn: 'North Gate 1 (Express Exit Lane)',
    cameraCode: 'CAM-03-NORTH-OUT',
    direction: 'Exit' as const,
    speedAr: '22 كم/س',
    speedEn: '22 km/h',
    imageUrl: '/images/cctv_cam3_mercedes_exit.jpg',
  },
  {
    plateAr: 'ق م ر 1446',
    plateEn: '1446 RMQ',
    makeAr: 'بورش',
    makeEn: 'Porsche',
    modelAr: 'كايين GTS كوبيه',
    modelEn: 'Cayenne GTS Coupe',
    colorAr: 'رمادي طباشيري',
    colorEn: 'Chalk Grey',
    colorHex: '#94A3B8',
    status: 'Visitor' as const,
    statusLabelAr: 'تذكرة زائر رقمية مؤكدة',
    statusLabelEn: 'Verified Digital Guest Pass',
    classificationAr: 'زائر - موقف محجوز',
    classificationEn: 'Visitor - Reserved Space',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Kingdom of Saudi Arabia',
    countryCode: 'KSA',
    gateNameAr: 'البوابة الشرقية 3 (منحدر المواقف الذكي)',
    gateNameEn: 'East Gate 3 (Smart Parking Ramp)',
    cameraCode: 'CAM-04-EAST-RAMP',
    direction: 'Entry' as const,
    speedAr: '19 كم/س',
    speedEn: '19 km/h',
    imageUrl: '/images/cctv_cam4_porsche.jpg',
  },
  {
    plateAr: 'ر ي ض 1111',
    plateEn: '1111 DYR',
    makeAr: 'رينج روفر',
    makeEn: 'Range Rover',
    modelAr: 'أوتوبيوغرافي LWB',
    modelEn: 'Autobiography LWB',
    colorAr: 'أبيض سانتوريني',
    colorEn: 'Santorini White',
    colorHex: '#F1F5F9',
    status: 'VIP' as const,
    statusLabelAr: 'تصريح كبار الشخصيات VIP',
    statusLabelEn: 'VIP Royal Access Pass',
    classificationAr: 'شخصيات رفيعة - القصر',
    classificationEn: 'High Dignitary - Palace',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Kingdom of Saudi Arabia',
    countryCode: 'KSA',
    gateNameAr: 'البوابة الجنوبية 2 (مسار البوليفارد)',
    gateNameEn: 'South Gate 2 (Boulevard Access)',
    cameraCode: 'CAM-05-SOUTH-IN',
    direction: 'Entry' as const,
    speedAr: '18 كم/س',
    speedEn: '18 km/h',
    imageUrl: '/images/cctv_cam5_rangerover.jpg',
  },
];

// Helper to extract Arabic letters and digits from Saudi plate
function parseSaudiPlate(plate: string) {
  const digitsMatch = plate.match(/\d+/) || ['1004'];
  const digits = digitsMatch[0];
  const letters = plate.replace(/\d+/g, '').trim();
  return { digits, letters };
}

// Color filter options with bilingual labels
export interface ColorOptionType {
  id: string;
  labelAr: string;
  labelEn: string;
  colorHex: string;
  shade: string;
}

const COLOR_FILTER_OPTIONS: ColorOptionType[] = [
  { id: 'ALL', labelAr: 'كافة الألوان', labelEn: 'All Colors', colorHex: 'linear-gradient(135deg, #FFF, #000)', shade: 'الكل' },
  { id: 'أبيض لؤلؤي', labelAr: 'أبيض لؤلؤي', labelEn: 'Pearl White', colorHex: '#F8FAFC', shade: 'أبيض' },
  { id: 'أبيض سانتوريني', labelAr: 'أبيض سانتوريني', labelEn: 'Santorini White', colorHex: '#F1F5F9', shade: 'أبيض' },
  { id: 'أبيض صدفي', labelAr: 'أبيض صدفي', labelEn: 'Pure White', colorHex: '#FFFFFF', shade: 'أبيض' },
  { id: 'أسود ملكي', labelAr: 'أسود ملكي', labelEn: 'Royal Black', colorHex: '#0F172A', shade: 'أسود' },
  { id: 'أسود كربوني', labelAr: 'أسود كربوني', labelEn: 'Carbon Black', colorHex: '#0B0F19', shade: 'أسود' },
  { id: 'فضي ألماسي', labelAr: 'فضي ألماسي', labelEn: 'Diamond Silver', colorHex: '#CBD5E1', shade: 'فضي' },
  { id: 'فضي معدني', labelAr: 'فضي معدني', labelEn: 'Metallic Silver', colorHex: '#94A3B8', shade: 'فضي' },
  { id: 'رمادي طباشيري', labelAr: 'رمادي طباشيري', labelEn: 'Chalk Grey', colorHex: '#94A3B8', shade: 'رمادي' },
  { id: 'رمادي تيتانيوم', labelAr: 'رمادي تيتانيوم', labelEn: 'Titanium Grey', colorHex: '#64748B', shade: 'رمادي' },
  { id: 'كحلي ميتاليك', labelAr: 'أزرق كحلي ميتاليك', labelEn: 'Deep Navy Metallic', colorHex: '#1E3A8A', shade: 'أزرق' },
  { id: 'أزرق كربوني', labelAr: 'أزرق كربوني ليلي', labelEn: 'Midnight Carbon Blue', colorHex: '#1E293B', shade: 'أزرق' },
  { id: 'أحمر كريستالي', labelAr: 'أحمر كريستالي', labelEn: 'Crystal Red', colorHex: '#DC2626', shade: 'أحمر' },
  { id: 'برونزي أندلسي', labelAr: 'برونزي أندلسي فاخر', labelEn: 'Andalusian Bronze', colorHex: '#D97706', shade: 'بني' },
  { id: 'أخضر داكن', labelAr: 'أخضر ملكي داكن', labelEn: 'Royal Deep Green', colorHex: '#047857', shade: 'أخضر' },
  { id: 'ذهبي شامبين', labelAr: 'ذهبي شامبين', labelEn: 'Champagne Gold', colorHex: '#F59E0B', shade: 'ذهبي' },
];

// Gate options for gate filter
const GATE_OPTIONS = [
  { id: 'ALL', labelAr: 'كافة البوابات والمحطات', labelEn: 'All Gates & Stations' },
  { id: 'الشمالية', labelAr: 'البوابة الشمالية 1 (مسار الدخول الذكي)', labelEn: 'North Gate 1 (Smart Entry)' },
  { id: 'VIP', labelAr: 'بوابة كبار الشخصيات VIP (المسار الرئاسي)', labelEn: 'VIP Royal Gate (Presidential)' },
  { id: 'الشرقية', labelAr: 'البوابة الشرقية 3 (منحدر المواقف)', labelEn: 'East Gate 3 (Parking Ramp)' },
  { id: 'الجنوبية', labelAr: 'البوابة الجنوبية 2 (مسار البوليفارد)', labelEn: 'South Gate 2 (Boulevard)' },
  { id: 'EV', labelAr: 'محطة الشحن الكهربائي EV Hub', labelEn: 'EV Fast Charging Hub' },
];

// Camera channels definition for top tactical switcher
const CAMERA_CHANNELS = [
  {
    code: 'CAM-01-NORTH-IN',
    codeShort: 'CAM-01',
    nameAr: 'البوابة الشمالية 1 (دخول ذكي)',
    nameEn: 'North Gate 1 (Smart Entry)',
    targetVehicleAr: 'تويوتا لاند كروزر 300 VXR',
    targetVehicleEn: 'Toyota Land Cruiser 300 VXR',
    direction: 'Entry' as const,
    resolution: '4K UHD',
    fps: '60 FPS',
    idx: 0,
  },
  {
    code: 'CAM-02-VIP-GATE',
    codeShort: 'CAM-02',
    nameAr: 'بوابة VIP (المسار الرئاسي)',
    nameEn: 'VIP Gate (Presidential Lane)',
    targetVehicleAr: 'لكزس LX 600 VIP',
    targetVehicleEn: 'Lexus LX 600 VIP',
    direction: 'Entry' as const,
    resolution: '4K UHD',
    fps: '60 FPS',
    idx: 1,
  },
  {
    code: 'CAM-03-NORTH-OUT',
    codeShort: 'CAM-03',
    nameAr: 'البوابة الشمالية 1 (خروج سريع)',
    nameEn: 'North Gate 1 (Fast Exit)',
    targetVehicleAr: 'مرسيدس-بنز S-580 مايباخ',
    targetVehicleEn: 'Mercedes S-580 Maybach',
    direction: 'Exit' as const,
    resolution: '4K UHD',
    fps: '60 FPS',
    idx: 2,
  },
  {
    code: 'CAM-04-EAST-RAMP',
    codeShort: 'CAM-04',
    nameAr: 'البوابة الشرقية 3 (منحدر المواقف)',
    nameEn: 'East Gate 3 (Parking Ramp)',
    targetVehicleAr: 'بورش كايين GTS كوبيه',
    targetVehicleEn: 'Porsche Cayenne GTS',
    direction: 'Entry' as const,
    resolution: '4K UHD',
    fps: '60 FPS',
    idx: 3,
  },
  {
    code: 'CAM-05-SOUTH-IN',
    codeShort: 'CAM-05',
    nameAr: 'البوابة الجنوبية 2 (البوليفارد)',
    nameEn: 'South Gate 2 (Boulevard)',
    targetVehicleAr: 'رينج روفر أوتوبيوغرافي',
    targetVehicleEn: 'Range Rover Autobiography',
    direction: 'Entry' as const,
    resolution: '4K UHD',
    fps: '60 FPS',
    idx: 4,
  },
];

export function LiveMonitorPage() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  // Active view tab: Live Monitor & Crop Station VS Search & Investigation Grid
  const [activeTab, setActiveTab] = useState<'LIVE_MONITOR' | 'SEARCH_GRID'>('LIVE_MONITOR');

  // Live incoming captures dataset with bilingual support
  const [captures, setCaptures] = useState<LprCaptureRecord[]>(() => {
    const list: LprCaptureRecord[] = [];
    for (let round = 0; round < 3; round++) {
      MASTER_SAUDI_VEHICLES.forEach((v, idx) => {
        const { digits, letters } = parseSaudiPlate(v.plateAr);
        const minutesAgo = (round * 5 + idx + 1) * 3;
        const d = new Date(Date.now() - minutesAgo * 60000);
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        const secs = ((idx * 17 + round * 19) % 60).toString().padStart(2, '0');
        list.push({
          id: `cap-${round + 1}-${idx + 1}`,
          plateNumber: v.plateAr,
          plateLatin: v.plateEn,
          vehicleMakeAr: v.makeAr,
          vehicleMakeEn: v.makeEn,
          vehicleModelAr: v.modelAr,
          vehicleModelEn: v.modelEn,
          vehicleColorAr: v.colorAr,
          vehicleColorEn: v.colorEn,
          vehicleColorHex: v.colorHex,
          countryAr: v.countryAr,
          countryEn: v.countryEn,
          countryCode: v.countryCode,
          gateNameAr: v.gateNameAr,
          gateNameEn: v.gateNameEn,
          cameraCode: v.cameraCode,
          direction: v.direction,
          speedAr: v.speedAr,
          speedEn: v.speedEn,
          confidence: 0.992 + ((idx + round) % 5) * 0.0015,
          eventTime: `${hours}:${mins}:${secs}`,
          captureDateAr: '1446/03/30 هـ',
          captureDateEn: 'Oct 01, 2026',
          status: v.status,
          statusLabelAr: v.statusLabelAr,
          statusLabelEn: v.statusLabelEn,
          classificationAr: v.classificationAr,
          classificationEn: v.classificationEn,
          imageUrl: v.imageUrl,
          cropImageUrl: v.imageUrl,
          plateLetters: letters,
          plateDigits: digits,
          isNew: false,
        });
      });
    }
    return list;
  });

  // Current live vehicle displayed in camera
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const currentLiveVehicle = MASTER_SAUDI_VEHICLES[currentCarIndex % MASTER_SAUDI_VEHICLES.length];

  // Laser cut & crop animation state
  const [isCutting, setIsCutting] = useState(false);
  const [flyingPlate, setFlyingPlate] = useState<LprCaptureRecord | null>(null);
  const [isAutoStreaming, setIsAutoStreaming] = useState(true);

  // Live digital clock with milliseconds
  const [liveClock, setLiveClock] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      const ms = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
      setLiveClock(`${h}:${m}:${s}.${ms}`);
    }, 45);
    return () => clearInterval(timer);
  }, []);

  // CCTV Video Playback Studio modal state
  const [playbackItem, setPlaybackItem] = useState<LprCaptureRecord | null>(null);
  const [playbackPlaying, setPlaybackPlaying] = useState(true);
  const [playbackTime, setPlaybackTime] = useState(3.4);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [playbackVisionMode, setPlaybackVisionMode] = useState<'RGB' | 'IR' | 'EDGES'>('RGB');
  const [showOcrOverlay, setShowOcrOverlay] = useState(true);

  // Full Plate & Vehicle Inspection Card Dialog state (تظهر كارت فيه كل شيء صور لوحة وبياناتها والوقت)
  const [inspectedCapture, setInspectedCapture] = useState<LprCaptureRecord | null>(null);
  const [copiedPlateFeedback, setCopiedPlateFeedback] = useState(false);

  const handleCopyPlate = (plate: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(plate);
      setCopiedPlateFeedback(true);
      setTimeout(() => setCopiedPlateFeedback(false), 2200);
    }
  };

  // Search & Filter state for the Investigation Grid
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('ALL');
  const [selectedMake, setSelectedMake] = useState('ALL');
  const [selectedGate, setSelectedGate] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'Entry' | 'Exit'>('ALL');
  const [selectedLetters, setSelectedLetters] = useState('');
  const [selectedDigits, setSelectedDigits] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Real-Time Cropped Captures Panel quick filter & search
  const [panelFilter, setPanelFilter] = useState<'ALL' | 'Entry' | 'Exit' | 'VIP'>('ALL');
  const [panelSearchText, setPanelSearchText] = useState('');

  const panelFilteredCaptures = useMemo(() => {
    return captures.filter((cap) => {
      if (panelFilter !== 'ALL') {
        if (panelFilter === 'VIP' && cap.status !== 'VIP') return false;
        if (panelFilter === 'Entry' && cap.direction !== 'Entry') return false;
        if (panelFilter === 'Exit' && cap.direction !== 'Exit') return false;
      }
      if (panelSearchText.trim()) {
        const query = panelSearchText.trim().toLowerCase();
        const plate = `${cap.plateNumber} ${cap.plateLatin}`.toLowerCase();
        const make = `${cap.vehicleMakeAr} ${cap.vehicleMakeEn} ${cap.vehicleModelAr} ${cap.vehicleModelEn}`.toLowerCase();
        const gate = `${cap.gateNameAr} ${cap.gateNameEn} ${cap.cameraCode}`.toLowerCase();
        if (!plate.includes(query) && !make.includes(query) && !gate.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [captures, panelFilter, panelSearchText]);

  // Dynamic counts for each filter category
  const panelCounts = useMemo(() => {
    return {
      all: captures.length,
      entry: captures.filter((c) => c.direction === 'Entry').length,
      exit: captures.filter((c) => c.direction === 'Exit').length,
      vip: captures.filter((c) => c.status === 'VIP').length,
    };
  }, [captures]);

  // Playback timer ticker when modal is open and playing
  useEffect(() => {
    if (!playbackItem || !playbackPlaying) return;
    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        return next > 10 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playbackItem, playbackPlaying, playbackSpeed]);

  // Core function: Trigger the Optical AI Plate Crop & Fly Animation
  const triggerCropSequence = (customIndex?: number) => {
    if (isCutting) return;
    setIsCutting(true);

    const vehicleIdx = typeof customIndex === 'number' ? customIndex : currentCarIndex;
    const veh = MASTER_SAUDI_VEHICLES[vehicleIdx % MASTER_SAUDI_VEHICLES.length];
    const { digits, letters } = parseSaudiPlate(veh.plateAr);

    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');

    const newRecord: LprCaptureRecord = {
      id: `live-crop-${Date.now()}`,
      plateNumber: veh.plateAr,
      plateLatin: veh.plateEn,
      vehicleMakeAr: veh.makeAr,
      vehicleMakeEn: veh.makeEn,
      vehicleModelAr: veh.modelAr,
      vehicleModelEn: veh.modelEn,
      vehicleColorAr: veh.colorAr,
      vehicleColorEn: veh.colorEn,
      vehicleColorHex: veh.colorHex,
      countryAr: veh.countryAr,
      countryEn: veh.countryEn,
      countryCode: veh.countryCode,
      gateNameAr: veh.gateNameAr,
      gateNameEn: veh.gateNameEn,
      cameraCode: veh.cameraCode,
      direction: veh.direction,
      speedAr: veh.speedAr,
      speedEn: veh.speedEn,
      confidence: 0.994 + Math.random() * 0.005,
      eventTime: `${h}:${m}:${s}`,
      captureDateAr: '1446/03/30 هـ',
      captureDateEn: 'Oct 01, 2026',
      status: veh.status,
      statusLabelAr: veh.statusLabelAr,
      statusLabelEn: veh.statusLabelEn,
      classificationAr: veh.classificationAr,
      classificationEn: veh.classificationEn,
      imageUrl: veh.imageUrl,
      cropImageUrl: veh.imageUrl,
      plateLetters: letters,
      plateDigits: digits,
      isNew: true,
    };

    // Step 1: Laser Lock & Cut phase
    setTimeout(() => {
      setFlyingPlate(newRecord);
    }, 280);

    // Step 2: Landing in the real-time side panel
    setTimeout(() => {
      setCaptures((prev) => [newRecord, ...prev.map((c) => ({ ...c, isNew: false }))]);
      setFlyingPlate(null);
      setIsCutting(false);
      if (typeof customIndex !== 'number') {
        setCurrentCarIndex((prev) => prev + 1);
      }
    }, 950);
  };

  // Automated continuous live stream simulation
  useEffect(() => {
    if (!isAutoStreaming || activeTab !== 'LIVE_MONITOR') return;
    const interval = setInterval(() => {
      triggerCropSequence();
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoStreaming, activeTab, currentCarIndex, isCutting]);

  // Open playback studio modal
  const handleOpenPlayback = (item: LprCaptureRecord) => {
    setPlaybackItem(item);
    setPlaybackTime(3.4);
    setPlaybackPlaying(true);
  };

  // List of unique makes for make filter
  const availableMakes = useMemo(() => {
    const setAr = new Set<string>();
    MASTER_SAUDI_VEHICLES.forEach((v) => setAr.add(isRtl ? v.makeAr : v.makeEn));
    return ['ALL', ...Array.from(setAr)];
  }, [isRtl]);

  // Filtered captures in the Search & Investigation Grid
  const filteredCaptures = useMemo(() => {
    return captures.filter((cap) => {
      // Color filter matching
      if (selectedColor !== 'ALL') {
        const targetOption = COLOR_FILTER_OPTIONS.find((c) => c.id === selectedColor);
        const colorKey = targetOption ? targetOption.id : selectedColor;
        const shadeKey = targetOption ? targetOption.shade : '';
        const matchDirect = cap.vehicleColorAr.includes(colorKey) || colorKey.includes(cap.vehicleColorAr);
        const matchShade = shadeKey && shadeKey !== 'الكل' && cap.vehicleColorAr.includes(shadeKey);
        const matchHex = targetOption && cap.vehicleColorHex === targetOption.colorHex;
        if (!matchDirect && !matchShade && !matchHex) return false;
      }
      // Make filter
      if (selectedMake !== 'ALL') {
        const currentMake = isRtl ? cap.vehicleMakeAr : cap.vehicleMakeEn;
        if (currentMake !== selectedMake) return false;
      }
      // Gate filter
      if (selectedGate !== 'ALL') {
        if (!cap.gateNameAr.includes(selectedGate) && !cap.cameraCode.includes(selectedGate)) {
          return false;
        }
      }
      // Direction filter
      if (selectedDirection !== 'ALL' && cap.direction !== selectedDirection) {
        return false;
      }
      // Plate letters filter
      if (selectedLetters.trim()) {
        const cleanReq = selectedLetters.replace(/\s+/g, '');
        const cleanCap = cap.plateLetters.replace(/\s+/g, '');
        if (!cleanCap.includes(cleanReq)) return false;
      }
      // Plate digits filter
      if (selectedDigits.trim()) {
        if (!cap.plateDigits.includes(selectedDigits.trim())) return false;
      }
      // General search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          cap.plateNumber.toLowerCase().includes(q) ||
          cap.plateLatin.toLowerCase().includes(q) ||
          cap.vehicleMakeAr.toLowerCase().includes(q) ||
          cap.vehicleMakeEn.toLowerCase().includes(q) ||
          cap.vehicleModelAr.toLowerCase().includes(q) ||
          cap.vehicleModelEn.toLowerCase().includes(q) ||
          cap.vehicleColorAr.toLowerCase().includes(q) ||
          cap.gateNameAr.toLowerCase().includes(q) ||
          cap.cameraCode.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    captures,
    selectedColor,
    selectedMake,
    selectedGate,
    selectedDirection,
    selectedLetters,
    selectedDigits,
    searchQuery,
    isRtl,
  ]);

  // Reset all investigation filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedColor('ALL');
    setSelectedMake('ALL');
    setSelectedGate('ALL');
    setSelectedDirection('ALL');
    setSelectedLetters('');
    setSelectedDigits('');
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Dynamic Keyframes for Laser Cut & Flying Plate Animation */}
      <style>
        {`
          @keyframes laserScanVertical {
            0% { top: 4%; opacity: 0.8; }
            50% { top: 92%; opacity: 1; filter: drop-shadow(0 0 10px #00F0FF); }
            100% { top: 4%; opacity: 0.8; }
          }
          @keyframes targetBoxPulse {
            0% { box-shadow: 0 0 15px rgba(0, 240, 255, 0.4), inset 0 0 15px rgba(0, 240, 255, 0.2); }
            50% { box-shadow: 0 0 35px rgba(0, 240, 255, 0.8), inset 0 0 25px rgba(0, 240, 255, 0.4); }
            100% { box-shadow: 0 0 15px rgba(0, 240, 255, 0.4), inset 0 0 15px rgba(0, 240, 255, 0.2); }
          }
          @keyframes laserCutSlice {
            0% { transform: scale(1); filter: brightness(1); }
            30% { transform: scale(1.05); filter: brightness(2) drop-shadow(0 0 20px #00F0FF); }
            60% { transform: scale(0.98); filter: brightness(1.5); }
            100% { transform: scale(1); filter: brightness(1); }
          }
          @keyframes flyToStreamPanel {
            0% {
              transform: translate(0, 0) scale(1) rotate(0deg);
              opacity: 1;
              box-shadow: 0 0 30px #00F0FF;
            }
            40% {
              transform: translate(${isRtl ? '-160px' : '160px'}, -70px) scale(1.15) rotate(${isRtl ? '-4deg' : '4deg'});
              opacity: 0.95;
              box-shadow: 0 0 50px #00F0FF;
            }
            100% {
              transform: translate(${isRtl ? '-460px' : '460px'}, 80px) scale(0.55) rotate(0deg);
              opacity: 0;
            }
          }
          @keyframes newArrivalPulse {
            0% {
              background-color: rgba(0, 240, 255, 0.35);
              border-color: #00F0FF;
              box-shadow: 0 0 35px rgba(0, 240, 255, 0.8);
              transform: translateY(-6px);
            }
            100% {
              background-color: rgba(15, 23, 42, 0.88);
              border-color: rgba(56, 189, 248, 0.28);
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
              transform: translateY(0);
            }
          }
          @keyframes liveRecordingBlink {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.85); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes radarSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Top Header & Console with Bilingual Switcher */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', lg: 'center' }}
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(56, 189, 248, 0.15))',
                border: '1.5px solid rgba(0, 240, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
              }}
            >
              <SensorsIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5, color: '#F8FAFC' }}>
                {isRtl
                  ? 'منظومة الرصد اللحظي والتعرف الذكي على لوحات المركبات'
                  : 'Live LPR Surveillance & Vehicle Intelligence System'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.4 }}>
                {isRtl
                  ? 'بث حي لكاميرات المراقبة 4K • استقطاع لوحات المركبات السعودية آلياً بالذكاء الاصطناعي • تدفق فوري لبيانات المركبة والهوية'
                  : '4K CCTV Live Stream • Automated Neural AI Saudi Plate OCR • Real-Time Vehicle Identification & Forensic Dossier'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Tactical Segmented Navigation Rail: البث المباشر والاستطلاع اللحظي & أرشيف التحري والبحث */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            p: '6px',
            borderRadius: '16px',
            bgcolor: 'rgba(11, 18, 32, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(0, 240, 255, 0.35)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65), 0 0 25px rgba(0, 240, 255, 0.15)',
            gap: 1.2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {/* Button 1: البث المباشر والاستطلاع اللحظي */}
          <Button
            onClick={() => setActiveTab('LIVE_MONITOR')}
            startIcon={
              <VideocamIcon
                sx={{
                  color: activeTab === 'LIVE_MONITOR' ? '#040814 !important' : '#00F0FF !important',
                  fontSize: '20px !important',
                }}
              />
            }
            sx={{
              flex: { xs: 1, sm: 'initial' },
              fontWeight: 900,
              fontSize: 13.5,
              borderRadius: '12px',
              px: 2.8,
              py: 1.15,
              whiteSpace: 'nowrap',
              transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
              background:
                activeTab === 'LIVE_MONITOR'
                  ? 'linear-gradient(135deg, #00F0FF 0%, #0284C7 100%)'
                  : 'transparent',
              color: activeTab === 'LIVE_MONITOR' ? '#040814' : '#94A3B8',
              boxShadow:
                activeTab === 'LIVE_MONITOR'
                  ? '0 0 24px rgba(0, 240, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                  : 'none',
              border:
                activeTab === 'LIVE_MONITOR'
                  ? '1px solid #00F0FF'
                  : '1px solid transparent',
              '&:hover': {
                background:
                  activeTab === 'LIVE_MONITOR'
                    ? 'linear-gradient(135deg, #38BDF8 0%, #00F0FF 100%)'
                    : 'rgba(0, 240, 255, 0.1)',
                color: activeTab === 'LIVE_MONITOR' ? '#040814' : '#00F0FF',
                borderColor: 'rgba(0, 240, 255, 0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <span>{isRtl ? 'البث المباشر والاستطلاع اللحظي' : 'Live Stream & Real-time Surveillance'}</span>
              <Chip
                label={isRtl ? 'مباشر • 5 قنوات' : 'LIVE • 5 CH'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 10,
                  fontWeight: 900,
                  bgcolor: activeTab === 'LIVE_MONITOR' ? 'rgba(4, 8, 20, 0.85)' : 'rgba(0, 240, 255, 0.15)',
                  color: activeTab === 'LIVE_MONITOR' ? '#00F0FF' : '#38BDF8',
                  border: `1px solid ${activeTab === 'LIVE_MONITOR' ? 'rgba(0, 240, 255, 0.6)' : 'rgba(0, 240, 255, 0.3)'}`,
                }}
              />
            </Stack>
          </Button>

          {/* Button 2: أرشيف التحري والبحث */}
          <Button
            onClick={() => setActiveTab('SEARCH_GRID')}
            startIcon={
              <GridViewIcon
                sx={{
                  color: activeTab === 'SEARCH_GRID' ? '#040814 !important' : '#38BDF8 !important',
                  fontSize: '20px !important',
                }}
              />
            }
            sx={{
              flex: { xs: 1, sm: 'initial' },
              fontWeight: 900,
              fontSize: 13.5,
              borderRadius: '12px',
              px: 2.8,
              py: 1.15,
              whiteSpace: 'nowrap',
              transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
              background:
                activeTab === 'SEARCH_GRID'
                  ? 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)'
                  : 'transparent',
              color: activeTab === 'SEARCH_GRID' ? '#040814' : '#94A3B8',
              boxShadow:
                activeTab === 'SEARCH_GRID'
                  ? '0 0 24px rgba(56, 189, 248, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                  : 'none',
              border:
                activeTab === 'SEARCH_GRID'
                  ? '1px solid #38BDF8'
                  : '1px solid transparent',
              '&:hover': {
                background:
                  activeTab === 'SEARCH_GRID'
                    ? 'linear-gradient(135deg, #00F0FF 0%, #38BDF8 100%)'
                    : 'rgba(56, 189, 248, 0.1)',
                color: activeTab === 'SEARCH_GRID' ? '#040814' : '#38BDF8',
                borderColor: 'rgba(56, 189, 248, 0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <span>{isRtl ? 'أرشيف التحري والبحث' : 'Investigation Archive & Search'}</span>
              <Chip
                label={isRtl ? `${captures.length} تسجيل` : `${captures.length} Records`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 10,
                  fontWeight: 900,
                  bgcolor: activeTab === 'SEARCH_GRID' ? 'rgba(4, 8, 20, 0.85)' : 'rgba(56, 189, 248, 0.15)',
                  color: activeTab === 'SEARCH_GRID' ? '#38BDF8' : '#94A3B8',
                  border: `1px solid ${activeTab === 'SEARCH_GRID' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(56, 189, 248, 0.3)'}`,
                }}
              />
            </Stack>
          </Button>
        </Box>
      </Stack>

      {/* ========================================================================= */}
      {/* MODE 1: LIVE MONITOR & OPTICAL CROP STATION */}
      {/* ========================================================================= */}
      {activeTab === 'LIVE_MONITOR' && (
        <Grid container spacing={3}>
          {/* Left/Center Column: Active Cameras Switcher ON TOP + Live 4K Viewport */}
          <Grid item xs={12} xl={6.8} lg={6.5}>
            {/* 3. ACTIVE CAMERAS SWITCHER - PLACED ABOVE LIVE (فوق Live مش تحت بتصميم خرافي) */}
            <Card
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: '20px',
                bgcolor: 'rgba(11, 18, 32, 0.94)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(0, 240, 255, 0.35)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 240, 255, 0.15)',
              }}
            >
              {/* Switcher Title Bar */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
                sx={{ mb: 1.75 }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '11px',
                      bgcolor: 'rgba(0, 240, 255, 0.15)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00F0FF',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                    }}
                  >
                    <VideocamIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#F8FAFC', fontSize: 15 }}>
                      {isRtl ? 'تبديل الكاميرات ومحطات الرصد النشطة' : 'Active Surveillance & LPR Camera Feeds'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                      {isRtl
                        ? 'انقر على أي كاميرا للتبديل الفوري للبث الحي واستقطاع لوحة المركبة الحالية'
                        : 'Click any camera to instantly switch live stream & trigger plate recognition'}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: '#10B981 !important' }} />}
                    label={isRtl ? '5 كاميرات نشطة • بث حي 4K' : '5 Active Channels • Live 4K UHD'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      fontWeight: 800,
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                    }}
                  />
                </Stack>
              </Stack>

              {/* 5 Tactical Camera Cards */}
              <Grid container spacing={1.2}>
                {CAMERA_CHANNELS.map((cam) => {
                  const isSelected = currentCarIndex % MASTER_SAUDI_VEHICLES.length === cam.idx;
                  return (
                    <Grid item xs={12} sm={6} md={2.4} key={cam.code}>
                      <Box
                        onClick={() => {
                          setCurrentCarIndex(cam.idx);
                          triggerCropSequence(cam.idx);
                        }}
                        sx={{
                          p: 1.4,
                          borderRadius: '14px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          bgcolor: isSelected
                            ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.22), rgba(15, 23, 42, 0.95))'
                            : 'rgba(15, 23, 42, 0.75)',
                          border: `1.5px solid ${isSelected ? '#00F0FF' : 'rgba(56, 189, 248, 0.22)'}`,
                          boxShadow: isSelected
                            ? '0 0 25px rgba(0, 240, 255, 0.45), inset 0 0 15px rgba(0, 240, 255, 0.15)'
                            : 'none',
                          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            borderColor: '#00F0FF',
                            transform: 'translateY(-2px)',
                            bgcolor: isSelected
                              ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.28), rgba(15, 23, 42, 0.95))'
                              : 'rgba(0, 240, 255, 0.08)',
                            boxShadow: '0 4px 20px rgba(0, 240, 255, 0.3)',
                          },
                        }}
                      >
                        {/* Top Code & Status */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 900,
                              fontSize: 11,
                              color: isSelected ? '#00F0FF' : 'text.secondary',
                            }}
                          >
                            {cam.codeShort}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: isSelected ? '#10B981' : '#64748B',
                                boxShadow: isSelected ? '0 0 8px #10B981' : 'none',
                                animation: isSelected ? 'liveRecordingBlink 1.4s infinite' : 'none',
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                color: isSelected ? '#10B981' : '#64748B',
                              }}
                            >
                              {isSelected ? (isRtl ? 'مباشر' : 'LIVE') : 'ON'}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Camera Gate Name */}
                        <Typography
                          variant="body2"
                          fontWeight={900}
                          sx={{
                            color: isSelected ? '#F8FAFC' : '#CBD5E1',
                            fontSize: 12,
                            lineHeight: 1.3,
                            mb: 0.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {isRtl ? cam.nameAr : cam.nameEn}
                        </Typography>

                        {/* Target Car & Direction */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="caption"
                            sx={{
                              color: isSelected ? '#38BDF8' : 'text.secondary',
                              fontSize: 10.5,
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '65%',
                            }}
                          >
                            {isRtl ? cam.targetVehicleAr : cam.targetVehicleEn}
                          </Typography>
                          <Chip
                            label={cam.direction === 'Entry' ? (isRtl ? 'دخول' : 'IN') : isRtl ? 'خروج' : 'OUT'}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 9,
                              fontWeight: 900,
                              bgcolor:
                                cam.direction === 'Entry' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.18)',
                              color: cam.direction === 'Entry' ? '#10B981' : '#38BDF8',
                              border: '1px solid currentColor',
                            }}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Card>

            {/* LIVE CCTV CAMERA VIEWPORT CARD */}
            <Card
              sx={{
                borderRadius: '20px',
                overflow: 'hidden',
                bgcolor: '#030712',
                border: '1.5px solid rgba(0, 240, 255, 0.35)',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 240, 255, 0.15)',
                position: 'relative',
              }}
            >
              {/* Camera Header Bar */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: 'rgba(15, 23, 42, 0.95)',
                  borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#EF4444',
                      animation: 'liveRecordingBlink 1.4s infinite',
                      boxShadow: '0 0 10px #EF4444',
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                    {isRtl ? currentLiveVehicle.gateNameAr : currentLiveVehicle.gateNameEn}
                  </Typography>
                  <Chip
                    size="small"
                    label={currentLiveVehicle.cameraCode}
                    sx={{
                      bgcolor: 'rgba(0, 240, 255, 0.12)',
                      color: '#00F0FF',
                      fontWeight: 800,
                      fontSize: 11,
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                    }}
                  />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Chip
                    icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: '#10B981 !important' }} />}
                    label="LIVE 4K • 60 FPS"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      fontWeight: 800,
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#38BDF8', fontFamily: 'monospace', fontWeight: 800 }}>
                    {liveClock}
                  </Typography>
                </Stack>
              </Box>

              {/* Main Simulated CCTV Camera Viewport */}
              <Box
                sx={{
                  height: { xs: 360, sm: 460, md: 520 },
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#040711',
                }}
              >
                {/* Background Vehicle Image with CCTV Perspective */}
                <Box
                  component="img"
                  src={currentLiveVehicle.imageUrl}
                  alt="Live Camera Feed"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: isCutting ? 'brightness(1.15) contrast(1.1)' : 'brightness(0.92) contrast(1.05)',
                    transition: 'filter 250ms ease',
                  }}
                />

                {/* CCTV Scanline & Vignette Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 90px rgba(0, 0, 0, 0.85)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Tactical Camera HUD Watermarks */}
                <Box sx={{ position: 'absolute', top: 18, left: isRtl ? 'auto' : 20, right: isRtl ? 20 : 'auto', pointerEvents: 'none' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#00F0FF',
                      bgcolor: 'rgba(0, 0, 0, 0.75)',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    AI OCR ENGINE: NEURAL-VISION v4.9
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#F8FAFC',
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      px: 1,
                      py: 0.2,
                      borderRadius: '4px',
                      fontSize: 10,
                    }}
                  >
                    {isRtl ? 'زاوية الرصد: 14.5° • المسافة: 4.8م' : 'Angle: 14.5° • Distance: 4.8m'}
                  </Typography>
                </Box>

                <Box sx={{ position: 'absolute', top: 18, left: isRtl ? 20 : 'auto', right: isRtl ? 'auto' : 20, pointerEvents: 'none' }}>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      icon={<SpeedIcon sx={{ fontSize: 13, color: '#38BDF8 !important' }} />}
                      label={isRtl ? currentLiveVehicle.speedAr : currentLiveVehicle.speedEn}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.75)',
                        color: '#38BDF8',
                        fontWeight: 800,
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                      }}
                    />
                    <Chip
                      label={
                        currentLiveVehicle.direction === 'Entry'
                          ? isRtl
                            ? 'حركة دخول'
                            : 'Entry Flow'
                          : isRtl
                          ? 'حركة خروج'
                          : 'Exit Flow'
                      }
                      size="small"
                      sx={{
                        bgcolor:
                          currentLiveVehicle.direction === 'Entry'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(56, 189, 248, 0.2)',
                        color: currentLiveVehicle.direction === 'Entry' ? '#10B981' : '#38BDF8',
                        fontWeight: 800,
                        border: '1px solid currentColor',
                      }}
                    />
                  </Stack>
                </Box>

                {/* THE CORE LIVE TARGETING & CROP BOUNDING BOX */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: { xs: '18%', sm: '22%' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: isCutting
                      ? 'laserCutSlice 0.6s ease-in-out'
                      : 'targetBoxPulse 2.8s infinite ease-in-out',
                    zIndex: 10,
                  }}
                >
                  {/* Status Banner above bounding box */}
                  <Box
                    sx={{
                      mb: 1,
                      px: 1.5,
                      py: 0.4,
                      borderRadius: '8px',
                      bgcolor: isCutting ? 'rgba(0, 240, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                      color: isCutting ? '#000' : '#00F0FF',
                      border: '1px solid #00F0FF',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                      fontWeight: 900,
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      transition: 'all 200ms ease',
                    }}
                  >
                    {isCutting ? (
                      <>
                        <CenterFocusStrongIcon sx={{ fontSize: 14 }} />
                        {isRtl ? 'جاري الاستقطاع العصبي والتعرف اللحظي...' : 'Executing Neural OCR Extraction...'}
                      </>
                    ) : (
                      <>
                        <CenterFocusStrongIcon sx={{ fontSize: 14 }} />
                        {isRtl ? 'تم تثبيت الهدف • مطابقة اللوحة مؤكدة 99.8%' : 'Target Locked • Plate Match 99.8%'}
                      </>
                    )}
                  </Box>

                  {/* The Plate Bounding Box with Corner Brackets */}
                  <Box
                    sx={{
                      position: 'relative',
                      p: 1.2,
                      borderRadius: '12px',
                      bgcolor: 'rgba(3, 7, 18, 0.85)',
                      backdropFilter: 'blur(10px)',
                      border: isCutting ? '3px solid #00F0FF' : '2px dashed #00F0FF',
                      boxShadow: isCutting
                        ? '0 0 35px rgba(0, 240, 255, 0.9)'
                        : '0 0 20px rgba(0, 240, 255, 0.4)',
                    }}
                  >
                    {/* Sweeping Laser Line Animation */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 4,
                        right: 4,
                        height: 3,
                        bgcolor: '#00F0FF',
                        boxShadow: '0 0 12px #00F0FF, 0 0 20px #00F0FF',
                        borderRadius: '2px',
                        animation: 'laserScanVertical 2s infinite ease-in-out',
                        pointerEvents: 'none',
                        zIndex: 15,
                      }}
                    />

                    {/* Corner Reticles */}
                    <Box sx={{ position: 'absolute', top: -3, left: -3, width: 14, height: 14, borderTop: '3px solid #00F0FF', borderLeft: '3px solid #00F0FF' }} />
                    <Box sx={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderTop: '3px solid #00F0FF', borderRight: '3px solid #00F0FF' }} />
                    <Box sx={{ position: 'absolute', bottom: -3, left: -3, width: 14, height: 14, borderBottom: '3px solid #00F0FF', borderLeft: '3px solid #00F0FF' }} />
                    <Box sx={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderBottom: '3px solid #00F0FF', borderRight: '3px solid #00F0FF' }} />

                    {/* The Authentic Embossed Saudi Plate inside Bounding Box */}
                    <SaudiRealisticPlate
                      plateNumber={currentLiveVehicle.plateAr}
                      size="md"
                      showBolts={true}
                      vehicleMake={isRtl ? currentLiveVehicle.makeAr : currentLiveVehicle.makeEn}
                      vehicleModel={isRtl ? currentLiveVehicle.modelAr : currentLiveVehicle.modelEn}
                      vehicleColor={isRtl ? currentLiveVehicle.colorAr : currentLiveVehicle.colorEn}
                      gateName={isRtl ? currentLiveVehicle.gateNameAr : currentLiveVehicle.gateNameEn}
                      captureTime={liveClock}
                    />
                  </Box>

                  {/* Vehicle Spec Tag below Box */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      color: '#F8FAFC',
                      bgcolor: 'rgba(0, 0, 0, 0.75)',
                      px: 1.5,
                      py: 0.35,
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: 11,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {isRtl ? currentLiveVehicle.makeAr : currentLiveVehicle.makeEn}{' '}
                    {isRtl ? currentLiveVehicle.modelAr : currentLiveVehicle.modelEn} •{' '}
                    {isRtl ? currentLiveVehicle.colorAr : currentLiveVehicle.colorEn}
                  </Typography>
                </Box>

                {/* ANIMATED FLYING CROPPED PLATE (Traveling to side captures panel) */}
                {flyingPlate && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: { xs: '18%', sm: '22%' },
                      zIndex: 99,
                      animation: 'flyToStreamPanel 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                      pointerEvents: 'none',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '10px',
                        bgcolor: 'rgba(0, 240, 255, 0.25)',
                        backdropFilter: 'blur(8px)',
                        border: '2px solid #00F0FF',
                        boxShadow: '0 0 35px #00F0FF',
                      }}
                    >
                      <SaudiRealisticPlate plateNumber={flyingPlate.plateNumber} size="sm" showBolts={false} />
                    </Box>
                  </Box>
                )}

                {/* 2. REFINED BOTTOM VIEWPORT CONTROLS (Removed unwanted manual crop & next car buttons) */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: 14,
                    right: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pointerEvents: 'auto',
                    zIndex: 20,
                  }}
                >
                  {/* Stream Telemetry Status */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      icon={<SecurityIcon sx={{ fontSize: 13, color: '#00F0FF !important' }} />}
                      label={isRtl ? 'الرصد العصبي المؤتمت نشط' : 'Neural OCR Active'}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.75)',
                        color: '#00F0FF',
                        fontWeight: 900,
                        fontSize: 11,
                        border: '1px solid rgba(0, 240, 255, 0.4)',
                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
                      }}
                    />
                  </Stack>

                  {/* Auto-Streaming Switch Toggle */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isAutoStreaming}
                        onChange={(e) => setIsAutoStreaming(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#00F0FF',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#00F0FF',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: '#F8FAFC', fontWeight: 800 }}>
                        {isAutoStreaming
                          ? isRtl
                            ? 'الرصد الآلي متواصل (6s)'
                            : 'Auto Stream Active (6s)'
                          : isRtl
                          ? 'الرصد الآلي متوقف'
                          : 'Auto Stream Paused'}
                      </Typography>
                    }
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.75)',
                      px: 1.5,
                      py: 0.35,
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      mr: 0,
                    }}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* 1. RIGHT COLUMN: EXTRAORDINARY REAL-TIME CROPPED CAPTURES PANEL (لوحة الالتقاطات المستقطعة اللحظية) */}
          <Grid item xs={12} xl={5.2} lg={5.5}>
            <Card
              sx={{
                borderRadius: '24px',
                bgcolor: 'rgba(9, 15, 28, 0.96)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(0, 240, 255, 0.35)',
                boxShadow:
                  '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 240, 255, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 720, lg: 840 },
                maxHeight: { xs: 800, lg: 880 },
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Panel Top Cybernetic Accent Line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '10%',
                  right: '10%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #00F0FF, #10B981, transparent)',
                  boxShadow: '0 0 12px #00F0FF',
                  flexShrink: 0,
                }}
              />

              {/* Panel Header */}
              <Box
                sx={{
                  p: 2.2,
                  bgcolor: 'rgba(13, 22, 41, 0.98)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  flexShrink: 0,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: 14,
                      height: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        bgcolor: '#00F0FF',
                        opacity: 0.75,
                        animation: 'liveRecordingBlink 1.4s infinite',
                      }}
                    />
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#00F0FF',
                        boxShadow: '0 0 12px #00F0FF',
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={900}
                      sx={{
                        color: '#F8FAFC',
                        fontSize: 16.5,
                        letterSpacing: 0.2,
                        textShadow: '0 0 16px rgba(0, 240, 255, 0.3)',
                      }}
                    >
                      {isRtl ? 'لوحة الالتقاطات المستقطعة اللحظية' : 'Real-Time Cropped Plate Captures'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 600 }}>
                      {isRtl
                        ? 'رصد متواصل وشامل لصورة اللوحة وكافة مواصفات وهوية المركبة'
                        : 'Continuous live surveillance of extracted plates & vehicle profiles'}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={
                    isRtl
                      ? `${panelFilteredCaptures.length} من أصل ${captures.length} لوحة`
                      : `${panelFilteredCaptures.length} of ${captures.length} Plates`
                  }
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 240, 255, 0.12)',
                    color: '#00F0FF',
                    fontWeight: 900,
                    fontSize: 12,
                    px: 0.6,
                    height: 28,
                    borderRadius: '20px',
                    border: '1.5px solid rgba(0, 240, 255, 0.5)',
                    boxShadow: '0 0 16px rgba(0, 240, 255, 0.25)',
                  }}
                />
              </Box>

              {/* Glowing Cyan Divider Line */}
              <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
                <Box
                  sx={{
                    height: '2px',
                    width: '100%',
                    borderRadius: '2px',
                    background:
                      'linear-gradient(90deg, transparent, #00F0FF 20%, #38BDF8 50%, #00F0FF 80%, transparent)',
                    boxShadow: '0 0 10px #00F0FF, 0 0 20px rgba(0, 240, 255, 0.5)',
                  }}
                />
              </Box>

              {/* Tactical Quick Filters & Stream Telemetry Bar */}
              <Box
                sx={{
                  px: 2,
                  pb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  bgcolor: 'rgba(9, 15, 28, 0.98)',
                  flexShrink: 0,
                }}
              >
                {/* Fast Filter Pills With Dynamic Counts */}
                <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                  {[
                    { id: 'ALL' as const, labelAr: `الكل (${panelCounts.all})`, labelEn: `All (${panelCounts.all})` },
                    { id: 'Entry' as const, labelAr: `🟢 حركة دخول (${panelCounts.entry})`, labelEn: `🟢 Entry (${panelCounts.entry})` },
                    { id: 'Exit' as const, labelAr: `🔵 حركة خروج (${panelCounts.exit})`, labelEn: `🔵 Exit (${panelCounts.exit})` },
                    { id: 'VIP' as const, labelAr: `⭐ تصاريح VIP (${panelCounts.vip})`, labelEn: `⭐ VIP (${panelCounts.vip})` },
                  ].map((filterTab) => {
                    const isSelected = panelFilter === filterTab.id;
                    return (
                      <Chip
                        key={filterTab.id}
                        label={isRtl ? filterTab.labelAr : filterTab.labelEn}
                        size="small"
                        onClick={() => setPanelFilter(filterTab.id)}
                        sx={{
                          height: 25,
                          fontSize: 11,
                          fontWeight: isSelected ? 900 : 700,
                          cursor: 'pointer',
                          bgcolor: isSelected
                            ? filterTab.id === 'Exit'
                              ? 'rgba(56, 189, 248, 0.3)'
                              : filterTab.id === 'Entry'
                              ? 'rgba(16, 185, 129, 0.3)'
                              : filterTab.id === 'VIP'
                              ? 'rgba(167, 139, 250, 0.3)'
                              : 'rgba(0, 240, 255, 0.25)'
                            : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected
                            ? filterTab.id === 'Exit'
                              ? '#38BDF8'
                              : filterTab.id === 'Entry'
                              ? '#10B981'
                              : filterTab.id === 'VIP'
                              ? '#C4B5FD'
                              : '#00F0FF'
                            : '#94A3B8',
                          border: isSelected
                            ? `1.5px solid ${
                                filterTab.id === 'Exit'
                                  ? '#38BDF8'
                                  : filterTab.id === 'Entry'
                                  ? '#10B981'
                                  : filterTab.id === 'VIP'
                                  ? '#A78BFA'
                                  : '#00F0FF'
                              }`
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: isSelected ? '0 0 12px rgba(0, 240, 255, 0.35)' : 'none',
                          transition: 'all 180ms ease',
                          '&:hover': {
                            bgcolor: 'rgba(0, 240, 255, 0.15)',
                            color: '#F8FAFC',
                          },
                        }}
                      />
                    );
                  })}
                </Stack>

                {/* Telemetry Micro Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Typography variant="caption" sx={{ color: '#10B981', fontSize: 10, fontWeight: 800 }}>
                    ⚡ {isRtl ? 'المعالجة:' : 'Speed:'} &lt;9ms
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)' }}>•</Typography>
                  <Typography variant="caption" sx={{ color: '#00F0FF', fontSize: 10, fontWeight: 800 }}>
                    🎯 {isRtl ? 'الدقة:' : 'Accuracy:'} 99.8%
                  </Typography>
                </Box>
              </Box>

              {/* Scrollable Stream List of Side-by-Side Divided Capture Cards */}
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: 1.5,
                  flex: '1 1 0px',
                  minHeight: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  '&::-webkit-scrollbar': {
                    width: '7px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(0, 240, 255, 0.45)',
                    borderRadius: '4px',
                    '&:hover': {
                      bgcolor: '#00F0FF',
                    },
                  },
                }}
              >
                {/* Empty State when current filter has no records */}
                {panelFilteredCaptures.length === 0 && (
                  <Box
                    sx={{
                      py: 8,
                      px: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      bgcolor: 'rgba(15, 23, 42, 0.45)',
                      borderRadius: '18px',
                      border: '1.5px dashed rgba(0, 240, 255, 0.3)',
                      m: 2,
                    }}
                  >
                    <DirectionsCarIcon sx={{ fontSize: 52, color: 'rgba(0, 240, 255, 0.4)', mb: 1.5 }} />
                    <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#F8FAFC', mb: 0.5 }}>
                      {isRtl ? 'لا توجد التقاطات متوفرة في هذا الفلتر حالياً' : 'No captures found in this filter'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', maxWidth: 320, lineHeight: 1.5 }}>
                      {isRtl
                        ? 'لم يتم تسجيل حركة تطابق الفلتر المحدد، يمكنك اختيار "الكل" أو التبديل بين الكاميرات بالأعلى لتسجيل حركة جديدة.'
                        : 'No records match the active filter. Select "All" or toggle cameras above to record a new vehicle.'}
                    </Typography>
                  </Box>
                )}

                {/* Real-Time Capture Cards with Guaranteed Anti-Collapse Layout */}
                {panelFilteredCaptures.slice(0, 30).map((cap) => (
                  <Card
                    key={cap.id}
                    onClick={() => setInspectedCapture(cap)}
                    sx={{
                      flexShrink: 0, // ROOT CAUSE FIX: Guarantees card never collapses regardless of item count
                      width: '100%',
                      boxSizing: 'border-box',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      background: cap.isNew
                        ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.16), rgba(13, 22, 41, 0.98))'
                        : 'linear-gradient(145deg, rgba(14, 23, 42, 0.96), rgba(8, 14, 27, 0.98))',
                      border: `1.5px solid ${
                        cap.isNew
                          ? '#00F0FF'
                          : cap.status === 'VIP'
                          ? 'rgba(167, 139, 250, 0.5)'
                          : cap.direction === 'Exit'
                          ? 'rgba(56, 189, 248, 0.42)'
                          : 'rgba(16, 185, 129, 0.38)'
                      }`,
                      animation: cap.isNew ? 'newArrivalPulse 1.4s ease-out' : 'none',
                      transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: cap.isNew
                        ? '0 0 28px rgba(0, 240, 255, 0.45), inset 0 0 12px rgba(0, 240, 255, 0.15)'
                        : cap.direction === 'Exit'
                        ? '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(56, 189, 248, 0.12)'
                        : '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(16, 185, 129, 0.12)',
                      '&:hover': {
                        borderColor: '#00F0FF',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 32px rgba(0, 240, 255, 0.35)',
                      },
                    }}
                  >
                    {/* Top Cybernetic Accent Indicator Line per card */}
                    <Box
                      sx={{
                        height: '2.5px',
                        width: '100%',
                        flexShrink: 0,
                        background:
                          cap.status === 'VIP'
                            ? 'linear-gradient(90deg, #A78BFA, #C084FC)'
                            : cap.direction === 'Entry'
                            ? 'linear-gradient(90deg, #10B981, #00F0FF)'
                            : 'linear-gradient(90deg, #38BDF8, #818CF8)',
                      }}
                    />

                    {/* Top Header Row of Capture Card: Clean Single-Line */}
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.8,
                        bgcolor: 'rgba(15, 23, 42, 0.98)',
                        borderBottom: '1px solid rgba(0, 240, 255, 0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      <Stack direction="row" spacing={0.6} alignItems="center" sx={{ flexWrap: 'nowrap', overflow: 'hidden' }}>
                        {/* Direction Badge */}
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            px: 1,
                            py: 0.3,
                            borderRadius: '6px',
                            fontSize: 10.5,
                            fontWeight: 900,
                            bgcolor:
                              cap.direction === 'Entry'
                                ? 'rgba(16, 185, 129, 0.22)'
                                : 'rgba(56, 189, 248, 0.22)',
                            color: cap.direction === 'Entry' ? '#10B981' : '#38BDF8',
                            border: `1px solid ${
                              cap.direction === 'Entry' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(56, 189, 248, 0.5)'
                            }`,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          {cap.direction === 'Entry' ? (
                            <ArrowDownwardIcon sx={{ fontSize: '13px !important' }} />
                          ) : (
                            <ArrowUpwardIcon sx={{ fontSize: '13px !important' }} />
                          )}
                          {cap.direction === 'Entry'
                            ? isRtl
                              ? 'حركة دخول'
                              : 'Entry'
                            : isRtl
                            ? 'حركة خروج'
                            : 'Exit'}
                        </Box>

                        {/* Speed Badge */}
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.3,
                            px: 0.8,
                            py: 0.25,
                            borderRadius: '6px',
                            fontSize: 10,
                            fontWeight: 800,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: '#CBD5E1',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          <SpeedIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                          {isRtl ? cap.speedAr : cap.speedEn}
                        </Box>

                        {/* Authorization Status Badge */}
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.3,
                            px: 0.8,
                            py: 0.25,
                            borderRadius: '6px',
                            fontSize: 10,
                            fontWeight: 900,
                            bgcolor:
                              cap.status === 'VIP'
                                ? 'rgba(167, 139, 250, 0.22)'
                                : cap.status === 'EV'
                                ? 'rgba(0, 240, 255, 0.2)'
                                : cap.status === 'Authorized'
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(234, 179, 8, 0.2)',
                            color:
                              cap.status === 'VIP'
                                ? '#C4B5FD'
                                : cap.status === 'EV'
                                ? '#00F0FF'
                                : cap.status === 'Authorized'
                                ? '#6EE7B7'
                                : '#FDE047',
                            border: `1px solid ${
                              cap.status === 'VIP'
                                ? 'rgba(167, 139, 250, 0.5)'
                                : cap.status === 'EV'
                                ? 'rgba(0, 240, 255, 0.5)'
                                : cap.status === 'Authorized'
                                ? 'rgba(16, 185, 129, 0.5)'
                                : 'rgba(234, 179, 8, 0.5)'
                            }`,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          {cap.status === 'VIP' && <StarIcon sx={{ fontSize: 11 }} />}
                          {cap.status === 'VIP'
                            ? isRtl
                              ? 'VIP رئاسي'
                              : 'VIP'
                            : cap.status === 'Authorized'
                            ? isRtl
                              ? 'اشتراك مصرح'
                              : 'Pass'
                            : cap.status === 'EV'
                            ? isRtl
                              ? 'شحن EV'
                              : 'EV'
                            : isRtl
                            ? 'زائر مؤكد'
                            : 'Guest'}
                        </Box>

                        {cap.isNew && (
                          <Box
                            sx={{
                              px: 0.7,
                              py: 0.2,
                              borderRadius: '4px',
                              fontSize: 9.5,
                              fontWeight: 900,
                              bgcolor: '#00F0FF',
                              color: '#000',
                              boxShadow: '0 0 10px #00F0FF',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            {isRtl ? '⚡ فوري' : '⚡ LIVE'}
                          </Box>
                        )}
                      </Stack>

                      {/* Precise Capture Timestamp */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(0, 240, 255, 0.08)',
                          px: 0.9,
                          py: 0.25,
                          borderRadius: '6px',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 13, color: '#00F0FF' }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#00F0FF',
                            fontFamily: 'monospace',
                            fontWeight: 900,
                            fontSize: 11.5,
                          }}
                        >
                          {cap.eventTime}
                        </Typography>
                      </Box>
                    </Box>

                    {/* DIVIDED PANEL BODY: Side-by-Side */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'stretch',
                      }}
                    >
                      {/* Side A: Extracted Saudi Plate & 4K CCTV Snapshot */}
                      <Box
                        sx={{
                          width: { xs: '100%', sm: 175 },
                          minWidth: { xs: '100%', sm: 175 },
                          maxWidth: { sm: 180 },
                          flexShrink: 0,
                          p: 1.2,
                          bgcolor: 'rgba(4, 9, 20, 0.75)',
                          borderRight: isRtl ? 'none' : { sm: '1.5px solid rgba(0, 240, 255, 0.16)' },
                          borderLeft: isRtl ? { sm: '1.5px solid rgba(0, 240, 255, 0.16)' } : 'none',
                          borderBottom: { xs: '1.5px solid rgba(0, 240, 255, 0.16)', sm: 'none' },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.2,
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        {/* Saudi Realistic Plate Bay */}
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedCapture(cap);
                          }}
                          sx={{
                            width: '100%',
                            p: 0.8,
                            bgcolor: '#030712',
                            borderRadius: '10px',
                            border: '1.5px solid rgba(0, 240, 255, 0.45)',
                            boxShadow:
                              'inset 0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0, 240, 255, 0.18)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 200ms ease',
                            '&:hover': {
                              borderColor: '#00F0FF',
                              transform: 'scale(1.02)',
                              boxShadow: '0 0 18px rgba(0, 240, 255, 0.4)',
                            },
                          }}
                          title={
                            isRtl
                              ? 'انقر لفتح بطاقة اللوحة وتفاصيل المركبة والوقت'
                              : 'Click to open plate, vehicle dossier & time'
                          }
                        >
                          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <SaudiRealisticPlate
                              plateNumber={cap.plateNumber}
                              size="sm"
                              showBolts={true}
                              interactive={false}
                            />
                          </Box>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                              width: '100%',
                              mt: 0.6,
                              px: 0.6,
                              py: 0.25,
                              bgcolor: 'rgba(0, 240, 255, 0.08)',
                              borderRadius: '4px',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <ZoomInIcon sx={{ fontSize: 12, color: '#00F0FF' }} />
                              <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#00F0FF' }}>
                                {isRtl ? 'فحص اللوحة' : 'Inspect'}
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: 9.5, fontWeight: 900, color: '#10B981', fontFamily: 'monospace' }}>
                              {(cap.confidence * 100).toFixed(1)}%
                            </Typography>
                          </Stack>
                        </Box>

                        {/* 4K CCTV Snapshot Thumbnail Preview */}
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: 92,
                            minHeight: 92,
                            maxHeight: 92,
                            flexShrink: 0,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1.5px solid rgba(56, 189, 248, 0.4)',
                            bgcolor: '#000',
                            cursor: 'pointer',
                            transition: 'all 200ms ease',
                            '&:hover': {
                              borderColor: '#00F0FF',
                              boxShadow: '0 0 14px rgba(0, 240, 255, 0.45)',
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedCapture(cap);
                          }}
                          title={isRtl ? 'انقر لعرض لقطة الكاميرا' : 'Click to view snapshot'}
                        >
                          <Box
                            component="img"
                            src={cap.imageUrl}
                            alt="CCTV Crop"
                            onError={(e: any) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                cap.direction === 'Exit'
                                  ? '/images/cctv_cam3_mercedes_exit.jpg'
                                  : '/images/cctv_cam1_landcruiser.jpg';
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              transition: 'transform 260ms ease',
                              '&:hover': { transform: 'scale(1.08)' },
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 4,
                              right: isRtl ? 4 : 'auto',
                              left: isRtl ? 'auto' : 4,
                              px: 0.6,
                              py: 0.15,
                              bgcolor: 'rgba(0, 0, 0, 0.85)',
                              borderRadius: '3px',
                              fontSize: 9,
                              fontWeight: 900,
                              color: '#00F0FF',
                              fontFamily: 'monospace',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                            }}
                          >
                            4K CCTV
                          </Box>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              left: isRtl ? 4 : 'auto',
                              right: isRtl ? 'auto' : 4,
                              px: 0.6,
                              py: 0.15,
                              bgcolor: 'rgba(15, 23, 42, 0.9)',
                              borderRadius: '3px',
                              fontSize: 8.5,
                              fontWeight: 800,
                              color: '#94A3B8',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                            }}
                          >
                            {cap.cameraCode}
                          </Box>
                        </Box>
                      </Box>

                      {/* Side B: All Car Details Beside Plate */}
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          p: 1.4,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        {/* Vehicle Make, Model & Category Title */}
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={0.8}>
                            <DirectionsCarIcon sx={{ fontSize: 18, color: '#00F0FF', flexShrink: 0 }} />
                            <Typography
                              variant="subtitle2"
                              fontWeight={900}
                              sx={{
                                color: '#FFFFFF',
                                fontSize: 14.5,
                                lineHeight: 1.3,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={`${isRtl ? cap.vehicleMakeAr : cap.vehicleMakeEn} ${isRtl ? cap.vehicleModelAr : cap.vehicleModelEn}`}
                            >
                              {isRtl ? cap.vehicleMakeAr : cap.vehicleMakeEn}{' '}
                              {isRtl ? cap.vehicleModelAr : cap.vehicleModelEn}
                            </Typography>
                          </Stack>

                          {/* Country & Category */}
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#38BDF8',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.4,
                              mt: 0.4,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            🇸🇦 {isRtl ? cap.countryAr : cap.countryEn} ({cap.countryCode}) •{' '}
                            {isRtl ? cap.classificationAr : cap.classificationEn}
                          </Typography>
                        </Box>

                        {/* Full Legibility Telemetry Specs List */}
                        <Stack
                          spacing={0.6}
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            p: 1.1,
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                          }}
                        >
                          {/* Row 1: Vehicle Color */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {isRtl ? 'لون المركبة:' : 'Color:'}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.6}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: cap.vehicleColorHex,
                                  border: '1.5px solid rgba(255, 255, 255, 0.9)',
                                  boxShadow: `0 0 6px ${cap.vehicleColorHex}`,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography variant="caption" sx={{ color: '#F8FAFC', fontWeight: 800, fontSize: 11 }}>
                                {isRtl ? cap.vehicleColorAr : cap.vehicleColorEn}
                              </Typography>
                            </Stack>
                          </Box>

                          {/* Row 2: Gate & Lane */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {isRtl ? 'بوابة الرصد:' : 'Gate:'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#CBD5E1',
                                fontWeight: 800,
                                fontSize: 11,
                                textAlign: isRtl ? 'left' : 'right',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                flex: 1,
                              }}
                              title={isRtl ? cap.gateNameAr : cap.gateNameEn}
                            >
                              {isRtl ? cap.gateNameAr : cap.gateNameEn}
                            </Typography>
                          </Box>

                          {/* Row 3: Authorization Pass Status */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {isRtl ? 'حالة التصريح:' : 'Status:'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color:
                                  cap.status === 'VIP'
                                    ? '#C4B5FD'
                                    : cap.status === 'EV'
                                    ? '#00F0FF'
                                    : cap.status === 'Authorized'
                                    ? '#6EE7B7'
                                    : '#FDE047',
                                fontWeight: 900,
                                fontSize: 11,
                              }}
                            >
                              {isRtl ? cap.statusLabelAr : cap.statusLabelEn}
                            </Typography>
                          </Box>

                          {/* Row 4: Capture Date & Time */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {isRtl ? 'تاريخ وتوقيت:' : 'Date & Time:'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, fontSize: 10.5 }}>
                              {cap.eventTime} • {isRtl ? cap.captureDateAr : cap.captureDateEn}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* OCR Accuracy Progress Bar */}
                        <Box sx={{ pt: 0.2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.3 }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 10, fontWeight: 700 }}>
                              {isRtl ? 'دقة الذكاء الاصطناعي AI OCR' : 'AI OCR Accuracy'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 900, fontSize: 10.5 }}>
                              {(cap.confidence * 100).toFixed(1)}%
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              width: '100%',
                              height: 5,
                              bgcolor: 'rgba(255,255,255,0.08)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${cap.confidence * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10B981, #00F0FF)',
                                boxShadow: '0 0 6px #00F0FF',
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Bottom Action Footer Bar: Inspect Dossier + Forensic Playback + Copy Plate */}
                    <Box
                      sx={{
                        p: 1,
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        borderTop: '1px solid rgba(0, 240, 255, 0.15)',
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedCapture(cap);
                        }}
                        startIcon={<ZoomInIcon sx={{ fontSize: '18px !important' }} />}
                        sx={{
                          background:
                            'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(56, 189, 248, 0.15))',
                          border: '1.5px solid rgba(0, 240, 255, 0.5)',
                          color: '#00F0FF',
                          fontWeight: 900,
                          fontSize: 11.5,
                          borderRadius: '10px',
                          py: 0.7,
                          boxShadow: '0 0 14px rgba(0, 240, 255, 0.2)',
                          transition: 'all 200ms ease',
                          '&:hover': {
                            background:
                              'linear-gradient(135deg, rgba(0, 240, 255, 0.45), rgba(56, 189, 248, 0.3))',
                            borderColor: '#00F0FF',
                            boxShadow: '0 0 24px rgba(0, 240, 255, 0.45)',
                            transform: 'scale(1.01)',
                          },
                        }}
                      >
                        {isRtl
                          ? 'عرض بطاقة اللوحة وتفاصيل المركبة والوقت'
                          : 'Inspect Plate, Vehicle Dossier & Time'}
                      </Button>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPlayback(cap);
                        }}
                        title={
                          isRtl
                            ? 'استوديو التحري بالفيديو (CCTV Playback)'
                            : 'Forensic Video Playback'
                        }
                        sx={{
                          border: '1.5px solid rgba(56, 189, 248, 0.4)',
                          color: '#38BDF8',
                          borderRadius: '10px',
                          p: 0.85,
                          bgcolor: 'rgba(56, 189, 248, 0.08)',
                          transition: 'all 200ms ease',
                          '&:hover': {
                            bgcolor: 'rgba(56, 189, 248, 0.25)',
                            borderColor: '#38BDF8',
                            boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <VideocamIcon sx={{ fontSize: 18 }} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPlate(cap.plateNumber);
                        }}
                        title={isRtl ? 'نسخ رقم اللوحة' : 'Copy Plate Number'}
                        sx={{
                          border: '1.5px solid rgba(16, 185, 129, 0.4)',
                          color: '#10B981',
                          borderRadius: '10px',
                          p: 0.85,
                          bgcolor: 'rgba(16, 185, 129, 0.08)',
                          transition: 'all 200ms ease',
                          '&:hover': {
                            bgcolor: 'rgba(16, 185, 129, 0.25)',
                            borderColor: '#10B981',
                            boxShadow: '0 0 14px rgba(16, 185, 129, 0.4)',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>

              {/* Bottom Quick Switcher to Full Investigation Grid - Exact Style As In User's Screenshot */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(12, 19, 35, 0.98)',
                  borderTop: '1px solid rgba(0, 240, 255, 0.25)',
                  position: 'relative',
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setActiveTab('SEARCH_GRID')}
                  startIcon={<SearchIcon sx={{ fontSize: '22px !important' }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #00F0FF 0%, #10B981 100%)',
                    color: '#06201b',
                    fontWeight: 900,
                    fontSize: 14,
                    letterSpacing: 0.3,
                    borderRadius: '16px',
                    py: 1.4,
                    boxShadow: '0 6px 24px rgba(0, 240, 255, 0.45)',
                    transition: 'all 220ms ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #10B981 0%, #00F0FF 100%)',
                      boxShadow: '0 8px 32px rgba(0, 240, 255, 0.65)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {isRtl
                    ? 'الانتقال إلى شبكة البحث المتقدم والتحري (Archive Grid)'
                    : 'Switch to Advanced Investigation Grid'}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: ADVANCED SEARCH & INVESTIGATION GRID (أرشيف التحري والبحث المتقدم) */}
      {/* ========================================================================= */}
      {activeTab === 'SEARCH_GRID' && (
        <Stack spacing={3}>
          {/* Advanced Multi-Filter Control Console */}
          <Card
            sx={{
              p: 3,
              borderRadius: '20px',
              bgcolor: 'rgba(11, 18, 32, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Stack spacing={2.5}>
              {/* Row 1: Search Header & Mode Controls */}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <FilterListIcon sx={{ color: '#00F0FF' }} />
                    <Typography variant="h6" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                      {isRtl
                        ? 'مركز التحري والبحث المتقدم للوحات المستقطعة (LPR Investigation Grid)'
                        : 'LPR Advanced Investigation & Forensic Archive Grid'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {isRtl
                      ? 'استعلام وفلترة شاملة لكافة المركبات الملتقطة بناءً على مواصفات السيارة، اللوحات، الألوان، والبوابات'
                      : 'Comprehensive multi-parameter querying across all captured vehicles, license plates, colors, and gate channels'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetFilters}
                    startIcon={<RefreshIcon />}
                    sx={{
                      color: '#EF4444',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      borderRadius: '10px',
                      fontWeight: 800,
                    }}
                  >
                    {isRtl ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                  </Button>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 0.5, borderRadius: '10px' }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('GRID')}
                      sx={{
                        color: viewMode === 'GRID' ? '#00F0FF' : 'text.secondary',
                        bgcolor: viewMode === 'GRID' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      }}
                    >
                      <GridViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode('TABLE')}
                      sx={{
                        color: viewMode === 'TABLE' ? '#00F0FF' : 'text.secondary',
                        bgcolor: viewMode === 'TABLE' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      }}
                    >
                      <ViewListIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Stack>

              {/* Row 2: Filter Inputs */}
              <Grid container spacing={2}>
                {/* Free Text Search */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={
                      isRtl
                        ? 'ابحث برقم اللوحة، الماركة، أو الموديل...'
                        : 'Search plate, make, or model...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#00F0FF', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        borderRadius: '10px',
                        borderColor: 'rgba(56, 189, 248, 0.3)',
                      },
                    }}
                  />
                </Grid>

                {/* Color Combobox with Swatches */}
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    size="small"
                    options={COLOR_FILTER_OPTIONS}
                    getOptionLabel={(option) =>
                      typeof option === 'string' ? option : isRtl ? option.labelAr : option.labelEn
                    }
                    value={COLOR_FILTER_OPTIONS.find((c) => c.id === selectedColor) || COLOR_FILTER_OPTIONS[0]}
                    onChange={(_, newVal) => {
                      setSelectedColor(newVal ? newVal.id : 'ALL');
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                        {option.id !== 'ALL' ? (
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              bgcolor: option.colorHex,
                              border: '1.5px solid rgba(255, 255, 255, 0.6)',
                              boxShadow: '0 0 6px rgba(0,0,0,0.5)',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <PaletteIcon sx={{ fontSize: 16, color: '#00F0FF', flexShrink: 0 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#F8FAFC', fontSize: 12 }}>
                          {isRtl ? option.labelAr : option.labelEn}
                        </Typography>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={isRtl ? 'درجة اللون' : 'Color Swatch'}
                        placeholder={isRtl ? 'أبيض، أسود، فضي، كحلي...' : 'White, Black, Silver...'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(15, 23, 42, 0.85)',
                            borderRadius: '10px',
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Plate Letters */}
                <Grid item xs={6} sm={3} md={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label={isRtl ? 'حروف اللوحة' : 'Plate Letters'}
                    placeholder={isRtl ? 'مثال: أ ب ج' : 'e.g. JBA'}
                    value={selectedLetters}
                    onChange={(e) => setSelectedLetters(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                {/* Plate Digits */}
                <Grid item xs={6} sm={3} md={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label={isRtl ? 'أرقام اللوحة' : 'Plate Digits'}
                    placeholder={isRtl ? 'مثال: 1004' : 'e.g. 1004'}
                    value={selectedDigits}
                    onChange={(e) => setSelectedDigits(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                {/* Vehicle Make Filter */}
                <Grid item xs={6} sm={3} md={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'text.secondary' }}>{isRtl ? 'الشركة' : 'Make'}</InputLabel>
                    <Select
                      value={selectedMake}
                      label={isRtl ? 'الشركة' : 'Make'}
                      onChange={(e) => setSelectedMake(e.target.value)}
                      sx={{
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        borderRadius: '10px',
                      }}
                    >
                      <MenuItem value="ALL">{isRtl ? 'كافة الشركات' : 'All Makes'}</MenuItem>
                      {availableMakes
                        .filter((m) => m !== 'ALL')
                        .map((m) => (
                          <MenuItem key={m} value={m}>
                            {m}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Gate & Lane Filter */}
                <Grid item xs={6} sm={3} md={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'text.secondary' }}>{isRtl ? 'البوابة' : 'Gate'}</InputLabel>
                    <Select
                      value={selectedGate}
                      label={isRtl ? 'البوابة' : 'Gate'}
                      onChange={(e) => setSelectedGate(e.target.value)}
                      sx={{
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        borderRadius: '10px',
                      }}
                    >
                      {GATE_OPTIONS.map((g) => (
                        <MenuItem key={g.id} value={g.id}>
                          {isRtl ? g.labelAr : g.labelEn}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Row 3: Quick Color Swatches Bar */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" sx={{ gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                    <PaletteIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5, color: '#38BDF8' }} />
                    {isRtl ? 'عينات الألوان السريعة:' : 'Quick Color Swatches:'}
                  </Typography>

                  {COLOR_FILTER_OPTIONS.slice(0, 10).map((c) => {
                    const isSelected = selectedColor === c.id;
                    return (
                      <Chip
                        key={c.id}
                        label={
                          <Stack direction="row" alignItems="center" spacing={0.8}>
                            {c.id !== 'ALL' && (
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: c.colorHex,
                                  border: '1px solid rgba(255, 255, 255, 0.5)',
                                }}
                              />
                            )}
                            <span>{isRtl ? c.labelAr : c.labelEn}</span>
                          </Stack>
                        }
                        size="small"
                        onClick={() => setSelectedColor(c.id)}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 800,
                          bgcolor: isSelected ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#00F0FF' : 'text.secondary',
                          border: `1px solid ${isSelected ? '#00F0FF' : 'rgba(255, 255, 255, 0.12)'}`,
                          '&:hover': {
                            bgcolor: 'rgba(0, 240, 255, 0.15)',
                          },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </Card>

          {/* Results Summary Ribbon */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#F8FAFC' }}>
              {isRtl ? (
                <>
                  نتائج التحري: تم العثور على{' '}
                  <span style={{ color: '#00F0FF' }}>{filteredCaptures.length}</span> مركبة مطابقة للمعايير
                </>
              ) : (
                <>
                  Investigation Results: Found{' '}
                  <span style={{ color: '#00F0FF' }}>{filteredCaptures.length}</span> matching records
                </>
              )}
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {isRtl
                ? 'مرتبة حسب الأحدث زمناً • قاعدة بيانات التحري اللحظية'
                : 'Sorted by newest first • Real-time forensic database'}
            </Typography>
          </Stack>

          {/* VIEW MODE 1: VISUAL CARDS GRID */}
          {viewMode === 'GRID' && (
            <Grid container spacing={3}>
              {filteredCaptures.map((cap) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={cap.id}>
                  <Card
                    sx={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1.5px solid rgba(56, 189, 248, 0.3)',
                      boxShadow: '0 10px 32px rgba(0, 0, 0, 0.6)',
                      transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        borderColor: '#00F0FF',
                        transform: 'translateY(-5px)',
                        boxShadow: '0 16px 40px rgba(0, 240, 255, 0.3)',
                      },
                    }}
                  >
                    {/* Real 4K CCTV Photo Snapshot Banner */}
                    <Box
                      sx={{
                        height: 190,
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: '#030712',
                      }}
                    >
                      <Box
                        component="img"
                        src={cap.imageUrl}
                        alt={isRtl ? cap.vehicleModelAr : cap.vehicleModelEn}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'brightness(0.95)',
                          transition: 'transform 300ms ease',
                          '&:hover': {
                            transform: 'scale(1.04)',
                          },
                        }}
                      />

                      {/* Direction Chip Badge */}
                      <Box sx={{ position: 'absolute', top: 10, left: isRtl ? 'auto' : 10, right: isRtl ? 10 : 'auto' }}>
                        <Chip
                          icon={
                            cap.direction === 'Entry' ? (
                              <ArrowDownwardIcon sx={{ fontSize: '13px !important', color: '#000 !important' }} />
                            ) : (
                              <ArrowUpwardIcon sx={{ fontSize: '13px !important', color: '#000 !important' }} />
                            )
                          }
                          label={
                            cap.direction === 'Entry'
                              ? isRtl
                                ? 'حركة دخول'
                                : 'Entry Flow'
                              : isRtl
                              ? 'حركة خروج'
                              : 'Exit Flow'
                          }
                          size="small"
                          sx={{
                            fontWeight: 900,
                            height: 24,
                            fontSize: 11,
                            bgcolor: cap.direction === 'Entry' ? '#10B981' : '#38BDF8',
                            color: '#000',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          }}
                        />
                      </Box>

                      {/* Event Timestamp Overlay */}
                      <Box sx={{ position: 'absolute', top: 10, left: isRtl ? 10 : 'auto', right: isRtl ? 'auto' : 10 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.8)',
                            color: '#00F0FF',
                            px: 1.2,
                            py: 0.35,
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: 800,
                            border: '1px solid rgba(0, 240, 255, 0.35)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                          }}
                        >
                          {cap.eventTime}
                        </Typography>
                      </Box>

                      {/* Camera Code Overlay */}
                      <Box sx={{ position: 'absolute', bottom: 8, left: isRtl ? 10 : 'auto', right: isRtl ? 'auto' : 10 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.75)',
                            color: '#F8FAFC',
                            px: 1,
                            py: 0.25,
                            borderRadius: '5px',
                            fontSize: 10,
                            fontWeight: 700,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                          }}
                        >
                          {cap.cameraCode}
                        </Typography>
                      </Box>

                      {/* Verified Badge */}
                      <Box sx={{ position: 'absolute', bottom: 8, left: isRtl ? 'auto' : 10, right: isRtl ? 10 : 'auto' }}>
                        <Chip
                          label="CCTV 4K VERIFIED"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 9,
                            fontWeight: 900,
                            bgcolor: 'rgba(16, 185, 129, 0.25)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.5)',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Card Content Section */}
                    <Box sx={{ p: 2.2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Stack spacing={1.75} sx={{ flexGrow: 1 }}>
                        {/* High-Contrast Recessed Plate Bay */}
                        <Box
                          sx={{
                            p: 1.25,
                            bgcolor: '#030712',
                            borderRadius: '14px',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.85), 0 2px 10px rgba(0, 240, 255, 0.08)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <SaudiRealisticPlate
                            plateNumber={cap.plateNumber}
                            size="md"
                            showBolts={true}
                            interactive={true}
                            vehicleMake={isRtl ? cap.vehicleMakeAr : cap.vehicleMakeEn}
                            vehicleModel={isRtl ? cap.vehicleModelAr : cap.vehicleModelEn}
                            vehicleColor={isRtl ? cap.vehicleColorAr : cap.vehicleColorEn}
                            gateName={isRtl ? cap.gateNameAr : cap.gateNameEn}
                            captureTime={cap.eventTime}
                            snapshotUrl={cap.imageUrl}
                          />
                        </Box>

                        {/* Vehicle Make, Model & Color */}
                        <Box>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  bgcolor: cap.vehicleColorHex,
                                  border: '1.5px solid rgba(255, 255, 255, 0.6)',
                                  boxShadow: `0 0 10px ${cap.vehicleColorHex}`,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#F8FAFC', fontSize: 15 }}>
                                {isRtl ? cap.vehicleMakeAr : cap.vehicleMakeEn}{' '}
                                {isRtl ? cap.vehicleModelAr : cap.vehicleModelEn}
                              </Typography>
                            </Stack>

                            <Chip
                              label={isRtl ? cap.vehicleColorAr : cap.vehicleColorEn}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: 10.5,
                                fontWeight: 800,
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                color: '#CBD5E1',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                              }}
                            />
                          </Stack>

                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.8 }}>
                            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, fontSize: 11.5 }}>
                              {isRtl ? cap.gateNameAr : cap.gateNameEn}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: 11 }}>
                              {isRtl ? `السرعة: ${cap.speedAr}` : `Speed: ${cap.speedEn}`}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* AI Confidence & Status Badge */}
                        <Box sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5 }}>
                              {isRtl ? 'دقة المطابقة البصرية' : 'Optical Match Accuracy'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 900, fontSize: 11 }}>
                              {(cap.confidence * 100).toFixed(1)}%
                            </Typography>
                          </Stack>
                          <Box sx={{ width: '100%', height: 5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', mb: 1.25 }}>
                            <Box
                              sx={{
                                width: `${cap.confidence * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10B981, #00F0FF)',
                                boxShadow: '0 0 10px #00F0FF',
                              }}
                            />
                          </Box>

                          <Chip
                            label={isRtl ? cap.statusLabelAr : cap.statusLabelEn}
                            size="small"
                            sx={{
                              width: '100%',
                              fontWeight: 800,
                              fontSize: 11,
                              height: 25,
                              bgcolor:
                                cap.status === 'VIP'
                                  ? 'rgba(167, 139, 250, 0.2)'
                                  : cap.status === 'EV'
                                  ? 'rgba(0, 240, 255, 0.2)'
                                  : 'rgba(16, 185, 129, 0.18)',
                              color:
                                cap.status === 'VIP'
                                  ? '#A78BFA'
                                  : cap.status === 'EV'
                                  ? '#00F0FF'
                                  : '#10B981',
                              border: '1px solid currentColor',
                            }}
                          />
                        </Box>

                        {/* Primary Action Button: Watch Playback Video */}
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenPlayback(cap)}
                          startIcon={<PlayArrowIcon />}
                          sx={{
                            mt: 'auto',
                            bgcolor: 'linear-gradient(135deg, #00F0FF, #0284C7)',
                            color: '#00F0FF',
                            fontWeight: 900,
                            borderRadius: '11px',
                            py: 0.9,
                            fontSize: 12,
                            boxShadow: '0 4px 18px rgba(0, 240, 255, 0.35)',
                            '&:hover': {
                              bgcolor: '#00F0FF',
                              color: '#000',
                              boxShadow: '0 6px 24px rgba(0, 240, 255, 0.6)',
                            },
                          }}
                        >
                          {isRtl ? 'عرض فيديو البلاي باك وتوثيق اللحظة' : 'View CCTV Playback Footage'}
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* VIEW MODE 2: TABULAR INVESTIGATION DOSSIER */}
          {viewMode === 'TABLE' && (
            <Card
              sx={{
                borderRadius: '18px',
                bgcolor: 'rgba(11, 18, 32, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                overflow: 'hidden',
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 900, color: 'text.secondary', fontSize: 12 } }}>
                      <TableCell>{isRtl ? 'اللوحة المستقطعة' : 'Saudi Plate'}</TableCell>
                      <TableCell>{isRtl ? 'المركبة والموديل' : 'Make & Model'}</TableCell>
                      <TableCell>{isRtl ? 'لون المركبة' : 'Color'}</TableCell>
                      <TableCell>{isRtl ? 'الدولة' : 'Country'}</TableCell>
                      <TableCell>{isRtl ? 'البوابة والكاميرا' : 'Gate & Camera'}</TableCell>
                      <TableCell>{isRtl ? 'الاتجاه' : 'Direction'}</TableCell>
                      <TableCell>{isRtl ? 'توقيت الرصد' : 'Event Time'}</TableCell>
                      <TableCell>{isRtl ? 'حالة التصريح' : 'Authorization'}</TableCell>
                      <TableCell align="center">{isRtl ? 'تسجيل البلاي باك' : 'Playback'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCaptures.map((cap) => (
                      <TableRow key={cap.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'inline-block' }}>
                            <SaudiRealisticPlate plateNumber={cap.plateNumber} size="sm" showBolts={false} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>
                            {isRtl ? cap.vehicleMakeAr : cap.vehicleMakeEn}{' '}
                            {isRtl ? cap.vehicleModelAr : cap.vehicleModelEn}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: cap.vehicleColorHex,
                                border: '1px solid #FFF',
                              }}
                            />
                            <Typography variant="caption" fontWeight={700}>
                              {isRtl ? cap.vehicleColorAr : cap.vehicleColorEn}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontWeight={800} sx={{ color: '#38BDF8' }}>
                            🇸🇦 {isRtl ? cap.countryAr : cap.countryEn}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>
                            {isRtl ? cap.gateNameAr : cap.gateNameEn}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                            {cap.cameraCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              cap.direction === 'Entry'
                                ? isRtl
                                  ? 'دخول'
                                  : 'IN'
                                : isRtl
                                ? 'خروج'
                                : 'OUT'
                            }
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor:
                                cap.direction === 'Entry'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : 'rgba(56, 189, 248, 0.15)',
                              color: cap.direction === 'Entry' ? '#10B981' : '#38BDF8',
                              border: '1px solid currentColor',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontWeight={800} sx={{ fontFamily: 'monospace' }}>
                            {cap.eventTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isRtl ? cap.statusLabelAr : cap.statusLabelEn}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: 10,
                              bgcolor:
                                cap.status === 'VIP'
                                  ? 'rgba(167, 139, 250, 0.15)'
                                  : cap.status === 'EV'
                                  ? 'rgba(0, 240, 255, 0.15)'
                                  : 'rgba(16, 185, 129, 0.15)',
                              color:
                                cap.status === 'VIP'
                                  ? '#A78BFA'
                                  : cap.status === 'EV'
                                  ? '#00F0FF'
                                  : '#10B981',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenPlayback(cap)}
                            startIcon={<PlayArrowIcon />}
                            sx={{
                              borderColor: '#00F0FF',
                              color: '#00F0FF',
                              fontWeight: 800,
                              borderRadius: '8px',
                            }}
                          >
                            {isRtl ? 'عرض' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Stack>
      )}

      {/* ========================================================================= */}
      {/* CCTV VIDEO PLAYBACK STUDIO MODAL */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(playbackItem)}
        onClose={() => setPlaybackItem(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#030712',
            borderRadius: '20px',
            border: '1.5px solid rgba(0, 240, 255, 0.45)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.25)',
            overflow: 'hidden',
          },
        }}
      >
        {playbackItem && (
          <DialogContent sx={{ p: 0 }}>
            {/* Modal Header Bar */}
            <Box
              sx={{
                p: 2.2,
                bgcolor: 'rgba(15, 23, 42, 0.95)',
                borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <VideocamIcon sx={{ color: '#00F0FF' }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                    {isRtl
                      ? 'استوديو إعادة العرض الجنائي - توثيق لحظة استقطاع اللوحة (CCTV Forensic Studio)'
                      : 'CCTV Forensic Playback Studio - Real-Time Plate Capture Dossier'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {isRtl
                      ? `تسجيل الكاميرا: ${playbackItem.cameraCode} • البوابة: ${playbackItem.gateNameAr} • التوقيت: ${playbackItem.eventTime}`
                      : `Camera Feed: ${playbackItem.cameraCode} • Gate: ${playbackItem.gateNameEn} • Event Time: ${playbackItem.eventTime}`}
                  </Typography>
                </Box>
              </Stack>

              <IconButton onClick={() => setPlaybackItem(null)} sx={{ color: 'text.secondary' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Modal Content Grid */}
            <Grid container>
              {/* Left/Center Video Player Canvas */}
              <Grid item xs={12} md={8}>
                <Box sx={{ p: 2.5, bgcolor: '#020617' }}>
                  {/* Video Screen Viewport */}
                  <Box
                    sx={{
                      height: 380,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: '#000',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    {/* Vehicle CCTV Frame */}
                    <Box
                      component="img"
                      src={playbackItem.imageUrl}
                      alt="CCTV Playback"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter:
                          playbackVisionMode === 'IR'
                            ? 'grayscale(100%) brightness(1.2) contrast(1.4) sepia(20%) hue-rotate(90deg)'
                            : playbackVisionMode === 'EDGES'
                            ? 'invert(100%) contrast(200%)'
                            : 'none',
                      }}
                    />

                    {/* CCTV Overlay Info */}
                    <Box sx={{ position: 'absolute', top: 14, left: isRtl ? 'auto' : 16, right: isRtl ? 16 : 'auto' }}>
                      <Chip
                        label="PLAYBACK • REPLAY ARCHIVE"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(239, 68, 68, 0.85)',
                          color: '#FFF',
                          fontWeight: 900,
                          fontSize: 10,
                        }}
                      />
                    </Box>

                    <Box sx={{ position: 'absolute', top: 14, left: isRtl ? 16 : 'auto', right: isRtl ? 'auto' : 16 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: 'rgba(0, 0, 0, 0.75)',
                          color: '#00F0FF',
                          px: 1.2,
                          py: 0.3,
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                        }}
                      >
                        00:00:0{playbackTime.toFixed(2)} / 00:00:10.00
                      </Typography>
                    </Box>

                    {/* AI Bounding Box at Crop Moment */}
                    {showOcrOverlay && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '24%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          p: 1,
                          borderRadius: '10px',
                          bgcolor: 'rgba(3, 7, 18, 0.85)',
                          border: playbackTime >= 3.0 && playbackTime <= 4.2 ? '3px solid #00F0FF' : '2px dashed #38BDF8',
                          boxShadow: playbackTime >= 3.0 && playbackTime <= 4.2 ? '0 0 35px #00F0FF' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        {playbackTime >= 3.0 && playbackTime <= 4.2 && (
                          <Chip
                            label={isRtl ? 'لحظة استقطاع اللوحة (Crop Moment)' : 'Optical Crop Moment'}
                            size="small"
                            sx={{
                              height: 20,
                              bgcolor: '#00F0FF',
                              color: '#000',
                              fontWeight: 900,
                              fontSize: 9.5,
                            }}
                          />
                        )}
                        <SaudiRealisticPlate plateNumber={playbackItem.plateNumber} size="sm" showBolts={false} />
                      </Box>
                    )}
                  </Box>

                  {/* Player Controls Bar */}
                  <Box sx={{ mt: 2 }}>
                    {/* Scrub Timeline */}
                    <Slider
                      value={playbackTime}
                      min={0}
                      max={10}
                      step={0.1}
                      onChange={(_, val) => setPlaybackTime(val as number)}
                      sx={{
                        color: '#00F0FF',
                        '& .MuiSlider-thumb': {
                          boxShadow: '0 0 10px #00F0FF',
                        },
                      }}
                    />

                    {/* Keyframe labels */}
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: -0.5, mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                        {isRtl ? '00:00 اقتراب المركبة' : '00:00 Vehicle Approach'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#00F0FF', fontSize: 10, fontWeight: 800 }}>
                        {isRtl ? '00:03.4 لحظة الاستقطاع والتعرف' : '00:03.4 OCR Recognition'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#10B981', fontSize: 10, fontWeight: 800 }}>
                        {isRtl ? '00:06.0 فتح الحاجز التلقائي' : '00:06.0 Barrier Raised'}
                      </Typography>
                    </Stack>

                    {/* Play/Pause & Speed Buttons */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() => setPlaybackPlaying(!playbackPlaying)}
                          sx={{
                            bgcolor: '#00F0FF',
                            color: '#000',
                            '&:hover': { bgcolor: '#38BDF8' },
                          }}
                        >
                          {playbackPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>

                        <IconButton
                          onClick={() => setPlaybackTime(0)}
                          sx={{ color: '#38BDF8', bgcolor: 'rgba(56, 189, 248, 0.1)' }}
                        >
                          <ReplayIcon />
                        </IconButton>

                        <Button
                          size="small"
                          onClick={() => setPlaybackTime(3.4)}
                          startIcon={<CenterFocusStrongIcon />}
                          sx={{
                            color: '#00F0FF',
                            borderColor: 'rgba(0, 240, 255, 0.4)',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: 11,
                          }}
                          variant="outlined"
                        >
                          {isRtl ? 'القفز للحظة الاستقطاع' : 'Jump to Crop'}
                        </Button>
                      </Stack>

                      {/* Speed Controls */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        {[0.5, 1.0, 2.0].map((spd) => (
                          <Chip
                            key={spd}
                            label={`${spd}x`}
                            size="small"
                            onClick={() => setPlaybackSpeed(spd)}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 900,
                              bgcolor: playbackSpeed === spd ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                              color: playbackSpeed === spd ? '#00F0FF' : 'text.secondary',
                              border: `1px solid ${playbackSpeed === spd ? '#00F0FF' : 'transparent'}`,
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              </Grid>

              {/* Right Side: Forensic Telemetry & Vehicle Dossier */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: 'rgba(15, 23, 42, 0.95)',
                    height: '100%',
                    borderRight: isRtl ? 'none' : { md: '1px solid rgba(0, 240, 255, 0.2)' },
                    borderLeft: isRtl ? { md: '1px solid rgba(0, 240, 255, 0.2)' } : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                        {isRtl ? 'اللوحة المستقطعة المقروءة:' : 'Extracted Plate Image:'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 1.5, bgcolor: '#030712', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                        <SaudiRealisticPlate plateNumber={playbackItem.plateNumber} size="md" showBolts={true} />
                      </Box>
                    </Box>

                    {/* Metadata Specs List */}
                    <Stack spacing={1.2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {isRtl ? 'الشركة والموديل:' : 'Make & Model:'}
                        </Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                          {isRtl ? playbackItem.vehicleMakeAr : playbackItem.vehicleMakeEn}{' '}
                          {isRtl ? playbackItem.vehicleModelAr : playbackItem.vehicleModelEn}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {isRtl ? 'الدولة والترخيص:' : 'Country & Authority:'}
                        </Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: '#38BDF8' }}>
                          🇸🇦 {isRtl ? playbackItem.countryAr : playbackItem.countryEn} ({playbackItem.countryCode})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {isRtl ? 'لون المركبة المسجل:' : 'Registered Color:'}
                        </Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                          {isRtl ? playbackItem.vehicleColorAr : playbackItem.vehicleColorEn}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {isRtl ? 'دقة القراءة والتعرف:' : 'Recognition Accuracy:'}
                        </Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: '#10B981' }}>
                          {(playbackItem.confidence * 100).toFixed(1)}% ({isRtl ? 'مطابقة تامة' : 'Exact Match'})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {isRtl ? 'سرعة المركبة بالمسار:' : 'Transit Speed:'}
                        </Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: '#38BDF8' }}>
                          {isRtl ? playbackItem.speedAr : playbackItem.speedEn}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {isRtl ? 'حالة الحاجز الآلي:' : 'Barrier State:'}
                        </Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: '#10B981' }}>
                          {isRtl ? 'فُتح تلقائياً (استجابة 0.68 ثانية)' : 'Auto Opened (0.68s latency)'}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Vision Mode Selector */}
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                        {isRtl ? 'مرشحات الرؤية البصرية:' : 'Forensic Vision Filters:'}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {[
                          { id: 'RGB', labelAr: 'طبيعي RGB', labelEn: 'Normal RGB' },
                          { id: 'IR', labelAr: 'أشعة IR ليلية', labelEn: 'Night IR' },
                          { id: 'EDGES', labelAr: 'كشف الحواف', labelEn: 'Edges' },
                        ].map((m) => (
                          <Chip
                            key={m.id}
                            label={isRtl ? m.labelAr : m.labelEn}
                            size="small"
                            onClick={() => setPlaybackVisionMode(m.id as any)}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 800,
                              bgcolor: playbackVisionMode === m.id ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                              color: playbackVisionMode === m.id ? '#00F0FF' : 'text.secondary',
                              border: `1px solid ${playbackVisionMode === m.id ? '#00F0FF' : 'transparent'}`,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Export Options */}
                  <Stack spacing={1.2} sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{
                        bgcolor: '#00F0FF',
                        color: '#000',
                        fontWeight: 900,
                        borderRadius: '10px',
                        py: 0.9,
                      }}
                    >
                      {isRtl ? 'تصدير مقطع الرصد (MP4 Video)' : 'Export Surveillance Video (MP4)'}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<PrintIcon />}
                      sx={{
                        borderColor: 'rgba(56, 189, 248, 0.3)',
                        color: '#38BDF8',
                        fontWeight: 800,
                        borderRadius: '10px',
                      }}
                    >
                      {isRtl ? 'طباعة تقرير التحري والاستقطاع (PDF)' : 'Print Forensic Report (PDF)'}
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        )}
      </Dialog>

      {/* ============================================================== */}
      {/* 3. MASTER INSPECTED CAPTURE & VEHICLE DOSSIER CARD DIALOG     */}
      {/*    (كارت فحص وتوثيق شامل للوحة وصورها وبيانات المركبة والوقت) */}
      {/* ============================================================== */}
      <Dialog
        open={Boolean(inspectedCapture)}
        onClose={() => setInspectedCapture(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#070D18',
            backgroundImage:
              'radial-gradient(circle at 10% 15%, rgba(0, 240, 255, 0.12) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(16, 185, 129, 0.08) 0%, transparent 45%)',
            border: '1.5px solid rgba(0, 240, 255, 0.45)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 240, 255, 0.25)',
            overflow: 'hidden',
          },
        }}
      >
        {inspectedCapture && (
          <>
            {/* 1. Dialog Header */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: 'rgba(15, 23, 42, 0.95)',
                borderBottom: '1.5px solid rgba(0, 240, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: '#00F0FF',
                    boxShadow: '0 0 16px #00F0FF',
                    animation: 'liveRecordingBlink 1.2s infinite',
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ color: '#F8FAFC', fontSize: { xs: 16, sm: 19 } }}
                  >
                    {isRtl
                      ? 'بطاقة الرصد والتحري الشاملة للوحة المركبة'
                      : 'Comprehensive Plate & Vehicle Inspection Dossier'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700 }}>
                    {isRtl
                      ? `معرف السجل: #REC-4K-${inspectedCapture.id} • الاستقطاع البصري بالذكاء الاصطناعي LPR`
                      : `Record ID: #REC-4K-${inspectedCapture.id} • Optical AI LPR Capture`}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />}
                  label={isRtl ? inspectedCapture.statusLabelAr : inspectedCapture.statusLabelEn}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    fontWeight: 900,
                    fontSize: 11,
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                />
                <IconButton
                  onClick={() => setInspectedCapture(null)}
                  sx={{
                    color: '#94A3B8',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': { color: '#FFF', bgcolor: 'rgba(255, 255, 255, 0.15)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            </Box>

            {/* 2. Dialog Content */}
            <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto', maxHeight: '80vh' }}>
              <Stack spacing={3}>
                {/* Section 1: Visual Surveillance Imagery (صور اللوحة والكاميرا) */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#00F0FF',
                      fontWeight: 900,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <CameraAltIcon sx={{ fontSize: 16 }} />
                    {isRtl
                      ? 'معرض صور اللوحة والرصد البصري 4K'
                      : '4K Plate & Optical Surveillance Imagery'}
                  </Typography>

                  <Grid container spacing={2.5} alignItems="stretch">
                    {/* Column 1: Embossed Realistic Saudi Plate Visual */}
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          p: 2.5,
                          height: '100%',
                          bgcolor: 'rgba(15, 23, 42, 0.85)',
                          borderRadius: '16px',
                          border: '1.5px solid rgba(0, 240, 255, 0.35)',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 1.5 }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontWeight: 800 }}
                            >
                              {isRtl
                                ? 'اللوحة الرسمية المستقطعة (مجسمة):'
                                : 'Official Cropped Plate (Embossed):'}
                            </Typography>
                            <Chip
                              label="KSA 🇸🇦"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                fontWeight: 900,
                                bgcolor: 'rgba(4, 120, 87, 0.3)',
                                color: '#34D399',
                                border: '1px solid rgba(4, 120, 87, 0.6)',
                              }}
                            />
                          </Stack>

                          <Box
                            sx={{
                              p: 2,
                              bgcolor: '#030712',
                              borderRadius: '14px',
                              border: '1.5px solid rgba(0, 240, 255, 0.45)',
                              boxShadow:
                                'inset 0 2px 14px rgba(0,0,0,0.9), 0 0 20px rgba(0, 240, 255, 0.25)',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              minHeight: 110,
                            }}
                          >
                            <SaudiRealisticPlate
                              plateNumber={inspectedCapture.plateNumber}
                              size="hero"
                              showBolts={true}
                              interactive={false}
                            />
                          </Box>
                        </Box>

                        {/* Character Decomposition & Copy Tool */}
                        <Box sx={{ mt: 2 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}
                          >
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label={`${isRtl ? 'الحروف:' : 'Letters:'} ${inspectedCapture.plateLetters}`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                                  color: '#F8FAFC',
                                  fontWeight: 800,
                                  fontSize: 11,
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                }}
                              />
                              <Chip
                                label={`${isRtl ? 'الأرقام:' : 'Digits:'} ${inspectedCapture.plateDigits}`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                                  color: '#F8FAFC',
                                  fontWeight: 800,
                                  fontSize: 11,
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                }}
                              />
                            </Stack>

                            <Button
                              size="small"
                              onClick={() =>
                                handleCopyPlate(
                                  `${inspectedCapture.plateNumber} | ${inspectedCapture.plateLatin}`
                                )
                              }
                              startIcon={
                                copiedPlateFeedback ? (
                                  <CheckIcon sx={{ fontSize: 15 }} />
                                ) : (
                                  <ContentCopyIcon sx={{ fontSize: 15 }} />
                                )
                              }
                              sx={{
                                color: copiedPlateFeedback ? '#10B981' : '#00F0FF',
                                fontSize: 11,
                                fontWeight: 800,
                                bgcolor: 'rgba(0, 240, 255, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 240, 255, 0.3)',
                                '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.2)' },
                              }}
                            >
                              {copiedPlateFeedback
                                ? isRtl
                                  ? 'تم النسخ بنجاح!'
                                  : 'Copied!'
                                : isRtl
                                ? 'نسخ اللوحة'
                                : 'Copy Plate'}
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Column 2: 4K CCTV Camera Snapshot with HUD Overlays */}
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          position: 'relative',
                          height: '100%',
                          minHeight: 220,
                          bgcolor: '#000',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          border: '1.5px solid rgba(56, 189, 248, 0.4)',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        <Box
                          component="img"
                          src={inspectedCapture.imageUrl}
                          alt="CCTV 4K Frame"
                          sx={{
                            width: '100%',
                            height: '100%',
                            minHeight: 220,
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />

                        {/* HUD Corner Brackets */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            width: 24,
                            height: 24,
                            borderTop: '2px solid #00F0FF',
                            borderLeft: '2px solid #00F0FF',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            width: 24,
                            height: 24,
                            borderTop: '2px solid #00F0FF',
                            borderRight: '2px solid #00F0FF',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: 10,
                            width: 24,
                            height: 24,
                            borderBottom: '2px solid #00F0FF',
                            borderLeft: '2px solid #00F0FF',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            width: 24,
                            height: 24,
                            borderBottom: '2px solid #00F0FF',
                            borderRight: '2px solid #00F0FF',
                          }}
                        />

                        {/* AI Plate Target Tracking Box overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: '22%',
                            left: '42%',
                            transform: 'translate(-50%, 0)',
                            width: 110,
                            height: 38,
                            border: '2px dashed #00F0FF',
                            boxShadow:
                              '0 0 15px rgba(0, 240, 255, 0.6), inset 0 0 10px rgba(0, 240, 255, 0.3)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-end',
                            p: 0.3,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: 8.5,
                              fontWeight: 900,
                              color: '#00F0FF',
                              bgcolor: 'rgba(0, 0, 0, 0.85)',
                              px: 0.5,
                              borderRadius: '2px',
                              fontFamily: 'monospace',
                            }}
                          >
                            AI LOCK 99.8%
                          </Typography>
                        </Box>

                        {/* Top Camera Stream Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: isRtl ? 'auto' : 12,
                            right: isRtl ? 12 : 'auto',
                            px: 1.2,
                            py: 0.4,
                            bgcolor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 240, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.8,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#EF4444',
                              boxShadow: '0 0 8px #EF4444',
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#F8FAFC',
                              fontFamily: 'monospace',
                              fontWeight: 900,
                              fontSize: 10.5,
                            }}
                          >
                            4K UHD • {inspectedCapture.cameraCode}
                          </Typography>
                        </Box>

                        {/* Bottom Bar: Direction + Speed */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            right: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Chip
                            icon={
                              inspectedCapture.direction === 'Entry' ? (
                                <ArrowDownwardIcon sx={{ fontSize: '13px !important' }} />
                              ) : (
                                <ArrowUpwardIcon sx={{ fontSize: '13px !important' }} />
                              )
                            }
                            label={
                              inspectedCapture.direction === 'Entry'
                                ? isRtl
                                  ? 'حركة دخول'
                                  : 'Entry Flow'
                                : isRtl
                                ? 'حركة خروج'
                                : 'Exit Flow'
                            }
                            size="small"
                            sx={{
                              bgcolor: 'rgba(0, 0, 0, 0.8)',
                              color:
                                inspectedCapture.direction === 'Entry' ? '#10B981' : '#38BDF8',
                              fontWeight: 900,
                              fontSize: 10.5,
                              border: '1px solid currentColor',
                            }}
                          />

                          <Typography
                            variant="caption"
                            sx={{
                              color: '#00F0FF',
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: 11,
                              bgcolor: 'rgba(0, 0, 0, 0.8)',
                              px: 1,
                              py: 0.3,
                              borderRadius: '6px',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                            }}
                          >
                            {inspectedCapture.eventTime}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                {/* Section 2: Complete Vehicle Specs & Telemetry Grid (بيانات العربية: لون، موديل، نوع، دولة، وكل شيء) */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#00F0FF',
                      fontWeight: 900,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <DirectionsCarIcon sx={{ fontSize: 16 }} />
                    {isRtl
                      ? 'ملف المواصفات وهوية المركبة الكاملة'
                      : 'Complete Vehicle Telemetry & Identification'}
                  </Typography>

                  <Grid container spacing={1.5}>
                    {/* 1. Make & Type */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 1.8,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {isRtl ? 'الصانع والنوع:' : 'Vehicle Make:'}
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                          {isRtl ? inspectedCapture.vehicleMakeAr : inspectedCapture.vehicleMakeEn}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 10.5 }}>
                          {isRtl ? inspectedCapture.classificationAr : inspectedCapture.classificationEn}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* 2. Model */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 1.8,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {isRtl ? 'الموديل والفئة:' : 'Vehicle Model:'}
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                          {isRtl ? inspectedCapture.vehicleModelAr : inspectedCapture.vehicleModelEn}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#38BDF8', fontSize: 10.5, fontWeight: 700 }}
                        >
                          {isRtl ? 'طراز معتمد وحديث' : 'Verified Production Model'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* 3. Color */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 1.8,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {isRtl ? 'اللون الخارجي والطلاء:' : 'Exterior Color:'}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              bgcolor: inspectedCapture.vehicleColorHex,
                              border: '1.5px solid #FFF',
                              boxShadow: `0 0 10px ${inspectedCapture.vehicleColorHex}`,
                            }}
                          />
                          <Typography variant="body2" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                            {isRtl ? inspectedCapture.vehicleColorAr : inspectedCapture.vehicleColorEn}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 10.5 }}>
                          {isRtl ? 'طلاء أصلي ميتاليك' : 'Original Factory Finish'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* 4. Country */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 1.8,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {isRtl ? 'الدولة ونظام الترخيص:' : 'Country & Authority:'}
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#38BDF8' }}>
                          🇸🇦 {isRtl ? inspectedCapture.countryAr : inspectedCapture.countryEn}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 10.5 }}>
                          {isRtl
                            ? 'كود الدولة: KSA • المرور السعودي'
                            : 'Code: KSA • Saudi Traffic Authority'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* 5. Transit Gate */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 1.8,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {isRtl ? 'بوابة العبور والمسار:' : 'Transit Gate & Lane:'}
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                          {isRtl ? inspectedCapture.gateNameAr : inspectedCapture.gateNameEn}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#00F0FF', fontSize: 10.5, fontFamily: 'monospace' }}
                        >
                          {inspectedCapture.cameraCode}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* 6. Radar Velocity */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 1.8,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {isRtl ? 'سرعة العبور اللحظية:' : 'Transit Velocity:'}
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#38BDF8' }}>
                          {isRtl ? inspectedCapture.speedAr : inspectedCapture.speedEn}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#10B981', fontSize: 10.5, fontWeight: 700 }}
                        >
                          {isRtl ? 'ضمن السرعة المسموحة' : 'Within Safe Limit'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* 7. Authorization Pass */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 1.8,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {isRtl ? 'حالة التصريح والاعتماد:' : 'Pass Authorization:'}
                        </Typography>
                        <Chip
                          label={isRtl ? inspectedCapture.statusLabelAr : inspectedCapture.statusLabelEn}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: 10.5,
                            fontWeight: 900,
                            bgcolor:
                              inspectedCapture.status === 'VIP'
                                ? 'rgba(167, 139, 250, 0.25)'
                                : inspectedCapture.status === 'EV'
                                ? 'rgba(0, 240, 255, 0.25)'
                                : 'rgba(16, 185, 129, 0.25)',
                            color:
                              inspectedCapture.status === 'VIP'
                                ? '#A78BFA'
                                : inspectedCapture.status === 'EV'
                                ? '#00F0FF'
                                : '#10B981',
                            border: '1px solid currentColor',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: '#94A3B8', fontSize: 10, display: 'block', mt: 0.5 }}
                        >
                          {isRtl ? 'مطابق للقوائم البيضاء' : 'Matched Whitelist'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* 8. AI OCR Confidence */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box
                        sx={{
                          p: 1.8,
                          bgcolor: 'rgba(15, 23, 42, 0.75)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                        >
                          {isRtl ? 'دقة الذكاء الاصطناعي AI OCR:' : 'AI OCR Accuracy:'}
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#10B981' }}>
                          {(inspectedCapture.confidence * 100).toFixed(2)}%
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#38BDF8', fontSize: 10.5, fontWeight: 700 }}
                        >
                          {isRtl ? 'تطابق حروف وأرقام كامل' : 'Full Character Match'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Section 3: High Precision Capture Timestamp & Barrier Automation (وقت وتاريخ الالتقاط) */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(0, 240, 255, 0.06)',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(0, 240, 255, 0.3)',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AccessTimeIcon sx={{ color: '#00F0FF', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                        {isRtl ? 'التوقيت الزمني الدقيق للالتقاط:' : 'Precise Capture Timestamp:'}
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={900}
                        sx={{ color: '#00F0FF', fontFamily: 'monospace' }}
                      >
                        {inspectedCapture.eventTime}{' '}
                        {isRtl ? '(بتوقيت مكة المكرمة الرسمي)' : '(Makkah Standard Time)'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CalendarMonthIcon sx={{ color: '#38BDF8', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                        {isRtl ? 'تاريخ التوثيق:' : 'Documentation Date:'}
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#F8FAFC' }}>
                        {isRtl ? inspectedCapture.captureDateAr : inspectedCapture.captureDateEn}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontWeight: 800, display: 'block' }}
                    >
                      {isRtl ? 'استجابة الحاجز الذكي:' : 'Smart Barrier Response:'}
                    </Typography>
                    <Typography variant="caption" fontWeight={900} sx={{ color: '#10B981' }}>
                      {isRtl ? 'تم الفتح التلقائي خلال 0.68 ثانية' : 'Auto Opened in 0.68s'}
                    </Typography>
                  </Box>
                </Box>

                {/* Section 4: Quick Forensic Actions */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<VideocamIcon />}
                    onClick={() => {
                      const target = inspectedCapture;
                      setInspectedCapture(null);
                      handleOpenPlayback(target);
                    }}
                    sx={{
                      bgcolor: '#00F0FF',
                      color: '#000',
                      fontWeight: 900,
                      fontSize: 13,
                      borderRadius: '12px',
                      py: 1.1,
                      boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
                      '&:hover': {
                        bgcolor: '#38BDF8',
                        boxShadow: '0 0 24px rgba(0, 240, 255, 0.6)',
                      },
                    }}
                  >
                    {isRtl
                      ? 'عرض تسجيل الكاميرا بالفيديو (CCTV Playback)'
                      : 'Open Camera Video Playback Studio'}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    sx={{
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      color: '#38BDF8',
                      fontWeight: 800,
                      fontSize: 12.5,
                      borderRadius: '12px',
                      py: 1.1,
                      '&:hover': {
                        borderColor: '#38BDF8',
                        bgcolor: 'rgba(56, 189, 248, 0.1)',
                      },
                    }}
                  >
                    {isRtl ? 'طباعة بطاقة الرصد والتصريح (PDF)' : 'Print Inspection Report (PDF)'}
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => setInspectedCapture(null)}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: '#F8FAFC',
                      fontWeight: 800,
                      fontSize: 12.5,
                      borderRadius: '12px',
                      px: 3,
                      py: 1.1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    {isRtl ? 'إغلاق' : 'Close'}
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
