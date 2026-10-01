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
  IconButton,
  Tooltip,
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
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentsIcon from '@mui/icons-material/Payments';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { useTranslation } from 'react-i18next';
import {
  smartParkingApi,
  type BuildingItem,
  type FloorItem,
  type FloorMapSpot,
} from '../../core/api/smartParkingApi';
import { SaudiPlateBadge } from '../../core/SaudiPlateBadge';
import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';

export function FloorMapsPage() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [floors, setFloors] = useState<FloorItem[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [spots, setSpots] = useState<FloorMapSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<FloorMapSpot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [reserveSuccess, setReserveSuccess] = useState(false);

  // Load buildings
  useEffect(() => {
    let mounted = true;
    smartParkingApi
      .getBuildings()
      .then((bList) => {
        if (!mounted) return;
        if (bList && bList.length > 0) {
          setBuildings(bList);
          setSelectedBuildingId(bList[0].id);
        }
      })
      .catch(() => {
        if (!mounted) return;
        const fallbackBuildings: BuildingItem[] = [
          {
            id: '22222222-2222-2222-2222-000000000001',
            name: isRtl ? 'برج أ - الأندلس (تجاري وتنفيذي)' : 'Tower A - Al Andalus (Executive)',
            code: 'BLD-A',
            totalCapacity: 200,
            floorsCount: 3,
          },
          {
            id: '22222222-2222-2222-2222-000000000002',
            name: isRtl ? 'برج ب - الرياض (سكني ومكتبي)' : 'Tower B - Riyadh (Residential)',
            code: 'BLD-B',
            totalCapacity: 180,
            floorsCount: 2,
          },
          {
            id: '22222222-2222-2222-2222-000000000003',
            name: isRtl ? 'برج ج - العليا (مؤتمرات وضيافة)' : 'Tower C - Olaya (Conference)',
            code: 'BLD-C',
            totalCapacity: 120,
            floorsCount: 1,
          },
        ];
        setBuildings(fallbackBuildings);
        setSelectedBuildingId(fallbackBuildings[0].id);
      });
    return () => {
      mounted = false;
    };
  }, [isRtl]);

  // Load floors when building changes
  useEffect(() => {
    if (!selectedBuildingId) return;
    let mounted = true;
    smartParkingApi
      .getBuildingFloors(selectedBuildingId)
      .then((fList) => {
        if (!mounted) return;
        const allBuildingOption: FloorItem = {
          id: 'ALL_BUILDING_FLOORS',
          name: isRtl ? '🏢 كامل المبنى (جميع الأدوار - عرض شامل)' : '🏢 Entire Building (All Floors & Bays)',
          floorNumber: 999,
          capacity: 200,
          buildingId: selectedBuildingId,
        };
        if (fList && fList.length > 0) {
          const cleanedList = fList.map((f) => ({
            ...f,
            name: f.name.replace(/القبو/g, 'المستوى السفلي'),
          }));
          setFloors([allBuildingOption, ...cleanedList]);
          setSelectedFloorId(allBuildingOption.id);
        } else {
          setFloors([allBuildingOption]);
          setSelectedFloorId(allBuildingOption.id);
        }
      })
      .catch(() => {
        if (!mounted) return;
        const fallbackFloors: FloorItem[] = [
          {
            id: 'ALL_BUILDING_FLOORS',
            name: isRtl ? '🏢 كامل المبنى (جميع الأدوار - عرض شامل)' : '🏢 Entire Building (All Floors & Bays)',
            floorNumber: 999,
            capacity: 200,
            buildingId: selectedBuildingId,
          },
          {
            id: '33333333-3333-3333-2221-000000000001',
            name: isRtl ? 'المستوى السفلي الثاني (B2) - المواقف التنفيذية' : 'Lower Level 2 (B2) - Executive',
            floorNumber: -2,
            capacity: 80,
            buildingId: selectedBuildingId,
          },
          {
            id: '33333333-3333-3333-2221-000000000002',
            name: isRtl ? 'المستوى السفلي الأول (B1) - المواقف العامة وشواحن EV' : 'Lower Level 1 (B1) - Public & EV',
            floorNumber: -1,
            capacity: 70,
            buildingId: selectedBuildingId,
          },
          {
            id: '33333333-3333-3333-2221-000000000003',
            name: isRtl ? 'الدور الأرضي (G) - كبار الشخصيات والزوار' : 'Ground Floor (G) - VIP & Guests',
            floorNumber: 0,
            capacity: 50,
            buildingId: selectedBuildingId,
          },
        ];
        setFloors(fallbackFloors);
        setSelectedFloorId(fallbackFloors[0].id);
      });
    return () => {
      mounted = false;
    };
  }, [selectedBuildingId, isRtl]);

  // Load map spots when floor changes (or aggregate all building floors)
  useEffect(() => {
    if (!selectedFloorId) return;
    let mounted = true;
    setLoading(true);

    if (selectedFloorId === 'ALL_BUILDING_FLOORS') {
      const b2Id = '33333333-3333-3333-2221-000000000001';
      const b1Id = '33333333-3333-3333-2221-000000000002';
      const gId = '33333333-3333-3333-2221-000000000003';

      Promise.all([
        smartParkingApi.getFloorMap(b2Id).catch(() => null),
        smartParkingApi.getFloorMap(b1Id).catch(() => null),
        smartParkingApi.getFloorMap(gId).catch(() => null),
      ])
        .then(([mB2, mB1, mG]) => {
          if (!mounted) return;
          const spotsB2 = (mB2?.spots || []).map((s) => ({
            ...s,
            id: `B2-${s.id}`,
            spotNumber: `B2-${s.spotNumber}`,
            zone: `${isRtl ? 'المستوى B2' : 'Level B2'} • ${s.zone}`,
          }));
          const spotsB1 = (mB1?.spots || []).map((s) => ({
            ...s,
            id: `B1-${s.id}`,
            spotNumber: `B1-${s.spotNumber}`,
            zone: `${isRtl ? 'المستوى B1' : 'Level B1'} • ${s.zone}`,
          }));
          const spotsG = (mG?.spots || []).map((s) => ({
            ...s,
            id: `G-${s.id}`,
            spotNumber: `G-${s.spotNumber}`,
            zone: `${isRtl ? 'الدور الأرضي G' : 'Ground G'} • ${s.zone}`,
          }));

          const combinedSpots = [...spotsB2, ...spotsB1, ...spotsG];
          setSpots(combinedSpots);
        })
        .catch((err) => {
          console.warn('Could not fetch all building spots:', err);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      smartParkingApi
        .getFloorMap(selectedFloorId)
        .then((mapData) => {
          if (!mounted) return;
          if (mapData?.spots && mapData.spots.length > 0) {
            setSpots(mapData.spots);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch floor spots, using fallback layout:', err);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }

    return () => {
      mounted = false;
    };
  }, [selectedFloorId, isRtl]);

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

  // Available unique zones
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    spots.forEach((s) => {
      if (s.zone) set.add(s.zone);
    });
    return ['ALL', ...Array.from(set)];
  }, [spots]);

  // Filtered spots
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchStatus = statusFilter === 'ALL' || spot.status === statusFilter;
      const matchZone = zoneFilter === 'ALL' || spot.zone === zoneFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        spot.spotNumber.toLowerCase().includes(q) ||
        spot.label.toLowerCase().includes(q) ||
        (spot.currentPlateNumber && spot.currentPlateNumber.toLowerCase().includes(q)) ||
        (spot.vehicleModel && spot.vehicleModel.toLowerCase().includes(q)) ||
        (spot.zone && spot.zone.toLowerCase().includes(q));
      return matchStatus && matchZone && matchQuery;
    });
  }, [spots, statusFilter, zoneFilter, searchQuery]);

  // 2. DISTINCT, HIGH-CONTRAST VIBRANT COLORS (ألوان المشغول والشاغر و VIP وذوو الهمم واضحة ومميزة جداً)
  const getSpotColor = (status: FloorMapSpot['status']) => {
    switch (status) {
      case 'Vacant':
        return '#00E676'; // Ultra-Vibrant Emerald Neon Green (شاغر ومتاح)
      case 'Occupied':
        return '#FF1744'; // Signal Crimson Red (مشغول بمركبة)
      case 'VIP':
        return '#A855F7'; // Electric Royal Purple / Violet (كبار الشخصيات VIP)
      case 'Disabled':
        return '#00B0FF'; // High-Visibility Azure / Electric Blue (ذوو الهمم)
      case 'Charging':
        return '#00F0FF'; // Bright Electric Turquoise (شواحن المركبات EV)
      case 'Reserved':
        return '#FF9100'; // Vibrant Sunset Amber Orange (محجوز مسبقاً)
      default:
        return '#94A3B8';
    }
  };

  // Classical Arabic Labels for Statuses
  const getSpotLabel = (status: FloorMapSpot['status']) => {
    if (!isRtl) {
      switch (status) {
        case 'Vacant':
          return 'Vacant • Ready';
        case 'Occupied':
          return 'Occupied';
        case 'VIP':
          return 'VIP Reserved';
        case 'Disabled':
          return 'Accessible Parking';
        case 'Charging':
          return 'EV Fast Charger';
        case 'Reserved':
          return 'Pre-Reserved';
        default:
          return status;
      }
    }
    switch (status) {
      case 'Vacant':
        return 'شاغر ومتاح';
      case 'Occupied':
        return 'مشغول حالياً';
      case 'VIP':
        return 'مخصص لكبار الشخصيات (VIP)';
      case 'Disabled':
        return 'مخصص لأصحاب الهمم';
      case 'Charging':
        return 'شاحن مركبات كهربائية';
      case 'Reserved':
        return 'محجوز مسبقاً';
      default:
        return status;
    }
  };

  // Spot Icons with high-contrast tactical styling
  const getSpotIcon = (status: FloorMapSpot['status']) => {
    switch (status) {
      case 'Occupied':
        return <DirectionsCarIcon sx={{ fontSize: 20 }} />;
      case 'VIP':
        return <StarIcon sx={{ fontSize: 20 }} />;
      case 'Charging':
        return <EvStationIcon sx={{ fontSize: 20 }} />;
      case 'Disabled':
        return <AccessibleIcon sx={{ fontSize: 21 }} />;
      case 'Reserved':
        return <LockIcon sx={{ fontSize: 18 }} />;
      case 'Vacant':
      default:
        return <CheckCircleIcon sx={{ fontSize: 18 }} />;
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
      {/* Dynamic Keyframes for Slot Micro-Animations */}
      <style>
        {`
          @keyframes statusBeaconPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.4; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slotHoverGlow {
            0% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
            100% { filter: brightness(1); }
          }
        `}
      </style>

      {/* Top Header Console */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', lg: 'center' }}
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.25), rgba(0, 240, 255, 0.15))',
                border: '1.5px solid rgba(0, 240, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
              }}
            >
              <LocalParkingIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5, color: '#F8FAFC' }}>
                {isRtl ? 'الخريطة التفاعلية للأدوار والمواقف الذكية' : 'Interactive Smart Floor Maps & Parking Bays'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.4 }}>
                {isRtl
                  ? 'رصد فوري متقدم لإشغال المواقف • تمييز بصري عالي الدقة للشاغر والمشغول ومواقف VIP وأصحاب الهمم وشواحن EV'
                  : 'Real-time parking bay telemetry • High-contrast visual intelligence for Vacant, Occupied, VIP, Accessible & EV Hubs'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Top Controls: Building Dropdown */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Building Selector */}
          <TextField
            select
            size="small"
            label={isRtl ? 'المبنى المستهدف' : 'Building'}
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            sx={{
              minWidth: 220,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                borderColor: 'rgba(56, 189, 248, 0.3)',
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
        </Stack>
      </Stack>

      {/* QUICK FLOOR SWITCHER BAR (شريط تبديل الأدوار الفوري الجذاب) */}
      <Card
        sx={{
          mb: 3,
          p: 1.75,
          borderRadius: '18px',
          bgcolor: 'rgba(11, 18, 32, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(56, 189, 248, 0.28)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LayersIcon sx={{ color: '#00F0FF' }} />
            <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#F8FAFC', fontSize: 15 }}>
              {isRtl ? 'اختيار الدور والمستوى:' : 'Select Floor Level:'}
            </Typography>
          </Stack>

          {/* Floor Level Quick Chips */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {floors.map((f) => {
              const isSelected = selectedFloorId === f.id;
              return (
                <Box
                  key={f.id}
                  onClick={() => setSelectedFloorId(f.id)}
                  sx={{
                    px: 2.2,
                    py: 1,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: isSelected
                      ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.22), rgba(15, 23, 42, 0.95))'
                      : 'rgba(15, 23, 42, 0.7)',
                    border: `1.5px solid ${isSelected ? '#00F0FF' : 'rgba(56, 189, 248, 0.2)'}`,
                    boxShadow: isSelected
                      ? '0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.15)'
                      : 'none',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    '&:hover': {
                      borderColor: '#00F0FF',
                      bgcolor: 'rgba(0, 240, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: isSelected ? '#00F0FF' : '#64748B',
                      boxShadow: isSelected ? '0 0 10px #00F0FF' : 'none',
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={900}
                    sx={{
                      color: isSelected ? '#F8FAFC' : '#94A3B8',
                      fontSize: 13,
                    }}
                  >
                    {f.name}
                  </Typography>
                  <Chip
                    label={`${f.capacity} ${isRtl ? 'موقف' : 'Spots'}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 800,
                      bgcolor: isSelected ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#00F0FF' : 'text.secondary',
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Stack>
      </Card>

      {/* 1. KPI RIBBON: LUXURY STATISTICS CARDS WITH VIBRANT STATUS GLOW (كروت إحصائيات خرافية) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            labelAr: 'إجمالي مواقف الدور',
            labelEn: 'Total Floor Capacity',
            val: stats.total,
            color: '#38BDF8',
            icon: <LayersIcon fontSize="small" />,
            subAr: 'السعة الكلية للمستوى',
            subEn: 'Full level capacity',
          },
          {
            labelAr: 'شاغر ومتاح فوراً',
            labelEn: 'Vacant & Available',
            val: stats.vacant,
            color: '#00E676', // Emerald Neon Green
            icon: <CheckCircleIcon fontSize="small" />,
            subAr: 'جاهز للركن اللحظي',
            subEn: 'Ready to park now',
          },
          {
            labelAr: 'مشغول بمركبات',
            labelEn: 'Occupied Bays',
            val: stats.occupied,
            color: '#FF1744', // Signal Crimson Red
            icon: <DirectionsCarIcon fontSize="small" />,
            subAr: `${stats.occupancyRate}% نسبة الإشغال`,
            subEn: `${stats.occupancyRate}% occupancy rate`,
          },
          {
            labelAr: 'مواقف كبار الشخصيات VIP',
            labelEn: 'VIP Executive Bays',
            val: stats.vip,
            color: '#A855F7', // Royal Purple
            icon: <StarIcon fontSize="small" />,
            subAr: 'تصاريح رئاسية معتمدة',
            subEn: 'Presidential access',
          },
          {
            labelAr: 'مواقف ذوي الهمم',
            labelEn: 'Accessible (Disabled)',
            val: stats.disabled,
            color: '#00B0FF', // High-Contrast Azure Blue
            icon: <AccessibleIcon fontSize="small" />,
            subAr: 'ممرات واسعة وميسرة',
            subEn: 'Wide access lanes',
          },
          {
            labelAr: 'شواحن المركبات EV',
            labelEn: 'EV Fast Charging',
            val: stats.charging,
            color: '#00F0FF', // Electric Turquoise
            icon: <EvStationIcon fontSize="small" />,
            subAr: 'محطات 22 kW فائقة',
            subEn: '22 kW AC stations',
          },
          {
            labelAr: 'محجوز بموعد مسبق',
            labelEn: 'Pre-Reserved',
            val: stats.reserved,
            color: '#FF9100', // Sunset Amber
            icon: <BookmarkIcon fontSize="small" />,
            subAr: 'تصاريح وتذاكر زوار',
            subEn: 'Visitor bookings',
          },
        ].map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} lg={1.71} key={idx}>
            <Card
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(20px)',
                border: `1.5px solid ${alpha(item.color, 0.35)}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 110,
                transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 6px 20px rgba(0, 0, 0, 0.45)`,
                '&:hover': {
                  borderColor: item.color,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 30px ${alpha(item.color, 0.35)}`,
                  bgcolor: 'rgba(15, 23, 42, 0.95)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: alpha(item.color, 0.15),
                    color: item.color,
                    border: `1px solid ${alpha(item.color, 0.4)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 12px ${alpha(item.color, 0.25)}`,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h4" fontWeight={900} sx={{ color: item.color, lineHeight: 1 }}>
                  {item.val}
                </Typography>
              </Stack>

              <Box sx={{ mt: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#F8FAFC', fontSize: 13 }}>
                  {isRtl ? item.labelAr : item.labelEn}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                  {isRtl ? item.subAr : item.subEn}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 1. ADVANCED CONTROL & FILTER CONSOLE (فلاتر بحث مميزة وخرافية) */}
      <Card
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: 'rgba(11, 18, 32, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '18px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
        }}
      >
        <Stack spacing={2}>
          {/* Row 1: Search Box & Zone Quick Filters */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            {/* Search Input with Icon */}
            <TextField
              size="small"
              placeholder={
                isRtl
                  ? 'بحث سريع برقم الموقف (A-101)، لوحة المركبة، أو نوع الموقف...'
                  : 'Search by spot (A-101), plate number, model, or zone...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flexGrow: 1,
                maxWidth: { md: 480 },
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '12px',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#00F0FF', fontSize: 22 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            {/* Zone Selector Chips */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                <LocationOnIcon sx={{ fontSize: 15, verticalAlign: 'middle', mr: 0.5, color: '#38BDF8' }} />
                {isRtl ? 'المنطقة:' : 'Zone:'}
              </Typography>
              {availableZones.map((z) => (
                <Chip
                  key={z}
                  label={z === 'ALL' ? (isRtl ? 'كافة المناطق' : 'All Zones') : z}
                  size="small"
                  onClick={() => setZoneFilter(z)}
                  sx={{
                    fontWeight: 800,
                    fontSize: 11,
                    bgcolor: zoneFilter === z ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: zoneFilter === z ? '#38BDF8' : 'text.secondary',
                    border: `1px solid ${zoneFilter === z ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(56, 189, 248, 0.15)',
                    },
                  }}
                />
              ))}
            </Stack>
          </Stack>

          {/* Row 2: Status Category Filter Chips with High-Contrast Glowing Borders */}
          <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap alignItems="center">
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              <FilterListIcon sx={{ fontSize: 15, verticalAlign: 'middle', mr: 0.5, color: '#00F0FF' }} />
              {isRtl ? 'حالة الموقف:' : 'Spot Status:'}
            </Typography>

            {[
              { id: 'ALL', labelAr: `كافة المواقف (${spots.length})`, labelEn: `All Spots (${spots.length})`, color: '#38BDF8' },
              { id: 'Vacant', labelAr: `شاغر ومتاح (${stats.vacant})`, labelEn: `Vacant (${stats.vacant})`, color: '#00E676' },
              { id: 'Occupied', labelAr: `مشغول (${stats.occupied})`, labelEn: `Occupied (${stats.occupied})`, color: '#FF1744' },
              { id: 'VIP', labelAr: `VIP كبار الشخصيات (${stats.vip})`, labelEn: `VIP (${stats.vip})`, color: '#A855F7' },
              { id: 'Disabled', labelAr: `أصحاب الهمم (${stats.disabled})`, labelEn: `Accessible (${stats.disabled})`, color: '#00B0FF' },
              { id: 'Charging', labelAr: `شواحن EV (${stats.charging})`, labelEn: `EV Chargers (${stats.charging})`, color: '#00F0FF' },
              { id: 'Reserved', labelAr: `محجوز مسبقاً (${stats.reserved})`, labelEn: `Reserved (${stats.reserved})`, color: '#FF9100' },
            ].map((btn) => {
              const isSelected = statusFilter === btn.id;
              return (
                <Chip
                  key={btn.id}
                  label={isRtl ? btn.labelAr : btn.labelEn}
                  onClick={() => setStatusFilter(btn.id)}
                  sx={{
                    fontWeight: 900,
                    fontSize: 12,
                    py: 1.8,
                    bgcolor: isSelected ? alpha(btn.color, 0.22) : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? btn.color : 'text.secondary',
                    border: `1.5px solid ${isSelected ? btn.color : 'rgba(255, 255, 255, 0.12)'}`,
                    boxShadow: isSelected ? `0 0 16px ${alpha(btn.color, 0.4)}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      bgcolor: alpha(btn.color, 0.18),
                      borderColor: btn.color,
                      transform: 'translateY(-1px)',
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Stack>
      </Card>

      {/* Blueprint Visual Map Canvas */}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 380 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: '#00F0FF' }} />
            <Typography variant="body2" color="text.secondary">
              {isRtl ? 'جاري مزامنة بيانات الدور والمواقف اللحظية...' : 'Synchronizing floor spots telemetry...'}
            </Typography>
          </Stack>
        </Box>
      ) : (
        <Card
          sx={{
            p: 3,
            bgcolor: 'rgba(11, 18, 32, 0.94)',
            backdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(56, 189, 248, 0.28)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65)',
          }}
        >
          {/* Tactical Floor Wayfinding Points Ribbon (أيقونات ومعالم الدور التكتيكية) */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: '14px',
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              border: '1px dashed rgba(56, 189, 248, 0.35)',
            }}
          >
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
              <Stack direction="row" spacing={1} alignItems="center">
                <NavigationIcon sx={{ color: '#00E676', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#00E676' }}>
                  {isRtl ? 'بوابة الدخول الرئيسية (Entry A)' : 'Main Entry Gate (Entry A)'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <ElevatorIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#38BDF8' }}>
                  {isRtl ? 'المصاعد والردهة المركزية (Lobby)' : 'Elevators & Central Lobby'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PaymentsIcon sx={{ color: '#FF9100', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#FF9100' }}>
                  {isRtl ? 'محطة السداد الذاتي (Kiosk)' : 'Self-Payment Kiosk'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <ExitToAppIcon sx={{ color: '#FF1744', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#FF1744' }}>
                  {isRtl ? 'مخرج الطوارئ ومسار الإخلاء (Exit B)' : 'Emergency Evacuation (Exit B)'}
                </Typography>
              </Stack>
            </Stack>

            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800 }}>
              {isRtl
                ? `المعروض حالياً: ${filteredSpots.length} من أصل ${spots.length} موقف`
                : `Showing: ${filteredSpots.length} of ${spots.length} spots`}
            </Typography>
          </Stack>

          {/* 3. EXTRAORDINARY PARKING SLOT CARDS (تصميم مميز وخرافي لكل Slot Park) */}
          <Grid container spacing={2}>
            {filteredSpots.map((spot) => {
              const spotColor = getSpotColor(spot.status);
              const isOccupied = spot.status === 'Occupied';
              const isVacant = spot.status === 'Vacant';
              const isVIP = spot.status === 'VIP';
              const isDisabled = spot.status === 'Disabled';
              const isCharging = spot.status === 'Charging';
              const isReserved = spot.status === 'Reserved';

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={spot.id}>
                  <Box
                    onClick={() => setSelectedSpot(spot)}
                    sx={{
                      p: 1.6,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      bgcolor: isOccupied
                        ? 'rgba(255, 23, 68, 0.08)'
                        : isVacant
                        ? 'rgba(0, 230, 118, 0.06)'
                        : isVIP
                        ? 'rgba(168, 85, 247, 0.08)'
                        : isDisabled
                        ? 'rgba(0, 176, 255, 0.08)'
                        : isCharging
                        ? 'rgba(0, 240, 255, 0.08)'
                        : 'rgba(255, 145, 0, 0.08)',
                      border: `2px solid ${alpha(spotColor, isOccupied ? 0.75 : 0.5)}`,
                      boxShadow: `0 4px 18px rgba(0, 0, 0, 0.45), inset 0 0 14px ${alpha(spotColor, 0.1)}`,
                      transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      minHeight: 165,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 14px 32px ${alpha(spotColor, 0.45)}, inset 0 0 20px ${alpha(spotColor, 0.2)}`,
                        borderColor: spotColor,
                        bgcolor: alpha(spotColor, 0.16),
                      },
                    }}
                  >
                    {/* Parking Stall Curb Stop Indicator at Top */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 5,
                        left: '25%',
                        right: '25%',
                        height: 3,
                        borderRadius: '2px',
                        bgcolor: alpha(spotColor, 0.45),
                        boxShadow: `0 0 6px ${spotColor}`,
                      }}
                    />

                    {/* TOP SLOT HEADER: Number + Pulsing Status Beacon + Category Icon */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            bgcolor: spotColor,
                            boxShadow: `0 0 10px ${spotColor}`,
                            animation: isOccupied || isCharging ? 'statusBeaconPulse 1.8s infinite' : 'none',
                          }}
                        />
                        <Typography
                          variant="subtitle1"
                          fontWeight={900}
                          sx={{
                            color: '#F8FAFC',
                            letterSpacing: 0.5,
                            fontFamily: 'monospace',
                            fontSize: 14.5,
                          }}
                        >
                          {spot.spotNumber}
                        </Typography>
                      </Stack>

                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '8px',
                          bgcolor: alpha(spotColor, 0.18),
                          color: spotColor,
                          border: `1px solid ${alpha(spotColor, 0.35)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 0 10px ${alpha(spotColor, 0.2)}`,
                        }}
                      >
                        {getSpotIcon(spot.status)}
                      </Box>
                    </Stack>

                    {/* CENTER PARKING BAY INTERIOR (باطن الموقف الذكي) */}
                    <Box
                      sx={{
                        my: 1.2,
                        p: 1.2,
                        borderRadius: '12px',
                        bgcolor: 'rgba(3, 7, 18, 0.85)',
                        border: `1px dashed ${alpha(spotColor, 0.3)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 74,
                        textAlign: 'center',
                      }}
                    >
                      {/* CASE 1: OCCUPIED (مشغول - سيارة متوقفة مع اللوحة واللون والمدة) */}
                      {isOccupied && spot.currentPlateNumber && (
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
                          <SaudiPlateBadge plateNumber={spot.currentPlateNumber} size="small" />
                          {spot.vehicleModel && (
                            <Typography
                              variant="caption"
                              fontWeight={800}
                              sx={{
                                color: '#F8FAFC',
                                fontSize: 10.5,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%',
                              }}
                            >
                              {spot.vehicleModel}
                            </Typography>
                          )}
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <AccessTimeIcon sx={{ fontSize: 11, color: '#38BDF8' }} />
                            <Typography variant="caption" sx={{ color: '#38BDF8', fontSize: 10, fontWeight: 700 }}>
                              {spot.parkedDuration || (isRtl ? '35 دقيقة' : '35 min')}
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      {/* CASE 2: VACANT (شاغر ومتاح فوراً للركن) */}
                      {isVacant && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'rgba(0, 230, 118, 0.15)',
                              border: '1.5px solid #00E676',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#00E676',
                              boxShadow: '0 0 12px rgba(0, 230, 118, 0.35)',
                            }}
                          >
                            <LocalParkingIcon sx={{ fontSize: 19 }} />
                          </Box>
                          <Typography variant="caption" fontWeight={900} sx={{ color: '#00E676', fontSize: 11 }}>
                            {isRtl ? 'شاغر • جاهز للركن' : 'VACANT • READY'}
                          </Typography>
                        </Box>
                      )}

                      {/* CASE 3: VIP (كبار الشخصيات) */}
                      {isVIP && !spot.currentPlateNumber && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'rgba(168, 85, 247, 0.2)',
                              border: '1.5px solid #A855F7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#A855F7',
                              boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)',
                            }}
                          >
                            <StarIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Typography variant="caption" fontWeight={900} sx={{ color: '#A855F7', fontSize: 10.5 }}>
                            {isRtl ? 'موقف VIP مخصص' : 'VIP RESERVED'}
                          </Typography>
                        </Box>
                      )}

                      {/* CASE 4: DISABLED (أصحاب الهمم) */}
                      {isDisabled && !spot.currentPlateNumber && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'rgba(0, 176, 255, 0.2)',
                              border: '1.5px solid #00B0FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#00B0FF',
                              boxShadow: '0 0 12px rgba(0, 176, 255, 0.4)',
                            }}
                          >
                            <AccessibleIcon sx={{ fontSize: 19 }} />
                          </Box>
                          <Typography variant="caption" fontWeight={900} sx={{ color: '#00B0FF', fontSize: 10.5 }}>
                            {isRtl ? 'مخصص لأصحاب الهمم' : 'ACCESSIBLE BAY'}
                          </Typography>
                        </Box>
                      )}

                      {/* CASE 5: EV CHARGING (شواحن كهربائية) */}
                      {isCharging && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'rgba(0, 240, 255, 0.2)',
                              border: '1.5px solid #00F0FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#00F0FF',
                              boxShadow: '0 0 14px rgba(0, 240, 255, 0.45)',
                            }}
                          >
                            <BoltIcon sx={{ fontSize: 19 }} />
                          </Box>
                          <Typography variant="caption" fontWeight={900} sx={{ color: '#00F0FF', fontSize: 10.5 }}>
                            {isRtl ? 'شاحن فائق 22 kW' : 'EV FAST 22 kW'}
                          </Typography>
                        </Box>
                      )}

                      {/* CASE 6: RESERVED (محجوز) */}
                      {isReserved && !spot.currentPlateNumber && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255, 145, 0, 0.2)',
                              border: '1.5px solid #FF9100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FF9100',
                              boxShadow: '0 0 12px rgba(255, 145, 0, 0.4)',
                            }}
                          >
                            <LockIcon sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography variant="caption" fontWeight={900} sx={{ color: '#FF9100', fontSize: 10.5 }}>
                            {isRtl ? 'محجوز بموعد مسبق' : 'PRE-RESERVED'}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* BOTTOM STATUS FOOTER OF SLOT */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={getSpotLabel(spot.status)}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 10,
                          fontWeight: 900,
                          bgcolor: alpha(spotColor, 0.2),
                          color: spotColor,
                          border: `1.5px solid ${alpha(spotColor, 0.5)}`,
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: 10,
                          fontWeight: 700,
                          maxWidth: '45%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {spot.zone ? spot.zone.split('(')[0] : isRtl ? 'المنطقة A' : 'Zone A'}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Card>
      )}

      {/* SPOT DETAIL & FORENSIC INSPECTION MODAL */}
      <Dialog
        open={Boolean(selectedSpot)}
        onClose={() => setSelectedSpot(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0B1220',
            backgroundImage: 'radial-gradient(ellipse at top, rgba(0, 240, 255, 0.15), transparent 70%)',
            border: '1.5px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '20px',
            p: 1,
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            fontSize: 18,
            color: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LocalParkingIcon sx={{ color: '#00F0FF' }} />
            <span>
              {isRtl ? `تفاصيل الموقف: ${selectedSpot?.spotNumber}` : `Spot Details: ${selectedSpot?.spotNumber}`}
            </span>
          </Stack>
          <IconButton size="small" onClick={() => setSelectedSpot(null)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {selectedSpot && (
            <Stack spacing={2.5}>
              {/* Status Header */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  {isRtl ? 'الحالة التشغيلية اللحظية للموقف:' : 'Real-Time Operational State:'}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getSpotColor(selectedSpot.status),
                      boxShadow: `0 0 12px ${getSpotColor(selectedSpot.status)}`,
                    }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ color: getSpotColor(selectedSpot.status) }}
                  >
                    {getSpotLabel(selectedSpot.status)}
                  </Typography>
                </Stack>
              </Box>

              {/* Vehicle Dossier if Occupied */}
              {selectedSpot.currentPlateNumber ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: 'rgba(15, 23, 42, 0.88)',
                    border: '1.5px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 800 }}>
                    {isRtl ? 'المركبة المتواجدة حالياً (LPR Matched):' : 'Parked Vehicle (LPR Matched):'}
                  </Typography>

                  <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                    <SaudiRealisticPlate
                      plateNumber={selectedSpot.currentPlateNumber}
                      size="md"
                      showBolts={true}
                    />
                  </Box>

                  {selectedSpot.vehicleModel && (
                    <Stack
                      spacing={0.75}
                      sx={{ mb: 1.5, p: 1.25, borderRadius: '10px', bgcolor: 'rgba(255, 255, 255, 0.04)' }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          {isRtl ? 'طراز المركبة:' : 'Vehicle Model:'}
                        </Typography>
                        <Typography variant="caption" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                          {selectedSpot.vehicleModel}
                        </Typography>
                      </Stack>
                      {selectedSpot.vehicleColor && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            {isRtl ? 'لون الهيكل الخارجي:' : 'Exterior Color:'}
                          </Typography>
                          <Typography variant="caption" fontWeight={800} sx={{ color: '#38BDF8' }}>
                            {selectedSpot.vehicleColor}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      {isRtl
                        ? `مدة الوقوف: ${selectedSpot.parkedDuration || '45 دقيقة'}`
                        : `Parked Duration: ${selectedSpot.parkedDuration || '45 min'}`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 900, fontSize: 12 }}>
                      {isRtl ? 'الرسوم المستحقة: 15.00 ريال' : 'Accrued Fee: 15.00 SAR'}
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(0, 230, 118, 0.08)',
                    border: '1px solid rgba(0, 230, 118, 0.35)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 800 }}>
                    {isRtl
                      ? 'الموقف شاغر وجاهز للاستخدام الفوري أو الحجز المسبق.'
                      : 'Bay is currently vacant and ready for immediate parking or reservation.'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {isRtl
                      ? 'التعرفة: 5.00 ريال / الساعة • فترة السماح: 15 دقيقة مجانية'
                      : 'Tariff: 5.00 SAR / hour • Grace period: 15 minutes free'}
                  </Typography>
                </Box>
              )}

              {/* Zone and Wayfinding Distances */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  {isRtl ? 'المنطقة ونقاط الوصول القريبة:' : 'Zone & Nearby Wayfinding Access Points:'}
                </Typography>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#38BDF8', mt: 0.25, mb: 1 }}>
                  {selectedSpot.zone || (isRtl ? 'المنطقة الشرقية (Zone East)' : 'East Sector (Zone East)')}
                </Typography>
                <Stack spacing={0.7} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    • {isRtl ? 'المصعد المركزي والردهة: 15 متراً (ممر A-1)' : 'Central Elevator & Lobby: 15 meters'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    • {isRtl ? 'محطة السداد الذاتي الذكية: 22 متراً' : 'Smart Payment Kiosk: 22 meters'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    • {isRtl ? 'مخرج الطوارئ ومسار الإخلاء السريع: 30 متراً' : 'Emergency Exit & Evacuation: 30 meters'}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedSpot(null)} sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {isRtl ? 'إغلاق' : 'Close'}
          </Button>
          {selectedSpot?.status === 'Vacant' && (
            <Button
              variant="contained"
              onClick={handleBookSpot}
              sx={{
                background: 'linear-gradient(135deg, #00E676, #00F0FF)',
                color: '#080D1A',
                fontWeight: 900,
                borderRadius: '10px',
                px: 3,
                boxShadow: '0 4px 16px rgba(0, 230, 118, 0.35)',
                '&:hover': {
                  bgcolor: '#00E676',
                },
              }}
            >
              {isRtl ? 'تأكيد الحجز الفوري لهذا الموقف' : 'Confirm Instant Reservation'}
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
          sx={{ fontWeight: 800, bgcolor: '#00E676', color: '#000' }}
        >
          {isRtl
            ? 'تم حجز الموقف بنجاح وجرى إصدار تصريح الدخول الرقمي!'
            : 'Parking spot reserved successfully and digital pass issued!'}
        </Alert>
      </Snackbar>
    </Box>
  );
}
