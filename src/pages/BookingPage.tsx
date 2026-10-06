import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  Mail,
  FileText,
  Home,
  Store,
  CreditCard,
  Gift,
  Check,
  X,
  Share2,
  Download,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/lib/supabase';
import { INITIAL_SERVICES_DATA } from '@/services/dbService';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price_inr: number;
  duration_minutes: number;
  image_url: string;
  description: string;
}

interface PackageItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  duration: string;
  description: string;
  badge: string;
}

const AVAILABLE_PACKAGES: PackageItem[] = [
  {
    id: 'bridal-glow-package',
    name: 'Bridal Glow Package',
    price: 4999,
    originalPrice: 7499,
    duration: '4.5 Hours',
    description: '3D Gel extensions, bridal mehndi, 24K gold facial & rose petal foot spa',
    badge: 'Save ₹2,500',
  },
  {
    id: 'nail-spa-combo',
    name: 'Nail + Spa Combo',
    price: 2499,
    originalPrice: 3199,
    duration: '2.5 Hours',
    description: 'UV Gel manicure, crystalline jelly foot spa & hot basalt stone massage',
    badge: 'Save ₹700',
  },
  {
    id: 'self-care-luxury-package',
    name: 'Self-Care Luxury Package',
    price: 3299,
    originalPrice: 4299,
    duration: '3.0 Hours',
    description: 'Deep anti-tan facial, paraffin hand wrap, lavender bath & hair spa',
    badge: 'Save ₹1,000',
  },
  {
    id: 'weekend-pamper-package',
    name: 'Weekend Pamper Package',
    price: 1699,
    originalPrice: 2199,
    duration: '90 Mins',
    description: 'Express file & buff, peppermint foot spa, brow shaping & vitamin C clean-up',
    badge: 'Save ₹500',
  },
  {
    id: 'couple-friends-package',
    name: 'Couple / Friends Package (For 2)',
    price: 3799,
    originalPrice: 4999,
    duration: '2.0 Hours',
    description: 'Dual side-by-side rose petal spas, hand reflexology, gel polish & tea tray',
    badge: 'Save ₹1,200',
  },
  {
    id: 'complete-beauty-package',
    name: 'Complete Beauty Package',
    price: 5199,
    originalPrice: 6999,
    duration: '4.0 Hours',
    description: 'BIAB natural overlay, 24K gold facial, honey waxing & festival mehndi',
    badge: 'Save ₹1,800',
  },
];

// Time Slot Generator with available/unavailable states
const TIME_SLOTS = [
  { time: '10:00 AM', period: 'Morning', available: true },
  { time: '11:00 AM', period: 'Morning', available: true },
  { time: '12:00 PM', period: 'Morning', available: false },
  { time: '01:00 PM', period: 'Afternoon', available: true },
  { time: '02:00 PM', period: 'Afternoon', available: true },
  { time: '03:00 PM', period: 'Afternoon', available: false },
  { time: '04:00 PM', period: 'Afternoon', available: true },
  { time: '05:00 PM', period: 'Evening', available: true },
  { time: '06:00 PM', period: 'Evening', available: true },
  { time: '07:00 PM', period: 'Evening', available: true },
];

