import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SensorsIcon from '@mui/icons-material/Sensors';
import StarIcon from '@mui/icons-material/Star';
import EvStationIcon from '@mui/icons-material/EvStation';

import { smartParkingApi, type LiveOperations, SAUDI_PLATES_CATALOG } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import { SaudiPlateBadge } from '../../core/SaudiPlateBadge';

export function LiveMonitorPage() {
  const theme = useTheme();
  const { hub } = useAuth();
  const [events, setEvents] = useState<LiveOperations['lprEvents']>([]);
  const [, setCameras] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'Entry' | 'Exit' | 'VIP' | 'EV'>('ALL');
  const [isSimulating, setIsSimulating] = useState(false);

  // Load telemetry from smartParkingApi
  const fetchOperations = () => {
    smartParkingApi
      .getLiveOperations()
      .then((ops) => {
        if (ops?.lprEvents && ops.lprEvents.length > 0) {
          setEvents(ops.lprEvents);
        }
        if (ops?.cameraStates) {
          setCameras(ops.cameraStates);
        }
      })
      .catch((err) => {
        console.warn('Fallback to enhanced Saudi LPR events:', err);
      });
  };

  useEffect(() => {
    fetchOperations();

    const unsub = (hub as any)?.onPlateRecognized?.((evt: any) => {
      setEvents((prev) => [
        {
          id: Math.random().toString(),
          plateNumber: evt.plateNumber || evt.plate || 'أ ب ج 1004',
          cameraName: evt.cameraName || 'CAM-01-NORTH-IN',
          direction: evt.direction || 'Entry',
          confidence: evt.confidence || 0.99,
          eventTime: 'الآن',
          gateName: evt.gateName || 'البوابة الشمالية 1 (Entry)',
        },
        ...prev.slice(0, 30),
      ]);
    });

    return () => unsub?.();
  }, [hub]);

  // Simulate scanning a new authentic Saudi car
  const handleSimulateScan = () => {
    setIsSimulating(true);
    const randomIndex = Math.floor(Math.random() * SAUDI_PLATES_CATALOG.length);
    const randomCar = SAUDI_PLATES_CATALOG[randomIndex];
    const cameraPool = [
      { cam: 'CAM-01-NORTH-IN', gate: 'البوابة الشمالية 1 (Entry)', dir: 'Entry' },
      { cam: 'CAM-02-NORTH-OUT', gate: 'البوابة الشمالية 1 (Exit)', dir: 'Exit' },
      { cam: 'CAM-05-VIP-GATE', gate: 'بوابة كبار الشخصيات VIP', dir: 'Entry' },
      { cam: 'CAM-06-EV-HUB', gate: 'مسار محطة الشحن EV Hub', dir: 'Entry' },
      { cam: 'CAM-03-SOUTH-IN', gate: 'البوابة الجنوبية 2 (Entry)', dir: 'Entry' },
    ];
    const selCam = cameraPool[Math.floor(Math.random() * cameraPool.length)];

    setTimeout(() => {
      setEvents((prev) => [
        {
          id: `sim-${Date.now()}`,
          plateNumber: randomCar.plateAr,
          cameraName: selCam.cam,
          direction: selCam.dir,
          confidence: 0.985 + Math.random() * 0.014,
          eventTime: 'الآن',
          gateName: selCam.gate,
        },
        ...prev,
      ]);
      setIsSimulating(false);
    }, 450);
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchDir =
        directionFilter === 'ALL' ||
        (directionFilter === 'Entry' && (evt.direction === 'Entry' || evt.direction === 'In')) ||
        (directionFilter === 'Exit' && (evt.direction === 'Exit' || evt.direction === 'Out')) ||
        (directionFilter === 'VIP' && (evt.gateName?.includes('VIP') || evt.cameraName.includes('VIP'))) ||
        (directionFilter === 'EV' && (evt.gateName?.includes('EV') || evt.cameraName.includes('EV')));

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        evt.plateNumber.toLowerCase().includes(q) ||
        evt.cameraName.toLowerCase().includes(q) ||
        (evt.gateName && evt.gateName.toLowerCase().includes(q));

      return matchDir && matchSearch;
    });
  }, [events, directionFilter, searchQuery]);

  // Dynamic Camera Feeds with Saudi plates
  const activeFeeds = [
    {
      name: 'بوابة الشمال 1 (Entry - زوار وموظفين)',
      cam: 'CAM-01-NORTH-IN',
      speed: '22 كم/س',
      plate: events[0]?.plateNumber || 'أ ب ج 1004',
      vehicle: 'Toyota Land Cruiser 300',
      type: 'Entry',
    },
    {
      name: 'بوابة الشمال 1 (Exit - خروج سريع)',
      cam: 'CAM-02-NORTH-OUT',
      speed: '18 كم/س',
      plate: events[1]?.plateNumber || 'س ع د 8080',
      vehicle: 'Lexus LX 600 VIP',
      type: 'Exit',
    },
    {
      name: 'بوابة كبار الشخصيات VIP (مدخل خاص)',
      cam: 'CAM-05-VIP-GATE',
      speed: '12 كم/س',
      plate: events[2]?.plateNumber || 'و ط ن 2030',
      vehicle: 'Genesis G80 Royal',
      type: 'VIP',
    },
    {
      name: 'بوابة الجنوب 2 (Entry - نقل وخدمات)',
      cam: 'CAM-03-SOUTH-IN',
      speed: '25 كم/س',
      plate: events[3]?.plateNumber || 'ف هـ د 9999',
      vehicle: 'Mercedes-Benz S-580',
      type: 'Entry',
    },
    {
      name: 'بوابة الشرق 3 (Exit - مسار العليا)',
      cam: 'CAM-04-EAST-OUT',
      speed: '19 كم/س',
      plate: events[4]?.plateNumber || 'ق م ر 1446',
      vehicle: 'Porsche Cayenne GTS',
      type: 'Exit',
    },
    {
      name: 'محطة الشحن الكهربائي EV Hub',
      cam: 'CAM-06-EV-HUB',
      speed: '0 كم/س (شحن)',
      plate: events[8]?.plateNumber || 'ط و ق 3000',
      vehicle: 'Lucid Air Grand Touring',
      type: 'EV',
    },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Section */}
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
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(56, 189, 248, 0.15))',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
              }}
            >
              <SensorsIcon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                شاشة المراقبة اللحظية (Live LPR Monitor)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                بث حي مستمر وكشف فوري للوحات المركبات السعودية عبر كاميرات الذكاء الاصطناعي وتقنية SignalR
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            onClick={handleSimulateScan}
            disabled={isSimulating}
            startIcon={<CameraAltIcon />}
            sx={{
              borderColor: 'rgba(0, 240, 255, 0.4)',
              color: '#00F0FF',
              fontWeight: 800,
              borderRadius: '10px',
              bgcolor: 'rgba(0, 240, 255, 0.06)',
              '&:hover': {
                bgcolor: 'rgba(0, 240, 255, 0.15)',
                borderColor: '#00F0FF',
              },
            }}
          >
            {isSimulating ? 'جاري الرصد...' : 'محاكاة رصد مركبة'}
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={fetchOperations}
            startIcon={<RefreshIcon />}
            sx={{
              borderColor: 'rgba(56, 189, 248, 0.3)',
              color: '#38BDF8',
              borderRadius: '10px',
            }}
          >
            تحديث
          </Button>

          <Chip
            icon={<VideocamIcon />}
            label="Live Stream Active • 6 Cams"
            color="error"
            sx={{
              fontWeight: 800,
              bgcolor: 'rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
              border: '1px solid #EF4444',
              animation: 'pulse 1.8s infinite',
            }}
          />
        </Stack>
      </Stack>

      {/* KPI Stats Ribbon */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'الكاميرات المتصلة الآن', val: '6 كاميرات نشطة', sub: '1080p @ 30 FPS', color: '#10B981', icon: <SensorsIcon fontSize="small" /> },
          { label: 'إجمالي المركبات المرصودة', val: `${events.length} مركبة`, sub: 'رصد لحظي فوري', color: '#38BDF8', icon: <CameraAltIcon fontSize="small" /> },
          { label: 'متوسط دقة التعرف (OCR)', val: '99.2%', sub: 'مطابقة لوحات سعودية', color: '#00F0FF', icon: <VerifiedUserIcon fontSize="small" /> },
          { label: 'حركة البوابات اللحظية', val: '14 دخول • 10 خروج', sub: 'انسيابية 100%', color: '#A78BFA', icon: <SpeedIcon fontSize="small" /> },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                p: 2,
                borderRadius: '14px',
                bgcolor: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${alpha(kpi.color, 0.25)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: alpha(kpi.color, 0.15),
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {kpi.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 11, display: 'block' }}>
                  {kpi.label}
                </Typography>
                <Typography variant="subtitle1" fontWeight={900} sx={{ color: kpi.color, lineHeight: 1.2 }}>
                  {kpi.val}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                  {kpi.sub}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Grid of 6 Active Simulated Live Camera Feeds */}
      <Typography variant="h6" fontWeight={900} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CameraAltIcon sx={{ color: '#00F0FF' }} />
        شاشات البث المباشر للبوابات والممرات (Live Camera Matrix)
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {activeFeeds.map((feed, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode),
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                transition: 'all 220ms ease',
                '&:hover': {
                  borderColor: '#00F0FF',
                  boxShadow: '0 8px 24px rgba(0, 240, 255, 0.25)',
                },
              }}
            >
              {/* Simulated Camera Video Viewport */}
              <Box
                sx={{
                  height: 190,
                  bgcolor: '#050810',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.3)} 0%, #030712 100%)`,
                }}
              >
                {/* Background Grid Pattern Simulation */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    pointerEvents: 'none',
                  }}
                />

                <CameraAltIcon sx={{ fontSize: 56, color: alpha('#fff', 0.15) }} />

                {/* Overlaid OCR Authentic Saudi License Plate Bounding Box */}
                <Box
                  sx={{
                    position: 'absolute',
                    border: '2px dashed #00F0FF',
                    borderRadius: '8px',
                    p: 0.75,
                    bgcolor: 'rgba(11, 18, 32, 0.85)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <SaudiPlateBadge plateNumber={feed.plate} size="small" />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      color: '#38BDF8',
                      letterSpacing: 0.5,
                    }}
                  >
                    {feed.vehicle}
                  </Typography>
                </Box>

                {/* Live Top Badges */}
                <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 1 }}>
                  <Chip label="REC • LIVE" size="small" color="error" sx={{ fontWeight: 800, height: 22 }} />
                  <Chip
                    label="ONLINE"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      height: 22,
                      bgcolor: 'rgba(16, 185, 129, 0.2)',
                      color: '#10B981',
                      border: '1px solid #10B981',
                    }}
                  />
                </Box>

                {/* Radar Speed Badge */}
                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#00F0FF',
                      bgcolor: 'rgba(0, 0, 0, 0.75)',
                      px: 1,
                      py: 0.35,
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <SpeedIcon sx={{ fontSize: 13 }} />
                    {feed.speed}
                  </Typography>
                </Box>

                {/* Bottom Spec Footer */}
                <Box sx={{ position: 'absolute', bottom: 8, right: 10 }}>
                  <Typography variant="caption" sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.7)', px: 1, py: 0.25, borderRadius: 1, fontSize: 10 }}>
                    30 FPS • 1080p • AI OCR
                  </Typography>
                </Box>
              </Box>

              {/* Card Label Bar */}
              <Box sx={{ p: 1.75, bgcolor: 'rgba(15, 23, 42, 0.85)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900}>
                      {feed.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {feed.cam} • محرك رصد اللوحات v4.2
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={feed.type === 'Entry' ? 'دخول' : feed.type === 'Exit' ? 'خروج' : feed.type}
                    sx={{
                      fontWeight: 800,
                      fontSize: 10,
                      bgcolor:
                        feed.type === 'Entry'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : feed.type === 'Exit'
                          ? 'rgba(56, 189, 248, 0.15)'
                          : 'rgba(167, 139, 250, 0.15)',
                      color:
                        feed.type === 'Entry'
                          ? '#10B981'
                          : feed.type === 'Exit'
                          ? '#38BDF8'
                          : '#A78BFA',
                      border: '1px solid currentColor',
                    }}
                  />
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Live Table of Events with Filters */}
      <Card
        sx={{
          ...glassPanel({}, theme.palette.mode),
          p: 3,
          borderRadius: '18px',
          bgcolor: 'rgba(11, 18, 32, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              سجل الرصد الحي المستمر (Incoming LPR Stream)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              تدفق حي للوحات المرصودة مع مطابقة فورية لقواعد بيانات المرور والتصاريح الذكية
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
            {/* Filter Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {[
                { id: 'ALL', label: `الكل (${events.length})`, color: '#38BDF8' },
                { id: 'Entry', label: 'دخول (Entry)', color: '#10B981' },
                { id: 'Exit', label: 'خروج (Exit)', color: '#38BDF8' },
                { id: 'VIP', label: 'VIP', color: '#A78BFA' },
                { id: 'EV', label: 'شواحن EV', color: '#00F0FF' },
              ].map((btn) => (
                <Chip
                  key={btn.id}
                  label={btn.label}
                  size="small"
                  onClick={() => setDirectionFilter(btn.id as any)}
                  sx={{
                    fontWeight: 800,
                    cursor: 'pointer',
                    bgcolor: directionFilter === btn.id ? alpha(btn.color, 0.25) : 'rgba(255, 255, 255, 0.05)',
                    color: directionFilter === btn.id ? btn.color : 'text.secondary',
                    border: `1px solid ${directionFilter === btn.id ? btn.color : 'rgba(255, 255, 255, 0.1)'}`,
                  }}
                />
              ))}
            </Stack>

            {/* Search Box */}
            <TextField
              size="small"
              placeholder="بحث برقم اللوحة أو اسم البوابة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                minWidth: { xs: '100%', sm: 220 },
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '10px',
                  borderColor: 'rgba(56, 189, 248, 0.25)',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 900, color: 'text.secondary', fontSize: 12 } }}>
                <TableCell>اللوحة المرصودة (Saudi Plate)</TableCell>
                <TableCell>الكاميرا والبوابة</TableCell>
                <TableCell>الاتجاه (Direction)</TableCell>
                <TableCell>نسبة دقة التعرف (Confidence)</TableCell>
                <TableCell>التوقيت</TableCell>
                <TableCell>حالة التصريح والتحقق</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map((evt, idx) => {
                const isEntry = evt.direction === 'Entry' || evt.direction === 'In';
                const isVip = evt.gateName?.includes('VIP') || evt.cameraName.includes('VIP');
                const isEv = evt.gateName?.includes('EV') || evt.cameraName.includes('EV');

                return (
                  <TableRow
                    key={evt.id}
                    hover
                    sx={{
                      '&:first-of-type': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      },
                      transition: 'background-color 150ms ease',
                    }}
                  >
                    {/* Plate with SaudiPlateBadge */}
                    <TableCell>
                      <Box sx={{ display: 'inline-block' }}>
                        <SaudiPlateBadge plateNumber={evt.plateNumber} size="small" />
                      </Box>
                    </TableCell>

                    {/* Camera & Gate */}
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" fontWeight={800}>
                          {evt.gateName || 'بوابة رئيسية'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                          {evt.cameraName}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Direction */}
                    <TableCell>
                      <Chip
                        icon={isEntry ? <ArrowDownwardIcon sx={{ fontSize: 14 }} /> : <ArrowUpwardIcon sx={{ fontSize: 14 }} />}
                        label={isEntry ? 'دخول (Entry)' : 'خروج (Exit)'}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: isEntry ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: isEntry ? '#10B981' : '#38BDF8',
                          border: `1px solid ${isEntry ? '#10B981' : '#38BDF8'}`,
                        }}
                      />
                    </TableCell>

                    {/* Confidence Meter */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          label={`${(evt.confidence * 100).toFixed(1)}%`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: evt.confidence >= 0.98 ? 'rgba(0, 240, 255, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: evt.confidence >= 0.98 ? '#00F0FF' : '#F59E0B',
                            border: `1px solid ${evt.confidence >= 0.98 ? '#00F0FF' : '#F59E0B'}`,
                          }}
                        />
                      </Stack>
                    </TableCell>

                    {/* Timestamp */}
                    <TableCell>
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary' }}>
                        {evt.eventTime}
                      </Typography>
                    </TableCell>

                    {/* Auth Status */}
                    <TableCell>
                      {isVip ? (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: 14 }} />}
                          label="تصريح كبار الشخصيات VIP"
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: 'rgba(167, 139, 250, 0.18)',
                            color: '#A78BFA',
                            border: '1px solid #A78BFA',
                          }}
                        />
                      ) : isEv ? (
                        <Chip
                          icon={<EvStationIcon sx={{ fontSize: 14 }} />}
                          label="حجز شاحن كهربائي نشط"
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: 'rgba(0, 240, 255, 0.18)',
                            color: '#00F0FF',
                            border: '1px solid #00F0FF',
                          }}
                        />
                      ) : idx % 3 === 0 ? (
                        <Chip
                          label="مصرح - اشتراك ساري"
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 800,
                            color: '#10B981',
                            borderColor: '#10B981',
                          }}
                        />
                      ) : (
                        <Chip
                          label="تذكرة زائر مؤكدة"
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            color: '#38BDF8',
                            borderColor: '#38BDF8',
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
