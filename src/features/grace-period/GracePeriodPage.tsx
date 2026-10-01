import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
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
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
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
import TimerIcon from '@mui/icons-material/Timer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SensorsIcon from '@mui/icons-material/Sensors';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { glassPanel, glowPanel } from '../../app/theme';

// =========================================================================
// DATA MODELS
// =========================================================================

export interface ActiveGraceVehicle {
  id: string;
  plateNumber: string;
  vehicleMakeAr: string;
  vehicleColorAr: string;
  driverNameAr: string;
  driverPhone: string;
  driverTypeAr: string; // زائر عابر، مندوب توصيل سريع، سائق أجرة، ضيف مؤقت
  entryGateAr: string;
  entryTime: string;
  totalGraceMinutes: number;
  remainingSeconds: number; // For live real-time countdown
  locationSectionAr: string;
  status: 'Safe' | 'Warning' | 'Critical';
}

export interface OverstayViolationRecord {
  id: string;
  violationCode: string;
  plateNumber: string;
  vehicleMakeAr: string;
  driverNameAr: string;
  driverPhone: string;
  entryGateAr: string;
  entryTime: string;
  graceLimitTime: string;
  exitGateAr: string;
  exitTime: string;
  allowedGraceMinutes: number;
  actualStayMinutes: number;
  overstayMinutes: number;
  feeAmount: number;
  status: 'Paid' | 'Pending' | 'Waived';
  statusAr: string;
  paymentMethodAr: string;
  lprAccuracy: string;
}

// Initial Active Grace Data
const INITIAL_ACTIVE_GRACE: ActiveGraceVehicle[] = [
  {
    id: 'g-01',
    plateNumber: 'أ ب ج 1004',
    vehicleMakeAr: 'تويوتا كامري - أبيض لؤلؤي',
    vehicleColorAr: 'أبيض لؤلؤي',
    driverNameAr: 'سعود بن نايف الدوسري',
    driverPhone: '+966501112233',
    driverTypeAr: 'زائر عابر - مراجعة سريعة',
    entryGateAr: 'بوابة الدخول الرئيسية 01',
    entryTime: '18:18',
    totalGraceMinutes: 20,
    remainingSeconds: 840, // 14 mins
    locationSectionAr: 'الدور الأرضي (G) - بهو الاستقبال',
    status: 'Safe',
  },
  {
    id: 'g-02',
    plateNumber: 'د هـ و 2045',
    vehicleMakeAr: 'هيونداي سوناتا - فضي معدني',
    vehicleColorAr: 'فضي معدني',
    driverNameAr: 'ماجد بن عثمان العتيبي',
    driverPhone: '+966552223344',
    driverTypeAr: 'مندوب توصيل وشحن سريع',
    entryGateAr: 'بوابة الشمال 04',
    entryTime: '18:24',
    totalGraceMinutes: 20,
    remainingSeconds: 1140, // 19 mins
    locationSectionAr: 'القبو الأول B1 - ممر الخدمات',
    status: 'Safe',
  },
  {
    id: 'g-03',
    plateNumber: 'س ص ع 9999',
    vehicleMakeAr: 'مرسيدس الفئة C 200 - أسود',
    vehicleColorAr: 'أسود ملوكي',
    driverNameAr: 'إبراهيم بن صالح الغامدي',
    driverPhone: '+966543334455',
    driverTypeAr: 'زائر مراجع لخدمة العملاء',
    entryGateAr: 'بوابة الدخول الرئيسية 01',
    entryTime: '18:05',
    totalGraceMinutes: 20,
    remainingSeconds: 125, // ~2 mins remaining (Critical)
    locationSectionAr: 'الدور الأرضي (G) - صف الانتظار السريع',
    status: 'Critical',
  },
  {
    id: 'g-04',
    plateNumber: 'ط ك ل 4455',
    vehicleMakeAr: 'لكزس ES 350 - رصاصي تيتانيوم',
    vehicleColorAr: 'رصاصي تيتانيوم',
    driverNameAr: 'المهندس راشد بن فهد القحطاني',
    driverPhone: '+966567778899',
    driverTypeAr: 'زائر لاجتماع مقتضب',
    entryGateAr: 'بوابة كبار الشخصيات VIP 03',
    entryTime: '18:12',
    totalGraceMinutes: 30,
    remainingSeconds: 410, // ~6.8 mins (Warning)
    locationSectionAr: 'القبو الأول B1 - قطاع كبار الضيوف',
    status: 'Warning',
  },
];

