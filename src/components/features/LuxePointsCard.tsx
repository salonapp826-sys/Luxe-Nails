import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuxeProfileSummary,
  REWARD_OPTIONS,
  RewardOption,
  redeemPointsForVoucher,
  LOYALTY_TIERS,
} from '@/lib/luxePoints';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Award,
  Gift,
  ArrowRight,
  Copy,
  CheckCircle2,
  Calendar,
  History,
  TrendingUp,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface LuxePointsCardProps {
  summary: LuxeProfileSummary;
  onRefresh: () => void;
}

export function LuxePointsCard({ summary, onRefresh }: LuxePointsCardProps) {
  const navigate = useNavigate();
  const [selectedReward, setSelectedReward] = useState<RewardOption | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'history' | 'tiers'>('rewards');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleApplyVoucher = (code: string) => {
    localStorage.setItem('appliedCouponCode', code);
    toast.success(`Applied ${code}! Redirecting to appointment booking...`);
    navigate('/book');
  };

  const handleRedeem = (reward: RewardOption) => {
    setIsRedeeming(true);
    const result = redeemPointsForVoucher(summary.phone, reward, summary.availablePoints);
    setIsRedeeming(false);

    if (result.success && result.voucher) {
      toast.success(
        `🎉 Successfully redeemed ${reward.pointsRequired} points for a ₹${reward.discountAmount} voucher!`
      );
      onRefresh();
    } else {
      toast.error(result.error || 'Failed to redeem points.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── LUXE VIP MEMBERSHIP CARD ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl transition-all duration-300 hover:scale-[1.01] border border-white/20 bg-gradient-to-br from-pink-950 via-rose-900 to-purple-950">
        {/* Holographic background aura */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between min-h-[220px]">
          {/* Card Top Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-pink-300" />
              </div>
              <div>
                <p className="text-[11px] tracking-widest font-semibold uppercase text-pink-200/80">
                  Nails by Uma · Luxe Club
                </p>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{summary.currentTier.name}</span>
                  <span className="text-lg">{summary.currentTier.icon}</span>
                </h3>
              </div>
            </div>

            {/* Tier Multiplier Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-pink-100 flex items-center gap-1 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{summary.currentTier.multiplier}x Points</span>
            </div>
          </div>

          {/* Points Display Center */}
          <div className="my-6">
            <p className="text-xs uppercase tracking-wider text-pink-200/90 font-bold">
              My Points Balance
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                {summary.availablePoints.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-pink-200">Points</span>
              <span className="text-xs text-white/60 ml-2 hidden sm:inline">
                (≈ ₹{Math.round(summary.availablePoints * 0.5)} Reward Value)
              </span>
            </div>

            {/* Next Tier Progress Bar */}
            {summary.nextTier ? (
              <div className="mt-4 space-y-1.5 max-w-md">
                <div className="flex justify-between text-xs text-pink-200/90 font-medium">
                  <span>{summary.currentTier.name}</span>
                  <span>
                    <strong>{summary.pointsToNextTier} pts</strong> to {summary.nextTier.name}{' '}
                    {summary.nextTier.icon}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${summary.progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <span>👑 Maximum Diamond Elite VIP Tier Reached</span>
              </div>
            )}
          </div>

          {/* Card Bottom Row */}
          <div className="flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-pink-300/80">Member</p>
              <p className="font-medium text-sm text-white/95">{summary.customerName}</p>
              <p className="text-xs text-pink-200/60 font-mono">{summary.phone}</p>
            </div>

            <Button
              size="sm"
              onClick={() => setActiveTab('rewards')}
              className="bg-white text-pink-950 hover:bg-pink-50 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 h-9 px-4 text-xs"
            >
              <Gift className="w-3.5 h-3.5 mr-1.5 text-pink-700" />
              Redeem Rewards
            </Button>
          </div>
        </div>
      </div>

      {/* ── QUICK STATS RIBBON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Total Earned</p>
          <p className="text-2xl font-black text-foreground mt-1">
            {summary.totalLifetimePoints.toLocaleString()}
          </p>
          <p className="text-[11px] text-pink-600 font-medium">Lifetime points</p>
        </div>
        <div className="glass-card p-4 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Appointments</p>
          <p className="text-2xl font-black text-foreground mt-1">{summary.bookingsCount}</p>
          <p className="text-[11px] text-green-600 font-medium">Completed visits</p>
        </div>
        <div className="glass-card p-4 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Points Redeemed</p>
          <p className="text-2xl font-black text-foreground mt-1">
            {summary.redeemedPoints.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">Used for vouchers</p>
        </div>
        <div className="glass-card p-4 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Vouchers Ready</p>
          <p className="text-2xl font-black text-primary mt-1">
            {summary.vouchers.filter((v) => !v.isUsed).length}
          </p>
          <p className="text-[11px] text-primary font-medium">Active discounts</p>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex border-b border-pink-100 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'rewards'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gift className="w-4 h-4" />
          Redeem Points ({REWARD_OPTIONS.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tiers')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tiers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="w-4 h-4" />
          VIP Tier Perks
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4" />
          Points Ledger ({summary.transactions.length})
        </button>
      </div>

      {/* ── TAB 1: REDEEM REWARDS ── */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Active Unused Vouchers */}
          {summary.vouchers.filter((v) => !v.isUsed).length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <h4 className="font-bold text-amber-950 flex items-center gap-2 text-sm sm:text-base mb-3">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Your Active Discount Vouchers Ready to Use
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {summary.vouchers
                  .filter((v) => !v.isUsed)
                  .map((voucher) => (
                    <div
                      key={voucher.id}
                      className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          ₹{voucher.discountAmount} OFF
                        </span>
                        <p className="font-mono font-bold text-base text-foreground mt-1">
                          {voucher.code}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {voucher.pointsCost} points redeemed
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleApplyVoucher(voucher.code)}
                          className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-3 font-semibold"
                        >
                          Apply &amp; Book
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCode(voucher.code)}
                          className="text-xs h-7 px-2"
                        >
                          {copiedCode === voucher.code ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Reward Catalog */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-lg text-foreground">Available Reward Vouchers</h4>
                <p className="text-xs text-muted-foreground">
                  Exchange your Luxe Points for instant discounts valid on any salon or home visit.
                </p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {summary.availablePoints} Pts Available
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {REWARD_OPTIONS.map((reward) => {
                const canAfford = summary.availablePoints >= reward.pointsRequired;
                return (
                  <div
                    key={reward.pointsRequired}
                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      canAfford
                        ? 'border-pink-200 bg-white shadow-xs hover:border-primary hover:shadow-md'
                        : 'border-muted bg-muted/20 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {reward.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                            {reward.badge}
                          </span>
                        )}
                        <span className="text-xs font-bold text-muted-foreground">
                          Cost: {reward.pointsRequired} Points
                        </span>
                      </div>

                      <h5 className="font-bold text-xl text-primary mb-1">
                        ₹{reward.discountAmount} Discount
                      </h5>
                      <p className="text-sm font-medium text-foreground mb-1">{reward.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Generates an instant coupon code valid for your next appointment checkout.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {canAfford
                          ? 'Available to redeem now'
                          : `Need ${reward.pointsRequired - summary.availablePoints} more pts`}
                      </span>

                      <Button
                        size="sm"
                        disabled={!canAfford || isRedeeming}
                        onClick={() => handleRedeem(reward)}
                        className={`text-xs font-bold rounded-xl h-9 px-4 ${
                          canAfford
                            ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {canAfford ? 'Redeem Voucher' : 'Unlock at ' + reward.pointsRequired}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: VIP TIERS ── */}
      {activeTab === 'tiers' && (
        <div className="space-y-4">
          <div className="text-center max-w-md mx-auto mb-4">
            <h4 className="font-bold text-lg text-foreground">Luxe Loyalty Tier Journey</h4>
            <p className="text-xs text-muted-foreground">
              Every booking helps you climb higher tiers with increased multipliers and luxury perks.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LOYALTY_TIERS.map((tier) => {
              const isCurrent = summary.currentTier.id === tier.id;
              const isUnlocked = summary.totalLifetimePoints >= tier.minPoints;

              return (
                <div
                  key={tier.id}
                  className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                      : isUnlocked
                      ? 'border-pink-200 bg-white'
                      : 'border-muted bg-muted/20 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{tier.icon}</span>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full shadow-xs">
                          Current Tier
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {tier.minPoints} pts
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-base text-foreground mb-1">{tier.name}</h5>
                    <p className="text-xs text-primary font-bold mb-3">
                      {tier.multiplier}x Point Multiplier
                    </p>

                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    {tier.maxPoints < 999999
                      ? `${tier.minPoints} – ${tier.maxPoints} lifetime points`
                      : `${tier.minPoints}+ lifetime points`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: POINTS HISTORY / LEDGER ── */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-base text-foreground">Points Activity Log</h4>
            <span className="text-xs text-muted-foreground">
              Total lifetime earned: {summary.totalLifetimePoints} pts
            </span>
          </div>

          {summary.transactions.length === 0 ? (
            <div className="text-center py-8 glass-card rounded-2xl text-muted-foreground">
              <History className="w-8 h-8 mx-auto mb-2 text-pink-300" />
              <p className="text-sm font-semibold">No point transactions yet</p>
              <p className="text-xs mt-0.5">Book your first service to start earning Luxe Points!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {summary.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl border border-pink-100 bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                        tx.points > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {tx.points > 0 ? '+' : '−'}
                    </div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-foreground">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {tx.bookingId && ` · ID: ${tx.bookingId}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-black text-sm sm:text-base flex-shrink-0 ${
                      tx.points > 0 ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LuxePointsCard;
