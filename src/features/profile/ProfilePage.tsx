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
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../core/auth/authContext';
import { useDeleteVehicle } from '../../core/api/hooks';
import { persistLocale, type AppLocale } from '../../core/i18n';
import i18n from '../../core/i18n';
import { PlateText } from '../../app/PlateText';
import { PageHeader } from '../../app/PageHeader';
import { displayPersonName } from '../../core/display';
import { ApiError } from '../../core/api/errors';
import type { Vehicle } from '../../core/api/types';

export function ProfilePage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { user, logout, refreshUser } = useAuth();

  if (!user) return null;

  async function changeLanguage(locale: AppLocale) {
    await i18n.changeLanguage(locale);
    persistLocale(locale);
    await refreshUser();
  }

  return (
    <Stack spacing={3} maxWidth={640}>
      <PageHeader title={t('profile.title')} />
      <Card>
        <CardContent>
          <Stack spacing={1.2}>
            <Row label={t('profile.name')} value={displayPersonName(user.displayName)} />
            <Row label={t('profile.role')} value={t(`roles.${user.role}`)} />
            <Row label={t('profile.building')} value={user.buildingId != null ? String(user.buildingId) : t('common.empty')} />
            {user.unitId && <Row label={t('profile.unit')} value={user.unitId} />}
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">{t('profile.language')}</Typography>
            <TextField
              select
              value={i18nInstance.language.startsWith('en') ? 'en' : 'ar'}
              onChange={(event) => void changeLanguage(event.target.value as AppLocale)}
            >
              <MenuItem value="ar">{t('language.arabic')}</MenuItem>
              <MenuItem value="en">{t('language.english')}</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">{t('profile.vehicles')}</Typography>
            <Typography color="text.secondary" variant="body2">
              {t('profile.vehiclesHint')}
            </Typography>
            {user.vehicles.length === 0 && (
              <Typography color="text.secondary">{t('profile.noVehicles')}</Typography>
            )}
            {user.vehicles.map((vehicle) => (
              <VehicleUnlink key={vehicle.id ?? vehicle.plate} vehicle={vehicle} />
            ))}
          </Stack>
        </CardContent>
      </Card>
      <Button color="inherit" onClick={logout} sx={{ alignSelf: 'flex-start' }}>
        {t('profile.logout')}
      </Button>
    </Stack>
  );
}

function VehicleUnlink({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useTranslation();
  const deleteVehicle = useDeleteVehicle();
  const canUnlink = vehicle.id != null;

  return (
    <Stack spacing={1.5} sx={{ border: 1, borderColor: 'divider', borderRadius: '12px', p: 1.5 }}>
      <Typography>
        <PlateText>{vehicle.plate}</PlateText>
        {vehicle.make ? ` · ${vehicle.make}` : ''}
        {vehicle.model ? ` ${vehicle.model}` : ''}
      </Typography>
      {deleteVehicle.isSuccess && <Alert severity="success">{t('profile.removed')}</Alert>}
      {deleteVehicle.error && (
        <Alert severity="error">
          {deleteVehicle.error instanceof ApiError ? deleteVehicle.error.message : t('common.error')}
        </Alert>
      )}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button variant="contained" component={RouterLink} to={`/find-car/${encodeURIComponent(vehicle.plate)}`}>
          {t('findCar.action')}
        </Button>
        <Button
          color="error"
          disabled={!canUnlink || deleteVehicle.isPending}
          onClick={() => deleteVehicle.mutate(vehicle.id!)}
        >
          {t('profile.removeVehicle')}
        </Button>
      </Stack>
    </Stack>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" gap={2}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}
