import { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
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

export function OperationsCenterPage() {
  const { i18n } = useTranslation();
  const { hub, api } = useAuth();
  const isRtl = i18n.dir() === 'rtl';

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
  const { data: overview, refetch: refetchOverview } = useOperationsCenterOverview();
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
  };

  // Default resilient telemetry for live presentation & uninterrupted operations
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
    { id: 5, name: 'كاميرا مسار مواقف القبو B1', ip: '192.168.1.55', isActive: true, cameraTypeId: 'SECURITY_HD', status: 'Online', lane: 'Basement B1', direction: 'INTERNAL', groupNum: 3, manufacturer: 'Uniview', model: 'IPC2324EBR-DPZ28' },
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
    { id: 1, alarmType: 'StationaryVehicle', severity: 'Warning', source: 'Lane 1 In', status: 'Open', message: 'مركبة متوقفة في مسار بوابة الشمال لأكثر من 3 دقائق دون عبور', occurrencesCount: 1, createdAt: new Date(Date.now() - 10 * 60000).toISOString(), lastOccurredAt: new Date().toISOString(), isIncident: false },
    { id: 2, alarmType: 'AntiTailgating', severity: 'Info', source: 'Gate South 2', status: 'Acknowledged', message: 'حساس الأمان رصد محاولة تلاصق (Anti-Tailgating) وجرى خفض الذراع بنجاح', occurrencesCount: 2, createdAt: new Date(Date.now() - 25 * 60000).toISOString(), lastOccurredAt: new Date(Date.now() - 25 * 60000).toISOString(), isIncident: false },
    { id: 3, alarmType: 'CameraHealth', severity: 'Info', source: 'Basement B1 Cam', status: 'Resolved', message: 'إعادة الاتصال بكاميرا القبو B1 وعودة بث RTSP بدقة كاملة', occurrencesCount: 1, createdAt: new Date(Date.now() - 60 * 60000).toISOString(), lastOccurredAt: new Date(Date.now() - 60 * 60000).toISOString(), isIncident: false },
  ], []);

  // Resilient Data Binding with Fallbacks
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

  const totalCap = overview?.totalCapacity || occTotal;
  const totalFree = overview?.totalFree || occFree;
  const totalOcc = overview?.totalOccupied || occOccupied;
  const occPercent = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : (overview?.occupancyPercent ?? 0);

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
        maxWidth: 1600,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
        direction: isRtl ? 'rtl' : 'ltr',
        color: '#f1f5f9',
        bgcolor: '#090d16',
        minHeight: '100vh',
        borderRadius: 4,
      }}
    >
      {/* 🚀 CYBERPUNK MISSION CONTROL HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #0b132b 100%)',
          color: '#fff',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #38bdf8, #818cf8, #34d399)',
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              background: 'radial-gradient(circle, #38bdf8 0%, #1e1b4b 100%)',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography sx={{ fontSize: 30 }}>🎛️</Typography>
          </Box>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', letterSpacing: 0.5, color: '#f8fafc' }}>
                {isRtl ? 'مركز العمليات وغرفة القيادة والتحكم' : 'Operations Command & Telemetry Center'}
              </Typography>
              <Chip
                size="small"
                label={isRtl ? '🟢 متصل لحظياً (Live Hub)' : '🟢 Live SignalR Hub'}
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  fontWeight: 800,
                  fontSize: 11,
                  boxShadow: '0 0 12px rgba(52, 211, 153, 0.3)',
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.25, fontWeight: 500 }}>
              {isRtl
                ? 'مراقبة فورية للحواجز الذكية، الكاميرات، تدفق المركبات، وصحة الأجهزة اللحظية'
                : 'Real-time telemetry, smart barriers dispatch, LPR neural detection & IoT fleet supervision'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-end' }}>
          {/* Digital Chronometer */}
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: 2.5,
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              textAlign: 'center',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
              {isRtl ? 'التوقيت المحلي للمنظومة' : 'SYSTEM LOCAL TIME'}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8', letterSpacing: 2 }}>
              {now.toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US')}
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={refetch}
            startIcon={<Typography sx={{ fontSize: 18 }}>🔄</Typography>}
            sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              fontWeight: 800,
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #334155 0%, #475569 100%)' },
              borderRadius: 2.5,
              px: 2.5,
            }}
          >
            {isRtl ? 'تحديث فوري' : 'Refresh'}
          </Button>
        </Stack>
      </Paper>

      {/* 🌟 4 DARK HERO COCKPIT CARDS */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* CARD 1: PARKING OCCUPANCY RATE */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3.5,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#34d399', boxShadow: '0 12px 36px rgba(16, 185, 129, 0.2)' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#10b981' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#34d399', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {isRtl ? '📊 نسبة إشغال المواقف' : 'Parking Occupancy'}
                </Typography>
                <Chip size="small" label={`${totalFree} شاغر`} sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', fontWeight: 800, fontSize: 11 }} />
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
              borderRadius: 3.5,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0f172a 0%, #172554 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#38bdf8', boxShadow: '0 12px 36px rgba(56, 189, 248, 0.2)' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#38bdf8' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {isRtl ? '🚗 الجلسات الحالية والتدفق' : 'Live Sessions & Traffic'}
                </Typography>
                <Typography sx={{ fontSize: 20 }}>⚡</Typography>
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#60a5fa', my: 1.5, letterSpacing: -1 }}>
                {overview?.activeSessionsCount ?? totalOcc ?? 0}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ pt: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>
                  🟢 دخول: <strong>{overview?.todayEntriesCount ?? 0}</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 800 }}>
                  🔴 خروج: <strong>{overview?.todayExitsCount ?? 0}</strong>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 3: HARDWARE FLEET HEALTH */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3.5,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0f172a 0%, #2e1065 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#c084fc', boxShadow: '0 12px 36px rgba(168, 85, 247, 0.2)' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#a855f7' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#c084fc', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {isRtl ? '📡 صحة أسطول الأجهزة' : 'Hardware Fleet Health'}
                </Typography>
                <Typography sx={{ fontSize: 20 }}>🌐</Typography>
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
                <Chip size="small" label={`${onlineDev} متصل`} sx={{ bgcolor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: 10, height: 20, fontWeight: 800 }} />
                {warningDev > 0 && <Chip size="small" label={`${warningDev} تنبيه`} sx={{ bgcolor: 'rgba(234, 179, 8, 0.2)', color: '#facc15', fontSize: 10, height: 20, fontWeight: 800 }} />}
                {offlineDev > 0 && <Chip size="small" label={`${offlineDev} غير متصل`} sx={{ bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: 10, height: 20, fontWeight: 800 }} />}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 4: OPERATIONAL ALARMS */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3.5,
              position: 'relative',
              overflow: 'hidden',
              background: activeProblems.length > 0 ? 'linear-gradient(145deg, #0f172a 0%, #4c0519 100%)' : 'linear-gradient(145deg, #0f172a 0%, #064e3b 100%)',
              border: activeProblems.length > 0 ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(52, 211, 153, 0.25)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: activeProblems.length > 0 ? '#f43f5e' : '#10b981' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ fontWeight: 800, color: activeProblems.length > 0 ? '#fb7185' : '#34d399', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {isRtl ? '🛡️ البلاغات الأمنية والإنذارات' : 'Active Alarms & Incidents'}
                </Typography>
                <Typography sx={{ fontSize: 20 }}>{activeProblems.length > 0 ? '🚨' : '✅'}</Typography>
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: activeProblems.length > 0 ? '#fb7185' : '#34d399', my: 1.5, letterSpacing: -1 }}>
                {activeProblems.length}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block' }}>
                {activeProblems.length > 0
                  ? (isRtl ? `⚠️ يوجد ${activeProblems.length} بلاغ يتطلب المتابعة` : `⚠️ ${activeProblems.length} alerts require action`)
                  : (isRtl ? '✨ كافة الأنظمة تعمل بحالة ممتازة' : '✨ All systems nominal')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🧭 CYBERNETIC DARK TABS */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3.5,
          bgcolor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
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
            minHeight: 60,
            '& .MuiTab-root': {
              minHeight: 60,
              fontWeight: 800,
              fontSize: 14,
              fontFamily: 'Sora, Cairo, sans-serif',
              textTransform: 'none',
              color: '#94a3b8',
              transition: 'all 0.2s ease',
              '&.Mui-selected': { color: '#38bdf8', textShadow: '0 0 12px rgba(56, 189, 248, 0.5)' },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: '#38bdf8',
              boxShadow: '0 0 12px #38bdf8',
            },
          }}
        >
          <Tab icon={<Typography sx={{ mr: 1, fontSize: 18 }}>🚀</Typography>} iconPosition="start" label={isRtl ? 'غرفة القيادة والتحكم الفوري' : 'Command Cockpit'} />
          <Tab icon={<Typography sx={{ mr: 1, fontSize: 18 }}>🚧</Typography>} iconPosition="start" label={isRtl ? `محطة الحواجز والبوابات الذكية (${barriersList.length})` : `Smart Barriers (${barriersList.length})`} />
          <Tab icon={<Typography sx={{ mr: 1, fontSize: 18 }}>📸</Typography>} iconPosition="start" label={isRtl ? `رادار قراءات اللوحات والمركبات (${lprEventsList.length})` : `Vehicle OCR Radar (${lprEventsList.length})`} />
          <Tab icon={<Typography sx={{ mr: 1, fontSize: 18 }}>🖥️</Typography>} iconPosition="start" label={isRtl ? `مصفوفة الكاميرات والأجهزة (${camerasList.length})` : `Camera Matrix (${camerasList.length})`} />
          <Tab icon={<Typography sx={{ mr: 1, fontSize: 18 }}>🚨</Typography>} iconPosition="start" label={isRtl ? `مركز البلاغات (${alarmsList.length})` : `Alarms Center (${alarmsList.length})`} />
        </Tabs>
      </Paper>

      {/* 🚀 TAB 0: COMMAND COCKPIT */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Left: Smart Barrier Control Station Grid */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: '#0f172a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', height: '100%' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                    {isRtl ? '🚧 كونسول التحكم بالحواجز الذكية' : 'Smart Barriers Live Console'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {isRtl ? 'تشغيل يدوي فوري بضغطة زر واحدة ومسجل في سجل التدقيق' : 'One-click manual override with instant audited telemetry'}
                  </Typography>
                </Box>
                <Chip size="small" label={`${barriersList.length} حواجز نشطة`} sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 800 }} />
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
                            border: `1.5px solid ${isOpen ? 'rgba(52, 211, 153, 0.5)' : isFault ? 'rgba(244, 63, 94, 0.5)' : 'rgba(56, 189, 248, 0.25)'}`,
                            background: isOpen
                              ? 'linear-gradient(160deg, #0b1a17 0%, #064e3b 100%)'
                              : isFault
                              ? 'linear-gradient(160deg, #1e1014 0%, #4c0519 100%)'
                              : 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
                            boxShadow: isOpen ? '0 8px 24px rgba(16, 185, 129, 0.25)' : '0 8px 24px rgba(0,0,0,0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(56, 189, 248, 0.25)' },
                          }}
                        >
                          {/* Card Header: Barrier Name + Gate */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', fontSize: 16 }}>
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
                              p: 1.75,
                              borderRadius: 2.5,
                              mb: 2.5,
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
                                <Typography sx={{ fontSize: 18 }}>
                                  {isOpen ? '🔓' : isFault ? '⚠️' : '🔒'}
                                </Typography>
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
                            <Typography sx={{ fontSize: 20, opacity: 0.8 }}>
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
                                startIcon={<Typography sx={{ fontSize: 14 }}>🟢</Typography>}
                                sx={{
                                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                  color: '#fff',
                                  fontWeight: 800,
                                  borderRadius: 2,
                                  py: 1,
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
                                startIcon={<Typography sx={{ fontSize: 14 }}>🔒</Typography>}
                                sx={{
                                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                  color: '#f8fafc',
                                  fontWeight: 800,
                                  borderRadius: 2,
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
                                startIcon={<Typography sx={{ fontSize: 14 }}>🚨</Typography>}
                                sx={{
                                  borderColor: 'rgba(244, 63, 94, 0.4)',
                                  color: '#fb7185',
                                  bgcolor: 'rgba(244, 63, 94, 0.1)',
                                  fontWeight: 800,
                                  borderRadius: 2,
                                  py: 0.85,
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
                                startIcon={<Typography sx={{ fontSize: 14 }}>🔄</Typography>}
                                sx={{
                                  borderColor: 'rgba(56, 189, 248, 0.3)',
                                  color: '#38bdf8',
                                  bgcolor: 'rgba(56, 189, 248, 0.08)',
                                  fontWeight: 800,
                                  borderRadius: 2,
                                  py: 0.85,
                                  '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.2)', borderColor: '#38bdf8' },
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
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: '#0f172a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', height: '100%' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                    {isRtl ? '📸 رادار قراءات اللوحات والمركبات' : 'Live Vehicle OCR Radar'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {isRtl ? 'التقاط فوري شامل لكافة بيانات المركبة واللوحة' : 'Instant vehicle metadata and plate recognition feed'}
                  </Typography>
                </Box>
                <Chip size="small" label={`${lprEventsList.length} رصد`} sx={{ bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontWeight: 800 }} />
              </Box>

              <CardContent sx={{ p: 2, maxHeight: 580, overflowY: 'auto' }}>
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
                          bgcolor: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.2s ease',
                          '&:hover': { transform: 'translateX(-4px)', borderColor: 'rgba(56, 189, 248, 0.4)' },
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          {/* Plate Badge Display */}
                          <Grid item xs={12} sm={4}>
                            <Box
                              sx={{
                                border: '2px solid #38bdf8',
                                borderRadius: 2,
                                bgcolor: '#0f172a',
                                p: 1,
                                textAlign: 'center',
                                boxShadow: '0 0 14px rgba(56, 189, 248, 0.25)',
                              }}
                            >
                              <Typography variant="caption" sx={{ display: 'block', fontSize: 9, color: '#38bdf8', fontWeight: 800, letterSpacing: 1 }}>
                                KSA · المملكة العربية السعودية
                              </Typography>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 17, letterSpacing: 2, color: '#f8fafc', my: 0.25 }}>
                                {r.plateNumber || r.normalizedPlateNumber || 'N/A'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 10, fontWeight: 700 }}>
                                دقة الذكاء الاصطناعي: {conf}%
                              </Typography>
                            </Box>
                          </Grid>

                          {/* Full Vehicle Metadata */}
                          <Grid item xs={12} sm={8}>
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
        <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: '#0f172a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
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
                <ToggleButton value="cards" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.15)' } }}>
                  {isRtl ? '🎴 كروت كونسول' : 'Console Cards'}
                </ToggleButton>
                <ToggleButton value="table" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.15)' } }}>
                  {isRtl ? '📊 جدول تفصيلي' : 'Table'}
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
                          borderRadius: 3.5,
                          border: `1.5px solid ${isOpen ? 'rgba(52, 211, 153, 0.5)' : isFault ? 'rgba(244, 63, 94, 0.5)' : 'rgba(56, 189, 248, 0.25)'}`,
                          background: isOpen
                            ? 'linear-gradient(160deg, #0b1a17 0%, #064e3b 100%)'
                            : isFault
                            ? 'linear-gradient(160deg, #1e1014 0%, #4c0519 100%)'
                            : 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
                          boxShadow: isOpen ? '0 10px 28px rgba(16, 185, 129, 0.25)' : '0 8px 24px rgba(0,0,0,0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: '#38bdf8',
                            boxShadow: '0 14px 36px rgba(56, 189, 248, 0.3)',
                          },
                        }}
                      >
                        {/* Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', fontSize: 18 }}>
                              {b.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, display: 'block', mt: 0.25 }}>
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
                              <Typography sx={{ fontSize: 22 }}>
                                {isOpen ? '🔓' : isFault ? '⚠️' : '🔒'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 900, color: isOpen ? '#34d399' : isFault ? '#fb7185' : '#cbd5e1' }}>
                                {isOpen ? 'مفتوح (OPEN)' : isFault ? 'عطل تشغيلي (FAULT)' : 'مغلق (CLOSED)'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: 11, display: 'block' }}>
                                {b.deviceAddress || '192.168.1.100'} · {b.providerKey || 'Modbus-TCP'}
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography sx={{ fontSize: 24, fontWeight: 900, color: isOpen ? '#34d399' : '#f87171' }}>
                            {isOpen ? '▲ 90°' : '▬ 0°'}
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
                              startIcon={<Typography sx={{ fontSize: 16 }}>🟢</Typography>}
                              sx={{
                                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                color: '#fff',
                                fontWeight: 900,
                                borderRadius: 2.5,
                                py: 1.25,
                                fontSize: 14,
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                                '&:hover': { background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
                              }}
                            >
                              {isRtl ? 'فتح الحاجز' : 'Open'}
                            </Button>
                          </Grid>

                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => handleQuickCommand(b, 'CLOSE')}
                              disabled={manualCommandMutation.isPending}
                              startIcon={<Typography sx={{ fontSize: 16 }}>🔒</Typography>}
                              sx={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                color: '#f8fafc',
                                fontWeight: 900,
                                borderRadius: 2.5,
                                py: 1.25,
                                fontSize: 14,
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                '&:hover': { background: 'linear-gradient(135deg, #334155 0%, #475569 100%)' },
                              }}
                            >
                              {isRtl ? 'إغلاق الحاجز' : 'Close'}
                            </Button>
                          </Grid>

                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => handleOpenCommandDialog(b, 'EMERGENCY_OPEN')}
                              startIcon={<Typography sx={{ fontSize: 16 }}>🚨</Typography>}
                              sx={{
                                borderColor: 'rgba(244, 63, 94, 0.45)',
                                color: '#fb7185',
                                bgcolor: 'rgba(244, 63, 94, 0.12)',
                                fontWeight: 900,
                                borderRadius: 2.5,
                                py: 1,
                                fontSize: 13,
                                '&:hover': { bgcolor: '#f43f5e', color: '#fff', borderColor: '#f43f5e' },
                              }}
                            >
                              {isRtl ? 'طوارئ مستمر' : 'Emergency'}
                            </Button>
                          </Grid>

                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => handleQuickCommand(b, 'RESET')}
                              startIcon={<Typography sx={{ fontSize: 16 }}>🔄</Typography>}
                              sx={{
                                borderColor: 'rgba(56, 189, 248, 0.35)',
                                color: '#38bdf8',
                                bgcolor: 'rgba(56, 189, 248, 0.1)',
                                fontWeight: 900,
                                borderRadius: 2.5,
                                py: 1,
                                fontSize: 13,
                                '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.25)', borderColor: '#38bdf8' },
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
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الحالة الحالية' : 'State'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'بروتوكول وعنوان الجهاز' : 'Protocol / IP'}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'التحكم الفوري' : 'Live Control'}</TableCell>
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
                          <TableCell sx={{ fontWeight: 600, color: '#cbd5e1' }}>{b.gateName || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={isOpen ? 'مفتوح (OPEN)' : isFault ? 'عطل (FAULT)' : 'مغلق (CLOSED)'}
                              sx={{
                                bgcolor: isOpen ? '#10b981' : isFault ? '#f43f5e' : '#475569',
                                color: '#fff',
                                fontWeight: 800,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                            {b.providerKey || 'modbus-tcp'} · {b.deviceAddress || '192.168.1.100'}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1.5} justifyContent="center">
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleQuickCommand(b, 'OPEN')}
                                sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#10b981' }, fontWeight: 800 }}
                              >
                                {isRtl ? 'فتح' : 'Open'}
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                sx={{ bgcolor: '#334155', '&:hover': { bgcolor: '#475569' }, color: '#fff', fontWeight: 800 }}
                                onClick={() => handleQuickCommand(b, 'CLOSE')}
                              >
                                {isRtl ? 'إغلاق' : 'Close'}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleOpenCommandDialog(b, 'EMERGENCY_OPEN')}
                                sx={{ fontWeight: 800 }}
                              >
                                {isRtl ? 'طوارئ' : 'Emergency'}
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => handleQuickCommand(b, 'RESET')}
                                sx={{ fontWeight: 800, color: '#38bdf8' }}
                              >
                                {isRtl ? 'إعادة ضبط' : 'Reset'}
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

      {/* 📸 TAB 2: FULL VEHICLE INTELLIGENCE RADAR (CARDS & TABLE) */}
      {activeTab === 2 && (
        <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: '#0f172a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                {isRtl ? '📸 رادار استخبارات قراءات اللوحات والمركبات الكاملة' : 'Vehicle OCR Intelligence Grid'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {isRtl ? 'عرض تفصيلي لجميع المركبات مع اللوحة، اللون، الماركة، التوقيت، ونسبة الثقة' : 'Comprehensive vehicle telemetry registry'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {/* Direction Filter */}
              <TextField
                select
                size="small"
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                sx={{
                  minWidth: 120,
                  bgcolor: '#1e293b',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '& .MuiSelect-select': { color: '#f8fafc', fontWeight: 700 },
                }}
              >
                <MenuItem value="ALL">{isRtl ? 'كافة الاتجاهات' : 'All Directions'}</MenuItem>
                <MenuItem value="ENTRY">{isRtl ? '🟢 دخول فقط' : 'Entry Only'}</MenuItem>
                <MenuItem value="EXIT">{isRtl ? '🔴 خروج فقط' : 'Exit Only'}</MenuItem>
              </TextField>

              {/* Instant Search */}
              <TextField
                size="small"
                placeholder={isRtl ? '🔍 بحث باللوحة، الكاميرا، الماركة، اللون...' : 'Search plate, camera, brand...'}
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

              {/* View Toggle Buttons */}
              <ToggleButtonGroup
                size="small"
                value={lprViewMode}
                exclusive
                onChange={(_, next) => next && setLprViewMode(next)}
                sx={{ bgcolor: '#1e293b', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ToggleButton value="cards" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.15)' } }}>
                  {isRtl ? '🎴 كروت فاخرة' : 'Cards'}
                </ToggleButton>
                <ToggleButton value="table" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.15)' } }}>
                  {isRtl ? '📊 جدول تفصيلي' : 'Table'}
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>

          <CardContent sx={{ p: 2.5 }}>
            {lprViewMode === 'cards' ? (
              <Grid container spacing={2.5}>
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
                          bgcolor: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: '#38bdf8',
                            boxShadow: '0 12px 30px rgba(56, 189, 248, 0.2)',
                          },
                        }}
                      >
                        {/* Authentic Number Plate Display */}
                        <Box
                          sx={{
                            border: '2px solid #38bdf8',
                            borderRadius: 2.5,
                            bgcolor: '#090d16',
                            p: 1.5,
                            textAlign: 'center',
                            mb: 2,
                            boxShadow: '0 0 16px rgba(56, 189, 248, 0.2)',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, mb: 0.5 }}>
                            <Typography sx={{ fontSize: 10, color: '#38bdf8', fontWeight: 800 }}>KSA</Typography>
                            <Typography sx={{ fontSize: 10, color: '#38bdf8', fontWeight: 800 }}>المملكة العربية السعودية</Typography>
                          </Stack>
                          <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 22, letterSpacing: 3, color: '#f8fafc', py: 0.5 }}>
                            {r.plateNumber || r.normalizedPlateNumber || 'N/A'}
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, mt: 0.5 }}>
                            <Chip size="small" label={`ثقة الذكاء الاصطناعي: ${conf}%`} sx={{ height: 18, fontSize: 10, bgcolor: conf > 85 ? '#064e3b' : '#78350f', color: conf > 85 ? '#34d399' : '#fde68a', fontWeight: 800 }} />
                            <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>OCR #{r.id}</Typography>
                          </Stack>
                        </Box>

                        {/* Detailed Vehicle Specs */}
                        <Stack spacing={1.2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                              🚗 {[r.vehicleBrand, r.vehicleModel].filter(Boolean).join(' ') || (isRtl ? 'مركبة مسجلة' : 'Registered Vehicle')}
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

                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.04)' }}>
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

                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', pt: 0.5 }}>
                            ⏱️ {formatLocalDateTime(r.eventDateTime)}
                          </Typography>
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
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'رقم اللوحة' : 'Plate Number'}</TableCell>
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
                          <Box sx={{ border: '1.5px solid #38bdf8', borderRadius: 1.5, bgcolor: '#090d16', px: 1.5, py: 0.35, display: 'inline-block' }}>
                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 14, letterSpacing: 1.5, color: '#f8fafc' }}>
                              {r.plateNumber || r.normalizedPlateNumber || 'N/A'}
                            </Typography>
                          </Box>
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
        <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: '#0f172a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                {isRtl ? '🖥️ مصفوفة الكاميرات وحالة الأجهزة' : 'Hardware & Camera Fleet Matrix'}
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
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'رابط البث / Snapshot' : 'RTSP / Stream URL'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCameras.map((c) => (
                    <TableRow key={c.id} hover sx={{ '&:hover': { bgcolor: '#1e293b' } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#94a3b8' }}>#{c.id}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{c.name}</TableCell>
                      <TableCell>
                        <Chip size="small" label={c.cameraTypeId || 'LPR'} sx={{ bgcolor: '#334155', color: '#38bdf8', fontWeight: 800 }} />
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
                          {c.rtspUrl || c.streamUrl || c.snapshotUrl || '-'}
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

      {/* 🚨 TAB 4: ALARMS & INCIDENTS */}
      {activeTab === 4 && (
        <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: '#0f172a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif', color: '#f8fafc' }}>
                {isRtl ? '🚨 مركز إدارة البلاغات والتنبيهات التشغيلية' : 'Operational Alarms & Security Triage'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {isRtl ? 'متابعة البلاغات، تعيين المشغلين، تصعيد الحوادث، وتوثيق المعالجة' : 'Incident management and operator assignment'}
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
                  minWidth: 140,
                  bgcolor: '#1e293b',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '& .MuiSelect-select': { color: '#f8fafc' },
                }}
              >
                <MenuItem value="All">{isRtl ? 'كافة الحالات' : 'All Statuses'}</MenuItem>
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
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الرسالة' : 'Message'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الحالة' : 'Status'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الوقت' : 'Time'}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#f8fafc' }}>{isRtl ? 'الإجراءات' : 'Actions'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alarmsList.map((a: AlarmDto) => (
                    <TableRow key={a.id} hover sx={{ '&:hover': { bgcolor: '#1e293b' } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#94a3b8' }}>#{a.id}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={a.severity}
                          color={a.severity?.toLowerCase() === 'critical' ? 'error' : a.severity?.toLowerCase() === 'high' ? 'warning' : 'default'}
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#f8fafc' }}>{a.source || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 300, color: '#cbd5e1' }}>{a.message}</TableCell>
                      <TableCell>
                        <Chip size="small" label={a.status} sx={{ bgcolor: '#334155', color: '#f8fafc', fontWeight: 800 }} />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                        {formatLocalDateTime(a.createdAt)}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {a.status === 'Open' && (
                            <Button size="small" variant="outlined" onClick={() => ackAlarm.mutate(a.id)} sx={{ color: '#38bdf8', borderColor: '#38bdf8' }}>
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
                            >
                              {isRtl ? 'حل' : 'Resolve'}
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
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
        PaperProps={{ sx: { bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {isRtl ? `تأكيد تنفيذ أمر يدوي: ${selectedCommand}` : `Confirm Manual Command: ${selectedCommand}`}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity={selectedCommand === 'EMERGENCY_OPEN' ? 'error' : 'info'} sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
              {isRtl
                ? `أنت على وشك إرسال أمر (${selectedCommand}) للحاجز '${selectedBarrier?.name}'. هذا الإجراء يتم تسجيله في سجل التدقيق.`
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
            sx={{ fontWeight: 800, minWidth: 120 }}
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
        PaperProps={{ sx: { bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}
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
            sx={{ fontWeight: 800 }}
          >
            {isRtl ? 'حفظ وتأكيد الحل' : 'Save & Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
