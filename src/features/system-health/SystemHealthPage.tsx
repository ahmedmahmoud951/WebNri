import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import StorageIcon from '@mui/icons-material/Storage';
import WifiIcon from '@mui/icons-material/Wifi';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VideocamIcon from '@mui/icons-material/Videocam';
import FenceIcon from '@mui/icons-material/Fence';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { glassPanel, glowPanel } from '../../app/theme';

export function SystemHealthPage() {
  const theme = useTheme();
  const [checking, setChecking] = useState(false);

  const [components] = useState([
    {
      name: '.NET 8 Core Backend API',
      status: 'Healthy',
      latency: '18ms',
      uptime: '99.98%',
      details: 'Clean Architecture • ASP.NET Core 8.0 • Rate Limiting Active',
      icon: <CloudDoneIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
    },
    {
      name: 'SQL Server Database (db64137)',
      status: 'Healthy',
      latency: '24ms',
      uptime: '99.95%',
      details: 'Enterprise Schemas: core, parking, lpr, billing, audit • Connection Pool Active',
      icon: <StorageIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
    },
    {
      name: 'SignalR Realtime Hub (/hubs/parking)',
      status: 'Connected',
      latency: '8ms',
      uptime: '100%',
      details: 'WebSockets & LongPolling Fallback • Active Groups: operations, security, gate, building',
      icon: <WifiIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
    },
    {
      name: 'Demo Engine (Simulation Service)',
      status: 'Ready',
      latency: '2ms',
      uptime: '100%',
      details: 'Scenarios Engine: VehicleEntry, VehicleExit, GuestArrival, BarrierFault, CameraOffline',
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
    },
    {
      name: 'LPR Camera Network (20 Cameras)',
      status: '19 Online / 1 Offline',
      latency: '35ms',
      uptime: '95.0%',
      details: 'RTSP Video Feed • OCR Neural Engine v4.2 • 30 FPS Stream',
      icon: <VideocamIcon sx={{ fontSize: 32 }} />,
      color: '#A78BFA',
    },
    {
      name: 'Automated Barrier Relays (8 Barriers)',
      status: '100% Operational',
      latency: '12ms',
      uptime: '99.99%',
      details: 'Fast 0.8s Open/Close Cycle • Anti-Crush Safety Sensors Active',
      icon: <FenceIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
    },
  ]);

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 800);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            تشخيص وصحة النظام اللحظية (System Health & Telemetry)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            مراقبة الأداء، زمن الاستجابة، وحالة الربط بين واجهات الويب، السيرفر، وقواعد البيانات
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon sx={{ animation: checking ? 'spin 1s linear infinite' : 'none' }} />}
          onClick={handleRefresh}
          sx={{ fontWeight: 700 }}
        >
          فحص الاتصال الآن
        </Button>
      </Stack>

      {/* Grid of System Components */}
      <Grid container spacing={3}>
        {components.map((c, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card sx={{ ...glowPanel(c.color, {}, theme.palette.mode), p: 3, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: alpha(c.color, 0.15),
                      color: c.color,
                    }}
                  >
                    {c.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {c.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.details}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  label={c.status}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Stack>

              <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">زمن الاستجابة (Latency):</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: c.color }}>
                      {c.latency}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">نسبة الاستقرار (Uptime):</Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {c.uptime}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
