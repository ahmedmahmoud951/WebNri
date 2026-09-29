import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NavigationIcon from '@mui/icons-material/Navigation';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StraightIcon from '@mui/icons-material/Straight';
import TurnLeftIcon from '@mui/icons-material/TurnLeft';
import TurnRightIcon from '@mui/icons-material/TurnRight';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';

import { smartParkingApi, type FindCarResponse } from '../../core/api/smartParkingApi';
import { glassPanel } from '../../app/theme';

export function FindCarPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FindCarResponse | null>(null);
  const [hornActive, setHornActive] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleSearch = async (queryPlate?: string) => {
    const targetPlate = (queryPlate || plate).trim();
    if (!targetPlate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await smartParkingApi.findMyCar(targetPlate);
      if (data) {
        setResult(data);
      } else {
        setError('لم يتم العثور على موقع السيارة حالياً. تأكد من صحة رقم اللوحة.');
      }
    } catch {
      setError('تعذر جلب موقع السيارة. يرجى إعادة المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  const handleHonkAndFlash = () => {
    setHornActive(true);
    setActionNotice('تم تفعيل وميض إضاءة الموقف الذكي وإطلاق صوت تنبيه خفيف لتحديد مكان السيارة!');
    setTimeout(() => setHornActive(false), 5000);
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const text = encodeURIComponent(
      `موقع سيارتي (${result.plate}):\nالمبنى: ${result.building}\nالدور: ${result.floor}\nرقم الموقف: ${result.spot}\nأقرب مصعد: ${result.nearestElevator}\nالرابط الملاحي:\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* CSS Keyframes for Pulsing Navigation Line */}
      <style>{`
        @keyframes dashMove {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes radarPulse {
          0% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.35); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.9; }
        }
      `}</style>

      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2.5}
        sx={{ mb: 3.5 }}
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
              <NavigationIcon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                العثور على سيارتي والملاحة الداخلية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                تحديد مكان وقوف سيارتك ورسم مسار ملاحي دقيق يوجهك خطوة بخطوة إلى الموقف
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      {/* Search Input Box */}
      <Card
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: '18px',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: isDark
            ? '0 12px 36px rgba(0, 0, 0, 0.4)'
            : '0 12px 34px rgba(14, 165, 233, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
        }}
      >
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
          البحث الفوري برقم لوحة السيارة (License Plate Search):
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            placeholder="أدخل أرقام أو حروف اللوحة (مثال: 1004 أو أ ب ج 1004)..."
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? 'rgba(11, 18, 32, 0.8)' : 'rgba(240, 249, 255, 0.8)',
                borderRadius: '12px',
                borderColor: 'rgba(56, 189, 248, 0.3)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DirectionsCarIcon sx={{ color: '#38BDF8' }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            onClick={() => handleSearch()}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.25,
              fontWeight: 900,
              minWidth: 150,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
              color: '#080D1A',
              boxShadow: '0 4px 16px rgba(0, 240, 255, 0.35)',
            }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'جاري التحديد...' : 'تحديد موقع السيارة'}
          </Button>
        </Stack>

        {/* Quick Plate Buttons */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            لوحات نشطة للتجربة الفورية:
          </Typography>
          {[
            { label: 'أ ب ج 1004 (كامري)', q: '1004' },
            { label: 'س ص ع 2026 (لكزس VIP)', q: '2026' },
            { label: 'د هـ و 3310 (مرسيدس B1)', q: '3310' },
            { label: 'ر ز ط 4490 (سوناتا)', q: '4490' },
          ].map((item) => (
            <Chip
              key={item.q}
              label={item.label}
              size="small"
              onClick={() => {
                setPlate(item.q);
                void handleSearch(item.q);
              }}
              sx={{
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 11,
                bgcolor: plate === item.q ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: plate === item.q ? '#38BDF8' : 'text.secondary',
                border: `1px solid ${plate === item.q ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)'}`,
                '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.15)' },
              }}
            />
          ))}
        </Stack>
      </Card>

      {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}>{error}</Alert>}

      {/* Ready / Empty State when no search executed yet */}
      {!result && !loading && (
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: '20px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            textAlign: 'center',
            boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 16px 36px rgba(14, 165, 233, 0.1)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              mx: 'auto',
              mb: 2.5,
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(0, 240, 255, 0.15))',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F0FF',
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 42 }} />
          </Box>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
            جاهز لتحديد موقع سيارتك ورسم مسار الوصول فوراً
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            اكتب أرقام أو حروف لوحة سيارتك في حقل البحث أعلاه، أو انقر على إحدى اللوحات النشطة أعلاه لمعاينة تفاصيل المركبة والموقف التفاعلي مع خط التوجيه الذكي خطوة بخطوة.
          </Typography>

          <Grid container spacing={2} sx={{ maxWidth: 800, mx: 'auto' }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#38BDF8">رصد بالكاميرات LPR</Typography>
                <Typography variant="caption" color="text.secondary">التعرف التلقائي الذكي على لوحات السيارات بدقة 99%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#00F0FF">مخطط الدور التفاعلي</Typography>
                <Typography variant="caption" color="text.secondary">خريطة فورية للمبنى مع إبراز خانة الموقف المضاءة</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#10B981">خط ملاحة متصل</Typography>
                <Typography variant="caption" color="text.secondary">مسار مرسوم يوجهك من البوابة إلى سيارتك مباشرة</Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Main Results Layout */}
      {result && (
        <Grid container spacing={3}>
          {/* Left Column: Full Vehicle Specs & Saudi License Plate Card */}
          <Grid item xs={12} lg={4.5}>
            <Card
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: isDark
                  ? '0 12px 36px rgba(0, 0, 0, 0.5)'
                  : '0 12px 34px rgba(14, 165, 233, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                {/* Status Badge */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={900}>
                    بطاقة بيانات المركبة
                  </Typography>
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />}
                    label="تم الرصد عبر LPR بنجاح"
                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 800, fontSize: 11 }}
                  />
                </Stack>

                {/* Saudi Official License Plate Visual Box */}
                <Box
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: '14px',
                    bgcolor: '#FFF',
                    color: '#000',
                    border: '3px solid #000',
                    boxShadow: '0 8px 24px rgba(0, 240, 255, 0.25)',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Green Emblem Banner */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, px: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#047857', letterSpacing: 1 }}>
                      المملكة العربية السعودية • KSA
                    </Typography>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#047857' }} />
                  </Stack>

                  {/* License Plate String Display */}
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    sx={{
                      fontFamily: 'monospace',
                      letterSpacing: 3,
                      color: '#0F172A',
                      my: 0.5,
                      direction: 'ltr',
                    }}
                  >
                    {result.plate}
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                    {result.plateEnglish || '1004 KSA'}
                  </Typography>
                </Box>

                {/* Vehicle Detailed Specifications */}
                <Stack spacing={1.75} sx={{ mb: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(11, 18, 32, 0.6)' : 'rgba(240, 249, 255, 0.7)' }}>
                    <Typography variant="caption" color="text.secondary">نوع وفئة المركبة:</Typography>
                    <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#38BDF8' }}>
                      {result.vehicleModel || 'Toyota Camry 2024'} • {result.vehicleColor || 'أبيض لؤلؤي'}
                    </Typography>
                  </Box>

                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(11, 18, 32, 0.6)' : 'rgba(240, 249, 255, 0.7)' }}>
                        <Typography variant="caption" color="text.secondary">رقم الموقف (Slot):</Typography>
                        <Typography variant="h6" fontWeight={900} sx={{ color: '#00F0FF' }}>
                          {result.spot}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(11, 18, 32, 0.6)' : 'rgba(240, 249, 255, 0.7)' }}>
                        <Typography variant="caption" color="text.secondary">الدور والمستوى:</Typography>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {result.floor}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(11, 18, 32, 0.6)' : 'rgba(240, 249, 255, 0.7)' }}>
                    <Typography variant="caption" color="text.secondary">المبنى:</Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {result.building}
                    </Typography>
                  </Box>

                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(11, 18, 32, 0.6)' : 'rgba(240, 249, 255, 0.7)' }}>
                        <Typography variant="caption" color="text.secondary">مدة الوقوف:</Typography>
                        <Typography variant="body2" fontWeight={800}>
                          {result.durationParked || '1 ساعة و 24 دقيقة'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: isDark ? 'rgba(11, 18, 32, 0.6)' : 'rgba(240, 249, 255, 0.7)' }}>
                        <Typography variant="caption" color="text.secondary">الرسوم المستحقة:</Typography>
                        <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#10B981' }}>
                          {result.accumulatedFee ? `${result.accumulatedFee}.00 SAR` : 'مشترك معتمد'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </Box>

              {/* Action Buttons Row */}
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VolumeUpIcon />}
                  onClick={handleHonkAndFlash}
                  sx={{
                    fontWeight: 900,
                    borderRadius: '10px',
                    py: 1.2,
                    background: hornActive
                      ? 'linear-gradient(135deg, #EF4444, #F59E0B)'
                      : 'linear-gradient(135deg, #0284C7, #00F0FF)',
                    color: '#080D1A',
                    boxShadow: '0 4px 16px rgba(0, 240, 255, 0.3)',
                  }}
                >
                  {hornActive ? 'جاري إطلاق وميض الموقف والصوت...' : 'وميض إضاءة الموقف والصوت 🔊'}
                </Button>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<WhatsAppIcon />}
                    onClick={handleShareWhatsApp}
                    sx={{
                      fontWeight: 800,
                      borderRadius: '10px',
                      color: '#25D366',
                      borderColor: 'rgba(37, 211, 102, 0.4)',
                    }}
                  >
                    مشاركة WhatsApp
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PaymentIcon />}
                    onClick={() => setActionNotice('تم تأكيد سداد الرسوم وإصدار أمر فتح البوابة السريع عند خروجك!')}
                    sx={{
                      fontWeight: 800,
                      borderRadius: '10px',
                      color: '#38BDF8',
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                    }}
                  >
                    سداد وخروج سريع
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          {/* Right Column: Building Floor Blueprint with Animated Path Line */}
          <Grid item xs={12} lg={7.5}>
            <Card
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: isDark ? 'rgba(11, 18, 32, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                boxShadow: isDark
                  ? '0 16px 44px rgba(0, 0, 0, 0.6)'
                  : '0 14px 40px rgba(14, 165, 233, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
                position: 'relative',
              }}
            >
              {/* Floor Plan Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    مخطط الدور الداخلي ومسار التوجيه (Indoor Navigation Line)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    المبنى: {result.building} — {result.floor}
                  </Typography>
                </Box>
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: 16, color: '#00F0FF !important' }} />}
                  label="مسافة المشي المتبقية: 35 متراً (40 ثانية)"
                  sx={{ bgcolor: 'rgba(0, 240, 255, 0.15)', color: '#00F0FF', fontWeight: 800, fontSize: 11 }}
                />
              </Stack>

              {/* Graphical Blueprint Canvas with SVG Path Line */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 380,
                  borderRadius: '16px',
                  bgcolor: isDark ? '#060B14' : '#F1F5F9',
                  border: '1.5px solid rgba(56, 189, 248, 0.35)',
                  overflow: 'hidden',
                  p: 2,
                }}
              >
                {/* SVG Blueprint Grid Lines & Animated Path Line */}
                <svg
                  viewBox="0 0 800 340"
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#00F0FF" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>

                    {/* Arrowhead marker */}
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="5"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#00F0FF" />
                    </marker>
                  </defs>

                  {/* Corridor & Lane Lines */}
                  <rect x="20" y="20" width="760" height="300" rx="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <line x1="20" y1="120" x2="780" y2="120" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="3" strokeDasharray="8 8" />

                  {/* Draw Parking Bays Row Top (A-101 to A-107) */}
                  {[
                    { id: 'A-101', x: 60, y: 35 },
                    { id: 'A-102', x: 160, y: 35 },
                    { id: 'A-103', x: 260, y: 35 },
                    { id: 'A-104', x: 360, y: 35 },
                    { id: 'A-105', x: 460, y: 35 },
                    { id: 'A-106', x: 560, y: 35 },
                    { id: 'A-107', x: 660, y: 35 },
                  ].map((bay) => {
                    const match = result.spot.match(/(\d+)/);
                    let bayNum = match ? parseInt(match[1], 10) : 104;
                    if (bayNum < 101 || bayNum > 114) {
                      bayNum = 101 + (Math.abs(bayNum) % 14);
                    }
                    const isTarget = bay.id === `A-${bayNum}`;
                    return (
                      <g key={bay.id}>
                        <rect
                          x={bay.x}
                          y={bay.y}
                          width="80"
                          height="65"
                          rx="8"
                          fill={isTarget ? 'rgba(0, 240, 255, 0.18)' : 'rgba(15, 23, 42, 0.4)'}
                          stroke={isTarget ? '#00F0FF' : 'rgba(255, 255, 255, 0.12)'}
                          strokeWidth={isTarget ? 3 : 1.5}
                        />
                        <text
                          x={bay.x + 40}
                          y={bay.y + 38}
                          textAnchor="middle"
                          fill={isTarget ? '#00F0FF' : '#64748B'}
                          fontSize="13"
                          fontWeight={isTarget ? '900' : '700'}
                        >
                          {bay.id}
                        </text>
                      </g>
                    );
                  })}

                  {/* Draw Parking Bays Row Bottom (A-108 to A-114) */}
                  {[
                    { id: 'A-108', x: 60, y: 155 },
                    { id: 'A-109', x: 160, y: 155 },
                    { id: 'A-110', x: 260, y: 155 },
                    { id: 'A-111', x: 360, y: 155 },
                    { id: 'A-112', x: 460, y: 155 },
                    { id: 'A-113', x: 560, y: 155 },
                    { id: 'A-114', x: 660, y: 155 },
                  ].map((bay) => {
                    const match = result.spot.match(/(\d+)/);
                    let bayNum = match ? parseInt(match[1], 10) : 104;
                    if (bayNum < 101 || bayNum > 114) {
                      bayNum = 101 + (Math.abs(bayNum) % 14);
                    }
                    const isTarget = bay.id === `A-${bayNum}`;
                    return (
                      <g key={bay.id}>
                        <rect
                          x={bay.x}
                          y={bay.y}
                          width="80"
                          height="65"
                          rx="8"
                          fill={isTarget ? 'rgba(0, 240, 255, 0.18)' : 'rgba(15, 23, 42, 0.4)'}
                          stroke={isTarget ? '#00F0FF' : 'rgba(255, 255, 255, 0.12)'}
                          strokeWidth={isTarget ? 3 : 1.5}
                        />
                        <text
                          x={bay.x + 40}
                          y={bay.y + 38}
                          textAnchor="middle"
                          fill={isTarget ? '#00F0FF' : '#64748B'}
                          fontSize="13"
                          fontWeight={isTarget ? '900' : '700'}
                        >
                          {bay.id}
                        </text>
                      </g>
                    );
                  })}

                  {/* Landmark Markers */}
                  {/* Entrance / Start Point */}
                  <g transform="translate(60, 270)">
                    <circle cx="0" cy="0" r="16" fill="rgba(16, 185, 129, 0.25)" />
                    <circle cx="0" cy="0" r="8" fill="#10B981" />
                    <text x="0" y="24" textAnchor="middle" fill="#10B981" fontSize="11" fontWeight="800">
                      موقعك الحالي (البوابة)
                    </text>
                  </g>

                  {/* Elevator Landmark */}
                  <g transform="translate(240, 270)">
                    <rect x="-18" y="-14" width="36" height="28" rx="6" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="800">
                      مصعد A
                    </text>
                  </g>

                  {/* Emergency Exit Landmark */}
                  <g transform="translate(700, 270)">
                    <rect x="-18" y="-14" width="36" height="28" rx="6" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="800">
                      مخرج B
                    </text>
                  </g>

                  {/* 🚀 THE VIVID ANIMATED NAVIGATION LINE */}
                  {/* Dynamic target coords based on slot */}
                  {(() => {
                    const match = result.spot.match(/(\d+)/);
                    let bayNum = match ? parseInt(match[1], 10) : 104;
                    if (bayNum < 101 || bayNum > 114) {
                      bayNum = 101 + (Math.abs(bayNum) % 14);
                    }
                    const isTop = bayNum <= 107;
                    const col = isTop ? (bayNum - 101) : (bayNum - 108);
                    const targetX = 60 + col * 100 + 40;
                    const targetY = isTop ? 68 : 188;
                    const pathD = isTop
                      ? `M 60 270 L 60 120 L ${targetX} 120 L ${targetX} 102`
                      : `M 60 270 L 60 120 L ${targetX} 120 L ${targetX} 155`;

                    return (
                      <>
                        {/* Glow halo behind line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="rgba(0, 240, 255, 0.35)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />

                        {/* Animated dotted/dashed line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="url(#pathGradient)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray="10 6"
                          markerEnd="url(#arrow)"
                          style={{
                            animation: 'dashMove 1.5s linear infinite',
                          }}
                        />

                        {/* Turn Node Markers */}
                        <circle cx="60" cy="120" r="5" fill="#00F0FF" stroke="#FFF" strokeWidth="1.5" />
                        <circle cx={targetX} cy="120" r="5" fill="#00F0FF" stroke="#FFF" strokeWidth="1.5" />

                        {/* Target Car Glowing Beacon & Icon */}
                        <g transform={`translate(${targetX}, ${targetY})`}>
                          <circle cx="0" cy="0" r="22" fill="none" stroke="#00F0FF" strokeWidth="2" style={{ animation: 'radarPulse 2s ease-out infinite' }} />
                          <circle cx="0" cy="0" r="14" fill="#00F0FF" />
                          <circle cx="0" cy="0" r="12" fill="#080D1A" />
                          <text x="0" y="4" textAnchor="middle" fill="#00F0FF" fontSize="13">
                            🚗
                          </text>
                          <rect x="-35" y="16" width="70" height="20" rx="6" fill="#0B1220" stroke="#00F0FF" strokeWidth="1.5" />
                          <text x="0" y="30" textAnchor="middle" fill="#00F0FF" fontSize="10" fontWeight="900">
                            {result.spot}
                          </text>
                        </g>
                      </>
                    );
                  })()}
                </svg>
              </Box>

              {/* Turn-by-Turn Navigation Stepper */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
                  خطوات السير المباشرة (Turn-by-Turn Guidance):
                </Typography>

                <Stepper orientation="vertical">
                  {result.directions?.map((stepText, idx) => (
                    <Step key={idx} active completed={idx < result.directions.length - 1}>
                      <StepLabel>
                        <Typography variant="body2" fontWeight={idx === result.directions.length - 1 ? 900 : 600} sx={{ color: idx === result.directions.length - 1 ? '#00F0FF' : 'text.primary' }}>
                          {stepText}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Confirmation feedback */}
      <Snackbar
        open={Boolean(actionNotice)}
        autoHideDuration={4000}
        onClose={() => setActionNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setActionNotice(null)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 800, bgcolor: '#10B981', color: '#FFF' }}
        >
          {actionNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
