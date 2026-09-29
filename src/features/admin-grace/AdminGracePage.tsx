import { Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { PlateText } from '../../app/PlateText';
import { useGraceViolations } from '../../core/api/hooks';
import { config } from '../../core/config';
import { displayCurrency, displaySiteName, formatLocalDateTime } from '../../core/display';
import { PageHeader } from '../../app/PageHeader';

export function AdminGracePage() {
  const { t } = useTranslation();
  const list = useGraceViolations();

  return (
    <Stack spacing={2}>
      <PageHeader
        title={t('grace.title')}
        hint={t('grace.hint', { minutes: config.graceMinutes })}
        actions={
          <Button component={RouterLink} to="/admin/reports" variant="text">
            {t('home.reports')}
          </Button>
        }
      />
      <AsyncBody
        isLoading={list.isLoading}
        error={list.error}
        onRetry={() => void list.refetch()}
        isEmpty={!list.data?.length}
        empty={<Typography color="text.secondary">{t('grace.empty')}</Typography>}
      >
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('receipts.sessionId')}</TableCell>
                <TableCell>{t('profile.plate')}</TableCell>
                <TableCell>{t('admin.building')}</TableCell>
                <TableCell>{t('session.graceUntil')}</TableCell>
                <TableCell>{t('grace.extraFee')}</TableCell>
                <TableCell>{t('grace.stillParked')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.data?.map((row) => (
                <TableRow key={row.sessionId}>
                  <TableCell>{row.sessionId}</TableCell>
                  <TableCell>{row.plate ? <PlateText>{row.plate}</PlateText> : '—'}</TableCell>
                  <TableCell>{displaySiteName(row.buildingName) || row.buildingId || '—'}</TableCell>
                  <TableCell>{formatLocalDateTime(row.graceUntil)}</TableCell>
                  <TableCell>
                    {row.extraFee} {displayCurrency(row.currency)}
                  </TableCell>
                  <TableCell>{row.stillParked ? t('users.yes') : t('users.no')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </AsyncBody>
    </Stack>
  );
}
