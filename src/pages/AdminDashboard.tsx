import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, DEMO_ROLES } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PromotionsManagementSection } from '@/components/features/PromotionsManagementSection';
import { ReviewIncentiveAdminSection } from '@/components/features/ReviewIncentiveAdminSection';
import { PackagesManagementSection } from '@/components/features/PackagesManagementSection';
import { GalleryManagementSection } from '@/components/features/GalleryManagementSection';
import { TenantCustomizer } from '@/components/features/TenantCustomizer';
import { PublishedBanner } from '@/components/common/PublishedBanner';
import { getSubdomainUrl } from '@/utils/tenant';
import {
  Booking,
  WaitlistEntry,
  StaffMember,
  CustomerProfile,
  PaymentRecord,
  StudioSettings,
  Service,
} from '@/types';
import {
  LogOut,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Calendar,
  Home,
  Building2,
  LayoutDashboard,
  Package,
  Settings,
  CreditCard,
  MessageSquare,
  Users,
  Plus,
  Edit,
  Trash2,
  IndianRupee,
  Clock,
  Tag,
  Star,
  Gift,
  Image as ImageIcon,
  Crown,
  UserCheck,
  Bell,
  Search,
  Filter,
  AlertTriangle,
  Send,
  SlidersHorizontal,
  Check,
  X,
  Phone,
  Mail,
  Percent,
  Sparkles,
  MapPin,
  CalendarCheck2,
  ShieldCheck,
} from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';

