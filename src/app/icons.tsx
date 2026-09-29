import type { ReactNode, SVGProps } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { brand } from './theme';
import type { IconTone } from './iconCatalog';

const tones: Record<IconTone, { from: string; to: string; fg: string; glow: string }> = {
  teal: { from: '#0D9488', to: '#2DD4BF', fg: '#041018', glow: brand.glow },
  coral: { from: '#E11D48', to: '#FB7185', fg: '#fff', glow: brand.coralGlow },
  ink: { from: '#1E293B', to: '#334155', fg: '#E2E8F0', glow: 'rgba(148,163,184,0.25)' },
  mint: { from: '#059669', to: '#34D399', fg: '#041018', glow: 'rgba(52,211,153,0.3)' },
  sky: { from: '#2563EB', to: '#60A5FA', fg: '#fff', glow: 'rgba(96,165,250,0.3)' },
  gold: { from: '#D97706', to: '#FBBF24', fg: '#041018', glow: brand.amberGlow },
  violet: { from: '#7C3AED', to: '#A78BFA', fg: '#fff', glow: 'rgba(167,139,250,0.32)' },
};

export function IconTile({
  children,
  tone = 'teal',
  size = 44,
  pulse,
  label,
  showLabel = false,
}: {
  children: ReactNode;
  tone?: IconTone;
  size?: number;
  pulse?: boolean;
  label?: string;
  showLabel?: boolean;
}) {
  const t = tones[tone];
  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
      <Box
        className={pulse ? 'nri-icon-pulse' : undefined}
        title={label}
        aria-label={label}
        sx={{
          width: size,
          height: size,
          borderRadius: size > 40 ? 4 : 3,
          display: 'grid',
          placeItems: 'center',
          color: t.fg,
          background: `linear-gradient(145deg, ${alpha(t.from, 0.95)} 0%, ${alpha(t.to, 0.85)} 100%)`,
          boxShadow: `
            0 12px 28px ${t.glow},
            inset 0 1px 0 ${alpha('#fff', 0.35)},
            inset 0 -1px 0 ${alpha('#000', 0.15)}
          `,
          border: `1px solid ${alpha('#fff', 0.2)}`,
          flexShrink: 0,
          '& svg': { width: size * 0.48, height: size * 0.48, display: 'block', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' },
        }}
      >
        {children}
      </Box>
      {showLabel && label && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.04em',
            color: alpha(brand.ink, 0.72),
            textAlign: 'center',
            maxWidth: size + 24,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props} />
  );
}

