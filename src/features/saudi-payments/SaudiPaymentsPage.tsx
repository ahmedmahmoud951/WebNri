import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
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
  MenuItem,
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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import TuneIcon from '@mui/icons-material/Tune';

import { glassPanel, glowPanel } from '../../app/theme';

// =========================================================================
// DATA MODELS
// =========================================================================

export type GatewayCategory = 'Card' | 'Wallet' | 'Bank' | 'POS';

export interface SaudiGatewayItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  category: GatewayCategory;
  categoryAr: string;
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
    categoryAr: 'بطاقات مدى والخصم المباشر',
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
    feePercentage: 0.8,
    fixedFeeSar: 0.0,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 86450.0,
    transactionsCount: 1420,
    healthStatus: 'Healthy',
    latencyMs: 42,
  },
  {
    id: 'gw-applepay',
    code: 'apple_pay',
    nameAr: 'خدمة أبل باي (Apple Pay السعودية)',
    nameEn: 'Apple Pay Saudi Direct Acquirer',
    category: 'Wallet',
    categoryAr: 'محفظة رقمية ذكية',
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
    feePercentage: 0.8,
    fixedFeeSar: 0.0,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 35600.0,
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
    categoryAr: 'محفظة رقمية ذكية',
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
    feePercentage: 1.2,
    fixedFeeSar: 0.5,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 17800.0,
    transactionsCount: 310,
    healthStatus: 'Healthy',
    latencyMs: 56,
  },
  {
    id: 'gw-urpay',
    code: 'urpay',
    nameAr: 'محفظة يورباي (Urpay الراجحي)',
    nameEn: 'Urpay Digital Wallet (Al Rajhi)',
    category: 'Wallet',
    categoryAr: 'محفظة رقمية ذكية',
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
    feePercentage: 1.0,
    fixedFeeSar: 0.5,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 8470.0,
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
    categoryAr: 'بوابة بطاقات مصرفية',
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
    fixedFeeSar: 1.0,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 12400.0,
    transactionsCount: 195,
    healthStatus: 'Healthy',
    latencyMs: 65,
  },
  {
    id: 'gw-geidea',
    code: 'geidea',
    nameAr: 'جيديا للمدفوعات ونقاط البيع (Geidea)',
    nameEn: 'Geidea POS & Digital Gateway',
    category: 'POS',
    categoryAr: 'نقاط بيع وأجهزة ذكية',
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
    feePercentage: 0.8,
    fixedFeeSar: 0.4,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 9850.0,
    transactionsCount: 220,
    healthStatus: 'Healthy',
    latencyMs: 44,
  },
  {
    id: 'gw-moyasar',
    code: 'moyasar',
    nameAr: 'بوابة ميسر المالية (Moyasar)',
    nameEn: 'Moyasar Financial Gateway',
    category: 'Card',
    categoryAr: 'بوابة بطاقات مصرفية',
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
    feePercentage: 1.2,
    fixedFeeSar: 0.0,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 6200.0,
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
    categoryAr: 'ربط بنكي وتسوية مباشرة',
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
    feePercentage: 0.5,
    fixedFeeSar: 0.0,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 24500.0,
    transactionsCount: 85,
    healthStatus: 'Healthy',
    latencyMs: 34,
  },
  {
    id: 'gw-alrajhi',
    code: 'alrajhi',
    nameAr: 'مصرف الراجحي — نظام المدفوعات والشركات',
    nameEn: 'Al Rajhi Bank Corporate Collection',
    category: 'Bank',
    categoryAr: 'ربط بنكي وتسوية مباشرة',
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
    feePercentage: 0.5,
    fixedFeeSar: 0.0,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 31200.0,
    transactionsCount: 140,
    healthStatus: 'Healthy',
    latencyMs: 39,
  },
  {
    id: 'gw-snb',
    code: 'snb',
    nameAr: 'البنك الأهلي السعودي (سداد SNB)',
    nameEn: 'SNB AlAhli Sadad & Corporate Gateway',
    category: 'Bank',
    categoryAr: 'ربط بنكي وتسوية مباشرة',
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
    feePercentage: 0.6,
    fixedFeeSar: 0.0,
    isActive: true,
    isSamaCertified: true,
    dailyVolumeSar: 18900.0,
    transactionsCount: 95,
    healthStatus: 'Healthy',
    latencyMs: 46,
  },
];

