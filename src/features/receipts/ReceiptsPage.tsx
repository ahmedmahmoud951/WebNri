import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { EmptyState } from '../../app/EmptyState';
import { useAuth } from '../../core/auth/authContext';
import { useHistory } from '../../core/api/hooks';
import { displayCurrency } from '../../core/display';
import { Glyphs } from '../../app/icons';
import { brand, glowPanel } from '../../app/theme';
import { ReceiptCard } from './ReceiptCard';

export function ReceiptsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const history = useHistory();
  const items = history.data ?? [];
  const total = items.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const currency = items[0]?.currency;
  const ops = user?.role === 'admin' || user?.role === 'building-op' || user?.role === 'cashier';

  return (
    <Stack spacing={2.75} className="nri-print-root">
      <PageHeader
        title={t('receipts.title')}
        hint={ops ? t('receipts.opsHint') : t('receipts.hint')}
        actions={
          items.length > 0 ? (
            <Button variant="outlined" onClick={() => window.print()} className="nri-no-print">
              {t('receipts.print')}
            </Button>
          ) : undefined
        }
      />
      {items.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          <Box sx={{ ...glowPanel(brand.teal), p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('receipts.count')}
            </Typography>
            <Typography variant="h4" sx={{ color: brand.teal }}>
              {items.length}
            </Typography>
          </Box>
          <Box sx={{ ...glowPanel(brand.amber), p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('receipts.totalPaid')}
            </Typography>
            <Typography variant="h5" sx={{ color: brand.amber }}>
              {total} {displayCurrency(currency)}
            </Typography>
          </Box>
        </Box>
      )}
      <AsyncBody
        isLoading={history.isLoading}
        error={history.error}
        onRetry={() => void history.refetch()}
        isEmpty={items.length === 0}
        empty={
          <EmptyState
            icon={Glyphs.history}
            tone="sky"
            title={t('receipts.emptyTitle')}
            body={ops ? t('receipts.emptyOps') : t('receipts.empty')}
            actions={[
              { to: '/session', label: t('nav.session'), variant: 'contained' },
              { to: '/occupancy', label: t('session.openOccupancy') },
              { to: '/pay', label: t('session.pay') },
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
          {items.map((item) => (
            <ReceiptCard
              key={`${item.sessionId}-${item.paidAt}`}
              receipt={item}
              to={`/receipts/${item.sessionId}`}
            />
          ))}
        </Box>
      </AsyncBody>
    </Stack>
  );
}
