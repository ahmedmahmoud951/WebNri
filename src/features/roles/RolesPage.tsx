import {
  Box,
  Card,
  Chip,
  Grid,
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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import { glassPanel, glowPanel } from '../../app/theme';

export function RolesPage() {
  const theme = useTheme();

  const permissions = [
    { name: 'عرض لوحة التحكم والإشغال (View Dashboard)', admin: true, operator: true, security: true, resident: false },
    { name: 'التحكم المباشر في الحواجز (Open/Close Barriers)', admin: true, operator: true, security: true, resident: false },
    { name: 'إدارة الكاميرات ورصد LPR (Cameras & OCR Feed)', admin: true, operator: true, security: true, resident: false },
    { name: 'معالجة الإنذارات الأمنية (Resolve Alarms)', admin: true, operator: false, security: true, resident: false },
    { name: 'إدارة المستخدمين والأدوار (User Management)', admin: true, operator: false, security: false, resident: false },
    { name: 'تصدير التقارير المالية والإشغال (Export Reports)', admin: true, operator: true, security: false, resident: false },
    { name: 'حجز المواقف المسبقة (Reserve Spots)', admin: true, operator: true, security: false, resident: true },
    { name: 'إصدار تصاريح ودعوات الزوار (Guest Passes)', admin: true, operator: true, security: true, resident: true },
    { name: 'إدارة المركبات والبطاقة الرقمية (My Vehicles & Digital Card)', admin: true, operator: false, security: false, resident: true },
    { name: 'شحن المحفظة ودفع الرسوم (Wallet & Payments)', admin: true, operator: false, security: false, resident: true },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          مصفوفة الأدوار والصلاحيات (Roles & Permissions Matrix)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          توزيع صلاحيات الوصول والتحكم بين مختلف مستخدمي ومسؤولي النظام
        </Typography>
      </Box>

      {/* Roles Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { role: 'Admin', title: 'مدير المنظومة', color: theme.palette.error.main, desc: 'صلاحيات كاملة تشمل إدارة المستخدمين، البوابات، الإعدادات، والتقارير' },
          { role: 'Operator', title: 'مشغل العمليات', color: theme.palette.primary.main, desc: 'متابعة حركة المواقف، التحكم بالحواجز، مراقبة الكاميرات والتشغيل اليومي' },
          { role: 'Security', title: 'ضابط أمن الموقف', color: theme.palette.warning.main, desc: 'استلام التنبيهات الأمنية، معاينة الكاميرات، وتأمين البوابات والحواجز' },
          { role: 'Resident', title: 'ساكن / مواطن', color: theme.palette.success.main, desc: 'إدارة المركبات الشخصية، المحفظة، البطاقة الرقمية، والدعوات والحجوزات' },
        ].map((r, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ ...glowPanel(r.color, {}, theme.palette.mode), p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <SecurityIcon sx={{ color: r.color }} />
                <Typography variant="h6" fontWeight={800}>
                  {r.role}
                </Typography>
              </Stack>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: r.color, mb: 1 }}>
                {r.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {r.desc}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Permissions Matrix Table */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          جدول الصلاحيات التفصيلية (Permission Access Map)
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الصلاحية / الوظيفة</TableCell>
                <TableCell align="center">Admin (المدير)</TableCell>
                <TableCell align="center">Operator (المشغل)</TableCell>
                <TableCell align="center">Security (الأمن)</TableCell>
                <TableCell align="center">Resident (الساكن)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissions.map((p, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{p.name}</TableCell>
                  <TableCell align="center">
                    {p.admin ? <CheckIcon color="success" /> : <CloseIcon color="disabled" />}
                  </TableCell>
                  <TableCell align="center">
                    {p.operator ? <CheckIcon color="success" /> : <CloseIcon color="disabled" />}
                  </TableCell>
                  <TableCell align="center">
                    {p.security ? <CheckIcon color="success" /> : <CloseIcon color="disabled" />}
                  </TableCell>
                  <TableCell align="center">
                    {p.resident ? <CheckIcon color="success" /> : <CloseIcon color="disabled" />}
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
