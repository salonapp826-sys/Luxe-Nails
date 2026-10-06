import { Booking } from './supabase';

export interface LoyaltyTier {
  id: 'rose_quartz' | 'pink_tourmaline' | 'ruby_radiance' | 'diamond_elite';
  name: string;
  minPoints: number;
  maxPoints: number;
  multiplier: number;
  badgeGradient: string;
  cardGradient: string;
  icon: string;
  benefits: string[];
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'rose_quartz',
    name: 'Rose Quartz',
    minPoints: 0,
    maxPoints: 249,
    multiplier: 1.0,
    badgeGradient: 'from-pink-400 to-rose-300',
    cardGradient: 'from-pink-900/80 via-rose-800/70 to-pink-950/90',
    icon: '🌸',
    benefits: [
      'Earn 1 Luxe Point for every ₹10 spent',
      '100 Bonus Points on your 1st booking',
      'Birthday month surprise perk',
      'Complimentary nail care & maintenance tips',
    ],
  },
  {
    id: 'pink_tourmaline',
    name: 'Pink Tourmaline',
    minPoints: 250,
    maxPoints: 499,
    multiplier: 1.25,
    badgeGradient: 'from-fuchsia-500 to-pink-500',
    cardGradient: 'from-fuchsia-950/85 via-pink-900/75 to-purple-950/90',
    icon: '💎',
    benefits: [
      '1.25x Points multiplier on all bookings',
      '200 Bonus Points on your 3rd booking milestone',
      'Complimentary single accent nail art on any gel set',
      'Priority booking access during festive seasons',
    ],
  },
  {
    id: 'ruby_radiance',
    name: 'Ruby Radiance',
    minPoints: 500,
    maxPoints: 999,
    multiplier: 1.5,
    badgeGradient: 'from-red-500 via-rose-500 to-amber-500',
    cardGradient: 'from-rose-950/90 via-red-900/80 to-amber-950/85',
    icon: '👑',
    benefits: [
      '1.5x Points multiplier on all bookings',
      '500 Bonus Points milestone reward',
      'Free organic cuticle oil roller with every salon visit',
      '10% off bridal or luxury combo packages',
      'Free nail repair within 5 days of service',
    ],
  },
  {
    id: 'diamond_elite',
    name: 'Diamond Elite VIP',
    minPoints: 1000,
    maxPoints: 999999,
    multiplier: 2.0,
    badgeGradient: 'from-indigo-300 via-sky-200 to-emerald-300',
    cardGradient: 'from-slate-950/90 via-indigo-950/85 to-purple-950/90',
    icon: '✨',
    benefits: [
      'Double Points: 2x multiplier on all bookings',
      'Dedicated artist reservation preference',
      'Free express gel polish upgrade with any manicure',
      'Zero cancellation fee forgiveness (1x per quarter)',
      'Exclusive preview invites to seasonal nail art launches',
    ],
  },
];

export interface PointTransaction {
  id: string;
  bookingId?: string;
  serviceName?: string;
  type: 'earned_booking' | 'bonus_welcome' | 'bonus_milestone' | 'redeemed_voucher';
  points: number; // positive for earned, negative for redeemed
  description: string;
  date: string;
}

export interface RedeemedVoucher {
  id: string;
  code: string;
  pointsCost: number;
  discountAmount: number;
  createdAt: string;
  isUsed: boolean;
  phone: string;
}

export interface LuxeProfileSummary {
  phone: string;
  customerName: string;
  customerEmail?: string;
  totalLifetimePoints: number;
  availablePoints: number;
  redeemedPoints: number;
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNextTier: number;
  progressPercent: number;
  bookingsCount: number;
  totalSpent: number;
  transactions: PointTransaction[];
  vouchers: RedeemedVoucher[];
}

// Storage helpers
const STORAGE_PREFIX = 'luxe_rewards_';

