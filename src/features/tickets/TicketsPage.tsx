import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCreateTicket, useTickets } from '../../core/api/hooks';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { ticketTypeI18nKey, type TicketType } from '../../core/api/types';
import { ApiError } from '../../core/api/errors';
import { formatLocalDateTime } from '../../core/display';

const types: TicketType[] = ['lost_ticket', 'barrier', 'waste', 'maintenance', 'other'];

export function TicketsPage() {
  const { t } = useTranslation();
  const [type, setType] = useState<TicketType>('lost_ticket');
  const [note, setNote] = useState('');
  const tickets = useTickets();
  const create = useCreateTicket();

  const handleCreate = async () => {
    try {
      await create.mutateAsync({ type, note: note.trim() || undefined });
      setNote('');
    } catch {
      // handled
    }
  };

  return (
    <Stack spacing={2.75} maxWidth={640}>
      <PageHeader title={t('tickets.title')} hint={t('tickets.hint')} />
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {create.error && (
              <Alert severity="error">
                {create.error instanceof ApiError ? create.error.message : t('tickets.failed')}
              </Alert>
            )}
            <TextField
              select
              label={t('tickets.type')}
              value={type}
              onChange={(e) => setType(e.target.value as TicketType)}
            >
              {types.map((option) => (
                <MenuItem key={option} value={option}>
                  {t(ticketTypeI18nKey(option))}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('tickets.note')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              rows={3}
            />
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={create.isPending}
            >
              {t('tickets.submit')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <AsyncBody
        isLoading={tickets.isLoading}
        error={tickets.error}
        onRetry={() => void tickets.refetch()}
        isEmpty={!tickets.data?.length}
        empty={<Typography color="text.secondary">{t('tickets.empty')}</Typography>}
      >
        <Stack spacing={1.5}>
          {tickets.data?.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent>
                <Typography variant="subtitle1">{t(ticketTypeI18nKey(ticket.type))}</Typography>
                <Typography color="text.secondary">{ticket.note}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t(`tickets.${ticket.status}`)} · {formatLocalDateTime(ticket.createdAt)}
                  {ticket.updatedAt ? ` · ${formatLocalDateTime(ticket.updatedAt)}` : ''}
                </Typography>
                {ticket.resolutionNote && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {t('tickets.resolution')}: {ticket.resolutionNote}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      </AsyncBody>
    </Stack>
  );
}
