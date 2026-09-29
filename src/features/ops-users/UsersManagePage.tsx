import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { IconTile } from '../../app/icons';
import { ICON_CATALOG } from '../../app/iconCatalog';
import { glowPanel, brand } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import { ApiError } from '../../core/api/errors';
import { formatLocalDateTime } from '../../core/display';
import type { ManagedUser, ManagedUserWrite } from '../../core/api/opsTypes';

const emptyForm: ManagedUserWrite = {
  userName: '',
  displayName: '',
  email: '',
  phoneNumber: '',
  password: '',
  roleId: null,
  isActive: true,
};

function validUserName(value: string) {
  return /^[A-Za-z0-9._-]{3,50}$/.test(value);
}

function validPassword(value: string) {
  return value.length >= 8 && value.length <= 128 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export function UsersManagePage() {
  const { t } = useTranslation();
  const { api, user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === 'admin';

  const usersQ = useQuery({ queryKey: ['ops-users'], queryFn: () => api.listManagedUsers() });
  const rolesQ = useQuery({ queryKey: ['ops-roles'], queryFn: () => api.listRoles(), enabled: canManage });
  const permsQ = useQuery({
    queryKey: ['ops-permissions'],
    queryFn: () => api.listPermissions(),
    enabled: canManage,
  });

  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<ManagedUserWrite>(emptyForm);
  const [roleName, setRoleName] = useState('');
  const [permCode, setPermCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setForm(emptyForm);
      return;
    }
    setForm({
      userName: selected.userName,
      displayName: selected.displayName,
      email: selected.email ?? '',
      phoneNumber: selected.phoneNumber ?? '',
      password: '',
      roleId: selected.roleId ?? null,
      isActive: selected.isActive,
    });
  }, [selected]);

  const metrics = useMemo(() => {
    const list = usersQ.data ?? [];
    return {
      total: list.length,
      active: list.filter((u) => u.isActive).length,
      roles: rolesQ.data?.length ?? 0,
      perms: permsQ.data?.length ?? 0,
    };
  }, [usersQ.data, rolesQ.data, permsQ.data]);

  const run = async (fn: () => Promise<void>, ok: string) => {
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(ok);
      await qc.invalidateQueries({ queryKey: ['ops-users'] });
      await qc.invalidateQueries({ queryKey: ['ops-roles'] });
      await qc.invalidateQueries({ queryKey: ['ops-permissions'] });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  const createMut = useMutation({
    mutationFn: () => api.createManagedUser(form),
  });

  if (!canManage) {
    return (
      <Stack spacing={2}>
        <PageHeader title={t('opsUsers.title')} hint={t('opsUsers.forbidden')} />
        <Alert severity="warning">{t('opsUsers.forbidden')}</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t('nav.groupOps')}
        title={t('opsUsers.title')}
        hint={t('opsUsers.hint')}
        actions={
          <IconTile tone="gold" size={48} label={t('opsUsers.title')} showLabel>
            {ICON_CATALOG.users.glyph}
          </IconTile>
        }
      />

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
        {[
          { label: t('opsUsers.metricUsers'), value: metrics.total, tone: brand.teal },
          { label: t('opsUsers.metricActive'), value: metrics.active, tone: brand.teal },
          { label: t('opsUsers.metricRoles'), value: metrics.roles, tone: brand.amber },
          { label: t('opsUsers.metricPerms'), value: metrics.perms, tone: brand.violet },
        ].map((m) => (
          <Box key={m.label} className="nri-glow-card" sx={{ ...glowPanel(m.tone), p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {m.label}
            </Typography>
            <Typography variant="h4" sx={{ color: m.tone }}>
              {m.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box className="nri-glow-card" sx={{ ...glowPanel(brand.teal), p: { xs: 2, md: 2.75 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {selected ? t('opsUsers.editTitle') : t('opsUsers.createTitle')}
        </Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label={t('opsUsers.userName')}
              value={form.userName}
              disabled={Boolean(selected)}
              onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t('opsUsers.displayName')}
              value={form.displayName ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label={t('opsUsers.email')}
              value={form.email ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t('opsUsers.phone')}
              value={form.phoneNumber ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label={selected ? t('opsUsers.newPassword') : t('opsUsers.password')}
              type="password"
              value={form.password ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              fullWidth
              helperText={t('opsUsers.passwordHint')}
            />
            <TextField
              select
              label={t('opsUsers.role')}
              value={form.roleId ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  roleId: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
              fullWidth
            >
              <MenuItem value="">{t('opsUsers.noRole')}</MenuItem>
              {(rolesQ.data ?? []).map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button
              variant="contained"
              disabled={createMut.isPending}
              onClick={() =>
                void run(async () => {
                  if (!validUserName(form.userName)) throw new ApiError({ code: 'validation', message: t('opsUsers.userNameInvalid') });
                  if (!selected && !validPassword(form.password ?? '')) {
                    throw new ApiError({ code: 'validation', message: t('opsUsers.passwordInvalid') });
                  }
                  if (selected) {
                    await api.updateManagedUser(selected.id, {
                      ...form,
                      password: undefined,
                      email: form.email || null,
                      phoneNumber: form.phoneNumber || null,
                    });
                    if (form.roleId) await api.assignManagedUserRole(selected.id, form.roleId);
                  } else {
                    await api.createManagedUser({
                      ...form,
                      email: form.email || null,
                      phoneNumber: form.phoneNumber || null,
                    });
                    setForm(emptyForm);
                  }
                }, selected ? t('opsUsers.updated') : t('opsUsers.created'))
              }
            >
              {selected ? t('opsUsers.update') : t('opsUsers.create')}
            </Button>
            {selected && (
              <>
                <Button
                  variant="outlined"
                  onClick={() =>
                    void run(async () => {
                      if (!validPassword(form.password ?? '')) {
                        throw new ApiError({ code: 'validation', message: t('opsUsers.passwordInvalid') });
                      }
                      await api.resetManagedUserPassword(selected.id, form.password!);
                    }, t('opsUsers.passwordReset'))
                  }
                >
                  {t('opsUsers.resetPassword')}
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => void run(() => api.activateManagedUser(selected.id), t('opsUsers.activated'))}
                >
                  {t('opsUsers.activate')}
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => void run(() => api.deactivateManagedUser(selected.id), t('opsUsers.deactivated'))}
                >
                  {t('opsUsers.deactivate')}
                </Button>
                <Button
                  onClick={() => {
                    setSelected(null);
                    setForm(emptyForm);
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Box>

      <AsyncBody
        isLoading={usersQ.isLoading}
        error={usersQ.error}
        onRetry={() => void usersQ.refetch()}
        isEmpty={!usersQ.data?.length}
        empty={<Typography color="text.secondary">{t('opsUsers.empty')}</Typography>}
      >
        <Box className="nri-glow-card" sx={{ ...glowPanel(brand.amber), overflow: 'auto', p: 1 }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2 }}>{t('opsUsers.user')}</TableCell>
                <TableCell>{t('opsUsers.role')}</TableCell>
                <TableCell>{t('opsUsers.contact')}</TableCell>
                <TableCell>{t('opsUsers.status')}</TableCell>
                <TableCell sx={{ pr: 2 }}>{t('opsUsers.createdAt')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersQ.data?.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  selected={selected?.id === row.id}
                  onClick={() => setSelected(row)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ pl: 2 }}>
                    <Typography fontWeight={700}>{row.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.userName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.roleName ?? '—'} color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.phoneNumber || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.email || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={row.isActive ? 'success' : 'default'}
                      label={row.isActive ? t('opsUsers.active') : t('opsUsers.inactive')}
                    />
                  </TableCell>
                  <TableCell sx={{ pr: 2, whiteSpace: 'nowrap' }}>
                    {formatLocalDateTime(row.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </AsyncBody>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box className="nri-glow-card" sx={{ ...glowPanel(brand.violet), p: 2.25, flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {t('opsUsers.roles')}
          </Typography>
          <Stack direction="row" gap={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label={t('opsUsers.roleName')} value={roleName} onChange={(e) => setRoleName(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() =>
                void run(async () => {
                  if (!roleName.trim()) throw new ApiError({ code: 'validation', message: t('opsUsers.roleNameRequired') });
                  await api.createRole(roleName.trim());
                  setRoleName('');
                }, t('opsUsers.roleCreated'))
              }
            >
              {t('opsUsers.add')}
            </Button>
          </Stack>
          <Stack spacing={0.75}>
            {(rolesQ.data ?? []).map((r) => (
              <Box
                key={r.id}
                sx={{
                  p: 1.25,
                  borderRadius: '12px',
                  bgcolor: alpha('#fff', 0.04),
                  border: `1px solid ${alpha(brand.violet, 0.22)}`,
                }}
              >
                {r.name}
              </Box>
            ))}
          </Stack>
        </Box>
        <Box className="nri-glow-card" sx={{ ...glowPanel(brand.coral), p: 2.25, flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {t('opsUsers.permissions')}
          </Typography>
          <Stack direction="row" gap={1} sx={{ mb: 1.5 }}>
            <TextField size="small" label={t('opsUsers.permCode')} value={permCode} onChange={(e) => setPermCode(e.target.value)} fullWidth />
            <Button
              variant="contained"
              onClick={() =>
                void run(async () => {
                  if (!permCode.trim()) throw new ApiError({ code: 'validation', message: t('opsUsers.permRequired') });
                  await api.createPermission(permCode.trim());
                  setPermCode('');
                }, t('opsUsers.permCreated'))
              }
            >
              {t('opsUsers.add')}
            </Button>
          </Stack>
          <Stack spacing={0.75} sx={{ maxHeight: 280, overflow: 'auto', pr: 0.5 }}>
            {(permsQ.data ?? []).map((p) => (
              <Box
                key={p.id}
                sx={{
                  p: 1.25,
                  borderRadius: '12px',
                  bgcolor: alpha('#fff', 0.04),
                  border: `1px solid ${alpha(brand.coral, 0.2)}`,
                }}
              >
                <Typography fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                  {p.code}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}