export function getRedeemedVouchers(phone: string): RedeemedVoucher[] {
  if (!phone) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}vouchers_${phone.trim()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRedeemedVoucher(phone: string, voucher: RedeemedVoucher) {
  if (!phone) return;
  const list = getRedeemedVouchers(phone);
  list.unshift(voucher);
  localStorage.setItem(`${STORAGE_PREFIX}vouchers_${phone.trim()}`, JSON.stringify(list));
}

export function markVoucherUsed(phone: string, code: string) {
  if (!phone) return;
  const list = getRedeemedVouchers(phone);
  const updated = list.map((v) => (v.code === code ? { ...v, isUsed: true } : v));
  localStorage.setItem(`${STORAGE_PREFIX}vouchers_${phone.trim()}`, JSON.stringify(updated));
}

// Calculate Luxe Points from customer bookings
export function calculateLuxePoints(phone: string, bookings: Booking[]): LuxeProfileSummary {
  const cleanPhone = phone.trim();
  const vouchers = getRedeemedVouchers(cleanPhone);
  const redeemedPointsTotal = vouchers.reduce((sum, v) => sum + v.pointsCost, 0);

  // Filter valid bookings for this customer
  const customerBookings = bookings
    .filter((b) => b.customer_phone?.trim() === cleanPhone && b.booking_status !== 'cancelled')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const latestBooking = customerBookings[customerBookings.length - 1];
  const customerName = latestBooking?.customer_name || 'Valued Luxe Client';
  const customerEmail = latestBooking?.customer_email || undefined;

  let totalLifetimePoints = 0;
  let totalSpent = 0;
  const transactions: PointTransaction[] = [];

  customerBookings.forEach((b, idx) => {
    const bookingSpend = b.total_price || 0;
    totalSpent += bookingSpend;

    // Base points: 1 point per ₹10
    const basePts = Math.floor(bookingSpend / 10);
    totalLifetimePoints += basePts;

    transactions.push({
      id: `pt-earn-${b.id || idx}`,
      bookingId: b.booking_id,
      serviceName: b.service_name,
      type: 'earned_booking',
      points: basePts,
      description: `Earned from booking (${b.service_name})`,
      date: b.created_at || b.appointment_date || new Date().toISOString(),
    });

    // Milestone Bonuses
    if (idx === 0) {
      // 1st Booking Welcome Gift
      const welcomePts = 100;
      totalLifetimePoints += welcomePts;
      transactions.push({
        id: `pt-bonus-welcome-${b.id || idx}`,
        bookingId: b.booking_id,
        type: 'bonus_welcome',
        points: welcomePts,
        description: '🌸 Welcome to Luxe Club Gift',
        date: b.created_at || new Date().toISOString(),
      });
    }

    if (idx === 2) {
      // 3rd Booking Milestone
      const m3Pts = 200;
      totalLifetimePoints += m3Pts;
      transactions.push({
        id: `pt-bonus-m3-${b.id || idx}`,
        bookingId: b.booking_id,
        type: 'bonus_milestone',
        points: m3Pts,
        description: '💎 3rd Appointment Milestone Bonus',
        date: b.created_at || new Date().toISOString(),
      });
    }

    if (idx === 4) {
      // 5th Booking Milestone
      const m5Pts = 500;
      totalLifetimePoints += m5Pts;
      transactions.push({
        id: `pt-bonus-m5-${b.id || idx}`,
        bookingId: b.booking_id,
        type: 'bonus_milestone',
        points: m5Pts,
        description: '👑 VIP 5th Visit Celebration Bonus',
        date: b.created_at || new Date().toISOString(),
      });
    }
  });

  // Add redemption transactions
  vouchers.forEach((v) => {
    transactions.push({
      id: `pt-redeem-${v.id}`,
      type: 'redeemed_voucher',
      points: -v.pointsCost,
      description: `Redeemed for ₹${v.discountAmount} Voucher (${v.code})`,
      date: v.createdAt,
    });
  });

  // Sort transactions newest first
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const availablePoints = Math.max(0, totalLifetimePoints - redeemedPointsTotal);

  // Determine current tier based on lifetime points
  let currentTier = LOYALTY_TIERS[0];
  let nextTier: LoyaltyTier | null = LOYALTY_TIERS[1];

  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
    if (totalLifetimePoints >= LOYALTY_TIERS[i].minPoints) {
      currentTier = LOYALTY_TIERS[i];
      nextTier = LOYALTY_TIERS[i + 1] || null;
      break;
    }
  }

  let pointsToNextTier = 0;
  let progressPercent = 100;

  if (nextTier) {
    pointsToNextTier = Math.max(0, nextTier.minPoints - totalLifetimePoints);
    const tierSpan = nextTier.minPoints - currentTier.minPoints;
    const currentProgress = totalLifetimePoints - currentTier.minPoints;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / tierSpan) * 100)));
  }

  return {
    phone: cleanPhone,
    customerName,
    customerEmail,
    totalLifetimePoints,
    availablePoints,
    redeemedPoints: redeemedPointsTotal,
    currentTier,
    nextTier,
    pointsToNextTier,
    progressPercent,
    bookingsCount: customerBookings.length,
    totalSpent,
    transactions,
    vouchers,
  };
}

export interface RewardOption {
  pointsRequired: number;
  discountAmount: number;
  label: string;
  badge?: string;
}

export const REWARD_OPTIONS: RewardOption[] = [
  { pointsRequired: 100, discountAmount: 50, label: '₹50 Off Your Next Visit', badge: 'Starter' },
  { pointsRequired: 200, discountAmount: 120, label: '₹120 Off Any Service', badge: 'Popular' },
  { pointsRequired: 400, discountAmount: 250, label: '₹250 Off Premium Mani/Pedi', badge: 'Best Value' },
  { pointsRequired: 800, discountAmount: 550, label: '₹550 Off Bridal or Package', badge: 'VIP Deluxe' },
];

export function redeemPointsForVoucher(
  phone: string,
  reward: RewardOption,
  currentAvailablePoints: number
): { success: boolean; voucher?: RedeemedVoucher; error?: string } {
  if (currentAvailablePoints < reward.pointsRequired) {
    return { success: false, error: 'Insufficient points balance.' };
  }

  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const code = `LUXE${reward.discountAmount}-${randomSuffix}`;

  const voucher: RedeemedVoucher = {
    id: `vch_${Date.now()}_${randomSuffix}`,
    code,
    pointsCost: reward.pointsRequired,
    discountAmount: reward.discountAmount,
    createdAt: new Date().toISOString(),
    isUsed: false,
    phone: phone.trim(),
  };

  saveRedeemedVoucher(phone, voucher);
  return { success: true, voucher };
}
