import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareIcon from '@mui/icons-material/Share';

import { smartParkingApi, type DigitalCardDto } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function DigitalCardPage() {
  const theme = useTheme();
  const [card, setCard] = useState<DigitalCardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState('NRI-DEMO-PASS-' + Date.now());

  useEffect(() => {
    smartParkingApi.getDigitalCard().then((res) => {
      if (res) {
        setCard(res);
        setQrToken(res.qrPayload || res.publicToken);
      }
    }).catch(() => {
      setCard({
        subscriptionId: 'sub-001',
        userId: 'usr-admin-1',
        userName: 'المهندس أحمد الشهري',
        vehicleId: 'veh-001',
        plateNumber: 'أ ب ج 1004',
        publicToken: 'PASS-TOKEN-98234-A',
        qrPayload: 'https://nri.smartparking.local/pass/verify?token=PASS-TOKEN-98234-A',
        expiresAt: '2026-12-31T23:59:59Z',
      });
    }).finally(() => {
      setLoading(false);
    });

    // Dynamic QR update simulation every 30 seconds
    const interval = setInterval(() => {
      setQrToken('NRI-DYNAMIC-PASS-' + Math.floor(Math.random() * 1000000));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 350 }}>
        <CircularProgress />
      </Box>
    );
  }

  const c = card || {
    subscriptionId: 'sub-001',
    userId: 'usr-admin-1',
    userName: 'المهندس أحمد الشهري',
    vehicleId: 'veh-001',
    plateNumber: 'أ ب ج 1004',
    publicToken: 'PASS-TOKEN-98234-A',
    qrPayload: 'https://nri.smartparking.local/pass/verify?token=PASS-TOKEN-98234-A',
    expiresAt: '2026-12-31T23:59:59Z',
  };

  return (
    <Box sx={{ pb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center', mb: 4, maxWidth: 500 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          بطاقة العضوية الرقمية (Digital Pass Card)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          بطاقة ذكية مشفرة تتيح لك الدخول السريع عبر بوابات وحواجز المجمع برمز QR الديناميكي
        </Typography>
      </Box>

      {/* Holographic Digital Membership Card */}
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: '24px',
          background: `linear-gradient(135deg, ${alpha('#1E293B', 0.95)} 0%, ${alpha('#0F172A', 0.95)} 50%, ${alpha('#042F2E', 0.95)} 100%)`,
          border: `1.5px solid ${theme.palette.primary.main}`,
          boxShadow: `0 24px 60px ${alpha(theme.palette.primary.main, 0.25)}, inset 0 1px 0 rgba(255,255,255,0.2)`,
          p: 3.5,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
        }}
      >
        {/* Subtle background glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 70%)`,
          }}
        />

        {/* Card Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2, color: theme.palette.primary.main, fontWeight: 800 }}>
              NRI SMART PARKING
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              VIP RESIDENT PASS
            </Typography>
          </Box>
          <VerifiedUserIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
        </Stack>

        {/* QR Code Container */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: '#FFFFFF',
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center',
            my: 2,
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          }}
        >
          <QRCodeSVG value={qrToken} size={180} level="H" includeMargin={false} />
          <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, mt: 1, letterSpacing: 1 }}>
            SCAN AT GATE SCANNER
          </Typography>
        </Box>

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ my: 1.5 }}>
          <Chip
            label="رمز أمني ديناميكي يتجدد تلقائياً"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: 11 }}
          />
        </Stack>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* User & Vehicle Metadata */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              حامل البطاقة (Member)
            </Typography>
            <Typography variant="body2" fontWeight={800}>
              {c.userName}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              رقم اللوحة المرتبطة
            </Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: theme.palette.primary.main, letterSpacing: 1 }}>
              {c.plateNumber}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              تاريخ الصلاحية
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              31 ديسمبر 2026
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              حالة البطاقة
            </Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: theme.palette.success.main }}>
              نشطة ومفعلة (Active)
            </Typography>
          </Grid>
        </Grid>
      </Card>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => setQrToken('NRI-MANUAL-REFRESH-' + Date.now())}
          sx={{ fontWeight: 700 }}
        >
          تحديث الرمز الآن
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ShareIcon />}
          sx={{ fontWeight: 700 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'NRI Digital Pass', text: 'بطاقة دخول موقف الحي', url: window.location.href });
            }
          }}
        >
          مشاركة البطاقة
        </Button>
      </Stack>
    </Box>
  );
}
