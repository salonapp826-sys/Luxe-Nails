import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sparkles,
  Calendar,
  UserCheck,
  Menu,
  X,
  Home,
  Info,
  Image,
  Star,
  HelpCircle,
  Phone,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const moreLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About Nails by Uma', href: '/about', icon: Info },
    { name: 'Transformation Gallery', href: '/gallery', icon: Image },
    { name: 'Client Reviews', href: '/reviews', icon: Star },
    { name: 'FAQ & Location', href: '/faq', icon: HelpCircle },
    { name: 'Contact & WhatsApp', href: '/contact', icon: Phone },
    { name: 'Admin Dashboard', href: isAuthenticated ? '/admin/dashboard' : '/admin/login', icon: ShieldAlert },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Visible only on screens < md / 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-pink-100/80 shadow-[0_-8px_30px_rgba(225,29,72,0.1)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 items-center h-16 px-2">
          {/* 1. Services */}
          <button
            onClick={() => navigate('/services')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              isActive('/services') ? 'text-pink-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <motion.div whileTap={{ scale: 0.92 }} className="flex flex-col items-center">
              <Sparkles className={`w-5 h-5 mb-0.5 ${isActive('/services') ? 'text-pink-600' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight">Services</span>
            </motion.div>
          </button>

          {/* 2. Book Now (Central Prominent CTA) */}
          <div className="flex flex-col items-center justify-center">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate('/book')}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-pink-600/30 btn-pulse-app -mt-4 border-2 border-white"
              aria-label="Book Appointment"
            >
              <Calendar className="w-5 h-5 text-white" />
            </motion.button>
            <span className="text-[10px] font-bold text-pink-600 mt-0.5">Book Now</span>
          </div>

          {/* 3. My Bookings / Profile */}
          <button
            onClick={() => navigate('/my-bookings')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              isActive('/my-bookings') ? 'text-pink-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <motion.div whileTap={{ scale: 0.92 }} className="flex flex-col items-center">
              <UserCheck className={`w-5 h-5 mb-0.5 ${isActive('/my-bookings') ? 'text-pink-600' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight">Bookings</span>
            </motion.div>
          </button>

          {/* 4. More Menu */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              moreDrawerOpen ? 'text-pink-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <motion.div whileTap={{ scale: 0.92 }} className="flex flex-col items-center">
              <Menu className="w-5 h-5 mb-0.5 text-slate-500" />
              <span className="text-[10px] tracking-tight">More</span>
            </motion.div>
          </button>
        </div>
      </div>

      {/* More Menu Bottom Drawer / Modal */}
      <AnimatePresence>
        {moreDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-3xl p-6 shadow-2xl border-t border-pink-100 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-base">Nails by Uma</h3>
                    <p className="text-[10px] text-slate-500">Jaipur Luxury Atelier Menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setMoreDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-rose-50"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {moreLinks.map((item) => {
                  const Icon = item.icon;
                  const currentActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMoreDrawerOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-2xl text-sm font-semibold transition-all ${
                        currentActive
                          ? 'bg-pink-50 text-pink-600 font-bold border border-pink-200/60'
                          : 'text-slate-700 hover:bg-rose-50/60 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentActive ? 'bg-pink-100 text-pink-600' : 'bg-rose-50 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-pink-100 text-center">
                <p className="text-xs text-slate-500">Mansarovar, Jaipur • +91 63765 39366</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileBottomNav;
