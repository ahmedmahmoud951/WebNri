import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { useHistory, useSessionReceipt } from '../../core/api/hooks';
import { ReceiptCard } from './ReceiptCard';

export function ReceiptDetailPage() {
  const { t } = useTranslation();
  const { sessionId: rawId } = useParams();
  const sessionId = Number(rawId);
  const receipt = useSessionReceipt(sessionId);
  const history = useHistory();
  const fromList = history.data?.find((item) => item.sessionId === sessionId) ?? null;
  const data = receipt.data ?? fromList;

  return (
    <Stack spacing={2} maxWidth={640} className="nri-print-root">
      <PageHeader
        title={t('receipts.detailTitle')}
        hint={t('receipts.detailHint')}
        actions={
          <Stack direction="row" gap={1} className="nri-no-print">
            <Button component={RouterLink} to="/receipts" variant="outlined">
              {t('receipts.back')}
            </Button>
            {data && (
              <Button variant="contained" onClick={() => window.print()}>
                {t('receipts.print')}
              </Button>
            )}
          </Stack>
        }
      />
      <AsyncBody
        isLoading={receipt.isLoading && !fromList}
        error={receipt.error}
        onRetry={() => void receipt.refetch()}
        isEmpty={!data}
        empty={
          <Typography color="text.secondary">{t('receipts.missing')}</Typography>
        }
      >
        {data && <ReceiptCard receipt={data} />}
      </AsyncBody>
    </Stack>
  );
}
