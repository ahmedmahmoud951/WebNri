import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Alert,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

// MUI Icons
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareIcon from '@mui/icons-material/Share';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import AccessibleIcon from '@mui/icons-material/Accessible';
import StarIcon from '@mui/icons-material/Star';
import LayersIcon from '@mui/icons-material/Layers';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TimerIcon from '@mui/icons-material/Timer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShieldIcon from '@mui/icons-material/Shield';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import NfcIcon from '@mui/icons-material/Nfc';
import BoltIcon from '@mui/icons-material/Bolt';
import SensorDoorIcon from '@mui/icons-material/SensorDoor';
import TuneIcon from '@mui/icons-material/Tune';
import ElevatorIcon from '@mui/icons-material/Elevator';
import CheckIcon from '@mui/icons-material/Check';
import PublicIcon from '@mui/icons-material/Public';

import { SaudiRealisticPlate } from '../../core/SaudiRealisticPlate';
import { smartParkingApi, type DigitalCardDto } from '../../core/api/smartParkingApi';
import { glassPanel } from '../../app/theme';

// ==========================================
// DATA STRUCTURES
// ==========================================

export interface ParkingSlot {
  id: string;
  floorId: 'G' | 'B1' | 'B2' | 'VIP';
  floorNameAr: string;
  slotNumber: string;
  sectionAr: string;
  status: 'vacant' | 'occupied' | 'reserved';
  type: 'standard' | 'ev' | 'vip' | 'accessible';
  typeNameAr: string;
  nearGateAr: string;
  proximityToElevatorAr: string;
  occupiedPlate?: string;
}

export interface GuestPassItem {
  id: string;
  guestName: string;
  phone: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  visitPurpose: string;
  gateName: string;
  plateNumber: string;
  hasVehicle: boolean;
  assignedSlot: {
    id: string;
    floorId: string;
    floorNameAr: string;
    slotNumber: string;
    sectionAr: string;
    type: string;
    typeNameAr: string;
    nearGateAr: string;
  };
  inviteCode: string;
  status: 'Active' | 'Used' | 'Expired' | 'Cancelled';
  createdAt: string;
  qrPayload: string;
}

