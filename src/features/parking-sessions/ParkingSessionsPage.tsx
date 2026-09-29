import { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { glassPanel, glowPanel } from '../../app/theme';

export function ParkingSessionsPage() {
  const theme = useTheme();

  const [sessions] = useState([
    {
      id: 'sess-101',
      plate: 'أ ب ج 1004',
      vehicle: 'Toyota Land Cruiser',
      entryTime: '16:15 اليوم',
      parkingTime: '16:18 (Spot A-114)',
      exitTime: 'قيد الوقوف (Active Now)',
      duration: 'ساعتان و 12 دقيقة',
      amount: '15 SAR',
      status: 'Active',
      currentStep: 1,
    },
    {
      id: 'sess-102',
      plate: 'د هـ و 2045',
      vehicle: 'BMW X5',
      entryTime: '14:00 اليوم',
      parkingTime: '14:04 (Spot B-205)',
      exitTime: '16:30 اليوم (Gate 2)',
      duration: 'ساعتان و 30 دقيقة',
      amount: '25 SAR (مدفوعة)',
      status: 'Completed',
      currentStep: 2,
    },
    {
      id: 'sess-103',
      plate: 'س ص ع 9999',
      vehicle: 'Mercedes S-Class',
      entryTime: 'أمس 18:20',
      parkingTime: 'أمس 18:22 (VIP Spot C-01)',
      exitTime: 'أمس 21:50 (VIP Gate)',
      duration: '3 ساعات و 30 دقيقة',
      amount: '0 SAR (مشمولة بالاشتراك VIP)',
      status: 'Completed',
      currentStep: 2,
    },
  ]);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          جلسات ومسارات الوقوف (Parking Sessions Timeline)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          متابعة مراحل جلسة الوقوف خطوة بخطوة من الدخول إلى ركن السيارة والخروج الآلي
        </Typography>
      </Box>

      <Stack spacing={3}>
        {sessions.map((s) => (
          <Card
            key={s.id}
            sx={{
              ...(s.status === 'Active'
                ? glowPanel(theme.palette.primary.main, {}, theme.palette.mode)
                : glassPanel({}, theme.palette.mode)),
              p: 3,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              {/* Left Details */}
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2} alignItems="center">
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
                  <Box>
                    <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: 1.5 }}>
                      {s.plate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.vehicle}
                    </Typography>
                    <Chip
                      label={s.status === 'Active' ? 'جلسة جارية حالياً' : 'مكتملة'}
                      color={s.status === 'Active' ? 'primary' : 'default'}
                      size="small"
                      sx={{ mt: 1, fontWeight: 700 }}
                    />
                  </Box>
                </Stack>

                <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary">المدة المستغرقة:</Typography>
                  <Typography variant="body2" fontWeight={700}>{s.duration}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    التكلفة المحسوبة: <strong>{s.amount}</strong>
                  </Typography>
                </Box>
              </Grid>

              {/* Right: Step Timeline */}
              <Grid item xs={12} md={8}>
                <Stepper activeStep={s.currentStep} alternativeLabel>
                  <Step completed={true}>
                    <StepLabel>
                      <Typography variant="subtitle2" fontWeight={800}>
                        1. الدخول (Gate Entry)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.entryTime}
                      </Typography>
                    </StepLabel>
                  </Step>

                  <Step completed={s.currentStep >= 1}>
                    <StepLabel>
                      <Typography variant="subtitle2" fontWeight={800}>
                        2. ركن المركبة (Parked)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.parkingTime}
                      </Typography>
                    </StepLabel>
                  </Step>

                  <Step completed={s.currentStep >= 2}>
                    <StepLabel>
                      <Typography variant="subtitle2" fontWeight={800}>
                        3. الخروج والدفع (Exit & Paid)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.exitTime}
                      </Typography>
                    </StepLabel>
                  </Step>
                </Stepper>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
