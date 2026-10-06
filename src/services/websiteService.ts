import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface WebsiteRecord {
  id: string;
  owner_id: string;
  site_name: string;
  business_name: string;
  slug: string;
  subdomain?: string;
  published: boolean;
  created_at?: string;
}

export const websiteService = {
  /**
   * Query existing website(s) owned by this user
   */
  async getWebsitesByOwner(ownerId: string): Promise<{ data: WebsiteRecord[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('owner_id', ownerId);

      if (error) throw error;
      return { data: (data as WebsiteRecord[]) || [], error: null };
    } catch (err: any) {
      console.warn('Could not fetch websites for owner:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Get single website for user
   */
  async getPrimaryWebsite(ownerId: string): Promise<WebsiteRecord | null> {
    const { data } = await this.getWebsitesByOwner(ownerId);
    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  },

  /**
   * Ensure user has a website:
   * - If website already exists, returns it without creating a duplicate.
   * - If no website exists, creates one and upgrades user's profile role to 'shop_owner'.
   */
  async ensureUserWebsite(user: User, profile?: any): Promise<{ website: WebsiteRecord; created: boolean }> {
    if (!user || !user.id) {
      throw new Error('User is not authenticated');
    }

    // 1. Check if user already owns a website
    const existing = await this.getPrimaryWebsite(user.id);
    if (existing) {
      // Ensure user profile role is shop_owner
      try {
        await supabase
          .from('profiles')
          .update({ role: 'shop_owner' })
          .eq('id', user.id);
      } catch (e) {
        console.warn('Could not sync profile role:', e);
      }

      return { website: existing, created: false };
    }

    // 2. Generate clean slug and business name
    const rawName =
      profile?.full_name ||
      (user as any).user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'My Studio';

    let baseSlug = rawName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'studio';
    if (baseSlug.length < 3) baseSlug = `studio${baseSlug}`;

    // Prevent slug collision
    let cleanSlug = baseSlug;
    try {
      const { data: slugMatch } = await supabase
        .from('websites')
        .select('id')
        .eq('slug', baseSlug)
        .maybeSingle();

      if (slugMatch) {
        cleanSlug = `${baseSlug}${Math.floor(100 + Math.random() * 900)}`;
      }
    } catch {
      // continue with cleanSlug
    }

    const businessName = `${rawName} Salon`;

    // 3. Create Website Record
    const newWebsite: WebsiteRecord = {
      id: cleanSlug,
      owner_id: user.id,
      site_name: rawName,
      business_name: businessName,
      slug: cleanSlug,
      subdomain: cleanSlug,
      published: true,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('websites').insert({
        id: cleanSlug,
        owner_id: user.id,
        site_name: rawName,
        business_name: businessName,
        slug: cleanSlug,
        subdomain: cleanSlug,
        published: true,
      });
    } catch (e) {
      console.warn('Website insert warning:', e);
    }

    // 4. Create Tenant Record
    try {
      await supabase.from('tenants').insert({
        id: cleanSlug,
        business_name: businessName,
        tagline: 'Luxury Salon Studio & Custom Embellishments',
        address: 'Sector 5, Mansarovar, Jaipur, Rajasthan 302020',
        phone: profile?.phone || '+91 99999 99999',
        whatsapp: profile?.phone || '+919999999999',
        email: user.email || '',
        logo_url: '',
        banner_image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1920&h=800&fit=crop&q=85',
        facebook_url: '',
        instagram_url: '',
        about_heading: `Welcome to ${businessName}`,
        about_text: 'Crafting bespoke beauty and luxury styling experiences.',
        about_image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1000&fit=crop&q=80',
        timings: 'Monday - Sunday: 10:00 AM - 8:00 PM',
        seo_title: `${businessName} | Luxury Salon & Studio`,
        seo_description: `Book appointments at ${businessName}.`,
        seo_keywords: 'salon, beauty, booking, nails',
        theme_color: 'pink',
        is_published: true,
      });
    } catch (e) {
      console.warn('Tenant insert warning:', e);
    }

    // 5. Update user role in profiles table to 'shop_owner'
    try {
      await supabase
        .from('profiles')
        .update({ role: 'shop_owner' })
        .eq('id', user.id);
    } catch (e) {
      console.warn('Could not upgrade role to shop_owner:', e);
    }

    // 6. Seed initial services
    try {
      const defaultServices = [
        {
          name: 'Classic Gel Manicure',
          category: 'basic',
          description: 'Cuticle trimming, shaping, and application of high gloss long wear gel polish.',
          price_inr: 599,
          duration_minutes: 45,
          image_url: 'https://images.unsplash.com/photo-1610992015762-45dca7464f11?w=800&h=600&fit=crop&q=80',
          is_active: true,
          is_premium: false,
          home_service_allowed: true,
          tenant_id: cleanSlug,
          website_id: cleanSlug,
        },
        {
          name: 'Luxury Acrylic Extensions',
          category: 'extensions',
          description: 'Bespoke full set acrylic length extensions with beautiful gel polish overlay.',
          price_inr: 1499,
          duration_minutes: 90,
          image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80',
          is_active: true,
          is_premium: true,
          home_service_allowed: true,
          tenant_id: cleanSlug,
          website_id: cleanSlug,
        },
      ];
      await supabase.from('services').insert(defaultServices);
    } catch (e) {
      console.warn('Could not seed services:', e);
    }

    return { website: newWebsite, created: true };
  },
};
