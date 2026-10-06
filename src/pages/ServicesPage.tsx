import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { supabase } from '@/lib/supabase';
import { INITIAL_SERVICES_DATA } from '@/services/dbService';
import { Button } from '@/components/ui/button';
import {
  Clock,
  IndianRupee,
  Sparkles,
  Home,
  ChevronLeft,
  ChevronRight,
  Star,
  Search,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ServiceImage } from '@/components/features/ServiceImage';
import { useServiceReviews } from '@/hooks/useServiceReviews';
import { ServiceReviewModal } from '@/components/features/ServiceReviewModal';

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_inr: number;
  duration_minutes: number;
  image_url: string | null;
  is_premium: boolean;
  home_service_allowed: boolean;
}

interface CategoryMeta {
  id: string;
  label: string;
  group: 'all' | 'nails' | 'spa' | 'bridal' | 'beauty' | 'mehndi';
  emoji: string;
  description: string;
  color: string;
}

const CATEGORY_META: CategoryMeta[] = [
  {
    id: 'manicure',
    label: 'Manicure',
    group: 'nails',
    emoji: '💅',
    description: 'Clean cuticle shaping, hand scrubbing massage, and nail care.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'pedicure',
    label: 'Pedicure',
    group: 'nails',
    emoji: '🦶',
    description: 'Relaxing foot bath, heel smoothing, scrub, and relaxing massage.',
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'extensions',
    label: 'Nail Extensions',
    group: 'nails',
    emoji: '💎',
    description: 'Acrylic and gel nail extensions for long, beautiful nails.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'gel-nails',
    label: 'Gel Nails',
    group: 'nails',
    emoji: '✨',
    description: 'Shiny UV gel nail polish, natural nail overlay, and chip-free color.',
    color: 'from-fuchsia-500 to-rose-500',
  },
  {
    id: 'art',
    label: 'Nail Art',
    group: 'nails',
    emoji: '🎨',
    description: 'Custom hand-painted designs, 3D flowers, glitter, and stone work.',
    color: 'from-amber-500 to-rose-500',
  },
  {
    id: 'chrome-french',
    label: 'French / Chrome / Glitter',
    group: 'nails',
    emoji: '🪞',
    description: 'Shining mirror chrome polish, French tips, and glitter shading.',
    color: 'from-indigo-400 to-pink-500',
  },
  {
    id: 'bridal',
    label: 'Bridal Nails',
    group: 'bridal',
    emoji: '👑',
    description: 'Bridal stone art, custom wedding nails, and full bridal beauty care.',
    color: 'from-rose-500 to-amber-500',
  },
  {
    id: 'mehndi',
    label: 'Mehndi & Henna',
    group: 'mehndi',
    emoji: '🌿',
    description: 'Intricate bridal, Arabic, and festival henna using 100% organic dark-stain cones.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'beauty',
    label: 'Facial & Beauty',
    group: 'beauty',
    emoji: '🌸',
    description: '24K gold glow facials, hydra dermabrasion pore infusions, anti-tan cleanups, and glow therapy.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'spa',
    label: 'Spa Treatments',
    group: 'spa',
    emoji: '🫧',
    description: 'Lavender aromatherapeutic foot baths, crystalline jelly pedicures, and hot stone reflexology.',
    color: 'from-cyan-500 to-blue-500',
  },
];

