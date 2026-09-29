import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../core/auth/authContext';
import { AppShell } from './AppShell';

// Auth & Public Pages
import { LoginPage } from '../features/login/LoginPage';
import { RegisterPage } from '../features/register/RegisterPage';
import { ForgotPasswordPage } from '../features/forgot-password/ForgotPasswordPage';
import { GuestPassPage } from '../features/guest-pass/GuestPassPage';

// Main App Pages
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { LiveMonitorPage } from '../features/live-monitor/LiveMonitorPage';
import { FloorMapsPage } from '../features/floor-maps/FloorMapsPage';
import { FindCarPage } from '../features/find-car/FindCarPage';
import { VehiclesPage } from '../features/vehicles/VehiclesPage';
import { SubscriptionsPage } from '../features/subscriptions/SubscriptionsPage';
import { DigitalCardPage } from '../features/digital-card/DigitalCardPage';
import { ReservationsPage } from '../features/reservations/ReservationsPage';
import { GuestInvitesPage } from '../features/guest-invites/GuestInvitesPage';
import { WalletPage } from '../features/wallet/WalletPage';
import { PaymentsPage } from '../features/payments/PaymentsPage';
import { InvoicesPage } from '../features/invoices/InvoicesPage';
import { ParkingSessionsPage } from '../features/parking-sessions/ParkingSessionsPage';
import { GracePeriodPage } from '../features/grace-period/GracePeriodPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { SettingsPage } from '../features/settings/SettingsPage';

// Ops, Telemetry & Admin Pages
import { OperationsCenterPage } from '../features/operations-center/OperationsCenterPage';
import { AlarmsPage } from '../features/alarms/AlarmsPage';
import { CamerasPage } from '../features/cameras/CamerasPage';
import { BarriersPage } from '../features/barriers/BarriersPage';
import { GatesPage } from '../features/gates/GatesPage';
import { LprPage } from '../features/lpr/LprPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { UsersPage } from '../features/users/UsersPage';
import { RolesPage } from '../features/roles/RolesPage';
import { AuditLogsPage } from '../features/audit-logs/AuditLogsPage';
import { SystemHealthPage } from '../features/system-health/SystemHealthPage';
import { DemoControlPage } from '../features/demo-control/DemoControlPage';

// Legacy compatibility
import { ReceiptsPage } from '../features/receipts/ReceiptsPage';
import { ReceiptDetailPage } from '../features/receipts/ReceiptDetailPage';
import { EvChargersPage } from '../features/ev/EvChargersPage';
import { TicketsPage } from '../features/tickets/TicketsPage';
import { GateSimulatorPage } from '../features/simulator/GateSimulatorPage';

function Splash() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

function GuestOnly() {
  const { status } = useAuth();
  if (status === 'unknown') return <Splash />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function RequireAuth() {
  const { status } = useAuth();
  if (status === 'unknown') return <Splash />;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  // Public Guest-Only Routes
  {
    element: <GuestOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Public Access Passes (No login required)
  { path: '/guest-pass', element: <GuestPassPage /> },
  { path: '/invite', element: <GuestPassPage /> },

  // Authenticated Protected App Routes
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Dashboard & Command
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/live-monitor', element: <LiveMonitorPage /> },
          { path: '/floor-maps', element: <FloorMapsPage /> },
          { path: '/occupancy', element: <FloorMapsPage /> },
          { path: '/find-my-car', element: <FindCarPage /> },
          { path: '/find-car', element: <FindCarPage /> },

          // Client & Resident Features
          { path: '/vehicles', element: <VehiclesPage /> },
          { path: '/subscriptions', element: <SubscriptionsPage /> },
          { path: '/digital-card', element: <DigitalCardPage /> },
          { path: '/pass', element: <DigitalCardPage /> },
          { path: '/reservations', element: <ReservationsPage /> },
          { path: '/guest-invites', element: <GuestInvitesPage /> },
          { path: '/wallet', element: <WalletPage /> },
          { path: '/payments', element: <PaymentsPage /> },
          { path: '/pay', element: <PaymentsPage /> },
          { path: '/invoices', element: <InvoicesPage /> },
          { path: '/billing', element: <InvoicesPage /> },
          { path: '/parking-sessions', element: <ParkingSessionsPage /> },
          { path: '/session', element: <ParkingSessionsPage /> },
          { path: '/grace-period', element: <GracePeriodPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },

          // Operations & Telemetry
          { path: '/operations', element: <OperationsCenterPage /> },
          { path: '/admin/operations-center', element: <OperationsCenterPage /> },
          { path: '/alarms', element: <AlarmsPage /> },
          { path: '/cameras', element: <CamerasPage /> },
          { path: '/admin/cameras', element: <CamerasPage /> },
          { path: '/barriers', element: <BarriersPage /> },
          { path: '/admin/barriers', element: <BarriersPage /> },
          { path: '/gates', element: <GatesPage /> },
          { path: '/admin/gates', element: <GatesPage /> },
          { path: '/lpr', element: <LprPage /> },
          { path: '/admin/lpr', element: <LprPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/admin/reports', element: <ReportsPage /> },

          // Admin & System Control
          { path: '/users', element: <UsersPage /> },
          { path: '/admin/users', element: <UsersPage /> },
          { path: '/admin/users-manage', element: <UsersPage /> },
          { path: '/roles', element: <RolesPage /> },
          { path: '/audit-logs', element: <AuditLogsPage /> },
          { path: '/system-health', element: <SystemHealthPage /> },
          { path: '/demo-control', element: <DemoControlPage /> },
          { path: '/admin/simulator', element: <DemoControlPage /> },

          // Legacy routes compatibility
          { path: '/receipts/:sessionId', element: <ReceiptDetailPage /> },
          { path: '/receipts', element: <ReceiptsPage /> },
          { path: '/ev', element: <EvChargersPage /> },
          { path: '/tickets', element: <TicketsPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
