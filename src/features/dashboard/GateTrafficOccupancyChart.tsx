import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SpeedIcon from '@mui/icons-material/Speed';
import FenceIcon from '@mui/icons-material/Fence';
import StarIcon from '@mui/icons-material/Star';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import InsightsIcon from '@mui/icons-material/Insights';

// Hourly data point interface with individual data for each gate
interface HourlyGateDetail {
  hour: string;
  hourLabel: string;
  isPeak?: boolean;
  peakLabel?: string;
  // Gate 1: North Gate (Commercial/Residential Main)
  northIn: number;
  northOut: number;
  northOcc: number;
  // Gate 2: South Gate (Express Outflow Arterial)
  southIn: number;
  southOut: number;
  southOcc: number;
  // Gate 3: East Gate (Visitors & Logistics)
  eastIn: number;
  eastOut: number;
  eastOcc: number;
  // Gate 4: VIP Gate (Executive & High-End)
  vipIn: number;
  vipOut: number;
  vipOcc: number;
  // Cumulative occupancy rate for the district
  districtOccupancy: number;
}

// 24-Hour detailed dataset calibrated so the sum across all 4 gates equals
// exactly 382 entries and 245 exits (matching the dashboard's audited math)
const HOURLY_TRAFFIC_DATA: HourlyGateDetail[] = [
  { hour: '00:00', hourLabel: '12:00 ص', northIn: 3, northOut: 4, northOcc: 18, southIn: 2, southOut: 6, southOcc: 14, eastIn: 2, eastOut: 3, eastOcc: 12, vipIn: 1, vipOut: 1, vipOcc: 15, districtOccupancy: 15 },
  { hour: '02:00', hourLabel: '02:00 ص', northIn: 2, northOut: 3, northOcc: 14, southIn: 1, southOut: 4, southOcc: 10, eastIn: 1, eastOut: 2, eastOcc: 9, vipIn: 0, vipOut: 1, vipOcc: 12, districtOccupancy: 12 },
  { hour: '04:00', hourLabel: '04:00 ص', northIn: 3, northOut: 2, northOcc: 15, southIn: 2, southOut: 2, southOcc: 10, eastIn: 2, eastOut: 1, eastOcc: 10, vipIn: 1, vipOut: 0, vipOcc: 13, districtOccupancy: 13 },
  { hour: '06:00', hourLabel: '06:00 ص', northIn: 12, northOut: 4, northOcc: 25, southIn: 6, southOut: 5, southOcc: 15, eastIn: 8, eastOut: 3, eastOcc: 18, vipIn: 3, vipOut: 1, vipOcc: 20, districtOccupancy: 22 },
  { hour: '07:00', hourLabel: '07:00 ص', northIn: 28, northOut: 6, northOcc: 48, southIn: 14, southOut: 8, southOcc: 30, eastIn: 14, eastOut: 4, eastOcc: 32, vipIn: 8, vipOut: 2, vipOcc: 38, districtOccupancy: 42 },
  { hour: '08:00', hourLabel: '08:00 ص (ذروة صباحية)', isPeak: true, peakLabel: 'ذروة تدفق الموظفين الصباحية', northIn: 36, northOut: 7, northOcc: 86, southIn: 18, southOut: 10, southOcc: 52, eastIn: 18, eastOut: 5, eastOcc: 56, vipIn: 12, vipOut: 2, vipOcc: 78, districtOccupancy: 76 },
  { hour: '09:00', hourLabel: '09:00 ص (ذروة صباحية)', isPeak: true, peakLabel: 'ذروة الأعمال والزيارات', northIn: 24, northOut: 8, northOcc: 92, southIn: 15, southOut: 12, southOcc: 60, eastIn: 16, eastOut: 6, eastOcc: 68, vipIn: 10, vipOut: 3, vipOcc: 88, districtOccupancy: 85 },
  { hour: '11:00', hourLabel: '11:00 ص', northIn: 10, northOut: 9, northOcc: 78, southIn: 9, southOut: 16, southOcc: 58, eastIn: 11, eastOut: 7, eastOcc: 62, vipIn: 4, vipOut: 3, vipOcc: 72, districtOccupancy: 71 },
  { hour: '13:00', hourLabel: '01:00 م', northIn: 8, northOut: 11, northOcc: 65, southIn: 7, southOut: 18, southOcc: 64, eastIn: 9, eastOut: 8, eastOcc: 54, vipIn: 3, vipOut: 4, vipOcc: 60, districtOccupancy: 62 },
  { hour: '15:00', hourLabel: '03:00 م', northIn: 6, northOut: 7, northOcc: 58, southIn: 8, southOut: 16, southOcc: 70, eastIn: 5, eastOut: 4, eastOcc: 48, vipIn: 2, vipOut: 2, vipOcc: 52, districtOccupancy: 56 },
  { hour: '17:00', hourLabel: '05:00 م (ذروة مسائية)', isPeak: true, peakLabel: 'ذروة المغادرة والعودة للمنازل', northIn: 4, northOut: 4, northOcc: 74, southIn: 4, southOut: 7, southOcc: 92, eastIn: 5, eastOut: 1, eastOcc: 65, vipIn: 3, vipOut: 1, vipOcc: 68, districtOccupancy: 82 },
  { hour: '18:00', hourLabel: '06:00 م (ذروة مسائية)', isPeak: true, peakLabel: 'ذروة التسوق والفعاليات', northIn: 3, northOut: 2, northOcc: 80, southIn: 3, southOut: 5, southOcc: 95, eastIn: 4, eastOut: 1, eastOcc: 72, vipIn: 2, vipOut: 0, vipOcc: 76, districtOccupancy: 88 },
  { hour: '20:00', hourLabel: '08:00 م', northIn: 2, northOut: 1, northOcc: 68, southIn: 2, southOut: 2, southOcc: 76, eastIn: 2, eastOut: 0, eastOcc: 60, vipIn: 1, vipOut: 0, vipOcc: 62, districtOccupancy: 68 },
  { hour: '22:00', hourLabel: '10:00 م', northIn: 1, northOut: 0, northOcc: 42, southIn: 1, southOut: 1, southOcc: 46, eastIn: 1, eastOut: 0, eastOcc: 38, vipIn: 0, vipOut: 0, vipOcc: 40, districtOccupancy: 44 },
];

