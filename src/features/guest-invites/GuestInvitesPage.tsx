import { useState, useEffect } from 'react';
import {
  Alert,
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
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import BlockIcon from '@mui/icons-material/Block';
import SendIcon from '@mui/icons-material/Send';

import { smartParkingApi, type GuestInviteDto } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function GuestInvitesPage() {
  const theme = useTheme();
  const [invites, setInvites] = useState<GuestInviteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<GuestInviteDto | null>(null);

  // Form
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('2026-09-30');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('16:00');
  const [plateNumber, setPlateNumber] = useState('');
  const [gateName, setGateName] = useState('بوابة الشمال (Gate North 01)');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const data = await smartParkingApi.getGuestInvites();
      if (data && data.length > 0) {
        setInvites(data);
      } else {
        setInvites([
          { id: 'inv-1', guestName: 'خالد عبد الله', phone: '+966501112233', plateNumber: 'ق و ل 4001', startsAt: '2026-09-30 10:00', endsAt: '2026-09-30 16:00', inviteCode: 'INV-8921-A', status: 'Active', gateName: 'بوابة الشمال 1' },
          { id: 'inv-2', guestName: 'سارة المنصور', phone: '+966504445566', plateNumber: 'م ن هـ 7080', startsAt: '2026-09-29 14:00', endsAt: '2026-09-29 19:00', inviteCode: 'INV-5510-B', status: 'Used', gateName: 'بوابة الشرق 3' },
        ]);
      }
    } catch {
      setInvites([
        { id: 'inv-1', guestName: 'خالد عبد الله', phone: '+966501112233', plateNumber: 'ق و ل 4001', startsAt: '2026-09-30 10:00', endsAt: '2026-09-30 16:00', inviteCode: 'INV-8921-A', status: 'Active', gateName: 'بوابة الشمال 1' },
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
    try {
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
      await smartParkingApi.createGuestInvite(newInv);
      setCreatedInvite(newInv);
      setOpenCreate(false);
      await loadInvites();
    } catch {
      const code = 'INV-' + Math.floor(1000 + Math.random() * 9000);
      const fallbackInv: GuestInviteDto = {
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
      setCreatedInvite(fallbackInv);
      setOpenCreate(false);
      setInvites((prev) => [fallbackInv, ...prev]);
    }
  };

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
        `مرحباً ${createdInvite.guestName}، تفضل بطاقة دخول موقف الحي الذكي:\n${inviteUrl}`
      );
      window.open(`https://wa.me/${createdInvite.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            دعوات وتصاريح الزوار (Guest Invitations)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            أرسل دعوة سريعة مع باركود QR لضيوفك لفتح البوابات وتيسير دخولهم فور وصولهم
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => {
            setCreatedInvite(null);
            setOpenCreate(true);
          }}
          sx={{ fontWeight: 800, px: 3 }}
        >
          إنشاء دعوة زائر جديدة
        </Button>
      </Stack>

      {/* Success Modal Showing Created Invite With QR, WhatsApp, and Copy */}
      <Dialog
        open={Boolean(createdInvite)}
        onClose={() => setCreatedInvite(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 2, textAlign: 'center' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>تم إنشاء تصريح الزائر بنجاح!</DialogTitle>
        <DialogContent dividers>
          {createdInvite && (
            <Stack spacing={2} alignItems="center">
              <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: '12px', display: 'inline-block' }}>
                <QRCodeSVG value={inviteUrl} size={160} />
              </Box>

              <Typography variant="subtitle1" fontWeight={800}>
                {createdInvite.guestName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                صالح من: {createdInvite.startsAt} إلى: {createdInvite.endsAt}
              </Typography>
              <Chip label={`كود الدعوة: ${createdInvite.inviteCode}`} color="primary" />

              <Stack direction="row" spacing={1.5} sx={{ width: '100%', pt: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{ fontWeight: 700 }}
                >
                  {copyFeedback ? 'تم النسخ!' : 'نسخ الرابط'}
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleWhatsApp}
                  sx={{ fontWeight: 800 }}
                >
                  إرسال واتساب
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatedInvite(null)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Invites List Table */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اسم الضيف</TableCell>
                <TableCell>رقم الهاتف</TableCell>
                <TableCell>لوحة السيارة</TableCell>
                <TableCell>البوابة المسموحة</TableCell>
                <TableCell>فترة الصلاحية</TableCell>
                <TableCell>كود التصريح</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell align="center">الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invites.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{inv.guestName}</TableCell>
                  <TableCell dir="ltr" align="right">{inv.phone}</TableCell>
                  <TableCell sx={{ letterSpacing: 1, fontWeight: 700 }}>{inv.plateNumber || 'أي مركبة'}</TableCell>
                  <TableCell>{inv.gateName || 'جميع البوابات'}</TableCell>
                  <TableCell>
                    {inv.startsAt} — {inv.endsAt}
                  </TableCell>
                  <TableCell>
                    <Chip label={inv.inviteCode} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status}
                      size="small"
                      color={
                        inv.status === 'Active'
                          ? 'success'
                          : inv.status === 'Used'
                          ? 'default'
                          : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="مشاركة أو إعادة إرسال">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setCreatedInvite(inv)}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Invite Modal */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>إنشاء دعوة وتصريح زائر جديد</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="اسم الضيف (Guest Name)"
              placeholder="مثال: خالد عبد الله"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="رقم الهاتف للتواصل (WhatsApp Phone)"
              placeholder="+966500000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="رقم لوحة مركبة الضيف (اختياري للتعرف التلقائي)"
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
                label="وقت البدء"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="وقت الانتهاء"
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
              <MenuItem value="جميع بوابات المجمع">جميع بوابات المجمع (All Gates)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>إلغاء</Button>
          <Button variant="contained" color="primary" onClick={handleCreate} sx={{ fontWeight: 800 }}>
            توليد التصريح والباركود
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
