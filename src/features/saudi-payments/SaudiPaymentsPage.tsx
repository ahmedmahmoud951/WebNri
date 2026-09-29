import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
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
  Switch,
  FormControlLabel,
  alpha,
  useTheme,
} from '@mui/material';

// Icons
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiIcon from '@mui/icons-material/Wifi';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { glassPanel, glowPanel } from '../../app/theme';

export interface SaudiGatewayItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  category: 'Card' | 'Wallet' | 'Bank' | 'POS';
  color: string;
  accentBg: string;
  environment: 'Production' | 'Sandbox';
  merchantId: string;
  terminalId: string;
  entityId: string;
  apiKey: string;
  webhookSecret: string;
  settlementIban: string;
  settlementBank: string;
  feePercentage: number;
  fixedFeeSar: number;
  isActive: boolean;
  isSamaCertified: boolean;
  dailyVolumeSar: number;
  transactionsCount: number;
  healthStatus: 'Healthy' | 'Degraded' | 'Offline';
  latencyMs: number;
}

const INITIAL_GATEWAYS: SaudiGatewayItem[] = [
  {
    id: 'gw-mada',
    code: 'mada',
    nameAr: 'شبكة مدى للمدفوعات السعودية',
    nameEn: 'Mada Saudi Payments Network',
    category: 'Card',
    color: '#006848',
    accentBg: 'linear-gradient(135deg, rgba(0, 104, 72, 0.4) 0%, rgba(0, 45, 98, 0.25) 100%)',
    environment: 'Production',
    merchantId: 'MADA_MID_941032',
    terminalId: 'TRM_RUH_CENTRAL_01',
    entityId: 'ENT_MADA_SAMA_KSA',
    apiKey: 'sk_live_mada_8f9a2b4c6e1d3f5a7b9c0e2d4f6a8b1c',
    webhookSecret: 'whsec_mada_live_99214488332211',
    settlementIban: 'SA44 0500 0000 0012 3456 7890',
    settlementBank: 'مصرف الإنماء',
    feePercentage: 0.80,
    fixedFeeSar: 0.00,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 86450.00,
    transactionsCount: 1420,
    healthStatus: 'Healthy',
    latencyMs: 42,
  },
  {
    id: 'gw-applepay',
    code: 'apple_pay',
    nameAr: 'أبل باي (Apple Pay السعودية)',
    nameEn: 'Apple Pay Saudi Direct Acquirer',
    category: 'Wallet',
    color: '#38BDF8',
    accentBg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(56, 189, 248, 0.25) 100%)',
    environment: 'Production',
    merchantId: 'merchant.sa.anfaq.parking.live',
    terminalId: 'TRM_APAY_KSA_01',
    entityId: 'ENT_APAY_INMA_KSA',
    apiKey: 'sk_live_apay_3d7e9b1a5c8f2e4a6d8b0c2e4f6a8b1c',
    webhookSecret: 'whsec_apay_live_44332211009988',
    settlementIban: 'SA44 0500 0000 0012 3456 7890',
    settlementBank: 'مصرف الإنماء',
    feePercentage: 0.80,
    fixedFeeSar: 0.00,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 35600.00,
    transactionsCount: 780,
    healthStatus: 'Healthy',
    latencyMs: 38,
  },
  {
    id: 'gw-stcpay',
    code: 'stc_pay',
    nameAr: 'إس تي سي باي (STC Pay)',
    nameEn: 'STC Pay Digital Wallet',
    category: 'Wallet',
    color: '#4F008C',
    accentBg: 'linear-gradient(135deg, rgba(79, 0, 140, 0.45) 0%, rgba(255, 55, 95, 0.2) 100%)',
    environment: 'Production',
    merchantId: 'STCPAY_MERCH_772109',
    terminalId: 'TRM_STCP_POS_01',
    entityId: 'ENT_STCPAY_DIRECT',
    apiKey: 'sk_live_stcpay_9c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d',
    webhookSecret: 'whsec_stcpay_live_77665544332211',
    settlementIban: 'SA03 8000 0000 0098 7654 3210',
    settlementBank: 'مصرف الراجحي',
    feePercentage: 1.20,
    fixedFeeSar: 0.50,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 17800.00,
    transactionsCount: 310,
    healthStatus: 'Healthy',
    latencyMs: 56,
  },
  {
    id: 'gw-urpay',
    code: 'urpay',
    nameAr: 'يورباي (Urpay الراجحي)',
    nameEn: 'Urpay Digital Wallet (Al Rajhi)',
    category: 'Wallet',
    color: '#00A3E0',
    accentBg: 'linear-gradient(135deg, rgba(0, 59, 113, 0.5) 0%, rgba(0, 163, 224, 0.25) 100%)',
    environment: 'Production',
    merchantId: 'URPAY_CORP_551044',
    terminalId: 'TRM_URP_GATEWAY_01',
    entityId: 'ENT_URPAY_ALRAJHI',
    apiKey: 'sk_live_urpay_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    webhookSecret: 'whsec_urpay_live_11223344556677',
    settlementIban: 'SA03 8000 0000 0098 7654 3210',
    settlementBank: 'مصرف الراجحي',
    feePercentage: 1.00,
    fixedFeeSar: 0.50,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 8470.00,
    transactionsCount: 165,
    healthStatus: 'Healthy',
    latencyMs: 49,
  },
  {
    id: 'gw-hyperpay',
    code: 'hyperpay',
    nameAr: 'بوابة هايبر باي (HyperPay)',
    nameEn: 'HyperPay Payment Gateway',
    category: 'Card',
    color: '#0284C7',
    accentBg: 'linear-gradient(135deg, rgba(2, 132, 199, 0.4) 0%, rgba(14, 165, 233, 0.2) 100%)',
    environment: 'Production',
    merchantId: 'HYPER_M_331902',
    terminalId: 'TRM_HYP_CHECKOUT',
    entityId: '8a8294174d0595bb014d05d829e701d1',
    apiKey: 'OGE4Mjk0MTc0ZDA1OTViYjAxNGQwNWQ4MjllNzAxZDF8c3lCYXRmMjJ3',
    webhookSecret: 'whsec_hyperpay_live_998877665544',
    settlementIban: 'SA12 1000 0000 0045 6789 0123',
    settlementBank: 'البنك الأهلي السعودي',
    feePercentage: 1.75,
    fixedFeeSar: 1.00,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 12400.00,
    transactionsCount: 195,
    healthStatus: 'Healthy',
    latencyMs: 65,
  },
  {
    id: 'gw-geidea',
    code: 'geidea',
    nameAr: 'جيديا للمدفوعات الرقمية (Geidea)',
    nameEn: 'Geidea POS & Digital Gateway',
    category: 'POS',
    color: '#00F0FF',
    accentBg: 'linear-gradient(135deg, rgba(0, 240, 255, 0.3) 0%, rgba(11, 18, 32, 0.7) 100%)',
    environment: 'Production',
    merchantId: 'GEIDEA_POS_662190',
    terminalId: 'TRM_GEI_LANE_04',
    entityId: 'ENT_GEIDEA_OMNI',
    apiKey: 'sk_live_geidea_4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    webhookSecret: 'whsec_geidea_live_665544332211',
    settlementIban: 'SA44 0500 0000 0012 3456 7890',
    settlementBank: 'مصرف الإنماء',
    feePercentage: 0.80,
    fixedFeeSar: 0.40,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 9850.00,
    transactionsCount: 220,
    healthStatus: 'Healthy',
    latencyMs: 44,
  },
  {
    id: 'gw-moyasar',
    code: 'moyasar',
    nameAr: 'بوابة ميسر (Moyasar)',
    nameEn: 'Moyasar Financial Gateway',
    category: 'Card',
    color: '#6366F1',
    accentBg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(79, 70, 229, 0.2) 100%)',
    environment: 'Production',
    merchantId: 'MOY_CORP_114088',
    terminalId: 'TRM_MOY_API_01',
    entityId: 'ENT_MOYASAR_KSA',
    apiKey: 'sk_live_moyasar_7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    webhookSecret: 'whsec_moyasar_live_554433221100',
    settlementIban: 'SA03 8000 0000 0098 7654 3210',
    settlementBank: 'مصرف الراجحي',
    feePercentage: 1.20,
    fixedFeeSar: 0.00,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 6200.00,
    transactionsCount: 110,
    healthStatus: 'Healthy',
    latencyMs: 51,
  },
  {
    id: 'gw-alinma',
    code: 'alinma',
    nameAr: 'مصرف الإنماء — الربط البنكي المباشر B2B',
    nameEn: 'Alinma Bank Direct Banking B2B',
    category: 'Bank',
    color: '#B45309',
    accentBg: 'linear-gradient(135deg, rgba(180, 83, 9, 0.4) 0%, rgba(217, 119, 6, 0.2) 100%)',
    environment: 'Production',
    merchantId: 'INMA_CORP_B2B_991',
    terminalId: 'API_INMA_SETTLE_01',
    entityId: 'ENT_INMA_API_PROD',
    apiKey: 'sk_live_inma_b2b_99887766554433221100aabbccddeeff',
    webhookSecret: 'whsec_inma_live_9900112233',
    settlementIban: 'SA44 0500 0000 0012 3456 7890',
    settlementBank: 'مصرف الإنماء',
    feePercentage: 0.50,
    fixedFeeSar: 0.00,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 24500.00,
    transactionsCount: 85,
    healthStatus: 'Healthy',
    latencyMs: 34,
  },
  {
    id: 'gw-alrajhi',
    code: 'alrajhi',
    nameAr: 'مصرف الراجحي — خدمات الشركات والتحصيل',
    nameEn: 'Al Rajhi Bank Corporate Collection',
    category: 'Bank',
    color: '#1D4ED8',
    accentBg: 'linear-gradient(135deg, rgba(29, 78, 216, 0.45) 0%, rgba(30, 58, 138, 0.3) 100%)',
    environment: 'Production',
    merchantId: 'RAJHI_CORP_881230',
    terminalId: 'API_RAJHI_COLL_01',
    entityId: 'ENT_RAJHI_DIRECT',
    apiKey: 'sk_live_rajhi_corp_11223344556677889900aabbccddeeff',
    webhookSecret: 'whsec_rajhi_live_8877665544',
    settlementIban: 'SA03 8000 0000 0098 7654 3210',
    settlementBank: 'مصرف الراجحي',
    feePercentage: 0.50,
    fixedFeeSar: 0.00,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 31200.00,
    transactionsCount: 140,
    healthStatus: 'Healthy',
    latencyMs: 39,
  },
  {
    id: 'gw-snb',
    code: 'snb',
    nameAr: 'البنك الأهلي السعودي (SNB — سداد)',
    nameEn: 'SNB AlAhli Sadad & Corporate Gateway',
    category: 'Bank',
    color: '#047857',
    accentBg: 'linear-gradient(135deg, rgba(4, 120, 87, 0.45) 0%, rgba(6, 95, 70, 0.3) 100%)',
    environment: 'Production',
    merchantId: 'SNB_SADAD_CORP_771',
    terminalId: 'API_SNB_SADAD_01',
    entityId: 'ENT_SNB_BILLING',
    apiKey: 'sk_live_snb_sadad_55667788990011223344aabbccddeeff',
    webhookSecret: 'whsec_snb_live_7766554433',
    settlementIban: 'SA12 1000 0000 0045 6789 0123',
    settlementBank: 'البنك الأهلي السعودي',
    feePercentage: 0.60,
    fixedFeeSar: 0.00,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 18900.00,
    transactionsCount: 95,
    healthStatus: 'Healthy',
    latencyMs: 46,
  },
];

