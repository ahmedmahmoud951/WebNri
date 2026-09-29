import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { useAdminTickets } from '../../core/api/hooks';
import { ticketTypeI18nKey } from '../../core/api/types';
import { PageHeader } from '../../app/PageHeader';
import { formatLocalDateTime } from '../../core/display';

export function AdminTicketsPage() {
  const { t } = useTranslation();
  const list = useAdminTickets();

  return (
    <Stack spacing={2}>
      <PageHeader title={t('adminTickets.title')} hint={t('adminTickets.hint')} />
      <AsyncBody
        isLoading={list.isLoading}
        error={list.error}
        onRetry={() => void list.refetch()}
        isEmpty={!list.data?.length}
        empty={<Typography color="text.secondary">{t('adminTickets.empty')}</Typography>}
      >
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('users.username')}</TableCell>
                <TableCell>{t('tickets.type')}</TableCell>
                <TableCell>{t('tickets.note')}</TableCell>
                <TableCell>{t('tickets.status')}</TableCell>
                <TableCell>{t('tickets.createdAt')}</TableCell>
                <TableCell>{t('adminTickets.resolution')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.data?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.userName ?? row.userId ?? '—'}</TableCell>
                  <TableCell>{t(ticketTypeI18nKey(row.type))}</TableCell>
                  <TableCell>{row.note}</TableCell>
                  <TableCell>{t(`tickets.${row.status}`)}</TableCell>
                  <TableCell>{formatLocalDateTime(row.createdAt)}</TableCell>
                  <TableCell>{row.resolutionNote ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </AsyncBody>
    </Stack>
  );
}
