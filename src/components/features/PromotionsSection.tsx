import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Tag, ArrowRight, Copy, Share2, Check, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  code: string | null;
  image_url: string | null;
  valid_from: string;
  valid_until: string | null;
  terms_conditions: string | null;
}

export function PromotionsSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (validUntil: string | null) => {
    if (!validUntil) return null;
    const days = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getTimeRemaining = (validUntil: string | null) => {
    if (!validUntil) return null;
    const diff = new Date(validUntil).getTime() - new Date().getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes };
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Promo code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sharePromotion = (promo: Promotion) => {
    const text = `🎉 ${promo.title}\n\n${promo.description}\n${
      promo.code ? `\nUse code: ${promo.code}` : ''
    }\n\nBook now: ${window.location.origin}/book`;

    if (navigator.share) {
      navigator.share({
        title: promo.title,
        text: text,
        url: `${window.location.origin}/book`,
      }).catch(() => {});
    } else {
      // Fallback - WhatsApp share
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        '_blank'
      );
    }
  };

  const bookWithPromo = (code: string | null) => {
    if (code) {
      localStorage.setItem('appliedPromoCode', code);
      toast.success(`Promo code ${code} will be applied at booking!`);
    }
    window.location.href = '/book';
  };

  const categories = [
    { value: 'all', label: 'All Offers' },
    { value: 'nail', label: 'Nail Services' },
    { value: 'beauty', label: 'Beauty Services' },
    { value: 'mehndi', label: 'Mehndi' },
    { value: 'bridal', label: 'Bridal Packages' },
  ];

  // Filter promotions
  const filteredPromotions = selectedCategory === 'all' 
    ? promotions 
    : promotions.filter(p => 
        p.title.toLowerCase().includes(selectedCategory) || 
        p.description.toLowerCase().includes(selectedCategory)
      );

  if (loading || promotions.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 px-4 relative overflow-hidden bg-gradient-to-b from-amber-50/20 via-pink-50/30 to-purple-50/20">
      {/* Glowing Ambient Mesh Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 glow-orb-purple opacity-50 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 glow-orb-pink opacity-60 pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-amber-100 dark:bg-pink-950/60 px-4 py-2 rounded-full shadow-xs">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold tracking-wider text-primary uppercase">Limited Time Offers &amp; Combos</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground">
            Special{' '}
            <span className="bg-gradient-to-r from-primary via-rose-500 to-accent bg-clip-text text-transparent">
              Promotions &amp; Packages
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Exclusive discounts and curated beauty combos crafted for your special occasions!
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white shadow-md scale-105'
                    : 'bg-white/80 dark:bg-slate-900/80 border border-pink-200/80 text-foreground hover:bg-pink-50/50 backdrop-blur-sm'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPromotions.map((promo) => {
            const timeRemaining = getTimeRemaining(promo.valid_until);
            const daysRemaining = getDaysRemaining(promo.valid_until);
            const isUrgent = daysRemaining !== null && daysRemaining <= 3;
            
            return (
              <div
                key={promo.id}
                className={`glass-card rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-pink-500/15 transition-all duration-400 border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ${
                  isUrgent ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                {/* Promotion Image */}
                {promo.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {(promo.discount_percentage || promo.discount_amount) && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full font-bold shadow-lg animate-bounce-slow">
                        {promo.discount_percentage
                          ? `${promo.discount_percentage}% OFF`
                          : `₹${promo.discount_amount} OFF`}
                      </div>
                    )}
                    {isUrgent && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        🔥 ENDING SOON!
                      </div>
                    )}
                    {/* Share Button */}
                    <button
                      onClick={() => sharePromotion(promo)}
                      className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                    >
                      <Share2 className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 line-clamp-2">{promo.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {promo.description}
                  </p>

                  {/* Advanced Countdown Timer */}
                  {timeRemaining && timeRemaining.days >= 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-semibold text-orange-600 uppercase">
                          Offer Expires In
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {timeRemaining.days}
                          </div>
                          <div className="text-xs text-muted-foreground">Days</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {timeRemaining.hours}
                          </div>
                          <div className="text-xs text-muted-foreground">Hours</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {timeRemaining.minutes}
                          </div>
                          <div className="text-xs text-muted-foreground">Mins</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Promo Code with Copy */}
                  {promo.code && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Use Code:</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono font-bold text-primary text-lg flex-1">
                          {promo.code}
                        </p>
                        <button
                          onClick={() => copyPromoCode(promo.code!)}
                          className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1 text-sm"
                        >
                          {copiedCode === promo.code ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Terms */}
                  {promo.terms_conditions && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      * {promo.terms_conditions}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white group/btn"
                      onClick={() => bookWithPromo(promo.code)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Book Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredPromotions.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No promotions in this category</h3>
            <p className="text-muted-foreground mb-4">Try selecting a different category</p>
            <Button
              variant="outline"
              onClick={() => setSelectedCategory('all')}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </Button>
          </div>
        )}

        {/* View All Offers CTA */}
        {promotions.length >= 3 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full">
              <span className="text-sm text-muted-foreground">
                🎁 {promotions.length} Active Offers Available
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
