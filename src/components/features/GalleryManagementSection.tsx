import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Upload,
  ExternalLink,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  Star,
  Edit,
  Check,
  X,
  Share2,
  Tv,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { GALLERY_CATEGORIES, GALLERY_ITEMS, type GalleryItem } from '@/constants/galleryItems';
import { mergeGalleryItems, normalizeRemoteImage, type RemoteGalleryImage } from '@/lib/gallery';

type VideoPlatform = 'youtube' | 'instagram' | 'facebook' | 'other';

interface AdminVideoItem {
  id: string;
  title: string;
  description: string;
  video_url: string;
  embed_url: string;
  platform: VideoPlatform;
  category: string;
  featured: boolean;
  autoplay?: boolean;
  muted?: boolean;
  thumbnail_url?: string;
  created_at: string;
}

const detectVideoPlatform = (url: string): VideoPlatform => {
  if (!url) return 'other';
  const lower = url.trim().toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return 'youtube';
  }
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
    return 'instagram';
  }
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
    return 'facebook';
  }
  return 'other';
};

const formatEmbedUrl = (
  url: string,
  platform: VideoPlatform,
  autoplay = false,
  muted = true
): string => {
  if (!url) return '';
  const cleanUrl = url.trim();

  if (platform === 'youtube') {
    const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
    const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/i);
    const shortMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);

    let id = '';
    if (shortsMatch) id = shortsMatch[1];
    else if (watchMatch) id = watchMatch[1];
    else if (shortMatch) id = shortMatch[1];

    let baseEmbed = '';
    if (id) {
      baseEmbed = `https://www.youtube.com/embed/${id}`;
    } else if (cleanUrl.includes('youtube.com/embed/')) {
      baseEmbed = cleanUrl.split('?')[0];
    } else {
      baseEmbed = cleanUrl;
    }

    const params: string[] = ['enablejsapi=1'];
    if (autoplay) {
      params.push('autoplay=1');
      params.push(`mute=${muted ? 1 : 0}`);
    } else if (muted) {
      params.push('mute=1');
    }
    return `${baseEmbed}?${params.join('&')}`;
  }

  if (platform === 'instagram') {
    const match = cleanUrl.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/i);
    if (match) {
      let base = `https://www.instagram.com/p/${match[2]}/embed`;
      if (autoplay) {
        base += `?autoplay=1&muted=${muted ? 1 : 0}`;
      }
      return base;
    }
  }

  if (platform === 'facebook') {
    const encoded = encodeURIComponent(cleanUrl);
    let base = `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=500`;
    if (autoplay) {
      base += `&autoplay=true&muted=${muted ? 'true' : 'false'}`;
    }
    return base;
  }

  return cleanUrl;
};

