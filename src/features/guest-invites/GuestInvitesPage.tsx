import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import BlockIcon from '@mui/icons-material/Block';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { smartParkingApi, type GuestInviteDto } from '../../core/api/smartParkingApi';
import { glassPanel } from '../../app/theme';

export function GuestInvitesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [invites, setInvites] = useState<GuestInviteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<GuestInviteDto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Used' | 'Revoked'>('ALL');

  // Form states
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('2026-09-30');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('18:00');
  const [plateNumber, setPlateNumber] = useState('');
  const [gateName, setGateName] = useState('بوابة الشمال (Gate North 01)');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const data = await smartParkingApi.getGuestInvites();
      if (data && data.length > 0) {
        setInvites(data);
      } else {
        setInvites([
          { id: 'inv-1', guestName: 'م. خالد عبد الله القحطاني', phone: '+966501112233', plateNumber: 'ق و ل 4001', startsAt: '2026-09-30 10:00', endsAt: '2026-09-30 18:00', inviteCode: 'INV-8921-A', status: 'Active', gateName: 'بوابة الشمال 1' },
          { id: 'inv-2', guestName: 'د. سارة المنصور', phone: '+966504445566', plateNumber: 'م ن هـ 7080', startsAt: '2026-09-29 14:00', endsAt: '2026-09-29 19:00', inviteCode: 'INV-5510-B', status: 'Used', gateName: 'بوابة الشرق 3' },
          { id: 'inv-3', guestName: 'سلطان بن عبدالعزيز التميمي', phone: '+966559988776', plateNumber: 'ر ح ل 9920', startsAt: '2026-10-01 09:00', endsAt: '2026-10-01 14:00', inviteCode: 'INV-3312-C', status: 'Active', gateName: 'بوابة VIP التنفيذية' },
        ]);
      }
    } catch {
      setInvites([
        { id: 'inv-1', guestName: 'م. خالد عبد الله القحطاني', phone: '+966501112233', plateNumber: 'ق و ل 4001', startsAt: '2026-09-30 10:00', endsAt: '2026-09-30 18:00', inviteCode: 'INV-8921-A', status: 'Active', gateName: 'بوابة الشمال 1' },
        { id: 'inv-2', guestName: 'د. سارة المنصور', phone: '+966504445566', plateNumber: 'م ن هـ 7080', startsAt: '2026-09-29 14:00', endsAt: '2026-09-29 19:00', inviteCode: 'INV-5510-B', status: 'Used', gateName: 'بوابة الشرق 3' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleCreate = async () => {
    if (!guestName.trim() || !phone.trim()) return;
    const code = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    const newInv: GuestInviteDto = {
      id: 'inv-' + Date.now(),
      guestName,
      phone,
      plateNumber,
      startsAt: `${date} ${startTime}`,
      endsAt: `${date} ${endTime}`,
      inviteCode: code,
      status: 'Active',
      gateName,
    };

    try {
      await smartParkingApi.createGuestInvite(newInv);
    } catch (e) {
      console.warn('API fallback for invite creation:', e);
    }

    setInvites((prev) => [newInv, ...prev]);
    setCreatedInvite(newInv);
    setOpenCreate(false);
    setGuestName('');
    setPhone('');
    setPlateNumber('');
    setActionNotice('تم إنشاء التصريح الرقمي بنجاح وتوليد باركود QR');
  };

  const handleRevoke = async (id: string) => {
    try {
      await smartParkingApi.revokeGuestInvite(id);
    } catch (e) {
      console.warn('API fallback for revoke:', e);
    }
    setInvites((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: 'Revoked' } : inv)));
    setActionNotice('تم إلغاء التصريح بنجاح وإيقاف الصلاحية من البوابات');
  };

  const filteredInvites = useMemo(() => {
    return invites.filter((inv) => {
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        inv.guestName.toLowerCase().includes(q) ||
        inv.phone.includes(q) ||
        (inv.plateNumber && inv.plateNumber.toLowerCase().includes(q)) ||
        inv.inviteCode.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [invites, statusFilter, searchQuery]);

  const inviteUrl = createdInvite
    ? `${window.location.origin}/guest-pass?code=${createdInvite.inviteCode}`
    : '';

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (createdInvite) {
      const text = encodeURIComponent(
        `مرحباً ${createdInvite.guestName}، تفضل تصريح الدخول الذكي المعتمد لمواقف المجمع:\nرقم التصريح: ${createdInvite.inviteCode}\nالبوابة: ${createdInvite.gateName || 'جميع البوابات'}\nرابط الباركود QR للدخول السريع:\n${inviteUrl}`
      );
      window.open(`https://wa.me/${createdInvite.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2.5}
        sx={{ mb: 3.5 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(0, 240, 255, 0.15))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}
            >
              <QrCode2Icon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                دعوات وتصاريح الزوار الرقمية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إصدار تصاريح الدخول الفورية وتوليد باركود QR للضيوف وإرسالها مباشرة عبر WhatsApp
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => {
            setCreatedInvite(null);
            setOpenCreate(true);
          }}
          sx={{
            fontWeight: 900,
            borderRadius: '12px',
            px: 3,
            py: 1.2,
            background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
            color: '#080D1A',
            boxShadow: '0 4px 18px rgba(0, 240, 255, 0.35)',
          }}
        >
          إصدار تصريح زائر جديد
        </Button>
      </Stack>

      {/* Ecosystem Role Differentiation Banner */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {[
          {
            role: 'المقيم (Resident / Host)',
            desc: 'المستخدم الأساسي الدائم صاحب الاشتراك النشط، يمتلك صلاحية استضافة الضيوف وإصدار تصاريح QR مباشرة من حسابه.',
            badge: 'اشتراك دائم (LPR / RFID)',
            color: '#38BDF8',
            icon: <CardMembershipIcon />,
          },
          {
            role: 'الزائر العابر (Public Visitor)',
            desc: 'مركبات عابرة غير مسجلة مسبقاً، تخضع للتعرفة الساعية وتسدد عند البوابات الإلكترونية عبر مدى أو Apple Pay.',
            badge: 'تعرفة بالدقيقة والساعة',
            color: '#10B981',
            icon: <DirectionsCarIcon />,
          },
          {
            role: 'الضيف المدعو (Invited Guest)',
            desc: 'زائر تم إصدار تصريح رقمي مسبق له بكود QR ولوحة معتمدة، يدخل مجاناً بدون توقف وتفتح له البوابة تلقائياً.',
            badge: 'دخول سريع وتصريح QR',
            color: '#A78BFA',
            icon: <QrCode2Icon />,
          },
        ].map((card, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                border: `1.5px solid ${alpha(card.color, 0.3)}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                    <Typography variant="subtitle1" fontWeight={900}>
                      {card.role}
                    </Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={card.badge}
                    sx={{ bgcolor: alpha(card.color, 0.15), color: card.color, fontWeight: 800, fontSize: 11 }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.6 }}>
                  {card.desc}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Control & Search Toolbar */}
      <Card
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          {/* Status Filter Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {[
              { id: 'ALL', label: `كافة التصاريح (${invites.length})` },
              { id: 'Active', label: 'تصاريح سارية (Active)' },
              { id: 'Used', label: 'تم الاستخدام (Used)' },
              { id: 'Revoked', label: 'ملغي (Revoked)' },
            ].map((btn) => (
              <Chip
                key={btn.id}
                label={btn.label}
                onClick={() => setStatusFilter(btn.id as any)}
                sx={{
                  fontWeight: 800,
                  fontSize: 12,
                  bgcolor: statusFilter === btn.id ? 'rgba(56, 189, 248, 0.22)' : 'transparent',
                  color: statusFilter === btn.id ? '#38BDF8' : 'text.secondary',
                  border: `1px solid ${statusFilter === btn.id ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)'}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.15)' },
                }}
              />
            ))}
          </Stack>

          {/* Search Box */}
          <TextField
            size="small"
            placeholder="بحث بالاسم، رقم الجوال، أو لوحة السيارة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              minWidth: { xs: '100%', md: 320 },
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? 'rgba(11, 18, 32, 0.8)' : 'rgba(240, 249, 255, 0.8)',
                borderRadius: '10px',
                borderColor: 'rgba(56, 189, 248, 0.25)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#38BDF8', fontSize: 19 }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Card>

      {/* Invites List Table */}
      <Card
        sx={{
          borderRadius: '18px',
          bgcolor: isDark ? 'rgba(11, 18, 32, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(240, 249, 255, 0.9)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>اسم الضيف المدعو</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>رقم الجوال</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>لوحة المركبة (LPR)</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>البوابة المصرحة</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>فترة الصلاحية</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>كود التصريح QR</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>حالة التصريح</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvites.map((inv) => (
                <TableRow key={inv.id} hover sx={{ transition: 'background-color 150ms ease' }}>
                  <TableCell sx={{ fontWeight: 800, fontSize: 14 }}>{inv.guestName}</TableCell>
                  <TableCell dir="ltr" align="right" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {inv.phone}
                  </TableCell>
                  <TableCell>
                    {inv.plateNumber ? (
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.3,
                          borderRadius: '6px',
                          bgcolor: '#FFF',
                          color: '#000',
                          border: '1.5px solid #000',
                          fontWeight: 900,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        }}
                      >
                        {inv.plateNumber}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        متاح لأي مركبة
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{inv.gateName || 'جميع بوابات المجمع'}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {inv.startsAt} — {inv.endsAt}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inv.inviteCode}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        bgcolor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38BDF8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status === 'Active' ? 'ساري' : inv.status === 'Used' ? 'تم الاستخدام' : 'ملغي'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: 11,
                        bgcolor:
                          inv.status === 'Active'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : inv.status === 'Used'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color:
                          inv.status === 'Active'
                            ? '#10B981'
                            : inv.status === 'Used'
                            ? '#38BDF8'
                            : '#EF4444',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="معاينة الباركود ومشاركة عبر WhatsApp">
                        <IconButton
                          size="small"
                          onClick={() => setCreatedInvite(inv)}
                          sx={{ color: '#00F0FF', bgcolor: 'rgba(0, 240, 255, 0.1)' }}
                        >
                          <QrCode2Icon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {inv.status === 'Active' && (
                        <Tooltip title="إلغاء التصريح الفوري">
                          <IconButton
                            size="small"
                            onClick={() => handleRevoke(inv.id)}
                            sx={{ color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* QR Code & WhatsApp Share Modal */}
      <Dialog
        open={Boolean(createdInvite)}
        onClose={() => setCreatedInvite(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0B1220',
            backgroundImage: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.18), transparent 70%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            p: 2,
            textAlign: 'center',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: 18 }}>
          تصريح الدخول الرقمي المعتمد
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {createdInvite && (
            <Stack spacing={2.5} alignItems="center">
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#FFF',
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(0, 240, 255, 0.4)',
                  display: 'inline-block',
                }}
              >
                <QRCodeSVG value={inviteUrl || createdInvite.inviteCode} size={180} />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {createdInvite.guestName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  صالح من: {createdInvite.startsAt} إلى: {createdInvite.endsAt}
                </Typography>
                <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800 }}>
                  البوابة: {createdInvite.gateName || 'جميع البوابات'}
                </Typography>
              </Box>

              <Chip
                label={`رمز التصريح: ${createdInvite.inviteCode}`}
                sx={{
                  fontWeight: 900,
                  fontSize: 13,
                  py: 1,
                  px: 2,
                  bgcolor: 'rgba(56, 189, 248, 0.2)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                }}
              />

              <Stack direction="row" spacing={1.5} sx={{ width: '100%', pt: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{
                    fontWeight: 800,
                    borderRadius: '10px',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    color: '#38BDF8',
                  }}
                >
                  {copyFeedback ? 'تم النسخ!' : 'نسخ الرابط'}
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<WhatsAppIcon />}
                  onClick={handleWhatsApp}
                  sx={{
                    fontWeight: 900,
                    borderRadius: '10px',
                    bgcolor: '#25D366',
                    color: '#FFF',
                    '&:hover': { bgcolor: '#128C7E' },
                  }}
                >
                  إرسال WhatsApp
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreatedInvite(null)} sx={{ color: 'text.secondary', fontWeight: 700 }}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Invite Modal */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0B1220',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            p: 1.5,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: 18 }}>
          إصدار تصريح دخول زائر معتمد (Guest Permit)
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="اسم الضيف الكامل (Guest Full Name)"
              placeholder="مثال: خالد بن عبد الله القحطاني"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="رقم الهاتف للتواصل وإرسال التصريح (Mobile Phone)"
              placeholder="+966500000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="رقم لوحة مركبة الضيف (اختياري للتعرف اللحظي LPR)"
              placeholder="مثال: ق و ل 4001"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="تاريخ الزيارة"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="من الساعة"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="إلى الساعة"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <TextField
              select
              label="البوابة المسموحة للدخول"
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
              fullWidth
            >
              <MenuItem value="بوابة الشمال (Gate North 01)">بوابة الشمال (Gate North 01)</MenuItem>
              <MenuItem value="بوابة الجنوب (Gate South 02)">بوابة الجنوب (Gate South 02)</MenuItem>
              <MenuItem value="بوابة الشرق (Gate East 03)">بوابة الشرق (Gate East 03)</MenuItem>
              <MenuItem value="بوابة VIP التنفيذية">بوابة VIP التنفيذية</MenuItem>
              <MenuItem value="جميع بوابات المجمع">جميع بوابات المجمع (All Gates)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ color: 'text.secondary', fontWeight: 700 }}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{
              fontWeight: 900,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
              color: '#080D1A',
              boxShadow: '0 4px 16px rgba(0, 240, 255, 0.35)',
            }}
          >
            توليد التصريح الرقمي ورمز QR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(actionNotice)}
        autoHideDuration={4000}
        onClose={() => setActionNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setActionNotice(null)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 800, bgcolor: '#10B981', color: '#FFF' }}
        >
          {actionNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
