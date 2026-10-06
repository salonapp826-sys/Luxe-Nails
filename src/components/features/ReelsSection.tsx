import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Video,
  Sparkles,
  Flame,
  LayoutGrid,
  Columns,
  Eye,
  User,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Reel {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  source?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  artist_name?: string;
  is_active?: boolean;
  created_at?: string;
}

const INITIAL_REELS: Reel[] = [
  {
    id: 'reel-1',
    title: 'Royal Rajasthani Bridal Extension Transformation',
    description: 'Complete 3D Swarovski nail art & Sojat henna dark stain prep for our stunning bride.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-getting-a-manicure-at-a-nail-salon-43407-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=1200&fit=crop&q=80',
    category: 'BRIDAL REELS',
    source: 'Instagram Reel',
    views_count: 135000,
    likes_count: 12400,
    comments_count: 320,
    artist_name: 'By Sunita Meena',
  },
  {
    id: 'reel-2',
    title: 'Hair Transformation & Cat-Eye Extension Detailing',
    description: 'Step-by-step Russian manicure, hair gloss treatment & cat eye polish technique.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-nail-artist-applying-polish-to-a-clients-nails-43405-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=1200&fit=crop&q=80',
    category: 'HAIR TRANSFORMATION',
    source: 'YouTube Shorts',
    views_count: 142000,
    likes_count: 11900,
    comments_count: 245,
    artist_name: 'By Uma Sharma',
  },
  {
    id: 'reel-3',
    title: '3D Swarovski & Acrylic Nail Art Masterclass',
    description: 'Detailed brushwork, gel sculpting & Swarovski crystal placement tutorial.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-applying-nail-art-details-with-a-brush-43408-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=1200&fit=crop&q=80',
    category: 'NAIL ART TUTORIALS',
    source: 'Instagram Reel',
    views_count: 98000,
    likes_count: 8900,
    comments_count: 185,
    artist_name: 'By Sunita Meena',
  },
  {
    id: 'reel-4',
    title: 'Hydrating Aroma Jelly Foot Spa Pedicure',
    description: 'Deep foot soak, dead skin exfoliation & soothing lavender aroma massage.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-manicure-process-in-a-salon-43403-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=1200&fit=crop&q=80',
    category: 'SPA TRANSFORMATIONS',
    source: 'Facebook Video',
    views_count: 112000,
    likes_count: 9500,
    comments_count: 210,
    artist_name: 'By Pinky Saini',
  },
];

