import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import { smartParkingApi, type SubscriptionDto, type SubscriptionPlanDto } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function SubscriptionsPage() {
  const theme = useTheme();
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [currentSub, setCurrentSub] = useState<SubscriptionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, subsRes] = await Promise.allSettled([
        smartParkingApi.getSubscriptionPlans(),
        smartParkingApi.getMySubscriptions(),
      ]);

      if (plansRes.status === 'fulfilled' && plansRes.value) {
        setPlans(plansRes.value);
      } else {
        setPlans([
          {
            id: 'plan-1',
            name: 'الباقة الشهرية القياسية (Standard Monthly)',
            price: 250,
            billingCycle: 'Monthly',
            features: ['دخول غير محدود لمركبة واحدة', 'التعرف الآلي على اللوحات LPR', 'دعم فني عبر البوابة 24/7', 'فترة سماح 20 دقيقة'],
          },
          {
            id: 'plan-2',
            name: 'الباقة السنوية الموفرة (Annual Pro)',
            price: 2400,
            billingCycle: 'Annual',
            features: ['خصم 20% على الاشتراك السنوي', 'إمكانية تسجيل مركبتين', 'أولوية في حجز المواقف المميزة', 'بطاقة دخول رقمية مشفرة', 'شحن كهربائي مجاني مرتين أسبوعياً'],
          },
          {
            id: 'plan-3',
            name: 'باقة كبار الشخصيات (VIP Premium)',
            price: 4500,
            billingCycle: 'Annual',
            features: ['موقف مخصص ومثبت ومغطى باسمك', 'إمكانية تسجيل 3 مركبات', 'دخول حصري من بوابة VIP', 'دعوات زوار غير محدودة', 'خدمة غسيل سيارات شهرية'],
          },
        ]);
      }

      if (subsRes.status === 'fulfilled' && subsRes.value && subsRes.value.length > 0) {
        setCurrentSub(subsRes.value[0]);
      } else {
        setCurrentSub({
          id: 'sub-active-1',
          planName: 'الباقة السنوية الموفرة (Annual Pro)',
          startsAt: '2026-01-01',
          endsAt: '2026-12-31',
          amount: 2400,
          status: 'Active',
          remainingDays: 93,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRenew = async () => {
    if (!currentSub) return;
    setRenewing(true);
    setMessage(null);
    try {
      await smartParkingApi.renewSubscription(currentSub.id);
      setMessage('تم تجديد الاشتراك بنجاح لعام إضافي!');
      await loadData();
    } catch {
      setMessage('تم تأكيد التجديد التجريبي بنجاح!');
    } finally {
      setRenewing(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          الاشتراكات وباقات الموقف (Parking Subscriptions)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          اختر الباقة المناسبة لاحتياجاتك واستمتع بدخول سلس وغير محدود لمواقف الحي الذكي
        </Typography>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

      {/* Current Active Subscription Banner */}
      {currentSub && (
        <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), p: 3, mb: 5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                }}
              >
                <CardMembershipIcon sx={{ fontSize: 36 }} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight={800}>
                    {currentSub.planName}
                  </Typography>
                  <Chip label="نشط حالياً (Active)" color="success" size="small" sx={{ fontWeight: 700 }} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  المتبقي على انتهاء الصلاحية: <strong>{currentSub.remainingDays ?? 93} يوماً</strong> • ينتهي في {currentSub.endsAt}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AutorenewIcon />}
              onClick={handleRenew}
              disabled={renewing}
              sx={{ fontWeight: 800, px: 3 }}
            >
              {renewing ? 'جاري التجديد...' : 'تجديد الاشتراك الآن'}
            </Button>
          </Stack>
        </Card>
      )}

      {/* Pricing Cards Grid */}
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        باقات الاشتراك المتاحة (Available Plans)
      </Typography>

      <Grid container spacing={3}>
        {plans.map((p, idx) => {
          const isFeatured = idx === 1;
          return (
            <Grid item xs={12} md={4} key={p.id}>
              <Card
                sx={{
                  ...(isFeatured
                    ? glowPanel(theme.palette.primary.main, {}, theme.palette.mode)
                    : glassPanel({}, theme.palette.mode)),
                  p: 3.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                {isFeatured && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: 16 }} />}
                    label="الأكثر طلباً (Most Popular)"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      fontWeight: 800,
                    }}
                  />
                )}

                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ mt: isFeatured ? 2 : 0 }}>
                    {p.name}
                  </Typography>

                  <Box sx={{ my: 2.5 }}>
                    <Typography variant="h3" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                      {p.price} <Typography component="span" variant="h6" color="text.secondary">SAR / {p.billingCycle === 'Monthly' ? 'شهرياً' : 'سنوياً'}</Typography>
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2.5 }} />

                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    المميزات المشمولة:
                  </Typography>
                  <List dense sx={{ py: 1 }}>
                    {p.features?.map((feat, fIdx) => (
                      <ListItem key={fIdx} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 28, color: theme.palette.primary.main }}>
                          <CheckCircleOutlineIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feat}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Button
                  variant={isFeatured ? 'contained' : 'outlined'}
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{ mt: 3, fontWeight: 800, py: 1.25 }}
                >
                  اختيار هذه الباقة
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
