import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { glassPanel, useThemeMode } from '../../app/theme';
import i18n, { persistLocale, type AppLocale } from '../../core/i18n';

export function SettingsPage() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoOpenBarriers, setAutoOpenBarriers] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [graceMinutes, setGraceMinutes] = useState(20);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Box sx={{ pb: 6, maxWidth: 800 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          إعدادات وتفضيلات المنظومة (System Settings)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          تخصيص المظهر، اللغة، التنبيهات الفورية، وإعدادات فترة السماح للمواقف
        </Typography>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 3 }}>تم حفظ الإعدادات بنجاح!</Alert>}

      <Stack spacing={3}>
        {/* Appearance & Language */}
        <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            المظهر واللغة (Appearance & Language)
          </Typography>

          <Stack spacing={2.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1" fontWeight={700}>
                  وضع المظهر (Dark / Light Theme)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  التبديل بين الوضع الليلي المظلم Mission Control والوضع النهاري المضيء
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                onClick={toggleMode}
                sx={{ fontWeight: 700 }}
              >
                {mode === 'dark' ? 'الوضع النهاري (Light)' : 'الوضع الليلي (Dark)'}
              </Button>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1" fontWeight={700}>
                  لغة الواجهة (Interface Language)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  دعم كامل للغة العربية (RTL) واللغة الإنجليزية (LTR)
                </Typography>
              </Box>

              <TextField
                select
                size="small"
                value={i18n.language.startsWith('en') ? 'en' : 'ar'}
                onChange={(e) => {
                  const loc = e.target.value as AppLocale;
                  void i18n.changeLanguage(loc);
                  persistLocale(loc);
                }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="ar">العربية (RTL)</MenuItem>
                <MenuItem value="en">English (LTR)</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </Card>

        {/* Parking & Operational Rules */}
        <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            قواعد وتشغيل المواقف (Operations Rules)
          </Typography>

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoOpenBarriers}
                  onChange={(e) => setAutoOpenBarriers(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    الفتح التلقائي للحواجز عبر LPR (Auto-Barrier Opening)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    فتح الحاجز فوراً عند تطابق اللوحة مع اشتراك نشط أو تصريح ساري المفعول
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    إشعارات الدخول والخروج الفورية
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    إرسال تنبيهات لحظية عند عبور سياراتك لبوابات المجمع
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    التنبيهات الصوتية للإنذارات الحرجة
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    إصدار صوت تحذيري عند تسجيل إنذار أمني من المستوى الحرج
                  </Typography>
                </Box>
              }
            />

            <Box sx={{ pt: 1 }}>
              <TextField
                label="فترة السماح الافتراضية (بالدقائق)"
                type="number"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
                sx={{ width: 220 }}
                helperText="المدة المسموحة للمركبة بالخروج دون احتساب رسوم"
              />
            </Box>
          </Stack>

          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ fontWeight: 800, px: 4 }}>
              حفظ التغييرات
            </Button>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}
