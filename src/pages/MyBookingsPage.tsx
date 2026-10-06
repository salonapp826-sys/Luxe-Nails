import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  User,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  CalendarCheck,
  Heart,
  Package,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Download,
  Share2,
  Trash2,
  Edit3,
  Star,
  Award,
  Crown,
  Gift,
  Plus,
  Home,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { supabase } from '@/lib/supabase';
import { calculateLuxePoints } from '@/lib/luxePoints';
import { INITIAL_SERVICES_DATA } from '@/services/dbService';

interface BookingRecord {
  id: string;
  booking_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  booking_date: string;
  booking_time: string;
  service_names: string[];
  total_price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  visit_type: 'salon' | 'home';
  home_address?: string;
  notes?: string;
  technician?: string;
  deposit_paid?: number;
  created_at: string;
}

const DEFAULT_FAVORITE_SERVICES = [
  {
    id: 'russian-manicure',
    name: 'Russian Dry Manicure & BIAB Gel',
    price: 1899,
    duration: '75 min',
    category: 'Gel & Russian',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&fit=crop&q=80',
  },
  {
    id: 'bridal-nail-couture',
    name: 'Royal Bridal Nail Art with Swarovski',
    price: 2499,
    duration: '90 min',
    category: 'Bridal Atelier',
    image: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=600&fit=crop&q=80',
  },
  {
    id: 'rose-foot-spa',
    name: 'Rose & Milk Luxury Foot Spa Pedicure',
    price: 1199,
    duration: '60 min',
    category: 'Spa Rituals',
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&fit=crop&q=80',
  },
];

const DEFAULT_FAVORITE_PACKAGES = [
  {
    id: 'bridal-glow-package',
    name: 'Bridal Glow Couture Package',
    price: 4999,
    originalPrice: 7499,
    duration: '4.5 Hours',
    badge: '👑 Most Popular',
    savings: '₹2,500',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&fit=crop&q=80',
  },
  {
    id: 'weekend-pamper-package',
    name: 'Weekend Pamper Glow Package',
    price: 1799,
    originalPrice: 2299,
    duration: '2.0 Hours',
    badge: '✨ Weekend Favorite',
    savings: '₹500',
    image: 'https://images.unsplash.com/photo-1512290900672-1f02e21b74a4?w=600&fit=crop&q=80',
  },
];

