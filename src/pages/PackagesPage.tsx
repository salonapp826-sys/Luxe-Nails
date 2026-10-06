import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Sparkles,
  Clock,
  ShieldCheck,
  Heart,
  ArrowRight,
  MessageCircle,
  Star,
  Tag,
  Gem,
  Gift,
  Users2,
  Calendar,
  Sparkle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/homeServiceCharges';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { useJsonLd } from '@/hooks/useJsonLd';
import { BUSINESS_ID } from '@/lib/business';

interface Package {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  duration: string;
  category: 'all' | 'signature' | 'bridal' | 'spa' | 'friends';
  badge?: string;
  popular?: boolean;
  image: string;
  homeService: boolean;
  includedServices: string[];
  features: string[];
  idealFor: string;
}

const SIGNATURE_PACKAGES: Package[] = [
  {
    id: 'bridal-glow-package',
    name: 'Bridal Glow Package',
    tagline: 'Complete bridal makeover with 3D nail extensions, organic Mehndi & Gold facial',
    description:
      'Full head-to-toe bridal package with gel extensions, 3D stones, 100% natural dark-stain Sojat Mehndi, Gold facial, and rose petal foot spa.',
    price: 4999,
    originalPrice: 7499,
    duration: '4.5 Hours',
    category: 'bridal',
    badge: 'Most Popular Bridal',
    popular: true,
    homeService: true,
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80',
    includedServices: [
      'Full Gel Extensions with 3D Stone Art',
      'Organic Bridal Mehndi (Arms & Feet)',
      '24K Gold Glow Facial & Clean-up',
      'Rose Petal Pedicure Spa',
      'Bridal Consultation & Free Trial',
    ],
    features: [
      'Pretty crystal stones & pearls on special accent nails',
      '100% natural dark-stain Sojat henna cones',
      'Skin glowing Gold facial massage',
      'Free bridal aftercare guidance',
      'Available at salon or your venue in Jaipur',
    ],
    idealFor: 'Brides, Sangeet & wedding functions',
  },
  {
    id: 'nail-spa-combo',
    name: 'Nail + Spa Combo',
    tagline: 'Long-lasting gel manicure paired with relaxing jelly foot spa',
    description:
      'Enjoy 3-week shiny gel manicure with custom nail art, followed by a warm jelly foot soak, foot scrubbing, and relaxing hot stone massage.',
    price: 2499,
    originalPrice: 3199,
    duration: '2.5 Hours',
    category: 'signature',
    badge: 'Bestseller Combo',
    popular: true,
    homeService: true,
    image: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
    includedServices: [
      'Shiny UV Gel Manicure (Lasts 3+ weeks)',
      'Jelly Foot Spa Pedicure',
      'Special Accent Nail Art (Chrome / Stones)',
      'Hot Stone Leg & Foot Massage',
    ],
    features: [
      'Clean & safe cuticle shaping',
      'Warm jelly soak that relaxes tired feet',
      'Choice of mirror chrome or glitter art',
      'Nourishing shea butter hand cream massage',
    ],
    idealFor: 'Working women, special events & monthly care',
  },
  {
    id: 'self-care-luxury-package',
    name: 'Self-Care Relaxation Package',
    tagline: 'Full relaxing session for skin, hands, and feet',
    description:
      'Relax completely with an anti-tan skin cleanup facial, warm paraffin hand spa, lavender foot bath, and herbal hair spa.',
    price: 3299,
    originalPrice: 4299,
    duration: '3.0 Hours',
    category: 'spa',
    badge: 'Relaxing Spa',
    popular: false,
    homeService: true,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop&q=80',
    includedServices: [
      'Deep Hydration Anti-Tan Facial Mask',
      'Warm Paraffin Wax Hand Rejuvenation',
      'Lavender Essential Oil Foot Bath & Scrub',
      'Herbal Steam Hair Spa & Head Massage',
      'Eyebrow & Upper Lip Threading',
    ],
    features: [
      'Detoxifying fruit enzymes that even out skin tone',
      'Warm melted paraffin bath for baby-soft hands & joints',
      'Organic cold-pressed oils for scalp tension relief',
      'Complimentary soothing herbal chamomile tea',
    ],
    idealFor: 'Monthly recharge, birthday self-care & wellness days',
  },
  {
    id: 'weekend-pamper-package',
    name: 'Weekend Pamper Package',
    tagline: 'Quick yet thorough head-to-toe grooming for event-ready glow',
    description:
      'Designed for busy schedules. Fast file & buff manicure, peppermint cooling pedicure, threading grooming, and vitamin C radiance clean-up mask.',
    price: 1699,
    originalPrice: 2199,
    duration: '90 Minutes',
    category: 'signature',
    badge: 'Express Glow',
    popular: false,
    homeService: true,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=80',
    includedServices: [
      'Express File, Shape & Buff Manicure',
      'Peppermint Cooling Foot Cleanse & Polish',
      'Eyebrow Shaping & Upper Lip Threading',
      'Vitamin C Radiance Face Clean-up',
    ],
    features: [
      'Rapid dead-skin buffing and natural high-shine buffer',
      'Instant bright skin detox without downtime',
      'Fast-drying chip-resistant European polishes',
      'Available for same-day doorstep home salon booking',
    ],
    idealFor: 'Weekend parties, brunch readiness & busy moms',
  },
  {
    id: 'couple-friends-package',
    name: 'Couple / Friends Package (For 2)',
    tagline: 'Simultaneous dual luxury spa session crafted for two guests',
    description:
      'Share the pampering experience with your partner, mother, or best friend. Includes dual side-by-side rose pedal foot spas, hand reflexology, gel polish, and herbal tea.',
    price: 3799,
    originalPrice: 4999,
    duration: '2.0 Hours',
    category: 'friends',
    badge: 'Perfect For Two',
    popular: true,
    homeService: true,
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop&q=80',
    includedServices: [
      '2x Deluxe Rose Petal Foot Spas Side-by-Side',
      '2x Hand Manicures or Deep Reflexology',
      'Gel Polish or High-Shine Buff for Both',
      'Gourmet Herbal Tea & Refreshment Tray',
    ],
    features: [
      'Private styling lounge setup for dual comfort',
      'Two master technicians dedicated solely to your duo',
      'Option to split treatments between salon & home setup',
      'Customized aromatic oils tailored to each guest',
    ],
    idealFor: 'Mother-daughter days, bridal besties & couples',
  },
  {
    id: 'complete-beauty-package',
    name: 'Complete Beauty Package',
    tagline: 'The all-inclusive head-to-toe couture transformation',
    description:
      'The ultimate total indulgence. Combines BIAB nail strengthening overlays, 24K gold facial, full body dead-sea salt polish, and bespoke festival hand mehndi.',
    price: 5199,
    originalPrice: 6999,
    duration: '4.0 Hours',
    category: 'signature',
    badge: 'Total Indulgence',
    popular: false,
    homeService: true,
    image: 'https://images.unsplash.com/photo-1610992015762-45dca7464f11?w=800&h=600&fit=crop&q=80',
    includedServices: [
      'BIAB (Builder Gel) Natural Nail Overlay',
      '24K Gold Foil Facial & Micro-Derma Cleanse',
      'Full Arms & Full Legs Honey Waxing',
      'Organic Festival Mehndi on Both Palms',
      'Aromatherapy Foot Spa with Paraffin Dip',
    ],
    features: [
      'Long-lasting BIAB overlay that promotes natural nail growth',
      'Full body silkening exfoliation with organic oils',
      'Fine Arabic or floral mandala henna pattern',
      'Save over ₹1,800 compared to individual services',
    ],
    idealFor: 'Pre-vacation preparation, Karwa Chauth & milestone events',
  },
];

