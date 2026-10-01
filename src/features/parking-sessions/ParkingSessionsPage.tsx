import React, { useState, useMemo } from 'react';
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
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

// Icons
import TimelineIcon from '@mui/icons-material/Timeline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import SensorDoorIcon from '@mui/icons-material/SensorDoor';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import NavigationIcon from '@mui/icons-material/Navigation';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentsIcon from '@mui/icons-material/Payments';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BadgeIcon from '@mui/icons-material/Badge';
import SpeedIcon from '@mui/icons-material/Speed';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { glassPanel, glowPanel } from '../../app/theme';
import { QRCodeSVG } from 'qrcode.react';

// =========================================================================
// TYPES & DATA STRUCTURES
// =========================================================================

export interface DetailedParkingSession {
  id: string;
  ticketNumber: string;
  plateNumber: string;
  vehicleMakeAr: string;
  vehicleColorAr: string;
  driverNameAr: string;
  membershipTypeAr: string;
  isVip: boolean;
  isSubscriber: boolean;
  status: 'Active' | 'Completed' | 'PendingPayment';
  statusAr: string;
  currentStep: number; // 0 = Entry, 1 = Navigation, 2 = Parked, 3 = Exit

  // Step 1: Entry
  entryGateAr: string;
  entryTime: string;
  entryDate: string;
  entryConfidence: string;

  // Step 2: Guidance
  guidanceZoneAr: string;
  guidanceFloorAr: string;
  guidanceRouteAr: string;
  transitDurationMinutes: number;

  // Step 3: Parked
  slotNumber: string;
  slotFloorAr: string;
  slotSectionAr: string;
  parkingTime: string;
  parkingDuration: string;
  isEvCharged: boolean;

  // Step 4: Exit & Payment
  exitGateAr?: string;
  exitTime?: string;
  feeAmount: number;
  feePaidAr: string;
  paymentMethodAr?: string;
  gracePeriodUsedMinutes: number;
}

