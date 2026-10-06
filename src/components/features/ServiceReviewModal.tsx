import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Upload, CheckCircle2, Loader2, Sparkles, MessageSquare, Image as ImageIcon, X } from 'lucide-react';
import { ServiceReviewItem, ServiceRatingAggregate } from '@/hooks/useServiceReviews';
import { ServiceImage } from './ServiceImage';

interface ServiceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    category?: string;
    image_url?: string;
    price_inr?: number;
  } | null;
  ratingAggregate: ServiceRatingAggregate;
  onSubmitReview: (data: {
    serviceId: string;
    serviceName: string;
    customerName: string;
    customerPhone?: string;
    rating: number;
    reviewText: string;
    photoFile?: File | null;
  }) => Promise<boolean>;
}

export function ServiceReviewModal({
  isOpen,
  onClose,
  service,
  ratingAggregate,
  onSubmitReview,
}: ServiceReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'reviews'>('write');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!service) return null;

  const RATING_LABELS: Record<number, string> = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good Service',
    4: 'Very Good & Professional',
    5: '⭐ Excellent! Highly Recommended',
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) return;

    setIsSubmitting(true);
    const success = await onSubmitReview({
      serviceId: service.id,
      serviceName: service.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      rating,
      reviewText: reviewText.trim(),
      photoFile,
    });
    setIsSubmitting(false);

    if (success) {
      // Reset form
      setRating(5);
      setCustomerName('');
      setCustomerPhone('');
      setReviewText('');
      handleRemovePhoto();
      setActiveTab('reviews');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-pink-100">
        {/* Header with Service Summary */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-50/50 to-white p-6 border-b border-pink-100/80">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border border-pink-100">
              <ServiceImage
                src={service.image_url}
                alt={service.name}
                category={service.category}
                aspectRatio="1:1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded-full">
                  {service.category || 'Beauty Care'}
                </span>
                {service.price_inr && (
                  <span className="text-xs font-semibold text-primary">
                    ₹{service.price_inr}
                  </span>
                )}
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground line-clamp-1">
                {service.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span className="ml-1 text-sm font-bold text-foreground">
                    {ratingAggregate.averageRating}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({ratingAggregate.reviewCount} customer review{ratingAggregate.reviewCount === 1 ? '' : 's'})
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-5 border-t border-pink-100 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'write'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm'
                  : 'bg-white hover:bg-pink-100/60 text-muted-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Write Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm'
                  : 'bg-white hover:bg-pink-100/60 text-muted-foreground'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Recent Reviews ({ratingAggregate.reviews.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'write' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Picker */}
              <div className="space-y-2 text-center p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
                <Label className="text-xs sm:text-sm font-semibold text-foreground">
                  How would you rate this service?
                </Label>
                <div className="flex justify-center items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const activeVal = hoverRating ?? rating;
                    const isFilled = starValue <= activeVal;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 rounded-lg hover:scale-125 transition-transform focus:outline-none"
                        aria-label={`Rate ${starValue} stars`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-500 filter drop-shadow-sm'
                              : 'text-muted-foreground/30 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-primary tracking-wide">
                  {RATING_LABELS[hoverRating ?? rating]}
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="review-name" className="text-xs font-medium text-foreground">
                    Your Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="review-name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="rounded-xl border-pink-100 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="review-phone" className="text-xs font-medium text-foreground">
                    WhatsApp Phone (Optional)
                  </Label>
                  <Input
                    id="review-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="rounded-xl border-pink-100 bg-white"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <Label htmlFor="review-text" className="text-xs font-medium text-foreground">
                  Your Experience &amp; Feedback <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="review-text"
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your experience (nail durability, artist care, hygiene, finish)..."
                  className="rounded-xl border-pink-100 bg-white resize-none text-sm"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Attach Photo (Optional)
                </Label>
                {photoPreview ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-pink-200 group">
                    <img
                      src={photoPreview}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border border-dashed border-pink-200 rounded-xl p-3.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-pink-50/50 transition-colors bg-white">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Upload nail or beauty result photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isSubmitting || !customerName.trim() || !reviewText.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold h-11 rounded-xl shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-1.5 fill-current" />
                    Submit Review for {service.name}
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Reviews List Tab */
            <div className="space-y-4">
              {ratingAggregate.reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-pink-300" />
                  <p className="text-sm font-semibold text-foreground">No custom reviews yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Be the first client to leave a review for {service.name}!
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('write')}
                    className="bg-primary text-white text-xs"
                  >
                    Write First Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {ratingAggregate.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl border border-pink-100 bg-pink-50/20 space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                            {rev.customer_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-foreground block leading-tight">
                              {rev.customer_name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(rev.created_at).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {rev.review_text}
                      </p>

                      {rev.photo_url && (
                        <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-pink-100">
                          <img
                            src={rev.photo_url}
                            alt="Customer service result"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ServiceReviewModal;
