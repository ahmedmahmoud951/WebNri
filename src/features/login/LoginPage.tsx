import { useState, type FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';

import { ApiError } from '../../core/api/errors';
import { useAuth } from '../../core/auth/authContext';
import i18n, { persistLocale, type AppLocale } from '../../core/i18n';
import { brandMarkTile } from '../../app/icons';
import { ICON_CATALOG } from '../../app/iconCatalog';
import { brand, glassPanel, useThemeMode } from '../../app/theme';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    nameAr: 'مدير النظام',
    username: 'admin',
    password: 'admin',
    icon: <AdminPanelSettingsIcon fontSize="small" />,
    color: '#2DD4BF',
  },
  {
    role: 'Operator',
    nameAr: 'مشغّل العمليات',
    username: 'operator',
    password: 'admin',
    icon: <SupportAgentIcon fontSize="small" />,
    color: '#60A5FA',
  },
  {
    role: 'Security',
    nameAr: 'أمن الموقف',
    username: 'security',
    password: 'admin',
    icon: <SecurityIcon fontSize="small" />,
    color: '#FBBF24',
  },
  {
    role: 'Resident',
    nameAr: 'ساكن / مواطن',
    username: 'citizen1',
    password: 'admin',
    icon: <PersonIcon fontSize="small" />,
    color: '#A78BFA',
  },
];

function loginErrorMessage(error: unknown, t: (key: string) => string): string {
  if (!(error instanceof ApiError)) return t('common.error');
  if (error.code === 'rate_limited' || error.statusCode === 429) return t('auth.rateLimited');
  if (error.code === 'unexpected' || error.statusCode === 500) {
    return error.correlationId
      ? `${t('auth.serverError')} (${error.correlationId})`
      : t('auth.serverError');
  }
  if (error.code === 'invalid_credentials' || error.statusCode === 401) {
    return t('auth.invalidCredentials');
  }
  return error.message || t('common.error');
}

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError(t('auth.required'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (caught) {
      setError(loginErrorMessage(caught, t));
    } finally {
      setSubmitting(false);
    }
  }

  const selectDemoAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Top Controls: Theme & Language */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 24,
          zIndex: 10,
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
          <IconButton
            onClick={toggleMode}
            sx={{
              ...glassPanel({}, theme.palette.mode),
              p: 1,
              color: 'text.primary',
            }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

        <TextField
          select
          size="small"
          value={i18n.language.startsWith('en') ? 'en' : 'ar'}
          onChange={(e) => {
            const loc = e.target.value as AppLocale;
            void i18n.changeLanguage(loc);
            persistLocale(loc);
          }}
          sx={{
            minWidth: 110,
            '& .MuiOutlinedInput-root': {
              ...glassPanel({}, theme.palette.mode),
              borderRadius: '12px',
            },
          }}
        >
          <MenuItem value="ar">العربية (AR)</MenuItem>
          <MenuItem value="en">English (EN)</MenuItem>
        </TextField>
      </Box>

      {/* Left Mission Control Showcase Panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { md: 6, lg: 8 },
          position: 'relative',
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {brandMarkTile(52, ICON_CATALOG.brandMark.nameAr)}
          <Box>
            <Typography sx={{ fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 800, letterSpacing: 2, fontSize: 24 }}>
              NRI Smart Parking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enterprise Mission Control & Parking Infrastructure
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ my: 6, maxWidth: 500 }}>
          <Typography
            sx={{
              fontFamily: 'Sora, Cairo, sans-serif',
              fontWeight: 800,
              fontSize: { md: '2.5rem', lg: '3.1rem' },
              lineHeight: 1.15,
              mb: 2.5,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('auth.heroTitle')}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.8, mb: 4 }}>
            {t('auth.heroBody')}
          </Typography>

          <Stack direction="row" spacing={2}>
            <Box
              sx={{
                ...glassPanel({}, theme.palette.mode),
                p: 2,
                borderRadius: '14px',
                textAlign: 'center',
                flex: 1,
              }}
            >
              <DirectionsCarIcon sx={{ color: theme.palette.primary.main, fontSize: 28, mb: 0.5 }} />
              <Typography variant="body2" fontWeight={700}>
                Live Occupancy
              </Typography>
              <Typography variant="caption" color="text.secondary">
                500 Total Slots
              </Typography>
            </Box>

            <Box
              sx={{
                ...glassPanel({}, theme.palette.mode),
                p: 2,
                borderRadius: '14px',
                textAlign: 'center',
                flex: 1,
              }}
            >
              <QrCode2Icon sx={{ color: theme.palette.secondary.main, fontSize: 28, mb: 0.5 }} />
              <Typography variant="body2" fontWeight={700}>
                Fast Gate Pass
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sub-second LPR
              </Typography>
            </Box>

            <Box
              sx={{
                ...glassPanel({}, theme.palette.mode),
                p: 2,
                borderRadius: '14px',
                textAlign: 'center',
                flex: 1,
              }}
            >
              <LocationSearchingIcon sx={{ color: '#A78BFA', fontSize: 28, mb: 0.5 }} />
              <Typography variant="body2" fontWeight={700}>
                Find My Car
              </Typography>
              <Typography variant="caption" color="text.secondary">
                3D Indoor Maps
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary">
          NRI Enterprise Smart Parking Ecosystem • v2.0 Production Demo
        </Typography>
      </Box>

      {/* Right Login Form */}
      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 3, sm: 5 } }}>
        <Box
          sx={{
            ...glassPanel({}, theme.palette.mode),
            width: '100%',
            maxWidth: 460,
            p: { xs: 3.5, sm: 5 },
          }}
        >
          <Typography variant="overline" color="primary.main" fontWeight={800}>
            {t('app.tagline')}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1, mt: 0.5 }}>
            {t('auth.loginTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.portalHint')}
          </Typography>

          {/* Demo Account Quick Selector */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
              اختر حساب تجريبي سريع (Demo Accounts):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = username === acc.username;
                return (
                  <Chip
                    key={acc.role}
                    icon={acc.icon}
                    label={`${acc.role} (${acc.nameAr})`}
                    onClick={() => selectDemoAccount(acc.username, acc.password)}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha(acc.color, 0.25) : 'transparent',
                      borderColor: acc.color,
                      color: theme.palette.text.primary,
                      fontWeight: isSelected ? 800 : 500,
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label={t('auth.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                fullWidth
                required
              />

              <TextField
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2">تذكرني (Remember me)</Typography>}
                />
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  color="primary.main"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  نسيت كلمة المرور؟
                </Link>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                color="primary"
                disabled={submitting}
                sx={{ py: 1.5, fontSize: '1.05rem', fontWeight: 800 }}
              >
                {submitting ? 'جاري التحقق...' : t('auth.submit')}
              </Button>

              <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ليس لديك حساب؟
                </Typography>
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  color="primary.main"
                  fontWeight={700}
                  sx={{ textDecoration: 'none' }}
                >
                  إنشاء حساب جديد
                </Link>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