// Initial Realistic Rich Sessions
const INITIAL_SESSIONS: DetailedParkingSession[] = [
  {
    id: 'sess-101',
    ticketNumber: 'TKT-2026-99014',
    plateNumber: 'أ ب ج 1004',
    vehicleMakeAr: 'تويوتا لاندكروزر VXR',
    vehicleColorAr: 'أبيض لؤلؤي',
    driverNameAr: 'المهندس أحمد بن عبد الله الشهري',
    membershipTypeAr: 'عضوية بلاتينية VIP - اشتراك سنوي معتمد',
    isVip: true,
    isSubscriber: true,
    status: 'Active',
    statusAr: 'جلسة جارية حالياً ومستقرة في الموقف',
    currentStep: 2,

    entryGateAr: 'بوابة كبار الشخصيات VIP 03',
    entryTime: '16:15',
    entryDate: 'اليوم - 01 أكتوبر 2026',
    entryConfidence: '99.9% (مطابقة LPR مؤكدة)',

    guidanceZoneAr: 'المسار الرئاسي السريع B1',
    guidanceFloorAr: 'القبو الأول B1',
    guidanceRouteAr: 'منحدر VIP المباشر عبر ممر النخبة A',
    transitDurationMinutes: 2,

    slotNumber: 'VIP-01',
    slotFloorAr: 'القبو الأول B1',
    slotSectionAr: 'جناح كبار الشخصيات - خانة مجهزة بشاحن سريع',
    parkingTime: '16:18',
    parkingDuration: 'ساعتان و 14 دقيقة (مستمر)',
    isEvCharged: true,

    feeAmount: 0,
    feePaidAr: '0 ريال سعودي (مشمول بالاشتراك البلاتيني VIP)',
    paymentMethodAr: 'عضوية سنوية مدفوعة مسبقاً',
    gracePeriodUsedMinutes: 60,
  },
  {
    id: 'sess-102',
    ticketNumber: 'TKT-2026-99015',
    plateNumber: 'ق و ل 4001',
    vehicleMakeAr: 'لكزس LX 600 VIP',
    vehicleColorAr: 'أسود ملكي',
    driverNameAr: 'سعادة الدكتور فهد بن عبد الرحمن السديري',
    membershipTypeAr: 'تصريح ضيافة معتمد NRI-VIP-8812',
    isVip: true,
    isSubscriber: false,
    status: 'Active',
    statusAr: 'جلسة نشطة لضيف معتمد برمز تصريح',
    currentStep: 2,

    entryGateAr: 'بوابة الدخول الرئيسية 01',
    entryTime: '17:05',
    entryDate: 'اليوم - 01 أكتوبر 2026',
    entryConfidence: '99.8% (تطابق رمز QR وتصريح LPR)',

    guidanceZoneAr: 'ممر الاستقبال والضيافة الرسمي',
    guidanceFloorAr: 'الدور الأرضي (G)',
    guidanceRouteAr: 'مسار الزوار المباشر بجوار بهو الاستقبال',
    transitDurationMinutes: 3,

    slotNumber: 'G-01',
    slotFloorAr: 'الدور الأرضي (G)',
    slotSectionAr: 'المدخل الرئيسي - صف كبار الضيوف A',
    parkingTime: '17:08',
    parkingDuration: 'ساعة و 22 دقيقة (مستمر)',
    isEvCharged: false,

    feeAmount: 0,
    feePaidAr: '0 ريال سعودي (تصريح ضيافة رسمي معفى)',
    paymentMethodAr: 'تصريح إلكتروني معتمد',
    gracePeriodUsedMinutes: 45,
  },
  {
    id: 'sess-103',
    ticketNumber: 'TKT-2026-98940',
    plateNumber: 'د هـ و 2045',
    vehicleMakeAr: 'بي إم دبليو الفئة السابعة 740i',
    vehicleColorAr: 'كحلي ميتاليك',
    driverNameAr: 'الأستاذ عبد العزيز بن محمد التميمي',
    membershipTypeAr: 'تذكرة وقوف زائر عابر - دفع إلكتروني',
    isVip: false,
    isSubscriber: false,
    status: 'Completed',
    statusAr: 'جلسة وقوف مكتملة ومغادرة بنجاح',
    currentStep: 3,

    entryGateAr: 'بوابة الدخول الرئيسية 01',
    entryTime: '13:40',
    entryDate: 'اليوم - 01 أكتوبر 2026',
    entryConfidence: '99.4% (التقاط LPR فوري)',

    guidanceZoneAr: 'المحور الأوسط لمواقف القبو',
    guidanceFloorAr: 'القبو الثاني B2',
    guidanceRouteAr: 'المنحدر الشرقي باتجاه القطاع B',
    transitDurationMinutes: 4,

    slotNumber: 'B2-05',
    slotFloorAr: 'القبو الثاني B2',
    slotSectionAr: 'القطاع الأوسط - صف شواحن EV الذكية',
    parkingTime: '13:44',
    parkingDuration: 'ساعتان و 50 دقيقة',
    isEvCharged: true,

    exitGateAr: 'بوابة الخروج الغربية 02',
    exitTime: '16:34',
    feeAmount: 25,
    feePaidAr: '25.00 ريال سعودي (مدفوع بالكامل)',
    paymentMethodAr: 'مدى / Apple Pay عند حاجز الخروج',
    gracePeriodUsedMinutes: 15,
  },
  {
    id: 'sess-104',
    ticketNumber: 'TKT-2026-98892',
    plateNumber: 'س ل ط 3030',
    vehicleMakeAr: 'مرسيدس الفئة E 300',
    vehicleColorAr: 'رمادي سيلينيوم',
    driverNameAr: 'الأستاذة نورة بنت سلطان آل الشيخ',
    membershipTypeAr: 'باقة الأعمال والشركات المتقدمة (Annual Pro)',
    isVip: false,
    isSubscriber: true,
    status: 'Completed',
    statusAr: 'جلسة مكتملة لاشتراك شركات',
    currentStep: 3,

    entryGateAr: 'بوابة الشمال 04',
    entryTime: '09:15',
    entryDate: 'اليوم - 01 أكتوبر 2026',
    entryConfidence: '99.7% (حساس LPR البرج الشمالي)',

    guidanceZoneAr: 'قطاع برج الأعمال والمصاعد',
    guidanceFloorAr: 'القبو الأول B1',
    guidanceRouteAr: 'مسار المشتركين السريع عبر الممر D',
    transitDurationMinutes: 3,

    slotNumber: 'B1-07',
    slotFloorAr: 'القبو الأول B1',
    slotSectionAr: 'القطاع الجنوبي - صف C (بجوار المصاعد)',
    parkingTime: '09:18',
    parkingDuration: '5 ساعات و 5 دقائق',
    isEvCharged: false,

    exitGateAr: 'بوابة الشمال 04',
    exitTime: '14:23',
    feeAmount: 0,
    feePaidAr: '0 ريال سعودي (مشمول بالاشتراك السنوي)',
    paymentMethodAr: 'اشتراك شركات سارٍ',
    gracePeriodUsedMinutes: 45,
  },
  {
    id: 'sess-105',
    ticketNumber: 'TKT-2026-99020',
    plateNumber: 'م ن هـ 7080',
    vehicleMakeAr: 'بورشه كايين GTS',
    vehicleColorAr: 'أحمر قرمزي',
    driverNameAr: 'المهندس فيصل بن تركي المنصور',
    membershipTypeAr: 'عضوية الأعمال المتقدمة - شحن EV',
    isVip: true,
    isSubscriber: true,
    status: 'Active',
    statusAr: 'مركبة في مسار التوجيه والملاحة نحو الخانة',
    currentStep: 1,

    entryGateAr: 'بوابة المنحدر السريع B1',
    entryTime: '18:24',
    entryDate: 'اليوم - 01 أكتوبر 2026',
    entryConfidence: '99.9% (التعرف اللحظي التلقائي)',

    guidanceZoneAr: 'مسار شواحن الطاقة الفائقة EV',
    guidanceFloorAr: 'القبو الأول B1',
    guidanceRouteAr: 'ممر الشحن فائق السرعة عبر اللوحة الإرشادية 02',
    transitDurationMinutes: 1,

    slotNumber: 'B1-04',
    slotFloorAr: 'القبو الأول B1',
    slotSectionAr: 'المحور الأوسط - شاحن فائق السرعة 150kW',
    parkingTime: 'جارٍ الوصول للخانة الآن...',
    parkingDuration: '3 دقائق (في مسار التوجيه)',
    isEvCharged: true,

    feeAmount: 0,
    feePaidAr: '0 ريال سعودي (مشمول بعضوية الشحن)',
    paymentMethodAr: 'عضوية مفعلة',
    gracePeriodUsedMinutes: 30,
  },
];