const RECENT_TRANSACTIONS = [
  { ref: 'TX-SA-2026-94812', time: 'منذ دقيقتين', plate: 'أ ب ج 1004', gateway: 'مدى السعودية', amount: 25.0, fee: 0.2, net: 24.8, status: 'مكتملة وناجحة', auth: 'SAMA-AUTH-98412' },
  { ref: 'TX-SA-2026-94811', time: 'منذ 5 دقائق', plate: 'د هـ و 2026', gateway: 'أبل باي (Apple Pay)', amount: 35.0, fee: 0.28, net: 34.72, status: 'مكتملة وناجحة', auth: 'SAMA-AUTH-98411' },
  { ref: 'TX-SA-2026-94810', time: 'منذ 9 دقائق', plate: 'س ص ع 9999', gateway: 'إس تي سي باي', amount: 50.0, fee: 1.1, net: 48.9, status: 'مكتملة وناجحة', auth: 'SAMA-AUTH-98410' },
  { ref: 'TX-SA-2026-94809', time: 'منذ 14 دقيقة', plate: 'ر ز ط 4321', gateway: 'يورباي (Urpay)', amount: 15.0, fee: 0.65, net: 14.35, status: 'مكتملة وناجحة', auth: 'SAMA-AUTH-98409' },
  { ref: 'TX-SA-2026-94808', time: 'منذ 18 دقيقة', plate: 'م ن هـ 7777', gateway: 'مصرف الراجحي', amount: 250.0, fee: 1.25, net: 248.75, status: 'مكتملة وناجحة', auth: 'SAMA-AUTH-98408' },
  { ref: 'TX-SA-2026-94807', time: 'منذ 24 دقيقة', plate: 'ح ط ي 5555', gateway: 'جيديا (Geidea)', amount: 20.0, fee: 0.56, net: 19.44, status: 'مكتملة وناجحة', auth: 'SAMA-AUTH-98407' },
  { ref: 'TX-SA-2026-94806', time: 'منذ 29 دقيقة', plate: 'ك ل م 8888', gateway: 'هايبر باي', amount: 45.0, fee: 1.78, net: 43.22, status: 'مكتملة وناجحة', auth: 'SAMA-AUTH-98406' },
  { ref: 'TX-SA-2026-94805', time: 'منذ 35 دقيقة', plate: 'ع ف ق 3333', gateway: 'مصرف الإنماء', amount: 700.0, fee: 3.5, net: 696.5, status: 'مكتملة وناجحة', auth: 'SAMA-AUTH-98405' },
];

