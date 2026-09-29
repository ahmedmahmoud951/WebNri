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
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NavigationIcon from '@mui/icons-material/Navigation';
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
import ApartmentIcon from '@mui/icons-material/Apartment';
import LayersIcon from '@mui/icons-material/Layers';
import EvStationIcon from '@mui/icons-material/EvStation';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import SecurityIcon from '@mui/icons-material/Security';

import { smartParkingApi, type FindCarResponse } from '../../core/api/smartParkingApi';

export function FindCarPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FindCarResponse | null>(null);
  const [hornActive, setHornActive] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeFloor, setActiveFloor] = useState<'GF' | 'B1' | 'B2' | 'VIP'>('GF');

  const handleSearch = async (queryPlate?: string) => {
    const targetPlate = (queryPlate || plate).trim();
    if (!targetPlate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await smartParkingApi.findMyCar(targetPlate);
      if (data) {
        setResult(data);
        if (data.floor?.includes('القبو الأول') || data.floor?.includes('B1') || data.spot?.includes('B-')) {
          setActiveFloor('B1');
        } else if (data.floor?.includes('VIP') || data.spot?.includes('VIP')) {
          setActiveFloor('VIP');
        } else {
          setActiveFloor('GF');
        }
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

  // Determine dynamic bay calculations
  const match = result?.spot?.match(/(\d+)/);
  let bayNum = match ? parseInt(match[1], 10) : 104;
  if (bayNum < 101 || bayNum > 114) {
    bayNum = 101 + (Math.abs(bayNum) % 14);
  }
  const isTop = bayNum <= 107;
  const colIndex = isTop ? bayNum - 101 : bayNum - 108;
  const bayTargetX = 80 + colIndex * 115 + 46;
  const bayTargetY = isTop ? 105 : 295;
  const pathData = isTop
    ? `M 95 440 L 95 240 L ${bayTargetX} 240 L ${bayTargetX} 145`
    : `M 95 440 L 95 240 L ${bayTargetX} 240 L ${bayTargetX} 260`;

  // Safely parse directions whether returned as string, array, or missing
  const rawDirections = result?.directions;
  const directionSteps: string[] = Array.isArray(rawDirections)
    ? rawDirections
    : typeof rawDirections === 'string'
    ? (rawDirections as string).split('.').map((s) => s.trim()).filter(Boolean)
    : Array.isArray((result as any)?.navigationPath)
    ? (result as any).navigationPath.map((p: any) => p.instruction || p.step || '').filter(Boolean)
    : [
        'ادخل من بوابة البهو الرئيسية وتجاوز حاجز الترحيب.',
        'سر بمحاذاة الرواق الداخلي حتى المصعد المركزي.',
        'انعطف نحو الممر الداخلي للمواقف.',
        `سيارتك متوقفة في الخانة المضيئة (${result?.spot || 'A-104'}).`,
      ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Laser Animation Styles & Radiant Glows */}
      <style>{`
        @keyframes laserFlow {
          0% { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes radarExpand {
          0% { r: 10px; opacity: 0.9; }
          50% { r: 34px; opacity: 0.35; }
          100% { r: 48px; opacity: 0; }
        }
        @keyframes slotNeonPulse {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.6)) drop-shadow(0 0 25px rgba(0, 240, 255, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(0, 240, 255, 0.95)) drop-shadow(0 0 40px rgba(0, 240, 255, 0.55));
          }
        }
        @keyframes beaconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
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
          <Stack direction="row" alignItems="center" spacing={1.75}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#080D1A',
                boxShadow: '0 6px 20px rgba(0, 240, 255, 0.35)',
              }}
            >
              <NavigationIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                أين سيارتي والملاحة الداخلية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                مخطط الأدوار التفاعلي ثلاثي الأبعاد • مسار توجيه ليزري دقيق من بوابتك إلى موقف سيارتك
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Live System Signal Badge */}
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />}
          label="نظام الملاحة الداخلي (IPS) متصل ونشط"
          sx={{
            py: 0.5,
            px: 1,
            fontWeight: 800,
            fontSize: 12,
            bgcolor: 'rgba(16, 185, 129, 0.12)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        />
      </Stack>

      {/* Search Input Box */}
      <Card
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: '20px',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(56, 189, 248, 0.3)',
          boxShadow: isDark
            ? '0 14px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.1)'
            : '0 14px 36px rgba(14, 165, 233, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
        }}
      >
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
          البحث الفوري برقم لوحة السيارة (License Plate Search):
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            placeholder="أدخل أرقام أو حروف لوحة سيارتك (مثال: 1004 أو د هـ و 3310)..."
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? 'rgba(11, 18, 32, 0.85)' : 'rgba(240, 249, 255, 0.85)',
                borderRadius: '14px',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                '&:hover': { borderColor: '#00F0FF' },
                '&.Mui-focused': { borderColor: '#00F0FF', boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)' },
                '& fieldset': { border: 'none' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DirectionsCarIcon sx={{ color: '#00F0FF' }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            onClick={() => void handleSearch()}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.35,
              fontWeight: 900,
              minWidth: 170,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
              color: '#080D1A',
              boxShadow: '0 4px 18px rgba(0, 240, 255, 0.38)',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #00F0FF, #38BDF8)',
                boxShadow: '0 6px 26px rgba(0, 240, 255, 0.6)',
              },
            }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'جاري تحديد الموقف...' : 'تحديد موقع سيارتي'}
          </Button>
        </Stack>

        {/* Quick Plate Badges */}
        <Stack direction="row" spacing={1} sx={{ mt: 2.2 }} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            لوحات نشطة للتجربة الفورية:
          </Typography>
          {[
            { label: 'أ ب ج 1004 (كامري - Zone A)', q: '1004' },
            { label: 'س ص ع 2026 (لكزس VIP)', q: '2026' },
            { label: 'د هـ و 3310 (مرسيدس B1)', q: '3310' },
            { label: 'ر ز ط 4490 (سوناتا - Zone B)', q: '4490' },
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
                bgcolor: plate === item.q ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: plate === item.q ? '#00F0FF' : 'text.secondary',
                border: `1px solid ${plate === item.q ? '#00F0FF' : 'rgba(255, 255, 255, 0.1)'}`,
                '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.15)' },
              }}
            />
          ))}
        </Stack>
      </Card>

      {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: '14px', fontWeight: 700 }}>{error}</Alert>}

      {/* Ready / Empty State when no search executed yet */}
      {!result && !loading && (
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: '24px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(56, 189, 248, 0.28)',
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
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto', mb: 3.5, lineHeight: 1.8 }}>
            اكتب رقم أو حروف لوحة سيارتك في حقل البحث أعلاه، أو انقر على إحدى اللوحات النشطة أعلاه لمعاينة تفاصيل المركبة والموقف التفاعلي مع خط التوجيه الذكي خطوة بخطوة عبر خريطة الدور والمبنى.
          </Typography>

          <Grid container spacing={2.5} sx={{ maxWidth: 840, mx: 'auto' }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <Typography variant="subtitle2" fontWeight={900} color="#38BDF8">رصد بالكاميرات LPR</Typography>
                <Typography variant="caption" color="text.secondary">التعرف التلقائي الذكي على لوحات السيارات بدقة 99.4%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <Typography variant="subtitle2" fontWeight={900} color="#00F0FF">مخطط الأدوار والمناطق</Typography>
                <Typography variant="caption" color="text.secondary">خريطة فورية للمبنى مقسمة إلى Zone A, B, VIP, EV</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Typography variant="subtitle2" fontWeight={900} color="#10B981">خط مسار ليزري متوهج</Typography>
                <Typography variant="caption" color="text.secondary">مسار مرسوم ينبض ضوئياً يوجهك من البهو إلى سيارتك مباشرة</Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Main Results Layout */}
      {result && (
        <Grid container spacing={3}>
          {/* LEFT COLUMN: Vehicle Profile & Saudi License Plate Card */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                boxShadow: isDark
                  ? '0 16px 44px rgba(0, 0, 0, 0.55)'
                  : '0 14px 40px rgba(14, 165, 233, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                {/* Header Status Badge */}
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
                    borderRadius: '16px',
                    bgcolor: '#FFF',
                    color: '#000',
                    border: '3px solid #0F172A',
                    boxShadow: '0 10px 28px rgba(0, 240, 255, 0.28)',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, px: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#047857', letterSpacing: 1 }}>
                      المملكة العربية السعودية • KSA
                    </Typography>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#047857' }} />
                  </Stack>

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

                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: 2 }}>
                    {result.plateEnglish}
                  </Typography>
                </Box>

                {/* Specs List */}
                <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, borderRadius: '12px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)' }}>
                    <Typography variant="body2" color="text.secondary">موديل المركبة:</Typography>
                    <Typography variant="body2" fontWeight={800}>{result.vehicleModel} ({result.vehicleColor})</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, borderRadius: '12px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)' }}>
                    <Typography variant="body2" color="text.secondary">المبنى المحدد:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#38BDF8">{result.building}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, borderRadius: '12px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)' }}>
                    <Typography variant="body2" color="text.secondary">الدور والمنطقة:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#00F0FF">{result.floor}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, borderRadius: '12px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)' }}>
                    <Typography variant="body2" color="text.secondary">رقم الموقف المضاء (Slot):</Typography>
                    <Chip label={result.spot} sx={{ bgcolor: 'rgba(0, 240, 255, 0.2)', color: '#00F0FF', fontWeight: 900, fontSize: 13 }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, borderRadius: '12px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)' }}>
                    <Typography variant="body2" color="text.secondary">وقت وتاريخ الدخول:</Typography>
                    <Typography variant="body2" fontWeight={700}>{result.entryTime}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.25, borderRadius: '12px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(240, 249, 255, 0.65)' }}>
                    <Typography variant="body2" color="text.secondary">مدة الوقوف والرسوم:</Typography>
                    <Typography variant="body2" fontWeight={800} color="#10B981">{result.durationParked} • {result.accumulatedFee} ر.س</Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={1.5} sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VolumeUpIcon />}
                  onClick={handleHonkAndFlash}
                  sx={{
                    fontWeight: 900,
                    borderRadius: '12px',
                    py: 1.2,
                    background: hornActive
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'linear-gradient(135deg, #0284C7, #00F0FF)',
                    color: '#080D1A',
                    boxShadow: '0 4px 16px rgba(0, 240, 255, 0.35)',
                  }}
                >
                  {hornActive ? 'جاري وميض إضاءة الموقف والصوت...' : 'وميض إضاءة الموقف والصوت 🔊'}
                </Button>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<WhatsAppIcon />}
                    onClick={handleShareWhatsApp}
                    sx={{
                      fontWeight: 800,
                      borderRadius: '12px',
                      color: '#10B981',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                      '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' },
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
                      borderRadius: '12px',
                      color: '#38BDF8',
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', borderColor: '#38BDF8' },
                    }}
                  >
                    سداد وخروج سريع
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          {/* RIGHT COLUMN: The Interactive Floor Map & Glowing Blueprint */}
          <Grid item xs={12} lg={8}>
            <Card
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: '24px',
                bgcolor: isDark ? 'rgba(11, 18, 32, 0.9)' : 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(26px)',
                border: '2px solid rgba(56, 189, 248, 0.35)',
                boxShadow: isDark
                  ? '0 18px 50px rgba(0, 0, 0, 0.65)'
                  : '0 16px 44px rgba(14, 165, 233, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
                position: 'relative',
              }}
            >
              {/* Floor Switcher & Building Badge Bar */}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
                sx={{ mb: 2.5 }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <ApartmentIcon sx={{ color: '#00F0FF', fontSize: 22 }} />
                    <Typography variant="h6" fontWeight={900}>
                      {result.building}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    المخطط الهندسي الحي • إجمالي السعة: 28 موقفاً • متاح: 18 • مشغول: 8 • VIP/EV: 2
                  </Typography>
                </Box>

                {/* Floor Level Selector Tabs */}
                <Tabs
                  value={activeFloor}
                  onChange={(_, val) => setActiveFloor(val)}
                  sx={{
                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(240, 249, 255, 0.85)',
                    borderRadius: '14px',
                    p: 0.5,
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    minHeight: 38,
                    '& .MuiTab-root': {
                      minHeight: 32,
                      py: 0.5,
                      px: 2,
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: 12,
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: isDark ? '#080D1A' : '#FFF',
                        bgcolor: '#00F0FF',
                        boxShadow: '0 2px 10px rgba(0, 240, 255, 0.4)',
                      },
                    },
                    '& .MuiTabs-indicator': { display: 'none' },
                  }}
                >
                  <Tab value="GF" label="GF الأرضي" />
                  <Tab value="B1" label="B1 القبو 1" />
                  <Tab value="B2" label="B2 القبو 2" />
                  <Tab value="VIP" label="👑 كبار الشخصيات" />
                </Tabs>
              </Stack>

              {/* Zones Legend & Navigation Indicator */}
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: 16, color: '#00F0FF !important' }} />}
                  label="المسار المباشر: 35 متراً (40 ثانية مشياً)"
                  sx={{ bgcolor: 'rgba(0, 240, 255, 0.15)', color: '#00F0FF', fontWeight: 900, fontSize: 11.5 }}
                />
                <Chip
                  label="Zone A (المواقف الشرقية)"
                  size="small"
                  sx={{ bgcolor: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8', fontWeight: 800, fontSize: 11, border: '1px solid rgba(56, 189, 248, 0.3)' }}
                />
                <Chip
                  label="Zone B (المواقف الغربية)"
                  size="small"
                  sx={{ bgcolor: 'rgba(167, 139, 250, 0.12)', color: '#A78BFA', fontWeight: 800, fontSize: 11, border: '1px solid rgba(167, 139, 250, 0.3)' }}
                />
                <Chip
                  label="Zone VIP & EV"
                  size="small"
                  sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', fontWeight: 800, fontSize: 11, border: '1px solid rgba(16, 185, 129, 0.3)' }}
                />
              </Stack>

              {/* 🌟 THE ARCHITECTURAL SVG BLUEPRINT CANVAS */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 400, md: 470 },
                  borderRadius: '20px',
                  bgcolor: isDark ? '#050912' : '#F1F5F9',
                  border: '2px solid rgba(56, 189, 248, 0.35)',
                  boxShadow: isDark ? 'inset 0 0 40px rgba(0, 0, 0, 0.8)' : 'inset 0 0 20px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                }}
              >
                <svg
                  viewBox="0 0 940 480"
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                >
                  <defs>
                    {/* Laser Path Neon Gradient */}
                    <linearGradient id="laserGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="40%" stopColor="#00F0FF" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>

                    {/* Laser Arrow Head Marker */}
                    <marker
                      id="laserArrow"
                      viewBox="0 0 12 12"
                      refX="6"
                      refY="6"
                      markerWidth="8"
                      markerHeight="8"
                      orient="auto-start-reverse"
                    >
                      <path d="M 1 1 L 11 6 L 1 11 z" fill="#00F0FF" />
                    </marker>

                    {/* Target Spot Pulsing Filter */}
                    <filter id="neonSpotGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer Building Structural Perimeter */}
                  <rect
                    x="20"
                    y="20"
                    width="900"
                    height="440"
                    rx="18"
                    fill="none"
                    stroke={isDark ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.4)'}
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />

                  {/* ──────────────── ZONE A BOUNDARY BOX (East Wing) ──────────────── */}
                  <rect
                    x="40"
                    y="35"
                    width="440"
                    height="130"
                    rx="14"
                    fill={isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)'}
                    stroke="rgba(0, 240, 255, 0.3)"
                    strokeWidth="1.5"
                  />
                  <text x="60" y="55" fill="#00F0FF" fontSize="11" fontWeight="900" letterSpacing="1">
                    ZONE A • الجناح الشرقي (EAST WING)
                  </text>

                  {/* ──────────────── ZONE VIP & EV BOUNDARY BOX ──────────────── */}
                  <rect
                    x="500"
                    y="35"
                    width="400"
                    height="130"
                    rx="14"
                    fill={isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)'}
                    stroke="rgba(245, 158, 11, 0.3)"
                    strokeWidth="1.5"
                  />
                  <text x="520" y="55" fill="#F59E0B" fontSize="11" fontWeight="900" letterSpacing="1">
                    ZONE VIP & EV • كبار الشخصيات والشحن الكهربائي
                  </text>

                  {/* ──────────────── CENTRAL DRIVEWAY & AISLE ──────────────── */}
                  <rect
                    x="40"
                    y="180"
                    width="860"
                    height="85"
                    rx="12"
                    fill={isDark ? 'rgba(8, 13, 26, 0.7)' : 'rgba(226, 232, 240, 0.6)'}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1.5"
                  />
                  {/* Central Road Centerline */}
                  <line
                    x1="50"
                    y1="222"
                    x2="890"
                    y2="222"
                    stroke="rgba(56, 189, 248, 0.25)"
                    strokeWidth="3"
                    strokeDasharray="14 10"
                  />
                  {/* Road Direction Indicators */}
                  <text x="300" y="226" fill="rgba(255, 255, 255, 0.2)" fontSize="13" fontWeight="900">
                    ➔ مسار حركة المركبات (MAX 10 KM/H)
                  </text>
                  <text x="700" y="226" fill="rgba(255, 255, 255, 0.2)" fontSize="13" fontWeight="900">
                    ➔ اتجاه المخرج والرامب
                  </text>

                  {/* ──────────────── ZONE B BOUNDARY BOX (West Wing) ──────────────── */}
                  <rect
                    x="40"
                    y="280"
                    width="860"
                    height="125"
                    rx="14"
                    fill={isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)'}
                    stroke="rgba(167, 139, 250, 0.3)"
                    strokeWidth="1.5"
                  />
                  <text x="60" y="300" fill="#A78BFA" fontSize="11" fontWeight="900" letterSpacing="1">
                    ZONE B • الجناح الغربي ومواقف المغادرة السريعة (WEST WING)
                  </text>

                  {/* ════════════════ TOP ROW SLOTS (A-101 to A-107) ════════════════ */}
                  {[
                    { id: 'A-101', x: 60, y: 65, type: 'Standard', occupied: true, plate: 'أ ح ص 881' },
                    { id: 'A-102', x: 175, y: 65, type: 'Standard', occupied: false },
                    { id: 'A-103', x: 290, y: 65, type: 'Standard', occupied: true, plate: 'س ن ر 412' },
                    { id: 'A-104', x: 405, y: 65, type: 'Standard', occupied: false },
                    { id: 'A-105', x: 520, y: 65, type: 'EV', occupied: false },
                    { id: 'A-106', x: 635, y: 65, type: 'VIP', occupied: true, plate: 'ق ص ب 999' },
                    { id: 'A-107', x: 750, y: 65, type: 'VIP', occupied: false },
                  ].map((bay) => {
                    const isTarget = isTop && bay.id === `A-${bayNum}`;
                    const isVacant = !bay.occupied && !isTarget;
                    const strokeColor = isTarget
                      ? '#00F0FF'
                      : bay.type === 'VIP'
                      ? '#F59E0B'
                      : bay.type === 'EV'
                      ? '#10B981'
                      : bay.occupied
                      ? 'rgba(239, 68, 68, 0.6)'
                      : 'rgba(56, 189, 248, 0.4)';

                    return (
                      <g key={bay.id}>
                        {/* Slot Bay Box */}
                        <rect
                          x={bay.x}
                          y={bay.y}
                          width="95"
                          height="85"
                          rx="10"
                          fill={
                            isTarget
                              ? 'rgba(0, 240, 255, 0.22)'
                              : bay.occupied
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(15, 23, 42, 0.6)'
                          }
                          stroke={strokeColor}
                          strokeWidth={isTarget ? 3 : 1.5}
                          style={isTarget ? { animation: 'slotNeonPulse 2s ease-in-out infinite' } : {}}
                        />

                        {/* Wheel Stop Bar */}
                        <rect
                          x={bay.x + 12}
                          y={bay.y + 10}
                          width="71"
                          height="6"
                          rx="3"
                          fill={isTarget ? '#00F0FF' : 'rgba(255, 255, 255, 0.25)'}
                        />

                        {/* Overhead Smart LED Sensor Dot */}
                        <circle
                          cx={bay.x + 47}
                          cy={bay.y - 6}
                          r="4"
                          fill={isTarget ? '#00F0FF' : bay.occupied ? '#EF4444' : '#10B981'}
                          filter="drop-shadow(0 0 4px currentColor)"
                        />

                        {/* Bay Code Label */}
                        <text
                          x={bay.x + 47}
                          y={bay.y + 32}
                          textAnchor="middle"
                          fill={isTarget ? '#00F0FF' : '#94A3B8'}
                          fontSize="13"
                          fontWeight={isTarget ? '900' : '700'}
                        >
                          {bay.id}
                        </text>

                        {/* Status Icon / Tag */}
                        {isTarget ? (
                          <g transform={`translate(${bay.x + 47}, ${bay.y + 55})`}>
                            <text textAnchor="middle" fontSize="20">🚗</text>
                            <text y="18" textAnchor="middle" fill="#00F0FF" fontSize="9" fontWeight="900">
                              سيارتك هنا
                            </text>
                          </g>
                        ) : bay.occupied ? (
                          <g transform={`translate(${bay.x + 47}, ${bay.y + 52})`}>
                            <text textAnchor="middle" fill="#EF4444" fontSize="13">🚘</text>
                            <text y="16" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="700">
                              {bay.plate}
                            </text>
                          </g>
                        ) : (
                          <text
                            x={bay.x + 47}
                            y={bay.y + 60}
                            textAnchor="middle"
                            fill={bay.type === 'VIP' ? '#F59E0B' : bay.type === 'EV' ? '#10B981' : '#10B981'}
                            fontSize="11"
                            fontWeight="800"
                          >
                            {bay.type === 'VIP' ? '👑 VIP' : bay.type === 'EV' ? '⚡ EV' : 'شاغر ✓'}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* ════════════════ BOTTOM ROW SLOTS (A-108 to A-114) ════════════════ */}
                  {[
                    { id: 'A-108', x: 60, y: 310, type: 'Standard', occupied: false },
                    { id: 'A-109', x: 175, y: 310, type: 'Standard', occupied: true, plate: 'د م ك 304' },
                    { id: 'A-110', x: 290, y: 310, type: 'Standard', occupied: false },
                    { id: 'A-111', x: 405, y: 310, type: 'Standard', occupied: true, plate: 'ح ل م 204' },
                    { id: 'A-112', x: 520, y: 310, type: 'Standard', occupied: false },
                    { id: 'A-113', x: 635, y: 310, type: 'Standard', occupied: false },
                    { id: 'A-114', x: 750, y: 310, type: 'Standard', occupied: true, plate: 'ط ي ر 511' },
                  ].map((bay) => {
                    const isTarget = !isTop && bay.id === `A-${bayNum}`;
                    const strokeColor = isTarget
                      ? '#00F0FF'
                      : bay.occupied
                      ? 'rgba(239, 68, 68, 0.6)'
                      : 'rgba(167, 139, 250, 0.4)';

                    return (
                      <g key={bay.id}>
                        {/* Slot Bay Box */}
                        <rect
                          x={bay.x}
                          y={bay.y}
                          width="95"
                          height="85"
                          rx="10"
                          fill={
                            isTarget
                              ? 'rgba(0, 240, 255, 0.22)'
                              : bay.occupied
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(15, 23, 42, 0.6)'
                          }
                          stroke={strokeColor}
                          strokeWidth={isTarget ? 3 : 1.5}
                          style={isTarget ? { animation: 'slotNeonPulse 2s ease-in-out infinite' } : {}}
                        />

                        {/* Wheel Stop Bar */}
                        <rect
                          x={bay.x + 12}
                          y={bay.y + 68}
                          width="71"
                          height="6"
                          rx="3"
                          fill={isTarget ? '#00F0FF' : 'rgba(255, 255, 255, 0.25)'}
                        />

                        {/* Overhead Smart LED Sensor Dot */}
                        <circle
                          cx={bay.x + 47}
                          cy={bay.y + 92}
                          r="4"
                          fill={isTarget ? '#00F0FF' : bay.occupied ? '#EF4444' : '#10B981'}
                          filter="drop-shadow(0 0 4px currentColor)"
                        />

                        {/* Bay Code Label */}
                        <text
                          x={bay.x + 47}
                          y={bay.y + 28}
                          textAnchor="middle"
                          fill={isTarget ? '#00F0FF' : '#94A3B8'}
                          fontSize="13"
                          fontWeight={isTarget ? '900' : '700'}
                        >
                          {bay.id}
                        </text>

                        {/* Status Icon / Tag */}
                        {isTarget ? (
                          <g transform={`translate(${bay.x + 47}, ${bay.y + 48})`}>
                            <text textAnchor="middle" fontSize="20">🚗</text>
                            <text y="16" textAnchor="middle" fill="#00F0FF" fontSize="9" fontWeight="900">
                              سيارتك هنا
                            </text>
                          </g>
                        ) : bay.occupied ? (
                          <g transform={`translate(${bay.x + 47}, ${bay.y + 46})`}>
                            <text textAnchor="middle" fill="#EF4444" fontSize="13">🚘</text>
                            <text y="14" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="700">
                              {bay.plate}
                            </text>
                          </g>
                        ) : (
                          <text
                            x={bay.x + 47}
                            y={bay.y + 52}
                            textAnchor="middle"
                            fill="#10B981"
                            fontSize="11"
                            fontWeight="800"
                          >
                            شاغر ✓
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* ──────────────── ARCHITECTURAL LANDMARKS ──────────────── */}
                  {/* Start Point: Main North Lobby Entrance */}
                  <g transform="translate(95, 435)">
                    <circle cx="0" cy="0" r="22" fill="rgba(16, 185, 129, 0.2)" />
                    <circle cx="0" cy="0" r="10" fill="#10B981" />
                    <circle cx="0" cy="0" r="10" fill="none" stroke="#10B981" strokeWidth="2" style={{ animation: 'radarExpand 2s infinite' }} />
                    <text x="0" y="24" textAnchor="middle" fill="#10B981" fontSize="11" fontWeight="900">
                      موقعك الحالي (بهو الدخول 01)
                    </text>
                  </g>

                  {/* Elevator Bank Central Landmark */}
                  <g transform="translate(470, 435)">
                    <rect x="-35" y="-16" width="70" height="32" rx="8" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#38BDF8" fontSize="11" fontWeight="900">
                      🛗 المصاعد A
                    </text>
                  </g>

                  {/* Emergency Staircase Landmark */}
                  <g transform="translate(800, 435)">
                    <rect x="-32" y="-16" width="64" height="32" rx="8" fill="rgba(239, 68, 68, 0.15)" stroke="#EF4444" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#EF4444" fontSize="11" fontWeight="900">
                      🚪 مخرج B
                    </text>
                  </g>

                  {/* 🚀 THE RADIANT LASER NAVIGATION PATH LINE 🚀 */}
                  {/* Outer Diffusion Halo Layer */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(0, 240, 255, 0.35)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonSpotGlow)"
                  />

                  {/* Laser Core Glowing Dotted Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="url(#laserGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="14 8"
                    markerEnd="url(#laserArrow)"
                    style={{
                      animation: 'laserFlow 1.2s linear infinite',
                    }}
                  />

                  {/* Turn Junction Nodes */}
                  <circle cx="95" cy="240" r="6" fill="#00F0FF" stroke="#FFF" strokeWidth="2" filter="drop-shadow(0 0 6px #00F0FF)" />
                  <circle cx={bayTargetX} cy="240" r="6" fill="#00F0FF" stroke="#FFF" strokeWidth="2" filter="drop-shadow(0 0 6px #00F0FF)" />

                  {/* Target Beacon Arrival Marker */}
                  <g transform={`translate(${bayTargetX}, ${bayTargetY})`}>
                    <circle cx="0" cy="0" r="28" fill="none" stroke="#00F0FF" strokeWidth="2" style={{ animation: 'radarExpand 1.8s infinite' }} />
                    <circle cx="0" cy="0" r="16" fill="#00F0FF" />
                    <circle cx="0" cy="0" r="13" fill="#080D1A" />
                    <text x="0" y="5" textAnchor="middle" fill="#00F0FF" fontSize="13">📍</text>
                  </g>
                </svg>
              </Box>

              {/* Waypoints & Turn-by-Turn Stepper Bar */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1.5, color: '#00F0FF' }}>
                  إرشادات السير والتوجيه خطوة بخطوة (Turn-by-Turn Guidance):
                </Typography>

                <Stepper orientation="vertical">
                  {directionSteps.map((stepText, idx) => (
                    <Step key={idx} active completed={idx < directionSteps.length - 1}>
                      <StepLabel>
                        <Typography
                          variant="body2"
                          fontWeight={idx === directionSteps.length - 1 ? 900 : 700}
                          sx={{
                            color: idx === directionSteps.length - 1 ? '#00F0FF' : 'text.primary',
                          }}
                        >
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