export function ParkingSessionsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Active filter tab
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'VIP'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected session for detailed ticket modal
  const [selectedSessionModal, setSelectedSessionModal] = useState<DetailedParkingSession | null>(null);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return INITIAL_SESSIONS.filter((s) => {
      // Tab filter
      if (filterTab === 'ACTIVE' && s.status !== 'Active') return false;
      if (filterTab === 'COMPLETED' && s.status !== 'Completed') return false;
      if (filterTab === 'VIP' && !s.isVip) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.plateNumber.toLowerCase().includes(q) ||
        s.vehicleMakeAr.toLowerCase().includes(q) ||
        s.driverNameAr.toLowerCase().includes(q) ||
        s.slotNumber.toLowerCase().includes(q) ||
        s.ticketNumber.toLowerCase().includes(q)
      );
    });
  }, [filterTab, searchQuery]);

  // Statistics
  const activeCount = useMemo(() => INITIAL_SESSIONS.filter((s) => s.status === 'Active').length, []);
  const completedCount = useMemo(() => INITIAL_SESSIONS.filter((s) => s.status === 'Completed').length, []);

  // Print Ticket Handler
  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <Box sx={{ pb: 8, width: '100%' }}>
      {/* 1. Header Command Ribbon */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha('#0F172A', 0.95)} 70%)`
            : `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.12)} 0%, #FFFFFF 85%)`,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  display: 'flex',
                }}
              >
                <TimelineIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                  منظومة مسارات وجلسات الوقوف الذكية
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  تتبع حي ولحظي لرحلة المركبة خطوة بخطوة من رصد الدخول بكاميرات LPR والتوجيه الداخلي وحتى الخروج الآلي
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip
              icon={<RadioButtonCheckedIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />}
              label="رصد لحظي فوري متصل بكاميرات LPR"
              sx={{
                bgcolor: alpha('#10B981', 0.12),
                color: '#10B981',
                fontWeight: 800,
                fontSize: 12,
                borderRadius: 2,
                py: 2,
              }}
            />
            <Chip
              icon={<NavigationIcon sx={{ fontSize: 16 }} />}
              label="الملاحة والتوجيه التلقائي مفعل"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: 12,
                borderRadius: 2,
                py: 2,
              }}
            />
          </Stack>
        </Stack>

        {/* Global Key Performance Indicators */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  جلسات الوقوف النشطة حالياً
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: '#10B981' }}>
                {activeCount} مركبة قيد الوقوف الآن
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  الجلسات المكتملة اليوم
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                {completedCount + 184} جلسة مكتملة ومغادرة
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  متوسط مدة الوقوف للجلسة
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.info.main }}>
                ساعة و 48 دقيقة
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <SpeedIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  سرعة فتح الحواجز الآلية
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.warning.main }}>
                0.4 ثانية (عبور بدون توقف)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Filter Toolbar & Search */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="ابحث برقم اللوحة، اسم السائق، رقم الخانة، أو كود التذكرة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', md: 450 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="كافة الجلسات"
              clickable
              color={filterTab === 'ALL' ? 'primary' : 'default'}
              onClick={() => setFilterTab('ALL')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />}
              label="جلسات نشطة الآن"
              clickable
              color={filterTab === 'ACTIVE' ? 'success' : 'default'}
              onClick={() => setFilterTab('ACTIVE')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              label="جلسات مكتملة ومغادرة"
              clickable
              color={filterTab === 'COMPLETED' ? 'info' : 'default'}
              onClick={() => setFilterTab('COMPLETED')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              icon={<StarIcon sx={{ fontSize: 16 }} />}
              label="مركبات VIP والنخبة"
              clickable
              color={filterTab === 'VIP' ? 'warning' : 'default'}
              onClick={() => setFilterTab('VIP')}
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* 3. Session Cards with High-Tech Cyber Timelines */}
      <Stack spacing={3.5}>
        {filteredSessions.map((session) => {
          const isActive = session.status === 'Active';
          const isVip = session.isVip;

          return (
            <Card
              key={session.id}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                position: 'relative',
                overflow: 'hidden',
                ...(isActive
                  ? glowPanel(theme.palette.primary.main, { borderRadius: 4.5 }, theme.palette.mode)
                  : glassPanel({ borderRadius: 4.5 }, theme.palette.mode)),
                border: `1.5px solid ${
                  isActive
                    ? alpha(theme.palette.primary.main, 0.6)
                    : isVip
                    ? alpha('#FBBF24', 0.4)
                    : alpha(theme.palette.divider, 0.25)
                }`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
              }}
            >
              {/* Card Header Strip: Plate, Vehicle, and Status */}
              <Grid container spacing={3} alignItems="center">
                {/* Vehicle & Plate Column */}
                <Grid item xs={12} lg={4.2}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={session.ticketNumber}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          letterSpacing: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Chip
                        icon={isActive ? <RadioButtonCheckedIcon sx={{ fontSize: 14, color: '#10B981 !important' }} /> : <CheckCircleIcon sx={{ fontSize: 14 }} />}
                        label={session.statusAr}
                        size="small"
                        color={isActive ? 'success' : 'default'}
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>

                    {/* Realistic Saudi Plate */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                      <SaudiRealisticPlate plateNumber={session.plateNumber} size="md" showBolts={true} interactive={false} />
                    </Box>

                    {/* Vehicle Metadata */}
                    <Box>
                      <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.3 }}>
                        {session.vehicleMakeAr}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {session.vehicleColorAr} • السائق: {session.driverNameAr}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 800, display: 'block', mt: 0.5 }}>
                        {session.membershipTypeAr}
                      </Typography>
                    </Box>

                    {/* Financial Summary & Time */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.8,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, isDark ? 0.35 : 0.7),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            المدة المستغرقة
                          </Typography>
                          <Typography variant="body2" fontWeight={900} sx={{ color: isActive ? '#10B981' : 'text.primary' }}>
                            {session.parkingDuration}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            التكلفة الإجمالية
                          </Typography>
                          <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                            {session.feePaidAr}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Quick Action Buttons */}
                    <Stack direction="row" spacing={1.5}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => setSelectedSessionModal(session)}
                        sx={{ fontWeight: 800, flex: 1, borderRadius: 2.5 }}
                      >
                        تفاصيل التذكرة والفاتورة
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>

                {/* Right: High-Tech Cyber Timeline Flow (مسار الرحلة الأيقوني) */}
                <Grid item xs={12} lg={7.8}>
                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 4,
                      bgcolor: isDark ? '#0A0F1D' : '#F8FAFC',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      position: 'relative',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AltRouteIcon sx={{ color: theme.palette.primary.main }} /> المسار الزمني والتحرك اللحظي للمركبة:
                    </Typography>

                    {/* Timeline Stages Grid */}
                    <Grid container spacing={2}>
                      {/* Step 1: Entry */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            height: '100%',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            border: `1.5px solid ${theme.palette.primary.main}`,
                            position: 'relative',
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                bgcolor: theme.palette.primary.main,
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 900,
                                fontSize: 12,
                              }}
                            >
                              1
                            </Box>
                            <Typography variant="subtitle2" fontWeight={900}>
                              رصد الدخول LPR
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {session.entryGateAr}
                          </Typography>
                          <Typography variant="body2" fontWeight={800} sx={{ color: theme.palette.primary.main, mt: 0.5 }}>
                            {session.entryTime}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, fontSize: 10, display: 'block', mt: 0.5 }}>
                            {session.entryConfidence}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Step 2: Guidance */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            height: '100%',
                            bgcolor: session.currentStep >= 1 ? alpha(theme.palette.info.main, 0.08) : 'transparent',
                            border: `1.5px solid ${session.currentStep >= 1 ? theme.palette.info.main : alpha(theme.palette.divider, 0.2)}`,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                bgcolor: session.currentStep >= 1 ? theme.palette.info.main : alpha(theme.palette.divider, 0.3),
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 900,
                                fontSize: 12,
                              }}
                            >
                              2
                            </Box>
                            <Typography variant="subtitle2" fontWeight={900}>
                              المسار والتوجيه
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {session.guidanceFloorAr}
                          </Typography>
                          <Typography variant="body2" fontWeight={800} sx={{ color: theme.palette.info.main, mt: 0.5 }}>
                            {session.guidanceZoneAr}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block', mt: 0.5 }}>
                            مدة العبور: {session.transitDurationMinutes} دقائق
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Step 3: Parked */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            height: '100%',
                            bgcolor: session.currentStep >= 2 ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                            border: `1.5px solid ${session.currentStep >= 2 ? theme.palette.success.main : alpha(theme.palette.divider, 0.2)}`,
                            boxShadow: session.currentStep === 2 ? `0 0 15px ${alpha(theme.palette.success.main, 0.3)}` : 'none',
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                bgcolor: session.currentStep >= 2 ? theme.palette.success.main : alpha(theme.palette.divider, 0.3),
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 900,
                                fontSize: 12,
                              }}
                            >
                              3
                            </Box>
                            <Typography variant="subtitle2" fontWeight={900}>
                              الاستقرار بالخانة
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {session.slotFloorAr}
                          </Typography>
                          <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.success.main, mt: 0.5 }}>
                            خانة ({session.slotNumber})
                          </Typography>
                          {session.isEvCharged && (
                            <Chip
                              icon={<BoltIcon sx={{ fontSize: 14 }} />}
                              label="شاحن EV مفعل"
                              size="small"
                              color="info"
                              sx={{ height: 20, fontSize: 10, fontWeight: 800, mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Grid>

                      {/* Step 4: Exit & Clearance */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            height: '100%',
                            bgcolor: session.currentStep >= 3 ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
                            border: `1.5px solid ${session.currentStep >= 3 ? theme.palette.warning.main : alpha(theme.palette.divider, 0.2)}`,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                bgcolor: session.currentStep >= 3 ? theme.palette.warning.main : alpha(theme.palette.divider, 0.3),
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 900,
                                fontSize: 12,
                              }}
                            >
                              4
                            </Box>
                            <Typography variant="subtitle2" fontWeight={900}>
                              المحاسبة والخروج
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {session.exitGateAr || 'قيد الوقوف بالموقف'}
                          </Typography>
                          <Typography variant="body2" fontWeight={800} sx={{ color: session.currentStep >= 3 ? theme.palette.warning.main : 'text.secondary', mt: 0.5 }}>
                            {session.exitTime || 'لم تغادر بعد'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, display: 'block', mt: 0.5 }}>
                            {session.paymentMethodAr || 'تسوية تلقائية'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          );
        })}
      </Stack>

      {/* ========================================================================= */}
      {/* 4. FULL SESSION TICKET & AUDIT DIALOG (نافذة استعراض التذكرة الضريبية)       */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedSessionModal)}
        onClose={() => setSelectedSessionModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: isDark ? '#0B132B' : '#FFFFFF',
            backgroundImage: 'none',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            boxShadow: `0 30px 90px ${alpha(theme.palette.primary.main, 0.35)}`,
            overflow: 'hidden',
          },
        }}
      >
        {selectedSessionModal && (
          <>
            <DialogTitle
              sx={{
                p: 2.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <ReceiptLongIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={900}>
                    تذكرة وبيانات جلسة الوقوف الرسمية
                  </Typography>
                </Stack>
                <IconButton onClick={() => setSelectedSessionModal(null)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              {/* Printable Ticket Receipt Area */}
              <Box
                id="printable-session-ticket"
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: isDark ? '#0A0F1D' : '#F8FAFC',
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="overline" sx={{ letterSpacing: 2, color: theme.palette.primary.main, fontWeight: 900, fontSize: 13 }}>
                  المملكة العربية السعودية • منظومة كايان للمواقف الذكية NRI
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
                  تذكرة جلسة إيقاف معتمدة
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  رقم التذكرة: {selectedSessionModal.ticketNumber} • التاريخ: {selectedSessionModal.entryDate}
                </Typography>

                {/* Plate Display */}
                <Box sx={{ my: 2.5, display: 'flex', justifyContent: 'center' }}>
                  <SaudiRealisticPlate plateNumber={selectedSessionModal.plateNumber} size="md" showBolts={true} interactive={false} />
                </Box>

                {/* QR Code */}
                <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 3, display: 'inline-block', my: 1.5 }}>
                  <QRCodeSVG value={`https://nri.smartparking.local/ticket/${selectedSessionModal.ticketNumber}`} size={140} level="H" />
                </Box>

                {/* Breakdown Matrix */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mt: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    textAlign: 'right',
                  }}
                >
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">اسم السائق / العضو</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedSessionModal.driverNameAr}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">نوع وطراز المركبة</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedSessionModal.vehicleMakeAr}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">بوابة الدخول والتوقيت</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedSessionModal.entryGateAr} ({selectedSessionModal.entryTime})</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">الخانة المستقر بها</Typography>
                      <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                        {selectedSessionModal.slotFloorAr} - ({selectedSessionModal.slotNumber})
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">فترة السماح الممنوحة</Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#10B981' }}>
                        {selectedSessionModal.gracePeriodUsedMinutes} دقيقة مجانية
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">التكلفة والرسوم</Typography>
                      <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                        {selectedSessionModal.feePaidAr}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  تخضع هذه التذكرة لأنظمة وقوانين مجمع كايان الذكي وتدعم الدفع الرقمي والفوترة المعتمدة ZATCA
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrintTicket}
                sx={{ fontWeight: 800, borderRadius: 2.5 }}
              >
                طباعة التذكرة
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSelectedSessionModal(null)}
                sx={{ fontWeight: 900, borderRadius: 2.5, px: 3 }}
              >
                إغلاق التذكرة
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default ParkingSessionsPage;
