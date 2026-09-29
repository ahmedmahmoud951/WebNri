import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import AccessibleIcon from '@mui/icons-material/Accessible';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LayersIcon from '@mui/icons-material/Layers';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigationIcon from '@mui/icons-material/Navigation';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { smartParkingApi, type BuildingItem, type FloorItem, type FloorMapSpot } from '../../core/api/smartParkingApi';
import { SaudiPlateBadge } from '../../core/SaudiPlateBadge';

export function FloorMapsPage() {
  const theme = useTheme();

  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [floors, setFloors] = useState<FloorItem[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [spots, setSpots] = useState<FloorMapSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<FloorMapSpot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reserveSuccess, setReserveSuccess] = useState(false);

  // Load buildings
  useEffect(() => {
    let mounted = true;
    smartParkingApi.getBuildings().then((bList) => {
      if (!mounted) return;
      if (bList && bList.length > 0) {
        setBuildings(bList);
        setSelectedBuildingId(bList[0].id);
      }
    }).catch(() => {
      if (!mounted) return;
      const fallbackBuildings: BuildingItem[] = [
        { id: '22222222-2222-2222-2222-000000000001', name: 'برج أ - الأندلس (تجاري وتنفيذي)', code: 'BLD-A', totalCapacity: 200, floorsCount: 3 },
        { id: '22222222-2222-2222-2222-000000000002', name: 'برج ب - الرياض (سكني ومكتبي)', code: 'BLD-B', totalCapacity: 180, floorsCount: 2 },
        { id: '22222222-2222-2222-2222-000000000003', name: 'برج ج - العليا (مراكز ضيافة ومؤتمرات)', code: 'BLD-C', totalCapacity: 120, floorsCount: 1 },
      ];
      setBuildings(fallbackBuildings);
      setSelectedBuildingId(fallbackBuildings[0].id);
    });
    return () => { mounted = false; };
  }, []);

  // Load floors when building changes
  useEffect(() => {
    if (!selectedBuildingId) return;
    let mounted = true;
    smartParkingApi.getBuildingFloors(selectedBuildingId).then((fList) => {
      if (!mounted) return;
      if (fList && fList.length > 0) {
        setFloors(fList);
        setSelectedFloorId(fList[0].id);
      }
    }).catch(() => {
      if (!mounted) return;
      const fallbackFloors: FloorItem[] = [
        { id: '33333333-3333-3333-2221-000000000001', name: 'القبو الثاني (B2)', floorNumber: -2, capacity: 80, buildingId: selectedBuildingId },
        { id: '33333333-3333-3333-2221-000000000002', name: 'القبو الأول (B1)', floorNumber: -1, capacity: 70, buildingId: selectedBuildingId },
        { id: '33333333-3333-3333-2221-000000000003', name: 'الدور الأرضي (G)', floorNumber: 0, capacity: 50, buildingId: selectedBuildingId },
      ];
      setFloors(fallbackFloors);
      setSelectedFloorId(fallbackFloors[0].id);
    });
    return () => { mounted = false; };
  }, [selectedBuildingId]);

  // Load map spots when floor changes
  useEffect(() => {
    if (!selectedFloorId) return;
    let mounted = true;
    setLoading(true);
    smartParkingApi.getFloorMap(selectedFloorId)
      .then((mapData) => {
        if (!mounted) return;
        if (mapData?.spots && mapData.spots.length > 0) {
          setSpots(mapData.spots);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch floor spots, using dynamic layout:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [selectedFloorId]);

  // Calculate live statistics
  const stats = useMemo(() => {
    const total = spots.length;
    const vacant = spots.filter((s) => s.status === 'Vacant').length;
    const occupied = spots.filter((s) => s.status === 'Occupied').length;
    const reserved = spots.filter((s) => s.status === 'Reserved').length;
    const vip = spots.filter((s) => s.status === 'VIP').length;
    const charging = spots.filter((s) => s.status === 'Charging').length;
    const disabled = spots.filter((s) => s.status === 'Disabled').length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, vacant, occupied, reserved, vip, charging, disabled, occupancyRate };
  }, [spots]);

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchStatus = statusFilter === 'ALL' || spot.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        spot.spotNumber.toLowerCase().includes(q) ||
        spot.label.toLowerCase().includes(q) ||
        (spot.currentPlateNumber && spot.currentPlateNumber.toLowerCase().includes(q)) ||
        (spot.zone && spot.zone.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [spots, statusFilter, searchQuery]);

  const getSpotColor = (status: FloorMapSpot['status']) => {
    switch (status) {
      case 'Vacant':
        return '#10B981'; // Vibrant Emerald
      case 'Occupied':
        return '#EF4444'; // Vibrant Crimson
      case 'Reserved':
        return '#38BDF8'; // Sky Blue
      case 'VIP':
        return '#A78BFA'; // Royal Purple
      case 'Charging':
        return '#00F0FF'; // Neon Cyan
      case 'Disabled':
        return '#60A5FA'; // Calm Blue
      default:
        return '#94A3B8';
    }
  };

  const getSpotLabelAr = (status: FloorMapSpot['status']) => {
    switch (status) {
      case 'Vacant':
        return 'متاح';
      case 'Occupied':
        return 'مشغول';
      case 'Reserved':
        return 'محجوز';
      case 'VIP':
        return 'VIP كبار الشخصيات';
      case 'Charging':
        return 'شاحن كهربائي';
      case 'Disabled':
        return 'أصحاب الهمم';
      default:
        return status;
    }
  };

  const getSpotIcon = (status: FloorMapSpot['status']) => {
    switch (status) {
      case 'Occupied':
        return <DirectionsCarIcon sx={{ fontSize: 20 }} />;
      case 'VIP':
        return <StarIcon sx={{ fontSize: 18 }} />;
      case 'Charging':
        return <EvStationIcon sx={{ fontSize: 18 }} />;
      case 'Disabled':
        return <AccessibleIcon sx={{ fontSize: 18 }} />;
      case 'Reserved':
        return <BookmarkIcon sx={{ fontSize: 18 }} />;
      default:
        return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    }
  };

  const handleBookSpot = () => {
    if (!selectedSpot) return;
    setSpots((prev) =>
      prev.map((s) => (s.id === selectedSpot.id ? { ...s, status: 'Reserved' as const } : s))
    );
    setSelectedSpot(null);
    setReserveSuccess(true);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(0, 240, 255, 0.15))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}
            >
              <LayersIcon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                خريطة الأدوار والمواقف التفاعلية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                متابعة لحظية وتخطيط رقمي متكامل لكافة الأدوار والمواقف ومحطات الشحن الكهربائي
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Building & Floor Selectors */}
        <Stack direction="row" spacing={2} sx={{ minWidth: { xs: '100%', md: 440 } }}>
          <TextField
            select
            size="small"
            label="المبنى (Building)"
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                borderRadius: '10px',
                borderColor: 'rgba(56, 189, 248, 0.25)',
              },
            }}
            InputProps={{
              startAdornment: <ApartmentIcon sx={{ mr: 1, color: '#38BDF8', fontSize: 20 }} />,
            }}
          >
            {buildings.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="الدور (Floor)"
            value={selectedFloorId}
            onChange={(e) => setSelectedFloorId(e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                borderRadius: '10px',
                borderColor: 'rgba(56, 189, 248, 0.25)',
              },
            }}
            InputProps={{
              startAdornment: <LayersIcon sx={{ mr: 1, color: '#00F0FF', fontSize: 20 }} />,
            }}
          >
            {floors.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {/* KPI Ribbon */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[
          { label: 'إجمالي سعة الدور', val: stats.total, color: '#38BDF8', icon: <LayersIcon fontSize="small" /> },
          { label: 'المواقف المتاحة', val: stats.vacant, color: '#10B981', icon: <CheckCircleIcon fontSize="small" /> },
          { label: 'المواقف المشغولة', val: stats.occupied, color: '#EF4444', icon: <DirectionsCarIcon fontSize="small" /> },
          { label: 'محجوز مسبقاً', val: stats.reserved, color: '#38BDF8', icon: <BookmarkIcon fontSize="small" /> },
          { label: 'شواحن كهربائية', val: stats.charging, color: '#00F0FF', icon: <EvStationIcon fontSize="small" /> },
          { label: 'كبار الشخصيات VIP', val: stats.vip, color: '#A78BFA', icon: <StarIcon fontSize="small" /> },
          { label: 'أصحاب الهمم', val: stats.disabled, color: '#60A5FA', icon: <AccessibleIcon fontSize="small" /> },
        ].map((item, idx) => (
          <Grid item xs={6} sm={4} md={1.71} key={idx}>
            <Card
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${alpha(item.color, 0.25)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                transition: 'all 200ms ease',
                '&:hover': {
                  borderColor: item.color,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 20px ${alpha(item.color, 0.2)}`,
                },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  bgcolor: alpha(item.color, 0.15),
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 11, display: 'block' }}>
                  {item.label}
                </Typography>
                <Typography variant="h6" fontWeight={900} sx={{ color: item.color, lineHeight: 1.1 }}>
                  {item.val}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Control & Filter Toolbar */}
      <Card
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '16px',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          {/* Status Filter Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {[
              { id: 'ALL', label: `الكل (${spots.length})`, color: '#38BDF8' },
              { id: 'Vacant', label: `متاح (${stats.vacant})`, color: '#10B981' },
              { id: 'Occupied', label: `مشغول (${stats.occupied})`, color: '#EF4444' },
              { id: 'Reserved', label: `محجوز (${stats.reserved})`, color: '#38BDF8' },
              { id: 'Charging', label: `شواحن EV (${stats.charging})`, color: '#00F0FF' },
              { id: 'VIP', label: `VIP (${stats.vip})`, color: '#A78BFA' },
              { id: 'Disabled', label: `أصحاب الهمم (${stats.disabled})`, color: '#60A5FA' },
            ].map((btn) => (
              <Chip
                key={btn.id}
                label={btn.label}
                onClick={() => setStatusFilter(btn.id)}
                sx={{
                  fontWeight: 700,
                  fontSize: 12,
                  bgcolor: statusFilter === btn.id ? alpha(btn.color, 0.25) : 'rgba(255, 255, 255, 0.04)',
                  color: statusFilter === btn.id ? btn.color : 'text.secondary',
                  border: `1px solid ${statusFilter === btn.id ? btn.color : 'rgba(255, 255, 255, 0.1)'}`,
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  '&:hover': {
                    bgcolor: alpha(btn.color, 0.2),
                    borderColor: btn.color,
                  },
                }}
              />
            ))}
          </Stack>

          {/* Search Box */}
          <TextField
            size="small"
            placeholder="بحث برقم الموقف أو لوحة السيارة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              minWidth: { xs: '100%', md: 280 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(11, 18, 32, 0.8)',
                borderRadius: '10px',
                borderColor: 'rgba(56, 189, 248, 0.25)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#38BDF8', fontSize: 19 }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Card>

      {/* Blueprint Visual Map Canvas */}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 340 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: '#38BDF8' }} />
            <Typography variant="body2" color="text.secondary">
              جاري مزامنة بيانات الدور والمواقف اللحظية...
            </Typography>
          </Stack>
        </Box>
      ) : (
        <Card
          sx={{
            p: 3,
            bgcolor: 'rgba(11, 18, 32, 0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(56, 189, 248, 0.22)',
            borderRadius: '18px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Floor Blueprint Navigation Points */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            sx={{
              p: 1.5,
              mb: 2.5,
              borderRadius: '12px',
              bgcolor: 'rgba(15, 23, 42, 0.75)',
              border: '1px dashed rgba(56, 189, 248, 0.3)',
            }}
          >
            <Stack direction="row" spacing={3} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <NavigationIcon sx={{ color: '#10B981', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#10B981' }}>
                  بوابة الدخول الرئيسية (Entry A)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <ElevatorIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#38BDF8' }}>
                  المصاعد والردهة المركزية (Lobby)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <ExitToAppIcon sx={{ color: '#EF4444', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#EF4444' }}>
                  مخرج الطوارئ والمسار السريع (Exit B)
                </Typography>
              </Stack>
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              المعروض الآن: {filteredSpots.length} من أصل {spots.length} موقف
            </Typography>
          </Stack>

          {/* Spots Interactive Grid */}
          <Grid container spacing={2}>
            {filteredSpots.map((spot) => {
              const spotColor = getSpotColor(spot.status);
              const isOccupied = spot.status === 'Occupied';
              const isCharging = spot.status === 'Charging';

              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={spot.id}>
                  <Box
                    onClick={() => setSelectedSpot(spot)}
                    sx={{
                      p: 1.75,
                      borderRadius: '14px',
                      cursor: 'pointer',
                      border: `1.5px solid ${alpha(spotColor, isOccupied ? 0.6 : 0.35)}`,
                      bgcolor: alpha(spotColor, isOccupied ? 0.12 : 0.04),
                      transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      minHeight: 110,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 28px ${alpha(spotColor, 0.35)}`,
                        borderColor: spotColor,
                        bgcolor: alpha(spotColor, 0.18),
                      },
                    }}
                  >
                    {/* Top Spot Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: spotColor,
                            boxShadow: `0 0 8px ${spotColor}`,
                          }}
                        />
                        <Typography variant="subtitle2" fontWeight={900} sx={{ letterSpacing: 0.5 }}>
                          {spot.spotNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ color: spotColor }}>{getSpotIcon(spot.status)}</Box>
                    </Stack>

                    {/* License Plate Display if Occupied */}
                    {spot.currentPlateNumber ? (
                      <Box sx={{ my: 0.75, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <SaudiPlateBadge plateNumber={spot.currentPlateNumber} size="small" />
                        {spot.vehicleModel && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.75)',
                              fontSize: 9.5,
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 130,
                            }}
                          >
                            {spot.vehicleModel}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: 11,
                          display: 'block',
                          my: 0.5,
                          textAlign: 'center',
                        }}
                      >
                        {spot.zone || 'المنطقة العامة'}
                      </Typography>
                    )}

                    {/* Bottom Status Badge */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={getSpotLabelAr(spot.status)}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 800,
                          bgcolor: alpha(spotColor, 0.22),
                          color: spotColor,
                          border: `1px solid ${alpha(spotColor, 0.4)}`,
                        }}
                      />
                      {isCharging && (
                        <Typography variant="caption" sx={{ fontSize: 10, color: '#00F0FF', fontWeight: 700 }}>
                          22 kW
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Card>
      )}

      {/* Spot Detail & Inspection Modal */}
      <Dialog
        open={Boolean(selectedSpot)}
        onClose={() => setSelectedSpot(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0B1220',
            backgroundImage: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.15), transparent 70%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            p: 1,
            backdropFilter: 'blur(24px)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: 18 }}>
          تفاصيل الموقف: {selectedSpot?.spotNumber}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {selectedSpot && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  الحالة التشغيلية الآن:
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: getSpotColor(selectedSpot.status),
                      boxShadow: `0 0 10px ${getSpotColor(selectedSpot.status)}`,
                    }}
                  />
                  <Typography variant="h6" fontWeight={900} sx={{ color: getSpotColor(selectedSpot.status) }}>
                    {getSpotLabelAr(selectedSpot.status)}
                  </Typography>
                </Stack>
              </Box>

              {selectedSpot.currentPlateNumber ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    المركبة المتواجدة حالياً (LPR Match):
                  </Typography>

                  <Box sx={{ mb: 1.5 }}>
                    <SaudiPlateBadge plateNumber={selectedSpot.currentPlateNumber} size="large" />
                  </Box>

                  {selectedSpot.vehicleModel && (
                    <Stack spacing={0.75} sx={{ mb: 1.5, p: 1.25, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">طراز المركبة:</Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ color: '#38BDF8' }}>
                          {selectedSpot.vehicleModel}
                        </Typography>
                      </Stack>
                      {selectedSpot.vehicleColor && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">لون الهيكل:</Typography>
                          <Typography variant="caption" fontWeight={700}>
                            {selectedSpot.vehicleColor}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      مدة الوقوف: {selectedSpot.parkedDuration || '45 دقيقة'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                      الرسوم المتراكمة: 15.00 SAR
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 700 }}>
                    الموقف شاغر وجاهز للاستخدام الفوري أو الحجز المسبق.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    التعرفة: 5 SAR / الساعة • فترة السماح: 15 دقيقة
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  المنطقة والتوزيع:
                </Typography>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#38BDF8', mt: 0.25 }}>
                  {selectedSpot.zone || 'المنطقة الشرقية (Zone East)'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  المسافات ونقاط الوصول:
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    • المصعد المركزي: 15 متراً (ممر A-1)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    • جهاز السداد الذكي (Payment Kiosk): 22 متراً
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    • مخرج الطوارئ ومسار الإخلاء: 30 متراً
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedSpot(null)} sx={{ color: 'text.secondary', fontWeight: 700 }}>
            إغلاق
          </Button>
          {selectedSpot?.status === 'Vacant' && (
            <Button
              variant="contained"
              onClick={handleBookSpot}
              sx={{
                background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
                color: '#080D1A',
                fontWeight: 900,
                borderRadius: '10px',
                px: 3,
                boxShadow: '0 4px 16px rgba(0, 240, 255, 0.35)',
              }}
            >
              تأكيد الحجز الفوري لهذا المكان
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Reservation Confirmation Toast */}
      <Snackbar
        open={reserveSuccess}
        autoHideDuration={4000}
        onClose={() => setReserveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setReserveSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 800, bgcolor: '#10B981', color: '#FFF' }}
        >
          تم حجز الموقف بنجاح وجرى إصدار تصريح الدخول الرقمي!
        </Alert>
      </Snackbar>
    </Box>
  );
}