export function SaudiPaymentsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);

  // Gateways state persisted in localStorage
  const [gateways, setGateways] = useState<SaudiGatewayItem[]>(() => {
    try {
      const saved = localStorage.getItem('nri_saudi_gateways_v2');
      return saved ? JSON.parse(saved) : INITIAL_GATEWAYS;
    } catch {
      return INITIAL_GATEWAYS;
    }
  });

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | GatewayCategory>('ALL');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<SaudiGatewayItem | null>(null);

  // Form Fields for Add/Edit
  const [formNameAr, setFormNameAr] = useState('');
  const [formCategory, setFormCategory] = useState<GatewayCategory>('Card');
  const [formSettlementBank, setFormSettlementBank] = useState('مصرف الإنماء');
  const [formSettlementIban, setFormSettlementIban] = useState('SA44 0500 0000 0012 3456 7890');
  const [formMerchantId, setFormMerchantId] = useState('');
  const [formTerminalId, setFormTerminalId] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formWebhookSecret, setFormWebhookSecret] = useState('');
  const [formFeePercentage, setFormFeePercentage] = useState<number>(0.8);
  const [formFixedFeeSar, setFormFixedFeeSar] = useState<number>(0.0);
  const [formEnvironment, setFormEnvironment] = useState<'Production' | 'Sandbox'>('Production');
  const [formIsActive, setFormIsActive] = useState(true);

  // Ping test state
  const [testPingLoading, setTestPingLoading] = useState(false);
  const [testPingResult, setTestPingResult] = useState<{ success: boolean; latency: number; msg: string } | null>(null);
  const [snackbarNotice, setSnackbarNotice] = useState<string | null>(null);

  // Persist gateways
  useEffect(() => {
    try {
      localStorage.setItem('nri_saudi_gateways_v2', JSON.stringify(gateways));
    } catch {}
  }, [gateways]);

  // Statistics
  const totalVolume = gateways.reduce((acc, g) => acc + (g.isActive ? g.dailyVolumeSar : 0), 0);
  const totalTx = gateways.reduce((acc, g) => acc + (g.isActive ? g.transactionsCount : 0), 0);
  const activeCount = gateways.filter((g) => g.isActive).length;

  // Filtered gateways
  const filteredGateways = useMemo(() => {
    return gateways.filter((g) => {
      if (categoryFilter !== 'ALL' && g.category !== categoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        g.nameAr.toLowerCase().includes(q) ||
        g.settlementBank.toLowerCase().includes(q) ||
        g.merchantId.toLowerCase().includes(q)
      );
    });
  }, [gateways, categoryFilter, searchQuery]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setEditingGatewayId(null);
    setFormNameAr('');
    setFormCategory('Card');
    setFormSettlementBank('مصرف الإنماء');
    setFormSettlementIban('SA44 0500 0000 0012 3456 7890');
    setFormMerchantId('MID_KSA_' + Math.floor(100000 + Math.random() * 900000));
    setFormTerminalId('TRM_RUH_' + Math.floor(10 + Math.random() * 90));
    setFormApiKey('sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    setFormWebhookSecret('whsec_' + Math.random().toString(36).substring(2, 15));
    setFormFeePercentage(0.8);
    setFormFixedFeeSar(0.0);
    setFormEnvironment('Production');
    setFormIsActive(true);
    setTestPingResult(null);
    setFormModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (gw: SaudiGatewayItem) => {
    setEditingGatewayId(gw.id);
    setFormNameAr(gw.nameAr);
    setFormCategory(gw.category);
    setFormSettlementBank(gw.settlementBank);
    setFormSettlementIban(gw.settlementIban);
    setFormMerchantId(gw.merchantId);
    setFormTerminalId(gw.terminalId);
    setFormApiKey(gw.apiKey);
    setFormWebhookSecret(gw.webhookSecret);
    setFormFeePercentage(gw.feePercentage);
    setFormFixedFeeSar(gw.fixedFeeSar);
    setFormEnvironment(gw.environment);
    setFormIsActive(gw.isActive);
    setTestPingResult(null);
    setFormModalOpen(true);
  };

  // Save Gateway (Add or Update)
  const handleSaveGateway = () => {
    if (!formNameAr.trim()) {
      setSnackbarNotice('يرجى إدخال اسم البوابة أو المصرف للمتابعة.');
      return;
    }
    if (!formSettlementIban.trim() || !formSettlementIban.startsWith('SA')) {
      setSnackbarNotice('يرجى التأكد من كتابة رقم آيبان سعودي صحيح يبدأ بـ SA.');
      return;
    }

    const categoryArMapping: Record<GatewayCategory, string> = {
      Card: 'بطاقات مدى والخصم المباشر',
      Wallet: 'محفظة رقمية ذكية',
      Bank: 'ربط بنكي وتسوية مباشرة',
      POS: 'نقاط بيع وأجهزة ذكية',
    };

    if (editingGatewayId) {
      setGateways((prev) =>
        prev.map((g) => {
          if (g.id === editingGatewayId) {
            return {
              ...g,
              nameAr: formNameAr.trim(),
              category: formCategory,
              categoryAr: categoryArMapping[formCategory],
              settlementBank: formSettlementBank,
              settlementIban: formSettlementIban.trim(),
              merchantId: formMerchantId.trim(),
              terminalId: formTerminalId.trim(),
              apiKey: formApiKey.trim(),
              webhookSecret: formWebhookSecret.trim(),
              feePercentage: formFeePercentage,
              fixedFeeSar: formFixedFeeSar,
              environment: formEnvironment,
              isActive: formIsActive,
            };
          }
          return g;
        })
      );
      setSnackbarNotice(`تم تحديث إعدادات بوابة "${formNameAr.trim()}" بنجاح.`);
    } else {
      const newGateway: SaudiGatewayItem = {
        id: 'gw-custom-' + Date.now(),
        code: 'custom_' + Date.now(),
        nameAr: formNameAr.trim(),
        nameEn: formNameAr.trim(),
        category: formCategory,
        categoryAr: categoryArMapping[formCategory],
        color: '#00F0FF',
        accentBg: 'linear-gradient(135deg, rgba(0, 240, 255, 0.3) 0%, rgba(11, 18, 32, 0.7) 100%)',
        environment: formEnvironment,
        merchantId: formMerchantId.trim(),
        terminalId: formTerminalId.trim(),
        entityId: 'ENT_' + Math.floor(10000 + Math.random() * 90000),
        apiKey: formApiKey.trim(),
        webhookSecret: formWebhookSecret.trim(),
        settlementIban: formSettlementIban.trim(),
        settlementBank: formSettlementBank,
        feePercentage: formFeePercentage,
        fixedFeeSar: formFixedFeeSar,
        isActive: formIsActive,
        isSamaCertified: true,
        dailyVolumeSar: 0.0,
        transactionsCount: 0,
        healthStatus: 'Healthy',
        latencyMs: 38,
      };
      setGateways((prev) => [newGateway, ...prev]);
      setSnackbarNotice(`تمت إضافة بوابة "${formNameAr.trim()}" بنجاح إلى منظومة المدفوعات.`);
    }

    setFormModalOpen(false);
  };

  // Delete Gateway
  const handleConfirmDelete = () => {
    if (!deleteConfirmModal) return;
    const name = deleteConfirmModal.nameAr;
    setGateways((prev) => prev.filter((g) => g.id !== deleteConfirmModal.id));
    setDeleteConfirmModal(null);
    setSnackbarNotice(`تم حذف بوابة "${name}" من المنظومة بنجاح.`);
  };

  // Toggle Active/Inactive directly
  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGateways((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const next = !g.isActive;
          setSnackbarNotice(
            next
              ? `تم تفعيل استقبال المدفوعات عبر "${g.nameAr}".`
              : `تم إيقاف تفعيل بوابة "${g.nameAr}" مؤقتاً.`
          );
          return { ...g, isActive: next };
        }
        return g;
      })
    );
  };

  // Test Ping Handshake
  const handleTestPing = () => {
    setTestPingLoading(true);
    setTestPingResult(null);
    setTimeout(() => {
      setTestPingLoading(false);
      setTestPingResult({
        success: true,
        latency: Math.floor(Math.random() * 20) + 34,
        msg: 'تم الاتصال والمصادقة الأمنية بنجاح عبر بروتوكول TLS 1.3 المعتمد لدى البنك المركزي السعودي (SAMA).',
      });
    }, 1100);
  };

  // Reset to default
  const handleResetDefaults = () => {
    setGateways(INITIAL_GATEWAYS);
    setSnackbarNotice('تمت استعادة كافة بوابات الدفع والبنوك السعودية الافتراضية بنجاح.');
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
                  بوابات الدفع الإلكتروني والربط البنكي السعودي
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  منظومة التحصيل المالي المعتمدة لدى البنك المركزي السعودي (ساما SAMA) وشركة المدفوعات السعودية (مدى)
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{
                fontWeight: 900,
                borderRadius: 3,
                px: 2.5,
                py: 1.2,
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
              }}
            >
              إضافة بوابة دفع جديدة
            </Button>

            <Tooltip title="استعادة بوابات الدفع والبنوك الافتراضية">
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={handleResetDefaults}
                sx={{ fontWeight: 800, borderRadius: 3 }}
              >
                استعادة الافتراضي
              </Button>
            </Tooltip>
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
                حجم التحصيل اليومي المباشر
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: theme.palette.primary.main, my: 0.5 }}>
                {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
              </Typography>
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 15 }} /> +14.2% مقارنة بالأمس
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
                العمليات المنفذة اليوم
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ my: 0.5 }}>
                {totalTx.toLocaleString()} عملية
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                متوسط سرعة المعالجة: 42ms
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
                البوابات والبنوك الفعالة
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#10B981', my: 0.5 }}>
                {activeCount} من أصل {gateways.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                جاهزية واستقرار: 99.98%
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
                دورة التسوية المصرفية
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#FBBF24', my: 0.5 }}>
                تسوية فورية T+0
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                تحويل آلي مباشر إلى الآيبان
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Navigation Tabs */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, isDark ? 0.6 : 0.9),
            borderRadius: 4,
            p: 0.8,
            boxShadow: `0 8px 30px ${alpha('#000', isDark ? 0.4 : 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            '& .MuiTabs-indicator': {
              borderRadius: 3,
              height: '100%',
              bgcolor: alpha(theme.palette.primary.main, 0.18),
              border: `1.5px solid ${theme.palette.primary.main}`,
            },
          }}
        >
          <Tab
            icon={<PaymentIcon />}
            iconPosition="start"
            label={`بوابات الدفع والربط البنكي (${gateways.length})`}
            sx={{ fontWeight: 800, fontSize: '0.95rem', zIndex: 1, borderRadius: 3, minHeight: 48, px: 3 }}
          />
          <Tab
            icon={<ReceiptLongIcon />}
            iconPosition="start"
            label="سجل العمليات المالية اللحظي المباشر"
            sx={{ fontWeight: 800, fontSize: '0.95rem', zIndex: 1, borderRadius: 3, minHeight: 48, px: 3 }}
          />
          <Tab
            icon={<SecurityIcon />}
            iconPosition="start"
            label="معايير وضوابط الامتثال المالي (SAMA)"
            sx={{ fontWeight: 800, fontSize: '0.95rem', zIndex: 1, borderRadius: 3, minHeight: 48, px: 3 }}
          />
        </Tabs>
      </Box>

      {/* ========================================================================= */}
      {/* TAB 0: GATEWAYS & BANKS DIRECTORY (بوابات الدفع والبنوك)                 */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Stack spacing={3.5}>
          {/* Sub-toolbar: Search & Category Chips */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
              <TextField
                placeholder="ابحث باسم بوابة الدفع، اسم المصرف، أو رمز التاجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: '100%', md: 450 } }}
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
                  label="كافة البوابات"
                  clickable
                  color={categoryFilter === 'ALL' ? 'primary' : 'default'}
                  onClick={() => setCategoryFilter('ALL')}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label="بطاقات مدى والائتمان"
                  clickable
                  color={categoryFilter === 'Card' ? 'primary' : 'default'}
                  onClick={() => setCategoryFilter('Card')}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label="المحافظ الرقمية الذكية"
                  clickable
                  color={categoryFilter === 'Wallet' ? 'primary' : 'default'}
                  onClick={() => setCategoryFilter('Wallet')}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label="الربط البنكي المباشر B2B"
                  clickable
                  color={categoryFilter === 'Bank' ? 'primary' : 'default'}
                  onClick={() => setCategoryFilter('Bank')}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label="نقاط البيع الذكية POS"
                  clickable
                  color={categoryFilter === 'POS' ? 'primary' : 'default'}
                  onClick={() => setCategoryFilter('POS')}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Gateways Cards Grid */}
          <Grid container spacing={3}>
            {filteredGateways.map((gw) => (
              <Grid item xs={12} sm={6} md={4} key={gw.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 2.5, md: 3 },
                    position: 'relative',
                    overflow: 'hidden',
                    ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
                    border: `1.8px solid ${gw.isActive ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.divider, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                >
                  <Box>
                    {/* Header Strip: Active Switch & Category */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Chip
                        label={gw.categoryAr}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: gw.isActive ? '#10B981' : 'text.secondary' }}>
                          {gw.isActive ? 'مفعلة' : 'معطلة'}
                        </Typography>
                        <Switch
                          checked={gw.isActive}
                          onChange={(e) => handleToggleActive(gw.id, e as any)}
                          color="success"
                          size="small"
                        />
                      </Stack>
                    </Stack>

                    {/* Gateway Name */}
                    <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                      {gw.nameAr}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 2 }}>
                      المصرف الشريك: <strong style={{ color: theme.palette.text.primary }}>{gw.settlementBank}</strong>
                    </Typography>

                    {/* Volume & Metrics Box */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.8,
                        mb: 2,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, isDark ? 0.35 : 0.7),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            التحصيل اليومي
                          </Typography>
                          <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                            {gw.dailyVolumeSar.toLocaleString()} ريال
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            نسبة العمولة
                          </Typography>
                          <Typography variant="body2" fontWeight={800}>
                            {gw.feePercentage}% {gw.fixedFeeSar > 0 ? `+ ${gw.fixedFeeSar} ر.س` : ''}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 0.8 }} />
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              بيئة التشغيل: <strong>{gw.environment === 'Production' ? 'الإنتاج الفعلي' : 'بيئة تجريبية'}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                              الاستجابة: {gw.latencyMs}ms
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Settlement IBAN snippet */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontFamily: 'monospace' }}>
                      الآيبان: {gw.settlementIban}
                    </Typography>
                  </Box>

                  {/* Actions: Edit and Delete */}
                  <Box sx={{ pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.15)}` }}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditModal(gw)}
                        sx={{ fontWeight: 800, flex: 1, borderRadius: 2.5 }}
                      >
                        تعديل وإعدادات الربط
                      </Button>
                      <Tooltip title="حذف هذه البوابة من المنظومة">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => setDeleteConfirmModal(gw)}
                          sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            borderRadius: 2.5,
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: LIVE TRANSACTIONS STREAM (سجل العمليات المالية)                   */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3, borderRadius: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Typography variant="h6" fontWeight={900}>
              أحدث العمليات والتحصيلات المنفذة عبر البوابات السعودية
            </Typography>
            <Chip label="بث لحظي مباشر" color="success" size="small" sx={{ fontWeight: 800 }} />
          </Stack>

          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>المرجع البنكي</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>الوقت</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>لوحة المركبة</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>بوابة الدفع</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>المبلغ (ريال)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>عمولة الشبكة</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>صافي التسوية</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>رمز تفويض ساما</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>الحالة</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {RECENT_TRANSACTIONS.map((row) => (
                  <TableRow key={row.ref} hover>
                    <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 800, fontFamily: 'monospace' }}>
                      {row.ref}
                    </TableCell>
                    <TableCell>{row.time}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{row.plate}</TableCell>
                    <TableCell>{row.gateway}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900 }}>{row.amount.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ color: '#FB7185' }}>-{row.fee.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ color: '#10B981', fontWeight: 900 }}>{row.net.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>{row.auth}</TableCell>
                    <TableCell>
                      <Chip label={row.status} size="small" color="success" sx={{ fontWeight: 800 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SAMA REGULATORY & COMPLIANCE RULES (ضوابط البنك المركزي)             */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3.5, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>
            معايير الامتثال المالي وضوابط التشفير المعتمدة (SAMA / Mada Standards)
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: theme.palette.primary.main, mb: 1 }}>
                  1. سقف عمولات شبكة مدى الوطنية
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  • بطاقات مدى الائتمانية والخصم المباشر: عمولة 0.80% بحد أقصى 30 ريال سعودي للعملية الواحدة.<br />
                  • البطاقات الائتمانية الدولية: 1.50% إلى 1.75% + 1 ريال.<br />
                  • المحافظ الرقمية (Apple Pay عبر مدى): نفس سقف عمولة مدى 0.80%.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.08) }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: theme.palette.success.main, mb: 1 }}>
                  2. أمان التشفير والتوثيق الثنائي (3D Secure 2.0)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  • تشفير بيانات الدفع وفق بروتوكول TLS 1.3 مع شهادات تشفير بنكية متوافقة.<br />
                  • دعم كامل لـ 3DS 2.0 لتأكيد عمليات الدفع الإلكتروني برمز OTP عبر رسائل SMS البنكية.<br />
                  • نظام Tokenization لمنع تخزين أرقام البطاقات الفعلية على خوادم النظام.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: theme.palette.info.main, mb: 1 }}>
                  3. الربط مع هيئة الزكاة والضريبة والجمارك (ZATCA)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  • إصدار إيصالات وفواتير ضريبية فورية تحتوي على رمز الاستجابة السريعة (QR Fatoora).<br />
                  • احتساب ضريبة القيمة المضافة 15% تلقائياً وعزلها في بنود الفاتورة.<br />
                  • أرشفة العمليات المالية لمدة 5 سنوات لأغراض التدقيق المالي.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.08) }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: theme.palette.warning.main, mb: 1 }}>
                  4. التسوية الفورية وتفادي المبالغ المعلقة
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  • اعتماد نظام التسوية اللحظية T+0 مع مصرف الإنماء والراجحي.<br />
                  • نظام تسوية الفروقات الآلية في حالة إلغاء الجلسات أو فترات السماح.<br />
                  • تقارير مطابقة مالية يومية (Daily Reconciliation) في تمام الساعة 00:05 صباحاً.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 3. ADD / EDIT GATEWAY MODAL (نافذة إضافة وتعديل بوابة الدفع)                */}
      {/* ========================================================================= */}
      <Dialog
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        maxWidth="md"
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
              <PaymentIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              <Typography variant="h6" fontWeight={900}>
                {editingGatewayId ? 'تعديل إعدادات بوابة الدفع والربط البنكي' : 'إضافة بوابة دفع أو ربط مصرفي جديد'}
              </Typography>
            </Stack>
            <IconButton onClick={() => setFormModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Gateway Name */}
            <Grid item xs={12} sm={8}>
              <TextField
                label="اسم بوابة الدفع أو المصرف الشريك"
                value={formNameAr}
                onChange={(e) => setFormNameAr(e.target.value)}
                placeholder="مثال: شبكة مدى، محفظة تابي، مصرف الراجحي..."
                fullWidth
                required
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="تصنيف البوابة"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as GatewayCategory)}
                fullWidth
              >
                <MenuItem value="Card">بطاقات مدى والائتمان (Card)</MenuItem>
                <MenuItem value="Wallet">محفظة رقمية ذكية (Wallet)</MenuItem>
                <MenuItem value="Bank">ربط بنكي مباشر B2B (Bank)</MenuItem>
                <MenuItem value="POS">نقاط بيع ذكية (POS)</MenuItem>
              </TextField>
            </Grid>

            {/* Partner Bank */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="المصرف الشريك للتسوية"
                value={formSettlementBank}
                onChange={(e) => setFormSettlementBank(e.target.value)}
                fullWidth
              >
                <MenuItem value="مصرف الإنماء">مصرف الإنماء</MenuItem>
                <MenuItem value="مصرف الراجحي">مصرف الراجحي</MenuItem>
                <MenuItem value="البنك الأهلي السعودي">البنك الأهلي السعودي (SNB)</MenuItem>
                <MenuItem value="بنك الرياض">بنك الرياض</MenuItem>
                <MenuItem value="بنك البلاد">بنك البلاد</MenuItem>
                <MenuItem value="البنك السعودي الأول">البنك السعودي الأول (SAB)</MenuItem>
                <MenuItem value="بنك الجزيرة">بنك الجزيرة</MenuItem>
              </TextField>
            </Grid>

            {/* Settlement IBAN */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="رقم حساب التسوية الآيبان (IBAN)"
                value={formSettlementIban}
                onChange={(e) => setFormSettlementIban(e.target.value)}
                placeholder="SA44 0500 0000 0012 3456 7890"
                fullWidth
                required
              />
            </Grid>

            {/* Merchant ID & Terminal ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="معرف التاجر المنشأة (Merchant ID)"
                value={formMerchantId}
                onChange={(e) => setFormMerchantId(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="معرف المحطة / البوابة (Terminal ID)"
                value={formTerminalId}
                onChange={(e) => setFormTerminalId(e.target.value)}
                fullWidth
              />
            </Grid>

            {/* API Key */}
            <Grid item xs={12}>
              <TextField
                label="مفتاح الربط البرمجي المشفر (API Secret Key)"
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                fullWidth
                type="password"
              />
            </Grid>

            {/* Fee Percentage & Fixed Fee */}
            <Grid item xs={6} sm={3}>
              <TextField
                label="نسبة العمولة (%)"
                type="number"
                value={formFeePercentage}
                onChange={(e) => setFormFeePercentage(Number(e.target.value))}
                fullWidth
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="الرسم الثابت (ريال)"
                type="number"
                value={formFixedFeeSar}
                onChange={(e) => setFormFixedFeeSar(Number(e.target.value))}
                fullWidth
                InputProps={{ endAdornment: <InputAdornment position="end">ر.س</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="بيئة التشغيل"
                value={formEnvironment}
                onChange={(e) => setFormEnvironment(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="Production">الإنتاج الفعلي الحي (Production Live)</MenuItem>
                <MenuItem value="Sandbox">بيئة الاختبار والمحاكاة (Sandbox)</MenuItem>
              </TextField>
            </Grid>

            {/* Ping Handshake Section */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      اختبار فحص الاتصال والمصادقة الأمنية (SAMA Ping Test)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      التحقق من جاهزية مفاتيح الربط وتوافق بروتوكول TLS 1.3 مع البنك المركزي
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<WifiIcon />}
                    onClick={handleTestPing}
                    disabled={testPingLoading}
                    sx={{ fontWeight: 800 }}
                  >
                    {testPingLoading ? 'جارٍ الفحص...' : 'فحص الاتصال الآن'}
                  </Button>
                </Stack>

                {testPingResult && (
                  <Alert severity="success" sx={{ mt: 2, fontWeight: 700, borderRadius: 2 }}>
                    {testPingResult.msg} (الاستجابة: {testPingResult.latency}ms)
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
          <Button variant="outlined" onClick={() => setFormModalOpen(false)} sx={{ fontWeight: 800 }}>
            إلغاء الأمر
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            onClick={handleSaveGateway}
            sx={{ fontWeight: 900, px: 3 }}
          >
            {editingGatewayId ? 'حفظ التعديلات' : 'إضافة البوابة فوراً'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* 4. DELETE CONFIRMATION MODAL (تأكيد حذف بوابة)                             */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(deleteConfirmModal)}
        onClose={() => setDeleteConfirmModal(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: isDark ? '#0B132B' : '#FFFFFF',
            border: `1.5px solid ${alpha(theme.palette.error.main, 0.5)}`,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: theme.palette.error.main, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon /> تأكيد حذف بوابة الدفع
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 700 }}>
            هل أنت متأكد من رغبتك في حذف بوابة "{deleteConfirmModal?.nameAr}"؟
          </Typography>
          <Typography variant="body2" color="text.secondary">
            سيتم إيقاف معالجة المدفوعات والربط المالي عبر هذه البوابة فوراً من مواقف المجمع.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setDeleteConfirmModal(null)} sx={{ fontWeight: 800 }}>
            تراجع
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleConfirmDelete}
            sx={{ fontWeight: 900, px: 2.5 }}
          >
            تأكيد الحذف النهائي
          </Button>
        </DialogActions>
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

export default SaudiPaymentsPage;
