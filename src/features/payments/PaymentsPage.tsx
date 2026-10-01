import React, { useState, useEffect, useMemo } from 'react';
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
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
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

// Icons
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ReplayIcon from '@mui/icons-material/Replay';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import AddCardIcon from '@mui/icons-material/AddCard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { glassPanel, glowPanel } from '../../app/theme';
import { QRCodeSVG } from 'qrcode.react';

// =========================================================================
// DATA MODELS
// =========================================================================

export type PaymentTransactionStatus = 'Succeeded' | 'Processing' | 'Pending' | 'Failed' | 'Refunded';

export interface DetailedPaymentItem {
  id: string;
  referenceNumber: string;
  plateNumber: string;
  payerNameAr: string;
  descriptionAr: string;
  amount: number;
  vatAmount: number;
  subtotalAmount: number;
  currencyAr: string;
  methodAr: string;
  methodType: 'Mada' | 'ApplePay' | 'STCPay' | 'Wallet' | 'CreditCard';
  createdAt: string;
  status: PaymentTransactionStatus;
  statusAr: string;
  samaAuthCode: string;
  gateOrTerminalAr: string;
}

const INITIAL_PAYMENTS: DetailedPaymentItem[] = [
  {
    id: 'pay-101',
    referenceNumber: 'TX-PAY-2026-99410',
    plateNumber: 'أ ب ج 1004',
    payerNameAr: 'المهندس أحمد بن عبد الله الشهري',
    descriptionAr: 'رسوم موقف ذكي - بوابة الشمال 04 (ساعتان و 15 دقيقة)',
    amount: 25.0,
    vatAmount: 3.26,
    subtotalAmount: 21.74,
    currencyAr: 'ريال سعودي',
    methodAr: 'شبكة مدى السعودية (Mada)',
    methodType: 'Mada',
    createdAt: 'اليوم • 18:22',
    status: 'Succeeded',
    statusAr: 'ناجحة ومكتملة',
    samaAuthCode: 'SAMA-AUTH-98412',
    gateOrTerminalAr: 'بوابة الخروج الشمالية 04',
  },
  {
    id: 'pay-102',
    referenceNumber: 'TX-PAY-2026-99409',
    plateNumber: 'د هـ و 2026',
    payerNameAr: 'ماجد بن عثمان العتيبي',
    descriptionAr: 'شحن رصيد المحفظة الرقمية الفورية',
    amount: 200.0,
    vatAmount: 26.09,
    subtotalAmount: 173.91,
    currencyAr: 'ريال سعودي',
    methodAr: 'خدمة أبل باي (Apple Pay)',
    methodType: 'ApplePay',
    createdAt: 'اليوم • 16:45',
    status: 'Succeeded',
    statusAr: 'ناجحة ومكتملة',
    samaAuthCode: 'SAMA-AUTH-98409',
    gateOrTerminalAr: 'بوابة الدفع الإلكتروني المباشر',
  },
  {
    id: 'pay-103',
    referenceNumber: 'TX-PAY-2026-99408',
    plateNumber: 'ق و ل 4001',
    payerNameAr: 'سعادة الدكتور فهد بن عبد الرحمن السديري',
    descriptionAr: 'رسوم حجز مسبق لخانة VIP - الدور الأرضي G',
    amount: 35.0,
    vatAmount: 4.57,
    subtotalAmount: 30.43,
    currencyAr: 'ريال سعودي',
    methodAr: 'محفظة يورباي (Urpay الراجحي)',
    methodType: 'Wallet',
    createdAt: 'اليوم • 14:15',
    status: 'Succeeded',
    statusAr: 'ناجحة ومكتملة',
    samaAuthCode: 'SAMA-AUTH-98408',
    gateOrTerminalAr: 'منظومة الحجوزات الذكية',
  },
  {
    id: 'pay-104',
    referenceNumber: 'TX-PAY-2026-99390',
    plateNumber: 'س ص ع 9999',
    payerNameAr: 'إبراهيم بن صالح الغامدي',
    descriptionAr: 'رسوم شاحن مركبة كهربائية فائق السرعة EV',
    amount: 45.0,
    vatAmount: 5.87,
    subtotalAmount: 39.13,
    currencyAr: 'ريال سعودي',
    methodAr: 'خصم تلقائي من المحفظة',
    methodType: 'Wallet',
    createdAt: 'اليوم • 11:30',
    status: 'Processing',
    statusAr: 'قيد المعالجة والتحصيل البنكي',
    samaAuthCode: 'SAMA-AUTH-PENDING',
    gateOrTerminalAr: 'محطة الشحن EV-04 (القبو B1)',
  },
  {
    id: 'pay-105',
    referenceNumber: 'TX-PAY-2026-99375',
    plateNumber: 'ط ك ل 8812',
    payerNameAr: 'سلطان بن عبد الرحمن الحربي',
    descriptionAr: 'رسوم تجاوز مهلة السماح - بوابة الدخول الرئيسية',
    amount: 35.0,
    vatAmount: 4.57,
    subtotalAmount: 30.43,
    currencyAr: 'ريال سعودي',
    methodAr: 'محفظة إس تي سي باي (STC Pay)',
    methodType: 'STCPay',
    createdAt: 'اليوم • 09:10',
    status: 'Failed',
    statusAr: 'فاشلة - رصيد غير كافٍ لدى العميل',
    samaAuthCode: 'ERR-INSUFFICIENT-FUNDS',
    gateOrTerminalAr: 'بوابة الخروج الرئيسية 01',
  },
  {
    id: 'pay-106',
    referenceNumber: 'TX-PAY-2026-99210',
    plateNumber: 'م ن هـ 7080',
    payerNameAr: 'المهندس فيصل بن تركي المنصور',
    descriptionAr: 'استرداد رسوم إلغاء حجز موقف مسبق',
    amount: -25.0,
    vatAmount: -3.26,
    subtotalAmount: -21.74,
    currencyAr: 'ريال سعودي',
    methodAr: 'استرداد آلي عبر مدى (Refund)',
    methodType: 'Mada',
    createdAt: 'أمس • 21:05',
    status: 'Refunded',
    statusAr: 'مستردة بالكامل لحساب العميل',
    samaAuthCode: 'SAMA-REFUND-8891',
    gateOrTerminalAr: 'نظام التسويات الآلية للمواقف',
  },
];

