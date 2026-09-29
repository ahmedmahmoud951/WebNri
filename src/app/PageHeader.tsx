import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

export function PageHeader({
  title,
  hint,
  actions,
  eyebrow,
}: {
  title: string;
  hint?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <Stack
      className="nri-rise"
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      gap={2.5}
      sx={{ mb: 1 }}
    >
      <Stack spacing={1} sx={{ maxWidth: 760 }}>
        {eyebrow && (
          <Typography variant="overline" color="primary.main">
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4" sx={{ lineHeight: 1.25 }}>
          {title}
        </Typography>
        {hint && (
          <Typography color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.98rem' }}>
            {hint}
          </Typography>
        )}
      </Stack>
      {actions}
    </Stack>
  );
}
