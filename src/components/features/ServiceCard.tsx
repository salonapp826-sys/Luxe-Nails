import { Service } from '@/types';
import { Clock, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ServiceImage } from '@/components/features/ServiceImage';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const navigate = useNavigate();

  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:shadow-lifted transition-all duration-300 flex flex-col justify-between">
      <div>
        <ServiceImage
          src={service.image}
          alt={service.name}
          category={service.category}
          serviceTitle={service.name}
          aspectRatio="16:9"
        >
          {service.popular && (
            <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-soft">
              <Star className="w-3 h-3 fill-current" />
              Popular
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-semibold text-lg mb-0.5 line-clamp-1 drop-shadow-sm">{service.name}</h3>
          </div>
        </ServiceImage>

        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {service.description}
          </p>

          <div className="flex items-center justify-between gap-2 mb-4 text-sm">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
              <Clock className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span>Est. Time: {service.duration} mins</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-primary text-base">
              <span>₹{service.price}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(`/service/${service.id}`)}
        >
          View Details
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-primary to-accent"
          onClick={() => navigate(`/book?service=${service.id}`)}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}