const RECENT_TRANSACTIONS = [
  { ref: 'TX-SA-2026-94812', time: 'منذ دقيقتين', plate: 'أ ب ج 1004', gateway: 'مدى (Mada)', amount: 25.00, fee: 0.20, net: 24.80, status: 'مكتملة', auth: 'SAMA-AUTH-98412' },
  { ref: 'TX-SA-2026-94811', time: 'منذ 5 دقائق', plate: 'د هـ و 2026', gateway: 'Apple Pay', amount: 35.00, fee: 0.28, net: 34.72, status: 'مكتملة', auth: 'SAMA-AUTH-98411' },
  { ref: 'TX-SA-2026-94810', time: 'منذ 9 دقائق', plate: 'س ص ع 9999', gateway: 'STC Pay', amount: 50.00, fee: 1.10, net: 48.90, status: 'مكتملة', auth: 'SAMA-AUTH-98410' },
  { ref: 'TX-SA-2026-94809', time: 'منذ 14 دقيقة', plate: 'ر ز ط 4321', gateway: 'Urpay', amount: 15.00, fee: 0.65, net: 14.35, status: 'مكتملة', auth: 'SAMA-AUTH-98409' },
  { ref: 'TX-SA-2026-94808', time: 'منذ 18 دقيقة', plate: 'م ن هـ 7777', gateway: 'مصرف الراجحي', amount: 250.00, fee: 1.25, net: 248.75, status: 'مكتملة', auth: 'SAMA-AUTH-98408' },
  { ref: 'TX-SA-2026-94807', time: 'منذ 24 دقيقة', plate: 'ح ط ي 5555', gateway: 'جيديا (Geidea)', amount: 20.00, fee: 0.56, net: 19.44, status: 'مكتملة', auth: 'SAMA-AUTH-98407' },
  { ref: 'TX-SA-2026-94806', time: 'منذ 29 دقيقة', plate: 'ك ل م 8888', gateway: 'HyperPay', amount: 45.00, fee: 1.78, net: 43.22, status: 'مكتملة', auth: 'SAMA-AUTH-98406' },
  { ref: 'TX-SA-2026-94805', time: 'منذ 35 دقيقة', plate: 'ع ف ق 3333', gateway: 'مصرف الإنماء', amount: 700.00, fee: 3.50, net: 696.50, status: 'مكتملة', auth: 'SAMA-AUTH-98405' },
];

