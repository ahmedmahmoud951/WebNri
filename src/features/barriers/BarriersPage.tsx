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
import FenceIcon from '@mui/icons-material/Fence';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import { smartParkingApi } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export interface BarrierItem {
  id: string;
  name: string;
  gate: string;
  state: 'Open' | 'Closed' | 'Opening' | 'Closing' | 'Fault';
  lastActionTime: string;
}

export function BarriersPage() {
  const theme = useTheme();

  const [barriers, setBarriers] = useState<BarrierItem[]>([
    { id: '1', name: 'Barrier North-01 (Entry)', gate: 'بوابة الشمال 1 (دخول)', state: 'Closed', lastActionTime: 'منذ 3 دقائق' },
    { id: '2', name: 'Barrier North-02 (Exit)', gate: 'بوابة الشمال 1 (خروج)', state: 'Closed', lastActionTime: 'منذ دقيقة' },
    { id: '3', name: 'Barrier South-01 (Entry)', gate: 'بوابة الجنوب 2 (دخول)', state: 'Closed', lastActionTime: 'منذ 10 دقائق' },
    { id: '4', name: 'Barrier South-02 (Exit)', gate: 'بوابة الجنوب 2 (خروج)', state: 'Closed', lastActionTime: 'منذ 4 دقائق' },
    { id: '5', name: 'Barrier East-01 (Entry)', gate: 'بوابة الشرق 3 (دخول)', state: 'Closed', lastActionTime: 'منذ 15 دقيقة' },
    { id: '6', name: 'Barrier VIP-01 (Gate VIP)', gate: 'بوابة كبار الشخصيات', state: 'Open', lastActionTime: 'الآن' },
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleOpen = async (b: BarrierItem) => {
    setBusyId(b.id);
    setBarriers((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, state: 'Opening' } : item))
    );
    try {
      await smartParkingApi.openBarrier(b.id);
    } catch {}

    setTimeout(() => {
      setBarriers((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, state: 'Open', lastActionTime: 'الآن' } : item))
      );
      setBusyId(null);
      setFeedback(`تم إصدار أمر الفتح وفتح الحاجز "${b.name}" بنجاح!`);
    }, 1200);
  };

  const handleClose = async (b: BarrierItem) => {
    setBusyId(b.id);
    setBarriers((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, state: 'Closing' } : item))
    );
    try {
      await smartParkingApi.closeBarrier(b.id);
    } catch {}

    setTimeout(() => {
      setBarriers((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, state: 'Closed', lastActionTime: 'الآن' } : item))
      );
      setBusyId(null);
      setFeedback(`تم إغلاق الحاجز "${b.name}" بنجاح وتأمين البوابة.`);
    }, 1200);
  };

  const handleSimulateFailure = async (b: BarrierItem) => {
    try {
      await smartParkingApi.simulateBarrierFailure(b.id);
    } catch {}
    setBarriers((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, state: 'Fault', lastActionTime: 'الآن' } : item))
    );
    setFeedback(`تمت محاكاة عطل ميكانيكي (Fault) في الحاجز "${b.name}".`);
  };

  const getStateColor = (state: BarrierItem['state']) => {
    switch (state) {
      case 'Open':
        return theme.palette.success.main;
      case 'Closed':
        return theme.palette.secondary.main;
      case 'Opening':
      case 'Closing':
        return theme.palette.info.main;
      case 'Fault':
        return theme.palette.error.main;
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            لوحة تحكم الحواجز الإلكترونية (Barrier Command Console)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة مباشرة وفورية لحواجز بوابات الدخول والخروج مع تحكم يدوي ومحاكاة أعطال
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Chip label="نظام الحواجز السريعة 0.8s" color="primary" variant="outlined" sx={{ fontWeight: 800 }} />
          <Chip label="بروتوكول OSDP / TCP-IP" size="small" />
        </Stack>
      </Stack>

      {feedback && <Alert severity="info" sx={{ mb: 3 }} onClose={() => setFeedback(null)}>{feedback}</Alert>}

      {/* Grid of Barriers */}
      <Grid container spacing={3}>
        {barriers.map((b) => {
          const color = getStateColor(b.state);
          const isBusy = busyId === b.id;
          return (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <Card
                sx={{
                  ...glowPanel(color, {}, theme.palette.mode),
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: alpha(color, 0.15),
                        color,
                      }}
                    >
                      <FenceIcon sx={{ fontSize: 32 }} />
                    </Box>

                    <Chip
                      label={b.state}
                      sx={{
                        fontWeight: 800,
                        bgcolor: alpha(color, 0.2),
                        color,
                        border: `1px solid ${alpha(color, 0.4)}`,
                      }}
                    />
                  </Stack>

                  <Typography variant="h6" fontWeight={800}>
                    {b.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {b.gate}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    آخر حركة: <strong>{b.lastActionTime}</strong>
                  </Typography>
                </Box>

                {/* Barrier Control Buttons */}
                <Stack spacing={1} sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={b.state === 'Open' ? 'contained' : 'outlined'}
                      color="success"
                      fullWidth
                      startIcon={<LockOpenIcon />}
                      onClick={() => handleOpen(b)}
                      disabled={isBusy || b.state === 'Open'}
                      sx={{ fontWeight: 800 }}
                    >
                      فتح (Open)
                    </Button>

                    <Button
                      variant={b.state === 'Closed' ? 'contained' : 'outlined'}
                      color="secondary"
                      fullWidth
                      startIcon={<LockIcon />}
                      onClick={() => handleClose(b)}
                      disabled={isBusy || b.state === 'Closed'}
                      sx={{ fontWeight: 800 }}
                    >
                      إغلاق (Close)
                    </Button>
                  </Stack>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<WarningIcon />}
                    onClick={() => handleSimulateFailure(b)}
                    disabled={isBusy}
                    sx={{ fontWeight: 700 }}
                  >
                    محاكاة عطل (Simulate Failure)
                  </Button>
                </Stack>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
