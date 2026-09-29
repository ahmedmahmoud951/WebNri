import { Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../core/auth/authContext';
import type { ConnectionState } from '../core/realtime/liveHub';

export function ConnectionBanner() {
  const { hub, status } = useAuth();
  const { t } = useTranslation();
  const [state, setState] = useState<ConnectionState>(hub.state);

  useEffect(() => hub.onStateChange(setState), [hub]);

  if (status !== 'authenticated') return null;
  if (state === 'connected' || state === 'connecting') return null;

  return (
    <Alert severity="warning" sx={{ borderRadius: 0 }}>
      {t('common.offline')}
    </Alert>
  );
}
