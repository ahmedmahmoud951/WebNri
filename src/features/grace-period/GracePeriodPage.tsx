import { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { glassPanel, glowPanel } from '../../app/theme';

export function GracePeriodPage() {
  const theme = useTheme();

  const [activeGrace] = useState([
    { id: 'g1', plate: 'أ ب ج 1004', entryTime: '18:18', remainingMinutes: 14, percentRemaining: 70, status: 'In Grace' },
    { id: 'g2', plate: 'د هـ و 2045', entryTime: '18:24', remainingMinutes: 19, percentRemaining: 95, status: 'In Grace' },
    { id: 'g3', plate: 'س ص ع 9999', entryTime: '18:05', remainingMinutes: 2, percentRemaining: 10, status: 'Near Expiry' },
  ]);

  const [violations] = useState([
    { id: 'v1', plate: 'ط ك ل 8812', entryTime: '16:00', graceLimit: '16:20', exitTime: '17:15', penaltyFee: 50, status: 'Fee Applied' },
    { id: 'v2', plate: 'ي ن م 3321', entryTime: '14:30', graceLimit: '14:50', exitTime: '15:40', penaltyFee: 50, status: 'Fee Applied' },
  ]);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          مراقبة فترات السماح والمخالفات (Grace Period Monitor)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          متابعة المركبات ضمن فترة السماح القانونية (20 دقيقة) قبل بدء احتساب رسوم الوقوف أو الغرامات
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" fontWeight={700} color="text.secondary">فترة السماح المعتمدة</Typography>
              <TimerIcon sx={{ color: theme.palette.primary.main }} />
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: theme.palette.primary.main }}>
              20 دقيقة
            </Typography>
            <Typography variant="caption" color="text.secondary">خروج مجاني دون رسوم خلال 20 دقيقة</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" fontWeight={700} color="text.secondary">مركبات داخل السماح الآن</Typography>
              <CheckCircleOutlineIcon sx={{ color: theme.palette.success.main }} />
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: theme.palette.success.main }}>
              {activeGrace.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">متبقي لهم وقت للخروج المجاني</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" fontWeight={700} color="text.secondary">تجاوزات اليوم</Typography>
              <WarningAmberIcon sx={{ color: theme.palette.warning.main }} />
            </Stack>
            <Typography variant="h4" fontWeight={900} sx={{ my: 1, color: theme.palette.warning.main }}>
              {violations.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">تم تطبيق تعرفة الوقوف القياسية</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Active in Grace Grid */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5, mb: 4 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          المركبات النشطة داخل فترة السماح حالياً:
        </Typography>

        <Grid container spacing={2}>
          {activeGrace.map((g) => (
            <Grid item xs={12} md={4} key={g.id}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: 1 }}>
                    {g.plate}
                  </Typography>
                  <Chip
                    label={`${g.remainingMinutes} دقيقة متبقية`}
                    color={g.remainingMinutes < 5 ? 'warning' : 'primary'}
                    size="small"
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', my: 1 }}>
                  وقت الدخول: {g.entryTime}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={g.percentRemaining}
                  color={g.remainingMinutes < 5 ? 'warning' : 'primary'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Violations Table */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          سجل تجاوز فترات السماح (Grace Exceeded Records)
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اللوحة</TableCell>
                <TableCell>وقت الدخول</TableCell>
                <TableCell>نهاية مهلة السماح</TableCell>
                <TableCell>وقت الخروج الفعلي</TableCell>
                <TableCell>الرسوم الإضافية</TableCell>
                <TableCell>الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {violations.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{v.plate}</TableCell>
                  <TableCell>{v.entryTime}</TableCell>
                  <TableCell color="text.secondary">{v.graceLimit}</TableCell>
                  <TableCell>{v.exitTime}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: theme.palette.secondary.main }}>{v.penaltyFee} SAR</TableCell>
                  <TableCell>
                    <Chip label={v.status} size="small" color="secondary" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
