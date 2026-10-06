import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '@/stores/bookingStore';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, XCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BookingsListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { bookings, cancelBooking } = useBookingStore();

  const handleCancelBooking = (bookingId: string, serviceName: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(bookingId);
      toast({
        title: 'Booking Cancelled',
        description: `Your appointment for ${serviceName} has been cancelled`,
        variant: 'destructive',
      });
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'cancelled' || b.status === 'completed');

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

          {bookings.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Bookings Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't made any appointments yet. Book your first service today!
              </p>
              <Button
                onClick={() => navigate('/book')}
                className="bg-gradient-to-r from-primary to-accent"
              >
                Browse Services
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Upcoming Appointments
                  </h2>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="glass-card p-6 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{booking.serviceName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {booking.time}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="inline-flex items-center gap-1 text-primary font-bold text-xl">
                              <DollarSign className="w-5 h-5" />
                              {booking.price}
                            </div>
                          </div>
                        </div>

                        <div className="bg-secondary/50 p-3 rounded-lg mb-4 text-sm">
                          <p className="text-muted-foreground">
                            <strong>Booking ID:</strong> {booking.id}
                          </p>
                          <p className="text-muted-foreground">
                            <strong>Customer:</strong> {booking.customerName}
                          </p>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id, booking.serviceName)}
                          className="w-full sm:w-auto gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Booking
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                    Past Appointments
                  </h2>
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <div key={booking.id} className="glass-card p-6 rounded-2xl opacity-75">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">{booking.serviceName}</h3>
                              {booking.status === 'cancelled' && (
                                <span className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-full font-medium">
                                  ❌ Cancelled
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Booking ID: {booking.id}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="inline-flex items-center gap-1 text-muted-foreground font-semibold">
                              <DollarSign className="w-4 h-4" />
                              {booking.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
