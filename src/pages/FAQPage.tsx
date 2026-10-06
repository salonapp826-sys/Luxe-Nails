
import { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useSEO({
    title: 'FAQ | Nail Salon Questions Answered – Nails by Uma',
    description:
      'Find answers to common questions about Nails by Uma nail salon: booking, services, pricing, cancellation policy, home service, payment, and more. Get help instantly.',
    keywords:
      'nail salon FAQ, nail salon questions, book nail appointment, home nail service, gel nails FAQ, nail art questions, cancellation policy nail salon, nail salon pricing',
    canonicalPath: '/faq',
  });

  // ── BreadcrumbList JSON-LD — Home > FAQ ──────────────────────────
  useBreadcrumbSchema();

  const faqs: FAQ[] = [
    {
      category: 'Booking & Appointments',
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment through our website by clicking the "Book Now" button, or call us at +91 63765 39366. We also accept instant bookings via WhatsApp.',
    },
    {
      category: 'Booking & Appointments',
      question: 'Can I book a home service?',
      answer: 'Yes! We offer home service for most of our treatments. Additional charges apply based on distance. You can select "Home Service" when booking online.',
    },
    {
      category: 'Booking & Appointments',
      question: 'What is your cancellation policy?',
      answer: 'You can cancel or reschedule up to 24 hours before your appointment. For cancellations within 24 hours, advance payment may not be refunded.',
    },
    {
      category: 'Booking & Appointments',
      question: 'Do I need to pay advance?',
      answer: 'Yes, we require 50% advance payment to confirm your booking. The remaining amount can be paid after service completion.',
    },
    {
      category: 'Services & Pricing',
      question: 'What services do you offer?',
      answer: 'We offer a wide range of services including manicures, pedicures, nail extensions, nail art, gel polish, mehndi, facials, waxing, hair styling, and bridal makeup packages.',
    },
    {
      category: 'Services & Pricing',
      question: 'How long does a manicure/pedicure take?',
      answer: 'A basic manicure takes 45-60 minutes, while a pedicure takes 60-75 minutes. Premium services may take longer depending on the treatment.',
    },
    {
      category: 'Services & Pricing',
      question: 'Do you offer bridal packages?',
      answer: 'Yes! We have special bridal packages that include pre-bridal treatments, bridal makeup, nail art, and mehndi. Contact us for detailed pricing and customization.',
    },
    {
      category: 'Services & Pricing',
      question: 'Are your products safe and hygienic?',
      answer: 'Absolutely! We use only premium, certified products and maintain strict hygiene standards. All tools are sanitized after each use.',
    },
    {
      category: 'Payment & Offers',
      question: 'What payment methods do you accept?',
      answer: 'We accept UPI (Google Pay / PhonePe / Paytm), Credit/Debit Card, or Pay Cash at Salon / After Home Visit. For online advance payment, use UPI ID 6376539366@ybl and upload your payment screenshot.',
    },
    {
      category: 'Payment & Offers',
      question: 'Do you have any special offers?',
      answer: 'Yes! We regularly run special offers on combo packages and seasonal services. Follow us on social media or WhatsApp +91 63765 39366 for the latest offers.',
    },
    {
      category: 'General',
      question: 'What are your working hours?',
      answer: 'We are open Monday to Saturday from 10:00 AM to 8:00 PM, and Sundays from 11:00 AM to 6:00 PM.',
    },
    {
      category: 'General',
      question: 'Can I bring my own nail polish?',
      answer: 'Yes, you can bring your own nail polish. However, we have a wide collection of premium nail polishes and gel colors available.',
    },
    {
      category: 'General',
      question: 'Do you accept walk-in customers?',
      answer: 'Yes, we accept walk-ins based on availability. However, we recommend booking in advance to ensure your preferred time slot.',
    },
    {
      category: 'General',
      question: 'Are your staff certified?',
      answer: 'Yes, all our staff members are professionally trained and certified in their respective specializations. They undergo regular training to stay updated with latest trends.',
    },
  ];

  // ── Inject FAQPage JSON-LD schema ────────────────────────────────
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq-schema', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-faq-schema]').forEach((el) => el.remove());
    };
  // The error message "Definition for rule 'react-hooks/exhaustive-deps' was not found"
  // indicates an issue with the ESLint configuration, not a TypeScript syntax error.
  // The comment `// eslint-disable-next-line react-hooks/exhaustive-deps` is a valid way
  // to disable a specific ESLint rule for a line, assuming ESLint is correctly set up.
  // Since the request is to fix syntax errors, and this isn't one, the code itself is
  // syntactically correct TypeScript. No change is needed for this specific error in the code.
  }, [faqs]); // Added faqs to dependency array to satisfy exhaustive-deps if it were active.

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions about our services, booking, and policies
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQ List by Category */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryFAQs = filteredFAQs.filter(faq => faq.category === category);
            
            if (categoryFAQs.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 text-primary">{category}</h2>
                <div className="space-y-3">
                  {categoryFAQs.map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq);
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={globalIndex}
                        className="glass-card rounded-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-semibold pr-4">{faq.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">
              No questions found matching "{searchQuery}"
            </p>
            <p className="text-muted-foreground">
              Try searching with different keywords or{' '}
              <a href="/contact" className="text-primary hover:underline">
                contact us directly
              </a>
            </p>
          </div>
        )}

        {/* Still Have Questions CTA */}
        <div className="mt-16 glass-card p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our team is here to help!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all"
            >
              Contact Us
            </a>
            <a
              href="https://wa.me/916376539366"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
