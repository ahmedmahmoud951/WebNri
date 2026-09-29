import { useState, type ReactNode } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography, alpha } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { PlateText } from '../../app/PlateText';
import { useVehicleLocation, useVehicleLocationHistory } from '../../core/api/hooks';
import { displaySiteName, formatLocalDateTime } from '../../core/display';
import { IndoorMap } from './IndoorMap';
import { Glyphs, IconTile } from '../../app/icons';
import { brand, glowPanel } from '../../app/theme';
import { orderLatLng, osmEmbedSrc, osmOpenLink } from '../../core/geo/coords';

export function FindCarResultPage() {
  const { t } = useTranslation();
  const { plate: rawPlate } = useParams();
  const plate = rawPlate ? decodeURIComponent(rawPlate) : '';
  const location = useVehicleLocation(plate);
  const data = location.data;
  const history = useVehicleLocationHistory(data?.vehicleId);
  const [showMap, setShowMap] = useState(true);

  const hasPlace = Boolean(data?.placeName || data?.placeId);
  const hasWalkPath = Boolean(
    data?.areaName || data?.zoneName || data?.parkingLotName || data?.laneName || hasPlace,
  );

  const hasGeo = data?.latitude != null && data?.longitude != null;
  const geo = hasGeo ? orderLatLng(data.latitude as number, data.longitude as number) : null;
  const hasIndoor =
    (data?.indoorX != null && data?.indoorY != null) || Boolean(data?.route?.nodes.length);

  return (
    <Stack spacing={2.75} maxWidth={760}>
      <PageHeader
        eyebrow={t('nav.findCar')}
        title={t('findCar.resultTitle')}
        hint={t('findCar.resultHint')}
        actions={
          <Button component={RouterLink} to="/find-car" variant="outlined">
            {t('findCar.back')}
          </Button>
        }
      />
      <AsyncBody
        isLoading={location.isLoading}
        error={location.error}
        onRetry={() => void location.refetch()}
        isEmpty={!data}
        empty={<Typography color="text.secondary">{t('findCar.notFound')}</Typography>}
      >
        {data && (
          <Stack spacing={2.25}>
            {!data.found ? (
              <Box sx={{ ...glowPanel(brand.amber), p: 4, textAlign: 'center' }}>
                <Stack spacing={2} alignItems="center">
                  <IconTile tone="coral" size={56}>
                    {Glyphs.car}
                  </IconTile>
                  <Typography variant="h5" fontWeight={800}>
                    {data.message || 'السيارة غير متواجدة داخل الموقف حالياً'}
                  </Typography>
                  <Typography color="text.secondary" maxWidth={480}>
                    تم تسجيل خروج هذه السيارة من الموقف، أو لا توجد جلسة ركن نشطة مرتبطة برقم اللوحة ({plate}).
                  </Typography>
                  <Button component={RouterLink} to="/find-car" variant="contained" color="primary" sx={{ mt: 1 }}>
                    {t('findCar.back')}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <>
                <Chip color="success" label={t('findCar.current')} sx={{ alignSelf: 'flex-start' }} />
                <Box sx={{ ...glowPanel(brand.teal), p: 2.75 }}>
                  <Stack spacing={1.5}>
                    <Typography color="text.secondary" variant="overline" fontWeight={800}>
                      {t('findCar.walkPath')}
                    </Typography>
                    <PathTrail
                      steps={[
                        data.areaName && { label: t('findCar.building'), value: displaySiteName(data.areaName) },
                        data.zoneName && { label: t('findCar.zone'), value: displaySiteName(data.zoneName) },
                        data.parkingLotName && {
                          label: t('findCar.parking'),
                          value: displaySiteName(data.parkingLotName),
                        },
                        data.laneName && { label: t('findCar.lane'), value: data.laneName },
                        hasPlace && { label: t('findCar.place'), value: data.placeName ?? String(data.placeId) },
                      ].filter(Boolean) as { label: string; value: string }[]}
                    />
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: '1.8rem', md: '2.2rem' },
                        background: `linear-gradient(135deg, ${brand.ink}, ${brand.teal})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {hasPlace
                        ? data.placeName ?? String(data.placeId)
                        : displaySiteName(data.parkingLotName || data.zoneName || data.areaName) || t('findCar.notFound')}
                    </Typography>
                    {data.message && (
                      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {data.message}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Card>
                  <CardContent sx={{ p: 2.75 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                      <IconTile tone="ink" size={48}>
                        {Glyphs.find}
                      </IconTile>
                      <BoxCopy title={<PlateText>{data.plate || plate}</PlateText>} subtitle={t('session.plate')} />
                    </Stack>
                    <Stack spacing={1.25}>
                      {data.areaName && <Row label={t('findCar.building')} value={displaySiteName(data.areaName)} />}
                      {data.zoneName && <Row label={t('findCar.zone')} value={displaySiteName(data.zoneName)} />}
                      {data.parkingLotName && (
                        <Row label={t('findCar.parking')} value={displaySiteName(data.parkingLotName)} />
                      )}
                      {data.floorId != null && <Row label={t('findCar.floor')} value={data.floorId} />}
                      {data.laneName && <Row label={t('findCar.lane')} value={data.laneName} />}
                      {hasPlace ? (
                        <Row label={t('findCar.place')} value={data.placeName ?? String(data.placeId)} />
                      ) : (
                        (data.zoneName || data.laneName) && (
                          <Typography color="text.secondary" variant="body2">
                            {t('findCar.zoneLaneOnly')}
                          </Typography>
                        )
                      )}
                      {data.locationAccuracy && (
                        <Row label={t('findCar.accuracy')} value={t(`findCar.accuracyValue.${data.locationAccuracy}`)} />
                      )}
                      {data.capturedAt && (
                        <Row label={t('findCar.updated')} value={formatLocalDateTime(data.capturedAt)} />
                      )}
                      {geo && (
                        <Row
                          label={t('findCar.coordinates')}
                          value={`${geo.latitude.toFixed(5)}, ${geo.longitude.toFixed(5)}`}
                        />
                      )}
                      {data.route?.totalDistance != null && (
                        <Row label={t('findCar.distance')} value={`${data.route.totalDistance} m`} />
                      )}
                      {data.route?.estimatedTimeSeconds != null && (
                        <Row
                          label={t('findCar.eta')}
                          value={formatSeconds(data.route.estimatedTimeSeconds, t)}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setShowMap((prev) => !prev)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {showMap ? t('findCar.hideLocation', { defaultValue: 'إخفاء الخريطة' }) : t('findCar.showLocation')}
                </Button>
                {showMap && (
                  <Stack spacing={1.75}>
                    {geo ? (
                      <OutdoorMap
                        lat={geo.latitude}
                        lng={geo.longitude}
                        swapped={geo.swapped}
                        swappedHint={t('findCar.coordsSwapped')}
                        openLabel={t('findCar.openMap')}
                      />
                    ) : hasIndoor ? (
                      <IndoorMap location={data} />
                    ) : hasWalkPath ? (
                      <Alert severity="info">{t('findCar.geoHint')}</Alert>
                    ) : (
                      <Alert severity="warning">{t('findCar.locationUnavailable')}</Alert>
                    )}
                    {data.route?.instructions && data.route.instructions.length > 0 && (
                      <Card>
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography variant="h6" sx={{ mb: 1.25 }}>
                            {t('findCar.instructions')}
                          </Typography>
                          <Stack spacing={0.75} component="ol" sx={{ m: 0, pl: 3 }}>
                            {data.route.instructions.map((step, index) => (
                              <Typography key={`${index}-${step}`} component="li" sx={{ lineHeight: 1.7 }}>
                                {step}
                              </Typography>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                )}

                {data.vehicleId != null && (
                  <Card>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.75 }}>
                        <IconTile tone="sky" size={36}>
                          {Glyphs.history}
                        </IconTile>
                        <Typography variant="h6">{t('findCar.historyTitle')}</Typography>
                      </Stack>
                      <AsyncBody
                        isLoading={history.isLoading}
                        error={history.error}
                        onRetry={() => void history.refetch()}
                        isEmpty={!history.data?.length}
                        empty={<Typography color="text.secondary">{t('findCar.historyEmpty')}</Typography>}
                      >
                        <Stack spacing={1.25}>
                          {history.data?.map((point, index) => (
                            <Box
                              key={`${point.capturedAt ?? index}-${point.placeName ?? point.laneName ?? index}`}
                              sx={{
                                p: 1.5,
                                borderRadius: 2.5,
                                border: `1px solid ${alpha(brand.ink, 0.06)}`,
                                bgcolor: alpha(brand.teal, 0.03),
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                <Typography fontWeight={700}>
                                  {point.placeName ?? point.laneName ?? point.zoneName ?? point.areaName ?? t('findCar.unknownPoint')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {point.areaName && `${displaySiteName(point.areaName)} · `}
                                  {point.capturedAt ? formatLocalDateTime(point.capturedAt) : ''}
                                </Typography>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </AsyncBody>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </Stack>
        )}
      </AsyncBody>
    </Stack>
  );
}

function OutdoorMap({
  lat,
  lng,
  swapped,
  swappedHint,
  openLabel,
}: {
  lat: number;
  lng: number;
  swapped?: boolean;
  swappedHint?: string;
  openLabel: string;
}) {
  const src = osmEmbedSrc(lat, lng);
  const link = osmOpenLink(lat, lng);
  return (
    <Stack spacing={1}>
      {swapped && swappedHint && <Alert severity="info">{swappedHint}</Alert>}
      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider', height: 280 }}>
        <iframe title="map" src={src} width="100%" height="100%" style={{ border: 0 }} />
      </Box>
      <Button href={link} target="_blank" rel="noreferrer" size="small" sx={{ alignSelf: 'flex-start' }}>
        {openLabel}
      </Button>
    </Stack>
  );
}

function PathTrail({ steps }: { steps: { label: string; value: string }[] }) {
  if (steps.length === 0) return null;
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} alignItems="center">
      {steps.map((step, index) => (
        <Stack key={`${step.label}-${step.value}`} direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              px: 1.25,
              py: 0.7,
              borderRadius: 2,
              bgcolor: alpha(brand.teal, 0.12),
              border: `1px solid ${alpha(brand.teal, 0.28)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              {step.label}
            </Typography>
            <Typography fontWeight={800}>{step.value}</Typography>
          </Box>
          {index < steps.length - 1 && (
            <Typography color="text.secondary" fontWeight={800}>
              ·
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function BoxCopy({ title, subtitle }: { title: ReactNode; subtitle: string }) {
  return (
    <Stack spacing={0.35}>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
      <Typography variant="h5" component="div">
        {title}
      </Typography>
    </Stack>
  );
}

function formatSeconds(total: number, t: (key: string, opts?: Record<string, unknown>) => string) {
  const minutes = Math.floor(total / 60);
  const seconds = Math.round(total % 60);
  if (minutes <= 0) return t('findCar.secondsOnly', { seconds });
  return t('findCar.minutesSeconds', { minutes, seconds: String(seconds).padStart(2, '0') });
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      gap={2}
      sx={{
        py: 0.85,
        borderBottom: `1px dashed ${alpha(brand.ink, 0.08)}`,
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ textAlign: 'end', fontWeight: 600 }}>{value}</Typography>
    </Stack>
  );
}
