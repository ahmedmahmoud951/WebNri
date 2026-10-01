import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  alpha,
  useTheme,
  LinearProgress,
} from '@mui/material';

// Material Icons
import LayersIcon from '@mui/icons-material/Layers';
import EvStationIcon from '@mui/icons-material/EvStation';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BoltIcon from '@mui/icons-material/Bolt';
import SensorsIcon from '@mui/icons-material/Sensors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { SaudiPlateBadge } from '../../core/SaudiPlateBadge';

export interface ParkingSlot3D {
  id: string;
  code: string;
  floor: number;
  row: number;
  col: number;
  type: 'regular' | 'ev' | 'vip' | 'accessible';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  // Vehicle details if occupied
  plate?: string;
  driver?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  duration?: string;
  fee?: string;
  // EV Charger details if type === 'ev'
  evPowerKw?: number;
  evBatteryPct?: number;
  evChargingStatus?: 'charging' | 'standby' | 'completed';
  evEnergyDeliveredKwh?: number;
}

export interface FloorMeta {
  index: number;
  name: string;
  arabicTitle: string;
  code: string;
  totalSlots: number;
  occupiedCount: number;
  evCount: number;
  vipCount: number;
  color: string;
}

const FLOORS_DATA: FloorMeta[] = [
  {
    index: 0,
    name: 'P0 - Ground & Fast Lanes',
    arabicTitle: 'الدور الأرضي والقبو (P0 - المسارات السريعة)',
    code: 'P0',
    totalSlots: 32,
    occupiedCount: 22,
    evCount: 6,
    vipCount: 4,
    color: '#00E5FF',
  },
  {
    index: 1,
    name: 'P1 - General & Ultra EV Hub',
    arabicTitle: 'الدور الأول (P1 - منصة شواحن EV المركزية)',
    code: 'P1',
    totalSlots: 36,
    occupiedCount: 27,
    evCount: 8,
    vipCount: 2,
    color: '#10B981',
  },
  {
    index: 2,
    name: 'P2 - Executive & Long-Stay',
    arabicTitle: 'الدور الثاني (P2 - المواقف التنفيذية والفترات الطويلة)',
    code: 'P2',
    totalSlots: 36,
    occupiedCount: 20,
    evCount: 4,
    vipCount: 6,
    color: '#F59E0B',
  },
  {
    index: 3,
    name: 'R - Sky Deck & Helipad VIP',
    arabicTitle: 'سطح المبنى البانورامي (R - مهبط المروحيات VIP)',
    code: 'R',
    totalSlots: 28,
    occupiedCount: 14,
    evCount: 4,
    vipCount: 8,
    color: '#A855F7',
  },
];

interface CyberOperationsCockpitProps {
  onFloorChange?: (floor: number) => void;
  onBarrierCommand?: (gateId: string, cmd: string) => void;
}

