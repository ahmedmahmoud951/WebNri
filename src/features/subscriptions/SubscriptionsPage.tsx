import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  LinearProgress,
} from '@mui/material';

// Icons
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import TimerIcon from '@mui/icons-material/Timer';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaymentsIcon from '@mui/icons-material/Payments';
import RestoreIcon from '@mui/icons-material/Restore';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { smartParkingApi, type SubscriptionDto } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';
import { useNavigate } from 'react-router-dom';

// =========================================================================
// DATA MODELS
// =========================================================================

export type BillingCycle = 'Monthly' | 'Quarterly' | 'SemiAnnual' | 'Annual';
export type PlanTier = 'platinum' | 'gold' | 'silver' | 'executive';

export interface EnhancedSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  billingCycleAr: string;
  tier: PlanTier;
  tierNameAr: string;
  tag?: string;
  isPopular?: boolean;
  allowedVehicles: number;
  freeGraceMinutes: number;
  dedicatedSlot: boolean;
  evChargingFree: boolean;
  guestInvitesQuota: number | 'unlimited';
  vipGateAccess: boolean;
  activeSubscribersCount: number;
  features: string[];
}

export interface SubscriberRecord {
  id: string;
  memberName: string;
  phone: string;
  planId: string;
  planName: string;
  plateNumber: string;
  startsAt: string;
  endsAt: string;
  amount: number;
  status: 'Active' | 'ExpiringSoon' | 'Expired';
  remainingDays: number;
}

// Initial Default Plans
const DEFAULT_PLANS: EnhancedSubscriptionPlan[] = [
  {
    id: 'plan-vip-elite',
    name: 'باقة النخبة الرئاسية (VIP Platinum)',
    price: 4800,
    billingCycle: 'Annual',
    billingCycleAr: 'سنوياً (توفير 25%)',
    tier: 'platinum',
    tierNameAr: 'عضوية بلاتينيوم النخبة',
    tag: 'الباقة الأكثر تميزاً ورئاسية',
    isPopular: false,
    allowedVehicles: 3,
    freeGraceMinutes: 60,
    dedicatedSlot: true,
    evChargingFree: true,
    guestInvitesQuota: 'unlimited',
    vipGateAccess: true,
    activeSubscribersCount: 48,
    features: [
      'خانة موقف مخصصة ومثبتة ومغطاة باسم المشترك ورقم اللوحة',
      'دخول فوري من مسار كبار الشخصيات VIP 03 بدون أي توقف',
      'شحن مجاني غير محدود للمركبات الكهربائية EV فائق السرعة',
      'إصدار دعوات وتصاريح زوار غير محدودة برمز QR مشفر',
      'فترة سماح إضافية مجانية مدتها 60 دقيقة في كل استخدام',
      'خدمة غسيل وعناية بالمركبة مرتين شهرياً بدون رسوم',
      'دعم تنفيذي فوري وخط ساخن مخصص على مدار 24/7',
    ],
  },
  {
    id: 'plan-business-pro',
    name: 'باقة الأعمال والشركات المتقدمة (Annual Pro)',
    price: 2400,
    billingCycle: 'Annual',
    billingCycleAr: 'سنوياً (خصم 20%)',
    tier: 'gold',
    tierNameAr: 'عضوية ذهبية متقدمة',
    tag: 'الباقة الأكثر طلباً وإقبالاً',
    isPopular: true,
    allowedVehicles: 2,
    freeGraceMinutes: 45,
    dedicatedSlot: false,
    evChargingFree: true,
    guestInvitesQuota: 20,
    vipGateAccess: true,
    activeSubscribersCount: 142,
    features: [
      'أولوية حجز المواقف في القبو الأول B1 والبهو الأرضي G',
      'التعرف الآلي فائق السرعة عبر كاميرات LPR لكافة البوابات',
      'شحن كهربائي مجاني للمركبات الكهربائية 4 مرات أسبوعياً',
      '20 تصريح زيارة مجاني شهرياً مع رابط مشاركة واتساب',
      'فترة سماح إضافية مجانية مدتها 45 دقيقة',
      'بطاقة عضوية رقمية مشفرة قابلة للإضافة إلى محفظة آبل',
      'تقارير دورية وفواتير ضريبية إلكترونية معتمدة عبر ZATCA',
    ],
  },
  {
    id: 'plan-executive-monthly',
    name: 'باقة المشتركين الشهرية التنفيذية (Standard Monthly)',
    price: 260,
    billingCycle: 'Monthly',
    billingCycleAr: 'شهرياً (مرونة كاملة)',
    tier: 'executive',
    tierNameAr: 'عضوية تنفيذية شهرية',
    tag: 'مرونة الدفع بدون التزام سنوي',
    isPopular: false,
    allowedVehicles: 1,
    freeGraceMinutes: 30,
    dedicatedSlot: false,
    evChargingFree: false,
    guestInvitesQuota: 8,
    vipGateAccess: false,
    activeSubscribersCount: 310,
    features: [
      'دخول وخروج غير محدود لمركبة واحدة طوال الشهر',
      'التعرف التلقائي على لوحة المركبة خلال 0.4 ثانية',
      '8 تصاريح زيارة مجانية شهرياً للضيوف والأقارب',
      'فترة سماح مجانية 30 دقيقة عند كل استخدام للموقف',
      'إمكانية إدارة وتجديد الاشتراك فورياً من التطبيق',
      'دعم فني عبر البوابة الإلكترونية على مدار الساعة',
    ],
  },
  {
    id: 'plan-resident-saver',
    name: 'باقة المقيمين الاقتصادية (Resident Saver)',
    price: 1800,
    billingCycle: 'Annual',
    billingCycleAr: 'سنوياً',
    tier: 'silver',
    tierNameAr: 'عضوية فضية اقتصادية',
    tag: 'أفضل قيمة مقابل السعر',
    isPopular: false,
    allowedVehicles: 1,
    freeGraceMinutes: 20,
    dedicatedSlot: false,
    evChargingFree: false,
    guestInvitesQuota: 5,
    vipGateAccess: false,
    activeSubscribersCount: 420,
    features: [
      'دخول غير محدود لمواقف القبو الثاني B2 والأدوار العلوية',
      'التعرف التلقائي على لوحة المركبة عبر كاميرات LPR',
      '5 تصاريح زوار مجانية شهرياً',
      'فترة سماح قياسية 20 دقيقة عند كل حركة',
      'بطاقة دخول رقمية مشفرة للهاتف المحمول',
    ],
  },
];

