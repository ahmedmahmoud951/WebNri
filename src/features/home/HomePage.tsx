import { useTranslation } from 'react-i18next';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../core/auth/authContext';
import { displayPersonName } from '../../core/display';
import type { UserRole } from '../../core/api/types';
import { PageHeader } from '../../app/PageHeader';
import { IconTile } from '../../app/icons';
import { ICON_CATALOG, type IconDef } from '../../app/iconCatalog';
import { brand, glowPanel } from '../../app/theme';

function copyForRole(role: UserRole) {
  if (role === 'admin') return { title: 'home.adminTitle', body: 'home.adminBody' };
  if (role === 'citizen') return { title: 'home.citizenTitle', body: 'home.citizenBody' };
  if (role === 'employee') return { title: 'home.employeeTitle', body: 'home.employeeBody' };
  return { title: 'home.visitorTitle', body: 'home.visitorBody' };
}

interface HomeCard extends IconDef {
  to: string;
  title: string;
  hint: string;
  primary?: boolean;
}

function localeKey(lang: string): 'ar' | 'en' {
  return lang.startsWith('en') ? 'en' : 'ar';
}

export function HomePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;

  const loc = localeKey(i18n.language);
  const copy = copyForRole(user.role);

  const card = (def: IconDef, to: string, title: string, hint: string, primary?: boolean): HomeCard => ({
    ...def,
    to,
    title,
    hint,
    primary,
  });

  const parking: HomeCard[] = [
    card(ICON_CATALOG.car, '/occupancy', t('home.occupancy'), t('home.hintOccupancy'), user.role === 'citizen' || user.role === 'employee'),
    card(ICON_CATALOG.session, '/session', t('home.session'), t('home.hintSession'), user.role === 'visitor'),
    card(ICON_CATALOG.history, '/receipts', t('home.receipts'), t('home.hintReceipts')),
    card(ICON_CATALOG.find, '/find-car', t('home.findCar'), t('home.hintFindCar')),
    card(ICON_CATALOG.key, '/invite', t('home.invite'), t('home.hintInvite')),
  ];
  if (user.role === 'citizen' || user.role === 'employee' || user.role === 'admin') {
    parking.splice(
      2,
      0,
      card(ICON_CATALOG.card, '/subscriptions', t('home.subscriptions'), t('home.hintSubs')),
      card(ICON_CATALOG.calendar, '/reservations', t('home.reservations'), t('home.hintReserve')),
    );
  } else {
    parking.splice(2, 0, card(ICON_CATALOG.calendar, '/reservations', t('home.reservations'), t('home.hintReserve')));
  }

  const district: HomeCard[] = [
    card(ICON_CATALOG.qr, '/pass', t('home.pass'), t('home.hintPass'), user.role === 'citizen'),
    card(ICON_CATALOG.ev, '/ev', t('home.ev'), t('home.hintEv')),
    card(ICON_CATALOG.bill, '/billing', t('home.billing'), t('home.hintBilling')),
  ];

  const account: HomeCard[] = [
    card(ICON_CATALOG.ticket, '/tickets', t('home.tickets'), t('home.hintTickets')),
    card(ICON_CATALOG.user, '/profile', t('home.profile'), t('home.hintProfile')),
  ];

  const ops: HomeCard[] =
    user.role === 'admin'
      ? [
          card(ICON_CATALOG.dash, '/admin/occupancy', t('home.adminOccupancy'), t('home.hintAdminOccupancy'), true),
          card(ICON_CATALOG.chart, '/admin/reports', t('home.reports'), t('home.hintReports')),
          card(ICON_CATALOG.timer, '/admin/grace', t('home.grace'), t('home.hintGrace')),
          card(ICON_CATALOG.search, '/admin/plates', t('home.plates'), t('home.hintPlates')),
          card(ICON_CATALOG.car, '/admin/vehicle-bindings', t('nav.bindings'), t('home.hintBindings')),
          card(ICON_CATALOG.support, '/admin/tickets', t('home.adminTickets'), t('home.hintAdminTickets')),
          card(ICON_CATALOG.users, '/admin/users', t('home.users'), t('home.hintUsers')),
          card(ICON_CATALOG.usersManage, '/admin/users-manage', t('nav.usersManage'), t('opsUsers.hint')),
          card(ICON_CATALOG.cameras, '/admin/cameras', t('nav.cameras'), t('opsCameras.hint')),
          card(ICON_CATALOG.lpr, '/admin/lpr', t('nav.lpr'), t('opsLpr.hint')),
          card(ICON_CATALOG.freePlaces, '/admin/free-places', t('nav.freePlaces'), t('freePlaces.hint')),
        ]
      : [];

  const allCards = [...ops, ...parking, ...district, ...account];

  return (
    <Stack spacing={4.5}>
      <Box className="nri-rise" sx={{ ...glowPanel(brand.teal), p: { xs: 2.5, md: 3.5 } }}>
        <PageHeader
          eyebrow={t(copy.title)}
          title={t('home.hello', { name: displayPersonName(user.displayName) })}
          hint={t(copy.body)}
          actions={<Chip color="primary" variant="outlined" label={t(`roles.${user.role}`)} />}
        />
      </Box>

      {ops.length > 0 && <Section title={t('nav.groupOps')} cards={ops} loc={loc} />}
      <Section title={t('nav.groupParking')} cards={parking} loc={loc} />
      <Section title={t('nav.groupDistrict')} cards={district} loc={loc} />
      <Section title={t('nav.groupAccount')} cards={account} loc={loc} />

      <IconLegend cards={allCards} loc={loc} title={t('icons.legendTitle')} hint={t('icons.legendHint')} />
    </Stack>
  );
}

