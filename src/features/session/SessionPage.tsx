import { useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../core/auth/authContext';
import {
  useCapturePayment,
  useCurrentSession,
  useEndSession,
  useLiveSessions,
} from '../../core/api/hooks';
import type { ParkingSession } from '../../core/api/types';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { EmptyState } from '../../app/EmptyState';
import { PlateText } from '../../app/PlateText';
import { GraceStatus } from './GraceStatus';
import { durationParts, parseUtcMillis, useNow } from '../../core/parking/grace';
import { displayCurrency, displaySiteName, formatLocalDateTime } from '../../core/display';
import { Glyphs, IconTile } from '../../app/icons';
import { brand, glowPanel } from '../../app/theme';
import { ApiError } from '../../core/api/errors';
import { config } from '../../core/config';

function isOpsRole(role?: string) {
  return role === 'admin' || role === 'building-op' || role === 'cashier';
}

export function SessionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const ops = isOpsRole(user?.role);
  const mine = useCurrentSession();
  const live = useLiveSessions(ops);
  const now = useNow(true);

  const personal = mine.data ?? null;
  const liveRows = live.data ?? [];

  if (ops) {
    const open = liveRows.filter((row) => row.status === 'Open').length;
    const paid = liveRows.filter((row) => row.status === 'Paid').length;
    return (
      <Stack spacing={2.75}>
        <PageHeader
          eyebrow={t('nav.groupParking')}
          title={t('session.title')}
          hint={t('session.opsHint')}
          actions={<Chip size="small" color="success" label={t('occupancy.live')} />}
        />
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          <Metric label={t('session.liveNow')} value={liveRows.length} tone={brand.amber} />
          <Metric label={t('session.openNow')} value={open} tone={brand.coral} />
          <Metric label={t('session.paidNow')} value={paid} tone={brand.teal} />
        </Box>
        <AsyncBody
          isLoading={live.isLoading}
          error={live.error}
          onRetry={() => void live.refetch()}
          isEmpty={liveRows.length === 0}
          empty={
            <EmptyState
              icon={Glyphs.session}
              tone="coral"
              title={t('session.opsEmptyTitle')}
              body={t('session.opsEmptyBody')}
              actions={[
                { to: '/occupancy', label: t('session.openOccupancy'), variant: 'contained' as const },
                ...(user?.role === 'admin'
                  ? [
                      { to: '/admin/free-places', label: t('freePlaces.navShort') },
                      { to: '/admin/lpr', label: t('nav.lpr') },
                    ]
                  : [{ to: '/receipts', label: t('nav.receipts') }]),
              ]}
            />
          }
        >
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            {liveRows.map((row) => (
              <SessionCard key={row.sessionId} session={row} now={now} ops />
            ))}
          </Box>
        </AsyncBody>
      </Stack>
    );
  }

  const emptyKey =
    user?.role === 'citizen'
      ? 'session.emptyCitizen'
      : user?.role === 'employee'
        ? 'session.emptyEmployee'
        : 'session.empty';

  return (
    <Stack spacing={2.75} maxWidth={760}>
      <PageHeader eyebrow={t('nav.groupParking')} title={t('session.title')} hint={t('session.pageHint')} />
      <AsyncBody
        isLoading={mine.isLoading}
        error={mine.error}
        onRetry={() => void mine.refetch()}
        isEmpty={!personal}
        empty={
          <EmptyState
            icon={Glyphs.session}
            tone="coral"
            title={t('session.emptyTitle')}
            body={t(emptyKey)}
            actions={[
              { to: '/occupancy', label: t('session.openOccupancy'), variant: 'contained' },
              { to: '/find-car', label: t('nav.findCar') },
              ...(user?.role === 'citizen' || user?.role === 'employee'
                ? [
                    { to: '/subscriptions', label: t('nav.subscriptions') },
                    { to: '/reservations', label: t('nav.reservations') },
                  ]
                : [{ to: '/profile', label: t('session.addPlate') }]),
            ]}
          />
        }
      >
        {personal && <SessionCard session={personal} now={now} />}
      </AsyncBody>
    </Stack>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Box sx={{ ...glowPanel(tone), p: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ color: tone }}>
        {value}
      </Typography>
    </Box>
  );
}

