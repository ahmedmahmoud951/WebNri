import { Box, Card, CardContent, Stack, Typography, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { brand } from '../../app/theme';
import { displaySiteName } from '../../core/display';
import type { Building, OccupancyLot } from '../../core/api/types';

export interface OccupancyCardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  free: number;
  total: number;
}

function namesMatch(a: string, b: string) {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.length < 3 || right.length < 3) return false;
  return left.includes(right) || right.includes(left);
}

export function buildOccupancyItems(
  lots: OccupancyLot[],
  buildings: Building[],
  options?: { includeOrphanBuildings?: boolean },
): OccupancyCardItem[] {
  const cards: OccupancyCardItem[] = lots.map((lot) => {
    const building = buildings.find((item) => lot.buildingId != null && item.id === lot.buildingId);
    const buildingLabel = building ? displaySiteName(building.name) || building.name : undefined;
    const title = displaySiteName(lot.name) || lot.name;
    return {
      id: lot.parkingId,
      title,
      subtitle: buildingLabel && buildingLabel !== title ? buildingLabel : undefined,
      free: lot.free,
      total: lot.total,
    };
  });

  if (!options?.includeOrphanBuildings) return cards;

  for (const building of buildings) {
    if (building.totalPlaces <= 0 && building.emptyPlaces <= 0) continue;
    const title = displaySiteName(building.name) || building.name;
    const alreadyShown = lots.some((lot) => {
      if (lot.buildingId === building.id) return true;
      return namesMatch(displaySiteName(lot.name) || lot.name, title);
    });
    if (alreadyShown) continue;
    cards.push({
      id: `building-${building.id}`,
      title,
      free: building.emptyPlaces,
      total: building.totalPlaces,
    });
  }

  return cards;
}

export function OccupancyLegend() {
  const { t } = useTranslation();
  return (
    <Stack direction="row" spacing={2.5}>
      <LegendSwatch color={brand.teal} label={t('occupancy.legendFree')} />
      <LegendSwatch color={brand.coral} label={t('occupancy.legendBusy')} />
    </Stack>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.9} alignItems="center">
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: color,
          boxShadow: `0 0 0 3px ${alpha(color, 0.22)}, 0 0 14px ${alpha(color, 0.55)}`,
        }}
      />
      <Typography variant="caption" color="text.secondary" fontWeight={650}>
        {label}
      </Typography>
    </Stack>
  );
}

export function OccupancyCards({ items }: { items: OccupancyCardItem[] }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2.75,
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      {items.map((item, index) => {
        const occupied = Math.max(0, item.total - item.free);
        const freePct = item.total === 0 ? 0 : (item.free / item.total) * 100;
        const busyPct = item.total === 0 ? 0 : (occupied / item.total) * 100;
        const full = item.total > 0 && item.free === 0;
        const empty = item.total > 0 && occupied === 0;
        const edge = full ? brand.coral : empty ? brand.teal : brand.amber;

        return (
          <Card
            key={item.id}
            className={`nri-rise nri-rise-delay-${(index % 3) + 1} nri-glow-card`}
            sx={{
              overflow: 'hidden',
              position: 'relative',
              border: `1px solid ${alpha(edge, 0.45)}`,
              background: `
                linear-gradient(155deg, ${alpha('#fff', 0.12)} 0%, ${alpha('#fff', 0.03)} 48%, ${alpha(edge, 0.06)} 100%)
              `,
              backdropFilter: 'blur(22px) saturate(1.5)',
              boxShadow: `
                0 0 0 1px ${alpha(edge, 0.22)},
                0 0 40px ${alpha(edge, 0.2)},
                0 28px 56px ${alpha('#000', 0.45)},
                inset 0 1px 0 ${alpha('#fff', 0.16)}
              `,
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                padding: '1px',
                background: `linear-gradient(135deg, ${alpha(edge, 0.75)}, transparent 40%, ${alpha('#fff', 0.15)} 70%, ${alpha(edge, 0.35)})`,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                pointerEvents: 'none',
              },
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: `
                  0 0 0 1px ${alpha(edge, 0.5)},
                  0 0 56px ${alpha(edge, 0.35)},
                  0 32px 64px ${alpha('#000', 0.5)},
                  inset 0 1px 0 ${alpha('#fff', 0.2)}
                `,
              },
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Stack spacing={0.25} sx={{ minWidth: 0, pr: 1 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: edge,
                      fontWeight: 800,
                      letterSpacing: 0.14,
                      textShadow: `0 0 18px ${alpha(edge, 0.45)}`,
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.subtitle ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {item.subtitle}
                    </Typography>
                  ) : null}
                </Stack>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.35,
                    borderRadius: 999,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: edge,
                    bgcolor: alpha(edge, 0.12),
                    border: `1px solid ${alpha(edge, 0.35)}`,
                    boxShadow: `0 0 16px ${alpha(edge, 0.25)}`,
                  }}
                >
                  {full ? t('occupancy.legendBusy') : empty ? t('occupancy.legendFree') : `${item.free}/${item.total}`}
                </Box>
              </Stack>

              <Typography
                variant="h3"
                sx={{
                  mt: 0.5,
                  mb: 0.75,
                  fontSize: { xs: '1.85rem', md: '2.15rem' },
                  background: `linear-gradient(135deg, ${brand.ink}, ${edge})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('occupancy.counts', { free: item.free, total: item.total })}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.65 }}>
                {t('occupancy.occupiedOf', { occupied, total: item.total })}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  height: 14,
                  borderRadius: 999,
                  overflow: 'hidden',
                  bgcolor: alpha('#fff', 0.06),
                  boxShadow: `inset 0 0 0 1px ${alpha('#fff', 0.08)}, 0 0 20px ${alpha(edge, 0.15)}`,
                }}
              >
                <Box
                  sx={{
                    width: `${freePct}%`,
                    background: `linear-gradient(90deg, ${brand.tealDeep}, ${brand.teal})`,
                    boxShadow: `0 0 16px ${brand.glow}`,
                    transition: 'width 450ms ease',
                  }}
                />
                <Box
                  sx={{
                    width: `${busyPct}%`,
                    background: `linear-gradient(90deg, #E11D48, ${brand.coral})`,
                    boxShadow: `0 0 16px ${brand.coralGlow}`,
                    transition: 'width 450ms ease',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: brand.teal,
                    fontWeight: 800,
                    textShadow: `0 0 12px ${alpha(brand.teal, 0.45)}`,
                  }}
                >
                  {t('occupancy.legendFree')} · {item.free}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: brand.coral,
                    fontWeight: 800,
                    textShadow: `0 0 12px ${alpha(brand.coral, 0.45)}`,
                  }}
                >
                  {t('occupancy.legendBusy')} · {occupied}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