function Section({ title, cards, loc }: { title: string; cards: HomeCard[]; loc: 'ar' | 'en' }) {
  return (
    <Stack spacing={2} className="nri-rise nri-rise-delay-1">
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
        }}
      >
        {cards.map((card) => (
          <HomeCardTile key={card.to} card={card} loc={loc} />
        ))}
      </Box>
    </Stack>
  );
}

function HomeCardTile({ card, loc }: { card: HomeCard; loc: 'ar' | 'en' }) {
  const iconName = loc === 'en' ? card.nameEn : card.nameAr;
  return (
    <Card
      sx={{
        borderColor: card.primary ? alpha(brand.teal, 0.45) : undefined,
        boxShadow: card.primary ? `0 16px 40px ${brand.glow}` : undefined,
        '&:hover': {
          transform: 'translateY(-5px)',
          borderColor: alpha(brand.teal, 0.35),
          boxShadow: `0 24px 48px ${alpha('#000', 0.5)}`,
        },
      }}
    >
      <CardActionArea component={RouterLink} to={card.to} sx={{ height: '100%', borderRadius: 'inherit' }}>
        <CardContent sx={{ p: 2.75 }}>
          <Stack spacing={2}>
            <IconTile tone={card.tone} size={52} label={iconName} showLabel>
              {card.glyph}
            </IconTile>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.3, mb: 0.75 }}>
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                {card.hint}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={iconName}
              sx={{
                alignSelf: 'flex-start',
                bgcolor: alpha('#fff', 0.06),
                border: `1px solid ${alpha('#fff', 0.1)}`,
                fontWeight: 700,
                fontSize: '0.68rem',
              }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function IconLegend({
  cards,
  loc,
  title,
  hint,
}: {
  cards: HomeCard[];
  loc: 'ar' | 'en';
  title: string;
  hint: string;
}) {
  const unique = cards.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);
  return (
    <Box className="nri-rise nri-rise-delay-2" sx={{ ...glowPanel(brand.amber), p: { xs: 2, md: 2.75 } }}>
      <Typography variant="overline" color="primary.main" sx={{ display: 'block', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
        {hint}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: 'repeat(4, 1fr)' },
        }}
      >
        {unique.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              bgcolor: alpha('#fff', 0.04),
              border: `1px solid ${alpha('#fff', 0.08)}`,
            }}
          >
            <IconTile tone={item.tone} size={32}>
              {item.glyph}
            </IconTile>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" fontWeight={800} sx={{ display: 'block', lineHeight: 1.2 }}>
                {loc === 'en' ? item.nameEn : item.nameAr}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', lineHeight: 1.3 }}>
                {loc === 'en' ? item.descEn : item.descAr}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
