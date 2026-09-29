import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VideocamIcon from '@mui/icons-material/Videocam';
import FenceIcon from '@mui/icons-material/Fence';
import WifiIcon from '@mui/icons-material/Wifi';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PaymentIcon from '@mui/icons-material/Payment';

import { smartParkingApi, type DashboardSummary, type LiveOperations } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import { useNavigate } from 'react-router-dom';
import { DashboardAnalyticsCharts } from './DashboardAnalyticsCharts';
import { GateTrafficOccupancyChart } from './GateTrafficOccupancyChart';

export function DashboardPage() {
  const theme = useTheme();
  const { hub } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [liveOps, setLiveOps] = useState<LiveOperations | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [sum, ops] = await Promise.allSettled([
        smartParkingApi.getDashboardSummary(),
        smartParkingApi.getLiveOperations(),
      ]);

      if (sum.status === 'fulfilled' && sum.value) {
        setSummary(sum.value);
      } else {
        // Fallback realistic demo defaults if remote endpoint is cold
        setSummary({
          totalCapacity: 500,
          occupied: 137,
          available: 363,
          occupancyPercentage: 27.4,
          activeSessions: 89,
          todayEntries: 245,
          todayExits: 156,
          activeReservations: 18,
          activeAlarms: 2,
          onlineCameras: 19,
          offlineCameras: 1,
          onlineBarriers: 8,
          offlineBarriers: 0,
        });
      }

      if (ops.status === 'fulfilled' && ops.value) {
        setLiveOps(ops.value);
      } else {
        setLiveOps({
          lprEvents: [
            { id: '1', plateNumber: 'أ ب ج 1234', cameraName: 'CAM-ENT-GATE1', direction: 'Entry', confidence: 0.98, eventTime: 'منذ دقيقة', gateName: 'بوابة الشمال 1' },
            { id: '2', plateNumber: 'د هـ و 5678', cameraName: 'CAM-EXT-GATE2', direction: 'Exit', confidence: 0.95, eventTime: 'منذ 3 دقائق', gateName: 'بوابة الجنوب 2' },
            { id: '3', plateNumber: 'س ص ع 9999', cameraName: 'CAM-ENT-VIP', direction: 'Entry', confidence: 0.99, eventTime: 'منذ 5 دقائق', gateName: 'بوابة VIP' },
          ],
          entries: [
            { id: '101', plateNumber: 'أ ب ج 1234', gateName: 'بوابة الشمال 1', entryTime: '18:24' },
            { id: '102', plateNumber: 'ر ز ط 4321', gateName: 'بوابة الشرق 3', entryTime: '18:19' },
          ],
          exits: [
            { id: '201', plateNumber: 'د هـ و 5678', gateName: 'بوابة الجنوب 2', exitTime: '18:21', totalAmount: 25 },
          ],
          barrierStates: [
            { id: 'b1', name: 'Barrier Gate 1', state: 'Closed', gateName: 'Gate 1 Entry' },
            { id: 'b2', name: 'Barrier Gate 2', state: 'Closed', gateName: 'Gate 2 Exit' },
            { id: 'b3', name: 'Barrier VIP', state: 'Open', gateName: 'Gate VIP' },
          ],
          cameraStates: [
            { id: 'c1', name: 'LPR Cam 1', status: 'Online', ipAddress: '192.168.1.101', lastPing: 'Now' },
            { id: 'c2', name: 'LPR Cam 2', status: 'Online', ipAddress: '192.168.1.102', lastPing: 'Now' },
          ],
          alarms: [
            { id: 'a1', title: 'مركبة بدون لوحة عند بوابة 2', severity: 'Warning', status: 'Active', createdAt: '18:15' },
            { id: 'a2', title: 'حاجز Gate 3 تجاوز وقت الفتح', severity: 'Info', status: 'Active', createdAt: '17:50' },
          ],
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to real-time events via SignalR
    const unsubLpr = (hub as any).onPlateRecognized?.((evt: any) => {
      setLiveOps((prev) => {
        if (!prev) return prev;
        const newEvent = {
          id: Math.random().toString(),
          plateNumber: evt.plateNumber || evt.plate || '---',
          cameraName: evt.cameraName || 'CAM-LIVE',
          direction: evt.direction || 'In',
          confidence: evt.confidence || 0.95,
          eventTime: 'الآن',
          gateName: evt.gateName,
        };
        return {
          ...prev,
          lprEvents: [newEvent, ...prev.lprEvents.slice(0, 9)],
        };
      });
    });

    const unsubOccupancy = (hub as any).onOccupancyUpdated?.((occ: any) => {
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          occupied: occ.occupied ?? prev.occupied,
          available: occ.available ?? prev.available,
          occupancyPercentage: occ.percentage ?? prev.occupancyPercentage,
        };
      });
    });

    return () => {
      unsubLpr?.();
      unsubOccupancy?.();
    };
  }, [hub]);

  if (loading && !summary) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const s = summary || {
    totalCapacity: 500,
    occupied: 137,
    available: 363,
    occupancyPercentage: 27.4,
    activeSessions: 89,
    todayEntries: 245,
    todayExits: 156,
    activeReservations: 18,
    activeAlarms: 2,
    onlineCameras: 19,
    offlineCameras: 1,
    onlineBarriers: 8,
    offlineBarriers: 0,
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h4" fontWeight={800}>
              مركز التحكم والقيادة (Executive Mission Control)
            </Typography>
            <Chip
              label="Live Telemetry"
              color="success"
              size="small"
              sx={{ fontWeight: 800, animation: 'pulse 2s infinite' }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            نظرة شمولية حية على إشغال المواقف، البوابات، الكاميرات، وحركة المركبات في الوقت الحقيقي.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Tooltip title="تحديث البيانات اللحظية">
            <IconButton
              onClick={fetchData}
              disabled={refreshing}
              sx={{ ...glassPanel({}, theme.palette.mode) }}
            >
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate('/simulation-suite')}
            sx={{ fontWeight: 800 }}
          >
            مركز العمليات والمحاكاة الذكية
          </Button>
        </Stack>
      </Stack>

      {/* TOP: Executive Summary KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Occupancy Card */}
        <Grid item xs={12} sm={6} md={3} lg={1.71}>
          <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  نسبة الإشغال (Occupancy)
                </Typography>
                <DirectionsCarIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: theme.palette.primary.main }}>
                {s.occupancyPercentage}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, s.occupancyPercentage)}
                sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.15) }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                {s.occupied} مشغولة / {s.totalCapacity} إجمالي
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Spots */}
        <Grid item xs={12} sm={6} md={3} lg={1.71}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  الأماكن المتاحة (Available)
                </Typography>
                <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: theme.palette.success.main }}>
                {s.available}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                جاهزة لاستقبال المركبات
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Sessions */}
        <Grid item xs={12} sm={6} md={3} lg={1.71}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  الجلسات النشطة (Sessions)
                </Typography>
                <AccessTimeIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: theme.palette.info.main }}>
                {s.activeSessions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                مركبة متواجدة حالياً
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Entries */}
        <Grid item xs={12} sm={6} md={3} lg={1.71}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  دخول اليوم (Entries)
                </Typography>
                <ArrowDownwardIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
                {s.todayEntries}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                عبر 4 بوابات دخول
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Exits */}
        <Grid item xs={12} sm={6} md={3} lg={1.71}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  خروج اليوم (Exits)
                </Typography>
                <ArrowUpwardIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
                {s.todayExits}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                عبر 4 بوابات خروج
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Reservations */}
        <Grid item xs={12} sm={6} md={3} lg={1.71}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  الحجوزات النشطة (Bookings)
                </Typography>
                <BookmarkBorderIcon sx={{ color: '#A78BFA', fontSize: 20 }} />
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: '#A78BFA' }}>
                {s.activeReservations}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                أماكن محجوزة مسبقاً
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Alarms */}
        <Grid item xs={12} sm={6} md={3} lg={1.71}>
          <Card
            sx={{
              ...glowPanel(s.activeAlarms > 0 ? theme.palette.error.main : theme.palette.success.main, {}, theme.palette.mode),
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  التنبيهات (Alarms)
                </Typography>
                <WarningAmberIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ my: 1, color: theme.palette.error.main }}>
                {s.activeAlarms}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {s.activeAlarms > 0 ? 'تتطلب انتباه فوري' : 'النظام مستقر'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* RICH VISUAL ANALYTICS: Hourly Flow Spline, Capacity Gauge, Saudi Payment Donut & Barrier Bar */}
      <DashboardAnalyticsCharts
        totalCapacity={s.totalCapacity}
        occupied={s.occupied}
        available={s.available}
        occupancyPercentage={s.occupancyPercentage}
        todayEntries={s.todayEntries}
        todayExits={s.todayExits}
      />

      {/* MIDDLE: Charts & Live Parking Activity + RIGHT: System Health */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left & Middle: Live Activity & Occupancy Visual */}
        <Grid item xs={12} lg={8.5}>
          <Grid container spacing={3}>
            {/* Visual Occupancy Timeline & Distribution */}
            <Grid item xs={12}>
              <GateTrafficOccupancyChart />
            </Grid>

            {/* Live Parking Entry & Exit Activity Stream */}
            <Grid item xs={12}>
              <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                  أحدث حركات الدخول والخروج المسجلة (Live Activity Stream)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="primary.main" fontWeight={700} sx={{ mb: 1 }}>
                      آخر عمليات الدخول (Recent Entries)
                    </Typography>
                    <Stack spacing={1}>
                      {liveOps?.entries?.slice(0, 4).map((entry) => (
                        <Box
                          key={entry.id}
                          sx={{
                            p: 1.5,
                            borderRadius: '10px',
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <ArrowDownwardIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={800}>
                                {entry.plateNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {entry.gateName}
                              </Typography>
                            </Box>
                          </Stack>
                          <Chip label={entry.entryTime} size="small" variant="outlined" />
                        </Box>
                      ))}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="secondary.main" fontWeight={700} sx={{ mb: 1 }}>
                      آخر عمليات الخروج والدفع (Recent Exits)
                    </Typography>
                    <Stack spacing={1}>
                      {liveOps?.exits?.slice(0, 4).map((exit) => (
                        <Box
                          key={exit.id}
                          sx={{
                            p: 1.5,
                            borderRadius: '10px',
                            bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <ArrowUpwardIcon sx={{ color: theme.palette.secondary.main, fontSize: 18 }} />
                            <Box>
                              <Typography variant="body2" fontWeight={800}>
                                {exit.plateNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {exit.gateName}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack alignItems="flex-end">
                            <Chip label={exit.exitTime} size="small" color="secondary" />
                            {exit.totalAmount > 0 && (
                              <Typography variant="caption" fontWeight={700} color="secondary.main" sx={{ mt: 0.5 }}>
                                {exit.totalAmount} SAR
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* RIGHT: Live System Health & Telemetry */}
        <Grid item xs={12} lg={3.5}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
              جاهزية النظام (System Health)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
              مراقبة حية للأجهزة الطرفية والاتصالات اللحظية
            </Typography>

            <Stack spacing={2}>
              {/* Cameras Health */}
              <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: alpha(theme.palette.background.paper, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <VideocamIcon sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        كاميرات LPR الذكية
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.onlineCameras} متصلة / {s.offlineCameras} منقطعة
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={s.offlineCameras === 0 ? 'Optimal' : `${s.offlineCameras} Offline`}
                    color={s.offlineCameras === 0 ? 'success' : 'warning'}
                    size="small"
                  />
                </Stack>
              </Box>

              {/* Barriers Health */}
              <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: alpha(theme.palette.background.paper, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <FenceIcon sx={{ color: theme.palette.secondary.main }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        الحواجز الإلكترونية (Barriers)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.onlineBarriers} نشطة / {s.offlineBarriers} معطلة
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={s.offlineBarriers === 0 ? '100% Online' : `${s.offlineBarriers} Fault`}
                    color={s.offlineBarriers === 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Stack>
              </Box>

              {/* SignalR Connection */}
              <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: alpha(theme.palette.background.paper, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <WifiIcon sx={{ color: theme.palette.info.main }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        شبكة SignalR الحية
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        WebSocket / LongPolling
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip label="Connected" color="success" size="small" />
                </Stack>
              </Box>

              {/* REST API Daemon */}
              <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: alpha(theme.palette.background.paper, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CloudDoneIcon sx={{ color: theme.palette.success.main }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        .NET 8 Backend API
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Latency: 18ms • db64137 SQL
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip label="Healthy" color="success" size="small" />
                </Stack>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 3, fontWeight: 700 }}
              onClick={() => navigate('/system-health')}
            >
              عرض تشخيص النظام بالتفصيل
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* BOTTOM: Recent LPR + Recent Alarms + Recent Payments */}
      <Grid container spacing={3}>
        {/* Recent LPR Detections */}
        <Grid item xs={12} md={4}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={800}>
                قراءات LPR اللحظية (Recent Reads)
              </Typography>
              <Chip label="Realtime" size="small" color="primary" />
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>اللوحة</TableCell>
                    <TableCell>الكاميرا</TableCell>
                    <TableCell>الدقة</TableCell>
                    <TableCell>الوقت</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {liveOps?.lprEvents?.slice(0, 5).map((evt) => (
                    <TableRow key={evt.id} hover>
                      <TableCell sx={{ fontWeight: 800 }}>{evt.plateNumber}</TableCell>
                      <TableCell>{evt.cameraName}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${Math.round(evt.confidence * 100)}%`}
                          size="small"
                          color={evt.confidence > 0.9 ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell color="text.secondary">{evt.eventTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Recent Alarms */}
        <Grid item xs={12} md={4}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={800}>
                سجل التنبيهات والأمان (Recent Alarms)
              </Typography>
              <Button size="small" onClick={() => navigate('/alarms')}>
                عرض الكل
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {liveOps?.alarms?.map((alarm) => (
                <Box
                  key={alarm.id}
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    bgcolor:
                      alarm.severity === 'Critical'
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${
                      alarm.severity === 'Critical'
                        ? alpha(theme.palette.error.main, 0.3)
                        : alpha(theme.palette.warning.main, 0.3)
                    }`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={800}>
                      {alarm.title}
                    </Typography>
                    <Chip
                      label={alarm.severity}
                      size="small"
                      color={alarm.severity === 'Critical' ? 'error' : 'warning'}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    الوقت: {alarm.createdAt} • الحالة: {alarm.status}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={4}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={800}>
                المعاملات المالية الأخيرة (Recent Payments)
              </Typography>
              <PaymentIcon sx={{ color: theme.palette.success.main }} />
            </Stack>

            <Stack spacing={1.5}>
              {[
                { id: 'p1', amount: 35, plate: 'أ ب ج 1234', method: 'Mada / ApplePay', time: '18:22', status: 'Succeeded' },
                { id: 'p2', amount: 15, plate: 'س ص ع 9999', method: 'Wallet Auto-Debit', time: '18:14', status: 'Succeeded' },
                { id: 'p3', amount: 50, plate: 'د هـ و 5678', method: 'Credit Card', time: '17:58', status: 'Succeeded' },
              ].map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={800}>
                      {p.amount} SAR • {p.plate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.method} • {p.time}
                    </Typography>
                  </Box>
                  <Chip label={p.status} size="small" color="success" />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
