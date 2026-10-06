import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  Sparkles,
  Tag,
  Clock,
  IndianRupee,
  Upload,
  Calendar,
  Percent,
  Lightbulb,
  Check,
  X,
  Image as ImageIcon,
  Gift,
  Wand2,
} from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';

export interface SalonPackage {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  price: number;
  original_price?: number;
  festival_offer?: string;
  discount_percent?: number;
  valid_from?: string;
  valid_until?: string;
  duration?: string;
  category?: string;
  badge?: string;
  popular?: boolean;
  image_url?: string;
  home_service?: boolean;
  is_active?: boolean;
  included_services?: string[];
  created_at?: string;
}

const PACKAGE_TEMPLATES = [
  {
    name: 'Royal Rajasthani Bridal Package',
    tagline: 'Complete head-to-toe makeover with 3D nail extensions & organic Sojat Mehndi',
    price: 4999,
    original_price: 7499,
    festival_offer: 'Wedding Season Discount',
    duration: '4.5 Hours',
    category: 'bridal',
    badge: 'Royal Bridal',
    image_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80',
    included_services: [
      'Full Gel Extensions with 3D Stone Art',
      'Organic Bridal Mehndi (Arms & Feet)',
      '24K Gold Glow Facial',
      'Rose Petal Foot Spa',
    ],
    description:
      'Full royal bridal treatment with custom 3D stone nail art, 100% natural organic Sojat henna, glowing 24K gold facial massage and rose petal foot spa.',
  },
  {
    name: 'Karwa Chauth Glow Combo',
    tagline: 'Festive nail extensions, dark stain mehndi & instant facial glow',
    price: 2999,
    original_price: 4499,
    festival_offer: 'Karwa Chauth Special',
    duration: '3.0 Hours',
    category: 'signature',
    badge: 'Festive Deal',
    image_url: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
    included_services: [
      'Shiny UV Gel Overlay',
      'Festive Hand Mehndi',
      'Hydra Facial Clean-up',
      'Aroma Foot Spa',
    ],
    description:
      'Get festive-ready with high-shine gel polish, intricate hand henna, hydra facial clean-up and a relaxing aroma foot massage.',
  },
  {
    name: 'Festive Hair Spa & Keratin Deal',
    tagline: 'Silk-smooth hair, deep protein nourishment & scalp rejuvenation',
    price: 3499,
    original_price: 5499,
    festival_offer: 'Festive Hair Sale',
    duration: '2.5 Hours',
    category: 'beauty',
    badge: '40% OFF',
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80',
    included_services: [
      'Keratin Hair Treatment',
      'Deep Moisture Hair Spa',
      'Scalp Reflexology Massage',
      'Blowdry & Styling',
    ],
    description:
      'Transform frizzy, dull hair into silky smooth locks with our premium keratin protein treatment, deep moisturizing spa, and scalp massage.',
  },
  {
    name: 'Diwali Party Prep Pack',
    tagline: 'Express beauty makeover: Chrome nails, 24K gold glow & threading',
    price: 1999,
    original_price: 2999,
    festival_offer: 'Diwali Special Offer',
    duration: '2.0 Hours',
    category: 'signature',
    badge: 'Diwali Bestseller',
    image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop&q=80',
    included_services: [
      'Mirror Chrome Gel Polish',
      'Instant Gold Clean-up',
      'Eyebrow Threading & Upper Lip',
      'Pedicure Polish',
    ],
    description:
      'Quick party prep combo for a radiant festive glow with mirror chrome nails, 24K instant gold facial clean-up, and threading.',
  },
  {
    name: 'Summer Hydration Glow Kit',
    tagline: 'Cooling cucumber pedicure, anti-tan facial & gel manicure duo',
    price: 1799,
    original_price: 2499,
    festival_offer: 'Summer Glow Sale',
    duration: '2.0 Hours',
    category: 'spa',
    badge: 'Cooling Combo',
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop&q=80',
    included_services: [
      'Cooling Cucumber Foot Spa',
      'Anti-Tan D-Tan Facial',
      'Gel Nail Polish Overlay',
    ],
    description:
      'Refresh and soothe sun-exposed skin with cooling cucumber foot bath, anti-tan facial pack, and glossy gel manicure.',
  },
];

