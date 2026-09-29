import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { IconTile } from './icons';
import { brand, glowPanel } from './theme';
import type { IconTone } from './iconCatalog';

export function EmptyState({
  icon,
  tone = 'teal',
  title,
  body,
  actions,
}: {
  icon: ReactNode;
  tone?: IconTone;
  title: string;
  body: string;
  actions?: { to: string; label: string; variant?: 'contained' | 'outlined' }[];
}) {
  return (
    <Box sx={{ ...glowPanel(tone === 'coral' ? brand.coral : brand.teal), p: { xs: 2.5, md: 3.5 } }}>
      <Stack spacing={2} alignItems="flex-start" maxWidth={560}>
        <IconTile tone={tone} size={56}>
          {icon}
        </IconTile>
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
          {body}
        </Typography>
        {actions && actions.length > 0 && (
          <Stack direction="row" gap={1.25} flexWrap="wrap">
            {actions.map((action) => (
              <Button
                key={action.to}
                component={RouterLink}
                to={action.to}
                variant={action.variant ?? 'outlined'}
                sx={{
                  borderColor: alpha('#fff', 0.18),
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
