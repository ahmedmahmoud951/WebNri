import { useState } from 'react';
import {
  Alert,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { PlateText } from '../../app/PlateText';
import { PageHeader } from '../../app/PageHeader';
import { usePlateBindings, useUnlinkVehicleBinding } from '../../core/api/hooks';
import { displayPersonName } from '../../core/display';

export function VehicleBindingsPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const search = usePlateBindings(query, query.length > 0);
  const unlink = useUnlinkVehicleBinding();

  return (
    <Stack spacing={2}>
      <PageHeader title={t('bindings.title')} hint={t('bindings.hint')} />
      <Alert severity="info">{t('bindings.flutterOwns')}</Alert>
      <Stack direction="row" gap={1} flexWrap="wrap">
        <TextField
          label={t('profile.plate')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputProps={{ dir: 'ltr' }}
          sx={{ minWidth: 220 }}
        />
        <Button variant="contained" onClick={() => setQuery(input.trim())}>
          {t('bindings.search')}
        </Button>
      </Stack>
      {unlink.isSuccess && <Alert severity="success">{t('bindings.unlinked')}</Alert>}
      {unlink.error instanceof Error && <Alert severity="error">{unlink.error.message}</Alert>}
      <AsyncBody
        isLoading={search.isFetching && query.length > 0}
        error={search.error}
        onRetry={() => void search.refetch()}
        isEmpty={query.length > 0 && !search.data?.length}
        empty={<Typography color="text.secondary">{t('bindings.empty')}</Typography>}
      >
        {search.data && search.data.length > 0 && (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('profile.plate')}</TableCell>
                  <TableCell>{t('bindings.user')}</TableCell>
                  <TableCell>{t('profile.make')}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {search.data.map((row) => (
                  <TableRow key={row.vehicleId}>
                    <TableCell>
                      <PlateText>{row.plate}</PlateText>
                    </TableCell>
                    <TableCell>
                      {row.userName
                        ? `${row.userName}${row.displayName ? ` · ${displayPersonName(row.displayName)}` : ''}`
                        : t('bindings.noUser')}
                    </TableCell>
                    <TableCell>{[row.make, row.model].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        disabled={unlink.isPending}
                        onClick={() =>
                          unlink.mutate(row.vehicleId, {
                            onSuccess: () => void search.refetch(),
                          })
                        }
                      >
                        {t('bindings.unlink')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </AsyncBody>
    </Stack>
  );
}
