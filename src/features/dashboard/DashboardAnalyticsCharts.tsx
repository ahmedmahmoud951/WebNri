import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

// Icons
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import SpeedIcon from '@mui/icons-material/Speed';
import BarChartIcon from '@mui/icons-material/BarChart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import StarIcon from '@mui/icons-material/Star';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BoltIcon from '@mui/icons-material/Bolt';
import FenceIcon from '@mui/icons-material/Fence';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { glassPanel } from '../../app/theme';

interface DashboardAnalyticsChartsProps {
  totalCapacity?: number;
  occupied?: number;
  available?: number;
  occupancyPercentage?: number;
  todayEntries?: number;
  todayExits?: number;
}

export function DashboardAnalyticsCharts({
  totalCapacity = 500,
  occupied = 160,
  available = 340,
  occupancyPercentage = 32.0,
  todayEntries = 382,
  todayExits = 245,
}: DashboardAnalyticsChartsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [hoveredPayment, setHoveredPayment] = useState<number | null>(null);
  const [hoveredGate, setHoveredGate] = useState<number | null>(null);

  // Hourly traffic simulation points (24 hours: 00:00 to 23:00)
  const HOURLY_DATA = [
    { hour: '00:00', inCount: 8, outCount: 15 },
    { hour: '02:00', inCount: 4, outCount: 9 },
    { hour: '04:00', inCount: 3, outCount: 5 },
    { hour: '06:00', inCount: 22, outCount: 6 },
    { hour: '08:00', inCount: 78, outCount: 12 }, // Morning Rush
    { hour: '10:00', inCount: 45, outCount: 28 },
    { hour: '12:00', inCount: 38, outCount: 42 },
    { hour: '14:00', inCount: 52, outCount: 68 }, // Midday Exit
    { hour: '16:00', inCount: 65, outCount: 55 },
    { hour: '18:00', inCount: 84, outCount: 40 }, // Evening Rush
    { hour: '20:00', inCount: 58, outCount: 62 },
    { hour: '22:00', inCount: 25, outCount: 48 },
  ];

  const maxVal = 95;
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Build SVG path points
  const inPoints = HOURLY_DATA.map((d, i) => {
    const x = paddingX + (i / (HOURLY_DATA.length - 1)) * chartW;
    const y = svgHeight - paddingY - (d.inCount / maxVal) * chartH;
    return { x, y, data: d };
  });

  const outPoints = HOURLY_DATA.map((d, i) => {
    const x = paddingX + (i / (HOURLY_DATA.length - 1)) * chartW;
    const y = svgHeight - paddingY - (d.outCount / maxVal) * chartH;
    return { x, y, data: d };
  });

  const createCurvedPath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = a[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (p.x - prev.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
    }, '');
  };

  const inLinePath = createCurvedPath(inPoints);
  const outLinePath = createCurvedPath(outPoints);

  const inAreaPath = `${inLinePath} L ${inPoints[inPoints.length - 1].x},${svgHeight - paddingY} L ${inPoints[0].x},${svgHeight - paddingY} Z`;
  const outAreaPath = `${outLinePath} L ${outPoints[outPoints.length - 1].x},${svgHeight - paddingY} L ${outPoints[0].x},${svgHeight - paddingY} Z`;

  // Radial Gauge calculations
  const radius = 68;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancyPercentage / 100) * circumference;

  // =========================================================================
  // MATHEMATICALLY VERIFIED SAUDI PAYMENT DISTRIBUTION (MATCHING 245 EXITS)
  // =========================================================================
  const SAUDI_PAYMENT_METHODS = [
    {
      id: 'mada',
      label: 'شبكة مدى الوطنية (Mada)',
      short: 'مدى Mada',
      percent: 56,
      count: 137,
      amount: '13,916.00 ر.س',
      avgFee: '28.00 ر.س',
      color: '#00A86B',
      glow: 'rgba(0, 168, 107, 0.45)',
    },
    {
      id: 'apple',
      label: 'أبل باي (Apple Pay)',
      short: 'Apple Pay',
      percent: 28,
      count: 68,
      amount: '6,958.00 ر.س',
      avgFee: '32.50 ر.س',
      color: '#38BDF8',
      glow: 'rgba(56, 189, 248, 0.45)',
    },
    {
      id: 'stc',
      label: 'إس تي سي باي (STC Pay)',
      short: 'STC Pay',
      percent: 11,
      count: 27,
      amount: '2,733.50 ر.س',
      avgFee: '26.00 ر.س',
      color: '#A855F7',
      glow: 'rgba(168, 85, 247, 0.45)',
    },
    {
      id: 'cards',
      label: 'البطاقات البنكية (Visa / MC)',
      short: 'Visa / MC',
      percent: 5,
      count: 13,
      amount: '1,242.50 ر.س',
      avgFee: '34.00 ر.س',
      color: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.45)',
    },
  ];
  // Total operations = 137 + 68 + 27 + 13 = 245 operations! (Exact match to todayExits = 245)
  // Total collection = 13,916 + 6,958 + 2,733.50 + 1,242.50 = 24,850.00 ر.س

  // Donut Arc calculations
  const donutR = 64;
  const donutCirc = 2 * Math.PI * donutR; // ~ 402.12
  let accumulatedOffset = 0;
  const paymentSlices = SAUDI_PAYMENT_METHODS.map((pm) => {
    const strokeLen = (pm.percent / 100) * donutCirc;
    const offset = -accumulatedOffset;
    accumulatedOffset += strokeLen;
    return { ...pm, strokeLen, offset };
  });

  // =========================================================================
  // MATHEMATICALLY VERIFIED GATE CROSSINGS DENSITY (MATCHING 382 IN + 245 OUT = 627)
  // =========================================================================
  const GATE_DENSITY_DATA = [
    {
      id: 'north',
      name: 'بوابة الشمال 1 (المدخل الرئيسي)',
      role: 'المدخل الشرياني الأكبر للموظفين والمقيمين',
      inCount: 142,
      outCount: 68,
      totalCount: 210,
      sharePct: 33.5,
      loadPct: 75,
      time: '0.8s',
      status: 'تدفق سلس',
      color: '#00F0FF',
      glow: 'rgba(0, 240, 255, 0.45)',
    },
    {
      id: 'south',
      name: 'بوابة الجنوب 2 (المخرج السريع)',
      role: 'مسار التفريغ الرئيسي والمغادرة بدون توقف',
      inCount: 92,
      outCount: 112,
      totalCount: 204,
      sharePct: 32.5,
      loadPct: 72,
      time: '0.7s',
      status: 'تسوية آلية فورية',
      color: '#38BDF8',
      glow: 'rgba(56, 189, 248, 0.45)',
    },
    {
      id: 'east',
      name: 'بوابة الشرق 3 (بوابة الزوار والخدمات)',
      role: 'تصاريح الزوار والشحن اللوجستي الذكي',
      inCount: 98,
      outCount: 45,
      totalCount: 143,
      sharePct: 22.8,
      loadPct: 51,
      time: '0.9s',
      status: 'تحقق رقمي ذكي',
      color: '#A855F7',
      glow: 'rgba(168, 85, 247, 0.45)',
    },
    {
      id: 'vip',
      name: 'بوابة VIP التنفيذية (المسار الذكي)',
      role: 'مسار كبار الشخصيات والدبلوماسيين',
      inCount: 50,
      outCount: 20,
      totalCount: 70,
      sharePct: 11.2,
      loadPct: 25,
      time: '0.4s',
      status: 'فتح استباقي LPR',
      color: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.45)',
    },
  ];
  // Total in: 142 + 92 + 98 + 50 = 382
  // Total out: 68 + 112 + 45 + 20 = 245
  // Total crossings = 210 + 204 + 143 + 70 = 627 crossings

  return (
    <Box sx={{ width: '100%', my: 3.5 }}>
      <Grid container spacing={2.5}>
        {/* =========================================================================
            CHART 1: HOURLY FLOW SPLINE AREA CHART (24 HOURS)
        ========================================================================= */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              height: '100%',
              ...glassPanel({
                background: isDark
                  ? 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.9) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                boxShadow: isDark
                  ? '0 0 25px rgba(0, 240, 255, 0.1), 0 20px 40px rgba(5, 8, 17, 0.55)'
                  : '0 12px 35px rgba(14, 165, 233, 0.15)',
              }),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ShowChartIcon sx={{ color: '#00F0FF', fontSize: 22 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      معدل التدفق والحركة اللحظية للمركبات (24 ساعة)
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    تحليل تدفق الدخول (قراءات LPR) مقابل الخروج عبر البوابات الذكية
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      مركبات داخلة ({todayEntries})
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      مركبات مغادرة ({todayExits})
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              {/* Responsive SVG Area Chart */}
              <Box sx={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                  <defs>
                    <linearGradient id="inGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="outGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = svgHeight - paddingY - ratio * chartH;
                    return (
                      <g key={idx}>
                        <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="rgba(30, 58, 95, 0.45)" strokeDasharray="3 3" />
                        <text x={paddingX - 8} y={y + 3} fill="#64748B" fontSize="9" textAnchor="end" fontFamily="Cairo, sans-serif">
                          {Math.round(ratio * maxVal)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fills */}
                  <path d={outAreaPath} fill="url(#outGradient)" />
                  <path d={inAreaPath} fill="url(#inGradient)" />

                  {/* Spline Lines */}
                  <path d={outLinePath} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeOpacity="0.85" />
                  <path d={inLinePath} fill="none" stroke="#00F0FF" strokeWidth="3" filter="url(#glow)" />

                  {/* Interactive Points */}
                  {inPoints.map((p, idx) => (
                    <g key={`in-${idx}`}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredHour === idx ? 6 : 4}
                        fill="#00F0FF"
                        stroke="#0B1220"
                        strokeWidth="2"
                        style={{ cursor: 'pointer', transition: 'all 180ms ease' }}
                        onMouseEnter={() => setHoveredHour(idx)}
                        onMouseLeave={() => setHoveredHour(null)}
                      />
                      {/* X-axis labels */}
                      <text x={p.x} y={svgHeight - 10} fill="#94A3B8" fontSize="10" textAnchor="middle" fontWeight="600" fontFamily="Cairo, sans-serif">
                        {p.data.hour}
                      </text>
                    </g>
                  ))}

                  {/* Hover Tooltip Overlay */}
                  {hoveredHour !== null && (
                    <g transform={`translate(${inPoints[hoveredHour].x - 55}, ${Math.min(inPoints[hoveredHour].y, outPoints[hoveredHour].y) - 50})`}>
                      <rect width="110" height="44" rx="8" fill="#0B1220" stroke="#00F0FF" strokeWidth="1" opacity="0.95" />
                      <text x="55" y="16" fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Cairo, sans-serif">
                        الساعة {HOURLY_DATA[hoveredHour].hour}
                      </text>
                      <text x="55" y="32" fill="#00F0FF" fontSize="9" textAnchor="middle" fontFamily="Cairo, sans-serif">
                        دخول: {HOURLY_DATA[hoveredHour].inCount} | خروج: {HOURLY_DATA[hoveredHour].outCount}
                      </text>
                    </g>
                  )}
                </svg>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* =========================================================================
            CHART 2: LIVE CAPACITY RADIAL GAUGE & ZONE HIGHLIGHTS
        ========================================================================= */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              height: '100%',
              ...glassPanel({
                background: isDark
                  ? 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.9) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                boxShadow: isDark
                  ? '0 0 25px rgba(0, 240, 255, 0.1), 0 20px 40px rgba(5, 8, 17, 0.55)'
                  : '0 12px 35px rgba(14, 165, 233, 0.15)',
              }),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <SpeedIcon sx={{ color: '#38BDF8', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  مؤشر الإشغال والسعة الحية
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                السعة الكلية: {totalCapacity} موقف ذكي مراقب
              </Typography>

              {/* Radial Dial */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1, position: 'relative' }}>
                <svg width="170" height="170" viewBox="0 0 170 170">
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="rgba(30, 58, 95, 0.5)"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke={occupancyPercentage > 85 ? '#FB7185' : occupancyPercentage > 60 ? '#FBBF24' : '#00F0FF'}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    transform="rotate(-90 85 85)"
                  />
                </svg>

                {/* Inner Text */}
                <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', lineHeight: 1 }}>
                    {occupancyPercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700, mt: 0.5, display: 'block' }}>
                    نسبة الإشغال الكلي
                  </Typography>
                </Box>
              </Box>

              {/* Sub-metrics */}
              <Stack spacing={1.2} sx={{ mt: 2 }}>
                <Box sx={{ p: 1.2, px: 2, borderRadius: '10px', bgcolor: isDark ? 'rgba(10, 16, 28, 0.6)' : 'rgba(240, 253, 244, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DirectionsCarIcon sx={{ color: '#34D399', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>مواقف متاحة الآن</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: '#34D399', fontWeight: 900 }}>{available} موقف</Typography>
                </Box>

                <Box sx={{ p: 1.2, px: 2, borderRadius: '10px', bgcolor: isDark ? 'rgba(10, 16, 28, 0.6)' : 'rgba(254, 243, 199, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StarIcon sx={{ color: '#FBBF24', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>مواقف محجوزة مسبقاً</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: '#F59E0B', fontWeight: 900 }}>23 موقف</Typography>
                </Box>

                <Box sx={{ p: 1.2, px: 2, borderRadius: '10px', bgcolor: isDark ? 'rgba(10, 16, 28, 0.6)' : 'rgba(240, 249, 255, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EvStationIcon sx={{ color: '#00F0FF', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>شواحن EV الكهربائية</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: '#00F0FF', fontWeight: 900 }}>12 متاح (من 16)</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* =========================================================================
            CHART 3: SAUDI PAYMENT GATEWAYS REVENUE (ICONIC DONUT + LIVE SETTLEMENT)
        ========================================================================= */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              position: 'relative',
              ...glassPanel({
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(16, 26, 44, 0.92) 0%, rgba(10, 16, 28, 0.85) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.85) 100%)',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                boxShadow: isDark
                  ? '0 0 30px rgba(16, 185, 129, 0.12), 0 20px 45px rgba(5, 8, 16, 0.65)'
                  : '0 12px 35px rgba(16, 185, 129, 0.15)',
              }),
            }}
          >
            {/* Top Accent Line */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3.5px',
                background: 'linear-gradient(90deg, #00A86B, #38BDF8, #A855F7, #F59E0B)',
                boxShadow: '0 0 10px rgba(0, 168, 107, 0.5)',
              }}
            />

            <CardContent sx={{ p: 2.5 }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: 'rgba(0, 168, 107, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00A86B',
                      border: '1px solid rgba(0, 168, 107, 0.35)',
                    }}
                  >
                    <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      توزيع الإيرادات عبر بوابات الدفع السعودية
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      مطابقة مالية لحظية مع البنك المركزي السعودي (SAMA)
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label="245 عملية تسوية"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 168, 107, 0.15)',
                    color: '#00A86B',
                    border: '1px solid rgba(0, 168, 107, 0.4)',
                    fontWeight: 800,
                  }}
                />
              </Stack>

              {/* Graphic Layout: Left SVG Donut + Right Detailed Cards */}
              <Grid container spacing={2} alignItems="center">
                {/* SVG Segmented Donut Chart */}
                <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative', width: 170, height: 170 }}>
                    <svg width="170" height="170" viewBox="0 0 170 170">
                      <defs>
                        <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2.5" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Track Background */}
                      <circle
                        cx="85"
                        cy="85"
                        r={donutR}
                        fill="none"
                        stroke="rgba(30, 58, 95, 0.45)"
                        strokeWidth="15"
                      />

                      {/* Slices */}
                      {paymentSlices.map((slice, idx) => {
                        const isHover = hoveredPayment === idx;
                        return (
                          <circle
                            key={slice.id}
                            cx="85"
                            cy="85"
                            r={donutR}
                            fill="none"
                            stroke={slice.color}
                            strokeWidth={isHover ? 18 : 14}
                            strokeDasharray={`${Math.max(slice.strokeLen - 3, 1)} ${donutCirc}`}
                            strokeDashoffset={slice.offset}
                            strokeLinecap="round"
                            transform="rotate(-90 85 85)"
                            filter={isHover ? 'url(#donutGlow)' : undefined}
                            style={{
                              cursor: 'pointer',
                              transition: 'stroke-width 200ms ease, opacity 200ms ease',
                              opacity: hoveredPayment === null || isHover ? 1 : 0.6,
                            }}
                            onMouseEnter={() => setHoveredPayment(idx)}
                            onMouseLeave={() => setHoveredPayment(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Donut Center Label */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <Typography sx={{ fontSize: 13, lineHeight: 1, mb: 0.3 }}>🇸🇦</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                        24,850
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, fontWeight: 700 }}>
                        ريال سعودي
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Right: Payment Method Breakdown Cards */}
                <Grid item xs={12} sm={7}>
                  <Stack spacing={1}>
                    {SAUDI_PAYMENT_METHODS.map((pm, idx) => {
                      const isHover = hoveredPayment === idx;
                      return (
                        <Box
                          key={pm.id}
                          onMouseEnter={() => setHoveredPayment(idx)}
                          onMouseLeave={() => setHoveredPayment(null)}
                          sx={{
                            p: 1.2,
                            px: 1.5,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            bgcolor: isHover
                              ? alpha(pm.color, isDark ? 0.15 : 0.1)
                              : isDark ? 'rgba(10, 16, 28, 0.6)' : 'rgba(240, 249, 255, 0.7)',
                            border: `1px solid ${isHover ? pm.color : 'rgba(56, 189, 248, 0.18)'}`,
                            boxShadow: isHover ? `0 0 14px ${pm.glow}` : 'none',
                            transition: 'all 180ms ease',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: pm.color, boxShadow: `0 0 6px ${pm.color}` }} />
                              <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 12 }}>
                                {pm.short}
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                                {pm.count} عملية ({pm.percent}%)
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 900, color: pm.color, fontSize: 12 }}>
                                {pm.amount}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Progress line */}
                          <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: 'rgba(30, 58, 95, 0.4)', mt: 0.8, overflow: 'hidden' }}>
                            <Box
                              sx={{
                                width: `${pm.percent}%`,
                                height: '100%',
                                borderRadius: 2,
                                bgcolor: pm.color,
                                boxShadow: `0 0 8px ${pm.color}`,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Grid>
              </Grid>

              {/* Bottom Summary Footer */}
              <Box
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: '1px dashed rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  إجمالي التحصيل اليومي: 24,850.00 ر.س
                </Typography>
                <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                  مطابقة 100% مع 245 حركة خروج
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* =========================================================================
            CHART 4: GATE THROUGHPUT & BARRIER DENSITY (627 CROSSINGS MATRIX)
        ========================================================================= */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              position: 'relative',
              ...glassPanel({
                borderRadius: '20px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(16, 26, 44, 0.92) 0%, rgba(10, 16, 28, 0.85) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.85) 100%)',
                border: '1.5px solid rgba(0, 240, 255, 0.35)',
                boxShadow: isDark
                  ? '0 0 30px rgba(0, 240, 255, 0.12), 0 20px 45px rgba(5, 8, 16, 0.65)'
                  : '0 12px 35px rgba(14, 165, 233, 0.15)',
              }),
            }}
          >
            {/* Top Accent Line */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3.5px',
                background: 'linear-gradient(90deg, #00F0FF, #38BDF8, #A855F7, #F59E0B)',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
              }}
            />

            <CardContent sx={{ p: 2.5 }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: 'rgba(0, 240, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00F0FF',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                    }}
                  >
                    <FenceIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      كثافة العبور عبر البوابات والحواجز الذكية
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      متوسط سرعة استجابة وفتح الحواجز: 0.7 ثانية
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label="627 عبور كلي"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 240, 255, 0.15)',
                    color: '#00F0FF',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    fontWeight: 800,
                  }}
                />
              </Stack>

              {/* Multi-Gate Density Terminal Matrix */}
              <Stack spacing={1.5}>
                {GATE_DENSITY_DATA.map((g, idx) => {
                  const isHover = hoveredGate === idx;
                  return (
                    <Box
                      key={g.id}
                      onMouseEnter={() => setHoveredGate(idx)}
                      onMouseLeave={() => setHoveredGate(null)}
                      sx={{
                        p: 1.4,
                        px: 1.8,
                        borderRadius: '12px',
                        bgcolor: isHover
                          ? alpha(g.color, isDark ? 0.14 : 0.08)
                          : isDark ? 'rgba(10, 16, 28, 0.6)' : 'rgba(240, 249, 255, 0.7)',
                        border: `1.5px solid ${isHover ? g.color : 'rgba(56, 189, 248, 0.2)'}`,
                        boxShadow: isHover ? `0 0 16px ${g.glow}` : 'none',
                        transition: 'all 180ms ease',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: g.color, boxShadow: `0 0 6px ${g.color}` }} />
                          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 13, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                            {g.name}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Chip
                            label={`استجابة: ${g.time}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              fontWeight: 800,
                              fontSize: 10,
                              height: 20,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 900, color: g.color, fontSize: 13 }}>
                            {g.totalCount} عبور ({g.sharePct}%)
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* In/Out Micro Details & Capacity Meter */}
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                          {g.inCount} دخول • {g.outCount} خروج
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 700 }}>
                          كثافة الحمل: {g.loadPct}%
                        </Typography>
                      </Stack>

                      {/* Dual-Tone Capacity Bar */}
                      <Box sx={{ width: '100%', height: 6, borderRadius: 3, bgcolor: 'rgba(30, 58, 95, 0.45)', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${g.loadPct}%`,
                            height: '100%',
                            borderRadius: 3,
                            bgcolor: g.color,
                            boxShadow: `0 0 10px ${g.color}`,
                            transition: 'width 600ms ease',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>

              {/* Bottom Verification Footer */}
              <Box
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: '1px dashed rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  إجمالي العبور: 627 (382 دخول + 245 خروج)
                </Typography>
                <Typography variant="caption" sx={{ color: '#00F0FF', fontWeight: 800 }}>
                  كافة الحواجز متصلة وتعمل بنسبة 100%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
