import { Chip, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../core/auth/authContext';
import { useBuildings, useOccupancy, useOccupancyDetails } from '../../core/api/hooks';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { buildOccupancyItems, OccupancyCards, OccupancyLegend } from './OccupancyCards';
import { ApiError } from '../../core/api/errors';
import { displaySiteName } from '../../core/display';

export function OccupancyPage() {
  const { t } = useTranslation();
  const { user, api } = useAuth();
  const isAdmin = user?.role === 'admin';
  const buildingId = user?.buildingId ?? undefined;
  const occupancy = useOccupancy(isAdmin ? undefined : buildingId);
  const details = useOccupancyDetails(buildingId, { allLots: isAdmin });
  const buildings = useBuildings();
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoPending, setDemoPending] = useState(false);

  const lots = details.data ?? [];
  const zones = occupancy.data?.zones ?? [];
  const buildingRows = buildings.data ?? [];
  const lotCards = buildOccupancyItems(lots, buildingRows, { includeOrphanBuildings: isAdmin });
  const cards =
    lotCards.length > 0
      ? lotCards
      : zones.length > 0
        ? zones.map((zone) => ({
            id: zone.zoneId,
            title: displaySiteName(zone.name) || `${t('admin.zone')} ${zone.zoneId}`,
            free: zone.free,
            total: zone.total,
          }))
        : buildingRows.map((building) => ({
            id: building.id,
            title: displaySiteName(building.name) || building.name,
            free: building.emptyPlaces,
            total: building.totalPlaces,
          }));

  const loading = isAdmin
    ? details.isLoading || buildings.isLoading
    : buildingId
      ? occupancy.isLoading || details.isLoading
      : buildings.isLoading;
  const error = occupancy.error ?? details.error ?? buildings.error;
  const retry = () => {
    void occupancy.refetch();
    void details.refetch();
    void buildings.refetch();
  };

  return (
    <Stack spacing={2.75}>
      <PageHeader
        eyebrow={t('nav.occupancy')}
        title={t('occupancy.title')}
        hint={t('occupancy.guidanceHint')}
        actions={
          <Stack direction="row" alignItems="center" gap={1.25} flexWrap="wrap">
            <Chip size="small" color="success" label={t('occupancy.live')} />
            <OccupancyLegend />
            {isAdmin && (
              <Button size="small" variant="contained" color="secondary" component={RouterLink} to="/admin/free-places">
                {t('freePlaces.navShort')}
              </Button>
            )}
            {buildingId != null && (
              <Button
                size="small"
                variant="outlined"
                disabled={demoPending}
                onClick={() => {
                  setDemoPending(true);
                  setDemoError(null);
                  void api
                    .triggerRealtimeDemo(buildingId)
                    .catch((error: unknown) => {
                      setDemoError(error instanceof ApiError ? error.message : t('common.error'));
                    })
                    .finally(() => setDemoPending(false));
                }}
              >
                {t('occupancy.demo')}
              </Button>
            )}
          </Stack>
        }
      />
      {demoError && (
        <Typography color="error" variant="body2">
          {demoError}
        </Typography>
      )}
      <AsyncBody
        isLoading={loading}
        error={error}
        onRetry={retry}
        isEmpty={cards.length === 0}
        empty={<Typography color="text.secondary">{t('occupancy.empty')}</Typography>}
      >
        <OccupancyCards items={cards} />
      </AsyncBody>
    </Stack>
  );
}