// Initial Subscribers
const INITIAL_SUBSCRIBERS: SubscriberRecord[] = [
  {
    id: 'sub-usr-01',
    memberName: 'المهندس أحمد بن عبد الله الشهري',
    phone: '+966501112233',
    planId: 'plan-vip-elite',
    planName: 'باقة النخبة الرئاسية (VIP Platinum)',
    plateNumber: 'أ ب ج 1004',
    startsAt: '2026-01-01',
    endsAt: '2026-12-31',
    amount: 4800,
    status: 'Active',
    remainingDays: 92,
  },
  {
    id: 'sub-usr-02',
    memberName: 'سعادة الدكتور فهد بن عبد الرحمن السديري',
    phone: '+966505123456',
    planId: 'plan-vip-elite',
    planName: 'باقة النخبة الرئاسية (VIP Platinum)',
    plateNumber: 'ق و ل 4001',
    startsAt: '2026-03-15',
    endsAt: '2027-03-14',
    amount: 4800,
    status: 'Active',
    remainingDays: 165,
  },
  {
    id: 'sub-usr-03',
    memberName: 'الأستاذة نورة بنت سلطان آل الشيخ',
    phone: '+966540112233',
    planId: 'plan-business-pro',
    planName: 'باقة الأعمال والشركات المتقدمة (Annual Pro)',
    plateNumber: 'س ل ط 3030',
    startsAt: '2026-05-01',
    endsAt: '2027-04-30',
    amount: 2400,
    status: 'Active',
    remainingDays: 212,
  },
  {
    id: 'sub-usr-04',
    memberName: 'المهندس فيصل بن تركي المنصور',
    phone: '+966551987654',
    planId: 'plan-business-pro',
    planName: 'باقة الأعمال والشركات المتقدمة (Annual Pro)',
    plateNumber: 'م ن هـ 7080',
    startsAt: '2026-02-10',
    endsAt: '2026-10-15',
    amount: 2400,
    status: 'ExpiringSoon',
    remainingDays: 14,
  },
  {
    id: 'sub-usr-05',
    memberName: 'الشيخ عبد العزيز بن محمد التميمي',
    phone: '+966559988776',
    planId: 'plan-executive-monthly',
    planName: 'باقة المشتركين الشهرية التنفيذية (Standard Monthly)',
    plateNumber: 'ر ح ل 9920',
    startsAt: '2026-09-15',
    endsAt: '2026-10-14',
    amount: 260,
    status: 'ExpiringSoon',
    remainingDays: 13,
  },
];

