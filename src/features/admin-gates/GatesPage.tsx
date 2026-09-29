import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../app/PageHeader';
import { AsyncBody } from '../../app/AsyncBody';
import { IconTile } from '../../app/icons';
import { ICON_CATALOG } from '../../app/iconCatalog';
import { brand } from '../../app/theme';
import {
  useGates,
  useCreateGate,
  useUpdateGate,
  useDeleteGate,
  useOccupancyDetails,
} from '../../core/api/hooks';
import type { GateRow, GateWrite } from '../../core/api/opsTypes';
import { useAuth } from '../../core/auth/authContext';

const palette = {
  teal: brand.teal,
  mint: '#10B981',
  sky: '#38BDF8',
  coral: brand.coral,
  amber: brand.amber,
  violet: brand.violet,
};

export function GatesPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { api } = useAuth();

  const gatesQuery = useGates();
  const createGateMut = useCreateGate();
  const updateGateMut = useUpdateGate();
  const deleteGateMut = useDeleteGate();
  const lotsQuery = useOccupancyDetails(null, { allLots: true });


  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [parkingFilter, setParkingFilter] = useState<string>('all');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateRow | null>(null);
  const [formData, setFormData] = useState<GateWrite>({
    name: '',
    parkingId: null,
    direction: 'Inbound',
    isActive: true,
  });

  // Delete Confirm Dialog
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Quick Simulation State
  const [simDialogOpen, setSimDialogOpen] = useState(false);
  const [simGate, setSimGate] = useState<GateRow | null>(null);
  const [simPlate, setSimPlate] = useState('ABC 123');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<{ success: boolean; message: string; barrierOpened?: boolean } | null>(null);

  // Notification state
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const gates = gatesQuery.data ?? [];

  // Filtered Gates
  const filteredGates = useMemo(() => {
    return gates.filter((gate) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        gate.name.toLowerCase().includes(q) ||
        (gate.parkingName && gate.parkingName.toLowerCase().includes(q)) ||
        gate.id.toString() === q;

      const matchDir =
        directionFilter === 'all' ||
        (gate.direction || '').toLowerCase() === directionFilter.toLowerCase();

      const matchParking =
        parkingFilter === 'all' ||
        (gate.parkingId != null && gate.parkingId.toString() === parkingFilter);

      return matchSearch && matchDir && matchParking;
    });
  }, [gates, search, directionFilter, parkingFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = gates.length;
    const active = gates.filter((g) => g.isActive).length;
    const inbound = gates.filter((g) => (g.direction || '').toLowerCase().includes('in')).length;
    const outbound = gates.filter((g) => (g.direction || '').toLowerCase().includes('out')).length;
    return { total, active, inbound, outbound };
  }, [gates]);

  const handleOpenAdd = () => {
    setEditingGate(null);
    setFormData({
      name: '',
      parkingId: null,
      direction: 'Inbound',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (gate: GateRow) => {
    setEditingGate(gate);
    setFormData({
      name: gate.name,
      parkingId: gate.parkingId ?? null,
      direction: gate.direction || 'Inbound',
      isActive: gate.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editingGate) {
        await updateGateMut.mutateAsync({ id: editingGate.id, body: formData });
        setToastMsg({ type: 'success', text: t('gates.gateSaved') });
      } else {
        await createGateMut.mutateAsync(formData);
        setToastMsg({ type: 'success', text: t('gates.gateSaved') });
      }
      setDialogOpen(false);
    } catch {
      setToastMsg({ type: 'error', text: 'فشل حفظ البوابة، تأكد من الاتصال بالنظام.' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteGateMut.mutateAsync(id);
      setDeleteConfirmId(null);
      setToastMsg({ type: 'success', text: t('gates.gateDeleted') });
    } catch {
      setToastMsg({ type: 'error', text: 'فشل حذف البوابة.' });
    }
  };

  const handleOpenSim = (gate: GateRow) => {
    setSimGate(gate);
    setSimPlate('ABC 123');
    setSimResult(null);
    setSimDialogOpen(true);
  };

  const handleRunSim = async (isEntry: boolean) => {
    if (!simGate) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      if (isEntry) {
        const res = await api.simulateGateEntry({
          plate: simPlate.trim(),
          parkingId: simGate.parkingId ?? undefined,
          gateId: simGate.id.toString(),
        });
        setSimResult({
          success: true,
          message: res.message || 'تمت محاكاة دخول السيارة وفتح الحاجز بنجاح.',
          barrierOpened: res.barrierOpened,
        });
      } else {
        const res = await api.simulateGateExit({
          plate: simPlate.trim(),
          gateId: simGate.id.toString(),
        });
        setSimResult({
          success: true,
          message: res.message || 'تمت محاكاة خروج السيارة بنجاح.',
          barrierOpened: res.barrierOpened,
        });
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSimResult({
        success: false,
        message: e.message || 'فشلت عملية المحاكاة، تحقق من اتصال السيرفر.',
      });
    } finally {
      setSimLoading(false);
    }
  };

  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('gates.title')}
        hint={t('gates.hint')}
        actions={
          <Button

            variant="contained"
            onClick={handleOpenAdd}
            startIcon={
              <Box sx={{ width: 18, height: 18, display: 'grid', placeItems: 'center' }}>
                {ICON_CATALOG.gates.glyph}
              </Box>
            }
            sx={{
              background: `linear-gradient(135deg, ${brand.teal}, ${palette.mint})`,
              color: '#041018',
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: '12px',
              boxShadow: `0 8px 20px ${alpha(brand.teal, 0.35)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${palette.mint}, ${brand.teal})`,
                boxShadow: `0 12px 28px ${alpha(brand.teal, 0.5)}`,
              },
            }}
          >
            {t('gates.addGate')}
          </Button>
        }
      />

      {toastMsg && (
        <Alert severity={toastMsg.type} onClose={() => setToastMsg(null)} sx={{ borderRadius: '10px' }}>
          {toastMsg.text}
        </Alert>
      )}

      {/* KPI Stats Grid */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              p: 2,
              borderRadius: '16px',
              background: isDark
                ? `linear-gradient(135deg, ${alpha(brand.teal, 0.12)}, ${alpha('#fff', 0.03)})`
                : `linear-gradient(135deg, ${alpha(brand.teal, 0.08)}, #fff)`,
              border: `1px solid ${alpha(brand.teal, 0.25)}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconTile tone="teal" size={38}>
                {ICON_CATALOG.gates.glyph}
              </IconTile>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('gates.totalGates')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={brand.teal}>
                  {stats.total}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              p: 2,
              borderRadius: '16px',
              background: isDark
                ? `linear-gradient(135deg, ${alpha(palette.mint, 0.12)}, ${alpha('#fff', 0.03)})`
                : `linear-gradient(135deg, ${alpha(palette.mint, 0.08)}, #fff)`,
              border: `1px solid ${alpha(palette.mint, 0.25)}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconTile tone="mint" size={38}>
                {ICON_CATALOG.dash.glyph}
              </IconTile>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('gates.activeGates')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={palette.mint}>
                  {stats.active}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              p: 2,
              borderRadius: '16px',
              background: isDark
                ? `linear-gradient(135deg, ${alpha(palette.sky, 0.12)}, ${alpha('#fff', 0.03)})`
                : `linear-gradient(135deg, ${alpha(palette.sky, 0.08)}, #fff)`,
              border: `1px solid ${alpha(palette.sky, 0.25)}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconTile tone="sky" size={38}>
                {ICON_CATALOG.car.glyph}
              </IconTile>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('gates.inboundGates')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={palette.sky}>
                  {stats.inbound}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              p: 2,
              borderRadius: '16px',
              background: isDark
                ? `linear-gradient(135deg, ${alpha(brand.coral, 0.12)}, ${alpha('#fff', 0.03)})`
                : `linear-gradient(135deg, ${alpha(brand.coral, 0.08)}, #fff)`,
              border: `1px solid ${alpha(brand.coral, 0.25)}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconTile tone="coral" size={38}>
                {ICON_CATALOG.timer.glyph}
              </IconTile>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('gates.outboundGates')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={brand.coral}>
                  {stats.outbound}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Card
        sx={{
          p: 2,
          borderRadius: '16px',
          background: isDark ? alpha('#111827', 0.6) : alpha('#fff', 0.8),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${alpha('#fff', isDark ? 0.08 : 0.2)}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('gates.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ width: 18, height: 18, color: 'text.secondary' }}>
                      {ICON_CATALOG.search.glyph}
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('gates.direction')}</InputLabel>
              <Select
                value={directionFilter}
                label={t('gates.direction')}
                onChange={(e) => setDirectionFilter(e.target.value)}
              >
                <MenuItem value="all">{t('gates.allDirections')}</MenuItem>
                <MenuItem value="inbound">{t('gates.inbound')}</MenuItem>
                <MenuItem value="outbound">{t('gates.outbound')}</MenuItem>
                <MenuItem value="bidirectional">{t('gates.bidirectional')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('gates.parking')}</InputLabel>
              <Select
                value={parkingFilter}
                label={t('gates.parking')}
                onChange={(e) => setParkingFilter(e.target.value)}
              >
                <MenuItem value="all">{t('gates.allParkings')}</MenuItem>
                {(lotsQuery.data ?? []).map((lot) => (
                  <MenuItem key={lot.parkingId} value={lot.parkingId.toString()}>
                    {lot.name}
                  </MenuItem>
                ))}
              </Select>

            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Gates Grid */}
      <AsyncBody
        isLoading={gatesQuery.isLoading}
        error={gatesQuery.error}
        isEmpty={filteredGates.length === 0}
      >
        <Grid container spacing={2.5}>
          {filteredGates.map((gate) => {
            const isOnline = gate.isActive && (gate.status || '').toLowerCase() !== 'offline';
            const isEntry = (gate.direction || '').toLowerCase().includes('in');
            const isExit = (gate.direction || '').toLowerCase().includes('out');

            const tone = isEntry ? 'sky' : isExit ? 'coral' : 'teal';
            const colorHex = palette[tone];

            return (
              <Grid item xs={12} sm={6} md={4} key={gate.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '18px',
                    border: `1px solid ${alpha(isOnline ? colorHex : '#6B7280', 0.2)}`,
                    background: isDark
                      ? `linear-gradient(160deg, ${alpha('#1E293B', 0.85)} 0%, ${alpha('#0F172A', 0.95)} 100%)`
                      : `linear-gradient(160deg, ${alpha('#FFFFFF', 0.9)} 0%, ${alpha('#F8FAFC', 0.95)} 100%)`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: isDark
                      ? `0 12px 30px ${alpha('#000', 0.45)}`
                      : `0 12px 28px ${alpha('#64748B', 0.1)}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: colorHex,
                      boxShadow: `0 16px 36px ${alpha(colorHex, 0.22)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                      {/* Top status header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <IconTile tone={tone} size={42} pulse={isOnline}>
                            {ICON_CATALOG.gates.glyph}
                          </IconTile>
                          <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                              {gate.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Gate #{gate.id}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          size="small"
                          label={isOnline ? t('gates.online') : t('gates.offline')}
                          color={isOnline ? 'success' : 'default'}
                          sx={{
                            fontWeight: 700,
                            borderRadius: '8px',
                            px: 0.5,
                          }}
                        />
                      </Stack>

                      <Divider sx={{ borderColor: alpha('#fff', isDark ? 0.06 : 0.1) }} />

                      {/* Details */}
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            {t('gates.parking')}:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {gate.parkingName || t('gates.noParking')}
                          </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            {t('gates.direction')}:
                          </Typography>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              isEntry
                                ? t('gates.inbound')
                                : isExit
                                ? t('gates.outbound')
                                : t('gates.bidirectional')
                            }
                            sx={{
                              borderColor: alpha(colorHex, 0.4),
                              color: colorHex,
                              fontWeight: 700,
                            }}
                          />
                        </Stack>

                        {gate.lastEvent && (
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {t('gates.lastEvent')}:
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              {gate.lastEvent}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>

                  {/* Actions Footer */}
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(isDark ? '#0F172A' : '#F1F5F9', 0.6),
                      borderTop: `1px solid ${alpha('#fff', isDark ? 0.05 : 0.1)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '0 0 18px 18px',
                    }}
                  >
                    <Tooltip title={t('gates.simulatePass')} arrow>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenSim(gate)}
                        sx={{
                          borderRadius: '8px',
                          borderColor: alpha(brand.teal, 0.4),
                          color: brand.teal,
                          fontWeight: 700,
                          fontSize: 12,
                          '&:hover': {
                            borderColor: brand.teal,
                            background: alpha(brand.teal, 0.1),
                          },
                        }}
                      >
                        ⚡ {t('gates.simulatePass')}
                      </Button>
                    </Tooltip>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={t('nav.barriers')} arrow>
                        <IconButton
                          size="small"
                          onClick={() => navigate('/admin/barriers')}
                          sx={{ color: palette.sky }}
                        >
                          <Box sx={{ width: 16, height: 16 }}>{ICON_CATALOG.barriers.glyph}</Box>
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={t('gates.editGate')} arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(gate)}
                          sx={{ color: brand.teal }}
                        >
                          <Box sx={{ width: 16, height: 16 }}>{ICON_CATALOG.settings.glyph}</Box>
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={t('gates.deleteGate')} arrow>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirmId(gate.id)}
                          sx={{ color: brand.coral }}
                        >
                          <Box sx={{ width: 16, height: 16 }}>{ICON_CATALOG.logout.glyph}</Box>
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </AsyncBody>

      {/* Add / Edit Gate Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '18px',
            background: isDark ? '#1E293B' : '#FFFFFF',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingGate ? t('gates.editGate') : t('gates.addGate')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t('gates.name')}
              placeholder={t('gates.namePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <FormControl fullWidth>
              <InputLabel>{t('gates.parking')}</InputLabel>
              <Select
                value={formData.parkingId == null ? '' : formData.parkingId.toString()}
                label={t('gates.parking')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    parkingId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              >
                <MenuItem value="">{t('gates.noParking')}</MenuItem>
                {(lotsQuery.data ?? []).map((lot) => (
                  <MenuItem key={lot.parkingId} value={lot.parkingId.toString()}>
                    {lot.name}
                  </MenuItem>
                ))}
              </Select>

            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('gates.direction')}</InputLabel>
              <Select
                value={formData.direction || 'Inbound'}
                label={t('gates.direction')}
                onChange={(e) => setFormData((prev) => ({ ...prev, direction: e.target.value }))}
              >
                <MenuItem value="Inbound">{t('gates.inbound')}</MenuItem>
                <MenuItem value="Outbound">{t('gates.outbound')}</MenuItem>
                <MenuItem value="Bidirectional">{t('gates.bidirectional')}</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={600}>{t('gates.active')}</Typography>
              <Switch
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                color="success"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            {t('gates.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={createGateMut.isPending || updateGateMut.isPending || !formData.name.trim()}
            sx={{
              background: `linear-gradient(135deg, ${brand.teal}, ${palette.mint})`,
              color: '#041018',
              fontWeight: 700,
            }}
          >
            {t('gates.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{t('gates.deleteGate')}</DialogTitle>
        <DialogContent>
          <Typography>{t('gates.confirmDelete')}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)} color="inherit">
            {t('gates.cancel')}
          </Button>
          <Button
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            color="error"
            variant="contained"
            disabled={deleteGateMut.isPending}
          >
            {t('gates.deleteGate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Traffic Simulator Dialog */}
      <Dialog
        open={simDialogOpen}
        onClose={() => setSimDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '18px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          ⚡ {t('gates.simulatePass')} — {simGate?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              جرّب إرسال حدث مرور سيارة مباشرة عبر هذه البوابة لمشاهدة استجابة الباك إند والبث اللحظي.
            </Typography>

            <TextField
              fullWidth
              label="رقم اللوحة التجريبية"
              value={simPlate}
              onChange={(e) => setSimPlate(e.target.value)}
              placeholder="مثال: أ ب ج 123"
            />

            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleRunSim(true)}
                disabled={simLoading || !simPlate.trim()}
                sx={{
                  background: `linear-gradient(135deg, ${brand.teal}, ${palette.mint})`,
                  color: '#041018',
                  fontWeight: 700,
                  py: 1.2,
                }}
              >
                {simLoading ? <CircularProgress size={20} /> : t('gates.simulateEntry')}
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={() => handleRunSim(false)}
                disabled={simLoading || !simPlate.trim()}
                sx={{
                  background: `linear-gradient(135deg, ${brand.coral}, #F43F5E)`,
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.2,
                }}
              >
                {simLoading ? <CircularProgress size={20} /> : t('gates.simulateExit')}
              </Button>
            </Stack>

            {simResult && (
              <Alert
                severity={simResult.success ? 'success' : 'error'}
                sx={{ borderRadius: '10px', mt: 1 }}
              >
                <Typography fontWeight={700}>{simResult.message}</Typography>
                {simResult.barrierOpened && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    🟢 تم إرسال أمر فتح الحاجز الإلكتروني بنجاح!
                  </Typography>
                )}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSimDialogOpen(false)} color="inherit">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
