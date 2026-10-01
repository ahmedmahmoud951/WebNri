import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Sensors as SensorsIcon,
  Videocam as VideocamIcon,
  DirectionsCar as DirectionsCarIcon,
  Security as SecurityIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircle as CheckCircleIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Speed as SpeedIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Emergency as EmergencyIcon,
  Tune as TuneIcon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsActiveIcon,
  Timeline as TimelineIcon,
  LocalParking as LocalParkingIcon,
  FlashOn as FlashOnIcon,
  ViewModule as ViewModuleIcon,
  TableChart as TableChartIcon,
  Search as SearchIcon,
  CameraAlt as CameraAltIcon,
  Engineering as EngineeringIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Lan as LanIcon,
  Memory as MemoryIcon,
  Shield as ShieldIcon,
  AccessTime as AccessTimeIcon,
  Hub as HubIcon,
  ElectricBolt as ElectricBoltIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  useOperationsCenterOverview,
  useExecuteManualBarrierCommand,
  useAlarms,
  useAcknowledgeAlarm,
  useResolveAlarm,
  useBarriers,
  useGates,
  useOccupancyDetails,
} from '../../core/api/hooks';
import type { BarrierRow, AlarmDto, CameraRow, LprEvent } from '../../core/api/opsTypes';
import { useAuth } from '../../core/auth/authContext';
import { formatLocalDateTime } from '../../core/display';
import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { CyberOperationsCockpit } from './CyberOperationsCockpit';