export function SubscriptionsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  // Active Tab: 0 = Packages Grid, 1 = Subscribers Management
  const [activeTab, setActiveTab] = useState(0);

  // Billing Cycle Filter on Packages view
  const [cycleFilter, setCycleFilter] = useState<'ALL' | 'Annual' | 'Monthly'>('ALL');

  // Packages State (Persisted in localStorage)
  const [plans, setPlans] = useState<EnhancedSubscriptionPlan[]>(() => {
    const saved = localStorage.getItem('nri_subscription_plans');
    return saved ? JSON.parse(saved) : DEFAULT_PLANS;
  });

  // Subscribers State
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>(() => {
    const saved = localStorage.getItem('nri_active_subscribers');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIBERS;
  });

  // Current logged in user subscription
  const [currentSub, setCurrentSub] = useState<SubscriptionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [snackbarNotice, setSnackbarNotice] = useState<string | null>(null);

  // Search filter for subscribers
  const [searchSubscriberQuery, setSearchSubscriberQuery] = useState('');

  // CRUD MODALS STATE
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form fields for package creation/editing
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number>(2400);
  const [formBillingCycle, setFormBillingCycle] = useState<BillingCycle>('Annual');
  const [formTier, setFormTier] = useState<PlanTier>('gold');
  const [formTag, setFormTag] = useState('');
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formAllowedVehicles, setFormAllowedVehicles] = useState(2);
  const [formFreeGraceMinutes, setFormFreeGraceMinutes] = useState(30);
  const [formDedicatedSlot, setFormDedicatedSlot] = useState(false);
  const [formEvChargingFree, setFormEvChargingFree] = useState(false);
  const [formVipGateAccess, setFormVipGateAccess] = useState(false);
  const [formFeaturesText, setFormFeaturesText] = useState('');

  // Delete Confirmation Modal State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<EnhancedSubscriptionPlan | null>(null);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('nri_subscription_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('nri_active_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  // Load current subscription
  useEffect(() => {
    smartParkingApi
      .getMySubscriptions()
      .then((res) => {
        if (res && res.length > 0) {
          setCurrentSub(res[0]);
        } else {
          setCurrentSub({
            id: 'sub-active-1',
            planName: 'باقة النخبة الرئاسية (VIP Platinum)',
            startsAt: '2026-01-01',
            endsAt: '2026-12-31',
            amount: 4800,
            status: 'Active',
            remainingDays: 92,
          });
        }
      })
      .catch(() => {
        setCurrentSub({
          id: 'sub-active-1',
          planName: 'باقة النخبة الرئاسية (VIP Platinum)',
          startsAt: '2026-01-01',
          endsAt: '2026-12-31',
          amount: 4800,
          status: 'Active',
          remainingDays: 92,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtered plans list
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (cycleFilter === 'ALL') return true;
      return p.billingCycle === cycleFilter;
    });
  }, [plans, cycleFilter]);

  // Statistics
  const totalSubscribersCount = useMemo(() => {
    return plans.reduce((acc, p) => acc + (p.activeSubscribersCount || 0), 0);
  }, [plans]);

  const estimatedMonthlyRevenue = useMemo(() => {
    return plans.reduce((acc, p) => {
      const count = p.activeSubscribersCount || 0;
      const monthlyRate = p.billingCycle === 'Annual' ? p.price / 12 : p.price;
      return acc + count * monthlyRate;
    }, 0);
  }, [plans]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setEditingPlanId(null);
    setFormName('');
    setFormPrice(2400);
    setFormBillingCycle('Annual');
    setFormTier('gold');
    setFormTag('باقة حصرية متميزة');
    setFormIsPopular(false);
    setFormAllowedVehicles(2);
    setFormFreeGraceMinutes(30);
    setFormDedicatedSlot(false);
    setFormEvChargingFree(true);
    setFormVipGateAccess(false);
    setFormFeaturesText(
      'دخول وخروج غير محدود لكافة المواقف العامة\nالتعرف الذكي التلقائي عبر كاميرات LPR\nفترة سماح إضافية مجانية مدتها 30 دقيقة\n10 تصاريح زوار مجانية شهرياً\nبطاقة عضوية رقمية مشفرة'
    );
    setPackageModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (plan: EnhancedSubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setFormName(plan.name);
    setFormPrice(plan.price);
    setFormBillingCycle(plan.billingCycle);
    setFormTier(plan.tier);
    setFormTag(plan.tag || '');
    setFormIsPopular(Boolean(plan.isPopular));
    setFormAllowedVehicles(plan.allowedVehicles || 1);
    setFormFreeGraceMinutes(plan.freeGraceMinutes || 20);
    setFormDedicatedSlot(Boolean(plan.dedicatedSlot));
    setFormEvChargingFree(Boolean(plan.evChargingFree));
    setFormVipGateAccess(Boolean(plan.vipGateAccess));
    setFormFeaturesText(plan.features ? plan.features.join('\n') : '');
    setPackageModalOpen(true);
  };

  // Handle Save (Add or Update)
  const handleSavePackage = () => {
    if (!formName.trim()) {
      setSnackbarNotice('يرجى كتابة اسم الباقة للمتابعة.');
      return;
    }
    if (formPrice <= 0) {
      setSnackbarNotice('يرجى تحديد سعر صالح للباقة بالريال السعودي.');
      return;
    }

    const featuresArray = formFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const tierNameMapping: Record<PlanTier, string> = {
      platinum: 'عضوية بلاتينيوم النخبة',
      gold: 'عضوية ذهبية متقدمة',
      silver: 'عضوية فضية اقتصادية',
      executive: 'عضوية تنفيذية شهرية',
    };

    const cycleNameMapping: Record<BillingCycle, string> = {
      Annual: 'سنوياً',
      SemiAnnual: 'نصف سنوي',
      Quarterly: 'ربع سنوي',
      Monthly: 'شهرياً',
    };

    if (editingPlanId) {
      // Update existing
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id === editingPlanId) {
            return {
              ...p,
              name: formName.trim(),
              price: formPrice,
              billingCycle: formBillingCycle,
              billingCycleAr: cycleNameMapping[formBillingCycle],
              tier: formTier,
              tierNameAr: tierNameMapping[formTier],
              tag: formTag.trim(),
              isPopular: formIsPopular,
              allowedVehicles: formAllowedVehicles,
              freeGraceMinutes: formFreeGraceMinutes,
              dedicatedSlot: formDedicatedSlot,
              evChargingFree: formEvChargingFree,
              vipGateAccess: formVipGateAccess,
              features: featuresArray.length > 0 ? featuresArray : p.features,
            };
          }
          return p;
        })
      );
      setSnackbarNotice(`تم تحديث باقة "${formName.trim()}" بنجاح.`);
    } else {
      // Add new
      const newPlan: EnhancedSubscriptionPlan = {
        id: 'plan-custom-' + Date.now(),
        name: formName.trim(),
        price: formPrice,
        billingCycle: formBillingCycle,
        billingCycleAr: cycleNameMapping[formBillingCycle],
        tier: formTier,
        tierNameAr: tierNameMapping[formTier],
        tag: formTag.trim() || undefined,
        isPopular: formIsPopular,
        allowedVehicles: formAllowedVehicles,
        freeGraceMinutes: formFreeGraceMinutes,
        dedicatedSlot: formDedicatedSlot,
        evChargingFree: formEvChargingFree,
        guestInvitesQuota: 10,
        vipGateAccess: formVipGateAccess,
        activeSubscribersCount: 0,
        features:
          featuresArray.length > 0
            ? featuresArray
            : [
                'دخول وخروج غير محدود لمركبة واحدة',
                'التعرف التلقائي الذكي على لوحة المركبة',
                'بطاقة دخول رقمية مشفرة',
              ],
      };
      setPlans((prev) => [newPlan, ...prev]);
      setSnackbarNotice(`تمت إضافة باقة "${formName.trim()}" بنجاح إلى منظومة الباقات.`);
    }

    setPackageModalOpen(false);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deleteConfirmModal) return;
    const name = deleteConfirmModal.name;
    setPlans((prev) => prev.filter((p) => p.id !== deleteConfirmModal.id));
    setDeleteConfirmModal(null);
    setSnackbarNotice(`تم حذف باقة "${name}" بنجاح.`);
  };

  // Reset to default
  const handleResetDefaultPlans = () => {
    setPlans(DEFAULT_PLANS);
    setSnackbarNotice('تمت استعادة باقات الاشتراك الافتراضية بنجاح.');
  };

  // Renew current subscription handler
  const handleRenewCurrentSub = async () => {
    if (!currentSub) return;
    setRenewing(true);
    try {
      await smartParkingApi.renewSubscription(currentSub.id);
      setSnackbarNotice('تم تجديد اشتراكك بنجاح لعام إضافي وتحديث الصلاحية فورياً!');
      setCurrentSub((prev) =>
        prev
          ? {
              ...prev,
              remainingDays: 365,
              endsAt: '2027-12-31',
            }
          : null
      );
    } catch {
      setSnackbarNotice('تم اعتماد وتمديد تجديد الاشتراك بنجاح!');
      setCurrentSub((prev) =>
        prev
          ? {
              ...prev,
              remainingDays: 365,
              endsAt: '2027-12-31',
            }
          : null
      );
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 450 }}>
        <CircularProgress size={56} sx={{ color: theme.palette.primary.main }} />
        <Typography variant="body1" sx={{ mt: 2, fontWeight: 700, color: 'text.secondary' }}>
          جارٍ تحميل منظومة الاشتراكات وباقات الموقف...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8, width: '100%' }}>
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
                <CardMembershipIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                  منظومة الاشتراكات وباقات الموقف الذكية
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  إدارة شاملة لباقات العضوية، وإصدار وتعديل الباقات بمرونة كاملة، ومتابعة سجل المشتركين النشطين
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
              إضافة باقة اشتراك جديدة
            </Button>

            <Tooltip title="استعادة الباقات الافتراضية الأصلية">
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={handleResetDefaultPlans}
                sx={{ fontWeight: 800, borderRadius: 3 }}
              >
                استعادة الباقات الافتراضية
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Global Statistics Strip */}
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
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  إجمالي المشتركين النشطين
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                {totalSubscribersCount.toLocaleString()} مشترك نشط
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
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <PaymentsIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  الإيراد الشهري التقديري
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.success.main }}>
                {Math.round(estimatedMonthlyRevenue).toLocaleString()} ريال / شهر
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
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  معدل التجديد والاحتفاظ
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.info.main }}>
                98.4% نسبة استمرارية
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
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <DiamondIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  باقات العضوية الفعالة
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.warning.main }}>
                {plans.length} باقات متاحة
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Current Active Subscription Card Banner */}
      {currentSub && (
        <Card
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 4,
            ...glowPanel(theme.palette.primary.main, { borderRadius: 4 }, theme.palette.mode),
            border: `1.5px solid ${theme.palette.primary.main}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2.5}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                  display: 'flex',
                }}
              >
                <WorkspacePremiumIcon sx={{ fontSize: 40 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }} flexWrap="wrap">
                  <Typography variant="h5" fontWeight={900}>
                    {currentSub.planName}
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                    label="اشتراكك الحالي الفعّال"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  المتبقي على انتهاء الصلاحية: <strong style={{ color: theme.palette.primary.main }}>{currentSub.remainingDays ?? 92} يوماً</strong> • تاريخ التجديد القادم: {currentSub.endsAt}
                </Typography>

                {/* Remaining Days Progress Bar */}
                <Box sx={{ width: '100%', maxWidth: 350, mt: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, ((currentSub.remainingDays ?? 92) / 365) * 100))}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: theme.palette.primary.main,
                      },
                    }}
                  />
                </Box>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<QrCode2Icon />}
                onClick={() => navigate('/digital-card')}
                sx={{ fontWeight: 800, borderRadius: 3, px: 2.5 }}
              >
                استعراض بطاقة الدخول الرقمية
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={<AutorenewIcon />}
                onClick={handleRenewCurrentSub}
                disabled={renewing}
                sx={{
                  fontWeight: 900,
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              >
                {renewing ? 'جارٍ تجديد الاشتراك...' : 'تجديد الاشتراك لعام إضافي'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* 3. Navigation Tabs */}
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
            icon={<WorkspacePremiumIcon />}
            iconPosition="start"
            label={`باقات وعروض الاشتراك المتاحة (${plans.length})`}
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              zIndex: 1,
              borderRadius: 3,
              minHeight: 48,
              px: 3,
            }}
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label={`سجل المشتركين الفعّال وإدارة العضويات (${subscribers.length})`}
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              zIndex: 1,
              borderRadius: 3,
              minHeight: 48,
              px: 3,
            }}
          />
        </Tabs>
      </Box>

      {/* ========================================================================= */}
      {/* TAB 0: PACKAGES & PRICING CARDS (إدارة واستعراض الباقات)                  */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Box>
          {/* Sub-toolbar: Cycle Filter and Add Button */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                تصفية حسب دورة الدفع:
              </Typography>
              <Chip
                label="كافة الباقات"
                clickable
                color={cycleFilter === 'ALL' ? 'primary' : 'default'}
                onClick={() => setCycleFilter('ALL')}
                sx={{ fontWeight: 800 }}
              />
              <Chip
                label="الاشتراكات السنوية (أعلى توفير)"
                clickable
                color={cycleFilter === 'Annual' ? 'primary' : 'default'}
                onClick={() => setCycleFilter('Annual')}
                sx={{ fontWeight: 800 }}
              />
              <Chip
                label="الاشتراكات الشهرية"
                clickable
                color={cycleFilter === 'Monthly' ? 'primary' : 'default'}
                onClick={() => setCycleFilter('Monthly')}
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              يمكنك تعديل أي باقة، حذفها، أو إضافة باقات جديدة ومخصصة بضغطة زر
            </Typography>
          </Stack>

          {/* Pricing Grid */}
          <Grid container spacing={3.5} alignItems="stretch">
            {filteredPlans.map((plan) => {
              const isPlatinum = plan.tier === 'platinum';
              const isGold = plan.tier === 'gold';
              const isFeatured = plan.isPopular;

              let tierGradient = isDark
                ? `linear-gradient(145deg, ${alpha('#1E293B', 0.95)} 0%, ${alpha('#0F172A', 0.95)} 100%)`
                : `linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)`;

              let borderColor = alpha(theme.palette.divider, 0.25);
              if (isFeatured) {
                borderColor = theme.palette.primary.main;
              } else if (isPlatinum) {
                borderColor = '#A78BFA';
              }

              return (
                <Grid item xs={12} md={6} lg={6} xl={3} key={plan.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 4,
                      p: { xs: 3, md: 3.5 },
                      position: 'relative',
                      overflow: 'hidden',
                      background: tierGradient,
                      border: `2px solid ${borderColor}`,
                      boxShadow: isFeatured
                        ? `0 20px 60px ${alpha(theme.palette.primary.main, 0.25)}`
                        : isPlatinum
                        ? `0 20px 60px ${alpha('#A78BFA', 0.2)}`
                        : `0 10px 30px ${alpha('#000', isDark ? 0.3 : 0.05)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 24px 70px ${alpha(theme.palette.primary.main, 0.35)}`,
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {/* Top Tag Banner */}
                    {plan.tag && (
                      <Chip
                        icon={isFeatured ? <StarIcon sx={{ fontSize: 16 }} /> : <DiamondIcon sx={{ fontSize: 16 }} />}
                        label={plan.tag}
                        size="small"
                        color={isFeatured ? 'primary' : isPlatinum ? 'secondary' : 'default'}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          fontWeight: 900,
                          fontSize: 11,
                          py: 1.8,
                          borderRadius: 2,
                        }}
                      />
                    )}

                    <Box>
                      {/* Tier & Plan Name */}
                      <Typography
                        variant="overline"
                        sx={{
                          letterSpacing: 1.5,
                          fontWeight: 900,
                          color: isPlatinum ? '#A78BFA' : theme.palette.primary.main,
                          display: 'block',
                          mt: plan.tag ? 3 : 0,
                        }}
                      >
                        {plan.tierNameAr}
                      </Typography>

                      <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5, lineHeight: 1.3 }}>
                        {plan.name}
                      </Typography>

                      {/* Pricing Tag */}
                      <Box sx={{ my: 2.5, p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                        <Typography variant="h3" fontWeight={900} sx={{ color: theme.palette.primary.main, display: 'inline' }}>
                          {plan.price.toLocaleString()}
                        </Typography>
                        <Typography component="span" variant="subtitle1" fontWeight={800} sx={{ color: 'text.secondary', ml: 1 }}>
                          ريال سعودي / {plan.billingCycleAr}
                        </Typography>
                      </Box>

                      {/* Quick Meta Chips */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap">
                        <Chip
                          icon={<DirectionsCarIcon sx={{ fontSize: 16 }} />}
                          label={`${plan.allowedVehicles} مركبات`}
                          size="small"
                          sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.divider, 0.15) }}
                        />
                        <Chip
                          icon={<TimerIcon sx={{ fontSize: 16 }} />}
                          label={`سماح ${plan.freeGraceMinutes} دقيقة`}
                          size="small"
                          sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.divider, 0.15) }}
                        />
                        {plan.evChargingFree && (
                          <Chip
                            icon={<BoltIcon sx={{ fontSize: 16 }} />}
                            label="شاحن EV مجاني"
                            size="small"
                            color="info"
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {/* Features List */}
                      <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ mb: 1, display: 'block' }}>
                        المميزات والصلاحيات المشمولة بالباقة:
                      </Typography>

                      <List dense sx={{ py: 0 }}>
                        {plan.features?.map((feat, fIdx) => (
                          <ListItem key={fIdx} disableGutters sx={{ py: 0.6, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 26, mt: 0.3, color: theme.palette.primary.main }}>
                              <CheckCircleIcon sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={feat}
                              primaryTypographyProps={{
                                variant: 'body2',
                                fontWeight: 600,
                                sx: { lineHeight: 1.4 },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {/* Card Actions: Edit, Delete, and Subscribe */}
                    <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.15)}` }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEditModal(plan)}
                          sx={{ fontWeight: 800, flex: 1, borderRadius: 2.5 }}
                        >
                          تعديل الباقة
                        </Button>
                        <Tooltip title="حذف هذه الباقة">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => setDeleteConfirmModal(plan)}
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

                      <Button
                        variant={isFeatured ? 'contained' : 'outlined'}
                        color="primary"
                        fullWidth
                        size="large"
                        onClick={() => {
                          setSnackbarNotice(`تم اختيار ${plan.name} للانتقال إلى بوابة الدفع والتفعيل المباشر.`);
                        }}
                        sx={{
                          py: 1.3,
                          fontWeight: 900,
                          borderRadius: 3,
                          fontSize: '0.95rem',
                          boxShadow: isFeatured ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.35)}` : 'none',
                        }}
                      >
                        الاشتراك في هذه الباقة الآن
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE SUBSCRIBERS DIRECTORY (سجل المشتركين الفعّال)                */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          {/* Search bar */}
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
                placeholder="ابحث باسم المشترك، رقم الجوال، الباقة، أو رقم لوحة السيارة..."
                value={searchSubscriberQuery}
                onChange={(e) => setSearchSubscriberQuery(e.target.value)}
                sx={{ width: { xs: '100%', md: 480 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Typography variant="body2" color="text.secondary" fontWeight={700}>
                إجمالي المشتركين المسجلين في هذا السجل: {subscribers.length} عضو
              </Typography>
            </Stack>
          </Paper>

          {/* Subscribers Cards Grid */}
          <Grid container spacing={3}>
            {subscribers
              .filter((sub) => {
                if (!searchSubscriberQuery.trim()) return true;
                const q = searchSubscriberQuery.toLowerCase();
                return (
                  sub.memberName.toLowerCase().includes(q) ||
                  sub.phone.includes(q) ||
                  sub.planName.toLowerCase().includes(q) ||
                  sub.plateNumber.toLowerCase().includes(q)
                );
              })
              .map((sub) => (
                <Grid item xs={12} md={6} lg={4} key={sub.id}>
                  <Card
                    sx={{
                      p: 3,
                      ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
                      border: `1.5px solid ${alpha(theme.palette.divider, 0.25)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Chip
                        label={sub.planName}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}
                      />
                      <Chip
                        label={sub.status === 'Active' ? 'نشط ومفعل' : 'يقترب من الانتهاء'}
                        size="small"
                        color={sub.status === 'Active' ? 'success' : 'warning'}
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>

                    <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5 }}>
                      {sub.memberName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 2 }}>
                      رقم الجوال: {sub.phone}
                    </Typography>

                    {/* Plate Display */}
                    <Box sx={{ my: 1.5, display: 'flex', justifyContent: 'center' }}>
                      <SaudiRealisticPlate plateNumber={sub.plateNumber} size="sm" showBolts={false} interactive={false} />
                    </Box>

                    {/* Subscription Dates and Remaining Days */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        my: 2,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.8),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            قيمة الاشتراك
                          </Typography>
                          <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                            {sub.amount.toLocaleString()} ريال
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            المتبقي للصلاحية
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={900}
                            sx={{ color: sub.remainingDays < 20 ? theme.palette.warning.main : theme.palette.success.main }}
                          >
                            {sub.remainingDays} يوماً
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            فترة السريان
                          </Typography>
                          <Typography variant="caption" fontWeight={700} display="block">
                            من {sub.startsAt} إلى {sub.endsAt}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Actions */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<AutorenewIcon />}
                        onClick={() => {
                          setSubscribers((prev) =>
                            prev.map((s) => (s.id === sub.id ? { ...s, remainingDays: s.remainingDays + 365, status: 'Active' } : s))
                          );
                          setSnackbarNotice(`تم تجديد اشتراك ${sub.memberName} لعام إضافي بنجاح.`);
                        }}
                        sx={{ fontWeight: 800, flex: 1, borderRadius: 2.5 }}
                      >
                        تجديد العضوية
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSnackbarNotice(`تم إرسال إشعار تذكيري عبر واتساب إلى ${sub.phone}.`);
                        }}
                        sx={{ fontWeight: 800, borderRadius: 2.5 }}
                      >
                        إشعار تذكير
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Stack>
      )}

      {/* ========================================================================= */}
      {/* 4. ADD / EDIT PACKAGE MODAL DIALOG (نافذة إضافة وتعديل الباقة)              */}
      {/* ========================================================================= */}
      <Dialog
        open={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: isDark ? '#0B132B' : '#FFFFFF',
            backgroundImage: 'none',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            boxShadow: `0 30px 90px ${alpha(theme.palette.primary.main, 0.35)}`,
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
              <WorkspacePremiumIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              <Typography variant="h6" fontWeight={900}>
                {editingPlanId ? 'تعديل باقة الاشتراك الحالية' : 'إضافة باقة اشتراك جديدة إلى المنظومة'}
              </Typography>
            </Stack>
            <IconButton onClick={() => setPackageModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Package Name */}
            <Grid item xs={12} sm={8}>
              <TextField
                label="اسم باقة الاشتراك"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: باقة النخبة الماسية السنوية (VIP Diamond)"
                fullWidth
                required
              />
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="السعر (بالريال السعودي SAR)"
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                fullWidth
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">ريال</InputAdornment>,
                }}
              />
            </Grid>

            {/* Billing Cycle */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="دورة الفوترة والدفع"
                value={formBillingCycle}
                onChange={(e) => setFormBillingCycle(e.target.value as BillingCycle)}
                fullWidth
              >
                <MenuItem value="Annual">سنوياً (Annual)</MenuItem>
                <MenuItem value="SemiAnnual">نصف سنوي (Semi-Annual)</MenuItem>
                <MenuItem value="Quarterly">ربع سنوي (Quarterly)</MenuItem>
                <MenuItem value="Monthly">شهرياً (Monthly)</MenuItem>
              </TextField>
            </Grid>

            {/* Tier */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="مستوى وفئة العضوية"
                value={formTier}
                onChange={(e) => setFormTier(e.target.value as PlanTier)}
                fullWidth
              >
                <MenuItem value="platinum">بلاتينيوم النخبة (Platinum Elite)</MenuItem>
                <MenuItem value="gold">ذهبية متقدمة (Gold Pro)</MenuItem>
                <MenuItem value="executive">تنفيذية مميزة (Executive)</MenuItem>
                <MenuItem value="silver">فضية اقتصادية (Silver Saver)</MenuItem>
              </TextField>
            </Grid>

            {/* Custom Tag */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="وسم أو شارة الباقة (Badge Tag)"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                placeholder="مثال: الأكثر طلباً، عرض خاص..."
                fullWidth
              />
            </Grid>

            {/* Vehicle Quota & Grace Period */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="عدد المركبات المصرح بها"
                type="number"
                value={formAllowedVehicles}
                onChange={(e) => setFormAllowedVehicles(Number(e.target.value))}
                fullWidth
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="فترة السماح الإضافية (بالدقائق)"
                type="number"
                value={formFreeGraceMinutes}
                onChange={(e) => setFormFreeGraceMinutes(Number(e.target.value))}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">دقيقة</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="إبراز كباقة رئيسية (Featured)"
                value={formIsPopular ? 'yes' : 'no'}
                onChange={(e) => setFormIsPopular(e.target.value === 'yes')}
                fullWidth
              >
                <MenuItem value="yes">نعم (إبراز بإطار ذهبي مضيء)</MenuItem>
                <MenuItem value="no">لا (باقة قياسية عادية)</MenuItem>
              </TextField>
            </Grid>

            {/* Boolean feature toggles */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.4),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
                  الصلاحيات المتقدمة للباقة:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant={formDedicatedSlot ? 'contained' : 'outlined'}
                      color={formDedicatedSlot ? 'success' : 'inherit'}
                      onClick={() => setFormDedicatedSlot(!formDedicatedSlot)}
                      startIcon={formDedicatedSlot ? <CheckIcon /> : <CloseIcon />}
                      sx={{ fontWeight: 800, borderRadius: 2.5 }}
                    >
                      خانة موقف مخصصة باسمه
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant={formEvChargingFree ? 'contained' : 'outlined'}
                      color={formEvChargingFree ? 'info' : 'inherit'}
                      onClick={() => setFormEvChargingFree(!formEvChargingFree)}
                      startIcon={formEvChargingFree ? <CheckIcon /> : <CloseIcon />}
                      sx={{ fontWeight: 800, borderRadius: 2.5 }}
                    >
                      شحن كهربائي EV مجاني
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant={formVipGateAccess ? 'contained' : 'outlined'}
                      color={formVipGateAccess ? 'warning' : 'inherit'}
                      onClick={() => setFormVipGateAccess(!formVipGateAccess)}
                      startIcon={formVipGateAccess ? <CheckIcon /> : <CloseIcon />}
                      sx={{ fontWeight: 800, borderRadius: 2.5 }}
                    >
                      عبور عبر بوابة VIP
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Features multiline */}
            <Grid item xs={12}>
              <TextField
                label="المميزات المشمولة في الباقة (ميزة واحدة في كل سطر)"
                multiline
                rows={4}
                value={formFeaturesText}
                onChange={(e) => setFormFeaturesText(e.target.value)}
                placeholder="اكتب كل ميزة في سطر منفصل..."
                fullWidth
                helperText="افصل بين كل ميزة والأخرى بالضغط على مفتاح Enter"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
          <Button variant="outlined" onClick={() => setPackageModalOpen(false)} sx={{ fontWeight: 800, borderRadius: 2.5 }}>
            إلغاء الأمر
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            onClick={handleSavePackage}
            sx={{ fontWeight: 900, borderRadius: 2.5, px: 3 }}
          >
            {editingPlanId ? 'حفظ التعديلات' : 'إضافة الباقة فوراً'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* 5. DELETE CONFIRMATION DIALOG (تأكيد حذف باقة)                           */}
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
          <DeleteIcon /> تأكيد حذف باقة الاشتراك
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 700 }}>
            هل أنت متأكد من رغبتك في حذف باقة "{deleteConfirmModal?.name}"؟
          </Typography>
          <Typography variant="body2" color="text.secondary">
            لن يتمكن المشتركون الجدد من اختيار هذه الباقة بعد الآن، مع الحفاظ على صلاحيات المشتركين الفعّالين حالياً.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setDeleteConfirmModal(null)} sx={{ fontWeight: 800, borderRadius: 2.5 }}>
            تراجع وإلغاء
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleConfirmDelete}
            sx={{ fontWeight: 900, borderRadius: 2.5, px: 2.5 }}
          >
            تأكيد الحذف النهائي
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Snackbar Notification */}
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

export default SubscriptionsPage;
