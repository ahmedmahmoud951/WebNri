import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCardIcon from '@mui/icons-material/AddCard';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { glassPanel, glowPanel } from '../../app/theme';

export function WalletPage() {
  const theme = useTheme();
  const [balance, setBalance] = useState(380);
  const [openTopUp, setOpenTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('100');
  const [feedback, setFeedback] = useState<string | null>(null);

  const [transactions, setTransactions] = useState([
    { id: 'tx-1', type: 'Credit', title: 'شحن رصيد تجريبي (Top-up)', amount: 200, date: '2026-09-29 12:30', status: 'Succeeded' },
    { id: 'tx-2', type: 'Debit', title: 'دفع رسوم موقف - بوابة الشمال', amount: -25, date: '2026-09-29 18:20', status: 'Succeeded' },
    { id: 'tx-3', type: 'Debit', title: 'رسوم حجز مسبق Spot A-114', amount: -20, date: '2026-09-28 14:00', status: 'Succeeded' },
    { id: 'tx-4', type: 'Debit', title: 'شحن سيارة كهربائية EV Fast', amount: -45, date: '2026-09-27 19:15', status: 'Succeeded' },
  ]);

  const handleTopUp = () => {
    const amt = Number(topUpAmount) || 50;
    setBalance((prev) => prev + amt);
    setTransactions((prev) => [
      {
        id: 'tx-' + Date.now(),
        type: 'Credit',
        title: 'شحن رصيد إلكتروني فوري للمحفظة',
        amount: amt,
        date: 'الآن',
        status: 'Succeeded',
      },
      ...prev,
    ]);
    setFeedback(`تمت إضافة ${amt} SAR إلى رصيد محفظتك بنجاح!`);
    setOpenTopUp(false);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            محفظة الرصيد الرقمية (Digital Wallet)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            رصيدك المتاح للخصم التلقائي عند فتح الحواجز ودفع رسوم المواقف والشواحن الكهربائية
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCardIcon />}
          onClick={() => setOpenTopUp(true)}
          sx={{ fontWeight: 800, px: 3 }}
        >
          شحن الرصيد
        </Button>
      </Stack>

      {feedback && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setFeedback(null)}>{feedback}</Alert>}

      {/* Balance Card Banner */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ ...glowPanel(theme.palette.primary.main, {}, theme.palette.mode), p: 3.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                الرصيد المتاح حالياً
              </Typography>
              <AccountBalanceWalletIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
            </Stack>

            <Typography variant="h2" fontWeight={900} sx={{ my: 1.5, color: theme.palette.primary.main }}>
              {balance} <Typography component="span" variant="h5" color="text.secondary">SAR</Typography>
            </Typography>

            <Typography variant="caption" color="text.secondary">
              مفعل للسحب التلقائي الفوري عبر تقنية التعرف على اللوحات LPR
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 3.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              ميزة الدفع السلس دون توقف (Seamless Free-Flow)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              عند اقتراب مركبتك من بوابات الخروج، يقرأ النظام اللوحة ويخصم رسوم الموقف من محفظتك ويفتح الحاجز في أقل من 0.5 ثانية دون الحاجة لأي تذاكر ورقية أو بطاقات بنكية.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label="الخصم التلقائي: نشط" color="success" size="small" />
              <Chip label="تنبيهات SMS / WhatsApp: مفعلة" variant="outlined" size="small" />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions History */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          سجل الحركات والعمليات المالية (Transactions History)
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>العملية</TableCell>
                <TableCell>التاريخ والوقت</TableCell>
                <TableCell>المبلغ</TableCell>
                <TableCell>الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {tx.type === 'Credit' ? (
                        <ArrowDownwardIcon sx={{ color: theme.palette.success.main }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ color: theme.palette.error.main }} />
                      )}
                      <Typography variant="body2" fontWeight={700}>
                        {tx.title}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell color="text.secondary">{tx.date}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: tx.type === 'Credit' ? theme.palette.success.main : theme.palette.text.primary }}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} SAR
                  </TableCell>
                  <TableCell>
                    <Chip label={tx.status} size="small" color="success" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Top up Dialog */}
      <Dialog
        open={openTopUp}
        onClose={() => setOpenTopUp(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>شحن رصيد المحفظة الإلكترونية</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              اختر أو أدخل المبلغ المراد شحنه (محاكاة دفع فورية):
            </Typography>
            <Stack direction="row" spacing={1}>
              {['50', '100', '200', '500'].map((amt) => (
                <Chip
                  key={amt}
                  label={`${amt} SAR`}
                  clickable
                  color={topUpAmount === amt ? 'primary' : 'default'}
                  onClick={() => setTopUpAmount(amt)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
            <TextField
              label="المبلغ بالريال السعودي"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              fullWidth
              type="number"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenTopUp(false)}>إلغاء</Button>
          <Button variant="contained" color="primary" onClick={handleTopUp} sx={{ fontWeight: 800 }}>
            تأكيد الشحن الفوري
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
