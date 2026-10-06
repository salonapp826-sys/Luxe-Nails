import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSEO } from '@/hooks/useSEO';
import { supabase, Service } from '@/lib/supabase';
import { INITIAL_SERVICES_DATA } from '@/services/dbService';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Award, IndianRupee, Star, MessageSquare, ArrowRight, Calendar, Clock, Shield, Search, X, ShieldCheck, Crown, UserCheck, Leaf, Gem, Play, Pause, Video } from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';
import { ReviewCard } from '@/components/features/ReviewCard';
import { ReviewsCarousel } from '@/components/features/ReviewsCarousel';
import { ReelsSection } from '@/components/features/ReelsSection';
import { PromotionsSection } from '@/components/features/PromotionsSection';
import { ServiceImage } from '@/components/features/ServiceImage';
import { useServiceReviews } from '@/hooks/useServiceReviews';
import { ServiceReviewModal } from '@/components/features/ServiceReviewModal';
import { SectionDivider } from '@/components/common/SectionDivider';

const CATEGORIES = [
  { id: 'all', label: 'All Services', value: 'all' },
  { id: 'basic', label: 'Basic Nails', value: 'basic' },
  { id: 'premium', label: 'Premium Nails', value: 'premium' },
  { id: 'art', label: 'Nail Art', value: 'art' },
  { id: 'mehndi', label: 'Mehndi', value: 'mehndi' },
  { id: 'beauty', label: 'Beauty Parlour', value: 'beauty' },
];

interface Review {
  id: string;
  customer_name: string;
  service_name: string | null;
  rating: number;
  review_text: string;
  photo_url: string | null;
  created_at: string;
}

