import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
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
  occupied = 137,
  available = 363,
  occupancyPercentage = 27.4,
  todayEntries = 245,
  todayExits = 156,
}: DashboardAnalyticsChartsProps) {
  const theme = useTheme();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

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

  // Saudi Payment Breakdown Stats
  const SAUDI_PAYMENT_METHODS = [
    { label: 'شبكة مدى (Mada)', percent: 58, amount: '86,025 ر.س', color: '#006848' },
    { label: 'أبل باي (Apple Pay)', percent: 24, amount: '35,600 ر.س', color: '#38BDF8' },
    { label: 'إس تي سي باي (STC Pay)', percent: 12, amount: '17,800 ر.س', color: '#A855F7' },
    { label: 'البطاقات البنكية والتحصيل', percent: 6, amount: '8,895 ر.س', color: '#F59E0B' },
  ];

  // Radial Gauge calculations
  const radius = 68;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancyPercentage / 100) * circumference;

  return (
    <Box sx={{ width: '100%', my: 3.5 }}>
      <Grid container spacing={2.5}>
        {/* Chart 1: Hourly Flow Spline Area Chart */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              height: '100%',
              ...glassPanel({
                background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.1), 0 20px 40px rgba(5, 8, 17, 0.55)',
              }),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ShowChartIcon sx={{ color: '#00F0FF', fontSize: 22 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                      معدل التدفق والحركة اللحظية للمركبات (24 ساعة)
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    تحليل تدفق الدخول (قراءات LPR) مقابل الخروج عبر البوابات الذكية
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }} />
                    <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 700 }}>
                      مركبات داخلة ({todayEntries})
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
                    <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 700 }}>
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

        {/* Chart 2: Live Capacity Radial Gauge & Zone Highlights */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              height: '100%',
              ...glassPanel({
                background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.1), 0 20px 40px rgba(5, 8, 17, 0.55)',
              }),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <SpeedIcon sx={{ color: '#38BDF8', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                  مؤشر الإشغال والسعة الحية
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
                السعة الكلية: {totalCapacity} موقف ذكي مراقب
              </Typography>

              {/* Radial Dial */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1, position: 'relative' }}>
                <svg width="170" height="170" viewBox="0 0 170 170">
                  {/* Background Track */}
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="rgba(30, 58, 95, 0.5)"
                    strokeWidth={strokeWidth}
                  />
                  {/* Progress Ring */}
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
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                    {occupancyPercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700, mt: 0.5, display: 'block' }}>
                    نسبة الإشغال
                  </Typography>
                </Box>
              </Box>

              {/* Sub-metrics */}
              <Stack spacing={1.2} sx={{ mt: 2 }}>
                <Box sx={{ p: 1.2, px: 2, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DirectionsCarIcon sx={{ color: '#34D399', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#CBD5E1', fontWeight: 700 }}>مواقف متاحة الآن</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: '#34D399', fontWeight: 800 }}>{available} موقف</Typography>
                </Box>

                <Box sx={{ p: 1.2, px: 2, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StarIcon sx={{ color: '#FBBF24', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#CBD5E1', fontWeight: 700 }}>مواقف VIP المحجوزة</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: '#FBBF24', fontWeight: 800 }}>24 موقف</Typography>
                </Box>

                <Box sx={{ p: 1.2, px: 2, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EvStationIcon sx={{ color: '#00F0FF', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#CBD5E1', fontWeight: 700 }}>شواحن EV الكهربائية</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: '#00F0FF', fontWeight: 800 }}>12 متاح (من 16)</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 3: Saudi Payment Gateways Revenue Distribution */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              ...glassPanel({
                background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
              }),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <DonutLargeIcon sx={{ color: '#34D399', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                  توزيع الإيرادات عبر بوابات الدفع السعودية
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2.5 }}>
                إجمالي تحصيل اليوم: 148,320.00 ر.س (مطابقة فورية مع SAMA)
              </Typography>

              <Stack spacing={2}>
                {SAUDI_PAYMENT_METHODS.map((pm) => (
                  <Box key={pm.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                      <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                        {pm.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#38BDF8', fontWeight: 800 }}>
                        {pm.amount} ({pm.percent}%)
                      </Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 8, borderRadius: 4, bgcolor: 'rgba(30, 58, 95, 0.5)', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${pm.percent}%`,
                          height: '100%',
                          borderRadius: 4,
                          bgcolor: pm.color,
                          boxShadow: `0 0 10px ${pm.color}`,
                          transition: 'width 1s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 4: Gate Throughput Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              ...glassPanel({
                background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
              }),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <BarChartIcon sx={{ color: '#00F0FF', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                  كثافة العبور عبر البوابات والحواجز الذكية
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2.5 }}>
                متوسط سرعة استجابة وفتح الحواجز: 0.8 ثانية
              </Typography>

              <Stack spacing={2}>
                {[
                  { name: 'بوابة الشمال 1 (مدخل رئيسي)', count: 142, max: 200, color: '#00F0FF', time: '0.8s' },
                  { name: 'بوابة الجنوب 2 (مخرج رئيسي)', count: 98, max: 200, color: '#38BDF8', time: '0.7s' },
                  { name: 'بوابة الشرق 3 (مدخل زوار)', count: 76, max: 200, color: '#A855F7', time: '0.9s' },
                  { name: 'بوابة VIP التنفيذية (دخول ذكي)', count: 34, max: 200, color: '#FBBF24', time: '0.5s' },
                ].map((g) => (
                  <Box key={g.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                      <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                        {g.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#38BDF8', fontWeight: 800 }}>
                        {g.count} عملية عبور (استجابة: {g.time})
                      </Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 8, borderRadius: 4, bgcolor: 'rgba(30, 58, 95, 0.5)', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${(g.count / g.max) * 100}%`,
                          height: '100%',
                          borderRadius: 4,
                          bgcolor: g.color,
                          boxShadow: `0 0 10px ${g.color}`,
                          transition: 'width 1s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