export const Glyphs = {
  home: (
    <Svg>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </Svg>
  ),
  car: (
    <Svg>
      <path d="M5 16h14v2.5a1 1 0 0 1-1 1h-1.5M7.5 19.5H6a1 1 0 0 1-1-1V16" />
      <path d="M5 16 6.5 10.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16" />
      <circle cx="7.5" cy="16.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="16.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M9 9.2 9.8 7.2h4.4L15 9.2" />
    </Svg>
  ),
  session: (
    <Svg>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Svg>
  ),
  history: (
    <Svg>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 5.5V9H8" />
      <path d="M12 8v4.5l3 1.8" />
    </Svg>
  ),
  find: (
    <Svg>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.2 16.2 3.3 3.3" />
      <path d="M11 8.2v5.6M8.2 11h5.6" />
    </Svg>
  ),
  key: (
    <Svg>
      <circle cx="8.5" cy="14" r="3.5" />
      <path d="M11.5 11.5 19 4m-3.2.8 2.4 2.4" />
    </Svg>
  ),
  card: (
    <Svg>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M7 14h4" />
    </Svg>
  ),
  calendar: (
    <Svg>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
      <path d="M9 14h.01M12 14h.01M15 14h.01" />
    </Svg>
  ),
  qr: (
    <Svg>
      <path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" />
      <path d="M14 14h2v2h-2zM18 14h1v5h-5v-1M14 18h2" />
    </Svg>
  ),
  ev: (
    <Svg>
      <path d="M11 3 6.5 12.5h4L9.5 21 17.5 10h-4L15.5 3H11Z" />
    </Svg>
  ),
  bill: (
    <Svg>
      <path d="M7 3.5h10v17l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3.5Z" />
      <path d="M9.5 8h5M9.5 11.5h5M9.5 15h3" />
    </Svg>
  ),
  ticket: (
    <Svg>
      <path d="M4 9a2 2 0 0 0 0 4v3.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V13a2 2 0 0 0 0-4V5.5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1V9Z" />
      <path d="M12 7v10" strokeDasharray="2 2" />
    </Svg>
  ),
  user: (
    <Svg>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5c1.6-3.2 4-4.8 6.5-4.8s4.9 1.6 6.5 4.8" />
    </Svg>
  ),
  dash: (
    <Svg>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" />
      <rect x="13.5" y="10" width="7" height="10.5" rx="1.5" />
      <rect x="3.5" y="13" width="7" height="7.5" rx="1.5" />
    </Svg>
  ),
  search: (
    <Svg>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.5 16.5 3 3" />
    </Svg>
  ),
  chart: (
    <Svg>
      <path d="M4 19.5h16" />
      <path d="M7 16V10M12 16V6M17 16v-3" />
    </Svg>
  ),
  timer: (
    <Svg>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v3.5l2.2 1.3M10 4h4" />
    </Svg>
  ),
  support: (
    <Svg>
      <path d="M5 12a7 7 0 0 1 14 0v4.5a2 2 0 0 1-2 2h-1.5" />
      <path d="M5 14.5V12M19 14.5V12" />
      <rect x="8.5" y="16" width="7" height="4" rx="1.5" />
    </Svg>
  ),
  users: (
    <Svg>
      <circle cx="9" cy="8.5" r="3" />
      <circle cx="16.5" cy="9.5" r="2.4" />
      <path d="M3.5 19c1.2-3 3.2-4.5 5.5-4.5s4.3 1.5 5.5 4.5" />
      <path d="M14 15.2c1.5-.4 3-.1 4.8 1.8" />
    </Svg>
  ),
  logout: (
    <Svg>
      <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" />
      <path d="M14 8.5 18.5 12 14 15.5M18.5 12H10" />
    </Svg>
  ),
  menu: (
    <Svg>
      <path d="M5 7h14M5 12h14M5 17h10" />
    </Svg>
  ),
  settings: (
    <Svg>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </Svg>
  ),
  grid: (
    <Svg>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </Svg>
  ),
  brandMark: (
    <Svg>
      <path d="M4 16.5 12 5l8 11.5H4Z" fill="currentColor" stroke="none" opacity={0.25} />
      <path d="M4 16.5 12 5l8 11.5" />
      <path d="M8.5 16.5h7" />
      <circle cx="12" cy="13.2" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  ),
  gate: (
    <Svg>
      <path d="M4 20V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v12" />
      <path d="M4 14h16M9 4v16M15 4v16" />
    </Svg>
  ),
  barrier: (
    <Svg>
      <path d="M4 19v-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8" />
      <path d="m8 11 12-4" strokeWidth="2.2" />
      <path d="M12 7.5v2M16 6v2" />
      <circle cx="7" cy="11" r="1.5" fill="currentColor" />
    </Svg>
  ),
} as const;


export function brandMarkTile(size = 40, label?: string) {
  return (
    <IconTile tone="teal" size={size} pulse label={label}>
      {Glyphs.brandMark}
    </IconTile>
  );
}

export function glassPanelSx() {
  return {
    background: `linear-gradient(155deg, ${alpha('#fff', 0.11)} 0%, ${alpha('#fff', 0.035)} 100%)`,
    backdropFilter: 'blur(22px) saturate(1.45)',
    border: `1px solid ${brand.glassBorder}`,
    boxShadow: `0 20px 44px ${alpha('#000', 0.42)}, inset 0 1px 0 ${alpha('#fff', 0.14)}`,
    borderRadius: '16px',
  } as const;
}
