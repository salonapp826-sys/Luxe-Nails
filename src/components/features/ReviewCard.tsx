import { Star } from 'lucide-react';

interface ReviewCardProps {
  customerName: string;
  serviceName?: string;
  rating: number;
  reviewText: string;
  photoUrl?: string;
  createdAt: string;
  className?: string;
}

export function ReviewCard({
  customerName,
  serviceName,
  rating,
  reviewText,
  photoUrl,
  createdAt,
  className = '',
}: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`glass-card p-7 rounded-3xl border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl ${className}`}>
      <div className="flex items-start gap-4 h-full">
        {/* Customer Photo or Avatar */}
        <div className="flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${customerName}'s review`}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
              {customerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">{customerName}</h3>
              {serviceName && (
                <p className="text-xs text-muted-foreground">{serviceName}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(createdAt)}
            </span>
          </div>

          {/* Star Rating */}
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Review Text */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {reviewText}
          </p>
        </div>
      </div>
    </div>
  );
}
