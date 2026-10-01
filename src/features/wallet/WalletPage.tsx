import React, { useState, useMemo } from 'react';
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
  Paper,
  Snackbar,
  Stack,
  Switch,
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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCardIcon from '@mui/icons-material/AddCard';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import SecurityIcon from '@mui/icons-material/Security';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SpeedIcon from '@mui/icons-material/Speed';
import ShieldIcon from '@mui/icons-material/Shield';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import NfcIcon from '@mui/icons-material/Nfc';
import BoltIcon from '@mui/icons-material/Bolt';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { glassPanel, glowPanel } from '../../app/theme';
import { QRCodeSVG } from 'qrcode.react';

// =========================================================================
// DATA MODELS
// =========================================================================

export interface WalletTransactionItem {
  id: string;
  referenceNumber: string;
  type: 'Credit' | 'Debit';
  categoryAr: 'شحن رصيد' | 'رسوم موقف' | 'شحن مركبة كهربائية' | 'حجز مسبق' | 'تسوية فترة سماح';
  titleAr: string;
  descriptionAr: string;
  amount: number;
  balanceAfter: number;
  date: string;
  paymentMethodAr: string;
  gateOrStationAr: string;
  plateNumber?: string;
  statusAr: string;
}

const INITIAL_TRANSACTIONS: WalletTransactionItem[] = [
  {
    id: 'tx-101',
    referenceNumber: 'TX-WAL-2026-90412',
    type: 'Credit',
    categoryAr: 'شحن رصيد',
    titleAr: 'إيداع وشحن فوري للمحفظة عبر بطاقة مدى',
    descriptionAr: 'شحن رصيد إلكتروني ناجح عبر مصرف الإنماء',
    amount: 250.0,
    balanceAfter: 380.0,
    date: 'اليوم • 14:35',
    paymentMethodAr: 'بطاقة مدى الرقمية (Apple Pay)',
    gateOrStationAr: 'بوابة الدفع الإلكتروني المباشر',
    statusAr: 'عملية ناجحة ومكتملة',
  },
  {
    id: 'tx-102',
    referenceNumber: 'TX-WAL-2026-89912',
    type: 'Debit',
    categoryAr: 'رسوم موقف',
    titleAr: 'خصم تلقائي لعبور بوابة الشمال 04',
    descriptionAr: 'موقف ذكي - مدة الوقوف: ساعتان و 15 دقيقة',
    amount: -25.0,
    balanceAfter: 130.0,
    date: 'أمس • 19:20',
    paymentMethodAr: 'الخصم التلقائي عبر كاميرات LPR',
    gateOrStationAr: 'بوابة الخروج الشمالية 04',
    plateNumber: 'أ ب ج 1004',
    statusAr: 'تم الخصم التلقائي وفتح الحاجز',
  },
  {
    id: 'tx-103',
    referenceNumber: 'TX-WAL-2026-88741',
    type: 'Debit',
    categoryAr: 'شحن مركبة كهربائية',
    titleAr: 'شحن كهربائي فائق السرعة 150kW',
    descriptionAr: 'تزويد طاقة 38 كيلوواط/ساعة - شاحن القبو B1',
    amount: -45.0,
    balanceAfter: 155.0,
    date: '28 سبتمبر 2026 • 17:40',
    paymentMethodAr: 'خصم ذكي من رصيد المحفظة',
    gateOrStationAr: 'محطة الشحن EV-04 (القبو الأول B1)',
    plateNumber: 'أ ب ج 1004',
    statusAr: 'عملية ناجحة ومكتملة',
  },
  {
    id: 'tx-104',
    referenceNumber: 'TX-WAL-2026-87110',
    type: 'Debit',
    categoryAr: 'حجز مسبق',
    titleAr: 'حجز خانة موقف مسبقة لكبار الضيوف',
    descriptionAr: 'حجز مؤكد في الدور الأرضي G - خانة VIP-02',
    amount: -20.0,
    balanceAfter: 200.0,
    date: '26 سبتمبر 2026 • 11:15',
    paymentMethodAr: 'خصم مباشر عند تأكيد الحجز',
    gateOrStationAr: 'منظومة الحجوزات الذكية',
    plateNumber: 'أ ب ج 1004',
    statusAr: 'حجز مؤكد ومنفذ',
  },
  {
    id: 'tx-105',
    referenceNumber: 'TX-WAL-2026-86500',
    type: 'Credit',
    categoryAr: 'شحن رصيد',
    titleAr: 'إيداع مكافأة ولاء وترويج من كايان',
    descriptionAr: 'رصيد ترحيبي مجاني لتجديد الاشتراك السنوي',
    amount: 50.0,
    balanceAfter: 220.0,
    date: '25 سبتمبر 2026 • 09:00',
    paymentMethodAr: 'حافز اشتراك سنوي بلاتيني',
    gateOrStationAr: 'إدارة العضويات والمكافآت',
    statusAr: 'مكافأة معتمدة',
  },
];

