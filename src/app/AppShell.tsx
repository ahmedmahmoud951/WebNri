import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import VideocamIcon from '@mui/icons-material/Videocam';
import MapIcon from '@mui/icons-material/Map';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TimelineIcon from '@mui/icons-material/Timeline';
import TimerIcon from '@mui/icons-material/Timer';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FenceIcon from '@mui/icons-material/Fence';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import { useAuth } from '../core/auth/authContext';
import { persistLocale, type AppLocale } from '../core/i18n';
import { displayPersonName } from '../core/display';
import { brandMarkTile } from './icons';
import { brand, glassPanel, useThemeMode } from './theme';

const drawerWidth = 285;

interface NavItemDef {
  to: string;
  labelAr: string;
  labelEn: string;
  icon: JSX.Element;
  end?: boolean;
  highlight?: boolean;
}

export function AppShell() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();

  const isEn = i18n.language.startsWith('en');

  const navCategories = useMemo(
    () => [
      {
        id: 'command',
        title: isEn ? 'CONTROL & REALTIME' : '🚀 القيادة والعمليات الحية',
        items: [
          { to: '/dashboard', labelAr: 'لوحة القيادة التنفيذية', labelEn: 'Executive Dashboard', icon: <DashboardIcon /> },
          { to: '/live-monitor', labelAr: 'المراقبة اللحظية LPR', labelEn: 'Live Monitor', icon: <VideocamIcon /> },
          { to: '/floor-maps', labelAr: 'خريطة الأدوار التفاعلية', labelEn: 'Interactive Floor Maps', icon: <MapIcon /> },
          { to: '/find-my-car', labelAr: 'أين سيارتي والملاحة', labelEn: 'Find My Car', icon: <LocationSearchingIcon /> },
          { to: '/operations', labelAr: 'مركز العمليات الميدانية', labelEn: 'Operations Center', icon: <PrecisionManufacturingIcon /> },
          { to: '/alarms', labelAr: 'التنبيهات والأمان', labelEn: 'Alarms Center', icon: <WarningAmberIcon /> },
        ],
      },
      {
        id: 'resident',
        title: isEn ? 'VEHICLES & SERVICES' : '🚗 المركبات والمشتركين',
        items: [
          { to: '/vehicles', labelAr: 'مركباتي المسجلة', labelEn: 'My Vehicles', icon: <DirectionsCarIcon /> },
          { to: '/digital-card', labelAr: 'البطاقة الرقمية QR', labelEn: 'Digital Pass Card', icon: <QrCode2Icon /> },
          { to: '/subscriptions', labelAr: 'الاشتراكات والباقات', labelEn: 'Subscriptions', icon: <CardMembershipIcon /> },
          { to: '/reservations', labelAr: 'حجوزات المواقف', labelEn: 'Reservations', icon: <BookmarkAddedIcon /> },
          { to: '/guest-invites', labelAr: 'دعوات وتصاريح الزوار', labelEn: 'Guest Invitations', icon: <PersonPinCircleIcon /> },
          { to: '/parking-sessions', labelAr: 'جلسات الوقوف', labelEn: 'Parking Sessions', icon: <TimelineIcon /> },
          { to: '/grace-period', labelAr: 'مراقبة فترات السماح', labelEn: 'Grace Period', icon: <TimerIcon /> },
        ],
      },
      {
        id: 'finance',
        title: isEn ? 'FINANCE & BILLING' : '💳 المالية والمدفوعات',
        items: [
          { to: '/saudi-payments', labelAr: 'بوابات الدفع والبنوك السعودية', labelEn: 'Saudi Payments & Banks', icon: <PaymentIcon />, highlight: true },
          { to: '/wallet', labelAr: 'المحفظة الرقمية', labelEn: 'Digital Wallet', icon: <AccountBalanceWalletIcon /> },
          { to: '/payments', labelAr: 'سجل المدفوعات', labelEn: 'Payments Center', icon: <PaymentIcon /> },
          { to: '/invoices', labelAr: 'الفواتير الضريبية', labelEn: 'Tax Invoices', icon: <ReceiptIcon /> },
        ],
      },
      {
        id: 'hardware',
        title: isEn ? 'HARDWARE & IOT' : '⚡ البوابات والتجهيزات الميدانية',
        items: [
          { to: '/barriers', labelAr: 'الحواجز الإلكترونية', labelEn: 'Barriers Console', icon: <FenceIcon /> },
          { to: '/cameras', labelAr: 'كاميرات المراقبة', labelEn: 'Cameras Network', icon: <VideocamIcon /> },
          { to: '/gates', labelAr: 'البوابات الذكية', labelEn: 'Smart Gates', icon: <MeetingRoomIcon /> },
          { to: '/lpr', labelAr: 'محرك التعرف LPR', labelEn: 'LPR Recognition Hub', icon: <CameraAltIcon /> },
          { to: '/system-health', labelAr: 'تشخيص وصحة النظام', labelEn: 'System Health', icon: <HealthAndSafetyIcon /> },
          { to: '/simulation-suite', labelAr: 'مركز العمليات والمحاكاة الذكية', labelEn: 'Operations & Simulation Suite', icon: <PlayCircleOutlineIcon />, highlight: true },
        ],
      },
      {
        id: 'admin',
        title: isEn ? 'ADMINISTRATION' : '⚙️ الإدارة والتقارير',
        items: [
          { to: '/reports', labelAr: 'التقارير والإحصائيات', labelEn: 'Analytics & Reports', icon: <AssessmentIcon /> },
          { to: '/users', labelAr: 'إدارة المستخدمين', labelEn: 'User Management', icon: <PeopleIcon /> },
          { to: '/roles', labelAr: 'مصفوفة الصلاحيات', labelEn: 'Roles Matrix', icon: <SecurityIcon /> },
          { to: '/audit-logs', labelAr: 'سجل التدقيق الأمني', labelEn: 'Audit Logs', icon: <HistoryIcon /> },
          { to: '/notifications', labelAr: 'مركز الإشعارات', labelEn: 'Notifications', icon: <NotificationsIcon /> },
          { to: '/profile', labelAr: 'الملف الشخصي', labelEn: 'Profile', icon: <AccountCircleIcon /> },
          { to: '/settings', labelAr: 'إعدادات النظام', labelEn: 'System Settings', icon: <SettingsIcon /> },
        ],
      },
    ],
    [isEn]
  );

  const drawerContent = (
    <Box sx={{ py: 2, height: '100%', overflowY: 'auto' }}>
      {/* Brand logo in drawer */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2.5, pb: 2.5 }}>
        {brandMarkTile(46)}
        <Box>
          <Typography sx={{ fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 900, letterSpacing: 1.5, fontSize: 16 }}>
            NRI Parking
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10.5 }}>
            Enterprise Smart Ecosystem
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: theme.palette.divider, mb: 1 }} />

      {/* Nav Lists */}
      {navCategories.map((cat) => (
        <List
          key={cat.id}
          subheader={
            <ListSubheader
              sx={{
                bgcolor: 'transparent',
                lineHeight: 2.2,
                fontSize: 10.5,
                fontWeight: 800,
                color: 'text.secondary',
                px: 2.5,
                letterSpacing: 0.5,
              }}
            >
              {cat.title}
            </ListSubheader>
          }
        >
          {cat.items.map((item) => {
            const isSelected = location.pathname === item.to;
            const label = isEn ? item.labelEn : item.labelAr;
            return (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                selected={isSelected}
                onClick={() => setMobileOpen(false)}
                sx={{
                  py: 1,
                  px: 2,
                  mx: 1.25,
                  my: 0.25,
                  borderRadius: '10px',
                  bgcolor: item.highlight ? alpha(theme.palette.secondary.main, 0.12) : undefined,
                  border: item.highlight ? `1px dashed ${alpha(theme.palette.secondary.main, 0.4)}` : undefined,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isSelected
                      ? theme.palette.primary.main
                      : item.highlight
                      ? theme.palette.secondary.main
                      : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: isSelected || item.highlight ? 800 : 600,
                    color: isSelected
                      ? theme.palette.primary.main
                      : item.highlight
                      ? theme.palette.secondary.main
                      : 'text.primary',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top Mission Control App Bar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} color="inherit">
                <MenuIcon />
              </IconButton>
            )}

            <Stack direction="row" spacing={1.5} alignItems="center">
              {brandMarkTile(38)}
              <Box>
                <Typography sx={{ fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 800, fontSize: 16 }}>
                  NRI Smart Parking
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Enterprise Mission Control Platform
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Right Toolbar Actions */}
          <Stack direction="row" spacing={1.25} alignItems="center">
            {/* Quick Operations Simulator CTA */}
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() => navigate('/simulation-suite')}
              sx={{
                fontWeight: 800,
                display: { xs: 'none', sm: 'inline-flex' },
                background: 'linear-gradient(135deg, #0284C7, #00F0FF)',
                color: '#080D1A',
                boxShadow: '0 4px 16px rgba(0, 240, 255, 0.35)',
              }}
            >
              {!isEn ? 'محاكي العمليات الذكية' : 'Operations Suite'}
            </Button>

            {/* Dark / Light Theme Toggle */}
            <Tooltip title={mode === 'dark' ? 'الوضع النهاري (Light Mode)' : 'الوضع الليلي (Dark Mode)'}>
              <IconButton onClick={toggleMode} color="inherit" size="small">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Language Switcher */}
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={() => {
                const next: AppLocale = isEn ? 'ar' : 'en';
                void i18n.changeLanguage(next);
                persistLocale(next);
              }}
              sx={{ borderRadius: '20px', px: 1.5, fontWeight: 700 }}
            >
              {isEn ? 'العربية' : 'English'}
            </Button>

            {/* User Chip */}
            <Chip
              avatar={<AccountCircleIcon />}
              label={displayPersonName(user?.displayName) || (user as any)?.userName || 'Admin'}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ fontWeight: 700, display: { xs: 'none', md: 'inline-flex' } }}
            />

            {/* Logout */}
            <Tooltip title="تسجيل الخروج">
              <IconButton onClick={logout} color="error" size="small">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Responsive Navigation Drawer */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              top: 64,
              height: 'calc(100% - 64px)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 4 },
          mt: 8,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
