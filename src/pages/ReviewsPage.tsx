import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ReviewCard } from '@/components/features/ReviewCard';
import { ReviewIncentiveBanner } from '@/components/features/ReviewIncentiveBanner';
import { ReviewsCarousel } from '@/components/features/ReviewsCarousel';
import { ArrowLeft, Star, Upload, Loader2, MessageSquarePlus, Gift, Camera, LayoutGrid, SlidersHorizontal, Sparkles, ThumbsUp } from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  service_name: string | null;
  rating: number;
  review_text: string;
  photo_url: string | null;
  created_at: string;
}

export function ReviewsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useSEO({
    title: 'Customer Reviews | Nails by Uma – Rated 4.9★ Luxury Nail Salon',
    description:
      'Read genuine customer reviews for Nails by Uma nail salon. See what clients say about our professional manicure, gel nails, nail art, mehndi & beauty services. 4.9★ rated by 500+ happy customers.',
    keywords:
      'nail salon reviews, Nails by Uma reviews, manicure reviews, gel nails reviews, nail art reviews, beauty salon near me reviews, best nail salon reviews',
    canonicalPath: '/reviews',
  });

  // ── BreadcrumbList JSON-LD — Home > Reviews ──────────────────────
  useBreadcrumbSchema();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4+'>('all');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // ── Inject Review + AggregateRating JSON-LD once reviews load ──
  useEffect(() => {
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      name: 'Nails by Uma',
      url: 'https://nailsbyuma.onspace.app',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&q=80',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: reviews.length,
        bestRating: '5',
        worstRating: '1',
      },
      review: reviews.slice(0, 20).map((r) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: r.customer_name || 'Verified Customer',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: '5',
          worstRating: '1',
        },
        reviewBody: r.review_text,
        datePublished: r.created_at
          ? new Date(r.created_at).toISOString().split('T')[0]
          : undefined,
        ...(r.service_name ? { name: `Review for ${r.service_name}` } : {}),
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-reviews-schema', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-reviews-schema]').forEach((el) => el.remove());
    };
  }, [reviews]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customer_reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('review-photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('review-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write your review',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (photo) {
        photoUrl = await uploadPhoto(photo);
        if (!photoUrl) {
          throw new Error('Failed to upload photo');
        }
      }

      // Submit review
      const { error } = await supabase.from('customer_reviews').insert({
        customer_name: customerName,
        customer_phone: customerPhone || null,
        service_name: serviceName || null,
        rating,
        review_text: reviewText,
        photo_url: photoUrl,
        is_approved: false, // Pending admin approval
      });

      if (error) throw error;

      // If photo included, schedule photo bonus (admin will trigger after approval)
      if (photoUrl && customerPhone) {
        console.log('Photo review submitted - bonus coupon will be issued after admin approval');
        localStorage.setItem('pendingPhotoBonusPhone', customerPhone);
        localStorage.setItem('pendingPhotoBonusName', customerName);
      }

      toast({
        title: '🎉 Review Submitted!',
        description: photo
          ? 'Thank you! Your review with photo is pending approval. You will receive a bonus coupon once approved!'
          : 'Thank you! Your review will appear after admin approval. Write with a photo for bonus rewards!',
      });

      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setServiceName('');
      setRating(5);
      setReviewText('');
      setPhoto(null);
      setPhotoPreview('');
      setShowForm(false);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Customer Reviews</h1>
            <p className="text-muted-foreground">
              See what our happy customers say about us
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {showForm ? 'Hide Form' : 'Write Review'}
          </Button>
        </div>

        {/* Incentive Banner */}
        {!showForm && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ReviewIncentiveBanner
              onClaimClick={() => setShowForm(true)}
              compact={false}
            />
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Reward Program
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">1</div>
                  <div>
                    <p className="font-medium text-sm">Book & Complete Service</p>
                    <p className="text-xs text-muted-foreground">Visit us at salon or home service</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">2</div>
                  <div>
                    <p className="font-medium text-sm">Receive Reminder Email</p>
                    <p className="text-xs text-muted-foreground">7 days later, we'll send you a review invite with an exclusive coupon</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-accent-foreground">3</div>
                  <div>
                    <p className="font-medium text-sm">Write Review + Add Photo</p>
                    <p className="text-xs text-muted-foreground">Earn your base coupon PLUS an extra photo bonus!</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Redeem Your Coupons</p>
                    <p className="text-xs text-muted-foreground">Use codes at next booking for exclusive discounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl mb-8">
            <h2 className="text-xl font-semibold mb-4">Share Your Experience</h2>
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="service">Service Taken (Optional)</Label>
                <Input
                  id="service"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g., Bridal Mehndi"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Rating *</Label>
                <div className="flex gap-2 mt-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setRating(index + 1)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          index < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {/* Incentive teaser in form */}
              <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  Earn Rewards for this Review!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ⭐ Write review → Get discount coupon &nbsp;|&nbsp; 📸 Add photo → Earn bonus coupon too!
                </p>
              </div>

              <Label htmlFor="review">Your Review *</Label>
                <Textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="photo">Your Photo (Optional)</Label>
                <div className="mt-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="photo"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{photo ? 'Change Photo' : 'Upload Your Photo'}</span>
                  </Label>
                </div>
                {photoPreview && (
                  <div className="mt-4">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your review will be published after admin approval
              </p>
            </div>
          </form>
        )}

        {/* Reviews Toolbar & Controls */}
        {!loading && reviews.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40">
            {/* Rating Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setFilterRating('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                  filterRating === 'all'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-background text-muted-foreground hover:text-foreground border border-rose-200/60'
                }`}
              >
                All ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRating('5')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
                  filterRating === '5'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-background text-muted-foreground hover:text-foreground border border-rose-200/60'
                }`}
              >
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                5★ Only ({reviews.filter((r) => r.rating === 5).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRating('4+')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
                  filterRating === '4+'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-background text-muted-foreground hover:text-foreground border border-rose-200/60'
                }`}
              >
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                4★ & Above ({reviews.filter((r) => r.rating >= 4).length})
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-rose-200/60 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'carousel'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Carousel View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'grid'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>
          </div>
        )}

        {/* Reviews Content Area */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <MessageSquarePlus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your experience!
            </p>
            <Button onClick={() => setShowForm(true)}>
              Write First Review
            </Button>
          </div>
        ) : (
          (() => {
            const filtered = reviews.filter((r) => {
              if (filterRating === '5') return r.rating === 5;
              if (filterRating === '4+') return r.rating >= 4;
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="text-center py-12 glass-card rounded-2xl">
                  <p className="text-muted-foreground mb-4">
                    No reviews match the selected filter.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setFilterRating('all')}>
                    Reset Filter
                  </Button>
                </div>
              );
            }

            if (viewMode === 'carousel') {
              return <ReviewsCarousel reviews={filtered} autoPlayInterval={4500} />;
            }

            return (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((review) => (
                  <ReviewCard
                    key={review.id}
                    customerName={review.customer_name}
                    serviceName={review.service_name || undefined}
                    rating={review.rating}
                    reviewText={review.review_text}
                    photoUrl={review.photo_url || undefined}
                    createdAt={review.created_at}
                    className="h-full border border-rose-100 dark:border-rose-950/30"
                  />
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
