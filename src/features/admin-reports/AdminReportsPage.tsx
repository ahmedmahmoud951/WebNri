import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { OccupancyLegend } from '../occupancy/OccupancyCards';
import { useOccupancyReport } from '../../core/api/hooks';
import { PageHeader } from '../../app/PageHeader';
import { displayCurrency } from '../../core/display';

export function AdminReportsPage() {
  const { t } = useTranslation();
  const report = useOccupancyReport();
  const data = report.data;

  return (
    <Stack spacing={2} maxWidth={720}>
      <PageHeader title={t('reports.title')} hint={t('reports.hint')} />
      <OccupancyLegend />
      <AsyncBody isLoading={report.isLoading} error={report.error} onRetry={() => void report.refetch()}>
        {data && (
          <Stack direction="row" gap={2} flexWrap="wrap">
            <Stat label={t('reports.buildings')} value={data.buildingCount} />
            <Stat label={t('admin.free')} value={data.free} color="success.main" />
            <Stat label={t('admin.occupied')} value={data.occupied} color="error.main" />
            <Stat label={t('admin.total')} value={data.total} />
            <Stat label={t('reports.revenue')} value={`${data.revenueToday} ${displayCurrency(data.currency)}`} />
            <Stat label={t('reports.grace')} value={data.graceViolations} />
            <Stat label={t('reports.subs')} value={data.activeSubscriptions} />
            <Button component={RouterLink} to="/admin/grace" variant="outlined">
              {t('grace.title')}
            </Button>
          </Stack>
        )}
      </AsyncBody>
    </Stack>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <Card sx={{ minWidth: 160, flex: '1 1 160px' }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
