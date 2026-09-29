import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
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
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface DailyRevenueTrend {
  day: string;
  date: string;
  entries: number;
  exits: number;
  revenueSar: number;
  residentShare: number;
  visitorShare: number;
  guestShare: number;
}

const REVENUE_TRENDS: DailyRevenueTrend[] = [
  { day: 'السبت', date: '2026-09-23', entries: 2840, exits: 2790, revenueSar: 18450, residentShare: 1350, visitorShare: 1020, guestShare: 470 },
  { day: 'الأحد', date: '2026-09-24', entries: 3950, exits: 3880, revenueSar: 26800, residentShare: 1980, visitorShare: 1390, guestShare: 580 },
  { day: 'الإثنين', date: '2026-09-25', entries: 4120, exits: 4050, revenueSar: 28900, residentShare: 2060, visitorShare: 1460, guestShare: 600 },
  { day: 'الثلاثاء', date: '2026-09-26', entries: 3890, exits: 3820, revenueSar: 25400, residentShare: 1940, visitorShare: 1380, guestShare: 570 },
  { day: 'الأربعاء', date: '2026-09-27', entries: 4350, exits: 4280, revenueSar: 31200, residentShare: 2180, visitorShare: 1540, guestShare: 630 },
  { day: 'الخميس', date: '2026-09-28', entries: 4890, exits: 4810, revenueSar: 36700, residentShare: 2450, visitorShare: 1740, guestShare: 700 },
  { day: 'الجمعة', date: '2026-09-29', entries: 3150, exits: 3090, revenueSar: 21100, residentShare: 1570, visitorShare: 1110, guestShare: 470 },
];

