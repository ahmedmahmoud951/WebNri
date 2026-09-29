import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { smartParkingApi } from '../../core/api/smartParkingApi';
import { brandMarkTile } from '../../app/icons';

export function GuestPassPage() {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || 'INV-DEMO-2026';

  const [passData, setPassData] = useState<any>({
    guestName: 'الأستاذ عبد الرحمن السالم',
    hostName: 'المهندس أحمد الشهري (Resident)',
    vehiclePlate: 'ق و ل 4001',
    validFrom: '2026-09-30 10:00',
    validUntil: '2026-09-30 18:00',
    allowedGate: 'بوابة الشمال 1 (Gate North 01)',
    status: 'Valid',
    qrPayload: window.location.href,
  });

  useEffect(() => {
    if (code) {
      smartParkingApi.getPublicInvitePass(code).then((res) => {
        if (res) setPassData(res);
      }).catch(() => {
        // Fallback demo data
      });
    }
  }, [code]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'success';
      case 'Used':
        return 'info';
      case 'Expired':
        return 'warning';
      case 'Revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'grid',
        placeItems: 'center',
        p: { xs: 2.5, sm: 4 },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: '24px',
          background: `linear-gradient(145deg, ${alpha('#1E293B', 0.95)} 0%, ${alpha('#0F172A', 0.95)} 100%)`,
          border: `1.5px solid ${theme.palette.primary.main}`,
          boxShadow: `0 24px 60px ${alpha(theme.palette.primary.main, 0.25)}`,
          p: { xs: 3, sm: 4 },
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
          {brandMarkTile(44)}
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 800, fontSize: 18 }}>
              NRI Smart Parking
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              تصريح دخول ضيف رسمي (Guest Pass)
            </Typography>
          </Box>
        </Stack>

        <Chip
          icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
          label={`حالة التصريح: ${passData.status === 'Valid' ? 'صالح ومفعل (Valid)' : passData.status}`}
          color={getStatusColor(passData.status)}
          sx={{ fontWeight: 800, my: 1 }}
        />

        {/* Big QR Scanner Block */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: '#FFFFFF',
            borderRadius: '16px',
            display: 'inline-block',
            my: 2.5,
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          }}
        >
          <QRCodeSVG value={passData.qrPayload || window.location.href} size={190} level="H" />
          <Typography variant="caption" sx={{ display: 'block', color: '#0F172A', fontWeight: 800, mt: 1, letterSpacing: 1 }}>
            امسح الرمز عند قارئ البوابة
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>
          {passData.guestName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
          المضيف: <strong>{passData.hostName}</strong>
        </Typography>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Grid container spacing={2} sx={{ textAlign: 'right' }}>
          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                صالح من:
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700}>
              {passData.validFrom}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                صالح حتى:
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700}>
              {passData.validUntil}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MeetingRoomIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                البوابة المسموحة:
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700}>
              {passData.allowedGate}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DirectionsCarIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                لوحة المركبة:
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main, letterSpacing: 1 }}>
              {passData.vehiclePlate || 'مرصودة عند البوابة'}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
