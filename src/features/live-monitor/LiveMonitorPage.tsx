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
  Button,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { smartParkingApi, type LiveOperations } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';

export function LiveMonitorPage() {
  const theme = useTheme();
  const { hub } = useAuth();
  const [events, setEvents] = useState<LiveOperations['lprEvents']>([]);
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    // Load initial
    smartParkingApi.getLiveOperations().then((ops) => {
      if (ops?.lprEvents) setEvents(ops.lprEvents);
      if (ops?.cameraStates) setCameras(ops.cameraStates);
    }).catch(() => {
      // Demo defaults
      setEvents([
        { id: '1', plateNumber: 'أ ب ج 1001', cameraName: 'LPR-NORTH-01', direction: 'Entry', confidence: 0.98, eventTime: 'الآن', gateName: 'بوابة الشمال' },
        { id: '2', plateNumber: 'د هـ و 2045', cameraName: 'LPR-SOUTH-02', direction: 'Exit', confidence: 0.96, eventTime: 'منذ دقيقة', gateName: 'بوابة الجنوب' },
        { id: '3', plateNumber: 'س ص ع 3333', cameraName: 'LPR-EAST-01', direction: 'Entry', confidence: 0.99, eventTime: 'منذ 3 دقائق', gateName: 'بوابة الشرق' },
      ]);
      setCameras([
        { id: '1', name: 'LPR-NORTH-01', status: 'Online', ip: '192.168.1.101', fps: 30 },
        { id: '2', name: 'LPR-SOUTH-02', status: 'Online', ip: '192.168.1.102', fps: 30 },
        { id: '3', name: 'LPR-EAST-01', status: 'Online', ip: '192.168.1.103', fps: 28 },
        { id: '4', name: 'LPR-VIP-01', status: 'Online', ip: '192.168.1.104', fps: 30 },
      ]);
    });

    const unsub = (hub as any).onPlateRecognized?.((evt: any) => {
      setEvents((prev) => [
        {
          id: Math.random().toString(),
          plateNumber: evt.plateNumber || evt.plate || '---',
          cameraName: evt.cameraName || 'LPR-FEED',
          direction: evt.direction || 'Entry',
          confidence: evt.confidence || 0.97,
          eventTime: 'الآن',
          gateName: evt.gateName || 'Gate',
        },
        ...prev.slice(0, 24),
      ]);
    });

    return () => unsub?.();
  }, [hub]);

  return (
    <Box sx={{ pb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            شاشة المراقبة اللحظية (Live LPR Monitor)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            بث لحظي لقراءات الكاميرات والتعرف التلقائي على لوحات المركبات عبر تقنية SignalR
          </Typography>
        </Box>
        <Chip
          icon={<VideocamIcon />}
          label="Live Stream Active"
          color="error"
          sx={{ fontWeight: 800, animation: 'pulse 1.5s infinite' }}
        />
      </Stack>

      {/* Grid of Simulated Live Camera Feeds */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { name: 'بوابة الشمال 1 (Entry)', cam: 'CAM-01-LPR', status: 'LIVE', plate: events[0]?.plateNumber || 'أ ب ج 1001' },
          { name: 'بوابة الجنوب 2 (Exit)', cam: 'CAM-02-LPR', status: 'LIVE', plate: events[1]?.plateNumber || 'د هـ و 2045' },
          { name: 'بوابة الشرق 3 (Entry)', cam: 'CAM-03-LPR', status: 'LIVE', plate: events[2]?.plateNumber || 'س ص ع 3333' },
          { name: 'بوابة VIP كبار الشخصيات', cam: 'CAM-04-VIP', status: 'LIVE', plate: 'ر س م 7777' },
        ].map((feed, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), overflow: 'hidden' }}>
              <Box
                sx={{
                  height: 160,
                  bgcolor: '#000',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.25)} 0%, #050810 100%)`,
                }}
              >
                <CameraAltIcon sx={{ fontSize: 48, color: alpha('#fff', 0.25) }} />

                {/* Overlaid OCR Bounding Box simulation */}
                <Box
                  sx={{
                    position: 'absolute',
                    border: `2px dashed ${theme.palette.primary.main}`,
                    borderRadius: '6px',
                    px: 1.5,
                    py: 0.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Typography variant="body2" fontWeight={800} sx={{ letterSpacing: 2, color: '#fff' }}>
                    {feed.plate}
                  </Typography>
                </Box>

                {/* Live Badge */}
                <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
                  <Chip label="REC • LIVE" size="small" color="error" sx={{ fontWeight: 800, height: 22 }} />
                </Box>

                <Box sx={{ position: 'absolute', bottom: 8, right: 10 }}>
                  <Typography variant="caption" sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.6)', px: 1, py: 0.25, borderRadius: 1 }}>
                    30 FPS • 1080p
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 1.75 }}>
                <Typography variant="subtitle2" fontWeight={800}>
                  {feed.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {feed.cam} • OCR Engine v4.2
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Live Table of Events */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          سجل الرصد الحي المستمر (Incoming LPR Stream)
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اللوحة المرصودة (Plate)</TableCell>
                <TableCell>اسم الكاميرا</TableCell>
                <TableCell>البوابة</TableCell>
                <TableCell>الاتجاه</TableCell>
                <TableCell>نسبة الثقة (Confidence)</TableCell>
                <TableCell>التوقيت</TableCell>
                <TableCell>الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((evt) => (
                <TableRow key={evt.id} hover sx={{ '&:first-of-type': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        border: `1.5px solid ${theme.palette.primary.main}`,
                        borderRadius: '6px',
                        px: 1.5,
                        py: 0.5,
                        fontWeight: 800,
                        letterSpacing: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      }}
                    >
                      {evt.plateNumber}
                    </Box>
                  </TableCell>
                  <TableCell>{evt.cameraName}</TableCell>
                  <TableCell>{evt.gateName || 'بوابة رئيسية'}</TableCell>
                  <TableCell>
                    <Chip
                      label={evt.direction === 'Entry' || evt.direction === 'In' ? 'دخول (Entry)' : 'خروج (Exit)'}
                      size="small"
                      color={evt.direction === 'Entry' || evt.direction === 'In' ? 'success' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${Math.round(evt.confidence * 100)}%`}
                      size="small"
                      color={evt.confidence > 0.9 ? 'primary' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{evt.eventTime}</TableCell>
                  <TableCell>
                    <Chip label="تمت المطابقة" size="small" variant="outlined" color="success" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