const HERO_THEMES = [
  {
    id: 'nail_art_video',
    name: 'Nail Art & Manicure Studio Video',
    shortName: 'Live Nail Art Video',
    image: '/src/assets/images/rose_gold_glow_spa_1790700271370.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-getting-a-manicure-at-a-nail-salon-43407-large.mp4',
    tagline: 'Live Salon Footage — Professional Manicure & Gel Art',
  },
  {
    id: 'gel_polish_video',
    name: 'Precision Gel Polish & Extensions',
    shortName: 'Gel & Extensions Video',
    image: '/src/assets/images/modern_beauty_campaign_1790699835066.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nail-artist-applying-polish-to-a-clients-nails-43405-large.mp4',
    tagline: 'Precision Nail Polish & Custom Extension Care',
  },
  {
    id: 'hand_care_video',
    name: 'Luxury Hand & Nail Spa Care',
    shortName: 'Nail Spa & Detail Video',
    image: '/src/assets/images/hero_henna_spa_fusion_1790699518160.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-applying-nail-art-details-with-a-brush-43408-large.mp4',
    tagline: 'Artistic Brush Handwork & Gel Extensions',
  },
  {
    id: 'salon_process_video',
    name: 'Complete Studio & Beauty Care',
    shortName: 'Studio Glow Video',
    image: '/src/assets/images/hero_minimalist_pearl_rose_1790699528926.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-manicure-process-in-a-salon-43403-large.mp4',
    tagline: 'Cozy Salon Ambiance & Professional Care',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [selectedHeroTheme, setSelectedHeroTheme] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useSEO({
    title: 'Nails by Uma | Luxury Nail Salon – Professional Manicure & Best Nail Art',
    description:
      'Nails by Uma offers luxury nail salon services including professional manicure, pedicure, gel nails, best nail art, mehndi & bridal beauty packages. Book in-salon or home service today.',
    keywords:
      'luxury nail salon, professional manicure, best nail art, gel nails, pedicure, mehndi artist, bridal nail package, beauty parlour, home nail service, nail salon near me, acrylic nails',
    canonicalPath: '/',
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Service star-rating & review submission modal state
  const { getServiceRating, submitReview } = useServiceReviews();
  const [reviewModalService, setReviewModalService] = useState<Service | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleOpenReview = (service: Service) => {
    setReviewModalService(service);
    setIsReviewModalOpen(true);
  };

  // Parallax refs
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Safe video autoplay with power-saving interruption handler & visibility tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsVideoLoaded(false);

    const playVideo = () => {
      if (document.hidden) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((_err) => {
            // Power saver or autoplay restrictions
            setIsPlaying(false);
          });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
        setIsPlaying(false);
      } else {
        playVideo();
      }
    };

    playVideo();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedHeroTheme]);

  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  // Parallax scroll effect — video moves at 40% of scroll speed
  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!videoRef.current || !heroRef.current) return;
        const scrollY = window.scrollY;
        const heroH = heroRef.current.offsetHeight;
        if (scrollY <= heroH) {
          videoRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    fetchServices();
    fetchReviews();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setServices(data);
      } else {
        setServices(INITIAL_SERVICES_DATA as any);
      }
    } catch (error) {
      console.warn('Using default services showcase:', error);
      setServices(INITIAL_SERVICES_DATA as any);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.warn('Review fetch note:', error);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      service.name.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      (service.description && service.description.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen relative animated-mesh-gradient">
      {/* Hero Section — Cinematic Ambient Background Video & Fallback Image */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Video & Fallback Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {/* HTML5 Auto-playing Muted Looping Video */}
          <video
            ref={videoRef}
            key={HERO_THEMES[selectedHeroTheme].videoUrl}
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_THEMES[selectedHeroTheme].image}
            onCanPlay={() => setIsVideoLoaded(true)}
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={() => setIsVideoLoaded(false)}
            className={`w-full h-full object-cover object-center transition-all duration-1000 scale-105 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={HERO_THEMES[selectedHeroTheme].videoUrl} type="video/mp4" />
          </video>

          {/* Fallback Background Image (Shown while video loads, or on slow connections / power saver mode) */}
          <img
            key={`fallback-${HERO_THEMES[selectedHeroTheme].id}`}
            src={HERO_THEMES[selectedHeroTheme].image}
            alt={HERO_THEMES[selectedHeroTheme].name}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 scale-105 ${
              isVideoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse-slow'
            }`}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Subtle Dark Gradient Overlays for High Headline Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/80 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/35 via-transparent to-amber-950/25 z-0 pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 sm:py-28 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Heading, Value Prop, CTAs & Trust Badges */}
              <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
                {/* Badge & Video Stream Switcher */}
                <div className="flex flex-col items-center lg:items-start gap-3 w-full">
                  <div
                    className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg text-[11px] sm:text-sm font-semibold text-white tracking-wide text-center"
                    role="note"
                    aria-label="Premium nail care experience badge"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-300 shrink-0" aria-hidden="true" />
                    <span>Beautiful Nails &amp; Friendly Beauty Care</span>
                  </div>

                  {/* Video Theme Selector Pills & Play/Pause Controls */}
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/20 p-1.5 rounded-full text-xs overflow-x-auto max-w-full scrollbar-none">
                    <button
                      type="button"
                      onClick={toggleVideoPlayback}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
                      title={isPlaying ? 'Pause Background Video' : 'Play Background Video'}
                      aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 text-pink-300" /> : <Play className="w-3.5 h-3.5 text-pink-300 fill-pink-300" />}
                    </button>

                    <div className="h-3.5 w-px bg-white/20 my-auto shrink-0" />

                    {HERO_THEMES.map((theme, idx) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedHeroTheme(idx)}
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                          selectedHeroTheme === idx
                            ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md scale-105'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                        title={theme.tagline}
                      >
                        <Video className="w-3 h-3" />
                        {theme.shortName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* H1 — Primary page heading, keyword-rich */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg px-2 sm:px-0">
                  Nails by{' '}
                  <span className="bg-gradient-to-r from-pink-300 via-rose-200 to-orange-300 bg-clip-text text-transparent">
                    Uma
                  </span>
                  {' '}—{' '}
                  <span className="text-xl sm:text-3xl lg:text-4xl font-light text-white/90 block mt-2 drop-shadow-md">
                    Your Favourite Beauty &amp; Nail Salon in Jaipur
                  </span>
                </h1>

                {/* Sub-text / page descriptor */}
                <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-sm font-light">
                  Get beautiful manicures, long-lasting gel nails, custom nail art, deep dark bridal mehndi, and glowing facials — at our cozy salon or right at your doorstep.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Button
                    size="lg"
                    onClick={() => navigate('/book')}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl h-14 px-8 text-base font-bold rounded-xl transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/gallery')}
                    className="border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-14 px-8 text-base font-semibold rounded-xl transition-all"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    View Gallery
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm pt-2">
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                      <Award className="w-4 h-4 text-pink-300" />
                    </div>
                    <span className="font-medium drop-shadow-sm text-xs sm:text-sm">Trained Specialists</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                      <Heart className="w-4 h-4 text-pink-300" />
                    </div>
                    <span className="font-medium drop-shadow-sm text-xs sm:text-sm">Premium Products</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                      <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    </div>
                    <span className="font-medium drop-shadow-sm text-xs sm:text-sm">4.9★ Rated</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25">
                      <Shield className="w-4 h-4 text-pink-300" />
                    </div>
                    <span className="font-medium drop-shadow-sm text-xs sm:text-sm">Home Service Available</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Resolution Lifestyle Services Image Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group w-full max-w-lg transition-all duration-300 hover:scale-105">
                  {/* Decorative glowing gradient aura behind the image */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-pink-500/30 via-orange-400/20 to-primary/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Main Image Frame with Glassmorphism */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/60 backdrop-blur-xl bg-white/20 transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/90">
                    <img
                      src="/src/assets/images/luxenails_spa_showcase_1790676040946.jpg"
                      alt="LuxeNails by Uma services showcase featuring manicured nails, petal soaking bowl, bridal henna, spa towels and clay facial treatment"
                      className="w-full h-auto aspect-[16/10] sm:aspect-[4/3] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Subtle vignette gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 bg-white/30 backdrop-blur-md border border-white/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                        Special Salon Care
                      </span>
                      <span className="bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
                        100% Organic &amp; Pure
                      </span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-pink-100 border border-white/20">
                          💅 Gel Extensions
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-pink-100 border border-white/20">
                          🌿 Bridal Henna
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-pink-100 border border-white/20">
                          ✨ Spa Care
                        </span>
                      </div>
                      <p className="text-xs text-white/85 line-clamp-1">
                        Petal soaking bowl, gel pearl nail art, Mehndi &amp; essential oils
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-0.5 h-8 bg-white/40 rounded-full" />
          <p className="text-white/50 text-xs font-medium tracking-widest uppercase">Scroll</p>
        </div>
      </motion.section>

      <SectionDivider icon={<Crown className="w-4 h-4 text-amber-500" />} />

      {/* ── 2. QUICK CATEGORY BAR & POPULAR SERVICES SECTION ───────────── */}
      <section className="py-12 bg-card border-b shadow-xs relative z-20" id="categories">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest block mb-1">
                Quick Category Navigation
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                Popular Services &amp; Beauty Menu
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/services')}
              className="text-xs font-bold border-pink-200 text-pink-700 hover:bg-pink-50 rounded-full w-fit"
            >
              View Full Menu <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Quick Category Chips Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-3 no-scrollbar">
            {[
              { id: 'all', label: '💅 All Services' },
              { id: 'basic', label: '✨ Basic Nails & Polish' },
              { id: 'premium', label: '👑 Gel Extensions' },
              { id: 'art', label: '🎨 3D Swarovski Art' },
              { id: 'mehndi', label: '🌿 Bridal Mehndi' },
              { id: 'beauty', label: '🫧 Pedicure & Spa' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const servElem = document.getElementById('popular-services');
                  if (servElem) servElem.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white shadow-md scale-105'
                    : 'bg-background border border-pink-200/80 hover:border-pink-400 text-foreground hover:bg-pink-50/50'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid Section with Ambient Mesh Gradient Backdrop */}
      <section className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-rose-50/30 via-purple-50/20 to-amber-50/30" id="popular-services">
        {/* Soft Glowing Ambient Orbs for Glassmorphism Illumination */}
        <div className="absolute top-12 left-10 w-96 h-96 glow-orb-pink opacity-60 pointer-events-none" />
        <div className="absolute bottom-16 right-10 w-96 h-96 glow-orb-purple opacity-50 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] glow-orb-gold opacity-40 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          {/* Search Input Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beauty services by name or category (e.g. Gel, Manicure, Facial, Mehndi)..."
                className="w-full pl-12 pr-10 py-4 rounded-2xl border border-pink-200/80 bg-white/80 backdrop-blur-md text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick search suggestion tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs">
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                Popular:
              </span>
              {['Manicure', 'Pedicure', 'Gel Nail Art', 'Bridal', 'Mehndi', 'Facial'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    setSelectedCategory('all');
                  }}
                  className={`px-3 py-1 rounded-full border transition-all font-medium ${
                    searchQuery.toLowerCase() === tag.toLowerCase()
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white/80 hover:bg-pink-50 text-slate-700 hover:text-foreground border-pink-200/80 backdrop-blur-xs'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Service Cards Grid */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 glass-card p-8 max-w-md mx-auto">
              <p className="text-muted-foreground mb-4 font-light">No services match your search.</p>
              <Button onClick={() => setSearchQuery('')} variant="outline" size="sm" className="rounded-full">
                Clear Filter
              </Button>
            </div>
          ) : (
            <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none gap-4 md:gap-8 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {filteredServices.map((service, idx) => {
                const rating = getServiceRating(service.id, service.name);
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    className="glass-card rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-pink-500/15 transition-all duration-400 group cursor-pointer flex flex-col justify-between border border-white/80 dark:border-white/10 hover:border-pink-300/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl w-[82vw] sm:w-[350px] md:w-auto shrink-0 snap-start"
                    onClick={() => navigate('/book')}
                  >
                    <div>
                      <ServiceImage
                        src={service.image_url}
                        alt={`${service.name} – professional nail service at Nails by Uma luxury nail salon`}
                        category={service.category}
                        serviceTitle={service.name}
                        aspectRatio="16:9"
                      >
                        {/* Rating pill overlay */}
                        <div className="absolute top-3 left-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReview(service);
                            }}
                            className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-foreground shadow-sm hover:scale-105 transition-all"
                            title="View reviews and rate this service"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{rating.averageRating}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({rating.reviewCount})
                            </span>
                          </button>
                        </div>
                      </ServiceImage>
                      <div className="p-6 sm:p-7 space-y-3">
                        <h3 className="text-xl sm:text-2xl font-serif font-bold group-hover:text-primary transition-colors leading-tight">
                          {service.name}
                        </h3>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <div className="flex items-center text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.floor(rating.averageRating)
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-foreground text-xs ml-0.5">
                              {rating.averageRating}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReview(service);
                            }}
                            className="text-xs font-semibold text-primary hover:text-accent hover:underline flex items-center gap-1 py-0.5"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Rate &amp; Review
                          </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-6 sm:p-7 pt-0 flex items-center justify-between border-t border-rose-100/80 dark:border-white/10 mt-auto">
                      <div className="flex items-center gap-1 text-2xl font-bold font-serif text-primary">
                        <IndianRupee className="w-5 h-5" />
                        {service.price_inr}
                      </div>
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground/70" />
                        {service.duration_minutes} min
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 3. SPECIAL OFFERS & COMBO PACKAGES SECTION ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <PromotionsSection />
      </motion.div>

      {/* ── 4. TRENDING REELS & CLIENT TRANSFORMATIONS (GALLERY) ───────── */}
      <ReelsSection />

      <SectionDivider icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />} />

      {/* ── 5. OUR HYGIENE & SAFETY PROMISE SECTION ────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="bg-gradient-to-r from-pink-50/60 via-white to-amber-50/50 py-20 sm:py-24 border-y border-pink-100 dark:border-pink-900/30 relative"
        id="hygiene-promise"
      >
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400 block">
              OUR HYGIENE &amp; SAFETY PROMISE
            </span>
            <h2 className="section-title-app text-slate-900 dark:text-white">
              100% Clean, Safe &amp; Hygienic Beauty Care
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              Your health and safety come first. We use 100% sanitized tools and safe products so you can relax without any worry.
            </p>
          </div>

          <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none gap-4 md:gap-8 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="glass-card p-8 rounded-3xl border border-white/80 dark:border-white/10 shadow-xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl transition-all duration-400 hover:-translate-y-2.5 hover:scale-[1.03] w-[82vw] sm:w-[350px] md:w-auto shrink-0 snap-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xl font-bold mb-6 shadow-md shimmer-icon-glow">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3">100% Sanitized &amp; Clean Tools</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                All metal tools are cleaned and sterilized in high-temperature machines, then opened from fresh sealed pouches right in front of you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-8 rounded-3xl border border-white/80 dark:border-white/10 shadow-xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl transition-all duration-400 hover:-translate-y-2.5 hover:scale-[1.03] w-[82vw] sm:w-[350px] md:w-auto shrink-0 snap-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold mb-6 shadow-md shimmer-icon-glow">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3">Pure &amp; Safe Henna</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                No harmful chemicals or dyes. We use pure Rajasthani henna mixed with natural oils for safe, deep dark mehndi color.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="glass-card p-8 rounded-3xl border border-white/80 dark:border-white/10 shadow-xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl transition-all duration-400 hover:-translate-y-2.5 hover:scale-[1.03] w-[82vw] sm:w-[350px] md:w-auto shrink-0 snap-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold mb-6 shadow-md shimmer-icon-glow">
                <Gem className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3">Safe &amp; Chemical-Free Gels</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                We use high-quality, branded gel polishes that protect your natural nails from damage, thinning, or yellowing.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <SectionDivider icon={<Star className="w-4 h-4 text-amber-500 fill-amber-400" />} />

      {/* ── 6. CUSTOMER REVIEWS & TESTIMONIALS SECTION ──────────────────── */}
      {reviews.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          className="py-20 sm:py-24 bg-gradient-to-b from-background via-rose-50/20 to-background relative"
          id="reviews"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 bg-pink-100/80 dark:bg-pink-950/60 px-4 py-2 rounded-full shadow-xs" aria-hidden="true">
                <Star className="w-4 h-4 text-primary fill-primary shimmer-icon-glow" />
                <span className="text-xs sm:text-sm font-bold tracking-wider text-primary uppercase">Customer Reviews</span>
              </div>
              <h2 className="section-title-app text-foreground">What Our Clients Say About Our Nail Salon</h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                Real experiences from clients who trusted Nails by Uma for professional manicure, nail art &amp; beauty services
              </p>
            </div>

            <div className="mb-10">
              <ReviewsCarousel reviews={reviews} autoPlayInterval={5000} />
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/reviews')}
                variant="outline"
                className="gap-2 group border-pink-200 hover:bg-pink-50 rounded-full px-8 py-3 font-bold text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                View All Reviews &amp; Share Yours
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── 7. ABOUT NAILS BY UMA & EXPERT STAFF SECTION ───────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-rose-50/30 to-white relative overflow-hidden"
        id="why-choose-us"
      >
        {/* Soft Background Radial Glow Effects */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-pink-300/20 via-rose-200/15 to-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT SIDE: Dominant Heading, Emotional Statement, CTA & Trust Metrics */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 border border-pink-200/60 text-pink-700 text-xs font-bold uppercase tracking-widest mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-pink-600 shimmer-icon-glow" /> About Nails by Uma
                </span>
                
                <h2 className="section-title-app text-slate-900 leading-[1.1]">
                  Why Choose <br />
                  <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
                    Nails by Uma
                  </span>
                </h2>
              </div>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                We combine years of professional experience, 100% sterilized clean tools, personal attention, and warm Indian hospitality so you feel completely pampered.
              </p>

              {/* CTA & Secondary Text */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => navigate('/book')}
                  className="group relative overflow-hidden bg-gradient-to-r from-pink-600 via-rose-500 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-2xl shadow-xl shadow-pink-500/20 px-8 py-6 text-sm sm:text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 btn-pulse-app"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Experience the Difference <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                  Trusted by beauty lovers who expect more than an ordinary salon visit.
                </p>
              </div>

              {/* Trust Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-rose-200/60 dark:border-white/10">
                <div className="group cursor-default">
                  <div className="font-serif text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
                    10+
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">
                    Years Experience
                  </div>
                </div>

                <div className="group cursor-default">
                  <div className="font-serif text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
                    5K+
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">
                    Happy Clients
                  </div>
                </div>

                <div className="group cursor-default">
                  <div className="font-serif text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left">
                    100%
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">
                    Hygiene Focus
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Large Central "Luxury Promise" Glass Panel & Organic Floating Badges */}
            <div className="lg:col-span-7 relative">
              
              {/* Organic Floating Glass Badges */}
              <div className="absolute -top-6 -left-4 sm:-top-8 sm:-left-6 z-20 animate-float-subtle">
                <div className="glass-chip px-4 py-2 rounded-full text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 shadow-lg border border-white/80 dark:border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500 shimmer-icon-glow" />
                  <span>Premium Care</span>
                </div>
              </div>

              <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 z-20 animate-float-slow">
                <div className="glass-chip px-4 py-2 rounded-full text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 shadow-lg border border-white/80 dark:border-white/20">
                  <Crown className="w-3.5 h-3.5 text-amber-500 shimmer-icon-glow" />
                  <span>Certified Professionals</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-6 z-20 animate-float-subtle">
                <div className="glass-chip px-4 py-2 rounded-full text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 shadow-lg border border-white/80 dark:border-white/20">
                  <Award className="w-3.5 h-3.5 text-rose-500 shimmer-icon-glow" />
                  <span>Luxury Experience</span>
                </div>
              </div>

              {/* MAIN CENTER GLASS PANEL */}
              <div className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/90 dark:border-white/15 rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-2xl shadow-pink-500/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-pink-500/20">
                
                {/* Panel Header */}
                <div className="border-b border-rose-100 dark:border-white/10 pb-6 mb-8">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    Your Beauty, Our Special Care.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">
                    Our simple promise: great beauty care, total hygiene, and a friendly smile every time.
                  </p>
                </div>

                {/* 4 Visually Distinct Trust Points connected with thin line */}
                <div className="relative space-y-8">
                  {/* Thin Connecting Vertical Line */}
                  <div className="absolute left-[23px] sm:left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-pink-400 via-rose-300 to-amber-300 opacity-40 pointer-events-none" />

                  {/* 01 — Expert Craft */}
                  <div className="relative flex items-start gap-5 sm:gap-6 group/item">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-md shadow-pink-500/20 group-hover/item:scale-110 group-hover/item:shadow-pink-500/40 transition-all duration-300 z-10">
                      01
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                          Expert Craft
                        </h4>
                        <Award className="w-4 h-4 text-pink-500 opacity-70 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-light">
                        Professional nail artists and beauty specialists with years of hands-on experience in Russian techniques &amp; 3D extensions.
                      </p>
                    </div>
                  </div>

                  {/* 02 — Hygiene First */}
                  <div className="relative flex items-start gap-5 sm:gap-6 group/item pl-2 sm:pl-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 group-hover/item:scale-110 group-hover/item:shadow-rose-500/40 transition-all duration-300 z-10">
                      02
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                          Hygiene First
                        </h4>
                        <ShieldCheck className="w-4 h-4 text-rose-500 opacity-70 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-light">
                        Sterilized tools, single-use buffers, clean workstations, safe high-quality polishes, and strict hygiene practices.
                      </p>
                    </div>
                  </div>

                  {/* 03 — Personal Attention */}
                  <div className="relative flex items-start gap-5 sm:gap-6 group/item">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 group-hover/item:scale-110 group-hover/item:shadow-amber-500/40 transition-all duration-300 z-10">
                      03
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                          Personal Attention
                        </h4>
                        <Heart className="w-4 h-4 text-amber-500 opacity-70 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-light">
                        Every appointment is customized according to your unique nail health, style preference, comfort, and aesthetic vision.
                      </p>
                    </div>
                  </div>

                  {/* 04 — Timely Service */}
                  <div className="relative flex items-start gap-5 sm:gap-6 group/item pl-2 sm:pl-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-md shadow-pink-600/20 group-hover/item:scale-110 group-hover/item:shadow-pink-600/40 transition-all duration-300 z-10">
                      04
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                          Timely Service
                        </h4>
                        <Clock className="w-4 h-4 text-pink-600 opacity-70 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-light">
                        Thoughtfully managed schedule slots with dedicated artists, zero waiting delays, and smooth, attentive salon hospitality.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* Signature Luxury Experience Spotlight */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="py-16 px-4 bg-gradient-to-b from-muted/30 to-background overflow-hidden relative"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="group rounded-[32px] p-6 sm:p-10 lg:p-12 border border-white/80 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl transition-all duration-400 hover:scale-[1.015]">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-pink-100/80 text-pink-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-transform duration-300 group-hover:scale-105">
                  <Sparkles className="w-3.5 h-3.5 shimmer-icon-glow" />
                  Special Care by Expert Artists
                </div>
                <h2 className="section-title-app leading-tight text-foreground">
                  The Special{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Nails by Uma
                  </span>{' '}
                  Experience
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                  Enjoy total self-care and relaxation. From fresh petal hand soaks
                  and shine-finish gel extensions with pearl &amp; glitter accents, to traditional deep dark
                  Mehndi and glowing organic facial treatments — we give you full attention.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-pink-50/80 dark:bg-slate-800/80 border border-pink-100 dark:border-white/10">
                    <p className="font-semibold text-foreground text-sm flex items-center gap-2 font-serif">
                      <Sparkles className="w-4 h-4 text-primary shimmer-icon-glow" /> Petal Hand Soaks
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-light">Nourishing botanicals &amp; cuticle care</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-pink-50/80 dark:bg-slate-800/80 border border-pink-100 dark:border-white/10">
                    <p className="font-semibold text-foreground text-sm flex items-center gap-2 font-serif">
                      <Sparkles className="w-4 h-4 text-accent shimmer-icon-glow" /> Gel &amp; Pearl Art
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-light">Chip-free high-gloss extensions</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-pink-50/80 dark:bg-slate-800/80 border border-pink-100 dark:border-white/10">
                    <p className="font-semibold text-foreground text-sm flex items-center gap-2 font-serif">
                      <Sparkles className="w-4 h-4 text-emerald-600 shimmer-icon-glow" /> Deep Mehndi
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-light">100% natural organic henna</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-pink-50/80 dark:bg-slate-800/80 border border-pink-100 dark:border-white/10">
                    <p className="font-semibold text-foreground text-sm flex items-center gap-2 font-serif">
                      <Sparkles className="w-4 h-4 text-pink-600 shimmer-icon-glow" /> Glow Spa Facials
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-light">Clay masks &amp; cucumber soothing</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button
                    onClick={() => navigate('/book')}
                    className="bg-gradient-to-r from-primary to-accent text-white font-bold rounded-2xl shadow-lg h-12 px-7 btn-pulse-app"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Special Session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/packages')}
                    className="border-pink-200 hover:bg-pink-50 text-foreground font-semibold rounded-2xl h-12 px-7"
                  >
                    View All Packages
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="relative group overflow-hidden rounded-3xl shadow-2xl border-2 border-pink-100">
                  <img
                    src="/src/assets/images/luxenails_spa_showcase_1790676040946.jpg"
                    alt="LuxeNails by Uma luxury copper tray spa setup with manicured nails, petal soak, mehndi art, and facial care"
                    className="w-full h-full object-cover aspect-[4/3] sm:aspect-square lg:aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs uppercase tracking-wider font-semibold text-pink-200">Personalized Salon &amp; Home Care</p>
                    <p className="text-sm font-medium text-white/95">Prepared with clean fresh towels, natural oils &amp; gentle skin products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 8. STATS & FINAL CTA SECTION ───────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="py-16 px-4 bg-gradient-to-r from-primary/5 to-accent/5 relative"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '5000+', label: 'Happy Customers' },
              { value: '50+', label: 'Services Offered' },
              { value: '10+', label: 'Years Experience' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl md:text-5xl font-extrabold font-serif bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="py-24 px-4 bg-gradient-to-r from-primary/10 via-rose-100/30 to-accent/10 relative"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="section-title-app mb-5">
            Book Your Luxury Nail Appointment Today
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 font-light leading-relaxed">
            Experience professional manicure, gel nails &amp; nail art at our luxury nail salon — or book a home service
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => (window.location.href = '/book')}
              className="bg-gradient-to-r from-primary to-accent text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all h-14 px-9 font-bold rounded-2xl btn-pulse-app"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = '/packages')}
              className="border-pink-200 hover:bg-pink-50 h-14 px-9 font-bold rounded-2xl"
            >
              <Sparkles className="mr-2 h-5 w-5 shimmer-icon-glow" />
              View Packages
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Service Star-Rating and Review Submission Modal */}
      {reviewModalService && (
        <ServiceReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewModalService(null);
          }}
          service={reviewModalService}
          ratingAggregate={getServiceRating(reviewModalService.id, reviewModalService.name)}
          onSubmitReview={submitReview}
        />
      )}
    </div>
  );
}
