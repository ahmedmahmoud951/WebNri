import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import { SaudiPlateBadge } from '../../core/SaudiPlateBadge';

interface CyberOperationsCockpitProps {
  onFloorChange?: (floor: number) => void;
  onBarrierCommand?: (gateId: string, cmd: string) => void;
}

export const CyberOperationsCockpit: React.FC<CyberOperationsCockpitProps> = () => {
  const [activeFloor, setActiveFloor] = useState<number>(0); // 0 = Ground/P1, 1 = Floor 1, 2 = Floor 2
  const [selectedSlot, setSelectedSlot] = useState<string | null>('A-104');
  const [currentTime, setCurrentTime] = useState<string>('20:40:15');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('ar-SA', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate slots for active floor
  const slots = React.useMemo(() => {
    const list = [];
    const prefix = activeFloor === 0 ? 'A' : activeFloor === 1 ? 'B' : 'C';
    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= 8; c++) {
        const id = `${prefix}-${r * 100 + c}`;
        const isEv = r === 1 && c <= 3;
        const isOccupied = !isEv && ((r + c) % 3 === 0 || (r * c) % 5 === 0);
        list.push({
          id,
          row: r,
          col: c,
          isEv,
          status: isEv ? 'ev' : isOccupied ? 'occupied' : 'available',
          plate: isOccupied ? (c % 2 === 0 ? 'أ ب ج 1004' : 'س ع د 5431') : null,
          timeParked: isOccupied ? `${r}h ${c * 7}m` : null,
        });
      }
    }
    return list;
  }, [activeFloor]);

  // Responsive Dynamic Canvas Sizing & Isometric Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(300, rect.width * dpr);
      canvas.height = Math.max(280, rect.height * dpr);
    };

    updateSize();

    // ResizeObserver ensures crisp rendering on mobile rotate, window resize, or tablet split-screen
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Gradient background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 1.4);
      bgGrad.addColorStop(0, '#0c1524');
      bgGrad.addColorStop(1, '#050911');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Responsive positioning for Mobile (< 650px) vs Tablet/Desktop
      const isMobile = w < 720;
      const scale = Math.min(1.25, Math.max(0.48, w / 820));

      const bX = isMobile ? w * 0.48 : w * 0.32;
      const bY = isMobile ? h * 0.32 : h * 0.48;

      const pX = isMobile ? w * 0.48 : w * 0.68;
      const pY = isMobile ? h * 0.72 : h * 0.38;

      // Draw 3D Isometric Compound Building
      ctx.save();
      ctx.translate(bX, bY);
      ctx.scale(scale, scale);

      // Building Shadows
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(0, 110, 210, 65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Building Blocks Helper
      const drawBlock = (x: number, y: number, bw: number, bh: number, depth: number, colTop: string, colLeft: string, colRight: string) => {
        // Left Face
        ctx.fillStyle = colLeft;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - bw * 0.7, y + bh * 0.4);
        ctx.lineTo(x - bw * 0.7, y + bh * 0.4 - depth);
        ctx.lineTo(x, y - depth);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.stroke();

        // Right Face
        ctx.fillStyle = colRight;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + bw * 0.7, y + bh * 0.4);
        ctx.lineTo(x + bw * 0.7, y + bh * 0.4 - depth);
        ctx.lineTo(x, y - depth);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.stroke();

        // Top Face
        ctx.fillStyle = colTop;
        ctx.beginPath();
        ctx.moveTo(x, y - depth);
        ctx.lineTo(x - bw * 0.7, y + bh * 0.4 - depth);
        ctx.lineTo(x, y + bh * 0.8 - depth);
        ctx.lineTo(x + bw * 0.7, y + bh * 0.4 - depth);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.stroke();
      };

      // Compound Structure
      drawBlock(-55, 35, 150, 75, 120, '#1c2838', '#141d2a', '#182333');
      drawBlock(55, 10, 120, 65, 100, '#223246', '#172230', '#1c293a');
      drawBlock(0, -25, 170, 85, 150, '#26374d', '#1a2636', '#202f43');

      // Windows Matrix glow
      ctx.fillStyle = 'rgba(255, 235, 150, 0.45)';
      for (let f = 1; f <= 5; f++) {
        for (let c = 1; c <= 7; c++) {
          ctx.fillRect(-78 + c * 17, 5 - f * 19, 6, 9);
        }
      }

      ctx.restore();

      // Draw Parking Lots Matrix
      ctx.save();
      ctx.translate(pX, pY);
      ctx.scale(scale, scale);

      // Deck base
      ctx.fillStyle = '#0f1722';
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.lineTo(190, 60);
      ctx.lineTo(0, 170);
      ctx.lineTo(-190, 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Parking slots grid on deck
      const isoX = (r: number, c: number) => (c - r) * 22;
      const isoY = (r: number, c: number) => (c + r) * 12 + 10;

      slots.forEach((s) => {
        const sx = isoX(s.row, s.col);
        const sy = isoY(s.row, s.col);

        let color = '#00E5FF'; // Available
        let glow = 'rgba(0, 229, 255, 0.4)';
        if (s.status === 'occupied') {
          color = '#F59E0B'; // Occupied Amber
          glow = 'rgba(245, 158, 11, 0.5)';
        } else if (s.status === 'ev') {
          color = '#10B981'; // Neon Green
          glow = 'rgba(16, 185, 129, 0.6)';
        }

        const isSel = s.id === selectedSlot;

        ctx.fillStyle = isSel ? '#ffffff' : color;
        ctx.shadowColor = glow;
        ctx.shadowBlur = isSel ? 16 : 8;

        ctx.beginPath();
        ctx.moveTo(sx, sy - 6);
        ctx.lineTo(sx + 10, sy);
        ctx.lineTo(sx, sy + 6);
        ctx.lineTo(sx - 10, sy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [slots, selectedSlot]);

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#070C12',
        color: '#E2E8F0',
        p: { xs: 1.25, sm: 2, md: 2.5 },
        direction: 'rtl',
        fontFamily: 'Tajawal, Cairo, sans-serif',
        borderRadius: { xs: 2.5, sm: 3.5, md: 4 },
        overflow: 'hidden',
        border: '1px solid rgba(0, 229, 255, 0.15)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* 🚀 TOP BAR: BRANDING + TIME (RESPONSIVE WRAP) */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{
          mb: 2.5,
          pb: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              borderRadius: 2,
              bgcolor: 'rgba(0, 229, 255, 0.1)',
              border: '1.5px solid #00E5FF',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
            }}
          >
            <Typography sx={{ fontWeight: 900, color: '#00E5FF', fontSize: { xs: 16, sm: 20 } }}>L</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, color: '#F8FAFC', fontSize: { xs: 14, sm: 17 }, letterSpacing: 0.3 }}>
              غرفة القيادة والتحكم الميدانية اللحظية
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: { xs: 10, sm: 12 } }}>
              المنصة المتكاملة لمجتمع ومواقف الرياض الذكية
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
          {/* Live Clock Badge */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: 0.5,
              bgcolor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: 2,
              boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.15)',
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#00E5FF', fontSize: { xs: 13, sm: 15 } }}>
              {currentTime}
            </Typography>
          </Box>

          {/* Operator Profile */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 800, color: '#F8FAFC' }}>سارة المنصور</Typography>
              <Typography sx={{ fontSize: { xs: 9, sm: 11 }, color: '#00E5FF' }}>مشرف العمليات</Typography>
            </Box>
            <Box
              sx={{
                width: { xs: 32, sm: 38 },
                height: { xs: 32, sm: 38 },
                borderRadius: '50%',
                border: '2px solid #00E5FF',
                boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
                background: 'linear-gradient(135deg, #00E5FF 0%, #1E1B4B 100%)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: { xs: 12, sm: 14 },
              }}
            >
              س
            </Box>
          </Stack>
        </Stack>
      </Stack>

      {/* 🌟 1. TOP ROW: 6 GLOWING NEON KPI CARDS (ADAPTIVE MOBILE/TABLET GRID) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: { xs: 1.25, sm: 1.75, md: 2 },
          mb: 3,
        }}
      >
        {/* CARD 1: OCCUPANCY */}
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.75, md: 2 },
            borderRadius: { xs: 2, sm: 3 },
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #F59E0B',
            boxShadow: '0 0 18px rgba(245, 158, 11, 0.22), inset 0 0 12px rgba(245, 158, 11, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 700, color: '#FCD34D' }}>نسبة الإشغال</Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 18 } }}>🥧</Typography>
          </Stack>
          <Typography sx={{ fontSize: { xs: 22, sm: 26, md: 32 }, fontWeight: 900, color: '#F59E0B', mt: 0.5, letterSpacing: -1 }}>
            78%
          </Typography>
          <Typography sx={{ fontSize: { xs: 9, sm: 11 }, color: '#94A3B8' }}>1,560 / 2,000 موقف</Typography>
        </Box>

        {/* CARD 2: ACTIVE VEHICLES */}
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.75, md: 2 },
            borderRadius: { xs: 2, sm: 3 },
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #00E5FF',
            boxShadow: '0 0 18px rgba(0, 229, 255, 0.22), inset 0 0 12px rgba(0, 229, 255, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 700, color: '#67E8F9' }}>مركبات نشطة</Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 18 } }}>🚗</Typography>
          </Stack>
          <Typography sx={{ fontSize: { xs: 22, sm: 26, md: 32 }, fontWeight: 900, color: '#00E5FF', mt: 0.5, letterSpacing: -1 }}>
            240
          </Typography>
          <Typography sx={{ fontSize: { xs: 9, sm: 11 }, color: '#94A3B8' }}>داخل المجمع الآن</Typography>
        </Box>

        {/* CARD 3: ENTRY/EXIT FLOW */}
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.75, md: 2 },
            borderRadius: { xs: 2, sm: 3 },
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #10B981',
            boxShadow: '0 0 18px rgba(16, 185, 129, 0.22), inset 0 0 12px rgba(16, 185, 129, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 700, color: '#6EE7B7' }}>الدخول / الخروج</Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 18 } }}>🔄</Typography>
          </Stack>
          <Typography sx={{ fontSize: { xs: 18, sm: 22, md: 28 }, fontWeight: 900, color: '#10B981', mt: 0.5 }}>
            115 / 102 <Typography component="span" sx={{ fontSize: { xs: 10, sm: 12 } }}>p/h</Typography>
          </Typography>
          <Typography sx={{ fontSize: { xs: 9, sm: 11 }, color: '#94A3B8' }}>تدفق انسيابي</Typography>
        </Box>

        {/* CARD 4: REVENUE */}
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.75, md: 2 },
            borderRadius: { xs: 2, sm: 3 },
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #EAB308',
            boxShadow: '0 0 18px rgba(234, 179, 8, 0.22), inset 0 0 12px rgba(234, 179, 8, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 700, color: '#FDE047' }}>الإيرادات</Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 18 } }}>💰</Typography>
          </Stack>
          <Typography sx={{ fontSize: { xs: 18, sm: 22, md: 26 }, fontWeight: 900, color: '#FACC15', mt: 0.5 }}>
            48,250 <Typography component="span" sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 800 }}>SAR</Typography>
          </Typography>
          <Typography sx={{ fontSize: { xs: 9, sm: 11 }, color: '#94A3B8' }}>تسوية مستقلة</Typography>
        </Box>

        {/* CARD 5: LPR CAMERAS */}
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.75, md: 2 },
            borderRadius: { xs: 2, sm: 3 },
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #00E5FF',
            boxShadow: '0 0 18px rgba(0, 229, 255, 0.22), inset 0 0 12px rgba(0, 229, 255, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 700, color: '#67E8F9' }}>كاميرات LPR</Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 18 } }}>📹</Typography>
          </Stack>
          <Typography sx={{ fontSize: { xs: 20, sm: 24, md: 32 }, fontWeight: 900, color: '#00E5FF', mt: 0.5 }}>
            112 / 115
          </Typography>
          <Typography sx={{ fontSize: { xs: 9, sm: 11 }, color: '#94A3B8' }}>دقة الرصد: 99.4%</Typography>
        </Box>

        {/* CARD 6: EV CHARGERS */}
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.75, md: 2 },
            borderRadius: { xs: 2, sm: 3 },
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #10B981',
            boxShadow: '0 0 18px rgba(16, 185, 129, 0.22), inset 0 0 12px rgba(16, 185, 129, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 700, color: '#6EE7B7' }}>شواحن EV</Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 18 } }}>⚡</Typography>
          </Stack>
          <Typography sx={{ fontSize: { xs: 20, sm: 24, md: 32 }, fontWeight: 900, color: '#10B981', mt: 0.5 }}>
            18 / 20
          </Typography>
          <Typography sx={{ fontSize: { xs: 9, sm: 11 }, color: '#94A3B8' }}>القدرة: 420 kW</Typography>
        </Box>
      </Box>

      {/* 🌟 2. MAIN COCKPIT: ADAPTIVE 3-PANEL STACKING (Center 3D First on Mobile/Tablet) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '280px 1fr 280px' },
          gap: { xs: 2, sm: 2.5 },
          alignItems: 'stretch',
        }}
      >
        {/* ================= CENTER PANEL (3D MAP) — TOP PRIORITY ON MOBILE ================= */}
        <Box
          sx={{
            order: { xs: 1, lg: 2 },
            bgcolor: 'rgba(8, 14, 22, 0.98)',
            borderRadius: { xs: 2.5, sm: 3.5 },
            border: '1px solid rgba(0, 229, 255, 0.3)',
            boxShadow: '0 0 35px rgba(0, 229, 255, 0.1)',
            p: { xs: 1.5, sm: 2, md: 2.5 },
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Center Header: Floor Navigation */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>الطوابق:</Typography>
              {['الأرضي (P1)', 'الأول', 'الثاني'].map((fName, idx) => (
                <Button
                  key={idx}
                  size="small"
                  onClick={() => setActiveFloor(idx)}
                  variant={activeFloor === idx ? 'contained' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: 11, sm: 12 },
                    fontWeight: 800,
                    px: { xs: 1.25, sm: 1.75 },
                    py: 0.5,
                    bgcolor: activeFloor === idx ? '#00E5FF' : 'transparent',
                    color: activeFloor === idx ? '#050911' : '#94A3B8',
                    borderColor: 'rgba(0, 229, 255, 0.3)',
                    '&:hover': { bgcolor: activeFloor === idx ? '#38BDF8' : 'rgba(0, 229, 255, 0.1)' },
                  }}
                >
                  {fName}
                </Button>
              ))}
            </Stack>

            <Chip
              size="small"
              label={`الموقف المحدد: ${selectedSlot || 'A-104'}`}
              sx={{ bgcolor: 'rgba(0, 229, 255, 0.15)', color: '#00E5FF', fontWeight: 800, border: '1px solid #00E5FF', fontSize: 11 }}
            />
          </Stack>

          {/* 3D Canvas Viewport (Auto-Sized with Observer) */}
          <Box
            ref={containerRef}
            sx={{
              flex: 1,
              minHeight: { xs: 320, sm: 400, md: 460 },
              width: '100%',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                cursor: 'pointer',
              }}
            />

            {/* Bottom Legend (Adaptive Scale) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 8, sm: 14 },
                right: { xs: 8, sm: 14 },
                bgcolor: 'rgba(10, 16, 26, 0.92)',
                p: { xs: 1, sm: 1.5 },
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#F59E0B', boxShadow: '0 0 6px #F59E0B' }} />
                  <Typography sx={{ fontSize: { xs: 9, sm: 11 }, fontWeight: 700, color: '#F8FAFC' }}>مشغول (Occupied)</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#00E5FF', boxShadow: '0 0 6px #00E5FF' }} />
                  <Typography sx={{ fontSize: { xs: 9, sm: 11 }, fontWeight: 700, color: '#F8FAFC' }}>متاح (Available)</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                  <Typography sx={{ fontSize: { xs: 9, sm: 11 }, fontWeight: 700, color: '#F8FAFC' }}>شاحن EV سريع</Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* ================= LEFT PANEL: LIVE LPR & BARRIERS ================= */}
        <Box
          sx={{
            order: { xs: 2, lg: 1 },
            bgcolor: 'rgba(10, 16, 26, 0.95)',
            borderRadius: { xs: 2.5, sm: 3.5 },
            border: '1px solid rgba(0, 229, 255, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* LPR Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444', boxShadow: '0 0 8px #EF4444' }} />
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#F8FAFC' }}>
                بث مباشر لكاميرات LPR
              </Typography>
            </Stack>
            <Chip size="small" label="LIVE" sx={{ bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', fontWeight: 900, fontSize: 9, height: 18 }} />
          </Stack>

          {/* Recognized Saudi Plates Feed */}
          <Stack spacing={1.25}>
            {[
              { plate: 'أ ب ج 1004', gate: 'البوابة الشمالية - دخول', time: 'منذ لحظات', conf: '99.8%' },
              { plate: 'س ع د 5431', gate: 'البوابة الجنوبية - دخول', time: 'منذ دقيقة', conf: '99.4%' },
              { plate: 'هـ م ل 8892', gate: 'بوابة المخرج الرئيسي', time: 'منذ 3 دقائق', conf: '98.9%' },
              { plate: 'ط و ق 3000', gate: 'بوابة VIP التنفيذية', time: 'منذ 5 دقائق', conf: '99.9%' },
            ].map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#00E5FF', bgcolor: 'rgba(0, 229, 255, 0.05)' },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                  <SaudiPlateBadge plateNumber={item.plate} size="small" />
                  <Chip size="small" label={item.conf} sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: 9, height: 16 }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>{item.gate}</Typography>
                  <Typography sx={{ fontSize: 9, color: '#64748B' }}>{item.time}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Barrier States Box */}
          <Box
            sx={{
              mt: 'auto',
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(0, 229, 255, 0.18)',
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 12, color: '#F8FAFC', mb: 1 }}>
              حالة حواجز البوابات
            </Typography>

            <Stack spacing={0.75}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>حواجز البوابة الشمالية:</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#10B981' }}>مفتوحة</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>حواجز البوابة الجنوبية:</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#10B981' }}>مفتوحة</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>حواجز بوابة الخروج 2:</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#EF4444' }}>مغلقة</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* ================= RIGHT PANEL: ISSUES & HEALTH ================= */}
        <Box
          sx={{
            order: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* 1. ISSUES KANBAN SUMMARY */}
          <Box
            sx={{
              bgcolor: 'rgba(10, 16, 26, 0.95)',
              borderRadius: { xs: 2.5, sm: 3.5 },
              border: '1px solid rgba(0, 229, 255, 0.25)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              p: 2,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#F8FAFC', mb: 1.25 }}>
              لوحة متابعة المشاكل (Issues)
            </Typography>

            <Stack spacing={1}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#FCA5A5' }}>جديد</Typography>
                <Chip size="small" label="3" sx={{ bgcolor: '#EF4444', color: '#fff', fontWeight: 900, height: 18, fontSize: 10 }} />
              </Box>

              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #F59E0B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#FCD34D' }}>قيد المعالجة</Typography>
                <Chip size="small" label="2" sx={{ bgcolor: '#F59E0B', color: '#000', fontWeight: 900, height: 18, fontSize: 10 }} />
              </Box>

              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#6EE7B7' }}>تم الحل</Typography>
                <Chip size="small" label="10" sx={{ bgcolor: '#10B981', color: '#000', fontWeight: 900, height: 18, fontSize: 10 }} />
              </Box>
            </Stack>
          </Box>

          {/* 2. HARDWARE HEALTH MATRIX WITH ECG WAVES */}
          <Box
            sx={{
              bgcolor: 'rgba(10, 16, 26, 0.95)',
              borderRadius: { xs: 2.5, sm: 3.5 },
              border: '1px solid rgba(0, 229, 255, 0.25)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              p: 2,
              flex: 1,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#F8FAFC', mb: 0.75 }}>
              مصفوفة صحة الأجهزة
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ mb: 1.25 }}>
              <Typography sx={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>● Healthy</Typography>
              <Typography sx={{ fontSize: 9, color: '#F59E0B', fontWeight: 700 }}>● Warning</Typography>
            </Stack>

            <Stack spacing={1}>
              {[
                { name: 'LPR Cameras', status: 'Healthy', color: '#10B981' },
                { name: 'Kiosks & QR', status: 'Healthy', color: '#10B981' },
                { name: 'Gate Barriers', status: 'Healthy', color: '#10B981' },
                { name: 'Sensors', status: 'Warning', color: '#F59E0B' },
              ].map((dev, idx) => (
                <Box key={idx} sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'rgba(15, 23, 42, 0.7)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#E2E8F0' }}>{dev.name}</Typography>
                    <Typography sx={{ fontSize: 9, fontWeight: 800, color: dev.color }}>{dev.status}</Typography>
                  </Stack>
                  <svg width="100%" height="16" viewBox="0 0 200 16">
                    <path
                      d="M0,8 L40,8 L50,2 L60,14 L70,4 L80,12 L90,8 L200,8"
                      fill="none"
                      stroke={dev.color}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
