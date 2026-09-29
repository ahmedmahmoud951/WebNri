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
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import { smartParkingApi, type PaymentDto } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function PaymentsPage() {
  const theme = useTheme();
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSimulate, setOpenSimulate] = useState(false);
  const [simStatus, setSimStatus] = useState<'Pending' | 'Processing' | 'Succeeded' | 'Failed' | 'Refunded'>('Succeeded');
  const [simAmount, setSimAmount] = useState('35');
  const [simMethod, setSimMethod] = useState('Apple Pay / Mada');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await smartParkingApi.getPayments();
      if (data && data.length > 0) {
        setPayments(data);
      } else {
        setPayments([
          { id: 'pay-1', amount: 35, currency: 'SAR', status: 'Succeeded', method: 'Apple Pay', createdAt: '2026-09-29 18:22', description: 'رسوم موقف - بوابة الشمال' },
          { id: 'pay-2', amount: 200, currency: 'SAR', status: 'Succeeded', method: 'Mada', createdAt: '2026-09-29 12:30', description: 'شحن رصيد المحفظة' },
          { id: 'pay-3', amount: 15, currency: 'SAR', status: 'Processing', method: 'Credit Card', createdAt: '2026-09-29 11:15', description: 'رسوم حجز مسبق' },
          { id: 'pay-4', amount: 50, currency: 'SAR', status: 'Failed', method: 'STC Pay', createdAt: '2026-09-28 20:40', description: 'رسوم موقف - رصيد غير كافي' },
          { id: 'pay-5', amount: 25, currency: 'SAR', status: 'Refunded', method: 'Apple Pay', createdAt: '2026-09-27 15:10', description: 'استرداد رسوم إلغاء حجز' },
        ]);
      }
    } catch {
      setPayments([
        { id: 'pay-1', amount: 35, currency: 'SAR', status: 'Succeeded', method: 'Apple Pay', createdAt: '2026-09-29 18:22', description: 'رسوم موقف - بوابة الشمال' },
        { id: 'pay-2', amount: 200, currency: 'SAR', status: 'Succeeded', method: 'Mada', createdAt: '2026-09-29 12:30', description: 'شحن رصيد المحفظة' },
        { id: 'pay-3', amount: 15, currency: 'SAR', status: 'Processing', method: 'Credit Card', createdAt: '2026-09-29 11:15', description: 'رسوم حجز مسبق' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSimulatePayment = async () => {
    try {
      await smartParkingApi.executeDemoPayment(Number(simAmount), simMethod, simStatus);
      setFeedback(`تمت محاكاة عملية الدفع بحالة "${simStatus}" بنجاح!`);
      setOpenSimulate(false);
      await loadPayments();
    } catch {
      // Add locally for demo
      const newPay: PaymentDto = {
        id: 'pay-' + Date.now(),
        amount: Number(simAmount),
        currency: 'SAR',
        status: simStatus,
        method: simMethod,
        createdAt: 'الآن',
        description: 'عملية دفع تجريبية محاكاة',
      };
      setPayments((prev) => [newPay, ...prev]);
      setFeedback(`تمت إضافة عملية الدفع (${simStatus}) بنجاح!`);
      setOpenSimulate(false);
    }
  };

  const getStatusChip = (st: PaymentDto['status']) => {
    switch (st) {
      case 'Succeeded':
        return <Chip icon={<CheckCircleIcon />} label="ناجحة (Succeeded)" color="success" size="small" />;
      case 'Processing':
        return <Chip icon={<HourglassEmptyIcon />} label="قيد المعالجة (Processing)" color="info" size="small" />;
      case 'Pending':
        return <Chip label="معلقة (Pending)" color="warning" size="small" />;
      case 'Failed':
        return <Chip icon={<ErrorOutlineIcon />} label="فاشلة (Failed)" color="error" size="small" />;
      case 'Refunded':
        return <Chip label="مستردة (Refunded)" color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            سجل المدفوعات والعمليات المالية (Payments Center)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            متابعة دقيقة لعمليات الدفع عبر البوابات، المحفظة، البطاقات، والاشتراكات
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          onClick={() => setOpenSimulate(true)}
          sx={{ fontWeight: 800, px: 3 }}
        >
          تنفيذ عملية سداد إلكتروني مباشر
        </Button>
      </Stack>

      {feedback && <Alert severity="info" sx={{ mb: 3 }} onClose={() => setFeedback(null)}>{feedback}</Alert>}

      {/* Payments Table */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>رقم العملية</TableCell>
                <TableCell>الوصف</TableCell>
                <TableCell>طريقة الدفع</TableCell>
                <TableCell>المبلغ</TableCell>
                <TableCell>التاريخ والوقت</TableCell>
                <TableCell>حالة الدفع</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{p.id}</TableCell>
                  <TableCell>{p.description || 'رسوم موقف ذكي'}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {p.amount} {p.currency}
                  </TableCell>
                  <TableCell color="text.secondary">{p.createdAt}</TableCell>
                  <TableCell>{getStatusChip(p.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Simulate Payment Dialog */}
      <Dialog
        open={openSimulate}
        onClose={() => setOpenSimulate(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>محاكاة حالة دفع تجريبية</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="المبلغ"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              fullWidth
              type="number"
            />

            <TextField
              select
              label="طريقة الدفع"
              value={simMethod}
              onChange={(e) => setSimMethod(e.target.value)}
              fullWidth
            >
              <MenuItem value="Apple Pay">Apple Pay</MenuItem>
              <MenuItem value="Mada">بطاقة مدى (Mada)</MenuItem>
              <MenuItem value="Credit Card">بطاقة ائتمانية (Visa / Master)</MenuItem>
              <MenuItem value="Wallet Auto-Debit">خصم تلقائي من المحفظة</MenuItem>
            </TextField>

            <TextField
              select
              label="حالة النتيجة المحاكاة"
              value={simStatus}
              onChange={(e) => setSimStatus(e.target.value as any)}
              fullWidth
            >
              <MenuItem value="Succeeded">Succeeded (ناجحة)</MenuItem>
              <MenuItem value="Processing">Processing (قيد المعالجة)</MenuItem>
              <MenuItem value="Pending">Pending (معلقة)</MenuItem>
              <MenuItem value="Failed">Failed (فاشلة)</MenuItem>
              <MenuItem value="Refunded">Refunded (مستردة)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenSimulate(false)}>إلغاء</Button>
          <Button variant="contained" color="primary" onClick={handleSimulatePayment} sx={{ fontWeight: 800 }}>
            تنفيذ المحاكاة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
