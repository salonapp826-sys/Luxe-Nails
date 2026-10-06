import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Menu, X, Phone, Crown, Heart, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getSubdomainUrl } from '@/utils/tenant';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { user, loading, isAuthenticated, isCustomer, isShopOwner, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle Create Your Website CTA
  const handleCreateWebsite = async () => {
    // 1. If auth is still loading, verify session directly to prevent race conditions
    if (loading) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        navigate('/admin/dashboard?tab=customizer');
        return;
      }
      localStorage.setItem('postAuthRedirect', '/admin/dashboard?tab=customizer');
      navigate('/admin/login?redirect=/admin/dashboard?tab=customizer');
      return;
    }

    // 2. If user is logged in: directly open Customizer & Subdomains without signup/login
    if (user) {
      navigate('/admin/dashboard?tab=customizer');
      return;
    }

    // 3. If logged out: save postAuthRedirect in localStorage and send to login
    localStorage.setItem('postAuthRedirect', '/admin/dashboard?tab=customizer');
    navigate('/admin/login?redirect=/admin/dashboard?tab=customizer');
  };

  // Detect scroll offset for dynamic navbar transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
  ];

  if (isShopOwner || isAdmin) {
    navLinks.push({ name: 'Dashboard', href: '/admin/dashboard' });
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav-scrolled bg-white/90 shadow-md py-2 backdrop-blur-xl border-b border-pink-200/40'
          : 'glass-nav bg-white/70 py-2.5 backdrop-blur-lg border-b border-white/60'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between gap-2">
          {/* Premium Logo & Text Area */}
          <Link
            to="/"
            className="flex items-center gap-2 group transition-all duration-300 hover:opacity-95 shrink-0 max-w-[65%] sm:max-w-none overflow-hidden"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-serif text-base sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600 bg-clip-text text-transparent truncate">
                  {tenant.business_name}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-pink-100/90 text-pink-700 border border-pink-200/80">
                  {tenant.address.split(',').reverse()[2]?.trim() || 'Jaipur'}
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-medium text-slate-500 tracking-wide uppercase truncate">
                {tenant.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all relative ${
                    isActive
                      ? 'text-pink-600 font-bold bg-pink-50/90 border border-pink-200/60 shadow-xs'
                      : 'text-slate-700 hover:text-pink-600 hover:bg-pink-50/50'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons & Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Create Website CTA Button */}
            <Button
              onClick={handleCreateWebsite}
              className="hidden md:inline-flex bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:opacity-90 px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm cursor-pointer"
            >
              Create Your Website
            </Button>

            {/* Logout Action (Desktop) */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={signOut}
                className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 font-medium text-xs"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-white/80 border border-white/90 text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-all shadow-xs"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="xl:hidden mt-3 pt-3 border-t border-pink-100 bg-white/95 rounded-2xl p-3 shadow-xl backdrop-blur-xl space-y-1 overflow-hidden"
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-pink-600 bg-pink-50 font-bold border border-pink-200/60'
                        : 'text-slate-700 hover:text-pink-600 hover:bg-pink-50/50'
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCreateWebsite();
                }}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 mt-2 text-left cursor-pointer"
              >
                <span>Create Your Website</span>
                <Sparkles className="w-4 h-4" />
              </button>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="flex items-center w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </button>
              )}

              <div className="pt-3 mt-2 border-t border-pink-100 flex items-center justify-between px-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink-500" /> Mon–Sat 10AM–8PM
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Crown className="w-3.5 h-3.5 text-amber-500" /> VIP Salon
                </span>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header;
