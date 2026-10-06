import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Sparkles,
  MessageCircle,
  Navigation,
  Calendar,
  CheckCircle2,
  Car,
  Train,
  Building,
  Instagram,
  Facebook,
  Youtube,
  ArrowRight,
  ShieldCheck,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';

export function ContactPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useSEO({
    title: 'Contact Us & Atelier Location | Nails by Uma Jaipur',
    description:
      'Visit Nails by Uma luxury nail studio in Mansarovar, Jaipur. Call +91 63765 39366, WhatsApp us for bridal enquiries, or get directions. Mon–Sat 10 AM–8 PM, Sun 11 AM–6 PM.',
    canonicalPath: '/contact',
    ogImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=630&fit=crop&q=80',
  });

  useBreadcrumbSchema();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceInterest: 'Russian Manicure & Nail Art',
    datePreference: '',
    message: '',
  });

  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simulate enquiry submission & optional WhatsApp redirection
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      toast({
        title: 'Enquiry Received! ✨',
        description: `Thank you ${formData.name}. Uma Sharma will respond via WhatsApp within 15 minutes.`,
      });
    }, 1000);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hi Nails by Uma! I would like to enquire about salon appointment & bridal nail packages in Jaipur.`
    );
    window.open(`https://wa.me/916376539366?text=${text}`, '_blank');
  };

  const handleGetDirections = () => {
    window.open('https://maps.google.com/?q=Mansarovar,+Jaipur,+Rajasthan', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-600/15 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-pink-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section with Luxury Salon Entrance Image */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-b border-pink-500/20 overflow-hidden min-h-[440px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&auto=format&fit=crop&q=80"
            alt="Luxury Salon Entrance with Gold and Marble Finishes"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-screen scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/70" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Visit Our Salon Studio
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-md">
              Your Favourite{' '}
              <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                Beauty &amp; Nail Salon in Jaipur
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Step into our cozy Jaipur salon for nail art and relaxing spa care, or request our trained artists at your doorstep.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                onClick={handleWhatsAppDirect}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold gap-2 px-5 py-2.5 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                WhatsApp Direct: +91 63765 39366
              </Button>
              <Button
                onClick={handleGetDirections}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold gap-2 px-5 py-2.5 backdrop-blur-md"
              >
                <Navigation className="w-4 h-4 text-pink-400" />
                Get Driving Directions
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* 4 Luxury Contact Information Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {/* 1. Address Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 backdrop-blur-xl hover:border-pink-500/40 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-white text-lg mb-1">Salon Studio</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Main Market Road, Near City Center Plaza, Mansarovar, Jaipur, Rajasthan 302020
              </p>
            </div>
            <button
              onClick={handleGetDirections}
              className="mt-4 pt-3 border-t border-white/10 text-xs font-bold text-pink-300 hover:text-pink-200 flex items-center gap-1.5"
            >
              Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* 2. Direct Phone & WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-white text-lg mb-1">Direct Call & WhatsApp</h3>
              <p className="text-sm font-mono font-bold text-white mt-1">+91 63765 39366</p>
              <p className="text-xs text-emerald-400 font-medium mt-1">Direct Line to Uma Sharma</p>
            </div>
            <button
              onClick={handleWhatsAppDirect}
              className="mt-4 pt-3 border-t border-white/10 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
            >
              Chat on WhatsApp <MessageCircle className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* 3. Opening Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 backdrop-blur-xl hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-white text-lg mb-1">Opening Hours</h3>
              <div className="text-xs text-slate-300 space-y-1 mt-2">
                <p><span className="text-slate-400">Mon – Sat:</span> 10:00 AM – 08:00 PM</p>
                <p><span className="text-slate-400">Sunday:</span> 11:00 AM – 06:00 PM</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Open & Accepting Bookings
            </div>
          </motion.div>

          {/* 4. Email Concierge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 backdrop-blur-xl hover:border-pink-500/40 transition-all flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-white text-lg mb-1">Email Concierge</h3>
              <p className="text-xs text-slate-300 leading-relaxed break-all">
                diamonmediapromotion@gmail.com
              </p>
              <p className="text-xs text-slate-400 mt-1">Bridal & Destination Wedding Requests</p>
            </div>
            <a
              href="mailto:diamonmediapromotion@gmail.com"
              className="mt-4 pt-3 border-t border-white/10 text-xs font-bold text-rose-300 hover:text-rose-200 flex items-center gap-1.5"
            >
              Write to Concierge <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>

        {/* Section 2: Prominent Location Map & Directions + Contact Form */}
        <div className="grid lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Prominent Map & Travel Directions (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-pink-400">Atelier Coordinates</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
                    Location & Directions
                  </h2>
                </div>
                <Button
                  onClick={handleGetDirections}
                  className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold gap-1.5 px-4"
                >
                  <Navigation className="w-3.5 h-3.5" /> Navigate Now
                </Button>
              </div>

              {/* Visually Prominent Embedded Google Map */}
              <div className="relative rounded-2xl overflow-hidden border border-pink-500/30 shadow-2xl h-80 sm:h-96 w-full bg-slate-900">
                <iframe
                  title="Nails by Uma Salon Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113886.7327914561!2d75.71987515!3d26.91243365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              {/* Transit & Accessibility Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-pink-400 font-bold mb-1">
                    <Train className="w-4 h-4" /> Metro Access
                  </div>
                  <p className="text-slate-300">Mansarovar Metro Station (5 min cab ride to studio).</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                    <Car className="w-4 h-4" /> Valet & Parking
                  </div>
                  <p className="text-slate-300">Complimentary guest valet & ample dedicated car parking.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <Building className="w-4 h-4" /> Landmark
                  </div>
                  <p className="text-slate-300">Opposite City Center Plaza & Gold Souk Boulevard.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Luxury Contact & Enquiry Form (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-slate-900 border border-pink-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="mb-6">
                <span className="text-xs uppercase font-bold tracking-widest text-pink-400">Concierge Inquiry</span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">Send a Message</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Have a question regarding custom bridal themes, nail extension refills, or home salon visits?
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif font-bold text-white text-lg">Message Sent to Uma!</h4>
                  <p className="text-xs text-slate-300">
                    We will get back to you immediately via WhatsApp or phone call.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-xs text-slate-300">Your Full Name *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Pooja Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 bg-slate-950/80 border-pink-500/30 text-white placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-300">WhatsApp / Phone *</Label>
                      <Input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 bg-slate-950/80 border-pink-500/30 text-white placeholder:text-slate-500 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Email Address</Label>
                      <Input
                        type="email"
                        placeholder="pooja@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 bg-slate-950/80 border-pink-500/30 text-white placeholder:text-slate-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">Interested In</Label>
                    <select
                      value={formData.serviceInterest}
                      onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                      className="mt-1 w-full bg-slate-950/80 border border-pink-500/30 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="Russian Manicure & Nail Art">Russian Manicure & Nail Art</option>
                      <option value="Royal Bridal Nails & Mehndi">Royal Bridal Nails & Mehndi</option>
                      <option value="BIAB Builder Gel Extensions">BIAB Builder Gel Extensions</option>
                      <option value="Luxury Foot Spa Pedicure">Luxury Foot Spa Pedicure</option>
                      <option value="24K Gold Facial Therapy">24K Gold Facial Therapy</option>
                      <option value="Doorstep Home Beauty Service">Doorstep Home Beauty Service</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-300">Message / Inspo Details</Label>
                    <Textarea
                      rows={3}
                      placeholder="Tell us your nail art inspiration, wedding date, or custom requests..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="mt-1 bg-slate-950/80 border-pink-500/30 text-white placeholder:text-slate-500 rounded-xl text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl py-3 text-xs font-bold gap-2 shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sending ? 'Sending to Concierge...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* Section 3: Social Media Community & Quick Booking Banner */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Social Channels (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            <h3 className="font-serif font-bold text-white text-xl mb-2">Connect on Social</h3>
            <p className="text-xs text-slate-400 mb-6">
              Follow our latest masterclasses, daily client nail transformations, and bridal mehndi reels.
            </p>

            <div className="space-y-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-pink-500/20 hover:border-pink-500 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">@nailsbyuma_jaipur</h4>
                    <p className="text-[10px] text-slate-400">18.5K Fashion & Bridal Followers</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-pink-500/20 hover:border-rose-500 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Nails by Uma Studio</h4>
                    <p className="text-[10px] text-slate-400">Tutorials & Technique Vlogs</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-pink-500/20 hover:border-blue-500 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Nails by Uma Atelier</h4>
                    <p className="text-[10px] text-slate-400">Client Reviews & Events</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Booking CTA Banner (7 Cols) */}
          <div className="lg:col-span-7 bg-gradient-to-r from-pink-950/60 via-purple-950/50 to-slate-900 border border-pink-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Instant Online Booking
              </span>
              <h3 className="font-serif font-bold text-white text-2xl sm:text-3xl">
                Ready for Your Couture Beauty Session?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Choose your favorite nail enhancement or bridal package and reserve an available appointment slot in under 2 minutes.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={() => navigate('/book')}
                  className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold gap-2 px-6 py-3 shadow-lg"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment Online
                </Button>
                <Button
                  onClick={handleWhatsAppDirect}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold gap-2 px-5 py-3 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Stylist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContactPage;
