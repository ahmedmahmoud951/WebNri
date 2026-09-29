import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

interface AsyncBodyProps {
  isLoading: boolean;
  error: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  empty?: ReactNode;
  children: ReactNode;
}

export function AsyncBody({
  isLoading,
  error,
  onRetry,
  isEmpty,
  empty,
  children,
}: AsyncBodyProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : t('common.error');
    return (
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              {t('common.retry')}
            </Button>
          ) : undefined
        }
      >
        {message || t('common.error')}
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      empty ?? (
        <Typography color="text.secondary" sx={{ py: 4 }}>
          {t('common.empty')}
        </Typography>
      )
    );
  }

  return <>{children}</>;
}
