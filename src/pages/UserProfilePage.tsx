import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, Booking } from '@/lib/supabase';
import { calculateLuxePoints, LuxeProfileSummary } from '@/lib/luxePoints';
import { LuxePointsCard } from '@/components/features/LuxePointsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Clock,
  Phone,
  Search,
  Sparkles,
  Award,
  CalendarCheck,
  User,
  ArrowRight,
  LogOut,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';
import { toast } from 'sonner';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<LuxeProfileSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentTab, setCurrentTab] = useState<'points' | 'appointments'>('points');

  // Load saved phone number on mount
  useEffect(() => {
    const savedPhone =
      localStorage.getItem('customer_phone') ||
      (location.state as { phone?: string })?.phone ||
      '';
    if (savedPhone) {
      setPhone(savedPhone);
      fetchCustomerData(savedPhone);
    }
  }, []);

  const fetchCustomerData = async (queryPhone: string) => {
    const cleanPhone = queryPhone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_phone', cleanPhone)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userBookings = data || [];
      setBookings(userBookings);

      // Calculate Luxe Points Profile
      const luxeSummary = calculateLuxePoints(cleanPhone, userBookings);
      setSummary(luxeSummary);

      // Save to localStorage for convenience
      localStorage.setItem('customer_phone', cleanPhone);

      if (userBookings.length === 0) {
        toast.info('No past bookings found for this phone number yet. Book a service to start earning Luxe Points!');
      } else {
        toast.success(`Welcome back, ${luxeSummary.customerName}! You have ${luxeSummary.availablePoints} Luxe Points.`);
      }
    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomerData(phone);
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_phone');
    setPhone('');
    setBookings([]);
    setSummary(null);
    setSearched(false);
    toast.info('Logged out of Luxe profile view.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-pink-50/20 to-background py-12 sm:py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Page Title & Intro */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Nails by Uma · VIP Loyalty Club
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3">
            Luxe Points &amp;{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-pink-500 bg-clip-text text-transparent">
              Member Profile
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Earn rewards with every appointment. Unlock VIP tier discounts, free nail upgrades, and redeem points for vouchers.
          </p>
        </div>

        {/* Search / Access Form if not loaded */}
        {!summary && (
          <div className="space-y-8 max-w-xl mx-auto">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-xl">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div>
                  <label htmlFor="profile-phone" className="block text-sm font-bold text-foreground mb-2">
                    Enter Your WhatsApp / Phone Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="profile-phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="flex-1 rounded-xl h-12"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-primary to-accent text-white font-bold h-12 px-6 rounded-xl shadow-md hover:scale-105 transition-all"
                    >
                      {loading ? (
                        'Loading...'
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          View My Points
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the phone number you used when booking to view your points balance, tier rewards, and booking history.
                  </p>
                </div>
              </form>
            </div>

            {/* How Loyalty Program Works Preview */}
            <div className="glass-card p-6 rounded-3xl border border-pink-100 shadow-md space-y-4 bg-white/80">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <span>How Our Loyalty Program Works</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
                  <span className="text-lg mb-1 block">💅</span>
                  <span className="font-bold text-foreground block">1 Point per ₹10</span>
                  <span className="text-muted-foreground mt-0.5 block">Earn points automatically on every booking.</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
                  <span className="text-lg mb-1 block">🌸</span>
                  <span className="font-bold text-foreground block">+100 Welcome Bonus</span>
                  <span className="text-muted-foreground mt-0.5 block">Get bonus points on your very first appointment.</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
                  <span className="text-lg mb-1 block">🎟️</span>
                  <span className="font-bold text-foreground block">Redeem Vouchers</span>
                  <span className="text-muted-foreground mt-0.5 block">Use points for ₹50, ₹120, ₹250, or ₹550 discount coupons.</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Button
                  onClick={() => navigate('/book')}
                  variant="outline"
                  className="border-pink-200 text-primary font-bold text-xs rounded-xl hover:bg-pink-50"
                >
                  Book Service to Earn Points Now →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Loaded Content */}
        {summary && (
          <div className="space-y-8">
            {/* Customer Switcher / Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-rose text-primary font-black flex items-center justify-center shadow-xs">
                  {summary.customerName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-base text-foreground leading-tight">
                    {summary.customerName}
                  </h2>
                  <p className="text-xs text-muted-foreground">{summary.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/book')}
                  className="bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs h-9 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Book Appointment
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-xs text-muted-foreground hover:text-destructive h-9"
                  title="Switch or clear phone number"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Switch
                </Button>
              </div>
            </div>

            {/* Profile Navigation Tabs: Points vs Appointments */}
            <div className="flex p-1.5 bg-muted/60 backdrop-blur-md rounded-2xl max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setCurrentTab('points')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  currentTab === 'points'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-4 h-4 text-pink-500" />
                Luxe Points Club
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('appointments')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  currentTab === 'appointments'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-primary" />
                Appointments ({bookings.length})
              </button>
            </div>

            {/* TAB 1: LUXE POINTS VIP CLUB */}
            {currentTab === 'points' && (
              <LuxePointsCard
                summary={summary}
                onRefresh={() => fetchCustomerData(summary.phone)}
              />
            )}

            {/* TAB 2: APPOINTMENTS HISTORY */}
            {currentTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">
                    Appointment History ({bookings.length})
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => navigate('/book')}
                    className="bg-primary text-white text-xs rounded-xl"
                  >
                    + New Booking
                  </Button>
                </div>

                {bookings.length === 0 ? (
                  <div className="glass-card p-12 rounded-3xl text-center">
                    <Calendar className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-foreground mb-1">No Past Appointments</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      You haven't completed any salon or home bookings yet.
                    </p>
                    <Button
                      onClick={() => navigate('/book')}
                      className="bg-gradient-to-r from-primary to-accent text-white rounded-xl"
                    >
                      Book First Appointment (+100 Bonus Pts)
                    </Button>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="glass-card p-5 sm:p-6 rounded-2xl border border-pink-100 hover:border-primary/40 transition-all shadow-xs"
                    >
                      <div className="flex flex-col lg:flex-row justify-between gap-5">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-xl font-bold text-foreground">
                                {booking.service_name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Booking Ref: <span className="font-mono">{booking.booking_id}</span>
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                booking.booking_status
                              )}`}
                            >
                              {booking.booking_status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              <span>
                                {new Date(booking.appointment_date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>{booking.appointment_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span className="capitalize">{booking.visit_type} Service</span>
                            </div>
                            {booking.technician_name && (
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-primary" />
                                <span>Artist: {booking.technician_name}</span>
                              </div>
                            )}
                          </div>

                          {/* Points Earned Tag */}
                          <div className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-200 text-pink-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <Sparkles className="w-3 h-3 text-pink-500" />
                            Earned +{Math.floor(booking.total_price / 10)} Luxe Points
                          </div>
                        </div>

                        {/* Payment summary on the right */}
                        <div className="lg:w-60 border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-5 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Price:</span>
                            <span className="font-bold text-foreground">
                              {formatINR(booking.total_price)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Advance Paid:</span>
                            <span className="font-bold text-green-600">
                              {formatINR(booking.advance_amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className="font-bold text-orange-600">
                              {formatINR(booking.remaining_amount)}
                            </span>
                          </div>

                          <div className="pt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate('/book')}
                              className="w-full text-xs h-8 border-primary/40 text-primary hover:bg-primary/10"
                            >
                              Re-book Service
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
