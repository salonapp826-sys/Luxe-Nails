import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  Heart,
  Sparkles,
  Users,
  Clock,
  Star,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  ArrowRight,
  MessageCircle,
  Gem,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { useJsonLd } from '@/hooks/useJsonLd';
import { buildAboutPageSchema } from '@/lib/aboutSchema';

const PAGE_TITLE = 'About Nails by Uma | Our Story, Quality Care & Promise – Jaipur';
const PAGE_DESCRIPTION =
  'Discover the story of Nails by Uma: founded in 2014 by master artist Uma Sharma. Certified nail artists, 100% sterilized clean tools, pure organic bridal mehndi, and friendly doorstep spa services across Jaipur.';

// Framer Motion Stagger Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function AboutPage() {
  const navigate = useNavigate();

  useSEO({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    keywords:
      'about nails by uma, uma sharma nail artist, luxury nail salon jaipur, bridal mehndi specialist rajasthan, nail salon philosophy jaipur, best nail studio rajasthan, certified nail technicians, sterile nail salon',
    canonicalPath: '/about',
    ogImage: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=1200&h=630&fit=crop&q=80',
  });

  useBreadcrumbSchema();

  const stats = [
    { icon: Users, label: 'Happy Clients', value: '5,000+' },
    { icon: Star, label: 'Years Experience', value: '12+' },
    { icon: Award, label: 'Beauty Awards', value: '25+' },
    { icon: Sparkles, label: 'Special Treatments', value: '50+' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Friendly Customer Care',
      description:
        'Every customer is special for us. We check your nail health first and listen carefully to what you want.',
    },
    {
      icon: ShieldCheck,
      title: '100% Hygienic & Sanitized Tools',
      description:
        '100% sanitized tools, clean tables, and single-use buffers keep your hands and feet completely safe.',
    },
    {
      icon: Gem,
      title: 'Neat & Expert Work',
      description:
        'From gentle cuticle cleaning to beautiful 3D nail art designs, clean work is our daily promise.',
    },
    {
      icon: Leaf,
      title: 'Safe & Pure Products',
      description:
        'Non-toxic gel polishes, gentle beauty products, and 100% pure organic Mehndi directly from Sojat.',
    },
  ];

  const team = [
    {
      name: 'Uma Sharma',
      role: 'Owner & Master Nail Artist',
      experience: '12+ Years Experience',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&q=80',
      bio: 'Pioneer of gel extensions and 3D bridal nail art in Jaipur. Trained expert with over 5,000 happy brides and salon customers.',
      specialties: ['3D Nail Extensions', 'Gel Polish Care', 'Bridal Nail Art'],
    },
    {
      name: 'Anita Verma',
      role: 'Senior Nail Artist & Gel Specialist',
      experience: '8+ Years Experience',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&q=80',
      bio: 'Expert in mirror chrome polish, natural nail gel overlays, and long-lasting chip-free gel manicures.',
      specialties: ['Mirror Chrome Polish', 'Natural Gel Overlay', 'French Tips'],
    },
    {
      name: 'Neha Patel',
      role: 'Head Bridal Mehndi Artist',
      experience: '10+ Years Experience',
      image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=600&h=600&fit=crop&q=80',
      bio: 'Specialist in Rajasthani bridal figure mehndi, Arabic designs, and organic natural dark-stain henna cones.',
      specialties: ['Bridal Figure Mehndi', 'Arabic Henna', 'Organic Cones'],
    },
    {
      name: 'Kavita Singh',
      role: 'Beauty Expert & Spa Specialist',
      experience: '7+ Years Experience',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=600&fit=crop&q=80',
      bio: 'Certified beauty expert delivering relaxing foot spa, fruit & gold facials, and skin cleanup treatments.',
      specialties: ['Gold Glow Facial', 'Hot Stone Foot Massage', 'Relaxing Hand Spa'],
    },
  ];

  const milestones = [
    {
      year: '2014',
      title: 'Our First Nail Studio in Jaipur',
      description:
        'Uma Sharma started Nails by Uma in Mansarovar with a dream: giving high quality, clean, and affordable nail care in Jaipur.',
    },
    {
      year: '2017',
      title: 'Bridal Henna & 3D Nail Art',
      description:
        'Expanded to full bridal beauty packages, organic Mehndi cones, and crystal nail art for weddings.',
    },
    {
      year: '2020',
      title: 'Home Salon Service Launch',
      description:
        'Started sanitized home salon services across Jaipur, bringing salon care right to your home doorstep.',
    },
    {
      year: '2023',
      title: 'Best Nail Salon in Jaipur Award',
      description:
        'Honored with the Jaipur Beauty Excellence Award with 5,000+ happy 5-star customer reviews.',
    },
    {
      year: '2026',
      title: 'Easy Online Booking & Care',
      description:
        'Celebrating 12+ years of service with instant WhatsApp and online booking, loyalty points rewards, and friendly beauty care.',
    },
  ];

  // Schema Injection
  useJsonLd(
    buildAboutPageSchema({
      team,
      stats: stats.map(({ label, value }) => ({ label, value })),
      pageTitle: PAGE_TITLE,
      pageDescription: PAGE_DESCRIPTION,
    }),
    'about-page'
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/20 via-background to-muted/20 pb-24">
      {/* ── 1. EDITORIAL HERO SECTION ────────────────────────────────── */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden bg-slate-950 text-white px-4 py-20">
        {/* Background Craftsmanship Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1583001809873-a128495da465?w=1920&h=1080&fit=crop&q=85"
            alt="Close-up nail craftsmanship and bridal mehndi art"
            className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-rose-950/70 to-slate-950/80" />
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl grid lg:grid-cols-12 gap-10 items-center">
          {/* Headline & Brand Manifesto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-rose-100 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Our Story · Heritage · Artistry</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
              Where Artistry Meets <br />
              <span className="bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                Pure Elegance.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-rose-100/90 font-light leading-relaxed max-w-xl">
              Since 2014, Nails by Uma has provided expert nail extensions, organic bridal mehndi, and relaxing spa care in Jaipur. We treat every customer with care and friendly attention.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/book')}
                className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-2xl font-bold px-8 shadow-lg shadow-pink-600/30"
              >
                Book Appointment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/services')}
                className="border-white/40 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-2xl font-semibold px-6"
              >
                Explore Services
              </Button>
            </div>
          </motion.div>

          {/* Floating Editorial Quote Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <div className="glass-panel p-8 rounded-3xl border border-white/30 shadow-2xl bg-white/85 text-slate-800 backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-rose-100">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-pink-500 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80"
                    alt="Uma Sharma"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-slate-900">Uma Sharma</h4>
                  <p className="text-xs text-pink-600 font-semibold">Founder &amp; Master Nail Stylist</p>
                </div>
              </div>

              <blockquote className="font-serif text-base sm:text-lg italic text-slate-700 leading-relaxed">
                &ldquo;Nail care is not mere maintenance; it is an intimate canvas of personal style, confidence, and
                timeless beauty.&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-pink-50/80 border border-pink-100">
                  <span className="font-bold text-slate-900 block">10,000+</span>
                  <span className="text-slate-500">Manicures Performed</span>
                </div>
                <div className="p-3 rounded-xl bg-pink-50/80 border border-pink-100">
                  <span className="font-bold text-slate-900 block">100% Sterile</span>
                  <span className="text-slate-500">Autoclave Certified</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. STATS BANNER ─────────────────────────────────────────── */}
      <section className="container mx-auto max-w-6xl px-4 -mt-10 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/90 shadow-xl bg-white/90 backdrop-blur-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* ── 3. SALON STORY & BRAND PHILOSOPHY ───────────────────────── */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Large Editorial Imagery Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-pink-100">
              <img
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1000&h=1250&fit=crop&q=80"
                alt="Intricate nail styling session at salon"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Inset Photo Overlay */}
            <div className="absolute -bottom-8 -right-6 w-48 sm:w-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-square hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1610992015762-45dca7464f11?w=600&h=600&fit=crop&q=80"
                alt="Precision manicure detail"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Editorial Story Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-xs uppercase font-bold tracking-widest text-pink-600">The Salon Story</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
              A Decade of Mastering the Fine Art of Nail Architecture
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              When Uma Sharma founded <strong>Nails by Uma</strong> in 2014, salon nails in Jaipur were largely treated
              as a quick add-on. Uma saw an opportunity to bring European precision, non-damaging gel overlays, and
              hand-sculpted 3D artistry to women who appreciate exceptional craftsmanship.
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Over the last 12 years, our boutique has evolved into one of Rajasthan's most sought-after destinations for
              brides, working professionals, and beauty enthusiasts. Whether it is an e-file Russian manicure that leaves
              cuticles flawless for a month or a 100% organic bridal mehndi suite, our philosophy remains uncompromised:
              <strong> Health first, artistry always.</strong>
            </p>

            {/* Quality Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Certified Russian e-manicure methods</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero harsh chemicals or MMA monomers</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Customized bridal trials &amp; consultations</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Sanitized mobile door-to-door home spa</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 4. HYGIENE, SAFETY & PREMIUM PRODUCTS ───────────────────── */}
      <section className="bg-gradient-to-r from-pink-50/60 via-white to-amber-50/50 py-20 border-y border-pink-100">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-pink-600 block">OUR HYGIENE &amp; SAFETY PROMISE</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              100% Clean, Safe &amp; Hygienic Beauty Care
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your health and safety come first. We use 100% sanitized tools and safe products so you can relax without any worry.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={cardVariants} className="glass-card p-8 rounded-3xl border border-white shadow-sm bg-white/80">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl font-bold mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">100% Sanitized &amp; Clean Tools</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All metal tools are cleaned and sterilized in high-temperature machines, then opened from fresh sealed pouches right in front of you.
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="glass-card p-8 rounded-3xl border border-white shadow-sm bg-white/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mb-5">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">Pure &amp; Safe Henna</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No harmful chemicals or dyes. We use pure Rajasthani henna mixed with natural oils for safe, deep dark mehndi color.
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="glass-card p-8 rounded-3xl border border-white shadow-sm bg-white/80">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold mb-5">
                <Gem className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">Safe &amp; Chemical-Free Gels</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We use high-quality, branded gel polishes that protect your natural nails from damage, thinning, or yellowing.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. CORE SALON VALUES ────────────────────────────────────── */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 block">The Uma Experience</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Our Guiding Salon Values</h2>
          <p className="text-sm text-slate-600">The pillars that define every appointment, consultation, and treatment.</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {values.map((val, i) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="glass-card p-6 rounded-3xl border border-white/90 shadow-sm bg-white/75 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center mb-4 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-slate-900 mb-2">{val.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{val.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── 6. MEET OUR MASTER ARTISTS & SPECIALISTS ────────────────── */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 block">Master Artisans</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Meet Our Talented Specialists</h2>
          <p className="text-sm text-slate-600">
            Passionate, certified professionals committed to elevating your beauty experience.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {team.map((member, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card rounded-3xl overflow-hidden border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white/80"
            >
              <div>
                <div className="relative h-64 w-full overflow-hidden bg-pink-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {member.experience}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-slate-900">{member.name}</h3>
                  <p className="text-xs text-pink-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{member.bio}</p>

                  <div className="flex flex-wrap gap-1">
                    {member.specialties.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-pink-50 text-pink-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-pink-100"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/book')}
                  className="w-full border-pink-200 hover:bg-pink-50 text-slate-800 text-xs rounded-xl font-semibold"
                >
                  Book with {member.name.split(' ')[0]}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 7. TIMELINE & JOURNEY (2014 - 2026) ──────────────────────── */}
      <section className="container mx-auto max-w-5xl px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 block">Milestones</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Our 12-Year Journey</h2>
          <p className="text-sm text-slate-600">From a humble 2-chair salon to Jaipur's benchmark luxury nail brand.</p>
        </div>

        <div className="relative border-l-2 border-pink-200 ml-4 md:ml-32 space-y-12">
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative pl-8 sm:pl-12 group"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 border-2 border-white shadow-md group-hover:scale-125 transition-transform" />

              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/90 shadow-sm bg-white/80 hover:shadow-md transition-shadow">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-pink-600 block mb-1">
                  {m.year}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 mb-2">{m.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{m.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 8. FINAL APPOINTMENT CTA ─────────────────────────────────── */}
      <section className="container mx-auto max-w-5xl px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-8 sm:p-14 rounded-3xl border border-white/90 shadow-2xl text-center bg-gradient-to-r from-white via-pink-50/50 to-amber-50/40 relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 to-rose-400 text-white flex items-center justify-center mx-auto mb-6 shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Ready for an Unforgettable <br className="hidden sm:inline" />
            Nail &amp; Beauty Experience?
          </h2>

          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
            Reserve your seat at our Jaipur atelier or schedule door-to-door home salon service today. Enjoy flat ₹200 OFF
            on your first online booking with code <strong>LUXEUMA</strong>.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/book')}
              className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-pink-600/30"
            >
              Book Your Appointment
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                window.open(
                  'https://wa.me/916376539366?text=Hi%20Uma!%20I%20would%20like%20to%20know%20more%20about%20your%20services.',
                  '_blank'
                )
              }
              className="border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold px-8 h-12 rounded-xl"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" />
              Chat on WhatsApp
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
