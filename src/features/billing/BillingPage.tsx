import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { useInvoices } from '../../core/api/hooks';
import { displayCurrency, formatLocalDateTime } from '../../core/display';
import type { InvoiceStatus } from '../../core/api/types';

function chipColor(status: InvoiceStatus) {
  if (status === 'Paid') return 'success' as const;
  if (status === 'Overdue') return 'error' as const;
  if (status === 'Due') return 'warning' as const;
  return 'default' as const;
}

export function BillingPage() {
  const { t } = useTranslation();
  const invoices = useInvoices();
  const items = invoices.data ?? [];

  return (
    <Stack spacing={2} maxWidth={640}>
      <PageHeader title={t('billing.title')} hint={t('billing.hint')} />
      <AsyncBody
        isLoading={invoices.isLoading}
        error={invoices.error}
        onRetry={() => void invoices.refetch()}
        isEmpty={!items.length}
        empty={<Typography color="text.secondary">{t('billing.empty')}</Typography>}
      >
        <Stack spacing={1.5}>
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{item.title}</Typography>
                    <Chip size="small" label={t(`billing.status.${item.status}`)} color={chipColor(item.status)} />
                  </Stack>
                  <Typography>
                    {item.amount} {displayCurrency(item.currency)}
                  </Typography>
                  {item.period && (
                    <Typography color="text.secondary" variant="body2">
                      {item.period}
                    </Typography>
                  )}
                  {item.dueAt && (
                    <Typography color="text.secondary" variant="body2">
                      {t('billing.dueAt')}: {formatLocalDateTime(item.dueAt)}
                    </Typography>
                  )}
                  <Typography color="text.secondary" variant="body2">
                    {t('billing.noPay')}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </AsyncBody>
    </Stack>
  );
}
