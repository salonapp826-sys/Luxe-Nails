import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useJsonLd } from '@/hooks/useJsonLd';
import { getServiceMetaTags, buildServiceJsonLd, ServiceSEOData } from '@/lib/serviceSeo';
import { supabase } from '@/lib/supabase';
import { INITIAL_SERVICES_DATA } from '@/services/dbService';
import { formatINR } from '@/lib/homeServiceCharges';
import { Button } from '@/components/ui/button';
import {
  Clock,
  IndianRupee,
  ArrowLeft,
  Sparkles,
  Home,
  CheckCircle2,
  Calendar,
  Share2,
  Star,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceSEOData | null>(() => {
    const local = INITIAL_SERVICES_DATA.find((s) => s.id === serviceId);
    if (!local) return null;
    return {
      ...local,
      rating: { value: 4.9, count: 52 },
    };
  });
  const [loading, setLoading] = useState(!service);

  useEffect(() => {
    async function loadService() {
      if (!serviceId) return;
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching service from database, using fallback:', error);
        }

        if (data) {
          setService({
            id: data.id,
            name: data.name,
            category: data.category,
            description: data.description || '',
            price_inr: Number(data.price_inr),
            duration_minutes: Number(data.duration_minutes),
            image_url: data.image_url,
            home_service_allowed: Boolean(data.home_service_allowed),
            is_premium: Boolean(data.is_premium),
            rating: { value: 4.9, count: 52 },
          });
        }
      } catch (err) {
        console.error('Error in loadService:', err);
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [serviceId]);

  // Dynamic SEO metadata & OpenGraph tags for search engines & social shares
  const metaTags = service
    ? getServiceMetaTags(service)
    : {
        title: 'Service Not Found | Nails by Uma',
        description: 'The requested nail or beauty service could not be found.',
        keywords: 'nail salon jaipur, nails by uma',
        ogImage: undefined,
        canonicalPath: '/services',
      };

  useSEO({
    title: metaTags.title,
    description: metaTags.description,
    keywords: metaTags.keywords,
    ogImage: metaTags.ogImage,
    ogType: 'product',
    canonicalPath: metaTags.canonicalPath,
  });

  // Dynamic Schema.org JSON-LD structured data for Google local search rich results
  const schemaMarkup = service ? buildServiceJsonLd(service) : null;
  useJsonLd(schemaMarkup, `service-detail-${serviceId}`);

  const handleShare = () => {
    if (navigator.share && service) {
      navigator
        .share({
          title: `${service.name} at Nails by Uma`,
          text: `Check out ${service.name} for ${formatINR(service.price_inr)} at Nails by Uma Jaipur!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied!',
        description: 'Service link copied to clipboard.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen py-24 container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto glass-card p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-3 text-foreground">Service Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the service you are looking for. Please browse our full service menu.
          </p>
          <Button onClick={() => navigate('/services')} className="rounded-xl">
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    basic: 'Basic Care',
    premium: 'Premium Nail Art',
    art: '3D & Custom Art',
    bridal: 'Bridal Makeover',
    mehndi: 'Henna & Mehndi',
    beauty: 'Beauty & Facials',
  };

  return (
    <div className="min-h-screen pb-24 pt-6 bg-gradient-to-b from-pink-50/40 via-background to-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/services')}
            className="gap-2 text-muted-foreground hover:text-foreground rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Services
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2 rounded-xl border-pink-200 hover:bg-pink-50 text-foreground"
          >
            <Share2 className="w-4 h-4 text-primary" />
            Share
          </Button>
        </div>

        {/* Main Service Card */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Cover Photo & Badges */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-lifted bg-secondary/30 aspect-[4/3] group border border-pink-100">
              <img
                src={
                  service.image_url ||
                  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=800&fit=crop&q=80'
                }
                alt={`${service.name} in Jaipur`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Category & Premium Tag */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-foreground shadow-xs">
                  {categoryLabels[service.category] || service.category}
                </span>
                {service.is_premium && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Luxe Premium
                  </span>
                )}
              </div>

              {/* Bottom In-image Bar */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-medium mb-1">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>4.9 / 5.0 (50+ Client Reviews)</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-sm">{service.name}</h1>
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-pink-100/80 shadow-xs flex flex-col justify-center">
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Service Time
                </span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {service.duration_minutes} Mins
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-pink-100/80 shadow-xs flex flex-col justify-center">
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Visit Type
                </span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Home className="w-4 h-4 text-primary" />
                  {service.home_service_allowed ? 'Salon & Home' : 'In-Salon Only'}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white border border-pink-100/80 shadow-xs flex flex-col justify-center">
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Location
                </span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Jaipur, RJ
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-pink-100/80 shadow-md">
              <div className="flex items-baseline justify-between gap-4 pb-6 border-b border-pink-100">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Starting Price
                  </span>
                  <div className="flex items-center gap-1 text-3xl sm:text-4xl font-extrabold text-foreground mt-1">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {formatINR(service.price_inr)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Advance Deposit</span>
                  <p className="text-sm font-bold text-green-700">₹200 to confirm</p>
                </div>
              </div>

              {/* Service Description */}
              <div className="py-6 border-b border-pink-100">
                <h2 className="text-base font-bold mb-2 text-foreground">About This Treatment</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>

              {/* Inclusions */}
              <div className="py-6 border-b border-pink-100">
                <h3 className="text-sm font-bold mb-3 text-foreground">What's Included:</h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Nail analysis, sanitization, shaping, and precision cuticle preparation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Use of premium certified non-toxic gels, polishes, and hygienic toolkits.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Nourishing cuticle oil massage & protective top-coat application.</span>
                  </li>
                  {service.home_service_allowed && (
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Optional door-to-door salon setup with sanitized equipment in Jaipur.</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Trust Badge */}
              <div className="p-3.5 rounded-2xl bg-pink-500/5 border border-pink-200/60 flex items-center gap-3 text-xs text-muted-foreground my-6">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <span>
                  <strong>100% Hygienic Guarantee:</strong> Single-use disposable files and autoclave sterilized tools.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={() => navigate(`/book?service=${service.id}`)}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white shadow-soft hover:shadow-lg transition-all text-base py-6 rounded-2xl font-bold gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Appointment Now
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Hi Uma! I'm interested in booking *${service.name}* (₹${service.price_inr}). Are slots available?`
                    );
                    window.open(`https://wa.me/916376539366?text=${text}`, '_blank');
                  }}
                  className="w-full rounded-2xl border-pink-200 text-foreground hover:bg-pink-50"
                >
                  Chat on WhatsApp for Custom Design
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailPage;
