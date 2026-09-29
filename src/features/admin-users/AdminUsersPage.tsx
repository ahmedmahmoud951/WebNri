import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { useAdminUsers } from '../../core/api/hooks';
import { PageHeader } from '../../app/PageHeader';
import { displayPersonName } from '../../core/display';

export function AdminUsersPage() {
  const { t } = useTranslation();
  const users = useAdminUsers();

  return (
    <Stack spacing={2}>
      <PageHeader title={t('users.title')} hint={t('users.hint')} />
      <AsyncBody
        isLoading={users.isLoading}
        error={users.error}
        onRetry={() => void users.refetch()}
        isEmpty={!users.data?.length}
        empty={<Typography color="text.secondary">{t('users.empty')}</Typography>}
      >
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('profile.name')}</TableCell>
                <TableCell>{t('users.username')}</TableCell>
                <TableCell>{t('profile.role')}</TableCell>
                <TableCell>{t('profile.building')}</TableCell>
                <TableCell>{t('users.active')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.data?.map((row) => (
                <TableRow key={row.userId}>
                  <TableCell>{displayPersonName(row.displayName)}</TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{t(`roles.${row.role}`)}</TableCell>
                  <TableCell>{row.buildingId ?? '—'}</TableCell>
                  <TableCell>{row.isActive ? t('users.yes') : t('users.no')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </AsyncBody>
    </Stack>
  );
}
