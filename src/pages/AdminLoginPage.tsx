import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, DEMO_ROLES } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, ShieldCheck, Crown, UserCheck, Sparkles, Building2, Eye, EyeOff } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { signIn, loginAsDemoRole, user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preserve redirect destination in sessionStorage to survive refresh/handshakes
  useEffect(() => {
    if (redirectParam) {
      sessionStorage.setItem('auth_redirect_target', redirectParam);
    }
  }, [redirectParam]);

  const getEffectiveRedirect = useCallback(() => {
    const postAuth = localStorage.getItem('postAuthRedirect');
    if (postAuth) {
      localStorage.removeItem('postAuthRedirect');
      return postAuth;
    }
    const target = redirectParam || sessionStorage.getItem('auth_redirect_target');
    if (target) {
      sessionStorage.removeItem('auth_redirect_target');
      return target;
    }
    return role === 'customer' ? '/profile' : '/admin/dashboard';
  }, [redirectParam, role]);

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const destination = getEffectiveRedirect();
      navigate(destination, { replace: true });
    }
  }, [user, authLoading, getEffectiveRedirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back to Nails by Uma Admin OS!',
      });
      const destination = getEffectiveRedirect();
      navigate(destination);
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. You can use the Quick Demo Logins below.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'owner' | 'manager' | 'receptionist') => {
    loginAsDemoRole(role);
    const demoInfo = DEMO_ROLES[role];
    toast({
      title: `Logged in as ${demoInfo.name}`,
      description: `Role: ${demoInfo.roleTitle} | Outlet: ${demoInfo.branch}`,
    });
    const destination = getEffectiveRedirect();
    navigate(destination);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-pink-50 via-rose-50/30 to-amber-50/40">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Card */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/90 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-pink-500/20 text-white">
              <Crown className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Nails by Uma - Jaipur
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Aura Luxe Business Platform OS (Admin Access)
            </p>
          </div>

          {/* Quick Demo Role Switcher Section */}
          <div className="bg-gradient-to-r from-pink-50/80 via-white to-amber-50/80 p-4 rounded-2xl border border-pink-100/90 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>One-Click Quick Demo Role Login</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('owner')}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs sm:text-sm font-bold shadow-sm hover:scale-[1.01] hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                  <div className="text-left">
                    <span className="block leading-tight">LOGIN AS BUSINESS OWNER / UMA SHARMA</span>
                    <span className="text-[10px] text-pink-100 font-normal">Full Unrestricted Access • All Outlets</span>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('manager')}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-pink-200 text-xs font-semibold hover:bg-pink-50 hover:border-pink-300 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <span className="truncate">Branch Manager</span>
                  </div>
                  <UserCheck className="w-3 h-3 text-pink-600 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('receptionist')}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-pink-200 text-xs font-semibold hover:bg-pink-50 hover:border-pink-300 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <UserCheck className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <span className="truncate">Receptionist Desk</span>
                  </div>
                  <Lock className="w-3 h-3 text-pink-600 shrink-0" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative text-center my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Or Login with Password</span>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-bold">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="uma@nailsbyuma.in"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-bold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 text-xs pr-10 h-10 rounded-xl"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-xl text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </form>

          <div className="text-center pt-2 border-t flex items-center justify-between text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-pink-600 hover:bg-pink-50 text-xs"
            >
              ← Return to Salon Website
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() =>
                navigate(
                  redirectParam
                    ? `/admin/signup?role=shop_owner&redirect=${encodeURIComponent(redirectParam)}`
                    : '/admin/signup?role=shop_owner'
                )
              }
              className="text-pink-600 font-bold text-xs"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
