import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCapturePayment, useCurrentSession, useSession } from '../../core/api/hooks';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { config } from '../../core/config';
import { displayCurrency } from '../../core/display';
import { ApiError } from '../../core/api/errors';
import { GraceStatus } from '../session/GraceStatus';

export function PaymentPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const explicitSessionId = Number(searchParams.get('sessionId')) || undefined;
  const currentSession = useCurrentSession();
  const specificSession = useSession(explicitSessionId);
  const capture = useCapturePayment();

  const session = explicitSessionId ? specificSession : currentSession;
  const data = session.data;
  const paid = capture.isSuccess || data?.status === 'Paid';
  const canPay = data?.status === 'Open' && !capture.isSuccess;
  const graceUntil = capture.data?.graceUntil ?? data?.graceUntil;

  return (
    <Stack spacing={2} maxWidth={560}>
      <PageHeader title={t('payment.title')} hint={t('payment.note', { minutes: config.graceMinutes })} />
      <AsyncBody
        isLoading={session.isLoading}
        error={session.error}
        onRetry={() => void session.refetch()}
        isEmpty={!data && !capture.isSuccess}
        empty={<Typography color="text.secondary">{t('payment.noSession')}</Typography>}
      >
        {(data || paid) && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                {canPay && (
                  <>
                    <Typography variant="h5">
                      {t('payment.payAmount', {
                        amount: data?.amountDue ?? 0,
                        currency: displayCurrency(data?.currency),
                      })}
                    </Typography>
                    <Typography color="text.secondary">
                      {t('payment.note', { minutes: config.graceMinutes })}
                    </Typography>
                  </>
                )}
                {paid && (
                  <>
                    <Alert severity="success">{t('payment.success', { minutes: config.graceMinutes })}</Alert>
                    <GraceStatus graceUntil={graceUntil} />
                    <Button component={RouterLink} to="/receipts" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
                      {t('session.viewReceipt')}
                    </Button>
                  </>
                )}
                {capture.error && (
                  <Alert severity="error">
                    {capture.error instanceof ApiError
                      ? capture.error.code === 'GRACE_EXPIRED'
                        ? t('session.graceExpired')
                        : capture.error.message
                      : t('common.error')}
                  </Alert>
                )}
                {canPay && (
                  <Button
                    variant="contained"
                    size="large"
                    disabled={capture.isPending}
                    onClick={() => capture.mutate(data!)}
                  >
                    {t('payment.submit')}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}
      </AsyncBody>
    </Stack>
  );
}
