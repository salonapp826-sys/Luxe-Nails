import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { websiteService } from '@/services/websiteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, Building2, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export function AdminSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { switchTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const roleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<'shop_owner' | 'customer'>(
    roleParam === 'customer' ? 'customer' : 'shop_owner'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: 'Admin',
    phone: '',
  });

  // Preserve redirect destination in sessionStorage to survive refresh/handshakes
  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      sessionStorage.setItem('auth_redirect_target', redirectParam);
    }
  }, [searchParams]);

  const getEffectiveRedirect = useCallback(() => {
    const postAuth = localStorage.getItem('postAuthRedirect');
    if (postAuth) {
      localStorage.removeItem('postAuthRedirect');
      return postAuth;
    }
    const target = searchParams.get('redirect') || sessionStorage.getItem('auth_redirect_target');
    if (target) {
      sessionStorage.removeItem('auth_redirect_target');
      return target;
    }
    return selectedRole === 'shop_owner' ? '/admin/dashboard?tab=customizer' : (roleParam === 'customer' ? '/profile' : '/admin/dashboard?tab=customizer');
  }, [searchParams, selectedRole, roleParam]);

  // If already logged in, do not force them into signup flow!
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const destination = getEffectiveRedirect();
      navigate(destination, { replace: true });
    }
  }, [user, authLoading, getEffectiveRedirect, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.username) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.username,
            role: selectedRole,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // 2. Website / Tenant Config (ONLY FOR SHOP OWNERS)
        if (selectedRole === 'shop_owner') {
          try {
            const { website } = await websiteService.ensureUserWebsite(data.user, {
              full_name: formData.username,
              phone: formData.phone,
            });
            if (website?.slug || website?.id) {
              const slug = website.slug || website.id;
              localStorage.setItem('current_tenant_preview', slug);
            }
          } catch (webErr) {
            console.warn('Website setup notice:', webErr);
          }
        }

        toast.success(
          selectedRole === 'shop_owner'
            ? 'Account and salon site created!'
            : 'Customer account created!'
        );
        
        // Auto-login
        try {
          await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          await refreshProfile();
        } catch (loginErr) {
          console.warn('Auto-login notice:', loginErr);
        }

        const destination = getEffectiveRedirect();
        navigate(destination);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to complete registration');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="group bg-white/75 backdrop-blur-xl border border-white/60 rounded-3xl shadow-glass p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-white/90">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-3 shadow-soft transition-all duration-300 group-hover:scale-105 group-hover:shadow-md cursor-pointer">
              <UserPlus className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-105" />
            </div>
            <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              Select your role below to get started
            </p>
          </div>

          {/* ── ROLE SELECTOR TOGGLE WIDGET ── */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('shop_owner')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'shop_owner'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Shop Owner
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'customer'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              End Client
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-xs font-bold">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. partner@nailsbyuma.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
                className="mt-1 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username" className="text-xs font-bold">
                {selectedRole === 'shop_owner' ? 'Salon / Shop Name' : 'Full Name'}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={selectedRole === 'shop_owner' ? 'e.g. Royal Nails' : 'e.g. Pooja Sharma'}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
                className="mt-1 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" className="text-xs font-bold">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +91 98290 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={loading}
                className="mt-1 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-xs font-bold">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                  className="text-xs h-10 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-xs font-bold">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                  className="text-xs h-10 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <Label htmlFor="referralCode" className="text-xs font-bold">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                placeholder="e.g. UMA500, PROMO20"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={loading}
                className="mt-1 text-xs h-10 rounded-xl"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-11 rounded-xl text-xs font-bold mt-2"
              disabled={loading}
            >
              {loading
                ? 'Registering User...'
                : selectedRole === 'shop_owner'
                ? 'Register & Set Up Salon'
                : 'Create Client Account'}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-5 text-center">
            <button
              onClick={() => {
                const redirectParam = searchParams.get('redirect');
                navigate(redirectParam ? `/admin/login?redirect=${encodeURIComponent(redirectParam)}` : '/admin/login');
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
