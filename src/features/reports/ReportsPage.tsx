import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { glassPanel, glowPanel } from '../../app/theme';

export function ReportsPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState('Today');

  const reportTabs = [
    'المواقف اليومية (Daily Parking)',
    'معدلات الإشغال (Occupancy Rates)',
    'الدخول والخروج (Entries/Exits)',
    'الإيرادات المالية (Revenue)',
    'دقة LPR والكاميرات',
    'الحجوزات والاشتراكات',
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            مركز التقارير والإحصائيات التحليلية (Analytics & Reports)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            تقارير شاملة عن أداء المواقف، التدفقات المرورية، الإيرادات، ومؤشرات الجودة
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <TextField
            select
            size="small"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="Today">اليوم (Today)</MenuItem>
            <MenuItem value="Week">هذا الأسبوع</MenuItem>
            <MenuItem value="Month">هذا الشهر</MenuItem>
            <MenuItem value="Quarter">الربع الحالي</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ fontWeight: 700 }}
          >
            طباعة
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            sx={{ fontWeight: 800 }}
          >
            تصدير CSV / PDF
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {reportTabs.map((tName, idx) => (
          <Tab key={idx} label={tName} sx={{ fontWeight: 700 }} />
        ))}
      </Tabs>

      {/* KPI Highlight Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              إجمالي الحركات المسجلة
            </Typography>
            <Typography variant="h3" fontWeight={900} sx={{ my: 1, color: theme.palette.primary.main }}>
              1,420
            </Typography>
            <Typography variant="caption" color="success.main" fontWeight={700}>
              +14% مقارنة بالأسبوع الماضي
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              متوسط مدة الوقوف
            </Typography>
            <Typography variant="h3" fontWeight={900} sx={{ my: 1 }}>
              2.4 <Typography component="span" variant="h6">ساعة</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              معدل تدوير الموقف: 3.2 سيارة/موقف
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              الإيراد المحقق
            </Typography>
            <Typography variant="h3" fontWeight={900} sx={{ my: 1, color: theme.palette.secondary.main }}>
              28,450 <Typography component="span" variant="h6">SAR</Typography>
            </Typography>
            <Typography variant="caption" color="success.main" fontWeight={700}>
              98% تم تحصيلها إلكترونياً
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              دقة التعرف LPR
            </Typography>
            <Typography variant="h3" fontWeight={900} sx={{ my: 1, color: theme.palette.success.main }}>
              98.6%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              أقل من 0.4 ثانية لقراءة اللوحة
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Chart Representation */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              توزيع حركة الدخول والخروج والإيراد اليومي
            </Typography>
            <Typography variant="caption" color="text.secondary">
              بيانات تراكمية محدثة لحظياً
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label="دخول (Entries)" color="primary" size="small" />
            <Chip label="خروج (Exits)" color="secondary" size="small" />
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 1.5, pt: 2 }}>
          {[
            { day: 'السبت', ent: 65, ext: 60 },
            { day: 'الأحد', ent: 85, ext: 82 },
            { day: 'الإثنين', ent: 92, ext: 89 },
            { day: 'الثلاثاء', ent: 88, ext: 85 },
            { day: 'الأربعاء', ent: 95, ext: 91 },
            { day: 'الخميس', ent: 100, ext: 98 },
            { day: 'الجمعة', ent: 70, ext: 68 },
          ].map((item, idx) => (
            <Box key={idx} sx={{ flex: 1, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 140, justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: '45%',
                    height: `${item.ent}%`,
                    bgcolor: theme.palette.primary.main,
                    borderRadius: '4px 4px 0 0',
                  }}
                />
                <Box
                  sx={{
                    width: '45%',
                    height: `${item.ext}%`,
                    bgcolor: theme.palette.secondary.main,
                    borderRadius: '4px 4px 0 0',
                  }}
                />
              </Box>
              <Typography variant="caption" fontWeight={700} sx={{ mt: 1, display: 'block' }}>
                {item.day}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
