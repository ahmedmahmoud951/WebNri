import { useState, useMemo } from 'react';
import {
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
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';

// Material Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EvStationIcon from '@mui/icons-material/EvStation';
import VideocamIcon from '@mui/icons-material/Videocam';
import FenceIcon from '@mui/icons-material/Fence';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimerIcon from '@mui/icons-material/Timer';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';

import { glassPanel, glowPanel } from '../../app/theme';

interface DailyRevenueTrend {
  day: string;
  date: string;
  entries: number;
  exits: number;
  revenueSar: number;
  vatSar: number;
  residentShare: number;
  visitorShare: number;
  guestShare: number;
  evChargingSar: number;
}

const REVENUE_TRENDS: DailyRevenueTrend[] = [
  { day: 'السبت', date: '2026-09-23', entries: 2840, exits: 2790, revenueSar: 18450, vatSar: 2406, residentShare: 1350, visitorShare: 1020, guestShare: 470, evChargingSar: 1850 },
  { day: 'الأحد', date: '2026-09-24', entries: 3950, exits: 3880, revenueSar: 26800, vatSar: 3495, residentShare: 1980, visitorShare: 1390, guestShare: 580, evChargingSar: 2900 },
  { day: 'الإثنين', date: '2026-09-25', entries: 4120, exits: 4050, revenueSar: 28900, vatSar: 3769, residentShare: 2060, visitorShare: 1460, guestShare: 600, evChargingSar: 3200 },
  { day: 'الثلاثاء', date: '2026-09-26', entries: 3890, exits: 3820, revenueSar: 25400, vatSar: 3313, residentShare: 1940, visitorShare: 1380, guestShare: 570, evChargingSar: 2650 },
  { day: 'الأربعاء', date: '2026-09-27', entries: 4350, exits: 4280, revenueSar: 31200, vatSar: 4069, residentShare: 2180, visitorShare: 1540, guestShare: 630, evChargingSar: 3600 },
  { day: 'الخميس', date: '2026-09-28', entries: 4890, exits: 4810, revenueSar: 36700, vatSar: 4786, residentShare: 2450, visitorShare: 1740, guestShare: 700, evChargingSar: 4400 },
  { day: 'الجمعة', date: '2026-09-29', entries: 3150, exits: 3090, revenueSar: 21100, vatSar: 2752, residentShare: 1570, visitorShare: 1110, guestShare: 470, evChargingSar: 2100 },
];

interface HourlyTraffic {
  hour: string;
  entries: number;
  exits: number;
  isPeak: boolean;
}

const HOURLY_TRAFFIC: HourlyTraffic[] = [
  { hour: '06:00', entries: 85, exits: 20, isPeak: false },
  { hour: '07:00', entries: 420, exits: 60, isPeak: true },
  { hour: '08:00', entries: 680, exits: 90, isPeak: true },
  { hour: '09:00', entries: 490, exits: 140, isPeak: true },
  { hour: '10:00', entries: 280, exits: 190, isPeak: false },
  { hour: '11:00', entries: 210, exits: 230, isPeak: false },
  { hour: '12:00', entries: 350, exits: 380, isPeak: false },
  { hour: '13:00', entries: 320, exits: 410, isPeak: false },
  { hour: '14:00', entries: 260, exits: 520, isPeak: true },
  { hour: '15:00', entries: 210, exits: 480, isPeak: true },
  { hour: '16:00', entries: 310, exits: 390, isPeak: false },
  { hour: '17:00', entries: 520, exits: 310, isPeak: true },
  { hour: '18:00', entries: 610, exits: 340, isPeak: true },
  { hour: '19:00', entries: 480, exits: 420, isPeak: false },
  { hour: '20:00', entries: 390, exits: 460, isPeak: false },
  { hour: '21:00', entries: 290, exits: 510, isPeak: false },
  { hour: '22:00', entries: 180, exits: 390, isPeak: false },
  { hour: '23:00', entries: 90, exits: 240, isPeak: false },
];

export function ReportsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState('Month');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredHour, setHoveredHour] = useState<HourlyTraffic | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const reportTabs = [
    'التحليلات الشاملة للتدفقات والإيرادات',
    'تصنيف المستخدمين والاشتراكات',
    'بوابات الدفع والتسويات البنكية السعودية',
    'أداء الكاميرات وحساسات LPR والبوابات',
  ];

  const maxRevenue = Math.max(...REVENUE_TRENDS.map((r) => r.revenueSar));
  const activeDay = hoveredDay !== null ? REVENUE_TRENDS[hoveredDay] : null;

  // Aggregate Calculations
  const totalRevenue = useMemo(() => REVENUE_TRENDS.reduce((a, b) => a + b.revenueSar, 0), []);
  const totalVat = useMemo(() => REVENUE_TRENDS.reduce((a, b) => a + b.vatSar, 0), []);
  const totalEntries = useMemo(() => REVENUE_TRENDS.reduce((a, b) => a + b.entries, 0), []);
  const totalExits = useMemo(() => REVENUE_TRENDS.reduce((a, b) => a + b.exits, 0), []);
  const totalEvRevenue = useMemo(() => REVENUE_TRENDS.reduce((a, b) => a + b.evChargingSar, 0), []);

  return (
    <Box sx={{ pb: 8 }}>
      {/* 1. Page Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2.5}
        sx={{ mb: 4 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(0, 240, 255, 0.15))',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
              }}
            >
              <AssessmentIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                مركز التقارير والإحصائيات التحليلية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                منظومة ذكاء الأعمال المالي والتشغيلي المعتمدة لرصد الإيرادات، كثافة المركبات، وتوزيع بوابات الدفع والتسويات البنكية
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Action Controls */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <TextField
            select
            size="small"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{
              minWidth: 160,
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(240, 249, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                fontWeight: 800,
              },
            }}
          >
            <MenuItem value="Today">اليوم الحالي</MenuItem>
            <MenuItem value="Week">الأسبوع الحالي</MenuItem>
            <MenuItem value="Month">شهر سبتمبر 2026</MenuItem>
            <MenuItem value="Quarter">الربع السنوي Q3</MenuItem>
            <MenuItem value="Year">عام 2026 كاملاً</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{
              fontWeight: 800,
              borderRadius: '12px',
              px: 2,
            }}
          >
            طباعة فورية
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => setExportModalOpen(true)}
            sx={{
              fontWeight: 900,
              borderRadius: '12px',
              px: 2.5,
              background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
              color: '#080D1A',
              boxShadow: '0 4px 20px rgba(0, 240, 255, 0.4)',
            }}
          >
            تصدير تقرير معتمد (PDF/Excel)
          </Button>
        </Stack>
      </Stack>

      {/* 2. Navigation Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3.5,
          '& .MuiTab-root': {
            fontWeight: 800,
            fontSize: 14,
            color: 'text.secondary',
            '&.Mui-selected': { color: '#38BDF8' },
          },
          '& .MuiTabs-indicator': { bgcolor: '#38BDF8', height: 3, borderRadius: '2px' },
        }}
      >
        {reportTabs.map((tName, idx) => (
          <Tab key={idx} label={tName} />
        ))}
      </Tabs>

      {/* 3. Top KPI Telemetry Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: 'إجمالي التدفقات المسجلة',
            val: (totalEntries + totalExits).toLocaleString(),
            unit: 'حركة',
            delta: '+16.8% مقارنة بالشهر السابق',
            color: '#00F0FF',
            icon: <DirectionsCarIcon />,
          },
          {
            title: 'إجمالي الإيرادات المحصلة',
            val: totalRevenue.toLocaleString(),
            unit: 'ريال سعودي',
            delta: 'شاملة ضريبة القيمة المضافة 15%',
            color: '#10B981',
            icon: <MonetizationOnIcon />,
          },
          {
            title: 'ضريبة القيمة المضافة (ZATCA)',
            val: totalVat.toLocaleString(),
            unit: 'ريال سعودي',
            delta: 'فواتير ضريبية مبسطة ومطابقة 100%',
            color: '#F59E0B',
            icon: <ReceiptLongIcon />,
          },
          {
            title: 'إيرادات شواحن المركبات EV',
            val: totalEvRevenue.toLocaleString(),
            unit: 'ريال سعودي',
            delta: 'استهلاك 38,400 كيلوواط/ساعة',
            color: '#A855F7',
            icon: <FlashOnIcon />,
          },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                p: 2.5,
                ...glassPanel({ borderRadius: '18px' }, theme.palette.mode),
                border: `1px solid ${alpha(kpi.color, 0.35)}`,
                boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: kpi.color,
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {kpi.title}
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: alpha(kpi.color, 0.15),
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {kpi.icon}
                </Box>
              </Stack>

              <Typography variant="h3" fontWeight={900} sx={{ my: 1, color: kpi.color, letterSpacing: -0.5 }}>
                {kpi.val}{' '}
                {kpi.unit && (
                  <Typography component="span" variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {kpi.unit}
                  </Typography>
                )}
              </Typography>

              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800, display: 'block' }}>
                {kpi.delta}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ========================================================================= */}
      {/* TAB 0: FINANCIAL & TRAFFIC OVERVIEW (التحليلات الشاملة للتدفقات والإيرادات) */}
      {/* ========================================================================= */}
      {tab === 0 && (
        <Stack spacing={4}>
          {/* Master Spline Area Chart: Revenue & Traffic Flow */}
          <Card
            sx={{
              p: 3,
              ...glassPanel({ borderRadius: '20px' }, theme.palette.mode),
              border: '1px solid rgba(56, 189, 248, 0.3)',
              position: 'relative',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  مخطط الإيرادات اليومية ومصفوفة تدفق المركبات (Weekly Financial & Flow Spline)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  تحليل بياني مباشر لحركة الدخول والخروج اليومية مقابل الإيراد المالي المحقق بالريال السعودي
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#00F0FF' }} />
                  <Typography variant="caption" fontWeight={700}>حركات الدخول</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#38BDF8' }} />
                  <Typography variant="caption" fontWeight={700}>حركات الخروج</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 18, height: 3, borderRadius: '2px', bgcolor: '#10B981' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#10B981' }}>
                    الإيراد اليومي (SAR)
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {/* SVG Spline & Bar Chart Viewport */}
            <Box sx={{ position: 'relative', height: 280, pt: 2, pb: 4 }}>
              <svg
                viewBox="0 0 1000 230"
                preserveAspectRatio="none"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              >
                <defs>
                  <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="1000" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                {/* Spline Path */}
                <path
                  d={REVENUE_TRENDS.map((r, i) => {
                    const x = (i / (REVENUE_TRENDS.length - 1)) * 920 + 40;
                    const y = 195 - (r.revenueSar / maxRevenue) * 155;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.5"
                />

                {/* Gradient Fill under spline */}
                <path
                  d={
                    REVENUE_TRENDS.map((r, i) => {
                      const x = (i / (REVENUE_TRENDS.length - 1)) * 920 + 40;
                      const y = 195 - (r.revenueSar / maxRevenue) * 155;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ') + ` L 960 200 L 40 200 Z`
                  }
                  fill="url(#revenueAreaGrad)"
                />

                {/* Spline Anchor Points */}
                {REVENUE_TRENDS.map((r, i) => {
                  const x = (i / (REVENUE_TRENDS.length - 1)) * 920 + 40;
                  const y = 195 - (r.revenueSar / maxRevenue) * 155;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="5.5"
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                  );
                })}
              </svg>

              {/* Bar Columns Container */}
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: 2, px: 4, position: 'relative' }}>
                {REVENUE_TRENDS.map((item, idx) => {
                  const isHovered = hoveredDay === idx;
                  const inHeight = (item.entries / 5000) * 150;
                  const outHeight = (item.exits / 5000) * 150;

                  return (
                    <Box
                      key={idx}
                      onMouseEnter={() => setHoveredDay(idx)}
                      onMouseLeave={() => setHoveredDay(null)}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.75,
                          alignItems: 'flex-end',
                          width: '100%',
                          justifyContent: 'center',
                          transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                          transition: 'all 200ms ease',
                        }}
                      >
                        <Box
                          sx={{
                            width: '38%',
                            height: `${inHeight}px`,
                            bgcolor: '#00F0FF',
                            borderRadius: '4px 4px 0 0',
                            boxShadow: isHovered ? '0 0 16px #00F0FF' : 'none',
                          }}
                        />
                        <Box
                          sx={{
                            width: '38%',
                            height: `${outHeight}px`,
                            bgcolor: '#38BDF8',
                            borderRadius: '4px 4px 0 0',
                            boxShadow: isHovered ? '0 0 16px #38BDF8' : 'none',
                          }}
                        />
                      </Box>

                      <Typography
                        variant="caption"
                        fontWeight={800}
                        sx={{
                          mt: 1.5,
                          fontSize: 12,
                          color: isHovered ? '#00F0FF' : 'text.secondary',
                        }}
                      >
                        {item.day}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Floating Tooltip Banner on Hover */}
              {activeDay && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    px: 3,
                    py: 1.25,
                    borderRadius: '14px',
                    bgcolor: isDark ? 'rgba(8, 13, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: '1.5px solid #10B981',
                    boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      يوم {activeDay.day} ({activeDay.date})
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#10B981' }}>
                      {activeDay.revenueSar.toLocaleString()} ريال
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">دخول</Typography>
                      <Typography variant="body2" fontWeight={900} sx={{ color: '#00F0FF' }}>
                        {activeDay.entries.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">خروج</Typography>
                      <Typography variant="body2" fontWeight={900} sx={{ color: '#38BDF8' }}>
                        {activeDay.exits.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">شحن كهربائي</Typography>
                      <Typography variant="body2" fontWeight={900} sx={{ color: '#A855F7' }}>
                        {activeDay.evChargingSar.toLocaleString()} ريال
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Box>
          </Card>

          {/* Hourly Traffic Density Chart (ساعات الذروة المرورية) */}
          <Card sx={{ p: 3, ...glassPanel({ borderRadius: '20px' }, theme.palette.mode) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  توزيع كثافة المركبات على مدار ساعات اليوم (Hourly Peak Density)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  تحليل فترات الذروة الصباحية (7:00 - 9:00 ص) وفترات الذروة المسائية (4:00 - 6:00 م)
                </Typography>
              </Box>

              <Chip
                label="ساعات الذروة محددة باللون البرتقالي"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 160, gap: 1, px: 2, pt: 2 }}>
              {HOURLY_TRAFFIC.map((h, i) => {
                const total = h.entries + h.exits;
                const barHeight = Math.max(15, (total / 1000) * 110);
                const isHovered = hoveredHour?.hour === h.hour;

                return (
                  <Tooltip
                    key={i}
                    title={`${h.hour} • دخول: ${h.entries} | خروج: ${h.exits} (إجمالي: ${total})`}
                    arrow
                  >
                    <Box
                      onMouseEnter={() => setHoveredHour(h)}
                      onMouseLeave={() => setHoveredHour(null)}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{
                          width: '80%',
                          height: `${barHeight}px`,
                          bgcolor: h.isPeak ? '#F59E0B' : '#0284C7',
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.2s',
                          boxShadow: isHovered || h.isPeak ? `0 0 12px ${h.isPeak ? '#F59E0B' : '#0284C7'}` : 'none',
                          transform: isHovered ? 'scaleY(1.15)' : 'none',
                        }}
                      />
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, mt: 0.8, color: 'text.secondary' }}>
                        {h.hour.split(':')[0]}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Card>
        </Stack>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: USER DIFFERENTIATION & COHORTS (تصنيف المستخدمين والاشتراكات) */}
      {/* ========================================================================= */}
      {tab === 1 && (
        <Grid container spacing={3}>
          {/* User Categorization Highlights */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, ...glassPanel({ borderRadius: '20px' }, theme.palette.mode), height: '100%' }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                توزيع التدفقات حسب فئة وتصريح المستخدم
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                الفصل الدقيق بين المقيمين المشتركين، الزوار العابرين، وأصحاب الدعوات الخاصة
              </Typography>

              <Stack spacing={2.5}>
                {[
                  {
                    label: 'السكان والمقيمون الدائمون',
                    share: 48,
                    count: '13,050 مركبة',
                    desc: 'اشتراكات سنوية وشهرية مؤتمتة • دخول حر بالتعرف على اللوحة LPR • مواقف مخصصة',
                    color: '#38BDF8',
                    icon: <CardMembershipIcon fontSize="small" />,
                  },
                  {
                    label: 'الزوار العابرون ومواقف الساعة',
                    share: 34,
                    count: '9,240 مركبة',
                    desc: 'سداد فوري عند الخروج عبر مدى أو Apple Pay • احتساب بالدقيقة مع فترة سماح 15 دقيقة',
                    color: '#10B981',
                    icon: <DirectionsCarIcon fontSize="small" />,
                  },
                  {
                    label: 'أصحاب تصاريح الدعوات الذكية',
                    share: 18,
                    count: '4,900 تصريح',
                    desc: 'تصاريح رقمية عبر باركود QR صالحة لزيارة واحدة صادرة من المقيمين',
                    color: '#A855F7',
                    icon: <QrCode2Icon fontSize="small" />,
                  },
                ].map((cat, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: isDark ? 'rgba(11, 18, 32, 0.65)' : 'rgba(240, 249, 255, 0.75)',
                      border: `1px solid ${alpha(cat.color, 0.3)}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: cat.color }}>{cat.icon}</Box>
                        <Typography variant="subtitle2" fontWeight={900}>
                          {cat.label}
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label={`${cat.share}% (${cat.count})`}
                        sx={{ bgcolor: alpha(cat.color, 0.15), color: cat.color, fontWeight: 900 }}
                      />
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={cat.share}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        mb: 1,
                        '& .MuiLinearProgress-bar': { bgcolor: cat.color },
                      }}
                    />

                    <Typography variant="caption" color="text.secondary">
                      {cat.desc}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>

          {/* User Metrics Deep Dive */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, ...glassPanel({ borderRadius: '20px' }, theme.palette.mode), height: '100%' }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                مؤشرات سلوك واستخدام المواقف
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                متوسط فترات البقاء، التكرار، والإنفاق لكل فئة مستخدم
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>الفئة</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>متوسط البقاء</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>معدل التردد</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>متوسط الفاتورة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { type: 'المقيمون والمشتركون', stay: '8.4 ساعات', freq: '2.1 مرة/يومياً', avg: 'اشتراك شهري 450 ريال' },
                      { type: 'زوار المواقف العامة', stay: '2.2 ساعة', freq: '3.4 مرات/شهرياً', avg: '28.5 ريال' },
                      { type: 'تصاريح الضيوف QR', stay: '3.6 ساعات', freq: 'مرة واحدة', avg: 'مجاني برعاية المضيف' },
                      { type: 'مستخدمو شواحن EV', stay: '45 دقيقة', freq: '4 مرات/أسبوعياً', avg: '68.0 ريال' },
                      { type: 'مركبات كبار الشخصيات', stay: '4.8 ساعات', freq: 'يومي', avg: 'باقة تشريفية خاصة' },
                    ].map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 800 }}>{row.type}</TableCell>
                        <TableCell>{row.stay}</TableCell>
                        <TableCell>{row.freq}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.primary.main }}>{row.avg}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SAUDI PAYMENT GATEWAYS & SAMA (بوابات الدفع والتسويات البنكية) */}
      {/* ========================================================================= */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, ...glassPanel({ borderRadius: '20px' }, theme.palette.mode), height: '100%' }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                توزيع قنوات الدفع والتسويات البنكية السعودية
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                حجم العمليات المحصلة بالريال السعودي ومتوافقة مع البنك المركزي السعودي (SAMA) وهيئة الزكاة (ZATCA)
              </Typography>

              <Stack spacing={2.5}>
                {[
                  { name: 'مدى (Mada Debit / POS)', share: 58, amount: '109,301 ريال', fee: '0.8%', color: '#10B981' },
                  { name: 'Apple Pay (محفظة آبل الذكية)', share: 24, amount: '45,228 ريال', fee: '1.1%', color: '#38BDF8' },
                  { name: 'STC Pay (اس تي سي باي)', share: 12, amount: '22,614 ريال', fee: '1.0%', color: '#A855F7' },
                  { name: 'البطاقات الائتمانية والتحويل المباشر', share: 6, amount: '11,307 ريال', fee: '1.8%', color: '#F59E0B' },
                ].map((channel, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: isDark ? 'rgba(11, 18, 32, 0.65)' : 'rgba(240, 249, 255, 0.75)',
                      border: `1px solid ${alpha(channel.color, 0.3)}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {channel.name}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={900} sx={{ color: channel.color }}>
                        {channel.amount} ({channel.share}%)
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={channel.share}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        mb: 1,
                        '& .MuiLinearProgress-bar': { bgcolor: channel.color },
                      }}
                    />

                    <Typography variant="caption" color="text.secondary">
                      عمولة البوابة البنكية: {channel.fee} • تسوية يومية مباشرة لحساب المنشأة
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>

          {/* SAMA & ZATCA Compliance Summary */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3, ...glassPanel({ borderRadius: '20px' }, theme.palette.mode), height: '100%' }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                شهادات الامتثال المالي والضريبي
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                التدقيق الآلي والربط المباشر مع المنظومات الحكومية المالية بالمملكة
              </Typography>

              <Stack spacing={2}>
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha('#10B981', 0.1), border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <VerifiedIcon sx={{ color: '#10B981' }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#10B981' }}>
                        الفوترة الإلكترونية (ZATCA Phase 2)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        إصدار أرقام فواتير ضريبية مشفرة بختم التشفير الرقمي والباركود المشفر (TLV Base64) بنسبة تطابق 100%.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha('#38BDF8', 0.1), border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <SecurityIcon sx={{ color: '#38BDF8' }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#38BDF8' }}>
                        معايير البنك المركزي السعودي (SAMA Cyber Security Framework)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        تشفير بيانات البطاقات المصرفية وفق معيار PCI-DSS المستوى الأول دون حفظ أي بيانات بنكية حساسة.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha('#F59E0B', 0.1), border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AccountBalanceIcon sx={{ color: '#F59E0B' }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#F59E0B' }}>
                        التسويات البنكية المباشرة (Direct Bank Settlement)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        تحويل الإيرادات اليومية تلقائياً بحسابات مصرف الراجحي، البنك الأهلي السعودي، ومصرف الإنماء مع كشوفات إيداع يومية.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HARDWARE TELEMETRY & CAMERAS (أداء الكاميرات وحساسات LPR والبوابات) */}
      {/* ========================================================================= */}
      {tab === 3 && (
        <Card sx={{ p: 3, ...glassPanel({ borderRadius: '20px' }, theme.palette.mode) }}>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
            سجل كفاءة كاميرات الرصد البصري LPR والحواجز الذكية
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            قياس دقة استخراج الأحرف، سرعة الاستجابة الميكانيكية، وعدد دورات التشغيل لكل بوابة
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>الكاميرا والبوابة</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>المسار والاتجاه</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>دقة OCR</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>متوسط زمن الاستجابة</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>سرعة رفع الحاجز</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>إجمالي المسحات اليومية</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>الحالة الفنية</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { name: 'كاميرا الرصد الشمالية 4K (CAM-N01-IN)', gate: 'بوابة الشمال 1', lane: 'دخول سريع', acc: '99.8%', lat: '62ms', barrier: '0.4s', scans: '4,890', status: 'متصل ومؤمّن' },
                  { name: 'كاميرا المخرج الشمالي (CAM-N02-OUT)', gate: 'بوابة الشمال 1', lane: 'خروج ذاتي', acc: '99.5%', lat: '68ms', barrier: '0.4s', scans: '4,750', status: 'متصل ومؤمّن' },
                  { name: 'كاميرا المنصة التشريفية (CAM-VIP-01)', gate: 'بوابة كبار الشخصيات', lane: 'مسار تشريفي', acc: '99.9%', lat: '54ms', barrier: '0.3s', scans: '1,420', status: 'متصل ومؤمّن' },
                  { name: 'كاميرا المدخل الجنوبي (CAM-S01-IN)', gate: 'بوابة الجنوب 2', lane: 'دخول عام', acc: '99.4%', lat: '72ms', barrier: '0.5s', scans: '3,840', status: 'متصل ومؤمّن' },
                  { name: 'كاميرا المخرج الجنوبي (CAM-S02-OUT)', gate: 'بوابة الجنوب 2', lane: 'خروج ودفع', acc: '99.1%', lat: '74ms', barrier: '0.4s', scans: '3,780', status: 'متصل ومؤمّن' },
                  { name: 'كاميرا بوابة الشرق (CAM-E01-IN)', gate: 'بوابة الشرق 3', lane: 'شحن وتوريد', acc: '98.8%', lat: '82ms', barrier: '0.6s', scans: '2,110', status: 'متصل ومؤمّن' },
                ].map((row, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 800 }}>{row.name}</TableCell>
                    <TableCell>{row.gate} • {row.lane}</TableCell>
                    <TableCell>
                      <Chip label={row.acc} size="small" color="primary" sx={{ fontWeight: 800 }} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.lat}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#10B981' }}>{row.barrier}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{row.scans}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                        label={row.status}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* 4. Export Report Confirmation Modal */}
      <Dialog
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
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
              <DownloadIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                تصدير التقرير التحليلي المعتمد
              </Typography>
              <Typography variant="caption" color="text.secondary">
                إنشاء ملفات البيانات الرسمية الشاملة لكافة العمليات المالية والتشغيلية
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info" sx={{ borderRadius: '12px', fontWeight: 700 }}>
              يتضمن التقرير المعتمد كشوفات الحسابات البنكية، إقرارات ضريبة القيمة المضافة ZATCA، وإحصائيات بوابات LPR.
            </Alert>

            <Typography variant="subtitle2" fontWeight={800}>
              حدد صيغة التصدير المطلوبة:
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setExportModalOpen(false);
                    setExportNotice('تم إنشاء وتحميل ملف التقرير بصيغة PDF المعتمد بنجاح!');
                  }}
                  sx={{ p: 2, borderRadius: '12px', fontWeight: 800, flexDirection: 'column', gap: 1 }}
                >
                  <Typography variant="h6">📄 PDF</Typography>
                  <Typography variant="caption" color="text.secondary">تقرير مصور عالي الدقة</Typography>
                </Button>
              </Grid>

              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setExportModalOpen(false);
                    setExportNotice('تم تصدير جداول البيانات بصيغة Excel (XLSX) بنجاح!');
                  }}
                  sx={{ p: 2, borderRadius: '12px', fontWeight: 800, flexDirection: 'column', gap: 1 }}
                >
                  <Typography variant="h6">📊 Excel</Typography>
                  <Typography variant="caption" color="text.secondary">جداول حسابية كاملة</Typography>
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setExportModalOpen(false)}
            variant="text"
            sx={{ fontWeight: 800 }}
          >
            إلغاء
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Confirmation Snackbar */}
      <Snackbar
        open={Boolean(exportNotice)}
        autoHideDuration={4000}
        onClose={() => setExportNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setExportNotice(null)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 800, bgcolor: '#10B981', color: '#FFF' }}
        >
          {exportNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