export function SaudiPaymentsPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [gateways, setGateways] = useState<SaudiGatewayItem[]>(() => {
    try {
      const saved = localStorage.getItem('nri_saudi_gateways_v1');
      return saved ? JSON.parse(saved) : INITIAL_GATEWAYS;
    } catch {
      return INITIAL_GATEWAYS;
    }
  });

  const [selectedGateway, setSelectedGateway] = useState<SaudiGatewayItem | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [testPingLoading, setTestPingLoading] = useState(false);
  const [testPingResult, setTestPingResult] = useState<{ success: boolean; latency: number; msg: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nri_saudi_gateways_v1', JSON.stringify(gateways));
    } catch {}
  }, [gateways]);

  const totalVolume = gateways.reduce((acc, g) => acc + (g.isActive ? g.dailyVolumeSar : 0), 0);
  const totalTx = gateways.reduce((acc, g) => acc + (g.isActive ? g.transactionsCount : 0), 0);
  const activeCount = gateways.filter((g) => g.isActive).length;

  const handleOpenConfig = (gw: SaudiGatewayItem) => {
    setSelectedGateway({ ...gw });
    setTestPingResult(null);
    setConfigModalOpen(true);
  };

  const handleSaveConfig = () => {
    if (!selectedGateway) return;
    setGateways((prev) => prev.map((g) => (g.id === selectedGateway.id ? selectedGateway : g)));
    setConfigModalOpen(false);
  };

  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g))
    );
  };

  const handleTestPing = () => {
    setTestPingLoading(true);
    setTestPingResult(null);
    setTimeout(() => {
      setTestPingLoading(false);
      setTestPingResult({
        success: true,
        latency: Math.floor(Math.random() * 25) + 32,
        msg: 'تم التحقق من مصادقة المفاتيح والاتصال المباشر بنجاح عبر بروتوكول TLS 1.3 المتوافق مع معايير البنك المركزي السعودي (SAMA).',
      });
    }, 1200);
  };

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Top Header Hero */}
      <Card
        sx={{
          mb: 3.5,
          p: 0.5,
          ...glassPanel({
            background: 'linear-gradient(135deg, rgba(10, 17, 32, 0.92) 0%, rgba(14, 24, 44, 0.82) 50%, rgba(8, 14, 26, 0.94) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 0 35px rgba(0, 240, 255, 0.12), 0 24px 50px rgba(5, 8, 17, 0.7)',
          }),
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2.5}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, #0284C7 0%, #00F0FF 100%)',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.45)',
                  }}
                >
                  <PaymentIcon sx={{ color: '#041018', fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
                    بوابات الدفع الإلكتروني والربط البنكي السعودي
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    منظومة الربط المالي المعتمدة لدى البنك المركزي السعودي (SAMA) وشركة المدفوعات السعودية (مدى)
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                icon={<VerifiedUserIcon sx={{ fontSize: '18px !important', color: '#00F0FF !important' }} />}
                label="اعتماد SAMA 100% نشط"
                sx={{
                  bgcolor: 'rgba(0, 240, 255, 0.12)',
                  color: '#38BDF8',
                  fontWeight: 700,
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  px: 1,
                  py: 2,
                }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setGateways([...INITIAL_GATEWAYS])}
                sx={{
                  color: '#CBD5E1',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                  fontWeight: 700,
                  '&:hover': { borderColor: '#38BDF8', bgcolor: 'rgba(56, 189, 248, 0.08)' },
                }}
              >
                تحديث المؤشرات
              </Button>
            </Stack>
          </Stack>

          {/* KPI Strip */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(19, 30, 50, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  حجم التحصيل اليومي المباشر
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#38BDF8' }}>
                  {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} <Typography component="span" variant="caption" sx={{ color: '#94A3B8' }}>ر.س</Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: 15 }} /> +14.2% مقارنة بالأمس
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(19, 30, 50, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  عدد العمليات المنفذة اليوم
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                  {totalTx.toLocaleString()} <Typography component="span" variant="caption" sx={{ color: '#94A3B8' }}>عملية</Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 600, display: 'block', mt: 0.5 }}>
                  متوسط الاستجابة: 44ms
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(19, 30, 50, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  البوابات والبنوك النشطة
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#34D399' }}>
                  {activeCount} <Typography component="span" variant="caption" sx={{ color: '#94A3B8' }}>من {gateways.length} بوابات</Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mt: 0.5 }}>
                  جاهزية الخدمة: 99.98%
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(19, 30, 50, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  دورة التسوية البنكية
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FBBF24' }}>
                  T+0 <Typography component="span" variant="caption" sx={{ color: '#94A3B8' }}>تسوية فورية</Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600, display: 'block', mt: 0.5 }}>
                  تحويل آلي لحسابات الإنماء والراجحي
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            fontWeight: 700,
            fontSize: '0.98rem',
            color: '#94A3B8',
            minHeight: 46,
            '&.Mui-selected': { color: '#38BDF8' },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#00F0FF',
            height: 3,
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.8)',
          },
        }}
      >
        <Tab icon={<PaymentIcon />} iconPosition="start" label="بوابات الدفع الإلكتروني (7)" />
        <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="الربط البنكي والتسويات (3)" />
        <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="سجل العمليات المالية اللحظي" />
        <Tab icon={<SecurityIcon />} iconPosition="start" label="قواعد ومعايير الامتثال (SAMA)" />
      </Tabs>

      {/* Tab 0: E-Payment Gateways */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          {gateways.map((gw) => (
            <Grid item xs={12} sm={6} md={4} key={gw.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 240ms ease',
                  ...glassPanel({
                    background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
                    border: gw.isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(148, 163, 184, 0.2)',
                    boxShadow: gw.isActive
                      ? '0 0 20px rgba(56, 189, 248, 0.12), 0 16px 36px rgba(5, 8, 17, 0.5)'
                      : '0 8px 24px rgba(5, 8, 17, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#00F0FF',
                      boxShadow: '0 0 30px rgba(0, 240, 255, 0.25), 0 20px 40px rgba(5, 8, 17, 0.6)',
                    },
                  }),
                }}
                onClick={() => handleOpenConfig(gw)}
              >
                <CardContent sx={{ p: 2.5, flex: 1 }}>
                  {/* Top Bar of Card */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip
                      size="small"
                      label={gw.category === 'Card' ? 'بطاقات مدى وائتمان' : gw.category === 'Wallet' ? 'محفظة رقمية' : gw.category === 'Bank' ? 'تحويل بنكي مباشر' : 'أجهزة نقاط البيع'}
                      sx={{
                        bgcolor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38BDF8',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                      }}
                    />
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip
                        size="small"
                        label={gw.environment === 'Production' ? 'الإنتاج الحي' : 'بيئة الاختبار'}
                        sx={{
                          bgcolor: gw.environment === 'Production' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: gw.environment === 'Production' ? '#34D399' : '#FBBF24',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                        }}
                      />
                      <Switch
                        size="small"
                        checked={gw.isActive}
                        onClick={(e) => handleToggleActive(gw.id, e)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#00F0FF' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0284C7' },
                        }}
                      />
                    </Stack>
                  </Stack>

                  {/* Gateway Title */}
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 0.5, letterSpacing: '-0.01em' }}>
                    {gw.nameAr}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
                    {gw.nameEn}
                  </Typography>

                  {/* Key Stats */}
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.65)', border: '1px solid rgba(30, 58, 95, 0.6)', mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>حجم تحصيل اليوم:</Typography>
                      <Typography variant="caption" sx={{ color: '#F8FAFC', fontWeight: 800 }}>
                        {gw.dailyVolumeSar.toLocaleString()} ر.س
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>رسوم البوابة (SAMA Cap):</Typography>
                      <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700 }}>
                        {gw.feePercentage}% {gw.fixedFeeSar > 0 && `+ ${gw.fixedFeeSar} ر.س`}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>بنك التسوية المعتمد:</Typography>
                      <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 700 }}>
                        {gw.settlementBank}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Merchant ID display */}
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LockIcon sx={{ fontSize: 13 }} /> Merchant: {gw.merchantId}
                  </Typography>
                </CardContent>

                <Divider sx={{ borderColor: 'rgba(30, 58, 95, 0.5)' }} />

                <Box sx={{ p: 1.5, px: 2.5, bgcolor: 'rgba(10, 16, 28, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: gw.healthStatus === 'Healthy' ? '#34D399' : '#FBBF24', boxShadow: `0 0 8px ${gw.healthStatus === 'Healthy' ? '#34D399' : '#FBBF24'}` }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                      استجابة {gw.latencyMs}ms
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    startIcon={<SettingsIcon />}
                    sx={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.78rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenConfig(gw);
                    }}
                  >
                    إعدادات الربط
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 1: Bank Accounts & Settlements */}
      {activeTab === 1 && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                p: 2,
                ...glassPanel({
                  background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }),
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 1 }}>
                  الحسابات البنكية المعتمدة للتسوية الآلية (Saudi Bank Accounts)
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 3 }}>
                  تتم التسوية التلقائية لرسوم المواقف المحصلة عبر مدى والبطاقات البنكية لحسابات الشركة مباشرة.
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'rgba(10, 16, 28, 0.7)', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#38BDF8' }}>
                        مصرف الإنماء (Alinma Bank) — الحساب الرئيسي للتحصيل
                      </Typography>
                      <Chip label="الحساب الافتراضي الرئيسي" size="small" sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#F8FAFC', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, mb: 0.5 }}>
                      SA44 0500 0000 0012 3456 7890
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                      اسم الحساب: شركة الأنفاق الذكية لحلول المواقف المحدودة • دورة التسوية: T+0 فورية
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'rgba(10, 16, 28, 0.7)', border: '1px solid rgba(30, 58, 95, 0.6)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#CBD5E1' }}>
                        مصرف الراجحي (Al Rajhi Bank) — حساب الاشتراكات الرقمية
                      </Typography>
                      <Chip label="نشط" size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#F8FAFC', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, mb: 0.5 }}>
                      SA03 8000 0000 0098 7654 3210
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                      اسم الحساب: شركة الأنفاق الذكية - حساب محفظة المشتركين • دورة التسوية: T+0 فورية
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'rgba(10, 16, 28, 0.7)', border: '1px solid rgba(30, 58, 95, 0.6)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#CBD5E1' }}>
                        البنك الأهلي السعودي (SNB) — حساب العمليات التشغيلية وسداد
                      </Typography>
                      <Chip label="نشط" size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#F8FAFC', fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, mb: 0.5 }}>
                      SA12 1000 0000 0045 6789 0123
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                      اسم الحساب: شركة الأنفاق الذكية - حساب سداد للمدفوعات • دورة التسوية: يومية الساعة 23:59
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2,
                ...glassPanel({
                  background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }),
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 1 }}>
                  إجراء تسوية يدوية فورية
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2.5 }}>
                  تحويل الرصيد المعلق من بوابات الدفع إلى الحساب البنكي الرئيسي دون انتظار موعد التسوية المجدولة.
                </Typography>

                <Box sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.7)', mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>الرصيد المتاح للتحويل الفوري:</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#00F0FF', my: 0.5 }}>
                    148,320.00 ر.س
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 600 }}>
                    مخصوم منه عمولات مدى وسداد
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AccountBalanceWalletIcon />}
                  sx={{
                    bgcolor: '#0284C7',
                    color: '#F8FAFC',
                    fontWeight: 800,
                    py: 1.2,
                    boxShadow: '0 0 20px rgba(2, 132, 199, 0.45)',
                    '&:hover': { bgcolor: '#0369A1' },
                  }}
                  onClick={() => alert('تم إرسال أمر التسوية الفورية إلى مصرف الإنماء بنجاح. رقم العملية: STL-2026-9901')}
                >
                  تنفيذ تسوية فورية إلى الإنماء
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Live Transaction Stream */}
      {activeTab === 2 && (
        <Card
          sx={{
            ...glassPanel({
              background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }),
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                أحدث عمليات الدفع عبر البوابات السعودية (Live Transaction Stream)
              </Typography>
              <Chip label="بث لحظي مباشر" size="small" sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontWeight: 700 }} />
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#94A3B8', fontWeight: 700, borderColor: 'rgba(30, 58, 95, 0.6)' } }}>
                    <TableCell>المرجع البنكي</TableCell>
                    <TableCell>الوقت</TableCell>
                    <TableCell>لوحة المركبة</TableCell>
                    <TableCell>بوابة الدفع</TableCell>
                    <TableCell align="right">المبلغ (SAR)</TableCell>
                    <TableCell align="right">رسوم البوابة</TableCell>
                    <TableCell align="right">صافي التسوية</TableCell>
                    <TableCell>رمز تفويض SAMA</TableCell>
                    <TableCell>الحالة</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {RECENT_TRANSACTIONS.map((row) => (
                    <TableRow key={row.ref} sx={{ '& td': { borderColor: 'rgba(30, 58, 95, 0.4)', py: 1.2 } }}>
                      <TableCell sx={{ color: '#38BDF8', fontWeight: 700, fontFamily: 'monospace' }}>{row.ref}</TableCell>
                      <TableCell sx={{ color: '#94A3B8' }}>{row.time}</TableCell>
                      <TableCell sx={{ color: '#F8FAFC', fontWeight: 700 }}>{row.plate}</TableCell>
                      <TableCell sx={{ color: '#CBD5E1', fontWeight: 600 }}>{row.gateway}</TableCell>
                      <TableCell align="right" sx={{ color: '#F8FAFC', fontWeight: 800 }}>{row.amount.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: '#FB7185' }}>-{row.fee.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: '#34D399', fontWeight: 800 }}>{row.net.toFixed(2)}</TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.auth}</TableCell>
                      <TableCell>
                        <Chip size="small" label={row.status} sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontWeight: 700, fontSize: '0.72rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: SAMA Regulatory & Compliance Rules */}
      {activeTab === 3 && (
        <Card
          sx={{
            ...glassPanel({
              background: 'linear-gradient(135deg, rgba(19, 30, 50, 0.88) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(19, 30, 50, 0.88) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }),
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 2 }}>
              معايير الامتثال المالي وقواعد التسعير والتشفير (SAMA / Mada Standards)
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.7)', border: '1px solid rgba(30, 58, 95, 0.6)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8', mb: 1 }}>
                    1. سقف عمولات شبكة مدى (SAMA Fee Caps)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.8 }}>
                    • بطاقات مدى الائتمانية والخصم المباشر: عمولة 0.80% بحد أقصى 30 ر.س للعملية الواحدة.<br />
                    • البطاقات الائتمانية الدولية (Visa / Mastercard): من 1.50% إلى 1.75% + 1 ر.س.<br />
                    • المحافظ الرقمية (Apple Pay عبر مدى): نفس سقف عمولة مدى 0.80%.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.7)', border: '1px solid rgba(30, 58, 95, 0.6)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', mb: 1 }}>
                    2. أمان التشفير والتوثيق الثنائي (3D Secure 2.0)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.8 }}>
                    • تشفير بيانات الدفع وفق بروتوكول TLS 1.3 مع شهادات تشفير بنكية متوافقة.<br />
                    • دعم كامل لـ 3DS 2.0 لتأكيد عمليات الدفع الإلكتروني برمز OTP عبر رسائل SMS البنكية.<br />
                    • نظام Tokenization لمنع تخزين أرقام البطاقات الفعلية على خوادم النظام.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.7)', border: '1px solid rgba(30, 58, 95, 0.6)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00F0FF', mb: 1 }}>
                    3. الربط مع هيئة الزكاة والضريبة والجمارك (ZATCA)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.8 }}>
                    • إصدار إيصالات وفواتير ضريبية فورية تحتوي على رمز الاستجابة السريعة (QR Fatoora).<br />
                    • احتساب ضريبة القيمة المضافة 15% تلقائياً وعزلها في بنود الفاتورة.<br />
                    • أرشفة العمليات المالية لمدة 5 سنوات لأغراض التدقيق المالي.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: '10px', bgcolor: 'rgba(10, 16, 28, 0.7)', border: '1px solid rgba(30, 58, 95, 0.6)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FBBF24', mb: 1 }}>
                    4. التسوية الفورية وتفادي المبالغ المعلقة
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.8 }}>
                    • اعتماد نظام التسوية اللحظية T+0 مع مصرف الإنماء والراجحي.<br />
                    • نظام تسوية الفروقات الآلية في حالة إلغاء الجلسات أو فترات السماح (Refund Engine).<br />
                    • تقارير مطابقة مالية يومية (Daily Reconciliation) في تمام الساعة 00:05 صباحاً.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Configuration Dialog */}
      <Dialog
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            ...glassPanel({
              background: 'linear-gradient(135deg, rgba(10, 17, 32, 0.96) 0%, rgba(14, 24, 44, 0.94) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 0 40px rgba(0, 240, 255, 0.25), 0 30px 60px rgba(5, 8, 17, 0.8)',
            }),
            borderRadius: '16px',
            color: '#F8FAFC',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, borderBottom: '1px solid rgba(30, 58, 95, 0.6)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
              إعدادات الربط المالي: {selectedGateway?.nameAr}
            </Typography>
            <Chip
              size="small"
              label={selectedGateway?.environment === 'Production' ? 'الإنتاج الفعلي (Live)' : 'بيئة الاختبار (Sandbox)'}
              sx={{
                bgcolor: selectedGateway?.environment === 'Production' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                color: selectedGateway?.environment === 'Production' ? '#34D399' : '#FBBF24',
                fontWeight: 700,
              }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          {selectedGateway && (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={3} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedGateway.environment === 'Production'}
                      onChange={(e) =>
                        setSelectedGateway({
                          ...selectedGateway,
                          environment: e.target.checked ? 'Production' : 'Sandbox',
                        })
                      }
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#00F0FF' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0284C7' },
                      }}
                    />
                  }
                  label="تفعيل بيئة الإنتاج الحية (Production Live)"
                  sx={{ '& .MuiFormControlLabel-label': { color: '#CBD5E1', fontWeight: 700 } }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedGateway.isActive}
                      onChange={(e) =>
                        setSelectedGateway({
                          ...selectedGateway,
                          isActive: e.target.checked,
                        })
                      }
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#34D399' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#059669' },
                      }}
                    />
                  }
                  label="البوابة نشطة ومتاحة للعملاء"
                  sx={{ '& .MuiFormControlLabel-label': { color: '#CBD5E1', fontWeight: 700 } }}
                />
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="معرف التاجر المعتمد (Merchant ID)"
                    value={selectedGateway.merchantId}
                    onChange={(e) => setSelectedGateway({ ...selectedGateway, merchantId: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="معرف نقطة البيع أو الجهاز (Terminal ID)"
                    value={selectedGateway.terminalId}
                    onChange={(e) => setSelectedGateway({ ...selectedGateway, terminalId: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="معرف الكيان البنكي (Entity ID)"
                    value={selectedGateway.entityId}
                    onChange={(e) => setSelectedGateway({ ...selectedGateway, entityId: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="حساب الآيبان للتسوية (Settlement IBAN)"
                    value={selectedGateway.settlementIban}
                    onChange={(e) => setSelectedGateway({ ...selectedGateway, settlementIban: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="المفتاح السري للربط (Secret API Key)"
                    value={selectedGateway.apiKey}
                    onChange={(e) => setSelectedGateway({ ...selectedGateway, apiKey: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="رمز تحقق الخطاف الإلكتروني (Webhook Secret)"
                    value={selectedGateway.webhookSecret}
                    onChange={(e) => setSelectedGateway({ ...selectedGateway, webhookSecret: e.target.value })}
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Ping Test Box */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(10, 16, 28, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8' }}>
                    فحص الاتصال اللحظي مع السيرفر البنكي (SAMA Ping)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<WifiIcon />}
                    disabled={testPingLoading}
                    onClick={handleTestPing}
                    sx={{ color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.4)', fontWeight: 700 }}
                  >
                    {testPingLoading ? 'جاري الفحص...' : 'فحص الاتصال الآن'}
                  </Button>
                </Stack>

                {testPingLoading && <LinearProgress sx={{ my: 1.5, bgcolor: 'rgba(56, 189, 248, 0.2)' }} />}

                {testPingResult && (
                  <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '8px', bgcolor: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <CheckCircleIcon sx={{ color: '#34D399', fontSize: 18 }} />
                      <Typography variant="body2" sx={{ color: '#34D399', fontWeight: 800 }}>
                        الاتصال سليم — زمن الاستجابة: {testPingResult.latency}ms (200 OK)
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                      {testPingResult.msg}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid rgba(30, 58, 95, 0.6)' }}>
          <Button onClick={() => setConfigModalOpen(false)} sx={{ color: '#94A3B8', fontWeight: 700 }}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveConfig}
            sx={{
              bgcolor: '#0284C7',
              color: '#F8FAFC',
              fontWeight: 800,
              px: 3,
              boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)',
              '&:hover': { bgcolor: '#0369A1' },
            }}
          >
            حفظ إعدادات البوابة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