const PRESET_GALLERY_IMAGES = [
  { label: 'Bridal Henna & Nails', url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80' },
  { label: 'Gel Nails & Art', url: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80' },
  { label: 'Salon Studio & Spa', url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop&q=80' },
  { label: 'Facial & Skin Care', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=80' },
  { label: 'Hair Spa Care', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80' },
  { label: 'Relaxing Foot Spa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop&q=80' },
];

const AVAILABLE_SERVICE_SUGGESTIONS = [
  'Gel Extensions with 3D Stone Art',
  'Russian E-File Manicure',
  'Organic Bridal Mehndi (Arms & Feet)',
  '24K Gold Glow Facial',
  'Rose Petal Foot Spa',
  'UV Gel Nail Polish Overlay',
  'Jelly Foot Spa Pedicure',
  'Mirror Chrome / Stone Art',
  'Hot Stone Leg & Foot Massage',
  'Keratin Hair Treatment',
  'Deep Moisture Hair Spa',
  'Anti-Tan D-Tan Clean-up',
  'Cooling Cucumber Foot Spa',
  'Eyebrow & Upper Lip Threading',
  'French Tip Gel Nails',
];

export function PackagesManagementSection() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<SalonPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SalonPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1999);
  const [originalPrice, setOriginalPrice] = useState<number>(2499);
  const [festivalOffer, setFestivalOffer] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [duration, setDuration] = useState('2.5 Hours');
  const [category, setCategory] = useState('bridal');
  const [badge, setBadge] = useState('');
  const [popular, setPopular] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [homeService, setHomeService] = useState(true);
  const [includedServices, setIncludedServices] = useState<string[]>([]);
  const [newCustomService, setNewCustomService] = useState('');
  const [showTaglineIdeas, setShowTaglineIdeas] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('salon_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.warn('Fallback packages list used', error);
      }
      setPackages(
        data || [
          {
            id: 'bridal-glow-package',
            name: 'Royal Rajasthani Bridal Package',
            tagline: 'Complete head-to-toe makeover with 3D nail extensions & organic Sojat Mehndi',
            description:
              'Full royal bridal treatment with custom 3D stone nail art, 100% natural organic Sojat henna, glowing 24K gold facial massage and rose petal foot spa.',
            price: 4999,
            original_price: 7499,
            festival_offer: 'Wedding Season Discount',
            discount_percent: 33,
            valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration: '4.5 Hours',
            category: 'bridal',
            badge: 'Royal Bridal',
            popular: true,
            image_url:
              'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80',
            home_service: true,
            is_active: true,
            included_services: [
              'Full Gel Extensions with 3D Stone Art',
              'Organic Bridal Mehndi (Arms & Feet)',
              '24K Gold Glow Facial',
              'Rose Petal Foot Spa',
            ],
          },
          {
            id: 'karwa-chauth-combo',
            name: 'Karwa Chauth Glow Combo',
            tagline: 'Festive nail extensions, dark stain mehndi & instant facial glow',
            description:
              'Get festive-ready with high-shine gel polish, intricate hand henna, hydra facial clean-up and a relaxing aroma foot massage.',
            price: 2999,
            original_price: 4499,
            festival_offer: 'Festive Special Offer',
            discount_percent: 33,
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration: '3.0 Hours',
            category: 'signature',
            badge: 'Bestseller',
            popular: true,
            image_url:
              'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
            home_service: true,
            is_active: true,
            included_services: [
              'Shiny UV Gel Overlay',
              'Festive Hand Mehndi',
              'Hydra Facial Clean-up',
              'Aroma Foot Spa',
            ],
          },
        ]
      );
    } catch (err) {
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg?: SalonPackage) => {
    setShowTaglineIdeas(false);
    if (pkg) {
      setEditingPackage(pkg);
      setName(pkg.name);
      setTagline(pkg.tagline || '');
      setDescription(pkg.description || '');
      setPrice(pkg.price);
      setOriginalPrice(pkg.original_price || pkg.price);
      setFestivalOffer(pkg.festival_offer || '');
      const calcDiscount =
        pkg.discount_percent ||
        (pkg.original_price && pkg.original_price > pkg.price
          ? Math.round(((pkg.original_price - pkg.price) / pkg.original_price) * 100)
          : 0);
      setDiscountPercent(calcDiscount);
      setValidFrom(pkg.valid_from || '');
      setValidUntil(pkg.valid_until || '');
      setDuration(pkg.duration || '2.0 Hours');
      setCategory(pkg.category || 'signature');
      setBadge(pkg.badge || '');
      setPopular(!!pkg.popular);
      setImageUrl(pkg.image_url || '');
      setHomeService(pkg.home_service !== false);
      setIncludedServices(pkg.included_services || []);
    } else {
      setEditingPackage(null);
      setName('');
      setTagline('');
      setDescription('');
      setPrice(1999);
      setOriginalPrice(2499);
      setFestivalOffer('Diwali Special Offer');
      setDiscountPercent(20);
      setValidFrom('');
      setValidUntil(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setDuration('2.0 Hours');
      setCategory('signature');
      setBadge('Festive Offer');
      setPopular(false);
      setImageUrl('https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80');
      setHomeService(true);
      setIncludedServices(['Gel Polish Overlay', 'Jelly Foot Spa', 'Nail Art']);
    }
    setIsModalOpen(true);
  };

  const applyTemplate = (tpl: typeof PACKAGE_TEMPLATES[0]) => {
    setName(tpl.name);
    setTagline(tpl.tagline);
    setDescription(tpl.description);
    setPrice(tpl.price);
    setOriginalPrice(tpl.original_price);
    setFestivalOffer(tpl.festival_offer);
    const disc = Math.round(((tpl.original_price - tpl.price) / tpl.original_price) * 100);
    setDiscountPercent(disc);
    setDuration(tpl.duration);
    setCategory(tpl.category);
    setBadge(tpl.badge);
    setImageUrl(tpl.image_url);
    setIncludedServices(tpl.included_services);
    toast({
      title: 'Template Applied',
      description: `Loaded preset template "${tpl.name}".`,
    });
  };

  const handlePriceChange = (newPrice: number, newOrigPrice?: number) => {
    const p = newPrice;
    const orig = newOrigPrice !== undefined ? newOrigPrice : originalPrice;
    setPrice(p);
    if (newOrigPrice !== undefined) setOriginalPrice(orig);

    if (orig > 0 && orig >= p) {
      const calc = Math.round(((orig - p) / orig) * 100);
      setDiscountPercent(calc);
    }
  };

  const handleDiscountChange = (disc: number) => {
    setDiscountPercent(disc);
    if (originalPrice > 0) {
      const calculatedPrice = Math.round(originalPrice * (1 - disc / 100));
      setPrice(calculatedPrice);
    }
  };

  const generateTaglineIdeas = (packageName: string) => {
    const lower = packageName.toLowerCase();
    if (lower.includes('bridal') || lower.includes('wedding') || lower.includes('royal')) {
      return [
        'Complete head-to-toe makeover with 3D nail extensions & organic Sojat Mehndi',
        'Royal bridal pampering with Swarovski stones, gold facial & rose foot spa',
        'Look picture-perfect on your big day with our signature bridal beauty glow',
      ];
    }
    if (
      lower.includes('diwali') ||
      lower.includes('festive') ||
      lower.includes('karwa') ||
      lower.includes('holi') ||
      lower.includes('party')
    ) {
      return [
        'Get festive-ready glow with top hair, gel nail & skin care treatments',
        'Shine bright this festive season with our exclusive unmissable combo offer',
        'Festive glam deal: Mirror chrome nails, instant gold facial & organic henna',
      ];
    }
    if (lower.includes('hair') || lower.includes('keratin') || lower.includes('spa')) {
      return [
        'Silk-smooth hair, intense protein nourishment & scalp rejuvenation',
        'Revitalize damaged locks with deep moisturizing hair spa & keratin shine',
        'Salon-finish luxury hair & scalp treatment at unmissable festive prices',
      ];
    }
    return [
      'Save big on our most requested luxury salon & spa services',
      'The ultimate beauty pampering package designed for an instant glow',
      'Professional salon care delivered with 100% sanitized perfection',
    ];
  };

  const taglineIdeas = generateTaglineIdeas(name || 'Combo Package');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please choose an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      toast({
        title: 'Image Uploaded',
        description: 'Custom package cover image attached successfully!',
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleServiceInclusion = (serviceName: string) => {
    if (includedServices.includes(serviceName)) {
      setIncludedServices((prev) => prev.filter((s) => s !== serviceName));
    } else {
      setIncludedServices((prev) => [...prev, serviceName]);
    }
  };

  const handleAddCustomService = () => {
    const trimmed = newCustomService.trim();
    if (!trimmed) return;
    if (!includedServices.includes(trimmed)) {
      setIncludedServices((prev) => [...prev, trimmed]);
    }
    setNewCustomService('');
  };

  const getValidityStatus = (validFromDate?: string, validUntilDate?: string) => {
    if (!validFromDate && !validUntilDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (validUntilDate) {
      const end = new Date(validUntilDate);
      end.setHours(23, 59, 59, 999);
      const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { text: 'Offer Expired', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      }
      if (diffDays === 0) {
        return { text: 'Limited Deal: Ends Today!', color: 'bg-amber-100 text-amber-800 border-amber-300 font-bold' };
      }
      if (diffDays <= 7) {
        return {
          text: `Limited Time Deal: Ends in ${diffDays} Days`,
          color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        };
      }
      return {
        text: `Active Offer (Valid till ${new Date(validUntilDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })})`,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
      };
    }

    if (validFromDate) {
      const start = new Date(validFromDate);
      if (start > now) {
        return {
          text: `Starts on ${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
          color: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      }
    }

    return { text: 'Active Festival Offer', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold' };
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast({
        title: 'Validation Error',
        description: 'Package name and price are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const payload = {
      name,
      tagline,
      description,
      price: Number(price),
      original_price: Number(originalPrice),
      festival_offer: festivalOffer,
      discount_percent: Number(discountPercent),
      valid_from: validFrom,
      valid_until: validUntil,
      duration,
      category,
      badge: badge || (discountPercent > 0 ? `${discountPercent}% OFF` : ''),
      popular,
      image_url:
        imageUrl || 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
      home_service: homeService,
      is_active: true,
      included_services: includedServices,
    };

    try {
      if (editingPackage) {
        const { error } = await supabase
          .from('salon_packages')
          .update(payload)
          .eq('id', editingPackage.id);

        if (error) {
          setPackages((prev) =>
            prev.map((p) => (p.id === editingPackage.id ? { ...p, ...payload } : p))
          );
        } else {
          await fetchPackages();
        }
        toast({
          title: 'Festive Combo Package Updated!',
          description: `Successfully saved "${name}".`,
        });
      } else {
        const newId = `pkg-${Date.now()}`;
        const { error } = await supabase.from('salon_packages').insert([{ id: newId, ...payload }]);

        if (error) {
          setPackages((prev) => [{ id: newId, ...payload, created_at: new Date().toISOString() }, ...prev]);
        } else {
          await fetchPackages();
        }
        toast({
          title: 'Festive Combo Package Published Successfully!',
          description: `New package "${name}" with ${
            discountPercent > 0 ? `${discountPercent}% OFF` : 'special price'
          } is now live.`,
        });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving package:', err);
      toast({
        title: 'Save Failed',
        description: err.message || 'Could not save package',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (id: string, pkgName: string) => {
    if (!window.confirm(`Are you sure you want to delete package "${pkgName}"?`)) return;

    try {
      const { error } = await supabase.from('salon_packages').delete().eq('id', id);
      if (error) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
      } else {
        await fetchPackages();
      }
      toast({ title: 'Package Removed', description: `Deleted package "${pkgName}".` });
    } catch (err: any) {
      console.error('Delete error:', err);
      setPackages((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Package Removed', description: `Deleted package "${pkgName}".` });
    }
  };

  const savingsAmount = Math.max(0, originalPrice - price);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-amber-500/10 p-6 rounded-2xl border border-pink-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Package className="w-6 h-6 text-primary" />
            Special Package & Festive Combo Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create, edit, and schedule seasonal beauty deals, bridal combos, and festive discounts for Nails by Uma Jaipur.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="gap-2 bg-gradient-to-r from-primary to-accent font-bold shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Combo Package
        </Button>
      </div>

      {/* Package List Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-3 text-sm">Loading packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border p-8">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg">No Packages Listed</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your first special beauty combo deal</p>
          <Button onClick={() => handleOpenModal()}>Add Package</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {packages.map((pkg) => {
            const status = getValidityStatus(pkg.valid_from, pkg.valid_until);
            const savings = pkg.original_price && pkg.original_price > pkg.price ? pkg.original_price - pkg.price : 0;
            const discountPct =
              pkg.discount_percent ||
              (pkg.original_price && pkg.original_price > pkg.price
                ? Math.round(((pkg.original_price - pkg.price) / pkg.original_price) * 100)
                : 0);

            return (
              <div
                key={pkg.id}
                className="bg-card rounded-2xl border shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Badges Bar */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {pkg.festival_offer && (
                    <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Gift className="w-2.5 h-2.5" />
                      {pkg.festival_offer}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {discountPct}% OFF
                    </span>
                  )}
                  {pkg.badge && (
                    <span className="bg-pink-100 text-pink-700 border border-pink-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {pkg.badge}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-start gap-4 mb-3">
                    {pkg.image_url && (
                      <img
                        src={pkg.image_url}
                        alt={pkg.name}
                        className="w-20 h-20 rounded-xl object-cover border shrink-0 shadow-xs"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg text-foreground truncate">{pkg.name}</h3>
                      {pkg.tagline && (
                        <p className="text-xs text-primary font-semibold line-clamp-1 mt-0.5">{pkg.tagline}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-extrabold text-foreground text-sm">
                          <IndianRupee className="w-3.5 h-3.5 text-primary" />
                          {formatINR(pkg.price)}
                        </span>
                        {pkg.original_price && pkg.original_price > pkg.price && (
                          <span className="line-through text-muted-foreground/70 text-xs">
                            {formatINR(pkg.original_price)}
                          </span>
                        )}
                        {savings > 0 && (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            Save {formatINR(savings)}
                          </span>
                        )}
                        {pkg.duration && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-pink-600" />
                            {pkg.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {status && (
                    <div className="mb-3">
                      <span className={`inline-block text-[11px] px-2.5 py-1 rounded-lg border ${status.color}`}>
                        ⏳ {status.text}
                      </span>
                    </div>
                  )}

                  {pkg.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {pkg.description}
                    </p>
                  )}

                  {pkg.included_services && pkg.included_services.length > 0 && (
                    <div className="bg-pink-50/50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 border border-pink-100/60">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Included Services ({pkg.included_services.length}):</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.included_services.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-white dark:bg-slate-700 text-foreground px-2 py-0.5 rounded-md text-[11px] font-medium border shadow-2xs"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t gap-2 mt-auto">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {pkg.home_service ? '🏡 Home & Salon' : '💈 Salon Only'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(pkg)}
                      className="h-8 text-xs gap-1.5 border-pink-200 hover:bg-pink-50"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-center justify-between pb-4 border-b border-pink-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {editingPackage ? 'Edit Festive Combo Package' : 'Create New Combo Package'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Design attractive beauty bundles with auto-calculated discounts and festival tags.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-6">
              {/* 1. PACKAGE TEMPLATES (PRESET AUTO-SUGGESTIONS) */}
              <div className="bg-gradient-to-r from-pink-50/80 via-rose-50/50 to-amber-50/80 p-4 rounded-2xl border border-pink-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700 uppercase tracking-wider mb-2">
                  <Wand2 className="w-3.5 h-3.5 text-pink-600" />
                  <span>Quick Preset Package Templates (Click to Auto-Fill)</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {PACKAGE_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl border border-pink-200 shadow-2xs hover:bg-pink-600 hover:text-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{tpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. BASIC DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="pkg-name" className="text-xs font-bold">
                    Package Name *
                  </Label>
                  <Input
                    id="pkg-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Rajasthani Bridal Package"
                    className="font-medium"
                    required
                  />
                </div>

                {/* Tagline with Smart AI Idea Generator */}
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pkg-tagline" className="text-xs font-bold">
                      Short Catchy Tagline
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowTaglineIdeas(!showTaglineIdeas)}
                      className="text-[11px] text-pink-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>{showTaglineIdeas ? 'Hide Tagline Ideas' : 'Generate Tagline Ideas'}</span>
                    </button>
                  </div>
                  <Input
                    id="pkg-tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Complete head-to-toe makeover with 3D nail extensions"
                  />

                  {/* 3 Tagline Ideas Popover / Cards */}
                  {showTaglineIdeas && (
                    <div className="p-3 bg-pink-50/80 rounded-2xl border border-pink-200 space-y-2 animate-in fade-in duration-200">
                      <p className="text-[11px] font-bold text-pink-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Pick a Tagline Idea for &ldquo;{name || 'Combo Package'}&rdquo;:
                      </p>
                      <div className="space-y-1.5">
                        {taglineIdeas.map((idea, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setTagline(idea);
                              setShowTaglineIdeas(false);
                              toast({ title: 'Tagline Applied', description: idea });
                            }}
                            className="w-full text-left p-2 rounded-xl bg-white text-slate-800 text-xs font-medium hover:bg-pink-600 hover:text-white transition-colors border border-pink-100 shadow-2xs flex items-center justify-between group cursor-pointer"
                          >
                            <span>&ldquo;{idea}&rdquo;</span>
                            <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-festival" className="text-xs font-bold">
                    Festival / Offer Name
                  </Label>
                  <Input
                    id="pkg-festival"
                    value={festivalOffer}
                    onChange={(e) => setFestivalOffer(e.target.value)}
                    placeholder="e.g. Diwali Special Offer / Karwa Chauth Deal"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pkg-badge" className="text-xs font-bold">
                    Badge Label
                  </Label>
                  <Input
                    id="pkg-badge"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Bestseller / Royal Bridal"
                  />
                </div>
              </div>

              {/* 3. PRICING, DISCOUNTS & AUTO SAVINGS */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    Pricing &amp; Festival Discount Calculation
                  </Label>
                  {savingsAmount > 0 && (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Save {discountPercent}% | ₹{formatINR(savingsAmount)} OFF
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="pkg-orig-price" className="text-[11px] font-semibold text-muted-foreground">
                      Regular Price (₹)
                    </Label>
                    <Input
                      id="pkg-orig-price"
                      type="number"
                      value={originalPrice}
                      onChange={(e) => handlePriceChange(price, Number(e.target.value))}
                      placeholder="2499"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="pkg-discount" className="text-[11px] font-semibold text-muted-foreground">
                      Discount (%)
                    </Label>
                    <Input
                      id="pkg-discount"
                      type="number"
                      min={0}
                      max={90}
                      value={discountPercent}
                      onChange={(e) => handleDiscountChange(Number(e.target.value))}
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pkg-price" className="text-[11px] font-bold text-pink-600">
                      Offer Price (₹) *
                    </Label>
                    <Input
                      id="pkg-price"
                      type="number"
                      value={price}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      className="font-bold text-pink-600 border-pink-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. OFFER TIME VALIDITY RANGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-pink-50/30 p-3.5 rounded-2xl border border-pink-100">
                <div className="space-y-1">
                  <Label htmlFor="pkg-valid-from" className="text-xs font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-pink-600" />
                    Offer Valid From
                  </Label>
                  <Input
                    id="pkg-valid-from"
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pkg-valid-until" className="text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-pink-600" />
                    Offer Valid Until
                  </Label>
                  <Input
                    id="pkg-valid-until"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>

                {getValidityStatus(validFrom, validUntil) && (
                  <div className="sm:col-span-2 pt-1">
                    <span
                      className={`text-xs px-3 py-1 rounded-lg border block text-center font-medium ${
                        getValidityStatus(validFrom, validUntil)?.color
                      }`}
                    >
                      Live Status: {getValidityStatus(validFrom, validUntil)?.text}
                    </span>
                  </div>
                )}
              </div>

              {/* 5. INCLUDED SERVICES MULTI-SELECT CHIPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">Included Services ({includedServices.length})</Label>
                  <span className="text-[11px] text-muted-foreground">Click chips to add/remove</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-2xl border space-y-2">
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {AVAILABLE_SERVICE_SUGGESTIONS.map((srv, idx) => {
                      const isSelected = includedServices.includes(srv);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleServiceInclusion(srv)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-pink-600 text-white border-pink-600 font-bold shadow-2xs'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 hover:bg-pink-50'
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                          <span>{srv}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Service Input Box */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Input
                      value={newCustomService}
                      onChange={(e) => setNewCustomService(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomService();
                        }
                      }}
                      placeholder="Add custom service (e.g. Swarovski Accent Art)..."
                      className="text-xs h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomService}
                      className="h-9 px-3 text-xs gap-1 font-bold shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* 6. COVER IMAGE UPLOAD & PRESET SELECTOR */}
              <div className="space-y-2">
                <Label className="text-xs font-bold flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  Package Cover Image
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Image Preview */}
                  <div className="sm:col-span-1">
                    {imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border h-24 bg-muted">
                        <img src={imageUrl} alt="Package Cover" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-24 rounded-2xl border border-dashed flex items-center justify-center text-xs text-muted-foreground bg-muted/20">
                        No image set
                      </div>
                    )}
                  </div>

                  {/* File Upload Button & URL Input */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold rounded-xl border border-pink-300 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Preset Photo Gallery Thumbnails */}
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-1.5">
                    Or select from preset salon gallery photos:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {PRESET_GALLERY_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(img.url);
                          toast({ title: 'Photo Selected', description: img.label });
                        }}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          imageUrl === img.url ? 'border-pink-600 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                        title={img.label}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7. DURATION, CATEGORY & OPTIONS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <Label htmlFor="pkg-duration" className="text-xs font-bold">
                    Est. Duration
                  </Label>
                  <Input
                    id="pkg-duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2.5 Hours"
                  />
                </div>

                <div>
                  <Label htmlFor="pkg-category" className="text-xs font-bold">
                    Category
                  </Label>
                  <select
                    id="pkg-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-xs rounded-xl border bg-background font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="signature">Signature Combo</option>
                    <option value="bridal">Bridal Package</option>
                    <option value="spa">Spa & Wellness</option>
                    <option value="beauty">Facial & Beauty</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={homeService}
                    onChange={(e) => setHomeService(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                  />
                  <span>Allow Home Service Delivery</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                  />
                  <span>Highlight as Popular Bestseller</span>
                </label>
              </div>

              {/* 8. FOOTER ACTIONS */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold px-6 shadow-md hover:scale-105 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {editingPackage ? 'Save Changes' : 'Publish Combo Package'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