// Gate Profiles for Full Analytics
const GATE_PROFILES = {
  ALL: {
    id: 'ALL',
    name: 'كافة بوابات الحي الموحدة',
    role: 'نظرة شمولية متكاملة لتدفق الحركة والإشغال عبر البوابات الأربعة',
    totalIn: 382,
    totalOut: 245,
    barrierSpeed: '0.75 ثانية',
    flowFluidity: '98.8%',
    primaryPeak: '08:00 ص - 09:30 ص (الدخول) / 05:00 م - 07:00 م (الخروج)',
    accentColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    activeLanes: '8 مسارات ذكية',
    typeBreakdown: { sedan: 62, suv: 27, ev: 8, vip: 3 },
  },
  NORTH: {
    id: 'NORTH',
    name: 'بوابة الشمال 1 (المدخل التجاري والسكني)',
    role: 'المدخل الشرياني الأكبر - كثافة دخول صباحية عالية للموظفين والمقيمين',
    totalIn: 142,
    totalOut: 68,
    barrierSpeed: '0.8 ثانية',
    flowFluidity: '99.1%',
    primaryPeak: '07:45 ص - 09:15 ص (تدفق دخول رئيسي)',
    accentColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    activeLanes: 'مساران للدخول + مسار للخروج',
    typeBreakdown: { sedan: 65, suv: 25, ev: 7, vip: 3 },
  },
  SOUTH: {
    id: 'SOUTH',
    name: 'بوابة الجنوب 2 (مسار الخروج السريع)',
    role: 'مسار التفريغ الرئيسي السريع باتجاه المحاور السريعة وتفريغ الذروة المسائية',
    totalIn: 92,
    totalOut: 112,
    barrierSpeed: '0.7 ثانية',
    flowFluidity: '98.4%',
    primaryPeak: '04:45 م - 06:45 م (تفريغ ومغادرة كبرى)',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    activeLanes: 'مسار للدخول + مساران للخروج السريع',
    typeBreakdown: { sedan: 58, suv: 32, ev: 6, vip: 4 },
  },
  EAST: {
    id: 'EAST',
    name: 'بوابة الشرق 3 (بوابة الزوار والخدمات)',
    role: 'بوابة مخصصة للزوار، التوصيل السريع، والشحن اللوجستي مع تدقيق الحجوزات',
    totalIn: 98,
    totalOut: 45,
    barrierSpeed: '0.9 ثانية',
    flowFluidity: '97.6%',
    primaryPeak: '01:00 م - 03:00 م / 07:00 م - 09:30 م (زوار وخدمات)',
    accentColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    activeLanes: 'مسار دخول ذكي + مسار خروج',
    typeBreakdown: { sedan: 70, suv: 18, ev: 8, vip: 4 },
  },
  VIP: {
    id: 'VIP',
    name: 'بوابة VIP التنفيذية (المسار الذكي المخصص)',
    role: 'مسار خاص لكبار الشخصيات والدبلوماسيين مع فتح آلي استباقي فائق السرعة',
    totalIn: 50,
    totalOut: 20,
    barrierSpeed: '0.4 ثانية',
    flowFluidity: '100%',
    primaryPeak: '09:00 ص - 10:30 ص / 08:00 م - 10:00 م',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    activeLanes: 'مسار منفصل مخصص ومشفر',
    typeBreakdown: { sedan: 40, suv: 45, ev: 15, vip: 100 },
  },
};

