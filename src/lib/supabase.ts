import { createClient } from '@supabase/supabase-js';
export type { Service, Booking, TimeSlot, WaitlistEntry, StaffMember, CustomerProfile, PaymentRecord, StudioSettings } from '@/types';

export interface User {
  id: string;
  auth_user_id?: string;
  role: 'customer' | 'admin' | 'staff' | 'technician' | 'shop_owner' | 'owner' | 'manager' | 'receptionist';
  full_name: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  loyalty_points?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: 'upi' | 'cash' | 'card' | 'online';
  payment_status: 'pending' | 'completed' | 'verified' | 'failed';
  transaction_id?: string;
  created_at?: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty?: string;
  rating?: number;
  avatar_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-anon-key';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== 'your-project-url-here' &&
  !rawUrl.includes('placeholder')
);

const supabaseUrl = rawUrl || fallbackUrl;
const supabaseAnonKey = rawKey || fallbackKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
