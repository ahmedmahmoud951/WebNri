import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VideocamIcon from '@mui/icons-material/Videocam';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Map of Arabic letters to Latin letters according to standard Saudi plate transliteration
const ARABIC_TO_LATIN: Record<string, string> = {
  'أ': 'A', 'ا': 'A',
  'ب': 'B',
  'ح': 'J',
  'د': 'D',
  'ر': 'R',
  'س': 'S',
  'ص': 'X',
  'ط': 'T',
  'ع': 'E',
  'ق': 'G',
  'ك': 'K',
  'ل': 'L',
  'م': 'Z',
  'ن': 'N',
  'هـ': 'H', 'ه': 'H',
  'و': 'U',
  'ى': 'V', 'ي': 'V',
};

// Map of Western digits to Eastern Arabic numerals
const DIGIT_TO_ARABIC: Record<string, string> = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

export interface SaudiRealisticPlateProps {
  plateNumber: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBolts?: boolean;
  interactive?: boolean;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  gateName?: string;
  captureTime?: string;
  snapshotUrl?: string;
}

export const SaudiRealisticPlate: React.FC<SaudiRealisticPlateProps> = ({
  plateNumber,
  size = 'md',
  showBolts = true,
  interactive = true,
  vehicleMake,
  vehicleModel,
  vehicleColor,
  gateName,
  captureTime,
  snapshotUrl,
}) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);

  // Parse plate number (e.g. "أ ب ج 1004" or "1004 أ ب ج")
  const raw = (plateNumber || 'أ ب ج 1004').trim();
  const parts = raw.split(/\s+/);
  const digitsMatch = raw.match(/\d+/) || ['1004'];
  const latinDigits = digitsMatch[0].slice(0, 4);
  const arabicDigits = latinDigits
    .split('')
    .map((ch) => DIGIT_TO_ARABIC[ch] || ch)
    .join('');

  const letterParts = parts.filter((p) => !/^\d+$/.test(p));
  const arabicLetters = letterParts.length > 0 ? letterParts.join(' ') : 'أ ب ج';
  const cleanArabicLetters = arabicLetters.replace(/\s+/g, '');
  
  // Convert letters to Latin equivalent
  const latinLetters = cleanArabicLetters
    .split('')
    .map((char) => ARABIC_TO_LATIN[char] || char)
    .join(' ');

  // Sizing definitions
  const dimensions = {
    sm: { width: 140, height: 42, boltSize: 5, fsArabicDigits: 11, fsLatinDigits: 10, fsArabicLetters: 12, fsLatinLetters: 9, ksaFs: 7 },
    md: { width: 185, height: 54, boltSize: 6, fsArabicDigits: 14, fsLatinDigits: 12, fsArabicLetters: 15, fsLatinLetters: 11, ksaFs: 8 },
    lg: { width: 230, height: 68, boltSize: 8, fsArabicDigits: 18, fsLatinDigits: 15, fsArabicLetters: 19, fsLatinLetters: 13, ksaFs: 9 },
    hero: { width: 300, height: 90, boltSize: 10, fsArabicDigits: 23, fsLatinDigits: 19, fsArabicLetters: 24, fsLatinLetters: 16, ksaFs: 11 },
  }[size];

  return (
    <>
      <Box
        component={interactive ? 'button' : 'div'}
        onClick={interactive ? () => setModalOpen(true) : undefined}
        title={interactive ? 'انقر لعرض لقطة كاميرا الرصد عالية الدقة' : undefined}
        sx={{
          all: 'unset',
          cursor: interactive ? 'pointer' : 'default',
          display: 'inline-flex',
          position: 'relative',
          width: dimensions.width,
          height: dimensions.height,
          boxSizing: 'border-box',
          bgcolor: '#FFFFFF',
          borderRadius: size === 'sm' ? '6px' : '9px',
          border: '2.5px solid #0F172A',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(0,0,0,0.2)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 55%, #EDF2F7 100%)',
          userSelect: 'none',
          overflow: 'hidden',
          transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          direction: 'ltr',
          '&:hover': interactive
            ? {
                transform: 'translateY(-2px) scale(1.025)',
                boxShadow: '0 8px 24px rgba(0, 240, 255, 0.35), 0 2px 6px rgba(0,0,0,0.4)',
                borderColor: '#00F0FF',
              }
            : undefined,
        }}
      >
        {/* Subtle metallic reflection shimmer */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '42%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Chrome bolts in corners */}
        {showBolts && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 3,
                left: 4,
                width: dimensions.boltSize,
                height: dimensions.boltSize,
                borderRadius: '50%',
                bgcolor: '#94A3B8',
                border: '1px solid #475569',
                boxShadow: 'inset 0 1px 1px #fff, 0 1px 1px rgba(0,0,0,0.4)',
                zIndex: 2,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 3,
                right: 4,
                width: dimensions.boltSize,
                height: dimensions.boltSize,
                borderRadius: '50%',
                bgcolor: '#94A3B8',
                border: '1px solid #475569',
                boxShadow: 'inset 0 1px 1px #fff, 0 1px 1px rgba(0,0,0,0.4)',
                zIndex: 2,
              }}
            />
          </>
        )}

        {/* SECTION 1: KSA Official Emblem Strip (Right or Left side) */}
        <Box
          sx={{
            width: size === 'sm' ? 26 : size === 'hero' ? 44 : 34,
            height: '100%',
            bgcolor: '#047857',
            background: 'linear-gradient(180deg, #059669 0%, #047857 60%, #064E3B 100%)',
            borderRight: '2px solid #064E3B',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            px: 0.5,
            flexShrink: 0,
            boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.3)',
          }}
        >
          {/* Saudi Palm & Swords Emblem icon */}
          <Typography
            sx={{
              fontSize: dimensions.ksaFs + 2,
              lineHeight: 1,
              mb: 0.3,
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
            }}
          >
            🇸🇦
          </Typography>
          <Typography
            sx={{
              fontSize: dimensions.ksaFs,
              fontWeight: 900,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: 0.8,
              lineHeight: 1,
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            KSA
          </Typography>
        </Box>

        {/* SECTION 2: Plate Number Digits (Top: Arabic, Bottom: Latin) */}
        <Box
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            px: 0.5,
            borderRight: '1.5px solid #CBD5E1',
          }}
        >
          {/* Arabic numerals (top) */}
          <Typography
            sx={{
              fontFamily: '"Cairo", "Tajawal", "Noto Sans Arabic", sans-serif',
              fontWeight: 900,
              fontSize: dimensions.fsArabicDigits,
              color: '#0F172A',
              letterSpacing: size === 'sm' ? 1.5 : 3,
              lineHeight: 1.1,
              textShadow: '0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            {arabicDigits}
          </Typography>
          {/* Western numerals (bottom) */}
          <Typography
            sx={{
              fontFamily: '"SF Pro Display", "Roboto Mono", monospace',
              fontWeight: 900,
              fontSize: dimensions.fsLatinDigits,
              color: '#1E293B',
              letterSpacing: size === 'sm' ? 1.5 : 2.5,
              lineHeight: 1.1,
            }}
          >
            {latinDigits}
          </Typography>
        </Box>

        {/* SECTION 3: Plate Letters (Top: Arabic, Bottom: Latin) */}
        <Box
          sx={{
            flex: 1.2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            px: 0.5,
          }}
        >
          {/* Arabic Letters (top) */}
          <Typography
            sx={{
              fontFamily: '"Cairo", "Tajawal", "Noto Sans Arabic", sans-serif',
              fontWeight: 900,
              fontSize: dimensions.fsArabicLetters,
              color: '#0F172A',
              letterSpacing: size === 'sm' ? 2 : 4,
              lineHeight: 1.1,
              direction: 'rtl',
              textShadow: '0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            {arabicLetters}
          </Typography>
          {/* Latin Letters (bottom) */}
          <Typography
            sx={{
              fontFamily: '"SF Pro Display", "Roboto Mono", monospace',
              fontWeight: 900,
              fontSize: dimensions.fsLatinLetters,
              color: '#1E293B',
              letterSpacing: size === 'sm' ? 2 : 3.5,
              lineHeight: 1.1,
              textTransform: 'uppercase',
            }}
          >
            {latinLetters}
          </Typography>
        </Box>
      </Box>

      {/* High-Resolution LPR Camera Capture Snapshot Modal */}
      {interactive && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#0B1220',
              backgroundImage: 'radial-gradient(ellipse at top, rgba(0, 240, 255, 0.12), transparent 70%)',
              border: '1.5px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 240, 255, 0.25)',
              overflow: 'hidden',
              color: '#F8FAFC',
            },
          }}
        >
          <Box
            sx={{
              p: 2.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: 'rgba(0, 240, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00F0FF',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                }}
              >
                <VideocamIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#F8FAFC', fontSize: 16 }}>
                  لقطة كاميرا الرصد البصري الذكية (LPR Snapshot)
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  {gateName || 'البوابة الشمالية 1'} • {captureTime || 'التقاط فوري'}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={() => setModalOpen(false)} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 3 }}>
            {/* Camera Viewport Simulation Frame */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1.5px solid rgba(0, 240, 255, 0.35)',
                bgcolor: '#050810',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.85)',
              }}
            >
              {/* Background realistic vehicle / camera snapshot or generated cyber frame */}
              {snapshotUrl ? (
                <Box
                  component="img"
                  src={snapshotUrl}
                  alt={raw}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background:
                      'radial-gradient(circle at center, rgba(15, 23, 42, 0.9) 0%, rgba(5, 8, 16, 0.98) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    position: 'relative',
                  }}
                >
                  {/* High-tech HUD grid lines */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Vehicle icon / graphic silhouette */}
                  <DirectionsCarIcon sx={{ fontSize: 72, color: 'rgba(56, 189, 248, 0.35)', mb: 1.5 }} />

                  {/* Render the hero sized plate right in the HUD target */}
                  <Box
                    sx={{
                      p: 1,
                      border: '2px dashed #00F0FF',
                      borderRadius: '12px',
                      bgcolor: 'rgba(0, 240, 255, 0.08)',
                      boxShadow: '0 0 25px rgba(0, 240, 255, 0.3)',
                    }}
                  >
                    <SaudiRealisticPlate
                      plateNumber={raw}
                      size="lg"
                      showBolts={true}
                      interactive={false}
                    />
                  </Box>

                  {/* HUD Corner Targets */}
                  <Box sx={{ position: 'absolute', top: 12, left: 12, width: 16, height: 16, borderTop: '2px solid #00F0FF', borderLeft: '2px solid #00F0FF' }} />
                  <Box sx={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, borderTop: '2px solid #00F0FF', borderRight: '2px solid #00F0FF' }} />
                  <Box sx={{ position: 'absolute', bottom: 12, left: 12, width: 16, height: 16, borderBottom: '2px solid #00F0FF', borderLeft: '2px solid #00F0FF' }} />
                  <Box sx={{ position: 'absolute', bottom: 12, right: 12, width: 16, height: 16, borderBottom: '2px solid #00F0FF', borderRight: '2px solid #00F0FF' }} />
                </Box>
              )}

              {/* Camera Overlays */}
              <Box sx={{ position: 'absolute', top: 10, left: 12 }}>
                <Chip
                  label="REC • 4K UHD 60FPS"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.25)',
                    color: '#EF4444',
                    border: '1px solid #EF4444',
                    fontWeight: 800,
                    fontSize: 10,
                  }}
                />
              </Box>

              <Box sx={{ position: 'absolute', bottom: 10, right: 12 }}>
                <Typography sx={{ fontSize: 11, color: '#00F0FF', fontFamily: 'monospace', fontWeight: 700 }}>
                  LPR_OPTICAL_AI // VERIFIED
                </Typography>
              </Box>
            </Box>

            {/* Vehicle & Verification Details Bar */}
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: '12px',
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                    طراز المركبة المصرحة
                  </Typography>
                  <Typography variant="body1" fontWeight={800} sx={{ color: '#F8FAFC' }}>
                    {vehicleMake || 'تويوتا'} {vehicleModel || 'لاند كروزر VXR'} • {vehicleColor || 'أبيض لؤلؤي'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: '#10B981 !important' }} />}
                    label="لوحة سعودية نظامية معتمدة"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label="عبور مصرح به"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(0, 240, 255, 0.15)',
                      color: '#00F0FF',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              </Stack>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
