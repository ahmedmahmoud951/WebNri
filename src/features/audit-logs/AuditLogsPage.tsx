import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Chip,
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
import HistoryIcon from '@mui/icons-material/History';
import { smartParkingApi } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function AuditLogsPage() {
  const theme = useTheme();

  const [logs, setLogs] = useState([
    { id: '1', user: 'admin', action: 'BARRIER_OPEN', entity: 'BarrierDefinition', entityId: '33333333-3333-3333-2222-000000000001', timestamp: '2026-09-29 18:24:10', ip: '192.168.1.50', result: 'Success' },
    { id: '2', user: 'system', action: 'LPR_DETECTED', entity: 'LprEventRecord', entityId: '55555555-5555-5555-2222-000000000018', timestamp: '2026-09-29 18:24:08', ip: '192.168.10.101', result: 'Success' },
    { id: '3', user: 'citizen1', action: 'PAYMENT_CAPTURE', entity: 'ParkingSessionRecord', entityId: '77777777-7777-7777-2222-000000000042', timestamp: '2026-09-29 18:22:15', ip: '172.20.14.88', result: 'Success' },
    { id: '4', user: 'security', action: 'ALARM_ACKNOWLEDGE', entity: 'SecurityAlarm', entityId: '88888888-8888-8888-2222-000000000002', timestamp: '2026-09-29 18:15:30', ip: '192.168.1.62', result: 'Success' },
    { id: '5', user: 'operator', action: 'CAMERA_ONLINE', entity: 'CameraDefinition', entityId: '44444444-4444-4444-2222-000000000004', timestamp: '2026-09-29 17:55:00', ip: '192.168.1.55', result: 'Success' },
    { id: '6', user: 'resident', action: 'RESERVATION_CREATE', entity: 'ReservationRecord', entityId: '99999999-9999-9999-2222-000000000010', timestamp: '2026-09-29 17:12:44', ip: '172.20.18.90', result: 'Success' },
  ]);

  useEffect(() => {
    smartParkingApi.getAuditLogs().then((res) => {
      if (res && res.length > 0) setLogs(res);
    }).catch(() => {});
  }, []);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          سجل التدقيق والمراجعة الأمني (Audit Logs)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          سجل غير قابل للتعديل يوثق جميع العمليات الميدانية والإدارية مع معرفات الكيانات GUID وعناوين IP
        </Typography>
      </Box>

      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المستخدم</TableCell>
                <TableCell>العملية (Action)</TableCell>
                <TableCell>الكيان (Entity)</TableCell>
                <TableCell>معرف الكيان (GUID)</TableCell>
                <TableCell>التوقيت</TableCell>
                <TableCell>عنوان IP</TableCell>
                <TableCell>النتيجة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{log.user}</TableCell>
                  <TableCell>
                    <Chip label={log.action} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell dir="ltr" sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                    {log.entityId}
                  </TableCell>
                  <TableCell color="text.secondary">{log.timestamp}</TableCell>
                  <TableCell dir="ltr">{log.ip}</TableCell>
                  <TableCell>
                    <Chip label={log.result} size="small" color={log.result === 'Success' ? 'success' : 'error'} />
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