function SessionCard({
  session,
  now,
  ops,
}: {
  session: ParkingSession;
  now: number;
  ops?: boolean;
}) {
  const { t } = useTranslation();
  const capturePayment = useCapturePayment();
  const endSession = useEndSession();
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showPay = session.status === 'Open';
  const showGrace = session.status === 'Paid' || Boolean(session.graceUntil);
  const elapsed = session.startedAt ? durationParts(now - parseUtcMillis(session.startedAt)) : null;
  const edge = session.status === 'Open' ? brand.coral : session.status === 'Paid' ? brand.teal : brand.amber;
  const lot = displaySiteName(session.parkingName) || session.parkingName;

  const handlePayConfirm = () => {
    setErrorMessage(null);
    capturePayment.mutate(session, {
      onSuccess: () => {
        setPayDialogOpen(false);
      },
      onError: (err) => {
        setErrorMessage(err instanceof ApiError ? err.message : t('common.error'));
      },
    });
  };

  const handleEndConfirm = () => {
    setErrorMessage(null);
    endSession.mutate(session.sessionId, {
      onSuccess: () => {
        setEndDialogOpen(false);
      },
      onError: (err) => {
        setErrorMessage(err instanceof ApiError ? err.message : t('common.error'));
      },
    });
  };

  return (
    <Box sx={{ ...glowPanel(edge), p: 2.75 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <IconTile tone={session.status === 'Open' ? 'coral' : 'teal'} size={48} pulse={session.status === 'Open'}>
          {Glyphs.session}
        </IconTile>
        <Stack spacing={0.35} flex={1}>
          <Typography variant="overline" color="text.secondary">
            {t('session.status')}
          </Typography>
          <Typography variant="h5">{t(`session.${session.status}`)}</Typography>
        </Stack>
        <Chip
          size="small"
          label={`#${session.sessionId}`}
          sx={{ bgcolor: alpha(edge, 0.14), color: edge, fontWeight: 800 }}
        />
      </Stack>
      <Stack spacing={0.15}>
        {session.plate && <Row label={t('session.plate')} value={<PlateText>{session.plate}</PlateText>} />}
        {lot && <Row label={t('session.lot')} value={lot} />}
        {session.placeName && <Row label={t('session.place')} value={session.placeName} />}
        {session.buildingId != null && <Row label={t('session.building')} value={session.buildingId} />}
        {session.gateId != null && <Row label={t('session.gate')} value={session.gateId} />}
        {session.startedAt && (
          <Row label={t('session.startedAt')} value={formatLocalDateTime(session.startedAt)} />
        )}
        {elapsed && (
          <Row
            label={t('session.duration')}
            value={
              elapsed.hours > 0
                ? t('session.durationLong', elapsed)
                : t('session.durationShort', {
                    minutes: elapsed.minutes,
                    seconds: String(elapsed.seconds).padStart(2, '0'),
                  })
            }
          />
        )}
        {session.amountDue != null && (
          <Row
            label={session.status === 'Open' ? t('session.amountDue') : t('receipts.amount')}
            value={`${session.amountDue} ${displayCurrency(session.currency)}`}
          />
        )}
      </Stack>
      {showGrace && (
        <Stack sx={{ mt: 2 }}>
          <GraceStatus
            graceUntil={session.graceUntil}
            extraFee={session.extraFee}
            extraFeeCurrency={session.extraFeeCurrency ?? session.currency}
          />
        </Stack>
      )}
      <Stack direction="row" gap={1.25} flexWrap="wrap" sx={{ mt: 2.5 }}>
        {showPay && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setErrorMessage(null);
              setPayDialogOpen(true);
            }}
          >
            {t('session.pay')}
          </Button>
        )}
        {(ops || session.status === 'Paid') && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setErrorMessage(null);
              setEndDialogOpen(true);
            }}
            sx={{
              borderColor: alpha(brand.coral, 0.5),
              color: brand.coral,
              '&:hover': {
                borderColor: brand.coral,
                bgcolor: alpha(brand.coral, 0.08),
              },
            }}
          >
            {t('session.endSession')}
          </Button>
        )}
        {session.status === 'Paid' && (
          <Button component={RouterLink} to={`/receipts/${session.sessionId}`} variant="outlined">
            {t('session.viewReceipt')}
          </Button>
        )}
        {(session.status === 'Paid' || session.status === 'Closed') && !ops && (
          <Button component={RouterLink} to="/pass" variant="outlined">
            {t('nav.pass')}
          </Button>
        )}
        {ops && (
          <Button component={RouterLink} to="/occupancy" variant="outlined">
            {t('session.openOccupancy')}
          </Button>
        )}
      </Stack>

      {/* Quick Pay Dialog */}
      <Dialog
        open={payDialogOpen}
        onClose={() => !capturePayment.isPending && setPayDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            ...glowPanel(brand.teal),
            border: `1px solid ${alpha(brand.teal, 0.4)}`,
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{t('session.quickPayTitle')}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: alpha(brand.ink, 0.12) }}>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {t('session.quickPayHint')}
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(brand.ink, 0.05),
                border: `1px solid ${alpha(brand.ink, 0.08)}`,
              }}
            >
              <Stack spacing={1}>
                {session.plate && <Row label={t('session.plate')} value={<PlateText>{session.plate}</PlateText>} />}
                <Row label={t('receipts.sessionId')} value={`#${session.sessionId}`} />
                {lot && <Row label={t('session.lot')} value={lot} />}
                {session.placeName && <Row label={t('session.place')} value={session.placeName} />}
                <Row
                  label={t('session.amountDue')}
                  value={
                    <Typography fontWeight={800} color="secondary.main" variant="h6">
                      {session.amountDue ?? 0} {displayCurrency(session.currency)}
                    </Typography>
                  }
                />
              </Stack>
            </Box>
            <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
              {t('payment.note', { minutes: config.graceMinutes })}
            </Alert>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 2 }}>
          <Button
            variant="text"
            disabled={capturePayment.isPending}
            onClick={() => setPayDialogOpen(false)}
          >
            {t('session.cancel')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={capturePayment.isPending}
            onClick={handlePayConfirm}
            startIcon={capturePayment.isPending ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ fontWeight: 700, minWidth: 140 }}
          >
            {t('session.confirmPayment')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Session Confirmation Dialog */}
      <Dialog
        open={endDialogOpen}
        onClose={() => !endSession.isPending && setEndDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            ...glowPanel(brand.coral),
            border: `1px solid ${alpha(brand.coral, 0.4)}`,
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: brand.coral, pb: 1 }}>{t('session.endSession')}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: alpha(brand.ink, 0.12) }}>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body1">
              {t('session.endSessionConfirm', {
                sessionId: session.sessionId,
                plate: session.plate || `#${session.sessionId}`,
              })}
            </Typography>
            {session.status === 'Open' && (
              <Alert severity="warning" sx={{ fontSize: '0.85rem' }}>
                {t('session.amountDue')}: {session.amountDue ?? 0} {displayCurrency(session.currency)}. سيتم إغلاق الجلسة وتحرير مكان الركن فوراً.
              </Alert>
            )}
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 2 }}>
          <Button
            variant="text"
            disabled={endSession.isPending}
            onClick={() => setEndDialogOpen(false)}
          >
            {t('session.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={endSession.isPending}
            onClick={handleEndConfirm}
            startIcon={endSession.isPending ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ fontWeight: 700, minWidth: 140 }}
          >
            {t('session.endSession')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      gap={2}
      sx={{
        py: 1,
        borderBottom: `1px dashed ${alpha(brand.ink, 0.08)}`,
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={600}>{value}</Typography>
    </Stack>
  );
}
