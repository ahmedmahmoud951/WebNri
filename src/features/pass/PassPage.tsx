import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { PlateText } from '../../app/PlateText';
import { usePass } from '../../core/api/hooks';
import { formatLocalDateTime } from '../../core/display';

export function PassPage() {
  const { t } = useTranslation();
  const pass = usePass();
  const data = pass.data;

  return (
    <Stack spacing={2} maxWidth={520}>
      <PageHeader title={t('pass.title')} hint={t('pass.hint')} />
      <AsyncBody
        isLoading={pass.isLoading}
        error={pass.error}
        onRetry={() => void pass.refetch()}
        isEmpty={!data}
        empty={<Typography color="text.secondary">{t('pass.empty')}</Typography>}
      >
        {data && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Chip
                  color="primary"
                  variant="outlined"
                  label={t(`pass.kind.${data.kind === 'subscription' ? 'subscription' : 'session'}`)}
                />
                <Box dir="ltr" sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2 }}>
                  <QRCodeSVG value={data.payload} size={220} fgColor="#1b5e4a" bgColor="#ffffff" level="M" />
                </Box>
                {data.plate && (
                  <Typography>
                    <PlateText>{data.plate}</PlateText>
                  </Typography>
                )}
                {data.slotLabel && (
                  <Typography color="text.secondary" variant="body2">
                    {t('subs.slotLabel')}: {data.slotLabel}
                  </Typography>
                )}
                {data.validUntil && (
                  <Typography color="text.secondary" variant="body2">
                    {t('pass.validUntil')}: {formatLocalDateTime(data.validUntil)}
                  </Typography>
                )}
                <Typography color="text.secondary" variant="body2" textAlign="center">
                  {t('pass.noBarrier')}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </AsyncBody>
    </Stack>
  );
}
