import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { smartParkingApi } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function UsersPage() {
  const theme = useTheme();

  const [users, setUsers] = useState([
    { id: 'u1', username: 'admin', displayName: 'مدير المنظومة (Admin)', role: 'Admin', email: 'admin@parking.local', status: 'Active', createdAt: '2026-01-01' },
    { id: 'u2', username: 'operator', displayName: 'مشغل العمليات (Operator)', role: 'Operator', email: 'operator@parking.local', status: 'Active', createdAt: '2026-01-15' },
    { id: 'u3', username: 'security', displayName: 'ضابط أمن الموقف (Security)', role: 'Security', email: 'security@parking.local', status: 'Active', createdAt: '2026-02-01' },
    { id: 'u4', username: 'citizen1', displayName: 'أحمد الشهري (Resident)', role: 'Resident', email: 'ahmed@resident.local', status: 'Active', createdAt: '2026-02-10' },
    { id: 'u5', username: 'resident', displayName: 'محمد القحطاني (Resident)', role: 'Resident', email: 'mohammed@resident.local', status: 'Active', createdAt: '2026-03-01' },
  ]);

  const [openAdd, setOpenAdd] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Resident');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (!username.trim() || !name.trim()) return;
    setUsers((prev) => [
      {
        id: 'u-' + Date.now(),
        username,
        displayName: name,
        role,
        email: email || `${username}@parking.local`,
        status: 'Active',
        createdAt: 'الآن',
      },
      ...prev,
    ]);
    setOpenAdd(false);
    setUsername('');
    setName('');
    setEmail('');
  };

  const getRoleColor = (r: string) => {
    switch (r) {
      case 'Admin':
        return 'error';
      case 'Operator':
        return 'primary';
      case 'Security':
        return 'warning';
      case 'Resident':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            إدارة المستخدمين والحسابات (User Management)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            التحكم في صلاحيات مستخدمي المنظومة (Admin, Operator, Security, Resident)
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenAdd(true)}
          sx={{ fontWeight: 800, px: 3 }}
        >
          إضافة مستخدم جديد
        </Button>
      </Stack>

      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اسم المستخدم</TableCell>
                <TableCell>الاسم الظاهر</TableCell>
                <TableCell>الدور والصلاحية</TableCell>
                <TableCell>البريد الإلكتروني</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell>الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{u.username}</TableCell>
                  <TableCell>{u.displayName}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
                      label={u.role}
                      size="small"
                      color={getRoleColor(u.role)}
                      sx={{ fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell dir="ltr" align="right">{u.email}</TableCell>
                  <TableCell color="text.secondary">{u.createdAt}</TableCell>
                  <TableCell>
                    <Chip label={u.status} size="small" color="success" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add User Modal */}
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>إضافة مستخدم جديد للمنظومة</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="اسم المستخدم (Username)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="الاسم بالكامل (Display Name)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              type="email"
            />
            <TextField
              select
              label="الدور (Role)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
            >
              <MenuItem value="Admin">Admin (مدير النظام)</MenuItem>
              <MenuItem value="Operator">Operator (مشغل العمليات)</MenuItem>
              <MenuItem value="Security">Security (أمن الموقف)</MenuItem>
              <MenuItem value="Resident">Resident (ساكن / مواطن)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAdd(false)}>إلغاء</Button>
          <Button variant="contained" color="primary" onClick={handleAdd} sx={{ fontWeight: 800 }}>
            إضافة المستخدم
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
