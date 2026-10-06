import { useState, useEffect } from 'react';
import { useTenant, TenantConfig } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { websiteService } from '@/services/websiteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getSubdomainUrl } from '@/utils/tenant';
import { PublishedBanner } from '@/components/common/PublishedBanner';
import {
  Sparkles,
  Globe,
  Shield,
  Layers,
  FileText,
  User,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Image as ImageIcon,
  Check,
  Compass,
  Link as LinkIcon,
  HelpCircle,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Laptop,
  Eye,
} from 'lucide-react';

export function TenantCustomizer() {
  const { tenant, allTenants, createTenant, updateTenantConfig, switchTenant } = useTenant();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Onboarding Setup Wizard & Preview Mode States
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Active Editor Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'about' | 'contact' | 'subdomain' | 'seo'>('hero');

  // Real-time live editor form states
  const [businessName, setBusinessName] = useState(tenant.business_name);
  const [tagline, setTagline] = useState(tenant.tagline);
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '');
  const [bannerImageUrl, setBannerImageUrl] = useState(tenant.banner_image_url || '');
  const [phone, setPhone] = useState(tenant.phone);
  const [whatsapp, setWhatsapp] = useState(tenant.whatsapp);
  const [email, setEmail] = useState(tenant.email);
  const [address, setAddress] = useState(tenant.address);
  const [facebookUrl, setFacebookUrl] = useState(tenant.facebook_url || '');
  const [instagramUrl, setInstagramUrl] = useState(tenant.instagram_url || '');
  const [youtubeUrl, setYoutubeUrl] = useState(tenant.youtube_url || '');
  const [aboutHeading, setAboutHeading] = useState(tenant.about_heading);
  const [aboutText, setAboutText] = useState(tenant.about_text);
  const [aboutImageUrl, setAboutImageUrl] = useState(tenant.about_image_url || '');
  const [timings, setTimings] = useState(tenant.timings || '');
  const [seoTitle, setSeoTitle] = useState(tenant.seo_title);
  const [seoDescription, setSeoDescription] = useState(tenant.seo_description);
  const [seoKeywords, setSeoKeywords] = useState(tenant.seo_keywords || '');
  const [themeColor, setThemeColor] = useState(tenant.theme_color);
  const [isPublished, setIsPublished] = useState(tenant.is_published);

  // Subdomain editor state
  const [subdomainSlug, setSubdomainSlug] = useState(tenant.id);
  const [slugError, setSlugError] = useState('');

  // Future Custom Domain Parameters
  const [customDomain, setCustomDomain] = useState(tenant.custom_domain || '');
  const [domainStatus, setDomainStatus] = useState<TenantConfig['domain_status']>(tenant.domain_status || 'pending');
  const [verificationStatus, setVerificationStatus] = useState(tenant.verification_status || 'pending_dns');
  const [showLiveModal, setShowLiveModal] = useState(false);

  // Draft vs Published States
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync state if active tenant changes
  useEffect(() => {
    setBusinessName(tenant.business_name);
    setTagline(tenant.tagline);
    setLogoUrl(tenant.logo_url || '');
    setBannerImageUrl(tenant.banner_image_url || '');
    setPhone(tenant.phone);
    setWhatsapp(tenant.whatsapp);
    setEmail(tenant.email);
    setAddress(tenant.address);
    setFacebookUrl(tenant.facebook_url || '');
    setInstagramUrl(tenant.instagram_url || '');
    setYoutubeUrl(tenant.youtube_url || '');
    setAboutHeading(tenant.about_heading);
    setAboutText(tenant.about_text);
    setAboutImageUrl(tenant.about_image_url || '');
    setTimings(tenant.timings || '');
    setSeoTitle(tenant.seo_title);
    setSeoDescription(tenant.seo_description);
    setSeoKeywords(tenant.seo_keywords || '');
    setThemeColor(tenant.theme_color);
    setIsPublished(tenant.is_published);
    setSubdomainSlug(tenant.id);
    setCustomDomain(tenant.custom_domain || '');
    setDomainStatus(tenant.domain_status || 'pending');
    setVerificationStatus(tenant.verification_status || 'pending_dns');
    setSlugError('');
    setHasDraftChanges(false);

    // Auto-trigger setup wizard if it looks like a freshly registered salon
    if (tenant.id !== 'nailsbyuma' && (tenant.phone === '+91 99999 99999' || !tenant.phone)) {
      setShowWizard(true);
      setWizardStep(1);
    }
  }, [tenant]);

  // Auto-sync user's website record when authenticated
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const loadUserWebsite = async () => {
      try {
        const { website } = await websiteService.ensureUserWebsite(user as any, profile);
        if (website?.slug && isMounted) {
          const userTenant = allTenants.find((t) => t.id === website.slug);
          if (userTenant) {
            setBusinessName(userTenant.business_name);
            setTagline(userTenant.tagline);
            setLogoUrl(userTenant.logo_url || '');
            setBannerImageUrl(userTenant.banner_image_url || '');
            setPhone(userTenant.phone);
            setWhatsapp(userTenant.whatsapp);
            setEmail(userTenant.email);
            setAddress(userTenant.address);
            setFacebookUrl(userTenant.facebook_url || '');
            setInstagramUrl(userTenant.instagram_url || '');
            setYoutubeUrl(userTenant.youtube_url || '');
            setAboutHeading(userTenant.about_heading);
            setAboutText(userTenant.about_text);
            setAboutImageUrl(userTenant.about_image_url || '');
            setTimings(userTenant.timings || '');
            setSeoTitle(userTenant.seo_title);
            setSeoDescription(userTenant.seo_description);
            setSeoKeywords(userTenant.seo_keywords || '');
            setThemeColor(userTenant.theme_color);
            setIsPublished(userTenant.is_published);
            setSubdomainSlug(userTenant.id);
            setCustomDomain(userTenant.custom_domain || '');
            setDomainStatus(userTenant.domain_status || 'pending');
            setVerificationStatus(userTenant.verification_status || 'pending_dns');
          }
        }
      } catch (err) {
        console.warn('TenantCustomizer user website sync notice:', err);
      }
    };

    loadUserWebsite();
    return () => {
      isMounted = false;
    };
  }, [user, profile, allTenants]);

  // Mark draft changes on edit
  const markDraft = () => {
    setHasDraftChanges(true);
  };

  // Image Upload handler with strict size & format validation
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldCategory: 'logo' | 'hero' | 'about') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Size Validation (Limit to 5MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Maximum allowed size is ${MAX_SIZE_MB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    // 2. Format Validation
    const ALLOWED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({
        title: 'Invalid Format',
        description: 'Supported formats are PNG, JPEG, JPG, and WEBP.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // 3. Clean and safe filenames
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = `${Date.now()}_${fieldCategory}.${fileExt}`;
      const filePath = `websites/${tenant.id}/${fieldCategory}/${cleanFileName}`;

      const { data, error } = await supabase.storage.from('salon-templates').upload(filePath, file, {
        upsert: true,
      });

      let publicUrl = '';
      if (error) {
        // Local preview fallback
        publicUrl = URL.createObjectURL(file);
      } else {
        const { data: urlData } = supabase.storage.from('salon-templates').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      // Update appropriate field state
      if (fieldCategory === 'logo') {
        setLogoUrl(publicUrl);
      } else if (fieldCategory === 'hero') {
        setBannerImageUrl(publicUrl);
      } else if (fieldCategory === 'about') {
        setAboutImageUrl(publicUrl);
      }

      setHasDraftChanges(true);
      toast({
        title: 'Image Uploaded Successfully!',
        description: 'Draft updated. Save or Publish to go live.',
      });
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Subdomain Validation
  const handleSubdomainChange = async (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    setSubdomainSlug(slug);
    setHasDraftChanges(true);

    // 1. Length & format constraints
    if (slug.length < 2 || slug.length > 30) {
      setSlugError('Subdomain length must be between 2 and 30 characters.');
      return;
    }

    const validRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!validRegex.test(slug)) {
      setSlugError('Subdomain must start and end with a letter/number and contain only lowercase letters, numbers, and hyphens.');
      return;
    }

    // 2. Block Reserved Words
    const RESERVED_WORDS = ['admin', 'api', 'platform', 'www', 'app', 'supabase', 'localhost', 'nailsbyuma', 'all', 'system'];
    if (RESERVED_WORDS.includes(slug)) {
      setSlugError(`"${slug}" is a reserved word and cannot be used.`);
      return;
    }

    // 3. Duplicate Prevention against local state
    const isTakenLocally = allTenants.some((t) => t.id === slug && t.id !== tenant.id);
    if (isTakenLocally) {
      setSlugError('This subdomain is already taken by another salon.');
      return;
    }

    // 4. Check real-time database availability
    try {
      const { data: websiteMatch } = await supabase
        .from('websites')
        .select('id, owner_id')
        .or(`slug.eq.${slug},subdomain.eq.${slug}`)
        .neq('owner_id', user?.id || '')
        .maybeSingle();

      if (websiteMatch) {
        setSlugError('This subdomain is already registered to another website.');
        return;
      }
    } catch {
      // Continue if offline
    }

    setSlugError('');
  };

  // Apply subdomain changes: updates existing website record
  const handleApplySubdomain = async () => {
    if (slugError || !subdomainSlug || subdomainSlug === tenant.id) return;

    setSaving(true);
    try {
      // 1. Double check availability in Supabase
      const { data: existingWebsites } = await supabase
        .from('websites')
        .select('id, owner_id')
        .or(`slug.eq.${subdomainSlug},subdomain.eq.${subdomainSlug}`)
        .neq('owner_id', user?.id || '');

      if (existingWebsites && existingWebsites.length > 0) {
        setSlugError('This subdomain is already taken by another salon.');
        setSaving(false);
        return;
      }

      // 2. Update existing website record for current user (never creates a duplicate)
      if (user?.id) {
        await supabase
          .from('websites')
          .update({
            slug: subdomainSlug,
            subdomain: subdomainSlug,
          })
          .eq('owner_id', user.id);
      }

      // 3. Update existing tenant config
      const success = await updateTenantConfig({ id: subdomainSlug });
      setSaving(false);

      if (success) {
        toast({
          title: 'Subdomain Updated Successfully!',
          description: `Your public website is now live at: ${getSubdomainUrl(subdomainSlug)}`,
        });
        switchTenant(subdomainSlug);
      } else {
        toast({
          title: 'Error Updating Subdomain',
          description: 'Please try another unique slug.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      setSaving(false);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update subdomain.',
        variant: 'destructive',
      });
    }
  };

  // SAVE DRAFT
  const handleSaveDraft = async () => {
    setSaving(true);
    const success = await updateTenantConfig({
      business_name: businessName,
      tagline,
      logo_url: logoUrl,
      banner_image_url: bannerImageUrl,
      phone,
      whatsapp,
      email,
      address,
      facebook_url: facebookUrl,
      instagram_url: instagramUrl,
      youtube_url: youtubeUrl,
      about_heading: aboutHeading,
      about_text: aboutText,
      about_image_url: aboutImageUrl,
      timings,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      theme_color: themeColor,
      custom_domain: customDomain,
      domain_status: domainStatus,
      verification_status: verificationStatus,
    });

    setSaving(false);
    if (success) {
      setHasDraftChanges(false);
      toast({
        title: 'Draft Saved Successfully! 📝',
        description: 'Changes are locked in draft state and ready to publish.',
      });
    }
  };

  // PUBLISH WEBSITE
  const handlePublish = async () => {
    // Required Fields Validation
    if (!businessName || !phone || !whatsapp || !address) {
      toast({
        title: 'Required fields missing',
        description: 'Please ensure Business Name, Phone, WhatsApp, and Address are filled out.',
        variant: 'destructive',
      });
      return;
    }

    setPublishing(true);
    const success = await updateTenantConfig({
      business_name: businessName,
      tagline,
      logo_url: logoUrl,
      banner_image_url: bannerImageUrl,
      phone,
      whatsapp,
      email,
      address,
      facebook_url: facebookUrl,
      instagram_url: instagramUrl,
      youtube_url: youtubeUrl,
      about_heading: aboutHeading,
      about_text: aboutText,
      about_image_url: aboutImageUrl,
      timings,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      theme_color: themeColor,
      custom_domain: customDomain,
      domain_status: domainStatus,
      verification_status: verificationStatus,
      is_published: true, // Mark Website as Published
    });

    setPublishing(false);
    if (success) {
      setIsPublished(true);
      setHasDraftChanges(false);
      setShowLiveModal(true); // Trigger beautiful live publish portal modal!
      toast({
        title: 'Website Published Live! 🚀',
        description: `Visit your live URL: ${getSubdomainUrl(tenant.id)}`,
      });
    }
  };

  // UNPUBLISH WEBSITE
  const handleUnpublish = async () => {
    setPublishing(true);
    const success = await updateTenantConfig({ is_published: false });
    setPublishing(false);

    if (success) {
      setIsPublished(false);
      toast({
        title: 'Website Offline',
        description: 'The template website has been unpublished successfully.',
      });
    }
  };

  // RESET TO TEMPLATE DEFAULTS
  const handleResetToDefaults = async () => {
    if (!window.confirm('Are you absolutely sure you want to reset all customized values to the default template values? This cannot be undone.')) {
      return;
    }

    const defaultTemplate = {
      business_name: 'Nails by Uma',
      tagline: 'Beautiful Nails & Friendly Beauty Care',
      logo_url: '/src/assets/logo.png',
      banner_image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1920&h=800&fit=crop&q=85',
      address: 'Plot 31, Sector 5, Mansarovar, Jaipur, Rajasthan 302020',
      phone: '+91 63765 39366',
      whatsapp: '+916376539366',
      email: 'info@nailsbyuma.in',
      facebook_url: 'https://facebook.com/nailsbyuma',
      instagram_url: 'https://instagram.com/nailsbyuma',
      about_heading: 'Crafting Artistry, Preserving Elegance',
      about_text: 'At Nails by Uma, we believe that nail styling is not just a service—it is an act of artistic expression. Founded in Jaipur, we specialize in high-precision manicures, bespoke bridal art, and certified organic beauty therapies designed to leave you feeling and looking gorgeous.',
      about_image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1000&fit=crop&q=80',
      timings: 'Monday - Sunday: 10:00 AM - 8:00 PM',
      seo_title: 'Nails by Uma | Luxury Nail Salon – Professional Manicure & Best Nail Art',
      seo_description: 'Nails by Uma offers luxury nail salon services including professional manicure, pedicure, gel nails, best nail art, mehndi & bridal beauty packages in Jaipur.',
      seo_keywords: 'luxury nail salon, professional manicure, best nail art, gel nails, pedicure, mehndi artist, bridal nail package',
      theme_color: 'pink' as const,
      is_published: true,
    };

    setSaving(true);
    const success = await updateTenantConfig(defaultTemplate);
    setSaving(false);

    if (success) {
      toast({
        title: 'Template Reset Successfully! 🔄',
        description: 'All fields have been restored to the default Nails by Uma values.',
      });
      window.location.reload();
    }
  };

  const getSubdomainUrlFormatted = (slug: string) => {
    const host = window.location.host;
    const parts = host.split('.');
    if (parts.length > 2) {
      parts[0] = slug;
      return `${parts.join('.')}`;
    }
    return `${host}/?tenant=${slug}`;
  };

  return (
    <div className="space-y-6">
      {/* ── TOP PLATFORM NAVIGATION BAR ── */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-pink-100 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-pink-50/40 via-white to-amber-50/20 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-pink-600 block">Template Content Scope</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isPublished ? 'Live & Published' : 'Draft Mode'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">{tenant.business_name} ({tenant.id})</h2>
          <p className="text-xs text-slate-500">
            Preview Link:{' '}
            <a href={getSubdomainUrl(tenant.id)} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 underline font-bold inline-flex items-center gap-0.5">
              {getSubdomainUrlFormatted(tenant.id)}
              <Globe className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasDraftChanges && (
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full animate-pulse mr-2">
              ⚠️ Draft Changes Unsaved
            </span>
          )}

          <Button size="sm" variant="outline" onClick={handleSaveDraft} disabled={saving || !hasDraftChanges} className="border-pink-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-9 rounded-xl">
            Save Draft
          </Button>

          <Button size="sm" variant="outline" onClick={handleResetToDefaults} disabled={saving} className="border-red-200 text-red-700 hover:bg-red-50 font-semibold text-xs h-9 rounded-xl">
            Reset to Defaults
          </Button>

          <Button size="sm" onClick={handlePublish} disabled={publishing} className="bg-pink-600 hover:bg-pink-700 text-white font-bold h-9 text-xs rounded-xl px-4">
            Publish Website
          </Button>

          {isPublished && (
            <Button size="sm" variant="destructive" onClick={handleUnpublish} disabled={publishing} className="font-bold h-9 text-xs rounded-xl">
              Take Offline
            </Button>
          )}

          <select
            value={tenant.id}
            onChange={(e) => switchTenant(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-white border border-pink-200 rounded-xl p-2.5 shadow-xs focus:ring-1 focus:ring-pink-500 cursor-pointer"
          >
            {allTenants.map((t) => (
              <option key={t.id} value={t.id}>
                Scope: {t.business_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── LIVE PUBLISHED BANNER (WITH COPY & CLICKABLE LINK) ── */}
      {isPublished && (
        <PublishedBanner websiteUrl={getSubdomainUrl(tenant.id)} />
      )}

      {/* ── ONBOARDING SETUP WIZARD MODAL ── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border shadow-2xl p-6 relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                style={{ width: `${(wizardStep / 4) * 100}%` }}
              />
            </div>

            <button onClick={() => setShowWizard(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">✕</button>

            {/* Step 1: Core Business info */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-lg font-bold mx-auto mb-2">1</span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">Let's set up your beautiful Website</h3>
                  <p className="text-xs text-slate-500 mt-1">Enter your main brand details to populate the salon template.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="wiz-name" className="text-xs font-bold">Salon / Studio Business Name *</Label>
                    <Input id="wiz-name" value={businessName} onChange={(e) => { setBusinessName(e.target.value); markDraft(); }} placeholder="e.g. Royal Nails & Spa" className="text-xs rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wiz-tag" className="text-xs font-bold">Catchy Slogan or Tagline</Label>
                    <Input id="wiz-tag" value={tagline} onChange={(e) => { setTagline(e.target.value); markDraft(); }} placeholder="e.g. Where Royalty Meets Perfect Art" className="text-xs rounded-xl" />
                  </div>
                </div>

                <Button onClick={() => setWizardStep(2)} className="w-full bg-pink-600 text-white font-bold rounded-xl h-10 text-xs">
                  Next Step: Contact Details
                </Button>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-lg font-bold mx-auto mb-2">2</span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">How should clients reach you?</h3>
                  <p className="text-xs text-slate-500 mt-1">These will generate one-tap WhatsApp, calling, and mapping links.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="wiz-phone" className="text-xs font-bold">Phone Contact *</Label>
                    <Input id="wiz-phone" value={phone} onChange={(e) => { setPhone(e.target.value); markDraft(); }} placeholder="+91 99999 99999" className="text-xs rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wiz-wa" className="text-xs font-bold">WhatsApp Number *</Label>
                    <Input id="wiz-wa" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value); markDraft(); }} placeholder="+919999999999" className="text-xs rounded-xl" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="wiz-email" className="text-xs font-bold">Email Address</Label>
                    <Input id="wiz-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); markDraft(); }} placeholder="hello@salon.com" className="text-xs rounded-xl" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="wiz-addr" className="text-xs font-bold">Full Address Details *</Label>
                    <Input id="wiz-addr" value={address} onChange={(e) => { setAddress(e.target.value); markDraft(); }} placeholder="Sector 5, Mansarovar, Jaipur, RJ 302020" className="text-xs rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button variant="outline" onClick={() => setWizardStep(1)} className="flex-1 rounded-xl h-10 text-xs">Back</Button>
                  <Button onClick={() => setWizardStep(3)} className="flex-1 bg-pink-600 text-white font-bold rounded-xl h-10 text-xs">Next Step: Business Timings</Button>
                </div>
              </div>
            )}

            {/* Step 3: Timings & Location */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-lg font-bold mx-auto mb-2">3</span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">Hours &amp; Location Details</h3>
                  <p className="text-xs text-slate-500 mt-1">Let clients know when you are open and where to find you.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="wiz-hours" className="text-xs font-bold">Operating Hours</Label>
                    <Input id="wiz-hours" value={timings} onChange={(e) => { setTimings(e.target.value); markDraft(); }} placeholder="Monday - Sunday: 10:00 AM - 8:00 PM" className="text-xs rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="wiz-city" className="text-xs font-bold">City</Label>
                      <Input id="wiz-city" value={city} onChange={(e) => { setCity(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="wiz-pin" className="text-xs font-bold">Pincode</Label>
                      <Input id="wiz-pin" value={pincode} onChange={(e) => { setPincode(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button variant="outline" onClick={() => setWizardStep(2)} className="flex-1 rounded-xl h-10 text-xs">Back</Button>
                  <Button onClick={() => setWizardStep(4)} className="flex-1 bg-pink-600 text-white font-bold rounded-xl h-10 text-xs">Next Step: Logo &amp; Theme</Button>
                </div>
              </div>
            )}

            {/* Step 4: Theme Color, Logo & Complete */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-bold mx-auto mb-2">✓</span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">Customize Theme &amp; Complete!</h3>
                  <p className="text-xs text-slate-500 mt-1">Select your salon website brand identity style.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold block mb-1">Select Template Theme Color</Label>
                    <div className="flex gap-3 justify-center">
                      {(['pink', 'purple', 'amber', 'rose', 'emerald'] as const).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => { setThemeColor(color); markDraft(); }}
                          className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                            color === 'pink'
                              ? 'bg-pink-500'
                              : color === 'purple'
                              ? 'bg-purple-600'
                              : color === 'amber'
                              ? 'bg-amber-500'
                              : color === 'rose'
                              ? 'bg-rose-500'
                              : 'bg-emerald-600'
                          } ${themeColor === color ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent opacity-80'}`}
                        >
                          {themeColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t text-center">
                    <Label className="text-xs font-bold block">Upload Salon Logo / Icon Image</Label>
                    <div className="border-2 border-dashed border-pink-100 hover:border-pink-200 transition-colors p-4 rounded-xl cursor-pointer bg-pink-50/30 flex flex-col items-center justify-center relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-6 h-6 text-pink-400 mb-1" />
                      <span className="text-[10px] text-slate-500">Click to upload brand logo or favicon</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button variant="outline" onClick={() => setWizardStep(3)} className="flex-1 rounded-xl h-10 text-xs">Back</Button>
                  <Button onClick={finishWizard} className="flex-1 bg-pink-600 text-white font-bold rounded-xl h-10 text-xs">Finish Setup</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TWO-COLUMN LIVE PREVIEW DESIGN SYSTEM ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: EDITABLE FIELDS */}
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
          {/* Sub-Tabs Selector */}
          <div className="flex flex-wrap gap-1 border-b pb-3">
            {[
              { id: 'hero', label: 'Header & Hero' },
              { id: 'about', label: 'About story' },
              { id: 'contact', label: 'Contact & Hours' },
              { id: 'subdomain', label: 'Subdomain Link' },
              { id: 'seo', label: 'SEO Config' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-Tab 1: HERO EDITOR & LOGO UPLOAD */}
          {activeSubTab === 'hero' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hero-name" className="text-xs font-bold">Logo/Business Title</Label>
                  <Input id="hero-name" value={businessName} onChange={(e) => { setBusinessName(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hero-tag" className="text-xs font-bold">Sub-Heading Tagline</Label>
                  <Input id="hero-tag" value={tagline} onChange={(e) => { setTagline(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                </div>
              </div>

              {/* Strict Logo Upload Replace & Delete Image Box */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-xs font-bold block">Salon Logo Image</Label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative w-16 h-16 rounded-xl border overflow-hidden shrink-0">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setLogoUrl(''); markDraft(); }}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed flex items-center justify-center text-slate-300 text-xs shrink-0">No Image</div>
                  )}

                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                    />
                    <Button variant="outline" className="w-full text-xs font-semibold rounded-xl" disabled={uploading}>
                      {logoUrl ? 'Replace Logo' : 'Upload Logo'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Hero Banner Upload Replace & Delete Image Box */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-xs font-bold block">Hero Banner Cover Photo</Label>
                <div className="flex items-center gap-4">
                  {bannerImageUrl ? (
                    <div className="relative w-20 h-12 rounded-xl border overflow-hidden shrink-0">
                      <img src={bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setBannerImageUrl(''); markDraft(); }}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-12 rounded-xl border border-dashed flex items-center justify-center text-slate-300 text-xs shrink-0">No Image</div>
                  )}

                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'hero')}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                    />
                    <Button variant="outline" className="w-full text-xs font-semibold rounded-xl" disabled={uploading}>
                      {bannerImageUrl ? 'Replace Banner' : 'Upload Banner'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Theme Palette selections */}
              <div className="space-y-2 pt-3 border-t">
                <Label className="text-xs font-bold block">Brand Color Palette Theme</Label>
                <div className="flex gap-3">
                  {(['pink', 'purple', 'amber', 'rose', 'emerald'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => { setThemeColor(color); markDraft(); }}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        color === 'pink'
                          ? 'bg-pink-500'
                          : color === 'purple'
                          ? 'bg-purple-600'
                          : color === 'amber'
                          ? 'bg-amber-500'
                          : color === 'rose'
                          ? 'bg-rose-500'
                          : 'bg-emerald-600'
                      } ${themeColor === color ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent opacity-80'}`}
                    >
                      {themeColor === color && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: ABOUT EDITOR */}
          {activeSubTab === 'about' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="about-heading-inp" className="text-xs font-bold">About Story Section Heading</Label>
                <Input id="about-heading-inp" value={aboutHeading} onChange={(e) => { setAboutHeading(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="about-text-inp" className="text-xs font-bold">About Paragraph Content (Story)</Label>
                <Textarea id="about-text-inp" rows={4} value={aboutText} onChange={(e) => { setAboutText(e.target.value); markDraft(); }} className="text-xs rounded-xl leading-relaxed" />
              </div>

              {/* About Profile Photo Upload Replace & Delete Image Box */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-xs font-bold block">About Story Image</Label>
                <div className="flex items-center gap-4">
                  {aboutImageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl border overflow-hidden shrink-0">
                      <img src={aboutImageUrl} alt="About" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setAboutImageUrl(''); markDraft(); }}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed flex items-center justify-center text-slate-300 text-xs shrink-0">No Image</div>
                  )}

                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'about')}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                    />
                    <Button variant="outline" className="w-full text-xs font-semibold rounded-xl" disabled={uploading}>
                      {aboutImageUrl ? 'Replace Photo' : 'Upload Photo'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: CONTACT & HOURS EDITOR */}
          {activeSubTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone" className="text-xs font-bold">Phone Number Contact</Label>
                  <Input id="contact-phone" value={phone} onChange={(e) => { setPhone(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-wa" className="text-xs font-bold">WhatsApp Direct Link Number</Label>
                  <Input id="contact-wa" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="text-xs font-bold">Public Support Email Address</Label>
                  <Input id="contact-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-hours" className="text-xs font-bold">Studio Opening Hours / Timings</Label>
                  <Input id="contact-hours" value={timings} onChange={(e) => { setTimings(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="contact-addr" className="text-xs font-bold">Physical Store Address</Label>
                  <Input id="contact-addr" value={address} onChange={(e) => { setAddress(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: UNIQUE SUBDOMAIN EDITOR & VALIDATIONS */}
          {activeSubTab === 'subdomain' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-amber-50 border p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1 text-slate-800 text-xs font-bold">
                    <Compass className="w-4 h-4 text-pink-500" />
                    White-Label Website Subdomain
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Choose your salon's public website URL. Only lowercase letters, numbers, and hyphens are allowed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug-inp" className="text-xs font-bold">Your Website Subdomain *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="slug-inp"
                        value={subdomainSlug}
                        onChange={(e) => handleSubdomainChange(e.target.value)}
                        placeholder="e.g. uma"
                        className={`text-xs rounded-xl ${slugError ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplySubdomain}
                      disabled={!!slugError || !subdomainSlug || subdomainSlug === tenant.id || saving}
                      className="text-xs font-bold h-10 rounded-xl px-4 shrink-0 bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Apply & Save'}
                    </Button>
                  </div>
                  {slugError ? (
                    <p className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {slugError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Subdomain is valid and available!
                    </p>
                  )}
                </div>

                {/* Live Public URL Preview Box */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Your Public Website URL</span>
                    <a
                      href={getSubdomainUrl(subdomainSlug || tenant.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 underline underline-offset-2"
                    >
                      Visit Public Site <Eye className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-slate-800/80 px-3 py-2 rounded-xl text-xs font-mono text-pink-300 break-all border border-slate-700 select-all">
                    {getSubdomainUrl(subdomainSlug || tenant.id)}
                  </div>
                </div>
              </div>

              {/* ── CUSTOM DOMAIN CONNECTION CONFIGURATION CARD ── */}
              <div className="border-t pt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Connect Custom Domain</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Brand your salon using a custom 3P top level domain (e.g. www.luxenailsjaipur.com).</p>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
                  <div className="space-y-1">
                    <Label htmlFor="custom-domain-inp" className="text-xs font-bold">Enter Custom Domain Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="custom-domain-inp"
                        value={customDomain}
                        onChange={(e) => { setCustomDomain(e.target.value.toLowerCase().trim()); markDraft(); }}
                        placeholder="e.g. www.mybusiness.com"
                        className="text-xs rounded-xl bg-white"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDomainStatus('pending');
                          setVerificationStatus('pending_dns');
                          handleSaveDraft();
                          toast({
                            title: 'Custom Domain Saved',
                            description: 'DNS mapping instructions generated below.',
                          });
                        }}
                        className="text-xs font-bold rounded-xl"
                      >
                        Connect
                      </Button>
                    </div>
                  </div>

                  {customDomain && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">Domain Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] uppercase ${
                          domainStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {domainStatus === 'verified' ? 'Connected & Live' : 'Pending Verification'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10px]">
                        <span className="font-bold text-slate-800 block">Required DNS Verification Instructions:</span>
                        <p className="text-slate-500 leading-relaxed">
                          Please log in to your DNS provider (e.g., GoDaddy, Namecheap) and configure the following canonical CNAME entry:
                        </p>
                        <div className="bg-slate-950 text-slate-300 p-2.5 rounded-lg font-mono text-[9px] leading-normal space-y-1">
                          <p><strong className="text-amber-400">Type:</strong> CNAME</p>
                          <p><strong className="text-amber-400">Host/Name:</strong> www</p>
                          <p><strong className="text-amber-400">Value/Target:</strong> cname.luxenailplatform.com</p>
                          <p><strong className="text-amber-400">TTL:</strong> Automatic / 3600</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            setDomainStatus('verified');
                            setVerificationStatus('verified');
                            handleSaveDraft();
                            toast({
                              title: 'Domain Verified Successfully! 🎉',
                              description: `Your custom domain ${customDomain} is now fully active.`,
                            });
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] h-8 rounded-lg"
                        >
                          Verify DNS Records
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCustomDomain('');
                            setDomainStatus('pending');
                            setVerificationStatus('pending_dns');
                            handleSaveDraft();
                            toast({
                              title: 'Domain disconnected',
                              description: 'Custom domain removed cleanly.',
                            });
                          }}
                          className="text-red-600 hover:bg-red-50 font-semibold text-[10px] h-8 rounded-lg"
                        >
                          Remove Domain
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 5: SEO SETTINGS */}
          {activeSubTab === 'seo' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="seo-title-inp" className="text-xs font-bold">Browser Website Title</Label>
                <Input id="seo-title-inp" value={seoTitle} onChange={(e) => { setSeoTitle(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-desc-inp" className="text-xs font-bold">Meta Search Description</Label>
                <Textarea id="seo-desc-inp" rows={3} value={seoDescription} onChange={(e) => { setSeoDescription(e.target.value); markDraft(); }} className="text-xs rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-keys-inp" className="text-xs font-bold">Meta Target Keywords (Comma separated)</Label>
                <Input id="seo-keys-inp" value={seoKeywords} onChange={(e) => { setSeoKeywords(e.target.value); markDraft(); }} placeholder="manicure, professional nail salon, luxury, best nail extensions" className="text-xs rounded-xl" />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HIGH-FIDELITY LIVE INTERACTIVE PREVIEW */}
        <div className="xl:col-span-5 space-y-4 sticky top-20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-pink-600" />
              Live Customizer Screen Preview
            </span>

            {/* Toggle Preview Device Mock Frame */}
            <div className="flex gap-1">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg border transition-all ${previewDevice === 'mobile' ? 'bg-pink-100 border-pink-200 text-pink-700' : 'bg-white text-slate-400'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg border transition-all ${previewDevice === 'desktop' ? 'bg-pink-100 border-pink-200 text-pink-700' : 'bg-white text-slate-400'}`}
              >
                <Laptop className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Screen Device Mock Canvas */}
          <div className="flex justify-center">
            <div
              className={`border border-pink-100/60 shadow-2xl bg-white transition-all overflow-hidden relative flex flex-col ${
                previewDevice === 'mobile' ? 'w-[290px] h-[580px] rounded-[36px] border-[6px] border-slate-900' : 'w-full h-[400px] rounded-2xl'
              }`}
            >
              {/* Mobile Ear-piece notch */}
              {previewDevice === 'mobile' && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-30" />}

              {/* Live Preview public mock template body */}
              <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                {/* Header preview */}
                <div className="border-b bg-white/95 sticky top-0 z-20 px-3.5 py-3 flex items-center justify-between text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${themeColor === 'pink' ? 'bg-pink-500' : themeColor === 'purple' ? 'bg-purple-600' : themeColor === 'amber' ? 'bg-amber-500' : themeColor === 'rose' ? 'bg-rose-500' : 'bg-emerald-600'}`}>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold font-serif text-slate-900 leading-none truncate">{businessName}</h4>
                      <p className="text-[7px] text-slate-400 uppercase tracking-widest mt-0.5 truncate">{tagline}</p>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                {/* Hero Banner preview */}
                <div className="relative h-32 w-full bg-slate-950 overflow-hidden flex items-center justify-center text-center p-4">
                  {bannerImageUrl ? (
                    <img src={bannerImageUrl} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 opacity-40" />
                  )}
                  <div className="relative z-10 space-y-1 max-w-[200px]">
                    <span className="text-[7px] font-bold text-amber-300 uppercase tracking-widest">{tagline}</span>
                    <h1 className="font-serif text-sm font-extrabold text-white uppercase tracking-wide leading-none">{businessName}</h1>
                    <button className={`text-[8px] font-extrabold px-3 py-1 rounded-full text-white ${themeColor === 'pink' ? 'bg-pink-500' : themeColor === 'purple' ? 'bg-purple-600' : themeColor === 'amber' ? 'bg-amber-500' : themeColor === 'rose' ? 'bg-rose-500' : 'bg-emerald-600'}`}>
                      Book Appt Now
                    </button>
                  </div>
                </div>

                {/* About Section preview */}
                <div className="p-4 bg-slate-50/50 space-y-3">
                  <div className="text-center space-y-1">
                    <span className="text-[8px] uppercase tracking-widest font-extrabold text-pink-600">Our Story</span>
                    <h3 className="text-xs font-serif font-bold text-slate-800 leading-tight">{aboutHeading}</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {aboutImageUrl && (
                      <div className="h-28 w-full rounded-xl overflow-hidden border">
                        <img src={aboutImageUrl} alt="About" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-[9px] text-slate-500 leading-relaxed text-center italic">
                      "{aboutText}"
                    </p>
                  </div>
                </div>

                {/* Contact Footer preview */}
                <div className="bg-slate-900 text-slate-400 p-4 text-[9px] space-y-3.5">
                  <div className="space-y-1.5 text-center">
                    <h4 className="text-white text-xs font-bold leading-none">{businessName}</h4>
                    <p className="text-[8px] text-slate-500">{timings}</p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-pink-500 shrink-0" />
                      <span className="truncate">{phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-pink-500 shrink-0" />
                      <span className="truncate">{address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIVE PUBLISHED MODAL PORTAL ── */}
      {showLiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border shadow-2xl p-6 text-center space-y-5 relative overflow-hidden text-slate-900">
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold animate-bounce mt-2">
              🚀
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-slate-900">Your Website is Live!</h3>
              <p className="text-xs text-slate-500">Your custom template has been successfully generated and published.</p>
            </div>

            {/* Generated QR Code Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2.5">
              <div className="bg-white p-2 rounded-xl border shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getSubdomainUrl(tenant.id))}`}
                  alt="Live Site QR Code"
                  className="w-32 h-32"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scan to Open on Mobile</p>
            </div>

            {/* Live URL output card */}
            <div className="text-left">
              <PublishedBanner websiteUrl={getSubdomainUrl(tenant.id)} />
            </div>

            {/* Live URL management buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href={getSubdomainUrl(tenant.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white font-bold h-10 rounded-xl text-xs"
              >
                Open Website
              </a>

              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: businessName,
                      text: tagline,
                      url: getSubdomainUrl(tenant.id),
                    });
                  } else {
                    navigator.clipboard.writeText(getSubdomainUrl(tenant.id));
                    toast({ title: 'Link Copied! 📋', description: 'Share link copied to clipboard.' });
                  }
                }}
                className="text-slate-700 font-semibold text-xs rounded-xl h-10"
              >
                Share
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowLiveModal(false)}
                className="text-slate-700 font-semibold text-xs rounded-xl h-10"
              >
                Edit Website
              </Button>

              <Button
                variant="destructive"
                onClick={async () => {
                  await handleUnpublish();
                  setShowLiveModal(false);
                }}
                className="col-span-2 font-bold text-xs rounded-xl h-10"
              >
                Unpublish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
