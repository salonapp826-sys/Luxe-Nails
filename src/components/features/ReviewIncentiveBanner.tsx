import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Gift, Tag, Camera, ChevronRight, Clock, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ReviewCoupon {
  id: string;
  coupon_code: string;
  coupon_type: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  is_used: boolean;
  expires_at: string | null;
  email_sent: boolean;
  created_at: string;
}

interface IncentiveBannerProps {
  onClaimClick?: () => void;
  compact?: boolean;
}

export function ReviewIncentiveBanner({ onClaimClick, compact = false }: IncentiveBannerProps) {
  const [phone, setPhone] = useState('');
  const [coupons, setCoupons] = useState<ReviewCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [incentiveSettings, setIncentiveSettings] = useState<{
    first_review_value?: number;
    first_review_type?: string;
    photo_bonus_value?: number;
    photo_bonus_type?: string;
  }>({});

  useEffect(() => {
    loadSettings();
    // Check saved phone
    const savedPhone = localStorage.getItem('reviewCheckPhone');
    if (savedPhone) {
      setPhone(savedPhone);
      checkCoupons(savedPhone);
    }
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('review_incentive_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['first_review_incentive', 'photo_review_bonus']);

    const map: Record<string, any> = {};
    (data || []).forEach(s => { map[s.setting_key] = s.setting_value; });

    setIncentiveSettings({
      first_review_value: map['first_review_incentive']?.discount_value,
      first_review_type: map['first_review_incentive']?.discount_type,
      photo_bonus_value: map['photo_review_bonus']?.discount_value,
      photo_bonus_type: map['photo_review_bonus']?.discount_type,
    });
  };

  const checkCoupons = async (phoneNum: string) => {
    if (!phoneNum || phoneNum.length < 10) return;
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('review-incentive-engine', {
        body: { action: 'get_coupons', phone: phoneNum }
      });
      setCoupons(data?.coupons || []);
      setChecked(true);
      localStorage.setItem('reviewCheckPhone', phoneNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeCoupons = coupons.filter(c => !c.is_used && c.expires_at && new Date(c.expires_at) > new Date());
  const usedCoupons = coupons.filter(c => c.is_used);

  const getDiscountText = (c: ReviewCoupon) =>
    c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`;

  const getDaysLeft = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Compact mode - just shows the incentive offer
  if (compact && !checked) {
    const reviewDiscount = incentiveSettings.first_review_type === 'percentage'
      ? `${incentiveSettings.first_review_value}%`
      : `₹${incentiveSettings.first_review_value}`;
    const photoDiscount = incentiveSettings.photo_bonus_type === 'fixed'
      ? `₹${incentiveSettings.photo_bonus_value}`
      : `${incentiveSettings.photo_bonus_value}%`;

    return (
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Gift className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Earn Rewards for Your Review!</p>
            <div className="flex flex-wrap gap-3 mt-2">
              {incentiveSettings.first_review_value && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  Write a review → Get {reviewDiscount} OFF coupon
                </span>
              )}
              {incentiveSettings.photo_bonus_value && (
                <span className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
                  <Camera className="w-3 h-3" />
                  Add a photo → Bonus {photoDiscount} OFF
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-6 h-6" />
          <h3 className="text-xl font-bold">Your Review Rewards</h3>
        </div>
        <p className="text-white/80 text-sm">Check your available discount coupons</p>
      </div>

      <div className="p-6">
        {/* Phone Check */}
        {!checked ? (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Enter your phone number to check your rewards:</p>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && checkCoupons(phone)}
              />
              <Button
                onClick={() => checkCoupons(phone)}
                disabled={loading || phone.length < 10}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                {loading ? 'Checking...' : 'Check'}
              </Button>
            </div>

            {/* Incentive Summary */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">How to earn rewards:</p>
              {incentiveSettings.first_review_value && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Write Your First Review</p>
                    <p className="text-xs text-muted-foreground">
                      Get {incentiveSettings.first_review_type === 'percentage' ? `${incentiveSettings.first_review_value}%` : `₹${incentiveSettings.first_review_value}`} OFF your next booking
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              )}
              {incentiveSettings.photo_bonus_value && (
                <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Add a Photo to Your Review</p>
                    <p className="text-xs text-muted-foreground">
                      Earn bonus {incentiveSettings.photo_bonus_type === 'fixed' ? `₹${incentiveSettings.photo_bonus_value}` : `${incentiveSettings.photo_bonus_value}%`} OFF coupon
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 gap-2"
              onClick={onClaimClick}
            >
              Write a Review to Earn Rewards
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Showing coupons for <strong>{phone}</strong></p>
              <button
                onClick={() => { setChecked(false); setCoupons([]); setPhone(''); localStorage.removeItem('reviewCheckPhone'); }}
                className="text-xs text-primary hover:underline"
              >
                Change
              </button>
            </div>

            {/* Active Coupons */}
            {activeCoupons.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2 text-green-700">🎉 Active Coupons ({activeCoupons.length})</p>
                <div className="space-y-3">
                  {activeCoupons.map((coupon) => {
                    const daysLeft = coupon.expires_at ? getDaysLeft(coupon.expires_at) : null;
                    return (
                      <div key={coupon.id} className="border-2 border-primary/30 rounded-xl p-4 bg-gradient-to-r from-primary/5 to-accent/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {coupon.coupon_type === 'photo_review_bonus' ? '📸 Photo Bonus' : '⭐ Review Reward'}
                          </span>
                          <span className="text-lg font-bold text-primary">{getDiscountText(coupon)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-mono font-bold text-primary text-lg flex-1">{coupon.coupon_code}</span>
                          <button
                            onClick={() => copyCouponCode(coupon.coupon_code)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-primary/90 transition-colors"
                          >
                            {copiedCode === coupon.coupon_code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedCode === coupon.coupon_code ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {coupon.min_order_amount > 0 && (
                            <span>Min order: ₹{coupon.min_order_amount}</span>
                          )}
                          {daysLeft !== null && (
                            <span className={`flex items-center gap-1 ${daysLeft <= 5 ? 'text-red-600 font-medium' : ''}`}>
                              <Clock className="w-3 h-3" />
                              {daysLeft} days left
                            </span>
                          )}
                        </div>
                        <Button
                          className="w-full mt-3 bg-gradient-to-r from-primary to-accent text-white text-sm"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem('appliedCouponCode', coupon.coupon_code);
                            window.location.href = '/book';
                          }}
                        >
                          Apply & Book Now →
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Used Coupons */}
            {usedCoupons.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2 text-muted-foreground">Used Coupons ({usedCoupons.length})</p>
                <div className="space-y-2">
                  {usedCoupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg opacity-60">
                      <X className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono text-sm line-through">{coupon.coupon_code}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Used {coupon.used_at ? new Date(coupon.used_at).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No coupons */}
            {coupons.length === 0 && (
              <div className="text-center py-6">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No coupons yet!</p>
                <p className="text-sm text-muted-foreground mb-4">Write a review to earn your first discount coupon</p>
                <Button
                  className="bg-gradient-to-r from-primary to-accent text-white gap-2"
                  onClick={onClaimClick}
                >
                  <Tag className="w-4 h-4" />
                  Write a Review & Earn Rewards
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
