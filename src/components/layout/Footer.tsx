import { Heart, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

export function Footer() {
  const { tenant } = useTenant();

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: tenant.instagram_url || 'https://instagram.com',
      color: 'hover:text-pink-500',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: tenant.facebook_url || 'https://facebook.com',
      color: 'hover:text-blue-600',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: tenant.youtube_url || 'https://youtube.com',
      color: 'hover:text-red-600',
    },
  ];

  return (
    <footer className="hidden md:block bg-gradient-to-b from-background to-muted/20 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
              {tenant.business_name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Best Nail, Beauty & Salon templates. 100% Hygienic & Sanitized Tools for your safe self-care.
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              📍 {tenant.address}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-3 h-3 fill-red-500 text-red-500" /> by {tenant.business_name}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/book" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Book Appointment
                </a>
              </li>
              <li>
                <a href="/packages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Packages & Offers
                </a>
              </li>
              <li>
                <a href="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="/my-bookings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Track Booking
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/reviews" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Reviews
                </a>
              </li>
              <li>
                <a href="/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors opacity-60">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>
                <a href={`tel:${tenant.phone}`} className="hover:text-foreground transition-colors">
                  📞 {tenant.phone}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${tenant.whatsapp}`} className="hover:text-foreground transition-colors">
                  💬 WhatsApp Us ({tenant.phone})
                </a>
              </li>
              <li>
                <a href={`mailto:${tenant.email}`} className="hover:text-foreground transition-colors text-xs">
                  ✉️ {tenant.email}
                </a>
              </li>
            </ul>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`p-2 rounded-full bg-muted hover:scale-110 transition-all ${social.color}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {tenant.business_name}. All rights reserved.</p>
          <p className="text-xs mt-1">Operating Hours: {tenant.timings} | Phone: {tenant.phone}</p>
        </div>
      </div>
    </footer>
  );
}
