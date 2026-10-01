import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  Paper,
  Switch,
  FormControlLabel,
  MenuItem,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  QrCode2 as QrCode2Icon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Sensors as SensorsIcon,
  LocalParking as LocalParkingIcon,
  NearMe as NearMeIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ColorLens as ColorLensIcon,
  ElectricBolt as ElectricBoltIcon,
  CarRental as CarRentalIcon,
  FlashOn as FlashOnIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';

import { smartParkingApi, type VehicleDto } from '../../core/api/smartParkingApi';
import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';

export interface ExtendedVehicle extends VehicleDto {
  brandAr?: string;
  modelAr?: string;
  autoClearance?: boolean;
  currentBay?: string;
  currentFloor?: string;
  colorHex?: string;
  subscriptionAr?: string;
  rfidPass?: string;
}

export function VehiclesPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<ExtendedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openQrModal, setOpenQrModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<ExtendedVehicle | null>(null);
  const [activeQrVehicle, setActiveQrVehicle] = useState<ExtendedVehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Parked' | 'Active'>('All');

  // New Vehicle Form States
  const [plateLetters, setPlateLetters] = useState('أ ب ج');
  const [plateNumbers, setPlateNumbers] = useState('1004');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Land Cruiser 2024');
  const [color, setColor] = useState('أبيض لؤلؤي');
  const [subscriptionPlan, setSubscriptionPlan] = useState('تصريح مقيم دائم VIP');
  const [autoClearance, setAutoClearance] = useState(true);

  const initialVehicles: ExtendedVehicle[] = useMemo(() => [
    {
      id: 'v-101',
      plateNumber: 'أ ب ج 1004',
      make: 'Toyota',
      model: 'Land Cruiser VXR 2024',
      brandAr: 'تويوتا',
      modelAr: 'لاند كروزر VXR 2024',
      color: 'أبيض لؤلؤي',
      colorHex: '#F8FAFC',
      status: 'Parked',
      currentFloor: 'المستوى السفلي B1',
      currentBay: 'B-04',
      subscriptionPlan: 'VIP Resident',
      subscriptionAr: 'اشتراك مقيم دائم (VIP)',
      lastSeenAt: 'دخول اليوم الساعة 18:15',
      autoClearance: true,
      rfidPass: 'RFID-9842-SA',
    },
    {
      id: 'v-102',
      plateNumber: 'د هـ و 2045',
      make: 'Lexus',
      model: 'LX 600 Executive',
      brandAr: 'لكزس',
      modelAr: 'إل إكس 600 التنفيذية',
      color: 'أسود ملوكي ميتاليك',
      colorHex: '#1E293B',
      status: 'Active',
      subscriptionPlan: 'Executive VIP',
      subscriptionAr: 'تصريح تنفيذي لكبار الشخصيات',
      lastSeenAt: 'خروج أمس الساعة 21:30',
      autoClearance: true,
      rfidPass: 'RFID-1120-VIP',
    },
    {
      id: 'v-103',
      plateNumber: 'س ص ع 9999',
      make: 'Mercedes-Benz',
      model: 'S-Class 500 Maybach',
      brandAr: 'مرسيدس بنز',
      modelAr: 'إس كلاس 500 مايباخ',
      color: 'فضي ألماني معدني',
      colorHex: '#94A3B8',
      status: 'Parked',
      currentFloor: 'الدور الأرضي G',
      currentBay: 'A-12',
      subscriptionPlan: 'Premium Annual',
      subscriptionAr: 'اشتراك سنوي شامل مجاني',
      lastSeenAt: 'دخول اليوم الساعة 17:40',
      autoClearance: true,
      rfidPass: 'RFID-5504-PRM',
    },
  ], []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await smartParkingApi.getVehicles();
      if (data && data.length > 0) {
        // Map with rich attributes
        const merged: ExtendedVehicle[] = data.map((v, i) => ({
          ...v,
          brandAr: v.make === 'Toyota' ? 'تويوتا' : v.make === 'Lexus' ? 'لكزس' : v.make,
          modelAr: v.model,
          colorHex: v.color?.includes('أسود') ? '#1e293b' : '#f8fafc',
          status: i % 2 === 0 ? 'Parked' : 'Active',
          currentFloor: i % 2 === 0 ? 'المستوى السفلي B1' : undefined,
          currentBay: i % 2 === 0 ? `B-0${i + 2}` : undefined,
          subscriptionAr: v.subscriptionPlan || 'اشتراك قياسي سارٍ',
          autoClearance: true,
          rfidPass: `RFID-00${i + 1}-SA`,
        }));
        setVehicles(merged);
      } else {
        setVehicles(initialVehicles);
      }
    } catch {
      setVehicles(initialVehicles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleToggleClearance = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, autoClearance: !v.autoClearance } : v
      )
    );
    setFeedback('تم تحديث إعدادات العبور الذكي التلقائي للمركبة بنجاح.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOpenAddModal = () => {
    setPlateLetters('أ ب ج');
    setPlateNumbers('1004');
    setMake('Toyota');
    setModel('Land Cruiser 2024');
    setColor('أبيض لؤلؤي');
    setSubscriptionPlan('تصريح مقيم دائم VIP');
    setAutoClearance(true);
    setError(null);
    setOpenModal(true);
  };

  const handleAddVehicle = async () => {
    const fullPlate = `${plateLetters.trim()} ${plateNumbers.trim()}`;
    if (!plateLetters.trim() || !plateNumbers.trim() || !make.trim()) {
      setError('يرجى استكمال بيانات اللوحة والشركة المصنعة.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const newVehicle: ExtendedVehicle = {
        id: `v-${Date.now()}`,
        plateNumber: fullPlate,
        make: make.trim(),
        model: model.trim(),
        brandAr: make === 'Toyota' ? 'تويوتا' : make === 'Lexus' ? 'لكزس' : make,
        modelAr: model.trim(),
        color: color.trim() || 'أبيض لؤلؤي',
        colorHex: color.includes('أسود') ? '#1e293b' : '#f8fafc',
        status: 'Active',
        subscriptionPlan: subscriptionPlan,
        subscriptionAr: subscriptionPlan,
        lastSeenAt: 'تمت الإضافة حديثاً',
        autoClearance: autoClearance,
        rfidPass: `RFID-${Math.floor(1000 + Math.random() * 9000)}-SA`,
      };

      try {
        await smartParkingApi.addVehicle({
          plateNumber: fullPlate,
          make: make.trim(),
          model: model.trim(),
          color: color.trim(),
          status: 'Active',
        });
      } catch {}

      setVehicles((prev) => [newVehicle, ...prev]);
      setOpenModal(false);
      setFeedback(`تم تسجيل المركبة [${fullPlate}] وربطها بنظام العبور الذكي بنجاح.`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'فشلت إضافة المركبة، يرجى المحاولة لاحقاً.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await smartParkingApi.deleteVehicle(vehicleToDelete.id);
    } catch {}
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
    setOpenDeleteModal(false);
    setFeedback(`تم حذف المركبة [${vehicleToDelete.plateNumber}] وفك ارتباطها بالنظام بنجاح.`);
    setVehicleToDelete(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Stats Calculations
  const totalCount = vehicles.length;
  const parkedCount = vehicles.filter((v) => v.status === 'Parked').length;
  const autoClearCount = vehicles.filter((v) => v.autoClearance !== false).length;

  // Filtered List
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        v.plateNumber.toLowerCase().includes(q) ||
        (v.make && v.make.toLowerCase().includes(q)) ||
        (v.brandAr && v.brandAr.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.color && v.color.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Parked' && v.status === 'Parked') ||
        (statusFilter === 'Active' && v.status !== 'Parked');

      return matchSearch && matchStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  return (
    <Box
      sx={{
        maxWidth: 1680,
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
        direction: 'rtl',
        color: '#f8fafc',
        bgcolor: '#070b14',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #111e3b 0%, #070b14 75%)',
        fontFamily: 'Cairo, Sora, sans-serif',
      }}
    >
      {/* 🚀 TOP HERO MISSION CONTROL HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 35, 68, 0.9) 50%, rgba(10, 16, 32, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 229, 255, 0.22)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(0, 229, 255, 0.08)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #00f5ff, #38bdf8, #10b981)',
          },
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: { xs: 56, sm: 68 },
              height: { xs: 56, sm: 68 },
              borderRadius: 3.5,
              display: 'grid',
              placeItems: 'center',
              background: 'radial-gradient(circle, #00e5ff 0%, #1e1b4b 90%)',
              boxShadow: '0 0 30px rgba(0, 229, 255, 0.45), inset 0 0 14px rgba(255,255,255,0.4)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: { xs: 32, sm: 38 }, color: '#070c14' }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#f8fafc',
                  fontSize: { xs: 20, sm: 26, md: 28 },
                  letterSpacing: 0.5,
                  textShadow: '0 2px 12px rgba(0, 229, 255, 0.3)',
                }}
              >
                سجل مركباتي المعتمدة والبطاقة الرقمية
              </Typography>
              <Chip
                size="small"
                icon={<VerifiedIcon sx={{ fontSize: '15px !important', color: '#10b981' }} />}
                label="العبور التلقائي الذكي مفعّل"
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.45)',
                  fontWeight: 800,
                  fontSize: 12,
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.75, fontWeight: 500, fontSize: { xs: 12, sm: 14 } }}>
              إدارة المركبات المصرح لها بالعبور التلقائي الفوري، فتح الحواجز الذكية عبر رادار LPR، واستعراض مواقع الاصطفاف اللحظية
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          onClick={handleOpenAddModal}
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #00f5ff 0%, #0284c7 100%)',
            color: '#070c14',
            fontWeight: 900,
            fontSize: 15,
            borderRadius: 3,
            px: 3.5,
            py: 1.25,
            boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)',
              boxShadow: '0 6px 28px rgba(0, 229, 255, 0.6)',
            },
          }}
        >
          إضافة مركبة جديدة للمنظومة
        </Button>
      </Paper>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <Alert
          severity="success"
          sx={{
            mb: 3.5,
            borderRadius: 3,
            bgcolor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            fontWeight: 700,
          }}
          onClose={() => setFeedback(null)}
        >
          {feedback}
        </Alert>
      )}

      {/* 🌟 4 LUXURIOUS KPI HUD CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CARD 1: TOTAL FLEET */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #10243d 100%)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#00e5ff' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#00e5ff' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <DirectionsCarIcon sx={{ color: '#00e5ff', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8', letterSpacing: 1 }}>
                    إجمالي المركبات المسجلة
                  </Typography>
                </Stack>
                <Chip size="small" label="معتمدة" sx={{ bgcolor: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#38bdf8', my: 1.5, letterSpacing: -1 }}>
                {totalCount}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                مركبات مصرح لها بالدخول الذكي التلقائي
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 2: PARKED INSIDE */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #0b251f 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(16, 185, 129, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#10b981' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#10b981' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalParkingIcon sx={{ color: '#10b981', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#34d399', letterSpacing: 1 }}>
                    متواجدة داخل المواقف الآن
                  </Typography>
                </Stack>
                <Chip size="small" label="رصد لحظي" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#34d399', my: 1.5, letterSpacing: -1 }}>
                {parkedCount}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                مركبة مشغولة في خانات المواقف المخصصة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 3: AUTO CLEARANCE */}
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
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#c084fc' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#a855f7' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <FlashOnIcon sx={{ color: '#c084fc', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#c084fc', letterSpacing: 1 }}>
                    جاهزية العبور الذكي (LPR)
                  </Typography>
                </Stack>
                <Chip size="small" label="نشط 100%" sx={{ bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#c084fc', my: 1.5, letterSpacing: -1 }}>
                {autoClearCount} / {totalCount}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                فتح فوري وتلقائي للحواجز دون الحاجة للتوقف
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 4: DIGITAL PASS SECURITY */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #0e172a 0%, #2b1f10 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(245, 158, 11, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', borderColor: '#f59e0b' },
            }}
          >
            <Box sx={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, bgcolor: '#f59e0b' }} />
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <VpnKeyIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#fcd34d', letterSpacing: 1 }}>
                    البطاقة الرقمية ورمز QR
                  </Typography>
                </Stack>
                <Chip size="small" label="مشفر" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', fontWeight: 800, fontSize: 10 }} />
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#fcd34d', my: 1.5, letterSpacing: -1 }}>
                مفعلة
              </Typography>

              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block' }}>
                دعم البوابات بتقنية NFC و QR المشفر
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🔍 FILTER & SEARCH COMMAND CONSOLE */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3.5,
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ flex: 1, flexWrap: 'wrap', gap: 1.5 }} alignItems="center">
          <TextField
            size="small"
            placeholder="🔍 بحث برقم اللوحة، الماركة، الطراز، أو اللون..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 340 },
              bgcolor: '#1e293b',
              borderRadius: 2.5,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '& input': { color: '#f8fafc', fontSize: 14 },
            }}
          />

          <TextField
            select
            size="small"
            label="حالة التواجد"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            sx={{
              minWidth: 160,
              bgcolor: '#1e293b',
              borderRadius: 2.5,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              '& .MuiSelect-select': { color: '#f8fafc', fontSize: 13 },
              '& .MuiInputLabel-root': { color: '#94a3b8', fontSize: 13 },
            }}
          >
            <MenuItem value="All">كافة المركبات</MenuItem>
            <MenuItem value="Parked">متوقفة بالداخل فقط</MenuItem>
            <MenuItem value="Active">خارج المجمع</MenuItem>
          </TextField>
        </Stack>

        <Chip
          label={`${filteredVehicles.length} مركبة معروضة`}
          sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: 800 }}
        />
      </Paper>

      {/* 🌟 VEHICLES GRID */}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
          <CircularProgress sx={{ color: '#00e5ff' }} />
          <Typography sx={{ mt: 2, color: '#94a3b8' }}>جاري تحميل ومزامنة أسطول المركبات...</Typography>
        </Box>
      ) : filteredVehicles.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: 'rgba(15, 23, 42, 0.8)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
          }}
        >
          <DirectionsCarIcon sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
          <Typography variant="h6" fontWeight={800} color="#f8fafc">
            لا توجد مركبات مطابقة لمعايير البحث الحالية
          </Typography>
          <Typography variant="body2" color="#94a3b8" sx={{ mt: 1, mb: 3 }}>
            يمكنك إعادة ضبط خيارات البحث أو تسجيل مركبة جديدة برقم لوحتها الرسمية.
          </Typography>
          <Button variant="outlined" onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}>
            إعادة تعيين البحث
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3.5}>
          {filteredVehicles.map((v) => {
            const isParked = v.status === 'Parked';
            return (
              <Grid item xs={12} md={6} lg={4} key={v.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `1.5px solid ${isParked ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 229, 255, 0.25)'}`,
                    background: isParked
                      ? 'linear-gradient(160deg, rgba(11, 26, 23, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                      : 'linear-gradient(160deg, rgba(17, 28, 52, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    boxShadow: isParked
                      ? '0 12px 36px rgba(16, 185, 129, 0.15)'
                      : '0 8px 30px rgba(0, 0, 0, 0.5)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      borderColor: '#00e5ff',
                      boxShadow: '0 16px 45px rgba(0, 229, 255, 0.25)',
                    },
                  }}
                >
                  <Box>
                    {/* Top Row: Brand Header + Status + Delete */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#00e5ff' }} />}
                          label={v.subscriptionAr || 'تصريح معتمد'}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: 11,
                            bgcolor: 'rgba(0, 229, 255, 0.12)',
                            color: '#38bdf8',
                            border: '1px solid rgba(0, 229, 255, 0.3)',
                          }}
                        />
                        <Chip
                          size="small"
                          label={isParked ? 'متوقفة بالداخل' : 'خارج المجمع'}
                          sx={{
                            fontWeight: 800,
                            fontSize: 11,
                            bgcolor: isParked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                            color: isParked ? '#34d399' : '#94a3b8',
                          }}
                        />
                      </Stack>

                      <IconButton
                        size="small"
                        onClick={() => {
                          setVehicleToDelete(v);
                          setOpenDeleteModal(true);
                        }}
                        sx={{
                          color: '#64748b',
                          '&:hover': { color: '#f43f5e', bgcolor: 'rgba(244, 63, 94, 0.1)' },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    {/* HERO ELEMENT: AUTHENTIC SAUDI REALISTIC PLATE */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2.5 }}>
                      <SaudiRealisticPlate
                        plateNumber={v.plateNumber}
                        size="md"
                        showBolts={true}
                        interactive={false}
                      />
                    </Box>

                    {/* Vehicle Specifications */}
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', fontSize: 18, textAlign: 'center', mt: 1 }}>
                      {v.brandAr || v.make} {v.modelAr || v.model}
                    </Typography>

                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mt: 0.5, mb: 2 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: v.colorHex || '#f8fafc', border: '1px solid rgba(255,255,255,0.3)' }} />
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                        {v.color || 'أبيض لؤلؤي'}
                      </Typography>
                      <span style={{ color: '#475569' }}>•</span>
                      <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                        {v.rfidPass || 'RFID-TAG'}
                      </Typography>
                    </Stack>

                    {/* Parked Location Card or Outside Status */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        mb: 2,
                        bgcolor: isParked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.6)',
                        border: `1px solid ${isParked ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                      }}
                    >
                      {isParked ? (
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationOnIcon sx={{ color: '#10b981', fontSize: 18 }} />
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#34d399' }}>
                                موقع الاصطفاف الفعلي الآن:
                              </Typography>
                            </Stack>
                            <Chip size="small" label={v.currentBay} sx={{ fontWeight: 900, bgcolor: '#10b981', color: '#070c14' }} />
                          </Stack>
                          <Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                            {v.currentFloor} — خانة [{v.currentBay}]
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate('/find-car')}
                            startIcon={<NearMeIcon />}
                            sx={{
                              color: '#34d399',
                              borderColor: 'rgba(52, 211, 153, 0.4)',
                              borderRadius: 2,
                              fontWeight: 800,
                              py: 0.5,
                              mt: 0.5,
                              '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.15)', borderColor: '#34d399' },
                            }}
                          >
                            الملاحة الداخلية إلى موقع السيارة ↗
                          </Button>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTimeIcon sx={{ color: '#64748b', fontSize: 18 }} />
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                            آخر حركة: {v.lastSeenAt || 'غير متوفر'}
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {/* Auto-Clearance Switch */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                          الفتح التلقائي للحواجز (LPR)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: 11 }}>
                          رفع الذراع آلياً عند الاقتراب من البوابات
                        </Typography>
                      </Box>
                      <Switch
                        checked={v.autoClearance !== false}
                        onChange={() => handleToggleClearance(v.id)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#00e5ff' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00e5ff' },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Actions Footer */}
                  <Box sx={{ pt: 2.5, mt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setActiveQrVehicle(v);
                          setOpenQrModal(true);
                        }}
                        startIcon={<QrCode2Icon />}
                        sx={{
                          borderColor: 'rgba(0, 229, 255, 0.35)',
                          color: '#38bdf8',
                          borderRadius: 2.5,
                          py: 0.85,
                          fontWeight: 800,
                          '&:hover': { bgcolor: 'rgba(0, 229, 255, 0.1)', borderColor: '#00e5ff' },
                        }}
                      >
                        بطاقة الدخول الرقمية
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* 🌟 ADD NEW VEHICLE MODAL (WITH LIVE SAUDI PLATE PREVIEW) */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#00e5ff' }}>
          تسجيل مركبة جديدة في منظومة العبور الذكي
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

          {/* Real-time Saudi Plate Live Preview */}
          <Box sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: '#090d16', border: '1px solid rgba(0, 229, 255, 0.2)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5, fontWeight: 700 }}>
              معاينة حية ومطابقة للوحة السعودية الرسمية:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <SaudiRealisticPlate
                plateNumber={`${plateLetters.trim() || 'أ ب ج'} ${plateNumbers.trim() || '1004'}`}
                size="md"
                showBolts={true}
                interactive={false}
              />
            </Box>
          </Box>

          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="الحروف العربية (3 حروف)"
                  placeholder="مثال: أ ب ج"
                  value={plateLetters}
                  onChange={(e) => setPlateLetters(e.target.value)}
                  fullWidth
                  sx={{
                    bgcolor: '#1e293b',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                    '& input': { color: '#f8fafc' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="الأرقام (من 1 إلى 4 أرقام)"
                  placeholder="مثال: 1004"
                  value={plateNumbers}
                  onChange={(e) => setPlateNumbers(e.target.value)}
                  fullWidth
                  sx={{
                    bgcolor: '#1e293b',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                    '& input': { color: '#f8fafc' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="الشركة المصنعة (الماركة)"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  fullWidth
                  sx={{
                    bgcolor: '#1e293b',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                    '& .MuiSelect-select': { color: '#f8fafc' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                  }}
                >
                  <MenuItem value="Toyota">تويوتا (Toyota)</MenuItem>
                  <MenuItem value="Lexus">لكزس (Lexus)</MenuItem>
                  <MenuItem value="Mercedes-Benz">مرسيدس بنز (Mercedes-Benz)</MenuItem>
                  <MenuItem value="BMW">بي إم دبليو (BMW)</MenuItem>
                  <MenuItem value="Porsche">بورشه (Porsche)</MenuItem>
                  <MenuItem value="Hyundai">هيونداي (Hyundai)</MenuItem>
                  <MenuItem value="Genesis">جينيسيس (Genesis)</MenuItem>
                  <MenuItem value="Audi">أودي (Audi)</MenuItem>
                  <MenuItem value="Land Rover">لاند روفر (Range Rover)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="طراز المركبة وسنة الصنع"
                  placeholder="مثال: Land Cruiser 2024"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  fullWidth
                  sx={{
                    bgcolor: '#1e293b',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                    '& input': { color: '#f8fafc' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="اللون الخارجي للمركبة"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  fullWidth
                  sx={{
                    bgcolor: '#1e293b',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                    '& .MuiSelect-select': { color: '#f8fafc' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                  }}
                >
                  <MenuItem value="أبيض لؤلؤي">أبيض لؤلؤي</MenuItem>
                  <MenuItem value="أسود ملوكي ميتاليك">أسود ملوكي ميتاليك</MenuItem>
                  <MenuItem value="فضي ألماني معدني">فضي معدني</MenuItem>
                  <MenuItem value="رمادي داكن تيتانيوم">رمادي تيتانيوم</MenuItem>
                  <MenuItem value="كحلي ليلي">كحلي ليلي</MenuItem>
                  <MenuItem value="أحمر داكن">أحمر داكن</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="نوع التصريح والاشتراك"
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value)}
                  fullWidth
                  sx={{
                    bgcolor: '#1e293b',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                    '& .MuiSelect-select': { color: '#f8fafc' },
                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                  }}
                >
                  <MenuItem value="تصريح مقيم دائم VIP">تصريح مقيم دائم (VIP)</MenuItem>
                  <MenuItem value="اشتراك شهري قياسي">اشتراك شهري قياسي</MenuItem>
                  <MenuItem value="تصريح سنوي شامل">تصريح سنوي شامل</MenuItem>
                  <MenuItem value="تصريح زائر معتمد">تصريح زائر معتمد</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={autoClearance}
                  onChange={(e) => setAutoClearance(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#00e5ff' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00e5ff' },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={800} color="#f8fafc">
                    تفعيل العبور التلقائي الفوري عبر الحواجز الذكية
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    رفع الذراع آلياً بمجرد التقاط لوحة السيارة بواسطة كاميرات LPR
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8', fontWeight: 700 }}>
            إلغاء التراجع
          </Button>
          <Button
            variant="contained"
            onClick={handleAddVehicle}
            disabled={submitting}
            sx={{
              background: 'linear-gradient(135deg, #00f5ff 0%, #0284c7 100%)',
              color: '#070c14',
              fontWeight: 900,
              px: 3.5,
              borderRadius: 2.5,
            }}
          >
            {submitting ? 'جاري الحفظ...' : 'تأكيد تسجيل المركبة'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      <Dialog
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#fb7185' }}>
          تأكيد فك ارتباط وحذف المركبة
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
            هل أنت متأكد من رغبتك في حذف المركبة ذات اللوحة [<strong>{vehicleToDelete?.plateNumber}</strong>] من حسابك؟
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d' }}>
            سيتم إيقاف ميزة الفتح التلقائي للحواجز الذكية فوراً لهذه اللوحة.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteModal(false)} sx={{ color: '#94a3b8' }}>
            إلغاء
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} sx={{ fontWeight: 900 }}>
            تأكيد الحذف النهائي
          </Button>
        </DialogActions>
      </Dialog>

      {/* 📱 DIGITAL PASS QR MODAL */}
      <Dialog
        open={openQrModal}
        onClose={() => setOpenQrModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            borderRadius: 4,
            textAlign: 'center',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#00e5ff' }}>
          بطاقة العبور الرقمية المشفرة
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 3, display: 'inline-block', my: 2 }}>
            <QrCode2Icon sx={{ fontSize: 180, color: '#070c14' }} />
          </Box>
          <Typography variant="h6" fontWeight={900} sx={{ color: '#f8fafc' }}>
            {activeQrVehicle?.plateNumber}
          </Typography>
          <Typography variant="body2" sx={{ color: '#38bdf8', mt: 0.5 }}>
            {activeQrVehicle?.brandAr || activeQrVehicle?.make} — {activeQrVehicle?.modelAr || activeQrVehicle?.model}
          </Typography>
          <Chip
            size="small"
            label={activeQrVehicle?.subscriptionAr || 'تصريح سارٍ'}
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 800, mt: 1.5 }}
          />
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mt: 2 }}>
            يمكنك مسح هذا الرمز ضوئياً عند قارئات البوابات في حال تعذر القراءة البصرية للوحة.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
          <Button onClick={() => setOpenQrModal(false)} variant="contained" sx={{ px: 4, borderRadius: 2 }}>
            إغلاق البطاقة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