// Initial Overstay Records
const INITIAL_VIOLATIONS: OverstayViolationRecord[] = [
  {
    id: 'v-01',
    violationCode: 'OVR-2026-8801',
    plateNumber: 'ط ك ل 8812',
    vehicleMakeAr: 'شيفروليه تاهو - أسود ملكي',
    driverNameAr: 'سلطان بن عبد الرحمن الحربي',
    driverPhone: '+966558889900',
    entryGateAr: 'بوابة الدخول الرئيسية 01',
    entryTime: '16:00',
    graceLimitTime: '16:20 (انقضاء 20 دقيقة)',
    exitGateAr: 'بوابة الخروج الرئيسية 01',
    exitTime: '17:15',
    allowedGraceMinutes: 20,
    actualStayMinutes: 75,
    overstayMinutes: 55,
    feeAmount: 35,
    status: 'Paid',
    statusAr: 'تم السداد عبر بطاقة مدى عند البوابة',
    paymentMethodAr: 'بطاقة مدى الإلكترونية / Apple Pay',
    lprAccuracy: '99.9% (كاميرا الخروج 01)',
  },
  {
    id: 'v-02',
    violationCode: 'OVR-2026-8794',
    plateNumber: 'ي ن م 3321',
    vehicleMakeAr: 'نيسان باترول - بلاتينيوم أبيض',
    driverNameAr: 'خالد بن ناصر السبيعي',
    driverPhone: '+966509991122',
    entryGateAr: 'بوابة الشمال 04',
    entryTime: '14:30',
    graceLimitTime: '14:50 (انقضاء 20 دقيقة)',
    exitGateAr: 'بوابة الشمال 04',
    exitTime: '15:40',
    allowedGraceMinutes: 20,
    actualStayMinutes: 70,
    overstayMinutes: 50,
    feeAmount: 30,
    status: 'Paid',
    statusAr: 'تم السداد إلكترونياً عبر المحفظة',
    paymentMethodAr: 'المحفظة الرقمية الذكية',
    lprAccuracy: '99.8% (كاميرا الشمال)',
  },
  {
    id: 'v-03',
    violationCode: 'OVR-2026-8760',
    plateNumber: 'ر ح ل 9920',
    vehicleMakeAr: 'فورد تورس - كحلي غامق',
    driverNameAr: 'بدر بن حمد العسيري',
    driverPhone: '+966531118833',
    entryGateAr: 'بوابة الدخول السفلية B2',
    entryTime: '11:15',
    graceLimitTime: '11:35 (انقضاء 20 دقيقة)',
    exitGateAr: 'بوابة الخروج السفلية B2',
    exitTime: '13:00',
    allowedGraceMinutes: 20,
    actualStayMinutes: 105,
    overstayMinutes: 85,
    feeAmount: 50,
    status: 'Pending',
    statusAr: 'معلقة قيد المطالبة والتحصيل الآلي',
    paymentMethodAr: 'فاتورة ضريبية مستحقة',
    lprAccuracy: '99.7% (كاميرا B2)',
  },
];