// Initial Realistic Slots Catalog
const INITIAL_SLOTS: ParkingSlot[] = [
  // الدور الأرضي (G) - بهو الزوار والاستقبال
  { id: 'G-01', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-01', sectionAr: 'المدخل الرئيسي - صف A', status: 'vacant', type: 'vip', typeNameAr: 'موقف كبار الضيوف VIP', nearGateAr: 'بوابة الدخول الرئيسية 01', proximityToElevatorAr: '15 متراً إلى بهو الاستقبال' },
  { id: 'G-02', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-02', sectionAr: 'المدخل الرئيسي - صف A', status: 'occupied', type: 'vip', typeNameAr: 'موقف كبار الضيوف VIP', nearGateAr: 'بوابة الدخول الرئيسية 01', proximityToElevatorAr: '18 متراً إلى بهو الاستقبال', occupiedPlate: 'ر ح ل 9920' },
  { id: 'G-03', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-03', sectionAr: 'المدخل الرئيسي - صف A', status: 'vacant', type: 'standard', typeNameAr: 'موقف قياسي مظلل', nearGateAr: 'بوابة الدخول الرئيسية 01', proximityToElevatorAr: '20 متراً إلى بهو الاستقبال' },
  { id: 'G-04', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-04', sectionAr: 'الجناح الشرقي - صف B', status: 'vacant', type: 'accessible', typeNameAr: 'ذوو الاحتياجات الخاصة', nearGateAr: 'بوابة الدخول الشرقية 02', proximityToElevatorAr: 'مباشرة أمام المصعد رقم 1' },
  { id: 'G-05', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-05', sectionAr: 'الجناح الشرقي - صف B', status: 'occupied', type: 'standard', typeNameAr: 'موقف قياسي مظلل', nearGateAr: 'بوابة الدخول الشرقية 02', proximityToElevatorAr: '25 متراً إلى المصعد رقم 1', occupiedPlate: 'أ ب ج 1004' },
  { id: 'G-06', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-06', sectionAr: 'الجناح الشرقي - صف B', status: 'vacant', type: 'standard', typeNameAr: 'موقف قياسي مظلل', nearGateAr: 'بوابة الدخول الشرقية 02', proximityToElevatorAr: '30 متراً إلى المصعد رقم 1' },
  { id: 'G-07', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-07', sectionAr: 'الجناح الغربي - صف C', status: 'vacant', type: 'ev', typeNameAr: 'شحن كهربائي فائق السرعة', nearGateAr: 'بوابة الغرب 03', proximityToElevatorAr: '35 متراً إلى المصعد الغربي' },
  { id: 'G-08', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-08', sectionAr: 'الجناح الغربي - صف C', status: 'reserved', type: 'standard', typeNameAr: 'موقف محجوز مسبقاً', nearGateAr: 'بوابة الغرب 03', proximityToElevatorAr: '40 متراً إلى المصعد الغربي' },
  { id: 'G-09', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-09', sectionAr: 'الجناح الغربي - صف C', status: 'vacant', type: 'standard', typeNameAr: 'موقف قياسي مظلل', nearGateAr: 'بوابة الغرب 03', proximityToElevatorAr: '42 متراً إلى المصعد الغربي' },
  { id: 'G-10', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-10', sectionAr: 'المنطقة الشمالية - صف D', status: 'vacant', type: 'standard', typeNameAr: 'موقف قياسي مظلل', nearGateAr: 'بوابة الشمال 04', proximityToElevatorAr: '22 متراً إلى المصعد 2' },
  { id: 'G-11', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-11', sectionAr: 'المنطقة الشمالية - صف D', status: 'occupied', type: 'standard', typeNameAr: 'موقف قياسي مظلل', nearGateAr: 'بوابة الشمال 04', proximityToElevatorAr: '24 متراً إلى المصعد 2', occupiedPlate: 'د ر ع 8055' },
  { id: 'G-12', floorId: 'G', floorNameAr: 'الدور الأرضي (G)', slotNumber: 'G-12', sectionAr: 'المنطقة الشمالية - صف D', status: 'vacant', type: 'ev', typeNameAr: 'شحن كهربائي فائق السرعة', nearGateAr: 'بوابة الشمال 04', proximityToElevatorAr: '28 متراً إلى المصعد 2' },

  // القبو الأول (B1) - كبار الشخصيات والخدمات السريعة
  { id: 'B1-01', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-01', sectionAr: 'منطقة كبار التنفيذيين - A', status: 'occupied', type: 'vip', typeNameAr: 'موقف كبار الشخصيات VIP', nearGateAr: 'بوابة المنحدر السريع B1', proximityToElevatorAr: '10 أمتار من المصعد البانورامي', occupiedPlate: 'ط ي ر 7777' },
  { id: 'B1-02', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-02', sectionAr: 'منطقة كبار التنفيذيين - A', status: 'vacant', type: 'vip', typeNameAr: 'موقف كبار الشخصيات VIP', nearGateAr: 'بوابة المنحدر السريع B1', proximityToElevatorAr: '12 متراً من المصعد البانورامي' },
  { id: 'B1-03', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-03', sectionAr: 'منطقة كبار التنفيذيين - A', status: 'vacant', type: 'vip', typeNameAr: 'موقف كبار الشخصيات VIP', nearGateAr: 'بوابة المنحدر السريع B1', proximityToElevatorAr: '14 متراً من المصعد البانورامي' },
  { id: 'B1-04', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-04', sectionAr: 'المحور الأوسط - صف B', status: 'vacant', type: 'ev', typeNameAr: 'شحن كهربائي 150kW', nearGateAr: 'بوابة المنحدر السريع B1', proximityToElevatorAr: '16 متراً من المصعد رقم 2' },
  { id: 'B1-05', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-05', sectionAr: 'المحور الأوسط - صف B', status: 'vacant', type: 'ev', typeNameAr: 'شحن كهربائي 150kW', nearGateAr: 'بوابة المنحدر السريع B1', proximityToElevatorAr: '18 متراً من المصعد رقم 2' },
  { id: 'B1-06', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-06', sectionAr: 'المحور الأوسط - صف B', status: 'occupied', type: 'standard', typeNameAr: 'موقف قياسي فسيح', nearGateAr: 'بوابة المنحدر السريع B1', proximityToElevatorAr: '20 متراً من المصعد رقم 2', occupiedPlate: 'ص ق ر 5050' },
  { id: 'B1-07', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-07', sectionAr: 'القطاع الجنوبي - صف C', status: 'vacant', type: 'standard', typeNameAr: 'موقف قياسي فسيح', nearGateAr: 'بوابة المنحدر الجنوبي', proximityToElevatorAr: '22 متراً من مخرج الطوارئ والمصعد' },
  { id: 'B1-08', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-08', sectionAr: 'القطاع الجنوبي - صف C', status: 'reserved', type: 'standard', typeNameAr: 'موقف مخصص مؤكد', nearGateAr: 'بوابة المنحدر الجنوبي', proximityToElevatorAr: '25 متراً من مخرج الطوارئ والمصعد' },
  { id: 'B1-09', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-09', sectionAr: 'القطاع الجنوبي - صف C', status: 'vacant', type: 'standard', typeNameAr: 'موقف قياسي فسيح', nearGateAr: 'بوابة المنحدر الجنوبي', proximityToElevatorAr: '28 متراً من مخرج الطوارئ والمصعد' },
  { id: 'B1-10', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-10', sectionAr: 'القطاع الشمالي - صف D', status: 'occupied', type: 'standard', typeNameAr: 'موقف قياسي فسيح', nearGateAr: 'بوابة المنحدر الشمالي', proximityToElevatorAr: '30 متراً من المصعد 3', occupiedPlate: 'ن ج م 1111' },
  { id: 'B1-11', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-11', sectionAr: 'القطاع الشمالي - صف D', status: 'vacant', type: 'accessible', typeNameAr: 'ذوو الاحتياجات الخاصة', nearGateAr: 'بوابة المنحدر الشمالي', proximityToElevatorAr: '5 أمتار من المصعد 3' },
  { id: 'B1-12', floorId: 'B1', floorNameAr: 'القبو الأول (B1)', slotNumber: 'B1-12', sectionAr: 'القطاع الشمالي - صف D', status: 'occupied', type: 'standard', typeNameAr: 'موقف قياسي فسيح', nearGateAr: 'بوابة المنحدر الشمالي', proximityToElevatorAr: '15 متراً من المصعد 3', occupiedPlate: 'ك ح ل 2026' },

  // القبو الثاني (B2) - المواقف العامة الفسيحة والشحن الكهربائي
  { id: 'B2-01', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-01', sectionAr: 'القطاع الشرقي - صف A', status: 'vacant', type: 'standard', typeNameAr: 'موقف طويل الأجل فسيح', nearGateAr: 'بوابة الدخول السفلية B2', proximityToElevatorAr: '15 متراً من المصعد الرئيسي B2' },
  { id: 'B2-02', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-02', sectionAr: 'القطاع الشرقي - صف A', status: 'vacant', type: 'standard', typeNameAr: 'موقف طويل الأجل فسيح', nearGateAr: 'بوابة الدخول السفلية B2', proximityToElevatorAr: '18 متراً من المصعد الرئيسي B2' },
  { id: 'B2-03', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-03', sectionAr: 'القطاع الشرقي - صف A', status: 'occupied', type: 'standard', typeNameAr: 'موقف طويل الأجل فسيح', nearGateAr: 'بوابة الدخول السفلية B2', proximityToElevatorAr: '20 متراً من المصعد الرئيسي B2', occupiedPlate: 'ح م د 3344' },
  { id: 'B2-04', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-04', sectionAr: 'القطاع الأوسط - صف B', status: 'vacant', type: 'ev', typeNameAr: 'شاحن كهربائي ذكي 50kW', nearGateAr: 'بوابة الدخول السفلية B2', proximityToElevatorAr: '12 متراً من المصعد الثاني' },
  { id: 'B2-05', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-05', sectionAr: 'القطاع الأوسط - صف B', status: 'vacant', type: 'ev', typeNameAr: 'شاحن كهربائي ذكي 50kW', nearGateAr: 'بوابة الدخول السفلية B2', proximityToElevatorAr: '14 متراً من المصعد الثاني' },
  { id: 'B2-06', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-06', sectionAr: 'القطاع الأوسط - صف B', status: 'vacant', type: 'ev', typeNameAr: 'شاحن كهربائي ذكي 50kW', nearGateAr: 'بوابة الدخول السفلية B2', proximityToElevatorAr: '16 متراً من المصعد الثاني' },
  { id: 'B2-07', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-07', sectionAr: 'القطاع الغربي - صف C', status: 'vacant', type: 'standard', typeNameAr: 'موقف هادئ ومظلل بالكامل', nearGateAr: 'بوابة الغرب B2', proximityToElevatorAr: '30 متراً من مصعد البرج الإداري' },
  { id: 'B2-08', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-08', sectionAr: 'القطاع الغربي - صف C', status: 'occupied', type: 'standard', typeNameAr: 'موقف هادئ ومظلل بالكامل', nearGateAr: 'بوابة الغرب B2', proximityToElevatorAr: '32 متراً من مصعد البرج الإداري', occupiedPlate: 'ع ر ب 9000' },
  { id: 'B2-09', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-09', sectionAr: 'القطاع الغربي - صف C', status: 'vacant', type: 'standard', typeNameAr: 'موقف هادئ ومظلل بالكامل', nearGateAr: 'بوابة الغرب B2', proximityToElevatorAr: '35 متراً من مصعد البرج الإداري' },
  { id: 'B2-10', floorId: 'B2', floorNameAr: 'القبو الثاني (B2)', slotNumber: 'B2-10', sectionAr: 'القطاع الجنوبي - صف D', status: 'vacant', type: 'standard', typeNameAr: 'موقف هادئ ومظلل بالكامل', nearGateAr: 'بوابة الجنوب B2', proximityToElevatorAr: '25 متراً من المصعد الجنوبي' },

  // منطقة كبار الشخصيات VIP
  { id: 'VIP-01', floorId: 'VIP', floorNameAr: 'جناح كبار الشخصيات (VIP)', slotNumber: 'VIP-01', sectionAr: 'البهو الرئاسي الملكي', status: 'occupied', type: 'vip', typeNameAr: 'موقف رئاسي مؤمّن بحراسة', nearGateAr: 'بوابة المراسم الملكية 00', proximityToElevatorAr: 'مصعد خاص مباشر للأجنحة', occupiedPlate: 'ق و ل 4001' },
  { id: 'VIP-02', floorId: 'VIP', floorNameAr: 'جناح كبار الشخصيات (VIP)', slotNumber: 'VIP-02', sectionAr: 'البهو الرئاسي الملكي', status: 'vacant', type: 'vip', typeNameAr: 'موقف رئاسي مؤمّن بحراسة', nearGateAr: 'بوابة المراسم الملكية 00', proximityToElevatorAr: 'مصعد خاص مباشر للأجنحة' },
  { id: 'VIP-03', floorId: 'VIP', floorNameAr: 'جناح كبار الشخصيات (VIP)', slotNumber: 'VIP-03', sectionAr: 'البهو التنفيذي - شرق', status: 'vacant', type: 'vip', typeNameAr: 'موقف كبار التنفيذيين', nearGateAr: 'بوابة كبار الشخصيات VIP 03', proximityToElevatorAr: '5 أمتار من المصعد التنفيذي' },
  { id: 'VIP-04', floorId: 'VIP', floorNameAr: 'جناح كبار الشخصيات (VIP)', slotNumber: 'VIP-04', sectionAr: 'البهو التنفيذي - شرق', status: 'vacant', type: 'vip', typeNameAr: 'موقف كبار التنفيذيين', nearGateAr: 'بوابة كبار الشخصيات VIP 03', proximityToElevatorAr: '8 أمتار من المصعد التنفيذي' },
  { id: 'VIP-05', floorId: 'VIP', floorNameAr: 'جناح كبار الشخصيات (VIP)', slotNumber: 'VIP-05', sectionAr: 'البهو التنفيذي - غرب', status: 'occupied', type: 'vip', typeNameAr: 'موقف كبار التنفيذيين مع شاحن', nearGateAr: 'بوابة كبار الشخصيات VIP 03', proximityToElevatorAr: '10 أمتار من المصعد التنفيذي', occupiedPlate: 'أ ب ج 1004' },
  { id: 'VIP-06', floorId: 'VIP', floorNameAr: 'جناح كبار الشخصيات (VIP)', slotNumber: 'VIP-06', sectionAr: 'البهو التنفيذي - غرب', status: 'vacant', type: 'vip', typeNameAr: 'موقف كبار التنفيذيين مع شاحن', nearGateAr: 'بوابة كبار الشخصيات VIP 03', proximityToElevatorAr: '12 متراً من المصعد التنفيذي' },
];

// Initial Guest Passes List
const INITIAL_GUEST_PASSES: GuestPassItem[] = [
  {
    id: 'pass-01',
    guestName: 'سعادة الدكتور فهد بن عبد الرحمن السديري',
    phone: '+966505123456',
    visitDate: '2026-10-01',
    startTime: '10:00 صباحاً',
    endTime: '02:00 مساءً',
    visitPurpose: 'اجتماع مجلس الإدارة واللجنة التنفيذية',
    gateName: 'بوابة كبار الشخصيات VIP 03',
    plateNumber: 'ق و ل 4001',
    hasVehicle: true,
    assignedSlot: {
      id: 'VIP-03',
      floorId: 'VIP',
      floorNameAr: 'جناح كبار الشخصيات (VIP)',
      slotNumber: 'VIP-03',
      sectionAr: 'البهو التنفيذي - شرق',
      type: 'vip',
      typeNameAr: 'موقف كبار التنفيذيين',
      nearGateAr: 'بوابة كبار الشخصيات VIP 03',
    },
    inviteCode: 'NRI-VIP-2026-8812',
    status: 'Active',
    createdAt: '2026-09-30 20:30',
    qrPayload: 'https://nri.smartparking.local/pass/verify?code=NRI-VIP-2026-8812&guest=FahadAlSudairy&slot=VIP-03&plate=4001QWL',
  },
  {
    id: 'pass-02',
    guestName: 'المهندس فيصل بن تركي المنصور',
    phone: '+966551987654',
    visitDate: '2026-10-01',
    startTime: '01:30 مساءً',
    endTime: '05:00 مساءً',
    visitPurpose: 'معاينة البنية التحتية والمشروعات التقنية',
    gateName: 'بوابة الشمال 04',
    plateNumber: 'م ن هـ 7080',
    hasVehicle: true,
    assignedSlot: {
      id: 'B1-04',
      floorId: 'B1',
      floorNameAr: 'القبو الأول (B1)',
      slotNumber: 'B1-04',
      sectionAr: 'المحور الأوسط - صف B',
      type: 'ev',
      typeNameAr: 'شحن كهربائي 150kW',
      nearGateAr: 'بوابة المنحدر السريع B1',
    },
    inviteCode: 'NRI-GST-2026-4409',
    status: 'Active',
    createdAt: '2026-10-01 00:15',
    qrPayload: 'https://nri.smartparking.local/pass/verify?code=NRI-GST-2026-4409&guest=FaisalAlMansour&slot=B1-04&plate=7080MNH',
  },
  {
    id: 'pass-03',
    guestName: 'الأستاذة نورة بنت سلطان آل الشيخ',
    phone: '+966540112233',
    visitDate: '2026-09-30',
    startTime: '09:00 صباحاً',
    endTime: '12:00 ظهراً',
    visitPurpose: 'استشارة استراتيجية وتطوير أعمال',
    gateName: 'بوابة الدخول الرئيسية 01',
    plateNumber: 'س ل ط 3030',
    hasVehicle: true,
    assignedSlot: {
      id: 'G-01',
      floorId: 'G',
      floorNameAr: 'الدور الأرضي (G)',
      slotNumber: 'G-01',
      sectionAr: 'المدخل الرئيسي - صف A',
      type: 'vip',
      typeNameAr: 'موقف كبار الضيوف VIP',
      nearGateAr: 'بوابة الدخول الرئيسية 01',
    },
    inviteCode: 'NRI-GST-2026-1184',
    status: 'Used',
    createdAt: '2026-09-29 18:20',
    qrPayload: 'https://nri.smartparking.local/pass/verify?code=NRI-GST-2026-1184&guest=NouraAlSheikh&slot=G-01&plate=3030SLT',
  },
  {
    id: 'pass-04',
    guestName: 'المهندس كريم محمود حسنين (وفد جمهورية مصر العربية)',
    phone: '+20 101 234 5678',
    visitDate: '2026-10-02',
    startTime: '10:30 صباحاً',
    endTime: '15:30 مساءً',
    visitPurpose: 'اجتماع تبادل الخبرات الهندسية وتكامل الأنظمة الذكية',
    gateName: 'بوابة كبار الشخصيات VIP 03',
    plateNumber: 'س ي ر 9182',
    hasVehicle: true,
    assignedSlot: {
      id: 'B2-01',
      floorId: 'B2',
      floorNameAr: 'القبو الثاني (B2)',
      slotNumber: 'B2-01',
      sectionAr: 'المحور الشمالي - صف VIP',
      type: 'vip',
      typeNameAr: 'موقف كبار الضيوف VIP',
      nearGateAr: 'بوابة كبار الشخصيات VIP 03',
    },
    inviteCode: 'NRI-GST-2026-9210',
    status: 'Active',
    createdAt: '2026-10-01 09:30',
    qrPayload: 'https://nri.smartparking.local/pass/verify?code=NRI-GST-2026-9210&guest=KarimHassanein&slot=B2-01&plate=9182SYR',
  },
];

export interface CountryCodeItem {
  id: string;         // Unique id, e.g. 'sa', 'eg'
  code: string;       // Dial digits e.g. '966', '20'
  dialCode: string;   // e.g. '+966', '+20'
  country: string;    // Full Arabic country name
  countryEn: string;  // English country name
  flag: string;       // Country Flag emoji
  placeholder: string;// Example phone format
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  // 1. Featured / Priority Focus
  { id: 'sa', code: '966', dialCode: '+966', country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', flag: '🇸🇦', placeholder: '50 123 4567' },
  { id: 'eg', code: '20', dialCode: '+20', country: 'جمهورية مصر العربية', countryEn: 'Egypt', flag: '🇪🇬', placeholder: '101 234 5678' },

  // 2. GCC Countries (دول مجلس التعاون الخليجي)
  { id: 'ae', code: '971', dialCode: '+971', country: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', flag: '🇦🇪', placeholder: '50 123 4567' },
  { id: 'kw', code: '965', dialCode: '+965', country: 'دولة الكويت', countryEn: 'Kuwait', flag: '🇰🇼', placeholder: '5123 4567' },
  { id: 'qa', code: '974', dialCode: '+974', country: 'دولة قطر', countryEn: 'Qatar', flag: '🇶🇦', placeholder: '3312 3456' },
  { id: 'bh', code: '973', dialCode: '+973', country: 'مملكة البحرين', countryEn: 'Bahrain', flag: '🇧🇭', placeholder: '3612 3456' },
  { id: 'om', code: '968', dialCode: '+968', country: 'سلطنة عُمان', countryEn: 'Oman', flag: '🇴🇲', placeholder: '9123 4567' },

  // 3. Arab World (الوطن العربي)
  { id: 'jo', code: '962', dialCode: '+962', country: 'المملكة الأردنية الهاشمية', countryEn: 'Jordan', flag: '🇯🇴', placeholder: '79 123 4567' },
  { id: 'iq', code: '964', dialCode: '+964', country: 'جمهورية العراق', countryEn: 'Iraq', flag: '🇮🇶', placeholder: '770 123 4567' },
  { id: 'lb', code: '961', dialCode: '+961', country: 'الجمهورية اللبنانية', countryEn: 'Lebanon', flag: '🇱🇧', placeholder: '70 123 456' },
  { id: 'ps', code: '970', dialCode: '+970', country: 'دولة فلسطين', countryEn: 'Palestine', flag: '🇵🇸', placeholder: '59 123 4567' },
  { id: 'ye', code: '967', dialCode: '+967', country: 'الجمهورية اليمنية', countryEn: 'Yemen', flag: '🇾🇪', placeholder: '771 234 567' },
  { id: 'sy', code: '963', dialCode: '+963', country: 'الجمهورية العربية السورية', countryEn: 'Syria', flag: '🇸🇾', placeholder: '944 123 456' },
  { id: 'sd', code: '249', dialCode: '+249', country: 'جمهورية السودان', countryEn: 'Sudan', flag: '🇸🇩', placeholder: '91 234 5678' },
  { id: 'ly', code: '218', dialCode: '+218', country: 'دولة ليبيا', countryEn: 'Libya', flag: '🇱🇾', placeholder: '91 234 5678' },
  { id: 'ma', code: '212', dialCode: '+212', country: 'المملكة المغربية', countryEn: 'Morocco', flag: '🇲🇦', placeholder: '612 345 678' },
  { id: 'tn', code: '216', dialCode: '+216', country: 'الجمهورية التونسية', countryEn: 'Tunisia', flag: '🇹🇳', placeholder: '20 123 456' },
  { id: 'dz', code: '213', dialCode: '+213', country: 'الجمهورية الجزائرية الديمقراطية', countryEn: 'Algeria', flag: '🇩🇿', placeholder: '551 234 567' },
  { id: 'mr', code: '222', dialCode: '+222', country: 'الجمهورية الإسلامية الموريتانية', countryEn: 'Mauritania', flag: '🇲🇷', placeholder: '45 12 34 56' },
  { id: 'so', code: '252', dialCode: '+252', country: 'جمهورية الصومال الفيدرالية', countryEn: 'Somalia', flag: '🇸🇴', placeholder: '61 234 5678' },
  { id: 'dj', code: '253', dialCode: '+253', country: 'جمهورية جيبوتي', countryEn: 'Djibouti', flag: '🇩🇯', placeholder: '77 12 34 56' },
  { id: 'km', code: '269', dialCode: '+269', country: 'الاتحاد القمري', countryEn: 'Comoros', flag: '🇰🇲', placeholder: '321 23 45' },

  // 4. Major International Destinations (كافة دول العالم)
  { id: 'tr', code: '90', dialCode: '+90', country: 'الجمهورية التركية', countryEn: 'Turkey', flag: '🇹🇷', placeholder: '532 123 4567' },
  { id: 'gb', code: '44', dialCode: '+44', country: 'المملكة المتحدة (بريطانيا)', countryEn: 'United Kingdom', flag: '🇬🇧', placeholder: '7911 123456' },
  { id: 'us', code: '1', dialCode: '+1', country: 'الولايات المتحدة الأمريكية', countryEn: 'United States', flag: '🇺🇸', placeholder: '202 555 0123' },
  { id: 'ca', code: '1', dialCode: '+1', country: 'كندا', countryEn: 'Canada', flag: '🇨🇦', placeholder: '416 555 0123' },
  { id: 'fr', code: '33', dialCode: '+33', country: 'الجمهورية الفرنسية', countryEn: 'France', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { id: 'de', code: '49', dialCode: '+49', country: 'جمهورية ألمانيا الاتحادية', countryEn: 'Germany', flag: '🇩🇪', placeholder: '151 23456789' },
  { id: 'it', code: '39', dialCode: '+39', country: 'الجمهورية الإيطالية', countryEn: 'Italy', flag: '🇮🇹', placeholder: '320 123 4567' },
  { id: 'es', code: '34', dialCode: '+34', country: 'مملكة إسبانيا', countryEn: 'Spain', flag: '🇪🇸', placeholder: '612 345 678' },
  { id: 'nl', code: '31', dialCode: '+31', country: 'مملكة هولندا', countryEn: 'Netherlands', flag: '🇳🇱', placeholder: '6 12345678' },
  { id: 'ch', code: '41', dialCode: '+41', country: 'الاتحاد السويسري', countryEn: 'Switzerland', flag: '🇨🇭', placeholder: '78 123 45 67' },
  { id: 'se', code: '46', dialCode: '+46', country: 'مملكة السويد', countryEn: 'Sweden', flag: '🇸🇪', placeholder: '70 123 45 67' },
  { id: 'be', code: '32', dialCode: '+32', country: 'مملكة بلجيكا', countryEn: 'Belgium', flag: '🇧🇪', placeholder: '470 12 34 56' },
  { id: 'at', code: '43', dialCode: '+43', country: 'جمهورية النمسا', countryEn: 'Austria', flag: '🇦🇹', placeholder: '664 1234567' },
  { id: 'gr', code: '30', dialCode: '+30', country: 'الجمهورية الهيلينية (اليونان)', countryEn: 'Greece', flag: '🇬🇷', placeholder: '691 234 5678' },
  { id: 'ru', code: '7', dialCode: '+7', country: 'روسيا الاتحادية', countryEn: 'Russia', flag: '🇷🇺', placeholder: '912 345-67-89' },
  { id: 'cn', code: '86', dialCode: '+86', country: 'جمهورية الصين الشعبية', countryEn: 'China', flag: '🇨🇳', placeholder: '138 0013 8000' },
  { id: 'jp', code: '81', dialCode: '+81', country: 'اليابان', countryEn: 'Japan', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { id: 'kr', code: '82', dialCode: '+82', country: 'جمهورية كوريا الجنوبية', countryEn: 'South Korea', flag: '🇰🇷', placeholder: '10 1234 5678' },
  { id: 'in', code: '91', dialCode: '+91', country: 'جمهورية الهند', countryEn: 'India', flag: '🇮🇳', placeholder: '98123 45678' },
  { id: 'pk', code: '92', dialCode: '+92', country: 'جمهورية باكستان الإسلامية', countryEn: 'Pakistan', flag: '🇵🇰', placeholder: '301 2345678' },
  { id: 'bd', code: '880', dialCode: '+880', country: 'جمهورية بنغلاديش', countryEn: 'Bangladesh', flag: '🇧🇩', placeholder: '1712 345678' },
  { id: 'my', code: '60', dialCode: '+60', country: 'ماليزيا', countryEn: 'Malaysia', flag: '🇲🇾', placeholder: '12 345 6789' },
  { id: 'id', code: '62', dialCode: '+62', country: 'جمهورية إندونيسيا', countryEn: 'Indonesia', flag: '🇮🇩', placeholder: '812 3456 7890' },
  { id: 'au', code: '61', dialCode: '+61', country: 'كومنولث أستراليا', countryEn: 'Australia', flag: '🇦🇺', placeholder: '412 345 678' },
  { id: 'br', code: '55', dialCode: '+55', country: 'جمهورية البرازيل الاتحادية', countryEn: 'Brazil', flag: '🇧🇷', placeholder: '11 91234-5678' },
];

export const QUICK_COUNTRY_SHORTCUTS = [
  { id: 'sa', label: 'المملكة العربية السعودية', shortLabel: 'السعودية', flag: '🇸🇦', code: '+966' },
  { id: 'eg', label: 'جمهورية مصر العربية', shortLabel: 'مصر', flag: '🇪🇬', code: '+20' },
  { id: 'ae', label: 'الإمارات العربية المتحدة', shortLabel: 'الإمارات', flag: '🇦🇪', code: '+971' },
  { id: 'kw', label: 'دولة الكويت', shortLabel: 'الكويت', flag: '🇰🇼', code: '+965' },
  { id: 'qa', label: 'دولة قطر', shortLabel: 'قطر', flag: '🇶🇦', code: '+974' },
  { id: 'bh', label: 'مملكة البحرين', shortLabel: 'البحرين', flag: '🇧🇭', code: '+973' },
  { id: 'om', label: 'سلطنة عُمان', shortLabel: 'عُمان', flag: '🇴🇲', code: '+968' },
  { id: 'jo', label: 'المملكة الأردنية', shortLabel: 'الأردن', flag: '🇯🇴', code: '+962' },
];


export function DigitalCardPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Navigation tab state: 0 = Member Pass, 1 = Create Invite, 2 = Passes Directory
  const [activeTab, setActiveTab] = useState(0);

  // Digital card member state
  const [card, setCard] = useState<DigitalCardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState('NRI-VIP-PASS-' + Date.now());
  const [qrCountdown, setQrCountdown] = useState(30);

  // Slots management
  const [slots, setSlots] = useState<ParkingSlot[]>(() => {
    const saved = localStorage.getItem('nri_digital_slots');
    return saved ? JSON.parse(saved) : INITIAL_SLOTS;
  });

  // Guest passes list
  const [guestPasses, setGuestPasses] = useState<GuestPassItem[]>(() => {
    const saved = localStorage.getItem('nri_guest_passes');
    return saved ? JSON.parse(saved) : INITIAL_GUEST_PASSES;
  });

  // Selected floor for visual slot picker
  const [selectedFloor, setSelectedFloor] = useState<'G' | 'B1' | 'B2' | 'VIP'>('B1');
  const [slotFilter, setSlotFilter] = useState<'ALL' | 'VACANT' | 'EV' | 'VIP'>('ALL');

  // Form states for creating guest invite
  const [guestName, setGuestName] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('sa');
  const [phone, setPhone] = useState('');

  // Active country details derived from selector
  const activeCountry = useMemo(() => {
    return COUNTRY_CODES.find((c) => c.id === selectedCountryId) || COUNTRY_CODES[0];
  }, [selectedCountryId]);
  const [visitDate, setVisitDate] = useState('2026-10-01');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [visitPurpose, setVisitPurpose] = useState('اجتماع عمل رسمي وزيارة تنفيذية');
  const [gateName, setGateName] = useState('بوابة كبار الشخصيات VIP 03');
  const [plateLetters, setPlateLetters] = useState('ق و ل');
  const [plateDigits, setPlateDigits] = useState('4001');
  const [hasVehicle, setHasVehicle] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('B1-02');

  // Directory search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [passFilter, setPassFilter] = useState<'ALL' | 'Active' | 'Used' | 'Expired'>('ALL');

  // Modals & Dialogs
  const [viewPassModal, setViewPassModal] = useState<GuestPassItem | null>(null);
  const [scannerModal, setScannerModal] = useState<GuestPassItem | null>(null);
  const [scannerStep, setScannerStep] = useState<'scanning' | 'verified'>('scanning');
  const [snackbarNotice, setSnackbarNotice] = useState<string | null>(null);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('nri_digital_slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('nri_guest_passes', JSON.stringify(guestPasses));
  }, [guestPasses]);

  // Load member card
  useEffect(() => {
    smartParkingApi
      .getDigitalCard()
      .then((res) => {
        if (res) {
          setCard(res);
          setQrToken(res.qrPayload || res.publicToken);
        }
      })
      .catch(() => {
        setCard({
          subscriptionId: 'sub-001',
          userId: 'usr-admin-1',
          userName: 'المهندس أحمد بن عبد الله الشهري',
          vehicleId: 'veh-001',
          plateNumber: 'أ ب ج 1004',
          publicToken: 'PASS-TOKEN-98234-A',
          qrPayload: 'https://nri.smartparking.local/pass/verify?token=PASS-TOKEN-98234-A',
          expiresAt: '2026-12-31T23:59:59Z',
        });
      })
      .finally(() => {
        setLoading(false);
      });

    // Dynamic QR update simulation
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setQrToken('NRI-DYNAMIC-PASS-' + Math.floor(100000 + Math.random() * 900000));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filtered Slots for the current floor
  const floorSlots = useMemo(() => {
    return slots.filter((s) => {
      if (s.floorId !== selectedFloor) return false;
      if (slotFilter === 'VACANT') return s.status === 'vacant';
      if (slotFilter === 'EV') return s.type === 'ev';
      if (slotFilter === 'VIP') return s.type === 'vip';
      return true;
    });
  }, [slots, selectedFloor, slotFilter]);

  // Counts per floor
  const floorCounts = useMemo(() => {
    const counts: Record<string, { total: number; vacant: number }> = {
      G: { total: 0, vacant: 0 },
      B1: { total: 0, vacant: 0 },
      B2: { total: 0, vacant: 0 },
      VIP: { total: 0, vacant: 0 },
    };
    slots.forEach((s) => {
      if (counts[s.floorId]) {
        counts[s.floorId].total += 1;
        if (s.status === 'vacant') counts[s.floorId].vacant += 1;
      }
    });
    return counts;
  }, [slots]);

  // Selected slot details
  const currentSelectedSlot = useMemo(() => {
    return slots.find((s) => s.id === selectedSlotId) || null;
  }, [slots, selectedSlotId]);

  // Formatted combined plate
  const computedPlateNumber = useMemo(() => {
    if (!hasVehicle) return 'دخول مشاة بدون مركبة';
    return `${plateLetters.trim()} ${plateDigits.trim()}`.trim();
  }, [hasVehicle, plateLetters, plateDigits]);

  // Handle slot reservation and invite creation
  const handleCreateInvite = () => {
    if (!guestName.trim()) {
      setSnackbarNotice('يرجى إدخال اسم الضيف الكريم للمتابعة.');
      return;
    }
    if (!phone.trim()) {
      setSnackbarNotice('يرجى إدخال رقم هاتف الضيف للتواصل وإرسال التصريح.');
      return;
    }
    if (!currentSelectedSlot) {
      setSnackbarNotice('يرجى اختيار خانة الموقف المخصصة من المخطط التفاعلي.');
      return;
    }

    // Format international phone number cleanly with active country code
    const trimmedPhone = phone.trim();
    let formattedPhone = trimmedPhone;
    if (trimmedPhone.startsWith('+')) {
      formattedPhone = trimmedPhone;
    } else if (trimmedPhone.startsWith('00')) {
      formattedPhone = '+' + trimmedPhone.slice(2);
    } else {
      const strippedDigits = trimmedPhone.replace(/^0+/, '');
      formattedPhone = `+${activeCountry.code} ${strippedDigits}`;
    }

    const newCode = 'NRI-PASS-' + Math.floor(1000 + Math.random() * 9000);
    const newPass: GuestPassItem = {
      id: 'pass-' + Date.now(),
      guestName: guestName.trim(),
      phone: formattedPhone,
      visitDate,
      startTime: startTime + ' صباحاً',
      endTime: endTime + ' مساءً',
      visitPurpose,
      gateName,
      plateNumber: computedPlateNumber,
      hasVehicle,
      assignedSlot: {
        id: currentSelectedSlot.id,
        floorId: currentSelectedSlot.floorId,
        floorNameAr: currentSelectedSlot.floorNameAr,
        slotNumber: currentSelectedSlot.slotNumber,
        sectionAr: currentSelectedSlot.sectionAr,
        type: currentSelectedSlot.type,
        typeNameAr: currentSelectedSlot.typeNameAr,
        nearGateAr: currentSelectedSlot.nearGateAr,
      },
      inviteCode: newCode,
      status: 'Active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      qrPayload: `https://nri.smartparking.local/pass/verify?code=${newCode}&guest=${encodeURIComponent(guestName.trim())}&slot=${currentSelectedSlot.slotNumber}&plate=${encodeURIComponent(computedPlateNumber)}`,
    };

    // Update slot status to reserved
    setSlots((prev) =>
      prev.map((s) => (s.id === currentSelectedSlot.id ? { ...s, status: 'reserved' } : s))
    );

    // Add pass to list
    setGuestPasses((prev) => [newPass, ...prev]);

    // Reset some form fields
    setGuestName('');
    setPhone('');

    // Open view modal immediately to show off result
    setViewPassModal(newPass);
    setSnackbarNotice('تم إصدار تصريح الدخول وحجز الموقف بنجاح تام! يسرنا استعراض التصريح الآن.');
  };

  // WhatsApp share helper (supports all countries, Egypt, Saudi Arabia, etc.)
  const handleShareWhatsApp = (pass: GuestPassItem) => {
    const text = `*تصريح دخول زائر معتمد - مجمع كايان الذكي* 🏢🚗
أهلاً بك سعادة الضيف: *${pass.guestName}*

يسرنا الترحيب بكم في مجمع كايان الذكي، ونرفق لكم تفاصيل تصريح الدخول وموقفكم المخصص:
📍 *الموقف المحجوز:* ${pass.assignedSlot.floorNameAr} - خانة (${pass.assignedSlot.slotNumber})
🏢 *المنطقة:* ${pass.assignedSlot.sectionAr}
🚪 *بوابة الدخول المصرح بها:* ${pass.gateName}
📅 *تاريخ الزيارة:* ${pass.visitDate}
⏰ *فترة الصلاحية:* من ${pass.startTime} إلى ${pass.endTime}
🚘 *لوحة المركبة:* ${pass.plateNumber}
🔑 *رمز التصريح الأمني:* ${pass.inviteCode}

يرجى إبراز رمز الاستجابة السريعة (QR) عند الاقتراب من البوابة لفتح الحاجز الآلي فوراً:
🔗 ${pass.qrPayload}

نتمنى لكم زيارة موفقة وسعيدة! ✨`;

    let clean = pass.phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('00')) {
      clean = clean.slice(2);
    }
    if (clean.startsWith('0')) {
      clean = clean.replace(/^0+/, '');
    }
    // Auto-detect Egyptian local mobile (10 digits starting with 10, 11, 12, 15)
    if (clean.length === 10 && /^(10|11|12|15)/.test(clean)) {
      clean = '20' + clean;
    } else if (clean.length === 9 && clean.startsWith('5')) {
      // Auto-detect Saudi local mobile (9 digits starting with 5)
      clean = '966' + clean;
    }
    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Print pass card
  const handlePrintPass = () => {
    window.print();
  };

  // Copy details helper
  const handleCopyLink = (pass: GuestPassItem) => {
    navigator.clipboard.writeText(pass.qrPayload);
    setSnackbarNotice('تم نسخ رابط وتفاصيل التصريح الرقمي إلى الحافظة بنجاح.');
  };

  // Trigger Gate Scanner simulation
  const handleOpenScanner = (pass: GuestPassItem) => {
    setScannerModal(pass);
    setScannerStep('scanning');
    setTimeout(() => {
      setScannerStep('verified');
    }, 1800);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 450 }}>
        <CircularProgress size={56} sx={{ color: theme.palette.primary.main }} />
        <Typography variant="body1" sx={{ mt: 2, fontWeight: 700, color: 'text.secondary' }}>
          جارٍ تهيئة منظومة التصاريح والبطاقات الرقمية المشفرة...
        </Typography>
      </Box>
    );
  }

  const c = card || {
    subscriptionId: 'sub-001',
    userId: 'usr-admin-1',
    userName: 'المهندس أحمد بن عبد الله الشهري',
    vehicleId: 'veh-001',
    plateNumber: 'أ ب ج 1004',
    publicToken: 'PASS-TOKEN-98234-A',
    qrPayload: 'https://nri.smartparking.local/pass/verify?token=PASS-TOKEN-98234-A',
    expiresAt: '2026-12-31T23:59:59Z',
  };

  return (
    <Box sx={{ pb: 8, width: '100%' }}>
      {/* 1. Header Command Ribbon */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha('#0F172A', 0.95)} 70%)`
            : `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.12)} 0%, #FFFFFF 85%)`,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  display: 'flex',
                }}
              >
                <BadgeIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                  منظومة بطاقة العضوية والتصاريح الرقمية الذكية
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  إدارة بطاقات العبور الرقمية المشفرة للأعضاء والمقيمين، وإصدار دعوات الزوار المعتمدة مع الحجز التفاعلي للمواقف الشاغرة
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip
              icon={<ShieldIcon sx={{ fontSize: 18 }} />}
              label="تشفير ديناميكي متجدد AES-256"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: 12,
                borderRadius: 2,
                py: 2,
              }}
            />
            <Chip
              icon={<LocalParkingIcon sx={{ fontSize: 18 }} />}
              label="الحجز التفاعلي للمواقف مفعّل"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                fontWeight: 800,
                fontSize: 12,
                borderRadius: 2,
                py: 2,
              }}
            />
          </Stack>
        </Stack>

        {/* Global KPI Strip */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                حالة العضوية الأساسية
              </Typography>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                عضوية بلاتينية VIP نشطة
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                المواقف الشاغرة المتاحة للحجز
              </Typography>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.success.main }}>
                {slots.filter((s) => s.status === 'vacant').length} خانة شاغرة ومتاحة
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                تصاريح الزوار الصادرة السارية
              </Typography>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.info.main }}>
                {guestPasses.filter((p) => p.status === 'Active').length} تصريح نشط معتمد
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                البوابة الافتراضية للعبور
              </Typography>
              <Typography variant="h6" fontWeight={900} sx={{ color: theme.palette.warning.main }}>
                بوابة كبار الشخصيات VIP 03
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Navigation Tabs */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: alpha(theme.palette.background.paper, isDark ? 0.6 : 0.9),
            borderRadius: 4,
            p: 0.8,
            boxShadow: `0 8px 30px ${alpha('#000', isDark ? 0.4 : 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            '& .MuiTabs-indicator': {
              borderRadius: 3,
              height: '100%',
              bgcolor: alpha(theme.palette.primary.main, 0.18),
              border: `1.5px solid ${theme.palette.primary.main}`,
            },
          }}
        >
          <Tab
            icon={<BadgeIcon />}
            iconPosition="start"
            label="بطاقة العضوية الرقمية (المقيم / المشترك)"
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              zIndex: 1,
              borderRadius: 3,
              minHeight: 48,
              px: 3,
            }}
          />
          <Tab
            icon={<PersonAddIcon />}
            iconPosition="start"
            label="إنشاء دعوة زائر وحجز موقف مخصص"
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              zIndex: 1,
              borderRadius: 3,
              minHeight: 48,
              px: 3,
            }}
          />
          <Tab
            icon={<QrCode2Icon />}
            iconPosition="start"
            label={`سجل تصاريح ودعوات الزوار (${guestPasses.length})`}
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              zIndex: 1,
              borderRadius: 3,
              minHeight: 48,
              px: 3,
            }}
          />
        </Tabs>
      </Box>

      {/* ========================================================= */}
      {/* TAB 0: MEMBER DIGITAL PASS CARD (بطاقة العضوية الرقمية) */}
      {/* ========================================================= */}
      {activeTab === 0 && (
        <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
          <Grid item xs={12} md={5} lg={4.5}>
            {/* Holographic Cyber Card */}
            <Card
              sx={{
                width: '100%',
                borderRadius: '28px',
                background: `linear-gradient(135deg, ${alpha('#0B132B', 0.98)} 0%, ${alpha('#1C2541', 0.95)} 45%, ${alpha('#042F2E', 0.95)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.6)}`,
                boxShadow: `0 30px 80px ${alpha(theme.palette.primary.main, 0.3)}, inset 0 1px 2px rgba(255,255,255,0.3)`,
                p: { xs: 3, sm: 4 },
                position: 'relative',
                overflow: 'hidden',
                color: '#fff',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 36px 90px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              {/* Animated Light Shimmer Effect */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -60,
                  right: -60,
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.35)} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha('#FBBF24', 0.2)} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              {/* Card Header: Brand & Security Tier */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: theme.palette.success.main,
                        boxShadow: `0 0 10px ${theme.palette.success.main}`,
                      }}
                    />
                    <Typography
                      variant="overline"
                      sx={{ letterSpacing: 2, color: theme.palette.primary.main, fontWeight: 900, fontSize: 13 }}
                    >
                      منظومة كايان الذكية NRI
                    </Typography>
                  </Stack>
                  <Typography variant="h6" fontWeight={900} sx={{ color: '#F8FAFC' }}>
                    بطاقة العبور والعضوية البلاتينية VIP
                  </Typography>
                </Box>
                <NfcIcon sx={{ color: '#FBBF24', fontSize: 36, opacity: 0.9 }} />
              </Stack>

              {/* Simulated Golden RFID Chip & Hologram */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 40,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #FFE082 0%, #FFB300 50%, #FF8F00 100%)',
                    border: '1px solid #FFE57F',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2px',
                    p: '4px',
                  }}
                >
                  <Box sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.5 }} />
                  <Box sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.5 }} />
                  <Box sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.5 }} />
                  <Box sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.5 }} />
                </Box>

                <Chip
                  label="تصريح مؤمّن وموثوق"
                  size="small"
                  icon={<VerifiedUserIcon sx={{ fontSize: 16, color: '#34D399 !important' }} />}
                  sx={{
                    bgcolor: alpha('#34D399', 0.15),
                    color: '#34D399',
                    fontWeight: 800,
                    fontSize: 11,
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                  }}
                />
              </Stack>

              {/* High-Contrast QR Code Container */}
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#FFFFFF',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  my: 2,
                  boxShadow: '0 12px 35px rgba(0,0,0,0.45)',
                  position: 'relative',
                }}
              >
                <QRCodeSVG
                  value={qrToken}
                  size={190}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#0F172A"
                />
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
                  <TimerIcon sx={{ fontSize: 16, color: '#0F172A' }} />
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900, letterSpacing: 0.5 }}>
                    يتجدد الرمز تلقائياً خلال {qrCountdown} ثانية
                  </Typography>
                </Stack>
              </Box>

              {/* Plate preview right inside member card */}
              <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <SaudiRealisticPlate plateNumber={c.plateNumber} size="md" showBolts={true} interactive={false} />
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.15)' }} />

              {/* Member Details Matrix */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                    اسم العضو المشترك
                  </Typography>
                  <Typography variant="body2" fontWeight={900} sx={{ color: '#FFFFFF' }}>
                    {c.userName}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                    الخانة المخصصة الثابتة
                  </Typography>
                  <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                    القبو B1 • خانة VIP-01
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                    صلاحية البطاقة
                  </Typography>
                  <Typography variant="body2" fontWeight={800} sx={{ color: '#FCD34D' }}>
                    سارية حتى 31 ديسمبر 2026
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                    حالة البطاقة
                  </Typography>
                  <Typography variant="body2" fontWeight={900} sx={{ color: '#34D399' }}>
                    نشطة ومفعلة للدخول الفوري
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {/* Quick Actions under Card */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setQrToken('NRI-VIP-MANUAL-' + Date.now());
                  setQrCountdown(30);
                  setSnackbarNotice('تم تجديد الرمز الأمني المشفر وتحديث البوابات فورياً.');
                }}
                sx={{ fontWeight: 800, borderRadius: 3, flex: 1 }}
              >
                تحديث الرمز الآن
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<QrCodeScannerIcon />}
                onClick={() => {
                  const demoPass: GuestPassItem = {
                    id: 'member-pass',
                    guestName: c.userName,
                    phone: '+966501112233',
                    visitDate: '2026-10-01',
                    startTime: 'دخول دائم على مدار الساعة',
                    endTime: 'دخول دائم على مدار الساعة',
                    visitPurpose: 'عضو مقيم - اشتراك سنوي بلاتيني',
                    gateName: 'كافة بوابات المجمع الذكية',
                    plateNumber: c.plateNumber,
                    hasVehicle: true,
                    assignedSlot: {
                      id: 'VIP-01',
                      floorId: 'B1',
                      floorNameAr: 'القبو الأول (B1)',
                      slotNumber: 'VIP-01',
                      sectionAr: 'جناح كبار الشخصيات',
                      type: 'vip',
                      typeNameAr: 'موقف رئاسي دائم',
                      nearGateAr: 'بوابة كبار الشخصيات 03',
                    },
                    inviteCode: 'NRI-MBR-8899',
                    status: 'Active',
                    createdAt: '2026-10-01',
                    qrPayload: qrToken,
                  };
                  handleOpenScanner(demoPass);
                }}
                sx={{ fontWeight: 900, borderRadius: 3, flex: 1.2 }}
              >
                محاكاة مسح البوابة
              </Button>
            </Stack>
          </Grid>

          {/* Member Card Side Information & Benefits */}
          <Grid item xs={12} md={7} lg={7.5}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}
              >
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: '#FBBF24' }} /> مميزات وصلاحيات بطاقة العضوية الرقمية
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: theme.palette.primary.main, mb: 0.5 }}>
                        🚀 العبور التلقائي بدون توقف
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        تتعرف كاميرات LPR وحساسات RFID على لوحة المركبة أو رمز QR لفتح الحواجز تلقائياً خلال 0.4 ثانية.
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.08) }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: theme.palette.success.main, mb: 0.5 }}>
                        ⚡ شحن مجاني للسيارات الكهربائية
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        أولوية استخدام شواحن EV فائقة السرعة بقوة 150kW في كافة أدوار القبو مع إدارة ذكية للشحن.
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: theme.palette.info.main, mb: 0.5 }}>
                        🎫 إصدار تصاريح غير محدودة للزوار
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        إمكانية حجز مواقف شاغرة مسبقاً لضيوفك وأصدقائك وإرسال الدعوة مع رمز QR مشفر عبر واتساب.
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.08) }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: theme.palette.warning.main, mb: 0.5 }}>
                        📍 الإرشاد الداخلي الذكي للموقف
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ربط فوري مع خريطة الملاحة الداخلية وإضاءة خانة الموقف بلون مخصص عند وصولك للبوابة.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setActiveTab(1)}
                    sx={{ fontWeight: 800, borderRadius: 3, px: 3 }}
                  >
                    إصدار دعوة زائر الآن مع حجز موقف
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CREATE GUEST INVITE & INTERACTIVE SLOT RESERVATION (حجز الموقف والدعوة) */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Grid container spacing={3.5}>
          {/* Left Column: Form Details & Plate Preview */}
          <Grid item xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAddIcon sx={{ color: theme.palette.primary.main }} /> بيانات تصريح ودعوة الضيف
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                أدخل بيانات الضيف الكريم ولوحة المركبة، ثم اختر خانة الموقف الشاغرة من المخطط التفاعلي المجاور.
              </Typography>

              <Stack spacing={2.5}>
                {/* Guest Name */}
                <TextField
                  label="اسم الضيف الكريم / سعادة الأستاذ"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="مثال: سعادة الدكتور عبد الله بن صالح الشمري"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Guest Phone & International Country Code Picker */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                    transition: 'all 0.25s ease',
                  }}
                >
                  {/* Header & Quick Country Selectors */}
                  <Box sx={{ mb: 1.5 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                      spacing={1}
                      sx={{ mb: 1.2 }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={900}
                        sx={{
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        <PublicIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                        اختيار دولة الجوال (جميع الدول معتمدة ومصر متاحة لإرسال الواتساب):
                      </Typography>
                      <Chip
                        icon={<WhatsAppIcon sx={{ fontSize: '15px !important', color: '#25D366 !important' }} />}
                        label={`${activeCountry.flag} ${activeCountry.dialCode} ${activeCountry.countryEn}`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 900, fontSize: 11, direction: 'ltr' }}
                      />
                    </Stack>

                    {/* Quick Access Country Shortcuts */}
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{
                        overflowX: 'auto',
                        pb: 0.5,
                        flexWrap: 'nowrap',
                        scrollbarWidth: 'thin',
                        '&::-webkit-scrollbar': { height: 4 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: 2 },
                      }}
                    >
                      {QUICK_COUNTRY_SHORTCUTS.map((item) => {
                        const isSelected = selectedCountryId === item.id;
                        return (
                          <Chip
                            key={item.id}
                            label={`${item.flag} ${item.shortLabel} (${item.code})`}
                            size="small"
                            onClick={() => setSelectedCountryId(item.id)}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{
                              fontWeight: isSelected ? 900 : 700,
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.2s ease',
                              bgcolor: isSelected ? undefined : alpha(theme.palette.background.paper, 0.6),
                              borderColor: isSelected ? undefined : alpha(theme.palette.divider, 0.4),
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                              },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* Dual Grid: Country Dropdown + Phone Input */}
                  <Grid container spacing={1.5}>
                    {/* Country Selector Dropdown */}
                    <Grid item xs={12} sm={5} md={5}>
                      <TextField
                        select
                        fullWidth
                        label="دولة مفتاح الاتصال"
                        value={selectedCountryId}
                        onChange={(e) => setSelectedCountryId(e.target.value)}
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              sx: {
                                maxHeight: 380,
                                borderRadius: 3,
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                              },
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ fontSize: 20, lineHeight: 1 }}>{activeCountry.flag}</Typography>
                            </InputAdornment>
                          ),
                        }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <MenuItem
                            key={c.id}
                            value={c.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              py: 1.2,
                              gap: 1.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                              <Typography sx={{ fontSize: 22, lineHeight: 1 }}>{c.flag}</Typography>
                              <Box>
                                <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                                  {c.country}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                  {c.countryEn}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={c.dialCode}
                              size="small"
                              sx={{
                                fontWeight: 900,
                                fontSize: 11,
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: theme.palette.primary.main,
                                direction: 'ltr',
                              }}
                            />
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Guest Phone Input */}
                    <Grid item xs={12} sm={7} md={7}>
                      <TextField
                        label="رقم هاتف / جوال الضيف (واتساب)"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={`مثال: ${activeCountry.placeholder}`}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1,
                                  py: 0.4,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(theme.palette.success.main, 0.12),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                }}
                              >
                                <Typography sx={{ fontSize: 14 }}>{activeCountry.flag}</Typography>
                                <Typography
                                  variant="caption"
                                  fontWeight={900}
                                  sx={{ color: theme.palette.success.main, direction: 'ltr' }}
                                >
                                  {activeCountry.dialCode}
                                </Typography>
                              </Box>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="سيتم إرسال التصريح مباشرة عبر تطبيق WhatsApp إلى هذا الرقم">
                                <IconButton edge="end" sx={{ color: '#25D366' }}>
                                  <WhatsAppIcon />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                        helperText={
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              color: phone ? 'success.main' : 'text.secondary',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 0.3,
                            }}
                          >
                            💬 إرسال الواتساب إلى:{' '}
                            <Box
                              component="span"
                              sx={{ direction: 'ltr', display: 'inline-block', fontWeight: 900 }}
                            >
                              +{activeCountry.code}{' '}
                              {phone ? phone.trim().replace(/^0+/, '') : activeCountry.placeholder}
                            </Box>
                          </Typography>
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>


                {/* Visit Date & Time Windows */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="تاريخ الزيارة"
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="من الساعة"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="إلى الساعة"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                {/* Visit Purpose */}
                <TextField
                  select
                  label="الغرض من الزيارة"
                  value={visitPurpose}
                  onChange={(e) => setVisitPurpose(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="اجتماع عمل رسمي وزيارة تنفيذية">اجتماع عمل رسمي وزيارة تنفيذية</MenuItem>
                  <MenuItem value="زيارة شخصية واستضافة عائلية">زيارة شخصية واستضافة عائلية</MenuItem>
                  <MenuItem value="وفد استثماري وتجاري رفيع">وفد استثماري وتجاري رفيع</MenuItem>
                  <MenuItem value="صيانة تقنية وخدمات هندسية">صيانة تقنية وخدمات هندسية</MenuItem>
                  <MenuItem value="حضور مؤتمر / فعالية خاصة">حضور مؤتمر / فعالية خاصة</MenuItem>
                </TextField>

                {/* Gate Selection */}
                <TextField
                  select
                  label="بوابة الدخول المصرح بها والمقترحة"
                  value={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="بوابة كبار الشخصيات VIP 03">بوابة كبار الشخصيات VIP 03 (ممر سريع)</MenuItem>
                  <MenuItem value="بوابة الدخول الرئيسية 01">بوابة الدخول الرئيسية 01 (بهو الاستقبال)</MenuItem>
                  <MenuItem value="بوابة الشمال 04">بوابة الشمال 04 (قرب البرج الإداري)</MenuItem>
                  <MenuItem value="بوابة الدخول السفلية B2">بوابة الدخول السفلية B2 (مواقف القبو)</MenuItem>
                </TextField>

                <Divider sx={{ my: 1 }} />

                {/* Vehicle Plate Section */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsCarIcon sx={{ color: theme.palette.primary.main }} /> بيانات لوحة مركبة الضيف
                    </Typography>

                    <Button
                      size="small"
                      variant={hasVehicle ? 'text' : 'contained'}
                      color={hasVehicle ? 'primary' : 'inherit'}
                      onClick={() => setHasVehicle(!hasVehicle)}
                      sx={{ fontWeight: 800, fontSize: 12 }}
                    >
                      {hasVehicle ? 'الضيف يصل بدون مركبة؟' : 'إضافة مركبة للضيف'}
                    </Button>
                  </Stack>

                  {hasVehicle ? (
                    <Box>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <TextField
                            label="حروف اللوحة العربية"
                            value={plateLetters}
                            onChange={(e) => setPlateLetters(e.target.value)}
                            placeholder="مثال: ق و ل"
                            fullWidth
                            helperText="ثلاثة حروف مفصولة بمسافة"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="أرقام اللوحة"
                            value={plateDigits}
                            onChange={(e) => setPlateDigits(e.target.value)}
                            placeholder="مثال: 4001"
                            fullWidth
                            helperText="من رقم إلى 4 أرقام"
                          />
                        </Grid>
                      </Grid>

                      {/* Live Saudi Realistic Plate Preview */}
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.background.paper, isDark ? 0.3 : 0.8),
                          border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          معاينة اللوحة السعودية الرسمية المصرحة
                        </Typography>
                        <SaudiRealisticPlate
                          plateNumber={computedPlateNumber}
                          size="md"
                          showBolts={true}
                          interactive={false}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={800} sx={{ color: theme.palette.info.main }}>
                        🚶 وصول الضيف مشياً على الأقدام أو عبر سيارة أجرة / توصيل
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        سيتم إصدار تصريح الدخول عبر البوابات ومسارات المشاة الذكية مع الاحتفاظ بحجز الموقف.
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Selected Slot Summary Card */}
                {currentSelectedSlot && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      border: `1.5px solid ${theme.palette.success.main}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                      <Typography variant="subtitle2" fontWeight={900} sx={{ color: theme.palette.success.main }}>
                        الخانة المختارة للموقف: {currentSelectedSlot.floorNameAr} - خانة ({currentSelectedSlot.slotNumber})
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {currentSelectedSlot.sectionAr} • {currentSelectedSlot.typeNameAr} • {currentSelectedSlot.proximityToElevatorAr}
                    </Typography>
                  </Box>
                )}

                {/* Submit CTA */}
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleCreateInvite}
                  startIcon={<CheckIcon />}
                  sx={{
                    py: 1.8,
                    borderRadius: 3.5,
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  ✨ إصدار تصريح الدخول وحجز الموقف فوراً
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Right Column: INTERACTIVE PARKING SLOT PICKER (المخطط التفاعلي للخانات) */}
          <Grid item xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                position: 'relative',
              }}
            >
              {/* Slot Picker Header */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography variant="h5" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalParkingIcon sx={{ color: theme.palette.primary.main }} /> مخطط المواقف التفاعلي واختيار الخانة
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    انقر على أي خانة شاغرة (باللون الأخضر) لحجزها فورياً للضيف الكريم
                  </Typography>
                </Box>

                {/* Filter Selector */}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label="الكل"
                    clickable
                    color={slotFilter === 'ALL' ? 'primary' : 'default'}
                    onClick={() => setSlotFilter('ALL')}
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    label="الشاغر فقط"
                    clickable
                    color={slotFilter === 'VACANT' ? 'success' : 'default'}
                    onClick={() => setSlotFilter('VACANT')}
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    icon={<ElectricCarIcon sx={{ fontSize: 16 }} />}
                    label="شواحن EV"
                    clickable
                    color={slotFilter === 'EV' ? 'info' : 'default'}
                    onClick={() => setSlotFilter('EV')}
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    icon={<StarIcon sx={{ fontSize: 16 }} />}
                    label="VIP"
                    clickable
                    color={slotFilter === 'VIP' ? 'warning' : 'default'}
                    onClick={() => setSlotFilter('VIP')}
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>
              </Stack>

              {/* Floor Switcher Buttons */}
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {[
                  { id: 'G', label: 'الدور الأرضي (G)', desc: 'بهو الزوار والاستقبال' },
                  { id: 'B1', label: 'القبو الأول (B1)', desc: 'كبار الشخصيات والخدمات' },
                  { id: 'B2', label: 'القبو الثاني (B2)', desc: 'المواقف العامة وشواحن EV' },
                  { id: 'VIP', label: 'جناح VIP الملكي', desc: 'الأجنحة الرئاسية الخاصة' },
                ].map((floor) => {
                  const isSelected = selectedFloor === floor.id;
                  const stats = floorCounts[floor.id] || { total: 0, vacant: 0 };
                  return (
                    <Grid item xs={6} sm={3} key={floor.id}>
                      <Box
                        onClick={() => setSelectedFloor(floor.id as any)}
                        sx={{
                          p: 1.8,
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, 0.18)
                            : alpha(theme.palette.background.paper, isDark ? 0.3 : 0.6),
                          border: isSelected
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          boxShadow: isSelected
                            ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`
                            : 'none',
                          textAlign: 'center',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={900} sx={{ color: isSelected ? theme.palette.primary.main : 'text.primary' }}>
                          {floor.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 11, mb: 0.5 }}>
                          {floor.desc}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${stats.vacant} شاغر متاح`}
                          sx={{
                            height: 20,
                            fontSize: 10,
                            fontWeight: 800,
                            bgcolor: stats.vacant > 0 ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.error.main, 0.15),
                            color: stats.vacant > 0 ? theme.palette.success.main : theme.palette.error.main,
                          }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Status Indicator Legend */}
              <Stack direction="row" spacing={2} sx={{ mb: 2.5 }} flexWrap="wrap" justifyContent="center">
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                  <Typography variant="caption" fontWeight={700}>شاغر ومتاح للاختيار</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: '#EF4444' }} />
                  <Typography variant="caption" fontWeight={700}>مشغول بمركبة</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: '#F59E0B' }} />
                  <Typography variant="caption" fontWeight={700}>محجوز لتصريح مسبق</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <ElectricCarIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                  <Typography variant="caption" fontWeight={700}>مزود بشاحن كهربائي EV</Typography>
                </Stack>
              </Stack>

              {/* Visual Parking Driveway Canvas */}
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 4,
                  bgcolor: isDark ? '#0A0F1D' : '#F1F5F9',
                  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Asphalt Lane Markings */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: 2,
                    borderTop: '2px dashed rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Slots Grid */}
                <Grid container spacing={2}>
                  {floorSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const isVacant = slot.status === 'vacant';
                    const isOccupied = slot.status === 'occupied';
                    const isReserved = slot.status === 'reserved';

                    let borderColor = 'rgba(255, 255, 255, 0.1)';
                    let bgColor = alpha(theme.palette.background.paper, 0.3);
                    let statusLabel = 'شاغر متاح';

                    if (isVacant) {
                      borderColor = isSelected ? '#10B981' : alpha('#10B981', 0.4);
                      bgColor = isSelected ? alpha('#10B981', 0.25) : alpha('#10B981', 0.08);
                      statusLabel = 'شاغر ومتاح للنقر';
                    } else if (isOccupied) {
                      borderColor = alpha('#EF4444', 0.4);
                      bgColor = alpha('#EF4444', 0.08);
                      statusLabel = 'مشغول بمركبة';
                    } else if (isReserved) {
                      borderColor = alpha('#F59E0B', 0.4);
                      bgColor = alpha('#F59E0B', 0.08);
                      statusLabel = 'محجوز مسبقاً';
                    }

                    return (
                      <Grid item xs={6} sm={4} md={3} key={slot.id}>
                        <Tooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography variant="subtitle2" fontWeight={800}>{slot.slotNumber} - {slot.sectionAr}</Typography>
                              <Typography variant="caption" display="block">{slot.typeNameAr}</Typography>
                              <Typography variant="caption" display="block">{slot.proximityToElevatorAr}</Typography>
                              {isOccupied && slot.occupiedPlate && (
                                <Typography variant="caption" sx={{ color: '#F87171' }} display="block">
                                  المركبة الحالية: {slot.occupiedPlate}
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: isVacant ? '#34D399' : '#FBBF24', fontWeight: 700 }} display="block">
                                الحالة: {statusLabel}
                              </Typography>
                            </Box>
                          }
                          arrow
                        >
                          <Box
                            onClick={() => {
                              if (isVacant) {
                                setSelectedSlotId(slot.id);
                                setSnackbarNotice(`تم تحديد الخانة (${slot.slotNumber}) بنجاح.`);
                              } else {
                                setSnackbarNotice(`الخانة (${slot.slotNumber}) غير متاحة حالياً لأنها ${isOccupied ? 'مشغولة بمركبة' : 'محجوزة'}.`);
                              }
                            }}
                            sx={{
                              p: 1.8,
                              borderRadius: 3,
                              border: `2px solid ${borderColor}`,
                              bgcolor: bgColor,
                              cursor: isVacant ? 'pointer' : 'not-allowed',
                              position: 'relative',
                              transition: 'all 0.25s ease',
                              textAlign: 'center',
                              boxShadow: isSelected
                                ? `0 0 20px ${alpha('#10B981', 0.6)}, inset 0 0 10px ${alpha('#10B981', 0.3)}`
                                : 'none',
                              transform: isSelected ? 'scale(1.04)' : 'none',
                              '&:hover': isVacant
                                ? {
                                    transform: 'scale(1.05)',
                                    borderColor: '#10B981',
                                    boxShadow: `0 8px 24px ${alpha('#10B981', 0.3)}`,
                                  }
                                : {},
                            }}
                          >
                            {/* Selected Badge Ring */}
                            {isSelected && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  bgcolor: '#10B981',
                                  color: '#fff',
                                  display: 'grid',
                                  placeItems: 'center',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                }}
                              >
                                <CheckIcon sx={{ fontSize: 16 }} />
                              </Box>
                            )}

                            {/* Slot Type Icon */}
                            <Box sx={{ mb: 0.5 }}>
                              {slot.type === 'ev' ? (
                                <ElectricCarIcon sx={{ fontSize: 24, color: '#38BDF8' }} />
                              ) : slot.type === 'vip' ? (
                                <StarIcon sx={{ fontSize: 24, color: '#FBBF24' }} />
                              ) : slot.type === 'accessible' ? (
                                <AccessibleIcon sx={{ fontSize: 24, color: '#A78BFA' }} />
                              ) : (
                                <LocalParkingIcon
                                  sx={{
                                    fontSize: 24,
                                    color: isVacant ? '#10B981' : isOccupied ? '#EF4444' : '#F59E0B',
                                  }}
                                />
                              )}
                            </Box>

                            {/* Slot Code */}
                            <Typography variant="subtitle1" fontWeight={900} sx={{ letterSpacing: 0.5 }}>
                              {slot.slotNumber}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                fontSize: 10,
                                display: 'block',
                                color: isVacant ? '#10B981' : isOccupied ? '#EF4444' : '#F59E0B',
                              }}
                            >
                              {isVacant ? 'متاح شاغر' : isOccupied ? 'مشغول' : 'محجوز'}
                            </Typography>

                            {/* Distance to elevator */}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: 9, display: 'block', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {slot.proximityToElevatorAr}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Informational Guidance */}
              <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ElevatorIcon sx={{ color: theme.palette.info.main }} />
                  تلميح ذكي: خانات القبو B1 وخانات VIP مزودة بمصاعد رئاسية فائقة السرعة تنقل الضيف مباشرة إلى بهو الاستقبال الرئيسي وصالات الاجتماعات.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ISSUED GUEST PASSES DIRECTORY (سجل التصاريح والدعوات الصادرة) */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Stack spacing={3}>
          {/* Search & Filter Toolbar */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
              <TextField
                placeholder="ابحث باسم الضيف، رقم اللوحة، رقم الخانة، أو كود التصريح..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: '100%', md: 450 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label="كافة التصاريح"
                  clickable
                  color={passFilter === 'ALL' ? 'primary' : 'default'}
                  onClick={() => setPassFilter('ALL')}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label="سارية ومفعلة"
                  clickable
                  color={passFilter === 'Active' ? 'success' : 'default'}
                  onClick={() => setPassFilter('Active')}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label="تم الدخول والاستخدام"
                  clickable
                  color={passFilter === 'Used' ? 'info' : 'default'}
                  onClick={() => setPassFilter('Used')}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Guest Passes Grid */}
          <Grid container spacing={3}>
            {guestPasses
              .filter((p) => {
                if (passFilter !== 'ALL' && p.status !== passFilter) return false;
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  p.guestName.toLowerCase().includes(q) ||
                  p.plateNumber.toLowerCase().includes(q) ||
                  p.inviteCode.toLowerCase().includes(q) ||
                  p.assignedSlot.slotNumber.toLowerCase().includes(q)
                );
              })
              .map((pass) => (
                <Grid item xs={12} md={6} lg={4} key={pass.id}>
                  <Card
                    sx={{
                      p: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      ...glassPanel({ borderRadius: 4 }, theme.palette.mode),
                      border: `1.5px solid ${pass.status === 'Active' ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.divider, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    }}
                  >
                    {/* Status Ribbon */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Chip
                        label={pass.inviteCode}
                        size="small"
                        sx={{ fontWeight: 900, letterSpacing: 1, bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main }}
                      />
                      <Chip
                        label={pass.status === 'Active' ? 'سارٍ ومفعل' : pass.status === 'Used' ? 'تم الدخول' : 'منتهي الصلاحية'}
                        size="small"
                        color={pass.status === 'Active' ? 'success' : pass.status === 'Used' ? 'info' : 'default'}
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>

                    {/* Guest Name & Purpose */}
                    <Typography variant="h6" fontWeight={900} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                      {pass.guestName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 2 }}>
                      {pass.visitPurpose}
                    </Typography>

                    {/* Plate Display */}
                    {pass.hasVehicle && pass.plateNumber !== 'دخول مشاة بدون مركبة' ? (
                      <Box sx={{ my: 1.5, display: 'flex', justifyContent: 'center' }}>
                        <SaudiRealisticPlate plateNumber={pass.plateNumber} size="sm" showBolts={false} interactive={false} />
                      </Box>
                    ) : (
                      <Box sx={{ p: 1, my: 1, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight={800} sx={{ color: theme.palette.info.main }}>
                          🚶 دخول مشاة / تاكسي بدون مركبة
                        </Typography>
                      </Box>
                    )}

                    {/* Slot & Gate Details */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        my: 2,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.8),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            الخانة المحجوزة
                          </Typography>
                          <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                            {pass.assignedSlot.floorNameAr} ({pass.assignedSlot.slotNumber})
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            البوابة المصرحة
                          </Typography>
                          <Typography variant="body2" fontWeight={800}>
                            {pass.gateName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            موعد وصلاحية الزيارة
                          </Typography>
                          <Typography variant="body2" fontWeight={800} sx={{ color: theme.palette.warning.main }}>
                            {pass.visitDate} • من {pass.startTime} إلى {pass.endTime}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.75, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.4)}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                              رقم جوال الضيف (واتساب)
                            </Typography>
                            <Chip
                              icon={<WhatsAppIcon sx={{ fontSize: '14px !important', color: '#25D366 !important' }} />}
                              label={pass.phone}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 800,
                                fontSize: 11,
                                direction: 'ltr',
                                borderColor: alpha(theme.palette.success.main, 0.4),
                                bgcolor: alpha(theme.palette.success.main, 0.06),
                              }}
                            />
                          </Stack>
                        </Grid>
                      </Grid>

                    </Paper>

                    {/* Pass Action Buttons */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<BadgeIcon />}
                        onClick={() => setViewPassModal(pass)}
                        sx={{ fontWeight: 800, flex: 1, borderRadius: 2.5 }}
                      >
                        معاينة البطاقة
                      </Button>
                      <Tooltip title="إرسال ومشاركة عبر واتساب">
                        <IconButton
                          color="success"
                          onClick={() => handleShareWhatsApp(pass)}
                          sx={{ bgcolor: alpha('#25D366', 0.15), '&:hover': { bgcolor: alpha('#25D366', 0.25) } }}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="محاكاة مسح البوابة الذكية">
                        <IconButton
                          color="info"
                          onClick={() => handleOpenScanner(pass)}
                          sx={{ bgcolor: alpha(theme.palette.info.main, 0.15) }}
                        >
                          <QrCodeScannerIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Stack>
      )}

      {/* ========================================================================= */}
      {/* 4. FULL GUEST PASS PREVIEW & DOWNLOAD MODAL (نافذة بطاقة الدعوة والتصريح) */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(viewPassModal)}
        onClose={() => setViewPassModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: isDark ? '#0B132B' : '#FFFFFF',
            backgroundImage: 'none',
            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            boxShadow: `0 30px 90px ${alpha(theme.palette.primary.main, 0.35)}`,
            overflow: 'hidden',
          },
        }}
      >
        {viewPassModal && (
          <>
            <DialogTitle
              sx={{
                p: 2.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <VerifiedUserIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={900}>
                    بطاقة تصريح دخول زائر معتمد - مجمع كايان الذكي
                  </Typography>
                </Stack>
                <IconButton onClick={() => setViewPassModal(null)} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              {/* PRINTABLE PASS BADGE AREA */}
              <Box
                id="printable-guest-pass"
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 4,
                  background: `linear-gradient(145deg, ${alpha('#1E293B', 0.95)} 0%, ${alpha('#0F172A', 0.98)} 100%)`,
                  color: '#FFFFFF',
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'center',
                }}
              >
                {/* Official Crest & Header */}
                <Typography variant="overline" sx={{ letterSpacing: 2, color: theme.palette.primary.main, fontWeight: 900, fontSize: 13 }}>
                  المملكة العربية السعودية • مجمع كايان الذكي للمواقف NRI
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#F8FAFC', mb: 2 }}>
                  تصريح دخول رسمي وضيافة معتمدة
                </Typography>

                {/* Guest Name High-Impact */}
                <Box sx={{ p: 1.5, my: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.15) }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    اسم الضيف الكريم المصرح له
                  </Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ color: '#FFFFFF' }}>
                    {viewPassModal.guestName}
                  </Typography>
                </Box>

                {/* Plate Display */}
                {viewPassModal.hasVehicle && viewPassModal.plateNumber !== 'دخول مشاة بدون مركبة' && (
                  <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                    <SaudiRealisticPlate plateNumber={viewPassModal.plateNumber} size="md" showBolts={true} interactive={false} />
                  </Box>
                )}

                {/* QR Code */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#FFFFFF',
                    borderRadius: 3.5,
                    display: 'inline-block',
                    my: 2,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                  }}
                >
                  <QRCodeSVG value={viewPassModal.qrPayload} size={170} level="H" includeMargin={false} />
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900, display: 'block', mt: 1 }}>
                    امسح الرمز عند قارئ البوابة لفتح الحاجز تلقائياً
                  </Typography>
                </Box>

                {/* All Detailed Visitor Information */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mt: 2,
                    borderRadius: 3,
                    bgcolor: alpha('#FFFFFF', 0.08),
                    border: '1px solid rgba(255,255,255,0.15)',
                    textAlign: 'right',
                  }}
                >
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        الموقف والخانة المحجوزة
                      </Typography>
                      <Typography variant="body2" fontWeight={900} sx={{ color: theme.palette.primary.main }}>
                        {viewPassModal.assignedSlot.floorNameAr} - خانة ({viewPassModal.assignedSlot.slotNumber})
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        بوابة الدخول المصرحة
                      </Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {viewPassModal.gateName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        تاريخ الزيارة
                      </Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {viewPassModal.visitDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        فترة الصلاحية
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#FCD34D' }}>
                        من {viewPassModal.startTime} إلى {viewPassModal.endTime}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        الغرض من الزيارة
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {viewPassModal.visitPurpose}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        رقم هاتف الضيف المعتمد (WhatsApp)
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#34D399', direction: 'ltr', textAlign: 'right' }}>
                        {viewPassModal.phone} 💬
                      </Typography>
                    </Grid>
                  </Grid>

                </Paper>

                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 2 }}>
                  رمز التصريح الأمني: {viewPassModal.inviteCode} • منظومة الرصد والتحكم الذكي بمجمع كايان
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.paper, 0.4), gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handlePrintPass}
                sx={{ fontWeight: 800, borderRadius: 2.5 }}
              >
                تحميل / طباعة التصريح
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon />}
                onClick={() => handleShareWhatsApp(viewPassModal)}
                sx={{ fontWeight: 800, borderRadius: 2.5 }}
              >
                إرسال عبر واتساب
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<QrCodeScannerIcon />}
                onClick={() => {
                  handleOpenScanner(viewPassModal);
                }}
                sx={{ fontWeight: 800, borderRadius: 2.5 }}
              >
                محاكاة مسح البوابة
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* 5. GATE SCANNER SIMULATION MODAL (محاكاة قارئ البوابة الذكية والتعرف) */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(scannerModal)}
        onClose={() => setScannerModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            bgcolor: '#0A0F1D',
            color: '#FFFFFF',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.6)}`,
            boxShadow: `0 30px 100px ${alpha(theme.palette.primary.main, 0.4)}`,
            overflow: 'hidden',
          },
        }}
      >
        {scannerModal && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <SensorDoorIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      محاكي كاميرا وقارئ البوابة الذكية (Gate Scanner Simulation)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      نظام التحقق اللحظي عبر قارئ QR وكاميرات التعرف على لوحات السيارات LPR
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setScannerModal(null)} sx={{ color: '#fff' }}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 4, textAlign: 'center' }}>
              {scannerStep === 'scanning' ? (
                <Box sx={{ py: 4 }}>
                  <Box
                    sx={{
                      width: 140,
                      height: 140,
                      mx: 'auto',
                      borderRadius: 4,
                      border: `3px solid ${theme.palette.primary.main}`,
                      display: 'grid',
                      placeItems: 'center',
                      position: 'relative',
                      boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}`,
                    }}
                  >
                    <QrCodeScannerIcon sx={{ fontSize: 72, color: theme.palette.primary.main }} />
                    {/* Animated scanning laser line */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: '#EF4444',
                        boxShadow: '0 0 12px #EF4444',
                        animation: 'scanLaser 1.5s infinite alternate ease-in-out',
                        '@keyframes scanLaser': {
                          '0%': { top: '10%' },
                          '100%': { top: '90%' },
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ mt: 3, color: '#38BDF8' }}>
                    جارٍ فحص رمز الاستجابة ومطابقة لوحة المركبة بكاميرا LPR...
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    التصريح: {scannerModal.inviteCode} • البوابة: {scannerModal.gateName}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ py: 2 }}>
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      mx: 'auto',
                      borderRadius: '50%',
                      bgcolor: alpha('#10B981', 0.2),
                      border: '3px solid #10B981',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 0 30px #10B981',
                      mb: 2,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 56, color: '#10B981' }} />
                  </Box>

                  <Typography variant="h5" fontWeight={900} sx={{ color: '#10B981', mb: 1 }}>
                    تم التحقق بنجاح ومصادقة الدخول!
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E2E8F0', fontWeight: 700, mb: 3 }}>
                    مرحباً بكم سعادة الضيف: {scannerModal.guestName}
                  </Typography>

                  {/* Recognition Match Matrix */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3.5,
                      bgcolor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      textAlign: 'right',
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          تطابق كاميرا LPR للوحة
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#10B981' }}>
                          مطابقة مؤكدة بنسبة 99.8%
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                          {scannerModal.plateNumber}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          الموقف المحجوز المخصص
                        </Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ color: '#FCD34D' }}>
                          {scannerModal.assignedSlot.floorNameAr} - ({scannerModal.assignedSlot.slotNumber})
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {scannerModal.assignedSlot.sectionAr}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                          <SensorDoorIcon sx={{ color: '#10B981' }} />
                          <Typography variant="body2" fontWeight={900} sx={{ color: '#10B981' }}>
                            تم رفع الحاجز الإلكتروني الهيدروليكي للبوابة تلقائياً - تفضل بالدخول
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setScannerModal(null)}
                sx={{ fontWeight: 800, borderRadius: 2.5, px: 3, mx: 'auto' }}
              >
                إغلاق المحاكاة ومتابعة النظام
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Global Snackbar Notification */}
      <Snackbar
        open={Boolean(snackbarNotice)}
        autoHideDuration={4000}
        onClose={() => setSnackbarNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarNotice(null)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 800, borderRadius: 3, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
        >
          {snackbarNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export default DigitalCardPage;
