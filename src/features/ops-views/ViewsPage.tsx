import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { Glyphs, IconTile } from '../../app/icons';
import { brand, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import type { CameraViewRow, CameraViewSlotWrite, CameraViewWrite } from '../../core/api/opsTypes';

const electric = '#00b4ff';
const QUERY_KEY = ['ops-camera-views'];

function buildEmptyGrid(rows: number, cols: number): (number | null)[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
}

function slotsToGrid(view: CameraViewRow | null, rows: number, cols: number): (number | null)[][] {
  const grid = buildEmptyGrid(rows, cols);
  for (const slot of view?.slots ?? []) {
    if (slot.rowIndex < rows && slot.columnIndex < cols) {
      grid[slot.rowIndex]![slot.columnIndex] = slot.cameraId;
    }
  }
  return grid;
}

function gridToSlots(grid: (number | null)[][]): CameraViewSlotWrite[] {
  const out: CameraViewSlotWrite[] = [];
  grid.forEach((row, r) => {
    row.forEach((cameraId, c) => {
      if (cameraId) out.push({ rowIndex: r, columnIndex: c, cameraId });
    });
  });
  return out;
}

export function ViewsPage() {
  const { t } = useTranslation();
  const { api } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [rows, setRows] = useState('1');
  const [cols, setCols] = useState('2');
  const [grid, setGrid] = useState<(number | null)[][]>(buildEmptyGrid(1, 2));
  const [savedGrid, setSavedGrid] = useState<(number | null)[][]>(buildEmptyGrid(1, 2));
  const [pendingSwap, setPendingSwap] = useState<{
    r: number;
    c: number;
    fromId: number;
    toId: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const viewsQ = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.listCameraViews(),
  });

  const camerasQ = useQuery({
    queryKey: ['ops-cameras'],
    queryFn: () => api.listCameras(),
  });

  const cameras = camerasQ.data ?? [];

  const rowCount = Math.min(6, Math.max(1, Number(rows) || 1));
  const colCount = Math.min(6, Math.max(1, Number(cols) || 1));

  useEffect(() => {
    setGrid((prev) => {
      const next = buildEmptyGrid(rowCount, colCount);
      for (let r = 0; r < Math.min(prev.length, rowCount); r++) {
        for (let c = 0; c < Math.min(prev[r]?.length ?? 0, colCount); c++) {
          next[r]![c] = prev[r]?.[c] ?? null;
        }
      }
      return next;
    });
  }, [rowCount, colCount]);

  const resetForm = () => {
    setEditId(null);
    setName('');
    setRows('1');
    setCols('2');
    const empty = buildEmptyGrid(1, 2);
    setGrid(empty);
    setSavedGrid(empty);
    setPendingSwap(null);
    setError(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (view: CameraViewRow) => {
    setEditId(view.id);
    setName(view.name);
    setRows(String(view.rowCount));
    setCols(String(view.columnCount));
    const loaded = slotsToGrid(view, view.rowCount, view.columnCount);
    setGrid(loaded);
    setSavedGrid(loaded.map((row) => [...row]));
    setPendingSwap(null);
    setError(null);
    setOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: (body: CameraViewWrite) =>
      editId ? api.updateCameraView(editId, body) : api.createCameraView(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
      setOpen(false);
      resetForm();
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteCameraView(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const handleSave = () => {
    if (!name.trim()) {
      setError(t('opsViews.nameRequired'));
      return;
    }
    const body: CameraViewWrite = {
      name: name.trim(),
      rowCount,
      columnCount: colCount,
      isActive: true,
      slots: gridToSlots(grid),
    };
    saveMut.mutate(body);
  };

  const cameraLabel = (id: number | null) => {
    if (id == null) return t('opsViews.emptyCell');
    const cam = cameras.find((c) => c.id === id);
    return cam ? `${cam.name} (${cam.ip})` : `#${id}`;
  };

  const setCell = (r: number, c: number, cameraId: number | '') => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r]![c] = cameraId === '' ? null : cameraId;
      return next;
    });
  };

  const requestCellChange = (r: number, c: number, cameraId: number | '') => {
    const nextId = cameraId === '' ? null : Number(cameraId);
    const savedId = savedGrid[r]?.[c] ?? null;

    if (savedId != null && nextId !== savedId) {
      setPendingSwap({ r, c, fromId: savedId, toId: nextId });
      return;
    }
    setCell(r, c, cameraId);
  };

  const applyPendingSwap = () => {
    if (!pendingSwap) return;
    setCell(pendingSwap.r, pendingSwap.c, pendingSwap.toId ?? '');
    setPendingSwap(null);
  };

  const assignedCount = useMemo(() => grid.flat().filter(Boolean).length, [grid]);

  return (
    <Stack spacing={2.75}>
      <PageHeader
        eyebrow={t('nav.groupOps')}
        title={t('opsViews.title')}
        hint={t('opsViews.hint')}
        actions={
          <Button variant="contained" color="secondary" onClick={openCreate}>
            {t('opsViews.add')}
          </Button>
        }
      />

      <AsyncBody
        isLoading={viewsQ.isLoading}
        error={viewsQ.error}
        onRetry={() => void viewsQ.refetch()}
        isEmpty={(viewsQ.data ?? []).length === 0}
        empty={
          <Stack spacing={1.5} alignItems="center" sx={{ py: 4 }}>
            <IconTile tone="sky" size={56}>
              {Glyphs.grid}
            </IconTile>
            <Typography color="text.secondary">{t('opsViews.empty')}</Typography>
            <Button variant="contained" color="secondary" onClick={openCreate}>
              {t('opsViews.add')}
            </Button>
          </Stack>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' },
          }}
        >
          {(viewsQ.data ?? []).map((view) => (
            <Box
              key={view.id}
              className="nri-glow-card"
              sx={{
                ...glowPanel(),
                p: 2,
                borderRadius: '18px',
                border: `1px solid ${alpha(electric, 0.3)}`,
                background: `linear-gradient(160deg, ${alpha('#0a1220', 0.92)}, ${alpha(electric, 0.05)})`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: electric }}>
                    {view.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.35 }}>
                    {t('opsViews.gridSize', { rows: view.rowCount, cols: view.columnCount })}
                  </Typography>
                  <Chip
                    size="small"
                    label={t('opsViews.slots', { count: view.slots.length })}
                    sx={{ mt: 1, fontWeight: 700, bgcolor: alpha(brand.teal, 0.15), color: brand.teal }}
                  />
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Button size="small" onClick={() => openEdit(view)}>
                    {t('opsViews.edit')}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      if (window.confirm(t('opsViews.confirmDelete', { name: view.name }))) {
                        deleteMut.mutate(view.id);
                      }
                    }}
                  >
                    {t('opsViews.delete')}
                  </Button>
                </Stack>
              </Stack>

              <Box
                sx={{
                  mt: 1.5,
                  display: 'grid',
                  gap: 0.75,
                  gridTemplateColumns: `repeat(${view.columnCount}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: view.rowCount * view.columnCount }).map((_, i) => {
                  const r = Math.floor(i / view.columnCount);
                  const c = i % view.columnCount;
                  const slot = view.slots.find((s) => s.rowIndex === r && s.columnIndex === c);
                  return (
                    <Box
                      key={`${view.id}-${r}-${c}`}
                      sx={{
                        minHeight: 44,
                        borderRadius: '10px',
                        border: `1px solid ${alpha(slot ? brand.teal : brand.muted, 0.35)}`,
                        bgcolor: alpha('#000', 0.35),
                        display: 'grid',
                        placeItems: 'center',
                        px: 0.75,
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} noWrap sx={{ maxWidth: '100%' }}>
                        {slot?.cameraName ?? '—'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </AsyncBody>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? t('opsViews.editTitle') : t('opsViews.addTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label={t('opsViews.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label={t('opsViews.rows')}
                type="number"
                inputProps={{ min: 1, max: 6 }}
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                fullWidth
              />
              <TextField
                label={t('opsViews.columns')}
                type="number"
                inputProps={{ min: 1, max: 6 }}
                value={cols}
                onChange={(e) => setCols(e.target.value)}
                fullWidth
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={800} sx={{ color: electric }}>
              {t('opsViews.assignCameras')} ({assignedCount}/{rowCount * colCount})
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
                p: 1.5,
                borderRadius: '14px',
                border: `1px solid ${alpha(electric, 0.25)}`,
                bgcolor: alpha('#050810', 0.6),
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <FormControl key={`${r}-${c}`} size="small" fullWidth>
                    <InputLabel>{t('opsViews.cell', { row: r + 1, col: c + 1 })}</InputLabel>
                    <Select
                      label={t('opsViews.cell', { row: r + 1, col: c + 1 })}
                      value={cell ?? ''}
                      onChange={(e) => requestCellChange(r, c, e.target.value as number | '')}
                    >
                      <MenuItem value="">
                        <em>{t('opsViews.emptyCell')}</em>
                      </MenuItem>
                      {cameras.map((cam) => (
                        <MenuItem key={cam.id} value={cam.id}>
                          {cam.name} ({cam.ip})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )),
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('opsViews.cancel')}</Button>
          <Button variant="contained" color="secondary" onClick={handleSave} disabled={saveMut.isPending}>
            {t('opsViews.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pendingSwap != null} onClose={() => setPendingSwap(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('opsViews.confirmChangeTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {pendingSwap?.toId == null
              ? t('opsViews.confirmRemoveCamera', {
                  name: cameraLabel(pendingSwap?.fromId ?? null),
                  row: (pendingSwap?.r ?? 0) + 1,
                  col: (pendingSwap?.c ?? 0) + 1,
                })
              : t('opsViews.confirmChangeCamera', {
                  oldName: cameraLabel(pendingSwap?.fromId ?? null),
                  newName: cameraLabel(pendingSwap?.toId ?? null),
                  row: (pendingSwap?.r ?? 0) + 1,
                  col: (pendingSwap?.c ?? 0) + 1,
                })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingSwap(null)}>{t('opsViews.cancel')}</Button>
          <Button variant="contained" color="warning" onClick={applyPendingSwap}>
            {t('opsViews.confirmChangeYes')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