export function ReelsSection() {
  const navigate = useNavigate();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewToggle] = useState<'carousel' | 'grid'>('carousel');
  const [selectedWatchReel, setSelectedWatchReel] = useState<Reel | null>(null);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.warn('DB reels warning:', error);
      }

      if (data && data.length > 0) {
        setReels(
          data.map((r, i) => ({
            ...r,
            source: r.category?.includes('YouTube') ? 'YouTube Shorts' : 'Instagram Reel',
            views_count: r.views_count || 85000 + i * 12000,
            artist_name: i % 2 === 0 ? 'By Uma Sharma' : i % 3 === 0 ? 'By Sunita Meena' : 'By Pinky Saini',
          }))
        );
      } else {
        setReels(INITIAL_REELS);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      setReels(INITIAL_REELS);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainer.current) return;
    const scrollAmount = 340;
    const newScrollLeft =
      direction === 'left'
        ? scrollContainer.current.scrollLeft - scrollAmount
        : scrollContainer.current.scrollLeft + scrollAmount;

    scrollContainer.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${Math.floor(count / 1000)}K views`;
    return `${count} views`;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-16 sm:py-24 bg-gradient-to-b from-background via-rose-50/20 dark:via-slate-900/40 to-background overflow-hidden relative"
      id="trending-reels"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Section Tag Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-pink-100 dark:border-white/10 pb-6">
          <div className="space-y-3">
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-amber-500/15 text-pink-700 dark:text-pink-300 border border-pink-200/80 dark:border-pink-800/60 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-xs transition-transform duration-300 hover:scale-105">
              <Sparkles className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              <span>TRENDING ON INSTAGRAM &amp; YOUTUBE — REAL JAIPUR TRANSFORMATIONS</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-foreground leading-tight">
              Trending Reels &amp;{' '}
              <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
                Client Transformations
              </span>
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl font-light">
              Watch real client makeovers, Russian gel extensions, 3D nail art tutorials, and organic Sojat henna stain reveals created at Nails by Uma Jaipur.
            </p>
          </div>

          {/* Right Header Controls: Carousel Arrows, View All Reels, View Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Carousel Navigation Arrows */}
            {viewMode === 'carousel' && (
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/40 dark:border-white/10 p-1.5 rounded-full shadow-md">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="p-2 rounded-full hover:bg-pink-100 dark:hover:bg-slate-800 text-foreground transition-all active:scale-95 cursor-pointer"
                  aria-label="Previous Reel"
                  title="Previous Reel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="p-2 rounded-full hover:bg-pink-100 dark:hover:bg-slate-800 text-foreground transition-all active:scale-95 cursor-pointer"
                  aria-label="Next Reel"
                  title="Next Reel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* View Toggle Icon */}
            <button
              type="button"
              onClick={() => setViewToggle(viewMode === 'carousel' ? 'grid' : 'carousel')}
              className="p-2.5 rounded-full border border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-pink-50 dark:hover:bg-slate-800 text-foreground shadow-md transition-all cursor-pointer"
              title={viewMode === 'carousel' ? 'Switch to Grid View' : 'Switch to Carousel View'}
              aria-label="Toggle View"
            >
              {viewMode === 'carousel' ? <LayoutGrid className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
            </button>

            {/* View All Reels Button */}
            <Button
              onClick={() => navigate('/gallery')}
              className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold text-xs sm:text-sm px-5 h-10 rounded-full shadow-lg shadow-pink-500/20 hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Reels</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Reels Content Rendering */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-600 border-t-transparent"></div>
          </div>
        ) : reels.length === 0 ? (
          <div className="text-center py-16 glass-card p-8 max-w-md mx-auto">
            <Video className="w-12 h-12 text-pink-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold">New Reels Coming Soon!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              We are uploading high-res client transformations and nail art tutorials.
            </p>
          </div>
        ) : viewMode === 'carousel' ? (
          /* Horizontal 3-4 Column Scrollable Row */
          <div
            ref={scrollContainer}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reels.map((reel, idx) => (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="shrink-0 w-[290px] sm:w-[320px] lg:w-[330px]"
              >
                <ReelCard
                  reel={reel}
                  formatViews={formatViews}
                  onWatchReel={() => setSelectedWatchReel(reel)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* 3-4 Column Responsive Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reels.map((reel, idx) => (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <ReelCard
                  reel={reel}
                  formatViews={formatViews}
                  onWatchReel={() => setSelectedWatchReel(reel)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Live Video Player Modal */}
      {selectedWatchReel && (
        <ReelWatchModal
          reel={selectedWatchReel}
          onClose={() => setSelectedWatchReel(null)}
          onBookLook={(title) => {
            setSelectedWatchReel(null);
            navigate(`/book?service=${encodeURIComponent(title)}`);
          }}
        />
      )}
    </motion.section>
  );
}

// ── REEL CARD COMPONENT (Vertical 9:16 Frame + White/Glass Footer Box) ──────────────
function ReelCard({
  reel,
  formatViews,
  onWatchReel,
}: {
  reel: Reel;
  formatViews: (cnt: number) => string;
  onWatchReel: () => void;
}) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden group flex flex-col transition-all duration-400 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/15 border border-white/60 dark:border-white/10">
      {/* 9:16 Vertical Video Frame with Top/Bottom Overlays */}
      <div
        className="relative aspect-[9/16] bg-black overflow-hidden cursor-pointer"
        onClick={onWatchReel}
      >
        {/* Background Video Element */}
        <video
          ref={videoRef}
          src={reel.video_url}
          poster={reel.thumbnail_url || undefined}
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Dark Vignette Gradients for High Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

        {/* ── CARD TOP OVERLAY ────────────────────────────────────────── */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Top Left: Source Tag (YouTube / Instagram Reel / FB) */}
          <span className="bg-black/60 backdrop-blur-md text-white border border-white/25 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm flex items-center gap-1">
            <Video className="w-3 h-3 text-pink-400" />
            {reel.source || 'Instagram Reel'}
          </span>

          {/* Top Right: Trending Badge */}
          <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 tracking-wider uppercase">
            <Flame className="w-3 h-3 fill-white" />
            <span>Trending</span>
          </span>
        </div>

        {/* ── CENTER PLAY BUTTON PREVIEW OVERLAY ──────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center transition-all duration-300 shadow-xl group-hover:scale-110 ${
              isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-md">
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </div>
          </div>
        </div>

        {/* Top Mute Quick Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-12 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 transition-all z-20 cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-pink-300" />}
        </button>

        {/* ── BOTTOM OVERLAY ON VIDEO ──────────────────────────────────── */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1.5 z-10 pointer-events-none">
          <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider">
            {/* Category Tag */}
            <span className="text-pink-200 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-pink-400/40 uppercase">
              {reel.category || 'BRIDAL REELS'}
            </span>

            {/* Views Count */}
            <span className="text-white/95 flex items-center gap-1 drop-shadow-md">
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              {formatViews(reel.views_count)}
            </span>
          </div>

          {/* Title (Bold White Text) */}
          <h3 className="text-white font-bold text-sm sm:text-base leading-snug drop-shadow-lg line-clamp-2">
            {reel.title}
          </h3>
        </div>
      </div>

      {/* ── CARD FOOTER (Clean White / Glass Box) ────────────────────── */}
      <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-rose-100 dark:border-white/10 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Short Description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {reel.description || 'Watch our specialist nail artists craft long-lasting gel extensions & bridal nail designs.'}
          </p>

          {/* Creator / Artist Name */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <User className="w-3 h-3 text-pink-600" />
            <span>{reel.artist_name || 'By Sunita Meena'}</span>
          </div>
        </div>

        {/* Two Action Buttons: Watch Reel & Book Look */}
        <div className="flex items-center gap-2 pt-2 border-t border-rose-100/80 dark:border-white/10">
          {/* Watch Reel (Left Link / Button) */}
          <button
            type="button"
            onClick={onWatchReel}
            className="flex-1 text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/50 border border-pink-200 dark:border-pink-800/80 rounded-xl h-9 flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-pink-600 dark:fill-pink-400" />
            <span>Watch Reel</span>
          </button>

          {/* Book Look (Black / Dark CTA Button on Right) */}
          <button
            type="button"
            onClick={() => navigate(`/book?service=${encodeURIComponent(reel.title)}`)}
            className="flex-1 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-xl h-9 flex items-center justify-center gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Book Look</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FULLSCREEN WATCH REEL MODAL ───────────────────────────────────────────
function ReelWatchModal({
  reel,
  onClose,
  onBookLook,
}: {
  reel: Reel;
  onClose: () => void;
  onBookLook: (title: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-black w-full max-w-lg rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player Box */}
        <div className="relative aspect-[9/16] bg-black w-full overflow-hidden">
          <video
            src={reel.video_url}
            autoPlay
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Modal Info Footer */}
        <div className="p-5 bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-400 bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-800">
              {reel.category || 'BRIDAL REELS'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {reel.artist_name || 'By Sunita Meena'}
            </span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug">{reel.title}</h3>
          {reel.description && <p className="text-xs text-slate-300">{reel.description}</p>}

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="text-xs font-bold border-white/20 text-white hover:bg-white/10 cursor-pointer">
              Close
            </Button>
            <Button
              onClick={() => onBookLook(reel.title)}
              className="bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs px-6 cursor-pointer"
            >
              Book This Look Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