export function ReportsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState('Month');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const reportTabs = [
    'التحليلات الشاملة للتدفقات والإيرادات',
    'تصنيف المستخدمين (مقيم / زائر / دعوة)',
    'قنوات الدفع والبنوك السعودية',
    'أداء الكاميرات وحساسات LPR',
  ];

  const maxRevenue = Math.max(...REVENUE_TRENDS.map((r) => r.revenueSar));
  const activeDay = hoveredDay !== null ? REVENUE_TRENDS[hoveredDay] : null;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header */}
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
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(0, 240, 255, 0.15))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}
            >
              <AssessmentIcon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                مركز التقارير والإحصائيات التحليلية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                لوحة ذكاء الأعمال (Business Intelligence) لمتابعة الإيرادات، كثافة المركبات، وتصنيف الزوار والمقيمين
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
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(240, 249, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderRadius: '10px',
                borderColor: 'rgba(56, 189, 248, 0.25)',
              },
            }}
          >
            <MenuItem value="Today">اليوم (Today)</MenuItem>
            <MenuItem value="Week">الأسبوع الحالي</MenuItem>
            <MenuItem value="Month">شهر سبتمبر 2026</MenuItem>
            <MenuItem value="Quarter">الربع الثالث Q3</MenuItem>
            <MenuItem value="Year">عام 2026 كاملاً</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{
              fontWeight: 800,
              borderRadius: '10px',
              borderColor: 'rgba(56, 189, 248, 0.3)',
              color: isDark ? '#38BDF8' : '#0284C7',
            }}
          >
            طباعة
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => setExportNotice('جاري إنشاء تقرير PDF و Excel المعتمد بالبيانات التفصيلية...')}
            sx={{
              fontWeight: 900,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
              color: '#080D1A',
              boxShadow: '0 4px 16px rgba(0, 240, 255, 0.35)',
            }}
          >
            تصدير تقرير معتمد (PDF/Excel)
          </Button>
        </Stack>
      </Stack>

      {/* Navigation Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3.5,
          '& .MuiTab-root': {
            fontWeight: 800,
            fontSize: 13.5,
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

      {/* KPI Highlight Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: 'إجمالي الحركات المسجلة',
            val: '27,190',
            unit: 'حركة',
            delta: '+16.4% مقارنة بالشهر السابق',
            color: '#00F0FF',
            icon: <DirectionsCarIcon />,
          },
          {
            title: 'الإيرادات المحصلة',
            val: '188,450',
            unit: 'SAR',
            delta: '98.5% تم تحصيلها عبر مدى و Apple Pay',
            color: '#10B981',
            icon: <MonetizationOnIcon />,
          },
          {
            title: 'متوسط مدة بقاء المركبة',
            val: '2.4',
            unit: 'ساعة',
            delta: 'معدل تدوير الموقف: 3.8 سيارات/يومياً',
            color: '#38BDF8',
            icon: <SpeedIcon />,
          },
          {
            title: 'دقة التعرف LPR اللحظية',
            val: '99.4%',
            unit: '',
            delta: 'زمن رفع الذراع: 0.4 ثانية بمعدل قياسي',
            color: '#A78BFA',
            icon: <CheckCircleIcon />,
          },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(kpi.color, 0.28)}`,
                boxShadow: isDark
                  ? `0 10px 30px rgba(0, 0, 0, 0.4)`
                  : `0 12px 34px rgba(14, 165, 233, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.95)`,
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
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
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

      {/* Master Spline Area Chart: Revenue & Traffic Flow */}
      <Card
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '18px',
          bgcolor: isDark ? 'rgba(11, 18, 32, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: isDark
            ? '0 16px 40px rgba(0, 0, 0, 0.5)'
            : '0 14px 40px rgba(14, 165, 233, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
          position: 'relative',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={900}>
              مخطط الإيرادات اليومية وتدفق المركبات (Weekly Trend)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              تحليل المقارنة بين حركة الدخول والخروج مقابل الإيراد المالي المحقق بالريال السعودي
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#00F0FF' }} />
              <Typography variant="caption" fontWeight={700}>الدخول</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#38BDF8' }} />
              <Typography variant="caption" fontWeight={700}>الخروج</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 18, height: 3, borderRadius: '2px', bgcolor: '#10B981' }} />
              <Typography variant="caption" fontWeight={700} sx={{ color: '#10B981' }}>
                الإيراد SAR
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* SVG Spline Chart */}
        <Box sx={{ position: 'relative', height: 260, pt: 2, pb: 4 }}>
          <svg
            viewBox="0 0 1000 220"
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

            {/* Spline Path */}
            <path
              d={REVENUE_TRENDS.map((r, i) => {
                const x = (i / (REVENUE_TRENDS.length - 1)) * 920 + 40;
                const y = 190 - (r.revenueSar / maxRevenue) * 150;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
            />

            {/* Area Fill */}
            <path
              d={
                REVENUE_TRENDS.map((r, i) => {
                  const x = (i / (REVENUE_TRENDS.length - 1)) * 920 + 40;
                  const y = 190 - (r.revenueSar / maxRevenue) * 150;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ') + ` L 960 190 L 40 190 Z`
              }
              fill="url(#revenueArea)"
            />

            {/* Points */}
            {REVENUE_TRENDS.map((r, i) => {
              const x = (i / (REVENUE_TRENDS.length - 1)) * 920 + 40;
              const y = 190 - (r.revenueSar / maxRevenue) * 150;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#10B981"
                  stroke="#FFF"
                  strokeWidth="2"
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
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 200ms ease',
                    }}
                  >
                    <Box
                      sx={{
                        width: '38%',
                        height: `${inHeight}px`,
                        bgcolor: '#00F0FF',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: isHovered ? '0 0 14px #00F0FF' : 'none',
                      }}
                    />
                    <Box
                      sx={{
                        width: '38%',
                        height: `${outHeight}px`,
                        bgcolor: '#38BDF8',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: isHovered ? '0 0 14px #38BDF8' : 'none',
                      }}
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      mt: 1.5,
                      fontSize: 11,
                      color: isHovered ? '#00F0FF' : 'text.secondary',
                    }}
                  >
                    {item.day}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Hover Details Floating Banner */}
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
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(8, 13, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: '1.5px solid #10B981',
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">يوم {activeDay.day}</Typography>
                <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#10B981' }}>
                  {activeDay.revenueSar.toLocaleString()} SAR
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
                  <Typography variant="caption" color="text.secondary">مقيمون / زوار</Typography>
                  <Typography variant="body2" fontWeight={900}>
                    {activeDay.residentShare} / {activeDay.visitorShare}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </Box>
      </Card>

      {/* Two Column Section: User Differentiation & Saudi Payment Methods */}
      <Grid container spacing={3}>
        {/* Left Column: Differentiating Resident vs Visitor vs Invited Guest */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              p: 3,
              borderRadius: '18px',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
              تصنيف التدفقات حسب فئة المستخدم (User Categorization)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              الفصل اللحظي بين المقيمين المشتركين، الزوار العابرين، وأصحاب الدعوات الخاصة
            </Typography>

            <Stack spacing={2.5}>
              {[
                {
                  label: 'المقيمون (Residents)',
                  share: 48,
                  count: '13,050 مركبة',
                  desc: 'اشتراكات شهرية وسنوية • دخول تلقائي عبر قراءة اللوحة LPR أو البطاقة الرقمية • مواقف محجوزة',
                  color: '#38BDF8',
                  icon: <CardMembershipIcon fontSize="small" />,
                },
                {
                  label: 'الزوار العابرون (Visitors)',
                  share: 34,
                  count: '9,240 مركبة',
                  desc: 'تذاكر ساعة ومواقف عامة • سداد لحظي عند الخروج عبر مدى أو Apple Pay • احتساب بالدقيقة',
                  color: '#10B981',
                  icon: <DirectionsCarIcon fontSize="small" />,
                },
                {
                  label: 'أصحاب الدعوات المصرحة (Invited Guests)',
                  share: 18,
                  count: '4,900 تصريح',
                  desc: 'تصاريح دخول QR صادرة من المقيمين • دخول مجاني مباشر • مسارات وبوابات محددة بوقت صلاحية',
                  color: '#A78BFA',
                  icon: <QrCode2Icon fontSize="small" />,
                },
              ].map((cat, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(11, 18, 32, 0.65)' : 'rgba(240, 249, 255, 0.75)',
                    border: `1px solid ${alpha(cat.color, 0.25)}`,
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

                  {/* Progress Bar */}
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: '4px',
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ width: `${cat.share}%`, height: '100%', bgcolor: cat.color }} />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {cat.desc}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Right Column: Saudi Payment Channels Breakdown */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              p: 3,
              borderRadius: '18px',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
              توزيع قنوات الدفع والتسويات البنكية السعودية
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              حجم العمليات المحصلة بالريال السعودي ومتوافقة مع نظام سداد وهيئة الزكاة (ZATCA)
            </Typography>

            <Stack spacing={2.5}>
              {[
                { name: 'مدى (Mada Debit / POS)', share: 58, amount: '109,301 SAR', color: '#10B981' },
                { name: 'Apple Pay (محفظة آبل الذكية)', share: 24, amount: '45,228 SAR', color: '#38BDF8' },
                { name: 'STC Pay (اس تي سي باي)', share: 12, amount: '22,614 SAR', color: '#A78BFA' },
                { name: 'تحويلات مصرف الإنماء والراجحي المباشرة', share: 6, amount: '11,307 SAR', color: '#F59E0B' },
              ].map((channel, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(11, 18, 32, 0.65)' : 'rgba(240, 249, 255, 0.75)',
                    border: `1px solid ${alpha(channel.color, 0.25)}`,
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

                  <Box
                    sx={{
                      height: 8,
                      borderRadius: '4px',
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ width: `${channel.share}%`, height: '100%', bgcolor: channel.color }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Export Confirmation Toast */}
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
