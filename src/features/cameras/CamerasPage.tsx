import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import RefreshIcon from '@mui/icons-material/Refresh';

import { smartParkingApi } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export interface CameraItem {
  id: string;
  name: string;
  building: string;
  gate: string;
  ipAddress: string;
  status: 'Online' | 'Offline' | 'Warning';
  lastEvent: string;
  lastSeen: string;
  fps: number;
}

export function CamerasPage() {
  const theme = useTheme();

  const [cameras, setCameras] = useState<CameraItem[]>([
    { id: '1', name: 'CAM-ENT-NORTH-01', building: 'Building A', gate: 'بوابة الشمال 1', ipAddress: '192.168.10.101', status: 'Online', lastEvent: 'رصد لوحة: أ ب ج 1004', lastSeen: 'الآن', fps: 30 },
    { id: '2', name: 'CAM-EXT-NORTH-02', building: 'Building A', gate: 'بوابة الشمال 1 (خروج)', ipAddress: '192.168.10.102', status: 'Online', lastEvent: 'رصد لوحة: د هـ و 2045', lastSeen: 'منذ دقيقة', fps: 30 },
    { id: '3', name: 'CAM-ENT-SOUTH-01', building: 'Building B', gate: 'بوابة الجنوب 2', ipAddress: '192.168.10.103', status: 'Online', lastEvent: 'رصد لوحة: س ص ع 9999', lastSeen: 'منذ 3 دقائق', fps: 28 },
    { id: '4', name: 'CAM-EXT-SOUTH-02', building: 'Building B', gate: 'بوابة الجنوب 2 (خروج)', ipAddress: '192.168.10.104', status: 'Offline', lastEvent: 'انقطاع الاتصال', lastSeen: 'منذ ساعتين', fps: 0 },
    { id: '5', name: 'CAM-VIP-01', building: 'Building C', gate: 'بوابة كبار الشخصيات', ipAddress: '192.168.10.105', status: 'Online', lastEvent: 'رصد لوحة: ر س م 7777', lastSeen: 'منذ 5 دقائق', fps: 30 },
    { id: '6', name: 'CAM-EAST-01', building: 'Building A', gate: 'بوابة الشرق 3', ipAddress: '192.168.10.106', status: 'Online', lastEvent: 'رصد لوحة: ق و ل 4001', lastSeen: 'منذ 8 دقائق', fps: 29 },
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleCameraStatus = async (cam: CameraItem) => {
    const newStatus = cam.status === 'Online' ? 'Offline' : 'Online';
    try {
      if (newStatus === 'Offline') {
        await smartParkingApi.setCameraOffline(cam.id);
      } else {
        await smartParkingApi.setCameraOnline(cam.id);
      }
    } catch {}

    setCameras((prev) =>
      prev.map((c) => (c.id === cam.id ? { ...c, status: newStatus, fps: newStatus === 'Online' ? 30 : 0 } : c))
    );
    setFeedback(`تم تغيير حالة الكاميرا "${cam.name}" إلى ${newStatus} بنجاح.`);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            شبكة كاميرات المراقبة و LPR (Surveillance Cameras)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة ومتابعة حالة كاميرات التعرف التلقائي على اللوحات وتغذية البث اللحظي
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Chip
            label={`${cameras.filter((c) => c.status === 'Online').length} متصلة`}
            color="success"
            sx={{ fontWeight: 800 }}
          />
          <Chip
            label={`${cameras.filter((c) => c.status === 'Offline').length} منقطعة`}
            color="error"
            sx={{ fontWeight: 800 }}
          />
        </Stack>
      </Stack>

      {feedback && <Alert severity="info" sx={{ mb: 3 }} onClose={() => setFeedback(null)}>{feedback}</Alert>}

      {/* Grid of Cameras */}
      <Grid container spacing={3}>
        {cameras.map((c) => {
          const isOnline = c.status === 'Online';
          return (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card
                sx={{
                  ...(isOnline
                    ? glowPanel(theme.palette.primary.main, {}, theme.palette.mode)
                    : glassPanel({}, theme.palette.mode)),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: alpha(isOnline ? theme.palette.primary.main : theme.palette.error.main, 0.15),
                        color: isOnline ? theme.palette.primary.main : theme.palette.error.main,
                      }}
                    >
                      {isOnline ? <VideocamIcon sx={{ fontSize: 28 }} /> : <VideocamOffIcon sx={{ fontSize: 28 }} />}
                    </Box>

                    <Chip
                      label={c.status}
                      color={isOnline ? 'success' : 'error'}
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

                  <Typography variant="h6" fontWeight={800}>
                    {c.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {c.building} • {c.gate}
                  </Typography>

                  <Stack spacing={1} sx={{ p: 1.5, borderRadius: '8px', bgcolor: alpha(theme.palette.background.paper, 0.5), mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">عنوان IP:</Typography>
                      <Typography variant="caption" fontWeight={700} dir="ltr">{c.ipAddress}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">معدل الإطارات:</Typography>
                      <Typography variant="caption" fontWeight={700}>{c.fps} FPS</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">آخر حدث مسجل:</Typography>
                      <Typography variant="caption" fontWeight={700}>{c.lastEvent}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant={isOnline ? 'outlined' : 'contained'}
                    color={isOnline ? 'error' : 'success'}
                    fullWidth
                    startIcon={<PowerSettingsNewIcon />}
                    onClick={() => toggleCameraStatus(c)}
                    sx={{ fontWeight: 800 }}
                  >
                    {isOnline ? 'محاكاة انقطاع (Simulate Offline)' : 'إعادة الاتصال (Bring Online)'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