export function PaymentsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Payments State persisted in localStorage
  const [payments, setPayments] = useState<DetailedPaymentItem[]>(() => {
    try {
      const saved = localStorage.getItem('nri_payments_list_v1');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentTransactionStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [openExecuteModal, setOpenExecuteModal] = useState(false);
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState<DetailedPaymentItem | null>(null);

  // Form Fields for new payment simulation
  const [formAmount, setFormAmount] = useState<number>(35);
  const [formPlate, setFormPlate] = useState('أ ب ج 1004');
  const [formPayerName, setFormPayerName] = useState('المهندس أحمد بن عبد الله الشهري');
  const [formMethod, setFormMethod] = useState<'Mada' | 'ApplePay' | 'STCPay' | 'Wallet'>('Mada');
  const [formStatus, setFormStatus] = useState<PaymentTransactionStatus>('Succeeded');
  const [formDescription, setFormDescription] = useState('رسوم موقف ذكي - بوابة الخروج السريعة');
  const [snackbarNotice, setSnackbarNotice] = useState<string | null>(null);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem('nri_payments_list_v1', JSON.stringify(payments));
    } catch {}
  }, [payments]);

  // Statistics
  const totalSuccessAmount = useMemo(() => {
    return payments
      .filter((p) => p.status === 'Succeeded')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  const successCount = useMemo(() => payments.filter((p) => p.status === 'Succeeded').length, [payments]);
  const processingCount = useMemo(() => payments.filter((p) => p.status === 'Processing' || p.status === 'Pending').length, [payments]);
  const refundedAmount = useMemo(() => {
    return payments
      .filter((p) => p.status === 'Refunded')
      .reduce((acc, p) => acc + Math.abs(p.amount), 0);
  }, [payments]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.referenceNumber.toLowerCase().includes(q) ||
        p.plateNumber.toLowerCase().includes(q) ||
        p.payerNameAr.toLowerCase().includes(q) ||
        p.descriptionAr.toLowerCase().includes(q)
      );
    });
  }, [payments, statusFilter, searchQuery]);

  // Handle Execute New Payment
  const handleExecutePayment = () => {
    if (formAmount <= 0) {
      setSnackbarNotice('يرجى تحديد مبلغ صالح للعملية.');
      return;
    }

    const methodMapping = {
      Mada: 'شبكة مدى السعودية (Mada)',
      ApplePay: 'خدمة أبل باي (Apple Pay)',
      STCPay: 'محفظة إس تي سي باي (STC Pay)',
      Wallet: 'خصم تلقائي من المحفظة',
    };

    const statusMapping: Record<PaymentTransactionStatus, string> = {
      Succeeded: 'ناجحة ومكتملة',
      Processing: 'قيد المعالجة والتحصيل البنكي',
      Pending: 'معلقة قيد التفويض',
      Failed: 'فاشلة - رصيد غير كافٍ',
      Refunded: 'مستردة بالكامل',
    };

    const subtotal = Number((formAmount / 1.15).toFixed(2));
    const vat = Number((formAmount - subtotal).toFixed(2));

    const newPayment: DetailedPaymentItem = {
      id: 'pay-' + Date.now(),
      referenceNumber: 'TX-PAY-' + Math.floor(100000 + Math.random() * 900000),
      plateNumber: formPlate.trim(),
      payerNameAr: formPayerName.trim(),
      descriptionAr: formDescription.trim(),
      amount: formAmount,
      vatAmount: vat,
      subtotalAmount: subtotal,
      currencyAr: 'ريال سعودي',
      methodAr: methodMapping[formMethod],
      methodType: formMethod,
      createdAt: 'اليوم • الآن',
      status: formStatus,
      statusAr: statusMapping[formStatus],
      samaAuthCode: formStatus === 'Succeeded' ? 'SAMA-AUTH-' + Math.floor(10000 + Math.random() * 90000) : 'ERR-FAILED',
      gateOrTerminalAr: 'بوابة الدفع الإلكتروني المباشر',
    };

    setPayments((prev) => [newPayment, ...prev]);
    setSnackbarNotice(`تم تنفيذ وتسجيل العملية المالية بقيمة ${formAmount.toFixed(2)} ريال بنجاح!`);
    setOpenExecuteModal(false);
  };

  // Status Chip Renderer
  const renderStatusChip = (st: PaymentTransactionStatus, labelAr: string) => {
    switch (st) {
      case 'Succeeded':
        return <Chip icon={<CheckCircleIcon sx={{ fontSize: 16 }} />} label={labelAr} color="success" size="small" sx={{ fontWeight: 800 }} />;
      case 'Processing':
        return <Chip icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />} label={labelAr} color="info" size="small" sx={{ fontWeight: 800 }} />;
      case 'Pending':
        return <Chip label={labelAr} color="warning" size="small" sx={{ fontWeight: 800 }} />;
      case 'Failed':
        return <Chip icon={<ErrorOutlineIcon sx={{ fontSize: 16 }} />} label={labelAr} color="error" size="small" sx={{ fontWeight: 800 }} />;
      case 'Refunded':
        return <Chip icon={<ReplayIcon sx={{ fontSize: 16 }} />} label={labelAr} color="default" size="small" sx={{ fontWeight: 800 }} />;
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      {/* 1. Top Header Command Ribbon */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha('#0F172A', 0.95)} 70%)`
            : `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.12)} 0%, #FFFFFF 85%)`,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  display: 'flex',
                }}
              >
                <PaymentIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                  مركز العمليات المالية وسجل المدفوعات
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  سجل تدقيق مالي معتمد لكافة عمليات التحصيل عبر بوابات الموقف، المحفظة الرقمية، والفوترة الضريبية ZATCA
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCardIcon />}
              onClick={() => setOpenExecuteModal(true)}
              sx={{
                fontWeight: 900,
                borderRadius: 3,
                px: 2.5,
                py: 1.2,
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              تنفيذ عملية سداد إلكتروني مباشر
            </Button>

            <Chip
              icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
              label="معتمد لدى ساما (SAMA)"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                fontWeight: 800,
                borderRadius: 2.5,
                py: 2,
              }}
            />
          </Stack>
        </Stack>

        {/* Global Financial KPI Strip */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                إجمالي المبالغ المحصلة المعتمدة
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: theme.palette.primary.main, my: 0.5 }}>
                {totalSuccessAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 15 }} /> تم التسوية بنجاح
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                العمليات الناجحة والمكتملة
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#10B981', my: 0.5 }}>
                {successCount} عملية ناجحة
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
                نسبة النجاح والقبول: 99.4%
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                عمليات قيد المعالجة
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: theme.palette.info.main, my: 0.5 }}>
                {processingCount} عملية جارية
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                تسوية وتفويض لحظي
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                المبالغ المستردة للعملاء
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#FBBF24', my: 0.5 }}>
                {refundedAmount.toFixed(2)} ريال
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                استرداد آلي عند إلغاء الحجز
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Filter & Search Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="ابحث بالرقم المرجعي، لوحة المركبة، اسم العميل، أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', md: 480 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="كافة المدفوعات"
              clickable
              color={statusFilter === 'ALL' ? 'primary' : 'default'}
              onClick={() => setStatusFilter('ALL')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
              label="ناجحة ومكتملة"
              clickable
              color={statusFilter === 'Succeeded' ? 'success' : 'default'}
              onClick={() => setStatusFilter('Succeeded')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
              label="قيد المعالجة"
              clickable
              color={statusFilter === 'Processing' ? 'info' : 'default'}
              onClick={() => setStatusFilter('Processing')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              icon={<ErrorOutlineIcon sx={{ fontSize: 16 }} />}
              label="فاشلة ومرفوضة"
              clickable
              color={statusFilter === 'Failed' ? 'error' : 'default'}
              onClick={() => setStatusFilter('Failed')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              icon={<ReplayIcon sx={{ fontSize: 16 }} />}
              label="مستردة"
              clickable
              color={statusFilter === 'Refunded' ? 'warning' : 'default'}
              onClick={() => setStatusFilter('Refunded')}
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* 3. Detailed Financial Payments Table */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3, borderRadius: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Typography variant="h6" fontWeight={900}>
            سجل العمليات المالية والتحصيل الإلكتروني ({filteredPayments.length} عملية)
          </Typography>
          <Chip label="بث وتحديث آلي لحظي" color="success" size="small" sx={{ fontWeight: 800 }} />
        </Stack>

        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>الرقم المرجعي</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>لوحة المركبة</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>بيان العملية المالي</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>وسيلة الدفع المعتمدة</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>المبلغ الإجمالي</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>التاريخ والوقت</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>حالة العملية</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>الإجراء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((pay) => (
                <TableRow key={pay.id} hover>
                  {/* Reference Number */}
                  <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 800, fontFamily: 'monospace' }}>
                    {pay.referenceNumber}
                  </TableCell>

                  {/* Plate Display */}
                  <TableCell>
                    {pay.plateNumber ? (
                      <SaudiRealisticPlate plateNumber={pay.plateNumber} size="sm" showBolts={false} interactive={false} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">بدون مركبة</Typography>
                    )}
                  </TableCell>

                  {/* Description & Payer */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={800}>
                      {pay.descriptionAr}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      العميل: {pay.payerNameAr} • {pay.gateOrTerminalAr}
                    </Typography>
                  </TableCell>

                  {/* Payment Method */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {pay.methodAr}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: 10 }}>
                      {pay.samaAuthCode}
                    </Typography>
                  </TableCell>

                  {/* Amount */}
                  <TableCell align="right">
                    <Typography
                      variant="subtitle1"
                      fontWeight={900}
                      sx={{
                        color:
                          pay.status === 'Succeeded'
                            ? theme.palette.primary.main
                            : pay.status === 'Refunded'
                            ? '#FB7185'
                            : 'text.primary',
                      }}
                    >
                      {pay.amount.toFixed(2)} {pay.currencyAr}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      شامل الضريبة 15%
                    </Typography>
                  </TableCell>

                  {/* Date */}
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13 }}>
                    {pay.createdAt}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {renderStatusChip(pay.status, pay.statusAr)}
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReceiptLongIcon />}
                      onClick={() => setSelectedInvoiceModal(pay)}
                      sx={{ fontWeight: 800, borderRadius: 2 }}
                    >
                      الفاتورة
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ========================================================================= */}
      {/* 4. EXECUTE PAYMENT SIMULATOR MODAL (تنفيذ وسداد إلكتروني مباشر)             */}
      {/* ========================================================================= */}
      <Dialog
        open={openExecuteModal}
        onClose={() => setOpenExecuteModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: isDark ? '#0B132B' : '#FFFFFF',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <AddCardIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              <Typography variant="h6" fontWeight={900}>
                تنفيذ عملية سداد إلكتروني مباشر
              </Typography>
            </Stack>
            <IconButton onClick={() => setOpenExecuteModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="المبلغ بالريال السعودي (شامل الضريبة 15%)"
              type="number"
              value={formAmount}
              onChange={(e) => setFormAmount(Number(e.target.value))}
              fullWidth
              InputProps={{ endAdornment: <InputAdornment position="end">ر.س</InputAdornment> }}
            />

            <TextField
              label="لوحة المركبة المصرحة"
              value={formPlate}
              onChange={(e) => setFormPlate(e.target.value)}
              fullWidth
              placeholder="مثال: أ ب ج 1004"
            />

            <TextField
              label="اسم العميل أو المشترك"
              value={formPayerName}
              onChange={(e) => setFormPayerName(e.target.value)}
              fullWidth
            />

            <TextField
              label="بيان ووصف العملية المالية"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="وسيلة الدفع السعودية"
              value={formMethod}
              onChange={(e) => setFormMethod(e.target.value as any)}
              fullWidth
            >
              <MenuItem value="Mada">شبكة مدى السعودية (Mada)</MenuItem>
              <MenuItem value="ApplePay">خدمة أبل باي (Apple Pay)</MenuItem>
              <MenuItem value="STCPay">محفظة إس تي سي باي (STC Pay)</MenuItem>
              <MenuItem value="Wallet">خصم تلقائي من المحفظة</MenuItem>
            </TextField>

            <TextField
              select
              label="حالة النتيجة المعتمدة"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              fullWidth
            >
              <MenuItem value="Succeeded">ناجحة ومكتملة (Succeeded)</MenuItem>
              <MenuItem value="Processing">قيد المعالجة (Processing)</MenuItem>
              <MenuItem value="Pending">معلقة قيد التفويض (Pending)</MenuItem>
              <MenuItem value="Failed">فاشلة ومرفوضة (Failed)</MenuItem>
              <MenuItem value="Refunded">مستردة للعميل (Refunded)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
          <Button variant="outlined" onClick={() => setOpenExecuteModal(false)} sx={{ fontWeight: 800 }}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            onClick={handleExecutePayment}
            sx={{ fontWeight: 900, px: 3 }}
          >
            تأكيد وقيد العملية فوراً
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* 5. TAX INVOICE & RECEIPT MODAL (نافذة الفاتورة الضريبية ZATCA)             */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedInvoiceModal)}
        onClose={() => setSelectedInvoiceModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: isDark ? '#0B132B' : '#FFFFFF',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            overflow: 'hidden',
          },
        }}
      >
        {selectedInvoiceModal && (
          <>
            <DialogTitle
              sx={{
                p: 2.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <ReceiptLongIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={900}>
                    فاتورة ضريبية مبسطة معتمدة (ZATCA e-Invoice)
                  </Typography>
                </Stack>
                <IconButton onClick={() => setSelectedInvoiceModal(null)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 3.5, textAlign: 'center' }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: theme.palette.primary.main, fontWeight: 900, fontSize: 13 }}>
                المملكة العربية السعودية • شركة مجمع كايان الذكي للمواقف
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>
                فاتورة ضريبية مبسطة
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                الرقم الضريبي للمنشأة: 310488992100003
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                الرقم المرجعي: {selectedInvoiceModal.referenceNumber} • التاريخ: {selectedInvoiceModal.createdAt}
              </Typography>

              {/* Saudi Realistic Plate */}
              {selectedInvoiceModal.plateNumber && (
                <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                  <SaudiRealisticPlate plateNumber={selectedInvoiceModal.plateNumber} size="md" showBolts={true} interactive={false} />
                </Box>
              )}

              {/* QR Code for ZATCA Fatoora */}
              <Box sx={{ my: 2, display: 'inline-block', p: 1.5, bgcolor: '#fff', borderRadius: 3 }}>
                <QRCodeSVG
                  value={`https://nri.smartparking.local/invoice/${selectedInvoiceModal.referenceNumber}`}
                  size={140}
                  level="H"
                />
              </Box>

              {/* Detailed Breakdown Matrix */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  textAlign: 'right',
                }}
              >
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">اسم العميل المفوتر له</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedInvoiceModal.payerNameAr}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">بوابة / محطة التحصيل</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedInvoiceModal.gateOrTerminalAr}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">بيان الخدمة</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedInvoiceModal.descriptionAr}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">وسيلة الدفع ورمز التفويض</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedInvoiceModal.methodAr}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {selectedInvoiceModal.samaAuthCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">حالة التحصيل</Typography>
                    <Typography variant="body2" fontWeight={900} sx={{ color: '#10B981' }}>
                      {selectedInvoiceModal.statusAr}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">المبلغ الخاضع للضريبة (غير شامل):</Typography>
                        <Typography variant="body2" fontWeight={700}>{selectedInvoiceModal.subtotalAmount.toFixed(2)} ر.س</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">ضريبة القيمة المضافة (15% VAT):</Typography>
                        <Typography variant="body2" fontWeight={700}>{selectedInvoiceModal.vatAmount.toFixed(2)} ر.س</Typography>
                      </Stack>
                      <Divider sx={{ my: 0.5 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={900}>إجمالي المبلغ المستحق والمسدد:</Typography>
                        <Typography variant="h5" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                          {selectedInvoiceModal.amount.toFixed(2)} ريال سعودي
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ fontWeight: 800 }}>
                طباعة الفاتورة الضريبية
              </Button>
              <Button variant="contained" color="primary" onClick={() => setSelectedInvoiceModal(null)} sx={{ fontWeight: 900, px: 3 }}>
                إغلاق
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Global Snackbar */}
      <Snackbar
        open={Boolean(snackbarNotice)}
        autoHideDuration={4000}
        onClose={() => setSnackbarNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarNotice(null)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 800, borderRadius: 3, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
        >
          {snackbarNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PaymentsPage;
