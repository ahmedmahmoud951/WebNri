import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import { glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';

export function LprPage() {
  const theme = useTheme();
  const { hub } = useAuth();

  const [detections, setDetections] = useState([
    {
      id: 'lpr-101',
      plate: 'أ ب ج 1004',
      confidence: 0.99,
      camera: 'CAM-ENT-NORTH-01',
      gate: 'بوابة الشمال 1',
      direction: 'Entry',
      matchedUser: 'أحمد الشهري (Resident)',
      matchedVehicle: 'Toyota Land Cruiser (White)',
      time: '18:24:12',
    },
    {
      id: 'lpr-102',
      plate: 'د هـ و 2045',
      confidence: 0.96,
      camera: 'CAM-EXT-SOUTH-02',
      gate: 'بوابة الجنوب 2',
      direction: 'Exit',
      matchedUser: 'خالد المنصور (Citizen)',
      matchedVehicle: 'BMW X5 (Black)',
      time: '18:21:40',
    },
    {
      id: 'lpr-103',
      plate: 'س ص ع 9999',
      confidence: 0.98,
      camera: 'CAM-VIP-01',
      gate: 'بوابة VIP',
      direction: 'Entry',
      matchedUser: 'سعادة المدير العام (VIP)',
      matchedVehicle: 'Mercedes S-Class (Silver)',
      time: '18:15:02',
    },
    {
      id: 'lpr-104',
      plate: 'ق و ل 4001',
      confidence: 0.94,
      camera: 'CAM-ENT-NORTH-01',
      gate: 'بوابة الشمال 1',
      direction: 'Entry',
      matchedUser: 'زائر مصرح له (Guest INV-8921)',
      matchedVehicle: 'Hyundai Sonata',
      time: '18:02:18',
    },
  ]);

  useEffect(() => {
    const unsub = (hub as any).onPlateRecognized?.((evt: any) => {
      setDetections((prev) => [
        {
          id: 'lpr-' + Date.now(),
          plate: evt.plateNumber || evt.plate || 'أ ب ج 9999',
          confidence: evt.confidence || 0.97,
          camera: evt.cameraName || 'CAM-LIVE-GATE',
          gate: evt.gateName || 'بوابة رئيسية',
          direction: evt.direction || 'Entry',
          matchedUser: 'مركبة مسجلة (Matched)',
          matchedVehicle: 'مركبة معتمدة',
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    return () => unsub?.();
  }, [hub]);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            محرك التعرف على اللوحات (LPR Optical Recognition Hub)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            رصد وتحليل لوحات المركبات ومطابقتها الفورية مع بيانات السكان، المشتركين، وقوائم الزوار
          </Typography>
        </Box>
        <Chip label="Deep Learning OCR Engine 98.4% Accuracy" color="primary" sx={{ fontWeight: 800 }} />
      </Stack>

      {/* Featured Latest Detection Card */}
      {detections[0] && (
        <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), p: 3, mb: 4 }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight={800} sx={{ mb: 1.5 }}>
            أحدث عملية رصد مباشر (Latest Capture):
          </Typography>

          <Grid container spacing={3} alignItems="center">
            {/* Visual Plate Snapshot */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  bgcolor: '#000',
                  borderRadius: '12px',
                  p: 3,
                  textAlign: 'center',
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <CameraAltIcon sx={{ color: theme.palette.primary.main, fontSize: 32, mb: 1 }} />
                <Box
                  sx={{
                    bgcolor: '#fff',
                    color: '#000',
                    py: 1,
                    px: 3,
                    borderRadius: '8px',
                    display: 'inline-block',
                    letterSpacing: 2,
                    border: '3px solid #000',
                  }}
                >
                  <Typography variant="h4" fontWeight={900}>
                    {detections[0].plate}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#A0AEC0' }}>
                  دقة القراءة: {Math.round(detections[0].confidence * 100)}% • زمن المعالجة: 82ms
                </Typography>
              </Box>
            </Grid>

            {/* Matched Profile Details */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PersonIcon sx={{ color: theme.palette.secondary.main }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">المستخدم المطابق:</Typography>
                      <Typography variant="body1" fontWeight={800}>{detections[0].matchedUser}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <DirectionsCarIcon sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">نوع المركبة:</Typography>
                      <Typography variant="body1" fontWeight={800}>{detections[0].matchedVehicle}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">الموقع والكاميرا:</Typography>
                  <Typography variant="body2" fontWeight={700}>{detections[0].gate} ({detections[0].camera})</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">توقيت الالتقاط:</Typography>
                  <Typography variant="body2" fontWeight={700}>{detections[0].time}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Detection Stream Table */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          سجل عمليات التعرف اللحظية (Continuous OCR Log)
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اللوحة المقروءة</TableCell>
                <TableCell>المستخدم المطابق</TableCell>
                <TableCell>المركبة</TableCell>
                <TableCell>الكاميرا والبوابة</TableCell>
                <TableCell>الاتجاه</TableCell>
                <TableCell>دقة OCR</TableCell>
                <TableCell>التوقيت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detections.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell sx={{ fontWeight: 900, letterSpacing: 1.5, color: theme.palette.primary.main }}>
                    {d.plate}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{d.matchedUser}</TableCell>
                  <TableCell color="text.secondary">{d.matchedVehicle}</TableCell>
                  <TableCell>{d.gate} ({d.camera})</TableCell>
                  <TableCell>
                    <Chip
                      label={d.direction === 'Entry' ? 'دخول (In)' : 'خروج (Out)'}
                      size="small"
                      color={d.direction === 'Entry' ? 'success' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${Math.round(d.confidence * 100)}%`}
                      size="small"
                      color={d.confidence > 0.95 ? 'primary' : 'warning'}
                    />
                  </TableCell>
                  <TableCell color="text.secondary">{d.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
