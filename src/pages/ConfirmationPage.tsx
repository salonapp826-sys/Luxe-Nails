import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '@/stores/bookingStore';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, Mail } from 'lucide-react';

export function ConfirmationPage() {
  const navigate = useNavigate();
  const bookings = useBookingStore(state => state.bookings);
  
  const latestBooking = bookings[bookings.length - 1];

  useEffect(() => {
    if (!latestBooking) {
      navigate('/');
    }
  }, [latestBooking, navigate]);

  if (!latestBooking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-rose rounded-full mb-4 shadow-lifted">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            We're excited to pamper you
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4 mb-6">
          <div className="bg-gradient-gold p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
            <p className="text-xl font-bold text-primary">{latestBooking.id}</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-semibold">{latestBooking.serviceName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold">
                  {new Date(latestBooking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="font-semibold">{latestBooking.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmation Email</p>
                <p className="font-semibold">{latestBooking.customerEmail}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Amount Paid</span>
              <span className="text-2xl font-bold text-primary">${latestBooking.price}</span>
            </div>
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg mb-6 text-sm">
          <p className="text-muted-foreground">
            📧 A confirmation email has been sent to <strong>{latestBooking.customerEmail}</strong>
          </p>
          <p className="text-muted-foreground mt-2">
            💡 Please arrive 5 minutes early for your appointment
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/bookings')}
          >
            View My Bookings
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-accent"
            onClick={() => navigate('/')}
          >
            Book Another
          </Button>
        </div>
      </div>
    </div>
  );
}
