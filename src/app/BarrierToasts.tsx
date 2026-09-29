import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../core/auth/authContext';

export function BarrierToasts() {
  const { hub, status } = useAuth();
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    return hub.onBarrierOpened((event) => {
      setMessage(t('common.barrierToast', { laneId: event.laneId }));
    });
  }, [hub, status, t]);

  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={4000}
      onClose={() => setMessage(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="info" onClose={() => setMessage(null)}>
        {message}
      </Alert>
    </Snackbar>
  );
}
