import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Tooltip,
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
        // Deterministic pseudo-random status
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

  // 3D Canvas Isometric Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Gradient background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 1.5);
      bgGrad.addColorStop(0, '#0c1524');
      bgGrad.addColorStop(1, '#050911');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 32;
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

      // Draw 3D Isometric Compound Building at Left
      const bX = w * 0.32;
      const bY = h * 0.48;

      // Base footprint
      ctx.save();
      ctx.translate(bX, bY);

      // Building Shadows
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(0, 110, 220, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // Building Blocks
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

      // Main Compound Wings
      drawBlock(-60, 40, 160, 80, 130, '#1c2838', '#141d2a', '#182333');
      drawBlock(60, 10, 130, 70, 110, '#223246', '#172230', '#1c293a');
      drawBlock(0, -30, 180, 90, 160, '#26374d', '#1a2636', '#202f43');

      // Windows Matrix glow
      ctx.fillStyle = 'rgba(255, 235, 150, 0.45)';
      for (let f = 1; f <= 5; f++) {
        for (let c = 1; c <= 7; c++) {
          ctx.fillRect(-85 + c * 18, 5 - f * 20, 7, 10);
        }
      }

      ctx.restore();

      // Draw Parking Lots Matrix at Right
      const pX = w * 0.68;
      const pY = h * 0.38;

      ctx.save();
      ctx.translate(pX, pY);

      // Multi-floor deck base
      ctx.fillStyle = '#0f1722';
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
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

        // Slot polygon
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

      angle += 0.01;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [slots, selectedSlot]);

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#070C12',
        color: '#E2E8F0',
        p: { xs: 1.5, sm: 2.5 },
        direction: 'rtl',
        fontFamily: 'Tajawal, Cairo, sans-serif',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(0, 229, 255, 0.15)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* 🚀 TOP BAR: BRANDING + TIME */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          mb: 2.5,
          pb: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: 'rgba(0, 229, 255, 0.1)',
              border: '1.5px solid #00E5FF',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
            }}
          >
            <Typography sx={{ fontWeight: 900, color: '#00E5FF', fontSize: 20 }}>L</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#F8FAFC', letterSpacing: 0.5 }}>
              غرفة القيادة والتحكم الميدانية اللحظية
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              المنصة المتكاملة لمجتمع ومواقف الرياض الذكية
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2.5} alignItems="center">
          {/* Live Clock Badge */}
          <Box
            sx={{
              px: 2,
              py: 0.75,
              bgcolor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: 2,
              boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.15)',
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#00E5FF', fontSize: 16 }}>
              {currentTime}
            </Typography>
          </Box>

          {/* Operator Profile */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#F8FAFC' }}>سارة المنصور</Typography>
              <Typography sx={{ fontSize: 11, color: '#00E5FF' }}>مشرف العمليات</Typography>
            </Box>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '2px solid #00E5FF',
                boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
                background: 'linear-gradient(135deg, #00E5FF 0%, #1E1B4B 100%)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 900,
              }}
            >
              س
            </Box>
          </Stack>
        </Stack>
      </Stack>

      {/* 🌟 1. TOP ROW: 6 GLOWING NEON KPI CARDS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {/* CARD 1: OCCUPANCY (Amber) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #F59E0B',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.25), inset 0 0 15px rgba(245, 158, 11, 0.08)',
            position: 'relative',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#FCD34D' }}>نسبة الإشغال</Typography>
            <Typography sx={{ fontSize: 18 }}>🥧</Typography>
          </Stack>
          <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#F59E0B', mt: 1, letterSpacing: -1 }}>
            78%
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>1,560 / 2,000 موقف</Typography>
        </Box>

        {/* CARD 2: ACTIVE VEHICLES (Cyan) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #00E5FF',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.25), inset 0 0 15px rgba(0, 229, 255, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#67E8F9' }}>مركبات نشطة</Typography>
            <Typography sx={{ fontSize: 18 }}>🚗</Typography>
          </Stack>
          <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#00E5FF', mt: 1, letterSpacing: -1 }}>
            240
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>داخل المجمع الآن</Typography>
        </Box>

        {/* CARD 3: ENTRY/EXIT FLOW (Green) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #10B981',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.25), inset 0 0 15px rgba(16, 185, 129, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#6EE7B7' }}>معدلات الدخول والخروج</Typography>
            <Typography sx={{ fontSize: 18 }}>🔄</Typography>
          </Stack>
          <Typography sx={{ fontSize: 28, fontWeight: 900, color: '#10B981', mt: 1, letterSpacing: -0.5 }}>
            115 / 102 <Typography component="span" sx={{ fontSize: 14 }}>p/h</Typography>
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>تدفق مروري انسيابي</Typography>
        </Box>

        {/* CARD 4: REVENUE (Gold) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #EAB308',
            boxShadow: '0 0 20px rgba(234, 179, 8, 0.25), inset 0 0 15px rgba(234, 179, 8, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#FDE047' }}>الإيرادات</Typography>
            <Typography sx={{ fontSize: 18 }}>💰</Typography>
          </Stack>
          <Typography sx={{ fontSize: 26, fontWeight: 900, color: '#FACC15', mt: 1 }}>
            48,250 <Typography component="span" sx={{ fontSize: 14, fontWeight: 800 }}>SAR</Typography>
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>تسوية الحسابات المعزولة</Typography>
        </Box>

        {/* CARD 5: LPR CAMERAS (Cyan) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #00E5FF',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.25), inset 0 0 15px rgba(0, 229, 255, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#67E8F9' }}>كاميرات LPR المتصلة</Typography>
            <Typography sx={{ fontSize: 18 }}>📹</Typography>
          </Stack>
          <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#00E5FF', mt: 1 }}>
            112 / 115
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>دقة التعرف: 99.4%</Typography>
        </Box>

        {/* CARD 6: EV CHARGERS (Emerald) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid #10B981',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.25), inset 0 0 15px rgba(16, 185, 129, 0.08)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#6EE7B7' }}>شواحن EV متصلة</Typography>
            <Typography sx={{ fontSize: 18 }}>⚡</Typography>
          </Stack>
          <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#10B981', mt: 1 }}>
            18 / 20
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>استهلاك الطاقة: 420 kW</Typography>
        </Box>
      </Box>

      {/* 🌟 2. MAIN COCKPIT: 3 COLUMNS EXACTLY AS IN THE IMAGE */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '280px 1fr 280px' },
          gap: 2.5,
          alignItems: 'stretch',
        }}
      >
        {/* ================= LEFT PANEL: LIVE LPR & BARRIERS ================= */}
        <Box
          sx={{
            bgcolor: 'rgba(10, 16, 26, 0.95)',
            borderRadius: 3.5,
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
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#F8FAFC' }}>
                بث مباشر لكاميرات LPR
              </Typography>
            </Stack>
            <Chip size="small" label="LIVE" sx={{ bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', fontWeight: 900, fontSize: 10, height: 20 }} />
          </Stack>

          {/* Recognized Saudi Plates Feed */}
          <Stack spacing={1.5}>
            {[
              { plate: 'أ ب ج 1004', gate: 'البوابة الشمالية - دخول', time: 'منذ لحظات', conf: '99.8%' },
              { plate: 'س ع د 5431', gate: 'البوابة الجنوبية - دخول', time: 'منذ دقيقة', conf: '99.4%' },
              { plate: 'هـ م ل 8892', gate: 'بوابة المخرج الرئيسي', time: 'منذ 3 دقائق', conf: '98.9%' },
              { plate: 'ط و ق 3000', gate: 'بوابة كبار الشخصيات VIP', time: 'منذ 5 دقائق', conf: '99.9%' },
            ].map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#00E5FF', bgcolor: 'rgba(0, 229, 255, 0.05)' },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <SaudiPlateBadge plateNumber={item.plate} size="small" />
                  <Chip size="small" label={item.conf} sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: 10, height: 18 }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{item.gate}</Typography>
                  <Typography sx={{ fontSize: 10, color: '#64748B' }}>{item.time}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Barrier States Box */}
          <Box
            sx={{
              mt: 'auto',
              p: 2,
              borderRadius: 2.5,
              bgcolor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(0, 229, 255, 0.18)',
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#F8FAFC', mb: 1.5 }}>
              حالة حواجز البوابات
            </Typography>

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>حواجز البوابة الشمالية:</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#10B981' }}>مفتوحة</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>حواجز البوابة الجنوبية:</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#10B981' }}>مفتوحة</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>حواجز بوابة الخروج 2:</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#EF4444' }}>مغلقة</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* ================= CENTER PANEL: 3D BUILDING & FLOOR MAP ================= */}
        <Box
          sx={{
            bgcolor: 'rgba(8, 14, 22, 0.98)',
            borderRadius: 3.5,
            border: '1px solid rgba(0, 229, 255, 0.3)',
            boxShadow: '0 0 35px rgba(0, 229, 255, 0.1)',
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Center Header: Floor Navigation */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#94A3B8' }}>الطوابق:</Typography>
              {['الأرضي (P1)', 'الأول', 'الثاني'].map((fName, idx) => (
                <Button
                  key={idx}
                  size="small"
                  onClick={() => setActiveFloor(idx)}
                  variant={activeFloor === idx ? 'contained' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    fontSize: 12,
                    fontWeight: 800,
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
              sx={{ bgcolor: 'rgba(0, 229, 255, 0.15)', color: '#00E5FF', fontWeight: 800, border: '1px solid #00E5FF' }}
            />
          </Stack>

          {/* 3D Canvas Viewport */}
          <Box
            sx={{
              flex: 1,
              minHeight: 460,
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
              width={800}
              height={460}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                cursor: 'pointer',
              }}
            />

            {/* Bottom Right Legend (matching image) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'rgba(10, 16, 26, 0.88)',
                p: 1.5,
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              }}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>Occupied slots (مشغول)</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>Available slots (متاح)</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>EV Fast chargers (شحن سريع)</Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* ================= RIGHT PANEL: ISSUES KANBAN & HEALTH MATRIX ================= */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* 1. ISSUES KANBAN SUMMARY (Top Box) */}
          <Box
            sx={{
              bgcolor: 'rgba(10, 16, 26, 0.95)',
              borderRadius: 3.5,
              border: '1px solid rgba(0, 229, 255, 0.25)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              p: 2,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#F8FAFC', mb: 1.5 }}>
              لوحة متابعة المشاكل (Issues)
            </Typography>

            {/* 3 Status Cards (Red, Amber, Green) */}
            <Stack spacing={1.2}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#FCA5A5' }}>جديد</Typography>
                <Chip size="small" label="3" sx={{ bgcolor: '#EF4444', color: '#fff', fontWeight: 900, height: 20 }} />
              </Box>

              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #F59E0B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#FCD34D' }}>قيد المعالجة</Typography>
                <Chip size="small" label="2" sx={{ bgcolor: '#F59E0B', color: '#000', fontWeight: 900, height: 20 }} />
              </Box>

              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#6EE7B7' }}>تم الحل</Typography>
                <Chip size="small" label="10" sx={{ bgcolor: '#10B981', color: '#000', fontWeight: 900, height: 20 }} />
              </Box>
            </Stack>
          </Box>

          {/* 2. HARDWARE HEALTH MATRIX (Bottom Box with Pulse Waves) */}
          <Box
            sx={{
              bgcolor: 'rgba(10, 16, 26, 0.95)',
              borderRadius: 3.5,
              border: '1px solid rgba(0, 229, 255, 0.25)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              p: 2,
              flex: 1,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#F8FAFC', mb: 1 }}>
              مصفوفة صحة الأجهزة
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 10, color: '#10B981', fontWeight: 700 }}>● Healthy (Green)</Typography>
              <Typography sx={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>● Warning (Amber)</Typography>
            </Stack>

            {/* Health Rows with ECG Waves */}
            <Stack spacing={1.5}>
              {[
                { name: 'LPR Cameras', status: 'Healthy', color: '#10B981' },
                { name: 'Kiosks & QR', status: 'Healthy', color: '#10B981' },
                { name: 'Gate Barriers', status: 'Healthy', color: '#10B981' },
                { name: 'Parking Sensors', status: 'Warning', color: '#F59E0B' },
              ].map((dev, idx) => (
                <Box key={idx} sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(15, 23, 42, 0.7)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#E2E8F0' }}>{dev.name}</Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: dev.color }}>{dev.status}</Typography>
                  </Stack>
                  {/* Animated ECG SVG line */}
                  <svg width="100%" height="20" viewBox="0 0 200 20">
                    <path
                      d="M0,10 L40,10 L50,3 L60,17 L70,5 L80,14 L90,10 L200,10"
                      fill="none"
                      stroke={dev.color}
                      strokeWidth="1.8"
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