export function WalletPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Balance State
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nri_wallet_balance_v1');
      return saved ? Number(saved) : 380.0;
    } catch {
      return 380.0;
    }
  });

  // Transactions State
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>(() => {
    try {
      const saved = localStorage.getItem('nri_wallet_tx_v1');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Auto top-up switch
  const [autoTopUp, setAutoTopUp] = useState(true);

  // Top Up Modal State
  const [openTopUpModal, setOpenTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'mada' | 'apple_pay' | 'stc_pay' | 'urpay'>('mada');

  // Selected Transaction for Tax Receipt Modal
  const [selectedTxModal, setSelectedTxModal] = useState<WalletTransactionItem | null>(null);

  // Filters
  const [txFilterTab, setTxFilterTab] = useState<'ALL' | 'Credit' | 'Debit'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarNotice, setSnackbarNotice] = useState<string | null>(null);

  // Persist balance & transactions
  const saveBalanceAndTx = (newBalance: number, newTxList: WalletTransactionItem[]) => {
    setBalance(newBalance);
    setTransactions(newTxList);
    try {
      localStorage.setItem('nri_wallet_balance_v1', String(newBalance));
      localStorage.setItem('nri_wallet_tx_v1', JSON.stringify(newTxList));
    } catch {}
  };

  // Handle Top-up Submission
  const handleConfirmTopUp = () => {
    const amt = Number(topUpAmount) || 50;
    if (amt <= 0) {
      setSnackbarNotice('يرجى تحديد مبلغ شحن صحيح.');
      return;
    }

    const gatewayNameMapping = {
      mada: 'بطاقة مدى السعودية (Mada)',
      apple_pay: 'خدمة أبل باي (Apple Pay)',
      stc_pay: 'محفظة إس تي سي باي (STC Pay)',
      urpay: 'محفظة يورباي (Urpay)',
    };

    const newBalance = balance + amt;
    const newTx: WalletTransactionItem = {
      id: 'tx-' + Date.now(),
      referenceNumber: 'TX-WAL-' + Math.floor(100000 + Math.random() * 900000),
      type: 'Credit',
      categoryAr: 'شحن رصيد',
      titleAr: `شحن رصيد فوري عبر ${gatewayNameMapping[selectedPaymentGateway]}`,
      descriptionAr: 'عملية شحن معتمدة لدى البنك المركزي السعودي (SAMA)',
      amount: amt,
      balanceAfter: newBalance,
      date: 'اليوم • الآن',
      paymentMethodAr: gatewayNameMapping[selectedPaymentGateway],
      gateOrStationAr: 'بوابة الدفع الإلكتروني المباشر',
      statusAr: 'عملية ناجحة ومكتملة',
    };

    saveBalanceAndTx(newBalance, [newTx, ...transactions]);
    setSnackbarNotice(`تم شحن المحفظة بنجاح بمبلغ ${amt.toFixed(2)} ريال سعودي!`);
    setOpenTopUpModal(false);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (txFilterTab !== 'ALL' && tx.type !== txFilterTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.titleAr.toLowerCase().includes(q) ||
        tx.referenceNumber.toLowerCase().includes(q) ||
        tx.paymentMethodAr.toLowerCase().includes(q) ||
        (tx.plateNumber && tx.plateNumber.toLowerCase().includes(q))
      );
    });
  }, [transactions, txFilterTab, searchQuery]);

  // Copy wallet ID
  const handleCopyWalletId = () => {
    navigator.clipboard.writeText('SA-NRI-9842-7710-3301');
    setSnackbarNotice('تم نسخ معرف المحفظة الرقمية إلى الحافظة بنجاح.');
  };

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      {/* 1. Header Command Ribbon */}
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
                <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                  المحفظة المالية الرقمية الذكية
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  إدارة الرصيد المتاح، والشحن الفوري عبر مدى وأبل باي، والخصم التلقائي السلس عند بوابات الدخول والخروج دون توقف
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCardIcon />}
              onClick={() => setOpenTopUpModal(true)}
              sx={{
                fontWeight: 900,
                borderRadius: 3,
                px: 3,
                py: 1.2,
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              شحن الرصيد الفوري
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
                الرصيد المتاح الحالي
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: theme.palette.primary.main, my: 0.5 }}>
                {balance.toFixed(2)} ريال
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                مفعل للخصم التلقائي الفوري
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
                العبور التلقائي دون توقف
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#10B981', my: 0.5 }}>
                0.4 ثانية
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                رفع الحاجز بالتعرف على اللوحة
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
                توفير فترات السماح هذا الشهر
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#38BDF8', my: 0.5 }}>
                240.00 ريال
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                مستفاد من 20 دقيقة مجانية
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
                الفواتير الضريبية المؤرشفة
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#FBBF24', my: 0.5 }}>
                {transactions.length} فواتير ZATCA
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                إيصالات رسمية قابلة للتحميل
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Holographic Digital Wallet Card & Perks Showcase */}
      <Grid container spacing={3.5} sx={{ mb: 4 }} alignItems="stretch">
        {/* Holographic Cyber Card */}
        <Grid item xs={12} lg={5}>
          <Card
            sx={{
              height: '100%',
              borderRadius: '28px',
              p: { xs: 3, sm: 3.5 },
              color: '#FFFFFF',
              background: `linear-gradient(135deg, ${alpha('#06141D', 0.98)} 0%, ${alpha('#0F2A38', 0.95)} 50%, ${alpha('#004D40', 0.95)} 100%)`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.6)}`,
              boxShadow: `0 24px 60px ${alpha(theme.palette.primary.main, 0.3)}, inset 0 1px 2px rgba(255,255,255,0.3)`,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Top Row: Brand & Contactless Icon */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="overline" sx={{ letterSpacing: 2, color: theme.palette.primary.main, fontWeight: 900, fontSize: 13 }}>
                    مجمع كايان الذكي NRI • المحفظة المعتمدة
                  </Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                    بطاقة الرصيد والدفع اللحظي VIP
                  </Typography>
                </Box>
                <NfcIcon sx={{ color: '#FBBF24', fontSize: 36, opacity: 0.9 }} />
              </Stack>

              {/* Contactless Golden Chip */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 1.5 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 38,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #FFE082 0%, #FFB300 50%, #FF8F00 100%)',
                    border: '1px solid #FFE57F',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2px',
                    p: '4px',
                  }}
                >
                  <Box sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.5 }} />
                  <Box sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.5 }} />
                  <Box sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.5 }} />
                  <Box sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.5 }} />
                </Box>

                <Chip
                  icon={<VerifiedUserIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />}
                  label="تشفير بنكي TLS 1.3"
                  size="small"
                  sx={{
                    bgcolor: alpha('#10B981', 0.15),
                    color: '#10B981',
                    fontWeight: 800,
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                />
              </Stack>

              {/* Big Balance Number */}
              <Box sx={{ my: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  الرصيد المتاح للاستخدام الفوري
                </Typography>
                <Typography variant="h2" fontWeight={900} sx={{ color: '#FFFFFF', my: 0.5, letterSpacing: -1 }}>
                  {balance.toFixed(2)}{' '}
                  <Typography component="span" variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 800 }}>
                    ريال سعودي
                  </Typography>
                </Typography>
              </Box>

              {/* Wallet Virtual Number */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', letterSpacing: 2, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
                  SA-NRI •••• •••• 9842
                </Typography>
                <Tooltip title="نسخ رقم المحفظة">
                  <IconButton size="small" onClick={handleCopyWalletId} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {/* Bottom Row: Holder Name & Plate Linked */}
            <Box sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                    حامل المحفظة
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#FFFFFF' }}>
                    المهندس أحمد بن عبد الله الشهري
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'block' }}>
                    المركبة المرتبطة بالخصم
                  </Typography>
                  <SaudiRealisticPlate plateNumber="أ ب ج 1004" size="sm" showBolts={false} interactive={false} />
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Seamless Free-Flow Features & Auto-Topup Settings */}
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 3.5 },
              height: '100%',
              ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon sx={{ color: theme.palette.primary.main }} /> ميزة العبور التلقائي والخصم السلس دون توقف
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                عند اقتراب مركبتك من بوابات المجمع الذكي، تتعرف كاميرات LPR على لوحة المركبة وتربطها برصيد محفظتك، ليتم خصم تعرفة الوقوف ورفع الحاجز الآلي خلال 0.4 ثانية دون الحاجة لفتح النافذة أو استخدام تذاكر ورقية.
              </Typography>

              {/* Three Feature Highlight Boxes */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.08) }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: theme.palette.success.main }}>
                        سماح 20 دقيقة
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      لا يتم خصم أي مبلغ إذا خرجت المركبة ضمن فترة السماح الرسمية.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <BoltIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: theme.palette.primary.main }}>
                        شواحن EV الذكية
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      خصم تلقائي مباشر لتكلفة شحن بطارية المركبة في مواقف القبو.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <ReceiptLongIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: theme.palette.info.main }}>
                        فواتير ZATCA
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      إرسال فوري للفاتورة الضريبية برمز QR إلى تطبيقك وواتساب.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Auto-Topup Bar */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.35 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    التغذية التلقائية للرصيد (Auto Top-up)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    شحن 100 ريال تلقائياً عبر مدى عند انخفاض الرصيد عن 30 ريالاً لتفادي توقف المركبة.
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: autoTopUp ? '#10B981' : 'text.secondary' }}>
                    {autoTopUp ? 'مفعلة تلقائياً' : 'معطلة'}
                  </Typography>
                  <Switch
                    checked={autoTopUp}
                    onChange={(e) => {
                      setAutoTopUp(e.target.checked);
                      setSnackbarNotice(
                        e.target.checked
                          ? 'تم تفعيل التغذية التلقائية للمحفظة بنجاح.'
                          : 'تم إيقاف التغذية التلقائية.'
                      );
                    }}
                    color="success"
                  />
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. Transactions Ledger (سجل الحركات والعمليات المالية) */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3, borderRadius: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptLongIcon sx={{ color: theme.palette.primary.main }} /> سجل الحركات والعمليات المالية للمحفظة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              سجل تدقيق مالي معتمد لكافة الإيداعات والخصومات مع دعم استعراض الإيصال الضريبي
            </Typography>
          </Box>

          {/* Filter Tabs */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="كافة العمليات"
              clickable
              color={txFilterTab === 'ALL' ? 'primary' : 'default'}
              onClick={() => setTxFilterTab('ALL')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              icon={<ArrowDownwardIcon sx={{ fontSize: 16 }} />}
              label="عمليات الشحن والإيداع (+)"
              clickable
              color={txFilterTab === 'Credit' ? 'success' : 'default'}
              onClick={() => setTxFilterTab('Credit')}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              icon={<ArrowUpwardIcon sx={{ fontSize: 16 }} />}
              label="الخصم ورسوم المواقف (-)"
              clickable
              color={txFilterTab === 'Debit' ? 'error' : 'default'}
              onClick={() => setTxFilterTab('Debit')}
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </Stack>

        {/* Transactions Table */}
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>بيان العملية المالي</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>المرجع البنكي</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>التاريخ والوقت</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>وسيلة الدفع / البوابة</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>المبلغ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>الرصيد بعدها</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>الإجراء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((tx) => {
                const isCredit = tx.type === 'Credit';
                return (
                  <TableRow key={tx.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: isCredit ? alpha('#10B981', 0.15) : alpha(theme.palette.error.main, 0.15),
                            color: isCredit ? '#10B981' : theme.palette.error.main,
                          }}
                        >
                          {isCredit ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={800}>
                            {tx.titleAr}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tx.descriptionAr}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'monospace', color: theme.palette.primary.main, fontWeight: 700 }}>
                      {tx.referenceNumber}
                    </TableCell>

                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {tx.date}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {tx.paymentMethodAr}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tx.gateOrStationAr}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="subtitle1"
                        fontWeight={900}
                        sx={{ color: isCredit ? '#10B981' : theme.palette.text.primary }}
                      >
                        {isCredit ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} ر.س
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                      {tx.balanceAfter.toFixed(2)} ريال
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => setSelectedTxModal(tx)}
                        sx={{ fontWeight: 800, borderRadius: 2 }}
                      >
                        الإيصال
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ========================================================================= */}
      {/* 4. TOP-UP MODAL (نافذة شحن الرصيد الفوري الفاخرة)                         */}
      {/* ========================================================================= */}
      <Dialog
        open={openTopUpModal}
        onClose={() => setOpenTopUpModal(false)}
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
                شحن رصيد المحفظة الفوري
              </Typography>
            </Stack>
            <IconButton onClick={() => setOpenTopUpModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              حدد باقة الشحن السريعة أو اكتب المبلغ المراد إيداعه:
            </Typography>

            {/* Quick Amount Chips */}
            <Grid container spacing={1.5}>
              {[50, 100, 250, 500].map((amt) => (
                <Grid item xs={6} key={amt}>
                  <Box
                    onClick={() => setTopUpAmount(amt)}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: `2px solid ${topUpAmount === amt ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                      bgcolor: topUpAmount === amt ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: theme.palette.primary.main },
                    }}
                  >
                    <Typography variant="h6" fontWeight={900} sx={{ color: topUpAmount === amt ? theme.palette.primary.main : 'text.primary' }}>
                      {amt} ريال
                    </Typography>
                    {amt >= 250 && (
                      <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800, display: 'block' }}>
                        + مكافأة 20 ريال رصيد
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Custom Amount Field */}
            <TextField
              label="المبلغ المراد شحنه (ريال سعودي)"
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(Number(e.target.value))}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">ر.س</InputAdornment>,
              }}
            />

            {/* Payment Gateway Selector */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                اختر وسيلة الدفع السعودية المعتمدة:
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { id: 'mada', label: 'مدى (Mada)', desc: 'بطاقات الصراف المباشرة' },
                  { id: 'apple_pay', label: 'أبل باي (Apple Pay)', desc: 'دفع فوري باللمس' },
                  { id: 'stc_pay', label: 'إس تي سي باي (STC Pay)', desc: 'محفظة الاتصالات' },
                  { id: 'urpay', label: 'يورباي (Urpay)', desc: 'مصرف الراجحي' },
                ].map((gw) => (
                  <Grid item xs={6} key={gw.id}>
                    <Box
                      onClick={() => setSelectedPaymentGateway(gw.id as any)}
                      sx={{
                        p: 1.2,
                        borderRadius: 2.5,
                        cursor: 'pointer',
                        border: `1.5px solid ${selectedPaymentGateway === gw.id ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                        bgcolor: selectedPaymentGateway === gw.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={800}>{gw.label}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{gw.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
          <Button variant="outlined" onClick={() => setOpenTopUpModal(false)} sx={{ fontWeight: 800 }}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            onClick={handleConfirmTopUp}
            sx={{ fontWeight: 900, px: 3 }}
          >
            تأكيد الشحن الفوري الآن
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* 5. TAX INVOICE & RECEIPT MODAL (نافذة الإيصال الضريبي المعتمد ZATCA)        */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedTxModal)}
        onClose={() => setSelectedTxModal(null)}
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
        {selectedTxModal && (
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
                    الإيصال المالي والفاتورة الضريبية ZATCA
                  </Typography>
                </Stack>
                <IconButton onClick={() => setSelectedTxModal(null)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 3.5, textAlign: 'center' }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: theme.palette.primary.main, fontWeight: 900, fontSize: 13 }}>
                المملكة العربية السعودية • مجمع كايان الذكي NRI
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
                إشعار تسوية وإيصال ضريبي مبسط
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                الرقم المرجعي: {selectedTxModal.referenceNumber} • التاريخ: {selectedTxModal.date}
              </Typography>

              {/* QR Code for ZATCA Fatoora */}
              <Box sx={{ my: 2.5, display: 'inline-block', p: 1.5, bgcolor: '#fff', borderRadius: 3 }}>
                <QRCodeSVG
                  value={`https://nri.smartparking.local/invoice/${selectedTxModal.referenceNumber}`}
                  size={140}
                  level="H"
                />
              </Box>

              {/* Breakdown Matrix */}
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
                    <Typography variant="caption" color="text.secondary">بيان العملية</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedTxModal.titleAr}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">تصنيف الحركة</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedTxModal.categoryAr}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">وسيلة الدفع المعتمدة</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedTxModal.paymentMethodAr}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">الموقع أو البوابة</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedTxModal.gateOrStationAr}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={900}>المبلغ المحتسب:</Typography>
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        sx={{ color: selectedTxModal.type === 'Credit' ? '#10B981' : theme.palette.primary.main }}
                      >
                        {selectedTxModal.amount > 0 ? `+${selectedTxModal.amount.toFixed(2)}` : selectedTxModal.amount.toFixed(2)} ر.س
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, mt: 0.5, display: 'block' }}>
                      الرصيد المتبقي بالمحفظة بعد العملية: {selectedTxModal.balanceAfter.toFixed(2)} ريال سعودي
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ fontWeight: 800 }}>
                طباعة الفاتورة
              </Button>
              <Button variant="contained" color="primary" onClick={() => setSelectedTxModal(null)} sx={{ fontWeight: 900, px: 3 }}>
                إغلاق الإيصال
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

export default WalletPage;
