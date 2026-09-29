import { useState, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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

export function ForgotPasswordPage() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (email) {
      setSent(true);
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
          maxWidth: 440,
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
              استعادة كلمة المرور
            </Typography>
          </Box>
        </Stack>

        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          نسيت كلمة المرور؟
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور فوراً.
        </Typography>

        {sent ? (
          <Stack spacing={2.5}>
            <Alert severity="success">
              تم إرسال تعليمات إعادة تعيين كلمة المرور إلى <strong>{email}</strong> بنجاح! تفقد بريدك الإلكتروني.
            </Alert>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="primary"
              fullWidth
            >
              العودة لتسجيل الدخول
            </Button>
          </Stack>
        ) : (
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="البريد الإلكتروني المسجل"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                color="primary"
                sx={{ py: 1.5, fontWeight: 800 }}
              >
                إرسال رابط الاستعادة
              </Button>

              <Stack direction="row" justifyContent="center">
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  color="primary.main"
                  fontWeight={700}
                  sx={{ textDecoration: 'none' }}
                >
                  العودة لتسجيل الدخول
                </Link>
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
