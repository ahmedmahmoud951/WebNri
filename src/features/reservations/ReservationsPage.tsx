import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
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
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import { smartParkingApi, type ReservationDto } from '../../core/api/smartParkingApi';
import { glassPanel, glowPanel } from '../../app/theme';

export function ReservationsPage() {
  const theme = useTheme();
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openWizard, setOpenWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  // Form states for wizard
  const [building, setBuilding] = useState('Building A');
  const [floor, setFloor] = useState('Ground Floor');
  const [date, setDate] = useState('2026-09-30');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [spot, setSpot] = useState('Spot A-105');
  const [plate, setPlate] = useState('أ ب ج 1004');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await smartParkingApi.getReservations();
      if (data && data.length > 0) {
        setReservations(data);
      } else {
        setReservations([
          { id: 'res-1', buildingName: 'Building A', floorName: 'Ground Floor', slotLabel: 'Spot A-114', plateNumber: 'أ ب ج 1004', reservedFrom: '2026-09-30 14:00', reservedTo: '2026-09-30 18:00', fee: 20, status: 'Upcoming' },
          { id: 'res-2', buildingName: 'Building B', floorName: 'First Floor', slotLabel: 'Spot B-201', plateNumber: 'س ص ع 9999', reservedFrom: '2026-09-29 17:00', reservedTo: '2026-09-29 20:00', fee: 15, status: 'Active' },
          { id: 'res-3', buildingName: 'Building A', floorName: 'Ground Floor', slotLabel: 'Spot A-102', plateNumber: 'د هـ و 2045', reservedFrom: '2026-09-28 10:00', reservedTo: '2026-09-28 12:00', fee: 10, status: 'Completed' },
        ]);
      }
    } catch {
      setReservations([
        { id: 'res-1', buildingName: 'Building A', floorName: 'Ground Floor', slotLabel: 'Spot A-114', plateNumber: 'أ ب ج 1004', reservedFrom: '2026-09-30 14:00', reservedTo: '2026-09-30 18:00', fee: 20, status: 'Upcoming' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCreateReservation = async () => {
    setSubmitting(true);
    try {
      await smartParkingApi.createReservation({
        buildingName: building,
        floorName: floor,
        slotLabel: spot,
        plateNumber: plate,
        reservedFrom: `${date} ${startTime}`,
        reservedTo: `${date} ${endTime}`,
        fee: 20,
      });
      setFeedback('تم إنشاء الحجز بنجاح وتخصيص الموقف لك!');
      setOpenWizard(false);
      setWizardStep(0);
      await loadReservations();
    } catch {
      setFeedback('تم تأكيد الحجز التجريبي وتخصيص المكان!');
      setOpenWizard(false);
      setWizardStep(0);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await smartParkingApi.cancelReservation(id);
      await loadReservations();
    } catch {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r))
      );
    }
  };

  const steps = ['المبنى والدور', 'التاريخ والوقت والموقف', 'تأكيد الحجز'];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            حجوزات المواقف المسبقة (Parking Reservations)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            احجز موقفك مسبقاً قبل وصولك للمبنى لضمان توفر المكان وفتح الحواجز تلقائياً
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setOpenWizard(true)}
          sx={{ fontWeight: 800, px: 3 }}
        >
          حجز موقف جديد
        </Button>
      </Stack>

      {feedback && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setFeedback(null)}>{feedback}</Alert>}

      {/* Reservations Table */}
      <Card sx={{ ...glassPanel({}, theme.palette.mode), p: 2.5 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الموقف المخصص</TableCell>
                <TableCell>المبنى والدور</TableCell>
                <TableCell>رقم اللوحة</TableCell>
                <TableCell>فترة الحجز</TableCell>
                <TableCell>الرسوم</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell align="center">الإجراء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{r.slotLabel || 'A-105'}</TableCell>
                  <TableCell>
                    {r.buildingName} • {r.floorName}
                  </TableCell>
                  <TableCell sx={{ letterSpacing: 1, fontWeight: 700 }}>{r.plateNumber}</TableCell>
                  <TableCell>
                    من: {r.reservedFrom} <br />
                    إلى: {r.reservedTo}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{r.fee} SAR</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      size="small"
                      color={
                        r.status === 'Active'
                          ? 'success'
                          : r.status === 'Upcoming'
                          ? 'primary'
                          : r.status === 'Completed'
                          ? 'default'
                          : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    {r.status === 'Upcoming' && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={() => handleCancel(r.id)}
                      >
                        إلغاء
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Reservation Wizard Modal */}
      <Dialog
        open={openWizard}
        onClose={() => setOpenWizard(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { ...glassPanel({}, theme.palette.mode), p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>معالج حجز موقف ذكي (Reservation Wizard)</DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={wizardStep} sx={{ mb: 4, pt: 1 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {wizardStep === 0 && (
            <Stack spacing={2.5}>
              <TextField
                select
                label="المبنى المطلوب"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                fullWidth
              >
                <MenuItem value="Building A">المبنى الرئيسي (Building A)</MenuItem>
                <MenuItem value="Building B">المبنى التجاري (Building B)</MenuItem>
                <MenuItem value="Building C">مبنى كبار الشخصيات (Building C)</MenuItem>
              </TextField>

              <TextField
                select
                label="الدور المطلوب"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                fullWidth
              >
                <MenuItem value="Ground Floor">الدور الأرضي - Ground Floor</MenuItem>
                <MenuItem value="First Floor">الدور الأول - First Floor</MenuItem>
                <MenuItem value="Second Floor">الدور الثاني - Second Floor</MenuItem>
              </TextField>
            </Stack>
          )}

          {wizardStep === 1 && (
            <Stack spacing={2.5}>
              <TextField
                label="تاريخ الحجز"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="وقت البدء"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="وقت الانتهاء"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <TextField
                select
                label="اختر الموقف المتاح"
                value={spot}
                onChange={(e) => setSpot(e.target.value)}
                fullWidth
              >
                <MenuItem value="Spot A-105">Spot A-105 (قريب من المصعد)</MenuItem>
                <MenuItem value="Spot A-112">Spot A-112 (موقف عريض)</MenuItem>
                <MenuItem value="Spot A-120">Spot A-120 (مزود بشاحن EV)</MenuItem>
              </TextField>

              <TextField
                label="رقم لوحة المركبة"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                fullWidth
              />
            </Stack>
          )}

          {wizardStep === 2 && (
            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: theme.palette.primary.main }}>
                ملخص بيانات الحجز:
              </Typography>
              <Typography variant="body2"><strong>المبنى والدور:</strong> {building} - {floor}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>الموقف:</strong> {spot}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>التاريخ والوقت:</strong> {date} من {startTime} إلى {endTime}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>لوحة المركبة:</strong> {plate}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>الرسوم الإجمالية:</strong> 20 SAR (تدفع تلقائياً)</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {wizardStep > 0 && (
            <Button onClick={() => setWizardStep(wizardStep - 1)}>
              السابق
            </Button>
          )}
          {wizardStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={() => setWizardStep(wizardStep + 1)}>
              التالي
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateReservation}
              disabled={submitting}
              sx={{ fontWeight: 800 }}
            >
              {submitting ? 'جاري التأكيد...' : 'تأكيد الحجز والدفع'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
