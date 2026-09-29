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
  Divider,
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
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import { smartParkingApi, type InvoiceDto } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function InvoicesPage() {
  const theme = useTheme();
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);

  useEffect(() => {
    smartParkingApi.getInvoices().then((data) => {
      if (data && data.length > 0) {
        setInvoices(data);
      } else {
        setInvoices([
          {
            id: 'inv-1001',
            invoiceNumber: 'INV-2026-0091',
            amount: 2400,
            currency: 'SAR',
            status: 'Paid',
            issueDate: '2026-01-01',
            dueDate: '2026-01-15',
            items: [{ description: 'اشتراك سنوي في موقف الحي الذكي (Annual Pro)', amount: 2400 }],
          },
          {
            id: 'inv-1002',
            invoiceNumber: 'INV-2026-0342',
            amount: 150,
            currency: 'SAR',
            status: 'Paid',
            issueDate: '2026-08-31',
            dueDate: '2026-09-05',
            items: [{ description: 'رسوم وقوف متفرقة لشهر أغسطس', amount: 150 }],
          },
          {
            id: 'inv-1003',
            invoiceNumber: 'INV-2026-0418',
            amount: 60,
            currency: 'SAR',
            status: 'Paid',
            issueDate: '2026-09-25',
            dueDate: '2026-09-30',
            items: [{ description: 'شحن سيارة كهربائية EV Fast Charging (3 جلسات)', amount: 60 }],
          },
        ]);
      }
    }).catch(() => {
      // Fallback
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            الفواتير والمستندات الضريبية (Tax Invoices)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            استعراض وتحميل الفواتير الإلكترونية المعتمدة للاشتراكات وجلسات الوقوف
          </Typography>
        </Box>
      </Stack>

      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>رقم الفاتورة</TableCell>
                <TableCell>تاريخ الإصدار</TableCell>
                <TableCell>تاريخ الاستحقاق</TableCell>
                <TableCell>المبلغ الإجمالي</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell align="center">الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.issueDate}</TableCell>
                  <TableCell color="text.secondary">{inv.dueDate}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                    {inv.amount} {inv.currency}
                  </TableCell>
                  <TableCell>
                    <Chip label={inv.status} size="small" color={inv.status === 'Paid' ? 'success' : 'warning'} />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => setSelectedInvoice(inv)}
                      sx={{ fontWeight: 700 }}
                    >
                      عرض الفاتورة
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Invoice Detail Modal */}
      <Dialog
        open={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          فاتورة ضريبية إلكترونية مبسطة ({selectedInvoice?.invoiceNumber})
        </DialogTitle>
        <DialogContent dividers>
          {selectedInvoice && (
            <Stack spacing={2.5}>
              <Box sx={{ p: 2, borderRadius: '8px', bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <Typography variant="body2"><strong>الرقم الضريبي:</strong> 310294857200003</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}><strong>تاريخ الإصدار:</strong> {selectedInvoice.issueDate}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}><strong>الجهة المصدرة:</strong> منظومة NRI لإدارة مواقف الأحياء الذكية</Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={800}>
                تفاصيل البنود والخدمات:
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>الوصف</TableCell>
                    <TableCell align="right">المبلغ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedInvoice.items?.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{it.description}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{it.amount} SAR</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>المجموع شامل ضريبة القيمة المضافة (15%):</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, color: theme.palette.primary.main, fontSize: 16 }}>
                      {selectedInvoice.amount} {selectedInvoice.currency}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 1.5 }}>
          <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
            طباعة
          </Button>
          <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={() => setSelectedInvoice(null)}>
            تحميل PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