const COMPARISON_DATA = [
  { feature: 'Service Duration', bridal: '4.5 hrs', nailSpa: '2.5 hrs', selfCare: '3.0 hrs', weekend: '1.5 hrs', friends: '2.0 hrs', complete: '4.0 hrs' },
  { feature: 'Nail Extensions / BIAB', bridal: 'Full 3D Sculpted', nailSpa: 'Gel Polish', selfCare: 'Paraffin Care', weekend: 'Classic Buff', friends: 'Gel / Buff', complete: 'BIAB Builder' },
  { feature: 'Swarovski / 3D Art', bridal: '✓ (Full Crystals)', nailSpa: '✓ (Accent 2-4)', selfCare: '—', weekend: '—', friends: 'Optional', complete: '✓ (Accent)' },
  { feature: 'Deluxe Foot Spa Pedicure', bridal: '✓ (Rose Basin)', nailSpa: '✓ (Jelly Spa)', selfCare: '✓ (Lavender)', weekend: '✓ (Peppermint)', friends: '✓ (Dual Basin)', complete: '✓ (Paraffin)' },
  { feature: 'Facial Treatment', bridal: '24K Gold Radiant', nailSpa: '—', selfCare: 'Anti-Tan Detox', weekend: 'Vitamin C Glow', friends: '—', complete: '24K Gold Foil' },
  { feature: 'Organic Henna / Mehndi', bridal: '✓ (Arms & Feet)', nailSpa: '—', selfCare: '—', weekend: '—', friends: '—', complete: '✓ (Palms)' },
  { feature: 'Doorstep Home Service', bridal: '✓ Available', nailSpa: '✓ Available', selfCare: '✓ Available', weekend: '✓ Available', friends: '✓ Available', complete: '✓ Available' },
  { feature: 'Privilege Package Price', bridal: '₹4,999', nailSpa: '₹2,499', selfCare: '₹3,299', weekend: '₹1,699', friends: '₹3,799', complete: '₹5,199' },
  { feature: 'Your Total Savings', bridal: 'Save ₹2,500', nailSpa: 'Save ₹700', selfCare: 'Save ₹1,000', weekend: 'Save ₹500', friends: 'Save ₹1,200', complete: 'Save ₹1,800' },
];

