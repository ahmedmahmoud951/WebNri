import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../app/PageHeader';
import { Glyphs, IconTile } from '../../app/icons';
import { glowPanel } from '../../app/theme';
import { ICON_CATALOG } from '../../app/iconCatalog';

const electric = '#00b4ff';

function SettingsTile({
  to,
  icon,
  title,
  desc,
  tone,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  desc: string;
  tone: 'mint' | 'sky' | 'violet';
}) {
  return (
    <Box
      component={RouterLink}
      to={to}
      className="nri-glow-card"
      sx={{
        ...glowPanel(),
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        p: 2.5,
        borderRadius: '20px',
        border: `1px solid ${alpha(electric, 0.28)}`,
        background: `
          linear-gradient(145deg, ${alpha('#0a1220', 0.95)} 0%, ${alpha('#101828', 0.88)} 55%, ${alpha(electric, 0.06)} 100%)
        `,
        boxShadow: `0 0 40px ${alpha(electric, 0.12)}, inset 0 1px 0 ${alpha('#fff', 0.08)}`,
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(electric, 0.55),
          boxShadow: `0 0 48px ${alpha(electric, 0.22)}, inset 0 1px 0 ${alpha('#fff', 0.12)}`,
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <IconTile tone={tone} size={56}>
          {icon}
        </IconTile>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: electric, textShadow: `0 0 20px ${alpha(electric, 0.35)}` }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
            {desc}
          </Typography>
        </Box>
        <Typography sx={{ color: alpha(electric, 0.7), fontWeight: 800, fontSize: 22 }}>→</Typography>
      </Stack>
    </Box>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2.75}>
      <PageHeader
        eyebrow={t('nav.groupOps')}
        title={t('opsSettings.title')}
        hint={t('opsSettings.hint')}
        actions={
          <IconTile tone="sky" size={48} label={t('opsSettings.title')} showLabel>
            {Glyphs.settings}
          </IconTile>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <SettingsTile
          to="/admin/views"
          icon={Glyphs.grid}
          title={t('opsSettings.viewsTitle')}
          desc={t('opsSettings.viewsDesc')}
          tone="sky"
        />
        <SettingsTile
          to="/admin/lpr"
          icon={ICON_CATALOG.cameras.glyph}
          title={t('opsSettings.camerasTitle')}
          desc={t('opsSettings.camerasDesc')}
          tone="mint"
        />
      </Box>

      <Box
        sx={{
          ...glowPanel(),
          p: 2,
          borderRadius: '16px',
          border: `1px dashed ${alpha(electric, 0.25)}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t('opsSettings.flowHint')}
        </Typography>
        <Button
          component={RouterLink}
          to="/admin/lpr"
          variant="contained"
          color="secondary"
          sx={{ mt: 1.5 }}
        >
          {t('opsSettings.openLpr')}
        </Button>
      </Box>
    </Stack>
  );
}