const HIGH_LEVEL_GROUPS = [
  { id: 'all', label: 'All Services', icon: '✨' },
  { id: 'nails', label: 'Nails & Extensions', icon: '💅' },
  { id: 'spa', label: 'Spa Treatments', icon: '🫧' },
  { id: 'bridal', label: 'Bridal Nails', icon: '👑' },
  { id: 'mehndi', label: 'Mehndi & Henna', icon: '🌿' },
  { id: 'beauty', label: 'Facials & Beauty', icon: '🌸' },
];

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function ServicesPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Nail & Beauty Services Menu | Manicure, Gel Nails, 3D Art & Mehndi – Nails by Uma',
    description:
      'Explore luxury nail extensions, high-gloss gel manicures, 3D Swarovski nail art, bridal mehndi, and deluxe spa treatments at Nails by Uma in Jaipur. Book in-salon or doorstep home service today.',
    keywords:
      'manicure jaipur, pedicure jaipur, gel nails jaipur, nail extensions jaipur, nail art jaipur, chrome nails, bridal nail packages, mehndi artist jaipur, facial spa jaipur, nails by uma',
    canonicalPath: '/services',
    ogImage: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&h=630&fit=crop&q=80',
  });

  useBreadcrumbSchema();

  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(5000);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState<number>(5000);
  const [loading, setLoading] = useState(true);

  const { getServiceRating, submitReview } = useServiceReviews();
  const [reviewModalService, setReviewModalService] = useState<Service | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollRow = (id: string, direction: 'left' | 'right') => {
    const container = rowRefs.current[id];
    if (container) {
      container.scrollBy({
        left: direction === 'left' ? -240 : 240,
        behavior: 'smooth'
      });
    }
  };

  const handleOpenReview = (service: Service) => {
    setReviewModalService(service);
    setIsReviewModalOpen(true);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price_inr', { ascending: true });

      let finalServices: Service[] = [];
      if (error || !data || data.length === 0) {
        finalServices = INITIAL_SERVICES_DATA as Service[];
      } else {
        const combined = [...data];
        const existingIds = new Set(data.map((d: any) => d.id));
        INITIAL_SERVICES_DATA.forEach((s) => {
          if (!existingIds.has(s.id)) {
            combined.push(s as any);
          }
        });
        finalServices = combined as Service[];
      }

      // STRICT DEDUPLICATION: Ensure no duplicate id or lowercase name exists
      const uniqueMap = new Map<string, Service>();
      finalServices.forEach((s) => {
        const key = s.id || s.name.trim().toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, s);
        }
      });
      const uniqueServices = Array.from(uniqueMap.values());

      setServices(uniqueServices);
      if (uniqueServices.length > 0) {
        const maxP = Math.max(...uniqueServices.map((s) => s.price_inr || 0));
        const ceilingMax = Math.max(Math.ceil(maxP / 500) * 500, 1000);
        setMaxPossiblePrice(ceilingMax);
        setMaxPriceFilter(ceilingMax);
      }
    } catch (err) {
      console.warn('Using local catalog for services:', err);
      const fallback = INITIAL_SERVICES_DATA as Service[];
      setServices(fallback);
      if (fallback.length > 0) {
        const maxP = Math.max(...fallback.map((s) => s.price_inr || 0));
        const ceilingMax = Math.max(Math.ceil(maxP / 500) * 500, 1000);
        setMaxPossiblePrice(ceilingMax);
        setMaxPriceFilter(ceilingMax);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if service matches search, budget, and a specific high-level group
  const matchesFilters = (s: Service, group: string) => {
    if (s.price_inr > maxPriceFilter) return false;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (group === 'all') return true;

    // Map service category to the high-level group
    const catMeta = CATEGORY_META.find((c) => c.id === s.category);
    if (catMeta && catMeta.group === group) return true;

    // Fallbacks for dynamic categories
    if (group === 'nails' && ['basic', 'premium', 'art', 'extensions', 'gel-nails', 'manicure', 'pedicure', 'chrome-french'].includes(s.category)) return true;
    if (group === 'spa' && ['spa', 'basic'].includes(s.category)) return true;
    if (group === 'bridal' && ['bridal', 'art', 'mehndi'].includes(s.category)) return true;
    if (group === 'mehndi' && ['mehndi'].includes(s.category)) return true;
    if (group === 'beauty' && ['beauty', 'spa'].includes(s.category)) return true;

    return false;
  };

  // Groups to render as horizontal rows
  const visibleGroups = HIGH_LEVEL_GROUPS.filter((g) => {
    if (g.id === 'all') return false; // Render categories separately
    if (selectedGroup !== 'all' && g.id !== selectedGroup) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/20 via-background to-muted/10 pb-20">
      {/* ── COMPACT LOW-PROFILE HERO BANNER ───────── */}
      <section className="relative bg-slate-950 text-white py-8 sm:py-12 px-4 overflow-hidden border-b border-pink-100/10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&h=400&fit=crop&q=80"
            alt="Nails by Uma Studio Banner"
            className="w-full h-full object-cover object-center opacity-30 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/70 to-slate-950/90" />
        </div>

        <div className="relative z-10 container mx-auto max-w-4xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-rose-100">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Luxury Services Menu</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Nail &amp; Beauty Treatments
          </h1>

          <p className="text-xs sm:text-sm text-rose-100/80 max-w-xl mx-auto leading-relaxed">
            Premium manicures, long-lasting gel nail art, organic bridal mehndi, and relaxing foot spa therapies.
          </p>

          {/* Search Input */}
          <div className="max-w-md mx-auto pt-1">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search treatments..."
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-white/25 bg-white/95 text-slate-950 placeholder:text-slate-500 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs sm:text-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONCISE FILTER BAR ── */}
      <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs py-2 px-3">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* High-Level Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {HIGH_LEVEL_GROUPS.map((group) => {
              const isActive = selectedGroup === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                      : 'bg-pink-50/55 text-slate-700 hover:bg-pink-100/50 hover:text-pink-600'
                  }`}
                >
                  <span className="text-[11px]">{group.icon}</span>
                  <span>{group.label}</span>
                </button>
              );
            })}
          </div>

          {/* Budget Filter */}
          <div className="flex items-center gap-2 bg-pink-50/50 p-1.5 rounded-xl border border-pink-100/60 self-start sm:self-auto">
            <span className="text-[10px] font-bold text-slate-700">Max Budget:</span>
            <input
              type="range"
              min={300}
              max={maxPossiblePrice}
              step={100}
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="accent-pink-600 h-1.5 bg-pink-200 rounded-lg cursor-pointer w-24 sm:w-28"
            />
            <span className="text-[10px] font-bold text-pink-700">₹{maxPriceFilter.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </section>

      {/* ── ONE-LINE HORIZONTAL SIDE-SCROLLING ROWS PER CATEGORY ── */}
      <section className="container mx-auto max-w-6xl px-4 pt-6 space-y-8">
        {loading ? (
          <div className="space-y-8">
            {HIGH_LEVEL_GROUPS.filter((g) => g.id !== 'all').map((group) => (
              <div key={group.id} className="space-y-3">
                {/* Heading Skeleton */}
                <div className="flex items-center justify-between border-b border-pink-100/60 pb-1.5 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-pink-100 dark:bg-pink-950/40 rounded-md" />
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="w-12 h-3 bg-slate-100 dark:bg-slate-900 rounded" />
                </div>

                {/* Cards Horizontal Row Skeleton */}
                <div className="flex flex-row overflow-x-auto gap-3.5 pb-2.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[200px] sm:w-[230px] shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-pink-100/40 p-3.5 space-y-3 shadow-xs"
                    >
                      {/* Image Skeleton with Shimmer */}
                      <div className="h-28 sm:h-32 w-full shimmer-bg rounded-xl" />
                      
                      {/* Text Skeletons */}
                      <div className="space-y-2">
                        <div className="h-3 shimmer-bg rounded w-3/4" />
                        <div className="h-2 shimmer-bg rounded w-full" />
                        <div className="h-2 shimmer-bg rounded w-5/6" />
                      </div>

                      {/* Bottom Skeleton */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="h-3 shimmer-bg rounded w-1/3" />
                        <div className="h-6 shimmer-bg rounded-lg w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          visibleGroups.map((group) => {
            const groupServices = services.filter((s) => matchesFilters(s, group.id));
            if (groupServices.length === 0) return null;

            return (
              <div key={group.id} className="space-y-3">
                {/* Category Heading & Reset */}
                <div className="flex items-center justify-between border-b border-pink-100/60 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg" aria-hidden="true">
                      {group.icon}
                    </span>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
                      {group.label}
                    </h2>
                    <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {groupServices.length}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/book')}
                    className="text-[11px] font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-0.5"
                  >
                    View All
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Horizontal Scrolling Row */}
                <div className="relative group/row">
                  {/* Left Scroll Button */}
                  <button
                    onClick={() => scrollRow(group.id, 'left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-pink-100 shadow-md text-slate-700 hover:text-pink-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center opacity-0 group-hover/row:opacity-100 hidden sm:flex"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div
                    ref={(el) => (rowRefs.current[group.id] = el)}
                    className="flex flex-row overflow-x-auto gap-3.5 pb-2.5 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
                  >
                    {groupServices.map((service) => {
                      const rating = getServiceRating(service.id);
                      return (
                        <div
                          key={service.id}
                          className="w-[200px] sm:w-[230px] shrink-0 snap-start bg-white rounded-2xl border border-pink-100/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
                          onClick={() => navigate(`/services/${service.id}`)}
                        >
                          {/* Image & Badges */}
                          <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-pink-50">
                            <ServiceImage
                              src={service.image_url}
                              alt={service.name}
                              category={service.category}
                              serviceTitle={service.name}
                              aspectRatio="16:10"
                            />
                            {service.is_premium && (
                              <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                Luxe
                              </span>
                            )}
                            {service.home_service_allowed && (
                              <span className="absolute top-2 right-2 bg-white/95 text-slate-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                                <Home className="w-2.5 h-2.5 text-pink-600" />
                                Home
                              </span>
                            )}
                          </div>

                          {/* Info Text */}
                          <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <h3 className="font-serif text-xs sm:text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                                {service.name}
                              </h3>
                              <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                {service.description || `Custom professional salon care.`}
                              </p>
                            </div>

                            {/* Rating and Duration */}
                            <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-50 pt-1.5">
                              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                {rating.averageRating}
                              </span>
                              <span className="flex items-center gap-1 font-semibold">
                                <Clock className="w-2.5 h-2.5 text-pink-400" />
                                {formatDuration(service.duration_minutes)}
                              </span>
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              ₹{service.price_inr.toLocaleString('en-IN')}
                            </span>
                            <Button
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/book?service=${service.id}`);
                              }}
                              className="bg-pink-600 hover:bg-pink-700 text-white text-[9px] font-bold px-2 py-1 h-6 rounded-md shadow-xs"
                            >
                              Book
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Scroll Button */}
                  <button
                    onClick={() => scrollRow(group.id, 'right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-pink-100 shadow-md text-slate-700 hover:text-pink-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center opacity-0 group-hover/row:opacity-100 hidden sm:flex"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Global Reset Search block */}
        {!loading && visibleGroups.every((g) => services.filter((s) => matchesFilters(s, g.id)).length === 0) && (
          <div className="text-center py-10 max-w-sm mx-auto bg-white p-6 rounded-2xl border border-pink-100 shadow-xs">
            <Search className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Services Match</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Try relaxing your search query or price budget range.</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedGroup('all');
                setMaxPriceFilter(maxPossiblePrice);
              }}
              size="sm"
              className="bg-pink-600 text-white rounded-lg px-4"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* ── RESPONSIVE COMPACT INFOGRAPHIC GRID ── */}
      <section className="container mx-auto max-w-6xl px-4 mt-12">
        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Medical Grade Autoclave</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">100% sanitized metal tool pouches opened in front of you.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Branded Certified Gels</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Organic non-toxic UV polishes that preserve nail bed health.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Premium Home Service</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Complete mobile salon experience setup inside your home.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review & Rating Modal */}
      {reviewModalService && (
        <ServiceReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          serviceId={reviewModalService.id}
          serviceName={reviewModalService.name}
          serviceImage={reviewModalService.image_url}
          onSubmitReview={submitReview}
        />
      )}
    </div>
  );
}

export default ServicesPage;