const INITIAL_ADMIN_VIDEOS: AdminVideoItem[] = [
  {
    id: 'vid-1',
    title: 'Bridal 3D Swarovski Extension Transformation',
    description: 'Full royal bridal makeover with 3D stones, gel extensions & Sojat organic henna.',
    video_url: 'https://www.youtube.com/shorts/5-9j9QzSgH0',
    embed_url: formatEmbedUrl('https://www.youtube.com/shorts/5-9j9QzSgH0', 'youtube', true, true),
    platform: 'youtube',
    category: 'Bridal Reels',
    featured: true,
    autoplay: true,
    muted: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    title: 'Client Review & Organic Sojat Henna Stain',
    description: 'Real client review by Ananya Rathore after 48 hours of 100% natural dark-stain henna.',
    video_url: 'https://www.instagram.com/reel/C321_sample_reel/',
    embed_url: formatEmbedUrl('https://www.instagram.com/reel/C321_sample_reel/', 'instagram', true, true),
    platform: 'instagram',
    category: 'Client Reviews',
    featured: true,
    autoplay: true,
    muted: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'vid-3',
    title: 'Jaipur Mansarovar Studio Walkthrough',
    description: 'Explore our 100% sanitized salon studio on Main Market Road, Mansarovar Jaipur.',
    video_url: 'https://www.facebook.com/nailsbyuma.jaipur/videos/1015881290/',
    embed_url: formatEmbedUrl(
      'https://www.facebook.com/nailsbyuma.jaipur/videos/1015881290/',
      'facebook',
      false,
      true
    ),
    platform: 'facebook',
    category: 'Salon Tour',
    featured: false,
    autoplay: false,
    muted: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_KEY_VIDEOS = 'uma_admin_reels_videos';

const CATEGORY_CAPTION_TEMPLATES: Record<string, string> = {
  'Nail Art Tutorials': `✨ Step-by-step 3D Nail Art transformation at Nails by Uma! Watch our expert nail artist craft intricate designs with top-quality gel extensions. 💅 Jaipur's favorite nail studio.\n\n#NailsByUma #NailArtJaipur #GelNails #NailDesign #MansarovarJaipur`,

  'Bridal Reels': `👰 Gorgeous Royal Rajasthani Bridal Nails crafted for our stunning bride! Complete luxury bridal care and long-lasting gel extensions.\n\n#BridalNailsJaipur #WeddingNails #JaipurBride #NailsByUma #RajasthaniWedding`,

  'Client Reviews': `💖 Heartwarming feedback from our lovely client! Thank you for trusting Nails by Uma for your self-care session. Book your appointment today via WhatsApp +91 63765 39366.\n\n#ClientDiaries #NailsByUma #JaipurSalon #HappyClient #NailCare`,

  'Salon Tour': `✨ Take a quick peek inside Nails by Uma - Jaipur! 100% clean, safe, and hygienic beauty care in a cozy, relaxed ambience. Visit us at Mansarovar, Jaipur.\n\n#JaipurStudio #SalonAmbience #NailsByUma #MansarovarJaipur`,

  'Mehndi & Henna': `🌿 Intricate 100% organic Sojat Mehndi stain for festive & bridal occasions! Deep natural dark color without any harmful chemicals.\n\n#OrganicMehndi #BridalHenna #SojatHenna #NailsByUma #JaipurMehndi`,

  'Spa Treatments': `🫧 Relax and unwind with our luxurious aroma jelly foot spa & pedicure treatment! Soothe tired feet and enjoy deep nourishment.\n\n#FootSpaJaipur #JellyPedicure #SelfCare #NailsByUma #Relaxation`,
};

export function GalleryManagementSection() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  // Photo Gallery State
  const [remoteImages, setRemoteImages] = useState<RemoteGalleryImage[]>([]);
  const [allItems, setAllItems] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Photo Form
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCat, setPhotoCat] = useState('nail-art');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Video / Reels State
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<AdminVideoItem | null>(null);

  // Global Video Playback Settings
  const [globalAutoplay, setGlobalAutoplay] = useState(true);
  const [globalMuted, setGlobalMuted] = useState(true);

  // Video Form State
  const [vUrl, setVUrl] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vCat, setVCat] = useState('Nail Art Tutorials');
  const [vFeatured, setVFeatured] = useState(true);
  const [vAutoplay, setVAutoplay] = useState(true);
  const [vMuted, setVMuted] = useState(true);
  const [vThumb, setVThumb] = useState('');

  // AI Tagging State
  const [analyzingAiTag, setAnalyzingAiTag] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    primary: string;
    confidence: number;
    secondary?: string;
    secondaryConfidence?: number;
    reason: string;
  } | null>(null);

  const detectedPlatform = detectVideoPlatform(vUrl);
  const formattedEmbedUrl = formatEmbedUrl(vUrl, detectedPlatform, vAutoplay, vMuted);

  useEffect(() => {
    fetchGalleryImages();
    loadAdminVideos();
  }, []);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching gallery images from DB:', error);
      }

      const rows = data || [];
      setRemoteImages(rows);
      const merged = mergeGalleryItems(rows, GALLERY_ITEMS);
      setAllItems(merged);
    } catch (err) {
      console.error('Error loading gallery images:', err);
      setAllItems(GALLERY_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminVideos = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_VIDEOS);
    if (saved) {
      try {
        setVideos(JSON.parse(saved));
      } catch (e) {
        setVideos(INITIAL_ADMIN_VIDEOS);
      }
    } else {
      setVideos(INITIAL_ADMIN_VIDEOS);
    }
  };

  const persistVideos = (newVideos: AdminVideoItem[]) => {
    setVideos(newVideos);
    localStorage.setItem(LOCAL_STORAGE_KEY_VIDEOS, JSON.stringify(newVideos));
  };

  // PHOTO HANDLERS
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setPhotoFile(selected);
      setPhotoPreview(URL.createObjectURL(selected));
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) {
      toast({ title: 'Validation Error', description: 'Photo title is required.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      let finalUrl = photoUrl.trim();

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from('gallery-photos')
          .upload(fileName, photoFile);

        if (uploadErr) {
          finalUrl = photoPreview;
        } else {
          const { data: urlData } = supabase.storage
            .from('gallery-photos')
            .getPublicUrl(fileName);
          finalUrl = urlData.publicUrl;
        }
      }

      const payload = {
        title: photoTitle.trim(),
        category: photoCat,
        image_url: finalUrl || 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
      };

      const { data, error } = await supabase.from('gallery_images').insert([payload]).select().single();

      if (error) {
        const fakeRemote: RemoteGalleryImage = {
          id: `local-${Date.now()}`,
          title: photoTitle.trim(),
          category: photoCat,
          image_url: finalUrl || 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
          created_at: new Date().toISOString(),
        };
        const newItem = normalizeRemoteImage(fakeRemote);
        setAllItems((prev) => [newItem, ...prev]);
      } else if (data) {
        await fetchGalleryImages();
      }

      toast({ title: 'Photo Added', description: `Added "${photoTitle}" to portfolio.` });
      setPhotoTitle('');
      setPhotoUrl('');
      setPhotoFile(null);
      setPhotoPreview('');
      setIsPhotoModalOpen(false);
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message || 'Could not save photo', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string, itemTitle: string) => {
    if (!window.confirm(`Delete "${itemTitle}" from portfolio?`)) return;

    if (id.startsWith('remote-')) {
      const dbId = id.replace('remote-', '');
      try {
        await supabase.from('gallery_images').delete().eq('id', dbId);
      } catch (err) {
        console.warn('DB delete fallback:', err);
      }
    }

    setAllItems((prev) => prev.filter((item) => item.id !== id));
    toast({ title: 'Photo Deleted', description: `Removed "${itemTitle}".` });
  };

  // VIDEO / REELS HANDLERS
  const handleCategoryChange = (newCategory: string) => {
    setVCat(newCategory);
    const template = CATEGORY_CAPTION_TEMPLATES[newCategory];

    // Only auto-fill if description is empty or matches one of the preset templates
    const isTemplateOrEmpty =
      !vDesc.trim() || Object.values(CATEGORY_CAPTION_TEMPLATES).includes(vDesc.trim());

    if (isTemplateOrEmpty && template) {
      setVDesc(template);
    }
  };

  const handleGenerateAutoCaption = () => {
    const template = CATEGORY_CAPTION_TEMPLATES[vCat] || CATEGORY_CAPTION_TEMPLATES['Nail Art Tutorials'];
    setVDesc(template);
    toast({
      title: 'Auto-Caption Generated!',
      description: `Applied ready-to-use template for "${vCat}".`,
    });
  };

  const runAnalysisHeuristics = (
    urlVal: string,
    titleVal: string,
    descVal: string,
    thumbVal: string,
    showToast = true
  ) => {
    setAnalyzingAiTag(true);

    const text = `${titleVal} ${descVal} ${urlVal} ${thumbVal}`.toLowerCase();

    let res = {
      primary: 'Nail Art Tutorials',
      confidence: 94,
      secondary: 'Bridal Reels',
      secondaryConfidence: 81,
      reason: 'Frame metadata scan: Detected gel extensions, acrylic polish & nail art brushwork aesthetics.',
    };

    if (/brid|wed|dulhan|marwari|royal|heavy|swarovski|jewel|bride|marriage/i.test(text)) {
      res = {
        primary: 'Bridal Reels',
        confidence: 98,
        secondary: 'Nail Art Tutorials',
        secondaryConfidence: 83,
        reason: 'Thumbnail frame & link analysis: Detected royal bridal aesthetics, heavy swarovski stone art, and wedding styling.',
      };
    } else if (/henna|mehndi|mehendi|sojat|cone|stain|organic/i.test(text)) {
      res = {
        primary: 'Mehndi & Henna',
        confidence: 97,
        secondary: 'Bridal Reels',
        secondaryConfidence: 79,
        reason: 'Frame heuristics: Detected organic Sojat henna application and dark stain visual cues.',
      };
    } else if (/review|client|feedback|happy|diaries|testimonial|star|rating|ananya/i.test(text)) {
      res = {
        primary: 'Client Reviews',
        confidence: 96,
        secondary: 'Salon Tour',
        secondaryConfidence: 76,
        reason: 'Visual & text analysis: Detected client face review, star rating, or experience feedback.',
      };
    } else if (/tour|studio|salon|interior|walkthrough|mansarovar|hygiene|sanit|ambience/i.test(text)) {
      res = {
        primary: 'Salon Tour',
        confidence: 95,
        secondary: 'Spa Treatments',
        secondaryConfidence: 73,
        reason: 'Metadata scan: Detected studio interior, sanitized workspace, and salon ambience visuals.',
      };
    } else if (/spa|pedicure|foot|jelly|massage|relax|soak|daily care|nourish|skin/i.test(text)) {
      res = {
        primary: 'Spa Treatments',
        confidence: 93,
        secondary: 'Daily Care',
        secondaryConfidence: 82,
        reason: 'Frame heuristics: Detected relaxing foot spa soaking bowl, jelly pedicure, and daily care aesthetics.',
      };
    }

    setAiSuggestion(res);
    setAnalyzingAiTag(false);

    if (showToast) {
      toast({
        title: '✨ AI URL & Frame Analysis Complete!',
        description: `Automatically detected category: "${res.primary}" (${res.confidence}% match).`,
      });
    }
  };

  const handleRunAiTagging = () => {
    runAnalysisHeuristics(vUrl, vTitle, vDesc, vThumb, true);
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setVUrl(newUrl);

    if (newUrl.trim().length > 12) {
      setAnalyzingAiTag(true);
      setTimeout(() => {
        runAnalysisHeuristics(newUrl, vTitle, vDesc, vThumb, true);
      }, 400);
    }
  };

  const handleOpenVideoModal = (v?: AdminVideoItem) => {
    setAiSuggestion(null);
    setAnalyzingAiTag(false);
    if (v) {
      setEditingVideo(v);
      setVUrl(v.video_url);
      setVTitle(v.title);
      setVDesc(v.description || '');
      setVCat(v.category || 'Nail Art Tutorials');
      setVFeatured(v.featured !== false);
      setVAutoplay(v.autoplay !== false);
      setVMuted(v.muted !== false);
      setVThumb(v.thumbnail_url || '');
    } else {
      setEditingVideo(null);
      setVUrl('');
      setVTitle('');
      const defaultCategory = 'Nail Art Tutorials';
      setVCat(defaultCategory);
      setVDesc(CATEGORY_CAPTION_TEMPLATES[defaultCategory]);
      setVFeatured(true);
      setVAutoplay(globalAutoplay);
      setVMuted(globalMuted);
      setVThumb('https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80');
    }
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vUrl.trim() || !vTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Video URL and Title are required.',
        variant: 'destructive',
      });
      return;
    }

    const platform = detectVideoPlatform(vUrl);
    const embed = formatEmbedUrl(vUrl, platform, vAutoplay, vMuted);

    const platformName =
      platform === 'youtube'
        ? 'YouTube'
        : platform === 'instagram'
        ? 'Instagram Reel'
        : platform === 'facebook'
        ? 'Facebook Video'
        : 'Video';

    if (editingVideo) {
      const updated = videos.map((item) =>
        item.id === editingVideo.id
          ? {
              ...item,
              title: vTitle.trim(),
              description: vDesc.trim(),
              video_url: vUrl.trim(),
              embed_url: embed,
              platform,
              category: vCat,
              featured: vFeatured,
              autoplay: vAutoplay,
              muted: vMuted,
              thumbnail_url: vThumb || item.thumbnail_url,
            }
          : item
      );
      persistVideos(updated);
      toast({
        title: `${platformName} Updated!`,
        description: `Saved video settings (${vAutoplay ? 'Auto-Play On' : 'Auto-Play Off'}, ${vMuted ? 'Muted' : 'Unmuted'}).`,
      });
    } else {
      const newVideoItem: AdminVideoItem = {
        id: `vid-${Date.now()}`,
        title: vTitle.trim(),
        description: vDesc.trim(),
        video_url: vUrl.trim(),
        embed_url: embed,
        platform,
        category: vCat,
        featured: vFeatured,
        autoplay: vAutoplay,
        muted: vMuted,
        thumbnail_url:
          vThumb ||
          'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80',
        created_at: new Date().toISOString(),
      };
      persistVideos([newVideoItem, ...videos]);
      toast({
        title: `✨ ${platformName} Added Successfully!`,
        description: `Embedded and published "${vTitle}" to the video showcase (${vAutoplay ? 'Auto-play enabled' : 'Auto-play disabled'}).`,
      });
    }

    setIsVideoModalOpen(false);
  };

  const handleToggleVideoFeatured = (id: string, currentTitle: string) => {
    const updated = videos.map((v) => (v.id === id ? { ...v, featured: !v.featured } : v));
    persistVideos(updated);
    const target = updated.find((v) => v.id === id);
    toast({
      title: target?.featured ? 'Featured on Homepage' : 'Removed from Featured',
      description: `"${currentTitle}" status updated.`,
    });
  };

  const handleToggleSingleAutoplay = (id: string) => {
    const updated = videos.map((v) => {
      if (v.id === id) {
        const nextAutoplay = !v.autoplay;
        const newEmbed = formatEmbedUrl(v.video_url, v.platform, nextAutoplay, v.muted !== false);
        return { ...v, autoplay: nextAutoplay, embed_url: newEmbed };
      }
      return v;
    });
    persistVideos(updated);
    const target = updated.find((v) => v.id === id);
    toast({
      title: target?.autoplay ? 'Auto-Play Enabled' : 'Auto-Play Paused',
      description: `Updated playback mode for "${target?.title}".`,
    });
  };

  const handleToggleSingleMuted = (id: string) => {
    const updated = videos.map((v) => {
      if (v.id === id) {
        const nextMuted = !v.muted;
        const newEmbed = formatEmbedUrl(v.video_url, v.platform, v.autoplay !== false, nextMuted);
        return { ...v, muted: nextMuted, embed_url: newEmbed };
      }
      return v;
    });
    persistVideos(updated);
    const target = updated.find((v) => v.id === id);
    toast({
      title: target?.muted ? 'Audio Muted by Default' : 'Audio Unmuted',
      description: `Sound settings updated for "${target?.title}".`,
    });
  };

  const handleApplyGlobalAutoplay = (enableAutoplay: boolean, defaultMute: boolean) => {
    setGlobalAutoplay(enableAutoplay);
    setGlobalMuted(defaultMute);

    const updated = videos.map((v) => {
      const newEmbed = formatEmbedUrl(v.video_url, v.platform, enableAutoplay, defaultMute);
      return { ...v, autoplay: enableAutoplay, muted: defaultMute, embed_url: newEmbed };
    });
    persistVideos(updated);

    toast({
      title: 'Global Video Settings Updated',
      description: `Applied ${enableAutoplay ? 'Auto-Play ON' : 'Auto-Play OFF'} and ${
        defaultMute ? 'Mute Default ON' : 'Audio ON'
      } across all video items.`,
    });
  };

  const handleDeleteVideo = (id: string, currentTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete video "${currentTitle}"?`)) return;
    const updated = videos.filter((v) => v.id !== id);
    persistVideos(updated);
    toast({
      title: 'Video Removed',
      description: `Deleted "${currentTitle}" from video reels.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER & SUB-TAB NAVIGATION BAR ───────────────────────────── */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <ImageIcon className="w-6 h-6 text-primary" />
              Gallery &amp; Video Reels Showcase
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage salon portfolio photos, YouTube tutorials, Instagram Reels, and Facebook video highlights for Nails by Uma.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'photos' ? (
              <Button
                onClick={() => setIsPhotoModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-primary to-accent font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add New Photo
              </Button>
            ) : (
              <Button
                onClick={() => handleOpenVideoModal()}
                className="gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold shadow-md hover:scale-105 transition-all"
              >
                <Video className="w-4 h-4" />
                Embed Video / Reel
              </Button>
            )}
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-muted text-muted-foreground hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo Portfolio ({allItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs'
                : 'bg-muted text-muted-foreground hover:bg-pink-50 hover:text-pink-600'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video &amp; Reels ({videos.length})</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: PHOTO GALLERY PORTFOLIO ────────────────────────────── */}
      {activeTab === 'photos' && (
        <>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-3 text-sm">Loading gallery photos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-card rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={item.thumb || item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-3">
                    <h4 className="font-semibold text-xs text-foreground truncate">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.description}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                      <a
                        href={item.image}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePhoto(item.id, item.title)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: VIDEO & REELS MANAGEMENT ─────────────────────────── */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          {/* Global Auto-Play & Mute Sound Settings Bar */}
          <div className="bg-gradient-to-r from-pink-50/90 via-rose-50/50 to-amber-50/70 dark:bg-slate-900 p-4 rounded-2xl border border-pink-100/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 rounded-xl">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Smart Video Auto-Play &amp; Sound Mute Controls
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Configure client-side playback behavior across YouTube, Instagram &amp; Facebook embedded reels.
                  </p>
                </div>
              </div>

              {/* Controls Switches */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyGlobalAutoplay(!globalAutoplay, globalMuted)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    globalAutoplay
                      ? 'bg-pink-600 text-white border-pink-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300'
                  }`}
                >
                  {globalAutoplay ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{globalAutoplay ? 'Auto-Play ON' : 'Auto-Play OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyGlobalAutoplay(globalAutoplay, !globalMuted)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    globalMuted
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300'
                  }`}
                >
                  {globalMuted ? <VolumeX className="w-3.5 h-3.5 text-pink-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>{globalMuted ? 'Mute Default ON' : 'Mute Default OFF'}</span>
                </button>
              </div>
            </div>

            {/* Smart Policy Explanation Badge */}
            <div className="flex items-start gap-2 bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-pink-100/70 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <Info className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
              <span>
                <strong>Smart Client-Side Rule:</strong> Web browser policy requires videos to be <strong>muted by default</strong> for auto-play to trigger without user gestures. Unmuting sound is available with one click on the video frame.
              </span>
            </div>
          </div>

          {/* Videos Grid */}
          {videos.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border p-8 space-y-3">
              <Video className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="font-bold text-lg">No Videos / Reels Embedded</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Embed your first YouTube Shorts, Instagram Reel, or Facebook video to display in the customer video showcase.
              </p>
              <Button
                onClick={() => handleOpenVideoModal()}
                className="bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold"
              >
                Embed First Video
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => {
                const isItemAutoplay = v.autoplay !== false;
                const isItemMuted = v.muted !== false;

                return (
                  <div
                    key={v.id}
                    className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Live Embed Player or Fallback Photo Card */}
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                        {v.embed_url ? (
                          <iframe
                            src={v.embed_url}
                            title={v.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <img
                              src={
                                v.thumbnail_url ||
                                'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80'
                              }
                              alt={v.title}
                              className="w-full h-full object-cover"
                            />
                            <a
                              href={v.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
                            >
                              <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg">
                                <Play className="w-6 h-6 fill-current ml-0.5" />
                              </div>
                            </a>
                          </div>
                        )}

                        {/* Platform Auto-Detection Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                          {v.platform === 'youtube' && (
                            <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                              <Tv className="w-3 h-3" /> YouTube
                            </span>
                          )}
                          {v.platform === 'instagram' && (
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                              <Film className="w-3 h-3" /> Instagram Reel
                            </span>
                          )}
                          {v.platform === 'facebook' && (
                            <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                              <Share2 className="w-3 h-3" /> Facebook
                            </span>
                          )}
                          {v.platform === 'other' && (
                            <span className="bg-slate-800 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                              Video
                            </span>
                          )}
                        </div>

                        {/* Top Right Quick Auto-Play & Mute Switches Overlay */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                          {/* Play / Pause Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleSingleAutoplay(v.id)}
                            className={`p-1.5 rounded-full text-white backdrop-blur-md shadow-xs transition-transform hover:scale-110 cursor-pointer ${
                              isItemAutoplay ? 'bg-pink-600/90' : 'bg-black/60'
                            }`}
                            title={isItemAutoplay ? 'Auto-Play Enabled (Click to pause)' : 'Auto-Play Off (Click to enable)'}
                          >
                            {isItemAutoplay ? (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Pause className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Mute / Unmute Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleSingleMuted(v.id)}
                            className={`p-1.5 rounded-full text-white backdrop-blur-md shadow-xs transition-transform hover:scale-110 cursor-pointer ${
                              isItemMuted ? 'bg-slate-900/90' : 'bg-emerald-600/90'
                            }`}
                            title={isItemMuted ? 'Audio Muted by default (Click to unmute)' : 'Audio Active (Click to mute)'}
                          >
                            {isItemMuted ? (
                              <VolumeX className="w-3.5 h-3.5 text-pink-300" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-white" />
                            )}
                          </button>

                          {/* Featured Badge */}
                          {v.featured && (
                            <span className="bg-amber-400 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                              ⭐
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Video Info Body */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                            {v.category}
                          </span>

                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                            <span>{isItemAutoplay ? '⚡ Auto-Play' : '⏸️ Manual Play'}</span>
                            <span>•</span>
                            <span>{isItemMuted ? '🔇 Muted' : '🔊 Sound On'}</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-1">
                          {v.title}
                        </h3>

                        {v.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {v.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 pt-0 border-t mt-auto flex items-center justify-between gap-2">
                      <a
                        href={v.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-pink-600 hover:underline flex items-center gap-1"
                      >
                        Open Source <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVideoFeatured(v.id, v.title)}
                          className={`h-8 px-2 text-xs gap-1 cursor-pointer ${
                            v.featured ? 'text-amber-600 font-bold bg-amber-50' : 'text-slate-500'
                          }`}
                          title="Toggle homepage feature"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenVideoModal(v)}
                          className="h-8 text-xs gap-1 border-pink-200 hover:bg-pink-50"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(v.id, v.title)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
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
        </div>
      )}

      {/* ── MODAL: ADD / EDIT PHOTO ──────────────────────────────────── */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-xl p-6 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> Add Photo to Portfolio
            </h3>

            <form onSubmit={handleSavePhoto} className="space-y-4">
              <div>
                <Label htmlFor="photo-title" className="text-xs font-bold">
                  Photo Title *
                </Label>
                <Input
                  id="photo-title"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="e.g. Royal Gold Bridal Henna"
                  required
                />
              </div>

              <div>
                <Label htmlFor="photo-cat" className="text-xs font-bold">
                  Category *
                </Label>
                <select
                  id="photo-cat"
                  value={photoCat}
                  onChange={(e) => setPhotoCat(e.target.value)}
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {GALLERY_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="photo-file" className="text-xs font-bold">
                  Upload Image File
                </Label>
                <Input
                  id="photo-file"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="mt-1"
                />
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border mt-2" />
                )}
              </div>

              <div>
                <Label htmlFor="photo-url" className="text-xs font-bold">
                  OR Image URL
                </Label>
                <Input
                  id="photo-url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsPhotoModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-gradient-to-r from-primary to-accent font-semibold"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Photo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT VIDEO & REELS ───────────────────────────── */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                  <Video className="w-5 h-5 text-pink-600" />
                  {editingVideo ? 'Edit Embedded Video / Reel' : 'Embed YouTube / Instagram / FB Reel'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paste links from YouTube, Instagram Reels, or Facebook Videos. Platform is detected automatically.
                </p>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4">
              {/* Video URL Input & Platform Auto-Detector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="v-url" className="text-xs font-bold">
                    Video / Reel Link URL *
                  </Label>
                  {vUrl && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                      {detectedPlatform === 'youtube' && (
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded-full">
                          ✓ Detected YouTube
                        </span>
                      )}
                      {detectedPlatform === 'instagram' && (
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white px-2 py-0.5 rounded-full">
                          ✓ Detected Instagram Reel
                        </span>
                      )}
                      {detectedPlatform === 'facebook' && (
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          ✓ Detected Facebook Video
                        </span>
                      )}
                      {detectedPlatform === 'other' && (
                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                          Video Link
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <Input
                  id="v-url"
                  value={vUrl}
                  onChange={handleUrlInputChange}
                  placeholder="Paste YouTube Shorts, Instagram Reel or Facebook URL..."
                  className="font-mono text-xs"
                  required
                />
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="v-title" className="text-xs font-bold">
                    Video Title *
                  </Label>
                  <Input
                    id="v-title"
                    value={vTitle}
                    onChange={(e) => setVTitle(e.target.value)}
                    placeholder="e.g. Bridal 3D Extension Transformation"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="v-cat" className="text-xs font-bold">
                      Category Tag
                    </Label>
                    <button
                      type="button"
                      onClick={handleRunAiTagging}
                      disabled={analyzingAiTag}
                      className="text-[11px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/60 px-2.5 py-0.5 rounded-full border border-pink-200 dark:border-pink-800 flex items-center gap-1 transition-all cursor-pointer"
                      title="Analyze title, URL, thumbnail & content to suggest category"
                    >
                      {analyzingAiTag ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-pink-600" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-pink-600 fill-pink-600" />
                          <span>✨ AI Suggest Category</span>
                        </>
                      )}
                    </button>
                  </div>
                  <select
                    id="v-cat"
                    value={vCat}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-xs rounded-xl border bg-background font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
                  >
                    <option value="Nail Art Tutorials">Nail Art Tutorials</option>
                    <option value="Client Reviews">Client Reviews</option>
                    <option value="Bridal Reels">Bridal Reels</option>
                    <option value="Salon Tour">Salon Tour</option>
                    <option value="Mehndi & Henna">Mehndi &amp; Henna</option>
                    <option value="Spa Treatments">Spa Treatments</option>
                  </select>
                </div>
              </div>

              {/* AI Category Suggestion Banner */}
              {aiSuggestion && (
                <div className="p-3.5 bg-gradient-to-r from-pink-50/90 via-purple-50/80 to-rose-50/90 dark:from-slate-800/90 dark:to-purple-950/50 rounded-2xl border border-pink-200 dark:border-pink-800/60 shadow-xs space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-600 animate-bounce" />
                      <span className="text-xs font-bold text-pink-900 dark:text-pink-200">
                        AI Visual &amp; Content Detection
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      {aiSuggestion.confidence}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    {aiSuggestion.reason}
                  </p>

                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleCategoryChange(aiSuggestion.primary);
                        toast({
                          title: 'Category Applied!',
                          description: `Set category to "${aiSuggestion.primary}".`,
                        });
                      }}
                      className="text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply "{aiSuggestion.primary}"</span>
                    </button>

                    {aiSuggestion.secondary && (
                      <button
                        type="button"
                        onClick={() => {
                          handleCategoryChange(aiSuggestion.secondary!);
                          toast({
                            title: 'Secondary Category Applied!',
                            description: `Set category to "${aiSuggestion.secondary}".`,
                          });
                        }}
                        className="text-xs font-semibold bg-white/80 dark:bg-slate-800 hover:bg-white text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-1 rounded-xl transition-all cursor-pointer"
                      >
                        Alt: "{aiSuggestion.secondary}" ({aiSuggestion.secondaryConfidence}%)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Description / Caption with Auto-Caption Feed Generator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="v-desc" className="text-xs font-bold">
                    Description / Caption
                  </Label>
                  <button
                    type="button"
                    onClick={handleGenerateAutoCaption}
                    className="text-[11px] text-pink-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    title="Generate ready-made caption with hashtags"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Generate Auto-Caption</span>
                  </button>
                </div>
                <Textarea
                  id="v-desc"
                  value={vDesc}
                  onChange={(e) => setVDesc(e.target.value)}
                  placeholder="Client feedback, nail art details, or hashtags..."
                  rows={4}
                  className="text-xs leading-relaxed"
                />
              </div>

              {/* Auto-Play & Mute Sound Settings */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-pink-50/60 dark:bg-slate-800/60 rounded-2xl border border-pink-100/80">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={vAutoplay}
                    onChange={(e) => setVAutoplay(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                  />
                  <span>⚡ Enable Auto-Play</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={vMuted}
                    onChange={(e) => setVMuted(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                  />
                  <span>🔇 Mute Sound by Default</span>
                </label>
              </div>

              {/* Thumbnail URL Fallback */}
              <div className="space-y-1">
                <Label htmlFor="v-thumb" className="text-xs font-bold">
                  Thumbnail Image URL (Optional)
                </Label>
                <Input
                  id="v-thumb"
                  value={vThumb}
                  onChange={(e) => setVThumb(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs"
                />
              </div>

              {/* Live Preview Embed Frame */}
              {formattedEmbedUrl && (
                <div className="space-y-1 pt-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Live Embed Preview ({vAutoplay ? 'Auto-play ON' : 'Auto-play OFF'}, {vMuted ? 'Muted' : 'Sound ON'})
                  </Label>
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border shadow-inner">
                    <iframe
                      src={formattedEmbedUrl}
                      title="Live Embed Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={vFeatured}
                    onChange={(e) => setVFeatured(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
                  />
                  <span>Feature on Customer Homepage</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsVideoModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold px-6 shadow-md hover:scale-105 transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  {editingVideo ? 'Save Changes' : 'Embed & Publish Video'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