export function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tenant } = useTenant();
  const { toast } = useToast();

  // Inspiration Photo Upload State
  const [inspirationPhotoUrl, setInspirationPhotoUrl] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);

  useSEO({
    title: 'Book Appointment Online | Luxury Nail & Beauty Spa – Nails by Uma Jaipur',
    description:
      'Book your luxury nail manicure, 3D nail art extensions, bridal mehndi, or spa appointment in Jaipur. Choose in-salon or doorstep home service with real-time time slot selection.',
    canonicalPath: '/book',
    ogImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&h=630&fit=crop&q=80',
  });

  useBreadcrumbSchema();

  const handleInspirationPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit verification: 5MB
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: 'Inspiration Image too large',
        description: `Please select a reference image smaller than ${MAX_SIZE_MB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    const ALLOWED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({
        title: 'Unsupported Image Format',
        description: 'Please upload an image formatted as PNG, JPEG, JPG, or WEBP.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = `${Date.now()}_inspiration.${fileExt}`;
      const filePath = `websites/${tenant.id}/appointments/${cleanFileName}`;

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

      setInspirationPhotoUrl(publicUrl);
      toast({
        title: 'Design Photo Loaded! 📸',
        description: 'Your reference inspiration image is uploaded successfully.',
      });
    } catch {
      toast({
        title: 'Upload Failed',
        description: 'There was an issue processing your image upload. A temporary fallback was loaded.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Multi-Step State (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Form Fields State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [serviceMode, setServiceMode] = useState<'salon' | 'home'>('salon');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [homeAddress, setHomeAddress] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Read URL query params on load
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const packageParam = searchParams.get('package');

    if (serviceParam) {
      setSelectedServiceId(serviceParam);
      setCurrentStep(3); // jump straight to date selection
    } else if (packageParam) {
      setSelectedPackageId(packageParam);
      setCurrentStep(3);
    }
  }, [searchParams]);

  // Minimum selectable date (today)
  const today = new Date().toISOString().split('T')[0];

  // Selected Service/Package object
  const currentService = INITIAL_SERVICES_DATA.find((s) => s.id === selectedServiceId);
  const currentPackage = AVAILABLE_PACKAGES.find((p) => p.id === selectedPackageId);

  // Price Calculation
  const basePrice = currentPackage
    ? currentPackage.price
    : currentService
    ? currentService.price_inr
    : 0;

  const homeServiceFee = serviceMode === 'home' ? 199 : 0;
  const subtotal = basePrice + homeServiceFee;
  const finalPrice = Math.max(0, subtotal - couponDiscount);
  const advanceDeposit = 200;

  // Coupon handler
  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'LUXEUMA') {
      setCouponDiscount(200);
      toast({
        title: 'Coupon Applied! 🎉',
        description: 'Flat ₹200 OFF applied to your booking.',
      });
    } else {
      toast({
        title: 'Invalid Coupon',
        description: 'Use code LUXEUMA for ₹200 OFF.',
        variant: 'destructive',
      });
    }
  };

  // Step Nav Validation
  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedServiceId && !selectedPackageId) {
        toast({
          title: 'Please Select a Treatment',
          description: 'Choose a service or skip to select a package.',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Step 2 (Package selection is optional)
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedDate) {
        toast({
          title: 'Please Select a Date',
          description: 'Choose your preferred appointment day.',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!selectedTime) {
        toast({
          title: 'Please Select a Time Slot',
          description: 'Pick an available time slot from the list.',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
        toast({
          title: 'Missing Required Information',
          description: 'Please fill in your name, phone number, and email.',
          variant: 'destructive',
        });
        return;
      }
      if (serviceMode === 'home' && !homeAddress.trim()) {
        toast({
          title: 'Address Required',
          description: 'Please provide your doorstep address in Jaipur.',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep(6);
    }
  };

  const handleConfirmBooking = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `UMA-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingId(generatedId);

      const bookingRecord = {
        id: generatedId,
        serviceId: selectedServiceId || selectedPackageId,
        serviceName: currentPackage ? currentPackage.name : currentService?.name || 'Custom Beauty Appointment',
        date: selectedDate,
        time: selectedTime,
        mode: serviceMode,
        customerName,
        customerPhone,
        customerEmail,
        homeAddress,
        notes: specialNotes,
        price: finalPrice,
        depositPaid: advanceDeposit,
        status: 'Confirmed',
        service_photo_url: inspirationPhotoUrl || undefined,
        image_url: inspirationPhotoUrl || undefined,
        createdAt: new Date().toISOString(),
      };

      try {
        const existing = JSON.parse(localStorage.getItem('luxury_salon_bookings') || '[]');
        existing.unshift(bookingRecord);
        localStorage.setItem('luxury_salon_bookings', JSON.stringify(existing));
      } catch (err) {
        console.error('Storage error:', err);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setInspirationPhotoUrl(''); // Reset
      window.scrollTo({ top: 0, behavior: 'smooth' });

      toast({
        title: 'Appointment Scheduled Successfully! ✨',
        description: `Booking Reference ${generatedId} confirmed.`,
      });
    }, 1200);
  };

  const stepLabels = [
    'Select Service',
    'Package (Optional)',
    'Choose Date',
    'Pick Time Slot',
    'Guest Details',
    'Confirm & Pay',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-background to-muted/20 pb-24">
      {/* ── HERO BANNER: MINIMALIST MARBLE & ORCHID ────────────────── */}
      <section className="relative min-h-[360px] flex items-center justify-center overflow-hidden bg-slate-950 text-white px-4 py-16">
        {/* Background Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1920&h=800&fit=crop&q=85"
            alt="Minimalist marble and orchid luxury salon setup"
            className="w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-1000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-rose-950/60 to-slate-950/80" />
        </div>

        <div className="relative z-10 container mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-rose-100 uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Instant 6-Step Atelier Reservation</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Schedule Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              Luxury Salon Session
            </span>
          </h1>

          <p className="text-sm sm:text-base text-rose-100/90 max-w-xl mx-auto leading-relaxed">
            In-salon pampering at Mansarovar, Jaipur or seamless doorstep salon setup at your residence.
          </p>
        </div>
      </section>

      {/* ── SUCCESS STATE OVERLAY / VIEW ────────────────────────────── */}
      {isSuccess ? (
        <section className="container mx-auto max-w-2xl px-4 pt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="glass-panel p-8 sm:p-12 rounded-3xl border border-white shadow-2xl text-center bg-white/95 backdrop-blur-xl"
          >
            {/* Animated Celebration Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Check className="w-10 h-10 stroke-[3]" />
            </motion.div>

            <span className="text-xs uppercase font-bold tracking-widest text-pink-600 block mb-1">
              Reservation Confirmed
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              We Look Forward to Welcoming You!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              A confirmation receipt and calendar invite have been sent to <strong>{customerEmail}</strong>.
            </p>

            {/* Booking Details Card */}
            <div className="p-6 rounded-2xl bg-pink-50/70 border border-pink-100 text-left space-y-3 mb-8 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold text-pink-700 bg-white px-3 py-1 rounded-lg border border-pink-200">
                  {bookingId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Treatment:</span>
                <span className="font-bold text-slate-900">
                  {currentPackage ? currentPackage.name : currentService?.name || 'Bespoke Beauty Session'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date &amp; Time:</span>
                <span className="font-semibold text-slate-900">
                  {selectedDate} at {selectedTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Service Mode:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {serviceMode === 'salon' ? 'In-Salon (Mansarovar)' : `Home Service (${homeAddress})`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-pink-100">
                <span className="text-slate-500">Total Price:</span>
                <span className="font-serif text-lg font-bold text-slate-900">₹{finalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => navigate('/my-bookings')}
                className="bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-xl px-6 h-11 shadow-md"
              >
                Track in My Bookings
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `https://wa.me/916376539366?text=Hi%20Uma,%20I%20have%20confirmed%20booking%20${bookingId}%20for%20${selectedDate}`,
                    '_blank'
                  )
                }
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl px-5 h-11 font-semibold"
              >
                <Share2 className="w-4 h-4 mr-2" />
                WhatsApp Us
              </Button>
            </div>
          </motion.div>
        </section>
      ) : (
        /* ── MULTI-STEP BOOKING FLOW CONTAINER ──────────────────────── */
        <section className="container mx-auto max-w-4xl px-4 pt-10">
          {/* Progress Header Ribbon */}
          <div className="glass-panel p-4 rounded-2xl border border-white shadow-sm bg-white/80 backdrop-blur-md mb-8">
            <div className="flex items-center justify-between text-xs font-semibold mb-2 px-1">
              <span className="text-pink-600">
                Step {currentStep} of 6: {stepLabels[currentStep - 1]}
              </span>
              <span className="text-slate-400">{Math.round((currentStep / 6) * 100)}% Completed</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '16%' }}
                animate={{ width: `${(currentStep / 6) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-pink-600 to-rose-500 rounded-full"
              />
            </div>
          </div>

          {/* Form Layout: Main Form Area + Live Summary Sidebar */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Main Interactive Form Card */}
            <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl border border-white shadow-xl bg-white/90 backdrop-blur-xl">
              <AnimatePresence mode="wait">
                {/* ── STEP 1: SELECT SERVICE ────────────────────────── */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900">Step 1: Choose Your Service</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Select an individual treatment or proceed to choose a bundled combo package.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                      {INITIAL_SERVICES_DATA.map((service) => {
                        const isSelected = selectedServiceId === service.id;
                        return (
                          <div
                            key={service.id}
                            onClick={() => {
                              setSelectedServiceId(service.id);
                              setSelectedPackageId('');
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/20 shadow-sm'
                                : 'bg-white/80 border-pink-100 hover:border-pink-300 hover:bg-pink-50/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-serif text-sm font-bold text-slate-900">{service.name}</h4>
                              <span className="font-serif text-sm font-extrabold text-pink-600">
                                ₹{service.price_inr}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{service.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-pink-100/60">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-pink-500" />
                                {service.duration_minutes} Mins
                              </span>
                              <span className="font-semibold text-pink-600 capitalize">{service.category}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: SELECT PACKAGE (OPTIONAL) ────────────── */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-slate-900">Step 2: Upgrade to a Package?</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Optional combo upgrade with bundled savings. Or skip to keep your single service.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPackageId('');
                          setCurrentStep(3);
                        }}
                        className="text-pink-600 hover:bg-pink-50 text-xs font-semibold"
                      >
                        Skip This Step &rarr;
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                      {AVAILABLE_PACKAGES.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              setSelectedServiceId('');
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/20 shadow-sm'
                                : 'bg-white/80 border-pink-100 hover:border-pink-300 hover:bg-pink-50/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  {pkg.badge}
                                </span>
                                <h4 className="font-serif text-sm font-bold text-slate-900 mt-1">{pkg.name}</h4>
                              </div>
                              <span className="font-serif text-sm font-extrabold text-pink-600">₹{pkg.price}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 my-2">{pkg.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-pink-100/60">
                              <span>⏱️ {pkg.duration}</span>
                              <span className="line-through text-slate-400">₹{pkg.originalPrice}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: SELECT DATE ───────────────────────────── */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900">Step 3: Select Appointment Date</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Choose your preferred date. Bookings are available up to 60 days in advance.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="datePicker" className="text-xs font-semibold text-slate-700">
                        Appointment Date *
                      </Label>
                      <Input
                        id="datePicker"
                        type="date"
                        min={today}
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime('');
                        }}
                        className="w-full h-12 rounded-xl border-pink-200 text-sm font-medium bg-white"
                      />

                      {selectedDate && (
                        <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100 text-xs text-slate-700 flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5 text-pink-600 flex-shrink-0" />
                          <div>
                            <span className="font-bold block text-slate-900">
                              {new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-slate-500">Slots open for in-salon and doorstep appointments.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 4: SELECT TIME SLOT ──────────────────────── */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900">Step 4: Select Preferred Time</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Available slots for {selectedDate}. Green indicates confirmed openings.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                              !slot.available
                                ? 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-pink-600 text-white font-bold border-pink-600 shadow-md scale-105'
                                : 'bg-white hover:bg-pink-50/70 border-pink-100 text-slate-800'
                            }`}
                          >
                            <span className="text-sm font-bold block">{slot.time}</span>
                            <span className={`text-[10px] ${isSelected ? 'text-pink-100' : 'text-slate-400'}`}>
                              {slot.available ? slot.period : 'Booked'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 5: CUSTOMER & LOCATION DETAILS ──────────── */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900">Step 5: Guest &amp; Location Details</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Please provide your contact information to receive appointment reminders.
                      </p>
                    </div>

                    {/* Service Mode Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-700">Service Location *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setServiceMode('salon')}
                          className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                            serviceMode === 'salon'
                              ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/20'
                              : 'bg-white border-pink-100'
                          }`}
                        >
                          <Store className="w-5 h-5 text-pink-600" />
                          <div>
                            <span className="font-bold text-xs block text-slate-900">In-Salon Atelier</span>
                            <span className="text-[10px] text-slate-500">Mansarovar, Jaipur</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setServiceMode('home')}
                          className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                            serviceMode === 'home'
                              ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/20'
                              : 'bg-white border-pink-100'
                          }`}
                        >
                          <Home className="w-5 h-5 text-pink-600" />
                          <div>
                            <span className="font-bold text-xs block text-slate-900">Doorstep Home Spa</span>
                            <span className="text-[10px] text-pink-600 font-semibold">+₹199 Travel Fee</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="custName" className="text-xs font-semibold text-slate-700">
                          Full Name *
                        </Label>
                        <Input
                          id="custName"
                          placeholder="e.g. Pooja Sharma"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="h-11 rounded-xl border-pink-200 text-sm bg-white"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="custPhone" className="text-xs font-semibold text-slate-700">
                          Phone / WhatsApp Number *
                        </Label>
                        <Input
                          id="custPhone"
                          placeholder="+91 98765 43210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="h-11 rounded-xl border-pink-200 text-sm bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="custEmail" className="text-xs font-semibold text-slate-700">
                        Email Address *
                      </Label>
                      <Input
                        id="custEmail"
                        type="email"
                        placeholder="pooja@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="h-11 rounded-xl border-pink-200 text-sm bg-white"
                        required
                      />
                    </div>

                    {serviceMode === 'home' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="homeAddr" className="text-xs font-semibold text-slate-700">
                          Jaipur Home / Hotel Suite Address *
                        </Label>
                        <Input
                          id="homeAddr"
                          placeholder="Flat/House No, Colony, Landmark (e.g. Vaishali Nagar, Jaipur)"
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          className="h-11 rounded-xl border-pink-200 text-sm bg-white"
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                        Special Requests / Nail Length Preference (Optional)
                      </Label>
                      <Input
                        id="notes"
                        placeholder="e.g. Almond shape gel extensions, sensitive cuticles, etc."
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        className="h-11 rounded-xl border-pink-200 text-sm bg-white"
                      />
                    </div>

                    {/* ── DRAG-AND-DROP SERVICE INSPIRATION PHOTO UPLOAD AREA ── */}
                    <div className="space-y-2 pt-2">
                      <Label className="text-xs font-semibold text-slate-700 block">
                        Service Inspiration Photo / Reference Design (Optional)
                      </Label>

                      {inspirationPhotoUrl ? (
                        <div className="relative rounded-2xl overflow-hidden border border-pink-100 h-32 flex items-center justify-center bg-pink-50/20 shadow-xs">
                          <img src={inspirationPhotoUrl} alt="Inspiration Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setInspirationPhotoUrl('')}
                            className="absolute top-2.5 right-2.5 bg-slate-950/80 text-white rounded-xl px-3 py-1 hover:bg-slate-950 transition-colors text-[10px] font-bold shadow-md"
                          >
                            Change Photo
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-pink-200/60 hover:border-pink-500 rounded-2xl p-5 text-center cursor-pointer bg-white relative transition-all duration-300 flex flex-col items-center justify-center shadow-xs">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleInspirationPhotoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={uploadingPhoto}
                          />
                          {uploadingPhoto ? (
                            <div className="flex flex-col items-center justify-center space-y-1.5">
                              <span className="w-6 h-6 rounded-full border-2 border-pink-100 border-t-pink-600 animate-spin block" />
                              <span className="text-xs text-slate-500 font-medium">Uploading reference design...</span>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-7 h-7 text-pink-400 mb-1.5" />
                              <span className="text-xs font-bold text-slate-800 block">Drag &amp; Drop or Click to Upload</span>
                              <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, WEBP up to 5MB</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 6: CONFIRM APPOINTMENT & SUMMARY ─────────── */}
                {currentStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-900">Step 6: Review &amp; Confirm</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Please review your schedule details before locking in your reservation.
                      </p>
                    </div>

                    {/* Summary Overview */}
                    <div className="p-5 rounded-2xl bg-pink-50/80 border border-pink-100 text-xs sm:text-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-pink-200/60">
                        <span className="text-slate-600">Treatment:</span>
                        <span className="font-bold text-slate-900">
                          {currentPackage ? currentPackage.name : currentService?.name || 'Custom Selection'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Date &amp; Time:</span>
                        <span className="font-semibold text-slate-900">
                          {selectedDate} at {selectedTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Service Mode:</span>
                        <span className="font-semibold text-slate-900 capitalize">
                          {serviceMode === 'salon' ? 'In-Salon (Mansarovar)' : 'Doorstep Home Service'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Guest:</span>
                        <span className="font-semibold text-slate-900">
                          {customerName} ({customerPhone})
                        </span>
                      </div>
                    </div>

                    {/* Promo Code Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code (Try LUXEUMA)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-10 rounded-xl border-pink-200 text-xs uppercase"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-slate-900 text-white hover:bg-slate-800 text-xs rounded-xl px-4"
                      >
                        Apply
                      </Button>
                    </div>

                    {/* Hygiene & Policy Assurance */}
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>100% Autoclave sterile implements &amp; verified master technicians.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Bottom Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-pink-100 mt-8">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="text-slate-600 hover:text-slate-900 text-xs font-semibold gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 6 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold rounded-xl px-6 h-11 text-xs gap-1 shadow-md"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmBooking}
                    className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold rounded-xl px-8 h-11 text-xs gap-2 shadow-lg shadow-pink-600/25"
                  >
                    {isSubmitting ? (
                      <span>Confirming Appointment...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Confirm Appointment (₹{finalPrice})</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Live Pricing Summary Sidebar */}
            <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-white shadow-md bg-white/80 space-y-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 pb-3 border-b border-pink-100">
                Booking Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Selected Item:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {currentPackage ? currentPackage.name : currentService?.name || 'Not Selected Yet'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span className="font-semibold text-slate-900">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>

                {serviceMode === 'home' && (
                  <div className="flex justify-between text-pink-600">
                    <span>Doorstep Travel Fee:</span>
                    <span className="font-semibold">+₹199</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Promo Code Discount:</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-pink-100 text-sm font-bold text-slate-900">
                  <span>Total Amount:</span>
                  <span className="font-serif text-xl text-pink-600">₹{finalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-pink-50/80 border border-pink-100 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">✨ Advance Deposit: ₹200</p>
                <p>Remaining ₹{Math.max(0, finalPrice - 200)} payable at salon / after home service.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default BookingPage;
