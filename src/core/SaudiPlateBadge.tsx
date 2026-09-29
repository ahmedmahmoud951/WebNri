import React from 'react';
import { Box, Typography } from '@mui/material';

interface SaudiPlateBadgeProps {
  plateNumber: string;
  size?: 'small' | 'medium' | 'large';
  showShadow?: boolean;
}

export const SaudiPlateBadge: React.FC<SaudiPlateBadgeProps> = ({
  plateNumber,
  size = 'medium',
  showShadow = true,
}) => {
  const clean = (plateNumber || 'أ ب ج 1004').trim();
  const parts = clean.split(/\s+/);
  const digits = parts.find((p) => /^[0-9]+$/.test(p)) || clean.replace(/[^0-9]/g, '') || '1004';
  const letters =
    parts.filter((p) => !/^[0-9]+$/.test(p)).join(' ') ||
    clean.replace(/[0-9]/g, '').trim() ||
    'أ ب ج';

  const heights = {
    small: 26,
    medium: 34,
    large: 44,
  };

  const fontSizes = {
    small: { num: 12, letters: 12, ksa: 7, flag: 9 },
    medium: { num: 15, letters: 15, ksa: 9, flag: 11 },
    large: { num: 20, letters: 20, ksa: 11, flag: 14 },
  };

  const currentHeight = heights[size];
  const fs = fontSizes[size];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: currentHeight,
        bgcolor: '#FFFFFF',
        color: '#0F172A',
        border: '1.75px solid #1E293B',
        borderRadius: size === 'small' ? '5px' : '7px',
        overflow: 'hidden',
        boxShadow: showShadow ? '0 3px 10px rgba(0, 0, 0, 0.28)' : 'none',
        direction: 'ltr',
        userSelect: 'none',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: showShadow ? '0 5px 14px rgba(0, 0, 0, 0.38)' : 'none',
        },
      }}
    >
      {/* Saudi Emblem & KSA Green Strip */}
      <Box
        sx={{
          bgcolor: '#047857',
          color: '#FFFFFF',
          height: '100%',
          px: size === 'small' ? 0.7 : size === 'large' ? 1.2 : 0.9,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1.5px solid #065F46',
        }}
      >
        <Typography
          sx={{
            fontSize: fs.ksa,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: 0.5,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          KSA
        </Typography>
        <Typography
          sx={{
            fontSize: fs.flag,
            lineHeight: 1,
            mt: 0.2,
          }}
        >
          🇸🇦
        </Typography>
      </Box>

      {/* Plate Digits Block */}
      <Box
        sx={{
          height: '100%',
          px: size === 'small' ? 1 : size === 'large' ? 1.6 : 1.3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFFFFF',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"SF Pro Display", "Roboto Mono", monospace',
            fontWeight: 900,
            fontSize: fs.num,
            letterSpacing: 1.5,
            color: '#0F172A',
          }}
        >
          {digits}
        </Typography>
      </Box>

      {/* Inner Dividing Pin */}
      <Box
        sx={{
          width: '1.5px',
          height: '75%',
          bgcolor: '#CBD5E1',
          mx: 0.25,
        }}
      />

      {/* Saudi Arabic Letters Block */}
      <Box
        sx={{
          height: '100%',
          px: size === 'small' ? 1 : size === 'large' ? 1.6 : 1.3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFFFFF',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Cairo", "Tajawal", "Noto Sans Arabic", sans-serif',
            fontWeight: 900,
            fontSize: fs.letters,
            letterSpacing: 3,
            color: '#0F172A',
            direction: 'rtl',
          }}
        >
          {letters}
        </Typography>
      </Box>
    </Box>
  );
};
