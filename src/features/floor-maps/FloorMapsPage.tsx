import { useState, useEffect } from 'react';
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
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
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

import { smartParkingApi, type BuildingItem, type FloorItem, type FloorMapSpot } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function FloorMapsPage() {
  const theme = useTheme();

  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [floors, setFloors] = useState<FloorItem[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [spots, setSpots] = useState<FloorMapSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<FloorMapSpot | null>(null);

  // Load buildings
  useEffect(() => {
    smartParkingApi.getBuildings().then((bList) => {
      if (bList && bList.length > 0) {
        setBuildings(bList);
        setSelectedBuildingId(bList[0].id);
      } else {
        // Fallback demo buildings
        const mockB: BuildingItem[] = [
          { id: '11111111-1111-1111-1111-000000000001', name: 'المبنى الرئيسي (Building A)', code: 'BLD-A', totalCapacity: 200, floorsCount: 2 },
          { id: '11111111-1111-1111-1111-000000000002', name: 'المبنى التجاري (Building B)', code: 'BLD-B', totalCapacity: 150, floorsCount: 2 },
          { id: '11111111-1111-1111-1111-000000000003', name: 'مبنى كبار الشخصيات (Building C)', code: 'BLD-C', totalCapacity: 150, floorsCount: 2 },
        ];
        setBuildings(mockB);
        setSelectedBuildingId(mockB[0].id);
      }
    }).catch(() => {
      const mockB: BuildingItem[] = [
        { id: 'b1', name: 'المبنى الرئيسي (Building A)', code: 'BLD-A', totalCapacity: 200, floorsCount: 2 },
        { id: 'b2', name: 'المبنى التجاري (Building B)', code: 'BLD-B', totalCapacity: 150, floorsCount: 2 },
      ];
      setBuildings(mockB);
      setSelectedBuildingId(mockB[0].id);
    });
  }, []);

  // Load floors when building changes
  useEffect(() => {
    if (!selectedBuildingId) return;
    smartParkingApi.getBuildingFloors(selectedBuildingId).then((fList) => {
      if (fList && fList.length > 0) {
        setFloors(fList);
        setSelectedFloorId(fList[0].id);
      } else {
        const mockF: FloorItem[] = [
          { id: '33333333-3333-3333-2221-000000000001', name: 'الدور الأرضي (Ground Floor)', floorNumber: 1, capacity: 50, buildingId: selectedBuildingId },
          { id: '33333333-3333-3333-2221-000000000002', name: 'الدور الأول (First Floor)', floorNumber: 2, capacity: 50, buildingId: selectedBuildingId },
        ];
        setFloors(mockF);
        setSelectedFloorId(mockF[0].id);
      }
    }).catch(() => {
      const mockF: FloorItem[] = [
        { id: 'f1', name: 'الدور الأرضي (Ground Floor)', floorNumber: 1, capacity: 50, buildingId: selectedBuildingId },
      ];
      setFloors(mockF);
      setSelectedFloorId(mockF[0].id);
    });
  }, [selectedBuildingId]);

  // Load map spots when floor changes
  useEffect(() => {
    if (!selectedFloorId) return;
    setLoading(true);
    smartParkingApi.getFloorMap(selectedFloorId).then((mapData) => {
      if (mapData?.spots && mapData.spots.length > 0) {
        setSpots(mapData.spots);
      } else {
        generateDemoSpots();
      }
    }).catch(() => {
      generateDemoSpots();
    }).finally(() => {
      setLoading(false);
    });
  }, [selectedFloorId]);

  const generateDemoSpots = () => {
    const list: FloorMapSpot[] = [];
    const statuses: Array<FloorMapSpot['status']> = ['Vacant', 'Occupied', 'Reserved', 'VIP', 'Charging', 'Disabled'];
    for (let i = 1; i <= 48; i++) {
      let status: FloorMapSpot['status'] = 'Vacant';
      if (i % 6 === 0) status = 'Occupied';
      else if (i % 9 === 0) status = 'Reserved';
      else if (i <= 4) status = 'VIP';
      else if (i >= 5 && i <= 8) status = 'Charging';
      else if (i >= 9 && i <= 10) status = 'Disabled';

      list.push({
        id: `spot-${i}`,
        spotNumber: `A-${100 + i}`,
        label: `Spot A-${100 + i}`,
        status,
        currentPlateNumber: status === 'Occupied' ? `س ص ع ${1000 + i}` : undefined,
        zone: i <= 24 ? 'Zone East' : 'Zone West',
      });
    }
    setSpots(list);
  };

  const getSpotColor = (status: FloorMapSpot['status']) => {
    switch (status) {
      case 'Vacant':
        return theme.palette.success.main;
      case 'Occupied':
        return theme.palette.error.main;
      case 'Reserved':
        return theme.palette.secondary.main;
      case 'VIP':
        return '#A78BFA';
      case 'Charging':
        return '#2DD4BF';
      case 'Disabled':
        return '#60A5FA';
      default:
        return theme.palette.text.secondary;
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
        return null;
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            خريطة الأدوار والمواقف التفاعلية (Interactive Floor Map)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            استعراض حالة الأماكن لحظياً، الشواحن الكهربائية، مواقف ذوي الإعاقة، وكبار الشخصيات
          </Typography>
        </Box>

        {/* Building & Floor Selectors */}
        <Stack direction="row" spacing={2} sx={{ minWidth: 320 }}>
          <TextField
            select
            size="small"
            label="المبنى (Building)"
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <ApartmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
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
            InputProps={{
              startAdornment: <LayersIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />,
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

      {/* Legend Bar */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap justifyContent="center">
          <Chip
            icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main }} />}
            label="متاح (Available)"
            variant="outlined"
          />
          <Chip
            icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.error.main }} />}
            label="مشغول (Occupied)"
            variant="outlined"
          />
          <Chip
            icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.secondary.main }} />}
            label="محجوز (Reserved)"
            variant="outlined"
          />
          <Chip
            icon={<EvStationIcon sx={{ fontSize: 16, color: '#2DD4BF' }} />}
            label="شاحن كهربائي (EV Charging)"
            variant="outlined"
          />
          <Chip
            icon={<StarIcon sx={{ fontSize: 16, color: '#A78BFA' }} />}
            label="كبار الشخصيات (VIP)"
            variant="outlined"
          />
          <Chip
            icon={<AccessibleIcon sx={{ fontSize: 16, color: '#60A5FA' }} />}
            label="أصحاب الهمم (Disabled)"
            variant="outlined"
          />
        </Stack>
      </Card>

      {/* Interactive Grid of Spots */}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            تخطيط المواقف — {floors.find((f) => f.id === selectedFloorId)?.name || 'الدور المختار'}
          </Typography>

          <Grid container spacing={1.5}>
            {spots.map((spot) => {
              const spotColor = getSpotColor(spot.status);
              const isOccupied = spot.status === 'Occupied';
              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={spot.id}>
                  <Box
                    onClick={() => setSelectedSpot(spot)}
                    sx={{
                      p: 1.75,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: `1.5px solid ${alpha(spotColor, 0.45)}`,
                      bgcolor: alpha(spotColor, isOccupied ? 0.15 : 0.06),
                      transition: 'all 200ms ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 8px 24px ${alpha(spotColor, 0.3)}`,
                        borderColor: spotColor,
                      },
                      minHeight: 90,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
                        {spot.spotNumber}
                      </Typography>
                      {getSpotIcon(spot.status)}
                    </Stack>

                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={spot.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          bgcolor: alpha(spotColor, 0.25),
                          color: spotColor,
                          border: `1px solid ${alpha(spotColor, 0.4)}`,
                        }}
                      />
                      {spot.currentPlateNumber && (
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', mt: 0.5, fontWeight: 700, color: theme.palette.text.primary }}
                        >
                          {spot.currentPlateNumber}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Card>
      )}

      {/* Spot Detail Dialog */}
      <Dialog
        open={Boolean(selectedSpot)}
        onClose={() => setSelectedSpot(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          تفاصيل الموقف: {selectedSpot?.spotNumber}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSpot && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">حالة الموقف الحالية:</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: getSpotColor(selectedSpot.status) }}>
                  {selectedSpot.status}
                </Typography>
              </Box>

              {selectedSpot.currentPlateNumber ? (
                <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <Typography variant="caption" color="text.secondary">المركبة المتواجدة:</Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: 1 }}>
                    {selectedSpot.currentPlateNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    وقت الوقوف: منذ 42 دقيقة • الرسوم المحتسبة: 15 SAR
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  الموقف شاغر وجاهز للاستخدام أو الحجز الفوري.
                </Typography>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">المنطقة:</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {selectedSpot.zone || 'Zone Central'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">المرافق القريبة:</Typography>
                <Typography variant="body2">
                  المصعد الرئيسي (15 متر) • مخرج الطوارئ (25 متر)
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSpot(null)}>إغلاق</Button>
          {selectedSpot?.status === 'Vacant' && (
            <Button variant="contained" color="primary">
              حجز هذا المكان الآن
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