export default function PackagesPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'signature' | 'bridal' | 'spa' | 'friends'>('all');

  useSEO({
    title: 'Curated Nail & Beauty Packages | Bridal, Spa & Combo Deals – Nails by Uma Jaipur',
    description:
      'Discover exclusive luxury packages at Nails by Uma Jaipur: Bridal Glow, Nail + Spa Combo, Self-Care Luxury, Weekend Pamper, and Friends Duos. Privileged combination pricing with master technicians.',
    keywords:
      'bridal glow package jaipur, nail and spa combo, beauty package jaipur, best salon deals jaipur, self care spa package, friends salon package, nails by uma packages',
    canonicalPath: '/packages',
    ogImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=630&fit=crop&q=80',
  });

  useBreadcrumbSchema();

  const packagesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Curated Beauty & Nail Service Packages at Nails by Uma',
    description: 'Bespoke beauty combinations, bridal makeovers, and luxury spa packages in Jaipur.',
    numberOfItems: SIGNATURE_PACKAGES.length,
    itemListElement: SIGNATURE_PACKAGES.map((pkg, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Offer',
        name: pkg.name,
        price: pkg.price,
        priceCurrency: 'INR',
        description: pkg.description,
        seller: { '@id': BUSINESS_ID },
      },
    })),
  };
  useJsonLd(packagesJsonLd, 'packages-list');

  const filteredPackages =
    selectedFilter === 'all'
      ? SIGNATURE_PACKAGES
      : SIGNATURE_PACKAGES.filter((p) => p.category === selectedFilter);

  const handleBookPackage = (pkg: Package) => {
    try {
      localStorage.setItem(
        'selectedPackage',
        JSON.stringify({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          duration: pkg.duration,
        })
      );
    } catch {
      // ignore
    }
    navigate(`/book?package=${pkg.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/20 via-background to-muted/20 pb-24">
      {/* ── 1. LUXURY EDITORIAL HERO BANNER ─────────────────────────── */}
      <section className="relative min-h-[480px] lg:min-h-[520px] flex items-center justify-center overflow-hidden bg-slate-950 text-white px-4 py-20">
        {/* Background Flat-Lay Beauty & Pampering Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&h=1080&fit=crop&q=85"
            alt="Luxury beauty pampering flat-lay setup"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-rose-950/70 to-slate-950/80" />
        </div>

        <div className="relative z-10 container mx-auto max-w-5xl text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-rose-100 uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Special Combos &amp; Great Savings</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white"
          >
            Popular Beauty <br />
            <span className="bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              Packages &amp; Combos.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-rose-100/90 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Special savings bundles for weddings, weekend pampering, and self-care days. Save up to 35% with trained artists and 100% sanitized clean tools.
          </motion.p>
        </div>
      </section>

      {/* ── 2. FILTER TABS ─────────────────────────────────────────── */}
      <section className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs py-3 px-4">
        <div className="container mx-auto max-w-7xl flex items-center justify-start sm:justify-center overflow-x-auto gap-2 no-scrollbar">
          {[
            { id: 'all', label: 'All Packages', icon: '✨' },
            { id: 'bridal', label: 'Bridal Makeovers', icon: '👑' },
            { id: 'signature', label: 'Nail & Beauty Combos', icon: '💅' },
            { id: 'spa', label: 'Spa & Wellness', icon: '🫧' },
            { id: 'friends', label: 'Duos & Friends', icon: '👯' },
          ].map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-sm scale-105'
                    : 'bg-pink-50/70 text-slate-700 hover:bg-pink-100/70 hover:text-pink-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. SIGNATURE PACKAGES GRID ─────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 block">The Repertoire</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Handcrafted Experience Suites</h2>
          <p className="text-sm text-slate-600">
            Each bundle is timed and sequenced to deliver an unhurried, deeply relaxing salon ritual.
          </p>
        </div>

        <motion.div
          layout
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredPackages.map((pkg) => {
              const discountAmount = pkg.originalPrice - pkg.price;
              const discountPercent = Math.round((discountAmount / pkg.originalPrice) * 100);

              return (
                <motion.article
                  key={pkg.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={`glass-card rounded-3xl overflow-hidden border ${
                    pkg.popular ? 'border-pink-400/80 ring-2 ring-pink-500/20 shadow-xl' : 'border-white/90 shadow-md'
                  } bg-white/85 backdrop-blur-xl flex flex-col justify-between group transition-all duration-300`}
                >
                  <div>
                    {/* Visual Cover Photo with Overlay Badges */}
                    <div className="relative h-60 w-full overflow-hidden bg-pink-100">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {pkg.badge && (
                          <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                            <Sparkles className="w-3 h-3" />
                            {pkg.badge}
                          </span>
                        )}
                        {pkg.homeService && (
                          <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                            🏡 Home Service Ready
                          </span>
                        )}
                      </div>

                      {/* Duration Tag */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-pink-300" />
                          {pkg.duration}
                        </span>
                      </div>

                      {/* Header Over Image */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-pink-200 block mb-1">
                          {pkg.idealFor}
                        </span>
                        <h3 className="font-serif text-2xl font-bold leading-tight drop-shadow-sm text-white">
                          {pkg.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6">
                      <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                        {pkg.description}
                      </p>

                      {/* Included Services Block */}
                      <div className="mb-6 p-4 rounded-2xl bg-pink-50/60 border border-pink-100">
                        <span className="text-[11px] font-bold text-pink-700 uppercase tracking-wider block mb-2.5">
                          Included Treatments:
                        </span>
                        <ul className="space-y-2">
                          {pkg.includedServices.map((service, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{service}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Key Highlights */}
                      <div className="space-y-1.5 mb-6">
                        {pkg.features.slice(0, 2).map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-500">
                            <Sparkle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Pricing & CTA */}
                  <div className="p-6 pt-0 border-t border-pink-100/70 mt-auto">
                    <div className="flex items-center justify-between pt-4 mb-4">
                      {/* Pricing Display */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-3xl font-extrabold text-slate-900">
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{pkg.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-100">
                          Save ₹{discountAmount.toLocaleString('en-IN')} ({discountPercent}% Privileged)
                        </span>
                      </div>
                    </div>

                    {/* Book Button */}
                    <Button
                      onClick={() => handleBookPackage(pkg)}
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold h-11 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Book Package</span>
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── 4. PACKAGE COMPARISON TABLE ────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 block">Matrix</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Compare Package Inclusions</h2>
          <p className="text-sm text-slate-600">
            A transparent breakdown to help you pick the perfect treatment suite.
          </p>
        </div>

        <div className="glass-panel rounded-3xl border border-white/90 shadow-xl overflow-hidden bg-white/90">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-pink-100/80 via-rose-50 to-pink-100/80 border-b border-pink-200 text-slate-900 font-serif">
                  <th className="p-4 sm:p-5 font-bold">Treatment Feature</th>
                  <th className="p-4 sm:p-5 font-bold text-pink-700">Bridal Glow</th>
                  <th className="p-4 sm:p-5 font-bold">Nail + Spa</th>
                  <th className="p-4 sm:p-5 font-bold">Self-Care</th>
                  <th className="p-4 sm:p-5 font-bold">Weekend</th>
                  <th className="p-4 sm:p-5 font-bold">Couple/Duo</th>
                  <th className="p-4 sm:p-5 font-bold">Complete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100/70 text-slate-700">
                {COMPARISON_DATA.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={
                      rIdx % 2 === 0
                        ? 'bg-white/40 hover:bg-pink-50/40 transition-colors'
                        : 'bg-white/80 hover:bg-pink-50/40 transition-colors'
                    }
                  >
                    <td className="p-4 sm:p-5 font-semibold text-slate-900 whitespace-nowrap">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-bold text-pink-600 whitespace-nowrap">{row.bridal}</td>
                    <td className="p-4 sm:p-5 whitespace-nowrap">{row.nailSpa}</td>
                    <td className="p-4 sm:p-5 whitespace-nowrap">{row.selfCare}</td>
                    <td className="p-4 sm:p-5 whitespace-nowrap">{row.weekend}</td>
                    <td className="p-4 sm:p-5 whitespace-nowrap">{row.friends}</td>
                    <td className="p-4 sm:p-5 font-semibold text-slate-900 whitespace-nowrap">{row.complete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 5. CUSTOM PACKAGE CONCIERGE CTA ──────────────────────────── */}
      <section className="container mx-auto max-w-5xl px-4 mt-20">
        <div className="glass-panel p-8 sm:p-14 rounded-3xl border border-white/90 shadow-2xl text-center bg-gradient-to-r from-white via-pink-50/50 to-amber-50/40 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 to-rose-400 text-white flex items-center justify-center mx-auto mb-6 shadow-md">
            <Gift className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Need a Custom Package?
          </h2>

          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Planning a wedding, sangeet party, or group event? Our team will create a custom combo package suited to your exact schedule and group size in Jaipur.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-pink-600/30"
            >
              Contact Salon Team
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                window.open(
                  'https://wa.me/916376539366?text=Hi%20Uma!%20I%20would%20like%20to%20create%20a%20custom%20beauty%20package.',
                  '_blank'
                )
              }
              className="border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold px-8 h-12 rounded-xl"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" />
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
