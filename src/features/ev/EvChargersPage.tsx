import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AsyncBody } from '../../app/AsyncBody';
import { EmptyState } from '../../app/EmptyState';
import { PageHeader } from '../../app/PageHeader';
import { Glyphs, IconTile } from '../../app/icons';
import { brand, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import { useBuildings, useEvChargers, queryKeys } from '../../core/api/hooks';
import { displaySiteName } from '../../core/display';
import { ApiError } from '../../core/api/errors';
import type { EvCharger, EvChargerStatus, EvChargerWrite } from '../../core/api/types';

type FormState = EvChargerWrite;

const emptyForm = (): FormState => ({
  label: '',
  free: 1,
  total: 2,
  status: 'online',
});

function chipColor(status: EvChargerStatus) {
  if (status === 'Available') return 'success' as const;
  if (status === 'Occupied' || status === 'Charging') return 'error' as const;
  if (status === 'Offline') return 'default' as const;
  return 'warning' as const;
}

function edgeFor(item: EvCharger) {
  if (item.status === 'Offline') return brand.muted;
  if (item.status === 'Occupied' || item.status === 'Charging') return brand.coral;
  if (item.status === 'Available') return brand.teal;
  return brand.amber;
}

function toWrite(item: EvCharger): FormState {
  return {
    label: item.name,
    free: item.free ?? (item.status === 'Available' ? 1 : 0),
    total: item.total ?? Math.max(item.free ?? 1, 1),
    status: item.platformStatus === 'offline' || item.status === 'Offline' ? 'offline' : 'online',
  };
}

export function EvChargersPage() {
  const { t } = useTranslation();
  const { api, user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === 'admin';
  const buildings = useBuildings();
  const buildingId = user?.buildingId ?? buildings.data?.[0]?.id ?? null;
  const chargers = useEvChargers(buildingId);
  const items = chargers.data ?? [];
  const free = items.reduce((sum, item) => {
    if (item.free != null) return sum + item.free;
    return sum + (item.status === 'Available' ? 1 : 0);
  }, 0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EvCharger | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<EvCharger | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const invalidate = () => void qc.invalidateQueries({ queryKey: queryKeys.chargers(buildingId ?? 0) });

  const saveMut = useMutation({
    mutationFn: async (body: EvChargerWrite) => {
      if (!buildingId) throw new Error(t('ev.empty'));
      if (editing) return api.updateEvCharger(editing.id, body);
      return api.createEvCharger(buildingId, body);
    },
    onSuccess: () => {
      setFormOpen(false);
      setEditing(null);
      setError(null);
      setMessage(t('ev.saved'));
      invalidate();
    },
    onError: (err: Error) => setError(err instanceof ApiError ? err.message : t('common.error')),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteEvCharger(id),
    onSuccess: () => {
      setPendingDelete(null);
      setError(null);
      setMessage(t('ev.deleted'));
      invalidate();
    },
    onError: (err: Error) => setError(err instanceof ApiError ? err.message : t('common.error')),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setError(null);
    setFormOpen(true);
  };

  const openEdit = (item: EvCharger) => {
    setEditing(item);
    setForm(toWrite(item));
    setError(null);
    setFormOpen(true);
  };

  const handleSave = () => {
    const label = form.label.trim();
    if (!label) {
      setError(t('ev.nameRequired'));
      return;
    }
    if (!Number.isFinite(form.total) || form.total < 1 || form.free < 0 || form.free > form.total) {
      setError(t('ev.countsInvalid'));
      return;
    }
    saveMut.mutate({ ...form, label, free: Math.round(form.free), total: Math.round(form.total) });
  };

  const headerActions = (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
      {items.length > 0 ? (
        <Chip color="success" variant="outlined" label={t('ev.freeCount', { count: free })} />
      ) : null}
      {canManage ? (
        <Button variant="contained" onClick={openCreate} disabled={!buildingId}>
          {t('ev.add')}
        </Button>
      ) : null}
    </Stack>
  );

  return (
    <Stack spacing={2} maxWidth={960}>
      <PageHeader
        title={t('ev.title')}
        hint={canManage ? t('ev.manageHint') : t('ev.hint')}
        actions={headerActions}
      />

      {message && (
        <Alert severity="success" onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      {error && !formOpen && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <AsyncBody
        isLoading={chargers.isLoading || (!buildingId && buildings.isLoading)}
        error={chargers.error}
        onRetry={() => void chargers.refetch()}
        isEmpty={!buildingId || items.length === 0}
        empty={
          canManage ? (
            <EmptyState icon={Glyphs.ev} title={t('ev.emptyAdmin')} body={t('ev.manageHint')} />
          ) : (
            <Typography color="text.secondary">{t('ev.empty')}</Typography>
          )
        }
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          {items.map((item, index) => (
            <ChargerCard
              key={item.id}
              item={item}
              index={index}
              canManage={canManage}
              onEdit={() => openEdit(item)}
              onDelete={() => setPendingDelete(item)}
            />
          ))}
        </Box>
      </AsyncBody>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            ...glowPanel(brand.teal),
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconTile tone="teal" size={40}>
              {Glyphs.ev}
            </IconTile>
            <Box>
              <Typography variant="overline" color="primary.main" fontWeight={800}>
                {t('ev.station')}
              </Typography>
              <Typography variant="h6">{editing ? t('ev.editTitle') : t('ev.addTitle')}</Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && formOpen && <Alert severity="error">{error}</Alert>}
            <TextField
              label={t('ev.name')}
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              helperText={t('ev.nameHint')}
              autoFocus
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label={t('ev.total')}
                type="number"
                value={form.total}
                onChange={(e) => {
                  const total = Number(e.target.value);
                  setForm((f) => ({ ...f, total, free: Math.min(f.free, Math.max(total, 0)) }));
                }}
                inputProps={{ min: 1 }}
                fullWidth
              />
              <TextField
                label={t('ev.free')}
                type="number"
                value={form.free}
                onChange={(e) => setForm((f) => ({ ...f, free: Number(e.target.value) }))}
                inputProps={{ min: 0, max: form.total }}
                fullWidth
              />
            </Stack>
            <TextField
              select
              label={t('ev.platform')}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormState['status'] }))}
              fullWidth
            >
              <MenuItem value="online">{t('ev.online')}</MenuItem>
              <MenuItem value="offline">{t('ev.offline')}</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setFormOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMut.isPending}>
            {t('ev.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            ...glowPanel(brand.coral),
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle>{t('ev.delete')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 0.5 }}>
            {t('ev.deleteConfirm', { name: displaySiteName(pendingDelete?.name) || pendingDelete?.name })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPendingDelete(null)}>{t('common.cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMut.isPending}
            onClick={() => pendingDelete && deleteMut.mutate(pendingDelete.id)}
          >
            {t('ev.deleteYes')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function ChargerCard({
  item,
  index,
  canManage,
  onEdit,
  onDelete,
}: {
  item: EvCharger;
  index: number;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const free = item.free ?? (item.status === 'Available' ? 1 : 0);
  const total = item.total ?? Math.max(free, 1);
  const occupied = Math.max(0, total - free);
  const freePct = total === 0 ? 0 : (free / total) * 100;
  const busyPct = total === 0 ? 0 : (occupied / total) * 100;
  const edge = edgeFor(item);
  const title = displaySiteName(item.name) || item.name;

  return (
    <Box
      className={`nri-rise nri-rise-delay-${(index % 3) + 1} nri-glow-card`}
      sx={{
        ...glowPanel(edge),
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `
            0 0 0 1px ${alpha(edge, 0.5)},
            0 0 48px ${alpha(edge, 0.32)},
            0 28px 56px ${alpha('#000', 0.48)}
          `,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
        <Stack direction="row" spacing={1.4} alignItems="center">
          <IconTile tone={item.status === 'Offline' ? 'ink' : item.status === 'Occupied' ? 'coral' : 'teal'} size={46} pulse={item.status === 'Available'}>
            {Glyphs.ev}
          </IconTile>
          <Box>
            <Typography variant="overline" sx={{ color: edge, fontWeight: 800, letterSpacing: 0.12 }}>
              {t('ev.station')}
            </Typography>
            <Typography variant="h6" sx={{ lineHeight: 1.25 }}>
              {title}
            </Typography>
          </Box>
        </Stack>
        <Chip size="small" color={chipColor(item.status)} label={t(`ev.status.${item.status}`)} />
      </Stack>

      <Typography
        variant="h4"
        sx={{
          mt: 2,
          mb: 0.5,
          fontSize: { xs: '1.55rem', md: '1.75rem' },
          background: `linear-gradient(135deg, ${brand.ink}, ${edge})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {t('occupancy.counts', { free, total })}
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        {[
          item.connector,
          item.powerKw ? `${item.powerKw} kW` : null,
          item.slotLabel,
        ]
          .filter(Boolean)
          .join(' · ') || t('occupancy.occupiedOf', { occupied, total })}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          height: 12,
          borderRadius: 999,
          overflow: 'hidden',
          bgcolor: alpha('#fff', 0.06),
          boxShadow: `inset 0 0 0 1px ${alpha('#fff', 0.08)}, 0 0 18px ${alpha(edge, 0.16)}`,
        }}
      >
        <Box
          sx={{
            width: `${freePct}%`,
            background: `linear-gradient(90deg, ${brand.tealDeep}, ${brand.teal})`,
            boxShadow: `0 0 14px ${brand.glow}`,
          }}
        />
        <Box
          sx={{
            width: `${busyPct}%`,
            background: `linear-gradient(90deg, #E11D48, ${brand.coral})`,
            boxShadow: `0 0 14px ${brand.coralGlow}`,
          }}
        />
      </Box>

      {canManage && (
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Tooltip title={t('ev.edit')}>
            <IconButton
              size="small"
              onClick={onEdit}
              aria-label={t('ev.edit')}
              sx={{
                border: `1px solid ${alpha(brand.teal, 0.4)}`,
                color: brand.teal,
                bgcolor: alpha(brand.teal, 0.08),
              }}
            >
              <EditGlyph />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('ev.delete')}>
            <IconButton
              size="small"
              onClick={onDelete}
              aria-label={t('ev.delete')}
              sx={{
                border: `1px solid ${alpha(brand.coral, 0.4)}`,
                color: brand.coral,
                bgcolor: alpha(brand.coral, 0.08),
              }}
            >
              <DeleteGlyph />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Box>
  );
}

function EditGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
      <path d="M4 20h4l11-11-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

function DeleteGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
      <path d="M5 7h14M10 7V5h4v2M8 7v12h8V7" />
    </svg>
  );
}
