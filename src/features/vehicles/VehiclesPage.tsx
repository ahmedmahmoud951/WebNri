import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { smartParkingApi, type VehicleDto } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function VehiclesPage() {
  const theme = useTheme();
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [plateNumber, setPlateNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await smartParkingApi.getVehicles();
      if (data && data.length > 0) {
        setVehicles(data);
      } else {
        setVehicles([
          { id: '1', plateNumber: 'أ ب ج 1004', make: 'Toyota', model: 'Land Cruiser', color: 'White', status: 'Parked', subscriptionPlan: 'VIP Resident', lastSeenAt: 'اليوم 18:15' },
          { id: '2', plateNumber: 'د هـ و 2045', make: 'BMW', model: 'X5', color: 'Black', status: 'Active', subscriptionPlan: 'Monthly Standard', lastSeenAt: 'أمس 21:30' },
          { id: '3', plateNumber: 'س ص ع 9999', make: 'Mercedes', model: 'S-Class', color: 'Silver', status: 'Parked', subscriptionPlan: 'Premium VIP', lastSeenAt: 'اليوم 17:40' },
        ]);
      }
    } catch {
      setVehicles([
        { id: '1', plateNumber: 'أ ب ج 1004', make: 'Toyota', model: 'Land Cruiser', color: 'White', status: 'Parked', subscriptionPlan: 'VIP Resident', lastSeenAt: 'اليوم 18:15' },
        { id: '2', plateNumber: 'د هـ و 2045', make: 'BMW', model: 'X5', color: 'Black', status: 'Active', subscriptionPlan: 'Monthly Standard', lastSeenAt: 'أمس 21:30' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!plateNumber.trim() || !make.trim()) {
      setError('يرجى إدخال رقم اللوحة ونوع المركبة.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await smartParkingApi.addVehicle({
        plateNumber: plateNumber.trim(),
        make: make.trim(),
        model: model.trim(),
        color: color.trim() || 'White',
        status: 'Active',
      });
      setOpenModal(false);
      setPlateNumber('');
      setMake('');
      setModel('');
      setColor('');
      await loadVehicles();
    } catch (err: any) {
      setError(err?.message || 'فشل إضافة المركبة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await smartParkingApi.deleteVehicle(id);
      await loadVehicles();
    } catch {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            مركباتي المسجلة (My Vehicles)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة المركبات المرتبطة بحسابك وتفعيل الدخول التلقائي الذكي عبر قارئات LPR
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ fontWeight: 800, px: 3 }}
        >
          إضافة مركبة جديدة
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 250 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {vehicles.map((v) => (
            <Grid item xs={12} sm={6} md={4} key={v.id}>
              <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <DirectionsCarIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleDelete(v.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    رقم اللوحة المرصودة
                  </Typography>
                  <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: 1.5, my: 0.5 }}>
                    {v.plateNumber}
                  </Typography>

                  <Typography variant="body1" fontWeight={700} color="text.primary">
                    {v.make} {v.model}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    اللون: {v.color || 'غير محدد'}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      icon={<VerifiedIcon />}
                      label={v.subscriptionPlan || 'اشتراك قياسي'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={v.status || 'Active'}
                      size="small"
                      color={v.status === 'Parked' ? 'secondary' : 'success'}
                    />
                  </Stack>

                  <Box sx={{ pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        آخر تواجد: {v.lastSeenAt || 'غير متوفر'}
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Vehicle Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>إضافة مركبة جديدة للنظام</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="رقم اللوحة (License Plate)"
              placeholder="مثال: أ ب ج 1004"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="الشركة المصنعة (Make)"
              placeholder="Toyota, BMW, Mercedes..."
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="الموديل (Model)"
              placeholder="Camry, X5, Land Cruiser..."
              value={model}
              onChange={(e) => setModel(e.target.value)}
              fullWidth
            />
            <TextField
              label="اللون (Color)"
              placeholder="أبيض, أسود, فضي..."
              value={color}
              onChange={(e) => setColor(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddVehicle}
            disabled={submitting}
          >
            {submitting ? 'جاري الحفظ...' : 'إضافة وتأكيد'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