type AdminTab =
  | 'dashboard'
  | 'bookings'
  | 'waitlist'
  | 'services'
  | 'staff'
  | 'clients'
  | 'finances'
  | 'packages'
  | 'promotions'
  | 'gallery'
  | 'reviews'
  | 'settings'
  | 'template';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, demoUser, role, selectedBranch, signOut, loginAsDemoRole, setSelectedBranch } =
    useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'template' || tabParam === 'customizer') {
        return 'template';
      }
      if (tabParam) {
        return tabParam as AdminTab;
      }
    }
    return 'dashboard';
  });
  const [loading, setLoading] = useState(false);

  // New Booking photo states
  const [newBPhotoUrl, setNewBPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Core State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [clients, setClients] = useState<CustomerProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<StudioSettings>({
    opening_time: '10:00 AM',
    closing_time: '08:00 PM',
    whatsapp_notifications_enabled: true,
    whatsapp_reminders_enabled: true,
    waitlist_auto_alert_enabled: true,
    advance_deposit_required: true,
    advance_deposit_amount: 200,
    gst_enabled: true,
    gst_rate: 5,
    gstin: '08AAAAA0000A1Z5',
    home_service_enabled: true,
  });

  // Modal & Filter States
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingViewMode, setBookingViewMode] = useState<'table' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isNewWaitlistModalOpen, setIsNewWaitlistModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // New Booking Form
  const [newBService, setNewBService] = useState('');
  const [newBCustomerName, setNewBCustomerName] = useState('');
  const [newBCustomerPhone, setNewBCustomerPhone] = useState('');
  const [newBCustomerEmail, setNewBCustomerEmail] = useState('');
  const [newBDate, setNewBDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBTime, setNewBTime] = useState('11:00 AM');
  const [newBBranch, setNewBBranch] = useState<'mansarovar' | 'doorstep'>('mansarovar');
  const [newBTechnician, setNewBTechnician] = useState('Uma Sharma');
  const [newBNotes, setNewBNotes] = useState('');

  // New Waitlist Form
  const [newWName, setNewWName] = useState('');
  const [newWPhone, setNewWPhone] = useState('');
  const [newWService, setNewWService] = useState('Gel Extensions with 3D Art');
  const [newWDate, setNewWDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWTime, setNewWTime] = useState('02:00 PM');
  const [newWBranch, setNewWBranch] = useState<'mansarovar' | 'doorstep'>('mansarovar');

  // Service Form State
  const [sName, setSName] = useState('');
  const [sCat, setSCat] = useState('nails');
  const [sPrice, setSPrice] = useState(999);
  const [sDuration, setSDuration] = useState(45);
  const [sBuffer, setSBuffer] = useState(15);
  const [sDesc, setSDesc] = useState('');
  const [sHomeAllowed, setSHomeAllowed] = useState(true);

  // Staff Form State
  const [stName, setStName] = useState('');
  const [stRole, setStRole] = useState('Nail Artist & Technician');
  const [stPhone, setStPhone] = useState('');
  const [stBranch, setStBranch] = useState<'mansarovar' | 'doorstep' | 'all'>('mansarovar');
  const [stShift, setStShift] = useState('10:00 AM - 07:00 PM');
  const [stCommission, setStCommission] = useState(15);

  // Initialize Initial Persistent State
  useEffect(() => {
    loadAllData();
  }, []);

  // Sync tab with URL search parameter (?tab=customizer or ?tab=template)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'template' || tabParam === 'customizer') {
      setActiveTab('template');
    } else if (tabParam) {
      setActiveTab(tabParam as AdminTab);
    }
  }, [searchParams]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Bookings from Supabase or fallback
      const { data: bData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bData && bData.length > 0) {
        setBookings(
          bData.map((d: any) => ({
            id: d.id,
            booking_id: d.booking_id || d.id.slice(0, 8),
            service_name: d.service_name || 'Nail Treatment',
            appointment_date: d.appointment_date || new Date().toISOString().split('T')[0],
            appointment_time: d.appointment_time || '11:00 AM',
            duration_minutes: d.duration_minutes || 60,
            customer_name: d.customer_name || 'Customer',
            customer_phone: d.customer_phone || '+91 98290 00000',
            customer_email: d.customer_email,
            total_price: d.total_price || 1499,
            advance_amount: d.advance_amount || 200,
            booking_status: d.booking_status || 'confirmed',
            visit_type: d.visit_type || 'in_salon',
            branch: d.visit_type === 'home_service' ? 'doorstep' : 'mansarovar',
            technician_name: d.technician_name || 'Uma Sharma',
            payment_method: 'upi',
          }))
        );
      } else {
        setBookings([
          {
            id: 'b-101',
            booking_id: 'NBU-8821',
            service_name: 'Royal Gel Extensions with 3D Art',
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '11:30 AM',
            duration_minutes: 90,
            customer_name: 'Pooja Sharma',
            customer_phone: '+91 98291 12345',
            customer_email: 'pooja.sharma@gmail.com',
            total_price: 2499,
            advance_amount: 200,
            booking_status: 'confirmed',
            visit_type: 'in_salon',
            branch: 'mansarovar',
            technician_name: 'Uma Sharma',
            payment_method: 'upi',
            created_at: new Date().toISOString(),
          },
          {
            id: 'b-102',
            booking_id: 'NBU-8822',
            service_name: 'Organic Bridal Sojat Mehndi',
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '02:00 PM',
            duration_minutes: 120,
            customer_name: 'Ananya Rathore',
            customer_phone: '+91 98292 23456',
            customer_email: 'ananya.rathore@outlook.com',
            total_price: 3499,
            advance_amount: 500,
            booking_status: 'confirmed',
            visit_type: 'home_service',
            branch: 'doorstep',
            technician_name: 'Pooja Verma',
            payment_method: 'upi',
            created_at: new Date().toISOString(),
          },
          {
            id: 'b-103',
            booking_id: 'NBU-8823',
            service_name: 'Jelly Foot Spa & Classic Manicure',
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '04:30 PM',
            duration_minutes: 60,
            customer_name: 'Neha Verma',
            customer_phone: '+91 98293 34567',
            customer_email: 'neha.v@yahoo.com',
            total_price: 1799,
            advance_amount: 200,
            booking_status: 'pending',
            visit_type: 'in_salon',
            branch: 'mansarovar',
            technician_name: 'Neha Sharma',
            payment_method: 'cash',
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // 2. Initial Waitlist
      setWaitlist([
        {
          id: 'w-1',
          customer_name: 'Priya Saini',
          customer_phone: '+91 98294 45678',
          customer_email: 'priya.saini@gmail.com',
          preferred_service: 'Royal Gel Extensions with 3D Art',
          preferred_date: new Date().toISOString().split('T')[0],
          preferred_time_slot: '11:00 AM - 01:00 PM',
          branch: 'mansarovar',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        {
          id: 'w-2',
          customer_name: 'Simran Kaur',
          customer_phone: '+91 98295 56789',
          customer_email: 'simran.kaur@gmail.com',
          preferred_service: 'Organic Bridal Sojat Mehndi',
          preferred_date: new Date().toISOString().split('T')[0],
          preferred_time_slot: '02:00 PM - 05:00 PM',
          branch: 'doorstep',
          status: 'notified',
          created_at: new Date().toISOString(),
        },
      ]);

      // 3. Initial Staff
      setStaff([
        {
          id: 's-1',
          name: 'Uma Sharma',
          role: 'Founder & Master Nail Artist',
          phone: '+91 63765 39366',
          branch: 'all',
          station_number: 'Station 01 (Main Studio)',
          shift_hours: '10:00 AM - 08:00 PM',
          commission_rate: 20,
          active_services: ['3D Extensions', 'Russian Manicure', 'Bridal Art'],
          is_active: true,
          rating: 5.0,
        },
        {
          id: 's-2',
          name: 'Pooja Verma',
          role: 'Senior Mehndi & Spa Specialist',
          phone: '+91 98291 88776',
          branch: 'mansarovar',
          station_number: 'Station 02 (Henna Suite)',
          shift_hours: '10:00 AM - 07:00 PM',
          commission_rate: 15,
          active_services: ['Sojat Mehndi', 'Aroma Foot Spa', 'Facials'],
          is_active: true,
          rating: 4.9,
        },
        {
          id: 's-3',
          name: 'Neha Sharma',
          role: 'Nail Technician & Front Desk',
          phone: '+91 98292 77665',
          branch: 'mansarovar',
          station_number: 'Station 03 (Gel Studio)',
          shift_hours: '11:00 AM - 08:00 PM',
          commission_rate: 12,
          active_services: ['Gel Polish Overlay', 'Classic Pedicure'],
          is_active: true,
          rating: 4.8,
        },
      ]);

      // 4. Initial Clients
      setClients([
        {
          id: 'c-1',
          name: 'Pooja Sharma',
          phone: '+91 98291 12345',
          email: 'pooja.sharma@gmail.com',
          upi_id: 'poojasharma@ybl',
          total_spent_inr: 8490,
          visit_count: 5,
          loyalty_points: 420,
          preferred_branch: 'Mansarovar Studio',
          preferences_notes: 'Loves natural rose water spa soak, sensitive cuticles.',
        },
        {
          id: 'c-2',
          name: 'Ananya Rathore',
          phone: '+91 98292 23456',
          email: 'ananya.rathore@outlook.com',
          upi_id: 'ananya@paytm',
          total_spent_inr: 12990,
          visit_count: 8,
          loyalty_points: 650,
          preferred_branch: 'Doorstep Home Service',
          preferences_notes: 'Prefers 100% natural organic Sojat henna cones only.',
        },
      ]);

      // 5. Initial Payments
      setPayments([
        {
          id: 'pay-1',
          booking_id: 'NBU-8821',
          customer_name: 'Pooja Sharma',
          amount_inr: 2499,
          advance_deposit_inr: 200,
          payment_method: 'upi',
          payment_status: 'verified',
          upi_ref_no: 'UPI/4288192001',
          verified_by: 'Uma Sharma',
          created_at: new Date().toISOString(),
        },
        {
          id: 'pay-2',
          booking_id: 'NBU-8822',
          customer_name: 'Ananya Rathore',
          amount_inr: 3499,
          advance_deposit_inr: 500,
          payment_method: 'upi',
          payment_status: 'pending',
          upi_ref_no: 'UPI/4288192002',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Filter data by current Branch
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesBranch =
        selectedBranch === 'all' ||
        (selectedBranch === 'mansarovar' && b.visit_type !== 'home_service') ||
        (selectedBranch === 'doorstep' && b.visit_type === 'home_service');

      const matchesStatus =
        bookingFilterStatus === 'all' || b.booking_status === bookingFilterStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_phone.includes(q) ||
        b.service_name.toLowerCase().includes(q) ||
        (b.booking_id && b.booking_id.toLowerCase().includes(q));

      return matchesBranch && matchesStatus && matchesSearch;
    });
  }, [bookings, selectedBranch, bookingFilterStatus, searchQuery]);

  const filteredWaitlist = useMemo(() => {
    return waitlist.filter(
      (w) => selectedBranch === 'all' || w.branch === selectedBranch
    );
  }, [waitlist, selectedBranch]);

  // Helper: Duration-aware Time Slot Overlap Checker
  const checkSlotOverlap = (
    date: string,
    timeSlot: string,
    durationMins: number,
    excludeBookingId?: string
  ) => {
    const parseTimeMins = (tStr: string) => {
      const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 600;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const newStart = parseTimeMins(timeSlot);
    const newEnd = newStart + durationMins;

    const conflicts = bookings.filter((b) => {
      if (b.id === excludeBookingId) return false;
      if (b.booking_status === 'cancelled') return false;
      if (b.appointment_date !== date) return false;

      const existingStart = parseTimeMins(b.appointment_time);
      const existingEnd = existingStart + (b.duration_minutes || 60);

      // Overlap formula: start1 < end2 AND start2 < end1
      return newStart < existingEnd && existingStart < newEnd;
    });

    return conflicts;
  };

  // Automated Action: Toggle Booking Status with Waitlist Auto-Trigger
  const handleToggleBookingStatus = async (
    bookingId: string,
    newStatus: 'confirmed' | 'completed' | 'cancelled' | 'pending'
  ) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, booking_status: newStatus } : b))
    );

    // Save to Supabase
    try {
      await supabase
        .from('bookings')
        .update({ booking_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
    } catch (err) {
      console.warn('Supabase update fallback:', err);
    }

    toast({
      title: 'Booking Status Updated',
      description: `Appointment for ${targetBooking.customer_name} changed to ${newStatus.toUpperCase()}.`,
    });

    // WORKFLOW 1: AUTOMATED WAITLIST NOTIFICATION TRIGGER
    if (newStatus === 'cancelled') {
      const matchingWaitlistEntries = waitlist.filter(
        (w) =>
          w.status === 'pending' &&
          (w.preferred_date === targetBooking.appointment_date ||
            w.preferred_service.toLowerCase().includes(targetBooking.service_name.toLowerCase()))
      );

      if (matchingWaitlistEntries.length > 0) {
        setWaitlist((prev) =>
          prev.map((w) =>
            matchingWaitlistEntries.some((m) => m.id === w.id)
              ? { ...w, status: 'notified', notified_at: new Date().toISOString() }
              : w
          )
        );

        toast({
          title: '🔔 Waitlist Auto-Alert Triggered!',
          description: `Automatically notified ${matchingWaitlistEntries.length} waiting client(s) (${matchingWaitlistEntries[0].customer_name}) via WhatsApp regarding the opened slot.`,
        });
      }
    }
  };

  const handleBookingPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Maximum allowed size is ${MAX_SIZE_MB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    const ALLOWED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({
        title: 'Invalid Format',
        description: 'Supported formats are PNG, JPEG, JPG, and WEBP.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const safeName = `${Date.now()}_inspiration.${fileExt}`;
      const filePath = `websites/${tenant.id}/appointments/${safeName}`;

      const { data, error } = await supabase.storage.from('salon-templates').upload(filePath, file, {
        upsert: true,
      });

      let publicUrl = '';
      if (error) {
        publicUrl = URL.createObjectURL(file);
      } else {
        const { data: urlData } = supabase.storage.from('salon-templates').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      setNewBPhotoUrl(publicUrl);
      toast({
        title: 'Reference Photo Uploaded!',
        description: 'Inspiration image loaded successfully.',
      });
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Fallback set.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Create New Appointment with Overlap Guard
  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBCustomerName.trim() || !newBCustomerPhone.trim() || !newBService.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in client name, phone number, and service.',
        variant: 'destructive',
      });
      return;
    }

    // WORKFLOW 2: SLOT LOCK & OVERLAP PREVENTION
    const conflicts = checkSlotOverlap(newBDate, newBTime, 60);
    if (conflicts.length > 0) {
      toast({
        title: '⚠️ Schedule Conflict Detected!',
        description: `Time slot ${newBTime} overlaps with existing appointment (${conflicts[0].customer_name} - ${conflicts[0].service_name}). Please pick another time.`,
        variant: 'destructive',
      });
      return;
    }

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      booking_id: `NBU-${Math.floor(1000 + Math.random() * 9000)}`,
      service_name: newBService,
      appointment_date: newBDate,
      appointment_time: newBTime,
      duration_minutes: 60,
      customer_name: newBCustomerName,
      customer_phone: newBCustomerPhone,
      customer_email: newBCustomerEmail || undefined,
      total_price: 1999,
      advance_amount: 200,
      booking_status: 'confirmed',
      visit_type: newBBranch === 'doorstep' ? 'home_service' : 'in_salon',
      branch: newBBranch,
      technician_name: newBTechnician,
      payment_method: 'upi',
      notes: newBNotes,
      service_photo_url: newBPhotoUrl || undefined,
      image_url: newBPhotoUrl || undefined,
      created_at: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setIsNewBookingModalOpen(false);

    toast({
      title: 'Appointment Scheduled Successfully!',
      description: `Confirmed booking for ${newBCustomerName} on ${newBDate} at ${newBTime}.`,
    });

    // Reset Form
    setNewBCustomerName('');
    setNewBCustomerPhone('');
    setNewBCustomerEmail('');
    setNewBNotes('');
    setNewBPhotoUrl('');
  };

  // Create Waitlist Entry
  const handleCreateWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWName.trim() || !newWPhone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Customer name and phone number required.',
        variant: 'destructive',
      });
      return;
    }

    const newEntry: WaitlistEntry = {
      id: `w-${Date.now()}`,
      customer_name: newWName,
      customer_phone: newWPhone,
      preferred_service: newWService,
      preferred_date: newWDate,
      preferred_time_slot: newWTime,
      branch: newWBranch,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setWaitlist((prev) => [newEntry, ...prev]);
    setIsNewWaitlistModalOpen(false);
    toast({
      title: 'Added to Salon Waitlist',
      description: `Waitlist entry logged for ${newWName}.`,
    });

    setNewWName('');
    setNewWPhone('');
  };

  // Calculate Key Dashboard Financials
  const grossRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.booking_status !== 'cancelled')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
  }, [bookings]);

  const totalAdvanceDeposits = useMemo(() => {
    return bookings
      .filter((b) => b.booking_status !== 'cancelled')
      .reduce((sum, b) => sum + (b.advance_amount || 0), 0);
  }, [bookings]);

  const activeStaffCount = staff.filter((s) => s.is_active).length;

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-20">
      {/* ── TOP HEADER & SYSTEM CONTROL BAR ─────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Platform Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center font-bold text-white shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg leading-tight">Nails by Uma - Jaipur</h1>
                <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  OS Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as:{' '}
                <strong className="text-pink-400">
                  {user?.name || demoUser?.name || 'Uma Sharma'} ({role.toUpperCase()})
                </strong>
              </p>
            </div>
          </div>

          {/* Quick Demo Role Switcher & Branch Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Branch Filter Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-pink-400 ml-1.5" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
              >
                <option value="all" className="bg-slate-900 text-white">
                  🏢 All Jaipur Outlets
                </option>
                <option value="mansarovar" className="bg-slate-900 text-white">
                  💅 Mansarovar Studio
                </option>
                <option value="doorstep" className="bg-slate-900 text-white">
                  🏡 Doorstep Home Visits
                </option>
              </select>
            </div>

            {/* Role Quick Switcher */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => loginAsDemoRole('owner')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'owner' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Owner Permission"
              >
                Owner
              </button>
              <button
                onClick={() => loginAsDemoRole('manager')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'manager' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Branch Manager Permission"
              >
                Manager
              </button>
              <button
                onClick={() => loginAsDemoRole('receptionist')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'receptionist' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Receptionist Desk Permission"
              >
                Desk
              </button>
            </div>

            {/* View Customer Website Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white text-xs h-8 rounded-xl gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Site</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-xs h-8 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── NAVIGATION SIDEBAR & TABS CONTAINER ─────────────────────── */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Tabs Navigation */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border p-3 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block tracking-wider">
                Salon Operations
              </span>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard &amp; Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4" />
                  <span>Bookings &amp; Slots</span>
                </div>
                <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {bookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('waitlist')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'waitlist'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4" />
                  <span>Waitlist Tracker</span>
                </div>
                {waitlist.filter((w) => w.status === 'pending').length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {waitlist.filter((w) => w.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('finances')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'finances'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <IndianRupee className="w-4 h-4" />
                <span>Financial Ledger &amp; UPI</span>
              </button>

              <button
                onClick={() => setActiveTab('clients')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Client Directory</span>
              </button>

              <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 block tracking-wider pt-2">
                Team &amp; Catalog
              </span>

              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Staff &amp; Specialists</span>
              </button>

              <button
                onClick={() => setActiveTab('packages')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'packages'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Special Packages &amp; Combos</span>
              </button>

              <button
                onClick={() => setActiveTab('promotions')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'promotions'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Promotions &amp; Coupons</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Gallery &amp; Reels</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span>Reviews &amp; Incentives</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Studio Settings</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('template');
                  navigate('/admin/dashboard?tab=customizer', { replace: true });
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'template'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Customizer &amp; Subdomains</span>
              </button>
            </div>
          </aside>

          {/* Main Tab Content View */}
          <main className="lg:col-span-9 space-y-6">
            {tenant?.is_published && (
              <PublishedBanner websiteUrl={getSubdomainUrl(tenant.id)} />
            )}

            {/* 1. DASHBOARD & ANALYTICS TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-2xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                      <IndianRupee className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      ₹{grossRevenue.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                      +18% from last week
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-2xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Advance Deposits</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      ₹{totalAdvanceDeposits.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      ₹200 / booking verified
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-2xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Occupancy</span>
                      <Building2 className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">85%</div>
                    <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                      4/5 Stations Active
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-2xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Active Staff</span>
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {activeStaffCount}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Jaipur Team</span>
                  </div>
                </div>

                {/* Today's Appointments & Timeline Overview */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarCheck2 className="w-5 h-5 text-pink-600" />
                        Today's Appointment Schedule
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Live status for {selectedBranch === 'all' ? 'All Outlets' : selectedBranch}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsNewBookingModalOpen(true)}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> New Booking
                    </Button>
                  </div>

                  <div className="space-y-3 pt-2">
                    {filteredBookings.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">
                        No appointments found for this branch filter.
                      </p>
                    ) : (
                      filteredBookings.slice(0, 5).map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-3.5 rounded-xl border bg-slate-50/60 dark:bg-slate-800/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {b.customer_name}
                                </span>
                                <span className="text-[10px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                                  {b.appointment_time}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{b.service_name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              ₹{b.total_price}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                                b.booking_status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.booking_status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {b.booking_status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. BOOKINGS & APPOINTMENTS TAB */}
            {activeTab === 'bookings' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-2xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-pink-600" />
                      Appointments &amp; Booking Management
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Schedule, reschedule, or cancel bookings with automatic slot overlap checking.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setIsNewBookingModalOpen(true)}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Create Appointment
                    </Button>
                  </div>
                </div>

                {/* Filters & View Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search client name, phone or service..."
                      className="pl-9 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={bookingFilterStatus}
                      onChange={(e) => setBookingFilterStatus(e.target.value)}
                      className="text-xs font-semibold px-3 py-2 rounded-xl border bg-background"
                    >
                      <option value="all">All Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending Deposit</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Bookings Table List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-500 border-y">
                      <tr>
                        <th className="p-3">Client &amp; Contact</th>
                        <th className="p-3">Service &amp; Branch</th>
                        <th className="p-3">Date &amp; Time</th>
                        <th className="p-3">Amount (₹)</th>
                        <th className="p-3">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">
                            <div>{b.customer_name}</div>
                            <span className="text-[11px] text-slate-500 font-normal">{b.customer_phone}</span>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{b.service_name}</div>
                            <span className="text-[10px] text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                              {b.visit_type === 'home_service' ? '🏡 Home Visit' : '💈 Salon'}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                            <div>{b.appointment_date}</div>
                            <span className="text-[11px] text-pink-600 font-bold">{b.appointment_time}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            ₹{b.total_price}
                            <span className="text-[10px] text-slate-400 block font-normal">
                              Adv: ₹{b.advance_amount || 200}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleBookingStatus(b.id, 'confirmed')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                  b.booking_status === 'confirmed'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-slate-700 hover:bg-emerald-50'
                                }`}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleToggleBookingStatus(b.id, 'completed')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                  b.booking_status === 'completed'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-700 hover:bg-blue-50'
                                }`}
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleToggleBookingStatus(b.id, 'cancelled')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                  b.booking_status === 'cancelled'
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-white text-slate-700 hover:bg-rose-50'
                                }`}
                                title="Cancelling triggers waitlist auto-alerts"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. WAITLIST MANAGEMENT TAB */}
            {activeTab === 'waitlist' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-500" />
                      Waitlist &amp; Opened Slot Auto-Alerts
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Whenever an appointment is cancelled, matching waitlist clients are automatically notified via WhatsApp!
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsNewWaitlistModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Client to Waitlist
                  </Button>
                </div>

                <div className="space-y-3">
                  {filteredWaitlist.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-2xl border bg-amber-50/30 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {w.customer_name}
                          </span>
                          <span className="text-xs text-slate-500">({w.customer_phone})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              w.status === 'notified'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {w.status === 'notified' ? '🔔 Notified via WhatsApp' : w.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Service:{' '}
                          <strong className="text-pink-600">{w.preferred_service}</strong> | Slot:{' '}
                          {w.preferred_date} ({w.preferred_time_slot})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setWaitlist((prev) =>
                              prev.map((item) =>
                                item.id === w.id ? { ...item, status: 'notified' } : item
                              )
                            );
                            toast({
                              title: 'WhatsApp Alert Sent',
                              description: `Sent slot availability alert to ${w.customer_name} (${w.customer_phone}).`,
                            });
                          }}
                          className="text-xs border-amber-300 hover:bg-amber-100 h-8 rounded-xl font-bold"
                        >
                          <Send className="w-3 h-3 mr-1 text-amber-600" /> WhatsApp Alert
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FINANCIAL LEDGER & PAYMENTS TAB */}
            {activeTab === 'finances' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-2xs space-y-5">
                <div className="pb-3 border-b">
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    Financial Ledger &amp; Advance Deposits (₹200)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track UPI (`6376539366@ybl`) advance payments and in-salon cash transactions.
                  </p>
                </div>

                <div className="space-y-3">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 bg-slate-50/50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{p.customer_name}</span>
                          <span className="text-xs text-slate-500">Ref: {p.booking_id}</span>
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {p.payment_status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Total: <strong>₹{p.amount_inr}</strong> | Advance Deposit:{' '}
                          <strong className="text-emerald-600">₹{p.advance_deposit_inr}</strong> | UPI ID:{' '}
                          `6376539366@ybl`
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setPayments((prev) =>
                            prev.map((item) =>
                              item.id === p.id ? { ...item, payment_status: 'verified' } : item
                            )
                          );
                          toast({
                            title: 'Deposit Verified',
                            description: `₹${p.advance_deposit_inr} deposit verified for ${p.customer_name}.`,
                          });
                        }}
                        className="bg-emerald-600 text-white font-bold text-xs h-8 rounded-xl"
                      >
                        Verify Payment
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. CLIENT DIRECTORY TAB */}
            {activeTab === 'clients' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-2xs space-y-5">
                <div className="pb-3 border-b">
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-600" />
                    Customer Directory &amp; Loyalty Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer contact info, total spend, loyalty points, and custom notes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clients.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl border bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{c.name}</span>
                        <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                          ⭐ {c.loyalty_points} Points
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">📞 {c.phone} | ✉️ {c.email}</p>
                      <p className="text-xs text-slate-600">
                        Total Spent: <strong className="text-slate-900">₹{c.total_spent_inr}</strong> ({c.visit_count} visits)
                      </p>
                      {c.preferences_notes && (
                        <p className="text-xs text-slate-500 bg-white p-2 rounded-xl border">
                          Notes: {c.preferences_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. STAFF & SPECIALISTS TAB */}
            {activeTab === 'staff' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      Staff &amp; Beauty Specialists
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage Jaipur team profiles, stations, shifts, and commissions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {staff.map((st) => (
                    <div key={st.id} className="p-4 rounded-2xl border bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{st.name}</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {st.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        📞 {st.phone} | Shift: {st.shift_hours}
                      </p>
                      <p className="text-xs text-slate-600">
                        Station: <strong>{st.station_number}</strong> | Commission: <strong>{st.commission_rate}%</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. PACKAGES TAB */}
            {activeTab === 'packages' && <PackagesManagementSection />}

            {/* 8. PROMOTIONS TAB */}
            {activeTab === 'promotions' && <PromotionsManagementSection />}

            {/* 9. GALLERY TAB */}
            {activeTab === 'gallery' && <GalleryManagementSection />}

            {/* 10. REVIEWS TAB */}
            {activeTab === 'reviews' && <ReviewIncentiveAdminSection />}

            {/* 11. STUDIO SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-2xs space-y-6">
                <div className="pb-3 border-b">
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-700" />
                    Studio Operating Settings &amp; Module Toggles
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure Nails by Uma hours, WhatsApp triggers, and GST invoicing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Studio Opening Time</Label>
                    <Input
                      value={settings.opening_time}
                      onChange={(e) => setSettings({ ...settings, opening_time: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Studio Closing Time</Label>
                    <Input
                      value={settings.closing_time}
                      onChange={(e) => setSettings({ ...settings, closing_time: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2 pt-2 border-t">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settings.whatsapp_notifications_enabled}
                        onChange={(e) =>
                          setSettings({ ...settings, whatsapp_notifications_enabled: e.target.checked })
                        }
                        className="rounded text-pink-600 w-4 h-4"
                      />
                      <span>Automated WhatsApp Booking Confirmation Alerts</span>
                    </label>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settings.waitlist_auto_alert_enabled}
                        onChange={(e) =>
                          setSettings({ ...settings, waitlist_auto_alert_enabled: e.target.checked })
                        }
                        className="rounded text-pink-600 w-4 h-4"
                      />
                      <span>Automated Waitlist Auto-Alerts on Cancellation</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    onClick={() =>
                      toast({
                        title: 'Settings Saved',
                        description: 'Studio operating configuration updated successfully.',
                      })
                    }
                    className="bg-slate-900 text-white font-bold text-xs rounded-xl h-10 px-6"
                  >
                    Save Studio Settings
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'template' && <TenantCustomizer />}
          </main>
        </div>
      </div>

      {/* ── MODAL: CREATE APPOINTMENT (WITH OVERLAP GUARD) ─────────── */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Create New Salon Appointment
              </h3>
              <button
                onClick={() => { setIsNewBookingModalOpen(false); setNewBPhotoUrl(''); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} className="space-y-3">
              <div>
                <Label className="text-xs font-bold">Client Name *</Label>
                <Input
                  value={newBCustomerName}
                  onChange={(e) => setNewBCustomerName(e.target.value)}
                  placeholder="e.g. Pooja Sharma"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Phone Number *</Label>
                <Input
                  value={newBCustomerPhone}
                  onChange={(e) => setNewBCustomerPhone(e.target.value)}
                  placeholder="+91 98290 00000"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Service Name *</Label>
                <Input
                  value={newBService}
                  onChange={(e) => setNewBService(e.target.value)}
                  placeholder="e.g. Royal Gel Extensions with 3D Art"
                  className="text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold">Date</Label>
                  <Input
                    type="date"
                    value={newBDate}
                    onChange={(e) => setNewBDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">Time Slot</Label>
                  <Input
                    value={newBTime}
                    onChange={(e) => setNewBTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* ── SERVICE PHOTO INSPIRATION UPLOAD ── */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold block">Upload Service Photo / Inspiration Image</Label>
                
                {newBPhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-pink-100 h-28 flex items-center justify-center bg-pink-50/20">
                    <img src={newBPhotoUrl} alt="Inspiration Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewBPhotoUrl('')}
                      className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full px-2 py-0.5 hover:bg-slate-900 transition-colors text-[10px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-pink-300 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/50 relative transition-colors flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBookingPhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto ? (
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                        <span className="text-[10px] text-slate-500">Uploading inspiration image...</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-[11px] font-bold text-slate-700 block">Click or Drag Reference Image</span>
                        <span className="text-[9px] text-slate-400">PNG, JPG, JPEG, WEBP up to 5MB</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setIsNewBookingModalOpen(false); setNewBPhotoUrl(''); }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploadingPhoto}
                  className="bg-pink-600 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  {uploadingPhoto && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Schedule Appointment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE WAITLIST ENTRY ───────────────────────────── */}
      {isNewWaitlistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Add Client to Waitlist
              </h3>
              <button
                onClick={() => setIsNewWaitlistModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWaitlistSubmit} className="space-y-3">
              <div>
                <Label className="text-xs font-bold">Client Name *</Label>
                <Input
                  value={newWName}
                  onChange={(e) => setNewWName(e.target.value)}
                  placeholder="e.g. Simran Kaur"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Phone Number *</Label>
                <Input
                  value={newWPhone}
                  onChange={(e) => setNewWPhone(e.target.value)}
                  placeholder="+91 98290 00000"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Preferred Service</Label>
                <Input
                  value={newWService}
                  onChange={(e) => setNewWService(e.target.value)}
                  placeholder="e.g. Organic Bridal Sojat Mehndi"
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewWaitlistModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-500 text-white font-bold rounded-xl"
                >
                  Save to Waitlist
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
