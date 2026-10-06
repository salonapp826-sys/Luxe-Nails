import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Service } from '@/lib/supabase';
import { formatINR } from '@/lib/homeServiceCharges';
import {
  Search,
  X,
  Check,
  Timer,
  Sparkles,
  Home,
  CheckSquare2,
  Square,
  IndianRupee,
} from 'lucide-react';

interface ServiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  selectedServices: Service[];
  onToggleService: (service: Service) => void;
  onClearAll: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'basic', label: 'Basic Nails' },
  { id: 'premium', label: 'Premium Nails' },
  { id: 'art', label: 'Nail Art' },
  { id: 'mehndi', label: 'Mehndi' },
  { id: 'beauty', label: 'Beauty Parlour' },
];

export function ServiceSelectorModal({
  isOpen,
  onClose,
  services,
  selectedServices,
  onToggleService,
  onClearAll,
}: ServiceSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const selectedIds = useMemo(
    () => new Set(selectedServices.map((s) => s.id)),
    [selectedServices]
  );

  const totalSelectedPrice = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price_inr, 0),
    [selectedServices]
  );

  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0),
    [selectedServices]
  );

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        activeCategory === 'all' || service.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        (service.description &&
          service.description.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [services, activeCategory, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-3xl border-pink-100 overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-pink-50/80 via-rose-50/40 to-white border-b border-pink-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Select Salon &amp; Beauty Services
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Multi-select as many services as you want. Prices and durations will automatically calculate.
          </DialogDescription>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. Manicure, Gel, Facial, Mehndi)..."
              className="pl-10 pr-9 py-2 rounded-xl border-pink-200/80 bg-white text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white/80 hover:bg-pink-100/60 text-muted-foreground border border-pink-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services List with Checkboxes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 max-h-[48vh]">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-2 text-pink-300" />
              <p className="font-semibold text-foreground text-sm">No services found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for another keyword or switch category
              </p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const isSelected = selectedIds.has(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => onToggleService(service)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      onToggleService(service);
                    }
                  }}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 text-left ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-pink-100/80 bg-white hover:border-primary/40 hover:bg-pink-50/20'
                  }`}
                >
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-muted-foreground/30 hover:border-primary/60 transition-colors" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground leading-tight">
                          {service.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-pink-700 bg-pink-100/70 px-2 py-0.5 rounded-full">
                          {service.category}
                        </span>
                        {service.is_premium && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-full">
                            Premium
                          </span>
                        )}
                        {service.home_service_allowed && (
                          <span className="text-[10px] text-green-700 bg-green-50 border border-green-200/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Home className="w-2.5 h-2.5" /> Home
                          </span>
                        )}
                      </div>

                      {service.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {service.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                        <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 font-semibold px-2 py-0.5 rounded-md text-[11px] border border-pink-100">
                          <Timer className="w-3 h-3 text-pink-600" />
                          Est. Time: {formatDuration(service.duration_minutes)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Selection Status */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base text-primary">
                      {formatINR(service.price_inr)}
                    </p>
                    <span
                      className={`text-[11px] font-medium block mt-0.5 ${
                        isSelected ? 'text-primary font-semibold' : 'text-muted-foreground/70'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Click to add'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer Toolbar */}
        <div className="p-4 sm:p-5 bg-white border-t border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground text-sm">
                  {selectedServices.length}
                </span>{' '}
                service{selectedServices.length === 1 ? '' : 's'} selected
                {selectedServices.length > 0 && ` (${formatDuration(totalDuration)})`}
              </p>
              <p className="text-base sm:text-lg font-bold text-primary">
                Total: {formatINR(totalSelectedPrice)}
              </p>
            </div>

            {selectedServices.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5"
              >
                Clear All
              </Button>
            )}
          </div>

          <Button
            type="button"
            onClick={onClose}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold h-11 px-6 rounded-xl shadow-md"
          >
            {selectedServices.length > 0
              ? `Confirm Selection (${selectedServices.length})`
              : 'Done'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ServiceSelectorModal;
