import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { AsyncBody } from '../../app/AsyncBody';
import { PlateText } from '../../app/PlateText';
import { useInviteLookup } from '../../core/api/hooks';
import { displayPersonName, formatLocalDateTime } from '../../core/display';

export function InvitePage() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [params, setParams] = useSearchParams();
  const initial = (params.get('code') ?? '').trim();
  const [input, setInput] = useState(initial);
  const [code, setCode] = useState(initial);
  const lookup = useInviteLookup(code, code.length > 0);
  const data = lookup.data;

  const handleLookup = () => {
    const next = input.trim();
    if (!next) return;
    setCode(next);
    setParams({ code: next }, { replace: true });
  };

  const isExpired = data?.endsAt ? new Date(data.endsAt) < new Date() : false;
  const isBooked = data?.status?.toLowerCase() === 'booked' || data?.status?.toLowerCase() === 'active';

  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
        direction: isRtl ? 'rtl' : 'ltr',
        color: '#f8fafc',
      }}
    >
      {/* HEADER / VERIFY CARD */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)',
          color: '#fff',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
            }}
          >
            <Typography sx={{ fontSize: 24 }}>🎫</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Sora, Cairo, sans-serif' }}>
              {isRtl ? 'تصريح الدخول الرقمي للزائر' : 'Digital Guest Parking Pass'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {isRtl ? 'تحقق من صلاحية التصريح واستعرض رمز الـ QR للدخول من البوابات الذكية' : 'Verify pass validity and display gate QR Code'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label={isRtl ? 'كود الدعوة (Invite Code)' : 'Invite Code'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="NRI-..."
            sx={{
              bgcolor: '#0f172a',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
              '& input': { color: '#f8fafc', fontWeight: 800, fontFamily: 'monospace' },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
            }}
          />
          <Button
            variant="contained"
            onClick={handleLookup}
            disabled={!input.trim()}
            sx={{
              minWidth: 130,
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: '#fff',
              fontWeight: 800,
              borderRadius: 2,
            }}
          >
            {isRtl ? 'تحقق وعرض' : 'Verify'}
          </Button>
        </Stack>
      </Paper>

      {/* VIP PASS & QR CODE CARD */}
      {code && (
        <AsyncBody
          isLoading={lookup.isLoading}
          error={lookup.error}
          onRetry={() => void lookup.refetch()}
          isEmpty={!data}
          empty={
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#0f172a', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>🔍</Typography>
              <Typography variant="h6" sx={{ color: '#f43f5e', fontWeight: 800 }}>
                {isRtl ? 'كود الدعوة غير موجود أو منتهي الصلاحية' : 'Invite code not found or expired'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                {isRtl ? 'يرجى مراجعة المضيف أو التأكد من إدخال الكود بشكل صحيح' : 'Please check with your host or re-enter the code'}
              </Typography>
            </Paper>
          }
        >
          {data && (
            <Card
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}
            >
              {/* Pass Top Banner */}
              <Box
                sx={{
                  p: 2.5,
                  background: isExpired
                    ? 'linear-gradient(135deg, #4c0519 0%, #1e1014 100%)'
                    : 'linear-gradient(135deg, #064e3b 0%, #0b1a17 100%)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography sx={{ fontSize: 24 }}>{isExpired ? '⛔' : '🛡️'}</Typography>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#f8fafc' }}>
                      {isRtl ? 'تصريح دخول ذكي معتمد' : 'Authorized Smart Gate Pass'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {isRtl ? 'نظام المواقف وإدارة بوابات NRI' : 'NRI Smart Parking System'}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={
                    isExpired
                      ? (isRtl ? 'منتهي الصلاحية' : 'Expired')
                      : isBooked
                      ? (isRtl ? '🟢 ساري ومصرح' : '🟢 Valid & Authorized')
                      : (data.status || 'Active')
                  }
                  sx={{
                    bgcolor: isExpired ? '#f43f5e' : '#10b981',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: 12,
                    boxShadow: isExpired ? 'none' : '0 0 14px rgba(16, 185, 129, 0.5)',
                  }}
                />
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  {/* QR Code Column */}
                  <Grid item xs={12} sm={5} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#ffffff',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                        border: '3px solid #38bdf8',
                      }}
                    >
                      <QRCodeSVG
                        value={(data as any).qrPayload || data.inviteCode || code}
                        size={170}
                        level="H"
                        includeMargin={false}
                      />
                    </Box>
                    <Typography
                      sx={{
                        mt: 1.5,
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        fontSize: 18,
                        color: '#38bdf8',
                        letterSpacing: 2,
                      }}
                    >
                      {data.inviteCode ?? code}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      {isRtl ? 'امسح الرمز أمام قارئ البوابة' : 'Scan code at gate scanner'}
                    </Typography>
                  </Grid>

                  {/* Pass Details Column */}
                  <Grid item xs={12} sm={7}>
                    <Stack spacing={1.5}>
                      {data.guestName && (
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e293b' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            {isRtl ? '👤 اسم الضيف الكريم' : 'Guest Name'}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                            {displayPersonName(data.guestName)}
                          </Typography>
                        </Box>
                      )}

                      {data.plate && (
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e293b' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                            {isRtl ? '🚗 رقم لوحة المركبة المصرح لها' : 'Authorized Vehicle Plate'}
                          </Typography>
                          <PlateText>{data.plate}</PlateText>
                        </Box>
                      )}

                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#1e293b' }}>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                              {isRtl ? '⏱️ يبدأ من' : 'Valid From'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#34d399', display: 'block' }}>
                              {formatLocalDateTime(data.startsAt)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                              {isRtl ? '⌛ ينتهي في' : 'Valid Until'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#f87171', display: 'block' }}>
                              {formatLocalDateTime(data.endsAt)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.08)' }} />

                {/* Gate Pass Instructions Banner */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: 24 }}>💡</Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                    {isRtl
                      ? 'عند الوصول للموقف، ستتعرف كاميرا الذكاء الاصطناعي (LPR) على لوحة مركبتك وتفتح الحاجز تلقائياً، أو يمكنك توجيه رمز الـ QR أعلاه لقارئ البوابة الذكي.'
                      : 'Upon arrival, ANPR cameras will recognize your plate and open the barrier, or you can present this QR code to the gate optical reader.'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </AsyncBody>
      )}
    </Box>
  );
}
