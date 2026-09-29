import { useState } from 'react';
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
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import VideocamIcon from '@mui/icons-material/Videocam';
import FenceIcon from '@mui/icons-material/Fence';
import { glassPanel, glowPanel } from '../../app/theme';

export function GatesPage() {
  const theme = useTheme();

  const [gates] = useState([
    { id: 'gate-1', name: 'بوابة الشمال 1 (Gate North 01)', type: 'Entry', building: 'Building A', barrier: 'Barrier North-01', camera: 'CAM-ENT-NORTH-01', status: 'Active' },
    { id: 'gate-2', name: 'بوابة الشمال 2 (Gate North 02)', type: 'Exit', building: 'Building A', barrier: 'Barrier North-02', camera: 'CAM-EXT-NORTH-02', status: 'Active' },
    { id: 'gate-3', name: 'بوابة الجنوب 1 (Gate South 01)', type: 'Entry', building: 'Building B', barrier: 'Barrier South-01', camera: 'CAM-ENT-SOUTH-01', status: 'Active' },
    { id: 'gate-4', name: 'بوابة الجنوب 2 (Gate South 02)', type: 'Exit', building: 'Building B', barrier: 'Barrier South-02', camera: 'CAM-EXT-SOUTH-02', status: 'Active' },
    { id: 'gate-5', name: 'بوابة الشرق (Gate East 01)', type: 'BiDirectional', building: 'Building A', barrier: 'Barrier East-01', camera: 'CAM-EAST-01', status: 'Active' },
    { id: 'gate-6', name: 'بوابة كبار الشخصيات (VIP Gate)', type: 'BiDirectional', building: 'Building C', barrier: 'Barrier VIP-01', camera: 'CAM-VIP-01', status: 'Active' },
  ]);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          إدارة وتكوين بوابات المجمع (Gate Infrastructure)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          بيانات بوابات الدخول والخروج والربط المباشر بين الحواجز الإلكترونية وكاميرات LPR
        </Typography>
      </Box>

      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اسم البوابة</TableCell>
                <TableCell>النوع / الاتجاه</TableCell>
                <TableCell>المبنى التابع</TableCell>
                <TableCell>الحاجز المرتبط</TableCell>
                <TableCell>كاميرا LPR المرتبطة</TableCell>
                <TableCell>الحالة التشغيلية</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gates.map((g) => (
                <TableRow key={g.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <MeetingRoomIcon sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body2" fontWeight={800}>
                        {g.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={g.type === 'Entry' ? 'دخول (Entry)' : g.type === 'Exit' ? 'خروج (Exit)' : 'ثنائية (Bi-Directional)'}
                      size="small"
                      color={g.type === 'Entry' ? 'primary' : g.type === 'Exit' ? 'secondary' : 'info'}
                    />
                  </TableCell>
                  <TableCell>{g.building}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FenceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={700}>{g.barrier}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <VideocamIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={700}>{g.camera}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={g.status} size="small" color="success" />
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
