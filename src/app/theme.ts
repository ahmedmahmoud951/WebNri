import { createContext, useContext } from 'react';
import { createTheme, alpha, type PaletteMode } from '@mui/material/styles';

export type AppThemeMode = 'dark' | 'light';

export interface ThemeModeContextValue {
  mode: AppThemeMode;
  toggleMode: () => void;
  setMode: (mode: AppThemeMode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'dark',
  toggleMode: () => {},
  setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

/** Dark glass — midnight base + neon teal + amber accents */
const voidBgDark = '#050810';
const inkDark = '#E8EEF7';
const mutedDark = '#8B9BB4';
const teal = '#2DD4BF';
const tealDeep = '#0D9488';
const amber = '#FBBF24';
const coral = '#FB7185';
const violet = '#A78BFA';
const glassBorderDark = 'rgba(255, 255, 255, 0.1)';

/** Light theme tokens — Frosted Crystal Glass with Sky Blue & Pearl Hue */
const voidBgLight = '#EEF4F8';
const inkLight = '#0F172A';
const mutedLight = '#475569';
const glassBorderLight = 'rgba(56, 189, 248, 0.28)';

export const brand = {
  voidBg: voidBgDark,
  ink: inkDark,
  muted: mutedDark,
  teal,
  tealDeep,
  amber,
  coral,
  violet,
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: glassBorderDark,
  glassStrong: 'rgba(255, 255, 255, 0.09)',
  glow: 'rgba(45, 212, 191, 0.35)',
  amberGlow: 'rgba(251, 191, 36, 0.28)',
  coralGlow: 'rgba(251, 113, 133, 0.25)',
} as const;

export function glassPanel(extra?: Record<string, unknown>, mode: PaletteMode = 'dark') {
  const isDark = mode === 'dark';
  return {
    background: isDark
      ? `linear-gradient(155deg, ${alpha('#fff', 0.11)} 0%, ${alpha('#fff', 0.035)} 55%, ${alpha(teal, 0.04)} 100%)`
      : `linear-gradient(155deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 249, 255, 0.78) 50%, rgba(224, 242, 254, 0.62) 100%)`,
    backdropFilter: 'blur(22px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
    border: `1px solid ${isDark ? glassBorderDark : glassBorderLight}`,
    boxShadow: isDark
      ? `0 0 0 1px ${alpha('#fff', 0.04)}, 0 20px 44px ${alpha('#000', 0.42)}, inset 0 1px 0 ${alpha('#fff', 0.14)}`
      : `0 12px 34px rgba(14, 165, 233, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.95)`,
    borderRadius: '16px',
    ...extra,
  } as const;
}

export function glowPanel(color: string = teal, extra?: Record<string, unknown>, mode: PaletteMode = 'dark') {
  const isDark = mode === 'dark';
  return glassPanel(
    {
      border: `1px solid ${alpha(color, isDark ? 0.42 : 0.45)}`,
      boxShadow: isDark
        ? `0 0 0 1px ${alpha(color, 0.18)}, 0 0 34px ${alpha(color, 0.16)}, 0 22px 48px ${alpha('#000', 0.42)}, inset 0 1px 0 ${alpha('#fff', 0.14)}`
        : `0 14px 40px ${alpha(color, 0.2)}, 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.95)`,
      background: isDark
        ? `linear-gradient(155deg, ${alpha('#fff', 0.12)} 0%, ${alpha('#fff', 0.03)} 50%, ${alpha(color, 0.06)} 100%)`
        : `linear-gradient(155deg, rgba(255, 255, 255, 0.92) 0%, ${alpha(color, 0.12)} 50%, rgba(240, 249, 255, 0.82) 100%)`,
      ...extra,
    },
    mode,
  );
}

export function createAppTheme(direction: 'ltr' | 'rtl', mode: AppThemeMode = 'dark') {
  const isDark = mode === 'dark';
  const bgDefault = isDark ? voidBgDark : voidBgLight;
  const bgPaper = isDark ? alpha('#0F172A', 0.72) : 'rgba(255, 255, 255, 0.82)';
  const textPrimary = isDark ? inkDark : inkLight;
  const textSecondary = isDark ? mutedDark : mutedLight;
  const borderColor = isDark ? glassBorderDark : glassBorderLight;

  return createTheme({
    direction,
    spacing: 8,
    palette: {
      mode,
      primary: { main: isDark ? teal : tealDeep, dark: tealDeep, light: '#5EEAD4', contrastText: '#041018' },
      secondary: { main: amber, dark: '#D97706', light: '#FDE68A', contrastText: '#041018' },
      success: { main: '#34D399' },
      error: { main: coral },
      warning: { main: amber },
      info: { main: '#60A5FA' },
      background: { default: bgDefault, paper: bgPaper },
      text: { primary: textPrimary, secondary: textSecondary },
      divider: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: ['Cairo', 'Sora', 'Tahoma', 'sans-serif'].join(','),
      h3: { fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '2.1rem' },
      h4: { fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.75rem' },
      h5: { fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 700, fontSize: '1.28rem' },
      h6: { fontFamily: 'Sora, Cairo, sans-serif', fontWeight: 650, fontSize: '1.05rem' },
      subtitle1: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
      overline: { fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.68rem', color: textSecondary },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: bgDefault,
            backgroundImage: isDark
              ? `
              radial-gradient(ellipse 900px 600px at 15% -5%, ${alpha(teal, 0.22)}, transparent 55%),
              radial-gradient(ellipse 700px 500px at 85% 5%, ${alpha(violet, 0.16)}, transparent 50%),
              radial-gradient(ellipse 600px 400px at 50% 100%, ${alpha(amber, 0.08)}, transparent 45%),
              linear-gradient(180deg, ${alpha('#0F172A', 0.4)} 0%, ${voidBgDark} 100%)
            `
              : `
              radial-gradient(ellipse 900px 600px at 15% -5%, ${alpha(teal, 0.08)}, transparent 55%),
              radial-gradient(ellipse 700px 500px at 85% 5%, ${alpha(amber, 0.06)}, transparent 50%),
              linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)
            `,
            backgroundAttachment: 'fixed',
          },
          '::selection': {
            background: alpha(teal, 0.35),
            color: '#fff',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: '12px',
            paddingInline: 20,
            paddingBlock: 10,
            minHeight: 44,
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${tealDeep}, ${teal})`,
            color: '#041018',
            boxShadow: `0 12px 32px ${brand.glow}`,
            '&:hover': { boxShadow: `0 16px 40px ${alpha(teal, 0.45)}` },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, #D97706, ${amber})`,
            color: '#041018',
            boxShadow: `0 12px 32px ${brand.amberGlow}`,
          },
          outlined: {
            borderColor,
            borderWidth: 1.5,
            '&:hover': { borderWidth: 1.5, borderColor: alpha(teal, 0.5), bgcolor: alpha(teal, 0.08) },
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            ...glassPanel({}, mode),
            transition: 'transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: bgPaper,
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
          },
          outlined: { borderColor },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? alpha('#050810', 0.65) : alpha('#FFFFFF', 0.85),
            backdropFilter: 'blur(24px) saturate(1.5)',
            color: textPrimary,
            borderBottom: `1px solid ${borderColor}`,
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark ? alpha('#050810', 0.82) : alpha('#FFFFFF', 0.95),
            backdropFilter: 'blur(28px) saturate(1.6)',
            borderColor,
            borderRadius: 0,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            marginInline: 10,
            marginBlock: 3,
            minHeight: 48,
            transition: 'background 200ms ease, transform 200ms ease, box-shadow 200ms ease',
            '&.Mui-selected': {
              background: `linear-gradient(135deg, ${alpha(teal, 0.18)}, ${alpha(teal, 0.06)})`,
              color: isDark ? teal : tealDeep,
              boxShadow: `inset 3px 0 0 ${teal}, 0 8px 24px ${alpha(teal, 0.12)}`,
              '& .MuiListItemIcon-root': { color: isDark ? teal : tealDeep },
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(teal, 0.22)}, ${alpha(teal, 0.08)})`,
              },
            },
            '&:hover': {
              background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              transform: direction === 'rtl' ? 'translateX(2px)' : 'translateX(-2px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 700, borderRadius: '999px' },
          outlined: { borderColor: alpha(teal, 0.4), color: isDark ? teal : tealDeep },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'medium' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.02),
              '& fieldset': { borderColor },
              '&:hover fieldset': { borderColor: alpha(teal, 0.35) },
              '&.Mui-focused fieldset': { borderColor: teal },
            },
            '& .MuiInputLabel-root': { color: textSecondary },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { ...glassPanel({ borderRadius: '12px' }, mode) },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            border: `1px solid ${borderColor}`,
            background: isDark ? alpha('#000', 0.18) : '#FFFFFF',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
            paddingTop: 14,
            paddingBottom: 14,
          },
          head: {
            fontWeight: 700,
            color: textSecondary,
            backgroundColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
            whiteSpace: 'nowrap',
          },
          body: {
            verticalAlign: 'middle',
          },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: { background: 'transparent', color: textSecondary },
        },
      },
    },
  });
}