type GateFilterType = 'ALL' | 'NORTH' | 'SOUTH' | 'EAST' | 'VIP';
type ChartViewMode = 'SPLINE' | 'BARS' | 'OCCUPANCY';

export function GateTrafficOccupancyChart() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [selectedGate, setSelectedGate] = useState<GateFilterType>('ALL');
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('SPLINE');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeProfile = GATE_PROFILES[selectedGate];

  // Helper to extract specific in/out/occupancy values per selected gate
  const getValues = (dp: HourlyGateDetail) => {
    switch (selectedGate) {
      case 'NORTH':
        return { inVal: dp.northIn, outVal: dp.northOut, occVal: dp.northOcc, label: 'بوابة الشمال 1' };
      case 'SOUTH':
        return { inVal: dp.southIn, outVal: dp.southOut, occVal: dp.southOcc, label: 'بوابة الجنوب 2' };
      case 'EAST':
        return { inVal: dp.eastIn, outVal: dp.eastOut, occVal: dp.eastOcc, label: 'بوابة الشرق 3' };
      case 'VIP':
        return { inVal: dp.vipIn, outVal: dp.vipOut, occVal: dp.vipOcc, label: 'بوابة VIP التنفيذية' };
      default:
        return {
          inVal: dp.northIn + dp.southIn + dp.eastIn + dp.vipIn,
          outVal: dp.northOut + dp.southOut + dp.eastOut + dp.vipOut,
          occVal: dp.districtOccupancy,
          label: 'كافة البوابات الموحدة',
        };
    }
  };

  // Find max value for dynamic proportional scaling
  const maxFlowVal = Math.max(
    ...HOURLY_TRAFFIC_DATA.map((d) => {
      const v = getValues(d);
      return Math.max(v.inVal, v.outVal);
    }),
    20
  );

  const activeHoverData = hoveredIdx !== null ? HOURLY_TRAFFIC_DATA[hoveredIdx] : null;
  const activeHoverVals = activeHoverData ? getValues(activeHoverData) : null;

  // Chart dimensions for responsive SVG
  const svgWidth = 960;
  const svgHeight = 240;
  const padX = 40;
  const padY = 30;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  // Compute curved paths for Spline Area Mode
  const inPoints = HOURLY_TRAFFIC_DATA.map((d, i) => {
    const x = padX + (i / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW;
    const v = getValues(d);
    const y = svgHeight - padY - (v.inVal / maxFlowVal) * chartH;
    return { x, y, val: v.inVal };
  });

  const outPoints = HOURLY_TRAFFIC_DATA.map((d, i) => {
    const x = padX + (i / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW;
    const v = getValues(d);
    const y = svgHeight - padY - (v.outVal / maxFlowVal) * chartH;
    return { x, y, val: v.outVal };
  });

  const occPoints = HOURLY_TRAFFIC_DATA.map((d, i) => {
    const x = padX + (i / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW;
    const v = getValues(d);
    const y = svgHeight - padY - (v.occVal / 100) * chartH;
    return { x, y, val: v.occVal };
  });

  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    return pts.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = a[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (p.x - prev.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
    }, '');
  };

  const inSpline = createSmoothPath(inPoints);
  const outSpline = createSmoothPath(outPoints);
  const occSpline = createSmoothPath(occPoints);

  const inArea = `${inSpline} L ${inPoints[inPoints.length - 1].x},${svgHeight - padY} L ${inPoints[0].x},${svgHeight - padY} Z`;
  const outArea = `${outSpline} L ${outPoints[outPoints.length - 1].x},${svgHeight - padY} L ${outPoints[0].x},${svgHeight - padY} Z`;

  return (
    <Card
      sx={{
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '22px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(28px)',
        border: `1.5px solid ${alpha(activeProfile.accentColor, 0.45)}`,
        boxShadow: isDark
          ? `0 0 35px ${alpha(activeProfile.accentColor, 0.18)}, 0 20px 50px rgba(5, 8, 16, 0.7)`
          : `0 14px 40px ${alpha(activeProfile.accentColor, 0.15)}`,
        transition: 'border-color 300ms ease, box-shadow 300ms ease',
      }}
    >
      {/* Top Ambient Glow Line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5px',
          background: `linear-gradient(90deg, transparent, ${activeProfile.accentColor}, transparent)`,
          boxShadow: `0 0 15px ${activeProfile.accentColor}`,
        }}
      />

      {/* =========================================================================
          SECTION 1: ICONIC HEADER & DYNAMIC GATE CONTROLS
      ========================================================================= */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', lg: 'center' }}
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        {/* Title & Badge */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: alpha(activeProfile.accentColor, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeProfile.accentColor,
                border: `1.5px solid ${alpha(activeProfile.accentColor, 0.4)}`,
                boxShadow: `0 0 18px ${alpha(activeProfile.accentColor, 0.3)}`,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 26 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.4, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                معدل الحركة اللحظية والإشغال عبر بوابات الحي
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {activeProfile.role}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Action Controls: Gate Filter Tabs & View Mode */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
          {/* Gate Selection Tabs */}
          <ButtonGroup
            size="small"
            sx={{
              p: 0.5,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(11, 18, 32, 0.75)' : 'rgba(240, 249, 255, 0.85)',
              border: `1px solid ${alpha(activeProfile.accentColor, 0.25)}`,
            }}
          >
            {[
              { id: 'ALL', label: 'كافة البوابات' },
              { id: 'NORTH', label: 'بوابة الشمال 1' },
              { id: 'SOUTH', label: 'بوابة الجنوب 2' },
              { id: 'EAST', label: 'بوابة الشرق 3' },
              { id: 'VIP', label: 'بوابة VIP' },
            ].map((tab) => {
              const active = selectedGate === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setSelectedGate(tab.id as GateFilterType)}
                  sx={{
                    fontSize: 11,
                    fontWeight: 800,
                    px: 1.5,
                    py: 0.6,
                    borderRadius: '8px !important',
                    color: active ? '#050810' : 'text.secondary',
                    bgcolor: active ? activeProfile.accentColor : 'transparent',
                    boxShadow: active ? `0 0 15px ${alpha(activeProfile.accentColor, 0.6)}` : 'none',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      bgcolor: active ? activeProfile.accentColor : alpha(activeProfile.accentColor, 0.12),
                    },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </ButtonGroup>

          {/* Chart View Toggle */}
          <ButtonGroup
            size="small"
            sx={{
              p: 0.5,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(11, 18, 32, 0.75)' : 'rgba(240, 249, 255, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <Tooltip title="عرض منحنى التدفق المتصل (Spline Stream)">
              <Button
                onClick={() => setChartViewMode('SPLINE')}
                sx={{
                  color: viewMode === 'SPLINE' ? '#00F0FF' : 'text.secondary',
                  bgcolor: viewMode === 'SPLINE' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                <ShowChartIcon sx={{ fontSize: 18 }} />
              </Button>
            </Tooltip>
            <Tooltip title="عرض أعمدة العبور المقارنة (Dynamic Bars)">
              <Button
                onClick={() => setChartViewMode('BARS')}
                sx={{
                  color: viewMode === 'BARS' ? '#38BDF8' : 'text.secondary',
                  bgcolor: viewMode === 'BARS' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                <BarChartIcon sx={{ fontSize: 18 }} />
              </Button>
            </Tooltip>
            <Tooltip title="عرض منحنى نسبة الإشغال والذروة (Occupancy Peak)">
              <Button
                onClick={() => setChartViewMode('OCCUPANCY')}
                sx={{
                  color: viewMode === 'OCCUPANCY' ? '#F59E0B' : 'text.secondary',
                  bgcolor: viewMode === 'OCCUPANCY' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                <SpeedIcon sx={{ fontSize: 18 }} />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Stack>
      </Stack>

      {/* =========================================================================
          SECTION 2: REALTIME KPI SNAPSHOT STRIP FOR THE SELECTED GATE
      ========================================================================= */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* KPI 1: Inflow Today */}
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: isDark ? 'rgba(10, 20, 30, 0.7)' : 'rgba(240, 253, 244, 0.85)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                حركة الدخول اليومية
              </Typography>
              <ArrowDownwardIcon sx={{ color: '#10B981', fontSize: 18 }} />
            </Stack>
            <Typography variant="h5" fontWeight={900} sx={{ color: '#10B981', my: 0.5 }}>
              {activeProfile.totalIn}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
              مركبة مسجلة بالتعرف الآلي
            </Typography>
          </Box>
        </Grid>

        {/* KPI 2: Outflow Today */}
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: isDark ? 'rgba(25, 15, 35, 0.7)' : 'rgba(250, 245, 255, 0.85)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.1)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                حركة الخروج والمغادرة
              </Typography>
              <ArrowUpwardIcon sx={{ color: '#8B5CF6', fontSize: 18 }} />
            </Stack>
            <Typography variant="h5" fontWeight={900} sx={{ color: '#8B5CF6', my: 0.5 }}>
              {activeProfile.totalOut}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
              تسوية ومغادرة بدون توقف
            </Typography>
          </Box>
        </Grid>

        {/* KPI 3: Active Lanes */}
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: isDark ? 'rgba(10, 16, 28, 0.7)' : 'rgba(240, 249, 255, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                المسارات والتجهيزات
              </Typography>
              <FenceIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
            </Stack>
            <Typography variant="body1" fontWeight={900} sx={{ color: isDark ? '#F8FAFC' : '#0F172A', my: 0.7, fontSize: 15 }}>
              {activeProfile.activeLanes}
            </Typography>
            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700, display: 'block', fontSize: 10 }}>
              كاميرات LPR مزدوجة وحساسات أرضية
            </Typography>
          </Box>
        </Grid>

        {/* KPI 4: Peak Range */}
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: isDark ? 'rgba(30, 20, 10, 0.7)' : 'rgba(254, 243, 199, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.1)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                فترة الذروة الحرجة
              </Typography>
              <SpeedIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
            </Stack>
            <Typography variant="body2" fontWeight={900} sx={{ color: '#F59E0B', my: 0.5, fontSize: 11.5, lineHeight: 1.3 }}>
              {activeProfile.primaryPeak}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
              تحكم ديناميكي بزمن إشارات العبور
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* =========================================================================
          SECTION 3: ICONIC INTERACTIVE VISUALIZATION STAGE (SVG HUD CHART)
      ========================================================================= */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: '16px',
          p: 2,
          mb: 3,
          bgcolor: isDark ? 'rgba(8, 13, 24, 0.85)' : 'rgba(240, 249, 255, 0.65)',
          border: '1.5px solid rgba(56, 189, 248, 0.2)',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Visual Chart Header with Legends & Peak Badges */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          {/* Legend Items */}
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }} />
              <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>
                تدفق الدخول (Inflow)
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#8B5CF6', boxShadow: '0 0 8px #8B5CF6' }} />
              <Typography variant="caption" fontWeight={800} sx={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>
                تدفق الخروج (Outflow)
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 18, height: 3.5, borderRadius: '2px', bgcolor: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
              <Typography variant="caption" fontWeight={800} sx={{ color: '#F59E0B' }}>
                منحنى الإشغال التراكمي (%)
              </Typography>
            </Stack>
          </Stack>

          {/* Peak hour flags */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip
              label="الذروة الصباحية: 07:30 - 09:30"
              size="small"
              sx={{
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontWeight: 800,
                fontSize: 10.5,
              }}
            />
            <Chip
              label="الذروة المسائية: 05:00 - 07:00"
              size="small"
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontWeight: 800,
                fontSize: 10.5,
              }}
            />
          </Stack>
        </Stack>

        {/* Dynamic SVG / HTML Hybrid Graphic Stage */}
        <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              {/* Gradients */}
              <linearGradient id="inStreamGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="outStreamGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="peakBandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.02" />
              </linearGradient>

              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Peak Hour Vertical Highlight Bands */}
            {/* Morning Peak Zone (around indices 5, 6 -> 08:00 to 09:00) */}
            <rect
              x={padX + (4.5 / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW}
              y={padY}
              width={(2.2 / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW}
              height={chartH}
              fill="url(#peakBandGrad)"
              rx="8"
            />
            {/* Evening Peak Zone (around indices 10, 11 -> 17:00 to 18:00) */}
            <rect
              x={padX + (9.5 / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW}
              y={padY}
              width={(2.2 / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW}
              height={chartH}
              fill="url(#peakBandGrad)"
              rx="8"
            />

            {/* Horizontal Grid guidelines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = svgHeight - padY - ratio * chartH;
              return (
                <g key={idx}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={svgWidth - padX}
                    y2={y}
                    stroke="rgba(56, 189, 248, 0.12)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padX - 8}
                    y={y + 3}
                    fill="#64748B"
                    fontSize="9.5"
                    textAnchor="end"
                    fontFamily="Cairo, sans-serif"
                    fontWeight="700"
                  >
                    {Math.round(ratio * maxFlowVal)}
                  </text>
                </g>
              );
            })}

            {/* MODE 1: SPLINE AREA STREAM */}
            {viewMode === 'SPLINE' && (
              <>
                {/* Outflow Area & Spline */}
                <path d={outArea} fill="url(#outStreamGrad)" />
                <path d={outSpline} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeOpacity="0.85" />

                {/* Inflow Area & Spline */}
                <path d={inArea} fill="url(#inStreamGrad)" />
                <path d={inSpline} fill="none" stroke="#00F0FF" strokeWidth="3.2" filter="url(#neonGlow)" />

                {/* Occupancy Spline Overlay */}
                <path d={occSpline} fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeDasharray="3 3" />
              </>
            )}

            {/* MODE 2: DYNAMIC BARS */}
            {viewMode === 'BARS' && (
              <>
                {HOURLY_TRAFFIC_DATA.map((d, i) => {
                  const x = padX + (i / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW;
                  const v = getValues(d);
                  const inH = (v.inVal / maxFlowVal) * chartH;
                  const outH = (v.outVal / maxFlowVal) * chartH;
                  const barW = 10;
                  const isHover = hoveredIdx === i;

                  return (
                    <g key={`bar-${i}`}>
                      {/* Entry Bar (Inflow Cyan) */}
                      <rect
                        x={x - barW - 1}
                        y={svgHeight - padY - inH}
                        width={barW}
                        height={Math.max(inH, 2)}
                        rx="3"
                        fill="#00F0FF"
                        opacity={isHover ? 1 : 0.85}
                        filter={isHover ? 'url(#neonGlow)' : undefined}
                      />
                      {/* Exit Bar (Outflow Violet) */}
                      <rect
                        x={x + 1}
                        y={svgHeight - padY - outH}
                        width={barW}
                        height={Math.max(outH, 2)}
                        rx="3"
                        fill="#8B5CF6"
                        opacity={isHover ? 1 : 0.85}
                        filter={isHover ? 'url(#neonGlow)' : undefined}
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* MODE 3: OCCUPANCY PEAK CURVE */}
            {viewMode === 'OCCUPANCY' && (
              <>
                <path
                  d={`${occSpline} L ${occPoints[occPoints.length - 1].x},${svgHeight - padY} L ${occPoints[0].x},${svgHeight - padY} Z`}
                  fill="url(#peakBandGrad)"
                />
                <path d={occSpline} fill="none" stroke="#F59E0B" strokeWidth="3.5" filter="url(#neonGlow)" />
                {occPoints.map((p, idx) => (
                  <circle
                    key={`occ-${idx}`}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIdx === idx ? 7 : 4.5}
                    fill={p.val > 80 ? '#EF4444' : '#F59E0B'}
                    stroke="#FFF"
                    strokeWidth="2"
                  />
                ))}
              </>
            )}

            {/* Interactive Data Points & Timeline Labels */}
            {HOURLY_TRAFFIC_DATA.map((d, i) => {
              const x = padX + (i / (HOURLY_TRAFFIC_DATA.length - 1)) * chartW;
              const v = getValues(d);
              const inY = svgHeight - padY - (v.inVal / maxFlowVal) * chartH;
              const isHover = hoveredIdx === i;

              return (
                <g key={`point-${i}`}>
                  {/* Invisible broad hover trigger column */}
                  <rect
                    x={x - chartW / (HOURLY_TRAFFIC_DATA.length * 2)}
                    y={padY}
                    width={chartW / HOURLY_TRAFFIC_DATA.length}
                    height={chartH}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />

                  {/* Vertical cursor indicator on hover */}
                  {isHover && (
                    <line
                      x1={x}
                      y1={padY}
                      x2={x}
                      y2={svgHeight - padY}
                      stroke="#00F0FF"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Dot on Inflow Line */}
                  <circle
                    cx={x}
                    cy={inY}
                    r={isHover ? 6.5 : d.isPeak ? 4.5 : 3}
                    fill={d.isPeak ? '#EF4444' : '#00F0FF'}
                    stroke="#0B1220"
                    strokeWidth="2"
                    style={{ pointerEvents: 'none', transition: 'all 160ms ease' }}
                  />

                  {/* Time label on X axis */}
                  <text
                    x={x}
                    y={svgHeight - 10}
                    fill={d.isPeak ? '#EF4444' : isHover ? '#00F0FF' : '#94A3B8'}
                    fontSize="9.5"
                    textAnchor="middle"
                    fontWeight={d.isPeak || isHover ? '800' : '600'}
                    fontFamily="Cairo, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {d.hour}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating HUD Tooltip */}
          {activeHoverData && activeHoverVals && (
            <Box
              sx={{
                position: 'absolute',
                top: 15,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                px: 2.5,
                py: 1.5,
                borderRadius: '14px',
                bgcolor: isDark ? 'rgba(10, 16, 28, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                border: '1.5px solid #00F0FF',
                boxShadow: '0 12px 35px rgba(0, 240, 255, 0.35), 0 2px 8px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(15px)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
                  التوقيت: {activeHoverData.hourLabel}
                </Typography>
                <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#00F0FF' }}>
                  {activeHoverVals.label}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2.5} alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>دخول</Typography>
                  <Typography variant="body2" fontWeight={900} sx={{ color: '#00F0FF' }}>
                    {activeHoverVals.inVal} سيارة
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>خروج</Typography>
                  <Typography variant="body2" fontWeight={900} sx={{ color: '#8B5CF6' }}>
                    {activeHoverVals.outVal} سيارة
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>نسبة الإشغال</Typography>
                  <Typography variant="body2" fontWeight={900} sx={{ color: '#F59E0B' }}>
                    {activeHoverVals.occVal}%
                  </Typography>
                </Box>

                {activeHoverData.isPeak && (
                  <Chip
                    label={activeHoverData.peakLabel || 'ذروة تدفق'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.2)',
                      color: '#EF4444',
                      border: '1px solid #EF4444',
                      fontWeight: 800,
                      fontSize: 10,
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      {/* =========================================================================
          SECTION 4: COMPREHENSIVE INDIVIDUAL GATE ANALYTICAL BREAKDOWN CARDS
      ========================================================================= */}
      <Box sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <InsightsIcon sx={{ color: '#00F0FF', fontSize: 20 }} />
          <Typography variant="h6" fontWeight={900} sx={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            التحليل التشغيلي المقارن لكل بوابة من بوابات الحي الأربعة
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {/* GATE 1: North Gate 1 */}
          <Grid item xs={12} sm={6} lg={3}>
            <Box
              onClick={() => setSelectedGate('NORTH')}
              sx={{
                p: 2,
                borderRadius: '16px',
                cursor: 'pointer',
                bgcolor: selectedGate === 'NORTH'
                  ? alpha('#00F0FF', isDark ? 0.12 : 0.08)
                  : isDark ? 'rgba(10, 16, 28, 0.65)' : 'rgba(240, 249, 255, 0.7)',
                border: `1.5px solid ${selectedGate === 'NORTH' ? '#00F0FF' : 'rgba(56, 189, 248, 0.2)'}`,
                boxShadow: selectedGate === 'NORTH' ? '0 0 20px rgba(0, 240, 255, 0.25)' : 'none',
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: '#00F0FF',
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#00F0FF' }}>
                  بوابة الشمال 1 (المدخل الرئيسي)
                </Typography>
                <Chip label="حجم 210 عبور" size="small" sx={{ bgcolor: 'rgba(0, 240, 255, 0.15)', color: '#00F0FF', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontSize: 11 }}>
                تستقبل 37.2% من إجمالي حركة الحي • ذروة صباحية مكثفة
              </Typography>

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>دخول / خروج</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#00F0FF' }}>
                    142 دخول • 68 خروج
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>سرعة استجابة الحاجز</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#10B981' }}>
                    0.8 ثانية (فوري)
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>توزيع المركبات</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#CBD5E1' }}>
                    65% سيدان • 25% SUV • 10% كهربائي
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* GATE 2: South Gate 2 */}
          <Grid item xs={12} sm={6} lg={3}>
            <Box
              onClick={() => setSelectedGate('SOUTH')}
              sx={{
                p: 2,
                borderRadius: '16px',
                cursor: 'pointer',
                bgcolor: selectedGate === 'SOUTH'
                  ? alpha('#38BDF8', isDark ? 0.12 : 0.08)
                  : isDark ? 'rgba(10, 16, 28, 0.65)' : 'rgba(240, 249, 255, 0.7)',
                border: `1.5px solid ${selectedGate === 'SOUTH' ? '#38BDF8' : 'rgba(56, 189, 248, 0.2)'}`,
                boxShadow: selectedGate === 'SOUTH' ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none',
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: '#38BDF8',
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#38BDF8' }}>
                  بوابة الجنوب 2 (المخرج السريع)
                </Typography>
                <Chip label="حجم 204 عبور" size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontSize: 11 }}>
                تفرغ 45.7% من خروج الحي • تفريغ مسائي متواصل بدون تكدس
              </Typography>

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>دخول / خروج</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#38BDF8' }}>
                    92 دخول • 112 خروج
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>سرعة استجابة الحاجز</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#10B981' }}>
                    0.7 ثانية (تسوية آلية)
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>توزيع المركبات</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#CBD5E1' }}>
                    58% سيدان • 32% SUV • 10% أخرى
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* GATE 3: East Gate 3 */}
          <Grid item xs={12} sm={6} lg={3}>
            <Box
              onClick={() => setSelectedGate('EAST')}
              sx={{
                p: 2,
                borderRadius: '16px',
                cursor: 'pointer',
                bgcolor: selectedGate === 'EAST'
                  ? alpha('#A855F7', isDark ? 0.12 : 0.08)
                  : isDark ? 'rgba(10, 16, 28, 0.65)' : 'rgba(240, 249, 255, 0.7)',
                border: `1.5px solid ${selectedGate === 'EAST' ? '#A855F7' : 'rgba(168, 85, 247, 0.2)'}`,
                boxShadow: selectedGate === 'EAST' ? '0 0 20px rgba(168, 85, 247, 0.25)' : 'none',
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: '#A855F7',
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#A855F7' }}>
                  بوابة الشرق 3 (الزوار والخدمات)
                </Typography>
                <Chip label="حجم 143 عبور" size="small" sx={{ bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontSize: 11 }}>
                مخصصة لتصاريح الزوار وتوصيل الخدمات مع مسار QR ذكي
              </Typography>

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>دخول / خروج</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#A855F7' }}>
                    98 دخول • 45 خروج
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>سرعة استجابة الحاجز</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#10B981' }}>
                    0.9 ثانية (تحقق تصريح)
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>توزيع المركبات</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#CBD5E1' }}>
                    70% زوار • 22% خدمات • 8% EV
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* GATE 4: VIP Gate */}
          <Grid item xs={12} sm={6} lg={3}>
            <Box
              onClick={() => setSelectedGate('VIP')}
              sx={{
                p: 2,
                borderRadius: '16px',
                cursor: 'pointer',
                bgcolor: selectedGate === 'VIP'
                  ? alpha('#F59E0B', isDark ? 0.12 : 0.08)
                  : isDark ? 'rgba(10, 16, 28, 0.65)' : 'rgba(240, 249, 255, 0.7)',
                border: `1.5px solid ${selectedGate === 'VIP' ? '#F59E0B' : 'rgba(245, 158, 11, 0.2)'}`,
                boxShadow: selectedGate === 'VIP' ? '0 0 20px rgba(245, 158, 11, 0.25)' : 'none',
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: '#F59E0B',
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#F59E0B' }}>
                  بوابة VIP التنفيذية
                </Typography>
                <Chip label="حجم 70 عبور" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontSize: 11 }}>
                مسار خاص للمسؤولين وكبار الشخصيات مع فتح استباقي LPR
              </Typography>

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>دخول / خروج</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#F59E0B' }}>
                    50 دخول • 20 خروج
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>سرعة استجابة الحاجز</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#10B981' }}>
                    0.4 ثانية (فتح استباقي)
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>توزيع المركبات</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#CBD5E1' }}>
                    85% فارهة • 15% شحن EV فاخر
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* =========================================================================
          SECTION 5: SMART PREDICTIVE TELEMETRY INSIGHTS BANNER
      ========================================================================= */}
      <Box
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: isDark ? 'rgba(10, 16, 28, 0.75)' : 'rgba(240, 249, 255, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CheckCircleOutlineIcon sx={{ color: '#10B981', fontSize: 22 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#10B981' }}>
              منظومة البوابات تعمل بأعلى كفاءة تدفق (الانسيابية 98.8%)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              لا توجد أي اختناقات أو طوابير انتظار عند بوابات الدخول والخروج لكافة أحياء المنشأة
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
              توقعات الذكاء الاصطناعي (الساعتين القادمتين)
            </Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: '#00F0FF' }}>
              انخفاض تدريجي في التدفق بنسبة 18% مع استقرار الإشغال
            </Typography>
          </Box>

          <Chip
            icon={<BoltIcon sx={{ fontSize: '16px !important', color: '#00F0FF !important' }} />}
            label="مزامنة حية 100%"
            size="small"
            sx={{
              bgcolor: 'rgba(0, 240, 255, 0.15)',
              color: '#00F0FF',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              fontWeight: 800,
            }}
          />
        </Stack>
      </Box>
    </Card>
  );
}
