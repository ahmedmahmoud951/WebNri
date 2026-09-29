import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export function PlateText({ children }: { children: ReactNode }) {
  return (
    <Box component="span" dir="ltr" sx={{ unicodeBidi: 'isolate', fontFamily: 'ui-monospace, Consolas, monospace' }}>
      {children}
    </Box>
  );
}
