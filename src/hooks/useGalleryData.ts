import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GALLERY_ITEMS, type GalleryItem } from '@/constants/galleryItems';
import { mergeGalleryItems, type RemoteGalleryImage } from '@/lib/gallery';

/**
 * useGalleryData — "initializeGallery".
 *
 * Owns the one side effect the gallery has: fetching staff uploads from
 * Supabase and merging them with the curated portfolio. Kept out of the page
 * component so the UI stays presentational and this logic is testable on its
 * own.
 *
 * Failure is never fatal: if the request errors the curated items still
 * render, so the gallery is never empty because the network was.
 */
export interface GalleryData {
  items: GalleryItem[];
  loading: boolean;
  /** True when staff uploads could not be fetched; the grid still renders. */
  failed: boolean;
  refresh: () => void;
}

export function useGalleryData(): GalleryData {
  const [remoteImages, setRemoteImages] = useState<RemoteGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    // Guards against a late response updating state after unmount.
    let cancelled = false;

    async function initializeGallery() {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (cancelled) return;

        setRemoteImages(data || []);
        setFailed(false);
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching gallery:', error);
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initializeGallery();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  // Staff uploads first, curated portfolio after.
  const items = useMemo(
    () => mergeGalleryItems(remoteImages, GALLERY_ITEMS),
    [remoteImages],
  );

  return { items, loading, failed, refresh };
}

export default useGalleryData;