export function MyBookingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useSEO({
    title: 'My Bookings & VIP Client Dashboard | Nails by Uma',
    description:
      'Manage your appointments, view upcoming luxury nail sessions, reschedule or cancel bookings, and review your Luxe loyalty points and favorite beauty treatments.',
    canonicalPath: '/my-bookings',
  });

  useBreadcrumbSchema();

  // Phone lookup & profile state
  const [phone, setPhone] = useState('');
  const [profileName, setProfileName] = useState('Uma Guest');
  const [profileEmail, setProfileEmail] = useState('client@example.com');
  const [profileAddress, setProfileAddress] = useState('Mansarovar, Jaipur');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'favorites' | 'referral' | 'profile'>('upcoming');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');

  // Referral Program State
  const referralCode = `UMA-VIP-${phone.replace(/\D/g, '').slice(-4) || '8821'}`;
  const referralLink = `https://nailsbyuma.com/book?ref=${referralCode}`;

  const [referredBookings] = useState([
    {
      id: 'REF-78101',
      friendName: 'Ananya Sharma',
      date: '2026-09-24',
      service: 'Russian Dry Manicure & BIAB Gel',
      status: 'Completed',
      rewardEarned: '₹300 Wallet Credit',
    },
    {
      id: 'REF-78102',
      friendName: 'Rhea Kapoor',
      date: '2026-10-02',
      service: 'Royal Bridal Extension Suite',
      status: 'Pending Visit',
      rewardEarned: '₹300 Pending Visit',
    },
    {
      id: 'REF-78103',
      friendName: 'Meera Rajput',
      date: '2026-10-08',
      service: 'Rose & Milk Luxury Foot Spa',
      status: 'Confirmed',
      rewardEarned: '₹300 Pending Visit',
    },
  ]);

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Referral Link Copied! 🎁',
      description: `Share ${referralLink} with friends for ₹300 OFF!`,
    });
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: 'Referral Code Copied! ✨',
      description: `Code ${referralCode} copied to clipboard.`,
    });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! I get my nails & beauty done at Nails by Uma Jaipur! 💅✨ Use my VIP link for flat ₹300 OFF your first luxury session:\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Bookings list
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [luxePoints, setLuxePoints] = useState(350);

  // Interactive Modals
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<BookingRecord | null>(null);
  const [bookingToReschedule, setBookingToReschedule] = useState<BookingRecord | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [bookingToCancel, setBookingToCancel] = useState<BookingRecord | null>(null);

  // Load phone on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('customer_phone');
    const savedName = localStorage.getItem('customer_name');
    const savedEmail = localStorage.getItem('customer_email');
    const savedAddress = localStorage.getItem('customer_address');

    if (savedName) setProfileName(savedName);
    if (savedEmail) setProfileEmail(savedEmail);
    if (savedAddress) setProfileAddress(savedAddress);

    if (savedPhone) {
      setPhone(savedPhone);
      fetchDashboardData(savedPhone);
    } else {
      // Load any default local storage bookings
      loadLocalBookings('');
    }
  }, []);

  const loadLocalBookings = (cleanPhone: string) => {
    try {
      const localList = JSON.parse(localStorage.getItem('luxury_salon_bookings') || '[]');
      let mapped: BookingRecord[] = localList.map((b: any) => ({
        id: b.id || `UMA-${Math.floor(100000 + Math.random() * 900000)}`,
        customer_name: b.customerName || profileName,
        customer_phone: b.customerPhone || cleanPhone || '9876543210',
        customer_email: b.customerEmail || profileEmail,
        booking_date: b.date || new Date().toISOString().split('T')[0],
        booking_time: b.time || '11:00 AM',
        service_names: [b.serviceName || 'Luxury Gel Overlay & Nail Art'],
        total_price: b.price || 1899,
        status: (b.status ? b.status.toLowerCase() : 'confirmed') as any,
        visit_type: (b.mode === 'home' ? 'home' : 'salon') as any,
        home_address: b.homeAddress || '',
        notes: b.notes || 'Natural Russian cuticles, soft almond shape',
        technician: b.technician || 'Uma Sharma (Master Artist)',
        deposit_paid: b.depositPaid || 200,
        created_at: b.createdAt || new Date().toISOString(),
      }));

      // Filter by phone if provided
      if (cleanPhone) {
        mapped = mapped.filter((b) =>
          b.customer_phone.includes(cleanPhone) || cleanPhone.includes(b.customer_phone.replace(/\D/g, ''))
        );
      }

      // If no bookings found, add sample demo bookings for high-end preview
      if (mapped.length === 0) {
        mapped = [
          {
            id: 'UMA-892410',
            customer_name: 'Pooja Verma',
            customer_phone: cleanPhone || '9829012345',
            customer_email: 'pooja.verma@example.com',
            booking_date: '2026-10-04',
            booking_time: '11:00 AM',
            service_names: ['Russian Dry Manicure & BIAB Gel Extensions', '3D Hand-Painted Chrome Art'],
            total_price: 2699,
            status: 'confirmed',
            visit_type: 'salon',
            technician: 'Uma Sharma (Lead Artist)',
            notes: 'Almond shaped, rose gold chrome dust accent on ring finger.',
            deposit_paid: 200,
            created_at: '2026-09-28T10:00:00Z',
          },
          {
            id: 'UMA-741290',
            customer_name: 'Pooja Verma',
            customer_phone: cleanPhone || '9829012345',
            customer_email: 'pooja.verma@example.com',
            booking_date: '2026-09-14',
            booking_time: '03:00 PM',
            service_names: ['Rose & Milk Foot Spa Pedicure', '24K Gold Clean-up'],
            total_price: 2498,
            status: 'completed',
            visit_type: 'salon',
            technician: 'Kavita Singh',
            notes: 'Relaxing scrub with peppermint oil finish.',
            deposit_paid: 200,
            created_at: '2026-09-12T14:30:00Z',
          },
        ];
      }

      setBookings(mapped);
      const points = calculateLuxePoints(cleanPhone, mapped);
      setLuxePoints(points.availablePoints || 350);
    } catch (err) {
      console.error('Local booking loader error:', err);
    }
  };

  const fetchDashboardData = async (queryPhone: string) => {
    const cleanPhone = queryPhone.trim();
    if (!cleanPhone || cleanPhone.length < 6) {
      toast({
        title: 'Enter Phone Number',
        description: 'Please enter a valid phone number to access your appointments.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      let combined: BookingRecord[] = [];

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_phone', cleanPhone)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const supabaseMapped: BookingRecord[] = data.map((b: any) => ({
            id: b.id || b.booking_id,
            customer_name: b.customer_name || profileName,
            customer_phone: b.customer_phone,
            customer_email: b.customer_email || profileEmail,
            booking_date: b.booking_date,
            booking_time: b.booking_time,
            service_names: b.service_names || [b.service_name || 'Beauty Treatment'],
            total_price: b.total_price || b.final_price || 999,
            status: (b.status ? b.status.toLowerCase() : 'confirmed') as any,
            visit_type: (b.visit_type || 'salon') as any,
            home_address: b.home_address || '',
            notes: b.notes || '',
            technician: b.technician_name || 'Master Nail Stylist',
            deposit_paid: 200,
            created_at: b.created_at,
          }));
          combined = [...supabaseMapped];
        }
      } catch (e) {
        console.log('Remote fetch check:', e);
      }

      // Merge local storage
      const localList = JSON.parse(localStorage.getItem('luxury_salon_bookings') || '[]');
      const localMatching = localList
        .filter((b: any) => b.customerPhone && (b.customerPhone.includes(cleanPhone) || cleanPhone.includes(b.customerPhone.replace(/\D/g, ''))))
        .map((b: any) => ({
          id: b.id,
          customer_name: b.customerName,
          customer_phone: b.customerPhone,
          customer_email: b.customerEmail,
          booking_date: b.date,
          booking_time: b.time,
          service_names: [b.serviceName],
          total_price: b.price,
          status: (b.status ? b.status.toLowerCase() : 'confirmed') as any,
          visit_type: (b.mode === 'home' ? 'home' : 'salon') as any,
          home_address: b.homeAddress || '',
          notes: b.notes || '',
          technician: 'Uma Sharma (Master Artist)',
          deposit_paid: b.depositPaid || 200,
          created_at: b.createdAt || new Date().toISOString(),
        }));

      const idSet = new Set(combined.map((b) => b.id));
      for (const loc of localMatching) {
        if (!idSet.has(loc.id)) {
          combined.push(loc);
        }
      }

      if (combined.length === 0) {
        loadLocalBookings(cleanPhone);
      } else {
        setBookings(combined);
        const points = calculateLuxePoints(cleanPhone, combined);
        setLuxePoints(points.availablePoints || 350);
      }

      localStorage.setItem('customer_phone', cleanPhone);
      toast({
        title: 'Dashboard Synchronized ✨',
        description: `Loaded account data for ${cleanPhone}`,
      });
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      toast({
        title: 'Loaded Local Appointments',
        description: 'Showing stored device appointments.',
      });
      loadLocalBookings(cleanPhone);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData(phone);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('customer_name', profileName);
    localStorage.setItem('customer_email', profileEmail);
    localStorage.setItem('customer_address', profileAddress);
    setIsEditingProfile(false);
    toast({
      title: 'Profile Updated! ✨',
      description: 'Your preferences and contact details have been saved.',
    });
  };

  // Reschedule Action
  const handleConfirmReschedule = () => {
    if (!bookingToReschedule || !newDate || !newTime) {
      toast({
        title: 'Incomplete Details',
        description: 'Please pick a new date and time slot.',
        variant: 'destructive',
      });
      return;
    }

    const updated = bookings.map((b) => {
      if (b.id === bookingToReschedule.id) {
        return {
          ...b,
          booking_date: newDate,
          booking_time: newTime,
          status: 'confirmed' as const,
        };
      }
      return b;
    });

    setBookings(updated);

    // Update local storage
    try {
      const localList = JSON.parse(localStorage.getItem('luxury_salon_bookings') || '[]');
      const updatedLocal = localList.map((b: any) => {
        if (b.id === bookingToReschedule.id) {
          return { ...b, date: newDate, time: newTime, status: 'Confirmed' };
        }
        return b;
      });
      localStorage.setItem('luxury_salon_bookings', JSON.stringify(updatedLocal));
    } catch (e) {
      console.error(e);
    }

    toast({
      title: 'Appointment Rescheduled! 📅',
      description: `New slot: ${newDate} at ${newTime}`,
    });
    setBookingToReschedule(null);
  };

  // Cancel Action
  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;

    const updated = bookings.map((b) => {
      if (b.id === bookingToCancel.id) {
        return { ...b, status: 'cancelled' as const };
      }
      return b;
    });

    setBookings(updated);

    // Update local storage
    try {
      const localList = JSON.parse(localStorage.getItem('luxury_salon_bookings') || '[]');
      const updatedLocal = localList.map((b: any) => {
        if (b.id === bookingToCancel.id) {
          return { ...b, status: 'Cancelled' };
        }
        return b;
      });
      localStorage.setItem('luxury_salon_bookings', JSON.stringify(updatedLocal));
    } catch (e) {
      console.error(e);
    }

    toast({
      title: 'Appointment Cancelled',
      description: `Booking ${bookingToCancel.id} has been cancelled. Advance deposit credited to your Luxe Wallet.`,
    });
    setBookingToCancel(null);
  };

  // Filter Bookings
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  const pastBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  const nextAppointment = upcomingBookings[0] || null;

  const getStatusBadge = (status: BookingRecord['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Verification
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/70 via-amber-50/30 to-pink-50/50 text-slate-900 relative overflow-hidden">
      {/* Background Ambient Mesh Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-300/30 via-rose-200/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/30 via-pink-200/20 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section with Light Glassmorphism */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 border-b border-pink-200/50 bg-white/60 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
            alt="Rose Gold Light Glassmorphism Texture"
            className="w-full h-full object-cover object-center opacity-15 scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-rose-50/40 to-white/90" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 border border-pink-300/60 text-pink-700 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                VIP Client Atelier Portal
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 tracking-tight">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
                  {profileName}
                </span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
                Manage your upcoming appointments, track service history, view your Luxe loyalty points, and re-book your signature beauty experiences.
              </p>
            </div>

            {/* Quick Phone Sync Box */}
            <div className="w-full md:w-auto bg-white/85 backdrop-blur-xl border border-white/90 p-3.5 rounded-2xl shadow-lg shadow-pink-900/5">
              <form onSubmit={handlePhoneSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-pink-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 pr-3 py-1.5 h-10 bg-white border-pink-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl h-10 px-4 text-xs font-bold shadow-md shadow-pink-600/20"
                >
                  {loading ? 'Syncing...' : 'Sync'}
                </Button>
              </form>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white/90 shadow-md shadow-pink-900/5 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-pink-100/80 border border-pink-200 flex items-center justify-center text-pink-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Active Bookings</p>
                <p className="text-xl font-bold text-slate-900">{upcomingBookings.length}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/90 shadow-md shadow-pink-900/5 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Luxe Points</p>
                <p className="text-xl font-bold text-amber-700">{luxePoints} pts</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/90 shadow-md shadow-pink-900/5 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">VIP Tier</p>
                <p className="text-xl font-bold text-emerald-700">Gold Prestige</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/90 shadow-md shadow-pink-900/5 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-600">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Reward Vouchers</p>
                <p className="text-xl font-bold text-rose-700">₹200 Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Workspace */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white/75 backdrop-blur-xl border border-white/90 shadow-md shadow-pink-900/5 rounded-2xl mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/80'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Upcoming ({upcomingBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/80'
            }`}
          >
            <Clock className="w-4 h-4" />
            Booking History ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'favorites'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/80'
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved & Favorites
          </button>

          <button
            onClick={() => setActiveTab('referral')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'referral'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/80'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-500" />
            Refer a Friend (Earn ₹300)
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/80'
            }`}
          >
            <User className="w-4 h-4" />
            Profile & VIP Settings
          </button>
        </div>

        {/* TAB 1: UPCOMING APPOINTMENT SPOTLIGHT */}
        {activeTab === 'upcoming' && (
          <div className="space-y-8">
            {nextAppointment ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/90 shadow-xl shadow-pink-900/5 rounded-3xl p-6 sm:p-8"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-pink-100">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Next Scheduled Appointment
                      </span>
                      {getStatusBadge(nextAppointment.status)}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                      {nextAppointment.service_names.join(' + ')}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Booking Reference: <span className="font-mono text-pink-600 font-bold">{nextAppointment.id}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => {
                        setBookingToReschedule(nextAppointment);
                        setNewDate(nextAppointment.booking_date);
                        setNewTime(nextAppointment.booking_time);
                      }}
                      className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold gap-2 px-4 py-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-pink-500" />
                      Reschedule
                    </Button>

                    <Button
                      onClick={() => setBookingToCancel(nextAppointment)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold gap-2 px-4 py-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel Booking
                    </Button>

                    <Button
                      onClick={() => setSelectedBookingDetails(nextAppointment)}
                      className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-bold gap-2 px-4 py-2 shadow-md shadow-pink-600/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-rose-50/50 border border-pink-100/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs mb-1">
                      <CalendarIcon className="w-4 h-4 text-pink-500" />
                      Date & Day
                    </div>
                    <p className="text-base font-bold text-slate-900">{nextAppointment.booking_date}</p>
                    <p className="text-xs text-pink-600 font-medium">Scheduled at Atelier</p>
                  </div>

                  <div className="bg-rose-50/50 border border-pink-100/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs mb-1">
                      <Clock className="w-4 h-4 text-pink-500" />
                      Appointment Time
                    </div>
                    <p className="text-base font-bold text-slate-900">{nextAppointment.booking_time}</p>
                    <p className="text-xs text-emerald-600 font-medium">Confirmed Slot</p>
                  </div>

                  <div className="bg-rose-50/50 border border-pink-100/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs mb-1">
                      <MapPin className="w-4 h-4 text-pink-500" />
                      Location
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {nextAppointment.visit_type === 'home' ? 'Doorstep Home Visit' : 'Jaipur Atelier Studio'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">Mansarovar, Jaipur</p>
                  </div>

                  <div className="bg-rose-50/50 border border-pink-100/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs mb-1">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Master Artist
                    </div>
                    <p className="text-base font-bold text-amber-700">
                      {nextAppointment.technician || 'Uma Sharma'}
                    </p>
                    <p className="text-xs text-slate-500">Principal Nail Designer</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-white/80 border border-white/90 shadow-lg shadow-pink-900/5 rounded-3xl backdrop-blur-md p-8 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center mx-auto text-pink-600 mb-4">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">No Upcoming Appointments</h3>
                <p className="text-sm text-slate-600 mt-2 mb-6">
                  You do not have any active appointments scheduled. Pamper yourself with our Russian dry manicure, 3D chrome art, or bridal spa.
                </p>
                <Button
                  onClick={() => navigate('/book')}
                  className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl font-bold px-6 py-2.5 shadow-md shadow-pink-600/20"
                >
                  Book New Appointment
                </Button>
              </div>
            )}

            {/* Other Active Appointments if multiple */}
            {upcomingBookings.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" /> Additional Upcoming Sessions ({upcomingBookings.length - 1})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingBookings.slice(1).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/80 border border-white/90 shadow-lg shadow-pink-900/5 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs text-pink-600 font-mono font-bold">{item.id}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                          {item.service_names.join(', ')}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-600 mt-3">
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-pink-500" /> {item.booking_date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-pink-500" /> {item.booking_time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-pink-100">
                        <Button
                          onClick={() => setSelectedBookingDetails(item)}
                          className="flex-1 bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-xl text-xs font-bold"
                        >
                          Details
                        </Button>
                        <Button
                          onClick={() => {
                            setBookingToReschedule(item);
                            setNewDate(item.booking_date);
                            setNewTime(item.booking_time);
                          }}
                          className="bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl text-xs font-bold"
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOOKING HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                All Appointment Records
              </h2>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-white/80 border border-pink-100 p-1 rounded-xl shadow-xs overflow-x-auto max-w-full">
                {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      statusFilter === st
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {pastBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastBookings.map((b) => (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 border border-white/90 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between hover:border-pink-300 transition-all shadow-lg shadow-pink-900/5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs text-pink-600 font-bold">{b.id}</span>
                        {getStatusBadge(b.status)}
                      </div>

                      <h3 className="font-serif font-bold text-slate-900 text-lg line-clamp-1 mb-2">
                        {b.service_names.join(', ')}
                      </h3>

                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Date & Slot:</span>
                          <span className="font-medium text-slate-900">{b.booking_date} • {b.booking_time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="capitalize text-slate-800">{b.visit_type} Service</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Artist:</span>
                          <span className="text-amber-700 font-medium">{b.technician || 'Uma Sharma'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-pink-100 font-bold">
                          <span className="text-slate-700">Total Price:</span>
                          <span className="text-pink-600 font-serif text-sm">₹{b.total_price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-5 pt-3 border-t border-pink-100">
                      <Button
                        onClick={() => setSelectedBookingDetails(b)}
                        className="flex-1 bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-xl text-xs font-bold"
                      >
                        View Details
                      </Button>
                      {b.status === 'confirmed' || b.status === 'pending' ? (
                        <Button
                          onClick={() => {
                            setBookingToReschedule(b);
                            setNewDate(b.booking_date);
                            setNewTime(b.booking_time);
                          }}
                          className="bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl text-xs font-bold px-3"
                        >
                          Reschedule
                        </Button>
                      ) : (
                        <Button
                          onClick={() => navigate('/book')}
                          className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold px-3"
                        >
                          Re-Book
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 border border-white/90 rounded-2xl p-6 shadow-sm">
                <p className="text-slate-500 text-sm">No records match the filter "{statusFilter}".</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED SERVICES & FAVORITE PACKAGES */}
        {activeTab === 'favorites' && (
          <div className="space-y-10">
            {/* Saved Signature Services */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Saved Favorite Treatments
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Quick-access your most loved nail art and spa rituals.</p>
                </div>
                <Button
                  onClick={() => navigate('/services')}
                  className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold gap-1.5"
                >
                  Explore All Services <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {DEFAULT_FAVORITE_SERVICES.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white/80 border border-white/90 rounded-2xl overflow-hidden backdrop-blur-xl group hover:border-pink-300 transition-all shadow-lg shadow-pink-900/5"
                  >
                    <div className="h-44 relative overflow-hidden">
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-pink-700 border border-white/80 shadow-xs">
                        {s.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-serif font-bold text-slate-900 text-base line-clamp-1">{s.name}</h4>
                      <div className="flex items-center justify-between text-xs text-slate-600 mt-2 mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-pink-500" /> {s.duration}</span>
                        <span className="font-serif font-bold text-pink-600 text-sm">₹{s.price.toLocaleString('en-IN')}</span>
                      </div>
                      <Button
                        onClick={() => navigate(`/book?service=${s.id}`)}
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20"
                      >
                        Book This Treatment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Packages */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" /> Preferred Luxury Packages
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Curated value bundles tailored for brides and weekend pampering.</p>
                </div>
                <Button
                  onClick={() => navigate('/packages')}
                  className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold gap-1.5"
                >
                  View All Packages <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {DEFAULT_FAVORITE_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white/80 border border-white/90 rounded-2xl p-5 backdrop-blur-xl flex flex-col sm:flex-row items-start gap-5 hover:border-pink-300 transition-all shadow-lg shadow-pink-900/5"
                  >
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full sm:w-36 h-36 object-cover rounded-xl border border-pink-100"
                    />
                    <div className="flex-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold">
                        {pkg.badge}
                      </span>
                      <h4 className="font-serif font-bold text-slate-900 text-lg mt-1.5">{pkg.name}</h4>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-pink-500" /> Duration: {pkg.duration}
                      </p>
                      <div className="flex items-baseline gap-2 mt-2 mb-4">
                        <span className="font-serif font-bold text-pink-600 text-lg">₹{pkg.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs line-through text-slate-400">₹{pkg.originalPrice.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-emerald-600 font-bold">Save {pkg.savings}</span>
                      </div>
                      <Button
                        onClick={() => navigate(`/book?package=${pkg.id}`)}
                        className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-bold px-4 shadow-md shadow-pink-600/20"
                      >
                        Reserve Package
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REFER A FRIEND MODULE */}
        {activeTab === 'referral' && (
          <div className="space-y-8">
            {/* Hero Card */}
            <div className="relative overflow-hidden bg-white/80 border border-white/90 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl shadow-pink-900/5">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-pink-100 border border-pink-200 text-pink-800 text-xs font-bold uppercase tracking-wider mb-3">
                    <Gift className="w-3.5 h-3.5 text-amber-600" /> Give ₹300, Get ₹300 VIP Rewards
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                    Refer Friends to Nails by Uma Atelier
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl">
                    Share your unique invitation link. Your friend gets <strong className="text-pink-600">₹300 OFF</strong> their first luxury session, and you automatically earn <strong className="text-amber-700">₹300 Wallet Credit</strong> as soon as their visit is complete!
                  </p>
                </div>

                <div className="w-full lg:w-auto bg-rose-50/70 border border-pink-200/80 rounded-2xl p-4 text-center">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Total Referral Earnings</p>
                  <p className="text-3xl font-serif font-bold text-amber-700 mt-1">₹900</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">3 Friends Invited</p>
                </div>
              </div>

              {/* Shareable Link Box */}
              <div className="mt-8 pt-6 border-t border-pink-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 bg-rose-50/80 border border-pink-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Your Personal Invitation Link</p>
                    <p className="text-xs sm:text-sm font-mono font-bold text-pink-600 truncate mt-0.5">{referralLink}</p>
                  </div>
                  <Button
                    onClick={handleCopyReferralLink}
                    className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-bold gap-1.5 px-4 shrink-0 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Copy Link
                  </Button>
                </div>

                <div className="md:col-span-4 flex items-center gap-2">
                  <Button
                    onClick={handleWhatsAppShare}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold gap-2 py-3 shadow-sm"
                  >
                    <Phone className="w-4 h-4" /> Share on WhatsApp
                  </Button>
                  <Button
                    onClick={handleCopyReferralCode}
                    className="bg-pink-50 hover:bg-pink-100 text-slate-800 border border-pink-200 rounded-2xl text-xs font-bold gap-1.5 px-4 py-3"
                  >
                    Code: <span className="font-mono text-amber-700">{referralCode}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* How It Works Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white/80 border border-white/90 rounded-2xl p-5 backdrop-blur-xl shadow-md shadow-pink-900/5">
                <div className="w-9 h-9 rounded-xl bg-pink-100 border border-pink-200 text-pink-700 font-bold flex items-center justify-center mb-3">1</div>
                <h4 className="font-serif font-bold text-slate-900 text-base">Send Link or Code</h4>
                <p className="text-xs text-slate-600 mt-1">Copy your unique VIP link or code <code className="text-pink-600 font-bold">{referralCode}</code> and pass it to friends in Jaipur.</p>
              </div>

              <div className="bg-white/80 border border-white/90 rounded-2xl p-5 backdrop-blur-xl shadow-md shadow-pink-900/5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 font-bold flex items-center justify-center mb-3">2</div>
                <h4 className="font-serif font-bold text-slate-900 text-base">Friend Books & Saves ₹300</h4>
                <p className="text-xs text-slate-600 mt-1">When your friend books any nail or spa service online, flat ₹300 discount is automatically applied.</p>
              </div>

              <div className="bg-white/80 border border-white/90 rounded-2xl p-5 backdrop-blur-xl shadow-md shadow-pink-900/5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold flex items-center justify-center mb-3">3</div>
                <h4 className="font-serif font-bold text-slate-900 text-base">You Get ₹300 Wallet Credit</h4>
                <p className="text-xs text-slate-600 mt-1">Once their salon or doorstep session is finished, ₹300 credit is deposited directly into your Luxe Wallet.</p>
              </div>
            </div>

            {/* Status of Referred Bookings */}
            <div className="bg-white/80 border border-white/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg shadow-pink-900/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" /> Referred Bookings & Reward Status
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Live tracking of your friends' reservations and earned rewards.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold">
                  {referredBookings.length} Active Referrals
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-pink-100 text-slate-500 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Ref ID</th>
                      <th className="py-3 px-4">Friend Name</th>
                      <th className="py-3 px-4">Booking Date</th>
                      <th className="py-3 px-4">Service Selected</th>
                      <th className="py-3 px-4">Booking Status</th>
                      <th className="py-3 px-4 text-right">Your Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {referredBookings.map((ref) => (
                      <tr key={ref.id} className="hover:bg-rose-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-pink-600">{ref.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{ref.friendName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{ref.date}</td>
                        <td className="py-3.5 px-4 text-slate-600">{ref.service}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              ref.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {ref.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif font-bold text-amber-700">
                          {ref.rewardEarned}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE & VIP SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 border border-white/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-pink-900/5">
              <div className="flex items-center justify-between pb-6 border-b border-pink-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-pink-500/20">
                    {profileName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-slate-900">{profileName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Crown className="w-3.5 h-3.5 text-amber-500" /> Gold Tier Atelier VIP Client
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </div>

              {/* Form / View */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 mt-6">
                  <div>
                    <Label className="text-xs text-slate-700">Full Name</Label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="mt-1 bg-white border-pink-200 text-slate-900 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-700">Email Address</Label>
                    <Input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="mt-1 bg-white border-pink-200 text-slate-900 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-700">Doorstep Home Address (for Mobile Beauty Services)</Label>
                    <Input
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Street, Area, Jaipur"
                      className="mt-1 bg-white border-pink-200 text-slate-900 rounded-xl"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs text-slate-700">
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-pink-100">
                    <span className="text-slate-500 block mb-1">Phone Number:</span>
                    <span className="text-slate-900 font-medium">{phone || 'Not provided'}</span>
                  </div>
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-pink-100">
                    <span className="text-slate-500 block mb-1">Email:</span>
                    <span className="text-slate-900 font-medium">{profileEmail}</span>
                  </div>
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-pink-100 sm:col-span-2">
                    <span className="text-slate-500 block mb-1">Saved Home Address:</span>
                    <span className="text-slate-900 font-medium">{profileAddress}</span>
                  </div>
                </div>
              )}

              {/* Loyalty summary */}
              <div className="mt-8 p-5 bg-gradient-to-r from-pink-100/80 via-rose-100/50 to-amber-100/80 border border-pink-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-bold">
                    <Sparkles className="w-4 h-4" /> Luxe Rewards Club
                  </div>
                  <h4 className="text-lg font-serif font-bold text-slate-900 mt-1">
                    {luxePoints} Available Luxe Points
                  </h4>
                  <p className="text-xs text-slate-600">
                    Redeem ₹200 OFF on any manicure, bridal package, or nail art session with code <span className="font-mono text-pink-600 font-bold">LUXEUMA</span>.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/book')}
                  className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold px-4 shadow-md shadow-pink-600/20"
                >
                  Redeem
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: VIEW DETAILS ================= */}
      <AnimatePresence>
        {selectedBookingDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 border border-white/90 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden text-slate-800"
            >
              <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                <div>
                  <span className="text-xs text-pink-600 font-bold font-mono">
                    {selectedBookingDetails.id}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    Appointment Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBookingDetails(null)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-rose-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 my-6 text-xs sm:text-sm text-slate-700">
                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-pink-100 flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  {getStatusBadge(selectedBookingDetails.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Treatment(s):</span>
                    <span className="font-bold text-slate-900 text-right">
                      {selectedBookingDetails.service_names.join(', ')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Slot:</span>
                    <span className="text-slate-900 font-medium">
                      {selectedBookingDetails.booking_date} at {selectedBookingDetails.booking_time}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Specialist:</span>
                    <span className="text-amber-700 font-medium">
                      {selectedBookingDetails.technician || 'Uma Sharma'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Location:</span>
                    <span className="text-slate-900 font-medium capitalize">
                      {selectedBookingDetails.visit_type === 'home'
                        ? 'Doorstep Home Service'
                        : 'Jaipur Atelier Studio'}
                    </span>
                  </div>

                  {selectedBookingDetails.notes && (
                    <div className="pt-2">
                      <span className="text-slate-500 block mb-1">Client Inspo / Notes:</span>
                      <p className="p-2.5 rounded-xl bg-rose-50 text-slate-700 text-xs italic border border-pink-100">
                        "{selectedBookingDetails.notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-pink-100 space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Amount:</span>
                    <span className="text-slate-900 font-serif font-bold text-base">
                      ₹{selectedBookingDetails.total_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600 font-medium">
                    <span>Advance Deposit (Paid):</span>
                    <span>₹{selectedBookingDetails.deposit_paid || 200}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Balance at Atelier:</span>
                    <span>₹{Math.max(0, selectedBookingDetails.total_price - (selectedBookingDetails.deposit_paid || 200))}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    toast({
                      title: 'Booking Pass Downloaded 📄',
                      description: `Saved receipt for booking ${selectedBookingDetails.id}.`,
                    });
                    setSelectedBookingDetails(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-bold gap-2 shadow-md shadow-pink-600/20"
                >
                  <Download className="w-4 h-4" /> Download PDF Pass
                </Button>
                <Button
                  onClick={() => setSelectedBookingDetails(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold px-4"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: RESCHEDULE ================= */}
      <AnimatePresence>
        {bookingToReschedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 border border-white/90 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl text-slate-800"
            >
              <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-pink-600" /> Reschedule Appointment
                </h3>
                <button
                  onClick={() => setBookingToReschedule(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-rose-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 my-5">
                <p className="text-xs text-slate-600">
                  Select a new date and time slot for booking{' '}
                  <span className="font-mono text-pink-600 font-bold">{bookingToReschedule.id}</span>.
                </p>

                <div>
                  <Label className="text-xs text-slate-700">Pick New Date</Label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="mt-1 bg-white border-pink-200 text-slate-900 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-700">Pick Time Slot</Label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1 w-full bg-white border border-pink-200 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="10:00 AM">10:00 AM (Morning)</option>
                    <option value="11:00 AM">11:00 AM (Morning)</option>
                    <option value="01:00 PM">01:00 PM (Afternoon)</option>
                    <option value="02:00 PM">02:00 PM (Afternoon)</option>
                    <option value="04:00 PM">04:00 PM (Afternoon)</option>
                    <option value="05:00 PM">05:00 PM (Evening)</option>
                    <option value="06:00 PM">06:00 PM (Evening)</option>
                    <option value="07:00 PM">07:00 PM (Evening)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleConfirmReschedule}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs font-bold py-2.5 shadow-md shadow-pink-600/20"
                >
                  Confirm New Slot
                </Button>
                <Button
                  onClick={() => setBookingToReschedule(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold px-4"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: CANCEL ================= */}
      <AnimatePresence>
        {bookingToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 border border-white/90 rounded-3xl max-w-md w-full p-6 relative shadow-2xl text-slate-800"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-serif font-bold text-slate-900 text-center">
                Cancel Appointment?
              </h3>
              <p className="text-xs text-slate-600 text-center mt-2 mb-5">
                Are you sure you want to cancel booking <span className="font-mono text-pink-600 font-bold">{bookingToCancel.id}</span>? Your ₹200 deposit will remain safely credited to your Luxe wallet.
              </p>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold py-2.5 shadow-md shadow-rose-600/20"
                >
                  Yes, Cancel Appointment
                </Button>
                <Button
                  onClick={() => setBookingToCancel(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold px-4"
                >
                  Keep Booking
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyBookingsPage;