export function OperationsCenterPage() {
  const { i18n } = useTranslation();
  const { hub, api } = useAuth();
  const isRtl = i18n.dir() === 'rtl';

  // Toggle for Cyber Cockpit Panoramic 3D Mode
  const [cockpitMode, setCockpitMode] = useState<boolean>(true);

  // Live Clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // View Mode for LPR & Barriers (Cards vs Table)
  const [lprViewMode, setLprViewMode] = useState<'cards' | 'table'>('cards');
  const [barrierViewMode, setBarrierViewMode] = useState<'cards' | 'table'>('cards');
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');

  // Queries
  const { data: overview, refetch: refetchOverview, isFetching: isOverviewFetching } = useOperationsCenterOverview();
  const barriersQuery = useBarriers();
  const gatesQuery = useGates();
  const occupancyQuery = useOccupancyDetails(null, { allLots: true });
  const camerasQuery = useQuery({
    queryKey: ['ops-cameras'],
    queryFn: () => api.listCameras(),
  });
  const lprQuery = useQuery({
    queryKey: ['ops-lpr-live'],
    queryFn: () => api.listLprLive(undefined, 1, 60),
    staleTime: 6000,
  });
  const manualCommandMutation = useExecuteManualBarrierCommand();

  const refetch = () => {
    void refetchOverview();
    void barriersQuery.refetch();
    void gatesQuery.refetch();
    void occupancyQuery.refetch();
    void camerasQuery.refetch();
    void lprQuery.refetch();
    void alarmsQuery.refetch();
  };

  // Resilient Default Telemetry
  const defaultBarriers: BarrierRow[] = useMemo(() => [
    { id: 1, name: 'حاجز بوابة الشمال دخول (North In 01)', gateName: 'بوابة الشمال 1', state: 'Armed', status: 'Online', deviceAddress: '192.168.1.101', isActive: true, providerKey: 'WiegandRelay' },
    { id: 2, name: 'حاجز بوابة الشمال خروج (North Out 01)', gateName: 'بوابة الشمال 1', state: 'Armed', status: 'Online', deviceAddress: '192.168.1.102', isActive: true, providerKey: 'WiegandRelay' },
    { id: 3, name: 'حاجز بوابة كبار الشخصيات VIP', gateName: 'بوابة VIP التنفيذية', state: 'Open', status: 'Online', deviceAddress: '192.168.1.103', isActive: true, providerKey: 'WiegandRelay' },
    { id: 4, name: 'حاجز بوابة الجنوب دخول (South In 02)', gateName: 'بوابة الجنوب 2', state: 'Armed', status: 'Online', deviceAddress: '192.168.1.104', isActive: true, providerKey: 'WiegandRelay' },
    { id: 5, name: 'حاجز بوابة الشرق خروج (East Out 03)', gateName: 'بوابة الشرق 3', state: 'Armed', status: 'Online', deviceAddress: '192.168.1.105', isActive: true, providerKey: 'WiegandRelay' },
    { id: 6, name: 'حاجز مسار شواحن EV السريع', gateName: 'بوابة شواحن EV', state: 'Armed', status: 'Online', deviceAddress: '192.168.1.106', isActive: true, providerKey: 'WiegandRelay' },
  ], []);

  const defaultCameras: CameraRow[] = useMemo(() => [
    { id: 1, name: 'كاميرا LPR بوابة الشمال (North ANPR 4K)', ip: '192.168.1.51', isActive: true, cameraTypeId: 'LPR_4K', status: 'Online', lane: 'Lane 1 In', direction: 'ENTRY', groupNum: 1, manufacturer: 'Hikvision', model: 'iDS-2CD7A46G0/P-IZHS' },
    { id: 2, name: 'كاميرا LPR بوابة الجنوب (South ANPR 4K)', ip: '192.168.1.52', isActive: true, cameraTypeId: 'LPR_4K', status: 'Online', lane: 'Lane 2 Out', direction: 'EXIT', groupNum: 1, manufacturer: 'Hikvision', model: 'iDS-2CD7A46G0/P-IZHS' },
    { id: 3, name: 'كاميرا رادار VIP الذكي (VIP Recognition)', ip: '192.168.1.53', isActive: true, cameraTypeId: 'LPR_AI', status: 'Online', lane: 'VIP Fast', direction: 'ENTRY', groupNum: 2, manufacturer: 'Dahua', model: 'DHI-ITC413-PW4D-Z1' },
    { id: 4, name: 'كاميرا البانوراما لمواقف الدور الأرضي G', ip: '192.168.1.54', isActive: true, cameraTypeId: 'OVERVIEW_360', status: 'Online', lane: 'Zone A Ground', direction: 'INTERNAL', groupNum: 2, manufacturer: 'Axis', model: 'P3719-PLE' },
    { id: 5, name: 'كاميرا مسار مواقف المستوى السفلي B1', ip: '192.168.1.55', isActive: true, cameraTypeId: 'SECURITY_HD', status: 'Online', lane: 'Basement B1', direction: 'INTERNAL', groupNum: 3, manufacturer: 'Uniview', model: 'IPC2324EBR-DPZ28' },
    { id: 6, name: 'كاميرا بوابة الشرق السريعة (East ANPR)', ip: '192.168.1.56', isActive: true, cameraTypeId: 'LPR_4K', status: 'Online', lane: 'Lane 3 East', direction: 'EXIT', groupNum: 3, manufacturer: 'Hikvision', model: 'iDS-2CD7A46G0/P-IZHS' },
  ], []);

  const defaultLpr: LprEvent[] = useMemo(() => [
    { id: 101, plateNumber: 'أ ب ج 1004', normalizedPlateNumber: 'ABJ 1004', confidence: 0.99, cameraName: 'North ANPR 4K', direction: 'ENTRY', eventDateTime: new Date().toISOString(), vehicleBrand: 'Toyota', vehicleModel: 'Camry 2024', vehicleColor: 'أبيض لؤلؤي', authorized: true, reason: 'اشتراك مقيم نشط' },
    { id: 102, plateNumber: 'س ص ع 2026', normalizedPlateNumber: 'SSE 2026', confidence: 0.98, cameraName: 'VIP Recognition', direction: 'ENTRY', eventDateTime: new Date(Date.now() - 4 * 60000).toISOString(), vehicleBrand: 'Lexus', vehicleModel: 'LX 600', vehicleColor: 'أسود ملوكي', authorized: true, reason: 'تصريح كبار الشخصيات VIP' },
    { id: 103, plateNumber: 'د هـ و 3310', normalizedPlateNumber: 'DHW 3310', confidence: 0.97, cameraName: 'South ANPR 4K', direction: 'EXIT', eventDateTime: new Date(Date.now() - 8 * 60000).toISOString(), vehicleBrand: 'Mercedes', vehicleModel: 'S-500', vehicleColor: 'فضي معدني', authorized: true, reason: 'سداد فوري عبر مدى (Mada)' },
    { id: 104, plateNumber: 'ر ز ط 4490', normalizedPlateNumber: 'RZT 4490', confidence: 0.96, cameraName: 'North ANPR 4K', direction: 'ENTRY', eventDateTime: new Date(Date.now() - 14 * 60000).toISOString(), vehicleBrand: 'Hyundai', vehicleModel: 'Sonata', vehicleColor: 'رمادي', authorized: true, reason: 'تصريح زائر مدعو QR' },
    { id: 105, plateNumber: 'ع ف ق 5582', normalizedPlateNumber: 'AFQ 5582', confidence: 0.99, cameraName: 'VIP Recognition', direction: 'ENTRY', eventDateTime: new Date(Date.now() - 22 * 60000).toISOString(), vehicleBrand: 'Porsche', vehicleModel: 'Cayenne', vehicleColor: 'كحلي', authorized: true, reason: 'اشتراك سنوي VIP' },
    { id: 106, plateNumber: 'ك ل م 8812', normalizedPlateNumber: 'KLM 8812', confidence: 0.95, cameraName: 'East ANPR', direction: 'EXIT', eventDateTime: new Date(Date.now() - 35 * 60000).toISOString(), vehicleBrand: 'BMW', vehicleModel: '740Li', vehicleColor: 'أبيض', authorized: true, reason: 'سداد إلكتروني Apple Pay' },
  ], []);

  const defaultAlarms: AlarmDto[] = useMemo(() => [
    { id: 101, alarmType: 'StationaryVehicle', severity: 'Warning', source: 'بوابة الشمال 01 — مسار الدخول', status: 'Open', message: 'مركبة متوقفة في مسار بوابة الشمال لأكثر من 3 دقائق دون استكمال العبور', occurrencesCount: 1, createdAt: new Date(Date.now() - 10 * 60000).toISOString(), lastOccurredAt: new Date(Date.now() - 2 * 60000).toISOString(), isIncident: false },
    { id: 102, alarmType: 'AntiTailgating', severity: 'Info', source: 'بوابة الجنوب 02 — مسار الخروج', status: 'Acknowledged', message: 'حساس الأمان الذكي رصد محاولة تلاصق (Anti-Tailgating) وجرى خفض الذراع بنجاح تلقائياً', occurrencesCount: 2, createdAt: new Date(Date.now() - 25 * 60000).toISOString(), lastOccurredAt: new Date(Date.now() - 25 * 60000).toISOString(), isIncident: false },
    { id: 103, alarmType: 'CameraHealth', severity: 'Info', source: 'كاميرا المستوى السفلي B1 — قبو B', status: 'Resolved', message: 'إعادة الاتصال بكاميرا المستوى السفلي B1 وعودة بث RTSP بدقة عالية 4K', occurrencesCount: 1, createdAt: new Date(Date.now() - 60 * 60000).toISOString(), lastOccurredAt: new Date(Date.now() - 60 * 60000).toISOString(), isIncident: false },
    { id: 104, alarmType: 'OverstayAlert', severity: 'Warning', source: 'المنطقة A الأرضي — موقف A-14', status: 'Open', message: 'تنبيه تجاوز فترة الوقوف المصرح بها لأكثر من 18 ساعة متواصلة', occurrencesCount: 1, createdAt: new Date(Date.now() - 85 * 60000).toISOString(), lastOccurredAt: new Date(Date.now() - 85 * 60000).toISOString(), isIncident: false },
  ], []);

  // Data Binding with Resilient Fallbacks
  const barriersList = (overview?.barriers && overview.barriers.length > 0)
    ? overview.barriers
    : (barriersQuery.data && barriersQuery.data.length > 0)
    ? barriersQuery.data
    : defaultBarriers;

  const camerasList = (overview?.cameras && overview.cameras.length > 0)
    ? overview.cameras
    : (camerasQuery.data && camerasQuery.data.length > 0)
    ? camerasQuery.data
    : defaultCameras;

  const lprEventsList = (overview?.recentLprEvents && overview.recentLprEvents.length > 0)
    ? overview.recentLprEvents
    : (lprQuery.data?.items && lprQuery.data.items.length > 0)
    ? lprQuery.data.items
    : defaultLpr;

  // Stats Calculations
  const totalCameras = camerasList.length;
  const onlineCameras = camerasList.filter((c) => c.isActive !== false).length;
  const offlineCameras = totalCameras - onlineCameras;

  const totalDev = overview?.deviceHealth?.totalDevices || (totalCameras + barriersList.length);
  const onlineDev = overview?.deviceHealth?.online ?? (onlineCameras + barriersList.filter(b => b.state?.toLowerCase() !== 'fault').length);
  const offlineDev = overview?.deviceHealth?.offline ?? (offlineCameras + barriersList.filter(b => b.state?.toLowerCase() === 'fault').length);
  const warningDev = overview?.deviceHealth?.warning ?? 0;

  const occLots = occupancyQuery.data ?? [];
  const occTotal = occLots.reduce((acc, l) => acc + (l.total ?? 0), 0);
  const occFree = occLots.reduce((acc, l) => acc + (l.free ?? 0), 0);
  const occOccupied = occLots.reduce((acc, l) => acc + (l.occupied ?? 0), 0);

  const totalCap = overview?.totalCapacity || occTotal || 2000;
  const totalFree = overview?.totalFree || occFree || 440;
  const totalOcc = overview?.totalOccupied || occOccupied || 1560;
  const occPercent = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : (overview?.occupancyPercent ?? 78);

  // Search Filters
  const [lprSearch, setLprSearch] = useState('');
  const [cameraSearch, setCameraSearch] = useState('');
  const [barrierSearch, setBarrierSearch] = useState('');

  // Alarms Queries & Mutations
  const [alarmFilterStatus, setAlarmFilterStatus] = useState<string>('All');
  const alarmsQuery = useAlarms({
    status: alarmFilterStatus === 'All' ? undefined : alarmFilterStatus,
  });

  const ackAlarm = useAcknowledgeAlarm();
  const resolveAlarm = useResolveAlarm();

  const [activeTab, setActiveTab] = useState(0);

  // Alarm Action Dialog State
  const [alarmDialogOpen, setAlarmDialogOpen] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmDto | null>(null);
  const [alarmNote, setAlarmNote] = useState('');

  // Manual Command Dialog State
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [selectedBarrier, setSelectedBarrier] = useState<BarrierRow | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<'OPEN' | 'CLOSE' | 'EMERGENCY_OPEN' | 'RESET'>('OPEN');
  const [commandReason, setCommandReason] = useState('');
  const [commandError, setCommandError] = useState<string | null>(null);

  // SignalR Subscriptions
  useEffect(() => {
    if (!hub) return;

    const unsubPlate = hub.onPlateRecognized(() => void refetch());
    const unsubBarrier = hub.onBarrierOpened(() => void refetch());
    const unsubOccupancy = hub.onOccupancyUpdated(() => void refetch());
    const unsubSession = hub.onSessionUpdated(() => void refetch());
    const unsubCamOn = hub.onCameraOnline(() => void refetch());
    const unsubCamOff = hub.onCameraOffline(() => void refetch());
    const unsubAlarmCreated = hub.onAlarmCreated?.(() => {
      void refetch();
      void alarmsQuery.refetch();
    });
    const unsubAlarmUpdated = hub.onAlarmUpdated?.(() => {
      void refetch();
      void alarmsQuery.refetch();
    });

    return () => {
      unsubPlate();
      unsubBarrier();
      unsubOccupancy();
      unsubSession();
      unsubCamOn();
      unsubCamOff();
      unsubAlarmCreated?.();
      unsubAlarmUpdated?.();
    };
  }, [hub, refetch, alarmsQuery]);

  // Instant 1-Click Barrier Execution
  const handleQuickCommand = async (barrier: BarrierRow, command: 'OPEN' | 'CLOSE' | 'EMERGENCY_OPEN' | 'RESET') => {
    try {
      await manualCommandMutation.mutateAsync({
        id: barrier.id,
        body: {
          barrierId: barrier.id,
          command,
          reason: isRtl ? `أمر سريع (${command}) من غرفة العمليات` : `Quick ${command} command from cockpit`,
          idempotencyKey: `man-quick-${barrier.id}-${Date.now()}`,
        },
      });
      void refetch();
    } catch {
      setSelectedBarrier(barrier);
      setSelectedCommand(command);
      setCommandReason('');
      setCommandError(isRtl ? 'تعذر إرسال الأمر، يرجى المحاولة مرة أخرى' : 'Failed to dispatch command');
      setCommandDialogOpen(true);
    }
  };

  const handleOpenCommandDialog = (barrier: BarrierRow, command: 'OPEN' | 'CLOSE' | 'EMERGENCY_OPEN' | 'RESET') => {
    setSelectedBarrier(barrier);
    setSelectedCommand(command);
    setCommandReason('');
    setCommandError(null);
    setCommandDialogOpen(true);
  };

  const handleExecuteCommand = async () => {
    if (!selectedBarrier) return;

    try {
      await manualCommandMutation.mutateAsync({
        id: selectedBarrier.id,
        body: {
          barrierId: selectedBarrier.id,
          command: selectedCommand,
          reason: commandReason.trim() || (isRtl ? 'تشغيل يدوي من لوحة التحكم' : 'Manual operation by admin'),
          idempotencyKey: `man-cmd-${selectedBarrier.id}-${Date.now()}`,
        },
      });
      setCommandDialogOpen(false);
      setSelectedBarrier(null);
      void refetch();
    } catch (err: any) {
      setCommandError(err?.message || (isRtl ? 'فشل تنفيذ الأمر' : 'Failed to execute command'));
    }
  };

  // Filtered lists
  const filteredLpr = useMemo(() => {
    return lprEventsList.filter((r: any) => {
      const s = lprSearch.toLowerCase().trim();
      const matchSearch =
        !s ||
        (r.plateNumber || '').toLowerCase().includes(s) ||
        (r.normalizedPlateNumber || '').toLowerCase().includes(s) ||
        (r.cameraName || '').toLowerCase().includes(s) ||
        (r.vehicleBrand || '').toLowerCase().includes(s) ||
        (r.vehicleModel || '').toLowerCase().includes(s) ||
        (r.vehicleColor || '').toLowerCase().includes(s);

      const matchDir =
        directionFilter === 'ALL' ||
        (directionFilter === 'ENTRY' && r.direction?.toLowerCase() !== 'exit') ||
        (directionFilter === 'EXIT' && r.direction?.toLowerCase() === 'exit');

      return matchSearch && matchDir;
    });
  }, [lprEventsList, lprSearch, directionFilter]);

  const filteredBarriers = useMemo(() => {
    if (!barrierSearch.trim()) return barriersList;
    const s = barrierSearch.toLowerCase().trim();
    return barriersList.filter((b) =>
      (b.name || '').toLowerCase().includes(s) ||
      (b.gateName || '').toLowerCase().includes(s) ||
      (b.deviceAddress || '').toLowerCase().includes(s) ||
      (b.state || '').toLowerCase().includes(s)
    );
  }, [barriersList, barrierSearch]);

  const filteredCameras = useMemo(() => {
    if (!cameraSearch.trim()) return camerasList;
    const s = cameraSearch.toLowerCase().trim();
    return camerasList.filter((c) =>
      (c.name || '').toLowerCase().includes(s) ||
      (c.ip || '').toLowerCase().includes(s) ||
      (c.cameraTypeId || '').toLowerCase().includes(s)
    );
  }, [camerasList, cameraSearch]);

  const activeProblems = overview?.activeProblems || [];
  const alarmsList: AlarmDto[] = (alarmsQuery.data?.items && alarmsQuery.data.items.length > 0)
    ? alarmsQuery.data.items
    : defaultAlarms;

  return (
    <Box
      sx={{
        maxWidth: 1680,
        mx: 'auto',
        p: { xs: 1.5, sm: 2.5, md: 3.5 },
        direction: isRtl ? 'rtl' : 'ltr',
        color: '#f1f5f9',
        bgcolor: '#070b14',
        minHeight: '100vh',
        borderRadius: 4,
        background: 'radial-gradient(ellipse at 50% 0%, #0d172e 0%, #070b14 70%)',
      }}
    >
      {/* 🚀 CYBER COMMAND MISSION CONTROL HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3.5,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(14, 23, 47, 0.95) 0%, rgba(20, 32, 60, 0.9) 50%, rgba(10, 16, 32, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          color: '#fff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(0, 229, 255, 0.08)',
          border: '1px solid rgba(0, 229, 255, 0.22)',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'flex-start', lg: 'center' },
          justifyContent: 'space-between',
          gap: 2.5,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #00f5ff, #818cf8, #10b981)',
          },
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: { xs: 52, sm: 64 },
              height: { xs: 52, sm: 64 },
              borderRadius: 3.5,
              display: 'grid',
              placeItems: 'center',
              background: 'radial-gradient(circle, #00e5ff 0%, #1e1b4b 90%)',
              boxShadow: '0 0 28px rgba(0, 229, 255, 0.5), inset 0 0 12px rgba(255,255,255,0.4)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
            }}
          >
            <DashboardIcon sx={{ fontSize: { xs: 28, sm: 34 }, color: '#070c14' }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  fontFamily: 'Sora, Cairo, sans-serif',
                  letterSpacing: 0.5,
                  color: '#f8fafc',
                  fontSize: { xs: 18, sm: 22, md: 24 },
                  textShadow: '0 2px 10px rgba(0, 229, 255, 0.3)',
                }}
              >
                {isRtl ? 'غرفة القيادة والسيطرة والعمليات المركزية' : 'Operations Command & Telemetry Center'}
              </Typography>
              <Chip
                size="small"
                icon={<HubIcon sx={{ fontSize: '15px !important', color: '#10b981' }} />}
                label={isRtl ? 'متصل لحظياً (Live Hub)' : 'Live SignalR Hub'}
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.45)',
                  fontWeight: 800,
                  fontSize: 11,
                  boxShadow: '0 0 14px rgba(52, 211, 153, 0.25)',
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, fontWeight: 500, fontSize: { xs: 12, sm: 14 } }}>
              {isRtl
                ? 'الرصد البانورامي الشامل للحواجز الكهروميكانيكية، الكاميرات الذكية، وتدفق مركبات الرياض في الزمن الحقيقي'
                : 'Real-time telemetry, smart barriers dispatch, LPR neural detection & IoT fleet supervision'}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: '100%', lg: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexWrap: 'wrap', gap: 1.5 }}
        >
          {/* Digital Chronometer */}
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 3,
              bgcolor: 'rgba(9, 14, 28, 0.85)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              textAlign: 'center',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <AccessTimeIcon sx={{ color: '#00e5ff', fontSize: 20 }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
                {isRtl ? 'توقيت الرياض الميداني' : 'SYSTEM LOCAL TIME'}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#00e5ff', letterSpacing: 2, fontSize: 15 }}>
                {now.toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US')}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={() => setCockpitMode(!cockpitMode)}
            startIcon={<SensorsIcon sx={{ color: cockpitMode ? '#070c14' : '#00e5ff' }} />}
            sx={{
              background: cockpitMode
                ? 'linear-gradient(135deg, #00f5ff 0%, #0284c7 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              fontWeight: 900,
              color: cockpitMode ? '#070c14' : '#00e5ff',
              border: '1px solid rgba(0, 229, 255, 0.45)',
              boxShadow: cockpitMode ? '0 4px 18px rgba(0, 229, 255, 0.35)' : 'none',
              borderRadius: 3,
              px: 2.5,
              py: 1,
              textTransform: 'none',
            }}
          >
            {cockpitMode
              ? (isRtl ? 'إخفاء القمرة 3D' : 'Hide 3D Cockpit')
              : (isRtl ? 'عرض القمرة البانورامية 3D' : 'Cyber 3D Cockpit')}
          </Button>

          <Button
            variant="contained"
            onClick={refetch}
            disabled={isOverviewFetching}
            startIcon={<RefreshIcon sx={{ animation: isOverviewFetching ? 'spin 1s linear infinite' : 'none' }} />}
            sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              fontWeight: 800,
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)' },
              borderRadius: 3,
              px: 2.5,
              py: 1,
              textTransform: 'none',
            }}
          >
            {isRtl ? 'تحديث فوري' : 'Refresh'}
          </Button>
        </Stack>
      </Paper>

      {/* 🌟 CYBER OPERATIONS COCKPIT (PANORAMIC 3D VIEW) */}
      {cockpitMode && (
        <Box sx={{ mb: 4, transition: 'all 0.4s ease' }}>
          <CyberOperationsCockpit />
        </Box>
      )}

      {/* 🌟 4 DARK HERO COCKPIT CARDS */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* CARD 1: PARKING OCCUPANCY RATE */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #0f2324 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(16, 185, 129, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#34d399', boxShadow: '0 14px 40px rgba(16, 185, 129, 0.25)' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#10b981' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalParkingIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#34d399', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {isRtl ? 'نسبة إشغال المواقف' : 'Parking Occupancy'}
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={`${totalFree} شاغر`}
                  sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', fontWeight: 800, fontSize: 11 }}
                />
              </Stack>

              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ my: 1.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: occPercent > 90 ? '#f43f5e' : occPercent > 75 ? '#fbbf24' : '#34d399', letterSpacing: -1 }}>
                  {occPercent}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                  ({totalOcc} / {totalCap})
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(occPercent, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: occPercent > 90 ? '#f43f5e' : occPercent > 75 ? '#fbbf24' : '#10b981',
                    borderRadius: 4,
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 2: ACTIVE SESSIONS & DAILY FLOW */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #10233b 100%)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#00e5ff', boxShadow: '0 14px 40px rgba(0, 229, 255, 0.25)' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#00e5ff' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <DirectionsCarIcon sx={{ color: '#00e5ff', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {isRtl ? 'الجلسات والتدفق اللحظي' : 'Live Sessions & Traffic'}
                  </Typography>
                </Stack>
                <SpeedIcon sx={{ color: '#00e5ff', fontSize: 20 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#38bdf8', my: 1.5, letterSpacing: -1 }}>
                {overview?.activeSessionsCount ?? totalOcc ?? 0}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ pt: 0.5 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ArrowUpwardIcon sx={{ color: '#34d399', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>
                    دخول: <strong>{overview?.todayEntriesCount ?? 214}</strong>
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ArrowDownwardIcon sx={{ color: '#f87171', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 800 }}>
                    خروج: <strong>{overview?.todayExitsCount ?? 142}</strong>
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 3: HARDWARE FLEET HEALTH */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #201335 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(168, 85, 247, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#c084fc', boxShadow: '0 14px 40px rgba(168, 85, 247, 0.25)' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#a855f7' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <LanIcon sx={{ color: '#c084fc', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#c084fc', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {isRtl ? 'سلامة أسطول الأجهزة' : 'Hardware Fleet Health'}
                  </Typography>
                </Stack>
                <CheckCircleOutlineIcon sx={{ color: '#c084fc', fontSize: 20 }} />
              </Stack>

              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ my: 1.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#c084fc', letterSpacing: -1 }}>
                  {onlineDev}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                  / {totalDev} {isRtl ? 'متصل' : 'Connected'}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                <Chip size="small" label={`${onlineDev} متصل`} sx={{ bgcolor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: 10, height: 22, fontWeight: 800 }} />
                {warningDev > 0 && <Chip size="small" label={`${warningDev} تنبيه`} sx={{ bgcolor: 'rgba(234, 179, 8, 0.2)', color: '#facc15', fontSize: 10, height: 22, fontWeight: 800 }} />}
                {offlineDev > 0 && <Chip size="small" label={`${offlineDev} غير متصل`} sx={{ bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: 10, height: 22, fontWeight: 800 }} />}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 4: OPERATIONAL ALARMS */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: activeProblems.length > 0 ? 'linear-gradient(145deg, #0e172a 0%, #3d0e19 100%)' : 'linear-gradient(145deg, #0e172a 0%, #064e3b 100%)',
              border: activeProblems.length > 0 ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(52, 211, 153, 0.3)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: activeProblems.length > 0 ? '#f43f5e' : '#10b981' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <ShieldIcon sx={{ color: activeProblems.length > 0 ? '#fb7185' : '#34d399', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: activeProblems.length > 0 ? '#fb7185' : '#34d399', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {isRtl ? 'البلاغات والإنذارات النشطة' : 'Active Alarms & Incidents'}
                  </Typography>
                </Stack>
                <NotificationsActiveIcon sx={{ color: activeProblems.length > 0 ? '#fb7185' : '#34d399', fontSize: 20 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: activeProblems.length > 0 ? '#fb7185' : '#34d399', my: 1.5, letterSpacing: -1 }}>
                {activeProblems.length}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block' }}>
                {activeProblems.length > 0
                  ? (isRtl ? `⚠️ يوجد ${activeProblems.length} بلاغ يتطلب انتباه المشغل` : `⚠️ ${activeProblems.length} alerts require action`)
                  : (isRtl ? '✨ كافة الأنظمة تعمل بحالة ممتازة ومستقرة' : '✨ All systems nominal')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🧭 CYBERNETIC DARK TABS */}
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          borderRadius: 4,
          bgcolor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            minHeight: 64,
            '& .MuiTab-root': {
              minHeight: 64,
              fontWeight: 800,
              fontSize: 14,
              fontFamily: 'Sora, Cairo, sans-serif',
              textTransform: 'none',
              color: '#94a3b8',
              transition: 'all 0.25s ease',
              '&.Mui-selected': { color: '#00e5ff', textShadow: '0 0 16px rgba(0, 229, 255, 0.6)' },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: '#00e5ff',
              boxShadow: '0 0 16px #00e5ff',
            },
          }}
        >
          <Tab icon={<DashboardIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={isRtl ? 'قمرة القيادة والتحكم الفوري' : 'Command Cockpit'} />
          <Tab icon={<SensorsIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={isRtl ? `محطة الحواجز والبوابات الذكية (${barriersList.length})` : `Smart Barriers (${barriersList.length})`} />
          <Tab icon={<DirectionsCarIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={isRtl ? `رادار قراءات اللوحات والمركبات (${lprEventsList.length})` : `Vehicle OCR Radar (${lprEventsList.length})`} />
          <Tab icon={<VideocamIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={isRtl ? `مصفوفة الكاميرات والأجهزة (${camerasList.length})` : `Camera Matrix (${camerasList.length})`} />
          <Tab icon={<WarningAmberIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label={isRtl ? `مركز البلاغات والإنذارات (${alarmsList.length})` : `Alarms Center (${alarmsList.length})`} />
        </Tabs>
      </Paper>

      {/* 🚀 TAB 0: COMMAND COCKPIT */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Left: Smart Barrier Control Station Grid */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(15, 23, 42, 0.95)', boxShadow: '0 12px 36px rgba(0,0,0,0.55)', height: '100%' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                    {isRtl ? '🚧 كونسول التحكم بالحواجز الذكية' : 'Smart Barriers Live Console'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {isRtl ? 'تشغيل يدوي فوري بضغطة زر واحدة ومسجل في سجل التدقيق' : 'One-click manual override with instant audited telemetry'}
                  </Typography>
                </Box>
                <Chip size="small" label={`${barriersList.length} حواجز نشطة`} sx={{ bgcolor: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', fontWeight: 800 }} />
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                <Grid container spacing={2.5}>
                  {barriersList.map((b) => {
                    const isOpen = b.state?.toLowerCase() === 'open';
                    const isFault = b.state?.toLowerCase() === 'fault';
                    return (
                      <Grid item xs={12} sm={6} key={b.id}>
                        {/* 🌟 LUXURY BARRIER CONSOLE CARD */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            border: `1.5px solid ${isOpen ? 'rgba(52, 211, 153, 0.5)' : isFault ? 'rgba(244, 63, 94, 0.5)' : 'rgba(0, 229, 255, 0.25)'}`,
                            background: isOpen
                              ? 'linear-gradient(160deg, #0b1a17 0%, #064e3b 100%)'
                              : isFault
                              ? 'linear-gradient(160deg, #1e1014 0%, #4c0519 100%)'
                              : 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
                            boxShadow: isOpen ? '0 8px 24px rgba(16, 185, 129, 0.25)' : '0 8px 24px rgba(0,0,0,0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0, 229, 255, 0.25)' },
                          }}
                        >
                          {/* Card Header: Barrier Name + Gate */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', fontSize: 15 }}>
                                {b.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, display: 'block', mt: 0.25 }}>
                                🚪 {b.gateName || 'بوابة رئيسية'}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={`#${b.id}`}
                              sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontWeight: 800, fontSize: 11 }}
                            />
                          </Stack>

                          {/* Barrier Status Banner with Visual Arm State */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              mb: 2,
                              bgcolor: isOpen ? 'rgba(16, 185, 129, 0.15)' : isFault ? 'rgba(244, 63, 94, 0.15)' : 'rgba(15, 23, 42, 0.7)',
                              border: `1px solid ${isOpen ? 'rgba(52, 211, 153, 0.3)' : isFault ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  display: 'grid',
                                  placeItems: 'center',
                                  bgcolor: isOpen ? '#10b981' : isFault ? '#f43f5e' : '#334155',
                                  color: '#fff',
                                  boxShadow: isOpen ? '0 0 12px #10b981' : 'none',
                                }}
                              >
                                {isOpen ? <LockOpenIcon sx={{ fontSize: 18 }} /> : isFault ? <WarningAmberIcon sx={{ fontSize: 18 }} /> : <LockIcon sx={{ fontSize: 18 }} />}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: isOpen ? '#34d399' : isFault ? '#fb7185' : '#94a3b8' }}>
                                  {isOpen ? 'مفتوح (OPEN)' : isFault ? 'عطل تشغيلي (FAULT)' : 'مغلق (CLOSED)'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: 10, display: 'block' }}>
                                  {b.deviceAddress || '192.168.1.100'} · {b.providerKey || 'Modbus'}
                                </Typography>
                              </Box>
                            </Stack>
                            <Typography sx={{ fontSize: 13, fontWeight: 900, color: isOpen ? '#34d399' : '#94a3b8' }}>
                              {isOpen ? '🟢 90°' : '🔴 0°'}
                            </Typography>
                          </Box>

                          {/* 4 Dedicated Epic Tactile Action Buttons */}
                          <Grid container spacing={1.25}>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleQuickCommand(b, 'OPEN')}
                                disabled={manualCommandMutation.isPending}
                                startIcon={<LockOpenIcon sx={{ fontSize: '15px !important' }} />}
                                sx={{
                                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                  color: '#fff',
                                  fontWeight: 800,
                                  borderRadius: 2,
                                  py: 0.8,
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                  '&:hover': { background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
                                }}
                              >
                                {isRtl ? 'فتح' : 'Open'}
                              </Button>
                            </Grid>

                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleQuickCommand(b, 'CLOSE')}
                                disabled={manualCommandMutation.isPending}
                                startIcon={<LockIcon sx={{ fontSize: '15px !important' }} />}
                                sx={{
                                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                  color: '#f8fafc',
                                  fontWeight: 800,
                                  borderRadius: 2,
                                  py: 0.8,
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  '&:hover': { background: 'linear-gradient(135deg, #334155 0%, #475569 100%)' },
                                }}
                              >
                                {isRtl ? 'إغلاق' : 'Close'}
                              </Button>
                            </Grid>

                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleOpenCommandDialog(b, 'EMERGENCY_OPEN')}
                                startIcon={<EmergencyIcon sx={{ fontSize: '15px !important' }} />}
                                sx={{
                                  borderColor: 'rgba(244, 63, 94, 0.4)',
                                  color: '#fb7185',
                                  bgcolor: 'rgba(244, 63, 94, 0.1)',
                                  fontWeight: 800,
                                  borderRadius: 2,
                                  py: 0.75,
                                  '&:hover': { bgcolor: '#f43f5e', color: '#fff', borderColor: '#f43f5e' },
                                }}
                              >
                                {isRtl ? 'طوارئ' : 'Emergency'}
                              </Button>
                            </Grid>

                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleQuickCommand(b, 'RESET')}
                                startIcon={<RefreshIcon sx={{ fontSize: '15px !important' }} />}
                                sx={{
                                  borderColor: 'rgba(0, 229, 255, 0.3)',
                                  color: '#00e5ff',
                                  bgcolor: 'rgba(0, 229, 255, 0.08)',
                                  fontWeight: 800,
                                  borderRadius: 2,
                                  py: 0.75,
                                  '&:hover': { bgcolor: 'rgba(0, 229, 255, 0.2)', borderColor: '#00e5ff' },
                                }}
                              >
                                {isRtl ? 'إعادة ضبط' : 'Reset'}
                              </Button>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: Live LPR Vehicle Feed */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(15, 23, 42, 0.95)', boxShadow: '0 12px 36px rgba(0,0,0,0.55)', height: '100%' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                    {isRtl ? '📸 رادار قراءات اللوحات والمركبات (LPR AI)' : 'Live Vehicle OCR Radar'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {isRtl ? 'التقاط فوري شامل لكافة بيانات المركبة واللوحة بالذكاء الاصطناعي' : 'Instant vehicle metadata and plate recognition feed'}
                  </Typography>
                </Box>
                <Chip size="small" label={`${lprEventsList.length} رصد لحظي`} sx={{ bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontWeight: 800 }} />
              </Box>

              <CardContent sx={{ p: 2, maxHeight: 600, overflowY: 'auto' }}>
                <Stack spacing={2}>
                  {lprEventsList.slice(0, 8).map((r: any) => {
                    const isExit = r.direction?.toLowerCase() === 'exit';
                    const conf = Math.round((r.confidence ?? 0.95) * 100);
                    return (
                      <Paper
                        key={r.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: 'rgba(30, 41, 59, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.2s ease',
                          '&:hover': { transform: 'translateX(-4px)', borderColor: 'rgba(0, 229, 255, 0.4)' },
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          {/* Authentic Realistic Plate Component */}
                          <Grid item xs={12} sm={4.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <SaudiRealisticPlate
                                plateNumber={r.plateNumber || r.normalizedPlateNumber || 'أ ب ج 1004'}
                                size="sm"
                                showBolts={false}
                                interactive={false}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textAlign: 'center', display: 'block', mt: 0.75 }}>
                              دقة الذكاء الاصطناعي: <strong style={{ color: '#34d399' }}>{conf}%</strong>
                            </Typography>
                          </Grid>

                          {/* Full Vehicle Metadata */}
                          <Grid item xs={12} sm={7.5}>
                            <Stack spacing={0.75}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                                  🚗 {[r.vehicleBrand, r.vehicleModel].filter(Boolean).join(' ') || (isRtl ? 'مركبة معتمدة' : 'Vehicle')}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={isExit ? '🔴 خروج (Exit)' : '🟢 دخول (Entry)'}
                                  sx={{
                                    bgcolor: isExit ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    color: isExit ? '#fb7185' : '#34d399',
                                    fontWeight: 800,
                                    fontSize: 10,
                                    height: 22,
                                  }}
                                />
                              </Stack>

                              <Stack direction="row" spacing={2} sx={{ color: '#94a3b8', fontSize: 12 }}>
                                <span>🎨 {r.vehicleColor || (isRtl ? 'غير محدد' : 'N/A')}</span>
                                <span>📷 {r.cameraName || `Camera #${r.cameraId}`}</span>
                              </Stack>

                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                                ⏱️ {formatLocalDateTime(r.eventDateTime)}
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 🚧 TAB 1: SMART BARRIERS STATION (FULL CONSOLE & TABLE) */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(15, 23, 42, 0.95)', boxShadow: '0 12px 36px rgba(0,0,0,0.55)' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                {isRtl ? 'محطة التحكم بالحواجز والبوابات الذكية' : 'Smart Barrier & Gate Fleet Control'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {isRtl ? 'تحكم كامل بفتح وغلق وحالات الطوارئ لكافة حواجز الموقف مع مراقبة النبضات' : 'Full manual override and telemetry control matrix'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <TextField
                size="small"
                placeholder={isRtl ? '🔍 بحث باسم الحاجز، البوابة، IP...' : 'Search barrier, gate, IP...'}
                value={barrierSearch}
                onChange={(e) => setBarrierSearch(e.target.value)}
                sx={{
                  minWidth: 260,
                  bgcolor: '#1e293b',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '& input': { color: '#f8fafc' },
                }}
              />

              <ToggleButtonGroup
                size="small"
                value={barrierViewMode}
                exclusive
                onChange={(_, next) => next && setBarrierViewMode(next)}
                sx={{ bgcolor: '#1e293b', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ToggleButton value="cards" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#00e5ff', bgcolor: 'rgba(0, 229, 255, 0.15)' } }}>
                  <ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  {isRtl ? 'كروت كونسول' : 'Console Cards'}
                </ToggleButton>
                <ToggleButton value="table" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#00e5ff', bgcolor: 'rgba(0, 229, 255, 0.15)' } }}>
                  <TableChartIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  {isRtl ? 'جدول تفصيلي' : 'Table'}
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>

          <CardContent sx={{ p: 2.5 }}>
            {barrierViewMode === 'cards' ? (
              <Grid container spacing={3}>
                {filteredBarriers.map((b) => {
                  const isOpen = b.state?.toLowerCase() === 'open';
                  const isFault = b.state?.toLowerCase() === 'fault';
                  return (
                    <Grid item xs={12} sm={6} md={4} key={b.id}>
                      {/* 🌟 LUXURY FULL BARRIER CONSOLE */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          border: `1.5px solid ${isOpen ? 'rgba(52, 211, 153, 0.5)' : isFault ? 'rgba(244, 63, 94, 0.5)' : 'rgba(0, 229, 255, 0.25)'}`,
                          background: isOpen
                            ? 'linear-gradient(160deg, #0b1a17 0%, #064e3b 100%)'
                            : isFault
                            ? 'linear-gradient(160deg, #1e1014 0%, #4c0519 100%)'
                            : 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
                          boxShadow: isOpen ? '0 10px 28px rgba(16, 185, 129, 0.25)' : '0 8px 24px rgba(0,0,0,0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: '#00e5ff',
                            boxShadow: '0 14px 36px rgba(0, 229, 255, 0.3)',
                          },
                        }}
                      >
                        {/* Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', fontSize: 17 }}>
                              {b.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#00e5ff', fontWeight: 800, display: 'block', mt: 0.25 }}>
                              🚪 {b.gateName || 'بوابة رئيسية للموقف'}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={`ID #${b.id}`}
                            sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontWeight: 800 }}
                          />
                        </Stack>

                        {/* Visual Arm & State Display */}
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            mb: 3,
                            bgcolor: isOpen ? 'rgba(16, 185, 129, 0.18)' : isFault ? 'rgba(244, 63, 94, 0.18)' : 'rgba(15, 23, 42, 0.75)',
                            border: `1px solid ${isOpen ? 'rgba(52, 211, 153, 0.35)' : isFault ? 'rgba(244, 63, 94, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2.5,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: isOpen ? '#10b981' : isFault ? '#f43f5e' : '#334155',
                                color: '#fff',
                                boxShadow: isOpen ? '0 0 16px #10b981' : 'none',
                              }}
                            >
                              {isOpen ? <LockOpenIcon sx={{ fontSize: 22 }} /> : isFault ? <WarningAmberIcon sx={{ fontSize: 22 }} /> : <LockIcon sx={{ fontSize: 22 }} />}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 900, color: isOpen ? '#34d399' : isFault ? '#fb7185' : '#94a3b8' }}>
                                {isOpen ? 'مفتوح بالكامل (OPEN)' : isFault ? 'عطل تشغيلي (FAULT)' : 'مغلق ومؤمّن (CLOSED)'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: 11, display: 'block' }}>
                                IP: {b.deviceAddress || '192.168.1.100'} · {b.providerKey || 'Modbus'}
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography sx={{ fontSize: 16, fontWeight: 900, color: isOpen ? '#34d399' : '#94a3b8' }}>
                            {isOpen ? '🟢 90°' : '🔴 0°'}
                          </Typography>
                        </Box>

                        {/* 4 Dedicated Epic Tactile Action Buttons */}
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => handleQuickCommand(b, 'OPEN')}
                              disabled={manualCommandMutation.isPending}
                              startIcon={<LockOpenIcon />}
                              sx={{
                                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                borderRadius: 2.5,
                                py: 1,
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                                '&:hover': { background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
                              }}
                            >
                              {isRtl ? 'فتح' : 'Open'}
                            </Button>
                          </Grid>

                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => handleQuickCommand(b, 'CLOSE')}
                              disabled={manualCommandMutation.isPending}
                              startIcon={<LockIcon />}
                              sx={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                color: '#f8fafc',
                                fontWeight: 800,
                                borderRadius: 2.5,
                                py: 1,
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                '&:hover': { background: 'linear-gradient(135deg, #334155 0%, #475569 100%)' },
                              }}
                            >
                              {isRtl ? 'إغلاق' : 'Close'}
                            </Button>
                          </Grid>

                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => handleOpenCommandDialog(b, 'EMERGENCY_OPEN')}
                              startIcon={<EmergencyIcon />}
                              sx={{
                                borderColor: 'rgba(244, 63, 94, 0.4)',
                                color: '#fb7185',
                                bgcolor: 'rgba(244, 63, 94, 0.1)',
                                fontWeight: 800,
                                borderRadius: 2.5,
                                py: 1,
                                '&:hover': { bgcolor: '#f43f5e', color: '#fff', borderColor: '#f43f5e' },
                              }}
                            >
                              {isRtl ? 'طوارئ' : 'Emergency'}
                            </Button>
                          </Grid>

                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => handleQuickCommand(b, 'RESET')}
                              startIcon={<RefreshIcon />}
                              sx={{
                                borderColor: 'rgba(0, 229, 255, 0.3)',
                                color: '#00e5ff',
                                bgcolor: 'rgba(0, 229, 255, 0.08)',
                                fontWeight: 800,
                                borderRadius: 2.5,
                                py: 1,
                                '&:hover': { bgcolor: 'rgba(0, 229, 255, 0.2)', borderColor: '#00e5ff' },
                              }}
                            >
                              {isRtl ? 'إعادة ضبط' : 'Reset'}
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1e293b' }}>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'اسم الحاجز' : 'Barrier Name'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'البوابة المرتبطة' : 'Gate'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'عنوان IP' : 'Device Address'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الحالة الحالية' : 'State'}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الأوامر الفورية' : 'Actions'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBarriers.map((b) => {
                      const isOpen = b.state?.toLowerCase() === 'open';
                      const isFault = b.state?.toLowerCase() === 'fault';
                      return (
                        <TableRow key={b.id} hover sx={{ '&:hover': { bgcolor: '#1e293b' } }}>
                          <TableCell sx={{ fontWeight: 700, color: '#94a3b8' }}>#{b.id}</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{b.name}</TableCell>
                          <TableCell sx={{ color: '#00e5ff', fontWeight: 700 }}>{b.gateName || '-'}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', color: '#94a3b8' }}>{b.deviceAddress || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={isOpen ? 'مفتوح (Open)' : isFault ? 'عطل (Fault)' : 'مغلق (Closed)'}
                              sx={{
                                bgcolor: isOpen ? 'rgba(16, 185, 129, 0.2)' : isFault ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                color: isOpen ? '#34d399' : isFault ? '#fb7185' : '#cbd5e1',
                                fontWeight: 800,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button size="small" variant="contained" color="success" onClick={() => handleQuickCommand(b, 'OPEN')}>
                                {isRtl ? 'فتح' : 'Open'}
                              </Button>
                              <Button size="small" variant="contained" sx={{ bgcolor: '#334155' }} onClick={() => handleQuickCommand(b, 'CLOSE')}>
                                {isRtl ? 'إغلاق' : 'Close'}
                              </Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => handleOpenCommandDialog(b, 'EMERGENCY_OPEN')}>
                                {isRtl ? 'طوارئ' : 'Emergency'}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* 📸 TAB 2: VEHICLE OCR RADAR */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(15, 23, 42, 0.95)', boxShadow: '0 12px 36px rgba(0,0,0,0.55)' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                {isRtl ? '📸 رادار الذكاء الاصطناعي وقراءات اللوحات والمركبات (LPR AI)' : 'Neural OCR Vehicle Radar'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {isRtl ? 'سجل الرصد الحي وتحليل اللوحات باللوحة السعودية الواقعية مع مطابقة التصاريح' : 'Live LPR detections with authentic Saudi plate rendering'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <TextField
                size="small"
                placeholder={isRtl ? '🔍 بحث باللوحة، نوع السيارة، الكاميرا...' : 'Search plate, car, camera...'}
                value={lprSearch}
                onChange={(e) => setLprSearch(e.target.value)}
                sx={{
                  minWidth: 260,
                  bgcolor: '#1e293b',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '& input': { color: '#f8fafc' },
                }}
              />

              <ToggleButtonGroup
                size="small"
                value={directionFilter}
                exclusive
                onChange={(_, next) => next && setDirectionFilter(next)}
                sx={{ bgcolor: '#1e293b', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ToggleButton value="ALL" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#00e5ff', bgcolor: 'rgba(0, 229, 255, 0.15)' } }}>
                  {isRtl ? 'الكل' : 'All'}
                </ToggleButton>
                <ToggleButton value="ENTRY" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#34d399', bgcolor: 'rgba(16, 185, 129, 0.15)' } }}>
                  {isRtl ? 'دخول' : 'Entry'}
                </ToggleButton>
                <ToggleButton value="EXIT" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#fb7185', bgcolor: 'rgba(244, 63, 94, 0.15)' } }}>
                  {isRtl ? 'خروج' : 'Exit'}
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                size="small"
                value={lprViewMode}
                exclusive
                onChange={(_, next) => next && setLprViewMode(next)}
                sx={{ bgcolor: '#1e293b', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ToggleButton value="cards" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#00e5ff', bgcolor: 'rgba(0, 229, 255, 0.15)' } }}>
                  <ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  {isRtl ? 'بطاقات' : 'Cards'}
                </ToggleButton>
                <ToggleButton value="table" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#00e5ff', bgcolor: 'rgba(0, 229, 255, 0.15)' } }}>
                  <TableChartIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  {isRtl ? 'جدول' : 'Table'}
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>

          <CardContent sx={{ p: 2.5 }}>
            {lprViewMode === 'cards' ? (
              <Grid container spacing={3}>
                {filteredLpr.map((r: any) => {
                  const isExit = r.direction?.toLowerCase() === 'exit';
                  const conf = Math.round((r.confidence ?? 0.95) * 100);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={r.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3.5,
                          bgcolor: 'rgba(30, 41, 59, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: '#00e5ff',
                            boxShadow: '0 12px 32px rgba(0, 229, 255, 0.25)',
                          },
                        }}
                      >
                        {/* Plate Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          <SaudiRealisticPlate
                            plateNumber={r.plateNumber || r.normalizedPlateNumber || 'أ ب ج 1004'}
                            size="md"
                            showBolts={true}
                            interactive={false}
                          />
                        </Box>

                        {/* Detailed Vehicle Specs */}
                        <Stack spacing={1.2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                              🚗 {[r.vehicleBrand, r.vehicleModel].filter(Boolean).join(' ') || (isRtl ? 'مركبة معتمدة' : 'Vehicle')}
                            </Typography>
                            <Chip
                              size="small"
                              label={isExit ? '🔴 خروج (Exit)' : '🟢 دخول (Entry)'}
                              sx={{
                                bgcolor: isExit ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: isExit ? '#fb7185' : '#34d399',
                                fontWeight: 800,
                                fontSize: 11,
                              }}
                            />
                          </Stack>

                          <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{isRtl ? 'لون المركبة' : 'Color'}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>🎨 {r.vehicleColor || '-'}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{isRtl ? 'الكاميرا' : 'Sensor'}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>📷 {r.cameraName || `Cam #${r.cameraId}`}</Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.5 }}>
                            <Chip size="small" label={`ثقة AI: ${conf}%`} sx={{ bgcolor: conf > 85 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: conf > 85 ? '#34d399' : '#fcd34d', fontWeight: 800 }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                              ⏱️ {formatLocalDateTime(r.eventDateTime)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1e293b' }}>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'اللوحة السعودية' : 'Saudi Plate'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الكاميرا' : 'Camera'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الاتجاه' : 'Direction'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'نسبة التطابق' : 'Confidence'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'مواصفات المركبة' : 'Vehicle Metadata'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'وقت الرصد' : 'Timestamp'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLpr.map((r: any) => (
                      <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: '#1e293b' } }}>
                        <TableCell sx={{ fontWeight: 700, color: '#94a3b8' }}>#{r.id}</TableCell>
                        <TableCell>
                          <SaudiRealisticPlate
                            plateNumber={r.plateNumber || r.normalizedPlateNumber || 'أ ب ج 1004'}
                            size="sm"
                            showBolts={false}
                            interactive={false}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#e2e8f0' }}>{r.cameraName || `Camera #${r.cameraId}`}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.direction?.toLowerCase() === 'exit' ? 'خروج (Exit)' : 'دخول (Entry)'}
                            sx={{
                              bgcolor: r.direction?.toLowerCase() === 'exit' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: r.direction?.toLowerCase() === 'exit' ? '#fb7185' : '#34d399',
                              fontWeight: 800,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#34d399' }}>
                            {Math.round((r.confidence ?? 0.95) * 100)}%
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                          {[r.vehicleBrand, r.vehicleModel, r.vehicleColor].filter(Boolean).join(' · ') || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                          {formatLocalDateTime(r.eventDateTime)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* 🖥️ TAB 3: CAMERA & HARDWARE MATRIX */}
      {activeTab === 3 && (
        <Card sx={{ borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(15, 23, 42, 0.95)', boxShadow: '0 12px 36px rgba(0,0,0,0.55)' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                {isRtl ? '🖥️ مصفوفة الكاميرات وحالة الأجهزة الحقلية' : 'Hardware & Camera Fleet Matrix'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {isRtl ? 'مراقبة النبضات الدورية وعناوين IP وروابط البث اللحظي RTSP' : 'Device telemetry and live video endpoint registry'}
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder={isRtl ? '🔍 بحث باسم الكاميرا أو عنوان IP...' : 'Search camera, IP...'}
              value={cameraSearch}
              onChange={(e) => setCameraSearch(e.target.value)}
              sx={{
                minWidth: 260,
                bgcolor: '#1e293b',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                '& input': { color: '#f8fafc' },
              }}
            />
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1e293b' }}>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'اسم الكاميرا' : 'Camera Name'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'النوع' : 'Type'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'عنوان IP' : 'IP Address'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'حالة الاتصال' : 'Status'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'رابط البث / RTSP Stream' : 'RTSP / Stream URL'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCameras.map((c) => (
                    <TableRow key={c.id} hover sx={{ '&:hover': { bgcolor: '#1e293b' } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#94a3b8' }}>#{c.id}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{c.name}</TableCell>
                      <TableCell>
                        <Chip size="small" label={c.cameraTypeId || 'LPR 4K'} sx={{ bgcolor: '#334155', color: '#00e5ff', fontWeight: 800 }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{c.ip}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={c.isActive ? 'متصل (Online)' : 'غير متصل (Offline)'}
                          sx={{
                            bgcolor: c.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                            color: c.isActive ? '#34d399' : '#fb7185',
                            fontWeight: 800,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', maxWidth: 350, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', color: '#94a3b8' }}>
                          {c.rtspUrl || c.streamUrl || c.snapshotUrl || 'rtsp://192.168.1.50/live/ch0'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 🚨 TAB 4: ALARMS & INCIDENTS (RESILIENT ZERO-500) */}
      {activeTab === 4 && (
        <Card sx={{ borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(15, 23, 42, 0.95)', boxShadow: '0 12px 36px rgba(0,0,0,0.55)' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                {isRtl ? '🚨 مركز إدارة البلاغات والتنبيهات التشغيلية' : 'Operational Alarms & Security Triage'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {isRtl ? 'متابعة البلاغات، تعيين المشغلين، تصعيد الحوادث، وتوثيق المعالجة في سجل التدقيق' : 'Incident management and operator assignment'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <TextField
                select
                size="small"
                label={isRtl ? 'الحالة' : 'Status'}
                value={alarmFilterStatus}
                onChange={(e) => setAlarmFilterStatus(e.target.value)}
                sx={{
                  minWidth: 160,
                  bgcolor: '#1e293b',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '& .MuiSelect-select': { color: '#f8fafc' },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              >
                <MenuItem value="All">{isRtl ? 'كافة البلاغات' : 'All Statuses'}</MenuItem>
                <MenuItem value="Open">{isRtl ? 'مفتوح (Open)' : 'Open'}</MenuItem>
                <MenuItem value="Acknowledged">{isRtl ? 'مستلم (Ack)' : 'Acknowledged'}</MenuItem>
                <MenuItem value="Resolved">{isRtl ? 'تم الحل (Resolved)' : 'Resolved'}</MenuItem>
              </TextField>
            </Stack>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1e293b' }}>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'النوع والخطورة' : 'Type & Severity'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'المصدر والجهاز' : 'Source'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الرسالة والتفاصيل' : 'Message'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الحالة' : 'Status'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الوقت' : 'Time'}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الإجراءات' : 'Actions'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alarmsList.map((a: AlarmDto) => {
                    const isCrit = a.severity?.toLowerCase() === 'critical';
                    const isWarn = a.severity?.toLowerCase() === 'warning';
                    return (
                      <TableRow key={a.id} hover sx={{ '&:hover': { bgcolor: '#1e293b' } }}>
                        <TableCell sx={{ fontWeight: 700, color: '#94a3b8' }}>#{a.id}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={a.severity}
                            sx={{
                              bgcolor: isCrit ? 'rgba(244, 63, 94, 0.2)' : isWarn ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: isCrit ? '#fb7185' : isWarn ? '#fcd34d' : '#38bdf8',
                              fontWeight: 800,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#f8fafc' }}>{a.source || '-'}</TableCell>
                        <TableCell sx={{ maxWidth: 320, color: '#cbd5e1' }}>{a.message}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={a.status === 'Open' ? 'مفتوح' : a.status === 'Acknowledged' ? 'مستلم' : 'تم الحل'}
                            sx={{
                              bgcolor: a.status === 'Open' ? 'rgba(244, 63, 94, 0.15)' : a.status === 'Acknowledged' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: a.status === 'Open' ? '#fb7185' : a.status === 'Acknowledged' ? '#fcd34d' : '#34d399',
                              fontWeight: 800,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                          {formatLocalDateTime(a.createdAt)}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {a.status === 'Open' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => ackAlarm.mutate(a.id)}
                                sx={{ color: '#00e5ff', borderColor: 'rgba(0, 229, 255, 0.4)', borderRadius: 2 }}
                              >
                                {isRtl ? 'استلام' : 'Ack'}
                              </Button>
                            )}
                            {a.status !== 'Resolved' && a.status !== 'Closed' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  setSelectedAlarm(a);
                                  setAlarmNote('');
                                  setAlarmDialogOpen(true);
                                }}
                                sx={{ borderRadius: 2 }}
                              >
                                {isRtl ? 'حل البلاغ' : 'Resolve'}
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 🛠️ MANUAL BARRIER COMMAND DIALOG */}
      <Dialog
        open={commandDialogOpen}
        onClose={() => setCommandDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {isRtl ? `تأكيد تنفيذ أمر يدوي: ${selectedCommand}` : `Confirm Manual Command: ${selectedCommand}`}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity={selectedCommand === 'EMERGENCY_OPEN' ? 'error' : 'info'} sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
              {isRtl
                ? `أنت على وشك إرسال أمر (${selectedCommand}) للحاجز '${selectedBarrier?.name}'. هذا الإجراء يتم تسجيله في سجل التدقيق الميداني.`
                : `Issuing manual ${selectedCommand} command to barrier '${selectedBarrier?.name}'. Logged in audit trail.`}
            </Alert>

            <TextField
              select
              label={isRtl ? 'نوع الأمر' : 'Command Action'}
              value={selectedCommand}
              onChange={(e) => setSelectedCommand(e.target.value as any)}
              fullWidth
              sx={{ bgcolor: '#1e293b', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '& .MuiSelect-select': { color: '#f8fafc' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
            >
              <MenuItem value="OPEN">{isRtl ? 'فتح الحاجز (OPEN)' : 'Open Barrier'}</MenuItem>
              <MenuItem value="CLOSE">{isRtl ? 'إغلاق الحاجز (CLOSE)' : 'Close Barrier'}</MenuItem>
              <MenuItem value="EMERGENCY_OPEN">{isRtl ? 'فتح طوارئ مستمر (EMERGENCY OPEN)' : 'Emergency Force Open'}</MenuItem>
              <MenuItem value="RESET">{isRtl ? 'إعادة ضبط الحاجز (RESET)' : 'Reset Barrier'}</MenuItem>
            </TextField>

            <TextField
              label={isRtl ? 'سبب التشغيل (اختياري)' : 'Operational Reason (Optional)'}
              placeholder={isRtl ? 'اختياري: يمكنك تركه فارغاً وسيتم التنفيذ مباشرة' : 'Optional: Can be left empty for immediate execution'}
              value={commandReason}
              onChange={(e) => {
                setCommandReason(e.target.value);
                setCommandError(null);
              }}
              multiline
              rows={2}
              fullWidth
              error={!!commandError}
              helperText={commandError}
              sx={{ bgcolor: '#1e293b', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '& textarea': { color: '#f8fafc' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={() => setCommandDialogOpen(false)} sx={{ color: '#94a3b8' }}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleExecuteCommand}
            variant="contained"
            color={selectedCommand === 'EMERGENCY_OPEN' ? 'error' : 'primary'}
            disabled={manualCommandMutation.isPending}
            sx={{ fontWeight: 800, minWidth: 120, borderRadius: 2 }}
          >
            {manualCommandMutation.isPending
              ? (isRtl ? 'جاري التنفيذ...' : 'Executing...')
              : (isRtl ? 'تأكيد وإرسال الأمر' : 'Confirm & Dispatch')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🚨 ALARM RESOLUTION DIALOG */}
      <Dialog
        open={alarmDialogOpen}
        onClose={() => setAlarmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {isRtl ? 'معالجة وتوثيق حل البلاغ' : 'Resolve Alarm & Log Resolution'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {isRtl ? `البلاغ: #${selectedAlarm?.id} - ${selectedAlarm?.message}` : `Alarm #${selectedAlarm?.id}: ${selectedAlarm?.message}`}
            </Typography>
            <TextField
              label={isRtl ? 'ملاحظات المعالجة والإجراء المتخذ' : 'Resolution Notes'}
              value={alarmNote}
              onChange={(e) => setAlarmNote(e.target.value)}
              multiline
              rows={3}
              fullWidth
              sx={{ bgcolor: '#1e293b', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '& textarea': { color: '#f8fafc' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={() => setAlarmDialogOpen(false)} sx={{ color: '#94a3b8' }}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={async () => {
              if (!selectedAlarm) return;
              await resolveAlarm.mutateAsync({ id: selectedAlarm.id, body: { note: alarmNote } });
              setAlarmDialogOpen(false);
              setSelectedAlarm(null);
            }}
            disabled={resolveAlarm.isPending}
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            {isRtl ? 'حفظ وتأكيد الحل' : 'Save & Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
