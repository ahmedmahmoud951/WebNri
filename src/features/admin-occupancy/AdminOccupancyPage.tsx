import { Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../core/auth/authContext';
import { useBuildings, useOccupancyDetails } from '../../core/api/hooks';
import { AsyncBody } from '../../app/AsyncBody';
import { OccupancyLegend } from '../occupancy/OccupancyCards';
import { PageHeader } from '../../app/PageHeader';
import { displaySiteName } from '../../core/display';

export function AdminOccupancyPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const buildings = useBuildings();
  const details = useOccupancyDetails(user?.buildingId, { allLots: isAdmin });

  const lots = details.data ?? [];

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('admin.title')}
        hint={`${t('admin.subtitleAll')} ${t('occupancy.guidanceHint')}`}
        actions={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" color="success" label={t('occupancy.live')} />
            <OccupancyLegend />
          </Stack>
        }
      />
      <AsyncBody
        isLoading={buildings.isLoading || details.isLoading}
        error={buildings.error ?? details.error}
        onRetry={() => {
          void buildings.refetch();
          void details.refetch();
        }}
        isEmpty={!buildings.data?.length && lots.length === 0}
        empty={<Typography color="text.secondary">{t('occupancy.empty')}</Typography>}
      >
        {buildings.data && (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.building')}</TableCell>
                  <TableCell align="right">{t('admin.free')}</TableCell>
                  <TableCell align="right">{t('admin.occupied')}</TableCell>
                  <TableCell align="right">{t('admin.total')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {buildings.data.map((building) => (
                  <TableRow key={building.id}>
                    <TableCell>{displaySiteName(building.name) || building.name}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                      {building.emptyPlaces}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                      {Math.max(0, building.totalPlaces - building.emptyPlaces)}
                    </TableCell>
                    <TableCell align="right">{building.totalPlaces}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </AsyncBody>
      {lots.length > 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.parking')}</TableCell>
                <TableCell>{t('admin.building')}</TableCell>
                <TableCell align="right">{t('admin.free')}</TableCell>
                <TableCell align="right">{t('admin.occupied')}</TableCell>
                <TableCell align="right">{t('admin.total')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lots.map((lot) => {
                const building = buildings.data?.find((item) => item.id === lot.buildingId);
                return (
                  <TableRow key={lot.parkingId}>
                    <TableCell>{displaySiteName(lot.name) || lot.name}</TableCell>
                    <TableCell>
                      {building ? displaySiteName(building.name) || building.name : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                      {lot.free}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                      {lot.occupied}
                    </TableCell>
                    <TableCell align="right">{lot.total}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}
