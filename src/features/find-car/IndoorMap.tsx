import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { VehicleLocation } from '../../core/api/types';

export function IndoorMap({ location }: { location: VehicleLocation }) {
  const { t } = useTranslation();
  const nodes = location.route?.nodes ?? [];
  const edges = location.route?.edges ?? [];
  const points = nodes.map((node) => ({ id: node.id, x: node.x, y: node.y }));
  if (location.indoorX != null && location.indoorY != null) {
    points.push({ id: '__car', x: location.indoorX, y: location.indoorY });
  }

  if (points.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t('findCar.locationUnavailable')}
      </Typography>
    );
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 4;
  const width = Math.max(maxX - minX, 8) + pad * 2;
  const height = Math.max(maxY - minY, 8) + pad * 2;
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <Box dir="ltr" sx={{ bgcolor: '#fff', borderRadius: 2, border: 1, borderColor: 'divider', p: 1.5 }}>
      <svg viewBox={`${minX - pad} ${minY - pad} ${width} ${height}`} width="100%" height={280}>
        {edges.map((edge) => {
          const from = byId.get(edge.fromId);
          const to = byId.get(edge.toId);
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.fromId}-${edge.toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#1b5e4a"
              strokeWidth={0.45}
              strokeLinecap="round"
            />
          );
        })}
        {nodes.map((node) => (
          <circle key={node.id} cx={node.x} cy={node.y} r={0.55} fill="#8a5a32" />
        ))}
        {location.indoorX != null && location.indoorY != null && (
          <g>
            <circle cx={location.indoorX} cy={location.indoorY} r={1.1} fill="#c62828" />
            <circle cx={location.indoorX} cy={location.indoorY} r={0.45} fill="#fffcf7" />
          </g>
        )}
      </svg>
    </Box>
  );
}
