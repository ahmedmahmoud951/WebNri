import { useState } from 'react';
import { Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { PlateText } from '../../app/PlateText';
import { usePlateSearch } from '../../core/api/hooks';
import { PageHeader } from '../../app/PageHeader';
import { displaySiteName, formatLocalDateTime } from '../../core/display';

export function AdminPlatesPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const search = usePlateSearch(query, query.length > 0);

  return (
    <Stack spacing={2}>
      <PageHeader title={t('plates.title')} hint={t('plates.hint')} />
      <Stack direction="row" gap={1} flexWrap="wrap">
        <TextField
          label={t('profile.plate')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          inputProps={{ dir: 'ltr' }}
          sx={{ minWidth: 220 }}
        />
        <Button
          variant="contained"
          onClick={() => {
            const next = input.trim();
            setQuery(next);
          }}
        >
          {t('plates.search')}
        </Button>
      </Stack>
      <AsyncBody
        isLoading={search.isFetching}
        error={search.error}
        onRetry={() => void search.refetch()}
        isEmpty={!search.data?.length && query.length > 0}
        empty={<Typography color="text.secondary">{t('plates.empty')}</Typography>}
      >
        {search.data && search.data.length > 0 && (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('session.plate')}</TableCell>
                  <TableCell>{t('session.building')}</TableCell>
                  <TableCell>{t('admin.zone')}</TableCell>
                  <TableCell>{t('session.status')}</TableCell>
                  <TableCell>{t('session.startedAt')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {search.data.map((row) => (
                  <TableRow key={`${row.plate}-${row.sessionId ?? row.startedAt}`}>
                    <TableCell>
                      <PlateText>{row.plate}</PlateText>
                    </TableCell>
                    <TableCell>{displaySiteName(row.buildingName) || row.buildingId}</TableCell>
                    <TableCell>{row.zoneName ?? '—'}</TableCell>
                    <TableCell>{t(`plates.status.${row.status}`)}</TableCell>
                    <TableCell>{formatLocalDateTime(row.startedAt)}</TableCell>
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
