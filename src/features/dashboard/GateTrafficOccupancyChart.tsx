import { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
  Button,
  ButtonGroup,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import FenceIcon from '@mui/icons-material/Fence';
import StarIcon from '@mui/icons-material/Star';

interface GateDataPoint {
  hour: string;
  hourLabel: string;
  northIn: number;
  northOut: number;
  southIn: number;
  southOut: number;
  vipIn: number;
  vipOut: number;
  occupancyPercent: number;
  isPeak?: boolean;
}

const TRAFFIC_DATA: GateDataPoint[] = [
  { hour: '00:00', hourLabel: '12:00 ص', northIn: 12, northOut: 18, southIn: 8, southOut: 14, vipIn: 2, vipOut: 4, occupancyPercent: 28 },
  { hour: '02:00', hourLabel: '02:00 ص', northIn: 6, northOut: 10, southIn: 4, southOut: 8, vipIn: 1, vipOut: 2, occupancyPercent: 22 },
  { hour: '04:00', hourLabel: '04:00 ص', northIn: 10, northOut: 8, southIn: 6, southOut: 6, vipIn: 2, vipOut: 1, occupancyPercent: 20 },
  { hour: '06:00', hourLabel: '06:00 ص', northIn: 45, northOut: 14, southIn: 32, southOut: 12, vipIn: 8, vipOut: 2, occupancyPercent: 35 },
  { hour: '07:00', hourLabel: '07:00 ص', northIn: 110, northOut: 20, southIn: 85, southOut: 18, vipIn: 24, vipOut: 5, occupancyPercent: 58 },
  { hour: '08:00', hourLabel: '08:00 ص (ذروة)', northIn: 185, northOut: 25, southIn: 140, southOut: 22, vipIn: 42, vipOut: 6, occupancyPercent: 88, isPeak: true },
  { hour: '09:00', hourLabel: '09:00 ص (ذروة)', northIn: 160, northOut: 38, southIn: 120, southOut: 30, vipIn: 38, vipOut: 10, occupancyPercent: 92, isPeak: true },
  { hour: '11:00', hourLabel: '11:00 ص', northIn: 95, northOut: 70, southIn: 75, southOut: 62, vipIn: 20, vipOut: 16, occupancyPercent: 84 },
  { hour: '13:00', hourLabel: '01:00 م', northIn: 80, northOut: 105, southIn: 68, southOut: 88, vipIn: 18, vipOut: 22, occupancyPercent: 76 },
  { hour: '15:00', hourLabel: '03:00 م', northIn: 90, northOut: 120, southIn: 82, southOut: 110, vipIn: 22, vipOut: 30, occupancyPercent: 71 },
  { hour: '17:00', hourLabel: '05:00 م (ذروة)', northIn: 175, northOut: 145, southIn: 135, southOut: 120, vipIn: 40, vipOut: 35, occupancyPercent: 89, isPeak: true },
  { hour: '18:00', hourLabel: '06:00 م (ذروة)', northIn: 195, northOut: 160, southIn: 155, southOut: 138, vipIn: 48, vipOut: 38, occupancyPercent: 94, isPeak: true },
  { hour: '20:00', hourLabel: '08:00 م', northIn: 115, northOut: 130, southIn: 90, southOut: 105, vipIn: 26, vipOut: 28, occupancyPercent: 79 },
  { hour: '22:00', hourLabel: '10:00 م', northIn: 65, northOut: 90, southIn: 48, southOut: 72, vipIn: 14, vipOut: 20, occupancyPercent: 52 },
];

export function GateTrafficOccupancyChart() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [selectedGate, setSelectedGate] = useState<'ALL' | 'NORTH' | 'SOUTH' | 'VIP'>('ALL');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute active values based on filter
  const getValues = (dp: GateDataPoint) => {
    switch (selectedGate) {
      case 'NORTH':
        return { inVal: dp.northIn, outVal: dp.northOut, total: dp.northIn + dp.northOut, name: 'بوابة الشمال 1' };
      case 'SOUTH':
        return { inVal: dp.southIn, outVal: dp.southOut, total: dp.southIn + dp.southOut, name: 'بوابة الجنوب 2' };
      case 'VIP':
        return { inVal: dp.vipIn, outVal: dp.vipOut, total: dp.vipIn + dp.vipOut, name: 'بوابة VIP التنفيذية' };
      default:
        return {
          inVal: dp.northIn + dp.southIn + dp.vipIn,
          outVal: dp.northOut + dp.southOut + dp.vipOut,
          total: dp.northIn + dp.southIn + dp.vipIn + dp.northOut + dp.southOut + dp.vipOut,
          name: 'كافة بوابات الحي',
        };
    }
  };

  const maxTotal = Math.max(...TRAFFIC_DATA.map((d) => getValues(d).total), 1);
  const activeHover = hoveredIndex !== null ? TRAFFIC_DATA[hoveredIndex] : null;
  const activeHoverVals = activeHover ? getValues(activeHover) : null;

  return (
    <Card
      sx={{
        p: 3,
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '18px',
        boxShadow: isDark
          ? '0 12px 36px rgba(0, 0, 0, 0.5)'
          : '0 12px 34px rgba(14, 165, 233, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Chart Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUpIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: -0.3 }}>
                معدل الحركة اللحظية والإشغال عبر بوابات الحي
              </Typography>
              <Typography variant="caption" color="text.secondary">
                توزيع حجم المركبات، أوقات الذروة، ونسبة الإشغال التراكمية لكل بوابة
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Gate Filter Buttons */}
        <ButtonGroup
          size="small"
          sx={{
            bgcolor: isDark ? 'rgba(11, 18, 32, 0.6)' : 'rgba(240, 249, 255, 0.8)',
            p: 0.5,
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}
        >
          {[
            { id: 'ALL', label: 'كافة البوابات' },
            { id: 'NORTH', label: 'بوابة الشمال 1' },
            { id: 'SOUTH', label: 'بوابة الجنوب 2' },
            { id: 'VIP', label: 'بوابة VIP' },
          ].map((btn) => (
            <Button
              key={btn.id}
              onClick={() => setSelectedGate(btn.id as any)}
              sx={{
                fontSize: 11,
                fontWeight: 800,
                borderRadius: '8px !important',
                px: 1.5,
                py: 0.6,
                color: selectedGate === btn.id ? '#080D1A' : 'text.secondary',
                bgcolor: selectedGate === btn.id ? '#38BDF8' : 'transparent',
                boxShadow: selectedGate === btn.id ? '0 2px 10px rgba(56, 189, 248, 0.4)' : 'none',
                '&:hover': {
                  bgcolor: selectedGate === btn.id ? '#38BDF8' : alpha('#38BDF8', 0.1),
                },
              }}
            >
              {btn.label}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>

      {/* Legend & KPI Bar */}
      <Stack
        direction="row"
        spacing={2.5}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        sx={{
          p: 1.5,
          mb: 2.5,
          borderRadius: '12px',
          bgcolor: isDark ? 'rgba(11, 18, 32, 0.7)' : 'rgba(240, 249, 255, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.15)',
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#00F0FF' }} />
            <Typography variant="caption" fontWeight={700}>
              حركة الدخول (Inflow)
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#38BDF8' }} />
            <Typography variant="caption" fontWeight={700}>
              حركة الخروج (Outflow)
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 18, height: 3, borderRadius: '2px', bgcolor: '#F59E0B' }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: '#F59E0B' }}>
              منحنى الإشغال % (Occupancy)
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Chip
            size="small"
            label="فترة الذروة الصباحية: 08:00 - 09:30"
            sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', fontWeight: 800, fontSize: 11 }}
          />
          <Chip
            size="small"
            label="فترة الذروة المسائية: 17:30 - 19:30"
            sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', fontWeight: 800, fontSize: 11 }}
          />
        </Stack>
      </Stack>

      {/* Main Interactive Chart Grid */}
      <Box sx={{ position: 'relative', height: 260, pt: 2, pb: 4 }}>
        {/* SVG Background Grid Lines & Occupancy Spline */}
        <svg
          viewBox="0 0 1000 220"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="55" x2="1000" y2="55" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="0" y1="110" x2="1000" y2="110" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="0" y1="165" x2="1000" y2="165" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

          {/* Occupancy Spline Curve */}
          <path
            d={TRAFFIC_DATA.map((d, i) => {
              const x = (i / (TRAFFIC_DATA.length - 1)) * 960 + 20;
              const y = 200 - (d.occupancyPercent / 100) * 170;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="none"
          />

          {/* Occupancy Area */}
          <path
            d={
              TRAFFIC_DATA.map((d, i) => {
                const x = (i / (TRAFFIC_DATA.length - 1)) * 960 + 20;
                const y = 200 - (d.occupancyPercent / 100) * 170;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ') + ` L 980 200 L 20 200 Z`
            }
            fill="url(#occupancyFill)"
          />

          {/* Key Occupancy Points */}
          {TRAFFIC_DATA.map((d, i) => {
            const x = (i / (TRAFFIC_DATA.length - 1)) * 960 + 20;
            const y = 200 - (d.occupancyPercent / 100) * 170;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={d.isPeak ? 4.5 : 2.5}
                fill={d.isPeak ? '#EF4444' : '#F59E0B'}
                stroke="#FFF"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Columns & Tooltip Container */}
        <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: 1, px: 2, position: 'relative' }}>
          {TRAFFIC_DATA.map((dp, idx) => {
            const vals = getValues(dp);
            const inHeight = (vals.inVal / maxTotal) * 160;
            const outHeight = (vals.outVal / maxTotal) * 160;
            const isHovered = hoveredIndex === idx;

            return (
              <Box
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Visual Bar Group */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    alignItems: 'flex-end',
                    width: '100%',
                    justifyContent: 'center',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 200ms ease',
                  }}
                >
                  {/* Entry Bar (Inflow Cyan) */}
                  <Box
                    sx={{
                      width: '42%',
                      height: `${Math.max(inHeight, 6)}px`,
                      bgcolor: '#00F0FF',
                      borderRadius: '4px 4px 0 0',
                      boxShadow: isHovered ? '0 0 12px #00F0FF' : 'none',
                      transition: 'all 200ms ease',
                    }}
                  />

                  {/* Exit Bar (Outflow Sky) */}
                  <Box
                    sx={{
                      width: '42%',
                      height: `${Math.max(outHeight, 6)}px`,
                      bgcolor: '#38BDF8',
                      borderRadius: '4px 4px 0 0',
                      boxShadow: isHovered ? '0 0 12px #38BDF8' : 'none',
                      transition: 'all 200ms ease',
                    }}
                  />
                </Box>

                {/* Hour Label */}
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    fontSize: 10,
                    fontWeight: dp.isPeak ? 900 : 700,
                    color: dp.isPeak ? '#EF4444' : 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {dp.hour}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Hover Details Card Popup */}
        {activeHover && activeHoverVals && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              px: 2.5,
              py: 1.25,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(8, 13, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: '1.5px solid #00F0FF',
              boxShadow: '0 8px 30px rgba(0, 240, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                التوقيت: {activeHover.hourLabel}
              </Typography>
              <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#00F0FF' }}>
                {activeHoverVals.name}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">دخول</Typography>
                <Typography variant="body2" fontWeight={900} sx={{ color: '#00F0FF' }}>
                  {activeHoverVals.inVal} سيارة
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">خروج</Typography>
                <Typography variant="body2" fontWeight={900} sx={{ color: '#38BDF8' }}>
                  {activeHoverVals.outVal} سيارة
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">الإشغال</Typography>
                <Typography variant="body2" fontWeight={900} sx={{ color: '#F59E0B' }}>
                  {activeHover.occupancyPercent}%
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </Card>
  );
}
