import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { remainingParts, useGraceClock } from '../../core/parking/grace';
import { config } from '../../core/config';
import { displayCurrency } from '../../core/display';

export function GraceStatus({
  graceUntil,
  extraFee,
  extraFeeCurrency,
}: {
  graceUntil: string | null | undefined;
  extraFee?: number;
  extraFeeCurrency?: string;
}) {
  const { t } = useTranslation();
  const state = useGraceClock(graceUntil);

  if (state.kind === 'none') {
    return <Alert severity="info">{t('session.graceNote', { minutes: config.graceMinutes })}</Alert>;
  }

  if (state.kind === 'expired') {
    return (
      <Alert severity="warning">
        {extraFee != null && extraFee > 0
          ? t('session.graceExpiredFee', { amount: extraFee, currency: displayCurrency(extraFeeCurrency) })
          : t('session.graceExpired')}
      </Alert>
    );
  }

  const { minutes, seconds } = remainingParts(state.remainingMs);
  return (
    <Alert severity="success">
      {t('session.graceActive', {
        remaining: t('session.graceRemaining', { minutes, seconds: String(seconds).padStart(2, '0') }),
        minutes: config.graceMinutes,
      })}
    </Alert>
  );
}
