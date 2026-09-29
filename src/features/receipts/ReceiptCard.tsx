import type { ReactNode } from 'react';
import { Card, CardActionArea, CardContent, Chip, Stack, Typography, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PlateText } from '../../app/PlateText';
import { displayCurrency, displaySiteName, formatLocalDateTime } from '../../core/display';
import { brand, glowPanel } from '../../app/theme';
import { Glyphs, IconTile } from '../../app/icons';
import type { ParkingReceipt } from '../../core/api/types';

export function ReceiptCard({ receipt, to }: { receipt: ParkingReceipt; to?: string }) {
  const { t } = useTranslation();
  const lot = displaySiteName(receipt.parkingName) || receipt.parkingName;
  const body = (
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.75 }}>
        <IconTile tone="sky" size={44}>
          {Glyphs.history}
        </IconTile>
        <Stack flex={1} spacing={0.2}>
          <Typography variant="h6">{t('receipts.confirmation')}</Typography>
          <Typography variant="caption" color="text.secondary">
            #{receipt.sessionId}
          </Typography>
        </Stack>
        <Chip
          size="small"
          label={receipt.status ? String(receipt.status) : t('session.Paid')}
          sx={{ bgcolor: alpha(brand.teal, 0.14), color: brand.teal, fontWeight: 800 }}
        />
      </Stack>
      <Stack spacing={0.2}>
        {receipt.plate && <Row label={t('session.plate')} value={<PlateText>{receipt.plate}</PlateText>} />}
        {lot && <Row label={t('session.lot')} value={lot} />}
        {receipt.buildingId != null && <Row label={t('session.building')} value={receipt.buildingId} />}
        <Row label={t('receipts.amount')} value={`${receipt.amount} ${displayCurrency(receipt.currency)}`} />
        <Row label={t('receipts.paidAt')} value={formatLocalDateTime(receipt.paidAt)} />
        {receipt.graceUntil && (
          <Row label={t('session.graceUntil')} value={formatLocalDateTime(receipt.graceUntil)} />
        )}
      </Stack>
    </CardContent>
  );

  if (to) {
    return (
      <Card
        sx={{
          ...glowPanel(brand.teal),
          background: glowPanel(brand.teal).background,
        }}
      >
        <CardActionArea component={RouterLink} to={to}>
          {body}
        </CardActionArea>
      </Card>
    );
  }

  return <Card sx={{ ...glowPanel(brand.teal) }}>{body}</Card>;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" gap={2} sx={{ py: 0.7 }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={600}>{value}</Typography>
    </Stack>
  );
}
