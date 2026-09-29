import { useState, type FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { brandMarkTile } from '../../app/icons';
import { glassPanel } from '../../app/theme';
import axios from 'axios';
import { config } from '../../core/config';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${config.apiBase}/v1/auth/signup`, {
        name,
        username,
        email,
        phoneNumber: phone,
        password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل في إنشاء الحساب');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: { xs: 2.5, sm: 4 },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          ...glassPanel({}, theme.palette.mode),
          width: '100%',
          maxWidth: 480,
          p: { xs: 3.5, sm: 5 },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          {brandMarkTile(42)}
          <Box>
            <Typography sx={{ fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 800, fontSize: 18 }}>
              NRI Smart Parking
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إنشاء حساب ساكن / زائر جديد
            </Typography>
          </Box>
        </Stack>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          إنشاء حساب جديد (Register)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          انضم إلى منظومة الموقف الذكي لإدارة مركباتك واشتراكاتك وحجوزاتك بكل سهولة.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>تم إنشاء الحساب بنجاح! جاري تحويلك لتسجيل الدخول...</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="الاسم الكامل (Full Name)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="اسم المستخدم (Username)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="البريد الإلكتروني (Email)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="رقم الهاتف (Phone Number)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
              placeholder="+966500000000"
            />
            <TextField
              label="كلمة المرور (Password)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              color="primary"
              disabled={submitting}
              sx={{ py: 1.5, fontWeight: 800, mt: 1 }}
            >
              {submitting ? 'جاري التسجيل...' : 'تسجيل حساب جديد'}
            </Button>

            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                لديك حساب بالفعل؟
              </Typography>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                color="primary.main"
                fontWeight={700}
                sx={{ textDecoration: 'none' }}
              >
                تسجيل الدخول
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
