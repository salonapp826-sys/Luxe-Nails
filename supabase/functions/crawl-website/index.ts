import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Your website URL (automatically detect from deployment)
    const websiteUrl = 'https://9b4h62.onspace.meme'; // Update this to your published URL

    const pages = [
      { name: 'Home', url: websiteUrl },
      { name: 'About', url: `${websiteUrl}#about` },
      { name: 'Services', url: `${websiteUrl}#services` },
      { name: 'Contact', url: `${websiteUrl}#contact` },
    ];

    console.log('🕷️ Starting website crawl...');

    for (const page of pages) {
      try {
        const response = await fetch(page.url);
        const html = await response.text();

        // Extract text content (simple extraction)
        const text = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Extract key information
        const content = extractKeyInfo(text, page.name);

        // Save to database
        const { error } = await supabase
          .from('website_knowledge')
          .upsert({
            page_name: page.name,
            content,
            last_crawled: new Date().toISOString(),
          }, {
            onConflict: 'page_name',
          });

        if (error) throw error;

        console.log(`✅ Crawled ${page.name}: ${content.length} characters`);

      } catch (error) {
        console.error(`❌ Error crawling ${page.name}:`, error);
      }
    }

    // Add manual service information as fallback
    const servicesInfo = `
BEAUTY SERVICES:
- Manicure: Professional nail care and polish application
- Pedicure: Foot care, nail trimming, polish
- Nail Extensions: Acrylic and gel nail extensions
- Nail Art: Custom designs, bridal nail art
- Gel Polish: Long-lasting gel nail polish
- French Manicure: Classic French tip design

BRIDAL SERVICES:
- Bridal Makeup: Full bridal makeup with HD finish
- Pre-bridal Services: Facials, cleanup, hair care
- Bridal Nail Art: Special designs for brides
- Mehndi: Traditional and modern mehndi designs

HAIR & BEAUTY:
- Hair Styling: Cuts, color, treatments
- Facials: Deep cleansing, anti-aging, brightening
- Waxing: Full body waxing services
- Threading: Eyebrow and facial threading

BOOKING INFO:
- Phone: +91 6376539366
- WhatsApp: +91 6376539366
- Home service available
- Advance booking required
- Walk-ins welcome (subject to availability)

LOCATION:
- City service available
- Home service charges apply based on distance
`;

    await supabase
      .from('website_knowledge')
      .upsert({
        page_name: 'Services Detail',
        content: servicesInfo,
        last_crawled: new Date().toISOString(),
      }, {
        onConflict: 'page_name',
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Website crawled successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error crawling website:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function extractKeyInfo(text: string, pageName: string): string {
  // Extract relevant sections based on page
  const maxLength = 2000;
  
  if (text.length <= maxLength) {
    return text;
  }

  // Try to extract key information
  const keywords = [
    'service', 'price', 'booking', 'contact', 'about', 'nail', 'beauty',
    'manicure', 'pedicure', 'facial', 'bridal', 'makeup', 'hair',
  ];

  const sentences = text.split(/[.!?]\s+/);
  const relevantSentences = sentences.filter(sentence => 
    keywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );

  let extracted = relevantSentences.join('. ');
  
  if (extracted.length > maxLength) {
    extracted = extracted.substring(0, maxLength) + '...';
  }

  return extracted || text.substring(0, maxLength) + '...';
}
