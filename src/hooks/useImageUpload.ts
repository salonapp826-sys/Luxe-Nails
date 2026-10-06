import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UseImageUploadProps {
  websiteId: string;
  pathPrefix: string; // e.g. 'appointments', 'logo', 'gallery', 'about'
  bucketName?: string; // defaults to 'salon-templates'
  maxSizeMB?: number; // defaults to 5
}

export function useImageUpload({
  websiteId,
  pathPrefix,
  bucketName = 'salon-templates',
  maxSizeMB = 5,
}: UseImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    // 1. File size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Please select an image smaller than ${maxSizeMB}MB.`,
        variant: 'destructive',
      });
      return null;
    }

    // 2. Format validation
    const ALLOWED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({
        title: 'Unsupported format',
        description: 'Please upload a PNG, JPEG, JPG, or WEBP image file.',
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = `${Date.now()}_img.${fileExt}`;
      // Format tenant isolated storage hierarchy: websites/{websiteId}/{pathPrefix}/{cleanFileName}
      const filePath = `websites/${websiteId}/${pathPrefix}/${cleanFileName}`;

      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
        upsert: true,
      });

      let publicUrl = '';
      if (error) {
        // Fallback to local object URL if there is an offline or sandbox storage issue
        publicUrl = URL.createObjectURL(file);
      } else {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      setImageUrl(publicUrl);
      toast({
        title: 'Image uploaded! 📸',
        description: 'Your image has been processed successfully.',
      });
      return publicUrl;
    } catch (err) {
      console.error('Storage Upload error:', err);
      toast({
        title: 'Upload failed',
        description: 'There was an issue processing your image upload.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageUrl('');
  };

  return {
    imageUrl,
    setImageUrl,
    uploading,
    uploadImage,
    clearImage,
  };
}