export function GracePeriodPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [activeGraceVehicles, setActiveGraceVehicles] = useState<ActiveGraceVehicle[]>(INITIAL_ACTIVE_GRACE);
  const [violations, setViolations] = useState<OverstayViolationRecord[]>(INITIAL_VIOLATIONS);

  // Filter Tabs
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'WARNING' | 'VIOLATIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [extendModalVehicle, setExtendModalVehicle] = useState<ActiveGraceVehicle | null>(null);
  const [selectedViolationModal, setSelectedViolationModal] = useState<OverstayViolationRecord | null>(null);
  const [extensionMinutes, setExtensionMinutes] = useState(15);
  const [extensionReason, setExtensionReason] = useState('تأخر إنهاء الخدمة بمكتب الاستقبال بناءً على طلب رسمي');
  const [snackbarNotice, setSnackbarNotice] = useState<string | null>(null);

  // Live real-time countdown timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveGraceVehicles((prev) =>
        prev.map((v) => {
          if (v.remainingSeconds <= 1) {
            return {
              ...v,
              remainingSeconds: 0,
              status: 'Critical',
            };
          }
          const nextSec = v.remainingSeconds - 1;
          let nextStatus: 'Safe' | 'Warning' | 'Critical' = 'Safe';
          if (nextSec <= 180) {
            nextStatus = 'Critical';
          } else if (nextSec <= 480) {
            nextStatus = 'Warning';
          }
          return {
            ...v,
            remainingSeconds: nextSec,
            status: nextStatus,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'انتهت المهلة!';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} دقيقة و ${secs < 10 ? '0' : ''}${secs} ثانية`;
  };

  // Handle Extension Submission
  const handleConfirmExtension = () => {
    if (!extendModalVehicle) return;
    const addedSeconds = extensionMinutes * 60;
    setActiveGraceVehicles((prev) =>
      prev.map((v) =>
        v.id === extendModalVehicle.id
          ? {
              ...v,
              remainingSeconds: v.remainingSeconds + addedSeconds,
              totalGraceMinutes: v.totalGraceMinutes + extensionMinutes,
              status: 'Safe',
            }
          : v
      )
    );
    setSnackbarNotice(`تم منح تمديد استثنائي بمقدار ${extensionMinutes} دقيقة لمركبة ${extendModalVehicle.plateNumber} بنجاح.`);
    setExtendModalVehicle(null);
  };

  // Handle WhatsApp Notification
  const handleSendReminder = (vehicle: ActiveGraceVehicle) => {
    const text = `*تنبيه ذكي باقتراب انقضاء فترة السماح - مجمع كايان الذكي* ⏱️🚗
أهلاً بك عزيزي السائق / ${vehicle.driverNameAr}،

نود إحاطتكم بأن مهلة السماح المجانية المخصصة لمركبتكم ذات اللوحة (*${vehicle.plateNumber}*) متبقٍ عليها:
⏳ *${formatTimeRemaining(vehicle.remainingSeconds)}*

يرجى التوجه إلى بوابة الخروج لتفادي احتساب رسوم الوقوف النظامية الإضافية.
نتمنى لكم يوماً سعيداً ورافقتكم السلامة! ✨`;

    const clean = vehicle.driverPhone.replace(/[^0-9]/g, '');
    const phone = clean.startsWith('966') ? clean : '966' + clean.replace(/^0+/, '');
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank');
    setSnackbarNotice(`تم فتح محادثة إشعار واتساب للسائق ${vehicle.driverNameAr}.`);
  };

  // Filtered active vehicles
  const filteredActiveVehicles = useMemo(() => {
    return activeGraceVehicles.filter((v) => {
      if (filterTab === 'WARNING' && v.status === 'Safe') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.plateNumber.toLowerCase().includes(q) ||
        v.driverNameAr.toLowerCase().includes(q) ||
        v.vehicleMakeAr.toLowerCase().includes(q)
      );
    });
  }, [activeGraceVehicles, filterTab, searchQuery]);

  // Statistics
  const warningCount = useMemo(
    () => activeGraceVehicles.filter((v) => v.status === 'Warning' || v.status === 'Critical').length,
    [activeGraceVehicles]
  );

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
                <TimerIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                  منظومة مراقبة فترات السماح الذكية والرصد اللحظي
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  متابعة حية بالثواني للمركبات المتواجدة داخل مهلة السماح المجانية، وإدارة تنبيهات المغادرة التلقائية، ومعالجة التجاوزات
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip
              icon={<SpeedIcon sx={{ fontSize: 16 }} />}
              label="تحديث ثوانٍ حي مباشر"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                fontWeight: 800,
                fontSize: 12,
                borderRadius: 2,
                py: 2,
              }}
            />
            <Chip
              icon={<ShieldIcon sx={{ fontSize: 16 }} />}
              label="ربط آلي مع بوابات LPR"
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

        {/* Global KPI Strip */}
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
                <TimerIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  مهلة السماح القياسية
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                20 دقيقة مجانية
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
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  مركبات داخل السماح الآن
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: '#10B981' }}>
                {activeGraceVehicles.length} مركبة نشطة
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
                <WarningAmberIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  تنبيهات اقتراب الانتهاء
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.warning.main }}>
                {warningCount} مركبات حرجة
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
                <ReceiptLongIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  تجاوزات اليوم المسجلة
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.info.main }}>
                {violations.length} تجاوزات معالجة
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Navigation Tabs */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Tabs
          value={filterTab}
          onChange={(_, val) => setFilterTab(val)}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, isDark ? 0.6 : 0.9),
            borderRadius: 4,
            p: 0.8,
            boxShadow: `0 8px 30px ${alpha('#000', isDark ? 0.4 : 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            '& .MuiTabs-indicator': {
              borderRadius: 3,
              height: '100%',
              bgcolor: alpha(theme.palette.primary.main, 0.18),
              border: `1.5px solid ${theme.palette.primary.main}`,
            },
          }}
        >
          <Tab
            icon={<TimerIcon />}
            iconPosition="start"
            value="ALL"
            label={`المركبات داخل فترة السماح (${activeGraceVehicles.length})`}
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              zIndex: 1,
              borderRadius: 3,
              minHeight: 48,
              px: 3,
            }}
          />
          <Tab
            icon={<WarningAmberIcon />}
            iconPosition="start"
            value="WARNING"
            label={`تنبيهات الاقتراب والتحذير (${warningCount})`}
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              zIndex: 1,
              borderRadius: 3,
              minHeight: 48,
              px: 3,
            }}
          />
          <Tab
            icon={<HistoryEduIcon />}
            iconPosition="start"
            value="VIOLATIONS"
            label={`سجل التجاوزات واحتساب الرسوم (${violations.length})`}
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              zIndex: 1,
              borderRadius: 3,
              minHeight: 48,
              px: 3,
            }}
          />
        </Tabs>
      </Box>

      {/* Search Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="ابحث برقم لوحة المركبة، اسم السائق، أو نوع وطراز السيارة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 480 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            {filterTab === 'VIOLATIONS'
              ? `عرض سجل التجاوزات (${violations.length} سجل)`
              : `عرض المركبات المراقبة (${filteredActiveVehicles.length} مركبة)`}
          </Typography>
        </Stack>
      </Paper>

      {/* ========================================================================= */}
      {/* 3. ACTIVE GRACE VEHICLES CARDS (المركبات النشطة داخل فترة السماح)          */}
      {/* ========================================================================= */}
      {filterTab !== 'VIOLATIONS' && (
        <Grid container spacing={3.5}>
          {filteredActiveVehicles.map((vehicle) => {
            const isCritical = vehicle.status === 'Critical';
            const isWarning = vehicle.status === 'Warning';
            const progressPercent = Math.min(
              100,
              Math.max(0, (vehicle.remainingSeconds / (vehicle.totalGraceMinutes * 60)) * 100)
            );

            let glowColor = theme.palette.primary.main;
            let statusBadgeColor: 'success' | 'warning' | 'error' = 'success';
            let statusText = 'آمنة داخل المهلة';

            if (isCritical) {
              glowColor = '#EF4444';
              statusBadgeColor = 'error';
              statusText = 'حرجة - توشك على الانتهاء!';
            } else if (isWarning) {
              glowColor = '#F59E0B';
              statusBadgeColor = 'warning';
              statusText = 'تحذير - أقل من 8 دقائق';
            }

            return (
              <Grid item xs={12} md={6} lg={6} key={vehicle.id}>
                <Card
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    position: 'relative',
                    overflow: 'hidden',
                    ...(isCritical
                      ? glowPanel('#EF4444', { borderRadius: 4.5 }, theme.palette.mode)
                      : isWarning
                      ? glowPanel('#F59E0B', { borderRadius: 4.5 }, theme.palette.mode)
                      : glassPanel({ borderRadius: 4.5 }, theme.palette.mode)),
                    border: `1.8px solid ${
                      isCritical ? '#EF4444' : isWarning ? '#F59E0B' : alpha(theme.palette.divider, 0.25)
                    }`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 60px ${alpha(glowColor, 0.3)}`,
                    },
                  }}
                >
                  {/* Card Header: Plate & Status Badge */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      icon={<SensorsIcon sx={{ fontSize: 16 }} />}
                      label={vehicle.driverTypeAr}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                      }}
                    />
                    <Chip
                      icon={
                        isCritical ? (
                          <ErrorOutlineIcon sx={{ fontSize: 16, color: '#EF4444 !important' }} />
                        ) : isWarning ? (
                          <WarningAmberIcon sx={{ fontSize: 16, color: '#F59E0B !important' }} />
                        ) : (
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />
                        )
                      }
                      label={statusText}
                      color={statusBadgeColor}
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

                  {/* Saudi Realistic Plate */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
                    <SaudiRealisticPlate plateNumber={vehicle.plateNumber} size="md" showBolts={true} interactive={false} />
                  </Box>

                  {/* Vehicle & Driver Info */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={900}>
                      {vehicle.vehicleMakeAr}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      السائق: {vehicle.driverNameAr} • {vehicle.driverPhone}
                    </Typography>
                  </Box>

                  {/* Live Countdown Progress Display */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      my: 2,
                      borderRadius: 3.5,
                      bgcolor: isDark ? '#0A0F1D' : '#F1F5F9',
                      border: `1px solid ${alpha(glowColor, 0.3)}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      الوقت المتبقي حتى انقضاء مهلة السماح والخروج المجاني:
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      sx={{
                        my: 1,
                        color: isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981',
                        letterSpacing: 0.5,
                        textShadow: `0 0 20px ${alpha(glowColor, 0.5)}`,
                      }}
                    >
                      {formatTimeRemaining(vehicle.remainingSeconds)}
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={progressPercent}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.divider, 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981',
                        },
                      }}
                    />

                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        وقت الدخول: {vehicle.entryTime} ({vehicle.entryGateAr})
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        إجمالي المهلة: {vehicle.totalGraceMinutes} دقيقة
                      </Typography>
                    </Stack>
                  </Paper>

                  {/* Location Info */}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2, textAlign: 'center' }}>
                    الموقع الحالي المرصود: <strong style={{ color: theme.palette.text.primary }}>{vehicle.locationSectionAr}</strong>
                  </Typography>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AddAlarmIcon />}
                      onClick={() => setExtendModalVehicle(vehicle)}
                      sx={{ fontWeight: 800, flex: 1.2, borderRadius: 2.5 }}
                    >
                      تمديد استثنائي
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<WhatsAppIcon />}
                      onClick={() => handleSendReminder(vehicle)}
                      sx={{ fontWeight: 800, flex: 1, borderRadius: 2.5 }}
                    >
                      إرسال تذكير
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* 4. VIOLATIONS & OVERSTAY RECORDS (سجل التجاوزات وتطبيق الرسوم)              */}
      {/* ========================================================================= */}
      {filterTab === 'VIOLATIONS' && (
        <Grid container spacing={3}>
          {violations
            .filter((v) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                v.plateNumber.toLowerCase().includes(q) ||
                v.driverNameAr.toLowerCase().includes(q) ||
                v.violationCode.toLowerCase().includes(q)
              );
            })
            .map((rec) => (
              <Grid item xs={12} md={6} lg={4} key={rec.id}>
                <Card
                  sx={{
                    p: 3,
                    ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
                    border: `1.5px solid ${alpha(theme.palette.error.main, 0.4)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 16px 40px ${alpha(theme.palette.error.main, 0.2)}`,
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      label={rec.violationCode}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        bgcolor: alpha(theme.palette.error.main, 0.12),
                        color: theme.palette.error.main,
                      }}
                    />
                    <Chip
                      label={rec.status === 'Paid' ? 'تم التحصيل والسداد' : 'معلقة قيد التحصيل'}
                      size="small"
                      color={rec.status === 'Paid' ? 'success' : 'warning'}
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

                  {/* Plate Display */}
                  <Box sx={{ my: 1.5, display: 'flex', justifyContent: 'center' }}>
                    <SaudiRealisticPlate plateNumber={rec.plateNumber} size="sm" showBolts={false} interactive={false} />
                  </Box>

                  <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5, textAlign: 'center' }}>
                    {rec.vehicleMakeAr}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 2, textAlign: 'center' }}>
                    السائق: {rec.driverNameAr}
                  </Typography>

                  {/* Violation details summary */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      my: 2,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.8),
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  >
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          دقائق التجاوز
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.error.main }}>
                          تجاوز {rec.overstayMinutes} دقيقة
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          الرسوم المستحقة
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                          {rec.feeAmount}.00 ريال
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 0.8 }} />
                        <Typography variant="caption" color="text.secondary" display="block">
                          الدخول: {rec.entryTime} • الخروج: {rec.exitTime}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                          {rec.statusAr}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ReceiptLongIcon />}
                    onClick={() => setSelectedViolationModal(rec)}
                    sx={{ fontWeight: 800, borderRadius: 2.5 }}
                  >
                    تفاصيل الرصد وتذكرة المخالفة
                  </Button>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* 5. EXTENSION MODAL DIALOG (نافذة التمديد الاستثنائي لمهلة السماح)          */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(extendModalVehicle)}
        onClose={() => setExtendModalVehicle(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: isDark ? '#0B132B' : '#FFFFFF',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            p: 1,
          },
        }}
      >
        {extendModalVehicle && (
          <>
            <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddAlarmIcon sx={{ color: theme.palette.primary.main }} /> منح تمديد استثنائي لمهلة السماح
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                يمكن لمشرف المنظومة تمديد مهلة الخروج المجاني للمركبة ذات اللوحة ({extendModalVehicle.plateNumber}) في حالات التأخير الرسمية.
              </Typography>

              <TextField
                select
                label="المدة الإضافية الممنوحة"
                value={extensionMinutes}
                onChange={(e) => setExtensionMinutes(Number(e.target.value))}
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value={10}>10 دقائق إضافية</MenuItem>
                <MenuItem value={15}>15 دقيقة إضافية (موصى بها)</MenuItem>
                <MenuItem value={30}>30 دقيقة إضافية</MenuItem>
                <MenuItem value={60}>60 دقيقة (حالات طارئة)</MenuItem>
              </TextField>

              <TextField
                label="سبب ومنح التمديد"
                multiline
                rows={2}
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                fullWidth
              />
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button variant="outlined" onClick={() => setExtendModalVehicle(null)} sx={{ fontWeight: 800 }}>
                إلغاء
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={handleConfirmExtension}
                sx={{ fontWeight: 900 }}
              >
                تأكيد التمديد فوراً
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* 6. VIOLATION AUDIT RECEIPT MODAL (نافذة استعراض تذكرة التجاوز الرسمية)     */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedViolationModal)}
        onClose={() => setSelectedViolationModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: isDark ? '#0B132B' : '#FFFFFF',
            border: `1.5px solid ${alpha(theme.palette.error.main, 0.4)}`,
            overflow: 'hidden',
          },
        }}
      >
        {selectedViolationModal && (
          <>
            <DialogTitle
              sx={{
                p: 2.5,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <ReceiptLongIcon sx={{ color: theme.palette.error.main, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={900}>
                    إشعار وتذكرة تجاوز مهلة السماح الرسمية
                  </Typography>
                </Stack>
                <IconButton onClick={() => setSelectedViolationModal(null)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 3.5, textAlign: 'center' }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: theme.palette.primary.main, fontWeight: 900, fontSize: 13 }}>
                منظومة كايان الذكية NRI • الرصد الآلي عبر كاميرات LPR
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
                تذكرة احتساب رسوم تجاوز مهلة السماح
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                كود الإشعار: {selectedViolationModal.violationCode} • دقة الرصد: {selectedViolationModal.lprAccuracy}
              </Typography>

              {/* Plate */}
              <Box sx={{ my: 2.5, display: 'flex', justifyContent: 'center' }}>
                <SaudiRealisticPlate plateNumber={selectedViolationModal.plateNumber} size="md" showBolts={true} interactive={false} />
              </Box>

              {/* Breakdown Matrix */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  textAlign: 'right',
                }}
              >
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">اسم السائق</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedViolationModal.driverNameAr}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">طراز المركبة</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedViolationModal.vehicleMakeAr}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">وقت الدخول وبوابة العبور</Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {selectedViolationModal.entryGateAr} ({selectedViolationModal.entryTime})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">وقت الخروج الفعلي</Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {selectedViolationModal.exitGateAr} ({selectedViolationModal.exitTime})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">مهلة السماح الممنوحة</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: '#10B981' }}>
                      {selectedViolationModal.allowedGraceMinutes} دقيقة مجانية
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">مدة التجاوز المحسوبة</Typography>
                    <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.error.main }}>
                      {selectedViolationModal.overstayMinutes} دقيقة إضافية
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={900}>إجمالي الرسوم المطبقة:</Typography>
                      <Typography variant="h5" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                        {selectedViolationModal.feeAmount}.00 ريال سعودي
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 700, mt: 0.5, display: 'block' }}>
                      حالة السداد: {selectedViolationModal.statusAr}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{ fontWeight: 800, borderRadius: 2.5 }}
              >
                طباعة الإشعار
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSelectedViolationModal(null)}
                sx={{ fontWeight: 900, borderRadius: 2.5, px: 3 }}
              >
                إغلاق
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Global Snackbar */}
      <Snackbar
        open={Boolean(snackbarNotice)}
        autoHideDuration={4000}
        onClose={() => setSnackbarNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarNotice(null)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 800, borderRadius: 3, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
        >
          {snackbarNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GracePeriodPage;
