import { create } from 'zustand';
import { Booking, Customer } from '@/types';

interface BookingState {
  bookings: Booking[];
  currentCustomer: Customer | null;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  cancelBooking: (bookingId: string) => void;
  setCurrentCustomer: (customer: Customer) => void;
  getBookingById: (id: string) => Booking | undefined;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  currentCustomer: null,
  
  addBooking: (bookingData) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      bookings: [...state.bookings, newBooking],
    }));
  },
  
  cancelBooking: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ),
    }));
  },
  
  setCurrentCustomer: (customer) => {
    set({ currentCustomer: customer });
  },
  
  getBookingById: (id) => {
    return get().bookings.find((booking) => booking.id === id);
  },
}));