export const CyberOperationsCockpit: React.FC<CyberOperationsCockpitProps> = ({ onFloorChange }) => {
  const theme = useTheme();

  // Navigation State
  const [activeFloor, setActiveFloor] = useState<number>(1); // Default Floor 1 (EV Hub)
  const [viewMode, setViewMode] = useState<'floor' | 'building'>('floor'); // 'floor' = 3D Floor Layout, 'building' = 3D Multi-story Building
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot3D | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'available' | 'occupied' | 'ev' | 'vip'>('all');
  const [currentTime, setCurrentTime] = useState<string>('11:30:15');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

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

  // Generate Real High-Fidelity Slots for Current Floor
  const slots: ParkingSlot3D[] = useMemo(() => {
    const list: ParkingSlot3D[] = [];
    const floorMeta = FLOORS_DATA[activeFloor];
    const prefix = floorMeta.code;

    // Real vehicles pool
    const realCars = [
      { plate: 'أ ب ج 1004', driver: 'أحمد بن سلطان الشهري', model: 'تويوتا لاندكروزر VXR', color: '#F8FAFC' },
      { plate: 'س ص ع 9999', driver: 'سعادة وكيل الوزارة', model: 'مرسيدس مايباخ S-Class', color: '#090D16' },
      { plate: 'ر س م 6644', driver: 'عمر بن سعيد باوزير', model: 'تسلا موديل Y Dual-Motor', color: '#38BDF8' },
      { plate: 'د هـ و 2045', driver: 'م. خالد بن منصور', model: 'بي إم دبليو X5 M-Sport', color: '#64748B' },
      { plate: 'ط ر ق 7712', driver: 'د. فهد بن ناصر العتيبي', model: 'لكزس LX600 VIP', color: '#1E293B' },
      { plate: 'ن م ر 3300', driver: 'سمو الأميرة سارة آل سعود', model: 'جينيسيس GV80 Prestige', color: '#991B1B' },
      { plate: 'ح ك م 5520', driver: 'عبد الله بن راشد الشمري', model: 'فورد إكسبيديشن XLT', color: '#D97706' },
      { plate: 'ق و ل 4001', driver: 'تركي بن فهد الدوسري', model: 'هيونداي سوناتا Smart', color: '#CBD5E1' },
      { plate: 'ك هـ ر 8800', driver: 'فيصل بن طلال الحربي', model: 'بورشه تايكان 4S EV', color: '#10B981' },
      { plate: 'ل و ح 2233', driver: 'شركة الإمداد اللوجستي', model: 'إيسوزو ديماكس Heavy-Duty', color: '#E2E8F0' },
    ];

    const rows = 4;
    const cols = Math.ceil(floorMeta.totalSlots / rows);

    let carIdx = 0;
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const slotNum = (r - 1) * cols + c;
        if (slotNum > floorMeta.totalSlots) break;

        const code = `${prefix}-${String(slotNum).padStart(2, '0')}`;
        const isEv = r === 1 && c <= (floorMeta.evCount || 4);
        const isVip = r === rows && c <= (floorMeta.vipCount || 2);
        const isAccessible = r === rows && c === cols;

        let type: ParkingSlot3D['type'] = 'regular';
        if (isEv) type = 'ev';
        else if (isVip) type = 'vip';
        else if (isAccessible) type = 'accessible';

        // Deterministic occupancy
        const isOccupied =
          isEv ||
          (isVip && c % 2 === 1) ||
          (!isEv && !isVip && (slotNum * 7 + activeFloor * 3) % 10 < 7);

        const carData = isOccupied ? realCars[carIdx % realCars.length] : undefined;
        if (isOccupied) carIdx++;

        list.push({
          id: `${prefix}-slot-${slotNum}`,
          code,
          floor: activeFloor,
          row: r,
          col: c,
          type,
          status: isOccupied ? 'occupied' : 'available',
          plate: carData?.plate,
          driver: carData?.driver,
          vehicleModel: carData?.model,
          vehicleColor: carData?.color,
          duration: isOccupied ? `${Math.floor((slotNum * 23) % 180 + 20)} دقيقة` : undefined,
          fee: isOccupied ? `${((slotNum * 12) % 45 + 15).toFixed(0)} ريال` : undefined,
          evPowerKw: isEv ? (activeFloor === 0 ? 350 : 150) : undefined,
          evBatteryPct: isEv && isOccupied ? (slotNum * 17) % 55 + 40 : undefined,
          evChargingStatus: isEv && isOccupied ? 'charging' : 'standby',
          evEnergyDeliveredKwh: isEv && isOccupied ? Number(((slotNum * 8.4) % 65 + 12).toFixed(1)) : undefined,
        });
      }
    }
    return list;
  }, [activeFloor]);

  // Set default selected slot
  useEffect(() => {
    if (!selectedSlot && slots.length > 0) {
      setSelectedSlot(slots[0]);
    }
  }, [slots, selectedSlot]);

  // Filtered Slots
  const displayedSlots = useMemo(() => {
    if (filterType === 'all') return slots;
    if (filterType === 'available') return slots.filter((s) => s.status === 'available');
    if (filterType === 'occupied') return slots.filter((s) => s.status === 'occupied');
    if (filterType === 'ev') return slots.filter((s) => s.type === 'ev');
    if (filterType === 'vip') return slots.filter((s) => s.type === 'vip');
    return slots;
  }, [slots, filterType]);

  // High-End 3D Max Architectural Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let animPulse = 0;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(350, rect.width * dpr);
      canvas.height = Math.max(380, rect.height * dpr);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    const render = () => {
      animPulse += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Futuristic Cyber Ambient Background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.75);
      bgGrad.addColorStop(0, '#0c1524');
      bgGrad.addColorStop(0.6, '#060a12');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Blueprint 3D Isometric Perspective Grid
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 32 * zoomLevel;
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

      ctx.save();

      // =========================================================================
      // MODE A: FULL 3D MULTI-STORY BUILDING ARCHITECTURE (شكل 3D Max للمبنى كامل)
      // =========================================================================
      if (viewMode === 'building') {
        const cx = w * 0.5;
        const cy = h * 0.55;
        const bScale = Math.min(w / 800, h / 600) * 1.1 * zoomLevel;

        ctx.translate(cx, cy);
        ctx.scale(bScale, bScale);

        // Ground Foundation Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.beginPath();
        ctx.ellipse(0, 160, 280, 95, 0, 0, Math.PI * 2);
        ctx.fill();

        // Multi-level stacked 3D slabs (P0, P1, P2, R)
        const floorOffsets = [120, 40, -40, -120]; // Y-positions from bottom to top

        FLOORS_DATA.forEach((fl, idx) => {
          const fy = floorOffsets[idx];
          const isCurrent = activeFloor === fl.index;
          const slabW = 240;
          const slabH = 110;
          const slabThickness = 22;

          // Connecting Support Pillars between floors
          if (idx < 3) {
            const nextFy = floorOffsets[idx + 1];
            ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 1;

            const pillarPositions = [
              { x: -160, y: (fy + nextFy) / 2 },
              { x: 160, y: (fy + nextFy) / 2 },
              { x: 0, y: (fy + nextFy) / 2 + 35 },
              { x: 0, y: (fy + nextFy) / 2 - 35 },
            ];

            pillarPositions.forEach((pos) => {
              ctx.fillRect(pos.x - 6, pos.y - 30, 12, 60);
              ctx.strokeRect(pos.x - 6, pos.y - 30, 12, 60);
            });
          }

          // 3D Slab Top Surface (Isometric Diamond)
          ctx.beginPath();
          ctx.moveTo(0, fy - slabH / 2);
          ctx.lineTo(slabW, fy);
          ctx.lineTo(0, fy + slabH / 2);
          ctx.lineTo(-slabW, fy);
          ctx.closePath();

          const slabGrad = ctx.createLinearGradient(-slabW, fy, slabW, fy);
          if (isCurrent) {
            slabGrad.addColorStop(0, '#0f293a');
            slabGrad.addColorStop(0.5, '#164e63');
            slabGrad.addColorStop(1, '#0e3a4d');
          } else {
            slabGrad.addColorStop(0, '#111827');
            slabGrad.addColorStop(0.5, '#1e293b');
            slabGrad.addColorStop(1, '#0f172a');
          }
          ctx.fillStyle = slabGrad;
          ctx.fill();

          // Slab Edge Lighting
          ctx.strokeStyle = isCurrent ? '#00E5FF' : 'rgba(148, 163, 184, 0.35)';
          ctx.lineWidth = isCurrent ? 3 : 1.5;
          if (isCurrent) {
            ctx.shadowColor = '#00E5FF';
            ctx.shadowBlur = 20;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Slab Front Left Extrusion Face
          ctx.beginPath();
          ctx.moveTo(-slabW, fy);
          ctx.lineTo(0, fy + slabH / 2);
          ctx.lineTo(0, fy + slabH / 2 + slabThickness);
          ctx.lineTo(-slabW, fy + slabThickness);
          ctx.closePath();
          ctx.fillStyle = isCurrent ? '#082f49' : '#0a0f1d';
          ctx.fill();
          ctx.strokeStyle = isCurrent ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)';
          ctx.stroke();

          // Slab Front Right Extrusion Face
          ctx.beginPath();
          ctx.moveTo(0, fy + slabH / 2);
          ctx.lineTo(slabW, fy);
          ctx.lineTo(slabW, fy + slabThickness);
          ctx.lineTo(0, fy + slabH / 2 + slabThickness);
          ctx.closePath();
          ctx.fillStyle = isCurrent ? '#0c4a6e' : '#0f172a';
          ctx.fill();
          ctx.strokeStyle = isCurrent ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)';
          ctx.stroke();

          // Parking slots preview on slab surface
          const previewCars = [
            { x: -90, y: fy - 10, color: '#38BDF8' },
            { x: -45, y: fy + 12, color: '#F59E0B' },
            { x: 30, y: fy - 15, color: '#10B981' },
            { x: 80, y: fy + 10, color: '#FFFFFF' },
          ];

          previewCars.forEach((c) => {
            ctx.fillStyle = c.color;
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, 14, 7, 0.4, 0, Math.PI * 2);
            ctx.fill();
            // Headlights glow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(c.x + 10, c.y - 2, 3, 2);
          });

          // Helipad on top floor (Roof)
          if (idx === 3) {
            ctx.strokeStyle = '#FACC15';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, fy - 6, 45, 22, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#FACC15';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('H', 0, fy - 6);
          }

          // Floor Label Callout Ribbon
          ctx.fillStyle = isCurrent ? '#00E5FF' : 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = isCurrent ? '#00E5FF' : 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          const tagX = -slabW - 40;
          const tagY = fy + 5;
          ctx.beginPath();
          ctx.roundRect(tagX - 90, tagY - 16, 100, 32, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isCurrent ? '#041018' : '#F8FAFC';
          ctx.font = 'bold 12px Cairo, Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fl.code + ' • ' + fl.arabicTitle.split(' ')[0], tagX - 40, tagY);

          // Connecting line from tag to slab
          ctx.strokeStyle = isCurrent ? '#00E5FF' : 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.moveTo(tagX + 10, tagY);
          ctx.lineTo(-slabW, fy);
          ctx.stroke();
        });
      }

      // =========================================================================
      // MODE B: ULTRA-DETAILED 3D FLOOR INTERIOR (المخطط الداخلي 3D Max للدور)
      // =========================================================================
      else {
        const cx = w * 0.5;
        const cy = h * 0.48;
        const fScale = Math.min(w / 780, h / 540) * 1.05 * zoomLevel;

        ctx.translate(cx, cy);
        ctx.scale(fScale, fScale);

        // 1. Asphalt Floor Slab Base
        ctx.fillStyle = '#080d16';
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -170);
        ctx.lineTo(360, 40);
        ctx.lineTo(0, 250);
        ctx.lineTo(-360, 40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Central Driving Lane (Directional Arrows)
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
        ctx.setLineDash([12, 12]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-180, 40);
        ctx.lineTo(180, 40);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // 3. Render Each Slot in 3D Isometric View
        displayedSlots.forEach((slot) => {
          // Isometric projection formulas
          const gridOffsetX = (slot.col - 5) * 64;
          const gridOffsetY = (slot.row - 2.5) * 85;

          const sx = gridOffsetX * 0.866 - gridOffsetY * 0.5;
          const sy = gridOffsetX * 0.28 + gridOffsetY * 0.5;

          const isSelected = selectedSlot?.id === slot.id;
          const isOccupied = slot.status === 'occupied';
          const isEv = slot.type === 'ev';
          const isVip = slot.type === 'vip';

          // Base slot colors
          let slotOutlineColor = 'rgba(0, 229, 255, 0.4)';
          let slotFillColor = 'rgba(15, 23, 42, 0.7)';

          if (isEv) {
            slotOutlineColor = '#10B981';
            slotFillColor = 'rgba(16, 185, 129, 0.12)';
          } else if (isVip) {
            slotOutlineColor = '#F59E0B';
            slotFillColor = 'rgba(245, 158, 11, 0.12)';
          } else if (isOccupied) {
            slotOutlineColor = 'rgba(239, 68, 68, 0.5)';
            slotFillColor = 'rgba(239, 68, 68, 0.08)';
          }

          // Slot 3D Diamond Bay Box
          ctx.beginPath();
          ctx.moveTo(sx, sy - 20);
          ctx.lineTo(sx + 32, sy);
          ctx.lineTo(sx, sy + 20);
          ctx.lineTo(sx - 32, sy);
          ctx.closePath();

          ctx.fillStyle = isSelected ? 'rgba(0, 229, 255, 0.25)' : slotFillColor;
          ctx.fill();

          ctx.strokeStyle = isSelected ? '#00E5FF' : slotOutlineColor;
          ctx.lineWidth = isSelected ? 2.5 : 1.2;
          if (isSelected) {
            ctx.shadowColor = '#00E5FF';
            ctx.shadowBlur = 15;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Ceiling Indicator LED Sensor (Green if vacant, Red if occupied)
          const ledY = sy - 36;
          const ledColor = isOccupied ? '#EF4444' : '#10B981';
          ctx.fillStyle = ledColor;
          ctx.beginPath();
          ctx.arc(sx, ledY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = ledColor;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Sensor beam casting down
          ctx.strokeStyle = isOccupied ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx, ledY);
          ctx.lineTo(sx, sy - 10);
          ctx.stroke();

          // -------------------------------------------------------------
          // A. If Slot is EV: Draw 3D High-Tech Supercharger Kiosk
          // -------------------------------------------------------------
          if (isEv) {
            const kioskX = sx + 24;
            const kioskY = sy - 14;

            // Kiosk Base & Body
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(kioskX - 4, kioskY - 26, 8, 26);
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 1;
            ctx.strokeRect(kioskX - 4, kioskY - 26, 8, 26);

            // Pulsing Neon Top Crown
            const evGlowSize = 4 + Math.sin(animPulse * 3) * 1.5;
            ctx.fillStyle = '#34D399';
            ctx.beginPath();
            ctx.arc(kioskX, kioskY - 28, evGlowSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = '#10B981';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Cable connecting kiosk to vehicle
            if (isOccupied) {
              ctx.strokeStyle = '#10B981';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(kioskX, kioskY - 8);
              ctx.quadraticCurveTo(sx + 14, sy + 4, sx + 6, sy);
              ctx.stroke();

              // Pulsing energy dot on cable
              const t = (Math.sin(animPulse * 4) + 1) / 2;
              const dotX = kioskX * (1 - t) + (sx + 6) * t;
              const dotY = (kioskY - 8) * (1 - t) + sy * t;
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // -------------------------------------------------------------
          // B. If Slot is Occupied: Draw 3D Car Model (شكل عربية مجسمة)
          // -------------------------------------------------------------
          if (isOccupied) {
            const carColor = slot.vehicleColor || '#38BDF8';
            ctx.save();
            ctx.translate(sx, sy);

            // Car Drop Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.ellipse(0, 2, 22, 11, 0, 0, Math.PI * 2);
            ctx.fill();

            // Car Body Lower
            ctx.fillStyle = carColor;
            ctx.beginPath();
            ctx.roundRect(-18, -9, 36, 18, 4);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Windshields & Roof Cabin
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(-9, -6, 18, 12, 3);
            ctx.fill();

            // Front Windshield Glass Reflection
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(5, -5, 3, 10);

            // Headlights & Tail Lights
            ctx.fillStyle = '#FACC15'; // Front Lights
            ctx.fillRect(17, -7, 2, 3);
            ctx.fillRect(17, 4, 2, 3);

            ctx.fillStyle = '#EF4444'; // Rear Lights
            ctx.fillRect(-19, -7, 2, 3);
            ctx.fillRect(-19, 4, 2, 3);

            // Floating Battery Tag for EV Cars
            if (isEv && slot.evBatteryPct) {
              ctx.fillStyle = 'rgba(10, 16, 26, 0.9)';
              ctx.strokeStyle = '#10B981';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.roundRect(-16, -26, 32, 14, 4);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#34D399';
              ctx.font = 'bold 9px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${slot.evBatteryPct}%⚡`, 0, -19);
            }

            ctx.restore();
          } else {
            // Vacant Slot Label
            ctx.fillStyle = isEv ? '#10B981' : isVip ? '#F59E0B' : '#00E5FF';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(slot.code, sx, sy);
          }
        });
      }

      ctx.restore();

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
    };
  }, [displayedSlots, activeFloor, viewMode, selectedSlot, zoomLevel]);

  // Handle floor switch
  const handleSelectFloor = (idx: number) => {
    setActiveFloor(idx);
    onFloorChange?.(idx);
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#070C12',
        color: '#E2E8F0',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        direction: 'rtl',
        fontFamily: 'Cairo, sans-serif',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(0, 229, 255, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* 🚀 TOP BAR: BRANDING + TIME + PERSPECTIVE MODES */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{
          mb: 2.5,
          pb: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: 'rgba(0, 229, 255, 0.1)',
              border: '1.5px solid #00E5FF',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.35)',
            }}
          >
            <ViewInArIcon sx={{ color: '#00E5FF', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, color: '#F8FAFC', fontSize: 17, letterSpacing: -0.2 }}>
              غرفة القيادة والتحكم الميدانية ثلاثية الأبعاد (3D Max Cockpit)
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12 }}>
              المجسم المعماري الحي لمبنى المواقف متعدد الأدوار والمراقبة اللحظية لشواحن EV
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Toggle View Mode: Full Building vs Floor Interior */}
          <Stack direction="row" spacing={0.5} sx={{ bgcolor: 'rgba(15, 23, 42, 0.9)', p: 0.5, borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Button
              size="small"
              variant={viewMode === 'floor' ? 'contained' : 'text'}
              startIcon={<LayersIcon sx={{ ml: 0.5 }} />}
              onClick={() => setViewMode('floor')}
              sx={{
                borderRadius: '8px',
                fontSize: 11,
                fontWeight: 800,
                bgcolor: viewMode === 'floor' ? '#00E5FF' : 'transparent',
                color: viewMode === 'floor' ? '#041018' : '#94A3B8',
              }}
            >
              مخطط الدور 3D
            </Button>
            <Button
              size="small"
              variant={viewMode === 'building' ? 'contained' : 'text'}
              startIcon={<ApartmentIcon sx={{ ml: 0.5 }} />}
              onClick={() => setViewMode('building')}
              sx={{
                borderRadius: '8px',
                fontSize: 11,
                fontWeight: 800,
                bgcolor: viewMode === 'building' ? '#00E5FF' : 'transparent',
                color: viewMode === 'building' ? '#041018' : '#94A3B8',
              }}
            >
              المجسم المعماري للمبنى
            </Button>
          </Stack>

          {/* Live Clock Badge */}
          <Box
            sx={{
              px: 2,
              py: 0.6,
              bgcolor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '10px',
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#00E5FF', fontSize: 14 }}>
              {currentTime}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* 🌟 1. TOP STATS ROW: 6 GLOWING CARDS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15, 23, 42, 0.85)', border: '1.5px solid #00E5FF' }}>
          <Typography sx={{ fontSize: 11, color: '#67E8F9', fontWeight: 700 }}>إجمالي المواقف</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#00E5FF' }}>132 موقف</Typography>
          <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>موزعة عبر 4 طوابق</Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15, 23, 42, 0.85)', border: '1.5px solid #10B981' }}>
          <Typography sx={{ fontSize: 11, color: '#6EE7B7', fontWeight: 700 }}>المواقف الشاغرة</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#10B981' }}>49 شاغر</Typography>
          <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>جاهزة للاستقبال الفوري</Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15, 23, 42, 0.85)', border: '1.5px solid #F59E0B' }}>
          <Typography sx={{ fontSize: 11, color: '#FCD34D', fontWeight: 700 }}>المواقف المشغولة</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#F59E0B' }}>83 مشغول</Typography>
          <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>نسبة الإشغال: 62.8%</Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15, 23, 42, 0.85)', border: '1.5px solid #10B981' }}>
          <Typography sx={{ fontSize: 11, color: '#6EE7B7', fontWeight: 700 }}>شواحن EV الفائقة</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#10B981' }}>22 شاحن</Typography>
          <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>القدرة: تصل 350 kW</Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15, 23, 42, 0.85)', border: '1.5px solid #A855F7' }}>
          <Typography sx={{ fontSize: 11, color: '#D8B4FE', fontWeight: 700 }}>منصات VIP ومهبط</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#A855F7' }}>20 منصة</Typography>
          <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>حجز تشريفي مؤمّن</Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15, 23, 42, 0.85)', border: '1.5px solid #38BDF8' }}>
          <Typography sx={{ fontSize: 11, color: '#7DD3FC', fontWeight: 700 }}>حساسات السقف</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#38BDF8' }}>100% نشطة</Typography>
          <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>ألتراسونيك + كاميرات</Typography>
        </Box>
      </Box>

      {/* 🌟 2. MAIN 3D WORKSPACE (3-PANEL LAYOUT) */}
      <Grid container spacing={2.5}>
        {/* Left Side: Live LPR Feed & Gate Controls */}
        <Grid item xs={12} lg={3}>
          <Box
            sx={{
              bgcolor: 'rgba(10, 16, 26, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#F8FAFC' }}>
                  بث كاميرات LPR اللحظي
                </Typography>
                <Chip size="small" label="مباشر" color="error" sx={{ height: 18, fontSize: 10, fontWeight: 900 }} />
              </Stack>

              <Stack spacing={1}>
                {[
                  { plate: 'أ ب ج 1004', gate: 'البوابة الشمالية (دخول)', time: 'الآن', conf: '99.8%' },
                  { plate: 'س ص ع 9999', gate: 'بوابة VIP التشريفية', time: 'منذ دقيقة', conf: '99.9%' },
                  { plate: 'ر س م 6644', gate: 'مسار شواحن EV', time: 'منذ 3 دقائق', conf: '99.5%' },
                  { plate: 'د هـ و 2045', gate: 'البوابة الجنوبية (خروج)', time: 'منذ 5 دقائق', conf: '98.9%' },
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.2,
                      borderRadius: '10px',
                      bgcolor: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <SaudiPlateBadge plateNumber={item.plate} size="small" />
                      <Chip
                        size="small"
                        label={item.conf}
                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: 9, height: 16 }}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>{item.gate}</Typography>
                      <Typography sx={{ fontSize: 9, color: '#64748B' }}>{item.time}</Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Barrier Gate status */}
            <Box sx={{ mt: 2, p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
              <Typography sx={{ fontWeight: 800, fontSize: 12, mb: 1 }}>حالة بوابات الدخول والخروج</Typography>
              <Stack spacing={0.6}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>بوابة الشمال 1:</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#10B981' }}>مفتوحة ومؤمّنة</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>بوابة الجنوب 2:</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#10B981' }}>مفتوحة ومؤمّنة</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>بوابة VIP الخاصة:</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#38BDF8' }}>تحكم ذكي بالرادار</Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Grid>

        {/* Center: The Core 3D Max Architectural Canvas Viewport */}
        <Grid item xs={12} lg={6}>
          <Box
            sx={{
              bgcolor: 'rgba(8, 14, 22, 0.98)',
              borderRadius: '20px',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              boxShadow: '0 0 35px rgba(0, 229, 255, 0.12)',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Floor Navigation Buttons */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#94A3B8' }}>الطوابق:</Typography>
                {FLOORS_DATA.map((fl) => (
                  <Button
                    key={fl.index}
                    size="small"
                    variant={activeFloor === fl.index ? 'contained' : 'outlined'}
                    onClick={() => handleSelectFloor(fl.index)}
                    sx={{
                      borderRadius: '10px',
                      fontSize: 11,
                      fontWeight: 800,
                      px: 1.5,
                      py: 0.4,
                      bgcolor: activeFloor === fl.index ? '#00E5FF' : 'transparent',
                      color: activeFloor === fl.index ? '#041018' : '#94A3B8',
                      borderColor: 'rgba(0, 229, 255, 0.3)',
                    }}
                  >
                    {fl.code} • {fl.name.split(' - ')[1]?.split(' ')[0] || fl.code}
                  </Button>
                ))}
              </Stack>

              {/* Zoom Controls */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton
                  size="small"
                  onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                  sx={{ color: '#00E5FF', bgcolor: 'rgba(0, 229, 255, 0.1)' }}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                  sx={{ color: '#00E5FF', bgcolor: 'rgba(0, 229, 255, 0.1)' }}
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setZoomLevel(1)}
                  sx={{ color: '#00E5FF', bgcolor: 'rgba(0, 229, 255, 0.1)' }}
                >
                  <CenterFocusStrongIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {/* Filter Pills for slots in floor view */}
            {viewMode === 'floor' && (
              <Stack direction="row" spacing={0.8} sx={{ mb: 1.5 }} flexWrap="wrap">
                <Chip
                  label="كافة المواقف"
                  size="small"
                  color={filterType === 'all' ? 'primary' : 'default'}
                  onClick={() => setFilterType('all')}
                  sx={{ fontWeight: 800, fontSize: 11 }}
                />
                <Chip
                  label="الشاغرة فقط"
                  size="small"
                  color={filterType === 'available' ? 'success' : 'default'}
                  onClick={() => setFilterType('available')}
                  sx={{ fontWeight: 800, fontSize: 11 }}
                />
                <Chip
                  label="المشغولة فقط"
                  size="small"
                  color={filterType === 'occupied' ? 'warning' : 'default'}
                  onClick={() => setFilterType('occupied')}
                  sx={{ fontWeight: 800, fontSize: 11 }}
                />
                <Chip
                  label="شواحن EV"
                  size="small"
                  icon={<FlashOnIcon sx={{ fontSize: '14px !important' }} />}
                  color={filterType === 'ev' ? 'success' : 'default'}
                  onClick={() => setFilterType('ev')}
                  sx={{ fontWeight: 800, fontSize: 11 }}
                />
                <Chip
                  label="منصات VIP"
                  size="small"
                  color={filterType === 'vip' ? 'secondary' : 'default'}
                  onClick={() => setFilterType('vip')}
                  sx={{ fontWeight: 800, fontSize: 11 }}
                />
              </Stack>
            )}

            {/* 3D Canvas Viewport */}
            <Box
              ref={containerRef}
              sx={{
                width: '100%',
                height: 480,
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#04070D',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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

              {/* Legend Badge Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  bgcolor: 'rgba(10, 16, 26, 0.92)',
                  p: 1.2,
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Stack spacing={0.6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#F8FAFC' }}>موقف شاغر (LED أخضر)</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#EF4444', boxShadow: '0 0 8px #EF4444' }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#F8FAFC' }}>موقف مشغول (LED أحمر)</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#34D399', boxShadow: '0 0 8px #34D399' }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#F8FAFC' }}>شاحن EV فائق (350kW)</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Side: Selected Slot Telemetry & EV Charging Inspector */}
        <Grid item xs={12} lg={3}>
          <Box
            sx={{
              bgcolor: 'rgba(10, 16, 26, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {selectedSlot ? (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: 14, color: '#00E5FF' }}>
                    بيانات الموقف: {selectedSlot.code}
                  </Typography>
                  <Chip
                    label={selectedSlot.status === 'occupied' ? 'مشغول' : 'متاح شاغر'}
                    size="small"
                    color={selectedSlot.status === 'occupied' ? 'error' : 'success'}
                    sx={{ fontWeight: 800, height: 20, fontSize: 10 }}
                  />
                </Stack>

                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
                  {FLOORS_DATA[selectedSlot.floor].arabicTitle}
                </Typography>

                {/* If Occupied: Show Vehicle Details */}
                {selectedSlot.status === 'occupied' && (
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      المركبة المتوقفة حالياً:
                    </Typography>

                    {selectedSlot.plate && (
                      <Box sx={{ my: 1, display: 'flex', justifyContent: 'center' }}>
                        <SaudiRealisticPlate
                          plateNumber={selectedSlot.plate}
                          size="sm"
                          showBolts={false}
                          interactive={false}
                        />
                      </Box>
                    )}

                    <Stack spacing={0.6} sx={{ mt: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{selectedSlot.driver}</Typography>
                      <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>{selectedSlot.vehicleModel}</Typography>
                      <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.5 }}>
                        <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>مدة الوقوف:</Typography>
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#38BDF8' }}>{selectedSlot.duration}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                )}

                {/* If EV: Show 3D Max EV Charging Telemetry */}
                {selectedSlot.type === 'ev' && (
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '12px',
                      bgcolor: 'rgba(6, 78, 59, 0.25)',
                      border: '1.5px solid #10B981',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
                      mb: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <BoltIcon sx={{ color: '#10B981', fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 900, fontSize: 12, color: '#34D399' }}>
                        محطة الشحن فائق السرعة ({selectedSlot.evPowerKw} kW)
                      </Typography>
                    </Stack>

                    {selectedSlot.status === 'occupied' ? (
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>حالة الشحن:</Typography>
                          <Typography sx={{ fontSize: 10, fontWeight: 900, color: '#10B981' }}>
                            جاري الشحن السريع (Fast Charging)
                          </Typography>
                        </Stack>

                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>نسبة البطارية:</Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 900, color: '#34D399' }}>
                              {selectedSlot.evBatteryPct}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={selectedSlot.evBatteryPct || 65}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': { bgcolor: '#10B981' },
                            }}
                          />
                        </Box>

                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>الطاقة المستهلكة:</Typography>
                          <Typography sx={{ fontSize: 10, fontWeight: 800 }}>
                            {selectedSlot.evEnergyDeliveredKwh} kWh
                          </Typography>
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography sx={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>
                        الشاحن في وضع الاستعداد وجاهز للتوصيل الفوري
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Ultrasonic Ceiling Sensor Telemetry */}
                <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SensorsIcon sx={{ color: '#00E5FF', fontSize: 18 }} />
                    <Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 700 }}>حساس السقف الكهرومغناطيسي</Typography>
                      <Typography sx={{ fontSize: 9, color: '#94A3B8' }}>حالة الرصد: متصل بنسبة 100%</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', my: 'auto' }}>
                انقر على أي موقف لمعاينة بياناته وتفاصيل الشاحن
              </Typography>
            )}

            {/* Quick floor switcher buttons */}
            <Box sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, mb: 1, color: '#94A3B8' }}>
                الانتقال السريع بين الأدوار:
              </Typography>
              <Grid container spacing={1}>
                {FLOORS_DATA.map((fl) => (
                  <Grid item xs={6} key={fl.index}>
                    <Button
                      fullWidth
                      size="small"
                      variant={activeFloor === fl.index ? 'contained' : 'outlined'}
                      onClick={() => handleSelectFloor(fl.index)}
                      sx={{
                        borderRadius: '8px',
                        fontSize: 10,
                        fontWeight: 800,
                        py: 0.5,
                        bgcolor: activeFloor === fl.index ? '#00E5FF' : 'transparent',
                        color: activeFloor === fl.index ? '#041018' : '#94A3B8',
                        borderColor: 'rgba(0, 229, 255, 0.3)',
                      }}
                    >
                      {fl.code} ({fl.totalSlots - fl.occupiedCount} شاغر)
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
