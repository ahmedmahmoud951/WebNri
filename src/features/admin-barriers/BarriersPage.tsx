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
import { PageHeader } from '../../app/PageHeader';
import { AsyncBody } from '../../app/AsyncBody';
import { IconTile } from '../../app/icons';
import { ICON_CATALOG } from '../../app/iconCatalog';
import { brand } from '../../app/theme';
import {
  useBarriers,
  useGates,
  useCreateBarrier,
  useUpdateBarrier,
  useDeleteBarrier,
  useOpenBarrier,
  useCloseBarrier,
  useEmergencyOpenBarrier,
  useResetBarrier,
} from '../../core/api/hooks';
import type { BarrierRow, BarrierStatusResult, BarrierWrite } from '../../core/api/opsTypes';
import { useAuth } from '../../core/auth/authContext';

const palette = {
  teal: brand.teal,
  mint: '#10B981',
  sky: '#38BDF8',
  coral: brand.coral,
  amber: brand.amber,
  violet: brand.violet,
};

/** Visual Animated Barrier Arm Component */
function BarrierArmVisualizer({ state }: { state?: string }) {
  const normState = (state || 'Closed').toLowerCase();
  const isOpen = normState === 'open';
  const isEmergency = normState === 'emergency';
  const isFault = normState === 'fault';

  const ledColor = isEmergency
    ? brand.coral
    : isFault
    ? brand.amber
    : isOpen
    ? palette.mint
    : '#EF4444';

  return (
    <Box
      sx={{
        py: 2.5,
        px: 2,
        borderRadius: '16px',
        background: `linear-gradient(180deg, ${alpha('#0F172A', 0.85)} 0%, ${alpha('#020617', 0.95)} 100%)`,
        border: `1px solid ${alpha(ledColor, 0.3)}`,
        boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.1)}, 0 8px 24px ${alpha(ledColor, 0.15)}`,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 120,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      {/* Background road grid */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 32,
          background: `repeating-linear-gradient(90deg, ${alpha('#fff', 0.08)} 0, ${alpha('#fff', 0.08)} 16px, transparent 16px, transparent 32px)`,
          borderTop: `1px dashed ${alpha('#fff', 0.2)}`,
        }}
      />

      {/* Barrier Base Pillar */}
      <Box
        sx={{
          width: 38,
          height: 64,
          borderRadius: '8px 8px 0 0',
          background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 50%, #78350F 100%)',
          border: '2px solid #FEF3C7',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          pt: 1,
        }}
      >
        {/* Status LED Light */}
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: ledColor,
            boxShadow: `0 0 14px ${ledColor}, 0 0 24px ${ledColor}`,
            animation: isEmergency || isFault ? 'pulseLed 0.8s infinite' : 'none',
            '@keyframes pulseLed': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.35, transform: 'scale(0.85)' },
            },
          }}
        />

        {/* Pivot Joint */}
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: '#1E293B',
            border: '2px solid #94A3B8',
            position: 'absolute',
            top: 26,
            zIndex: 3,
          }}
        />
      </Box>

      {/* Barrier Arm */}
      <Box
        sx={{
          position: 'absolute',
          left: 28,
          bottom: 42,
          width: '78%',
          height: 10,
          borderRadius: '4px',
          background: `repeating-linear-gradient(
            -45deg,
            #FFFFFF 0,
            #FFFFFF 14px,
            #DC2626 14px,
            #DC2626 28px
          )`,
          boxShadow: `0 2px 8px rgba(0,0,0,0.6), 0 0 10px ${alpha(ledColor, 0.4)}`,
          transformOrigin: '0% 50%',
          transform: isOpen || isEmergency ? 'rotate(-72deg)' : 'rotate(0deg)',
          transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 1,
        }}
      >
        {/* Arm End LED */}
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: ledColor,
            boxShadow: `0 0 8px ${ledColor}`,
          }}
        />
      </Box>

      {/* State Text Badge overlay */}
      <Box sx={{ position: 'absolute', top: 12, right: 14 }}>
        <Chip
          size="small"
          label={
            isEmergency
              ? 'EMERGENCY OPEN'
              : isFault
              ? 'FAULT'
              : isOpen
              ? 'OPEN'
              : 'CLOSED'
          }
          sx={{
            bgcolor: alpha(ledColor, 0.2),
            color: ledColor,
            fontWeight: 800,
            border: `1px solid ${alpha(ledColor, 0.4)}`,
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        />
      </Box>
    </Box>
  );
}

export function BarriersPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api } = useAuth();

  const barriersQuery = useBarriers();
  const gatesQuery = useGates();

  const createBarrierMut = useCreateBarrier();
  const updateBarrierMut = useUpdateBarrier();
  const deleteBarrierMut = useDeleteBarrier();

  const openBarrierMut = useOpenBarrier();
  const closeBarrierMut = useCloseBarrier();
  const emergencyOpenMut = useEmergencyOpenBarrier();
  const resetBarrierMut = useResetBarrier();

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [gateFilter, setGateFilter] = useState<string>('all');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarrier, setEditingBarrier] = useState<BarrierRow | null>(null);
  const [formData, setFormData] = useState<BarrierWrite>({
    name: '',
    gateId: null,
    providerKey: 'simulated',
    deviceAddress: '',
    isActive: true,
  });

  // Delete Confirm Dialog
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Telemetry Ping Dialog
  const [pingOpen, setPingOpen] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<BarrierStatusResult | null>(null);
  const [selectedBarrier, setSelectedBarrier] = useState<BarrierRow | null>(null);

  // Notifications
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const barriers = barriersQuery.data ?? [];
  const gates = gatesQuery.data ?? [];

  // Filtered Barriers
  const filteredBarriers = useMemo(() => {
    return barriers.filter((b) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        (b.gateName && b.gateName.toLowerCase().includes(q)) ||
        (b.deviceAddress && b.deviceAddress.toLowerCase().includes(q)) ||
        b.id.toString() === q;

      const matchState =
        stateFilter === 'all' || (b.state || 'closed').toLowerCase() === stateFilter.toLowerCase();

      const matchGate =
        gateFilter === 'all' || (b.gateId != null && b.gateId.toString() === gateFilter);

      return matchSearch && matchState && matchGate;
    });
  }, [barriers, search, stateFilter, gateFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = barriers.length;
    const open = barriers.filter((b) => (b.state || '').toLowerCase() === 'open').length;
    const closed = barriers.filter((b) => (b.state || '').toLowerCase() === 'closed').length;
    const active = barriers.filter((b) => b.isActive).length;
    const healthRate = total > 0 ? Math.round((active / total) * 100) : 100;
    return { total, open, closed, active, healthRate };
  }, [barriers]);

  const handleOpenAdd = () => {
    setEditingBarrier(null);
    setFormData({
      name: '',
      gateId: null,
      providerKey: 'simulated',
      deviceAddress: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (b: BarrierRow) => {
    setEditingBarrier(b);
    setFormData({
      name: b.name,
      gateId: b.gateId ?? null,
      providerKey: b.providerKey || 'simulated',
      deviceAddress: b.deviceAddress || '',
      isActive: b.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editingBarrier) {
        await updateBarrierMut.mutateAsync({ id: editingBarrier.id, body: formData });
        setToastMsg({ type: 'success', text: t('barriers.barrierSaved') });
      } else {
        await createBarrierMut.mutateAsync(formData);
        setToastMsg({ type: 'success', text: t('barriers.barrierSaved') });
      }
      setDialogOpen(false);
    } catch {
      setToastMsg({ type: 'error', text: 'فشل حفظ بيانات الحاجز، تحقق من الاتصال.' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBarrierMut.mutateAsync(id);
      setDeleteConfirmId(null);
      setToastMsg({ type: 'success', text: t('barriers.barrierDeleted') });
    } catch {
      setToastMsg({ type: 'error', text: 'فشل حذف الحاجز.' });
    }
  };

  const handleCommand = async (
    barrierId: number,
    cmdType: 'open' | 'close' | 'emergency' | 'reset',
  ) => {
    try {
      if (cmdType === 'open') await openBarrierMut.mutateAsync(barrierId);
      else if (cmdType === 'close') await closeBarrierMut.mutateAsync(barrierId);
      else if (cmdType === 'emergency') await emergencyOpenMut.mutateAsync(barrierId);
      else if (cmdType === 'reset') await resetBarrierMut.mutateAsync(barrierId);

      setToastMsg({ type: 'success', text: t('barriers.actionSent') });
    } catch {
      setToastMsg({ type: 'error', text: 'فشل تنفيذ الأمر على الهاردوير.' });
    }
  };

  const handleCheckStatus = async (b: BarrierRow) => {
    setSelectedBarrier(b);
    setPingOpen(true);
    setPingLoading(true);
    setPingResult(null);
    try {
      const res = await api.getBarrierStatus(b.id);
      setPingResult(res);
    } catch {
      setPingResult({
        barrierId: b.id,
        state: b.state || 'Unknown',
        status: 'Offline',
        message: 'تعذر الاتصال بالجهاز عبر العنوان المحدد',
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setPingLoading(false);
    }
  };

  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('barriers.title')}
        hint={t('barriers.hint')}
        actions={
          <Button

            variant="contained"
            onClick={handleOpenAdd}
            startIcon={
              <Box sx={{ width: 18, height: 18, display: 'grid', placeItems: 'center' }}>
                {ICON_CATALOG.barriers.glyph}
              </Box>
            }
            sx={{
              background: `linear-gradient(135deg, ${palette.sky}, ${brand.teal})`,
              color: '#041018',
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: '12px',
              boxShadow: `0 8px 20px ${alpha(palette.sky, 0.35)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${brand.teal}, ${palette.sky})`,
                boxShadow: `0 12px 28px ${alpha(palette.sky, 0.5)}`,
              },
            }}
          >
            {t('barriers.addBarrier')}
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
                ? `linear-gradient(135deg, ${alpha(palette.sky, 0.12)}, ${alpha('#fff', 0.03)})`
                : `linear-gradient(135deg, ${alpha(palette.sky, 0.08)}, #fff)`,
              border: `1px solid ${alpha(palette.sky, 0.25)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconTile tone="sky" size={38}>
                {ICON_CATALOG.barriers.glyph}
              </IconTile>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('barriers.totalBarriers')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={palette.sky}>
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
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconTile tone="mint" size={38}>
                {ICON_CATALOG.dash.glyph}
              </IconTile>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('barriers.openBarriers')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={palette.mint}>
                  {stats.open}
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
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconTile tone="coral" size={38}>
                {ICON_CATALOG.logout.glyph}
              </IconTile>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('barriers.closedBarriers')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={brand.coral}>
                  {stats.closed}
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
                ? `linear-gradient(135deg, ${alpha(brand.teal, 0.12)}, ${alpha('#fff', 0.03)})`
                : `linear-gradient(135deg, ${alpha(brand.teal, 0.08)}, #fff)`,
              border: `1px solid ${alpha(brand.teal, 0.25)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconTile tone="teal" size={38}>
                {ICON_CATALOG.timer.glyph}
              </IconTile>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('barriers.healthyBarriers')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={brand.teal}>
                  {stats.healthRate}%
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
              placeholder={t('barriers.searchPlaceholder')}
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
              <InputLabel>{t('barriers.state')}</InputLabel>
              <Select
                value={stateFilter}
                label={t('barriers.state')}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <MenuItem value="all">{t('barriers.allStates')}</MenuItem>
                <MenuItem value="open">{t('barriers.open')}</MenuItem>
                <MenuItem value="closed">{t('barriers.closed')}</MenuItem>
                <MenuItem value="emergency">{t('barriers.emergency')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('barriers.gate')}</InputLabel>
              <Select
                value={gateFilter}
                label={t('barriers.gate')}
                onChange={(e) => setGateFilter(e.target.value)}
              >
                <MenuItem value="all">{t('gates.allParkings')}</MenuItem>
                {gates.map((g) => (
                  <MenuItem key={g.id} value={g.id.toString()}>
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Barriers Grid */}
      <AsyncBody
        isLoading={barriersQuery.isLoading}
        error={barriersQuery.error}
        isEmpty={filteredBarriers.length === 0}
      >
        <Grid container spacing={2.5}>
          {filteredBarriers.map((barrier) => {
            const isOpen = (barrier.state || '').toLowerCase() === 'open';
            const isEmergency = (barrier.state || '').toLowerCase() === 'emergency';
            const tone = isEmergency ? 'coral' : isOpen ? 'mint' : 'sky';
            const colorHex = palette[tone];

            return (
              <Grid item xs={12} sm={6} lg={4} key={barrier.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '18px',
                    border: `1px solid ${alpha(colorHex, 0.25)}`,
                    background: isDark
                      ? `linear-gradient(165deg, ${alpha('#1E293B', 0.9)} 0%, ${alpha('#0F172A', 0.98)} 100%)`
                      : `linear-gradient(165deg, ${alpha('#FFFFFF', 0.95)} 0%, ${alpha('#F8FAFC', 0.98)} 100%)`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: isDark
                      ? `0 14px 34px ${alpha('#000', 0.5)}`
                      : `0 14px 32px ${alpha('#64748B', 0.12)}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: colorHex,
                      boxShadow: `0 18px 40px ${alpha(colorHex, 0.25)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                      {/* Top title and status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <IconTile tone={tone} size={42} pulse={isOpen || isEmergency}>
                            {ICON_CATALOG.barriers.glyph}
                          </IconTile>
                          <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                              {barrier.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Barrier #{barrier.id}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          size="small"
                          label={barrier.providerKey || 'simulated'}
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            borderRadius: '8px',
                            bgcolor: alpha(brand.teal, 0.15),
                            color: brand.teal,
                          }}
                        />
                      </Stack>

                      {/* Visual Arm Simulation Component */}
                      <BarrierArmVisualizer state={barrier.state} />

                      {/* Hardware Metadata Details */}
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            {t('barriers.gate')}:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {barrier.gateName || t('barriers.noGate')}
                          </Typography>
                        </Stack>

                        {barrier.deviceAddress && (
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {t('barriers.deviceAddress')}:
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }} fontWeight={600}>
                              {barrier.deviceAddress}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      <Divider sx={{ borderColor: alpha('#fff', isDark ? 0.06 : 0.1) }} />

                      {/* Direct Hardware Commands Buttons */}
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        ⚡ {t('gates.quickActions')}
                      </Typography>

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            onClick={() => handleCommand(barrier.id, 'open')}
                            disabled={isOpen}
                            sx={{
                              borderRadius: '8px',
                              background: `linear-gradient(135deg, ${palette.mint}, #059669)`,
                              color: '#041018',
                              fontWeight: 800,
                              py: 0.8,
                              fontSize: 12,
                            }}
                          >
                            🟢 {t('barriers.cmdOpen')}
                          </Button>
                        </Grid>

                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            onClick={() => handleCommand(barrier.id, 'close')}
                            disabled={!isOpen && !isEmergency}
                            sx={{
                              borderRadius: '8px',
                              background: `linear-gradient(135deg, ${brand.coral}, #BE123C)`,
                              color: '#fff',
                              fontWeight: 800,
                              py: 0.8,
                              fontSize: 12,
                            }}
                          >
                            🔴 {t('barriers.cmdClose')}
                          </Button>
                        </Grid>

                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            onClick={() => handleCommand(barrier.id, 'emergency')}
                            sx={{
                              borderRadius: '8px',
                              borderColor: alpha(brand.amber, 0.4),
                              color: brand.amber,
                              fontWeight: 700,
                              fontSize: 11,
                              '&:hover': {
                                borderColor: brand.amber,
                                background: alpha(brand.amber, 0.1),
                              },
                            }}
                          >
                            🚨 {t('barriers.cmdEmergency')}
                          </Button>
                        </Grid>

                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            onClick={() => handleCommand(barrier.id, 'reset')}
                            sx={{
                              borderRadius: '8px',
                              borderColor: alpha(brand.teal, 0.4),
                              color: brand.teal,
                              fontWeight: 700,
                              fontSize: 11,
                              '&:hover': {
                                borderColor: brand.teal,
                                background: alpha(brand.teal, 0.1),
                              },
                            }}
                          >
                            🔄 {t('barriers.cmdReset')}
                          </Button>
                        </Grid>
                      </Grid>
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
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => handleCheckStatus(barrier)}
                      sx={{
                        color: palette.sky,
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      📡 {t('barriers.cmdPing')}
                    </Button>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={t('barriers.editBarrier')} arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(barrier)}
                          sx={{ color: brand.teal }}
                        >
                          <Box sx={{ width: 16, height: 16 }}>{ICON_CATALOG.settings.glyph}</Box>
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={t('barriers.deleteBarrier')} arrow>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirmId(barrier.id)}
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

      {/* Add / Edit Barrier Dialog */}
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
          {editingBarrier ? t('barriers.editBarrier') : t('barriers.addBarrier')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t('barriers.name')}
              placeholder={t('barriers.namePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <FormControl fullWidth>
              <InputLabel>{t('barriers.gate')}</InputLabel>
              <Select
                value={formData.gateId == null ? '' : formData.gateId.toString()}
                label={t('barriers.gate')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gateId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              >
                <MenuItem value="">{t('barriers.noGate')}</MenuItem>
                {gates.map((g) => (
                  <MenuItem key={g.id} value={g.id.toString()}>
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('barriers.provider')}</InputLabel>
              <Select
                value={formData.providerKey || 'simulated'}
                label={t('barriers.provider')}
                onChange={(e) => setFormData((prev) => ({ ...prev, providerKey: e.target.value }))}
              >
                <MenuItem value="simulated">simulated (محاكي برمجي)</MenuItem>
                <MenuItem value="http">http (تحكم مباشر عبر Webhook/REST)</MenuItem>
                <MenuItem value="modbus">modbus (بروتوكول صناعي PLC)</MenuItem>
                <MenuItem value="tcp">tcp (مقبس مباشر TCP Socket)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('barriers.deviceAddress')}
              placeholder={t('barriers.deviceAddressPlaceholder')}
              value={formData.deviceAddress || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, deviceAddress: e.target.value }))}
            />

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
            {t('barriers.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              createBarrierMut.isPending || updateBarrierMut.isPending || !formData.name.trim()
            }
            sx={{
              background: `linear-gradient(135deg, ${palette.sky}, ${brand.teal})`,
              color: '#041018',
              fontWeight: 700,
            }}
          >
            {t('barriers.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{t('barriers.deleteBarrier')}</DialogTitle>
        <DialogContent>
          <Typography>{t('barriers.confirmDelete')}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)} color="inherit">
            {t('barriers.cancel')}
          </Button>
          <Button
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            color="error"
            variant="contained"
            disabled={deleteBarrierMut.isPending}
          >
            {t('barriers.deleteBarrier')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ping Telemetry Status Dialog */}
      <Dialog
        open={pingOpen}
        onClose={() => setPingOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '18px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          📡 {t('barriers.cmdPing')} — {selectedBarrier?.name}
        </DialogTitle>
        <DialogContent dividers>
          {pingLoading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
              <CircularProgress color="info" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {t('barriers.pinging')}
              </Typography>
            </Box>
          ) : pingResult ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="success" sx={{ borderRadius: '10px' }}>
                <Typography fontWeight={700}>{t('barriers.statusOk')}</Typography>
              </Alert>

              <Card sx={{ p: 2, borderRadius: '12px', bgcolor: alpha('#fff', isDark ? 0.04 : 0.5) }}>
                <Stack spacing={1.2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      حالة الهاردوير:
                    </Typography>
                    <Chip size="small" label={pingResult.status} color="success" sx={{ fontWeight: 700 }} />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      نوع المزود:
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                      {pingResult.providerKey || selectedBarrier?.providerKey}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      رسالة الاستجابة:
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {pingResult.message || 'OK'}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      وقت الفحص:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(pingResult.checkedAt || Date.now()).toLocaleTimeString()}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPingOpen(false)} color="inherit">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
