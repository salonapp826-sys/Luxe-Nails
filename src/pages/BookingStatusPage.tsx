import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Booking, Payment } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';

export function BookingStatusPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingData.id)
        .single();

      if (paymentError) throw paymentError;
      setPayment(paymentData);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (booking.booking_status) {
      case 'confirmed':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (booking.booking_status) {
      case 'confirmed':
        return 'Booking Confirmed';
      case 'cancelled':
        return 'Booking Cancelled';
      default:
        return 'Pending Verification';
    }
  };

  const getStatusMessage = () => {
    switch (booking.booking_status) {
      case 'confirmed':
        return 'Your booking has been confirmed! We look forward to serving you.';
      case 'cancelled':
        return 'This booking has been cancelled.';
      default:
        return 'Your payment is being verified by our team. You will receive a WhatsApp confirmation soon.';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="glass-card p-8 rounded-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h1 className="text-3xl font-bold mb-2">{getStatusText()}</h1>
            <p className="text-muted-foreground">{getStatusMessage()}</p>
          </div>

          <div className="bg-gradient-gold p-6 rounded-lg mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
              <p className="text-2xl font-bold text-primary">{booking.booking_id}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-semibold">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Service</span>
                <span className="font-semibold">{booking.service_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Visit Type</span>
                <span className="font-semibold capitalize">{booking.visit_type}</span>
              </div>
              {booking.visit_type === 'home' && (
                <>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-semibold text-right max-w-[60%]">{booking.address}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-semibold">{booking.distance_km} km</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Home Service Charge</span>
                    <span className="font-semibold">{formatINR(booking.home_service_charge)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Date</span>
                <span className="font-semibold">
                  {new Date(booking.appointment_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold">{booking.appointment_time}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold">{formatINR(booking.total_price)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Advance Paid</span>
                <span className="font-semibold">{formatINR(booking.advance_amount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Remaining</span>
                <span className="font-semibold">{formatINR(booking.remaining_amount)}</span>
              </div>
            </div>
          </div>

          {payment && (
            <div className="bg-secondary/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono font-semibold">{payment.upi_transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-semibold capitalize ${
                    payment.payment_status === 'verified' ? 'text-green-600' :
                    payment.payment_status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {payment.payment_status}
                  </span>
                </div>
                {payment.rejection_reason && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-red-700">
                    <strong>Rejection Reason:</strong> {payment.rejection_reason}
                  </div>
                )}
              </div>
            </div>
          )}

          {booking.booking_status === 'confirmed' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm text-green-700">
              <p>✅ Please arrive 5 minutes early for your appointment</p>
              <p className="mt-1">📞 For any queries, contact us on WhatsApp: {booking.customer_phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
